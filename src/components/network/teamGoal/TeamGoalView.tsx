import React, { useMemo, useState } from 'react';
import { FinancialGoalPlanner } from './FinancialGoalPlanner';
import { Member, FinancialGoalPlan } from './types';
import { useApp } from '../../../context/AppContext';

const STORAGE_KEY = 'network_success_team_goal_v1';

// "Our team goal" — submenu of Network Success
// สร้างจากข้อมูล Team AI Studio app export (Financial Goal Planner)
export const TeamGoalView: React.FC = () => {
  const { selectedMember, members, activeUser } = useApp();

  const [goalPlan, setGoalPlan] = useState<FinancialGoalPlan | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as FinancialGoalPlan) : null;
    } catch {
      return null;
    }
  });
  const [isSaving, setIsSaving] = useState(false);

  // Map OS member -> Team member shape used by the planner
  const currentMember: Member | null = useMemo(() => {
    const src = selectedMember || activeUser || members[0];
    if (!src) return null;
    const teamTotal = (src as any).teamSize ?? (src as any).directCount ?? 0;
    const actualIncome = (src as any).personalCOM ?? (src as any).actual_income ?? 0;
    const incomeGoal = (src as any).incomeGoal ?? (src as any).income_goal ?? 250000;
    return {
      id: src.id,
      member_id: src.memberCode || src.id,
      sponsor_id: src.sponsorId || src.parentMemberId || null,
      parent_id: src.parentMemberId || src.sponsorId || null,
      name: src.name,
      avatar: src.avatarUrl || '',
      email: src.email || '',
      phone: src.phone || '',
      rank: 'UNIT_MANAGER' as const,
      role: 'ADMIN' as const,
      status: 'good' as const,
      joined_at: src.joinDate ? new Date(src.joinDate).toISOString() : new Date().toISOString(),
      last_active_at: new Date().toISOString(),
      days_in_team: 0,
      direct_count: (src as any).directCount ?? 0,
      team_total_count: teamTotal,
      active_members_count: teamTotal,
      personal_production: src.personalFYC || 0,
      team_production: (src as any).teamFYC || 0,
      actual_income: actualIncome,
      projected_income: actualIncome,
      income_goal: incomeGoal,
      progress_percentage: 0,
      consistency_score: 0,
      success_score: 0,
    };
  }, [selectedMember, activeUser, members]);

  const handleSaveGoalPlan = async (plan: FinancialGoalPlan) => {
    setIsSaving(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
      setGoalPlan(plan);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full">
      <FinancialGoalPlanner
        currentMember={currentMember}
        goalPlan={goalPlan}
        onSaveGoalPlan={handleSaveGoalPlan}
        isLoading={isSaving}
      />
    </div>
  );
};

export default TeamGoalView;
