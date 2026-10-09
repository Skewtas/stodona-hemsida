import fs from 'node:fs';
import http from 'node:http';
import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';
const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html');res.end(fs.readFileSync('public/mail-identifiering.html'));}).listen(0,'127.0.0.1');
await new Promise(r=>server.on('listening',r));
const browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
try{
 const page=await browser.newPage();await page.setViewport({width:390,height:844});
 const actions=[];await page.setRequestInterception(true);
 page.on('request',request=>{if(request.url().endsWith('/api/mail-identity')){const body=JSON.parse(request.postData());actions.push(body.action);request.respond({status:200,contentType:'application/json',body:JSON.stringify(body.action==='send'?{ok:true,meddelande:'En kod har skickats.'}:{ok:true,message:'Tack! Du är identifierad. Vi fortsätter med ditt mejlärende.'})});}else request.continue();});
 const base=`http://127.0.0.1:${server.address().port}`;
 await page.goto(base+'/#'+'a'.repeat(64));assert.equal(actions.length,0);assert.equal(new URL(page.url()).hash,'');
 await page.screenshot({path:'/tmp/stodona-mail-identity-mobile.png',fullPage:true});
 await page.type('#phone','0701234567');await page.click('#submit');await page.waitForFunction(()=>!document.querySelector('#codeBox').hidden);
 await page.type('#code','123456');await page.click('#submit');await page.waitForFunction(()=>document.querySelector('#form').hidden);
 assert.deepEqual(actions,['send','verify']);
 await page.goto(base);assert.equal(await page.$eval('#form',e=>e.hidden),true);
 console.log('Mobile identity page passed: no automatic SMS, token removed from URL, explicit send+verify, missing token handled.');
}finally{await browser.close();server.close();}
