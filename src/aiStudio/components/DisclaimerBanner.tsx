import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, ChevronDown, ChevronUp, FileText, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const DisclaimerBanner: React.FC = () => {
  const { rules } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-gradient-to-r from-amber-950/90 via-amber-900/60 to-slate-50 border-b border-amber-600/40 text-amber-100 text-xs px-4 py-2.5 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 flex-1">
          <div className="p-1 rounded bg-amber-500/20 text-amber-400 shrink-0">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex-1">
            <span className="font-semibold text-amber-300 mr-2">
              ⚠️ ข้อความเตือนสำคัญ:
            </span>
            <span className="text-amber-200/90 font-medium">
              ข้อมูลทั้งหมดในระบบนี้เป็น <strong>“ข้อมูลสำหรับการจำลองเบื้องต้น”</strong> เพื่อการวางแผนและศึกษาโครงสร้างทีมเท่านั้น{' '}
              <span className="text-amber-300 font-bold underline decoration-amber-400 underline-offset-2">
                ห้ามนำเสนอว่าเป็นรายได้ที่รับประกัน
              </span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-950 text-blue-200 border border-blue-700/60">
            <FileText className="w-3 h-3 text-blue-400" />
            {rules.status === 'OFFICIAL_DOCUMENT_2564' ? 'อ้างอิงเอกสาร 15 ม.ค. 2564' : `เวอร์ชัน: ${rules.version}`}
          </span>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-amber-300 hover:bg-amber-800/40 transition-colors cursor-pointer text-[11px]"
          >
            {isExpanded ? 'ย่อคำเตือน' : 'อ่านข้อกำหนด'}
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="max-w-7xl mx-auto mt-2.5 pt-2.5 border-t border-amber-700/40 grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] text-amber-200/80">
          <div className="flex gap-2">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-200">ตรวจสอบเงื่อนไขจริง</p>
              <p>ก่อนนำไปใช้งานจริง ผู้ใช้ต้องตรวจสอบเงื่อนไข ประกาศอัตราผลตอบแทน และระเบียบล่าสุดกับฝ่ายพัฒนาตัวแทนของบริษัท</p>
            </div>
          </div>
          <div className="flex gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-200">ไม่มีผลผูกพันทางกฎหมาย</p>
              <p>การคำนวณขึ้นอยู่กับสมมติฐาน ความต่อเนื่องของการชำระเบี้ย อัตราความยั่งยืน และคุณสมบัติตัวแทนตามเกณฑ์ที่กำหนด</p>
            </div>
          </div>
          <div className="flex gap-2">
            <FileText className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-200">สิทธิการแก้ไขและลิขสิทธิ์</p>
              <p>ผู้ดูแลระบบสามารถปรับปรุงสูตรตามคู่มือฉบับใหม่ได้ตลอดเวลา ห้ามใช้เครื่องหมายการค้าโดยไม่ได้รับอนุญาต</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
