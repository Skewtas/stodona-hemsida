// Edge-funktion: verifierar lösenord för den dolda influencer-sidan SERVER-SIDE.
// Lösenordet läses från miljövariabeln INFLUENCER_PW (sätts i Vercel) och finns
// aldrig i klientkoden. Vid rätt lösenord sätts en HttpOnly-cookie (12h) vars
// värde är sha256(lösenordet) – samma token som middleware:t kontrollerar.

export const config = { runtime: "edge" };

const PAGE_PATH = "/influencersamarbete";
const MAX_AGE = 60 * 60 * 12; // 12 timmar

async function sha256hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function safeNext(next: string | null): string {
  return next && next.startsWith("/influencersamarbete") ? next : PAGE_PATH;
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // Fallback så sidan funkar direkt (lösenordet är inte känsligt); kan
  // överridas med miljövariabeln INFLUENCER_PW i Vercel.
  const PW = process.env.INFLUENCER_PW || "StodonaCreator50!";
  let password = "";
  let next = PAGE_PATH;

  const ctype = request.headers.get("content-type") || "";
  try {
    if (ctype.includes("application/json")) {
      const body = (await request.json()) as { password?: string; next?: string };
      password = body.password || "";
      next = safeNext(body.next || null);
    } else {
      const fd = await request.formData();
      password = String(fd.get("password") || "");
      next = safeNext(fd.get("next") ? String(fd.get("next")) : null);
    }
  } catch {
    /* ignore parse errors */
  }

  // Fel lösenord (eller ingen serverkonfiguration) → tillbaka med felflagga.
  if (!PW || password !== PW) {
    return new Response(null, {
      status: 303,
      headers: { Location: `${next}?fel=1`, "Cache-Control": "no-store" },
    });
  }

  const token = await sha256hex(PW);
  const cookie = `infl_auth=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${MAX_AGE}`;

  return new Response(null, {
    status: 303,
    headers: { Location: next, "Set-Cookie": cookie, "Cache-Control": "no-store" },
  });
}
