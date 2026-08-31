import { PositionInfo, CompensationRuleSet } from '../types';

export const POSITIONS_LIST: PositionInfo[] = [
  {
    id: 'AGENT',
    nameTh: 'ตัวแทนประกันชีวิต (Agent)',
    nameEn: 'Insurance Agent',
    badgeColor: 'bg-slate-700 text-slate-200 border-slate-600',
    accentColor: '#94A3B8',
    order: 0,
    minPerformance: 0,
    minMonths: 0,
    maxMonths: 0,
    description: 'ตัวแทนระดับเริ่มต้น เน้นผลงานการขายส่วนตัวและการขยายเครือข่ายทีมงานเบื้องต้น',
  },
  {
    id: 'UNIT_MANAGER',
    nameTh: 'ผู้บริหารหน่วย (Unit Manager)',
    nameEn: 'Unit Manager (UM)',
    badgeColor: 'bg-blue-950 text-blue-300 border-blue-700',
    accentColor: '#3B82F6',
    order: 1,
    minPerformance: 20000,
    minMonths: 1,
    maxMonths: 6,
    requiredUnits: 0,
    description: 'บริหารจัดการหน่วยตัวแทน ได้รับค่าบำเหน็จ ค่าพาหนะ ค่าจัดงานหน่วย และค่าแยกหน่วย',
  },
  {
    id: 'CENTER_MANAGER',
    nameTh: 'ผู้บริหารศูนย์ (Center Manager)',
    nameEn: 'Center Manager (CM)',
    badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-700',
    accentColor: '#10B981',
    order: 2,
    minPerformance: 75000,
    minMonths: 3,
    maxMonths: 6,
    requiredUnits: 2,
    description: 'บริหารโครงสร้างศูนย์ ดูแลหน่วยงานในสังกัด ได้รับค่าจัดงานศูนย์ 3 ประเภท ค่าแยกศูนย์ และโบนัสประจำปี',
  },
  {
    id: 'GROUP_MANAGER',
    nameTh: 'ผู้บริหารภาค (Group Manager)',
    nameEn: 'Group Manager (GM)',
    badgeColor: 'bg-amber-950 text-amber-300 border-amber-600',
    accentColor: '#F59E0B',
    order: 3,
    minPerformance: 1200000,
    minMonths: 12,
    maxMonths: 24,
    requiredCenters: 4,
    description: 'ตำแหน่งบริหารระดับสูง ควบคุมสายงานภาค ได้รับค่าจัดงานภาค โบนัสภาค ค่าแยกภาค และค่าบริหารเป้าหมาย',
  },
];

