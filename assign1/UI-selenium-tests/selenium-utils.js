// cross-platform utilities for Selenium Node tests
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

const ROOT = path.resolve(__dirname, '..'); // assign1 root (selenium-tests sits in assign1/selenium-tests)
const SCREENSHOT_DIR = path.join(ROOT, 'tests/screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

function getFileUrl(filename) {
  const filePath = path.join(ROOT, filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  return pathToFileURL(filePath).href;
}

module.exports = { getFileUrl, SCREENSHOT_DIR };