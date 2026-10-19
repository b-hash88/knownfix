import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

if (process.env.KNOWNFIX_LIVE_ANALYTICS !== '1') throw new Error('Explicit KNOWNFIX_LIVE_ANALYTICS=1 is required: this creates synthetic GA4 QA events.');
if (!process.env.KNOWNFIX_PLAYWRIGHT_PATH) throw new Error('Provide the installed Playwright path');
const { chromium } = createRequire(import.meta.url)(process.env.KNOWNFIX_PLAYWRIGHT_PATH);
const base = 'https://b-hash88.github.io/knownfix';
const browser = await chromium.launch({ headless: true, channel: 'msedge' });
const evidence = { startedAt: new Date().toISOString(), environment: 'Temporary headless Edge / installed Playwright; synthetic QA, not customer traffic', results: [] };
const cases = [
  ['mcp-connect.html', 'mcp_kit_action', 'example-conflict', '#load-example', 'conflict'],
  ['mcp-response.html', 'mcp_response_action', 'example-tool', '#response-example', 'tool'],
  ['webhook-retry.html', 'retry_planner_action', 'example-tight', '#load-scenario', 'tight'],
  ['guides/mcp-response-validation.html', 'guide_action', 'download-example', 'a[download]', null],
];
function parameters(request) {
  const params = new URL(request.url()).searchParams;
  const body = new URLSearchParams((request.postData() || '').split('\n')[0]);
  for (const [key, value] of body) params.set(key, value);
  return params;
}
try {
  for (const [file, event, context, selector, example] of cases) {
    const browserContext = await browser.newContext({ acceptDownloads: true });
    const page = await browserContext.newPage();
    const sdk = [], acknowledgments = [];
    await page.route('**/*', route => {
      const url = new URL(route.request().url());
      if (url.origin === new URL(base).origin || url.hostname === 'www.googletagmanager.com' || /(^|\.)google-analytics\.com$/.test(url.hostname)) return route.continue();
      return route.abort();
    });
    page.on('response', response => {
      const url = new URL(response.url());
      if (url.hostname === 'www.googletagmanager.com') sdk.push(response.status());
      if (!/(^|\.)google-analytics\.com$/.test(url.hostname) || !url.pathname.endsWith('/collect')) return;
      const params = parameters(response.request());
      acknowledgments.push({ utc: new Date().toISOString(), endpoint: url.origin + url.pathname, status: response.status(), tid: params.get('tid'), event: params.get('en'), context: params.get('ep.event_context'), page: params.get('dl') });
    });
    await page.goto(base + '/' + file);
    assert.equal(sdk.length, 0);
    assert.equal(acknowledgments.length, 0);
    await page.getByRole('button', { name: 'Allow analytics', exact: true }).click();
    await page.waitForResponse(response => response.url().startsWith('https://www.googletagmanager.com/gtag/js?'));
    if (example) await page.locator('#example-case').selectOption(example);
    const received = page.waitForResponse(response => /(^|\.)google-analytics\.com$/.test(new URL(response.url()).hostname) && parameters(response.request()).get('en') === event, { timeout: 25000 });
    await page.locator(selector).first().click();
    const response = await received;
    const params = parameters(response.request());
    assert.equal(response.status(), 204);
    assert.equal(params.get('tid'), 'G-PPPE9TYRM2');
    assert.equal(params.get('ep.event_context'), context);
    assert.equal(params.get('dl'), base + '/' + file);
    assert(sdk.includes(200));
    evidence.results.push({ file, sdk: 200, expectedEvent: event, expectedContext: context, acknowledgments });
    console.log(`PASS live synthetic QA ${file}: ${event}/${context}, correct GA4 ID, HTTP204, no Google before consent.`);
    await browserContext.close();
  }
  evidence.completedAt = new Date().toISOString();
} finally {
  await browser.close();
  if (process.env.KNOWNFIX_ANALYTICS_EVIDENCE) fs.writeFileSync(process.env.KNOWNFIX_ANALYTICS_EVIDENCE, JSON.stringify(evidence, null, 2) + '\n');
}
