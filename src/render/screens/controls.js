/** @file "Come si gioca" screen shown after picking a hero: animated controls cheat-sheet. */
import { ALLY_OF, ANAME, FLOAT } from '../../data/allies.js';
import { CH } from '../../data/heroes.js';
import { drawAllyBody } from '../characters/allies.js';
import { TX, ci, ctx, el, glass, glow, lgr, ln, pth, rect, rr, tw } from '../../engine/canvas.js';
import { H, OL, W } from '../../engine/config.js';
import { touchy } from '../../engine/input.js';
import { E, clamp } from '../../engine/math.js';
import { G } from '../../game/state.js';
import { V } from '../interp.js';
import { heroAt, scenery0 } from './menus.js';

/** Frames each control stays highlighted in the demo cycle. */
const BEAT = 96;

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
  if (c.fKey)
    rows.push({
      k: ['F'],
      alt: 'E',
      t: [c.fKey.act === 'freeze' ? '⏱' : '↗', '#c89600'],
      n: c.fKey.n,
      s: c.fKey.s,
      act: c.fKey.act,
    });
  if (ch === 6)
    rows.push({
      k: ['AUTO'],
      alt: '1 volta per livello',
      t: ['◀◀', '#18a858'],
      n: 'ROLLBACK',
      s: 'Invece di morire torni indietro',
      act: 'rewind',
    });
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

/* ---------- per-command demo animations (card space, hero feet at 71,186) ---------- */
const CX = 71,
  FY = 186;

function star(x, y, r, c, rot) {
  const p = [];
  for (let i = 0; i < 10; i++) {
    const a = rot + (i * Math.PI) / 5,
      rr2 = i % 2 ? r * 0.45 : r;
    p.push(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2);
  }
  pth(p, c, OL, 0.6);
}
function burst(x, y, k, n, r, c) {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + i,
      d = E.out(k) * r;
    ctx.globalAlpha = clamp(1 - k, 0, 1);
    star(x + Math.cos(a) * d, y + Math.sin(a) * d, 2.4 * (1 - k * 0.5), c, a + k * 4);
  }
  ctx.globalAlpha = 1;
}
function ring(x, y, k, r, c, w) {
  ctx.globalAlpha = clamp(1 - k, 0, 1);
  ctx.beginPath();
  ctx.arc(x, y, Math.max(0.1, E.out(k) * r), 0, Math.PI * 2);
  ctx.strokeStyle = c;
  ctx.lineWidth = w * (1 - k) + 0.3;
  ctx.stroke();
  ctx.globalAlpha = 1;
}
function stampTxt(txt, x, y, k, c) {
  if (k <= 0) return;
  const s = 0.4 + E.back(Math.min(1, k * 2.4)) * 0.6;
  ctx.save();
  ctx.globalAlpha = clamp((1 - k) * 4, 0, 1);
  ctx.translate(x, y);
  ctx.rotate(-0.12);
  ctx.scale(s, s);
  TX(txt, 0, 0, 11, c, { w: 700, sk: '#0a1436', sw: 2.6, sh: true });
  ctx.restore();
  ctx.globalAlpha = 1;
}
/** Hero-specific projectile glyph. */
function shot(ch, form, x, y, t) {
  if (ch === 0) {
    glow(x, y, 9, '#66f0ff', 0.6);
    TX('FEAR', x, y, 6.5, '#bff8ff', { w: 700, sk: '#0a2a6a', sw: 1.6 });
  } else if (ch === 1) {
    glow(x, y, 10, '#ffe95c', 0.7);
    pth(
      [x - 6, y - 4, x + 1, y - 1, x - 1, y + 1, x + 7, y + 4, x - 1, y - 0.5, x + 1, y - 2.5],
      '#fff27a',
      OL,
      0.6,
    );
  } else if (ch === 2) {
    rr(x - 9, y - 5, 18, 10, 4, '#ffffff', OL, 0.6);
    pth([x - 4, y + 4.6, x - 6, y + 8, x - 1, y + 4.6], '#ffffff', OL, 0.6);
    TX('#@*!', x, y + 0.3, 5.4, '#e0303e', { w: 700 });
  } else if (ch === 3) {
    glow(x, y, 9, '#66f0ff', 0.6);
    TX('π', x, y, 11, '#9ff6ff', { sk: '#0a2a6a', sw: 1.8 });
  } else if (ch === 5) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t * 0.25);
    rr(-4, -4, 8, 8, 0.4, '#ffe95c', OL, 0.5);
    ctx.restore();
  } else if (ch === 6) {
    rr(x - 6, y - 4, 12, 8, 0.6, lgr(0, y - 4, 0, y + 4, '#3a7bff', '#1b3fa0'), OL, 0.6);
    for (let i = 0; i < 4; i++) ln(x - 4 + i * 2.6, y - 3, x - 4 + i * 2.6, y + 3, 'rgba(0,0,0,.25)', 0.5);
  } else if (ch === 7) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t * 0.35);
    rr(-1.6, -6, 3.2, 12, 1.4, '#1a1a22', OL, 0.5);
    el(0, -6, 2.8, 1.8, '#1a1a22');
    el(0, 6, 2.8, 1.8, '#1a1a22');
    ctx.restore();
    TX('DRIIN', x, y - 10, 3.6, '#c9a2ff', { b: 1, w: 900 });
  } else if (form === 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t * 0.3);
    rr(-3, -2.5, 6, 5, 1.2, '#ffffff', OL, 0.5);
    rect(-2.4, -2, 4.8, 1.4, '#5a3216');
    ctx.restore();
    for (let i = 0; i < 2; i++)
      ln(x - 1 + i * 2, y - 5, x - 2 + i * 2, y - 8 - Math.sin(t * 0.3 + i), 'rgba(255,255,255,.6)', 0.5);
  } else {
    pth([x + 6, y, x - 5, y - 4, x - 2, y, x - 5, y + 3], '#ffffff', OL, 0.6);
    ln(x - 2, y, x + 6, y, '#c9d2f0', 0.4);
  }
}
function enemyBlob(x, y, k, hurt) {
  // a generic grumpy office blob used as a demo target
  const sq = hurt ? 1 + Math.sin(k * 30) * 0.15 : 1 + Math.sin(V.TT * 0.15) * 0.04;
  el(x, y + 0.5, 7, 1.6, 'rgba(0,0,0,.3)');
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1 / sq, sq);
  el(0, -6, 7, 6.5, hurt ? '#ff8a9a' : '#8a96c0', OL, 0.7);
  ln(-3.2, -8.6, -1, -7.6, OL, 0.7);
  ln(3.2, -8.6, 1, -7.6, OL, 0.7);
  ci(-2, -6.4, 0.9, OL);
  ci(2, -6.4, 0.9, OL);
  ln(-2, -3, 2, -3.2, OL, 0.6);
  ctx.restore();
}

