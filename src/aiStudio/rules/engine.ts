import { Member, CompensationRuleSet, MemberIncomeResult, IncomeBreakdownItem, PositionLevel } from '../types';
import { toDecimal, round2, formatBaht, formatPercent } from '../lib/decimal';
import { POSITIONS_LIST } from './defaultRules';

export interface TreeSubtreeStats {
  member: Member;
  directChildren: TreeSubtreeStats[];
  allDescendants: Member[];
  totalTeamCount: number;
  activeTeamCount: number;
  totalMonthlySales: number;
  totalMonthlyCom: number;
  totalMonthlyFyc: number;
  totalAnnualFyc: number;
  totalAnnualCom: number;
  totalRenewalPremium: number;
  separatedUnitsCount: number;
  separatedCentersCount: number;
  separatedGroupsCount: number;
}

/**
 * Builds a hierarchical tree and rolls up sales/FYC/counts without double counting.
 */
export function buildTeamHierarchy(members: Member[]): Map<string, TreeSubtreeStats> {
  const statsMap = new Map<string, TreeSubtreeStats>();
  const childrenMap = new Map<string, Member[]>();

  // Initialize
  members.forEach(m => {
    childrenMap.set(m.id, []);
  });

  // Populate children
  members.forEach(m => {
    if (m.parentId && childrenMap.has(m.parentId)) {
      childrenMap.get(m.parentId)!.push(m);
    }
  });

  // Recursive rollup helper
  function computeSubtree(member: Member): TreeSubtreeStats {
    const directChildrenMembers = childrenMap.get(member.id) || [];
    const directChildrenStats: TreeSubtreeStats[] = directChildrenMembers.map(child => computeSubtree(child));

    const allDescendants: Member[] = [];
    let totalSales = toDecimal(member.personalMonthlySales);
    let totalCom = toDecimal(member.personalMonthlyCom);
    let totalFyc = toDecimal(member.personalMonthlyFyc);
    let totalAnnFyc = toDecimal(member.personalAnnualFyc);
    let totalAnnCom = toDecimal(member.personalAnnualCom);
    let totalRenewal = toDecimal(member.personalRenewalPremium);
    
    let activeCount = member.isActive ? 1 : 0;
    let separatedUnits = Number(member.directUnitCount || 0);
    let separatedCenters = Number(member.directCenterCount || 0);
    let separatedGroups = Number(member.directGroupCount || 0);

    // Count subordinate positions directly spawned
    directChildrenMembers.forEach(child => {
      if (child.position === 'UNIT_MANAGER') separatedUnits += 1;
      if (child.position === 'CENTER_MANAGER') separatedCenters += 1;
      if (child.position === 'GROUP_MANAGER') separatedGroups += 1;
    });

    directChildrenStats.forEach(childStat => {
      allDescendants.push(childStat.member, ...childStat.allDescendants);
      totalSales = totalSales.plus(toDecimal(childStat.totalMonthlySales));
      totalCom = totalCom.plus(toDecimal(childStat.totalMonthlyCom));
      totalFyc = totalFyc.plus(toDecimal(childStat.totalMonthlyFyc));
      totalAnnFyc = totalAnnFyc.plus(toDecimal(childStat.totalAnnualFyc));
      totalAnnCom = totalAnnCom.plus(toDecimal(childStat.totalAnnualCom));
      totalRenewal = totalRenewal.plus(toDecimal(childStat.totalRenewalPremium));
      activeCount += childStat.activeTeamCount;
    });

    const stat: TreeSubtreeStats = {
      member,
      directChildren: directChildrenStats,
      allDescendants,
      totalTeamCount: allDescendants.length + 1,
      activeTeamCount: activeCount,
      totalMonthlySales: round2(totalSales),
      totalMonthlyCom: round2(totalCom),
      totalMonthlyFyc: round2(totalFyc),
      totalAnnualFyc: round2(totalAnnFyc),
      totalAnnualCom: round2(totalAnnCom),
      totalRenewalPremium: round2(totalRenewal),
      separatedUnitsCount: separatedUnits,
      separatedCentersCount: separatedCenters,
      separatedGroupsCount: separatedGroups,
    };

    statsMap.set(member.id, stat);
    return stat;
  }

  // Find root members
  const rootMembers = members.filter(m => !m.parentId || !members.some(parent => parent.id === m.parentId));
  rootMembers.forEach(root => computeSubtree(root));

  // Fallback for any orphans
  members.forEach(m => {
    if (!statsMap.has(m.id)) {
      computeSubtree(m);
    }
  });

  return statsMap;
}

/**
 * Core Compensation Calculation Engine
 */
