// Local types for the "Our team goal" submenu (from the Team AI Studio app export)
export type AgentRank =
  | 'AGENT'
  | 'SENIOR_AGENT'
  | 'UNIT_MANAGER'
  | 'DISTRICT_DIRECTOR'
  | 'EXECUTIVE_LEADER';

export type AgentStatus =
  | 'starter'
  | 'developing'
  | 'good'
  | 'gold'
  | 'leader'
  | 'attention';

export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'LEADER'
  | 'AGENT'
  | 'VIEWER';

export interface Member {
  id: string;
  member_id: string; // e.g. "AGT-1001"
  sponsor_id: string | null;
  parent_id: string | null;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  rank: AgentRank;
  role: UserRole;
  status: AgentStatus;
  joined_at: string;
  last_active_at: string;
  days_in_team: number;

  // Team metrics
  direct_count: number;
  team_total_count: number;
  active_members_count: number;

  // Financial metrics (THB)
  personal_production: number;
  team_production: number;
  actual_income: number;
  projected_income: number;
  income_goal: number;
  progress_percentage: number;
  consistency_score: number;
  success_score: number;

  // Goal and target dates
  target_date?: string;
  notes?: string;
  avatar_allowed?: boolean;
}

export interface FinancialGoalPlan {
  id: string;
  member_id: string;
  monthly_income_goal: number;
  annual_income_goal: number;
  target_date: string;
  current_members: number;
  planned_monthly_recruits: number;
  planned_work_hours_per_week: number;
  target_rank: AgentRank;
  target_leaders_count: number;
  monthly_living_expenses: number;
  reserve_fund_needed: number;
  gap_amount: number;
  estimated_months_to_freedom: number;
  milestones: {
    p25: { title: string; target_income: number; target_members: number; estimated_date: string; completed: boolean };
    p50: { title: string; target_income: number; target_members: number; estimated_date: string; completed: boolean };
    p75: { title: string; target_income: number; target_members: number; estimated_date: string; completed: boolean };
    p100: { title: string; target_income: number; target_members: number; estimated_date: string; completed: boolean };
  };
  daily_actions: string[];
  weekly_actions: string[];
  monthly_actions: string[];
  updated_at: string;
}
