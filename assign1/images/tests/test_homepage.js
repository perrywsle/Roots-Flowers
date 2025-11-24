const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');

async function takeScreenshot(driver, filename) {
    let image = await driver.takeScreenshot();
    fs.writeFileSync(`screenshots/${filename}`, image, 'base64');
    console.log(`  📸 Screenshot saved: screenshots/${filename}`);
}

async function testHomepage() {
    let options = new chrome.Options();
    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();
    
    try {
        console.log('\n=== Testing Homepage ===');
        
        await driver.get('file:///home/perry/COS10005/assign1/index.html');
        await driver.sleep(1000);
        
        // Take initial screenshot
        await takeScreenshot(driver, 'homepage_initial.png');
        
        let title = await driver.getTitle();
        console.log(`✓ Page title: ${title}`);
        
        let links = await driver.findElements(By.css('a'));
        console.log(`✓ Found ${links.length} links on the page`);
        
        // Test if navigation menu exists
        try {
            let nav = await driver.findElement(By.css('nav'));
            console.log('✓ Navigation menu found');
        } catch (e) {
            console.log('⚠ No nav element found (might use different structure)');
        }
        
        // Scroll down and take another screenshot
        await driver.executeScript('window.scrollTo(0, document.body.scrollHeight/2);');
        await driver.sleep(500);
        await takeScreenshot(driver, 'homepage_scrolled.png');
        
        console.log('✓ Homepage test passed!\n');
        
    } catch (error) {
        console.error('✗ Test failed:', error);
        await takeScreenshot(driver, 'homepage_error.png');
    } finally {
        await driver.quit();
    }
}

testHomepage();
