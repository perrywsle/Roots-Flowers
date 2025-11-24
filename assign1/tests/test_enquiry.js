const { Builder, By, until } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const fs = require('fs');

async function takeScreenshot(driver, filename) {
    await driver.sleep(300);
    let image = await driver.takeScreenshot();
    fs.writeFileSync(`screenshots/${filename}`, image, 'base64');
    console.log(`  📸 Screenshot saved: screenshots/${filename}`);
}

async function testEnquiryForm() {
    let options = new firefox.Options();
    let driver = await new Builder()
        .forBrowser('firefox')
        .setFirefoxOptions(options)
        .build();
    
    try {
        console.log('\n=== Testing Enquiry Form ===');
        
        await driver.get('file:///home/perry/COS10005/assign1/enquiry.html');
        await driver.sleep(1000);
        
        await takeScreenshot(driver, 'enquiry_initial.png');
        
        // Test empty form submission
        console.log('\n--- Test: Empty Form Alert ---');
        try {
            let submitBtn = await driver.findElement(By.css('input[type="submit"], button[type="submit"]'));
            await submitBtn.click();
            await driver.sleep(1000);
            
            try {
                let alert = await driver.switchTo().alert();
                let alertText = await alert.getText();
                console.log(`✓ Alert triggered: "${alertText}"`);
                await takeScreenshot(driver, 'enquiry_empty_alert.png');
                await alert.accept();
                console.log('✓ Alert accepted');
            } catch (e) {
                console.log('⚠ No JavaScript alert - using HTML5 validation');
                await takeScreenshot(driver, 'enquiry_html5_validation.png');
            }
        } catch (e) {
            console.log('⚠ Submit button not found');
        }
        
        await driver.sleep(500);
        
        // Fill the form
        console.log('\n--- Test: Fill Enquiry Form ---');
        const enquiryData = {
            'firstname': 'Jane',
            'lastname': 'Smith',
            'email': 'jane.smith@example.com',
            'phone': '0498765432',
            'subject': 'Product Enquiry'
        };
        
        for (let [name, value] of Object.entries(enquiryData)) {
            try {
                let field = await driver.findElement(By.name(name));
                await field.clear();
                await field.sendKeys(value);
                console.log(`✓ Filled ${name}`);
                await driver.sleep(200);
            } catch (e) {
                console.log(`⚠ Field '${name}' not found`);
            }
        }
        
        await takeScreenshot(driver, 'enquiry_filled.png');
        
        // Test textarea if exists
        try {
            let textareas = await driver.findElements(By.css('textarea'));
            if (textareas.length > 0) {
                await textareas[0].clear();
                await textareas[0].sendKeys('This is a detailed enquiry message with multiple lines.\nSecond line of the message.\nThird line for testing.');
                console.log('✓ Filled textarea with multi-line content');
                await takeScreenshot(driver, 'enquiry_with_textarea.png');
            }
        } catch (e) {
            console.log('⚠ No textarea found');
        }
        
        console.log('\n✓ Enquiry form test completed!\n');
        
    } catch (error) {
        console.error('✗ Test failed:', error);
        await takeScreenshot(driver, 'enquiry_error.png');
    } finally {
        await driver.quit();
    }
}

testEnquiryForm();
