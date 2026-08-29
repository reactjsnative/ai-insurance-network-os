import {
  calculateUnitCommission,
  calculateCenterType1,
  calculateRegionType1,
  calculateRegionBonus,
} from './calculationEngine';

export interface CalculationTestResult {
  id: number;
  testName: string;
  category: string;
  expectedFormula: string;
  expectedValue: number | string;
  actualValue: number | string;
  expected: number | string;
  actual: number | string;
  passed: boolean;
  notes: string;
}

export function runAllCalculationTests(): CalculationTestResult[] {
  const t1 = calculateUnitCommission(5000);
  const t2 = calculateUnitCommission(10000);
  const t3 = calculateUnitCommission(20000);
  const t4 = calculateUnitCommission(35000);
  const t5 = calculateCenterType1(60000);
  const t6 = calculateRegionType1(300000);
  const t7 = calculateRegionBonus(2000000);

  return [
    {
      id: 1,
      testName: 'ค่าจัดงานหน่วย Tier 1 (5,000 บาท)',
      category: 'Unit Management',
      expectedFormula: '5,000 × 25%',
      expectedValue: 1250,
      actualValue: t1.amount,
      expected: 1250,
      actual: t1.amount,
      passed: t1.amount === 1250,
      notes: 'COM 5,000 - 9,999 บาท อัตรา 25%',
    },
    {
      id: 2,
      testName: 'ค่าจัดงานหน่วย Tier 2 (10,000 บาท)',
      category: 'Unit Management',
      expectedFormula: '10,000 × 30%',
      expectedValue: 3000,
      actualValue: t2.amount,
      expected: 3000,
      actual: t2.amount,
      passed: t2.amount === 3000,
      notes: 'COM 10,000 - 19,999 บาท อัตรา 30%',
    },
    {
      id: 3,
      testName: 'ค่าจัดงานหน่วย Tier 3 (20,000 บาท)',
      category: 'Unit Management',
      expectedFormula: '20,000 × 35%',
      expectedValue: 7000,
      actualValue: t3.amount,
      expected: 7000,
      actual: t3.amount,
      passed: t3.amount === 7000,
      notes: 'COM 20,000 - 34,999 บาท อัตรา 35%',
    },
    {
      id: 4,
      testName: 'ค่าจัดงานหน่วย Tier 4 (35,000 บาท)',
      category: 'Unit Management',
      expectedFormula: '35,000 × 40%',
      expectedValue: 14000,
      actualValue: t4.amount,
      expected: 14000,
      actual: t4.amount,
      passed: t4.amount === 14000,
      notes: 'COM ≥ 35,000 บาท อัตรา 40%',
    },
    {
      id: 5,
      testName: 'ค่าจัดงานศูนย์ประเภท 1 Tier 3 (60,000 บาท)',
      category: 'Center Type 1',
      expectedFormula: '60,000 × 25%',
      expectedValue: 15000,
      actualValue: t5.amount,
      expected: 15000,
      actual: t5.amount,
      passed: t5.amount === 15000,
      notes: 'COM ศูนย์ 60,000 - 119,999 บาท อัตรา 25%',
    },
    {
      id: 6,
      testName: 'ค่าจัดงานภาคประเภท 1 Tier 5 (300,000 บาท)',
      category: 'Region Type 1',
      expectedFormula: '300,000 × 18%',
      expectedValue: 54000,
      actualValue: t6.amount,
      expected: 54000,
      actual: t6.amount,
      passed: t6.amount === 54000,
      notes: 'FYC ภาค ≥ 300,000 บาท อัตรา 18%',
    },
    {
      id: 7,
      testName: 'โบนัสภาครายปี Tier 3 (2,000,000 บาท)',
      category: 'Region Annual Bonus',
      expectedFormula: '2,000,000 × 2.5%',
      expectedValue: 50000,
      actualValue: t7.amount,
      expected: 50000,
      actual: t7.amount,
      passed: t7.amount === 50000,
      notes: 'FYC สะสมรายปี ≥ 2,000,000 บาท โบนัส 2.5%',
    },
  ];
}
