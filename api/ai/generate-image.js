export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, size, quality, n } = req.body || {};
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Missing "prompt" (string).' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ error: 'OPENAI_API_KEY is not configured on the server.' });
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 120000);
    let data;
    try {
      const r = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-image-1',
          prompt,
          size: size || '1024x1024',
          quality: quality || 'auto',
          n: n || 1,
        }),
        signal: controller.signal,
      });
      const text = await r.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }
      if (!r.ok) {
        return res.status(r.status).json({ error: data?.error?.message || 'OpenAI image generation failed', detail: data });
      }
    } catch (e) {
      return res.status(504).json({ error: e?.name === 'AbortError' ? 'OpenAI request timed out' : e?.message });
    } finally {
      clearTimeout(timer);
    }

    const item = data?.data?.[0];
    if (!item) {
      return res.status(502).json({ error: 'OpenAI returned no image data', detail: data });
    }
    if (item.b64_json) {
      return res.json({ ok: true, image: `data:image/png;base64,${item.b64_json}`, revisedPrompt: item.revised_prompt || prompt });
    }
    if (item.url) {
      return res.json({ ok: true, image: item.url, revisedPrompt: item.revised_prompt || prompt });
    }
    return res.status(502).json({ error: 'Unexpected OpenAI response shape', detail: data });
  } catch (e) {
    console.error('generate-image error:', e);
    return res.status(500).json({ error: e?.message });
  }
}
