import React, { useState } from 'react';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Award, 
  Building2, 
  Network, 
  Play, 
  RotateCcw, 
  Sparkles, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldCheck,
  Shield,
  CheckCircle2,
  Cpu,
  ChevronRight,
  Layers,
  Activity,
  Flame,
  UserPlus
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { INITIAL_12_MONTHS_HISTORY } from '../../data/initialData';

export const Dashboard: React.FC = () => {
  const { 
    activeUser, 
    members, 
    calculateMemberIncome, 
    getDownlineStats, 
    setActiveTab, 
    setSelectedMember,
    language,
    t
  } = useApp();

  const [animatingGrowth, setAnimatingGrowth] = useState(false);
  const [animationStep, setAnimationStep] = useState(4); // 1: Leader, 2: Centers, 3: Units, 4: All

  const downlineStats = getDownlineStats(activeUser.id);
  const incomeResult = calculateMemberIncome(activeUser, 'ACTUAL');

  // Executive KPI summary calculations
  const totalOrgCount = members.length;
  const activeOrgCount = members.filter(m => m.status === 'active').length;
  const activeRate = Math.round((activeOrgCount / (totalOrgCount || 1)) * 100);
  const retentionRate = 84; // %
  const totalOrgFYC = members.reduce((sum, m) => sum + m.personalFYC, 0);
  const totalOrgCOM = members.reduce((sum, m) => sum + m.personalCOM, 0);
  const averageFycPerAgent = Math.round(totalOrgFYC / (activeOrgCount || 1));

  // Position distribution
  const positionStats = [
    { name: t('pos_rm'), count: members.filter(m => m.positionId === 'region_manager').length, color: '#f43f5e' },
    { name: t('pos_cm'), count: members.filter(m => m.positionId === 'center_manager').length, color: '#fbbf24' },
    { name: t('pos_um'), count: members.filter(m => m.positionId === 'unit_manager').length, color: '#34d399' },
    { name: t('pos_ag'), count: members.filter(m => m.positionId === 'agent').length, color: '#38bdf8' },
  ];

  // Play hero growth animation
  const handlePlayGrowthAnimation = () => {
    setAnimatingGrowth(true);
    setAnimationStep(1);
    setTimeout(() => setAnimationStep(2), 1000);
    setTimeout(() => setAnimationStep(3), 2200);
    setTimeout(() => {
      setAnimationStep(4);
      setAnimatingGrowth(false);
    }, 3600);
  };

  const centerLeaders = members.filter(m => m.positionId === 'center_manager');
  const unitLeaders = members.filter(m => m.positionId === 'unit_manager').slice(0, 8);

  return (
    <div id="executive_dashboard_view" className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* System Status Bar — shows after login */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-sky-50/80 border border-sky-100 backdrop-blur-md shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-600/30 flex items-center justify-center text-blue-600 shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span>AI Engine 2026 เปิดใช้งาน</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-[11px] text-slate-700">4-Tier Auto Commission Calculation</div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold text-slate-700">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>256-bit SSL</span>
          </div>
        </div>
      </div>

      {/* 1. Hero Network Growth Visualizer Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-50 via-sky-100 to-indigo-950/40 border border-sky-100 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Left: Inspiring Hero Copy & Actions */}
          <div className="max-w-xl text-left space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-600/30 text-blue-600 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI INSURANCE NETWORK OS • ระบบหลัก</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                id="btn_hero_explore_network"
                onClick={() => setActiveTab('network_visual')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-transform hover:scale-105 active:scale-95"
              >
                <Network className="w-4 h-4" />
                <span>{t('view_network_btn')}</span>
              </button>

              <button
                id="btn_hero_calculate_income"
                onClick={() => setActiveTab('income_calculator')}
                className="px-4 py-2.5 rounded-xl bg-sky-100/80 hover:bg-sky-100 text-slate-800 font-semibold text-xs sm:text-sm border border-sky-100 flex items-center gap-2 transition-all"
              >
                <DollarSign className="w-4 h-4 text-blue-600" />
                <span>{t('calculate_income_btn')}</span>
              </button>

              <button
                id="btn_hero_recruit_agent"
                onClick={() => setActiveTab('recruit_agent')}
                className="px-4 py-2.5 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-slate-900 font-semibold text-xs sm:text-sm border border-indigo-500/50 flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
              >
                <UserPlus className="w-4 h-4 text-indigo-200" />
                <span>{language === 'th' ? 'สมัครตัวแทนใหม่' : 'Recruit Agent'}</span>
              </button>

              <button
                id="btn_hero_play_growth_anim"
                onClick={handlePlayGrowthAnimation}
                disabled={animatingGrowth}
                className="px-3.5 py-2.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-200 font-medium text-xs border border-indigo-700/50 flex items-center gap-1.5 transition-all"
              >
                {animatingGrowth ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{animatingGrowth ? (language === 'th' ? 'กำลังจำลองการเติบโต...' : 'Simulating Growth...') : t('play_growth_anim')}</span>
              </button>
            </div>
          </div>

          {/* Right: Dynamic Interactive Network Cluster Preview */}
          <div className="relative w-full lg:w-96 h-72 rounded-2xl bg-sky-50/60 border border-sky-100/80 p-4 flex flex-col items-center justify-center overflow-hidden">
            <div className="absolute top-2 left-3 text-[10px] uppercase font-bold text-slate-700 tracking-wider">
              {animationStep === 1 && (language === 'th' ? 'ขั้นที่ 1: Root Leader (1 ท่าน)' : 'Step 1: Root Leader (1 Leader)')}
              {animationStep === 2 && (language === 'th' ? 'ขั้นที่ 2: สร้างผู้นำศูนย์ 4 ศูนย์ (4 CMs)' : 'Step 2: 4 Centers Expanded (4 CMs)')}
              {animationStep === 3 && (language === 'th' ? 'ขั้นที่ 3: แตกหน่วยงาน 12 หน่วย (12 UMs)' : 'Step 3: 12 Units Formed (12 UMs)')}
              {animationStep === 4 && (language === 'th' ? 'ขั้นที่ 4: องค์กรสมบูรณ์ 125 ท่าน (Infinite Network)' : 'Step 4: Full Infinite Network (125 Members)')}
            </div>

            {/* Central Leader Node */}
            <div className="relative flex flex-col items-center z-20 transition-transform duration-500 scale-105">
              <div className="relative">
                <img 
                  src={activeUser.avatarUrl} 
                  alt={activeUser.name} 
                  className="w-14 h-14 rounded-full object-cover border-2 border-blue-400 shadow-xl shadow-amber-500/30"
                />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-blue-600 text-slate-950 font-black text-[9px] flex items-center justify-center border-2 border-slate-950">
                  RM
                </span>
              </div>
              <span className="text-[11px] font-bold text-slate-800 mt-1">{activeUser.name.split(' ')[0]}</span>
            </div>

            {/* Step 2: Surrounding Centers */}
            {animationStep >= 2 && (
              <div className="absolute inset-0 flex items-center justify-around px-2 pointer-events-none">
                {centerLeaders.map((cm, idx) => (
                  <div 
                    key={cm.id} 
                    className="flex flex-col items-center animate-in fade-in zoom-in duration-500"
                    style={{
                      transform: `translate(${(idx === 0 ? -120 : idx === 1 ? 120 : idx === 2 ? -60 : 60)}px, ${(idx < 2 ? -45 : 55)}px)`
                    }}
                  >
                    <div className="w-9 h-9 rounded-full overflow-hidden border border-blue-400/80 shadow-md">
                      <img src={cm.avatarUrl} alt={cm.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[9px] font-medium text-blue-600">{cm.nickname || cm.name.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Step 3 & 4: Orbiting Units & Agents Dots */}
            {animationStep >= 3 && (
              <div className="absolute inset-0 pointer-events-none opacity-80">
                {unitLeaders.map((um, idx) => {
                  const angle = (idx / 8) * 2 * Math.PI;
                  const radius = 105;
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;
                  return (
                    <div
                      key={um.id}
                      className="absolute left-1/2 top-1/2 w-6 h-6 -ml-3 -mt-3 rounded-full overflow-hidden border border-emerald-400/70 shadow-sm animate-in fade-in zoom-in duration-700"
                      style={{ transform: `translate(${x}px, ${y}px)` }}
                    >
                      <img src={um.avatarUrl} alt={um.name} className="w-full h-full object-cover" />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Step 4: Digital connection waves */}
            {animationStep === 4 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 rounded-full border border-blue-600/10 animate-ping opacity-20" />
                <div className="w-48 h-48 rounded-full border border-indigo-500/15 animate-pulse" />
              </div>
            )}

            <div className="absolute bottom-2 text-[10px] text-slate-700 font-mono">
              {t('kpi_downline_count')}: <span className="text-blue-600 font-bold">{downlineStats.totalDownlineCount}</span> {t('people')} • Active: <span className="text-emerald-400 font-bold">{downlineStats.activeDownlineCount}</span> {t('people')}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Executive KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Monthly Income */}
        <div className="p-5 rounded-2xl bg-sky-50/90 border border-sky-100 relative overflow-hidden text-left group hover:border-blue-600/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">{t('kpi_monthly_income')}</span>
            <div className="w-8 h-8 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
            ฿{incomeResult.totalIncome.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 mt-2 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+6.9% {language === 'th' ? 'จากเดือนก่อนหน้า' : 'vs last month'}</span>
          </div>
        </div>

        {/* KPI 2: Total FYC */}
        <div className="p-5 rounded-2xl bg-sky-50/90 border border-sky-100 relative overflow-hidden text-left group hover:border-sky-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">{t('kpi_team_fyc')}</span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
            ฿{(activeUser.personalFYC + downlineStats.teamFYC).toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-sky-400 mt-2 font-medium">
            <span>{language === 'th' ? 'เบี้ยปีแรก' : 'First Year Premium'} ฿{((activeUser.personalFYC + downlineStats.teamFYC) * 3).toLocaleString()}</span>
          </div>
        </div>

        {/* KPI 3: Total Organization & Active */}
        <div className="p-5 rounded-2xl bg-sky-50/90 border border-sky-100 relative overflow-hidden text-left group hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">{t('kpi_organization')}</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
            {totalOrgCount} <span className="text-xs font-normal text-slate-700">{t('people')} (Active {activeOrgCount})</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-700 mt-2">
            <span className="text-emerald-400 font-semibold">{t('kpi_active_rate')} {activeRate}%</span>
            <span>•</span>
            <span className="text-blue-600 font-semibold">{t('kpi_retention')} {retentionRate}%</span>
          </div>
        </div>

        {/* KPI 4: Units & Centers Structure */}
        <div className="p-5 rounded-2xl bg-sky-50/90 border border-sky-100 relative overflow-hidden text-left group hover:border-purple-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">{t('kpi_leadership')}</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
            {downlineStats.totalCenters} <span className="text-xs font-normal text-slate-700">{t('centers_unit')}</span> / {downlineStats.totalUnits} <span className="text-xs font-normal text-slate-700">{t('units_unit')}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-purple-400 mt-2 font-medium">
            <span>{language === 'th' ? `แยกศูนย์ ${activeUser.separatedCentersCount || 4} • แยกหน่วย ${activeUser.separatedUnitsCount || 12}` : `Sep. Centers: ${activeUser.separatedCentersCount || 4} • Sep. Units: ${activeUser.separatedUnitsCount || 12}`}</span>
          </div>
        </div>
      </div>

      {/* 3. Main Analytical Grid: 12-Month Performance Trend & Income Composition */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart (2 Cols) */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl bg-sky-50/90 border border-sky-100 text-left">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">{t('trend_12_month_title')}</h2>
              <p className="text-[11px] text-slate-700">{t('trend_12_month_subtitle')}</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 text-[11px] text-blue-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> {language === 'th' ? 'รายได้ (฿)' : 'Income (฿)'}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-sky-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-sky-400" /> FYC (฿)
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={INITIAL_12_MONTHS_HISTORY} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="fycGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                  formatter={(val: any) => [`฿${Number(val).toLocaleString()}`, '']}
                />
                <Area type="monotone" dataKey="calculatedIncome" name={language === 'th' ? 'รายได้รวม' : 'Total Income'} stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#incomeGrad)" />
                <Area type="monotone" dataKey="teamFYC" name={language === 'th' ? 'FYC ทั้งทีม' : 'Team FYC'} stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#fycGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Position Breakdown & Leadership Funnel (1 Col) */}
        <div className="p-5 sm:p-6 rounded-2xl bg-sky-50/90 border border-sky-100 text-left flex flex-col justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-1">{t('position_hierarchy_title')}</h2>
            <p className="text-[11px] text-slate-700 mb-4">{t('position_hierarchy_subtitle')}</p>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={positionStats}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                  >
                    {positionStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 mt-2">
              {positionStats.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-700">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-900">{item.count} {t('people')}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('career_path')}
            className="w-full mt-4 py-2 rounded-xl bg-sky-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
          >
            <span>{t('view_career_btn')}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4. Real-Time Income Breakdown Summary Cards */}
      <div className="p-5 sm:p-6 rounded-2xl bg-sky-50/90 border border-sky-100 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900">{t('compensation_summary_title')}</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                ACTUAL
              </span>
            </div>
            <p className="text-[11px] text-slate-700">{t('compensation_summary_subtitle')}</p>
          </div>

          <button
            onClick={() => setActiveTab('income_calculator')}
            className="text-xs text-blue-600 hover:text-blue-600 font-semibold flex items-center gap-1 self-start"
          >
            <span>{t('view_all_breakdown')}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {incomeResult.breakdown.slice(0, 6).map((item) => (
            <div key={item.id} className="p-3 rounded-xl bg-sky-50/70 border border-sky-100/80">
              <div className="text-[10px] text-slate-700 font-medium truncate" title={item.title}>
                {item.title}
              </div>
              <div className="text-sm sm:text-base font-bold text-blue-600 mt-1">
                ฿{item.amount.toLocaleString()}
              </div>
              <div className="text-[9px] text-slate-700 mt-1 truncate">
                {language === 'th' ? 'อัตรา: ' : 'Rate: '}{item.rateOrFormula}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Professional Disclaimer */}
      <div className="p-4 rounded-xl bg-sky-50/50 border border-sky-100/60 text-left text-[11px] text-slate-700 leading-relaxed">
        <span className="font-bold text-slate-700">{t('disclaimer_title')} </span>
        {t('disclaimer_body')}
      </div>
    </div>
  );
};
