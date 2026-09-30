// ===== Members: auth, birthdays, saved days (Supabase) =====
(() => {
  const CFG = window.WANMONGKOL_CONFIG;
  const W = window.WM, E = W.E;
  const sb = window.supabase.createClient(CFG.url, CFG.key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
  const $ = id => document.getElementById(id);
  const esc = W.esc;
  const iso = n => { const g = E.fromDn(n); return `${g.y}-${String(g.m).padStart(2, '0')}-${String(g.d).padStart(2, '0')}`; };
  const toDn = s => { const [y, m, d] = s.split('-').map(Number); return E.dn(y, m, d); };

  let user = null, profile = null, people = [], days = new Map(), loaded = false;

  // ---------- data ----------
  async function load() {
    if (!user) { people = []; days = new Map(); loaded = false; return; }
    const [p, pe, sd] = await Promise.all([
      sb.from('profiles').select('*').eq('id', user.id).maybeSingle(),
      sb.from('people').select('*').order('is_me', { ascending: false }).order('created_at'),
      sb.from('saved_days').select('*').order('day')
    ]);
    profile = p.data; people = pe.data || [];
    days = new Map();
    for (const r of sd.data || []) { if (!days.has(r.day)) days.set(r.day, []); days.get(r.day).push(r); }
    loaded = true;
  }

  // ---------- astrology for a person ----------
  function personInfo(p) {
    const n = toDn(p.birth_date), g = E.fromDn(n);
    const night = g.w === 3 && p.birth_time && p.birth_time >= '18:00';
    const planet = night ? 8 : g.w + 1;
    const start = W.TAKSA.indexOf(planet);
    const seq = W.ROLES.map((r, i) => ({ role: r[0], use: r[1], p: W.TAKSA[(start + i) % 8] }));
    const cnY = n >= E.cnNewYearDn(g.y) ? g.y : g.y - 1;
    const zb = W.zod(cnY);
    const kalaPlanet = seq[7].p; // weekday number 1..7 or 8 (ราหู)
    const I = W.info(n);
    return { n, g, night, planet, seq, cnY, zb, kalaPlanet, I };
  }
  const PL_NAME = { 1: 'อาทิตย์', 2: 'จันทร์', 3: 'อังคาร', 4: 'พุธ', 5: 'พฤหัสบดี', 6: 'ศุกร์', 7: 'เสาร์', 8: 'พุธกลางคืน (ราหู)' };
  const KALA_LETTERS = { 1: 'สระทั้งหมด', 2: 'ก ข ค ฆ ง', 3: 'จ ฉ ช ซ ฌ ญ', 4: 'ฎ ฏ ฐ ฑ ฒ ณ', 5: 'บ ป ผ ฝ พ ฟ ภ ม', 6: 'ศ ษ ส ห ฬ อ ฮ', 7: 'ด ต ถ ท ธ น', 8: 'ย ร ล ว' };
  function goodDaysFor(pi, y, m) {
    const first = E.dn(y, m, 1), dim = new Date(Date.UTC(y, m, 0)).getUTCDate(), out = [];
    for (let d = 1; d <= dim; d++) {
      const n = first + d - 1, I = W.info(n);
      const good = I.flags.includes('thongchai') || I.flags.includes('athibodi');
      const bad = I.flags.includes('ubat') || I.flags.includes('lokawinat');
      const clash = ((I.gz % 12) + 6) % 12 === pi.zb;
      const kalaDay = pi.kalaPlanet <= 7 && I.w + 1 === pi.kalaPlanet;
      if (good && !bad && !clash && !kalaDay && I.off[3] >= 0) out.push(n);
    }
    return out;
  }
  function nextBirthday(p) {
    const b = toDn(p.birth_date), bg = E.fromDn(b), t = E.fromDn(W.TODAY);
    for (const y of [t.y, t.y + 1]) {
      const dim = new Date(Date.UTC(y, bg.m, 0)).getUTCDate();
      const n = E.dn(y, bg.m, Math.min(bg.d, dim));
      if (n >= W.TODAY && n <= W.MAX) return { n, age: y - bg.y, inDays: n - W.TODAY };
    }
    return null;
  }

  // ---------- rendering hooks ----------
  function afterRender(view, cur) {
    renderAuthBar();
    // marks on week/month cells
    document.querySelectorAll('[data-mark]').forEach(el => {
      const n = +el.dataset.mark, g = E.fromDn(n), key = iso(n), marks = [];
      if (days.has(key)) marks.push(`<i class="mk saved" title="${esc(days.get(key).map(x => x.title).join(', '))}">♥</i>`);
      for (const p of people) { const b = p.birth_date.split('-'); if (+b[1] === g.m && +b[2] === g.d) marks.push(`<i class="mk bday" title="วันเกิด ${esc(p.name)}">🎂</i>`); }
      el.innerHTML = marks.join('');
    });
    if (view === 'day') renderDaySlot(cur);
    if (view === 'mine') renderMine(cur);
  }

  function renderDaySlot(cur) {
    const slot = $('memberDay'); if (!slot) return;
    if (!user) { slot.innerHTML = `<section class="card member-cta"><div><h3>บันทึกวันนี้ไว้เป็นวันสำคัญของคุณ</h3><p class="muted">เข้าสู่ระบบเพื่อจดวันโปรด ใส่วันเกิดคนในครอบครัว และดูวันดีเฉพาะตัว</p></div><button class="btn primary" type="button" data-auth-open>เข้าสู่ระบบ / สมัครสมาชิก</button></section>`; return; }
    const key = iso(cur), I = W.info(cur), list = days.get(key) || [];
    const dayBranch = I.gz % 12, clashB = (dayBranch + 6) % 12;
    const notes = [];
    for (const p of people) {
      const pi = personInfo(p), msgs = [];
      if (pi.zb === clashB) msgs.push(`<span class="warnc">ชงกับปี${E.ZOD_AN[pi.zb]}</span>`);
      if (pi.kalaPlanet <= 7 && I.w + 1 === pi.kalaPlanet) msgs.push('<span class="warnc">เป็นวันกาลกิณีของคนเกิดวัน' + PL_NAME[pi.planet] + '</span>');
      const bd = p.birth_date.split('-'), g = I.g;
      if (+bd[1] === g.m && +bd[2] === g.d) msgs.push(`<span class="goodc">วันเกิดครบ ${g.y - +bd[0]} ปี 🎂</span>`);
      const good = I.flags.some(f => f === 'thongchai' || f === 'athibodi') && !I.flags.some(f => f === 'ubat' || f === 'lokawinat');
      if (!msgs.some(x => x.includes('warnc')) && good) msgs.push('<span class="goodc">วันดีสำหรับคนนี้</span>');
      if (msgs.length) notes.push(`<li><b>${esc(p.name)}</b> ${msgs.join(' ')}</li>`);
    }
    slot.innerHTML = `<section class="card">
      <h3>วันนี้ของฉัน</h3>
      ${notes.length ? `<ul class="plist">${notes.join('')}</ul>` : people.length ? '<p class="muted">วันนี้ไม่ชงและไม่ใช่วันกาลกิณีของคนที่คุณบันทึกไว้</p>' : '<p class="muted">เพิ่มวันเกิดในแท็บ "ของฉัน" เพื่อดูว่าวันไหนชงหรือเป็นวันดีของแต่ละคน</p>'}
      ${list.length ? `<ul class="saved">${list.map(r => `<li><span class="heart">♥</span><div><b>${esc(r.title)}</b>${r.note ? `<p>${esc(r.note)}</p>` : ''}</div><button class="btn tiny ghost" type="button" data-del-day="${r.id}">ลบ</button></li>`).join('')}</ul>` : ''}
      <form class="addday" id="addDayForm">
        <input id="dayTitle" required maxlength="120" placeholder="ตั้งชื่อวันนี้ เช่น ฤกษ์ขึ้นบ้านใหม่" aria-label="ชื่อวันสำคัญ">
        <input id="dayNote" maxlength="1000" placeholder="บันทึกเพิ่มเติม (ไม่บังคับ)" aria-label="บันทึก">
        <button class="btn primary" type="submit">♥ บันทึกวันนี้</button>
      </form>
      <p class="formmsg" id="dayMsg" role="status"></p>
    </section>`;
    $('addDayForm').onsubmit = async e => {
      e.preventDefault();
      const title = $('dayTitle').value.trim(), note = $('dayNote').value.trim();
      if (!title) return;
      const { error } = await sb.from('saved_days').insert({ day: key, title, note: note || null });
      if (error) { $('dayMsg').textContent = error.code === '23505' ? 'มีวันนี้ชื่อเดียวกันอยู่แล้ว' : 'บันทึกไม่สำเร็จ: ' + error.message; return; }
      await load(); W.render();
    };
  }

  function renderMine(cur) {
    const box = $('mineView'); if (!box) return;
    if (!user) { box.innerHTML = `<section class="card member-cta big"><div><h2>พื้นที่ของฉัน</h2><p class="muted">สมัครสมาชิกฟรีเพื่อบันทึกวันเกิดของคุณและคนในครอบครัว ดูสีเสื้อ อักษรกาลกิณี และวันดีเฉพาะตัวในแต่ละเดือน รวมทั้งจดวันโปรดไว้ดูทุกเครื่อง</p></div><button class="btn primary" type="button" data-auth-open>เข้าสู่ระบบ / สมัครสมาชิก</button></section>`; return; }
    const g = E.fromDn(cur);
    const upcoming = [...days.entries()].filter(([k]) => toDn(k) >= W.TODAY).slice(0, 12);
    const cards = people.map(p => {
      const pi = personInfo(p), nb = nextBirthday(p), gd = goodDaysFor(pi, g.y, g.m);
      const sri = W.PLANET[pi.seq[3].p], kala = W.PLANET[pi.seq[7].p], mon = W.PLANET[pi.seq[6].p];
      const bg = pi.g;
      return `<article class="card person">
        <header><div class="pav" style="--day:${W.PLANET[pi.planet][2]}">${E.ZOD_EMO[pi.zb]}</div>
          <div><h3>${esc(p.name)}${p.is_me ? ' <small class="me">ฉัน</small>' : ''}</h3><p class="muted">${p.relation ? esc(p.relation) + ' · ' : ''}เกิด ${W.dateLong(bg)}${p.birth_time ? ' เวลา ' + p.birth_time.slice(0, 5) + ' น.' : ''}</p></div>
          <button class="btn tiny ghost" type="button" data-del-person="${p.id}" aria-label="ลบ ${esc(p.name)}">ลบ</button></header>
        <dl class="kv">
          <dt>ดาวเจ้าวันเกิด</dt><dd>วัน${PL_NAME[pi.planet]}</dd>
          <dt>ปีนักษัตร</dt><dd>ปี${E.ZOD_AN[pi.zb]} (${E.ZOD_TH[pi.zb]}) · ${W.ZOD_TRAIT[pi.zb]}</dd>
          <dt>วันเกิดทางจันทรคติ</dt><dd>${W.lunarText(pi.I.tl)}</dd>
          <dt>สีเสริมดวง</dt><dd><i class="swi" style="background:${sri[2]}"></i>การเงิน ${sri[1]} · <i class="swi" style="background:${mon[2]}"></i>เมตตา ${mon[1]}</dd>
          <dt>สีกาลกิณี</dt><dd><i class="swi" style="background:${kala[2]}"></i>${kala[1]}</dd>
          <dt>อักษรกาลกิณี</dt><dd>${KALA_LETTERS[pi.kalaPlanet]}</dd>
          <dt>วันเกิดครั้งถัดไป</dt><dd>${nb ? (nb.inDays === 0 ? 'วันนี้! ' : `อีก ${nb.inDays} วัน · `) + `ครบ ${nb.age} ปี` : '–'}</dd>
        </dl>
        <div class="gdays"><b>วันดีของ${esc(p.name)} เดือน${W.MONTH[g.m - 1]} ${g.y + 543}</b>
          <div class="kyd">${gd.length ? gd.map(n => `<button type="button" class="kydate" data-go="${n}">${W.WD[E.fromDn(n).w].s}. ${E.fromDn(n).d}</button>`).join('') : '<span class="muted">เดือนนี้ไม่มีวันธงชัย/อธิบดีที่ไม่ชงกับคนนี้</span>'}</div>
          <p class="note">คัดจากวันธงชัยและอธิบดีที่ไม่ตรงวันกาลกิณีของปี ไม่ชงกับปีเกิด และไม่ใช่วันกาลกิณีของคนเกิดวันนี้</p></div>
      </article>`;
    }).join('');
    box.innerHTML = `
      <h2 class="vtitle">ของฉัน <small>สวัสดี ${esc(profile?.display_name || user.email)} · ดูวันดีเดือน${W.MONTH[g.m - 1]} ${g.y + 543} (เลื่อนเดือนได้ด้วยลูกศรด้านบน)</small></h2>
      <div class="grid">
        <section class="card span2">
          <h3>เพิ่มวันเกิด</h3>
          <form class="addperson" id="addPersonForm">
            <label>ชื่อ<input id="pName" required maxlength="80" placeholder="เช่น น้องมิว"></label>
            <label>ความสัมพันธ์<input id="pRel" maxlength="40" placeholder="เช่น ลูก, แม่"></label>
            <label>วันเกิด<input id="pDate" type="date" required min="1900-01-01" max="2050-12-31"></label>
            <label>เวลาเกิด<input id="pTime" type="time"></label>
            <label class="chk"><input id="pMe" type="checkbox"> นี่คือฉัน</label>
            <button class="btn primary" type="submit">เพิ่ม</button>
          </form>
          <p class="note">ใส่เวลาเกิดด้วยถ้าเกิดวันพุธ เพราะหลัง 18.00 น. นับเป็นพุธกลางคืน (ราหู)</p>
          <p class="formmsg" id="pMsg" role="status"></p>
        </section>
        ${cards ? `<div class="span2 people">${cards}</div>` : '<section class="card span2"><p class="muted">ยังไม่มีวันเกิดที่บันทึกไว้ เริ่มจากวันเกิดของคุณเองได้เลย</p></section>'}
        <section class="card span2">
          <h3>วันโปรดที่จะมาถึง</h3>
          ${upcoming.length ? `<ul class="saved">${upcoming.map(([k, rs]) => { const n = toDn(k); return rs.map(r => `<li><button class="datebtn" type="button" data-go="${n}">${W.dateLong(E.fromDn(n))}</button><div><b>${esc(r.title)}</b>${r.note ? `<p>${esc(r.note)}</p>` : ''}</div><button class="btn tiny ghost" type="button" data-del-day="${r.id}">ลบ</button></li>`).join(''); }).join('')}</ul>` : '<p class="muted">ยังไม่มีวันโปรด เปิดดูวันใดก็ได้ในมุมมองรายวันแล้วกด "บันทึกวันนี้"</p>'}
        </section>
      </div>`;
    $('addPersonForm').onsubmit = async e => {
      e.preventDefault();
      const row = { name: $('pName').value.trim(), relation: $('pRel').value.trim() || null, birth_date: $('pDate').value, birth_time: $('pTime').value || null, is_me: $('pMe').checked };
      if (!row.name || !row.birth_date) return;
      const { error } = await sb.from('people').insert(row);
      if (error) { $('pMsg').textContent = 'บันทึกไม่สำเร็จ: ' + error.message; return; }
      await load(); W.render();
    };
  }

  // delete actions (with in-page confirm: second click)
  document.addEventListener('click', async e => {
    const d = e.target.closest('[data-del-day],[data-del-person]');
    if (!d) return;
    if (!d.classList.contains('confirm')) { d.classList.add('confirm'); d.textContent = 'ยืนยันลบ'; setTimeout(() => { d.classList.remove('confirm'); d.textContent = 'ลบ'; }, 3000); return; }
    const table = d.dataset.delDay ? 'saved_days' : 'people', id = d.dataset.delDay || d.dataset.delPerson;
    const { error } = await sb.from(table).delete().eq('id', id);
    if (error) { d.textContent = 'ลบไม่สำเร็จ'; return; }
    await load(); W.render();
  });

  // ---------- auth UI ----------
  function renderAuthBar() {
    const bar = $('authBar'); if (!bar) return;
    bar.innerHTML = user
      ? `<span class="who" title="${esc(user.email)}">${esc(profile?.display_name || user.email)}</span><button class="btn tiny" type="button" id="logoutBtn">ออกจากระบบ</button>`
      : `<button class="btn tiny primary" type="button" data-auth-open>เข้าสู่ระบบ</button>`;
    const lo = $('logoutBtn'); if (lo) lo.onclick = async () => { await sb.auth.signOut(); };
  }
  let mode = 'login';
  function openAuth() { $('authDlg').hidden = false; setMode(mode); $('aEmail').focus(); }
  function closeAuth() { $('authDlg').hidden = true; $('aMsg').textContent = ''; }
  function setMode(m) {
    mode = m;
    document.querySelectorAll('[data-amode]').forEach(b => b.setAttribute('aria-pressed', b.dataset.amode === m));
    $('aNameRow').hidden = m !== 'signup'; $('aPassRow').hidden = m === 'magic';
    $('aSubmit').textContent = m === 'login' ? 'เข้าสู่ระบบ' : m === 'signup' ? 'สมัครสมาชิก' : 'ส่งลิงก์เข้าระบบ';
    $('aPass').required = m !== 'magic';
    $('aPass').autocomplete = m === 'signup' ? 'new-password' : 'current-password';
  }
  document.addEventListener('click', e => { if (e.target.closest('[data-auth-open]')) openAuth(); if (e.target.closest('[data-auth-close]')) closeAuth(); const am = e.target.closest('[data-amode]'); if (am) setMode(am.dataset.amode); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('authDlg').hidden) closeAuth(); });
  const TH_ERR = m => /Invalid login/i.test(m) ? 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' : /not confirmed/i.test(m) ? 'ยังไม่ได้ยืนยันอีเมล กรุณากดลิงก์ในอีเมลที่ส่งไปก่อน' : /already registered/i.test(m) ? 'อีเมลนี้สมัครแล้ว ลองเข้าสู่ระบบแทน' : /at least 6/i.test(m) ? 'รหัสผ่านต้องยาวอย่างน้อย 6 ตัวอักษร' : /rate limit/i.test(m) ? 'ส่งอีเมลบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่' : m;
  $('authForm').onsubmit = async e => {
    e.preventDefault();
    const email = $('aEmail').value.trim(), password = $('aPass').value, msg = $('aMsg');
    msg.className = 'formmsg'; msg.textContent = 'กำลังดำเนินการ…';
    const redirect = location.origin + location.pathname;
    let res;
    if (mode === 'login') res = await sb.auth.signInWithPassword({ email, password });
    else if (mode === 'signup') res = await sb.auth.signUp({ email, password, options: { emailRedirectTo: redirect, data: { display_name: $('aName').value.trim() || email.split('@')[0] } } });
    else res = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: redirect } });
    if (res.error) { msg.className = 'formmsg err'; msg.textContent = TH_ERR(res.error.message); return; }
    if (mode === 'login' || (mode === 'signup' && res.data.session)) { closeAuth(); return; }
    msg.className = 'formmsg ok';
    msg.textContent = mode === 'signup' ? 'สมัครแล้ว กรุณาเปิดอีเมลและกดลิงก์ยืนยันเพื่อเริ่มใช้งาน' : 'ส่งลิงก์เข้าระบบไปที่อีเมลแล้ว เปิดลิงก์จากเครื่องนี้ได้เลย';
  };

  sb.auth.onAuthStateChange(async (_ev, session) => {
    const nu = session?.user || null;
    if ((nu && nu.id) === (user && user.id) && loaded) { user = nu; return; }
    user = nu;
    await load();
    W.render();
  });

  window.MEMBER = { afterRender };
  renderAuthBar();
})();
