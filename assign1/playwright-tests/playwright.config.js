const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
    testDir: './tests',
    
    // Run tests sequentially (one at a time)
    fullyParallel: false,
    workers: 1,
    
    // Test timeout
    timeout: 30000,
    
    // Default to headed mode (visible browser)
    use: {
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        trace: 'on-first-retry',
        headless: false,
        slowMo: 100,
        
        // Set viewport to full HD
        viewport: { width: 1920, height: 1080 },
        
        // Launch browser maximized
        launchOptions: {
            args: ['--start-maximized']
        },
    },
    
    // Reporter configuration
    reporter: [
        ['html', { outputFolder: 'test-results', open: 'never' }],
        ['list']
    ],
    
    // Single browser project
    projects: [
        {
            name: 'firefox',
            use: { 
                ...devices['Desktop Firefox'],
                headless: false,
                viewport: { width: 1920, height: 1080 },
                launchOptions: {
                    args: ['--start-maximized']
                },
            },
        },
    ],
});
