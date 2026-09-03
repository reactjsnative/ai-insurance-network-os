import React, { useState, useEffect } from 'react';
import { X, Edit2, Save, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PositionLevel } from '../../types';
import { POSITIONS_LIST } from '../../rules/defaultRules';

export const EditMemberModal: React.FC = () => {
  const {
    editingMemberId,
    setEditingMemberId,
    members,
    updateMember,
    deleteMember,
  } = useApp();

  const member = members.find(m => m.id === editingMemberId);

  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [code, setCode] = useState('');
  const [position, setPosition] = useState<PositionLevel>('AGENT');
  const [parentId, setParentId] = useState<string>('');
  const [personalMonthlySales, setPersonalMonthlySales] = useState<number>(0);
  const [personalMonthlyCom, setPersonalMonthlyCom] = useState<number>(0);
  const [personalMonthlyFyc, setPersonalMonthlyFyc] = useState<number>(0);
  const [personalRenewalPremium, setPersonalRenewalPremium] = useState<number>(0);
  const [directUnitCount, setDirectUnitCount] = useState<number>(0);
  const [directCenterCount, setDirectCenterCount] = useState<number>(0);
  const [monthlyGoalIncome, setMonthlyGoalIncome] = useState<number>(100000);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [tenureMonths, setTenureMonths] = useState<number>(12);

  useEffect(() => {
    if (member) {
      setName(member.name);
      setNickname(member.nickname || '');
      setCode(member.code);
      setPosition(member.position);
      setParentId(member.parentId || '');
      setPersonalMonthlySales(member.personalMonthlySales);
      setPersonalMonthlyCom(member.personalMonthlyCom);
      setPersonalMonthlyFyc(member.personalMonthlyFyc);
      setPersonalRenewalPremium(member.personalRenewalPremium);
      setDirectUnitCount(member.directUnitCount || 0);
      setDirectCenterCount(member.directCenterCount || 0);
      setMonthlyGoalIncome(member.monthlyGoalIncome || 100000);
      setIsActive(member.isActive);
      setTenureMonths(member.tenureMonths);
    }
  }, [member]);

  if (!editingMemberId || !member) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMember(member.id, {
      name,
      nickname: nickname.trim() || undefined,
      code,
      position,
      parentId: parentId || null,
      personalMonthlySales: Number(personalMonthlySales),
      personalMonthlyCom: Number(personalMonthlyCom),
      personalMonthlyFyc: Number(personalMonthlyFyc),
      personalRenewalPremium: Number(personalRenewalPremium),
      personalAnnualFyc: Number(personalMonthlyFyc) * 12,
      personalAnnualCom: Number(personalMonthlyCom) * 12,
      directUnitCount: Number(directUnitCount),
      directCenterCount: Number(directCenterCount),
      monthlyGoalIncome: Number(monthlyGoalIncome),
      annualGoalIncome: Number(monthlyGoalIncome) * 12,
      isActive,
      tenureMonths: Number(tenureMonths),
    });

    setEditingMemberId(null);
  };

  const handleDelete = () => {
    if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ ${member.name} (${member.code}) ออกจากสายงาน?`)) {
      deleteMember(member.id);
      setEditingMemberId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white/60">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Edit2 className="w-5 h-5 text-blue-400" />
            <span>แก้ไขข้อมูลและผลงาน: {member.name}</span>
          </div>
          <button
            onClick={() => setEditingMemberId(null)}
            className="p-1 rounded-lg text-slate-700 hover:text-white hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-700 font-semibold block mb-1">รหัสสมาชิก</label>
              <input
                type="text"
                required
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-700 font-semibold block mb-1">ชื่อเล่น</label>
              <input
                type="text"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-700 font-semibold block mb-1">ชื่อ-นามสกุล</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-700 font-semibold block mb-1">ระดับตำแหน่ง</label>
              <select
                value={position}
                onChange={e => setPosition(e.target.value as PositionLevel)}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-white focus:outline-none cursor-pointer"
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
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-white focus:outline-none cursor-pointer"
              >
                <option value="">รากสายงาน (Root)</option>
                {members.filter(m => m.id !== member.id).map(m => (
                  <option key={m.id} value={m.id}>
                    [{m.code}] {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-slate-700 font-semibold block mb-1">ยอดขาย / ด. (บาท)</label>
              <input
                type="number"
                value={personalMonthlySales}
                onChange={e => {
                  const val = Number(e.target.value);
                  setPersonalMonthlySales(val);
                  setPersonalMonthlyCom(val * 0.35);
                  setPersonalMonthlyFyc(val * 0.70);
                }}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-700 font-semibold block mb-1">COM ส่วนตัว (บาท)</label>
              <input
                type="number"
                value={personalMonthlyCom}
                onChange={e => setPersonalMonthlyCom(Number(e.target.value))}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-700 font-semibold block mb-1">FYC ส่วนตัว (บาท)</label>
              <input
                type="number"
                value={personalMonthlyFyc}
                onChange={e => setPersonalMonthlyFyc(Number(e.target.value))}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-700 font-semibold block mb-1">พอร์ตเบี้ยปีต่อไป (บาท)</label>
              <input
                type="number"
                value={personalRenewalPremium}
                onChange={e => setPersonalRenewalPremium(Number(e.target.value))}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-700 font-semibold block mb-1">เป้าหมายรายได้ (บาท/ด)</label>
              <input
                type="number"
                value={monthlyGoalIncome}
                onChange={e => setMonthlyGoalIncome(Number(e.target.value))}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-700 font-semibold block mb-1">จำนวนหน่วยแยก (หน่วย)</label>
              <input
                type="number"
                value={directUnitCount}
                onChange={e => setDirectUnitCount(Number(e.target.value))}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-700 font-semibold block mb-1">จำนวนศูนย์แยก (ศูนย์)</label>
              <input
                type="number"
                value={directCenterCount}
                onChange={e => setDirectCenterCount(Number(e.target.value))}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={e => setIsActive(e.target.checked)}
                className="rounded accent-emerald-500"
              />
              <span>สถานะปฏิบัติงาน (Active)</span>
            </label>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-semibold cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>ลบสมาชิก</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditingMemberId(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>บันทึกการแก้ไข</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
