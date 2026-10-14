import fs from 'node:fs';
import { createRequire } from 'node:module';
const root = new URL('../', import.meta.url);
const read = p => fs.readFileSync(new URL(p, root), 'utf8');
const write = (p, v) => fs.writeFileSync(new URL(p, root), v);
const data = JSON.parse(fs.readFileSync(new URL('../../knownfix-release-backend/services.json', import.meta.url), 'utf8'));
const s = data.services.find(s => s.id === 'webhook-reliability-review');
if (!s) throw new Error('Missing approved service');
const base = 'https://b-hash88.github.io/knownfix';
const api = 'https://knownfix-backend-28.b-hash88.deno.net';
const esc = v => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const url = base + '/services/' + s.id + '.html';
const price = (s.priceUsdCents / 100).toFixed(0);
write('services.json', JSON.stringify(data, null, 2) + '\n');
let hub = read('services.html');
const card = `<article class="service" id="${s.id}">
<div class="service-head"><div><p class="service-type">Public GitHub repository</p><h2><a href="${url}">${esc(s.title)}</a></h2></div><strong class="price">$${price}<small> USDC</small></strong></div>
<p class="tagline">${esc(s.tagline)}</p><p class="scope">${esc(s.scope)}</p>
<ul>${s.deliverables.map(v => '<li>' + esc(v) + '</li>').join('')}</ul>
<div class="service-foot"><span>${s.deliveryBusinessDays} business days</span><span class="service-actions"><a href="${url}">Full scope</a><button type="button" data-service="${s.id}" data-knownfix-event="service_select" data-knownfix-context="${s.id}">Select service</button></span></div></article>`;
if (hub.includes('id="' + s.id + '"')) hub = hub.replace(new RegExp('<article class="service" id="' + s.id + '">[\\s\\S]*?</article>'), card);
else {
  const marker = '</article></div></section>';
  if (!hub.includes(marker)) throw new Error('Service grid boundary changed');
  hub = hub.replace(marker, '</article>\n' + card + '</div></section>');
}
hub = hub.replace(/(<select id="service-id" required>)[\s\S]*?(<\/select>)/,
  (_, start, end) => start + data.services.map(v => `<option value="${v.id}">${esc(v.title)} - $${(v.priceUsdCents/100).toFixed(0)} USDC</option>`).join('') + end);
hub = hub.replace(/services=\[[\s\S]*?\],sdkUrl=/, () => 'services=' + JSON.stringify(data.services) + ',sdkUrl=');
hub = hub.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/, (_, raw) => {
  const schema = JSON.parse(raw);
  schema.numberOfItems = data.services.length;
  const template = schema.itemListElement[0].item;
  schema.itemListElement = data.services.map((v, index) => ({'@type':'ListItem',position:index+1,item:{
    ...template, name:v.title, description:v.tagline, url:base+'/services/'+v.id+'.html',
    offers:{...template.offers,price:(v.priceUsdCents/100).toFixed(2),url:base+'/services.html?service='+v.id+'#order'}
  }}));
  return '<script type="application/ld+json">' + JSON.stringify(schema) + '</script>';
});
write('services.html', hub);
// Reuse the established source renderer only for the new page, not a full stale site rebuild.
const require = createRequire(import.meta.url);
const { EDITORIAL, renderServiceDetailPage } = require('../../knownfix-source/service-detail-page.js');
EDITORIAL[s.id] = {
  seoTitle:'Webhook reliability, retries and idempotency review | KnownFix',
  metaDescription:'A $179 read-only review of one public webhook integration: verification, duplicate handling, retries, queues and prioritized regression tests.',
  overview:'A focused source review for teams that need to understand where webhook acceptance, processing and business effects can diverge before making production changes.',
  audience:['Maintainers with one public webhook integration','Teams investigating duplicate processing or unclear retry behavior','Founders preparing to launch an event-driven feature'],
  questions:['Where does signature verification occur before acceptance?','Can duplicate or reordered events repeat a business effect?','Which retry and queue failures are visible and recoverable?','What focused regression tests would support the proposed fixes?'],
  faq:[
    ['What is included?',s.scope],
    ['How much does it cost and when is delivery?','$179 USDC on Base, or the signed exact-ETH alternative. Delivery target: 3 business days after confirmed payment and a complete, in-scope public repository brief.'],
    ['Will you replay live events or access production?','No. The standard service is read-only. It does not use signing keys, customer payloads, provider dashboards, live orders or production event replays.'],
    ['Does this include implementation?','No. You receive evidence, prioritized findings and regression-test recommendations. Implementation, private access and deployment need a separate scope.'],
    ['How is the report delivered?','Use the private order ticket to retrieve a self-contained HTML report and SHA-256-verified Markdown source. Keep the ticket private.'],
    ['Is reliability guaranteed?',s.limitations]
  ]
};
let detail = renderServiceDetailPage({base,backend:api,iconFile:'knownfix-icon.png',service:s,relatedServices:data.services.filter(v=>v.id!==s.id)});
detail = detail.replace('The books are public.', 'Owner-only statistics.');
detail = detail.replace(/\.6[578]rem/g, '.75rem');
detail = detail.replace('<footer>', '<footer><p><a href="' + base + '/free-skills/webhook-delivery-triage.html">Free Webhook Delivery Triage skill</a></p>');
write('services/' + s.id + '.html', detail);
let index = read('index.html');
if (!index.includes('./services/' + s.id + '.html')) {
  index = index.replace('<h2 id="tools">Tools</h2>', '<h2 id="tools">Tools</h2>\n' +
    `<article class="tool"><h3><a href="./services/${s.id}.html">${esc(s.title)}</a> <span class="badge">$${price} USDC</span></h3><p>${esc(s.tagline)} Delivery target: ${s.deliveryBusinessDays} business days.</p></article>`);
}
write('index.html', index);
for (const p of ['llms.txt','llms-full.txt']) {
  let value = read(p);
  if (!value.includes(url)) value += '\n- [' + s.title + '](' + url + '): $' + price + ' USDC; ' + s.deliveryBusinessDays + ' business days. ' + s.scope + '\nLimitations: ' + s.limitations + '\n';
  write(p, value);
}
let sitemap = read('sitemap.xml');
if (!sitemap.includes(url)) sitemap = sitemap.replace('</urlset>', '<url><loc>' + url + '</loc></url></urlset>');
write('sitemap.xml', sitemap);
console.log('Synced approved webhook review, seven-service catalog, checkout selection and discovery.');

