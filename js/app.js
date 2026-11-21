/* =====================================================================
   Setavaz website prototype, 21 Nov 2026.
   One rule: nothing moves without a reason. Motion comes from the music
   (a sound map measured from each song), from the listener (tap, scroll,
   the page they open) or from the story (the star travels).
   Playback is a plain <audio> element started inside the tap itself, so
   it works in iOS Safari and Android Chrome without Web Audio.
   ===================================================================== */
(function () {
'use strict';
const SV = window.SV, U = SV.U;
const { clamp, lerp, ease, easeOut, sstep, f1, setA, girih, segD, STAR_D, trailAt } = U;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const RM = SV.RM = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
const HAS_GSAP = !!window.gsap;
let LANG = document.documentElement.lang === 'en' ? 'en' : 'fa';
const faD = SV.faD = (s) => String(s).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]).replace(/\./g, '٫');
const num = (s) => (LANG === 'fa' ? faD(s) : String(s));
const fmt = (sec) => { sec = Math.max(0, Math.floor(sec + .0001)); return num(Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0')); };
const L = (fa, en) => (LANG === 'fa' ? fa : en);
SV.lang = () => LANG;
let seedV = 11; const rnd = () => (seedV = (seedV * 16807) % 2147483647) / 2147483647;
const reseed = (s) => { seedV = s; };
const XS = { 'setareh-code': 36.82 }; // where each preview starts inside the full song
const PREV = { kahkeshan: 48.6, mehr: 48.8, 'si-o-se-pol': 48.6, jangal: 51, lenj: 51.1, bazaar: 56, 'setareh-code': 56 }; // preview lengths (s)

/* ---------- shared music features, read by every drawing ---------- */
const FX = SV.FX = { low: 0, full: 0, kick: 0, acc: 0, kicked: false, b12: new Float32Array(12), b8: new Float32Array(8) };

/* =====================================================================
   SKY: a Milky Way painted once, plus twinkles and shooting stars
   ===================================================================== */
const mw = $('#mw'), tw = $('#tw'), tg = tw.getContext('2d');
let VW = innerWidth, VH = innerHeight; const TDPR = Math.min(devicePixelRatio || 1, 1.5);
let STARS = [];
function paintMilkyWay() {
  const size = Math.ceil(Math.hypot(innerWidth, innerHeight) * 1.1), phone = innerWidth < 700;
  const dpr = Math.min(devicePixelRatio || 1, phone ? 1.25 : 1);
  mw.width = Math.round(size * dpr); mw.height = Math.round(size * dpr);
  mw.style.width = size + 'px'; mw.style.height = size + 'px';
  const x = mw.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, size, size);
  const w = size, h = size; reseed(99);
  const ang = innerWidth < innerHeight ? -1.08 : -0.46, cx = w / 2, cy = h / 2, Lh = Math.hypot(w, h), ux = Math.cos(ang), uy = Math.sin(ang), wid = Math.min(innerWidth, innerHeight) * (phone ? .24 : .17);
  const along = (t, o) => [cx + ux * t * Lh * .55 - uy * o, cy + uy * t * Lh * .55 + ux * o];
  x.globalCompositeOperation = 'lighter';
  for (let i = 0, n = phone ? 900 : 1700; i < n; i++) {
    const t = rnd() * 2 - 1, o = (rnd() + rnd() + rnd() - 1.5) * wid * 1.1, [px, py] = along(t, o), core = Math.exp(-t * t * 6), rad = wid * (.06 + rnd() * .32) * (.6 + core);
    const warm = core * .9 + rnd() * .2, col = warm > .58 ? '255,176,112' : '96,124,220', a = .02 + .042 * core;
    const gr = x.createRadialGradient(px, py, 0, px, py, rad); gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = gr; x.fillRect(px - rad, py - rad, rad * 2, rad * 2);
  }
  x.globalCompositeOperation = 'source-over';
  for (let i = 0, n = phone ? 380 : 700; i < n; i++) {
    const t = rnd() * 1.6 - .8, o = (rnd() - .5) * wid * .6, [px, py] = along(t, o), rad = wid * (.03 + rnd() * .14);
    const gr = x.createRadialGradient(px, py, 0, px, py, rad); gr.addColorStop(0, 'rgba(4,4,14,.34)'); gr.addColorStop(1, 'rgba(4,4,14,0)');
    x.fillStyle = gr; x.fillRect(px - rad, py - rad, rad * 2, rad * 2);
  }
  for (let i = 0, n = phone ? 7000 : 16000; i < n; i++) {
    let px, py;
    if (rnd() < .55) { const t = rnd() * 2 - 1, o = (rnd() + rnd() - 1) * wid * 1.3; [px, py] = along(t, o); } else { px = rnd() * w; py = rnd() * h; }
    const b = Math.pow(rnd(), 6), s = .45 + b * 1.9;
    x.fillStyle = `rgba(255,${235 + b * 20 | 0},${215 + rnd() * 40 | 0},${.22 + .7 * rnd()})`; x.fillRect(px, py, s, s);
  }
  mw.classList.add('on');
}
function sizeTwinkle() {
  VW = innerWidth; VH = innerHeight;
  tw.width = Math.round(VW * TDPR); tw.height = Math.round(VH * TDPR);
  reseed(7);
  const n = Math.min(220, Math.round(VW * VH / 5200));
  STARS = Array.from({ length: n }, (_, i) => ({ x: rnd(), y: rnd(), s: .5 + rnd() * 1.3, p: rnd() * 6.28, f: .5 + rnd() * 1.8, big: i < 9 }));
  skyDirty = true;
}
let skyDirty = true, shoot = null, nextIdleShoot = 8;
function starPath(c, x, y, s) { const k = s * .016; c.beginPath(); c.moveTo(x, y - s); c.quadraticCurveTo(x - k, y + k, x + s, y); c.quadraticCurveTo(x - k, y - k, x, y + s); c.quadraticCurveTo(x + k, y - k, x - s, y); c.quadraticCurveTo(x + k, y + k, x, y - s); c.closePath(); }
function launchShoot(t) {
  if (RM || shoot) return;
  const fromRight = rnd() < .5;
  shoot = { t0: t, x0: fromRight ? .78 + rnd() * .2 : .02 + rnd() * .2, y0: .04 + rnd() * .22, dx: (fromRight ? -1 : 1) * (.28 + rnd() * .18), dy: .16 + rnd() * .1 };
}
function drawSky(t) {
  if (RM && !skyDirty) return;
  skyDirty = false;
  const c = tg; c.setTransform(TDPR, 0, 0, TDPR, 0, 0); c.clearRect(0, 0, VW, VH);
  const lift = .55 + FX.full * .7;
  for (const s of STARS) {
    const a = clamp((RM ? .75 : .35 + .65 * Math.abs(Math.sin(t * s.f + s.p))) * lift * (s.big ? 1 : .8));
    if (s.big) { c.fillStyle = `rgba(255,238,196,${a * .9})`; starPath(c, s.x * VW, s.y * VH, (2.2 + s.s * 1.4) * (1 + FX.kick * .25)); c.fill(); }
    else { c.fillStyle = `rgba(255,248,232,${a})`; c.fillRect(s.x * VW, s.y * VH, s.s, s.s); }
  }
  if (shoot) {
    const k = t - shoot.t0;
    if (k > 1) shoot = null; else {
      const e = easeOut(k), x = VW * (shoot.x0 + shoot.dx * e), y = VH * (shoot.y0 + shoot.dy * e);
      const ang = Math.atan2(shoot.dy * VH, shoot.dx * VW), tail = Math.min(VW, VH) * .22 * (1 - k * .5);
      const gr = c.createLinearGradient(x, y, x - Math.cos(ang) * tail, y - Math.sin(ang) * tail);
      gr.addColorStop(0, `rgba(255,240,210,${1 - k})`); gr.addColorStop(1, 'rgba(255,200,120,0)');
      c.strokeStyle = gr; c.lineWidth = 1.4; c.beginPath(); c.moveTo(x, y); c.lineTo(x - Math.cos(ang) * tail, y - Math.sin(ang) * tail); c.stroke();
      c.fillStyle = `rgba(255,232,180,${1 - k})`; starPath(c, x, y, 3.2); c.fill();
    }
  }
}

/* =====================================================================
   AUDIO: one <audio> element. play() is called synchronously inside the
   tap handler (iOS rule). The visuals read a sound map measured offline
   from the same file: 12 bands, low end, kicks and accents.
   ===================================================================== */
const au = $('#au');
const A = { id: null, playing: false, wait: false, maps: {}, lastCT: 0, lastAt: 0, ki: 0, ai: 0, lastT: -1, err: 0 };
const B64 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_';
const DEC = {}; for (let i = 0; i < 64; i++) DEC[B64[i]] = i / 63;
function loadMap(id) {
  if (A.maps[id]) return;
  A.maps[id] = { loading: true };
  fetch(`assets/maps/${id}.json`).then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); }).then((m) => {
    const dec = (s) => Float32Array.from(s, (ch) => DEC[ch] || 0);
    A.maps[id] = { fps: m.fps, dur: m.dur, bpm: m.bpm, drop: m.drop, kicks: m.kicks, acc: m.acc, low: dec(m.low), full: dec(m.full), b12: m.b12.map(dec) };
  }).catch(() => { A.maps[id] = { failed: true, bpm: (SV.BY[id] || {}).bpm || 120 }; });
}
SV.playing = () => A.playing;
function dur() { const m = A.maps[A.id]; return (isFinite(au.duration) && au.duration > 0) ? au.duration : (m && m.dur) || PREV[A.id] || 50; }
function curTime(now) {
  const ct = au.currentTime || 0;
  if (!A.playing) return ct;
  if (ct !== A.lastCT) { A.lastCT = ct; A.lastAt = now; }
  return Math.min(ct + Math.max(0, now - A.lastAt) / 1000, ct + .35);
}
function play(id) {
  id = id || A.id || 'kahkeshan';
  if (A.id !== id) {
    A.id = id; A.lastCT = 0; A.ki = 0; A.ai = 0; A.lastT = -1;
    au.src = `assets/${id}.mp3`;
    loadMap(id); setPlayerSong(id);
  } else if (au.ended || (isFinite(au.duration) && au.currentTime >= au.duration - .05)) { try { au.currentTime = 0; } catch (e) {} }
  try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
  setWait(true);
  let p;
  try { p = au.play(); } catch (e) { onPlayFail(e); return; }
  if (p && p.catch) p.catch(onPlayFail);
  player.classList.add('on');
  mediaSession(id);
}
function onPlayFail(e) {
  setWait(false);
  if (e && e.name === 'AbortError') return;
  toast(L('صدا پخش نشد. یک بار دیگر بزن.', 'It did not start. Tap once more.'));
}
function pause() { au.pause(); }
function toggle(id) { if (id && id !== A.id) return play(id); if (A.playing || A.wait) pause(); else play(id); }
function next() { const i = SV.ORDER.indexOf(A.id); play(SV.ORDER[(i + 1) % SV.ORDER.length]); }
au.addEventListener('playing', () => { A.playing = true; setWait(false); A.lastAt = performance.now(); uiPlay(); });
au.addEventListener('waiting', () => { if (!au.paused) setWait(true); });
au.addEventListener('pause', () => { A.playing = false; setWait(false); uiPlay(); });
au.addEventListener('ended', () => {
  A.playing = false; uiPlay();
  const i = SV.ORDER.indexOf(A.id), nx = SV.BY[SV.ORDER[(i + 1) % SV.ORDER.length]];
  toast(L(`بعدی: ${nx.title}`, `Next: ${nx.title}`)); play(nx.id);
});
au.addEventListener('error', () => { if (!au.src) return; setWait(false); A.playing = false; uiPlay(); toast(L('این آهنگ باز نشد. اینترنت را چک کن.', 'This song could not load. Check the connection.')); });
au.addEventListener('loadedmetadata', () => { lastSealFrac = -1; });
function setWait(w) { A.wait = w; uiPlay(); }
function mediaSession(id) {
  if (!('mediaSession' in navigator)) return;
  const s = SV.BY[id];
  try {
    navigator.mediaSession.metadata = new MediaMetadata({ title: s.title, artist: 'Setavaz', album: L(s.kindFa, s.kindEn) });
    navigator.mediaSession.setActionHandler('play', () => play());
    navigator.mediaSession.setActionHandler('pause', () => pause());
    navigator.mediaSession.setActionHandler('nexttrack', () => next());
  } catch (e) {}
}
function features(now, dt) {
  FX.kicked = false;
  const dk = Math.exp(-dt * 6);
  FX.kick *= dk; FX.acc *= Math.exp(-dt * 2.2);
  if (!A.playing) {
    FX.low *= dk; FX.full *= Math.exp(-dt * 2.5);
    for (let i = 0; i < 12; i++) FX.b12[i] *= Math.exp(-dt * 3);
    for (let i = 0; i < 8; i++) FX.b8[i] *= Math.exp(-dt * 3);
    return;
  }
  const t = curTime(now), m = A.maps[A.id];
  if (m && m.low) {
    const x = t * m.fps, i0 = Math.max(0, Math.min(m.low.length - 2, Math.floor(x))), k = clamp(x - i0);
    const at = (arr) => arr[i0] + (arr[i0 + 1] - arr[i0]) * k;
    FX.low = lerp(FX.low, at(m.low), .5); FX.full = lerp(FX.full, at(m.full), .25);
    for (let j = 0; j < 12; j++) { const v = Math.pow(at(m.b12[j]), 1.3); FX.b12[j] = v > FX.b12[j] ? lerp(FX.b12[j], v, .6) : lerp(FX.b12[j], v, .18); }
    for (let j = 0; j < 8; j++) { const p = j * 11 / 7, a = Math.floor(p), b = Math.min(11, a + 1); FX.b8[j] = lerp(FX.b12[a], FX.b12[b], p - a); }
    if (t < A.lastT - .05 || t > A.lastT + .6) { A.ki = 0; while (A.ki < m.kicks.length && m.kicks[A.ki] < t) A.ki++; A.ai = 0; while (A.ai < m.acc.length && m.acc[A.ai] < t) A.ai++; }
    else {
      while (A.ki < m.kicks.length && m.kicks[A.ki] <= t) { A.ki++; FX.kick = 1; FX.kicked = true; }
      while (A.ai < m.acc.length && m.acc[A.ai] <= t) { A.ai++; FX.acc = 1; launchShoot(now / 1000); }
    }
  } else { // the map is still loading or failed: a calm pulse at the song's tempo
    const bpm = (m && m.bpm) || (SV.BY[A.id] || {}).bpm || 120, per = 60 / bpm, ph = t % per;
    if (A.lastT >= 0 && ph < (A.lastT % per)) { FX.kick = 1; FX.kicked = true; }
    FX.low = Math.exp(-ph * 9) * .7; FX.full = lerp(FX.full, .5, .05);
    for (let j = 0; j < 12; j++) FX.b12[j] = .35 + .3 * Math.sin(now / 1000 * 1.3 + j * .9);
    for (let j = 0; j < 8; j++) FX.b8[j] = FX.b12[j];
  }
  A.lastT = t;
}

