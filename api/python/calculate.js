// Network Success — Thai Life Compensation Engine
// Tries python3 (dev/rich runtimes); falls back to a faithful JS port of
// thai_life_compensation.py so the endpoint never hangs or crashes on Vercel.
import { spawn } from 'child_process';

const round2 = (n) => Math.round(n * 100) / 100;

// ---- JS port of thai_life_compensation.py (13 benefit items + promotion) ----
function promotionStatus(pos, fyc, units, centers) {
  let target, reqFyc = 0, reqUnits = 0, reqCenters = 0, reqPeriod = '';
  if (pos === 'agent') {
    target = 'ผู้บริหารหน่วย (Unit Manager)'; reqFyc = 20000; reqUnits = 0; reqCenters = 0; reqPeriod = '1-6 เดือน';
  } else if (pos === 'unit_manager' || pos === 'senior_unit_manager') {
    target = 'ผู้บริหารศูนย์ (Center Manager)'; reqFyc = 75000; reqUnits = 2; reqCenters = 0; reqPeriod = '3-6 เดือน';
  } else if (pos === 'center_manager' || pos === 'senior_center_manager') {
    target = 'ผู้บริหารภาค (Regional Manager)'; reqFyc = 1200000; reqUnits = 0; reqCenters = 4; reqPeriod = '12-24 เดือน';
  } else {
    return {
      current_position: pos, target_position: 'ตำแหน่งสูงสุดของโครงสร้างหลัก (Executive Regional Director)',
      is_eligible: true, fyc_progress_pct: 100, units_progress_pct: 100, centers_progress_pct: 100,
      overall_progress_pct: 100, gap_fyc: 0, gap_units: 0, gap_centers: 0,
      summary_text: 'ดำรงตำแหน่งระดับผู้บริหารภาคแล้ว',
    };
  }
  const fycPct = reqFyc > 0 ? Math.min(100, (fyc / reqFyc) * 100) : 100;
  const unitsPct = reqUnits > 0 ? Math.min(100, (units / reqUnits) * 100) : 100;
  const centersPct = reqCenters > 0 ? Math.min(100, (centers / reqCenters) * 100) : 100;
  const gapFyc = Math.max(0, reqFyc - fyc);
  const gapUnits = Math.max(0, reqUnits - units);
  const gapCenters = Math.max(0, reqCenters - centers);
  const isEligible = gapFyc === 0 && gapUnits === 0 && gapCenters === 0;
  let overallPct;
  if (reqUnits > 0 && reqCenters > 0) overallPct = fycPct * 0.4 + unitsPct * 0.3 + centersPct * 0.3;
  else if (reqUnits > 0) overallPct = fycPct * 0.6 + unitsPct * 0.4;
  else if (reqCenters > 0) overallPct = fycPct * 0.6 + centersPct * 0.4;
  else overallPct = fycPct;

  let summaryText;
  if (isEligible) {
    summaryText = `คุณสมบัติครบถ้วนพร้อมรับการแต่งตั้งเป็น '${target}'`;
  } else {
    const parts = [];
    if (gapFyc > 0) parts.push(`ต้องการผลงานบำเหน็จอีก ฿${gapFyc.toLocaleString('th-TH')} บาท`);
    if (gapUnits > 0) parts.push(`ต้องการแยกหน่วยเพิ่ม ${gapUnits} หน่วย`);
    if (gapCenters > 0) parts.push(`ต้องการแยกศูนย์เพิ่ม ${gapCenters} ศูนย์`);
    parts.push(`กรอบเวลาเกณฑ์มาตรฐาน: ${reqPeriod}`);
    summaryText = parts.join(' • ');
  }
  return {
    current_position: pos, target_position: target, required_fyc: reqFyc, current_fyc: fyc,
    fyc_progress_pct: round2(fycPct), required_units: reqUnits, current_units: units,
    units_progress_pct: round2(unitsPct), required_centers: reqCenters, current_centers: centers,
    centers_progress_pct: round2(centersPct), overall_progress_pct: round2(overallPct),
    gap_fyc: gapFyc, gap_units: gapUnits, gap_centers: gapCenters, required_period: reqPeriod,
    is_eligible: isEligible, summary_text: summaryText,
  };
}

