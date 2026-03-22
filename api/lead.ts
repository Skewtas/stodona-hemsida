// Vercel Serverless Function: Lead capture endpoint
// Sends lead notifications to info@stodona.se via Resend

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
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
      welcome_popup: '🎁 Välkomst-popup (15% rabatt)',
      exit_intent: '🚪 Exit-intent popup (15% rabatt)',
      footer_newsletter: '📧 Footer newsletter',
      blog_lead_magnet: '📥 Blogg städchecklista',
      sticky_cta: '📱 Mobil sticky CTA (Ring mig)',
    };

    const sourceLabel = sourceLabels[source] || source;

    // Send email via Resend
    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    if (RESEND_API_KEY) {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1a1a2e; color: white; padding: 24px; border-radius: 12px 12px 0 0;">
            <h2 style="margin: 0 0 8px;">🎯 Nytt lead från stodona.se</h2>
            <p style="margin: 0; opacity: 0.8; font-size: 14px;">Källa: ${sourceLabel}</p>
          </div>
          <div style="background: #f8f8f8; padding: 24px; border: 1px solid #eee; border-radius: 0 0 12px 12px;">
            <table style="width: 100%; border-collapse: collapse;">
              ${email ? `<tr><td style="padding: 8px 0; font-weight: bold; width: 120px;">📧 E-post:</td><td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td></tr>` : ''}
              ${phone ? `<tr><td style="padding: 8px 0; font-weight: bold;">📱 Telefon:</td><td style="padding: 8px 0;"><a href="tel:${phone}">${phone}</a></td></tr>` : ''}
              ${name ? `<tr><td style="padding: 8px 0; font-weight: bold;">👤 Namn:</td><td style="padding: 8px 0;">${name}</td></tr>` : ''}
              <tr><td style="padding: 8px 0; font-weight: bold;">📄 Sida:</td><td style="padding: 8px 0;">${page || 'Okänd'}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">🕐 Tidpunkt:</td><td style="padding: 8px 0;">${new Date(timestamp || Date.now()).toLocaleString('sv-SE', { timeZone: 'Europe/Stockholm' })}</td></tr>
            </table>
          </div>
        </div>
      `;

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Stodona Leads <onboarding@resend.dev>',
          to: 'info@stodona.se',
          subject: `Nytt lead: ${sourceLabel} – ${email || phone}`,
          html: emailHtml,
        }),
      });
    }

    return new Response(JSON.stringify({ success: true, message: 'Lead mottaget!' }), {
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
