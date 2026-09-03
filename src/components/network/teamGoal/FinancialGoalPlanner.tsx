import React, { useState, useEffect } from "react";
import { 
  Target, 
  Wallet, 
  Calendar, 
  Users, 
  Clock, 
  CheckCircle, 
  Sparkles, 
  ShieldCheck, 
  Save, 
  Flame, 
  ArrowRight,
  HelpCircle,
  Award
} from "lucide-react";
import { Member, FinancialGoalPlan } from "./types";

interface FinancialGoalPlannerProps {
  currentMember: Member | null;
  goalPlan: FinancialGoalPlan | null;
  onSaveGoalPlan: (plan: FinancialGoalPlan) => Promise<void>;
  isLoading: boolean;
}

export const FinancialGoalPlanner: React.FC<FinancialGoalPlannerProps> = ({
  currentMember,
  goalPlan,
  onSaveGoalPlan,
  isLoading,
}) => {
  const [monthlyGoal, setMonthlyGoal] = useState<number>(250000);
  const [targetDate, setTargetDate] = useState<string>("2027-12-31");
  const [targetLeaders, setTargetLeaders] = useState<number>(5);
  const [plannedRecruits, setPlannedRecruits] = useState<number>(3);
  const [workHours, setWorkHours] = useState<number>(25);
  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(60000);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Local milestones state
  const [milestoneCompleted, setMilestoneCompleted] = useState<Record<string, boolean>>({
    p25: true,
    p50: false,
    p75: false,
    p100: false,
  });

  useEffect(() => {
    if (goalPlan) {
      setMonthlyGoal(goalPlan.monthly_income_goal);
      setTargetDate(goalPlan.target_date);
      setTargetLeaders(goalPlan.target_leaders_count);
      setPlannedRecruits(goalPlan.planned_monthly_recruits);
      setWorkHours(goalPlan.planned_work_hours_per_week);
      setMonthlyExpenses(goalPlan.monthly_living_expenses);
      setMilestoneCompleted({
        p25: goalPlan.milestones.p25.completed,
        p50: goalPlan.milestones.p50.completed,
        p75: goalPlan.milestones.p75.completed,
        p100: goalPlan.milestones.p100.completed,
      });
    } else if (currentMember) {
      setMonthlyGoal(currentMember.income_goal || 250000);
    }
  }, [goalPlan, currentMember]);

  if (!currentMember) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center text-slate-700">
        กรุณาเลือกสมาชิกที่ต้องการวางแผนเป้าหมาย
      </div>
    );
  }

  const actualIncome = currentMember.actual_income || 0;
  const incomeGap = Math.max(0, monthlyGoal - actualIncome);
  const reserveFund = monthlyExpenses * 6;
  const currentProgress = monthlyGoal > 0 ? Math.min(100, Math.round((actualIncome / monthlyGoal) * 100)) : 0;
  
  // Approximate months to freedom based on recruit pace and gap
  const estimatedMonths = Math.max(
    3,
    Math.round(incomeGap / Math.max(15000, plannedRecruits * 12000))
  );

  const handleSave = async () => {
    const updatedPlan: FinancialGoalPlan = {
      id: goalPlan?.id || `goal-${currentMember.member_id}`,
      member_id: currentMember.member_id,
      monthly_income_goal: Number(monthlyGoal),
      annual_income_goal: Number(monthlyGoal) * 12,
      target_date: targetDate,
      current_members: currentMember.team_total_count,
      planned_monthly_recruits: Number(plannedRecruits),
      planned_work_hours_per_week: Number(workHours),
      target_rank: "EXECUTIVE_LEADER",
      target_leaders_count: Number(targetLeaders),
      monthly_living_expenses: Number(monthlyExpenses),
      reserve_fund_needed: reserveFund,
      gap_amount: incomeGap,
      estimated_months_to_freedom: estimatedMonths,
      milestones: {
        p25: {
          title: "Milestone 25%: วางรากฐานทีมและสร้างผลงานส่วนตัวมั่นคง",
          target_income: Math.round(monthlyGoal * 0.25),
          target_members: Math.max(3, Math.round(currentMember.team_total_count * 1.3)),
          estimated_date: "มิ.ย. 2568",
          completed: milestoneCompleted.p25,
        },
        p50: {
          title: "Milestone 50%: ขยายสายงานและสร้าง Unit Manager 1 คน",
          target_income: Math.round(monthlyGoal * 0.5),
          target_members: Math.max(7, Math.round(currentMember.team_total_count * 2)),
          estimated_date: "ธ.ค. 2568",
          completed: milestoneCompleted.p50,
        },
        p75: {
          title: "Milestone 75%: ผู้นำสายงานขยายเครือข่ายอย่างเป็นระบบ",
          target_income: Math.round(monthlyGoal * 0.75),
          target_members: Math.max(15, Math.round(currentMember.team_total_count * 3)),
          estimated_date: "มิ.ย. 2569",
          completed: milestoneCompleted.p75,
        },
        p100: {
          title: "Milestone 100%: บรรลุเป้าหมายอิสรภาพทางการเงินเต็มรูปแบบ",
          target_income: monthlyGoal,
          target_members: Math.max(25, Math.round(currentMember.team_total_count * 4.5)),
          estimated_date: "ธ.ค. 2569",
          completed: milestoneCompleted.p100,
        },
      },
      daily_actions: [
        "นัดหมายผู้มุ่งหวังเปิดโอกาสทางอาชีพ 3 สาย",
        "แชร์ความรู้และคุณค่าประกันชีวิตผ่านโซเชียลมีเดีย",
        "ส่งกำลังใจและติดตามสมาชิกทีมงาน 2 คน",
      ],
      weekly_actions: [
        "จัด Group BOP หรือนัดสัมภาษณ์ตัวแทนใหม่ 2 ราย",
        "จัด Coaching ทบทวนยอดและเคสขายกับทีมงานสายตรง",
        "ติดตามลูกค้าเก่าเพื่อบริการหลังการขายและขอคำแนะนำต่อ",
      ],
      monthly_actions: [
        "สรุปผลงานและวางแผนขยายทีมประจำเดือน",
        "พาทีมเข้าร่วมงานสัมมนาหรือฝึกอบรมระดับบริษัท",
        "ทบทวนสถานะเป้าหมายการเงินและเงินสำรองฉุกเฉิน",
      ],
      updated_at: new Date().toISOString(),
    };

    await onSaveGoalPlan(updatedPlan);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/70 via-slate-900/90 to-indigo-950/80 border border-amber-500/30 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Target className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              แผนที่สู่อิสรภาพทางการเงิน (Financial Freedom Roadmap)
            </h2>
          </div>
          <p className="text-xs text-slate-700 mt-1">
            กำหนดเป้าหมายรายได้ สมาชิกในทีม และกิจกรรมรายวันเพื่อเปลี่ยนความฝันให้เป็นเป้าหมายที่วัดผลได้
          </p>
        </div>

        <button
          id="save-goal-plan-btn"
          onClick={handleSave}
          disabled={isLoading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 text-xs sm:text-sm font-bold shadow-lg shadow-amber-500/25 active:scale-95 transition-all disabled:opacity-50 cursor-pointer shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>{saveSuccess ? "บันทึกสำเร็จแล้ว!" : "บันทึกแผนเป้าหมาย"}</span>
        </button>
      </div>

      {/* Top 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-white/80 border border-slate-200 backdrop-blur-md shadow-lg">
          <span className="text-xs text-slate-700 font-medium">เป้าหมายรายได้ต่อเดือน</span>
          <div className="text-2xl font-black text-amber-300 mt-1">
            ฿{monthlyGoal.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-700 mt-1 block">
            ต่อปี: ฿{(monthlyGoal * 12).toLocaleString()}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white/80 border border-slate-200 backdrop-blur-md shadow-lg">
          <span className="text-xs text-slate-700 font-medium">ส่วนต่างที่ขาดอยู่ (Gap)</span>
          <div className="text-2xl font-black text-rose-400 mt-1">
            ฿{incomeGap.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-700 mt-1 block">
            ทำได้แล้ว ฿{actualIncome.toLocaleString()} ({currentProgress}%)
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white/80 border border-slate-200 backdrop-blur-md shadow-lg">
          <span className="text-xs text-slate-700 font-medium">ระยะเวลาคาดการณ์สู่อิสรภาพ</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            ~{estimatedMonths} เดือน
          </div>
          <span className="text-[11px] text-slate-700 mt-1 block">
            ตามแผนรับสมัคร +{plannedRecruits} คน/เดือน
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white/80 border border-slate-200 backdrop-blur-md shadow-lg">
          <span className="text-xs text-slate-700 font-medium">เงินสำรองฉุกเฉิน 6 เดือน</span>
          <div className="text-2xl font-black text-blue-400 mt-1">
            ฿{reserveFund.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-700 mt-1 block">
            ค่าใช้จ่าย ฿{monthlyExpenses.toLocaleString()}/ด.
          </span>
        </div>

      </div>

      {/* Main Goal Configuration Form */}
      <div className="p-6 rounded-3xl bg-white/90 border border-slate-200/90 backdrop-blur-xl shadow-2xl space-y-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Wallet className="w-4 h-4 text-amber-400" />
          <span>ปรับแต่งตัวเลขเป้าหมายและทรัพยากรการทำงาน</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div>
            <label className="block text-slate-700 font-medium mb-1.5">เป้าหมายรายได้สุทธิต่อเดือน (บาท) *</label>
            <input
              type="number"
              value={monthlyGoal}
              onChange={(e) => setMonthlyGoal(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-white font-semibold focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1.5">วันที่เป้าหมายสำเร็จ (Target Date)</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-white font-semibold focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1.5">เป้าหมายสร้างผู้นำสายงาน (Leaders)</label>
            <input
              type="number"
              value={targetLeaders}
              onChange={(e) => setTargetLeaders(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-white font-semibold focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1.5">แผนรับสมัครตัวแทนใหม่ (คน/เดือน)</label>
            <input
              type="number"
              value={plannedRecruits}
              onChange={(e) => setPlannedRecruits(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-white font-semibold focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1.5">ชั่วโมงทุ่มเทการทำงาน (ชั่วโมง/สัปดาห์)</label>
            <input
              type="number"
              value={workHours}
              onChange={(e) => setWorkHours(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-white font-semibold focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1.5">ค่าใช้จ่ายดำรงชีพครอบครัวต่อเดือน (บาท)</label>
            <input
              type="number"
              value={monthlyExpenses}
              onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-white font-semibold focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>
      </div>

      {/* 4 Milestones Roadmap (25%, 50%, 75%, 100%) */}
      <div className="p-6 rounded-3xl bg-white/90 border border-slate-200/90 backdrop-blur-xl shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-400" />
              <span>แผนบันได 4 ขั้นสู่ความสำเร็จ (4-Stage Milestone Roadmap)</span>
            </h3>
            <p className="text-xs text-slate-700 mt-0.5">ติ๊กเครื่องหมายถูกเมื่อบรรลุหมุดหมายในแต่ละระดับ</p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 font-semibold">
            ความคืบหน้ารวม {currentProgress}%
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Milestone 25% */}
          <div className={`p-5 rounded-2xl border transition-all ${
            milestoneCompleted.p25 
              ? "bg-white/90 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]" 
              : "bg-white/60 border-slate-200"
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-blue-400">Milestone 25%</span>
              <input
                type="checkbox"
                checked={milestoneCompleted.p25}
                onChange={(e) => setMilestoneCompleted((prev) => ({ ...prev, p25: e.target.checked }))}
                className="w-4 h-4 accent-emerald-500 cursor-pointer"
              />
            </div>
            <h4 className="text-xs font-bold text-white mb-2">วางรากฐานทีม & ยอดส่วนตัว</h4>
            <div className="space-y-1 text-[11px] text-slate-700">
              <div>รายได้เป้าหมาย: <strong className="text-emerald-400">฿{Math.round(monthlyGoal * 0.25).toLocaleString()}</strong></div>
              <div>สมาชิกในทีม: <strong className="text-slate-900">3-5 คน</strong></div>
              <div>กำหนดเวลา: <span className="text-slate-700">มิ.ย. 2568</span></div>
            </div>
          </div>

          {/* Milestone 50% */}
          <div className={`p-5 rounded-2xl border transition-all ${
            milestoneCompleted.p50 
              ? "bg-white/90 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]" 
              : "bg-white/60 border-slate-200"
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-indigo-400">Milestone 50%</span>
              <input
                type="checkbox"
                checked={milestoneCompleted.p50}
                onChange={(e) => setMilestoneCompleted((prev) => ({ ...prev, p50: e.target.checked }))}
                className="w-4 h-4 accent-emerald-500 cursor-pointer"
              />
            </div>
            <h4 className="text-xs font-bold text-white mb-2">ขยายสายงาน & สร้าง 1 UM</h4>
            <div className="space-y-1 text-[11px] text-slate-700">
              <div>รายได้เป้าหมาย: <strong className="text-emerald-400">฿{Math.round(monthlyGoal * 0.5).toLocaleString()}</strong></div>
              <div>สมาชิกในทีม: <strong className="text-slate-900">7-10 คน</strong></div>
              <div>กำหนดเวลา: <span className="text-slate-700">ธ.ค. 2568</span></div>
            </div>
          </div>

          {/* Milestone 75% */}
          <div className={`p-5 rounded-2xl border transition-all ${
            milestoneCompleted.p75 
              ? "bg-white/90 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]" 
              : "bg-white/60 border-slate-200"
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-amber-400">Milestone 75%</span>
              <input
                type="checkbox"
                checked={milestoneCompleted.p75}
                onChange={(e) => setMilestoneCompleted((prev) => ({ ...prev, p75: e.target.checked }))}
                className="w-4 h-4 accent-emerald-500 cursor-pointer"
              />
            </div>
            <h4 className="text-xs font-bold text-white mb-2">ระบบผู้นำขยายตัวต่อเนื่อง</h4>
            <div className="space-y-1 text-[11px] text-slate-700">
              <div>รายได้เป้าหมาย: <strong className="text-emerald-400">฿{Math.round(monthlyGoal * 0.75).toLocaleString()}</strong></div>
              <div>สมาชิกในทีม: <strong className="text-slate-900">15-20 คน</strong></div>
              <div>กำหนดเวลา: <span className="text-slate-700">มิ.ย. 2569</span></div>
            </div>
          </div>

          {/* Milestone 100% */}
          <div className={`p-5 rounded-2xl border transition-all ${
            milestoneCompleted.p100 
              ? "bg-white/90 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]" 
              : "bg-white/60 border-slate-200"
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-purple-400">Milestone 100%</span>
              <input
                type="checkbox"
                checked={milestoneCompleted.p100}
                onChange={(e) => setMilestoneCompleted((prev) => ({ ...prev, p100: e.target.checked }))}
                className="w-4 h-4 accent-emerald-500 cursor-pointer"
              />
            </div>
            <h4 className="text-xs font-bold text-white mb-2">อิสรภาพทางการเงินสมบูรณ์</h4>
            <div className="space-y-1 text-[11px] text-slate-700">
              <div>รายได้เป้าหมาย: <strong className="text-emerald-400">฿{monthlyGoal.toLocaleString()}</strong></div>
              <div>สมาชิกในทีม: <strong className="text-slate-900">30+ คน</strong></div>
              <div>กำหนดเวลา: <span className="text-slate-700">ธ.ค. 2569</span></div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
