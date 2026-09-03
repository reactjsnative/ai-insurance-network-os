import { Member, MonthlyPerformanceRecord, AuditLog } from '../types';

// High quality professional avatars with reliable fallbacks
const AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
];

export function getAvatar(index: number): string {
  return AVATARS[index % AVATARS.length];
}

// Root anchor — ระบบบังคับต้องมีเป็น sponsor/parent ระดับสูงสุด
// (ไม่ใช่สมาชิกจริง — เป็น technical anchor สำหรับอ้างอิงสายงานเท่านั้น)
export const ROOT_LEADER: Member = {
  id: 'mem_root_000',
  memberCode: 'ROOT-000',
  name: 'ระบบ (Root Anchor)',
  nickname: 'System',
  avatarUrl: getAvatar(0),
  positionId: 'region_manager',
  role: 'regional_manager',
  sponsorId: null,
  parentMemberId: null,
  unitId: null,
  centerId: null,
  regionId: 'reg_root',
  joinDate: '2020-01-01',
  status: 'active',
  phone: '',
  email: '',
  location: {
    province: 'กรุงเทพมหานคร',
    region: 'Bangkok & Metro',
    lat: 13.7563,
    lng: 100.5018,
  },
  personalFYC: 0,
  personalCOM: 0,
  firstYearPremium: 0,
  renewalPremium: 0,
  separatedUnitsCount: 0,
  separatedCentersCount: 0,
  separatedRegionsCount: 0,
};

// ไม่มีสมาชิกตัวอย่าง — แสดงเฉพาะสมาชิกที่สมัครจริงเท่านั้น
// (ลบ 9 คนทดสอบ CM/UM/AG ออกตามคำขอ)
export const INITIAL_MEMBERS: Member[] = [];

// ไม่มีประวัติปลอม — เริ่มว่าง รอข้อมูลจริง
export const INITIAL_12_MONTHS_HISTORY: MonthlyPerformanceRecord[] = [];

// ไม่มี log ปลอม — เริ่มว่าง
export const INITIAL_AUDIT_LOGS: AuditLog[] = [];
