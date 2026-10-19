import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const measurementId = 'G-PPPE9TYRM2';
let pages = 0;
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
    if (!scripts.length) continue;
    assert.equal(scripts.length, 1, file.href);
    assert(scripts[0].includes(measurementId), file.href);
    for (let consent of ['', 'denied', 'granted']) {
      const appended = [], handlers = {};
      const context = {
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
          consent = 'denied';
          for (const event of ['catalog_search','service_select','mcp_kit_action','mcp_response_action','retry_planner_action','guide_action','free_skill_download']) context.knownfixTrack(event,'test');
          assert.equal(eventCount(),0,'No action event after consent withdrawal');
        }
      } else assert.equal(context.dataLayer,undefined);
    }
    pages++;
  }
}
inspect(root);
assert(pages >= 70);
console.log(`PASS ${pages} pages: one owner GA4 ID, no Google loader before consent, sanitized URLs/referrers and advertising disabled.`);
