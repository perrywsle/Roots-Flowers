const { Builder, By } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const fs = require('fs');

async function takeScreenshot(driver, filename) {
    await driver.sleep(300);
    let image = await driver.takeScreenshot();
    fs.writeFileSync(`screenshots/${filename}`, image, 'base64');
    console.log(`  📸 Screenshot saved: screenshots/${filename}`);
}

async function testNavigation() {
    let options = new firefox.Options();
    let driver = await new Builder()
        .forBrowser('firefox')
        .setFirefoxOptions(options)
        .build();
    
    try {
        console.log('\n=== Testing Navigation ===');
        const baseUrl = 'file:///home/perry/COS10005/assign1/';
        
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
        
        for (let page of pages) {
            await driver.get(baseUrl + page.file);
            await driver.sleep(800);
            
            let title = await driver.getTitle();
            console.log(`✓ ${page.name} (${page.file}) - Title: ${title}`);
            
            let screenshotName = page.file.replace('.html', '.png');
            await takeScreenshot(driver, screenshotName);
        }
        
        console.log('\n✓ All pages loaded successfully!\n');
        
    } catch (error) {
        console.error('✗ Navigation test failed:', error);
        await takeScreenshot(driver, 'navigation_error.png');
    } finally {
        await driver.quit();
    }
}

testNavigation();
