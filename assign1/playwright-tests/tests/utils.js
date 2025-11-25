// cross-platform helpers for file:// URLs and screenshots
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

const TEST_ROOT = path.resolve(__dirname, '..', '..'); // assign1 root
const SCREENSHOT_DIR = path.join(__dirname, '..', 'screenshots');

function getFileUrl(filename) {
  const filePath = path.join(TEST_ROOT, filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  return pathToFileURL(filePath).href;
}

function ensureScreenshotsDir() {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }
  return SCREENSHOT_DIR;
}

module.exports = { TEST_ROOT, getFileUrl, ensureScreenshotsDir, SCREENSHOT_DIR };