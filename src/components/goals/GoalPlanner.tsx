import React, { useState, useMemo } from 'react';
import { 
  Target, 
  TrendingUp, 
  Users, 
  Building2, 
  Calendar, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Sparkles, 
  Calculator, 
  ArrowRight,
  ShieldCheck,
  Compass,
  Layers,
  Clock,
  DollarSign
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatNumber } from '../../utils/formatters';

export const GoalPlanner: React.FC = () => {
  const { members, activeUser, language } = useApp();

  // Goal Inputs State
  const [targetActiveMembers, setTargetActiveMembers] = useState<number>(500);
  const [targetTimeMonths, setTargetTimeMonths] = useState<number>(24);
  const [currentActiveMembers, setCurrentActiveMembers] = useState<number>(() => {
    return members.filter(m => m.status === 'active').length || 100;
  });
  const [monthlyRetentionRate, setMonthlyRetentionRate] = useState<number>(92); // 92% retention
  const [avgFycPerActiveMember, setAvgFycPerActiveMember] = useState<number>(35000); // 35k FYC/mo
  const [activationRate, setActivationRate] = useState<number>(75); // 75%
  const [selectedScenario, setSelectedScenario] = useState<'standard' | 'aggressive' | 'conservative'>('standard');

  // Realistic Calculation Model
  const calculation = useMemo(() => {
    const netMembersNeeded = Math.max(0, targetActiveMembers - currentActiveMembers);
    const months = Math.max(1, targetTimeMonths);
    
    // Retention decay & churn factor
    const monthlyChurnRate = (100 - monthlyRetentionRate) / 100;
    const effectiveActivation = activationRate / 100;

    // Approximate monthly recruits needed factoring in churn
    // Net growth per month = (Recruits * activation) - (Current * churn)
    const avgMembersInPeriod = (currentActiveMembers + targetActiveMembers) / 2;
    const totalChurnOverPeriod = avgMembersInPeriod * monthlyChurnRate * months;
    const totalRecruitsNeeded = Math.round((netMembersNeeded + totalChurnOverPeriod) / effectiveActivation);
    const monthlyRecruitsNeeded = Math.ceil(totalRecruitsNeeded / months);

    // Leadership requirement estimation:
    // 1 Unit per ~8-10 active agents
    // 1 Center per ~3-4 Units (~25-30 agents)
    // 1 Region per ~4 Centers (~100-120 agents)
    const estimatedUnits = Math.ceil(targetActiveMembers / 8);
    const estimatedCenters = Math.ceil(estimatedUnits / 3.5);
    const estimatedRegions = Math.ceil(estimatedCenters / 4);

    // Projected Output
    const projectedMonthlyFYC = targetActiveMembers * avgFycPerActiveMember;
    const projectedAnnualFYC = projectedMonthlyFYC * 12;
    const projectedMonthlyCOM = Math.round(projectedMonthlyFYC * 0.35);

    // Quarter milestones (e.g. Q1 to Q8 for 24 months)
    const milestoneSteps = Math.min(8, Math.max(4, Math.floor(months / 3)));
    const milestones = Array.from({ length: milestoneSteps }).map((_, idx) => {
      const stepMonth = Math.round(((idx + 1) / milestoneSteps) * months);
      const progressRatio = Math.pow((idx + 1) / milestoneSteps, 1.15); // Compound curve
      const milestoneTarget = Math.round(currentActiveMembers + (netMembersNeeded * progressRatio));
      const milestoneUnits = Math.ceil(milestoneTarget / 8);
      const milestoneCenters = Math.ceil(milestoneUnits / 3.5);

      return {
        step: idx + 1,
        month: stepMonth,
        name: `Month ${stepMonth}`,
        targetMembers: milestoneTarget,
        requiredUnits: milestoneUnits,
        requiredCenters: milestoneCenters,
        targetFYC: milestoneTarget * avgFycPerActiveMember,
      };
    });

    return {
      netMembersNeeded,
      totalRecruitsNeeded,
      monthlyRecruitsNeeded,
      estimatedUnits,
      estimatedCenters,
      estimatedRegions,
      projectedMonthlyFYC,
      projectedAnnualFYC,
      projectedMonthlyCOM,
      milestones,
    };
  }, [targetActiveMembers, targetTimeMonths, currentActiveMembers, monthlyRetentionRate, avgFycPerActiveMember, activationRate]);

  const applyPreset = (preset: 'standard' | 'aggressive' | 'conservative') => {
    setSelectedScenario(preset);
    if (preset === 'conservative') {
      setTargetActiveMembers(250);
      setTargetTimeMonths(24);
      setMonthlyRetentionRate(90);
      setActivationRate(70);
    } else if (preset === 'standard') {
      setTargetActiveMembers(500);
      setTargetTimeMonths(24);
      setMonthlyRetentionRate(92);
      setActivationRate(75);
    } else {
      setTargetActiveMembers(1000);
      setTargetTimeMonths(36);
      setMonthlyRetentionRate(95);
      setActivationRate(80);
    }
  };

  return (
    <div id="goal_planner_container" className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-50 via-indigo-950 to-slate-50 border border-indigo-500/20 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
              <Compass className="w-3.5 h-3.5 text-blue-600" />
              {language === 'th' ? 'ระบบวางแผนเป้าหมายองค์กรเชิงกลยุทธ์ (Strategic Goal Roadmap)' : 'Strategic Goal Roadmap & Requirements'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Target className="w-8 h-8 text-indigo-400" />
              {language === 'th' ? 'การวางแผนเป้าหมาย (Goal Planner)' : 'Network Goal Planner'}
            </h1>
            <p className="text-slate-700 text-sm max-w-2xl">
              {language === 'th'
                ? 'คำนวณย้อนกลับจากเป้าหมายสมาชิก Active: อัตราสรรหาต่อเดือน, อัตราคงอยู่ (Retention), โครงสร้างหน่วย/ศูนย์ที่ต้องแยก, และประมาณการผลงาน FYC รวม'
                : 'Backwards planning from target active members: recruitment rate, retention requirements, leadership milestones, and projected FYC production.'}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-sky-50 p-1.5 rounded-xl border border-sky-100 self-start md:self-auto">
            <button
              onClick={() => applyPreset('conservative')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedScenario === 'conservative' ? 'bg-slate-700 text-slate-900' : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              {language === 'th' ? 'ระมัดระวัง (250 คน)' : 'Conservative'}
            </button>
            <button
              onClick={() => applyPreset('standard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedScenario === 'standard' ? 'bg-indigo-600 text-slate-900 shadow-lg shadow-indigo-600/30' : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              {language === 'th' ? 'มาตรฐาน (500 คน)' : 'Standard (500)'}
            </button>
            <button
              onClick={() => applyPreset('aggressive')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedScenario === 'aggressive' ? 'bg-indigo-600 text-white shadow-lg shadow-amber-600/30' : 'text-slate-700 hover:text-white'
              }`}
            >
              {language === 'th' ? 'ก้าวกระโดด (1,000 คน)' : 'Aggressive (1k)'}
            </button>
          </div>
        </div>

        {/* 4 Summary Highlight Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-sky-100/80">
          <div className="bg-sky-50/60 p-3.5 rounded-xl border border-sky-100/60">
            <p className="text-xs text-indigo-300 font-medium">{language === 'th' ? 'เป้าหมายสมาชิก Active' : 'Target Active Members'}</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{formatNumber(targetActiveMembers)} <span className="text-xs text-slate-700 font-normal">คน</span></p>
            <p className="text-[11px] text-slate-700 mt-1">ในระยะเวลา {targetTimeMonths} เดือน</p>
          </div>

          <div className="bg-sky-50/60 p-3.5 rounded-xl border border-sky-100/60">
            <p className="text-xs text-blue-600 font-medium">{language === 'th' ? 'อัตราสรรหาที่ต้องทำ' : 'Required Recruits/Mo'}</p>
            <p className="text-2xl font-black text-blue-600 mt-1">{calculation.monthlyRecruitsNeeded} <span className="text-xs text-slate-700 font-normal">คน/เดือน</span></p>
            <p className="text-[11px] text-slate-700 mt-1">รวมทั้งสิ้น {formatNumber(calculation.totalRecruitsNeeded)} คน</p>
          </div>

          <div className="bg-sky-50/60 p-3.5 rounded-xl border border-sky-100/60">
            <p className="text-xs text-cyan-400 font-medium">{language === 'th' ? 'โครงสร้างผู้นำที่ต้องสร้าง' : 'Leadership Blueprint'}</p>
            <p className="text-2xl font-black text-cyan-400 mt-1">{calculation.estimatedUnits} <span className="text-xs text-slate-700 font-normal">หน่วย</span> / {calculation.estimatedCenters} <span className="text-xs text-slate-700 font-normal">ศูนย์</span></p>
            <p className="text-[11px] text-slate-700 mt-1">สร้าง {calculation.estimatedRegions} ภาคใหญ่</p>
          </div>

          <div className="bg-sky-50/60 p-3.5 rounded-xl border border-sky-100/60">
            <p className="text-xs text-emerald-400 font-medium">{language === 'th' ? 'ประมาณการ FYC รายเดือน' : 'Projected Monthly FYC'}</p>
            <p className="text-2xl font-black text-emerald-400 mt-1">{formatCurrency(calculation.projectedMonthlyFYC)}</p>
            <p className="text-[11px] text-slate-700 mt-1">~{formatCurrency(calculation.projectedAnnualFYC)} / ปี</p>
          </div>
        </div>
      </div>

      {/* Main Form & Calculation Engine Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive Parameters */}
        <div className="bg-sky-50 border border-sky-100 rounded-2xl p-6 space-y-5 shadow-xl">
          <div className="border-b border-sky-100 pb-3 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-indigo-400" />
            <h2 className="font-bold text-slate-900 text-base">{language === 'th' ? 'ตั้งค่าเป้าหมายและสมมติฐาน' : 'Goal Inputs & Assumptions'}</h2>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <label className="text-slate-700 font-medium">{language === 'th' ? 'เป้าหมายสมาชิก Active สิ้นสุด' : 'Target Active Members'}</label>
                <span className="font-bold text-indigo-400">{targetActiveMembers} คน</span>
              </div>
              <input
                type="range"
                min={50}
                max={2500}
                step={25}
                value={targetActiveMembers}
                onChange={(e) => setTargetActiveMembers(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <label className="text-slate-700 font-medium">{language === 'th' ? 'กรอบเวลาเป้าหมาย (เดือน)' : 'Timeline Duration (Months)'}</label>
                <span className="font-bold text-blue-600">{targetTimeMonths} เดือน ({Math.round(targetTimeMonths/12 * 10)/10} ปี)</span>
              </div>
              <input
                type="range"
                min={6}
                max={60}
                step={6}
                value={targetTimeMonths}
                onChange={(e) => setTargetTimeMonths(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <label className="text-slate-700 font-medium">{language === 'th' ? 'สมาชิก Active ปัจจุบัน' : 'Current Active Baseline'}</label>
                <span className="font-bold text-slate-800">{currentActiveMembers} คน</span>
              </div>
              <input
                type="number"
                value={currentActiveMembers}
                onChange={(e) => setCurrentActiveMembers(Math.max(0, Number(e.target.value)))}
                className="w-full bg-sky-50 border border-sky-100 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="pt-3 border-t border-sky-100 space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <label className="text-slate-700 font-medium">{language === 'th' ? 'อัตราคงอยู่รายเดือน (Monthly Retention)' : 'Monthly Retention Rate'}</label>
                  <span className="font-bold text-emerald-400">{monthlyRetentionRate}%</span>
                </div>
                <input
                  type="range"
                  min={80}
                  max={99}
                  step={1}
                  value={monthlyRetentionRate}
                  onChange={(e) => setMonthlyRetentionRate(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <p className="text-[11px] text-slate-700 mt-1">Churn Rate: {100 - monthlyRetentionRate}% ต่อเดือน</p>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <label className="text-slate-700 font-medium">{language === 'th' ? 'อัตราเริ่มงานจริง (Activation Rate)' : 'Activation Rate'}</label>
                  <span className="font-bold text-cyan-400">{activationRate}%</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={95}
                  step={5}
                  value={activationRate}
                  onChange={(e) => setActivationRate(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <label className="text-slate-700 font-medium">{language === 'th' ? 'FYC เฉลี่ยต่อคนต่อเดือน (บาท)' : 'Avg FYC per Active Member'}</label>
                  <span className="font-bold text-emerald-300">{formatCurrency(avgFycPerActiveMember)}</span>
                </div>
                <input
                  type="number"
                  step={5000}
                  value={avgFycPerActiveMember}
                  onChange={(e) => setAvgFycPerActiveMember(Math.max(1000, Number(e.target.value)))}
                  className="w-full bg-sky-50 border border-sky-100 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 space-y-1">
            <p className="font-semibold flex items-center gap-1.5 text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              {language === 'th' ? 'สูตรคณิตศาสตร์เครือข่าย' : 'Network Math Principle'}
            </p>
            <p className="text-slate-700 leading-relaxed text-[11px]">
              {language === 'th'
                ? 'คำนวณแบบ Realistic Churn Decay: การรักษา Retention ให้อยู่ในระดับ 92%+ ช่วยลดภาระการสรรหาใหม่ลงได้มากกว่า 40% ในระยะยาว'
                : 'High retention significantly reduces recruitment burden by compounding existing team production.'}
            </p>
          </div>
        </div>

        {/* Right 2 Columns: Milestone Roadmap & Action Plan */}
        <div className="lg:col-span-2 space-y-6">
          {/* Milestone Step Table */}
          <div className="bg-sky-50 border border-sky-100 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-sky-100 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">{language === 'th' ? 'แผนขั้นบันไดสู่ความสำเร็จ (Milestone Roadmap)' : 'Execution Roadmap'}</h3>
              </div>
              <span className="text-xs text-slate-700">{calculation.milestones.length} หมุดหมายสำคัญ</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-sky-100 text-slate-700">
                    <th className="py-2.5 px-3 font-semibold">{language === 'th' ? 'หมุดหมาย' : 'Checkpoint'}</th>
                    <th className="py-2.5 px-3 font-semibold">{language === 'th' ? 'สมาชิกเป้าหมาย' : 'Active Target'}</th>
                    <th className="py-2.5 px-3 font-semibold">{language === 'th' ? 'โครงสร้างหน่วย' : 'Required Units'}</th>
                    <th className="py-2.5 px-3 font-semibold">{language === 'th' ? 'โครงสร้างศูนย์' : 'Required Centers'}</th>
                    <th className="py-2.5 px-3 font-semibold text-right">{language === 'th' ? 'FYC ประมาณการ/เดือน' : 'Projected FYC/mo'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {calculation.milestones.map((m) => (
                    <tr key={m.step} className="hover:bg-sky-100/40 transition-all">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center text-[11px] border border-indigo-500/40">
                            {m.step}
                          </span>
                          <span className="font-medium text-slate-800">{m.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900">{m.targetMembers} คน</span>
                      </td>
                      <td className="py-3 px-3 text-cyan-300 font-medium">
                        {m.requiredUnits} หน่วย
                      </td>
                      <td className="py-3 px-3 text-indigo-300 font-medium">
                        {m.requiredCenters} ศูนย์
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-emerald-400">
                        {formatCurrency(m.targetFYC)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Strategic Action Directives */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs">
                <Users className="w-4 h-4" />
                <span>{language === 'th' ? 'แผนงานด้านการสรรหา (Recruitment)' : 'Recruitment Cadence'}</span>
              </div>
              <p className="text-xs text-slate-700">
                ต้องรักษาอัตราการรับสมัครใหม่อย่างน้อย <strong className="text-blue-600">{calculation.monthlyRecruitsNeeded} คน/เดือน</strong> ทั่วทั้งองค์กร หรือเฉลี่ย 1 คนต่อเดือนสำหรับตัวแทนหลัก
              </p>
            </div>

            <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>{language === 'th' ? 'การรักษาอัตราคงอยู่ (Retention Guard)' : 'Retention Guard'}</span>
              </div>
              <p className="text-xs text-slate-700">
                จัดอบรมเพิ่มทักษะและประชุมประกบตัวแทนใหม่อย่างสม่ำเสมอ เพื่อคุม Churn ไม่ให้เกิน <strong className="text-rose-400">{100 - monthlyRetentionRate}% ต่อเดือน</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
