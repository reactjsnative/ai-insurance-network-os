import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Eye, 
  EyeOff, 
  Shield, 
  CheckCircle2, 
  ArrowRight, 
  Loader2, 
  Sparkles, 
  AlertCircle,
  KeyRound,
  Users,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GoogleIcon, TikTokIcon, FacebookIcon } from './SocialOAuthPopup';
import { PositionId } from '../../types';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    authModalTab, 
    openAuthModal,
    loginWithEmail, 
    openOAuthPopup, 
    registerWithEmail,
    members,
    positions,
    t
  } = useApp();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('akarapol.pro798@gmail.com');
  const [loginPassword, setLoginPassword] = useState('123456');
  const [rememberMe, setRememberMe] = useState(true);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPosition, setRegPosition] = useState<PositionId>('agent');
  const [regSponsorCode, setRegSponsorCode] = useState('CM-101');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState<'request' | 'otp' | 'success'>('request');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');

  // Status & loading
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isAuthModalOpen) return null;

  const handleEmailLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!loginEmail.includes('@')) {
      setErrorMessage('กรุณากรอกรูปแบบอีเมลให้ถูกต้อง');
      return;
    }
    if (loginPassword.length < 4) {
      setErrorMessage('รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร');
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginWithEmail({
        email: loginEmail,
        password: loginPassword,
        rememberMe
      });
      if (!res.success) {
        setErrorMessage(res.message);
      }
    } catch (err) {
      setErrorMessage('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!regName.trim()) {
      setErrorMessage('กรุณากรอกชื่อ - นามสกุล');
      return;
    }
    if (!regEmail.includes('@')) {
      setErrorMessage('กรุณากรอกอีเมลให้ถูกต้อง');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMessage('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }

    setIsLoading(true);
    try {
      const res = await registerWithEmail({
        name: regName,
        email: regEmail,
        password: regPassword,
        phone: regPhone,
        positionId: regPosition,
        sponsorCode: regSponsorCode,
      });
      if (!res.success) {
        setErrorMessage(res.message);
      }
    } catch (err) {
      setErrorMessage('เกิดข้อผิดพลาดในการลงทะเบียน');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendResetOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.includes('@')) {
      setErrorMessage('กรุณากรอกอีเมลที่ใช้สมัครสมาชิก');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setForgotStep('otp');
      setErrorMessage('');
    }, 800);
  };

  const handleVerifyOtpAndReset = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setForgotStep('success');
    }, 1000);
  };

  // Quick Demo Accounts
  const demoAccounts = [
    {
      title: 'ดร. อัครพล สุวรรณภูมิ',
      role: 'Super Admin / ผู้บริหารภาค (RM)',
      email: 'akarapol.pro798@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      badge: 'Root Leader',
      color: 'border-purple-200 bg-purple-50/50 hover:bg-purple-50',
    },
    {
      title: 'คุณกนกวรรณ จันทร์สว่าง',
      role: 'Center Manager (CM)',
      email: 'kanokwan@insurance-os.com',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
      badge: 'CM-101',
      color: 'border-blue-200 bg-blue-50/50 hover:bg-blue-50',
    },
    {
      title: 'คุณวีรภัทร ชาญวิทย์',
      role: 'Unit Manager (UM)',
      email: 'weerapat@insurance-os.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      badge: 'UM-101-1',
      color: 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50',
    },
  ];

  return (
    <div 
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
    >
      <motion.div
        id="auth-modal-container"
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden my-8"
      >
        {/* Header Bar */}
        <div className="relative bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-7">
          <button
            id="btn-close-auth-modal"
            onClick={closeAuthModal}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-300">
                AI Insurance Network OS
              </span>
              <h2 className="text-xl font-extrabold text-white">
                {authModalTab === 'login' && 'เข้าสู่ระบบ (Sign In)'}
                {authModalTab === 'register' && 'สร้างบัญชีตัวแทน (Register)'}
                {authModalTab === 'forgot' && 'รีเซ็ตรหัสผ่าน (Reset Password)'}
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-300 max-w-md">
            ระบบบริหารองค์กรตัวแทนประกันชีวิต คำนวณรายได้ตามโครงสร้างผลประโยชน์จริง 13 หมวด
          </p>

          {/* Tab navigation */}
          <div className="flex items-center gap-2 mt-5 p-1 bg-slate-800/80 rounded-xl border border-slate-700/60">
            <button
              id="tab-btn-login"
              onClick={() => {
                setErrorMessage('');
                openAuthModal('login');
              }}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                authModalTab === 'login'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              เข้าสู่ระบบ
            </button>
            <button
              id="tab-btn-register"
              onClick={() => {
                setErrorMessage('');
                openAuthModal('register');
              }}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                authModalTab === 'register'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              สมัครสมาชิกใหม่
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 max-h-[75vh] overflow-y-auto space-y-6">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: LOGIN */}
          {authModalTab === 'login' && (
            <div className="space-y-6">
              {/* Social Login Options */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">
                  เลือกช่องทางเข้าสู่ระบบที่ต้องการ
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Google */}
                  <button
                    id="btn-login-google"
                    type="button"
                    onClick={() => openOAuthPopup('google')}
                    className="py-2.5 px-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 bg-white hover:bg-slate-50/80 text-slate-700 font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <GoogleIcon className="w-4 h-4" />
                    <span>Google</span>
                  </button>

                  {/* TikTok */}
                  <button
                    id="btn-login-tiktok"
                    type="button"
                    onClick={() => openOAuthPopup('tiktok')}
                    className="py-2.5 px-3.5 rounded-xl border border-slate-900 bg-slate-950 hover:bg-slate-900 text-white font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <TikTokIcon className="w-4 h-4 text-cyan-400" />
                    <span>TikTok</span>
                  </button>

                  {/* Facebook */}
                  <button
                    id="btn-login-facebook"
                    type="button"
                    onClick={() => openOAuthPopup('facebook')}
                    className="py-2.5 px-3.5 rounded-xl border border-[#1877F2] bg-[#1877F2] hover:bg-[#166fe5] text-white font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FacebookIcon className="w-4 h-4" />
                    <span>Facebook</span>
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  หรือใช้อีเมล & รหัสผ่าน
                </span>
              </div>

              {/* Email Form */}
              <form onSubmit={handleEmailLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    อีเมล (Email)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="input-login-email"
                      type="email"
                      required
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      placeholder="akarapol.pro798@gmail.com"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-xs text-slate-800 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      รหัสผ่าน (Password)
                    </label>
                    <button
                      id="btn-forgot-password-link"
                      type="button"
                      onClick={() => openAuthModal('forgot')}
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer"
                    >
                      ลืมรหัสผ่าน?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="input-login-password"
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-xs text-slate-800 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    />
                    <span className="text-xs text-slate-600">จดจำการเข้าสู่ระบบ</span>
                  </label>
                </div>

                <button
                  id="btn-submit-email-login"
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>กำลังตรวจสอบข้อมูล...</span>
                    </>
                  ) : (
                    <>
                      <span>เข้าสู่ระบบด้วย Email</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Quick Demo Switcher */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-500" />
                    เข้าสู่ระบบด่วนด้วยบัญชีสาธิต
                  </span>
                </div>
                <div className="space-y-2">
                  {demoAccounts.map(demo => (
                    <button
                      key={demo.email}
                      type="button"
                      onClick={() => {
                        setLoginEmail(demo.email);
                        setLoginPassword('123456');
                      }}
                      className={`w-full p-2.5 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${demo.color}`}
                    >
                      <img
                        src={demo.avatar}
                        alt={demo.title}
                        className="w-8 h-8 rounded-full object-cover border border-white shadow-sm"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-800 truncate">{demo.title}</p>
                          <span className="text-[10px] font-semibold text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-indigo-100">
                            {demo.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">{demo.role}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REGISTER */}
          {authModalTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  ชื่อ - นามสกุล *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-reg-name"
                    type="text"
                    required
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    placeholder="เช่น คุณสมชาย เจริญกิจ"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-xs text-slate-800 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  อีเมล (Email) *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-reg-email"
                    type="email"
                    required
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    placeholder="somchai@insurance-os.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-xs text-slate-800 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  รหัสผ่าน (Password) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-reg-password"
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder="ขั้นต่ำ 6 ตัวอักษร"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-xs text-slate-800 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    เบอร์โทรศัพท์
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="input-reg-phone"
                      type="tel"
                      value={regPhone}
                      onChange={e => setRegPhone(e.target.value)}
                      placeholder="081-234-5678"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 text-xs text-slate-800 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    รหัสผู้แนะนำ
                  </label>
                  <input
                    id="input-reg-sponsor"
                    type="text"
                    value={regSponsorCode}
                    onChange={e => setRegSponsorCode(e.target.value)}
                    placeholder="CM-101"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 text-xs text-slate-800 outline-none uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  ระดับตำแหน่งเริ่มต้น
                </label>
                <select
                  id="select-reg-position"
                  value={regPosition}
                  onChange={e => setRegPosition(e.target.value as PositionId)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 text-xs text-slate-800 outline-none bg-white"
                >
                  <option value="agent">ตัวแทน (Agent)</option>
                  <option value="unit_manager">ผู้บริหารหน่วย (UM)</option>
                  <option value="center_manager">ผู้บริหารศูนย์ (CM)</option>
                </select>
              </div>

              <button
                id="btn-submit-register"
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>กำลังสร้างบัญชีตัวแทน...</span>
                  </>
                ) : (
                  <>
                    <span>ยืนยันสร้างบัญชีตัวแทนใหม่</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 3: FORGOT PASSWORD */}
          {authModalTab === 'forgot' && (
            <div className="space-y-5">
              {forgotStep === 'request' && (
                <form onSubmit={handleSendResetOTP} className="space-y-4">
                  <div className="text-center p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                    <KeyRound className="w-8 h-8 text-indigo-600 mx-auto mb-1.5" />
                    <h4 className="text-sm font-bold text-slate-800">ขอรับรหัส OTP เพื่อรีเซ็ตรหัสผ่าน</h4>
                    <p className="text-xs text-slate-500 mt-0.5">ระบบจะส่งรหัสความปลอดภัย 6 หลักไปยังอีเมลของคุณ</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      อีเมลที่ลงทะเบียนไว้
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="input-forgot-email"
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={e => setForgotEmail(e.target.value)}
                        placeholder="akarapol.pro798@gmail.com"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 text-xs text-slate-800 outline-none"
                      />
                    </div>
                  </div>

                  <button
                    id="btn-send-reset-otp"
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>กำลังส่งรหัส OTP...</span>
                      </>
                    ) : (
                      <>
                        <span>ส่งรหัสยืนยัน OTP</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {forgotStep === 'otp' && (
                <form onSubmit={handleVerifyOtpAndReset} className="space-y-4">
                  <div className="text-center p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-1.5" />
                    <h4 className="text-sm font-bold text-slate-800">กรอกรหัสยืนยัน OTP (6 หลัก)</h4>
                    <p className="text-xs text-slate-500 mt-0.5">ส่งไปยัง {forgotEmail || 'อีเมลของคุณ'} แล้ว (ทดสอบ: 123456)</p>
                  </div>

                  <div className="flex justify-center gap-2">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <input
                        key={i}
                        type="text"
                        maxLength={1}
                        defaultValue={i === 0 ? '1' : i === 1 ? '2' : i === 2 ? '3' : i === 3 ? '4' : i === 4 ? '5' : '6'}
                        className="w-10 h-12 text-center font-bold text-lg rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                      />
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      ตั้งรหัสผ่านใหม่
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="input-new-password"
                        type="password"
                        required
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 text-xs text-slate-800 outline-none"
                      />
                    </div>
                  </div>

                  <button
                    id="btn-confirm-new-password"
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>กำลังบันทึกรหัสผ่านใหม่...</span>
                      </>
                    ) : (
                      <>
                        <span>ยืนยันเปลี่ยนรหัสผ่านและเข้าสู่ระบบ</span>
                        <Check className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {forgotStep === 'success' && (
                <div className="text-center py-6 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">เปลี่ยนรหัสผ่านสำเร็จ</h3>
                  <p className="text-xs text-slate-500">คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้ทันที</p>
                  <button
                    id="btn-back-to-login"
                    type="button"
                    onClick={() => {
                      setForgotStep('request');
                      openAuthModal('login');
                    }}
                    className="py-2.5 px-6 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700"
                  >
                    กลับไปหน้าเข้าสู่ระบบ
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Footer Security Badge */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>มาตรฐานความปลอดภัยเข้ารหัส 256-bit SSL Data Encryption</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
