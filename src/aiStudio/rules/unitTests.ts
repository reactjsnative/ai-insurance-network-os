import { Member, CompensationRuleSet } from '../types';
import { DEFAULT_COMPENSATION_RULES } from './defaultRules';
import { calculateMemberIncome } from './engine';

export interface TestCaseResult {
  id: string;
  category: string;
  testName: string;
  description: string;
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
  notes?: string;
}

export function runAllUnitTests(customRules: CompensationRuleSet = DEFAULT_COMPENSATION_RULES): {
  totalTests: number;
  passedCount: number;
  failedCount: number;
  results: TestCaseResult[];
} {
  const results: TestCaseResult[] = [];

  function addTest(
    id: string,
    category: string,
    testName: string,
    description: string,
    input: string,
    expectedVal: number | string | boolean,
    actualVal: number | string | boolean,
    notes?: string
  ) {
    const passed = typeof expectedVal === 'number' && typeof actualVal === 'number'
      ? Math.abs(expectedVal - actualVal) < 0.01
      : expectedVal === actualVal;
    
    results.push({
      id,
      category,
      testName,
      description,
      input,
      expected: String(expectedVal),
      actual: String(actualVal),
      passed,
      notes,
    });
  }

  // ----------------------------------------------------
  // TEST SUITE 1: UNIT MANAGER (ค่าจัดงานหน่วย)
  // ----------------------------------------------------
  const baseUm: Member = {
    id: 'test-um',
    code: 'UM001',
    name: 'ทดสอบ ผู้บริหารหน่วย',
    position: 'UNIT_MANAGER',
    parentId: null,
    personalMonthlySales: 0,
    personalMonthlyCom: 0,
    personalMonthlyFyc: 0,
    personalRenewalPremium: 0,
    personalAnnualFyc: 0,
    personalAnnualCom: 0,
    monthlyGoalIncome: 50000,
    annualGoalIncome: 600000,
    monthlyGoalFyc: 30000,
    annualGoalFyc: 360000,
    startDate: '2024-01-01',
    tenureMonths: 6,
    isActive: true,
  };

  // Test 1.1: Below min boundary (4,999 -> 0%)
  const res1 = calculateMemberIncome({ ...baseUm, personalMonthlySales: 4999 }, [], customRules);
  addTest(
    'UM-BND-0',
    'ค่าจัดงานหน่วย',
    'ยอดต่ำกว่าเกณฑ์ขั้นต่ำ 5,000 (4,999 บาท)',
    'ไม่ได้รับค่าจัดงานหน่วย (0 บาท)',
    'ยอดขาย 4,999 ฿',
    0,
    res1.unitManagementIncomeTotal
  );

  // Test 1.2: Boundary 5,000 (25% -> 1,250 บาท)
  const res2 = calculateMemberIncome({ ...baseUm, personalMonthlySales: 5000 }, [], customRules);
  const um5kAmt = (res2.breakdown.find(b => b.category === 'UNIT_MANAGEMENT')?.calculatedAmount || 0);
  addTest(
    'UM-BND-1',
    'ค่าจัดงานหน่วย',
    'ขอบล่างขั้นที่ 1 (5,000 บาท x 25%)',
    '5,000 x 25% = 1,250 บาท',
    'ยอดขาย 5,000 ฿',
    1250,
    um5kAmt
  );

  // Test 1.3: Boundary 9,999 (25% -> 2,499.75 บาท)
  const res3 = calculateMemberIncome({ ...baseUm, personalMonthlySales: 9999 }, [], customRules);
  const um9999Amt = (res3.breakdown.find(b => b.category === 'UNIT_MANAGEMENT')?.calculatedAmount || 0);
  addTest(
    'UM-BND-2',
    'ค่าจัดงานหน่วย',
    'ขอบบนขั้นที่ 1 (9,999 บาท x 25%)',
    '9,999 x 25% = 2,499.75 บาท',
    'ยอดขาย 9,999 ฿',
    2499.75,
    um9999Amt
  );

  // Test 1.4: Boundary 10,000 (30% -> 3,000 บาท)
  const res4 = calculateMemberIncome({ ...baseUm, personalMonthlySales: 10000 }, [], customRules);
  const um10kAmt = (res4.breakdown.find(b => b.category === 'UNIT_MANAGEMENT')?.calculatedAmount || 0);
  addTest(
    'UM-BND-3',
    'ค่าจัดงานหน่วย',
    'ขอบล่างขั้นที่ 2 (10,000 บาท x 30%)',
    '10,000 x 30% = 3,000 บาท',
    'ยอดขาย 10,000 ฿',
    3000,
    um10kAmt
  );

  // Test 1.5: Boundary 20,000 (35% -> 7,000 บาท)
  const res5 = calculateMemberIncome({ ...baseUm, personalMonthlySales: 20000 }, [], customRules);
  const um20kAmt = (res5.breakdown.find(b => b.category === 'UNIT_MANAGEMENT')?.calculatedAmount || 0);
  addTest(
    'UM-BND-4',
    'ค่าจัดงานหน่วย',
    'ขอบล่างขั้นที่ 3 (20,000 บาท x 35%)',
    '20,000 x 35% = 7,000 บาท',
    'ยอดขาย 20,000 ฿',
    7000,
    um20kAmt
  );

  // Test 1.6: Boundary 35,000 (40% -> 14,000 บาท)
  const res6 = calculateMemberIncome({ ...baseUm, personalMonthlySales: 35000 }, [], customRules);
  const um35kAmt = (res6.breakdown.find(b => b.category === 'UNIT_MANAGEMENT')?.calculatedAmount || 0);
  addTest(
    'UM-BND-5',
    'ค่าจัดงานหน่วย',
    'ขอบล่างขั้นสูงสุด (35,000 บาท x 40%)',
    '35,000 x 40% = 14,000 บาท',
    'ยอดขาย 35,000 ฿',
    14000,
    um35kAmt
  );

  // Test 1.7: Unit Separation (1 to 5 units: 2,000 to 10,000)
  for (let u = 1; u <= 5; u++) {
    const resU = calculateMemberIncome({ ...baseUm, directUnitCount: u }, [], customRules);
    const sepAmt = (resU.breakdown.find(b => b.category === 'UNIT_SEPARATION')?.calculatedAmount || 0);
    addTest(
      `UM-SEP-${u}`,
      'ค่าแยกหน่วย',
      `แยกหน่วยสำเร็จ ${u} หน่วย`,
      `${u} x 2,000 = ${u * 2000} บาท`,
      `จำนวนหน่วย ${u}`,
      u * 2000,
      sepAmt
    );
  }

  // ----------------------------------------------------
  // TEST SUITE 2: CENTER MANAGER (ผู้บริหารศูนย์)
  // ----------------------------------------------------
  const baseCm: Member = {
    id: 'test-cm',
    code: 'CM001',
    name: 'ทดสอบ ผู้บริหารศูนย์',
    position: 'CENTER_MANAGER',
    parentId: null,
    personalMonthlySales: 0,
    personalMonthlyCom: 0,
    personalMonthlyFyc: 0,
    personalRenewalPremium: 0,
    personalAnnualFyc: 0,
    personalAnnualCom: 0,
    monthlyGoalIncome: 100000,
    annualGoalIncome: 1200000,
    monthlyGoalFyc: 50000,
    annualGoalFyc: 600000,
    startDate: '2023-01-01',
    tenureMonths: 12,
    isActive: true,
  };

  // Center Type 1 COM boundaries: 14,999 vs 15,000 (15%)
  const resCm1 = calculateMemberIncome({ ...baseCm, personalMonthlyCom: 14999 }, [], customRules);
  const cmT1Below = (resCm1.breakdown.find(b => b.category === 'CENTER_TYPE_1' && b.status === 'CONFIRMED')?.calculatedAmount || 0);
  addTest('CM-T1-BND-0', 'ค่าจัดงานศูนย์ 1', 'COM ต่ำกว่า 15,000 (14,999 บาท)', '0 บาท (ยังไม่ผ่านเกณฑ์)', 'COM 14,999 ฿', 0, cmT1Below);

  const resCm2 = calculateMemberIncome({ ...baseCm, personalMonthlyCom: 15000 }, [], customRules);
  const cmT1_15k = (resCm2.breakdown.find(b => b.category === 'CENTER_TYPE_1')?.calculatedAmount || 0);
  addTest('CM-T1-BND-1', 'ค่าจัดงานศูนย์ 1', 'COM ขอบล่าง 15,000 (15%)', '15,000 x 15% = 2,250 บาท', 'COM 15,000 ฿', 2250, cmT1_15k);

  const resCm3 = calculateMemberIncome({ ...baseCm, personalMonthlyCom: 30000 }, [], customRules);
  const cmT1_30k = (resCm3.breakdown.find(b => b.category === 'CENTER_TYPE_1')?.calculatedAmount || 0);
  addTest('CM-T1-BND-2', 'ค่าจัดงานศูนย์ 1', 'COM ขอบล่าง 30,000 (20%)', '30,000 x 20% = 6,000 บาท', 'COM 30,000 ฿', 6000, cmT1_30k);

  const resCm4 = calculateMemberIncome({ ...baseCm, personalMonthlyCom: 60000 }, [], customRules);
  const cmT1_60k = (resCm4.breakdown.find(b => b.category === 'CENTER_TYPE_1')?.calculatedAmount || 0);
  addTest('CM-T1-BND-3', 'ค่าจัดงานศูนย์ 1', 'COM ขอบล่าง 60,000 (25%)', '60,000 x 25% = 15,000 บาท', 'COM 60,000 ฿', 15000, cmT1_60k);

  const resCm5 = calculateMemberIncome({ ...baseCm, personalMonthlyCom: 120000 }, [], customRules);
  const cmT1_120k = (resCm5.breakdown.find(b => b.category === 'CENTER_TYPE_1')?.calculatedAmount || 0);
  addTest('CM-T1-BND-4', 'ค่าจัดงานศูนย์ 1', 'COM ขอบล่าง 120,000 (30%)', '120,000 x 30% = 36,000 บาท', 'COM 120,000 ฿', 36000, cmT1_120k);

  // Center Type 2: 0.8% renewal
  const resCmRenew = calculateMemberIncome({ ...baseCm, personalRenewalPremium: 500000 }, [], customRules);
  const cmT2Amt = (resCmRenew.breakdown.find(b => b.category === 'CENTER_TYPE_2')?.calculatedAmount || 0);
  addTest('CM-T2-RENEW', 'ค่าจัดงานศูนย์ 2', 'เบี้ยปีต่อไป 500,000 บาท x 0.8%', '500,000 x 0.8% = 4,000 บาท', 'เบี้ยปีต่อไป 500,000 ฿', 4000, cmT2Amt);

  // Center Type 3: Fixed tiered awards (5k, 8k, 11k, 15k)
  const cmT3_15k = (resCm2.breakdown.find(b => b.category === 'CENTER_TYPE_3')?.calculatedAmount || 0);
  addTest('CM-T3-1', 'ค่าจัดงานศูนย์ 3', 'COM 15,000 บาท (คงที่ 5,000 ฿)', '5,000 บาท', 'COM 15,000 ฿', 5000, cmT3_15k);

  const cmT3_120k = (resCm5.breakdown.find(b => b.category === 'CENTER_TYPE_3')?.calculatedAmount || 0);
  addTest('CM-T3-4', 'ค่าจัดงานศูนย์ 3', 'COM 120,000 บาท (คงที่ 15,000 ฿)', '15,000 บาท', 'COM 120,000 ฿', 15000, cmT3_120k);

  // Center Separation: (1.5k, 2k, 2.5k, 3k)
  const resCmSep = calculateMemberIncome({ ...baseCm, personalMonthlyCom: 60000, directCenterCount: 2 }, [], customRules);
  const cmSepAmt = (resCmSep.breakdown.find(b => b.category === 'CENTER_SEPARATION')?.calculatedAmount || 0);
  addTest('CM-SEP-2', 'ค่าแยกศูนย์', 'COM 60,000 ฿ แยก 2 ศูนย์ (2,500/ศูนย์)', '2 x 2,500 = 5,000 บาท', '2 ศูนย์, COM 60k', 5000, cmSepAmt);

  // Center Annual Bonus: 150k->4%, 300k->5%, 600k->6%
  const resCmBonus = calculateMemberIncome({ ...baseCm, personalAnnualCom: 300000 }, [], customRules);
  const cmBonusAmt = (resCmBonus.breakdown.find(b => b.category === 'CENTER_ANNUAL_BONUS')?.calculatedAmount || 0);
  addTest('CM-ANN-BONUS', 'โบนัสศูนย์รายปี', 'COM ปี 300,000 บาท x 5%', '300,000 x 5% = 15,000 บาท', 'COM ปี 300k', 15000, cmBonusAmt);

  // ----------------------------------------------------
  // TEST SUITE 3: GROUP MANAGER (ผู้บริหารภาค)
  // ----------------------------------------------------
  const baseGm: Member = {
    id: 'test-gm',
    code: 'GM001',
    name: 'ทดสอบ ผู้บริหารภาค',
    position: 'GROUP_MANAGER',
    parentId: null,
    personalMonthlySales: 0,
    personalMonthlyCom: 0,
    personalMonthlyFyc: 0,
    personalRenewalPremium: 0,
    personalAnnualFyc: 0,
    personalAnnualCom: 0,
    monthlyGoalIncome: 200000,
    annualGoalIncome: 2400000,
    monthlyGoalFyc: 100000,
    annualGoalFyc: 1200000,
    startDate: '2022-01-01',
    tenureMonths: 24,
    isActive: true,
  };

  // Group Type 1 FYC tiers: 60k->10%, 120k->12%, 180k->14%, 240k->16%, 300k->18%
  const resGm1 = calculateMemberIncome({ ...baseGm, personalMonthlyFyc: 60000 }, [], customRules);
  const gmT1_60k = (resGm1.breakdown.find(b => b.category === 'GROUP_TYPE_1')?.calculatedAmount || 0);
  addTest('GM-T1-1', 'ค่าจัดงานภาค 1', 'FYC ทีม 60,000 บาท x 10%', '60,000 x 10% = 6,000 บาท', 'FYC 60k', 6000, gmT1_60k);

  const resGm2 = calculateMemberIncome({ ...baseGm, personalMonthlyFyc: 300000 }, [], customRules);
  const gmT1_300k = (resGm2.breakdown.find(b => b.category === 'GROUP_TYPE_1')?.calculatedAmount || 0);
  addTest('GM-T1-5', 'ค่าจัดงานภาค 1', 'FYC ทีม 300,000 บาท x 18%', '300,000 x 18% = 54,000 บาท', 'FYC 300k', 54000, gmT1_300k);

  // Group Annual Bonus: 500k-999k (1.5%), 1M-1.99M (2.0%), >=2M (2.5%)
  const resGmBon1 = calculateMemberIncome({ ...baseGm, personalAnnualFyc: 1500000 }, [], customRules);
  const gmBon1Amt = (resGmBon1.breakdown.find(b => b.category === 'GROUP_ANNUAL_BONUS')?.calculatedAmount || 0);
  addTest('GM-BONUS-2M', 'โบนัสภาครายปี', 'FYC ปี 1,500,000 บาท x 2.0%', '1,500,000 x 2% = 30,000 บาท', 'FYC ปี 1.5M', 30000, gmBon1Amt);

  // Group Target Management Allowance: 1.5M->10,000/mo, 5M->30,000/mo
  const gmTargetAmt = (resGmBon1.breakdown.find(b => b.category === 'TARGET_MANAGEMENT_ALLOWANCE')?.calculatedAmount || 0);
  addTest('GM-TARGET-1.5M', 'ค่าบริหารเป้าหมาย', 'FYC ปี 1,500,000 ฿ (รับ 10,000 ฿/เดือน)', '10,000 บาท/เดือน', 'FYC ปี 1.5M', 10000, gmTargetAmt);

  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.length - passedCount;

  return {
    totalTests: results.length,
    passedCount,
    failedCount,
    results,
  };
}
