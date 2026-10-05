import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
if (!process.env.KNOWNFIX_PLAYWRIGHT_PATH) throw new Error('Provide an existing installed Playwright package path; no fetch fallback.');
const { chromium } = require(process.env.KNOWNFIX_PLAYWRIGHT_PATH);
const root = fileURLToPath(new URL('../', import.meta.url));
const data = JSON.parse(fs.readFileSync(path.join(root, 'free-skills.json'), 'utf8'));
let server;
let base = process.env.KNOWNFIX_SKILLS_SITE;
if (!base) {
  server = http.createServer((req, res) => {
    const pathname = new URL(req.url, 'http://localhost').pathname;
    const file = path.resolve(root, '.' + decodeURIComponent(pathname));
    if (!file.startsWith(root) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404).end(); return; }
    const type = file.endsWith('.png') ? 'image/png' : file.endsWith('.html') ? 'text/html' : 'text/plain';
    res.writeHead(200, { 'content-type': type });
    fs.createReadStream(file).pipe(res);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
}
const browser = await chromium.launch({ headless: true });
try {
  for (const [label, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844]]) {
    const context = await browser.newContext({ viewport: { width, height }, extraHTTPHeaders: { 'x-operator': '1' } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    // Inspect UI/download behavior without emitting production analytics or counter events.
    await page.route('https://knownfix-backend-28.b-hash88.deno.net/free-skill/*', route => {
      const id = new URL(route.request().url()).pathname.split('/').pop();
      const skill = data.skills.find(s => s.id === id);
      return route.fulfill({ status: skill ? 200 : 404, headers: { 'content-type': 'text/markdown', 'content-disposition': 'attachment; filename="SKILL.md"' }, body: skill?.body || '' });
    });
    if (process.env.KNOWNFIX_BOOKS_URL) {
      await page.goto(process.env.KNOWNFIX_BOOKS_URL);
      assert.equal(await page.locator('#workflow_activity tbody tr').count(), 4);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      if (process.env.KNOWNFIX_SCREENSHOT_DIR) await page.locator('#workflow_activity').screenshot({ path: path.join(process.env.KNOWNFIX_SCREENSHOT_DIR, `KnownFix_20261005_Workflow-Books-${label}_IMG.png`) });
      console.log(label + ': live Books workflow breakdown has four rows and no page overflow.');
    }
    await page.goto(base + '/free-skills.html');
    await page.getByRole('button', { name: 'No thanks', exact: true }).click();
    assert.equal(await page.getByRole('link', { name: 'Download SKILL.md', exact: true }).count(), 4);
    assert(await page.getByRole('heading', { name: 'MCP Connection Triage', exact: true }).isVisible());
    assert(await page.getByRole('heading', { name: 'Website Search Readiness', exact: true }).isVisible());
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    if (process.env.KNOWNFIX_SCREENSHOT_DIR) await page.screenshot({ path: path.join(process.env.KNOWNFIX_SCREENSHOT_DIR, `KnownFix_20261005_Free-Skills-${label}_IMG.png`), fullPage: true });
    for (const skill of data.skills) {
      await page.goto(base + '/free-skills/' + skill.id + '.html');
      assert(await page.getByRole('heading', { name: skill.title, exact: true }).isVisible());
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      const pending = page.waitForEvent('download');
      await page.getByRole('link', { name: 'Download SKILL.md', exact: true }).click();
      const download = await pending;
      assert.equal(download.suggestedFilename(), 'SKILL.md');
      assert.equal(fs.readFileSync(await download.path(), 'utf8'), skill.body);
    }
    assert.deepEqual(errors, []);
    console.log(label + ': four readable skill pages, no overflow, consent control and exact SKILL.md downloads passed (download response mocked; backend integration tested separately).');
    await context.close();
  }
} finally {
  await browser.close();
  if (server) await new Promise(resolve => server.close(resolve));
}
