import fs from 'node:fs';
const root = new URL('../', import.meta.url);
const read = file => fs.readFileSync(new URL(file, root), 'utf8');
const write = (file, text) => fs.writeFileSync(new URL(file, root), text);
const { services } = JSON.parse(read('services.json'));
const esc = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const kind = s => s.id === 'saas-security-exposure-review' ? 'security' : s.targetKind === 'github-repository' ? 'repository' : 'website';
const labels = { security: 'Authorized SaaS', repository: 'Public repository', website: 'Public website / API' };
const compare = `<!-- service-comparison:start -->
<section class="band service-compare" id="compare"><div class="section-head"><h2>Compare services</h2><p>Published scopes, prices and delivery targets.</p></div>
<div class="service-filters"><div><label for="service-kind">Target</label><select id="service-kind"><option value="all">All targets</option><option value="website">Website or agent API</option><option value="repository">Public repository</option><option value="security">Authorized SaaS security</option></select></div><div><label for="service-budget">Price</label><select id="service-budget"><option value="100000">Any price</option><option value="200">Up to $200 USDC</option><option value="300">Up to $300 USDC</option><option value="500">Up to $500 USDC</option></select></div><button type="button" class="secondary" id="reset-services">Reset filters</button></div>
<p id="comparison-count" role="status">${services.length} of ${services.length} services</p>
<div class="comparison-scroll"><table class="comparison-table" id="service-comparison"><caption class="sr-only">KnownFix service prices and delivery targets</caption><thead><tr><th scope="col">Service / full scope</th><th scope="col">Target</th><th scope="col">USDC</th><th scope="col">Business days</th></tr></thead><tbody>${services.map(s => `<tr data-kind="${kind(s)}" data-price="${s.priceUsdCents / 100}"><td><a href="./services/${s.id}.html" data-knownfix-event="service_select" data-knownfix-context="${s.id}">${esc(s.title)}</a>${s.requiresScopeApproval ? '<small>Written scope approval before payment or testing.</small>' : ''}</td><td>${labels[kind(s)]}</td><td>$${s.priceUsdCents / 100}</td><td>${s.deliveryBusinessDays}</td></tr>`).join('\n')}</tbody></table></div><p id="comparison-empty" hidden>No service matches these filters. Reset filters to see all services.</p>
<p class="comparison-note">Verified Repo Fix: $149 USDC due only on verified delivery; three business days after scope acceptance and a complete reproducible brief. Other delivery targets start after confirmed payment and a complete in-scope brief. SaaS security also requires written scope approval and test access. Full scopes and exclusions apply.</p>
<p><a href="./webhook-retry.html">Free Webhook Retry Planner</a> · <a href="./free-skills.html">Free skills &amp; tools</a> · <a href="#order">Private order or scope request</a></p></section>
<!-- service-comparison:end -->`;
let hub = read('services.html')
  .replace(/<title>[^<]*<\/title>/, '<title>KnownFix Services | Website, Code, Webhook and SaaS Reviews</title>')
  .replace(/<meta name="description" content="[^"]*">/, '<meta name="description" content="Compare '+services.length+' KnownFix services, including a $149 Verified Repo Fix with payment on verified delivery, website audits, webhook and authorized SaaS reviews.">')
  .replace(/<meta property="og:title" content="[^"]*">/, '<meta property="og:title" content="KnownFix Services">')
  .replace(/<meta property="og:description" content="[^"]*">/, '<meta property="og:description" content="Compare website, code, webhook and authorized SaaS reviews with published prices and scopes.">')
  .replace(/<header class="intro">[\s\S]*?<\/header>/, '<header class="intro"><p class="eyebrow">Evidence before advice</p><h1>KnownFix Services</h1><p class="lede">Focused reviews for websites, code, releases, webhooks and authorized SaaS security. Each engagement has a defined scope, evidence report and prioritized next steps.</p><div class="actions"><a class="button" href="#compare">Compare services</a><a class="button secondary" href="./reports/KnownFix_20260830_Evidence-Audit-Sample_RPT.html">Read a sample report</a><a class="button secondary" href="./free-skills.html">Free skills &amp; tools</a></div><div class="proofline"><span>Published prices</span><span>Defined scope</span><span>Private report delivery</span></div></header>')
  .replace('Focused reviews for websites, code, releases, webhooks and authorized SaaS security. Each engagement has a defined scope, evidence report and prioritized next steps.', 'A verified repository fix or a focused website, code, release, webhook or authorized SaaS review. Published scopes, delivery targets and payment terms.')
  .replace(/<h2>\d+ bounded engagements<\/h2>/, `<h2>${services.length} bounded engagements</h2>`);
