import assert from 'node:assert/strict';
import fs from 'node:fs';
const root = new URL('../', import.meta.url);
const read = file => fs.readFileSync(new URL(file, root), 'utf8');
const { services } = JSON.parse(read('services.json'));
const hub = read('services.html');
assert(hub.includes(`${services.length} bounded engagements`));
const table = hub.match(/<table[^>]*id="service-comparison"[\s\S]*?<\/table>/)[0];
assert.equal((table.match(/<tr data-kind=/g) || []).length, services.length);
for (const service of services) {
  const row = table.split('<tr ').find(row => row.includes(`./services/${service.id}.html`));
  assert(row, service.id);
  assert(row.includes(`data-price="${service.priceUsdCents / 100}"`));
  assert(row.includes(`<td>${service.deliveryBusinessDays}</td>`));
  if (service.requiresScopeApproval) assert(row.includes('Written scope approval before payment or testing.'));
}
for (const file of ['index.html', 'free-skills.html', 'mcp-connect.html', 'mcp-response.html', 'services.html', 'sitemap.xml', 'llms.txt', 'llms-full.txt', 'privacy.html']) assert(read(file).includes('webhook-retry.html'), file);
console.log('PASS service comparison: all catalog services, prices, delivery targets, approval requirement and new tool discovery agree.');
