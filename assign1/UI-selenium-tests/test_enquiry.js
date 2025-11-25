const { Builder, By, until, Key } = require('selenium-webdriver');
const fs = require('fs');
const path = require('path');
const { getFileUrl, SCREENSHOT_DIR } = require('./selenium-utils');

function takeScreenshot(driver, filename) {
  return driver.takeScreenshot().then(data => {
    const out = path.join(SCREENSHOT_DIR, filename);
    fs.writeFileSync(out, data, 'base64');
    console.log('Saved screenshot:', out);
  });
}

async function safeFind(driver, locator, timeout = 2000) {
  try {
    await driver.wait(until.elementLocated(locator), timeout);
    const el = await driver.findElement(locator);
    return el;
  } catch {
    return null;
  }
}

(async function enquiryTest() {
  const browser = (process.env.BROWSER || 'chrome').toLowerCase();
  let driver;
  try {
    driver = await new Builder().forBrowser(browser).build();
    const url = getFileUrl('enquiry.html');
    console.log('Loading:', url);
    await driver.get(url);
    await driver.sleep(800);

    // Initial screenshot
    await takeScreenshot(driver, 'enquiry_initial.png');

    // Try click submit to trigger JS alert or HTML5 validation
    try {
      const submit = await safeFind(driver, By.css('input[type="submit"], button[type="submit"]'));
      if (submit) {
        await submit.click().catch(() => {});
        // wait briefly for an alert
        try {
          await driver.wait(until.alertIsPresent(), 1500);
          const alert = await driver.switchTo().alert();
          console.log('Alert text:', await alert.getText());
          await takeScreenshot(driver, 'enquiry_empty_alert.png');
          await alert.accept();
        } catch {
          console.log('No JS alert on empty submit (HTML5 validation likely)');
          await takeScreenshot(driver, 'enquiry_empty_validation.png');
        }
      } else {
        console.log('Submit button not found');
      }
    } catch (e) {
      console.log('Submit attempt error:', e.message);
    }

    // Fill form fields (adjust names if your form differs)
    const fields = {
      firstname: 'Jane',
      lastname: 'Smith',
      email: 'jane.smith@example.com',
      phone: '0498765432',
      subject: 'Product Enquiry'
    };

    for (const [name, value] of Object.entries(fields)) {
      try {
        const el = await safeFind(driver, By.name(name), 1000);
        if (el) {
          await el.clear();
          await el.sendKeys(value);
          console.log(`Filled ${name}`);
        } else {
          console.log(`Field not found: ${name}`);
        }
      } catch (e) {
        console.log(`Error filling ${name}:`, e.message);
      }
    }

    // textarea
    try {
      const textarea = await driver.findElements(By.css('textarea'));
      if (textarea.length > 0) {
        await textarea[0].clear();
        await textarea[0].sendKeys('This is a test enquiry.\nThanks.');
        console.log('Textarea filled');
      }
    } catch (e) {}

    await driver.sleep(500);
    await takeScreenshot(driver, 'enquiry_filled.png');

    // Try final submit
    try {
      const submit = await safeFind(driver, By.css('input[type="submit"], button[type="submit"]'));
      if (submit) {
        await submit.click().catch(() => {});
        // capture alert or wait for page change briefly
        try {
          await driver.wait(until.alertIsPresent(), 1500);
          const alert = await driver.switchTo().alert();
          console.log('Submit alert:', await alert.getText());
          await takeScreenshot(driver, 'enquiry_submit_alert.png');
          await alert.accept();
        } catch {
          console.log('No JS alert on submit (may have navigated or used form action)');
          await takeScreenshot(driver, 'enquiry_after_submit.png');
        }
      }
    } catch (e) {
      console.log('Final submit error:', e.message);
    }
  } catch (err) {
    console.error('Enquiry test error:', err);
  } finally {
    if (driver) await driver.quit();
  }
})();