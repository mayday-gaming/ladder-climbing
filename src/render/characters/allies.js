/** @file Ally renderers (Penguin, Mainframe, copier, consultant birds…). */
import { PAL_LF, PAL_TIB } from '../../data/palettes.js';
import { TX, ci, ctx, el, fs, glow, lgr, ln, pth, rect, rr, shadow } from '../../engine/canvas.js';
import { FB, GY, OL, P2, W } from '../../engine/config.js';
import { E, clamp, lerp } from '../../engine/math.js';
import { G } from '../../game/state.js';
import { drawAnzuV } from './heroes.js';
import { blinkOn, eye, headBase, human, noseP } from './rig.js';
import { V, ix, iy } from '../interp.js';

export function drawAllyBody(type, x, y, face, t, act, st, mv, ph) {
  if (type == 'clone') {
    drawAnzuV(x, y, {
      face,
      air: true,
      vy: Math.sin(t / 6),
      flap: t % 24 < 12 ? 6 : 0,
      sc: 0.8,
      aura: 2,
      sp: 0,
    });
    const by = y - 31;
    ci(x + (face > 0 ? -2 : 2), by, 3.2, lgr(0, by - 3, 0, by + 3, '#fff07a', '#e0a800'), OL, 0.6);
    TX('2', x + (face > 0 ? -2 : 2), by + 0.3, 4.6, '#1b3fa0');
    return;
  }
  if (type == 'claudio') {
    const fl = Math.sin(t * 0.12) * 1.2;
    y += fl;
    glow(x, y + 4, 10, '#66f0ff', 0.35);
    el(x, y + 5.2, 3.2, 1.8 + Math.sin(t * 0.8) * 0.5, 'rgba(160,250,255,.8)');
    ln(x, y - 12, x, y - 16, '#9aa6c8', 0.8);
    ci(x, y - 16.6, 1.6, '#ffe95c', OL, 0.4);
    glow(x, y - 16.6, 5, '#ffe95c', 0.6);
    rr(x - 9, y - 12.5, 18, 15, 6, lgr(0, y - 12, 0, y + 3, '#ffffff', '#d4dbef', [1, '#a9b2d0']), OL, 0.9);
    el(x - 9.6, y - 5, 1.6, 3, '#66f0ff', OL, 0.5);
    el(x + 9.6, y - 5, 1.6, 3, '#66f0ff', OL, 0.5);
    rr(x - 6.6, y - 10, 13.2, 9, 3.6, lgr(0, y - 10, 0, y - 1, '#13286a', '#06103a'), OL, 0.6);
    el(x - 2, y - 8.6, 4, 1, 'rgba(255,255,255,.18)');
    const bl = t % 140 < 6;
    if (bl) {
      ln(x - 4, y - 5.6, x - 1.6, y - 5.6, '#66f0ff', 1);
      ln(x + 1.6, y - 5.6, x + 4, y - 5.6, '#66f0ff', 1);
    } else {
      rr(x - 4.2, y - 7.6, 2.4, 3.6, 1.2, '#66f0ff');
      rr(x + 1.8, y - 7.6, 2.4, 3.6, 1.2, '#66f0ff');
    }
    glow(x, y - 5.6, 6, '#66f0ff', 0.4);
    ctx.beginPath();
    ctx.arc(x, y - 3.6, 1.6, 0.3, 2.8);
    ctx.strokeStyle = '#66f0ff';
    ctx.lineWidth = 0.7;
    ctx.stroke();
    return;
  }
  if (type == 'mainframe') {
    ctx.save();
    ctx.translate(x, y);
    const sh = act == -3 ? Math.sin(t * 2) * 0.8 : 0;
    ctx.translate(sh, 0);
    shadow(0, 0, 13, 0.35);
    rr(-12, -4.5, 24, 4.5, 2, '#14182c', OL, 0.6);
    for (let i = -10; i < 11; i += 3.4) ci(i + ((t >> 2) % 2) * 0.8, -2.2, 1, '#3a4170');
    rr(-12, -36, 24, 32, 2, lgr(-12, 0, 12, 0, '#e6e2d2', '#c9c4b0', [1, '#a8a290']), OL, 0.9);
    rect(-11, -35, 22, 1.2, 'rgba(255,255,255,.6)');
    rr(-11, -35, 22, 5, 1, '#2a3660');
    rect(-11, -31, 22, 1, '#ffd500');
    TX('MF-1974', 0, -32.4, 3.4, '#ffd500');
    for (const cx of [-5.2, 5.2]) {
      ci(cx, -24.5, 4.6, '#1a1f38', OL, 0.6);
      ci(cx, -24.5, 3.6, '#3a3220');
      ci(cx, -24.5, 1.4, '#c9c4b0');
      ctx.save();
      ctx.translate(cx, -24.5);
      ctx.rotate(t * 0.18 * (cx > 0 ? 1 : -1));
      for (let i = 0; i < 3; i++) {
        ctx.rotate(P2 / 3);
        rect(-0.35, 1.4, 0.7, 2, '#8a826a');
      }
      ctx.restore();
    }
    rr(-8, -18.4, 16, 7, 1.5, '#06140a', OL, 0.6);
    const ang = act == -2 && st > 0;
    if (ang) {
      pth([-6, -17.2, -3, -15.6, -6, -15.6], '#3cff7a');
      pth([6, -17.2, 3, -15.6, 6, -15.6], '#3cff7a');
    }
    rr(-5.4, -15.8, 2.6, 2.4, 0.6, '#3cff7a');
    rr(2.8, -15.8, 2.6, 2.4, 0.6, '#3cff7a');
    glow(0, -14.6, 8, '#3cff7a', 0.35);
    rect(-2, -12.6, 4, 0.6, '#3cff7a');
    for (let i = 0; i < 7; i++) {
      const on = Math.sin(t * 0.3 + i * 1.7) > 0;
      const c = i % 3 ? '#ff4d5e' : '#3cff7a';
      ci(-9 + i * 3, -8, 0.9, on ? c : '#3a3220');
      if (on) glow(-9 + i * 3, -8, 3, c, 0.6);
    }
    rect(-8, -5.6, 16, 0.8, '#8a826a');
    ctx.restore();
    return;
  }
  if (type == 'tux') {
    const sl = G.tib && G.tib.type == 'tux' && G.tib.slide > 0 && st !== 0,
      wd = mv ? Math.sin((ph || 0) * 2.2) * 0.16 : Math.sin(t * 0.05) * 0.05,
      hop = mv ? Math.abs(Math.sin((ph || 0) * 2.2)) * 1.1 : 0;
    ctx.save();
    ctx.translate(x, y - hop);
    ctx.scale(face, 1);
    if (sl) {
      ctx.translate(0, -3.6);
      ctx.rotate(-1.45);
      for (let i = 0; i < 3; i++)
        ln(-4 - i * 3, 6 + i * 1.6, -10 - i * 3, 6 + i * 1.6, 'rgba(255,255,255,.5)', 0.6);
    } else ctx.rotate(wd);
    el(-2.6, -0.6, 2.6, 1.1, '#ffb020', OL, 0.5);
    el(2.6, -0.6, 2.6, 1.1, '#ffb020', OL, 0.5);
    el(0, -9, 7, 9, lgr(-6, -16, 6, 0, '#2a2a30', '#0d0d12'), OL, 0.9);
    el(0.8, -7.6, 4.6, 6.8, lgr(0, -14, 0, -1, '#ffffff', '#e6e6ea'), null);
    el(-6.4, -8, 1.8, 4.6, '#14141a', OL, 0.6, 0.5);
    el(6.8, -8, 1.8, 4.6, '#14141a', OL, 0.6, -0.5);
    el(-1.6, -14.4, 1.6, 2, '#ffffff', OL, 0.4);
    el(2.6, -14.4, 1.6, 2, '#ffffff', OL, 0.4);
    ci(-1.2, -14, 0.75, '#0a0a0a');
    ci(3, -14, 0.75, '#0a0a0a');
    pth([-0.6, -12.6, 4.4, -11.6, -0.6, -10.6], '#ffb020', OL, 0.5);
    pth([-0.4, -11.6, 3.4, -11.4, -0.4, -10.8], '#e08a00');
    if (act == -2 && st > 0) {
      rr(-6, -28, 14, 7, 1.4, '#0b0f14', '#3cff7a', 0.5);
      TX('#', -3, -24.4, 4, '#3cff7a', { w: 900 });
      TX('sudo', 3, -24.4, 3.6, '#ffffff', { b: 1, w: 800 });
    }
    ctx.restore();
    return;
  }
  if (type == 'capo') {
    const ang = G.tib && G.tib.type == 'capo' ? G.tib.mood == 'angry' : st === 0 ? false : true;
    human(x, y, {
      face,
      run: mv ? 1 : 0,
      ph: ph || 0,
      sc: 1.04,
      pal: {
        skin: '#efc0a0',
        shirt: '#3a3f55',
        shirt2: '#2a2e40',
        sleeve: '#363b52',
        sleeve2: '#262a3a',
        pants: '#2e3346',
        pants2: '#22263a',
        shoe: '#14141a',
      },
      torso: (a, b) => {
        pth([-2.4, a - 1.4, 0, a + 3.2, 0, a - 1.4], '#ffffff', OL, 0.5);
        pth([2.4, a - 1.4, 0, a + 3.2, 0, a - 1.4], '#eef2fb', OL, 0.5);
        pth([-0.5, a, 0.5, a, 0.9, a + 6, 0, a + 7.2, -0.9, a + 6], '#1b3fa0', OL, 0.4);
        ci(-2.4, a + 5, 0.4, '#c9a06a');
      },
      hand: (hx, hy) => {
        rr(hx, hy - 3.2, 2.6, 4.6, 0.6, '#14141a', OL, 0.4);
        rect(hx + 0.4, hy - 2.6, 1.8, 3, ang ? '#ff4d5e' : '#66f0ff');
      },
      head: (hx, hy) => {
        headBase(hx, hy, '#efc0a0');
        pth(
          [
            hx - 5.4,
            hy + 0.4,
            hx - 5.4,
            hy - 4.6,
            hx - 2.4,
            hy - 7,
            hx + 2.4,
            hy - 7.2,
            hx + 5.6,
            hy - 5.4,
            hx + 5.8,
            hy - 4,
            hx + 2.6,
            hy - 5,
            hx - 1.4,
            hy - 4.6,
            hx - 3.8,
            hy - 2.4,
            hx - 4,
            hy + 0.4,
          ],
          '#4a4a52',
          OL,
          0.6,
        );
        el(hx - 4.6, hy - 1.6, 1.2, 2.2, '#9a9aa4');
        const bl = blinkOn(12);
        eye(hx + 1.4, hy - 0.6, 0.72, bl);
        eye(hx + 4.8, hy - 0.6, 0.6, bl);
        if (ang) {
          pth([hx - 0.4, hy - 3.6, hx + 2.8, hy - 2.4, hx + 2.7, hy - 1.8, hx - 0.4, hy - 2.9], '#1a1a1e');
          pth([hx + 3.8, hy - 2.4, hx + 6, hy - 3.6, hx + 6, hy - 2.9, hx + 3.9, hy - 1.8], '#1a1a1e');
        } else {
          ln(hx - 0.2, hy - 3.2, hx + 2.6, hy - 3.6, '#1a1a1e', 0.9);
          ln(hx + 3.8, hy - 3.6, hx + 5.8, hy - 3.2, '#1a1a1e', 0.9);
        }
        noseP(hx, hy, '#efc0a0');
        if (ang) {
          ctx.save();
          ctx.beginPath();
          ctx.ellipse(hx, hy, 5.2, 5.6, 0, 0, P2);
          ctx.clip();
          rect(hx - 6, hy - 6, 12, 12, 'rgba(226,38,24,.38)');
          ctx.restore();
          rr(hx + 1.8, hy + 3.2, 3.8, 1.6, 0.4, '#ffffff', OL, 0.45);
          ln(hx + 3.7, hy + 3.2, hx + 3.7, hy + 4.8, OL, 0.3);
        } else {
          ctx.beginPath();
          ctx.moveTo(hx + 1.4, hy + 2.8);
          ctx.quadraticCurveTo(hx + 3.4, hy + 5.4, hx + 5.6, hy + 2.8);
          ctx.closePath();
          fs('#ffffff', OL, 0.55);
        }
      },
    });
    return;
  }
  if (type == 'copier') {
    const jam = G.tib && G.tib.type == 'copier' && G.tib.jam > 0 && st !== 0,
      lg = mv ? Math.sin(t * 0.45) : 0,
      sh = jam ? Math.sin(t * 2) * 0.6 : 0;
    ctx.save();
    ctx.translate(x + sh, y);
    ctx.scale(face, 1);
    for (const lx of [-7, -2, 3, 8]) {
      const q = (lx % 2 ? lg : -lg) * 1.6;
      ln(lx, -5, lx + q, 0, OL, 1.3);
      ln(lx, -5, lx + q, 0, '#8a96c0', 0.6);
      el(lx + q, 0, 1.2, 0.5, OL);
    }
    rr(-10, -22, 20, 17, 2, lgr(-10, 0, 10, 0, '#eef1f8', '#c9cfdf', [1, '#a9b2c8']), OL, 0.9);
    rect(-9, -21, 18, 1, 'rgba(255,255,255,.7)');
    rr(-10.6, -25.4, 21.2, 3.6, 1.2, '#5a6386', OL, 0.7);
    const sc2 = ((t * 0.6) % 18) - 9;
    rect(sc2, -24.8, 1.6, 2.4, jam ? '#ff4d5e' : '#9ff6a0');
    if (!jam) glow(sc2 + 0.8, -23.6, 4, '#9ff6a0', 0.5);
    rr(-8, -19, 9, 6, 1, '#0f1a48', OL, 0.5);
    const bl = t % 120 < 5;
    if (jam) {
      ln(-6.4, -17.6, -4.6, -16, '#ff4d5e', 0.6);
      ln(-6.4, -16, -4.6, -17.6, '#ff4d5e', 0.6);
      ln(-3, -17.6, -1.2, -16, '#ff4d5e', 0.6);
      ln(-3, -16, -1.2, -17.6, '#ff4d5e', 0.6);
    } else if (bl) {
      ln(-6.4, -16.4, -4.6, -16.4, '#66f0ff', 0.6);
      ln(-3, -16.4, -1.2, -16.4, '#66f0ff', 0.6);
    } else {
      rr(-6.4, -17.8, 1.8, 2.4, 0.6, '#66f0ff');
      rr(-3, -17.8, 1.8, 2.4, 0.6, '#66f0ff');
    }
    for (let i = 0; i < 3; i++) ci(3.4 + i * 2.2, -17.6, 0.8, ['#3cff7a', '#ffd500', '#ff4d5e'][i], OL, 0.3);
    rr(-8.6, -11, 17.2, 3.4, 0.8, '#d4dbef', OL, 0.5);
    rr(-6, -12.4, 12, 2, 0.4, '#ffffff', OL, 0.35);
    for (let i = 0; i < 3; i++) rect(-4.4, -11.9 + i * 0.5, 8, 0.2, '#aab2c8');
    TX('A4', 6.4, -7.2, 2.6, '#5a6386', { w: 900 });
    ctx.restore();
    return;
  }
  if (type == 'tib' || type == 'laifo') {
    const tb = type == 'tib',
      fl = Math.sin(t * (tb ? 0.55 : 0.7)),
      c1 = tb ? '#2fd8c4' : '#4ad87a',
      c2 = tb ? '#0c7a70' : '#1f7a3e',
      bel = tb ? '#c8f7f0' : '#dcf9e4',
      sc2 = tb ? 1 : 0.9;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(face * sc2, sc2);
    ln(-1.6, -3.4, -2.2, 0, '#ff9a20', 0.9);
    ln(1.4, -3.4, 1.6, 0, '#ff9a20', 0.9);
    ln(-3.2, 0, -1, 0, '#ff9a20', 0.7);
    ln(0.4, 0, 2.8, 0, '#ff9a20', 0.7);
    pth([-6, -8, -12.5, -12, -12, -8.6, -13, -6, -6, -6], c2, OL, 0.6);
    el(0, -8, 7, 5.6, lgr(0, -13.6, 0, -2.4, c1, c2), OL, 0.9);
    el(2, -6.8, 4.2, 3.6, bel);
    if (tb) {
      pth([2.4, -12.4, 3.6, -12.4, 4, -8.2, 3, -7, 2, -8.2], '#ffd500', OL, 0.4);
    } else {
      rr(3.4, -9.4, 5.6, 3.6, 0.6, lgr(0, -9, 0, -6, '#cfd6ea', '#8a96c0'), OL, 0.45);
      rect(4, -8.8, 4.4, 2, '#3cc46a');
    }
    ctx.save();
    ctx.translate(-1.4, -9.4);
    ctx.rotate(-0.35 + fl * 0.75);
    pth([0, 0, -9, -2.6, -8, 1, -3.6, 2.6], lgr(0, -3, 0, 3, c1, c2), OL, 0.6);
    ln(-3, 0, -7.4, -1, 'rgba(255,255,255,.35)', 0.5);
    ctx.restore();
    consParts(type, null).head(3, -17.6);
    ctx.restore();
    return;
  }
  const pal = type == 'laifo' ? PAL_LF : PAL_TIB,
    sc = type == 'laifo' ? 0.72 : 1;
  human(
    x,
    y,
    Object.assign(
      { face, run: mv ? 1 : 0, ph: ph || t * 0.12 * (mv ? 1 : 0), sc, pal },
      consParts(type, null),
    ),
  );
}
function consParts(type, p) {
  const pal = type == 'laifo' ? PAL_LF : PAL_TIB;
  return {
    torso: (a, b) => {
      if (type == 'laifo') {
        rr(-2, a + 1, 4, 3, 0.8, '#1f8a45');
        ci(0, a + 2.4, 0.6, '#fff');
      } else {
        pth([-2.6, a - 1.4, 0, a + 2, 0, a - 1.4], '#fff', OL, 0.5);
        pth([2.6, a - 1.4, 0, a + 2, 0, a - 1.4], '#f0f0f0', OL, 0.5);
        pth([-0.6, a, 0.6, a, 1, a + 6, 0, a + 7.4, -1, a + 6], '#ffd500', OL, 0.5);
      }
      if (p) {
        const hd = p.hired,
          bc = hd ? '#2f6bff' : '#e8293b';
        ln(-1.8, a - 1.2, -2.4, a + 2.4, bc, 0.5);
        ln(1.6, a - 1.2, -2.4, a + 2.4, bc, 0.5);
        rr(-4.3, a + 2.2, 3.8, 2.9, 0.4, '#ffffff', OL, 0.3);
        rect(-4.3, a + 2.2, 3.8, 1, bc);
        TX(hd ? 'BC' : 'V', -2.4, a + 4.1, 1.6, bc, { w: 900 });
      }
    },
    hand: (hx, hy) => {
      rr(hx - 1, hy - 1, 7, 4.4, 0.8, lgr(0, hy - 1, 0, hy + 3, '#cfd6ea', '#8a96c0'), OL, 0.6);
      rect(hx, hy, 5, 2.2, type == 'laifo' ? '#3cc46a' : '#66f0ff');
      if (p && p.shootT > 0) glow(hx + 3, hy + 1, 7, type == 'laifo' ? '#3cc46a' : '#66f0ff', 0.7);
    },
    head: (hx, hy) => {
      headBase(hx, hy, pal.skin);
      if (type == 'laifo') {
        pth(
          [
            hx - 5.4,
            hy,
            hx - 5.2,
            hy - 4.6,
            hx - 2,
            hy - 6.8,
            hx + 3,
            hy - 6.4,
            hx + 5.6,
            hy - 3.6,
            hx + 2,
            hy - 4.4,
            hx - 2,
            hy - 3.4,
            hx - 3.8,
            hy,
          ],
          '#3a2a20',
          OL,
          0.6,
        );
        const bl = blinkOn(5);
        eye(hx + 1.6, hy - 0.2, 0.8, bl);
        eye(hx + 5, hy - 0.2, 0.75, bl);
        ci(hx + 1.6, hy - 0.3, 2.3, 'rgba(220,240,255,.3)', OL, 1);
        ci(hx + 5.2, hy - 0.3, 2.1, 'rgba(220,240,255,.3)', OL, 1);
        ctx.beginPath();
        ctx.arc(hx + 3.6, hy + 3.1, 1.2, 0.2, 2.8);
        ctx.strokeStyle = OL;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      } else {
        pth(
          [
            hx - 5.4,
            hy - 0.4,
            hx - 5,
            hy - 4.8,
            hx - 1,
            hy - 6.8,
            hx + 4,
            hy - 6,
            hx + 6,
            hy - 3.4,
            hx + 1,
            hy - 4.4,
            hx - 3,
            hy - 3.8,
            hx - 4,
            hy,
          ],
          '#14100e',
          OL,
          0.6,
        );
        ln(hx - 2, hy - 5.6, hx + 3, hy - 5.4, 'rgba(255,255,255,.3)', 0.6);
        const bl = blinkOn(4);
        eye(hx + 1.9, hy - 0.4, 0.75, bl);
        eye(hx + 5, hy - 0.4, 0.7, bl);
        ctx.beginPath();
        ctx.arc(hx + 3.6, hy + 2.4, 1.6, 0.15, 2.6);
        ctx.strokeStyle = OL;
        ctx.lineWidth = 0.7;
        ctx.stroke();
        rect(hx + 2.6, hy + 3.1, 1.8, 0.6, '#fff');
      }
      if (type == 'laifo') noseP(hx, hy + 0.5, pal.skin, 3.4);
      else noseP(hx, hy - 0.2, pal.skin, 3.5, '#4a2a16');
    },
  };
}
export function drawCons(x, y, p, r, sc) {
  const type = p.form ? 'laifo' : 'tib',
    pal = type == 'laifo' ? PAL_LF : PAL_TIB;
  human(
    x,
    y,
    Object.assign(
      {
        face: p.face,
        run: p.onGround ? Math.min(1, Math.abs(p.vx) / 2) : 0,
        air: !p.onGround,
        vy: p.vy,
        shoot: p.shootT,
        land: r.land,
        ph: r.ph,
        sc: (sc || 1) * (type == 'laifo' ? 0.84 : 1),
        pal,
        rot: p.dead ? p.dead * 0.15 : 0,
      },
      consParts(type, p),
    ),
  );
}
export function drawTib() {
  for (const q of G.tposts) {
    const x = ix(q),
      y = iy(q);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(V.TT * 0.3);
    rr(-3, -3, 6, 6, 0.6, '#ffe95c', OL, 0.5);
    rect(-3, -3, 6, 1.4, '#e0b000');
    ctx.restore();
  }
  const b = G.tib;
  if (!b) return;
  const x = b._x == null ? b.x : lerp(b._x, b.x, V.A);
  let y;
  if (b.type == 'claudio') {
    y = b._fy == null ? b.fy : lerp(b._fy, b.fy, V.A);
    const px = ix(G.P) + 6,
      py = iy(G.P) + 4;
    ctx.globalAlpha = 0.35 + 0.15 * Math.sin(b.t / 5);
    ctx.strokeStyle = '#66f0ff';
    ctx.lineWidth = 0.7;
    ctx.setLineDash([1.5, 2]);
    ctx.lineDashOffset = -V.TT * 0.4;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo((x + px) / 2, y - 6, px, py);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
    drawAllyBody('claudio', x, y, b.face, b.t, b.act, b.st);
  } else if (b.type == 'clone') {
    y = b._fy == null ? b.fy : lerp(b._fy, b.fy, V.A);
    drawAllyBody('clone', x, y, b.face, b.t, b.act, b.st);
  } else if (b.type == 'tib' || b.type == 'laifo') {
    y = b._fy == null ? b.fy : lerp(b._fy, b.fy, V.A);
    shadow(x, GY, 5, 0.15);
    drawAllyBody(b.type, x, y, b.face, b.t, b.act, b.st);
  } else {
    y = b._gy == null ? b.gy : lerp(b._gy, b.gy, V.A);
    shadow(x, y, 7, 0.3);
    const r = b._r || (b._r = { ph: 0 });
    if (r.f !== G.frame) {
      r.f = G.frame;
      r.ph += Math.abs(b.vx) * 0.16;
    }
    drawAllyBody(b.type, x, y, b.face, b.t, b.act, b.st, Math.abs(b.vx) > 0.25, r.ph);
  }
  if (b.st > 0) {
    let by =
      y -
      ({ laifo: 30, claudio: 28, clone: 47, mainframe: 55, tib: 32, tux: 34, copier: 40, capo: 52 }[b.type] ||
        50);
    if (b.type == 'tib' && b.act == 0 && false) {
      ln(x, y - 30, x, y - 50, '#8a96c0', 1);
      rr(x - 16, y - 66, 32, 18, 1.5, '#ffffff', OL, 0.7);
      rect(x - 16, y - 66, 32, 3, '#1b3fa0');
      for (let i = 0; i < 4; i++) {
        const hh = [5, 9, 7, 11][i];
        rr(x - 11 + i * 6, y - 50 - hh, 4, hh, 0.6, ['#2f6bff', '#ffd500', '#20c2a0', '#ff4d5e'][i]);
      }
      by = y - 80;
    }
    bubble(
      b.txt,
      x,
      by,
      {
        claudio: '#e2fbff',
        laifo: '#e8ffee',
        clone: '#fff7cf',
        mainframe: '#dcffe6',
        tux: '#e6ffe6',
        copier: '#f4f7ff',
        capo: b.mood == 'angry' ? '#ffe0e0' : '#fff7e0',
      }[b.type] || '#ffffff',
      b.st,
    );
  }
}
export function bubble(txt, x, y, bg, st) {
  const a = st != null ? clamp(Math.min(st, 110 - st + 20) / 10, 0, 1) : 1;
  const s = 0.85 + 0.15 * E.back(clamp((st != null ? 110 - st : 20) / 10, 0, 1));
  ctx.font = '800 6px ' + FB;
  const w = ctx.measureText(txt).width + 9,
    h = 10.5;
  let bx = clamp(x - w / 2, V.camX + 3, V.camX + W - w - 3);
  ctx.save();
  ctx.globalAlpha = a;
  ctx.translate(x, y + h);
  ctx.scale(s, s);
  ctx.translate(-x, -y - h);
  rr(bx + 0.6, y + 1, w, h, 4, 'rgba(3,8,34,.35)');
  rr(bx, y, w, h, 4, bg || '#fff', OL, 0.7);
  pth(
    [
      clamp(x - 2, bx + 3, bx + w - 7),
      y + h - 0.4,
      clamp(x + 2, bx + 7, bx + w - 3),
      y + h - 0.4,
      x,
      y + h + 3.4,
    ],
    bg || '#fff',
  );
  ln(clamp(x - 2, bx + 3, bx + w - 7), y + h, x, y + h + 3.4, OL, 0.7);
  ln(clamp(x + 2, bx + 7, bx + w - 3), y + h, x, y + h + 3.4, OL, 0.7);
  TX(txt, bx + w / 2, y + h / 2 + 0.3, 6, '#0f1a48', { b: 1, w: 800 });
  ctx.restore();
}