function calculateThaiLifeIncome(params = {}) {
  const p = {
    position_id: 'region_manager', personal_fyc: 30000, personal_com: 30000,
    team_fyc: 250000, team_com: 75000, renewal_premium: 300000,
    separated_units: 5, separated_centers: 3, separated_regions: 1,
    annual_fyc: null, annual_com: null, center_fyc_list: null, center_com_list: null,
    is_senior_region: false, region_separation_option: 2,
    ...params,
  };
  const pos = String(p.position_id || 'region_manager').toLowerCase();
  const calcAnnualFyc = p.annual_fyc ?? p.team_fyc * 12;
  const calcAnnualCom = p.annual_com ?? p.team_com * 12;
  const breakdown = [];

  // 1. Personal commission (ทุกตำแหน่ง)
  breakdown.push({ category: 'personal', amount: Math.max(0, p.personal_com) });

  // 2. ผู้บริหารหน่วย (UM)+
  if (['unit_manager', 'center_manager', 'region_manager', 'senior_unit_manager', 'senior_center_manager', 'executive_region'].includes(pos)) {
    let uRate = 0;
    if (p.team_com >= 35000) uRate = 0.40;
    else if (p.team_com >= 20000) uRate = 0.35;
    else if (p.team_com >= 10000) uRate = 0.30;
    else if (p.team_com >= 5000) uRate = 0.25;
    breakdown.push({ category: 'unit', amount: round2(p.team_com * uRate) });
    breakdown.push({ category: 'unit', amount: (Math.max(0, parseInt(p.separated_units, 10) || 0)) * 2000 });
  }

  // 3. ผู้บริหารศูนย์ (CM)+
  if (['center_manager', 'region_manager', 'senior_center_manager', 'executive_region'].includes(pos)) {
    let c1 = 0;
    if (p.team_com >= 120000) c1 = 0.30;
    else if (p.team_com >= 60000) c1 = 0.25;
    else if (p.team_com >= 30000) c1 = 0.20;
    else if (p.team_com >= 15000) c1 = 0.15;
    breakdown.push({ category: 'center', amount: round2(p.team_com * c1) });
    breakdown.push({ category: 'center', amount: round2(Math.max(0, p.renewal_premium) * 0.008) });
    let c3 = 0;
    if (p.team_com >= 120000) c3 = 15000;
    else if (p.team_com >= 60000) c3 = 11000;
    else if (p.team_com >= 30000) c3 = 8000;
    else if (p.team_com >= 15000) c3 = 5000;
    breakdown.push({ category: 'center', amount: c3 });
    // ค่าแยกศูนย์
    const cCount = Math.max(0, parseInt(p.separated_centers, 10) || 0);
    let cSep = 0;
    if (cCount > 0) {
      const base = cCount * 4000;
      let ongoing = 0;
      if (p.team_com >= 15000) {
        const coms = p.center_com_list && p.center_com_list.length >= cCount ? p.center_com_list : Array(cCount).fill(30000);
        for (let i = 0; i < cCount; i++) {
          const c = coms[i];
          if (c >= 120000) ongoing += 3000;
          else if (c >= 60000) ongoing += 2500;
          else if (c >= 30000) ongoing += 2000;
          else if (c >= 15000) ongoing += 1500;
        }
      }
      cSep = base + ongoing;
    }
    breakdown.push({ category: 'center', amount: cSep });
    // โบนัสศูนย์รายปี (เฉลี่ยรายเดือน)
    let cbRate = 0;
    if (calcAnnualCom >= 600000) cbRate = 0.06;
    else if (calcAnnualCom >= 300000) cbRate = 0.05;
    else if (calcAnnualCom >= 150000) cbRate = 0.04;
    breakdown.push({ category: 'bonus', amount: round2(round2(calcAnnualCom * cbRate) / 12) });
  }

  // 4. ผู้บริหารภาค (RM)+
  if (['region_manager', 'executive_region', 'national_leader'].includes(pos)) {
    let r1Rate = 0;
    if (p.team_fyc >= 300000) r1Rate = p.is_senior_region ? 0.18 : 0.16;
    else if (p.team_fyc >= 240000) r1Rate = 0.16;
    else if (p.team_fyc >= 180000) r1Rate = 0.14;
    else if (p.team_fyc >= 120000) r1Rate = 0.12;
    else if (p.team_fyc >= 60000) r1Rate = 0.10;
    const r1Amt = round2(p.team_fyc * r1Rate);
    breakdown.push({ category: 'region', amount: r1Amt });
    // ค่าจัดงานภาค T2 (รายศูนย์)
    const centers = p.center_fyc_list && p.center_fyc_list.length ? p.center_fyc_list : [60000, 60000, 30000, 30000];
    let r2 = 0;
    for (const fyc of centers) {
      if (fyc >= 120000) r2 += 2500;
      else if (fyc >= 60000) r2 += 2000;
      else if (fyc >= 30000) r2 += 1500;
      else if (fyc >= 15000) r2 += 1000;
    }
    breakdown.push({ category: 'region', amount: r2 });
    // ค่าแยกภาค
    const rCount = Math.max(0, parseInt(p.separated_regions, 10) || 0);
    let rSep = 0;
    if (rCount > 0) {
      const opt = parseInt(p.region_separation_option, 10) || 2;
      if (opt === 1) rSep = rCount * 8000;
      else if (opt === 2) rSep = rCount * 4000;
      else rSep = round2(rCount * (r1Amt * 0.40));
    }
    breakdown.push({ category: 'region', amount: rSep });
    // ค่าบริหารเป้าหมาย
    let tm = 0;
    if (calcAnnualFyc >= 5000000) tm = 30000;
    else if (calcAnnualFyc >= 4000000) tm = 25000;
    else if (calcAnnualFyc >= 3000000) tm = 20000;
    else if (calcAnnualFyc >= 2000000) tm = 15000;
    else if (calcAnnualFyc >= 1500000) tm = 10000;
    breakdown.push({ category: 'region', amount: tm });
    // โบนัสภาครายปี (เฉลี่ยรายเดือน)
    let rbRate = 0;
    if (calcAnnualFyc >= 2000000) rbRate = 0.025;
    else if (calcAnnualFyc >= 1000000) rbRate = 0.020;
    else if (calcAnnualFyc >= 500000) rbRate = 0.015;
    breakdown.push({ category: 'bonus', amount: round2(round2(calcAnnualFyc * rbRate) / 12) });
  }

  const total = round2(breakdown.reduce((s, i) => s + i.amount, 0));
  const summary = { personal: 0, unit: 0, center: 0, region: 0, bonus: 0 };
  for (const i of breakdown) summary[i.category] = round2(summary[i.category] + i.amount);

  const names = {
    agent: 'ตัวแทน (Agent)',
    unit_manager: 'ผู้บริหารหน่วย (Unit Manager - UM)',
    center_manager: 'ผู้บริหารศูนย์ (Center Manager - CM)',
    region_manager: 'ผู้บริหารภาค (Regional Manager - RM)',
  };
  const accFyc = pos === 'center_manager' ? calcAnnualFyc : p.team_fyc;
  const prom = promotionStatus(pos, accFyc, Math.max(0, parseInt(p.separated_units, 10) || 0), Math.max(0, parseInt(p.separated_centers, 10) || 0));

  return {
    position_id: pos,
    position_name_th: names[pos] || 'ผู้บริหาร (Leader)',
    total_monthly_income: total,
    annualized_run_rate: round2(total * 12),
    summary_by_category: summary,
    promotion_status: prom,
  };
}

