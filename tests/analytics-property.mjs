import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const measurementId = 'G-PPPE9TYRM2';
let pages = 0;
const untracked = new Set([
  'google6ce9421df1dec432.html',
  'examples/patchnote.html',
  'reports/KnownFix_20260829_Website-First-Look-Sample_RPT.html',
  'reports/KnownFix_20260830_Evidence-Audit-Sample_RPT.html',
]);
function inspect(folder) {
  for (const entry of fs.readdirSync(folder, {withFileTypes:true})) {
    if (entry.name.startsWith('.') || entry.name === 'test-results') continue;
    const file = new URL(entry.name + (entry.isDirectory() ? '/' : ''), folder);
    if (entry.isDirectory()) { inspect(file); continue; }
    if (!entry.name.endsWith('.html')) continue;
    const html = fs.readFileSync(file, 'utf8');
    assert(!html.includes('G-781DC76YQN'), file.href);
    const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
      .map(match => match[1]).filter(script => script.includes('var measurementId='));
    const relative = file.href.slice(root.href.length);
    if (untracked.has(relative)) {
      assert.equal(scripts.length, 0, `${relative}: intentionally untracked`);
      continue;
    }
    assert.equal(scripts.length, 1, file.href);
    assert(scripts[0].includes(measurementId), file.href);
    for (let consent of ['', 'denied', 'granted']) {
      const appended = [], handlers = {};
      const context = {
        addEventListener:()=>{},
        localStorage:{getItem:()=>consent}, URL,
        location:{href:'https://example.com/page?secret=private#token'},
        document:{title:'Public page',referrer:'https://example.org/ref?email=private',readyState:'loading',
          addEventListener:(name,fn)=>{handlers[name]=fn;}, createElement:()=>({}),
          head:{appendChild:item=>appended.push(item)},querySelectorAll:()=>[]},
      };
      context.window=context;
      vm.runInNewContext(scripts[0],context);
      if (consent) handlers.DOMContentLoaded();
      assert.equal(appended.length, consent === 'granted' ? 1 : 0, file.href);
      if (consent === 'granted') {
        const config = context.dataLayer.find(args=>args[0]==='config');
        assert.equal(config[1],measurementId);
        assert.equal(config[2].page_location,'https://example.com/page');
        assert.equal(config[2].page_referrer,'https://example.org/ref', file.href);
        assert.equal(config[2].allow_google_signals,false);
        assert.equal(config[2].allow_ad_personalization_signals,false);
        assert(!JSON.stringify(context.dataLayer).includes('private'));
        assert.equal(context.dataLayer.filter(args=>args[0]==='config').length,1);
        const eventCount = () => context.dataLayer.filter(args=>args[0]==='event').length;
        if (typeof context.knownfixTrack === 'function') {
          context.knownfixTrack('constructor','test');
          assert.equal(eventCount(),0,'Inherited event names must not pass the allowlist');
          // Each marked action must reach GA once. A form is a submit, not an input click.
          for (const match of html.matchAll(/<(\w+)\b[^>]*data-knownfix-event="([^"]+)"[^>]*>/g)) {
            const [, tag, name] = match;
            const label = match[0].match(/data-knownfix-context="([^"]+)"/)?.[1] || '';
            const target = { tagName: tag.toUpperCase(), dataset: { knownfixEvent: name, knownfixContext: label } };
            const event = { target: { closest: selector => selector === '[data-knownfix-event]' ? target : null } };
            const before = eventCount();
            handlers.click(event);
            assert.equal(eventCount(), before + (tag === 'form' ? 0 : 1), `${relative}: click ${name}`);
            if (tag === 'form') {
              handlers.submit(event);
              assert.equal(eventCount(), before + 1, `${relative}: submit ${name} once`);
            }
          }
          const beforeWithdrawal = eventCount();
          consent = 'denied';
          for (const event of ['catalog_search','service_select','mcp_kit_action','mcp_response_action','retry_planner_action','guide_action','free_skill_download']) context.knownfixTrack(event,'test');
          assert.equal(eventCount(),beforeWithdrawal,'No action event after consent withdrawal');
        }
      } else assert.equal(context.dataLayer,undefined);
    }
    pages++;
  }
}
inspect(root);
assert(pages >= 70);
console.log(`PASS ${pages} pages: one owner GA4 ID, complete marked-action coverage, submit-only forms, consent gating, sanitized URLs/referrers; ${untracked.size} deliberate exclusions.`);
