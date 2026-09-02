import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Calculator, 
  Building2,
  Network, 
  TrendingUp, 
  Rocket,
  Compass,
  Target, 
  Bot, 
  Users, 
  UserPlus,
  FileText, 
  Sliders,
  Settings as SettingsIcon,
  ShieldAlert, 
  Sparkles,
  Layers,
  Award,
  Video,
  Music2,
  Sheet,
  Gem,
  Boxes,
  ChevronDown,
  ChevronRight,
  QrCode,
  RefreshCw,
  Youtube,
  Facebook,
  Github,
  Twitter
} from 'lucide-react';
import { useApp, ActiveTab } from '../../context/AppContext';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, activeUser, t, setShowGatewayScreen } = useApp();

  const navItems: { id: ActiveTab; label: string; icon: any; badge?: string }[] = [
    { id: 'dashboard', label: t('nav_dashboard'), icon: LayoutDashboard },
    { id: 'ai_studio', label: t('nav_ai_studio'), icon: Gem, badge: 'จำลอง' },
    { id: 'organization', label: t('nav_organization'), icon: Building2, badge: 'สายงาน' },
    { id: 'network_visual', label: t('nav_network_visual'), icon: Network, badge: '4 มุมมอง' },
    { id: 'career_path', label: t('nav_career_path'), icon: TrendingUp },
    { id: 'career_plan', label: t('nav_career_plan'), icon: Rocket, badge: 'แผน' },
    { id: 'my_plan', label: t('nav_my_plan'), icon: UserPlus, badge: 'สมาชิก' },
    { id: 'member_sheet', label: t('nav_member_sheet'), icon: Sheet, badge: 'ชีต' },
    { id: 'goals', label: t('nav_goals'), icon: Compass, badge: 'กลยุทธ์' },
    { id: 'simulation_goals', label: t('nav_simulation_goals'), icon: Target, badge: 'สถานการณ์' },
    { id: 'ai_coach', label: t('nav_ai_coach'), icon: Bot, badge: 'AI' },
    { id: 'members_mgmt', label: t('nav_members_mgmt'), icon: Users },
    { id: 'compensation_admin', label: t('nav_compensation_admin'), icon: Sliders },
    { id: 'reports', label: t('nav_reports'), icon: FileText },
    { id: 'video_library', label: t('nav_video_library'), icon: Video, badge: 'สื่อ' },
    { id: 'settings', label: t('nav_settings'), icon: SettingsIcon, badge: 'DB & API' },
  ];

  // ซัพเมนูของ Network Success (เครือข่ายความสำเร็จ)
  const [networkSuccessOpen, setNetworkSuccessOpen] = useState(true);
  const networkSuccessItems: { id: ActiveTab; label: string; icon: any }[] = [
    { id: 'network_success', label: t('nav_network_success'), icon: Award },
    { id: 'network_success_team_goal', label: t('nav_network_success_team_goal'), icon: Target },
  ];
  const isNetworkSuccessActive = networkSuccessItems.some((item) => activeTab === item.id);

  // ซัพเมนูของระบบบริหารตัวแทนประกันชีวิต (เดิมคือเมนูใน extracted-ai-network)
  const [extractedOpen, setExtractedOpen] = useState(true);
  const extractedItems: { id: ActiveTab; label: string; icon: any }[] = [
    { id: 'extracted_dashboard', label: t('ext_sub_dashboard'), icon: LayoutDashboard },
    { id: 'extracted_network_tree', label: t('ext_sub_network_tree'), icon: Network },
    { id: 'extracted_members', label: t('ext_sub_members'), icon: Users },
    { id: 'extracted_registration', label: t('ext_sub_registration'), icon: QrCode },
    { id: 'extracted_auto_builder', label: t('ext_sub_auto_builder'), icon: Boxes },
    { id: 'extracted_auto_sponsor', label: t('ext_sub_auto_sponsor'), icon: RefreshCw },
    { id: 'extracted_calculator', label: t('ext_sub_calculator'), icon: Calculator },
    { id: 'extracted_promotion', label: t('ext_sub_promotion'), icon: TrendingUp },
    { id: 'extracted_simulator', label: t('ext_sub_simulator'), icon: Target },
    { id: 'extracted_rules_editor', label: t('ext_sub_rules_editor'), icon: Sliders },
    { id: 'extracted_audit_logs', label: t('ext_sub_audit_logs'), icon: FileText },
  ];
  const isExtractedActive = extractedItems.some((item) => activeTab === item.id);

  // ซัพเมนูของ Social (ลิงก์โซเชียลมีเดีย)
  const [socialOpen, setSocialOpen] = useState(true);
  const socialItems: { id: ActiveTab; label: string; icon: any }[] = [
    { id: 'social_facebook', label: t('social_sub_facebook'), icon: Facebook },
    { id: 'social_youtube', label: t('social_sub_youtube'), icon: Youtube },
    { id: 'social_tiktok', label: t('social_sub_tiktok'), icon: Music2 },
    { id: 'social_x', label: t('social_sub_x'), icon: Twitter },
  ];
  const isSocialActive = socialItems.some((item) => activeTab === item.id);

  const renderNavItem = (item: { id: ActiveTab; label: string; icon: any; badge?: string }) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;
    return (
      <button
        key={item.id}
        id={`nav_${item.id}`}
        onClick={() => setActiveTab(item.id)}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
          isActive
            ? 'bg-gradient-to-r from-amber-500/20 to-amber-500/5 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
          <span className="truncate">{item.label}</span>
        </div>
        {item.badge && (
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
            isActive 
              ? 'bg-amber-400 text-slate-950' 
              : item.badge === 'AI' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-slate-800 text-slate-400'
          }`}>
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <aside id="app_sidebar" className="w-64 border-r border-slate-800 bg-slate-950 flex flex-col justify-between shrink-0 hidden lg:flex">
      {/* Navigation Links */}
      <div className="p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">
          {t('menu_core')}
        </div>

        {/* ===== เมนู 1: แดชบอร์ดผู้บริหาร ===== */}
        {navItems.slice(0, 1).map(renderNavItem)}

        {/* ===== เมนู 2: สมัครตัวแทนประกัน ===== */}
        {renderNavItem({ id: 'recruit_agent', label: t('nav_recruit_agent'), icon: UserPlus, badge: 'ใหม่' })}

        {/* ===== เมนู 3: ซัพเมนู ระบบบริหารตัวแทนประกัน ===== */}
        <div className="pt-1">
          <button
            id="nav_extracted_group"
            onClick={() => setExtractedOpen((v) => !v)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all group ${
              isExtractedActive
                ? 'bg-gradient-to-r from-blue-500/20 to-blue-500/5 text-blue-300 border border-blue-500/40 shadow-sm shadow-blue-500/10'
                : 'text-slate-300 hover:text-white hover:bg-slate-900/80 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Boxes className={`w-4 h-4 transition-colors ${isExtractedActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
              <span className="truncate">{t('nav_extracted_ai_network')}</span>
            </div>
            {extractedOpen ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            )}
          </button>

          {extractedOpen && (
            <div className="ml-2.5 pl-2.5 mt-0.5 space-y-0.5 border-l border-slate-800">
              {extractedItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav_${item.id}`}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-medium transition-all group ${
                      isActive
                        ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 transition-colors ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ===== เมนู 3: โปรแกรมจำลองรายได้ ===== */}
        {renderNavItem(navItems[1])}

        {/* ===== ซัพเมนู: Network Success (เครือข่ายความสำเร็จ) ===== */}
        <div className="pt-1">
          <button
            id="nav_network_success_group"
            onClick={() => setNetworkSuccessOpen((v) => !v)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all group ${
              isNetworkSuccessActive
                ? 'bg-gradient-to-r from-amber-500/20 to-amber-500/5 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10'
                : 'text-slate-300 hover:text-white hover:bg-slate-900/80 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Award className={`w-4 h-4 transition-colors ${isNetworkSuccessActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
              <span className="truncate">{t('nav_network_success')}</span>
            </div>
            {networkSuccessOpen ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            )}
          </button>

          {networkSuccessOpen && (
            <div className="ml-2.5 pl-2.5 mt-0.5 space-y-0.5 border-l border-slate-800">
              {networkSuccessItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav_${item.id}`}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-medium transition-all group ${
                      isActive
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 transition-colors ${isActive ? 'text-amber-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ===== เมนูที่เหลือ ===== */}
        {navItems.slice(2).map(renderNavItem)}

        {/* ===== ซัพเมนู: Social (โซเชียลมีเดีย) ===== */}
        <div className="pt-1">
          <button
            id="nav_social_group"
            onClick={() => setSocialOpen((v) => !v)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all group ${
              isSocialActive
                ? 'bg-gradient-to-r from-violet-500/20 to-violet-500/5 text-violet-300 border border-violet-500/40 shadow-sm shadow-violet-500/10'
                : 'text-slate-300 hover:text-white hover:bg-slate-900/80 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Music2 className={`w-4 h-4 transition-colors ${isSocialActive ? 'text-violet-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
              <span className="truncate">{t('nav_social')}</span>
            </div>
            {socialOpen ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            )}
          </button>

          {socialOpen && (
            <div className="ml-2.5 pl-2.5 mt-0.5 space-y-0.5 border-l border-slate-800">
              {socialItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav_${item.id}`}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-medium transition-all group ${
                      isActive
                        ? 'bg-violet-500/15 text-violet-300 border border-violet-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 transition-colors ${isActive ? 'text-violet-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer Info Box */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/40 space-y-2">
        <button
          id="btn_sidebar_view_gateway"
          onClick={() => setShowGatewayScreen(true)}
          className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-850 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center justify-between transition-all cursor-pointer shadow-sm hover:border-amber-400"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>หน้าจอก่อนเข้าระบบ</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
            4 Logins
          </span>
        </button>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-left">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('ai_network_engine')}</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
            {t('ai_network_engine_desc')}
          </p>
        </div>
      </div>
    </aside>
  );
};
