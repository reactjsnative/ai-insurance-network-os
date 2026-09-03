import React, { useState } from 'react';
import { Facebook, Plus, Link2, Trash2, ExternalLink, User, Share2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { db } from '../../lib/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { safeGet, safeSet } from '../../lib/safeStorage';

interface FacebookLink {
  id: string;
  title: string;
  handle: string; // page name or full url
  url: string;
  owner: string;
  addedAt: string;
}

const INITIAL_LINKS: FacebookLink[] = [
  {
    id: 'fb_001',
    title: 'เพจหลักขององค์กร AI Insurance Network OS',
    handle: 'AI Insurance Network OS',
    url: 'https://www.facebook.com/',
    owner: 'สำนักงานใหญ่',
    addedAt: new Date().toISOString().slice(0, 10),
  },
];

export const FacebookLinks: React.FC = () => {
  const { t, activeUser } = useApp();
  const STORAGE_KEY = 'insure_os_facebook_links_v1';
  const [links, setLinks] = useState<FacebookLink[]>(() => {
    const saved = safeGet(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed as FacebookLink[];
      } catch { /* ignore */ }
    }
    return INITIAL_LINKS;
  });
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', handle: '', url: '' });

  // Keep a ref of latest links for the Firestore sync effect.
  const linksRef = React.useRef(links);
  React.useEffect(() => { linksRef.current = links; }, [links]);

  // Persist to localStorage (same-device fallback / instant load).
  React.useEffect(() => {
    safeSet(STORAGE_KEY, JSON.stringify(links));
  }, [links]);

  // Firestore sync so links appear on every device.
  React.useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'facebookLinks'), (snap) => {
        const remote: FacebookLink[] = [];
        snap.forEach((d) => remote.push(d.data() as FacebookLink));
        const remoteIds = new Set(remote.map((l) => l.id));
        const localOnly = linksRef.current.filter((l) => !remoteIds.has(l.id));
        localOnly.forEach((l) => setDoc(doc(db, 'facebookLinks', l.id), l).catch((err) => console.warn('facebook link seed:', err)));
        const merged = [...remote, ...localOnly];
        setLinks(merged);
        safeSet(STORAGE_KEY, JSON.stringify(merged));
      }, (err) => console.warn('facebook links listener:', err));
      return () => unsub();
    } catch (e) {
      console.warn('facebook links sync init:', e);
    }
  }, []);

  const normalizeUrl = (raw: string): string => {
    if (/^https?:\/\//.test(raw)) return raw;
    const page = raw.replace(/^@/, '');
    return `https://www.facebook.com/${page}`;
  };

  const handleAdd = () => {
    if (!form.handle.trim()) return;
    const item: FacebookLink = {
      id: `fb_${Date.now()}`,
      title: form.title.trim() || form.handle.trim(),
      handle: form.handle.trim(),
      url: normalizeUrl(form.url.trim() || form.handle.trim()),
      owner: activeUser?.name || 'สมาชิก',
      addedAt: new Date().toISOString().slice(0, 10),
    };
    const next = [item, ...links];
    setLinks(next);
    next.forEach((l) => setDoc(doc(db, 'facebookLinks', l.id), l).catch((err) => console.warn('facebook link save:', err)));
    setForm({ title: '', handle: '', url: '' });
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== id));
    deleteDoc(doc(db, 'facebookLinks', id)).catch((err) => console.warn('facebook link delete:', err));
  };

  const openLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Facebook className="w-6 h-6 text-blue-400" />
            {t('social_sub_facebook')}
          </h1>
          <p className="text-sm text-slate-800 mt-1">
            ลิงก์ Facebook ของทีมและตัวแทน เพื่อต่อยอดการตลาดออนไลน์
          </p>
        </div>
        <button
          id="btn_add_facebook"
          onClick={() => setShowAdd((s) => !s)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-slate-950 text-sm font-bold transition-all shadow-[0_1px_3px_rgba(148,163,184,0.08)] shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" /> เพิ่มลิงก์
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="p-4 rounded-2xl bg-[#fcfdff]/80 border border-sky-50/40 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              id="fb_title_input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="ชื่อ/คำอธิบาย"
              className="px-3 py-2 rounded-lg bg-[#fcfdff] border border-sky-50/40 text-slate-900 text-sm focus:outline-none focus:border-blue-600"
            />
            <input
              id="fb_handle_input"
              value={form.handle}
              onChange={(e) => setForm({ ...form, handle: e.target.value })}
              placeholder="ชื่อเพจ/ผู้ใช้ เช่น AINetworkOS"
              className="px-3 py-2 rounded-lg bg-[#fcfdff] border border-sky-50/40 text-slate-900 text-sm focus:outline-none focus:border-blue-600"
            />
            <input
              id="fb_url_input"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="ลิงก์ (เว้นไว้ได้)"
              className="px-3 py-2 rounded-lg bg-[#fcfdff] border border-sky-50/40 text-slate-900 text-sm focus:outline-none focus:border-blue-600"
            />
          </div>
          <div className="flex gap-2">
            <button
              id="btn_save_facebook"
              onClick={handleAdd}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-slate-950 text-sm font-bold"
            >
              บันทึก
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="px-4 py-2 rounded-lg bg-[#f0f9ff] hover:bg-slate-200 text-slate-800 text-sm"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      {/* Link grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {links.map((l) => (
          <div
            key={l.id}
            className="group relative p-4 rounded-2xl bg-gradient-to-br from-sky-50/90 to-sky-50 border border-sky-50/40 hover:border-blue-500/40 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#f0f9ff] flex items-center justify-center shrink-0">
                <Facebook className="w-5 h-5 text-blue-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900 truncate flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-800" /> {l.handle}
                </p>
                <p className="text-[11px] text-slate-800 truncate">โดย {l.owner} · {l.addedAt}</p>
              </div>
              <button
                id={`btn_del_fb_${l.id}`}
                onClick={() => handleDelete(l.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-800 hover:text-red-400 hover:bg-red-500/10 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-sm text-slate-800 mt-3 line-clamp-2">{l.title}</p>
            <button
              id={`btn_open_fb_${l.id}`}
              onClick={() => openLink(l.url)}
              className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-[#f0f9ff] hover:bg-blue-500/20 hover:text-blue-300 text-slate-800 text-xs font-semibold border border-sky-50/40 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" /> เปิดใน Facebook
            </button>
          </div>
        ))}
        {links.length === 0 && (
          <div className="col-span-full p-8 rounded-2xl bg-[#fcfdff]/60 border border-dashed border-sky-50/40 text-center text-slate-800 text-sm">
            <Share2 className="w-8 h-8 mx-auto mb-2 text-slate-800" />
            ยังไม่มีลิงก์ Facebook — กด "เพิ่มลิงก์" เพื่อเริ่มต้น
          </div>
        )}
      </div>
    </div>
  );
};

export default FacebookLinks;
