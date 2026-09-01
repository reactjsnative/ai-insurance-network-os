import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';

/**
 * ==============================================================================
 * React Native Component: ThaiLifeCompensationScreen
 * โครงสร้างรายได้และผลประโยชน์ ตัวแทน/ผู้บริหาร ไทยประกันชีวิต
 * (Update 15 Jan 64 - ครอบคลุม 4 ตำแหน่ง และ 13 รายการผลประโยชน์)
 * ==============================================================================
 */

export type PositionId = 'agent' | 'unit_manager' | 'center_manager' | 'region_manager';

export interface IncomeBreakdownItem {
  id: string;
  title: string;
  category: 'personal' | 'unit' | 'center' | 'region' | 'bonus';
  amount: number;
  rateOrFormula: string;
  description: string;
}

export interface CalculationResult {
  totalMonthly: number;
  annualized: number;
  items: IncomeBreakdownItem[];
  careerProgress: {
    targetPosition: string;
    percent: number;
    gapText: string;
  };
}

export function computeThaiLifeCompensation(params: {
  positionId: PositionId;
  personalCom: number;
  teamFyc: number;
  teamCom: number;
  renewalPremium: number;
  separatedUnits: number;
  separatedCenters: number;
  separatedRegions: number;
}): CalculationResult {
  const {
    positionId,
    personalCom,
    teamFyc,
    teamCom,
    renewalPremium,
    separatedUnits,
    separatedCenters,
    separatedRegions,
  } = params;

  const items: IncomeBreakdownItem[] = [];

  // 1. บำเหน็จส่วนตัว (ทุกตำแหน่ง)
  items.push({
    id: 'personal_com',
    title: 'ค่าบำเหน็จส่วนตัว',
    category: 'personal',
    amount: Math.max(0, personalCom),
    rateOrFormula: '100% of Personal COM',
    description: `บำเหน็จผลงานส่วนตัว ฿${personalCom.toLocaleString()} บาท`,
  });

  // 2. ผู้บริหารหน่วย (UM) หรือสูงกว่า
  if (['unit_manager', 'center_manager', 'region_manager'].includes(positionId)) {
    // 2.1 ค่าจัดงานหน่วย (25% - 40%)
    let uRate = 0;
    let uText = '< 5k (0%)';
    if (teamCom >= 35000) {
      uRate = 0.40;
      uText = 'COM ≥ 35,000 (40%)';
    } else if (teamCom >= 20000) {
      uRate = 0.35;
      uText = 'COM 20,000 - 34,999 (35%)';
    } else if (teamCom >= 10000) {
      uRate = 0.30;
      uText = 'COM 10,000 - 19,999 (30%)';
    } else if (teamCom >= 5000) {
      uRate = 0.25;
      uText = 'COM 5,000 - 9,999 (25%)';
    }

    items.push({
      id: 'unit_mgmt',
      title: 'ค่าจัดงานหน่วย',
      category: 'unit',
      amount: Math.round(teamCom * uRate),
      rateOrFormula: `${uRate * 100}%`,
      description: uText,
    });

    // 2.2 ค่าแยกหน่วย (2,000 บาท/หน่วย)
    const unitSepAmt = Math.max(0, separatedUnits) * 2000;
    items.push({
      id: 'unit_sep',
      title: 'ค่าแยกหน่วย',
      category: 'unit',
      amount: unitSepAmt,
      rateOrFormula: '฿2,000 / หน่วย',
      description: `${separatedUnits} หน่วย × ฿2,000 = ฿${unitSepAmt.toLocaleString()}`,
    });
  }

  // 3. ผู้บริหารศูนย์ (CM) หรือสูงกว่า
  if (['center_manager', 'region_manager'].includes(positionId)) {
    // 3.1 ค่าจัดงานศูนย์ ประเภท 1 (15% - 30%)
    let c1Rate = 0;
    let c1Text = '< 15k (0%)';
    if (teamCom >= 120000) {
      c1Rate = 0.30;
      c1Text = 'COM ศูนย์ ≥ 120,000 (30%)';
    } else if (teamCom >= 60000) {
      c1Rate = 0.25;
      c1Text = 'COM ศูนย์ 60,000 - 119,999 (25%)';
    } else if (teamCom >= 30000) {
      c1Rate = 0.20;
      c1Text = 'COM ศูนย์ 30,000 - 59,999 (20%)';
    } else if (teamCom >= 15000) {
      c1Rate = 0.15;
      c1Text = 'COM ศูนย์ 15,000 - 29,999 (15%)';
    }

    items.push({
      id: 'center_t1',
      title: 'ค่าจัดงานศูนย์ ประเภท 1',
      category: 'center',
      amount: Math.round(teamCom * c1Rate),
      rateOrFormula: `${c1Rate * 100}%`,
      description: c1Text,
    });

    // 3.2 ค่าจัดงานศูนย์ ประเภท 2 (0.8% เบี้ยปีต่อ)
    const c2Amt = Math.round(renewalPremium * 0.008);
    items.push({
      id: 'center_t2',
      title: 'ค่าจัดงานศูนย์ ประเภท 2 (เบี้ยปีต่อ)',
      category: 'center',
      amount: c2Amt,
      rateOrFormula: '0.8% ของเบี้ยปีต่อไป',
      description: `เบี้ยปีต่อ ฿${renewalPremium.toLocaleString()} × 0.8%`,
    });

    // 3.3 ค่าจัดงานศูนย์ ประเภท 3 (ตารางคงที่ 5,000 - 15,000)
    let c3Amt = 0;
    if (teamCom >= 120000) c3Amt = 15000;
    else if (teamCom >= 60000) c3Amt = 11000;
    else if (teamCom >= 30000) c3Amt = 8000;
    else if (teamCom >= 15000) c3Amt = 5000;

    items.push({
      id: 'center_t3',
      title: 'ค่าจัดงานศูนย์ ประเภท 3',
      category: 'center',
      amount: c3Amt,
      rateOrFormula: 'ตารางขั้นบันได',
      description: `COM ศูนย์ ฿${teamCom.toLocaleString()} -> ฿${c3Amt.toLocaleString()}`,
    });

    // 3.4 ค่าแยกศูนย์ (4,000 + 2,000 เฉลี่ยต่อศูนย์)
    const cSepAmt = separatedCenters > 0 ? (separatedCenters * 4000) + (separatedCenters * 2000) : 0;
    items.push({
      id: 'center_sep',
      title: 'ค่าแยกศูนย์',
      category: 'center',
      amount: cSepAmt,
      rateOrFormula: '฿4,000 + ฿2,000/เดือน',
      description: `${separatedCenters} ศูนย์แยก`,
    });

    // 3.5 โบนัสศูนย์รายปี (เฉลี่ยรายเดือน)
    const annualCenterCom = teamCom * 12;
    let cBonusRate = 0;
    if (annualCenterCom >= 600000) cBonusRate = 0.06;
    else if (annualCenterCom >= 300000) cBonusRate = 0.05;
    else if (annualCenterCom >= 150000) cBonusRate = 0.04;
    const cBonusMonthly = Math.round((annualCenterCom * cBonusRate) / 12);

    items.push({
      id: 'center_bonus',
      title: 'โบนัสศูนย์รายปี (เฉลี่ยต่อเดือน)',
      category: 'bonus',
      amount: cBonusMonthly,
      rateOrFormula: `${cBonusRate * 100}% ของ COM ปี`,
      description: `COM รวมปี ฿${annualCenterCom.toLocaleString()} (โบนัส ฿${(annualCenterCom * cBonusRate).toLocaleString()}/ปี)`,
    });
  }

  // 4. ผู้บริหารภาค (RM)
  if (positionId === 'region_manager') {
    // 4.1 ค่าจัดงานภาค ประเภท 1 (10% - 16%)
    let r1Rate = 0;
    if (teamFyc >= 240000) r1Rate = 0.16;
    else if (teamFyc >= 180000) r1Rate = 0.14;
    else if (teamFyc >= 120000) r1Rate = 0.12;
    else if (teamFyc >= 60000) r1Rate = 0.10;

    const r1Amt = Math.round(teamFyc * r1Rate);
    items.push({
      id: 'region_t1',
      title: 'ค่าจัดงานภาค ประเภท 1',
      category: 'region',
      amount: r1Amt,
      rateOrFormula: `${r1Rate * 100}% ของ FYC`,
      description: `FYC ภาค ฿${teamFyc.toLocaleString()}`,
    });

    // 4.2 ค่าจัดงานภาค ประเภท 2 (1,000 - 2,500 ต่อศูนย์)
    const r2Amt = separatedCenters > 0 ? separatedCenters * 2000 : 4 * 1500;
    items.push({
      id: 'region_t2',
      title: 'ค่าจัดงานภาค ประเภท 2',
      category: 'region',
      amount: r2Amt,
      rateOrFormula: 'รายศูนย์ขั้นบันได',
      description: `เฉลี่ยศูนย์ละ ฿1,500 - ฿2,000`,
    });

    // 4.3 ค่าแยกภาค
    const rSepAmt = separatedRegions > 0 ? separatedRegions * 4000 : 0;
    items.push({
      id: 'region_sep',
      title: 'ค่าแยกภาค (12 เดือน)',
      category: 'region',
      amount: rSepAmt,
      rateOrFormula: '฿4,000/เดือน',
      description: `${separatedRegions} ภาคแยก`,
    });

    // 4.4 ค่าบริหารเป้าหมาย
    const annualFyc = teamFyc * 12;
    let targetAmt = 0;
    if (annualFyc >= 5000000) targetAmt = 30000;
    else if (annualFyc >= 4000000) targetAmt = 25000;
    else if (annualFyc >= 3000000) targetAmt = 20000;
    else if (annualFyc >= 2000000) targetAmt = 15000;
    else if (annualFyc >= 1500000) targetAmt = 10000;

    items.push({
      id: 'target_mgmt',
      title: 'ค่าบริหารเป้าหมาย',
      category: 'region',
      amount: targetAmt,
      rateOrFormula: '฿10k - ฿30k / เดือน',
      description: `FYC สะสมปี ฿${annualFyc.toLocaleString()}`,
    });

    // 4.5 โบนัสภาครายปี
    let rBonusRate = 0;
    if (annualFyc >= 2000000) rBonusRate = 0.025;
    else if (annualFyc >= 1000000) rBonusRate = 0.020;
    else if (annualFyc >= 500000) rBonusRate = 0.015;
    const rBonusMonthly = Math.round((annualFyc * rBonusRate) / 12);

    items.push({
      id: 'region_bonus',
      title: 'โบนัสภาครายปี (เฉลี่ยต่อเดือน)',
      category: 'bonus',
      amount: rBonusMonthly,
      rateOrFormula: `${(rBonusRate * 100).toFixed(1)}% ของ FYC ปี`,
      description: `โบนัสทั้งปี ฿${(annualFyc * rBonusRate).toLocaleString()}`,
    });
  }

  const totalMonthly = items.reduce((acc, curr) => acc + curr.amount, 0);

  // Career Progress
  let targetPosition = 'ผู้บริหารหน่วย (UM)';
  let percent = 0;
  let gapText = '';

  if (positionId === 'agent') {
    targetPosition = 'ผู้บริหารหน่วย (UM)';
    percent = Math.min(100, (personalCom / 20000) * 100);
    gapText = percent >= 100 ? 'ครบเกณฑ์เลื่อนตำแหน่ง UM' : `ขาดบำเหน็จอีก ฿${Math.max(0, 20000 - personalCom).toLocaleString()}`;
  } else if (positionId === 'unit_manager') {
    targetPosition = 'ผู้บริหารศูนย์ (CM)';
    const comPct = Math.min(100, (teamCom / 75000) * 100);
    const unitPct = Math.min(100, (separatedUnits / 2) * 100);
    percent = Math.round((comPct * 0.6) + (unitPct * 0.4));
    gapText = percent >= 100 ? 'ครบเกณฑ์เลื่อนตำแหน่ง CM' : `ต้องการ COM ฿75k & 2 หน่วยแยก`;
  } else if (positionId === 'center_manager') {
    targetPosition = 'ผู้บริหารภาค (RM)';
    const fycPct = Math.min(100, ((teamFyc * 12) / 1200000) * 100);
    const cPct = Math.min(100, (separatedCenters / 4) * 100);
    percent = Math.round((fycPct * 0.6) + (cPct * 0.4));
    gapText = percent >= 100 ? 'ครบเกณฑ์เลื่อนตำแหน่ง RM' : `ต้องการ FYC ฿1.2M & 4 ศูนย์แยก`;
  } else {
    targetPosition = 'ผู้บริหารระดับสูง (Executive Director)';
    percent = 100;
    gapText = 'ดำรงตำแหน่งระดับผู้บริหารภาคแล้ว';
  }

  return {
    totalMonthly,
    annualized: totalMonthly * 12,
    items,
    careerProgress: {
      targetPosition,
      percent: Math.round(percent),
      gapText,
    },
  };
}

