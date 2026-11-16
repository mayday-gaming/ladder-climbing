/** @file Non-playable characters (HR officer, Asdrubale). */
import { PAL_AS, PAL_HR } from '../../data/palettes.js';
import { ci, crv, ctx, el, fs, glow, lgr, ln, pth, rect, rr } from '../../engine/canvas.js';
import { OL, P2 } from '../../engine/config.js';
import { G } from '../../game/state.js';
import { bubble } from './allies.js';
import { blinkOn, eye, headBase, human, noseP } from './rig.js';
import { V } from '../interp.js';

export function drawHR(x, y, sc, face, talk) {
  human(x, y, {
    face,
    sc,
    pal: PAL_HR,
    run: 0,
    torso: (a, b) => {
      pth([-2.4, a - 1.4, 0, a + 2.6, 0, a - 1.4], '#ffffff', OL, 0.5);
      pth([2.4, a - 1.4, 0, a + 2.6, 0, a - 1.4], '#f4f7ff', OL, 0.5);
      for (let i = 0; i < 5; i++)
        ci(-2.4 + i * 1.2, a - 0.6 + Math.abs(i - 2) * 0.5, 0.45, '#ffffff', OL, 0.2);
      rect(-5, b - 1.4, 10, 1.4, '#14141a');
      ci(2.6, a + 3.4, 0.9, '#ffd500', OL, 0.3);
    },
    hand: (hx, hy) => {
      rr(hx - 1, hy - 4, 6, 8, 0.6, '#c9a06a', OL, 0.5);
      rr(hx - 0.4, hy - 3.2, 4.8, 6.4, 0.3, '#ffffff');
      rr(hx + 0.8, hy - 4.6, 2.4, 1.4, 0.4, '#8a96c0', OL, 0.3);
      for (let i = 0; i < 4; i++) rect(hx, hy - 2 + i * 1.4, 4, 0.4, '#aab2c8');
      ln(hx + 0.4, hy + 2.8, hx + 3.4, hy - 1.6, '#3cc46a', 0.5);
    },
    head: (hx, hy) => {
      ci(hx - 3.4, hy - 6.8, 4, lgr(0, hy - 11, 0, hy - 3, '#ffe08a', '#e0a838'), OL, 0.7);
      ln(hx - 5.6, hy - 8, hx - 1.6, hy - 9.6, 'rgba(255,255,255,.4)', 0.6);
      headBase(hx, hy, PAL_HR.skin);
      crv(
        [
          hx - 5.2,
          hy + 1,
          hx - 5.6,
          hy - 3.6,
          hx - 2.6,
          hy - 6.6,
          hx + 2.4,
          hy - 6.8,
          hx + 5.8,
          hy - 4.4,
          hx + 3.2,
          hy - 3.8,
          hx + 0.6,
          hy - 4.4,
          hx - 2.6,
          hy - 2.6,
          hx - 3.6,
          hy + 1.4,
        ],
        lgr(0, hy - 7, 0, hy, '#ffe08a', '#e0a838'),
        OL,
        0.7,
      );
      ci(hx - 4.6, hy + 2.6, 0.8, '#ffd500', OL, 0.3);
      const bl = blinkOn(9);
      eye(hx + 1.4, hy - 0.4, 0.72, bl);
      eye(hx + 4.8, hy - 0.4, 0.62, bl);
      for (const [ex, w2] of [
        [1.4, 2.2],
        [4.8, 1.6],
      ]) {
        ctx.beginPath();
        ctx.moveTo(hx + ex - w2, hy - 0.2);
        ctx.quadraticCurveTo(hx + ex, hy + 2, hx + ex + w2, hy - 0.2);
        ctx.lineTo(hx + ex + w2 + 0.8, hy - 2.2);
        ctx.quadraticCurveTo(hx + ex, hy - 1.6, hx + ex - w2, hy - 1.6);
        ctx.closePath();
        fs('rgba(255,220,240,.25)', '#9c1046', 0.75);
      }
      ctx.beginPath();
      ctx.moveTo(hx - 0.8, hy - 0.2);
      ctx.quadraticCurveTo(hx - 2.6, hy + 5, hx - 1.2, hy + 7);
      ctx.strokeStyle = '#ffd500';
      ctx.lineWidth = 0.35;
      ctx.stroke();
      noseP(hx, hy, PAL_HR.skin);
      if (talk && (G.frame >> 3) % 2) {
        el(hx + 3.4, hy + 3.6, 1.4, 1, '#9c1046', OL, 0.45);
      } else {
        ctx.beginPath();
        ctx.moveTo(hx + 1.6, hy + 3);
        ctx.quadraticCurveTo(hx + 3.4, hy + 5.2, hx + 5.4, hy + 3);
        ctx.closePath();
        fs('#ffffff', '#c2185b', 0.7);
      }
    },
  });
}
export function drawAsd(a) {
  const x = a.x,
    y = a.y,
    st = a.st,
    ang = st == 'carica',
    cry = st == 'piange';
  human(x, y, {
    face: a.face,
    sc: 1.18,
    bulk: 1.3,
    pal: PAL_AS,
    run: ang && a.vx ? 1 : st == 'lamenta' ? 0.4 : 0,
    ph: V.TT * (ang ? 0.32 : 0.12),
    torso: (a2, b) => {
      pth([-2.2, a2 - 1.4, 0, a2 + 3, 0, a2 - 1.4], '#f4f7ff', OL, 0.5);
      pth([2.2, a2 - 1.4, 0, a2 + 3, 0, a2 - 1.4], '#e6ebf6', OL, 0.5);
      pth([0, a2 + 0.6, 1.4, a2 + 1, 2.6, a2 + 5.6, 1.4, a2 + 6.4], '#2a3a7a', OL, 0.4);
      for (let i = 0; i < 3; i++) ci(-2.4, a2 + 2.4 + i * 2.2, 0.45, '#c9a06a', OL, 0.2);
      el(0, b - 2.6, 5.6, 2, 'rgba(0,0,0,.12)');
      rect(-5.4, b - 1.2, 10.8, 1.2, '#3a2a20');
    },
    hand: (hx, hy) => {
      if (cry) {
        rr(hx - 1, hy - 1.6, 4.6, 3, 0.8, '#ffffff', OL, 0.4);
      }
    },
    head: (hx, hy) => {
      headBase(hx, hy, PAL_AS.skin, 5.4, 5.8);
      if (ang) {
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(hx, hy, 5.4, 5.8, 0, 0, P2);
        ctx.clip();
        rect(hx - 6, hy - 6, 12, 12, 'rgba(226,38,24,.45)');
        ctx.restore();
      }
      for (const [cx, cy, r2] of [
        [-5.2, -1.6, 1.9],
        [-4.4, -3.8, 1.6],
        [-5.4, 0.8, 1.5],
        [-2.6, -5.4, 1.2],
      ])
        ci(hx + cx, hy + cy, r2, '#eef1f8', OL, 0.45);
      ln(hx - 1.4, hy - 5, hx + 2.8, hy - 5.4, 'rgba(255,255,255,.55)', 0.8);
      ln(hx + 0.8, hy - 2.6, hx + 3.4, hy - 2.8, 'rgba(120,70,40,.35)', 0.4);
      ln(hx + 1, hy - 1.8, hx + 3, hy - 1.9, 'rgba(120,70,40,.3)', 0.35);
      if (cry) {
        ctx.beginPath();
        ctx.arc(hx + 1.4, hy - 0.6, 0.9, Math.PI * 0.1, Math.PI * 0.9);
        ctx.arc(hx + 4.8, hy - 0.6, 0.8, Math.PI * 0.1, Math.PI * 0.9);
        ctx.strokeStyle = OL;
        ctx.lineWidth = 0.6;
        ctx.stroke();
        for (const ex of [1.4, 4.8]) {
          const q = (V.TT * 0.06 + ex) % 1;
          ln(hx + ex, hy + 0.2, hx + ex + 0.3, hy + 0.2 + q * 6, '#9fd8ff', 0.8);
          ci(hx + ex + 0.3, hy + 0.6 + q * 6, 0.55, '#bfe6ff');
        }
      } else {
        const bl = blinkOn(11);
        eye(hx + 1.4, hy - 0.6, 0.7, bl);
        eye(hx + 4.8, hy - 0.6, 0.6, bl);
      }
      const by = ang ? -1.2 : cry ? 0.4 : 0;
      crv(
        [hx - 0.4, hy - 2.6 + by, hx + 1.4, hy - 4 + by * 0.6, hx + 3, hy - 3 + (ang ? 0.8 : 0)],
        null,
        '#f4f7ff',
        1.3,
      );
      crv(
        [hx + 3.8, hy - 3 + (ang ? 0.8 : 0), hx + 5, hy - 4 + by * 0.6, hx + 6.4, hy - 2.6 + by],
        null,
        '#f4f7ff',
        1.3,
      );
      noseP(hx, hy + 0.3, PAL_AS.skin, 3.6);
      rr(hx + 0.2, hy - 1.2, 2.4, 1.5, 0.5, 'rgba(220,240,255,.25)', '#6a5a3a', 0.45);
      rr(hx + 3.6, hy - 1.2, 2.2, 1.5, 0.5, 'rgba(220,240,255,.25)', '#6a5a3a', 0.45);
      if (ang) {
        rr(hx + 1.8, hy + 3.6, 3.6, 1.6, 0.4, '#ffffff', OL, 0.45);
        ln(hx + 3.6, hy + 3.6, hx + 3.6, hy + 5.2, OL, 0.3);
      } else if (cry) {
        ctx.beginPath();
        ctx.moveTo(hx + 2, hy + 4.6);
        for (let i = 1; i <= 5; i++) ctx.lineTo(hx + 2 + i * 0.6, hy + 4.6 + (i % 2 ? -0.4 : 0.4));
        ctx.strokeStyle = OL;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      } else {
        const o2 = (G.frame >> 3) % 2;
        el(hx + 3.4, hy + 4, 1.3, o2 ? 1 : 0.5, '#6a2a22', OL, 0.4);
      }
      crv(
        [
          hx + 0.8,
          hy + 2.6,
          hx + 2.4,
          hy + 1.6,
          hx + 3.6,
          hy + 2.4,
          hx + 4.8,
          hy + 1.6,
          hx + 6.4,
          hy + 2.6,
          hx + 5.4,
          hy + 3.6,
          hx + 3.6,
          hy + 3,
          hx + 1.8,
          hy + 3.6,
        ],
        '#f4f7ff',
        OL,
        0.5,
      );
    },
  });
  if (a.flash > 0) glow(x, y - 18, 22, '#ffffff', 0.35);
  if (ang) {
    for (let i = 0; i < 2; i++) {
      const f = (V.TT * 0.05 + i * 0.5) % 1;
      ctx.globalAlpha = (1 - f) * 0.8;
      ci(x - 3 + i * 6, y - 44 - f * 8, 1.2 + f * 2, '#ffffff');
    }
    ctx.globalAlpha = 1;
  }
  if (a.sayT > 0)
    bubble(a.say, x, y - 58, ang ? '#ffe0e0' : cry ? '#e2f2ff' : '#fff7cf', Math.min(110, a.sayT + 20));
}
