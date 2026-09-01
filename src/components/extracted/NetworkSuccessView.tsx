import React, { useState } from 'react';
import { ExternalLink, RefreshCw, Award } from 'lucide-react';

// Network Success — extracted AI Studio app (AI Insurance Network Success)
// TODO: replace with the production deployment URL once the app is exported & deployed to Vercel
// (e.g. https://network-success-ak-e11e.vercel.app/)
const NETWORK_SUCCESS_URL =
  'https://aistudio.google.com/apps/0c3874ca-d79e-45c7-8603-550a96d370f1?showPreview=true&project=akarapol798&showAssistant=true';

export const NetworkSuccessView: React.FC = () => {
  const [nonce, setNonce] = useState(0);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] min-h-[560px] w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl shadow-black/40">
      {/* Slim toolbar */}
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-slate-800 bg-slate-950/95 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <Award className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-100 truncate leading-tight">Network Success</p>
            <p className="text-[10px] text-slate-500 truncate leading-tight">
              เครือข่ายความสำเร็จตัวแทนประกัน · AI Insurance Network Success
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setNonce((n) => n + 1)}
            title="โหลดใหม่ (Reload)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">โหลดใหม่</span>
          </button>
          <a
            href={NETWORK_SUCCESS_URL}
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

      {/* Full embedded app */}
      <iframe
        key={nonce}
        src={NETWORK_SUCCESS_URL}
        title="Network Success — AI Insurance Network Success"
        className="flex-1 w-full bg-white"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-popups-to-escape-sandbox"
        allow="clipboard-read; clipboard-write"
        referrerPolicy="no-referrer-when-downgrade"
        loading="eager"
      />
    </div>
  );
};

export default NetworkSuccessView;
