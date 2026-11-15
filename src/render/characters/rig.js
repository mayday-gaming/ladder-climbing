/** @file Shared humanoid rig (heads, faces, limbs) used by all characters. */
import { ci, ctx, el, lgr, limb, ln, rect, rr, rrPath } from '../../engine/canvas.js';
import { OL, P2 } from '../../engine/config.js';
import { V } from '../interp.js';

export function human(x, y, o) {
  const s = o.sc || 1,
    bk = o.bulk || 1,
    run = o.run || 0,
    ph = o.ph || 0,
    air = o.air,
    pal = o.pal;
  let sx = 1,
    sy = 1;
  if (o.land) {
    const q = o.land / 9;
    sy = 1 - 0.15 * q;
    sx = 1 + 0.12 * q;
  } else if (air && o.vy < -2) {
    sy = 1.07;
    sx = 0.95;
  }
  const br = Math.sin((o.t || V.TT) * 0.07) * 0.02;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale((o.face || 1) * s * sx, s * sy);
  if (o.rot) ctx.rotate(o.rot);
  const bob = (air ? 0 : Math.abs(Math.sin(ph)) * 1.1 * run) + (o.lift || 0);
  const la = air ? 0.55 : Math.sin(ph) * 0.85 * run,
    lb = air ? -0.45 : -Math.sin(ph) * 0.85 * run;
  const hipY = -10 - bob,
    shY = -19.6 - bob,
    LW = 2.7 * bk;
  const leg = (hx, an, col, bend) => {
    const kx = hx + Math.sin(an) * 5.2,
      ky = hipY + Math.cos(an) * 5.2,
      sa = an - bend,
      fx = kx + Math.sin(sa) * 5,
      fy = ky + Math.cos(sa) * 5;
    limb(hx, hipY, kx, ky, LW, col);
    limb(kx, ky, fx, fy, LW * 0.92, col);
    el(fx + 1.3, fy - 0.2, 2.5 * bk, 1.4, pal.shoe, OL, 0.7);
    if (pal.sole) rect(fx - 1.1, fy + 0.4, 4.6 * bk, 0.8, pal.sole);
  };
  const bendA = air ? 0.9 : Math.max(0, Math.sin(ph + 1.6)) * 0.9 * run,
    bendB = air ? 0.2 : Math.max(0, Math.sin(ph + 1.6 + Math.PI)) * 0.9 * run;
  const arm = (sx0, an, an2, col, front) => {
    const ex = sx0 + Math.sin(an) * 4.4,
      ey = shY + Math.cos(an) * 4.4,
      hx = ex + Math.sin(an2) * 4.1,
      hy = ey + Math.cos(an2) * 4.1;
    limb(sx0, shY, ex, ey, 2.5 * bk, col);
    limb(ex, ey, hx, hy, 2.3 * bk, col);
    ci(hx, hy, 1.45 * bk, pal.skin, OL, 0.6);
    return [hx, hy];
  };
  const swing = air ? -0.7 : Math.sin(ph) * 0.7 * run;
  if (o.armB) arm(-1.2, o.armB[0], o.armB[1], pal.sleeve2 || pal.shirt2, false);
  else arm(-1.2, -swing * 0.9 - 0.05, -swing * 0.9 + 0.25, pal.sleeve2 || pal.shirt2, false);
  leg(-1.4 * bk, lb, pal.pants2 || pal.pants, bendB);
  leg(1.4 * bk, la, pal.pants, bendA);
  ctx.save();
  ctx.translate(0, hipY);
  ctx.scale(1, 1 + br);
  ctx.translate(0, -hipY);
  const tw2 = 10 * bk;
  rr(
    -tw2 / 2,
    shY - 1.6,
    tw2,
    hipY - shY + 2.2,
    3.2,
    o.torsoFill || lgr(0, shY, 0, hipY, pal.shirt, pal.shirt2),
    OL,
    0.9,
  );
  if (o.torso) o.torso(shY, hipY, bk);
  ctx.restore();
  let hand;
  if (o.armF) hand = arm(1.4, o.armF[0], o.armF[1], pal.sleeve || pal.shirt, true);
  else if (o.shoot > 0) {
    const rc = o.shoot > 5 ? 0.25 : 0;
    hand = arm(1.4 - rc, 1.5, 1.55, pal.sleeve || pal.shirt, true);
  } else hand = arm(1.4, swing * 0.9 + 0.1, swing * 0.9 + (air ? -0.6 : 0.45), pal.sleeve || pal.shirt, true);
  if (o.hand) o.hand(hand[0], hand[1]);
  const hx = 0.9,
    hy = shY - 6.6;
  if (o.head) o.head(hx, hy);
  ctx.restore();
}
export function blinkOn(seed) {
  return (V.TT + seed * 97) % 190 < 6;
}
export function eye(x, y, r, bl, col) {
  if (bl) {
    ln(x - r, y, x + r, y, OL, 0.7);
    return;
  }
  ci(x, y, r, col || '#141a33');
  ci(x + r * 0.35, y - r * 0.35, r * 0.38, '#fff');
}
export function headBase(hx, hy, skin, rx, ry) {
  el(hx - 4.6, hy + 0.8, 1.4, 2, skin, OL, 0.6);
  el(hx, hy, rx || 5.2, ry || 5.6, lgr(hx - 3, hy - 5, hx + 3, hy + 5, lightC(skin), skin), OL, 0.9);
}
function lightC(c) {
  return (
    {
      '#f2c39b': '#ffe0c4',
      '#f4c8a4': '#ffe4cc',
      '#efbd96': '#ffdcc0',
      '#7a4a2a': '#9a6a48',
      '#f1e6ff': '#ffffff',
      '#e9c6a8': '#fbe2cc',
      '#f3c6a0': '#ffe3c8',
    }[c] || c
  );
}
export function noseP(hx, hy, skin, cx, sk) {
  cx = hx + (cx == null ? 3.5 : cx);
  const cy = hy + 1.15;
  el(cx + 0.25, cy, 1.2, 1.2, lgr(cx - 1, cy - 1.2, cx + 1.4, cy + 1.2, lightC(skin), skin));
  ctx.beginPath();
  ctx.ellipse(cx + 0.25, cy, 1.2, 1.2, 0, -1.05, 2.5);
  ctx.strokeStyle = sk || '#b9764f';
  ctx.lineWidth = 0.55;
  ctx.lineCap = 'round';
  ctx.stroke();
  el(cx + 0.55, cy - 0.4, 0.45, 0.3, 'rgba(255,255,255,.55)', null, 0, 0.5);
}
export function specs(hx, hy, round) {
  const y = hy - 0.7,
    F = '#121628';
  ln(hx - 1, y - 0.1, hx - 4.5, y + 0.5, F, 0.8);
  const lens = (cx, rx, ry) => {
    const path = () => {
      ctx.beginPath();
      if (round) ctx.ellipse(cx, y, rx, ry, 0, 0, P2);
      else rrPath(cx - rx, y - ry, rx * 2, ry * 2, 0.7);
    };
    path();
    ctx.fillStyle = 'rgba(190,225,255,.24)';
    ctx.fill();
    ctx.save();
    path();
    ctx.clip();
    ln(cx - rx * 1.1, y + ry * 0.4, cx - rx * 0.1, y - ry * 1.3, 'rgba(255,255,255,.75)', 0.5);
    ln(cx, y + ry * 0.9, cx + rx * 0.7, y - ry * 0.2, 'rgba(255,255,255,.4)', 0.3);
    ctx.restore();
    path();
    ctx.strokeStyle = F;
    ctx.lineWidth = round ? 0.75 : 0.85;
    ctx.stroke();
  };
  lens(hx + 1.2, round ? 2.05 : 2.15, round ? 2.05 : 1.45);
  lens(hx + 4.6, round ? 0.95 : 0.9, round ? 1.9 : 1.4);
  ln(hx + 3.3, y - 0.3, hx + 3.7, y - 0.3, F, 0.8);
  if (!round) {
    ln(hx - 0.95, y - 1.45, hx + 3.35, y - 1.45, F, 1.1);
    ln(hx + 3.7, y - 1.4, hx + 5.5, y - 1.4, F, 1.1);
  }
}
