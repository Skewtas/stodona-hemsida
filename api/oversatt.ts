// Översätter sajtens texter till engelska när besökaren väljer EN.
//
// Webbläsaren (src/utils/oversattning.ts) skickar de svenska texter som syns på
// sidan. Varje text översätts EN gång och sparas i KV för alltid, så nästa
// besökare får översättningen direkt. Bara det som saknas går till Claude.
//
// Skydd mot att endpointen används som gratis översättningstjänst: bara anrop
// från sajten (Origin), begränsad längd per anrop och ett tak per IP-adress för
// nya (osparade) texter.

import Anthropic from '@anthropic-ai/sdk';

export const config = { runtime: 'edge' };

const MODELL = 'claude-haiku-4-5-20251001';
const VERSION = 'v4';
const MAX_TEXTER = 60;
const MAX_TECKEN_PER_TEXT = 4000;
const MAX_TECKEN_TOTALT = 12000;
/** Nya texter som en IP-adress får översätta per timme. */
const TAK_PER_IP = 1500;

const TILLATNA = [/^https:\/\/(www\.)?stodona\.se$/, /^https:\/\/[a-z0-9-]+\.vercel\.app$/, /^http:\/\/localhost(:\d+)?$/];

const JSON_HEADERS = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
const svara = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });

async function kv(kommando: (string | number)[]): Promise<unknown> {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(kommando.map(String)),
  });
  if (!res.ok) throw new Error(`KV svarade ${res.status}`);
  return (await res.json()).result;
}

async function nyckel(text: string): Promise<string> {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return `oversatt:en:${VERSION}:${[...new Uint8Array(d)].slice(0, 16).map((b) => b.toString(16).padStart(2, '0')).join('')}`;
}

const INSTRUKTION = `You translate texts from the website of Stodona, a professional cleaning company in Stockholm, Sweden, from Swedish into natural, warm, fluent English for international customers.

Rules:
- Translate the meaning, not word by word. Keep the tone: friendly, confident, clear.
- Keep unchanged: the brand Stodona, people's names (e.g. Camilla, Mikaela), Swedish place names (Stockholm, Södermalm, Nacka, Solna …), e-mail addresses, URLs, phone numbers, prices, numbers and emojis.
- "RUT" / "RUT-avdrag": write "RUT deduction" (the Swedish tax deduction for household services). "kr" stays "kr" (SEK).
- Always use these names (same as the site menu): hemstädning = home cleaning, storstädning = deep cleaning, fönsterputs/fönsterputsning = window cleaning, flyttstädning = move-out cleaning, företagsstädning/kontorsstädning = office cleaning, byggstädning = post-construction cleaning, trappstädning = stairwell cleaning, städabonnemang = cleaning subscription, kundportalen = the customer portal, nöjd-kund-garanti = satisfaction guarantee, städare/städerska = cleaner, barnvakt/barnpassning = babysitter/childcare. Keep the capitalisation of the original (a title-cased Swedish heading gets a title-cased English heading).
- Keep leading/trailing punctuation, bullets, arrows and line breaks as in the original.
- If a text is already English, or has nothing to translate, return it exactly as it is.
- Never add explanations.

You get a JSON array of items {"t": text} or {"t": text, "in": sentence}. With "in", the text is only ONE PIECE of the Swedish sentence (the rest is styled separately on the page): translate ONLY that piece, so that it reads naturally inside the English translation of the whole sentence. Never return the sentence.

Answer with ONLY a JSON array of strings – the translations of "t", same length, same order.`;

const SKILJE = ' \u241F ';

/** "text ␟ mening" → { t, in }. */
function tolka(nyckeltext: string): { t: string; in?: string } {
  const i = nyckeltext.indexOf(SKILJE);
  return i < 0 ? { t: nyckeltext } : { t: nyckeltext.slice(0, i), in: nyckeltext.slice(i + SKILJE.length) };
}

