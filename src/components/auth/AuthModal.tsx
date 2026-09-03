import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  ArrowRight, 
  Loader2, 
  Sparkles, 
  AlertCircle,
  KeyRound
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GoogleIcon, TikTokIcon, FacebookIcon, GithubIcon } from './SocialOAuthPopup';
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
    verifyResetCode,
    confirmResetPassword,
    requestResetOtp,
    verifyResetOtp,
    members,
    positions,
    t
  } = useApp();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPosition, setRegPosition] = useState<PositionId>('agent');
  const [regSponsorCode, setRegSponsorCode] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Forgot password state (email -> code -> new password -> success)
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState<'request' | 'otp' | 'code' | 'reset' | 'success'>('request');
  const [resetCode, setResetCode] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetRequestId, setResetRequestId] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Status & loading
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Auto-open the "set new password" step when arriving from the reset email link
  // (?mode=resetPassword&oobCode=...)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const mode = params.get('mode');
      const oobCode = params.get('oobCode');
      if (mode === 'resetPassword' && oobCode) {
        setResetCode(oobCode);
        setForgotStep('reset');
        openAuthModal('forgot');
        verifyResetCode(oobCode).then((res) => {
          if (res.success && res.email) setResetEmail(res.email);
        });
        window.history.replaceState({}, '', window.location.pathname);
      }
    } catch {
      /* ignore */
    }
  }, []);

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

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!forgotEmail.includes('@')) {
      setErrorMessage('กรุณากรอกอีเมลที่ใช้สมัครสมาชิก');
      return;
    }
    setIsLoading(true);
    try {
      const res = await requestResetOtp(forgotEmail);
      if (res.success) {
        setResetCode('');
        setResetEmail('');
        setOtpCode('');
        if (res.mode === 'otp') {
          setResetRequestId(res.requestId || '');
          setForgotStep('otp');
        } else {
          setResetRequestId('');
          setForgotStep('code');
        }
      } else {
        setErrorMessage(res.message);
      }
    } catch (err) {
      setErrorMessage('เกิดข้อผิดพลาดในการส่งรหัสยืนยัน');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!otpCode || otpCode.length !== 6) {
      setErrorMessage('กรุณากรอกรหัส OTP 6 หลัก');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage('รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('รหัสผ่านไม่ตรงกัน กรุณาลองอีกครั้ง');
      return;
    }
    setIsLoading(true);
    try {
      const res = await verifyResetOtp(resetRequestId, otpCode, newPassword);
      if (res.success) {
        setNewPassword('');
        setConfirmPassword('');
        setOtpCode('');
        setForgotStep('success');
      } else {
        setErrorMessage(res.message);
      }
    } catch (err) {
      setErrorMessage('เกิดข้อผิดพลาดในการตั้งรหัสผ่านใหม่');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!resetCode) {
      setErrorMessage('กรุณากรอกรหัสยืนยันจากอีเมล');
      return;
    }
    setIsLoading(true);
    try {
      const res = await verifyResetCode(resetCode);
      if (res.success) {
        setResetEmail(res.email || forgotEmail);
        setForgotStep('reset');
      } else {
        setErrorMessage(res.message);
      }
    } catch (err) {
      setErrorMessage('เกิดข้อผิดพลาดในการตรวจสอบรหัสยืนยัน');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (newPassword.length < 6) {
      setErrorMessage('รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('รหัสผ่านไม่ตรงกัน กรุณาลองอีกครั้ง');
      return;
    }
    setIsLoading(true);
    try {
      const res = await confirmResetPassword(resetCode, newPassword);
      if (res.success) {
        setNewPassword('');
        setConfirmPassword('');
        setForgotStep('success');
      } else {
        setErrorMessage(res.message);
      }
    } catch (err) {
      setErrorMessage('เกิดข้อผิดพลาดในการตั้งรหัสผ่านใหม่');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Demo Accounts removed — real Firebase authentication is required.

  return (
    <div 
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/70 backdrop-blur-md overflow-y-auto"
    >
      <motion.div
        id="auth-modal-container"
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden my-8"
      >
        {/* Header Bar */}
        <div className="relative bg-gradient-to-r from-white via-indigo-950 to-slate-50 text-white p-6 sm:p-7">
          <button
            id="btn-close-auth-modal"
            onClick={closeAuthModal}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-50/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-300">
                AI Insurance Network OS
              </span>
              <h2 className="text-xl font-extrabold text-slate-900">
                {authModalTab === 'login' && 'เข้าสู่ระบบ (Sign In)'}
                {authModalTab === 'register' && 'สร้างบัญชีตัวแทน (Register)'}
                {authModalTab === 'forgot' && 'รีเซ็ตรหัสผ่าน (Reset Password)'}
              </h2>
            </div>
          </div>

          {/* Tab navigation */}
          <div className="flex items-center gap-2 mt-5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60">
            <button
              id="tab-btn-login"
              onClick={() => {
                setErrorMessage('');
                openAuthModal('login');
              }}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                authModalTab === 'login'
                  ? 'bg-indigo-600 text-slate-900 shadow-sm'
                  : 'text-slate-700 hover:text-slate-900'
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
                  ? 'bg-indigo-600 text-slate-900 shadow-sm'
                  : 'text-slate-700 hover:text-slate-900'
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
                <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider text-center">
                  เลือกช่องทางเข้าสู่ระบบที่ต้องการ
                </p>

                <div className="grid grid-cols-1 gap-2.5">
                  {/* Google — ลำดับแรก */}
                  <button
                    id="btn-login-google"
                    type="button"
                    onClick={() => openOAuthPopup('google')}
                    className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 bg-white hover:bg-slate-50/80 text-slate-700 font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <GoogleIcon className="w-4 h-4" />
                    <span>Google</span>
                  </button>
                  {/* TikTok — ลำดับต่อจาก Google */}
                  <button
                    id="btn-login-tiktok"
                    type="button"
                    onClick={() => openOAuthPopup('tiktok')}
                    className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-zinc-900 text-white font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <TikTokIcon className="w-4 h-4 text-slate-900" />
                    <span>TikTok</span>
                  </button>
                  {/* Facebook — ลำดับต่อจาก TikTok */}
                  <button
                    id="btn-login-facebook"
                    type="button"
                    onClick={() => openOAuthPopup('facebook')}
                    className="w-full py-2.5 px-3.5 rounded-xl border border-[#1877F2] bg-[#1877F2] hover:bg-[#166fe5] text-slate-900 font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FacebookIcon className="w-4 h-4" />
                    <span>Facebook</span>
                  </button>
                  {/* GitHub — ลำดับต่อจาก Facebook */}
                  <button
                    id="btn-login-github"
                    type="button"
                    onClick={() => openOAuthPopup('github')}
                    className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-white font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <GithubIcon className="w-4 h-4 text-slate-900" />
                    <span>GitHub</span>
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[11px] font-medium text-slate-700 uppercase tracking-wider">
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
                    <Mail className="w-4 h-4 text-slate-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
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
                    <Lock className="w-4 h-4 text-slate-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
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
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-700 hover:text-slate-700"
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
                    <span className="text-xs text-slate-700">จดจำการเข้าสู่ระบบ</span>
                  </label>
                </div>

                <button
                  id="btn-submit-email-login"
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-slate-900 font-bold text-xs transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
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
                  <User className="w-4 h-4 text-slate-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
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
                  <Mail className="w-4 h-4 text-slate-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
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
                  <Lock className="w-4 h-4 text-slate-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
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
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-700 hover:text-slate-700"
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
                    <Phone className="w-4 h-4 text-slate-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
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
                    placeholder="รหัสผู้แนะนำ (ถ้ามี)"
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
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-slate-900 font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
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

          {/* TAB 3: FORGOT PASSWORD (email -> code -> new password -> success) */}
          {authModalTab === 'forgot' && (
            <div className="space-y-5">
              {/* STEP 1: request email */}
              {forgotStep === 'request' && (
                <form onSubmit={handleSendResetEmail} className="space-y-4">
                  <div className="text-center p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                    <KeyRound className="w-8 h-8 text-indigo-600 mx-auto mb-1.5" />
                    <h4 className="text-sm font-bold text-slate-800">รีเซ็ตรหัสผ่าน</h4>
                    <p className="text-xs text-slate-700 mt-0.5">ระบบจะส่งรหัสยืนยันไปยังอีเมลของคุณ</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      อีเมลที่ลงทะเบียนไว้
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="input-forgot-email"
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={e => setForgotEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 text-xs text-slate-800 outline-none"
                      />
                    </div>
                  </div>

                  <button
                    id="btn-send-reset-email"
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-slate-900 font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                        <span>กำลังส่งรหัสยืนยัน...</span>
                      </>
                    ) : (
                      <>
                        <span>ส่งรหัสยืนยันทางอีเมล</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* STEP 1.5: enter OTP code + new password */}
              {forgotStep === 'otp' && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="text-center p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                    <CheckCircle2 className="w-8 h-8 text-indigo-600 mx-auto mb-1.5" />
                    <h4 className="text-sm font-bold text-slate-800">ส่งรหัส OTP แล้ว</h4>
                    <p className="text-xs text-slate-700 mt-0.5">
                      กรอก <b className="text-slate-700">รหัส 6 หลัก</b> ที่ส่งไปยัง <b className="text-slate-700">{forgotEmail}</b>
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">รหัส OTP (6 หลัก)</label>
                    <input
                      id="input-otp-code"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      className="w-full px-3.5 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 text-center text-xl tracking-[0.5em] font-bold text-slate-800 outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">รหัสผ่านใหม่</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="input-otp-new-password"
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="อย่างน้อย 6 ตัวอักษร"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 text-xs text-slate-800 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-700 hover:text-slate-700 cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">ยืนยันรหัสผ่านใหม่</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="input-otp-confirm-password"
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="พิมพ์รหัสผ่านซ้ำอีกครั้ง"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 text-xs text-slate-800 outline-none"
                      />
                    </div>
                  </div>

                  <button
                    id="btn-verify-otp"
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-slate-900 font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                        <span>กำลังตรวจสอบรหัส...</span>
                      </>
                    ) : (
                      <span>ยืนยันและตั้งรหัสผ่านใหม่</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setErrorMessage(''); setOtpCode(''); setForgotStep('request'); }}
                    className="w-full text-center text-xs text-indigo-600 hover:text-indigo-700 font-semibold py-1 cursor-pointer"
                  >
                    ขอรหัสใหม่ / เปลี่ยนอีเมล
                  </button>
                </form>
              )}

              {/* STEP 2: enter code */}
              {forgotStep === 'code' && (
                <form onSubmit={handleVerifyCode} className="space-y-4">
                  <div className="text-center p-3 bg-amber-50/60 rounded-2xl border border-amber-100">
                    <CheckCircle2 className="w-8 h-8 text-amber-600 mx-auto mb-1.5" />
                    <h4 className="text-sm font-bold text-slate-800">ส่งอีเมลรีเซ็ตรหัสผ่านแล้ว</h4>
                    <p className="text-xs text-slate-700 mt-0.5">
                      เปิดอีเมล <b className="text-slate-700">{forgotEmail}</b> แล้วคลิกลิงก์{" "}
                      <b className="text-slate-700">Reset Password</b> เพื่อตั้งรหัสผ่านใหม่
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      ตั้งรหัสใหม่ในแอปนี้ (วางรหัสจากลิงก์)
                    </label>
                    <input
                      id="input-reset-code"
                      value={resetCode}
                      onChange={e => setResetCode(e.target.value.trim())}
                      placeholder="วางรหัสยืนยัน (oobCode) จากลิงก์ในอีเมล"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 text-xs text-slate-800 outline-none font-mono"
                    />
                    <p className="text-[11px] text-slate-700 mt-1.5">
                      ไม่สะดวกคลิกลิงก์? วางรหัสยืนยันจากลิงก์ในอีเมลตรงนี้ แล้วกดยืนยันรหัส
                    </p>
                  </div>

                  <button
                    id="btn-verify-reset-code"
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-slate-900 font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                        <span>กำลังตรวจสอบรหัส...</span>
                      </>
                    ) : (
                      <span>ยืนยันรหัส</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setErrorMessage(''); setForgotStep('request'); }}
                    className="w-full text-center text-xs text-indigo-600 hover:text-indigo-700 font-semibold py-1 cursor-pointer"
                  >
                    ส่งรหัสใหม่ / เปลี่ยนอีเมล
                  </button>
                </form>
              )}

              {/* STEP 3: set new password */}
              {forgotStep === 'reset' && (
                <form onSubmit={handleConfirmReset} className="space-y-4">
                  <div className="text-center p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                    <Lock className="w-8 h-8 text-emerald-600 mx-auto mb-1.5" />
                    <h4 className="text-sm font-bold text-slate-800">ตั้งรหัสผ่านใหม่</h4>
                    <p className="text-xs text-slate-700 mt-0.5">
                      {resetEmail ? <>สำหรับบัญชี <b className="text-slate-700">{resetEmail}</b></> : 'รหัสยืนยันถูกต้องแล้ว'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">รหัสผ่านใหม่</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="input-new-password"
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="อย่างน้อย 6 ตัวอักษร"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 text-xs text-slate-800 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-700 hover:text-slate-700 cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">ยืนยันรหัสผ่านใหม่</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="input-confirm-password"
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="พิมพ์รหัสผ่านซ้ำอีกครั้ง"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 text-xs text-slate-800 outline-none"
                      />
                    </div>
                  </div>

                  <button
                    id="btn-confirm-reset-password"
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-slate-900 font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                        <span>กำลังตั้งรหัสผ่านใหม่...</span>
                      </>
                    ) : (
                      <span>ยืนยันตั้งรหัสผ่านใหม่</span>
                    )}
                  </button>
                </form>
              )}

              {/* STEP 4: success */}
              {forgotStep === 'success' && (
                <div className="text-center py-6 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">ตั้งรหัสผ่านใหม่เรียบร้อยแล้ว</h3>
                  <p className="text-xs text-slate-700">คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้ทันที</p>
                  <button
                    id="btn-back-to-login"
                    type="button"
                    onClick={() => {
                      setForgotStep('request');
                      openAuthModal('login');
                    }}
                    className="py-2.5 px-6 rounded-xl bg-indigo-600 text-slate-900 font-semibold text-xs hover:bg-indigo-700 cursor-pointer"
                  >
                    กลับไปหน้าเข้าสู่ระบบ
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Footer Security Badge removed */}
        </div>
      </motion.div>
    </div>
  );
};