/* =====================================================================
   HERO: the star map (12-petal Kahkeshan rosette) centred on the logo's star
   ===================================================================== */
const hg = $('#hg'), art = $('#art'), logoImg = $('#logoLetters'), ghost = $('#ghost');
const HG = girih(12);
const hero = { petals: [], nodes: [], rings: [], ringI: 0, R: 160 };
(function buildHero() {
  let h = '<g class="gl" id="hgl" opacity="0">';
  HG.petals.forEach((pt, k) => { h += `<g>${pt.concat([HG.inner[k]]).map((sg) => `<path pathLength="1" d="${segD(sg)}"/>`).join('')}</g>`; });
  h += '</g><circle class="hc" r="1.13" fill="none" stroke="#F4C35A" opacity=".22"/><g class="ln" id="hln">';
  HG.petals.forEach((pt, k) => { h += `<g class="pet">${pt.concat([HG.inner[k]]).map((sg) => `<path pathLength="1" d="${segD(sg)}"/>`).join('')}</g>`; });
  h += '</g>';
  HG.nodes.forEach((n) => { h += `<path class="nd" d="${STAR_D}" opacity="0" transform="translate(${n.x.toFixed(3)} ${n.y.toFixed(3)}) scale(${(.026 + .022 * n.big).toFixed(3)})"/>`; });
  for (let i = 0; i < 3; i++) h += '<circle class="ring kr" r=".5" opacity="0"/>';
  hg.setAttribute('viewBox', '-1.45 -1.45 2.9 2.9');
  hg.innerHTML = h;
  hero.petals = $$('#hln .pet', hg); hero.glow = $('#hgl', hg); hero.nodes = $$('.nd', hg); hero.rings = $$('.kr', hg).map((el) => ({ el, born: -9 })); hero.hc = $('.hc', hg);
})();
function layoutHero() {
  const vw = innerWidth, vh = innerHeight;
  const lw = Math.min(vw * .74, vh * .40, 440);
  art.style.width = lw + 'px';
  const R = Math.min(vw * .46, vh * .27, 300);
  const sx = .5240 * lw, sy = .2238 * (lw * 2117.78 / 2915.78), top = Math.max(0, R * 1.05 - sy);
  art.style.paddingTop = top + 'px';
  const S = R * 1.45 * 2;
  hg.style.width = S + 'px'; hg.style.height = S + 'px'; hg.style.left = (sx - S / 2) + 'px'; hg.style.top = (top + sy - S / 2) + 'px';
  const gs = (lw * .08626) * 2.4;
  ghost.style.width = gs + 'px'; ghost.style.height = gs + 'px'; ghost.style.left = (sx - gs / 2) + 'px'; ghost.style.top = (top + sy - gs / 2) + 'px';
  hero.R = R; const u = 1 / R;
  $('#hln', hg).setAttribute('stroke-width', (1.15 * u).toFixed(5));
  hero.glow.setAttribute('stroke-width', (5 * u).toFixed(5)); hero.glow.setAttribute('stroke-opacity', '.22');
  hero.hc.setAttribute('stroke-width', (.8 * u).toFixed(5));
}
function heroAnchor() { const r = logoImg.getBoundingClientRect(); return { x: r.left + .5240 * r.width, y: r.top + .2238 * r.height, r: .08626 * r.width }; }
let heroIntroDone = RM || !HAS_GSAP, introStarted = false;
function heroFrame(t) {
  const pl = A.playing && A.id === 'kahkeshan';
  for (let k = 0; k < 12; k++) {
    const o = pl ? .32 + .68 * FX.b12[(k + 9) % 12] : (heroIntroDone && !RM ? .62 + .12 * Math.sin(t * .6 + k * .52) + .2 * FX.b12[(k + 9) % 12] : .7);
    const el = hero.petals[k], v = Math.round(o * 100) / 100;
    if (el._o !== v) { el._o = v; el.setAttribute('opacity', v); }
  }
  const g = Math.round((A.playing ? .1 + .9 * FX.full : 0) * 100) / 100;
  if (hero.glow._o !== g) { hero.glow._o = g; hero.glow.setAttribute('opacity', g); }
  if (FX.kicked) hero.rings[hero.ringI++ % 3].born = t;
  const rings = [];
  for (const rg of hero.rings) {
    const d = (t - rg.born) / (RM ? 1.2 : .8);
    if (d >= 0 && d < 1) { const r = lerp(.45, 1.38, easeOut(d)); rings.push({ r, a: 1 - d }); rg.el.setAttribute('r', r.toFixed(3)); rg.el.setAttribute('opacity', (.8 * (1 - d)).toFixed(3)); rg.el.setAttribute('stroke-width', ((1 + 3 * (1 - d)) / hero.R).toFixed(5)); rg.on = true; }
    else if (rg.on) { rg.on = false; rg.el.setAttribute('opacity', 0); }
  }
  if (heroIntroDone) HG.nodes.forEach((n, i) => { let fl = 0; for (const rg of rings) { const dd = n.r - rg.r; fl = Math.max(fl, rg.a * Math.exp(-dd * dd / .006)); } const o = Math.round((.45 + .55 * fl) * 100) / 100, el = hero.nodes[i]; if (el._o !== o) { el._o = o; el.setAttribute('opacity', o); } });
  if (!RM) hg.style.transform = `scale(${(1 + .035 * FX.low).toFixed(4)})`;
}
function intro() {
  if (introStarted) return; introStarted = true;
  const lines = $$('#hln path', hg), glines = $$('#hgl path', hg);
  if (!HAS_GSAP || RM) {
    lines.concat(glines).forEach((el) => { el.style.strokeDasharray = 'none'; el.style.strokeDashoffset = '0'; });
    $$('.intro').forEach((el) => { el.style.opacity = 1; });
    logoImg.style.clipPath = 'none';
    hero.nodes.forEach((el) => el.setAttribute('opacity', .45));
    trav.style.opacity = 1; heroIntroDone = true; return;
  }
  const order = []; HG.petals.forEach((_, k) => { for (let j = 0; j < 7; j++) order.push(lines[k * 7 + j]); });
  gsap.set('.intro', { y: 12 });
  gsap.timeline({ delay: .3 })
    .fromTo(trav, { opacity: 0 }, { opacity: 1, duration: 1.2, ease: 'power2.out' }, 0)
    .to(logoImg, { clipPath: 'inset(0 0 0 0%)', duration: 1.6, ease: 'power2.inOut' }, .5)
    .to(order, { strokeDashoffset: 0, duration: .55, ease: 'power1.inOut', stagger: .022 }, .8)
    .set(glines, { strokeDashoffset: 0 }, '>')
    .to(hero.nodes, { attr: { opacity: .45 }, duration: .5, stagger: .02, onComplete: () => { heroIntroDone = true; } }, '-=1.0')
    .to('.intro', { opacity: 1, y: 0, duration: .9, ease: 'power2.out', stagger: .14 }, 2.2);
}
function introNow() { // a page other than home was opened first: show the hero finished
  if (introStarted) return; introStarted = true;
  $$('#hln path, #hgl path', hg).forEach((el) => { el.style.strokeDasharray = 'none'; el.style.strokeDashoffset = '0'; });
  $$('.intro').forEach((el) => { el.style.opacity = 1; el.style.transform = 'none'; });
  logoImg.style.clipPath = 'none'; hero.nodes.forEach((el) => el.setAttribute('opacity', .45));
  heroIntroDone = true; trav.style.opacity = 1;
}

