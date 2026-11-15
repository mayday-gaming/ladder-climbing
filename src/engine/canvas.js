/** @file Canvas setup, DPR-aware resize, vector drawing primitives and cached layers. */
import { FB, FD, OL, P2, W } from './config.js';
import { clamp } from './math.js';
import { G } from '../game/state.js';
import { V } from '../render/interp.js';

export const cv = document.getElementById('c');
export let ctx = cv.getContext('2d');
export function hexA(c, a) {
  if (!c || c[0] != '#') return c;
  let h = c.slice(1);
  if (h.length == 3)
    h = h
      .split('')
      .map(x => x + x)
      .join('');
  const n = parseInt(h.slice(0, 6), 16);
  return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
}
export function rrPath(x, y, w, h, r) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
export function fs(f, s, lw) {
  if (f) {
    ctx.fillStyle = f;
    ctx.fill();
  }
  if (s) {
    ctx.strokeStyle = s;
    ctx.lineWidth = lw || 0.8;
    ctx.lineJoin = 'round';
    ctx.stroke();
  }
}
export function rr(x, y, w, h, r, f, s, lw) {
  ctx.beginPath();
  rrPath(x, y, w, h, r);
  fs(f, s, lw);
}
export function rect(x, y, w, h, f) {
  ctx.fillStyle = f;
  ctx.fillRect(x, y, w, h);
}
export function ci(x, y, r, f, s, lw) {
  ctx.beginPath();
  ctx.arc(x, y, Math.max(0.01, r), 0, P2);
  fs(f, s, lw);
}
export function el(x, y, rx, ry, f, s, lw, rot) {
  ctx.beginPath();
  ctx.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), rot || 0, 0, P2);
  fs(f, s, lw);
}
export function pth(pts, f, s, lw, open) {
  ctx.beginPath();
  ctx.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
  if (!open) ctx.closePath();
  fs(f, s, lw);
}
export function crv(pts, f, s, lw, open) {
  ctx.beginPath();
  ctx.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length - 2; i += 2) {
    const mx = (pts[i] + pts[i + 2]) / 2,
      my = (pts[i + 1] + pts[i + 3]) / 2;
    ctx.quadraticCurveTo(pts[i], pts[i + 1], mx, my);
  }
  ctx.lineTo(pts[pts.length - 2], pts[pts.length - 1]);
  if (!open) ctx.closePath();
  fs(f, s, lw);
}
export function ln(x1, y1, x2, y2, c, w) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = c;
  ctx.lineWidth = w;
  ctx.lineCap = 'round';
  ctx.stroke();
}
export function limb(x1, y1, x2, y2, w, f) {
  ln(x1, y1, x2, y2, OL, w + 1.4);
  ln(x1, y1, x2, y2, f, w);
}
export function lgr(x0, y0, x1, y1, ...cs) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  cs.forEach((c, i) =>
    Array.isArray(c)
      ? g.addColorStop(c[0], c[1])
      : g.addColorStop(cs.length < 2 ? 0 : i / (cs.length - 1), c),
  );
  return g;
}
export function rgr(x, y, r0, r1, ...cs) {
  if (!isFinite(x + y + r0 + r1)) {
    const c = cs[cs.length - 1];
    return Array.isArray(c) ? c[1] : c;
  }
  const g = ctx.createRadialGradient(x, y, r0, x, y, r1);
  cs.forEach((c, i) =>
    Array.isArray(c)
      ? g.addColorStop(c[0], c[1])
      : g.addColorStop(cs.length < 2 ? 0 : i / (cs.length - 1), c),
  );
  return g;
}
const GLOW = {};
function glowTex(c) {
  if (GLOW[c]) return GLOW[c];
  const s = 64,
    cv2 = document.createElement('canvas');
  cv2.width = cv2.height = s;
  const g = cv2.getContext('2d'),
    gr = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  gr.addColorStop(0, hexA(c, 1));
  gr.addColorStop(0.18, hexA(c, 0.7));
  gr.addColorStop(0.45, hexA(c, 0.2));
  gr.addColorStop(1, hexA(c, 0));
  g.fillStyle = gr;
  g.fillRect(0, 0, s, s);
  return (GLOW[c] = cv2);
}
export function glow(x, y, r, c, a) {
  if (r <= 0) return;
  ctx.globalAlpha = a == null ? 1 : clamp(a, 0, 1);
  ctx.globalCompositeOperation = 'lighter';
  ctx.drawImage(glowTex(c), x - r, y - r, r * 2, r * 2);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
}
export function shadow(x, y, rx, a) {
  ctx.fillStyle = rgr(x, y, 0, rx, 'rgba(4,8,30,' + (a == null ? 0.35 : a) + ')', 'rgba(4,8,30,0)');
  ctx.beginPath();
  ctx.ellipse(x, y, rx, Math.min(rx * 0.22, 2.6), 0, 0, P2);
  ctx.fill();
}
export function TX(s, x, y, size, fill, o) {
  o = o || {};
  ctx.font = (o.w || 700) + ' ' + size + 'px ' + (o.b ? FB : FD);
  ctx.textAlign = o.a || 'center';
  ctx.textBaseline = o.bl || 'middle';
  if (o.sh) {
    ctx.fillStyle = o.sh === true ? 'rgba(3,8,34,.55)' : o.sh;
    ctx.fillText(s, x + size * 0.05, y + size * 0.11);
  }
  if (o.sk) {
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    ctx.strokeStyle = o.sk;
    ctx.lineWidth = o.sw || size * 0.24;
    ctx.strokeText(s, x, y);
  }
  ctx.fillStyle = fill;
  ctx.fillText(s, x, y);
}
export function tw(s, size, o) {
  ctx.font = ((o && o.w) || 700) + ' ' + size + 'px ' + (o && o.b ? FB : FD);
  return ctx.measureText(s).width;
}
export function glass(x, y, w, h, r, a) {
  rr(x, y, w, h, r, 'rgba(8,18,58,' + (a == null ? 0.62 : a) + ')', 'rgba(160,190,255,.22)', 0.8);
  ctx.save();
  ctx.beginPath();
  rrPath(x, y, w, h, r);
  ctx.clip();
  rect(x, y, w, h * 0.5, lgr(0, y, 0, y + h * 0.5, 'rgba(255,255,255,.10)', 'rgba(255,255,255,0)'));
  ctx.restore();
}
const LAY = {};
function LS() {
  return Math.min(V.K, 3);
}
function mkLayer(w, h, fn) {
  const c = document.createElement('canvas'),
    s = LS();
  c.width = Math.ceil(w * s);
  c.height = Math.ceil(h * s);
  const o = ctx;
  ctx = c.getContext('2d');
  ctx.setTransform(s, 0, 0, s, 0, 0);
  try {
    fn();
  } catch (e) {
    console.error(e);
  }
  ctx = o;
  c.lw = w;
  c.lh = h;
  c.s = s;
  return c;
}
export function getL(k, w, h, fn) {
  let c = LAY[k];
  if (!c || c.s !== LS()) {
    c = LAY[k] = mkLayer(w, h, fn);
  }
  c.used = G.frame;
  return c;
}
export function purgeL() {
  for (const k in LAY) if (G.frame - LAY[k].used > 600) delete LAY[k];
}
export function bl(c, x, y) {
  ctx.drawImage(c, x, y, c.lw + 0.4, c.lh);
}
export function tile(c, par, y, ofs) {
  const p = c.lw,
    o = (((V.camX * par + (ofs || 0)) % p) + p) % p;
  for (let x = -o; x < W; x += p) bl(c, x, y);
}
export function resize() {
  const r = cv.getBoundingClientRect();
  if (!r.width) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  let w = Math.round(r.width * dpr);
  w = clamp(w, 960, 1920);
  const h = Math.round((w * 9) / 16);
  if (cv.width !== w || cv.height !== h) {
    cv.width = w;
    cv.height = h;
    V.K = w / W;
  }
}
let rsT = 0;
/** Swap the active 2D context (used by offscreen caches). */
export function setCtx(c) {
  ctx = c;
}

export function setupCanvas() {
  addEventListener('resize', () => {
    clearTimeout(rsT);
    rsT = setTimeout(resize, 120);
  });
  try {
    Promise.all(
      [
        '500 10px Fredoka',
        '600 10px Fredoka',
        '700 10px Fredoka',
        '700 10px Nunito',
        '800 10px Nunito',
        '900 10px Nunito',
      ].map(f => document.fonts.load(f)),
    ).then(() => {
      // fonts ready: drop cached layers so text is re-rendered with the real faces
      for (const k in LAY) delete LAY[k];
    });
  } catch (e) {}
}
