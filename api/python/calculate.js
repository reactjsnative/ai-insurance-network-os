// Network Success — Thai Life Compensation Engine (live Python calculation)
// Vercel serverless function. Node runtime (Linux) ships python3.
import { spawn } from 'child_process';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const payload = req.body || {};
  const py = spawn('python3', ['thai_life_compensation.py', '--json'], {
    env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
    cwd: process.cwd(),
  });

  let outputData = '';
  let errorData = '';

  py.stdout.on('data', (d) => {
    outputData += d.toString();
  });
  py.stderr.on('data', (d) => {
    errorData += d.toString();
  });
  py.on('close', (code) => {
    if (code !== 0) {
      return res.status(500).json({ error: errorData || `Python process exited with code ${code}` });
    }
    try {
      res.json({ success: true, engine: 'Python', data: JSON.parse(outputData) });
    } catch (e) {
      res.status(500).json({ error: 'Failed to parse Python JSON output', raw: outputData });
    }
  });

  py.stdin.write(JSON.stringify(payload));
  py.stdin.end();
}
