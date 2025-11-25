/**
 * General forms tests (register + enquiry)
 * - empty submit -> detect alert or HTML5 validation
 * - fill fields -> take screenshot
 * - invalid email -> detect alert or HTML5 validation
 * - reset button -> verify cleared
 *
 * Usage:
 *   node test_forms.js
 *   BROWSER=firefox node test_forms.js           # linux/mac
 *   $env:BROWSER='firefox'; node test_forms.js  # PowerShell
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

(async function formsTest() {
  const browser = (process.env.BROWSER || 'chrome').toLowerCase();
  let driver;
  try {
    driver = await new Builder().forBrowser(browser).build();

    // LIST OF FORMS TO TEST
    const forms = [
      { file: 'register.html', name: 'Register' },
      { file: 'enquiry.html', name: 'Enquiry' }
    ];

    for (const f of forms) {
      try {
        const url = getFileUrl(f.file);
        console.log(`\n=== Testing ${f.name}: ${url}`);
        await driver.get(url);
        await driver.sleep(700);

        // initial screenshot
        await takeScreenshot(driver, `${f.file.replace('.html','')}_initial.png`);

        // 1) Empty submit -> alert or HTML5 validation
        try {
          const submit = await safeFind(driver, By.css('input[type="submit"], button[type="submit"]'), 1000);
          if (submit) {
            await submit.click().catch(() => {});
            const alertText = await tryAlertCapture(driver, 1200);
            if (alertText) {
              console.log('Empty submit produced alert:', alertText);
              await takeScreenshot(driver, `${f.file.replace('.html','')}_empty_alert.png`);
            } else {
              console.log('No JS alert for empty submit (HTML5 validation may be active)');
              await takeScreenshot(driver, `${f.file.replace('.html','')}_empty_validation.png`);
            }
          } else {
            console.log('Submit not found for empty submit test');
          }
        } catch (e) {
          console.log('Error during empty submit test:', e.message);
        }

        // small pause
        await driver.sleep(300);

        // 2) Fill typical fields if present
        const fieldMap = {
          'register.html': {
            email: 'test.user@example.com',
            phone: '0412345678',
            city: 'Melbourne',
            postcode: '3000'
          },
          'enquiry.html': {
            firstname: 'Jane',
            lastname: 'Smith',
            email: 'jane.smith@example.com',
            phone: '0498765432',
            subject: 'Product Enquiry'
          }
        };

        const fields = fieldMap[f.file] || {};
        for (const [name, value] of Object.entries(fields)) {
          try {
            const els = await driver.findElements(By.name(name));
            if (els.length > 0) {
              await els[0].clear();
              await els[0].sendKeys(value);
              console.log(`Filled ${name} => ${value}`);
            } else {
              console.log(`Field "${name}" not found on ${f.file}`);
            }
          } catch (e) {
            console.log(`Error filling ${name}:`, e.message);
          }
        }

        // fill textarea if exists
        try {
          const textareas = await driver.findElements(By.css('textarea'));
          if (textareas.length > 0) {
            await textareas[0].clear();
            await textareas[0].sendKeys('Automated test message.\nRegards.');
            console.log('Filled textarea');
          }
        } catch (e) {}

        await driver.sleep(300);
        await takeScreenshot(driver, `${f.file.replace('.html','')}_filled.png`);

        // 3) Invalid email check (if email field present)
        try {
          const emailEls = await driver.findElements(By.name('email'));
          if (emailEls.length > 0) {
            await emailEls[0].clear();
            await emailEls[0].sendKeys('invalid-email');
            await driver.sleep(300);
            await takeScreenshot(driver, `${f.file.replace('.html','')}_invalid_email.png`);

            const submit = await safeFind(driver, By.css('input[type="submit"], button[type="submit"]'), 1000);
            if (submit) {
              await submit.click().catch(() => {});
              const alertText = await tryAlertCapture(driver, 1200);
              if (alertText) {
                console.log('Invalid email triggered alert:', alertText);
                await takeScreenshot(driver, `${f.file.replace('.html','')}_invalid_email_alert.png`);
              } else {
                console.log('No JS alert on invalid email (HTML5 may block submit)');
                await takeScreenshot(driver, `${f.file.replace('.html','')}_invalid_email_validation.png`);
              }
            }
          }
        } catch (e) {
          console.log('Invalid email test error:', e.message);
        }

        // 4) Reset button test (if present)
        try {
          // re-open page to reset to initial state for reset test
          await driver.get(url);
          await driver.sleep(300);

          // fill an input then reset
          const emailEls = await driver.findElements(By.name('email'));
          if (emailEls.length > 0) {
            await emailEls[0].clear();
            await emailEls[0].sendKeys('reset@test.com');
          }

          const resetEls = await driver.findElements(By.css('input[type="reset"], button[type="reset"]'));
          if (resetEls.length > 0) {
            await resetEls[0].click().catch(() => {});
            await driver.sleep(300);
            await takeScreenshot(driver, `${f.file.replace('.html','')}_after_reset.png`);
            if (emailEls.length > 0) {
              const val = await emailEls[0].getAttribute('value');
              console.log('Email after reset:', val);
            }
          } else {
            console.log('No reset button found on', f.file);
          }
        } catch (e) {
          console.log('Reset test error:', e.message);
        }

      } catch (err) {
        console.error(`Error testing ${f.name}:`, err.message);
        await takeScreenshot(driver, `error_${f.file.replace('.html','')}.png`);
      }
    } // end for forms
  } catch (err) {
    console.error('Forms test runner error:', err);
  } finally {
    if (driver) await driver.quit();
  }
})();