const { Builder, By, until } = require('selenium-webdriver');
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

async function tryAlertCapture(driver, timeout = 1500) {
  try {
    await driver.wait(until.alertIsPresent(), timeout);
    const alert = await driver.switchTo().alert();
    const msg = await alert.getText();
    await takeScreenshot(driver, 'js_alert_captured.png');
    await alert.accept();
    return msg;
  } catch {
    return null;
  }
}

(async function jsTest() {
  const browser = (process.env.BROWSER || 'chrome').toLowerCase();
  let driver;
  try {
    driver = await new Builder().forBrowser(browser).build();
    const url = getFileUrl('register.html');
    console.log('Loading:', url);
    await driver.get(url);
    await driver.sleep(700);
    await takeScreenshot(driver, 'js_register_initial.png');

    // External scripts
    try {
      const scripts = await driver.findElements(By.css('script[src]'));
      console.log('External scripts found:', scripts.length);
    } catch (e) {
      console.log('Script detection error:', e.message);
    }

    // Click submit with dialog handler expectation
    try {
      const submit = await driver.findElement(By.css('input[type="submit"], button[type="submit"]'));
      await submit.click().catch(() => {});
      const alertMsg = await tryAlertCapture(driver, 1500);
      if (alertMsg) {
        console.log('Alert triggered:', alertMsg);
      } else {
        console.log('No JS alert on submit (HTML5 validation may block)');
      }
    } catch (e) {
      console.log('Submit click error:', e.message);
    }

    // Reset button
    try {
      // fill something then reset
      const emailEls = await driver.findElements(By.name('email'));
      if (emailEls.length > 0) {
        await emailEls[0].clear();
        await emailEls[0].sendKeys('test@example.com');
        console.log('Filled email for reset test');
      }

      const resetEls = await driver.findElements(By.css('input[type="reset"], button[type="reset"]'));
      if (resetEls.length > 0) {
        await resetEls[0].click().catch(() => {});
        await driver.sleep(300);
        await takeScreenshot(driver, 'js_after_reset.png');

        // verify cleared
        if (emailEls.length > 0) {
          const val = await emailEls[0].getAttribute('value');
          console.log('Email after reset:', val);
        }
      } else {
        console.log('No reset button found');
      }
    } catch (e) {
      console.log('Reset test error:', e.message);
    }

    // Click other buttons (input[type=button], button)
    try {
      const buttons = await driver.findElements(By.css('button, input[type="button"]'));
      for (let i = 0; i < Math.min(buttons.length, 5); i++) {
        try {
          await buttons[i].click().catch(() => {});
          await driver.sleep(300);
          const alertMsg = await tryAlertCapture(driver, 800);
          console.log(`Clicked button ${i + 1}, alert:`, alertMsg);
        } catch (e) {
          console.log('Button click error:', e.message);
        }
      }
    } catch (e) {
      console.log('Buttons detection error:', e.message);
    }
  } catch (err) {
    console.error('JS test error:', err);
  } finally {
    if (driver) await driver.quit();
  }
})();