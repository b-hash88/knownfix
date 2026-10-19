import fs from 'node:fs';
const root = new URL('../', import.meta.url);
const read = file => fs.readFileSync(new URL(file, root), 'utf8');
const write = (file, text) => fs.writeFileSync(new URL(file, root), text);
const site = 'https://b-hash88.github.io/knownfix';
const template = read('mcp-response.html');
const consentStyle = template.match(/<style>\s*#knownfix-analytics-consent[\s\S]*?<\/style>/)[0];
const consentScript = template.match(/<script>\s*\(function\(\)[\s\S]*?<\/script>/)[0]
  .replace('pageType="mcp-response"', 'pageType="retry-planner"')
  .replace('mcp_response_action:1', 'retry_planner_action:1');
write('webhook-retry.html', `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Webhook Retry Planner and Backoff Calculator | KnownFix</title>
<meta name="description" content="Free webhook retry calculator: compare capped exponential backoff, full jitter, attempt timeouts and a delivery time budget. Runs locally in your browser.">
<link rel="canonical" href="${site}/webhook-retry.html"><meta property="og:title" content="Webhook Retry Planner | KnownFix"><meta property="og:description" content="Plan retry timing, jitter and a delivery budget. Free browser-local calculator."><meta property="og:image" content="${site}/knownfix-icon.png">
<link rel="stylesheet" href="./scripts/retry-planner.css">${consentStyle}${consentScript}</head><body><main>
<nav aria-label="Main"><a href="./"><img src="./knownfix-icon.png" alt="">KnownFix</a><a href="./free-skills.html">Free skills &amp; tools</a><a href="./services.html">Services</a><a href="./privacy.html">Privacy</a></nav>
<h1>Webhook Retry Planner</h1><p class="muted">Backoff, jitter and delivery budgets · Free</p>
<noscript>JavaScript is required for this calculator. The free webhook triage skill and service scopes remain available below.</noscript>
<div class="planner"><section aria-labelledby="settings-title"><h2 id="settings-title">Retry settings</h2>
<form id="retry-form">
<div class="field-pair"><div class="field"><label for="attempts">Total attempts</label><input id="attempts" name="attempts" type="number" min="1" max="20" step="1" value="6" required><small>Includes the first attempt.</small></div>
<div class="field"><label for="timeout">Timeout (s)</label><input id="timeout" name="timeout" type="number" min="0.1" max="3600" step="any" value="10" required><small>Per attempt.</small></div></div>
<div class="field-pair"><div class="field"><label for="initialDelay">Initial delay (s)</label><input id="initialDelay" name="initialDelay" type="number" min="0" max="86400" step="any" value="5" required></div><div class="field"><label for="multiplier">Multiplier</label><input id="multiplier" name="multiplier" type="number" min="1" max="10" step="any" value="2" required></div></div>
<div class="field-pair"><div class="field"><label for="maxDelay">Delay cap (s)</label><input id="maxDelay" name="maxDelay" type="number" min="0" max="86400" step="any" value="300" required></div><div class="field"><label for="budget">Time budget (s)</label><input id="budget" name="budget" type="number" min="1" max="604800" step="any" value="600" required></div></div>
<div class="field"><label for="jitter">Jitter</label><select id="jitter" name="jitter"><option value="full">Full jitter: zero to capped delay</option><option value="none">No jitter: fixed capped delay</option></select></div>
<div class="actions"><button type="submit">Calculate schedule</button><button class="secondary" type="button" id="reset-plan">Reset</button></div></form>
<p class="muted">Settings stay in this browser and are not saved. No webhook requests are sent.</p></section>
<section aria-labelledby="schedule-title"><h2 id="schedule-title">Delivery window</h2><p id="retry-status" class="status" role="status" aria-live="polite"></p>
<div id="retry-result" hidden><dl class="metrics"><div><dt>Total attempts</dt><dd id="total-attempts"></dd></div><div><dt>Maximum duration</dt><dd id="maximum-time"></dd></div><div><dt>Within budget</dt><dd id="budget-count"></dd></div></dl><p class="muted" id="expected-time"></p>
<div class="table-wrap"><table><caption>Serial attempts, relative to the first start</caption><thead><tr><th scope="col">Attempt</th><th scope="col">Wait before</th><th scope="col">Expected start</th><th scope="col">Latest finish</th><th scope="col">Budget</th></tr></thead><tbody id="retry-rows"></tbody></table></div></div>
<div class="actions"><button type="button" id="copy-plan" disabled>Copy plan JSON</button><button type="button" class="secondary" id="copy-checklist" disabled>Copy review checklist</button></div><pre id="export-fallback" hidden tabindex="0"></pre>
<details><summary>Timing assumptions</summary><p>Every attempt is unsuccessful and consumes its full timeout. Each wait starts after the previous failure. The first attempt starts at zero; it has no wait.</p><p>Retry delay = min(cap, initial delay × multiplier^(retry number − 1)). Full jitter uses a uniform range from zero to that delay; expected wait is half the capped delay. Ranges are bounds, not a random sample or a percentile forecast.</p><p>The budget check uses the latest modeled finish. Queue latency, network overhead, provider retry rules and Retry-After are excluded. This JSON is a planning record, not a provider configuration.</p></details></section></div>
<section class="related"><h2>From delivery timing to source review</h2><div class="resources"><a href="./free-skills/webhook-delivery-triage.html">Free Webhook Delivery Triage skill</a><a href="./services/webhook-reliability-review.html">Webhook Reliability Review · $179 USDC</a><a href="./mcp-response.html">MCP Response Inspector</a></div><p class="muted">The paid review covers one public repository, one integration and up to three event paths. Delivery target: 3 business days after confirmed payment and a complete in-scope brief.</p></section>
<footer><a href="./">KnownFix catalog</a> · <a href="./services.html">Compare services</a> · <a href="./privacy.html">Analytics choice</a></footer>
</main><script type="module" src="./scripts/retry-planner.mjs"></script></body></html>\n`);
let sitemap = read('sitemap.xml');
if (!sitemap.includes('/webhook-retry.html')) write('sitemap.xml', sitemap.replace('</urlset>', `<url><loc>${site}/webhook-retry.html</loc></url></urlset>`));
for (const file of ['llms.txt', 'llms-full.txt']) {
  const text = read(file);
  if (!text.includes('/webhook-retry.html')) write(file, text + `\n## Free webhook retry planner\n${site}/webhook-retry.html\nBrowser-local capped exponential backoff and full-jitter timing calculator with per-attempt timeouts and budget checks. Exports a planning record and checklist. No webhook calls or saved inputs; optional analytics sends fixed action names only.\n`);
}
console.log('Generated webhook retry planner and discovery links.');
await import('./sync-tool-guides.mjs');
