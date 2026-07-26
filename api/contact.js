const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name = '', email = '', subject = '', message = '' } = req.body || {};
  if (String(name).trim().length < 2 || !EMAIL_RE.test(String(email)) || String(subject).trim().length < 2 || String(message).trim().length < 10) {
    return res.status(400).json({ error: 'Please provide a valid name, email, subject and message.' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const recipient = process.env.CONTACT_EMAIL || 'awaisraza5424@gmail.com';
  const sender = process.env.RESEND_FROM || 'Portfolio <onboarding@resend.dev>';
  if (!apiKey) return res.status(503).json({ error: 'Email service is not configured.' });

  const safe = (value) => String(value).replace(/[<>]/g, '');
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: sender,
        to: [recipient],
        reply_to: safe(email),
        subject: `Portfolio inquiry: ${safe(subject)}`,
        text: `${safe(message)}\n\nFrom: ${safe(name)} <${safe(email)}>`
      })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) return res.status(502).json({ error: payload.message || 'Email provider rejected the request.' });
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Contact form error', error);
    return res.status(500).json({ error: 'Unable to send the message.' });
  }
};
