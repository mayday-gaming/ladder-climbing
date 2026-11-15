/** @file Boss state machines, attacks and damage. */
import { BOSS } from '../data/levels.js';
import { ASDQ } from '../data/quadri.js';
import { Snd } from '../engine/audio.js';
import { C, GY } from '../engine/config.js';
import { clamp, ov, rnd, sgn } from '../engine/math.js';
import { endEvt } from './events.js';
import { mkEnemy } from './level.js';
import { hurt, stomp } from './player.js';
import { addScore, puff, say } from './session.js';
import { G, setState } from './state.js';

export function mkBoss(i) {
  const d = BOSS[i];
  return {
    i,
    name: d.name,
    w: d.w,
    h: d.h,
    x: G.LV.ax + 500,
    y: GY - d.h,
    vx: 0,
    vy: 0,
    hp: d.hp,
    max: d.hp,
    st: 'enter',
    t: 0,
    ph: 0,
    face: -1,
    flash: 0,
    n: 0,
    k: 0,
    alpha: 1,
    dead: false,
    spot: 0,
    hi: false,
  };
}
export function dmgBoss(d, force) {
  const b = G.boss;
  if (b.dead || (!force && b.alpha < 0.6)) return false;
  if (b.i == 6 && b.st == 'piange') {
    d *= 2;
    if (G.frame % 4 == 0) G.pops.push({ x: b.x, y: b.y - 12, txt: '×2', life: 30, c: '#9fd8ff' });
  }
  b.hp -= d;
  b.flash = 6;
  G.score += 10;
  G.P.sp = Math.min(100, G.P.sp + 1.5 * G.P.spRate);
  Snd.sfx('bhit');
  const ph = b.i == 3 ? (b.hp < b.max * 0.33 ? 2 : b.hp < b.max * 0.66 ? 1 : 0) : b.hp < b.max * 0.5 ? 1 : 0;
  if (ph > b.ph) {
    b.ph = ph;
    say(BOSS[b.i].rage || (ph == 2 ? 'È FURIOSO!' : 'SI È ARRABBIATO!'));
    G.shake = 10;
    puff(b.x + b.w / 2, b.y + b.h / 2, 20, [C.yel, C.white], 3, 30);
  }
  if (b.hp <= 0) {
    b.hp = 0;
    b.dead = true;
    endEvt(false);
    b.alpha = 1;
    G.ebul = [];
    G.ens.forEach(e => (e.gone = true));
    Snd.stop();
    Snd.sfx('boom');
    G.P.combo++;
    addScore(5000 * (G.lvl + 1), b.x, b.y - 10, C.cyan);
    setState('bosswin');
  }
  return true;
}
export function updBoss() {
  const b = G.boss,
    p = G.P,
    A = G.LV.ax;
  b.t++;
  if (b.flash > 0) b.flash--;
  const eb = o => G.ebul.push(o);
  if (b.i == 0) {
    const f = b.ph ? 1.35 : 1;
    if (b.st == 'walk') {
      b.face = p.x < b.x ? -1 : 1;
      b.vx = b.face * 0.7 * f;
      if (b.t > 70 / f) {
        b.st = b.n++ % 2 ? 'tele' : 'throw';
        b.t = 0;
        b.vx = 0;
        if (b.st == 'tele') Snd.sfx('charge');
      }
    } else if (b.st == 'throw') {
      const n = b.ph ? 5 : 3;
      if (b.t % 18 == 1 && b.t < 18 * n) {
        eb({
          x: b.x + b.w / 2 - 4,
          y: b.y + 4,
          w: 8,
          h: 9,
          vx: clamp((p.x - b.x) / 56, -3.6, 3.6) + rnd(-0.35, 0.35),
          vy: -4.6,
          g: 0.16,
          kind: b.ph && b.t % 36 == 19 ? 'ham' : 'num',
          life: 300,
        });
        Snd.sfx('throw');
      }
      if (b.t > 18 * n + 22) {
        b.st = 'walk';
        b.t = 0;
      }
    } else if (b.st == 'tele') {
      if (b.t > 40 / f) {
        b.st = 'charge';
        b.t = 0;
        b.vx = b.face * 4.3 * f;
      }
    } else if (b.st == 'charge') {
      if (b.t % 3 == 0) puff(b.x + b.w / 2, GY, 1, C.pale, 1, 14);
      if (b.x <= A + 5 || b.x + b.w >= A + 475) {
        b.vx = 0;
        b.st = 'stun';
        b.t = 0;
        G.shake = 9;
        Snd.sfx('stomp');
      }
    } else if (b.st == 'stun') {
      if (b.t > 55) {
        b.st = 'walk';
        b.t = 0;
      }
    }
    b.x = clamp(b.x + b.vx, A + 4, A + 476 - b.w);
  } else if (b.i == 1) {
    const f = b.ph ? 1.25 : 1;
    if (b.st == 'walk') {
      b.face = p.x + 6 < b.x + b.w / 2 ? -1 : 1;
      if (b.t > 55 / f) {
        if (b.n < (b.ph ? 3 : 2)) {
          b.n++;
          b.st = 'jump';
          b.t = 0;
          b.vy = -7.6;
          b.vx = (clamp(p.x + 6 - b.w / 2, A + 4, A + 476 - b.w) - b.x) / 47.5;
          Snd.sfx('boing');
        } else {
          b.n = 0;
          b.st = 'throw';
          b.t = 0;
        }
      }
    } else if (b.st == 'jump') {
      b.vy += 0.32;
      b.x += b.vx;
      b.y += b.vy;
      if (b.y >= GY - b.h) {
        b.y = GY - b.h;
        b.vy = b.vx = 0;
        b.st = 'walk';
        b.t = 0;
        G.shake = 11;
        Snd.sfx('stomp');
        puff(b.x + b.w / 2, GY, 14, C.pale, 3, 20);
        for (const d of [-1, 1])
          eb({
            x: b.x + b.w / 2 - 7 + d * 18,
            y: GY - 10,
            w: 14,
            h: 10,
            vx: d * 2.8 * f,
            vy: 0,
            g: 0,
            kind: 'wave',
            life: 150,
          });
        if (b.ph)
          for (let k = 0; k < 3; k++)
            eb({
              x: A + 30 + Math.random() * 420,
              y: -14 - k * 34,
              w: 14,
              h: 11,
              vx: 0,
              vy: 1,
              g: 0.05,
              kind: 'fald',
              life: 320,
            });
      }
    } else if (b.st == 'throw') {
      if (b.t % 32 == 10 && b.t < 106) {
        const low = ((b.t / 32) | 0) % 2 == 0;
        eb({
          x: b.x + b.w / 2 - 7,
          y: low ? GY - 13 : GY - 47,
          w: 14,
          h: 11,
          vx: b.face * 2.7 * f,
          vy: 0,
          g: 0,
          kind: 'fald',
          life: 260,
        });
        Snd.sfx('throw');
      }
      if (b.t > 125) {
        b.st = 'walk';
        b.t = 0;
      }
    }
  } else if (b.i == 2) {
    const SP = [
        [60, GY - 44],
        [396, GY - 44],
        [168, 146],
        [288, 146],
        [116, 106],
        [340, 106],
      ],
      f = b.ph ? 1.3 : 1;
    if (b.st == 'walk') {
      b.st = 'vanish';
      b.t = 0;
    }
    if (b.st == 'vanish') {
      b.alpha = Math.max(0, 1 - b.t / 18);
      if (b.t == 1) Snd.sfx('tele');
      if (b.t > 34 / f) {
        let s;
        do {
          s = (Math.random() * SP.length) | 0;
        } while (s == b.spot || Math.abs(A + SP[s][0] - p.x) < 50);
        b.spot = s;
        b.x = A + SP[s][0];
        b.y = SP[s][1];
        b.st = 'appear';
        b.t = 0;
        puff(b.x + 12, b.y + 20, 12, [C.yel, C.bright], 2, 22);
      }
    } else if (b.st == 'appear') {
      b.alpha = Math.min(1, b.t / 16);
      b.face = p.x < b.x ? -1 : 1;
      if (b.t > 24) {
        b.st = 'atk';
        b.t = 0;
        b.n++;
      }
    } else if (b.st == 'atk') {
      const fan = off => {
        const n = b.ph ? 7 : 5,
          a = Math.atan2(p.y + 12 - (b.y + 16), p.x + 6 - (b.x + 12)) + off,
          v = b.ph ? 2.4 : 2;
        for (let k = 0; k < n; k++) {
          const aa = a + (k - (n - 1) / 2) * 0.24;
          eb({
            x: b.x + 8,
            y: b.y + 12,
            w: 9,
            h: 9,
            vx: Math.cos(aa) * v,
            vy: Math.sin(aa) * v,
            g: 0,
            kind: 'bollo',
            life: 280,
          });
        }
        Snd.sfx('throw');
      };
      if (b.n % 3 == 0) {
        if (b.t == 12 && G.ens.length < 3) {
          for (const d of [-1, 1]) {
            const e = mkEnemy({ t: 'busta', x: b.x + d * 24, fy: clamp(b.y + 10, 110, 190), x1: 0, x2: 0 });
            e.act = true;
            e.dir = d;
            G.ens.push(e);
          }
          Snd.sfx('tele');
        }
      } else {
        if (b.t == 14) fan(0);
        if (b.ph && b.t == 40) fan(0.12);
      }
      if (b.t > 95 / f) {
        b.st = 'vanish';
        b.t = 0;
      }
    }
  } else if (b.i == 4) {
    if (b.st == 'walk') {
      b.face = p.x < b.x ? -1 : 1;
      b.vx = Math.abs(p.x - b.x) < 50 ? 0 : b.face * 0.35;
      b.x = clamp(b.x + b.vx, A + 4, A + 476 - b.w);
      if (b.t > (b.ph ? 55 : 75)) {
        b.n++;
        b.st = b.n % 3 == 0 ? 'zen' : 'throw';
        b.t = 0;
        if (b.st == 'zen')
          G.pops.push({ x: b.x - 14, y: b.y - 12, txt: 'Mmmh, camomilla.', life: 70, c: C.white });
      }
    } else if (b.st == 'throw') {
      b.face = p.x < b.x ? -1 : 1;
      const n = b.ph ? 3 : 1;
      if (b.t % 26 == 18 && b.t < 26 * n) {
        const cx = b.x + b.w / 2 - 8,
          cy = b.y - 8;
        if (p.y < GY - 70) {
          const a = Math.atan2(p.y + 12 - cy, p.x + 6 - cx - 8);
          eb({
            x: cx,
            y: cy,
            w: 16,
            h: 7,
            vx: Math.cos(a) * 3.1,
            vy: Math.sin(a) * 3.1,
            g: 0,
            kind: 'kb',
            life: 220,
          });
        } else
          eb({
            x: cx,
            y: cy,
            w: 16,
            h: 7,
            vx: clamp((p.x + p.vx * 20 - b.x) / 66, -3.4, 3.4) + (b.ph ? rnd(-0.4, 0.4) : 0),
            vy: -5,
            g: 0.16,
            kind: 'kb',
            life: 300,
            split: b.ph ? 3 : 2,
          });
        Snd.sfx('throw');
      }
      if (b.t > 26 * n + 22) {
        b.st = 'walk';
        b.t = 0;
      }
    } else if (b.st == 'zen') {
      if (b.t > (b.ph ? 45 : 85)) {
        b.st = 'walk';
        b.t = 0;
      }
    }
  } else if (b.i == 5) {
    const f = b.ph ? 1.3 : 1;
    b.face = p.x < b.x ? -1 : 1;
    if (b.st == 'walk') {
      const tx = p.x < A + 240 ? A + 410 : A + 50;
      b.vx = clamp(tx - b.x, -1, 1) * 0.9 * f;
      b.x = clamp(b.x + b.vx, A + 4, A + 476 - b.w);
      if (b.t > 60 / f) {
        b.st = b.n++ % 2 ? 'glare' : 'mail';
        b.t = 0;
        b.k = 0;
        b.ga = null;
        if (b.st == 'glare') Snd.sfx('charge');
      }
    } else if (b.st == 'mail') {
      const n = b.ph ? 5 : 3;
      if (b.t % 20 == 5 && b.t < 20 * n) {
        eb({
          x: b.x + b.w / 2 - 5,
          y: b.y + 8 + rnd(-16, 8),
          w: 10,
          h: 7,
          vx: b.face * (2 + rnd(0, 0.8)) * f,
          vy: 0,
          g: 0,
          kind: 'mail',
          sw: rnd(0.7, 1.5),
          life: 260,
        });
        Snd.sfx('throw');
      }
      if (b.ph && b.t == 20 * n) {
        for (let k = 0; k < 4; k++)
          eb({
            x: A + 30 + Math.random() * 420,
            y: -14 - k * 30,
            w: 10,
            h: 7,
            vx: 0,
            vy: 1,
            g: 0.04,
            kind: 'mail',
            life: 340,
          });
        G.pops.push({ x: b.x - 20, y: b.y - 12, txt: 'CC: TUTTI!', life: 70, c: C.red });
      }
      if (b.t > 20 * n + 30) {
        b.st = 'walk';
        b.t = 0;
      }
    } else if (b.st == 'glare') {
      const ex = b.x + b.w / 2,
        ey = b.y + 7;
      if (b.t < 42 || b.ga == null) b.ga = Math.atan2(p.y + 12 - ey, p.x + 6 - ex);
      if (b.t == 56) {
        const c = Math.cos(b.ga),
          sn = Math.sin(b.ga);
        for (let k = 0; k < 3; k++)
          eb({
            x: ex - 3 + c * k * 9,
            y: ey - 3 + sn * k * 9,
            w: 6,
            h: 6,
            vx: c * 6,
            vy: sn * 6,
            g: 0,
            kind: 'occh',
            life: 120,
          });
        Snd.sfx('laser');
      }
      if (b.t > 70) {
        if (b.ph && b.k < 1) {
          b.k++;
          b.t = 10;
          b.ga = null;
        } else {
          b.st = 'walk';
          b.t = 0;
        }
      }
    }
  } else if (b.i == 6) {
    const f = b.ph ? 1.3 : 1;
    if (b.sayT > 0) b.sayT--;
    if (b.st == 'walk' || b.st == 'lamenta') {
      b.st = 'lamenta';
      b.face = p.x < b.x ? -1 : 1;
      b.vx = b.face * 0.4;
      b.x = clamp(b.x + b.vx, A + 4, A + 476 - b.w);
      if (b.t % 80 == 2) {
        b.say = ASDQ[b.n++ % ASDQ.length];
        b.sayT = 78;
      }
      if (b.t % 70 == 40) {
        eb({
          x: b.x + b.w / 2 - 5,
          y: b.y + 6,
          w: 10,
          h: 7,
          vx: b.face * rnd(1.6, 2.4),
          vy: -2.6,
          g: 0.1,
          kind: 'mail',
          sw: 1,
          life: 240,
        });
        Snd.sfx('throw');
      }
      if (b.t > 220 / f) {
        b.st = 'piange';
        b.t = 0;
        b.vx = 0;
        b.say = 'Sniff… nessuno mi capisce…';
        b.sayT = 100;
      }
    } else if (b.st == 'piange') {
      b.vx = 0;
      if (b.t % 12 == 0) puff(b.x + b.w / 2 + b.face * 4, b.y + 8, 2, ['#9fd8ff'], 1.2, 16, 0.12);
      if (b.t > 150) {
        b.st = 'carica';
        b.t = 0;
        b.say = b.ph ? 'E ADESSO MI ARRABBIO SUL SERIO!' : 'ADESSO BASTA!!!';
        b.sayT = 70;
        Snd.sfx('panic');
        G.shake = 8;
      }
    } else if (b.st == 'carica') {
      const sp = 2.4 * f;
      if (b.t < 24) b.vx = 0;
      else {
        if (!b.vx) b.vx = (sgn(p.x - b.x) || 1) * sp;
        b.x += b.vx;
        if (b.x < A + 4) {
          b.x = A + 4;
          b.vx = sp;
        }
        if (b.x > A + 476 - b.w) {
          b.x = A + 476 - b.w;
          b.vx = -sp;
        }
        b.face = sgn(b.vx);
        if (b.t % 5 == 0) puff(b.x + b.w / 2, GY, 1, C.pale, 1, 14);
      }
      if (b.t % (b.ph ? 22 : 32) == 18) {
        eb({
          x: b.x + b.w / 2 - 5,
          y: b.y - 4,
          w: 10,
          h: 12,
          vx: sgn(p.x - b.x) * rnd(1.6, 2.8),
          vy: -rnd(3.8, 5.2),
          g: 0.16,
          kind: 'minimf',
          bounce: 1,
          life: 300,
        });
        Snd.sfx('throw');
      }
      if (b.t > 260) {
        b.st = 'lamenta';
        b.t = 0;
        b.vx = 0;
      }
    }
  } else {
    const f = 1 + b.ph * 0.18;
    const grav = () => {
      b.vy += 0.32;
      b.y += b.vy;
      b.x += b.vx;
      if (b.x < A + 4) {
        b.x = A + 4;
        b.vx *= -1;
      }
      if (b.x > A + 476 - b.w) {
        b.x = A + 476 - b.w;
        b.vx *= -1;
      }
      if (b.y >= GY - b.h) {
        b.y = GY - b.h;
        b.vy = 0;
        return true;
      }
      return false;
    };
    if (b.st == 'walk') {
      grav();
      b.vx = 0;
      b.face = p.x < b.x ? -1 : 1;
      if (b.t > 46 / f) {
        b.k = (b.k + 1) % (b.ph ? 3 : 2);
        b.st = ['bounce', 'choc', 'lprep'][b.k];
        b.t = 0;
        b.n = 0;
        if (b.st == 'lprep') {
          b.hi = b.ph == 2 && Math.random() < 0.5;
          Snd.sfx('charge');
        }
      }
    } else if (b.st == 'bounce') {
      if (b.t == 1) {
        b.vy = -6.6;
        b.vx = sgn(p.x - b.x) * 1.9 * f;
        b.face = sgn(b.vx);
        Snd.sfx('boing');
      } else if (grav()) {
        G.shake = 5;
        Snd.sfx('stomp');
        puff(b.x + b.w / 2, GY, 8, C.pale, 2, 16);
        if (b.ph)
          for (const d of [-1, 1])
            eb({
              x: b.x + b.w / 2 - 4,
              y: GY - 12,
              w: 8,
              h: 8,
              vx: d * 1.7,
              vy: -3.2,
              g: 0.2,
              kind: 'choc',
              life: 200,
              bounce: 1,
            });
        b.n++;
        b.t = 0;
        if (b.n >= 3 + (b.ph == 2 ? 1 : 0)) {
          b.st = 'walk';
          b.vx = 0;
        }
      }
    } else if (b.st == 'choc') {
      grav();
      const n = 4 + b.ph * 2;
      if (b.t % 14 == 5 && b.t < 14 * n) {
        eb({
          x: b.x + b.w / 2 - 4,
          y: b.y,
          w: 8,
          h: 8,
          vx: rnd(-2.7, 2.7),
          vy: -5 - Math.random() * 1.5,
          g: 0.2,
          kind: 'choc',
          life: 240,
          bounce: 1,
        });
        Snd.sfx('throw');
      }
      if (b.t > 14 * n + 25) {
        b.st = 'walk';
        b.t = 0;
      }
    } else if (b.st == 'lprep') {
      const ty = b.hi ? 150 : GY - b.h;
      b.y += (ty - b.y) * 0.14;
      b.vy = 0;
      if (b.t > 52 / f) {
        b.y = ty;
        b.st = 'laser';
        b.t = 0;
        Snd.sfx('laser');
        G.shake = 6;
      }
    } else if (b.st == 'laser') {
      if (!p.dead && p.y < b.y + 17 && p.y + p.h > b.y + 9) hurt();
      if (b.t > 48) {
        b.st = 'walk';
        b.t = 0;
      }
    }
  }
  if (G.frame % 190 == 0 && b.alpha > 0.6) {
    const sh = BOSS[b.i].sh;
    G.pops.push({ x: b.x - 12, y: b.y - 14, txt: sh[(Math.random() * sh.length) | 0], life: 75, c: C.white });
  }
  if (!p.dead && b.alpha > 0.6 && ov(p, b)) {
    if (stomp(b)) dmgBoss(6);
    else hurt();
  }
}
