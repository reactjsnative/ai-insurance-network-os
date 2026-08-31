import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { Member, MemberIncomeResult, CompensationRuleSet } from '../types';

export function exportIncomeReportToExcel(
  member: Member,
  result: MemberIncomeResult,
  allMembers: Member[],
  rules: CompensationRuleSet
) {
  const wb = XLSX.utils.book_new();

  // 1. Summary Sheet
  const summaryData = [
    ['AI Insurance Network Income Simulator - รายงานจำลองรายได้'],
    ['วันที่สร้างเอกสาร', new Date().toLocaleString('th-TH')],
    ['เวอร์ชันกติกา', rules.version],
    ['สถานะกติกา', rules.status === 'OFFICIAL_DOCUMENT_2564' ? 'ข้อมูลจากเอกสาร 15 มกราคม 2564' : 'กำหนดเอง (อนุมัติแล้ว)'],
    [''],
    ['ข้อมูลสมาชิก'],
    ['รหัสสมาชิก', member.code],
    ['ชื่อ-นามสกุล', member.name],
    ['ตำแหน่ง', member.position],
    ['วันที่เริ่มงาน', member.startDate],
    ['อายุงาน (เดือน)', member.tenureMonths],
    ['สถานะ', member.isActive ? 'Active' : 'Inactive'],
    [''],
    ['สรุปรายได้ประมาณการ (คำนวณเบื้องต้น)'],
    ['รายได้จากผลงานส่วนตัว (บาท/เดือน)', result.personalIncomeTotal],
    ['รายได้จากการบริหารหน่วย (บาท/เดือน)', result.unitManagementIncomeTotal],
    ['รายได้จากการบริหารศูนย์ (บาท/เดือน)', result.centerManagementIncomeTotal],
    ['รายได้จากการบริหารภาค (บาท/เดือน)', result.groupManagementIncomeTotal],
    ['โบนัสรายเดือน (บาท/เดือน)', result.monthlyBonusTotal],
    ['รายได้รวมต่อเดือน (บาท/เดือน)', result.totalMonthlyIncome],
    ['โบนัสประจำปี (บาท/ปี)', result.annualBonusTotal],
    ['รายได้รวมประมาณการทั้งปี (บาท/ปี)', result.totalAnnualIncome],
    [''],
    ['สถิติผลงานทีม'],
    ['จำนวนสมาชิกในสายงาน (คน)', result.teamMemberCount],
    ['สมาชิก Active (คน)', result.teamActiveMemberCount],
    ['ยอดขายรวมทั้งทีม (บาท/เดือน)', result.teamTotalMonthlySales],
    ['COM รวมทั้งทีม (บาท/เดือน)', result.teamTotalMonthlyCom],
    ['FYC รวมทั้งทีม (บาท/เดือน)', result.teamTotalMonthlyFyc],
    ['จำนวนหน่วยแยก (หน่วย)', result.separatedUnitsCount],
    ['จำนวนศูนย์แยก (ศูนย์)', result.separatedCentersCount],
    [''],
    ['ข้อความเตือนความรับผิดชอบ'],
    ['* ตัวเลขในเอกสารนี้เป็นข้อมูลสำหรับการจำลองเบื้องต้น ห้ามนำเสนอว่าเป็นรายได้ที่รับประกัน'],
    ['* ก่อนใช้งานจริง ต้องตรวจสอบเงื่อนไขและประกาศล่าสุดกับบริษัท'],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'สรุปรายได้');

  // 2. Breakdown Sheet
  const breakdownRows = result.breakdown.map((item, idx) => ({
    'ลำดับ': idx + 1,
    'หมวดหมู่': item.categoryNameTh,
    'รหัสกฎ/ขั้น': item.tierOrRuleId,
    'ฐานที่ใช้คำนวณ (บาท)': item.baseAmount,
    'อัตรา/ยอด': item.isPercentage ? `${item.rateOrAmount}%` : item.rateOrAmount,
    'ยอดคำนวณได้ (บาท)': item.calculatedAmount,
    'สูตรและรายละเอียด': item.formulaDescription,
    'ที่มาของผลงาน': item.sourceMemberName || '-',
    'สถานะ': item.status === 'CONFIRMED' ? 'ผ่านเกณฑ์' : 'รอตรวจสอบเงื่อนไข',
    'หมายเหตุ': item.notes || '',
  }));
  const wsBreakdown = XLSX.utils.json_to_sheet(breakdownRows);
  XLSX.utils.book_append_sheet(wb, wsBreakdown, 'รายละเอียดสูตรคำนวณ');

  // 3. Team Members Sheet
  const teamRows = allMembers.map((m, idx) => ({
    'ลำดับ': idx + 1,
    'รหัสสมาชิก': m.code,
    'ชื่อ-นามสกุล': m.name,
    'ตำแหน่ง': m.position,
    'ผู้แนะนำ/หัวหน้า': m.parentId || 'รากสายงาน',
    'ยอดขายส่วนตัว (บาท)': m.personalMonthlySales,
    'COM ส่วนตัว (บาท)': m.personalMonthlyCom,
    'FYC ส่วนตัว (บาท)': m.personalMonthlyFyc,
    'เบี้ยปีต่อไป (บาท)': m.personalRenewalPremium,
    'อายุงาน (เดือน)': m.tenureMonths,
    'สถานะ': m.isActive ? 'Active' : 'Inactive',
  }));
  const wsTeam = XLSX.utils.json_to_sheet(teamRows);
  XLSX.utils.book_append_sheet(wb, wsTeam, 'รายชื่อสมาชิกในทีม');

  // Save workbook
  XLSX.writeFile(wb, `Income_Simulation_${member.code}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportIncomeReportToPDF(
  member: Member,
  result: MemberIncomeResult,
  rules: CompensationRuleSet
) {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(16);
  doc.text('AI Insurance Network Income Simulator', 14, 18);
  doc.setFontSize(10);
  doc.text('Report Date: ' + new Date().toLocaleString('th-TH'), 14, 25);
  doc.text('Rule Version: ' + rules.version + ' (' + (rules.status === 'OFFICIAL_DOCUMENT_2564' ? 'Jan 15, 2021 Official' : 'Custom Approved') + ')', 14, 30);

  // Line divider
  doc.setLineWidth(0.5);
  doc.line(14, 34, 196, 34);

  // Member info
  doc.setFontSize(12);
  doc.text('Member Information', 14, 42);
  doc.setFontSize(10);
  doc.text(`Code: ${member.code} | Name: ${member.name} (${member.nickname || '-'})`, 14, 49);
  doc.text(`Position: ${member.position} | Tenure: ${member.tenureMonths} Months | Status: ${member.isActive ? 'Active' : 'Inactive'}`, 14, 55);

  // Income summary box
  doc.setFillColor(240, 245, 255);
  doc.rect(14, 62, 182, 45, 'F');
  
  doc.setFontSize(11);
  doc.text('Estimated Monthly Income Breakdown', 18, 70);
  doc.setFontSize(9);
  doc.text(`1. Personal Commission & Vehicle: THB ${result.personalIncomeTotal.toLocaleString()}`, 18, 77);
  doc.text(`2. Unit Management Income: THB ${result.unitManagementIncomeTotal.toLocaleString()}`, 18, 83);
  doc.text(`3. Center Management Income: THB ${result.centerManagementIncomeTotal.toLocaleString()}`, 18, 89);
  doc.text(`4. Group Management Income: THB ${result.groupManagementIncomeTotal.toLocaleString()}`, 18, 95);
  
  doc.setFontSize(11);
  doc.text(`Total Monthly Income: THB ${result.totalMonthlyIncome.toLocaleString()} / mo`, 110, 77);
  doc.text(`Estimated Annual Income: THB ${result.totalAnnualIncome.toLocaleString()} / yr`, 110, 85);
  doc.text(`Team Size: ${result.teamMemberCount} members (${result.teamActiveMemberCount} Active)`, 110, 93);

  // Line items list
  doc.setFontSize(12);
  doc.text('Detailed Formula & Line Items', 14, 118);

  let y = 126;
  doc.setFontSize(8);
  result.breakdown.forEach((item, index) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.text(`${index + 1}. [${item.category}] ${item.formulaDescription}`, 14, y);
    doc.text(`THB ${item.calculatedAmount.toLocaleString()}`, 170, y, { align: 'right' });
    y += 7;
  });

  // Disclaimer footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(130, 130, 130);
    doc.text(
      'Disclaimer: This simulation is for estimation purposes only based on the Jan 15, 2021 rules. Not a guaranteed income.',
      14,
      288
    );
    doc.text(`Page ${i} of ${pageCount}`, 185, 288);
  }

  doc.save(`Income_Summary_${member.code}.pdf`);
}