if (hub.includes('<!-- service-comparison:start -->')) hub = hub.replace(/<!-- service-comparison:start -->[\s\S]*?<!-- service-comparison:end -->/, compare);
else hub = hub.replace('<main>', '<main>\n' + compare);
if (!hub.includes('href="./scripts/service-comparison.css"')) hub = hub.replace('</head>', '<link rel="stylesheet" href="./scripts/service-comparison.css"></head>');
// The page embeds report HTML in a script; anchor to the actual document end.
hub = hub.replaceAll('<script type="module" src="./scripts/service-filter.mjs"></script>', '')
  .replace(/<\/body><\/html>\s*$/, '<script type="module" src="./scripts/service-filter.mjs"></script></body></html>\n');
if (!hub.includes('service_compare:1')) hub = hub.replace('var allowedEvents={', 'var allowedEvents={service_compare:1,');
write('services.html', hub);
let index = read('index.html');
if (!index.includes('./webhook-retry.html')) index = index.replace('<h2 id="tools">Tools</h2>', '<h2 id="tools">Tools</h2>\n<article class="tool"><h3><a href="./webhook-retry.html">Webhook Retry Planner</a> <span class="badge">Free</span></h3><p>Calculate capped backoff, jitter ranges and attempt timeouts against a delivery budget. Copy a plan and review checklist; no webhook calls.</p></article>');
write('index.html', index);
let skills = read('free-skills.html');
if (!skills.includes('./webhook-retry.html')) skills = skills.replace('<a href="./mcp-response.html">MCP Response Inspector</a>', '<a href="./mcp-response.html">MCP Response Inspector</a> · <a href="./webhook-retry.html">Webhook Retry Planner</a>');
write('free-skills.html', skills);
for (const file of ['mcp-response.html', 'mcp-connect.html']) {
  let page = read(file);
  if (!page.includes('./webhook-retry.html')) page = page.replace('<footer>', '<footer><a href="./webhook-retry.html">Webhook Retry Planner</a> · ');
  write(file, page);
}
let privacy = read('privacy.html');
if (!privacy.includes('retry_planner_action')) privacy = privacy.replace('</main>', '<section><h2>Webhook Retry Planner</h2><p>The <a href="./webhook-retry.html">retry planner</a> calculates locally. It does not save or upload settings or contact webhook endpoints. With optional analytics allowed, retry_planner_action records calculate, reset, copy-json, copy-checklist, example-standard, example-tight, example-capped or read-guide. Service comparison records a fixed target-category label. No entered numbers, schedule, payload, URL or identifying data is included in these action events. These events measure actions, not unique people or successful deliveries.</p></section></main>');
privacy = privacy.replace('retry_planner_action records only calculate, reset, copy-json or copy-checklist.', 'retry_planner_action records calculate, reset, copy-json, copy-checklist, example-standard, example-tight, example-capped or read-guide.');
write('privacy.html', privacy);
let detail = read('services/webhook-reliability-review.html');
if (!detail.includes('/webhook-retry.html')) detail = detail.replace('<footer>', '<footer><p><a href="../webhook-retry.html">Free Webhook Retry Planner</a></p>');
write('services/webhook-reliability-review.html', detail);
await import('./sync-site-quality.mjs');
console.log(`Updated ${services.length}-service comparison and retry planner entry points.`);