async function oversatt(texter: string[]): Promise<string[] | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  const client = new Anthropic({ apiKey });
  for (let forsok = 0; forsok < (texter.length === 1 ? 2 : 1); forsok++) {
    try {
      const svar = await client.messages.create({
        model: MODELL,
        max_tokens: 8000,
        system: INSTRUKTION,
        messages: [{ role: 'user', content: JSON.stringify(texter.map(tolka)) }],
      });
      const text = svar.content.map((b) => (b.type === 'text' ? b.text : '')).join('').trim();
      const json = text.slice(text.indexOf('['), text.lastIndexOf(']') + 1);
      const lista = JSON.parse(json) as unknown;
      if (Array.isArray(lista) && lista.length !== texter.length) console.error(`oversatt: ${lista.length} svar på ${texter.length} texter`);
      if (Array.isArray(lista) && lista.length === texter.length && lista.every((x) => typeof x === 'string')) {
        // Om modellen ändå tar med meningen: behåll bara biten före skiljetecknet.
        return (lista as string[]).map((x) => x.split('\u241F')[0].trimEnd() || x);
      }
    } catch (fel) {
      console.error('oversatt: försök misslyckades', String(fel).slice(0, 200));
    }
  }
  return null;
}

/**
 * Svarar modellen med fel antal rader kastas hela gruppen – dela då upp den
 * och försök igen, ner till en text i taget. Det som ändå inte går blir kvar
 * på svenska (och sparas inte), så det provas igen vid nästa besök.
 */
async function oversattDelat(texter: string[]): Promise<(string | null)[]> {
  const hela = await oversatt(texter);
  if (hela) return hela;
  if (texter.length === 1) return [null];
  const mitt = Math.ceil(texter.length / 2);
  const [a, b] = await Promise.all([oversattDelat(texter.slice(0, mitt)), oversattDelat(texter.slice(mitt))]);
  return [...a, ...b];
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') return svara({ error: 'Method not allowed' }, 405);
  const origin = request.headers.get('origin') ?? '';
  if (!TILLATNA.some((r) => r.test(origin))) return svara({ error: 'Forbidden' }, 403);

  let texter: string[];
  try {
    const body = (await request.json()) as { texter?: unknown };
    texter = Array.isArray(body.texter) ? body.texter.filter((t): t is string => typeof t === 'string') : [];
  } catch {
    return svara({ error: 'Invalid JSON' }, 400);
  }
  texter = [...new Set(texter.map((t) => t.trim()).filter((t) => t && t.length <= MAX_TECKEN_PER_TEXT))].slice(0, MAX_TEXTER);
  if (!texter.length) return svara({ oversattningar: {} });
  if (texter.reduce((n, t) => n + t.length, 0) > MAX_TECKEN_TOTALT) return svara({ error: 'Too much text' }, 413);

  const oversattningar: Record<string, string> = {};
  const nycklar = await Promise.all(texter.map(nyckel));
  let sparade: (string | null)[] = [];
  try {
    sparade = ((await kv(['MGET', ...nycklar])) as (string | null)[] | null) ?? [];
  } catch (fel) {
    console.error('oversatt: KV gick inte att läsa', fel);
  }
  const saknas: number[] = [];
  texter.forEach((t, i) => (typeof sparade[i] === 'string' ? (oversattningar[t] = sparade[i] as string) : saknas.push(i)));
  if (!saknas.length) return svara({ oversattningar });

  const ip = (request.headers.get('x-forwarded-for') ?? 'okand').split(',')[0].trim();
  const takNyckel = `oversatt:tak:${ip}:${Math.floor(Date.now() / 3600000)}`;
  try {
    const antal = Number(await kv(['INCRBY', takNyckel, saknas.length]));
    if (antal === saknas.length) await kv(['EXPIRE', takNyckel, 3700]);
    if (antal > TAK_PER_IP) return svara({ oversattningar, begransad: true });
  } catch {
    /* utan KV: översätt ändå, men inget sparas */
  }

  const nya = await oversattDelat(saknas.map((i) => texter[i]));
  const set: string[] = [];
  saknas.forEach((i, j) => {
    const en = nya[j];
    if (en === null) return;
    oversattningar[texter[i]] = en;
    set.push(nycklar[i], en);
  });
  if (set.length) await kv(['MSET', ...set]).catch((fel) => console.error('oversatt: kunde inte spara', fel));
  return svara({ oversattningar });
}
