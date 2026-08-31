import { GoalSimulationInput, GoalSimulationResult, PositionLevel, CompensationRuleSet } from '../types';
import { calculateMemberIncome } from './engine';
import { round2 } from '../lib/decimal';

export function simulateGoalRoadmap(
  input: GoalSimulationInput,
  rules: CompensationRuleSet
): GoalSimulationResult {
  const {
    targetMonthlyIncome,
    newRecruitsPerMonth,
    avgPersonalSalesPerPerson,
    activeRatePercent,
    simulationMonths = 12,
    currentTeamSize = 1,
  } = input;

  const activeRatio = Math.max(0.1, Math.min(1.0, activeRatePercent / 100));
  const timeline: GoalSimulationResult['projectedMonthlyIncomeTimeline'] = [];
  
  let monthsToReachGoal = -1;
  let runningTeamSize = Math.max(1, currentTeamSize);

  for (let m = 1; m <= simulationMonths; m++) {
    if (m > 1) {
      runningTeamSize += newRecruitsPerMonth;
    }

    const activeMembers = Math.max(1, Math.round(runningTeamSize * activeRatio));
    const projectedSales = activeMembers * avgPersonalSalesPerPerson;
    const projectedCom = projectedSales * 0.35; // approx 35% commission base
    const projectedFyc = projectedSales * 0.70; // approx 70% FYC

    // Estimate structural positions based on team size
    let estPosition: PositionLevel = 'AGENT';
    let estUnits = 0;
    let estCenters = 0;
    let estGroups = 0;

    if (runningTeamSize >= 40 || projectedSales >= rules.groupManager.qualMinPerformance) {
      estPosition = 'GROUP_MANAGER';
      estCenters = Math.max(4, Math.floor(runningTeamSize / 15));
      estUnits = estCenters * 3;
    } else if (runningTeamSize >= 12 || projectedSales >= rules.centerManager.qualMinPerformance) {
      estPosition = 'CENTER_MANAGER';
      estUnits = Math.max(2, Math.floor(runningTeamSize / 5));
    } else if (runningTeamSize >= 3 || projectedSales >= rules.unitManager.qualMinPerformance) {
      estPosition = 'UNIT_MANAGER';
      estUnits = Math.max(1, Math.floor(runningTeamSize / 3));
    }

    // Run engine on simulated synthetic member
    const syntheticMember = {
      id: 'sim-root',
      code: 'SIM-001',
      name: 'เป้าหมายจำลอง',
      position: estPosition,
      parentId: null,
      directUnitCount: estUnits,
      directCenterCount: estCenters,
      directGroupCount: estGroups,
      personalMonthlySales: avgPersonalSalesPerPerson,
      personalMonthlyCom: avgPersonalSalesPerPerson * 0.35,
      personalMonthlyFyc: avgPersonalSalesPerPerson * 0.70,
      personalRenewalPremium: projectedSales * 2.5,
      personalAnnualFyc: projectedFyc * 12,
      personalAnnualCom: projectedCom * 12,
      monthlyGoalIncome: targetMonthlyIncome,
      annualGoalIncome: targetMonthlyIncome * 12,
      monthlyGoalFyc: projectedFyc,
      annualGoalFyc: projectedFyc * 12,
      startDate: '2024-01-01',
      tenureMonths: m + 6,
      isActive: true,
    };

    // Synthesize subordinate members for team total
    const syntheticSubordinates = [];
    for (let i = 1; i <= activeMembers - 1; i++) {
      syntheticSubordinates.push({
        id: `sim-child-${i}`,
        code: `SIM-C${i}`,
        name: `สมาชิกทีมที่ ${i}`,
        position: i <= estCenters ? 'CENTER_MANAGER' as PositionLevel : i <= estUnits ? 'UNIT_MANAGER' as PositionLevel : 'AGENT' as PositionLevel,
        parentId: 'sim-root',
        personalMonthlySales: avgPersonalSalesPerPerson,
        personalMonthlyCom: avgPersonalSalesPerPerson * 0.35,
        personalMonthlyFyc: avgPersonalSalesPerPerson * 0.70,
        personalRenewalPremium: avgPersonalSalesPerPerson * 2,
        personalAnnualFyc: avgPersonalSalesPerPerson * 0.70 * 12,
        personalAnnualCom: avgPersonalSalesPerPerson * 0.35 * 12,
        monthlyGoalIncome: 30000,
        annualGoalIncome: 360000,
        monthlyGoalFyc: 20000,
        annualGoalFyc: 240000,
        startDate: '2024-01-01',
        tenureMonths: 6,
        isActive: true,
      });
    }

    const simResult = calculateMemberIncome(syntheticMember, [syntheticMember, ...syntheticSubordinates], rules);
    const projectedIncome = simResult.totalMonthlyIncome;
    const achieved = projectedIncome >= targetMonthlyIncome;

    if (achieved && monthsToReachGoal === -1) {
      monthsToReachGoal = m;
    }

    timeline.push({
      month: m,
      teamSize: runningTeamSize,
      activeMembers,
      projectedSales: round2(projectedSales),
      projectedIncome: round2(projectedIncome),
      achievedGoal: achieved,
      estimatedPosition: estPosition,
    });
  }

  // Calculate required team parameters specifically for target income
  // Approximate solve
  const lastMonth = timeline[timeline.length - 1];
  const reqTotalMonthlySales = targetMonthlyIncome > 200000 
    ? targetMonthlyIncome * 3.5 
    : targetMonthlyIncome > 80000 
    ? targetMonthlyIncome * 2.8 
    : targetMonthlyIncome * 2.4;

  const reqActiveMembers = Math.max(1, Math.ceil(reqTotalMonthlySales / (avgPersonalSalesPerPerson || 25000)));
  const reqTotalTeamSize = Math.max(1, Math.ceil(reqActiveMembers / activeRatio));

  let reqUnits = 0;
  let reqCenters = 0;
  let reqGroups = 0;
  if (targetMonthlyIncome >= 250000) {
    reqGroups = 1;
    reqCenters = 4;
    reqUnits = 12;
  } else if (targetMonthlyIncome >= 80000) {
    reqCenters = 2;
    reqUnits = 6;
  } else if (targetMonthlyIncome >= 35000) {
    reqUnits = 2;
  }

  let feasibility: GoalSimulationResult['feasibilityScore'] = 'MODERATE';
  if (monthsToReachGoal > 0 && monthsToReachGoal <= 4) feasibility = 'EASY';
  else if (monthsToReachGoal > 4 && monthsToReachGoal <= 9) feasibility = 'MODERATE';
  else if (monthsToReachGoal > 9 && monthsToReachGoal <= simulationMonths) feasibility = 'CHALLENGING';
  else feasibility = 'AMBITIOUS';

  const advice: string[] = [];
  advice.push(`ต้องมีสมาชิกในทีมอย่างน้อย ${reqTotalTeamSize} คน (Active ${reqActiveMembers} คน ที่ ${activeRatePercent}%)`);
  if (reqCenters > 0) {
    advice.push(`ควรเร่งพัฒนาและแยกผู้บริหารศูนย์อย่างน้อย ${reqCenters} ศูนย์ เพื่อปลดล็อกค่าจัดงานศูนย์และค่าแยกศูนย์`);
  }
  if (reqUnits > 0) {
    advice.push(`สร้างผู้บริหารหน่วยใหม่ ${reqUnits} หน่วย จะสร้างรายได้คงที่จากค่าแยกหน่วย ${(reqUnits * rules.unitManager.unitSeparationPerUnit).toLocaleString()} บาท/เดือน`);
  }
  advice.push(`รักษาผลงานเฉลี่ยต่อคนให้ไม่ต่ำกว่า ${avgPersonalSalesPerPerson.toLocaleString()} บาท/เดือน`);
  if (newRecruitsPerMonth > 0) {
    advice.push(`อัตราการรีครูท ${newRecruitsPerMonth} คน/เดือน จะช่วยให้เป้าหมายสำเร็จเร็วขึ้น ${Math.min(4, Math.floor(newRecruitsPerMonth * 1.5))} เดือน`);
  }

  return {
    monthsToReachGoal: monthsToReachGoal > 0 ? monthsToReachGoal : simulationMonths + 1,
    requiredTotalTeamSize: reqTotalTeamSize,
    requiredActiveMembers: reqActiveMembers,
    requiredUnits: reqUnits,
    requiredCenters: reqCenters,
    requiredGroups: reqGroups,
    requiredTotalMonthlySales: round2(reqTotalMonthlySales),
    projectedMonthlyIncomeTimeline: timeline,
    feasibilityScore: feasibility,
    strategicAdvice: advice,
  };
}
