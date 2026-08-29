/**
 * Vercel Database sync utility
 * ------------------------------------------------------------------
 * Stores every member (new + existing on registration) into a Vercel-backed
 * store. Supports two backends automatically based on available env vars:
 *
 *   1. Vercel Postgres  – requires DATABASE_URL  (libsql/postgres connection string)
 *   2. Vercel KV         – requires KV_REST_API_URL + KV_REST_API_TOKEN
 *
 * If neither is configured the functions become no-ops so the app still works
 * in-memory. All errors are swallowed – registration must never fail because of DB.
 */
import type { Member, AuthUser } from '../types';

interface StoredMember {
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

function toStored(member: Member, user?: AuthUser): StoredMember {
  return {
    memberId: member.id,
    memberCode: member.memberCode,
    name: member.name,
    nickname: member.nickname,
    email: user?.email,
    phone: user?.phone,
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

/* ---------------- Postgres (Vercel Postgres) ---------------- */
let pgClient: any = null;
let pgInit: Promise<any> | null = null;

async function getPg() {
  if (pgInit) return pgInit;
  pgInit = (async () => {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL not set');
    const { Client } = await import('pg');
    const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
    await c.connect();
    // ensure table exists
    await c.query(`
      CREATE TABLE IF NOT EXISTS members (
        member_id TEXT PRIMARY KEY,
        member_code TEXT,
        name TEXT,
        nickname TEXT,
        email TEXT,
        phone TEXT,
        position_id TEXT,
        role TEXT,
        sponsor_id TEXT,
        join_date TEXT,
        status TEXT,
        personal_com NUMERIC DEFAULT 0,
        personal_fyc NUMERIC DEFAULT 0,
        province TEXT,
        registered_at TEXT
      );
    `);
    return c;
  })();
  return pgInit;
}

async function upsertPg(member: Member, user?: AuthUser) {
  const c = await getPg();
  const s = toStored(member, user);
  await c.query(
    `INSERT INTO members (member_id, member_code, name, nickname, email, phone, position_id, role, sponsor_id, join_date, status, personal_com, personal_fyc, province, registered_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
     ON CONFLICT (member_id) DO UPDATE SET
       member_code=EXCLUDED.member_code, name=EXCLUDED.name, email=EXCLUDED.email,
       phone=EXCLUDED.phone, position_id=EXCLUDED.position_id, status=EXCLUDED.status,
       registered_at=EXCLUDED.registered_at;`,
    [s.memberId, s.memberCode, s.name, s.nickname, s.email, s.phone, s.positionId, s.role, s.sponsorId, s.joinDate, s.status, s.personalCOM, s.personalFYC, s.province, s.registeredAt]
  );
}

/* ---------------- KV (Vercel KV) ---------------- */
async function upsertKv(member: Member, user?: AuthUser) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) throw new Error('KV not configured');
  const s = toStored(member, user);
  const res = await fetch(`${url}/set/member:${member.id}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(s),
  });
  if (!res.ok) throw new Error(`KV set failed ${res.status}`);
}

export async function saveMemberToVercel(member: Member, user?: AuthUser): Promise<void> {
  try {
    if (process.env.DATABASE_URL) {
      await upsertPg(member, user);
    } else if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      await upsertKv(member, user);
    }
    // else: nothing configured – skip silently
  } catch (e: any) {
    console.warn('[vercelDb] skip save:', e?.message || e);
  }
}
