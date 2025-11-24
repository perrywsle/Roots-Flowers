const { test, expect } = require('@playwright/test');

const BASE_URL = 'file:///home/perry/COS10005/Roots-Flowers/assign1';

const pages = [
    { file: 'index.html', name: 'Homepage' },
    { file: 'product1.html', name: 'Product 1' },
    { file: 'product2.html', name: 'Product 2' },
    { file: 'enquiry.html', name: 'Enquiry' },
    { file: 'register.html', name: 'Register' },
    { file: 'profile.html', name: 'Profile' },
    { file: 'enhancement.html', name: 'Enhancement' },
    { file: 'enhancement2.html', name: 'Enhancement 2' },
    { file: 'promotion.html', name: 'Promotion' },
    { file: 'workshop.html', name: 'Workshop' },
    { file: 'acknowledgement.html', name: 'Acknowledgement' }
];

test.describe('Navigation Tests', () => {
    for (const pageInfo of pages) {
        test(`should load ${pageInfo.name}`, async ({ page }) => {
            const url = `${BASE_URL}/${pageInfo.file}`;
            await page.goto(url);
            await page.waitForTimeout(500);
            
            const title = await page.title();
            console.log(`${pageInfo.name} title:`, title);
            
            // Take screenshot
            const screenshotName = pageInfo.file.replace('.html', '.png');
            await page.screenshot({ path: `screenshots/${screenshotName}`, fullPage: true });
            
            // Verify page loaded
            expect(title.length).toBeGreaterThan(0);
        });
    }
});
