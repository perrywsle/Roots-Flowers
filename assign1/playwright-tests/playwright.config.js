const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 60_000,
  fullyParallel: false,
  workers: 1, // run sequentially to avoid opening many windows at once
  reporter: [['html', { outputFolder: 'test-results', open: 'never' }], ['list']],

  use: {
    headless: false,           // change to true for CI / headless runs
    viewport: null,            // use full browser window
    launchOptions: {
      args: ['--start-maximized']
    },
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
    actionTimeout: 10_000,
    navigationTimeout: 30_000
  },

  projects: [
    {
      name: 'firefox',
      use: { 
        browserName: 'firefox',
        headless: false, 
        viewport: null,
        launchOptions: {
          args: ['--start-maximized']
        }
      }
    },
    {
      name: 'chromium',
      use: { 
        browserName: 'chromium',
        headless: false, 
        viewport: null,
        launchOptions: {
          args: ['--start-maximized']
        }
      }
    }
  ]
});