const {chromium}=require('playwright');
const fs=require('node:fs');const path=require('node:path');
const base=process.env.SITE_QA_URL||'http://127.0.0.1:4173/';
const output=path.resolve(__dirname,'../artifacts/browser-qa');fs.mkdirSync(output,{recursive:true});
const assert=(condition,message)=>{if(!condition)throw new Error(message)};
(async()=>{
 const browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL||'msedge',headless:true});
 const errors=[];const results=[];
 const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
 let response=await page.goto(base);assert(response.status()===200,'Home page failed');
 await page.waitForFunction(()=>document.querySelectorAll('.demo-cell').length===16);
 await page.evaluate(()=>document.fonts.ready);
 await page.locator('#demo-check').click();
 assert((await page.locator('#demo-status').innerText()).includes('Mark every cell'),'Empty board feedback failed');
 const first=page.locator('.demo-cell').first();await first.click();assert(await first.getAttribute('data-state')==='1','First tap must shade');
 await first.click();assert(await first.getAttribute('data-state')==='2','Second tap must mark white');
 await first.focus();await page.keyboard.press('ArrowRight');
 assert(await page.evaluate(()=>document.activeElement===document.querySelectorAll('.demo-cell')[1]),'Keyboard navigation failed');
 await page.locator('#demo-reset').click();
 for(let i=0;i<16;i++)await page.locator('#demo-hint').click();
 assert((await page.locator('#demo-status').innerText()).includes('Puzzle complete'),'Verified demo solution failed');
 await page.locator('#demo-reset').click();
 assert(await page.locator('.demo-cell[data-state="0"]').count()===16,'Reset failed');
 await page.locator('details summary').first().click();assert(await page.locator('details').first().getAttribute('open')!==null,'FAQ interaction failed');
 await page.locator('details summary').first().click();
 await page.evaluate(()=>{document.querySelectorAll('img[loading]').forEach(i=>i.loading='eager')});
 await page.waitForFunction(()=>Array.from(document.images).every(i=>i.complete&&i.naturalWidth>0));
 await page.evaluate(()=>scrollTo(0,0));
 await page.screenshot({path:path.join(output,'desktop.png'),fullPage:true});
 results.push('Desktop: demo cycle, solution, reset, keyboard, FAQ and all images pass.');
 for(const width of [320,390,768,1440]){
  await page.setViewportSize({width,height:width<760?844:1000});await page.goto(base);await page.waitForFunction(()=>document.querySelectorAll('.demo-cell').length===16);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Horizontal overflow at '+width);
  if(width===390){
   await page.locator('.menu-toggle').click();assert(await page.locator('.menu-toggle').getAttribute('aria-expanded')==='true','Mobile menu failed');
   await page.locator('#main-nav a[href="#play"]').first().click();assert(await page.locator('.menu-toggle').getAttribute('aria-expanded')==='false','Mobile navigation did not close');
   await page.evaluate(()=>scrollTo(0,0));
   await page.screenshot({path:path.join(output,'mobile.png'),fullPage:false});
   await page.screenshot({path:path.join(output,'mobile-full.png'),fullPage:true});
  }
  results.push('No horizontal overflow at '+width+'px.');
 }
 await page.setViewportSize({width:390,height:844});
 for(const slug of ['privacy','terms','legal','data-deletion','support']){
  response=await page.goto(base+slug+'/');assert(response.status()===200,'Legal route failed: '+slug);
  assert(await page.locator('h1').count()===1,'Missing legal heading '+slug);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Legal page overflow: '+slug);
  if(slug==='privacy')await page.screenshot({path:path.join(output,'privacy-mobile.png'),fullPage:true});
 }
 results.push('All five legal/support pages return 200 and fit mobile.');
 assert(errors.length===0,'Browser errors: '+errors.join('; '));
 fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({passed:true,checks:results,date:new Date().toISOString()},null,2));
 console.log(results.join('\n'));
 await browser.close()
})().catch(error=>{console.error(error.stack);process.exit(1)});
