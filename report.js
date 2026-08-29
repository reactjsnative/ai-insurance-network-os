/**
 * Deploy & member-report notifier
 * ------------------------------------------------------------------
 * Sends a report to Telegram + LINE after a Vercel deploy and whenever a new
 * member registers. Credentials are read from env (never hardcoded):
 *   TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
 *   LINE_TOKEN  (LINE Notify token, or Messaging API channel access token)
 *
 * Usage:
 *   node report.js deploy   <url>            -> send deploy success message
 *   node report.js member    <jsonMember>     -> send new-member alert
 *   node report.js stats     <visitors> <members>  -> periodic stats
 */
const https = require('https');

function postJSON(url, body, headers) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const data = JSON.stringify(body);
    const req = https.request(
      { hostname: u.hostname, path: u.pathname + u.search, method: 'POST', headers: { 'Content-Type': 'application/json', ...headers, 'Content-Length': Buffer.byteLength(data) } },
      (res) => { let d = ''; res.on('data', (c) => (d += c)); res.on('end', () => resolve({ status: res.statusCode, body: d })); }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function sendTelegram(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) { console.log('[telegram] skipped (no creds)'); return; }
  await postJSON(`https://api.telegram.org/bot${token}/sendMessage`, { chat_id: chat, text, parse_mode: 'HTML' });
  console.log('[telegram] sent');
}

async function sendLine(text) {
  const token = process.env.LINE_TOKEN;
  if (!token) { console.log('[line] skipped (no creds)'); return; }
  // LINE Notify
  await postJSON('https://notify-api.line.me/api/notify', { message: text }, { Authorization: `Bearer ${token}` });
  console.log('[line] sent');
}

function escapeHtml(s) { return String(s).replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c])); }

async function main() {
  const [,, type, arg] = process.argv;
  if (type === 'deploy') {
    const msg = `✅ <b>Deploy สำเร็จ</b>\n🌐 <a href="${arg}">${arg}</a>\n📱 AI Insurance Network OS พร้อมใช้งาน`;
    const lineMsg = `✅ Deploy สำเร็จ\n🌐 ${arg}\n📱 AI Insurance Network OS พร้อมใช้งาน`;
    await sendTelegram(msg);
    await sendLine(lineMsg);
  } else if (type === 'member') {
    const m = JSON.parse(arg);
    const msg = `👤 <b>สมาชิกใหม่สมัครเข้ามา</b>\n🆔 ${escapeHtml(m.memberCode)}\n👤 ${escapeHtml(m.name)}\n📧 ${escapeHtml(m.email || '-')}\n📱 ${escapeHtml(m.phone || '-')}\n🏷️ ${escapeHtml(m.positionId)}\n📍 ${escapeHtml(m.province || '-')}`;
    const lineMsg = `👤 สมาชิกใหม่สมัครเข้ามา\n🆔 ${m.memberCode}\n👤 ${m.name}\n📧 ${m.email || '-'}\n🏷️ ${m.positionId}\n📍 ${m.province || '-'}`;
    await sendTelegram(msg);
    await sendLine(lineMsg);
  } else if (type === 'stats') {
    const [visitors, members] = arg.split(',');
    const msg = `📊 <b>สถิติประจำวัน</b>\n👁 ผู้เข้าชม: ${visitors}\n👥 สมาชิกใหม่: ${members}`;
    const lineMsg = `📊 สถิติประจำวัน\n👁 ผู้เข้าชม: ${visitors}\n👥 สมาชิกใหม่: ${members}`;
    await sendTelegram(msg);
    await sendLine(lineMsg);
  } else {
    console.log('Usage: node report.js [deploy <url> | member <json> | stats <visitors,members>]');
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