/* =====================================================================
   JOURNEY (home): four chapters on one sticky stage
   ===================================================================== */
const CH = SV.JOURNEY.map((id) => SV.BY[id]);
const stage = $('#stage'), scn = $('#scn');
const J = { worlds: [], pS: 0, cur: -1, built: false, ctx: null };
function focalBox(W, H, rtl) {
  if (W >= 900 && W / H > 1.1) return rtl ? { x: W * .05, y: H * .12, w: W * .52, h: H * .76 } : { x: W * .43, y: H * .12, w: W * .52, h: H * .76 };
  return { x: 16, y: H * .09, w: W - 32, h: H * .45 };
}
function mkCtx(W, H, F, big, P) { const rtl = LANG === 'fa'; return { W, H, F, rtl, big, P, M: Math.min(F.w, F.h), X: (u) => F.x + (rtl ? u : 1 - u) * F.w, Y: (v) => F.y + v * F.h }; }
function buildJourney() {
  const W = stage.clientWidth, H = stage.clientHeight; if (!W || !H) return;
  const F = focalBox(W, H, LANG === 'fa');
  scn.setAttribute('viewBox', `0 0 ${W} ${H}`);
  const ws = CH.map((s, i) => SV.WORLDS[s.world](mkCtx(W, H, F, false, 'j' + i)));
  scn.innerHTML = ws.map((w) => w.html).join('');
  ws.forEach((w) => { w.init(scn); w.op = -1; w.tx = null; });
  J.ctx = mkCtx(W, H, F, false, 'j'); J.worlds = ws; J.built = true; J.cur = -1;
}
function clearJourney() { scn.innerHTML = ''; J.built = false; J.worlds = []; }
const TW = .045;
function chQ(ch, p) { const a = ch / 4 + (ch > 0 ? TW : 0), len = .25 - (ch > 0 ? TW : 0) - (ch < 3 ? TW : 0); return clamp((p - a) / len); }
function starAtW(w, q) { return w.starAt ? w.starAt(q) : trailAt(w.tr, w.starS(q)); }
function journeyFrame(t) {
  if (!J.built) return null;
  const p = J.pS, ws = J.worlds;
  let trans = -1, k = 0;
  for (let b = 1; b <= 3; b++) { const pb = b / 4; if (p > pb - TW && p < pb + TW) { trans = b - 1; k = sstep((p - (pb - TW)) / (2 * TW)); } }
  const base = Math.min(3, Math.floor(p * 4));
  let star, shift = 0;
  ws.forEach((w, i) => { w.q = chQ(i, p); });
  if (trans >= 0) {
    const E = starAtW(ws[trans], 1), S = starAtW(ws[trans + 1], 0);
    shift = RM ? 0 : S[0] - E[0];
    star = [lerp(E[0], S[0], k), lerp(E[1], S[1], k) - Math.sin(k * Math.PI) * J.ctx.M * .07];
  }
  ws.forEach((w, i) => {
    let op = 0, tx = 0;
    if (trans >= 0) { if (i === trans) { op = 1 - k; tx = shift * k; } else if (i === trans + 1) { op = k; tx = shift * (k - 1); } }
    else if (i === base) op = 1;
    const ov = op.toFixed(3);
    if (w.op !== ov) { w.op = ov; w.g.setAttribute('opacity', ov); w.g.style.display = op > 0 ? '' : 'none'; }
    const tv = `translate(${f1(tx)} 0)`; if (w.tx !== tv) { w.tx = tv; w.g.setAttribute('transform', tv); }
    if (op > 0) {
      w.update(w.q, t);
      const off = (w.tr.L * (1 - w.starS(w.q))).toFixed(1);
      w.trs.forEach((el) => setA(el, 'stroke-dashoffset', off));
      if (w.trs[0]) setA(w.trs[0], 'opacity', (.12 + .3 * FX.full).toFixed(2));
    }
  });
  if (!star) star = starAtW(ws[base], ws[base].q);
  const active = trans >= 0 ? (k < .5 ? trans : trans + 1) : base;
  setChapter(active);
  const ex = ws[active].extra ? ws[active].extra() : '';
  if (chExtra._t !== ex) { chExtra._t = ex; chExtra.textContent = ex; }
  jfill.style.transform = `scaleX(${clamp(p).toFixed(3)})`;
  dots.forEach((d, i) => d.classList.toggle('on', i <= active));
  return star;
}
const chNum = $('#chNum'), chTitle = $('#chTitle'), chFa = $('#chFa'), chLine = $('#chLine'), chExtra = $('#chExtra'), chBox = $('#ch'), jfill = $('#jfill'), dots = $$('#jmap i');
function fillChapter(i) {
  const d = CH[i];
  chNum.textContent = L(d.kindFa, d.kindEn); chTitle.textContent = d.title; chFa.textContent = d.fa;
  chLine.textContent = L(d.lineFa, d.lineEn);
  $('#chListen').dataset.play = d.id; $('#chOpen').href = '#/song/' + d.id;
  $('#chOpenLbl').textContent = L('قصهٔ این فصل', 'This chapter’s story');
  uiPlay();
}
function setChapter(i) {
  if (J.cur === i) return;
  J.cur = i; fillChapter(i);
  if (HAS_GSAP && !RM) gsap.fromTo(chBox, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .7, ease: 'power2.out', overwrite: true });
}
function journeyProgress() { const r = $('#journey').getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight)); }

