/* Setavaz: the seven small worlds, one per song.
   Every world is drawn once as SVG and then only attributes change.
   q (0..1) is the story clock: on the home page it comes from scroll, on a
   song page from the song itself. Nothing moves without a reason: the
   music (SV.FX), the listener, or the story. */
(function () {
'use strict';
const SV = window.SV;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const ease = (x) => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const easeOut = (x) => 1 - Math.pow(1 - clamp(x), 3);
const sstep = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
const win = (q, a, b) => clamp((q - a) / (b - a));
const f1 = (n) => Math.round(n * 10) / 10;
const f2 = (n) => Math.round(n * 100) / 100;
const STAR_D = 'M0 -1Q-0.016 0.016 1 0Q-0.016 -0.016 0 1Q0.016 -0.016 -1 0Q0.016 0.016 0 -1Z';
let seedV = 11; const rnd = () => (seedV = (seedV * 16807) % 2147483647) / 2147483647;
const reseed = (s) => { seedV = s; };

function girih(n, p = {}) {
  const a = 2 * Math.PI / n, r0 = p.r0 ?? .30, r1 = p.r1 ?? .58, r2 = p.r2 ?? .86, d = (p.d ?? .36) * a;
  const pol = (r, th) => [r * Math.cos(th), r * Math.sin(th)];
  const petals = [], nodes = [];
  for (let k = 0; k < n; k++) {
    const th = k * a - Math.PI / 2;
    const P0 = pol(r0, th), A = pol(r1, th - a / 2), B = pol(r2, th - d), T = pol(1, th), C = pol(r2, th + d), D = pol(r1, th + a / 2);
    petals.push([[T, C], [C, D], [D, P0], [P0, A], [A, B], [B, T]]);
    nodes.push({ x: T[0], y: T[1], r: 1, big: 1 }, { x: D[0], y: D[1], r: r1, big: .55 });
  }
  const s = Math.max(1, Math.floor(n / 2) - 1), rr = r0 * .98, inner = [];
  for (let k = 0; k < n; k++) inner.push([pol(rr, k * a - Math.PI / 2), pol(rr, (k + s) * a - Math.PI / 2)]);
  const segs = [];
  petals.forEach((pt, k) => { pt.forEach((sg) => segs.push(sg)); segs.push(inner[k]); });
  return { n, petals, inner, nodes, segs };
}
const segD = (sg, cx = 0, cy = 0, R = 1) => `M${(cx + sg[0][0] * R).toFixed(2)} ${(cy + sg[0][1] * R).toFixed(2)}L${(cx + sg[1][0] * R).toFixed(2)} ${(cy + sg[1][1] * R).toFixed(2)}`;
function mkTrail(pts) { const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); return { pts, cum, L: cum[cum.length - 1] || 1 }; }
function trailAt(tr, s) {
  const d = clamp(s) * tr.L, c = tr.cum; let lo = 1, hi = c.length - 1;
  while (lo < hi) { const m = (lo + hi) >> 1; if (c[m] < d) lo = m + 1; else hi = m; }
  const i = Math.max(1, lo), k = (d - c[i - 1]) / Math.max(1e-6, c[i] - c[i - 1]), a = tr.pts[i - 1], b = tr.pts[i];
  return [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
}
const dPts = (pts) => 'M' + pts.map((p) => f1(p[0]) + ' ' + f1(p[1])).join('L');
function bez(a, b, c, d, n) { const o = []; for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t; o.push([u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0], u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1]]); } return o; }
const trailSvg = (tr, P) => `<path class="trail-g" opacity=".16" d="${dPts(tr.pts)}" stroke-dasharray="${tr.L.toFixed(1)}" stroke-dashoffset="${tr.L.toFixed(1)}"/><path class="trail" d="${dPts(tr.pts)}" stroke-dasharray="${tr.L.toFixed(1)}" stroke-dashoffset="${tr.L.toFixed(1)}"/>`;
function hexMix(a, b, k) { const pa = [1, 3, 5].map((i) => parseInt(a.substr(i, 2), 16)), pb = [1, 3, 5].map((i) => parseInt(b.substr(i, 2), 16)); return `rgb(${pa.map((v, i) => Math.round(lerp(v, pb[i], clamp(k)))).join(',')})`; }
function setA(el, name, v) { if (el['_' + name] !== v) { el['_' + name] = v; el.setAttribute(name, v); } }
const FX = () => SV.FX;
const RM = () => SV.RM;
const T = (t) => (SV.RM ? 0 : t);
const drawLines = (els, f, spread = .8, w = .2) => { const N = els.length; for (let i = 0; i < N; i++) setA(els[i], 'stroke-dashoffset', (1 - clamp((f - i / N * spread) / w)).toFixed(3)); };
const qs = (root, s) => root.querySelector(s), qsa = (root, s) => Array.from(root.querySelectorAll(s));
SV.U = { clamp, lerp, ease, easeOut, sstep, f1, f2, STAR_D, girih, segD, mkTrail, trailAt, dPts, bez, setA, hexMix, rnd, reseed, win };

/* a camel (unit height 1, feet at 0, facing left) */
const CAMEL = 'M.40 0L.36 -.42C.46 -.50 .45 -.66 .31 -.76C.19 -.96 -.04 -.99 -.12 -.80C-.18 -.68 -.30 -.64 -.40 -.70C-.48 -.76 -.52 -.92 -.58 -1.02L-.71 -1.02L-.73 -.96L-.61 -.93C-.57 -.82 -.52 -.62 -.40 -.50L-.31 -.44L-.29 0L-.23 0L-.22 -.40L.27 -.40L.30 0Z';
/* a fire temple, chahar-taq (unit width 1, base at 0) */
const TEMPLE = 'M-.5 0V-.62H-.44C-.42 -.86 -.2 -1.02 0 -1.04C.2 -1.02 .42 -.86 .44 -.62H.5V0H.2V-.34C.2 -.46 .1 -.54 0 -.58C-.1 -.54 -.2 -.46 -.2 -.34V0Z';
const ARCHO = 'M.2 0V-.34C.2 -.46 .1 -.54 0 -.58C-.1 -.54 -.2 -.46 -.2 -.34V0Z';

/* =====================================================================
   1. Mehr: the Lut desert, night to sunrise
   ===================================================================== */
