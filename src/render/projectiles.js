/** @file Player and enemy projectile renderers. */
import { TX, ci, ctx, el, fs, glow, hexA, lgr, ln, pth, rect, rgr, rr, tw } from '../engine/canvas.js';
import { FB, OL, P2 } from '../engine/config.js';
import { G } from '../game/state.js';
import { V, ix, iy } from './interp.js';

export function drawEBul(b) {
  const x = ix(b),
    y = iy(b),
    cx = x + (b.w || 8) / 2,
    cy = y + (b.h || 8) / 2,
    t = V.TT;
  ctx.save();
  ctx.translate(cx, cy);
  switch (b.kind) {
    case 'num':
      ctx.rotate(t * 0.18);
      rr(-4.6, -5.2, 9.2, 10.4, 1, '#ffffff', OL, 0.6);
      rect(-4.6, -5.2, 9.2, 3, '#1b3fa0');
      TX('★', 0, 1.2, 5, '#ffd500');
      break;
    case 'ham':
      ctx.rotate(t * 0.35);
      rr(-0.7, -1, 1.4, 8, 0.6, '#9a6230', OL, 0.5);
      rr(-3.6, -4, 7.2, 3.4, 1.2, '#6a3a18', OL, 0.6);
      rect(-3.6, -3, 7.2, 0.8, '#e0b030');
      break;
    case 'wave': {
      const k = Math.sin(t * 0.6) * 0.5;
      glow(0, 2, 12, '#ffe95c', 0.4);
      ctx.beginPath();
      ctx.ellipse(0, 5, 8, 8 + k, 0, Math.PI, 0);
      fs(lgr(0, -3, 0, 5, 'rgba(255,255,255,.95)', 'rgba(255,214,90,.6)'), OL, 0.5);
      for (let i = 0; i < 4; i++) ci(-6 + i * 4, 5, 1.4, 'rgba(220,230,255,.8)');
      break;
    }
    case 'fald':
      if (b.g > 0 && iy(b) < 0) {
        ctx.restore();
        const wx = cx;
        glow(wx, 8, 10, '#ff3b4a', 0.6);
        TX('▼', wx, 8, 8, '#ff3b4a', { sk: '#fff', sw: 1.6 });
        return;
      }
      ctx.rotate(Math.sin(t * 0.2) * 0.25);
      ctx.beginPath();
      ctx.arc(0, -1.6, 3.4, Math.PI, 0);
      ctx.strokeStyle = OL;
      ctx.lineWidth = 2.4;
      ctx.stroke();
      ctx.strokeStyle = '#dfe4f2';
      ctx.lineWidth = 1.4;
      ctx.stroke();
      rr(-5, -1.6, 10, 7.4, 1.4, lgr(0, -1.6, 0, 5.8, '#ffe76a', '#d8a400'), OL, 0.7);
      ci(0, 1.6, 1, OL);
      rect(-0.4, 1.6, 0.8, 2, OL);
      break;
    case 'bollo':
      ctx.rotate(t * 0.12);
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * P2;
        ci(Math.cos(a) * 4.8, Math.sin(a) * 4.8, 0.9, '#ffd500');
      }
      rr(-4.4, -4.4, 8.8, 8.8, 0.6, '#ffd500', OL, 0.5);
      rr(-3, -3, 6, 6, 0.5, '#1b3fa0');
      TX('€', 0, 0.2, 4, '#ffe95c');
      break;
    case 'choc':
      ctx.rotate(t * 0.25);
      rr(-4.2, -4.2, 8.4, 8.4, 0.8, lgr(0, -4, 0, 4, '#d9b47a', '#a8803e'), OL, 0.6);
      rect(-1, -4.2, 2, 8.4, '#2f6bff');
      rect(-4.2, -1, 8.4, 2, '#2f6bff');
      break;
    case 'kb':
      ctx.rotate(Math.sin(t * 0.25) * 0.6 + t * 0.05);
      rr(-8, -3.6, 16, 7.2, 1.2, lgr(0, -3, 0, 3, '#f4f6fb', '#b9c1d8'), OL, 0.7);
      for (let i = 0; i < 6; i++)
        for (let j = 0; j < 2; j++) rr(-6.8 + i * 2.3, -2.4 + j * 2.3, 1.8, 1.7, 0.3, '#6a739a');
      rr(-4, 2.2, 8, 0.9, 0.3, '#6a739a');
      break;
    case 'key':
      ctx.rotate(t * 0.4);
      rr(-2.6, -2.6, 5.2, 5.2, 0.8, '#eef1f8', OL, 0.6);
      rr(-1.8, -2, 3.6, 3, 0.5, '#ffffff');
      TX(['Q', 'W', 'E', 'R', '⌘', '⇧'][((b.w * 7 + b.h) % 6) | 0], 0, -0.4, 3, '#3a4466');
      break;
    case 'mail':
      ctx.rotate(Math.sin(t * 0.2 + (b.sw || 1)) * 0.25);
      rr(-5.2, -3.6, 10.4, 7.2, 1, '#ffffff', OL, 0.7);
      pth([-5, -3.4, 0, 0.6, 5, -3.4], null, '#8a96c0', 0.6, true);
      ci(4.6, -3.6, 1.8, '#ff3b4a', OL, 0.4);
      TX('!', 4.6, -3.5, 2.6, '#fff', { w: 800 });
      break;
    case 'invite':
      ctx.rotate(Math.sin(t * 0.1 + cx) * 0.2);
      rr(-6, -5, 12, 10, 1.2, '#ffffff', OL, 0.6);
      rect(-6, -5, 12, 3.2, '#2f6bff');
      ci(0, 1.6, 2.2, null, '#1b3fa0', 0.6);
      ln(0, 1.6, 0, 0.2, '#1b3fa0', 0.5);
      ln(0, 1.6, 1.2, 1.6, '#1b3fa0', 0.5);
      break;
    case 'bubble': {
      const w = b.w,
        h = b.h;
      rr(-w / 2 + 0.6, -h / 2 + 1, w, h, 4, 'rgba(3,8,34,.35)');
      rr(-w / 2, -h / 2, w, h, 4, '#ffffff', OL, 0.7);
      pth(
        [
          b.vx > 0 ? -w / 2 + 6 : w / 2 - 6,
          h / 2 - 0.4,
          b.vx > 0 ? -w / 2 + 10 : w / 2 - 10,
          h / 2 - 0.4,
          b.vx > 0 ? -w / 2 + 4 : w / 2 - 4,
          h / 2 + 3.6,
        ],
        '#ffffff',
      );
      TX(b.txt, 0, 0.4, 5.4, '#0f1a48', { b: 1, w: 800 });
      break;
    }
    case 'fire': {
      ctx.restore();
      const fl = Math.sin(t * 0.9 + cx) * 0.8;
      glow(cx, cy, 14, '#ff8a2a', 0.7);
      el(cx, cy, 5 + fl * 0.3, 5.6 + fl * 0.4, rgr(cx, cy + 1, 0.5, 6, '#fff6c0', '#ffb020', [1, '#ff4a10']));
      el(cx - 1, cy - 3, 2.2, 3.4, 'rgba(255,240,180,.8)');
      return;
    }
    case 'spark':
      ctx.restore();
      glow(cx, cy, b.w > 4 ? 9 : 5, '#ffcf55', 0.9);
      ci(cx, cy, b.w > 4 ? 2 : 1, '#fff6c0');
      if (b.w > 4) {
        for (let i = 0; i < 4; i++) {
          const a = t * 0.5 + i * 1.57;
          ln(cx, cy, cx + Math.cos(a) * 4, cy + Math.sin(a) * 4, '#ffe95c', 0.6);
        }
      }
      return;
    case 'guano':
      el(0, 0, 2.6, 3, '#f4f7ff', OL, 0.6);
      ci(0.6, -0.6, 0.9, '#c6cee6');
      break;
    case 'slide':
      ctx.rotate(Math.sin(t * 0.3) * 0.15);
      rr(-5, -3.6, 10, 7.2, 0.8, '#ffffff', OL, 0.6);
      rect(-5, -3.6, 10, 1.8, '#2f6bff');
      rect(-3.4, 1.4, 1.6, 1.4, '#ffd500');
      rect(-1, 0.2, 1.6, 2.6, '#ff4d5e');
      rect(1.4, -0.8, 1.6, 3.6, '#20c2a0');
      break;
    case 'page':
      ctx.rotate(Math.sin(t * 0.12 * (b.sw || 1) + cx) * 0.35);
      rr(-5.6, -6.6, 11.2, 13.2, 1, '#ffffff', OL, 0.6);
      rect(-5.6, -6.6, 11.2, 3.4, '#e0303e');
      TX('' + (b.day || 13), 0, 1.8, 6.4, '#141a33', { w: 700 });
      break;
    case 'minimf':
      ctx.rotate(Math.sin(t * 0.2 + cx) * 0.3);
      rr(-5, -6, 10, 12, 1, lgr(-5, 0, 5, 0, '#e6e2d2', '#b9b4a0'), OL, 0.6);
      rect(-4.4, -5.4, 8.8, 1.6, '#2a3660');
      ci(-2, -1.4, 1.6, '#1a1f38', OL, 0.3);
      ci(2, -1.4, 1.6, '#1a1f38', OL, 0.3);
      for (let i = 0; i < 3; i++)
        ci(-2.4 + i * 2.4, 3.4, 0.5, (G.frame >> 3) % 3 == i ? '#3cff7a' : '#ff4d5e');
      break;
    case 'clausola': {
      ctx.rotate(Math.sin(t * 0.25 + cx) * 0.5);
      rr(-6, -7, 12, 14, 0.8, '#fffaf0', OL, 0.6);
      rect(-6, -7, 12, 3, '#1b3fa0');
      TX('§', 0, 1, 7, '#b8143a', { w: 700 });
      ci(3.2, 4.4, 1.6, '#d0102a', OL, 0.3);
      ctx.restore();
      if (b.txt) {
        const w = tw(b.txt, 3.4, { b: 1, w: 900 }) + 5;
        rr(cx - w / 2, cy - 15, w, 6, 3, 'rgba(255,255,255,.92)', OL, 0.4);
        TX(b.txt, cx, cy - 12, 3.4, '#9c1030', { b: 1, w: 900 });
      }
      return;
    }
    case 'ink':
      el(0, 0, 1.6, 2.2, '#1b2a8a', OL, 0.3);
      ci(-0.5, -0.8, 0.5, 'rgba(255,255,255,.6)');
      break;
    case 'cv':
      ctx.rotate(Math.sin(t * 0.12 * (b.sw || 1) + cx) * 0.35);
      rr(-5, -6.4, 10, 12.8, 0.8, '#ffffff', OL, 0.6);
      rect(-3.8, -5.2, 3.2, 3.6, '#cfd6ea');
      ci(-2.2, -4.2, 0.9, '#8a96c0');
      TX('CV', 2, -3.4, 3.2, '#e8293b', { w: 700 });
      for (let i = 0; i < 3; i++) rect(-3.8, 0.2 + i * 1.6, 7.6, 0.5, '#aab2c8');
      break;
    case 'occh':
      ctx.restore();
      glow(cx, cy, 9, '#ff3b4a', 0.9);
      ci(cx, cy, 2.2, '#ff8090');
      ci(cx, cy, 1, '#fff');
      return;
    case 'foglio': {
      const f = Math.sin(t * 0.4);
      ctx.rotate(f * 0.2);
      ctx.scale(1, 0.6 + Math.abs(f) * 0.4);
      rr(-5, -3.6, 10, 7.2, 0.6, '#ffffff', OL, 0.6);
      for (let i = 0; i < 3; i++) rect(-3.6, -1.8 + i * 1.6, 7, 0.5, '#aab2c8');
      break;
    }
  }
  ctx.restore();
}
export function drawBul(b) {
  const x = ix(b),
    y = iy(b),
    d = b.vx >= 0 ? 1 : -1,
    t = V.TT;
  if (drawNewBul(b, x, y, d, t)) return;
  if (b.k == 'aura' || !b.k) {
    const c = b.pierce ? '#ffe95c' : '#66f0ff';
    ctx.globalCompositeOperation = 'lighter';
    ln(x - b.vx * 3.2, y - b.vy * 3.2, x, y, hexA(c, 0.35), b.r * 1.6);
    ctx.globalCompositeOperation = 'source-over';
    glow(x, y, b.r * 4, c, 0.7);
    ci(x, y, b.r * 0.95, rgr(x - b.r * 0.3, y - b.r * 0.3, 0, b.r, '#ffffff', c));
  } else if (b.k == 'bolt') {
    const s = b._s || (b._s = Math.random() * 9);
    const pts = [];
    for (let i = 0; i <= 6; i++) {
      const u = i / 6;
      pts.push(
        x - d * 13 + u * d * 26,
        y + (i % 2 ? 1 : -1) * (2 + Math.sin(s + i * 1.7 + t * 0.6) * 1.4) * (i == 0 || i == 6 ? 0.3 : 1),
      );
    }
    ctx.globalCompositeOperation = 'lighter';
    pth(pts, null, b.pierce ? 'rgba(255,90,90,.6)' : 'rgba(255,230,90,.55)', 4.4, true);
    ctx.globalCompositeOperation = 'source-over';
    pth(pts, null, b.pierce ? '#ff6a6a' : '#ffe95c', 1.8, true);
    pth(pts, null, '#ffffff', 0.7, true);
    glow(x + d * 10, y, 10, '#ffe95c', 0.6);
  } else if (b.k == 'pi') {
    const c = b.pierce ? '#ffe95c' : '#66f0ff';
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 1; i < 4; i++)
      rect(x - d * (6 + i * 4) - 1.5, y - 1.2 + (i % 2) * 2, 6, 0.9, hexA(c, 0.5 - i * 0.1));
    ctx.globalCompositeOperation = 'source-over';
    glow(x, y, 10, c, 0.65);
    TX('π', x, y - 0.6, 11, '#ffffff', { sk: '#0f2a7a', sw: 2.2, w: 700 });
    ctx.globalAlpha = 0.6;
    TX('π', x, y - 0.6, 11, c, { w: 700 });
    ctx.globalAlpha = 1;
  } else if (b.k == 'swear') {
    const sc = 1 + Math.min(b.t || 0, 24) / 30,
      rr2 = 7.6 * sc;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.sin(t * 0.3) * 0.15);
    ctx.beginPath();
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * P2,
        r2 = i % 2 ? rr2 * 0.62 : rr2;
      ctx.lineTo(Math.cos(a) * r2 * 1.35, Math.sin(a) * r2);
    }
    ctx.closePath();
    fs(rgr(0, 0, 1, rr2 * 1.3, b.pierce ? '#fff6a0' : '#ffd04a', b.pierce ? '#ffb000' : '#ff3b30'), OL, 0.8);
    ctx.restore();
    TX(b.txt, x, y, 6.4 * Math.min(sc, 1.5), '#ffffff', { sk: '#7a0a14', sw: 1.8, w: 700 });
  } else if (b.k == 'cup') {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t * 0.35 * d);
    glow(0, 0, 9, '#c8864a', 0.5);
    el(0, 2.4, 4.6, 1.2, '#f4f7ff', OL, 0.5);
    rr(-3.2, -2.6, 6.4, 5, 1.4, lgr(-3, 0, 3, 0, '#ffffff', '#d4dbef'), OL, 0.6);
    el(0, -2.6, 3, 0.9, '#6a3418', OL, 0.3);
    ctx.beginPath();
    ctx.arc(3.6, -0.4, 1.4, -1.4, 1.4);
    ctx.strokeStyle = OL;
    ctx.lineWidth = 0.6;
    ctx.stroke();
    rect(-3.2, -0.2, 6.4, 1, '#ffd500');
    ctx.restore();
    for (let i = 0; i < 2; i++) {
      const q = (t * 0.05 + i * 0.5) % 1;
      ctx.globalAlpha = 0.6 * (1 - q);
      ci(x - d * (3 + q * 7), y - 2 - q * 5 + i, 1 + q * 1.6, '#ffffff');
    }
    ctx.globalAlpha = 1;
  } else if (b.k == 'plane') {
    const an = Math.atan2(b.vy, b.vx);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(an);
    glow(0, 0, 8, '#cfe0ff', 0.35);
    pth([7, 0, -6, -4.6, -3, 0], '#ffffff', OL, 0.55);
    pth([7, 0, -6, 4, -3, 0], '#dfe6f7', OL, 0.55);
    ln(7, 0, -3, 0, '#9fb4ff', 0.5);
    pth([-3, 0, -6, 1.6, -5, 0], '#c4cde6');
    ctx.restore();
    ctx.globalAlpha = 0.5;
    for (let i = 1; i < 4; i++) ci(x - Math.cos(an) * i * 4, y - Math.sin(an) * i * 4, 0.5, '#ffffff');
    ctx.globalAlpha = 1;
  } else if (b.k == 'paper') {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t * 0.25);
    rr(-4, -5, 8, 10, 0.6, '#ffffff', OL, 0.55);
    for (let i = 0; i < 4; i++) rect(-2.8, -3.2 + i * 1.8, 5.6, 0.5, '#aab2c8');
    ctx.restore();
  } else if (b.k == 'cmd') {
    ctx.font = '800 5px ' + FB;
    const tx = '$ ' + b.txt,
      w = ctx.measureText(tx).width + 7;
    glow(x, y, w * 0.5, '#3cff7a', 0.25);
    rr(x - w / 2, y - 4.4, w, 8.8, 1.6, '#0b0f14', '#e6ebf6', 0.6);
    TX('$', x - w / 2 + 4.4, y + 0.2, 5, '#3cff7a', { b: 1, w: 900 });
    TX(b.txt, x + 2.2, y + 0.2, 5, '#ffffff', { b: 1, w: 800 });
  } else if (b.k == 'slideP') {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.sin(t * 0.3 + x * 0.1) * 0.18);
    glow(0, 0, 9, '#5fe6d6', 0.45);
    rr(-7, -5, 14, 10, 1, '#ffffff', OL, 0.7);
    rect(-7, -5, 14, 2.6, '#22c4b2');
    rect(-4.6, 1.6, 1.8, 1.8, '#e8293b');
    rect(-1.8, -0.4, 1.8, 3.8, '#2f6bff');
    rect(1, -1.8, 1.8, 5.2, '#22c4b2');
    if (b.pierce) rr(-7, -5, 14, 10, 1, null, '#ff6b7a', 0.8);
    ctx.restore();
  } else if (b.k == 'merge') {
    glow(x, y, 9, '#3cc46a', 0.5);
    rr(x - 12, y - 4.6, 24, 9.2, 4.6, lgr(0, y - 4, 0, y + 4, '#5ce08a', '#1f8a45'), OL, 0.7);
    ci(x - 8, y - 1.4, 0.9, '#fff');
    ci(x - 8, y + 1.6, 0.9, '#fff');
    ln(x - 8, y - 1, x - 8, y + 1.4, '#fff', 0.5);
    TX('merge', x + 2.2, y + 0.2, 5, '#ffffff', { b: 1, w: 900 });
  } else if (b.k == 'jarg') {
    ctx.font = '800 5px ' + FB;
    const w = ctx.measureText(b.txt).width + 7;
    glow(x, y, w * 0.6, '#3cff7a', 0.35);
    rr(x - w / 2, y - 4.4, w, 8.8, 1.6, '#04140a', '#3cff7a', 0.8);
    TX(b.txt, x, y + 0.2, 5, '#3cff7a', { b: 1, w: 800 });
  }
}
export function drawBombs() {
  for (const b of G.bombs) {
    const x = ix(b),
      y = iy(b),
      f = Math.cos(b.t * 0.35);
    glow(x, y, 10, '#ff4d5e', 0.45);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(b.t * 0.12);
    ctx.scale(f, 1);
    rr(-5.6, -4, 11.2, 8, 1.2, '#ffffff', OL, 0.7);
    rect(-5.6, -4, 11.2, 2.6, '#e0303e');
    if (Math.abs(f) > 0.4) TX('INC', 0, 1.4, 3.6, '#1b2a78', { w: 700 });
    ctx.restore();
  }
  for (const f of G.snowFx) {
    const k = 1 - f.life / 24;
    glow(f.x, f.y, f.r * 1.6, '#ffb060', (1 - k) * 0.9);
    ci(f.x, f.y, f.r, null, hexA('#ffffff', 1 - k), 3 * (1 - k) + 0.3);
    ci(f.x, f.y, f.r * 0.75, null, hexA('#ff4d5e', (1 - k) * 0.8), 2);
  }
}