export const DEFAULT_COMPENSATION_RULES: CompensationRuleSet = {
  version: '2564.1.15-OFFICIAL',
  updatedAt: '2021-01-15',
  effectiveDate: '2021-01-15',
  status: 'OFFICIAL_DOCUMENT_2564',
  approvedBy: 'คณะกรรมการบริหารฝ่ายขาย (อ้างอิงเอกสาร 15 มกราคม 2564)',
  notes: 'โครงสร้างผลประโยชน์ตัวแทนและผู้บริหารฝ่ายขาย อัปเดต 15 มกราคม 2564 สำหรับจำลองการคำนวณเบื้องต้น',

  // 1. ผู้บริหารหน่วย
  unitManager: {
    qualMinPerformance: 20000,
    qualMonthsMin: 1,
    qualMonthsMax: 6,
    commissionRateDefault: 30, // 30% average commission
    vehicleAllowance: 3000, // ค่าพาหนะพื้นฐาน
    unitManagementTiers: [
      { id: 'UM-MGMT-1', minAmount: 5000, maxAmount: 9999.99, ratePercentage: 25, label: '5,000 - 9,999 บาท (25%)' },
      { id: 'UM-MGMT-2', minAmount: 10000, maxAmount: 19999.99, ratePercentage: 30, label: '10,000 - 19,999 บาท (30%)' },
      { id: 'UM-MGMT-3', minAmount: 20000, maxAmount: 34999.99, ratePercentage: 35, label: '20,000 - 34,999 บาท (35%)' },
      { id: 'UM-MGMT-4', minAmount: 35000, maxAmount: undefined, ratePercentage: 40, label: '35,000 บาทขึ้นไป (40%)' },
    ],
    unitSeparationPerUnit: 2000, // 2,000 บาท / หน่วยแยก
  },

  // 2. ผู้บริหารศูนย์
  centerManager: {
    qualMinPerformance: 75000,
    qualMonthsMin: 3,
    qualMonthsMax: 6,
    qualMinSeparatedUnits: 2,
    centerType1Tiers: [
      { id: 'CM-T1-1', minAmount: 15000, maxAmount: 29999.99, ratePercentage: 15, label: 'COM 15,000 - 29,999 บาท (15%)' },
      { id: 'CM-T1-2', minAmount: 30000, maxAmount: 59999.99, ratePercentage: 20, label: 'COM 30,000 - 59,999 บาท (20%)' },
      { id: 'CM-T1-3', minAmount: 60000, maxAmount: 119999.99, ratePercentage: 25, label: 'COM 60,000 - 119,999 บาท (25%)' },
      { id: 'CM-T1-4', minAmount: 120000, maxAmount: undefined, ratePercentage: 30, label: 'COM 120,000 บาทขึ้นไป (30%)' },
    ],
    centerType2Enabled: true,
    centerType2Rate: 0.8, // 0.8% ของเบี้ยปีต่อไป
    centerType3Tiers: [
      { id: 'CM-T3-1', minAmount: 15000, maxAmount: 29999.99, fixedAmount: 5000, label: 'COM 15,000 - 29,999 บาท (5,000 ฿)' },
      { id: 'CM-T3-2', minAmount: 30000, maxAmount: 59999.99, fixedAmount: 8000, label: 'COM 30,000 - 59,999 บาท (8,000 ฿)' },
      { id: 'CM-T3-3', minAmount: 60000, maxAmount: 119999.99, fixedAmount: 11000, label: 'COM 60,000 - 119,999 บาท (11,000 ฿)' },
      { id: 'CM-T3-4', minAmount: 120000, maxAmount: undefined, fixedAmount: 15000, label: 'COM 120,000 บาทขึ้นไป (15,000 ฿)' },
    ],
    centerSeparationTiers: [
      { id: 'CM-SEP-1', minAmount: 15000, maxAmount: 29999.99, fixedAmount: 1500, label: 'COM 15,000 - 29,999 บาท (1,500 ฿/ศูนย์)' },
      { id: 'CM-SEP-2', minAmount: 30000, maxAmount: 59999.99, fixedAmount: 2000, label: 'COM 30,000 - 59,999 บาท (2,000 ฿/ศูนย์)' },
      { id: 'CM-SEP-3', minAmount: 60000, maxAmount: 119999.99, fixedAmount: 2500, label: 'COM 60,000 - 119,999 บาท (2,500 ฿/ศูนย์)' },
      { id: 'CM-SEP-4', minAmount: 120000, maxAmount: undefined, fixedAmount: 3000, label: 'COM 120,000 บาทขึ้นไป (3,000 ฿/ศูนย์)' },
    ],
    centerSeparationFirstMonthBooster: 1000, // เงินเพิ่มเดือนแรก
    centerAnnualBonusTiers: [
      { id: 'CM-BONUS-1', minAmount: 150000, maxAmount: 299999.99, ratePercentage: 4, label: 'COM ต่อปี 150,000 - 299,999 บาท (4%)' },
      { id: 'CM-BONUS-2', minAmount: 300000, maxAmount: 599999.99, ratePercentage: 5, label: 'COM ต่อปี 300,000 - 599,999 บาท (5%)' },
      { id: 'CM-BONUS-3', minAmount: 600000, maxAmount: undefined, ratePercentage: 6, label: 'COM ต่อปี 600,000 บาทขึ้นไป (6%)' },
    ],
  },

  // 3. ผู้บริหารภาค
  groupManager: {
    qualMinPerformance: 1200000,
    qualMonthsMin: 12,
    qualMonthsMax: 24,
    qualMinSeparatedCenters: 4,
    groupType1Tiers: [
      { id: 'GM-T1-1', minAmount: 60000, maxAmount: 119999.99, ratePercentage: 10, label: 'FYC ทีม 60,000 - 119,999 บาท (10%)' },
      { id: 'GM-T1-2', minAmount: 120000, maxAmount: 179999.99, ratePercentage: 12, label: 'FYC ทีม 120,000 - 179,999 บาท (12%)' },
      { id: 'GM-T1-3', minAmount: 180000, maxAmount: 239999.99, ratePercentage: 14, label: 'FYC ทีม 180,000 - 239,999 บาท (14%)' },
      { id: 'GM-T1-4', minAmount: 240000, maxAmount: 299999.99, ratePercentage: 16, label: 'FYC ทีม 240,000 - 299,999 บาท (16%)' },
      { id: 'GM-T1-5', minAmount: 300000, maxAmount: undefined, ratePercentage: 18, label: 'FYC ทีม 300,000 บาทขึ้นไป (18%)' },
    ],
    groupType1RegionalNotes: 'เงื่อนไขมาตรฐานทั่วประเทศ (ยกเว้นเขตพื้นที่พิเศษที่ได้รับอนุมัติเฉพาะกรณี)',
    groupType2Tiers: [
      { id: 'GM-T2-1', minAmount: 15000, maxAmount: 29999.99, fixedAmount: 1000, label: 'FYC ศูนย์ 15,000 - 29,999 บาท (1,000 ฿)' },
      { id: 'GM-T2-2', minAmount: 30000, maxAmount: 59999.99, fixedAmount: 1500, label: 'FYC ศูนย์ 30,000 - 59,999 บาท (1,500 ฿)' },
      { id: 'GM-T2-3', minAmount: 60000, maxAmount: 119999.99, fixedAmount: 2000, label: 'FYC ศูนย์ 60,000 - 119,999 บาท (2,000 ฿)' },
      { id: 'GM-T2-4', minAmount: 120000, maxAmount: undefined, fixedAmount: 2500, label: 'FYC ศูนย์ 120,000 บาทขึ้นไป (2,500 ฿)' },
    ],
    groupAnnualBonusTiers: [
      { id: 'GM-BONUS-1', minAmount: 500000, maxAmount: 999999.99, ratePercentage: 1.5, label: 'FYC ปี 500,000 - 999,999 บาท (1.5%)' },
      { id: 'GM-BONUS-2', minAmount: 1000000, maxAmount: 1999999.99, ratePercentage: 2.0, label: 'FYC ปี 1,000,000 - 1,999,999 บาท (2.0%)' },
      { id: 'GM-BONUS-3', minAmount: 2000000, maxAmount: undefined, ratePercentage: 2.5, label: 'FYC ปี 2,000,000 บาทขึ้นไป (2.5%)' },
    ],
    groupSeparationType1Fixed: 8000, // 8,000 บาท จ่ายครั้งเดียว
    groupSeparationType2Monthly: 4000, // 4,000 บาทต่อเดือน (12 เดือน = 48,000)
    groupSeparationType3PercentOfT1: 40, // 40% ของค่าจัดงานประเภท 1
    targetManagementAllowanceTiers: [
      { annualFycMin: 1500000, annualReward: 120000, monthlyReward: 10000 },
      { annualFycMin: 2000000, annualReward: 180000, monthlyReward: 15000 },
      { annualFycMin: 3000000, annualReward: 240000, monthlyReward: 20000 },
      { annualFycMin: 4000000, annualReward: 300000, monthlyReward: 25000 },
      { annualFycMin: 5000000, annualReward: 360000, monthlyReward: 30000 },
    ],
  },
};
