// Gold Loan · Stage 08 — How much can you borrow? (LTV). Isometric Infographic, 60 s.
import { Iso, PAL, tri, clamp, lerp, seg, ss, eo, eio, back, hash, mix, hex, TAU,
  pin, ring, cutLine, hatch, iconGrid, person, haloText, FONT } from './engine.js';

export const DUR = 60;
const BEAT = 60 / 96;

// ---- palette: one hue per meaning ----
PAL.ink = '#2C2C46'; PAL.paper = '#FBF6EE'; PAL.bg = '#F4EAE0';
const GOLD = tri('#D2A54E'), SAGE = tri('#8AA39E'), COPPER = tri('#CF8E6C'), NAVY = tri('#45456A');
const BOARD = tri('#F7EEDF', .3, .12), STRATA1 = tri('#CF8E6C'), STRATA2 = tri('#3B3B5C');
const STONE = tri('#BDB6AB');

// ---- formats ----
const inr = n => { const s = Math.round(n).toString(); if (s.length <= 3) return s; const last3 = s.slice(-3); let rest = s.slice(0, -3); rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ','); return rest + ',' + last3; };

// ---- camera path: [t, x, y, z, k] (position eio, zoom log-interpolated) ----
const CAM = [
  [0, 36.9, 36.9, 0, 13], [4.4, 34, 34, 0, 14.6],
  [6.0, 14, 12, 2.5, 40], [12.4, 14, 12, 2.5, 44],
  [14.0, 46, 14, 3, 36], [19.4, 46, 14, 3, 38],
  [21.4, 31, 33, 8, 26], [30.6, 31, 33, 8, 29],
  [32.6, 27, 36, 7, 28], [40.8, 27, 36, 7, 30],
  [42.8, 52, 40, 5, 30], [52.8, 52, 40, 5, 32],
  [56.4, 36.9, 36.9, 0, 13], [60, 36.9, 36.9, 0, 13.2],
];
function cam(t) {
  let i = 0; while (i < CAM.length - 2 && t > CAM[i + 1][0]) i++;
  const a = CAM[i], b = CAM[i + 1], e = eio(seg(t, a[0], b[0]));
  return { x: lerp(a[1], b[1], e), y: lerp(a[2], b[2], e), z: lerp(a[3], b[3], e), k: Math.exp(lerp(Math.log(a[4]), Math.log(b[4]), e)) };
}

// ---- world constants ----
const SC = [14, 12];                    // scale station
const DESK = [46, 14];                  // rate desk
const TW = { x: 28, y: 30, w: 6, d: 6 }; // value tower footprint
const PER_LAKH = 2;                     // 1 lakh = 2 world units of height
const H_VALUE = 9.2 * PER_LAKH, H_CAP = 6.9 * PER_LAKH, H_LOAN = 2 * PER_LAKH;
const COUNTER = [20, 38];
const MET = { x: 50, y: 39, w: 4, d: 4 };
const CH = { x0: MET.x + 5, y: MET.y - 6.5 }; // price chart plate // LTV meter station

// ---- captions (map labels) ----
export const CUES = [
  [0.5, 4.6, 'How much can you borrow against your gold?'],
  [5.0, 10.4, 'First, the net weight: 92 grams of 22-karat gold.'],
  [10.8, 16.4, 'At ₹10,000 a gram (illustrative), it is worth ₹9,20,000.'],
  [17.0, 24.6, 'RBI caps loan-to-value (LTV): 85% up to ₹2.5 lakh, 80% up to ₹5 lakh, 75% above.'],
  [25.8, 30.8, 'So the most this gold can raise is ₹6,90,000.'],
  [31.4, 36.6, 'Priya needs only ₹2,00,000 — the 85% tier, far below its cap.'],
  [37.0, 41.0, 'The rest is headroom.'],
  [41.6, 46.8, 'The LTV must stay within the cap for the whole loan.'],
  [47.8, 52.2, 'If the gold price falls: repay part, or add gold.'],
  [52.6, 56.2, 'Bullet loans count the interest due, too.'],
  [56.6, 59.8, 'LTV = loan ÷ gold value.'],
];

