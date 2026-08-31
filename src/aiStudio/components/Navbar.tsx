import React from 'react';
import {
  LayoutDashboard,
  Network,
  Calculator,
  Target,
  Settings,
  CheckCircle2,
  Moon,
  Sun,
  UserPlus,
  TrendingUp,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { POSITIONS_LIST } from '../rules/defaultRules';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    members,
    selectedMemberId,
    setSelectedMemberId,
    selectedMember,
    theme,
    toggleTheme,
    userRole,
    setUserRole,
    setIsAddMemberModalOpen,
  } = useApp();

  const posColor = POSITIONS_LIST.find(p => p.id === selectedMember?.position)?.accentColor || '#3B82F6';

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur border-b border-slate-800 text-slate-100 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-amber-500 flex items-center justify-center shadow-md shadow-blue-500/20 ring-1 ring-white/20">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-amber-300 bg-clip-text text-transparent">
                  AI Insurance Simulator
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold tracking-wide rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                ระบบจำลองโครงสร้างทีม เป้าหมายตำแหน่ง และรายได้ตัวแทน
              </p>
            </div>
          </div>

          {/* Member Quick Switcher */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-800/80 rounded-lg px-3 py-1.5 border border-slate-700">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>กำลังดู:</span>
            </div>
            <select
              value={selectedMemberId}
              onChange={e => setSelectedMemberId(e.target.value)}
              className="bg-transparent text-xs font-medium text-slate-200 focus:outline-none cursor-pointer max-w-[220px] truncate"
            >
              {members.map(m => (
                <option key={m.id} value={m.id} className="bg-slate-900 text-slate-200">
                  [{m.code}] {m.name} ({m.position === 'GROUP_MANAGER' ? 'ภาค' : m.position === 'CENTER_MANAGER' ? 'ศูนย์' : m.position === 'UNIT_MANAGER' ? 'หน่วย' : 'ตัวแทน'})
                </option>
              ))}
            </select>
          </div>

          {/* Right Actions & Utilities */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Quick Add Member button */}
            <button
              onClick={() => setIsAddMemberModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">เพิ่มสมาชิก</span>
            </button>

            {/* Role Switcher */}
            <div className="hidden md:flex items-center gap-1 bg-slate-800/60 rounded-lg p-1 border border-slate-700/60">
              <select
                value={userRole}
                onChange={e => setUserRole(e.target.value as any)}
                className="bg-transparent text-[11px] font-semibold text-slate-300 focus:outline-none cursor-pointer px-1.5"
                title="สลับมุมมองสิทธิ์ผู้ใช้งาน"
              >
                <option value="ADMIN" className="bg-slate-900">👑 สิทธิ์: ผู้ดูแล (Admin)</option>
                <option value="GROUP_MANAGER" className="bg-slate-900">🏢 สิทธิ์: ผู้บริหารภาค</option>
                <option value="CENTER_MANAGER" className="bg-slate-900">🏬 สิทธิ์: ผู้บริหารศูนย์</option>
                <option value="UNIT_MANAGER" className="bg-slate-900">🏠 สิทธิ์: ผู้บริหารหน่วย</option>
                <option value="AGENT" className="bg-slate-900">👤 สิทธิ์: ตัวแทนทั่วไป</option>
              </select>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="สลับโหมดมืด/สว่าง"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-300" />}
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2.5 scrollbar-none border-t border-slate-800/80">
          
          <button
            onClick={() => setActiveTab('DASHBOARD')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'DASHBOARD'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>แดชบอร์ดภาพรวม</span>
          </button>

          <button
            onClick={() => setActiveTab('TREE')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'TREE'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Network className="w-4 h-4" />
            <span>ผังองค์กรต้นไม้</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {members.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('CALCULATOR')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'CALCULATOR'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>เครื่องคำนวณรายได้</span>
          </button>

          <button
            onClick={() => setActiveTab('GOAL')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'GOAL'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>จำลองเป้าหมาย</span>
          </button>

          <button
            onClick={() => setActiveTab('ADMIN')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'ADMIN'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>ตั้งค่ากติกา Admin</span>
          </button>

          <button
            onClick={() => setActiveTab('UNIT_TESTS')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'UNIT_TESTS'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>ทดสอบสูตร (Unit Tests)</span>
          </button>

        </nav>
      </div>
    </header>
  );
};
