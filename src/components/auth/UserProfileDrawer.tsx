import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Shield, 
  CheckCircle2, 
  AlertCircle, 
  LogOut, 
  Link2, 
  Unlink, 
  Key, 
  Smartphone, 
  Lock, 
  Clock, 
  User,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Plus
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GoogleIcon, TikTokIcon, FacebookIcon } from './SocialOAuthPopup';
import { AuthProvider } from '../../types';

interface UserProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileDrawer: React.FC<UserProfileDrawerProps> = ({ isOpen, onClose }) => {
  const { 
    authUser, 
    activeUser, 
    linkSocialAccount, 
    unlinkSocialAccount, 
    logout, 
    openOAuthPopup, 
    openAuthModal,
    positions,
    t 
  } = useApp();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentPos = positions.find(p => p.id === activeUser.positionId);

  const handleToggleLink = async (provider: 'google' | 'tiktok' | 'facebook') => {
    setIsUpdating(provider);
    if (authUser.connectedProviders.includes(provider)) {
      await unlinkSocialAccount(provider);
    } else {
      openOAuthPopup(provider);
    }
    setIsUpdating(null);
  };

  const handleConfirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    onClose();
    openAuthModal('login');
  };

  const providerList: {
    id: 'google' | 'tiktok' | 'facebook' | 'email';
    name: string;
    icon: React.ReactNode;
    description: string;
  }[] = [
    {
      id: 'google',
      name: 'Google Account',
      icon: <GoogleIcon className="w-5 h-5" />,
      description: authUser.connectedProviders.includes('google') ? authUser.email : 'เชื่อมต่อเพื่อเข้าสู่ระบบด้วย Google 1-Click',
    },
    {
      id: 'tiktok',
      name: 'TikTok Creator Auth',
      icon: <TikTokIcon className="w-5 h-5 text-pink-500" />,
      description: authUser.connectedProviders.includes('tiktok') ? (authUser.tiktokHandle || '@insurance_leader') : 'เชื่อมต่อโปรไฟล์ TikTok สำหรับดึงยอดผู้มุ่งหวัง',
    },
    {
      id: 'facebook',
      name: 'Meta Facebook',
      icon: <FacebookIcon className="w-5 h-5" />,
      description: authUser.connectedProviders.includes('facebook') ? (authUser.facebookId || 'fb.agent.official') : 'เชื่อมต่อ Facebook Fanpage เพื่อประสานงานทีม',
    },
    {
      id: 'email',
      name: 'Email & Password',
      icon: <Lock className="w-5 h-5 text-indigo-500" />,
      description: authUser.email,
    },
  ];

  return (
    <div 
      id="profile-drawer-backdrop"
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm"
    >
      <motion.div
        id="profile-drawer-content"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-hidden border-l border-slate-200"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white relative">
          <button
            id="btn-close-profile-drawer"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4 mt-2">
            <div className="relative">
              <img
                src={authUser.avatarUrl || activeUser.avatarUrl}
                alt={authUser.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-400/50 shadow-md"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider bg-indigo-950 px-2 py-0.5 rounded-md border border-indigo-700/50">
                  {currentPos?.code || 'RM'} • {activeUser.memberCode}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mt-1 leading-tight">{authUser.name}</h3>
              <p className="text-xs text-slate-300 truncate max-w-[200px]">{authUser.email}</p>
            </div>
          </div>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Active Rank & Commission Tier */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">ตำแหน่งปัจจุบันในเครือข่าย</span>
              <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                {currentPos?.titleTh || 'ผู้บริหารภาค (RM)'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mt-3 pt-3 border-t border-slate-200/70">
              <div>
                <span className="text-[11px] text-slate-400 block">รหัสตัวแทน</span>
                <span className="font-semibold text-slate-800">{activeUser.memberCode}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">สิทธิ์การเข้าถึง</span>
                <span className="font-semibold text-slate-800 capitalize">{authUser.role}</span>
              </div>
            </div>
          </div>

          {/* Connected Social Accounts */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Link2 className="w-4 h-4 text-indigo-600" />
                บัญชีที่เชื่อมต่อ (Connected Logins)
              </h4>
              <span className="text-[11px] text-slate-400">
                {authUser.connectedProviders.length} / 4 ช่องทาง
              </span>
            </div>

            <div className="space-y-2.5">
              {providerList.map(item => {
                const isConnected = authUser.connectedProviders.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                      isConnected ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50/70 border-dashed border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-xl bg-slate-100 border border-slate-200 shrink-0">
                        {item.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-900">{item.name}</p>
                          {isConnected && (
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              เชื่อมต่อแล้ว
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">{item.description}</p>
                      </div>
                    </div>

                    {item.id !== 'email' ? (
                      <button
                        id={`btn-toggle-link-${item.id}`}
                        onClick={() => handleToggleLink(item.id as 'google' | 'tiktok' | 'facebook')}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
                          isConnected
                            ? 'text-rose-600 hover:bg-rose-50 border border-rose-200'
                            : 'text-indigo-600 hover:bg-indigo-50 border border-indigo-200 bg-white'
                        }`}
                      >
                        {isConnected ? 'ยกเลิก' : 'เชื่อมต่อ'}
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium px-2 py-1 bg-slate-100 rounded">
                        หลัก
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Security Status */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-indigo-600" />
                การยืนยันตัวตน 2 ขั้นตอน (2FA)
              </span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                Active (เปิดใช้งาน)
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>เข้าสู่ระบบล่าสุด: {new Date(authUser.lastLoginAt).toLocaleTimeString('th-TH')} วันนี้</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 space-y-2">
          {!showLogoutConfirm ? (
            <button
              id="btn-drawer-signout"
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full py-2.5 px-4 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>ออกจากระบบ (Sign Out)</span>
            </button>
          ) : (
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 space-y-2">
              <p className="text-xs font-semibold text-rose-800 text-center">
                คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบ?
              </p>
              <div className="flex gap-2">
                <button
                  id="btn-confirm-signout"
                  onClick={handleConfirmLogout}
                  className="flex-1 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                >
                  ยืนยันออกจากระบบ
                </button>
                <button
                  id="btn-cancel-signout"
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
