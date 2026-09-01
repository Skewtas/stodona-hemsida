// Vercel Edge Middleware – RIKTIGT lösenordsskydd på servernivå för den dolda
// influencer-sidan. Utan giltig cookie serveras en elegant inloggningssida i
// stället för sidans innehåll (sidans SPA-HTML skickas aldrig till obehöriga).
//
// Lösenordet läses från miljövariabeln INFLUENCER_PW (sätts i Vercel) och finns
// aldrig i klientkoden eller i detta repo. Cookie-token = sha256(INFLUENCER_PW).
//
// Byt URL: uppdatera PAGE_PATH här, matcher nedan, route i App.tsx samt
// safeNext/PAGE_PATH i api/influencer-auth.ts.
import { next } from "@vercel/edge";

export const config = {
  matcher: ["/influencersamarbete-9f3c7a2b"],
};

async function sha256hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function loginPage(showError: boolean, path: string): string {
  const error = showError
    ? `<p class="err">Lösenordet stämmer inte. Kontrollera uppgifterna eller kontakta din kontaktperson på Stodona.</p>`
    : "";
  return `<!doctype html>
<html lang="sv"><head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, nofollow" />
<title>Stodonas influencersamarbete</title>
<style>
  :root { --bg:#f4f1eb; --ink:#151515; --muted:#6f6a63; --accent:#c8b6a6; }
  * { box-sizing:border-box; }
  body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center;
    background:var(--bg); color:var(--ink); font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif; padding:24px; }
  .card { width:100%; max-width:420px; background:#fff; border-radius:28px; padding:40px 32px;
    box-shadow:0 30px 80px rgba(21,21,21,.12); text-align:center; }
  .badge { display:inline-flex; align-items:center; gap:8px; font-size:11px; font-weight:700; letter-spacing:.18em;
    text-transform:uppercase; color:var(--muted); background:var(--bg); padding:8px 16px; border-radius:999px; margin-bottom:22px; }
  h1 { font-family:Georgia,"Times New Roman",serif; font-size:26px; line-height:1.2; margin:0 0 12px; }
  p { color:var(--muted); font-size:15px; line-height:1.6; margin:0 0 24px; }
  label { display:block; text-align:left; font-size:14px; font-weight:600; margin-bottom:8px; }
  input { width:100%; padding:14px 16px; border:1px solid rgba(21,21,21,.12); border-radius:16px; font-size:16px;
    background:var(--bg); outline:none; transition:.2s; }
  input:focus { border-color:var(--accent); box-shadow:0 0 0 3px rgba(200,182,166,.4); background:#fff; }
  button { width:100%; margin-top:18px; padding:15px; border:0; border-radius:999px; background:var(--ink); color:var(--bg);
    font-size:16px; font-weight:600; cursor:pointer; transition:.2s; }
  button:hover { background:var(--accent); color:var(--ink); }
  .err { color:#b91c1c; background:#fef2f2; border:1px solid #fecaca; border-radius:14px; padding:12px 14px; font-size:14px; margin:0 0 20px; }
  .foot { margin:22px 0 0; font-size:12px; }
</style>
</head><body>
  <div class="card">
    <span class="badge">✦ Endast för inbjudna</span>
    <h1>Välkommen till Stodonas influencersamarbete</h1>
    <p>Ange lösenordet du har fått av din kontaktperson på Stodona.</p>
    ${error}
    <form method="POST" action="/api/influencer-auth">
      <input type="hidden" name="next" value="${path}" />
      <label for="pw">Lösenord</label>
      <input id="pw" name="password" type="password" autocomplete="current-password" autofocus required />
      <button type="submit">Öppna samarbetssidan</button>
    </form>
    <p class="foot">Har du inte fått något lösenord? Kontakta din kontaktperson på Stodona.</p>
  </div>
</body></html>`;
}

export default async function middleware(request: Request) {
  const url = new URL(request.url);
  const PW = process.env.INFLUENCER_PW;

  // Läs cookie
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(/(?:^|;\s*)infl_auth=([a-f0-9]{64})/);
  const cookieToken = match ? match[1] : "";

  const expected = PW ? await sha256hex(PW) : "";
  const authed = Boolean(expected) && cookieToken === expected;

  if (authed) {
    return next(); // släpp igenom till appen
  }

  // Inte inloggad → servera inloggningssidan (server-nivå, inte bara visuellt)
  const showError = url.searchParams.get("fel") === "1";
  return new Response(loginPage(showError, url.pathname), {
    status: 401,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "x-robots-tag": "noindex, nofollow",
    },
  });
}
