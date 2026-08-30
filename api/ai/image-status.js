export default function handler(_req, res) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.json({ configured: false, message: 'OPENAI_API_KEY not set on server.' });
  }
  return res.json({ configured: true, model: 'gpt-image-1' });
}
