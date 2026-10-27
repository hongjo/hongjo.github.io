import { test, expect } from '@playwright/test';
import fs from 'node:fs';

const base = JSON.parse(fs.readFileSync('_site/build-info.json', 'utf8')).basePath;
const pathFor = (language, route = '') => base + '/' + (language === 'ko' ? 'ko/' : '') + (route ? route + '/' : '');

test('English is the default and Korean uses the same English display copy', async ({ page }) => {
  await page.goto(pathFor('en'));
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  expect(await page.locator('body').evaluate(element => getComputedStyle(element).fontFamily)).toContain('Noto Serif KR');
  const englishCopy = await page.locator('.home-hero h1').textContent();
  await page.locator('.language-link').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ko');
  await expect(page.locator('.home-hero h1')).toHaveText(englishCopy);
  await expect(page.locator('.home-hero h1')).toHaveAttribute('lang', 'en');
  expect(await page.locator('.home-hero .major').evaluate(element => getComputedStyle(element).fontFamily)).toContain('Noto Serif KR');
  expect(await page.locator('.home-hero .major').textContent()).toMatch(/[가-힣]/);
  await expect(page.locator('.community-contact h3')).toHaveText('Let’s connect ideas to infrastructure.');
});

for (const [language, name, greeting] of [
  ['en', 'Jimin Yu', 'Hello, I am Jimin Yu, an undergraduate researcher.'],
  ['ko', '유지민', '안녕하세요, 학부연구생 유지민입니다'],
]) {
  test(`${language}: compact people directory and complete Jimin Yu profile`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(pathFor(language, 'members'));
    await expect(page.locator('[data-member]')).toHaveCount(36);
    const cards = page.locator('#category-0 [data-member]');
    const boxes = await cards.evaluateAll(items => items.map(item => {
      const { x, y, width, height } = item.getBoundingClientRect();
      return { x, y, width, height };
    }));
    expect(boxes.slice(0, 6).every(box => box.y === boxes[0].y)).toBe(true);
    expect(boxes[6].y).toBeGreaterThan(boxes[0].y);
    expect(boxes[0].height).toBeLessThan(340);
    const personal = cards.filter({ has: page.getByRole('heading', { name: language === 'ko' ? '주시헌' : 'Siheon Joo', exact: true }) });
    await expect(personal.locator('.member-photo')).toHaveAttribute('data-original', /siheon-joo\.jpg$/);
    await personal.locator('summary').click();
    await expect(personal.locator('.member-profile')).toContainText(language === 'ko' ? 'BK 최우수 논문상 수상.' : 'Received the BK Best Paper Award.');
    await personal.locator('summary').click();
    expect((await page.locator('.faculty-summary .faculty-photo').boundingBox()).width).toBeGreaterThan(200);
    const partTime = await page.locator('#category-1').boundingBox(), interns = await page.locator('#category-2').boundingBox();
    expect(interns.y).toBe(partTime.y);
    expect(interns.x).toBeGreaterThan(partTime.x);
    const intern = page.locator('#category-2 [data-member]').filter({ has: page.getByRole('heading', { name, exact: true }) });
    await expect(intern.locator('.member-photo')).toHaveAttribute('data-original', /jimin-yu\.png$/);
    await intern.locator('summary').click();
    await expect(intern.locator('.member-profile')).toContainText(greeting);
    await expect(intern.locator('.member-profile')).toBeVisible();
    expect((await intern.boundingBox()).width).toBeGreaterThan(900);
    await intern.locator('summary').click();
    await page.setViewportSize({ width: 390, height: 844 });
    const first = await cards.nth(0).boundingBox(), second = await cards.nth(1).boundingBox(), third = await cards.nth(2).boundingBox();
    expect(second.y).toBe(first.y);
    expect(third.y).toBeGreaterThan(first.y);
    await intern.locator('summary').click();
    await expect(intern.locator('.member-profile')).toContainText(greeting);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  });
}

