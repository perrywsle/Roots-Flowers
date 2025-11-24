const { Builder, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function testForms() {
    let options = new chrome.Options();
    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();
    
    try {
        console.log('Testing enquiry form...');
        
        await driver.get('file:///home/perry/COS10005/assign1/enquiry.html');
        await driver.sleep(1000);
        
        // Fill in form fields (adjust selectors based on your actual form)
        await driver.findElement(By.name('firstname')).sendKeys('John');
        await driver.findElement(By.name('lastname')).sendKeys('Doe');
        await driver.findElement(By.name('email')).sendKeys('john@example.com');
        
        console.log('✓ Form filled successfully');
        
        // You can add more field tests here
        
        console.log('✓ Form test passed!');
        
    } catch (error) {
        console.error('✗ Form test failed:', error);
    } finally {
        await driver.quit();
    }
}

testForms();
