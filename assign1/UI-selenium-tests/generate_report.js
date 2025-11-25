/**
 * Cross-platform test report generator
 * - Finds images in ./screenshots (relative to this file)
 * - Produces test_report.html next to this script
 * - Safe on Windows and Linux (handles spaces, backslashes)
 *
 * Usage:
 *   node generate_report.js
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const SCRIPT_DIR = __dirname;
const SCREENSHOTS_DIR = path.resolve(SCRIPT_DIR, 'screenshots');
const OUT_FILE = path.resolve(SCRIPT_DIR, 'test_report.html');

function toWebPath(fsPath) {
  // Convert filesystem path to a web-friendly relative path from OUT_FILE location
  const rel = path.relative(path.dirname(OUT_FILE), fsPath);
  return rel.split(path.sep).join('/'); // use forward slashes for HTML
}

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  console.error(`Screenshots directory not found: ${SCREENSHOTS_DIR}`);
  console.error('Please run your tests first so screenshots are available.');
  process.exit(1);
}

const files = fs.readdirSync(SCREENSHOTS_DIR, { withFileTypes: true })
  .filter(d => d.isFile() && /\.(png|jpe?g|gif|webp)$/i.test(d.name))
  .map(d => d.name)
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

const screenshots = files.map(name => {
  const full = path.join(SCREENSHOTS_DIR, name);
  const stats = fs.statSync(full);
  return {
    name,
    full,
    webPath: toWebPath(full),
    sizeKB: (stats.size / 1024).toFixed(2),
    mtime: stats.mtime.toISOString()
  };
});

// Grouping convenience (by prefix before first underscore or first hyphen)
function groupScreenshots(list) {
  const groups = {};
  for (const s of list) {
    // try common prefixes like 'register_', 'enquiry_', etc.
    const match = s.name.match(/^([a-zA-Z0-9\-]+)[\-_]/);
    const key = match ? match[1] : 'misc';
    if (!groups[key]) groups[key] = [];
    groups[key].push(s);
  }
  return groups;
}

const groups = groupScreenshots(screenshots);

// Minimal HTML escape
function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const now = new Date();

const htmlParts = [];

htmlParts.push(`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Test Report</title>
<style>
  body { font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 0; background: #f4f6f8; color: #222; }
  .container { max-width: 1200px; margin: 24px auto; background: #fff; border-radius: 8px; box-shadow: 0 6px 30px rgba(0,0,0,0.08); overflow: hidden; }
  header { padding: 20px 30px; background: linear-gradient(90deg,#2b8aef,#6c63ff); color: #fff; }
  header h1 { margin: 0; font-size: 20px; }
  header p { margin: 6px 0 0; font-size: 13px; opacity: 0.9; }
  .stats { display:flex; gap:12px; padding:16px 24px; flex-wrap:wrap; }
  .stat { background:#fafafa; padding:10px 14px; border-radius:6px; border:1px solid #eee; font-size:13px; }
  main { padding: 20px 24px; }
  .group { margin-bottom: 30px; }
  .group h2 { margin: 0 0 12px 0; font-size:16px; color:#333; border-bottom:2px solid #e9eef8; padding-bottom:8px; display:flex; align-items:center; gap:10px;}
  .grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:12px; }
  .card { background:#fff; border-radius:6px; overflow:hidden; border:1px solid #eee; box-shadow:0 6px 16px rgba(11,22,39,0.03); }
  .card img { width:100%; height:160px; object-fit:cover; display:block; background:#ddd; }
  .card .meta { padding:8px 10px; display:flex; justify-content:space-between; align-items:center; gap:8px; font-size:12px; color:#555; }
  footer { background:#fafafa; padding:12px 24px; font-size:12px; color:#666; border-top:1px solid #eee; }
  .no-screens { padding:20px; color:#666; font-style:italic; }
  @media (max-width:600px) {
    .card img { height:120px; }
  }
</style>
</head>
<body>
<div class="container">
  <header>
    <h1>Automated Test Report</h1>
    <p>Generated: ${now.toLocaleString()} — Host: ${esc(os.hostname())} — Node: ${esc(process.version)}</p>
  </header>
  <div class="stats">
    <div class="stat">Screenshots: <strong>${screenshots.length}</strong></div>
    <div class="stat">Groups: <strong>${Object.keys(groups).length}</strong></div>
    <div class="stat">Platform: <strong>${esc(os.type())} ${esc(os.release())}</strong></div>
    <div class="stat">Report: <strong>${esc(path.basename(OUT_FILE))}</strong></div>
  </div>
  <main>
`);

if (screenshots.length === 0) {
  htmlParts.push(`<div class="no-screens">No screenshots found in ${esc(SCREENSHOTS_DIR)}.</div>`);
} else {
  for (const [groupName, items] of Object.entries(groups)) {
    htmlParts.push(`<div class="group"><h2>${esc(groupName)}</h2><div class="grid">`);
    for (const item of items) {
      htmlParts.push(`
        <div class="card">
          <a href="${esc(item.webPath)}" target="_blank" rel="noopener">
            <img src="${esc(item.webPath)}" alt="${esc(item.name)}">
          </a>
          <div class="meta">
            <div>${esc(item.name)}</div>
            <div>${esc(item.sizeKB)} KB</div>
          </div>
        </div>
      `);
    }
    htmlParts.push(`</div></div>`);
  }
}

htmlParts.push(`
  </main>
  <footer>
    Report generated by generate_report.js — Screenshots directory: ${esc(SCREENSHOTS_DIR)}
  </footer>
</div>
</body>
</html>
`);

// Write out file atomically
try {
  fs.writeFileSync(OUT_FILE + '.tmp', htmlParts.join(''), { encoding: 'utf8' });
  fs.renameSync(OUT_FILE + '.tmp', OUT_FILE);
  console.log('✓ Test report written to:', OUT_FILE);
} catch (err) {
  console.error('✗ Failed to write report:', err);
  process.exit(2);
}