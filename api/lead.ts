// Vercel Serverless Function: Lead capture + storage
// POST: Save a new lead to Vercel KV + send email via Resend
// GET: Retrieve all leads (password protected)

export const config = {
  runtime: 'edge',
};

async function kvRequest(url: string, token: string, command: string[]) {
  const res = await fetch(`${url}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  });
  return res.json();
}

export default async function handler(request: Request) {
  const KV_URL = process.env.KV_REST_API_URL;
  const KV_TOKEN = process.env.KV_REST_API_TOKEN;
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const ADMIN_PASSWORD = process.env.LEADS_ADMIN_PASSWORD || 'stodona2026';

  // GET: Retrieve leads
  if (request.method === 'GET') {
    const url = new URL(request.url);
    const password = url.searchParams.get('password');

    if (password !== ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (KV_URL && KV_TOKEN) {
      try {
        const result = await kvRequest(KV_URL, KV_TOKEN, ['LRANGE', 'leads', '0', '-1']);
        const leads = (result.result || []).map((item: string) => JSON.parse(item));
        return new Response(JSON.stringify({ leads, count: leads.length }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error('KV read error:', error);
      }
    }

    // Fallback: return empty
    return new Response(JSON.stringify({ leads: [], count: 0, note: 'KV not configured' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // POST: Save new lead
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const data = await request.json();
    const { email, phone, name, source, timestamp, page } = data;

    if (!email && !phone) {
      return new Response(JSON.stringify({ error: 'E-post eller telefon krävs' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const sourceLabels: Record<string, string> = {
      welcome_popup: '🎁 Välkomst-popup',
      exit_intent: '🚪 Exit-intent',
      footer_newsletter: '📧 Newsletter',
      blog_lead_magnet: '📥 Städchecklista',
      sticky_cta: '📱 Ring mig',
    };

    const lead = {
      id: crypto.randomUUID(),
      email: email || '',
      phone: phone || '',
      name: name || '',
      source: source || 'unknown',
      sourceLabel: sourceLabels[source] || source,
      page: page || '',
      timestamp: timestamp || new Date().toISOString(),
      status: 'new',
    };

    // Store in KV
    if (KV_URL && KV_TOKEN) {
      try {
        await kvRequest(KV_URL, KV_TOKEN, ['LPUSH', 'leads', JSON.stringify(lead)]);
      } catch (error) {
        console.error('KV write error:', error);
      }
    }

    // Send notification email via Resend
    if (RESEND_API_KEY) {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <div style="background: #1a1a2e; color: white; padding: 20px; border-radius: 12px 12px 0 0;">
            <h2 style="margin: 0;">🎯 Nytt lead</h2>
            <p style="margin: 4px 0 0; opacity: 0.8; font-size: 13px;">${lead.sourceLabel}</p>
          </div>
          <div style="background: #f8f8f8; padding: 20px; border: 1px solid #eee; border-radius: 0 0 12px 12px;">
            ${email ? `<p><strong>📧</strong> <a href="mailto:${email}">${email}</a></p>` : ''}
            ${phone ? `<p><strong>📱</strong> <a href="tel:${phone}">${phone}</a></p>` : ''}
            <p style="font-size: 12px; color: #666;">Sida: ${lead.page} | ${new Date(lead.timestamp).toLocaleString('sv-SE')}</p>
          </div>
        </div>
      `;

      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Stodona Leads <onboarding@resend.dev>',
            to: 'info@stodona.se',
            subject: `Nytt lead: ${lead.sourceLabel} – ${email || phone}`,
            html: emailHtml,
          }),
        });
      } catch (error) {
        console.error('Resend error:', error);
      }

      // Abandoned Booking Automated Email
      if (lead.source === 'abandoned_booking' && email) {
        const abandonedHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <div style="padding: 20px; text-align: center; border: 1px solid #eee; border-radius: 12px;">
              <h2 style="color: #1a1a2e;">Hej, vi såg att du påbörjade en bokning!</h2>
              <p>Vi på Stodona strävar efter att leverera Stockholms bästa städning. Var det något du undrade över som hindrade dig från att slutföra bokningen?</p>
              <p>Som ett litet tack för att du överväger oss ger vi dig just nu <strong>10% rabatt</strong> på din första städning om du använder koden <strong>STODONA10</strong>.</p>
              <a href="https://boka.stodona.se" style="display: inline-block; background-color: #1a1a2e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 20px; font-weight: bold;">Slutför min bokning</a>
              <p style="margin-top: 30px; font-size: 13px; color: #666; text-align: left;">
                Svara gärna på det här mejlet om du har några frågor så hjälper vi dig direkt!<br/><br/>
                Med vänliga hälsningar,<br/>Teamet på Stodona
              </p>
            </div>
          </div>
        `;

        try {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'Stodona <info@stodona.se>',
              to: email,
              subject: 'Behöver du hjälp med din bokning? (+ 10% rabatt)',
              html: abandonedHtml,
            }),
          });
        } catch (abandonedError) {
          console.error('Resend abandoned email error:', abandonedError);
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Lead API error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
