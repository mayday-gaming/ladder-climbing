/** @file HUD: score, lives, synergy and status bars. */
import { ANAME } from '../data/allies.js';
import { TCOST } from '../data/heroes.js';
import { TX, ci, ctx, el, fs, glass, glow, lgr, rect, rr, rrPath, tw } from '../engine/canvas.js';
import { H, OL, W } from '../engine/config.js';
import { touchy } from '../engine/input.js';
import { E, clamp } from '../engine/math.js';
import { allyOf, cf, rankOf } from '../game/progression.js';
import { mult } from '../game/session.js';
import { G } from '../game/state.js';
import { V } from './interp.js';

function heartV(x, y, s, on, pulse) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s * (1 + pulse), s * (1 + pulse));
  ctx.beginPath();
  ctx.moveTo(0, 3.2);
  ctx.bezierCurveTo(-4.6, 0, -4.6, -3.6, -2.2, -3.6);
  ctx.bezierCurveTo(-0.9, -3.6, 0, -2.6, 0, -1.6);
  ctx.bezierCurveTo(0, -2.6, 0.9, -3.6, 2.2, -3.6);
  ctx.bezierCurveTo(4.6, -3.6, 4.6, 0, 0, 3.2);
  ctx.closePath();
  fs(
    on ? lgr(0, -3.6, 0, 3.2, '#ff8a9a', '#e8243c') : 'rgba(20,30,80,.8)',
    on ? '#5a0a1a' : 'rgba(140,160,220,.4)',
    0.6,
  );
  if (on) el(-1.6, -2, 1, 0.6, 'rgba(255,255,255,.7)', null, 0, -0.5);
  ctx.restore();
}
function coinIcon(x, y) {
  rr(x - 3.6, y - 2.6, 7.2, 5.2, 1, lgr(0, y - 2.6, 0, y + 2.6, '#fff27a', '#f0b800'), OL, 0.5);
  rect(x - 3.6, y - 0.8, 7.2, 1.2, '#1b3fa0');
}
function ticketIcon(x, y) {
  rr(x - 3.8, y - 2.8, 7.6, 5.6, 1, '#ffffff', OL, 0.5);
  rect(x - 3.8, y - 2.8, 7.6, 2, '#e0303e');
}
export function drawHUD() {
  const p = G.P,
    tch2 = touchy();
  V.dispScore += (G.score - V.dispScore) * 0.18;
  if (Math.abs(G.score - V.dispScore) < 1) V.dispScore = G.score;
  glass(4, 4, 128, 27, 7, 0.55);
  for (let i = 0; i < p.maxHp; i++) {
    const on = i < p.hp,
      pl = on && p.hp == 1 ? Math.abs(Math.sin(V.TT * 0.15)) * 0.15 : 0;
    heartV(13 + i * 10, 12, 1, on, pl);
  }
  const hn = p.consT > 0 ? ANAME[p.consType] : cf(p).short;
  TX(hn, 10, 24, 5.4, p.consT > 0 ? '#5fe6d6' : '#cfe0ff', { a: 'left', b: 1, w: 900 });
  const nw = tw(hn, 5.4, { b: 1, w: 900 });
  TX('×' + G.lives, 12 + nw, 24, 5.4, '#ffe95c', { a: 'left', b: 1, w: 900 });
  coinIcon(74, 24);
  TX('' + p.coins, 80, 24.3, 5.8, '#ffe95c', { a: 'left', b: 1, w: 900 });
  ticketIcon(100, 24);
  TX('' + p.bombs, 106, 24.3, 5.8, '#ffb0b8', { a: 'left', b: 1, w: 900 });
  if (p.ch == 3 && (p.caf > 0 || p.panicT > 0)) {
    const pn = p.panicT > 0,
      lb = pn ? 'PANICO ' + Math.ceil(p.panicT / 60) + 's' : 'CAFFEINA ' + p.caf + '/3';
    rr(4, 45, 58, 8, 4, pn ? 'rgba(255,77,94,.9)' : 'rgba(3,8,34,.8)', 'rgba(255,176,32,.7)', 0.5);
    if (!pn)
      for (let i = 0; i < 3; i++) ci(46 + i * 5, 49, 1.6, i < p.caf ? '#ffb020' : 'rgba(255,255,255,.2)');
    TX(lb, pn ? 33 : 24, 49.3, 4, '#ffffff', { b: 1, w: 900 });
  }
  if (p.consT > 0) {
    const k = p.consT / 900;
    rr(4, 45, 70, 8, 4, 'rgba(3,8,34,.8)', 'rgba(95,230,214,.5)', 0.5);
    rr(4.8, 45.8, 68.4 * k, 6.4, 3.2, lgr(4, 0, 74, 0, '#5fe6d6', '#14a898'));
    TX('CONSULENZA ' + Math.ceil(p.consT / 60) + 's', 39, 49.3, 4, '#03302a', { b: 1, w: 900 });
  }
  const rl = rankOf(G.lvl),
    rw = tw(rl, 5, { b: 1, w: 800 }) + 12;
  rr(4, 34, rw, 9, 4.5, G.P.ch == 4 && !G.P.hired ? 'rgba(255,255,255,.92)' : 'rgba(255,213,0,.92)', OL, 0.5);
  TX(rl, 4 + rw / 2, 38.7, 5, G.P.ch == 4 && !G.P.hired ? '#1b3fa0' : '#0f1a48', { b: 1, w: 800 });
  const sc = String(Math.round(V.dispScore)).padStart(7, '0');
  glass(W / 2 - 38, 4, 76, 19, 7, 0.5);
  TX(sc, W / 2, 13.6, 11, '#ffffff', { w: 700, sk: '#0a1436', sw: 1.8 });
  const m = mult();
  if (m > 1) {
    const k = 1 + 0.12 * Math.abs(Math.sin(V.TT * 0.2));
    ctx.save();
    ctx.translate(W / 2, 27);
    ctx.scale(k, k);
    rr(-17, -4.6, 34, 9.2, 4.6, lgr(0, -4, 0, 4, '#ff8a3a', '#ff3b4a'), OL, 0.6);
    TX('COMBO ×' + m, 0, 0.3, 5.4, '#fff', { b: 1, w: 900 });
    ctx.restore();
  } else
    TX(
      'RECORD ' + String(Math.max(G.hi, G.score)).padStart(7, '0'),
      W / 2,
      27,
      4.6,
      'rgba(200,215,255,.75)',
      { b: 1, w: 800 },
    );
  glass(W - 122, 4, 118, 27, 7, 0.55);
  const wn = p.consT > 0 ? (p.consType == 'tib' ? 'SLIDE PRO' : 'MERGE PRO') : cf(p).W[p.aura];
  TX(wn, W - 116, 11.6, 6.2, '#9ff6ff', { a: 'left', w: 600 });
  for (let i = 0; i < 4; i++)
    ci(W - 14 - (3 - i) * 5.4, 11.6, 1.7, i < p.aura ? '#66f0ff' : 'rgba(80,100,160,.6)', OL, 0.4);
  const full = p.sp >= 100,
    bx = W - 116,
    bw = 106;
  rr(bx, 19, bw, 7, 3.5, 'rgba(3,8,34,.8)', 'rgba(160,190,255,.25)', 0.5);
  if (p.sp > 0) {
    ctx.save();
    ctx.beginPath();
    rrPath(bx + 0.8, 19.8, ((bw - 1.6) * p.sp) / 100, 5.4, 2.7);
    ctx.clip();
    rect(
      bx,
      19,
      bw,
      7,
      full
        ? lgr(bx, 0, bx + bw, 0, '#ffe95c', '#ff9a3a', '#ffe95c')
        : lgr(bx, 0, bx + bw, 0, '#2f6bff', '#66f0ff'),
    );
    const sx = bx + ((V.TT * 2) % (bw + 40)) - 20;
    rect(sx, 19, 10, 7, 'rgba(255,255,255,.35)');
    ctx.restore();
  }
  TX(full ? 'SINERGIA PRONTA!' : 'SINERGIA', bx + bw / 2, 22.8, 4.4, full ? '#3a1a00' : '#dfe7ff', {
    b: 1,
    w: 900,
  });
  if (full) glow(bx + bw / 2, 22.5, 30, '#ffe95c', 0.25 + 0.15 * Math.sin(V.TT * 0.3));
  if (!G.tib && p.coins >= TCOST && G.state == 'play' && allyOf(p)) {
    const lb = (tch2 ? '' : '[V] ') + allyOf(p) + ' PRONTO',
      w = tw(lb, 5, { b: 1, w: 900 }) + 12,
      k = 1 + 0.05 * Math.sin(V.TT * 0.25);
    ctx.save();
    ctx.translate(W - 63, 38.5);
    ctx.scale(k, k);
    rr(-w / 2, -4.6, w, 9.2, 4.6, lgr(0, -4, 0, 4, '#5ff0de', '#14a898'), OL, 0.5);
    TX(lb, 0, 0.3, 5, '#03302a', { b: 1, w: 900 });
    ctx.restore();
  }
  if (p.ch == 4 && !tch2)
    TX('[F] cambio', W - 6, 46.5, 4.4, 'rgba(255,154,166,.9)', { a: 'right', b: 1, w: 800 });
  if (G.boss && G.bossOn && G.state != 'bossintro' && !G.boss.dead) {
    const b = G.boss,
      k = b.hp / b.max;
    V.bossLag = Math.max(k, V.bossLag - 0.004);
    if (V.bossLag < k) V.bossLag = k;
    const bw2 = 190,
      bx2 = W / 2 - bw2 / 2,
      y = 52;
    TX(b.name, W / 2, y - 5, 6.4, '#ffffff', { w: 700, sk: '#0a1436', sw: 1.8 });
    rr(bx2 - 1, y - 1, bw2 + 2, 8, 4, 'rgba(3,8,34,.85)', 'rgba(255,255,255,.25)', 0.6);
    ctx.save();
    ctx.beginPath();
    rrPath(bx2, y, bw2, 6, 3);
    ctx.clip();
    rect(bx2, y, bw2 * V.bossLag, 6, '#ffffff');
    rect(
      bx2,
      y,
      bw2 * k,
      6,
      k < 0.33 ? lgr(0, y, 0, y + 6, '#ff6a7a', '#d0102a') : lgr(0, y, 0, y + 6, '#ffe95c', '#f0a800'),
    );
    rect(bx2, y, bw2, 1.6, 'rgba(255,255,255,.35)');
    ctx.restore();
  } else V.bossLag = 1;
  if (G.tib && G.tib.type == 'claudio') {
    const lb = 'CLAUDIO STA GIOCANDO PER TE · ' + Math.ceil(G.tib.life / 60) + 's',
      w = tw(lb, 5.4, { b: 1, w: 900 }) + 20;
    rr(W / 2 - w / 2, H - 17, w, 11, 5.5, 'rgba(4,20,60,.75)', '#66f0ff', 0.7);
    ci(W / 2 - w / 2 + 7, H - 11.5, 1.8, (G.frame >> 4) % 2 ? '#66f0ff' : '#1b6a8a');
    TX(lb, W / 2 + 4, H - 11.2, 5.4, '#bff8ff', { b: 1, w: 900 });
  }
  if (G.buzz) {
    const k = G.buzz.life,
      age = 70 - k,
      s = age < 10 ? 0.3 + E.el(age / 10) * 0.7 : 1,
      a = clamp(k / 14, 0, 1);
    ctx.save();
    ctx.translate(W / 2, 78);
    ctx.rotate(Math.sin(V.TT * 0.25) * 0.06 - 0.04);
    ctx.scale(s, s);
    ctx.globalAlpha = a;
    TX(G.buzz.t, 0, 0, 20, lgr(0, -10, 0, 10, '#fff6a0', '#ffc400'), {
      w: 700,
      sk: '#0a1436',
      sw: 4,
      sh: true,
    });
    ctx.restore();
    ctx.globalAlpha = 1;
  }
  if (G.msg) {
    const k = G.msg.life,
      age = 120 - k,
      a = clamp(k / 18, 0, 1),
      s = age < 12 ? 0.4 + E.back(age / 12) * 0.6 : 1;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(W / 2, 100);
    ctx.scale(s, s);
    TX(G.msg.t, 0, 0, 12, '#ffe95c', { w: 700, sk: '#0a1436', sw: 2.8, sh: true });
    ctx.restore();
    ctx.globalAlpha = 1;
  }
}
export function bars(k) {
  const h = 26 * E.out(k);
  rect(0, 0, W, h, '#02040f');
  rect(0, H - h, W, h, '#02040f');
}
export function stamp(txt, x, y, k, col, rot) {
  const s = 3 - 2 * E.out(k);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot || -0.12);
  ctx.scale(s, s);
  ctx.globalAlpha = clamp(k * 3, 0, 1);
  const w = tw(txt, 26, { w: 700 }) + 26;
  rr(-w / 2, -20, w, 40, 6, null, col, 3.2);
  rr(-w / 2 + 4, -16, w - 8, 32, 4, null, col, 1.2);
  TX(txt, 0, 1, 26, col, { w: 700 });
  ctx.restore();
  ctx.globalAlpha = 1;
}
