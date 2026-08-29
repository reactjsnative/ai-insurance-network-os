import { 
  Position, 
  PositionId, 
  CompensationRule, 
  CompensationPlanVersion, 
  IncomeBreakdownItem, 
  IncomeCalculationResult, 
  CalculationType,
  Member,
  CareerProgress
} from '../types';
import { DEFAULT_POSITIONS, INITIAL_PLAN_VERSION } from './compensationRules';

export interface CalculationInput {
  memberId?: string;
  positionId: PositionId;
  personalFYC: number;
  teamFYC: number;
  personalCOM: number;
  teamCOM: number;
  firstYearPremium: number;
  renewalPremium: number;
  directMembersCount?: number;
  activeMembersCount?: number;
  separatedUnitsCount?: number;
  separatedCentersCount?: number;
  separatedRegionsCount?: number;
  centerComList?: number[]; // COM for each separated center
  centerFycList?: number[]; // FYC for each center under region
  annualFYC?: number;
  annualCOM?: number;
  period?: string;
  calculationType?: CalculationType;
  planVersion?: CompensationPlanVersion;
}

// 1. ค่าจัดงานหน่วย (Unit Management Fee)
export function calculateUnitCommission(teamCOM: number, rule?: CompensationRule): IncomeBreakdownItem {
  const defaultRule = rule || INITIAL_PLAN_VERSION.rules.find(r => r.incomeType === 'unit_management')!;
  const tiers = defaultRule?.tiers || [
    { min: 5000, max: 9999.99, rate: 0.25 },
    { min: 10000, max: 19999.99, rate: 0.30 },
    { min: 20000, max: 34999.99, rate: 0.35 },
    { min: 35000, rate: 0.40 },
  ];

  let appliedRate = 0;
  let tierDescription = 'ต่ำกว่าเกณฑ์ขั้นต่ำ (5,000 บาท)';

  if (teamCOM >= 35000) {
    appliedRate = 0.40;
    tierDescription = 'ขั้นที่ 4: COM ≥ 35,000 บาท (อัตรา 40%)';
  } else if (teamCOM >= 20000) {
    appliedRate = 0.35;
    tierDescription = 'ขั้นที่ 3: COM 20,000 - 34,999 บาท (อัตรา 35%)';
  } else if (teamCOM >= 10000) {
    appliedRate = 0.30;
    tierDescription = 'ขั้นที่ 2: COM 10,000 - 19,999 บาท (อัตรา 30%)';
  } else if (teamCOM >= 5000) {
    appliedRate = 0.25;
    tierDescription = 'ขั้นที่ 1: COM 5,000 - 9,999 บาท (อัตรา 25%)';
  }

  const amount = Math.round(teamCOM * appliedRate * 100) / 100;

  return {
    id: 'breakdown_unit_management',
    incomeType: 'unit_management',
    title: 'ค่าจัดงานหน่วย (Unit Management Fee)',
    category: 'unit',
    amount,
    basisName: 'COM รวมของทีมต่อเดือน',
    basisValue: teamCOM,
    rateOrFormula: `${(appliedRate * 100).toFixed(0)}%`,
    ruleVersion: defaultRule?.planVersionId || 'plan_2021_01_15',
    effectiveDate: defaultRule?.effectiveDate || '2021-01-15',
    calculationDetails: appliedRate > 0 
      ? `COM รวม ฿${teamCOM.toLocaleString()} × ${(appliedRate * 100).toFixed(0)}% = ฿${amount.toLocaleString()}`
      : `COM รวม ฿${teamCOM.toLocaleString()} ยังไม่ถึงเกณฑ์ขั้นต่ำ 5,000 บาท (0%)`,
    isQualified: teamCOM >= 5000,
    notes: tierDescription,
  };
}

// 2. ค่าแยกหน่วย (Unit Separation)
export function calculateUnitSeparation(separatedUnits: number, rule?: CompensationRule): IncomeBreakdownItem {
  const defaultRule = rule || INITIAL_PLAN_VERSION.rules.find(r => r.incomeType === 'unit_separation')!;
  const ratePerUnit = defaultRule?.fixedAmount || 2000;
  const count = Math.max(0, separatedUnits || 0);
  const amount = count * ratePerUnit;

  return {
    id: 'breakdown_unit_separation',
    incomeType: 'unit_separation',
    title: 'ค่าแยกหน่วย (Unit Separation)',
    category: 'unit',
    amount,
    basisName: 'จำนวนหน่วยที่แยกออกไป',
    basisValue: count,
    rateOrFormula: `฿${ratePerUnit.toLocaleString()} / หน่วย`,
    ruleVersion: defaultRule?.planVersionId || 'plan_2021_01_15',
    effectiveDate: defaultRule?.effectiveDate || '2021-01-15',
    calculationDetails: `${count} หน่วย × ฿${ratePerUnit.toLocaleString()} = ฿${amount.toLocaleString()}`,
    isQualified: count > 0,
    notes: 'จ่าย 2,000 บาท/หน่วย โดยไม่จำกัดจำนวนหน่วย',
  };
}

