/** @file Leaderboard screens: name entry after a top-10 score and the "Classifica" table. */
import { CH } from '../../data/heroes.js';
import { KEYS, TITLE_BOARD, keyRect } from '../../data/scoreui.js';
import { TX, ci, ctx, glass, glow, lgr, pth, rect, rr, tw } from '../../engine/canvas.js';
import { H, OL, W } from '../../engine/config.js';
import { touchy } from '../../engine/input.js';
import { E, clamp } from '../../engine/math.js';
import { NAME_LEN } from '../../game/scores.js';
import { G } from '../../game/state.js';
import { V } from '../interp.js';
import { heroAt, scenery0 } from './menus.js';

function backdrop() {
  scenery0(V.TT * 0.15);
  rect(0, 0, W, H, lgr(0, 0, 0, H, 'rgba(4,10,40,.8)', 'rgba(2,6,30,.92)'));
  ctx.save();
  ctx.globalAlpha = 0.05;
  const o = (V.TT * 0.3) % 40;
  for (let x = -H; x < W + 40; x += 40)
    pth([x + o, 0, x + o + 14, 0, x + o + 14 - H, H, x + o - H, H], '#ffd500');
  ctx.restore();
}
function trophy(cx, cy, k) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(k, k);
  glow(0, -2, 16, '#ffd500', 0.3);
  pth([-8, -10, 8, -10, 6, 0, 2, 3, -2, 3, -6, 0], lgr(0, -10, 0, 3, '#fff27a', '#e0a400'), OL, 0.8);
  ctx.beginPath();
  ctx.arc(-8, -6, 3, Math.PI / 2, Math.PI * 1.5);
  ctx.arc(8, -6, 3, -Math.PI / 2, Math.PI / 2);
  ctx.strokeStyle = OL;
  ctx.lineWidth = 0.8;
  ctx.stroke();
  rect(-1.4, 3, 2.8, 4, '#e0a400');
  rr(-6, 7, 12, 3.4, 0.8, '#5a3a10', OL, 0.6);
  ci(-3, -7, 1.2, 'rgba(255,255,255,.7)');
  ctx.restore();
}

/** Name entry: big name slots, on-screen keyboard, live typing. */
export function drawNameEntry() {
  backdrop();
  const t = G.st,
    k = E.back(clamp(t / 20, 0, 1));
  ctx.save();
  ctx.translate(W / 2, 26);
  ctx.scale(k, k);
  TX('NUOVO RECORD!', 0, 0, 18, lgr(0, -10, 0, 10, '#fff6a0', '#ffc400'), {
    w: 700,
    sk: '#0a1436',
    sw: 3,
    sh: true,
  });
  ctx.restore();
  trophy(W / 2 - 112, 24, 1.1);
  trophy(W / 2 + 112, 24, 1.1);
  TX(String(G.score).padStart(7, '0') + ' punti · entri in classifica!', W / 2, 46, 6.2, '#cfe0ff', {
    b: 1,
    w: 800,
  });
  if (G.P) {
    el0();
    heroAt(G.P.ch, G.P.form || 0, 70, 132, 2, { run: 0, shootT: (t >> 4) % 4 == 0 ? 8 : 0 });
  }
  TX('COME TI CHIAMI?', W / 2, 64, 7, '#ffe95c', { w: 700 });
  // name slots
  const sw = 22,
    x0 = W / 2 - (NAME_LEN * sw) / 2;
  for (let i = 0; i < NAME_LEN; i++) {
    const c = G.nameBuf[i] || '',
      cur = i == G.nameBuf.length,
      x = x0 + i * sw;
    rr(
      x + 1,
      74,
      sw - 2,
      26,
      4,
      cur ? 'rgba(255,213,0,.2)' : 'rgba(255,255,255,.08)',
      cur ? '#ffd500' : 'rgba(255,255,255,.25)',
      0.8,
    );
    if (c) TX(c, x + sw / 2, 88, 14, '#ffffff', { w: 700, sk: '#0a1436', sw: 1.6 });
    else if (cur && (G.frame >> 4) % 2) rect(x + 6, 94, sw - 12, 2, '#ffd500');
  }
  TX(
    touchy() ? 'Tocca le lettere · OK per salvare' : 'Scrivi il nome · INVIO per salvare · ⌫ per cancellare',
    W / 2,
    112,
    5,
    '#9fb4ff',
    { b: 1, w: 800 },
  );
  // on-screen keyboard
  KEYS.forEach((key, i) => {
    const r = keyRect(i),
      ok = key == 'OK',
      sp = key == '⌫' || key == '␣';
    rr(r.x, r.y + 1.5, r.w, r.h, 4, 'rgba(0,0,0,.35)');
    rr(
      r.x,
      r.y,
      r.w,
      r.h,
      4,
      ok
        ? lgr(0, r.y, 0, r.y + r.h, '#fff07a', '#ffc400')
        : sp
          ? 'rgba(80,110,200,.75)'
          : 'rgba(20,32,90,.85)',
      ok ? OL : 'rgba(255,255,255,.25)',
      0.7,
    );
    TX(key, r.x + r.w / 2, r.y + r.h / 2 + 0.4, ok ? 7 : 7.4, ok ? '#2a1600' : '#ffffff', { w: 700 });
  });
}
function el0() {
  ctx.beginPath();
  ctx.ellipse(70, 132, 20, 3.4, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,.35)';
  ctx.fill();
}

