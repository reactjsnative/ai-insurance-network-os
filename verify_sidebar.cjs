// Headless CDP verification: login by seeding localStorage, then check sidebar for income_calculator menu.
const { execFile } = require('child_process');
const http = require('http');
const WebSocket = require('ws');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9223;
const TARGET = 'https://ai-insurance-network-os.vercel.app/';
const USER_DATA_DIR = process.env.TEMP + '\\ins_cdp_profile';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch (e) { reject(e); } });
    }).on('error', reject);
  });
}

async function main() {
  // Launch chrome
  const chrome = execFile(CHROME, [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--no-first-run',
    `--remote-debugging-port=${PORT}`, `--user-data-dir=${USER_DATA_DIR}`,
    'about:blank'
  ], { windowsHide: true });

  // Wait for debug endpoint
  let tabs = null;
  for (let i = 0; i < 40; i++) {
    try { tabs = await getJson(`http://127.0.0.1:${PORT}/json`); break; }
    catch (e) { await sleep(500); }
  }
  if (!tabs) { console.log('FAIL: could not connect to chrome'); process.exit(1); }

  const pageTab = tabs.find(t => t.type === 'page');
  const ws = new WebSocket(pageTab.webSocketDebuggerUrl, { perMessageDeflate: false });
  let id = 0;
  const pending = new Map();
  const send = (method, params = {}) => new Promise((resolve) => {
    const mid = ++id;
    pending.set(mid, resolve);
    ws.send(JSON.stringify({ id: mid, method, params }));
  });

  await new Promise(r => ws.on('open', r));
  ws.on('message', (data) => {
    const msg = JSON.parse(data.toString());
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
  });

  // Navigate to the site
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.navigate', { url: TARGET });
  await sleep(6000);

  // Seed localStorage with a logged-in auth user
  const authUser = {
    id: 'verify', email: 'verify@test.local', name: 'Verify', avatarUrl: '',
    provider: 'email', connectedProviders: ['email'], memberId: 'verify',
    role: 'admin', positionId: 'agent', isLoggedIn: true,
    lastLoginAt: new Date().toISOString(), is2FAEnabled: false, token: ''
  };
  const setLS = await send('Runtime.evaluate', {
    expression: `localStorage.setItem('insure_os_auth_user_v3', ${JSON.stringify(JSON.stringify(authUser))}); 'ok'`
  });
  // Reload
  await send('Page.navigate', { url: TARGET });
  await sleep(8000);

  // Now inspect the DOM
  const result = await send('Runtime.evaluate', {
    expression: `(() => {
      const root = document.getElementById('root');
      const hasSidebar = !!document.getElementById('app_sidebar');
      const hasIncomeNav = !!document.getElementById('nav_income_calculator');
      const incomeText = (document.body.innerText || '').includes('เครื่องคำนวณรายได้') || (document.body.innerText || '').includes('Income Calculator');
      const navIds = [];
      document.querySelectorAll('[id^="nav_"]').forEach(e => navIds.push(e.id));
      return JSON.stringify({ hasSidebar, hasIncomeNav, incomeText, navCount: navIds.length, navIds: navIds.slice(0, 30) });
    })()`,
    returnByValue: true
  });

  const parsed = JSON.parse(result.result.result.value);
  console.log('VERIFY_RESULT: ' + JSON.stringify(parsed, null, 2));

  ws.close();
  chrome.kill();
  process.exit(0);
}

main().catch(e => { console.error('ERR', e); process.exit(1); });