// 3. ค่าจัดงานศูนย์ประเภท 1 (Center Management Type 1)
export function calculateCenterType1(teamCOM: number, rule?: CompensationRule): IncomeBreakdownItem {
  const defaultRule = rule || INITIAL_PLAN_VERSION.rules.find(r => r.incomeType === 'center_type1')!;
  let appliedRate = 0;
  let tierDescription = 'ต่ำกว่าเกณฑ์ขั้นต่ำ (15,000 บาท)';

  if (teamCOM >= 120000) {
    appliedRate = 0.30;
    tierDescription = 'ขั้นที่ 4: COM ≥ 120,000 บาท (อัตรา 30%)';
  } else if (teamCOM >= 60000) {
    appliedRate = 0.25;
    tierDescription = 'ขั้นที่ 3: COM 60,000 - 119,999 บาท (อัตรา 25%)';
  } else if (teamCOM >= 30000) {
    appliedRate = 0.20;
    tierDescription = 'ขั้นที่ 2: COM 30,000 - 59,999 บาท (อัตรา 20%)';
  } else if (teamCOM >= 15000) {
    appliedRate = 0.15;
    tierDescription = 'ขั้นที่ 1: COM 15,000 - 29,999 บาท (อัตรา 15%)';
  }

  const amount = Math.round(teamCOM * appliedRate * 100) / 100;

  return {
    id: 'breakdown_center_type1',
    incomeType: 'center_type1',
    title: 'ค่าจัดงานศูนย์ประเภท 1 (Center Management T1)',
    category: 'center',
    amount,
    basisName: 'COM รวมศูนย์ต่อเดือน',
    basisValue: teamCOM,
    rateOrFormula: `${(appliedRate * 100).toFixed(0)}%`,
    ruleVersion: defaultRule?.planVersionId || 'plan_2021_01_15',
    effectiveDate: defaultRule?.effectiveDate || '2021-01-15',
    calculationDetails: appliedRate > 0 
      ? `COM ศูนย์ ฿${teamCOM.toLocaleString()} × ${(appliedRate * 100).toFixed(0)}% = ฿${amount.toLocaleString()}`
      : `COM รวม ฿${teamCOM.toLocaleString()} ยังไม่ถึงเกณฑ์ขั้นต่ำ 15,000 บาท (0%)`,
    isQualified: teamCOM >= 15000,
    notes: tierDescription,
  };
}

// 4. ค่าจัดงานศูนย์ประเภท 2 (Next Year Renewal Premium 0.8%)
export function calculateCenterType2(renewalPremium: number, rule?: CompensationRule): IncomeBreakdownItem {
  const defaultRule = rule || INITIAL_PLAN_VERSION.rules.find(r => r.incomeType === 'center_type2')!;
  const rate = defaultRule?.rate || 0.008; // 0.8%
  const amount = Math.round(renewalPremium * rate * 100) / 100;

  return {
    id: 'breakdown_center_type2',
    incomeType: 'center_type2',
    title: 'ค่าจัดงานศูนย์ประเภท 2 (Renewal Premium 0.8%)',
    category: 'center',
    amount,
    basisName: 'เบี้ยประกันภัยปีต่อไป (Renewal Premium)',
    basisValue: renewalPremium,
    rateOrFormula: `${(rate * 100).toFixed(1)}%`,
    ruleVersion: defaultRule?.planVersionId || 'plan_2021_01_15',
    effectiveDate: defaultRule?.effectiveDate || '2021-01-15',
    calculationDetails: `เบี้ยปีต่อ ฿${renewalPremium.toLocaleString()} × ${(rate * 100).toFixed(1)}% = ฿${amount.toLocaleString()}`,
    isQualified: renewalPremium > 0,
    notes: 'คิด 0.8% ของเบี้ยประกันภัยปีต่อไปของศูนย์',
  };
}

// 5. ค่าจัดงานศูนย์ประเภท 3 (Lookup Table by COM)
export function calculateCenterType3(teamCOM: number, rule?: CompensationRule): IncomeBreakdownItem {
  const defaultRule = rule || INITIAL_PLAN_VERSION.rules.find(r => r.incomeType === 'center_type3')!;
  let amount = 0;
  let tierDescription = 'ต่ำกว่าเกณฑ์ขั้นต่ำ (15,000 บาท)';

  if (teamCOM >= 120000) {
    amount = 15000;
    tierDescription = 'COM ≥ 120,000 บาท รับคงที่ 15,000 บาท';
  } else if (teamCOM >= 60000) {
    amount = 11000;
    tierDescription = 'COM 60,000 - 119,999 บาท รับคงที่ 11,000 บาท';
  } else if (teamCOM >= 30000) {
    amount = 8000;
    tierDescription = 'COM 30,000 - 59,999 บาท รับคงที่ 8,000 บาท';
  } else if (teamCOM >= 15000) {
    amount = 5000;
    tierDescription = 'COM 15,000 - 29,999 บาท รับคงที่ 5,000 บาท';
  }

  return {
    id: 'breakdown_center_type3',
    incomeType: 'center_type3',
    title: 'ค่าจัดงานศูนย์ประเภท 3 (Center Management T3 Lookup)',
    category: 'center',
    amount,
    basisName: 'COM รวมศูนย์ต่อเดือน',
    basisValue: teamCOM,
    rateOrFormula: 'Lookup Table',
    ruleVersion: defaultRule?.planVersionId || 'plan_2021_01_15',
    effectiveDate: defaultRule?.effectiveDate || '2021-01-15',
    calculationDetails: amount > 0 
      ? `COM ฿${teamCOM.toLocaleString()} อยู่ในเกณฑ์ -> ได้รับ ฿${amount.toLocaleString()}`
      : `COM ฿${teamCOM.toLocaleString()} ต่ำกว่า 15,000 บาท (0 บาท)`,
    isQualified: amount > 0,
    notes: tierDescription,
  };
}

