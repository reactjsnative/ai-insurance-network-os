// Network Success — serve raw thai_life_compensation.py source
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const code = fs.readFileSync(path.join(process.cwd(), 'thai_life_compensation.py'), 'utf8');
    res.json({ filename: 'thai_life_compensation.py', language: 'python', code });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
