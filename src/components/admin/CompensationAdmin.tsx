import React, { useState } from 'react';
import { 
  Sliders, 
  ShieldCheck, 
  Layers, 
  History, 
  Copy, 
  Edit3, 
  CheckCircle2, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CompensationRule } from '../../types';

export const CompensationAdmin: React.FC = () => {
  const { activePlan, planVersions, duplicatePlanVersion, updateCompensationRule, auditLogs } = useApp();

  const [selectedRule, setSelectedRule] = useState<CompensationRule | null>(null);
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanCode, setNewPlanCode] = useState('');
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  const handleDuplicate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanName || !newPlanCode) return;
    duplicatePlanVersion(newPlanCode, newPlanName, 'Admin clone plan for simulation');
    setShowDuplicateModal(false);
    setNewPlanName('');
    setNewPlanCode('');
  };

  return (
    <div id="compensation_admin_view" className="space-y-6 max-w-7xl mx-auto pb-16 text-left">
      {/* 1. Header Card */}
      <div className="p-6 rounded-3xl bg-white/90 border border-slate-200 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              ผู้ดูแลระบบแผนผลตอบแทน (Compensation Admin & Rule Engine)
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600/10 text-blue-600 border border-blue-600/30">
              {activePlan.code}
            </span>
          </div>
          <p className="text-xs text-slate-700 mt-1">
            จัดการเวอร์ชันแผน (Plan Versioning), ปรับแต่งสูตรคำนวณ 13 รายการ, และตรวจสอบ Audit Log ย้อนหลัง
          </p>
        </div>

        <button
          onClick={() => setShowDuplicateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-slate-900 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-lg shadow-purple-600/20 self-start md:self-auto"
        >
          <Copy className="w-4 h-4" />
          <span>จำลองเวอร์ชันแผนใหม่ (Duplicate Plan)</span>
        </button>
      </div>

      {/* 2. Active Plan Information */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white/80 border border-slate-200">
          <span className="text-[10px] text-slate-700 uppercase font-bold">เวอร์ชันปัจจุบัน</span>
          <div className="text-lg font-black text-blue-600 mt-1">{activePlan.name}</div>
          <div className="text-[10px] text-slate-700 font-mono mt-0.5">Code: {activePlan.code}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white/80 border border-slate-200">
          <span className="text-[10px] text-slate-700 uppercase font-bold">สถานะความถูกต้อง (Rule Verification)</span>
          <div className="text-lg font-black text-emerald-400 mt-1 flex items-center gap-1.5">
            <ShieldCheck className="w-5 h-5" />
            <span>Verified 8/8 Tests</span>
          </div>
          <div className="text-[10px] text-slate-700 mt-0.5">อิงเอกสารผลประโยชน์ 28 ส.ค. 69</div>
        </div>
        <div className="p-4 rounded-2xl bg-white/80 border border-slate-200">
          <span className="text-[10px] text-slate-700 uppercase font-bold">จำนวนกฎที่ Active</span>
          <div className="text-lg font-black text-slate-900 mt-1">{activePlan.rules.length} กฎผลประโยชน์</div>
          <div className="text-[10px] text-slate-700 mt-0.5">ครอบคลุมทุกระดับตำแหน่ง</div>
        </div>
      </div>

      {/* 3. Rules Table */}
      <div className="rounded-3xl bg-white/90 border border-slate-200 overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">รายการกฎผลประโยชน์ทั้งหมด ({activePlan.rules.length})</h2>
          <span className="text-xs text-slate-700 font-mono">Rule Engine v2021-01-15</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-white/80 text-slate-700 uppercase text-[10px] tracking-wider border-b border-slate-200 font-bold">
              <tr>
                <th className="py-3.5 px-4">ชื่อผลประโยชน์ (Benefit)</th>
                <th className="py-3.5 px-4">ตำแหน่งที่มีสิทธิ์</th>
                <th className="py-3.5 px-4">ฐานคิดเงิน (Calculation Base)</th>
                <th className="py-3.5 px-4">อัตรา / ขั้นบันได (Formula Rate)</th>
                <th className="py-3.5 px-4 text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {activePlan.rules.map((r) => (
                <tr key={r.id} className="hover:bg-slate-100/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{r.name}</div>
                    <div className="text-[10px] text-slate-700">{r.description}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700">
                      {r.positionId || 'ทุกตำแหน่ง'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-blue-600">
                    {r.basis}
                  </td>
                  <td className="py-3 px-4 font-mono text-sky-300">
                    {r.rate ? `${r.rate * 100}%` : r.tiers ? `${r.tiers.length} Tiers (ขั้นบันได)` : 'Formula Fixed'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Audit Log Trail */}
      <div className="rounded-3xl bg-white/90 border border-slate-200 p-6 space-y-4 shadow-xl">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-blue-600" />
          <h2 className="text-sm sm:text-base font-bold text-slate-900">
            ประวัติการเปลี่ยนแปลงและ Audit Trail (System Audit Logs)
          </h2>
        </div>

        <div className="space-y-2">
          {auditLogs.slice(0, 5).map((log) => (
            <div key={log.id} className="p-3 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">{log.action}</span>
                  <span className="text-[10px] text-slate-700">• {new Date(log.timestamp).toLocaleString()}</span>
                </div>
                <div className="text-slate-700 mt-0.5">{log.reason}</div>
              </div>
              <div className="text-[10px] text-blue-600 font-medium">โดย {log.userName}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Duplicate Plan Modal */}
      {showDuplicateModal && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleDuplicate} className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">จำลองเวอร์ชันแผนใหม่</h3>
              <button type="button" onClick={() => setShowDuplicateModal(false)} className="text-slate-700 hover:text-slate-900">✕</button>
            </div>
            <div>
              <label className="text-xs text-slate-700 block mb-1">รหัสแผน (Code)</label>
              <input
                type="text"
                required
                placeholder="เช่น PLAN-2026-V2"
                value={newPlanCode}
                onChange={(e) => setNewPlanCode(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-700 block mb-1">ชื่อแผน (Name)</label>
              <input
                type="text"
                required
                placeholder="เช่น แผนผลตอบแทนขยายภาคปี 2026"
                value={newPlanName}
                onChange={(e) => setNewPlanName(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setShowDuplicateModal(false)} className="flex-1 py-2 rounded-xl bg-slate-100 text-xs font-bold text-slate-700">ยกเลิก</button>
              <button type="submit" className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-slate-900">สร้างเวอร์ชัน</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