function desert(c) {
  const { W, H, X, Y, M, rtl, P } = c;
  const f0 = 2 * Math.PI / (W * 1.1);
  const dune = (base, amp, f, ph) => { const pts = []; for (let i = 0; i <= 72; i++) { const x = -20 + (W + 40) * i / 72; pts.push([x, base + amp * Math.sin(x * f + ph) + amp * .45 * Math.sin(x * f * 2.3 + ph * 1.7)]); } return pts; };
  const far = dune(Y(.80), M * .045, f0 * 1.3, 1.2), mid = dune(Y(.88), M * .06, f0, .4), near = dune(Y(1.0), M * .07, f0 * .8, 2.1);
  const fill = (pts) => dPts(pts) + `L${W + 20} ${H + 20}L-20 ${H + 20}Z`;
  const yOn = (line, x) => { for (let i = 1; i < line.length; i++) if (line[i][0] >= x) { const a = line[i - 1], b = line[i], k = (x - a[0]) / (b[0] - a[0]); return lerp(a[1], b[1], k); } return line[line.length - 1][1]; };
  const lift = M * .016;
  const sunX = X(.40), sunY = Y(.36), Rs = M * .19;
  const land = [X(.86), yOn(mid, X(.86)) - lift];
  const a = bez([X(.97), Y(-.04)], [X(.66), Y(.06)], [X(.98), Y(.46)], land, 40);
  const sLandL = mkTrail(a).L;
  const crestU = (u) => { const x = X(u); return [x, yOn(mid, x) - lift]; };
  for (let i = 1; i <= 80; i++) a.push(crestU(lerp(.86, .03, i / 80)));
  const tr = mkTrail(a), sLand = sLandL / tr.L;
  const sOf = (u) => { // trail fraction where the walk reaches u
    const x = X(u); let best = 0, bd = 1e9; tr.pts.forEach((p, i) => { const d = Math.abs(p[0] - x) + (i < 40 ? 1e6 : 0); if (d < bd) { bd = d; best = i; } }); return tr.cum[best] / tr.L; };
  const sTemple = sOf(.47);
  const SG = girih(12, { r0: .3, r1: .6, r2: .86, d: .34 });
  const mapLines = SG.segs.map((sg) => `<path pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" d="${segD(sg, sunX, sunY, Rs)}"/>`).join('');
  // the temple on the far dune, right under the sun
  const tH = M * (c.big ? .13 : .11), tBase = yOn(far, sunX) + tH * .04;
  // caravan: five camels on the mid dune
  reseed(51);
  const camH = M * (c.big ? .05 : .042);
  const camels = [0, 1, 2, 3, 4].map((i) => ({ off: .05 + i * .06 + rnd() * .012, ph: rnd() * 6.28 }));
  let cam = '';
  camels.forEach((cm, i) => { cam += `<g class="cam"><g transform="scale(${f2((rtl ? 1 : -1) * camH)} ${f2(camH)})"><path d="${CAMEL}" fill="#05040b" stroke="#F4C35A" stroke-opacity=".28" stroke-width="${f2(.9 / camH)}"/><path d="M-.34 -.66L-.36 -.52" stroke="#F4C35A" stroke-opacity=".5" stroke-width="${f2(.8 / camH)}"/></g><circle class="lan" r="${f1(camH * .5)}" cx="${f1((rtl ? 1 : -1) * -.36 * camH)}" cy="${f1(-.47 * camH)}" fill="url(#${P}rgLan)"/><circle r="${f1(Math.max(1.1, camH * .05))}" cx="${f1((rtl ? 1 : -1) * -.36 * camH)}" cy="${f1(-.47 * camH)}" fill="#ffe7b0"/></g>`; });
  // footprints: one every few steps, left on the crest behind the star
  const FP = 26; let fps = '';
  for (let i = 0; i < FP; i++) fps += `<circle r="${f1(Math.max(1.1, M * .0045))}" fill="#ffd98a" opacity="0"/>`;
  // a distant bridge in the mist (the next chapter)
  const bx0 = X(.10), bw = M * .3, by = yOn(far, X(.10)) - M * .005; let br = '';
  for (let k = 0; k < 7; k++) { const cx = bx0 + (rtl ? -1 : 1) * (k - 3) * bw / 7; br += `<path d="M${f1(cx - bw * .045)} ${f1(by)}V${f1(by - M * .012)}Q${f1(cx)} ${f1(by - M * .035)} ${f1(cx + bw * .045)} ${f1(by - M * .012)}V${f1(by)}"/>`; }
  const html = `<g class="w" id="${P}w" opacity="0">
    <defs><linearGradient id="${P}lgDawn" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${Y(.88).toFixed(0)}"><stop id="${P}d0" offset="0" stop-color="#070b22" stop-opacity=".25"/><stop id="${P}d1" offset=".62" stop-color="#2a1a44" stop-opacity=".35"/><stop id="${P}d2" offset="1" stop-color="#3a2050" stop-opacity=".5"/></linearGradient>
    <radialGradient id="${P}rgSun"><stop offset="0" stop-color="#ffe2a0" stop-opacity=".85"/><stop offset=".3" stop-color="#f4b45a" stop-opacity=".32"/><stop offset="1" stop-color="#f4b45a" stop-opacity="0"/></radialGradient>
    <radialGradient id="${P}rgLan"><stop offset="0" stop-color="#ffd88a" stop-opacity=".95"/><stop offset=".4" stop-color="#ffb050" stop-opacity=".35"/><stop offset="1" stop-color="#ffb050" stop-opacity="0"/></radialGradient>
    <radialGradient id="${P}rgFire" cx=".5" cy=".9" r=".8"><stop offset="0" stop-color="#fff0c0"/><stop offset=".35" stop-color="#ffb04a"/><stop offset="1" stop-color="#b8461a" stop-opacity=".2"/></radialGradient>
    <linearGradient id="${P}lgSand" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c8925a" stop-opacity="0"/><stop offset=".5" stop-color="#d9a66a" stop-opacity=".5"/><stop offset="1" stop-color="#c8925a" stop-opacity="0"/></linearGradient></defs>
    <rect x="0" y="0" width="${W}" height="${Y(.9).toFixed(0)}" fill="url(#${P}lgDawn)"/>
    <g class="gl" id="${P}map" stroke-width="${c.big ? 1.1 : 1}" opacity=".3">${mapLines}</g>
    <g id="${P}sun" transform="translate(${f1(sunX)} ${f1(Y(1.1))})">
      <circle id="${P}sunGlow" r="${f1(M * .7)}" fill="url(#${P}rgSun)" opacity=".3"/>
      <circle r="${f1(M * .05)}" fill="#ffe1a3"/>
    </g>
    <path class="crest mist" d="${br.replace(/<path d="/g, '').replace(/"\/>/g, '')}" stroke-opacity="0" id="${P}brg"/>
    <path d="${fill(far)}" fill="#150e2a"/><path class="crest" d="${dPts(far)}" stroke-opacity=".22"/>
    <g id="${P}temple" transform="translate(${f1(sunX)} ${f1(tBase)}) scale(${f2(tH)})">
      <path d="${TEMPLE}" fill="#0b0818" stroke="#F4C35A" stroke-opacity=".38" stroke-width="${f2(1 / tH)}"/>
      <path id="${P}fire" d="${ARCHO}" fill="url(#${P}rgFire)" opacity="0"/>
      <path d="M-.56 0H.56" stroke="#F4C35A" stroke-opacity=".3" stroke-width="${f2(1 / tH)}"/>
    </g>
    <circle id="${P}fireGlow" cx="${f1(sunX)}" cy="${f1(tBase - tH * .3)}" r="${f1(tH * 1.6)}" fill="url(#${P}rgLan)" opacity="0"/>
    <path d="${fill(mid)}" fill="#0e0a1f"/><path class="crest" d="${dPts(mid)}" stroke-opacity=".5"/>
    <g id="${P}fp">${fps}</g>
    ${trailSvg(tr, P)}
    <g id="${P}cams">${cam}</g>
    <rect id="${P}storm" x="${-W}" y="${f1(Y(.45))}" width="${W * 3}" height="${f1(H - Y(.45))}" fill="url(#${P}lgSand)" opacity="0"/>
    <path d="${fill(near)}" fill="#07050f"/><path class="crest" d="${dPts(near)}" stroke-opacity=".32"/>
  </g>`;
  return { html, tr, init(root) {
    this.g = qs(root, `#${P}w`); this.sun = qs(root, `#${P}sun`); this.glow = qs(root, `#${P}sunGlow`);
    this.map = qs(root, `#${P}map`); this.lines = qsa(root, `#${P}map path`); this.stops = ['d0', 'd1', 'd2'].map((s) => qs(root, `#${P}${s}`));
    this.fire = qs(root, `#${P}fire`); this.fireGlow = qs(root, `#${P}fireGlow`); this.storm = qs(root, `#${P}storm`); this.brg = qs(root, `#${P}brg`);
    this.cams = qsa(root, `#${P}cams > g`); this.lans = qsa(root, `#${P}cams .lan`); this.fps = qsa(root, `#${P}fp circle`);
    this.trs = qsa(this.g, '.trail,.trail-g');
  }, starS(q) {
    if (q < .12) return sLand * easeOut(q / .12);
    if (q < .78) return lerp(sLand, sTemple, sstep(win(q, .12, .78)) * .25 + win(q, .12, .78) * .75);
    if (q < .9) return sTemple;
    return lerp(sTemple, 1, ease(win(q, .9, 1)));
  }, update(q, t) {
    const fx = FX(), tt = T(t);
    const rise = easeOut(win(q, .74, .96));
    setA(this.sun, 'transform', `translate(${f1(sunX)} ${f1(lerp(Y(1.1), sunY, rise))})`);
    setA(this.glow, 'opacity', (.15 + .75 * rise + .1 * fx.full).toFixed(2));
    // the star map: faint early, it shows the way again after the storm, whole at sunrise
    drawLines(this.lines, win(q, .04, .4) * .6 + win(q, .56, .7) * .2 + win(q, .8, .95) * .2, .8, .25);
    setA(this.map, 'opacity', (.22 + .2 * win(q, .56, .66) * (1 - win(q, .7, .78)) + .6 * rise + .15 * fx.full * rise).toFixed(2));
    const dawn = rise * .9 + win(q, .6, .74) * .1;
    setA(this.stops[0], 'stop-color', hexMix('#070b22', '#1b1f4a', dawn));
    setA(this.stops[1], 'stop-color', hexMix('#2a1a44', '#b2634e', dawn)); setA(this.stops[1], 'stop-opacity', (.3 + .35 * dawn).toFixed(2));
    setA(this.stops[2], 'stop-color', hexMix('#3a2050', '#f2a85c', dawn)); setA(this.stops[2], 'stop-opacity', (.45 + .45 * dawn).toFixed(2));
    const lit = win(q, .78, .82);
    setA(this.fire, 'opacity', (lit * (.75 + .25 * Math.sin(tt * 9) * .5 + .25 * fx.kick)).toFixed(2));
    setA(this.fireGlow, 'opacity', (lit * (.45 + .4 * fx.kick)).toFixed(2));
    const storm = win(q, .36, .44) * (1 - win(q, .52, .6));
    setA(this.storm, 'opacity', (storm * .55).toFixed(2));
    setA(this.storm, 'transform', `translate(${f1(((tt * 60) % W) * (rtl ? -1 : 1))} 0)`);
    setA(this.brg, 'stroke-opacity', (win(q, .88, 1) * .4).toFixed(2));
    const sNow = this.starS(q), star = trailAt(tr, sNow);
    // the caravan walks behind the star once it has landed
    const joined = win(q, .2, .3);
    camels.forEach((cm, i) => {
      const g = this.cams[i], s = Math.max(sLand, sNow - cm.off * (1.05 - .05 * i)), p = trailAt(tr, s);
      const bob = RM() ? 0 : Math.abs(Math.sin(tt * 3.6 + cm.ph)) * camH * .05;
      setA(g, 'transform', `translate(${f1(p[0])} ${f1(p[1] + lift - bob)})`);
      setA(g, 'opacity', (joined * (q > .9 ? 1 - win(q, .92, 1) * .7 : 1)).toFixed(2));
    });
    const hey = fx.kick * .6 + fx.acc;
    this.lans.forEach((el, i) => setA(el, 'opacity', clamp(.45 + .55 * (SV.playing() ? hey : .5 + .5 * Math.sin(tt * 1.5 + i))).toFixed(2)));
    // footprints
    // footprints: the kick is a step; the storm wipes the older ones away
    const sStorm = this.starS(.44);
    this.fps.forEach((el, i) => {
      const s = sNow - (i + 1) * .016;
      if (s < sLand) { setA(el, 'opacity', '0'); return; }
      const p = trailAt(tr, s); setA(el, 'cx', f1(p[0])); setA(el, 'cy', f1(p[1] + lift * .9));
      let o = (1 - i / this.fps.length) * .8;
      if (q > .44 && s < sStorm) o *= .12; else o *= 1 - storm * .85;
      if (i === 0) o = Math.min(1, o + fx.kick * .5);
      setA(el, 'opacity', o.toFixed(2));
    });
    void star;
  } };
}

