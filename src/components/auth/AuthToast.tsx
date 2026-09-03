import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AuthToast: React.FC = () => {
  const { authNotification, setAuthNotification } = useApp();

  useEffect(() => {
    if (authNotification) {
      const timer = setTimeout(() => {
        setAuthNotification(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [authNotification, setAuthNotification]);

  if (!authNotification) return null;

  return (
    <div 
      id="auth-toast-container"
      className="fixed bottom-6 right-6 z-50 max-w-sm pointer-events-auto"
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className={`p-4 rounded-2xl shadow-xl border flex items-start gap-3 backdrop-blur-md ${
          authNotification.type === 'success'
            ? 'bg-sky-50/95 text-white border-emerald-500/40'
            : authNotification.type === 'error'
            ? 'bg-rose-950/95 text-slate-900 border-rose-500/40'
            : 'bg-sky-50/95 text-white border-indigo-500/40'
        }`}
      >
        {authNotification.type === 'success' && (
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        )}
        {authNotification.type === 'error' && (
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
        )}
        {authNotification.type === 'info' && (
          <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        )}

        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold leading-relaxed">
            {authNotification.message}
          </p>
        </div>

        <button
          id="btn-close-toast"
          onClick={() => setAuthNotification(null)}
          className="p-1 rounded-lg text-slate-700 hover:text-slate-900 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
};
