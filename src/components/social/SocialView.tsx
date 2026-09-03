import React from 'react';
import { ExternalLink, Globe, Youtube, Facebook } from 'lucide-react';
import { useApp } from '../../context/AppContext';

// Social platform link hub — submenu views for the ลิงก์ (Social) menu
// (TikTok submenu uses the full TikTokLinks page with เพิ่มลิงก์ + link list.)
// URLs are easy to edit here when accounts/pages change.
const SOCIAL_LINKS: Record<
  string,
  { title: string; url: string; desc: string; icon: any; gradient: string; ring: string }
> = {
  social_facebook: {
    title: 'ลิงก์ Facebook (Social)',
    url: 'https://www.facebook.com/',
    desc: 'ลิงก์ Facebook ของทีมและตัวแทน เพื่อต่อยอดการตลาดออนไลน์',
    icon: Facebook,
    gradient: 'from-blue-600/20 via-sky-100 to-sky-50',
    ring: 'border-blue-500/30',
  },
  social_youtube: {
    title: 'ลิงก์ YouTube (Social)',
    url: 'https://www.youtube.com/',
    desc: 'ลิงก์ YouTube ของทีมและตัวแทน เพื่อต่อยอดการตลาดออนไลน์',
    icon: Youtube,
    gradient: 'from-red-600/20 via-sky-100 to-sky-50',
    ring: 'border-red-500/30',
  },
};

export const SocialView: React.FC = () => {
  const { activeTab } = useApp();
  const item = SOCIAL_LINKS[activeTab] || SOCIAL_LINKS.social_facebook;
  const Icon = item.icon;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className={`p-6 sm:p-8 rounded-3xl bg-gradient-to-r ${item.gradient} border ${item.ring} shadow-xl`}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-sky-50/80 border border-sky-100 flex items-center justify-center shadow-md">
            <Icon className="w-7 h-7 text-slate-900" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{item.title}</h1>
            <p className="text-xs text-slate-700 mt-1">{item.desc}</p>
          </div>
        </div>

        <div className="mt-6 p-4 rounded-2xl bg-sky-50/60 border border-sky-100">
          <div className="flex items-center gap-2 text-[11px] text-slate-700">
            <Globe className="w-3.5 h-3.5" />
            <span className="truncate font-mono text-slate-700">{item.url}</span>
          </div>
        </div>

        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
        >
          <ExternalLink className="w-4 h-4" />
          เปิด {item.title} ในแท็บใหม่
        </a>

        <p className="mt-4 text-[11px] text-slate-700 text-center">
          ลิงก์อย่างเป็นทางการ · กดเพื่อเปิดหน้า {item.title} ภายนอกระบบ
        </p>
      </div>
    </div>
  );
};

export default SocialView;
