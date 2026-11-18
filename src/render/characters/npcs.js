/** @file Non-playable characters (HR officer, Dott. Cavillo, Asdrubale). */
import { PAL_AS, PAL_CV, PAL_HR } from '../../data/palettes.js';
import { ci, crv, ctx, el, fs, glow, lgr, ln, pth, rect, rr } from '../../engine/canvas.js';
import { GY, OL, P2 } from '../../engine/config.js';
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

/** Dott. Cavillo, head of the Contracts Office: monocle, pencil moustache, giant pen and stamp. */
export function drawCav(a) {
  const x = a.x,
    y = a.y,
    st = a.st,
    air = y < GY - 0.5,
    dizzy = st == 'stordito',
    rage = a.hp < a.max / 2 && st != 'arreso',
    pen = st == 'penna',
    stamp = st == 'timbro',
    run = pen && a.vx ? 1 : st == 'cavilla' && a.t % 200 < 160 ? 0.35 : 0;
  if (air) el(x, GY, 10 * clamp01(1 - (GY - y) / 120), 2, 'rgba(0,0,0,.28)');
  const sq = a.land > 0 ? 1 - Math.sin((a.land / 26) * Math.PI) * 0.12 : 1;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1 / sq, sq);
  ctx.translate(-x, -y);
  human(x, y, {
    face: a.face,
    sc: 1.22,
    bulk: 0.92,
    pal: PAL_CV,
    run,
    air,
    vy: a.vy,
    ph: V.TT * (pen ? 0.34 : 0.12),
    torso: (a2, b) => {
      pth([-2.2, a2 - 1.4, 0, a2 + 3.4, 0, a2 - 1.4], '#ffffff', OL, 0.5);
      pth([2.2, a2 - 1.4, 0, a2 + 3.4, 0, a2 - 1.4], '#eef1f8', OL, 0.5);
      pth([-1.4, a2 - 0.6, 1.4, a2 - 0.6, 0.6, a2 + 0.6, -0.6, a2 + 0.6], '#9c1030', OL, 0.35);
      pth([-0.6, a2 + 0.6, 0.6, a2 + 0.6, 1, a2 + 5, 0, a2 + 6, -1, a2 + 5], '#b8143a', OL, 0.35);
      ln(-2.8, a2 - 1.2, -0.4, a2 + 4.6, '#2a2e40', 0.5);
      ln(2.8, a2 - 1.2, 0.4, a2 + 4.6, '#2a2e40', 0.5);
      pth([2.4, a2 + 2.6, 4.2, a2 + 2.2, 4, a2 + 3.4], '#ffd500', OL, 0.3);
      rect(-5, b - 1.3, 10, 1.3, '#14141a');
    },
    hand: (hx, hy) => {
      if (pen) {
        // giant fountain pen pointed forward
        rr(hx - 1, hy - 1.8, 16, 3.6, 1.6, lgr(0, hy - 2, 0, hy + 2, '#2a2e60', '#10132e'), OL, 0.5);
        rect(hx + 3, hy - 1.8, 1.4, 3.6, '#ffd500');
        pth([hx + 15, hy - 1.8, hx + 21, hy, hx + 15, hy + 1.8], '#ffd500', OL, 0.5);
        ln(hx + 16, hy, hx + 20.4, hy, '#7a5a00', 0.4);
      } else if (stamp) {
        rr(hx - 1.4, hy - 6, 3, 5, 1.4, '#7a4a22', OL, 0.5);
        rr(hx - 4, hy - 1.2, 8, 3, 0.6, '#3a3e52', OL, 0.5);
        rect(hx - 3.6, hy + 1.6, 7.2, 1.2, '#d0102a');
      } else {
        rr(hx - 1, hy - 4, 7, 9, 0.6, '#c9a06a', OL, 0.5);
        rr(hx - 0.4, hy - 3.2, 5.8, 7.4, 0.3, '#ffffff');
        for (let i = 0; i < 4; i++) rect(hx + 0.4, hy - 2 + i * 1.5, 4.2, 0.4, '#aab2c8');
        ci(hx + 4.2, hy + 2.6, 1.1, '#d0102a', OL, 0.3);
      }
    },
    head: (hx, hy) => {
      headBase(hx, hy, PAL_CV.skin, 5, 6);
      if (rage) {
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(hx, hy, 5, 6, 0, 0, P2);
        ctx.clip();
        rect(hx - 6, hy - 6, 12, 12, 'rgba(226,38,24,' + (0.25 + 0.1 * Math.sin(V.TT * 0.3)) + ')');
        ctx.restore();
      }
      // slicked hair with a sharp side parting and grey temples
      crv(
        [
          hx - 5.2,
          hy + 0.4,
          hx - 5.8,
          hy - 4.8,
          hx - 1.4,
          hy - 7.2,
          hx + 3.6,
          hy - 6.6,
          hx + 5.6,
          hy - 4.2,
          hx + 1.6,
          hy - 4.6,
          hx - 2.4,
          hy - 3.8,
          hx - 4,
          hy + 0.6,
        ],
        lgr(0, hy - 7, 0, hy, '#3a3e52', '#1c1e2c'),
        OL,
        0.6,
      );
      ln(hx - 1.6, hy - 6.6, hx + 2.6, hy - 5.4, 'rgba(255,255,255,.45)', 0.6);
      el(hx - 4.6, hy - 1.6, 1, 1.8, '#c9cdd8');
      if (dizzy) {
        for (const [ex, r] of [
          [1.4, 1.1],
          [4.6, 1],
        ]) {
          ctx.beginPath();
          for (let i = 0; i < 14; i++) {
            const an = i * 0.7 + V.TT * 0.3,
              rr2 = (i / 14) * r;
            ctx.lineTo(hx + ex + Math.cos(an) * rr2, hy - 0.6 + Math.sin(an) * rr2);
          }
          ctx.strokeStyle = OL;
          ctx.lineWidth = 0.45;
          ctx.stroke();
        }
      } else {
        const bl = blinkOn(13);
        eye(hx + 1.4, hy - 0.6, 0.66, bl);
        eye(hx + 4.6, hy - 0.6, 0.6, bl);
      }
      // eyebrows: arched and smug, angled when raging
      ln(hx - 0.2, hy - 2.6 + (rage ? -0.4 : 0), hx + 2.6, hy - (rage ? 1.6 : 3.2), OL, 0.7);
      ln(hx + 3.4, hy - (rage ? 1.6 : 3.2), hx + 6, hy - 2.6 + (rage ? -0.4 : 0), OL, 0.7);
      // monocle with chain
      ci(hx + 4.6, hy - 0.6, 1.9, 'rgba(220,240,255,.25)', '#c9a020', 0.6);
      ctx.beginPath();
      ctx.moveTo(hx + 4.6, hy + 1.3);
      ctx.quadraticCurveTo(hx + 3.6, hy + 6, hx + 1.4, hy + 8);
      ctx.strokeStyle = '#c9a020';
      ctx.lineWidth = 0.35;
      ctx.stroke();
      noseP(hx, hy + 0.3, PAL_CV.skin, 3.6);
      // pencil moustache with curled tips
      crv([hx + 1.2, hy + 3.6, hx + 3.2, hy + 2.6, hx + 5.6, hy + 3.4], null, '#1c1e2c', 0.8);
      ci(hx + 1, hy + 3.2, 0.5, null, '#1c1e2c', 0.4);
      ci(hx + 5.9, hy + 3, 0.5, null, '#1c1e2c', 0.4);
      if (st == 'arreso') {
        ctx.beginPath();
        ctx.arc(hx + 3.4, hy + 4.4, 1.2, 0.2, Math.PI - 0.2);
        ctx.strokeStyle = OL;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      } else if (rage || pen) el(hx + 3.4, hy + 4.8, 1.3, 0.9, '#6a2a22', OL, 0.4);
      else ln(hx + 2.2, hy + 4.8, hx + 4.8, hy + 4.4, OL, 0.5);
    },
  });
  ctx.restore();
  if (a.flash > 0) glow(x, y - 20, 24, '#ffffff', 0.35);
  if (dizzy)
    for (let i = 0; i < 3; i++) {
      const an = V.TT * 0.12 + (i * P2) / 3;
      star5(x + Math.cos(an) * 9, y - 52 + Math.sin(an) * 2.6, 2.2, '#ffe95c');
    }
  if (rage && st == 'cavilla')
    for (let i = 0; i < 2; i++) {
      const f = (V.TT * 0.05 + i * 0.5) % 1;
      ctx.globalAlpha = (1 - f) * 0.8;
      ci(x - 3 + i * 6, y - 50 - f * 8, 1.2 + f * 2, '#ffffff');
    }
  ctx.globalAlpha = 1;
  if (a.sayT > 0)
    bubble(a.say, x, y - 64, rage ? '#ffe0e0' : dizzy ? '#fff7cf' : '#eef1ff', Math.min(110, a.sayT + 20));
}
const clamp01 = v => Math.max(0, Math.min(1, v));
function star5(x, y, r, c) {
  const p = [];
  for (let i = 0; i < 10; i++) {
    const an = -Math.PI / 2 + (i * Math.PI) / 5,
      rr2 = i % 2 ? r * 0.45 : r;
    p.push(x + Math.cos(an) * rr2, y + Math.sin(an) * rr2);
  }
  pth(p, c, OL, 0.4);
}
