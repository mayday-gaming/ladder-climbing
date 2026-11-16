/** @file Boss renderers. */
import { PAL_BERT, PAL_GIGI, PAL_MEL, PAL_PUZ } from '../data/palettes.js';
import {
  TX,
  ci,
  crv,
  ctx,
  el,
  fs,
  glow,
  lgr,
  limb,
  ln,
  pth,
  rect,
  rgr,
  rr,
  shadow,
} from '../engine/canvas.js';
import { GY, OL, W } from '../engine/config.js';
import { E, clamp } from '../engine/math.js';
import { G } from '../game/state.js';
import { drawAsd } from './characters/npcs.js';
import { blinkOn, eye, headBase, human } from './characters/rig.js';
import { hitFlash } from './enemies.js';
import { V, ix, iy, rnow } from './interp.js';

export function drawBoss(b) {
  const X = ix(b),
    Y = iy(b),
    cx = X + b.w / 2,
    by = Y + b.h,
    t = V.TT,
    face = b.face || -1;
  const run = Math.min(1, Math.abs(b.vx || 0) / 1.2),
    r = rnow(b);
  if (r.pf !== G.frame) {
    r.pf = G.frame;
    r.ph = (r.ph || 0) + Math.abs(b.vx || 0) * 0.12 + (run > 0 ? 0 : 0);
  }
  b.onGround = b.y >= GY - b.h - 0.5;
  if (b.i == 3 && (b.st == 'lprep' || b.st == 'laser') && !b.dead) drawLaser(b, cx, Y);
  if (b.i == 5 && b.st == 'glare' && b.t < 56 && b.ga != null && !b.dead) {
    const ex = cx,
      ey = Y + 7,
      lk = b.t >= 42;
    ctx.save();
    ctx.globalAlpha = lk ? 0.9 : 0.35 + 0.25 * ((b.t >> 2) % 2);
    ctx.strokeStyle = '#ff3b4a';
    ctx.lineWidth = lk ? 1.4 : 0.7;
    ctx.setLineDash(lk ? [] : [3, 3]);
    ctx.lineDashOffset = -V.TT;
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    ctx.lineTo(ex + Math.cos(b.ga) * 600, ey + Math.sin(b.ga) * 600);
    ctx.stroke();
    ctx.restore();
    if (lk) glow(ex, ey, 10, '#ff3b4a', 0.8);
  }
  if (b.i != 2 && !b.dead) shadow(cx, GY, b.w * 0.55 * clamp(1 - (GY - by) / 160, 0.3, 1), 0.35);
  ctx.save();
  ctx.globalAlpha = clamp(b.alpha, 0, 1);
  let ox = 0;
  if (b.flash > 0) ox = b.flash % 2 ? 1.2 : -1.2;
  if (b.st == 'tele' || (b.dead && G.state == 'bosswin' && G.st < 90)) ox += Math.sin(t * 3) * 1.2;
  ctx.translate(ox, 0);
  if (b.dead && b.rot) {
    ctx.translate(cx, by - b.h / 2);
    ctx.rotate(b.rot);
    ctx.translate(-cx, -(by - b.h / 2));
  }
  const thr = (per, n) => {
    const k = (b.t % per) / per;
    return [2.9 - E.out(k) * 1.6, 2.7 - E.out(k) * 1.5];
  };
  if (b.i == 0) {
    const ph = b.ph,
      angry = ph > 0;
    const rot = b.st == 'charge' ? 0.22 : 0;
    if (b.st == 'charge') {
      for (let i = 0; i < 4; i++) {
        const ly = by - 8 - i * 7;
        ln(cx - face * (14 + i * 3), ly, cx - face * (26 + i * 5), ly, 'rgba(255,255,255,.5)', 0.8);
      }
    }
    human(cx, by, {
      face,
      run: b.st == 'charge' ? 1 : run,
      ph: r.ph * (b.st == 'charge' ? 1.6 : 1),
      sc: 1.2,
      pal: angry ? Object.assign({}, PAL_GIGI, { skin: '#ff9f86' }) : PAL_GIGI,
      rot,
      armF: b.st == 'throw' ? thr(18) : b.st == 'tele' ? [2.6, 2.9] : null,
      torso: (a, bb) => {
        pth([-3.4, a - 1.4, 0, a + 5, -1.6, bb - 2, -5, bb - 1], '#1a2250', OL, 0.5);
        pth([3.4, a - 1.4, 0, a + 5, 1.6, bb - 2, 5, bb - 1], '#222c62', OL, 0.5);
        pth([-1.8, a - 1.4, 1.8, a - 1.4, 0, a + 4.6], '#f4f7ff');
        pth([-0.7, a, 0.7, a, 1.1, a + 6, 0, a + 7.6, -1.1, a + 6], '#d62b37', OL, 0.4);
        pth([2.6, a + 2.4, 4.4, a + 2.4, 3.5, a + 4], '#ffd500');
      },
      hand: (hx, hy) => {
        ctx.save();
        ctx.translate(hx, hy);
        ctx.rotate(b.st == 'throw' ? -1.2 : -0.3);
        rr(-0.7, -7, 1.4, 8, 0.6, lgr(-1, 0, 1, 0, '#b07a40', '#6e4520'), OL, 0.5);
        rr(-3.4, -9.6, 6.8, 3.4, 1.2, lgr(0, -9.6, 0, -6.2, '#9a6230', '#5a3414'), OL, 0.6);
        rect(-3.4, -8.4, 6.8, 0.8, '#e0b030');
        ctx.restore();
      },
      head: (hx, hy) => {
        headBase(hx, hy, angry ? '#ff9f86' : PAL_GIGI.skin);
        el(hx - 1.4, hy - 4, 2.4, 1.1, 'rgba(255,255,255,.5)', null, 0, -0.3);
        crv(
          [
            hx - 5.4,
            hy + 2,
            hx - 5.8,
            hy - 2.4,
            hx - 4.4,
            hy - 4.6,
            hx - 2.4,
            hy - 3.4,
            hx - 3.4,
            hy - 0.2,
            hx - 3.6,
            hy + 2.4,
          ],
          '#c9cfdf',
          OL,
          0.6,
        );
        const st2 = b.st == 'stun';
        if (st2) {
          for (const ex of [1.8, 5]) {
            ln(hx + ex - 0.8, hy - 1.2, hx + ex + 0.8, hy + 0.4, OL, 0.6);
            ln(hx + ex + 0.8, hy - 1.2, hx + ex - 0.8, hy + 0.4, OL, 0.6);
          }
        } else {
          eye(hx + 1.8, hy - 0.4, 0.7, blinkOn(6));
          eye(hx + 5, hy - 0.4, 0.66, blinkOn(6));
        }
        pth([hx - 0.2, hy - 3, hx + 3.4, hy - 2, hx + 3.4, hy - 1.2, hx, hy - 2], '#e6e9f2', OL, 0.4);
        pth([hx + 4, hy - 2, hx + 6.8, hy - 3, hx + 6.8, hy - 2.2, hx + 4.2, hy - 1.2], '#e6e9f2', OL, 0.4);
        ctx.save();
        ctx.beginPath();
        ctx.rect(hx - 1, hy - 0.4, 9, 3);
        ctx.clip();
        ci(hx + 1.8, hy - 0.4, 2, 'rgba(220,240,255,.3)', OL, 0.7);
        ci(hx + 5.2, hy - 0.4, 1.8, 'rgba(220,240,255,.3)', OL, 0.7);
        ctx.restore();
        el(
          hx + 6,
          hy + 1.2,
          1.8,
          1.6,
          lgr(0, hy, 0, hy + 3, angry ? '#ff8a74' : '#f0b090', '#d08060'),
          OL,
          0.5,
        );
        crv(
          [
            hx + 0.4,
            hy + 3.6,
            hx + 2.4,
            hy + 2,
            hx + 4.6,
            hy + 2.6,
            hx + 6.8,
            hy + 2.2,
            hx + 7.6,
            hy + 4.2,
            hx + 5,
            hy + 3.8,
            hx + 3,
            hy + 4.6,
          ],
          '#e6e9f2',
          OL,
          0.5,
        );
        if (angry)
          for (let i = 0; i < 2; i++) {
            const k = (V.TT * 0.03 + i * 0.5) % 1;
            ci(hx - 5.6 - k * 3, hy - 1 - k * 8, 1 + k * 2.2, 'rgba(255,255,255,' + 0.7 * (1 - k) + ')');
          }
        if (b.st == 'tele' && (b.t >> 2) % 2) {
          TX('!', hx + 2, hy - 11, 10, '#ff3b4a', { sk: '#fff', sw: 2 });
          glow(hx + 2, hy - 11, 10, '#ff3b4a', 0.6);
        }
        if (st2)
          for (let i = 0; i < 3; i++) {
            const a = V.TT * 0.15 + i * 2.1;
            TX('★', hx + 1 + Math.cos(a) * 8, hy - 8 + Math.sin(a) * 2.4, 4.6, '#ffe95c', { sk: OL, sw: 1 });
          }
      },
    });
  } else if (b.i == 1) {
    const sq = b.st == 'jump' ? (b.vy < 0 ? 0.08 : -0.04) : 0;
    human(cx, by, {
      face,
      run,
      ph: r.ph,
      sc: 1.38 * (1 + sq),
      bulk: 1.6,
      pal: PAL_BERT,
      air: !b.onGround,
      vy: b.vy,
      land: r.land,
      armF: b.st == 'throw' ? [1.5 + Math.sin(b.t * 0.2) * 0.15, 1.4] : b.st == 'jump' ? [2.6, 2.8] : null,
      armB: b.st == 'jump' ? [-2.6, -2.8] : null,
      torso: (a, bb, bk) => {
        rr(-7.6, a - 1.4, 3.6, 2.2, 0.8, '#ffd500', OL, 0.4);
        rr(4, a - 1.4, 3.6, 2.2, 0.8, '#ffd500', OL, 0.4);
        pth([3.2, a + 2.2, 4.2, a + 4.6, 2.2, a + 3.6, 4.2, a + 3.6, 2.2, a + 4.6], '#ffd500', OL, 0.3);
        rr(-5.4, a + 0.6, 2.2, 3.6, 0.4, '#1a1f38', OL, 0.4);
        ln(-4.6, a + 0.6, -4.6, a - 2.6, '#1a1f38', 0.5);
        ci(-4.6, a - 2.8, 0.5, '#ff4d5e');
        rect(-8, bb - 1.8, 16, 1.8, '#0b0f22');
        rr(-1.4, bb - 2, 2.8, 2.2, 0.4, '#ffd500');
      },
      hand: (hx, hy) => {
        if (b.st == 'throw') {
          ctx.save();
          ctx.translate(hx + 2, hy - 1);
          ctx.beginPath();
          ctx.arc(0, -2.4, 2.4, Math.PI, 0);
          ctx.strokeStyle = '#cfd6ea';
          ctx.lineWidth = 1.2;
          ctx.stroke();
          rr(-3.2, -2.4, 6.4, 5, 0.8, lgr(0, -2.4, 0, 2.6, '#ffe066', '#d8a800'), OL, 0.5);
          ci(0, 0, 0.7, OL);
          ctx.restore();
        }
      },
      head: (hx, hy) => {
        rr(hx - 5.6, hy - 3, 11.6, 9.6, 3.4, lgr(0, hy - 5, 0, hy + 6, '#f6c8a4', PAL_BERT.skin), OL, 0.9);
        rr(hx - 6, hy - 7.6, 12.2, 5.4, 2.2, lgr(0, hy - 8, 0, hy - 2, '#2a3670', '#141c40'), OL, 0.8);
        rr(hx - 6, hy - 3.8, 12.2, 1.6, 0.6, '#ffd500', OL, 0.4);
        ci(hx + 0.6, hy - 5.4, 1.4, '#ffd500', OL, 0.4);
        pth([hx + 1, hy - 2.2, hx + 9.4, hy - 2.2, hx + 8, hy - 0.6, hx + 1, hy - 0.8], '#0b0f22', OL, 0.5);
        rr(hx - 0.4, hy - 0.4, 8.4, 2.8, 1, '#0b0f22', OL, 0.5);
        el(hx + 2, hy + 0.4, 1.2, 0.5, 'rgba(255,255,255,.5)');
        ln(hx + 2.2, hy + 4.2, hx + 6, hy + 4, OL, 0.8);
        if (b.ph) el(hx + 5.4, hy + 2.6, 1.4, 0.8, 'rgba(255,60,60,.4)');
      },
    });
  } else if (b.i == 2) {
    const fl = Math.sin(t * 0.07) * 2,
      bx = cx,
      yy = by + fl;
    if (b.st == 'appear') {
      ctx.save();
      ctx.globalAlpha = 1 - b.alpha;
      ci(bx, yy - 20, 10 + b.t * 1.4, null, '#ffe95c', 1.2);
      ctx.restore();
    }
    for (let i = 0; i < 3; i++) {
      const a = t * 0.05 + i * 2.1;
      glow(bx + Math.cos(a) * 14, yy - 20 + Math.sin(a) * 10, 3, '#ffe95c', 0.6);
    }
    ctx.save();
    ctx.translate(bx, yy);
    ctx.scale(face, 1);
    const hem = [];
    for (let i = 0; i <= 8; i++) {
      const u = i / 8;
      hem.push(-15 + u * 26, 1 + Math.sin(t * 0.14 + u * 6) * 1.6);
    }
    ctx.beginPath();
    ctx.moveTo(-4, -32);
    ctx.quadraticCurveTo(-16, -18, -16, 1);
    for (let i = 0; i < hem.length; i += 2) ctx.lineTo(hem[i], hem[i + 1]);
    ctx.quadraticCurveTo(10, -18, 4, -32);
    ctx.closePath();
    fs(lgr(-16, 0, 12, 0, '#0f2470', '#2f6bff'), OL, 0.9);
    ctx.beginPath();
    ctx.moveTo(-3, -30);
    ctx.quadraticCurveTo(-12, -16, -13, 0);
    ctx.lineTo(-9, 0);
    ctx.quadraticCurveTo(-8, -16, -1, -30);
    ctx.closePath();
    fs(lgr(0, -30, 0, 0, '#ffe066', '#d8a800'));
    rr(-5, -31, 10, 31, 3, lgr(0, -31, 0, 0, '#1b2a78', '#0b1446'), OL, 0.8);
    rect(-0.8, -29, 1.6, 28, '#ffd500');
    for (let i = 0; i < 4; i++) ci(0, -24 + i * 6, 0.8, '#ffe95c');
    el(0, -31, 7, 2.4, '#ffffff', OL, 0.6);
    for (let i = -6; i <= 6; i += 2) ln(i, -32.6, i * 0.9, -29.4, 'rgba(150,160,200,.6)', 0.4);
    const at = b.st == 'atk';
    if (at) {
      limb(2, -27, 11, -26, 2, '#1b2a78');
      ci(11.5, -26, 1.4, '#f1e6ff', OL, 0.5);
      rr(12, -30, 6, 6, 0.4, '#ffd500', OL, 0.5);
      rr(13.4, -28.6, 3.2, 3.2, 0.4, '#1b3fa0');
    } else {
      limb(2, -27, 4, -18, 2, '#1b2a78');
      ci(4, -17.2, 1.3, '#f1e6ff', OL, 0.5);
    }
    const hx = 0.6,
      hy = -37.6;
    el(hx - 4, hy + 0.8, 1.3, 2.2, '#f1e6ff', OL, 0.5);
    pth([hx - 4.4, hy - 1, hx - 6, hy - 3.6, hx - 3.6, hy - 1.6], '#f1e6ff', OL, 0.5);
    el(hx, hy, 4.8, 5.6, lgr(0, hy - 5, 0, hy + 5, '#ffffff', '#e2d6f6'), OL, 0.9);
    pth(
      [
        hx - 5,
        hy - 1,
        hx - 4.6,
        hy - 5,
        hx - 1,
        hy - 6.4,
        hx + 1,
        hy - 3.6,
        hx + 3,
        hy - 6.2,
        hx + 5.2,
        hy - 4,
        hx + 4.6,
        hy - 2.6,
        hx + 1,
        hy - 4.2,
        hx - 2.4,
        hy - 3.4,
        hx - 3.6,
        hy,
      ],
      '#0d0a1a',
      OL,
      0.5,
    );
    pth(
      [
        hx - 3.4,
        hy - 5.8,
        hx - 2.4,
        hy - 9.4,
        hx - 0.8,
        hy - 7,
        hx + 0.6,
        hy - 10,
        hx + 2,
        hy - 7,
        hx + 3.6,
        hy - 9.4,
        hx + 4.4,
        hy - 5.8,
      ],
      lgr(0, hy - 10, 0, hy - 6, '#fff07a', '#d8a800'),
      OL,
      0.6,
    );
    ci(hx + 0.6, hy - 7.2, 0.8, '#ff3b4a');
    eye(hx + 1.4, hy - 0.6, 0.6, blinkOn(7), '#5a1a8a');
    eye(hx + 4.2, hy - 0.6, 0.55, false, '#5a1a8a');
    ci(hx + 4.2, hy - 0.6, 1.8, 'rgba(255,255,255,.2)', '#ffd500', 0.7);
    ctx.beginPath();
    ctx.moveTo(hx + 5.8, hy + 0.6);
    ctx.quadraticCurveTo(hx + 7, hy + 5, hx + 4, hy + 8);
    ctx.strokeStyle = '#ffd500';
    ctx.lineWidth = 0.4;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(hx + 1, hy + 2.4);
    ctx.quadraticCurveTo(hx + 3, hy + 1.6, hx + 5, hy + 2.4);
    ctx.quadraticCurveTo(hx + 6.2, hy + 1.4, hx + 6.4, hy + 2);
    ctx.strokeStyle = '#0d0a1a';
    ctx.lineWidth = 0.6;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(hx + 3.2, hy + 3.8, 0.9, 0.2, 2.8);
    ctx.stroke();
    ctx.restore();
  } else if (b.i == 3) {
    const k = clamp(-b.vy * 0.045, -0.22, 0.22);
    let sx = 1 - k * 0.7,
      sy = 1 + k;
    if (r.land) {
      const q = r.land / 9;
      sy = 1 - 0.25 * q;
      sx = 1 + 0.22 * q;
    }
    const br = Math.sin(t * 0.08) * 0.03;
    ctx.save();
    ctx.translate(cx, by);
    ctx.scale(face * sx, sy + br);
    el(-8, -1, 4.6, 2.4, '#e07800', OL, 0.7);
    el(8, -1, 4.6, 2.4, '#e07800', OL, 0.7);
    ctx.beginPath();
    ctx.moveTo(-17, -6);
    ctx.bezierCurveTo(-19, -24, -10, -33, 0, -33);
    ctx.bezierCurveTo(10, -33, 19, -24, 17, -6);
    ctx.quadraticCurveTo(15, 0, 0, 0);
    ctx.quadraticCurveTo(-15, 0, -17, -6);
    ctx.closePath();
    fs(rgr(-5, -22, 2, 26, '#ffd36a', '#ffa31a', [1, '#e06a00']), OL, 1.1);
    for (const [sx2, sy2, rr2] of [
      [-11, -10, 2],
      [-6, -5, 1.4],
      [11, -14, 1.6],
      [12, -6, 1.2],
    ])
      ci(sx2, sy2, rr2, 'rgba(200,90,0,.35)');
    el(-6, -26, 5, 2.4, 'rgba(255,255,255,.45)', null, 0, -0.4);
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 3, -32.5);
      ctx.quadraticCurveTo(i * 5 + Math.sin(t * 0.1 + i) * 2, -40, i * 4 + 3, -38);
      ctx.strokeStyle = OL;
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.strokeStyle = '#e07800';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
    const gl = (b.st == 'lprep' || b.st == 'laser') && !b.dead,
      charge = b.st == 'lprep' ? clamp(b.t / 50, 0, 1) : 1;
    const px = clamp(((G.P ? ix(G.P) - X : 0) * face) / 80, -1.6, 1.6);
    for (const ex of [-7, 7]) {
      ci(ex, -20, 7.2, null, '#0f2470', 2.4);
      ci(
        ex,
        -20,
        6.2,
        gl
          ? rgr(ex, -20, 0.5, 6, '#ffffff', '#66f0ff', [1, '#1b7fd0'])
          : lgr(0, -26, 0, -14, '#e6f6ff', '#9fd0ff'),
      );
      if (!gl) {
        ci(ex + px, -19.4, 2.1, '#0b1033');
        ci(ex + px + 0.8, -20.2, 0.7, '#fff');
      } else glow(ex, -20, 10 + charge * 8, '#66f0ff', 0.5 + charge * 0.4);
      pth([ex - 4, -24, ex - 1.6, -25.6, ex + 0.6, -21.6, ex - 1.6, -20.4], 'rgba(255,255,255,.45)');
    }
    ln(-0.6, -21, 0.6, -21, '#0f2470', 2.2);
    ln(-14, -21, -17, -20, '#0f2470', 1.6);
    ln(14, -21, 17, -20, '#0f2470', 1.6);
    if (b.ph == 2) {
      ctx.beginPath();
      ctx.moveTo(4, -25);
      ctx.lineTo(7, -21);
      ctx.lineTo(5.6, -18);
      ctx.lineTo(8.4, -15.4);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 0.6;
      ctx.stroke();
    }
    if (b.st == 'choc') {
      el(0, -8, 4.4, 3.2, '#6a1414', OL, 0.7);
      el(0, -6.4, 2.4, 1.2, '#ff6a7a');
    } else {
      ctx.beginPath();
      ctx.moveTo(-5, -9);
      ctx.quadraticCurveTo(0, -4, 5, -9);
      ctx.strokeStyle = OL;
      ctx.lineWidth = 0.9;
      ctx.stroke();
      rr(-1.2, -8.2, 2.4, 2, 0.4, '#fff', OL, 0.4);
    }
    ctx.restore();
    const sx3 = cx - face * 20,
      sy3 = by - 14 + Math.sin(t * 0.1) * 1.2;
    ln(cx - face * 15, by - 10, sx3, sy3 + 4, '#8a5a2a', 1.2);
    ctx.save();
    ctx.translate(sx3, sy3);
    ctx.rotate(Math.sin(t * 0.08) * 0.12);
    rr(-8, -12, 16, 11, 1.5, '#ffffff', OL, 0.8);
    rect(-8, -12, 16, 3.4, '#1b3fa0');
    TX('OBIETTIVI', 0, -10.2, 2.4, '#ffd500', { w: 700 });
    TX('+200%', 0, -5.2, 4.3, '#1b3fa0', { w: 700 });
    ctx.restore();
  } else if (b.i == 4) {
    const zen = b.st == 'zen',
      throwing = b.st == 'throw' && b.t % 26 < 20 && b.t < 26 * (b.ph ? 3 : 1);
    const lift = zen ? 3 + Math.sin(t * 0.08) * 1.2 : 0;
    if (zen) {
      glow(cx, by - 20 - lift, 34, '#9ff6ff', 0.35);
      ci(cx, by - 20 - lift, 18 + Math.sin(t * 0.1) * 1.5, null, 'rgba(160,240,255,.4)', 0.8);
      for (let i = 0; i < 3; i++) {
        const k = (t * 0.01 + i / 3) % 1;
        TX('z', cx + 10 + k * 6, by - 40 - k * 14, 4 + k * 3, 'rgba(220,240,255,' + (1 - k) + ')', {
          w: 700,
        });
      }
    }
    human(cx, by, {
      face,
      run: zen ? 0 : run,
      ph: r.ph,
      sc: 1.2,
      lift,
      pal: PAL_PUZ,
      armF: throwing ? [2.95, 3.0] : zen ? [0.9, 1.8] : null,
      armB: throwing ? [-2.95, -3.0] : zen ? [-0.9, -1.8] : null,
      torso: (a, bb) => {
        pth([-2.4, a - 1.4, 0, a + 2.4, 2.4, a - 1.4], '#ffffff', OL, 0.5);
        ln(0, a + 2.4, 0, bb - 1, '#4a60b0', 0.6);
        for (let i = 0; i < 3; i++) ci(0.9, a + 3.6 + i * 2.2, 0.45, '#ffd500');
        rr(-4.2, a + 3.8, 2.6, 2.4, 0.6, null, '#4a60b0', 0.5);
      },
      hand: (hx, hy) => {
        if (!throwing && !zen) {
          rr(hx - 0.4, hy - 2.8, 3.6, 4, 0.8, '#ffffff', OL, 0.5);
          ctx.beginPath();
          ctx.arc(hx + 3.4, hy - 0.8, 1.2, -1.4, 1.4);
          ctx.strokeStyle = OL;
          ctx.lineWidth = 0.5;
          ctx.stroke();
          rect(hx, hy - 2.4, 2.8, 0.8, '#d8b060');
          for (let i = 0; i < 2; i++) {
            const k = (t * 0.02 + i * 0.5) % 1;
            ci(
              hx + 1.2 + Math.sin(t * 0.1 + i) * 1,
              hy - 4 - k * 6,
              0.8 + k,
              'rgba(255,255,255,' + 0.5 * (1 - k) + ')',
            );
          }
        }
      },
      head: (hx, hy) => {
        headBase(hx, hy, PAL_PUZ.skin);
        pth(
          [
            hx - 5.4,
            hy,
            hx - 5.4,
            hy - 4.4,
            hx - 2.4,
            hy - 6.6,
            hx + 2.6,
            hy - 6.6,
            hx + 5.4,
            hy - 4.6,
            hx + 5.6,
            hy - 2.6,
            hx + 0.4,
            hy - 4.6,
            hx - 3.4,
            hy - 3.2,
            hx - 4,
            hy + 0.4,
          ],
          '#6a4628',
          OL,
          0.6,
        );
        ln(hx - 2, hy - 5.6, hx + 2, hy - 5.8, 'rgba(255,255,255,.3)', 0.6);
        ctx.strokeStyle = OL;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.arc(hx + 1.8, hy - 0.8, 1, 0.2, 2.9);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(hx + 5, hy - 0.8, 0.9, 0.2, 2.9);
        ctx.stroke();
        el(hx + 1, hy + 1.6, 1.2, 0.7, 'rgba(255,120,120,.35)');
        ctx.beginPath();
        ctx.arc(hx + 3.6, hy + 2.2, 1.5, 0.2, 2.8);
        ctx.stroke();
      },
    });
    if (throwing) {
      const kx = cx,
        ky = by - 49 - lift;
      ctx.save();
      ctx.translate(kx, ky);
      rr(-10, -3, 20, 6, 1.2, lgr(0, -3, 0, 3, '#eef1f8', '#b9c1d8'), OL, 0.7);
      for (let i = 0; i < 7; i++)
        for (let j = 0; j < 2; j++) rr(-8.6 + i * 2.5, -1.8 + j * 2.2, 2, 1.6, 0.3, '#5a6390');
      ctx.restore();
    }
  } else if (b.i == 6) {
    drawAsd({
      x: cx,
      y: by,
      st: b.dead ? 'piange' : b.st == 'enter' || b.st == 'walk' ? 'lamenta' : b.st,
      face,
      vx: b.vx,
      flash: 0,
      sayT: b.dead ? 0 : b.sayT || 0,
      say: b.say || '',
    });
  } else if (b.i == 5) {
    const gl = b.st == 'glare' && !b.dead;
    human(cx, by, {
      face,
      run,
      ph: r.ph,
      sc: 1.2,
      bulk: 0.9,
      pal: PAL_MEL,
      armF: b.st == 'mail' ? [1.5 + Math.sin(b.t * 0.3) * 0.3, 1.5] : [0.3, -0.2],
      torso: (a, bb) => {
        pth([-2.6, a - 1.4, 0, a + 4.6, 2.6, a - 1.4], '#1b2350', OL, 0.5);
        pth([-4, a - 1.4, -1.2, a + 5, -2.6, bb - 1, -4.6, bb - 1], '#f5c400', OL, 0.4);
        pth([4, a - 1.4, 1.2, a + 5, 2.6, bb - 1, 4.6, bb - 1], '#f5c400', OL, 0.4);
        ci(0, a + 6, 0.6, '#1b2350');
      },
      hand: (hx, hy) => {
        if (b.st != 'mail') {
          rr(hx - 1, hy - 4.4, 3.2, 5.6, 0.7, '#141a33', OL, 0.5);
          rect(hx - 0.5, hy - 3.8, 2.2, 4, '#66f0ff');
          glow(hx + 0.6, hy - 2, 5, '#66f0ff', 0.5);
        } else {
          rr(hx, hy - 2.6, 6, 4, 0.6, '#ffffff', OL, 0.5);
          pth([hx, hy - 2.6, hx + 3, hy - 0.4, hx + 6, hy - 2.6], null, '#8a96c0', 0.5, true);
        }
      },
      head: (hx, hy) => {
        crv(
          [
            hx - 5.8,
            hy + 5,
            hx - 6.6,
            hy - 1,
            hx - 4.6,
            hy - 6.8,
            hx + 1,
            hy - 7.4,
            hx + 5.6,
            hy - 5.4,
            hx + 6.8,
            hy - 1,
            hx + 6.6,
            hy + 4.4,
            hx + 4,
            hy + 4.6,
          ],
          '#1a1430',
          OL,
          0.7,
        );
        headBase(hx, hy + 0.2, PAL_MEL.skin, 5, 5.4);
        pth(
          [
            hx - 5.4,
            hy - 1,
            hx - 5,
            hy - 5.2,
            hx - 1,
            hy - 7,
            hx + 4,
            hy - 6.4,
            hx + 6,
            hy - 3.4,
            hx + 6.2,
            hy - 1.4,
            hx + 3,
            hy - 4,
            hx - 2,
            hy - 3.4,
            hx - 3.6,
            hy + 1,
          ],
          '#1a1430',
          OL,
          0.6,
        );
        el(hx - 1, hy - 5, 3, 0.9, 'rgba(255,255,255,.3)', null, 0, -0.2);
        if (gl) {
          for (const ex of [1.8, 4.9]) {
            ci(hx + ex, hy - 0.2, 0.9, '#ff3b4a');
            glow(hx + ex, hy - 0.2, 5, '#ff3b4a', 0.9);
          }
          ln(hx + 0.4, hy - 2.4, hx + 3, hy - 1.6, OL, 0.8);
          ln(hx + 3.8, hy - 1.6, hx + 6.2, hy - 2.4, OL, 0.8);
        } else {
          eye(hx + 1.8, hy - 0.2, 0.7, blinkOn(8));
          eye(hx + 4.9, hy - 0.2, 0.66, blinkOn(8));
          ln(hx + 0.6, hy - 1.2, hx + 2.6, hy - 1.6, OL, 0.6);
          ln(hx + 4, hy - 1.6, hx + 5.8, hy - 1.3, OL, 0.6);
        }
        ln(hx + 2.8, hy + 2.6, hx + 4.8, hy + 2.5, '#d0304a', 0.9);
      },
    });
  }
  ctx.restore();
  hitFlash(cx, by - b.h / 2, b.w * 1.2, b.flash);
}
function drawLaser(b, cx, Y) {
  const by2 = Y + 13,
    on = b.st == 'laser';
  if (!on) {
    const k = clamp(b.t / 50, 0, 1);
    ctx.globalAlpha = 0.25 + 0.35 * ((b.t >> 2) % 2);
    rect(V.camX, by2 - 0.6, W, 1.2, '#ff3b4a');
    ctx.globalAlpha = 1;
    TX('!', V.camX + 14, by2 - 8, 9, '#ff3b4a', { sk: '#fff', sw: 2 });
    TX('!', V.camX + W - 14, by2 - 8, 9, '#ff3b4a', { sk: '#fff', sw: 2 });
    glow(cx - 7, by2 - 6, 6 + k * 10, '#66f0ff', 0.6);
    glow(cx + 7, by2 - 6, 6 + k * 10, '#66f0ff', 0.6);
    return;
  }
  const fl = Math.sin(V.TT * 1.7) * 0.8,
    th = 9 + fl;
  ctx.globalCompositeOperation = 'lighter';
  rect(
    V.camX,
    by2 - th,
    W,
    th * 2,
    lgr(
      0,
      by2 - th,
      0,
      by2 + th,
      'rgba(102,240,255,0)',
      'rgba(102,240,255,.55)',
      [0.5, 'rgba(220,255,255,.9)'],
      'rgba(102,240,255,.55)',
      'rgba(102,240,255,0)',
    ),
  );
  rect(V.camX, by2 - 1.6, W, 3.2, '#ffffff');
  ctx.globalCompositeOperation = 'source-over';
  for (let i = 0; i < 6; i++) glow(V.camX + ((V.TT * 9 + i * 90) % W), by2, 8, '#ffffff', 0.6);
}
