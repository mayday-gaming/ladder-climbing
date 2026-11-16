/** @file Enemy renderers. */
import { ET } from '../data/levels.js';
import { TX, ci, ctx, el, glow, lgr, ln, pth, rect, rgr, rr, shadow } from '../engine/canvas.js';
import { GY, OL, P2, W } from '../engine/config.js';
import { clamp } from '../engine/math.js';
import { G } from '../game/state.js';
import { V, ix, iy, rnow } from './interp.js';

const decals = [];
export function hitFlash(x, y, r, f) {
  if (f > 0) glow(x, y, r, '#ffffff', 0.25 + f * 0.12);
}
export function drawEnemy(e) {
  const X = ix(e),
    Y = iy(e),
    cx = X + e.w / 2,
    by = Y + e.h;
  if (cx < V.camX - 40 || cx > V.camX + W + 40) return;
  const t = e.t + V.A,
    f = e.face || -1,
    r = rnow(e);
  if (ET[e.type].fly) {
    shadow(cx, GY, 6 * clamp(1 - (GY - by) / 120, 0.3, 1), 0.2);
  } else shadow(cx, by, e.w * 0.5, 0.3);
  ctx.save();
  ctx.translate(cx, by);
  if (e.type == 'carta') {
    const sw = Math.sin(t * 0.22) * 0.08;
    const lp = Math.sin(t * 0.35);
    ln(-2.5, -3, -2.5 + lp * 1.5, 0, OL, 1.6);
    ln(2.5, -3, 2.5 - lp * 1.5, 0, OL, 1.6);
    el(-2.5 + lp * 1.5 + 0.8, 0, 1.6, 0.8, OL);
    el(2.5 - lp * 1.5 + 0.8, 0, 1.6, 0.8, OL);
    ctx.rotate(sw);
    ctx.scale(f, 1);
    pth([-7, -3, -7, -18, 3, -18, 7, -14, 7, -3], lgr(-7, -18, 7, -3, '#ffffff', '#e2e7f4'), OL, 0.9);
    pth([3, -18, 3, -14, 7, -14], '#c9d0e6', OL, 0.6);
    for (let i = 0; i < 4; i++) rect(-5, -12.5 + i * 2.3, i == 3 ? 6 : 9, 0.7, '#b8c0da');
    el(-1.6, -14.5, 2, 2.2, '#fff', OL, 0.5);
    el(3, -14.5, 1.8, 2, '#fff', OL, 0.5);
    ci(-1, -14.2, 0.9, '#141a33');
    ci(3.5, -14.2, 0.85, '#141a33');
    ln(-3.6, -17.4, -0.4, -16.4, '#d62b37', 0.9);
    ln(1.6, -16.4, 4.6, -17.2, '#d62b37', 0.9);
    ctx.beginPath();
    ctx.arc(1, -9.6, 1.6, 3.6, 5.8);
    ctx.strokeStyle = OL;
    ctx.lineWidth = 0.6;
    ctx.stroke();
  } else if (e.type == 'busta') {
    ctx.scale(f, 1);
    const wa = Math.sin(t * 0.45) * 0.9;
    for (const s of [-1, 1]) {
      ctx.save();
      ctx.translate(s * 6, -7);
      ctx.rotate(s * (-0.4 - wa));
      pth(
        [0, 0, s * 8, -4, s * 9.5, -1, s * 7, 1, s * 8.5, 3, s * 4, 2.4],
        lgr(0, -4, 0, 3, '#ffffff', '#cfd6ea'),
        OL,
        0.6,
      );
      ctx.restore();
    }
    rr(-8, -12, 16, 11, 1.6, lgr(0, -12, 0, -1, '#ffe66a', '#f2b800'), OL, 0.9);
    pth([-8, -12, 0, -5.6, 8, -12], null, '#b88a00', 0.7, true);
    ln(-8, -1.4, -2.4, -6.4, 'rgba(150,100,0,.5)', 0.6);
    ln(8, -1.4, 2.4, -6.4, 'rgba(150,100,0,.5)', 0.6);
    ci(0, -6, 2.2, lgr(0, -8, 0, -4, '#ff5a5a', '#b81a2a'), OL, 0.5);
    TX('!', 0, -6, 3, '#ffd2d2', { w: 800 });
    el(-3.6, -9, 1.4, 1.5, '#fff', OL, 0.4);
    el(3.6, -9, 1.4, 1.5, '#fff', OL, 0.4);
    ci(-3.2, -8.8, 0.65, '#141a33');
    ci(4, -8.8, 0.65, '#141a33');
  } else if (e.type == 'timbro') {
    const air = e.y < e.by - 0.5;
    const crouch = !air && e.t % 70 > 58 ? ((e.t % 70) - 58) / 12 : 0;
    let sx = 1,
      sy = 1;
    if (r.land) {
      const q = r.land / 9;
      sy = 1 - 0.25 * q;
      sx = 1 + 0.2 * q;
    } else if (air) {
      sy = 1.12;
      sx = 0.9;
    } else if (crouch) {
      sy = 1 - 0.18 * crouch;
      sx = 1 + 0.12 * crouch;
    }
    ctx.scale(f * sx, sy);
    rr(-7.5, -6, 15, 6, 1.4, lgr(0, -6, 0, 0, '#3b6cf0', '#1b3fa0'), OL, 0.9);
    rect(-7, -1.6, 14, 1.6, '#0f2470');
    rr(-6.6, -8, 13.2, 2.4, 0.8, '#6a4020', OL, 0.6);
    rr(-2.4, -13.5, 4.8, 6, 1.2, lgr(-2.4, 0, 2.4, 0, '#c88a52', '#8a5428'), OL, 0.7);
    ci(0, -16, 4, rgr(-1.4, -17.6, 0.4, 4.4, '#e6a46a', '#a9652e', [1, '#6e3d18']), OL, 0.8);
    el(-1.3, -17.4, 1.3, 0.8, 'rgba(255,255,255,.55)');
    el(-2.6, -3.4, 1.3, 1.4, '#fff', OL, 0.4);
    el(2.6, -3.4, 1.3, 1.4, '#fff', OL, 0.4);
    ci(-2.1, -3.2, 0.6, '#141a33');
    ci(3.1, -3.2, 0.6, '#141a33');
    ln(-3.8, -5.2, -1.6, -4.6, '#ffd500', 0.7);
    ln(1.6, -4.6, 3.8, -5.2, '#ffd500', 0.7);
    if (r.land == 8) decals.push({ x: cx, y: by, life: 240 });
  } else if (e.type == 'cono' || e.type == 'ficus') {
    const lp = Math.sin(t * 0.3);
    ln(-2.5, -3, -2.5 + lp * 1.5, 0, OL, 1.6);
    ln(2.5, -3, 2.5 - lp * 1.5, 0, OL, 1.6);
    el(-2.5 + lp * 1.5 + 0.8, 0, 1.6, 0.8, OL);
    el(2.5 - lp * 1.5 + 0.8, 0, 1.6, 0.8, OL);
    ctx.rotate(Math.sin(t * 0.2) * 0.06);
    ctx.scale(f, 1);
    if (e.type == 'cono') {
      rr(-8, -5, 16, 3, 1, lgr(0, -5, 0, -2, '#ff9a3c', '#d95a10'), OL, 0.8);
      pth([-5.6, -5, -2, -18, 2, -18, 5.6, -5], lgr(-5, 0, 5, 0, '#ffa94d', '#e8641a'), OL, 0.9);
      pth([-3.9, -11, -3, -14.4, 3, -14.4, 3.9, -11], '#ffffff', OL, 0.5);
      el(-1.6, -8, 1.5, 1.6, '#fff', OL, 0.4);
      el(2.4, -8, 1.4, 1.5, '#fff', OL, 0.4);
      ci(-1.1, -7.8, 0.7, '#141a33');
      ci(2.9, -7.8, 0.65, '#141a33');
      ln(-3.4, -10, -0.4, -9.2, OL, 0.8);
      ln(1.2, -9.2, 4, -10, OL, 0.8);
    } else {
      for (const [lx, ly, rx, ry, ro, c] of [
        [-5, -15, 4.5, 2.6, -0.6, '#1f8a4a'],
        [5, -15, 4.5, 2.6, 0.6, '#27a85a'],
        [0, -19, 3.2, 5, 0, '#2fbf68'],
        [-3.4, -18, 2.6, 4.6, -0.4, '#27a85a'],
        [3.4, -18, 2.6, 4.6, 0.4, '#1f8a4a'],
      ])
        el(lx, ly + Math.sin(t * 0.15 + lx) * 0.5, rx, ry, c, OL, 0.6, ro);
      pth([-6, -11, 6, -11, 4.6, -2.4, -4.6, -2.4], lgr(0, -11, 0, -2, '#d9814a', '#a34e22'), OL, 0.9);
      rr(-6.8, -12.4, 13.6, 2.6, 1, '#e59a62', OL, 0.7);
      el(-1.8, -7.4, 1.5, 1.6, '#fff', OL, 0.4);
      el(2.2, -7.4, 1.4, 1.5, '#fff', OL, 0.4);
      ci(-1.3, -7.2, 0.7, '#141a33');
      ci(2.7, -7.2, 0.65, '#141a33');
      ln(-3.6, -9.4, -0.6, -8.6, OL, 0.8);
      ln(1, -8.6, 3.8, -9.4, OL, 0.8);
      ln(-1, -4.6, 2, -4.8, OL, 0.6);
    }
  } else if (e.type == 'bug') {
    ctx.scale(f, 1);
    for (let i = 0; i < 3; i++) {
      const w = Math.sin(t * 0.9 + i * 2) * 1.4;
      ln(-3 + i * 3, -3, -4.4 + i * 3 + w, 0, OL, 0.9);
      ln(-3 + i * 3, -3, -1.6 + i * 3 - w, 0, OL, 0.9);
    }
    el(-0.6, -4.6, 5.2, 3.6, lgr(0, -8, 0, -1, '#7dff9c', '#12a044'), OL, 0.9);
    ln(-0.6, -8, -0.6, -1.2, '#0b6a2c', 0.6);
    ci(-2.6, -5.4, 0.8, '#0b6a2c');
    ci(1, -3.4, 0.7, '#0b6a2c');
    ci(4.6, -4.4, 2.6, '#0f7a34', OL, 0.8);
    ci(5.4, -5, 0.8, '#ff3b4a');
    ci(4, -5.6, 0.6, '#ff3b4a');
    ln(5.6, -6.6, 7.6, -9 + Math.sin(t * 0.6), OL, 0.6);
    ln(4.4, -6.8, 5, -9.6 + Math.cos(t * 0.6), OL, 0.6);
    glow(5, -5, 4, '#ff3b4a', 0.5);
  } else if (e.type == 'sedia') {
    const d = e.dash > 0;
    ctx.scale(f, 1);
    if (d) {
      for (let i = 0; i < 3; i++)
        ln(-10 - i * 3, -4 - i * 5, -17 - i * 3 - Math.random() * 3, -4 - i * 5, 'rgba(255,255,255,.7)', 0.7);
      ctx.rotate(0.12);
    } else if (e.cd > 55) ctx.rotate(Math.sin(t * 1.5) * 0.05);
    for (const x of [-6, 0, 6]) {
      ln(0, -4, x, -1.2, '#2a3052', 1.5);
      ci(x, -1.2, 1.3, '#141a33', OL, 0.4);
    }
    ln(0, -4, 0, -8, '#8a96c0', 1.8);
    rr(-7, -10.4, 14, 3.2, 1.5, lgr(0, -10, 0, -7, '#4a6cf0', '#1b3fa0'), OL, 0.8);
    rr(-7.4, -19.4, 4, 10, 1.8, lgr(-7, 0, -3, 0, '#4a6cf0', '#1b3fa0'), OL, 0.8);
    ln(-5.4, -10, -5.4, -9, '#141a33', 1.4);
    rr(3, -12.6, 4.4, 1.6, 0.8, '#2a3052', OL, 0.4);
    el(-5.8, -16, 1.2, 1.4, '#fff', OL, 0.35);
    ci(-5.4, -15.8, 0.6, '#141a33');
    ln(-7, -17.8, -4.6, -17, '#ffd500', 0.7);
    if (e.cd < 20 && !d && e.cd > 0) TX('!', 1, -22, 6, '#ff3b4a', { w: 700, sk: '#fff', sw: 1.2 });
  } else if (e.type == 'piccione') {
    ctx.scale(f, 1);
    const wa = Math.sin(t * 0.7);
    el(-0.5, -5, 6.2, 4.2, lgr(0, -9, 0, -1, '#aab2c8', '#6a7396'), OL, 0.9);
    pth([-6, -5, -10.4, -7.4, -10, -3.6, -6.4, -3], '#5a6386', OL, 0.6);
    ctx.save();
    ctx.translate(-1, -7);
    ctx.rotate(-0.5 + wa * 0.9);
    pth([0, 0, -6.4, -6, -1, -7.4, 3, -1], lgr(0, -7, 0, 0, '#c6cee6', '#8a93b4'), OL, 0.7);
    ctx.restore();
    ci(5.2, -8, 3, '#8a93b4', OL, 0.8);
    rect(3.6, -6.2, 3.4, 1.4, '#3fbf9a');
    pth([7.6, -8.6, 10.6, -7.6, 7.6, -6.8], '#ffb020', OL, 0.5);
    ci(5.8, -8.6, 1, '#ff8a2a', OL, 0.3);
    ci(6, -8.6, 0.45, '#141a33');
    ln(4.6, -10.4, 7, -9.6, OL, 0.7);
    ln(-1, -1.2, -1.6, 0.8, '#ff8a2a', 0.8);
    ln(1.4, -1.2, 1, 0.8, '#ff8a2a', 0.8);
  } else if (e.type == 'ventola') {
    glow(0, -7, 12, '#66f0ff', 0.35);
    ci(0, -7, 7.4, '#1a2244', OL, 0.9);
    ci(0, -7, 6, '#0b1230');
    ctx.save();
    ctx.translate(0, -7);
    ctx.rotate(t * 0.7);
    for (let i = 0; i < 4; i++) {
      ctx.rotate(P2 / 4);
      el(2.9, 0, 2.9, 1.5, '#9fb4ff', OL, 0.4, 0.4);
    }
    ctx.restore();
    ci(0, -7, 2.4, '#2a3052', OL, 0.5);
    ci(-0.8, -7.2, 0.6, '#ff3b4a');
    ci(0.9, -7.2, 0.6, '#ff3b4a');
    ln(-7, -7, -9.4, -7, '#66f0ff', 0.7);
    ln(7, -7, 9.4, -7, '#66f0ff', 0.7);
    rect(-2, -15.2, 4, 1.2, '#8a96c0');
  } else if (e.type == 'penna') {
    ctx.translate(0, -3);
    if (e.ang != null) ctx.rotate(e.ang);
    else ctx.scale(f, 1);
    const k = e.t % 130,
      ch = k > 56 && k < 80;
    if (ch) ctx.translate((Math.random() - 0.5) * 0.8, (Math.random() - 0.5) * 0.8);
    rr(-9, -2.2, 12, 4.4, 2, lgr(0, -2.2, 0, 2.2, '#2a3a8a', '#0f1a48'), OL, 0.8);
    rect(-5, -2.2, 1.4, 4.4, '#ffd500');
    rr(-8, -3.4, 7, 1.3, 0.6, '#ffd500', OL, 0.4);
    pth([3, -2.2, 10, 0, 3, 2.2], lgr(3, 0, 10, 0, '#ffe95c', '#c89a10'), OL, 0.7);
    ln(5, 0, 9, 0, OL, 0.4);
    ci(-1.4, -0.4, 0.8, '#fff');
    ci(-1.2, -0.4, 0.4, '#141a33');
    ci(1.2, -0.4, 0.8, '#fff');
    ci(1.4, -0.4, 0.4, '#141a33');
    if (ch) glow(9, 0, 6, '#ff3b4a', 0.8);
    if (k > 80 && k < 116) {
      ln(-10, 0, -18, 0, 'rgba(255,255,255,.6)', 0.8);
      ln(-10, -1.6, -15, -1.6, 'rgba(255,255,255,.35)', 0.6);
    }
  } else if (e.type == 'router') {
    const sh = e.t % 105 > 44 && e.t % 105 < 60;
    ctx.scale(f, 1);
    for (const x of [-5, 5]) {
      ln(x, -8, x * 1.5, -19, OL, 1.6);
      ln(x, -8, x * 1.5, -19, '#8a96c0', 0.8);
      ci(x * 1.5, -19.4, 1.3, sh ? '#ffe95c' : '#ff3b4a', OL, 0.4);
      if (sh) glow(x * 1.5, -19.4, 6, '#ffe95c', 0.9);
    }
    rr(-9, -9, 18, 8, 2, lgr(0, -9, 0, -1, '#3a4466', '#1a2244'), OL, 0.9);
    rect(-8, -8.2, 16, 1, 'rgba(255,255,255,.2)');
    for (let i = 0; i < 4; i++)
      ci(-5.4 + i * 2.2, -2.6, 0.6, (G.frame >> 3) % 4 == i ? '#3cff7a' : '#1f5a34');
    rect(1.6, -6.8, 2, 1.3, '#ff3b4a');
    rect(5, -6.8, 2, 1.3, '#ff3b4a');
    ln(1.2, -7.6, 3.8, -7, '#ff3b4a', 0.5);
    ln(7.4, -7.6, 4.8, -7, '#ff3b4a', 0.5);
    glow(4.3, -6.2, 5, '#ff3b4a', 0.4);
    rr(-8, -1.4, 3, 1.4, 0.5, '#0b1230');
    rr(5, -1.4, 3, 1.4, 0.5, '#0b1230');
  } else if (e.type == 'proiettore') {
    const k = e.t % 125,
      sh = k > 50 && k < 70;
    ctx.scale(f, 1);
    ln(0, -5, -6, 0, OL, 1.5);
    ln(0, -5, 6, 0, OL, 1.5);
    ln(0, -5, 0, 0, OL, 1.5);
    if (sh) {
      ctx.globalAlpha = 0.25 + 0.2 * Math.sin(t * 1.2);
      pth([9, -10, 46, -22, 46, 2], '#fff6c0');
      ctx.globalAlpha = 1;
    }
    rr(-9, -15, 18, 10, 2.2, lgr(0, -15, 0, -5, '#f2f4fa', '#b9c0d8'), OL, 0.9);
    rect(-8, -14, 16, 1.2, 'rgba(255,255,255,.8)');
    ci(8.4, -10, 3.6, '#2a3052', OL, 0.8);
    ci(8.4, -10, 2.2, sh ? '#fff6c0' : '#66c8ff');
    if (sh) glow(8.4, -10, 9, '#fff6c0', 0.9);
    rect(-6.4, -12.4, 2, 1.2, '#141a33');
    rect(-2.6, -12.4, 2, 1.2, '#141a33');
    ln(-7, -13.4, -4, -12.6, '#d62b37', 0.7);
    ln(-0.2, -13.4, -3, -12.6, '#d62b37', 0.7);
    for (let i = 0; i < 3; i++) rect(-7 + i * 2.2, -7.4, 1.4, 0.8, '#8a96c0');
  } else {
    const shoot = e.t % 115 > 42 && e.t % 115 < 60,
      shk = shoot ? Math.sin(t * 2) * 0.5 : 0;
    ctx.translate(shk, 0);
    ctx.scale(f, 1);
    rr(-10.5, -16, 21, 13, 2.4, lgr(0, -16, 0, -3, '#f2f4fa', '#c3c9dc'), OL, 0.9);
    rect(-9.5, -15, 19, 1.4, 'rgba(255,255,255,.8)');
    rr(-8, -18.4, 16, 3, 1, '#9aa3c0', OL, 0.6);
    rect(-6, -19.6, 12, 1.6, '#ffffff');
    rr(-9, -6.4, 18, 3.2, 1, '#3a4466', OL, 0.6);
    if (shoot) rr(-6, -6, 12, 5 * (((e.t % 115) - 42) / 18), 0.6, '#ffffff', OL, 0.4);
    rr(1.5, -13.6, 7.5, 5, 1, '#0b1a2e', OL, 0.5);
    rect(2.8, -12.4, 1.8, 1.2, '#ff3b4a');
    rect(6, -12.4, 1.8, 1.2, '#ff3b4a');
    ln(2.6, -13, 4.8, -12.4, '#ff3b4a', 0.5);
    ln(8, -13, 5.8, -12.4, '#ff3b4a', 0.5);
    glow(5.3, -11.8, 6, '#ff3b4a', 0.35);
    const led = shoot && (G.frame >> 2) % 2;
    ci(-6.5, -11, 1, led ? '#ff4d5e' : '#3cff7a');
    glow(-6.5, -11, 4, led ? '#ff4d5e' : '#3cff7a', 0.7);
    ci(-3.6, -11, 0.8, '#ffd500');
    rr(-10, -3, 4, 3, 0.8, '#2a3052', OL, 0.5);
    rr(6, -3, 4, 3, 0.8, '#2a3052', OL, 0.5);
  }
  ctx.restore();
  hitFlash(cx, by - e.h / 2, e.w * 1.1, e.flash);
}
export function drawDecals() {
  for (let i = decals.length - 1; i >= 0; i--) {
    const d = decals[i];
    if (r_dec(d)) decals.splice(i, 1);
  }
}
function r_dec(d) {
  if (d.f !== G.frame) {
    d.f = G.frame;
    d.life--;
  }
  if (d.life <= 0) return true;
  ctx.globalAlpha = Math.min(1, d.life / 60) * 0.55;
  ctx.save();
  ctx.translate(d.x, d.y + 1.2);
  ctx.scale(1, 0.32);
  rr(-9, -5, 18, 10, 2, null, '#d62b37', 1.2);
  TX('OK', 0, 0, 7, '#d62b37', { w: 800 });
  ctx.restore();
  ctx.globalAlpha = 1;
  return false;
}
