#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
================================================================================
โครงสร้างรายได้และผลประโยชน์ ตัวแทน/ผู้บริหาร ไทยประกันชีวิต
(Thai Life Insurance Agent & Management Compensation Engine)
อ้างอิงเอกสาร: โครงสร้างรายได้ ฉบับปรับปรุง 15 มกราคม 2564 (Update 15 Jan 64)
================================================================================

ครอบคลุม 4 ระดับตำแหน่งหลัก:
1. ตัวแทน (Agent)
2. ผู้บริหารหน่วย (Unit Manager - UM)
3. ผู้บริหารศูนย์ (Center / District Manager - CM)
4. ผู้บริหารภาค (Regional / Group Manager - RM)

รายการผลประโยชน์ 13 รายการ:
1. ค่าบำเหน็จส่วนตัว (Personal Commission) & ค่าพาหนะ
2. ค่าจัดงานหน่วย (Unit Management Fee) (25% - 40%)
3. ค่าแยกหน่วย (Unit Separation) (2,000 บาท/หน่วย)
4. ค่าจัดงานศูนย์ประเภท 1 (Center Management T1) (15% - 30%)
5. ค่าจัดงานศูนย์ประเภท 2 (Center Management T2 - 0.8% เบี้ยปีต่อ)
6. ค่าจัดงานศูนย์ประเภท 3 (Center Management T3 - Lookup Fixed 5,000 - 15,000 บาท)
7. ค่าแยกศูนย์ (Center Separation) (เดือนแรก 4,000 บาท + 24 เดือนตาม COM ศูนย์ใหม่ 1,500 - 3,000 บาท)
8. โบนัสศูนย์รายปี (Annual Center Bonus) (4% - 6%)
9. ค่าจัดงานภาคประเภท 1 (Region Management T1) (10% - 18%)
10. ค่าจัดงานภาคประเภท 2 (Region Management T2) (1,000 - 2,500 บาทต่อศูนย์)
11. ค่าแยกภาค (Region Separation) (แบบ 1: 8,000 ครั้งเดียว, แบบ 2: 4,000 x 12 เดือน, แบบ 3: 40% ของภาค T1)
12. ค่าบริหารเป้าหมาย (Target Management Fee) (10,000 - 30,000 บาท/เดือน หรือ 120k - 360k/ปี)
13. โบนัสภาครายปี (Annual Region Bonus) (1.5% - 2.5%)
"""

import sys
import json
from dataclasses import dataclass, field, asdict
from typing import List, Dict, Optional, Tuple, Any

# ==============================================================================
# DATA MODELS & SCHEMAS
# ==============================================================================

@dataclass
class IncomeItem:
    item_id: str
    name_th: str
    name_en: str
    category: str  # 'personal', 'unit', 'center', 'region', 'bonus'
    amount: float
    rate_or_formula: str
    basis_value: float
    description: str
    is_qualified: bool = True

@dataclass
class CompensationResult:
    position_id: str
    position_name_th: str
    total_monthly_income: float
    annualized_run_rate: float
    breakdown: List[IncomeItem]
    summary_by_category: Dict[str, float]
    promotion_status: Dict[str, Any]

# ==============================================================================
# CALCULATION FUNCTIONS (ตามเกณฑ์ 4 ภาพ Infographics Update 15 Jan 64)
# ==============================================================================

def calculate_personal_commission(personal_com: float) -> IncomeItem:
    """
    1. ค่าบำเหน็จส่วนตัว (Personal Commission)
    - จ่าย 100% ตามผลงานส่วนบุคคล
    """
    amount = float(max(0.0, personal_com))
    return IncomeItem(
        item_id="personal_commission",
        name_th="ค่าบำเหน็จส่วนตัว",
        name_en="Personal Commission",
        category="personal",
        amount=amount,
        rate_or_formula="100% of Personal COM",
        basis_value=amount,
        description=f"บำเหน็จผลงานส่วนตัว ฿{amount:,.2f} บาท",
        is_qualified=amount > 0
    )

def calculate_unit_management(team_com: float) -> IncomeItem:
    """
    2. ค่าจัดงานหน่วย (Unit Management Fee)
    - ภาพที่ 4: ผู้บริหารหน่วย
    เกณฑ์ COM/เดือน ทั้งทีม:
      >= 35,000 บาท -> จ่าย 40%
      >= 20,000 บาท -> จ่าย 35%
      >= 10,000 บาท -> จ่าย 30%
      >=  5,000 บาท -> จ่าย 25%
      <   5,000 บาท -> 0%
    """
    applied_rate = 0.0
    tier_desc = "COM ต่ำกว่าเกณฑ์ขั้นต่ำ 5,000 บาท (0%)"

    if team_com >= 35000:
        applied_rate = 0.40
        tier_desc = "COM ทั้งทีม ≥ 35,000 บาท (อัตรา 40%)"
    elif team_com >= 20000:
        applied_rate = 0.35
        tier_desc = "COM ทั้งทีม 20,000 - 34,999 บาท (อัตรา 35%)"
    elif team_com >= 10000:
        applied_rate = 0.30
        tier_desc = "COM ทั้งทีม 10,000 - 19,999 บาท (อัตรา 30%)"
    elif team_com >= 5000:
        applied_rate = 0.25
        tier_desc = "COM ทั้งทีม 5,000 - 9,999 บาท (อัตรา 25%)"

    amount = round(team_com * applied_rate, 2)
    return IncomeItem(
        item_id="unit_management",
        name_th="ค่าจัดงานหน่วย",
        name_en="Unit Management Fee",
        category="unit",
        amount=amount,
        rate_or_formula=f"{int(applied_rate * 100)}%",
        basis_value=team_com,
        description=tier_desc,
        is_qualified=team_com >= 5000
    )

def calculate_unit_separation(separated_units_count: int) -> IncomeItem:
    """
    3. ค่าแยกหน่วย (Unit Separation)
    - ภาพที่ 4: ผู้บริหารหน่วย
    จ่ายหน่วยละ 2,000 บาท/เดือน
      1 หน่วย = 2,000 บาท
      2 หน่วย = 4,000 บาท
      3 หน่วย = 6,000 บาท
      4 หน่วย = 8,000 บาท
      5 หน่วย = 10,000 บาท (หน่วยละ 2,000 บาท โดยไม่จำกัดจำนวน)
    """
    count = max(0, int(separated_units_count))
    amount = float(count * 2000)
    return IncomeItem(
        item_id="unit_separation",
        name_th="ค่าแยกหน่วย",
        name_en="Unit Separation Fee",
        category="unit",
        amount=amount,
        rate_or_formula="฿2,000 / หน่วย",
        basis_value=float(count),
        description=f"{count} หน่วย × ฿2,000 = ฿{amount:,.2f} บาท",
        is_qualified=count > 0
    )

def calculate_center_type1(team_com: float) -> IncomeItem:
    """
    4. ค่าจัดงานศูนย์ ประเภทที่ 1 (Center Management Type 1)
    - ภาพที่ 2: ผู้บริหารศูนย์
    เกณฑ์ COM/เดือน:
      >= 120,000 บาท -> จ่าย 30%
      >=  60,000 บาท -> จ่าย 25%
      >=  30,000 บาท -> จ่าย 20%
      >=  15,000 บาท -> จ่าย 15%
      <   15,000 บาท -> 0%
    """
    applied_rate = 0.0
    tier_desc = "COM ต่ำกว่าเกณฑ์ 15,000 บาท (0%)"

    if team_com >= 120000:
        applied_rate = 0.30
        tier_desc = "COM ศูนย์ ≥ 120,000 บาท (อัตรา 30%)"
    elif team_com >= 60000:
        applied_rate = 0.25
        tier_desc = "COM ศูนย์ 60,000 - 119,999 บาท (อัตรา 25%)"
    elif team_com >= 30000:
        applied_rate = 0.20
        tier_desc = "COM ศูนย์ 30,000 - 59,999 บาท (อัตรา 20%)"
    elif team_com >= 15000:
        applied_rate = 0.15
        tier_desc = "COM ศูนย์ 15,000 - 29,999 บาท (อัตรา 15%)"

    amount = round(team_com * applied_rate, 2)
    return IncomeItem(
        item_id="center_type1",
        name_th="ค่าจัดงานศูนย์ ประเภท 1",
        name_en="Center Management Type 1",
        category="center",
        amount=amount,
        rate_or_formula=f"{int(applied_rate * 100)}%",
        basis_value=team_com,
        description=tier_desc,
        is_qualified=team_com >= 15000
    )

def calculate_center_type2(renewal_premium: float) -> IncomeItem:
    """
    5. ค่าจัดงานศูนย์ ประเภทที่ 2 (Center Management Type 2)
    - ภาพที่ 2: ผู้บริหารศูนย์
    จ่าย 0.8% ของเบี้ยปีต่อไป (Renewal Premium)
    """
    premium = max(0.0, float(renewal_premium))
    amount = round(premium * 0.008, 2)
    return IncomeItem(
        item_id="center_type2",
        name_th="ค่าจัดงานศูนย์ ประเภท 2 (เบี้ยปีต่อ)",
        name_en="Center Management Type 2 (Renewal Premium)",
        category="center",
        amount=amount,
        rate_or_formula="0.8% ของเบี้ยปีต่อไป",
        basis_value=premium,
        description=f"เบี้ยปีต่อไป ฿{premium:,.2f} × 0.8% = ฿{amount:,.2f} บาท",
        is_qualified=premium > 0
    )

def calculate_center_type3(team_com: float) -> IncomeItem:
    """
    6. ค่าจัดงานศูนย์ ประเภทที่ 3 (Center Management Type 3)
    - ภาพที่ 2: ผู้บริหารศูนย์
    เกณฑ์ COM/เดือน:
      >= 120,000 บาท -> จ่าย 15,000 บาท
      >=  60,000 บาท -> จ่าย 11,000 บาท
      >=  30,000 บาท -> จ่าย  8,000 บาท
      >=  15,000 บาท -> จ่าย  5,000 บาท
      <   15,000 บาท -> 0 บาท
    """
    amount = 0.0
    tier_desc = "COM ต่ำกว่าเกณฑ์ 15,000 บาท (0 บาท)"

    if team_com >= 120000:
        amount = 15000.0
        tier_desc = "COM ศูนย์ ≥ 120,000 บาท รับคงที่ 15,000 บาท"
    elif team_com >= 60000:
        amount = 11000.0
        tier_desc = "COM ศูนย์ 60,000 - 119,999 บาท รับคงที่ 11,000 บาท"
    elif team_com >= 30000:
        amount = 8000.0
        tier_desc = "COM ศูนย์ 30,000 - 59,999 บาท รับคงที่ 8,000 บาท"
    elif team_com >= 15000:
        amount = 5000.0
        tier_desc = "COM ศูนย์ 15,000 - 29,999 บาท รับคงที่ 5,000 บาท"

    return IncomeItem(
        item_id="center_type3",
        name_th="ค่าจัดงานศูนย์ ประเภท 3 (ตารางคงที่)",
        name_en="Center Management Type 3 (Fixed Tier Table)",
        category="center",
        amount=amount,
        rate_or_formula="Lookup Table (฿5k - ฿15k)",
        basis_value=team_com,
        description=tier_desc,
        is_qualified=amount > 0
    )

def calculate_center_separation(
    separated_centers_count: int,
    original_center_com: float = 20000.0,
    new_centers_com_list: Optional[List[float]] = None
) -> IncomeItem:
    """
    7. ค่าแยกศูนย์ (Center Separation)
    - ภาพที่ 2: ผู้บริหารศูนย์
    เงื่อนไข:
      1. จ่ายให้ศูนย์เดิม 4,000 บาท ในเดือนแรกทันที
      2. จ่ายให้ศูนย์เดิมอีกเป็นระยะเวลา 24 เดือน โดย:
         2.1 ศูนย์เดิมเก็บขั้นต่ำ COM 15,000 บาท
         2.2 ศูนย์ใหม่เก็บ (COM/เดือน):
             >= 120,000 บาท -> จ่าย 3,000 บาท
             >=  60,000 บาท -> จ่าย 2,500 บาท
             >=  30,000 บาท -> จ่าย 2,000 บาท
             >=  15,000 บาท -> จ่าย 1,500 บาท
    """
    count = max(0, int(separated_centers_count))
    if count == 0:
        return IncomeItem(
            item_id="center_separation",
            name_th="ค่าแยกศูนย์",
            name_en="Center Separation Fee",
            category="center",
            amount=0.0,
            rate_or_formula="฿4,000 + Ongoing 24 Months Tier",
            basis_value=0.0,
            description="ไม่มีศูนย์ที่แยกตัวออกไป",
            is_qualified=False
        )

    # 1. Base allowance per separated center: 4,000 THB
    base_amount = count * 4000.0

    # 2. Ongoing monthly tier (if original center has >= 15,000 COM)
    ongoing_monthly = 0.0
    if original_center_com >= 15000:
        coms = new_centers_com_list if (new_centers_com_list and len(new_centers_com_list) >= count) else [30000.0] * count
        for com in coms[:count]:
            if com >= 120000:
                ongoing_monthly += 3000.0
            elif com >= 60000:
                ongoing_monthly += 2500.0
            elif com >= 30000:
                ongoing_monthly += 2000.0
            elif com >= 15000:
                ongoing_monthly += 1500.0

    total_amount = base_amount + ongoing_monthly
    return IncomeItem(
        item_id="center_separation",
        name_th="ค่าแยกศูนย์",
        name_en="Center Separation Fee",
        category="center",
        amount=total_amount,
        rate_or_formula="฿4,000/ศูนย์ + Ongoing (฿1,500 - ฿3,000)",
        basis_value=float(count),
        description=f"{count} ศูนย์: ค่าแรกแยก ฿{base_amount:,.2f} + รายเดือนต่อเนื่อง ฿{ongoing_monthly:,.2f} = ฿{total_amount:,.2f} บาท",
        is_qualified=True
    )

def calculate_center_bonus(annual_com: float) -> IncomeItem:
    """
    8. โบนัสศูนย์รายปี (Annual Center Bonus)
    - ภาพที่ 2: ผู้บริหารศูนย์
    เกณฑ์ COM/ปี:
      >= 600,000 บาท -> จ่าย 6%
      >= 300,000 บาท -> จ่าย 5%
      >= 150,000 บาท -> จ่าย 4%
      <  150,000 บาท -> 0%
    """
    applied_rate = 0.0
    tier_desc = "COM ทั้งปีต่ำกว่าเกณฑ์ 150,000 บาท (0%)"

    if annual_com >= 600000:
        applied_rate = 0.06
        tier_desc = "COM รวมศูนย์ทั้งปี ≥ 600,000 บาท (โบนัส 6%)"
    elif annual_com >= 300000:
        applied_rate = 0.05
        tier_desc = "COM รวมศูนย์ทั้งปี 300,000 - 599,999 บาท (โบนัส 5%)"
    elif annual_com >= 150000:
        applied_rate = 0.04
        tier_desc = "COM รวมศูนย์ทั้งปี 150,000 - 299,999 บาท (โบนัส 4%)"

    annual_amount = round(annual_com * applied_rate, 2)
    # Monthly converted for monthly income run-rate
    monthly_amount = round(annual_amount / 12.0, 2)

    return IncomeItem(
        item_id="center_bonus",
        name_th="โบนัสศูนย์รายปี (เฉลี่ยรายเดือน)",
        name_en="Annual Center Bonus (Monthly Run-Rate)",
        category="bonus",
        amount=monthly_amount,
        rate_or_formula=f"{applied_rate * 100:.0f}% ของ COM รายปี",
        basis_value=annual_com,
        description=f"{tier_desc} -> ได้รับทั้งปี ฿{annual_amount:,.2f} (เฉลี่ย ฿{monthly_amount:,.2f}/เดือน)",
        is_qualified=annual_com >= 150000
    )

def calculate_region_type1(team_fyc: float, is_senior_region: bool = False) -> IncomeItem:
    """
    9. ค่าจัดงานภาค (ประเภทที่ 1) (Region Management Type 1)
    - ภาพที่ 3: ผู้บริหารภาค
    เกณฑ์ FYC (ทั้งทีม)/เดือน:
      >= 300,000 บาท -> จ่าย 18% (เฉพาะผู้บริหารภาคอาวุโส) หรือ 16% สำหรับภาคทั่วไป
      >= 240,000 บาท -> จ่าย 16%
      >= 180,000 บาท -> จ่าย 14%
      >= 120,000 บาท -> จ่าย 12%
      >=  60,000 บาท -> จ่าย 10%
      <   60,000 บาท -> 0%
    """
    applied_rate = 0.0
    tier_desc = "FYC ทั้งทีมต่ำกว่า 60,000 บาท (0%)"

    if team_fyc >= 300000:
        applied_rate = 0.18 if is_senior_region else 0.16
        tier_desc = f"FYC ทั้งทีม ≥ 300,000 บาท ({'ภาคอาวุโส อัตรา 18%' if is_senior_region else 'อัตรา 16%'})"
    elif team_fyc >= 240000:
        applied_rate = 0.16
        tier_desc = "FYC ทั้งทีม 240,000 - 299,999 บาท (อัตรา 16%)"
    elif team_fyc >= 180000:
        applied_rate = 0.14
        tier_desc = "FYC ทั้งทีม 180,000 - 239,999 บาท (อัตรา 14%)"
    elif team_fyc >= 120000:
        applied_rate = 0.12
        tier_desc = "FYC ทั้งทีม 120,000 - 179,999 บาท (อัตรา 12%)"
    elif team_fyc >= 60000:
        applied_rate = 0.10
        tier_desc = "FYC ทั้งทีม 60,000 - 119,999 บาท (อัตรา 10%)"

    amount = round(team_fyc * applied_rate, 2)
    return IncomeItem(
        item_id="region_type1",
        name_th="ค่าจัดงานภาค ประเภทที่ 1 (FYC ทั้งทีม)",
        name_en="Region Management Type 1 (Team FYC)",
        category="region",
        amount=amount,
        rate_or_formula=f"{int(applied_rate * 100)}%",
        basis_value=team_fyc,
        description=tier_desc,
        is_qualified=team_fyc >= 60000
    )

def calculate_region_type2(center_fyc_list: Optional[List[float]] = None) -> IncomeItem:
    """
    10. ค่าจัดงานภาค (ประเภทที่ 2) (Region Management Type 2)
    - ภาพที่ 3: ผู้บริหารภาค
    เกณฑ์ FYC (ผู้บริหารศูนย์)/เดือน แต่ละศูนย์:
      >= 120,000 บาท -> จ่าย 2,500 บาท
      >=  60,000 บาท -> จ่าย 2,000 บาท
      >=  30,000 บาท -> จ่าย 1,500 บาท
      >=  15,000 บาท -> จ่าย 1,000 บาท
      <   15,000 บาท -> 0 บาท
    """
    centers = center_fyc_list if center_fyc_list else [60000.0, 60000.0, 30000.0, 30000.0]
    total_amount = 0.0
    details = []

    for idx, fyc in enumerate(centers, 1):
        per_center = 0.0
        if fyc >= 120000:
            per_center = 2500.0
        elif fyc >= 60000:
            per_center = 2000.0
        elif fyc >= 30000:
            per_center = 1500.0
        elif fyc >= 15000:
            per_center = 1000.0

        total_amount += per_center
        details.append(f"ศูนย์ {idx} (FYC ฿{fyc:,.0f} -> ฿{per_center:,.0f})")

    return IncomeItem(
        item_id="region_type2",
        name_th="ค่าจัดงานภาค ประเภทที่ 2 (รายศูนย์)",
        name_en="Region Management Type 2 (Per Center FYC)",
        category="region",
        amount=total_amount,
        rate_or_formula="Lookup Per Center (฿1,000 - ฿2,500)",
        basis_value=float(len(centers)),
        description=f"{len(centers)} ศูนย์: " + ", ".join(details),
        is_qualified=total_amount > 0
    )

def calculate_region_separation(
    separated_regions_count: int,
    region_type1_monthly_amount: float = 0.0,
    option_type: int = 2
) -> IncomeItem:
    """
    11. ค่าแยกภาค (Region Separation)
    - ภาพที่ 3: ผู้บริหารภาค
    มี 3 แบบ:
      ประเภทที่ 1: 8,000 บาท (จ่ายครั้งเดียว)
      ประเภทที่ 2: 4,000 บาท (จ่าย 12 เดือน)
      ประเภทที่ 3: 40% ของค่าจัดงานประเภทที่ 1 (ตลอดชีวิต)
    """
    count = max(0, int(separated_regions_count))
    if count == 0:
        return IncomeItem(
            item_id="region_separation",
            name_th="ค่าแยกภาค",
            name_en="Region Separation Fee",
            category="region",
            amount=0.0,
            rate_or_formula="Option 1, 2, or 3",
            basis_value=0.0,
            description="ไม่มีภาคที่แยกตัวออกไป",
            is_qualified=False
        )

    if option_type == 1:
        # 8,000 บาท ครั้งเดียว
        amount = float(count * 8000)
        desc = f"{count} ภาค × ฿8,000 (จ่ายครั้งเดียว) = ฿{amount:,.2f} บาท"
        formula = "฿8,000 จ่ายครั้งเดียว"
    elif option_type == 2:
        # 4,000 บาท ต่อเดือน (เป็นเวลา 12 เดือน)
        amount = float(count * 4000)
        desc = f"{count} ภาค × ฿4,000/เดือน (เป็นเวลา 12 เดือน) = ฿{amount:,.2f} บาท/เดือน"
        formula = "฿4,000 / เดือน (12 เดือน)"
    else:
        # 40% ของค่าจัดงานประเภทที่ 1 (ตลอดชีวิต)
        amount = round(count * (region_type1_monthly_amount * 0.40), 2)
        desc = f"{count} ภาค × (40% ของค่าจัดงานภาค T1 ฿{region_type1_monthly_amount:,.2f}) = ฿{amount:,.2f} บาท (ตลอดชีวิต)"
        formula = "40% ของค่าจัดงานภาค T1"

    return IncomeItem(
        item_id="region_separation",
        name_th="ค่าแยกภาค",
        name_en="Region Separation Fee",
        category="region",
        amount=amount,
        rate_or_formula=formula,
        basis_value=float(count),
        description=desc,
        is_qualified=True
    )

def calculate_target_management(annual_fyc: float) -> IncomeItem:
    """
    12. ค่าบริหารเป้าหมาย (Target Management Fee)
    - ภาพที่ 3: ผู้บริหารภาค
    เกณฑ์ FYC (ทั้งปี):
      >= 5,000,000 บาท -> จ่าย 360,000 บาท (30,000 x 12)
      >= 4,000,000 บาท -> จ่าย 300,000 บาท (25,000 x 12)
      >= 3,000,000 บาท -> จ่าย 240,000 บาท (20,000 x 12)
      >= 2,000,000 บาท -> จ่าย 180,000 บาท (15,000 x 12)
      >= 1,500,000 บาท -> จ่าย 120,000 บาท (10,000 x 12)
      <  1,500,000 บาท -> 0 บาท
    """
    monthly_amount = 0.0
    annual_amount = 0.0
    tier_desc = "FYC สะสมทั้งปีต่ำกว่าเป้าหมาย 1,500,000 บาท (0 บาท)"

    if annual_fyc >= 5000000:
        monthly_amount = 30000.0
        annual_amount = 360000.0
        tier_desc = "เป้าหมาย FYC 5,000,000 บาท (รับ ฿30,000/เดือน หรือ ฿360,000/ปี)"
    elif annual_fyc >= 4000000:
        monthly_amount = 25000.0
        annual_amount = 300000.0
        tier_desc = "เป้าหมาย FYC 4,000,000 บาท (รับ ฿25,000/เดือน หรือ ฿300,000/ปี)"
    elif annual_fyc >= 3000000:
        monthly_amount = 20000.0
        annual_amount = 240000.0
        tier_desc = "เป้าหมาย FYC 3,000,000 บาท (รับ ฿20,000/เดือน หรือ ฿240,000/ปี)"
    elif annual_fyc >= 2000000:
        monthly_amount = 15000.0
        annual_amount = 180000.0
        tier_desc = "เป้าหมาย FYC 2,000,000 บาท (รับ ฿15,000/เดือน หรือ ฿180,000/ปี)"
    elif annual_fyc >= 1500000:
        monthly_amount = 10000.0
        annual_amount = 120000.0
        tier_desc = "เป้าหมาย FYC 1,500,000 บาท (รับ ฿10,000/เดือน หรือ ฿120,000/ปี)"

    return IncomeItem(
        item_id="target_management",
        name_th="ค่าบริหารเป้าหมาย (เฉลี่ยรายเดือน)",
        name_en="Target Management Fee (Monthly)",
        category="region",
        amount=monthly_amount,
        rate_or_formula=f"฿{monthly_amount:,.0f}/เดือน (฿{annual_amount:,.0f}/ปี)",
        basis_value=annual_fyc,
        description=tier_desc,
        is_qualified=monthly_amount > 0
    )

def calculate_region_bonus(annual_fyc: float) -> IncomeItem:
    """
    13. โบนัสภาครายปี (Annual Region Bonus)
    - ภาพที่ 3: ผู้บริหารภาค
    เกณฑ์ FYC (ทั้งปี):
      >= 2,000,000 บาท -> จ่าย 2.5%
      >= 1,000,000 บาท -> จ่าย 2.0%
      >=   500,000 บาท -> จ่าย 1.5%
      <    500,000 บาท -> 0%
    """
    applied_rate = 0.0
    tier_desc = "FYC รวมภาคทั้งปีต่ำกว่า 500,000 บาท (0%)"

    if annual_fyc >= 2000000:
        applied_rate = 0.025
        tier_desc = "FYC รวมภาคทั้งปี ≥ 2,000,000 บาท (โบนัส 2.5%)"
    elif annual_fyc >= 1000000:
        applied_rate = 0.020
        tier_desc = "FYC รวมภาคทั้งปี 1,000,000 - 1,999,999 บาท (โบนัส 2.0%)"
    elif annual_fyc >= 500000:
        applied_rate = 0.015
        tier_desc = "FYC รวมภาคทั้งปี 500,000 - 999,999 บาท (โบนัส 1.5%)"

    annual_amount = round(annual_fyc * applied_rate, 2)
    monthly_amount = round(annual_amount / 12.0, 2)

    return IncomeItem(
        item_id="region_bonus",
        name_th="โบนัสภาครายปี (เฉลี่ยรายเดือน)",
        name_en="Annual Region Bonus (Monthly Run-Rate)",
        category="bonus",
        amount=monthly_amount,
        rate_or_formula=f"{applied_rate * 100:.1f}% ของ FYC รายปี",
        basis_value=annual_fyc,
        description=f"{tier_desc} -> ได้รับทั้งปี ฿{annual_amount:,.2f} (เฉลี่ย ฿{monthly_amount:,.2f}/เดือน)",
        is_qualified=annual_fyc >= 500000
    )

# ==============================================================================
# CAREER QUALIFICATION CHECKER (ตามภาพที่ 1: โครงสร้างรายได้ และคุณสมบัติ)
# ==============================================================================

def check_career_promotion_qualification(
    current_position: str,
    accumulated_fyc: float,
    separated_units: int,
    separated_centers: int,
    months_in_period: int = 6
) -> Dict[str, Any]:
    """
    ตรวจสอบคุณสมบัติการเลื่อนตำแหน่งตามภาพที่ 1:
    - ตัวแทน -> ผู้บริหารหน่วย: บำเหน็จ 20,000 บาท (เวลา 1-6 เดือน)
    - ผู้บริหารหน่วย -> ผู้บริหารศูนย์: บำเหน็จ 75,000 บาท (เวลา 3-6 เดือน) + แยกหน่วย 2 หน่วย
    - ผู้บริหารศูนย์ -> ผู้บริหารภาค: บำเหน็จ 1,200,000 บาท (เวลา 12-24 เดือน) + แยกศูนย์ 4 ศูนย์
    """
    if current_position == "agent":
        target = "ผู้บริหารหน่วย (Unit Manager)"
        req_fyc = 20000.0
        req_units = 0
        req_centers = 0
        req_period = "1-6 เดือน"
    elif current_position in ["unit_manager", "senior_unit_manager"]:
        target = "ผู้บริหารศูนย์ (Center Manager)"
        req_fyc = 75000.0
        req_units = 2
        req_centers = 0
        req_period = "3-6 เดือน"
    elif current_position in ["center_manager", "senior_center_manager"]:
        target = "ผู้บริหารภาค (Regional Manager)"
        req_fyc = 1200000.0
        req_units = 0
        req_centers = 4
        req_period = "12-24 เดือน"
    else:
        return {
            "current_position": current_position,
            "target_position": "ตำแหน่งสูงสุดของโครงสร้างหลัก (Executive Regional Director)",
            "is_eligible": True,
            "fyc_progress_pct": 100.0,
            "units_progress_pct": 100.0,
            "centers_progress_pct": 100.0,
            "overall_progress_pct": 100.0,
            "gap_fyc": 0.0,
            "gap_units": 0,
            "gap_centers": 0,
            "summary_text": "ดำรงตำแหน่งระดับผู้บริหารภาคแล้ว"
        }

    fyc_pct = min(100.0, (accumulated_fyc / req_fyc) * 100.0) if req_fyc > 0 else 100.0
    units_pct = min(100.0, (separated_units / req_units) * 100.0) if req_units > 0 else 100.0
    centers_pct = min(100.0, (separated_centers / req_centers) * 100.0) if req_centers > 0 else 100.0

    gap_fyc = max(0.0, req_fyc - accumulated_fyc)
    gap_units = max(0, req_units - separated_units)
    gap_centers = max(0, req_centers - separated_centers)

    is_eligible = (gap_fyc == 0.0 and gap_units == 0 and gap_centers == 0)

    # Weighted overall
    if req_units > 0 and req_centers > 0:
        overall_pct = (fyc_pct * 0.4) + (units_pct * 0.3) + (centers_pct * 0.3)
    elif req_units > 0:
        overall_pct = (fyc_pct * 0.6) + (units_pct * 0.4)
    elif req_centers > 0:
        overall_pct = (fyc_pct * 0.6) + (centers_pct * 0.4)
    else:
        overall_pct = fyc_pct

    summary_parts = []
    if is_eligible:
        summary_text = f"คุณสมบัติครบถ้วนพร้อมรับการแต่งตั้งเป็น '{target}'"
    else:
        if gap_fyc > 0:
            summary_parts.append(f"ต้องการผลงานบำเหน็จอีก ฿{gap_fyc:,.0f} บาท")
        if gap_units > 0:
            summary_parts.append(f"ต้องการแยกหน่วยเพิ่ม {gap_units} หน่วย")
        if gap_centers > 0:
            summary_parts.append(f"ต้องการแยกศูนย์เพิ่ม {gap_centers} ศูนย์")
        summary_parts.append(f"กรอบเวลาเกณฑ์มาตรฐาน: {req_period}")
        summary_text = " • ".join(summary_parts)

    return {
        "current_position": current_position,
        "target_position": target,
        "required_fyc": req_fyc,
        "current_fyc": accumulated_fyc,
        "fyc_progress_pct": round(fyc_pct, 1),
        "required_units": req_units,
        "current_units": separated_units,
        "units_progress_pct": round(units_pct, 1),
        "required_centers": req_centers,
        "current_centers": separated_centers,
        "centers_progress_pct": round(centers_pct, 1),
        "overall_progress_pct": round(overall_pct, 1),
        "gap_fyc": gap_fyc,
        "gap_units": gap_units,
        "gap_centers": gap_centers,
        "required_period": req_period,
        "is_eligible": is_eligible,
        "summary_text": summary_text
    }

# ==============================================================================
# MAIN COMPREHENSIVE CALCULATOR ENGINE
# ==============================================================================

def calculate_thai_life_income(
    position_id: str = "region_manager",
    personal_fyc: float = 30000.0,
    personal_com: float = 30000.0,
    team_fyc: float = 250000.0,
    team_com: float = 75000.0,
    renewal_premium: float = 300000.0,
    separated_units: int = 5,
    separated_centers: int = 3,
    separated_regions: int = 1,
    annual_fyc: Optional[float] = None,
    annual_com: Optional[float] = None,
    center_fyc_list: Optional[List[float]] = None,
    center_com_list: Optional[List[float]] = None,
    is_senior_region: bool = False,
    region_separation_option: int = 2
) -> CompensationResult:
    """
    คำนวณรายได้และผลประโยชน์รวมแบบครบวงจรตามตำแหน่งและผลงาน
    """
    calc_annual_fyc = annual_fyc if annual_fyc is not None else (team_fyc * 12.0)
    calc_annual_com = annual_com if annual_com is not None else (team_com * 12.0)

    breakdown: List[IncomeItem] = []

    # 1. Personal Commission (ทุกตำแหน่ง)
    breakdown.append(calculate_personal_commission(personal_com))

    pos_lower = position_id.lower()
    position_names = {
        "agent": "ตัวแทน (Agent)",
        "unit_manager": "ผู้บริหารหน่วย (Unit Manager - UM)",
        "center_manager": "ผู้บริหารศูนย์ (Center Manager - CM)",
        "region_manager": "ผู้บริหารภาค (Regional Manager - RM)"
    }
    pos_display = position_names.get(pos_lower, "ผู้บริหาร (Leader)")

    # 2. ผู้บริหารหน่วย (UM) หรือสูงกว่า
    if pos_lower in ["unit_manager", "center_manager", "region_manager", "senior_unit_manager", "senior_center_manager", "executive_region"]:
        breakdown.append(calculate_unit_management(team_com))
        breakdown.append(calculate_unit_separation(separated_units))

    # 3. ผู้บริหารศูนย์ (CM) หรือสูงกว่า
    if pos_lower in ["center_manager", "region_manager", "senior_center_manager", "executive_region"]:
        breakdown.append(calculate_center_type1(team_com))
        breakdown.append(calculate_center_type2(renewal_premium))
        breakdown.append(calculate_center_type3(team_com))
        breakdown.append(calculate_center_separation(separated_centers, original_center_com=team_com, new_centers_com_list=center_com_list))
        breakdown.append(calculate_center_bonus(calc_annual_com))

    # 4. ผู้บริหารภาค (RM) หรือสูงกว่า
    if pos_lower in ["region_manager", "executive_region", "national_leader"]:
        r1 = calculate_region_type1(team_fyc, is_senior_region=is_senior_region)
        breakdown.append(r1)
        breakdown.append(calculate_region_type2(center_fyc_list))
        breakdown.append(calculate_region_separation(separated_regions, region_type1_monthly_amount=r1.amount, option_type=region_separation_option))
        breakdown.append(calculate_target_management(calc_annual_fyc))
        breakdown.append(calculate_region_bonus(calc_annual_fyc))

    total_monthly = round(sum(item.amount for item in breakdown), 2)
    annualized_run_rate = round(total_monthly * 12.0, 2)

    summary_by_cat = {
        "personal": round(sum(i.amount for i in breakdown if i.category == "personal"), 2),
        "unit": round(sum(i.amount for i in breakdown if i.category == "unit"), 2),
        "center": round(sum(i.amount for i in breakdown if i.category == "center"), 2),
        "region": round(sum(i.amount for i in breakdown if i.category == "region"), 2),
        "bonus": round(sum(i.amount for i in breakdown if i.category == "bonus"), 2),
    }

    promotion_info = check_career_promotion_qualification(
        current_position=pos_lower,
        accumulated_fyc=calc_annual_fyc if pos_lower == "center_manager" else team_fyc,
        separated_units=separated_units,
        separated_centers=separated_centers
    )

    return CompensationResult(
        position_id=pos_lower,
        position_name_th=pos_display,
        total_monthly_income=total_monthly,
        annualized_run_rate=annualized_run_rate,
        breakdown=breakdown,
        summary_by_category=summary_by_cat,
        promotion_status=promotion_info
    )

# ==============================================================================
# CLI TEST SUITE & INTERACTIVE RUNNER
# ==============================================================================

def run_tests() -> bool:
    print("=" * 70)
    print("🚀 เริ่มการทดสอบระบบคำนวณไทยประกันชีวิต (Update 15 Jan 64)")
    print("=" * 70)

    tests = [
        # Test 1: Unit Management 40% tier (COM >= 35k)
        ("Unit Management 40% Tier (COM 40,000)", calculate_unit_management(40000).amount, 16000.0),
        # Test 2: Unit Management 25% tier (COM 5,000)
        ("Unit Management 25% Tier (COM 5,000)", calculate_unit_management(5000).amount, 1250.0),
        # Test 3: Unit Separation 5 units (5 x 2,000 = 10,000)
        ("Unit Separation 5 units", calculate_unit_separation(5).amount, 10000.0),
        # Test 4: Center Type 1 (COM 120,000 -> 30% = 36,000)
        ("Center Type 1 (COM 120,000 -> 30%)", calculate_center_type1(120000).amount, 36000.0),
        # Test 5: Center Type 2 Renewal (300,000 x 0.8% = 2,400)
        ("Center Type 2 (Renewal 300,000 x 0.8%)", calculate_center_type2(300000).amount, 2400.0),
        # Test 6: Center Type 3 Lookup (COM 60,000 -> 11,000)
        ("Center Type 3 (COM 60,000 -> 11,000)", calculate_center_type3(60000).amount, 11000.0),
        # Test 7: Region Type 1 (FYC 250,000 -> 16% = 40,000)
        ("Region Type 1 (FYC 250,000 -> 16%)", calculate_region_type1(250000).amount, 40000.0),
        # Test 8: Target Management (FYC 3,000,000/yr -> 20,000/mo)
        ("Target Management (FYC 3M -> 20,000/mo)", calculate_target_management(3000000).amount, 20000.0),
        # Test 9: Annual Region Bonus (FYC 2,000,000 -> 2.5% = 50,000/yr -> 4,166.67/mo)
        ("Annual Region Bonus (FYC 2M -> 2.5%)", calculate_region_bonus(2000000).amount, 4166.67),
    ]

    all_passed = True
    for name, actual, expected in tests:
        passed = abs(actual - expected) < 0.05
        status = "✅ PASSED" if passed else "❌ FAILED"
        if not passed:
            all_passed = False
        print(f"{status} | {name:<45} | คาดหวัง: ฿{expected:>10,.2f} | ได้รับ: ฿{actual:>10,.2f}")

    print("=" * 70)
    if all_passed:
        print("🎉 ผลการทดสอบทั้งหมด 9/9 รายการ ถูกต้องตรงตามเกณฑ์ 100%")
    else:
        print("⚠️ มีบางรายการไม่ผ่านการตรวจสอบ")
    print("=" * 70)
    return all_passed

def main():
    if len(sys.argv) > 1 and sys.argv[1] in ["--test", "-t", "test"]:
        success = run_tests()
        sys.exit(0 if success else 1)

    if len(sys.argv) > 1 and sys.argv[1] in ["--json", "-j"]:
        try:
            input_data = json.loads(sys.stdin.read())
            res = calculate_thai_life_income(**input_data)
            out = {
                "position_id": res.position_id,
                "position_name_th": res.position_name_th,
                "total_monthly_income": res.total_monthly_income,
                "annualized_run_rate": res.annualized_run_rate,
                "summary_by_category": res.summary_by_category,
                "promotion_status": res.promotion_status,
                "breakdown": [asdict(b) for b in res.breakdown]
            }
            print(json.dumps(out, ensure_ascii=False, indent=2))
            return
        except Exception as e:
            print(json.dumps({"error": str(e)}, ensure_ascii=False))
            sys.exit(1)

    # Default demo calculation for Regional Manager
    print("=" * 75)
    print("📊 ตัวอย่างการคำนวณรายได้ตำแหน่ง: ผู้บริหารภาค (Regional Manager - RM)")
    print("   สมมุติฐาน: FYC ทีม ฿250,000 | COM ทีม ฿75,000 | หน่วยแยก 5 | ศูนย์แยก 3")
    print("=" * 75)

    result = calculate_thai_life_income(
        position_id="region_manager",
        personal_fyc=30000,
        personal_com=30000,
        team_fyc=250000,
        team_com=75000,
        renewal_premium=300000,
        separated_units=5,
        separated_centers=3,
        separated_regions=1,
        annual_fyc=3000000,
        annual_com=900000
    )

    print(f"\n💰 รายได้รวมต่อเดือน: ฿{result.total_monthly_income:,.2f} บาท/เดือน")
    print(f"📈 ประมาณการรายได้ทั้งปี: ฿{result.annualized_run_rate:,.2f} บาท/ปี\n")
    print("-" * 75)
    print(f"{'รายการผลประโยชน์':<35} | {'หมวดหมู่':<10} | {'จำนวนเงิน':>14} | {'สูตร / อัตรา'}")
    print("-" * 75)

    for item in result.breakdown:
        print(f"{item.name_th:<35} | {item.category:<10} | ฿{item.amount:>12,.2f} | {item.rate_or_formula}")

    print("-" * 75)
    print("หมวดหมู่สรุป:")
    for cat, amt in result.summary_by_category.items():
        print(f"  • {cat.capitalize():<10}: ฿{amt:>10,.2f}")
    print("=" * 75)

if __name__ == "__main__":
    main()
