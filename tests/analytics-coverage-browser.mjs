import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

if (!process.env.KNOWNFIX_PLAYWRIGHT_PATH) throw new Error('Provide the installed Playwright path; no download fallback.');
const { chromium } = createRequire(import.meta.url)(process.env.KNOWNFIX_PLAYWRIGHT_PATH);
const root = fileURLToPath(new URL('../', import.meta.url));
const server = http.createServer((req, res) => {
  const file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
  const relative = path.relative(root, file);
  if (relative.startsWith('..') || path.isAbsolute(relative) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return res.writeHead(404).end();
  res.writeHead(200, { 'content-type': { '.html': 'text/html', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png' }[path.extname(file)] || 'text/plain' });
  fs.createReadStream(file).pipe(res);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = process.env.KNOWNFIX_BASE_URL || `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true, channel: 'msedge' });
const evidence = { startedAt: new Date().toISOString(), base, environment: 'Temporary Edge / installed Playwright; Google stubbed; no production analytics or backend writes', pages: [], checks: [] };
const problems = [];
const check = (condition, message) => { evidence.checks.push({ message, passed: Boolean(condition) }); if (!condition) problems.push(message); };
const context = await browser.newContext();
await context.addInitScript(() => localStorage.setItem('knownfix.analytics.consent', 'granted'));
await context.route('**/*', route => {
  const url = new URL(route.request().url());
  if (url.origin === new URL(base).origin) return route.continue();
  if (url.hostname === 'www.googletagmanager.com') return route.fulfill({ contentType: 'text/javascript', body: '' });
  return route.abort();
});
const page = await context.newPage();
const events = () => page.evaluate(() => (window.dataLayer || []).filter(item => item[0] === 'event').map(item => [item[1], item[2]]));
try {
  const files = fs.readdirSync(root, { recursive: true }).filter(file => file.endsWith('.html') && !/^(?:\.git|\.impeccable|test-results)[\\/]/.test(file));
  for (const file of files) {
    if (!fs.readFileSync(path.join(root, file), 'utf8').includes('var measurementId=')) continue;
    const response = await page.goto(base + '/' + file.replaceAll('\\', '/') + '?private=qa-canary#private');
    const result = await page.evaluate(() => ({
      configs: (window.dataLayer || []).filter(item => item[0] === 'config').map(item => [item[1], item[2]]),
      loaders: [...document.querySelectorAll('script[src*="googletagmanager"]')].map(item => item.src),
    }));
    evidence.pages.push({ file, status: response.status(), ...result });
    check(response.status() === 200 && result.configs.length === 1 && result.loaders.length === 1, `${file}: one page-view configuration and loader`);
    check(result.configs[0]?.[0] === 'G-PPPE9TYRM2' && !JSON.stringify(result.configs).includes('qa-canary'), `${file}: main property and sanitized location`);
  }
  await page.goto(base + '/index.html');
  await page.locator('#match-query').click();
  check((await events()).length === 0, 'Input focus is not a catalog search');
  // Suppress real navigation/submission while exercising the actual delegated handlers.
  await page.evaluate(() => document.addEventListener('click', event => event.preventDefault(), true));
  for (const name of ['sample_report_view', 'diagnostic_view']) {
    await page.locator(`[data-knownfix-event="${name}"]`).first().click();
    check((await events()).filter(item => item[0] === name).length === 1, `Homepage ${name} is recorded once`);
  }
  await page.locator('#match-query').fill('synthetic private input');
  await page.locator('#match-form').evaluate(form => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
  check((await events()).filter(item => item[0] === 'catalog_search').length === 1, 'One catalog search per submit');
  check(!JSON.stringify(await events()).includes('synthetic private input'), 'Search text excluded');

  await page.goto(base + '/services/homepage-build.html');
  await page.evaluate(() => document.addEventListener('click', event => event.preventDefault(), true));
  await page.locator('[data-knownfix-event="service_select"]').first().click();
  check((await events()).filter(item => item[0] === 'service_select').length === 1, 'Homepage-build service action is recorded');
  const privacy = await context.newPage();
  await privacy.goto(base + '/privacy.html');
  await privacy.getByRole('button', { name: 'Disable analytics', exact: true }).click();
  try { await page.waitForFunction(() => [...(window.dataLayer || [])].reverse().find(item => item[0] === 'consent')?.[2].analytics_storage === 'denied', null, { timeout: 1500 }); } catch { /* Report the failed contract with the other evidence. */ }
  check(await page.evaluate(() => [...(window.dataLayer || [])].reverse().find(item => item[0] === 'consent')?.[2].analytics_storage === 'denied'), 'Homepage-build responds to cross-tab withdrawal');
  await privacy.close();
  evidence.completedAt = new Date().toISOString();
  assert.deepEqual(problems, []);
  console.log(`PASS ${evidence.pages.length} actual browser page loads and homepage action/legacy-wrapper regressions; Google and backend writes blocked.`);
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
  if (process.env.KNOWNFIX_ANALYTICS_EVIDENCE) fs.writeFileSync(process.env.KNOWNFIX_ANALYTICS_EVIDENCE, JSON.stringify(evidence, null, 2) + '\n');
}
