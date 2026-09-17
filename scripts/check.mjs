import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('_site');
const files=[];function walk(p){for(const e of fs.readdirSync(p,{withFileTypes:true})){const f=path.join(p,e.name);e.isDirectory()?walk(f):files.push(f)}}walk(root);
const errors=[];const pages=files.filter(f=>f.endsWith('.html'));
for(const f of pages){const html=fs.readFileSync(f,'utf8'),name=path.relative(root,f);
 if((html.match(/<h1[ >]/g)||[]).length!==1)errors.push(`${name}: expected one h1`);
 if(!html.includes('rel="canonical"'))errors.push(`${name}: missing canonical`);
 for(const m of html.matchAll(/(?:src|href)="([^"#]*)/g)){const ref=m[1];if(!ref||/^(https?:|mailto:|data:|tel:)/.test(ref))continue;let target=path.resolve(ref.startsWith('/')?root:path.dirname(f),'.'+(ref.startsWith('/')?ref:'/'+ref));try{target=decodeURIComponent(target.split('?')[0]);}catch{}if(!fs.existsSync(target))errors.push(`${name}: missing ${ref}`);}
 for(const m of html.matchAll(/<img\b[^>]*>/g)){if(!/\balt=/.test(m[0]))errors.push(`${name}: image missing alt`);if(m[0].includes('/media/')&&!/\bsrcset=/.test(m[0]))errors.push(`${name}: missing responsive image`);}
}
for(const l of ['en','ko']){const p=l==='ko'?'ko/':'';const pub=fs.readFileSync(`${root}/${p}publications/index.html`,'utf8');const n=(pub.match(/data-publication /g)||[]).length;if(n!==128)errors.push(`${l}: expected 128 publications, found ${n}`);const members=JSON.parse(fs.readFileSync(`data/${l}/members.json`));if(members.categories.reduce((s,c)=>s+c.members.length,0)!==36)errors.push(`${l}: roster count`);const teaching=JSON.parse(fs.readFileSync(`data/${l}/teaching.json`));if(teaching.semesters[0].courses.length!==2)errors.push(`${l}: current course count`);}
if(errors.length){console.error([...new Set(errors)].join('\n'));process.exit(1)}console.log(`Checked ${pages.length} pages: local links, images, metadata, 128 publications, 36 members and two current courses per language.`);
