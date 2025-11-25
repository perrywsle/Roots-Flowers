/**
 * run_all_selenium.js
 * - Runs the selenium test files (spawnSync, no shell quoting)
 * - Collects screenshots from selenium and optional Playwright screenshots
 * - Copies them into parent ./screenshots (next to generate_report.js)
 * - Runs generate_report.js (if present) to produce test_report.html
 *
 * Place this file in: assign1/selenium-tests/run_all_selenium.js
 * Run from project root or directly:
 *   node selenium-tests/run_all_selenium.js
 *
 * To run tests in a specific browser:
 *   Linux/mac:   BROWSER=firefox node selenium-tests/run_all_selenium.js
 *   PowerShell:  $env:BROWSER='firefox'; node selenium-tests/run_all_selenium.js
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const tests = [
  'test_homepage.js',
  'test_navigation.js',
  'test_enquiry.js',
  'test_register.js',
  'test_javascript.js',
  'test_forms.js',
  'test_enquiry_enhanced.js'
];

const seleniumDir = __dirname; // this file's folder (selenium-tests)
const seleniumScreenshots = path.join(seleniumDir, '..', 'screenshots'); // assign1/selenium-screenshots
const playwrightScreenshots = path.join(seleniumDir, '..', 'playwright-tests', 'tests', 'screenshots'); // optional
const unifiedScreenshots = path.join(seleniumDir, '..', 'screenshots'); // assign1/screenshots (generate_report.js expects this)
const generateReportScript = path.join(seleniumDir, '.', 'generate_report.js');

function safeSpawn(cmd, args, options = {}) {
  console.log(`\n> ${cmd} ${args.map(a => `"${a}"`).join(' ')}`);
  const res = spawnSync(cmd, args, { stdio: 'inherit', ...options });
  if (res.error) {
    console.error('spawn error:', res.error);
    return { ok: false, code: res.status || 1 };
  }
  return { ok: res.status === 0, code: res.status };
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function copyScreenshots(srcDir, destDir, prefix = '') {
  if (!fs.existsSync(srcDir)) return 0;
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  let copied = 0;
  for (const ent of entries) {
    if (!ent.isFile()) continue;
    const ext = path.extname(ent.name).toLowerCase();
    if (!['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(ext)) continue;
    const src = path.join(srcDir, ent.name);
    const destName = prefix ? `${prefix}_${ent.name}` : ent.name;
    const dest = path.join(destDir, destName);
    try {
      fs.copyFileSync(src, dest);
      copied++;
    } catch (e) {
      console.warn('Failed to copy', src, '->', dest, e.message);
    }
  }
  return copied;
}

// Run tests
(async () => {
  console.log('Selenium test runner - root selenium-tests:', seleniumDir);
  console.log('Node executable:', process.execPath);
  console.log('Selenium screenshots dir:', seleniumScreenshots);
  console.log('Playwright screenshots dir (optional):', playwrightScreenshots);
  console.log('Unified screenshots dir (will be created/overwritten):', unifiedScreenshots);

  let passed = 0;
  let failed = 0;

  for (const t of tests) {
    const fullPath = path.join(seleniumDir, t);
    if (!fs.existsSync(fullPath)) {
      console.warn(`Skipping ${t} (file not found): ${fullPath}`);
      failed++;
      continue;
    }

    console.log(`\n=== Running ${t} ===`);
    const res = spawnSync(process.execPath, [fullPath], { stdio: 'inherit' });

    if (res.error) {
      console.error(`Test ${t} failed to start:`, res.error.message);
      failed++;
      continue;
    }

    if (res.status === 0) {
      console.log(`Test ${t} passed`);
      passed++;
    } else {
      console.error(`Test ${t} failed (exit code: ${res.status})`);
      failed++;
    }
  }

  console.log(`\nTest summary: Passed: ${passed}, Failed: ${failed}`);

  // Prepare unified screenshots folder (clean)
  try {
    if (fs.existsSync(unifiedScreenshots)) {
      fs.rmSync(unifiedScreenshots, { recursive: true, force: true });
    }
  } catch (e) {
    console.warn('Warning: failed to remove old unified screenshots folder:', e.message);
  }
  ensureDir(unifiedScreenshots);

  // Copy selenium screenshots (prefix "sel")
  const selCopied = copyScreenshots(seleniumScreenshots, unifiedScreenshots, 'sel');
  console.log(`Copied ${selCopied} selenium screenshots into unified folder.`);

  // Copy playwright screenshots if exist (prefix "pw")
  const pwCopied = copyScreenshots(playwrightScreenshots, unifiedScreenshots, 'pw');
  if (pwCopied > 0) console.log(`Copied ${pwCopied} playwright screenshots into unified folder.`);

  // Run generate_report.js if present
  if (fs.existsSync(generateReportScript)) {
    console.log('\n=== Running generate_report.js to produce HTML report ===');
    const genRes = safeSpawn(process.execPath, [generateReportScript], { cwd: path.dirname(generateReportScript) });
    if (!genRes.ok) {
      console.error('generate_report.js failed (exit code: ' + genRes.code + ')');
    } else {
      console.log('Report generation completed successfully.');
    }
  } else {
    console.log('generate_report.js not found, skipping report generation.');
  }

  console.log('\n=== Complete ===');
  console.log('Unified screenshots:', unifiedScreenshots);
  const reportPath = path.join(path.dirname(generateReportScript), 'test_report.html');
  if (fs.existsSync(reportPath)) {
    console.log('Report:', reportPath);
  } else {
    console.log('No report generated (test_report.html not found).');
  }

  // Exit non-zero if any tests failed
  process.exit(failed > 0 ? 1 : 0);
})();