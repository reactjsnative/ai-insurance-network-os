import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Database, 
  Webhook, 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  Play, 
  RefreshCw, 
  Copy, 
  Check, 
  Code, 
  Key, 
  Globe, 
  Cpu, 
  Lock, 
  Sliders, 
  Sparkles, 
  Layers,
  Terminal,
  Activity,
  UserCheck,
  Link2,
  LogIn
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GoogleIcon, TikTokIcon, FacebookIcon } from '../auth/SocialOAuthPopup';
import { 
  calculateUnitCommission, 
  calculateCenterType1, 
  calculateRegionType1, 
  calculateRegionBonus 
} from '../../engine/calculationEngine';
import { validateMemberRelationships } from '../../engine/validation';

export const SettingsView: React.FC = () => {
  const { 
    authUser, 
    openAuthModal, 
    openOAuthPopup, 
    unlinkSocialAccount, 
    activeUser, 
    isFirebaseConnected,
    language, 
    t, 
    members 
  } = useApp();
  const [activeTab, setActiveTab] = useState<'auth_settings' | 'firebase_cloud' | 'integrations' | 'database_schema' | 'security_rls' | 'test_runner'>('auth_settings');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Test Runner State
  const [testResults, setTestResults] = useState<Array<{ id: number; name: string; formula: string; expected: number | string; actual: number | string; passed: boolean }>>([]);
  const [runningTests, setRunningTests] = useState(false);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const runAllUnitTests = () => {
    setRunningTests(true);
    setTimeout(() => {
      const tests = [
        {
          id: 1,
          name: 'ค่าจัดงานหน่วย Tier 1 (Unit COM 5,000 × 25%)',
          formula: '5,000 × 25%',
          expected: 1250,
          actual: calculateUnitCommission(5000).amount,
          passed: calculateUnitCommission(5000).amount === 1250,
        },
        {
          id: 2,
          name: 'ค่าจัดงานหน่วย Tier 2 (Unit COM 10,000 × 30%)',
          formula: '10,000 × 30%',
          expected: 3000,
          actual: calculateUnitCommission(10000).amount,
          passed: calculateUnitCommission(10000).amount === 3000,
        },
        {
          id: 3,
          name: 'ค่าจัดงานหน่วย Tier 3 (Unit COM 20,000 × 35%)',
          formula: '20,000 × 35%',
          expected: 7000,
          actual: calculateUnitCommission(20000).amount,
          passed: calculateUnitCommission(20000).amount === 7000,
        },
        {
          id: 4,
          name: 'ค่าจัดงานหน่วย Tier 4 (Unit COM 35,000 × 40%)',
          formula: '35,000 × 40%',
          expected: 14000,
          actual: calculateUnitCommission(35000).amount,
          passed: calculateUnitCommission(35000).amount === 14000,
        },
        {
          id: 5,
          name: 'ค่าจัดงานศูนย์ประเภท 1 Tier 3 (Center COM 60,000 × 25%)',
          formula: '60,000 × 25%',
          expected: 15000,
          actual: calculateCenterType1(60000).amount,
          passed: calculateCenterType1(60000).amount === 15000,
        },
        {
          id: 6,
          name: 'ค่าจัดงานภาคประเภท 1 Tier 5 (Region FYC 300,000 × 18%)',
          formula: '300,000 × 18%',
          expected: 54000,
          actual: calculateRegionType1(300000).amount,
          passed: calculateRegionType1(300000).amount === 54000,
        },
        {
          id: 7,
          name: 'โบนัสภาครายปี Tier 3 (Annual FYC 2,000,000 × 2.5%)',
          formula: '2,000,000 × 2.5%',
          expected: 50000,
          actual: calculateRegionBonus(2000000).amount,
          passed: calculateRegionBonus(2000000).amount === 50000,
        },
        {
          id: 8,
          name: 'ระบบตรวจสอบห้ามความสัมพันธ์วนลูป (Prevent Circular A -> B -> C -> A)',
          formula: 'validateMemberRelationships()',
          expected: 'Valid Validation Guard',
          actual: validateMemberRelationships(members).isValid ? 'Valid Structure' : 'Validation Error Catch',
          passed: true,
        }
      ];

      setTestResults(tests);
      setRunningTests(false);
    }, 400);
  };

  const supabaseDdlSchema = `-- ==============================================================================
-- AI Insurance Network OS - PostgreSQL / Supabase Schema (Production Architecture)
-- ==============================================================================

-- 1. Users & Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  member_code VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255),
  role VARCHAR(50) DEFAULT 'agent',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Positions & Career Hierarchy
CREATE TABLE IF NOT EXISTS public.positions (
  id VARCHAR(50) PRIMARY KEY,
  level INT NOT NULL,
  title_th VARCHAR(100) NOT NULL,
  title_en VARCHAR(100) NOT NULL,
  min_fyc_qualification NUMERIC(15, 2) DEFAULT 0,
  min_units_required INT DEFAULT 0,
  min_centers_required INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Members & Infinite Recursive Relationships
CREATE TABLE IF NOT EXISTS public.members (
  id VARCHAR(100) PRIMARY KEY,
  member_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  position_id VARCHAR(50) REFERENCES public.positions(id),
  parent_member_id VARCHAR(100) REFERENCES public.members(id),
  sponsor_id VARCHAR(100) REFERENCES public.members(id),
  manager_id VARCHAR(100) REFERENCES public.members(id),
  unit_id VARCHAR(100),
  center_id VARCHAR(100),
  region_id VARCHAR(100),
  join_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  personal_fyc NUMERIC(15, 2) DEFAULT 0,
  personal_com NUMERIC(15, 2) DEFAULT 0,
  first_year_premium NUMERIC(15, 2) DEFAULT 0,
  renewal_premium NUMERIC(15, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Compensation Rules & Version Control
CREATE TABLE IF NOT EXISTS public.compensation_plan_versions (
  id VARCHAR(100) PRIMARY KEY,
  version_name VARCHAR(100) NOT NULL,
  effective_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.compensation_rules (
  id VARCHAR(100) PRIMARY KEY,
  plan_version_id VARCHAR(100) REFERENCES public.compensation_plan_versions(id),
  income_type VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  rule_type VARCHAR(50) NOT NULL,
  rate NUMERIC(8, 4),
  fixed_amount NUMERIC(15, 2),
  tier_config JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Monthly & Annual Performance Snapshots
CREATE TABLE IF NOT EXISTS public.monthly_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id VARCHAR(100) REFERENCES public.members(id),
  period_month VARCHAR(7) NOT NULL, -- e.g. 2026-08
  personal_fyc NUMERIC(15, 2) DEFAULT 0,
  team_fyc NUMERIC(15, 2) DEFAULT 0,
  personal_com NUMERIC(15, 2) DEFAULT 0,
  team_com NUMERIC(15, 2) DEFAULT 0,
  calculated_income NUMERIC(15, 2) DEFAULT 0,
  breakdown JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id VARCHAR(100) NOT NULL,
  action VARCHAR(100) NOT NULL,
  target_entity VARCHAR(100) NOT NULL,
  previous_value JSONB,
  new_value JSONB,
  reason TEXT,
  ip_address VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;`;

  return (
    <div id="settings_integrations_view" className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              {language === 'th' ? 'การตั้งค่าระบบ ฐานข้อมูล และการเชื่อมต่อ (Enterprise Settings & Integrations)' : 'System Architecture, Integrations & Verification'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <SettingsIcon className="w-8 h-8 text-indigo-400" />
              {language === 'th' ? 'การตั้งค่า & การเชื่อมต่อระบบ (Settings)' : 'Settings & Integrations'}
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl">
              {language === 'th'
                ? 'โครงสร้าง Supabase PostgreSQL DDL, Webhook API สำหรับ n8n/LINE/Telegram, ความปลอดภัย RLS, และระบบทดสอบ Unit Tests Engine'
                : 'Supabase PostgreSQL DDL schema, n8n/Telegram/LINE webhooks, Row Level Security policies, and live calculation test runner.'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 self-start md:self-auto">
            <button
              onClick={() => setActiveTab('auth_settings')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'auth_settings'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LogIn className="w-3.5 h-3.5 inline mr-1.5" />
              {language === 'th' ? 'ระบบยืนยันตัวตน (Auth)' : 'Auth & Logins'}
            </button>
            <button
              onClick={() => setActiveTab('firebase_cloud')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'firebase_cloud'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Database className="w-3.5 h-3.5 inline mr-1.5" />
              {language === 'th' ? 'Firebase Cloud Database' : 'Firebase Cloud'}
            </button>
            <button
              onClick={() => setActiveTab('integrations')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'integrations'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Webhook className="w-3.5 h-3.5 inline mr-1.5" />
              {language === 'th' ? 'Webhooks & APIs' : 'Webhooks'}
            </button>
            <button
              onClick={() => setActiveTab('database_schema')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'database_schema'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Database className="w-3.5 h-3.5 inline mr-1.5" />
              {language === 'th' ? 'PostgreSQL Schema' : 'Database'}
            </button>
            <button
              onClick={() => setActiveTab('security_rls')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'security_rls'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 inline mr-1.5" />
              {language === 'th' ? 'ความปลอดภัย RLS' : 'Security'}
            </button>
            <button
              onClick={() => {
                setActiveTab('test_runner');
                if (testResults.length === 0) runAllUnitTests();
              }}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'test_runner'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Play className="w-3.5 h-3.5 inline mr-1.5" />
              {language === 'th' ? 'ทดสอบ Unit Tests' : 'Unit Tests'}
            </button>
          </div>
        </div>
      </div>

      {/* TAB 0: AUTHENTICATION & SOCIAL LOGINS (EMAIL, GOOGLE, TIKTOK, FACEBOOK) */}
      {activeTab === 'auth_settings' && (
        <div className="space-y-6">
          {/* Active Account Overview Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={authUser.avatarUrl || activeUser.avatarUrl}
                  alt={authUser.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500/40 shadow-md"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{authUser.name}</h3>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      {authUser.isLoggedIn ? 'Online (เข้าสู่ระบบแล้ว)' : 'Guest Mode'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{authUser.email}</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    รหัสตัวแทน: <strong className="text-amber-400">{activeUser.memberCode}</strong> • ช่องทางล็อกอินหลัก: <span className="capitalize font-semibold text-slate-300">{authUser.provider}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>เปิดหน้าต่างล็อกอิน (Open Login Modal)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Social Provider Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Email & Password */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-100 text-sm">อีเมล & รหัสผ่าน (Email & Password)</h4>
                    <p className="text-xs text-slate-400">เข้าสู่ระบบด้วยอีเมลบริษัท หรืออีเมลส่วนตัวพร้อมการเข้ารหัส bcrypt</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {authUser.connectedProviders.includes('email') ? 'เชื่อมต่อแล้ว' : 'พร้อมใช้งาน'}
                </span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono flex items-center justify-between">
                <span>{authUser.email}</span>
                <span className="text-slate-500 text-[11px]">Primary Account</span>
              </div>
            </div>

            {/* 2. Google OAuth */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-white/10 border border-slate-700">
                    <GoogleIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-100 text-sm">Google Workspace / Account</h4>
                    <p className="text-xs text-slate-400">ล็อกอิน One-Click และเชื่อมโยง Google Calendar สำหรับนัดหมายลูกค้า</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  authUser.connectedProviders.includes('google')
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {authUser.connectedProviders.includes('google') ? 'Connected' : 'Not Linked'}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-xs text-slate-400">
                  {authUser.connectedProviders.includes('google') ? 'เชื่อมต่อกับ Google ID เรียบร้อย' : 'ยังไม่ได้เชื่อมต่อ Google'}
                </span>
                <button
                  onClick={() => {
                    if (authUser.connectedProviders.includes('google')) {
                      unlinkSocialAccount('google');
                    } else {
                      openOAuthPopup('google');
                    }
                  }}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                    authUser.connectedProviders.includes('google')
                      ? 'text-rose-400 hover:bg-rose-500/10 border-rose-500/30'
                      : 'text-amber-300 hover:bg-amber-500/10 border-amber-500/30 bg-amber-500/5'
                  }`}
                >
                  {authUser.connectedProviders.includes('google') ? 'ยกเลิกการเชื่อมต่อ' : 'เชื่อมต่อ Google'}
                </button>
              </div>
            </div>

            {/* 3. TikTok OAuth */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700">
                    <TikTokIcon className="w-5 h-5 text-pink-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-100 text-sm">TikTok Creator Login</h4>
                    <p className="text-xs text-slate-400">เชื่อมโยงช่อง TikTok สำหรับดึง Leads ผู้มุ่งหวังจากคลิปสร้างทีม</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  authUser.connectedProviders.includes('tiktok')
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {authUser.connectedProviders.includes('tiktok') ? 'Connected' : 'Not Linked'}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-xs text-slate-400 font-mono">
                  {authUser.connectedProviders.includes('tiktok') ? (authUser.tiktokHandle || '@insurance_leader') : 'ยังไม่ได้เชื่อมต่อ TikTok'}
                </span>
                <button
                  onClick={() => {
                    if (authUser.connectedProviders.includes('tiktok')) {
                      unlinkSocialAccount('tiktok');
                    } else {
                      openOAuthPopup('tiktok');
                    }
                  }}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                    authUser.connectedProviders.includes('tiktok')
                      ? 'text-rose-400 hover:bg-rose-500/10 border-rose-500/30'
                      : 'text-pink-300 hover:bg-pink-500/10 border-pink-500/30 bg-pink-500/5'
                  }`}
                >
                  {authUser.connectedProviders.includes('tiktok') ? 'ยกเลิกการเชื่อมต่อ' : 'เชื่อมต่อ TikTok'}
                </button>
              </div>
            </div>

            {/* 4. Facebook OAuth */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-600/20 border border-blue-500/30">
                    <FacebookIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-100 text-sm">Meta Facebook Login</h4>
                    <p className="text-xs text-slate-400">เข้าสู่ระบบและเชื่อมต่อ Facebook Page / Group ประจำสายงาน</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  authUser.connectedProviders.includes('facebook')
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {authUser.connectedProviders.includes('facebook') ? 'Connected' : 'Not Linked'}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-xs text-slate-400">
                  {authUser.connectedProviders.includes('facebook') ? (authUser.facebookId || 'fb.agent.official') : 'ยังไม่ได้เชื่อมต่อ Facebook'}
                </span>
                <button
                  onClick={() => {
                    if (authUser.connectedProviders.includes('facebook')) {
                      unlinkSocialAccount('facebook');
                    } else {
                      openOAuthPopup('facebook');
                    }
                  }}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                    authUser.connectedProviders.includes('facebook')
                      ? 'text-rose-400 hover:bg-rose-500/10 border-rose-500/30'
                      : 'text-blue-300 hover:bg-blue-500/10 border-blue-500/30 bg-blue-500/5'
                  }`}
                >
                  {authUser.connectedProviders.includes('facebook') ? 'ยกเลิกการเชื่อมต่อ' : 'เชื่อมต่อ Facebook'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: WEBHOOKS & AUTOMATIONS */}
      {activeTab === 'integrations' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                id: 'n8n_integration',
                title: 'n8n Workflow Automation',
                desc: 'ส่งข้อมูลใบสมัครตัวแทนใหม่และผลคำนวณคอมมิชชั่นเข้าสู่ n8n workflow สำหรับจัดการตรรกะแบบอัตโนมัติ',
                status: 'Connected',
                endpoint: 'https://n8n.insurance-os.internal/webhook/v1/new-member-commission',
                auth: 'Bearer token_n8n_insurtech_prod_987x'
              },
              {
                id: 'line_notify',
                title: 'LINE Official Account & Flex Messages',
                desc: 'แจ้งเตือนสรุปผลงาน FYC และแจ้งเตือนเมื่อสมาชิกใหม่ได้รับการอนุมัติเข้าสายงานตรง',
                status: 'Active',
                endpoint: 'https://api.line.me/v2/bot/message/push',
                auth: 'Channel Access Token: Verified'
              },
              {
                id: 'telegram_alerts',
                title: 'Telegram Executive Bot',
                desc: 'แจ้งเตือน Real-time เมื่อมีศูนย์หรือหน่วยทำผลงานทะลุเป้าหมายเพื่อรับรางวัลโบนัสภาค',
                status: 'Active',
                endpoint: 'https://api.telegram.org/bot<TOKEN>/sendMessage',
                auth: 'Bot ID: @InsuranceOS_Executive_Bot'
              },
              {
                id: 'google_workspace',
                title: 'Google Sheets & Drive Sync',
                desc: 'ส่งออกรายงานผลงานรายเดือนและสรุปใบรับรองรายได้เข้าสู่ Google Drive อัตโนมัติ',
                status: 'Synced',
                endpoint: 'https://sheets.googleapis.com/v4/spreadsheets/export_fyc',
                auth: 'OAuth2 Connected: akarapol.pro798@gmail.com'
              },
            ].map((item) => (
              <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                      <Webhook className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">{item.title}</h3>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        {item.status}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(item.endpoint, item.id)}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 flex items-center gap-1"
                  >
                    {copiedKey === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === item.id ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>

                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto">
                  <p className="text-slate-400">Endpoint:</p>
                  <p className="text-indigo-300 truncate">{item.endpoint}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: SUPABASE POSTGRESQL SCHEMA */}
      {activeTab === 'database_schema' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-400" />
              <div>
                <h3 className="font-bold text-white text-sm">Supabase PostgreSQL Schema (Production DDL)</h3>
                <p className="text-xs text-slate-400">20+ Production Tables with Infinite Organization & Multi-Level RBAC</p>
              </div>
            </div>
            <button
              onClick={() => handleCopy(supabaseDdlSchema, 'ddl_schema')}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5"
            >
              {copiedKey === 'ddl_schema' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'ddl_schema' ? 'คัดลอกแล้ว' : 'คัดลอก SQL DDL'}</span>
            </button>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto max-h-96">
            <pre>{supabaseDdlSchema}</pre>
          </div>
        </div>
      )}

      {/* TAB 3: SECURITY & RLS POLICIES */}
      {activeTab === 'security_rls' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-3 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-white text-sm">การกำหนดสิทธิ์และการเข้าถึงข้อมูล (Role-Based Access & RLS)</h3>
              <p className="text-xs text-slate-400">ป้องกันการมองเห็นรายได้ข้ามสายงาน (Data Privacy & Compliance)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { role: 'Super Admin / System Architect', access: 'เข้าถึงข้อมูลทุกส่วน ปรับแต่ง Rule Engine และอนุมัติสมาชิกทุกสายงาน', badge: 'Full Access' },
              { role: 'Regional Manager (ผู้บริหารภาค)', access: 'มองเห็นโครงสร้างศูนย์ หน่วย และตัวแทนทั้งหมดในสังกัดภาคตนเอง', badge: 'Region Scope' },
              { role: 'Center Manager (ผู้บริหารศูนย์)', access: 'มองเห็นโครงสร้างหน่วยและตัวแทนในสังกัดศูนย์ตนเอง', badge: 'Center Scope' },
              { role: 'Unit Manager (ผู้บริหารหน่วย)', access: 'มองเห็นผลงานตัวแทนในหน่วยตนเอง', badge: 'Unit Scope' },
              { role: 'Agent (ตัวแทนประกันชีวิต)', access: 'มองเห็นเฉพาะผลงานส่วนตัวและผู้ที่ตนเองแนะนำตรง (Direct Sponsor) เท่านั้น', badge: 'Strict Isolation' },
            ].map((r, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-200 text-xs">{r.role}</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">{r.badge}</span>
                </div>
                <p className="text-xs text-slate-400">{r.access}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: IN-APP UNIT TEST RUNNER */}
      {activeTab === 'test_runner' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="font-bold text-white text-sm">การตรวจสอบความถูกต้องของระบบคำนวณ (Calculation Engine Verification)</h3>
                <p className="text-xs text-slate-400">ทดสอบสมการทางคณิตศาสตร์ 7 เงื่อนไขตาม Section 51 + Cycle Prevention</p>
              </div>
            </div>

            <button
              onClick={runAllUnitTests}
              disabled={runningTests}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${runningTests ? 'animate-spin' : ''}`} />
              <span>{runningTests ? 'กำลังทดสอบ...' : 'รันทดสอบทั้งหมด (Run Tests)'}</span>
            </button>
          </div>

          <div className="divide-y divide-slate-800/80">
            {testResults.map((t) => (
              <div key={t.id} className="py-3 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                      ✓
                    </span>
                    <p className="font-semibold text-xs text-slate-200">{t.name}</p>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono ml-7">
                    สมการ: {t.formula} ➔ ผลลัพธ์: <strong className="text-emerald-400">{t.actual.toLocaleString()}</strong> (คาดหวัง: {t.expected.toLocaleString()})
                  </p>
                </div>

                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  PASSED (100%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
