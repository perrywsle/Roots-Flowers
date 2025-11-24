const { test, expect } = require('@playwright/test');

const BASE_URL = 'file:///home/perry/COS10005/Roots-Flowers/assign1';

test.describe('Registration Form Tests', () => {
    
    test('should load registration page', async ({ page }) => {
        await page.goto(`${BASE_URL}/register.html`);
        await page.waitForTimeout(1000);
        
        await page.screenshot({ path: 'screenshots/register-initial.png', fullPage: true });
        
        const title = await page.title();
        console.log('Registration page title:', title);
        expect(title.length).toBeGreaterThan(0);
    });
    
    test('should fill registration form', async ({ page }) => {
        await page.goto(`${BASE_URL}/register.html`);
        await page.waitForTimeout(1000);
        
        // Fill form fields
        await page.fill('input[name="email"]', 'playwright@test.com');
        await page.waitForTimeout(300);
        
        await page.fill('input[name="phone"]', '0412345678');
        await page.waitForTimeout(300);
        
        await page.fill('input[name="city"]', 'Melbourne');
        await page.waitForTimeout(300);
        
        await page.fill('input[name="postcode"]', '3000');
        await page.waitForTimeout(500);
        
        console.log('✓ Form filled successfully');
        
        // Take screenshot of filled form
        await page.screenshot({ path: 'screenshots/register-filled.png', fullPage: true });
        
        // Verify fields are filled
        const emailValue = await page.inputValue('input[name="email"]');
        expect(emailValue).toBe('playwright@test.com');
        
        const phoneValue = await page.inputValue('input[name="phone"]');
        expect(phoneValue).toBe('0412345678');
        
        console.log('✓ Form validation passed');
    });
    
    test('should test radio buttons', async ({ page }) => {
        await page.goto(`${BASE_URL}/register.html`);
        await page.waitForTimeout(1000);
        
        const radioCount = await page.locator('input[type="radio"]').count();
        console.log('Radio buttons found:', radioCount);
        
        if (radioCount > 0) {
            await page.locator('input[type="radio"]').first().check();
            await page.waitForTimeout(300);
            
            const isChecked = await page.locator('input[type="radio"]').first().isChecked();
            expect(isChecked).toBe(true);
            
            await page.screenshot({ path: 'screenshots/register-radio.png' });
            console.log('✓ Radio button selected');
        }
    });
    
    test('should test checkboxes', async ({ page }) => {
        await page.goto(`${BASE_URL}/register.html`);
        await page.waitForTimeout(1000);
        
        // Find only VISIBLE checkboxes
        const checkboxes = page.locator('input[type="checkbox"]:visible');
        const checkboxCount = await checkboxes.count();
        console.log('Visible checkboxes found:', checkboxCount);
        
        if (checkboxCount > 0) {
            // Check the first visible checkbox
            await checkboxes.first().check({ force: true });
            await page.waitForTimeout(300);
            
            const isChecked = await checkboxes.first().isChecked();
            expect(isChecked).toBe(true);
            
            await page.screenshot({ path: 'screenshots/register-checkbox.png' });
            console.log('✓ Checkbox selected');
        } else {
            console.log('⚠ No visible checkboxes found - skipping test');
            await page.screenshot({ path: 'screenshots/register-no-checkbox.png' });
        }
    });
});
