export type PositionLevel = 'AGENT' | 'UNIT_MANAGER' | 'CENTER_MANAGER' | 'GROUP_MANAGER';

export interface PositionInfo {
  id: PositionLevel;
  nameTh: string;
  nameEn: string;
  badgeColor: string;
  accentColor: string;
  order: number;
  minPerformance: number;
  minMonths: number;
  maxMonths: number;
  requiredUnits?: number;
  requiredCenters?: number;
  description: string;
}

export interface Member {
  id: string;
  code: string;
  name: string;
  nickname?: string;
  avatarUrl?: string;
  position: PositionLevel;
  parentId: string | null; // Direct manager ID
  directUnitCount?: number; // Number of spawned units
  directCenterCount?: number; // Number of spawned centers
  directGroupCount?: number; // Number of spawned groups
  
  // Performance data (Monthly)
  personalMonthlySales: number; // ผลงานส่วนตัวรายเดือน (FYP / เบี้ยปีแรก)
  personalMonthlyCom: number; // COM รายเดือน
  personalMonthlyFyc: number; // FYC รายเดือน (First Year Commission)
  personalRenewalPremium: number; // เบี้ยปีต่อไป (Renewal Premium)
  
  // Performance data (Annual)
  personalAnnualFyc: number; // FYC รายปี
  personalAnnualCom: number; // COM รายปี
  
  // Goals
  monthlyGoalIncome: number;
  annualGoalIncome: number;
  monthlyGoalFyc: number;
  annualGoalFyc: number;
  
  // Metadata
  startDate: string;
  tenureMonths: number;
  isActive: boolean;
  notes?: string;
  region?: string;
  isNewCenter?: boolean;
}

export interface CompensationRuleTier {
  id: string;
  minAmount: number;
  maxAmount?: number; // undefined means infinity
  ratePercentage?: number; // e.g. 25 for 25%
  fixedAmount?: number; // e.g. 5000 baht
  label: string;
}

export interface CompensationRuleSet {
  version: string;
  updatedAt: string;
  effectiveDate: string;
  expiryDate?: string;
  status: 'OFFICIAL_DOCUMENT_2564' | 'CUSTOM_APPROVED' | 'DRAFT';
  approvedBy?: string;
  notes: string;

  // 1. Unit Manager Rules (ผู้บริหารหน่วย)
  unitManager: {
    qualMinPerformance: number;
    qualMonthsMin: number;
    qualMonthsMax: number;
    commissionRateDefault: number; // default personal commission %
    vehicleAllowance: number; // fixed vehicle allowance if any
    unitManagementTiers: CompensationRuleTier[]; // 5k->25%, 10k->30%, 20k->35%, 35k->40%
    unitSeparationPerUnit: number; // 2,000 baht per unit
  };

  // 2. Center Manager Rules (ผู้บริหารศูนย์)
  centerManager: {
    qualMinPerformance: number;
    qualMonthsMin: number;
    qualMonthsMax: number;
    qualMinSeparatedUnits: number; // 2
    centerType1Tiers: CompensationRuleTier[]; // COM: 15k->15%, 30k->20%, 60k->25%, 120k->30%
    centerType2Enabled: boolean; // Renewal premium %
    centerType2Rate: number; // 0.8%
    centerType3Tiers: CompensationRuleTier[]; // COM: 15k->5k, 30k->8k, 60k->11k, 120k->15k
    centerSeparationTiers: CompensationRuleTier[]; // COM: 15k->1.5k, 30k->2.0k, 60k->2.5k, 120k->3.0k
    centerSeparationFirstMonthBooster: number; // Extra in first month
    centerAnnualBonusTiers: CompensationRuleTier[]; // Annual COM: 150k->4%, 300k->5%, 600k->6%
  };

  // 3. Group Manager Rules (ผู้บริหารภาค)
  groupManager: {
    qualMinPerformance: number;
    qualMonthsMin: number;
    qualMonthsMax: number;
    qualMinSeparatedCenters: number; // 4
    groupType1Tiers: CompensationRuleTier[]; // Team FYC: 60k->10%, 120k->12%, 180k->14%, 240k->16%, 300k->18%
    groupType1RegionalNotes?: string;
    groupType2Tiers: CompensationRuleTier[]; // Center Mgrs FYC: 15k->1k, 30k->1.5k, 60k->2k, 120k->2.5k
    groupAnnualBonusTiers: CompensationRuleTier[]; // Annual FYC: 500k-999k->1.5%, 1M-1.99M->2.0%, >=2M->2.5%
    groupSeparationType1Fixed: number; // 8,000 THB one-time
    groupSeparationType2Monthly: number; // 4,000 THB/month for 12 months
    groupSeparationType3PercentOfT1: number; // 40%
    targetManagementAllowanceTiers: {
      annualFycMin: number;
      annualReward: number;
      monthlyReward: number;
    }[];
  };
}

