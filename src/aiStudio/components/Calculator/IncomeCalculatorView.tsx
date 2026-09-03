import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Sliders,
  DollarSign,
  TrendingUp,
  Download,
  Info,
  CheckCircle,
  Clock,
  Layers,
  ArrowRight,
  ShieldCheck,
  Building,
  Users,
  Award,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Member, PositionLevel, ScenarioSimulation } from '../../types';
import { POSITIONS_LIST } from '../../rules/defaultRules';
import { calculateMemberIncome } from '../../rules/engine';
import { formatBaht, formatPercent, formatNumber } from '../../lib/decimal';
import { exportIncomeReportToExcel, exportIncomeReportToPDF } from '../../utils/exportReports';

export const IncomeCalculatorView: React.FC = () => {
  const {
    selectedMember,
    selectedMemberResult: liveResult,
    members,
    rules,
    setSelectedMemberId,
  } = useApp();

  const [mode, setMode] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');
  const [activeTab, setActiveTab] = useState<'LIVE_MEMBER' | 'SCENARIO_COMPARISON'>('LIVE_MEMBER');

  // Custom instant sandbox values (if user wants to tweak live without saving)
  const [customPosition, setCustomPosition] = useState<PositionLevel>(selectedMember?.position || 'UNIT_MANAGER');
  const [customPersonalSales, setCustomPersonalSales] = useState<number>(selectedMember?.personalMonthlySales || 40000);
  const [customPersonalCom, setCustomPersonalCom] = useState<number>(selectedMember?.personalMonthlyCom || 14000);
  const [customPersonalFyc, setCustomPersonalFyc] = useState<number>(selectedMember?.personalMonthlyFyc || 28000);
  const [customRenewalPremium, setCustomRenewalPremium] = useState<number>(selectedMember?.personalRenewalPremium || 250000);
  const [customSeparatedUnits, setCustomSeparatedUnits] = useState<number>(selectedMember?.directUnitCount || 2);
  const [customSeparatedCenters, setCustomSeparatedCenters] = useState<number>(selectedMember?.directCenterCount || 1);
  const [customTeamSize, setCustomTeamSize] = useState<number>(10);
  const [customAvgSalesPerMember, setCustomAvgSalesPerMember] = useState<number>(30000);

  // Synchronize when selected member changes
  React.useEffect(() => {
    if (selectedMember) {
      setCustomPosition(selectedMember.position);
      setCustomPersonalSales(selectedMember.personalMonthlySales);
      setCustomPersonalCom(selectedMember.personalMonthlyCom);
      setCustomPersonalFyc(selectedMember.personalMonthlyFyc);
      setCustomRenewalPremium(selectedMember.personalRenewalPremium);
      setCustomSeparatedUnits(selectedMember.directUnitCount || 0);
      setCustomSeparatedCenters(selectedMember.directCenterCount || 0);
    }
  }, [selectedMember]);

  // Compute sandbox result
  const sandboxResult = useMemo(() => {
    const syntheticSubordinates: Member[] = [];
    const subordinateCount = Math.max(0, customTeamSize - 1);
    
    for (let i = 1; i <= subordinateCount; i++) {
      const isSubCenter = i <= customSeparatedCenters;
      const isSubUnit = !isSubCenter && i <= (customSeparatedCenters + customSeparatedUnits);
      
      syntheticSubordinates.push({
        id: `sb-child-${i}`,
        code: `SB-C${i}`,
        name: `สมาชิกทีมงานที่ ${i}`,
        position: isSubCenter ? 'CENTER_MANAGER' : isSubUnit ? 'UNIT_MANAGER' : 'AGENT',
        parentId: 'sb-root',
        personalMonthlySales: customAvgSalesPerMember,
        personalMonthlyCom: customAvgSalesPerMember * 0.35,
        personalMonthlyFyc: customAvgSalesPerMember * 0.70,
        personalRenewalPremium: customAvgSalesPerMember * 2.5,
        personalAnnualFyc: customAvgSalesPerMember * 0.70 * 12,
        personalAnnualCom: customAvgSalesPerMember * 0.35 * 12,
        monthlyGoalIncome: 35000,
        annualGoalIncome: 420000,
        monthlyGoalFyc: 25000,
        annualGoalFyc: 300000,
        startDate: '2023-01-01',
        tenureMonths: 12,
        isActive: true,
      });
    }

    const syntheticRoot: Member = {
      id: 'sb-root',
      code: 'SB-LIVE',
      name: selectedMember?.name || 'ทดสอบการคำนวณ',
      position: customPosition,
      parentId: null,
      directUnitCount: customSeparatedUnits,
      directCenterCount: customSeparatedCenters,
      directGroupCount: 0,
      personalMonthlySales: customPersonalSales,
      personalMonthlyCom: customPersonalCom,
      personalMonthlyFyc: customPersonalFyc,
      personalRenewalPremium: customRenewalPremium,
      personalAnnualFyc: customPersonalFyc * 12,
      personalAnnualCom: customPersonalCom * 12,
      monthlyGoalIncome: 100000,
      annualGoalIncome: 1200000,
      monthlyGoalFyc: 50000,
      annualGoalFyc: 600000,
      startDate: '2023-01-01',
      tenureMonths: 18,
      isActive: true,
    };

    return calculateMemberIncome(syntheticRoot, [syntheticRoot, ...syntheticSubordinates], rules);
  }, [
    customPosition,
    customPersonalSales,
    customPersonalCom,
    customPersonalFyc,
    customRenewalPremium,
    customSeparatedUnits,
    customSeparatedCenters,
    customTeamSize,
    customAvgSalesPerMember,
    rules,
    selectedMember,
  ]);

  // 3 Pre-built Scenarios: 5 members, 20 members, 100 members
  const scenarios: ScenarioSimulation[] = useMemo(() => {
    const scList = [
      {
        id: 'SC-5',
        name: 'ทีมขนาดเล็ก (5 คน)',
        description: 'ผู้บริหารหน่วย ขยายทีมเริ่มต้น 5 คน ยอดขายเฉลี่ยคนละ 30,000 บาท/ด',
        teamSize: 5,
        activeRate: 80,
        avgFycPerPerson: 21000,
        position: 'UNIT_MANAGER' as PositionLevel,
        separatedUnits: 1,
        separatedCenters: 0,
        renewalPremium: 200000,
      },
      {
        id: 'SC-20',
        name: 'ทีมขนาดกลาง (20 คน)',
        description: 'ผู้บริหารศูนย์ ดูแล 20 คน แยก 3 หน่วย 1 ศูนย์ ยอดขายเฉลี่ย 35,000 บาท/ด',
        teamSize: 20,
        activeRate: 75,
        avgFycPerPerson: 24500,
        position: 'CENTER_MANAGER' as PositionLevel,
        separatedUnits: 3,
        separatedCenters: 1,
        renewalPremium: 950000,
      },
      {
        id: 'SC-100',
        name: 'สายงานขนาดใหญ่ (100 คน)',
        description: 'ผู้บริหารภาค ดูแลเครือข่าย 100 คน แยก 10 หน่วย 4 ศูนย์ ยอดขายเฉลี่ย 40,000 บาท/ด',
        teamSize: 100,
        activeRate: 70,
        avgFycPerPerson: 28000,
        position: 'GROUP_MANAGER' as PositionLevel,
        separatedUnits: 10,
        separatedCenters: 4,
        renewalPremium: 4500000,
      },
    ];

    return scList.map(sc => {
      const activeCount = Math.round(sc.teamSize * (sc.activeRate / 100));
      const totalSales = activeCount * (sc.avgFycPerPerson / 0.7);
      const totalCom = totalSales * 0.35;
      const totalFyc = totalSales * 0.70;

      const synRoot: Member = {
        id: `sc-root-${sc.id}`,
        code: sc.id,
        name: sc.name,
        position: sc.position,
        parentId: null,
        directUnitCount: sc.separatedUnits,
        directCenterCount: sc.separatedCenters,
        directGroupCount: 0,
        personalMonthlySales: 40000,
        personalMonthlyCom: 14000,
        personalMonthlyFyc: 28000,
        personalRenewalPremium: sc.renewalPremium,
        personalAnnualFyc: totalFyc * 12,
        personalAnnualCom: totalCom * 12,
        monthlyGoalIncome: 200000,
        annualGoalIncome: 2400000,
        monthlyGoalFyc: 100000,
        annualGoalFyc: 1200000,
        startDate: '2022-01-01',
        tenureMonths: 24,
        isActive: true,
      };

      const synSubs = [];
      for (let i = 1; i <= activeCount; i++) {
        synSubs.push({
          id: `sc-sub-${sc.id}-${i}`,
          code: `SC-S${i}`,
          name: `ตัวแทน ${i}`,
          position: i <= sc.separatedCenters ? 'CENTER_MANAGER' as PositionLevel : i <= sc.separatedUnits ? 'UNIT_MANAGER' as PositionLevel : 'AGENT' as PositionLevel,
          parentId: synRoot.id,
          personalMonthlySales: sc.avgFycPerPerson / 0.7,
          personalMonthlyCom: (sc.avgFycPerPerson / 0.7) * 0.35,
          personalMonthlyFyc: sc.avgFycPerPerson,
          personalRenewalPremium: sc.renewalPremium / sc.teamSize,
          personalAnnualFyc: sc.avgFycPerPerson * 12,
          personalAnnualCom: (sc.avgFycPerPerson / 0.7) * 0.35 * 12,
          monthlyGoalIncome: 30000,
          annualGoalIncome: 360000,
          monthlyGoalFyc: 20000,
          annualGoalFyc: 240000,
          startDate: '2023-01-01',
          tenureMonths: 12,
          isActive: true,
        });
      }

      const res = calculateMemberIncome(synRoot, [synRoot, ...synSubs], rules);

      return {
        ...sc,
        calculatedMonthlyIncome: res.totalMonthlyIncome,
        calculatedAnnualIncome: res.totalAnnualIncome,
      };
    });
  }, [rules]);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header & Toggle Tabs */}
      <div className="bg-sky-50/90 border border-sky-100 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <Calculator className="w-6 h-6 text-blue-600" />
            เครื่องคำนวณผลประโยชน์และจำลองรายได้แบบโปร่งใส
          </h1>
          <p className="text-xs text-slate-700 mt-1">
            คำนวณรายได้ตามกติกาจริง พร้อมแสดงสูตรคณิตศาสตร์ ฐานผลงาน และอัตราเปอร์เซ็นต์ทุกรายการ
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto">
          <div className="flex bg-sky-100 rounded-xl p-1 border border-sky-100">
            <button
              onClick={() => setActiveTab('LIVE_MEMBER')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'LIVE_MEMBER' ? 'bg-blue-600 text-slate-900 shadow' : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              เครื่องคำนวณแบบสด
            </button>
            <button
              onClick={() => setActiveTab('SCENARIO_COMPARISON')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'SCENARIO_COMPARISON' ? 'bg-blue-600 text-slate-900 shadow' : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              เปรียบเทียบ 3 สถานการณ์
            </button>
          </div>

          <div className="flex bg-sky-100 rounded-xl p-1 border border-sky-100">
            <button
              onClick={() => setMode('MONTHLY')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mode === 'MONTHLY' ? 'bg-blue-600 text-slate-950 shadow' : 'text-slate-700 hover:text-white'
              }`}
            >
              รายเดือน
            </button>
            <button
              onClick={() => setMode('ANNUAL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mode === 'ANNUAL' ? 'bg-blue-600 text-slate-950 shadow' : 'text-slate-700 hover:text-white'
              }`}
            >
              รายปี (+โบนัส)
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'LIVE_MEMBER' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Interactive Numeric Sliders & Controls */}
          <div className="bg-sky-50/90 border border-sky-100 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-sky-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-400" />
                พารามิเตอร์จำลองผลงาน
              </h2>
              <span className="text-[11px] text-blue-600 font-semibold bg-amber-950/80 px-2 py-0.5 rounded border border-amber-600/40">
                คำนวณแบบเรียลไทม์
              </span>
            </div>

            {/* Position Select */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                ระดับตำแหน่ง (Position Level)
              </label>
              <select
                value={customPosition}
                onChange={e => setCustomPosition(e.target.value as PositionLevel)}
                className="w-full bg-sky-100 border border-sky-100 text-xs text-slate-900 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {POSITIONS_LIST.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nameTh}
                  </option>
                ))}
              </select>
            </div>

            {/* Personal Sales */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-700">ผลงานขายส่วนตัว / เดือน:</span>
                <strong className="text-blue-600">{formatBaht(customPersonalSales)}</strong>
              </div>
              <input
                type="range"
                min={0}
                max={200000}
                step={5000}
                value={customPersonalSales}
                onChange={e => {
                  const val = Number(e.target.value);
                  setCustomPersonalSales(val);
                  setCustomPersonalCom(val * 0.35);
                  setCustomPersonalFyc(val * 0.70);
                }}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Personal COM */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-700">COM ส่วนตัวรายเดือน:</span>
                <strong className="text-blue-400">{formatBaht(customPersonalCom)}</strong>
              </div>
              <input
                type="range"
                min={0}
                max={150000}
                step={2500}
                value={customPersonalCom}
                onChange={e => setCustomPersonalCom(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>

            {/* Renewal Premium */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-700">เบี้ยปีต่อไป (Renewal Premium):</span>
                <strong className="text-emerald-400">{formatBaht(customRenewalPremium)}</strong>
              </div>
              <input
                type="range"
                min={0}
                max={2000000}
                step={50000}
                value={customRenewalPremium}
                onChange={e => setCustomRenewalPremium(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Team Size */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-700">จำนวนสมาชิกในสายงาน (คน):</span>
                <strong className="text-purple-300">{customTeamSize} คน</strong>
              </div>
              <input
                type="range"
                min={1}
                max={150}
                step={1}
                value={customTeamSize}
                onChange={e => setCustomTeamSize(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            {/* Separated Units & Centers */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-sky-100">
              <div>
                <label className="text-[11px] text-slate-700 block mb-1">แยกหน่วย (หน่วย):</label>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={customSeparatedUnits}
                  onChange={e => setCustomSeparatedUnits(Number(e.target.value))}
                  className="w-full bg-sky-100 border border-sky-100 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-700 block mb-1">แยกศูนย์ (ศูนย์):</label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={customSeparatedCenters}
                  onChange={e => setCustomSeparatedCenters(Number(e.target.value))}
                  className="w-full bg-sky-100 border border-sky-100 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none"
                />
              </div>
            </div>

            {/* Export Buttons */}
            <div className="pt-3 border-t border-sky-100 flex gap-2">
              <button
                onClick={() => exportIncomeReportToExcel(selectedMember || (members[0]), sandboxResult, members, rules)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 text-xs font-semibold border border-emerald-700/60 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Excel</span>
              </button>
              <button
                onClick={() => exportIncomeReportToPDF(selectedMember || (members[0]), sandboxResult, rules)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-900/80 hover:bg-rose-800 text-rose-200 text-xs font-semibold border border-rose-700/60 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export PDF</span>
              </button>
            </div>
          </div>

          {/* Right 2 Columns: Grand Total Card & Transparent Line Items Table */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Grand Total Result Display Banner */}
            <div className="bg-gradient-to-r from-blue-950 via-sky-100 to-indigo-950 border-2 border-blue-500/60 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                    {mode === 'MONTHLY' ? 'รายได้รวมประมาณการต่อเดือน' : 'รายได้รวมประมาณการทั้งปี (รวมโบนัส)'}
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-blue-600 mt-1 tracking-tight">
                    {formatBaht(mode === 'MONTHLY' ? sandboxResult.totalMonthlyIncome : sandboxResult.totalAnnualIncome)}
                  </div>
                  <p className="text-xs text-slate-700 mt-1">
                    ยอดขายรวมทั้งทีม: <strong className="text-slate-900">{formatBaht(sandboxResult.teamTotalMonthlySales)}</strong> (สมาชิก {sandboxResult.teamMemberCount} คน)
                  </p>
                </div>

                <div className="text-right sm:border-l sm:border-sky-100 sm:pl-6">
                  <div className="text-xs text-slate-700">โบนัสประจำปีประมาณการ</div>
                  <div className="text-lg font-bold text-emerald-400 mt-0.5">
                    +{formatBaht(sandboxResult.annualBonusTotal)}
                  </div>
                  <span className="inline-block mt-1 text-[10px] font-semibold text-slate-700 bg-sky-100 px-2 py-0.5 rounded">
                    สูตรอิงเอกสาร 15 ม.ค. 2564
                  </span>
                </div>
              </div>
            </div>

            {/* Line Items Table with Complete Formula Details */}
            <div className="bg-sky-50/90 border border-sky-100 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-blue-600" />
                    ตารางรายละเอียดสูตรคำนวณ ({sandboxResult.breakdown.length} รายการ)
                  </h2>
                  <p className="text-xs text-slate-700">
                    แสดงรหัสหมวดหมู่ ฐานที่ใช้คำนวณ อัตรา ผลลัพธ์ และที่มาของผลงานโดยไม่นับซ้ำ
                  </p>
                </div>
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-700/60 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> ตรวจสอบความถูกต้องแล้ว
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-sky-100/80 text-slate-700 border-b border-sky-100">
                      <th className="py-3 px-3 font-bold">หมวดหมู่รายได้</th>
                      <th className="py-3 px-3 font-bold">รหัสขั้น / กติกา</th>
                      <th className="py-3 px-3 font-bold text-right">ฐานคำนวณ (฿)</th>
                      <th className="py-3 px-3 font-bold text-center">อัตรา</th>
                      <th className="py-3 px-3 font-bold text-right">ยอดคำนวณ (฿)</th>
                      <th className="py-3 px-3 font-bold">สูตรและที่มา</th>
                      <th className="py-3 px-3 font-bold text-center">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {sandboxResult.breakdown.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-sky-100/50 transition-colors">
                        <td className="py-3 px-3 font-semibold text-slate-900">
                          {item.categoryNameTh}
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-700">
                          {item.tierOrRuleId}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-800">
                          {item.baseAmount > 0 ? formatNumber(item.baseAmount) : '-'}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-blue-400">
                          {item.isPercentage ? `${item.rateOrAmount}%` : formatBaht(item.rateOrAmount, false)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-blue-600">
                          {formatBaht(item.calculatedAmount)}
                        </td>
                        <td className="py-3 px-3 text-slate-700 text-[11px] max-w-xs">
                          <p>{item.formulaDescription}</p>
                          {item.sourceMemberName && (
                            <span className="text-[10px] text-slate-700 block mt-0.5">
                              ที่มา: {item.sourceMemberName}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {item.status === 'CONFIRMED' ? (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                              ผ่านเกณฑ์
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-blue-600 border border-amber-700">
                              รอตรวจสอบ
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-sky-100/90 font-bold border-t-2 border-sky-100">
                      <td colSpan={4} className="py-3 px-3 text-right text-slate-900">
                        รายได้รวมต่อเดือนสุทธิ:
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-blue-600 text-sm">
                        {formatBaht(sandboxResult.totalMonthlyIncome)}
                      </td>
                      <td colSpan={2} className="py-3 px-3 text-[11px] text-slate-700">
                        (คำนวณจาก Decimal Precision ปัดเศษ 2 ตำแหน่ง)
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* 3 Scenarios Comparison Table */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {scenarios.map(sc => (
              <div
                key={sc.id}
                className="bg-sky-50/90 border border-sky-100 hover:border-blue-500/60 rounded-2xl p-6 shadow-xl transition-all relative overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-blue-400 bg-blue-950/80 px-2.5 py-0.5 rounded-full border border-blue-700/60">
                      {sc.name}
                    </span>
                    <span className="text-xs font-mono text-slate-700">{sc.position}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-2">{sc.description}</h3>

                  <div className="my-4 p-4 rounded-xl bg-sky-50/80 border border-sky-100/80">
                    <span className="text-xs text-slate-700 block">รายได้ประมาณการ / เดือน:</span>
                    <div className="text-2xl font-black text-blue-600 mt-1">
                      {formatBaht(sc.calculatedMonthlyIncome)}
                    </div>
                    <div className="text-xs text-slate-700 mt-2 flex justify-between">
                      <span>รายได้ทั้งปี:</span>
                      <strong>{formatBaht(sc.calculatedAnnualIncome)}</strong>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-700">ขนาดทีม:</span>
                      <strong>{sc.teamSize} คน (Active {sc.activeRate}%)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700">จำนวนหน่วยแยก:</span>
                      <strong>{sc.separatedUnits} หน่วย</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700">จำนวนศูนย์แยก:</span>
                      <strong>{sc.separatedCenters} ศูนย์</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700">พอร์ตเบี้ยปีต่อไป:</span>
                      <strong>{formatBaht(sc.renewalPremium)}</strong>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setCustomPosition(sc.position);
                    setCustomTeamSize(sc.teamSize);
                    setCustomSeparatedUnits(sc.separatedUnits);
                    setCustomSeparatedCenters(sc.separatedCenters);
                    setCustomRenewalPremium(sc.renewalPremium);
                    setActiveTab('LIVE_MEMBER');
                  }}
                  className="w-full mt-5 py-2 px-3 rounded-xl bg-sky-100 hover:bg-slate-200 text-xs font-semibold text-slate-900 border border-sky-100 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <span>นำเข้าสถานการณ์นี้</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
