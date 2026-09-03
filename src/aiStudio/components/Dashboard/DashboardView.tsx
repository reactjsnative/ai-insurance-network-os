import React from 'react';
import {
  Users,
  Award,
  TrendingUp,
  DollarSign,
  Building2,
  Layers,
  ArrowRight,
  CheckCircle,
  Clock,
  Sparkles,
  ChevronRight,
  Download,
  Calendar,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { POSITIONS_LIST } from '../../rules/defaultRules';
import { formatBaht, formatNumber, formatPercent } from '../../lib/decimal';
import { exportIncomeReportToPDF, exportIncomeReportToExcel } from '../../utils/exportReports';

const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];

export const DashboardView: React.FC = () => {
  const {
    selectedMember,
    selectedMemberResult: result,
    members,
    rules,
    setActiveTab,
    setSelectedMemberId,
    setEditingMemberId,
  } = useApp();

  if (!selectedMember || !result) {
    return (
      <div className="p-8 text-center text-slate-800">
        ไม่พบข้อมูลสมาชิก กรุณาเลือกสมาชิกจากเมนูด้านบน
      </div>
    );
  }

  const currentPosInfo = POSITIONS_LIST.find(p => p.id === selectedMember.position) || POSITIONS_LIST[0];
  const nextPosInfo = POSITIONS_LIST.find(p => p.id === result.nextPosition);

  // Goal progress calculation
  const goalMonthlyIncome = selectedMember.monthlyGoalIncome || 100000;
  const incomeProgressPct = Math.min(100, Math.round((result.totalMonthlyIncome / goalMonthlyIncome) * 100));

  // Income Breakdown for Pie Chart
  const incomePieData = [
    { name: 'ผลงานส่วนตัว', value: result.personalIncomeTotal },
    { name: 'บริหารหน่วย', value: result.unitManagementIncomeTotal },
    { name: 'บริหารศูนย์', value: result.centerManagementIncomeTotal },
    { name: 'บริหารภาค', value: result.groupManagementIncomeTotal },
    { name: 'โบนัสประจำเดือน', value: result.monthlyBonusTotal },
  ].filter(d => d.value > 0);

  // Subordinates performance preview
  const directSubordinates = members.filter(m => m.parentId === selectedMember.id);

  return (
    <div className="space-y-6 pb-12">
      
      {/* 1. Header Profile Banner & Career Stage */}
      <div className="bg-gradient-to-r from-sky-50 via-blue-950 to-slate-50 border border-sky-50/40 rounded-2xl p-6 shadow-[0_4px_12px_rgba(148,163,184,0.10)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 flex items-center justify-center text-white text-2xl font-black shadow-[0_1px_3px_rgba(148,163,184,0.08)] shadow-blue-500/25 ring-2 ring-white/20 shrink-0">
              {selectedMember.nickname ? selectedMember.nickname.slice(0, 2) : selectedMember.name.slice(0, 2)}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {selectedMember.name}
                </h1>
                {selectedMember.nickname && (
                  <span className="text-sm font-medium text-blue-600 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-600/40">
                    "{selectedMember.nickname}"
                  </span>
                )}
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${currentPosInfo.badgeColor}`}>
                  {currentPosInfo.nameTh}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${selectedMember.isActive ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'bg-rose-950 text-rose-300 border border-rose-700'}`}>
                  {selectedMember.isActive ? '● กำลังปฏิบัติงาน (Active)' : '○ พักงาน (Inactive)'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-2 text-xs text-slate-800">
                <span>รหัส: <strong className="text-slate-900">{selectedMember.code}</strong></span>
                <span>อายุงาน: <strong className="text-slate-900">{selectedMember.tenureMonths} เดือน</strong> (เริ่ม {selectedMember.startDate})</span>
                {selectedMember.region && <span>เขตพื้นที่: <strong className="text-slate-900">{selectedMember.region}</strong></span>}
                {selectedMember.notes && <span className="text-slate-800 italic">“{selectedMember.notes}”</span>}
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto">
            <button
              onClick={() => setEditingMemberId(selectedMember.id)}
              className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#f0f9ff] hover:bg-slate-200 text-slate-800 border border-sky-50/40 shadow-[0_1px_3px_rgba(148,163,184,0.08)] transition-all cursor-pointer"
            >
              แก้ไขผลงาน
            </button>
            <button
              onClick={() => exportIncomeReportToExcel(selectedMember, result, members, rules)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/60 shadow-[0_1px_3px_rgba(148,163,184,0.08)] transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Excel</span>
            </button>
            <button
              onClick={() => exportIncomeReportToPDF(selectedMember, result, rules)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-900/80 hover:bg-rose-800 text-rose-200 border border-rose-700/60 shadow-[0_1px_3px_rgba(148,163,184,0.08)] transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>
          </div>
        </div>

        {/* Career Progression Roadmap Step Bar */}
        <div className="mt-6 pt-5 border-t border-sky-50/40/80">
          <div className="flex items-center justify-between text-xs text-slate-800 mb-2">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-blue-600" />
              เส้นทางความก้าวหน้าในอาชีพ (Career Progression Pathway)
            </span>
            <span>
              สถานะ: <strong className="text-blue-600">{currentPosInfo.nameEn}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {POSITIONS_LIST.map((pos, idx) => {
              const isCurrent = pos.id === selectedMember.position;
              const isPast = pos.order < currentPosInfo.order;
              const isFuture = pos.order > currentPosInfo.order;

              return (
                <div
                  key={pos.id}
                  className={`p-3 rounded-xl border text-xs transition-all ${
                    isCurrent
                      ? 'bg-blue-950/80 border-blue-500 ring-1 ring-blue-500 shadow-[0_1px_3px_rgba(148,163,184,0.08)] shadow-blue-900/40'
                      : isPast
                      ? 'bg-[#fcfdff]/60 border-sky-50/40 text-slate-800'
                      : 'bg-[#fcfdff]/30 border-sky-50/40/60 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-800">ขั้นที่ {idx + 1}</span>
                    {isCurrent ? (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-500 text-slate-900">ปัจจุบัน</span>
                    ) : isPast ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-slate-800" />
                    )}
                  </div>
                  <p className={`font-semibold ${isCurrent ? 'text-slate-900' : 'text-slate-800'}`}>
                    {pos.nameTh.split('(')[0]}
                  </p>
                  <p className="text-[11px] text-slate-800 mt-1">
                    {pos.minPerformance > 0 ? `ผลงานขั้นต่ำ ${formatBaht(pos.minPerformance, false)}` : 'ตัวแทนเริ่มแรก'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Top Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Monthly Income */}
        <div className="bg-[#fcfdff]/90 border border-sky-50/40 hover:border-blue-600/50 rounded-2xl p-5 shadow-[0_1px_3px_rgba(148,163,184,0.08)] relative overflow-hidden transition-all group">
          <div className="flex items-center justify-between text-slate-800 text-xs mb-2">
            <span>รายได้ประมาณการ / เดือน</span>
            <div className="p-2 rounded-xl bg-blue-600/10 text-blue-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-600 tracking-tight">
            {formatBaht(result.totalMonthlyIncome)}
          </div>
          <div className="flex items-center justify-between mt-3 text-[11px] text-slate-800 border-t border-sky-50/40/80 pt-2">
            <span>รายได้ทั้งปีประมาณการ:</span>
            <strong className="text-slate-800">{formatBaht(result.totalAnnualIncome)}</strong>
          </div>
        </div>

        {/* Metric 2: Team Total Sales */}
        <div className="bg-[#fcfdff]/90 border border-sky-50/40 hover:border-blue-500/50 rounded-2xl p-5 shadow-[0_1px_3px_rgba(148,163,184,0.08)] relative overflow-hidden transition-all group">
          <div className="flex items-center justify-between text-slate-800 text-xs mb-2">
            <span>ผลงานยอดขายรวมทั้งทีม</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-400 tracking-tight">
            {formatBaht(result.teamTotalMonthlySales)}
          </div>
          <div className="flex items-center justify-between mt-3 text-[11px] text-slate-800 border-t border-sky-50/40/80 pt-2">
            <span>ยอดขายส่วนตัว:</span>
            <strong className="text-slate-800">{formatBaht(selectedMember.personalMonthlySales)}</strong>
          </div>
        </div>

        {/* Metric 3: Team Total FYC */}
        <div className="bg-[#fcfdff]/90 border border-sky-50/40 hover:border-emerald-500/50 rounded-2xl p-5 shadow-[0_1px_3px_rgba(148,163,184,0.08)] relative overflow-hidden transition-all group">
          <div className="flex items-center justify-between text-slate-800 text-xs mb-2">
            <span>FYC รวมทั้งสายงาน</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">
            {formatBaht(result.teamTotalMonthlyFyc)}
          </div>
          <div className="flex items-center justify-between mt-3 text-[11px] text-slate-800 border-t border-sky-50/40/80 pt-2">
            <span>COM รวมทั้งทีม:</span>
            <strong className="text-slate-800">{formatBaht(result.teamTotalMonthlyCom)}</strong>
          </div>
        </div>

        {/* Metric 4: Team Structure Count */}
        <div className="bg-[#fcfdff]/90 border border-sky-50/40 hover:border-purple-500/50 rounded-2xl p-5 shadow-[0_1px_3px_rgba(148,163,184,0.08)] relative overflow-hidden transition-all group">
          <div className="flex items-center justify-between text-slate-800 text-xs mb-2">
            <span>โครงสร้างและขนาดทีม</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-300 tracking-tight">
            {result.teamMemberCount} <span className="text-sm font-normal text-slate-800">คน</span>
          </div>
          <div className="flex items-center justify-between mt-3 text-[11px] text-slate-800 border-t border-sky-50/40/80 pt-2">
            <span>หน่วย: <strong className="text-slate-900">{result.separatedUnitsCount}</strong></span>
            <span>ศูนย์: <strong className="text-slate-900">{result.separatedCentersCount}</strong></span>
            <span>Active: <strong className="text-emerald-400">{result.teamActiveMemberCount}</strong></span>
          </div>
        </div>

      </div>

      {/* 3. Income Breakdown & Target Progression Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Detailed Income Composition & Tiers */}
        <div className="lg:col-span-2 bg-[#fcfdff]/90 border border-sky-50/40 rounded-2xl p-6 shadow-[0_4px_12px_rgba(148,163,184,0.10)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                จำแนกโครงสร้างรายได้ 5 หมวด (Income Categories Breakdown)
              </h2>
              <p className="text-xs text-slate-800">
                สูตรคำนวณตามเกณฑ์ผลงานรายบุคคลและผลงานการบริหารสายงาน
              </p>
            </div>
            <button
              onClick={() => setActiveTab('CALCULATOR')}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              ดูสูตรละเอียด <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            
            <div className="p-3.5 rounded-xl bg-[#f0f9ff]/60 border border-sky-50/40/60">
              <div className="flex items-center justify-between text-xs text-slate-800 mb-1">
                <span>1. รายได้จากผลงานส่วนตัว & พาหนะ</span>
                <span className="font-semibold text-slate-800">
                  {result.totalMonthlyIncome > 0 ? formatPercent(Math.round((result.personalIncomeTotal / result.totalMonthlyIncome) * 100)) : '0%'}
                </span>
              </div>
              <p className="text-lg font-bold text-slate-900">{formatBaht(result.personalIncomeTotal)}</p>
              <p className="text-[11px] text-slate-800 mt-1">ค่าบำเหน็จขายตรง + ค่าพาหนะประจำตำแหน่ง</p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#f0f9ff]/60 border border-sky-50/40/60">
              <div className="flex items-center justify-between text-xs text-slate-800 mb-1">
                <span>2. ค่าบริหารหน่วย & ค่าแยกหน่วย</span>
                <span className="font-semibold text-slate-800">
                  {result.totalMonthlyIncome > 0 ? formatPercent(Math.round((result.unitManagementIncomeTotal / result.totalMonthlyIncome) * 100)) : '0%'}
                </span>
              </div>
              <p className="text-lg font-bold text-slate-900">{formatBaht(result.unitManagementIncomeTotal)}</p>
              <p className="text-[11px] text-slate-800 mt-1">ค่าจัดงานหน่วย (25-40%) + หน่วยแยก (2,000 ฿/หน่วย)</p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#f0f9ff]/60 border border-sky-50/40/60">
              <div className="flex items-center justify-between text-xs text-slate-800 mb-1">
                <span>3. ค่าบริหารศูนย์ 3 ประเภท & แยกศูนย์</span>
                <span className="font-semibold text-slate-800">
                  {result.totalMonthlyIncome > 0 ? formatPercent(Math.round((result.centerManagementIncomeTotal / result.totalMonthlyIncome) * 100)) : '0%'}
                </span>
              </div>
              <p className="text-lg font-bold text-slate-900">{formatBaht(result.centerManagementIncomeTotal)}</p>
              <p className="text-[11px] text-slate-800 mt-1">จัดงานศูนย์ 1 (15-30%), 2 (0.8%), 3 (5k-15k) + แยกศูนย์</p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#f0f9ff]/60 border border-sky-50/40/60">
              <div className="flex items-center justify-between text-xs text-slate-800 mb-1">
                <span>4. ค่าบริหารภาค 1-2 & บริหารเป้าหมาย</span>
                <span className="font-semibold text-slate-800">
                  {result.totalMonthlyIncome > 0 ? formatPercent(Math.round((result.groupManagementIncomeTotal / result.totalMonthlyIncome) * 100)) : '0%'}
                </span>
              </div>
              <p className="text-lg font-bold text-slate-900">{formatBaht(result.groupManagementIncomeTotal)}</p>
              <p className="text-[11px] text-slate-800 mt-1">จัดงานภาค 1 (10-18%), 2 (1k-2.5k) + เป้าหมาย (10k-30k/ด)</p>
            </div>

          </div>

          {/* Chart preview */}
          {incomePieData.length > 0 && (
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={incomePieData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                  <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} stroke="#64748b" />
                  <YAxis type="category" dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value: any) => [formatBaht(Number(value)), 'รายได้']}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Right Col: Goal Progress & Target Simulator Card */}
        <div className="bg-[#fcfdff]/90 border border-sky-50/40 rounded-2xl p-6 shadow-[0_4px_12px_rgba(148,163,184,0.10)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                ความคืบหน้าเป้าหมาย
              </h2>
              <span className="text-xs font-bold text-blue-600 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-600/40">
                {incomeProgressPct}% สำเร็จ
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-slate-800 mb-1.5">
                  <span>เป้าหมายรายได้ต่อเดือน:</span>
                  <strong className="text-slate-900">{formatBaht(goalMonthlyIncome)}</strong>
                </div>
                <div className="w-full h-3 bg-[#f0f9ff] rounded-full overflow-hidden p-0.5 border border-sky-50/40">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, incomeProgressPct)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-800 mt-1">
                  <span>ปัจจุบัน: {formatBaht(result.totalMonthlyIncome)}</span>
                  <span>{incomeProgressPct >= 100 ? '🎉 บรรลุเป้าหมายแล้ว!' : `ขาดอีก ${formatBaht(Math.max(0, goalMonthlyIncome - result.totalMonthlyIncome))}`}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#f0f9ff]/50 border border-sky-50/40/60 text-xs text-slate-800 space-y-2">
                <p className="font-semibold text-slate-900">💡 ข้อมูลเชิงกลยุทธ์:</p>
                <p>
                  สมาชิกในทีมปัจจุบัน: <strong>{result.teamMemberCount} คน</strong> (Active {result.teamActiveMemberCount} คน)
                </p>
                <p>
                  สร้างยอดขายเฉลี่ยต่อคน: <strong>{formatBaht(result.teamMemberCount > 0 ? result.teamTotalMonthlySales / result.teamMemberCount : 0)} / เดือน</strong>
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('GOAL')}
            className="w-full mt-6 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-[0_1px_3px_rgba(148,163,184,0.08)] shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>เปิดระบบจำลองเป้าหมายย้อนกลับ</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* 4. Promotion Requirements & Gap Analysis Section */}
      <div className="bg-[#fcfdff]/90 border border-sky-50/40 rounded-2xl p-6 shadow-[0_4px_12px_rgba(148,163,184,0.10)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-400" />
              การประเมินคุณสมบัติเลื่อนตำแหน่งถัดไป (Promotion Gap Analysis)
            </h2>
            <p className="text-xs text-slate-800">
              {nextPosInfo
                ? `เปรียบเทียบคุณสมบัติปัจจุบันกับเกณฑ์ตำแหน่ง ${nextPosInfo.nameTh}`
                : 'คุณอยู่ในตำแหน่งผู้บริหารระดับสูงสุดแล้ว (ผู้บริหารภาค)'}
            </p>
          </div>
          {nextPosInfo && (
            <span
              className={`text-xs px-3 py-1 rounded-full font-bold border ${
                result.promotionRequirementsMet
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                  : 'bg-amber-950 text-blue-600 border-amber-600'
              }`}
            >
              {result.promotionRequirementsMet ? '✓ ผ่านเกณฑ์เลื่อนตำแหน่งแล้ว' : '⏳ ยังขาดคุณสมบัติบางส่วน'}
            </span>
          )}
        </div>

        {nextPosInfo ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {result.promotionChecklist.map((check, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border transition-all ${
                  check.met
                    ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-200'
                    : 'bg-[#f0f9ff]/60 border-sky-50/40 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-xs text-slate-800">{check.item}</span>
                  {check.met ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                      <CheckCircle className="w-3.5 h-3.5" /> ผ่าน
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-blue-600">
                      <AlertCircle className="w-3.5 h-3.5" /> ยังไม่ถึง
                    </span>
                  )}
                </div>
                <div className="text-xs space-y-1">
                  <p className="text-slate-800">เกณฑ์ที่ต้องได้: <strong className="text-slate-900">{check.required}</strong></p>
                  <p className="text-slate-800">ปัจจุบันทำได้: <strong className={check.met ? 'text-emerald-300' : 'text-blue-600'}>{check.current}</strong></p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-[#f0f9ff]/40 border border-sky-50/40/60 text-xs text-slate-800">
            ขอแสดงความยินดี! คุณดำรงตำแหน่งผู้บริหารภาค ซึ่งเป็นโครงสร้างบริหารงานระดับสูงที่สุด พร้อมรับผลประโยชน์ครบทั้ง 12 สิทธิประโยชน์
          </div>
        )}
      </div>

      {/* 5. Direct Subordinates Quick List */}
      {directSubordinates.length > 0 && (
        <div className="bg-[#fcfdff]/90 border border-sky-50/40 rounded-2xl p-6 shadow-[0_4px_12px_rgba(148,163,184,0.10)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                สมาชิกในสายงานตรง ({directSubordinates.length} คน)
              </h2>
              <p className="text-xs text-slate-800">คลิกเพื่อสลับมุมมองดูรายละเอียดและผลลัพธ์รายได้ของสมาชิกแต่ละคน</p>
            </div>
            <button
              onClick={() => setActiveTab('TREE')}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              ดูผังเต็ม <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {directSubordinates.map(sub => {
              const subPos = POSITIONS_LIST.find(p => p.id === sub.position) || POSITIONS_LIST[0];
              return (
                <div
                  key={sub.id}
                  onClick={() => setSelectedMemberId(sub.id)}
                  className="p-3.5 rounded-xl bg-[#f0f9ff]/50 hover:bg-[#f0f9ff] border border-sky-50/40/60 hover:border-blue-500/60 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-xs text-slate-900 group-hover:text-blue-300 transition-colors">
                        {sub.name} {sub.nickname ? `(${sub.nickname})` : ''}
                      </p>
                      <span className={`inline-block mt-1 text-[10px] px-2 py-0.2 rounded font-semibold border ${subPos.badgeColor}`}>
                        {subPos.nameTh.split('(')[0]}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-800 font-bold">
                      {sub.code}
                    </span>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-sky-50/40/50 flex items-center justify-between text-[11px] text-slate-800">
                    <span>ยอดขายส่วนตัว:</span>
                    <strong className="text-slate-900">{formatBaht(sub.personalMonthlySales)}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
