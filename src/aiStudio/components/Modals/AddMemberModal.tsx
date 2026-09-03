import React, { useState } from 'react';
import { X, UserPlus, Save, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PositionLevel } from '../../types';
import { POSITIONS_LIST } from '../../rules/defaultRules';

export const AddMemberModal: React.FC = () => {
  const {
    isAddMemberModalOpen,
    setIsAddMemberModalOpen,
    members,
    addMember,
    selectedMemberId,
  } = useApp();

  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [code, setCode] = useState(`AGT-${Math.floor(100 + Math.random() * 900)}`);
  const [position, setPosition] = useState<PositionLevel>('AGENT');
  const [parentId, setParentId] = useState<string>(selectedMemberId || '');
  const [personalMonthlySales, setPersonalMonthlySales] = useState<number>(30000);
  const [personalRenewalPremium, setPersonalRenewalPremium] = useState<number>(100000);
  const [directUnitCount, setDirectUnitCount] = useState<number>(0);
  const [directCenterCount, setDirectCenterCount] = useState<number>(0);
  const [region, setRegion] = useState<string>('กรุงเทพและปริมณฑล');

  if (!isAddMemberModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addMember({
      code,
      name,
      nickname: nickname.trim() || undefined,
      position,
      parentId: parentId || null,
      personalMonthlySales: Number(personalMonthlySales),
      personalMonthlyCom: Number(personalMonthlySales) * 0.35,
      personalMonthlyFyc: Number(personalMonthlySales) * 0.70,
      personalRenewalPremium: Number(personalRenewalPremium),
      personalAnnualFyc: Number(personalMonthlySales) * 0.70 * 12,
      personalAnnualCom: Number(personalMonthlySales) * 0.35 * 12,
      directUnitCount: Number(directUnitCount),
      directCenterCount: Number(directCenterCount),
      directGroupCount: 0,
      monthlyGoalIncome: 50000,
      annualGoalIncome: 600000,
      monthlyGoalFyc: 35000,
      annualGoalFyc: 420000,
      startDate: new Date().toISOString().slice(0, 10),
      tenureMonths: 1,
      isActive: true,
      region,
    });

    setIsAddMemberModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/75 backdrop-blur-sm">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white/60">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <UserPlus className="w-5 h-5 text-amber-400" />
            <span>เพิ่มสมาชิกใหม่เข้าสู่สายงาน</span>
          </div>
          <button
            onClick={() => setIsAddMemberModalOpen(false)}
            className="p-1 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-700 font-semibold block mb-1">รหัสสมาชิก</label>
              <input
                type="text"
                required
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-slate-700 font-semibold block mb-1">ชื่อเล่น (ถ้ามี)</label>
              <input
                type="text"
                placeholder="เช่น บอส, แจน"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-700 font-semibold block mb-1">ชื่อ-นามสกุล</label>
            <input
              type="text"
              required
              placeholder="เช่น นายสมเกียรติ สว่างไกล"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-700 font-semibold block mb-1">ระดับตำแหน่ง</label>
              <select
                value={position}
                onChange={e => setPosition(e.target.value as PositionLevel)}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {POSITIONS_LIST.map(p => (
                  <option key={p.id} value={p.id}>{p.nameTh}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-700 font-semibold block mb-1">หัวหน้าสายงาน (Parent)</label>
              <select
                value={parentId}
                onChange={e => setParentId(e.target.value)}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="">รากสายงาน (ไม่มีหัวหน้า)</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>
                    [{m.code}] {m.name} ({m.position})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-700 font-semibold block mb-1">ผลงานขายส่วนตัว / เดือน (บาท)</label>
              <input
                type="number"
                value={personalMonthlySales}
                onChange={e => setPersonalMonthlySales(Number(e.target.value))}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-slate-700 font-semibold block mb-1">พอร์ตเบี้ยปีต่อไป (บาท)</label>
              <input
                type="number"
                value={personalRenewalPremium}
                onChange={e => setPersonalRenewalPremium(Number(e.target.value))}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAddMemberModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>บันทึกสมาชิก</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
