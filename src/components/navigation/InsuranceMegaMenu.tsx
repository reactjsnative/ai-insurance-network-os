import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Menu,
  Sparkles,
  X,
  Building2,
  Network,
  Users,
  Sheet,
  UserPlus,
  Calculator,
  TrendingUp,
  Rocket,
  Gem,
  Video,
  Music2,
  Facebook,
  Youtube,
  Twitter,
  Award,
  Target,
  Boxes,
} from "lucide-react";
import { useApp } from "../../context/AppContext";

type MegaLink = { title: string; description: string; tab: string; icon: any; badge?: string };
type MegaCategory = { id: string; title: string; icon: any; heading: string; description: string; links: MegaLink[] };

const categories: MegaCategory[] = [
  {
    id: "members",
    title: "สมาชิกและองค์กร",
    icon: Users,
    heading: "จัดการสมาชิกและโครงสร้างองค์กร",
    description: "สมัครตัวแทน จัดการสมาชิก และดูโครงสร้างองค์กรทั้งหมด",
    links: [
      { title: "สมัครตัวแทนประกัน", description: "รับสมัครตัวแทนใหม่เข้าสู่ระบบ", tab: "recruit_agent", icon: UserPlus, badge: "ใหม่" },
      { title: "จัดการสมาชิก", description: "ดูและแก้ไขข้อมูลสมาชิกทั้งหมด", tab: "members_mgmt", icon: Users },
      { title: "คลังข้อมูลสมาชิก", description: "ชีตข้อมูลสมาชิกแบบครบถ้วน", tab: "member_sheet", icon: Sheet, badge: "ชีต" },
      { title: "โครงสร้างองค์กร", description: "ดูสายงานและลำดับขั้น", tab: "organization", icon: Building2, badge: "สายงาน" },
      { title: "ผังองค์กร", description: "มุมมองเครือข่าย 4 แบบ", tab: "network_visual", icon: Network, badge: "4 มุมมอง" },
    ],
  },
  {
    id: "income",
    title: "รายได้และเส้นทาง",
    icon: Gem,
    heading: "เครื่องมือรายได้และเส้นทางอาชีพ",
    description: "จำลองรายได้ วางแผนอาชีพ และติดตามเป้าหมาย",
    links: [
      { title: "โปรแกรมจำลองรายได้", description: "คำนวณรายได้แบบจำลอง", tab: "ai_studio", icon: Gem, badge: "จำลอง" },
      { title: "เส้นทางอาชีพ", description: "ดูเส้นทางการเติบโต", tab: "career_path", icon: TrendingUp },
      { title: "แผนอาชีพ", description: "วางแผนอาชีพส่วนตัว", tab: "career_plan", icon: Rocket, badge: "แผน" },
      { title: "เป้าหมายและการจำลอง", description: "ตั้งเป้าหมายและจำลองสถานการณ์", tab: "goals", icon: Target },
    ],
  },
  {
    id: "marketing",
    title: "การตลาดและสื่อ",
    icon: Video,
    heading: "การตลาดและลิงก์โซเชียล",
    description: "ระบบบริหารตัวแทนและลิงก์โซเชียลมีเดีย",
    links: [
      { title: "ระบบบริหารตัวแทน", description: "แดชบอร์ด ทีม สมาชิก ลงทะเบียน", tab: "extracted_dashboard", icon: Boxes },
      { title: "ลิงก์ TikTok", description: "ลิงก์ TikTok ของทีม", tab: "social_tiktok", icon: Music2 },
      { title: "ลิงก์ YouTube", description: "ลิงก์ YouTube ของทีม", tab: "social_youtube", icon: Youtube },
      { title: "ลิงก์ Facebook", description: "ลิงก์ Facebook ของทีม", tab: "social_facebook", icon: Facebook },
    ],
  },
];

