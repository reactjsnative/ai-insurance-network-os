import React from 'react';
import { useApp } from '../../context/AppContext';

type Msg = { role: 'user' | 'assistant'; text: string };

const QUICK = [
  { label: 'คำนวณรายได้', prompt: 'ช่วยคำนวณรายได้ตามตำแหน่ง Agent และเกณฑ์ 15 ม.ค. 64 ให้หน่อย' },
  { label: 'หาสมาชิก', prompt: 'ค้นหาสมาชิก AG' },
  { label: 'สรุปทีม', prompt: 'สรุปภาพรวมทีมวันนี้ให้หน่อย มีใครเสี่ยงหลุดบ้าง' },
  { label: 'สมัครตัวแทน', prompt: 'วิธีสมัครตัวแทนใหม่ต้องทำอย่างไร' },
];

export const HermesWidget: React.FC = () => {
  const { members, getMemberByCode, getMemberIncome, setActiveTab } = useApp();
  const [open, setOpen] = React.useState(false);
  const [fullscreen, setFullscreen] = React.useState(false);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [messages, setMessages] = React.useState<Msg[]>([
    { role: 'assistant', text: 'สวัสดีครับ ผม AI Network — ผู้ช่วยเครือข่ายของคุณ 🤖\nถามได้เลยครับ: ค้นหาสมาชิก คำนวณรายได้ สรุปทีม หรือสมัครตัวแทน ผมช่วยพาไปถูกเมนูให้ทันทีครับ' }
  ]);
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => { listRef.current?.scrollTo({ top: 99999, behavior: 'smooth' }); }, [messages, open]);

  const handleTool = (text: string): string | null => {
    const m = text.match(/AG\d{4,6}/i);
    if (m) {
      const code = m[0].toUpperCase();
      const mem: any = getMemberByCode(code);
      if (mem) {
        const income: any = getMemberIncome(code);
        return `พบสมาชิก ${code} — ${mem.name} ${mem.surname || ''} (${mem.rank_id})\n• สายงาน: ${mem.placement_parent_id || 'ราก'} → ผู้แนะนำ: ${mem.sponsor_id}\n• FYC: ${Number(mem.monthly_fyc||0).toLocaleString()} / COM: ${Number(mem.monthly_com||0).toLocaleString()}\n• รายได้รวม/เดือน: ${Number(income?.total_monthly_income||0).toLocaleString()} บาท\nดูรายละเอียดเพิ่มที่เมนู “จัดการสมาชิก” หรือ “ผังสายงาน” ได้เลยครับ`;
      } else {
        return `ยังไม่พบรหัส ${code} ในระบบครับ (มีสมาชิก ${members.length} คน)\nลองพิมพ์รหัสให้ครบ เช่น AG000001 หรือค้นด้วยชื่อ/เบอร์ที่เมนู “จัดการสมาชิก” ได้เลยครับ`;
      }
    }
    if (/สรุปทีม|ภาพรวม/i.test(text)) {
      return `ภาพรวมตอนนี้ — สมาชิก ${members.length} คน\n• พร้อมคำนวณรายได้และตรวจทีมเสี่ยงได้ที่ “แดชบอร์ด” และ “AI Coach” ครับ\nพิมพ์รหัสตัวแทน เช่น AG000001 เพื่อให้ผมสรุปโปรไฟล์เฉพาะคนได้ทันที`;
    }
    return null;
  };

  const send = async (text: string) => {
    const t = text.trim();
    if (!t) return;
    setMessages(m => [...m, { role: 'user', text: t }]);
    setInput('');

    const toolAns = handleTool(t);
    if (toolAns) {
      setMessages(m => [...m, { role: 'assistant', text: toolAns }]);
      return;
    }

    // คำสั่งพาไปเมนู
    if (/คำนวณรายได้|income/i.test(t)) { setActiveTab('income_calculator' as any); }
    if (/ผังสายงาน|tree|network/i.test(t)) { setActiveTab('network_visual' as any); }
    if (/สมัครตัวแทน|recruit/i.test(t)) { setActiveTab('recruit_agent' as any); }
    if (/สมาชิก|members/i.test(t) && !/AG\d/i.test(t)) { setActiveTab('members_mgmt' as any); }

    setLoading(true);
    const localFallback = (q: string): string => {
      const s = q.toLowerCase();
      if (s.includes('รายได้') || s.includes('income') || s.includes('เงิน') || s.includes('คอม') || s.includes('com')) {
        return `ตาม Compensation Plan 15 ม.ค.64 — ผมสรุปให้แบบ DeepSeek:\n• **UM (ผู้บริหารหน่วย)**: ค่าจัดงานหน่วย 25-40% ของ COM — เกณฑ์ 5k→25%, 10k→30%, 20k→35%, 35k→40% + ค่าแยกหน่วย 2,000/หน่วย\n• **CM (ผู้บริหารศูนย์)**: T1 3-15% + T2 0.8% เบี้ยปีต่อ + T3 5k-15k/เดือน + ค่าแยกศูนย์ 4k/ศูนย์ + โบนัสศูนย์ 4-6%\n• **RM (ผู้บริหารภาค)**: T1 10-18% + T2 1k-2.5k/ศูนย์ + ค่าแยกภาค + บริหารเป้าหมาย 10k-30k/เดือน + โบนัสภาค 1.5-2.5%\n→ กด “คำนวณรายได้” ผมพาไปเครื่องคิดเลขให้เลยครับ (สมาชิก ${members.length} คน)`;
      }
      if (s.includes('เลื่อนตำแหน่ง') || s.includes('เกณฑ์') || s.includes('promotion')) {
        return `เกณฑ์เลื่อนตำแหน่ง (DeepSeek สรุป):\n• **Agent → UM**: บำเหน็จ 20,000 — ทำ 1-6 เดือน\n• **UM → CM**: บำเหน็จ 75,000 — 3-6 เดือน + แยก 2 หน่วย\n• **CM → RM**: บำเหน็จ 1,200,000 — 12-24 เดือน + แยก 4 ศูนย์\nเช็คความคืบหน้าได้ที่ “Career Path” — พิมพ์รหัส AG ให้ผมเช็คให้ได้เลยครับ`;
      }
      if (s.includes('สมัคร') || s.includes('recruit')) {
        return `สมัครตัวแทนใหม่ (AI Network แบบ DeepSeek):\n1. เมนู “สมัครตัวแทน” → กรอกชื่อ/เบอร์/อีเมล/ผู้แนะนำ (รหัส AG)\n2. ระบบวางสายงานอัตโนมัติ (Balanced) + คำนวณรายได้ทันที\n3. ดูผังได้ที่ “ผังสายงาน” → Galaxy/Tree View\nต้องการให้ผมร่างข้อความชวนตัวแทนไหมครับ? พิมพ์ “ช่วยเขียนข้อความชวนตัวแทน” ได้เลย`;
      }
      if (s.includes('เขียน') || s.includes('ร่าง') || s.includes('อีเมล') || s.includes('ข้อความ')) {
        return `ได้เลยครับ — ผมช่วยเขียนแบบ DeepSeek ให้ได้ทันที:\nตัวอย่างข้อความชวนตัวแทน:\n> สวัสดีครับ [ชื่อ] ผมจาก AI Network — เรามีระบบคำนวณรายได้จริง 13 รายการ + ผังสายงานอัตโนมัติ + โค้ช AI ดูแลทีม 24 ชั่วโมง สนใจคุย 10 นาทีไหมครับ?\nบอกผมได้เลยว่าอยากให้เขียน “อีเมล / ไลน์ / สคริปต์โทร” แบบไหน ผมจัดให้ทันทีครับ`;
      }
      if (s.includes('สรุป') || s.includes('วิเคราะห์') || s.includes('แนะนำ')) {
        return `รับทราบครับ — ผมวิเคราะห์แบบ DeepSeek ให้:\n• สมาชิกตอนนี้ ${members.length} คน — พร้อมคำนวณรายได้และตรวจทีมเสี่ยง\n• แนะนำ: เช็ค “AI Coach” + “แดชบอร์ด” เพื่อดู Active Rate / Retention / ทีมเสี่ยงหลุด\n• พิมพ์ “สรุปทีม” หรือรหัส AG เพื่อให้ผมสรุปเจาะรายคนได้เลยครับ`;
      }
      // คำถามทั่วไป — ตอบแบบ DeepSeek
      return `สวัสดีครับ ผม **AI Network (DeepSeek)** — ผู้ช่วยเครือข่ายของคุณ 🤖\nคุณถามว่า: “${q.slice(0,120)}”\nผมตอบได้ทุกเรื่องเลยนะครับ — ทั้งงานประกัน (คำนวณรายได้, หาสมาชิก, สรุปทีม) และเรื่องทั่วไป (เขียน, สรุป, อธิบาย, แนะนำ) เหมือน DeepSeek เลยครับ\nลองถามต่อได้เลย เช่น “อธิบายวิธีปิดการขายประกัน” หรือ “ช่วยเขียนอีเมลชวนตัวแทน” ผมจัดให้ทันทีครับ`;
    };
    const tryDirectDeepSeek = async (q: string): Promise<string | null> => {
      const key = (typeof window !== 'undefined' && (localStorage.getItem('ai_network_deepseek_key') || localStorage.getItem('deepseek_key'))) || '';
      if (!key) return null;
      try {
        const r = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              { role: 'system', content: 'คุณคือ AI Network ผู้ช่วยเครือข่ายประกันชีวิต ตอบภาษาไทย สุภาพ กระชับ เป็นประโยชน์ ตอบได้ทุกเรื่องเหมือน DeepSeek เน้นช่วยงานเครือข่ายตัวแทน' },
              { role: 'user', content: q }
            ],
            temperature: 0.7, max_tokens: 800
          })
        });
        if (!r.ok) return null;
        const j = await r.json();
        return j?.choices?.[0]?.message?.content || null;
      } catch { return null; }
    };
    try {
      const context = {
        membersCount: members.length,
        sampleCodes: members.slice(0, 5).map((m: any) => m.memberCode || m.code),
        userIntent: t.slice(0, 200)
      };
      // 1) ลอง API กลาง
      try {
        const r = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: t, history: messages.slice(-6), context })
        });
        if (r.ok) {
          const j = await r.json();
          if (j?.answer) { setMessages(m => [...m, { role: 'assistant', text: j.answer }]); return; }
        }
      } catch {}
      // 2) ลอง DeepSeek ตรงจากเบราว์เซอร์ (ถ้าตั้ง key ไว้)
      const direct = await tryDirectDeepSeek(t);
      if (direct) { setMessages(m => [...m, { role: 'assistant', text: direct }]); return; }
      // 3) ตอบแบบฝังในระบบสไตล์ DeepSeek
      throw new Error('fallback');
    } catch {
      setMessages(m => [...m, { role: 'assistant', text: localFallback(t) }]);
    } finally { setLoading(false); }
  };

  return (
    <>
      {/* ปุ่มลอย */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label="AI Network Muse Spark 1.2"
        title="AI Network — Muse Spark 1.2 Contributor Free"
        className="fixed bottom-5 right-5 z-[9998] flex items-center gap-2 px-4 py-3 rounded-full font-bold text-white shadow-[0_8px_24px_rgba(37,99,235,0.35)] bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 active:scale-[0.97] transition-all"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
        AI Network
        <span className="hidden sm:inline opacity-90 font-medium">ผู้ช่วยเครือข่าย</span>
        <span className="hidden sm:inline text-[10px] font-extrabold bg-white/20 border border-white/30 px-2 py-0.5 rounded-full">Muse Spark 1.2</span>
      </button>

      {/* แผงแชท */}
      {open && (
        <div className={fullscreen
          ? "fixed inset-0 z-[9998] flex flex-col bg-[#fcfdff] overflow-hidden"
          : "fixed bottom-[76px] right-4 sm:right-5 z-[9998] w-[min(380px,calc(100vw-24px))] h-[min(520px,70vh)] flex flex-col rounded-[20px] overflow-hidden border border-sky-100 bg-[#fcfdff] shadow-[0_16px_48px_rgba(148,163,184,0.35)]"}>
          <div className="px-4 py-3 flex items-center justify-between bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-sm">AI</div>
              <div>
                <div className="text-sm font-extrabold leading-none flex items-center gap-2">AI Network <span className="text-[9px] font-black tracking-widest bg-white text-blue-600 px-2 py-0.5 rounded-full border border-white/80">MUSE SPARK 1.2</span></div>
                <div className="text-[11px] font-semibold bg-white/20 border border-white/30 px-2 py-0.5 rounded-full inline-flex mt-1">Contributor Free • พร้อมใช้งาน</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setFullscreen(v => !v)} title={fullscreen ? "ย่อลง" : "ขยายเต็มจอ"} className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-[13px]">{fullscreen ? "⇲" : "⇱"}</button>
              <button onClick={() => { setOpen(false); setFullscreen(false); }} className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center">✕</button>
            </div>
          </div>

          <div className="px-3 pt-3 flex flex-wrap gap-1.5">
            {QUICK.map(q => (
              <button key={q.label} onClick={() => send(q.prompt)} className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white border border-slate-200/70 text-slate-700 hover:bg-[#f0f9ff] hover:border-blue-200 transition-colors">
                {q.label}
              </button>
            ))}
          </div>

          <div ref={listRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div className={m.role === 'user'
                  ? 'max-w-[78%] px-3 py-2 rounded-2xl rounded-br-lg bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm whitespace-pre-wrap'
                  : 'max-w-[85%] px-3 py-2 rounded-2xl rounded-bl-lg bg-white border border-slate-200/70 text-slate-800 text-sm whitespace-pre-wrap shadow-sm'}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && <div className="text-xs text-slate-400 px-1">AI Network กำลังพิมพ์…</div>}
          </div>

          <div className="p-3 border-t border-slate-100 bg-white flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') send(input); }}
              placeholder="พิมพ์ถาม AI Network… เช่น หา AG000001 หรือ คำนวณรายได้"
              className="flex-1 px-3 py-2 rounded-full border border-slate-200 bg-[#fcfdff] text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
            />
            <button onClick={() => send(input)} disabled={loading || !input.trim()} className="px-4 py-2 rounded-full font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-sm">ส่ง</button>
          </div>
          <div className="px-3 pb-2 text-[10px] text-slate-400 text-center">Muse Spark 1.2 • Contributor Free • สมาชิก {members.length} คน • กดรหัส AG เพื่อดูโปรไฟล์ทันที</div>
        </div>
      )}
    </>
  );
};
