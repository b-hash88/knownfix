import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
const read = file => fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
const services = JSON.parse(read('services.json')).services;
const premium = JSON.parse(read('premium-skills.json')).skills;
const home = read('index.html');
assert(home.includes(`<b>${services.length}</b> scoped services`));
assert(!home.includes('Scoped remediation sprint'));
assert(!home.includes('no rate limit'));
assert(home.includes('id="premium"') && home.includes('id="workflows"'));
assert(home.includes('minmax(min(100%,19rem),1fr)'));
const guide = read('agents.html');
for (const service of services) assert(guide.includes(`/services/${service.id}.html`));
for (const skill of JSON.parse(read('free-skills.json')).skills) assert(guide.includes(`knownfix://free-skill/${skill.id}`));
const previews = read('premium-skills.html');
for (const skill of premium) { assert(previews.includes(`id="${skill.id}"`)); assert(previews.includes(skill.priceUsd)); }
const hub = read('services.html');
assert(hub.includes('id="automated-order-fields"'));
assert(hub.includes("getElementById('automated-order-fields').disabled=manual"));
assert(hub.includes('Manual services use a scope-request email'));
for (const file of ['services.html', ...services.map(s => `services/${s.id}.html`)]) {
  const html = read(file);
  // The later report renderer contains literal HTML inside JavaScript, not another document schema.
  for (const match of [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].slice(0, 1)) {
    const inspect = value => {
      if (!value || typeof value !== 'object') return;
      if (value['@type'] === 'Service' && value.offers) {
        const service = services.find(s => value.url?.endsWith(`/services/${s.id}.html`));
        if (service) {
          assert.equal(Number(value.offers.price), service.priceUsdCents / 100);
          assert.equal(value.offers.description.includes('verified patch delivery'), service.id === 'verified-repo-fix', service.id);
          if (service.requiresScopeApproval) assert(value.offers.description.includes('scope approval'));
        }
      }
      Object.values(value).forEach(inspect);
    };
    inspect(JSON.parse(match[1]));
  }
}
for (const file of fs.readdirSync('fixes').filter(f => f.endsWith('.html'))) {
  const html = read('fixes/' + file);
  assert(html.includes('<main id="main-content">'));
  assert(html.includes('aria-label="Fix navigation"') && html.includes('class="skip-link"'));
}
assert(!read('sigils/offer.json').includes('Impersonation is cryptographically impossible'));
const files = ['index.html', 'services.html', 'agents.html', 'premium-skills.html', 'notes-for-agents.md', 'sitemap.xml', 'llms.txt', 'llms-full.txt'];
const before = files.map(read);
const result = spawnSync(process.execPath, ['scripts/sync-site-quality.mjs'], { encoding: 'utf8' });
assert.equal(result.status, 0, result.stderr);
files.forEach((file, i) => assert(read(file) === before[i], 'Idempotent quality generation: ' + file));
console.log('PASS current inventory, all premium previews, workflow URIs, manual intake, per-service payment schema, fix landmarks/navigation and idempotence.');