// ---- sound / cue events ----
export function events() {
  const ev = [];
  ev.push({ t: 3.75, type: 'land' }, { t: 3.75, type: 'jingle' });
  for (let i = 0; i < 92; i += 4) ev.push({ t: gramT(i), type: 'tick' });
  ev.push({ t: 13.9, type: 'whoosh' });
  for (let i = 0; i < 10; i++) ev.push({ t: 15.0 + i * 0.2, type: 'coin' });
  ev.push({ t: 17.5, type: 'thud' });
  [21.9, 22.5, 23.1].forEach(t => ev.push({ t, type: 'plate' }));
  ev.push({ t: 25.0, type: 'silence', d: .6 }, { t: 24.7, type: 'scratch' }, { t: 25.6, type: 'tear' }, { t: 25.65, type: 'whoosh' });
  for (let i = 0; i < 10; i++) ev.push({ t: 31.6 + i / 12 * 2, type: 'step' });
  ev.push({ t: 35.0, type: 'pop' }, { t: 35.0, type: 'glock' });
  ev.push({ t: 43.4, type: 'servo', d: 3 });
  ev.push({ t: 47.0, type: 'silence', d: .6 }, { t: 47.6, type: 'ding' });
  ev.push({ t: 49.0, type: 'pop' }, { t: 51.0, type: 'land' });
  [53.4, 53.9, 54.4, 54.9, 55.4].forEach((t, i) => ev.push({ t, type: 'bell', n: i }));
  ev.push({ t: 58.75, type: 'chord' });
  CUES.forEach(([t0]) => ev.push({ t: t0, type: 'card' }));
  return ev.sort((a, b) => a.t - b.t);
}
// gram icon i pops at gramT(i): accelerating (quarters → sixteenths)
function gramT(i) { const u = i / 91; return 6.4 + 4.4 * Math.pow(u, .62); }
function gramsLit(t) { let m = 0; for (let i = 0; i < 92; i++) m += clamp((t - gramT(i)) / .1); return m; }

// ---------------- drawing ----------------
let iso;
export function render(g, t) {
  if (!iso) iso = new Iso(g);
  iso.g = g; iso.cam = cam(t); iso.desat = 0; iso.keep = false; iso.alpha = 1;
  const W = 1920, H = 1080;

  // background + dot lattice + board shadow
  g.fillStyle = PAL.bg; g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(44,44,70,.06)';
  const k = iso.cam.k, step = Math.max(6, 3 * k);
  for (let u = -40; u < 120; u += 3) for (let v = -40; v < 120; v += 3) {
    const [sx, sy] = iso.P(u, v, -4); if (sx < -10 || sx > W + 10 || sy < -10 || sy > H + 10) continue;
    if (u > -1 && u < 61 && v > -1 && v < 61) continue; g.fillRect(sx - 1, sy - 1, 2, 2);
  }
  { const c = iso.P(30, 30, -4); g.save(); g.filter = `blur(${Math.max(6, k * 1.2)}px)`; g.fillStyle = 'rgba(44,44,70,.16)';
    g.beginPath(); g.ellipse(c[0], c[1] + 4 * k, 52 * .866 * k, 30 * k, 0, 0, TAU); g.fill(); g.restore(); }

  // focus + context at the counter
  const focus = ss(seg(t, 35.4, 36.4)) * (1 - ss(seg(t, 40.6, 41.6)));
  iso.desat = focus;

  // ---- the board (three strata on the front faces) ----
  iso.box(0, 0, -4, 60, 60, 1.6, STRATA2, { bias: -500, cull: false });
  iso.box(0, 0, -2.4, 60, 60, 1.5, STRATA1, { bias: -499, cull: false });
  iso.box(0, 0, -0.9, 60, 60, 0.9, BOARD, { bias: -498, cull: false });

  // route line (dashed), drawn slightly ahead of the story
  const route = [[10, 8, .05], [SC[0], SC[1], .05], [DESK[0] - 2, DESK[1] + 2, .05], [TW.x + 3, TW.y + 8, .05], [COUNTER[0] + 2, COUNTER[1] + 4, .05], [MET.x + 2, MET.y + 8, .05]];
  const rA = t < 53 ? clamp(seg(t, 4.2, 44) * 1.1) : 1;
  drawRoute(route, rA, t);

  // station plates (pale, dashed outline)
  plate(SC[0] - 3.5, SC[1] - 3.5, 7, 7, t > 4.6);
  plate(DESK[0] - 4, DESK[1] - 3, 8, 7, t > 12.6);
  plate(TW.x - 2, TW.y - 2, 14, 12, t > 19.6);
  plate(MET.x - 3, MET.y - 8, 14, 13, t > 41.4);

  drawTitle(t);
  drawScale(t);
  drawDesk(t);
  drawTower(t);
  drawCounter(t, focus);
  drawMeter(t);

  iso.flush();
  iso.desat = 0;

  // ---- screen-space infographic layer ----
  overlays(g, t, focus);
  caption(g, t);
  legend(g, t);
  if (t < .5) { g.fillStyle = `rgba(244,234,224,${1 - t / .5})`; g.fillRect(0, 0, W, H); }
  if (t > 59.4) { g.fillStyle = `rgba(244,234,224,${seg(t, 59.4, 60)})`; g.fillRect(0, 0, W, H); }
}

