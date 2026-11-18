/** @file Hero renderers (Anzu, Bolt, August the fox, Angry Man, interns, Iolanda, Ops, Sora Rita). */
import { PAL_C, PAL_G, PAL_GD, PAL_GM, PAL_MA, PAL_OP, PAL_RI, PAL_T } from '../../data/palettes.js';
import {
  TX,
  ci,
  crv,
  ctx,
  el,
  fs,
  glow,
  lgr,
  ln,
  pth,
  rect,
  rgr,
  rr,
  rrPath,
  shadow,
} from '../../engine/canvas.js';
import { GY, H, OL, P2 } from '../../engine/config.js';
import { clamp } from '../../engine/math.js';
import { isAngry } from '../../game/progression.js';
import { G } from '../../game/state.js';
import { drawCons } from './allies.js';
import { blinkOn, eye, headBase, human, noseP, specs } from './rig.js';
import { V, ix, iy, rnowPh } from '../interp.js';

export function drawTuono(x, y, p, r, sc) {
  human(x, y, {
    face: p.face,
    run: p.onGround ? Math.min(1, Math.abs(p.vx) / 2) : 0,
    air: !p.onGround,
    vy: p.vy,
    shoot: p.shootT,
    land: r.land,
    ph: r.ph,
    sc: sc,
    pal: PAL_T,
    rot: p.dead ? p.dead * 0.15 : 0,
    torso: (a, b) => {
      pth([-2.8, a - 1.4, 0, a + 2.2, 0.2, a - 1.4], '#ffffff', OL, 0.6);
      pth([3, a - 1.4, 0, a + 2.2, -0.2, a - 1.4], '#eef2fb', OL, 0.6);
      ln(0, a + 2, 0, a + 5, '#aab2c8', 0.6);
      ci(-0.6, a + 2.6, 0.35, '#aab2c8');
      ci(-0.6, a + 4, 0.35, '#aab2c8');
      rr(2, a + 3, 2.2, 2, 0.6, '#ffd500');
      rect(-5, b - 1.4, 10, 1.4, '#1b2350');
    },
    hand: (hx, hy) => {
      if (p.shootT > 0) {
        for (let i = 0; i < 3; i++) {
          const an = -0.6 + i * 0.6 + Math.sin(V.TT * 0.9 + i) * 0.2;
          ln(hx + 1, hy, hx + 1 + Math.cos(an) * 4, hy + Math.sin(an) * 4, '#ffe95c', 0.7);
        }
        glow(hx + 2, hy, 7, '#ffe95c', 0.7);
      }
    },
    head: (hx, hy) => {
      headBase(hx, hy, PAL_T.skin);
      pth(
        [
          hx - 5.4,
          hy - 1,
          hx - 5.6,
          hy - 4.4,
          hx - 3.6,
          hy - 6.6,
          hx - 0.6,
          hy - 7.2,
          hx + 2.6,
          hy - 6.8,
          hx + 4.4,
          hy - 5.2,
          hx + 6.6,
          hy - 5.6,
          hx + 5.6,
          hy - 3.2,
          hx + 2,
          hy - 4.2,
          hx - 1.2,
          hy - 3.6,
          hx - 3.8,
          hy - 2.6,
          hx - 4.2,
          hy,
        ],
        '#1a1412',
        OL,
        0.7,
      );
      ln(hx - 1, hy - 6.4, hx + 2.6, hy - 5.8, 'rgba(255,255,255,.25)', 0.8);
      const bl = blinkOn(1);
      eye(hx + 1.2, hy - 0.7, 0.72, bl);
      eye(hx + 4.6, hy - 0.7, 0.58, bl);
      ln(hx - 0.3, hy - 3, hx + 2.5, hy - 3.3, '#1a1412', 0.75);
      ln(hx + 3.8, hy - 3.3, hx + 5.4, hy - 3, '#1a1412', 0.75);
      noseP(hx, hy, PAL_T.skin);
      specs(hx, hy, false);
      if (p.shootT > 0) {
        el(hx + 3.4, hy + 3.9, 1.25, 1, '#7a1f2a', OL, 0.5);
        rect(hx + 2.5, hy + 3.1, 1.9, 0.45, '#fff');
      } else {
        ctx.beginPath();
        ctx.moveTo(hx + 2, hy + 3.6);
        ctx.quadraticCurveTo(hx + 3.3, hy + 4.5, hx + 4.6, hy + 3.5);
        ctx.strokeStyle = OL;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
      if (p.angry) angerFx(hx, hy, 5.2, 5.6);
    },
  });
}
function foxTail(x, y, face, run, air, vy, k) {
  const sw = Math.sin(V.TT * 0.07),
    wv = Math.sin(V.TT * 0.32),
    bx = x - face * 3.2 * k,
    by = y - 10.4 * k,
    tx = bx - face * (15 + run * 7) * k,
    ty =
      by +
      (-11 +
        run * 9 -
        (air ? Math.max(-4, Math.min(5, vy)) * 1.2 : 0) +
        sw * 2.2 * (1 - run) +
        wv * 1.6 * run) *
        k,
    cx = bx - face * (4 + run * 6) * k,
    cy = by + (1 + run * 3) * k - sw * 1.2 * k,
    N = 16,
    L = [],
    R = [],
    S = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N,
      u = 1 - t,
      px = u * u * bx + 2 * u * t * cx + t * t * tx,
      py = u * u * by + 2 * u * t * cy + t * t * ty,
      dx = 2 * u * (cx - bx) + 2 * t * (tx - cx),
      dy = 2 * u * (cy - by) + 2 * t * (ty - cy),
      l = Math.hypot(dx, dy) || 1,
      nx = -dy / l,
      ny = dx / l,
      w =
        (1.4 + Math.sin(Math.min(1, t * 1.15) * Math.PI * 0.92) * 4.6 + (t > 0.9 ? -(t - 0.9) * 18 : 0)) *
        k *
        (1 + 0.06 * Math.sin(V.TT * 0.2 + t * 6));
    S.push([px, py, nx, ny, w]);
    L.push(px + nx * w, py + ny * w);
    R.push(px - nx * w, py - ny * w);
  }
  const poly = (a, b) => {
    ctx.beginPath();
    for (let i = a; i <= b; i++) {
      const s = S[i];
      i == a
        ? ctx.moveTo(s[0] + s[2] * s[4], s[1] + s[3] * s[4])
        : ctx.lineTo(s[0] + s[2] * s[4], s[1] + s[3] * s[4]);
    }
    const e = S[b];
    ctx.quadraticCurveTo(
      e[0] + (e[0] - S[b - 1][0]) * 1.3,
      e[1] + (e[1] - S[b - 1][1]) * 1.3,
      e[0] - e[2] * e[4],
      e[1] - e[3] * e[4],
    );
    for (let i = b; i >= a; i--) {
      const s = S[i];
      ctx.lineTo(s[0] - s[2] * s[4], s[1] - s[3] * s[4]);
    }
    ctx.closePath();
  };
  poly(0, N);
  fs(lgr(bx, by, tx, ty, '#ff9a3c', '#e8641a', [0.75, '#c94c12']), OL, 0.8 * k);
  ctx.save();
  poly(0, N);
  ctx.clip();
  const tp = S[(N * 0.74) | 0];
  ctx.beginPath();
  ctx.arc(tx, ty, 5.6 * k, 0, P2);
  ctx.fillStyle = '#fff8ee';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(tx, ty, 9 * k, 0, P2);
  ctx.strokeStyle = 'rgba(255,255,255,.0)';
  ctx.stroke();
  for (let i = 2; i < N - 2; i += 2) {
    const s = S[i];
    ln(
      s[0] + s[2] * s[4] * 0.6,
      s[1] + s[3] * s[4] * 0.6,
      s[0] + s[2] * s[4] * 0.15 - face * 1.2 * k,
      s[1] + s[3] * s[4] * 0.15,
      'rgba(255,214,150,.55)',
      0.5 * k,
    );
    ln(
      s[0] - s[2] * s[4] * 0.5,
      s[1] - s[3] * s[4] * 0.5,
      s[0] - s[2] * s[4] * 0.1 - face * 1.2 * k,
      s[1] - s[3] * s[4] * 0.1,
      'rgba(150,50,10,.35)',
      0.45 * k,
    );
  }
  ln(S[3][0], S[3][1], tp[0], tp[1], 'rgba(255,240,210,.4)', 0.8 * k);
  ctx.restore();
  poly(0, N);
  ctx.strokeStyle = OL;
  ctx.lineWidth = 0.8 * k;
  ctx.stroke();
}
/** Pointed fox ears with dark tips and pale inner fur; they droop with anxiety. */
function foxEars(hx, hy, anx, ang) {
  const droop = anx * 0.5 - (ang ? 0.25 : 0),
    tw = Math.sin(V.TT * 0.09) * 0.08;
  const ear = (bx, by, a, h) => {
    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(a);
    pth([-2.3, 0, -0.3, -h, 2.3, 0], lgr(0, -h, 0, 0, '#c9540f', '#f0842e'), OL, 0.7);
    pth([-1.2, -0.4, -0.3, -h + 2.2, 1.2, -0.4], '#ffe1c4');
    pth([-0.95, -h + 2.1, -0.3, -h, 0.55, -h + 2.1], '#2a1408');
    ctx.restore();
  };
  ear(hx - 3, hy - 4.4, -0.42 - droop + tw, 6.6);
  ear(hx + 2.2, hy - 5.3, 0.3 + droop * 0.8 - tw, 6.2);
}
/** Fox muzzle: cream snout, glossy black nose, whiskers. */
function foxSnout(hx, hy) {
  pth(
    [hx + 1.6, hy + 0.2, hx + 5.4, hy + 0.9, hx + 8.6, hy + 2.6, hx + 6.2, hy + 4.2, hx + 2.4, hy + 4.4],
    lgr(hx + 1, hy, hx + 8, hy + 4, '#fff6ea', '#f0d8bf'),
    OL,
    0.6,
  );
  ln(hx + 2.2, hy + 0.5, hx + 6, hy + 1.3, 'rgba(240,132,46,.55)', 0.9);
  el(hx + 8.3, hy + 2.5, 1.05, 0.85, '#1a0e08', OL, 0.3);
  el(hx + 8.5, hy + 2.15, 0.38, 0.22, 'rgba(255,255,255,.7)');
  for (let i = -1; i <= 1; i++)
    ln(hx + 6.4, hy + 3 + i * 0.5, hx + 10.4, hy + 2.6 + i * 1.3, 'rgba(255,255,255,.75)', 0.25);
}
export function drawGiugno(x, y, p, r, sc) {
  foxTail(
    x,
    y,
    p.face || 1,
    p.onGround ? Math.min(1, Math.abs(p.vx || 0) / 2) : 0,
    !p.onGround && p.onGround !== undefined,
    p.vy || 0,
    sc || 1,
  );
  const pan = p.panicT > 0,
    anx = pan ? 1 : p.maxHp > 1 && p.hp != null && !p.dead ? clamp(1 - (p.hp - 1) / (p.maxHp - 1), 0, 1) : 0,
    ang = p.angry && !pan,
    jit = pan ? (Math.random() - 0.5) * 1.6 : anx > 0.5 && !ang ? Math.sin(V.TT * 2.3) * 0.35 * anx : 0;
  if (pan) {
    for (let i = 0; i < 4; i++) {
      const a = V.TT * 0.25 + i * 1.57;
      TX(['!', '?', '☕', '!'][i], x + Math.cos(a) * 12, y - 30 + Math.sin(a) * 5, 6, '#ffb020', {
        w: 700,
        sk: '#0a1436',
        sw: 1.4,
      });
    }
  }
  human(x + jit, y, {
    face: p.face,
    run: p.onGround ? Math.min(1, Math.abs(p.vx) / 2) : 0,
    air: !p.onGround,
    vy: p.vy,
    shoot: p.shootT,
    land: r.land,
    ph: r.ph,
    sc: sc,
    pal: PAL_G,
    rot: p.dead ? p.dead * 0.15 : 0,
    torso: (a, b) => {
      el(0, a - 1, 3.8, 1.6, '#141c42', OL, 0.5);
      ln(-1, a, -1.2, a + 4, '#e6ebf6', 0.5);
      ln(1, a, 1.3, a + 3.6, '#e6ebf6', 0.5);
      ci(-1.2, a + 4.3, 0.42, '#e6ebf6');
      ci(1.3, a + 3.9, 0.42, '#e6ebf6');
      rr(-3.8, a + 5.2, 7.6, 3.8, 1.4, '#18214c', OL, 0.45);
      ln(-3.2, a + 5.6, -2.6, a + 8.6, 'rgba(0,0,0,.28)', 0.4);
      rect(-5, b - 1.7, 10, 1.7, '#141c42');
    },
    hand: (hx, hy) => {
      const a = p.shootT > 0 ? 1 : 0.55;
      ctx.globalAlpha = a;
      TX('π', hx + 3, hy - 0.5, 6, '#9ff6ff', { sk: '#0a2a6a', sw: 1.6 });
      ctx.globalAlpha = 1;
      glow(hx + 3, hy, 6, '#66f0ff', 0.5 * a);
    },
    head: (hx, hy) => {
      crv(
        [hx - 6.8, hy + 7.8, hx - 7.6, hy + 2.6, hx - 5.2, hy + 0.6, hx - 2, hy + 3.6, hx + 1, hy + 7.6],
        lgr(0, hy, 0, hy + 8, '#33478f', '#141c42'),
        OL,
        0.8,
      );
      crv([hx - 6, hy + 6.8, hx - 6.5, hy + 3, hx - 5, hy + 1.8, hx - 3, hy + 4], null, '#4a62b0', 0.5);
      foxEars(hx, hy, anx, ang);
      headBase(hx, hy, PAL_G.skin);
      if (anx > 0 && !ang) {
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(hx, hy, 5.2, 5.6, 0, 0, P2);
        ctx.clip();
        rect(hx - 6, hy - 6, 12, 12, 'rgba(170,215,190,' + 0.34 * anx + ')');
        ctx.restore();
      }
      crv(
        [
          hx - 5.3,
          hy + 0.6,
          hx - 5.8,
          hy - 3.4,
          hx - 3.9,
          hy - 6.3,
          hx - 0.2,
          hy - 7.1,
          hx + 3.5,
          hy - 6.6,
          hx + 5.5,
          hy - 4.8,
          hx + 5.7,
          hy - 3.3,
          hx + 3.9,
          hy - 3.9,
          hx + 1.7,
          hy - 3.6,
          hx - 0.5,
          hy - 3.9,
          hx - 2.8,
          hy - 3.2,
          hx - 3.7,
          hy - 1,
          hx - 3.9,
          hy + 0.6,
        ],
        lgr(0, hy - 7, 0, hy, '#e06a1e', '#b8500f'),
        OL,
        0.7,
      );
      ln(hx - 2, hy - 6.1, hx + 2.4, hy - 6.2, 'rgba(255,220,170,.45)', 0.7);
      crv(
        [
          hx - 3.9,
          hy - 0.6,
          hx - 4.3,
          hy + 2.8,
          hx - 2.3,
          hy + 5.9,
          hx + 1.8,
          hy + 7.3,
          hx + 5.1,
          hy + 6.3,
          hx + 6.8,
          hy + 3.8,
          hx + 6.4,
          hy + 2.5,
          hx + 4.9,
          hy + 2.4,
          hx + 3.2,
          hy + 1.6,
          hx + 1.4,
          hy + 2.2,
          hx - 0.6,
          hy + 1.3,
          hx - 2.6,
          hy + 0.3,
        ],
        lgr(0, hy, 0, hy + 7.3, '#fffaf2', '#ecd6bd'),
        OL,
        0.7,
      );
      for (let i = 0; i < 5; i++) {
        const bx = hx - 2.4 + i * 1.6,
          by = hy + 3.6 + Math.sin(i * 1.7) * 0.9;
        ln(bx, by, bx + 0.35, by + 0.9, 'rgba(190,130,80,.35)', 0.35);
      }
      if (p.shootT > 0) el(hx + 3.6, hy + 4.3, 1.15, 0.9, '#6a1f22', OL, 0.4);
      else if (ang) {
        rr(hx + 2.2, hy + 3.6, 2.8, 1.4, 0.4, '#ffffff', OL, 0.45);
        ln(hx + 3.6, hy + 3.6, hx + 3.6, hy + 5, OL, 0.3);
      } else if (anx > 0.6) {
        ctx.beginPath();
        ctx.moveTo(hx + 2.3, hy + 4.2);
        for (let i = 1; i <= 5; i++) ctx.lineTo(hx + 2.3 + i * 0.5, hy + 4.2 + (i % 2 ? -0.4 : 0.4));
        ctx.strokeStyle = '#7a2f22';
        ctx.lineWidth = 0.6;
        ctx.stroke();
      } else ln(hx + 2.6, hy + 4.2, hx + 4.5, hy + 4.1, '#7a2f22', 0.65);
      foxSnout(hx, hy);
      const bl = blinkOn(2);
      if (anx > 0.3 && !ang) {
        const dx = Math.sin(V.TT * 0.35) * 0.35 * anx;
        el(hx + 1.2, hy - 0.7, 1.25, 1.35, '#ffffff', OL, 0.35);
        ci(hx + 1.2 + dx, hy - 0.7, 0.42, '#141a33');
        el(hx + 4.6, hy - 0.7, 1, 1.25, '#ffffff', OL, 0.35);
        ci(hx + 4.6 + dx, hy - 0.7, 0.38, '#141a33');
      } else {
        eye(hx + 1.2, hy - 0.7, 0.7, bl);
        eye(hx + 4.6, hy - 0.7, 0.56, bl);
      }
      if (!ang) {
        const u = anx * 1.3,
          dn = anx * 0.4;
        ln(hx - 0.3, hy - 3 + dn, hx + 2.5, hy - 3.3 - u, '#2a1a10', 0.85);
        ln(hx + 3.8, hy - 3.3 - u, hx + 5.4, hy - 3 + dn, '#2a1a10', 0.85);
      }
      specs(hx, hy, true);
      if (ang) angerFx(hx, hy, 5.2, 5.6);
      else if (anx > 0) {
        const n = anx > 0.6 ? 3 : anx > 0.3 ? 2 : 1;
        for (let i = 0; i < n; i++) {
          const f = (V.TT * 0.022 + i * 0.37) % 1,
            dx = hx - 4.4 + i * 1.4,
            dy = hy - 3.4 + f * 7;
          ctx.globalAlpha = 1 - f * f;
          pth([dx, dy - 1.1, dx + 0.62, dy + 0.2, dx, dy + 0.75, dx - 0.62, dy + 0.2], '#bfe6ff', OL, 0.25);
          ctx.globalAlpha = 1;
        }
        if (anx >= 1 && (G.frame >> 3) % 3) {
          for (let i = 0; i < 3; i++) {
            const a = -0.9 + i * 0.45;
            ln(
              hx + 6.4 + Math.cos(a) * 1.4,
              hy - 5.6 + Math.sin(a) * 1.4,
              hx + 6.4 + Math.cos(a) * 3.2,
              hy - 5.6 + Math.sin(a) * 3.2,
              '#9ff6ff',
              0.55,
            );
          }
        }
      }
    },
  });
}
function gingham(x0, y0, w, h) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x0, y0, w, h);
  ctx.clip();
  rect(x0, y0, w, h, '#f6f2f0');
  for (let i = 0; i < w / 1.6 + 1; i++) if (i % 2 == 0) rect(x0 + i * 1.6, y0, 1.6, h, 'rgba(214,40,40,.75)');
  for (let j = 0; j < h / 1.6 + 1; j++) if (j % 2 == 0) rect(x0, y0 + j * 1.6, w, 1.6, 'rgba(214,40,40,.75)');
  rect(x0, y0, w, h, lgr(x0, 0, x0 + w, 0, 'rgba(255,255,255,.12)', 'rgba(0,0,0,.18)'));
  ctx.restore();
}
export function drawChapel(x, y, p, r, sc) {
  const yell = p.shootT > 0;
  human(x, y, {
    face: p.face,
    run: p.onGround ? Math.min(1, Math.abs(p.vx) / 2) : 0,
    air: !p.onGround,
    vy: p.vy,
    shoot: p.shootT,
    land: r.land,
    ph: r.ph,
    sc: (sc || 1) * 1.06,
    bulk: 1.15,
    pal: PAL_C,
    rot: p.dead ? p.dead * 0.15 : 0,
    torsoFill: '#f6f2f0',
    torso: (a, b, bk) => {
      const tw2 = 10 * bk;
      ctx.save();
      ctx.beginPath();
      rrPath(-tw2 / 2, a - 1.6, tw2, b - a + 2.2, 3.2);
      ctx.clip();
      gingham(-tw2 / 2, a - 2, tw2, b - a + 4);
      ctx.restore();
      rr(-tw2 / 2, a - 1.6, tw2, b - a + 2.2, 3.2, null, OL, 0.9);
      pth([-2.6, a - 1.4, 0, a + 1.8, 0, a - 1.4], '#b52a24', OL, 0.5);
      pth([2.6, a - 1.4, 0, a + 1.8, 0, a - 1.4], '#c8322c', OL, 0.5);
      rect(-tw2 / 2, b - 1.4, tw2, 1.4, '#3a2414');
      rr(-1, b - 1.7, 2.2, 1.9, 0.4, '#c9a24a');
    },
    hand: (hx, hy) => {
      if (yell) {
        ci(hx, hy, 1.9, PAL_C.skin, OL, 0.6);
        ln(hx - 0.5, hy - 1, hx - 0.5, hy + 0.6, OL, 0.4);
      }
    },
    head: (hx, hy) => {
      const rg = p.angry
        ? 1
        : p.maxHp && p.hp != null
          ? clamp(1 - (p.hp - 1) / Math.max(1, p.maxHp - 1), 0, 1)
          : 0;
      headBase(hx, hy - 0.4, PAL_C.skin, 5.7, 5.9);
      noseP(hx, hy, PAL_C.skin, 3.8);
      if (rg > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(hx, hy - 0.4, 5.3, 5.5, 0, 0, P2);
        ctx.ellipse(hx + 4.05, hy + 1.15, 1.05, 1.05, 0, 0, P2);
        ctx.clip();
        rect(hx - 7, hy - 7, 15, 14, 'rgba(226,38,24,' + (0.12 + rg * 0.5) + ')');
        ctx.restore();
      }
      el(hx - 1.6, hy - 4.6, 2.8, 1.4, 'rgba(255,255,255,.65)', null, 0, -0.35);
      el(hx - 0.6, hy - 3.4, 1, 0.5, 'rgba(255,255,255,.4)');
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(hx, hy - 0.4, 5.6, 5.8, 0, 0, P2);
      ctx.clip();
      rect(hx - 6, hy + 1.6, 12, 5, 'rgba(90,60,45,.28)');
      ctx.restore();
      {
        const d = rg * 1.1;
        pth(
          [
            hx + 0.2,
            hy - 3.4 - d,
            hx + 3.4,
            hy - 2.2 + d * 0.3,
            hx + 3.2,
            hy - 1.5 + d * 0.3,
            hx + 0.2,
            hy - 2.6 - d,
          ],
          '#2a1810',
        );
        pth(
          [
            hx + 4.2,
            hy - 2.1 + d * 0.3,
            hx + 6.4,
            hy - 3.2 - d,
            hx + 6.4,
            hy - 2.5 - d,
            hx + 4.4,
            hy - 1.5 + d * 0.3,
          ],
          '#2a1810',
        );
      }
      eye(hx + 2.4, hy - 0.6, 0.65, !yell && blinkOn(3));
      eye(hx + 5.2, hy - 0.6, 0.6, !yell && blinkOn(3));
      if (yell) {
        el(hx + 4, hy + 3, 2.4, 1.9, '#5a0a14', OL, 0.6);
        rect(hx + 2.2, hy + 1.4, 3.6, 0.8, '#fff');
        el(hx + 4, hy + 4.2, 1.2, 0.6, '#e05a6a');
        ctx.save();
        ctx.translate(hx - 2.6, hy - 6.8);
        ctx.rotate(Math.sin(V.TT * 0.8) * 0.2);
        for (let i = 0; i < 4; i++) {
          ctx.rotate(P2 / 4);
          rr(-0.5, 0.4, 1, 1.8, 0.4, '#ff3b4a');
        }
        ctx.restore();
      } else if (rg > 0.6) {
        rr(hx + 2.2, hy + 2.7, 3.6, 1.7, 0.5, '#ffffff', OL, 0.55);
        ln(hx + 3.4, hy + 2.7, hx + 3.4, hy + 4.4, OL, 0.35);
        ln(hx + 4.6, hy + 2.7, hx + 4.6, hy + 4.4, OL, 0.35);
      } else if (rg > 0.3) {
        ctx.beginPath();
        ctx.moveTo(hx + 2.5, hy + 3.9);
        ctx.quadraticCurveTo(hx + 4, hy + 2.7, hx + 5.5, hy + 3.6);
        ctx.strokeStyle = OL;
        ctx.lineWidth = 0.75;
        ctx.stroke();
      } else {
        ln(hx + 2.6, hy + 3.5, hx + 5.4, hy + 3.1, OL, 0.7);
      }
      if (rg > 0.3 && !yell) {
        ctx.save();
        ctx.translate(hx - 2.6, hy - 6.8);
        ctx.rotate(Math.sin(V.TT * 0.4) * 0.15);
        const vs = 0.7 + rg * 0.5;
        ctx.scale(vs, vs);
        for (let i = 0; i < 4; i++) {
          ctx.rotate(P2 / 4);
          rr(-0.5, 0.4, 1, 1.8, 0.4, '#ff3b4a');
        }
        ctx.restore();
      }
      if (rg > 0.6) {
        for (let i = 0; i < 3; i++) {
          const f = (V.TT * 0.035 + i / 3) % 1,
            sx = hx - 3 + i * 3.2 + Math.sin(V.TT * 0.1 + i) * 0.6;
          ctx.globalAlpha = (1 - f) * 0.75;
          ci(sx, hy - 7.5 - f * 7, 1 + f * 1.4, '#ffffff');
        }
        ctx.globalAlpha = 1;
      }
    },
  });
}
export function drawAnzuV(x, y, o) {
  const s = o.sc || 1,
    air = o.air,
    run = o.run || 0,
    ph = o.ph || 0;
  let sx = 1,
    sy = 1;
  if (o.land) {
    const q = o.land / 9;
    sy = 1 - 0.16 * q;
    sx = 1 + 0.13 * q;
  } else if (air && o.vy < -2) {
    sy = 1.08;
    sx = 0.94;
  }
  ctx.save();
  ctx.translate(x, y);
  ctx.scale((o.face || 1) * s * sx, s * sy);
  if (o.rot) ctx.rotate(o.rot);
  const bob = air ? 0 : Math.abs(Math.sin(ph)) * 1.3 * run,
    by = -12.5 - bob,
    t = V.TT;
  const tf = Math.sin(t * 0.09) * 0.12 + (air ? -0.25 : 0);
  for (let i = 2; i >= 0; i--) {
    ctx.save();
    ctx.translate(-6.5, by + 2.5);
    ctx.rotate(2.35 + tf + (i - 1) * 0.32);
    const L = 9 - i * 0.6;
    ctx.beginPath();
    ctx.moveTo(0, -1.4);
    ctx.quadraticCurveTo(L * 0.55, -2.6, L, 0);
    ctx.quadraticCurveTo(L * 0.55, 2.6, 0, 1.4);
    ctx.closePath();
    fs(lgr(0, 0, L, 0, '#1b3fa0', '#3b7bff'), OL, 0.7);
    el(L - 1.2, 0, 1.6, 1.1, '#ffd500');
    ctx.restore();
  }
  const lA = air ? 0.5 : Math.sin(ph) * 0.9 * run,
    lB = air ? -0.2 : -Math.sin(ph) * 0.9 * run;
  const bleg = (hx, an, c) => {
    const kx = hx + Math.sin(an) * 4,
      ky = by + 6 + Math.cos(an) * 4,
      fx = kx + Math.sin(an * 0.4) * 3.6,
      fy = ky + 3.6;
    ln(hx, by + 6, kx, ky, OL, 1.9);
    ln(kx, ky, fx, fy, OL, 1.9);
    ln(hx, by + 6, kx, ky, c, 1);
    ln(kx, ky, fx, fy, c, 1);
    for (const d of [-0.5, 0.15, 0.8]) {
      ln(fx, fy, fx + Math.sin(1.4 + d) * 2.6, fy + Math.cos(1.4 + d) * 1.2, OL, 1.4);
      ln(fx, fy, fx + Math.sin(1.4 + d) * 2.6, fy + Math.cos(1.4 + d) * 1.2, c, 0.7);
    }
  };
  if (!air || o.vy > -99) {
    bleg(-1.6, lB, '#d99000');
    bleg(1.6, lA, '#ffb300');
  }
  el(0, by, 8.2, 8.4, lgr(-5, by - 7, 5, by + 7, '#5a95ff', '#2f6bff', [1, '#183a9a']), OL, 1);
  el(2.2, by + 1.8, 5, 5.4, lgr(0, by - 3, 0, by + 7, '#cfe0ff', '#8fb3ff'), null);
  pth([0.4, by - 6.6, 4.6, by - 6.4, 2.6, by - 2.6], '#ffffff', OL, 0.55);
  pth(
    [2.5, by - 6, 3.7, by - 6, 4.2, by + 1.4, 2.7, by + 3.4, 1.8, by + 1.4],
    lgr(0, by - 6, 0, by + 3, '#ffe95c', '#e8b400'),
    OL,
    0.55,
  );
  const wf = air
    ? o.flap > 4 || o.vy < 0
      ? -1.1 + Math.sin(t * 1.2) * 0.25
      : 0.4 + Math.sin(t * 0.9) * 0.6
    : Math.sin(t * 0.07) * 0.05 + Math.sin(ph) * 0.12 * run;
  ctx.save();
  ctx.translate(-1.4, by - 3);
  ctx.rotate(0.3 + wf);
  ctx.beginPath();
  ctx.moveTo(0, -2);
  ctx.quadraticCurveTo(-7, -1, -9.5, 6);
  ctx.lineTo(-7, 5.2);
  ctx.lineTo(-7.6, 8.4);
  ctx.lineTo(-5, 7);
  ctx.lineTo(-4.8, 9.6);
  ctx.lineTo(-2.4, 7.6);
  ctx.quadraticCurveTo(1.6, 5, 2.4, -0.6);
  ctx.closePath();
  fs(lgr(-9, 0, 2, 0, '#1d44b4', '#4a86ff'), OL, 0.85);
  ln(-2, 0, -6.6, 5.6, 'rgba(255,255,255,.25)', 0.6);
  ln(0, 1, -3.6, 7, 'rgba(255,255,255,.2)', 0.6);
  ctx.restore();
  const ax = o.shoot > 0 ? 11.5 : 9.6,
    ay = by - 1.4 + (o.shoot > 5 ? -0.6 : 0);
  glow(
    ax,
    ay,
    8 + (o.aura || 1) * 1.5 + (o.sp >= 100 ? 4 : 0),
    o.sp >= 100 ? '#ffe95c' : '#66f0ff',
    0.55 + Math.sin(t * 0.25) * 0.12,
  );
  ci(ax, ay, 2.4, rgr(ax - 0.8, ay - 0.8, 0.2, 2.6, '#ffffff', '#9ff6ff', [1, '#2fb8ff']), OL, 0.6);
  const hx = 3.2,
    hy = by - 9.6;
  el(hx - 4.6, hy + 0.8, 1.4, 2, '#f2c39b', OL, 0.6);
  el(hx, hy, 6, 6.2, lgr(hx - 4, hy - 6, hx + 4, hy + 6, '#ffe0c4', '#e8ae86'), OL, 1);
  el(hx - 1.5, hy - 4, 3, 1.4, 'rgba(255,255,255,.7)', null, 0, -0.35);
  el(hx - 0.4, hy - 2.6, 1, 0.5, 'rgba(255,255,255,.4)');
  const bl = blinkOn(0);
  eye(hx + 1.8, hy - 0.2, 0.75, bl);
  eye(hx + 5, hy - 0.2, 0.7, bl);
  ln(hx + 0.2, hy - 2.6, hx + 3, hy - 2.9, '#8a5a3a', 0.7);
  ln(hx + 4, hy - 2.9, hx + 6, hy - 2.5, '#8a5a3a', 0.7);
  ci(hx + 1.7, hy - 0.3, 2.3, 'rgba(220,240,255,.25)', OL, 1.15);
  ci(hx + 5.3, hy - 0.3, 2, 'rgba(220,240,255,.25)', OL, 1.1);
  ln(hx + 3.9, hy - 0.6, hx + 3.5, hy - 0.6, OL, 0.8);
  ln(hx - 0.6, hy - 0.4, hx - 4.6, hy + 0.2, OL, 0.8);
  if (Math.sin(t * 0.03) > 0.9) glow(hx + 0.8, hy - 1.4, 3, '#ffffff', 0.8);
  ctx.beginPath();
  ctx.arc(hx + 3.7, hy + 3, 1.4, 0.25, 2.5);
  ctx.strokeStyle = OL;
  ctx.lineWidth = 0.65;
  ctx.stroke();
  noseP(hx, hy + 0.3, '#f2c39b', 3.5);
  if (o.ang) angerFx(hx, hy, 6, 6.2);
  ctx.restore();
}
function angerFx(hx, hy, rx, ry) {
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(hx, hy, rx, ry, 0, 0, P2);
  ctx.clip();
  rect(hx - rx - 1, hy - ry - 1, rx * 2 + 2, ry * 2 + 2, 'rgba(226,38,24,.42)');
  ctx.restore();
  pth([hx - 0.5, hy - 3.9, hx + 2.8, hy - 2.5, hx + 2.7, hy - 1.8, hx - 0.5, hy - 3.1], '#1a0f0a');
  pth([hx + 3.7, hy - 2.5, hx + 6.1, hy - 3.9, hx + 6.1, hy - 3.1, hx + 3.8, hy - 1.8], '#1a0f0a');
  ctx.save();
  ctx.translate(hx - 2.4, hy - 4.6);
  ctx.rotate(Math.sin(V.TT * 0.4) * 0.15);
  for (let i = 0; i < 4; i++) {
    ctx.rotate(P2 / 4);
    rr(-0.45, 0.35, 0.9, 1.6, 0.4, '#ff3b4a');
  }
  ctx.restore();
  for (let i = 0; i < 2; i++) {
    const f = (V.TT * 0.04 + i * 0.5) % 1,
      sx = hx - 1 + i * 4 + Math.sin(V.TT * 0.12 + i) * 0.6;
    ctx.globalAlpha = (1 - f) * 0.8;
    ci(sx, hy - ry - 1 - f * 7, 0.9 + f * 1.5, '#ffffff');
  }
  ctx.globalAlpha = 1;
}
function stageBadge(a, hd) {
  const bc = hd ? '#2f6bff' : '#ffd500';
  ln(-1.8, a - 1.2, -2.4, a + 2.4, '#1b3fa0', 0.5);
  ln(1.6, a - 1.2, -2.4, a + 2.4, '#1b3fa0', 0.5);
  rr(-4.6, a + 2.2, 4.4, 3, 0.4, bc, OL, 0.3);
  TX(hd ? 'BC' : 'STAGE', -2.4, a + 3.8, hd ? 1.7 : 1.25, hd ? '#ffffff' : '#1b3fa0', { w: 900 });
}
function drawStag(x, y, p, r, sc) {
  const gm = p.form == 1,
    hd = p.hired,
    base = {
      face: p.face,
      run: p.onGround ? Math.min(1, Math.abs(p.vx) / 2) : 0,
      air: !p.onGround,
      vy: p.vy,
      shoot: p.shootT,
      land: r.land,
      ph: r.ph,
      rot: p.dead ? p.dead * 0.15 : 0,
    };
  if (!gm)
    human(
      x,
      y,
      Object.assign(base, {
        sc: (sc || 1) * 1.06,
        pal: PAL_GD,
        torso: (a, b) => {
          pth([-3, a - 1.4, 0, a + 3.4, 0, a - 1.4], '#ffffff', OL, 0.5);
          pth([3, a - 1.4, 0, a + 3.4, 0, a - 1.4], '#eef2fb', OL, 0.5);
          pth([-0.5, a, 0.5, a, 0.8, a + 5.6, 0, a + 6.8, -0.8, a + 5.6], '#d62b37', OL, 0.4);
          ln(-3.4, a - 1, -2, a + 6, 'rgba(0,0,0,.18)', 0.5);
          ln(3.4, a - 1, 2, a + 6, 'rgba(0,0,0,.18)', 0.5);
          rect(-5, b - 1.4, 10, 1.4, '#2a2e44');
          stageBadge(a, hd);
        },
        hand: (hx, hy) => {
          const st = p.shootT > 0;
          el(hx + 2.4, hy + 1.4, 3, 0.8, '#f4f7ff', OL, 0.4);
          rr(hx + 0.6, hy - 2.2, 3.6, 3.4, 0.8, '#ffffff', OL, 0.45);
          el(hx + 2.4, hy - 2.2, 1.7, 0.5, '#6a3418');
          ctx.beginPath();
          ctx.arc(hx + 4.4, hy - 0.6, 1, -1.4, 1.4);
          ctx.strokeStyle = OL;
          ctx.lineWidth = 0.45;
          ctx.stroke();
          for (let i = 0; i < 2; i++) {
            const q = (V.TT * 0.03 + i * 0.5) % 1;
            ctx.globalAlpha = (st ? 0.9 : 0.5) * (1 - q);
            ln(
              hx + 2 + i,
              hy - 3 - q * 5,
              hx + 2.6 + i + Math.sin(V.TT * 0.2 + i) * 0.6,
              hy - 4.6 - q * 5,
              '#ffffff',
              0.45,
            );
          }
          ctx.globalAlpha = 1;
          if (st) glow(hx + 2.4, hy - 1, 7, '#e6c6a0', 0.6);
        },
        head: (hx, hy) => {
          headBase(hx, hy, PAL_GD.skin);
          crv(
            [
              hx - 5.2,
              hy + 0.2,
              hx - 5.8,
              hy - 3.6,
              hx - 3.6,
              hy - 7,
              hx + 0.6,
              hy - 8.6,
              hx + 5.4,
              hy - 7.8,
              hx + 7.6,
              hy - 5.6,
              hx + 5.2,
              hy - 4.8,
              hx + 1.6,
              hy - 4.6,
              hx - 1.6,
              hy - 4,
              hx - 3.6,
              hy - 2.2,
              hx - 3.9,
              hy + 0.2,
            ],
            lgr(0, hy - 8, 0, hy - 2, '#7a5232', '#4a2e18'),
            OL,
            0.7,
          );
          ln(hx - 2.4, hy - 6.4, hx + 4.4, hy - 7.2, 'rgba(255,255,255,.35)', 0.8);
          ln(hx - 0.6, hy - 5.4, hx + 4.8, hy - 6.2, 'rgba(255,255,255,.18)', 0.6);
          const bl = blinkOn(6);
          eye(hx + 1.2, hy - 0.8, 0.75, bl);
          eye(hx + 4.6, hy - 0.8, 0.62, bl);
          ln(hx - 0.3, hy - 3.3, hx + 2.5, hy - 3.9, '#4a2e18', 0.8);
          ln(hx + 3.8, hy - 3.9, hx + 5.6, hy - 3.4, '#4a2e18', 0.8);
          el(hx + 0.2, hy + 2, 1.2, 0.6, 'rgba(255,120,120,.35)');
          noseP(hx, hy, PAL_GD.skin);
          if (p.shootT > 0) {
            el(hx + 3.5, hy + 3.8, 1.5, 1.2, '#7a1f2a', OL, 0.45);
          } else {
            ctx.beginPath();
            ctx.moveTo(hx + 1.6, hy + 3.1);
            ctx.quadraticCurveTo(hx + 3.4, hy + 5.2, hx + 5.4, hy + 3);
            ctx.closePath();
            fs('#ffffff', OL, 0.5);
            ln(hx + 1.8, hy + 3.3, hx + 5.2, hy + 3.2, 'rgba(0,0,0,.15)', 0.3);
          }
          if (p.angry) angerFx(hx, hy, 5.2, 5.6);
        },
      }),
    );
  else
    human(
      x,
      y,
      Object.assign(base, {
        sc: (sc || 1) * 0.92,
        bulk: 1.18,
        pal: PAL_GM,
        torso: (a, b) => {
          ln(-3.2, a - 1, -3.6, b - 1, '#e0303e', 1.1);
          ln(3.2, a - 1, 3.6, b - 1, '#e0303e', 1.1);
          rr(1, a + 1, 2.6, 2.2, 0.4, null, '#aab2c8', 0.4);
          ln(1.6, a + 0.4, 1.6, a + 2.2, '#2f6bff', 0.6);
          ln(2.4, a + 0.4, 2.4, a + 2.2, '#e0303e', 0.6);
          ln(3.1, a + 0.4, 3.1, a + 2.2, '#20c2a0', 0.6);
          rect(-5.4, b - 1.4, 10.8, 1.4, '#4a3a20');
          ctx.beginPath();
          ctx.arc(0, a - 1.4, 3.8, 0.2, Math.PI - 0.2);
          ctx.strokeStyle = '#2a3052';
          ctx.lineWidth = 1.2;
          ctx.stroke();
          el(-3.8, a - 0.2, 1.3, 1.6, '#2a3052', OL, 0.4);
          el(3.8, a - 0.2, 1.3, 1.6, '#2a3052', OL, 0.4);
          stageBadge(a, hd);
        },
        hand: (hx, hy) => {
          const st = p.shootT > 0;
          ctx.save();
          ctx.translate(hx + 2.6, hy - 1);
          ctx.rotate(-0.25);
          pth([-3.2, 0, 3.6, -0.4, -3.2, 1.8], '#ffffff', OL, 0.4);
          ln(-3.2, 0.6, 3.6, -0.4, '#9fb4ff', 0.35);
          ctx.restore();
          if (st) glow(hx + 3, hy - 1, 7, '#ffffff', 0.5);
        },
        head: (hx, hy) => {
          headBase(hx, hy, PAL_GM.skin, 5.6, 5.6);
          for (const [cx, cy, rr2] of [
            [-4.6, -1.6, 2.2],
            [-3.8, -4.6, 2.4],
            [-1.2, -6.6, 2.5],
            [1.8, -7.2, 2.4],
            [4.6, -6.2, 2.2],
            [6, -4, 1.7],
            [-5.2, 1, 1.6],
          ])
            ci(hx + cx, hy + cy, rr2, '#2a1a12', OL, 0.5);
          for (const [cx, cy] of [
            [-3, -5.4],
            [0, -7.2],
            [3.2, -7],
          ])
            ci(hx + cx, hy + cy, 0.7, 'rgba(255,255,255,.22)');
          const bl = blinkOn(7);
          eye(hx + 1.4, hy - 0.4, 0.78, bl);
          eye(hx + 4.8, hy - 0.4, 0.64, bl);
          ln(hx - 0.2, hy - 2.8, hx + 2.6, hy - 3.2, '#2a1a12', 0.9);
          ln(hx + 3.8, hy - 3.2, hx + 5.8, hy - 2.8, '#2a1a12', 0.9);
          for (const [fx, fy] of [
            [-0.6, 1.4],
            [0.4, 2],
            [-1.2, 2.2],
            [5.6, 1.6],
          ])
            ci(hx + fx, hy + fy, 0.32, '#b8643a');
          el(hx - 0.4, hy + 2.4, 1.4, 0.8, 'rgba(255,110,110,.32)');
          noseP(hx, hy + 0.2, PAL_GM.skin, 3.6);
          if (p.shootT > 0) el(hx + 3.4, hy + 3.8, 1.4, 1.2, '#7a1f2a', OL, 0.45);
          else {
            ctx.beginPath();
            ctx.arc(hx + 3.4, hy + 3, 1.8, 0.2, 2.8);
            ctx.strokeStyle = OL;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
          if (p.angry) angerFx(hx, hy, 5.6, 5.6);
        },
      }),
    );
}
export function heroDraw(ch, x, y, p, r, sc) {
  if (p.consT > 0) {
    drawCons(x, y, Object.assign({}, p, { form: p.consType == 'laifo' ? 1 : 0, hired: true }), r, sc);
    return;
  }
  if (ch == 2) drawChapel(x, y, p, r, sc);
  else if (ch == 3) drawGiugno(x, y, p, r, sc);
  else if (ch == 4) drawStag(x, y, p, r, sc);
  else if (ch == 5) drawIolanda(x, y, p, r, sc);
  else if (ch == 6) drawOps(x, y, p, r, sc);
  else if (ch == 7) drawRita(x, y, p, r, sc);
  else drawTuono(x, y, p, r, sc);
}
export function drawPlayer(p) {
  const r = rnowPh(p);
  p.angry = isAngry(p);
  const x = ix(p) + p.w / 2,
    y = iy(p) + p.h;
  let a = 1;
  if (p.inv > 0 && !p.dead) a = (p.inv >> 2) % 2 ? 0.35 : 1;
  ctx.globalAlpha = a;
  if (!p.dead && !p.tp) shadow(x, groundY(p, x), 7, 0.3);
  if (p.ch == 0)
    drawAnzuV(x, y, {
      face: p.face,
      air: !p.onGround,
      vy: p.vy,
      flap: p.flap,
      run: p.onGround ? Math.min(1, Math.abs(p.vx) / 2) : 0,
      ph: r.ph,
      land: r.land,
      shoot: p.shootT,
      aura: p.aura,
      sp: p.sp,
      rot: p.dead ? p.dead * 0.15 : 0,
      ang: p.angry,
    });
  else if (p.consT > 0) {
    drawCons(x, y, Object.assign({}, p, { form: p.consType == 'laifo' ? 1 : 0, hired: true }), r);
    if (p.consT < 120 && (G.frame >> 2) % 2) glow(x, y - 14, 18, '#ffffff', 0.4);
  } else heroDraw(p.ch, x, y, p, r);
  if (p.angry && !p.dead) glow(x, y - 14, 16, '#ff3b4a', 0.18 + 0.08 * Math.sin(V.TT * 0.3));
  ctx.globalAlpha = 1;
  if (p.sp >= 100 && !p.dead && G.state == 'play') {
    glow(x, y - 14, 22, '#ffe95c', 0.18 + 0.08 * Math.sin(V.TT * 0.2));
  }
}
function groundY(p, x) {
  if (!G.LV) return GY;
  let best = H + 40;
  const fy = p.y + p.h;
  for (const s of G.LV.plats) {
    if (x >= s.x && x <= s.x + s.w && s.y >= fy - 2 && s.y < best) best = s.y;
  }
  return best > H ? H + 40 : best;
}

/* ------------------------------------------------------------------ */
/* Iolanda, Ops, Sora Rita                                            */
/* ------------------------------------------------------------------ */
const rigOf = (p, r, sc, pal, extra) =>
  Object.assign(
    {
      face: p.face,
      run: p.onGround ? Math.min(1, Math.abs(p.vx) / 2) : 0,
      air: !p.onGround,
      vy: p.vy,
      shoot: p.shootT,
      land: r.land,
      ph: r.ph,
      sc,
      pal,
      rot: p.dead ? p.dead * 0.15 : 0,
    },
    extra,
  );
function lashEye(x, y, r, bl, col) {
  eye(x, y, r, bl, col);
  if (!bl && col) {
    ci(x, y + r * 0.1, r * 0.45, '#0e1430');
    ci(x + r * 0.35, y - r * 0.35, r * 0.34, '#fff');
  }
  if (!bl) {
    ln(x - r * 0.6, y - r * 1.05, x + r * 1.3, y - r * 1.25, OL, 0.55);
    ln(x + r * 1.1, y - r * 1.1, x + r * 1.9, y - r * 1.8, OL, 0.45);
  }
}

/** Iolanda, the Project Manager: big curly blonde hair, blue eyes, headset, coral blazer, pencil skirt, tablet. */
export function drawIolanda(x, y, p, r, sc) {
  const over = p.overT > 0,
    sway = Math.sin(V.TT * 0.12 + (r.ph || 0)) * 1.4 + (p.onGround ? 0 : -p.vy * 0.25);
  human(
    x,
    y,
    rigOf(p, r, sc, PAL_MA, {
      torso: (a, b) => {
        pth([-2.4, a - 1.4, 0, a + 3, 0.2, a - 1.4], '#ffffff', OL, 0.5);
        pth([2.4, a - 1.4, 0, a + 3, -0.2, a - 1.4], '#f4f7ff', OL, 0.5);
        ln(-2.6, a - 1.2, -0.6, a + 5.2, '#a82a38', 0.6);
        ln(2.6, a - 1.2, 0.6, a + 5.2, '#a82a38', 0.6);
        ln(-1.6, a - 1, 1.2, a + 4.4, '#2f6bff', 0.45);
        rr(0.4, a + 4, 2.6, 3.2, 0.5, '#ffffff', OL, 0.35);
        rect(0.7, a + 4.4, 2, 0.8, '#2f6bff');
        // pencil skirt
        pth(
          [-5.2, b - 1.6, 5.2, b - 1.6, 5.8, b + 5.4, -5.8, b + 5.4],
          lgr(0, b, 0, b + 5, '#2c3870', '#1c2450'),
          OL,
          0.7,
        );
        ln(1.6, b + 2.4, 1.8, b + 5.2, 'rgba(255,255,255,.18)', 0.5);
      },
      hand: (hx, hy) => {
        if (p.shootT > 0) {
          rr(hx - 1, hy - 3, 5, 5, 0.4, '#ffe95c', OL, 0.5);
          rect(hx - 1, hy - 3, 5, 1.2, '#f5c400');
        } else {
          rr(hx - 1.4, hy - 5, 7, 9, 1, '#1b2350', OL, 0.5);
          rr(hx - 0.6, hy - 4.2, 5.4, 7.2, 0.5, lgr(0, hy - 4, 0, hy + 3, '#7fd6ff', '#2f6bff'));
          for (let i = 0; i < 3; i++) rect(hx, hy - 3 + i * 2, 1.2 + i * 1.1, 0.9, '#ffd500');
        }
      },
      head: (hx, hy) => {
        // very curly blonde mane behind the head, bouncing a little as she moves
        const bob = (k2, i) => Math.sin(V.TT * 0.14 + i * 1.7) * 0.35 + sway * 0.12 * k2;
        const curl = (cx, cy, r2, i, lit) =>
          ci(
            hx + cx,
            hy + cy + bob(cy > 0 ? 1 : 0.4, i),
            r2,
            rgr(
              hx + cx - r2 * 0.4,
              hy + cy - r2 * 0.4,
              0.3,
              r2,
              lit ? '#fff1a8' : '#ffe27a',
              lit ? '#e8b632' : '#c9921c',
            ),
            OL,
            0.5,
          );
        const back = [
          [-6.6, -5.6, 2.6],
          [-3.6, -8.6, 2.8],
          [0, -9.4, 2.8],
          [3.6, -8.8, 2.6],
          [6.4, -6.2, 2.4],
          [-8, -2, 2.6],
          [-8.2, 1.8, 2.5],
          [-7.2, 5.4, 2.4],
          [-5, 7.6, 2.2],
          [7, -2.6, 2.1],
          [-9.4, 4, 2],
        ];
        back.forEach(([cx, cy, r2], i) => curl(cx, cy, r2, i, false));
        headBase(hx, hy, PAL_MA.skin, 5, 5.6);
        // fringe of ringlets over the forehead and temple
        const front = [
          [-4.6, -4.6, 2],
          [-2, -6.4, 2.1],
          [1, -6.6, 2],
          [3.8, -5.6, 1.8],
          [-5.4, -1.4, 1.8],
          [-4.6, 2.2, 1.6],
        ];
        front.forEach(([cx, cy, r2], i) => curl(cx, cy, r2, i + 20, true));
        for (const [cx, cy] of [
          [-2, -6.4],
          [1, -6.6],
          [-4.6, -4.6],
        ]) {
          ctx.beginPath();
          ctx.arc(hx + cx + 0.3, hy + cy + 0.2, 1, 0.4, 4.4);
          ctx.strokeStyle = 'rgba(160,110,20,.55)';
          ctx.lineWidth = 0.35;
          ctx.stroke();
        }
        const bl = blinkOn(5);
        lashEye(hx + 1.4, hy - 0.5, 0.78, bl, '#2a7fe8');
        lashEye(hx + 4.6, hy - 0.5, 0.68, bl, '#2a7fe8');
        ln(hx - 0.2, hy - 2.7, hx + 2.6, hy - 3.1, '#b8862a', 0.6);
        ln(hx + 3.6, hy - 3.1, hx + 5.6, hy - 2.7, '#b8862a', 0.6);
        noseP(hx, hy, PAL_MA.skin, 3.4);
        ci(hx + 0.4, hy + 2.2, 1.1, 'rgba(255,120,120,.25)');
        if (over) {
          el(hx + 3.4, hy + 4.2, 1.2, 1, '#7a1f2a', OL, 0.4);
        } else {
          ctx.beginPath();
          ctx.moveTo(hx + 2.2, hy + 3.6);
          ctx.quadraticCurveTo(hx + 3.4, hy + 4.6, hx + 4.8, hy + 3.5);
          ctx.strokeStyle = '#c23646';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
        // headset band + mic
        ctx.beginPath();
        ctx.arc(hx - 0.4, hy - 1, 6, Math.PI * 1.05, Math.PI * 1.75);
        ctx.strokeStyle = '#1a1a22';
        ctx.lineWidth = 0.9;
        ctx.stroke();
        el(hx - 4.8, hy + 0.6, 1.4, 2, '#1a1a22', OL, 0.4);
        crv([hx - 4.4, hy + 2, hx - 1, hy + 5, hx + 2.4, hy + 4.8], null, '#1a1a22', 0.6);
        ci(hx + 2.4, hy + 4.8, 0.7, '#3cff7a');
        if (over) {
          for (let i = 0; i < 3; i++) {
            const an = V.TT * 0.15 + (i * P2) / 3;
            rr(hx + Math.cos(an) * 8 - 1.5, hy - 9 + Math.sin(an) * 2 - 1.5, 3, 3, 0.3, '#ffe95c', OL, 0.3);
          }
        }
        if (p.angry) angerFx(hx, hy, 5, 5.6);
      },
    }),
  );
}

/** Ops, the on-call sysadmin: messy hair, stubble, dark circles, hoodie, headphones, pager. */
export function drawOps(x, y, p, r, sc) {
  const ring = p.onCallT != null && p.onCallT < 90 && G.state == 'play';
  human(
    x,
    y,
    rigOf(p, r, sc, PAL_OP, {
      torso: (a, b) => {
        // hood folded behind the neck and drawstrings
        el(0, a - 0.6, 5.4, 2.2, '#22273a', OL, 0.6);
        ln(-1.4, a + 0.4, -1.6, a + 5, '#c9d2f0', 0.45);
        ln(1.4, a + 0.4, 1.6, a + 5, '#c9d2f0', 0.45);
        // tiny terminal prompt on the hoodie
        rr(-2.8, a + 5.4, 5.6, 3.2, 0.6, '#0b0f1a', '#3cff7a', 0.3);
        TX('>_', 0, a + 7.1, 2.2, '#3cff7a', { w: 700 });
        // pager on the belt
        rect(-5, b - 1.3, 10, 1.3, '#14141a');
        rr(2.6, b - 3.4, 3.2, 2.6, 0.4, '#1a1a22', OL, 0.35);
        ci(4.2, b - 2.6, 0.55, ring && (G.frame >> 3) % 2 ? '#ff3b4a' : '#3cff7a');
        // headphones around the neck
        ctx.beginPath();
        ctx.arc(0, a - 1.2, 4.6, 0.15, Math.PI - 0.15);
        ctx.strokeStyle = '#14141a';
        ctx.lineWidth = 0.9;
        ctx.stroke();
        el(-4.4, a - 0.2, 1.3, 1.7, '#3cff7a', OL, 0.4);
        el(4.4, a - 0.2, 1.3, 1.7, '#3cff7a', OL, 0.4);
      },
      hand: (hx, hy) => {
        if (p.shootT > 0) {
          rr(hx - 1.4, hy - 3, 6, 4.4, 0.4, '#3a7bff', OL, 0.5);
          for (let i = 0; i < 3; i++) rect(hx - 0.6 + i * 1.8, hy - 2.4, 0.6, 3.2, '#1b3fa0');
        } else {
          rr(hx - 1, hy - 3.6, 4.2, 5, 0.8, '#f4f7ff', OL, 0.45);
          TX('☕', hx + 1.1, hy - 1.1, 2.6, '#5a3216');
        }
      },
      head: (hx, hy) => {
        headBase(hx, hy, PAL_OP.skin, 5.2, 5.6);
        // messy spiky hair
        pth(
          [
            hx - 5.6,
            hy + 0.6,
            hx - 6.6,
            hy - 3,
            hx - 5,
            hy - 4.4,
            hx - 6,
            hy - 7,
            hx - 2.6,
            hy - 6.2,
            hx - 1.8,
            hy - 8.8,
            hx + 0.8,
            hy - 6.6,
            hx + 3.6,
            hy - 8.4,
            hx + 3.8,
            hy - 5.8,
            hx + 6.8,
            hy - 5.8,
            hx + 5.2,
            hy - 3.4,
            hx + 2,
            hy - 4.2,
            hx - 1,
            hy - 3.6,
            hx - 3.4,
            hy - 2.8,
            hx - 4,
            hy + 0.6,
          ],
          lgr(0, hy - 8, 0, hy, '#4a3424', '#22160e'),
          OL,
          0.6,
        );
        // stubble
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(hx, hy, 5.2, 5.6, 0, 0, P2);
        ctx.clip();
        rect(hx - 6, hy + 2, 12, 5, 'rgba(60,40,30,.22)');
        for (let i = 0; i < 9; i++)
          ci(hx - 2 + (i % 5) * 1.6, hy + 3 + ((i / 5) | 0) * 1.4, 0.18, 'rgba(40,25,15,.6)');
        ctx.restore();
        const bl = blinkOn(7) || (G.frame % 400 < 30 && !ring);
        // dark circles
        for (const [ex, w2] of [
          [1.4, 1.2],
          [4.6, 1],
        ]) {
          ctx.beginPath();
          ctx.arc(hx + ex, hy + 0.1, w2, 0.2, Math.PI - 0.2);
          ctx.strokeStyle = 'rgba(110,60,140,.55)';
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
        eye(hx + 1.4, hy - 0.6, ring ? 0.85 : 0.62, bl);
        eye(hx + 4.6, hy - 0.6, ring ? 0.75 : 0.54, bl);
        ln(hx - 0.2, hy - 2.6, hx + 2.6, hy - (ring ? 3.4 : 2.4), '#22160e', 0.7);
        ln(hx + 3.6, hy - (ring ? 3.4 : 2.4), hx + 5.8, hy - 2.6, '#22160e', 0.7);
        noseP(hx, hy, PAL_OP.skin);
        if (ring) el(hx + 3.4, hy + 4, 1.3, 1.2, '#7a1f2a', OL, 0.4);
        else ln(hx + 2.2, hy + 4, hx + 4.6, hy + 3.8, OL, 0.55);
        if (ring) {
          TX('!', hx + 1, hy - 12 - Math.abs(Math.sin(V.TT * 0.3)) * 2, 6, '#ff3b4a', {
            w: 700,
            sk: OL,
            sw: 1,
          });
        }
        if (p.angry) angerFx(hx, hy, 5.2, 5.6);
      },
    }),
  );
}

/** Sora Rita, the historic switchboard operator: lilac perm, cat-eye glasses, pearls, cardigan. */
export function drawRita(x, y, p, r, sc) {
  const off = p.offT > 0;
  human(
    x,
    y,
    rigOf(p, r, sc, PAL_RI, {
      bulk: 1.08,
      armF: off ? [-0.9, 1.9] : undefined,
      armB: off ? [0.9, -1.9] : undefined,
      torso: (a, b) => {
        pth([-2.2, a - 1.4, 0, a + 1.6, 0, a - 1.4], '#fff4f8', OL, 0.45);
        pth([2.2, a - 1.4, 0, a + 1.6, 0, a - 1.4], '#ffe6f0', OL, 0.45);
        for (let i = 0; i < 7; i++)
          ci(-2.6 + i * 0.87, a + 0.6 + Math.sin((i / 6) * Math.PI) * 1.4, 0.5, '#fffaf0', OL, 0.2);
        for (let i = 0; i < 3; i++) ci(0.2, a + 3.4 + i * 1.8, 0.45, '#ffd500', OL, 0.2);
        // calf-length skirt
        pth(
          [-5.4, b - 1.6, 5.4, b - 1.6, 6.6, b + 7, -6.6, b + 7],
          lgr(0, b, 0, b + 7, '#5a2e6a', '#3e1e4c'),
          OL,
          0.7,
        );
        for (let i = -1; i <= 1; i++) ln(i * 2.6, b, i * 3.2, b + 6.6, 'rgba(255,255,255,.12)', 0.5);
      },
      hand: (hx, hy) => {
        if (off) return;
        if (p.shootT > 0) {
          crv([hx, hy, hx - 2, hy + 3, hx + 1, hy + 4, hx - 1, hy + 6], null, '#1a1a22', 0.5);
        } else {
          // the handset, ready to throw
          rr(hx - 1, hy - 4.4, 2.4, 7.6, 1.1, '#1a1a22', OL, 0.4);
          el(hx + 0.2, hy - 4.4, 1.8, 1.1, '#1a1a22');
          el(hx + 0.2, hy + 3.2, 1.8, 1.1, '#1a1a22');
        }
      },
      head: (hx, hy) => {
        // voluminous perm behind the head
        const curls = [
          [-5.6, -4.6, 2.4],
          [-3, -7.4, 2.6],
          [0.4, -8.2, 2.6],
          [3.6, -7.4, 2.4],
          [-6.6, -1.2, 2.2],
          [-5.6, 2, 1.9],
          [5.6, -5.2, 2],
        ];
        for (const [cx, cy, rr2] of curls)
          ci(hx + cx, hy + cy, rr2, lgr(0, hy + cy - rr2, 0, hy + cy + rr2, '#d8d0ec', '#9a90b8'), OL, 0.55);
        headBase(hx, hy, PAL_RI.skin, 5.1, 5.6);
        for (const [cx, cy, rr2] of [
          [-2.8, -5.6, 1.8],
          [0.4, -6.2, 1.9],
          [3.4, -5.4, 1.6],
        ])
          ci(hx + cx, hy + cy, rr2, lgr(0, hy + cy - rr2, 0, hy + cy + rr2, '#e8e2f6', '#b0a6cc'), OL, 0.5);
        const bl = blinkOn(3) || off;
        eye(hx + 1.4, hy - 0.5, 0.62, bl);
        eye(hx + 4.6, hy - 0.5, 0.55, bl);
        // cat-eye glasses with chain
        const F = '#6a1a4a';
        pth(
          [hx - 0.6, hy - 1.6, hx + 2.8, hy - 2, hx + 3, hy + 0.4, hx - 0.2, hy + 0.6],
          'rgba(255,220,240,.22)',
          F,
          0.6,
        );
        pth(
          [hx + 3.6, hy - 2, hx + 6.6, hy - 2.6, hx + 6.2, hy + 0.4, hx + 3.6, hy + 0.4],
          'rgba(255,220,240,.22)',
          F,
          0.6,
        );
        ln(hx - 0.6, hy - 1.6, hx - 4.4, hy - 0.8, F, 0.6);
        ctx.beginPath();
        ctx.moveTo(hx - 4.2, hy - 0.6);
        ctx.quadraticCurveTo(hx - 4.6, hy + 6, hx - 1, hy + 8.6);
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 0.3;
        ctx.stroke();
        noseP(hx, hy + (off ? -0.6 : 0), PAL_RI.skin, 3.6);
        ci(hx + 0.4, hy + 2.4, 1.2, 'rgba(255,90,130,.3)');
        if (off) {
          ln(hx + 2.4, hy + 4, hx + 4.8, hy + 4.4, OL, 0.6);
          for (let i = 0; i < 3; i++) {
            const k = (V.TT * 0.02 + i / 3) % 1;
            ctx.globalAlpha = 1 - k;
            ci(hx - 6 - k * 6, hy - 10 - k * 6, 1.6 + k * 1.6, '#cfd6ea');
            ctx.globalAlpha = 1;
          }
        } else {
          ctx.beginPath();
          ctx.moveTo(hx + 2.2, hy + 3.6);
          ctx.quadraticCurveTo(hx + 3.4, hy + 4.6, hx + 4.8, hy + 3.6);
          ctx.strokeStyle = '#b8143a';
          ctx.lineWidth = 0.9;
          ctx.stroke();
        }
        ci(hx - 4.6, hy + 1.6, 0.6, '#fffaf0', OL, 0.25);
        if (p.angry) angerFx(hx, hy, 5.1, 5.6);
      },
    }),
  );
}
