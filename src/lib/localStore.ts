/**
 * Member capture client helper (browser-safe)
 * ------------------------------------------------------------------
 * Runs in the browser. It POSTs the new member to the server
 * (/api/members) which persists it to server_data/members.json and also
 * fans out to Google Sheets / Vercel DB (when configured). No Node APIs here.
 */
export interface StoredMemberRow {
  memberId: string;
  memberCode: string;
  name: string;
  nickname?: string;
  email?: string;
  phone?: string;
  positionId: string;
  role: string;
  sponsorId: string;
  joinDate: string;
  status: string;
  personalCOM: number;
  personalFYC: number;
  province?: string;
  registeredAt: string;
}

export function toStoredRow(member: any, user?: any): StoredMemberRow {
  return {
    memberId: member.id,
    memberCode: member.memberCode,
    name: member.name,
    nickname: member.nickname,
    email: user?.email || member.email,
    phone: user?.phone || member.phone,
    positionId: member.positionId,
    role: member.role,
    sponsorId: member.sponsorId,
    joinDate: member.joinDate,
    status: member.status,
    personalCOM: member.personalCOM ?? 0,
    personalFYC: member.personalFYC ?? 0,
    province: member.location?.province,
    registeredAt: new Date().toISOString(),
  };
}

export async function saveMemberLocal(row: StoredMemberRow): Promise<void> {
  try {
    await fetch('/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(row),
    });
  } catch (e: any) {
    console.warn('[localStore] POST /api/members failed:', e?.message || e);
  }
}