function plate(x, y, w, d, on) {
  if (!on) return;
  iso.flat([[x, y], [x + w, y], [x + w, y + d], [x, y + d]], .02, '#EFE3CE', { layer: 0 });
  iso.line3([[x, y, .03], [x + w, y, .03], [x + w, y + d, .03], [x, y + d, .03], [x, y, .03]], PAL.ink, 1.5, { dash: [6, 6], layer: 0, depth: -1e3, a: .55 });
}

function drawRoute(pts, a, t) {
  if (a <= 0) return;
  let L = 0; const seglen = []; for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seglen.push(l); L += l; }
  let rem = L * a; const out = [pts[0]];
  for (let i = 1; i < pts.length && rem > 0; i++) { const f = Math.min(1, rem / seglen[i - 1]); out.push([lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f), .05]); rem -= seglen[i - 1]; }
  iso.line3(out, PAL.ink, 2.2, { dash: [10, 8], off: -t * 18, layer: 0, depth: -999, a: .8 });
}

// ---- title: lying isometric type, gold extrusion ----
function drawTitle(t) {
  const a = 1 - seg(t, 4.0, 4.9); if (a <= 0) return;
  const words = [['HOW MUCH CAN', 24], ['YOU BORROW?', 31.5]];
  words.forEach(([s, x], i) => {
    const r = back(seg(t, .4 + i * BEAT, .4 + i * BEAT + .45), 1.6);
    iso.alpha = a;
    iso.text3(s, x, 52, -.02 + r * .02, { plane: 'xy', size: 6.2, extrude: .55 * r, tri: GOLD, weight: 700, track: 6, layer: 2 });
    iso.alpha = 1;
  });
}

// ---- station 1: scale + necklace ----
function necklace(x, y, z, t) {
  const n = 16;
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU; const r = 1.55;
    if (Math.abs(Math.sin(a / 2 + .2)) < .12) continue;
    iso.sphere(x + Math.cos(a) * r, y + Math.sin(a) * r * .8, z + .18, .26, GOLD);
  }
  iso.sphere(x + 1.55, y + .25, z + .3, .5, GOLD);
  iso.sphere(x + 1.7, y + .35, z + .55, .2, COPPER);
}
function drawScale(t) {
  const [x, y] = SC;
  iso.box(x - 2, y - 2, 0, 4, 4, 1.2, STONE);
  iso.box(x - .4, y - .4, 1.2, .8, .8, 1.8, STONE);
  iso.cyl(x, y, 3.0, 2.4, .3, tri('#D8D2C7'), { n: 32 });
  iso.box(x + 2, y - 1.2, .25, .12, 2.4, .7, NAVY);
  // necklace drop (lands 3.75 s with squash + two bounces)
  const td = 3.75; let z;
  if (t < td) { const u = seg(t, 2.6, td); z = 3.3 + 14 * (1 - u * u); }
  else { const u = t - td; z = 3.3 + Math.abs(Math.sin(u * 9)) * Math.exp(-u * 6) * .8; }
  if (t > 2.6) necklace(x - .2, y, z, t);
}

// ---- station 2: rate desk + coin stack ----
function drawDesk(t) {
  const [x, y] = DESK;
  iso.box(x - 3, y - 2, 0, 6, 4, 2.2, NAVY);
  iso.box(x - 3.2, y - 2.2, 2.2, 6.4, 4.4, .25, tri('#5A5A80'));
  iso.box(x - 2.4, y - 1.4, 2.45, 2.2, .3, 2.6, tri('#FBF6EE', .1, .1));   // rate board
  const coins = Math.floor(clamp((t - 15.0) / .2 + 1, 0, 10));
  for (let i = 0; i < coins; i++) iso.cyl(x + 1.3, y + .4, 2.45 + i * .28, .9, .24, GOLD, { n: 20 });
}