test('always visible author and topic filters combine with year, type, search and language', async ({ page }) => {
  const publications = JSON.parse(fs.readFileSync('data/ko/publications.json', 'utf8'));
  const aliases = JSON.parse(fs.readFileSync('data/member-author-aliases.json', 'utf8')).find(group => group.includes('Siheon Joo'));
  const all = Object.entries(publications).flatMap(([type, records]) => records.map(record => ({ ...record, type })));
  const byAuthor = all.filter(record => (record.authors || record.inventors).some(name => aliases.includes(name)));
  await page.goto(pathFor('en', 'publications'));
  await expect(page.getByLabel('Author', { exact: true })).toBeVisible();
  expect(await page.locator('#pub-person optgroup').evaluateAll(groups => groups.map(group => group.label))).toEqual(['Current students', 'Alumni', 'External authors']);
  await expect(page.locator('#pub-person optgroup[label="Current students"] option[value="siheonjoo"]')).toHaveCount(1);
  await expect(page.getByLabel('Research topic', { exact: true })).toBeVisible();
  await page.getByLabel('Author', { exact: true }).selectOption('siheonjoo');
  await expect(page.locator('[data-publication]:visible')).toHaveCount(byAuthor.length);
  await page.locator('button[data-type="journal_papers"]').click();
  const journals = byAuthor.filter(record => record.type === 'journal_papers');
  await expect(page.locator('[data-publication]:visible')).toHaveCount(journals.length);
  const year = Math.max(...journals.map(record => record.year));
  await page.getByLabel('Year', { exact: true }).selectOption(String(year));
  const selected = journals.filter(record => record.year === year);
  await expect(page.locator('[data-publication]:visible')).toHaveCount(selected.length);
  await page.reload();
  await expect(page.getByLabel('Author', { exact: true })).toHaveValue('siheonjoo');
  await expect(page.locator('[data-publication]:visible')).toHaveCount(selected.length);
  await page.locator('.language-link').click();
  await expect(page.getByLabel('저자', { exact: true })).toHaveValue('siheonjoo');
  await expect(page.getByLabel('연구주제', { exact: true })).toBeVisible();
  await expect(page.locator('[data-publication]:visible')).toHaveCount(selected.length);
  await page.getByRole('button', { name: '초기화', exact: true }).click();
  await expect(page.locator('#pub-person')).toHaveValue('');
  await expect(page.locator('[data-publication]:visible')).toHaveCount(all.length);
  await page.getByRole('searchbox').fill('주시헌');
  await expect(page.locator('[data-publication]:visible')).toHaveCount(byAuthor.length);
  await page.getByRole('button', { name: '초기화', exact: true }).click();
  await page.locator('#pub-person').selectOption('siheonjoo');
  await page.locator('#pub-topic').selectOption('vision');
  const vision = byAuthor.filter(record => /vision|image|crack|detection|segmentation|visual/i.test(record.title));
  await expect(page.locator('[data-publication]:visible')).toHaveCount(vision.length);
  await page.getByRole('searchbox').fill('crack');
  await expect(page.locator('[data-publication]:visible')).toHaveCount(vision.filter(record => /crack/i.test(record.title)).length);
});

test('wheel scrolling settles on the next home section and footer remains reachable', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(pathFor('en'));
  const header = await page.locator('.site-header').boundingBox();
  const hero = await page.locator('.home-hero').boundingBox();
  expect(hero.height).toBeGreaterThanOrEqual(900 - header.height);
  await page.mouse.move(720, 500);
  await page.mouse.wheel(0, hero.height * .8);
  await expect.poll(async () => Math.abs((await page.locator('#research').boundingBox()).y - header.height)).toBeLessThan(2);
  await page.keyboard.press('End');
  await expect(page.locator('.footer-bottom')).toBeInViewport();
  await page.setViewportSize({ width: 1440, height: 600 });
  await page.goto(pathFor('en') + '#contact');
  await expect(page.locator('.contact-email')).toBeInViewport();
});

test('research topics share one desktop panel and dots track section navigation', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(pathFor('en') + '#selected-research');
  const studies = page.locator('[data-study]');
  await expect(studies).toHaveCount(4);
  const boxes = await studies.evaluateAll(elements => elements.map(element => {
    const rect = element.getBoundingClientRect(); return { top: rect.top, bottom: rect.bottom };
  }));
  expect(boxes.every(box => Math.abs(box.top - boxes[0].top) < 1)).toBe(true);
  expect(Math.max(...boxes.map(box => box.bottom))).toBeLessThanOrEqual(900);
  const navigation = page.getByRole('navigation', { name: 'Home sections' });
  await expect(navigation.locator('a')).toHaveCount(5);
  await expect(navigation.locator('[href="#selected-research"]')).toHaveAttribute('aria-current', 'location');
  expect((await navigation.textContent()).trim()).toBe('');
  await navigation.getByRole('link', { name: 'Vision & approach', exact: true }).click();
  await expect(navigation.locator('[href="#our-vision"]')).toHaveAttribute('aria-current', 'location');
  await page.keyboard.press('End');
  await expect(navigation.locator('[href="#community"]')).toHaveAttribute('aria-current', 'location');
});