export type IncomeItemCategory = 
  | 'PERSONAL_COMMISSION'
  | 'VEHICLE_ALLOWANCE'
  | 'UNIT_MANAGEMENT'
  | 'UNIT_SEPARATION'
  | 'CENTER_TYPE_1'
  | 'CENTER_TYPE_2'
  | 'CENTER_TYPE_3'
  | 'CENTER_SEPARATION'
  | 'CENTER_ANNUAL_BONUS'
  | 'GROUP_TYPE_1'
  | 'GROUP_TYPE_2'
  | 'GROUP_ANNUAL_BONUS'
  | 'GROUP_SEPARATION'
  | 'TARGET_MANAGEMENT_ALLOWANCE';

export interface IncomeBreakdownItem {
  id: string;
  category: IncomeItemCategory;
  categoryNameTh: string;
  tierOrRuleId: string;
  baseAmount: number;
  rateOrAmount: number;
  isPercentage: boolean;
  calculatedAmount: number;
  formulaDescription: string;
  sourceMemberId?: string;
  sourceMemberName?: string;
  sourceTeamRole?: string;
  status: 'CONFIRMED' | 'PENDING_CONDITIONS';
  isDuplicateRiskChecked: boolean;
  notes?: string;
}

export interface MemberIncomeResult {
  memberId: string;
  memberName: string;
  position: PositionLevel;
  
  // Categorized summary
  personalIncomeTotal: number;
  unitManagementIncomeTotal: number;
  centerManagementIncomeTotal: number;
  groupManagementIncomeTotal: number;
  monthlyBonusTotal: number;
  annualBonusTotal: number;
  
  // Grand totals
  totalMonthlyIncome: number;
  totalAnnualIncome: number;
  pendingConditionIncome: number; // รายได้ที่ยังไม่ผ่านเงื่อนไข
  
  // Line items
  breakdown: IncomeBreakdownItem[];
  
  // Team rollups
  teamMemberCount: number;
  teamActiveMemberCount: number;
  teamTotalMonthlySales: number;
  teamTotalMonthlyCom: number;
  teamTotalMonthlyFyc: number;
  teamTotalAnnualFyc: number;
  teamTotalRenewalPremium: number;
  
  // Unit & Center counts
  separatedUnitsCount: number;
  separatedCentersCount: number;
  separatedGroupsCount: number;
  
  // Promotion Gap Analysis
  nextPosition: PositionLevel | null;
  promotionRequirementsMet: boolean;
  missingPerformanceForPromotion: number;
  missingUnitsForPromotion: number;
  missingCentersForPromotion: number;
  missingMonthsForPromotion: number;
  promotionChecklist: {
    item: string;
    required: string;
    current: string;
    met: boolean;
  }[];
}

export interface GoalSimulationInput {
  targetMonthlyIncome: number;
  newRecruitsPerMonth: number;
  avgPersonalSalesPerPerson: number;
  activeRatePercent: number; // e.g. 70%
  simulationMonths: number;
  currentTeamSize: number;
}

export interface GoalSimulationResult {
  monthsToReachGoal: number;
  requiredTotalTeamSize: number;
  requiredActiveMembers: number;
  requiredUnits: number;
  requiredCenters: number;
  requiredGroups: number;
  requiredTotalMonthlySales: number;
  projectedMonthlyIncomeTimeline: {
    month: number;
    teamSize: number;
    activeMembers: number;
    projectedSales: number;
    projectedIncome: number;
    achievedGoal: boolean;
    estimatedPosition: PositionLevel;
  }[];
  feasibilityScore: 'EASY' | 'MODERATE' | 'CHALLENGING' | 'AMBITIOUS';
  strategicAdvice: string[];
}

export interface ScenarioSimulation {
  id: string;
  name: string;
  description: string;
  teamSize: number;
  activeRate: number;
  avgFycPerPerson: number;
  position: PositionLevel;
  separatedUnits: number;
  separatedCenters: number;
  renewalPremium: number;
  calculatedMonthlyIncome: number;
  calculatedAnnualIncome: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userEmail: string;
  action: string;
  details: string;
  previousVersion?: string;
  newVersion?: string;
}
