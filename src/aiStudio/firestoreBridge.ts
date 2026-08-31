import { collection, onSnapshot, setDoc, doc, deleteDoc, Unsubscribe } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Member as SimMember, PositionLevel } from './types';
import { Member as MainMember } from '../types';

/**
 * Bridge between the main app's Firestore member DB (MainMember shape)
 * and the AI Studio "Income Simulator" (SimMember shape).
 *
 * The simulator is a *view* over the same `members` collection used by the
 * rest of the app, so data stays consistent across the whole system.
 */

export function positionIdToLevel(positionId: string): PositionLevel {
  switch (positionId) {
    case 'unit_manager':
    case 'senior_unit_manager':
      return 'UNIT_MANAGER';
    case 'center_manager':
    case 'senior_center_manager':
      return 'CENTER_MANAGER';
    case 'region_manager':
    case 'executive_region':
    case 'national_leader':
      return 'GROUP_MANAGER';
    case 'agent':
    default:
      return 'AGENT';
  }
}

export function levelToPositionId(level: PositionLevel): string {
  switch (level) {
    case 'UNIT_MANAGER':
      return 'unit_manager';
    case 'CENTER_MANAGER':
      return 'center_manager';
    case 'GROUP_MANAGER':
      return 'region_manager';
    case 'AGENT':
    default:
      return 'agent';
  }
}

const roleForPosition = (level: PositionLevel): string => {
  switch (level) {
    case 'GROUP_MANAGER':
      return 'regional_manager';
    case 'CENTER_MANAGER':
      return 'center_manager';
    case 'UNIT_MANAGER':
      return 'unit_manager';
    default:
      return 'agent';
  }
};

/** Map a main-app member (Firestore doc) into the simulator's member shape. */
export function toSimMember(m: MainMember): SimMember {
  const position = positionIdToLevel(m.positionId);
  return {
    id: m.id,
    code: m.memberCode || m.id,
    name: m.name || 'ไม่ระบุชื่อ',
    nickname: m.nickname,
    avatarUrl: m.avatarUrl,
    position,
    parentId: m.parentMemberId || null,
    directUnitCount: m.separatedUnitsCount ?? 0,
    directCenterCount: m.separatedCentersCount ?? 0,
    directGroupCount: m.separatedRegionsCount ?? 0,
    personalMonthlySales: m.firstYearPremium ?? 0,
    personalMonthlyCom: m.personalCOM ?? 0,
    personalMonthlyFyc: m.personalFYC ?? 0,
    personalRenewalPremium: m.renewalPremium ?? 0,
    personalAnnualFyc: Math.round((m.personalFYC ?? 0) * 12),
    personalAnnualCom: Math.round((m.personalCOM ?? 0) * 12),
    monthlyGoalIncome: 0,
    annualGoalIncome: 0,
    monthlyGoalFyc: 0,
    annualGoalFyc: 0,
    startDate: m.joinDate || '',
    tenureMonths: 0,
    isActive: m.status === 'active',
    notes: undefined,
    region: m.location?.region || m.location?.province || undefined,
    isNewCenter: false,
  };
}

/** Map simulator member → a partial main-app doc for Firestore write-back (merge). */
export function simToMainDoc(s: SimMember): Partial<MainMember> & { id: string } {
  const positionId = levelToPositionId(s.position);
  return {
    id: s.id,
    memberCode: s.code,
    name: s.name,
    nickname: s.nickname,
    avatarUrl: s.avatarUrl || '',
    positionId,
    role: roleForPosition(s.position) as MainMember['role'],
    sponsorId: null,
    parentMemberId: s.parentId,
    unitId: null,
    centerId: null,
    regionId: null,
    personalFYC: s.personalMonthlyFyc ?? 0,
    personalCOM: s.personalMonthlyCom ?? 0,
    firstYearPremium: s.personalMonthlySales ?? 0,
    renewalPremium: s.personalRenewalPremium ?? 0,
    separatedUnitsCount: s.directUnitCount ?? 0,
    separatedCentersCount: s.directCenterCount ?? 0,
    separatedRegionsCount: s.directGroupCount ?? 0,
    joinDate: s.startDate || new Date().toISOString().slice(0, 10),
    status: s.isActive ? 'active' : 'inactive',
    location: {
      province: s.region || '',
      region: 'Bangkok & Metro',
      lat: 0,
      lng: 0,
    },
  };
}

/** Subscribe to the shared Firestore `members` collection, mapped to simulator shape. */
export function subscribeMembers(cb: (members: SimMember[], connected: boolean) => void): Unsubscribe {
  return onSnapshot(
    collection(db, 'members'),
    (snapshot) => {
      const mapped: SimMember[] = snapshot.docs.map((d) => toSimMember(d.data() as MainMember));
      cb(mapped, true);
    },
    (error) => {
      console.warn('Income Simulator: Firestore members listener error', error);
      cb([], false);
    }
  );
}

/** Write a simulator member back to Firestore (merge, preserving main-app fields). */
export async function persistMember(s: SimMember): Promise<void> {
  try {
    const data = simToMainDoc(s);
    await setDoc(doc(db, 'members', s.id), data, { merge: true });
  } catch (err) {
    console.warn('Income Simulator: persist member failed', err);
  }
}

/** Remove a member from Firestore. */
export async function removeMember(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'members', id));
  } catch (err) {
    console.warn('Income Simulator: remove member failed', err);
  }
}
