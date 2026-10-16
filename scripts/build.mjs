import fs from 'node:fs';
import path from 'node:path';
import { prepareImages, optimizeHtml } from './images.mjs';
import { allPages, esc, words, hasTranslation, header, footer } from './render.mjs';
import { root, out, basePath, siteOrigin, preview, asset, absolute, rewriteContentUrls } from './config.mjs';

if (path.dirname(out) !== root || path.basename(out) !== '_site') throw new Error('Refusing to clean a directory outside the build output.');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
fs.cpSync('img', path.join(out, 'img'), { recursive: true });
fs.cpSync('AI_generated_images', path.join(out, 'AI_generated_images'), { recursive: true });
fs.mkdirSync(path.join(out, 'assets'), { recursive: true });
fs.cpSync('assets/story', path.join(out, 'assets/story'), { recursive: true });
fs.copyFileSync('assets/lab.css', path.join(out, 'assets/lab.css'));
fs.copyFileSync('assets/site.js', path.join(out, 'assets/site.js'));
fs.writeFileSync(path.join(out, '.nojekyll'), '');
const imageMap = await prepareImages(out);
const template = fs.readFileSync('templates/page.html', 'utf8');
const pages = allPages();
for (const page of pages) {
  const { language, route, title, body } = page;
  const w = words(language);
  const description = page.description || `${title} — Smart Infrastructure Lab, Yonsei University`;
  const values = {
    language, basePath, route,
    title: esc(title === 'Smart Infrastructure Lab' ? 'Smart Infrastructure Lab | Yonsei University' : title + ' | Smart Infrastructure Lab'),
    description: esc(description),
    favicon: asset('assets/favicon.svg'),
    storyCss: asset('assets/story/css/main.css'), labCss: asset('assets/lab.css'), siteJs: asset('assets/site.js'),
    canonical: absolute(language, route),
    alternates: ['en', 'ko'].filter(lang => hasTranslation(lang, route)).map(lang => `<link rel="alternate" hreflang="${lang}" href="${absolute(lang, route)}">`).join('\n  '),
    ogType: route.startsWith('blog/') ? 'article' : 'website',
    ogImage: siteOrigin + asset('AI_generated_images/1번.png'),
    robots: preview ? '<meta name="robots" content="noindex, nofollow">' : '',
    body: rewriteContentUrls(body), header: header(language, route), footer: rewriteContentUrls(footer(language)),
  };
  let html = template.replace(/\{\{(\w+)\}\}/g, (_, key) => values[key] ?? '');
  html = html.replace(/\son\w+="[^"]*"/gi, '').replace(/href="javascript:[^"]*"/gi, 'href="#"');
  let tableNumber = 0;
  html = html.replace(/<table>/g, () => `<div class="table-scroll" role="region" tabindex="0" aria-label="${esc(w.table)} (${++tableNumber})"><table>`).replace(/<\/table>/g, '</table></div>');
  html = optimizeHtml(html, imageMap, basePath);
  const relative = (language === 'ko' ? 'ko/' : '') + (route ? route + '/' : '');
  const destination = path.join(out, relative, 'index.html');
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, html);
}
fs.copyFileSync('assets/favicon.svg', path.join(out, 'assets/favicon.svg'));
const counts = Object.fromEntries(['en', 'ko'].map(language => {
  const read = name => JSON.parse(fs.readFileSync(`data/${language}/${name}.json`, 'utf8'));
  const albums = read('album').albums;
  return [language, {
    members: read('members').categories.reduce((sum, category) => sum + category.members.length, 0),
    projects: read('projects').projects.length, blog: read('blog').posts.length,
    albums: albums.length, photos: albums.reduce((sum, album) => sum + album.images.length, 0),
    semesters: read('teaching').semesters.length,
  }];
}));
fs.writeFileSync(path.join(out, 'sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + pages.map(page => `<url><loc>${absolute(page.language, page.route)}</loc></url>`).join('') + '</urlset>');
fs.writeFileSync(path.join(out, 'robots.txt'), preview ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\nSitemap: ${siteOrigin}${basePath}/sitemap.xml\n`);
fs.writeFileSync(path.join(out, 'build-info.json'), JSON.stringify({ source: process.env.GITHUB_SHA || 'local', upstream: 'ade15b27f34fddc9aa74469a745ac48f4c8bc2fc', routes: pages.length, basePath, siteOrigin, counts }));
console.log(`Built ${pages.length} pages for ${siteOrigin}${basePath}/`);
console.log(counts);