// 6. ค่าแยกศูนย์ (Center Separation)
export function calculateCenterSeparation(
  separatedCenters: number, 
  centerComList?: number[], 
  rule?: CompensationRule
): IncomeBreakdownItem {
  const defaultRule = rule || INITIAL_PLAN_VERSION.rules.find(r => r.incomeType === 'center_separation')!;
  const count = Math.max(0, separatedCenters || 0);
  
  if (count === 0) {
    return {
      id: 'breakdown_center_separation',
      incomeType: 'center_separation',
      title: 'ค่าแยกศูนย์ (Center Separation)',
      category: 'center',
      amount: 0,
      basisName: 'จำนวนศูนย์ที่แยกออกไป',
      basisValue: 0,
      rateOrFormula: '฿4,000 + COM Tier',
      ruleVersion: defaultRule?.planVersionId || 'plan_2021_01_15',
      effectiveDate: defaultRule?.effectiveDate || '2021-01-15',
      calculationDetails: 'ไม่มีศูนย์ที่แยกตัวออกไป',
      isQualified: false,
    };
  }

  // Base 4,000 THB + COM tiered additions
  const baseTotal = count * 4000;
  let comTierTotal = 0;
  const comList = centerComList && centerComList.length > 0 
    ? centerComList 
    : Array(count).fill(30000); // default realistic average 30k COM if not itemized

  comList.slice(0, count).forEach(com => {
    if (com >= 120000) comTierTotal += 3000;
    else if (com >= 60000) comTierTotal += 2500;
    else if (com >= 30000) comTierTotal += 2000;
    else if (com >= 15000) comTierTotal += 1500;
  });

  const totalAmount = baseTotal + comTierTotal;

  return {
    id: 'breakdown_center_separation',
    incomeType: 'center_separation',
    title: 'ค่าแยกศูนย์ (Center Separation)',
    category: 'center',
    amount: totalAmount,
    basisName: 'จำนวนศูนย์ที่แยกออกไป + COM รายศูนย์',
    basisValue: count,
    rateOrFormula: `฿4,000/ศูนย์ + Tiered COM (฿1,500-3,000)`,
    ruleVersion: defaultRule?.planVersionId || 'plan_2021_01_15',
    effectiveDate: defaultRule?.effectiveDate || '2021-01-15',
    calculationDetails: `${count} ศูนย์ × ฿4,000 (฿${baseTotal.toLocaleString()}) + ส่วนเพิ่มตาม COM (฿${comTierTotal.toLocaleString()}) = ฿${totalAmount.toLocaleString()}`,
    isQualified: true,
    notes: 'ค่าแยกศูนย์ 4,000 บาท และจ่ายต่อเนื่องตาม COM แต่ละศูนย์ที่แยก',
  };
}

// 7. โบนัสศูนย์รายปี (Annual Center Bonus)
export function calculateCenterBonus(annualCOM: number, rule?: CompensationRule): IncomeBreakdownItem {
  const defaultRule = rule || INITIAL_PLAN_VERSION.rules.find(r => r.incomeType === 'center_bonus')!;
  let appliedRate = 0;
  let tierDesc = 'ต่ำกว่าเกณฑ์ 150,000 บาท/ปี';

  if (annualCOM >= 600000) {
    appliedRate = 0.06;
    tierDesc = 'COM รายปี ≥ 600,000 บาท (โบนัส 6%)';
  } else if (annualCOM >= 300000) {
    appliedRate = 0.05;
    tierDesc = 'COM รายปี 300,000 - 599,999 บาท (โบนัส 5%)';
  } else if (annualCOM >= 150000) {
    appliedRate = 0.04;
    tierDesc = 'COM รายปี 150,000 - 299,999 บาท (โบนัส 4%)';
  }

  const amount = Math.round(annualCOM * appliedRate * 100) / 100;

  return {
    id: 'breakdown_center_bonus',
    incomeType: 'center_bonus',
    title: 'โบนัสศูนย์รายปี (Annual Center Bonus)',
    category: 'center',
    amount,
    basisName: 'COM รวมทั้งปีของศูนย์',
    basisValue: annualCOM,
    rateOrFormula: `${(appliedRate * 100).toFixed(0)}%`,
    ruleVersion: defaultRule?.planVersionId || 'plan_2021_01_15',
    effectiveDate: defaultRule?.effectiveDate || '2021-01-15',
    calculationDetails: appliedRate > 0 
      ? `COM รายปี ฿${annualCOM.toLocaleString()} × ${(appliedRate * 100).toFixed(0)}% = ฿${amount.toLocaleString()}`
      : `COM รายปี ฿${annualCOM.toLocaleString()} ยังไม่ถึงเกณฑ์ 150,000 บาท (0%)`,
    isQualified: annualCOM >= 150000,
    notes: tierDesc,
  };
}

