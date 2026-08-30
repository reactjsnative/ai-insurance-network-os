// "My Plan" video summary generator — NOT available on Vercel.
//
// The real implementation (server.ts -> server_video.py) requires Python +
// ffmpeg + edge-tts + Pillow, which Vercel's serverless runtime cannot run.
// This stub returns a clear JSON error so the frontend shows a friendly
// message instead of a raw "not valid JSON" parse failure.
export default function handler(_req, res) {
  return res.status(501).json({
    ok: false,
    error: 'ฟีเจอร์สร้างวิดีโอแผนต้องใช้ Python + ffmpeg ซึ่ง Vercel ไม่รองรับ — รันบนเครื่องของคุณด้วยคำสั่ง `npm run dev` เพื่อสร้างวิดีโอแผนของฉันได้',
  });
}
