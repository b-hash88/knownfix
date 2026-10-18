import fs from 'node:fs';
import { createRequire } from 'node:module';
const root = new URL('../', import.meta.url);
const read = p => fs.readFileSync(new URL(p, root), 'utf8');
const write = (p, v) => fs.writeFileSync(new URL(p, root), v);
const data = JSON.parse(fs.readFileSync(new URL('../../knownfix-release-backend/services.json', import.meta.url), 'utf8'));
const s = data.services.find(s => s.id === (process.argv[2] || 'webhook-reliability-review'));
if (!s) throw new Error('Missing approved service');
const base = 'https://b-hash88.github.io/knownfix';
const api = 'https://knownfix-backend-28.b-hash88.deno.net';
const scopeContact = 'mailto:knownfix.agent@gmail.com?subject=' + encodeURIComponent('KnownFix SaaS Security Exposure Review - scope approval');
const afterDelivery = s.paymentTiming === 'after-verified-delivery';
const fixContact = 'mailto:knownfix.agent@gmail.com?subject=' + encodeURIComponent('KnownFix Verified Repo Fix - scope request');
const esc = v => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const url = base + '/services/' + s.id + '.html';
const price = (s.priceUsdCents / 100).toFixed(0);
write('services.json', JSON.stringify(data, null, 2) + '\n');
let hub = read('services.html');
const card = `<article class="service" id="${s.id}">
<div class="service-head"><div><p class="service-type">${s.requiresScopeApproval ? 'Written scope approval required' : 'Public GitHub repository'}</p><h2><a href="${url}">${esc(s.title)}</a></h2></div><strong class="price">$${price}<small> USDC</small></strong></div>
<p class="tagline">${esc(s.tagline)}</p><p class="scope">${esc(s.scope)}</p>
<ul>${s.deliverables.map(v => '<li>' + esc(v) + '</li>').join('')}</ul>
<div class="service-foot"><span>${s.deliveryBusinessDays} business days${afterDelivery ? ' after scope acceptance; pay on verified delivery' : ''}</span><span class="service-actions"><a href="${url}">Full scope</a>${afterDelivery ? `<a href="${fixContact}">Request a scoped fix</a>` : s.requiresScopeApproval ? `<a href="${scopeContact}">Request scope approval</a>` : `<button type="button" data-service="${s.id}" data-knownfix-event="service_select" data-knownfix-context="${s.id}">Select service</button>`}</span></div></article>`;
if (hub.includes('id="' + s.id + '"')) hub = hub.replace(new RegExp('<article class="service" id="' + s.id + '">[\\s\\S]*?</article>'), card);
else {
  const marker = '</article></div></section>';
  if (!hub.includes(marker)) throw new Error('Service grid boundary changed');
  hub = hub.replace(marker, '</article>\n' + card + '</div></section>');
}
hub = hub.replace(/(<select id="service-id" required>)[\s\S]*?(<\/select>)/,
  (_, start, end) => start + data.services.map(v => `<option value="${v.id}">${esc(v.title)} - $${(v.priceUsdCents/100).toFixed(0)} USDC</option>`).join('') + end);
