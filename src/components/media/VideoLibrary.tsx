import React, { useState } from 'react';
import { Video, Play, Plus, Link2, Trash2, Youtube, Eye } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface VideoItem {
  id: string;
  title: string;
  url: string; // YouTube / Vimeo / direct OR a data:image base64 for AI-generated images
  type?: 'video' | 'image';
  category: string;
  addedBy: string;
  addedAt: string;
}

// Default sample videos (YouTube embeds)
const INITIAL_VIDEOS: VideoItem[] = [
  {
    id: 'vid_001',
    title: 'แนะนำระบบ AI INSURANCE NETWORK OS',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    type: 'video',
    category: 'แพลตฟอร์ม',
    addedBy: 'ผู้บริหารระบบ',
    addedAt: new Date().toISOString().slice(0, 10),
  },
  {
    id: 'vid_002',
    title: 'กลยุทธ์สร้างทีม Infinite Network',
    url: 'https://www.youtube.com/embed/ScMzIvxBSi4',
    type: 'video',
    category: 'การสร้างคน',
    addedBy: 'ผู้บริหารระบบ',
    addedAt: new Date().toISOString().slice(0, 10),
  },
  {
    id: 'vid_003',
    title: 'คำนวณรายได้ตาม Compensation Plan',
    url: 'https://www.youtube.com/embed/9bZkp7q19f0',
    type: 'video',
    category: 'ผลตอบแทน',
    addedBy: 'ผู้บริหารระบบ',
    addedAt: new Date().toISOString().slice(0, 10),
  },
];

export const VideoLibrary: React.FC = () => {
  const { t, activeUser } = useApp();
  const STORAGE_KEY = 'insure_os_videos_v1';
  const [videos, setVideos] = useState<VideoItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed as VideoItem[];
      }
    } catch { /* ignore */ }
    return INITIAL_VIDEOS;
  });
  const [activeVideo, setActiveVideo] = useState<VideoItem>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0] as VideoItem;
      }
    } catch { /* ignore */ }
    return INITIAL_VIDEOS[0];
  });
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', url: '', category: 'ทั่วไป' });

  // Persist to localStorage so added videos survive page changes / reloads.
  React.useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(videos)); } catch { /* ignore */ }
  }, [videos]);

  // Allow the AI Image Generator to push generated images into this library
  React.useEffect(() => {
    const onSave = (e: Event) => {
      const detail = (e as CustomEvent).detail as { imageUrl: string; prompt: string };
      if (!detail?.imageUrl) return;
      const item: VideoItem = {
        id: `aiimg_${Date.now()}`,
        title: detail.prompt ? `AI: ${detail.prompt.slice(0, 60)}${detail.prompt.length > 60 ? '…' : ''}` : 'AI Generated Image',
        url: detail.imageUrl,
        type: 'image',
        category: 'AI Generated',
        addedBy: activeUser?.name || 'สมาชิก',
        addedAt: new Date().toISOString().slice(0, 10),
      };
      setVideos((prev) => [item, ...prev]);
      setActiveVideo(item);
    };
    window.addEventListener('ai-image-save', onSave as EventListener);
    return () => window.removeEventListener('ai-image-save', onSave as EventListener);
  }, [activeUser]);

  const normalizeEmbed = (raw: string): string => {
    // Convert youtube watch url to embed
    const yt = raw.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
    if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
    const ytEmbed = raw.match(/youtube\.com\/embed\/([\w-]+)/);
    if (ytEmbed) return raw;
    return raw; // assume already embeddable / direct
  };

  const handleAdd = () => {
    if (!form.title.trim() || !form.url.trim()) return;
    const item: VideoItem = {
      id: `vid_${Date.now()}`,
      title: form.title.trim(),
      url: normalizeEmbed(form.url.trim()),
      category: form.category.trim() || 'ทั่วไป',
      addedBy: activeUser?.name || 'สมาชิก',
      addedAt: new Date().toISOString().slice(0, 10),
    };
    setVideos((prev) => [item, ...prev]);
    setActiveVideo(item);
    setForm({ title: '', url: '', category: 'ทั่วไป' });
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    const next = videos.filter((v) => v.id !== id);
    setVideos(next);
    if (activeVideo.id === id) setActiveVideo(next[0]);
  };

  return (
    <div id="video_library_view" className="space-y-6 max-w-7xl mx-auto pb-16 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Video className="w-6 h-6 text-amber-400" />
            {t('nav_video_library')}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            คลังวีดีโอความรู้ สอนการใช้งาน และกลยุทธ์เครือข่ายสำหรับตัวแทน
          </p>
        </div>
        <button
          id="btn_add_video"
          onClick={() => setShowAdd((s) => !s)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-bold transition-all shadow-sm shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" /> เพิ่มวีดีโอ
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              id="video_title_input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="ชื่อวีดีโอ"
              className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
            />
            <input
              id="video_url_input"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="ลิงก์ YouTube / Vimeo"
              className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
            />
            <input
              id="video_cat_input"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="หมวดหมู่"
              className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              id="btn_save_video"
              onClick={handleAdd}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-bold"
            >
              บันทึก
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Player */}
        <div className="lg:col-span-2 space-y-3">
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
            {activeVideo ? (
              activeVideo.type === 'image' ? (
                <img
                  id="video_player"
                  src={activeVideo.url}
                  alt={activeVideo.title}
                  className="w-full h-full object-contain bg-slate-950"
                />
              ) : (
                <iframe
                  id="video_player"
                  src={activeVideo.url}
                  title={activeVideo.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                ยังไม่มีวีดีโอ
              </div>
            )}
          </div>
          {activeVideo && (
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Play className="w-4 h-4 text-amber-400" /> {activeVideo.title}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-slate-400">
                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  {activeVideo.category}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" /> โดย {activeVideo.addedBy}
                </span>
                <span>· {activeVideo.addedAt}</span>
              </div>
            </div>
          )}
        </div>

        {/* Playlist */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-300 px-1">รายการวีดีโอ ({videos.length})</h3>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {videos.map((v) => (
              <div
                key={v.id}
                className={`group flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                  activeVideo?.id === v.id
                    ? 'bg-amber-500/10 border-amber-500/40'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
                onClick={() => setActiveVideo(v)}
              >
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                  <Youtube className="w-5 h-5 text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-200 truncate">{v.title}</p>
                  <p className="text-[10px] text-slate-500 truncate">{v.category}</p>
                </div>
                <button
                  id={`btn_del_video_${v.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(v.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {videos.length === 0 && (
              <p className="text-sm text-slate-500 px-1 py-4 text-center">ยังไม่มีวีดีโอในคลัง</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
