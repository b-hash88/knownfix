import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
let pages = 0;
for (const file of fs.readdirSync(root, { recursive: true })) {
  if (!file.endsWith('.html') || /^(?:\.git|\.impeccable|test-results)[\\/]/.test(file)) continue;
  const html = fs.readFileSync(new URL(file.replaceAll('\\', '/'), root), 'utf8');
  const script = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]).find(s => s.includes('var measurementId='));
  if (!script) continue;
  let choice = 'denied';
  const handlers = {}, windowHandlers = {}, appended = [];
  const status = {};
  const context = {
    URL, location: { href: 'https://example.com/tool?private=canary#secret' },
    localStorage: { getItem: () => choice, setItem: (_key, value) => { choice = value; } },
    addEventListener: (name, handler) => { windowHandlers[name] = handler; },
    document: { title: 'Synthetic QA', referrer: 'https://example.org/ref?private=canary', readyState: 'loading',
      addEventListener: (name, handler) => { handlers[name] = handler; },
      getElementById: () => null, querySelectorAll: () => [status], createElement: () => ({}),
      head: { appendChild: item => appended.push(item) } },
  };
  context.window = context;
  vm.runInNewContext(script, context);
  handlers.DOMContentLoaded();
  assert.equal(appended.length, 0, file);
  assert.equal(typeof windowHandlers.storage, 'function', `${file}: reconcile consent from another tab`);
  const storage = () => windowHandlers.storage({ key: 'knownfix.analytics.consent' });
  const select = value => handlers.click({ target: { closest: selector => selector === '[data-knownfix-consent]' ? { dataset: { knownfixConsent: value } } : null } });
  const consent = () => [...context.dataLayer].reverse().find(a => a[0] === 'consent')[2];
  choice = 'granted'; storage();
  assert.equal(appended.length, 1, `${file}: load after cross-tab opt-in`);
  assert.equal(consent().analytics_storage, 'granted', file);
  choice = 'denied'; storage();
  assert.equal(consent().analytics_storage, 'denied', file);
  select('granted');
  assert.equal(consent().analytics_storage, 'granted', `${file}: re-grant restores SDK consent`);
  select('denied'); select('granted');
  assert.equal(consent().analytics_storage, 'granted', `${file}: same-tab re-grant`);
  assert.equal(appended.length, 1, `${file}: no duplicate loader`);
  assert.equal(context.dataLayer.filter(a => a[0] === 'config').length, 1, `${file}: no duplicate config/page view`);
  assert.equal(context.dataLayer.filter(a => a[0] === 'event').length, 0, `${file}: no replay of denied actions`);
  for (const args of context.dataLayer.filter(a => a[0] === 'consent')) {
    assert.equal(args[2].ad_storage, 'denied', file);
    assert.equal(args[2].ad_user_data, 'denied', file);
    assert.equal(args[2].ad_personalization, 'denied', file);
  }
  assert(!JSON.stringify(context.dataLayer).includes('canary'), file);
  choice = ''; windowHandlers.storage({ key: null });
  assert.equal(consent().analytics_storage, 'denied', `${file}: cleared preference revokes storage`);
  pages++;
}
assert(pages >= 74);
console.log(`PASS ${pages} common analytics wrappers: cross-tab consent, re-grant, clear/revocation, one loader/config, no replay or private data.`);
