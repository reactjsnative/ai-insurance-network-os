import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Share2, 
  Calendar, 
  Building2, 
  Users, 
  DollarSign, 
  CheckCircle2,
  Table
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ReportsCenter: React.FC = () => {
  const { activeUser, members, calculateMemberIncome, getDownlineStats, activePlan } = useApp();
  const [reportPeriod, setReportPeriod] = useState<'monthly' | 'annual'>('monthly');

  const stats = getDownlineStats(activeUser.id);
  const income = calculateMemberIncome(activeUser, 'ACTUAL');

  const handleExportCSV = () => {
    const headers = ['รหัสตัวแทน', 'ชื่อ-นามสกุล', 'ตำแหน่ง', 'จังหวัด', 'FYC ส่วนตัว (บาท)', 'COM ส่วนตัว (บาท)', 'ประมาณการรายได้ (บาท)'];
    const rows = members.map(m => {
      const mIncome = calculateMemberIncome(m, 'ACTUAL');
      return [
        m.memberCode,
        m.name,
        m.positionId,
        m.location.province,
        m.personalFYC,
        m.personalCOM,
        mIncome.totalIncome,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Insurance_OS_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="reports_center_view" className="space-y-6 max-w-7xl mx-auto pb-16 text-left">
      {/* 1. Header & Actions */}
      <div className="p-6 rounded-3xl bg-sky-50/90 border border-sky-100 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              ศูนย์รายงานและเอกสารสรุปผลงาน (Reports & Statement Center)
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/30">
              Executive Export
            </span>
          </div>
          <p className="text-xs text-slate-700 mt-1">
            พิมพ์ใบสรุปผลประโยชน์ (Statement), ดาวน์โหลด CSV/Excel, และรายงานผลงานรายเดือน/รายปี
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-sky-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm flex items-center gap-2 border border-sky-100 transition-colors"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>ส่งออก CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20"
          >
            <Printer className="w-4 h-4" />
            <span>พิมพ์รายงาน (Print / PDF)</span>
          </button>
        </div>
      </div>

      {/* 2. Executive Statement Preview Card */}
      <div className="p-8 rounded-3xl bg-sky-50 border border-sky-100 space-y-6 shadow-2xl print:border-none print:shadow-none print:p-0">
        <div className="flex justify-between items-start border-b border-sky-100 pb-6">
          <div>
            <div className="text-lg font-black text-slate-900">
              AI INSURANCE NETWORK OS • COMPENSATION STATEMENT
            </div>
            <div className="text-xs text-blue-600 font-mono mt-0.5">
              รอบผลงาน: ประจำเดือนปัจจุบัน | เวอร์ชันแผน: {activePlan.code}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-slate-800">{activeUser.name}</div>
            <div className="text-[11px] text-slate-700">{activeUser.memberCode} • {activeUser.positionId}</div>
            <div className="text-[10px] text-slate-700">{activeUser.location.province}</div>
          </div>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100">
            <span className="text-[10px] text-slate-700 block uppercase">FYC องค์กรรวม</span>
            <div className="text-xl font-black text-sky-400 font-mono mt-1">
              ฿{(activeUser.personalFYC + stats.teamFYC).toLocaleString()}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100">
            <span className="text-[10px] text-slate-700 block uppercase">สมาชิกทั้งหมด</span>
            <div className="text-xl font-black text-slate-800 font-mono mt-1">
              {members.length} คน
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100">
            <span className="text-[10px] text-slate-700 block uppercase">หน่วยแยก / ศูนย์แยก</span>
            <div className="text-xl font-black text-slate-800 font-mono mt-1">
              {stats.totalUnits} / {stats.totalCenters}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-sky-50 border border-blue-600/40">
            <span className="text-[10px] text-blue-600 block uppercase font-bold">รายได้สุทธิเดือนนี้</span>
            <div className="text-xl font-black text-blue-600 font-mono mt-1">
              ฿{income.totalIncome.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Income Items Breakdown Table */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 mb-3">รายละเอียดผลประโยชน์ (13 Income Categories)</h3>
          <div className="rounded-2xl border border-sky-100 overflow-hidden">
            <table className="w-full text-xs text-left text-slate-700">
              <thead className="bg-sky-50 text-slate-700 font-bold uppercase text-[10px] border-b border-sky-100">
                <tr>
                  <th className="p-3">ลำดับ</th>
                  <th className="p-3">หมวดหมู่ผลประโยชน์</th>
                  <th className="p-3">อัตรา / สูตรคำนวณ</th>
                  <th className="p-3 text-right">ยอดเงิน (บาท)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {income.breakdown.map((b, idx) => (
                  <tr key={b.id} className="hover:bg-sky-50/30">
                    <td className="p-3 text-slate-700">{idx + 1}</td>
                    <td className="p-3 font-semibold text-slate-800">{b.title}</td>
                    <td className="p-3 text-slate-700 font-mono">{b.rateOrFormula}</td>
                    <td className="p-3 text-right font-bold text-blue-600 font-mono">฿{b.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-sky-50/90 font-bold text-slate-900 border-t border-sky-100">
                <tr>
                  <td colSpan={3} className="p-3 text-right text-blue-600 uppercase">รวมรายได้สุทธิ (Total Income)</td>
                  <td className="p-3 text-right text-base text-blue-600 font-mono">฿{income.totalIncome.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
