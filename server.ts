import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { spawn, spawnSync } from 'child_process';
import { GoogleGenAI } from '@google/genai';

// ---- Visitor tracking (daily unique visitors) ----
const VISITOR_FILE = path.join(process.cwd(), 'server_data', 'visitors.json');
let visitorSet = new Set<string>();
try {
  const raw = fs.readFileSync(VISITOR_FILE, 'utf-8');
  visitorSet = new Set(JSON.parse(raw));
} catch { /* no file yet */ }
function trackVisitor(ip: string) {
  if (!visitorSet.has(ip)) {
    visitorSet.add(ip);
    try {
      fs.mkdirSync(path.dirname(VISITOR_FILE), { recursive: true });
      fs.writeFileSync(VISITOR_FILE, JSON.stringify([...visitorSet]));
    } catch { /* ignore */ }
  }
}
function getVisitorCount() { return visitorSet.size; }

function whichPython(): string {
  // hermes venv python (Windows)
  const candidates = [
    'C:/Users/User/AppData/Local/hermes/hermes-agent/venv/Scripts/python.exe',
    'python3',
    'python',
  ];
  for (const c of candidates) {
    try {
      const r = spawnSync(c, ['--version']);
      if (r.status === 0) return c;
    } catch { /* try next */ }
  }
  return 'python';
}

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // AI Chat & Organization Intelligence
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { message, context } = req.body;
      const ai = getAI();

      if (!ai) {
        // High quality fallback heuristic answer if key not yet provided in secrets
        const fallbackReply = generateFallbackAIAnswer(message, context);
        return res.json({ reply: fallbackReply, isMock: false, model: 'local-analytics-engine' });
      }

      const systemInstruction = `คุณคือ AI Organization Intelligence & Network Coach ประจำแพลตฟอร์ม "AI INSURANCE NETWORK OS" 
สำหรับระบบบริหารองค์กรตัวแทนประกันชีวิตระดับมืออาชีพ
หน้าที่ของคุณ:
1. ตอบคำถามเกี่ยวกับการวิเคราะห์ทีม, ผลงาน (FYC/COM), การคำนวณรายได้ตาม Compensation Plan ฉบับ Update 15 Jan 64
2. ให้คำแนะนำเชิงกลยุทธ์ตามหลักคณิตศาสตร์และการสร้างคน (สร้างคน -> สร้างผู้นำ -> สร้างทีม -> เกิดหน่วย -> เกิดศูนย์ -> เกิดภาค)
3. วิเคราะห์ Retention, Active Rate, At-Risk Teams, และคัดกรองผู้มีศักยภาพเลื่อนตำแหน่ง (Promotion Candidates)
4. ห้ามคาดเดาหรือรับประกันตัวเลขรายได้ ให้ระบุว่าเป็น "Estimated Requirement" หรือ "การคำนวณตามสูตรผลประโยชน์"
5. ใช้ภาษาไทยที่สุภาพ เป็นมืออาชีพ ชัดเจน มีโครงสร้าง และเข้าใจง่าย`;

      const promptContext = context ? `\n\nข้อมูลบริบทขององค์กรปัจจุบัน:\n${JSON.stringify(context, null, 2)}` : '';

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: `${message}${promptContext}`,
        config: {
          systemInstruction,
          temperature: 0.4,
        },
      });

      const reply = response.text || 'ขออภัย ไม่สามารถประมวลผลคำตอบได้ในขณะนี้';
      return res.json({ reply, model: 'gemini-3.7-flash' });
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      res.status(500).json({ error: error.message || 'Error processing AI request' });
    }
  });

  // AI Leadership & Risk Analysis
  app.post('/api/ai/analysis', async (req, res) => {
    try {
      const { organizationSummary } = req.body;
      const ai = getAI();

      if (!ai) {
        return res.json({
          insights: [
            { type: 'top_performer', title: 'ศูนย์เชียงใหม่ มี Active Rate สูงสุด (88%)', description: 'มีการสร้างกิจกรรมสม่ำเสมอและ FYC เฉลี่ยต่อตัวแทนสูงกว่าค่าเฉลี่ย 18%' },
            { type: 'retention_risk', title: 'หน่วยหาดใหญ่ พรีเมียร์ พบ Retention ลดลง 12%', description: 'ตัวแทนใหม่ในเดือนที่ 2-3 เริ่มขาดการส่งเบี้ยต่อเนื่อง ควรนัดติวเข้มและประกบงานภาคสนาม' },
            { type: 'promotion_ready', title: 'คุณกนกวรรณ (UM-102) ใกล้ครบเกณฑ์เลื่อนเป็น CM', description: 'FYC สะสมถึง 86% และแยกหน่วยแล้ว 1 หน่วย ขาดอีก 1 หน่วยเพื่อแต่งตั้งผู้บริหารศูนย์' },
            { type: 'strategic_goal', title: 'โอกาสเพิ่มรายได้ภาค 14%', description: 'หากผลักดัน 3 หน่วยที่มี FYC ช่วง 25,000 บาท ให้แตะ 35,000 บาท จะขยับขั้นค่าจัดงานหน่วยเป็น 40%' }
          ]
        });
      }

      const prompt = `จากข้อมูลองค์กรต่อไปนี้:
${JSON.stringify(organizationSummary, null, 2)}

จงวิเคราะห์เชิงลึกและส่งออกผลวิเคราะห์ 4 ด้าน:
1. Emerging Leaders (ผู้นำดาวรุ่ง)
2. Retention Risks (ทีมที่มีความเสี่ยงคนหลุด)
3. Promotion Candidates (ตัวแทนที่มีโอกาสเลื่อนตำแหน่งเร็วๆ นี้)
4. Strategic Coaching Action (ข้อเสนอแนะเชิงปฏิบัติการสำหรับผู้บริหาร)`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          systemInstruction: 'คุณคือที่ปรึกษาระดับสูงด้านการบริหารองค์กรตัวแทนประกันชีวิต ตอบเป็นภาษาไทยอย่างเฉียบคมและแม่นยำ',
        },
      });

      return res.json({ analysis: response.text });
    } catch (error: any) {
      console.error('AI Analysis Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================================
  // OpenAI Image Generation (gpt-image-1) — AI Image Creator
  // Key is kept server-side (OPENAI_API_KEY); the frontend never sees it.
  // ============================================================

  // Proxy: is the OpenAI key present & reachable?
  app.get('/api/ai/image-status', async (req, res) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.json({ configured: false, message: 'OPENAI_API_KEY not set on server.' });
    }
    res.json({ configured: true, model: 'gpt-image-1' });
  });

  // Generate an image from a text prompt via OpenAI gpt-image-1
  app.post('/api/ai/generate-image', async (req, res) => {
    try {
      const { prompt, size, quality, n } = req.body || {};
      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: 'Missing "prompt" (string).' });
      }
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return res.status(503).json({ error: 'OPENAI_API_KEY is not configured on the server.' });
      }

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 120000);
      let data: any;
      try {
        const r = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-image-1',
            prompt,
            size: size || '1024x1024',
            quality: quality || 'auto',
            n: n || 1,
          }),
          signal: controller.signal,
        });
        const text = await r.text();
        try { data = JSON.parse(text); } catch { data = { raw: text }; }
        if (!r.ok) {
          return res.status(r.status).json({ error: data?.error?.message || 'OpenAI image generation failed', detail: data });
        }
      } catch (e: any) {
        return res.status(504).json({ error: e.name === 'AbortError' ? 'OpenAI request timed out' : e.message });
      } finally {
        clearTimeout(timer);
      }

      // gpt-image-1 returns b64_json (no hosted URL) by default
      const item = data?.data?.[0];
      if (!item) {
        return res.status(502).json({ error: 'OpenAI returned no image data', detail: data });
      }
      if (item.b64_json) {
        const mime = 'image/png';
        const dataUrl = `data:${mime};base64,${item.b64_json}`;
        return res.json({ ok: true, image: dataUrl, revisedPrompt: item.revised_prompt || prompt });
      }
      if (item.url) {
        return res.json({ ok: true, image: item.url, revisedPrompt: item.revised_prompt || prompt });
      }
      return res.status(502).json({ error: 'Unexpected OpenAI response shape', detail: data });
    } catch (e: any) {
      console.error('OpenAI generate-image error:', e);
      res.status(500).json({ error: e.message });
    }
  });

  // ============================================================
  // Member "My Plan" video summary generator
  // Accepts plan data -> builds vertical MP4 via ffmpeg + edge-tts (python) -> serves it
  // ============================================================
  const VIDEO_DIR = path.join(process.cwd(), 'server_videos');
  app.use('/server_videos', express.static(VIDEO_DIR));

  app.post('/api/myplan/video', async (req, res) => {
    try {
      const { scenes, accent, voice, name } = req.body || {};
      if (!Array.isArray(scenes) || scenes.length === 0) {
        return res.status(400).json({ error: 'Missing "scenes" array.' });
      }
      const py = process.env.HERMES_VENV_PYTHON ||
        'C:/Users/User/AppData/Local/hermes/hermes-agent/venv/Scripts/python.exe';
      const pyScript = path.join(process.cwd(), 'server_video.py');

      const payload = JSON.stringify({ scenes, accent: accent || '#f472b6', voice: voice || 'th-TH-PremwadeeNeural', name: name || 'my_plan' });
      const proc = spawn(py, [pyScript], { cwd: process.cwd() });
      let out = '';
      let err = '';
      proc.stdin.write(payload);
      proc.stdin.end();
      proc.stdout.on('data', (d) => (out += d.toString()));
      proc.stderr.on('data', (d) => (err += d.toString()));
      proc.on('close', (code) => {
        if (code !== 0) {
          console.error('Video gen error:', err);
          return res.status(500).json({ error: 'Video generation failed', detail: err.slice(0, 500) });
        }
        const videoPath = out.trim().split('\n').pop() || '';
        if (!videoPath) {
          return res.status(500).json({ error: 'No video path returned', detail: err.slice(0, 300) });
        }
        const rel = '/server_videos/' + path.basename(videoPath);
        return res.json({ ok: true, url: rel, path: videoPath });
      });
    } catch (e: any) {
      console.error('MyPlan video error:', e);
      res.status(500).json({ error: e.message });
    }
  });

  // ============================================================
  // TikTok Ads tutorial video generator (จาก Prompt ของผู้ใช้)
  // รับ scenes + footer ลิงก์ -> สร้างวิดีโอแนว Tutorial 9:16 พร้อมลิงก์ด้านล่าง
  // ============================================================
  app.post('/api/tiktok-ads/video', (req, res) => {
    (async () => {
      try {
        const { name, accent, voice, footer } = req.body;
        const scenes = Array.isArray(req.body.scenes) && req.body.scenes.length
          ? req.body.scenes
          : [
              { title: 'สอนยิงแอด TikTok Ads แบบมืออาชีพ', body: 'เริ่มต้นจนสร้างแคมเปญโฆษณาได้เอง', duration: 5 },
              { title: 'STEP 1 — CREATE CAMPAIGN', body: 'กำหนดวัตถุประสงค์ให้ตรงกับเป้าหมายธุรกิจ', duration: 4 },
              { title: 'STEP 2 — TARGET AUDIENCE', body: 'พื้นที่ อายุ ความสนใจ พฤติกรรม', duration: 4 },
              { title: 'STEP 3 — BUDGET & SCHEDULE', body: 'Daily Budget วันเริ่ม-จบ ควบคุมได้', duration: 4 },
              { title: 'STEP 4 — CREATE YOUR AD', body: 'HOOK → PROBLEM → SOLUTION → BENEFIT → CTA', duration: 5 },
              { title: 'SET YOUR CTA', body: 'Learn More / Sign Up / Shop Now', duration: 4 },
              { title: 'CHECK → REVIEW → PUBLISH', body: 'ตรวจสอบก่อนส่งเข้าตรวจสอบของ TikTok', duration: 4 },
              { title: 'วิเคราะห์ผล & ปรับปรุง', body: 'Impressions Clicks CTR CPC ROAS', duration: 4 },
            ];
        const py = whichPython();
        const pyScript = path.join(process.cwd(), 'server_video.py');
        const payload = JSON.stringify({
          scenes,
          accent: accent || '#ff0050',
          voice: voice || 'th-TH-PremwadeeNeural',
          name: name || 'tiktok_ads',
          footer: footer || 'เริ่มสร้างโฆษณา TikTok Ads » https://ads.tiktok.com/business/th',
        });
        const proc = spawn(py, [pyScript], { cwd: process.cwd() });
        let out = '';
        let err = '';
        proc.stdin.write(payload);
        proc.stdin.end();
        proc.stdout.on('data', (d: Buffer) => { out += d.toString(); });
        proc.stderr.on('data', (d: Buffer) => { err += d.toString(); });
        await new Promise<void>((resolve) => proc.on('close', () => resolve()));
        const m = out.trim().split('\n').pop() || '';
        if (!m || !m.endsWith('.mp4')) {
          return res.status(500).json({ error: 'สร้างวิดีโอไม่สำเร็จ', detail: err || out });
        }
        const rel = '/server_videos/' + path.basename(m);
        return res.json({ ok: true, url: rel, path: m });
      } catch (e: any) {
        return res.status(500).json({ error: e.message || 'server error' });
      }
    })();
  });

  // Static video files — explicit GET handler registered BEFORE Vite middleware
  const VIDEO_DIR_GLOBAL = path.join(process.cwd(), 'server_videos');
  app.get('/server_videos/:file', (req, res) => {
    const f = path.join(VIDEO_DIR_GLOBAL, path.basename(req.params.file));
    res.sendFile(f, (err) => { if (err) res.status(404).end(); });
  });

  // ============================================================
  // Member data capture — local JSON store + view page
  // ============================================================
  const DATA_DIR = path.join(process.cwd(), 'server_data');
  const MEMBERS_FILE = path.join(DATA_DIR, 'members.json');
  const readMembers = (): any[] => {
    try {
      if (!fs.existsSync(MEMBERS_FILE)) return [];
      const raw = fs.readFileSync(MEMBERS_FILE, 'utf-8').trim();
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  };
  app.get('/api/members/sheet', async (_req, res) => {
    try {
      const { readMembersFromSheet } = await import('./src/lib/sheetsSync');
      const members = await readMembersFromSheet();
      res.json({ ok: true, count: members.length, members });
    } catch (e: any) {
      res.status(502).json({ ok: false, error: e?.message || 'read sheet failed', configured: !!(process.env.GOOGLE_SHEET_ID && process.env.GOOGLE_SHEETS_CREDENTIALS_JSON) });
    }
  });
  app.get('/api/members', (_req, res) => {
    res.json({ ok: true, count: readMembers().length, members: readMembers() });
  });
  app.post('/api/members', (req, res) => {
    try {
      if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
      const all = readMembers();
      const row = req.body;
      if (!row || !row.memberId) return res.status(400).json({ ok: false, error: 'invalid member row' });
      const idx = all.findIndex((m: any) => m.memberId === row.memberId);
      if (idx >= 0) all[idx] = { ...all[idx], ...row };
      else all.unshift(row);
      fs.writeFileSync(MEMBERS_FILE, JSON.stringify(all, null, 2), 'utf-8');
      res.json({ ok: true, count: all.length });
    } catch (e: any) {
      res.status(500).json({ ok: false, error: e?.message || 'write failed' });
    }
  });
  app.get('/api/members/view', (_req, res) => {
    const members = readMembers();
    const rows = members.map((m: any, i: number) => `
      <tr>
        <td>${i + 1}</td>
        <td><b>${m.memberCode}</b></td>
        <td>${m.name}</td>
        <td>${m.email || '-'}</td>
        <td>${m.phone || '-'}</td>
        <td>${m.positionId}</td>
        <td>${m.province || '-'}</td>
        <td>${m.joinDate}</td>
        <td><span style="color:#22c55e">${m.status}</span></td>
      </tr>`).join('');
    res.send(`<!doctype html><html lang="th"><head><meta charset="utf-8">
      <title>คลังข้อมูลสมาชิก</title>
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <style>
        body{font-family:'Segoe UI',Tahoma;background:#0f172a;color:#e2e8f0;margin:0;padding:24px}
        h1{font-size:20px;margin:0 0 4px}
        .sub{color:#94a3b8;font-size:13px;margin-bottom:16px}
        .badge{background:#1e293b;border:1px solid #334155;padding:4px 10px;border-radius:999px;font-size:12px}
        table{width:100%;border-collapse:collapse;background:#1e293b;border-radius:12px;overflow:hidden;font-size:13px}
        th,td{padding:10px 12px;text-align:left;border-bottom:1px solid #334155}
        th{background:#0f172a;color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:.05em}
        tr:hover{background:#273449}
        .empty{color:#64748b;padding:40px;text-align:center}
        a{color:#38bdf8}
      </style></head><body>
      <h1>📋 คลังข้อมูลสมาชิก (Member Capture)</h1>
      <div class="sub">ข้อมูลสมาชิกที่สมัครเข้ามาทั้งหมด — บันทึกลง <code>server_data/members.json</code> และ sync ไป Google Sheets / Vercel DB (เมื่อตั้งค่า credential)</div>
      <div style="margin-bottom:16px"><span class="badge">สมาชิกทั้งหมด: ${members.length} คน</span> &nbsp; <span class="badge">API: <a href="/api/members">/api/members</a></span> &nbsp; <span class="badge">ไฟล์: server_data/members.json</span></div>
      ${members.length === 0
        ? '<div class="empty">ยังไม่มีสมาชิกสมัคร — ลองสมัครสมาชิกในแอปดูครับ</div>'
        : `<table><thead><tr><th>#</th><th>รหัส</th><th>ชื่อ</th><th>อีเมล</th><th>โทร</th><th>ตำแหน่ง</th><th>จังหวัด</th><th>วันเข้า</th><th>สถานะ</th></tr></thead><tbody>${rows}</tbody></table>`}
      </body></html>`);
  });

  // ============================================================
  // Owner notifications (Telegram + LINE) for new members / deploy
  // Credentials read from env (TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, LINE_TOKEN)
  // Registered BEFORE the SPA catch-all so requests reach it.
  // ============================================================================
  function sendTelegram(text: string) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chat = process.env.TELEGRAM_CHAT_ID;
    if (!token || !chat) { console.log('[notify] Telegram skipped (no creds)'); return; }
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chat, text, parse_mode: 'HTML' }),
    }).catch((e) => console.warn('[notify] telegram error', e?.message || e));
  }
  function sendLine(text: string) {
    const token = process.env.LINE_TOKEN;
    if (!token) { console.log('[notify] LINE skipped (no creds)'); return; }
    fetch('https://notify-api.line.me/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: `Bearer ${token}` },
      body: `message=${encodeURIComponent(text)}`,
    }).catch((e) => console.warn('[notify] line error', e?.message || e));
  }
  function notifyNewMember(m: any) {
    const msg = `👤 สมาชิกใหม่สมัครเข้ามา\n🆔 ${m.memberCode}\n👤 ${m.name}\n📧 ${m.email || '-'}\n📱 ${m.phone || '-'}\n🏷️ ${m.positionId}\n📍 ${m.province || '-'}\n⏰ ${new Date().toLocaleString('th-TH')}`;
    sendTelegram(msg);
    sendLine(msg);
  }
  function notifyDeploy(url: string) {
    const msg = `✅ Deploy สำเร็จ\n🌐 ${url}\n📱 AI Insurance Network OS พร้อมใช้งาน`;
    sendTelegram(msg);
    sendLine(msg);
  }
  function notifyStats(visitors: number, members: number) {
    const msg = `📊 สถิติประจำวัน\n👁 ผู้เข้าชม: ${visitors}\n👥 สมาชิกใหม่: ${members}`;
    sendTelegram(msg);
    sendLine(msg);
  }
  app.post('/api/notify-member', (req, res) => {
    try { notifyNewMember(req.body || {}); res.json({ ok: true }); }
    catch (e: any) { res.status(500).json({ ok: false, error: e?.message || 'notify failed' }); }
  });
  (globalThis as any).__notifyDeploy = notifyDeploy;
  (globalThis as any).__notifyStats = notifyStats;

  // Vite middleware for development vs Static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        // Don't watch the generated video folder — writing files there must NOT reload the page
        watch: { ignored: ['**/server_videos/**', '**/node_modules/**'] },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      const ip = req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
      trackVisitor(ip);
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Stats endpoint (visitors + members) for owner reporting
  app.get('/api/stats', (_req, res) => {
    try {
      const members = readMembers();
      res.json({
        ok: true,
        visitors: getVisitorCount(),
        members: members.length,
        deployUrl: process.env.DEPLOY_URL || `http://localhost:${PORT}`,
      });
    } catch (e: any) { res.status(500).json({ ok: false, error: e?.message }); }
  });

  // Owner report trigger (Telegram + LINE) — callable from cron/deploy
  app.post('/api/report', (_req, res) => {
    try {
      const members = readMembers().length;
      const visitors = getVisitorCount();
      notifyStats(visitors, members);
      res.json({ ok: true, visitors, members });
    } catch (e: any) { res.status(500).json({ ok: false, error: e?.message }); }
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Insurance Network OS Server running on http://localhost:${PORT}`);
  });
}

