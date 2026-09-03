import React, { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  Tv, 
  Bell, 
  UserCheck, 
  ChevronDown, 
  Globe,
  Shield, 
  Building2, 
  Users, 
  CheckCircle2, 
  AlertTriangle,
  LogIn,
  LogOut,
  User,
  Link2,
  KeyRound,
  Cloud,
  Database
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GoogleIcon, TikTokIcon, FacebookIcon } from '../auth/SocialOAuthPopup';
import { UserProfileDrawer } from '../auth/UserProfileDrawer';

export const Header: React.FC = () => {
  const { 
    authUser,
    openAuthModal,
    showGatewayScreen,
    setShowGatewayScreen,
    activeUser, 
    members, 
    switchActiveUser, 
    searchQuery, 
    setSearchQuery, 
    setSelectedMember, 
    setActiveTab,
    isPresentationMode,
    setIsPresentationMode,
    isFirebaseConnected,
    language,
    toggleLanguage,
    t
  } = useApp();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);

  const filteredSearchMembers = searchQuery.trim() 
    ? members.filter(m => 
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        m.memberCode.toLowerCase() === searchQuery.toLowerCase() ||
        m.location.province.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6)
    : [];

  const handleSelectSearchedMember = (m: any) => {
    setSelectedMember(m);
    setActiveTab('network_visual');
    setSearchQuery('');
  };

  const notifications = [
    { 
      id: 1, 
      title: language === 'th' ? 'สมาชิกใกล้ครบเกณฑ์เลื่อนตำแหน่ง' : 'Promotion Milestone Alert', 
      desc: language === 'th' ? 'ยังไม่มีข้อมูลสมาชิกที่เข้าเกณฑ์เลื่อนตำแหน่ง' : 'No members approaching promotion criteria yet', 
      time: language === 'th' ? '10 นาทีที่แล้ว' : '10 mins ago', 
      type: 'promotion' 
    },
    { 
      id: 2, 
      title: language === 'th' ? 'อัตรา Active ประจำสัปดาห์' : 'Weekly Top Active Rate', 
      desc: language === 'th' ? 'ยังไม่มีข้อมูลผลงานประจำสัปดาห์' : 'No weekly performance data yet', 
      time: language === 'th' ? '1 ชั่วโมงที่แล้ว' : '1 hour ago', 
      type: 'success' 
    },
    { 
      id: 3, 
      title: language === 'th' ? 'การแจ้งเตือนความเสี่ยง Retention' : 'Retention Risk Notification', 
      desc: language === 'th' ? 'ยังไม่มีข้อมูลความเสี่ยง Retention' : 'No retention risk data yet', 
      time: language === 'th' ? '3 ชั่วโมงที่แล้ว' : '3 hours ago', 
      type: 'warning' 
    },
  ];

  return (
    <>
      <header id="app_header" className="h-16 border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
        {/* Left: Brand / Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black text-lg shrink-0">
            OS
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-slate-900 tracking-tight text-sm sm:text-base">
                AI INSURANCE <span className="text-amber-400">NETWORK OS</span>
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                {t('plan_badge')}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">{t('app_subtitle')}</p>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="relative max-w-md w-full mx-4 hidden md:block">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              id="global_network_search_input"
              type="text"
              placeholder={t('search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/70 border border-slate-200 focus:border-amber-500/50 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all"
            />
          </div>

          {/* Search Results Dropdown */}
          {filteredSearchMembers.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-200 rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="p-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 border-b border-slate-200">
                {t('search_results')} ({filteredSearchMembers.length})
              </div>
              {filteredSearchMembers.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleSelectSearchedMember(m)}
                  className="w-full px-3 py-2 text-left hover:bg-slate-800/80 flex items-center justify-between group transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <img src={m.avatarUrl} alt={m.name} className="w-7 h-7 rounded-full object-cover border border-slate-700" referrerPolicy="no-referrer" />
                    <div>
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-amber-400">{m.name}</div>
                      <div className="text-[10px] text-slate-400">{m.memberCode} • {m.location.province}</div>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {m.positionId === 'region_manager' ? t('pos_rm_short') : m.positionId === 'center_manager' ? t('pos_cm_short') : m.positionId === 'unit_manager' ? t('pos_um_short') : t('pos_ag_short')}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Firebase Cloud Badge, Language Switcher, Presentation Mode, Notifications, User Switcher / Auth */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Firebase Cloud Live Database Badge */}
          <div 
            id="badge_firebase_status" 
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950/80 border border-slate-200 text-[11px] font-medium"
            title="Firebase Firestore Cloud Database"
          >
            <div className={`w-2 h-2 rounded-full ${isFirebaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <Cloud className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-300 font-medium">
              {isFirebaseConnected ? 'Firebase เชื่อมต่อแล้ว' : 'Firebase พร้อมใช้'}
            </span>
          </div>

          {/* Language Switcher Button (TH / EN) */}
          <button
            id="btn_language_switcher"
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all bg-slate-800/90 hover:bg-slate-800 text-amber-300 border border-slate-700 shadow-sm cursor-pointer"
            title={t('switch_lang')}
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs">{language === 'th' ? '🇹🇭 TH' : '🇬🇧 EN'}</span>
          </button>

          {/* Gateway / Login Screen Preview Toggle */}
          <button
            id="btn_toggle_gateway_screen"
            onClick={() => setShowGatewayScreen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all bg-gradient-to-r from-amber-500/10 to-amber-600/20 hover:from-amber-500/20 hover:to-amber-600/30 text-amber-300 border border-amber-500/40 cursor-pointer shadow-sm"
            title="ดูภาพหน้าแรกก่อนเข้าระบบ (Login Gateway Screen)"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">หน้าจอก่อนเข้าระบบ</span>
          </button>

          {/* Presentation Mode Toggle */}
          <button
            id="btn_toggle_presentation_mode"
            onClick={() => {
              setIsPresentationMode(!isPresentationMode);
              setActiveTab('network_visual');
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
              isPresentationMode 
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20' 
                : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-slate-700'
            }`}
            title={t('presentation_desc')}
          >
            <Tv className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">{t('presentation_mode')}</span>
          </button>

          {/* Notifications Button */}
          <div className="relative">
            <button
              id="btn_notifications"
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-9 h-9 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center relative transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-amber-400 absolute top-2 right-2 animate-pulse" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-200 rounded-2xl shadow-2xl p-3 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2">
                  <span className="text-xs font-bold text-slate-200">{t('notifications')}</span>
                  <span className="text-[10px] text-amber-400 font-medium">3 {t('new_items')}</span>
                </div>
                <div className="space-y-2">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-2 rounded-xl bg-slate-950/60 border border-slate-200/80 text-left">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                        {n.type === 'promotion' ? <Sparkles className="w-3 h-3 text-amber-400" /> :
                         n.type === 'warning' ? <AlertTriangle className="w-3 h-3 text-rose-400" /> :
                         <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                        {n.title}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 leading-snug">{n.desc}</div>
                      <div className="text-[9px] text-slate-500 mt-1">{n.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Authentication & User Account Control */}
          {!authUser.isLoggedIn ? (
            <button
              id="btn-header-signin"
              onClick={() => openAuthModal('login')}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>เข้าสู่ระบบ (Sign In)</span>
            </button>
          ) : (
            <div className="relative">
              <button
                id="btn_user_role_switcher"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 transition-all text-left cursor-pointer"
              >
                <div className="relative">
                  <img 
                    src={authUser.avatarUrl || activeUser.avatarUrl} 
                    alt={authUser.name || activeUser.name} 
                    className="w-7 h-7 rounded-lg object-cover border border-amber-500/40"
                    referrerPolicy="no-referrer"
                  />
                  {/* Provider small badge */}
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
                    {authUser.provider === 'google' && <GoogleIcon className="w-2.5 h-2.5" />}
                    {authUser.provider === 'tiktok' && <TikTokIcon className="w-2 h-2 text-cyan-400" />}
                    {authUser.provider === 'facebook' && <FacebookIcon className="w-2.5 h-2.5" />}
                    {authUser.provider === 'email' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                  </span>
                </div>

                <div className="hidden lg:block text-left">
                  <div className="text-xs font-bold text-slate-200 truncate max-w-[120px]">
                    {authUser.name || activeUser.name}
                  </div>
                  <div className="text-[10px] text-amber-400 font-medium flex items-center gap-1">
                    {activeUser.positionId === 'region_manager' ? t('pos_rm') :
                     activeUser.positionId === 'center_manager' ? t('pos_cm') :
                     activeUser.positionId === 'unit_manager' ? t('pos_um') : t('pos_ag')}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-200 rounded-2xl shadow-2xl p-2 z-50">
                  {/* Top Profile Summary */}
                  <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-200 mb-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={authUser.avatarUrl || activeUser.avatarUrl}
                        alt={authUser.name}
                        className="w-10 h-10 rounded-xl object-cover border border-amber-500/40"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{authUser.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{authUser.email}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] font-semibold text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                            {activeUser.memberCode}
                          </span>
                          <span className="text-[10px] text-slate-400 capitalize">
                            via {authUser.provider}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      id="btn-open-user-profile-drawer"
                      onClick={() => {
                        setShowUserMenu(false);
                        setIsProfileDrawerOpen(true);
                      }}
                      className="w-full mt-2.5 py-1.5 px-3 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>จัดการโปรไฟล์ & บัญชีเชื่อมต่อ (4 ช่องทาง)</span>
                    </button>
                  </div>

                  {/* Role Switcher Subsection */}
                  <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>{t('role_switcher')}</span>
                    <span className="text-[10px] text-amber-400 font-normal">สลับมุมมอง</span>
                  </div>

                  <div className="max-h-52 overflow-y-auto space-y-1 my-1">
                    {members.filter(m => ['region_manager', 'center_manager', 'unit_manager', 'agent'].includes(m.positionId)).slice(0, 8).map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          switchActiveUser(m.id);
                          setShowUserMenu(false);
                        }}
                        className={`w-full px-2.5 py-1.5 rounded-xl text-left flex items-center justify-between text-xs transition-colors cursor-pointer ${
                          activeUser.id === m.id ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30' : 'hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <img src={m.avatarUrl} alt={m.name} className="w-6 h-6 rounded-md object-cover" referrerPolicy="no-referrer" />
                          <div>
                            <div className="font-semibold">{m.name}</div>
                            <div className="text-[10px] text-slate-400">{m.memberCode} • {m.positionId}</div>
                          </div>
                        </div>
                        {activeUser.id === m.id && <UserCheck className="w-3.5 h-3.5 text-amber-400" />}
                      </button>
                    ))}
                  </div>

                  {/* Log Out Option */}
                  <div className="pt-2 border-t border-slate-200 mt-1">
                    <button
                      id="btn-header-logout"
                      onClick={() => {
                        setShowUserMenu(false);
                        setIsProfileDrawerOpen(true);
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>ออกจากระบบ (Sign Out)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* User Profile Drawer */}
      <UserProfileDrawer
        isOpen={isProfileDrawerOpen}
        onClose={() => setIsProfileDrawerOpen(false)}
      />
    </>
  );
};

