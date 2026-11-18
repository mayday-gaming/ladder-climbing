/** @file Boot, title and hero-select screens. */
import { ALLY_OF, CONS, FLOAT } from '../../data/allies.js';
import { CH, HORD, SEL } from '../../data/heroes.js';
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
import { GY, H, OL, P2, W } from '../../engine/config.js';
import { touchy } from '../../engine/input.js';
import { E, clamp } from '../../engine/math.js';
import { G } from '../../game/state.js';
import { drawAllyBody } from '../characters/allies.js';
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
  ctx.globalAlpha = 1;
}
export function drawPause() {
  rect(0, 0, W, H, 'rgba(2,6,30,.72)');
  glass(W / 2 - 130, 60, 260, 130, 12, 0.85);
  const cx = W / 2,
    cy = 96;
  el(cx, cy + 8, 14, 3, '#e6ebf6', OL, 0.6);
  ctx.beginPath();
  ctx.moveTo(cx - 10, cy - 6);
  ctx.lineTo(cx + 10, cy - 6);
  ctx.lineTo(cx + 8, cy + 6);
  ctx.quadraticCurveTo(cx, cy + 9, cx - 8, cy + 6);
  ctx.closePath();
  fs('#ffffff', OL, 0.8);
  el(cx, cy - 6, 9.4, 2, '#6a3418');
  ctx.beginPath();
  ctx.arc(cx + 11, cy - 1, 3.6, -1.3, 1.3);
  ctx.strokeStyle = OL;
  ctx.lineWidth = 1.6;
  ctx.stroke();
  for (let i = 0; i < 3; i++) {
    const q = (V.TT * 0.01 + i / 3) % 1;
    ctx.globalAlpha = 0.7 * (1 - q);
    ctx.beginPath();
    ctx.moveTo(cx - 5 + i * 5, cy - 9 - q * 14);
    ctx.quadraticCurveTo(cx - 2 + i * 5, cy - 13 - q * 14, cx - 5 + i * 5, cy - 17 - q * 14);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  TX('PAUSA CAFFÈ', W / 2, 126, 18, '#ffe95c', { w: 700, sk: '#0a1436', sw: 3 });
  TX('← → muovi · Z salta · X spara · B ticket incident · C Sinergia', W / 2, 150, 5.8, '#dfe7ff', {
    b: 1,
    w: 800,
  });
  TX('V alleato · F cambio (Stagisti) · M musica · P riprendi', W / 2, 162, 5.8, '#dfe7ff', { b: 1, w: 800 });
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
  shadow(118, GY, 7, 0.3);
  heroAt(1, 0, 118, GY, 1.2, { shootT: sh(1) });
  shadow(150, GY, 7, 0.3);
  heroAt(3, 0, 150, GY, 1.2, { shootT: sh(3) });
  shadow(184, GY, 8, 0.3);
  heroAt(2, 0, 184, GY, 1.2, { shootT: sh(2) });
  shadow(216, GY, 7, 0.3);
  heroAt(4, (G.frame >> 8) % 2, 216, GY, 1.2, { shootT: sh(4) });
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
  TX('Bolt · August · Angry Man · gli Stagisti · otto boss · eventi folli', W / 2, 133, 6.4, '#e6ecff', {
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
const selA = [0, 0, 0, 0, 0];
function rotTxt(arr, k, x, y, size, col, o) {
  const per = 260,
    t = V.TT + k * 87,
    n = Math.floor(t / per),
    f = t - n * per,
    a = Math.min(1, f / 14, (per - f) / 14);
  ctx.globalAlpha *= clamp(a, 0, 1);
  TX(arr[(n + k) % arr.length], x, y + (1 - E.out(f / 14)) * 2, size, col, o);
  ctx.globalAlpha = 1;
}
function fitTX(t, x, y, size, maxW, col, o) {
  const w = tw(t, size, o || {});
  TX(t, x, y, w > maxW ? (size * maxW) / w : size, col, o);
}
function wrap2(t, size, maxW, o) {
  const w = t.split(' ');
  let a = '',
    b = '';
  for (const x of w) {
    const c = (a ? a + ' ' : '') + x;
    if (!b && tw(c, size, o) <= maxW) a = c;
    else b = (b ? b + ' ' : '') + x;
  }
  return [a, b];
}
export function drawSelect() {
  scenery0(V.TT * 0.15);
  rect(0, 0, W, H, lgr(0, 0, 0, H, 'rgba(4,10,40,.7)', 'rgba(2,6,30,.85)'));
  TX('SCEGLI IL TUO EROE', W / 2, 14, 14, lgr(0, 6, 0, 24, '#fff6a0', '#ffc400'), {
    w: 700,
    sk: '#0a1436',
    sw: 3,
    sh: true,
  });
  const CW = SEL.w,
    CHH = 162;
  for (let n = 0; n < HORD.length; n++) {
    const i = HORD[n],
      c = CH[i],
      sel = i == G.selCh;
    selA[i] += ((sel ? 1 : 0) - selA[i]) * 0.18;
    const q = selA[i],
      cx = SEL.x(n),
      y0 = 26,
      s2 = 0.97 + q * 0.04;
    ctx.save();
    ctx.translate(cx, y0 + 80);
    ctx.scale(s2, s2);
    ctx.translate(-cx, -(y0 + 80));
    if (q > 0.05) glow(cx, y0 + 70, 80, '#ffd500', 0.14 * q);
    glass(cx - CW / 2, y0, CW, CHH, 9, 0.6 + q * 0.2);
    if (q > 0.02) {
      ctx.globalAlpha = q;
      rr(cx - CW / 2, y0, CW, CHH, 9, null, '#ffd500', 1.5);
      ctx.globalAlpha = 1;
    }
    if (i == 4) {
      rr(cx - CW / 2 + 4, y0 + 4, 30, 8, 4, '#ffffff', OL, 0.4);
      TX('NUOVI', cx - CW / 2 + 19, y0 + 8.3, 3.8, '#c81a2c', { b: 1, w: 900 });
    }
    ctx.save();
    ctx.beginPath();
    rrPath(cx - CW / 2, y0, CW, CHH, 9);
    ctx.clip();
    ctx.fillStyle = rgr(
      cx,
      y0 + 52,
      4,
      64,
      'rgba(80,130,255,' + (0.25 + q * 0.25) + ')',
      'rgba(80,130,255,0)',
    );
    ctx.fillRect(cx - CW / 2, y0, CW, 96);
    ctx.save();
    ctx.translate(cx, y0 + 48);
    ctx.rotate(V.TT * 0.006);
    ctx.globalAlpha = 0.05 + q * 0.07;
    for (let k = 0; k < 10; k++) {
      ctx.rotate(P2 / 10);
      pth([0, 0, 90, -10, 90, 10], '#ffffff');
    }
    ctx.restore();
    ctx.restore();
    el(cx, y0 + 84, 30, 4.5, 'rgba(0,0,0,.35)');
    const run = sel ? 1 : 0,
      ph = sel ? V.TT * 0.15 : 0,
      shoot = sel && G.frame % 70 < 9 ? 9 : 0,
      fy = y0 + 82,
      sc = 2.05;
    if (i == 4) {
      heroAt(4, 0, cx - 15, fy, sc * 0.95, { run, ph, shootT: shoot, vx: run, hired: false });
      heroAt(4, 1, cx + 14, fy, sc * 0.95, { run, ph: ph + 1.5, shootT: shoot, vx: run, hired: false });
      TX('⇄', cx, y0 + 16, 8, '#fff07a', { w: 700, sk: '#0a1436', sw: 2 });
    } else if (i == 0)
      heroAt(0, 0, cx - 4, fy - (sel ? Math.abs(Math.sin(V.TT * 0.08)) * 3 : 0), sc * 1.05, {
        onGround: !sel,
        vy: -1,
        flap: sel && G.frame % 20 < 10 ? 6 : 0,
        run: 0,
        shootT: shoot,
        sp: sel ? 100 : 0,
      });
    else heroAt(i, 0, cx - 4, fy, sc, { run, ph, shootT: shoot, vx: run });
    if (i != 4) {
      ctx.save();
      ctx.translate(cx + 30, fy);
      ctx.scale(0.85, 0.85);
      drawAllyBody(ALLY_OF[i], 0, FLOAT[ALLY_OF[i]] ? -14 : 0, -1, G.frame, -1, 0, false);
      ctx.restore();
    }
    fitTX(c.name, cx, y0 + 95, 10.5, CW - 8, sel ? '#ffe95c' : '#ffffff', { w: 700, sk: '#0a1436', sw: 2 });
    {
      const per = 260,
        tt = V.TT + n * 87,
        k = Math.floor(tt / per),
        f = tt - k * per,
        al = clamp(Math.min(1, f / 14, (per - f) / 14), 0, 1),
        L2 = wrap2(c.ds[(k + n) % c.ds.length], 4.5, CW - 10, { b: 1, w: 800 });
      ctx.globalAlpha = al;
      TX(L2[0], cx, y0 + 105, 4.5, sel ? '#ffffff' : '#b9c8f0', { b: 1, w: 800 });
      if (L2[1]) TX(L2[1], cx, y0 + 111.5, 4.5, sel ? '#ffffff' : '#b9c8f0', { b: 1, w: 800 });
      ctx.globalAlpha = 1;
    }
    const pill = (lbl, val, yy, col) => {
      rr(cx - CW / 2 + 4, yy - 5, CW - 8, 10, 5, 'rgba(255,255,255,.075)');
      TX(lbl, cx - CW / 2 + 8, yy + 0.3, 3.4, '#8fa3dc', { a: 'left', b: 1, w: 900 });
      const lw = tw(lbl, 3.4, { b: 1, w: 900 }),
        mw = CW - 18 - lw,
        vw = tw(val, 4.4, { b: 1, w: 900 });
      TX(val, cx + CW / 2 - 7, yy + 0.3, vw > mw ? (4.4 * mw) / vw : 4.4, col, { a: 'right', b: 1, w: 900 });
    };
    pill('ARMA', c.wep, y0 + 124, '#9ff6ff');
    pill('ABILITÀ', c.abil, y0 + 137, '#ff8a96');
    pill('ALLEATO', c.ally, y0 + 150, i == 4 ? '#ffb0b8' : '#7ff0e0');
    ctx.restore();
  }
  const sy = 194,
    sh = 40;
  glass(10, sy, W - 20, sh, 9, 0.62);
  rr(10, sy, W - 20, sh, 9, null, 'rgba(255,213,0,.4)', 0.8);
  {
    const x = 38;
    el(x, sy + 36.5, 9, 1.6, 'rgba(0,0,0,.4)');
    ctx.save();
    ctx.beginPath();
    ctx.rect(x - 22, sy - 12, 44, sh + 10.5);
    ctx.clip();
    ctx.translate(x, sy + 36.5);
    ctx.scale(1.2, 1.2);
    drawAllyBody('capo', 0, 0, 1, G.frame, -1, 0, false, 0);
    ctx.restore();
    rr(60, sy + 5.5, 96, 9.5, 4.75, lgr(0, sy + 5, 0, sy + 15, '#ff6a7a', '#d0102a'));
    TX('OCCHIO AL CAPO', 108, sy + 10.5, 5, '#ffffff', { b: 1, w: 900 });
    TX("Chiami l'alleato? 2 volte su 5", 108, sy + 22, 4.8, '#e6ecff', { b: 1, w: 800 });
    TX('arriva lui: reperibilità e straordinari.', 108, sy + 30, 4.5, '#b9c8f0', { b: 1, w: 800 });
  }
  for (let k = 0; k < 2; k++) {
    const C = CONS[k],
      x = 196 + k * 30;
    el(x, sy + 36.5, 8, 1.5, 'rgba(0,0,0,.4)');
    ctx.save();
    ctx.beginPath();
    ctx.rect(x - 16, sy - 12, 32, sh + 10.5);
    ctx.clip();
    ctx.translate(x, sy + 36.5);
    ctx.scale(C.sc * 0.92, C.sc * 0.92);
    drawAllyBody(C.t, 0, 0, 1, G.frame, -1, 0, false, 0);
    ctx.restore();
  }
  rr(236, sy + 5.5, 128, 9.5, 4.75, lgr(0, sy + 5, 0, sy + 15, '#5ff0de', '#14a898'));
  TX('CONSULENTI DI PASSAGGIO', 300, sy + 10.5, 5, '#03302a', { b: 1, w: 900 });
  TX('Tiberio e Luigi compaiono a caso', 300, sy + 22, 4.8, '#e6ecff', { b: 1, w: 800 });
  TX('nei livelli e ti danno una mano.', 300, sy + 30, 4.5, '#b9c8f0', { b: 1, w: 800 });
  rotTxt(CONS[((V.TT / 520) | 0) % 2].l, 3, 422, sy + 22, 4.4, '#7ff0e0', { b: 1, w: 800 });
  if ((G.frame >> 4) % 2)
    TX(
      touchy() ? 'TOCCA UN PERSONAGGIO PER INIZIARE' : '← → SCEGLI · INVIO PER INIZIARE',
      W / 2,
      H - 23,
      7.4,
      '#ffe95c',
      { w: 700, sk: '#0a1436', sw: 1.6 },
    );
  TX(
    'Ticket incident = bombe devastanti (' +
      (touchy() ? 'pulsante TICKET' : 'tasto B') +
      ') · occhio agli eventi aziendali!',
    W / 2,
    H - 10,
    5,
    '#cfe0ff',
    { b: 1, w: 800 },
  );
}
