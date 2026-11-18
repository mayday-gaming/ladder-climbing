/** @file Composes the play scene in draw order. */
import { ORD } from '../data/levels.js';
import { TX, bl, ci, ctx, cv, glow, lgr, ln, pth, rect, rgr, rr, tw } from '../engine/canvas.js';
import { H, OL, W } from '../engine/config.js';
import { E, clamp } from '../engine/math.js';
import { G } from '../game/state.js';
import { drawBoss } from './bosses.js';
import { drawTib } from './characters/allies.js';
import { drawPlayer } from './characters/heroes.js';
import { drawDecals, drawEnemy } from './enemies.js';
import { confDraw, partsDraw, popsDraw } from './fx.js';
import { V, ix, iy } from './interp.js';
import { drawPickup } from './pickups.js';
import { drawBombs, drawBul, drawEBul } from './projectiles.js';
import { drawBG, drawDecor, drawFG, drawPits, drawPlat, drawSigns, vignette } from './scenery.js';
import { drawQWorld } from './screens/quadro.js';

export function drawWorld() {
  const th = G.LV.th != null ? G.LV.th : ORD[G.lvl];
  drawBG(th);
  if (G.LV.i == 6) rect(0, 0, W, H, 'rgba(160,110,50,.16)');
  const sk = G.shake > 0 ? G.shake * 0.42 : 0,
    sx = sk ? Math.sin(V.TT * 2.7) * sk : 0,
    sy = sk ? Math.cos(V.TT * 3.3) * sk * 0.7 : 0;
  ctx.save();
  ctx.translate(sx - V.camX, sy);
  drawDecor(th);
  drawSigns(th);
  for (const s of G.LV.plats) if (s.k == 'g') drawPlat(s, th);
  drawPits(th);
  drawDecals();
  for (const s of G.LV.plats) if (s.k != 'g') drawPlat(s, th);
  if (G.state == 'quadro' && G.Q) drawQWorld(G.Q);
  for (const k of G.pks) drawPickup(k);
  for (const e of G.ens) if (e.act) drawEnemy(e);
  if (G.boss) drawBoss(G.boss);
  drawTib();
  drawPlayer(G.P);
  if (G.P.ch == 0 && G.P.fly < G.P.flyMax - 1 && !G.P.dead) {
    const fx = ix(G.P) + 6,
      fy = iy(G.P) - 9,
      k = G.P.fly / G.P.flyMax;
    rr(fx - 9, fy - 1.6, 18, 3.2, 1.6, 'rgba(4,10,40,.6)');
    rr(
      fx - 8.4,
      fy - 1,
      16.8 * k,
      2,
      1,
      G.P.fly < 16 ? '#ff4d5e' : lgr(fx - 8, 0, fx + 8, 0, '#66f0ff', '#2f6bff'),
    );
  }
  for (const e of G.ens) if (e.act && !e.gone && e.slowT > 0) slowTag(e);
  if (G.freezeT > 0) holdMarks();
  for (const b of G.bul) drawBul(b);
  drawBombs();
  for (const b of G.ebul) drawEBul(b);
  partsDraw();
  if (G.ring) {
    const x = G.ring.x,
      y = G.ring.y,
      k = clamp(1 - G.ring.r / 520, 0, 1);
    ctx.globalAlpha = k;
    ci(x, y, G.ring.r, null, '#66f0ff', 6);
    ci(x, y, G.ring.r, null, '#ffffff', 1.6);
    ci(x, y, G.ring.r * 0.92, null, 'rgba(255,233,92,.6)', 2);
    ctx.globalAlpha = 1;
  }
  confDraw();
  popsDraw();
  ctx.restore();
  drawFG(th);
  bl(vignette(), 0, 0);
  if (G.freezeT > 0 && G.state == 'play') freezeOverlay();
  if (G.rewT > 0) rewindOverlay();
  if (G.flash > 0) {
    ctx.globalAlpha = G.flash / 18;
    rect(0, 0, W, H, '#ffffff');
    ctx.globalAlpha = 1;
  }
}
export function drawEvtFx() {
  if (G.bsod > 0) {
    ctx.globalAlpha = 0.7 * clamp(G.bsod / 10, 0, 1);
    rect(0, 0, W, H, '#0a3ad8');
    ctx.globalAlpha = clamp(G.bsod / 10, 0, 1);
    TX(':(', 70, 80, 44, '#fff', { w: 500 });
    TX('KERNEL PANIC', 70, 130, 14, '#fff', { a: 'left', w: 700 });
    TX('Il Mainframe ha riavviato tutti i nemici. Codice errore: S0C7', 70, 148, 6, '#dfe7ff', {
      a: 'left',
      b: 1,
      w: 700,
    });
    ctx.globalAlpha = 1;
  }
  if (!G.evt || G.state != 'play') return;
  const id = G.evt.id;
  if (id == 'disco') {
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 6; i++) {
      const a = V.TT / 26 + i * 1.05;
      const x = W / 2 + Math.cos(a) * 190,
        y = 150 + Math.sin(a * 1.3) * 80;
      const c = ['#ff3bd4', '#66f0ff', '#ffd500', '#3cff7a', '#ff4d5e', '#8f6bff'][i];
      ctx.globalAlpha = 0.16;
      pth([W / 2, 36, x - 30, y + 60, x + 30, y + 60], c);
      ctx.globalAlpha = 1;
      glow(x, y + 40, 50, c, 0.25);
    }
    ctx.globalCompositeOperation = 'source-over';
    ln(W / 2, 24, W / 2, 30, '#8a96c0', 0.8);
    ci(W / 2, 38, 9, rgr(W / 2 - 3, 35, 1, 10, '#ffffff', '#9aa6c8', [1, '#5a6390']), OL, 0.6);
    for (let i = 0; i < 14; i++) {
      const a = V.TT / 12 + i * 0.45,
        yy = Math.sin(i * 1.3) * 7;
      if (Math.cos(a) > 0) {
        rect(
          W / 2 + Math.sin(a) * 8 - 1,
          38 + yy - 1,
          2,
          2,
          (i + (G.frame >> 3)) % 3 ? '#ffffff' : '#ffe95c',
        );
      }
    }
    glow(W / 2, 38, 22, '#ffffff', 0.3);
  } else if (id == 'slow') {
    rect(0, 0, W, H, 'rgba(120,100,60,.14)');
    for (let i = 0; i < 3; i++) {
      const k = (V.TT * 0.006 + i / 3) % 1;
      TX('z', W / 2 - 40 + i * 40, 70 - k * 30, 8 + k * 8, 'rgba(220,230,255,' + (1 - k) + ')', { w: 700 });
    }
  } else if (id == 'turbo') {
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 14; i++) {
      const y = ((i * 37 + G.frame * 3) % 220) + 30,
        x = W - ((G.frame * 31 + i * 97) % (W + 80));
      rect(x, y, 30 + ((i * 17) % 50), 0.8, 'rgba(255,255,255,.35)');
    }
    ctx.globalCompositeOperation = 'source-over';
  } else if (id == 'evac') {
    const k = (Math.sin(V.TT * 0.3) + 1) / 2;
    rect(0, 0, W, H, 'rgba(255,40,60,' + 0.08 * k + ')');
    ctx.fillStyle = rgr(
      W / 2,
      H / 2,
      H * 0.3,
      W * 0.6,
      'rgba(255,0,0,0)',
      'rgba(255,30,50,' + 0.25 * k + ')',
    );
    ctx.fillRect(0, 0, W, H);
  } else if (id == 'glitch' && G.frame % 3) {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    for (let i = 0; i < 7; i++) {
      const sy = (Math.random() * cv.height) | 0,
        h = 4 + ((Math.random() * cv.height * 0.05) | 0),
        dx = ((Math.random() - 0.5) * cv.width * 0.05) | 0;
      ctx.drawImage(cv, 0, sy, cv.width, h, dx, sy, cv.width, h);
    }
    ctx.restore();
    ctx.globalCompositeOperation = 'lighter';
    rect(0, 0, W, H, ['rgba(255,0,255,.06)', 'rgba(0,255,255,.06)', 'rgba(0,255,90,.05)'][G.frame % 3]);
    ctx.globalCompositeOperation = 'source-over';
  }
  const lbl = G.evt.name + '  ' + Math.max(0, Math.ceil((G.evt.dur - G.evt.t) / 60)) + 's',
    w = tw(lbl, 6, { b: 1, w: 900 }) + 18,
    k = E.back(clamp(G.evt.t / 18, 0, 1));
  ctx.save();
  ctx.translate(6 + w / 2, 53);
  ctx.scale(k, k);
  rr(-w / 2, -6, w, 12, 6, lgr(0, -6, 0, 6, '#ffe95c', '#f0b800'), OL, 0.8);
  TX('⚡', -w / 2 + 7, 0.3, 6, '#1b2a78');
  TX(lbl, 7, 0.4, 6, '#0f1a48', { b: 1, w: 900 });
  ctx.restore();
}