hub = hub.replace(/services=\[[\s\S]*?\],sdkUrl=/, () => 'services=' + JSON.stringify(data.services) + ',sdkUrl=');
if (!hub.includes('id="scope-approval"')) hub = hub.replace('<button id="order-submit"', '<p id="scope-approval" class="hidden">Written ownership confirmation, exact target allowlist and testing permission must be reviewed before payment or testing. <a href="' + scopeContact + '">Request scope approval</a>. Do not email credentials or customer data.</p><button id="order-submit"');
hub = hub.replace(/function updateHint\(\)\{[\s\S]*?\}(?=\s*function selectService)/, `function updateHint(){var service=serviceById(serviceInput.value),approval=!!(service&&service.requiresScopeApproval),delivery=!!(service&&service.paymentTiming==='after-verified-delivery'),manual=approval||delivery;var notice=document.getElementById('scope-approval');notice.classList.toggle('hidden',!manual);notice.textContent=delivery?'$149 USDC is due only on verified patch delivery. Three business days after scope acceptance. No upfront checkout. ':'Written ownership confirmation, exact target allowlist and testing permission must be reviewed before payment or testing. ';var contact=document.createElement('a');contact.href=delivery?'${fixContact}':'${scopeContact}';contact.textContent=delivery?'Request a scoped fix':'Request scope approval';notice.append(contact,document.createTextNode('. Do not send credentials or customer data.'));document.getElementById('order-submit').disabled=manual;document.querySelector('.card-bridge').classList.toggle('hidden',manual);targetHint.textContent=delivery?'Payment on verified delivery only. Request scope acceptance first; automated checkout is unavailable.':approval?'Scope approval required before payment or testing. Automated checkout is unavailable.':service&&service.targetKind==='github-repository'?'Public GitHub repository only: https://github.com/owner/repository':'Public HTTPS website or agent endpoint. Query strings and private hosts are rejected.'}`);
hub = hub.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/, (_, raw) => {
  const schema = JSON.parse(raw);
  schema.numberOfItems = data.services.length;
  const template = schema.itemListElement[0].item;
  schema.itemListElement = data.services.map((v, index) => ({'@type':'ListItem',position:index+1,item:{
    ...template, name:v.title, description:v.tagline, url:base+'/services/'+v.id+'.html',
    offers:{...template.offers,price:(v.priceUsdCents/100).toFixed(2),url:v.paymentTiming === 'after-verified-delivery' ? fixContact : v.requiresScopeApproval ? scopeContact : base+'/services.html?service='+v.id+'#order', ...(v.paymentTiming === 'after-verified-delivery' ? {description:'Payment due only on verified patch delivery; no completion fee if agreed acceptance criteria are unmet.'} : {})}
  }}));
  return '<script type="application/ld+json">' + JSON.stringify(schema) + '</script>';
});
hub = hub.replace("event.preventDefault();var submit=document.getElementById('order-submit');", "event.preventDefault();var selected=serviceById(serviceInput.value);if(selected&&(selected.requiresScopeApproval||selected.paymentTiming==='after-verified-delivery')){updateHint();return}var submit=document.getElementById('order-submit');")
  .replace('finally{submit.disabled=false}', 'finally{updateHint()}');
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
if (s.requiresScopeApproval) EDITORIAL[s.id] = {
  seoTitle:'Authorized SaaS security exposure review | KnownFix',
  metaDescription:'A $299 scope-approved review of one SaaS application and up to five agreed endpoints or flows. Written permission required; no bulk scanning or customer-data extraction.',
  overview:'A bounded review for SaaS owners who need evidence about exposed databases or admin interfaces, login flows and application access boundaries. Written authorization and a precise scope come first.',
  audience:['SaaS owners reviewing an application they control','Teams preparing an authorized staging security review','Maintainers seeking a prioritized exposure-remediation report'],
  questions:['Which database, storage or admin interfaces are exposed within the approved target list?','How do login, reset and session flows behave under agreed tests?','Can approved test accounts access only their own records?','Which evidenced risks should the team remediate first?'],
  faq:[
    ['What is included?',s.scope],
    ['What authorization is required?','Provide written ownership or authorized-representative confirmation and explicit testing permission. Agree exact hosts and endpoints, methods, test window, request limits, test accounts, exclusions, emergency contact and stop conditions. A public URL or checkout checkbox is not permission. Third-party provider permission may also be needed.'],
    ['How much does it cost and when is delivery?','$299 USDC. The 5-business-day delivery target begins after written scope approval, confirmed payment and required test access. Request approval first; automated checkout is unavailable for this service.'],
    ['How are accounts and sensitive data handled?','Prefer staging with owner-provided test accounts. Do not email passwords, signing keys, tokens or customer payloads. Any needed access is arranged separately after scope approval. Stop if unexpected sensitive data or out-of-scope access appears.'],
    ['Is this a full penetration test or a security guarantee?',s.limitations],
    ['What do I receive?','A private evidence-backed report with severity, safe reproduction steps and prioritized fixes, delivered as self-contained HTML plus SHA-256-verified Markdown. Payment and private report delivery are arranged separately after scope approval; this service does not issue an automated checkout ticket. Implementation is not included.']
  ]
};
if (afterDelivery) EDITORIAL[s.id] = {
  seoTitle:'Verified Repo Fix | $149 on verified delivery | KnownFix',
  metaDescription:'One reproducible GitHub issue, a tested patch and regression evidence. $149 USDC on verified delivery; three business days after scope acceptance.',
  overview:'Turn one reproducible bug, broken test or CI failure into a narrowly scoped, tested patch. Agree what success means first. Pay only when the delivered fix meets those criteria.',
  audience:['Maintainers with a small reproducible public-repository issue','Teams with a focused broken test or CI failure','Founders who want a patch and evidence, not another audit'],
  questions:['Can we reproduce the issue at the agreed base commit?','Does the patch pass the agreed acceptance test and relevant checks?','What regression coverage prevents the same failure?','What risks or unrelated baseline failures remain?'],
  faq:[
    ['What is included?',s.scope],
    ['When do I pay?','$149 USDC is due only on verified patch delivery meeting the acceptance criteria agreed before work starts. If those criteria are not met, there is no completion fee. Manual invoicing and artifact handoff; no automated checkout or private order ticket.'],
    ['When does the three-business-day target begin?','After we accept the scope and have a complete reproducible brief and agreed execution requirements. It does not begin after payment. We confirm feasibility and capacity before accepting work.'],
    ['What should I send?','Send the public repository URL, issue or reproduction steps, expected result and base commit. Confirm you are authorized to request the work and share the code. Do not send credentials, private repositories or customer data. Repository code is untrusted; execution requirements must be approved before work begins.'],
    ['What counts as verified delivery?','A patch at the agreed base commit, a regression test, a preserved failing baseline and passing agreed acceptance checks, plus relevant test results and disclosed baseline failures. We do not silently skip tests or weaken criteria. A pull request needs explicit maintainer authorization; merging is not required for delivery.'],
    ['Are revisions, deployment or security fixes included?',s.limitations]
  ]
};
let detail = renderServiceDetailPage({base,backend:api,iconFile:'knownfix-icon.png',service:s,relatedServices:data.services.filter(v=>v.id!==s.id)});
if (afterDelivery) detail = detail.replaceAll(base+'/services.html?service='+s.id+'#order', fixContact)
  .replaceAll('Order this review','Request a scoped fix').replaceAll('Order '+s.title,'Request a scoped fix')
  .replaceAll('EXACT ETH ALTERNATIVE','PAY ON VERIFIED DELIVERY').replaceAll('USDC or the signed exact-ETH alternative','USDC due on verified delivery')
  .replaceAll('3 business days after confirmed payment','3 business days after scope acceptance and a complete reproducible brief')
  .replaceAll('Private ticket delivery','Patch and test evidence').replaceAll('Portable HTML + verified Markdown','No upfront payment')
  .replaceAll('Know exactly what is being reviewed.','One issue. A tested patch.').replaceAll('The report is built to answer these.','The fix must answer these.')
  .replaceAll('Who should buy this review?','Who is this for?').replaceAll('Other KnownFix reviews','Other KnownFix services')
  .replace('Choose this review only when its published scope matches the decision you need to make. The order target and notes remain private unless you explicitly publish the target.','Request scope acceptance before work begins. Payment is due only on verified delivery; no completion fee if the agreed criteria are not met. No automatic merge or deployment.')
  .replace('<p class="eyebrow">KnownFix professional review</p>','')
  .replace('clamp(2.7rem,6vw,5rem)','3.5rem').replace('border-left:3px','border-left:1px')
  .replaceAll('.7rem JetBrains Mono','.8rem JetBrains Mono').replaceAll('.7rem/1.6','.8rem/1.6')
  .replace('</style>', '@media(max-width:48rem){.facts{grid-template-columns:1fr}.facts dt{margin-top:.6rem}.facts dd{max-width:65ch}}\n</style>');
