const { Builder, By } = require('selenium-webdriver');
const fs = require('fs');
const path = require('path');
const { getFileUrl, SCREENSHOT_DIR } = require('./selenium-utils');

(async function homepage() {
  // Browser choice via env var BROWSER=firefox|chrome (default chrome)
  const browser = (process.env.BROWSER || 'chrome').toLowerCase();
  const headless = process.env.HEADLESS === '1' || process.env.HEADLESS === 'true';

  let builder = new Builder().forBrowser(browser);

  // optional: set headless for chrome via ChromeOptions if needed
  try {
    const driver = await builder.build();
    try {
      const url = getFileUrl('index.html');
      console.log('Loading:', url);
      await driver.get(url);

      await driver.sleep(1000);
      const title = await driver.getTitle();
      console.log('Title:', title);

      const img = await driver.takeScreenshot();
      const outPath = path.join(SCREENSHOT_DIR, 'selenium_homepage.png');
      fs.writeFileSync(outPath, img, 'base64');
      console.log('Saved screenshot:', outPath);
    } finally {
      await driver.quit();
    }
  } catch (err) {
    console.error('Selenium error:', err);
  }
})();