export const ThaiLifeCompensationScreen: React.FC = () => {
  const [position, setPosition] = useState<PositionId>('region_manager');
  const [personalCom, setPersonalCom] = useState(30000);
  const [teamFyc, setTeamFyc] = useState(250000);
  const [teamCom, setTeamCom] = useState(75000);
  const [renewalPremium, setRenewalPremium] = useState(300000);
  const [separatedUnits, setSeparatedUnits] = useState(5);
  const [separatedCenters, setSeparatedCenters] = useState(3);
  const [separatedRegions, setSeparatedRegions] = useState(1);

  const result = useMemo(() => {
    return computeThaiLifeCompensation({
      positionId: position,
      personalCom,
      teamFyc,
      teamCom,
      renewalPremium,
      separatedUnits,
      separatedCenters,
      separatedRegions,
    });
  }, [position, personalCom, teamFyc, teamCom, renewalPremium, separatedUnits, separatedCenters, separatedRegions]);

  const positionsList: { id: PositionId; title: string; subtitle: string }[] = [
    { id: 'agent', title: 'ตัวแทน', subtitle: 'Agent' },
    { id: 'unit_manager', title: 'ผู้บริหารหน่วย', subtitle: 'UM' },
    { id: 'center_manager', title: 'ผู้บริหารศูนย์', subtitle: 'CM' },
    { id: 'region_manager', title: 'ผู้บริหารภาค', subtitle: 'RM' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 1. Header */}
        <View style={styles.headerBox}>
          <Text style={styles.headerSub}>THAI LIFE INSURANCE COMPENSATION</Text>
          <Text style={styles.headerTitle}>โปรแกรมคำนวณผลประโยชน์ไทยประกันชีวิต</Text>
          <Text style={styles.headerVersion}>อ้างอิงเอกสารโครงสร้างผลตอบแทน ปรับปรุง 15 ม.ค. 2564</Text>
        </View>

        {/* 2. Position Tabs */}
        <View style={styles.positionTabsRow}>
          {positionsList.map((pos) => {
            const isSelected = position === pos.id;
            return (
              <TouchableOpacity
                key={pos.id}
                onPress={() => setPosition(pos.id)}
                style={[styles.posTabButton, isSelected && styles.posTabButtonActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.posTabTitle, isSelected && styles.posTabTitleActive]}>
                  {pos.title}
                </Text>
                <Text style={[styles.posTabSub, isSelected && styles.posTabSubActive]}>
                  {pos.subtitle}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 3. Hero Result Box */}
        <View style={styles.heroResultCard}>
          <Text style={styles.heroLabel}>รายได้รวมสุทธิประเมินผล (รายเดือน)</Text>
          <Text style={styles.heroAmount}>฿{result.totalMonthly.toLocaleString()}</Text>
          <Text style={styles.heroAnnual}>
            คิดเป็นรายได้รายปี (Run-Rate): ฿{result.annualized.toLocaleString()} บาท/ปี
          </Text>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>เป้าหมายเลื่อนสู่ {result.careerProgress.targetPosition}</Text>
              <Text style={styles.progressPercent}>{result.careerProgress.percent}%</Text>
            </View>
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: `${result.careerProgress.percent}%` }]} />
            </View>
            <Text style={styles.progressGap}>{result.careerProgress.gapText}</Text>
          </View>
        </View>

        {/* 4. Controls Form */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>กรอกตัวเลขผลงานเพื่อคำนวณ</Text>

          {/* Personal COM */}
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>บำเหน็จส่วนตัว (COM):</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              value={String(personalCom)}
              onChangeText={(txt) => setPersonalCom(Number(txt) || 0)}
            />
          </View>

          {/* Team COM (UM, CM, RM) */}
          {position !== 'agent' && (
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>COM รวมทั้งทีม:</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={String(teamCom)}
                onChangeText={(txt) => setTeamCom(Number(txt) || 0)}
              />
            </View>
          )}

          {/* Team FYC (RM) */}
          {position === 'region_manager' && (
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>FYC รวมทั้งทีม (ภาค):</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={String(teamFyc)}
                onChangeText={(txt) => setTeamFyc(Number(txt) || 0)}
              />
            </View>
          )}

          {/* Separated Units (UM, CM, RM) */}
          {position !== 'agent' && (
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>จำนวนหน่วยที่แยกออก (Units):</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={String(separatedUnits)}
                onChangeText={(txt) => setSeparatedUnits(Number(txt) || 0)}
              />
            </View>
          )}

          {/* Separated Centers (CM, RM) */}
          {['center_manager', 'region_manager'].includes(position) && (
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>จำนวนศูนย์ที่แยกออก (Centers):</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={String(separatedCenters)}
                onChangeText={(txt) => setSeparatedCenters(Number(txt) || 0)}
              />
            </View>
          )}
        </View>

        {/* 5. Itemized Breakdown */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>
            รายการผลประโยชน์แจกแจง ({result.items.length} รายการ)
          </Text>

          {result.items.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemRowTop}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemAmount}>฿{item.amount.toLocaleString()}</Text>
              </View>
              <Text style={styles.itemFormula}>สูตร/เกณฑ์: {item.rateOrFormula}</Text>
              <Text style={styles.itemDesc}>{item.description}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerBox: {
    marginBottom: 16,
  },
  headerSub: {
    color: '#f59e0b',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  headerTitle: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 4,
  },
  headerVersion: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  positionTabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  posTabButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 12,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
  },
  posTabButtonActive: {
    backgroundColor: '#f59e0b',
    borderColor: '#d97706',
  },
  posTabTitle: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  posTabTitleActive: {
    color: '#020617',
  },
  posTabSub: {
    color: '#64748b',
    fontSize: 9,
    marginTop: 2,
  },
  posTabSubActive: {
    color: '#020617',
    fontWeight: 'bold',
  },
  heroResultCard: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#f59e0b',
    padding: 18,
    marginBottom: 16,
  },
  heroLabel: {
    color: '#f59e0b',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  heroAmount: {
    color: '#f8fafc',
    fontSize: 32,
    fontWeight: '900',
    marginTop: 4,
  },
  heroAnnual: {
    color: '#cbd5e1',
    fontSize: 12,
    marginTop: 4,
  },
  progressContainer: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressTitle: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
  },
  progressPercent: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '800',
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#1e293b',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#38bdf8',
  },
  progressGap: {
    color: '#64748b',
    fontSize: 10,
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: '#0b1329',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    color: '#f1f5f9',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  inputLabel: {
    color: '#94a3b8',
    fontSize: 12,
    flex: 1,
  },
  textInput: {
    backgroundColor: '#020617',
    color: '#f8fafc',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
    fontWeight: '700',
    width: 120,
    textAlign: 'right',
  },
  itemCard: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  itemRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTitle: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  itemAmount: {
    color: '#f59e0b',
    fontSize: 14,
    fontWeight: '800',
  },
  itemFormula: {
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  itemDesc: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 2,
  },
});

export default ThaiLifeCompensationScreen;
