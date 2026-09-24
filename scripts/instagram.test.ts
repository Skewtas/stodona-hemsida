import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import test from 'node:test';

// Never contact Meta, the model, KV or the booking system in this test.
process.env.STODONA_LOKAL = 'true';
process.env.IG_APP_SECRET = 'local-test-secret';
process.env.IG_VERIFY_TOKEN = 'local-test-verify';
process.env.KANAL_INTERN_NYCKEL = 'local-test-internal-key-123456';
process.env.INSTAGRAM_CHAT = 'test';
process.env.IG_TESTARE = '123';
const { default: handler } = await import('../api/instagram');
const { lokalUtkorg, instagramLage } = await import('../api/_instagram');

test('Instagram verifies requests, limits testers, deduplicates and yields to staff', async () => {
  const originalFetch = globalThis.fetch;
  let questions = 0;
  let notes = 0;
  globalThis.fetch = async (input, init) => {
    assert.equal(String(input), 'https://www.stodona.se/api/chat');
    assert.equal(new Headers(init?.headers).get('x-kanal-nyckel'), process.env.KANAL_INTERN_NYCKEL);
    const body = JSON.parse(String(init?.body));
    if (body.handling === 'notering') {
      notes++;
      return new Response('{}');
    }
    questions++;
    return new Response('Vilken städning gäller det? [[val: Hemstädning | Flyttstädning]]');
  };
  const endpoint = 'https://www.stodona.se/api/instagram';
  async function event(message: Record<string, unknown>, sender = '123', recipient = 'business') {
    const body = JSON.stringify({ object: 'instagram', entry: [{ messaging: [{ sender: { id: sender }, recipient: { id: recipient }, message }] }] });
    const signature = 'sha256=' + createHmac('sha256', 'local-test-secret').update(body).digest('hex');
    const response = await handler(new Request(endpoint, { method: 'POST', headers: { 'x-hub-signature-256': signature }, body }));
    assert.equal(response.status, 200);
  }
  try {
    const verified = await handler(new Request(endpoint + '?hub.mode=subscribe&hub.verify_token=local-test-verify&hub.challenge=456'));
    assert.equal(verified.status, 200);
    assert.equal(await verified.text(), '456');
    assert.equal((await handler(new Request(endpoint + '?hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=456'))).status, 403);
    assert.equal((await handler(new Request(endpoint, { method: 'POST', body: '{}' }))).status, 401);
    await event({ mid: 'test-outsider', text: 'hej' }, '999');
    assert.equal(questions, 0);
    await event({ mid: 'test-1', text: 'hej' });
    assert.equal(questions, 1);
    assert.equal(lokalUtkorg.length, 1);
    assert.deepEqual(lokalUtkorg[0].snabbsvar, ['Hemstädning → Hemstädning', 'Flyttstädning → Flyttstädning']);
    await event({ mid: 'test-1', text: 'hej' });
    assert.equal(questions, 1);
    await event({ mid: 'test-ai-echo', text: lokalUtkorg[0].text, is_echo: true }, 'business', '123');
    assert.equal(notes, 0);
    await event({ mid: 'test-human', text: 'Jag hjälper dig, hälsningar kundservice', is_echo: true }, 'business', '123');
    await event({ mid: 'test-2', text: 'tack' });
    assert.equal(questions, 1);
    assert.equal(lokalUtkorg.length, 1);
    assert.equal(notes, 2);
    process.env.INSTAGRAM_CHAT = 'invalid';
    assert.equal(instagramLage(), 'av');
  } finally {
    globalThis.fetch = originalFetch;
  }
});
