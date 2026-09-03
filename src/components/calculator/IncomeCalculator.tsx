import React, { useState } from 'react';
import { 
  Calculator, 
  DollarSign, 
  HelpCircle, 
  Layers, 
  TrendingUp, 
  Sliders, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Eye, 
  ArrowRight,
  Info,
  Building2,
  Users,
  Award,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CalculationType, Member } from '../../types';
import { runAllCalculationTests } from '../../engine/calculationTests';

export const IncomeCalculator: React.FC = () => {
  const { activeUser, members, calculateMemberIncome, activePlan } = useApp();

  const [calcMode, setCalcMode] = useState<CalculationType>('ACTUAL');
  const [selectedIncomeCard, setSelectedIncomeCard] = useState<any | null>(null);
  const [showTestModal, setShowTestModal] = useState(false);

  // Custom simulation overrides
  const [customParams, setCustomParams] = useState({
    personalFYC: activeUser.personalFYC,
    personalCOM: activeUser.personalCOM,
    teamFYC: 250000,
    teamCOM: 75000,
    firstYearPremium: activeUser.firstYearPremium,
    renewalPremium: activeUser.renewalPremium,
    separatedUnits: activeUser.separatedUnitsCount || 5,
    separatedCenters: activeUser.separatedCentersCount || 3,
    positionId: activeUser.positionId,
  });

  // Target member calculation (or simulated virtual member)
  const virtualMember: Member = {
    ...activeUser,
    positionId: customParams.positionId,
    personalFYC: calcMode === 'ACTUAL' ? activeUser.personalFYC : customParams.personalFYC,
    personalCOM: calcMode === 'ACTUAL' ? activeUser.personalCOM : customParams.personalCOM,
    firstYearPremium: calcMode === 'ACTUAL' ? activeUser.firstYearPremium : customParams.firstYearPremium,
    renewalPremium: calcMode === 'ACTUAL' ? activeUser.renewalPremium : customParams.renewalPremium,
    separatedUnitsCount: calcMode === 'ACTUAL' ? activeUser.separatedUnitsCount : customParams.separatedUnits,
    separatedCentersCount: calcMode === 'ACTUAL' ? activeUser.separatedCentersCount : customParams.separatedCenters,
  };

  const incomeResult = calculateMemberIncome(virtualMember, calcMode);

  // Run test suite
  const testResults = runAllCalculationTests();
  const allTestsPassed = testResults.every(t => t.passed);

  const getPositionBadge = (posId: string) => {
    switch (posId) {
      case 'region_manager': return { label: 'ผู้บริหารภาค (RM)', bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
      case 'center_manager': return { label: 'ผู้บริหารศูนย์ (CM)', bg: 'bg-blue-600/20 text-blue-600 border-blue-600/40' };
      case 'unit_manager': return { label: 'ผู้บริหารหน่วย (UM)', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      default: return { label: 'ตัวแทน (Agent)', bg: 'bg-sky-500/20 text-sky-300 border-sky-500/40' };
    }
  };

  const posBadge = getPositionBadge(virtualMember.positionId);

  return (
    <div id="income_calculator_view" className="space-y-6 max-w-7xl mx-auto pb-16 text-left">
      {/* 1. Header & Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-sky-50/90 border border-sky-100 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              เครื่องคำนวณผลประโยชน์และรายได้ (Income & Compensation Engine)
            </h1>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${posBadge.bg}`}>
              {posBadge.label}
            </span>
          </div>
          <p className="text-xs text-slate-700 mt-1">
            อิงตาม Compensation Plan เวอร์ชัน <span className="text-blue-600 font-mono font-bold">{activePlan.code}</span> (Update 15 Jan 64)
          </p>
        </div>

        {/* Action Buttons & Calculation Modes */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex p-1 rounded-xl bg-sky-50 border border-sky-100">
            <button
              onClick={() => setCalcMode('ACTUAL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                calcMode === 'ACTUAL' 
                  ? 'bg-blue-600 text-slate-950 shadow-md shadow-amber-500/20' 
                  : 'text-slate-700 hover:text-slate-800'
              }`}
            >
              ACTUAL (ผลงานจริง)
            </button>
            <button
              onClick={() => setCalcMode('PROJECTED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                calcMode === 'PROJECTED' 
                  ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20' 
                  : 'text-slate-700 hover:text-slate-800'
              }`}
            >
              PROJECTED (คาดการณ์)
            </button>
            <button
              onClick={() => setCalcMode('SIMULATION')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                calcMode === 'SIMULATION' 
                  ? 'bg-purple-500 text-slate-950 shadow-md shadow-purple-500/20' 
                  : 'text-slate-700 hover:text-slate-800'
              }`}
            >
              SIMULATION (จำลองตัวเลข)
            </button>
          </div>

          <button
            onClick={() => setShowTestModal(true)}
            className="px-3 py-2 rounded-xl bg-sky-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-sky-100 flex items-center gap-1.5 transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Rule Verification ({allTestsPassed ? '8/8 Passed' : 'Tests Alert'})</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Parameter Controls for Simulation Mode */}
      {calcMode !== 'ACTUAL' && (
        <div className="p-5 sm:p-6 rounded-2xl bg-sky-50/60 border border-purple-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-400" />
              <span className="text-xs sm:text-sm font-bold text-purple-200">
                ปรับแต่งตัวแปรผลงานจำลอง (Simulation Parameter Controller)
              </span>
            </div>
            <span className="text-[10px] text-slate-700">คำนวณและอัปเดตผลตอบแทนทันทีแบบเรียลไทม์</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Personal COM */}
            <div className="p-3 rounded-xl bg-sky-50 border border-sky-100">
              <div className="flex justify-between text-xs text-slate-700 mb-1">
                <span>บำเหน็จส่วนตัว (COM)</span>
                <span className="text-blue-600 font-bold">฿{customParams.personalCOM.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min={0}
                max={50000}
                step={1000}
                value={customParams.personalCOM}
                onChange={(e) => setCustomParams({ ...customParams, personalCOM: Number(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Team FYC */}
            <div className="p-3 rounded-xl bg-sky-50 border border-sky-100">
              <div className="flex justify-between text-xs text-slate-700 mb-1">
                <span>FYC ทั้งทีม (Team FYC)</span>
                <span className="text-sky-400 font-bold">฿{customParams.teamFYC.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min={20000}
                max={1500000}
                step={20000}
                value={customParams.teamFYC}
                onChange={(e) => setCustomParams({ ...customParams, teamFYC: Number(e.target.value) })}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>

            {/* Separated Units */}
            <div className="p-3 rounded-xl bg-sky-50 border border-sky-100">
              <div className="flex justify-between text-xs text-slate-700 mb-1">
                <span>จำนวนหน่วยแยก (Units)</span>
                <span className="text-emerald-400 font-bold">{customParams.separatedUnits} หน่วย</span>
              </div>
              <input
                type="range"
                min={0}
                max={20}
                step={1}
                value={customParams.separatedUnits}
                onChange={(e) => setCustomParams({ ...customParams, separatedUnits: Number(e.target.value) })}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Position Selector */}
            <div className="p-3 rounded-xl bg-sky-50 border border-sky-100">
              <div className="text-xs text-slate-700 mb-1.5">ตำแหน่งที่ใช้จำลอง (Simulated Rank)</div>
              <select
                value={customParams.positionId}
                onChange={(e) => setCustomParams({ ...customParams, positionId: e.target.value })}
                className="w-full bg-sky-50 border border-sky-100 rounded-lg px-2 py-1 text-xs text-slate-800 focus:outline-none"
              >
                <option value="agent">ตัวแทน (Agent)</option>
                <option value="unit_manager">ผู้บริหารหน่วย (UM)</option>
                <option value="center_manager">ผู้บริหารศูนย์ (CM)</option>
                <option value="region_manager">ผู้บริหารภาค (RM)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* 3. Hero Total Income Result Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500/10 via-sky-100 to-indigo-950/40 border border-blue-600/30 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600">
              รายได้รวมสุทธิจากการคำนวณ (TOTAL ESTIMATED INCOME)
            </span>
            <div className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mt-2 flex items-baseline gap-2">
              <span>฿{incomeResult.totalIncome.toLocaleString()}</span>
              <span className="text-sm sm:text-base font-medium text-slate-700">/ เดือน</span>
            </div>
            <p className="text-xs text-slate-700 mt-2">
              ประเมินรายได้รายปี (Annualized Run-Rate): <span className="text-blue-600 font-bold font-mono">฿{(incomeResult.totalIncome * 12).toLocaleString()}</span> บาท/ปี
            </p>
          </div>

          {/* Quick Metrics Badges */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-sky-50/80 border border-sky-100">
              <span className="text-slate-700 block text-[10px]">บำเหน็จส่วนตัว (Direct)</span>
              <span className="font-bold text-slate-800 text-sm">฿{incomeResult.breakdown.find(b => b.id.includes('direct') || b.id.includes('personal'))?.amount.toLocaleString() || '0'}</span>
            </div>
            <div className="p-3 rounded-2xl bg-sky-50/80 border border-sky-100">
              <span className="text-slate-700 block text-[10px]">ผลตอบแทนบริหารทีม (Override)</span>
              <span className="font-bold text-blue-600 text-sm">฿{(incomeResult.totalIncome - (incomeResult.breakdown.find(b => b.id.includes('direct') || b.id.includes('personal'))?.amount || 0)).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Full 13 Structured Income Category Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              ตารางแจกแจงผลประโยชน์ 13 รายการ (13 Income Categories Breakdown)
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-slate-700 border border-sky-100">
              {incomeResult.breakdown.length} รายการที่เข้าเกณฑ์
            </span>
          </div>
          <span className="text-[11px] text-slate-700">คลิกการ์ดเพื่อดูสูตรคำนวณและเกณฑ์ขั้นบันได</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {incomeResult.breakdown.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedIncomeCard(item)}
              className="p-4 rounded-2xl bg-sky-50/80 hover:bg-sky-50 border border-sky-100 hover:border-blue-600/50 cursor-pointer transition-all duration-200 group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    item.amount > 0 ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : 'bg-sky-100 text-slate-700'
                  }`}>
                    {item.amount > 0 ? 'Active' : 'Zero Base'}
                  </span>
                </div>

                <div className="text-xl font-extrabold text-blue-600 mt-2 font-mono">
                  ฿{item.amount.toLocaleString()}
                </div>

                <div className="text-[11px] text-slate-700 mt-1 line-clamp-2 leading-relaxed">
                  {item.description}
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-sky-100/80 flex items-center justify-between text-[10px] text-slate-700">
                <span className="font-mono truncate max-w-[180px]">สูตร: {item.rateOrFormula}</span>
                <span className="text-blue-600 font-semibold group-hover:underline flex items-center gap-0.5">
                  ดูสูตร <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Formula & Calculation Step Details Modal */}
      {selectedIncomeCard && (
        <div className="fixed inset-0 bg-sky-50/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-sky-50 border border-sky-100 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-sky-100">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  {selectedIncomeCard.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedIncomeCard(null)}
                className="w-7 h-7 rounded-lg bg-sky-100 text-slate-700 hover:text-slate-900 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-sky-50 border border-sky-100">
                <span className="text-[10px] text-slate-700 uppercase font-bold">ยอดเงินที่คำนวณได้</span>
                <div className="text-2xl font-black text-blue-600 font-mono mt-0.5">
                  ฿{selectedIncomeCard.amount.toLocaleString()} บาท
                </div>
              </div>

              <div className="p-3 rounded-xl bg-sky-50 border border-sky-100">
                <span className="text-[10px] text-slate-700 uppercase font-bold">อัตราและสูตรที่ใช้</span>
                <div className="text-xs font-semibold text-slate-800 font-mono mt-0.5">
                  {selectedIncomeCard.rateOrFormula}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-sky-50 border border-sky-100">
                <span className="text-[10px] text-slate-700 uppercase font-bold">หลักเกณฑ์และเงื่อนไข</span>
                <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                  {selectedIncomeCard.description}
                </p>
              </div>

              {selectedIncomeCard.tierApplied && (
                <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30">
                  <span className="text-[10px] text-indigo-300 uppercase font-bold">Tier ขั้นบันไดที่ตกผลึก</span>
                  <p className="text-xs text-indigo-200 mt-0.5 font-mono">
                    {selectedIncomeCard.tierApplied}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedIncomeCard(null)}
              className="w-full py-2.5 rounded-xl bg-sky-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}

      {/* 6. Rule Verification Modal */}
      {showTestModal && (
        <div className="fixed inset-0 bg-sky-50/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-sky-50 border border-sky-100 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-sky-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-slate-900">
                  Compensation Rule Engine Test Suite
                </h3>
              </div>
              <button
                onClick={() => setShowTestModal(false)}
                className="w-7 h-7 rounded-lg bg-sky-100 text-slate-700 hover:text-slate-900 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-700">
              ชุดการทดสอบคณิตศาสตร์ 8 ขั้น เพื่อยืนยันความถูกต้องของสูตรคำนวณตามเอกสารผลตอบแทน Update 15 Jan 64
            </p>

            <div className="space-y-2">
              {testResults.map((t, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-800">{t.testName}</div>
                    <div className="text-[10px] text-slate-700 font-mono">
                      Expected: ฿{t.expected.toLocaleString()} | Actual: ฿{t.actual.toLocaleString()}
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    t.passed ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  }`}>
                    {t.passed ? 'PASSED' : 'FAILED'}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowTestModal(false)}
              className="w-full py-2.5 rounded-xl bg-sky-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
            >
              ปิดผลการทดสอบ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