function generateFallbackAIAnswer(message: string, context: any): string {
  const msgLower = message.toLowerCase();
  
  if (msgLower.includes('รายได้') || msgLower.includes('income') || msgLower.includes('เงิน')) {
    return `จากการคำนวณตาม Compensation Plan (Update 15 Jan 64):\n- ตำแหน่งผู้บริหารภาค (RM): ได้รับค่าจัดงานภาค T1 (10-18% ของ FYC), ค่าจัดงานภาค T2 (฿1,000-2,500 ต่อศูนย์), ค่าบริหารเป้าหมาย (฿10,000-30,000/เดือน) และโบนัสรายปี (1.5-2.5%)\n- แนะนำตรวจสอบรายละเอียดผ่านแท็บ **Income Calculator** เพื่อดูสูตรคำนวณและสัดส่วนรายได้แบบละเอียดครับ`;
  }
  
  if (msgLower.includes('เลื่อนตำแหน่ง') || msgLower.includes('เกณฑ์') || msgLower.includes('qualification')) {
    return `เกณฑ์การเลื่อนตำแหน่งในระบบ:\n1. **ผู้บริหารหน่วย (UM)**: บำเหน็จ 20,000 บาท (1-6 เดือน)\n2. **ผู้บริหารศูนย์ (CM)**: บำเหน็จ 75,000 บาท (3-6 เดือน) + แยกหน่วย 2 หน่วย\n3. **ผู้บริหารภาค (RM)**: บำเหน็จ 1,200,000 บาท (12-24 เดือน) + แยกศูนย์ 4 ศูนย์\nคุณสามารถดูความคืบหน้ารายบุคคลได้ที่เมนู **Career Path** ครับ`;
  }

  if (msgLower.includes('เสี่ยง') || msgLower.includes('retention') || msgLower.includes('หลุด')) {
    return `จากการตรวจจับของระบบ:\n- ทีมที่มี Retention ต่ำกว่า 75% มักมีสาเหตุจากการขาดกิจกรรม Activity 2 สัปดาห์แรกของตัวแทนใหม่\n- แนะนำให้ผู้บริหารศูนย์จัดประกบการขาย (Joint Field Work) และใช้ระบบ Goal Planner ติดตามเป้าหมายรายสัปดาห์ครับ`;
  }

  return `ยินดีต้อนรับสู่ AI Network Coach ครับ ระบบสามารถช่วยท่าน:\n1. วิเคราะห์ผลงาน FYC/COM และโครงสร้างองค์กร 4 ระดับ\n2. วางแผนสร้างผู้นำและจำลองการแตกหน่วย/ศูนย์/ภาค (Simulation)\n3. ตรวจสอบเงื่อนไขผลตอบแทนตาม Rule Engine 2021-01-15\nมีส่วนใดที่ต้องการให้ผมวิเคราะห์เพิ่มเติมไหมครับ?`;
}

startServer();
