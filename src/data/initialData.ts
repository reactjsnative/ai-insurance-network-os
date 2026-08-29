import { Member, MonthlyPerformanceRecord, AuditLog } from '../types';

// High quality professional avatars with reliable fallbacks
const AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
];

export function getAvatar(index: number): string {
  return AVATARS[index % AVATARS.length];
}

// 1. Regional Leader
export const ROOT_LEADER: Member = {
  id: 'mem_reg_001',
  memberCode: 'RM-001',
  name: 'ธนพัฒน์ วงศ์สุวรรณวิวัฒน์',
  nickname: 'พี่ธน',
  avatarUrl: getAvatar(0),
  positionId: 'region_manager',
  role: 'regional_manager',
  sponsorId: null,
  parentMemberId: null,
  unitId: null,
  centerId: null,
  regionId: 'reg_central_01',
  joinDate: '2020-01-15',
  status: 'active',
  phone: '081-890-1234',
  email: 'thanapat.reg@insure-os.com',
  location: {
    province: 'กรุงเทพมหานคร',
    region: 'Bangkok & Metro',
    lat: 13.7563,
    lng: 100.5018,
  },
  personalFYC: 45000,
  personalCOM: 14500,
  firstYearPremium: 135000,
  renewalPremium: 850000,
  separatedUnitsCount: 12,
  separatedCentersCount: 4,
  separatedRegionsCount: 1,
};

// 4 Centers
export const CENTER_LEADERS: Member[] = [
  {
    id: 'mem_ctr_001',
    memberCode: 'CM-101',
    name: 'ศิริพร เจริญสุขไพศาล',
    nickname: 'คุณแอน',
    avatarUrl: getAvatar(1),
    positionId: 'center_manager',
    role: 'center_manager',
    sponsorId: 'mem_reg_001',
    parentMemberId: 'mem_reg_001',
    unitId: null,
    centerId: 'ctr_sukhumvit',
    regionId: 'reg_central_01',
    joinDate: '2021-03-10',
    status: 'active',
    phone: '089-223-4567',
    email: 'siriporn.cm1@insure-os.com',
    location: {
      province: 'กรุงเทพมหานคร (สุขุมวิท)',
      region: 'Bangkok & Metro',
      lat: 13.7367,
      lng: 100.5612,
    },
    personalFYC: 38000,
    personalCOM: 12000,
    firstYearPremium: 114000,
    renewalPremium: 420000,
    separatedUnitsCount: 3,
    separatedCentersCount: 1,
  },
  {
    id: 'mem_ctr_002',
    memberCode: 'CM-102',
    name: 'วรพล ภักดีดำรงธรรม',
    nickname: 'คุณบอส',
    avatarUrl: getAvatar(2),
    positionId: 'center_manager',
    role: 'center_manager',
    sponsorId: 'mem_reg_001',
    parentMemberId: 'mem_reg_001',
    unitId: null,
    centerId: 'ctr_chiangmai',
    regionId: 'reg_central_01',
    joinDate: '2021-07-20',
    status: 'active',
    phone: '084-555-7890',
    email: 'worapol.cm2@insure-os.com',
    location: {
      province: 'เชียงใหม่',
      region: 'North',
      lat: 18.7883,
      lng: 98.9853,
    },
    personalFYC: 42000,
    personalCOM: 13500,
    firstYearPremium: 126000,
    renewalPremium: 380000,
    separatedUnitsCount: 3,
    separatedCentersCount: 0,
  },
  {
    id: 'mem_ctr_003',
    memberCode: 'CM-103',
    name: 'นภาพร วรปัญญาสกุล',
    nickname: 'คุณฟ้า',
    avatarUrl: getAvatar(3),
    positionId: 'center_manager',
    role: 'center_manager',
    sponsorId: 'mem_reg_001',
    parentMemberId: 'mem_reg_001',
    unitId: null,
    centerId: 'ctr_khonkaen',
    regionId: 'reg_central_01',
    joinDate: '2022-02-15',
    status: 'active',
    phone: '086-444-1234',
    email: 'naphaporn.cm3@insure-os.com',
    location: {
      province: 'ขอนแก่น',
      region: 'Northeast',
      lat: 16.4322,
      lng: 102.8236,
    },
    personalFYC: 35000,
    personalCOM: 11000,
    firstYearPremium: 105000,
    renewalPremium: 290000,
    separatedUnitsCount: 3,
    separatedCentersCount: 0,
  },
  {
    id: 'mem_ctr_004',
    memberCode: 'CM-104',
    name: 'กิตติศักดิ์ ชัยชนะบารมี',
    nickname: 'คุณท็อป',
    avatarUrl: getAvatar(4),
    positionId: 'center_manager',
    role: 'center_manager',
    sponsorId: 'mem_reg_001',
    parentMemberId: 'mem_reg_001',
    unitId: null,
    centerId: 'ctr_songkhla',
    regionId: 'reg_central_01',
    joinDate: '2022-09-01',
    status: 'active',
    phone: '083-999-8877',
    email: 'kittisak.cm4@insure-os.com',
    location: {
      province: 'สงขลา (หาดใหญ่)',
      region: 'South',
      lat: 7.0086,
      lng: 100.4747,
    },
    personalFYC: 31000,
    personalCOM: 9800,
    firstYearPremium: 93000,
    renewalPremium: 260000,
    separatedUnitsCount: 3,
    separatedCentersCount: 0,
  },
];

