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
        return `ตาม Compensation Plan 15 ม.ค. 64:\n• UM: ค่าจัดงานหน่วย 25-40% ของ COM (5,000 → 40%)\n• CM: T1 3-15% / T2 0.8% เบี้ยปีต่อ / T3 ตามเกณฑ์ + โบนัสศูนย์ 4-6%\n• RM: T1 10-18% / T2 1,000-2,500/ศูนย์ / เป้าหมาย 10k-30k/เดือน / โบนัส 1.5-2.5%\nดูรายละเอียดที่เมนู “คำนวณรายได้” ได้เลยครับ — มีสมาชิก ${members.length} คนในระบบ`;
      }
      if (s.includes('เลื่อนตำแหน่ง') || s.includes('เกณฑ์') || s.includes('promotion')) {
        return `เกณฑ์เลื่อนตำแหน่ง:\n• ตัวแทน → UM: บำเหน็จ 20,000 (1-6 เดือน)\n• UM → CM: บำเหน็จ 75,000 (3-6 เดือน) + แยก 2 หน่วย\n• CM → RM: บำเหน็จ 1,200,000 (12-24 เดือน) + แยก 4 ศูนย์\nเช็คความคืบหน้าที่ “Career Path” ได้เลยครับ`;
      }
      if (s.includes('สมัคร') || s.includes('recruit')) {
        return `สมัครตัวแทนใหม่: เมนู “สมัครตัวแทน” → กรอกชื่อ/เบอร์/อีเมล/ผู้แนะนำ (รหัส AG) → ระบบวางสายงานอัตโนมัติและคำนวณรายได้ทันทีครับ`;
      }
      return `สวัสดีครับ ผม AI Network — ผู้ช่วยเครือข่ายของคุณ 🤖 (โหมดฝังในระบบ)\nพิมพ์รหัสเช่น AG000001 เพื่อดูโปรไฟล์ทันที หรือพิมพ์ “คำนวณรายได้ / สรุปทีม / สมัครตัวแทน” ได้เลยครับ`;
    };
    try {
      const context = {
        membersCount: members.length,
        sampleCodes: members.slice(0, 5).map((m: any) => m.memberCode || m.code),
        userIntent: t.slice(0, 200)
      };
      const r = await fetch('/api/hermes/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: t, history: messages.slice(-6), context })
      });
      if (!r.ok) throw new Error('api not ok');
      const j = await r.json();
      if (j?.answer) { setMessages(m => [...m, { role: 'assistant', text: j.answer }]); }
      else throw new Error('no answer');
    } catch {
      setMessages(m => [...m, { role: 'assistant', text: localFallback(t) }]);
    } finally { setLoading(false); }
  };

  return (
    <>
      {/* ปุ่มลอย */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label="AI Network"
        className="fixed bottom-5 right-5 z-[9998] flex items-center gap-2 px-4 py-3 rounded-full font-bold text-white shadow-[0_8px_24px_rgba(37,99,235,0.35)] bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 active:scale-[0.97] transition-all"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
        AI Network
        <span className="hidden sm:inline opacity-90 font-medium">ผู้ช่วยเครือข่าย</span>
      </button>

      {/* แผงแชท */}
      {open && (
        <div className="fixed bottom-[76px] right-4 sm:right-5 z-[9998] w-[min(380px,calc(100vw-24px))] h-[min(520px,70vh)] flex flex-col rounded-[20px] overflow-hidden border border-sky-100 bg-[#fcfdff] shadow-[0_16px_48px_rgba(148,163,184,0.35)]">
          <div className="px-4 py-3 flex items-center justify-between bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-sm">AI</div>
              <div>
                <div className="text-sm font-extrabold leading-none">AI Network</div>
                <div className="text-[11px] opacity-90">ฝังในระบบ • ตอบทันที</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center">✕</button>
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
          <div className="px-3 pb-2 text-[10px] text-slate-400 text-center">AI Network ฝังในระบบ • ข้อมูลสมาชิก {members.length} คน • กดรหัส AG เพื่อดูโปรไฟล์ทันที</div>
        </div>
      )}
    </>
  );
};
