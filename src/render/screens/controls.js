/** @file "Come si gioca" screen shown after picking a hero: animated controls cheat-sheet. */
import { CH } from '../../data/heroes.js';
import { TX, ci, ctx, glass, glow, lgr, rect, rr, tw } from '../../engine/canvas.js';
import { H, OL, W } from '../../engine/config.js';
import { touchy } from '../../engine/input.js';
import { E, clamp } from '../../engine/math.js';
import { G } from '../../game/state.js';
import { V } from '../interp.js';
import { heroAt, scenery0 } from './menus.js';

/** Frames each control stays highlighted in the demo cycle. */
const BEAT = 56;

/**
 * Control rows for the chosen hero. `k` are keyboard caps, `alt` the
 * alternative keys, `t` the touch button (label + colour), `act` the pose
 * the hero shows while the row is highlighted.
 */
export function controlsFor(ch) {
  const c = CH[ch];
  const rows = [
    {
      k: ['←', '→'],
      alt: 'A · D',
      t: ['◀ ▶', '#3a5ad0'],
      n: 'MUOVITI',
      s: 'Corri tra i piani',
      act: 'run',
    },
    {
      k: ['↑'],
      alt: 'W · SPAZIO · Z',
      t: ['SALTA', '#ffd000'],
      n: ch === 0 ? 'SALTA E VOLA' : 'SALTA',
      s: ch === 0 ? 'Tieni premuto in aria per volare' : 'Atterra in testa ai nemici!',
      act: 'jump',
    },
    {
      k: ['X'],
      alt: 'J',
      t: [c.wepBtn || 'SPARA', '#3fd6ff'],
      n: 'SPARA',
      s: 'Arma: ' + (ch === 4 ? 'ESPRESSO / AEREI' : c.wep),
      act: 'shoot',
    },
    {
      k: ['C'],
      alt: 'K · SHIFT',
      t: ['SIN', '#ffb000'],
      n: 'SINERGIA',
      s: 'Quando la barra è piena',
      act: 'special',
    },
    {
      k: ['V'],
      alt: 'T',
      t: ['ALLY', '#18b8a8'],
      n: 'ALLEATO',
      s: c.ally + ' · 10 buoni pasto',
      act: 'ally',
    },
    {
      k: ['B'],
      alt: 'Q',
      t: ['TICKET', '#ff3b4a'],
      n: 'TICKET',
      s: 'Bomba: pulisce lo schermo',
      act: 'bomb',
    },
  ];
  if (ch === 4)
    rows.push({
      k: ['F'],
      alt: 'E',
      t: ['⇄', '#c89600'],
      n: 'CAMBIO',
      s: 'Gian Daniele ⇄ Giammario',
      act: 'swap',
    });
  rows.push({
    k: ['P'],
    alt: 'ESC · M musica',
    t: ['II', '#5a6aa0'],
    n: 'PAUSA',
    s: 'Anche il capo va in pausa',
    act: 'idle',
  });
  return rows;
}

function keyCap(x, y, label, down, hot) {
  const w = Math.max(14, tw(label, 7, { w: 700 }) + 8),
    d = down ? 1.4 : 0;
  rr(x, y + 2.4, w, 13, 3, 'rgba(0,0,0,.45)');
  rr(
    x,
    y + d,
    w,
    13,
    3,
    lgr(0, y, 0, y + 13, hot ? '#fff6b0' : '#f4f6ff', hot ? '#ffc400' : '#c9d2f0'),
    OL,
    0.7,
  );
  rr(x + 1.5, y + d + 1, w - 3, 4, 2, 'rgba(255,255,255,.55)');
  TX(label, x + w / 2, y + d + 7, 7, '#0f1a48', { w: 700 });
  return w;
}

function touchBtn(x, y, label, col, down) {
  const r = 7.5,
    s = down ? 0.9 : 1;
  ctx.save();
  ctx.translate(x + r, y + 7);
  ctx.scale(s, s);
  ci(0, 1.6, r, 'rgba(0,0,0,.4)');
  ci(0, 0, r, col, 'rgba(255,255,255,.8)', 0.8);
  ci(-2.4, -2.6, 2.4, 'rgba(255,255,255,.35)');
  TX(label, 0, 0.3, label.length > 3 ? 3.4 : 4.6, '#ffffff', { b: 1, w: 900, sk: 'rgba(0,0,0,.35)', sw: 1 });
  ctx.restore();
  return r * 2;
}

/** Diagonal brand stripes drifting behind the cards. */
function stripes() {
  ctx.save();
  ctx.globalAlpha = 0.07;
  const o = (V.TT * 0.4) % 40;
  for (let x = -H; x < W + 40; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x + o, 0);
    ctx.lineTo(x + o + 14, 0);
    ctx.lineTo(x + o + 14 - H, H);
    ctx.lineTo(x + o - H, H);
    ctx.fillStyle = (x / 40) % 2 ? '#ffd500' : '#2f6bff';
    ctx.fill();
  }
  ctx.restore();
}

