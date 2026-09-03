import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Save,
  RotateCcw,
  Download,
  Upload,
  History,
  FileCode,
  CheckCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CompensationRuleSet, CompensationRuleTier } from '../../types';

/** Editable table for a CompensationRuleTier[] array. */
const TierEditor: React.FC<{
  tiers: CompensationRuleTier[];
  onChange: (next: CompensationRuleTier[]) => void;
  rate?: boolean;
  fixed?: boolean;
}> = ({ tiers, onChange, rate = true, fixed = false }) => {
  const update = (idx: number, field: keyof CompensationRuleTier, value: unknown) => {
    const next = tiers.map((t, i) => (i === idx ? { ...t, [field]: value } : t));
    onChange(next);
  };
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs text-left border-collapse">
        <thead>
          <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
            <th className="py-2 px-3">ขั้น</th>
            <th className="py-2 px-3">ยอดขั้นต่ำ (บาท)</th>
            <th className="py-2 px-3">ยอดสูงสุด (บาท)</th>
            {rate && <th className="py-2 px-3">อัตรา (%)</th>}
            {fixed && <th className="py-2 px-3">จำนวนคงที่ (บาท)</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {tiers.map((tier, idx) => (
            <tr key={tier.id}>
              <td className="py-2 px-3 font-bold text-white whitespace-nowrap">
                {tier.label || `ขั้นที่ ${idx + 1}`}
              </td>
              <td className="py-2 px-3">
                <input
                  type="number"
                  value={tier.minAmount}
                  onChange={(e) => update(idx, 'minAmount', Number(e.target.value))}
                  className="bg-slate-100 border border-slate-200 rounded px-2 py-1 text-xs text-white w-28"
                />
              </td>
              <td className="py-2 px-3">
                <input
                  type="number"
                  value={tier.maxAmount ?? ''}
                  placeholder="∞"
                  onChange={(e) =>
                    update(idx, 'maxAmount', e.target.value === '' ? undefined : Number(e.target.value))
                  }
                  className="bg-slate-100 border border-slate-200 rounded px-2 py-1 text-xs text-white w-28"
                />
              </td>
              {rate && (
                <td className="py-2 px-3">
                  <input
                    type="number"
                    step={0.1}
                    value={tier.ratePercentage ?? ''}
                    onChange={(e) =>
                      update(idx, 'ratePercentage', e.target.value === '' ? undefined : Number(e.target.value))
                    }
                    className="bg-slate-100 border border-slate-200 rounded px-2 py-1 text-xs text-amber-400 font-bold w-20"
                  />
                  {' '}%
                </td>
              )}
              {fixed && (
                <td className="py-2 px-3">
                  <input
                    type="number"
                    value={tier.fixedAmount ?? ''}
                    onChange={(e) =>
                      update(idx, 'fixedAmount', e.target.value === '' ? undefined : Number(e.target.value))
                    }
                    className="bg-slate-100 border border-slate-200 rounded px-2 py-1 text-xs text-emerald-400 font-bold w-24"
                  />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const AdminSettingsView: React.FC = () => {
  const {
    rules,
    updateRules,
    resetRulesToDefault,
    approveRules,
    importRulesFromJson,
    auditLogs,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'RULES_EDITOR' | 'JSON_IO' | 'AUDIT_LOGS'>('RULES_EDITOR');
  const [editForm, setEditForm] = useState<CompensationRuleSet>(rules);
  const [jsonText, setJsonText] = useState<string>(JSON.stringify(rules, null, 2));
  const [approverName, setApproverName] = useState<string>('คณะกรรมการบริหารฝ่ายพัฒนาตัวแทน');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  React.useEffect(() => {
    setEditForm(rules);
    setJsonText(JSON.stringify(rules, null, 2));
  }, [rules]);

  const handleSave = () => {
    updateRules(editForm, 'แก้ไขอัตราและเงื่อนไขผ่านหน้า Admin Settings');
    setSaveSuccessMsg('บันทึกการเปลี่ยนแปลงกติกาเรียบร้อยแล้ว!');
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  const handleJsonImport = () => {
    const success = importRulesFromJson(jsonText);
    if (success) {
      setSaveSuccessMsg('นำเข้ากติกาจากไฟล์ JSON สำเร็จ!');
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } else {
      alert('รูปแบบ JSON ไม่ถูกต้อง กรุณาตรวจสอบโครงสร้างข้อมูล');
    }
  };

  const handleJsonExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(rules, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `CompensationRules_${rules.version}_${new Date().toISOString().slice(0, 10)}.json`,
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const setUnit = (patch: Partial<CompensationRuleSet['unitManager']>) =>
    setEditForm((prev) => ({ ...prev, unitManager: { ...prev.unitManager, ...patch } }));
  const setCenter = (patch: Partial<CompensationRuleSet['centerManager']>) =>
    setEditForm((prev) => ({ ...prev, centerManager: { ...prev.centerManager, ...patch } }));
  const setGroup = (patch: Partial<CompensationRuleSet['groupManager']>) =>
    setEditForm((prev) => ({ ...prev, groupManager: { ...prev.groupManager, ...patch } }));

  const num = (v: string) => (v === '' ? 0 : Number(v));

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-white/90 border border-slate-200 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
              <Settings className="w-6 h-6 text-amber-400" />
              การจัดการและตั้งค่ากติกา
            </h1>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
              rules.status === 'OFFICIAL_DOCUMENT_2564'
                ? 'bg-blue-950 text-blue-300 border-blue-600'
                : 'bg-emerald-950 text-emerald-300 border-emerald-600'
            }`}>
              {rules.status === 'OFFICIAL_DOCUMENT_2564' ? 'กติกามาตรฐาน 15 ม.ค. 2564' : 'กติกากำหนดเอง (อนุมัติแล้ว)'}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            ปรับเปลี่ยนอัตราค่าจัดงาน ค่าแยกหน่วย/ศูนย์/ภาค และโบนัสประจำปีได้โดยไม่ต้องแก้ Source Code
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200">
          {([
            ['RULES_EDITOR', 'แบบฟอร์มกติกา'],
            ['JSON_IO', 'นำเข้า / ส่งออก JSON'],
            ['AUDIT_LOGS', `ประวัติการแก้ไข (${auditLogs.length})`],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === key ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-600 text-emerald-200 text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {activeTab === 'RULES_EDITOR' ? (
        <div className="space-y-6">
          {/* 1. Unit Manager */}
          <div className="bg-white/90 border border-slate-200 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500" />
                1. กติกาผู้บริหารหน่วย (Unit Manager)
              </h2>
              <p className="text-xs text-slate-600">ค่าจัดงานหน่วย, ค่าแยกหน่วย และค่าพาหนะ</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">ผลงานขั้นต่ำเพื่อดำรงตำแหน่ง (บาท/เดือน)</label>
                <input type="number" value={editForm.unitManager.qualMinPerformance}
                  onChange={(e) => setUnit({ qualMinPerformance: num(e.target.value) })}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-white focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">ค่าพาหนะผู้บริหารหน่วย (บาท/เดือน)</label>
                <input type="number" value={editForm.unitManager.vehicleAllowance}
                  onChange={(e) => setUnit({ vehicleAllowance: num(e.target.value) })}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-white focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">ค่าแยกหน่วยต่อหน่วย (บาท/เดือน)</label>
                <input type="number" value={editForm.unitManager.unitSeparationPerUnit}
                  onChange={(e) => setUnit({ unitSeparationPerUnit: num(e.target.value) })}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-white focus:outline-none" />
              </div>
            </div>
            <div className="mt-4 pt-2">
              <span className="text-xs font-semibold text-slate-700 block mb-2">ขั้นบันไดค่าจัดงานหน่วย:</span>
              <TierEditor
                tiers={editForm.unitManager.unitManagementTiers}
                onChange={(next) => setUnit({ unitManagementTiers: next })}
                rate
              />
            </div>
          </div>

          {/* 2. Center Manager */}
          <div className="bg-white/90 border border-slate-200 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                2. กติกาผู้บริหารศูนย์ (Center Manager)
              </h2>
              <p className="text-xs text-slate-600">ค่าจัดงานศูนย์ 3 ประเภท, ค่าแยกศูนย์ และโบนัสประจำปี</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">ผลงานขั้นต่ำ (บาท/เดือน)</label>
                <input type="number" value={editForm.centerManager.qualMinPerformance}
                  onChange={(e) => setCenter({ qualMinPerformance: num(e.target.value) })}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-white focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">จำนวนหน่วยแยกขั้นต่ำ</label>
                <input type="number" value={editForm.centerManager.qualMinSeparatedUnits}
                  onChange={(e) => setCenter({ qualMinSeparatedUnits: num(e.target.value) })}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-white focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">อัตราค่าจัดงานประเภท 2 (%)</label>
                <input type="number" step={0.1} value={editForm.centerManager.centerType2Rate}
                  onChange={(e) => setCenter({ centerType2Rate: num(e.target.value) })}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-white focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">เงินเพิ่มค่าแยกศูนย์เดือนแรก</label>
                <input type="number" value={editForm.centerManager.centerSeparationFirstMonthBooster}
                  onChange={(e) => setCenter({ centerSeparationFirstMonthBooster: num(e.target.value) })}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-white focus:outline-none" />
              </div>
            </div>
            <div className="space-y-5">
              <div>
                <span className="text-xs font-semibold text-slate-700 block mb-2">ค่าจัดงานศูนย์ประเภท 1 (%):</span>
                <TierEditor tiers={editForm.centerManager.centerType1Tiers} onChange={(next) => setCenter({ centerType1Tiers: next })} rate />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-700 block mb-2">ค่าจัดงานศูนย์ประเภท 3 (จำนวนคงที่):</span>
                <TierEditor tiers={editForm.centerManager.centerType3Tiers} onChange={(next) => setCenter({ centerType3Tiers: next })} fixed />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-700 block mb-2">ค่าแยกศูนย์ (จำนวนคงที่/ศูนย์):</span>
                <TierEditor tiers={editForm.centerManager.centerSeparationTiers} onChange={(next) => setCenter({ centerSeparationTiers: next })} fixed />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-700 block mb-2">โบนัสประจำปีศูนย์ (%):</span>
                <TierEditor tiers={editForm.centerManager.centerAnnualBonusTiers} onChange={(next) => setCenter({ centerAnnualBonusTiers: next })} rate />
              </div>
            </div>
          </div>

          {/* 3. Group Manager */}
          <div className="bg-white/90 border border-slate-200 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                3. กติกาผู้บริหารภาค (Group Manager)
              </h2>
              <p className="text-xs text-slate-600">ค่าจัดงานภาค, โบนัสภาค, ค่าแยกภาค และค่าบริหารเป้าหมาย</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">ผลงานขั้นต่ำ (บาท/เดือน)</label>
                <input type="number" value={editForm.groupManager.qualMinPerformance}
                  onChange={(e) => setGroup({ qualMinPerformance: num(e.target.value) })}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-white focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">จำนวนศูนย์แยกขั้นต่ำ</label>
                <input type="number" value={editForm.groupManager.qualMinSeparatedCenters}
                  onChange={(e) => setGroup({ qualMinSeparatedCenters: num(e.target.value) })}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-white focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">ค่าแยกภาคครั้งเดียว (บาท)</label>
                <input type="number" value={editForm.groupManager.groupSeparationType1Fixed}
                  onChange={(e) => setGroup({ groupSeparationType1Fixed: num(e.target.value) })}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-white focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">ค่าแยกภาครายเดือน (บาท/เดือน)</label>
                <input type="number" value={editForm.groupManager.groupSeparationType2Monthly}
                  onChange={(e) => setGroup({ groupSeparationType2Monthly: num(e.target.value) })}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-white focus:outline-none" />
              </div>
            </div>
            <div className="space-y-5">
              <div>
                <span className="text-xs font-semibold text-slate-700 block mb-2">ค่าจัดงานภาคประเภท 1 (% ของ FYC ทีม):</span>
                <TierEditor tiers={editForm.groupManager.groupType1Tiers} onChange={(next) => setGroup({ groupType1Tiers: next })} rate />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-700 block mb-2">ค่าจัดงานภาคประเภท 2 (จำนวนคงที่):</span>
                <TierEditor tiers={editForm.groupManager.groupType2Tiers} onChange={(next) => setGroup({ groupType2Tiers: next })} fixed />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-700 block mb-2">โบนัสประจำปีภาค (%):</span>
                <TierEditor tiers={editForm.groupManager.groupAnnualBonusTiers} onChange={(next) => setGroup({ groupAnnualBonusTiers: next })} rate />
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-2xl">
            <button onClick={resetRulesToDefault}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-rose-300 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer">
              <RotateCcw className="w-4 h-4" />
              <span>รีเซ็ตกลับเป็นเอกสาร 15 ม.ค. 2564</span>
            </button>
            <div className="flex items-center gap-3">
              <button onClick={() => approveRules(approverName)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-700 text-xs font-bold transition-all cursor-pointer">
                <ShieldCheck className="w-4 h-4" />
                <span>อนุมัติกติกานี้</span>
              </button>
              <button onClick={handleSave}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer">
                <Save className="w-4 h-4" />
                <span>บันทึกการเปลี่ยนแปลง</span>
              </button>
            </div>
          </div>
        </div>
      ) : activeTab === 'JSON_IO' ? (
        <div className="bg-white/90 border border-slate-200 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileCode className="w-5 h-5 text-blue-400" />
                นำเข้าและส่งออกกติกา (JSON Schema Configuration)
              </h2>
              <p className="text-xs text-slate-600">
                คุณสามารถ Export เพื่อสำรองข้อมูล หรือ Import กติกาฉบับใหม่เข้ามาใช้งานได้ทันที
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleJsonExport}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-white border border-slate-200 cursor-pointer">
                <Download className="w-3.5 h-3.5" />
                <span>Download JSON</span>
              </button>
              <button onClick={handleJsonImport}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>นำเข้า JSON นี้</span>
              </button>
            </div>
          </div>
          <textarea value={jsonText} onChange={(e) => setJsonText(e.target.value)} rows={18}
            className="w-full bg-white font-mono text-xs text-emerald-400 p-4 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500" />
        </div>
      ) : (
        <div className="bg-white/90 border border-slate-200 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-purple-400" />
                ประวัติการแก้ไขกติกาและโครงสร้างสายงาน (Audit Trail)
              </h2>
              <p className="text-xs text-slate-600">
                บันทึกการกระทำทุกขั้นตอน พร้อมเวลา ผู้ใช้งาน และการเปลี่ยนแปลงเวอร์ชัน
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                  <th className="py-2.5 px-3">วันและเวลา</th>
                  <th className="py-2.5 px-3">ผู้กระทำ</th>
                  <th className="py-2.5 px-3">การกระทำ</th>
                  <th className="py-2.5 px-3">รายละเอียด</th>
                  <th className="py-2.5 px-3">เวอร์ชัน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-100/40">
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {new Date(log.timestamp).toLocaleString('th-TH')}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 font-medium">{log.userEmail}</td>
                    <td className="py-2.5 px-3 font-bold text-amber-400">{log.action}</td>
                    <td className="py-2.5 px-3 text-slate-800">{log.details}</td>
                    <td className="py-2.5 px-3 font-mono text-blue-400">{log.newVersion || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