// ---- station 3: value tower, tiers, the cut ----
function drawTower(t) {
  if (t < 16.4) return;
  const grow = back(seg(t, 16.6, 17.5), 1.3);
  const h = H_VALUE * grow;
  const cutT = 25.6, slide = eo(seg(t, cutT, cutT + .45)), gone = seg(t, cutT + .05, cutT + .4);
  const loanCol = seg(t, 35.0, 35.6);
  iso.keep = true;
  if (t < cutT) iso.box(TW.x, TW.y, 0, TW.w, TW.d, h, GOLD);
  else {
    // remaining (borrowable) part, with Priya's loan band once taken
    if (loanCol > 0) {
      const LC = SAGE.map((c, i) => hex(mix(GOLD[i], c, loanCol)));
      iso.box(TW.x, TW.y, 0, TW.w, TW.d, H_LOAN, LC);
      iso.box(TW.x, TW.y, H_LOAN, TW.w, TW.d, H_CAP - H_LOAN, GOLD);
    } else iso.box(TW.x, TW.y, 0, TW.w, TW.d, H_CAP, GOLD);
    // the slice above the cap slides away along +x and fades (cutaway)
    if (gone < 1) { iso.alpha = 1 - clamp((gone - .1) / .65); iso.box(TW.x + slide * 9, TW.y, H_CAP + slide * 2.5, TW.w, TW.d, H_VALUE - H_CAP, GOLD, { bias: 50 }); iso.alpha = 1; }
  }
  iso.keep = false;
}

// ---- station 4: counter + Priya ----
function drawCounter(t, focus) {
  if (t < 30.5) return;
  const [x, y] = COUNTER;
  iso.box(x - 2, y - 2, 0, 4, 4, 2.2, NAVY);
  iso.box(x - 2.2, y - 2.2, 2.2, 4.4, 4.4, .25, tri('#5A5A80'));
  // Priya walks in (12 fps stepping), raises her arm at 35 s
  const wu = seg(t, 31.6, 33.6), stepT = Math.floor(t * 12) / 12;
  const px = lerp(13, x - 1.2, eio(wu)), py = lerp(48, y + 3.4, eio(wu));
  const bob = wu > 0 && wu < 1 ? Math.abs(Math.sin(stepT * 9)) * .12 : 0;
  const arm = lerp(.2, -2.2, ss(seg(t, 34.6, 35.1))) * (1 - ss(seg(t, 39.5, 40.2)));
  iso.keep = true;
  iso.bill(px, py, 0, gg => person(gg, { h: 4.2, body: '#2C2C46', hair: '#2A1E1A', skin: '#B97A55', arm, face: 1, bob, legs: '#3A3A55' }), { r: 5, bias: 3 });
  iso.keep = false;
}

// ---- station 5: LTV meter (a loan near the limit) ----
function meterState(t) {
  const price = 1 - .15 * ss(seg(t, 43.6, 46.4));
  const col = 10 * price, limit = .75 * col;
  const loan = lerp(7.0, 5.5, ss(seg(t, 49.0, 49.9)));
  const intr = back(seg(t, 51.0, 51.5), 1.6) * .8;
  return { price, col, limit, loan, intr };
}
function drawMeter(t) {
  if (t < 41.2) return;
  const r = back(seg(t, 41.4, 42.2), 1.3), { col, loan, intr } = meterState(t);
  iso.box(MET.x - .4, MET.y - .4, 0, MET.w + .8, MET.d + .8, .5, STONE);
  iso.box(MET.x, MET.y, .5, MET.w, MET.d, loan * r, SAGE);
  iso.box(MET.x, MET.y, .5 + loan * r, MET.w, MET.d, Math.max(0, col - loan) * r, GOLD);
  if (intr > 0) iso.box(MET.x + .6, MET.y + .6, .5 + loan, MET.w - 1.2, MET.d - 1.2, intr, COPPER, { bias: 20 });
  // price chart plate
  iso.box(CH.x0, CH.y, 0, 6, .4, 3.6, tri('#FBF6EE', .1, .1));
}

