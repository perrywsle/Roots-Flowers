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

async function findVisible(elements) {
  const visible = [];
  for (const el of elements) {
    try {
      if (await el.isDisplayed()) visible.push(el);
    } catch {}
  }
  return visible;
}

(async function registerTest() {
  const browser = (process.env.BROWSER || 'chrome').toLowerCase();
  let driver;
  try {
    driver = await new Builder().forBrowser(browser).build();
    const url = getFileUrl('register.html');
    console.log('Loading:', url);
    await driver.get(url);
    await driver.sleep(800);

    await takeScreenshot(driver, 'register_initial.png');

    // Try filling common fields
    const fields = {
      email: 'selenium@test.com',
      phone: '0412345678',
      city: 'Melbourne',
      postcode: '3000'
    };

    for (const [name, value] of Object.entries(fields)) {
      try {
        const els = await driver.findElements(By.name(name));
        if (els.length > 0) {
          await els[0].clear();
          await els[0].sendKeys(value);
          console.log(`Filled ${name}`);
        } else {
          console.log(`Field not found: ${name}`);
        }
      } catch (e) {
        console.log(`Error filling ${name}:`, e.message);
      }
    }

    await driver.sleep(400);
    await takeScreenshot(driver, 'register_filled.png');

    // Radio buttons
    try {
      const radios = await driver.findElements(By.css('input[type="radio"]'));
      const visibleRadios = await findVisible(radios);
      if (visibleRadios.length > 0) {
        await visibleRadios[0].click();
        console.log('Selected radio button');
        await takeScreenshot(driver, 'register_radio_selected.png');
      } else {
        console.log('No visible radios to select');
      }
    } catch (e) {
      console.log('Radio error:', e.message);
    }

    // Checkboxes
    try {
      const boxes = await driver.findElements(By.css('input[type="checkbox"]'));
      const visibleBoxes = await findVisible(boxes);
      if (visibleBoxes.length > 0) {
        await visibleBoxes[0].click();
        console.log('Checked first visible checkbox');
        await takeScreenshot(driver, 'register_checkbox.png');
      } else {
        console.log('No visible checkboxes found');
      }
    } catch (e) {
      console.log('Checkbox error:', e.message);
    }

    // Select (dropdown) - choose first non-disabled option if exists
    try {
      const selects = await driver.findElements(By.css('select'));
      if (selects.length > 0) {
        const options = await selects[0].findElements(By.css('option'));
        for (const opt of options) {
          const val = await opt.getAttribute('value');
          const disabled = await opt.getAttribute('disabled');
          if (val && !disabled) {
            await opt.click();
            console.log('Selected dropdown option');
            break;
          }
        }
        await takeScreenshot(driver, 'register_dropdown.png');
      }
    } catch (e) {
      console.log('Select error:', e.message);
    }

    // Invalid email test
    try {
      const emailEls = await driver.findElements(By.name('email'));
      if (emailEls.length > 0) {
        await emailEls[0].clear();
        await emailEls[0].sendKeys('invalid-email');
        await driver.sleep(300);
        await takeScreenshot(driver, 'register_invalid_email.png');

        // try submit
        const submit = await driver.findElements(By.css('input[type="submit"], button[type="submit"]'));
        if (submit.length > 0) {
          await submit[0].click().catch(() => {});
          try {
            await driver.wait(until.alertIsPresent(), 1500);
            const alert = await driver.switchTo().alert();
            console.log('Alert on invalid email:', await alert.getText());
            await takeScreenshot(driver, 'register_invalid_email_alert.png');
            await alert.accept();
          } catch {
            console.log('No JS alert after invalid email submit (HTML5 validation likely)');
            await takeScreenshot(driver, 'register_invalid_email_validation.png');
          }
        }
      }
    } catch (e) {
      console.log('Invalid email test error:', e.message);
    }
  } catch (err) {
    console.error('Register test error:', err);
  } finally {
    if (driver) await driver.quit();
  }
})();