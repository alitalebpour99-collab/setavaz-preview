// Full check of the Setavaz preview: Chromium + WebKit, 3 sizes, FA + EN.
// Screenshots, console errors, failed requests, horizontal overflow, real play test.
import http from 'http'; import fs from 'fs'; import path from 'path';
import { chromium, webkit } from 'playwright';
const ROOT = process.cwd(), OUT = path.join(ROOT, 'out'), PORT = 8080;
fs.mkdirSync(path.join(OUT, 'shots'), { recursive: true }); fs.mkdirSync(path.join(OUT, 'picks'), { recursive: true });
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname); if (p.endsWith('/')) p += 'index.html';
  const f = path.join(ROOT, p); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end('404'); }
  const size = fs.statSync(f).size, type = TYPES[path.extname(f)] || 'application/octet-stream', range = req.headers.range;
  if (range) { const m = /bytes=(\d*)-(\d*)/.exec(range); const a = m[1] ? +m[1] : 0, b = m[2] ? +m[2] : size - 1; res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${a}-${b}/${size}`, 'Accept-Ranges': 'bytes', 'Content-Length': b - a + 1 }); return fs.createReadStream(f, { start: a, end: b }).pipe(res); }
  res.writeHead(200, { 'Content-Type': type, 'Content-Length': size, 'Accept-Ranges': 'bytes' }); fs.createReadStream(f).pipe(res);
}).listen(PORT);
const BASE = `http://localhost:${PORT}/index.html`;
const SONGS = ['kahkeshan', 'mehr', 'si-o-se-pol', 'jangal', 'lenj', 'bazaar', 'setareh-code'];
const VPS = [{ n: 390, w: 390, h: 844, mobile: true }, { n: 768, w: 768, h: 1024 }, { n: 1440, w: 1440, h: 900 }];
const PICKS = new Set([
  'chromium-390-fa-home-hero', 'chromium-390-fa-journey-1', 'chromium-390-fa-journey-2', 'chromium-390-fa-journey-3', 'chromium-390-fa-journey-4', 'chromium-390-fa-home-songs',
  'chromium-390-fa-song-kahkeshan', 'chromium-390-fa-song-mehr', 'chromium-390-fa-song-si-o-se-pol', 'chromium-390-fa-song-jangal', 'chromium-390-fa-song-lenj', 'chromium-390-fa-song-bazaar', 'chromium-390-fa-song-setareh-code',
  'chromium-390-fa-song-mehr-body', 'chromium-390-fa-songs', 'chromium-390-fa-about', 'chromium-390-fa-playing',
  'chromium-1440-fa-home-hero', 'chromium-1440-fa-journey-2', 'chromium-1440-fa-song-mehr', 'chromium-1440-fa-song-si-o-se-pol', 'chromium-1440-fa-song-bazaar', 'chromium-1440-fa-song-mehr-body', 'chromium-1440-en-song-lenj', 'chromium-1440-fa-songs',
  'webkit-390-en-home-hero', 'webkit-390-fa-song-jangal', 'webkit-768-fa-song-setareh-code', 'chromium-390-fa-reduced-home']);
const report = { errors: [], overflow: [], play: [], fps: [], shots: 0 };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function track(page, tag) {
  page.on('console', (m) => { if (m.type() === 'error') report.errors.push({ tag, kind: 'console', text: m.text().slice(0, 300) }); });
  page.on('pageerror', (e) => report.errors.push({ tag, kind: 'pageerror', text: String(e).slice(0, 300) }));
  page.on('requestfailed', (r) => { const u = r.url(); if (/\.mp3$/.test(u) && /abort/i.test(r.failure()?.errorText || '')) return; report.errors.push({ tag, kind: 'requestfailed', text: u + ' ' + (r.failure()?.errorText || '') }); });
  page.on('response', (r) => { if (r.status() >= 400) report.errors.push({ tag, kind: 'http' + r.status(), text: r.url() }); });
}
async function shot(page, name) {
  const f = path.join(OUT, 'shots', name + '.jpg');
  await page.screenshot({ path: f, type: 'jpeg', quality: 62 });
  report.shots++;
  if (PICKS.has(name)) fs.copyFileSync(f, path.join(OUT, 'picks', name + '.jpg'));
}
async function overflow(page, tag) {
  const r = await page.evaluate(() => {
    const W = document.documentElement.clientWidth, bad = [];
    for (const el of document.querySelectorAll('body *')) {
      if (el.closest('svg') && el.tagName.toLowerCase() !== 'svg') continue;
      if (el.closest('#mw,#tw,.grain,#veil,#trav,.vign,audio,.stage,.sstage,#hg,.sr,.skip')) continue;
      const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      const b = el.getBoundingClientRect(); if (!b.width || !b.height) continue;
      if (b.right > W + 1.5 || b.left < -1.5) bad.push(`${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : ''} [${Math.round(b.left)},${Math.round(b.right)}]`);
    }
    return { sw: document.documentElement.scrollWidth, W, bad: bad.slice(0, 8) };
  });
  if (r.sw > r.W + 1 || r.bad.length) report.overflow.push({ tag, ...r });
}
async function go(page, hash, wait = 1700) { await page.evaluate((h) => { location.hash = h; }, hash); await sleep(wait); }
async function playCheck(page, tag, sel, expect) {
  const before = await page.evaluate(() => ({ t: SV.debug.au.currentTime }));
  await page.click(sel);
  await sleep(2600);
  const r = await page.evaluate(() => ({ paused: SV.debug.au.paused, t: SV.debug.au.currentTime, src: SV.debug.au.currentSrc, playing: SV.debug.A.playing, ready: SV.debug.au.readyState, err: SV.debug.au.error && SV.debug.au.error.code }));
  const ok = !r.paused && r.t > before.t + .8 && r.src.includes(expect) && r.playing;
  report.play.push({ tag, sel, ok, ...r, t: Math.round(r.t * 100) / 100 });
  if (!ok) report.errors.push({ tag, kind: 'play', text: JSON.stringify(r) });
  return ok;
}
async function fps(page, tag) { const n = await page.evaluate(() => new Promise((res) => { let c = 0; const t0 = performance.now(); const f = () => { c++; if (performance.now() - t0 < 2000) requestAnimationFrame(f); else res(c / 2); }; requestAnimationFrame(f); })); report.fps.push({ tag, fps: n }); }

for (const [bn, bt] of [['chromium', chromium], ['webkit', webkit]]) {
  const browser = await bt.launch();
  for (const vp of VPS) for (const lang of ['fa', 'en']) {
    const tag = `${bn}-${vp.n}-${lang}`;
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: 1, isMobile: !!vp.mobile, hasTouch: !!vp.mobile, locale: lang === 'fa' ? 'fa-IR' : 'en-US' });
    const page = await ctx.newPage(); track(page, tag);
    try {
      await page.goto(`${BASE}?lang=${lang}#/`, { waitUntil: 'load' });
      await sleep(4200);
      await shot(page, `${tag}-home-hero`); await overflow(page, tag + '-home');
      const J = await page.evaluate(() => { const j = document.querySelector('#journey'); return { top: j.offsetTop, h: j.offsetHeight, vh: innerHeight }; });
      for (let i = 0; i < 4; i++) { const p = i / 4 + .125; await page.evaluate((y) => scrollTo(0, y), J.top + p * (J.h - J.vh)); await sleep(1100); await shot(page, `${tag}-journey-${i + 1}`); }
      if (bn === 'chromium' && vp.n === 390 && lang === 'fa') await fps(page, tag + '-journey');
      for (const id of ['home-songs', 'about-teaser', 'listen']) { await page.evaluate((s) => scrollTo(0, document.getElementById(s).offsetTop - 40), id); await sleep(1300); await shot(page, `${tag}-${id}`); }
      await page.evaluate(() => scrollTo(0, document.body.scrollHeight)); await sleep(900); await shot(page, `${tag}-footer`);
      // play from the hero
      await page.evaluate(() => scrollTo(0, 0)); await sleep(700);
      await playCheck(page, tag + '-hero', '#heroPlay', 'kahkeshan.mp3');
      // every song page
      for (const id of SONGS) {
        await go(page, '#/song/' + id);
        await shot(page, `${tag}-song-${id}`); await overflow(page, `${tag}-song-${id}`);
        if (vp.n !== 768 || id === 'mehr') { await page.evaluate(() => scrollTo(0, document.getElementById('sStory').offsetTop - 70)); await sleep(1400); await shot(page, `${tag}-song-${id}-body`); await page.evaluate(() => scrollTo(0, document.getElementById('sCred').offsetTop - 120)); await sleep(1300); await shot(page, `${tag}-song-${id}-credits`); await page.evaluate(() => scrollTo(0, 0)); await sleep(500); }
      }
      // the play path on a song page (Mehr) and a song switch from the list
      await go(page, '#/song/mehr');
      await playCheck(page, tag + '-song-mehr', '#sPlay', 'mehr.mp3');
      await sleep(1500); await shot(page, `${tag}-playing`);
      if (bn === 'chromium' && vp.n === 390 && lang === 'fa') await fps(page, tag + '-song-playing');
      await go(page, '#/songs');
      await shot(page, `${tag}-songs`); await overflow(page, tag + '-songs');
      await playCheck(page, tag + '-list-jangal', '#catalog [data-play="jangal"]', 'jangal.mp3');
      await page.click('#pp'); await sleep(400);
      const paused = await page.evaluate(() => SV.debug.au.paused); if (!paused) report.errors.push({ tag, kind: 'pause', text: 'mini player pause did not pause' });
      await page.evaluate(() => scrollTo(0, document.body.scrollHeight)); await sleep(900); await shot(page, `${tag}-songs-end`);
      await go(page, '#/about');
      await shot(page, `${tag}-about`); await overflow(page, tag + '-about');
      await page.evaluate(() => scrollTo(0, 900)); await sleep(1300); await shot(page, `${tag}-about-2`);
      await page.evaluate(() => scrollTo(0, document.body.scrollHeight)); await sleep(1300); await shot(page, `${tag}-about-3`);
      // language toggle at runtime
      await go(page, '#/song/lenj'); await page.click('#lang'); await sleep(900); await shot(page, `${tag}-toggled`);
    } catch (e) { report.errors.push({ tag, kind: 'test', text: String(e).slice(0, 400) }); }
    await ctx.close();
  }
  if (bn === 'chromium') { // reduced motion
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
    const page = await ctx.newPage(); track(page, 'chromium-390-reduced');
    await page.goto(`${BASE}#/`); await sleep(1500); await shot(page, 'chromium-390-fa-reduced-home');
    await go(page, '#/song/si-o-se-pol', 600); await shot(page, 'chromium-390-fa-reduced-song');
    await ctx.close();
  }
  await browser.close();
}
server.close();
fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 1));
console.log(`shots ${report.shots}, errors ${report.errors.length}, overflow ${report.overflow.length}, play ok ${report.play.filter((p) => p.ok).length}/${report.play.length}`);
console.log(JSON.stringify({ errors: report.errors.slice(0, 40), overflow: report.overflow.slice(0, 20), play: report.play, fps: report.fps }, null, 1));
process.exit(report.errors.length || report.overflow.length ? 1 : 0);