// ---------------- screen-space layer ----------------
function overlays(g, t, focus) {
  const k = iso.cam.k;
  // tracking ring on the necklace
  if (t > 3.8 && t < 13.6) { const [sx, sy] = iso.P(SC[0] - .2, SC[1], 3.5), ra = seg(t, 3.9, 4.6) * (1 - seg(t, 13, 13.6)); ring(g, sx, sy, 2.6 * k, ra, t);
    if (ra > 0) { g.save(); g.globalAlpha = ra; const R = 2.6 * k, px = sx - R * .72, py = sy + R * .7; g.strokeStyle = PAL.ink; g.lineWidth = 2; g.beginPath(); g.moveTo(px, py); g.lineTo(px - 26, py + 26); g.lineTo(px - 44, py + 26); g.stroke(); haloText(g, "PRIYA'S NECKLACE", px - 52, py + 35, { font: `600 24px ${FONT}`, track: 2, align: 'right' }); g.restore(); } }
  // scale readout
  if (t > 4.6 && t < 13.6) {
    const [sx, sy] = iso.P(SC[0] + 2.12, SC[1], .62), w = seg(t, 6.4, 10.8);
    g.save(); g.globalAlpha = seg(t, 4.6, 5.0) * (1 - seg(t, 13, 13.6));
    haloText(g, (92 * w).toFixed(1) + ' g', sx + 6, sy + .45 * k, { font: `500 ${Math.round(.62 * k)}px ${FONT}`, color: '#FBF6EE', halo: false });
    g.restore();
  }
  // pin: net weight + 92 gram icons
  if (t > 4.8 && t < 14) {
    pin(iso, SC[0] + 1.2, SC[1] - 1.5, 3.4, { title: 'NET WEIGHT · 22K', num: '92', unit: 'GRAMS', dir: 1, up: 230, len: 70, a: seg(t, 4.9, 6.2), fade: 1 - seg(t, 13.2, 14),
      icons: (gg, tx, ty) => { gg.save(); gg.globalAlpha = 1 - seg(t, 13.2, 14); iconGrid(gg, tx - 4, ty + 6, 92, gramsLit(t), 23, 21, (q, x, y, s, lit) => goldBar(q, x, y, s, lit)); haloText(gg, '1 icon = 1 gram', tx, ty + 6 + 4 * 21 + 26, { font: `500 20px ${FONT}`, track: 1.5 }); gg.restore(); } });
  }
  // rate pin + value pin
  if (t > 13.4 && t < 20.4) {
    const f = 1 - seg(t, 19.6, 20.4);
    pin(iso, DESK[0] - 1.3, DESK[1] - 1.25, 5.1, { title: 'GOLD RATE · ILLUSTRATIVE', num: '₹10,000', unit: 'PER GRAM', dir: -1, up: 170, len: 70, a: seg(t, 13.6, 14.8), fade: f });
    const v = 920000 * eo(seg(t, 15.0, 17.0));
    pin(iso, DESK[0] + 1.3, DESK[1] + .4, 2.45 + 2.9, { title: 'GOLD VALUE = 92 g × ₹10,000', num: '₹' + inr(v), dir: 1, up: 210, len: 70, a: seg(t, 14.8, 15.8), fade: f,
      icons: (gg, tx, ty) => { gg.save(); gg.globalAlpha = f; iconGrid(gg, tx - 4, ty + 6, 10, 9.2 * eo(seg(t, 15.0, 17.0)), 10, 34, (q, x, y, s, lit, i) => goldBar(q, x, y, s, lit, i === 9 ? .2 : 1)); haloText(gg, '1 icon = ₹1 lakh', tx, ty + 6 + 34 + 26, { font: `500 20px ${FONT}`, track: 1.5 }); gg.restore(); } });
  }
  // tower pins: value, tiers, cut, max loan
  if (t > 17.6 && t < 31.2) {
    const f = 1 - seg(t, 30.4, 31.2);
    if (t < 25.4) pin(iso, TW.x + TW.w / 2, TW.y, H_VALUE, { title: 'GOLD VALUE', num: '₹9,20,000', dir: -1, up: 90, len: 60, a: seg(t, 17.7, 18.7), fade: 1 - seg(t, 24.9, 25.4) });
    tierCard(g, t, f);
    // cut line around the tower at the cap
    if (t > 24.7 && t < 26.3) {
      const z = H_CAP, P = (x, y) => iso.P(x, y, z);
      cutLine(g, [P(TW.x, TW.y + TW.d), P(TW.x + TW.w, TW.y + TW.d), P(TW.x + TW.w, TW.y), P(TW.x + TW.w + 1.8, TW.y - 1.2)], seg(t, 24.7, 25.0) * (1 - seg(t, 25.9, 26.3)));
    }
    // hatched section rim on the new top
    if (t > 25.85) {
      const z = H_CAP, P = (x, y) => iso.P(x, y, z), a = seg(t, 25.85, 26.2) * f;
      g.save(); g.globalAlpha = a; hatch(g, [P(TW.x, TW.y), P(TW.x + TW.w, TW.y), P(TW.x + TW.w, TW.y + TW.d), P(TW.x, TW.y + TW.d)], { fill: '#F3DFB2' }); g.restore();
      pin(iso, TW.x, TW.y + TW.d / 2, H_CAP, { title: 'MAX LOAN · 75% OF ₹9,20,000', num: '₹6,90,000', dir: -1, up: 110, len: 70, a: seg(t, 26.2, 27.4), fade: f });
    }
  }
  // counter: headroom bracket + loan pin
  if (t > 34.9 && t < 41.6) {
    const f = 1 - seg(t, 40.8, 41.6);
    const l0 = iso.P(TW.x + TW.w + .6, TW.y, 0), l1 = iso.P(TW.x + TW.w + .6, TW.y, H_LOAN), lb = seg(t, 35.2, 35.9) * f;
    if (lb > 0) { g.save(); g.globalAlpha = lb; g.strokeStyle = PAL.ink; g.lineWidth = 2.5; g.beginPath(); g.moveTo(l0[0] + 10, l0[1]); g.lineTo(l0[0] + 24, l0[1]); g.lineTo(l0[0] + 24, l1[1] + 4); g.lineTo(l0[0] + 10, l1[1] + 4); g.stroke();
      haloText(g, "PRIYA'S LOAN · 85% TIER", l0[0] + 40, (l0[1] + l1[1]) / 2 - 6, { font: `600 24px ${FONT}`, track: 3, color: '#4E6B66' });
      haloText(g, '₹2,00,000', l0[0] + 40, (l0[1] + l1[1]) / 2 + 34, { font: `400 36px ${FONT}` }); g.restore(); }
    const a0 = iso.P(TW.x + TW.w + .6, TW.y, H_LOAN + .3), a1 = iso.P(TW.x + TW.w + .6, TW.y, H_CAP), b = seg(t, 36.4, 37.2) * f;
    if (b > 0) {
      g.save(); g.globalAlpha = b; g.strokeStyle = PAL.ink; g.lineWidth = 2.5;
      const ym = lerp(a0[1], a1[1], eo(seg(t, 36.4, 37.0)));
      g.beginPath(); g.moveTo(a0[0] + 10, a0[1]); g.lineTo(a0[0] + 24, a0[1]); g.lineTo(a0[0] + 24, ym); g.lineTo(a0[0] + 10, ym); g.stroke();
      haloText(g, 'HEADROOM', a0[0] + 40, (a0[1] + a1[1]) / 2 - 6, { font: `600 24px ${FONT}`, track: 3 });
      haloText(g, '₹4,90,000', a0[0] + 40, (a0[1] + a1[1]) / 2 + 34, { font: `400 36px ${FONT}` });
      g.restore();
    }
  }
  // meter: limit line, chart, alert, interest
  if (t > 41.8 && t < 53.4) {
    const f = 1 - seg(t, 52.8, 53.4), s = meterState(t), k = iso.cam.k;
    // limit line around the column
    const P = (x, y) => iso.P(x, y, .5 + s.limit), la = seg(t, 42.2, 42.8) * f;
    if (la > 0) { g.save(); g.globalAlpha = la; g.strokeStyle = '#B5603C'; g.lineWidth = 3; g.setLineDash([9, 6]);
      g.beginPath(); [P(MET.x - .9, MET.y + MET.d + .9), P(MET.x + MET.w + .9, MET.y + MET.d + .9), P(MET.x + MET.w + .9, MET.y - .9)].forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); g.setLineDash([]);
      const e = P(MET.x + MET.w + .9, MET.y - .9); haloText(g, '75% CAP', e[0] + 12, e[1] + 8, { font: `600 22px ${FONT}`, track: 2.5, color: '#9A4E2E' }); g.restore(); }
    // price chart on the plate
    const c0 = iso.P(CH.x0 + .4, CH.y + .4, 3.3), c1 = iso.P(CH.x0 + 5.6, CH.y + .4, .4), ca = seg(t, 42.4, 43.0) * f;
    if (ca > 0) { g.save(); g.globalAlpha = ca; haloText(g, 'GOLD PRICE', c0[0] + 4, c0[1] - 8, { font: `600 20px ${FONT}`, track: 2.5 });
      g.strokeStyle = '#B98A2E'; g.lineWidth = 3.5; g.lineJoin = 'round'; g.beginPath();
      const N = 40, cut = seg(t, 42.6, 46.4);
      for (let i = 0; i <= N * Math.max(cut, .3); i++) { const u = i / N, x = lerp(c0[0] + 8, c1[0] - 8, u), dip = u > .45 ? ss((u - .45) / .55) : 0; const y = lerp(c0[1] + 20, c0[1] + 20 + (c1[1] - c0[1]) * .7, dip * (cut > .3 ? 1 : 0)) + Math.sin(u * 17) * 4; i ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.stroke(); g.restore(); }
    pin(iso, MET.x, MET.y + MET.d / 2, .5 + s.loan * .5, { title: 'LOAN', num: '', dir: -1, up: 40, len: 50, ts: 22, a: seg(t, 42.2, 43.2), fade: f });
    // alert when the loan sits above the cap
    const over = s.loan + s.intr * 0 > s.limit + .05;
    if (t > 47.6 && t < 49.6 && over) { const [ax, ay] = iso.P(MET.x + MET.w / 2, MET.y + MET.d / 2, .5 + s.loan); ring(g, ax, ay, 3.2 * k, seg(t, 47.6, 47.9), t, 'OVER THE CAP', { color: '#B5603C', ang: -.6 }); }
    if (t > 49.3 && t < 51) pin(iso, MET.x + MET.w, MET.y, .5 + s.loan, { title: 'REPAY PART  ·  OR ADD GOLD', num: '', dir: 1, up: 120, len: 60, a: seg(t, 49.3, 50.0), fade: 1 - seg(t, 50.6, 51) });
    if (t > 51.2) pin(iso, MET.x + MET.w / 2, MET.y + .6, .5 + s.loan + s.intr, { title: 'BULLET LOAN: INTEREST DUE COUNTS', num: '', dir: 1, up: 150, len: 60, a: seg(t, 51.4, 52.2), fade: f });
  }
  // scale reveal: one tag per station
  if (t > 53.2) {
    const tags = [[SC[0], SC[1], 3.4, '1 · WEIGH'], [DESK[0], DESK[1], 5.1, '2 · PRICE'], [TW.x + 3, TW.y + 3, H_CAP, '3 · CAP'], [COUNTER[0], COUNTER[1], 2.5, '4 · BORROW'], [MET.x + 2, MET.y + 2, 10, '5 · WATCH']];
    tags.forEach(([x, y, z, s], i) => pin(iso, x, y, z, { title: s, num: '', dir: i % 2 ? 1 : -1, up: 60, len: 30, ts: 22, a: seg(t, 53.4 + i * .5, 54.2 + i * .5) }));
  }
}

