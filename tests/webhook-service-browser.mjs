import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
if (!process.env.KNOWNFIX_PLAYWRIGHT_PATH) throw new Error('Provide installed Playwright path');
const { chromium } = require(process.env.KNOWNFIX_PLAYWRIGHT_PATH);
const root = fileURLToPath(new URL('../', import.meta.url));
const server = http.createServer((req,res)=>{
 const pathname = new URL(req.url,'http://localhost').pathname;
 const file = path.resolve(root,'.'+decodeURIComponent(pathname));
 if (!file.startsWith(root) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return res.writeHead(404).end();
 res.writeHead(200,{'content-type':file.endsWith('.html')?'text/html':file.endsWith('.png')?'image/png':'text/plain'});
 fs.createReadStream(file).pipe(res);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true});
try {
 for(const [label,width,height] of [['desktop',1440,1000],['mobile',390,844]]){
  const context=await browser.newContext({viewport:{width,height}});
  await context.addInitScript(()=>{try{localStorage.setItem('knownfix.analytics.consent','denied');}catch{}});
  const page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  let submitted;
  await page.route('https://knownfix-backend-28.b-hash88.deno.net/**',route=>{
   if(new URL(route.request().url()).pathname==='/service-orders'){
    submitted=route.request().postDataJSON();
    return route.fulfill({status:400,contentType:'application/json',body:JSON.stringify({detail:'Mocked test rejection; no order created.'})});
   }
   return route.abort();
  });
  await page.goto(base+'/services/webhook-reliability-review.html');
  assert(await page.getByRole('heading',{name:'Webhook Reliability Review',exact:true}).isVisible());
  assert(await page.getByText('$179',{exact:true}).isVisible());
  assert(await page.getByText('3 BUSINESS DAYS',{exact:true}).isVisible());
  assert.equal(await page.getByRole('link',{name:'Order this review',exact:true}).getAttribute('href'),'https://b-hash88.github.io/knownfix/services.html?service=webhook-reliability-review#order');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  if(process.env.KNOWNFIX_SERVICE_SCREENSHOT_DIR) await page.screenshot({path:path.join(process.env.KNOWNFIX_SERVICE_SCREENSHOT_DIR,'KnownFix_20261014_Webhook-Service-'+label+'_IMG.png'),fullPage:true});
  await page.goto(base+'/services.html?service=webhook-reliability-review#order');
  assert.equal(await page.locator('#service-id').inputValue(),'webhook-reliability-review');
  assert.match(await page.locator('#target-hint').innerText(),/Public GitHub repository/);
  assert.equal(await page.locator('#publish-target').isChecked(),false);
  await page.locator('#target-url').fill('https://github.com/example/project');
  await page.locator('#authorized').check();
  await page.getByRole('button',{name:'Create private order',exact:true}).click();
  await page.getByText('Order not created: Mocked test rejection; no order created.',{exact:true}).waitFor();
  assert.equal(submitted.serviceId,'webhook-reliability-review');
  assert.equal(submitted.authorizationConfirmed,true);
  assert.equal(submitted.publishTarget,false);
  assert.equal(await page.locator('#checkout').isVisible(),false);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert.deepEqual(errors,[]);
  console.log(label+': approved price/turnaround, readable scope, repository hint, private defaults and mocked order error passed; no live order/payment.');
  await page.goto(base+'/services/saas-security-exposure-review.html');
  assert(await page.getByRole('heading',{name:'SaaS Security Exposure Review',exact:true}).isVisible());
  assert(await page.getByText('$299',{exact:true}).isVisible());
  assert((await page.getByRole('link',{name:'Request scope approval',exact:true}).first().getAttribute('href')).startsWith('mailto:knownfix.agent@gmail.com'));
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  if(process.env.KNOWNFIX_SERVICE_SCREENSHOT_DIR) await page.screenshot({path:path.join(process.env.KNOWNFIX_SERVICE_SCREENSHOT_DIR,'KnownFix_20261014_SaaS-Security-'+label+'_IMG.png'),fullPage:true});
  await page.goto(base+'/services.html?service=saas-security-exposure-review#order');
  assert(await page.locator('#order-submit').isDisabled());
  assert(await page.locator('#scope-approval').isVisible());
  assert.match(await page.locator('#target-hint').innerText(),/Scope approval required/);
  await page.locator('#service-id').selectOption('webhook-reliability-review');
  assert(await page.locator('#order-submit').isEnabled());
  assert.equal(await page.locator('#scope-approval').isVisible(),false);
  console.log(label+': SaaS $299 offer, approval contact, disabled checkout and existing service recovery passed.');
  await page.goto(base+'/services/verified-repo-fix.html');
  assert(await page.getByRole('heading',{name:'Verified Repo Fix',exact:true}).isVisible());
  assert(await page.getByText('$149',{exact:true}).isVisible());
  assert(await page.getByText('PAY ON VERIFIED DELIVERY',{exact:true}).isVisible());
  assert((await page.getByRole('link',{name:'Request a scoped fix',exact:true}).first().getAttribute('href')).startsWith('mailto:knownfix.agent@gmail.com'));
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  if(process.env.KNOWNFIX_SERVICE_SCREENSHOT_DIR) await page.screenshot({path:path.join(process.env.KNOWNFIX_SERVICE_SCREENSHOT_DIR,'KnownFix_20261018_Repo-Fix-'+label+'_IMG.png'),fullPage:true});
  submitted=undefined;
  await page.goto(base+'/services.html?service=verified-repo-fix#order');
  assert(await page.locator('#order-submit').isDisabled());
  assert(await page.locator('#scope-approval').isVisible());
  assert.match(await page.locator('#scope-approval').innerText(),/due only on verified patch delivery/);
  assert.equal(await page.locator('.card-bridge').isVisible(),false);
  await page.locator('#order-form').dispatchEvent('submit');
  assert.equal(submitted,undefined);
  assert.equal(await page.locator('#checkout').isVisible(),false);
  await page.locator('#service-id').selectOption('webhook-reliability-review');
  assert(await page.locator('#order-submit').isEnabled());
  assert.equal(await page.locator('#scope-approval').isVisible(),false);
  assert.deepEqual(errors,[]);
  console.log(label+': Verified Repo Fix request-only route, no forced submit/payment and normal checkout recovery passed.');
  await context.close();
 }
} finally {await browser.close();await new Promise(resolve=>server.close(resolve));}

