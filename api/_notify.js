// Owner notifications (Telegram + LINE) shared by the serverless endpoints.
// Credentials are read from env (TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, LINE_TOKEN)
// and never live in the browser. Every send is best-effort (never throws).

export async function sendTelegram(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return false;
  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chat, text, parse_mode: 'HTML' }),
    });
    return true;
  } catch (e) {
    console.warn('[notify] telegram error', e?.message || e);
    return false;
  }
}

export async function sendLine(text) {
  const token = process.env.LINE_TOKEN;
  if (!token) return false;
  try {
    await fetch('https://notify-api.line.me/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: `Bearer ${token}` },
      body: `message=${encodeURIComponent(text)}`,
    });
    return true;
  } catch (e) {
    console.warn('[notify] line error', e?.message || e);
    return false;
  }
}

export async function notifyNewMember(m) {
  const msg = `👤 สมาชิกใหม่สมัครเข้ามา\n🆔 ${m.memberCode}\n👤 ${m.name}\n📧 ${m.email || '-'}\n📱 ${m.phone || '-'}\n🏷️ ${m.positionId}\n📍 ${m.province || '-'}\n⏰ ${new Date().toLocaleString('th-TH')}`;
  await Promise.all([sendTelegram(msg), sendLine(msg)]);
}

export async function notifyStats(visitors, members) {
  const msg = `📊 สถิติประจำวัน\n👁 ผู้เข้าชม: ${visitors}\n👥 สมาชิกใหม่: ${members}`;
  await Promise.all([sendTelegram(msg), sendLine(msg)]);
}
