import React from 'react';
import { Gem, ExternalLink, Copy, Check, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const AI_STUDIO_URL =
  'https://aistudio.google.com/apps/de660bca-bc1b-474a-9b86-b103f5e31a52?showPreview=true&showAssistant=true';

export const AiStudioView: React.FC = () => {
  const { t } = useApp();
  const [copied, setCopied] = React.useState(false);

  const openApp = () => {
    window.open(AI_STUDIO_URL, '_blank', 'noopener,noreferrer');
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(AI_STUDIO_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — ignore */
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] h-full text-center px-4 py-8">
      <div className="max-w-xl w-full">
        {/* Icon badge */}
        <div className="mx-auto mb-6 w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 p-[2px] shadow-lg shadow-amber-500/20">
          <div className="w-full h-full rounded-[22px] bg-slate-950 flex items-center justify-center">
            <Gem className="w-9 h-9 text-amber-300" />
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
            {t('ai_studio_title')}
          </span>
          <Sparkles className="w-4 h-4 text-amber-400" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-3">
          {t('ai_studio_subtitle')}
        </h1>
        <p className="text-sm text-slate-400 mb-8 leading-relaxed">{t('ai_studio_desc')}</p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
          <button
            id="btn_ai_studio_open"
            onClick={openApp}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 hover:from-amber-400 hover:to-orange-400 transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            {t('ai_studio_open')}
          </button>
          <button
            id="btn_ai_studio_copy"
            onClick={copyLink}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? t('ai_studio_copied') : t('ai_studio_copy')}
          </button>
        </div>

        {/* URL display */}
        <div className="mx-auto max-w-md mb-6 px-4 py-2.5 rounded-lg bg-slate-900/70 border border-slate-800 text-[11px] text-slate-500 font-mono break-all">
          {AI_STUDIO_URL}
        </div>

        {/* Note */}
        <div className="mx-auto max-w-md flex items-start gap-2 px-4 py-3 rounded-xl bg-slate-900/40 border border-slate-800 text-left">
          <ExternalLink className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
          <p className="text-[11px] text-slate-500 leading-relaxed">{t('ai_studio_note')}</p>
        </div>
      </div>
    </div>
  );
};
