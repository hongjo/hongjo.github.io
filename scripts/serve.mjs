import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('_site');
const info = JSON.parse(fs.readFileSync(path.join(root, 'build-info.json'), 'utf8'));
const prefix = info.basePath || '';
const port = Number(process.env.PORT || 4173);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.woff': 'font/woff', '.woff2': 'font/woff2' };
http.createServer((request, response) => {
  const requestUrl = new URL(request.url, 'http://localhost');
  if (prefix && requestUrl.pathname === '/') { response.writeHead(302, { Location: prefix + '/' }); response.end(); return; }
  let pathname;
  try { pathname = decodeURIComponent(requestUrl.pathname); } catch { response.writeHead(400); response.end('Bad URL'); return; }
  if (prefix && !pathname.startsWith(prefix + '/')) { response.writeHead(404); response.end('Not found'); return; }
  const file = path.resolve(root, '.' + (prefix ? pathname.slice(prefix.length) : pathname));
  if (file !== root && !file.startsWith(root + path.sep)) { response.writeHead(403); response.end(); return; }
  let target = file;
  try {
    if (fs.statSync(target).isDirectory()) {
      if (!pathname.endsWith('/')) { response.writeHead(308, { Location: requestUrl.pathname + '/' + requestUrl.search }); response.end(); return; }
      target = path.join(target, 'index.html');
    }
    const size = fs.statSync(target).size;
    response.writeHead(200, { 'Content-Type': types[path.extname(target)] || 'application/octet-stream', 'Content-Length': size, 'Cache-Control': 'no-cache' });
    if (request.method === 'HEAD') response.end(); else fs.createReadStream(target).pipe(response);
  } catch { response.writeHead(404, { 'Content-Type': 'text/plain' }); response.end('Not found'); }
}).listen(port, '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${port}${prefix}/`));
