import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Globe, 
  UserPlus
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GoogleIcon, TikTokIcon, FacebookIcon, GithubIcon } from './SocialOAuthPopup';

interface WelcomeLoginGatewayProps {
  onEnterSystem?: () => void;
}

export const WelcomeLoginGateway: React.FC<WelcomeLoginGatewayProps> = ({ onEnterSystem }) => {
  const { 
    loginWithEmail, 
    openOAuthPopup, 
    openAuthModal, 
    language, 
    toggleLanguage,
    t 
  } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email.includes('@')) {
      setErrorMessage(language === 'th' ? 'กรุณากรอกรูปแบบอีเมลให้ถูกต้อง' : 'Please enter a valid email address');
      return;
    }
    if (password.length < 4) {
      setErrorMessage(language === 'th' ? 'รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร' : 'Password must be at least 4 characters');
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginWithEmail({
        email,
        password,
        rememberMe,
      });
      if (res.success && onEnterSystem) {
        onEnterSystem();
      } else if (!res.success) {
        setErrorMessage(res.message);
      }
    } catch {
      setErrorMessage('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: 'google' | 'tiktok' | 'facebook') => {
    openOAuthPopup(provider);
  };

  return (
    <div id="welcome-login-gateway-screen" className="min-h-screen bg-[#f0f9ff] text-slate-900 flex flex-col justify-between selection:bg-blue-600 selection:text-slate-950 relative overflow-x-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-pink-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center shadow-sm shadow-amber-500/20 text-slate-950 font-black text-xl shrink-0">
            OS
          </div>
          <div>
            <div className="text-[10px] font-bold text-blue-600 tracking-wider uppercase">
              {t('login_freedom')}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg">
                AI INSURANCE <span className="text-blue-600">NETWORK OS</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-600/10 text-blue-600 border border-blue-600/30 hidden sm:inline">
                องค์กร Enterprise 2026
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <button
            id="btn-gateway-lang"
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f0f9ff]/90 hover:bg-[#e0f2fe] text-blue-600 border border-sky-100/60 text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span>{language === 'th' ? '🇹🇭 ภาษาไทย' : '🇬🇧 English'}</span>
          </button>

          {/* Quick Direct Enter Button — removed per request */}

        </div>
      </header>

      {/* Main Gateway Content Area */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center flex-1 relative z-10">
        
        {/* Left Column: Visual Hero Banner & System Highlights (7 Cols on desktop) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Headline & Badge */}
          <div className="space-y-3">
            <h1 className="text-left">
              <span className="block text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent">
                {t('login_headline_1')}
              </span>
              <span className="mt-4 block max-w-2xl text-base sm:text-lg lg:text-xl font-medium leading-relaxed text-slate-800">
                {t('login_headline_2')}
              </span>
            </h1>
          </div>

          {/* Hero image removed — replaced with headline text (per request). */}

          {/* Quick Demo Access Bar removed — real authentication is required. */}
        </div>

        {/* Right Column: Multi-OAuth & Email Login Gateway Card (5 Cols on desktop) */}
        <div className="lg:col-span-5">
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="p-6 sm:p-8 rounded-3xl bg-[#f0f9ff] border border-sky-100/60 shadow-2xl space-y-6 relative overflow-hidden backdrop-blur-xl"
          >
            {/* Top Card Branding */}
            <div className="space-y-1 text-center">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">{t('login_title')}</h2>
            </div>

            {/* Error Notification */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <span>⚠️ {errorMessage}</span>
              </div>
            )}

            {/* Create Account Heading */}
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">{t('login_create_account')}</h3>
            </div>

            {/* Social OAuth Providers - Vertical stack */}
            <div className="space-y-2.5">
              {/* Google Button */}
              <button
                id="btn-gateway-login-google"
                onClick={() => handleSocialLogin('google')}
                type="button"
                className="w-full py-2.5 px-4 rounded-xl bg-[#f0f9ff] hover:bg-[#e0f2fe] text-slate-900 font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-3 border border-sky-100/60 cursor-pointer active:scale-[0.99]"
              >
                <GoogleIcon className="w-4 h-4" />
                <span>{t('login_with_google')}</span>
              </button>

              {/* TikTok Button — ลำดับต่อจาก Google */}
              <button
                id="btn-gateway-login-tiktok"
                onClick={() => handleSocialLogin('tiktok')}
                type="button"
                className="w-full py-2.5 px-4 rounded-xl bg-[#f0f9ff] hover:bg-zinc-900 text-slate-900 font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-3 border border-zinc-800 cursor-pointer active:scale-[0.99]"
              >
                <TikTokIcon className="w-4 h-4 text-slate-900" />
                <span>{t('login_with_tiktok') || 'ดำเนินการต่อด้วย TikTok'}</span>
              </button>

              {/* Facebook Button — ลำดับต่อจาก TikTok */}
              <button
                id="btn-gateway-login-facebook"
                onClick={() => handleSocialLogin('facebook')}
                type="button"
                className="w-full py-2.5 px-4 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-slate-900 font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-3 border border-[#1877F2] cursor-pointer active:scale-[0.99]"
              >
                <FacebookIcon className="w-4 h-4" />
                <span>{t('login_with_facebook') || 'ดำเนินการต่อด้วย Facebook'}</span>
              </button>

              {/* GitHub Button — ลำดับต่อจาก Facebook */}
              <button
                id="btn-gateway-login-github"
                onClick={() => handleSocialLogin('github')}
                type="button"
                className="w-full py-2.5 px-4 rounded-xl bg-[#f0f9ff] hover:bg-[#f0f9ff] text-slate-900 font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-3 border border-sky-100/60 cursor-pointer active:scale-[0.99]"
              >
                <GithubIcon className="w-4 h-4 text-slate-900" />
                <span>{t('login_with_github') || 'ดำเนินการต่อด้วย GitHub'}</span>
              </button>

            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-sky-100/60 w-full" />
              <span className="bg-[#f0f9ff] px-3 text-[11px] font-semibold text-slate-800 uppercase tracking-wider relative">
                {t('login_or_email')}
              </span>
            </div>

            {/* 2. Email & Password Form */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800 block">
                  {t('login_email_label')}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-800 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="gateway-input-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-[#f0f9ff] border border-sky-100/60 focus:border-blue-600 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-800">
                    {t('login_password_label')}
                  </label>
                  <button
                    type="button"
                    onClick={() => openAuthModal('forgot')}
                    className="text-[11px] font-medium text-blue-600 hover:text-blue-600 cursor-pointer"
                  >
                    {t('login_forgot')}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-800 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="gateway-input-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#f0f9ff] border border-sky-100/60 focus:border-blue-600 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-800 hover:text-slate-800 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-sky-100/60 bg-[#f0f9ff] text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                  />
                  <span>{t('login_remember')}</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                id="btn-gateway-submit-email"
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-sky-1000 to-indigo-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs shadow-sm shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-50"
              >
                {isLoading ? (
                  <span>กำลังตรวจสอบข้อมูล...</span>
                ) : (
                  <>
                    <span>{t('login_submit')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Register Prompt */}
            <div className="pt-4 border-t border-sky-100/60 text-center space-y-2">
              <p className="text-xs text-slate-800">
                {t('login_register_prompt')}
              </p>
              <button
                id="btn-gateway-open-register"
                onClick={() => openAuthModal('register')}
                className="text-xs font-bold text-blue-600 hover:text-blue-600 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{t('login_register')}</span>
              </button>
            </div>
          </motion.div>
        </div>

      </main>

      {/* Footer — copyright only (i18n) */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 border-t border-sky-100/60 text-center text-xs text-slate-800 relative z-10">
        {t('login_copyright')}
      </footer>
    </div>
  );
};