/* =====================================================================
   2. Si-o-se-pol: thirty-three arches, two storeys, lit one by one
   ===================================================================== */
function bridge(c) {
  const { W, H, X, Y, M, P } = c;
  const n = 33, uR = .985, uL = .015, bay = c.F.w * (uR - uL) / n;
  const deck = Y(.455), up1 = Y(.468), up2 = Y(.548), corn = Y(.556), apex = Y(.585), spring = Y(.635), water = Y(.72);
  const xs = [X(uL), X(uR)], xa = Math.min(...xs) - bay * .4, xb = Math.max(...xs) + bay * .4;
  const uk = (k) => uR - (k + .5) * (uR - uL) / n;
  const arch = (cx, w, top, spr, base) => { const h = spr - top, l = cx - w / 2, r = cx + w / 2; return `M${f1(l)} ${f1(base)}V${f1(spr)}C${f1(l)} ${f1(spr - h * .55)} ${f1(cx - w * .12)} ${f1(top + h * .1)} ${f1(cx)} ${f1(top)}C${f1(cx + w * .12)} ${f1(top + h * .1)} ${f1(r)} ${f1(spr - h * .55)} ${f1(r)} ${f1(spr)}V${f1(base)}Z`; };
  let gal = '', galLit = '', small = '', open = '', lit = '', refl = '', pier = '', lamps = '';
  for (let k = 0; k < n; k++) {
    const cx = X(uk(k));
    const g = arch(cx, bay * .5, up1 + (up2 - up1) * .1, up1 + (up2 - up1) * .55, up2);
    gal += `<path d="${g}"/>`; galLit += `<path d="${g}" opacity="0"/>`;
    const d = arch(cx, bay * .66, apex, spring, water);
    open += `<path d="${d}"/>`; lit += `<path d="${d}" opacity="0"/>`; refl += `<path d="${d}" opacity="0"/>`;
    lamps += `<circle cx="${f1(cx)}" cy="${f1(deck - M * .004)}" r="${f1(Math.max(.9, M * .0035))}" fill="#ffe2a6" opacity=".15"/>`;
    if (k < n - 1) {
      const px = X(uk(k) - .5 * (uR - uL) / n);
      small += `<path d="${arch(px, bay * .2, up1 + (up2 - up1) * .3, up1 + (up2 - up1) * .6, up2 - (up2 - up1) * .15)}"/>`;
      pier += `<path d="${arch(px, bay * .14, water - (water - spring) * .55, water - (water - spring) * .3, water)}"/>`;
    }
  }
  const ridge = []; for (let i = 0; i <= 48; i++) { const x = -20 + (W + 40) * i / 48; ridge.push([x, Y(.43) - M * .06 * Math.max(0, Math.sin(i / 48 * Math.PI * 1.2 + .3)) - M * .012 * Math.sin(i * .9)]); }
  let rips = ''; [.05, .12, .21, .33, .48, .66, .86].forEach((f, i) => { const y = water + (H - water) * f; rips += `<line class="rip" x1="-10" y1="${f1(y)}" x2="${W + 10}" y2="${f1(y)}" stroke="#F4C35A" stroke-opacity="${(.2 - i * .02).toFixed(2)}" stroke-width="1" stroke-dasharray="${40 + i * 6} ${26 + i * 4} 8 ${30 + i * 10}" style="animation-duration:${6 + i * 1.3}s"/>`; });
  const yS = deck - M * .016;
  const pts = bez([X(1.0), Y(.66)], [X(.995), Y(.55)], [X(.985), yS], [X(.965), yS], 14);
  pts.push([X(.02), yS]);
  const tr = mkTrail(pts);
  const mirror = `translate(0 ${f1(2 * water)}) scale(1 -1)`;
  const html = `<g class="w" id="${P}w" opacity="0">
    <defs><linearGradient id="${P}lgSky" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${f1(water)}"><stop offset="0" stop-color="#070b22" stop-opacity="0"/><stop offset="1" stop-color="#2b1a3e" stop-opacity=".6"/></linearGradient>
    <linearGradient id="${P}lgWater" gradientUnits="userSpaceOnUse" x1="0" y1="${f1(water)}" x2="0" y2="${H}"><stop offset="0" stop-color="#0b0d2a"/><stop offset="1" stop-color="#03040d"/></linearGradient>
    <radialGradient id="${P}rgArch" cx=".5" cy=".8" r=".78"><stop offset="0" stop-color="#ffe0a0"/><stop offset=".55" stop-color="#eea24a" stop-opacity=".92"/><stop offset="1" stop-color="#8a4316" stop-opacity=".5"/></radialGradient>
    <linearGradient id="${P}lgFade" gradientUnits="userSpaceOnUse" x1="0" y1="${f1(water)}" x2="0" y2="${f1(water + (water - deck) * 1.05)}"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <mask id="${P}mk" maskUnits="userSpaceOnUse" x="0" y="${f1(water)}" width="${W}" height="${f1(H - water)}"><rect x="0" y="${f1(water)}" width="${W}" height="${f1(H - water)}" fill="url(#${P}lgFade)"/></mask></defs>
    <rect width="${W}" height="${f1(water)}" fill="url(#${P}lgSky)"/>
    <path d="${dPts(ridge)}L${W + 20} ${f1(water)}L-20 ${f1(water)}Z" fill="#0d0a22" opacity=".85"/>
    <path class="crest" d="${dPts(ridge)}" stroke-opacity=".12"/>
    <rect y="${f1(water)}" width="${W}" height="${f1(H - water)}" fill="url(#${P}lgWater)"/>
    <g mask="url(#${P}mk)"><g transform="${mirror}">
      <rect x="${f1(xa)}" y="${f1(deck)}" width="${f1(xb - xa)}" height="${f1(water - deck)}" fill="#0c0920" opacity=".9"/>
      <g id="${P}refl" fill="url(#${P}rgArch)" opacity=".5">${refl}</g>
    </g></g>
    ${rips}
    <rect x="-10" y="${f1(Y(.69))}" width="${f1(xa + 10)}" height="${f1(water - Y(.69))}" fill="#0a0818"/>
    <rect x="${f1(xb)}" y="${f1(Y(.69))}" width="${f1(W - xb + 10)}" height="${f1(water - Y(.69))}" fill="#0a0818"/>
    <rect x="${f1(xa)}" y="${f1(deck)}" width="${f1(xb - xa)}" height="${f1(water - deck)}" fill="#130e29"/>
    <g fill="#06050f" stroke="#F4C35A" stroke-opacity=".24" stroke-width=".6">${gal}</g>
    <g id="${P}gal" fill="url(#${P}rgArch)">${galLit}</g>
    <g fill="#08060f" stroke="#F4C35A" stroke-opacity=".18" stroke-width=".5">${small}</g>
    <path d="M${f1(xa)} ${f1(corn)}H${f1(xb)}" stroke="#F4C35A" stroke-opacity=".3" stroke-width=".8"/>
    <g fill="#040309" stroke="#F4C35A" stroke-opacity=".16" stroke-width=".6">${open}</g>
    <g id="${P}lit" fill="url(#${P}rgArch)">${lit}</g>
    <g fill="#030208" stroke="#F4C35A" stroke-opacity=".14" stroke-width=".5">${pier}</g>
    <path d="M${f1(xa)} ${f1(deck)}H${f1(xb)}" stroke="#F4C35A" stroke-opacity=".6" stroke-width="1"/>
    <path d="M${f1(xa)} ${f1(water)}H${f1(xb)}" stroke="#F4C35A" stroke-opacity=".25" stroke-width="1"/>
    <g id="${P}lamps">${lamps}</g>
    ${trailSvg(tr, P)}
  </g>`;
  return { html, tr, init(root) {
    this.g = qs(root, `#${P}w`); this.lit = qsa(root, `#${P}lit path`); this.refl = qsa(root, `#${P}refl path`); this.gal = qsa(root, `#${P}gal path`); this.lamps = qsa(root, `#${P}lamps circle`);
    this.trs = qsa(this.g, '.trail,.trail-g');
  }, starS(q) { return q < .08 ? lerp(0, .06, easeOut(q / .08)) : lerp(.06, 1, win(q, .08, .96)); }, update(q) {
    const fx = FX(), pt = trailAt(tr, this.starS(q)), us = c.rtl ? (pt[0] - c.F.x) / c.F.w : 1 - (pt[0] - c.F.x) / c.F.w;
    let count = 0;
    for (let k = 0; k < n; k++) {
      const a = clamp((uk(k) + .5 / n - us) / (1 / n)), b = clamp((uk(k) + .5 / n - us) / (1 / n) - .6);
      if (a > .5) count++;
      const o = (a * (.8 + .2 * fx.full)).toFixed(2);
      setA(this.lit[k], 'opacity', o); setA(this.refl[k], 'opacity', o);
      setA(this.gal[k], 'opacity', (b * (.55 + .3 * fx.full)).toFixed(2));
      setA(this.lamps[k], 'opacity', (.15 + .85 * a).toFixed(2));
    }
    this.count = count;
  }, extra() { const L = SV.lang(); return L === 'fa' ? `${SV.faD(this.count || 0)} طاق از ${SV.faD(33)} طاق روشن شد` : `${this.count || 0} of 33 arches lit`; } };
}

/* =====================================================================
   3. Jangal: the Hyrcanian forest; fireflies draw a ten-petal girih
   ===================================================================== */