export function drawControls() {
  const ch = G.selCh,
    c = CH[ch],
    rows = controlsFor(ch),
    tch = touchy(),
    t = G.st;
  scenery0(V.TT * 0.15);
  rect(0, 0, W, H, lgr(0, 0, 0, H, 'rgba(4,10,40,.78)', 'rgba(2,6,30,.9)'));
  stripes();

  // title
  const tk = E.back(t / 18);
  ctx.save();
  ctx.translate(W / 2, 17);
  ctx.scale(tk, tk);
  TX('COME SI GIOCA', 0, 0, 14, lgr(0, -8, 0, 8, '#fff6a0', '#ffc400'), {
    w: 700,
    sk: '#0a1436',
    sw: 3,
    sh: true,
  });
  ctx.restore();
  ctx.globalAlpha = clamp((t - 8) / 14, 0, 1);
  TX(tch ? 'Comandi touch' : 'Comandi da tastiera', W / 2, 31, 5.4, '#9fb4ff', { b: 1, w: 800 });
  ctx.globalAlpha = 1;

  // which row is being demonstrated
  const cyc = Math.max(0, t - 30),
    hot = Math.floor(cyc / BEAT) % rows.length,
    ph = (cyc % BEAT) / BEAT,
    pressed = t > 30 && ph > 0.12 && ph < 0.42,
    act = t > 30 ? rows[hot].act : 'idle';

  // hero card (slides in from the left)
  const hx = -150 * (1 - E.out((t - 4) / 22));
  ctx.save();
  ctx.translate(hx, 0);
  glass(10, 40, 122, 196, 10, 0.62);
  glow(71, 150, 60, '#ffd500', 0.12 + 0.05 * Math.sin(V.TT * 0.08));
  // podium
  ctx.save();
  ctx.translate(71, 186);
  ctx.scale(1, 0.32);
  ci(0, 0, 34, 'rgba(255,213,0,.18)', 'rgba(255,213,0,.5)', 1);
  ctx.restore();
  const jump = act === 'jump' ? Math.sin(ph * Math.PI) : 0,
    o = {
      vx: act === 'run' ? 2.2 : 0,
      onGround: !jump,
      vy: act === 'jump' ? (ph < 0.5 ? -3 : 3) : 0,
      shootT: act === 'shoot' && pressed ? 8 : 0,
      sp: act === 'special' ? 100 : 40,
      face: act === 'run' && Math.floor(cyc / (BEAT / 2)) % 2 ? -1 : 1,
      run: act === 'run' ? 1 : 0,
      ph: act === 'run' ? V.TT * 0.2 : 0,
      flap: act === 'jump' && ch === 0 ? V.TT * 0.4 : 0,
    };
  const form = ch === 4 ? (act === 'swap' && ph > 0.3 ? 1 : 0) : 0;
  if (act === 'special' && pressed) glow(71, 150, 50, '#ffe95c', 0.5);
  heroAt(ch, form, 71, 186 - jump * 26, 2.1, o);
  if (act === 'shoot' && pressed) {
    const bx = 71 + o.face * (20 + (ph - 0.12) * 120);
    glow(bx, 158, 8, '#66f0ff', 0.8);
    ci(bx, 158, 2.4, '#bff8ff', OL, 0.5);
  }
  TX(c.name, 71, 204, 9, '#ffffff', { w: 700, sk: '#0a1436', sw: 2 });
  TX(c.desc, 71, 216, 4.6, '#cfd9ff', { b: 1, w: 700 });
  rr(30, 222, 82, 9, 4.5, 'rgba(255,213,0,.92)', OL, 0.5);
  TX('ABILITÀ · ' + c.abil.replace(' (F)', ''), 71, 226.6, 3.9, '#0f1a48', { b: 1, w: 900 });
  ctx.restore();

  // control cards
  const cols = 2,
    cw = 162,
    chh = rows.length > 7 ? 40 : 46,
    gx = 142,
    gy = 40;
  rows.forEach((r, i) => {
    const col = i % cols,
      row = Math.floor(i / cols),
      x = gx + col * (cw + 6),
      y = gy + row * (chh + 4),
      k = E.back((t - 10 - i * 4) / 18),
      on = t > 30 && i === hot;
    if (k <= 0) return;
    ctx.save();
    ctx.translate(x + cw / 2 + (1 - k) * 60, y + chh / 2);
    ctx.globalAlpha = clamp(k, 0, 1);
    const s = on ? 1.03 : 1;
    ctx.scale(s, s);
    ctx.translate(-cw / 2, -chh / 2);
    if (on) glow(cw / 2, chh / 2, 60, '#ffd500', 0.16);
    glass(0, 0, cw, chh - 4, 7, on ? 0.82 : 0.58);
    if (on) rr(0, 0, cw, chh - 4, 7, null, '#ffd500', 1.2);
    let kx = 7;
    const ky = (chh - 4) / 2 - 7;
    if (tch) kx += touchBtn(kx, ky, r.t[0], r.t[1], on && pressed) + 4;
    else
      r.k.forEach(l => {
        kx += keyCap(kx, ky, l, on && pressed, on) + 3;
      });
    const lx = Math.max(kx + 4, 46);
    TX(r.n, lx, ky + 4, 6.6, on ? '#ffe95c' : '#ffffff', { a: 'left', w: 700 });
    TX(r.s, lx, ky + 12, 4.4, '#cfd9ff', { a: 'left', b: 1, w: 700 });
    if (!tch && r.alt) TX(r.alt, cw - 6, 6.5, 3.6, 'rgba(160,185,255,.75)', { a: 'right', b: 1, w: 800 });
    ctx.restore();
  });

  // footer prompt
  if (t > 40) {
    const a = 0.55 + 0.45 * Math.sin(V.TT * 0.12),
      lb = tch ? 'TOCCA PER INIZIARE' : 'PREMI INVIO PER INIZIARE';
    const w = tw(lb, 6.4, { b: 1, w: 900 }) + 26;
    rr(W / 2 - w / 2 + 66, H - 24, w, 14, 7, lgr(0, H - 24, 0, H - 10, '#ffe95c', '#ffb000'), OL, 0.7);
    ctx.globalAlpha = a;
    TX(lb, W / 2 + 66, H - 16.6, 6.4, '#3a1a00', { b: 1, w: 900 });
    ctx.globalAlpha = 1;
  }
}
