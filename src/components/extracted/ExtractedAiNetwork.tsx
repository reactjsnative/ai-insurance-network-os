import React, { useState } from 'react';
import { ExternalLink, RefreshCw, Network } from 'lucide-react';

// Stable production deployment of the extracted "AI Insurance Network & Team Builder"
// (same bundle as the preview URL https://extracted-ai-network-4o3epgsa0-ak-e11e.vercel.app).
const EXTRACTED_APP_URL = 'https://extracted-ai-network-ak-e11e.vercel.app/';

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
    <div className="flex flex-col h-[calc(100vh-8rem)] min-h-[560px] w-full rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xl shadow-black/40">
      {/* Slim toolbar */}
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-slate-200 bg-white/95 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <Network className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate leading-tight">
              ระบบบริหารตัวแทนประกันชีวิต
            </p>
            <p className="text-[10px] text-slate-600 truncate leading-tight">
              {TAB_LABELS[tab] || tab} · AI Insurance Network &amp; Team Builder
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setNonce((n) => n + 1)}
            title="โหลดใหม่ (Reload)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-white hover:bg-slate-100 border border-slate-200/60 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">โหลดใหม่</span>
          </button>
          <a
            href={EXTRACTED_APP_URL}
            target="_blank"
            rel="noopener noreferrer"
            title="เปิดในแท็บใหม่ (Open in new tab)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 border border-amber-500/30 transition-colors"
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
        className="flex-1 w-full bg-white"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-popups-to-escape-sandbox"
        allow="clipboard-read; clipboard-write"
        referrerPolicy="no-referrer-when-downgrade"
        loading="eager"
      />
    </div>
  );
};

export default ExtractedAiNetwork;