// 8. ค่าจัดงานภาคประเภท 1 (Region Management Type 1)
export function calculateRegionType1(teamFYC: number, rule?: CompensationRule): IncomeBreakdownItem {
  const defaultRule = rule || INITIAL_PLAN_VERSION.rules.find(r => r.incomeType === 'region_type1')!;
  let appliedRate = 0;
  let tierDesc = 'ต่ำกว่าเกณฑ์ขั้นต่ำ 60,000 บาท';

  if (teamFYC >= 300000) {
    appliedRate = 0.18;
    tierDesc = 'ขั้นที่ 5: FYC ≥ 300,000 บาท (อัตรา 18%)';
  } else if (teamFYC >= 240000) {
    appliedRate = 0.16;
    tierDesc = 'ขั้นที่ 4: FYC 240,000 - 299,999 บาท (อัตรา 16%)';
  } else if (teamFYC >= 180000) {
    appliedRate = 0.14;
    tierDesc = 'ขั้นที่ 3: FYC 180,000 - 239,999 บาท (อัตรา 14%)';
  } else if (teamFYC >= 120000) {
    appliedRate = 0.12;
    tierDesc = 'ขั้นที่ 2: FYC 120,000 - 179,999 บาท (อัตรา 12%)';
  } else if (teamFYC >= 60000) {
    appliedRate = 0.10;
    tierDesc = 'ขั้นที่ 1: FYC 60,000 - 119,999 บาท (อัตรา 10%)';
  }

  const amount = Math.round(teamFYC * appliedRate * 100) / 100;

  return {
    id: 'breakdown_region_type1',
    incomeType: 'region_type1',
    title: 'ค่าจัดงานภาคประเภท 1 (Region Management T1)',
    category: 'region',
    amount,
    basisName: 'FYC ทั้งทีมต่อเดือน',
    basisValue: teamFYC,
    rateOrFormula: `${(appliedRate * 100).toFixed(0)}%`,
    ruleVersion: defaultRule?.planVersionId || 'plan_2021_01_15',
    effectiveDate: defaultRule?.effectiveDate || '2021-01-15',
    calculationDetails: appliedRate > 0 
      ? `FYC ทั้งทีม ฿${teamFYC.toLocaleString()} × ${(appliedRate * 100).toFixed(0)}% = ฿${amount.toLocaleString()}`
      : `FYC ทั้งทีม ฿${teamFYC.toLocaleString()} ต่ำกว่า 60,000 บาท (0%)`,
    isQualified: teamFYC >= 60000,
    notes: tierDesc,
  };
}

// 9. ค่าจัดงานภาคประเภท 2 (Per Center FYC Lookup)
export function calculateRegionType2(
  centerFycList?: number[], 
  rule?: CompensationRule
): IncomeBreakdownItem {
  const defaultRule = rule || INITIAL_PLAN_VERSION.rules.find(r => r.incomeType === 'region_type2')!;
  const centers = centerFycList && centerFycList.length > 0 ? centerFycList : [60000, 60000, 30000, 30000]; // default 4 demo centers
  
  let totalAmount = 0;
  const centerCalculations: string[] = [];

  centers.forEach((fyc, idx) => {
    let perCenterPay = 0;
    if (fyc >= 120000) perCenterPay = 2500;
    else if (fyc >= 60000) perCenterPay = 2000;
    else if (fyc >= 30000) perCenterPay = 1500;
    else if (fyc >= 15000) perCenterPay = 1000;

    totalAmount += perCenterPay;
    centerCalculations.push(`ศูนย์ที่ ${idx + 1} (FYC ฿${fyc.toLocaleString()} -> ฿${perCenterPay.toLocaleString()})`);
  });

  return {
    id: 'breakdown_region_type2',
    incomeType: 'region_type2',
    title: 'ค่าจัดงานภาคประเภท 2 (Per Center FYC)',
    category: 'region',
    amount: totalAmount,
    basisName: `FYC ของผู้บริหารศูนย์ (${centers.length} ศูนย์)`,
    basisValue: totalAmount,
    rateOrFormula: 'Lookup Per Center (฿1,000-2,500)',
    ruleVersion: defaultRule?.planVersionId || 'plan_2021_01_15',
    effectiveDate: defaultRule?.effectiveDate || '2021-01-15',
    calculationDetails: `${centerCalculations.join(', ')} = รวม ฿${totalAmount.toLocaleString()}`,
    isQualified: totalAmount > 0,
    notes: 'คำนวณจาก FYC ของผู้บริหารศูนย์แต่ละศูนย์แล้วรวมอัตโนมัติ',
  };
}

