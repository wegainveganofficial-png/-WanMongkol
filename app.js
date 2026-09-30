// ===== App =====
(() => {
  const E = ENG;
  const MIN = E.dn(1900, 1, 1), MAX = E.dn(2050, 12, 31);
  const TD = s => String(s).replace(/[0-9]/g, d => '๐๑๒๓๔๕๖๗๘๙'[d]);
  const MONTH = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
  const MON_S = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const LMON = ['', 'อ้าย', 'ยี่', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า', 'สิบ', 'สิบเอ็ด', 'สิบสอง'];
  // weekday data, index = JS getDay (0 = Sunday)
  const WD = [
    { n: 'อาทิตย์', s: 'อา', sym: '☀️', col: 'แดง', hex: '#E5484D', buddha: 'ปางถวายเนตร', kala: 'ศ ษ ส ห ฬ อ ฮ', trait: 'ใจกว้าง มีเกียรติ รักอิสระ มีแววผู้นำตั้งแต่เด็ก ชอบให้คนยอมรับ', care: 'ใจร้อนและถือตัวบ้าง ควรฝึกฟังคนอื่น' },
    { n: 'จันทร์', s: 'จ', sym: '🌙', col: 'เหลือง', hex: '#E8B400', buddha: 'ปางห้ามญาติ', kala: 'สระทั้งหมด', trait: 'อ่อนโยน ช่างสังเกต มีเสน่ห์ รักครอบครัว มีหัวทางศิลปะ', care: 'ขี้น้อยใจ อารมณ์ขึ้นลงตามคนรอบตัว' },
    { n: 'อังคาร', s: 'อ', sym: '🌸', col: 'ชมพู', hex: '#EC6FA0', buddha: 'ปางไสยาสน์', kala: 'ก ข ค ฆ ง', trait: 'กล้าหาญ ขยัน ตรงไปตรงมา ทำอะไรทำจริง ไม่ยอมแพ้ง่าย', care: 'ใจร้อน พูดตรงจนบางคนเสียใจ' },
    { n: 'พุธ', s: 'พ', sym: '🍀', col: 'เขียว', hex: '#2E9E57', buddha: 'ปางอุ้มบาตร (กลางวัน) / ปางป่าเลไลยก์ (กลางคืน)', kala: 'จ ฉ ช ซ ฌ ญ', trait: 'พูดเก่ง หัวไว เข้ากับคนง่าย มีพรสวรรค์ด้านการสื่อสารและค้าขาย', care: 'เปลี่ยนใจเร็ว เบื่อง่าย' },
    { n: 'พฤหัสบดี', s: 'พฤ', sym: '🍊', col: 'ส้ม', hex: '#F07F13', buddha: 'ปางสมาธิ', kala: 'ด ต ถ ท ธ น', trait: 'ใฝ่รู้ สุขุม มีหลักการ เป็นที่นับถือ เหมาะเป็นครูหรือที่ปรึกษา', care: 'ดื้อเงียบ ยึดความคิดตัวเอง' },
    { n: 'ศุกร์', s: 'ศ', sym: '🦋', col: 'ฟ้า', hex: '#3B8FE0', buddha: 'ปางรำพึง', kala: 'ย ร ล ว', trait: 'อารมณ์ดี รักความสวยงาม มีเสน่ห์ ช่างเอาใจ เก่งศิลปะและดนตรี', care: 'ชอบความสบาย ใช้เงินเก่ง' },
    { n: 'เสาร์', s: 'ส', sym: '🔮', col: 'ม่วง', hex: '#8B4FC4', buddha: 'ปางนาคปรก', kala: 'ฎ ฏ ฐ ฑ ฒ ณ', trait: 'อดทน หนักแน่น รับผิดชอบ พึ่งพาได้ ยิ่งโตยิ่งมั่นคง', care: 'เก็บความรู้สึก ดูเงียบขรึม' }
  ];
  // planets: 1 อาทิตย์ … 7 เสาร์, 8 ราหู
  const PLANET = { 1: ['อาทิตย์', 'แดง', '#E5484D'], 2: ['จันทร์', 'เหลือง / ครีม', '#EFC53B'], 3: ['อังคาร', 'ชมพู', '#F28DB5'], 4: ['พุธ', 'เขียว', '#2E9E57'], 5: ['พฤหัสบดี', 'ส้ม / แสด', '#F07F13'], 6: ['ศุกร์', 'ฟ้า / น้ำเงิน', '#3B8FE0'], 7: ['เสาร์', 'ม่วง / ดำ', '#6E3FA3'], 8: ['ราหู', 'เทา / น้ำตาล', '#7A7470'] };
  const TAKSA = [1, 2, 3, 4, 7, 5, 8, 6];
  const ROLES = [
    ['บริวาร', 'คนรอบข้าง ลูกน้อง ครอบครัว'], ['อายุ', 'สุขภาพ อารมณ์ดี'], ['เดช', 'อำนาจ บารมี'], ['ศรี', 'การเงิน โชคลาภ'],
    ['มูละ', 'ทรัพย์สิน ความมั่นคง'], ['อุตสาหะ', 'การงาน ความขยัน'], ['มนตรี', 'ผู้ใหญ่เอ็นดู เสน่ห์'], ['กาลกิณี', 'ควรเลี่ยง']
  ];
  const ZOD_TRAIT = ['หัวไว ประหยัด ปรับตัวเก่ง', 'ขยัน อดทน ซื่อตรง', 'กล้าได้กล้าเสีย มีพลัง', 'ใจดี สุภาพ มีรสนิยม', 'มั่นใจ มีบารมี ทะเยอทะยาน', 'ลึกซึ้ง ฉลาด มีเสน่ห์ลึกลับ',
    'ร่าเริง รักอิสระ ชอบเดินทาง', 'อ่อนโยน มีศิลปะ ใจเย็น', 'ฉลาด ขี้เล่น แก้ปัญหาเก่ง', 'ขยัน ละเอียด ตรงเวลา', 'ซื่อสัตย์ รักพวกพ้อง', 'ใจกว้าง จริงใจ มีโชคด้านกิน'];
  const KY_INFO = {
    thongchai: { t: 'วันธงชัย', k: 'good', d: 'วันมงคลสูงสุด เหมาะกับการเริ่มต้นใหม่ แต่งงาน เปิดกิจการ ขึ้นบ้านใหม่ ออกรถ งานที่ต้องการชัยชนะ' },
    athibodi: { t: 'วันอธิบดี', k: 'good2', d: 'วันมงคลรองลงมา เด่นเรื่องอำนาจ การปกครอง ความมั่นคง เหมาะรับตำแหน่ง ยื่นเรื่องต่อผู้ใหญ่' },
    ubat: { t: 'วันอุบาทว์', k: 'bad', d: 'วันกาลกิณี ไม่ควรเริ่มกิจสำคัญ ทำสัญญา เจรจาธุรกิจ หรืองานมงคล' },
    lokawinat: { t: 'วันโลกาวินาศ', k: 'bad', d: 'วันกาลกิณีแรง ห้ามเริ่มงานใหญ่ ลงทุน ทำสัญญา หรือเดินทางไกลเพื่อเรื่องสำคัญ' }
  };

  // ---------- holidays per Gregorian year ----------
  const hCache = {};
  function yearHol(y) {
    if (hCache[y]) return hCache[y];
    const map = new Map();
    const add = (n, name, type, off) => { if (!map.has(n)) map.set(n, []); map.get(n).push({ name, type, off: !!off }); };
    const fx = (m, d, name, type, off, from = 0, to = 9999) => { if (y >= from && y <= to) add(E.dn(y, m, d), name, type, off); };
    fx(1, 1, 'วันขึ้นปีใหม่', 'gov', 1, 1941);
    fx(4, 1, 'วันขึ้นปีใหม่ (แบบเดิม)', 'gov', 1, 1889, 1940);
    if (y >= 1965) { let n = E.dn(y, 1, 1); let c = 0; while (true) { if (E.fromDn(n).w === 6 && ++c === 2) break; n++; } add(n, 'วันเด็กแห่งชาติ', 'imp'); }
    fx(1, 16, 'วันครู', 'imp', 0, 1957);
    fx(2, 14, 'วันวาเลนไทน์', 'imp', 0, 1950);
    fx(4, 6, 'วันจักรี', 'gov', 1, 1918);
    for (const d of [13, 14, 15]) fx(4, d, d === 13 ? 'วันสงกรานต์ · วันผู้สูงอายุ' : d === 14 ? 'วันสงกรานต์ · วันครอบครัว' : 'วันสงกรานต์', 'gov', y >= 1940);
    fx(5, 1, 'วันแรงงานแห่งชาติ', 'gov', 1, 1956);
    fx(5, 5, 'วันฉัตรมงคล', 'gov', 1, 1950, 2016);
    fx(5, 4, 'วันฉัตรมงคล', 'gov', 1, 2020);
    fx(6, 3, 'วันเฉลิมพระชนมพรรษา สมเด็จพระราชินี', 'gov', 1, 2019);
    fx(6, 24, 'วันชาติ (แบบเดิม)', 'gov', 1, 1939, 1959);
    fx(7, 28, 'วันเฉลิมพระชนมพรรษา ร.10', 'gov', 1, 2017);
    fx(8, 12, y >= 2017 ? 'วันเฉลิมพระชนมพรรษา พระพันปีหลวง · วันแม่แห่งชาติ' : 'วันแม่แห่งชาติ', 'gov', 1, 1976);
    fx(10, 13, 'วันนวมินทรมหาราช', 'gov', 1, 2017);
    fx(10, 23, 'วันปิยมหาราช', 'gov', 1, 1911);
    fx(12, 5, y >= 1980 ? 'วันพ่อแห่งชาติ · วันชาติ' : 'วันเฉลิมพระชนมพรรษา ร.9', 'gov', 1, 1960);
    fx(12, 10, 'วันรัฐธรรมนูญ', 'gov', 1, 1933);
    fx(12, 31, 'วันสิ้นปี', 'gov', 1, 1941);
    for (const [n, name, type, off] of E.buddhistDays(y)) add(n, name, type, off && !(name === 'วันอาสาฬหบูชา' && y < 1958));
    // Chinese festivals
    const s = E.dn(y, 1, 1), e = E.dn(y, 12, 31);
    const cny = E.cnNewYearDn(y);
    add(cny - 2, 'วันจ่าย (ตรุษจีน)', 'cn'); add(cny - 1, 'วันไหว้ (ตรุษจีน)', 'cn'); add(cny, 'วันตรุษจีน', 'cn');
    add(E.termDn(y, 15), 'วันเชงเม้ง', 'cn'); add(E.termDn(y, 270), 'วันไหว้ขนมบัวลอย (ตังโจ่ย)', 'cn');
    for (let n = s; n <= e; n++) {
      const c = E.chineseLunar(n); if (c.leap) continue;
      if (c.month === 5 && c.day === 5) add(n, 'เทศกาลไหว้ขนมจ้าง', 'cn');
      if (c.month === 7 && c.day === 15) add(n, 'วันสารทจีน', 'cn');
      if (c.month === 8 && c.day === 15) add(n, 'วันไหว้พระจันทร์', 'cn');
      if (c.month === 9 && c.day <= 9) add(n, `เทศกาลกินเจ วันที่ ${c.day}`, 'cn');
    }
    return (hCache[y] = map);
  }

  // ---------- per-day info ----------
  const iCache = new Map();
  function info(n) {
    if (iCache.has(n)) return iCache.get(n);
    const g = E.fromDn(n), w = g.w, wd = w + 1;
    const tl = E.thaiLunar(n), cl = E.chineseLunar(n), gz = E.dayGZ(n), off = E.officer(n);
    const cs = E.csOf(n), ky = E.kalayoga(cs);
    const flags = Object.keys(ky).filter(k => ky[k] === wd);
    const hol = (yearHol(g.y).get(n) || []).slice();
    const wanLast = tl.len - 15;
    let phra = null;
    if (tl.day === 8) phra = 'วันพระ ' + (tl.waxing ? 'ขึ้น' : 'แรม') + ' ๘ ค่ำ';
    else if (tl.waxing && tl.day === 15) phra = 'วันพระใหญ่ ขึ้น ๑๕ ค่ำ';
    else if (!tl.waxing && tl.day === wanLast) phra = `วันพระใหญ่ แรม ${TD(wanLast)} ค่ำ`;
    const kon = (tl.day === 7) || (tl.waxing && tl.day === 14) || (!tl.waxing && tl.day === wanLast - 1);
    const tzY = tl.idx >= 4 ? tl.year : tl.year - 1;
    const cnY = n >= E.cnNewYearDn(g.y) ? g.y : g.y - 1;
    let score = 0;
    if (flags.includes('thongchai')) score += 3; if (flags.includes('athibodi')) score += 2;
    if (flags.includes('ubat')) score -= 3; if (flags.includes('lokawinat')) score -= 3;
    score += off[3];
    const verdict = score >= 4 ? ['มหามงคล', 'great'] : score >= 2 ? ['วันดี', 'good'] : score >= 0 ? ['กลางๆ', 'mid'] : ['ควรเลี่ยง', 'bad'];
    // shirt colours from ทักษา
    const start = TAKSA.indexOf(wd);
    const shirt = ROLES.map((r, i) => ({ role: r[0], use: r[1], p: TAKSA[(start + i) % 8] }));
    // lucky numbers (derived, for fun)
    const sri = shirt[3].p, mon = shirt[6].p;
    const lucky = [`${sri}${(tl.day + gz % 10) % 10}`, `${(g.d * 7 + g.m * 3 + g.y) % 10}${mon}`];
    const r = { n, g, w, tl, cl, gz, off, cs, ky, flags, hol, phra, kon, tzY, cnY, score, verdict, shirt, lucky };
    iCache.set(n, r); if (iCache.size > 3000) iCache.delete(iCache.keys().next().value);
    return r;
  }
  const lunarText = tl => `${tl.waxing ? 'ขึ้น' : 'แรม'} ${TD(tl.day)} ค่ำ เดือน${tl.second ? 'แปดหลัง' : LMON[tl.month]}`;
  const lunarShort = tl => `${tl.waxing ? '◐' : '◑'}${TD(tl.day)}`;
  const zod = y => ((y - 4) % 12 + 12) % 12;
  const yearGZ = y => ((y - 4) % 60 + 60) % 60;
  const dateLong = g => `วัน${WD[g.w].n}ที่ ${g.d} ${MONTH[g.m - 1]} พ.ศ. ${g.y + 543}`;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ---------- state ----------
  const now = new Date();
  const TODAY = Math.min(MAX, Math.max(MIN, E.dn(now.getFullYear(), now.getMonth() + 1, now.getDate())));
  let cur = TODAY, view = 'day';
  try { const v = localStorage.getItem('pt-view'); if (['day', 'week', 'month', 'mine'].includes(v)) view = v; } catch (e) { }
  const $ = id => document.getElementById(id);

  // selects
  const ySel = $('ySel'), mSel = $('mSel');
  for (let y = 1900; y <= 2050; y++) ySel.add(new Option(`${y + 543} (${y})`, y));
  MONTH.forEach((m, i) => mSel.add(new Option(m, i + 1)));
  ySel.onchange = mSel.onchange = () => { const g = E.fromDn(cur); const y = +ySel.value, m = +mSel.value; const dim = new Date(Date.UTC(y, m, 0)).getUTCDate(); go(E.dn(y, m, Math.min(g.d, dim))); };
  $('dateIn').min = '1900-01-01'; $('dateIn').max = '2050-12-31';
  $('dateIn').onchange = e => { const [y, m, d] = e.target.value.split('-').map(Number); if (y) go(E.dn(y, m, d)); };

  function step(dir) {
    if (view === 'day') go(cur + dir);
    else if (view === 'week') go(cur + 7 * dir);
    else { const g = E.fromDn(cur); let y = g.y, m = g.m + dir; if (m < 1) { m = 12; y--; } if (m > 12) { m = 1; y++; } const dim = new Date(Date.UTC(y, m, 0)).getUTCDate(); go(E.dn(y, m, Math.min(g.d, dim))); }
  }
  function go(n) { cur = Math.min(MAX, Math.max(MIN, n)); render(); }
  $('prev').onclick = () => step(-1); $('next').onclick = () => step(1); $('today').onclick = () => go(TODAY);
  document.querySelectorAll('[data-view]').forEach(b => b.onclick = () => { view = b.dataset.view; try { localStorage.setItem('pt-view', view); } catch (e) { } render(); });
  document.addEventListener('keydown', e => { if (e.target.closest('select,input')) return; if (e.key === 'ArrowLeft') step(-1); if (e.key === 'ArrowRight') step(1); });
  // swipe left / right to move through days, weeks or months
  let tx = null, ty = 0;
  $('view').addEventListener('touchstart', e => { if (e.touches.length !== 1 || view === 'mine' || e.target.closest('input,select,textarea,form')) { tx = null; return; } tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  $('view').addEventListener('touchend', e => { if (tx === null) return; const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty; tx = null; if (Math.abs(dx) > 70 && Math.abs(dy) < 45) step(dx < 0 ? 1 : -1); }, { passive: true });
  document.addEventListener('click', e => { const c = e.target.closest('[data-go]'); if (c) { cur = +c.dataset.go; view = 'day'; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); } });

  // ---------- chips ----------
  function chips(I, compact) {
    const out = [];
    for (const f of I.flags) out.push(`<span class="chip ${KY_INFO[f].k}">${compact ? KY_INFO[f].t.replace('วัน', '') : KY_INFO[f].t}</span>`);
    if (I.phra) out.push(`<span class="chip phra">${compact ? 'วันพระ' : I.phra}</span>`);
    return out.join('');
  }
  const holHtml = (I, compact) => I.hol.map(h => `<span class="hol ${h.type}${h.off ? ' off' : ''}">${esc(h.name)}${!compact && h.off ? ' <em>หยุดราชการ</em>' : ''}</span>`).join('');

  // ---------- views ----------
  function renderDay() {
    const I = info(cur), g = I.g, W = WD[g.w];
    const tz = zod(I.tzY), cz = zod(I.cnY), ygz = yearGZ(I.cnY);
    const stem = I.gz % 10, br = I.gz % 12, clash = (br + 6) % 12;
    const kyList = ['thongchai', 'athibodi', 'ubat', 'lokawinat'];
    const wk = isoWeek(cur);
    const clashes = [];
    for (const gk of ['thongchai', 'athibodi']) for (const bk of ['ubat', 'lokawinat']) if (I.ky[gk] === I.ky[bk]) clashes.push(`วัน${WD[I.ky[gk] - 1].n}ในปีนี้เป็นทั้ง${KY_INFO[gk].t}และ${KY_INFO[bk].t}`);
    const cl = I.cl;
    return `
    <section class="hero" style="--day:${W.hex}">
      <div class="sym" aria-hidden="true">${W.sym}</div>
      <div class="hero-main">
        <p class="eyebrow">วัน${W.n} · สีประจำวัน${W.col}</p>
        <h2 class="bigdate"><span class="dnum">${g.d}</span><span class="dmon">${MONTH[g.m - 1]}<br><b>พ.ศ. ${g.y + 543}</b> <small>ค.ศ. ${g.y}</small></span></h2>
        <p class="lunar">${lunarText(I.tl)} ปี${E.ZOD_TH[tz]}${I.tl.yearType === 2 ? ' · ปีอธิกมาส' : I.tl.yearType === 1 ? ' · ปีอธิกวาร' : ''}</p>
        <div class="chips">${chips(I)}${I.kon ? '<span class="chip kon">วันโกน</span>' : ''}</div>
        ${I.hol.length ? `<div class="hols">${holHtml(I)}</div>` : ''}
      </div>
      <div class="verdict v-${I.verdict[1]}"><span>ภาพรวมวันนี้</span><b>${I.verdict[0]}</b></div>
    </section>

    <div class="grid">
      <section class="card span2">
        <h3>ฤกษ์กาลโยค สัปดาห์ที่ ${wk.no} ของปี ${wk.year + 543} <small>จ. ${wkLabel(wk.mon)} – อา. ${wkLabel(wk.mon + 6)} · จ.ศ. ${I.cs}</small></h3>
        <div class="ky">
          ${kyList.map(k => { const on = I.flags.includes(k); const days = kyDates(wk.mon, k); const d = I.ky[k] - 1;
            return `<div class="kyi ${KY_INFO[k].k}${on ? ' on' : ''}"><div class="kyh"><b>${KY_INFO[k].t}</b><span>ทุกวัน${WD[d].n}</span></div>
            <div class="kyd">${days.length ? days.map(x => `<button type="button" data-go="${x}" class="kydate${x === cur ? ' is' : ''}">${dateShort(x)}</button>`).join('') : '<span class="muted">ไม่มีในสัปดาห์นี้</span>'}</div>
            <p>${KY_INFO[k].d}</p>${on ? '<i>วันนี้</i>' : ''}</div>`; }).join('')}
        </div>
        ${clashes.length ? `<p class="note warn">${clashes.join(' ')} ตำราถือว่าวันกาลกิณีมีน้ำหนักกว่า จึงไม่ควรใช้วันนั้นทำการมงคลสำคัญ</p>` : ''}
        <p class="note">กาลโยคคำนวณจากจุลศักราช และเปลี่ยนชุดวันทุกวันเถลิงศก (ประมาณ ${E.fromDn(E.lertDn(I.g.y - 638)).d} เม.ย.)</p>
      </section>

      <section class="card">
        <h3>ปฏิทินจีน · น้ำเอี๊ยง</h3>
        <dl class="kv">
          <dt>จันทรคติจีน</dt><dd>เดือน ${cl.month}${cl.leap ? ' (เดือนอธิกมาส)' : ''} วันที่ ${cl.day}</dd>
          <dt>ปี</dt><dd>${E.STEM[ygz % 10]}${E.BRANCH[ygz % 12]} · ปี${E.ZOD_AN[cz]} ${E.ZOD_EMO[cz]} ธาตุ${E.ELEM[ygz % 10]}</dd>
          <dt>วัน</dt><dd><span class="han">${E.STEM[stem]}${E.BRANCH[br]}</span> ${E.STEM_TH[stem]}${E.ZOD_TH[br]} · ธาตุ${E.ELEM[stem]}</dd>
          <dt>ดาวประจำวัน</dt><dd><span class="han">${I.off[0]}</span> ${I.off[1]}</dd>
          <dt>ชงกับ</dt><dd>ปี${E.ZOD_AN[clash]} (${E.ZOD_TH[clash]}) ${E.ZOD_EMO[clash]} ควรระวังเป็นพิเศษ</dd>
        </dl>
        <p class="tip ${I.off[3] > 0 ? 'good' : I.off[3] < 0 ? 'bad' : ''}">${I.off[2]}</p>
      </section>

      <section class="card lucky">
        <h3>เลขมงคลวันนี้</h3>
        <div class="nums">${I.lucky.map(x => `<span>${x}</span>`).join('')}</div>
        <p class="note">ถอดจากดาวศรีและดาวมนตรีของวัน ร่วมกับดิถีจันทร์ ใช้เพื่อความเพลิดเพลิน</p>
      </section>

      <section class="card span2">
        <h3>สีเสื้อมงคลวัน${W.n}</h3>
        <div class="shirts">
          ${I.shirt.map(s => { const P = PLANET[s.p]; const bad = s.role === 'กาลกิณี'; return `<div class="shirt${bad ? ' kala' : ''}"><span class="sw" style="background:${P[2]}"></span><div><b>${s.role}</b><span>${P[1]}</span><small>${s.use}</small></div></div>`; }).join('')}
        </div>
      </section>

      <div id="memberDay" class="span2 member-slot"></div>
      <section class="card span2 baby" style="--day:${W.hex}">
        <h3>เด็กที่เกิดวันนี้</h3>
        <div class="baby-in">
          <div class="baby-sym" aria-hidden="true">${W.sym}${E.ZOD_EMO[cz]}</div>
          <div>
            <p><b>เกิดวัน${W.n}</b> ${W.trait} <span class="muted">จุดที่ควรดูแล: ${W.care}</span></p>
            <p><b>ปี${E.ZOD_AN[cz]} (${E.ZOD_TH[cz]}) ธาตุ${E.ELEM[ygz % 10]}</b> ${ZOD_TRAIT[cz]}</p>
            <dl class="kv two">
              <dt>พระประจำวันเกิด</dt><dd>${W.buddha}</dd>
              <dt>สีมงคลตัวเด็ก</dt><dd>${W.col}</dd>
              <dt>อักษรกาลกิณี (เลี่ยงในชื่อ)</dt><dd>${g.w === 3 ? 'จ ฉ ช ซ ฌ ญ (กลางวัน) · บ ป ผ ฝ พ ฟ ภ ม (หลัง 18.00 น.)' : W.kala}</dd>
              <dt>ดิถีเกิด</dt><dd>${lunarText(I.tl)}</dd>
            </dl>
            ${g.w === 3 ? '<p class="note">เกิดวันพุธหลัง 18.00 น. ถือเป็นพุธกลางคืน (ราหู) ใช้สีเทาและลักษณะแบบราหู</p>' : ''}
          </div>
        </div>
      </section>
    </div>`;
  }

  function weekStart(n) { return n - (E.fromDn(n).w + 6) % 7; } // Monday
  function isoWeek(n) {
    const mon = weekStart(n), thu = mon + 3, y = E.fromDn(thu).y;
    return { no: Math.floor((thu - E.dn(y, 1, 1)) / 7) + 1, year: y, mon };
  }
  const wkLabel = n => { const g = E.fromDn(n); return `${g.d} ${MON_S[g.m - 1]}`; };
  const dateShort = n => { const g = E.fromDn(n); return `${WD[g.w].s}. ${g.d} ${MON_S[g.m - 1]} ${String(g.y + 543).slice(2)}`; };
  function kyDates(mon, k) { const r = []; for (let i = 0; i < 7; i++) { const n = mon + i; if (n < MIN || n > MAX) continue; if (E.kalayoga(E.csOf(n))[k] === E.fromDn(n).w + 1) r.push(n); } return r; }
  function renderWeek() {
    const s = weekStart(cur);
    const a = E.fromDn(s), b = E.fromDn(s + 6);
    let rows = '';
    for (let i = 0; i < 7; i++) {
      const n = s + i; if (n < MIN || n > MAX) continue;
      const I = info(n), g = I.g, W = WD[g.w], sri = PLANET[I.shirt[3].p], kala = PLANET[I.shirt[7].p];
      rows += `<button class="wrow${n === cur ? ' sel' : ''}${n === TODAY ? ' today' : ''}" data-go="${n}" style="--day:${W.hex}">
        <span class="wsym" aria-hidden="true">${W.sym}</span>
        <span class="wdate"><b>${g.d}</b><small>${W.n}</small><span class="mmark" data-mark="${n}"></span></span>
        <span class="wmid"><span class="wl">${lunarText(I.tl)}</span><span class="chips">${chips(I, true)}</span>${I.hol.length ? `<span class="hols">${holHtml(I, true)}</span>` : ''}</span>
        <span class="wside"><span class="v-${I.verdict[1]} vpill">${I.verdict[0]}</span><span class="mini"><i style="background:${sri[2]}"></i>การเงิน <i style="background:${kala[2]}" class="x"></i>เลี่ยง</span><span class="wnum">${I.lucky.join(' · ')}</span></span>
      </button>`;
    }
    const wk = isoWeek(s);
    return `<h2 class="vtitle">สัปดาห์ที่ ${wk.no} ของปี ${wk.year + 543} <small>(จ. ${a.d} ${MON_S[a.m - 1]} – อา. ${b.d} ${MON_S[b.m - 1]} ${b.y + 543})</small></h2><div class="week">${rows}</div>`;
  }

  function renderMonth() {
    const g0 = E.fromDn(cur), first = E.dn(g0.y, g0.m, 1), dim = new Date(Date.UTC(g0.y, g0.m, 0)).getUTCDate();
    let cells = [1, 2, 3, 4, 5, 6, 0].map(i => WD[i]).map(w => `<div class="mh" style="--day:${w.hex}">${w.s}</div>`).join('');
    const lead = (E.fromDn(first).w + 6) % 7;
    for (let i = 0; i < lead; i++) cells += '<div class="mc empty"></div>';
    const summary = { thongchai: [], athibodi: [], bad: [], phra: [], hol: [] };
    for (let d = 1; d <= dim; d++) {
      const n = first + d - 1, I = info(n);
      const isOff = I.hol.some(h => h.off);
      if (I.flags.includes('thongchai')) summary.thongchai.push(d);
      if (I.flags.includes('athibodi')) summary.athibodi.push(d);
      if (I.flags.includes('ubat') || I.flags.includes('lokawinat')) summary.bad.push(d);
      if (I.phra) summary.phra.push(d);
      I.hol.forEach(h => summary.hol.push([d, h]));
      const dots = I.flags.map(f => `<i class="dot ${KY_INFO[f].k}" title="${KY_INFO[f].t}"></i>`).join('') + (I.phra ? '<i class="dot phra" title="วันพระ"></i>' : '');
      cells += `<button class="mc${n === cur ? ' sel' : ''}${n === TODAY ? ' today' : ''}${isOff ? ' off' : ''}" data-go="${n}" style="--day:${WD[I.w].hex}" aria-label="${dateLong(I.g)}">
        <span class="md">${d}</span><span class="mmark" data-mark="${n}"></span><span class="ml">${lunarShort(I.tl)}</span><span class="dots">${dots}</span>
        ${I.hol.length ? `<span class="mhol">${esc(I.hol[0].name)}</span>` : ''}</button>`;
    }
    const list = (arr) => arr.length ? arr.join(', ') : '–';
    const holList = summary.hol.map(([d, h]) => `<li><b>${d}</b> ${esc(h.name)}${h.off ? ' <em>หยุด</em>' : ''}</li>`).join('');
    return `<h2 class="vtitle">${MONTH[g0.m - 1]} ${g0.y + 543}</h2>
      <div class="month">${cells}</div>
      <div class="legend"><span><i class="dot good"></i>ธงชัย</span><span><i class="dot good2"></i>อธิบดี</span><span><i class="dot bad"></i>อุบาทว์ / โลกาวินาศ</span><span><i class="dot phra"></i>วันพระ</span><span><i class="dot offd"></i>วันหยุดราชการ</span></div>
      <div class="grid msum">
        <section class="card"><h3>สรุปฤกษ์เดือนนี้</h3><dl class="kv">
          <dt>วันธงชัย</dt><dd>${list(summary.thongchai)}</dd><dt>วันอธิบดี</dt><dd>${list(summary.athibodi)}</dd>
          <dt>วันกาลกิณี</dt><dd>${list(summary.bad)}</dd><dt>วันพระ</dt><dd>${list(summary.phra)}</dd></dl></section>
        <section class="card"><h3>วันหยุดและวันสำคัญ</h3>${holList ? `<ul class="hl">${holList}</ul>` : '<p class="muted">เดือนนี้ไม่มีวันสำคัญ</p>'}</section>
      </div>`;
  }

  function render() {
    const g = E.fromDn(cur);
    ySel.value = g.y; mSel.value = g.m;
    $('dateIn').value = `${g.y}-${String(g.m).padStart(2, '0')}-${String(g.d).padStart(2, '0')}`;
    document.querySelectorAll('[data-view]').forEach(b => b.setAttribute('aria-pressed', b.dataset.view === view));
    const lbl = { mine: ['เดือนก่อน', 'เดือนถัดไป'], day: ['วันก่อน', 'วันถัดไป'], week: ['สัปดาห์ก่อน', 'สัปดาห์ถัดไป'], month: ['เดือนก่อน', 'เดือนถัดไป'] }[view];
    $('prev').title = lbl[0]; $('next').title = lbl[1];
    $('prev').querySelector('span').textContent = lbl[0]; $('next').querySelector('span').textContent = lbl[1];
    document.documentElement.style.setProperty('--today', WD[g.w].hex);
    $('view').innerHTML = view === 'day' ? renderDay() : view === 'week' ? renderWeek() : view === 'mine' ? '<div id="mineView"></div>' : renderMonth();
    try { window.MEMBER && window.MEMBER.afterRender(view, cur); } catch (err) { console.error(err); }
  }
  window.WM = { E, info, WD, PLANET, TAKSA, ROLES, KY_INFO, MONTH, MON_S, lunarText, esc, TD, zod, yearGZ, ZOD_TRAIT, dateLong,
    getCur: () => cur, getView: () => view, TODAY, MIN, MAX,
    go: n => { cur = Math.min(MAX, Math.max(MIN, n)); render(); }, setView: v => { view = v; try { localStorage.setItem('pt-view', v); } catch (e) { } render(); }, render };
  render();
})();