/* =====================================================================
   SONG PAGE: the chapter world, larger, played by the song itself
   ===================================================================== */
const sscn = $('#sscn'), sstage = $('#sstage');
const SP = { s: null, w: null, ctx: null, q: 0, qT: 0 };
const POSTER = { sky: .5, desert: .86, bridge: .55, forest: .8, sea: .72, bazaar: .4, code: .62 };
function songFocal(W, H) {
  if (W >= 900 && W / H > 1.1) return { x: W * .05, y: H * .1, w: W * .9, h: H * .64 };
  return { x: 14, y: H * .1, w: W - 28, h: H * .52 };
}
function buildSongWorld() {
  if (!SP.s) return;
  const W = sstage.clientWidth, H = sstage.clientHeight; if (!W || !H) return;
  const F = songFocal(W, H), c = mkCtx(W, H, F, true, 's');
  sscn.setAttribute('viewBox', `0 0 ${W} ${H}`);
  const w = SV.WORLDS[SP.s.world](c);
  sscn.innerHTML = w.html; w.init(sscn); w.g.setAttribute('opacity', 1);
  SP.w = w; SP.ctx = c;
}
function clearSongWorld() { sscn.innerHTML = ''; SP.w = null; }
function songQTarget() {
  if (!SP.s) return 0;
  if (A.id === SP.s.id && (A.playing || au.currentTime > .05)) return clamp(curTime(performance.now()) / dur());
  return POSTER[SP.s.world] ?? .5;
}
function songFrame(t, dt) {
  if (!SP.w) return null;
  SP.qT = songQTarget();
  SP.q = RM ? SP.qT : SP.q + (SP.qT - SP.q) * Math.min(1, dt * 3.2);
  const w = SP.w; w.q = SP.q;
  w.update(SP.q, t);
  const off = (w.tr.L * (1 - w.starS(SP.q))).toFixed(1);
  w.trs.forEach((el) => setA(el, 'stroke-dashoffset', off));
  if (w.trs[0]) setA(w.trs[0], 'opacity', (.12 + .3 * FX.full).toFixed(2));
  // the story map and the progress line
  const on = A.id === SP.s.id, tSong = on ? (XS[SP.s.id] || 0) + curTime(performance.now()) : -1;
  $$('#sMap li').forEach((li, i) => { const a = SP.s.mapT[i], b = SP.s.mapT[i + 1] ?? 1e9; li.classList.toggle('on', on && (A.playing || au.currentTime > 0) && tSong >= a && tSong < b); });
  $('#sProg').style.transform = `scaleX(${(on ? clamp(curTime(performance.now()) / dur()) : 0).toFixed(4)})`;
  const ex = w.extra ? w.extra() : '';
  return starAtW(w, SP.q);
}
function renderSong(id) {
  const s = SV.BY[id]; if (!s) return false;
  SP.s = s; SP.q = POSTER[s.world] ?? .5;
  const pg = $('#p-song'); pg.style.setProperty('--acc', s.acc);
  $('#sNo').textContent = num(String(s.i).padStart(2, '0'));
  $('#sKind').textContent = L(`${s.kindFa}: ${s.placeFa}`, `${s.kindEn}: ${s.placeEn}`);
  $('#sTitle').textContent = s.title; $('#sFa').textContent = s.fa;
  $('#sLine').textContent = L(s.lineFa, s.lineEn);
  $('#sPlay').dataset.play = s.id; $('#sPlay').setAttribute('aria-label', L(`پخش ${s.title}`, `Play ${s.title}`));
  const pl = PREV[s.id] || 49;
  $('#sLen').textContent = L(`پیش‌نمایش ${num(Math.round(pl))} ثانیه، آهنگ کامل ${fmt(s.len)}`, `${Math.round(pl)} s preview, full song ${fmt(s.len)}`);
  $('#sStoryH').textContent = L(s.lineFa.split('.')[0], s.lineEn.split('.')[0]);
  $('#sStoryP').innerHTML = (LANG === 'fa' ? s.storyFa : s.storyEn).map((p) => `<p>${esc(p)}</p>`).join('');
  $('#sMap').innerHTML = s.mapT.map((tt, i) => `<li><i></i><b>${fmt(tt)}</b><span>${esc(L(s.mapFa[i], s.mapEn[i]))}</span></li>`).join('');
  const xs = XS[s.id] || 0;
  $('#sMapNote').textContent = L(`این‌جا ${num(Math.round(pl))} ثانیه از آهنگ پخش می‌شود، از ${fmt(xs)} تا ${fmt(xs + pl)}. وقتی پخش می‌شود، لحظه‌اش روشن می‌شود.`, `This page plays ${Math.round(pl)} seconds, from ${fmt(xs)} to ${fmt(xs + pl)}. The moment you are in lights up.`);
  $('#sJobs').innerHTML = (LANG === 'fa' ? s.jobsFa : s.jobsEn).map(([a, b]) => `<div><b>${esc(a)}</b><span>${esc(b)}</span></div>`).join('');
  const bpm = LANG === 'fa' ? `${faD(s.bpm)} ضرب در دقیقه` : `${s.bpm} BPM`;
  $('#sCred').innerHTML = [
    [L('سبک', 'Genre'), L(s.genreFa, s.genreEn)], [L('ضرب', 'Tempo'), bpm], [L('کلید', 'Key'), L(s.keyFa, s.keyEn)],
    [L('رنگ دستگاه', 'Mode colour'), `<span class="sw"></span>${esc(L(s.modeFa, s.modeEn))}`, true],
    [L('طول آهنگ', 'Length'), fmt(s.len)], [L('ساخت', 'Made by'), L('ستاواز', 'Setavaz')],
    [L('سازها', 'Instruments'), `<div class="inst">${(LANG === 'fa' ? s.instFa : s.instEn).map((x) => `<span>${esc(x)}</span>`).join('')}</div>`, true, 'wide'],
  ].map(([k, v, raw, cls]) => `<div class="${cls || ''}"><dt>${esc(k)}</dt><dd>${raw ? v : esc(v)}</dd></div>`).join('');
  const nx = SV.BY[SV.ORDER[(SV.ORDER.indexOf(s.id) + 1) % SV.ORDER.length]];
  const nk = s.group === 'chapter' && nx.group === 'chapter' ? L('فصل بعد', 'Next chapter') : L('منزل بعد', 'Next stop');
  $('#sNext').href = '#/song/' + nx.id;
  $('#sNext').innerHTML = `<div><small>${esc(nk)}: ${esc(L(nx.kindFa, nx.kindEn))}</small><b>${esc(nx.title)}</b><span class="d">${esc(L(nx.lineFa, nx.lineEn))}</span></div><svg viewBox="-1.15 -1.15 2.3 2.3" aria-hidden="true">${sealInner(nx.n)}</svg>`;
  document.title = `${s.title} · Setavaz`.replace(' · ', ' - ');
  return true;
}
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function sealInner(n) { const G = girih(n); return G.segs.map((sg) => `<path d="${segD(sg)}"/>`).join('') + `<path d="${STAR_D}" transform="scale(.2)" fill="#F4C35A" stroke="none"/>`; }

