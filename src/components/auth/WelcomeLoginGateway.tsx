import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Shield, 
  Mail, 
  Lock, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  KeyRound, 
  Eye, 
  EyeOff, 
  Users, 
  TrendingUp, 
  Cpu, 
  Globe, 
  Award,
  ChevronRight,
  UserPlus,
  Play
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GoogleIcon, TikTokIcon, FacebookIcon, GitHubIcon, GitLabIcon, BitbucketIcon } from './SocialOAuthPopup';
import heroImage from '../../assets/images/login_hero_custom_2026.png';

interface WelcomeLoginGatewayProps {
  onEnterSystem?: () => void;
}

export const WelcomeLoginGateway: React.FC<WelcomeLoginGatewayProps> = ({ onEnterSystem }) => {
  const { 
    loginWithEmail, 
    openOAuthPopup, 
    openAuthModal, 
    switchActiveUser, 
    members, 
    language, 
    toggleLanguage,
    t 
  } = useApp();

  const [email, setEmail] = useState('akarapol.pro798@gmail.com');
  const [password, setPassword] = useState('123456');
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

  const handleSocialLogin = (provider: 'google' | 'tiktok' | 'facebook' | 'github' | 'gitlab' | 'bitbucket') => {
    openOAuthPopup(provider);
  };

  const handleQuickDemoLogin = (memberId: string) => {
    switchActiveUser(memberId);
    if (onEnterSystem) {
      onEnterSystem();
    }
  };

  const quickRoles = [
    {
      id: 'MEM-001',
      title: 'ผู้บริหารภาค (RM)',
      roleEn: 'Regional Manager',
      name: 'ดร. ภาณุพงศ์ วงศ์สวรรค์',
      code: 'RM-001',
      color: 'from-amber-500 to-amber-600',
      badge: 'Tier 1 Executive'
    },
    {
      id: 'MEM-002',
      title: 'ผู้จัดการศูนย์ (CM)',
      roleEn: 'Center Manager',
      name: 'คุณ สุชาดา รัตนวิชัย',
      code: 'CM-101',
      color: 'from-indigo-500 to-indigo-600',
      badge: 'Hub Leader'
    },
    {
      id: 'MEM-003',
      title: 'ผู้จัดการหน่วย (UM)',
      roleEn: 'Unit Manager',
      name: 'คุณ กานต์พิชชา ศรีสุข',
      code: 'UM-201',
      color: 'from-emerald-500 to-emerald-600',
      badge: 'Team Builder'
    },
    {
      id: 'MEM-006',
      title: 'ตัวแทนมืออาชีพ (AG)',
      roleEn: 'Senior Agent',
      name: 'คุณ ณัฐนนท์ พัฒนศิลป์',
      code: 'AG-301',
      color: 'from-sky-500 to-sky-600',
      badge: 'Top Producer'
    }
  ];

  return (
    <div id="welcome-login-gateway-screen" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950 relative overflow-x-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-pink-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black text-xl shrink-0">
            OS
          </div>
          <div>
            <div className="text-[10px] font-bold text-amber-300 tracking-wider uppercase">
              {t('login_freedom')}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-100 tracking-tight text-base sm:text-lg">
                AI INSURANCE <span className="text-amber-400">NETWORK OS</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 hidden sm:inline">
                Enterprise 2026
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">ระบบปฏิบัติการบริหารเครือข่าย & คำนวณคอมมิชชั่นอัจฉริยะ</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <button
            id="btn-gateway-lang"
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-amber-300 border border-slate-800 text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-semibold text-amber-300 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>ระบบเข้าสู่ระบบความปลอดภัยสูง 4 ช่องทาง (Multi-OAuth Protected)</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
              {t('login_headline_1')} <br />
              <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent">
                {t('login_headline_2')}
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              เชื่อมต่อบัญชีของคุณด้วย <strong>Email, Google, TikTok, หรือ Facebook</strong> เพื่อเข้าถึงแดชบอร์ดโครงสร้างเครือข่าย คำนวณคอมมิชชั่นแบบเรียลไทม์ 4 ระดับ และวางแผนการเลื่อนตำแหน่งอัตโนมัติ
            </p>
          </div>

          {/* High-Tech Generated Hero Visual Card */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative rounded-3xl overflow-hidden border border-slate-800/80 shadow-2xl bg-slate-900 group"
          >
            {/* Image Artwork */}
            <div className="relative aspect-[4/5] sm:aspect-[4/3] w-full overflow-hidden bg-slate-950 flex items-center justify-center">
              <img
                src={heroImage}
                alt="AI Insurance Network OS"
                className="w-full h-full object-contain object-center group-hover:scale-[1.02] transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              {/* Floating Live System Stats Overlay — MOVED to Dashboard (shows after login) */}
              {/*
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-slate-700/60 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>AI Engine 2026 Active</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    <div className="text-[11px] text-slate-400">4-Tier Auto Commission Calculation</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>256-bit SSL</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-amber-400" />
                    <span>ISO 27001</span>
                  </div>
                </div>
              </div>
              */}
            </div>
          </motion.div>

          {/* Quick Demo Access Bar — hidden on first page (kept in background, re-enable by removing 'hidden') */}
          <div className="hidden p-3 rounded-2xl bg-slate-900/20 border border-slate-800/40 space-y-2 opacity-60 hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
                <KeyRound className="w-3 h-3 text-slate-500" />
                {t('login_quick_demo')}
              </span>
              <span className="text-[9px] text-slate-600">1-Click Bypass</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {quickRoles.map(role => (
                <button
                  key={role.id}
                  id={`btn-gateway-quick-${role.code}`}
                  onClick={() => handleQuickDemoLogin(role.id)}
                  className="p-2 rounded-xl bg-slate-950/40 hover:bg-slate-800 border border-slate-800/60 hover:border-slate-700 transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-medium text-slate-400 group-hover:text-amber-300">
                      {role.code}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800/60 text-slate-500">
                      Demo
                    </span>
                  </div>
                  <div className="text-[11px] font-medium text-slate-400 truncate">{role.title}</div>
                  <div className="text-[10px] text-slate-500 truncate">{role.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Multi-OAuth & Email Login Gateway Card (5 Cols on desktop) */}
        <div className="lg:col-span-5">
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6 relative overflow-hidden backdrop-blur-xl"
          >
            {/* Top Card Branding */}
            <div className="space-y-1 text-center">
              <h2 className="text-xl font-black text-white tracking-tight">{t('login_title')}</h2>
            </div>

            {/* Error Notification */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <span>⚠️ {errorMessage}</span>
              </div>
            )}

            {/* Create Account Heading */}
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white tracking-tight">{t('login_create_account')}</h3>
            </div>

            {/* Social OAuth Providers - Vertical stack */}
            <div className="space-y-2.5">
              {/* Google Button */}
              <button
                id="btn-gateway-login-google"
                onClick={() => handleSocialLogin('google')}
                type="button"
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-3 border border-slate-200 cursor-pointer active:scale-[0.99]"
              >
                <GoogleIcon className="w-4 h-4" />
                <span>{t('login_with_google')}</span>
              </button>

              {/* GitHub Button */}
              <button
                id="btn-gateway-login-github"
                onClick={() => handleSocialLogin('github')}
                type="button"
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-100 font-bold text-xs border border-slate-700/80 transition-all flex items-center justify-center gap-3 cursor-pointer active:scale-[0.99]"
              >
                <GitHubIcon className="w-4 h-4" />
                <span>{t('login_with_github')}</span>
              </button>

              {/* GitLab Button */}
              <button
                id="btn-gateway-login-gitlab"
                onClick={() => handleSocialLogin('gitlab')}
                type="button"
                className="w-full py-2.5 px-4 rounded-xl bg-[#FC6D27] hover:bg-[#e85a17] text-white font-bold text-xs border border-[#FC6D27]/60 transition-all flex items-center justify-center gap-3 cursor-pointer active:scale-[0.99]"
              >
                <GitLabIcon className="w-4 h-4" />
                <span>{t('login_with_gitlab')}</span>
              </button>

              {/* Bitbucket Button */}
              <button
                id="btn-gateway-login-bitbucket"
                onClick={() => handleSocialLogin('bitbucket')}
                type="button"
                className="w-full py-2.5 px-4 rounded-xl bg-[#0052CC] hover:bg-[#003d99] text-white font-bold text-xs border border-[#0052CC]/60 transition-all flex items-center justify-center gap-3 cursor-pointer active:scale-[0.99]"
              >
                <BitbucketIcon className="w-4 h-4" />
                <span>{t('login_with_bitbucket')}</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-slate-900 px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider relative">
                {t('login_or_email')}
              </span>
            </div>

            {/* 2. Email & Password Form */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  {t('login_email_label')}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="gateway-input-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    {t('login_password_label')}
                  </label>
                  <button
                    type="button"
                    onClick={() => openAuthModal('forgot')}
                    className="text-[11px] font-medium text-amber-400 hover:text-amber-300 cursor-pointer"
                  >
                    {t('login_forgot')}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="gateway-input-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500 w-3.5 h-3.5"
                  />
                  <span>{t('login_remember')}</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                id="btn-gateway-submit-email"
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-50"
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
            <div className="pt-4 border-t border-slate-800 text-center space-y-2">
              <p className="text-xs text-slate-400">
                {t('login_register_prompt')}
              </p>
              <button
                id="btn-gateway-open-register"
                onClick={() => openAuthModal('register')}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{t('login_register')}</span>
              </button>
            </div>
          </motion.div>
        </div>

      </main>

      {/* Footer — copyright only (i18n) */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 border-t border-slate-900 text-center text-xs text-slate-500 relative z-10">
        {t('login_copyright')}
      </footer>
    </div>
  );
};
