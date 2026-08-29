import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sheet, RefreshCw, ExternalLink } from 'lucide-react';

interface SheetMember {
  memberId: string;
  memberCode: string;
  name: string;
  email: string;
  phone: string;
  positionId: string;
  province: string;
  joinDate: string;
  status: string;
  [k: string]: any;
}

export const MemberSheetView: React.FC = () => {
  const { t } = useApp();
  const [members, setMembers] = useState<SheetMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [configured, setConfigured] = useState(true);
  const [lastSync, setLastSync] = useState<string>('');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      // Try Google Sheet first
      const res = await fetch('/api/members/sheet');
      const data = await res.json();
      if (res.ok && data.ok) {
        setMembers(data.members || []);
        setLastSync(new Date().toLocaleTimeString('th-TH') + ' (Google Sheet)');
        return;
      }
      // Fallback: local JSON store (server_data/members.json)
      const local = await fetch('/api/members');
      const localData = await local.json();
      if (local.ok && localData.ok) {
        setMembers(localData.members || []);
        setConfigured(!!data.configured);
        setLastSync(new Date().toLocaleTimeString('th-TH') + ' (Local Store)');
      } else {
        throw new Error('ไม่สามารถโหลดข้อมูลได้');
      }
    } catch (e: any) {
      setError(e.message || 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const sheetUrl = process.env.GOOGLE_SHEET_ID
    ? `https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SHEET_ID}/edit`
    : 'https://docs.google.com/spreadsheets/';

  return (
    <div id="member_sheet_view" className="space-y-6 max-w-7xl mx-auto pb-16 text-left">
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 to-emerald-950/30 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sheet className="w-5 h-5 text-emerald-400" />
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">GOOGLE SHEET</span>
          </div>
          <h1 className="mt-2 text-2xl font-black text-slate-100">คลังข้อมูลสมาชิก (จาก Google Sheets)</h1>
          <p className="text-sm text-slate-400 mt-1">ข้อมูลสมาชิกที่ดึงมาจาก Google Sheet แบบเรียลไทม์</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold border border-emerald-500/30 transition-colors disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'กำลังโหลด...' : 'รีเฟรช'}
          </button>
          <a
            href={sheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            เปิด Sheet
          </a>
        </div>
      </div>

      {lastSync && (
        <div className="text-[11px] text-slate-500">ซิงก์ล่าสุด: {lastSync} • {members.length} เรคคอร์ด</div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-sm">
          {error}
          {!configured && (
            <div className="mt-2 text-[12px] text-rose-300/80">
              ยังไม่ได้ตั้งค่า GOOGLE_SHEET_ID และ GOOGLE_SHEETS_CREDENTIALS_JSON ในไฟล์ .env
              — ใส่ credential แล้วรีสตาร์ท server ระบบจะดึงข้อมูลจาก Sheet ได้ทันที
            </div>
          )}
        </div>
      )}

      {!error && members.length === 0 && !loading && (
        <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-slate-400 text-sm">
          ยังไม่มีข้อมูลใน Google Sheet (หรือยังไม่ได้ตั้งค่า credential)
        </div>
      )}

      {members.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
          <table className="w-full text-sm">
            <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase tracking-wider text-left">
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
              {members.map((m, i) => (
                <tr key={m.memberId || i} className="border-t border-slate-800 hover:bg-slate-800/40">
                  <td className="p-3 text-slate-500">{i + 1}</td>
                  <td className="p-3 font-mono text-emerald-300">{m.memberCode}</td>
                  <td className="p-3 font-semibold text-slate-100">{m.name}</td>
                  <td className="p-3 text-slate-300">{m.email || '-'}</td>
                  <td className="p-3 text-slate-300">{m.phone || '-'}</td>
                  <td className="p-3 text-slate-300">{m.positionId}</td>
                  <td className="p-3 text-slate-300">{m.province || '-'}</td>
                  <td className="p-3 text-slate-300">{m.joinDate}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[11px] font-bold">{m.status || 'active'}</span>
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
