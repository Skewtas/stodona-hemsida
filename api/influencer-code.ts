// Edge-proxy: hämtar den inloggade influencerns personliga följarkod (15%) från
// Bokis. Den delade hemligheten (INFLUENCER_API_KEY) och Bokis-URL:en ligger
// server-side (aldrig i browsern). Returnerar bara följarkoden – aldrig INFL50ST.
export const config = { runtime: "edge" };

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const url = process.env.BOKIS_FOLLOWER_URL; // t.ex. https://boka.stodona.se/api/influencer/follower-code
  const key = process.env.INFLUENCER_API_KEY;
  if (!url || !key) {
    return json({ error: "not_configured" }, 501);
  }

  let email = "";
  let ref = "";
  try {
    const body = (await request.json()) as { email?: string; ref?: string };
    email = (body.email || "").trim();
    ref = (body.ref || "").trim();
  } catch {
    /* ignore */
  }
  if (!email && !ref) {
    return json({ found: false }, 200);
  }

  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-influencer-api-key": key },
      body: JSON.stringify({ email, ref }),
    });
    const data = await r.json();
    return json(data, r.status);
  } catch {
    return json({ error: "upstream_error" }, 502);
  }
}

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}
