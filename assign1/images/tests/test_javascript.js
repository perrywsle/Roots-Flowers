const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');

async function takeScreenshot(driver, filename) {
    let image = await driver.takeScreenshot();
    fs.writeFileSync(`screenshots/${filename}`, image, 'base64');
    console.log(`  📸 Screenshot saved: screenshots/${filename}`);
}

async function testJavaScript() {
    let options = new chrome.Options();
    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();
    
    try {
        console.log('\n=== Testing JavaScript Functions ===');
        
        await driver.get('file:///home/perry/COS10005/assign1/register.html');
        await driver.sleep(1000);
        
        // Test 1: Check if JavaScript is loaded
        console.log('\n--- Test: JavaScript Execution ---');
        let jsEnabled = await driver.executeScript('return typeof document !== "undefined"');
        console.log(`✓ JavaScript enabled: ${jsEnabled}`);
        
        // Test 2: Check external JavaScript file is loaded
        console.log('\n--- Test: External JavaScript Files ---');
        let scripts = await driver.findElements(By.css('script[src]'));
        console.log(`✓ Found ${scripts.length} external JavaScript file(s)`);
        for (let script of scripts) {
            let src = await script.getAttribute('src');
            console.log(`  - ${src}`);
        }
        
        // Test 3: Trigger validation by clicking submit with empty form
        console.log('\n--- Test: Form Validation Alert ---');
        try {
            // Scroll to submit button first
            let submitBtn = await driver.findElement(By.css('input[type="submit"], button[type="submit"]'));
            await driver.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", submitBtn);
            await driver.sleep(500);
            
            await takeScreenshot(driver, 'js_before_submit_click.png');
            
            // Click using JavaScript if normal click fails
            try {
                await submitBtn.click();
            } catch (e) {
                console.log('  Normal click failed, using JavaScript click...');
                await driver.executeScript("arguments[0].click();", submitBtn);
            }
            
            await driver.sleep(1500);
            
            // Handle alert
            try {
                let alert = await driver.switchTo().alert();
                let alertText = await alert.getText();
                console.log(`✓ JavaScript alert triggered!`);
                console.log(`  Message: "${alertText}"`);
                await takeScreenshot(driver, 'js_alert_validation.png');
                await alert.accept();
                console.log('✓ Alert accepted successfully');
            } catch (e) {
                console.log('⚠ No custom JavaScript alert - might use HTML5 validation');
                await takeScreenshot(driver, 'js_html5_validation.png');
            }
        } catch (e) {
            console.log(`⚠ Could not test form submission: ${e.message}`);
        }
        
        await driver.sleep(500);
        
        // Test 4: Test Reset Button
        console.log('\n--- Test: Reset Button ---');
        try {
            // First, fill some fields
            let emailField = await driver.findElement(By.name('email'));
            await emailField.clear();
            await emailField.sendKeys('test@example.com');
            
            let phoneField = await driver.findElement(By.name('phone'));
            await phoneField.clear();
            await phoneField.sendKeys('0412345678');
            
            console.log('✓ Filled some fields with test data');
            await takeScreenshot(driver, 'js_before_reset.png');
            await driver.sleep(500);
            
            // Find and click reset button
            let resetBtn = await driver.findElement(By.css('input[type="reset"], button[type="reset"]'));
            await driver.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", resetBtn);
            await driver.sleep(500);
            
            try {
                await resetBtn.click();
            } catch (e) {
                console.log('  Using JavaScript click for reset button...');
                await driver.executeScript("arguments[0].click();", resetBtn);
            }
            
            await driver.sleep(500);
            console.log('✓ Reset button clicked');
            await takeScreenshot(driver, 'js_after_reset.png');
            
            // Verify fields are cleared
            let emailValue = await emailField.getAttribute('value');
            let phoneValue = await phoneField.getAttribute('value');
            
            if (emailValue === '' && phoneValue === '') {
                console.log('✓ Reset button successfully cleared form fields');
            } else {
                console.log(`⚠ Fields not fully cleared - email: "${emailValue}", phone: "${phoneValue}"`);
            }
        } catch (e) {
            console.log(`⚠ Reset button test failed: ${e.message}`);
        }
        
        // Test 5: Test Custom Buttons (if any)
        console.log('\n--- Test: Custom Button Click Events ---');
        try {
            let customButtons = await driver.findElements(By.css('button[type="button"], input[type="button"]'));
            console.log(`✓ Found ${customButtons.length} custom button(s)`);
            
            for (let i = 0; i < customButtons.length; i++) {
                try {
                    let button = customButtons[i];
                    let buttonText = await button.getText() || await button.getAttribute('value') || 'unnamed';
                    
                    // Scroll into view
                    await driver.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", button);
                    await driver.sleep(500);
                    
                    console.log(`  Testing button ${i+1}: "${buttonText}"`);
                    await takeScreenshot(driver, `js_button_${i+1}_before.png`);
                    
                    // Click using JavaScript
                    await driver.executeScript("arguments[0].click();", button);
                    await driver.sleep(1000);
                    
                    // Check for alert
                    try {
                        let alert = await driver.switchTo().alert();
                        let alertText = await alert.getText();
                        console.log(`  ✓ Button triggered alert: "${alertText}"`);
                        await takeScreenshot(driver, `js_button_${i+1}_alert.png`);
                        await alert.accept();
                    } catch (e) {
                        console.log(`  ✓ Button clicked (no alert)`);
                        await takeScreenshot(driver, `js_button_${i+1}_after.png`);
                    }
                } catch (e) {
                    console.log(`  ⚠ Could not test button ${i+1}: ${e.message}`);
                }
            }
        } catch (e) {
            console.log(`⚠ Custom button test failed: ${e.message}`);
        }
        
        // Test 6: Test Radio Buttons with JavaScript validation
        console.log('\n--- Test: Radio Button Selection ---');
        try {
            let radios = await driver.findElements(By.css('input[type="radio"]'));
            console.log(`✓ Found ${radios.length} radio button(s)`);
            
            if (radios.length > 0) {
                // Get the name attribute to group them
                let radioName = await radios[0].getAttribute('name');
                console.log(`  Radio group name: "${radioName}"`);
                
                // Click first radio
                await driver.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", radios[0]);
                await driver.sleep(300);
                await driver.executeScript("arguments[0].click();", radios[0]);
                console.log(`  ✓ Selected radio button 1`);
                await takeScreenshot(driver, 'js_radio_selected.png');
                
                // Verify it's checked
                let isChecked = await radios[0].isSelected();
                console.log(`  ✓ Radio button is checked: ${isChecked}`);
            }
        } catch (e) {
            console.log(`⚠ Radio button test failed: ${e.message}`);
        }
        
        // Test 7: Test form validation function existence
        console.log('\n--- Test: JavaScript Validation Functions ---');
        try {
            let hasValidateFunction = await driver.executeScript(`
                return typeof validate !== 'undefined' || 
                       typeof validateForm !== 'undefined' || 
                       typeof checkForm !== 'undefined';
            `);
            
            if (hasValidateFunction) {
                console.log('✓ Form validation function detected in JavaScript');
            } else {
                console.log('⚠ No obvious validation function found (might be anonymous or inline)');
            }
            
            // Check for onsubmit attribute
            let forms = await driver.findElements(By.css('form'));
            for (let i = 0; i < forms.length; i++) {
                let onsubmit = await forms[i].getAttribute('onsubmit');
                if (onsubmit) {
                    console.log(`✓ Form ${i+1} has onsubmit handler: ${onsubmit.substring(0, 50)}...`);
                }
            }
        } catch (e) {
            console.log(`⚠ Could not check validation functions: ${e.message}`);
        }
        
        console.log('\n✓ JavaScript function tests completed!\n');
        
    } catch (error) {
        console.error('✗ Test failed:', error);
        await takeScreenshot(driver, 'js_test_error.png');
    } finally {
        await driver.quit();
    }
}

testJavaScript();