export function calculateMemberIncome(
  member: Member,
  allMembers: Member[],
  rules: CompensationRuleSet
): MemberIncomeResult {
  const treeMap = buildTeamHierarchy(allMembers);
  const myStats = treeMap.get(member.id) || {
    member,
    directChildren: [],
    allDescendants: [],
    totalTeamCount: 1,
    activeTeamCount: member.isActive ? 1 : 0,
    totalMonthlySales: member.personalMonthlySales,
    totalMonthlyCom: member.personalMonthlyCom,
    totalMonthlyFyc: member.personalMonthlyFyc,
    totalAnnualFyc: member.personalAnnualFyc,
    totalAnnualCom: member.personalAnnualCom,
    totalRenewalPremium: member.personalRenewalPremium,
    separatedUnitsCount: member.directUnitCount || 0,
    separatedCentersCount: member.directCenterCount || 0,
    separatedGroupsCount: member.directGroupCount || 0,
  };

  const breakdown: IncomeBreakdownItem[] = [];

  // Helper accumulator
  let personalTotal = toDecimal(0);
  let unitMgmtTotal = toDecimal(0);
  let centerMgmtTotal = toDecimal(0);
  let groupMgmtTotal = toDecimal(0);
  let monthlyBonusTotal = toDecimal(0);
  let annualBonusTotal = toDecimal(0);
  let pendingConditionTotal = toDecimal(0);

  // ----------------------------------------------------
  // 1. Personal Commission & Allowances (ทุกระดับตำแหน่ง)
  // ----------------------------------------------------
  if (member.personalMonthlyCom > 0 || member.personalMonthlySales > 0) {
    const comAmount = member.personalMonthlyCom > 0 
      ? member.personalMonthlyCom 
      : round2(toDecimal(member.personalMonthlySales).times(rules.unitManager.commissionRateDefault).dividedBy(100));
    
    personalTotal = personalTotal.plus(toDecimal(comAmount));
    breakdown.push({
      id: `INC-PERS-${member.id}`,
      category: 'PERSONAL_COMMISSION',
      categoryNameTh: 'ค่าบำเหน็จส่วนตัว (Commission)',
      tierOrRuleId: 'RULE-COM-PERS',
      baseAmount: member.personalMonthlySales > 0 ? member.personalMonthlySales : member.personalMonthlyCom,
      rateOrAmount: member.personalMonthlyCom > 0 ? 0 : rules.unitManager.commissionRateDefault,
      isPercentage: member.personalMonthlyCom === 0,
      calculatedAmount: comAmount,
      formulaDescription: member.personalMonthlyCom > 0 
        ? `ระบุโดยตรงจากผลงานขายส่วนตัว = ${formatBaht(comAmount)}`
        : `ยอดขายส่วนตัว ${formatBaht(member.personalMonthlySales)} × ${rules.unitManager.commissionRateDefault}% = ${formatBaht(comAmount)}`,
      sourceMemberId: member.id,
      sourceMemberName: member.name,
      sourceTeamRole: 'ผลงานส่วนตัว',
      status: 'CONFIRMED',
      isDuplicateRiskChecked: true,
    });
  }

  // Vehicle allowance for managers (ถ้ามี)
  if (member.position !== 'AGENT' && rules.unitManager.vehicleAllowance > 0 && member.isActive) {
    const vAllowance = rules.unitManager.vehicleAllowance;
    personalTotal = personalTotal.plus(toDecimal(vAllowance));
    breakdown.push({
      id: `INC-VEHICLE-${member.id}`,
      category: 'VEHICLE_ALLOWANCE',
      categoryNameTh: 'ค่าพาหนะ (Vehicle Allowance)',
      tierOrRuleId: 'RULE-VEHICLE',
      baseAmount: 0,
      rateOrAmount: vAllowance,
      isPercentage: false,
      calculatedAmount: vAllowance,
      formulaDescription: `เงินช่วยเหลือค่าพาหนะผู้บริหารประจำเดือน (คงที่) = ${formatBaht(vAllowance)}`,
      sourceMemberId: member.id,
      sourceMemberName: member.name,
      sourceTeamRole: 'สิทธิประโยชน์ผู้บริหาร',
      status: 'CONFIRMED',
      isDuplicateRiskChecked: true,
    });
  }

  // ----------------------------------------------------
  // 2. Unit Management (ผู้บริหารหน่วยขึ้นไป)
  // ----------------------------------------------------
  if (['UNIT_MANAGER', 'CENTER_MANAGER', 'GROUP_MANAGER'].includes(member.position)) {
    // 2.1 ค่าจัดงานหน่วย = ฐานผลงานที่เข้าเงื่อนไข x อัตราที่กำหนด
    // ฐานผลงานคือผลงานรวมของหน่วย (personal + direct unit team members)
    const unitBaseSales = toDecimal(myStats.totalMonthlySales);
    const unitTiers = rules.unitManager.unitManagementTiers;

    // Find highest matching tier
    let matchingUnitTier = null;
    for (let i = unitTiers.length - 1; i >= 0; i--) {
      const tier = unitTiers[i];
      if (unitBaseSales.greaterThanOrEqualTo(tier.minAmount)) {
        matchingUnitTier = tier;
        break;
      }
    }

    if (matchingUnitTier && matchingUnitTier.ratePercentage) {
      const unitMgmtAmt = round2(unitBaseSales.times(matchingUnitTier.ratePercentage).dividedBy(100));
      unitMgmtTotal = unitMgmtTotal.plus(toDecimal(unitMgmtAmt));
      breakdown.push({
        id: `INC-UM-MGMT-${member.id}`,
        category: 'UNIT_MANAGEMENT',
        categoryNameTh: 'ค่าจัดงานหน่วย',
        tierOrRuleId: matchingUnitTier.id,
        baseAmount: myStats.totalMonthlySales,
        rateOrAmount: matchingUnitTier.ratePercentage,
        isPercentage: true,
        calculatedAmount: unitMgmtAmt,
        formulaDescription: `ฐานผลงานหน่วยรวม ${formatBaht(myStats.totalMonthlySales)} × ${matchingUnitTier.ratePercentage}% (ตามขั้น ${matchingUnitTier.label}) = ${formatBaht(unitMgmtAmt)}`,
        sourceMemberId: member.id,
        sourceMemberName: `${member.name} และทีมงานในหน่วย`,
        sourceTeamRole: 'หน่วยงานตรง',
        status: 'CONFIRMED',
        isDuplicateRiskChecked: true,
      });
    } else if (unitBaseSales.greaterThan(0)) {
      // Below min tier (e.g. < 5,000)
      const minReq = unitTiers[0]?.minAmount || 5000;
      pendingConditionTotal = pendingConditionTotal.plus(toDecimal(0));
      breakdown.push({
        id: `INC-UM-MGMT-PENDING-${member.id}`,
        category: 'UNIT_MANAGEMENT',
        categoryNameTh: 'ค่าจัดงานหน่วย (ยังไม่ผ่านเกณฑ์)',
        tierOrRuleId: 'UM-MGMT-PENDING',
        baseAmount: myStats.totalMonthlySales,
        rateOrAmount: 0,
        isPercentage: true,
        calculatedAmount: 0,
        formulaDescription: `ผลงานรวม ${formatBaht(myStats.totalMonthlySales)} ยังไม่ถึงเกณฑ์ขั้นต่ำ ${formatBaht(minReq)} (รอตรวจสอบเงื่อนไข)`,
        sourceMemberId: member.id,
        sourceMemberName: member.name,
        sourceTeamRole: 'หน่วยงานตรง',
        status: 'PENDING_CONDITIONS',
        isDuplicateRiskChecked: true,
        notes: `ขาดอีก ${formatBaht(minReq - myStats.totalMonthlySales)} เพื่อรับอัตราขั้นต่ำ 25%`,
      });
    }

    // 2.2 ค่าแยกหน่วย = จำนวนหน่วยที่แยกสำเร็จ x 2,000 บาท
    const separatedUnits = myStats.separatedUnitsCount;
    if (separatedUnits > 0) {
      const unitSepAmount = round2(toDecimal(separatedUnits).times(rules.unitManager.unitSeparationPerUnit));
      unitMgmtTotal = unitMgmtTotal.plus(toDecimal(unitSepAmount));
      breakdown.push({
        id: `INC-UM-SEP-${member.id}`,
        category: 'UNIT_SEPARATION',
        categoryNameTh: 'ค่าแยกหน่วย',
        tierOrRuleId: 'RULE-UM-SEP',
        baseAmount: separatedUnits,
        rateOrAmount: rules.unitManager.unitSeparationPerUnit,
        isPercentage: false,
        calculatedAmount: unitSepAmount,
        formulaDescription: `จำนวนหน่วยแยกสำเร็จ ${separatedUnits} หน่วย × ${formatBaht(rules.unitManager.unitSeparationPerUnit)}/หน่วย = ${formatBaht(unitSepAmount)}`,
        sourceMemberId: member.id,
        sourceMemberName: `${separatedUnits} หน่วยลูก`,
        sourceTeamRole: 'หน่วยที่แยกตัวสำเร็จ',
        status: 'CONFIRMED',
        isDuplicateRiskChecked: true,
      });
    }
  }

  // ----------------------------------------------------
  // 3. Center Management (ผู้บริหารศูนย์ขึ้นไป)
  // ----------------------------------------------------
  if (['CENTER_MANAGER', 'GROUP_MANAGER'].includes(member.position)) {
    const centerCom = toDecimal(myStats.totalMonthlyCom);

    // 3.1 ค่าจัดงานศูนย์ประเภท 1: COM ต่อเดือน (15k->15%, 30k->20%, 60k->25%, 120k->30%)
    let matchType1Tier = null;
    const type1Tiers = rules.centerManager.centerType1Tiers;
    for (let i = type1Tiers.length - 1; i >= 0; i--) {
      if (centerCom.greaterThanOrEqualTo(type1Tiers[i].minAmount)) {
        matchType1Tier = type1Tiers[i];
        break;
      }
    }

    if (matchType1Tier && matchType1Tier.ratePercentage) {
      const centerT1Amt = round2(centerCom.times(matchType1Tier.ratePercentage).dividedBy(100));
      centerMgmtTotal = centerMgmtTotal.plus(toDecimal(centerT1Amt));
      breakdown.push({
        id: `INC-CM-T1-${member.id}`,
        category: 'CENTER_TYPE_1',
        categoryNameTh: 'ค่าจัดงานศูนย์ประเภท 1',
        tierOrRuleId: matchType1Tier.id,
        baseAmount: myStats.totalMonthlyCom,
        rateOrAmount: matchType1Tier.ratePercentage,
        isPercentage: true,
        calculatedAmount: centerT1Amt,
        formulaDescription: `COM ศูนย์ต่อเดือน ${formatBaht(myStats.totalMonthlyCom)} × ${matchType1Tier.ratePercentage}% (${matchType1Tier.label}) = ${formatBaht(centerT1Amt)}`,
        sourceMemberId: member.id,
        sourceMemberName: `ทีมศูนย์ ${member.name}`,
        sourceTeamRole: 'โครงสร้างศูนย์',
        status: 'CONFIRMED',
        isDuplicateRiskChecked: true,
      });
    } else if (centerCom.greaterThan(0)) {
      const minReq = type1Tiers[0]?.minAmount || 15000;
      breakdown.push({
        id: `INC-CM-T1-PENDING-${member.id}`,
        category: 'CENTER_TYPE_1',
        categoryNameTh: 'ค่าจัดงานศูนย์ประเภท 1 (ยังไม่ถึงเกณฑ์)',
        tierOrRuleId: 'CM-T1-PENDING',
        baseAmount: myStats.totalMonthlyCom,
        rateOrAmount: 0,
        isPercentage: true,
        calculatedAmount: 0,
        formulaDescription: `COM ศูนย์ ${formatBaht(myStats.totalMonthlyCom)} ยังไม่ถึงเกณฑ์ขั้นต่ำ ${formatBaht(minReq)}`,
        sourceMemberId: member.id,
        sourceMemberName: member.name,
        sourceTeamRole: 'โครงสร้างศูนย์',
        status: 'PENDING_CONDITIONS',
        isDuplicateRiskChecked: true,
        notes: `ขาด COM อีก ${formatBaht(minReq - myStats.totalMonthlyCom)} เพื่อรับ 15%`,
      });
    }

    // 3.2 ค่าจัดงานศูนย์ประเภท 2: 0.8% ของเบี้ยปีต่อไป (Renewal Premium)
    if (rules.centerManager.centerType2Enabled && myStats.totalRenewalPremium > 0) {
      const renewalBase = toDecimal(myStats.totalRenewalPremium);
      const centerT2Amt = round2(renewalBase.times(rules.centerManager.centerType2Rate).dividedBy(100));
      centerMgmtTotal = centerMgmtTotal.plus(toDecimal(centerT2Amt));
      breakdown.push({
        id: `INC-CM-T2-${member.id}`,
        category: 'CENTER_TYPE_2',
        categoryNameTh: 'ค่าจัดงานศูนย์ประเภท 2 (เบี้ยปีต่อไป)',
        tierOrRuleId: 'RULE-CM-T2-RENEWAL',
        baseAmount: myStats.totalRenewalPremium,
        rateOrAmount: rules.centerManager.centerType2Rate,
        isPercentage: true,
        calculatedAmount: centerT2Amt,
        formulaDescription: `ฐานเบี้ยปีต่อไป ${formatBaht(myStats.totalRenewalPremium)} × ${rules.centerManager.centerType2Rate}% = ${formatBaht(centerT2Amt)}`,
        sourceMemberId: member.id,
        sourceMemberName: `พอร์ตกรมธรรม์ปีต่อไป`,
        sourceTeamRole: 'เบี้ยปีต่อไปของศูนย์',
        status: 'CONFIRMED',
        isDuplicateRiskChecked: true,
      });
    }

    // 3.3 ค่าจัดงานศูนย์ประเภท 3: COM ต่อเดือน (15k->5,000, 30k->8,000, 60k->11,000, 120k->15,000)
    let matchType3Tier = null;
    const type3Tiers = rules.centerManager.centerType3Tiers;
    for (let i = type3Tiers.length - 1; i >= 0; i--) {
      if (centerCom.greaterThanOrEqualTo(type3Tiers[i].minAmount)) {
        matchType3Tier = type3Tiers[i];
        break;
      }
    }

    if (matchType3Tier && matchType3Tier.fixedAmount) {
      const centerT3Amt = matchType3Tier.fixedAmount;
      centerMgmtTotal = centerMgmtTotal.plus(toDecimal(centerT3Amt));
      breakdown.push({
        id: `INC-CM-T3-${member.id}`,
        category: 'CENTER_TYPE_3',
        categoryNameTh: 'ค่าจัดงานศูนย์ประเภท 3 (เงินรางวัลตามขั้น)',
        tierOrRuleId: matchType3Tier.id,
        baseAmount: myStats.totalMonthlyCom,
        rateOrAmount: centerT3Amt,
        isPercentage: false,
        calculatedAmount: centerT3Amt,
        formulaDescription: `COM ศูนย์ต่อเดือน ${formatBaht(myStats.totalMonthlyCom)} เข้าขั้น ${matchType3Tier.label} ได้รับเงินจัดงานคงที่ = ${formatBaht(centerT3Amt)}`,
        sourceMemberId: member.id,
        sourceMemberName: member.name,
        sourceTeamRole: 'โครงสร้างศูนย์',
        status: 'CONFIRMED',
        isDuplicateRiskChecked: true,
      });
    }

    // 3.4 ค่าแยกศูนย์: COM 15k->1,500, 30k->2,000, 60k->2,500, 120k->3,000 per separated center
    const sepCenterCount = myStats.separatedCentersCount;
    if (sepCenterCount > 0) {
      let matchSepTier = null;
      const sepTiers = rules.centerManager.centerSeparationTiers;
      for (let i = sepTiers.length - 1; i >= 0; i--) {
        if (centerCom.greaterThanOrEqualTo(sepTiers[i].minAmount)) {
          matchSepTier = sepTiers[i];
          break;
        }
      }

      if (matchSepTier && matchSepTier.fixedAmount) {
        let perCenterAmt = matchSepTier.fixedAmount;
        if (member.isNewCenter && rules.centerManager.centerSeparationFirstMonthBooster > 0) {
          perCenterAmt += rules.centerManager.centerSeparationFirstMonthBooster;
        }
        const sepCenterTotalAmt = round2(toDecimal(sepCenterCount).times(perCenterAmt));
        centerMgmtTotal = centerMgmtTotal.plus(toDecimal(sepCenterTotalAmt));
        breakdown.push({
          id: `INC-CM-SEP-${member.id}`,
          category: 'CENTER_SEPARATION',
          categoryNameTh: 'ค่าแยกศูนย์',
          tierOrRuleId: matchSepTier.id,
          baseAmount: sepCenterCount,
          rateOrAmount: perCenterAmt,
          isPercentage: false,
          calculatedAmount: sepCenterTotalAmt,
          formulaDescription: `ศูนย์แยกสำเร็จ ${sepCenterCount} ศูนย์ × ${formatBaht(perCenterAmt)}/ศูนย์ (COM เกณฑ์ ${matchSepTier.label}${member.isNewCenter ? ' + เงินเพิ่มเดือนแรก' : ''}) = ${formatBaht(sepCenterTotalAmt)}`,
          sourceMemberId: member.id,
          sourceMemberName: `${sepCenterCount} ศูนย์ลูก`,
          sourceTeamRole: 'ศูนย์ที่แยกตัว',
          status: 'CONFIRMED',
          isDuplicateRiskChecked: true,
        });
      }
    }

    // 3.5 โบนัสศูนย์รายปี (Annual COM 150k->4%, 300k->5%, 600k->6%)
    const annualCom = toDecimal(myStats.totalAnnualCom > 0 ? myStats.totalAnnualCom : toDecimal(myStats.totalMonthlyCom).times(12));
    let matchAnnualBonusTier = null;
    const bonusTiers = rules.centerManager.centerAnnualBonusTiers;
    for (let i = bonusTiers.length - 1; i >= 0; i--) {
      if (annualCom.greaterThanOrEqualTo(bonusTiers[i].minAmount)) {
        matchAnnualBonusTier = bonusTiers[i];
        break;
      }
    }

    if (matchAnnualBonusTier && matchAnnualBonusTier.ratePercentage) {
      const bonusAmt = round2(annualCom.times(matchAnnualBonusTier.ratePercentage).dividedBy(100));
      annualBonusTotal = annualBonusTotal.plus(toDecimal(bonusAmt));
      breakdown.push({
        id: `INC-CM-BONUS-${member.id}`,
        category: 'CENTER_ANNUAL_BONUS',
        categoryNameTh: 'โบนัสศูนย์รายปี',
        tierOrRuleId: matchAnnualBonusTier.id,
        baseAmount: annualCom.toNumber(),
        rateOrAmount: matchAnnualBonusTier.ratePercentage,
        isPercentage: true,
        calculatedAmount: bonusAmt,
        formulaDescription: `COM ศูนย์ประจำปี ${formatBaht(annualCom.toNumber())} × ${matchAnnualBonusTier.ratePercentage}% (${matchAnnualBonusTier.label}) = ${formatBaht(bonusAmt)}`,
        sourceMemberId: member.id,
        sourceMemberName: member.name,
        sourceTeamRole: 'ผลงานศูนย์ประจำปี',
        status: 'CONFIRMED',
        isDuplicateRiskChecked: true,
      });
    }
  }

  // ----------------------------------------------------
  // 4. Group Management (ผู้บริหารภาค / Group Manager)
  // ----------------------------------------------------
  if (member.position === 'GROUP_MANAGER') {
    const teamMonthlyFyc = toDecimal(myStats.totalMonthlyFyc);

    // 4.1 ค่าจัดงานภาคประเภท 1: คำนวณจาก FYC ทั้งทีม (60k->10%, 120k->12%, 180k->14%, 240k->16%, 300k->18%)
    let matchGroupT1Tier = null;
    const gT1Tiers = rules.groupManager.groupType1Tiers;
    for (let i = gT1Tiers.length - 1; i >= 0; i--) {
      if (teamMonthlyFyc.greaterThanOrEqualTo(gT1Tiers[i].minAmount)) {
        matchGroupT1Tier = gT1Tiers[i];
        break;
      }
    }

    let gT1Amt = 0;
    if (matchGroupT1Tier && matchGroupT1Tier.ratePercentage) {
      gT1Amt = round2(teamMonthlyFyc.times(matchGroupT1Tier.ratePercentage).dividedBy(100));
      groupMgmtTotal = groupMgmtTotal.plus(toDecimal(gT1Amt));
      breakdown.push({
        id: `INC-GM-T1-${member.id}`,
        category: 'GROUP_TYPE_1',
        categoryNameTh: 'ค่าจัดงานภาคประเภท 1 (FYC ทั้งทีม)',
        tierOrRuleId: matchGroupT1Tier.id,
        baseAmount: myStats.totalMonthlyFyc,
        rateOrAmount: matchGroupT1Tier.ratePercentage,
        isPercentage: true,
        calculatedAmount: gT1Amt,
        formulaDescription: `FYC ภาคทั้งทีม ${formatBaht(myStats.totalMonthlyFyc)} × ${matchGroupT1Tier.ratePercentage}% (${matchGroupT1Tier.label}) = ${formatBaht(gT1Amt)}`,
        sourceMemberId: member.id,
        sourceMemberName: `ทั้งสายงานภาค (${myStats.totalTeamCount} ท่าน)`,
        sourceTeamRole: 'สายงานภาคทั้งหมด',
        status: 'CONFIRMED',
        isDuplicateRiskChecked: true,
        notes: rules.groupManager.groupType1RegionalNotes,
      });
    }

    // 4.2 ค่าจัดงานภาคประเภท 2: คำนวณจาก FYC ของผู้บริหารศูนย์ (15k->1k, 30k->1.5k, 60k->2k, 120k->2.5k)
    // We inspect direct children that are Center Managers
    const subordinateCenterStats = myStats.directChildren.filter(c => c.member.position === 'CENTER_MANAGER' || c.totalMonthlyFyc >= 15000);
    let totalGmType2Amt = toDecimal(0);
    
    subordinateCenterStats.forEach((centerStat, idx) => {
      const cFyc = toDecimal(centerStat.totalMonthlyFyc);
      let matchT2Tier = null;
      const gT2Tiers = rules.groupManager.groupType2Tiers;
      for (let i = gT2Tiers.length - 1; i >= 0; i--) {
        if (cFyc.greaterThanOrEqualTo(gT2Tiers[i].minAmount)) {
          matchT2Tier = gT2Tiers[i];
          break;
        }
      }

      if (matchT2Tier && matchT2Tier.fixedAmount) {
        totalGmType2Amt = totalGmType2Amt.plus(toDecimal(matchT2Tier.fixedAmount));
        breakdown.push({
          id: `INC-GM-T2-${member.id}-${centerStat.member.id}-${idx}`,
          category: 'GROUP_TYPE_2',
          categoryNameTh: `ค่าจัดงานภาคประเภท 2 (ศูนย์: ${centerStat.member.name})`,
          tierOrRuleId: matchT2Tier.id,
          baseAmount: centerStat.totalMonthlyFyc,
          rateOrAmount: matchT2Tier.fixedAmount,
          isPercentage: false,
          calculatedAmount: matchT2Tier.fixedAmount,
          formulaDescription: `FYC ศูนย์ ${centerStat.member.name} จำนวน ${formatBaht(centerStat.totalMonthlyFyc)} เข้าเกณฑ์ ${matchT2Tier.label} = ${formatBaht(matchT2Tier.fixedAmount)}`,
          sourceMemberId: centerStat.member.id,
          sourceMemberName: centerStat.member.name,
          sourceTeamRole: 'ผู้บริหารศูนย์ในสังกัด',
          status: 'CONFIRMED',
          isDuplicateRiskChecked: true,
        });
      }
    });
    groupMgmtTotal = groupMgmtTotal.plus(totalGmType2Amt);

    // 4.3 โบนัสภาครายปี (Annual Team FYC: 500k-999k->1.5%, 1M-1.99M->2.0%, >=2M->2.5%)
    const annualTeamFyc = toDecimal(myStats.totalAnnualFyc > 0 ? myStats.totalAnnualFyc : toDecimal(myStats.totalMonthlyFyc).times(12));
    let matchGmBonusTier = null;
    const gmBonusTiers = rules.groupManager.groupAnnualBonusTiers;
    for (let i = gmBonusTiers.length - 1; i >= 0; i--) {
      if (annualTeamFyc.greaterThanOrEqualTo(gmBonusTiers[i].minAmount)) {
        matchGmBonusTier = gmBonusTiers[i];
        break;
      }
    }

    if (matchGmBonusTier && matchGmBonusTier.ratePercentage) {
      const gmBonusAmt = round2(annualTeamFyc.times(matchGmBonusTier.ratePercentage).dividedBy(100));
      annualBonusTotal = annualBonusTotal.plus(toDecimal(gmBonusAmt));
      breakdown.push({
        id: `INC-GM-BONUS-${member.id}`,
        category: 'GROUP_ANNUAL_BONUS',
        categoryNameTh: 'โบนัสภาครายปี',
        tierOrRuleId: matchGmBonusTier.id,
        baseAmount: annualTeamFyc.toNumber(),
        rateOrAmount: matchGmBonusTier.ratePercentage,
        isPercentage: true,
        calculatedAmount: gmBonusAmt,
        formulaDescription: `FYC ภาคทั้งปี ${formatBaht(annualTeamFyc.toNumber())} × ${matchGmBonusTier.ratePercentage}% (${matchGmBonusTier.label}) = ${formatBaht(gmBonusAmt)}`,
        sourceMemberId: member.id,
        sourceMemberName: `ทั้งสายงานภาค`,
        sourceTeamRole: 'โบนัสประจำปีทั้งภาค',
        status: 'CONFIRMED',
        isDuplicateRiskChecked: true,
      });
    }

    // 4.4 ค่าแยกภาค (ถ้ามีกลุ่มที่แยกตัวออกไป)
    const sepGroupCount = myStats.separatedGroupsCount;
    if (sepGroupCount > 0) {
      const sepT1Amt = rules.groupManager.groupSeparationType1Fixed * sepGroupCount;
      const sepT2Monthly = rules.groupManager.groupSeparationType2Monthly * sepGroupCount;
      const sepT3Amt = round2(toDecimal(gT1Amt).times(rules.groupManager.groupSeparationType3PercentOfT1).dividedBy(100));
      const groupSepTotal = sepT1Amt + sepT2Monthly + sepT3Amt;

      groupMgmtTotal = groupMgmtTotal.plus(toDecimal(groupSepTotal));
      breakdown.push({
        id: `INC-GM-SEP-${member.id}`,
        category: 'GROUP_SEPARATION',
        categoryNameTh: 'ค่าแยกภาค (ประเภท 1-3)',
        tierOrRuleId: 'RULE-GM-SEP',
        baseAmount: sepGroupCount,
        rateOrAmount: groupSepTotal,
        isPercentage: false,
        calculatedAmount: groupSepTotal,
        formulaDescription: `ประเภท 1 (${formatBaht(sepT1Amt)}) + ประเภท 2 ประจำเดือน (${formatBaht(sepT2Monthly)}) + ประเภท 3 (${rules.groupManager.groupSeparationType3PercentOfT1}% = ${formatBaht(sepT3Amt)}) = ${formatBaht(groupSepTotal)}`,
        sourceMemberId: member.id,
        sourceMemberName: `${sepGroupCount} ภาคแยก`,
        sourceTeamRole: 'ภาคที่แยกตัว',
        status: 'CONFIRMED',
        isDuplicateRiskChecked: true,
      });
    }

    // 4.5 ค่าบริหารเป้าหมาย (Target Management Allowance)
    // Based on annual team FYC: 1.5M->120k, 2M->180k, 3M->240k, 4M->300k, 5M->360k
    let matchTargetTier = null;
    const targetTiers = rules.groupManager.targetManagementAllowanceTiers;
    for (let i = targetTiers.length - 1; i >= 0; i--) {
      if (annualTeamFyc.greaterThanOrEqualTo(targetTiers[i].annualFycMin)) {
        matchTargetTier = targetTiers[i];
        break;
      }
    }

    if (matchTargetTier) {
      const monthlyTargetAmt = matchTargetTier.monthlyReward;
      groupMgmtTotal = groupMgmtTotal.plus(toDecimal(monthlyTargetAmt));
      breakdown.push({
        id: `INC-GM-TARGET-ALLOW-${member.id}`,
        category: 'TARGET_MANAGEMENT_ALLOWANCE',
        categoryNameTh: 'ค่าบริหารเป้าหมาย (รายเดือน/รายปี)',
        tierOrRuleId: `GM-TARGET-${matchTargetTier.annualFycMin}`,
        baseAmount: annualTeamFyc.toNumber(),
        rateOrAmount: monthlyTargetAmt,
        isPercentage: false,
        calculatedAmount: monthlyTargetAmt,
        formulaDescription: `FYC ภาคทั้งปี ${formatBaht(annualTeamFyc.toNumber())} (เกณฑ์ ≥ ${formatBaht(matchTargetTier.annualFycMin)}) รับ ${formatBaht(monthlyTargetAmt)}/เดือน (รวมทั้งปี ${formatBaht(matchTargetTier.annualReward)})`,
        sourceMemberId: member.id,
        sourceMemberName: member.name,
        sourceTeamRole: 'ค่าบริหารเป้าหมายระดับภาค',
        status: 'CONFIRMED',
        isDuplicateRiskChecked: true,
      });
    }
  }

  // ----------------------------------------------------
  // Summary aggregation
  // ----------------------------------------------------
  const grandTotalMonthly = personalTotal
    .plus(unitMgmtTotal)
    .plus(centerMgmtTotal)
    .plus(groupMgmtTotal)
    .plus(monthlyBonusTotal);

  const grandTotalAnnual = grandTotalMonthly.times(12).plus(annualBonusTotal);

  // ----------------------------------------------------
  // Promotion Gap Analysis
  // ----------------------------------------------------
  const posOrder = POSITIONS_LIST.find(p => p.id === member.position)?.order ?? 0;
  const nextPosInfo = POSITIONS_LIST.find(p => p.order === posOrder + 1) || null;

  let missingPerf = 0;
  let missingUnits = 0;
  let missingCenters = 0;
  let missingMonths = 0;
  let reqsMet = false;
  const checklist: { item: string; required: string; current: string; met: boolean }[] = [];

  if (nextPosInfo) {
    if (nextPosInfo.id === 'UNIT_MANAGER') {
      const perfReq = rules.unitManager.qualMinPerformance;
      const curPerf = member.personalMonthlySales;
      const perfMet = curPerf >= perfReq;
      missingPerf = Math.max(0, perfReq - curPerf);
      
      const tenureReq = `${rules.unitManager.qualMonthsMin} - ${rules.unitManager.qualMonthsMax} เดือน`;
      const tenureMet = member.tenureMonths >= rules.unitManager.qualMonthsMin;
      missingMonths = Math.max(0, rules.unitManager.qualMonthsMin - member.tenureMonths);

      checklist.push({ item: 'ผลงานขายส่วนตัว', required: formatBaht(perfReq), current: formatBaht(curPerf), met: perfMet });
      checklist.push({ item: 'ระยะเวลาการทำงาน', required: tenureReq, current: `${member.tenureMonths} เดือน`, met: tenureMet });
      reqsMet = perfMet && tenureMet;
    } else if (nextPosInfo.id === 'CENTER_MANAGER') {
      const perfReq = rules.centerManager.qualMinPerformance;
      const curPerf = myStats.totalMonthlySales;
      const perfMet = curPerf >= perfReq;
      missingPerf = Math.max(0, perfReq - curPerf);

      const unitsReq = rules.centerManager.qualMinSeparatedUnits;
      const curUnits = myStats.separatedUnitsCount;
      const unitsMet = curUnits >= unitsReq;
      missingUnits = Math.max(0, unitsReq - curUnits);

      const tenureReq = `${rules.centerManager.qualMonthsMin} - ${rules.centerManager.qualMonthsMax} เดือน`;
      const tenureMet = member.tenureMonths >= rules.centerManager.qualMonthsMin;
      missingMonths = Math.max(0, rules.centerManager.qualMonthsMin - member.tenureMonths);

      checklist.push({ item: 'ผลงานทีม/หน่วยรวม', required: formatBaht(perfReq), current: formatBaht(curPerf), met: perfMet });
      checklist.push({ item: 'จำนวนหน่วยแยกสำเร็จ', required: `อย่างน้อย ${unitsReq} หน่วย`, current: `${curUnits} หน่วย`, met: unitsMet });
      checklist.push({ item: 'ระยะเวลาการทำงาน', required: tenureReq, current: `${member.tenureMonths} เดือน`, met: tenureMet });
      reqsMet = perfMet && unitsMet && tenureMet;
    } else if (nextPosInfo.id === 'GROUP_MANAGER') {
      const perfReq = rules.groupManager.qualMinPerformance;
      const curPerf = myStats.totalMonthlySales;
      const perfMet = curPerf >= perfReq;
      missingPerf = Math.max(0, perfReq - curPerf);

      const centersReq = rules.groupManager.qualMinSeparatedCenters;
      const curCenters = myStats.separatedCentersCount;
      const centersMet = curCenters >= centersReq;
      missingCenters = Math.max(0, centersReq - curCenters);

      const tenureReq = `${rules.groupManager.qualMonthsMin} - ${rules.groupManager.qualMonthsMax} เดือน`;
      const tenureMet = member.tenureMonths >= rules.groupManager.qualMonthsMin;
      missingMonths = Math.max(0, rules.groupManager.qualMonthsMin - member.tenureMonths);

      checklist.push({ item: 'ผลงานรวมศูนย์/สายงาน', required: formatBaht(perfReq), current: formatBaht(curPerf), met: perfMet });
      checklist.push({ item: 'จำนวนศูนย์แยกสำเร็จ', required: `อย่างน้อย ${centersReq} ศูนย์`, current: `${curCenters} ศูนย์`, met: centersMet });
      checklist.push({ item: 'ระยะเวลาการทำงาน', required: tenureReq, current: `${member.tenureMonths} เดือน`, met: tenureMet });
      reqsMet = perfMet && centersMet && tenureMet;
    }
  }

  return {
    memberId: member.id,
    memberName: member.name,
    position: member.position,
    personalIncomeTotal: round2(personalTotal),
    unitManagementIncomeTotal: round2(unitMgmtTotal),
    centerManagementIncomeTotal: round2(centerMgmtTotal),
    groupManagementIncomeTotal: round2(groupMgmtTotal),
    monthlyBonusTotal: round2(monthlyBonusTotal),
    annualBonusTotal: round2(annualBonusTotal),
    totalMonthlyIncome: round2(grandTotalMonthly),
    totalAnnualIncome: round2(grandTotalAnnual),
    pendingConditionIncome: round2(pendingConditionTotal),
    breakdown,
    teamMemberCount: myStats.totalTeamCount,
    teamActiveMemberCount: myStats.activeTeamCount,
    teamTotalMonthlySales: myStats.totalMonthlySales,
    teamTotalMonthlyCom: myStats.totalMonthlyCom,
    teamTotalMonthlyFyc: myStats.totalMonthlyFyc,
    teamTotalAnnualFyc: myStats.totalAnnualFyc,
    teamTotalRenewalPremium: myStats.totalRenewalPremium,
    separatedUnitsCount: myStats.separatedUnitsCount,
    separatedCentersCount: myStats.separatedCentersCount,
    separatedGroupsCount: myStats.separatedGroupsCount,
    nextPosition: nextPosInfo ? nextPosInfo.id : null,
    promotionRequirementsMet: reqsMet,
    missingPerformanceForPromotion: missingPerf,
    missingUnitsForPromotion: missingUnits,
    missingCentersForPromotion: missingCenters,
    missingMonthsForPromotion: missingMonths,
    promotionChecklist: checklist,
  };
}
