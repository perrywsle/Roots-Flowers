const { test, expect } = require('@playwright/test');
const { getFileUrl, ensureScreenshotsDir } = require('./utils');

test.describe('Enquiry Form Tests', () => {
  test.beforeEach(() => ensureScreenshotsDir());

  test('should load enquiry page', async ({ page }) => {
    const url = getFileUrl('enquiry.html');
    await page.goto(url);
    await page.waitForLoadState('domcontentloaded');
    await page.screenshot({ path: 'tests/screenshots/enquiry-initial.png', fullPage: true });
    const title = await page.title();
    console.log('Enquiry page title:', title);
  });

  test('should fill enquiry form', async ({ page }) => {
    const url = getFileUrl('enquiry.html');
    await page.goto(url);
    await page.fill('input[name="firstname"]', 'Jane');
    await page.fill('input[name="lastname"]', 'Smith');
    await page.fill('input[name="email"]', 'jane.smith@example.com');
    await page.fill('input[name="phone"]', '0498765432');
    await page.fill('input[name="subject"]', 'Product Enquiry');

    const textareaCount = await page.locator('textarea').count();
    if (textareaCount > 0) {
      await page.fill('textarea', 'This is a detailed enquiry message.\nThanks.');
    }

    await page.waitForTimeout(300);
    await page.screenshot({ path: 'tests/screenshots/enquiry-filled.png', fullPage: true });

    const emailValue = await page.inputValue('input[name="email"]');
    expect(emailValue).toBe('jane.smith@example.com');
  });

  test('should test form validation', async ({ page }) => {
    const url = getFileUrl('enquiry.html');
    await page.goto(url);

    let alertDetected = false;
    page.on('dialog', async dialog => {
      alertDetected = true;
      console.log('Alert:', dialog.message());
      await dialog.accept();
    });

    const submit = page.locator('input[type="submit"], button[type="submit"]').first();
    await submit.click();
    await page.waitForTimeout(800);

    if (alertDetected) {
      await page.screenshot({ path: 'tests/screenshots/enquiry-alert.png', fullPage: true });
      console.log('Alert detected and accepted');
    } else {
      await page.screenshot({ path: 'tests/screenshots/enquiry-validation.png', fullPage: true });
      console.log('No JS alert (HTML5 validation may be active)');
    }
  });
});