/** A post-it stuck on a slowed enemy. */
function slowTag(e) {
  const x = ix(e) + e.w / 2,
    y = iy(e) - 3,
    a = Math.min(1, e.slowT / 30);
  ctx.globalAlpha = a;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.2 + Math.sin(V.TT * 0.1) * 0.08);
  rr(-3, -3, 6, 6, 0.3, '#ffe95c', OL, 0.4);
  ctx.restore();
  ctx.globalAlpha = 1;
}
/** "On hold": note bubbles or a meeting clock over every enemy while time is frozen. */
function holdMarks() {
  const hold = G.freezeKind == 'hold',
    mark = (x, y, i) => {
      const k = ((V.TT * 0.03 + i * 0.37) % 1) * 8;
      ctx.globalAlpha = 1 - k / 8;
      if (hold) TX(i % 2 ? '♪' : '♫', x + k * 0.6, y - k, 6, '#c9a2ff', { w: 700, sk: OL, sw: 0.8 });
      else TX('zZ', x + k * 0.6, y - k, 5, '#ffd500', { w: 700, sk: OL, sw: 0.8 });
      ctx.globalAlpha = 1;
    };
  G.ens.forEach((e, i) => e.act && !e.gone && mark(ix(e) + e.w / 2, iy(e) - 6, i));
  if (G.boss && G.bossOn && !G.boss.dead) mark(G.boss.x + G.boss.w / 2, G.boss.y - 10, 9);
}
function freezeOverlay() {
  const hold = G.freezeKind == 'hold',
    k = Math.min(1, G.freezeT / 20);
  ctx.globalAlpha = 0.18 * k;
  rect(0, 0, W, H, hold ? '#8a4fb0' : '#2f6bff');
  ctx.globalAlpha = k;
  const lb = hold ? '♪ IN ATTESA… RESTI IN LINEA ♪' : '⏱ RIUNIONE LAMPO IN CORSO',
    w = tw(lb, 6, { b: 1, w: 900 }) + 20;
  rr(W / 2 - w / 2, 46, w, 13, 6.5, hold ? 'rgba(90,40,120,.9)' : 'rgba(10,30,90,.9)', '#ffffff', 0.6);
  TX(lb, W / 2, 52.8, 6, '#ffffff', { b: 1, w: 900 });
  ctx.globalAlpha = 1;
}
function rewindOverlay() {
  const k = G.rewT / 50;
  ctx.globalAlpha = 0.35 * k;
  for (let y = 0; y < H; y += 3) rect(0, y, W, 1, '#000000');
  rect(0, ((V.TT * 7) % (H + 40)) - 20, W, 14, 'rgba(255,255,255,.25)');
  ctx.globalAlpha = k;
  TX('◀◀ ROLLBACK', 16, 64, 10, '#3cff7a', { a: 'left', w: 700, sk: '#000000', sw: 2 });
  ctx.globalAlpha = 1;
}