for (const language of ['en', 'ko']) {
  test(`${language}: activity selection fits a full album, preserves history and opens originals`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(pathFor(language, 'album'));
    const albums = JSON.parse(fs.readFileSync(`data/${language}/album.json`, 'utf8')).albums;
    const primaryIndex = albums.findIndex(album => album.images.some(image => image.src.startsWith('img/album/20230625-i3ce/')));
    const secondaryIndex = albums.findIndex(album => album.images.some(image => image.src.startsWith('img/album/20260506/')));
    expect(primaryIndex).toBeGreaterThanOrEqual(0);
    expect(secondaryIndex).toBeGreaterThanOrEqual(0);
    const secondaryId = `album-${secondaryIndex}`;
    await page.locator(`[data-album-link][href="#album-${primaryIndex}"]`).click();
    await expect(page.locator('[data-album-panel]:visible')).toHaveCount(1);
    await expect(page.locator('[data-album-panel]:visible figure')).toHaveCount(14);
    await page.evaluate(() => document.fonts.ready);
    for (const width of [1440, 768, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await expect.poll(async () => {
        const gallery = page.locator('[data-album-panel]:visible .album-grid');
        return gallery.evaluate(element => element.scrollHeight - element.clientHeight);
      }).toBeLessThanOrEqual(1);
      await expect.poll(async () => (await page.locator('[data-album-panel]:visible').boundingBox()).y + (await page.locator('[data-album-panel]:visible').boundingBox()).height).toBeLessThanOrEqual(900);
      const figures = await page.locator('[data-album-panel]:visible figure').all();
      for (const figure of figures) await expect(figure).toBeInViewport();
    }
    const photo = page.locator('[data-album-panel]:visible [data-zoom]').first();
    const original = await photo.evaluate(anchor => anchor.href);
    await photo.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('dialog').locator('img')).toHaveAttribute('src', original);
    await page.keyboard.press('Escape');
    await expect(photo).toBeFocused();
    await page.locator('#album-choice').selectOption(secondaryId);
    await expect(page.locator('[data-album-panel]:visible figure')).toHaveCount(10);
    await page.reload();
    await expect(page.locator('#album-choice')).toHaveValue(secondaryId);
    await expect(page.locator('[data-album-panel]:visible figure')).toHaveCount(10);
    await page.goBack();
    await expect(page.locator('[data-album-panel]:visible figure')).toHaveCount(14);
  });
}

test('mobile section descriptions and contact remain readable and reachable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(pathFor('ko') + '#research');
  const lastArea = page.locator('.research-grid article').last();
  const description = lastArea.locator('p').last();
  await description.scrollIntoViewIfNeeded();
  await expect(description).toBeInViewport();
  await page.locator('.contact-email').scrollIntoViewIfNeeded();
  await expect(page.locator('.contact-email')).toBeInViewport();
  await page.goto(pathFor('en', 'blog/research-writing-07-is-my-research-publishable'));
  expect(await page.locator('html').evaluate(element => getComputedStyle(element).scrollSnapType)).toBe('none');
});

test('all desktop home sub-sections fit a viewport at common window heights', async ({ page }) => {
  for (const language of ['en', 'ko']) for (const height of [900, 768, 720, 600]) {
    await page.setViewportSize({ width: 1440, height });
    await page.goto(pathFor(language));
    await page.evaluate(() => document.fonts.ready);
    const panels = await page.locator('.scroll-panel:not(.home-hero)').evaluateAll(elements => elements.map(element => ({ id: element.id, height: element.getBoundingClientRect().height })));
    const available = height - await page.locator('.site-header').evaluate(element => element.getBoundingClientRect().height);
    for (const panel of panels) expect(panel.height, `${language} ${height}px ${panel.id}`).toBeLessThanOrEqual(available + 2);
    expect(await page.locator('.scroll-panel').evaluateAll(elements => elements.map(element => element.id))).toEqual(['intro', 'research', 'selected-research', 'our-vision', 'community']);
  }
});
