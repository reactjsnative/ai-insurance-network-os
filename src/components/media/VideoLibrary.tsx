import React, { useState } from 'react';
import { Video, Play, Plus, Link2, Trash2, Youtube, Eye } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { db } from '../../lib/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { safeGet, safeSet } from '../../lib/safeStorage';

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
    const saved = safeGet(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed as VideoItem[];
      } catch { /* ignore */ }
    }
    return INITIAL_VIDEOS;
  });
  const [activeVideo, setActiveVideo] = useState<VideoItem>(() => {
    const saved = safeGet(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0] as VideoItem;
      } catch { /* ignore */ }
    }
    return INITIAL_VIDEOS[0];
  });
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', url: '', category: 'ทั่วไป' });

  // Keep a ref of latest videos for the Firestore sync effect.
  const videosRef = React.useRef(videos);
  React.useEffect(() => { videosRef.current = videos; }, [videos]);

  // Persist to localStorage (same-device fallback / instant load).
  React.useEffect(() => {
    safeSet(STORAGE_KEY, JSON.stringify(videos));
  }, [videos]);

  // Firestore sync so videos appear on every device (phone, tablet, PC).
  // Merge instead of replace so local-only videos never disappear, and seed
  // them into Firestore so they sync everywhere.
  React.useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'videos'), (snap) => {
        const remote: VideoItem[] = [];
        snap.forEach((d) => remote.push(d.data() as VideoItem));
        const remoteIds = new Set(remote.map((v) => v.id));
        const localOnly = videosRef.current.filter((v) => !remoteIds.has(v.id));
        // Seed local-only videos into Firestore so they persist across devices.
        localOnly.forEach((v) => setDoc(doc(db, 'videos', v.id), v).catch((err) => console.warn('video seed:', err)));
        // Merge so nothing disappears from the UI.
        const merged = [...remote, ...localOnly];
        setVideos(merged);
        safeSet(STORAGE_KEY, JSON.stringify(merged));
      }, (err) => console.warn('videos listener:', err));
      return () => unsub();
    } catch (e) {
      console.warn('videos sync init:', e);
    }
  }, []);

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
    const next = [item, ...videos];
    setVideos(next);
    setActiveVideo(item);
    // Write ALL videos to Firestore (not just the new one) so old ones never get lost.
    next.forEach((v) => setDoc(doc(db, 'videos', v.id), v).catch((err) => console.warn('video save:', err)));
    setForm({ title: '', url: '', category: 'ทั่วไป' });
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    const next = videos.filter((v) => v.id !== id);
    setVideos(next);
    if (activeVideo.id === id) setActiveVideo(next[0]);
    deleteDoc(doc(db, 'videos', id)).catch((err) => console.warn('video delete:', err));
  };

  return (
    <div id="video_library_view" className="space-y-6 max-w-7xl mx-auto pb-16 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Video className="w-6 h-6 text-blue-600" />
            {t('nav_video_library')}
          </h1>
          <p className="text-sm text-slate-800 mt-1">
            คลังวีดีโอความรู้ สอนการใช้งาน และกลยุทธ์เครือข่ายสำหรับตัวแทน
          </p>
        </div>
        <button
          id="btn_add_video"
          onClick={() => setShowAdd((s) => !s)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-slate-950 text-sm font-bold transition-all shadow-sm shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" /> เพิ่มวีดีโอ
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="p-4 rounded-2xl bg-[#f0f9ff]/80 border border-sky-100/60 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              id="video_title_input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="ชื่อวีดีโอ"
              className="px-3 py-2 rounded-lg bg-[#f0f9ff] border border-sky-100/60 text-slate-900 text-sm focus:outline-none focus:border-blue-600"
            />
            <input
              id="video_url_input"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="ลิงก์ YouTube / Vimeo"
              className="px-3 py-2 rounded-lg bg-[#f0f9ff] border border-sky-100/60 text-slate-900 text-sm focus:outline-none focus:border-blue-600"
            />
            <input
              id="video_cat_input"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="หมวดหมู่"
              className="px-3 py-2 rounded-lg bg-[#f0f9ff] border border-sky-100/60 text-slate-900 text-sm focus:outline-none focus:border-blue-600"
            />
          </div>
          <div className="flex gap-2">
            <button
              id="btn_save_video"
              onClick={handleAdd}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-slate-950 text-sm font-bold"
            >
              บันทึก
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="px-4 py-2 rounded-lg bg-[#e0f2fe] hover:bg-slate-200 text-slate-800 text-sm"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Player */}
        <div className="lg:col-span-2 space-y-3">
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-[#f0f9ff] border border-sky-100/60">
            {activeVideo ? (
              activeVideo.type === 'image' ? (
                <img
                  id="video_player"
                  src={activeVideo.url}
                  alt={activeVideo.title}
                  className="w-full h-full object-contain bg-[#f0f9ff]"
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
              <div className="flex items-center justify-center h-full text-slate-800 text-sm">
                ยังไม่มีวีดีโอ
              </div>
            )}
          </div>
          {activeVideo && (
            <div className="p-4 rounded-2xl bg-[#f0f9ff]/60 border border-sky-100/60">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Play className="w-4 h-4 text-blue-600" /> {activeVideo.title}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-slate-800">
                <span className="px-2 py-0.5 rounded-full bg-blue-600/15 text-blue-600 border border-blue-600/30">
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
          <h3 className="text-sm font-bold text-slate-800 px-1">รายการวีดีโอ ({videos.length})</h3>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {videos.map((v) => (
              <div
                key={v.id}
                className={`group flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                  activeVideo?.id === v.id
                    ? 'bg-blue-600/10 border-blue-600/40'
                    : 'bg-[#f0f9ff]/60 border-sky-100/60 hover:border-sky-100/60'
                }`}
                onClick={() => setActiveVideo(v)}
              >
                <div className="w-10 h-10 rounded-lg bg-[#e0f2fe] flex items-center justify-center shrink-0">
                  <Youtube className="w-5 h-5 text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{v.title}</p>
                  <p className="text-[10px] text-slate-800 truncate">{v.category}</p>
                </div>
                <button
                  id={`btn_del_video_${v.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(v.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-800 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {videos.length === 0 && (
              <p className="text-sm text-slate-800 px-1 py-4 text-center">ยังไม่มีวีดีโอในคลัง</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
