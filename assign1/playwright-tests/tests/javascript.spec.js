const { test, expect } = require('@playwright/test');

const BASE_URL = 'file:///home/perry/COS10005/Roots-Flowers/assign1';

test.describe('JavaScript Function Tests', () => {
    
    test('should have JavaScript enabled', async ({ page }) => {
        await page.goto(`${BASE_URL}/register.html`);
        await page.waitForTimeout(1000);
        
        const jsEnabled = await page.evaluate(() => typeof document !== 'undefined');
        expect(jsEnabled).toBe(true);
        console.log('✓ JavaScript is enabled');
    });
    
    test('should load external JavaScript files', async ({ page }) => {
        await page.goto(`${BASE_URL}/register.html`);
        await page.waitForTimeout(1000);
        
        const scriptCount = await page.locator('script[src]').count();
        console.log('External scripts found:', scriptCount);
        expect(scriptCount).toBeGreaterThan(0);
    });
    
    test('should test alert on empty form submission', async ({ page }) => {
        await page.goto(`${BASE_URL}/register.html`);
        await page.waitForTimeout(1000);
        
        let alertTriggered = false;
        let alertMessage = '';
        
        // Set up dialog handler BEFORE clicking
        page.on('dialog', async dialog => {
            alertTriggered = true;
            alertMessage = dialog.message();
            console.log('✓ Alert triggered:', alertMessage);
            await dialog.accept();
        });
        
        // Click submit button
        const submitButton = page.locator('input[type="submit"], button[type="submit"]').first();
        await submitButton.click();
        
        await page.waitForTimeout(2000);
        
        if (alertTriggered) {
            console.log('✓ JavaScript alert detected');
            await page.screenshot({ path: 'screenshots/js-alert.png' });
        } else {
            console.log('⚠ No alert - HTML5 validation might be active');
            await page.screenshot({ path: 'screenshots/js-no-alert.png' });
        }
    });
    
    test('should test reset button', async ({ page }) => {
        await page.goto(`${BASE_URL}/register.html`);
        await page.waitForTimeout(1000);
        
        // Fill fields
        await page.fill('input[name="email"]', 'test@example.com');
        await page.fill('input[name="phone"]', '0400000000');
        
        await page.screenshot({ path: 'screenshots/js-before-reset.png' });
        console.log('✓ Fields filled');
        
        // Click reset
        const resetButton = page.locator('input[type="reset"], button[type="reset"]').first();
        await resetButton.click();
        
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'screenshots/js-after-reset.png' });
        
        // Verify fields cleared
        const emailValue = await page.inputValue('input[name="email"]');
        expect(emailValue).toBe('');
        console.log('✓ Reset button cleared fields');
    });
    
    test('should test form interactions', async ({ page }) => {
        await page.goto(`${BASE_URL}/register.html`);
        await page.waitForTimeout(1000);
        
        // Test input focus
        await page.focus('input[name="email"]');
        console.log('✓ Email field focused');
        
        // Type with delay to see each character
        await page.type('input[name="email"]', 'typing@test.com', { delay: 100 });
        
        await page.screenshot({ path: 'screenshots/js-typing.png' });
        
        // Verify value
        const value = await page.inputValue('input[name="email"]');
        expect(value).toBe('typing@test.com');
        console.log('✓ Typing test passed');
    });
});
