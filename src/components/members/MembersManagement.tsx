import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit3, 
  Trash2, 
  Shield, 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle2, 
  AlertCircle,
  Download,
  Filter
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Member } from '../../types';

export const MembersManagement: React.FC = () => {
  const { members, addMember, updateMember, deleteMember, activeUser, calculateMemberIncome } = useApp();

  const [search, setSearch] = useState('');
  const [filterPosition, setFilterPosition] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Member>>({
    name: '',
    nickname: '',
    positionId: 'agent',
    sponsorId: activeUser.id,
    parentMemberId: activeUser.id,
    personalFYC: 15000,
    personalCOM: 4500,
    phone: '081-234-5678',
    email: '',
    location: {
      province: 'กรุงเทพมหานคร',
      region: 'Bangkok & Metro',
    },
  });

  const [formError, setFormError] = useState<string | null>(null);

  const filteredMembers = members.filter(m => {
    const matchSearch = 
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.memberCode.toLowerCase().includes(search.toLowerCase()) ||
      m.location.province.toLowerCase().includes(search.toLowerCase());
    const matchPos = filterPosition === 'all' || m.positionId === filterPosition;
    return matchSearch && matchPos;
  });

  const handleOpenAdd = () => {
    setEditingMember(null);
    setFormData({
      name: '',
      nickname: '',
      positionId: 'agent',
      sponsorId: activeUser.id,
      parentMemberId: activeUser.id,
      personalFYC: 15000,
      personalCOM: 4500,
      phone: '081-234-5678',
      email: '',
      location: {
        province: 'กรุงเทพมหานคร',
        region: 'Bangkok & Metro',
      },
    });
    setFormError(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (m: Member) => {
    setEditingMember(m);
    setFormData({ ...m });
    setFormError(null);
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      setFormError('กรุณากรอกชื่อ-นามสกุลตัวแทน');
      return;
    }

    if (editingMember) {
      const res = updateMember(editingMember.id, formData);
      if (!res.success) {
        setFormError(res.message);
        return;
      }
    } else {
      const res = addMember(formData);
      if (!res.success) {
        setFormError(res.message);
        return;
      }
    }

    setShowAddModal(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`ยืนยันการลบสมาชิก "${name}" ออกจากระบบ?`)) {
      const res = deleteMember(id);
      if (!res.success) {
        alert(res.message);
      }
    }
  };

  return (
    <div id="members_management_view" className="space-y-6 max-w-7xl mx-auto pb-16 text-left">
      {/* 1. Header & Actions */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-100">
              การจัดการสมาชิกและโครงสร้างสายงาน (Members & Hierarchy)
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              {members.length} สมาชิก
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            เพิ่ม แก้ไข ย้ายสายงาน พร้อมระบบตรวจสอบความสัมพันธ์เพื่อป้องกันวงวนซ้ำ (Cycle & Orphan Prevention)
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20 self-start md:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>เพิ่มสมาชิกใหม่</span>
        </button>
      </div>

      {/* 2. Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่อ, รหัสตัวแทน, หรือจังหวัด..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>

        <select
          value={filterPosition}
          onChange={(e) => setFilterPosition(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none"
        >
          <option value="all">ทุกระดับตำแหน่ง</option>
          <option value="region_manager">ผู้บริหารภาค (RM)</option>
          <option value="center_manager">ผู้บริหารศูนย์ (CM)</option>
          <option value="unit_manager">ผู้บริหารหน่วย (UM)</option>
          <option value="agent">ตัวแทน (Agent)</option>
        </select>
      </div>

      {/* 3. Members Table */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-bold">
              <tr>
                <th className="py-3.5 px-4">สมาชิก</th>
                <th className="py-3.5 px-4">ตำแหน่ง</th>
                <th className="py-3.5 px-4">หัวหน้าสายงาน (Parent)</th>
                <th className="py-3.5 px-4 text-right">FYC ส่วนตัว</th>
                <th className="py-3.5 px-4 text-right">COM ส่วนตัว</th>
                <th className="py-3.5 px-4 text-right">ประมาณการรายได้</th>
                <th className="py-3.5 px-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredMembers.map((m) => {
                const parent = members.find(p => p.id === m.parentMemberId);
                const income = calculateMemberIncome(m, 'ACTUAL');
                return (
                  <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img src={m.avatarUrl} alt={m.name} className="w-8 h-8 rounded-full object-cover border border-slate-700" />
                        <div>
                          <div className="font-bold text-slate-100">{m.name}</div>
                          <div className="text-[10px] text-amber-400 font-mono">{m.memberCode} • {m.location.province}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        m.positionId === 'region_manager' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                        m.positionId === 'center_manager' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                        m.positionId === 'unit_manager' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                        'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                      }`}>
                        {m.positionId === 'region_manager' ? 'RM' : m.positionId === 'center_manager' ? 'CM' : m.positionId === 'unit_manager' ? 'UM' : 'Agent'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {parent ? (
                        <div className="text-slate-300">{parent.name} ({parent.memberCode})</div>
                      ) : (
                        <span className="text-slate-500 text-[10px]">Root Organization</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-sky-400 font-bold">
                      ฿{m.personalFYC.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-amber-400 font-bold">
                      ฿{m.personalCOM.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-400 font-black">
                      ฿{income.totalIncome.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(m)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                          title="แก้ไขข้อมูล"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(m.id, m.name)}
                          className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-800/40 transition-colors"
                          title="ลบสมาชิก"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Add / Edit Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form 
            onSubmit={handleSubmit}
            className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100">
                {editingMember ? 'แก้ไขข้อมูลสมาชิก' : 'เพิ่มสมาชิกใหม่เข้าสู่สายงาน'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-100 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">ชื่อ-นามสกุล *</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="เช่น สมชาย ใจดี"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">ชื่อเล่น</label>
                <input
                  type="text"
                  value={formData.nickname || ''}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  placeholder="เช่น บอย"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">ระดับตำแหน่ง *</label>
                <select
                  value={formData.positionId || 'agent'}
                  onChange={(e) => setFormData({ ...formData, positionId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="agent">ตัวแทน (Agent)</option>
                  <option value="unit_manager">ผู้บริหารหน่วย (UM)</option>
                  <option value="center_manager">ผู้บริหารศูนย์ (CM)</option>
                  <option value="region_manager">ผู้บริหารภาค (RM)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">หัวหน้าสายงาน (Parent Member)</label>
                <select
                  value={formData.parentMemberId || ''}
                  onChange={(e) => setFormData({ ...formData, parentMemberId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                >
                  {members.filter(m => !editingMember || m.id !== editingMember.id).map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.memberCode})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">FYC ส่วนตัว (บาท)</label>
                <input
                  type="number"
                  value={formData.personalFYC || 0}
                  onChange={(e) => setFormData({ ...formData, personalFYC: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">COM ส่วนตัว (บาท)</label>
                <input
                  type="number"
                  value={formData.personalCOM || 0}
                  onChange={(e) => setFormData({ ...formData, personalCOM: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors shadow-lg shadow-amber-500/20"
              >
                {editingMember ? 'บันทึกการแก้ไข' : 'ยืนยันเพิ่มสมาชิก'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
