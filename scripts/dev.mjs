import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const root = process.cwd();
const environment = { ...process.env, SITE_URL: 'http://127.0.0.1:5500', BASE_PATH: '/_site', PREVIEW: 'true' };
let running = false, pending = false, timer;
function build() {
  if (running) { pending = true; return; }
  running = true;
  const child = spawn(process.execPath, ['scripts/build.mjs'], { cwd: root, env: environment, stdio: 'inherit', windowsHide: true });
  child.on('exit', code => {
    running = false;
    console.log(code === 0 ? 'Go Live: http://127.0.0.1:5500/ — watching source files.' : 'Build failed. The next saved source change will retry.');
    if (pending) { pending = false; build(); }
  });
}
for (const directory of ['data', 'blog/en', 'blog/ko', 'templates', 'assets', 'scripts', 'img', 'AI_generated_images']) {
  if (fs.existsSync(directory)) fs.watch(path.resolve(directory), { recursive: true }, () => { clearTimeout(timer); timer = setTimeout(build, 350); });
}
build();
