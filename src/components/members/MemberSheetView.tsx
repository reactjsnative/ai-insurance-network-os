import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sheet } from 'lucide-react';

export const MemberSheetView: React.FC = () => {
  const { members, t } = useApp();

  // Reuse the app's live member list (Firestore-backed) — the same source the
  // rest of the app (dashboard, organization, members management) reads from.
  // The old /api/members endpoints were served by the local Express dev server
  // only and 404 on Vercel, so this menu always showed "no data" in production.
  const sortedMembers = [...members].sort((a, b) => (a.joinDate || '').localeCompare(b.joinDate || ''));

  return (
    <div id="member_sheet_view" className="space-y-6 max-w-7xl mx-auto pb-16 text-left">
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 to-emerald-950/30 border border-slate-200 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sheet className="w-5 h-5 text-emerald-400" />
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">REAL-TIME</span>
          </div>
          <h1 className="mt-2 text-2xl font-black text-slate-900">คลังข้อมูลสมาชิก</h1>
          <p className="text-sm text-slate-700 mt-1">รายชื่อสมาชิกทั้งหมดในระบบ อัปเดตเรียลไทม์จากฐานข้อมูลกลาง</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
            ทั้งหมด {members.length} คน
          </span>
        </div>
      </div>

      {members.length === 0 ? (
        <div className="p-8 rounded-2xl bg-white/60 border border-slate-200 text-center text-slate-700 text-sm">
          ยังไม่มีข้อมูลสมาชิกในระบบ
          <div className="mt-2 text-[12px] text-slate-700">
            สมาชิกจะปรากฏที่นี่โดยอัตโนมัติเมื่อสมัครเข้ามาผ่านระบบ หรือเมื่อเพิ่มจากหน้า "การจัดการสมาชิก"
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white/60">
          <table className="w-full text-sm">
            <thead className="bg-white text-slate-700 text-[11px] uppercase tracking-wider text-left">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">รหัส</th>
                <th className="p-3">ชื่อ</th>
                <th className="p-3">อีเมล</th>
                <th className="p-3">โทร</th>
                <th className="p-3">ตำแหน่ง</th>
                <th className="p-3">จังหวัด</th>
                <th className="p-3">วันเข้า</th>
                <th className="p-3">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {sortedMembers.map((m, i) => (
                <tr key={m.id || i} className="border-t border-slate-200 hover:bg-slate-100/40">
                  <td className="p-3 text-slate-700">{i + 1}</td>
                  <td className="p-3 font-mono text-emerald-300">{m.memberCode}</td>
                  <td className="p-3 font-semibold text-slate-900">{m.name}</td>
                  <td className="p-3 text-slate-700">{m.email || '-'}</td>
                  <td className="p-3 text-slate-700">{m.phone || '-'}</td>
                  <td className="p-3 text-slate-700">{m.positionId}</td>
                  <td className="p-3 text-slate-700">{m.location?.province || '-'}</td>
                  <td className="p-3 text-slate-700">{m.joinDate}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      m.status === 'active'
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : m.status === 'probation'
                        ? 'bg-amber-500/15 text-amber-300'
                        : 'bg-slate-500/15 text-slate-700'
                    }`}>{m.status || 'active'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
