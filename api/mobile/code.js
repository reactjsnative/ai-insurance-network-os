// Network Success — serve raw mobile/ThaiLifeCompensationScreen.tsx source
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const code = fs.readFileSync(path.join(process.cwd(), 'mobile/ThaiLifeCompensationScreen.tsx'), 'utf8');
    res.json({ filename: 'ThaiLifeCompensationScreen.tsx', language: 'typescript', code });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
