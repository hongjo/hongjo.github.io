import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve('_site');
const info = JSON.parse(fs.readFileSync(path.join(root, 'build-info.json'), 'utf8'));
const baseline = JSON.parse(fs.readFileSync('scripts/content-baseline.json', 'utf8'));
const amendments = JSON.parse(fs.readFileSync('scripts/content-amendments.json', 'utf8'));
const preserve = process.argv.includes('--preserve');
const errors = [];
const files = [];
function walk(directory) { for (const entry of fs.readdirSync(directory, { withFileTypes: true })) { const file = path.join(directory, entry.name); entry.isDirectory() ? walk(file) : files.push(file); } }
walk(root);
const pages = files.filter(file => file.endsWith('.html'));
const decode = value => value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const relative = file => path.relative(root, file).split(path.sep).join('/');
const htmlByPath = new Map(pages.map(file => [relative(file), fs.readFileSync(file, 'utf8')]));
for (const [file, hash] of Object.entries(preserve ? { ...baseline.files, ...baseline.providedArtwork } : {})) {
  const amendment = amendments[file];
  if (amendment && amendment.originalSha256 !== hash) errors.push(`Amendment baseline mismatch: ${file}`);
  if (!fs.existsSync(file)) errors.push(`Original content missing: ${file}`);
  else {
    const bytes = /\.(?:json|md|txt)$/.test(file) ? fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n') : fs.readFileSync(file);
    if (crypto.createHash('sha256').update(bytes).digest('hex') !== (amendment?.sha256 || hash)) errors.push(`Original content changed without a recorded update: ${file}`);
  }
}
function checkReference(reference, currentFile, checkFragment = true) {
  let ref = decode(reference);
  if (!ref || /^(mailto:|tel:|data:|https?:|\/\/)/.test(ref)) return;
  let [pathname, fragment] = ref.split('#'); pathname = pathname.split('?')[0];
  if (pathname.startsWith('/')) {
    if (info.basePath && !pathname.startsWith(info.basePath + '/')) { errors.push(`${relative(currentFile)}: unprefixed ${ref}`); return; }
    pathname = pathname.slice(info.basePath.length);
  }
  let target = pathname ? path.resolve(pathname.startsWith('/') ? root : path.dirname(currentFile), '.' + (pathname.startsWith('/') ? pathname : '/' + pathname)) : currentFile;
  try { target = decodeURIComponent(target); } catch { errors.push(`${relative(currentFile)}: invalid URL ${ref}`); return; }
  if (target !== root && !target.startsWith(root + path.sep)) { errors.push(`${relative(currentFile)}: path escapes site ${ref}`); return; }
  if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, 'index.html');
  if (!fs.existsSync(target)) { errors.push(`${relative(currentFile)}: missing ${ref}`); return; }
  if (checkFragment && fragment && target.endsWith('.html')) {
    const html = htmlByPath.get(relative(target)) || fs.readFileSync(target, 'utf8');
    let id; try { id = decodeURIComponent(fragment); } catch { id = fragment; }
    if (!html.includes(`id="${id}"`) && !html.includes(`name="${id}"`)) errors.push(`${relative(currentFile)}: missing anchor ${ref}`);
  }
}
for (const file of pages) {
  const html = htmlByPath.get(relative(file)), name = relative(file);
  if ((html.match(/<h1(?:\s|>)/g) || []).length !== 1) errors.push(`${name}: expected one h1`);
  if (!html.includes('rel="canonical"') || !html.includes('hreflang="en"') || !html.includes('hreflang="ko"')) errors.push(`${name}: missing canonical/language metadata`);
  const canonical = html.match(/rel="canonical" href="([^"]+)"/)?.[1];
  if (!canonical?.startsWith(info.siteOrigin + info.basePath + '/')) errors.push(`${name}: incorrect canonical`);
  if (/<h1>\s*(?:undefined|null|\[object Object\])/.test(html) || /\{\{\w+\}\}/.test(html)) errors.push(`${name}: unresolved content`);
  const ids = [...html.matchAll(/(?<![\w-])id="([^"]+)"/g)].map(match => match[1]);
  if (new Set(ids).size !== ids.length) errors.push(`${name}: duplicate IDs`);
  for (const match of html.matchAll(/\b(?:href|src|data-original)="([^"]+)"/g)) checkReference(match[1], file);
  for (const match of html.matchAll(/\bsrcset="([^"]+)"/g)) for (const candidate of match[1].split(',')) checkReference(candidate.trim().split(/\s+/)[0], file, false);
  for (const match of html.matchAll(/<img\b[^>]*>/g)) {
    if (!/\balt=/.test(match[0])) errors.push(`${name}: image missing alt`);
    if (match[0].includes('/media/') && (!/\bsrcset=/.test(match[0]) || !/\bwidth=/.test(match[0]) || !/\bheight=/.test(match[0]))) errors.push(`${name}: image missing responsive dimensions`);
  }
  if (name.includes('publications/') && /data-type="selected"|Selected ★|data-selected=/.test(html)) errors.push(`${name}: excluded selected functionality`);
}
const read = (language, name) => JSON.parse(fs.readFileSync(`data/${language}/${name}.json`, 'utf8'));
const requiredRoutes = [];
for (const language of ['en', 'ko']) {
  const prefix = language === 'ko' ? 'ko/' : '';
  for (const route of ['', 'about', 'news', 'faculty', 'members', 'publications', 'projects', 'teaching', 'blog', 'album', 'join']) requiredRoutes.push(prefix + (route ? route + '/' : '') + 'index.html');
  for (const post of read(language, 'blog').posts) requiredRoutes.push(prefix + 'blog/' + post.slug + '/index.html');
  const pub = htmlByPath.get(prefix + 'publications/index.html') || '';
  const expectedPublications = Object.values(read('ko', 'publications')).reduce((sum, records) => sum + records.length, 0);
  if ((pub.match(/\bdata-publication /g) || []).length !== expectedPublications) errors.push(`${language}: expected ${expectedPublications} publication records`);
  const members = htmlByPath.get(prefix + 'members/index.html') || '';
  const categories = read(language, 'members').categories;
  const expectedMembers = categories.reduce((sum, category) => sum + category.members.length, 0);
  const expectedProfiles = categories.filter(category => !['행정 담당', 'Administrative Staff'].includes(category.title)).reduce((sum, category) => sum + category.members.length, 0);
  if ((members.match(/\bdata-member>/g) || []).length !== expectedMembers || (members.match(/class="member-details"/g) || []).length !== expectedProfiles) errors.push(`${language}: missing people or profiles`);
  if (((htmlByPath.get(prefix + 'projects/index.html') || '').match(/data-project>/g) || []).length !== read(language, 'projects').projects.length) errors.push(`${language}: project count`);
  if (((htmlByPath.get(prefix + 'teaching/index.html') || '').match(/data-course>/g) || []).length !== read(language, 'teaching').semesters.reduce((sum, semester) => sum + semester.courses.length, 0)) errors.push(`${language}: course count`);
  if (((htmlByPath.get(prefix + 'album/index.html') || '').match(/<figure>/g) || []).length !== read(language, 'album').albums.reduce((sum, album) => sum + album.images.length, 0)) errors.push(`${language}: album photo count`);
  const main = htmlByPath.get(prefix + 'index.html') || '';
  if (!/<img[^>]+loading="eager"[^>]*fetchpriority="high"|<img[^>]+fetchpriority="high"[^>]*loading="eager"/.test(main)) errors.push(`${language}: hero should load eagerly`);
  const admissions = read(language, 'admissions');
  const join = htmlByPath.get(prefix + 'join/index.html') || '';
  for (const key of ['masters_text', 'phd_text', 'program_text', 'letter_text', 'date']) {
    const value = admissions[key].replace(/[&<>"']/g, char => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[char]));
    if (!join.includes(value)) errors.push(`${language}: missing admissions text ${key}`);
  }
}
if (pages.length !== requiredRoutes.length || info.routes !== requiredRoutes.length) errors.push(`Expected ${requiredRoutes.length} pages; found ${pages.length}`);
for (const route of requiredRoutes) if (!htmlByPath.has(route)) errors.push(`Missing original route: ${route}`);
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
if ((sitemap.match(/<loc>/g) || []).length !== requiredRoutes.length) errors.push('Sitemap page count differs from source data');
if (errors.length) { console.error([...new Set(errors)].join('\n')); process.exit(1); }
console.log(`PASS: ${pages.length} routes; source-derived publication, member, project, course and photo counts; links, anchors, responsive images and metadata.${preserve ? ` Verified ${Object.keys(baseline.files).length} original source files and ${Object.keys(baseline.providedArtwork || {}).length} user-supplied artwork files; ${Object.keys(amendments).length} authorized updates.` : ''}`);