// RBI LTV tiers as a map legend, with a leader to the tower's cap height
function tierCard(g, t, f) {
  const a = seg(t, 21.6, 22.2) * f; if (a <= 0) return;
  const x = 1290, y = 230, W = 580, rowH = 92;
  g.save(); g.globalAlpha = a;
  g.fillStyle = PAL.paper; rr(g, x, y, W, 90 + rowH * 3, 12); g.fill(); g.strokeStyle = PAL.ink; g.lineWidth = 2; rr(g, x, y, W, 90 + rowH * 3, 12); g.stroke();
  haloText(g, 'RBI · MAX LTV BY LOAN SIZE', x + 26, y + 44, { font: `600 22px ${FONT}`, track: 3, halo: false });
  const rows = [['85', '%', 'loans up to ₹2.5 lakh'], ['80', '%', '₹2.5 lakh – ₹5 lakh'], ['75', '%', 'above ₹5 lakh']];
  const hi = seg(t, 24.0, 24.5);
  rows.forEach(([n, u, d], i) => {
    const r = back(seg(t, 22.0 + i * .6, 22.5 + i * .6), 1.6); if (r <= 0) return;
    const yy = y + 76 + i * rowH, active = i === 2, dim = active ? 1 : 1 - .55 * hi;
    g.save(); g.globalAlpha = a * dim; g.translate(x + 26, yy);
    const bw = 120 * (+n / 100) * r; g.fillStyle = COPPER[1]; g.fillRect(0, 18, bw, 34); g.fillStyle = COPPER[2]; g.fillRect(bw, 18, 6, 34); g.fillStyle = COPPER[0]; g.fillRect(0, 12, bw, 6);
    haloText(g, n, 150, 52, { font: `400 46px ${FONT}`, halo: false }); haloText(g, u, 206, 52, { font: `500 24px ${FONT}`, halo: false });
    haloText(g, d, 250, 46, { font: `500 26px ${FONT}`, halo: false });
    g.restore();
  });
  // highlight + leader to the tower at the cap
  if (hi > 0) {
    const yy = y + 76 + 2 * rowH + 35;
    g.strokeStyle = PAL.ink; g.lineWidth = 2.5; g.globalAlpha = a * hi;
    rr(g, x + 12, yy - 44, W - 24, 82, 10); g.stroke();
    haloText(g, 'THIS GOLD → OVER ₹5 LAKH', x + 26, yy + 66, { font: `600 20px ${FONT}`, track: 2 });
    const [tx, ty] = iso.P(TW.x + TW.w, TW.y, H_CAP), l = eo(seg(t, 24.2, 24.7));
    g.beginPath(); g.moveTo(x + 12, yy - 3); g.lineTo(lerp(x + 12, tx + 14, l), lerp(yy - 3, ty, l)); g.stroke();
  }
  g.restore();
}

