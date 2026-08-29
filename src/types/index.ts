export type PositionId = 
  | 'agent'
  | 'unit_manager'
  | 'center_manager'
  | 'region_manager'
  | 'senior_unit_manager'
  | 'senior_center_manager'
  | 'executive_region'
  | 'national_leader'
  | string;

export interface Position {
  id: PositionId;
  name: string;
  nameEn: string;
  level: number;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  isCustom?: boolean;
  qualification: {
    minFyc: number;
    periodMonths: number;
    requiredSeparations?: {
      positionId: PositionId;
      count: number;
    };
    description: string;
  };
}

export type CalculationType = 'ACTUAL' | 'PROJECTED' | 'SIMULATION';

export type UserRole = 
  | 'super_admin'
  | 'admin'
  | 'regional_manager'
  | 'center_manager'
  | 'unit_manager'
  | 'agent'
  | 'viewer';

export interface LocationInfo {
  province: string;
  region: 'Bangkok & Metro' | 'Central' | 'North' | 'Northeast' | 'East' | 'South';
  lat: number;
  lng: number;
}

export interface Member {
  id: string;
  memberCode: string;
  name: string;
  nickname?: string;
  avatarUrl: string;
  positionId: PositionId;
  role: UserRole;
  sponsorId: string | null; // ผู้แนะนำ
  parentMemberId: string | null; // หัวหน้าสายตรง
  unitId: string | null;
  centerId: string | null;
  regionId: string | null;
  joinDate: string; // YYYY-MM-DD
  status: 'active' | 'inactive' | 'probation';
  phone?: string;
  email?: string;
  location: LocationInfo;
  
  // Performance
  personalFYC: number;
  personalCOM: number;
  firstYearPremium: number;
  renewalPremium: number;
  
  // Custom metadata
  separatedUnitsCount?: number;
  separatedCentersCount?: number;
  separatedRegionsCount?: number;
}

export interface MonthlyPerformanceRecord {
  month: string; // YYYY-MM
  memberId: string;
  personalFYC: number;
  teamFYC: number;
  personalCOM: number;
  teamCOM: number;
  firstYearPremium: number;
  renewalPremium: number;
  directMembersCount: number;
  activeMembersCount: number;
  calculatedIncome: number;
}

export interface IncomeBreakdownItem {
  id: string;
  incomeType: string;
  title: string;
  category: 'personal' | 'unit' | 'center' | 'region' | 'special';
  amount: number;
  basisName: string;
  basisValue: number;
  rateOrFormula: string;
  ruleVersion: string;
  effectiveDate: string;
  calculationDetails: string;
  isQualified: boolean;
  notes?: string;
}

export interface IncomeCalculationResult {
  memberId?: string;
  positionId: PositionId;
  period: string; // e.g. "2026-08"
  calculationType: CalculationType;
  planVersionId: string;
  planVersionName: string;
  totalIncome: number;
  breakdown: IncomeBreakdownItem[];
  summary: {
    personalCommission: number;
    unitIncomes: number;
    centerIncomes: number;
    regionIncomes: number;
    bonusIncomes: number;
  };
  metricsUsed: {
    personalFYC: number;
    teamFYC: number;
    personalCOM: number;
    teamCOM: number;
    renewalPremium: number;
    firstYearPremium: number;
    directCount: number;
    activeCount: number;
    separatedUnits: number;
    separatedCenters: number;
    separatedRegions: number;
  };
}

export type RuleType = 
  | 'percentage'
  | 'fixed_amount'
  | 'tier_percentage'
  | 'tier_fixed'
  | 'per_unit_fixed'
  | 'per_center_tiered'
  | 'per_region_fixed'
  | 'annual_bonus_tier'
  | 'target_management_tier'
  | 'custom_formula';

export interface TierStep {
  min: number;
  max?: number;
  rate?: number; // e.g., 0.25 for 25%
  fixedAmount?: number;
}

export interface CompensationRule {
  id: string;
  planVersionId: string;
  incomeType: string;
  name: string;
  positionId: PositionId;
  ruleType: RuleType;
  basis: 'personal_com' | 'team_com' | 'personal_fyc' | 'team_fyc' | 'renewal_premium' | 'annual_fyc' | 'annual_com' | 'separated_units' | 'separated_centers' | 'separated_regions';
  frequency: 'monthly' | 'quarterly' | 'annual' | 'one_time';
  durationMonths?: number;
  tiers?: TierStep[];
  rate?: number;
  fixedAmount?: number;
  minimumQualification?: {
    minFyc?: number;
    minCom?: number;
    minUnits?: number;
    minCenters?: number;
  };
  effectiveDate: string;
  expirationDate?: string;
  status: 'active' | 'inactive' | 'requires_verification';
  description: string;
}