// 10. ค่าแยกภาค (Region Separation)
export function calculateRegionSeparation(
  separatedRegions: number, 
  regionType1Amount: number = 0,
  ruleOption: 1 | 2 | 3 = 2,
  rule?: CompensationRule
): IncomeBreakdownItem {
  const defaultRule = rule || INITIAL_PLAN_VERSION.rules.find(r => r.incomeType === 'region_separation')!;
  const count = Math.max(0, separatedRegions || 0);

  let amount = 0;
  let formulaDesc = '';

  if (count === 0) {
    return {
      id: 'breakdown_region_separation',
      incomeType: 'region_separation',
      title: 'ค่าแยกภาค (Region Separation)',
      category: 'region',
      amount: 0,
      basisName: 'จำนวนภาคที่แยกออกไป',
      basisValue: 0,
      rateOrFormula: 'Configurable (แบบ 1 / 2 / 3)',
      ruleVersion: defaultRule?.planVersionId || 'plan_2021_01_15',
      effectiveDate: defaultRule?.effectiveDate || '2021-01-15',
      calculationDetails: 'ไม่มีภาคที่แยกตัวออกไป',
      isQualified: false,
    };
  }

  if (ruleOption === 1) {
    // ประเภท 1: 8,000 บาท จ่ายครั้งเดียว
    amount = count * 8000;
    formulaDesc = `${count} ภาค × ฿8,000 (จ่ายครั้งเดียว) = ฿${amount.toLocaleString()}`;
  } else if (ruleOption === 2) {
    // ประเภท 2: 4,000 บาท x 12 เดือน (รายเดือนคือ 4,000 / ภาค)
    amount = count * 4000;
    formulaDesc = `${count} ภาค × ฿4,000/เดือน (รับต่อเนื่อง 12 เดือน) = ฿${amount.toLocaleString()}`;
  } else {
    // ประเภท 3: 40% ของค่าจัดงานภาคประเภท 1
    amount = Math.round(count * (regionType1Amount * 0.40) * 100) / 100;
    formulaDesc = `${count} ภาค × (40% ของค่าจัดงานภาค T1 ฿${regionType1Amount.toLocaleString()}) = ฿${amount.toLocaleString()}`;
  }

  return {
    id: 'breakdown_region_separation',
    incomeType: 'region_separation',
    title: 'ค่าแยกภาค (Region Separation)',
    category: 'region',
    amount,
    basisName: `จำนวนภาคที่แยก (${count} ภาค)`,
    basisValue: count,
    rateOrFormula: ruleOption === 1 ? '฿8,000 หนึ่งครั้ง' : ruleOption === 2 ? '฿4,000/ด (12ด)' : '40% ของภาค T1',
    ruleVersion: defaultRule?.planVersionId || 'plan_2021_01_15',
    effectiveDate: defaultRule?.effectiveDate || '2021-01-15',
    calculationDetails: formulaDesc,
    isQualified: true,
    notes: 'รองรับ 3 แบบตาม Rule Engine',
  };
}

// 11. ค่าบริหารเป้าหมาย (Target Management Fee)
export function calculateTargetManagement(annualFYC: number, rule?: CompensationRule): IncomeBreakdownItem {
  const defaultRule = rule || INITIAL_PLAN_VERSION.rules.find(r => r.incomeType === 'target_management')!;
  let monthlyAmount = 0;
  let annualAmount = 0;
  let tierDesc = 'ต่ำกว่าเป้าหมาย 1,500,000 บาท/ปี';

  if (annualFYC >= 5000000) {
    annualAmount = 360000;
    monthlyAmount = 30000;
    tierDesc = 'เป้าหมาย 5,000,000 บาท/ปี (฿360,000/ปี หรือ ฿30,000/เดือน)';
  } else if (annualFYC >= 4000000) {
    annualAmount = 300000;
    monthlyAmount = 25000;
    tierDesc = 'เป้าหมาย 4,000,000 บาท/ปี (฿300,000/ปี หรือ ฿25,000/เดือน)';
  } else if (annualFYC >= 3000000) {
    annualAmount = 240000;
    monthlyAmount = 20000;
    tierDesc = 'เป้าหมาย 3,000,000 บาท/ปี (฿240,000/ปี หรือ ฿20,000/เดือน)';
  } else if (annualFYC >= 2000000) {
    annualAmount = 180000;
    monthlyAmount = 15000;
    tierDesc = 'เป้าหมาย 2,000,000 บาท/ปี (฿180,000/ปี หรือ ฿15,000/เดือน)';
  } else if (annualFYC >= 1500000) {
    annualAmount = 120000;
    monthlyAmount = 10000;
    tierDesc = 'เป้าหมาย 1,500,000 บาท/ปี (฿120,000/ปี หรือ ฿10,000/เดือน)';
  }

  return {
    id: 'breakdown_target_management',
    incomeType: 'target_management',
    title: 'ค่าบริหารเป้าหมาย (Target Management Fee)',
    category: 'region',
    amount: monthlyAmount,
    basisName: 'FYC สะสมต่อปี',
    basisValue: annualFYC,
    rateOrFormula: `฿${monthlyAmount.toLocaleString()}/เดือน (฿${annualAmount.toLocaleString()}/ปี)`,
    ruleVersion: defaultRule?.planVersionId || 'plan_2021_01_15',
    effectiveDate: defaultRule?.effectiveDate || '2021-01-15',
    calculationDetails: monthlyAmount > 0 
      ? `FYC รายปี ฿${annualFYC.toLocaleString()} ถึงเกณฑ์ -> รับค่าบริหารเป้าหมาย ฿${monthlyAmount.toLocaleString()}/เดือน`
      : `FYC รายปี ฿${annualFYC.toLocaleString()} ยังไม่ถึงเกณฑ์ 1.5 ล้านบาท (0 บาท)`,
    isQualified: monthlyAmount > 0,
    notes: tierDesc,
  };
}

