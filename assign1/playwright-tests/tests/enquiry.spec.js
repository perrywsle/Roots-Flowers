const { test, expect } = require('@playwright/test');

const BASE_URL = 'file:///home/perry/COS10005/Roots-Flowers/assign1';

test.describe('Enquiry Form Tests', () => {
    
    test('should load enquiry page', async ({ page }) => {
        await page.goto(`${BASE_URL}/enquiry.html`);
        await page.waitForTimeout(1000);
        
        await page.screenshot({ path: 'screenshots/enquiry-initial.png', fullPage: true });
        
        const title = await page.title();
        console.log('Enquiry page title:', title);
    });
    
    test('should fill enquiry form', async ({ page }) => {
        await page.goto(`${BASE_URL}/enquiry.html`);
        await page.waitForTimeout(1000);
        
        // Fill text inputs
        await page.fill('input[name="firstname"]', 'Jane');
        await page.fill('input[name="lastname"]', 'Smith');
        await page.fill('input[name="email"]', 'jane.smith@example.com');
        await page.fill('input[name="phone"]', '0498765432');
        await page.fill('input[name="subject"]', 'Product Enquiry');
        
        console.log('✓ Text fields filled');
        
        // Fill textarea if exists
        const textareaCount = await page.locator('textarea').count();
        if (textareaCount > 0) {
            await page.fill('textarea', 'This is a detailed enquiry message.\nMultiple lines of text.\nAsking about products.');
            console.log('✓ Textarea filled');
        }
        
        await page.waitForTimeout(500);
        
        // Take screenshot
        await page.screenshot({ path: 'screenshots/enquiry-filled.png', fullPage: true });
        
        // Verify fields
        const emailValue = await page.inputValue('input[name="email"]');
        expect(emailValue).toBe('jane.smith@example.com');
        
        console.log('✓ Enquiry form test passed');
    });
    
    test('should test form validation', async ({ page }) => {
        await page.goto(`${BASE_URL}/enquiry.html`);
        await page.waitForTimeout(1000);
        
        let alertDetected = false;
        
        // Set up alert handler BEFORE clicking
        page.on('dialog', async dialog => {
            alertDetected = true;
            console.log('Alert detected:', dialog.message());
            await dialog.accept();
        });
        
        // Click submit button
        const submitButton = page.locator('input[type="submit"], button[type="submit"]').first();
        await submitButton.click();
        
        await page.waitForTimeout(2000);
        
        if (alertDetected) {
            console.log('✓ JavaScript alert was triggered');
            await page.screenshot({ path: 'screenshots/enquiry-alert.png' });
        } else {
            console.log('⚠ No alert - HTML5 validation active');
            await page.screenshot({ path: 'screenshots/enquiry-validation.png' });
        }
    });
});