export interface CompensationPlanVersion {
  id: string;
  name: string;
  code: string;
  effectiveDate: string;
  expirationDate?: string;
  status: 'active' | 'draft' | 'archived';
  description: string;
  rules: CompensationRule[];
  createdAt: string;
  updatedAt: string;
  author: string;
}

export interface CareerProgress {
  currentPosition: Position;
  nextPosition: Position | null;
  currentFYC: number;
  requiredFYC: number;
  fycProgressPercent: number;
  currentUnits: number;
  requiredUnits: number;
  unitsProgressPercent: number;
  currentCenters: number;
  requiredCenters: number;
  centersProgressPercent: number;
  overallProgressPercent: number;
  timeRemainingMonths: number;
  isEligibleForPromotion: boolean;
  mathematicalProjection: {
    monthlyRunRateFYC: number;
    estimatedMonthsToPromotion: number | null;
    recommendationText: string;
    gapFYC: number;
    gapUnits: number;
    gapCenters: number;
  };
}

export interface SimulationParameters {
  name: string;
  initialAgents: number;
  recruitmentPerMonth: number;
  averageFYC: number;
  averageCOM: number;
  activationRate: number; // 0.0 - 1.0 (e.g. 0.70)
  retentionRate: number; // 0.0 - 1.0 (e.g. 0.80)
  promotionRate: number; // 0.0 - 1.0 (e.g. 0.08)
  unitCreationRate: number; // e.g. 0.05
  centerCreationRate: number; // e.g. 0.02
  regionCreationRate: number; // e.g. 0.005
  monthsToSimulate: number;
}

export interface SimulationMonthResult {
  month: number;
  label: string;
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  newRecruits: number;
  churnedMembers: number;
  unitLeaders: number;
  centerLeaders: number;
  regionLeaders: number;
  totalUnits: number;
  totalCenters: number;
  totalRegions: number;
  teamFYC: number;
  teamCOM: number;
  projectedMonthlyIncome: number;
  projectedAnnualRunRate: number;
}

export interface ReverseGoalInput {
  targetType: 'active_members' | 'monthly_income' | 'annual_fyc';
  targetValue: number;
  targetMonths: number;
  assumedRetentionRate: number;
  assumedActivationRate: number;
  assumedAverageFYC: number;
}

export interface ReverseGoalOutput {
  targetValue: number;
  targetMonths: number;
  requiredMonthlyRecruitment: number;
  requiredTotalRecruits: number;
  estimatedUnits: number;
  estimatedCenters: number;
  estimatedRegions: number;
  estimatedTeamFYC: number;
  estimatedMonthlyIncome: number;
  feasibilityScore: 'high' | 'moderate' | 'aggressive' | 'extreme';
  actionMilestones: {
    month: number;
    activeAgentsTarget: number;
    monthlyRecruitTarget: number;
    milestoneName: string;
  }[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  entityType: 'rule' | 'plan_version' | 'member' | 'position' | 'settings';
  entityId: string;
  oldValue: string;
  newValue: string;
  reason: string;
}

export interface NetworkNode {
  id: string;
  member: Member;
  level: number;
  children: NetworkNode[];
  totalDownline: number;
  activeDownline: number;
  teamFYC: number;
  teamCOM: number;
  unitsCount: number;
  centersCount: number;
  isExpanded?: boolean;
}

export type AuthProvider = 'email' | 'google' | 'tiktok' | 'facebook' | 'github' | 'gitlab' | 'bitbucket' | 'demo';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
  provider: AuthProvider;
  connectedProviders: AuthProvider[];
  memberId: string;
  role: UserRole;
  positionId: PositionId;
  isLoggedIn: boolean;
  lastLoginAt: string;
  phone?: string;
  tiktokHandle?: string;
  facebookId?: string;
  is2FAEnabled?: boolean;
  token?: string;
}

export interface LoginCredentials {
  email: string;
  password?: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  positionId?: PositionId;
  sponsorCode?: string;
  provider?: AuthProvider;
}