// 12. โบนัสภาครายปี (Annual Region Bonus)
export function calculateRegionBonus(annualFYC: number, rule?: CompensationRule): IncomeBreakdownItem {
  const defaultRule = rule || INITIAL_PLAN_VERSION.rules.find(r => r.incomeType === 'region_bonus')!;
  let appliedRate = 0;
  let tierDesc = 'ต่ำกว่าเกณฑ์ 500,000 บาท/ปี';

  if (annualFYC >= 2000000) {
    appliedRate = 0.025; // 2.5%
    tierDesc = 'FYC รายปี ≥ 2,000,000 บาท (โบนัส 2.5%)';
  } else if (annualFYC >= 1000000) {
    appliedRate = 0.020; // 2.0%
    tierDesc = 'FYC รายปี 1,000,000 - 1,999,999 บาท (โบนัส 2.0%)';
  } else if (annualFYC >= 500000) {
    appliedRate = 0.015; // 1.5%
    tierDesc = 'FYC รายปี 500,000 - 999,999 บาท (โบนัส 1.5%)';
  }

  const amount = Math.round(annualFYC * appliedRate * 100) / 100;

  return {
    id: 'breakdown_region_bonus',
    incomeType: 'region_bonus',
    title: 'โบนัสภาครายปี (Annual Region Bonus)',
    category: 'region',
    amount,
    basisName: 'FYC รวมทั้งปีของภาค',
    basisValue: annualFYC,
    rateOrFormula: `${(appliedRate * 100).toFixed(1)}%`,
    ruleVersion: defaultRule?.planVersionId || 'plan_2021_01_15',
    effectiveDate: defaultRule?.effectiveDate || '2021-01-15',
    calculationDetails: appliedRate > 0 
      ? `FYC รายปี ฿${annualFYC.toLocaleString()} × ${(appliedRate * 100).toFixed(1)}% = ฿${amount.toLocaleString()}`
      : `FYC รายปี ฿${annualFYC.toLocaleString()} ยังไม่ถึงเกณฑ์ 500,000 บาท (0%)`,
    isQualified: annualFYC >= 500000,
    notes: tierDesc,
  };
}