/** Projectiles of Iolanda, Ops, Sora Rita and their allies. Returns true when handled. */
function drawNewBul(b, x, y, d, t) {
  switch (b.k) {
    case 'postit':
    case 'kcard': {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((b.rot || 0) + t * 0.25 * d);
      const s = b.k == 'kcard' ? 0.9 : b.pierce ? 1.25 : 1,
        c = b.k == 'kcard' ? '#7fd6ff' : b.pierce ? '#ff8a96' : '#ffe95c';
      rr(-4 * s, -4 * s, 8 * s, 8 * s, 0.4, c, OL, 0.5);
      rect(-4 * s, -4 * s, 8 * s, 1.8 * s, 'rgba(0,0,0,.12)');
      for (let i = 0; i < 2; i++) rect(-2.6 * s, -0.6 * s + i * 1.8 * s, 5.2 * s, 0.4, 'rgba(30,40,90,.5)');
      ctx.restore();
      return true;
    }
    case 'container': {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.sin(b.t * 0.2 + x) * 0.15 + (b.vy || 0) * 0.04);
      const c = b.pierce ? '#ff9a3a' : '#3a7bff',
        c2 = b.pierce ? '#c05a10' : '#1b3fa0';
      rr(-6.4, -4.2, 12.8, 8.4, 0.6, lgr(0, -4, 0, 4, c, c2), OL, 0.6);
      for (let i = 0; i < 5; i++) ln(-4.6 + i * 2.3, -3.4, -4.6 + i * 2.3, 3.4, 'rgba(0,0,0,.25)', 0.5);
      rect(-6.4, -4.2, 12.8, 1, 'rgba(255,255,255,.3)');
      ctx.restore();
      return true;
    }
    case 'phone': {
      const p = G.P;
      if (p) {
        // curly cord back to Sora Rita's hand
        const hx = ix(p) + p.w / 2 + p.face * 5,
          hy = iy(p) + 11,
          n = 14;
        ctx.beginPath();
        for (let i = 0; i <= n; i++) {
          const u = i / n,
            px = hx + (x - hx) * u,
            py = hy + (y - hy) * u + Math.sin(u * Math.PI) * 6,
            cu = Math.sin(u * 40 + t * 0.4) * 1.2;
          if (i) ctx.lineTo(px, py + cu);
          else ctx.moveTo(px, py);
        }
        ctx.strokeStyle = '#1a1a22';
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(t * 0.35 * d);
      rr(-1.6, -6, 3.2, 12, 1.4, '#1a1a22', OL, 0.5);
      el(0, -6, 2.8, 1.8, '#1a1a22', OL, 0.4);
      el(0, 6, 2.8, 1.8, '#1a1a22', OL, 0.4);
      ln(-0.6, -4, -0.6, 4, 'rgba(255,255,255,.3)', 0.5);
      ctx.restore();
      if (b.t % 20 < 10) TX('DRIIN', x, y - 10, 3.4, '#c9a2ff', { b: 1, w: 900 });
      return true;
    }
    case 'pkt':
      glow(x, y, 8, '#3cff7a', 0.6);
      rr(x - 4, y - 3, 8, 6, 0.8, '#0b0f1a', '#3cff7a', 0.6);
      TX((b.t >> 2) % 2 ? '01' : '10', x, y + 0.2, 3.2, '#3cff7a', { w: 700 });
      b.t++;
      return true;
    case 'ring':
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(x - d * i * 2.5, y, 3 + i * 2, -0.9, 0.9);
        ctx.strokeStyle = hexA('#c9a2ff', 0.9 - i * 0.25);
        ctx.lineWidth = 1.2;
        if (d < 0) {
          ctx.beginPath();
          ctx.arc(x - d * i * 2.5, y, 3 + i * 2, Math.PI - 0.9, Math.PI + 0.9);
        }
        ctx.stroke();
      }
      return true;
  }
  return false;
}
