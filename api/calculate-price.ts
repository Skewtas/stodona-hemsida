// Edge-proxy mot bokningssystemets prismotor.
//
// Prismotorn på boka.stodona.se skickar ingen Access-Control-Allow-Origin, så
// webbläsaren kan inte fråga den direkt från stodona.se. Den här funktionen
// vidarebefordrar frågan server-side, vilket gör att bokningswidgeten kan visa
// exakt samma pris som kunden möts av i nästa steg – i stället för en egen
// uppskattning som drev iväg från verkligheten.
//
// Endast prisberäkning passerar. Inga kunduppgifter, ingen rabattkod.

export const config = { runtime: "edge" };

const UPPSTROMS = "https://boka.stodona.se/api/calculate-price";

// Tjänsterna widgeten får fråga om. Stavningen måste matcha bokningssystemets
// SERVICES exakt.
const TILLATNA_TJANSTER = [
  "Hemstädning",
  "Storstädning",
  "Flyttstädning",
  "Fönsterputsning",
  "Företagsstädning",
  "Byggstädning",
];

const TILLATNA_FREKVENSER = [
  "Engång",
  "Varje vecka",
  "Varannan vecka",
  "Var tredje vecka",
  "Var fjärde vecka",
];

const json = (body: unknown, status = 200, cache = "no-store") =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": cache },
  });

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let data: Record<string, unknown>;
  try {
    data = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ error: "Ogiltig JSON" }, 400);
  }

  const service = String(data.service ?? "");
  if (!TILLATNA_TJANSTER.includes(service)) {
    return json({ error: "Okänd tjänst" }, 400);
  }

  const sqm = Number(data.sqm);
  if (!Number.isFinite(sqm) || sqm < 10 || sqm > 1000) {
    return json({ error: "Ogiltig yta" }, 400);
  }

  const frequency = TILLATNA_FREKVENSER.includes(String(data.frequency ?? ""))
    ? String(data.frequency)
    : "Engång";

  // Postnumret påverkar inte priset (verifierat mot flera postnummer), men
  // prismotorn vill ha ett, så vi skickar kundens om det ser rimligt ut.
  const zip = String(data.postalCode ?? "").replace(/\D/g, "");
  const postalCode = /^\d{5}$/.test(zip) ? zip : "11122";

  try {
    const svar = await fetch(UPPSTROMS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service,
        postalCode,
        streetAddress: "Drottninggatan 1",
        sqm: Math.round(sqm),
        frequency,
        extraServices: [],
        useRut: true,
        bindingMonths: 0,
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!svar.ok) return json({ error: "upstream_error" }, 502);
    const pris = await svar.json();

    // Skicka bara vidare det widgeten behöver.
    const bindning = (pris.bindingOptions || []).find(
      (o: { months: number }) => o.months === 12,
    );
    return json(
      {
        price: pris.price ?? null,
        priceBeforeRut: pris.priceBeforeRut ?? null,
        lowestWithBinding: bindning?.price ?? null,
      },
      200,
      // Priset ändras sällan; en kort cache räcker för att slippa ett anrop
      // per tangenttryckning från samma besökare.
      "public, max-age=300",
    );
  } catch {
    return json({ error: "upstream_error" }, 502);
  }
}
