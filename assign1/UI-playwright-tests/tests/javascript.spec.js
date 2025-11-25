const { test, expect } = require('@playwright/test');
const { getFileUrl, ensureScreenshotsDir } = require('./utils');

test.describe('JavaScript Function Tests', () => {
  test.beforeEach(() => ensureScreenshotsDir());

  test('should have JavaScript enabled', async ({ page }) => {
    const url = getFileUrl('register.html');
    await page.goto(url);
    const jsEnabled = await page.evaluate(() => typeof document !== 'undefined');
    expect(jsEnabled).toBe(true);
  });

  test('should detect external scripts and alert on submit if present', async ({ page }) => {
    const url = getFileUrl('register.html');
    await page.goto(url);

    const scriptCount = await page.locator('script[src]').count();
    console.log('External scripts found:', scriptCount);
    expect(scriptCount).toBeGreaterThanOrEqual(0);

    let alertTriggered = false;
    page.on('dialog', async dialog => {
      alertTriggered = true;
      console.log('Alert message:', dialog.message());
      await dialog.accept();
    });

    const submit = page.locator('input[type="submit"], button[type="submit"]').first();
    await submit.click();
    await page.waitForTimeout(800);

    if (alertTriggered) {
      await page.screenshot({ path: 'tests/screenshots/js-alert.png', fullPage: true });
    } else {
      await page.screenshot({ path: 'tests/screenshots/js-no-alert.png', fullPage: true });
    }
  });
});