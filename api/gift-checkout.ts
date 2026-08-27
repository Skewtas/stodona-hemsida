// Vercel Serverless Function: skapar en Stripe Checkout Session för presentkort.
// Kräver env-variabeln STRIPE_SECRET_KEY (sätts i Vercel). Anropar Stripes REST-
// API direkt med fetch – ingen SDK/dependency behövs.
// Returnerar { url } att skicka kunden till. Om nyckeln saknas svarar den 501
// så att frontend faller tillbaka på det manuella beställningsflödet.

export const config = { runtime: "edge" };

export default async function handler(request: Request) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
  if (!STRIPE_SECRET_KEY) {
    return json({ error: "Stripe är inte konfigurerat", fallback: true }, 501);
  }

  try {
    const data = await request.json();
    const amount = Math.round(Number(data.amount) || 0); // kronor
    if (!amount || amount < 100) {
      return json({ error: "Ogiltigt belopp" }, 400);
    }

    const origin = new URL(request.url).origin;
    const params = new URLSearchParams();
    params.append("mode", "payment");
    params.append("success_url", `${origin}/presentkort?betalt=1`);
    params.append("cancel_url", `${origin}/presentkort?avbrutet=1`);
    params.append("line_items[0][quantity]", "1");
    params.append("line_items[0][price_data][currency]", "sek");
    params.append("line_items[0][price_data][unit_amount]", String(amount * 100));
    params.append("line_items[0][price_data][product_data][name]", "Presentkort – Städning hos Stodona");
    if (data.email) params.append("customer_email", String(data.email));
    // Beställningsuppgifter sparas som metadata så de syns i Stripe.
    for (const [k, v] of Object.entries({
      belopp: `${amount} kr`,
      kopare: data.buyer,
      mottagare: data.recipient,
      mottagare_epost: data.recipientEmail,
      leverans: data.delivery,
      halsning: data.message,
    })) {
      if (v) params.append(`metadata[${k}]`, String(v).slice(0, 480));
    }

    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });
    const session = await res.json();
    if (!res.ok) {
      console.error("Stripe error:", session);
      return json({ error: "Kunde inte starta betalning" }, 502);
    }
    return json({ url: session.url });
  } catch (err) {
    console.error("gift-checkout error:", err);
    return json({ error: "Internal server error" }, 500);
  }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
