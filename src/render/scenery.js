/** @file Parallax backgrounds, office props and foreground layers. */
import {
  TX,
  bl,
  ci,
  ctx,
  el,
  fs,
  getL,
  glow,
  hexA,
  lgr,
  ln,
  pth,
  rect,
  rgr,
  rr,
  rrPath,
  shadow,
  tile,
  tw,
} from '../engine/canvas.js';
import { GY, H, OL, P2, W } from '../engine/config.js';
import { clamp, seedR } from '../engine/math.js';
import { G } from '../game/state.js';
import { V, ix, iy } from './interp.js';
import { lamp } from './pickups.js';

function cloudSpr() {
  return getL('cloud', 110, 40, () => {
    const r = seedR(4);
    const pf = (x, y, rx, a) => {
      ctx.fillStyle = rgr(
        x,
        y - rx * 0.2,
        0,
        rx,
        'rgba(190,205,255,' + a + ')',
        'rgba(160,180,245,' + a * 0.6 + ')',
        [1, 'rgba(150,170,240,0)'],
      );
      ctx.beginPath();
      ctx.ellipse(x, y, rx, rx * 0.62, 0, 0, P2);
      ctx.fill();
    };
    for (let i = 0; i < 10; i++) pf(18 + r() * 74, 22 + r() * 6, 9 + r() * 14, 0.13);
    for (let i = 0; i < 6; i++) pf(26 + r() * 56, 17 + r() * 5, 8 + r() * 9, 0.12);
  });
}
export function vignette() {
  return getL('vig', W, H, () => {
    ctx.fillStyle = rgr(W / 2, H * 0.55, H * 0.35, W * 0.62, 'rgba(0,0,0,0)', 'rgba(2,6,30,.55)');
    ctx.fillRect(0, 0, W, H);
  });
}
function cityTile(seed, base, top, hmin, hmax, lit, win) {
  const r = seedR(seed);
  let x = -4;
  while (x < W) {
    const w = 14 + r() * 30,
      h = hmin + r() * (hmax - hmin);
    const y = top - h;
    rect(x, y, w, top - y + 2, base);
    if (r() < 0.35) {
      rect(x + w * 0.3, y - 6 - r() * 10, w * 0.4, 8 + r() * 10, base);
    }
    if (r() < 0.3) rect(x + w * 0.5, y - 14 - r() * 8, 1, 16, base);
    if (win)
      for (let yy = y + 4; yy < top - 3; yy += 5)
        for (let xx = x + 2; xx < x + w - 2; xx += 4)
          if (r() < lit) rect(xx, yy, 2, 2.2, r() < 0.6 ? 'rgba(255,214,140,.75)' : 'rgba(170,200,255,.6)');
    x += w + 1 + r() * 3;
  }
}
function sky0() {
  return getL('sky0', W, H, () => {
    rect(
      0,
      0,
      W,
      H,
      lgr(
        0,
        0,
        0,
        GY,
        '#07112f',
        '#0f2466',
        [0.5, '#22479f'],
        [0.82, '#5a79cf'],
        [0.95, '#b9a6d2'],
        [1, '#f2b98d'],
      ),
    );
    const r = seedR(2);
    for (let i = 0; i < 70; i++) {
      ctx.globalAlpha = 0.15 + r() * 0.6;
      ci(r() * W, r() * 110, 0.25 + r() * 0.45, '#fff');
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = rgr(W * 0.72, GY, 10, 240, 'rgba(255,170,120,.30)', 'rgba(255,170,120,0)');
    ctx.fillRect(0, 0, W, H);
  });
}
function city0a() {
  return getL('c0a', W, GY, () => {
    cityTile(7, '#2a4192', GY, 30, 80, 0.05, 1);
    rect(0, 0, W, GY, lgr(0, GY - 90, 0, GY, 'rgba(110,140,220,0)', 'rgba(150,170,230,.35)'));
  });
}
function city0b() {
  return getL('c0b', W, GY, () => {
    cityTile(77, '#121f55', GY, 25, 70, 0.22, 1);
    rect(0, 0, W, GY, lgr(0, GY - 60, 0, GY, 'rgba(80,110,200,0)', 'rgba(90,120,210,.25)'));
  });
}
function hqLayer() {
  return getL('hq', W, GY, () => {
    const r = seedR(1992);
    const tower = (x, y, w, h) => {
      rect(x, y, w, h, lgr(x, 0, x + w, 0, '#0a1028', '#151d42', [0.7, '#0f1634'], [1, '#080c20']));
      rect(x, y, w, 2.2, '#2b3770');
      rect(x, y + 2.2, w, 1, 'rgba(150,170,255,.25)');
      for (let px = x + 8; px < x + w - 4; px += 16) {
        rect(px, y + 3, 2.4, h, '#070a1a');
        rect(px + 2.4, y + 3, 0.5, h, 'rgba(120,140,220,.18)');
      }
      for (let yy = y + 7; yy < y + h - 8; yy += 8)
        for (let xx = x + 3; xx < x + w - 5; xx += 8) {
          if ((((xx - x - 8) % 16) + 16) % 16 < 3) continue;
          const v = r();
          if (v < 0.38) {
            const c = v < 0.22 ? '#ffd98a' : '#e6eeff';
            rect(xx, yy, 5, 4, c);
            rect(xx, yy + 2.6, 5, 1.4, 'rgba(255,255,255,.18)');
            if (v < 0.1) glow(xx + 2.5, yy + 2, 7, c, 0.35);
          } else rect(xx, yy, 5, 4, lgr(0, yy, 0, yy + 4, '#1b2552', '#121a3b'));
        }
    };
    tower(278, 30, 142, GY - 30);
    tower(110, 62, 140, GY - 62);
    rect(98, 70, 14, GY - 70, lgr(98, 0, 112, 0, '#0e1430', '#1d2752', '#0b1028'));
    for (let y = 78; y < GY - 8; y += 9) {
      rect(100, y, 10, 3, '#ffcf66');
      glow(105, y + 1.5, 8, '#ffcf66', 0.35);
    }
    rect(250, 74, 28, GY - 74, '#070a18');
    for (let y = 92; y < GY - 22; y += 8) {
      const on = r() < 0.82;
      rect(254, y, 20, 5, on ? '#ffe7a0' : '#1f2648');
      if (on) glow(264, y + 2.5, 9, '#ffd27a', 0.25);
    }
    rect(408, 36, 10, GY - 36, '#0c1230');
    for (let y = 44; y < GY - 10; y += 11) {
      rect(410, y, 5, 6, '#ffcf55');
      glow(412.5, y + 3, 7, '#ffcf55', 0.4);
    }
    rr(234, 56, 66, 22, 2, '#05081a');
    rr(236, 58, 62, 18, 2.5, lgr(0, 58, 0, 76, '#fff07a', '#ffd000', [1, '#e3ad00']));
    rect(237, 59, 60, 2, 'rgba(255,255,255,.55)');
    TX('Big', 253, 67.5, 7.6, '#13299b', { w: 700 });
    TX('Company', 278.5, 67.5, 7.6, '#2f6bff', { w: 700 });
    rect(240, GY - 24, 48, 24, '#151a34');
    rect(254, GY - 18, 20, 18, lgr(0, GY - 18, 0, GY, '#fff1b8', '#ffcf66'));
    glow(264, GY - 8, 26, '#ffcf66', 0.5);
    rr(396, GY - 36, 80, 36, 1.5, lgr(0, GY - 36, 0, GY, '#eef1f8', '#c8cfe0'));
    for (let y = GY - 27; y < GY; y += 8) rect(396, y, 80, 0.8, '#a8b0c6');
    rect(396, GY - 36, 80, 3, '#ffffff');
    rr(410, GY - 22, 12, 22, 1, '#2c3660');
    rect(432, GY - 30, 30, 9, 'rgba(60,80,140,.5)');
  });
}
function flags(x) {
  const pole = (px, col) => {
    rect(px, GY - 62, 1.2, 62, lgr(px, 0, px + 1.2, 0, '#cfd6e8', '#7a84a6'));
    ci(px + 0.6, GY - 62.5, 1, '#ffd500');
    const t = V.TT * 0.12;
    ctx.beginPath();
    const fw = 14,
      fh = 9,
      x0 = px + 1.2,
      y0 = GY - 60;
    ctx.moveTo(x0, y0);
    for (let i = 0; i <= 6; i++) {
      const u = i / 6;
      ctx.lineTo(x0 + u * fw, y0 + Math.sin(t + u * 4) * 1.6 * u);
    }
    for (let i = 6; i >= 0; i--) {
      const u = i / 6;
      ctx.lineTo(x0 + u * fw, y0 + fh + Math.sin(t + u * 4 + 0.5) * 1.6 * u);
    }
    ctx.closePath();
    ctx.save();
    ctx.clip();
    col(x0, y0, fw, fh);
    ctx.restore();
  };
  pole(x + 298, (a, b, w, h) => {
    rect(a, b - 3, w, h + 6, '#1d47c8');
    for (let i = 0; i < 12; i++) {
      const an = (i / 12) * P2;
      ci(a + w / 2 + Math.cos(an) * 2.8, b + h / 2 + Math.sin(an) * 2.8, 0.45, '#ffd500');
    }
  });
  pole(x + 313, (a, b, w, h) => {
    rect(a, b - 3, w / 3, h + 6, '#119b4a');
    rect(a + w / 3, b - 3, w / 3, h + 6, '#f4f4f4');
    rect(a + (2 * w) / 3, b - 3, w / 3 + 1, h + 6, '#d62b37');
  });
  pole(x + 328, (a, b, w, h) => {
    rect(a, b - 3, w, h + 6, '#ffd500');
    ci(a + w * 0.4, b + h / 2, 2.6, '#2f6bff');
  });
}
export function sky3() {
  return getL('sky3', W, H, () => {
    rect(0, 0, W, H, lgr(0, 0, 0, GY, '#02040f', '#060c2a', [0.6, '#0d1a4e'], [1, '#22377a']));
    const r = seedR(11);
    for (let i = 0; i < 150; i++) {
      ctx.globalAlpha = 0.2 + r() * 0.8;
      ci(r() * W, r() * 170, 0.2 + r() * 0.5, r() < 0.15 ? '#ffe9a8' : '#dfe7ff');
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = rgr(W * 0.6, 60, 0, 200, 'rgba(90,110,220,.18)', 'rgba(0,0,0,0)');
    ctx.fillRect(0, 0, W, H);
    glow(396, 46, 46, '#fff3c0', 0.35);
    ci(396, 46, 13, rgr(392, 42, 1, 14, '#fffbe8', '#f2e3a8'));
    ci(391, 43, 2.2, 'rgba(200,180,120,.35)');
    ci(400, 50, 3, 'rgba(200,180,120,.3)');
    ci(399, 40, 1.4, 'rgba(200,180,120,.3)');
  });
}
export function city3() {
  return getL('c3', W, GY, () => {
    const r = seedR(31);
    cityTile(31, '#081030', GY, 20, 75, 0.3, 1);
    for (let i = 0; i < 60; i++) {
      const x = r() * W,
        y = GY - r() * 30;
      glow(x, y, 2 + r() * 4, r() < 0.5 ? '#ffcf7a' : '#8fb0ff', 0.4);
    }
    rect(0, 0, W, GY, lgr(0, GY - 40, 0, GY, 'rgba(40,60,160,0)', 'rgba(60,80,170,.4)'));
  });
}
export function signBig() {
  return getL('sign3', 240, 140, () => {
    const x = 10,
      y = 34;
    rect(x + 20, y + 56, 4, 90, '#0a0f26');
    rect(x + 186, y + 56, 4, 90, '#0a0f26');
    for (let i = 0; i < 8; i++) {
      ln(x + 22, y + 60 + i * 10, x + 188, y + 65 + i * 10, '#0d1430', 1);
      ln(x + 22, y + 65 + i * 10, x + 188, y + 60 + i * 10, '#0d1430', 1);
    }
    rr(x - 4, y - 4, 218, 62, 5, '#04071a');
    rr(x, y, 210, 54, 4, lgr(0, y, 0, y + 54, '#fff27a', '#ffd400', [1, '#e0a800']));
    rect(x + 2, y + 2, 206, 5, 'rgba(255,255,255,.5)');
    TX('Big', x + 42, y + 28, 25, '#12289b', { w: 700 });
    TX('Company', x + 125, y + 28, 25, '#2f6bff', { w: 700 });
  });
}
function wall1() {
  return getL('w1', 170, GY, () => {
    rect(0, 0, 170, GY, lgr(0, 0, 0, GY, '#1a3584', '#14296a', [1, '#0f2056']));
    rect(0, 0, 170, 16, lgr(0, 0, 0, 16, '#0b1a4d', '#13286a'));
    rr(24, 4, 60, 4, 2, '#eaf2ff');
    rr(18, 36, 82, 82, 3, '#0a1442');
    const vx = 22,
      vy = 40,
      vw = 74,
      vh = 74;
    ctx.save();
    ctx.beginPath();
    ctx.rect(vx, vy, vw, vh);
    ctx.clip();
    rect(vx, vy, vw, vh, lgr(0, vy, 0, vy + vh, '#1b2f7a', '#4e6fd0', [0.85, '#d6a3a8'], [1, '#ffbe8a']));
    const r = seedR(5);
    for (let i = 0; i < 8; i++) {
      const bw = 6 + r() * 12,
        bh = 14 + r() * 40,
        bx = vx + i * 10 + r() * 4;
      rect(bx, vy + vh - bh, bw, bh, '#152056');
      for (let yy = vy + vh - bh + 3; yy < vy + vh - 2; yy += 4)
        for (let xx = bx + 1.5; xx < bx + bw - 1; xx += 3)
          if (r() < 0.35) rect(xx, yy, 1.4, 1.6, 'rgba(255,215,140,.8)');
    }
    ctx.restore();
    rect(57, 40, 2, 74, '#0a1442');
    rect(22, 76, 74, 2, '#0a1442');
    rect(vx, vy, vw, vh * 0.5, 'rgba(255,255,255,.04)');
    ctx.globalAlpha = 0.08;
    pth([vx + 10, vy, vx + 30, vy, vx + 6, vy + vh, vx - 6, vy + vh], '#fff');
    ctx.globalAlpha = 1;
    rr(116, 52, 36, 48, 2, '#0a1442');
    rr(118, 54, 32, 44, 1.5, lgr(0, 54, 0, 98, '#ffe45a', '#f5c400'));
    rr(122, 58, 24, 14, 1.5, '#1b3fa0');
    TX('BC', 134, 65.5, 9, '#ffd500');
    for (let i = 0; i < 3; i++) rr(122, 76 + i * 6, 18 - i * 4, 2.4, 1, '#1b3fa0');
    rect(0, 128, 170, GY - 128, lgr(0, 128, 0, GY, '#14296a', '#0e1f55'));
    rect(0, 126, 170, 2.2, '#ffd500');
    rect(0, 128.2, 170, 1, 'rgba(0,0,0,.25)');
  });
}
function wall2() {
  return getL('w2', 200, GY, () => {
    rect(0, 0, 200, GY, lgr(0, 0, 0, GY, '#18206c', '#121a5a'));
    for (let y = 22; y < 164; y += 18)
      for (let x = ((y / 18) % 2) * 12; x < 200; x += 24) {
        ctx.globalAlpha = 0.09;
        pth([x, y - 5, x + 4, y, x, y + 5, x - 4, y], '#c9b2ff');
        ci(x, y, 1.2, '#ffd76a');
        ctx.globalAlpha = 1;
      }
    rect(0, 0, 200, 12, lgr(0, 0, 0, 12, '#0d1240', '#1d2678'));
    rect(0, 11, 200, 2, '#c99a1a');
    rect(0, 13, 200, 1, '#ffe08a');
    const col = x => {
      rect(
        x - 9,
        0,
        18,
        GY,
        lgr(x - 9, 0, x + 9, 0, '#cfd3e6', '#ffffff', [0.55, '#e9ecf6'], [1, '#a9afc8']),
      );
      for (let i = -6; i <= 6; i += 4) rect(x + i, 16, 1, 148, 'rgba(120,130,170,.25)');
      rr(x - 12, 6, 24, 10, 1, '#f6f7fc');
      rr(x - 12, 158, 24, 8, 1, '#f6f7fc');
    };
    col(8);
    rr(70, 40, 62, 74, 2, lgr(0, 40, 0, 114, '#ffe27a', '#c99a1a', [1, '#8c6a0a']));
    rr(74, 44, 54, 66, 1, '#0b1033');
    rect(78, 48, 46, 58, lgr(0, 48, 0, 106, '#2a3b8c', '#152060'));
    el(101, 98, 16, 14, lgr(0, 84, 0, 112, '#2f6bff', '#1b3fa0'));
    ci(101, 72, 9, lgr(0, 63, 0, 81, '#ffdcbc', '#e7b18a'));
    el(101, 66, 9, 4, '#3a2a20');
    rect(99, 82, 4, 8, '#fff');
    pth([100, 84, 102, 84, 101, 92], '#ffd500');
    rect(0, 164, 200, GY - 164, lgr(0, 164, 0, GY, '#5a3218', '#3c200e'));
    for (let x = 0; x < 200; x += 25) {
      rr(x + 3, 170, 19, 52, 1.5, null, 'rgba(255,210,140,.18)', 0.8);
    }
    rect(0, 163, 200, 2.5, '#e0b030');
  });
}
function wall4() {
  return getL('w4', 96, GY, () => {
    rect(0, 0, 96, GY, lgr(0, 0, 0, GY, '#050a26', '#081236', [1, '#0a1848']));
    rect(0, 22, 96, 4, '#c99a1a');
    rect(0, 26, 96, 1, '#6a5210');
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 24 + 4, 26);
      ctx.quadraticCurveTo(i * 24 + 14, 46 + (i % 2) * 10, i * 24 + 24, 26);
      ctx.strokeStyle = ['#2f6bff', '#ffd500', '#20c2a0', '#ff4d5e'][i];
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
    rr(14, 38, 60, GY - 40, 2, lgr(14, 0, 74, 0, '#0d1a54', '#16267a', '#0b1548'), '#22348a', 0.8);
    rect(18, 44, 52, GY - 50, '#060d33');
    for (let y = 48; y < GY - 12; y += 12) {
      rr(20, y, 48, 9, 1, lgr(0, y, 0, y + 9, '#13226a', '#0d1850'));
      rect(46, y + 3, 18, 1, '#0a1440');
      rect(46, y + 5.5, 18, 1, '#0a1440');
    }
    rect(84, 22, 2, GY - 22, '#c99a1a');
  });
}
function wall5() {
  return getL('w5', 200, GY, () => {
    rect(0, 0, 200, GY, lgr(0, 0, 0, GY, '#20408f', '#1a3580'));
    rect(0, 0, 200, 14, '#132a6c');
    for (let x = 10; x < 200; x += 60) rr(x, 4, 40, 3.5, 1.5, '#eef4ff');
    rr(8, 30, 112, 110, 2, 'rgba(170,200,255,.16)', 'rgba(220,235,255,.5)', 1);
    rect(8, 70, 112, 8, 'rgba(230,240,255,.35)');
    rect(63, 30, 1.4, 110, 'rgba(220,235,255,.5)');
    rr(18, 92, 60, 6, 2, '#ccd4ee');
    rect(26, 98, 3, 16, '#8a96c0');
    rect(68, 98, 3, 16, '#8a96c0');
    for (let i = 0; i < 3; i++) {
      rr(20 + i * 20, 100, 9, 10, 2, '#2a3a80');
    }
    rr(70, 40, 44, 26, 1.5, '#f8faff', '#9aa6c8', 0.8);
    ctx.beginPath();
    ctx.moveTo(74, 62);
    ctx.lineTo(82, 54);
    ctx.lineTo(90, 57);
    ctx.lineTo(98, 47);
    ctx.lineTo(108, 50);
    ctx.strokeStyle = '#2f6bff';
    ctx.lineWidth = 1.3;
    ctx.stroke();
    rect(74, 59, 6, 4, '#ffd500');
    rect(84, 55, 6, 8, '#ffd500');
    rect(94, 51, 6, 12, '#ff4d5e');
    rr(136, 44, 52, 32, 2, '#0a1033');
    rr(138, 46, 48, 28, 1.5, lgr(0, 46, 0, 74, '#1d3fae', '#0f2470'));
    for (let i = 0; i < 4; i++) {
      const cx = 147 + (i % 2) * 24,
        cy = 53 + ((i / 2) | 0) * 13;
      rr(cx - 9, cy - 5, 22, 11, 1, '#0b1a58');
      ci(cx + 2, cy - 0.5, 2.6, ['#ffdcbc', '#c08a60', '#e9c39b', '#ffd0b0'][i]);
      el(cx + 2, cy + 4, 4, 2, ['#2f6bff', '#ffd500', '#20c2a0', '#ff4d5e'][i]);
    }
    rect(159, 76, 4, 10, '#0a1033');
    rect(150, 86, 22, 2, '#0a1033');
    rect(0, 140, 200, GY - 140, lgr(0, 140, 0, GY, '#1a3580', '#14296a'));
    rect(0, 140, 200, 1.6, '#ffd500');
  });
}
export const GTH = [
  (x, w) => {
    rect(x, GY, w, 6, lgr(0, GY, 0, GY + 6, '#d9dfef', '#9aa3c2'));
    rect(x, GY, w, 1.2, '#ffffff');
    rect(x, GY + 6, w, 2, '#5a6386');
    rect(x, GY + 8, w, 60, lgr(0, GY + 8, 0, H, '#2a3052', '#12152a'));
    for (let d = Math.ceil(x / 46) * 46; d < x + w - 18; d += 46) {
      rr(d, GY + 19, 18, 2.6, 1.3, 'rgba(240,240,255,.75)');
    }
    for (let d = Math.ceil(x / 20) * 20; d < x + w; d += 20)
      rect(d, GY + 1.2, 0.6, 4.8, 'rgba(90,100,140,.45)');
  },
  (x, w) => {
    rect(x, GY, w, 60, lgr(0, GY, 0, H, '#24397e', '#16255c'));
    rect(x, GY, w, 2.2, '#ffd500');
    rect(x, GY + 2.2, w, 1, 'rgba(0,0,0,.25)');
    for (let d = Math.ceil(x / 24) * 24; d < x + w; d += 24) rect(d, GY + 3, 0.7, 40, 'rgba(10,20,60,.5)');
    rect(x, GY + 18, w, 0.7, 'rgba(10,20,60,.5)');
    rect(x, GY + 3, w, 6, 'rgba(255,255,255,.04)');
  },
  (x, w) => {
    rect(x, GY, w, 60, lgr(0, GY, 0, H, '#7a1222', '#4a0814'));
    rect(x, GY, w, 2.5, lgr(0, GY, 0, GY + 2.5, '#ffe08a', '#c99a1a'));
    rect(x, GY + 5, w, 1, 'rgba(255,215,120,.6)');
    for (let d = Math.ceil(x / 18) * 18; d < x + w - 4; d += 18) {
      ctx.globalAlpha = 0.25;
      pth([d, GY + 12, d + 3, GY + 9, d + 6, GY + 12, d + 3, GY + 15], '#ffd76a');
      ctx.globalAlpha = 1;
    }
    rect(x, GY + 22, w, 1, 'rgba(255,215,120,.35)');
  },
  (x, w) => {
    rect(x, GY, w, 60, lgr(0, GY, 0, H, '#363d62', '#1c2140'));
    for (let d = Math.floor(x / 10) * 10; d < x + w; d += 10) {
      const a = Math.max(d, x),
        b = Math.min(d + 10, x + w);
      if (b > a) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(a, GY, b - a, 4);
        ctx.clip();
        pth([d, GY + 4, d + 5, GY, d + 10, GY, d + 5, GY + 4], '#ffd500');
        pth([d + 5, GY + 4, d + 10, GY, d + 15, GY, d + 10, GY + 4], '#14182e');
        ctx.restore();
      }
    }
    rect(x, GY + 4, w, 1.4, 'rgba(0,0,0,.4)');
    for (let d = Math.ceil(x / 30) * 30; d < x + w; d += 30) {
      rect(d, GY + 8, 0.8, 50, 'rgba(0,0,0,.25)');
    }
  },
  (x, w) => {
    rect(x, GY, w, 60, lgr(0, GY, 0, H, '#0e1c5c', '#060f38'));
    rect(x, GY, w, 1.4, '#66f0ff');
    glowLine(x, GY, w, '#66f0ff');
    for (let d = Math.ceil(x / 16) * 16; d < x + w; d += 16) {
      rect(d, GY + 1.4, 0.7, 58, 'rgba(102,240,255,.18)');
      for (let k = 0; k < 3; k++) ci(d + 5 + k * 3, GY + 8, 0.55, 'rgba(102,240,255,.25)');
    }
    rect(x, GY + 16, w, 0.7, 'rgba(102,240,255,.18)');
  },
  (x, w) => {
    rect(x, GY, w, 60, lgr(0, GY, 0, H, '#a87a4a', '#6a4a28'));
    rect(x, GY, w, 1.8, '#ffd500');
    for (let d = Math.ceil(x / 14) * 14; d < x + w; d += 14) rect(d, GY + 2, 0.6, 58, 'rgba(60,35,15,.35)');
    for (let r2 = 0; r2 < 4; r2++) {
      const yy = GY + 6 + r2 * 7;
      rect(x, yy, w, 0.6, 'rgba(60,35,15,.3)');
    }
    rect(x, GY + 1.8, w, 5, 'rgba(255,255,255,.08)');
  },
];
function glowLine(x, y, w, c) {
  ctx.globalCompositeOperation = 'lighter';
  rect(x, y - 1.5, w, 3, hexA(c, 0.25));
  ctx.globalCompositeOperation = 'source-over';
}
export function drawPlat(s, th) {
  const x = s.mv ? ix(s) : s.x,
    y = s.mv ? iy(s) : s.y,
    w = s.w,
    h = s.h;
  if (x > V.camX + W + 20 || x + w < V.camX - 20) return;
  if (s.k == 'g') {
    GTH[th](x - 0.3, w + 0.6);
    return;
  }
  switch (s.k) {
    case 'car': {
      const cb = lgr(0, y, 0, y + h, '#ffffff', '#e3e8f4', [1, '#b9c1d8']);
      shadow(x + w / 2, y + h, w * 0.55, 0.4);
      const wy = y + h - 5;
      ctx.beginPath();
      ctx.moveTo(x + 2, y + h - 3);
      ctx.lineTo(x + 1, y + 8);
      ctx.quadraticCurveTo(x + 2, y + 6, x + 8, y + 6);
      ctx.lineTo(x + 11, y + 1);
      ctx.quadraticCurveTo(x + 13, y - 0.5, x + 18, y - 0.5);
      ctx.lineTo(x + w - 16, y - 0.5);
      ctx.quadraticCurveTo(x + w - 12, y, x + w - 9, y + 6);
      ctx.lineTo(x + w - 3, y + 7);
      ctx.quadraticCurveTo(x + w, y + 8, x + w, y + 11);
      ctx.lineTo(x + w - 1, y + h - 3);
      ctx.closePath();
      fs(cb, OL, 0.9);
      ctx.beginPath();
      ctx.moveTo(x + 12, y + 6);
      ctx.lineTo(x + 14.5, y + 1.6);
      ctx.lineTo(x + w - 17, y + 1.6);
      ctx.lineTo(x + w - 12, y + 6);
      ctx.closePath();
      fs(lgr(0, y, 0, y + 6, '#8fb3ff', '#2a3f8f'), OL, 0.6);
      rect(x + w / 2 - 1, y + 1.6, 1.4, 4.4, OL);
      ctx.globalAlpha = 0.5;
      pth([x + 18, y + 1.8, x + 22, y + 1.8, x + 19, y + 5.8, x + 15, y + 5.8], '#fff');
      ctx.globalAlpha = 1;
      rect(x + 3, y + 9, w - 6, 1, 'rgba(255,255,255,.9)');
      rect(x + 3, y + 12, w - 6, 0.7, 'rgba(110,120,160,.5)');
      rect(x + w / 2 - 0.4, y + 7, 0.6, h - 10, 'rgba(110,120,160,.5)');
      rr(x + w - 4, y + 8, 3.2, 2.2, 1, '#fff6b0');
      glow(x + w - 1, y + 9, 8, '#fff3b0', 0.5);
      rr(x + 0.6, y + 8.5, 2.4, 2, 1, '#ff4d5e');
      glow(x + 1, y + 9.5, 5, '#ff4d5e', 0.5);
      for (const wx of [x + 9, x + w - 10]) {
        ci(wx, wy, 4.6, '#11131f', OL, 0.6);
        ci(wx, wy, 2.6, lgr(0, wy - 2.6, 0, wy + 2.6, '#d9dfef', '#7e88a8'));
        ci(wx, wy, 0.8, '#4a5274');
      }
      break;
    }
    case 'wall': {
      rr(x, y, w, h, 1.5, lgr(0, y, 0, y + h, '#f3f5fb', '#cdd3e4'), OL, 0.8);
      for (let yy = y + 8; yy < y + h; yy += 8) rect(x + 0.5, yy, w - 1, 0.7, 'rgba(140,150,180,.6)');
      rect(x, y, w, 2.5, '#ffffff');
      rr(x + w - 22, y + 12, 10, h - 12, 1, '#26305a');
      rect(x + w - 20, y + 14, 6, 8, 'rgba(150,190,255,.5)');
      rr(x + 8, y + 8, 18, 9, 1.5, '#ffd500', OL, 0.6);
      TX('BC', x + 17, y + 12.6, 6, '#1b3fa0');
      break;
    }
    case 'desk': {
      const pal =
        th == 2
          ? ['#a8682a', '#6e3d14', '#4a2a0e']
          : th == 5
            ? ['#f4f6fb', '#c4cbe0', '#8e98b8']
            : ['#ffd84a', '#2c55c9', '#1b3a99'];
      shadow(x + w / 2, y + h, w * 0.55, 0.3);
      rect(x + 3, y + 4, 3, h - 4, pal[2]);
      rect(x + w - 6, y + 4, 3, h - 4, pal[2]);
      rr(x + 8, y + 4, w * 0.42, h - 6, 1, lgr(0, y, 0, y + h, pal[1], pal[2]), OL, 0.6);
      for (let i = 0; i < 2; i++) rr(x + w * 0.42 - 2, y + 7 + i * 6, 5, 1.4, 0.7, '#ffd500');
      rr(
        x - 2,
        y - 0.5,
        w + 4,
        4.5,
        1.5,
        lgr(0, y, 0, y + 4, th == 2 ? '#c98a46' : th == 5 ? '#ffffff' : '#fff07a', pal[0]),
        OL,
        0.7,
      );
      rect(x, y + 0.3, w, 1, 'rgba(255,255,255,.6)');
      break;
    }
    case 'cab': {
      const pal =
        th == 2
          ? ['#7a4a22', '#5a3216', '#e0b030']
          : th == 4
            ? ['#24346e', '#18245a', '#66f0ff']
            : ['#4a5ea8', '#33468a', '#ffd500'];
      shadow(x + w / 2, y + h, w * 0.6, 0.3);
      rr(x, y, w, h, 1.5, lgr(x, 0, x + w, 0, pal[0], pal[1]), OL, 0.8);
      rect(x + 1, y + 1, w - 2, 1.2, 'rgba(255,255,255,.3)');
      for (let yy = y + 3; yy < y + h - 4; yy += 11.5) {
        rr(
          x + 2.5,
          yy,
          w - 5,
          9.5,
          1,
          lgr(0, yy, 0, yy + 9.5, 'rgba(255,255,255,.1)', 'rgba(0,0,0,.15)'),
          'rgba(0,0,0,.35)',
          0.5,
        );
        rr(x + w / 2 - 4, yy + 3.5, 8, 2, 1, pal[2]);
        rr(x + w / 2 - 6, yy + 1.5, 12, 1.2, 0.5, 'rgba(255,255,255,.6)');
      }
      break;
    }
    case 'rack': {
      shadow(x + w / 2, y + h, w * 0.6, 0.35);
      rr(x, y, w, h, 1.5, lgr(x, 0, x + w, 0, '#141f5c', '#0b1442'), OL, 0.8);
      rect(x + 2, y + 2, w - 4, h - 4, '#060c30');
      for (let yy = y + 4; yy < y + h - 4; yy += 7) {
        rr(x + 3, yy, w - 6, 5.5, 0.8, lgr(0, yy, 0, yy + 5.5, '#1a2c80', '#101c58'));
        const k = ((yy * 7 + x) | 0) % 5;
        for (let i = 0; i < 3; i++) {
          const on = Math.sin(V.TT * (0.08 + i * 0.03) + yy + i * 2 + x) > -0.2;
          const c = ['#3cff7a', '#66f0ff', '#ffd500'][(i + k) % 3];
          ci(x + 6 + i * 3, yy + 2.7, 0.75, on ? c : '#14204a');
          if (on) glow(x + 6 + i * 3, yy + 2.7, 3, c, 0.5);
        }
        rect(x + 15, yy + 2, w - 19, 0.6, '#0a1440');
        rect(x + 15, yy + 3.6, w - 19, 0.6, '#0a1440');
      }
      break;
    }
    case 'ac': {
      shadow(x + w / 2, y + h, w * 0.6, 0.35);
      rr(x, y, w, h, 2, lgr(0, y, 0, y + h, '#8f9bc6', '#5a6694'), OL, 0.8);
      rect(x + 2, y + 1.5, w - 4, 1.2, 'rgba(255,255,255,.4)');
      for (let xx = x + 4; xx < x + w - 3; xx += 3) rect(xx, y + 5, 1, h - 9, 'rgba(20,30,70,.45)');
      const fr = Math.min(w, h) * 0.32,
        fx = x + w / 2,
        fy = y + h / 2;
      ci(fx, fy, fr + 1.2, '#39406a', OL, 0.6);
      ctx.save();
      ctx.translate(fx, fy);
      ctx.rotate(V.TT * 0.3);
      for (let i = 0; i < 4; i++) {
        ctx.rotate(P2 / 4);
        el(fr * 0.45, 0, fr * 0.5, fr * 0.2, '#c9d1ea');
      }
      ctx.restore();
      ci(fx, fy, 1.2, '#ffd500');
      break;
    }
    case 'pens': {
      rect(x + 4, y + 6, 1.8, GY - y - 6, lgr(x, 0, x + 2, 0, '#c9d1ea', '#6e78a0'));
      rect(x + w - 6, y + 6, 1.8, GY - y - 6, lgr(x, 0, x + 2, 0, '#c9d1ea', '#6e78a0'));
      rr(x + w / 2 - 10, y + 10, 20, 13, 1.5, '#ffd500', OL, 0.6);
      rr(x + w / 2 - 8.5, y + 11.5, 17, 6, 1, '#1b3fa0');
      TX('BUS', x + w / 2, y + 14.7, 4.6, '#ffd500');
      rr(x - 1, y - 1, w + 2, 5.5, 2, lgr(0, y, 0, y + 5, '#3a6bff', '#1b3fa0'), OL, 0.7);
      rect(x, y + 3.6, w, 1.6, '#ffd500');
      rect(x + 1, y - 0.2, w - 2, 1, 'rgba(255,255,255,.5)');
      break;
    }
    case 'shelf': {
      if (th == 4) {
        rr(x, y, w, 4, 1, '#4a5a8c', OL, 0.6);
        for (let xx = x + 2; xx < x + w - 1; xx += 3) rect(xx, y + 0.8, 1, 2.4, '#24305a');
        rect(x + 3, y + 4, 1.5, 5, '#2a3660');
        rect(x + w - 4.5, y + 4, 1.5, 5, '#2a3660');
        break;
      }
      const bk = ['#2f6bff', '#ffd500', '#ff4d5e', '#20c2a0', '#f4f7ff', '#8fa8ff'];
      const r = seedR((x | 0) + 3);
      let bx = x + 4;
      while (bx < x + w - 8) {
        const bw = 2.2 + r() * 2,
          bh = 6 + r() * 4;
        rr(bx, y - bh, bw, bh, 0.5, bk[(r() * 6) | 0], OL, 0.4);
        bx += bw + 0.4;
        if (r() < 0.12) bx += 4;
      }
      if (w > 50) {
        el(x + w - 6, y - 4, 4, 4, '#2e9e55', OL, 0.4);
        rr(x + w - 9, y - 3, 6, 3, 0.8, '#c9d1ea', OL, 0.4);
      }
      rr(
        x,
        y,
        w,
        3.6,
        1,
        lgr(0, y, 0, y + 3.6, th == 2 ? '#e0b030' : '#ffe06a', th == 2 ? '#9c7414' : '#c79a00'),
        OL,
        0.6,
      );
      pth([x + 3, y + 3.6, x + 6, y + 3.6, x + 3, y + 8], '#5a6390');
      pth([x + w - 3, y + 3.6, x + w - 6, y + 3.6, x + w - 3, y + 8], '#5a6390');
      break;
    }
    case 'chand': {
      const cx = x + w / 2;
      ln(cx, 0, cx, y - 6, '#c99a1a', 1);
      ln(cx, y - 6, x + 4, y, '#c99a1a', 0.7);
      ln(cx, y - 6, x + w - 4, y, '#c99a1a', 0.7);
      ci(cx, y - 6, 2, '#ffd76a', OL, 0.5);
      rr(x, y, w, 3.6, 1.8, lgr(0, y, 0, y + 3.6, '#ffe9a0', '#c99a1a', [1, '#8c6a0a']), OL, 0.6);
      for (let xx = x + 5; xx < x + w - 3; xx += 9) {
        rr(xx - 1, y - 5, 2, 5, 0.5, '#fff8e8', OL, 0.3);
        const fl = 1 + Math.sin(V.TT * 0.4 + xx) * 0.25;
        el(xx, y - 7, 1.1, 2.2 * fl, '#ffd25a');
        el(xx, y - 6.6, 0.5, 1.2 * fl, '#fff');
        glow(xx, y - 7, 9, '#ffc560', 0.45);
        el(xx, y + 6, 1, 2.2, 'rgba(200,230,255,.8)');
        if (Math.sin(V.TT * 0.05 + xx * 3) > 0.92) glow(xx, y + 6, 4, '#ffffff', 0.8);
      }
      break;
    }
    case 'lift': {
      const cx = x + w / 2;
      ln(x + 6, 0, x + 6, y, '#6a7090', 0.7);
      ln(x + w - 6, 0, x + w - 6, y, '#6a7090', 0.7);
      rr(x, y, w, 6, 1.4, lgr(0, y, 0, y + 6, '#ffe14a', '#d7a800'), OL, 0.7);
      ctx.save();
      ctx.beginPath();
      ctx.rect(x + 1, y + 1.6, w - 2, 2.6);
      ctx.clip();
      for (let k = -1; k < w / 5 + 1; k++)
        pth(
          [x + k * 5, y + 4.2, x + k * 5 + 2.5, y + 1.6, x + k * 5 + 5, y + 1.6, x + k * 5 + 2.5, y + 4.2],
          '#14182e',
        );
      ctx.restore();
      for (const gx2 of [x + 3.4, x + w - 3.4]) {
        ctx.save();
        ctx.translate(gx2, y + 3);
        ctx.rotate(V.TT * 0.08);
        for (let k = 0; k < 4; k++) {
          ctx.rotate(P2 / 4);
          rect(-0.4, -2.4, 0.8, 1.2, '#5a6390');
        }
        ctx.restore();
        ci(gx2, y + 3, 1.4, '#8a96c0', OL, 0.4);
      }
      glow(cx, y + 3, 10, '#ffd84a', 0.15);
      break;
    }
    case 'spring': {
      const k = s.boing ? clamp((G.frame - s.boing) / 14, 0, 1) : 1,
        ex = Math.sin(k * Math.PI) * (1 - k) * 6;
      shadow(x + w / 2, y + h, w * 0.6, 0.3);
      rr(x, y + h - 3, w, 3, 1, '#2a3052', OL, 0.6);
      ctx.beginPath();
      const top = y - ex;
      for (let k2 = 0; k2 <= 6; k2++) {
        const yy = y + h - 3 - (h - 3 + ex) * (k2 / 6);
        ctx.lineTo(x + 3 + (k2 % 2) * (w - 6), yy);
      }
      ctx.strokeStyle = '#cfd6ea';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      rr(x - 1, top - 2, w + 2, 3.4, 1.6, lgr(0, top - 2, 0, top + 1.4, '#ff6a7a', '#d0102a'), OL, 0.7);
      if (k < 1) glow(x + w / 2, top, 14, '#ffe95c', 0.5 * (1 - k));
      if (((V.TT / 30) | 0) % 2) TX('▲', x + w / 2, top - 7, 5, '#ffe95c', { sk: OL, sw: 1 });
      break;
    }
    case 'belt': {
      rr(x, y, w, h, 3, '#1c2038', OL, 0.8);
      ctx.save();
      ctx.beginPath();
      rrPath(x + 2, y + 1, w - 4, h - 2, 2);
      ctx.clip();
      rect(x, y, w, h, '#2c3254');
      const o = (((V.TT * 1.1 * s.dir) % 10) + 10) % 10;
      for (let xx = x - 10 + o; xx < x + w + 10; xx += 10)
        pth(
          s.dir < 0
            ? [xx + 5, y + 1.4, xx + 2, y + 3, xx + 5, y + 4.6]
            : [xx + 2, y + 1.4, xx + 5, y + 3, xx + 2, y + 4.6],
          null,
          '#ffd500',
          0.7,
          true,
        );
      ctx.restore();
      for (const rx of [x + 3, x + w - 3]) ci(rx, y + 3, 2.6, '#8a96c0', OL, 0.5);
      const ro = V.TT * 1.1 * s.dir;
      for (let k = 0; k < 3; k++) {
        const px = x + (((((k * w) / 3 + ro) % w) + w) % w);
        rr(px - 3, y - 2.6, 6, 2.6, 0.4, '#ffffff', OL, 0.4);
      }
      break;
    }
    case 'beam': {
      rect(x + 3, y + 6, 2.4, GY - y - 6, lgr(x, 0, x + 2.4, 0, '#7f88b6', '#3a4170'));
      rect(x + w - 5.4, y + 6, 2.4, GY - y - 6, lgr(x, 0, x + 2.4, 0, '#7f88b6', '#3a4170'));
      rr(x, y, w, 6, 1, lgr(0, y, 0, y + 6, '#ffe14a', '#d7a800'), OL, 0.7);
      rect(x, y + 2.2, w, 1.6, 'rgba(120,80,0,.4)');
      for (let xx = x + 4; xx < x + w - 2; xx += 7) {
        ci(xx, y + 1.2, 0.6, '#8c6a0a');
        ci(xx, y + 4.8, 0.6, '#8c6a0a');
      }
      rect(x + 1, y + 0.4, w - 2, 0.8, 'rgba(255,255,255,.6)');
      break;
    }
  }
}
export function drawSigns(th) {
  if (G.LV.sg)
    for (const g2 of G.LV.sg) {
      if (g2.x < V.camX - 80 || g2.x > V.camX + W + 80) continue;
      const w = tw(g2.t, 4.6, { b: 1, w: 800 }) + 10,
        bx = g2.x - w / 2,
        by = GY - 46;
      rect(g2.x - 0.8, by + 9, 1.6, GY - by - 9, '#5a6390');
      rr(bx, by, w, 10, 2, ['#1b3fa0', '#ffd500', '#7a1222', '#ffd500', '#0e1c5c', '#ffffff'][th], OL, 0.7);
      rect(bx + 1, by + 1, w - 2, 1, 'rgba(255,255,255,.3)');
      TX(g2.t, g2.x, by + 5.3, 4.6, ['#ffffff', '#0f1a48', '#ffe08a', '#0f1a48', '#9ff6ff', '#0f1a48'][th], {
        b: 1,
        w: 800,
      });
    }
  if (G.LV.cp)
    for (const c of G.LV.cp) {
      if (c.x < V.camX - 60 || c.x > V.camX + W + 60) continue;
      const x = c.x,
        y = GY;
      shadow(x, y, 10, 0.35);
      rr(x - 9, y - 34, 18, 34, 2.4, lgr(x - 9, 0, x + 9, 0, '#d62b37', '#a0101e'), OL, 0.9);
      rr(x - 6.6, y - 31, 13.2, 12, 1.5, '#0b1033');
      TX(c.used ? '✓' : '☕', x, y - 25, 7, c.used ? '#3cff7a' : '#ffe95c');
      glow(x, y - 25, 14, c.used ? '#3cff7a' : '#ffe95c', 0.3 + 0.1 * Math.sin(V.TT * 0.1));
      rr(x - 4, y - 15, 8, 7, 1, '#1a1f38');
      if (c.used) {
        for (let i = 0; i < 2; i++) {
          const k = (V.TT * 0.015 + i * 0.5) % 1;
          ci(x - 1 + i * 2, y - 15 - k * 10, 1 + k * 1.6, 'rgba(255,255,255,' + 0.5 * (1 - k) + ')');
        }
      }
      TX('CAFFÈ', x, y - 37.5, 4.2, '#ffffff', { b: 1, w: 900, sk: OL, sw: 1.2 });
    }
}
export function drawPits(th) {
  const pl = G.LV.gp || (G.LV.gp = G.LV.plats.filter(q => q.k == 'g').sort((u, v) => u.x - v.x));
  for (let i = 1; i < pl.length; i++) {
    const a = pl[i - 1],
      b = pl[i];
    if (b.x > a.x + a.w + 1) {
      const gx = a.x + a.w,
        gw = b.x - gx;
      if (gx > V.camX + W || gx + gw < V.camX) continue;
      rect(gx, GY, gw, H - GY, lgr(0, GY, 0, H, '#02040f', '#000'));
      rect(gx - 1, GY, 1.5, H - GY, 'rgba(0,0,0,.6)');
      rect(gx + gw - 0.5, GY, 1.5, H - GY, 'rgba(0,0,0,.6)');
      for (const ex of [gx - 6, gx + gw]) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(ex, GY - 1, 6, 4);
        ctx.clip();
        for (let k = -2; k < 4; k++)
          pth(
            [ex + k * 3, GY + 3, ex + k * 3 + 1.5, GY - 1, ex + k * 3 + 3, GY - 1, ex + k * 3 + 1.5, GY + 3],
            k % 2 ? '#14182e' : '#ffd500',
          );
        ctx.restore();
      }
    }
  }
}
export function drawDecor(th) {
  for (const x of G.LV.dec) {
    if (x < V.camX - 60 || x > V.camX + W + 60) continue;
    if (th == 0) lamp(x);
    else if (th == 1 || th == 5) {
      const sw = Math.sin(V.TT * 0.03 + x) * 0.06;
      rr(x - 6, GY - 12, 12, 12, 2, lgr(0, GY - 12, 0, GY, '#f4f6fb', '#b9c1d8'), OL, 0.6);
      ctx.save();
      ctx.translate(x, GY - 12);
      ctx.rotate(sw);
      for (let i = 0; i < 7; i++) {
        const a = -Math.PI / 2 + (i - 3) * 0.35;
        ctx.save();
        ctx.rotate(a + Math.PI / 2);
        el(0, -10, 2.6, 10, i % 2 ? '#2e9e55' : '#3cc46a', OL, 0.4);
        ctx.restore();
      }
      ctx.restore();
    } else if (th == 2) {
      rect(x - 1, GY - 44, 2, 44, lgr(x - 1, 0, x + 1, 0, '#ffe08a', '#9c7414'));
      rr(x - 7, GY - 3, 14, 3, 1, '#c99a1a', OL, 0.5);
      for (const dx of [-6, 0, 6]) {
        rr(x + dx - 1, GY - 52, 2, 7, 0.5, '#fff8e8', OL, 0.3);
        const fl = 1 + Math.sin(V.TT * 0.4 + dx + x) * 0.25;
        el(x + dx, GY - 54, 1.2, 2.4 * fl, '#ffd25a');
        glow(x + dx, GY - 54, 10, '#ffc560', 0.5);
      }
      ln(x - 6, GY - 45, x + 6, GY - 45, '#c99a1a', 1.2);
    } else if (th == 4) {
      rr(x - 7, GY - 26, 14, 26, 1.5, lgr(x - 7, 0, x + 7, 0, '#1b2a72', '#0d1850'), OL, 0.6);
      rect(x - 5, GY - 23, 10, 8, '#050a26');
      TX((G.frame >> 5) % 2 ? '98%' : '99%', x, GY - 19, 4, '#3cff7a');
      for (let i = 0; i < 3; i++) {
        const on = Math.sin(V.TT * 0.1 + i * 2 + x) > 0;
        ci(x - 3 + i * 3, GY - 10, 0.8, on ? '#3cff7a' : '#14204a');
        if (on) glow(x - 3 + i * 3, GY - 10, 3, '#3cff7a', 0.6);
      }
    } else {
      rect(x - 1, GY - 30, 2, 30, '#2a3052');
      rr(x - 8, GY - 4, 16, 4, 1.5, '#39406a', OL, 0.5);
      rr(x - 5, GY - 38, 10, 9, 1.5, '#565e8c', OL, 0.5);
      const bl = (G.frame >> 5) % 2;
      ci(x, GY - 41, 1.4, bl ? '#ff4d5e' : '#5a1822');
      if (bl) glow(x, GY - 41, 9, '#ff4d5e', 0.7);
    }
  }
}
export function drawBG(th) {
  if (th == 0) {
    bl(sky0(), 0, 0);
    const cs = cloudSpr();
    for (let i = 0; i < 5; i++) {
      const x = ((((i * 137 - V.camX * 0.03 - V.TT * 0.05) % (W + 120)) + W + 120) % (W + 120)) - 90;
      bl(cs, x, 14 + ((i * 17) % 60));
    }
    tile(city0a(), 0.04, 0);
    tile(city0b(), 0.1, 6);
    const hx = G.LV ? (G.LV.len - W - V.camX) * 0.16 : 0;
    bl(hqLayer(), hx, 0);
    flags(hx);
    glow(hx + 267, 67, 40, '#ffd84a', 0.35 + 0.05 * Math.sin(V.TT * 0.05));
    if (G.LV) {
      const r = seedR(9);
      for (let i = 0; i < 14; i++) {
        const wx = hx + 120 + r() * 290,
          wy = 70 + r() * 140;
        if (Math.sin(V.TT * 0.02 + i * 5) > 0.6) rect(wx, wy, 5, 4, 'rgba(255,220,150,.8)');
      }
    }
  } else if (th == 1) {
    tile(wall1(), 0.5, 0);
    for (let i = 0; i < 4; i++) {
      const x = ((((i * 170 + 24 - V.camX * 0.5) % 680) + 680) % 680) - 100;
      glow(x + 30, 6, 30, '#cfe0ff', 0.25);
    }
  } else if (th == 2) {
    tile(wall2(), 0.5, 0);
  } else if (th == 3) {
    bl(sky3(), 0, 0);
    const r = seedR(8);
    for (let i = 0; i < 25; i++) {
      const sx = r() * W,
        sy = r() * 150,
        tw2 = Math.sin(V.TT * 0.06 + i * 7);
      if (tw2 > 0.4) glow(sx, sy, 2.5 + tw2 * 2, '#dfe7ff', 0.6);
    }
    const cs = cloudSpr();
    for (let i = 0; i < 3; i++) {
      const x = ((((i * 190 - V.camX * 0.05 - V.TT * 0.03) % (W + 120)) + W + 120) % (W + 120)) - 90;
      ctx.globalAlpha = 0.6;
      bl(cs, x, 30 + i * 25);
      ctx.globalAlpha = 1;
    }
    tile(city3(), 0.1, 40);
    const sg = signBig(),
      p = 620,
      o = (((V.camX * 0.4) % p) + p) % p;
    for (let sx = -o + 120; sx < W + 240; sx += p) {
      bl(sg, sx - 10, 62);
      glow(sx + 105, 110, 110, '#ffd84a', 0.22);
      for (let i = 0; i < 26; i++) {
        const t = i / 26,
          bx = sx + t * 214 - 2,
          on = (i + (G.frame >> 3)) % 4 == 0;
        ci(bx, 62 + 34 - 6, 1.1, on ? '#fff6c0' : '#806a20');
        if (on) glow(bx, 90, 5, '#ffe9a0', 0.8);
      }
    }
    tile(
      getL('ant', 230, GY, () => {
        for (const [x, h] of [
          [40, 70],
          [150, 92],
        ]) {
          rect(x, GY - h, 2, h, '#0a0f24');
          rect(x - 7, GY - h + 12, 16, 1.6, '#0a0f24');
          rect(x - 4, GY - h + 24, 10, 1.6, '#0a0f24');
        }
      }),
      0.6,
      0,
    );
    const ao = (((V.camX * 0.6) % 230) + 230) % 230;
    for (let x = -ao; x < W + 230; x += 230) {
      for (const [dx, h] of [
        [40, 70],
        [150, 92],
      ]) {
        const on = (G.frame + dx) % 70 < 35;
        ci(x + dx + 1, GY - h - 1, 1.4, on ? '#ff4d5e' : '#4a1018');
        if (on) glow(x + dx + 1, GY - h - 1, 10, '#ff4d5e', 0.8);
      }
    }
  } else if (th == 4) {
    tile(wall4(), 0.5, 0);
    const o = (((V.camX * 0.5) % 96) + 96) % 96;
    for (let x = -o; x < W + 96; x += 96) {
      for (let y = 48; y < GY - 12; y += 12) {
        for (let i = 0; i < 3; i++) {
          const s = Math.sin(V.TT * (0.05 + i * 0.02) + y * 0.7 + x * 0.13 + i * 3);
          if (s > 0.3) {
            const c = ['#3cff7a', '#66f0ff', '#ffd500'][i];
            ci(x + 24 + i * 4, y + 4.5, 0.8, c);
            glow(x + 24 + i * 4, y + 4.5, 3.5, c, 0.5);
          }
        }
      }
    }
    ctx.globalAlpha = 0.12 + 0.04 * Math.sin(V.TT * 0.02);
    rect(0, 0, W, H, lgr(0, 0, 0, H, 'rgba(102,240,255,.0)', 'rgba(102,240,255,.25)'));
    ctx.globalAlpha = 1;
  } else {
    tile(wall5(), 0.5, 0);
  }
}
export function drawFG(th) {
  const par = 1.25,
    col = ['#060a1e', '#0a1640', '#2a0a14', '#04060f', '#030820', '#0a1640'][th];
  const o = (((V.camX * par) % 300) + 300) % 300;
  for (let x = -o; x < W + 300; x += 300) {
    ctx.globalAlpha = 0.9;
    if (th == 0) {
      for (let i = 0; i < 5; i++) el(x + 40 + i * 14, H + 4, 16, 10 - (i % 2) * 3, col);
    } else if (th == 1 || th == 5) {
      el(x + 60, H + 6, 26, 18, col);
      for (let i = 0; i < 5; i++) {
        ctx.save();
        ctx.translate(x + 60, H - 6);
        ctx.rotate(-1 + i * 0.5);
        el(0, -14, 4, 14, col);
        ctx.restore();
      }
    } else if (th == 2) {
      rect(x + 200, GY + 10, 16, 60, col);
      rr(x + 194, GY + 8, 28, 6, 2, col);
    } else if (th == 3) {
      rect(x + 80, GY + 12, 2, 60, col);
      rect(x + 60, GY + 20, 44, 2, col);
      rect(x + 60, GY + 32, 44, 2, col);
    } else {
      rr(x + 100, GY + 14, 60, 80, 3, col);
      for (let i = 0; i < 4; i++) {
        ci(x + 110 + i * 12, GY + 22, 1, (G.frame + i * 9) % 40 < 20 ? '#3cff7a' : '#0a3a1a');
      }
    }
    ctx.globalAlpha = 1;
  }
}
