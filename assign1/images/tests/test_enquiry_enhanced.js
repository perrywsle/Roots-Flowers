const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');

async function takeScreenshot(driver, filename) {
    let image = await driver.takeScreenshot();
    fs.writeFileSync(`screenshots/${filename}`, image, 'base64');
    console.log(`  📸 Screenshot saved: screenshots/${filename}`);
}

async function testEnquiryFormEnhanced() {
    let options = new chrome.Options();
    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();
    
    try {
        console.log('\n=== Testing Enquiry Form (Enhanced) ===');
        
        await driver.get('file:///home/perry/COS10005/assign1/enquiry.html');
        await driver.sleep(1000);
        
        await takeScreenshot(driver, 'enquiry_enhanced_initial.png');
        
        // Test 1: Empty form submission to trigger validation
        console.log('\n--- Test: Empty Form Validation ---');
        try {
            let submitBtn = await driver.findElement(By.css('input[type="submit"], button[type="submit"]'));
            
            // Scroll to button
            await driver.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", submitBtn);
            await driver.sleep(500);
            
            console.log('✓ Submit button found, clicking...');
            
            // Try JavaScript click
            await driver.executeScript("arguments[0].click();", submitBtn);
            await driver.sleep(1500);
            
            // Check for alert
            try {
                let alert = await driver.switchTo().alert();
                let alertText = await alert.getText();
                console.log(`✓ JavaScript alert triggered!`);
                console.log(`  Alert message: "${alertText}"`);
                await takeScreenshot(driver, 'enquiry_empty_alert.png');
                await alert.accept();
                console.log('✓ Alert accepted');
            } catch (e) {
                console.log('⚠ No JavaScript alert - checking HTML5 validation...');
                
                // Check if HTML5 validation is blocking
                let validationMessage = await driver.executeScript(`
                    var form = document.querySelector('form');
                    var firstInvalid = form.querySelector(':invalid');
                    return firstInvalid ? firstInvalid.validationMessage : null;
                `);
                
                if (validationMessage) {
                    console.log(`✓ HTML5 validation active: "${validationMessage}"`);
                } else {
                    console.log('⚠ No validation detected');
                }
                
                await takeScreenshot(driver, 'enquiry_html5_validation.png');
            }
        } catch (e) {
            console.log(`⚠ Submit button test failed: ${e.message}`);
        }
        
        await driver.sleep(500);
        
        // Test 2: Fill the form completely
        console.log('\n--- Test: Fill Complete Enquiry Form ---');
        
        const enquiryData = {
            'firstname': 'Jane',
            'lastname': 'Smith',
            'email': 'jane.smith@example.com',
            'phone': '0498765432',
            'subject': 'Product Enquiry - Bouquets'
        };
        
        for (let [name, value] of Object.entries(enquiryData)) {
            try {
                let field = await driver.findElement(By.name(name));
                await driver.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", field);
                await driver.sleep(200);
                await field.clear();
                await field.sendKeys(value);
                console.log(`✓ Filled ${name}: ${value}`);
            } catch (e) {
                console.log(`⚠ Field '${name}' not found`);
            }
        }
        
        // Fill textarea
        try {
            let textarea = await driver.findElement(By.css('textarea'));
            await driver.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", textarea);
            await driver.sleep(200);
            await textarea.clear();
            await textarea.sendKeys('Hello,\n\nI am interested in purchasing a hand bouquet for a special occasion.\nCould you please provide more information about:\n- Available flowers\n- Pricing\n- Delivery options\n\nThank you!\nJane Smith');
            console.log('✓ Filled textarea with detailed message');
        } catch (e) {
            console.log('⚠ Textarea not found');
        }
        
        await takeScreenshot(driver, 'enquiry_completely_filled.png');
        await driver.sleep(500);
        
        // Test 3: Test submit with valid data
        console.log('\n--- Test: Submit Valid Form ---');
        try {
            let submitBtn = await driver.findElement(By.css('input[type="submit"], button[type="submit"]'));
            await driver.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", submitBtn);
            await driver.sleep(500);
            
            console.log('✓ Submitting form with valid data...');
            await driver.executeScript("arguments[0].click();", submitBtn);
            await driver.sleep(1500);
            
            // Check for success alert or page change
            try {
                let alert = await driver.switchTo().alert();
                let alertText = await alert.getText();
                console.log(`✓ Alert on submit: "${alertText}"`);
                await takeScreenshot(driver, 'enquiry_submit_alert.png');
                await alert.accept();
            } catch (e) {
                console.log('✓ Form submitted (no alert - might navigate or use HTML form action)');
                await takeScreenshot(driver, 'enquiry_after_submit.png');
            }
        } catch (e) {
            console.log(`⚠ Submit test failed: ${e.message}`);
        }
        
        // Test 4: Test Reset Button
        console.log('\n--- Test: Reset Button Functionality ---');
        try {
            // Reload page
            await driver.get('file:///home/perry/COS10005/assign1/enquiry.html');
            await driver.sleep(1000);
            
            // Fill one field
            let emailField = await driver.findElement(By.name('email'));
            await emailField.sendKeys('test@reset.com');
            console.log('✓ Filled email field');
            await takeScreenshot(driver, 'enquiry_before_reset.png');
            
            // Find and click reset
            let resetBtn = await driver.findElement(By.css('input[type="reset"], button[type="reset"]'));
            await driver.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", resetBtn);
            await driver.sleep(500);
            
            console.log('✓ Clicking reset button...');
            await driver.executeScript("arguments[0].click();", resetBtn);
            await driver.sleep(500);
            
            await takeScreenshot(driver, 'enquiry_after_reset.png');
            
            let emailValue = await emailField.getAttribute('value');
            if (emailValue === '') {
                console.log('✓ Reset button successfully cleared the form');
            } else {
                console.log(`⚠ Form not fully reset, email value: "${emailValue}"`);
            }
        } catch (e) {
            console.log(`⚠ Reset button test failed: ${e.message}`);
        }
        
        console.log('\n✓ Enhanced enquiry form test completed!\n');
        
    } catch (error) {
        console.error('✗ Test failed:', error);
        await takeScreenshot(driver, 'enquiry_enhanced_error.png');
    } finally {
        await driver.quit();
    }
}

testEnquiryFormEnhanced();