// 12 Unit Leaders (3 per center)
const UNIT_NAMES = [
  'หน่วยเพชรแท้ สุขุมวิท', 'หน่วยดาวรุ่ง มหานคร', 'หน่วยเกียรติยศ สุขุมวิท',
  'หน่วยล้านนา พาวเวอร์', 'หน่วยเชียงใหม่ รุ่งเรือง', 'หน่วยดอยสุเทพ ก้าวหน้า',
  'หน่วยอีสาน มั่งคั่ง', 'หน่วยขอนแก่น ลีดเดอร์', 'หน่วยเพชรขอนแก่น',
  'หน่วยสยาม ทักษิณ', 'หน่วยหาดใหญ่ พรีเมียร์', 'หน่วยอันดามัน โกลด์'
];

const PROVINCES_POOL = [
  { p: 'กรุงเทพมหานคร', r: 'Bangkok & Metro', lat: 13.75, lng: 100.50 },
  { p: 'นนทบุรี', r: 'Bangkok & Metro', lat: 13.86, lng: 100.51 },
  { p: 'เชียงใหม่', r: 'North', lat: 18.78, lng: 98.98 },
  { p: 'เชียงราย', r: 'North', lat: 19.90, lng: 99.83 },
  { p: 'ขอนแก่น', r: 'Northeast', lat: 16.43, lng: 102.82 },
  { p: 'นครราชสีมา', r: 'Northeast', lat: 14.97, lng: 102.09 },
  { p: 'สงขลา', r: 'South', lat: 7.00, lng: 100.47 },
  { p: 'ภูเก็ต', r: 'South', lat: 7.88, lng: 98.39 },
  { p: 'ชลบุรี', r: 'East', lat: 13.36, lng: 100.98 },
  { p: 'ระยอง', r: 'East', lat: 12.68, lng: 101.28 },
];

const FIRST_NAMES = [
  'สมชาย', 'วิภา', 'อรรถพล', 'พิมพ์ใจ', 'ธีรยุทธ', 'กนกวรรณ', 'ชวลิต', 'สุภาพร',
  'ณัฐวุฒิ', 'อารียา', 'ภาณุเดช', 'ชลธิชา', 'พงศกร', 'กมลรัตน์', 'เกียรติภูมิ', 'รังสิมา',
  'ปฏิภาณ', 'สุดารัตน์', 'ธนพล', 'ลัดดาวัลย์', 'ปรเมศวร์', 'ศิริลักษณ์', 'อนันต์', 'มัณฑนา',
  'เกริกเกียรติ', 'นลินี', 'พีรพงศ์', 'สุชาดา', 'จักรภพ', 'วนิดา', 'อภิเชษฐ์', 'เบญจมาศ'
];

const LAST_NAMES = [
  'ใจดี', 'สุขเกษม', 'รัตนโกสินทร์', 'ศรีสุวรรณ', 'เจริญผล', 'จงสถิตย์', 'ปัญญาวงศ์',
  'สว่างจิต', 'พิทักษ์ธรรม', 'วัฒนพาณิชย์', 'ตั้งตรงจิตร', 'ทองประเสริฐ', 'เลิศวิริยะ',
  'มีทรัพย์', 'จิตรประสาน', 'สุวรรณโชติ', 'พงษ์พิพัฒน์', 'สิริเวชภัณฑ์', 'ยิ่งยงค์', 'ธรรมรักษ์'
];

