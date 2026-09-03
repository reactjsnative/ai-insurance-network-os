import React, { useState } from 'react';
import { 
  Target, 
  TrendingUp, 
  Sliders, 
  Sparkles, 
  Layers, 
  DollarSign, 
  Users, 
  ArrowRight, 
  Copy, 
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar 
} from 'recharts';
import { useApp } from '../../context/AppContext';

export const GrowthSimulation: React.FC = () => {
  const { activeUser, calculateMemberIncome } = useApp();

  // Active scenario model
  const [activeScenario, setActiveScenario] = useState<'A' | 'B' | 'C'>('A');

  // Simulation Parameters
  const [targetMonthlyIncome, setTargetMonthlyIncome] = useState<number>(300000);
  const [monthlyRecruits, setMonthlyRecruits] = useState<number>(3);
  const [unitSplitRate, setUnitSplitRate] = useState<number>(2); // months per split
  const [fycPerAgent, setFycPerAgent] = useState<number>(25000);
  const [retentionRate, setRetentionRate] = useState<number>(85); // %

  // Scenarios A (Conservative), B (Moderate), C (Aggressive)
  const scenarios = {
    A: { name: 'แผนมาตรฐาน (Conservative)', recruits: 2, fyc: 20000, retention: 80, desc: 'เน้นการเติบโตอย่างมั่นคงและตัวเลขฐานเดิม' },
    B: { name: 'แผนเร่งสปีด (Moderate Growth)', recruits: 4, fyc: 30000, retention: 85, desc: 'เพิ่มอัตราการรีครูทและติวเข้มผลงานเฉลี่ย' },
    C: { name: 'แผนก้าวกระโดด (Infinite Scale)', recruits: 8, fyc: 45000, retention: 90, desc: 'สร้างผู้นำแตกหน่วย/ศูนย์ทั่วประเทศอย่างต่อเนื่อง' },
  };

  // Generate 12-Month Simulation Curve
  const simulationMonths = Array.from({ length: 12 }, (_, idx) => {
    const monthNum = idx + 1;
    const currentRecruits = activeScenario === 'A' ? scenarios.A.recruits : activeScenario === 'B' ? scenarios.B.recruits : scenarios.C.recruits;
    const currentFyc = activeScenario === 'A' ? scenarios.A.fyc : activeScenario === 'B' ? scenarios.B.fyc : scenarios.C.fyc;
    const retentionMultiplier = (activeScenario === 'A' ? scenarios.A.retention : activeScenario === 'B' ? scenarios.B.retention : scenarios.C.retention) / 100;

    const totalHeadcount = Math.round(20 + monthNum * currentRecruits * retentionMultiplier);
    const simulatedTeamFyc = totalHeadcount * currentFyc;
    const unitsCount = Math.floor(totalHeadcount / 5);
    const centersCount = Math.floor(unitsCount / 3);

    // Estimated monthly income
    const estimatedIncome = Math.round(
      (currentFyc * 0.35) + // personal COM
      (simulatedTeamFyc * 0.15) + // override
      (unitsCount * 2000) + // unit separation
      (centersCount * 2500) + // center override
      (simulatedTeamFyc > 500000 ? 20000 : 10000) // target management
    );

    return {
      month: `เดือนที่ ${monthNum}`,
      headcount: totalHeadcount,
      teamFYC: simulatedTeamFyc,
      projectedIncome: estimatedIncome,
    };
  });

  // Reverse Goal Solver: Calculate requirements for target income
  const requiredFyc = Math.round((targetMonthlyIncome - 20000) / 0.15);
  const requiredAgents = Math.ceil(requiredFyc / fycPerAgent);
  const requiredUnits = Math.ceil(requiredAgents / 5);
  const requiredCenters = Math.ceil(requiredUnits / 3);

  return (
    <div id="growth_simulation_view" className="space-y-6 max-w-7xl mx-auto pb-16 text-left">
      {/* 1. Header Card */}
      <div className="p-6 rounded-3xl bg-white/90 border border-slate-200 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              การจำลองการเติบโตและวางแผนเป้าหมาย (Growth Simulation & Reverse Planner)
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30">
              Infinite Projection
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            จำลองสถานการณ์ A/B/C คำนวณการคงอยู่ (Retention) และระบบถอดสมการย้อนกลับสู่เป้าหมายรายได้ (Reverse Goal Solver)
          </p>
        </div>

        {/* Scenario Switcher Tabs */}
        <div className="inline-flex p-1 rounded-xl bg-white border border-slate-200 self-start md:self-auto">
          {(['A', 'B', 'C'] as const).map((key) => (
            <button
              key={key}
              onClick={() => setActiveScenario(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeScenario === key 
                  ? 'bg-purple-500 text-slate-950 shadow-md shadow-purple-500/20' 
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Scenario {key}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Reverse Goal Solver: "อยากได้รายได้เดือนละเท่าไหร่? ระบบคำนวณสิ่งที่ต้องสร้างให้" */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-500/30 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Reverse Goal Solver: ถอดสมการเป้าหมายรายได้สู่แผนปฏิบัติการ
              </h2>
            </div>
            <p className="text-xs text-slate-700 mt-1">
              กำหนดรายได้ที่ต้องการ แล้วระบบจะคำนวณจำนวนคน หน่วยงาน ศูนย์งาน และ FYC ที่ต้องสร้าง
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-600">เป้าหมายรายได้:</span>
            <div className="px-4 py-2 rounded-2xl bg-white border border-purple-500/40 text-xl font-black text-purple-300 font-mono">
              ฿{targetMonthlyIncome.toLocaleString()} <span className="text-xs font-normal text-slate-600">/ด.</span>
            </div>
          </div>
        </div>

        {/* Target Income Range Slider */}
        <div className="space-y-2">
          <input
            type="range"
            min={50000}
            max={1000000}
            step={25000}
            value={targetMonthlyIncome}
            onChange={(e) => setTargetMonthlyIncome(Number(e.target.value))}
            className="w-full accent-purple-500 cursor-pointer h-2 bg-white rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-600 font-mono">
            <span>฿50,000</span>
            <span>฿250,000</span>
            <span>฿500,000</span>
            <span>฿750,000</span>
            <span>฿1,000,000</span>
          </div>
        </div>

        {/* Required Resources Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-white/80 border border-slate-200">
            <span className="text-[10px] text-slate-600 uppercase font-bold block">FYC องค์กรที่ต้องทำ</span>
            <div className="text-xl font-black text-amber-300 font-mono mt-1">
              ฿{requiredFyc.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-600">เบี้ยประกัน ~฿{(requiredFyc * 3).toLocaleString()}</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/80 border border-slate-200">
            <span className="text-[10px] text-slate-600 uppercase font-bold block">จำนวนตัวแทน Active</span>
            <div className="text-xl font-black text-sky-300 font-mono mt-1">
              {requiredAgents} <span className="text-xs font-normal text-slate-600">คน</span>
            </div>
            <span className="text-[10px] text-slate-600">เฉลี่ย ฿{fycPerAgent.toLocaleString()} /คน</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/80 border border-slate-200">
            <span className="text-[10px] text-slate-600 uppercase font-bold block">จำนวนหน่วยงานแยก (UM)</span>
            <div className="text-xl font-black text-emerald-300 font-mono mt-1">
              {requiredUnits} <span className="text-xs font-normal text-slate-600">หน่วย</span>
            </div>
            <span className="text-[10px] text-slate-600">~5 คนต่อ 1 หน่วย</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/80 border border-slate-200">
            <span className="text-[10px] text-slate-600 uppercase font-bold block">จำนวนศูนย์งานแยก (CM)</span>
            <div className="text-xl font-black text-rose-300 font-mono mt-1">
              {requiredCenters} <span className="text-xs font-normal text-slate-600">ศูนย์</span>
            </div>
            <span className="text-[10px] text-slate-600">~3 หน่วยต่อ 1 ศูนย์</span>
          </div>
        </div>
      </div>

      {/* 3. 12-Month Projection Chart & Month-by-Month Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projection Area Chart (2 Cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white/90 border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                เส้นทางรายได้คาดการณ์ 12 เดือน ({scenarios[activeScenario].name})
              </h3>
              <p className="text-xs text-slate-600">{scenarios[activeScenario].desc}</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={simulationMonths} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="simIncomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                  formatter={(val: any) => [`฿${Number(val).toLocaleString()}`, '']}
                />
                <Area type="monotone" dataKey="projectedIncome" name="ประมาณการรายได้" stroke="#a855f7" strokeWidth={2.5} fillOpacity={1} fill="url(#simIncomeGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Scenario Parameters Comparison */}
        <div className="p-6 rounded-3xl bg-white/90 border border-slate-200 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1">ตัวแปรสมมติฐานประจำ Scenario</h3>
            <p className="text-xs text-slate-600 mb-4">ปรับเปลี่ยนพารามิเตอร์เพื่อเปรียบเทียบผลลัพธ์</p>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-white border border-slate-200 flex justify-between">
                <span className="text-slate-600">อัตราการรับตัวแทนใหม่:</span>
                <span className="font-bold text-slate-900">{scenarios[activeScenario].recruits} คน/เดือน</span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200 flex justify-between">
                <span className="text-slate-600">FYC เฉลี่ยต่อตัวแทน:</span>
                <span className="font-bold text-amber-300 font-mono">฿{scenarios[activeScenario].fyc.toLocaleString()}</span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200 flex justify-between">
                <span className="text-slate-600">อัตราการคงอยู่ (Retention):</span>
                <span className="font-bold text-emerald-400 font-mono">{scenarios[activeScenario].retention}%</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 text-xs text-indigo-200">
            <span className="font-bold block mb-1">ข้อคิดเชิงกลยุทธ์:</span>
            การเพิ่มอัตราคงอยู่ (Retention) จาก 80% เป็น 90% ส่งผลต่อรายได้ระยะยาวมากกว่าการเร่งรับตัวแทนใหม่ถึง 1.8 เท่า
          </div>
        </div>
      </div>
    </div>
  );
};