function goldBar(g, x, y, s, lit, frac = 1) {
  const c = lit ? GOLD : ['#E9E1D3', '#DDD3C2', '#CFC4B1'];
  g.save(); g.translate(x, y);
  const w = s * .78 * (lit ? frac : 1), h = s * .34, d = s * .22;
  g.fillStyle = c[1]; g.fillRect(-s * .39, -h / 2 + d * .5, w, h);
  g.fillStyle = c[0]; g.beginPath(); g.moveTo(-s * .39, -h / 2 + d * .5); g.lineTo(-s * .39 + d, -h / 2 - d * .5); g.lineTo(-s * .39 + w + d, -h / 2 - d * .5); g.lineTo(-s * .39 + w, -h / 2 + d * .5); g.closePath(); g.fill();
  g.fillStyle = c[2]; g.beginPath(); g.moveTo(-s * .39 + w, -h / 2 + d * .5); g.lineTo(-s * .39 + w + d, -h / 2 - d * .5); g.lineTo(-s * .39 + w + d, h / 2 - d * .5); g.lineTo(-s * .39 + w, h / 2 + d * .5); g.closePath(); g.fill();
  g.restore();
}

// ---- subtitle = map label ----
function caption(g, t) {
  const c = CUES.find(([a, b]) => t >= a && t < b + .35); if (!c) return;
  const [a, b, s] = c, inA = seg(t, a, a + .2), wipe = ss(seg(t, a + .15, a + .55)), out = seg(t, b, b + .35);
  g.save(); g.font = `500 40px ${FONT}`; const tw = g.measureText(s).width, W = tw + 120, H = 74, x = 960 - W / 2, y = 1080 - 64 - H + out * 8;
  g.globalAlpha = 1 - out;
  g.fillStyle = PAL.paper; rr(g, x, y, W, H, 10); g.fill();
  g.strokeStyle = PAL.ink; g.lineWidth = 2; g.save(); g.setLineDash([2 * (W + H) * inA, 4000]); rr(g, x, y, W, H, 10); g.stroke(); g.restore();
  // iso cube chip
  const cx = x + 40, cy = y + H / 2; g.translate(cx, cy); [[GOLD[0], [[0, -12], [11, -6], [0, 0], [-11, -6]]], [GOLD[1], [[-11, -6], [0, 0], [0, 12], [-11, 6]]], [GOLD[2], [[0, 0], [11, -6], [11, 6], [0, 12]]]].forEach(([col, p]) => { g.beginPath(); p.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.closePath(); g.fillStyle = col; g.fill(); }); g.translate(-cx, -cy);
  g.beginPath(); g.rect(x + 70, y, (W - 70) * wipe, H); g.clip();
  g.fillStyle = PAL.ink; g.textBaseline = 'middle'; g.fillText(s, x + 76, y + H / 2 + 2);
  g.restore();
}
function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }

