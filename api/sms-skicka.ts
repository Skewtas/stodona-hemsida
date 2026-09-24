// Intern SMS-funktion (Node.js-runtime).
//
// Chatten körs i Vercels Edge-miljö, och därifrån bryts anslutningen till
// SureSMS ("Network connection lost", 2026-09-25) – medan Node-funktioner som
// Bokis och fakturapåminnelserna når den utan problem. Därför skickas alla
// chattens SMS härifrån.
//
//   POST { mobil: "+467…", text }  med headern x-intern-nyckel: SMS_INTERN_NYCKEL
//   → { ok: true } | { ok: false, fel }
//
// Bara sajtens egen server känner nyckeln – ingen utifrån kan skicka SMS i
// Stodonas namn. Mottagaren måste vara ett svenskt mobilnummer.

const SURESMS = 'https://api.suresms.com/Script/SendSMS.aspx';

function lika(a: string, b: string): boolean {
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

const svara = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') return svara({ ok: false, fel: 'Method not allowed' }, 405);
  const nyckel = process.env.SMS_INTERN_NYCKEL ?? '';
  if (!nyckel || !lika(request.headers.get('x-intern-nyckel') ?? '', nyckel)) return svara({ ok: false, fel: 'Obehörig' }, 401);

  let kropp: { mobil?: unknown; text?: unknown };
  try {
    kropp = await request.json();
  } catch {
    return svara({ ok: false, fel: 'Ogiltig JSON' }, 400);
  }
  const mobil = String(kropp.mobil ?? '');
  const text = String(kropp.text ?? '');
  if (!/^\+467\d{8}$/.test(mobil)) return svara({ ok: false, fel: 'Ogiltigt mobilnummer' }, 400);
  if (!text || text.length > 480) return svara({ ok: false, fel: 'Ogiltig text' }, 400);

  const apinyckel = process.env.SURESMS_API_KEY?.trim();
  if (!apinyckel) return svara({ ok: false, fel: 'SURESMS_API_KEY saknas' }, 503);

  const params = new URLSearchParams({ login: 'apikey', password: apinyckel, to: mobil, text, from: 'Stodona.se' });
  try {
    const svar = await fetch(`${SURESMS}?${params.toString()}`);
    const rad = (await svar.text()).trim();
    // SureSMS svarar "Message sent." (eller äldre "OK: …") – allt annat är ett misslyckande.
    if (!svar.ok || !(/^ok\b/i.test(rad) || /^message sent/i.test(rad))) {
      console.error(`sms-skicka: SureSMS avvisade (${svar.status}): ${rad.slice(0, 120)}`);
      return svara({ ok: false, fel: `SureSMS ${svar.status}: ${rad.slice(0, 120)}` }, 502);
    }
    return svara({ ok: true });
  } catch (fel) {
    console.error('sms-skicka: SureSMS gick inte att nå', fel);
    return svara({ ok: false, fel: `SureSMS gick inte att nå: ${String(fel).slice(0, 100)}` }, 502);
  }
}

export default { fetch: handler };
