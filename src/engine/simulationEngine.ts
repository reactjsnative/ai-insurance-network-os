import { 
  SimulationParameters, 
  SimulationMonthResult, 
  ReverseGoalInput, 
  ReverseGoalOutput 
} from '../types';
import { calculateTotalIncome } from './calculationEngine';

export const DEFAULT_SIMULATION_PARAMS: SimulationParameters = {
  name: 'Standard Growth Scenario',
  initialAgents: 10,
  recruitmentPerMonth: 5,
  averageFYC: 20000,
  averageCOM: 6000,
  activationRate: 0.70, // 70% active
  retentionRate: 0.80, // 80% monthly retention on existing base
  promotionRate: 0.08, // 8% promoted to unit leader
  unitCreationRate: 0.05,
  centerCreationRate: 0.02,
  regionCreationRate: 0.005,
  monthsToSimulate: 36,
};

export function runGrowthSimulation(params: SimulationParameters): SimulationMonthResult[] {
  const {
    initialAgents,
    recruitmentPerMonth,
    averageFYC,
    averageCOM,
    activationRate,
    retentionRate,
    promotionRate,
    unitCreationRate,
    centerCreationRate,
    regionCreationRate,
    monthsToSimulate = 36,
  } = params;

  const results: SimulationMonthResult[] = [];

  let currentTotalMembers = initialAgents;
  let currentActive = Math.round(initialAgents * activationRate);

  for (let m = 1; m <= monthsToSimulate; m++) {
    // 1. Dynamic recruitment: base recruit + small network referral factor (each 10 active agents refer 1 extra)
    const organicRecruits = recruitmentPerMonth + Math.floor(currentActive * 0.05);
    
    // 2. Churn calculation based on retention rate
    // Monthly churn is (1 - retentionRate) of inactive and (1 - retentionRate)/2 of active
    const churned = Math.round((currentTotalMembers - currentActive) * (1 - retentionRate) + (currentActive * (1 - retentionRate) * 0.5));
    
    // 3. New total
    currentTotalMembers = Math.max(initialAgents, currentTotalMembers + organicRecruits - churned);
    currentActive = Math.min(currentTotalMembers, Math.round(currentTotalMembers * activationRate));
    const inactive = currentTotalMembers - currentActive;

    // 4. Leaders & structure
    const unitLeaders = Math.max(1, Math.floor(currentActive * promotionRate));
    const centerLeaders = Math.max(0, Math.floor(unitLeaders * centerCreationRate * 10));
    const regionLeaders = Math.max(0, Math.floor(centerLeaders * regionCreationRate * 20));

    const totalUnits = Math.max(1, Math.floor(unitLeaders * 1.2));
    const totalCenters = Math.max(0, Math.floor(centerLeaders * 1.1));
    const totalRegions = Math.max(0, regionLeaders);

    // 5. Volume metrics
    const teamFYC = currentActive * averageFYC;
    const teamCOM = currentActive * averageCOM;
    const renewalPremium = Math.round(teamFYC * (0.3 + (m * 0.02))); // grows with renewals

    // 6. Projected Income for top leader
    const topPosition = regionLeaders > 0 ? 'region_manager' : centerLeaders > 0 ? 'center_manager' : 'unit_manager';
    
    const incomeCalc = calculateTotalIncome({
      positionId: topPosition,
      personalFYC: averageFYC * 1.5,
      teamFYC,
      personalCOM: averageCOM * 1.5,
      teamCOM,
      firstYearPremium: teamFYC * 3,
      renewalPremium,
      directMembersCount: Math.min(25, 5 + Math.floor(m * 0.5)),
      activeMembersCount: currentActive,
      separatedUnitsCount: Math.max(0, totalUnits - 1),
      separatedCentersCount: Math.max(0, totalCenters),
      separatedRegionsCount: Math.max(0, totalRegions),
      centerFycList: Array(Math.max(1, totalCenters)).fill(teamFYC / Math.max(1, totalCenters)),
      annualFYC: teamFYC * 12,
      annualCOM: teamCOM * 12,
      calculationType: 'SIMULATION',
    });

    results.push({
      month: m,
      label: m % 12 === 0 ? `ปีที่ ${m / 12}` : `เดือนที่ ${m}`,
      totalMembers: currentTotalMembers,
      activeMembers: currentActive,
      inactiveMembers: inactive,
      newRecruits: organicRecruits,
      churnedMembers: churned,
      unitLeaders,
      centerLeaders,
      regionLeaders,
      totalUnits,
      totalCenters,
      totalRegions,
      teamFYC,
      teamCOM,
      projectedMonthlyIncome: incomeCalc.totalIncome,
      projectedAnnualRunRate: incomeCalc.totalIncome * 12,
    });
  }

  return results;
}

