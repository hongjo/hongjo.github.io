import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import { marked } from 'marked';
import { memberRecords } from '../scripts/member-profiles.mjs';

const info = JSON.parse(fs.readFileSync('_site/build-info.json', 'utf8'));
const base = info.basePath;
const read = (language, name) => JSON.parse(fs.readFileSync(`data/${language}/${name}.json`, 'utf8'));
const pathFor = (language, route = '') => base + '/' + (language === 'ko' ? 'ko/' : '') + (route ? route + '/' : '');
const publications = read('ko', 'publications');
const allRecords = Object.entries(publications).flatMap(([type, records]) => records.map(record => ({ ...record, type })));
const primary = ['', 'members', 'publications', 'projects', 'teaching', 'blog', 'album', 'join', 'about', 'news', 'faculty'];
const normalize = value => value.replace(/\s+/g, ' ').trim();

test('year, type, text, reset, deep links and history work together', async ({ page }) => {
  await page.goto(pathFor('en', 'publications'));
  await expect(page.locator('[data-publication]:visible')).toHaveCount(allRecords.length);
  await expect(page.getByRole('button', { name: /Selected/ })).toHaveCount(0);
  await page.getByLabel('Year', { exact: true }).selectOption('2026');
  const expectedYear = allRecords.filter(record => record.year === 2026);
  await expect(page.locator('[data-publication]:visible')).toHaveCount(expectedYear.length);
  await expect(page.locator('[data-year-group]:visible')).toHaveCount(1);
  await page.getByRole('button', { name: /Journal articles/ }).click();
  const expectedJournal = expectedYear.filter(record => record.type === 'journal_papers');
  await expect(page.locator('[data-publication]:visible')).toHaveCount(expectedJournal.length);
  await expect(page).toHaveURL(/year=2026.*type=journal_papers/);
  await page.reload();
  await expect(page.locator('[data-publication]:visible')).toHaveCount(expectedJournal.length);
  await page.locator('.language-link').click();
  await expect(page).toHaveURL(new RegExp('/ko/publications/\\?year=2026&type=journal_papers'));
  await expect(page.locator('[data-publication]:visible')).toHaveCount(expectedJournal.length);
  await page.getByRole('button', { name: '초기화', exact: true }).click();
  await expect(page.locator('[data-publication]:visible')).toHaveCount(allRecords.length);
  await page.getByRole('searchbox', { name: '연구실적 검색', exact: true }).fill('ＮＯＮＥＸＩＳＴＥＮＴ－ＲＥＣＯＲＤ');
  await expect(page.locator('[data-publication]:visible')).toHaveCount(0);
  await expect(page.locator('[data-empty]')).toBeVisible();
  await expect(page.locator('[data-year-group]:visible')).toHaveCount(0);
  await page.getByRole('button', { name: '초기화', exact: true }).click();
  await page.getByLabel('연도', { exact: true }).selectOption('2025');
  await page.getByLabel('연도', { exact: true }).selectOption('2024');
  await page.goBack();
  await expect(page.getByLabel('연도', { exact: true })).toHaveValue('2025');
  await expect(page.locator('[data-publication]:visible')).toHaveCount(allRecords.filter(record => record.year === 2025).length);
});

test('all four record types and topic filtering preserve the original records', async ({ page }) => {
  await page.goto(pathFor('en', 'publications'));
  for (const [type, expected] of Object.entries(publications)) {
    await page.locator(`button[data-type="${type}"]`).click();
    await expect(page.locator('[data-publication]:visible')).toHaveCount(expected.length);
  }
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await page.getByText('More filters', { exact: true }).click();
  await page.getByLabel('Research topic', { exact: true }).selectOption('vision');
  const expectedVision = allRecords.filter(record => /vision|image|crack|detection|segmentation|visual/i.test(record.title));
  await expect(page.locator('[data-publication]:visible')).toHaveCount(expectedVision.length);
  await page.getByRole('searchbox', { name: 'Search publications', exact: true }).fill('ＣＲＡＣＫ');
  await expect(page.locator('[data-publication]:visible')).toHaveCount(expectedVision.filter(record => /crack/i.test(record.title + ' ' + (record.authors || []).join(' '))).length);
});

