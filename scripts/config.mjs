import path from 'node:path';

export const root = process.cwd();
export const out = path.join(root, '_site');
export const basePath = (process.env.BASE_PATH ?? (process.env.SITE_URL ? '' : '/_site')).replace(/\/$/, '');
if (basePath && !/^(\/[a-zA-Z0-9._-]+)+$/.test(basePath)) {
  throw new Error('BASE_PATH must be a leading-slash repository path without a trailing slash.');
}
export const siteOrigin = (process.env.SITE_URL || 'http://127.0.0.1:5500').replace(/\/$/, '');
if (!/^https?:\/\/[^/]+$/.test(siteOrigin)) throw new Error('SITE_URL must be an http(s) origin without a path.');
export const preview = process.env.PREVIEW === 'true' || !process.env.SITE_URL;
export const localPath = value => basePath + '/' + String(value || '').replace(/^\/+/, '');
export const asset = value => encodeURI(localPath(value));
export const url = (language, route = '') => localPath((language === 'ko' ? 'ko/' : '') + (route ? route.replace(/^\/+|\/+$/g, '') + '/' : ''));
export const absolute = (language, route = '') => siteOrigin + url(language, route);

// All authored content remains rooted at the production site's original paths.
export function rewriteContentUrls(html) {
  return html.replace(/\b(href|src)="([^"]*)"/g, (whole, attribute, value) => {
    let target = value;
    if (/^https:\/\/hongjo\.github\.io(?:\/|$)/i.test(target)) target = target.replace(/^https:\/\/hongjo\.github\.io/i, '') || '/';
    if (target.startsWith('/') && !target.startsWith('//')) {
      if (!basePath || !(target === basePath || target.startsWith(basePath + '/'))) target = basePath + target;
      return `${attribute}="${encodeURI(decodeURI(target))}"`;
    }
    if (/^\/?img\//.test(target)) return `${attribute}="${asset(target)}"`;
    return whole;
  });
}
