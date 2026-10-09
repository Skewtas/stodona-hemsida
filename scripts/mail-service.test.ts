import test from 'node:test';
import assert from 'node:assert/strict';
import { createMailService, validMailInput, type MailDependencies, type MailInput } from '../api/_mailService';
import { mailToolGate, type MailReview } from '../api/_mailPolicy';
import { createMailIdentityHandler } from '../api/_mailIdentityHandler';
import { mailImageBlocks } from '../api/_mailAttachments';
import type { Samtalsinfo } from '../api/_kanaler';

const message: MailInput = { mailbox: 'info@stodona.se', email: 'anna@example.com', name: 'Anna', messageId: 'm1', conversationId: 'c1', subject: 'Städning', receivedAt: '2026-10-05T08:00:00Z', thread: 'Kund: När kommer ni nästa gång?' };
function fixture() {
  const values = new Map<string, unknown>(), locks = new Map<string,string>(), channels = new Map<string,Samtalsinfo>();
  let identified = false, candidate: string | null = '1', calls = 0;
  const records: unknown[] = [];
  const d: MailDependencies = {
    store: { hamta: async <T>(k:string) => structuredClone(values.get(k) as T) ?? null, spara: async(k,v) => {values.set(k,structuredClone(v));}, lasa: async k => {if(locks.has(k))return false;locks.set(k,'ttl');return true;},taBort: async k=>{locks.delete(k);values.delete(k);},taOperationslas:async(k,o)=>{if(locks.has(k))return false;locks.set(k,o);return true;},slappOperationslas:async(k,o)=>{if(locks.get(k)===o)locks.delete(k);} },
    hash: async v => Buffer.from(v).toString('base64url'), origin: 'https://www.stodona.se',
    channel: async externalId => {if(!channels.has(externalId)) channels.set(externalId,{samtalsId:crypto.randomUUID(),externId:externalId,kanal:'mail',hanteras:'ai'} as Samtalsinfo);return channels.get(externalId)!;},
    getChannel: async id => [...channels.values()].find(c=>c.samtalsId===id) || null,
    canReply: i=>i.hanteras==='ai', identity: async(_,email)=>({email,candidateId:candidate,verifiedAt:identified?Date.now()+1000:undefined}),verified:async()=>identified,
    challenge:async(_,i)=>i.candidateId?'/mail-identifiering.html#secret':null,
    chat:async()=>{calls++;return{text:identified?'Din nästa städning är den verifierade tiden.':'Identifiera dig först. [[bankid]]',review:{intent:'booking_info',status:'draft',request:'Nästa städning',nextStep:'Granska svaret',checked:[],proposed:[]}};},
    update:async(_,r)=>{records.push(structuredClone(r));},
  };
  return {d,service:createMailService(d),values,locks,channels,records,get calls(){return calls;},identify(){identified=true;},unknown(){candidate=null;}};
}
test('phase 1 end-to-end: unverified → identity draft → acknowledgement → verified resume → acknowledged reply',async()=>{
  const f=fixture(),first=(await f.service.prepare(message)).draft!;
  assert.equal(first.review.status,'waiting_customer');assert.match(first.text,/https:\/\/www.stodona.se\/mail-identifiering/);
  assert.equal((await f.service.begin(first.id,1)).granted,true);await f.service.commit(first.id,1,'outlook-1');
  assert.equal((await f.service.prepare(message)).duplicate,true);f.identify();
  const resumed=(await f.service.prepare({...message,alreadyAnswered:true})).draft!;assert.equal(resumed.revision,2);assert.equal(resumed.needsIdentity,false);
  assert.equal((await f.service.begin(resumed.id,2)).granted,true);await f.service.commit(resumed.id,2,'outlook-2');
  assert.equal((await f.service.prepare(message)).duplicate,true);assert.equal(f.calls,2);
});
test('same message and concurrent draft reservation cannot produce two drafts',async()=>{
 const f=fixture(),d=(await f.service.prepare(message)).draft!;
 const results=await Promise.all([f.service.begin(d.id,1),f.service.begin(d.id,1)]);
 assert.equal(results.filter(x=>x.granted).length,1);assert.equal((await f.service.prepare(message)).duplicate,true);
});
test('timeout after Outlook reservation never retries the uncertain creation',async()=>{
 const f=fixture(),d=(await f.service.prepare(message)).draft!;await f.service.begin(d.id,1);
 assert.equal((await f.service.prepare(message)).manual,true);assert.equal((await f.service.begin(d.id,1)).granted,false);
});
test('same thread from a different sender has a separate unverified identity',async()=>{
 const f=fixture();await f.service.prepare(message);await f.service.prepare({...message,messageId:'m2',email:'other@example.com'});
 assert.equal(f.channels.size,2);assert.equal(new Set([...f.channels.values()].map(x=>x.samtalsId)).size,2);
});
test('unknown sender gets human review, no account data or identification token',async()=>{
 const f=fixture();f.unknown();const d=(await f.service.prepare(message)).draft!;
 assert.equal(d.review.status,'human_review');assert.doesNotMatch(d.text,/#secret|nästa städning/);
});
test('backend outage creates a safe human-review draft and retains source reference',async()=>{
 const f=fixture();f.d.chat=async()=>{throw Error('down');};const d=(await f.service.prepare(message)).draft!;
 assert.equal(d.review.status,'human_review');assert.equal(d.sourceId,message.messageId);assert.doesNotMatch(d.text,/bokad|avbokad/);
});
test('human takeover blocks draft reservation even after model finished',async()=>{
 const f=fixture(),d=(await f.service.prepare(message)).draft!;[...f.channels.values()][0].hanteras='manuell';
 assert.equal((await f.service.begin(d.id,1)).granted,false);assert.equal((await f.service.prepare({...message,messageId:'m2'})).manual,true);
});

// Scripted model tool choices exercise policy/routing, not language-model accuracy.
const scenarios = [
 ['När kommer ni nästa gång?','booking_info','hamta_bokningar','draft'],
 ['Kan vi byta fredag till tisdag?','reschedule','hitta_nya_tider','draft'],
 ['Kan Maria komma istället?','staff','hitta_nya_tider','draft'],
 ['Avboka nästa städning.','cancel','forbered_avbokning','draft'],
 ['Jag vill boka storstädning.','new_booking','forbered_bokning','human_review'],
 ['Jag hittar inte min faktura.','invoice','hamta_fakturor','draft'],
 ['Har ni fått min betalning?','payment','hamta_fakturor','draft'],
 ['Vad avser fakturan?','invoice','hamta_fakturor','draft'],
 ['Tisdag blir bra.','reschedule','forbered_ombokning','draft'],
 ['Flytta nästa tid (flera möjliga bokningar).','unclear','hitta_nya_tider','human_review'],
 ['Jag är arg och vill ha ersättning.','complaint','eskalera_till_kundservice','human_review'],
 ['Något AI:n inte förstår.','unclear','unknown','human_review'],
] as const;
for(const [text,intent,tool,status] of scenarios)test(`draft policy: ${text}`,()=>{
 const r:MailReview={intent:'',status:'draft',request:'',nextStep:'',checked:[],proposed:[]};
 mailToolGate('mail_review',{intent,status:intent==='unclear'?'waiting_customer':'draft',request:text,nextStep:'Granska'},r);
 const result=mailToolGate(tool,{},r);assert.equal(r.status,status);
 if(status==='human_review')assert.equal(typeof result,'string');else assert.equal(result,null);
});
test('all unlisted tools, sends and business writes are denied even if requested by the model',()=>{
 for(const name of ['send_email','bekrafta','cancelBooking','execute','skicka_lead','spara_kontakt','valj_kund','forbered_bokning']){
  const r:MailReview={intent:'other',status:'draft',request:'',nextStep:'',checked:[],proposed:[]};assert.equal(typeof mailToolGate(name,{},r),'string');assert.equal(r.status,'human_review');
 }
});
test('wrong mailbox and oversized history fail validation instead of truncating context',()=>{
 assert.equal(validMailInput(message,'info@stodona.se'),true);assert.equal(validMailInput(message,'other@stodona.se'),false);
 assert.equal(validMailInput({...message,thread:'a'.repeat(52001)},'info@stodona.se'),false);
});
test('unread PDF triggers staff review and never claims visual inspection',async()=>{
 const f=fixture(),d=(await f.service.prepare({...message,attachments:[{name:'faktura.pdf',contentType:'application/pdf',unread:true}]})).draft!;
 assert.equal(d.review.status,'human_review');assert.match(d.review.nextStep,/bilagorna/);
 assert.equal(mailImageBlocks([{name:'fake.png',contentType:'image/png',dataBase64:Buffer.from('<script>bad</script>').toString('base64')}]).length,0);
});
test('SMS identity refuses a valid code belonging to a different customer',async()=>{
 let finishes=0;const handler=createMailIdentityHandler({enabled:()=>true,get:async()=>({sessionId:'mail',authSessionId:'auth',email:'anna@example.com',candidateId:'1',expires:Date.now()+10000}),send:async()=>({ok:true,meddelande:''}),verify:async()=>({status:'klar',kundnummer:'2'}),select:async()=>({status:'klar',kundnummer:'2'}),match:async()=>'1',finish:async()=>{finishes++;}});
 const response=await handler(new Request('https://www.stodona.se/api/mail-identity',{method:'POST',headers:{origin:'https://www.stodona.se'},body:JSON.stringify({token:'abc',action:'verify',code:'123456'})}));
 assert.equal(response.status,403);assert.equal(finishes,0);
});
test('SMS identity rejects cross-origin requests and expired links',async()=>{
 const handler=createMailIdentityHandler({enabled:()=>true,get:async()=>null,send:async()=>{throw Error('must not send');},verify:async()=>{throw Error('must not verify');},select:async()=>{throw Error('must not select');},match:async()=>null,finish:async()=>{throw Error('must not finish');}});
 assert.equal((await handler(new Request('https://www.stodona.se/api/mail-identity',{method:'POST',headers:{origin:'https://evil.example'},body:'{}'}))).status,403);
 assert.equal((await handler(new Request('https://www.stodona.se/api/mail-identity',{method:'POST',headers:{origin:'https://www.stodona.se'},body:'{}'}))).status,410);
});

test('an already answered unknown message is skipped without invoking the model',async()=>{
 const f=fixture();assert.equal((await f.service.prepare({...message,alreadyAnswered:true})).duplicate,true);assert.equal(f.calls,0);
});

test('customer directory outage creates a manual review without calling the model',async()=>{
 const f=fixture();f.d.identity=async()=>{throw Error('directory down');};const draft=(await f.service.prepare(message)).draft!;
 assert.equal(draft.review.status,'human_review');assert.equal(f.calls,0);assert.equal(draft.sourceId,message.messageId);
});

test('unsafe or oversized mail is journalled for staff without producing a sendable draft',async()=>{
 const f=fixture(),result=await f.service.prepare({...message,manualReason:'Avvikande svarsadress kräver kontroll.'});
 assert.equal(result.manual,true);assert.equal(result.draft,undefined);assert.equal(f.calls,0);
 const draft=[...f.values.values()].find((x:any)=>x.sourceId===message.messageId) as any;
 assert.equal(draft.status,'failed');assert.equal((await f.service.begin(draft.id,1)).granted,false);
});

test('invoice disputes cannot admit an error or promise payment deferral in the customer draft',async()=>{
 const f=fixture();f.d.chat=async()=>({text:'Fakturan är fel. Vänta med betalning. Notering till personal: kreditera.',review:{intent:'invoice',status:'human_review',request:'Bestridd faktura',nextStep:'Kontrollera underlaget',checked:[],proposed:[]}});
 const draft=(await f.service.prepare(message)).draft!;assert.equal(draft.review.status,'human_review');
 assert.doesNotMatch(draft.text,/fakturan är fel|betalning|kreditera|Notering/i);assert.match(draft.text,/gå igenom underlaget/);
});
