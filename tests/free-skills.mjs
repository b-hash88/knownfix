import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const data = JSON.parse(fs.readFileSync(new URL('free-skills.json', root), 'utf8'));
const read = name => fs.readFileSync(new URL(name, root), 'utf8');
const api = 'https://knownfix-backend-28.b-hash88.deno.net';
assert.equal(data.skills.length, 4);
for (const skill of data.skills) {
  assert.equal(read(`free-skills/${skill.id}.md`), skill.body);
  for (const file of ['free-skills.html', `free-skills/${skill.id}.html`]) {
    const html = read(file);
    assert(html.includes(`${api}/free-skill/${skill.id}`));
    assert(html.includes(`data-knownfix-context="${skill.id}"`));
    const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
    for (const [, script] of scripts) {
      new vm.Script(script);
      for (const consent of ['', 'denied', 'granted']) {
        const appended = [];
        const handlers = {};
        const context = {
          localStorage: { getItem: () => consent },
          location: { href: 'https://example.com/skill?secret=private#token' },
          URL,
          document: {
            title: 'Skill', referrer: '', readyState: 'loading',
            addEventListener: (name, fn) => { handlers[name] = fn; },
            createElement: () => ({}), head: { appendChild: item => appended.push(item) },
            querySelectorAll: () => [],
          },
        };
        context.window = context;
        vm.runInNewContext(script, context);
        if (consent) handlers.DOMContentLoaded();
        context.knownfixTrack('free_skill_download', skill.id);
        if (consent !== 'granted') {
          assert.equal(appended.length, 0);
          assert.equal(context.dataLayer, undefined);
        } else {
          assert.equal(appended.length, 1);
          const events = context.dataLayer.filter(args => args[0] === 'event');
          assert.equal(events.length, 1);
          assert.equal(events[0][1], 'free_skill_download');
          assert.equal(events[0][2].event_context, skill.id);
          assert(!JSON.stringify(context.dataLayer).includes('secret=private'));
          context.knownfixTrack('unknown', 'private');
          assert.equal(context.dataLayer.filter(args => args[0] === 'event').length, 1);
        }
      }
    }
  }
  for (const file of ['index.html', 'sitemap.xml', 'llms.txt', 'llms-full.txt']) assert(read(file).includes(skill.id));
}
assert(!read('llms-full.txt').includes('## Reusable master prompt'));
console.log('Four skills: bodies, discovery, tracked links and consent-gated sanitized GA4 events passed.');
