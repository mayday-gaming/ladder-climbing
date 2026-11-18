/** @file Ending sequence. */
import { CH } from '../../data/heroes.js';
import { TX, bl, ci, ctx, glass, glow, lgr, pth, shadow, tile } from '../../engine/canvas.js';
import { GY, H, OL, P2, W } from '../../engine/config.js';
import { touchy } from '../../engine/input.js';
import { E, rnd } from '../../engine/math.js';
import { G } from '../../game/state.js';
import { fireworks } from '../fx.js';
import { V } from '../interp.js';
import { GTH, city3, signBig, sky3, vignette } from '../scenery.js';
import { heroAt } from './menus.js';

export function drawEnding() {
  V.camX = V.TT * 0.2;
  bl(sky3(), 0, 0);
  tile(city3(), 0.1, 40);
  V.camX = 0;
  const sg = signBig();
  ctx.save();
  ctx.translate(W / 2, 52);
  ctx.scale(0.7, 0.7);
  bl(sg, -115, -34);
  for (let i = 0; i < 26; i++) {
    const t = i / 26,
      bx = -105 + t * 214 - 2,
      on = (i + (G.frame >> 3)) % 4 == 0;
    ci(bx, 0, 1.4, on ? '#fff6c0' : '#806a20');
    if (on) glow(bx, 0, 6, '#ffe9a0', 0.8);
  }
  ctx.restore();
  glow(W / 2, 75, 110, '#ffd84a', 0.22);
  V.camX = 0;
  GTH[3](-10, W + 20);
  if (G.frame % 26 == 0)
    fireworks.push({
      x: rnd(60, 420),
      y: rnd(30, 110),
      t: 0,
      c: ['#ffd500', '#66f0ff', '#ff4d5e', '#3cff7a', '#ff8ad8'][(Math.random() * 5) | 0],
    });
  for (let i = fireworks.length - 1; i >= 0; i--) {
    const f = fireworks[i];
    if (f.f !== G.frame) {
      f.f = G.frame;
      f.t++;
    }
    if (f.t > 70) {
      fireworks.splice(i, 1);
      continue;
    }
    const k = f.t / 70,
      rr2 = E.out(k) * 36;
    for (let j = 0; j < 16; j++) {
      const a = (j / 16) * P2,
        x = f.x + Math.cos(a) * rr2,
        y = f.y + Math.sin(a) * rr2 + k * k * 14;
      ctx.globalAlpha = 1 - k;
      ci(x, y, 1.1, f.c);
      glow(x, y, 5, f.c, (1 - k) * 0.8);
    }
    ctx.globalAlpha = 1;
    if (f.t < 6) glow(f.x, f.y, 30, '#ffffff', 0.6);
  }
  const ch = G.P ? G.P.ch : 0,
    jy = Math.abs(Math.sin(V.TT * 0.11)) * 12;
  for (let i = 0; i < (ch == 4 ? 2 : 1); i++) {
    const x = ch == 4 ? W / 2 + 70 + i * 32 : W / 2 + 86,
      y = GY - jy;
    shadow(x, GY, 8, 0.3);
    heroAt(ch, i, x, y, 1.6, { onGround: jy < 1, vy: -2, shootT: 0, sp: 100, face: i ? -1 : 1 });
    const cy = y - (ch == 0 ? 52 : 58);
    pth(
      [x - 8, cy + 6, x - 9, cy - 4, x - 4, cy + 1, x, cy - 6, x + 4, cy + 1, x + 9, cy - 4, x + 8, cy + 6],
      lgr(0, cy - 6, 0, cy + 6, '#fff07a', '#f0b800'),
      OL,
      0.8,
    );
    ci(x, cy + 2, 1.3, '#ff3b4a');
    glow(x, cy, 14, '#ffe95c', 0.4);
  }
  bl(vignette(), 0, 0);
  TX("CE L'HAI FATTA!", W / 2, 20, 22, lgr(0, 10, 0, 34, '#fff6a0', '#ffc400'), {
    w: 700,
    sk: '#0a1436',
    sw: 4,
    sh: true,
  });
  TX(
    G.P && G.P.ch == 4
      ? 'TIBERIO E LUIGI: ASSUNTI E AL LIVELLO SUPER'
      : (G.P ? CH[G.P.ch].name : "L'EROE") + ' È AL LIVELLO SUPER',
    W / 2,
    38,
    8.4,
    '#9ff6ff',
    { w: 600, sk: '#0a1436', sw: 1.8 },
  );
  const rk =
    G.score < 90000
      ? 'Obiettivi parzialmente raggiunti'
      : G.score < 150000
        ? 'In linea con le attese'
        : G.score < 220000
          ? 'Oltre le attese'
          : 'LEGGENDA DELLA BIG COMPANY';
  const px = 118;
  glass(px - 100, 126, 200, 66, 10, 0.78);
  TX('PUNTEGGIO FINALE', px, 137, 5.4, '#9fb4ff', { b: 1, w: 900 });
  TX(String(G.score), px, 153, 16, '#ffffff', { w: 700, sk: '#0a1436', sw: 2 });
  TX('Valutazione: ' + rk, px, 170, 5.8, '#ffe95c', { b: 1, w: 900 });
  TX('Record: ' + G.hi, px, 182, 5.2, '#b9c8f0', { b: 1, w: 800 });
  if (G.st > 180 && (G.st >> 4) % 2)
    TX(touchy() ? 'TOCCA PER RIGIOCARE' : 'PREMI INVIO PER RIGIOCARE', W / 2, H - 12, 7, '#ffe95c', {
      w: 700,
      sk: '#0a1436',
      sw: 1.6,
    });
}
