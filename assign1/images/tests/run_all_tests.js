const { execSync } = require('child_process');
const fs = require('fs');

// Create screenshots directory if it doesn't exist
if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots');
    console.log('✓ Created screenshots directory\n');
}

const tests = [
    { file: 'test_homepage.js', name: 'Homepage Test' },
    { file: 'test_navigation.js', name: 'Navigation Test' },
    { file: 'test_register.js', name: 'Registration Form Test' },
    { file: 'test_enquiry.js', name: 'Enquiry Form Test (Basic)' },
    { file: 'test_enquiry_enhanced.js', name: 'Enquiry Form Test (Enhanced)' },
    { file: 'test_javascript.js', name: 'JavaScript Functions Test' }
];

console.log('========================================');
console.log('Running All Selenium Tests');
console.log('Date:', new Date().toISOString());
console.log('========================================\n');

let passed = 0;
let failed = 0;
let results = [];

tests.forEach(test => {
    try {
        console.log(`\n>>> Running ${test.name}...`);
        execSync(`node ${test.file}`, { stdio: 'inherit' });
        passed++;
        results.push({ test: test.name, status: 'PASSED' });
    } catch (error) {
        console.error(`\n✗ ${test.name} failed`);
        failed++;
        results.push({ test: test.name, status: 'FAILED' });
    }
});

console.log('\n========================================');
console.log('Test Summary');
console.log('========================================');
results.forEach(r => {
    let icon = r.status === 'PASSED' ? '✓' : '✗';
    console.log(`${icon} ${r.test}: ${r.status}`);
});
console.log('========================================');
console.log(`Total: ${tests.length}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log('========================================');

// Count screenshots
try {
    const screenshots = fs.readdirSync('screenshots').filter(f => f.endsWith('.png'));
    console.log(`\n📸 Screenshots captured: ${screenshots.length}`);
    console.log(`   Location: tests/screenshots/\n`);
} catch (e) {
    // ignore
}

// Generate HTML report
console.log('Generating HTML test report...');
try {
    execSync('node generate_report.js', { stdio: 'inherit' });
    console.log('\n🎉 Open test_report.html in your browser to view the results!\n');
} catch (e) {
    console.log('⚠ Could not generate report');
}
