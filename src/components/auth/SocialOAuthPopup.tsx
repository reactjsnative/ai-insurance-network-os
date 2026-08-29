import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shield, CheckCircle2, Lock, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AuthProvider } from '../../types';

// Authentic Social Logos
export const GoogleIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.35 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27A7.06 7.06 0 0 1 4.9 12c0-.79.14-1.57.38-2.27V6.58H1.24A11.96 11.96 0 0 0 0 12c0 1.92.45 3.74 1.24 5.42l4.04-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

export const TikTokIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.47 6.3 6.3 0 0 0 1.87-4.47V8.71a8.27 8.27 0 0 0 4.9 1.58V6.84c-.33-.03-.67-.08-1-.15z" />
  </svg>
);

export const FacebookIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

export const SocialOAuthPopup: React.FC = () => {
  const { authOAuthProvider, closeOAuthPopup, loginWithSocial } = useApp();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!authOAuthProvider) return null;

  // Real Google OAuth: trigger Firebase signInWithPopup directly (no fake account chooser).
  const handleConfirmGoogle = async () => {
    setIsProcessing(true);
    try {
      await loginWithSocial('google');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmTikTok = async () => {
    setIsProcessing(true);
    setTimeout(async () => {
      await loginWithSocial('tiktok', {
        email: 'akarapol.tiktok@insurance-os.com',
        name: 'ดร. อัครพล สุวรรณภูมิ (@akarapol_leader)',
        tiktokHandle: '@akarapol_insurance_os',
        avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
      });
      setIsProcessing(false);
    }, 1200);
  };

  const handleConfirmFacebook = async () => {
    setIsProcessing(true);
    setTimeout(async () => {
      await loginWithSocial('facebook', {
        email: 'akarapol.fb@meta-insurance.com',
        name: 'ดร. อัครพล สุวรรณภูมิ (Facebook Lead)',
        facebookId: 'akarapol.insurance.network',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      });
      setIsProcessing(false);
    }, 1000);
  };

  return (
    <div 
      id="social-oauth-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md"
    >
      <motion.div
        id="social-oauth-window"
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* GOOGLE OAUTH POPUP */}
        {authOAuthProvider === 'google' && (
          <div className="p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <GoogleIcon className="w-6 h-6" />
                <span className="text-sm font-semibold text-slate-800 tracking-tight">Sign in with Google</span>
              </div>
              <button
                id="btn-close-oauth-google"
                onClick={closeOAuthPopup}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-5 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 mb-3">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Choose an account</h3>
              <p className="text-xs text-slate-500 mt-1">to continue to <span className="font-semibold text-indigo-600">AI Insurance Network OS</span></p>
            </div>

            {/* Google OAuth — real Firebase sign-in */}
            <div className="mb-5">
              <button
                id="btn-confirm-google-auth"
                disabled={isProcessing}
                onClick={handleConfirmGoogle}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>กำลังเชื่อมต่อ Google...</span>
                  </>
                ) : (
                  <>
                    <GoogleIcon className="w-4 h-4" />
                    <span>ดำเนินการต่อด้วย Google</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs text-slate-500 flex items-start gap-2">
              <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>To continue, Google will share your name, email address, language preference, and profile picture with AI Insurance Network OS.</span>
            </div>
          </div>
        )}

        {/* TIKTOK OAUTH POPUP */}
        {authOAuthProvider === 'tiktok' && (
          <div className="p-6 bg-slate-950 text-white">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center text-white">
                  <TikTokIcon className="w-4 h-4 text-cyan-400" />
                </div>
                <span className="text-sm font-semibold tracking-tight">TikTok Authorization</span>
              </div>
              <button
                id="btn-close-oauth-tiktok"
                onClick={closeOAuthPopup}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-5 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-cyan-400 text-white p-0.5 mb-3 shadow-lg shadow-pink-500/20">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                  <TikTokIcon className="w-7 h-7 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-white">Authorize AI Insurance Network OS</h3>
              <p className="text-xs text-slate-400 mt-1">Sync your TikTok Agent Profile & Team Network</p>
            </div>

            <div className="space-y-3 bg-slate-900 p-4 rounded-xl border border-slate-800 mb-5">
              <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Requested Permissions:</p>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Read your public profile (Username, Avatar, Display name)</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Link recruitment inquiries to Insurance Agent ID</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                id="btn-confirm-tiktok-auth"
                disabled={isProcessing}
                onClick={handleConfirmTikTok}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-pink-500 hover:from-cyan-300 hover:to-pink-400 text-slate-950 font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Authorizing TikTok Account...</span>
                  </>
                ) : (
                  <>
                    <TikTokIcon className="w-4 h-4 text-slate-950" />
                    <span>Authorize & Log In</span>
                  </>
                )}
              </button>

              <button
                id="btn-cancel-tiktok-auth"
                disabled={isProcessing}
                onClick={closeOAuthPopup}
                className="w-full py-2.5 px-4 rounded-xl text-slate-400 hover:text-white text-xs transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* FACEBOOK OAUTH POPUP */}
        {authOAuthProvider === 'facebook' && (
          <div className="p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <FacebookIcon className="w-6 h-6" />
                <span className="text-sm font-semibold text-[#1877F2] tracking-tight">Log in with Facebook</span>
              </div>
              <button
                id="btn-close-oauth-facebook"
                onClick={closeOAuthPopup}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-5 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1877F2]/10 text-[#1877F2] mb-3">
                <FacebookIcon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Log in with Meta Facebook</h3>
              <p className="text-xs text-slate-500 mt-1">AI Insurance Network OS is requesting access to:</p>
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-5">
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-[#1877F2] shrink-0" />
                <span>Your name and profile picture</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-[#1877F2] shrink-0" />
                <span>Email address associated with Meta</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-[#1877F2] shrink-0" />
                <span>Facebook Agent Fanpage lead integration</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                id="btn-confirm-facebook-auth"
                disabled={isProcessing}
                onClick={handleConfirmFacebook}
                className="w-full py-3 px-4 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Connecting Facebook OAuth...</span>
                  </>
                ) : (
                  <>
                    <span>Continue as Dr. Akarapol</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                id="btn-cancel-facebook-auth"
                disabled={isProcessing}
                onClick={closeOAuthPopup}
                className="w-full py-2.5 px-4 rounded-xl text-slate-500 hover:text-slate-800 text-xs transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

      </motion.div>
    </div>
  );
};
