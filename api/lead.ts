// Vercel Serverless Function: Lead capture endpoint
// Sends lead data to Stodona's email
// Can be extended to integrate with Timewave API

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

    // Validate
    if (!email && !phone) {
      return new Response(JSON.stringify({ error: 'E-post eller telefon krävs' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Source labels for readability
    const sourceLabels: Record<string, string> = {
      welcome_popup: '🎁 Välkomst-popup (15% rabatt)',
      exit_intent: '🚪 Exit-intent popup (15% rabatt)',
      footer_newsletter: '📧 Footer newsletter',
      blog_lead_magnet: '📥 Blogg städchecklista',
      sticky_cta: '📱 Mobil sticky CTA (Ring mig)',
    };

    const sourceLabel = sourceLabels[source] || source;

    // Format email content
    const emailBody = `
Nytt lead från stodona.se

Källa: ${sourceLabel}
${email ? `E-post: ${email}` : ''}
${phone ? `Telefon: ${phone}` : ''}
${name ? `Namn: ${name}` : ''}
Sida: ${page || 'Okänd'}
Tidpunkt: ${timestamp || new Date().toISOString()}
    `.trim();

    // Send notification email via Resend, Sendgrid, or similar
    // For now, log and return success
    // TODO: Replace with actual email sending or Timewave API integration
    console.log('📬 New lead:', emailBody);

    // If you want to send via Resend:
    // const RESEND_API_KEY = process.env.RESEND_API_KEY;
    // if (RESEND_API_KEY) {
    //   await fetch('https://api.resend.com/emails', {
    //     method: 'POST',
    //     headers: {
    //       'Authorization': `Bearer ${RESEND_API_KEY}`,
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //       from: 'leads@stodona.se',
    //       to: 'info@stodona.se',
    //       subject: `Nytt lead: ${sourceLabel}`,
    //       text: emailBody,
    //     }),
    //   });
    // }

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
