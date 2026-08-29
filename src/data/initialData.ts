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

// สมาชิกเริ่มต้น = ว่างเปล่า (ไม่มีสมาชิกปลอม/ตัวอย่าง) — สมาชิกจริงสมัครผ่านระบบเท่านั้น
export const INITIAL_MEMBERS: Member[] = [];

// 12 Months historical performance trends for Dashboard (กราฟตัวอย่างสำหรับหน้า Dashboard)
export const INITIAL_12_MONTHS_HISTORY: MonthlyPerformanceRecord[] = [
  { month: '2025-09', memberId: 'mem_root_000', personalFYC: 38000, teamFYC: 1850000, personalCOM: 12000, teamCOM: 590000, firstYearPremium: 5550000, renewalPremium: 12000000, directMembersCount: 4, activeMembersCount: 82, calculatedIncome: 345000 },
  { month: '2025-10', memberId: 'mem_root_000', personalFYC: 40000, teamFYC: 1980000, personalCOM: 13000, teamCOM: 630000, firstYearPremium: 5940000, renewalPremium: 12200000, directMembersCount: 4, activeMembersCount: 86, calculatedIncome: 368000 },
  { month: '2025-11', memberId: 'mem_root_000', personalFYC: 42000, teamFYC: 2150000, personalCOM: 13500, teamCOM: 680000, firstYearPremium: 6450000, renewalPremium: 12500000, directMembersCount: 4, activeMembersCount: 92, calculatedIncome: 395000 },
  { month: '2025-12', memberId: 'mem_root_000', personalFYC: 55000, teamFYC: 2800000, personalCOM: 18000, teamCOM: 890000, firstYearPremium: 8400000, renewalPremium: 13000000, directMembersCount: 4, activeMembersCount: 104, calculatedIncome: 512000 },
  { month: '2026-01', memberId: 'mem_root_000', personalFYC: 35000, teamFYC: 1920000, personalCOM: 11000, teamCOM: 610000, firstYearPremium: 5760000, renewalPremium: 13100000, directMembersCount: 4, activeMembersCount: 89, calculatedIncome: 355000 },
  { month: '2026-02', memberId: 'mem_root_000', personalFYC: 39000, teamFYC: 2050000, personalCOM: 12500, teamCOM: 650000, firstYearPremium: 6150000, renewalPremium: 13400000, directMembersCount: 4, activeMembersCount: 94, calculatedIncome: 382000 },
  { month: '2026-03', memberId: 'mem_root_000', personalFYC: 46000, teamFYC: 2320000, personalCOM: 14800, teamCOM: 740000, firstYearPremium: 6960000, renewalPremium: 13800000, directMembersCount: 4, activeMembersCount: 101, calculatedIncome: 430000 },
  { month: '2026-04', memberId: 'mem_root_000', personalFYC: 41000, teamFYC: 2180000, personalCOM: 13200, teamCOM: 690000, firstYearPremium: 6540000, renewalPremium: 14000000, directMembersCount: 4, activeMembersCount: 97, calculatedIncome: 405000 },
  { month: '2026-05', memberId: 'mem_root_000', personalFYC: 44000, teamFYC: 2410000, personalCOM: 14000, teamCOM: 770000, firstYearPremium: 7230000, renewalPremium: 14300000, directMembersCount: 4, activeMembersCount: 106, calculatedIncome: 448000 },
  { month: '2026-06', memberId: 'mem_root_000', personalFYC: 48000, teamFYC: 2590000, personalCOM: 15500, teamCOM: 820000, firstYearPremium: 7770000, renewalPremium: 14700000, directMembersCount: 4, activeMembersCount: 112, calculatedIncome: 480000 },
  { month: '2026-07', memberId: 'mem_root_000', personalFYC: 43000, teamFYC: 2480000, personalCOM: 13800, teamCOM: 790000, firstYearPremium: 7440000, renewalPremium: 15000000, directMembersCount: 4, activeMembersCount: 109, calculatedIncome: 462000 },
  { month: '2026-08', memberId: 'mem_root_000', personalFYC: 45000, teamFYC: 2650000, personalCOM: 14500, teamCOM: 840000, firstYearPremium: 7950000, renewalPremium: 15300000, directMembersCount: 4, activeMembersCount: 115, calculatedIncome: 494000 },
];

// ไม่มี log ปลอม — เริ่มว่าง
export const INITIAL_AUDIT_LOGS: AuditLog[] = [];