/** Top-10 table; the score just entered blinks. */
export function drawBoard() {
  backdrop();
  const t = G.st;
  trophy(W / 2 - 78, 20, 1);
  TX('CLASSIFICA', W / 2 + 8, 20, 16, lgr(0, 10, 0, 30, '#fff6a0', '#ffc400'), {
    w: 700,
    sk: '#0a1436',
    sw: 3,
    sh: true,
  });
  glass(40, 36, W - 80, 202, 10, 0.7);
  const rows = G.board;
  if (!rows.length) {
    TX('Ancora nessun punteggio.', W / 2, 120, 9, '#ffffff', { w: 700 });
    TX('Gioca una partita e scrivi il tuo nome qui!', W / 2, 136, 6, '#9fb4ff', { b: 1, w: 800 });
  }
  const hx = [62, 92, 236, 322, 420];
  ['#', 'NOME', 'EROE', 'LIVELLO', 'PUNTI'].forEach((h, i) =>
    TX(h, hx[i], 46, 4.4, '#8fa3dc', { a: i == 4 ? 'right' : 'left', b: 1, w: 900 }),
  );
  rows.forEach((e, i) => {
    const y = 58 + i * 18,
      k = E.out(clamp((t - i * 3) / 14, 0, 1)),
      me = i == G.lastRank,
      blink = me && (G.frame >> 3) % 2;
    ctx.save();
    ctx.globalAlpha = k;
    ctx.translate((1 - k) * 30, 0);
    rr(
      48,
      y - 7.5,
      W - 96,
      16,
      8,
      me
        ? blink
          ? 'rgba(255,213,0,.35)'
          : 'rgba(255,213,0,.18)'
        : i % 2
          ? 'rgba(255,255,255,.04)'
          : 'rgba(255,255,255,.08)',
    );
    const medal = ['#ffd500', '#d8e0f0', '#e0904a'][i];
    if (medal) ci(66, y, 6, medal, OL, 0.6);
    TX(String(i + 1), 66, y + 0.4, 6.4, medal ? '#2a1600' : '#ffffff', { w: 700 });
    TX(e.n, hx[1], y + 0.4, 7, me ? '#ffe95c' : '#ffffff', { a: 'left', w: 700 });
    ctx.save();
    ctx.beginPath();
    ctx.rect(hx[2] - 4, y - 8, 20, 16);
    ctx.clip();
    heroAt(e.h, 0, hx[2] + 6, y + 22, 0.9, {});
    ctx.restore();
    const hn = (CH[e.h] || CH[1]).name;
    TX(hn, hx[2] + 18, y + 0.4, 4.8, '#cfe0ff', { a: 'left', b: 1, w: 800 });
    TX(
      e.l == 'FINE' ? '★ FINITO' : 'Livello ' + e.l,
      hx[3],
      y + 0.4,
      4.8,
      e.l == 'FINE' ? '#ffd500' : '#cfe0ff',
      { a: 'left', b: 1, w: 800 },
    );
    TX(String(e.s).padStart(7, '0'), hx[4], y + 0.4, 7, '#ffffff', { a: 'right', w: 700 });
    ctx.restore();
  });
  TX('Classifica salvata su questo dispositivo', W / 2, 246, 4.6, 'rgba(160,185,255,.75)', { b: 1, w: 800 });
  if (t > 30 && (G.frame >> 4) % 2)
    TX(touchy() ? 'TOCCA PER CONTINUARE' : 'PREMI INVIO PER CONTINUARE', W / 2, H - 10, 6.4, '#ffe95c', {
      w: 700,
      sk: '#0a1436',
      sw: 1.4,
    });
}

/** "Classifica" pill on the title screen. */
export function drawTitleBoardButton() {
  const r = TITLE_BOARD,
    lb = touchy() ? '🏆 CLASSIFICA' : '🏆 CLASSIFICA (C)';
  rr(r.x, r.y, r.w, r.h, r.h / 2, 'rgba(20,32,90,.85)', '#ffd500', 0.7);
  TX(lb, r.x + r.w / 2, r.y + r.h / 2 + 0.4, tw(lb, 5.4, { b: 1, w: 900 }) > r.w - 8 ? 4.6 : 5.4, '#ffe95c', {
    b: 1,
    w: 900,
  });
}
