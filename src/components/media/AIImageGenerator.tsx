import React, { useState } from 'react';
import {
  Wand2,
  Sparkles,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Download,
  Library,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

type Stage = 'idle' | 'generating' | 'done' | 'error';

const SAMPLE_PROMPTS = [
  'professional insurance agent in a modern office, confident smile, cinematic lighting, photorealistic',
  'a growing network of connected people forming an organization chart, golden hour, inspirational',
  'a family protected by an umbrella of insurance, warm and safe, soft bokeh background',
  'a leader presenting to a team in a glass conference room, corporate, sharp focus',
];

export const AIImageGenerator: React.FC = () => {
  const { t, activeUser } = useApp();

  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState('1024x1024');
  const [quality, setQuality] = useState('auto');
  const [stage, setStage] = useState<Stage>('idle');
  const [statusText, setStatusText] = useState('');
  const [error, setError] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [revised, setRevised] = useState('');
  const [configured, setConfigured] = useState<boolean | null>(null);

  React.useEffect(() => {
    fetch('/api/ai/image-status')
      .then((r) => r.json())
      .then((d) => setConfigured(!!d.configured))
      .catch(() => setConfigured(false));
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim() || stage === 'generating') return;
    setError('');
    setImageUrl(null);
    setRevised('');
    setStage('generating');
    setStatusText('กำลังสร้างภาพด้วย OpenAI gpt-image-1...');
    try {
      const res = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim(), size, quality, n: 1 }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Image generation failed');
      }
      setImageUrl(data.image);
      setRevised(data.revisedPrompt || '');
      setStage('done');
      setStatusText('สร้างภาพเสร็จสิ้น!');
    } catch (e: any) {
      console.error('AIImageGenerator error:', e);
      setError(e.message || 'เกิดข้อผิดพลาดในการสร้างภาพ');
      setStage('error');
    }
  };

  const reset = () => {
    setStage('idle');
    setStatusText('');
    setError('');
    setImageUrl(null);
    setRevised('');
  };

  const isBusy = stage === 'generating';

  return (
    <div id="ai_image_view" className="space-y-6 max-w-7xl mx-auto pb-16 text-left">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-slate-100 shadow-lg shadow-emerald-500/30">
              <Wand2 className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-100">
              AI Image Generator (OpenAI)
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            สร้างภาพ AI จากคำบรรยายด้วย OpenAI gpt-image-1 — ซ่อน API key ไว้ฝั่งเซิร์ฟเวอร์
          </p>
        </div>
        <div
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold self-start md:self-auto ${
            configured === null
              ? 'bg-slate-800 text-slate-400'
              : configured
              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
              : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
          }`}
        >
          {configured === null ? (
            <span className="w-2 h-2 rounded-full bg-slate-500 animate-pulse" />
          ) : configured ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>OpenAI พร้อมใช้งาน</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3 h-3" />
              <span>ยังไม่ได้ตั้ง OPENAI_API_KEY</span>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left — Controls */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-400" /> คำบรรยายภาพ (Prompt)
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isBusy}
                rows={3}
                placeholder="เช่น ตัวแทนประกันภัยมืออาชีพยิ้มมั่นใจในออฟฟิศทันสมัย..."
                className="mt-2 w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400">ขนาด (Size)</label>
                <select
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  disabled={isBusy}
                  className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50"
                >
                  <option value="1024x1024">1024 × 1024</option>
                  <option value="1536x1024">1536 × 1024</option>
                  <option value="1024x1536">1024 × 1536</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400">คุณภาพ (Quality)</label>
                <select
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  disabled={isBusy}
                  className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50"
                >
                  <option value="auto">อัตโนมัติ</option>
                  <option value="high">สูง</option>
                  <option value="low">ต่ำ</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {SAMPLE_PROMPTS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(p)}
                  disabled={isBusy}
                  className="px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 text-[11px] transition-colors"
                >
                  {p.length > 36 ? p.slice(0, 36) + '…' : p}
                </button>
              ))}
            </div>

            <button
              id="btn_ai_generate"
              onClick={handleGenerate}
              disabled={!prompt.trim() || isBusy}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white font-bold text-sm transition-all shadow-md shadow-emerald-500/20"
            >
              {isBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isBusy ? 'กำลังสร้างภาพ...' : 'สร้างภาพ AI'}
            </button>

            {(stage === 'done' || stage === 'error') && (
              <button
                onClick={reset}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm"
              >
                <RefreshCw className="w-4 h-4" /> เริ่มใหม่
              </button>
            )}

            {isBusy && (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce [animation-delay:0.2s]" />
                <span className="ml-1">{statusText}</span>
              </div>
            )}

            {stage === 'error' && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {stage === 'done' && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>สร้างภาพเสร็จสิ้น — สามารถดาวน์โหลดหรือบันทึกลงคลังได้</span>
              </div>
            )}

            {revised && (
              <p className="text-[11px] text-slate-500 leading-relaxed">
                <span className="text-slate-400 font-semibold">Prompt ที่ปรับปรุงโดย AI:</span> {revised}
              </p>
            )}
          </div>

          {configured === false && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs leading-relaxed">
              <strong>หมายเหตุ:</strong> เซิร์ฟเวอร์ยังไม่ได้ตั้ง <code>OPENAI_API_KEY</code> ฟีเจอร์นี้จะเรียก OpenAI ไม่ได้จนกว่าจะตั้งค่า
              เพิ่ม <code>OPENAI_API_KEY="คีย์ของคุณ"</code> ในไฟล์ <code>.env</code> แล้วรัน <code>npm run dev</code> ใหม่
            </div>
          )}
        </div>

        {/* Right — Preview */}
        <div className="space-y-3">
          <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
            {imageUrl ? (
              <img src={imageUrl} alt="Generated" className="w-full h-full object-contain" />
            ) : isBusy ? (
              <div className="text-center text-slate-500 text-sm px-6">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-emerald-400" />
                {statusText}
              </div>
            ) : (
              <div className="text-center text-slate-600 text-sm px-6">
                <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-40" />
                ภาพที่สร้างจะแสดงที่นี่
              </div>
            )}
          </div>

          {imageUrl && (
            <div className="flex items-center gap-3 flex-wrap">
              <a
                href={imageUrl}
                download={`ai_image_${Date.now()}.png`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition-all"
              >
                <Download className="w-4 h-4" /> ดาวน์โหลด
              </a>
              <button
                onClick={() => {
                  // Save into the Video Library store as an image item
                  const ev = new CustomEvent('ai-image-save', {
                    detail: { imageUrl, prompt: revised || prompt },
                  });
                  window.dispatchEvent(ev);
                  setStatusText('บันทึกลงคลังแล้ว! ดูได้ในแท็บ "คลังวีดีโอ"');
                  setStage('done');
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm"
              >
                <Library className="w-4 h-4" /> บันทึกลงคลัง
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