/* ---------- lists: home preview, catalogue, about route, services ---------- */
function trackRow(s) {
  const no = num(String(s.i).padStart(2, '0'));
  const sub = `${L(s.fa, s.placeEn)}، ${L(s.genreFa, s.genreEn)}`.replace('، ', LANG === 'fa' ? '، ' : ', ');
  return `<li><div class="trk" data-trk="${s.id}" style="--acc:${s.acc}"><span class="no">${no}</span><svg class="seal" viewBox="-1.15 -1.15 2.3 2.3" aria-hidden="true">${sealInner(s.n)}</svg><span class="nm"><a href="#/song/${s.id}">${esc(s.title)}</a><small>${esc(L(s.kindFa, s.kindEn))}: ${esc(sub)}</small></span><span class="meta">${LANG === 'fa' ? faD(Math.round(s.bpm)) + ' ضرب' : Math.round(s.bpm) + ' BPM'}، ${fmt(s.len)}</span><button class="play" type="button" data-play="${s.id}" aria-label="${esc(L('پخش ', 'Play ') + s.title)}"><span class="ico"><span class="tri"></span><span class="bars"><i></i><i></i></span><span class="spin"></span></span></button></div></li>`.replace('، ' + fmt(s.len), (LANG === 'fa' ? '، ' : ', ') + fmt(s.len));
}
function renderLists() {
  $('#homeTracks').innerHTML = SV.ORDER.map((id) => trackRow(SV.BY[id])).join('');
  const grp = (k, fa, en, sub) => `<div class="tgroup">${esc(L(fa, en))}${sub ? ` <small>${esc(sub)}</small>` : ''}</div><ul class="tracks">${SV.SONGS.filter((s) => s.group === k).map(trackRow).join('')}</ul>`;
  $('#catalog').innerHTML = grp('prelude', 'پیش‌درآمد', 'Prelude', L('آسمان', 'The sky')) + grp('chapter', 'فصل‌های سفر', 'Chapters of the journey', L('از کویر تا دریا', 'From the desert to the sea')) + grp('single', 'تک‌آهنگ‌ها', 'Singles', L('منزل‌هایی میان راه', 'Stops along the way'));
  $('#route').innerHTML = CH.map((s) => `<a href="#/song/${s.id}"><i><svg viewBox="-1.15 -1.15 2.3 2.3" aria-hidden="true">${sealInner(s.n)}</svg></i><b>${esc(s.title)}</b><small>${esc(L(s.placeFa, s.placeEn))}</small></a>`).join('');
  const svc = [['YouTube', '<rect x="2.5" y="5.5" width="19" height="13" rx="4" fill="none" stroke="#F4C35A" stroke-width="1.2"/><path d="M10 9.2v5.6l4.6-2.8z" fill="#F4C35A"/>'],
    ['Spotify', '<circle cx="12" cy="12" r="9.5" fill="none" stroke="#F4C35A" stroke-width="1.2"/><path d="M7 9.6c3.4-1 7-.7 10 .9M7.6 12.6c2.8-.8 5.6-.5 8.1.8M8.3 15.4c2.1-.6 4.2-.4 6 .6" fill="none" stroke="#F4C35A" stroke-width="1.2" stroke-linecap="round"/>'],
    ['Apple Music', '<path d="M9.5 17.5V6.8l9-2.3v10.7" fill="none" stroke="#F4C35A" stroke-width="1.2"/><circle cx="7.4" cy="17.6" r="2.1" fill="none" stroke="#F4C35A" stroke-width="1.2"/><circle cx="16.4" cy="15.3" r="2.1" fill="none" stroke="#F4C35A" stroke-width="1.2"/>'],
    ['YouTube Music', '<circle cx="12" cy="12" r="9.5" fill="none" stroke="#F4C35A" stroke-width="1.2"/><circle cx="12" cy="12" r="5" fill="none" stroke="#F4C35A" stroke-width="1.2"/><path d="M10.6 9.8v4.4l3.6-2.2z" fill="#F4C35A"/>']];
  $$('[data-svc]').forEach((el) => { el.innerHTML = svc.map(([n, ic]) => `<a class="svc" href="#" data-soon><svg viewBox="0 0 24 24" aria-hidden="true">${ic}</svg><span><span class="n">${n}</span><small>${esc(L('به‌زودی', 'Soon'))}</small></span></a>`).join(''); });
  uiPlay();
}

