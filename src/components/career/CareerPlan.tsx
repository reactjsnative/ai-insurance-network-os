import React, { useMemo, useState } from 'react';
import {
  TrendingUp,
  Rocket,
  Infinity as InfinityIcon,
  Wallet,
  ChevronRight,
  Sparkles,
  Target,
  Leaf,
  SlidersHorizontal,
  BrainCircuit,
  Calculator,
  ArrowDownUp,
  Flag,
  Info,
  TrendingDown,
  Network,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { calculateTotalIncome, calculateCareerProgress } from '../../engine/calculationEngine';
import { runGrowthSimulation, solveReverseGoal } from '../../engine/simulationEngine';
import { DEFAULT_POSITIONS } from '../../engine/compensationRules';
import {
  PositionId,
  ReverseGoalInput,
} from '../../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
  Cell,
} from 'recharts';

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

const fmt = (n: number) =>
  '฿' + Math.round(n).toLocaleString('th-TH');

const POSITION_LABELS: Record<PositionId, string> = {
  agent: 'ตัวแทน',
  unit_manager: 'ผู้บริหารหน่วย (UM)',
  center_manager: 'ผู้บริหารศูนย์ (CM)',
  region_manager: 'ผู้บริหารภาค (RM)',
  senior_unit_manager: 'ผู้บริหารหน่วยอาวุโส',
  senior_center_manager: 'ผู้บริหารศูนย์อาวุโส',
  executive_region: 'ผู้บริหารภาคสูงสุด',
  national_leader: 'ผู้นำระดับชาติ',
  string: 'อื่น ๆ',
} as any;

const POSITION_ORDER: PositionId[] = [
  'agent',
  'unit_manager',
  'center_manager',
  'region_manager',
  'executive_region',
];

const POSITION_COLORS: Record<string, string> = {
  agent: '#64748b',
  unit_manager: '#0ea5e9',
  center_manager: '#a855f7',
  region_manager: '#f59e0b',
  executive_region: '#10b981',
};

/* ------------------------------------------------------------------ */
/* Main Page                                                          */
/* ------------------------------------------------------------------ */