// ---- Vercel handler ----
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const payload = req.body || {};

  // Try real Python engine first (fast local/dev), fall back to JS port.
  const result = await new Promise((resolve) => {
    let settled = false;
    const done = (val) => { if (!settled) { settled = true; resolve(val); } };

    let py;
    try {
      py = spawn('python3', ['thai_life_compensation.py', '--json'], {
        env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
        cwd: process.cwd(),
      });
    } catch (e) {
      return done({ ok: false });
    }

    const timer = setTimeout(() => {
      try { py.kill(); } catch { /* ignore */ }
      done({ ok: false });
    }, 8000);

    let out = '';
    let err = '';
    py.stdout.on('data', (d) => { out += d.toString(); });
    py.stderr.on('data', (d) => { err += d.toString(); });
    py.on('error', () => { clearTimeout(timer); done({ ok: false }); });
    py.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0 && out) {
        try { return done({ ok: true, data: JSON.parse(out) }); } catch { /* fall through */ }
      }
      done({ ok: false, err });
    });

    py.stdin.write(JSON.stringify(payload));
    py.stdin.end();
  });

  if (result.ok) {
    return res.json({ success: true, engine: 'Python', data: result.data });
  }

  // JS fallback (same formulas as thai_life_compensation.py)
  try {
    const data = calculateThaiLifeIncome(payload);
    return res.json({ success: true, engine: 'JS (thai_life_compensation port)', data });
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Calculation failed' });
  }
}
