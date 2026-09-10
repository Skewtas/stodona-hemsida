// Vercel Edge Function: ansökningar från /samarbeten-och-affiliate.
// Mejlar ansökan till Mikaela via Resend. Saknas RESEND_API_KEY svarar vi 501
// och klienten faller tillbaka på Formspree – samma mönster som
// api/job-application.ts, så en ansökan aldrig går förlorad.

export const config = {
  runtime: 'edge',
};

const MOTTAGARE = 'mikaela.wigert@stodona.se';

function esc(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Fälten i den ordning de ska stå i mejlet. Nyckel = namnet klienten skickar. */
const FALT: Array<[string, string]> = [
  ['namn', 'Namn'],
  ['epost', 'E-post'],
  ['telefon', 'Telefon'],
  ['ort', 'Ort'],
  ['typ', 'Typ av samarbete'],
  ['kanaler', 'Kanaler'],
  ['handle', 'Användarnamn'],
  ['foljare', 'Följare totalt'],
  ['lank', 'Länk till kanal eller mediakit'],
  ['publik', 'Om publiken'],
  ['tidigare', 'Tidigare samarbeten'],
  ['ide', 'Idé'],
];

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    // Ingen mejlserver konfigurerad – låt klienten ta Formspree-vägen.
    return json({ error: 'not_configured' }, 501);
  }

  let data: Record<string, unknown>;
  try {
    data = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ error: 'Ogiltig förfrågan' }, 400);
  }

  const namn = String(data.namn || '').trim();
  const epost = String(data.epost || '').trim();
  if (!namn || !epost) {
    return json({ error: 'Namn och e-post krävs' }, 400);
  }

  const rader = FALT.filter(([nyckel]) => String(data[nyckel] || '').trim())
    .map(
      ([nyckel, etikett]) =>
        `<tr>
           <td style="padding:8px 14px 8px 0;color:#6f6a63;font-size:13px;vertical-align:top;white-space:nowrap">${etikett}</td>
           <td style="padding:8px 0;color:#151515;font-size:14px">${esc(data[nyckel]).replace(/\n/g, '<br />')}</td>
         </tr>`
    )
    .join('');

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;max-width:640px;margin:0 auto">
      <div style="background:#1a1a1a;color:#f4f1eb;padding:22px 24px;border-radius:14px 14px 0 0">
        <h2 style="margin:0;font-size:18px">🤝 Ny samarbetsansökan</h2>
        <p style="margin:6px 0 0;opacity:.75;font-size:13px">${esc(namn)} – ${esc(data.typ || 'okänd typ')}</p>
      </div>
      <div style="background:#f4f1eb;padding:22px 24px;border:1px solid #e7e2d9;border-top:0;border-radius:0 0 14px 14px">
        <table style="border-collapse:collapse;width:100%">${rader}</table>
        <p style="margin:22px 0 0;font-size:12px;color:#6f6a63">
          Skickad från /samarbeten-och-affiliate · ${new Date().toLocaleString('sv-SE', { timeZone: 'Europe/Stockholm' })}
        </p>
      </div>
    </div>`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Stodona Samarbeten <onboarding@resend.dev>',
        to: MOTTAGARE,
        // Svara-till sätts till den sökande, så du kan svara direkt ur mejlet.
        reply_to: epost,
        subject: `Samarbetsansökan: ${namn}${data.handle ? ` (${data.handle})` : ''}`,
        html,
      }),
    });

    if (!res.ok) {
      const detalj = await res.text().catch(() => '');
      console.error('Resend error:', res.status, detalj);
      return json({ error: 'send_failed' }, 502);
    }
    return json({ ok: true }, 200);
  } catch (error) {
    console.error('Resend error:', error);
    return json({ error: 'send_failed' }, 502);
  }
}

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}
