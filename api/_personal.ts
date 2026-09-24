// Personalchatten: en GÖMD sida på stodona.se (PERSONALCHATT_SIDA) där
// personalen provar Camilla-chatten som valfri kund, med riktiga bokningar i
// TimeWave. Sidan länkas inte, finns inte i sitemapen och är noindex.
//
// Skyddet sitter på servern:
//  * middleware.ts visar bara sidan för den som loggat in med namn och
//    personallösenordet (PERSONAL_PW).
//  * api/chat.ts och api/kund-bankid.ts slår bara på självservicen när
//    anropet har en giltig personalkaka OCH kommer från personalchatten.
//    Den vanliga chatten på sajten påverkas inte.
// Namnet följer med i självservicens logg och i kommentaren på varje flytt
// i TimeWave, så att det syns vem som gjort vad.
//
// Kakan: "<namn i base64url>.<HMAC-SHA256(PERSONAL_PW, namn)>", HttpOnly, 12 h.

/** Adressen till den gömda sidan. Måste stämma med routen i src/App.tsx. */
export const PERSONALCHATT_SIDA = '/personalchatt';

/** Personalchatten finns bara när ett personallösenord är satt. */
export function personalchattPa(): boolean {
  return Boolean(process.env.PERSONAL_PW);
}

export const PERSONAL_KAKA = 'stodona_personal';
const GILTIG_SEKUNDER = 12 * 3600;

async function signera(text: string): Promise<string> {
  const nyckel = await crypto.subtle.importKey('raw', new TextEncoder().encode(process.env.PERSONAL_PW ?? ''), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', nyckel, new TextEncoder().encode(text));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function base64url(text: string): string {
  return btoa(String.fromCharCode(...new TextEncoder().encode(text))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function franBase64url(text: string): string {
  const bin = atob(text.replace(/-/g, '+').replace(/_/g, '/'));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

/** Jämförelse i konstant tid, så att lösenord och signaturer inte kan gissas via svarstiden. */
export function lika(a: string, b: string): boolean {
  const x = new TextEncoder().encode(a);
  const y = new TextEncoder().encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

/** Namnet på den inloggade i personalen, eller null. */
export async function personalNamn(request: Request): Promise<string | null> {
  if (!process.env.PERSONAL_PW) return null;
  const varde = new RegExp(`(?:^|;\\s*)${PERSONAL_KAKA}=([^;]+)`).exec(request.headers.get('cookie') ?? '')?.[1];
  const [namnDel, sig] = (varde ?? '').split('.');
  if (!namnDel || !sig) return null;
  try {
    const namn = franBase64url(namnDel);
    return lika(sig, await signera(namn)) ? namn : null;
  } catch {
    return null;
  }
}

export async function personalKaka(namn: string): Promise<string> {
  return `${PERSONAL_KAKA}=${base64url(namn)}.${await signera(namn)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${GILTIG_SEKUNDER}`;
}

/** Inloggningssidan för personalen. Skickas i stället för sajten till den som inte loggat in. */
export function personalInloggning(fel: boolean): Response {
  const html = `<!doctype html><html lang="sv"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>Stodona – personal</title>
<style>body{margin:0;font-family:system-ui,-apple-system,sans-serif;background:#f6f3ee;color:#1f1f1f;display:flex;min-height:100vh;align-items:center;justify-content:center;padding:16px}
form{background:#fff;border-radius:20px;padding:28px;width:100%;max-width:340px;box-shadow:0 8px 30px rgba(0,0,0,.08)}
h1{font-size:19px;margin:0 0 4px}p{font-size:14px;color:#555;margin:0 0 18px;line-height:1.45}
label{display:block;font-size:13px;margin:12px 0 4px}input{width:100%;box-sizing:border-box;padding:11px 12px;border:1px solid #ddd;border-radius:12px;font-size:15px}
button{margin-top:18px;width:100%;padding:12px;border:0;border-radius:12px;background:#1f1f1f;color:#fff;font-size:15px;cursor:pointer}
.fel{color:#b00020;font-size:13px;margin-top:10px}</style></head>
<body><form method="post" action="/api/personal-login">
<h1>Personalchatt</h1><p>Endast för Stodonas personal. Här provar ni Camilla-chatten som valfri kund, med riktiga bokningar. Ombokningar ändras på riktigt i TimeWave.</p>
<label for="namn">Ditt namn</label><input id="namn" name="namn" required maxlength="40" autocomplete="name">
<label for="losenord">Personallösenord</label><input id="losenord" name="losenord" type="password" required autocomplete="current-password">
${fel ? '<p class="fel">Fel lösenord. Försök igen.</p>' : ''}<button type="submit">Logga in</button></form></body></html>`;
  return new Response(html, {
    status: 401,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' },
  });
}