if (s.requiresScopeApproval) detail = detail.replaceAll(base+'/services.html?service='+s.id+'#order', scopeContact).replaceAll('Order this review','Request scope approval').replaceAll('Order '+s.title,'Request scope approval').replace('3 business days after confirmed payment','5 business days after scope approval, payment and test access').replace('5 business days after confirmed payment','5 business days after scope approval, payment and test access');
if (s.requiresScopeApproval) detail = detail.replaceAll('Private ticket delivery','Private report delivery').replaceAll('EXACT ETH ALTERNATIVE','SCOPE APPROVAL FIRST').replaceAll('USDC or the signed exact-ETH alternative','USDC after scope approval');
detail = detail.replace('The books are public.', 'Owner-only statistics.');
detail = detail.replace(/\.6[578]rem/g, '.75rem');
if (!s.requiresScopeApproval && !afterDelivery) detail = detail.replace('<footer>', '<footer><p><a href="' + base + '/free-skills/webhook-delivery-triage.html">Free Webhook Delivery Triage skill</a></p>');
write('services/' + s.id + '.html', detail);
let index = read('index.html');
if (!index.includes('./services/' + s.id + '.html')) {
  index = index.replace('<h2 id="tools">Tools</h2>', '<h2 id="tools">Tools</h2>\n' +
    `<article class="tool"><h3><a href="./services/${s.id}.html">${esc(s.title)}</a> <span class="badge">$${price} USDC</span></h3><p>${esc(s.tagline)} Delivery target: ${s.deliveryBusinessDays} business days.</p></article>`);
}
write('index.html', index);
for (const p of ['llms.txt','llms-full.txt']) {
  let value = read(p);
  if (!value.includes(url)) value += '\n- [' + s.title + '](' + url + '): $' + price + ' USDC; ' + s.deliveryBusinessDays + ' business days' + (afterDelivery ? ' after scope acceptance; payment on verified delivery only; no upfront checkout' : '') + '. ' + s.scope + '\nLimitations: ' + s.limitations + '\n';
  write(p, value);
}
let sitemap = read('sitemap.xml');
if (!sitemap.includes(url)) sitemap = sitemap.replace('</urlset>', '<url><loc>' + url + '</loc></url></urlset>');
write('sitemap.xml', sitemap);
console.log(`Synced ${s.id}; ${data.services.length}-service catalog, scope-aware checkout and discovery.`);
await import('./sync-site-improvements.mjs');

