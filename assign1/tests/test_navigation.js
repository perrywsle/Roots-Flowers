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

(async function navigationTest() {
  const browser = (process.env.BROWSER || 'chrome').toLowerCase();
  console.log('Browser:', browser);
  const pages = [
    { file: 'index.html', name: 'Homepage' },
    { file: 'product1.html', name: 'Product 1' },
    { file: 'product2.html', name: 'Product 2' },
    { file: 'enquiry.html', name: 'Enquiry' },
    { file: 'register.html', name: 'Register' },
    { file: 'profile.html', name: 'Profile' },
    { file: 'enhancement.html', name: 'Enhancement' },
    { file: 'enhancement2.html', name: 'Enhancement 2' },
    { file: 'promotion.html', name: 'Promotion' },
    { file: 'workshop.html', name: 'Workshop' },
    { file: 'acknowledgement.html', name: 'Acknowledgement' }
  ];

  let driver;
  try {
    driver = await new Builder().forBrowser(browser).build();

    for (const p of pages) {
      try {
        const url = getFileUrl(p.file);
        console.log(`Loading ${p.name}: ${url}`);
        await driver.get(url);

        // wait for title or body
        await driver.wait(until.elementLocated(By.css('body')), 5000).catch(() => {});
        await driver.sleep(700);

        const title = await driver.getTitle();
        console.log(`Title: ${title}`);

        const screenshotName = `${p.file.replace('.html', '')}.png`;
        await takeScreenshot(driver, screenshotName);
      } catch (err) {
        console.error(`Error on ${p.name}:`, err.message);
        await takeScreenshot(driver, `error_${p.file.replace('.html','')}.png`);
      }
    }
  } catch (err) {
    console.error('Navigation test error:', err);
  } finally {
    if (driver) await driver.quit();
  }
})();