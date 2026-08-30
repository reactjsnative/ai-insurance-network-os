// Read members from Google Sheets (server-side). Requires:
//   GOOGLE_SHEET_ID                – target spreadsheet id
//   GOOGLE_SHEETS_CREDENTIALS_JSON – service-account JSON as a single-line string
import { getAdmin } from '../_lib.js';

export default async function handler(_req, res) {
  try {
    const creds = process.env.GOOGLE_SHEETS_CREDENTIALS_JSON;
    const sheetId = process.env.GOOGLE_SHEET_ID;
    if (!creds || !sheetId) {
      return res.status(503).json({ ok: false, error: 'Google Sheets not configured', configured: false });
    }

    const { google } = await import('googleapis');
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(creds),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    const resp = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Members!A:O',
    });

    const rows = resp.data.values || [];
    if (rows.length === 0) return res.json({ ok: true, count: 0, members: [] });
    const header = rows[0].map((h) => String(h).trim());
    const members = rows.slice(1).map((r) => {
      const obj = {};
      header.forEach((h, i) => { obj[h] = r[i] ?? ''; });
      return obj;
    });
    return res.json({ ok: true, count: members.length, members });
  } catch (e) {
    return res.status(502).json({
      ok: false,
      error: e?.message || 'read sheet failed',
      configured: Boolean(process.env.GOOGLE_SHEET_ID && process.env.GOOGLE_SHEETS_CREDENTIALS_JSON),
    });
  }
}
