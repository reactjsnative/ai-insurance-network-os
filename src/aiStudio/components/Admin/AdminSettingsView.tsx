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
  AlertTriangle,
  Info,
  DollarSign,
  Award,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CompensationRuleSet } from '../../types';
import { formatBaht, formatPercent } from '../../lib/decimal';

export const AdminSettingsView: React.FC = () => {
  const {
    rules,
    updateRules,
    resetRulesToDefault,
    approveRules,
    importRulesFromJson,
    auditLogs,
    userRole,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'RULES_EDITOR' | 'JSON_IO' | 'AUDIT_LOGS'>('RULES_EDITOR');
  const [editForm, setEditForm] = useState<CompensationRuleSet>(rules);
  const [jsonText, setJsonText] = useState<string>(JSON.stringify(rules, null, 2));
  const [approverName, setApproverName] = useState<string>('คณะกรรมการบริหารฝ่ายพัฒนาตัวแทน');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Sync editForm when rules update
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
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(rules, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `CompensationRules_${rules.version}_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
              <Settings className="w-6 h-6 text-amber-400" />
              การจัดการและตั้งค่ากติกา (Admin Compensation Rules)
            </h1>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
              rules.status === 'OFFICIAL_DOCUMENT_2564'
                ? 'bg-blue-950 text-blue-300 border-blue-600'
                : 'bg-emerald-950 text-emerald-300 border-emerald-600'
            }`}>
              {rules.status === 'OFFICIAL_DOCUMENT_2564' ? 'กติกามาตรฐาน 15 ม.ค. 2564' : 'กติกากำหนดเอง (อนุมัติแล้ว)'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            ปรับเปลี่ยนอัตราค่าจัดงาน ค่าแยกหน่วย/ศูนย์/ภาค และโบนัสประจำปีได้โดยไม่ต้องแก้ Source Code
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-800 rounded-xl p-1 border border-slate-700">
          <button
            onClick={() => setActiveTab('RULES_EDITOR')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'RULES_EDITOR' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            แบบฟอร์มกติกา
          </button>
          <button
            onClick={() => setActiveTab('JSON_IO')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'JSON_IO' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            นำเข้า / ส่งออก JSON
          </button>
          <button
            onClick={() => setActiveTab('AUDIT_LOGS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'AUDIT_LOGS' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            ประวัติการแก้ไข ({auditLogs.length})
          </button>
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
          
          {/* Section 1: Unit Manager Rules */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500" />
                  1. กติกาผู้บริหารหน่วย (Unit Manager Compensation)
                </h2>
                <p className="text-xs text-slate-400">
                  ค่าจัดงานหน่วย (25% - 40%), ค่าแยกหน่วย (2,000 ฿/หน่วย) และค่าพาหนะ
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  ค่าแยกหน่วยต่อหน่วย (บาท/เดือน)
                </label>
                <input
                  type="number"
                  value={editForm.unitManager.unitSeparationPerUnit}
                  onChange={e =>
                    setEditForm(prev => ({
                      ...prev,
                      unitManager: { ...prev.unitManager, unitSeparationPerUnit: Number(e.target.value) },
                    }))
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  ค่าพาหนะผู้บริหารหน่วย (บาท/เดือน)
                </label>
                <input
                  type="number"
                  value={editForm.unitManager.vehicleAllowance}
                  onChange={e =>
                    setEditForm(prev => ({
                      ...prev,
                      unitManager: { ...prev.unitManager, vehicleAllowance: Number(e.target.value) },
                    }))
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  ผลงานขั้นต่ำเพื่อดำรงตำแหน่ง (บาท/เดือน)
                </label>
                <input
                  type="number"
                  value={editForm.unitManager.qualMinPerformance}
                  onChange={e =>
                    setEditForm(prev => ({
                      ...prev,
                      unitManager: { ...prev.unitManager, qualMinPerformance: Number(e.target.value) },
                    }))
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Unit Manager Tiers Table */}
            <div className="mt-4 pt-2">
              <span className="text-xs font-semibold text-slate-300 block mb-2">
                ขั้นบันไดค่าจัดงานหน่วย (Unit Overriding Tiers):
              </span>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-800 text-slate-300 border-b border-slate-700">
                      <th className="py-2 px-3">ขั้น</th>
                      <th className="py-2 px-3">ยอดขายขั้นต่ำ (บาท)</th>
                      <th className="py-2 px-3">ยอดขายสูงสุด (บาท)</th>
                      <th className="py-2 px-3">อัตราค่าจัดงาน (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {editForm.unitManager.overridingTiers.map((tier, idx) => (
                      <tr key={tier.tier}>
                        <td className="py-2 px-3 font-bold text-white">ขั้นที่ {tier.tier}</td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            value={tier.minSales}
                            onChange={e => {
                              const val = Number(e.target.value);
                              const newTiers = [...editForm.unitManager.overridingTiers];
                              newTiers[idx].minSales = val;
                              setEditForm(prev => ({ ...prev, unitManager: { ...prev.unitManager, overridingTiers: newTiers } }));
                            }}
                            className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white w-28"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            value={tier.maxSales}
                            onChange={e => {
                              const val = Number(e.target.value);
                              const newTiers = [...editForm.unitManager.overridingTiers];
                              newTiers[idx].maxSales = val;
                              setEditForm(prev => ({ ...prev, unitManager: { ...prev.unitManager, overridingTiers: newTiers } }));
                            }}
                            className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white w-28"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            value={tier.ratePercent}
                            onChange={e => {
                              const val = Number(e.target.value);
                              const newTiers = [...editForm.unitManager.overridingTiers];
                              newTiers[idx].ratePercent = val;
                              setEditForm(prev => ({ ...prev, unitManager: { ...prev.unitManager, overridingTiers: newTiers } }));
                            }}
                            className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-amber-400 font-bold w-20"
                          /> %
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Section 2: Center Manager Rules */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  2. กติกาผู้บริหารศูนย์ (Center Manager Compensation)
                </h2>
                <p className="text-xs text-slate-400">
                  ค่าจัดงานศูนย์ 3 ประเภท, ค่าแยกศูนย์, และค่าบริหารเป้าหมาย
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  ค่าจัดงานศูนย์ประเภท 2 (อัตรา %)
                </label>
                <input
                  type="number"
                  step={0.1}
                  value={editForm.centerManager.centerOverridingType2Rate}
                  onChange={e =>
                    setEditForm(prev => ({
                      ...prev,
                      centerManager: { ...prev.centerManager, centerOverridingType2Rate: Number(e.target.value) },
                    }))
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  ค่าพาหนะผู้บริหารศูนย์ (บาท/เดือน)
                </label>
                <input
                  type="number"
                  value={editForm.centerManager.vehicleAllowance}
                  onChange={e =>
                    setEditForm(prev => ({
                      ...prev,
                      centerManager: { ...prev.centerManager, vehicleAllowance: Number(e.target.value) },
                    }))
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  ค่าแยกศูนย์ต่อศูนย์ (บาท/เดือน)
                </label>
                <input
                  type="number"
                  value={editForm.centerManager.centerSeparationPerCenter}
                  onChange={e =>
                    setEditForm(prev => ({
                      ...prev,
                      centerManager: { ...prev.centerManager, centerSeparationPerCenter: Number(e.target.value) },
                    }))
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Group Manager Rules */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  3. กติกาผู้บริหารภาค (Group Manager Compensation)
                </h2>
                <p className="text-xs text-slate-400">
                  ค่าจัดงานภาคประเภท 1-2, ค่าแยกภาค, และค่าพาหนะ
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  ค่าพาหนะผู้บริหารภาค (บาท/เดือน)
                </label>
                <input
                  type="number"
                  value={editForm.groupManager.vehicleAllowance}
                  onChange={e =>
                    setEditForm(prev => ({
                      ...prev,
                      groupManager: { ...prev.groupManager, vehicleAllowance: Number(e.target.value) },
                    }))
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  ค่าแยกภาคต่อภาค (บาท/เดือน)
                </label>
                <input
                  type="number"
                  value={editForm.groupManager.groupSeparationPerGroup}
                  onChange={e =>
                    setEditForm(prev => ({
                      ...prev,
                      groupManager: { ...prev.groupManager, groupSeparationPerGroup: Number(e.target.value) },
                    }))
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  ผลงานขั้นต่ำเพื่อดำรงตำแหน่งภาค (บาท/ด)
                </label>
                <input
                  type="number"
                  value={editForm.groupManager.qualMinPerformance}
                  onChange={e =>
                    setEditForm(prev => ({
                      ...prev,
                      groupManager: { ...prev.groupManager, qualMinPerformance: Number(e.target.value) },
                    }))
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-2xl">
            <button
              onClick={resetRulesToDefault}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>รีเซ็ตกลับเป็นเอกสาร 15 ม.ค. 2564</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={() => approveRules(approverName)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-700 text-xs font-bold transition-all cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>อนุมัติกติกานี้</span>
              </button>

              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>บันทึกการเปลี่ยนแปลง</span>
              </button>
            </div>
          </div>

        </div>
      ) : activeTab === 'JSON_IO' ? (
        /* JSON Import / Export View */
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileCode className="w-5 h-5 text-blue-400" />
                นำเข้าและส่งออกกติกา (JSON Schema Configuration)
              </h2>
              <p className="text-xs text-slate-400">
                คุณสามารถ Export เพื่อสำรองข้อมูล หรือ Import กติกาฉบับใหม่เข้ามาใช้งานได้ทันที
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleJsonExport}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download JSON</span>
              </button>
              <button
                onClick={handleJsonImport}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>นำเข้า JSON นี้</span>
              </button>
            </div>
          </div>

          <textarea
            value={jsonText}
            onChange={e => setJsonText(e.target.value)}
            rows={18}
            className="w-full bg-slate-950 font-mono text-xs text-emerald-400 p-4 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500"
          />
        </div>
      ) : (
        /* Audit Logs View */
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-purple-400" />
                ประวัติการแก้ไขกติกาและโครงสร้างสายงาน (Audit Trail)
              </h2>
              <p className="text-xs text-slate-400">
                บันทึกการกระทำทุกขั้นตอน พร้อมเวลา ผู้ใช้งาน และการเปลี่ยนแปลงเวอร์ชัน
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-800 text-slate-300 border-b border-slate-700">
                  <th className="py-2.5 px-3">วันและเวลา</th>
                  <th className="py-2.5 px-3">ผู้กระทำ</th>
                  <th className="py-2.5 px-3">การกระทำ</th>
                  <th className="py-2.5 px-3">รายละเอียด</th>
                  <th className="py-2.5 px-3">เวอร์ชัน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-mono text-slate-400">
                      {new Date(log.timestamp).toLocaleString('th-TH')}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 font-medium">
                      {log.userEmail}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-amber-400">
                      {log.action}
                    </td>
                    <td className="py-2.5 px-3 text-slate-200">
                      {log.details}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-blue-400">
                      {log.newVersion || '-'}
                    </td>
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
