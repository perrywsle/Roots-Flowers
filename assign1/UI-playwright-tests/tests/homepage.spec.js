const { test, expect } = require('@playwright/test');
const { getFileUrl, ensureScreenshotsDir } = require('./utils');

test('Homepage loads successfully', async ({ page }) => {
  ensureScreenshotsDir();
  const url = getFileUrl('index.html');
  await page.goto(url);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);

  await page.screenshot({ path: 'tests/screenshots/homepage-initial.png', fullPage: true });
  const title = await page.title();
  console.log('Page title:', title);
  expect(title).toContain('Root Flower');

  const linkCount = await page.locator('a').count();
  console.log('Links found:', linkCount);
});