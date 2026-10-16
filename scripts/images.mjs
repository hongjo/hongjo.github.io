import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
export async function prepareImages(out){
 const map=new Map();let before=0,after=0;
 function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
 const cache='.optimized';fs.mkdirSync(cache,{recursive:true});fs.mkdirSync(path.join(out,'media'),{recursive:true});
 for(const source of ['img','AI_generated_images'].filter(dir=>fs.existsSync(dir)).flatMap(walk)){
  if(!/\.(png|jpe?g|webp)$/i.test(source))continue;
  const bytes=fs.readFileSync(source),meta=await sharp(bytes).metadata();
  const hash=crypto.createHash('sha256').update(bytes).digest('hex').slice(0,16);const variants=[];
  for(const width of [...new Set([Math.min(480,meta.width),Math.min(960,meta.width),Math.min(1600,meta.width)])]){
   const filename=`${hash}-${width}.webp`,cached=path.join(cache,filename);
   if(!fs.existsSync(cached))await sharp(bytes).rotate().resize({width,withoutEnlargement:true}).webp({quality:82,effort:5}).toFile(cached);
   fs.copyFileSync(cached,path.join(out,'media',filename));const info=await sharp(cached).metadata();variants.push({src:'/media/'+filename,width:info.width,height:info.height,bytes:fs.statSync(cached).size});
  }
  const defaultImage=variants[Math.min(1,variants.length-1)];map.set('/'+source.split(path.sep).join('/'),{variants,defaultImage,originalBytes:bytes.length});before+=bytes.length;after+=defaultImage.bytes;
 }
 console.log(`Image originals: ${before} bytes; default web images: ${after} bytes`);return map;
}
export function optimizeHtml(html,map,basePath=''){return html.replace(/<img\b[^>]*>/gi,tag=>{
 const src=tag.match(/\bsrc="([^"]+)"/)?.[1];if(!src)return tag;let key=decodeURI(src.startsWith('/')?src:'/'+src);if(basePath&&key.startsWith(basePath+'/'))key=key.slice(basePath.length);const m=map.get(key);if(!m)return tag;
 const portrait=/member\/|author-photo|faculty-photo/.test(src+tag),chosen=portrait?m.variants[0]:m.defaultImage;
 const eager=/loading="eager"/.test(tag);
 const wide=eager||/vision-image|wide-image|about-image/.test(tag);
 let result=tag.replace(/\bsrc="[^"]*"/,`src="${basePath+chosen.src}"`).replace(/\s(?:width|height|loading|decoding|srcset|sizes)="[^"]*"/g,'');
 result=result.replace(/>$/,` width="${chosen.width}" height="${chosen.height}" loading="${eager?'eager':'lazy'}" decoding="async" srcset="${m.variants.map(v=>basePath+v.src+' '+v.width+'w').join(', ')}" sizes="${wide?'100vw':portrait?'(max-width: 650px) 85vw, 320px':'(max-width: 650px) 100vw, (max-width: 1200px) 80vw, 850px'}" data-original="${src.startsWith('/')?src:'/'+src}">`);
 return result;
});}