function generateFullOrganization(): Member[] {
  const members: Member[] = [ROOT_LEADER, ...CENTER_LEADERS];
  let avatarCounter = 5;

  let unitIndex = 0;

  CENTER_LEADERS.forEach((center, cIdx) => {
    // 3 units per center
    for (let u = 0; u < 3; u++) {
      const uId = `mem_unit_${cIdx + 1}_${u + 1}`;
      const unitCode = `UM-${cIdx + 1}0${u + 1}`;
      const unitLeaderName = `${FIRST_NAMES[(unitIndex * 3) % FIRST_NAMES.length]} ${LAST_NAMES[(unitIndex * 2) % LAST_NAMES.length]}`;
      const prov = PROVINCES_POOL[unitIndex % PROVINCES_POOL.length];
      
      const unitLeader: Member = {
        id: uId,
        memberCode: unitCode,
        name: unitLeaderName,
        nickname: `โค้ช${FIRST_NAMES[(unitIndex * 3) % FIRST_NAMES.length].slice(0, 3)}`,
        avatarUrl: getAvatar(avatarCounter++),
        positionId: 'unit_manager',
        role: 'unit_manager',
        sponsorId: center.id,
        parentMemberId: center.id,
        unitId: `unit_${cIdx + 1}_${u + 1}`,
        centerId: center.centerId,
        regionId: center.regionId,
        joinDate: `2023-0${(unitIndex % 9) + 1}-10`,
        status: 'active',
        phone: `08${(unitIndex + 1).toString().padStart(2, '0')}-123-4567`,
        email: `leader.${unitCode.toLowerCase()}@insure-os.com`,
        location: {
          province: prov.p,
          region: prov.r as any,
          lat: prov.lat + (Math.random() - 0.5) * 0.05,
          lng: prov.lng + (Math.random() - 0.5) * 0.05,
        },
        personalFYC: 22000 + Math.round(Math.random() * 15000),
        personalCOM: 7000 + Math.round(Math.random() * 5000),
        firstYearPremium: 66000 + Math.round(Math.random() * 40000),
        renewalPremium: 150000 + Math.round(Math.random() * 100000),
        separatedUnitsCount: u === 0 ? 1 : 0,
      };

      members.push(unitLeader);

      // ~9-10 agents per unit (to reach ~120 agents total)
      const agentCount = 9 + (unitIndex % 2); // 9 or 10
      for (let a = 0; a < agentCount; a++) {
        const agentNum = a + 1;
        const aId = `mem_agt_${cIdx + 1}_${u + 1}_${agentNum}`;
        const agentCode = `AG-${cIdx + 1}${u + 1}${agentNum.toString().padStart(2, '0')}`;
        const agtFirstName = FIRST_NAMES[(unitIndex * 7 + a * 3) % FIRST_NAMES.length];
        const agtLastName = LAST_NAMES[(unitIndex * 5 + a * 2) % LAST_NAMES.length];
        const statusRand = Math.random();
        const status: 'active' | 'inactive' | 'probation' = statusRand > 0.15 ? 'active' : statusRand > 0.05 ? 'inactive' : 'probation';
        const fyc = status === 'active' ? 12000 + Math.round(Math.random() * 28000) : status === 'probation' ? 6000 : 0;
        const com = Math.round(fyc * 0.32);

        const agent: Member = {
          id: aId,
          memberCode: agentCode,
          name: `${agtFirstName} ${agtLastName}`,
          avatarUrl: getAvatar(avatarCounter++),
          positionId: 'agent',
          role: 'agent',
          sponsorId: unitLeader.id,
          parentMemberId: unitLeader.id,
          unitId: unitLeader.unitId,
          centerId: center.centerId,
          regionId: center.regionId,
          joinDate: `2024-${(a % 12 + 1).toString().padStart(2, '0')}-${(a * 2 + 5).toString().padStart(2, '0')}`,
          status,
          phone: `09${(a + 1).toString().padStart(2, '0')}-987-6543`,
          email: `agent.${agentCode.toLowerCase()}@insure-os.com`,
          location: {
            province: prov.p,
            region: prov.r as any,
            lat: prov.lat + (Math.random() - 0.5) * 0.08,
            lng: prov.lng + (Math.random() - 0.5) * 0.08,
          },
          personalFYC: fyc,
          personalCOM: com,
          firstYearPremium: fyc * 3,
          renewalPremium: Math.round(fyc * (Math.random() * 2 + 1)),
        };

        members.push(agent);
      }

      unitIndex++;
    }
  });

  return members;
}

export const INITIAL_MEMBERS: Member[] = generateFullOrganization();

