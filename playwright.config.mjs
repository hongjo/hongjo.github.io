import { defineConfig } from '@playwright/test';
import fs from 'node:fs';
const info = JSON.parse(fs.readFileSync('_site/build-info.json', 'utf8'));
export default defineConfig({
  testDir: './tests', timeout: 30000, fullyParallel: true, workers: 2, retries: 0,
  reporter: [['dot'], ['json', { outputFile: 'test-results/results.json' }]],
  use: {
    baseURL: 'http://127.0.0.1:4173', headless: true,
    channel: process.env.PLAYWRIGHT_CHANNEL || (process.env.CI ? undefined : 'chrome'),
    viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce',
    screenshot: 'only-on-failure', trace: 'retain-on-failure',
  },
  webServer: {
    command: 'node scripts/serve.mjs', url: 'http://127.0.0.1:4173' + info.basePath + '/',
    reuseExistingServer: Boolean(process.env.REUSE_PREVIEW), timeout: 10000,
  },
});