export default function InsuranceMegaMenu() {
  const { setActiveTab } = useApp();
  const [desktopOpen, setDesktopOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeId, setActiveId] = useState(categories[0].id);
  const ref = useRef<HTMLElement>(null);
  const active = categories.find(c => c.id === activeId) ?? categories[0];

  useEffect(() => {
    const onDown = (e: PointerEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setDesktopOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setDesktopOpen(false); setMobileOpen(false); } };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("pointerdown", onDown); document.removeEventListener("keydown", onKey); };
  }, []);
  useEffect(() => { document.body.style.overflow = mobileOpen ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [mobileOpen]);

  const go = (tab: string) => { setActiveTab(tab as any); setDesktopOpen(false); setMobileOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (
    <header ref={ref} className="relative z-50 border-b border-sky-100/60 bg-[#f0f9ff]">
      <nav className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-5" aria-label="เมนูหลัก">
        <a href="/" className="flex items-center gap-3" onClick={(e)=>{e.preventDefault(); go("dashboard");}}>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-slate-950 font-black">OS</span>
          <span className="hidden sm:block text-[15px] font-black text-slate-900 tracking-tight">AI INSURANCE NETWORK OS</span>
          <span className="sm:hidden text-[15px] font-black text-slate-900">OS</span>
        </a>

        <div className="hidden h-full items-center gap-1 lg:flex">
          <button
            onClick={() => setDesktopOpen(v=>!v)}
            aria-expanded={desktopOpen}
            className={`flex h-full items-center gap-2 border-b-2 px-3 text-[13px] font-bold transition ${desktopOpen ? "border-blue-600 text-blue-600" : "border-transparent text-blue-600 hover:text-blue-700"}`}
          >
            เมนู <ChevronDown className={`h-4 w-4 transition-transform ${desktopOpen ? "rotate-180" : ""}`} />
          </button>
          <button onClick={()=>go("dashboard")} className="px-3 text-[13px] font-semibold text-blue-600 hover:text-blue-700">แดชบอร์ด</button>
          <button onClick={()=>go("recruit_agent")} className="px-3 text-[13px] font-semibold text-blue-600 hover:text-blue-700">สมัครตัวแทน</button>
          <button onClick={()=>go("members_mgmt")} className="px-3 text-[13px] font-semibold text-blue-600 hover:text-blue-700">จัดการสมาชิก</button>
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <button onClick={()=>go("ai_studio")} className="rounded-full bg-blue-600 px-5 py-2 text-[13px] font-bold text-slate-950 hover:bg-blue-500">จำลองรายได้</button>
        </div>

        <button onClick={()=>setMobileOpen(true)} className="rounded-lg p-2 text-slate-800 hover:bg-[#f0f9ff] lg:hidden"><Menu className="h-6 w-6" /></button>
      </nav>

      {desktopOpen && (
        <>
          <button onClick={()=>setDesktopOpen(false)} className="fixed inset-0 top-[68px] z-40 hidden cursor-default bg-[#f0f9ff]/20 backdrop-blur-[2px] lg:block" aria-label="ปิดเมนู" />
          <section className="absolute left-1/2 top-[76px] z-50 hidden w-[min(94vw,1200px)] -translate-x-1/2 overflow-hidden rounded-2xl border border-sky-100/60 bg-[#f0f9ff] shadow-2xl lg:block">
            <div className="grid min-h-[480px] grid-cols-[300px_1fr]">
              <aside className="border-r border-sky-100/60 bg-[#f0f9ff] p-6">
                <p className="mb-4 text-[11px] font-bold uppercase tracking-widest text-slate-800">หมวดหมู่</p>
                <div className="space-y-2">
                  {categories.map(c=>{
                    const Icon=c.icon; const sel=c.id===activeId;
                    return (
                      <button key={c.id} onMouseEnter={()=>setActiveId(c.id)} onClick={()=>setActiveId(c.id)} className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${sel ? "bg-blue-600/15 text-blue-700 border border-blue-600/30" : "text-slate-800 hover:bg-[#f0f9ff] hover:text-blue-600"}`}>
                        <span className={`grid h-9 w-9 place-items-center rounded-full ${sel ? "bg-blue-600 text-slate-950" : "bg-[#f0f9ff] text-slate-800"}`}><Icon className="h-5 w-5" /></span>
                        <span className="flex-1 text-[13px] font-bold">{c.title}</span>
                        <ChevronRight className="h-4 w-4 opacity-60" />
                      </button>
                    );
                  })}
                </div>
              </aside>
              <main className="p-7 bg-[#f0f9ff]">
                <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-7 text-white border border-blue-600/20">
                  <div className="relative z-10 max-w-xl">
                    <p className="mb-2 text-xs font-bold tracking-widest text-blue-700">{active.title}</p>
                    <h2 className="text-2xl font-black">{active.heading}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-800">{active.description}</p>
                  </div>
                  <div className="absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-blue-600/10" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {active.links.map(l=>{
                    const Icon=l.icon;
                    return (
                      <button key={l.tab} onClick={()=>go(l.tab)} className="group flex gap-3 rounded-xl border border-sky-100/60 bg-[#f0f9ff] p-4 text-left transition hover:border-blue-600/40 hover:bg-[#f0f9ff]">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f0f9ff] text-slate-800 group-hover:bg-blue-600 group-hover:text-slate-950 transition"><Icon className="h-5 w-5" /></span>
                        <span className="min-w-0"><span className="flex items-center gap-1 text-[13px] font-bold text-slate-900 group-hover:text-blue-600">{l.title} {l.badge && <span className="ml-1 rounded-full bg-blue-600 px-1.5 py-0.5 text-[9px] font-black text-slate-950">{l.badge}</span>}<ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition" /></span><span className="mt-1 block text-xs leading-5 text-slate-800">{l.description}</span></span>
                      </button>
                    );
                  })}
                </div>
              </main>
            </div>
          </section>
        </>
      )}

      {mobileOpen && (
        <div className="fixed inset-0 z-[70] bg-[#f0f9ff] lg:hidden">
          <div className="flex h-[68px] items-center justify-between border-b border-sky-100/60 px-5">
            <span className="text-[15px] font-black text-slate-900">AI INSURANCE NETWORK OS</span>
            <button onClick={()=>setMobileOpen(false)} className="rounded-lg p-2 text-slate-800 hover:bg-[#f0f9ff]"><X className="h-6 w-6" /></button>
          </div>
          <div className="h-[calc(100vh-68px)] overflow-y-auto p-5 space-y-3">
            {categories.map(c=>{
              const Icon=c.icon; const exp=activeId===c.id;
              return (
                <div key={c.id} className="overflow-hidden rounded-xl border border-sky-100/60 bg-[#f0f9ff]">
                  <button onClick={()=>setActiveId(exp ? "" : c.id)} className="flex w-full items-center gap-3 p-4 text-left">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-blue-600/15 text-blue-600"><Icon className="h-5 w-5" /></span>
                    <span className="flex-1 text-[13px] font-bold text-slate-900">{c.title}</span>
                    <ChevronDown className={`h-5 w-5 text-slate-800 transition-transform ${exp ? "rotate-180" : ""}`} />
                  </button>
                  {exp && (
                    <div className="space-y-2 border-t border-sky-100/60 bg-[#f0f9ff] p-3">
                      {c.links.map(l=>{
                        const Ic=l.icon;
                        return (
                          <button key={l.tab} onClick={()=>go(l.tab)} className="flex w-full gap-3 rounded-lg bg-[#f0f9ff] p-3 text-left border border-sky-100/60">
                            <Ic className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                            <span><span className="block text-[13px] font-bold text-slate-900">{l.title}</span><span className="mt-1 block text-xs text-slate-800">{l.description}</span></span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
