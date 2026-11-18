/** @file Boot, title and hero-select screens. */
import { ALLY_OF, FLOAT } from '../../data/allies.js';
import { CH, HORD, SEL } from '../../data/heroes.js';
import { LNAME, ORD } from '../../data/levels.js';
import { GO_MENU, PAUSE_ITEMS, pauseItemRect } from '../../data/pause.js';
import {
  TX,
  bl,
  ci,
  ctx,
  el,
  fs,
  glass,
  glow,
  lgr,
  pth,
  rect,
  rgr,
  rr,
  rrPath,
  shadow,
  tw,
} from '../../engine/canvas.js';
import { GY, H, OL, W } from '../../engine/config.js';
import { Snd } from '../../engine/audio.js';
import { touchy } from '../../engine/input.js';
import { E, clamp } from '../../engine/math.js';
import { G } from '../../game/state.js';
import { bubble, drawAllyBody } from '../characters/allies.js';
import { drawAnzuV, heroDraw } from '../characters/heroes.js';
import { bars, stamp } from '../hud.js';
import { V } from '../interp.js';
import { lamp } from '../pickups.js';
import { GTH, drawBG, drawPlat, vignette } from '../scenery.js';

export function drawGameOver() {
  const k = E.out(clamp(G.st / 30, 0, 1));
  rect(0, 0, W, H, 'rgba(2,6,30,' + 0.8 * k + ')');
  stamp('LICENZIATO!', W / 2, 96, clamp(G.st / 24, 0, 1), '#ff3b4a', -0.1);
  ctx.globalAlpha = clamp((G.st - 20) / 20, 0, 1);
  TX('(scherzo: alla Big Company non si licenzia nessuno)', W / 2, 134, 6.4, '#cfe0ff', { b: 1, w: 800 });
  TX('Punteggio  ' + G.score, W / 2, 152, 9, '#ffffff', { w: 700 });
  TX('Record  ' + G.hi, W / 2, 166, 7, '#ffe95c', { b: 1, w: 900 });
  if ((G.st >> 4) % 2 && G.st > 60)
    TX(
      touchy() ? 'TOCCA PER RIPROVARE IL PIANO' : 'PREMI INVIO PER RIPROVARE IL PIANO',
      W / 2,
      192,
      7,
      '#9ff6ff',
      { b: 1, w: 900 },
    );
  if (G.st > 60) {
    const r = GO_MENU;
    rr(r.x, r.y, r.w, r.h, r.h / 2, 'rgba(20,32,90,.85)', 'rgba(255,255,255,.4)', 0.7);
    TX(
      touchy() ? '⌂ MENU PRINCIPALE' : '⌂ MENU PRINCIPALE (ESC)',
      r.x + r.w / 2,
      r.y + r.h / 2 + 0.3,
      5.4,
      '#ffffff',
      {
        b: 1,
        w: 900,
      },
    );
  }
  ctx.globalAlpha = 1;
}
export function drawPause() {
  const t = V.TT,
    tch = touchy();
  rect(0, 0, W, H, 'rgba(2,6,30,.78)');
  ctx.save();
  ctx.globalAlpha = 0.05;
  const o = (t * 0.3) % 40;
  for (let x = -H; x < W + 40; x += 40)
    pth([x + o, 0, x + o + 14, 0, x + o + 14 - H, H, x + o - H, H], '#ffd500');
  ctx.restore();
  // title
  coffeeCup(W / 2 - 92, 30, 0.9);
  TX('PAUSA CAFFÈ', W / 2 + 8, 30, 17, lgr(0, 20, 0, 40, '#fff6a0', '#ffc400'), {
    w: 700,
    sk: '#0a1436',
    sw: 3,
    sh: true,
  });
  // left card: the hero on a coffee break + run stats
  glass(24, 66, 176, 168, 12, 0.7);
  rr(24, 66, 176, 168, 12, null, 'rgba(255,213,0,.35)', 0.8);
  const p = G.P;
  if (p) {
    glow(80, 150, 46, '#ffd500', 0.1);
    el(80, 170, 22, 3.5, 'rgba(0,0,0,.4)');
    heroAt(p.ch, p.form || 0, 78, 170, 2.2, { face: 1, hp: p.hp, maxHp: p.maxHp, caf: p.caf });
    coffeeCup(112, 118, 0.55);
    const lines = [
      'Il capo non ti vede.',
      'Macchinetta: 0,60 €.',
      'Hai 5 minuti. Forse 4.',
      'Il ticket può aspettare.',
      'Zucchero? No, grazie.',
      'Si parla del fantacalcio.',
    ];
    bubble(lines[((t / 240) | 0) % lines.length], 120, 96, '#fff7cf', 92);
    const stat = (lb, v, y) => {
      TX(lb, 38, y, 4.4, '#8fa3dc', { a: 'left', b: 1, w: 900 });
      TX(v, 186, y, 5.6, '#ffffff', { a: 'right', b: 1, w: 900 });
    };
    rr(34, 182, 156, 44, 7, 'rgba(255,255,255,.06)');
    stat('LIVELLO', LNAME[ORD[G.lvl]] ? LNAME[ORD[G.lvl]].split('·')[1].trim() : '—', 190);
    stat('PUNTEGGIO', String(G.score).padStart(7, '0'), 201);
    stat('VITE · BUONI · TICKET', G.lives + ' · ' + p.coins + ' · ' + p.bombs, 212);
    stat('EROE', CH[p.ch].name, 223);
  }
  // menu entries
  PAUSE_ITEMS.forEach((it, k) => {
    const r = pauseItemRect(k),
      sel = k == G.pSel,
      conf = sel && G.pConfirm > 0 && (it.id == 'menu' || it.id == 'restart'),
      sc = sel ? 1.04 + 0.01 * Math.sin(t * 0.2) : 1;
    ctx.save();
    ctx.translate(r.x + r.w / 2, r.y + r.h / 2);
    ctx.scale(sc, sc);
    ctx.translate(-r.w / 2, -r.h / 2);
    if (sel) glow(r.w / 2, r.h / 2, 90, conf ? '#ff3b4a' : '#ffd500', 0.14);
    rr(0, 1.6, r.w, r.h, r.h / 2, 'rgba(0,0,0,.35)');
    rr(
      0,
      0,
      r.w,
      r.h,
      r.h / 2,
      sel
        ? conf
          ? lgr(0, 0, 0, r.h, '#ff6a7a', '#c0102a')
          : lgr(0, 0, 0, r.h, '#fff07a', '#ffc400')
        : 'rgba(20,32,90,.78)',
      sel ? OL : 'rgba(255,255,255,.18)',
      0.8,
    );
    const ink = sel ? (conf ? '#ffffff' : '#2a1600') : '#ffffff';
    ci(r.h / 2 + 1, r.h / 2, r.h / 2 - 3.6, sel ? 'rgba(255,255,255,.45)' : 'rgba(255,255,255,.1)');
    TX(it.icon, r.h / 2 + 1, r.h / 2 + 0.4, 8, ink, { w: 700 });
    const label = conf
      ? it.id == 'menu'
        ? 'SICURO? CONFERMA DI NUOVO'
        : 'SICURO? CONFERMA DI NUOVO'
      : it.label;
    TX(label, r.h + 4, r.h / 2 - 3.2, 6.4, ink, { a: 'left', w: 700 });
    TX(
      conf ? it.sub + '!' : it.sub,
      r.h + 4,
      r.h / 2 + 5,
      4.2,
      sel ? (conf ? '#ffe0e4' : '#5a3a00') : '#9fb4ff',
      {
        a: 'left',
        b: 1,
        w: 800,
      },
    );
    if (it.id == 'music') {
      const on = !Snd.muted;
      rr(r.w - 34, r.h / 2 - 5, 26, 10, 5, on ? '#3cc46a' : '#5a6386', OL, 0.5);
      ci(on ? r.w - 13 : r.w - 29, r.h / 2, 3.6, '#ffffff', OL, 0.4);
      TX(on ? 'ON' : 'OFF', on ? r.w - 25 : r.w - 17, r.h / 2 + 0.3, 3.8, '#ffffff', { b: 1, w: 900 });
    }
    if (sel && !tch) {
      const bx = -8 - Math.abs(Math.sin(t * 0.15)) * 3;
      pth([bx, r.h / 2 - 4, bx + 6, r.h / 2, bx, r.h / 2 + 4], '#ffd500', OL, 0.6);
    }
    ctx.restore();
  });
  if ((G.frame >> 5) % 2 || tch)
    TX(
      tch
        ? 'Tocca una voce · ❚❚ per riprendere'
        : '↑ ↓ scegli · INVIO conferma · P / ESC riprendi · M musica',
      W / 2 + 100,
      H - 14,
      5.2,
      '#cfe0ff',
      { b: 1, w: 800 },
    );
}
function coffeeCup(cx, cy, k) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(k, k);
  el(0, 12, 16, 3.4, '#e6ebf6', OL, 0.8);
  ctx.beginPath();
  ctx.moveTo(-11, -6);
  ctx.lineTo(11, -6);
  ctx.lineTo(9, 7);
  ctx.quadraticCurveTo(0, 11, -9, 7);
  ctx.closePath();
  fs(lgr(0, -6, 0, 10, '#ffffff', '#d4dbef'), OL, 0.9);
  rect(-10, -1, 20, 2.4, '#ffd500');
  el(0, -6, 10.4, 2.2, '#6a3418');
  el(-2, -6.6, 4, 0.8, 'rgba(255,220,180,.5)');
  ctx.beginPath();
  ctx.arc(12, 0, 4, -1.3, 1.3);
  ctx.strokeStyle = OL;
  ctx.lineWidth = 1.8;
  ctx.stroke();
  for (let i = 0; i < 3; i++) {
    const q = (V.TT * 0.012 + i / 3) % 1;
    ctx.globalAlpha = 0.75 * (1 - q);
    ctx.beginPath();
    ctx.moveTo(-5 + i * 5, -9 - q * 16);
    ctx.quadraticCurveTo(-1 + i * 5, -14 - q * 16, -5 + i * 5, -19 - q * 16);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}
