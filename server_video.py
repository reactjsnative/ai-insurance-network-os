import json, sys, os, subprocess, time, re, asyncio, edge_tts
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1920
OUT_DIR = Path(r"C:/Users/User/Downloads/ai-insurance-network-os/server_videos")
OUT_DIR.mkdir(parents=True, exist_ok=True)
FONT = r"C:/Windows/Fonts/AngsanaNew-Bold-02.ttf"
FONT_REG = r"C:/Windows/Fonts/AngsanaNew-01.ttf"

def font(sz, bold=True):
    return ImageFont.truetype(FONT if bold else FONT_REG, sz)

def wrap_thai(text, max_chars):
    out = []
    for line in text.split("\n"):
        line = line.strip()
        if not line:
            out.append("")
            continue
        out.extend([line[i:i+max_chars] for i in range(0, len(line), max_chars)])
    return out

def gradient(w, h, top, bottom):
    base = Image.new("RGB", (w, h), top)
    ov = Image.new("RGB", (w, h), bottom)
    mask = Image.new("L", (w, h))
    md = mask.load()
    for y in range(h):
        md[0, y] = int(255 * (y / h))
    base.paste(ov, (0, 0), mask)
    return base

def draw_scene(scene, idx, total, accent, footer=None):
    img = gradient(W, H, (15, 23, 42), (49, 18, 58))
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, 14], fill=accent)

    title_lines = wrap_thai(scene.get("title", ""), 22)
    tf = font(64)
    y = 220
    for ln in title_lines[:4]:
        bb = d.textbbox((0, 0), ln, font=tf)
        tw = bb[2] - bb[0]
        d.text(((W - tw) // 2, y), ln, font=tf, fill="#ffffff")
        y += 90

    y += 20
    d.rounded_rectangle([W//2 - 120, y, W//2 + 120, y + 8], radius=4, fill=accent)

    body_lines = wrap_thai(scene.get("body", ""), 26)
    bf = font(46, bold=False)
    total_h = len(body_lines) * 64
    y = H // 2 - total_h // 2 + 120
    for ln in body_lines:
        bb = d.textbbox((0, 0), ln, font=bf)
        tw = bb[2] - bb[0]
        d.text(((W - tw) // 2, y), ln, font=bf, fill="#e2e8f0")
        y += 64

    # Footer link (bottom safe zone) — drawn on every scene
    if footer:
        fy = H - 90
        d.rounded_rectangle([40, fy - 18, W - 40, fy + 18], radius=10,
                            fill=(15, 23, 42), outline=accent, width=2)
        ff = font(34)
        bb = d.textbbox((0, 0), footer, font=ff)
        tw = bb[2] - bb[0]
        d.text(((W - tw) // 2, fy), footer, font=ff, fill=accent, anchor="mm")
    else:
        ff = font(30)
        d.text((W//2, H - 120), "AI Insurance Network OS — แผนของฉัน", font=ff, fill=accent, anchor="mm")
        d.text((W//2, H - 80), f"สไลด์ {idx+1}/{total}", font=font(26, False), fill="#94a3b8", anchor="mm")

    p = OUT_DIR / f"scene_{idx:03d}.png"
    img.save(p)
    return p

async def tts(text, out_wav, voice):
    for attempt in range(3):
        try:
            comm = edge_tts.Communicate(text, voice)
            await comm.save(str(out_wav))
            return True
        except Exception as e:
            print(f"TTS fail {attempt+1}: {e}", file=sys.stderr)
            time.sleep(2)
    return False

def audio_len(wav):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                        "-of", "json", str(wav)], capture_output=True, text=True)
    m = re.search(r'"duration":\s*"([\d.]+)"', r.stdout)
    return float(m.group(1)) if m else 0.0

def main():
    data = json.load(sys.stdin)
    scenes = data.get("scenes", [])
    accent = data.get("accent", "#f472b6")
    voice = data.get("voice", "th-TH-PremwadeeNeural")
    name = data.get("name", "my_plan")
    footer = data.get("footer", None)
    token = re.sub(r'[^a-zA-Z0-9]', '', name) or "plan"
    work = OUT_DIR / token
    work.mkdir(exist_ok=True)

    list_lines = []
    for i, scene in enumerate(scenes):
        png = draw_scene(scene, i, len(scenes), accent, footer)
        wav = work / f"scene_{i:03d}.wav"
        ok = asyncio.run(tts(f"{scene.get('title','')} {scene.get('body','')}", wav, voice))
        dur = scene.get("duration", 4)
        if ok:
            dur = max(dur, audio_len(wav) + 0.8)
        silent = work / f"scene_{i:03d}_s.mp4"
        subprocess.run(["ffmpeg", "-y", "-loop", "1", "-i", str(png), "-t", str(dur),
                        "-r", "30", "-pix_fmt", "yuv420p", "-c:v", "libx264",
                        "-preset", "veryfast", "-movflags", "+faststart", str(silent)],
                       capture_output=True)
        clip = work / f"scene_{i:03d}.mp4"
        if ok:
            subprocess.run(["ffmpeg", "-y", "-i", str(silent), "-i", str(wav),
                            "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", str(clip)],
                           capture_output=True)
        else:
            clip = silent
        list_lines.append(f"file '{clip.resolve().as_posix()}'")
        time.sleep(0.2)

    (work / "list.txt").write_text("\n".join(list_lines), encoding="utf-8")
    combined = work / "combined.mp4"
    subprocess.run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(work / "list.txt"),
                    "-c", "copy", combined], capture_output=True)
    final = OUT_DIR / f"{token}.mp4"
    subprocess.run(["ffmpeg", "-y", "-i", str(combined), "-c:v", "libx264", "-preset", "veryfast",
                    "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k",
                    "-movflags", "+faststart", str(final)], capture_output=True)
    print(str(final.resolve().as_posix()))

if __name__ == "__main__":
    main()