function forest(c) {
  const { W, H, X, Y, M, P } = c;
  const C = [X(.46), Y(.44)], R = M * .31, G = girih(10, { r0: .28, r1: .55, r2: .84, d: .42 });
  reseed(321);
  const trunk = (x, w, lean, top, bot) => `M${f1(x - w / 2)} ${f1(top)}L${f1(x + w / 2)} ${f1(top)}L${f1(x + w * .62 + lean)} ${f1(bot)}L${f1(x - w * .62 + lean)} ${f1(bot)}Z`;
  let far = '', mid = '', near = '', canopy = '', ferns = '';
  for (let i = 0; i < 22; i++) { const x = (i + rnd() * .8) / 22 * (W + 40) - 20, w = W * (.004 + rnd() * .006) + 2; far += `<path d="${trunk(x, w, (rnd() - .5) * w * 2, -10, H + 10)}"/>`; }
  for (let i = 0; i < 9; i++) {
    const x = (i + .2 + rnd() * .6) / 9 * W, w = W * (.012 + rnd() * .012) + 4;
    if (Math.abs(x - C[0]) < R * .7) continue;
    mid += `<path d="${trunk(x, w, (rnd() - .5) * w, -10, H + 10)}"/>`;
    for (let b = 0; b < 2; b++) { const y = H * (.18 + rnd() * .3), dir = rnd() < .5 ? -1 : 1, L = M * (.08 + rnd() * .1); mid += `<path d="M${f1(x)} ${f1(y)}Q${f1(x + dir * L * .5)} ${f1(y - L * .1)} ${f1(x + dir * L)} ${f1(y - L * .45)}" fill="none" stroke="#071a15" stroke-width="${f1(w * .28)}" stroke-linecap="round"/>`; }
  }
  let placed = 0, tries = 0;
  while (placed < 6 && tries < 90) { tries++; const x = rnd() * W, w = Math.max(12, W * (.03 + rnd() * .03)); if (Math.abs(x - C[0]) < R * 1.25 + w) continue; near += `<path d="${trunk(x, w, (rnd() - .5) * w * 1.1, -10, H + 10)}"/>`; placed++; }
  for (let i = 0; i < 26; i++) { const x = rnd() * W, y = -M * .05 + rnd() * H * .12, r = M * (.06 + rnd() * .09); canopy += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}"/>`; }
  for (let i = 0; i < 16; i++) {
    const x = rnd() * W, y = H - rnd() * H * .05, L = M * (.05 + rnd() * .06);
    for (let j = -3; j <= 3; j++) { const a = -Math.PI / 2 + j * .32 + (rnd() - .5) * .1; ferns += `<path d="M${f1(x)} ${f1(y)}Q${f1(x + Math.cos(a) * L * .6)} ${f1(y + Math.sin(a) * L * .9)} ${f1(x + Math.cos(a) * L * 1.1)} ${f1(y + Math.sin(a) * L * .7)}"/>`; }
  }
  const targets = G.nodes.map((nd) => [nd.x, nd.y]);
  G.segs.forEach((sg, i) => { if (i % 2 === 0) targets.push([(sg[0][0] + sg[1][0]) / 2, (sg[0][1] + sg[1][1]) / 2]); });
  const flies = targets.map((tp) => ({ tx: C[0] + tp[0] * R, ty: C[1] + tp[1] * R, hx: c.F.x + rnd() * c.F.w, hy: c.F.y + rnd() * c.F.h * .95, ax: rnd() * 6.28, ay: rnd() * 6.28, sx: .3 + rnd() * .5, sy: .25 + rnd() * .45, ph: rnd() * 6.28, w: 1.4 + rnd() * 2, born: rnd() * .3 }));
  const wander = Array.from({ length: c.big ? 16 : 9 }, () => ({ hx: rnd() * W, hy: H * (.2 + rnd() * .75), ax: rnd() * 6.28, sx: .2 + rnd() * .4, ph: rnd() * 6.28, w: 1 + rnd() * 2 }));
  const fr = M * (c.big ? .05 : .04);
  let fl = ''; flies.concat(wander).forEach(() => { fl += `<g><circle r="${f1(fr)}" fill="url(#${P}rgFly)"/><circle r="${f1(fr * .32)}" fill="url(#${P}rgFly)" opacity=".9"/><circle r="${f1(Math.max(1.2, fr * .09))}" fill="#f8ffc8"/></g>`; });
  const lines = G.segs.map((sg) => `<path pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" d="${segD(sg, C[0], C[1], R)}"/>`).join('');
  let rays = ''; [[.70, .10], [.38, .07], [.12, .09]].forEach(([u, w], i) => { const x0 = X(u), x1 = x0 + W * .18 * (c.rtl ? -1 : 1), ww = W * w; rays += `<path class="ray" d="M${f1(x0 - ww * .3)} -10L${f1(x0 + ww * .3)} -10L${f1(x1 + ww)} ${H}L${f1(x1 - ww)} ${H}Z" fill="url(#${P}lgRay)" opacity=".5"/>`; void i; });
  let birds = ''; for (let i = 0; i < 6; i++) birds += `<path d="M-1 0Q-.5 -.55 0 0Q.5 -.55 1 0" fill="none" stroke="#e8f0d8" stroke-width=".18" stroke-linecap="round" opacity="0"/>`;
  const a = []; for (let i = 0; i <= 40; i++) { const k = i / 40; a.push([X(lerp(.97, .46, k)), Y(lerp(.55, .44, k) + .07 * Math.sin(k * Math.PI * 2.5) * (1 - k))]); }
  a[a.length - 1] = [C[0], C[1]];
  const lenA = mkTrail(a).L;
  for (let i = 1; i <= 24; i++) { const k = i / 24; a.push([X(lerp(.46, .02, k)), Y(lerp(.44, .58, k) + .05 * Math.sin(k * Math.PI))]); }
  const tr = mkTrail(a), sA = lenA / tr.L;
  const html = `<g class="w" id="${P}w" opacity="0">
    <defs><linearGradient id="${P}lgForest" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#03120e" stop-opacity=".25"/><stop offset="1" stop-color="#020a08" stop-opacity=".9"/></linearGradient>
    <radialGradient id="${P}rgFly"><stop offset="0" stop-color="#f4ffb0" stop-opacity=".9"/><stop offset=".25" stop-color="#d8f07a" stop-opacity=".35"/><stop offset="1" stop-color="#cfe86a" stop-opacity="0"/></radialGradient>
    <linearGradient id="${P}lgRay" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d7f0de" stop-opacity=".16"/><stop offset="1" stop-color="#d7f0de" stop-opacity="0"/></linearGradient>
    <linearGradient id="${P}lgFog" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe7d8" stop-opacity="0"/><stop offset=".5" stop-color="#cfe7d8" stop-opacity=".08"/><stop offset="1" stop-color="#cfe7d8" stop-opacity="0"/></linearGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#${P}lgForest)"/>
    <g fill="#0b231d" opacity=".55">${far}</g>
    <g id="${P}rays">${rays}</g>
    <rect class="fog" x="${-W * .1}" y="${f1(Y(.30))}" width="${W * 1.2}" height="${f1(M * .3)}" fill="url(#${P}lgFog)" style="animation-duration:41s"/>
    <g fill="#061713">${mid}</g>
    <g fill="#020806" opacity=".95">${canopy}</g>
    <rect class="fog" x="${-W * .1}" y="${f1(Y(.55))}" width="${W * 1.2}" height="${f1(M * .35)}" fill="url(#${P}lgFog)"/>
    <g class="gl" id="${P}gir" stroke-width="${c.big ? 1.2 : 1}" stroke-opacity=".75">${lines}</g>
    ${trailSvg(tr, P)}
    <g id="${P}flies">${fl}</g>
    <g id="${P}birds">${birds}</g>
    <rect class="fog" x="${-W * .1}" y="${f1(Y(.8))}" width="${W * 1.2}" height="${f1(M * .4)}" fill="url(#${P}lgFog)" style="animation-duration:34s"/>
    <g fill="#020604">${near}</g>
    <g fill="none" stroke="#0a2018" stroke-width="${f1(Math.max(1.2, M * .006))}" stroke-linecap="round">${ferns}</g>
  </g>`;
  return { html, tr, init(root) {
    this.g = qs(root, `#${P}w`); this.fl = qsa(root, `#${P}flies > g`); this.lines = qsa(root, `#${P}gir path`); this.rays = qsa(root, `#${P}rays path`); this.birds = qsa(root, `#${P}birds path`);
    this.trs = qsa(this.g, '.trail,.trail-g');
  }, update(q, t) {
    const fx = FX(), tt = T(t);
    const form = ease(win(q, .18, .6));
    const sync = SV.playing() ? .3 + .7 * fx.kick : .5 + .5 * Math.sin(tt * 2.1);
    const nF = flies.length;
    flies.forEach((f, i) => {
      const wx = f.hx + Math.sin(tt * f.sx + f.ax) * M * .05, wy = f.hy + Math.sin(tt * f.sy + f.ay) * M * .04;
      const hv = Math.sin(tt * 1.3 + f.ph) * M * .004;
      const x = lerp(wx, f.tx + hv, form), y = lerp(wy, f.ty - hv, form);
      const own = .5 + .5 * Math.sin(tt * f.w + f.ph), born = win(q, f.born * .5, f.born * .5 + .12);
      const o = clamp(lerp(own, sync, form) * .85 + .15) * born;
      const el = this.fl[i];
      setA(el, 'transform', `translate(${f1(x)} ${f1(y)})`); setA(el, 'opacity', o.toFixed(2));
    });
    wander.forEach((f, j) => {
      const el = this.fl[nF + j], x = f.hx + Math.sin(tt * f.sx + f.ax) * M * .08, y = f.hy + Math.cos(tt * f.sx * .8 + f.ph) * M * .05;
      setA(el, 'transform', `translate(${f1(x)} ${f1(y)}) scale(.7)`); setA(el, 'opacity', (clamp(.5 + .5 * Math.sin(tt * f.w + f.ph)) * .7 * win(q, .05, .2)).toFixed(2));
    });
    drawLines(this.lines, win(q, .55, .83), .7, .3);
    this.rays.forEach((el, i) => setA(el, 'opacity', (.25 + .35 * win(q, .7, 1) + .25 * fx.full + .1 * Math.sin(tt * .3 + i)).toFixed(2)));
    const bq = win(q, .86, 1);
    this.birds.forEach((el, i) => {
      if (bq <= 0) { setA(el, 'opacity', '0'); return; }
      const k = clamp(bq * 1.3 - i * .06), x = lerp(C[0], C[0] + (c.rtl ? -1 : 1) * W * (.4 + i * .05), k), y = lerp(C[1] - R * .2, -H * .05 + i * M * .03, k), s = M * (.018 + (i % 3) * .004), flap = RM() ? 1 : .6 + .4 * Math.sin(tt * 14 + i);
      setA(el, 'transform', `translate(${f1(x)} ${f1(y)}) scale(${f2(s)} ${f2(s * flap)})`); setA(el, 'opacity', (k > 0 && k < 1 ? .8 : 0).toFixed(2));
    });
  }, starS(q) { return q < .5 ? sA * ease(q / .5) : q < .86 ? sA : lerp(sA, 1, ease((q - .86) / .14)); } };
}