test('mobile menu is usable by keyboard and does not expose hidden links', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(pathFor('ko'));
  const menu = page.getByRole('button', { name: '메뉴', exact: true });
  await expect(menu).toBeVisible();
  await expect(page.locator('#site-nav')).toBeHidden();
  await menu.focus(); await page.keyboard.press('Enter');
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Tab');
  await expect(page.locator('#site-nav a').first()).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await expect(menu).toBeFocused();
  await menu.click(); await page.locator('#site-nav a').first().click();
  await expect(page).toHaveURL(new RegExp('/ko/members/$'));
});

test('photo modal opens the original, closes with Escape, and restores focus', async ({ page }) => {
  await page.goto(pathFor('en', 'album'));
  const trigger = page.locator('[data-zoom]').first();
  const original = await trigger.getAttribute('href');
  await trigger.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog').locator('img')).toHaveJSProperty('src', new URL(original, page.url()).href);
  await expect(page.getByRole('link', { name: /Open original file/ })).toHaveJSProperty('href', new URL(original, page.url()).href);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await expect(page.locator('html')).not.toHaveClass(/dialog-open/);
});

test('article images and the nested table of contents work', async ({ page }) => {
  await page.goto(pathFor('en', 'blog/frequency-aware-crack-segmentation'));
  const image = page.locator('.post-body .image-zoom').first();
  await image.click(); await expect(page.getByRole('dialog')).toBeVisible();
  const original = await image.locator('img').getAttribute('data-original');
  await expect(page.getByRole('dialog').locator('img')).toHaveAttribute('src', original);
  await page.getByRole('button', { name: 'Close ×' }).click();
  await expect(image).toBeFocused();
  await page.goto(pathFor('en', 'blog/research-writing-07-is-my-research-publishable'));
  await expect(page.locator('.post-toc ul ul')).not.toHaveCount(0);
  const anchor = page.locator('.post-toc a').nth(3);
  const target = await anchor.getAttribute('href'); await anchor.click();
  await expect(page.locator(target)).toBeInViewport();
  const top = await page.locator(target).evaluate(element => element.getBoundingClientRect().top);
  expect(top).toBeGreaterThanOrEqual(84);
});

test('legacy routes and publication category anchors remain valid', async ({ page }) => {
  await page.goto(base + '/#blog/2');
  await expect(page).toHaveURL(new RegExp('/ko/blog/frequency-aware-crack-segmentation/$'));
  await page.goto(pathFor('en', 'publications') + '#patents');
  await expect(page.locator('[data-publication]:visible')).toHaveCount(publications.patents.length);
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await page.reload();
  await expect(page.locator('[data-publication]:visible')).toHaveCount(allRecords.length);
});

test('core content remains available without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173' + pathFor('en', 'publications'));
  await expect(page.locator('[data-publication]')).toHaveCount(allRecords.length);
  await expect(page.locator('[data-publication-filters]')).toBeHidden();
  await expect(page.locator('#site-nav')).toBeVisible();
  await page.goto('http://127.0.0.1:4173' + pathFor('en', 'album'));
  expect(await page.locator('[data-zoom]').first().getAttribute('href')).toContain('/img/');
  await context.close();
});

for (const language of ['en', 'ko']) {
  test(`${language}: source text and automatic member records are preserved`, async ({ page }) => {
    await page.goto(pathFor(language, 'members'));
    const data = read(language, 'members'), aliases = JSON.parse(fs.readFileSync('data/member-author-aliases.json', 'utf8'));
    const cards = page.locator('[data-member]'); let index = 0;
    for (const category of data.categories) for (const member of category.members) {
      const card = cards.nth(index++);
      await expect(card.locator('.member-info>h3')).toHaveText(member.name);
      const records = memberRecords(member.name, publications, aliases);
      const content = await card.textContent();
      if (!['행정 담당', 'Administrative Staff'].includes(category.title)) {
        for (const paper of Object.values(records).flat()) expect(normalize(content)).toContain(normalize(paper.title));
      }
    }
    await cards.first().locator('summary').click();
    await expect(cards.first().locator('.member-profile')).toBeVisible();
    const bounds = await cards.first().boundingBox(); expect(bounds.width).toBeGreaterThan(900);
  });
  for (const post of read(language, 'blog').posts) {
    test(`${language}: complete article text ${post.slug}`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      const response = await page.goto(pathFor(language, 'blog/' + post.slug)); expect(response.status()).toBe(200);
      const expected = marked.parse(fs.readFileSync(post.md, 'utf8'));
      const text = await page.evaluate(source => { const template = document.createElement('template'); template.innerHTML = source; return template.content.textContent; }, expected);
      expect(normalize(await page.locator('[data-post-content]').textContent())).toBe(normalize(text));
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
    });
  }
}

