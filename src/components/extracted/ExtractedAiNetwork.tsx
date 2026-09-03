import React, { useState } from 'react';
import { ExternalLink, RefreshCw, Network } from 'lucide-react';
import { useApp } from '../../context/AppContext';

// Local same-origin copy (served from public/extracted-app/) so the parent can
// deep-link into each section via URL hash (#<tab>).
const EXTRACTED_LOCAL_URL = '/extracted-app/';

const TAB_LABELS: Record<string, string> = {
  dashboard: 'ภาพรวมระบบ (Dashboard)',
  network_tree: 'ผังสายงาน Tree Network',
  members: 'ทะเบียนสมาชิกตัวแทน',
  registration: 'สมัครสมาชิก & Referral QR',
  auto_builder: 'สร้างทีมอัตโนมัติ (Auto Builder)',
  auto_sponsor: 'รันเลขผู้แนะนำอัตโนมัติ',
  calculator: 'คำนวณรายได้ & ผลงาน',
  promotion: 'ระบบเลื่อนตำแหน่ง',
  simulator: 'จำลองการขยายทีม (Simulator)',
  rules_editor: 'ตั้งค่าเกณฑ์รายได้ (Rules)',
  audit_logs: 'ประวัติการทำงาน (Audit Logs)',
};

export const ExtractedAiNetwork: React.FC<{ tab?: string }> = ({ tab = 'dashboard' }) => {
  const [nonce, setNonce] = useState(0);
  const src = `${EXTRACTED_LOCAL_URL}#${tab}`;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] min-h-[560px] w-full rounded-2xl overflow-hidden border border-sky-50/40 bg-[#fcfdff] shadow-[0_4px_12px_rgba(148,163,184,0.10)] shadow-black/40">
      {/* Slim toolbar */}
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-sky-50/40 bg-[#fcfdff]/95 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <Network className="w-4 h-4 text-blue-600 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate leading-tight">
              ระบบบริหารตัวแทนประกันชีวิต
            </p>
            <p className="text-[10px] text-slate-800 truncate leading-tight">
              {TAB_LABELS[tab] || tab} · AI Insurance Network &amp; Team Builder
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setNonce((n) => n + 1)}
            title="โหลดใหม่ (Reload)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-800 hover:text-slate-900 hover:bg-[#f0f9ff] border border-sky-50/40/60 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">โหลดใหม่</span>
          </button>
          <a
            href="/extracted-app/"
            target="_blank"
            rel="noopener noreferrer"
            title="เปิดในแท็บใหม่ (Open in new tab)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:text-amber-200 hover:bg-blue-600/10 border border-blue-600/30 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">เปิดแท็บใหม่</span>
          </a>
        </div>
      </div>

      {/* Full embedded app (same-origin copy, deep-linked to the selected section) */}
      <iframe
        key={nonce}
        src={src}
        title="extracted-ai-network — AI Insurance Network & Team Builder"
        className="flex-1 w-full bg-[#fcfdff]"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-popups-to-escape-sandbox"
        allow="clipboard-read; clipboard-write"
        referrerPolicy="no-referrer-when-downgrade"
        loading="eager"
      />
    </div>
  );
};

export default ExtractedAiNetwork;
