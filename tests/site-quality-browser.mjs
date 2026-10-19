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
  let route = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  if (route.endsWith('/')) route += 'index.html';
  const file = path.resolve(root, '.' + route), relative = path.relative(root, file);
  if (relative.startsWith('..') || path.isAbsolute(relative) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return res.writeHead(404).end();
  res.writeHead(200, { 'content-type': { '.html': 'text/html', '.css': 'text/css', '.mjs': 'text/javascript', '.json': 'application/json', '.png': 'image/png' }[path.extname(file)] || 'text/plain' }); fs.createReadStream(file).pipe(res);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = process.env.KNOWNFIX_BASE_URL || `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true, channel: process.env.KNOWNFIX_BROWSER_CHANNEL || 'msedge' });
const targets = ['index.html', 'services.html', 'agents.html', 'premium-skills.html', 'fixes/node-esm-dirname-not-defined.html', 'fixes/mcp-stdio-env-not-inherited.html', 'services/verified-repo-fix.html', 'services/saas-security-exposure-review.html'];
const overflows = [];
try {
  for (const width of [320, 390, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    await context.addInitScript(() => { try { localStorage.setItem('knownfix.analytics.consent', 'denied'); } catch {} });
    const page = await context.newPage(), errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/*', route => new URL(route.request().url()).origin === new URL(base).origin ? route.continue() : route.abort());
    for (const target of targets) {
      await page.goto(base + '/' + target);
      await page.locator('h1').waitFor();
      assert.equal(await page.locator('h1').count(), 1, target);
      if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)) overflows.push({ width, target, elements: await page.evaluate(() => [...document.querySelectorAll('body *')].filter(x => { const r=x.getBoundingClientRect(); return r.width && r.right > innerWidth + 1 && getComputedStyle(x).position !== 'absolute'; }).slice(0,15).map(x => ({ tag:x.tagName, class:x.className, text:x.textContent.slice(0,80), right:x.getBoundingClientRect().right }))) });
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(() => document.activeElement.classList.contains('skip-link')), true, 'Keyboard bypass: ' + target);
      if (target === 'services.html') {
        for (const id of ['microsite-launch', 'verified-repo-fix', 'saas-security-exposure-review']) {
          await page.locator('#service-id').selectOption(id);
          assert.equal(await page.locator('#automated-order-fields').isVisible(), false);
          assert.equal(await page.locator('#order-submit').isVisible(), false);
          assert.equal(await page.locator('#scope-approval').isVisible(), true);
          assert((await page.locator('#scope-approval a').getAttribute('href')).startsWith('mailto:knownfix.agent@gmail.com'));
        }
        await page.locator('#service-id').selectOption('webhook-reliability-review');
        assert.equal(await page.locator('#automated-order-fields').isVisible(), true);
        assert.equal(await page.locator('#order-submit').isEnabled(), true);
      }
      if (target === 'premium-skills.html') {
        for (const id of ['webflow-image-pipeline', 'webflow-mcp-helper', 'webflow-bundle', 'theme-contrast-audit']) assert.equal(await page.locator('#' + id).count(), 1);
      }
      if (target === 'agents.html') assert((await page.locator('main').innerText()).includes('get_overview'));
      if (process.env.KNOWNFIX_SCREENSHOT_DIR && width !== 320 && ['index.html', 'services.html', 'agents.html', 'premium-skills.html', 'fixes/node-esm-dirname-not-defined.html'].includes(target)) {
        await page.evaluate(() => scrollTo(0, 0));
        await page.screenshot({ path: path.join(process.env.KNOWNFIX_SCREENSHOT_DIR, `KnownFix_20261019_${target.replaceAll('/', '-').replace('.html', '')}-${width}_IMG.png`) });
      }
    }
    assert.deepEqual(errors, []);
    console.log(`CHECKED ${width}px: eight routes, keyboard skip links, complete previews and manual-vs-automated intake. No order or payment submitted.`);
    await context.close();
  }
  assert.deepEqual(overflows, [], 'Responsive overflow evidence');
  console.log('PASS all 24 views: no page overflow/errors at 320px, 390px or 1440px.');
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
