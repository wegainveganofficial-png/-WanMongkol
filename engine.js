// ===== Astro-calendar engine (Thai lunar, Chinese almanac, Kala-yoga) =====
const ENG = (() => {
  // ---------- basic date helpers (UTC-based day numbers) ----------
  const DAY = 86400000;
  const dn = (y, m, d) => Math.floor(Date.UTC(y, m - 1, d) / DAY); // days since 1970-01-01
  const fromDn = n => { const t = new Date(n * DAY); return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate(), w: t.getUTCDay() }; };
  const jdn = n => n + 2440588; // Julian day number (noon) of day n

  // ---------- Thai lunar calendar (Suriyayatra-based year typing) ----------
  const athikamas = y => (((y - 78) - 0.45222) % 2.7118886) < 1;
  const devCache = {};
  function deviation(y) {
    if (devCache[y] !== undefined) return devCache[y];
    let v;
    if (y === 1901) v = 0.122733000004352;
    else if (y > 1901) {
      const p = y - 1;
      v = deviation(p) + (athikamas(p) ? -0.102356 : athikavar(p) ? -0.632944 : 0.367056);
    } else { // backward
      const inc = athikamas(y) ? -0.102356 : athikavarRaw(y) ? -0.632944 : 0.367056;
      v = deviation(y + 1) - inc;
    }
    return (devCache[y] = v);
  }
  function athikavarRaw(y) { // used when going backward (needs deviation(y) itself) – approximate via forward def
    if (athikamas(y)) return false;
    const cutoff = athikamas(y + 1) ? 1.69501433191599e-2 : -1.42223099315486e-2;
    // deviation(y) = deviation(y+1) - inc(y); try both
    const d1 = deviation(y + 1);
    const asVar = d1 + 0.632944, asNorm = d1 - 0.367056;
    if (asVar > cutoff && !(asNorm > cutoff)) return true;
    if (!(asVar > cutoff) && asNorm > cutoff) return false;
    return asVar > cutoff; // ambiguous: prefer consistent
  }
  function athikavar(y) {
    if (athikamas(y)) return false;
    const cutoff = athikamas(y + 1) ? 1.69501433191599e-2 : -1.42223099315486e-2;
    return deviation(y) > cutoff;
  }
  const yearType = y => athikamas(y) ? 2 : athikavar(y) ? 1 : 0; // 2=อธิกมาส 1=อธิกวาร 0=ปกติ
  const yearLen = y => [354, 355, 384][yearType(y)];
  // month list for lunar year y: [{m, label, len}]
  function months(y) {
    const t = yearType(y), out = [];
    for (let m = 1; m <= 12; m++) {
      let len = m % 2 ? 29 : 30;
      if (m === 7 && t === 1) len = 30;
      out.push({ m, label: String(m), len });
      if (m === 8 && t === 2) { out[out.length - 1].label = '8'; out.push({ m: 8, label: '8-8', len: 30, second: true }); }
    }
    if (t === 2) { out[7].len = 30; }
    return out;
  }
  // anchor: 15 ขึ้น เดือน 6 of 2024 = 22 May 2024
  const ANCHOR_Y = 2024;
  const startCache = {};
  function yearStart(y) { // day number of 1 ขึ้น เดือน 1 of lunar year y
    if (startCache[y] !== undefined) return startCache[y];
    let s;
    if (y === ANCHOR_Y) { const ms = months(2024); let off = 0; for (let i = 0; i < 5; i++) off += ms[i].len; s = dn(2024, 5, 22) - (off + 14); }
    else if (y > ANCHOR_Y) s = yearStart(y - 1) + yearLen(y - 1);
    else s = yearStart(y + 1) - yearLen(y);
    return (startCache[y] = s);
  }
  function thaiLunar(n) {
    const g = fromDn(n);
    let y = g.y + 1;
    while (yearStart(y) > n) y--;
    let off = n - yearStart(y);
    const ms = months(y);
    for (let i = 0; i < ms.length; i++) {
      const mo = ms[i];
      if (off < mo.len) {
        const waxing = off < 15;
        const day = waxing ? off + 1 : off - 14;
        return { year: y, month: mo.m, second: !!mo.second, label: mo.label, len: mo.len, waxing, day, yearType: yearType(y), idx: i };
      }
      off -= mo.len;
    }
  }
  function lunarToDn(y, idx, waxing, day) {
    const ms = months(y); let off = 0;
    for (let i = 0; i < idx; i++) off += ms[i].len;
    return yearStart(y) + off + (waxing ? day - 1 : day + 14);
  }
  const monthIdx = (y, m, second) => { const ms = months(y); return ms.findIndex(x => x.m === m && !!x.second === !!second); };
  function buddhistDays(y) { // returns {dn: [name,...]}
    const t = yearType(y), r = [];
    const at = (m, sec, wax, d) => lunarToDn(y, monthIdx(y, m, sec), wax, d);
    const mk = t === 2 ? 4 : 3, vi = t === 2 ? 7 : 6;
    r.push([at(mk, 0, 1, 15), 'วันมาฆบูชา', 'bud', true]);
    r.push([at(vi, 0, 1, 15), 'วันวิสาขบูชา', 'bud', true]);
    r.push([at(vi, 0, 0, 8), 'วันอัฏฐมีบูชา', 'bud', false]);
    const asM = t === 2 ? [8, 1] : [8, 0];
    const as = at(asM[0], asM[1], 1, 15);
    r.push([as, 'วันอาสาฬหบูชา', 'bud', true]);
    r.push([as + 1, 'วันเข้าพรรษา', 'bud', true]);
    r.push([at(11, 0, 1, 15), 'วันออกพรรษา', 'bud', false]);
    r.push([at(11, 0, 0, 1), 'วันตักบาตรเทโวโรหณะ', 'bud', false]);
    r.push([at(12, 0, 1, 15), 'วันลอยกระทง', 'imp', false]);
    return r;
  }

  // ---------- astronomy: sun longitude & new moons ----------
  const rad = Math.PI / 180;
  function sunLon(jd) { // apparent geocentric longitude (deg)
    const T = (jd - 2451545) / 36525;
    const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
    const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
    const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M * rad) + (0.019993 - 0.000101 * T) * Math.sin(2 * M * rad) + 0.000289 * Math.sin(3 * M * rad);
    const om = 125.04 - 1934.136 * T;
    let l = L0 + C - 0.00569 - 0.00478 * Math.sin(om * rad);
    return ((l % 360) + 360) % 360;
  }
  function newMoon(k) { // Meeus ch.49, returns JDE (TT) ~ fine for date-level
    const T = k / 1236.85;
    let jde = 2451550.09766 + 29.530588861 * k + 0.00015437 * T * T - 0.00000015 * T * T * T;
    const E = 1 - 0.002516 * T - 0.0000074 * T * T;
    const M = (2.5534 + 29.1053567 * k - 0.0000014 * T * T) * rad;
    const Mp = (201.5643 + 385.81693528 * k + 0.0107582 * T * T) * rad;
    const F = (160.7108 + 390.67050284 * k - 0.0016118 * T * T) * rad;
    const Om = (124.7746 - 1.56375588 * k + 0.0020672 * T * T) * rad;
    jde += -0.4072 * Math.sin(Mp) + 0.17241 * E * Math.sin(M) + 0.01608 * Math.sin(2 * Mp) + 0.01039 * Math.sin(2 * F)
      + 0.00739 * E * Math.sin(Mp - M) - 0.00514 * E * Math.sin(Mp + M) + 0.00208 * E * E * Math.sin(2 * M)
      - 0.00111 * Math.sin(Mp - 2 * F) - 0.00057 * Math.sin(Mp + 2 * F) + 0.00056 * E * Math.sin(2 * Mp + M)
      - 0.00042 * Math.sin(3 * Mp) + 0.00042 * E * Math.sin(M + 2 * F) + 0.00038 * E * Math.sin(M - 2 * F)
      - 0.00024 * E * Math.sin(2 * Mp - M) - 0.00017 * Math.sin(Om);
    return jde;
  }
  const deltaT = y => { const t = (y - 2000) / 100; return (62.92 + 32.217 * t + 55.89 * t * t) / 86400; }; // rough, days
  // day number (local tz hours) containing a JD instant
  const jdToDn = (jd, tz) => Math.floor(jd + 0.5 + tz / 24) - 2440588;
  const nmDn = k => { const j = newMoon(k); return jdToDn(j - deltaT(2000 + k / 12.37), 8); };
  // solar term: first day (China time) whose end-of-day sun longitude passes target
  function termDn(year, lonTarget) { // search around approx date
    let approx = dn(year, 3, 21) + ((lonTarget - 0 + 360) % 360) * 365.2422 / 360;
    let n = Math.floor(approx) - 20;
    const lonAt = d => sunLon(jdn(d) + (24 - 12 - 8) / 24); // end of day local (UTC+8): JD noon + 4h = local midnight next
    const diff = d => ((lonAt(d) - lonTarget + 540) % 360) - 180;
    while (diff(n) >= 0) n -= 5;
    while (diff(n) < 0) n++;
    return n; // first day whose end-of-day lon >= target
  }
  // ---------- Chinese lunar calendar ----------
  const cnCache = {};
  function cnMonthsForSui(y) { // months from month-11 of y-1 up to month-11 of y
    if (cnCache[y]) return cnCache[y];
    const ws1 = termDn(y - 1, 270), ws2 = termDn(y, 270);
    let k = Math.floor((y - 1 - 2000) * 12.3685 + 11.3) - 2; // near Dec y-1
    while (nmDn(k + 1) <= ws1) k++;
    while (nmDn(k) > ws1) k--;
    const starts = []; let kk = k;
    while (nmDn(kk) <= ws2) { starts.push(nmDn(kk)); kk++; }
    // starts[0] = month 11 start of y-1; last = month 11 start of y
    const n = starts.length - 1; // lunations between
    const leapYear = n === 13;
    // principal terms (zhongqi) inside each month
    const zq = []; // day numbers of zhongqi between
    for (let lon = 270, yy = y - 1; zq.length < 15; lon = (lon + 30) % 360) {
      const d = termDn(lon < 270 && lon >= 0 && lon < 270 ? y : yy, lon);
      zq.push(d); if (lon === 330) yy = y;
    }
    const res = []; let num = 11, leapUsed = false;
    for (let i = 0; i < n; i++) {
      const a = starts[i], b = starts[i + 1];
      const hasZ = zq.some(z => z >= a && z < b);
      let isLeap = false;
      if (leapYear && !leapUsed && i > 0 && !hasZ) { isLeap = true; leapUsed = true; }
      if (i > 0 && !isLeap) num = num % 12 + 1;
      res.push({ start: a, end: b, num, leap: isLeap });
    }
    return (cnCache[y] = res);
  }
  function chineseLunar(n) {
    const g = fromDn(n);
    for (const y of [g.y, g.y + 1]) {
      const ms = cnMonthsForSui(y);
      for (const m of ms) if (n >= m.start && n < m.end) {
        return { month: m.num, leap: m.leap, day: n - m.start + 1, len: m.end - m.start, year: m.num >= 11 && m === ms[0] || (m.num >= 11 && ms.indexOf(m) < 3) ? y - 1 : y };
      }
    }
  }
  function cnNewYearDn(y) { const ms = cnMonthsForSui(y); const m = ms.find((x, i) => x.num === 1 && !x.leap && i > 0); return m.start; }

  // ---------- ganzhi ----------
  const STEM = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const STEM_TH = ['กะ', 'อิก', 'เปี้ย', 'เต็ง', 'โบ่ว', 'กี้', 'แก', 'ซิง', 'หยิม', 'กุ่ย'];
  const BRANCH = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const ZOD_TH = ['ชวด', 'ฉลู', 'ขาล', 'เถาะ', 'มะโรง', 'มะเส็ง', 'มะเมีย', 'มะแม', 'วอก', 'ระกา', 'จอ', 'กุน'];
  const ZOD_AN = ['หนู', 'วัว', 'เสือ', 'กระต่าย', 'มังกร', 'งู', 'ม้า', 'แพะ', 'ลิง', 'ไก่', 'สุนัข', 'หมู'];
  const ZOD_EMO = ['🐭', '🐮', '🐯', '🐰', '🐲', '🐍', '🐴', '🐐', '🐵', '🐔', '🐶', '🐷'];
  const ELEM = ['ไม้', 'ไม้', 'ไฟ', 'ไฟ', 'ดิน', 'ดิน', 'ทอง', 'ทอง', 'น้ำ', 'น้ำ'];
  const dayGZ = n => ((jdn(n) + 49) % 60 + 60) % 60;
  const OFFICERS = [
    ['建', 'เกี๋ยน (ก่อตั้ง)', 'ดีสำหรับเริ่มเรียน ยื่นเรื่อง เดินทาง', 1],
    ['除', 'ตู๋ (ขจัด)', 'ดีสำหรับทำความสะอาด รักษาโรค ปัดเป่าสิ่งไม่ดี', 1],
    ['满', 'หมั่ว (บริบูรณ์)', 'ดีสำหรับบูชา ค้าขาย เก็บทรัพย์', 1],
    ['平', 'เพ้ง (ราบเรียบ)', 'ดีสำหรับซ่อมแซม ปรับปรุง งานทั่วไป', 0],
    ['定', 'เต๋ง (มั่นคง)', 'ดีสำหรับแต่งงาน เซ็นสัญญา รับคนเข้าทำงาน', 1],
    ['执', 'จิบ (ยึดถือ)', 'ดีสำหรับก่อสร้าง ปลูกพืช ทวงหนี้', 0],
    ['破', 'ผั่ว (แตกหัก)', 'วันแตก ไม่ควรทำการมงคล ทำได้แค่รื้อถอน', -1],
    ['危', 'หงุ่ย (อันตราย)', 'ระวังการเดินทางไกลและที่สูง', 0],
    ['成', 'เซ้ง (สำเร็จ)', 'วันสำเร็จ ดีเกือบทุกเรื่อง เปิดกิจการ แต่งงาน', 2],
    ['收', 'ซิ่ว (เก็บเกี่ยว)', 'ดีสำหรับเก็บเงิน ทวงหนี้ รับของ', 0],
    ['开', 'ไค (เปิด)', 'วันเปิด ดีสำหรับเปิดร้าน ขึ้นบ้านใหม่ เริ่มงาน', 2],
    ['闭', 'ปี (ปิด)', 'วันปิด เหมาะเก็บตัว ไม่ควรเริ่มเรื่องใหม่', -1]
  ];
  function officer(n) {
    const lon = sunLon(jdn(n) + (12 - 8) / 24 - 0.5 + 0.5); // ~noon local China
    const mb = (Math.floor(((lon - 285 + 360) % 360) / 30) + 1) % 12;
    const db = dayGZ(n) % 12;
    return OFFICERS[((db - mb) % 12 + 12) % 12];
  }

  // ---------- Thai Kala-yoga (per จุลศักราช, switching at เถลิงศก) ----------
  const LERT_REF = Date.UTC(2025, 3, 16, 1, 27, 36) / DAY; // 16 Apr 2025 08:27:36 ICT in UTC days
  const lertDn = cs => Math.floor(LERT_REF + (cs - 1387) * 365.25875 + 7 / 24);
  function csOf(n) { const g = fromDn(n); let cs = g.y - 638; if (n < lertDn(cs)) cs--; return cs; }
  const w7 = v => { const r = ((v % 7) + 7) % 7; return r === 0 ? 7 : r; }; // 1=อาทิตย์..7=เสาร์
  function kalayoga(cs) {
    return { thongchai: w7(cs * 10 + 3), athibodi: w7(cs + 5), ubat: w7(cs * 3 + 2), lokawinat: w7(cs) };
  }

  return { dn, fromDn, jdn, thaiLunar, yearType, buddhistDays, lunarToDn, months, chineseLunar, cnNewYearDn, termDn, dayGZ, STEM, STEM_TH, BRANCH, ZOD_TH, ZOD_AN, ZOD_EMO, ELEM, officer, csOf, kalayoga, lertDn, sunLon };
})();
if (typeof module !== 'undefined') module.exports = ENG;
