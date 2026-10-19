import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

if (!process.env.KNOWNFIX_PLAYWRIGHT_PATH) throw new Error('Provide the installed Playwright path');
const { chromium } = createRequire(import.meta.url)(process.env.KNOWNFIX_PLAYWRIGHT_PATH);
const root = fileURLToPath(new URL('../', import.meta.url));
const server = http.createServer((req, res) => {
  const file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
  const relative = path.relative(root, file);
  if (relative.startsWith('..') || path.isAbsolute(relative) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return res.writeHead(404).end();
  res.writeHead(200, { 'content-type': { '.html': 'text/html', '.css': 'text/css', '.mjs': 'text/javascript', '.json': 'application/json', '.png': 'image/png' }[path.extname(file)] || 'text/plain' });
  fs.createReadStream(file).pipe(res);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = process.env.KNOWNFIX_BASE_URL || `http://127.0.0.1:${server.address().port}`;
const origin = new URL(base).origin;
const browser = await chromium.launch({ headless: true, ...(process.env.KNOWNFIX_BROWSER_CHANNEL ? { channel: process.env.KNOWNFIX_BROWSER_CHANNEL } : {}) });
const captures = process.env.KNOWNFIX_SCREENSHOT_DIR;
if (captures) fs.mkdirSync(captures, { recursive: true });
const tools = [
  { file: 'mcp-connect.html', guide: 'mcp-connection-troubleshooting', example: 'conflict', input: '#config-input', load: '#load-example', run: '#config-form button[type=submit]', output: '#config-result', text: 'choose url or command', event: 'mcp_kit_action' },
  { file: 'mcp-response.html', guide: 'mcp-response-validation', example: 'tool', input: '#response-input', load: '#response-example', run: '#response-form button[type=submit]', output: '#response-result', text: 'Tool-level error flag', event: 'mcp_response_action' },
  { file: 'webhook-retry.html', guide: 'webhook-retry-budget', example: 'tight', load: '#load-scenario', output: '#budget-count', text: '3 / 6', event: 'retry_planner_action' },
];
try {
  for (const [label, width, height] of [['Desktop', 1440, 1000], ['Mobile', 390, 844]]) {
    for (const tool of tools) {
      const context = await browser.newContext({ viewport: { width, height }, permissions: ['clipboard-read', 'clipboard-write'] });
      const page = await context.newPage();
      const errors = [], external = [];
      page.on('pageerror', error => errors.push(error.message));
      await context.route('**/*', route => {
        const url = new URL(route.request().url());
        if (url.origin === origin) return route.continue();
        if (url.href === 'https://b-hash88.github.io/knownfix/knownfix-icon.png') return route.fulfill({ contentType: 'image/png', path: path.join(root, 'knownfix-icon.png') });
        external.push({ origin: url.origin, path: url.pathname, method: route.request().method() });
        if (url.hostname === 'www.googletagmanager.com') return route.fulfill({ contentType: 'text/javascript', body: '' });
        return route.abort();
      });
      await page.goto(base + '/' + tool.file);
      assert.deepEqual(external, [], 'No external request before consent');
      await page.getByRole('button', { name: 'No thanks', exact: true }).click();
      await page.locator('#example-case').selectOption(tool.example);
      await page.locator(tool.load).click();
      if (tool.run) await page.locator(tool.run).click();
      assert((await page.locator(tool.output).innerText()).includes(tool.text));
      assert.deepEqual(external, []);
      assert.equal(await page.evaluate(() => window.dataLayer?.length || 0), 0);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      if (captures) await page.screenshot({ path: path.join(captures, `KnownFix_20261019_${tool.guide}-${label}_IMG.png`), fullPage: true });

      const privacy = await context.newPage();
      await privacy.goto(base + '/privacy.html');
      await privacy.getByRole('button', { name: 'Allow analytics', exact: true }).click();
      await page.waitForFunction(() => window.dataLayer?.some(item => item[0] === 'config'));
      await privacy.getByRole('button', { name: 'Disable analytics', exact: true }).click();
      await page.waitForFunction(() => [...window.dataLayer].reverse().find(item => item[0] === 'consent')?.[2].analytics_storage === 'denied');
      await page.locator(tool.load).click();
      assert.equal(await page.evaluate(() => window.dataLayer.filter(item => item[0] === 'event').length), 0);
      await privacy.getByRole('button', { name: 'Allow analytics', exact: true }).click();
      await page.waitForFunction(() => [...window.dataLayer].reverse().find(item => item[0] === 'consent')?.[2].analytics_storage === 'granted');
      assert.equal(await privacy.evaluate(() => [...window.dataLayer].reverse().find(item => item[0] === 'consent')[2].analytics_storage), 'granted');
      assert.equal(await page.evaluate(() => window.dataLayer.filter(item => item[0] === 'config').length), 1);
      await privacy.close();
      await page.locator('#example-case').selectOption(tool.example);
      await page.locator(tool.load).click();
      const events = await page.evaluate(() => window.dataLayer.filter(item => item[0] === 'event').map(item => [item[1], item[2]]));
      assert.deepEqual(events, [[tool.event, { event_context: 'example-' + tool.example }]]);
      if (tool.input) {
        await page.locator(tool.input).fill('PRIVATE-CANARY-INPUT');
        await page.locator(tool.run).click();
        assert(!(await page.evaluate(() => JSON.stringify(window.dataLayer))).includes('PRIVATE'));
      }
      const next = page.waitForURL('**/guides/' + tool.guide + '.html');
      await page.getByRole('link', { name: /^Read the companion guide:/ }).click();
      await next;
      assert.equal(await page.locator('h1').count(), 1);
      assert.equal(await page.locator('article').count(), 1);
      assert.equal(await page.locator('a[download]').count(), 3);
      const download = page.waitForEvent('download');
      await page.locator('a[download]').first().click();
      const file = await download;
      assert(file.suggestedFilename().endsWith('.json'));
      const guideEvents = await page.evaluate(() => window.dataLayer.filter(item => item[0] === 'event').map(item => [item[1], item[2]]));
      assert.deepEqual(guideEvents, [['guide_action', { event_context: 'download-example' }]]);
      const loadersBefore = external.length;
      await page.evaluate(() => {
        window.knownfixTrack('guide_action', 'PRIVATE-CANARY');
        localStorage.setItem('knownfix.analytics.consent', 'denied');
        window.knownfixTrack('guide_action', 'open-tool');
      });
      assert.equal(await page.evaluate(() => window.dataLayer.filter(item => item[0] === 'event').length), 1);
      assert(!(await page.evaluate(() => JSON.stringify(window.dataLayer))).includes('PRIVATE'));
      await page.reload();
      assert.equal(external.length, loadersBefore, 'No new Google load after withdrawal');
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      if (captures) {
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.screenshot({ path: path.join(captures, `KnownFix_20261019_${tool.guide}-Guide-${label}_IMG.png`), fullPage: true });
      }
      for (const href of await page.locator('a[href^="#"]').evaluateAll(elements => elements.map(element => element.getAttribute('href')))) assert(await page.locator(href).count());
      assert.deepEqual(errors, []);
      assert(external.every(request => request.origin === 'https://www.googletagmanager.com' && request.method === 'GET'), JSON.stringify(external));
      await context.close();
      console.log(`PASS ${label} ${tool.file}: worked example, guide navigation/download, fixed consented events, private-input exclusion, withdrawal, no overflow.`);
    }
  }
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