export const CareerPlan: React.FC<{ memberMode?: boolean }> = ({ memberMode = false }) => {
  const { t, activeUser, getDownlineStats } = useApp();

  // ข้อมูลสมาชิกที่ล็อกอิน (ใช้เมื่อเข้าจากเมนู "แผนของฉัน")
  const memberDownline = useMemo(
    () => (memberMode ? getDownlineStats(activeUser.id) : null),
    [memberMode, activeUser.id, getDownlineStats]
  );
  const memberInitialMembers = memberDownline ? Math.max(1, memberDownline.totalDownlineCount) : 5;
  const memberInitialPersonalCom = memberMode ? activeUser.personalCOM : 20000;
  const memberInitialPosition = (memberMode ? activeUser.positionId : 'unit_manager') as PositionId;

  /* ----- Onboarding / Input state ----- */
  const [comPerMember, setComPerMember] = useState(20000);
  const [memberCount, setMemberCount] = useState(memberInitialMembers);
  const [personalCom, setPersonalCom] = useState(memberInitialPersonalCom);
  const [currentPosition, setCurrentPosition] = useState<PositionId>(memberInitialPosition);
  const [targetPosition, setTargetPosition] = useState<PositionId>('center_manager');
  const [targetIncome, setTargetIncome] = useState(100000);
  const [targetMonths, setTargetMonths] = useState(12);
  const [retention, setRetention] = useState(0.8);
  const [activation, setActivation] = useState(0.7);
  const [treeDepth, setTreeDepth] = useState(4);
  const [selectedNode, setSelectedNode] = useState<{ name: string; gen: number; com: number; role: string } | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  /* ----- Derived core metrics ----- */
  const teamCOM = useMemo(() => comPerMember * memberCount, [comPerMember, memberCount]);
  const teamFYC = useMemo(() => teamCOM * 3, [teamCOM]); // rough FYC≈3x COM
  const annualFYC = teamFYC * 12;
  const annualCOM = teamCOM * 12;
  const renewalPremium = Math.round(teamFYC * 0.4);

  /* ----- Live income simulation (What-if) ----- */
  const incomeResult = useMemo(
    () =>
      calculateTotalIncome({
        positionId: currentPosition,
        personalFYC: personalCom * 3,
        teamFYC,
        personalCOM: personalCom,
        teamCOM,
        firstYearPremium: teamFYC * 3,
        renewalPremium,
        directMembersCount: Math.min(25, memberCount),
        activeMembersCount: Math.round(memberCount * activation),
        separatedUnitsCount:
          currentPosition === 'unit_manager' ||
          currentPosition === 'center_manager' ||
          currentPosition === 'region_manager'
            ? Math.max(0, Math.floor(memberCount / 5) - 1)
            : 0,
        separatedCentersCount:
          currentPosition === 'center_manager' || currentPosition === 'region_manager'
            ? Math.max(0, Math.floor(memberCount / 15))
            : 0,
        separatedRegionsCount: currentPosition === 'region_manager' ? Math.max(0, Math.floor(memberCount / 60)) : 0,
        centerFycList: Array(Math.max(1, Math.floor(memberCount / 15))).fill(teamFYC / Math.max(1, Math.floor(memberCount / 15)) || teamFYC),
        annualFYC,
        annualCOM,
        calculationType: 'PROJECTED',
      }),
    [currentPosition, personalCom, teamFYC, teamCOM, memberCount, activation, renewalPremium, annualFYC, annualCOM]
  );

  const career = useMemo(() => {
    const reqUnits = targetPosition === 'center_manager' ? 2 : 0;
    const reqCenters = targetPosition === 'region_manager' ? 4 : 0;
    return calculateCareerProgress(currentPosition, teamFYC, Math.max(0, Math.floor(memberCount / 5) - 1), Math.max(0, Math.floor(memberCount / 15)), DEFAULT_POSITIONS);
  }, [currentPosition, teamFYC, memberCount, targetPosition]);

  const gapMembers = useMemo(() => {
    if (targetPosition === 'center_manager') {
      const needUnits = 2;
      const haveUnits = Math.max(0, Math.floor(memberCount / 5) - 1);
      const missingUnits = Math.max(0, needUnits - haveUnits);
      return missingUnits * 5;
    }
    if (targetPosition === 'region_manager') {
      const needCenters = 4;
      const haveCenters = Math.max(0, Math.floor(memberCount / 15));
      const missingCenters = Math.max(0, needCenters - haveCenters);
      return missingCenters * 15;
    }
    return 0;
  }, [targetPosition, memberCount]);

  /* ----- Reverse Goal Calculator ----- */
  const reverseInput: ReverseGoalInput = {
    targetType: 'monthly_income',
    targetValue: targetIncome,
    targetMonths,
    assumedRetentionRate: retention,
    assumedActivationRate: activation,
    assumedAverageFYC: Math.round((comPerMember * 3)),
  };
  const reverse = useMemo(() => solveReverseGoal(reverseInput), [reverseInput.targetValue, reverseInput.targetMonths, reverseInput.assumedRetentionRate, reverseInput.assumedActivationRate, reverseInput.assumedAverageFYC]);

  /* ----- Forecast: Conservative / Base / Aggressive ----- */
  const forecast = useMemo(() => {
    const baseRecruit = Math.max(1, Math.round((targetIncome > 0 ? reverse.requiredMonthlyRecruitment : memberCount) / 6));
    const scenarios = [
      {
        key: 'conservative',
        label: 'Conservative',
        color: '#34d399',
        params: {
          name: 'Conservative',
          initialAgents: memberCount,
          recruitmentPerMonth: Math.max(1, Math.round(baseRecruit * 0.6)),
          averageFYC: Math.round(comPerMember * 3 * 0.8),
          averageCOM: Math.round(comPerMember * 0.8),
          activationRate: activation * 0.7,
          retentionRate: retention * 0.7,
          promotionRate: 0.05,
          unitCreationRate: 0.03,
          centerCreationRate: 0.01,
          regionCreationRate: 0.003,
          monthsToSimulate: 36,
        },
      },
      {
        key: 'base',
        label: 'Base',
        color: '#60a5fa',
        params: {
          name: 'Base',
          initialAgents: memberCount,
          recruitmentPerMonth: Math.max(1, baseRecruit),
          averageFYC: Math.round(comPerMember * 3),
          averageCOM: comPerMember,
          activationRate: activation,
          retentionRate: retention,
          promotionRate: 0.08,
          unitCreationRate: 0.05,
          centerCreationRate: 0.02,
          regionCreationRate: 0.005,
          monthsToSimulate: 36,
        },
      },
      {
        key: 'aggressive',
        label: 'Aggressive',
        color: '#f472b6',
        params: {
          name: 'Aggressive',
          initialAgents: memberCount,
          recruitmentPerMonth: Math.round(baseRecruit * 1.6),
          averageFYC: Math.round(comPerMember * 3 * 1.2),
          averageCOM: Math.round(comPerMember * 1.2),
          activationRate: Math.min(1, activation * 1.2),
          retentionRate: Math.min(1, retention * 1.15),
          promotionRate: 0.12,
          unitCreationRate: 0.08,
          centerCreationRate: 0.03,
          regionCreationRate: 0.008,
          monthsToSimulate: 36,
        },
      },
    ];
    return scenarios.map((s) => ({ ...s, data: runGrowthSimulation(s.params) }));
  }, [memberCount, comPerMember, activation, retention, targetIncome, reverse.requiredMonthlyRecruitment]);

  const forecastChart = useMemo(() => {
    const months = [1, 3, 6, 12, 24, 36];
    return months.map((m) => {
      const row: any = { month: m === 1 ? 'M1' : m === 3 ? 'M3' : m === 6 ? 'M6' : m === 12 ? 'M12' : m === 24 ? 'M24' : 'M36' };
      forecast.forEach((s) => {
        const point = s.data.find((d) => d.month === m);
        row[s.label] = point ? Math.round(point.projectedMonthlyIncome) : 0;
      });
      return row;
    });
  }, [forecast]);

  /* ----- AI Coach text ----- */
  const aiAdvice = useMemo(() => {
    const next = POSITION_LABELS[targetPosition];
    const lines: string[] = [];
    lines.push(
      `ตอนนี้คุณมีสมาชิก ${memberCount} คน และ Team COM ${fmt(teamCOM)}/เดือน เป้าหมายของคุณคือ "${next}"`
    );
    if (gapMembers > 0) {
      lines.push(
        `จากข้อมูลปัจจุบัน คุณต้องสร้างทีมเพิ่มประมาณ ${gapMembers} คน เพื่อให้ครบคุณสมบัติแยกหน่วย/ศูนย์ตามเงื่อนไข`
      );
    } else {
      lines.push('คุณมีคุณสมบัติด้านจำนวนสมาชิกใกล้เคียงเป้าหมายแล้ว — โฟกัสที่คุณภาพทีมและผลงาน');
    }
    lines.push(
      `หากต้องการรายได้จำลอง ${fmt(targetIncome)}/เดือน ภายใน ${targetMonths} เดือน ระบบประเมินว่าต้องรับสมาชิกใหม่ประมาณ ${reverse.requiredMonthlyRecruitment} คน/เดือน (รวม ~${reverse.requiredTotalRecruits} คน)`
    );
    lines.push(
      `ประมาณการโครงสร้าง: ~${reverse.estimatedUnits} หน่วย / ~${reverse.estimatedCenters} ศูนย์ / ~${reverse.estimatedRegions} ภาค ระดับความเป็นไปได้: ${reverse.feasibilityScore.toUpperCase()}`
    );
    return lines;
  }, [memberCount, teamCOM, targetPosition, gapMembers, targetIncome, targetMonths, reverse]);

  /* ----- Waterfall (income breakdown) ----- */
  const waterfall = useMemo(
    () =>
      incomeResult.breakdown
        .filter((b) => b.amount > 0)
        .map((b) => ({
          name: b.title.replace(/\s*\(.*\)/, ''),
          value: Math.round(b.amount),
          cat: b.category,
        })),
    [incomeResult]
  );

  /* ----- Build member's own plan summary video ----- */
  const buildPlanVideo = async () => {
    setVideoLoading(true);
    setVideoError(null);
    setVideoUrl(null);
    const nextPosLabel = POSITION_LABELS[targetPosition];
    const scenes = [
      {
        title: `สวัสดีครับ ผม ${memberMode ? activeUser.name : 'เพื่อนตัวแทน'}`,
        body: 'นี่คือสรุปแผนรายได้และเส้นทางอาชีพ\nของผมในระบบ AI Insurance Network OS',
        duration: 4,
      },
      {
        title: `วันนี้ผมอยู่ตำแหน่ง ${POSITION_LABELS[currentPosition]}`,
        body: `ทีม COM ${fmt(teamCOM)} ต่อเดือน\nและรายได้จำลอง ${fmt(incomeResult.totalIncome)} ต่อเดือน`,
        duration: 4,
      },
      {
        title: 'เป้าหมายของผม',
        body: `ขึ้นสู่ ${nextPosLabel}\nรายได้ ${fmt(targetIncome)} ภายใน ${targetMonths} เดือน`,
        duration: 4,
      },
      {
        title: 'ช่องว่างที่ต้องเติม (Gap)',
        body: `ต้องเพิ่มสมาชิกอีก ~${gapMembers} คน\nเพื่อให้ครบคุณสมบัติตำแหน่งเป้าหมาย`,
        duration: 4,
      },
      {
        title: 'คำนวณย้อนหลัง (Reverse Goal)',
        body: `รับสมาชิกใหม่ ${reverse.requiredMonthlyRecruitment} คน/เดือน\nรวม ~${reverse.requiredTotalRecruits} คน ถึงเป้าหมาย`,
        duration: 4,
      },
      {
        title: 'แผน 30 วัน',
        body: `รับสมาชิก ~${Math.max(1, Math.round(reverse.requiredMonthlyRecruitment))} คน\nเพิ่ม Team COM ต่อเนื่อง`,
        duration: 3,
      },
      {
        title: 'แผน 60 วัน',
        body: `สร้างทีมรวม ~${memberCount + reverse.requiredMonthlyRecruitment * 2} คน\nเตรียมแยกหน่วย/ศูนย์ใหม่`,
        duration: 3,
      },
      {
        title: 'แผน 90 วัน',
        body: `บรรลุเป้าหมายรายได้ ${fmt(targetIncome)}\nหากรักษาอัตรารับสมาชิกไว้ได้`,
        duration: 3,
      },
    ];
    try {
      const res = await fetch('/api/myplan/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenes,
          accent: '#a855f7',
          voice: 'th-TH-PremwadeeNeural',
          name: memberMode ? `plan_${activeUser.id}` : 'plan_preview',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'สร้างวิดีโอไม่สำเร็จ');
      setVideoUrl(data.url);
    } catch (e: any) {
      setVideoError(e.message || 'เกิดข้อผิดพลาด');
    } finally {
      setVideoLoading(false);
    }
  };

  return (
    <div id="career_plan_view" className="space-y-8 max-w-7xl mx-auto pb-16 text-left">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-sky-50/90 border border-sky-100/60 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center text-slate-900 shadow-sm shadow-amber-500/30">
              <Rocket className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">แผนรายได้ & เส้นทางสู่อิสระภาพทางการเงิน</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600/10 text-blue-600 border border-blue-600/30">พร้อมใช้งาน</span>
          </div>
          <p className="text-xs text-slate-700 mt-1">
            วางแผนรายได้ → วิเคราะห์ช่องว่าง → จำลองการเติบโต → ประมาณการอนาคต → AI แนะนำแผน 30/60/90 วัน (คำนวณเรียลไทม์จาก Rule Engine)
          </p>
        </div>
      </div>

      {/* Member Mode Banner — แสดงตำแหน่งของสมาชิกที่ล็อกอิน + เริ่มสร้างแผน */}
      {memberMode && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-500/15 to-fuchsia-500/10 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img src={activeUser.avatarUrl} alt={activeUser.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-400" />
            <div>
              <p className="text-[11px] text-indigo-300 font-semibold uppercase tracking-wider">นี่คือตำแหน่งของคุณ</p>
              <h3 className="text-lg font-black text-slate-900">{activeUser.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: POSITION_COLORS[activeUser.positionId] || '#64748b', color: '#0f172a' }}
                >
                  {POSITION_LABELS[activeUser.positionId]}
                </span>
                <span className="text-[11px] text-slate-700">สมาชิก {memberDownline?.totalDownlineCount ?? 0} คน • COM ส่วนตัว {fmt(activeUser.personalCOM)}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              document.getElementById('career_plan_view')?.scrollIntoView({ behavior: 'smooth' });
              const el = document.querySelector('input[type="number"]') as HTMLInputElement | null;
              el?.focus();
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 hover:from-indigo-400 hover:to-fuchsia-400 text-slate-900 text-xs font-bold shadow-sm shadow-indigo-500/20 transition-all whitespace-nowrap"
          >
            เริ่มสร้างแผนของฉัน →
          </button>
        </div>
      )}

      {/* SECTION 1: Smart Onboarding / Inputs */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <SlidersHorizontal className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-black text-slate-900">1. ตั้งค่าข้อมูลของคุณ (Smart Onboarding)</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <NumberField label="COM ต่อคน (บาท)" value={comPerMember} onChange={setComPerMember} step={1000} icon={<Wallet className="w-4 h-4" />} />
          <NumberField label="จำนวนสมาชิก (คน)" value={memberCount} onChange={setMemberCount} step={1} icon={<TrendingUp className="w-4 h-4" />} />
          <NumberField label="COM ส่วนตัว (บาท)" value={personalCom} onChange={setPersonalCom} step={1000} icon={<Wallet className="w-4 h-4" />} />
          <SelectField
            label="ระดับปัจจุบัน"
            value={currentPosition}
            onChange={(v) => setCurrentPosition(v as PositionId)}
            options={POSITION_ORDER.map((p) => ({ value: p, label: POSITION_LABELS[p] }))}
          />
          <SelectField
            label="เป้าหมายตำแหน่ง"
            value={targetPosition}
            onChange={(v) => setTargetPosition(v as PositionId)}
            options={POSITION_ORDER.map((p) => ({ value: p, label: POSITION_LABELS[p] }))}
          />
          <NumberField label="เป้าหมายรายได้ (บาท/เดือน)" value={targetIncome} onChange={setTargetIncome} step={10000} icon={<Target className="w-4 h-4" />} />
          <NumberField label="ระยะเวลาเป้าหมาย (เดือน)" value={targetMonths} onChange={setTargetMonths} step={1} icon={<Flag className="w-4 h-4" />} />
          <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100/60 space-y-2">
            <label className="text-xs font-semibold text-slate-700 block">Retention / Activation</label>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-700 w-16">Retain {(retention * 100).toFixed(0)}%</span>
              <input type="range" min={0.3} max={1} step={0.05} value={retention} onChange={(e) => setRetention(Number(e.target.value))} className="flex-1 accent-amber-500" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-700 w-16">Active {(activation * 100).toFixed(0)}%</span>
              <input type="range" min={0.3} max={1} step={0.05} value={activation} onChange={(e) => setActivation(Number(e.target.value))} className="flex-1 accent-amber-500" />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Live Dashboard */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Calculator className="w-5 h-5 text-sky-400" />
          <h2 className="text-lg font-black text-slate-900">2. แดชบอร์ดเรียลไทม์ (Real-Time)</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="ระดับปัจจุบัน" value={POSITION_LABELS[currentPosition]} sub="Current Position" accent="sky" />
          <KpiCard label="Team COM" value={fmt(teamCOM)} sub="ต่อเดือน" accent="violet" />
          <KpiCard label="รายได้จำลอง" value={fmt(incomeResult.totalIncome)} sub="Estimated / เดือน" accent="emerald" />
          <KpiCard label="เป้าหมายถัดไป" value={POSITION_LABELS[targetPosition]} sub="Next Level" accent="amber" />
        </div>
        <div className="p-5 rounded-2xl bg-sky-50/60 border border-sky-100/60 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">ความคืบหน้าสู่ {POSITION_LABELS[targetPosition]}</span>
            <span className="text-xs font-black text-blue-600">{career.overallProgressPercent}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-sky-100 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full transition-all" style={{ width: `${career.overallProgressPercent}%` }} />
          </div>
          <p className="text-[11px] text-slate-700 leading-relaxed">{career.mathematicalProjection.recommendationText}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <GapPill label="FYC ปัจจุบัน" value={fmt(career.currentFYC)} />
            <GapPill label="หน่วย (มี/ต้องการ)" value={`${career.currentUnits}/${career.requiredUnits}`} />
            <GapPill label="ศูนย์ (มี/ต้องการ)" value={`${career.currentCenters}/${career.requiredCenters}`} />
          </div>
        </div>
      </section>

      {/* SECTION 3: Reverse Goal Calculator + Gap Analysis */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <ArrowDownUp className="w-5 h-5 text-fuchsia-400" />
          <h2 className="text-lg font-black text-slate-900">3. คำนวณย้อนหลัง & วิเคราะห์ช่องว่าง (Reverse + Gap)</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-50 to-fuchsia-950/20 border border-sky-100/60 space-y-4">
            <div className="flex items-center gap-2 text-fuchsia-300">
              <Target className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Reverse Goal Calculator</span>
            </div>
            <p className="text-xs text-slate-700">เป้าหมายรายได้ {fmt(targetIncome)}/เดือน ภายใน {targetMonths} เดือน</p>
            <div className="grid grid-cols-2 gap-3">
              <ReverseStat label="รับสมาชิกใหม่/เดือน" value={`${reverse.requiredMonthlyRecruitment} คน`} />
              <ReverseStat label="รวมทั้งหมด" value={`${reverse.requiredTotalRecruits} คน`} />
              <ReverseStat label="ประมาณหน่วย" value={`${reverse.estimatedUnits}`} />
              <ReverseStat label="ประมาณศูนย์" value={`${reverse.estimatedCenters}`} />
              <ReverseStat label="ประมาณภาค" value={`${reverse.estimatedRegions}`} />
              <ReverseStat label="ระดับความเป็นไปได้" value={reverse.feasibilityScore.toUpperCase()} />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-50 to-amber-950/20 border border-sky-100/60 space-y-4">
            <div className="flex items-center gap-2 text-blue-600">
              <TrendingDown className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Career Gap Analysis</span>
            </div>
            <p className="text-xs text-slate-700">
              เพื่อไปถึง <b>{POSITION_LABELS[targetPosition]}</b> จาก <b>{POSITION_LABELS[currentPosition]}</b>
            </p>
            <ul className="space-y-2.5 text-xs text-slate-700 leading-relaxed">
              <li className="flex gap-2"><ChevronRight className="w-4 h-4 text-blue-600 shrink-0" /> ต้องเพิ่มสมาชิกอีกประมาณ <b className="text-blue-600">{gapMembers} คน</b></li>
              <li className="flex gap-2"><ChevronRight className="w-4 h-4 text-blue-600 shrink-0" /> Team COM ปัจจุบัน {fmt(teamCOM)} → เป้าหมายควรสูงกว่านี้ตามระดับ</li>
              <li className="flex gap-2"><ChevronRight className="w-4 h-4 text-blue-600 shrink-0" /> หาก 1 หน่วย = 5 คน → ต้องแยกเพิ่ม {Math.ceil(gapMembers / 5)} หน่วย</li>
            </ul>
          </div>
        </div>
      </section>

      {/* SECTION 4: What-if Simulator (sliders) */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <SlidersHorizontal className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-black text-slate-900">4. จำลองสถานการณ์ (What-If Simulator)</h2>
        </div>
        <div className="p-5 rounded-2xl bg-sky-50/60 border border-sky-100/60 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Slider label="COM ต่อคน" min={1000} max={100000} step={1000} value={comPerMember} onChange={setComPerMember} fmt={fmt} />
            <Slider label="จำนวนสมาชิก" min={1} max={500} step={1} value={memberCount} onChange={setMemberCount} fmt={(n) => `${n} คน`} />
            <Slider label="COM ส่วนตัว" min={0} max={200000} step={1000} value={personalCom} onChange={setPersonalCom} fmt={fmt} />
          </div>
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-700">ส่วนประกอบรายได้จำลอง</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={waterfall} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10, fill: '#cbd5e1' }} />
                  <Tooltip formatter={(v: any) => fmt(v)} contentStyle={{ background: '#0f172a', border: '1px solid #334155', fontSize: 12 }} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                    {waterfall.map((w, i) => (
                      <Cell key={i} fill={POSITION_COLORS[w.cat] || '#a855f7'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[11px] text-slate-700">รวมรายได้จำลอง: <b className="text-emerald-300">{fmt(incomeResult.totalIncome)}/เดือน</b></p>
          </div>
        </div>
      </section>

      {/* SECTION 5: Forecast Conservative / Base / Aggressive */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-black text-slate-900">5. ประมาณการอนาคต (Forecast 3 เส้น)</h2>
        </div>
        <div className="p-5 rounded-2xl bg-sky-50/60 border border-sky-100/60">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastChart} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                <Tooltip formatter={(v: any) => fmt(v)} contentStyle={{ background: '#0f172a', border: '1px solid #334155', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {forecast.map((s) => (
                  <Line key={s.key} type="monotone" dataKey={s.label} stroke={s.color} strokeWidth={2.5} dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
            {forecast.map((s) => {
              const m12 = s.data.find((d) => d.month === 12);
              const m36 = s.data.find((d) => d.month === 36);
              return (
                <div key={s.key} className="p-3 rounded-xl bg-sky-50/60 border border-sky-100/60">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                    <span className="text-xs font-bold text-slate-800">{s.label}</span>
                  </div>
                  <p className="text-[11px] text-slate-700 mt-1">เดือน 12: {fmt(m12?.projectedMonthlyIncome || 0)}</p>
                  <p className="text-[11px] text-slate-700">เดือน 36: {fmt(m36?.projectedMonthlyIncome || 0)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 6: AI Team Coach */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <BrainCircuit className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-black text-slate-900">6. AI Team Coach (คำแนะนำอัตโนมัติ)</h2>
        </div>
        <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-50 to-indigo-950/30 border border-indigo-500/20 space-y-3">
          <div className="flex items-center gap-2 text-indigo-300">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">AI Team Coach</span>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-800 leading-relaxed">
            {aiAdvice.map((line, i) => (
              <li key={i} className="flex gap-2"><ChevronRight className="w-4 h-4 text-indigo-400 shrink-0" /> {line}</li>
            ))}
          </ul>
          <div className="pt-3 mt-1 border-t border-sky-100/60">
            <p className="text-[11px] font-bold text-indigo-300 mb-2">30 / 60 / 90 Day Plan (จากเป้าหมายของคุณ)</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-slate-700">
              <div className="p-3 rounded-xl bg-sky-50/60 border border-sky-100/60">
                <b className="text-indigo-300">30 วัน</b> — เพิ่มสมาชิก ~{Math.max(1, Math.round(reverse.requiredMonthlyRecruitment))} คน / เพิ่ม Team COM ~{fmt(teamCOM * 0.4)}
              </div>
              <div className="p-3 rounded-xl bg-sky-50/60 border border-sky-100/60">
                <b className="text-indigo-300">60 วัน</b> — สร้างทีมรวม ~{memberCount + reverse.requiredMonthlyRecruitment * 2} คน / เตรียมแยกหน่วยแรก
              </div>
              <div className="p-3 rounded-xl bg-sky-50/60 border border-sky-100/60">
                <b className="text-indigo-300">90 วัน</b> — ไปถึงเป้าหมายรายได้ {fmt(targetIncome)} หากรักษาอัตรารับสมาชิก
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: Infinite Network Tree */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Network className="w-5 h-5 text-rose-400" />
          <h2 className="text-lg font-black text-slate-900">7. แผนผังการขยายเครือข่ายแบบไม่มีที่สิ้นสุด (Infinite Network Tree)</h2>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30">รูปคน</span>
        </div>
        <InfiniteNetworkTree
          rootName="คุณ (Root Leader)"
          comPerMember={comPerMember}
          branching={Math.max(2, Math.round(memberCount / Math.max(1, Math.floor(memberCount / 5)) || 1)) || 5}
          depth={treeDepth}
          setDepth={setTreeDepth}
          selectedNode={selectedNode}
          setSelectedNode={setSelectedNode}
        />
      </section>

      {/* SECTION 8: Member Plan Video Summary (สรุปความคิดของสมาชิก) */}
      {memberMode && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Sparkles className="w-5 h-5 text-fuchsia-400" />
            <h2 className="text-lg font-black text-slate-900">8. วิดีโอสรุปแผนของฉัน</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/30">AI Video</span>
          </div>
          <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-50 to-fuchsia-950/20 border border-sky-100/60 space-y-4">
            <p className="text-xs text-slate-700 leading-relaxed">
              เมื่อคุณตั้งค่าแผนด้านบนเรียบร้อย กดปุ่มด้านล่างเพื่อสร้าง <b>วิดีโอสรุปแผนของคุณ</b> อัตโนมัติ
              จากข้อมูลที่คุณกรอก — ตำแหน่งปัจจุบัน เป้าหมาย รายได้จำลอง แผน 30/60/90 วัน พร้อมเสียงเล่าภาษาไทย
            </p>
            <button
              onClick={buildPlanVideo}
              disabled={videoLoading}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-fuchsia-500 to-purple-500 hover:from-fuchsia-400 hover:to-purple-400 text-slate-900 text-xs font-bold shadow-sm shadow-fuchsia-500/20 transition-all disabled:opacity-60 flex items-center gap-2"
            >
              {videoLoading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  กำลังสร้างวิดีโอสรุปแผนของคุณ...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  สร้างวิดีโอสรุปแผนของฉัน
                </>
              )}
            </button>

            {videoError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-[11px] text-rose-200">
                {videoError}
              </div>
            )}

            {videoUrl && (
              <div className="rounded-2xl overflow-hidden border border-fuchsia-500/30 bg-sky-50">
                <video src={videoUrl} controls className="w-full max-h-[70vh]" />
                <div className="p-3 text-[11px] text-slate-700 flex items-center justify-between">
                  <span>วิดีโอสรุปแผนของ {activeUser.name}</span>
                  <a href={videoUrl} download className="text-fuchsia-300 hover:underline">ดาวน์โหลด</a>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Disclaimer */}
      <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-[11px] text-rose-200 leading-relaxed flex items-start gap-2">
        <Info className="w-4 h-4 mt-0.5 shrink-0" />
        <span>
          ผลการคำนวณเป็นเพียงแบบจำลองจากข้อมูลสมมติฐาน และกฎที่ตั้งค่าไว้ในระบบ (Plan Version 2021-01-15) ไม่ใช่การรับประกันรายได้
          ค่าตอบแทนจริงขึ้นอยู่กับผลงาน คุณสมบัติ เงื่อนไข และแผนค่าตอบแทนที่มีผลใช้จริง กรุณาตรวจสอบกับเอกสารหรือประกาศฉบับปัจจุบันก่อนนำไปใช้
        </span>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Sub-components                                                     */
/* ------------------------------------------------------------------ */

const NumberField: React.FC<{
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  icon?: React.ReactNode;
}> = ({ label, value, onChange, step = 1, icon }) => (
  <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100/60 space-y-1.5">
    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
      {icon && <span className="text-blue-600">{icon}</span>}
      {label}
    </label>
    <input
      type="number"
      value={value}
      step={step}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full bg-sky-50 border border-sky-100/60 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-600"
    />
  </div>
);

const SelectField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}> = ({ label, value, onChange, options }) => (
  <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100/60 space-y-1.5">
    <label className="text-xs font-semibold text-slate-700 block">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-sky-50 border border-sky-100/60 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-600"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  </div>
);

const Slider: React.FC<{
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  fmt: (n: number) => string;
}> = ({ label, min, max, step, value, onChange, fmt }) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold text-slate-700">{label}</span>
      <span className="text-xs font-bold text-emerald-300">{fmt(value)}</span>
    </div>
    <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-emerald-500" />
  </div>
);

const KpiCard: React.FC<{ label: string; value: string; sub: string; accent: 'sky' | 'violet' | 'emerald' | 'amber' }> = ({ label, value, sub, accent }) => {
  const ring = {
    sky: 'from-sky-500/20 text-sky-300',
    violet: 'from-violet-500/20 text-violet-300',
    emerald: 'from-emerald-500/20 text-emerald-300',
    amber: 'from-amber-500/20 text-blue-600',
  }[accent];
  return (
    <div className={`p-4 rounded-2xl bg-gradient-to-br to-sky-50 border border-sky-100/60 ${ring}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wider opacity-80">{label}</p>
      <p className="text-lg font-black mt-1">{value}</p>
      <p className="text-[10px] opacity-60">{sub}</p>
    </div>
  );
};

const GapPill: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="p-3 rounded-xl bg-sky-50/60 border border-sky-100/60">
    <p className="text-[10px] text-slate-700">{label}</p>
    <p className="text-sm font-bold text-slate-900 mt-0.5">{value}</p>
  </div>
);

const ReverseStat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="p-3 rounded-xl bg-sky-50/60 border border-sky-100/60">
    <p className="text-[10px] text-slate-700">{label}</p>
    <p className="text-sm font-bold text-fuchsia-300 mt-0.5">{value}</p>
  </div>
);

/* ------------------------------------------------------------------ */
/* Infinite Network Tree                                              */
/* ------------------------------------------------------------------ */

// รูปคน placeholder (Unsplash) — คล้ายกับที่ใช้ในโปรเจกต์เดิม
const AVATARS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120',
  'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=120',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120',
  'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=120',
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=120',
];

const GEN_ROLE: { label: string; color: string; ring: string }[] = [
  { label: 'Root Leader', color: '#f43f5e', ring: 'border-rose-500' },
  { label: 'Gen 1 • ผู้บริหารหน่วย', color: '#22d3ee', ring: 'border-cyan-400' },
  { label: 'Gen 2 • ผู้บริหารศูนย์', color: '#a855f7', ring: 'border-purple-400' },
  { label: 'Gen 3 • ผู้บริหารภาค', color: '#f59e0b', ring: 'border-blue-400' },
  { label: 'Gen 4+ • ผู้นำระดับภูมิภาค', color: '#10b981', ring: 'border-emerald-400' },
  { label: 'Gen 5+ • เครือข่ายไร้ขีดจำกัด', color: '#e879f9', ring: 'border-fuchsia-400' },
];

interface TreeNode {
  id: string;
  name: string;
  gen: number;
  com: number;
  avatar: string;
}

const InfiniteNetworkTree: React.FC<{
  rootName: string;
  comPerMember: number;
  branching: number;
  depth: number;
  setDepth: (n: number) => void;
  selectedNode: { name: string; gen: number; com: number; role: string } | null;
  setSelectedNode: (n: { name: string; gen: number; com: number; role: string } | null) => void;
}> = ({ rootName, comPerMember, branching, depth, setDepth, selectedNode, setSelectedNode }) => {
  // สร้างต้นไม้จำลองหลายชั้น
  const tree = useMemo(() => {
    const nodes: TreeNode[] = [];
    const root: TreeNode = {
      id: 'root',
      name: rootName,
      gen: 0,
      com: comPerMember,
      avatar: AVATARS[0],
    };
    nodes.push(root);
    let counter = 1;
    for (let g = 1; g <= depth; g++) {
      const count = Math.pow(branching, g);
      const cap = Math.min(count, 60); // จำกัดการ render เพื่อความเรียบร้อย
      for (let i = 0; i < cap; i++) {
        const idx = (counter + i) % AVATARS.length;
        nodes.push({
          id: `g${g}-${i}`,
          name: `สมาชิก ${g}.${i + 1}`,
          gen: g,
          com: comPerMember,
          avatar: AVATARS[idx],
        });
      }
      counter += cap;
    }
    return nodes;
  }, [rootName, comPerMember, branching, depth]);

  const totalPeople = tree.length;
  const totalPotential = tree.reduce((s, n) => s + n.com, 0);

  // จัดกลุ่มตามชั้นสำหรับแสดงแบบ Tree (แนวตั้ง)
  const layers = useMemo(() => {
    const map: Record<number, TreeNode[]> = {};
    tree.forEach((n) => {
      if (!map[n.gen]) map[n.gen] = [];
      map[n.gen].push(n);
    });
    return Object.keys(map)
      .map(Number)
      .sort((a, b) => a - b)
      .map((g) => ({ gen: g, nodes: map[g] }));
  }, [tree]);

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-50 to-rose-950/10 border border-sky-100/60 space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-rose-300 text-xs font-bold uppercase tracking-wider">
          <InfinityIcon className="w-4 h-4" />
          <span>Infinite Network — เลื่อนลงดูการขยายแต่ละชั้น</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDepth(Math.max(1, depth - 1))}
            className="px-3 py-1.5 rounded-lg bg-sky-100 hover:bg-slate-200 text-slate-800 text-xs font-bold"
          >
            − ชั้น
          </button>
          <span className="text-xs text-slate-700 font-mono">{depth} ชั้น</span>
          <button
            onClick={() => setDepth(Math.min(6, depth + 1))}
            className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-bold border border-rose-500/30"
          >
            + ขยายชั้น
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-sky-50/60 border border-sky-100/60">
          <p className="text-[10px] text-slate-700">จำนวนคนในแผนผัง</p>
          <p className="text-sm font-black text-rose-300">{totalPeople.toLocaleString()} คน</p>
        </div>
        <div className="p-3 rounded-xl bg-sky-50/60 border border-sky-100/60">
          <p className="text-[10px] text-slate-700">ศูนย์สูงสุดที่เป็นไปได้</p>
          <p className="text-sm font-black text-blue-600">~{Math.floor(totalPeople / 15)} ศูนย์</p>
        </div>
        <div className="p-3 rounded-xl bg-sky-50/60 border border-sky-100/60">
          <p className="text-[10px] text-slate-700">หน่วยสูงสุดที่เป็นไปได้</p>
          <p className="text-sm font-black text-cyan-300">~{Math.floor(totalPeople / 5)} หน่วย</p>
        </div>
        <div className="p-3 rounded-xl bg-sky-50/60 border border-sky-100/60">
          <p className="text-[10px] text-slate-700">Potential COM สะสม</p>
          <p className="text-sm font-black text-emerald-300">{fmt(totalPotential)}</p>
        </div>
      </div>

      {/* Tree (vertical layers) */}
      <div className="relative rounded-2xl bg-sky-50/70 border border-sky-100/60 p-4 overflow-x-auto">
        <div className="min-w-[640px] space-y-3">
          {layers.map((layer, li) => (
            <div key={layer.gen} className="flex flex-col items-center">
              <div
                className={`flex flex-wrap justify-center gap-2 ${
                  layer.gen === 0 ? 'pb-1' : ''
                }`}
              >
                {layer.nodes.map((n) => {
                  const role = GEN_ROLE[Math.min(n.gen, GEN_ROLE.length - 1)];
                  const isSel = selectedNode?.name === n.name;
                  return (
                    <button
                      key={n.id}
                      onClick={() => setSelectedNode({ name: n.name, gen: n.gen, com: n.com, role: role.label })}
                      className={`group relative flex flex-col items-center p-2 rounded-xl border bg-sky-50/80 transition-all hover:-translate-y-0.5 ${
                        isSel ? `${role.ring} ring-2 ring-rose-400/40` : 'border-sky-100/60 hover:border-slate-600'
                      }`}
                      title={`${n.name} • ${role.label}`}
                    >
                      <span
                        className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full border border-sky-100/60"
                        style={{ background: role.color }}
                      />
                      <img
                        src={n.avatar}
                        alt={n.name}
                        referrerPolicy="no-referrer"
                        className="w-9 h-9 rounded-full object-cover ring-2"
                        style={{ boxShadow: `0 0 0 2px ${role.color}55` }}
                      />
                      <span className="text-[9px] text-slate-700 mt-1 max-w-[64px] truncate">{n.name}</span>
                    </button>
                  );
                })}
              </div>
              {li < layers.length - 1 && (
                <div className="flex items-center gap-1 text-slate-700 my-1">
                  <div className="w-8 h-px bg-slate-700" />
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-[9px] font-mono text-slate-700">แตก {branching}×</span>
                  <ChevronRight className="w-3 h-3" />
                  <div className="w-8 h-px bg-slate-700" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Selected node detail */}
      {selectedNode && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3">
          <Users className="w-5 h-5 text-rose-300" />
          <div className="text-xs text-slate-800">
            <b className="text-rose-200">{selectedNode.name}</b> • {selectedNode.role} • COM {fmt(selectedNode.com)}/เดือน
            <span className="text-slate-700"> — คลิกโหนดอื่นเพื่อดูรายละเอียด (จำลองเส้นทางสายงาน)</span>
          </div>
        </div>
      )}

      <p className="text-[10px] text-slate-700 leading-relaxed">
        * ต้นไม้นี้เป็นแบบจำลองแสดง "พลังการขยายทีม" หากแต่ละคนสร้าง {branching} คน ต่อเนื่องหลายชั้น จำนวนสมาชิกจะเติบโตทวีคูณ
        (5 → 25 → 125 → 625 → 3,125…) รายได้จัดการจะขยายตามระดับชั้นโดยไม่มีเพดาน — ตัวเลขเป็นสมมติฐานเพื่อการวางแผนเท่านั้น
      </p>
    </div>
  );
};

