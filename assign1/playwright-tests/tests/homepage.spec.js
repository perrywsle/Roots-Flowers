const { test, expect } = require('@playwright/test');

const BASE_URL = 'file:///home/perry/COS10005/Roots-Flowers/assign1';

test('Homepage loads successfully', async ({ page }) => {
    // Navigate to homepage
    await page.goto(`${BASE_URL}/index.html`);
    
    // Wait for page to load
    await page.waitForTimeout(1000);
    
    // Take screenshot
    await page.screenshot({ path: 'screenshots/homepage-initial.png', fullPage: true });
    
    // Get page title
    const title = await page.title();
    console.log('Page title:', title);
    
    // Check title contains expected text
    expect(title).toContain('Root Flower');
    
    // Count links
    const links = await page.locator('a').count();
    console.log('Number of links:', links);
    
    // Verify navigation exists
    const nav = await page.locator('nav').count();
    console.log('Navigation found:', nav > 0);
    
    // Scroll down
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(500);
    
    // Take scrolled screenshot
    await page.screenshot({ path: 'screenshots/homepage-scrolled.png', fullPage: true });
});