/** Effects drawn behind the hero. */
function demoBack(act, ph, ch, pressed) {
  if (act === 'special') {
    const ch2 = clamp(ph / 0.45, 0, 1);
    // charge: rings converge on the hero
    if (ph < 0.45)
      for (let i = 0; i < 3; i++) {
        const k = (ch2 * 1.6 + i / 3) % 1;
        ring(CX, FY - 22, k, 46 - 40 * k, '#ffe95c', 1.4);
      }
    else {
      const k = (ph - 0.45) / 0.55;
      ctx.save();
      ctx.translate(CX, FY - 22);
      ctx.rotate(V.TT * 0.02);
      ctx.globalAlpha = 0.5 * (1 - k);
      for (let i = 0; i < 12; i++) {
        ctx.rotate(Math.PI / 6);
        pth([0, 0, -5, -90, 5, -90], i % 2 ? '#ffd500' : '#2f6bff');
      }
      ctx.restore();
      ctx.globalAlpha = 1;
      glow(CX, FY - 22, 70, '#ffe95c', 0.6 * (1 - k));
    }
  } else if (act === 'run') {
    for (let i = 0; i < 5; i++) {
      const y = 140 + i * 9,
        x = ((V.TT * 3 + i * 37) % 130) + 8;
      ln(x, y, x + 14 + i * 2, y, 'rgba(160,190,255,.25)', 0.8);
    }
  } else if (act === 'idle') {
    // coffee break bubble
    const k = E.back(clamp(ph * 3, 0, 1));
    ctx.save();
    ctx.translate(CX + 24, FY - 66);
    ctx.scale(k, k);
    el(0, 0, 13, 10, '#ffffff', OL, 0.7);
    ci(-9, 10, 2, '#ffffff', OL, 0.5);
    ci(-12, 14, 1.2, '#ffffff', OL, 0.4);
    rr(-5, -4, 4, 9, 1, '#2f6bff');
    rr(1, -4, 4, 9, 1, '#2f6bff');
    ctx.restore();
  }
}