/* =====================================================================
   4. Lenj: the Persian Gulf at sunset; the star becomes the compass
   ===================================================================== */
function sea(c) {
  const { W, H, X, Y, M, rtl, P } = c;
  const hz = Y(.62);
  const layers = [
    { b: Y(.645), a: M * .006, k: 2 * Math.PI / (W * .24), w: .5, fill: '#071431', so: .14 },
    { b: Y(.71), a: M * .012, k: 2 * Math.PI / (W * .34), w: .72, fill: '#06102a', so: .26 },
    { b: Y(.80), a: M * .018, k: 2 * Math.PI / (W * .46), w: .9, fill: '#040b20', so: .36 },
    { b: Y(.93), a: M * .026, k: 2 * Math.PI / (W * .62), w: 1.1, fill: '#020615', so: .46 },
  ];
  const wy = (L, x, t) => L.b + L.a * Math.sin(x * L.k + t * L.w) + L.a * .35 * Math.sin(x * L.k * 2.1 - t * L.w * 1.3 + 1.1);
  const wpts = (L, t) => { const o = []; for (let i = 0; i <= 40; i++) { const x = -20 + (W + 40) * i / 40; o.push([x, wy(L, x, t)]); } return o; };
  const Ld = M * (c.big ? .5 : .44), bx = X(.5), sgn = rtl ? 1 : -1, sw = (1 / Ld).toFixed(4);
  const hull = 'M-.64 -.19C-.54 -.08 -.42 .04 -.20 .07L.30 .07C.38 .06 .42 .02 .44 -.06L.47 -.22L.36 -.22L.34 -.13L-.36 -.10C-.46 -.10 -.56 -.14 -.64 -.19Z';
  const planks = 'M-.55 -.10C-.42 -.01 -.24 .03 0 .035L.41 .02M-.46 -.04C-.34 .03 -.2 .05 0 .055L.38 .045';
  const sail = 'M-.55 -.31L.38 -.90Q.43 -.52 .28 -.17L-.47 -.15Z';
  const seams = 'M-.30 -.46L-.24 -.15M-.04 -.62L.0 -.16M.20 -.77L.20 -.165';
  const mastTop = [-.07, -.80];
  const Cc = [X(.5), Y(.15)], Rc = M * .19, CG = girih(8, { r0: .34, r1: .62, r2: .9, d: .30 });
  let ticks = ''; for (let i = 0; i < 32; i++) { const a = i / 32 * Math.PI * 2, r1 = i % 4 === 0 ? .80 : .88; ticks += `<path d="M${f1(Math.cos(a) * r1 * Rc)} ${f1(Math.sin(a) * r1 * Rc)}L${f1(Math.cos(a) * .96 * Rc)} ${f1(Math.sin(a) * .96 * Rc)}"/>`; }
  let spikes = ''; for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 - Math.PI / 2, b1 = a - .14, b2 = a + .14; spikes += `<path d="M${f1(Math.cos(a) * Rc * 1.02)} ${f1(Math.sin(a) * Rc * 1.02)}L${f1(Math.cos(b1) * Rc * .3)} ${f1(Math.sin(b1) * Rc * .3)}L0 0L${f1(Math.cos(b2) * Rc * .3)} ${f1(Math.sin(b2) * Rc * .3)}Z"/>`; }
  const clines = CG.segs.map((sg) => `<path pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" d="${segD(sg, 0, 0, Rc * .62)}"/>`).join('');
  reseed(77); let nstars = ''; for (let i = 0; i < 40; i++) nstars += `<circle cx="${f1(rnd() * W)}" cy="${f1(rnd() * hz * .9)}" r="${f2(.5 + rnd() * .9)}" fill="#fff4dc"/>`;
  let col = ''; for (let i = 0; i < 9; i++) { const y = hz + (H - hz) * (i / 9) * .9 + 3, w = M * (.05 + i * .02); col += `<rect x="${f1(X(.26) - w / 2)}" y="${f1(y)}" width="${f1(w)}" height="${f1(Math.max(1, M * .004))}" rx="1" fill="#ffc070" opacity="${(.5 - i * .045).toFixed(2)}"/>`; }
  const mastY0 = wy(layers[1], bx, 0) + mastTop[1] * Ld, mastX0 = bx + sgn * mastTop[0] * Ld;
  const a = bez([X(.97), Y(.34)], [X(.86), Y(.28)], [X(.66), mastY0 - M * .12], [mastX0, mastY0], 30);
  const lenA = mkTrail(a).L;
  for (let i = 1; i <= 20; i++) a.push([lerp(mastX0, Cc[0], i / 20), lerp(mastY0, Cc[1], easeOut(i / 20))]);
  const tr = mkTrail(a), sA = lenA / tr.L;
  let wv = ''; layers.forEach((L, i) => { wv += `<path class="wf" fill="${L.fill}"/><path class="wc crest" stroke-opacity="${L.so}"/>`; if (i === 1) wv += '%%DHOW%%'; });
  let html = `<g class="w" id="${P}w" opacity="0">
    <defs><linearGradient id="${P}lgSea" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${f1(hz)}"><stop id="${P}s0" offset="0" stop-color="#1a1440" stop-opacity=".5"/><stop id="${P}s1" offset=".7" stop-color="#b8606a" stop-opacity=".45"/><stop id="${P}s2" offset="1" stop-color="#f2a35a" stop-opacity=".75"/></linearGradient>
    <radialGradient id="${P}rgComp"><stop offset="0" stop-color="#ffe2a0" stop-opacity=".5"/><stop offset="1" stop-color="#f4c35a" stop-opacity="0"/></radialGradient>
    <radialGradient id="${P}rgSun"><stop offset="0" stop-color="#ffe6b0"/><stop offset=".25" stop-color="#ffb060" stop-opacity=".55"/><stop offset="1" stop-color="#f08a50" stop-opacity="0"/></radialGradient>
    <linearGradient id="${P}lgSail" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a2a40"/><stop offset="1" stop-color="#0b1130"/></linearGradient>
    <radialGradient id="${P}rgLan"><stop offset="0" stop-color="#ffd88a" stop-opacity=".95"/><stop offset="1" stop-color="#ffb050" stop-opacity="0"/></radialGradient></defs>
    <rect width="${W}" height="${f1(hz)}" fill="url(#${P}lgSea)"/>
    <g id="${P}nst" opacity="0">${nstars}</g>
    <g id="${P}sun"><circle cx="${f1(X(.26))}" cy="${f1(hz)}" r="${f1(M * .36)}" fill="url(#${P}rgSun)"/><circle cx="${f1(X(.26))}" cy="${f1(hz)}" r="${f1(M * .055)}" fill="#ffe2ae"/></g>
    <g id="${P}col">${col}</g>
    <g id="${P}comp" transform="translate(${f1(Cc[0])} ${f1(Cc[1])})" opacity="0">
      <circle id="${P}compGlow" r="${f1(Rc * 1.9)}" fill="url(#${P}rgComp)" opacity="0"/>
      <circle r="${f1(Rc)}" fill="none" stroke="#F4C35A" stroke-opacity=".55" stroke-width="1"/>
      <circle r="${f1(Rc * .76)}" fill="none" stroke="#F4C35A" stroke-opacity=".25" stroke-width=".8"/>
      <g id="${P}compRot">
        <g stroke="#F4C35A" stroke-opacity=".5" stroke-width=".8">${ticks}</g>
        <g fill="#F4C35A" fill-opacity=".14" stroke="#F4C35A" stroke-opacity=".7" stroke-width=".8">${spikes}</g>
        <g class="gl" id="${P}cgir" stroke-width="1">${clines}</g>
      </g>
    </g>
    ${trailSvg(tr, P)}
    ${wv}
  </g>`;
  const dhowSvg = `<g id="${P}dhow"><g transform="scale(${f2(sgn * Ld)} ${f2(Ld)})">
      <circle cx=".41" cy="-.28" r=".12" fill="url(#${P}rgLan)" id="${P}lan"/>
      <path d="${sail}" fill="url(#${P}lgSail)" stroke="#F4C35A" stroke-opacity=".6" stroke-width="${sw}"/>
      <path d="${seams}" stroke="#F4C35A" stroke-opacity=".18" stroke-width="${sw}"/>
      <path d="M-.58 -.29L.41 -.92" stroke="#F4C35A" stroke-opacity=".75" stroke-width="${(1.4 / Ld).toFixed(4)}" stroke-linecap="round"/>
      <path d="M-.05 -.10L${mastTop[0]} ${mastTop[1]}" stroke="#F4C35A" stroke-opacity=".85" stroke-width="${(1.5 / Ld).toFixed(4)}"/>
      <path d="M${mastTop[0]} ${mastTop[1]}L-.64 -.19M${mastTop[0]} ${mastTop[1]}L.46 -.22M.28 -.17L.40 -.22" stroke="#F4C35A" stroke-opacity=".32" stroke-width="${sw}"/>
      <path id="${P}flag" d="M.41 -.92L.53 -.95L.42 -.88Z" fill="#F4C35A" fill-opacity=".7"/>
      <path d="${hull}" fill="#07060f" stroke="#F4C35A" stroke-opacity=".72" stroke-width="${sw}"/>
      <path d="${planks}" fill="none" stroke="#F4C35A" stroke-opacity=".22" stroke-width="${sw}"/>
      <rect x=".37" y="-.20" width=".04" height=".035" fill="#ffd690" opacity=".7"/>
      <circle cx=".41" cy="-.28" r=".014" fill="#ffe3a6"/>
      <path d="M.41 -.22V-.27" stroke="#F4C35A" stroke-opacity=".6" stroke-width="${sw}"/>
    </g></g>`;
  html = html.replace('%%DHOW%%', dhowSvg);
  return { html, tr, init(root) {
    this.g = qs(root, `#${P}w`);
    this.wf = qsa(this.g, '.wf'); this.wc = qsa(this.g, '.wc');
    this.dhow = qs(root, `#${P}dhow`); this.lan = qs(root, `#${P}lan`); this.flag = qs(root, `#${P}flag`);
    this.comp = qs(root, `#${P}comp`); this.rot = qs(root, `#${P}compRot`); this.cglow = qs(root, `#${P}compGlow`);
    this.cl = qsa(root, `#${P}cgir path`); this.trs = qsa(this.g, '.trail,.trail-g');
    this.sun = qs(root, `#${P}sun`); this.col = qs(root, `#${P}col`); this.nst = qs(root, `#${P}nst`); this.stops = ['s0', 's1', 's2'].map((s) => qs(root, `#${P}${s}`));
    this.lastWave = -1; this.update(0, 0);
  }, update(q, t) {
    const fx = FX(), tt = T(t);
    if (tt !== this.lastWave) { this.lastWave = tt; layers.forEach((L, i) => { const p = wpts(L, tt), d = dPts(p); this.wf[i].setAttribute('d', d + `L${W + 20} ${H + 20}L-20 ${H + 20}Z`); this.wc[i].setAttribute('d', d); }); }
    const y = wy(layers[1], bx, tt), dy = (wy(layers[1], bx + 6, tt) - wy(layers[1], bx - 6, tt)) / 12, ang = Math.atan(dy) * 180 / Math.PI * .8;
    this.dhow.setAttribute('transform', `translate(${f1(bx)} ${f1(y)}) rotate(${ang.toFixed(2)})`);
    const ar = ang * Math.PI / 180, mx = sgn * mastTop[0] * Ld, my = mastTop[1] * Ld;
    this.mast = [bx + mx * Math.cos(ar) - my * Math.sin(ar), y + mx * Math.sin(ar) + my * Math.cos(ar)];
    const night = win(q, .15, .6);
    setA(this.stops[0], 'stop-color', hexMix('#1a1440', '#050d2a', night));
    setA(this.stops[1], 'stop-color', hexMix('#b8606a', '#0d2a4a', night)); setA(this.stops[1], 'stop-opacity', (.45 - .15 * night).toFixed(2));
    setA(this.stops[2], 'stop-color', hexMix('#f2a35a', '#0f4258', night)); setA(this.stops[2], 'stop-opacity', (.75 - .25 * night).toFixed(2));
    setA(this.sun, 'transform', `translate(0 ${f1(night * M * .12)})`); setA(this.sun, 'opacity', (1 - night).toFixed(2));
    setA(this.col, 'opacity', ((1 - night) * (.7 + .3 * fx.full)).toFixed(2));
    setA(this.nst, 'opacity', (night * .9).toFixed(2));
    setA(this.lan, 'opacity', (.5 + .5 * (SV.playing() ? fx.kick : .5 + .5 * Math.sin(tt * 1.6))).toFixed(2));
    setA(this.flag, 'transform', `skewY(${(RM() ? 0 : Math.sin(tt * 3) * 6).toFixed(1)})`);
    setA(this.comp, 'opacity', win(q, .18, .48).toFixed(2));
    const settle = ease(win(q, .2, .9)), wob = RM() ? 0 : Math.sin(tt * 1.4) * 4 * (1 - settle);
    setA(this.rot, 'transform', `rotate(${((1 - settle) * 62 + wob).toFixed(2)})`);
    drawLines(this.cl, win(q, .25, .75), .7, .3);
    setA(this.cglow, 'opacity', (win(q, .8, 1) * (.75 + .25 * fx.full)).toFixed(2));
  }, starS(q) { return q < .4 ? sA * ease(q / .4) : q < .52 ? sA : lerp(sA, 1, ease((q - .52) / .33)); },
  starAt(q) {
    const p = trailAt(tr, this.starS(q));
    if (this.mast && q > .3 && q < .62) { const k = q < .4 ? (q - .3) / .1 : q > .52 ? 1 - (q - .52) / .1 : 1; return [lerp(p[0], this.mast[0], sstep(k)), lerp(p[1], this.mast[1], sstep(k))]; }
    return p;
  }, extra() { return this.q > .9 ? (SV.lang() === 'fa' ? 'سفر ادامه دارد. منزل بعدی در راه است.' : 'The journey goes on. The next stop is on its way.') : ''; } };
}

