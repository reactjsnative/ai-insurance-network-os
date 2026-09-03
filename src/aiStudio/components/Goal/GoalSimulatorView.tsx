import React, { useState, useMemo } from 'react';
import {
  Target,
  TrendingUp,
  Users,
  Building,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { simulateGoalRoadmap } from '../../rules/goalEngine';
import { formatBaht, formatNumber, formatPercent } from '../../lib/decimal';

export const GoalSimulatorView: React.FC = () => {
  const { rules, selectedMember } = useApp();

  const [targetIncome, setTargetIncome] = useState<number>(selectedMember?.monthlyGoalIncome || 150000);
  const [newRecruitsPerMonth, setNewRecruitsPerMonth] = useState<number>(2);
  const [avgSalesPerPerson, setAvgSalesPerPerson] = useState<number>(30000);
  const [activeRate, setActiveRate] = useState<number>(75);
  const [simulationMonths, setSimulationMonths] = useState<number>(12);
  const [currentTeamSize, setCurrentTeamSize] = useState<number>(3);

  // Run simulation
  const result = useMemo(() => {
    return simulateGoalRoadmap(
      {
        targetMonthlyIncome: targetIncome,
        newRecruitsPerMonth,
        avgPersonalSalesPerPerson: avgSalesPerPerson,
        activeRatePercent: activeRate,
        simulationMonths,
        currentTeamSize,
      },
      rules
    );
  }, [targetIncome, newRecruitsPerMonth, avgSalesPerPerson, activeRate, simulationMonths, currentTeamSize, rules]);

  // Trigger celebration confetti
  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner */}
      <div className="bg-sky-50/90 border border-sky-100 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <Target className="w-6 h-6 text-blue-600" />
            ระบบคำนวณย้อนกลับและจำลองเป้าหมาย (Reverse Goal Simulator)
          </h1>
          <p className="text-xs text-slate-700 mt-1">
            ระบุรายได้ที่คุณต้องการ แล้วระบบจะวิเคราะห์ขนาดทีม โครงสร้างหน่วย/ศูนย์ และแผนงานที่ต้องทำอย่างแม่นยำ
          </p>
        </div>

        <button
          onClick={triggerConfetti}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-slate-950 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>จำลองการฉลองความสำเร็จ!</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Input Form */}
        <div className="bg-sky-50/90 border border-sky-100 rounded-2xl p-6 shadow-xl space-y-5">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-sky-100">
            <Zap className="w-4 h-4 text-blue-600" />
            ตั้งค่าเป้าหมายและสมมติฐาน
          </h2>

          {/* Target Income Input */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              รายได้เป้าหมายต่อเดือน (บาท):
            </label>
            <div className="text-2xl font-black text-blue-600 mb-2">
              {formatBaht(targetIncome)}
            </div>
            <div className="grid grid-cols-3 gap-1.5 mb-2">
              {[50000, 100000, 200000, 350000, 500000, 1000000].map(amt => (
                <button
                  key={amt}
                  onClick={() => setTargetIncome(amt)}
                  className={`py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                    targetIncome === amt
                      ? 'bg-blue-600 text-slate-950 border-blue-400'
                      : 'bg-sky-100 text-slate-700 border-sky-100 hover:bg-slate-200'
                  }`}
                >
                  {amt >= 1000000 ? `${amt / 1000000}M` : `${amt / 1000}k`}
                </button>
              ))}
            </div>
            <input
              type="range"
              min={30000}
              max={1500000}
              step={10000}
              value={targetIncome}
              onChange={e => setTargetIncome(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* New recruits per month */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-700">สมาชิกใหม่เพิ่มต่อเดือน:</span>
              <strong className="text-blue-400">+{newRecruitsPerMonth} คน/ด</strong>
            </div>
            <input
              type="range"
              min={0}
              max={15}
              step={1}
              value={newRecruitsPerMonth}
              onChange={e => setNewRecruitsPerMonth(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          {/* Avg Sales per person */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-700">ผลงานขายเฉลี่ยต่อคน:</span>
              <strong className="text-emerald-400">{formatBaht(avgSalesPerPerson)}/ด</strong>
            </div>
            <input
              type="range"
              min={15000}
              max={100000}
              step={5000}
              value={avgSalesPerPerson}
              onChange={e => setAvgSalesPerPerson(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Active rate % */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-700">อัตราสมาชิก Active:</span>
              <strong className="text-purple-300">{activeRate}%</strong>
            </div>
            <input
              type="range"
              min={30}
              max={100}
              step={5}
              value={activeRate}
              onChange={e => setActiveRate(Number(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
          </div>

          {/* Simulation duration */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-700">ระยะเวลาจำลอง:</span>
              <strong className="text-slate-900">{simulationMonths} เดือน</strong>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[6, 12, 18, 24].map(m => (
                <button
                  key={m}
                  onClick={() => setSimulationMonths(m)}
                  className={`py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                    simulationMonths === m
                      ? 'bg-blue-600 text-slate-900 border-blue-500'
                      : 'bg-sky-100 text-slate-700 border-sky-100 hover:bg-slate-200'
                  }`}
                >
                  {m} เดือน
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Calculated Reverse Requirements & Projected Chart */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Solution Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            
            <div className="bg-sky-50/90 border border-sky-100 rounded-2xl p-4 shadow-lg text-center">
              <span className="text-[11px] text-slate-700 block mb-1">ระยะเวลาที่ต้องใช้</span>
              <div className="text-xl sm:text-2xl font-black text-blue-600">
                {result.monthsToReachGoal <= simulationMonths ? `${result.monthsToReachGoal} เดือน` : `> ${simulationMonths} ด.`}
              </div>
              <span className="text-[10px] text-slate-700 mt-1 block">เพื่อแตะเป้าหมาย</span>
            </div>

            <div className="bg-sky-50/90 border border-sky-100 rounded-2xl p-4 shadow-lg text-center">
              <span className="text-[11px] text-slate-700 block mb-1">ต้องมีสมาชิกในทีม</span>
              <div className="text-xl sm:text-2xl font-black text-blue-400">
                {result.requiredTotalTeamSize} <span className="text-xs font-normal text-slate-700">คน</span>
              </div>
              <span className="text-[10px] text-slate-700 mt-1 block">Active {result.requiredActiveMembers} คน</span>
            </div>

            <div className="bg-sky-50/90 border border-sky-100 rounded-2xl p-4 shadow-lg text-center">
              <span className="text-[11px] text-slate-700 block mb-1">โครงสร้างที่ต้องสร้าง</span>
              <div className="text-xl sm:text-2xl font-black text-emerald-400">
                {result.requiredUnits}U / {result.requiredCenters}C
              </div>
              <span className="text-[10px] text-slate-700 mt-1 block">{result.requiredUnits} หน่วย / {result.requiredCenters} ศูนย์</span>
            </div>

            <div className="bg-sky-50/90 border border-sky-100 rounded-2xl p-4 shadow-lg text-center">
              <span className="text-[11px] text-slate-700 block mb-1">ยอดขายรวมทีม / ด.</span>
              <div className="text-lg sm:text-xl font-black text-purple-300">
                {formatBaht(result.requiredTotalMonthlySales, false)}
              </div>
              <span className="text-[10px] text-slate-700 mt-1 block">ยอดขายองค์กร</span>
            </div>

          </div>

          {/* Projected Growth Timeline Chart */}
          <div className="bg-sky-50/90 border border-sky-100 rounded-2xl p-6 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  แนวโน้มรายได้และขนาดทีมตลอด {simulationMonths} เดือน
                </h2>
                <p className="text-xs text-slate-700">
                  เส้นสีส้มคือรายได้เป้าหมาย ({formatBaht(targetIncome)}) และเส้นสีทองคือรายได้จริงที่จำลองได้
                </p>
              </div>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={result.projectedMonthlyIncomeTimeline} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="month" tickFormatter={m => `ด.${m}`} stroke="#94a3b8" />
                  <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}k`} stroke="#94a3b8" />
                  <Tooltip
                    formatter={(val: any, name: any) => [
                      name === 'projectedIncome' ? formatBaht(Number(val)) : `${val} คน`,
                      name === 'projectedIncome' ? 'รายได้จำลอง' : 'ขนาดทีม',
                    ]}
                    labelFormatter={l => `เดือนที่ ${l}`}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="projectedIncome"
                    name="รายได้จำลอง (บาท/ด)"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="teamSize"
                    name="ขนาดทีม (คน)"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    yAxisId={0}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Strategic Advice & Actionable Roadmap */}
          <div className="bg-sky-50/90 border border-sky-100 rounded-2xl p-6 shadow-xl space-y-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-blue-600" />
              คำแนะนำและกลยุทธ์พิชิตเป้าหมาย (Strategic Action Plan)
            </h2>

            <div className="space-y-2">
              {result.strategicAdvice.map((adv, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-sky-100/50 border border-sky-100/60 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p>{adv}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