/** Effects drawn in front of the hero. */
function demoFront(act, ph, ch, form, pressed, cyc) {
  const t = V.TT;
  if (act === 'run') {
    if ((cyc >> 2) % 2 === 0)
      for (let i = 0; i < 3; i++) {
        const k = (t * 0.05 + i / 3) % 1,
          f = Math.floor(cyc / (BEAT / 2)) % 2 ? 1 : -1;
        ctx.globalAlpha = 0.6 * (1 - k);
        ci(CX + f * (8 + k * 16), FY - 2 - k * 6, 2 + k * 4, '#dfe6ff');
      }
    ctx.globalAlpha = 1;
  } else if (act === 'jump') {
    const k = ph;
    if (k < 0.15) ring(CX - 16, FY, k / 0.15, 22, '#dfe6ff', 2);
    if (ch === 0 && k > 0.1 && k < 0.9)
      for (let i = 0; i < 3; i++) {
        const fk = (k * 2 + i * 0.3) % 1;
        ctx.save();
        ctx.translate(CX - 12 + i * 10, FY - 30 + fk * 40);
        ctx.rotate(Math.sin(t * 0.1 + i) * 0.8);
        ctx.globalAlpha = 1 - fk;
        el(0, 0, 1.4, 4, '#4a9cff', OL, 0.4);
        ctx.restore();
      }
    ctx.globalAlpha = 1;
    // enemy squashed by the stomp
    const hit = k > 0.8;
    if (!hit || k < 0.9) {
      ctx.save();
      ctx.translate(CX + 16, FY);
      ctx.scale(1, hit ? 0.4 : 1);
      enemyBlob(0, 0, k, hit);
      ctx.restore();
    }
    if (hit) burst(CX + 16, FY - 6, (k - 0.8) / 0.2, 6, 18, '#ffe95c');
  } else if (act === 'shoot') {
    enemyBlob(CX + 44, FY, ph, ph > 0.55 && ph < 0.8);
    if (ph > 0.12 && ph < 0.55) {
      const k = (ph - 0.12) / 0.43;
      shot(
        ch,
        form,
        CX + 14 + k * 28,
        FY - 24 + Math.sin(k * Math.PI) * (ch === 4 && form === 0 ? -10 : 0),
        t,
      );
    }
    if (ph > 0.55 && ph < 0.85) burst(CX + 44, FY - 8, (ph - 0.55) / 0.3, 7, 18, '#ff9a3a');
  } else if (act === 'special') {
    if (ph < 0.45) {
      // charging bar over the head
      const k = ph / 0.45;
      rr(CX - 22, FY - 76, 44, 6, 3, 'rgba(3,8,34,.85)', OL, 0.5);
      rr(CX - 21.4, FY - 75.4, 42.8 * k, 4.8, 2.4, lgr(CX - 22, 0, CX + 22, 0, '#ffe95c', '#ff9a3a'));
      for (let i = 0; i < 6; i++) {
        const a = i + t * 0.07,
          d = 40 * (1 - ((k * 2 + i / 6) % 1));
        ci(CX + Math.cos(a) * d, FY - 22 + Math.sin(a) * d, 1.3, '#fff6a0');
      }
    } else {
      const k = (ph - 0.45) / 0.55;
      ring(CX, FY - 22, k, 70, '#ffe95c', 4);
      ring(CX, FY - 22, clamp(k * 1.4, 0, 1), 50, '#66f0ff', 2.4);
      burst(CX, FY - 22, k, 10, 50, '#ffe95c');
      stampTxt('SINERGIA!', CX, FY - 80, k, lgr(0, -8, 0, 8, '#fff6a0', '#ffc400'));
    }
  } else if (act === 'ally') {
    const type = ALLY_OF[ch],
      fl = FLOAT[type] ? -16 : 0;
    if (ph < 0.3) {
      // phone ringing
      const k = ph / 0.3,
        sh = Math.sin(t * 1.4) * 1.4;
      ctx.save();
      ctx.translate(CX + 28 + sh, FY - 58);
      ctx.rotate(Math.sin(t * 1.4) * 0.15);
      rr(-5, -8, 10, 16, 2.4, '#1b2450', OL, 0.6);
      rr(-3.8, -6.2, 7.6, 10, 1, '#66f0ff');
      ctx.restore();
      for (let i = 0; i < 2; i++) ring(CX + 28, FY - 58, (k * 2 + i * 0.5) % 1, 14, '#5fe6d6', 1.2);
      TX('CHIAMATA…', CX + 28, FY - 74, 5, '#5fe6d6', { b: 1, w: 900 });
    } else {
      const k = (ph - 0.3) / 0.7,
        e = E.back(clamp(k * 2.2, 0, 1)),
        ax = CX + 30 + (1 - e) * 70;
      if (k < 0.35) {
        // arrival poof
        for (let i = 0; i < 7; i++) {
          const a = i * 0.9,
            d = E.out(k / 0.35) * 18;
          ctx.globalAlpha = 1 - k / 0.35;
          ci(CX + 30 + Math.cos(a) * d, FY - 12 + Math.sin(a) * d * 0.6, 5 - k * 8, '#ffffff');
        }
        ctx.globalAlpha = 1;
      }
      glow(ax, FY - 14 + fl, 22, '#5fe6d6', 0.35);
      ctx.save();
      ctx.translate(ax, FY + Math.sin(t * 0.15) * (fl ? 2 : 0));
      ctx.scale(1.25, 1.25);
      drawAllyBody(type, 0, fl, -1, G.frame, -1, 0, k < 0.4, t * 0.2);
      ctx.restore();
      if (k > 0.3) {
        const kk = clamp((k - 0.3) / 0.2, 0, 1),
          nm = ANAME[type],
          w = tw(nm, 4.6, { b: 1, w: 900 }) + 10,
          ty = FY + 4,
          tx = clamp(ax, 13 + w / 2, 129 - w / 2);
        ctx.globalAlpha = kk;
        rr(tx - w / 2, ty - (1 - kk) * 6, w, 9, 4.5, lgr(0, 0, 0, 9, '#5ff0de', '#14a898'), OL, 0.5);
        TX(nm, tx, ty + 4.4 - (1 - kk) * 6, 4.6, '#03302a', { b: 1, w: 900 });
        ctx.globalAlpha = 1;
        for (let i = 0; i < 3; i++) {
          const hk = (k * 1.5 + i * 0.33) % 1;
          ctx.globalAlpha = 1 - hk;
          TX('♥', ax - 8 + i * 8, FY - 40 + fl - hk * 16, 6, '#ff6a8a', { w: 700 });
        }
        ctx.globalAlpha = 1;
      }
    }
  } else if (act === 'bomb') {
    const alive = ph < 0.5;
    for (let i = 0; i < 3; i++) {
      const ex = 26 + i * 40 + (i === 1 ? 6 : 0),
        ey = 90 + (i % 2) * 22;
      if (alive) {
        ctx.save();
        ctx.translate(ex, ey);
        ctx.scale(0.7, 0.7);
        enemyBlob(0, 0, ph, false);
        ctx.restore();
      } else if (ph < 0.8) burst(ex, ey - 5, (ph - 0.5) / 0.3, 5, 14, '#ffe95c');
    }
    if (ph > 0.1 && ph < 0.42) {
      // ticket thrown up
      const k = (ph - 0.1) / 0.32;
      ctx.save();
      ctx.translate(CX + 10, FY - 40 - k * 50);
      ctx.rotate(k * 9);
      rr(-6, -4, 12, 8, 1.2, '#ffffff', OL, 0.6);
      rect(-6, -4, 12, 2.6, '#e0303e');
      ctx.restore();
    }
    if (ph > 0.42) {
      const k = (ph - 0.42) / 0.58;
      ctx.globalAlpha = clamp(1 - k * 3, 0, 1) * 0.8;
      rect(10, 40, 122, 196, '#ffffff');
      ctx.globalAlpha = 1;
      ring(CX + 10, 96, k, 90, '#ff3b4a', 5);
      ring(CX + 10, 96, clamp(k * 1.3, 0, 1), 70, '#ffe95c', 3);
      stampTxt('RISOLTO!', CX, 72, k, lgr(0, -8, 0, 8, '#ffb0b8', '#ff3b4a'));
    }
  } else if (act === 'freeze') {
    const frozen = ph > 0.25 && ph < 0.9,
      ex = CX + 40 - (frozen ? 0.25 * 30 : ph * 30) + (ph >= 0.9 ? (ph - 0.9) * 30 : 0);
    enemyBlob(ex, FY, ph, false);
    if (frozen) {
      ctx.globalAlpha = 0.25;
      rect(10, 40, 122, 196, '#2f6bff');
      ctx.globalAlpha = 1;
      const k = (ph - 0.25) / 0.65;
      ci(CX, FY - 74, 11, '#ffffff', OL, 0.8);
      ln(CX, FY - 74, CX, FY - 81, OL, 1);
      ln(CX, FY - 74, CX + Math.cos(k * 12) * 6, FY - 74 + Math.sin(k * 12) * 6, '#e8505b', 0.9);
      TX('zZ', ex + 4 + Math.sin(t * 0.1) * 2, FY - 20 - (t % 30) / 3, 6, '#ffd500', {
        w: 700,
        sk: OL,
        sw: 0.8,
      });
      stampTxt('RIUNIONE!', CX, FY - 96, Math.min(0.5, k), lgr(0, -8, 0, 8, '#fff6a0', '#ffc400'));
    }
  } else if (act === 'rewind') {
    if (ph > 0.3 && ph < 0.75) {
      ctx.globalAlpha = 0.35;
      for (let y = 40; y < 236; y += 3) rect(10, y, 122, 1, '#000000');
      ctx.globalAlpha = 1;
      TX('◀◀', CX, FY - 80, 12, '#3cff7a', { w: 700, sk: '#000000', sw: 2 });
    }
    if (ph < 0.3) burst(CX + 20, FY - 20, ph / 0.3, 6, 20, '#ff3b4a');
  } else if (act === 'swap') {
    const k = clamp((ph - 0.15) / 0.35, 0, 1);
    if (ph > 0.15 && ph < 0.7) {
      ctx.save();
      ctx.translate(CX, FY - 24);
      ctx.rotate(t * 0.25);
      ctx.globalAlpha = Math.sin(k * Math.PI) * 0.9 + 0.1;
      for (let i = 0; i < 2; i++) {
        ctx.rotate(Math.PI);
        ctx.beginPath();
        ctx.arc(0, 0, 26, 0, 2.2);
        ctx.strokeStyle = i ? '#ffd500' : '#2f6bff';
        ctx.lineWidth = 3;
        ctx.stroke();
        pth([26, 2.2, 30, -3, 22, -3], i ? '#ffd500' : '#2f6bff');
      }
      ctx.restore();
      ctx.globalAlpha = 1;
    }
    if (ph > 0.25 && ph < 0.55) burst(CX, FY - 24, (ph - 0.25) / 0.3, 8, 30, '#ffffff');
    if (ph > 0.3)
      stampTxt(
        ph > 0.3 ? 'CAMBIO!' : '',
        CX,
        FY - 78,
        (ph - 0.3) / 0.7,
        lgr(0, -8, 0, 8, '#fff6a0', '#ffc400'),
      );
  } else if (act === 'idle') {
    for (let i = 0; i < 3; i++) {
      const k = (t * 0.012 + i / 3) % 1;
      ctx.globalAlpha = 1 - k;
      TX('z', CX + 14 + k * 14, FY - 56 - k * 22, 5 + k * 5, '#cfd9ff', { w: 700 });
    }
    ctx.globalAlpha = 1;
  }
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
      shootT: act === 'shoot' && ph > 0.08 && ph < 0.3 ? 8 : 0,
      sp: act === 'special' ? 100 : 40,
      face: act === 'run' && Math.floor(cyc / (BEAT / 2)) % 2 ? -1 : 1,
      run: act === 'run' ? 1 : 0,
      ph: act === 'run' ? V.TT * 0.2 : 0,
      flap: act === 'jump' && ch === 0 ? V.TT * 0.4 : 0,
    };
  const form = ch === 4 ? (act === 'swap' && ph > 0.3 ? 1 : 0) : 0;
  ctx.save();
  ctx.beginPath();
  ctx.rect(10, 40, 122, 196);
  ctx.clip();
  demoBack(act, ph, ch, pressed);
  const shake = act === 'bomb' && ph > 0.42 && ph < 0.6 ? Math.sin(V.TT * 3) * 1.5 : 0;
  const leap = act === 'leap' ? Math.sin(clamp(ph / 0.7, 0, 1) * Math.PI) : 0,
    jx =
      act === 'jump'
        ? -16 + E.io(ph) * 30
        : act === 'ally'
          ? -16 * E.io(clamp(ph * 3, 0, 1))
          : act === 'leap'
            ? -40 + E.io(clamp(ph / 0.7, 0, 1)) * 80
            : act === 'rewind'
              ? ph < 0.3
                ? 20
                : 20 - E.io(clamp((ph - 0.3) / 0.45, 0, 1)) * 34
              : 0;
  if (act === 'leap' && ph < 0.7)
    for (let i = 1; i < 5; i++) {
      ctx.globalAlpha = 0.18;
      heroAt(ch, form, 71 + jx - i * 9, 186 - leap * 34 + i * 2, 2.1, o);
      ctx.globalAlpha = 1;
    }
  if (act === 'rewind' && ph < 0.3) ctx.globalAlpha = (V.TT >> 2) % 2 ? 0.4 : 1;
  heroAt(ch, form, 71 + shake + jx, 186 - jump * 30 - leap * 34, 2.1, o);
  ctx.globalAlpha = 1;
  demoFront(act, ph, ch, form, pressed, cyc);
  ctx.restore();
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