/* =====================================================================
   ORNAMENTS: a girih that draws itself as it scrolls into view
   ===================================================================== */
function buildOrnament(svg) {
  const G = girih(8, { r0: .32, r1: .6, r2: .88, d: .34 });
  let h = `<circle class="hint" r="1.12"/><circle class="hint" r=".6" opacity=".5"/>`;
  h += G.segs.map((sg) => `<path class="al" pathLength="1" stroke-width=".012" stroke-dasharray="1" stroke-dashoffset="${RM ? 0 : 1}" d="${segD(sg)}"/>`).join('');
  G.nodes.forEach((n) => { h += `<path d="${STAR_D}" fill="#F4C35A" opacity=".7" transform="translate(${n.x.toFixed(3)} ${n.y.toFixed(3)}) scale(${(.03 + .02 * n.big).toFixed(3)})"/>`; });
  svg.innerHTML = h; svg._lines = $$('.al', svg); svg._f = -1;
}
function ornFrame(svg) {
  if (RM || !svg._lines) return;
  const r = svg.getBoundingClientRect(); if (!r.width) return;
  const f = Math.round(clamp((innerHeight - r.top) / (innerHeight * .75)) * 200) / 200;
  if (f === svg._f) return; svg._f = f;
  const N = svg._lines.length; svg._lines.forEach((el, i) => setA(el, 'stroke-dashoffset', (1 - clamp(f * 1.6 - i / N * .6)).toFixed(3)));
}

/* =====================================================================
   THE TRAVELLER: the logo's star. Every page tells it where to be;
   between pages it carries you through the veil.
   ===================================================================== */
const trav = $('#trav'), travHalo = $('#travHalo'), navMark = $('nav.top .mark img');
const TS = { x: innerWidth / 2, y: innerHeight * .3, r: 10, k: 14, flyUntil: 0, init: false };
let PAGE = 'home';
function dockTarget() {
  if (player.classList.contains('on')) { const r = seal.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, r: r.width * .087 }; }
  const r = navMark.getBoundingClientRect(); return { x: r.left + .524 * r.width, y: r.top + .2238 * r.height, r: Math.max(3, .08626 * r.width) };
}
function homeTarget(t, jStar) {
  const vh = innerHeight, h = heroAnchor();
  const jr = $('#journey').getBoundingClientRect(), sr = stage.getBoundingClientRect();
  const e = clamp((vh - jr.top) / vh), x = clamp((vh - jr.bottom) / (vh * .85));
  const rJ = Math.max(9, Math.min(16, J.ctx ? J.ctx.M * .045 : 12));
  const js = jStar || (J.built ? starAtW(J.worlds[0], 0) : [innerWidth / 2, vh / 2]);
  const jx = js[0] + sr.left, jy = js[1] + sr.top;
  if (e < 1) {
    const k = ease(e);
    let px = lerp(h.x, jx, k) + Math.sin(k * Math.PI) * innerWidth * .08 * (LANG === 'fa' ? 1 : -1), py = lerp(h.y, jy, k);
    if (!RM && !A.playing) { px += Math.sin(t * .7) * 2.2 * (1 - k); py += Math.cos(t * .9) * 1.8 * (1 - k); }
    return { x: px, y: py, r: lerp(h.r, rJ, k), exact: true };
  }
  if (x <= 0) return { x: jx, y: jy, r: rJ, exact: true };
  const o = $('#orn').getBoundingClientRect(), k = ease(x);
  if (o.bottom < -40) { const d = dockTarget(); return { x: d.x, y: d.y, r: d.r }; }
  return { x: lerp(jx, o.left + o.width / 2, k), y: lerp(jy, o.top + o.height / 2, k), r: lerp(rJ, o.width * .07, k), exact: true };
}
function songTarget(sStar) {
  const r = sstage.getBoundingClientRect();
  if (sStar && r.bottom > innerHeight * .35) {
    const rr = SP.w && SP.w.starR ? SP.w.starR(SP.q) : 1;
    return { x: sStar[0] + r.left, y: sStar[1] + r.top, r: Math.max(9, Math.min(20, SP.ctx.M * .04)) * rr };
  }
  return dockTarget();
}
function listTarget() {
  const cur = A.id && $(`#catalog [data-trk="${A.id}"] .seal`);
  if (cur) { const r = cur.getBoundingClientRect(); if (r.top > 60 && r.bottom < innerHeight - 90) return { x: r.left + r.width / 2, y: r.top + r.height / 2, r: r.width * .087 }; }
  return dockTarget();
}
function aboutTarget() {
  const o = $('#aboutOrn').getBoundingClientRect();
  if (o.width && o.bottom > 80 && o.top < innerHeight - 80) return { x: o.left + o.width / 2, y: o.top + o.height / 2, r: o.width * .07 };
  return dockTarget();
}
function travFrame(t, dt, tgt) {
  const now = performance.now();
  if (now < TS.flyUntil && TS.flyTo) tgt = TS.flyTo;
  if (!TS.init) { TS.x = tgt.x; TS.y = tgt.y; TS.r = tgt.r; TS.init = true; }
  const flying = now < TS.flyEnd;
  const kk = RM ? 1 : (flying ? 1 - Math.exp(-dt * 4.2) : (tgt.exact ? 1 - Math.exp(-dt * 22) : 1 - Math.exp(-dt * 7)));
  TS.x += (tgt.x - TS.x) * kk; TS.y += (tgt.y - TS.y) * kk; TS.r += (tgt.r - TS.r) * kk;
  const pulse = RM ? 1 : 1 + .32 * FX.kick, s = (TS.r / 40) * pulse;
  trav.style.transform = `translate3d(${TS.x.toFixed(1)}px, ${TS.y.toFixed(1)}px, 0) scale(${s.toFixed(4)})`;
  travHalo.style.opacity = (.5 + .5 * FX.full + (RM ? 0 : .15 * Math.sin(t * 1.4) * (A.playing ? 0 : 1))).toFixed(2);
  if (PAGE === 'home') { const gv = clamp(clamp((innerHeight - $('#journey').getBoundingClientRect().top) / innerHeight) * 2.2) * .55; if (ghost._o !== gv) { ghost._o = gv; ghost.style.opacity = gv; } }
}

