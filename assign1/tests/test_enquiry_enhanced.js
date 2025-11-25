/**
 * Enhanced Enquiry form test:
 * - improved alert handling
 * - detailed filling, submits, and validation checks
 * - captures screenshots and attempts to detect HTML5 validation messages
 *
 * Usage:
 *   node test_enquiry_enhanced.js
 *   BROWSER=firefox node test_enquiry_enhanced.js
 */
const { Builder, By, until } = require('selenium-webdriver');
const fs = require('fs');
const path = require('path');
const { getFileUrl, SCREENSHOT_DIR } = require('./selenium-utils');

async function takeScreenshot(driver, filename) {
  const data = await driver.takeScreenshot();
  const out = path.join(SCREENSHOT_DIR, filename);
  fs.writeFileSync(out, data, 'base64');
  console.log('Saved screenshot:', out);
}

async function safeFind(driver, locator, timeout = 2000) {
  try {
    await driver.wait(until.elementLocated(locator), timeout);
    return await driver.findElement(locator);
  } catch {
    return null;
  }
}

async function tryAlertCapture(driver, timeout = 1500) {
  try {
    await driver.wait(until.alertIsPresent(), timeout);
    const alert = await driver.switchTo().alert();
    const text = await alert.getText();
    await alert.accept();
    return text;
  } catch {
    return null;
  }
}

(async function enhancedEnquiry() {
  const browser = (process.env.BROWSER || 'chrome').toLowerCase();
  let driver;
  try {
    driver = await new Builder().forBrowser(browser).build();
    const url = getFileUrl('enquiry.html');
    console.log('Loading:', url);
    await driver.get(url);
    await driver.sleep(800);

    // initial screenshot
    await takeScreenshot(driver, 'enquiry_enhanced_initial.png');

    // 1) Attempt empty form submit -> alert or HTML5 validation
    try {
      // ensure dialog handler by polling for alerts after click
      const submit = await safeFind(driver, By.css('input[type="submit"], button[type="submit"]'));
      if (submit) {
        await submit.click().catch(() => {});
        const alertText = await tryAlertCapture(driver, 1200);
        if (alertText) {
          console.log('Empty submit alert:', alertText);
          await takeScreenshot(driver, 'enquiry_empty_alert.png');
        } else {
          // Attempt to detect the first invalid field and its validationMessage via JS
          try {
            const checkInvalid = await driver.executeScript(`
              const form = document.querySelector('form');
              if (!form) return null;
              const firstInvalid = form.querySelector(':invalid');
              return firstInvalid ? firstInvalid.name || firstInvalid.id || firstInvalid.tagName : null;
            `);
            console.log('First invalid element (name/id/tag):', checkInvalid);
            await takeScreenshot(driver, 'enquiry_empty_validation.png');
          } catch (e) {
            console.log('Could not detect invalid field via script:', e.message);
            await takeScreenshot(driver, 'enquiry_empty_validation.png');
          }
        }
      } else {
        console.log('Submit not found on enquiry page');
      }
    } catch (e) {
      console.log('Error during empty-submit check:', e.message);
    }

    // 2) Fill the form completely
    const data = {
      firstname: 'Jane',
      lastname: 'Smith',
      email: 'jane.smith@example.com',
      phone: '0498765432',
      subject: 'Product Enquiry'
    };

    for (const [name, value] of Object.entries(data)) {
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

    // fill textarea
    try {
      const t = await driver.findElements(By.css('textarea'));
      if (t.length > 0) {
        await t[0].clear();
        await t[0].sendKeys('Hello,\nI would like to enquire about bouquet options.\nThanks,\nJane');
        console.log('Filled textarea');
      }
    } catch (e) {}

    await driver.sleep(400);
    await takeScreenshot(driver, 'enquiry_completely_filled.png');

    // 3) Submit with valid data
    try {
      const submit = await safeFind(driver, By.css('input[type="submit"], button[type="submit"]'));
      if (submit) {
        await submit.click().catch(() => {});
        // capture alert if present, otherwise take screenshot after submit
        const alertText = await tryAlertCapture(driver, 1500);
        if (alertText) {
          console.log('Submit produced alert:', alertText);
          await takeScreenshot(driver, 'enquiry_submit_alert.png');
        } else {
          console.log('No JS alert on submit (may have navigated or used form action)');
          await driver.sleep(500);
          await takeScreenshot(driver, 'enquiry_after_submit.png');
        }
      } else {
        console.log('Submit not found for final submit');
      }
    } catch (e) {
      console.log('Error during submit:', e.message);
    }

    // 4) Reset button test
    try {
      // reload page, fill a field then click reset
      await driver.get(url);
      await driver.sleep(400);
      const email = await safeFind(driver, By.name('email'), 1000);
      if (email) {
        await email.clear();
        await email.sendKeys('reset@test.com');
      }
      const resetBtn = await safeFind(driver, By.css('input[type="reset"], button[type="reset"]'));
      if (resetBtn) {
        await resetBtn.click().catch(() => {});
        await driver.sleep(300);
        await takeScreenshot(driver, 'enquiry_after_reset.png');
        if (email) {
          const val = await email.getAttribute('value');
          console.log('Email after reset:', val);
        }
      } else {
        console.log('No reset button found on enquiry page');
      }
    } catch (e) {
      console.log('Reset test error:', e.message);
    }

  } catch (err) {
    console.error('Enhanced enquiry test error:', err);
  } finally {
    if (driver) await driver.quit();
  }
})();