// 12 Months historical performance trends for Dashboard
export const INITIAL_12_MONTHS_HISTORY: MonthlyPerformanceRecord[] = [
  { month: '2025-09', memberId: 'mem_reg_001', personalFYC: 38000, teamFYC: 1850000, personalCOM: 12000, teamCOM: 590000, firstYearPremium: 5550000, renewalPremium: 12000000, directMembersCount: 4, activeMembersCount: 82, calculatedIncome: 345000 },
  { month: '2025-10', memberId: 'mem_reg_001', personalFYC: 40000, teamFYC: 1980000, personalCOM: 13000, teamCOM: 630000, firstYearPremium: 5940000, renewalPremium: 12200000, directMembersCount: 4, activeMembersCount: 86, calculatedIncome: 368000 },
  { month: '2025-11', memberId: 'mem_reg_001', personalFYC: 42000, teamFYC: 2150000, personalCOM: 13500, teamCOM: 680000, firstYearPremium: 6450000, renewalPremium: 12500000, directMembersCount: 4, activeMembersCount: 92, calculatedIncome: 395000 },
  { month: '2025-12', memberId: 'mem_reg_001', personalFYC: 55000, teamFYC: 2800000, personalCOM: 18000, teamCOM: 890000, firstYearPremium: 8400000, renewalPremium: 13000000, directMembersCount: 4, activeMembersCount: 104, calculatedIncome: 512000 },
  { month: '2026-01', memberId: 'mem_reg_001', personalFYC: 35000, teamFYC: 1920000, personalCOM: 11000, teamCOM: 610000, firstYearPremium: 5760000, renewalPremium: 13100000, directMembersCount: 4, activeMembersCount: 89, calculatedIncome: 355000 },
  { month: '2026-02', memberId: 'mem_reg_001', personalFYC: 39000, teamFYC: 2050000, personalCOM: 12500, teamCOM: 650000, firstYearPremium: 6150000, renewalPremium: 13400000, directMembersCount: 4, activeMembersCount: 94, calculatedIncome: 382000 },
  { month: '2026-03', memberId: 'mem_reg_001', personalFYC: 46000, teamFYC: 2320000, personalCOM: 14800, teamCOM: 740000, firstYearPremium: 6960000, renewalPremium: 13800000, directMembersCount: 4, activeMembersCount: 101, calculatedIncome: 430000 },
  { month: '2026-04', memberId: 'mem_reg_001', personalFYC: 41000, teamFYC: 2180000, personalCOM: 13200, teamCOM: 690000, firstYearPremium: 6540000, renewalPremium: 14000000, directMembersCount: 4, activeMembersCount: 97, calculatedIncome: 405000 },
  { month: '2026-05', memberId: 'mem_reg_001', personalFYC: 44000, teamFYC: 2410000, personalCOM: 14000, teamCOM: 770000, firstYearPremium: 7230000, renewalPremium: 14300000, directMembersCount: 4, activeMembersCount: 106, calculatedIncome: 448000 },
  { month: '2026-06', memberId: 'mem_reg_001', personalFYC: 48000, teamFYC: 2590000, personalCOM: 15500, teamCOM: 820000, firstYearPremium: 7770000, renewalPremium: 14700000, directMembersCount: 4, activeMembersCount: 112, calculatedIncome: 480000 },
  { month: '2026-07', memberId: 'mem_reg_001', personalFYC: 43000, teamFYC: 2480000, personalCOM: 13800, teamCOM: 790000, firstYearPremium: 7440000, renewalPremium: 15000000, directMembersCount: 4, activeMembersCount: 109, calculatedIncome: 462000 },
  { month: '2026-08', memberId: 'mem_reg_001', personalFYC: 45000, teamFYC: 2650000, personalCOM: 14500, teamCOM: 840000, firstYearPremium: 7950000, renewalPremium: 15300000, directMembersCount: 4, activeMembersCount: 115, calculatedIncome: 494000 },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log_001',
    timestamp: '2026-08-28T05:00:00.000Z',
    userId: 'usr_admin',
    userName: 'Super Admin',
    action: 'INITIALIZE_PLAN',
    entityType: 'plan_version',
    entityId: 'plan_2021_01_15',
    oldValue: 'None',
    newValue: 'Compensation Plan 2021-01-15 (Standard Update 15 Jan 64)',
    reason: 'นำเข้าโครงสร้างผลตอบแทนมาตรฐานตามประกาศ 15 ม.ค. 64',
  },
  {
    id: 'log_002',
    timestamp: '2026-08-28T05:10:00.000Z',
    userId: 'usr_admin',
    userName: 'Super Admin',
    action: 'POPULATE_ORGANIZATION',
    entityType: 'member',
    entityId: 'mem_reg_001',
    oldValue: '0 members',
    newValue: '125 members (1 RM, 4 CM, 12 UM, 108 AG)',
    reason: 'สร้างโครงสร้างเครือข่ายตัวแทน 4 ภูมิภาค',
  },
];