// 13. Comprehensive Total Income Calculator
export function calculateTotalIncome(input: CalculationInput): IncomeCalculationResult {
  const {
    positionId,
    personalFYC = 0,
    teamFYC = 0,
    personalCOM = 0,
    teamCOM = 0,
    firstYearPremium = 0,
    renewalPremium = 0,
    directMembersCount = 0,
    activeMembersCount = 0,
    separatedUnitsCount = 0,
    separatedCentersCount = 0,
    separatedRegionsCount = 0,
    centerComList,
    centerFycList,
    annualFYC = teamFYC * 12,
    annualCOM = teamCOM * 12,
    period = '2026-08',
    calculationType = 'ACTUAL',
    planVersion = INITIAL_PLAN_VERSION,
  } = input;

  const breakdown: IncomeBreakdownItem[] = [];

  // Always: Personal Commission
  const personalComRule = planVersion.rules.find(r => r.incomeType === 'personal_commission');
  const personalComAmount = Math.round(personalCOM * (personalComRule?.rate || 1.0) * 100) / 100;
  breakdown.push({
    id: 'breakdown_personal_com',
    incomeType: 'personal_commission',
    title: 'ค่าบำเหน็จส่วนตัว (Personal Commission)',
    category: 'personal',
    amount: personalComAmount,
    basisName: 'COM ส่วนตัว',
    basisValue: personalCOM,
    rateOrFormula: '100%',
    ruleVersion: planVersion.code,
    effectiveDate: planVersion.effectiveDate,
    calculationDetails: `COM ส่วนตัว ฿${personalCOM.toLocaleString()} × 100% = ฿${personalComAmount.toLocaleString()}`,
    isQualified: personalCOM > 0,
  });

  // Unit Manager (or higher)
  if (['unit_manager', 'center_manager', 'region_manager', 'senior_unit_manager', 'senior_center_manager', 'executive_region'].includes(positionId)) {
    // Unit Management
    const unitMgmtRule = planVersion.rules.find(r => r.incomeType === 'unit_management');
    breakdown.push(calculateUnitCommission(teamCOM, unitMgmtRule));

    // Unit Separation
    const unitSepRule = planVersion.rules.find(r => r.incomeType === 'unit_separation');
    breakdown.push(calculateUnitSeparation(separatedUnitsCount, unitSepRule));
  }

  // Center Manager (or higher)
  if (['center_manager', 'region_manager', 'senior_center_manager', 'executive_region'].includes(positionId)) {
    // Center Type 1
    const centerT1Rule = planVersion.rules.find(r => r.incomeType === 'center_type1');
    breakdown.push(calculateCenterType1(teamCOM, centerT1Rule));

    // Center Type 2
    const centerT2Rule = planVersion.rules.find(r => r.incomeType === 'center_type2');
    breakdown.push(calculateCenterType2(renewalPremium, centerT2Rule));

    // Center Type 3
    const centerT3Rule = planVersion.rules.find(r => r.incomeType === 'center_type3');
    breakdown.push(calculateCenterType3(teamCOM, centerT3Rule));

    // Center Separation
    const centerSepRule = planVersion.rules.find(r => r.incomeType === 'center_separation');
    breakdown.push(calculateCenterSeparation(separatedCentersCount, centerComList, centerSepRule));

    // Center Bonus (pro-rated monthly or annual view)
    const centerBonusRule = planVersion.rules.find(r => r.incomeType === 'center_bonus');
    breakdown.push(calculateCenterBonus(annualCOM, centerBonusRule));
  }

  // Region Manager (or higher)
  if (['region_manager', 'executive_region', 'national_leader'].includes(positionId)) {
    // Region Type 1
    const regionT1Rule = planVersion.rules.find(r => r.incomeType === 'region_type1');
    const r1Result = calculateRegionType1(teamFYC, regionT1Rule);
    breakdown.push(r1Result);

    // Region Type 2
    const regionT2Rule = planVersion.rules.find(r => r.incomeType === 'region_type2');
    breakdown.push(calculateRegionType2(centerFycList, regionT2Rule));

    // Region Separation
    const regionSepRule = planVersion.rules.find(r => r.incomeType === 'region_separation');
    breakdown.push(calculateRegionSeparation(separatedRegionsCount, r1Result.amount, 2, regionSepRule));

    // Target Management
    const targetMgmtRule = planVersion.rules.find(r => r.incomeType === 'target_management');
    breakdown.push(calculateTargetManagement(annualFYC, targetMgmtRule));

    // Region Bonus
    const regionBonusRule = planVersion.rules.find(r => r.incomeType === 'region_bonus');
    breakdown.push(calculateRegionBonus(annualFYC, regionBonusRule));
  }

  const totalIncome = breakdown.reduce((sum, item) => sum + item.amount, 0);

  const summary = {
    personalCommission: breakdown.filter(i => i.category === 'personal').reduce((s, i) => s + i.amount, 0),
    unitIncomes: breakdown.filter(i => i.category === 'unit').reduce((s, i) => s + i.amount, 0),
    centerIncomes: breakdown.filter(i => i.category === 'center').reduce((s, i) => s + i.amount, 0),
    regionIncomes: breakdown.filter(i => i.category === 'region').reduce((s, i) => s + i.amount, 0),
    bonusIncomes: breakdown.filter(i => i.incomeType.includes('bonus')).reduce((s, i) => s + i.amount, 0),
  };

  return {
    memberId: input.memberId,
    positionId,
    period,
    calculationType,
    planVersionId: planVersion.id,
    planVersionName: planVersion.name,
    totalIncome,
    breakdown,
    summary,
    metricsUsed: {
      personalFYC,
      teamFYC,
      personalCOM,
      teamCOM,
      renewalPremium,
      firstYearPremium,
      directCount: directMembersCount,
      activeCount: activeMembersCount,
      separatedUnits: separatedUnitsCount,
      separatedCenters: separatedCentersCount,
      separatedRegions: separatedRegionsCount,
    },
  };
}