/* =====================================================================
   PLAYER: the seal draws the song's own girih as it plays, and a frieze
   of eight khatam tiles, one per band of the music
   ===================================================================== */
const player = $('#player'), seal = $('#seal'), frz = $('#frz'), fc = frz.getContext('2d');
let sealLines = [], lastSealFrac = -1;
function setPlayerSong(id) {
  const s = SV.BY[id], G = girih(s.n);
  let h = `<circle r="1.1" fill="none" stroke="rgba(244,195,90,.3)" stroke-width=".035"/>`;
  h += G.segs.map((sg) => `<path class="s0" d="${segD(sg)}"/>`).join('');
  h += G.segs.map((sg) => `<path class="s1" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" d="${segD(sg)}"/>`).join('');
  seal.innerHTML = h; sealLines = $$('.s1', seal); lastSealFrac = -1;
  player.style.setProperty('--acc', s.acc);
  $('#pTitle').textContent = s.title; $('#pTitle').href = '#/song/' + id;
}
let FZW = 0, FZH = 0;
function sizeFrieze() { const r = frz.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2); FZW = r.width; FZH = r.height; frz.width = Math.max(1, Math.round(r.width * d)); frz.height = Math.max(1, Math.round(r.height * d)); fc.setTransform(d, 0, 0, d, 0, 0); }
function drawFrieze() {
  const w = FZW, h = FZH; if (!w) return;
  fc.clearRect(0, 0, w, h);
  const n = Math.max(3, Math.min(8, Math.floor(w / 26))), cy = h / 2, step = w / n;
  fc.strokeStyle = 'rgba(244,195,90,.18)'; fc.lineWidth = 1; fc.beginPath(); fc.moveTo(0, cy); fc.lineTo(w, cy); fc.stroke();
  for (let i = 0; i < n; i++) {
    const b = A.playing ? FX.b8[Math.floor(i * 8 / n)] : .12, cx = (LANG === 'fa' ? n - 1 - i : i) * step + step / 2;
    const s = h * (.22 + .2 * b), a = .28 + .72 * b;
    fc.strokeStyle = `rgba(244,195,90,${a.toFixed(3)})`; fc.lineWidth = 1 + b * .6;
    fc.beginPath();
    for (let j = 0; j < 2; j++) { const rot = j * Math.PI / 4; for (let v = 0; v <= 4; v++) { const an = rot + v * Math.PI / 2, xx = cx + Math.cos(an) * s, yy = cy + Math.sin(an) * s; if (v === 0) fc.moveTo(xx, yy); else fc.lineTo(xx, yy); } }
    fc.stroke();
    fc.fillStyle = `rgba(255,232,180,${(.25 + .75 * b).toFixed(3)})`; fc.fillRect(cx - 1, cy - 1, 2, 2);
  }
}
function playerFrame(now) {
  const d = dur(), ct = curTime(now), frac = clamp(ct / d);
  if (Math.abs(frac - lastSealFrac) > .001) {
    lastSealFrac = frac;
    const N = sealLines.length; sealLines.forEach((el, i) => setA(el, 'stroke-dashoffset', (1 - clamp(frac * N - i)).toFixed(3)));
    $('#barFill').style.width = (frac * 100).toFixed(2) + '%'; $('#barHead').style.left = (frac * 100).toFixed(2) + '%';
    $('#bar').setAttribute('aria-valuenow', Math.round(frac * 100));
  }
  const tl = `${fmt(ct)} ${L('از', 'of')} ${fmt(d)}`, pt = $('#pTime'); if (pt._t !== tl) { pt._t = tl; pt.textContent = tl; }
  drawFrieze();
}
function uiPlay() {
  document.body.classList.toggle('playing', A.playing);
  $$('[data-play]').forEach((b) => {
    const mine = b.dataset.play === A.id;
    b.classList.toggle('is-on', mine && A.playing); b.classList.toggle('is-wait', mine && A.wait && !A.playing);
    const lb = $('[data-lbl]', b);
    if (lb) { const t = mine && A.wait && !A.playing ? L('آماده می‌شود…', 'Loading…') : mine && A.playing ? L('در حال پخش', 'Now playing') : mine && au.currentTime > 0 ? L('ادامه بده', 'Resume') : L('بزن تا بشنوی', 'Tap to listen'); if (lb._t !== t) { lb._t = t; lb.textContent = t; } }
  });
  const pp = $('#pp'); pp.classList.toggle('is-on', A.playing); pp.classList.toggle('is-wait', A.wait && !A.playing);
  pp.setAttribute('aria-label', A.playing ? L('مکث', 'Pause') : L('پخش', 'Play'));
  const cl = $('#chListenLbl'); if (cl) cl.textContent = $('#chListen').dataset.play === A.id && A.playing ? L('در حال پخش', 'Playing') : L('بشنو', 'Listen');
  $$('.trk').forEach((r) => r.classList.toggle('cur', r.dataset.trk === A.id));
}

/* ---------- toast ---------- */
const toastEl = $('#toast'); let toastT = 0;
function toast(msg) { toastEl.textContent = msg; toastEl.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('on'), 4200); }

/* ---------- language ---------- */
const i18n = $$('[data-en]'); i18n.forEach((el) => { el.dataset.faHtml = el.innerHTML; });
function setLang(l, first) {
  LANG = l;
  const html = document.documentElement; html.lang = l; html.dir = l === 'fa' ? 'rtl' : 'ltr';
  try { localStorage.setItem('sv-lang', l); } catch (e) {}
  i18n.forEach((el) => { if (l === 'en') el.textContent = el.dataset.en; else el.innerHTML = el.dataset.faHtml; });
  $$('[data-en-alt]').forEach((el) => { if (el.dataset.faAlt == null) el.dataset.faAlt = el.alt; el.alt = l === 'en' ? el.dataset.enAlt : el.dataset.faAlt; });
  $$('[data-en-aria]').forEach((el) => { if (el.dataset.faAria == null) el.dataset.faAria = el.getAttribute('aria-label') || ''; el.setAttribute('aria-label', l === 'en' ? el.dataset.enAria : el.dataset.faAria); });
  const em = $('#email'); if (em.dataset.faPh == null) em.dataset.faPh = em.placeholder; em.placeholder = l === 'en' ? em.dataset.enPh : em.dataset.faPh;
  $$('.arr').forEach((el) => { el.textContent = l === 'fa' ? '←' : '→'; });
  $('#lang').textContent = l === 'fa' ? 'EN' : 'فا'; $('#lang').setAttribute('aria-label', l === 'fa' ? 'English' : 'فارسی');
  $('#newsNote').textContent = '';
  renderLists();
  if (!first) {
    if (PAGE === 'home') { buildJourney(); if (J.cur >= 0) { const c = J.cur; J.cur = -1; setChapter(c); } layoutHero(); }
    if (PAGE === 'song' && SP.s) { renderSong(SP.s.id); buildSongWorld(); }
    if (A.id) mediaSession(A.id);
    lastSealFrac = -1; uiPlay(); setTitle();
  }
}
$('#lang').addEventListener('click', () => setLang(LANG === 'fa' ? 'en' : 'fa'));

/* =====================================================================
   ROUTER: #/  #/song/<id>  #/songs  #/about
   ===================================================================== */