for (const width of [360, 390, 768, 1440]) {
  for (const route of primary) {
    test(`layout ${width}px: ${route || 'home'}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1000 });
      const errors = []; page.on('pageerror', error => errors.push(error.message));
      await page.goto(pathFor('ko', route));
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, 'The document should not scroll horizontally').toBeLessThanOrEqual(1);
      await expect(page.locator('h1')).toBeVisible();
      if (!route) {
        await expect(page.locator('.home-hero>.image img')).toBeVisible();
        const photo = await page.locator('.home-hero>.image img').boundingBox();
        expect(photo.height).toBeGreaterThan(200);
        for (const image of await page.locator('.research-area-image').all()) {
          const bounds = await image.boundingBox();
          expect(bounds.height / bounds.width).toBeLessThanOrEqual(.8);
          expect(bounds.height / bounds.width).toBeGreaterThan(.55);
        }
      }
      expect(errors).toEqual([]);
    });
  }
}

for (const language of ['en', 'ko']) for (const route of primary) {
  test(`accessibility ${language}: ${route || 'home'}`, async ({ page }) => {
    await page.goto(pathFor(language, route));
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice']).analyze();
    expect(results.violations.map(violation => ({ id: violation.id, impact: violation.impact, nodes: violation.nodes.map(node => node.target) }))).toEqual([]);
  });
}

test('capture representative desktop and mobile pages', async ({ page }) => {
  const captureDir = 'test-results/previews';
  fs.mkdirSync(captureDir, { recursive: true });
  for (const [language, route, width, name] of [
    ['en', '', 1440, 'home-desktop'], ['ko', '', 390, 'home-mobile'],
    ['ko', 'publications', 1440, 'publications-desktop'], ['ko', 'members', 1440, 'members-desktop'],
    ['ko', 'blog/research-writing-07-is-my-research-publishable', 390, 'article-mobile'],
    ['en', 'album', 1440, 'album-desktop'],
  ]) {
    await page.setViewportSize({ width, height: 1000 }); await page.goto(pathFor(language, route));
    await page.locator('img').evaluateAll(images => images.forEach(image => image.loading = 'eager'));
    await page.waitForFunction(() => [...document.images].every(image => image.complete));
    await page.screenshot({ path: `${captureDir}/${name}.png`, fullPage: route === '' });
    if (!route) {
      await page.screenshot({ path: `${captureDir}/${name}-fold.png` });
      if (width === 1440) {
        const style = '.site-header,.skip-link{visibility:hidden!important}';
        await page.locator('.research-areas').screenshot({ path: `${captureDir}/research-desktop.png`, style });
        await page.locator('.vision-section').screenshot({ path: `${captureDir}/vision-desktop.png`, style });
      }
    }
  }
});

test('interactive mobile states pass accessibility and keep content in bounds', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const audit = async () => {
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice']).analyze();
    expect(results.violations.map(item => ({ id: item.id, nodes: item.nodes.map(node => node.target) }))).toEqual([]);
  };
  await page.goto(pathFor('ko'));
  await page.getByRole('button', { name: '메뉴', exact: true }).hover();
  await page.getByRole('button', { name: '메뉴', exact: true }).click();
  await audit();
  await page.goto(pathFor('ko', 'publications'));
  await page.locator('button[data-type="journal_papers"]').click();
  await page.locator('button[data-type="journal_papers"]').hover();
  await audit();
  await page.goto(pathFor('ko', 'members'));
  await page.locator('.member-details summary').first().click();
  await audit();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  await page.goto(pathFor('ko', 'album'));
  await page.locator('[data-zoom]').first().click();
  await audit();
  await page.keyboard.press('Escape');
});

for (const language of ['en', 'ko']) {
  test(`long article tables and headings are accessible in ${language}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(pathFor(language, 'blog/research-writing-07-is-my-research-publishable'));
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice']).analyze();
    expect(results.violations.map(item => ({ id: item.id, nodes: item.nodes.map(node => node.target) }))).toEqual([]);
    await expect(page.locator('.table-scroll').first()).toHaveAttribute('tabindex', '0');
  });
}
