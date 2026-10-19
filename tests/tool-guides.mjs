import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { CONFIG_EXAMPLES, RESPONSE_EXAMPLES, RETRY_EXAMPLES } from '../scripts/tool-examples.mjs';
import { checkConfig } from '../scripts/mcp-kit-core.mjs';
import { inspectResponse } from '../scripts/mcp-response-core.mjs';
import { planRetries } from '../scripts/retry-planner-core.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = file => fs.readFileSync(path.join(root, file), 'utf8').replace(/\r\n/g, '\n');
const ids = ['mcp-connection-troubleshooting', 'mcp-response-validation', 'webhook-retry-budget'];
for (let repeat = 0; repeat < 2; repeat++) {
  assert(checkConfig(CONFIG_EXAMPLES.remote.text).ok);
  assert.equal(checkConfig(CONFIG_EXAMPLES.remote.text).warnings.length, 1);
  assert(checkConfig(CONFIG_EXAMPLES.stdio.text).ok);
  assert.equal(checkConfig(CONFIG_EXAMPLES.conflict.text).ok, false);
  assert(inspectResponse(RESPONSE_EXAMPLES.result.text).ok);
  assert.equal(inspectResponse(RESPONSE_EXAMPLES.tool.text).kind, 'Tool-level error flag');
  assert.equal(inspectResponse(RESPONSE_EXAMPLES.conflict.text).ok, false);
  for (const [key, expected] of Object.entries({ standard: [215, 137.5, 6], tight: [215, 137.5, 3], capped: [155, 155, 5] })) {
    const plan = planRetries(RETRY_EXAMPLES[key].config);
    assert.deepEqual([plan.durationMax, plan.durationExpected, plan.attemptsWithinBudget], expected);
  }
}
assert.deepEqual(planRetries(RETRY_EXAMPLES.tight.config).rows.slice(0, 4).map(row => row.finishLatest), [10, 25, 45, 75]);
let pages = 0;
for (const id of ids) {
  const file = `guides/${id}.html`, html = read(file);
  assert.equal((html.match(/<h1>/g) || []).length, 1);
  assert(html.includes(`rel="canonical" href="https://b-hash88.github.io/knownfix/${file}"`));
  assert(!/<meta[^>]+name="robots"[^>]+noindex/i.test(html));
  assert(html.includes('type="application/ld+json"'));
  assert.equal((html.match(/data-knownfix-context="download-example"/g) || []).length, 3);
  assert.equal((html.match(/googletagmanager.com\/gtag\/js/g) || []).length, 1);
  const jsonld = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/)[1]);
  assert.equal(jsonld['@type'], 'TechArticle');
  assert.equal(jsonld.mainEntityOfPage, `https://b-hash88.github.io/knownfix/${file}`);
  for (const match of html.matchAll(/href="([^"#]+)"/g)) {
    const href = match[1];
    if (/^https?:/.test(href)) continue;
    const destination = path.resolve(path.dirname(path.join(root, file)), href.split('#')[0]);
    assert(fs.existsSync(destination), `${file}: missing ${href}`);
  }
  const script = html.match(/<script>\s*([\s\S]*?)<\/script>/)[1];
  for (const initial of ['', 'denied', 'granted']) {
    let consent = initial;
    const appended = [], handlers = {};
    const context = { URL, localStorage: { getItem: () => consent }, location: { href: 'https://example.test/guide?canary=private#secret' },
      document: { title: 'KnownFix guide', referrer: 'https://example.test/?secret=private', readyState: 'loading', addEventListener: (key, value) => handlers[key] = value,
        head: { appendChild: element => appended.push(element) }, createElement: () => ({}), querySelectorAll: () => [] } };
    context.window = context;
    vm.runInNewContext(script, context);
    if (initial) handlers.DOMContentLoaded();
    assert.equal(appended.length, initial === 'granted' ? 1 : 0);
    context.knownfixTrack('guide_action', 'open-tool');
    if (initial === 'granted') {
      context.knownfixTrack('guide_action', 'private-canary');
      context.knownfixTrack('guide_action', 'constructor');
      context.knownfixTrack('constructor', 'open-tool');
      context.knownfixTrack('wrong_event', 'download-example');
      const events = context.dataLayer.filter(event => event[0] === 'event');
      assert.equal(events.length, 1);
      assert.equal(events[0][2].event_context, 'open-tool');
      consent = 'denied';
      context.knownfixTrack('guide_action', 'download-example');
      assert.equal(context.dataLayer.filter(event => event[0] === 'event').length, 1);
      assert(!JSON.stringify(context.dataLayer).includes('private'));
    } else assert.equal(context.dataLayer, undefined);
  }
  pages++;
}
const downloads = fs.readdirSync(path.join(root, 'guides/examples'));
assert.equal(downloads.length, 9);
for (const file of downloads) JSON.parse(read('guides/examples/' + file));
for (const file of ['mcp-connect.html', 'mcp-response.html', 'webhook-retry.html']) {
  const html = read(file);
  assert.equal((html.match(/id="example-case"/g) || []).length, 1);
  assert.equal((html.match(/id="worked-examples"/g) || []).length, 1);
  assert(html.includes('data-knownfix-context="read-guide"'));
}
for (const id of ids) {
  for (const file of ['sitemap.xml', 'llms.txt', 'llms-full.txt', 'index.html', 'free-skills.html']) assert(read(file).includes(`/guides/${id}.html`));
}
const privacy = read('privacy.html');
assert(!privacy.includes('retry_planner_action records only calculate, reset, copy-json or copy-checklist.'));
for (const label of ['example-standard', 'example-tight', 'example-capped', 'read-guide', 'guide_action', 'open-tool', 'download-example', 'related-guide']) assert(privacy.includes(label));
assert(read('scripts/sync-site-improvements.mjs').includes('example-standard, example-tight, example-capped or read-guide'));
const generated = ['mcp-connect.html', 'mcp-response.html', 'webhook-retry.html', 'index.html', 'free-skills.html', 'privacy.html', 'sitemap.xml', 'llms.txt', 'llms-full.txt', ...ids.map(id => `guides/${id}.html`)];
const before = generated.map(read);
const synced = spawnSync(process.execPath, ['scripts/sync-tool-guides.mjs'], { cwd: root, encoding: 'utf8' });
assert.equal(synced.status, 0, synced.stderr);
generated.forEach((file, index) => assert(read(file) === before[index], 'Generator must be idempotent: ' + file));
console.log(`PASS ${pages} guides, nine reproducible examples twice, local links/downloads/schema/discovery, consent/withdrawal/fixed events and idempotent generation.`);
