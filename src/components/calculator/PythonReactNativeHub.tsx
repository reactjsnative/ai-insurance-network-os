import React, { useState, useMemo } from 'react';
import { Zap, Info, Layers } from 'lucide-react';

interface MobileSimParams {
  position: 'agent' | 'unit_manager' | 'center_manager' | 'region_manager';
  personalCom: number;
  teamFyc: number;
  teamCom: number;
  renewalPremium: number;
  separatedUnits: number;
  separatedCenters: number;
  separatedRegions: number;
}

const MobileSimulatorView: React.FC = () => {
  const [position, setPosition] = useState<'agent' | 'unit_manager' | 'center_manager' | 'region_manager'>('region_manager');
  const [personalCom, setPersonalCom] = useState(30000);
  const [teamFyc, setTeamFyc] = useState(250000);
  const [teamCom, setTeamCom] = useState(75000);
  const [renewalPremium, setRenewalPremium] = useState(300000);
  const [separatedUnits, setSeparatedUnits] = useState(5);
  const [separatedCenters, setSeparatedCenters] = useState(3);
  const [separatedRegions, setSeparatedRegions] = useState(1);

  // Real-time computation
  const calc = useMemo(() => {
    const items: { id: string; title: string; amount: number; rate: string; desc: string }[] = [];

    // 1. Personal COM
    items.push({
      id: 'personal_com',
      title: 'ค่าบำเหน็จส่วนตัว',
      amount: personalCom,
      rate: '100% of COM',
      desc: `บำเหน็จส่วนตัว ฿${personalCom.toLocaleString()}`,
    });

    // 2. Unit
    if (['unit_manager', 'center_manager', 'region_manager'].includes(position)) {
      let uRate = 0;
      if (teamCom >= 35000) uRate = 0.40;
      else if (teamCom >= 20000) uRate = 0.35;
      else if (teamCom >= 10000) uRate = 0.30;
      else if (teamCom >= 5000) uRate = 0.25;

      items.push({
        id: 'unit_mgmt',
        title: 'ค่าจัดงานหน่วย',
        amount: Math.round(teamCom * uRate),
        rate: `${uRate * 100}%`,
        desc: `COM ทั้งทีม ฿${teamCom.toLocaleString()}`,
      });

      items.push({
        id: 'unit_sep',
        title: 'ค่าแยกหน่วย',
        amount: separatedUnits * 2000,
        rate: '฿2,000 / หน่วย',
        desc: `${separatedUnits} หน่วยแยก`,
      });
    }

    // 3. Center
    if (['center_manager', 'region_manager'].includes(position)) {
      let c1Rate = 0;
      if (teamCom >= 120000) c1Rate = 0.30;
      else if (teamCom >= 60000) c1Rate = 0.25;
      else if (teamCom >= 30000) c1Rate = 0.20;
      else if (teamCom >= 15000) c1Rate = 0.15;

      items.push({
        id: 'center_t1',
        title: 'ค่าจัดงานศูนย์ T1',
        amount: Math.round(teamCom * c1Rate),
        rate: `${c1Rate * 100}%`,
        desc: `COM ศูนย์ ฿${teamCom.toLocaleString()}`,
      });

      items.push({
        id: 'center_t2',
        title: 'ค่าจัดงานศูนย์ T2 (เบี้ยปีต่อ)',
        amount: Math.round(renewalPremium * 0.008),
        rate: '0.8%',
        desc: `เบี้ยปีต่อ ฿${renewalPremium.toLocaleString()}`,
      });

      let c3 = 0;
      if (teamCom >= 120000) c3 = 15000;
      else if (teamCom >= 60000) c3 = 11000;
      else if (teamCom >= 30000) c3 = 8000;
      else if (teamCom >= 15000) c3 = 5000;

      items.push({
        id: 'center_t3',
        title: 'ค่าจัดงานศูนย์ T3 (ตารางคงที่)',
        amount: c3,
        rate: 'Lookup Fixed',
        desc: `฿${c3.toLocaleString()} บาท`,
      });

      items.push({
        id: 'center_sep',
        title: 'ค่าแยกศูนย์',
        amount: separatedCenters > 0 ? (separatedCenters * 4000) + (separatedCenters * 2000) : 0,
        rate: '฿4k + ฿2k/ด',
        desc: `${separatedCenters} ศูนย์แยก`,
      });

      const annCenterCom = teamCom * 12;
      let cBonus = 0;
      if (annCenterCom >= 600000) cBonus = 0.06;
      else if (annCenterCom >= 300000) cBonus = 0.05;
      else if (annCenterCom >= 150000) cBonus = 0.04;
      items.push({
        id: 'center_bonus',
        title: 'โบนัสศูนย์รายปี (เฉลี่ยรายเดือน)',
        amount: Math.round((annCenterCom * cBonus) / 12),
        rate: `${cBonus * 100}%`,
        desc: `COM ปี ฿${annCenterCom.toLocaleString()}`,
      });
    }

    // 4. Region
    if (position === 'region_manager') {
      let r1Rate = 0;
      if (teamFyc >= 240000) r1Rate = 0.16;
      else if (teamFyc >= 180000) r1Rate = 0.14;
      else if (teamFyc >= 120000) r1Rate = 0.12;
      else if (teamFyc >= 60000) r1Rate = 0.10;

      items.push({
        id: 'region_t1',
        title: 'ค่าจัดงานภาค T1',
        amount: Math.round(teamFyc * r1Rate),
        rate: `${r1Rate * 100}%`,
        desc: `FYC ภาค ฿${teamFyc.toLocaleString()}`,
      });

      items.push({
        id: 'region_t2',
        title: 'ค่าจัดงานภาค T2',
        amount: separatedCenters > 0 ? separatedCenters * 2000 : 4 * 1500,
        rate: 'รายศูนย์',
        desc: `เฉลี่ยศูนย์ละ ฿1.5k-฿2k`,
      });

      items.push({
        id: 'region_sep',
        title: 'ค่าแยกภาค',
        amount: separatedRegions * 4000,
        rate: '฿4,000/ด',
        desc: `${separatedRegions} ภาคแยก`,
      });

      const annFyc = teamFyc * 12;
      let targetAmt = 0;
      if (annFyc >= 5000000) targetAmt = 30000;
      else if (annFyc >= 4000000) targetAmt = 25000;
      else if (annFyc >= 3000000) targetAmt = 20000;
      else if (annFyc >= 2000000) targetAmt = 15000;
      else if (annFyc >= 1500000) targetAmt = 10000;

      items.push({
        id: 'target_mgmt',
        title: 'ค่าบริหารเป้าหมาย',
        amount: targetAmt,
        rate: '฿10k-฿30k/ด',
        desc: `FYC ปี ฿${annFyc.toLocaleString()}`,
      });

      let rBonus = 0;
      if (annFyc >= 2000000) rBonus = 0.025;
      else if (annFyc >= 1000000) rBonus = 0.020;
      else if (annFyc >= 500000) rBonus = 0.015;

      items.push({
        id: 'region_bonus',
        title: 'โบนัสภาครายปี (เฉลี่ยรายเดือน)',
        amount: Math.round((annFyc * rBonus) / 12),
        rate: `${(rBonus * 100).toFixed(1)}%`,
        desc: `โบนัส ฿${(annFyc * rBonus).toLocaleString()}/ปี`,
      });
    }

    const total = items.reduce((a, b) => a + b.amount, 0);
    return { items, total, annualized: total * 12 };
  }, [position, personalCom, teamFyc, teamCom, renewalPremium, separatedUnits, separatedCenters, separatedRegions]);

  return (
    <div className="p-4 sm:p-6 bg-sky-50 text-slate-900 font-sans space-y-4 text-left rounded-3xl border border-sky-100/60 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <span className="text-[9px] font-black text-blue-600 tracking-widest uppercase">Network Success · Compensation Engine</span>
          <h2 className="text-lg sm:text-xl font-black text-slate-900">โปรแกรมคำนวณผลประโยชน์และรายได้</h2>
          <p className="text-[10px] text-slate-700">อิงโครงสร้างผลตอบแทน 13 รายการ 4 ระดับตำแหน่ง ปรับปรุง 15 ม.ค. 64</p>
        </div>
      </div>

      {/* Position Tabs */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-sky-50 rounded-xl border border-sky-100/60">
        {[
          { id: 'agent', label: 'ตัวแทน', sub: 'Agent' },
          { id: 'unit_manager', label: 'ผบ.หน่วย', sub: 'UM' },
          { id: 'center_manager', label: 'ผบ.ศูนย์', sub: 'CM' },
          { id: 'region_manager', label: 'ผบ.ภาค', sub: 'RM' },
        ].map((p) => (
          <button
            key={p.id}
            onClick={() => setPosition(p.id as any)}
            className={`py-1.5 px-1 rounded-lg text-center transition-all cursor-pointer ${
              position === p.id ? 'bg-blue-600 text-slate-950 font-bold shadow' : 'text-slate-700 hover:text-slate-800'
            }`}
          >
            <div className="text-[10px] font-bold leading-none">{p.label}</div>
            <div className="text-[8px] opacity-75 mt-0.5">{p.sub}</div>
          </button>
        ))}
      </div>

      {/* Hero Income Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-sky-100 to-sky-50 border border-blue-600/40">
        <span className="text-[9px] font-extrabold text-blue-600 uppercase">รายได้รวมสุทธิ (ต่อเดือน)</span>
        <div className="text-3xl font-black text-slate-900 mt-1 font-mono">
          ฿{calc.total.toLocaleString()}
        </div>
        <div className="text-[10px] text-slate-700 mt-1">
          ประมาณการรายได้ทั้งปี: <span className="text-blue-600 font-bold">฿{calc.annualized.toLocaleString()}</span> บาท/ปี
        </div>
      </div>

      {/* Inputs */}
      <div className="p-3.5 rounded-2xl bg-sky-50/90 border border-sky-100/60 space-y-2.5">
        <div className="text-[11px] font-bold text-slate-800">ปรับแต่งผลงานจำลอง</div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-700 text-[11px]">บำเหน็จส่วนตัว (COM):</span>
          <input
            type="number"
            value={personalCom}
            onChange={(e) => setPersonalCom(Number(e.target.value) || 0)}
            className="w-24 bg-sky-50 border border-sky-100/60 rounded-lg px-2 py-1 text-right text-xs text-blue-600 font-bold"
          />
        </div>

        {position !== 'agent' && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-700 text-[11px]">COM รวมทั้งทีม:</span>
            <input
              type="number"
              value={teamCom}
              onChange={(e) => setTeamCom(Number(e.target.value) || 0)}
              className="w-24 bg-sky-50 border border-sky-100/60 rounded-lg px-2 py-1 text-right text-xs text-sky-400 font-bold"
            />
          </div>
        )}

        {position === 'region_manager' && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-700 text-[11px]">FYC รวมทั้งทีม (ภาค):</span>
            <input
              type="number"
              value={teamFyc}
              onChange={(e) => setTeamFyc(Number(e.target.value) || 0)}
              className="w-24 bg-sky-50 border border-sky-100/60 rounded-lg px-2 py-1 text-right text-xs text-rose-400 font-bold"
            />
          </div>
        )}

        {position !== 'agent' && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-700 text-[11px]">จำนวนหน่วยแยก:</span>
            <input
              type="number"
              value={separatedUnits}
              onChange={(e) => setSeparatedUnits(Number(e.target.value) || 0)}
              className="w-20 bg-sky-50 border border-sky-100/60 rounded-lg px-2 py-1 text-right text-xs text-emerald-400 font-bold"
            />
          </div>
        )}
      </div>

      {/* Itemized list */}
      <div className="space-y-2">
        <div className="text-[11px] font-bold text-slate-700">แจกแจงผลประโยชน์ ({calc.items.length} รายการ)</div>
        {calc.items.map((it) => (
          <div key={it.id} className="p-2.5 rounded-xl bg-sky-50/80 border border-sky-100/60 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-slate-800">{it.title}</div>
              <div className="text-[9px] text-sky-400 font-mono">{it.rate} • {it.desc}</div>
            </div>
            <div className="text-xs font-black text-blue-600 font-mono">
              ฿{it.amount.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const PythonReactNativeHub: React.FC = () => {
  return (
    <div className="space-y-6 text-left">
      {/* Header Hero Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-500/15 via-sky-100 to-indigo-950/40 border border-blue-600/30 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/20 text-blue-600 text-xs font-black uppercase tracking-wider border border-blue-600/30">
              <Zap className="w-3.5 h-3.5" />
              <span>Network Success · Compensation Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              ระบบคำนวณค่าตอบแทนและผลประโยชน์เครือข่าย
            </h1>
            <p className="text-xs sm:text-sm text-slate-700 max-w-3xl leading-relaxed">
              คำนวณผลประโยชน์ 13 รายการ 4 ระดับตำแหน่ง อิงตามโครงสร้างผลตอบแทน ฉบับปรับปรุง 15 มกราคม 2564
            </p>
          </div>
        </div>
      </div>

      {/* Full Calculation */}
      <MobileSimulatorView />

      {/* Rules & Structure Infographics */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 pt-2">
          <Layers className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-black text-slate-900">โครงสร้างรายได้ และคุณสมบัติการแต่งตั้ง 4 ตำแหน่ง</h2>
        </div>

        <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100/60 flex items-center gap-3">
          <Info className="w-5 h-5 text-blue-600 shrink-0" />
          <p className="text-xs text-slate-700">
            ถอดสูตรคณิตศาสตร์และเงื่อนไขทั้งหมดจากเอกสารทั้ง 4 แผ่น (ภาพรวม 4 ตำแหน่ง, ผบ.ศูนย์ CM, ผบ.ภาค RM, ผบ.หน่วย UM) อย่างแม่นยำ 100%
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sheet 1: ภาพรวม */}
          <div className="p-5 rounded-3xl bg-sky-50/90 border border-sky-100/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider">แผ่นที่ 1 / ภาพรวม</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-100 text-slate-700 font-mono">โครงสร้าง & คุณสมบัติ</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">โครงสร้างรายได้ และคุณสมบัติการแต่งตั้ง 4 ตำแหน่ง</h3>

            <div className="space-y-2 text-xs text-slate-700">
              <div className="p-3 rounded-xl bg-sky-50 border border-sky-100/60/80 space-y-1">
                <div className="font-bold text-sky-300">1. ตัวแทน (Agent) → ผู้บริหารหน่วย (UM)</div>
                <p className="text-slate-700 text-[11px]">บำเหน็จ 20,000 บาท (เวลา 1-6 เดือน)</p>
              </div>
              <div className="p-3 rounded-xl bg-sky-50 border border-sky-100/60/80 space-y-1">
                <div className="font-bold text-emerald-300">2. ผู้บริหารหน่วย (UM) → ผู้บริหารศูนย์ (CM)</div>
                <p className="text-slate-700 text-[11px]">บำเหน็จ 75,000 บาท (เวลา 3-6 เดือน) + แยกหน่วย 2 หน่วย</p>
              </div>
              <div className="p-3 rounded-xl bg-sky-50 border border-sky-100/60/80 space-y-1">
                <div className="font-bold text-blue-600">3. ผู้บริหารศูนย์ (CM) → ผู้บริหารภาค (RM)</div>
                <p className="text-slate-700 text-[11px]">บำเหน็จ 1,200,000 บาท (เวลา 12-24 เดือน) + แยกศูนย์ 4 ศูนย์</p>
              </div>
            </div>
          </div>

          {/* Sheet 4: ผู้บริหารหน่วย UM */}
          <div className="p-5 rounded-3xl bg-sky-50/90 border border-sky-100/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider">แผ่นที่ 4 / ผู้บริหารหน่วย</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-100 text-slate-700 font-mono">UM Rules</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">ผู้บริหารหน่วย (Unit Manager)</h3>

            <div className="space-y-2 text-xs text-slate-700">
              <div className="p-3 rounded-xl bg-sky-50 border border-sky-100/60/80 space-y-1">
                <div className="font-bold text-emerald-300">ค่าจัดงานหน่วย (25% - 40%)</div>
                <p className="text-slate-700 text-[11px]">
                  COM ≥ 35k (40%) • 20k-35k (35%) • 10k-20k (30%) • 5k-10k (25%)
                </p>
              </div>
              <div className="p-3 rounded-xl bg-sky-50 border border-sky-100/60/80 space-y-1">
                <div className="font-bold text-emerald-300">ค่าแยกหน่วย (2,000 บาท/หน่วย)</div>
                <p className="text-slate-700 text-[11px]">
                  จ่าย 2,000 บาทต่อหน่วย ทุกหน่วยที่แยกตัวออกไปโดยไม่จำกัดจำนวน
                </p>
              </div>
            </div>
          </div>

          {/* Sheet 2: ผู้บริหารศูนย์ CM */}
          <div className="p-5 rounded-3xl bg-sky-50/90 border border-sky-100/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider">แผ่นที่ 2 / ผู้บริหารศูนย์</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-100 text-slate-700 font-mono">CM Rules</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">ผู้บริหารศูนย์ (Center Manager)</h3>

            <div className="space-y-2 text-xs text-slate-700">
              <div className="p-3 rounded-xl bg-sky-50 border border-sky-100/60/80 space-y-1">
                <div className="font-bold text-blue-600">ค่าจัดงานศูนย์ ประเภท 1, 2, 3</div>
                <p className="text-slate-700 text-[11px]">
                  T1: COM 15k(15%), 30k(20%), 60k(25%), 120k(30%)<br />
                  T2: 0.8% เบี้ยปีต่อ • T3: Fixed 5k - 15k ตาม COM
                </p>
              </div>
              <div className="p-3 rounded-xl bg-sky-50 border border-sky-100/60/80 space-y-1">
                <div className="font-bold text-blue-600">ค่าแยกศูนย์ & โบนัสศูนย์</div>
                <p className="text-slate-700 text-[11px]">
                  ค่าแยกศูนย์: เดือนแรก 4,000 + 24 เดือน (1.5k-3k)<br />
                  โบนัสศูนย์: COM ปี 150k(4%), 300k(5%), 600k(6%)
                </p>
              </div>
            </div>
          </div>

          {/* Sheet 3: ผู้บริหารภาค RM */}
          <div className="p-5 rounded-3xl bg-sky-50/90 border border-sky-100/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-rose-400 uppercase tracking-wider">แผ่นที่ 3 / ผู้บริหารภาค</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-100 text-slate-700 font-mono">RM Rules</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">ผู้บริหารภาค (Regional Manager)</h3>

            <div className="space-y-2 text-xs text-slate-700">
              <div className="p-3 rounded-xl bg-sky-50 border border-sky-100/60/80 space-y-1">
                <div className="font-bold text-rose-300">ค่าจัดงานภาค T1, T2 & ค่าแยกภาค</div>
                <p className="text-slate-700 text-[11px]">
                  T1: FYC 60k(10%), 120k(12%), 180k(14%), 240k(16%), 300k(18% อาวุโส)<br />
                  T2: 1,000 - 2,500 บาทต่อศูนย์ • แยกภาค: 8k / 4k x 12 / 40% T1
                </p>
              </div>
              <div className="p-3 rounded-xl bg-sky-50 border border-sky-100/60/80 space-y-1">
                <div className="font-bold text-rose-300">ค่าบริหารเป้าหมาย & โบนัสภาค</div>
                <p className="text-slate-700 text-[11px]">
                  เป้าหมาย: FYC ปี 1.5M-5M จ่าย ฿10,000 - ฿30,000/เดือน (120k - 360k/ปี)<br />
                  โบนัสภาค: FYC ปี 500k(1.5%), 1M(2.0%), 2M(2.5%)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PythonReactNativeHub;
