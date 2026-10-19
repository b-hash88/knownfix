import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
if(!process.env.KNOWNFIX_PLAYWRIGHT_PATH)throw new Error('Provide installed Playwright path');
const {chromium}=require(process.env.KNOWNFIX_PLAYWRIGHT_PATH);
const root=fileURLToPath(new URL('../',import.meta.url));
const server=http.createServer((req,res)=>{
 const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
 const rel=path.relative(root,file);
 if(rel.startsWith('..')||path.isAbsolute(rel)||!fs.existsSync(file)||!fs.statSync(file).isFile())return res.writeHead(404).end();
 const type={'.html':'text/html','.css':'text/css','.mjs':'text/javascript','.png':'image/png'}[path.extname(file)]||'text/plain';
 res.writeHead(200,{'content-type':type}); fs.createReadStream(file).pipe(res);
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true});
try{
 for(const [label,width,height] of [['Desktop',1440,1000],['Mobile',390,844]]){
  const context=await browser.newContext({viewport:{width,height}});
  await context.addInitScript(()=>{try{localStorage.setItem('knownfix.analytics.consent','denied');}catch{}});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',r=>new URL(r.request().url()).origin===base?r.continue():r.abort());
  for(const route of ['/examples/patchnote.html','/services/microsite-launch.html']){
   await page.goto(base+route);await page.locator('h1').waitFor();
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,route+' overflow');
   assert.equal(await page.locator('h1').count(),1);
   if(route.includes('patchnote')){await page.getByRole('link',{name:'Read a sample release',exact:true}).click();assert(page.url().endsWith('#sample'));await page.getByText('Can I sign up for Patchnote?',{exact:true}).click();assert(await page.getByText('No. It is a fictional demonstration, not a real service.',{exact:false}).isVisible());}
   if(process.env.KNOWNFIX_SCREENSHOT_DIR){fs.mkdirSync(process.env.KNOWNFIX_SCREENSHOT_DIR,{recursive:true});await page.screenshot({path:path.join(process.env.KNOWNFIX_SCREENSHOT_DIR,`KnownFix_20261019_${route.includes('patchnote')?'Microsite-Example':'Microsite-Service'}-${label}_IMG.png`),fullPage:true});}
  }
  await page.goto(base+'/services.html?service=microsite-launch');
  assert(await page.locator('#order-submit').isDisabled());
  assert((await page.locator('#scope-approval').innerText()).includes('Microsite Launch'));
  assert((await page.locator('#scope-approval a').getAttribute('href')).includes('Microsite%20Launch'));
  await page.locator('#service-id').selectOption('saas-security-exposure-review');
  assert((await page.locator('#scope-approval a').getAttribute('href')).includes('SaaS%20Security'));
  await page.locator('#service-id').selectOption('verified-repo-fix');
  assert((await page.locator('#scope-approval').innerText()).includes('verified patch delivery'));
  assert.deepEqual(errors,[]);await context.close();
 }
 console.log('PASS desktop/mobile microsite navigation, layout, consent-denied behavior, and all manual checkout contacts.');
}finally{await browser.close();await new Promise(r=>server.close(r));}
