/** @file Particles, floating text, screen flashes and full-screen specials. */
import { TX, ci, ctx, glow, rect, tw } from '../engine/canvas.js';
import { C } from '../engine/config.js';
import { E, clamp, rnd } from '../engine/math.js';
import { G } from '../game/state.js';
import { ix, iy } from './interp.js';

export const confetti = [],
  fireworks = [];
export function partsDraw() {
  for (const q of G.parts) {
    const x = ix(q),
      y = iy(q),
      k = clamp(q.life / q.max, 0, 1);
    if (q.c == C.pale || q.c == '#cfd9ff') {
      ctx.globalAlpha = 0.35 * k;
      ci(x, y, q.s * (1 + (1 - k) * 2.2), '#e8eeff');
      ctx.globalAlpha = 1;
      continue;
    }
    const r = q.s * 0.55 * (0.35 + 0.65 * k);
    ctx.globalAlpha = k;
    ci(x, y, r, q.c);
    ctx.globalAlpha = 1;
    glow(x, y, r * 3.4, q.c, k * 0.45);
  }
}
export function popsDraw() {
  for (const q of G.pops) {
    if (!q._m) q._m = q.life;
    const age = q._m - q.life,
      x = ix(q),
      y = iy(q),
      k = clamp(q.life / 18, 0, 1),
      s = 0.6 + 0.4 * E.back(clamp(age / 10, 0, 1));
    ctx.save();
    ctx.globalAlpha = k;
    ctx.translate(x + tw(q.txt, 7, { b: 1, w: 900 }) / 2, y);
    ctx.scale(s, s);
    TX(q.txt, 0, 0, 7, q.c || '#fff', { b: 1, w: 900, sk: '#0a1436', sw: 2.2 });
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}
export function confDraw() {
  for (let i = confetti.length - 1; i >= 0; i--) {
    const c = confetti[i];
    if (c.f !== G.frame) {
      c.f = G.frame;
      c.x += c.vx;
      c.y += c.vy;
      c.vy += 0.06;
      c.vx *= 0.99;
      c.r += c.vr;
      c.life--;
    }
    if (c.life <= 0) {
      confetti.splice(i, 1);
      continue;
    }
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.rotate(c.r);
    ctx.scale(1, Math.cos(c.r * 2));
    ctx.globalAlpha = clamp(c.life / 40, 0, 1);
    rect(-1.6, -1, 3.2, 2, c.c);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}
export function addConf(x, y, n) {
  for (let i = 0; i < n; i++)
    confetti.push({
      x,
      y,
      vx: rnd(-3, 3),
      vy: rnd(-5, -1),
      r: rnd(0, 6),
      vr: rnd(-0.3, 0.3),
      c: ['#ffd500', '#2f6bff', '#ff4d5e', '#66f0ff', '#ffffff', '#3cc46a'][(Math.random() * 6) | 0],
      life: 90 + Math.random() * 60,
    });
}