/* =====================================================================
   5. Kahkeshan: the sky the star comes from (prelude)
   ===================================================================== */
function sky(c) {
  const { W, H, X, Y, M, rtl, P } = c;
  const C = [X(.5), Y(.42)], R = M * .4, G = girih(12);
  const lines = G.petals.map((pt, k) => `<g>${pt.concat([G.inner[k]]).map((sg) => `<path pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" d="${segD(sg, C[0], C[1], R)}"/>`).join('')}</g>`).join('');
  let nodes = ''; G.nodes.forEach((n) => { nodes += `<path d="${STAR_D}" fill="#fff3d6" opacity="0" transform="translate(${f1(C[0] + n.x * R)} ${f1(C[1] + n.y * R)}) scale(${f2(M * (.008 + .007 * n.big))})"/>`; });
  let rings = ''; for (let i = 0; i < 3; i++) rings += `<circle cx="${f1(C[0])}" cy="${f1(C[1])}" r="1" fill="none" stroke="#ffd690" opacity="0"/>`;
  reseed(5); let cons = '';
  for (let i = 0; i < 4; i++) { const x0 = rnd() * W, y0 = rnd() * H * .7; let d = `M${f1(x0)} ${f1(y0)}`; let x = x0, y = y0; for (let j = 0; j < 3; j++) { x += (rnd() - .5) * M * .3; y += (rnd() - .3) * M * .15; d += `L${f1(x)} ${f1(y)}`; } cons += `<path d="${d}"/>`; }
  const hor = []; for (let i = 0; i <= 50; i++) { const x = -20 + (W + 40) * i / 50; hor.push([x, Y(.96) - M * .03 * Math.sin(i * .3 + 1) - M * .012 * Math.sin(i * .9)]); }
  const exit = [X(.98), Y(1.02)];
  const pts = [[C[0], C[1]]].concat(bez(C, [lerp(C[0], exit[0], .25), C[1] - M * .12], [lerp(C[0], exit[0], .8), Y(.6)], exit, 30).slice(1));
  const tr = mkTrail(pts);
  const html = `<g class="w" id="${P}w" opacity="0">
    <defs><radialGradient id="${P}rgCore"><stop offset="0" stop-color="#fff0c8" stop-opacity=".5"/><stop offset=".35" stop-color="#f4c35a" stop-opacity=".12"/><stop offset="1" stop-color="#f4c35a" stop-opacity="0"/></radialGradient></defs>
    <g fill="none" stroke="#F4C35A" stroke-opacity=".12" stroke-width=".7" stroke-dasharray="2 5">${cons}</g>
    <circle id="${P}core" cx="${f1(C[0])}" cy="${f1(C[1])}" r="${f1(R * 1.1)}" fill="url(#${P}rgCore)" opacity=".4"/>
    <circle cx="${f1(C[0])}" cy="${f1(C[1])}" r="${f1(R * 1.13)}" fill="none" stroke="#F4C35A" stroke-opacity=".2" stroke-width=".8"/>
    <circle cx="${f1(C[0])}" cy="${f1(C[1])}" r="${f1(R * 1.2)}" fill="none" stroke="#F4C35A" stroke-opacity=".08" stroke-width=".6" stroke-dasharray="1 6"/>
    <g class="gl" id="${P}ros" stroke-width="${c.big ? 1.2 : 1}">${lines}</g>
    <g id="${P}nodes">${nodes}</g>
    <g id="${P}rings" stroke-width="1.4">${rings}</g>
    <path d="${dPts(hor)}L${W + 20} ${H + 20}L-20 ${H + 20}Z" fill="#05040c"/>
    <path class="crest" d="${dPts(hor)}" stroke-opacity=".3"/>
    ${trailSvg(tr, P)}
  </g>`;
  return { html, tr, init(root) {
    this.g = qs(root, `#${P}w`); this.pet = qsa(root, `#${P}ros > g`); this.lines = qsa(root, `#${P}ros path`); this.nodes = qsa(root, `#${P}nodes path`); this.core = qs(root, `#${P}core`);
    this.rings = qsa(root, `#${P}rings circle`).map((el) => ({ el, born: -9 })); this.ri = 0; this.trs = qsa(this.g, '.trail,.trail-g');
  }, update(q, t) {
    const fx = FX();
    drawLines(this.lines, win(q, .02, .5), .85, .15);
    const pl = SV.playing();
    this.pet.forEach((g, k) => setA(g, 'opacity', (pl ? .35 + .65 * fx.b12[(k + 9) % 12] : .75).toFixed(2)));
    if (fx.kicked) { this.rings[this.ri++ % 3].born = t; }
    this.rings.forEach((rg) => { const d = (t - rg.born) / .9; if (d >= 0 && d < 1) { setA(rg.el, 'r', f1(lerp(R * .35, R * 1.3, easeOut(d)))); setA(rg.el, 'opacity', (.7 * (1 - d)).toFixed(2)); } else setA(rg.el, 'opacity', '0'); });
    const nl = win(q, .3, .55);
    this.nodes.forEach((el, i) => setA(el, 'opacity', (nl * (.5 + .5 * (pl ? fx.b12[i % 12] : .6))).toFixed(2)));
    setA(this.core, 'opacity', (.25 + .45 * fx.full + .3 * (1 - win(q, .8, .95))).toFixed(2));
    void rtl;
  }, starS(q) { return q < .78 ? 0 : ease(win(q, .78, 1)); } };
}

/* =====================================================================
   6. Bazaar: golden hour under the vaults; one-point perspective
   ===================================================================== */
function bazaar(c) {
  const { W, H, X, Y, M, rtl, P } = c;
  const VP = [X(.44), Y(.52)];
  const NB = 9, f = .74;
  const fw = Math.min(W * 1.02, c.F.w * 1.05), fh = c.F.h * 1.08, fbase = Y(1.04), fcx = X(.5);
  const bays = [];
  for (let k = 0; k < NB; k++) { const s = Math.pow(f, k); bays.push({ s, cx: lerp(VP[0], fcx, s), base: lerp(VP[1], fbase, s), w: fw * s * .62, h: fh * s * .8 }); }
  const archD = (b) => { const l = b.cx - b.w / 2, r = b.cx + b.w / 2, spr = b.base - b.h * .62, top = b.base - b.h; return `M${f1(l)} ${f1(b.base)}V${f1(spr)}C${f1(l)} ${f1(spr - b.h * .22)} ${f1(b.cx - b.w * .2)} ${f1(top + b.h * .06)} ${f1(b.cx)} ${f1(top)}C${f1(b.cx + b.w * .2)} ${f1(top + b.h * .06)} ${f1(r)} ${f1(spr - b.h * .22)} ${f1(r)} ${f1(spr)}V${f1(b.base)}Z`; };
  let frames = '', edges = '', shafts = '', pools = '', lamps = '', vaults = '';
  for (let k = NB - 1; k >= 0; k--) {
    const b = bays[k], ow = b.w * 1.9, oh = b.h * 1.5, depth = k / NB;
    const outer = `M${f1(b.cx - ow / 2)} ${f1(b.base + 4)}V${f1(b.base - oh)}H${f1(b.cx + ow / 2)}V${f1(b.base + 4)}Z`;
    frames += `<path d="${outer}${archD(b)}" fill-rule="evenodd" fill="${hexMix('#2a160a', '#0b0603', 1 - depth)}"/>`;
    edges += `<path d="${archD(b)}" fill="none" stroke="#F4C35A" stroke-opacity="${(.15 + .35 * (1 - depth)).toFixed(2)}" stroke-width="${f2(.6 + b.s * 1.1)}"/>`;
    if (k < NB - 1) {
      const nb = bays[k + 1], ox = lerp(b.cx, nb.cx, .5), oy = lerp(b.base - b.h * 1.02, nb.base - nb.h * 1.02, .5), ow2 = b.w * .045;
      const fx0 = ox + (rtl ? 1 : -1) * b.w * .22, fy = lerp(b.base, nb.base, .5) - 2, fw2 = b.w * .16;
      vaults += `<ellipse cx="${f1(ox)}" cy="${f1(oy)}" rx="${f1(ow2)}" ry="${f1(ow2 * .35)}" fill="#ffe7b0" opacity="${(.28 + .3 * (1 - depth)).toFixed(2)}"/>`;
      shafts += `<path d="M${f1(ox - ow2)} ${f1(oy)}L${f1(ox + ow2)} ${f1(oy)}L${f1(fx0 + fw2)} ${f1(fy)}L${f1(fx0 - fw2)} ${f1(fy)}Z" fill="url(#${P}lgShaft)" opacity=".6"/>`;
      pools += `<ellipse cx="${f1(fx0)}" cy="${f1(fy)}" rx="${f1(fw2 * 1.1)}" ry="${f1(fw2 * .16)}" fill="#ffcf7a" opacity=".22"/>`;
    }
    const ls = b.s, ly = b.base - b.h * .78, len = b.h * .1, lr = Math.max(2.2, b.h * .018);
    lamps += `<g transform="translate(${f1(b.cx)} ${f1(b.base - b.h)})"><g class="lamp"><path d="M0 0V${f1(len + b.h * .02)}" stroke="#F4C35A" stroke-opacity=".35" stroke-width="${f2(.5 + ls * .6)}"/><circle cy="${f1(len + lr * 1.6)}" r="${f1(lr * 5)}" fill="url(#${P}rgLan)" opacity=".7"/><path d="M0 ${f1(len)}l${f1(lr)} ${f1(lr * .9)}v${f1(lr * 1.4)}l${f1(-lr)} ${f1(lr * .9)}l${f1(-lr)} ${f1(-lr * .9)}v${f1(-lr * 1.4)}Z" fill="#ffd88a" stroke="#F4C35A" stroke-width="${f2(.4 + ls * .4)}"/></g></g>`;
    void ly;
  }
  reseed(9); let people = '';
  for (let i = 0; i < 9; i++) { const k = 1 + Math.floor(rnd() * 6), b = bays[k], side = rnd() < .5 ? -1 : 1, x = b.cx + side * b.w * (.18 + rnd() * .2), h = b.h * (.3 + rnd() * .06), w = h * .22; people += `<g class="pp" transform="translate(${f1(x)} ${f1(b.base)})"><path d="M${f1(-w / 2)} 0L${f1(-w * .4)} ${f1(-h * .78)}Q0 ${f1(-h * .86)} ${f1(w * .4)} ${f1(-h * .78)}L${f1(w / 2)} 0Z" fill="#0d0704"/><circle cy="${f1(-h * .88)}" r="${f1(w * .3)}" fill="#0d0704"/></g>`; }
  let motes = ''; for (let i = 0; i < (c.big ? 36 : 20); i++) motes += `<circle r="${f2(.6 + rnd() * 1.1)}" fill="#fff0c8" opacity="0"/>`;
  const moteD = Array.from({ length: c.big ? 36 : 20 }, () => ({ k: 1 + Math.floor(rnd() * (NB - 3)), u: rnd(), v: rnd(), sp: .02 + rnd() * .04, ph: rnd() * 6.28 }));
  const bird = `<path id="${P}bird" d="M-1 0Q-.5 -.55 0 0Q.5 -.55 1 0" fill="none" stroke="#2a160a" stroke-width=".22" stroke-linecap="round"/>`;
  const pts = []; for (let i = 0; i <= 50; i++) { const s = lerp(1.15, .1, i / 50); pts.push([lerp(VP[0], fcx + (rtl ? 1 : -1) * fw * .05, s), lerp(VP[1], fbase, s) - M * .04 * s]); }
  const tr = mkTrail(pts);
  const html = `<g class="w" id="${P}w" opacity="0">
    <defs><radialGradient id="${P}rgEnd"><stop offset="0" stop-color="#fff2c8"/><stop offset=".3" stop-color="#ffc867" stop-opacity=".85"/><stop offset="1" stop-color="#c06a20" stop-opacity="0"/></radialGradient>
    <linearGradient id="${P}lgShaft" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe3a0" stop-opacity=".55"/><stop offset="1" stop-color="#ffb850" stop-opacity=".04"/></linearGradient>
    <linearGradient id="${P}lgFloor" gradientUnits="userSpaceOnUse" x1="0" y1="${f1(VP[1])}" x2="0" y2="${H}"><stop offset="0" stop-color="#6a3a14"/><stop offset="1" stop-color="#120904"/></linearGradient>
    <radialGradient id="${P}rgLan"><stop offset="0" stop-color="#ffd88a" stop-opacity=".9"/><stop offset="1" stop-color="#ffb050" stop-opacity="0"/></radialGradient></defs>
    <rect width="${W}" height="${H}" fill="#1c0f06" opacity=".75"/>
    <circle id="${P}end" cx="${f1(VP[0])}" cy="${f1(VP[1] - bays[NB - 1].h * .4)}" r="${f1(M * .32)}" fill="url(#${P}rgEnd)"/>
    <path d="M-20 ${f1(VP[1])}L${W + 20} ${f1(VP[1])}L${W + 20} ${H + 20}L-20 ${H + 20}Z" fill="url(#${P}lgFloor)" opacity=".9"/>
    <g id="${P}pools">${pools}</g>
    ${frames}
    <g id="${P}vaults">${vaults}</g>
    <g id="${P}shafts" style="mix-blend-mode:screen">${shafts}</g>
    ${edges}
    <g id="${P}pp">${people}</g>
    <g id="${P}motes">${motes}</g>
    ${trailSvg(tr, P)}
    <g id="${P}lamps">${lamps}</g>
    ${bird}
  </g>`;
  return { html, tr, init(root) {
    this.g = qs(root, `#${P}w`); this.sh = qsa(root, `#${P}shafts path`); this.pools = qsa(root, `#${P}pools ellipse`); this.lamps = qsa(root, `#${P}lamps .lamp`); this.end = qs(root, `#${P}end`);
    this.motes = qsa(root, `#${P}motes circle`); this.bird = qs(root, `#${P}bird`); this.pp = qsa(root, `#${P}pp g`); this.trs = qsa(this.g, '.trail,.trail-g');
  }, update(q, t) {
    const fx = FX(), tt = T(t), pl = SV.playing();
    const crowd = pl ? .45 + .55 * fx.full : .6 + .1 * Math.sin(tt * .5);
    this.sh.forEach((el, i) => setA(el, 'opacity', (crowd * (.45 + .25 * Math.sin(tt * .4 + i * .7)) * (.7 + .3 * win(q, 0, .3))).toFixed(2)));
    this.pools.forEach((el, i) => setA(el, 'opacity', (crowd * .3).toFixed(2)));
    setA(this.end, 'opacity', (.6 + .4 * win(q, .5, 1) + .1 * fx.full).toFixed(2));
    this.lamps.forEach((el, i) => setA(el, 'transform', `rotate(${(RM() ? 0 : Math.sin(tt * 1.3 + i * .9) * 3 + fx.kick * 5 * Math.sin(i)).toFixed(2)})`));
    moteD.forEach((m, i) => { const el = this.motes[i], b = bays[m.k], x = b.cx + (m.u - .5) * b.w * .5 + Math.sin(tt * .3 + m.ph) * b.w * .05, y = b.base - b.h * ((m.v + tt * m.sp) % 1); setA(el, 'cx', f1(x)); setA(el, 'cy', f1(y)); setA(el, 'opacity', (.25 + .5 * Math.abs(Math.sin(tt * .7 + m.ph)) * crowd).toFixed(2)); });
    this.pp.forEach((el, i) => setA(el, 'opacity', (.85 + .15 * Math.sin(tt * .8 + i)).toFixed(2)));
    const ba = tt * .55, bk = bays[3], bx = bk.cx + Math.cos(ba) * bk.w * .55, by = bk.base - bk.h * (.85 + .08 * Math.sin(ba * 2)), bs = M * .018, flap = RM() ? 1 : .55 + .45 * Math.sin(tt * 16);
    setA(this.bird, 'transform', `translate(${f1(bx)} ${f1(by)}) scale(${f2(bs * (Math.sin(ba) > 0 ? 1 : -1))} ${f2(bs * flap)})`);
    setA(this.bird, 'opacity', (pl ? .9 : .5).toFixed(2));
  }, starS(q) { return lerp(0, 1, sstep(q) * .4 + q * .6); }, starR(q) { const s = lerp(1.15, .1, this.starS(q)); return .6 + .9 * s; } };
}

/* =====================================================================
   7. Setareh Code: the star writes its code on a khatam pattern
   ===================================================================== */
function code(c) {
  const { W, H, X, Y, M, rtl, P } = c;
  const s = M * (c.big ? .15 : .17), C = [X(.5), Y(.45)], Rs = M * .42;
  const cols = Math.ceil(W / s) + 1, rows = Math.ceil(H / s) + 1, ox = (W - (cols - 1) * s) / 2, oy = (H - (rows - 1) * s) / 2;
  const khatam = (r) => { let d = ''; for (let j = 0; j < 2; j++) { const rot = j * Math.PI / 4 + Math.PI / 8; for (let v = 0; v < 4; v++) { const a = rot + v * Math.PI / 2; d += (v === 0 ? 'M' : 'L') + f1(Math.cos(a) * r) + ' ' + f1(Math.sin(a) * r); } d += 'Z'; } return d; };
  const kd = khatam(s * .36);
  const tiles = [];
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { const x = ox + i * s, y = oy + j * s, dx = (x - C[0]) / Rs, dy = (y - C[1]) / Rs; const inStar = Math.abs(dx) + Math.abs(dy) < .55 || (Math.abs(dx) < .12 && Math.abs(dy) < 1) || (Math.abs(dy) < .12 && Math.abs(dx) < 1); tiles.push({ x, y, r: Math.hypot(x - C[0], y - C[1]), a: Math.atan2(y - C[1], x - C[0]), inStar }); }
  // the path: a spiral from the starting side in to the centre; a tile lights when the spiral passes its radius
  const Rmax = Math.min(Math.max(C[0], W - C[0]), H * .5) * .95, turns = 2.25, th0 = rtl ? 0 : Math.PI, dir = rtl ? -1 : 1;
  const path = []; for (let i = 0; i <= 180; i++) { const u = i / 180, r = Rmax * (1 - u), th = th0 + dir * u * turns * 2 * Math.PI; path.push([C[0] + Math.cos(th) * r, C[1] + Math.sin(th) * r * .92]); }
  const tr = mkTrail(path);
  const sAtR = (r) => { let best = 1; for (let i = 0; i < path.length; i++) if (Rmax * (1 - i / 180) <= r) { best = tr.cum[i] / tr.L; break; } return best; };
  tiles.forEach((tl) => { tl.k = tl.r > Rmax ? 2 : sAtR(tl.r); });
  let g = '', links = '';
  tiles.forEach((tl) => { g += `<path d="${kd}" transform="translate(${f1(tl.x)} ${f1(tl.y)})"/>`; });
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { const x = ox + i * s, y = oy + j * s; if (i < cols - 1) links += `M${f1(x + s * .36)} ${f1(y)}H${f1(x + s * .64)}`; if (j < rows - 1) links += `M${f1(x)} ${f1(y + s * .36)}V${f1(y + s * .64)}`; }
  let rings = ''; for (let i = 0; i < 3; i++) rings += `<circle r="1" fill="none" stroke="#bcd4ff" opacity="0"/>`;
  const html = `<g class="w" id="${P}w" opacity="0">
    <defs><radialGradient id="${P}rgC"><stop offset="0" stop-color="#cfe0ff" stop-opacity=".35"/><stop offset="1" stop-color="#7f9bd6" stop-opacity="0"/></radialGradient></defs>
    <rect width="${W}" height="${H}" fill="#050a24" opacity=".55"/>
    <circle cx="${f1(C[0])}" cy="${f1(C[1])}" r="${f1(Rs * 1.3)}" fill="url(#${P}rgC)" id="${P}glow" opacity=".3"/>
    <path d="${links}" stroke="#F4C35A" stroke-opacity=".1" stroke-width=".7" fill="none"/>
    <g id="${P}tiles" fill="none" stroke="#F4C35A" stroke-width="${c.big ? .9 : .8}">${g}</g>
    <g id="${P}rings" stroke-width="1.2">${rings}</g>
    ${trailSvg(tr, P)}
    <path id="${P}big" d="${STAR_D}" transform="translate(${f1(C[0])} ${f1(C[1])}) scale(${f1(Rs * .98)})" fill="none" stroke="#ffe2a0" stroke-width="${f2(1.2 / (Rs * .98))}" opacity="0"/>
  </g>`;
  return { html, tr, init(root) {
    this.g = qs(root, `#${P}w`); this.tl = qsa(root, `#${P}tiles path`); this.big = qs(root, `#${P}big`); this.glow = qs(root, `#${P}glow`);
    this.rings = qsa(root, `#${P}rings circle`).map((el) => ({ el, born: -9, x: 0, y: 0 })); this.ri = 0; this.trs = qsa(this.g, '.trail,.trail-g');
  }, update(q, t) {
    const fx = FX(), s2 = this.starS(q), pos = trailAt(tr, s2), fin = win(q, .86, 1);
    if (fx.kicked) { const rg = this.rings[this.ri++ % 3]; rg.born = t; rg.x = pos[0]; rg.y = pos[1]; }
    const rr = [];
    this.rings.forEach((rg) => { const d = (t - rg.born) / 1.1; if (d >= 0 && d < 1) { const r = lerp(s * .2, s * 3, easeOut(d)); rr.push({ x: rg.x, y: rg.y, r, a: 1 - d }); setA(rg.el, 'cx', f1(rg.x)); setA(rg.el, 'cy', f1(rg.y)); setA(rg.el, 'r', f1(r)); setA(rg.el, 'opacity', (.6 * (1 - d)).toFixed(2)); } else setA(rg.el, 'opacity', '0'); });
    tiles.forEach((tl, i) => {
      let o = .1;
      if (tl.k <= s2 * 1.02) o = .42 + .2 * fx.full;
      for (const r of rr) { const d = Math.abs(Math.hypot(tl.x - r.x, tl.y - r.y) - r.r); if (d < s * .6) o = Math.max(o, .9 * r.a * (1 - d / (s * .6))); }
      if (tl.inStar) o = Math.max(o, fin * (.85 + .15 * fx.full));
      else o *= 1 - fin * .5;
      setA(this.tl[i], 'stroke-opacity', o.toFixed(2));
    });
    setA(this.big, 'opacity', (fin * .9).toFixed(2));
    setA(this.glow, 'opacity', (.2 + .4 * fx.full + .4 * fin).toFixed(2));
  }, starS(q) { return Math.min(1, q * 1.08); } };
}

SV.WORLDS = { desert, bridge, forest, sea, sky, bazaar, code };
SV.girih = girih; SV.segD = segD; SV.STAR_D = STAR_D;
})();