export function solveReverseGoal(input: ReverseGoalInput): ReverseGoalOutput {
  const {
    targetType,
    targetValue,
    targetMonths = 24,
    assumedRetentionRate = 0.85,
    assumedActivationRate = 0.70,
    assumedAverageFYC = 20000,
  } = input;

  let targetActive = 0;
  let targetIncome = 0;
  let targetFYC = 0;

  if (targetType === 'active_members') {
    targetActive = targetValue;
    targetFYC = targetActive * assumedAverageFYC;
    targetIncome = targetActive * 1200; // estimated aggregate income yield per active agent
  } else if (targetType === 'monthly_income') {
    targetIncome = targetValue;
    // rough inverse: 100k income typically requires ~60-80 active agents in a developed center/region structure
    targetActive = Math.max(10, Math.ceil(targetIncome / 1400));
    targetFYC = targetActive * assumedAverageFYC;
  } else {
    targetFYC = targetValue;
    targetActive = Math.max(5, Math.ceil(targetFYC / assumedAverageFYC));
    targetIncome = targetActive * 1200;
  }

  // Model required net recruits:
  // With monthly retention r and activation a, steady state active = (Recruits / (1 - r)) * a
  const monthlyDecay = 1 - assumedRetentionRate;
  const effectiveMonthlyDecay = Math.max(0.05, monthlyDecay);
  
  // Total recruits needed considering geometric series over targetMonths
  const requiredMonthlyRecruitment = Math.max(
    2,
    Math.ceil((targetActive / assumedActivationRate) * effectiveMonthlyDecay / (1 - Math.pow(assumedRetentionRate, targetMonths / 6)))
  );

  const requiredTotalRecruits = requiredMonthlyRecruitment * targetMonths;
  const estimatedUnits = Math.max(1, Math.ceil(targetActive / 10));
  const estimatedCenters = Math.max(0, Math.floor(estimatedUnits / 3));
  const estimatedRegions = Math.max(0, Math.floor(estimatedCenters / 4));

  let feasibilityScore: 'high' | 'moderate' | 'aggressive' | 'extreme' = 'moderate';
  if (requiredMonthlyRecruitment <= 5) feasibilityScore = 'high';
  else if (requiredMonthlyRecruitment <= 15) feasibilityScore = 'moderate';
  else if (requiredMonthlyRecruitment <= 35) feasibilityScore = 'aggressive';
  else feasibilityScore = 'extreme';

  // Milestone points
  const milestones = [
    {
      month: Math.round(targetMonths * 0.25),
      activeAgentsTarget: Math.round(targetActive * 0.20),
      monthlyRecruitTarget: requiredMonthlyRecruitment,
      milestoneName: 'รากฐานหน่วยงาน (Unit Foundation)',
    },
    {
      month: Math.round(targetMonths * 0.50),
      activeAgentsTarget: Math.round(targetActive * 0.45),
      monthlyRecruitTarget: requiredMonthlyRecruitment,
      milestoneName: 'สร้างผู้นำรุ่นแรก (Leader Formation)',
    },
    {
      month: Math.round(targetMonths * 0.75),
      activeAgentsTarget: Math.round(targetActive * 0.75),
      monthlyRecruitTarget: requiredMonthlyRecruitment,
      milestoneName: 'การแตกศูนย์ใหม่ (Center Separation)',
    },
    {
      month: targetMonths,
      activeAgentsTarget: targetActive,
      monthlyRecruitTarget: requiredMonthlyRecruitment,
      milestoneName: 'บรรลุเป้าหมายองค์กร (Goal Achievement)',
    },
  ];

  return {
    targetValue,
    targetMonths,
    requiredMonthlyRecruitment,
    requiredTotalRecruits,
    estimatedUnits,
    estimatedCenters,
    estimatedRegions,
    estimatedTeamFYC: targetFYC,
    estimatedMonthlyIncome: targetIncome,
    feasibilityScore,
    actionMilestones: milestones,
  };
}
