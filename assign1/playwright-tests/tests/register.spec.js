const { test, expect } = require('@playwright/test');
const { getFileUrl, ensureScreenshotsDir } = require('./utils');

test.describe('Registration Form Tests', () => {
  test.beforeEach(() => ensureScreenshotsDir());

  test('should load registration page', async ({ page }) => {
    const url = getFileUrl('register.html');
    await page.goto(url);
    await page.waitForLoadState('domcontentloaded');
    await page.screenshot({ path: 'tests/screenshots/register-initial.png', fullPage: true });
    const title = await page.title();
    console.log('Register title:', title);
    expect(title.length).toBeGreaterThan(0);
  });

  test('should fill registration form', async ({ page }) => {
    const url = getFileUrl('register.html');
    await page.goto(url);
    await page.fill('input[name="email"]', 'playwright@test.com');
    await page.fill('input[name="phone"]', '0412345678');
    await page.fill('input[name="city"]', 'Melbourne');
    await page.fill('input[name="postcode"]', '3000');
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'tests/screenshots/register-filled.png', fullPage: true });

    expect(await page.inputValue('input[name="email"]')).toBe('playwright@test.com');
  });

  test('should test checkboxes and radios (visible only)', async ({ page }) => {
    const url = getFileUrl('register.html');
    await page.goto(url);

    const radios = page.locator('input[type="radio"]');
    const radioCount = await radios.count();
    console.log('Radio buttons found:', radioCount);
    if (radioCount > 0) {
      await radios.first().check();
      expect(await radios.first().isChecked()).toBe(true);
    }

    const visibleCheckboxes = page.locator('input[type="checkbox"]:visible');
    const checkboxCount = await visibleCheckboxes.count();
    console.log('Visible checkboxes:', checkboxCount);
    if (checkboxCount > 0) {
      await visibleCheckboxes.first().check();
      expect(await visibleCheckboxes.first().isChecked()).toBe(true);
    }

    await page.screenshot({ path: 'tests/screenshots/register-interactions.png', fullPage: true });
  });
});