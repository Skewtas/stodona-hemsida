import test from 'node:test';
import assert from 'node:assert/strict';
process.env.STODONA_LOKAL='true';process.env.CHAT_ENABLED='true';process.env.MAIL_CHANNEL_ENABLED='true';process.env.MAIL_CHANNEL_MODE='draft';process.env.ANTHROPIC_API_KEY='test-unused';process.env.KANAL_INTERN_NYCKEL='internal-test-key-at-least-24-characters';
const {default:chat,koraVerktyg}=await import('../api/chat');
const {samtalFor}=await import('../api/_kanaler');
test('actual chat boundary denies all mail confirmation handlers, including spoofed public calls',async()=>{
 const channel=await samtalFor('mail','bound-sender');
 for(const internal of [true,false]){
  const response=await chat(new Request('https://www.stodona.se/api/chat',{method:'POST',headers:{origin:'https://www.stodona.se',...(internal?{'x-kanal':'mail','x-kanal-avsandare':'bound-sender','x-kanal-nyckel':process.env.KANAL_INTERN_NYCKEL!}:{})},body:JSON.stringify({sessionId:channel.samtalsId,handling:'bekrafta',forslagId:'OF-12345678',lage:'personal'})}));
  assert.equal(response.status,403);
 }
});
test('real shared dispatcher blocks business writes, leads and customer changes without any outbound request',async()=>{
 const original=globalThis.fetch;let outbound=0;globalThis.fetch=async()=>{outbound++;throw Error('Unexpected network request');};
 try{
 for(const name of ['forbered_bokning','spara_kontakt','skicka_lead','eskalera_till_kundservice','valj_kund','execute','cancel']){
  const review={intent:'other',status:'draft' as const,request:'',nextStep:'',checked:[],proposed:[]};
  const text=await koraVerktyg(name,{},new Request('https://www.stodona.se/api/chat'),'test-session',true,false,{kanal:'mail',avsandare:'bound-sender',kontakt:''},review);
  assert.match(text,/enbart lagts som förslag/);
 }
 assert.equal(outbound,0);
 }finally{globalThis.fetch=original;}
});
test('real shared dispatcher cannot read private information without the bound SMS identity',async()=>{
 for(const name of ['hamta_bokningar','hamta_fakturor','hamta_utforda_stadningar','hitta_nya_tider','forbered_ombokning','forbered_avbokning']){
  const review={intent:'other',status:'draft' as const,request:'',nextStep:'',checked:[],proposed:[]};
  const text=await koraVerktyg(name,{bokning_id:'someone-elses-booking'},new Request('https://www.stodona.se/api/chat'),'unverified',true,false,{kanal:'mail',avsandare:'bound-sender',kontakt:''},review);
  assert.match(text,/\[\[bankid\]\]/);
 }
});

test('mail takeover survives content expiration until staff releases the thread',async()=>{
 const {taOver,slappTillAi,aiFarSvara}=await import('../api/_kanaler');
 const {taBort}=await import('../api/_lagring');
 const channel=await samtalFor('mail','takeover-retention');await taOver(channel.samtalsId,'Personal',1);
 await taBort(`kanal:samtal:${channel.samtalsId}`);
 const recreated=await samtalFor('mail','takeover-retention');assert.equal(aiFarSvara(recreated),false);
 await slappTillAi(recreated.samtalsId,'Personal');assert.equal(aiFarSvara(await samtalFor('mail','takeover-retention')),true);
});
