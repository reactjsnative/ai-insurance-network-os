import React, { useState } from 'react';
import { 
  TrendingUp, 
  Award, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  Target, 
  Sparkles, 
  AlertTriangle,
  ArrowRight,
  Shield,
  Layers
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CareerPath: React.FC = () => {
  const { activeUser, members, positions } = useApp();
  const [selectedTargetRank, setSelectedTargetRank] = useState<string>(
    activeUser.positionId === 'agent' ? 'unit_manager' :
    activeUser.positionId === 'unit_manager' ? 'center_manager' : 'region_manager'
  );

  // Criteria according to Compensation Plan 15 Jan 64
  const qualificationCriteria: Record<string, {
    title: string;
    description: string;
    fycRequired: number;
    comRequired: number;
    unitsRequired: number;
    centersRequired: number;
    timeframeMonths: string;
    maintenanceAnnualFyc: number;
  }> = {
    unit_manager: {
      title: 'ผู้บริหารหน่วย (Unit Manager - UM)',
      description: 'เลื่อนตำแหน่งจากตัวแทนด้วยผลงานบำเหน็จ หรือ FYC ต่อเนื่อง',
      fycRequired: 60000,
      comRequired: 20000,
      unitsRequired: 0,
      centersRequired: 0,
      timeframeMonths: '1-6 เดือน',
      maintenanceAnnualFyc: 480000,
    },
    center_manager: {
      title: 'ผู้บริหารศูนย์ (Center Manager - CM)',
      description: 'สร้างบำเหน็จสะสมและสร้างผู้นำแยกหน่วยงาน 2 หน่วย',
      fycRequired: 250000,
      comRequired: 75000,
      unitsRequired: 2,
      centersRequired: 0,
      timeframeMonths: '3-6 เดือน',
      maintenanceAnnualFyc: 1200000,
    },
    region_manager: {
      title: 'ผู้บริหารภาค (Regional Manager - RM)',
      description: 'ยอดบำเหน็จองค์กรรวม และสร้างศูนย์งานในสายงานอย่างน้อย 4 ศูนย์',
      fycRequired: 3600000,
      comRequired: 1200000,
      unitsRequired: 8,
      centersRequired: 4,
      timeframeMonths: '12-24 เดือน',
      maintenanceAnnualFyc: 3600000,
    },
  };

  const targetCriteria = qualificationCriteria[selectedTargetRank] || qualificationCriteria.unit_manager;

  // Actual progress numbers
  const actualCOM = activeUser.personalCOM * 4; // simulated rolling window
  const actualFYC = activeUser.personalFYC * 4;
  const actualUnits = activeUser.separatedUnitsCount || 0;
  const actualCenters = activeUser.separatedCentersCount || 0;

  const comProgress = Math.min(100, Math.round((actualCOM / targetCriteria.comRequired) * 100));
  const unitsProgress = targetCriteria.unitsRequired > 0 
    ? Math.min(100, Math.round((actualUnits / targetCriteria.unitsRequired) * 100))
    : 100;
  const centersProgress = targetCriteria.centersRequired > 0
    ? Math.min(100, Math.round((actualCenters / targetCriteria.centersRequired) * 100))
    : 100;

  const overallScore = Math.round((comProgress + unitsProgress + centersProgress) / 3);

  return (
    <div id="career_path_view" className="space-y-6 max-w-7xl mx-auto pb-16 text-left">
      {/* 1. Header Card */}
      <div className="p-6 rounded-3xl bg-white/90 border border-slate-200 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              เส้นทางอาชีพและเกณฑ์เลื่อนตำแหน่ง (Career Path & Qualification)
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
              Update 15 Jan 64
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            ระบบติดตามคุณสมบัติอัตโนมัติ (Automated Milestone Tracker) วิเคราะห์ Gap และคำนวณ Run-Rate
          </p>
        </div>

        {/* Target Rank Switcher */}
        <div className="inline-flex p-1 rounded-xl bg-white border border-slate-200 self-start md:self-auto">
          <button
            onClick={() => setSelectedTargetRank('unit_manager')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedTargetRank === 'unit_manager' ? 'bg-emerald-500 text-slate-950' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            ผู้บริหารหน่วย (UM)
          </button>
          <button
            onClick={() => setSelectedTargetRank('center_manager')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedTargetRank === 'center_manager' ? 'bg-amber-500 text-slate-950' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            ผู้บริหารศูนย์ (CM)
          </button>
          <button
            onClick={() => setSelectedTargetRank('region_manager')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedTargetRank === 'region_manager' ? 'bg-rose-500 text-slate-950' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            ผู้บริหารภาค (RM)
          </button>
        </div>
      </div>

      {/* 2. Target Milestone & Overall Progress Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Overall Readiness Gauge */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-slate-200 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              เป้าหมาย: {targetCriteria.title}
            </span>
            <div className="text-4xl font-black text-slate-900 mt-2 font-mono">
              {overallScore}% <span className="text-xs font-normal text-slate-600">ความพร้อม</span>
            </div>
            <p className="text-xs text-slate-700 mt-2 leading-relaxed">
              {targetCriteria.description}
            </p>
          </div>

          <div className="space-y-3 mt-6 pt-4 border-t border-slate-200">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">กรอบเวลาสะสม:</span>
              <span className="font-bold text-slate-800">{targetCriteria.timeframeMonths}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">เกณฑ์ดำรงตำแหน่งรายปี:</span>
              <span className="font-bold text-amber-400 font-mono">฿{targetCriteria.maintenanceAnnualFyc.toLocaleString()} FYC</span>
            </div>
          </div>
        </div>

        {/* Right: Gap Analysis & Progress Bars (2 Cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white/90 border border-slate-200 space-y-5">
          <h2 className="text-sm sm:text-base font-bold text-slate-900">
            การวิเคราะห์ช่องว่างคุณสมบัติ (Gap Analysis)
          </h2>

          {/* Metric 1: COM Requirement */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700">1. บำเหน็จสะสม (COM Requirement)</span>
              <span className="font-mono text-slate-600">
                <span className="text-amber-400 font-bold">฿{actualCOM.toLocaleString()}</span> / ฿{targetCriteria.comRequired.toLocaleString()} ({comProgress}%)
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-white overflow-hidden border border-slate-200">
              <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500 rounded-full" style={{ width: `${comProgress}%` }} />
            </div>
            <div className="text-[10px] text-slate-600">
              {comProgress >= 100 ? '✅ ผ่านเกณฑ์บำเหน็จเรียบร้อย' : `ขาดอีก ฿${Math.max(0, targetCriteria.comRequired - actualCOM).toLocaleString()} บาท`}
            </div>
          </div>

          {/* Metric 2: Unit Separation */}
          {targetCriteria.unitsRequired > 0 && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-700">2. การแตกหน่วยงาน (Separated Units)</span>
                <span className="font-mono text-slate-600">
                  <span className="text-emerald-400 font-bold">{actualUnits}</span> / {targetCriteria.unitsRequired} หน่วย ({unitsProgress}%)
                </span>
              </div>
              <div className="h-3 w-full rounded-full bg-white overflow-hidden border border-slate-200">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500 rounded-full" style={{ width: `${unitsProgress}%` }} />
              </div>
              <div className="text-[10px] text-slate-600">
                {unitsProgress >= 100 ? '✅ ผ่านเกณฑ์จำนวนหน่วยงานแยก' : `ต้องการสร้างและแยกหน่วยเพิ่มอีก ${Math.max(0, targetCriteria.unitsRequired - actualUnits)} หน่วย`}
              </div>
            </div>
          )}

          {/* Metric 3: Center Separation */}
          {targetCriteria.centersRequired > 0 && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-700">3. การแตกศูนย์งาน (Separated Centers)</span>
                <span className="font-mono text-slate-600">
                  <span className="text-rose-400 font-bold">{actualCenters}</span> / {targetCriteria.centersRequired} ศูนย์ ({centersProgress}%)
                </span>
              </div>
              <div className="h-3 w-full rounded-full bg-white overflow-hidden border border-slate-200">
                <div className="h-full bg-gradient-to-r from-rose-500 to-rose-400 transition-all duration-500 rounded-full" style={{ width: `${centersProgress}%` }} />
              </div>
              <div className="text-[10px] text-slate-600">
                {centersProgress >= 100 ? '✅ ผ่านเกณฑ์การสร้างศูนย์งาน' : `ต้องการสร้างศูนย์งานเพิ่มอีก ${Math.max(0, targetCriteria.centersRequired - actualCenters)} ศูนย์`}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Next Best Action (Coaching Plan) */}
      <div className="p-6 rounded-3xl bg-white/90 border border-slate-200 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm sm:text-base font-bold text-slate-900">
            คำแนะนำเชิงกลยุทธ์เพื่อพิชิตการเลื่อนตำแหน่ง (Next Best Actions)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
            <div className="text-xs font-bold text-amber-400">1. เร่งผลิตผลงานส่วนตัว & โค้ชชิ่ง</div>
            <p className="text-xs text-slate-700 leading-relaxed">
              รักษาอัตรา FYC รายสัปดาห์ไม่ต่ำกว่า 15,000 บาท เพื่อสะสมบำเหน็จแตะเป้าหมายภายใน 2 เดือนข้างหน้า
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
            <div className="text-xs font-bold text-emerald-400">2. คัดเลือกตัวแทนศักยภาพสูงเพื่อแยกหน่วย</div>
            <p className="text-xs text-slate-700 leading-relaxed">
              ระบุตัวแทนในทีม 2 ท่านที่มีผลงานสม่ำเสมอ เพื่อวางแผนติวเข้มและส่งสอบขึ้นทะเบียนผู้บริหารหน่วย
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
            <div className="text-xs font-bold text-sky-400">3. รักษาอัตราการคงอยู่ (Retention 80%+)</div>
            <p className="text-xs text-slate-700 leading-relaxed">
              ติดตามงานเก็บเบี้ยปีต่อ (Renewal) สม่ำเสมอ เพื่อป้องกันการตัดสิทธิ์หรือหลุดเกณฑ์การดำรงตำแหน่ง
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