const veil = $('#veil');
function parse() { const h = location.hash.replace(/^#\/?/, ''); const p = h.split('/'); if (p[0] === 'song' && SV.BY[p[1]]) return { page: 'song', id: p[1] }; if (p[0] === 'songs') return { page: 'songs' }; if (p[0] === 'about') return { page: 'about' }; return { page: 'home' }; }
function setTitle() {
  const r = parse();
  document.title = r.page === 'song' ? `${SV.BY[r.id].title} - Setavaz` : r.page === 'songs' ? L('همهٔ آهنگ‌ها - ستاواز', 'All songs - Setavaz') : r.page === 'about' ? L('داستان ستاواز', 'The story of Setavaz') : 'Setavaz Journey';
}
function show(r) {
  const prev = PAGE; PAGE = r.page;
  $$('.page').forEach((p) => { const on = p.dataset.page === r.page; p.classList.toggle('on', on); });
  $$('[data-nav]').forEach((a) => { if (a.dataset.nav === (r.page === 'song' ? 'songs' : r.page)) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  if (prev === 'home' && r.page !== 'home') clearJourney();
  if (r.page !== 'song') clearSongWorld();
  window.scrollTo(0, 0);
  if (r.page === 'home') { layoutHero(); buildJourney(); J.pS = journeyProgress(); if (J.cur < 0) { J.cur = -1; } if (!introStarted) intro(); }
  else introNow();
  if (r.page === 'song') { renderSong(r.id); buildSongWorld(); loadMap(r.id); }
  observeReveals();
  setTitle();
}
let routing = 0;
function route() {
  const r = parse(), my = ++routing;
  if (RM || !TS.init) { show(r); return; }
  const now = performance.now();
  veil.style.setProperty('--vx', (TS.x / innerWidth * 100).toFixed(1) + '%'); veil.style.setProperty('--vy', (TS.y / innerHeight * 100).toFixed(1) + '%');
  veil.style.transition = 'opacity .34s ease'; veil.style.opacity = '1';
  TS.flyTo = { x: innerWidth / 2, y: innerHeight * .46, r: 26 }; TS.flyUntil = now + 360; TS.flyEnd = now + 1500;
  setTimeout(() => {
    if (my !== routing) return;
    show(r);
    const pg = $('.page.on'); pg.classList.remove('page-in'); void pg.offsetWidth; pg.classList.add('page-in');
    requestAnimationFrame(() => { veil.style.transition = 'opacity .8s ease'; veil.style.opacity = '0'; });
  }, 360);
}
addEventListener('hashchange', route);
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

/* ---------- reveal on view ---------- */
let io = null;
function observeReveals() {
  const els = $$('.page.on .reveal:not(.in)');
  if (RM || !('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('in')); return; }
  if (!io) io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  els.forEach((el) => io.observe(el));
}

/* ---------- controls ---------- */
document.addEventListener('click', (ev) => {
  const b = ev.target.closest('[data-play]');
  if (b && b.dataset.play) { ev.preventDefault(); toggle(b.dataset.play); return; }
  const soon = ev.target.closest('[data-soon]');
  if (soon) { ev.preventDefault(); toast(L('این لینک بعد از انتشار آهنگ‌ها فعال می‌شود.', 'This link goes live once the songs are out.')); }
});
$('#pp').addEventListener('click', () => toggle());
$('#pnext').addEventListener('click', () => next());
const bar = $('#bar');
function barFrac(ev) { const r = bar.getBoundingClientRect(); let f = clamp((ev.clientX - r.left) / r.width); if (LANG === 'fa') f = 1 - f; return f; }
function seekFrac(f) { try { au.currentTime = clamp(f) * dur(); A.lastCT = -1; lastSealFrac = -1; } catch (e) {} }
let dragging = false;
bar.addEventListener('pointerdown', (ev) => { dragging = true; try { bar.setPointerCapture(ev.pointerId); } catch (e) {} seekFrac(barFrac(ev)); });
bar.addEventListener('pointermove', (ev) => { if (dragging) seekFrac(barFrac(ev)); });
bar.addEventListener('pointerup', () => { dragging = false; });
bar.addEventListener('keydown', (ev) => { const f = (au.currentTime || 0) / dur(), dirn = LANG === 'fa' ? -1 : 1; if (ev.key === 'ArrowRight') seekFrac(f + .05 * dirn); if (ev.key === 'ArrowLeft') seekFrac(f - .05 * dirn); });
document.addEventListener('keydown', (ev) => {
  if (ev.key !== ' ' || ev.target.closest('input,textarea,button,a,[role="slider"]')) return;
  ev.preventDefault(); toggle();
});
$('#newsForm').addEventListener('submit', (ev) => {
  ev.preventDefault();
  const v = $('#email').value.trim(), ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  $('#newsNote').textContent = !ok ? L('یک ایمیل درست بنویس.', 'Please write a valid email.') : L('این فقط نمونه است. چیزی فرستاده نشد.', 'This is only a prototype. Nothing was sent.');
});

/* ---------- the loop ---------- */
let lastT = performance.now() / 1000, lastW = innerWidth, lastH = innerHeight;
const orn = $('#ornSvg'), aorn = $('#aboutOrnSvg');
function frame(now) {
  requestAnimationFrame(frame);
  const t = now / 1000, dt = Math.min(.05, Math.max(0, t - lastT)); lastT = t;
  features(now, dt);
  if (!RM && !A.playing && t > nextIdleShoot) { nextIdleShoot = t + 11 + Math.random() * 9; launchShoot(t); }
  drawSky(t);
  let tgt;
  if (PAGE === 'home') {
    if (logoImg.getBoundingClientRect().bottom > -80) heroFrame(t);
    const target = journeyProgress();
    J.pS = RM ? target : J.pS + (target - J.pS) * Math.min(1, dt * 7.5);
    if (Math.abs(J.pS - target) < .0004) J.pS = target;
    const jr = $('#journey').getBoundingClientRect();
    let star = null;
    if (jr.top < innerHeight * 1.5 && jr.bottom > -innerHeight) star = journeyFrame(t);
    tgt = homeTarget(t, star);
    ornFrame(orn);
  } else if (PAGE === 'song') { tgt = songTarget(songFrame(t, dt)); }
  else if (PAGE === 'songs') tgt = listTarget();
  else { tgt = aboutTarget(); ornFrame(aorn); }
  travFrame(t, dt, tgt);
  if (player.classList.contains('on')) playerFrame(now);
  if (A.playing || A.wait) uiTick(now);
}
let lastUi = 0; function uiTick(now) { if (now - lastUi > 500) { lastUi = now; uiPlay(); } }
function onResize() {
  const w = innerWidth, h = innerHeight, big = Math.abs(w - lastW) > 2 || Math.abs(h - lastH) / lastH > .18;
  sizeTwinkle(); layoutHero(); sizeFrieze();
  if (big) { lastW = w; lastH = h; if (PAGE === 'home') buildJourney(); if (PAGE === 'song') buildSongWorld(); paintMilkyWay(); }
}
let rzT = 0;
addEventListener('resize', () => { clearTimeout(rzT); rzT = setTimeout(onResize, 160); });
document.addEventListener('visibilitychange', () => { lastT = performance.now() / 1000; });

/* ---------- start ---------- */
SV.debug = { A, FX, au, play, pause, J, SP, TS, route: parse };
buildOrnament(orn); buildOrnament(aorn);
setLang(LANG, true);
setPlayerSong('kahkeshan');
sizeTwinkle(); sizeFrieze(); uiPlay();
show(parse());
requestAnimationFrame(frame);
setTimeout(paintMilkyWay, 60);
setTimeout(() => loadMap('kahkeshan'), 1800);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (PAGE === 'home') layoutHero(); });
})();
