// Cloudflare Pages Function — POST /api/send-appointment
// Fa da proxy verso l'API di Telegram così il bot token resta segreto
// (letto da env, mai spedito al browser) invece di stare nel JS pubblico.

function isValidField(value) {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= 60;
}

export async function onRequestPost({ request, env }) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
    return new Response('Server non configurato', { status: 500 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response('Richiesta non valida', { status: 400 });
  }

  const { appointmentType, date, time } = body || {};
  if (!isValidField(appointmentType) || !isValidField(date) || !isValidField(time)) {
    return new Response('Dati non validi', { status: 400 });
  }

  const text = [
    'Nuova richiesta di appuntamento 💌',
    `Tipo: ${appointmentType}`,
    `Data: ${date}`,
    `Ora: ${time}`
  ].join('\n');

  const telegramRes = await fetch(
    `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: env.TELEGRAM_CHAT_ID,
        text
      })
    }
  );

  if (!telegramRes.ok) {
    return new Response('Errore nell\'invio a Telegram', { status: 502 });
  }

  return new Response('OK', { status: 200 });
}
