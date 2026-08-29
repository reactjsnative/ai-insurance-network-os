/**
 * Google Sheets sync utility
 * ------------------------------------------------------------------
 * Appends a member row to a Google Sheet whenever a new member registers.
 * Credentials are read from environment variables (never hardcoded):
 *   GOOGLE_SHEET_ID                 – the target spreadsheet id
 *   GOOGLE_SHEETS_CREDENTIALS_JSON  – a service-account JSON, as a single-line string
 *
 * If either variable is missing the functions become no-ops (the app keeps
 * working in-memory), so registration never breaks when Sheets isn't configured.
 */
import type { Member, AuthUser } from '../types';

let cachedClient: any = null;
let cacheError: string | null = null;

async function getSheets() {
  if (cacheError) throw new Error(cacheError);
  if (cachedClient) return cachedClient;

  const creds = process.env.GOOGLE_SHEETS_CREDENTIALS_JSON;
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!creds || !sheetId) {
    cacheError = 'Google Sheets not configured (missing env)';
    throw new Error(cacheError);
  }

  // googleapis is optional – only loaded when configured
  const { google } = await import('googleapis');
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(creds),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  cachedClient = { sheets: google.sheets({ version: 'v4', auth }), sheetId };
  return cachedClient;
}

const HEADERS = [
  'memberId', 'memberCode', 'name', 'nickname', 'email', 'phone',
  'positionId', 'role', 'sponsorId', 'joinDate', 'status',
  'personalCOM', 'personalFYC', 'province', 'registeredAt',
];

export async function appendMemberToSheet(member: Member, user?: AuthUser): Promise<void> {
  try {
    const { sheets, sheetId } = await getSheets();
    const row = [
      member.id,
      member.memberCode,
      member.name,
      member.nickname ?? '',
      user?.email ?? '',
      user?.phone ?? '',
      member.positionId,
      member.role,
      member.sponsorId,
      member.joinDate,
      member.status,
      member.personalCOM ?? 0,
      member.personalFYC ?? 0,
      member.location?.province ?? '',
      new Date().toISOString(),
    ];
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Members!A:O',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [row] },
    });
  } catch (e: any) {
    // Never break registration because of Sheets failure
    console.warn('[sheetsSync] skip append:', e?.message || e);
  }
}

export async function readMembersFromSheet(): Promise<any[]> {
  try {
    const { sheets, sheetId } = await getSheets();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Members!A:O',
    });
    const rows: any[][] = res.data.values || [];
    if (rows.length === 0) return [];
    const header = rows[0].map((h: string) => h.trim());
    return rows.slice(1).map((r: any[]) => {
      const obj: any = {};
      header.forEach((h: string, i: number) => { obj[h] = r[i] ?? ''; });
      return obj;
    });
  } catch (e: any) {
    console.warn('[sheetsSync] read failed:', e?.message || e);
    throw e;
  }
}

export function ensureSheetHeaders(): void {
  // Best-effort: create header row if sheet is empty. Safe to call once on boot.
  getSheets()
    .then(async ({ sheets, sheetId }: any) => {
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: 'Members!A1:O1',
      });
      if (!res.data.values || res.data.values.length === 0) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: sheetId,
          range: 'Members!A1:O1',
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: [HEADERS] },
        });
      }
    })
    .catch(() => { /* not configured – ignore */ });
}
