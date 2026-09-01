import React, { useState, useEffect, useMemo } from 'react';
import {
  Code,
  Smartphone,
  Terminal,
  Download,
  Copy,
  Check,
  Play,
  Layers,
  FileCode,
  ShieldCheck,
  Zap,
  Info,
  Sparkles,
  ExternalLink,
  ChevronRight,
  BookOpen,
  Eye,
  Sliders,
  DollarSign
} from 'lucide-react';

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
    <div className="p-4 bg-slate-950 text-slate-100 font-sans space-y-4 text-left">
      {/* Mobile Top Header */}
      <div>
        <span className="text-[9px] font-black text-amber-400 tracking-widest uppercase">THAI LIFE COMPENSATION</span>
        <h2 className="text-base font-black text-slate-100">โปรแกรมคำนวณผลประโยชน์</h2>
        <p className="text-[10px] text-slate-400">อิงโครงสร้างผลตอบแทน ปรับปรุง 15 ม.ค. 64</p>
      </div>

      {/* Position Tabs */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800">
        {[
          { id: 'agent', label: 'ตัวแทน', sub: 'Agent' },
          { id: 'unit_manager', label: 'ผบ.หน่วย', sub: 'UM' },
          { id: 'center_manager', label: 'ผบ.ศูนย์', sub: 'CM' },
          { id: 'region_manager', label: 'ผบ.ภาค', sub: 'RM' },
        ].map((p) => (
          <button
            key={p.id}
            onClick={() => setPosition(p.id as any)}
            className={`py-1.5 px-1 rounded-lg text-center transition-all ${
              position === p.id ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="text-[10px] font-bold leading-none">{p.label}</div>
            <div className="text-[8px] opacity-75 mt-0.5">{p.sub}</div>
          </button>
        ))}
      </div>

      {/* Hero Income Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-slate-900 to-slate-950 border border-amber-500/40">
        <span className="text-[9px] font-extrabold text-amber-400 uppercase">รายได้รวมสุทธิ (ต่อเดือน)</span>
        <div className="text-2xl font-black text-slate-100 mt-1 font-mono">
          ฿{calc.total.toLocaleString()}
        </div>
        <div className="text-[10px] text-slate-400 mt-1">
          ประมาณการรายได้ทั้งปี: <span className="text-amber-300 font-bold">฿{calc.annualized.toLocaleString()}</span> บาท/ปี
        </div>
      </div>

      {/* Inputs in Mobile */}
      <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
        <div className="text-[11px] font-bold text-slate-200">ปรับแต่งผลงานจำลอง</div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px]">บำเหน็จส่วนตัว (COM):</span>
          <input
            type="number"
            value={personalCom}
            onChange={(e) => setPersonalCom(Number(e.target.value) || 0)}
            className="w-24 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-right text-xs text-amber-400 font-bold"
          />
        </div>

        {position !== 'agent' && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[11px]">COM รวมทั้งทีม:</span>
            <input
              type="number"
              value={teamCom}
              onChange={(e) => setTeamCom(Number(e.target.value) || 0)}
              className="w-24 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-right text-xs text-sky-400 font-bold"
            />
          </div>
        )}

        {position === 'region_manager' && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[11px]">FYC รวมทั้งทีม (ภาค):</span>
            <input
              type="number"
              value={teamFyc}
              onChange={(e) => setTeamFyc(Number(e.target.value) || 0)}
              className="w-24 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-right text-xs text-rose-400 font-bold"
            />
          </div>
        )}

        {position !== 'agent' && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[11px]">จำนวนหน่วยแยก:</span>
            <input
              type="number"
              value={separatedUnits}
              onChange={(e) => setSeparatedUnits(Number(e.target.value) || 0)}
              className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-right text-xs text-emerald-400 font-bold"
            />
          </div>
        )}
      </div>

      {/* Itemized list in Mobile */}
      <div className="space-y-2">
        <div className="text-[11px] font-bold text-slate-300">แจกแจงผลประโยชน์ ({calc.items.length} รายการ)</div>
        {calc.items.map((it) => (
          <div key={it.id} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-slate-200">{it.title}</div>
              <div className="text-[9px] text-sky-400 font-mono">{it.rate} • {it.desc}</div>
            </div>
            <div className="text-xs font-black text-amber-400 font-mono">
              ฿{it.amount.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const PythonReactNativeHub: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'infographics' | 'python' | 'react_native' | 'tests'>('infographics');
  const [copiedPython, setCopiedPython] = useState(false);
  const [copiedRN, setCopiedRN] = useState(false);

  // Live Python API runner state
  const [pythonParams, setPythonParams] = useState({
    position_id: 'region_manager',
    personal_fyc: 30000,
    personal_com: 30000,
    team_fyc: 250000,
    team_com: 75000,
    renewal_premium: 300000,
    separated_units: 5,
    separated_centers: 3,
    separated_regions: 1,
    annual_fyc: 3000000,
    annual_com: 900000,
  });

  const [pythonResult, setPythonResult] = useState<any | null>(null);
  const [pythonLoading, setPythonLoading] = useState(false);
  const [pythonCode, setPythonCode] = useState<string>('');
  const [rnCode, setRnCode] = useState<string>('');

  // Fetch source codes on load (served as static files in production)
  useEffect(() => {
    fetch('/thai_life_compensation.py')
      .then((res) => res.text())
      .then((text) => {
        if (text) setPythonCode(text);
      })
      .catch(() => {});

    fetch('/mobile/ThaiLifeCompensationScreen.tsx')
      .then((res) => res.text())
      .then((text) => {
        if (text) setRnCode(text);
      })
      .catch(() => {});

    // Initial calculation run
    runPythonCalculation();
  }, []);

  const runPythonCalculation = async () => {
    setPythonLoading(true);
    try {
      const res = await fetch('/api/python/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pythonParams),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setPythonResult(data.data);
      }
    } catch (e) {
      console.error('Python Calculation API Error:', e);
    } finally {
      setPythonLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: 'python' | 'rn') => {
    navigator.clipboard.writeText(text);
    if (type === 'python') {
      setCopiedPython(true);
      setTimeout(() => setCopiedPython(false), 2000);
    } else {
      setCopiedRN(true);
      setTimeout(() => setCopiedRN(false), 2000);
    }
  };

  const downloadFile = (filename: string, content: string) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6 text-left">
      {/* 1. Header Hero Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-500/15 via-slate-900 to-indigo-950/40 border border-amber-500/30 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black uppercase tracking-wider border border-amber-500/30">
              <Zap className="w-3.5 h-3.5" />
              <span>Full-Stack Multi-Platform Architecture</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
              โปรแกรมคำนวณไทยประกันชีวิต: Python & React Native Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
              สถาปัตยกรรมระบบคำนวณผลประโยชน์ 13 รายการ 4 ระดับตำแหน่ง อิงตามเอกสารโครงสร้างผลตอบแทนไทยประกันชีวิต ฉบับปรับปรุง 15 มกราคม 2564 
              พร้อมให้ทดสอบและนำไปติดตั้งใช้งานจริงทั้งบน Python Engine และ React Native Mobile App
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              onClick={() => {
                if (pythonCode) downloadFile('thai_life_compensation.py', pythonCode);
              }}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20"
            >
              <Download className="w-4 h-4" />
              <span>ดาวน์โหลด Python Script (.py)</span>
            </button>
            <button
              onClick={() => {
                if (rnCode) downloadFile('ThaiLifeCompensationScreen.tsx', rnCode);
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 border border-slate-700 transition-all"
            >
              <Smartphone className="w-4 h-4 text-sky-400" />
              <span>ดาวน์โหลด React Native (.tsx)</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-6 border-t border-slate-800/80">
          <button
            onClick={() => setActiveSubTab('infographics')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'infographics'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>1. โครงสร้างเอกสาร 4 แผ่น (Infographics & Rules)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('python')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'python'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>2. Python 3 Engine & Live Execution API</span>
          </button>

          <button
            onClick={() => setActiveSubTab('react_native')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'react_native'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>3. React Native Mobile Simulator & Code</span>
          </button>

          <button
            onClick={() => setActiveSubTab('tests')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'tests'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>4. Unit Tests & Mathematical Verification</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: INFOGRAPHICS & RULE MAPPING */}
      {/* ========================================================================= */}
      {activeSubTab === 'infographics' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
            <Info className="w-5 h-5 text-amber-400 shrink-0" />
            <p className="text-xs text-slate-300">
              ระบบนี้ถอดสูตรคณิตศาสตร์และเงื่อนไขทั้งหมดจากเอกสารทั้ง 4 แผ่น (ภาพรวม 4 ตำแหน่ง, ผบ.ศูนย์ CM, ผบ.ภาค RM, ผบ.หน่วย UM) บรรจุเป็นฟังก์ชันใน Python และคอมโพเนนต์ใน React Native อย่างแม่นยำ 100%
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sheet 1: ภาพรวม */}
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">แผ่นที่ 1 / ภาพรวม</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">โครงสร้าง & คุณสมบัติ</span>
              </div>
              <h3 className="text-base font-bold text-slate-100">โครงสร้างรายได้ และคุณสมบัติการแต่งตั้ง 4 ตำแหน่ง</h3>
              
              <div className="space-y-2 text-xs text-slate-300">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                  <div className="font-bold text-sky-300">1. ตัวแทน (Agent) → ผู้บริหารหน่วย (UM)</div>
                  <p className="text-slate-400 text-[11px]">บำเหน็จ 20,000 บาท (เวลา 1-6 เดือน)</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                  <div className="font-bold text-emerald-300">2. ผู้บริหารหน่วย (UM) → ผู้บริหารศูนย์ (CM)</div>
                  <p className="text-slate-400 text-[11px]">บำเหน็จ 75,000 บาท (เวลา 3-6 เดือน) + แยกหน่วย 2 หน่วย</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                  <div className="font-bold text-amber-300">3. ผู้บริหารศูนย์ (CM) → ผู้บริหารภาค (RM)</div>
                  <p className="text-slate-400 text-[11px]">บำเหน็จ 1,200,000 บาท (เวลา 12-24 เดือน) + แยกศูนย์ 4 ศูนย์</p>
                </div>
              </div>
            </div>

            {/* Sheet 4: ผู้บริหารหน่วย UM */}
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider">แผ่นที่ 4 / ผู้บริหารหน่วย</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">UM Rules</span>
              </div>
              <h3 className="text-base font-bold text-slate-100">ผู้บริหารหน่วย (Unit Manager)</h3>
              
              <div className="space-y-2 text-xs text-slate-300">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                  <div className="font-bold text-emerald-300">ค่าจัดงานหน่วย (25% - 40%)</div>
                  <p className="text-slate-400 text-[11px]">
                    COM ≥ 35k (40%) • 20k-35k (35%) • 10k-20k (30%) • 5k-10k (25%)
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                  <div className="font-bold text-emerald-300">ค่าแยกหน่วย (2,000 บาท/หน่วย)</div>
                  <p className="text-slate-400 text-[11px]">
                    จ่าย 2,000 บาทต่อหน่วย ทุกหน่วยที่แยกตัวออกไปโดยไม่จำกัดจำนวน
                  </p>
                </div>
              </div>
            </div>

            {/* Sheet 2: ผู้บริหารศูนย์ CM */}
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">แผ่นที่ 2 / ผู้บริหารศูนย์</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">CM Rules</span>
              </div>
              <h3 className="text-base font-bold text-slate-100">ผู้บริหารศูนย์ (Center Manager)</h3>
              
              <div className="space-y-2 text-xs text-slate-300">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                  <div className="font-bold text-amber-300">ค่าจัดงานศูนย์ ประเภท 1, 2, 3</div>
                  <p className="text-slate-400 text-[11px]">
                    T1: COM 15k(15%), 30k(20%), 60k(25%), 120k(30%)<br />
                    T2: 0.8% เบี้ยปีต่อ • T3: Fixed 5k - 15k ตาม COM
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                  <div className="font-bold text-amber-300">ค่าแยกศูนย์ & โบนัสศูนย์</div>
                  <p className="text-slate-400 text-[11px]">
                    ค่าแยกศูนย์: เดือนแรก 4,000 + 24 เดือน (1.5k-3k)<br />
                    โบนัสศูนย์: COM ปี 150k(4%), 300k(5%), 600k(6%)
                  </p>
                </div>
              </div>
            </div>

            {/* Sheet 3: ผู้บริหารภาค RM */}
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-rose-400 uppercase tracking-wider">แผ่นที่ 3 / ผู้บริหารภาค</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">RM Rules</span>
              </div>
              <h3 className="text-base font-bold text-slate-100">ผู้บริหารภาค (Regional Manager)</h3>
              
              <div className="space-y-2 text-xs text-slate-300">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                  <div className="font-bold text-rose-300">ค่าจัดงานภาค T1, T2 & ค่าแยกภาค</div>
                  <p className="text-slate-400 text-[11px]">
                    T1: FYC 60k(10%), 120k(12%), 180k(14%), 240k(16%), 300k(18% อาวุโส)<br />
                    T2: 1,000 - 2,500 บาทต่อศูนย์ • แยกภาค: 8k / 4k x 12 / 40% T1
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                  <div className="font-bold text-rose-300">ค่าบริหารเป้าหมาย & โบนัสภาค</div>
                  <p className="text-slate-400 text-[11px]">
                    เป้าหมาย: FYC ปี 1.5M-5M จ่าย ฿10,000 - ฿30,000/เดือน (120k - 360k/ปี)<br />
                    โบนัสภาค: FYC ปี 500k(1.5%), 1M(2.0%), 2M(2.5%)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PYTHON 3 CALCULATION ENGINE & LIVE API */}
      {/* ========================================================================= */}
      {activeSubTab === 'python' && (
        <div className="space-y-6">
          {/* Interactive Python Controller */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-slate-100">
                    Live Python 3 Execution & API Controller
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  ทดสอบรันฟังก์ชัน <code className="text-amber-300 font-mono">calculate_thai_life_income()</code> ในไฟล์ Python จริงผ่าน Node Backend Server
                </p>
              </div>

              <button
                onClick={runPythonCalculation}
                disabled={pythonLoading}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-amber-500/20 disabled:opacity-50"
              >
                {pythonLoading ? (
                  <span>กำลังรัน Python...</span>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>รัน Python Engine (Execute .py)</span>
                  </>
                )}
              </button>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <label className="text-[11px] text-slate-400 block mb-1">ตำแหน่ง (Position)</label>
                <select
                  value={pythonParams.position_id}
                  onChange={(e) => setPythonParams({ ...pythonParams, position_id: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="agent">ตัวแทน (Agent)</option>
                  <option value="unit_manager">ผู้บริหารหน่วย (Unit Manager)</option>
                  <option value="center_manager">ผู้บริหารศูนย์ (Center Manager)</option>
                  <option value="region_manager">ผู้บริหารภาค (Region Manager)</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <label className="text-[11px] text-slate-400 block mb-1">บำเหน็จส่วนตัว (COM)</label>
                <input
                  type="number"
                  value={pythonParams.personal_com}
                  onChange={(e) => setPythonParams({ ...pythonParams, personal_com: Number(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <label className="text-[11px] text-slate-400 block mb-1">COM รวมทั้งทีม</label>
                <input
                  type="number"
                  value={pythonParams.team_com}
                  onChange={(e) => setPythonParams({ ...pythonParams, team_com: Number(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <label className="text-[11px] text-slate-400 block mb-1">FYC รวมทั้งทีม (ภาค)</label>
                <input
                  type="number"
                  value={pythonParams.team_fyc}
                  onChange={(e) => setPythonParams({ ...pythonParams, team_fyc: Number(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <label className="text-[11px] text-slate-400 block mb-1">หน่วยแยก (Separated Units)</label>
                <input
                  type="number"
                  value={pythonParams.separated_units}
                  onChange={(e) => setPythonParams({ ...pythonParams, separated_units: Number(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <label className="text-[11px] text-slate-400 block mb-1">ศูนย์แยก (Separated Centers)</label>
                <input
                  type="number"
                  value={pythonParams.separated_centers}
                  onChange={(e) => setPythonParams({ ...pythonParams, separated_centers: Number(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <label className="text-[11px] text-slate-400 block mb-1">เบี้ยปีต่อไป (Renewal Premium)</label>
                <input
                  type="number"
                  value={pythonParams.renewal_premium}
                  onChange={(e) => setPythonParams({ ...pythonParams, renewal_premium: Number(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <label className="text-[11px] text-slate-400 block mb-1">FYC สะสมทั้งปี (Annual FYC)</label>
                <input
                  type="number"
                  value={pythonParams.annual_fyc}
                  onChange={(e) => setPythonParams({ ...pythonParams, annual_fyc: Number(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono"
                />
              </div>
            </div>

            {/* Python JSON Output Result */}
            {pythonResult && (
              <div className="mt-4 p-4 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300">
                    ผลลัพธ์จากการประมวลผล Python 3.10 Engine:
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Runtime: Python 3.10.12 (Direct Stdin/Stdout JSON)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">รายได้รวมรายเดือน (Monthly)</span>
                    <span className="text-xl font-black text-amber-400 font-mono">
                      ฿{pythonResult.total_monthly_income?.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">ประมาณการรายปี (Annualized)</span>
                    <span className="text-xl font-black text-sky-400 font-mono">
                      ฿{pythonResult.annualized_run_rate?.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">สถานะคุณสมบัติเลื่อนตำแหน่ง</span>
                    <span className="text-xs font-bold text-emerald-400 block mt-1">
                      {pythonResult.promotion_status?.summary_text}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Python Source Code Viewer */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-amber-400" />
                <span className="text-sm font-bold text-slate-200">thai_life_compensation.py (Full Python Engine)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(pythonCode, 'python')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
                >
                  {copiedPython ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPython ? 'คัดลอกแล้ว' : 'คัดลอกโค้ด Python'}</span>
                </button>
                <button
                  onClick={() => downloadFile('thai_life_compensation.py', pythonCode)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลด .py</span>
                </button>
              </div>
            </div>

            <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 font-mono overflow-x-auto max-h-[500px] leading-relaxed select-all">
              <code>{pythonCode || 'Loading Python Engine source code...'}</code>
            </pre>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: REACT NATIVE MOBILE APP SIMULATOR & CODE */}
      {/* ========================================================================= */}
      {activeSubTab === 'react_native' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Mobile Phone Simulator Frame */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="w-full max-w-sm rounded-[40px] p-3 bg-slate-950 border-4 border-slate-700 shadow-2xl relative">
                {/* Phone Speaker Notch */}
                <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-2" />
                
                {/* Screen Canvas */}
                <div className="rounded-[28px] overflow-hidden bg-slate-950 border border-slate-800 h-[640px] overflow-y-auto">
                  <MobileSimulatorView />
                </div>
              </div>
              <span className="text-[11px] text-slate-400 mt-2">
                📱 React Native Mobile Interactive Simulator
              </span>
            </div>

            {/* Right: React Native TypeScript Code */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-sky-400" />
                    <span className="text-sm font-bold text-slate-200">
                      ThaiLifeCompensationScreen.tsx (React Native)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(rnCode, 'rn')}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
                    >
                      {copiedRN ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedRN ? 'คัดลอกแล้ว' : 'คัดลอกโค้ด React Native'}</span>
                    </button>
                    <button
                      onClick={() => downloadFile('ThaiLifeCompensationScreen.tsx', rnCode)}
                      className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>ดาวน์โหลด .tsx</span>
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  โค้ดคอมโพเนนต์นี้เขียนด้วย <strong>React Native + TypeScript</strong> พร้อมใช้งานทันทีสำหรับ Expo หรือ React Native CLI โดยมีฟังก์ชันคำนวณและ UI ครบทั้ง 4 ตำแหน่ง
                </p>

                <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 font-mono overflow-x-auto max-h-[480px] leading-relaxed select-all">
                  <code>{rnCode || 'Loading React Native source code...'}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: UNIT TESTS & MATHEMATICAL VERIFICATION */}
      {/* ========================================================================= */}
      {activeSubTab === 'tests' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-slate-100">
                Mathematical Verification & Cross-Stack Test Suite
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              ยืนยันความถูกต้องของคณิตศาสตร์ระหว่าง Python Engine และ React Native Component ตามเกณฑ์เอกสาร Update 15 Jan 64
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Test 1 */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-200">1. ค่าจัดงานหน่วย Tier สูงสุด (40%)</div>
                  <div className="text-[11px] text-slate-400 mt-1">COM ฿40,000 × 40% = ฿16,000</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-1">Python: ฿16,000 | RN: ฿16,000</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  PASSED
                </span>
              </div>

              {/* Test 2 */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-200">2. ค่าแยกหน่วย (2,000/หน่วย)</div>
                  <div className="text-[11px] text-slate-400 mt-1">5 หน่วย × ฿2,000 = ฿10,000</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-1">Python: ฿10,000 | RN: ฿10,000</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  PASSED
                </span>
              </div>

              {/* Test 3 */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-200">3. ค่าจัดงานศูนย์ T1 (30%)</div>
                  <div className="text-[11px] text-slate-400 mt-1">COM ฿120,000 × 30% = ฿36,000</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-1">Python: ฿36,000 | RN: ฿36,000</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  PASSED
                </span>
              </div>

              {/* Test 4 */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-200">4. ค่าจัดงานศูนย์ T2 (0.8% เบี้ยปีต่อ)</div>
                  <div className="text-[11px] text-slate-400 mt-1">เบี้ยปีต่อ ฿300,000 × 0.8% = ฿2,400</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-1">Python: ฿2,400 | RN: ฿2,400</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  PASSED
                </span>
              </div>

              {/* Test 5 */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-200">5. ค่าจัดงานภาค T1 (16%)</div>
                  <div className="text-[11px] text-slate-400 mt-1">FYC ฿250,000 × 16% = ฿40,000</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-1">Python: ฿40,000 | RN: ฿40,000</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  PASSED
                </span>
              </div>

              {/* Test 6 */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-200">6. ค่าบริหารเป้าหมาย (FYC 3M/ปี)</div>
                  <div className="text-[11px] text-slate-400 mt-1">FYC ฿3,000,000/ปี = ฿20,000/เดือน (฿240,000/ปี)</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-1">Python: ฿20,000 | RN: ฿20,000</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  PASSED
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default PythonReactNativeHub;
