/** @file Event cards, banners, special-move cut-ins and tally screen. */
import { ANAME, CUT, FLOAT } from '../../data/allies.js';
import { EVD } from '../../data/events.js';
import { BOSS, ORD } from '../../data/levels.js';
import {
  TX,
  ci,
  ctx,
  el,
  glass,
  glow,
  hexA,
  lgr,
  ln,
  pth,
  rect,
  rr,
  rrPath,
  tw,
} from '../../engine/canvas.js';
import { H, OL, P2, W } from '../../engine/config.js';
import { touchy } from '../../engine/input.js';
import { E, clamp, seedR } from '../../engine/math.js';
import { rankOf } from '../../game/progression.js';
import { G } from '../../game/state.js';
import { drawAllyBody } from '../characters/allies.js';
import { V } from '../interp.js';
import { heroAt } from './menus.js';

function evIcon(id, c) {
  const t = V.TT;
  if (id == 'rain') {
    for (let i = 0; i < 6; i++) {
      const f = (t * 0.02 + i * 0.17) % 1,
        x = -26 + ((i * 23) % 52),
        y = -30 + f * 60;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.sin(t * 0.1 + i) * 0.4);
      rr(-7, -4.5, 14, 9, 1.5, '#ffd500', OL, 0.8);
      rect(-7, -1.5, 14, 3, '#1b3fa0');
      ctx.restore();
    }
  } else if (id == 'evac') {
    rr(-30, -20, 60, 40, 4, '#18b858', OL, 1.2);
    rr(8, -14, 16, 28, 1.5, '#eafff0');
    const ph = t * 0.3;
    ci(-10, -9, 4, '#ffffff');
    ln(-10, -5, -12, 6, '#ffffff', 3.4);
    ln(-12, 6, -18 + Math.sin(ph) * 5, 15, '#ffffff', 3);
    ln(-12, 6, -5 - Math.sin(ph) * 5, 15, '#ffffff', 3);
    ln(-11, -2, -2, -3 + Math.sin(ph) * 3, '#ffffff', 2.6);
    ln(-11, -2, -20, 1 - Math.sin(ph) * 3, '#ffffff', 2.6);
  } else if (id == 'slow') {
    ci(0, 0, 26, '#f4f7ff', OL, 1.4);
    ci(0, 0, 22, null, '#c6cee6', 0.8);
    for (let i = 0; i < 12; i++) {
      const a = (i * P2) / 12;
      ln(Math.cos(a) * 19, Math.sin(a) * 19, Math.cos(a) * 22, Math.sin(a) * 22, OL, 1);
    }
    const a1 = t * 0.012,
      a2 = t * 0.001;
    ln(0, 0, Math.cos(a1) * 17, Math.sin(a1) * 17, OL, 1.6);
    ln(0, 0, Math.cos(a2) * 11, Math.sin(a2) * 11, OL, 2.4);
    ci(0, 0, 2, '#ff3b4a', OL, 0.6);
    TX('zzz', 24, -24 + Math.sin(t * 0.05) * 2, 9, '#ffffff', { w: 700, sk: OL, sw: 1.6 });
  } else if (id == 'turbo') {
    for (let i = 0; i < 3; i++) {
      const x = -24 + i * 20 + ((t * 0.6) % 20);
      pth([x - 8, -20, x + 10, 0, x - 8, 20, x - 2, 0], i == 1 ? '#ffffff' : c, OL, 1);
    }
  } else if (id == 'disco') {
    ln(0, -34, 0, -22, '#c6cee6', 1.4);
    ci(0, 0, 22, lgr(-16, -16, 16, 16, '#ffffff', '#9fb4ff', [1, '#5a4a9a']), OL, 1.4);
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, P2);
    ctx.clip();
    for (let i = -3; i <= 3; i++) {
      ln(-24, i * 7, 24, i * 7, 'rgba(10,20,54,.45)', 0.7);
      const x = i * 7 + ((t * 0.15) % 7);
      ln(x, -24, x * 1.3, 24, 'rgba(10,20,54,.45)', 0.7);
    }
    ctx.restore();
    for (let i = 0; i < 8; i++) {
      const a = (i * P2) / 8 + t * 0.03;
      ln(
        Math.cos(a) * 26,
        Math.sin(a) * 26,
        Math.cos(a) * 38,
        Math.sin(a) * 38,
        ['#ff5ad0', '#ffe95c', '#66f0ff', '#3cff7a'][i % 4],
        1.6,
      );
    }
  } else if (id == 'flip') {
    ctx.save();
    ctx.rotate(t * 0.05);
    for (let k = 0; k < 2; k++) {
      ctx.rotate(Math.PI);
      ctx.beginPath();
      ctx.arc(0, 0, 20, 0.3, Math.PI - 0.5);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.stroke();
      pth([-24, 8, -9, 5, -17, -6], '#ffffff');
    }
    ctx.restore();
  } else {
    const j = (Math.random() - 0.5) * 2;
    ctx.save();
    ctx.translate(j, 0);
    for (let i = 0; i < 3; i++) {
      const y = -8 + i * 8;
      ln(-12, y, -24, y - 5 + Math.sin(t * 0.4 + i) * 2, OL, 1.6);
      ln(12, y, 24, y - 5 + Math.cos(t * 0.4 + i) * 2, OL, 1.6);
    }
    el(0, 0, 13, 17, '#ff4d5e', OL, 1.4);
    ci(0, -18, 8, '#c0283a', OL, 1.2);
    ln(0, -10, 0, 16, OL, 1);
    ci(-5, -4, 2, OL);
    ci(5, 3, 2.4, OL);
    ci(-4, 9, 1.6, OL);
    ci(-3, -19, 1.6, '#fff');
    ci(3, -19, 1.6, '#fff');
    ln(-4, -25, -8, -32, OL, 1);
    ln(4, -25, 8, -32, OL, 1);
    ctx.restore();
  }
}
export function drawEvc() {
  const c = G.evc,
    D = EVD[c.id],
    t = c.t + V.A,
    ki = E.out(t / 12),
    ko = E.io((t - 82) / 14),
    a = clamp(ki * (1 - ko), 0, 1);
  rect(0, 0, W, H, 'rgba(2,5,24,' + 0.84 * a + ')');
  ctx.save();
  ctx.globalAlpha = a;
  const bh = 132 * E.back(clamp(t / 14, 0, 1)) * (1 - ko),
    cy = 132;
  rect(0, cy - bh / 2, W, bh, lgr(0, cy - bh / 2, 0, cy + bh / 2, D.c2, '#04081e'));
  rect(0, cy - bh / 2, W, 2.5, D.c);
  rect(0, cy + bh / 2 - 2.5, W, 2.5, D.c);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, cy - bh / 2, W, bh);
  ctx.clip();
  ctx.save();
  ctx.translate(-((V.TT * 0.6) % 24), 0);
  ctx.globalAlpha = a * 0.1;
  for (let x = -H; x < W + 48; x += 24)
    pth([x, cy + 70, x + 10, cy + 70, x + 10 + 140, cy - 70, x + 140, cy - 70], D.c);
  ctx.restore();
  ctx.globalAlpha = a;
  const ixp = 104 - (1 - E.back(clamp((t - 4) / 18, 0, 1))) * 220 - ko * 220;
  glow(ixp, cy, 70, D.c, 0.45);
  ctx.save();
  ctx.translate(ixp, cy);
  ctx.scale(1.5, 1.5);
  evIcon(c.id, D.c);
  ctx.restore();
  ctx.restore();
  const tx = 306 + (1 - E.back(clamp((t - 8) / 18, 0, 1))) * 260 + ko * 260,
    lb = 'EVENTO AZIENDALE',
    lw = tw(lb, 6, { b: 1, w: 900 }) + 16;
  rr(tx - lw / 2, cy - 45, lw, 12, 6, D.c, OL, 0.7);
  TX(lb, tx, cy - 38.6, 6, '#04081e', { b: 1, w: 900 });
  const fsz = Math.min(24, (300 / Math.max(1, tw(c.name, 10, { w: 700 }))) * 10),
    pop = 1 + 0.6 * (1 - E.out(clamp((t - 8) / 12, 0, 1)));
  ctx.save();
  ctx.translate(tx, cy - 10);
  ctx.scale(pop, pop);
  ctx.rotate(-0.03);
  TX(c.name, 1.2, 2.2, fsz, '#04081e', { w: 700, sk: '#04081e', sw: 6 });
  TX(c.name, 0, 0, fsz, lgr(0, -fsz * 0.5, 0, fsz * 0.5, '#ffffff', D.c), { w: 700, sk: '#04081e', sw: 4.2 });
  ctx.restore();
  TX(D.d.slice(0, Math.floor(clamp(t - 18, 0, 999) * 1.6)), tx, cy + 18, 7.4, '#ffffff', {
    b: 1,
    w: 800,
    sk: '#04081e',
    sw: 2,
  });
  ctx.restore();
  ctx.globalAlpha = 1;
  if (t < 6) rect(0, 0, W, H, 'rgba(255,255,255,' + 0.7 * (1 - t / 6) + ')');
}
export function drawBan() {
  const b = G.ban,
    use = b.k == 1,
    D = use ? 84 : 96,
    t = b.t + V.A,
    ki = E.out(t / 10),
    ko = E.io((t - (D - 16)) / 16),
    a = clamp(ki * (1 - ko), 0, 1),
    cy = use ? 112 : 104,
    c1 = use ? '#9ff6ff' : '#ffe95c',
    c2 = use ? '#2f6bff' : '#ff9a00';
  ctx.save();
  ctx.globalAlpha = a;
  const bh = (use ? 34 : 26) * E.back(clamp(t / 12, 0, 1)) * (1 - ko);
  rect(
    0,
    cy - bh / 2,
    W,
    bh,
    lgr(
      0,
      cy - bh / 2,
      0,
      cy + bh / 2,
      'rgba(4,8,30,.15)',
      [0.5, 'rgba(4,8,30,.82)'],
      [1, 'rgba(4,8,30,.15)'],
    ),
  );
  rect(0, cy - bh / 2, W, 1, c1);
  rect(0, cy + bh / 2 - 1, W, 1, c1);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, cy - bh / 2, W, bh);
  ctx.clip();
  for (let i = 0; i < 14; i++) {
    const r = seedR(i * 5 + 1),
      ly = cy - bh / 2 + r() * bh,
      lw = 24 + r() * 70,
      lx = W + 120 - ((r() * 700 + V.TT * (9 + r() * 10)) % (W + 260));
    rect(lx, ly, lw, 0.6 + r() * 1.2, hexA(c1, 0.2 + r() * 0.3));
  }
  ctx.restore();
  glow(W / 2, cy, use ? 150 : 110, c1, 0.35);
  if (use) {
    for (let i = 0; i < 3; i++) {
      const f = clamp((t - i * 9) / 46, 0, 1);
      if (f > 0 && f < 1) {
        ctx.beginPath();
        ctx.ellipse(W / 2, cy, E.out(f) * 250, E.out(f) * 70, 0, 0, P2);
        ctx.strokeStyle = hexA(i % 2 ? '#ffffff' : c1, (1 - f) * 0.9);
        ctx.lineWidth = 3 * (1 - f) + 0.6;
        ctx.stroke();
      }
    }
    ctx.save();
    ctx.translate(W / 2, cy);
    ctx.rotate(V.TT * 0.03);
    for (let i = 0; i < 14; i++) {
      ctx.rotate(P2 / 14);
      pth([0, 0, 170, -7, 170, 7], hexA('#ffffff', 0.07));
    }
    ctx.restore();
  } else {
    for (let i = 0; i < 10; i++) {
      const r = seedR(i * 9 + 2),
        an = r() * P2,
        d = 20 + ((t * 2.4 + r() * 90) % 110),
        sx = W / 2 + Math.cos(an) * d * 1.7,
        sy = cy + Math.sin(an) * d * 0.5,
        ss = 1.4 + r() * 1.6;
      pth(
        [
          sx,
          sy - ss,
          sx + ss * 0.35,
          sy - ss * 0.35,
          sx + ss,
          sy,
          sx + ss * 0.35,
          sy + ss * 0.35,
          sx,
          sy + ss,
          sx - ss * 0.35,
          sy + ss * 0.35,
          sx - ss,
          sy,
          sx - ss * 0.35,
          sy - ss * 0.35,
        ],
        hexA('#fff6a0', clamp(1 - d / 130, 0, 1)),
      );
    }
  }
  if (use) {
    const e = E.back(clamp(t / 16, 0, 1)),
      V = [
        [78, 196, -0.12, 3.6, 1, -200, 40],
        [402, 196, 0.12, 3.6, -1, 200, 40],
        [92, 44, 2.7, 3.2, 1, -160, -120],
        [388, 44, -2.7, 3.2, -1, 160, -120],
        [W / 2, 236, 0, 5.4, 1, 0, 160],
        [0, 0, 0, 0, 1, 0, 0],
      ][b.pose];
    let hx,
      hy,
      hr,
      hs,
      hf = V[4];
    if (b.pose == 5) {
      const f = clamp(t / D, 0, 1);
      hx = -50 + f * (W + 100);
      hy = 150 - Math.sin(f * Math.PI) * 70;
      hr = t * 0.22;
      hs = 2.8;
    } else {
      hx = V[0] + V[5] * (1 - e);
      hy = V[1] + V[6] * (1 - e);
      hr = V[2] + Math.sin(V.TT * 0.12) * 0.05;
      hs = V[3];
    }
    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate(hr);
    ctx.scale(hf, 1);
    glow(0, -12 * hs, 22 * hs, c1, 0.35);
    const o =
      b.ch == 0
        ? { onGround: false, vy: -1, flap: G.frame % 16 < 8 ? 6 : 0, shootT: 9, sp: 100 }
        : {
            shootT: 9,
            run: b.pose == 5 ? 1 : 0,
            ph: V.TT * 0.3,
            vx: b.pose == 5 ? 2 : 0,
            consT: b.consT,
            consType: b.consType,
          };
    heroAt(b.ch, b.form, 0, b.pose == 5 ? 12 * hs : 0, hs, o);
    ctx.restore();
    ctx.globalAlpha = a;
  }
  const fsz = Math.min(use ? 30 : 22, ((W - 70) / Math.max(1, tw(b.txt, 10, { w: 700 }))) * 10),
    pop = 1 + (use ? 1.6 : 0.9) * (1 - E.out(clamp(t / 12, 0, 1))),
    wob = use ? Math.sin(V.TT * 0.5) * 0.012 * clamp(1 - t / 40, 0, 1) * 8 : 0;
  ctx.save();
  ctx.translate(
    W / 2 + (use ? (Math.random() - 0.5) * 2 * clamp(1 - t / 24, 0, 1) : 0),
    cy - (b.sub ? 3 : 0),
  );
  ctx.scale(pop, pop);
  ctx.rotate(-0.03 + wob);
  TX(b.txt, 1.2, 2.4, fsz, '#04081e', { w: 700, sk: '#04081e', sw: 6 });
  TX(b.txt, 0, 0, fsz, lgr(0, -fsz * 0.5, 0, fsz * 0.5, '#ffffff', c1, [1, c2]), {
    w: 700,
    sk: '#04081e',
    sw: 4.4,
  });
  ctx.restore();
  if (b.sub) {
    ctx.globalAlpha = a * clamp((t - 10) / 10, 0, 1);
    const sw2 = tw(b.sub, 5.6, { b: 1, w: 900 }) + 14,
      yy = cy + (use ? 17 : 13);
    rr(W / 2 - sw2 / 2, yy - 5, sw2, 10, 5, use ? c2 : '#04081e', hexA(c1, 0.7), 0.6);
    TX(b.sub, W / 2, yy + 0.3, 5.6, use ? '#ffffff' : (G.frame >> 3) % 2 ? '#ffe95c' : '#ffffff', {
      b: 1,
      w: 900,
    });
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}
export function qFrame(q) {
  const warn = q.ph == 1 && q.dur - q.t < 300,
    c1 = warn ? '#ff4d5e' : '#ffd500',
    c2 = '#0a1436',
    th = 4.5,
    pu = 0.5 + 0.5 * Math.sin(V.TT * (warn ? 0.3 : 0.1));
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, W, H);
  rrPath(th, th, W - th * 2, H - th * 2, 7);
  ctx.clip('evenodd');
  rect(0, 0, W, H, c2);
  ctx.save();
  ctx.translate(-((V.TT * 0.5) % 16), 0);
  for (let x = -H; x < W + 32; x += 16) pth([x, H, x + 8, H, x + 8 + H, 0, x + H, 0], c1);
  ctx.restore();
  ctx.restore();
  ctx.beginPath();
  rrPath(th, th, W - th * 2, H - th * 2, 7);
  ctx.strokeStyle = c2;
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.beginPath();
  rrPath(th + 1.6, th + 1.6, W - th * 2 - 3.2, H - th * 2 - 3.2, 6);
  ctx.strokeStyle = hexA(c1, 0.35 + 0.4 * pu);
  ctx.lineWidth = 0.9;
  ctx.stroke();
  for (const [x, y, sx, sy] of [
    [0, 0, 1, 1],
    [W, 0, -1, 1],
    [0, H, 1, -1],
    [W, H, -1, -1],
  ]) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(sx, sy);
    pth([0, 0, 26, 0, 26, 3, 20, 9, 9, 9, 9, 20, 3, 26, 0, 26], c2, c1, 1);
    pth([4, 4, 15, 4, 4, 15], c1);
    TX('!', 6.6, 6.9, 5.4, c2, { w: 700 });
    ctx.restore();
  }
  const lb = '★ LIVELLO SPECIALE ★',
    lw = tw(lb, 5.4, { b: 1, w: 900 }) + 18;
  pth(
    [W / 2 - lw / 2 - 5, H, W / 2 - lw / 2, H - 12, W / 2 + lw / 2, H - 12, W / 2 + lw / 2 + 5, H],
    c2,
    c1,
    1,
  );
  TX(lb, W / 2, H - 5.6, 5.4, c1, { b: 1, w: 900 });
}
export function drawCut() {
  const c = G.cut,
    D = CUT[c.type],
    t = c.t + V.A,
    ki = E.out(t / 14),
    ko = E.io((t - 104) / 16),
    a = ki * (1 - ko),
    cx = 128;
  rect(0, 0, W, H, 'rgba(2,5,24,' + 0.86 * a + ')');
  ctx.save();
  ctx.globalAlpha = a;
  const bw = (1 - ko) * E.out(t / 18) * (W + 140),
    bx = ko > 0 ? (W + 140) * ko * 1.1 - 70 : -70;
  ctx.save();
  ctx.transform(1, 0, -0.32, 1, 0, 0);
  rect(bx + 60, 58, bw, 150, lgr(0, 58, 0, 208, hexA(D.c, 0.95), D.c2));
  rect(bx + 60, 58, bw, 3, '#ffffff');
  rect(bx + 60, 205, bw, 3, 'rgba(255,255,255,.55)');
  ctx.beginPath();
  ctx.rect(bx + 60, 61, bw, 144);
  ctx.clip();
  for (let i = 0; i < 16; i++) {
    const r = seedR(i * 7 + 3),
      ly = 64 + r() * 138,
      lw = 30 + r() * 90,
      sp = 6 + r() * 9,
      lx = ((r() * 700 + V.TT * sp) % (W + 320)) - 120;
    rect(lx, ly, lw, 0.7 + r() * 1.6, 'rgba(255,255,255,' + (0.18 + r() * 0.3) + ')');
  }
  ctx.restore();
  const px = cx - (1 - E.back(clamp((t - 4) / 20, 0, 1))) * 260 + ko * 520,
    bob = Math.sin(V.TT * 0.09) * 1.5;
  ctx.save();
  ctx.translate(px, 128);
  ctx.rotate(V.TT * 0.012);
  for (let i = 0; i < 12; i++) {
    ctx.rotate(P2 / 12);
    pth([0, 0, 96, -9, 96, 9], 'rgba(255,255,255,.1)');
  }
  ctx.restore();
  glow(px, 128, 96, '#ffffff', 0.5);
  glow(px, 128, 120, D.c, 0.5);
  ctx.save();
  ctx.translate(px, D.y + bob);
  ctx.scale(D.sc, D.sc);
  drawAllyBody(c.type, 0, 0, 1, G.frame, -1, 0, false, 0);
  ctx.restore();
  const q = E.back(clamp((t - 12) / 18, 0, 1)),
    tx = 318 + (1 - q) * 220 + ko * -40;
  ctx.globalAlpha = a * clamp((t - 10) / 10, 0, 1);
  const top = c.play
      ? 'CONSULENZA LAMPO · ORA GIOCHI TU!'
      : c.own
        ? 'ALLEATO IN CAMPO'
        : 'CHIAMATA FALLITA · ' + c.ownName + ' È IN CALL',
    tw0 = tw(top, 7, { b: 1, w: 900 }) + 16;
  rr(
    tx - tw0 / 2,
    84,
    tw0,
    13,
    6.5,
    c.own ? '#04081e' : '#7a0f1c',
    c.own ? 'rgba(255,255,255,.5)' : '#ff8a96',
    0.6,
  );
  TX(top, tx, 90.8, 7, c.own ? ((G.frame >> 3) % 2 ? '#ffe95c' : '#ffffff') : '#ffffff', { b: 1, w: 900 });
  const nm = ANAME[c.type],
    fsz = Math.min(40, (250 / Math.max(1, tw(nm, 10, { w: 700 }))) * 10),
    pop = 1 + 0.5 * (1 - E.out(clamp((t - 12) / 14, 0, 1)));
  ctx.save();
  ctx.translate(tx, 128);
  ctx.scale(pop, pop);
  ctx.rotate(-0.04);
  TX(nm, 1.5, 3, fsz, '#04081e', { w: 700, sk: '#04081e', sw: 7 });
  TX(nm, 0, 0, fsz, '#ffffff', { w: 700, sk: '#04081e', sw: 5 });
  ctx.restore();
  const n = Math.floor(clamp(t - 30, 0, 999) * 1.4);
  TX(c.tag.slice(0, n), tx, 160, 7.6, '#ffffff', { b: 1, w: 800, sk: '#04081e', sw: 2.4 });
  if (!c.own) {
    const qs = E.out(clamp((t - 34) / 16, 0, 1)),
      sx = 450,
      sy = 210 + (1 - qs) * 40,
      dr = Math.sin(V.TT * 0.05) * 0.04;
    ctx.globalAlpha = a * qs;
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(0.1 + dr);
    ctx.scale(1.55, 1.55);
    try {
      ctx.filter = 'grayscale(1) brightness(.8)';
    } catch (e) {}
    drawAllyBody(c.ownType, 0, FLOAT[c.ownType] ? -14 : 0, -1, G.frame >> 1, -1, 0, false, 0);
    ctx.filter = 'none';
    ctx.restore();
    const top2 = sy - (c.ownType == 'mainframe' ? 62 : 54);
    el(sx - 5, top2, 9, 4.6, '#8d97b8', OL, 0.6);
    el(sx + 4, top2 - 1.5, 7, 4.6, '#a3acc8', OL, 0.6);
    el(sx - 1, top2 + 1.8, 10, 3.4, '#8d97b8');
    for (let i = 0; i < 5; i++) {
      const f = ((V.TT * 0.9 + i * 7) % 16) / 16;
      ln(
        sx - 8 + i * 4,
        top2 + 5 + f * 12,
        sx - 8.8 + i * 4,
        top2 + 7.5 + f * 12,
        'rgba(150,200,255,' + (1 - f) + ')',
        0.7,
      );
    }
    const bw2 = tw(c.sad, 5.4, { b: 1, w: 800 }) + 10,
      bx2 = Math.min(sx - 28 - bw2, W - bw2 - 4);
    rr(bx2, sy - 34, bw2, 11, 5, '#e9edf8', OL, 0.6);
    pth([bx2 + bw2 - 6, sy - 23.4, bx2 + bw2 - 1, sy - 23.4, bx2 + bw2 + 3, sy - 19], '#e9edf8', OL, 0.6);
    TX(c.sad, bx2 + bw2 / 2, sy - 28.3, 5.4, '#3a4466', { b: 1, w: 800 });
  }
  ctx.restore();
  ctx.globalAlpha = 1;
  if (t < 8) rect(0, 0, W, H, (c.own ? 'rgba(255,255,255,' : 'rgba(255,90,110,') + 0.8 * (1 - t / 8) + ')');
}
export function drawTally() {
  const k = E.out(clamp(G.st / 20, 0, 1));
  rect(0, 0, W, H, 'rgba(2,6,30,' + 0.7 * k + ')');
  ctx.save();
  ctx.translate(W / 2, H / 2 + (1 - k) * 40);
  ctx.globalAlpha = k;
  glass(-170, -112, 340, 224, 12, 0.85);
  const tk = E.el(clamp(G.st / 30, 0, 1));
  ctx.save();
  ctx.translate(0, -90);
  ctx.scale(tk, tk);
  TX('PROMOSSO!', 0, 0, 24, lgr(0, -12, 0, 12, '#fff6a0', '#ffc400'), {
    w: 700,
    sk: '#0a1436',
    sw: 4,
    sh: true,
  });
  ctx.restore();
  TX(BOSS[ORD[G.lvl]].name + ' · ' + BOSS[ORD[G.lvl]].end, 0, -68, 6.4, '#9fb4ff', { b: 1, w: 900 });
  G.tal.rows.forEach((r, i) => {
    const t0 = 40 + i * 30;
    if (G.st < t0) return;
    const q = E.back(clamp((G.st - t0) / 14, 0, 1));
    const yy = -50 + i * 15;
    ctx.save();
    ctx.translate((1 - q) * -40, 0);
    ctx.globalAlpha = k * q;
    rr(-140, yy - 5.6, 280, 11.2, 5.6, 'rgba(255,255,255,.06)');
    TX(r[0], -132, yy, 6.6, '#e6ecff', { a: 'left', b: 1, w: 800 });
    const v = typeof r[1] == 'number' ? Math.round(r[1] * clamp((G.st - t0) / 24, 0, 1)) : r[1];
    TX('' + v, 132, yy, 7, '#ffe95c', { a: 'right', b: 1, w: 900 });
    ctx.restore();
  });
  const t0 = 40 + G.tal.rows.length * 30;
  if (G.st > t0) {
    const q = E.back(clamp((G.st - t0) / 16, 0, 1));
    ctx.save();
    ctx.translate(0, 22);
    ctx.scale(q, q);
    const cn = G.P.ch == 4 && G.lvl < 2;
    TX(cn ? 'NUOVO CONTRATTO' : 'NUOVO GRADO', 0, -6, 5.4, '#9fb4ff', { b: 1, w: 900 });
    rr(-90, 0, 180, 15, 7.5, lgr(0, 0, 0, 15, '#5ff0de', '#1b8fd0'), OL, 0.7);
    TX((cn && G.lvl == 1 ? 'Tempo indeterminato!' : rankOf(G.lvl + 1)).toUpperCase(), 0, 7.8, 8, '#ffffff', {
      w: 700,
      sk: '#0a1436',
      sw: 1.6,
    });
    ctx.restore();
  }
  if (G.st > t0 + 30) {
    ctx.globalAlpha = k * clamp((G.st - t0 - 30) / 12, 0, 1);
    TX('BENEFIT · ' + G.tal.perk, 0, 52, 6.4, '#ffe95c', { b: 1, w: 900 });
  }
  if (G.st > t0 + 50) {
    ctx.globalAlpha = k * clamp((G.st - t0 - 50) / 12, 0, 1);
    TX('TOTALE  ' + (G.score + G.tal.pend), 0, 70, 9, '#ffffff', { w: 700 });
    if ((G.st >> 4) % 2)
      TX(touchy() ? 'TOCCA PER CONTINUARE' : 'PREMI INVIO PER CONTINUARE', 0, 90, 6, '#9ff6ff', {
        b: 1,
        w: 900,
      });
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}
