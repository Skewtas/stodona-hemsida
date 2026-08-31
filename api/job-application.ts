// Vercel Edge Function: Jobbansökningar med CV-bilaga
// Tar emot multipart/form-data (Namn, E-post, Ort, Tjänst, CV-fil) och mejlar
// ansökan till info@stodona.se via Resend – med CV:t som bifogad fil.
// (Formspree tillåter inte filuppladdning på gratisplanen, därför egen endpoint.)

export const config = {
  runtime: 'edge',
};

// ArrayBuffer → base64 i block, så stora filer (upp till 10 MB) inte spränger stacken.
function arrayBufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk) as unknown as number[]);
  }
  return btoa(binary);
}

function esc(s: string): string {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    // Ingen mejlserver konfigurerad – låt klienten falla tillbaka till Formspree.
    return new Response(JSON.stringify({ error: 'not_configured' }), {
      status: 501,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const fd = await request.formData();
    const namn = String(fd.get('Namn') || '');
    const epost = String(fd.get('E-post') || '');
    const ort = String(fd.get('Ort') || '');
    const tjanst = String(fd.get('Tjänst') || fd.get('Tjanst') || 'Ansökan');
    const cv = fd.get('CV');

    if (!namn || !epost) {
      return new Response(JSON.stringify({ error: 'Namn och e-post krävs' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Bygg ev. bilaga
    const attachments: { filename: string; content: string }[] = [];
    if (cv && typeof cv === 'object' && 'arrayBuffer' in cv) {
      const file = cv as File;
      if (file.size > 0) {
        if (file.size > 10 * 1024 * 1024) {
          return new Response(JSON.stringify({ error: 'Filen är för stor (max 10 MB)' }), {
            status: 413,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        const buf = await file.arrayBuffer();
        attachments.push({
          filename: file.name || 'CV',
          content: arrayBufferToBase64(buf),
        });
      }
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <div style="background: #151515; color: #f4f1eb; padding: 20px; border-radius: 12px 12px 0 0;">
          <h2 style="margin: 0;">📩 Ny jobbansökan</h2>
          <p style="margin: 4px 0 0; opacity: 0.8; font-size: 13px;">Tjänst: ${esc(tjanst)}</p>
        </div>
        <div style="background: #f8f8f8; padding: 20px; border: 1px solid #eee; border-radius: 0 0 12px 12px;">
          <p><strong>Namn:</strong> ${esc(namn)}</p>
          <p><strong>E-post:</strong> <a href="mailto:${esc(epost)}">${esc(epost)}</a></p>
          ${ort ? `<p><strong>Ort:</strong> ${esc(ort)}</p>` : ''}
          <p><strong>CV:</strong> ${attachments.length ? `Bifogat (${esc(attachments[0].filename)})` : 'Inget CV bifogades'}</p>
        </div>
      </div>
    `;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Stodona Jobb <info@stodona.se>',
        to: 'info@stodona.se',
        reply_to: epost,
        subject: `Jobbansökan: ${tjanst} – ${namn}`,
        html,
        ...(attachments.length ? { attachments } : {}),
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error('Resend job-application error:', res.status, detail);
      return new Response(JSON.stringify({ error: 'email_failed' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('job-application error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
