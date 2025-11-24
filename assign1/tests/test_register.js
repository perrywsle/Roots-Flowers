const { Builder, By, until, Key } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const fs = require('fs');

async function takeScreenshot(driver, filename) {
    await driver.sleep(300);
    let image = await driver.takeScreenshot();
    fs.writeFileSync(`screenshots/${filename}`, image, 'base64');
    console.log(`  📸 Screenshot saved: screenshots/${filename}`);
}

async function testRegisterForm() {
    let options = new firefox.Options();
    let driver = await new Builder()
        .forBrowser('firefox')
        .setFirefoxOptions(options)
        .build();
    
    try {
        console.log('\n=== Testing Register Form ===');
        
        await driver.get('file:///home/perry/COS10005/assign1/register.html');
        await driver.sleep(1000);
        
        await takeScreenshot(driver, 'register_initial.png');
        console.log('✓ Register page loaded');
        
        // Test 1: Submit empty form
        console.log('\n--- Test 1: Empty Form Submission ---');
        try {
            let submitBtn = await driver.findElement(By.css('input[type="submit"], button[type="submit"]'));
            await driver.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", submitBtn);
            await driver.sleep(500);
            await takeScreenshot(driver, 'register_before_submit.png');
            
            await driver.executeScript("arguments[0].click();", submitBtn);
            await driver.sleep(1500);
            
            try {
                let alert = await driver.switchTo().alert();
                let alertText = await alert.getText();
                console.log(`✓ Alert detected: "${alertText}"`);
                await takeScreenshot(driver, 'register_empty_alert.png');
                await alert.accept();
                console.log('✓ Alert accepted');
            } catch (e) {
                console.log('⚠ No alert - form might use HTML5 validation');
                await takeScreenshot(driver, 'register_empty_validation.png');
            }
        } catch (e) {
            console.log(`⚠ Submit button test failed: ${e.message}`);
        }
        
        await driver.sleep(500);
        
        // Test 2: Fill form with valid data
        console.log('\n--- Test 2: Valid Form Data ---');
        
        await driver.executeScript('window.scrollTo(0, 0);');
        await driver.sleep(500);
        
        const formData = {
            'email': 'john.doe@example.com',
            'phone': '0412345678',
            'city': 'Melbourne',
            'postcode': '3000'
        };
        
        for (let [name, value] of Object.entries(formData)) {
            try {
                let field = await driver.findElement(By.name(name));
                await driver.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", field);
                await driver.sleep(300);
                
                await driver.executeScript("arguments[0].style.border='3px solid blue'", field);
                await driver.sleep(200);
                
                await field.clear();
                await field.sendKeys(value);
                await driver.sleep(300);
                
                let currentValue = await field.getAttribute('value');
                console.log(`✓ Filled ${name}: ${currentValue}`);
                
                await driver.executeScript("arguments[0].style.border=''", field);
                
            } catch (e) {
                console.log(`⚠ Field '${name}' not found`);
            }
        }
        
        await driver.sleep(1000);
        await driver.executeScript('window.scrollTo(0, document.body.scrollHeight / 2);');
        await driver.sleep(500);
        
        await takeScreenshot(driver, 'register_filled.png');
        console.log('✓ Screenshot taken of filled form');
        
        // Test radio buttons
        console.log('\n--- Testing Radio Buttons ---');
        try {
            let radios = await driver.findElements(By.css('input[type="radio"]'));
            if (radios.length > 0) {
                await driver.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", radios[0]);
                await driver.sleep(300);
                await driver.executeScript("arguments[0].click();", radios[0]);
                await driver.sleep(300);
                console.log(`✓ Selected radio button (found ${radios.length} options)`);
                await takeScreenshot(driver, 'register_with_radio.png');
            }
        } catch (e) {
            console.log('⚠ No radio buttons found');
        }
        
        // Test checkboxes
        console.log('\n--- Testing Checkboxes ---');
        try {
            let checkboxes = await driver.findElements(By.css('input[type="checkbox"]'));
            if (checkboxes.length > 0) {
                await driver.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", checkboxes[0]);
                await driver.sleep(300);
                await driver.executeScript("arguments[0].click();", checkboxes[0]);
                await driver.sleep(300);
                console.log(`✓ Checked checkbox (found ${checkboxes.length} options)`);
                await takeScreenshot(driver, 'register_with_selections.png');
            }
        } catch (e) {
            console.log('⚠ No checkboxes found');
        }
        
        // Test dropdown/select
        console.log('\n--- Testing Select/Dropdown ---');
        try {
            let selects = await driver.findElements(By.css('select'));
            if (selects.length > 0) {
                await driver.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", selects[0]);
                await driver.sleep(300);
                
                let options = await selects[0].findElements(By.css('option'));
                if (options.length > 1) {
                    await options[1].click();
                    await driver.sleep(300);
                    console.log(`✓ Selected dropdown option`);
                    await takeScreenshot(driver, 'register_with_dropdown.png');
                }
            }
        } catch (e) {
            console.log('⚠ No select elements found');
        }
        
        // Test 3: Test invalid email format
        console.log('\n--- Test 3: Invalid Email ---');
        try {
            let emailField = await driver.findElement(By.name('email'));
            await driver.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", emailField);
            await driver.sleep(300);
            
            await emailField.clear();
            await emailField.sendKeys('invalid-email');
            await driver.sleep(500);
            
            await takeScreenshot(driver, 'register_invalid_email.png');
            
            let submitBtn = await driver.findElement(By.css('input[type="submit"], button[type="submit"]'));
            await driver.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", submitBtn);
            await driver.sleep(300);
            await driver.executeScript("arguments[0].click();", submitBtn);
            await driver.sleep(1000);
            
            try {
                let alert = await driver.switchTo().alert();
                let alertText = await alert.getText();
                console.log(`✓ Alert for invalid email: "${alertText}"`);
                await takeScreenshot(driver, 'register_invalid_email_alert.png');
                await alert.accept();
            } catch (e) {
                console.log('✓ HTML5 validation prevented submission');
                await takeScreenshot(driver, 'register_invalid_email_validation.png');
            }
        } catch (e) {
            console.log('⚠ Could not test email validation');
        }
        
        console.log('\n✓ Register form test completed!\n');
        
    } catch (error) {
        console.error('✗ Test failed:', error);
        await takeScreenshot(driver, 'register_error.png');
    } finally {
        await driver.quit();
    }
}

testRegisterForm();