// 14. Career Progress & Qualification Calculation
export function calculateCareerProgress(
  currentPositionId: PositionId,
  currentFYC: number,
  currentUnits: number,
  currentCenters: number,
  allPositions: Position[] = DEFAULT_POSITIONS
): CareerProgress {
  const currentPos = allPositions.find(p => p.id === currentPositionId) || allPositions[0];
  
  // Next position
  let nextPos: Position | null = null;
  if (currentPositionId === 'agent') {
    nextPos = allPositions.find(p => p.id === 'unit_manager') || null;
  } else if (currentPositionId === 'unit_manager') {
    nextPos = allPositions.find(p => p.id === 'center_manager') || null;
  } else if (currentPositionId === 'center_manager') {
    nextPos = allPositions.find(p => p.id === 'region_manager') || null;
  } else if (currentPositionId === 'region_manager') {
    nextPos = allPositions.find(p => p.id === 'executive_region') || null;
  }

  if (!nextPos) {
    return {
      currentPosition: currentPos,
      nextPosition: null,
      currentFYC,
      requiredFYC: currentPos.qualification.minFyc,
      fycProgressPercent: 100,
      currentUnits,
      requiredUnits: 0,
      unitsProgressPercent: 100,
      currentCenters,
      requiredCenters: 0,
      centersProgressPercent: 100,
      overallProgressPercent: 100,
      timeRemainingMonths: 0,
      isEligibleForPromotion: true,
      mathematicalProjection: {
        monthlyRunRateFYC: currentFYC,
        estimatedMonthsToPromotion: 0,
        recommendationText: 'คุณดำรงตำแหน่งสูงสุดของโครงสร้างหลักแล้ว',
        gapFYC: 0,
        gapUnits: 0,
        gapCenters: 0,
      },
    };
  }

  const requiredFYC = nextPos.qualification.minFyc;
  const requiredUnits = nextPos.qualification.requiredSeparations?.positionId === 'unit_manager' 
    ? nextPos.qualification.requiredSeparations.count 
    : 0;
  const requiredCenters = nextPos.qualification.requiredSeparations?.positionId === 'center_manager' 
    ? nextPos.qualification.requiredSeparations.count 
    : 0;

  const fycProgress = Math.min(100, Math.round((currentFYC / (requiredFYC || 1)) * 100));
  const unitsProgress = requiredUnits > 0 ? Math.min(100, Math.round((currentUnits / requiredUnits) * 100)) : 100;
  const centersProgress = requiredCenters > 0 ? Math.min(100, Math.round((currentCenters / requiredCenters) * 100)) : 100;

  let overallProgress = fycProgress;
  if (requiredUnits > 0 && requiredCenters > 0) {
    overallProgress = Math.round((fycProgress * 0.4) + (unitsProgress * 0.3) + (centersProgress * 0.3));
  } else if (requiredUnits > 0) {
    overallProgress = Math.round((fycProgress * 0.6) + (unitsProgress * 0.4));
  } else if (requiredCenters > 0) {
    overallProgress = Math.round((fycProgress * 0.6) + (centersProgress * 0.4));
  }

  const gapFYC = Math.max(0, requiredFYC - currentFYC);
  const gapUnits = Math.max(0, requiredUnits - currentUnits);
  const gapCenters = Math.max(0, requiredCenters - currentCenters);

  const isEligible = gapFYC === 0 && gapUnits === 0 && gapCenters === 0;

  // Mathematical Projection (Estimated Run Rate)
  const monthlyAverageFYC = Math.max(1, currentFYC / (nextPos.qualification.periodMonths || 6));
  const estimatedMonths = gapFYC > 0 
    ? Math.max(1, Math.ceil(gapFYC / monthlyAverageFYC)) 
    : 0;

  let recommendationText = '';
  if (isEligible) {
    recommendationText = `คุณมีคุณสมบัติครบถ้วนพร้อมรับการแต่งตั้งเป็น "${nextPos.name}"`;
  } else {
    const parts: string[] = [];
    if (gapFYC > 0) parts.push(`ต้องการ FYC อีก ฿${gapFYC.toLocaleString()}`);
    if (gapUnits > 0) parts.push(`ต้องการแยกหน่วยเพิ่ม ${gapUnits} หน่วย`);
    if (gapCenters > 0) parts.push(`ต้องการแยกศูนย์เพิ่ม ${gapCenters} ศูนย์`);
    
    parts.push(`หากรักษาผลงานเฉลี่ยเดือนละ ฿${Math.round(monthlyAverageFYC).toLocaleString()} คาดว่าจะถึงเป้าหมายในอีก ~${estimatedMonths} เดือน`);
    recommendationText = parts.join(' • ');
  }

  return {
    currentPosition: currentPos,
    nextPosition: nextPos,
    currentFYC,
    requiredFYC,
    fycProgressPercent: fycProgress,
    currentUnits,
    requiredUnits,
    unitsProgressPercent: unitsProgress,
    currentCenters,
    requiredCenters,
    centersProgressPercent: centersProgress,
    overallProgressPercent: overallProgress,
    timeRemainingMonths: nextPos.qualification.periodMonths,
    isEligibleForPromotion: isEligible,
    mathematicalProjection: {
      monthlyRunRateFYC: monthlyAverageFYC,
      estimatedMonthsToPromotion: estimatedMonths,
      recommendationText,
      gapFYC,
      gapUnits,
      gapCenters,
    },
  };
}

// 15. Recursive Downline Query & Stats
export function calculateDownlineMetrics(memberId: string, allMembers: Member[]) {
  const directMembers = allMembers.filter(m => m.parentMemberId === memberId || m.sponsorId === memberId);
  
  const visited = new Set<string>();
  const downlineMembers: Member[] = [];

  function traverse(currentId: string) {
    visited.add(currentId);
    const children = allMembers.filter(m => m.parentMemberId === currentId || (m.sponsorId === currentId && !m.parentMemberId));
    for (const child of children) {
      if (!visited.has(child.id)) {
        downlineMembers.push(child);
        traverse(child.id);
      }
    }
  }

  traverse(memberId);

  const activeDownline = downlineMembers.filter(m => m.status === 'active');
  const teamFYC = downlineMembers.reduce((sum, m) => sum + m.personalFYC, 0);
  const teamCOM = downlineMembers.reduce((sum, m) => sum + m.personalCOM, 0);
  const totalUnits = downlineMembers.filter(m => m.positionId === 'unit_manager' || m.positionId === 'senior_unit_manager').length;
  const totalCenters = downlineMembers.filter(m => m.positionId === 'center_manager' || m.positionId === 'senior_center_manager').length;
  const totalRegions = downlineMembers.filter(m => m.positionId === 'region_manager' || m.positionId === 'executive_region').length;

  return {
    directCount: directMembers.length,
    activeDirectCount: directMembers.filter(m => m.status === 'active').length,
    totalDownlineCount: downlineMembers.length,
    activeDownlineCount: activeDownline.length,
    teamFYC,
    teamCOM,
    totalUnits,
    totalCenters,
    totalRegions,
    downlineMembers,
  };
}
