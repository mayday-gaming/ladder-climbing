/** @file Coins, coffee, barley and power-up renderers. */
import { TX, ci, ctx, el, fs, glow, lgr, ln, pth, rect, rgr, rr } from '../engine/canvas.js';
import { GY, OL, W } from '../engine/config.js';
import { cf } from '../game/progression.js';
import { G } from '../game/state.js';
import { V, ix, iy } from './interp.js';

export function drawPickup(k) {
  const x = ix(k),
    y = iy(k) + Math.sin((k.t + V.A) / 12) * 1.6,
    t = V.TT;
  if (x < V.camX - 20 || x > V.camX + W + 20) return;
  if (k.type == 'buono') {
    const f = Math.cos((k.t + V.A) / 14),
      cx = x + 4,
      cy = y + 5;
    glow(cx, cy, 9, '#ffd84a', 0.35);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(Math.max(0.12, Math.abs(f)), 1);
    rr(
      -5,
      -3.6,
      10,
      7.2,
      1.2,
      f > 0 ? lgr(0, -3.6, 0, 3.6, '#fff27a', '#e8b400') : lgr(0, -3.6, 0, 3.6, '#e8b400', '#b88a00'),
      OL,
      0.6,
    );
    if (f > 0) {
      rect(-5, -1.2, 10, 1.6, '#1b3fa0');
      rect(-3.6, 1.6, 4, 0.6, '#9c7400');
    }
    ctx.restore();
    if (((k.t + x) | 0) % 90 < 6) glow(cx + 2, cy - 2, 4, '#ffffff', 0.9);
  } else if (k.type == 'caffe' && k.orzo) {
    const cx = x + 4,
      cy = y + 6;
    glow(cx, cy, 10, '#e6c6a0', 0.3);
    el(cx, cy + 3.6, 6, 1.4, '#e6ebf6', OL, 0.5);
    rr(cx - 4.6, cy - 4, 9.2, 7.4, 2, lgr(cx - 4, 0, cx + 4, 0, '#f4e2c4', '#d8b88a'), OL, 0.6);
    el(cx, cy - 4, 4.4, 1, '#b0885a', OL, 0.3);
    ctx.beginPath();
    ctx.arc(cx + 5, cy - 0.6, 1.6, -1.4, 1.4);
    ctx.strokeStyle = OL;
    ctx.lineWidth = 0.6;
    ctx.stroke();
    TX('ORZO', cx, cy + 0.2, 2.6, '#6a4a2a', { w: 900 });
  } else if (k.type == 'caffe') {
    const cx = x + 4,
      cy = y + 6;
    glow(cx, cy, 10, '#ffcf8a', 0.3);
    el(cx, cy + 3.6, 6, 1.4, '#e6ebf6', OL, 0.5);
    ctx.beginPath();
    ctx.moveTo(cx - 4.4, cy - 3);
    ctx.lineTo(cx + 4.4, cy - 3);
    ctx.lineTo(cx + 3.4, cy + 3);
    ctx.quadraticCurveTo(cx, cy + 4.4, cx - 3.4, cy + 3);
    ctx.closePath();
    fs(lgr(cx - 4, 0, cx + 4, 0, '#ffffff', '#cfd6ea'), OL, 0.6);
    ctx.beginPath();
    ctx.arc(cx + 4.6, cy - 0.6, 1.8, -1.3, 1.3);
    ctx.strokeStyle = OL;
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 0.7;
    ctx.stroke();
    el(cx, cy - 3, 4, 0.9, '#6a3418');
    rect(cx - 2, cy - 1, 4, 1.6, '#ffd500');
    for (let i = 0; i < 2; i++) {
      const q = (t * 0.015 + i * 0.5) % 1;
      ctx.globalAlpha = 0.6 * (1 - q);
      ctx.beginPath();
      ctx.moveTo(cx - 1 + i * 2, cy - 4 - q * 7);
      ctx.quadraticCurveTo(
        cx + 1.4 + i * 2 + Math.sin(t * 0.1 + i) * 1.4,
        cy - 6 - q * 7,
        cx - 1 + i * 2,
        cy - 8 - q * 7,
      );
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  } else if (k.type == 'chip') {
    const cx = x + 5,
      cy = y + 5,
      p = 0.8 + 0.2 * Math.sin(t * 0.15);
    glow(cx, cy, 16 * p, '#66f0ff', 0.5);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(Math.sin(t * 0.05) * 0.15);
    for (let i = -2; i <= 2; i++) {
      rect(i * 2.2 - 0.4, -8, 0.8, 2.4, '#ffd500');
      rect(i * 2.2 - 0.4, 5.6, 0.8, 2.4, '#ffd500');
      rect(-8, i * 2.2 - 0.4, 2.4, 0.8, '#ffd500');
      rect(5.6, i * 2.2 - 0.4, 2.4, 0.8, '#ffd500');
    }
    rr(-6, -6, 12, 12, 2, lgr(0, -6, 0, 6, '#1b3fa0', '#0a1450'), OL, 0.8);
    rr(-4, -4, 8, 8, 1.4, rgr(0, 0, 0.5, 6, '#ffffff', '#66f0ff', [1, '#2f8cff']));
    TX(G.P ? cf(G.P).chip : 'A', 0, 0.3, 6.6, '#0a1450', { w: 700 });
    ctx.restore();
  } else if (k.type == 'snow') {
    const cx = x + 5,
      cy = y + 4;
    glow(cx, cy, 12, '#ff4d5e', 0.4);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(Math.sin(t * 0.07) * 0.12);
    rr(-7, -5, 14, 10, 1.4, '#ffffff', OL, 0.7);
    rect(-7, -5, 14, 3.4, '#e0303e');
    TX('INC', 0, 1.6, 4.6, '#1b2a78', { w: 700 });
    for (let i = -6; i < 7; i += 2) ci(i, 5, 0.5, '#e6ebf6');
    ctx.restore();
  } else {
    const cx = x + 5,
      cy = y + 4;
    glow(cx, cy, 14, '#ffe95c', 0.5);
    ci(cx, cy, 7, lgr(0, cy - 7, 0, cy + 7, '#4ad0ff', '#1b3fa0'), OL, 0.8);
    ci(cx + 2.6, cy - 2.6, 2.2, '#ffe95c');
    el(cx, cy + 4, 6, 2, '#ffd28a');
    ln(cx - 2, cy + 3, cx - 1.4, cy - 3, '#6a4020', 0.8);
    for (let i = 0; i < 3; i++) {
      const a = -2.4 + i * 0.5;
      ln(cx - 1.4, cy - 3, cx - 1.4 + Math.cos(a) * 3.4, cy - 3 + Math.sin(a) * 2, '#2e9e55', 0.9);
    }
    TX('1UP', cx, cy + 9.6, 4.4, '#ffe95c', { sk: OL, sw: 1.2 });
  }
}
export function lamp(x) {
  rect(x - 1, GY - 76, 2.2, 76, lgr(x - 1, 0, x + 1.2, 0, '#a9b2d0', '#4a5274'));
  ctx.beginPath();
  ctx.moveTo(x, GY - 76);
  ctx.quadraticCurveTo(x + 2, GY - 82, x + 12, GY - 80);
  ctx.strokeStyle = '#4a5274';
  ctx.lineWidth = 1.6;
  ctx.lineCap = 'round';
  ctx.stroke();
  rr(x + 8, GY - 81, 10, 3.2, 1.5, '#2a3052', OL, 0.4);
  el(x + 13, GY - 77.6, 4, 1.2, '#fff3c4');
  ctx.globalCompositeOperation = 'lighter';
  pth(
    [x + 9.5, GY - 77.5, x + 16.5, GY - 77.5, x + 36, GY, x - 10, GY],
    lgr(0, GY - 78, 0, GY, 'rgba(255,230,160,.22)', 'rgba(255,230,160,0)'),
  );
  ctx.globalCompositeOperation = 'source-over';
  glow(x + 13, GY - 77, 18, '#ffe2a0', 0.55);
  el(x + 13, GY + 1, 22, 3, 'rgba(255,230,160,.12)');
}
