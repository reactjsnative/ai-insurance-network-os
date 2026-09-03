import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, ExternalLink, Play } from 'lucide-react';

const TIKTOK_URL = 'https://ads.tiktok.com/business/th';

const DEFAULT_SCENES = [
  { title: 'สอนยิงแอด TikTok Ads แบบมืออาชีพ', body: 'จากการเข้าสู่ระบบ ไปจนถึงตั้งค่าแคมเปญแบบเป็นขั้นตอน', duration: 5 },
  { title: 'เข้า TikTok for Business', body: 'จุดเริ่มต้นคือ ads.tiktok.com/business/th เข้าสู่ระบบเพื่อจัดการโฆษณา', duration: 4 },
  { title: 'เปิด TikTok Ads Manager', body: 'Dashboard สำหรับสร้างและบริหารแคมเปญ Campaign · Analytics · Tools · Assets', duration: 4 },
  { title: 'STEP 1 — CREATE CAMPAIGN', body: 'เลือก Objective ให้ตรงกับผลลัพธ์: รับรู้ / เข้าชมเว็บ / Leads / Conversion', duration: 4 },
  { title: 'STEP 2 — TARGET AUDIENCE', body: 'พื้นที่ · ช่วงอายุ · ความสนใจ · พฤติกรรม ทดลองหลายกลุ่มด้วยข้อมูลจริง', duration: 4 },
  { title: 'STEP 3 — BUDGET & SCHEDULE', body: 'Daily Budget · Start/End Date เริ่มงบควบคุมได้ ก่อนขยายแคมเปญที่ทำผลงานดี', duration: 4 },
  { title: 'STEP 4 — CREATE YOUR AD', body: 'โครงสร้าง HOOK → PROBLEM → SOLUTION → BENEFIT → CTA ดึงดูด 3–5 วินาทีแรก', duration: 5 },
  { title: 'SET YOUR CTA', body: 'Learn More · Sign Up · Contact Us · Shop Now เลือกให้สัมพันธ์กับสิ่งที่ต้องการ', duration: 4 },
  { title: 'CHECK → REVIEW → PUBLISH', body: 'ตรวจสอบ Objective · Audience · Budget · Creative · CTA ก่อนส่งตรวจสอบ', duration: 4 },
  { title: 'วิเคราะห์ & ปรับปรุง', body: 'Impressions · Clicks · CTR · CPC · Conversions · CPA · ROAS ปรับแคมเปญต่อเนื่อง', duration: 4 },
];

export const TikTokAdsTutorial: React.FC = () => {
  const { t } = useApp();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildVideo = async () => {
    setLoading(true);
    setError(null);
    setVideoUrl(null);
    try {
      const res = await fetch('/api/tiktok-ads/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'tiktok_ads',
          accent: '#ff0050',
          voice: 'th-TH-PremwadeeNeural',
          footer: 'เริ่มสร้างโฆษณา TikTok Ads » https://ads.tiktok.com/business/th',
          scenes: DEFAULT_SCENES,
        }),
      });
      const data = await res.json();
      console.log('[tiktok-ads] response', data);
      if (!res.ok || !data.ok) throw new Error((data && (data.error || data.detail)) || 'สร้างวิดีโอไม่สำเร็จ');
      setVideoUrl(data.url);
      console.log('[tiktok-ads] videoUrl set:', data.url);
    } catch (e: any) {
      console.error('[tiktok-ads] ERROR', e);
      setError(e.message || 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="tiktok_ads_view" className="space-y-8 max-w-7xl mx-auto pb-16 text-left">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-sky-50 to-rose-950/30 border border-sky-100 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-rose-400" />
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30">TUTORIAL</span>
          </div>
          <h1 className="mt-2 text-2xl font-black text-slate-900">สอนยิงแอด TikTok Ads</h1>
          <p className="text-sm text-slate-700 mt-1">เรียนรู้สร้างแคมเปญโฆษณาบน TikTok Ads Manager ตั้งแต่เริ่มต้นจนยิงแอดได้จริง</p>
        </div>
        <a
          href={TIKTOK_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#ff0050] hover:bg-[#e60048] text-slate-900 text-xs font-bold transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          เปิด TikTok for Business
        </a>
      </div>

      {/* Steps overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {DEFAULT_SCENES.map((s, i) => (
          <div key={i} className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100">
            <div className="text-[11px] font-bold text-rose-400 mb-1">ขั้นตอนที่ {i + 1}</div>
            <div className="text-sm font-bold text-slate-900 mb-1">{s.title}</div>
            <div className="text-xs text-slate-700 leading-relaxed">{s.body}</div>
          </div>
        ))}
      </div>

      {/* Video generator */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Play className="w-5 h-5 text-rose-400" />
          <h2 className="text-lg font-black text-slate-900">สร้างวิดีโอสอนยิงแอด</h2>
        </div>
        <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-50 to-rose-950/20 border border-sky-100 space-y-4">
          <p className="text-xs text-slate-700 leading-relaxed">
            กดปุ่มเพื่อสร้าง <b>วิดีโอสอนยิงแอด TikTok</b> แนว Professional Tutorial (9:16) พร้อมเสียงเล่าภาษาไทย
            และแสดงลิงก์ <b>ads.tiktok.com/business/th</b> ด้านล่างของวิดีโอตลอดทั้งคลิป
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={buildVideo}
              disabled={loading}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white text-xs font-bold shadow-lg shadow-rose-500/20 transition-all disabled:opacity-60 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  กำลังสร้างวิดีโอ...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  สร้างวิดีโอสอนยิงแอด
                </>
              )}
            </button>
            <a
              href={TIKTOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-rose-300 hover:underline flex items-center gap-1"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {TIKTOK_URL}
            </a>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-[11px] text-rose-200">{error}</div>
          )}

          {videoUrl && (
            <div className="rounded-2xl overflow-hidden border border-rose-500/30 bg-sky-50">
              <video
                src={videoUrl}
                controls
                className="w-full max-h-[70vh]"
                onError={(e) => setError('ไม่สามารถเล่นวิดีโอได้: ' + (videoUrl || ''))}
              />
              <div className="p-3 text-[11px] text-slate-700 flex items-center justify-between flex-wrap gap-2">
                <span>วิดีโอสอนยิงแอด TikTok Ads</span>
                <div className="flex items-center gap-3">
                  <a href={TIKTOK_URL} target="_blank" rel="noopener noreferrer" className="text-rose-300 hover:underline flex items-center gap-1">
                    <ExternalLink className="w-3.5 h-3.5" />
                    เริ่มสร้างโฆษณา
                  </a>
                  <a href={videoUrl} download className="text-rose-300 hover:underline">ดาวน์โหลด</a>
                </div>
              </div>
            </div>
          )}

          <p className="text-[10px] text-slate-700 leading-relaxed">
            วิดีโอใช้เพื่อการศึกษา ไม่รับประกันยอดขายหรือรายได้ใด ๆ การยิงแอดต้องอาศัยการทดสอบและวิเคราะห์ข้อมูลอย่างต่อเนื่อง
          </p>
        </div>
      </section>
    </div>
  );
};