// ---- end frame: the legend ----
function legend(g, t) {
  const a = seg(t, 55.6, 56.6); if (a <= 0) return;
  g.save(); g.globalAlpha = a; const x = 56, y = 48 + (1 - eo(a)) * 14, W = 470, H = 260;
  g.fillStyle = PAL.paper; rr(g, x, y, W, H, 12); g.fill(); g.strokeStyle = PAL.ink; g.lineWidth = 2; rr(g, x, y, W, H, 12); g.stroke();
  haloText(g, 'LEGEND', x + 24, y + 40, { font: `600 22px ${FONT}`, track: 3.5, halo: false });
  haloText(g, 'LTV = loan ÷ gold value', x + 24, y + 84, { font: `500 30px ${FONT}`, halo: false });
  const rows = [['85%', 'loans up to ₹2.5 lakh'], ['80%', '₹2.5 – 5 lakh'], ['75%', 'above ₹5 lakh']];
  rows.forEach(([p, d], i) => { const yy = y + 128 + i * 34; g.fillStyle = COPPER[1]; g.fillRect(x + 24, yy - 18, 16, 16); haloText(g, p, x + 52, yy - 2, { font: `600 24px ${FONT}`, halo: false }); haloText(g, d, x + 120, yy - 2, { font: `400 24px ${FONT}`, halo: false }); });
  haloText(g, 'RATE ILLUSTRATIVE · NOT TO SCALE', x + 24, y + H - 18, { font: `600 16px ${FONT}`, track: 2.5, halo: false, color: '#6B6B88' });
  g.restore();
}
