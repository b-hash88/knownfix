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
    const type = file.endsWith('.mjs') ? 'application/javascript' : file.endsWith('.png') ? 'image/png' : file.endsWith('.html') ? 'text/html' : 'text/plain';
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
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
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
      const denied = await page.goto(process.env.KNOWNFIX_BOOKS_URL);
      assert.equal(denied.status(), 401);
      assert.match(await page.locator('#status').innerText(), /Owner access required/);
      assert.equal(await page.locator('#workflow_activity').count(), 0);
      console.log(label + ': anonymous Books access denied.');
    }
    await page.goto(base + '/free-skills.html');
    await page.getByRole('button', { name: 'No thanks', exact: true }).click();
    assert.equal(await page.getByRole('link', { name: 'Download SKILL.md', exact: true }).count(), data.skills.length);
    assert(await page.getByRole('heading', { name: 'MCP Connection Triage', exact: true }).isVisible());
    assert(await page.getByRole('heading', { name: 'Website Search Readiness', exact: true }).isVisible());
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.getByLabel('Find a workflow').fill('MCP');
    await page.getByText('1 workflow', { exact: true }).waitFor();
    assert.equal(await page.locator('[data-skill]:visible').count(), 1);
    await page.getByLabel('Find a workflow').fill('nothing-matches-this');
    await page.getByText('No matching workflows.', { exact: true }).waitFor();
    await page.getByLabel('Find a workflow').fill('');
    if (process.env.KNOWNFIX_SCREENSHOT_DIR) await page.screenshot({ path: path.join(process.env.KNOWNFIX_SCREENSHOT_DIR, `KnownFix_20261005_Free-Skills-${label}_IMG.png`), fullPage: true });
    await page.goto(base + '/mcp-connect.html');
    await page.getByRole('heading', { name: 'KnownFix MCP Connection Kit', exact: true }).waitFor();
    await page.locator('#snippet-output').filter({ hasText: 'mcpServers' }).waitFor();
    assert(await page.locator('nav img').evaluate(img => img.complete && img.naturalWidth > 0));
    await page.getByRole('button', { name: 'Load example', exact: true }).click();
    await page.getByRole('button', { name: 'Check configuration', exact: true }).click();
    await page.getByText('Structure passed. Connection not tested.', { exact: true }).waitFor();
    await page.getByLabel('MCP configuration').fill('{');
    assert.equal(await page.locator('#config-result').textContent(), '');
    await page.getByRole('button', { name: 'Check configuration', exact: true }).click();
    await page.getByText('Invalid JSON. Check commas, quotes and trailing commas.', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Load example', exact: true }).click();
    assert.equal(await page.locator('#config-result').textContent(), '');
    await page.getByLabel('MCP configuration').fill('{"servers":{"<img src=x onerror=alert(1)>":{"url":"https://example.com","headers":{"Authorization":"fake-secret"}}}}');
    await page.getByRole('button', { name: 'Check configuration', exact: true }).click();
    assert(!(await page.locator('#config-result').textContent()).includes('fake-secret'));
    assert.equal(await page.locator('#config-result img').count(), 0);
    await page.getByRole('button', { name: 'Clear', exact: true }).click();
    assert.equal(await page.getByLabel('MCP configuration').inputValue(), '');
    await page.getByLabel('Format').selectOption('initialize');
    assert.equal(JSON.parse(await page.locator('#snippet-output').textContent()).method, 'initialize');
    await page.getByRole('button', { name: 'Copy JSON', exact: true }).click();
    await page.getByText('Copied.', { exact: true }).waitFor();
    assert.equal(JSON.parse(await page.evaluate(() => navigator.clipboard.readText())).method, 'initialize');
    const kitDownload = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download JSON', exact: true }).click();
    const jsonDownload = await kitDownload;
    assert.equal(JSON.parse(fs.readFileSync(await jsonDownload.path(), 'utf8')).method, 'initialize');
    await page.getByLabel('Format').selectOption('remote');
    assert.equal(await page.locator('#kit-status').textContent(), '');
    await page.evaluate(() => { Object.defineProperty(navigator.clipboard, 'writeText', { configurable: true, value: () => new Promise(resolve => { window.finishTestCopy = resolve; }) }); });
    await page.getByRole('button', { name: 'Copy JSON', exact: true }).click();
    await page.getByLabel('Format').selectOption('vscode');
    await page.evaluate(() => window.finishTestCopy());
    assert.equal(await page.locator('#kit-status').textContent(), '');
    await page.getByLabel('Format').selectOption('remote');
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    if (process.env.KNOWNFIX_SCREENSHOT_DIR) await page.screenshot({ path: path.join(process.env.KNOWNFIX_SCREENSHOT_DIR, `KnownFix_20261010_MCP-Kit-${label}_IMG.png`), fullPage: true });
    console.log(label + ': local config validation, secret-free errors, clear, format selection, JSON download, skill filter and responsive kit passed.');
    await page.goto(base + '/mcp-response.html');
    assert(await page.locator('#copy-receipt').isDisabled());
    await page.getByRole('button', { name: 'Load example', exact: true }).click();
    await page.getByRole('button', { name: 'Inspect response', exact: true }).click();
    await page.getByRole('heading', { name: 'Envelope structure passed' }).waitFor();
    await page.getByRole('button', { name: 'Copy checklist', exact: true }).click();
    await page.getByText('Checklist copied. Input omitted.').waitFor();
    assert((await page.evaluate(() => navigator.clipboard.readText())).includes('live behavior not tested'));
    await page.getByLabel('JSON response body').fill('{"jsonrpc":"2.0","id":"private-id","result":{"isError":true,"content":"private-secret <img src=x>"}}');
    assert(await page.locator('#copy-receipt').isDisabled());
    await page.getByRole('button', { name: 'Inspect response', exact: true }).click();
    assert(!(await page.locator('#response-result').innerText()).includes('private-'));
    assert.equal(await page.locator('#response-result img').count(), 0);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    if (process.env.KNOWNFIX_SCREENSHOT_DIR) await page.screenshot({ path: path.join(process.env.KNOWNFIX_SCREENSHOT_DIR, `response-${label}.png`), fullPage: true });
    await page.getByRole('button', { name: 'Clear', exact: true }).click();
    assert.equal(await page.getByLabel('JSON response body').inputValue(), '');
    assert(await page.locator('#copy-receipt').isDisabled());
    console.log(label + ': response check, safe copy, invalidation, error flag and local-only results passed.');
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
    console.log(label + ': five readable skill pages, no overflow, consent control and exact SKILL.md downloads passed (download response mocked; backend integration tested separately).');
    await context.close();
  }
} finally {
  await browser.close();
  if (server) await new Promise(resolve => server.close(resolve));
}