export function scenery0(drift) {
  const sv = G.LV;
  G.LV = null;
  V.camX = drift;
  drawBG(0);
  V.camX = 0;
  G.LV = sv;
  GTH[0](-10, W + 20);
  lamp(52);
  lamp(420);
}
function fakeP(ch, form, o) {
  return Object.assign(
    {
      hired: true,
      ch,
      form,
      x: -6,
      y: -24,
      w: 12,
      h: 24,
      vx: 0,
      vy: 0,
      face: 1,
      onGround: true,
      anim: G.frame,
      inv: 0,
      dead: 0,
      aura: 2,
      sp: 0,
      shootT: 0,
      fly: 100,
      flyMax: 100,
      flap: 0,
    },
    o || {},
  );
}
export function heroAt(ch, form, x, y, sc, o) {
  const p = fakeP(ch, form, o);
  const r = (p._r = { f: G.frame, lg: true, land: 0, ph: (o && o.ph) || 0 });
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(sc, sc);
  if (ch == 0)
    drawAnzuV(0, 0, {
      face: p.face,
      air: !p.onGround,
      vy: p.vy,
      flap: p.flap,
      run: (o && o.run) || 0,
      ph: r.ph,
      shoot: p.shootT,
      aura: 2,
      sp: p.sp,
      ang: p.angry,
    });
  else heroDraw(ch, 0, 0, p, r);
  ctx.restore();
}
export function drawBoot() {
  rect(0, 0, W, H, '#02040f');
  glow(W / 2, 118, 150, '#2f6bff', 0.25 + 0.05 * Math.sin(V.TT * 0.05));
  const b = Math.sin(V.TT * 0.05) * 1.5;
  rr(W / 2 - 70, 84 + b, 140, 40, 8, lgr(0, 84, 0, 124, '#ffe95c', '#f0b800'), OL, 1.2);
  rr(W / 2 - 66, 88 + b, 132, 5, 2.5, 'rgba(255,255,255,.5)');
  TX('Big', W / 2 - 34, 105 + b, 17, '#12289b', { w: 700 });
  TX('Company', W / 2 + 20, 105 + b, 17, '#2f6bff', { w: 700 });
  const pk = 1 + 0.05 * Math.sin(V.TT * 0.12);
  ctx.save();
  ctx.translate(W / 2, 160);
  ctx.scale(pk, pk);
  TX(touchy() ? 'TOCCA PER ENTRARE' : 'PREMI INVIO PER ENTRARE', 0, 0, 9, '#ffffff', {
    w: 700,
    sk: '#0a1436',
    sw: 2,
  });
  ctx.restore();
  TX("♪  alza il volume: c'è la musica  ♪", W / 2, 180, 5.6, '#9fb4ff', { b: 1, w: 800 });
}
const PRES = [
  'In un palazzo qualunque, di una città qualunque…',
  '…sei piani, sei capi e nessun budget.',
  'Per salire di livello serve coraggio.',
  'O almeno 10 buoni pasto.',
];
export function drawPresent() {
  const t = G.st + V.A;
  if (t < 110) {
    rect(0, 0, W, H, '#02040f');
    const a = clamp(Math.min(t / 20, (110 - t) / 20), 0, 1),
      k = E.back(clamp(t / 26, 0, 1));
    ctx.save();
    ctx.globalAlpha = a;
    glow(W / 2, 120, 170, '#ffd500', 0.22);
    ctx.translate(W / 2, 112);
    ctx.scale(k, k);
    rr(-92, -27, 184, 54, 10, lgr(0, -27, 0, 27, '#ffe95c', '#f0b800'), OL, 1.4);
    rr(-87, -22, 174, 6, 3, 'rgba(255,255,255,.5)');
    TX('Big', -46, 1, 23, '#12289b', { w: 700 });
    TX('Company', 26, 1, 23, '#2f6bff', { w: 700 });
    ctx.restore();
    ctx.globalAlpha = a * clamp((t - 30) / 14, 0, 1);
    TX('P R E S E N T A', W / 2, 160, 7, '#ffffff', { b: 1, w: 900 });
    ctx.globalAlpha = 1;
    return;
  }
  const u = t - 110;
  scenery0(u * 0.6);
  rect(0, 0, W, H, lgr(0, 0, 0, H, 'rgba(2,5,24,.82)', 'rgba(2,5,24,.35)', [1, 'rgba(2,5,24,.1)']));
  bars(1);
  const i = Math.min(PRES.length - 1, Math.floor(u / 88)),
    f = u - i * 88,
    a = clamp(Math.min(f / 12, (88 - f) / 12), 0, 1);
  ctx.globalAlpha = i == PRES.length - 1 ? clamp(f / 12, 0, 1) : a;
  TX(PRES[i].slice(0, Math.floor(f * 1.1)), W / 2, 88, 10.5, i >= 2 ? '#ffe95c' : '#ffffff', {
    w: 700,
    sk: '#0a1436',
    sw: 2.4,
  });
  ctx.globalAlpha = 1;
  const rx = -60 + u * 1.75,
    ph = V.TT * 0.3,
    ex = rx - 150;
  for (let k = 0; k < 4; k++) {
    const x = ex - k * 22,
      hop = Math.abs(Math.sin(V.TT * 0.2 + k)) * 5;
    shadow(x, GY, 6, 0.25);
    ctx.save();
    ctx.translate(x, GY - hop - 10);
    ctx.rotate(Math.sin(V.TT * 0.25 + k) * 0.25);
    rr(-7, -5, 14, 10, 1.5, '#ffffff', OL, 0.7);
    pth([-7, -5, 0, 1, 7, -5], null, OL, 0.6);
    ci(6, -5, 1.8, '#ff3b4a', OL, 0.4);
    ctx.restore();
  }
  shadow(rx, GY, 8, 0.3);
  heroAt(2, 0, rx, GY, 1.5, { run: 1, ph, vx: 2 });
  shadow(rx + 26, GY, 8, 0.3);
  heroAt(3, 0, rx + 26, GY, 1.45, { run: 1, ph: ph + 1.4, vx: 2 });
  shadow(rx + 50, GY, 8, 0.3);
  heroAt(1, 0, rx + 50, GY, 1.45, { run: 1, ph: ph + 2.6, vx: 2 });
  shadow(rx - 26, GY, 7, 0.3);
  heroAt(4, 0, rx - 26, GY, 1.4, { run: 1, ph: ph + 0.7, vx: 2 });
  [5, 6, 7].forEach((c, i) => {
    shadow(rx - 52 - i * 26, GY, 7, 0.3);
    heroAt(c, 0, rx - 52 - i * 26, GY, 1.42, { run: 1, ph: ph + 1.1 + i * 0.9, vx: 2 });
  });
  if ((G.frame >> 4) % 2 && u > 20)
    TX(touchy() ? 'TOCCA PER SALTARE' : 'INVIO PER SALTARE', W - 8, H - 9, 4.8, '#ffe95c', {
      a: 'right',
      b: 1,
      w: 900,
    });
  if (t > 450) rect(0, 0, W, H, 'rgba(255,255,255,' + clamp((t - 450) / 20, 0, 1) + ')');
}
export function drawTitle() {
  scenery0(V.TT * 0.25);
  drawPlat({ x: 250, y: GY - 18, w: 62, h: 18, k: 'car' }, 0);
  drawPlat({ x: 330, y: GY - 18, w: 54, h: 18, k: 'car' }, 0);
  const sh = i => ((V.TT + i * 60) % 180 < 10 ? 9 : 0);
  HORD.forEach((c, i) => {
    const hx = 52 + i * 28;
    shadow(hx, GY, 7, 0.3);
    heroAt(c, c == 4 ? (G.frame >> 8) % 2 : 0, hx, GY, 1.2, { shootT: sh(c) });
  });
  bl(vignette(), 0, 0);
  const bob = Math.sin(V.TT * 0.04) * 2.5,
    rk = Math.sin(V.TT * 0.025) * 0.03;
  ctx.save();
  ctx.translate(W / 2, 70 + bob);
  ctx.rotate(rk);
  const sw = ((V.TT * 3) % 600) - 150;
  TX('BIG COMPANY', 2, 4, 46, '#0a1436', { w: 700 });
  TX(
    'BIG COMPANY',
    0,
    0,
    46,
    lgr(-150, -24, 150, 24, '#fff6a0', '#ffd500', [clamp((sw + 150) / 600, 0, 1), '#ffffff'], [1, '#ff9a00']),
    { w: 700, sk: '#0a1436', sw: 6 },
  );
  ctx.restore();
  ctx.save();
  ctx.translate(W / 2, 112);
  rr(-112, -11, 224, 22, 11, lgr(0, -11, 0, 11, '#3a7bff', '#1b3fa0'), OL, 1);
  pth([-112, -6, -124, 0, -112, 6], '#1b3fa0', OL, 0.8);
  pth([112, -6, 124, 0, 112, 6], '#1b3fa0', OL, 0.8);
  TX('LADDER CLIMBING', 0, 0.8, 11, '#ffe95c', { w: 700, sk: '#0a1436', sw: 1.8 });
  ctx.restore();
  TX('Sette eroi · otto boss · eventi aziendali folli', W / 2, 133, 6.4, '#e6ecff', {
    b: 1,
    w: 800,
    sh: true,
  });
  const pk = 1 + 0.06 * Math.sin(V.TT * 0.12);
  ctx.save();
  ctx.translate(W / 2, 160);
  ctx.scale(pk, pk);
  rr(-80, -10, 160, 20, 10, lgr(0, -10, 0, 10, '#fff27a', '#f0b800'), OL, 1);
  TX(touchy() ? 'TOCCA PER INIZIARE' : 'PREMI INVIO', 0, 0.8, 10, '#0f1a48', { w: 700 });
  ctx.restore();
  glow(W / 2, 160, 80, '#ffe95c', 0.12 + 0.06 * Math.sin(V.TT * 0.12));
  rr(W / 2 - 46, 180, 92, 12, 6, 'rgba(4,10,40,.6)', 'rgba(255,255,255,.2)', 0.6);
  TX('RECORD  ' + String(G.hi).padStart(7, '0'), W / 2, 186.3, 6, '#ffffff', { b: 1, w: 900 });
  TX(
    touchy()
      ? 'Ruota il telefono in orizzontale per giocare al meglio'
      : '← → muovi · Z salta · X spara · B ticket · C Sinergia · V alleato · F cambio',
    W / 2,
    H - 10,
    5.4,
    'rgba(220,230,255,.85)',
    { b: 1, w: 800, sh: true },
  );
}
const selA = [];
function fitTX(t, x, y, size, maxW, col, o) {
  const w = tw(t, size, o || {});
  TX(t, x, y, w > maxW ? (size * maxW) / w : size, col, o);
}
export function drawSelect() {
  scenery0(V.TT * 0.15);
  rect(0, 0, W, H, lgr(0, 0, 0, H, 'rgba(4,10,40,.7)', 'rgba(2,6,30,.88)'));
  TX('SCEGLI IL TUO EROE', W / 2, 13, 13, lgr(0, 6, 0, 22, '#fff6a0', '#ffc400'), {
    w: 700,
    sk: '#0a1436',
    sw: 3,
    sh: true,
  });
  const CW = SEL.w,
    CH2 = SEL.h,
    y0 = SEL.y;
  // portrait strip
  for (let n = 0; n < HORD.length; n++) {
    const i = HORD[n],
      c = CH[i],
      sel = i == G.selCh;
    selA[i] = (selA[i] || 0) + ((sel ? 1 : 0) - (selA[i] || 0)) * 0.2;
    const q = selA[i],
      cx = SEL.x(n),
      lift = q * 3;
    ctx.save();
    ctx.translate(0, -lift);
    if (q > 0.05) glow(cx, y0 + 50, 46, '#ffd500', 0.16 * q);
    glass(cx - CW / 2, y0, CW, CH2, 8, 0.55 + q * 0.25);
    ctx.save();
    ctx.beginPath();
    rrPath(cx - CW / 2, y0, CW, CH2, 8);
    ctx.clip();
    ctx.fillStyle = rgr(
      cx,
      y0 + 46,
      4,
      46,
      'rgba(80,130,255,' + (0.22 + q * 0.3) + ')',
      'rgba(80,130,255,0)',
    );
    ctx.fillRect(cx - CW / 2, y0, CW, CH2);
    el(cx, y0 + 76, 18, 3, 'rgba(0,0,0,.35)');
    const run = sel ? 1 : 0,
      ph = sel ? V.TT * 0.15 : 0,
      fy = y0 + 76,
      sc = 1.55;
    if (i == 4) {
      heroAt(4, 0, cx - 9, fy, sc * 0.92, { run, ph, vx: run, hired: false });
      heroAt(4, 1, cx + 10, fy, sc * 0.92, { run, ph: ph + 1.5, vx: run, hired: false });
    } else heroAt(i, 0, cx - 1, fy, sc, { run, ph, vx: run, shootT: sel && G.frame % 70 < 9 ? 9 : 0 });
    ctx.restore();
    if (q > 0.02) {
      ctx.globalAlpha = q;
      rr(cx - CW / 2, y0, CW, CH2, 8, null, '#ffd500', 1.5);
      ctx.globalAlpha = 1;
    }
    if (n >= HORD.length - 4 && i != 4 && i >= 5) {
      rr(cx - CW / 2 + 3, y0 + 3, 22, 7, 3.5, '#ffffff', OL, 0.4);
      TX('NUOVO', cx - CW / 2 + 14, y0 + 6.6, 3.4, '#c81a2c', { b: 1, w: 900 });
    }
    fitTX(
      c.short == 'STAGISTI' ? 'STAGISTI' : c.name,
      cx,
      y0 + 87,
      6.6,
      CW - 6,
      sel ? '#ffe95c' : '#ffffff',
      {
        w: 700,
        sk: '#0a1436',
        sw: 1.6,
      },
    );
    ctx.restore();
  }
  // detail panel for the selected hero
  const i = G.selCh,
    c = CH[i],
    py = 132,
    ph2 = 98,
    k = selFade(i);
  glass(10, py, W - 20, ph2, 10, 0.68);
  rr(10, py, W - 20, ph2, 10, null, 'rgba(255,213,0,.45)', 0.8);
  ctx.save();
  ctx.beginPath();
  rrPath(10, py, W - 20, ph2, 10);
  ctx.clip();
  ctx.globalAlpha = k;
  glow(68, py + 62, 60, '#ffd500', 0.12);
  ctx.save();
  ctx.translate((1 - k) * -20, 0);
  el(64, py + 88, 30, 4, 'rgba(0,0,0,.4)');
  if (i == 4) {
    heroAt(4, 0, 48, py + 88, 2.2, { run: 1, ph: V.TT * 0.15, vx: 1, hired: false });
    heroAt(4, 1, 80, py + 88, 2.2, { run: 1, ph: V.TT * 0.15 + 1.5, vx: 1, hired: false });
  } else {
    heroAt(i, 0, 56, py + 88, 2.3, { run: 1, ph: V.TT * 0.15, vx: 1, shootT: G.frame % 80 < 9 ? 9 : 0 });
    const at = ALLY_OF[i];
    ctx.save();
    ctx.translate(96, py + 88);
    ctx.scale(0.95, 0.95);
    drawAllyBody(at, 0, FLOAT[at] ? -14 : 0, -1, G.frame, -1, 0, true, V.TT * 0.2);
    ctx.restore();
  }
  ctx.restore();
  const tx0 = 132;
  TX(c.name, tx0, py + 13, 12, '#ffe95c', { a: 'left', w: 700, sk: '#0a1436', sw: 2.2 });
  TX(c.desc, tx0 + tw(c.name, 12, { w: 700 }) + 8, py + 14, 5.2, '#9fb4ff', { a: 'left', b: 1, w: 800 });
  {
    const per = 220,
      kk = Math.floor(V.TT / per),
      f = V.TT - kk * per,
      al = clamp(Math.min(1, f / 14, (per - f) / 14), 0, 1);
    ctx.globalAlpha = al * k;
    TX(quoteIt(c.ds[kk % c.ds.length]), tx0, py + 27, 5.6, '#ffffff', { a: 'left', b: 1, w: 800 });
    ctx.globalAlpha = k;
  }
  const pill = (lbl, val, x, yy, w, col) => {
    rr(x, yy - 6, w, 12, 6, 'rgba(255,255,255,.08)');
    TX(lbl, x + 6, yy + 0.3, 3.6, '#8fa3dc', { a: 'left', b: 1, w: 900 });
    const lw = tw(lbl, 3.6, { b: 1, w: 900 }),
      mw = w - 16 - lw,
      vw = tw(val, 5, { b: 1, w: 900 });
    TX(val, x + w - 6, yy + 0.3, vw > mw ? (5 * mw) / vw : 5, col, { a: 'right', b: 1, w: 900 });
  };
  const pw = 158;
  pill('ARMA', c.wep, tx0, py + 44, pw, '#9ff6ff');
  pill('ABILITÀ', c.abil, tx0 + pw + 6, py + 44, pw, '#ff8a96');
  pill('ALLEATO', c.ally, tx0, py + 60, pw, '#7ff0e0');
  pill('DIFETTO', c.dif || '—', tx0 + pw + 6, py + 60, pw, '#ffb020');
  // rotating footer tip inside the panel: the boss malus and the consultants
  const tips = [
    ['OCCHIO AL CAPO', "Chiami l'alleato? 2 volte su 5 arriva lui.", '#ff6a7a'],
    ['CONSULENTI', 'Tiberio e Luigi passano a caso e ti aiutano.', '#5ff0de'],
    ['TICKET', 'Bombe che puliscono lo schermo (tasto B).', '#ffb0b8'],
  ];
  const tp = tips[((V.TT / 300) | 0) % tips.length];
  rr(tx0, py + 74, 70, 10, 5, tp[2], OL, 0.4);
  TX(tp[0], tx0 + 35, py + 79.3, 4.4, '#0a1436', { b: 1, w: 900 });
  TX(tp[1], tx0 + 76, py + 79.3, 4.8, '#dfe7ff', { a: 'left', b: 1, w: 800 });
  ctx.globalAlpha = 1;
  ctx.restore();
  if ((G.frame >> 4) % 2)
    TX(
      touchy() ? 'TOCCA UN EROE · TOCCALO DI NUOVO PER INIZIARE' : '← → SCEGLI · INVIO PER INIZIARE',
      W / 2,
      H - 12,
      6.8,
      '#ffe95c',
      { w: 700, sk: '#0a1436', sw: 1.6 },
    );
}
let selLast = -1,
  selT = 0;
/** 0→1 fade-in of the detail panel each time the selection changes. */
function selFade(i) {
  if (i != selLast) {
    selLast = i;
    selT = 0;
  }
  selT = Math.min(1, selT + 0.08);
  return E.out(selT);
}

const quoteIt = t => (t.includes('«') ? t : '«' + t + '»');
