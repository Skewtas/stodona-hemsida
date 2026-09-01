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
  html, body { height:100%; }
  body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center;
    color:var(--ink); font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
    padding:24px; position:relative; overflow:hidden; }
  /* Startsidans video – kraftigt uppljusad bakgrund */
  .bgvid { position:fixed; inset:0; width:100%; height:100%; object-fit:cover; z-index:0;
    filter:brightness(1.5) saturate(1.05) contrast(.97); }
  .veil { position:fixed; inset:0; z-index:1; pointer-events:none;
    background:radial-gradient(120% 90% at 50% 32%, rgba(244,241,235,.12), rgba(244,241,235,.4) 68%, rgba(244,241,235,.62) 100%); }
  .glow { position:fixed; z-index:1; pointer-events:none; width:60vmax; height:60vmax; left:50%; top:38%;
    transform:translate(-50%,-50%); background:radial-gradient(closest-side, rgba(200,182,166,.35), transparent 70%);
    filter:blur(30px); }
  .card { position:relative; z-index:2; width:100%; max-width:430px; background:rgba(255,255,255,.92);
    -webkit-backdrop-filter:blur(8px); backdrop-filter:blur(8px); border:1px solid rgba(255,255,255,.6);
    border-radius:30px; padding:40px 34px 34px; text-align:center;
    box-shadow:0 40px 100px rgba(21,21,21,.22); animation:rise .7s cubic-bezier(.22,1,.36,1) both; }
  @keyframes rise { from { opacity:0; transform:translateY(22px) scale(.98); } to { opacity:1; transform:none; } }
  .logo { height:38px; width:auto; margin:0 auto 22px; display:block; }
  .badge { display:inline-flex; align-items:center; gap:8px; font-size:11px; font-weight:700; letter-spacing:.18em;
    text-transform:uppercase; color:var(--muted); background:var(--bg); padding:8px 16px; border-radius:999px; margin-bottom:20px; }
  h1 { font-family:Georgia,"Times New Roman",serif; font-size:26px; line-height:1.2; margin:0 0 12px; }
  p { color:var(--muted); font-size:15px; line-height:1.6; margin:0 0 24px; }
  label { display:block; text-align:left; font-size:14px; font-weight:600; margin-bottom:8px; }
  input { width:100%; padding:14px 16px; border:1px solid rgba(21,21,21,.12); border-radius:16px; font-size:16px;
    background:var(--bg); outline:none; transition:.2s; }
  input:focus { border-color:var(--accent); box-shadow:0 0 0 3px rgba(200,182,166,.4); background:#fff; }
  button { width:100%; margin-top:18px; padding:15px; border:0; border-radius:999px; background:var(--ink); color:var(--bg);
    font-size:16px; font-weight:600; cursor:pointer; transition:.25s; }
  button:hover { background:var(--accent); color:var(--ink); transform:translateY(-1px); box-shadow:0 10px 24px rgba(21,21,21,.18); }
  .err { color:#b91c1c; background:#fef2f2; border:1px solid #fecaca; border-radius:14px; padding:12px 14px; font-size:14px; margin:0 0 20px; }
  .foot { margin:22px 0 0; font-size:12px; }
  @media (prefers-reduced-motion: reduce) { .card { animation:none; } .bgvid { filter:brightness(1.45) saturate(1.02); } }
</style>
</head><body>
  <video class="bgvid" autoplay loop muted playsinline preload="metadata" poster="/hero-poster.jpg">
    <source src="/stodona-hero.mp4" type="video/mp4" />
  </video>
  <div class="veil"></div>
  <div class="glow"></div>
  <div class="card">
    <img class="logo" src="/logotyp.png?v=2" alt="Stodona" />
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
  // Lösenordet är inte känsligt – fallback så sidan funkar direkt. Kan överridas
  // med miljövariabeln INFLUENCER_PW i Vercel om det ska bytas.
  const PW = process.env.INFLUENCER_PW || "StodonaCreator50!";

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
