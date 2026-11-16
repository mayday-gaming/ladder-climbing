/** @file Ally summoning, synergy meter and consultant support birds. */
import { ALLY, ALLY_OF, ANAME, CAPOA, CAPOK, CMDS, CUT, FLOAT, JARG } from '../data/allies.js';
import { SWEARS, TCOST } from '../data/heroes.js';
import { Snd } from '../engine/audio.js';
import { C, GY, W } from '../engine/config.js';
import { clamp, sgn } from '../engine/math.js';
import { dmgBoss } from './boss.js';
import { dmgEnemy } from './enemies.js';
import { isAngry } from './progression.js';
import { puff, say } from './session.js';
import { G } from './state.js';

export function nearT(x, range) {
  if (G.boss && G.bossOn && !G.boss.dead && G.boss.alpha > 0.6) return G.boss;
  let e = null,
    bd = 1e9;
  for (const q of G.ens) {
    const d = Math.abs(q.x + q.w / 2 - x);
    if (q.act && !q.gone && !q.flee && d < bd && d < range) {
      bd = d;
      e = q;
    }
  }
  return e;
}
export function buyTib() {
  if (G.tib) {
    G.pops.push({
      x: G.P.x - 24,
      y: G.P.y - 14,
      txt: ANAME[G.tib.type] + ' è già qui!',
      life: 50,
      c: C.pale,
    });
    Snd.sfx('blip');
    return;
  }
  if (G.P.coins < TCOST) {
    G.pops.push({
      x: G.P.x - 34,
      y: G.P.y - 14,
      txt: 'Servono ' + TCOST + ' buoni pasto',
      life: 60,
      c: C.pale,
    });
    Snd.sfx('blip');
    return;
  }
  const own = ALLY_OF[G.P.ch],
    type = Math.random() < 0.6 ? own : 'capo';
  const A = ALLY.find(a => a.type == type);
  G.P.coins -= TCOST;
  G.tib = {
    type,
    x: FLOAT[type] ? G.P.x + 6 : G.cam.x - 20,
    gy: G.P.y + G.P.h,
    fy: G.P.y - 20,
    vx: 0,
    t: 0,
    life: A.life,
    face: 1,
    act: -1,
    txt: A.hi,
    st: 120,
    k: 0,
    jh: 0,
  };
  if (type == 'capo') {
    G.tib.mood = Math.random() < 0.5 ? 'kind' : 'angry';
    G.tib.txt = G.tib.mood == 'kind' ? 'Ciao campione! Hai un minuto?' : 'TU! Proprio te cercavo!';
  }
  if (FLOAT[type])
    puff(G.P.x + 6, G.P.y - 16, 14, type == 'clone' ? [C.bright, C.yel] : [C.cyan, C.white], 2, 22);
  Snd.jingle(type == own ? 'ally' : 'flop');
  G.cut = {
    type,
    own: type == own,
    ownType: own,
    sad: (a => a[(Math.random() * a.length) | 0])([
      'Ero in call…',
      'Scusate, sforavo.',
      'Avevo il microfono spento.',
      'Mi avevano messo in CC.',
      'Torno tra 5 minuti. Forse.',
    ]),
    ownName: ANAME[own],
    t: 0,
    tag: (a => a[(Math.random() * a.length) | 0])(CUT[type].tag),
  };
  if (type != own) {
    say(ANAME[own] + ' È IN CALL! ARRIVA IL CAPO!');
  } else say(ANAME[type] + (type == 'claudio' ? ' AL COMANDO!' : ' IN CAMPO!'));
  if (type != own)
    G.pops.push({
      x: G.P.x - 8,
      y: G.P.y - 20,
      txt: G.P.ch == 2 ? '#@*%!!' : G.P.ch == 3 ? 'Oddio…' : 'GRRR!',
      life: 70,
      c: C.red,
    });
}
export function updTib() {
  const b = G.tib;
  if (b) {
    const A = ALLY.find(a => a.type == b.type);
    b.t++;
    b.life--;
    if (b.st > 0) b.st--;
    if (isAngry(G.P) && b.life > 60 && b.t % 110 == 55 && !G.P.dead)
      G.pops.push({
        x: G.P.x - 8,
        y: G.P.y - 18,
        txt:
          G.P.ch == 2
            ? SWEARS[(Math.random() * SWEARS.length) | 0]
            : ['GRRR!', 'UFFA!', 'MA DAI!', 'ANCORA TU?!', '#@*%!', "CHI L'HA CHIAMATO?!"][
                (Math.random() * 6) | 0
              ],
        life: 55,
        c: C.red,
      });
    if (b.type == 'claudio') {
      const tx = G.P.x + 6 - G.P.face * 18,
        ty = G.P.y - 20 + Math.sin(b.t / 14) * 3;
      b.x += (tx - b.x) * 0.15;
      b.fy += (ty - b.fy) * 0.15;
      b.face = G.P.face;
    } else if (b.type == 'tib' || b.type == 'laifo') {
      const tb = b.type == 'tib',
        tx = G.P.x + 6 - G.P.face * (tb ? 34 : 26),
        ty = G.P.y - (tb ? 30 : 22) + Math.sin(b.t / (tb ? 15 : 11)) * 5;
      b.x += (tx - b.x) * 0.1;
      b.fy += (ty - b.fy) * 0.1;
      if (b.t % 46 > 14) b.face = G.P.face;
    } else if (b.type == 'clone') {
      const tx = G.P.x + 6 - G.P.face * 26,
        ty = G.P.y - 4 + Math.sin(b.t / 12) * 5;
      b.x += (tx - b.x) * 0.12;
      b.fy += (ty - b.fy) * 0.12;
      if (b.t % 38 > 8) b.face = G.P.face;
    } else if (b.type == 'tux') {
      const tx = G.P.x + 6 - G.P.face * 22,
        dx = tx - b.x;
      if (b.slide > 0) {
        b.slide--;
        b.vx += (sgn(dx || 1) * 3.4 - b.vx) * 0.12;
        if (Math.abs(dx) < 14) b.slide = 0;
      } else {
        if (Math.abs(dx) > 80) {
          b.slide = 40;
          Snd.sfx('djump');
        }
        const tv = Math.abs(dx) < 8 ? 0 : clamp(dx * 0.05, -2, 2);
        b.vx += (tv - b.vx) * 0.14;
      }
      b.x += b.vx;
      if (Math.abs(b.vx) > 0.35) b.face = sgn(b.vx);
      else if (Math.abs(dx) < 10) b.face = G.P.face;
      if (G.P.onGround) b.gy += (G.P.y + G.P.h - b.gy) * 0.15;
    } else {
      const tx = G.P.x + 6 - G.P.face * (b.type == 'capo' ? 18 : 30);
      if (Math.abs(tx - b.x) > 6) {
        b.vx = clamp((tx - b.x) * 0.08, -2.6, 2.6);
        b.face = sgn(b.vx);
      } else {
        b.vx = 0;
        b.face = G.P.face;
      }
      b.x += b.vx;
      if (G.P.onGround) b.gy += (G.P.y + G.P.h - b.gy) * 0.2;
    }
    if (b.life == 120) {
      b.txt = A.bye;
      b.st = 115;
      b.act = -1;
    } else if (b.life > 170 && b.t % A.every == A.every - 40) {
      const SY = b.type == 'capo' ? (b.mood == 'kind' ? CAPOK : CAPOA) : A.say;
      b.act = b.k % SY.length;
      b.k += 1 + ((Math.random() * 2) | 0);
      b.txt = SY[b.act];
      b.st = 110;
    }
    if (b.life > 60 && G.state == 'play') {
      if (b.type == 'clone' && b.t % 38 == 20) {
        const e = nearT(b.x, 260);
        if (e) {
          const sx = b.x,
            sy = b.fy - 12,
            a = Math.atan2(e.y + e.h / 2 - sy, e.x + e.w / 2 - sx);
          b.face = sgn(e.x - b.x) || 1;
          G.bul.push({
            x: sx,
            y: sy,
            vx: Math.cos(a) * 5,
            vy: Math.sin(a) * 5,
            r: G.P.aura > 1 ? 4 : 3,
            dmg: G.P.aura > 1 ? 2 : 1,
            pierce: G.P.aura >= 4,
            hit: [],
            life: 80,
            k: 'aura',
          });
          Snd.sfx('shoot');
        }
      }
      if (b.type == 'capo' && b.t % 300 == 150 && !G.P.dead) {
        G.P.slowT = 70;
        b.txt = b.mood == 'kind' ? 'Aspetta, una cosa veloce…' : 'FERMO LÌ! Ti devo parlare!';
        b.st = 70;
        b.act = -2;
        Snd.sfx('blip');
        G.pops.push({ x: G.P.x - 20, y: G.P.y - 18, txt: 'RALLENTATO', life: 50, c: C.pale });
      }
      if ((b.type == 'tib' || b.type == 'laifo') && b.t % 46 == 23) {
        const e = nearT(b.x, 260);
        if (e) {
          const tb = b.type == 'tib',
            sx = b.x,
            sy = b.fy - 12,
            a = Math.atan2(e.y + e.h / 2 - sy, e.x + e.w / 2 - sx);
          G.bul.push({
            x: sx,
            y: sy,
            vx: Math.cos(a) * 4.6,
            vy: Math.sin(a) * 4.6,
            r: 6,
            dmg: 2,
            pierce: false,
            hit: [],
            life: 100,
            k: tb ? 'slideP' : 'merge',
            t: 0,
          });
          Snd.sfx(tb ? 'throw' : 'beep');
          b.face = sgn(e.x - b.x) || 1;
        }
      }
      if (b.type == 'tux') {
        if (b.t % 34 == 17) {
          const e = nearT(b.x, 280);
          if (e) {
            const sx = b.x,
              sy = b.gy - 10,
              a = Math.atan2(e.y + e.h / 2 - sy, e.x + e.w / 2 - sx);
            G.bul.push({
              x: sx,
              y: sy,
              vx: Math.cos(a) * 4,
              vy: Math.sin(a) * 4,
              r: 6,
              dmg: 2,
              pierce: false,
              hit: [],
              life: 110,
              k: 'cmd',
              txt: CMDS[(Math.random() * CMDS.length) | 0],
            });
            Snd.sfx('beep2');
            b.face = sgn(e.x - b.x) || 1;
          }
        }
        if (b.t % 420 == 330) {
          G.shake = 8;
          G.flash = 8;
          Snd.sfx('special');
          G.ebul = [];
          G.pops.push({ x: b.x - 40, y: b.gy - 44, txt: '$ sudo rm -rf /nemici', life: 90, c: '#3cff7a' });
          b.txt = 'sudo rm -rf /nemici';
          b.st = 60;
          b.act = -2;
          for (const e of G.ens) if (e.act && e.x > G.cam.x - 20 && e.x < G.cam.x + W + 20) dmgEnemy(e, 4);
          if (G.boss && G.bossOn && !G.boss.dead && G.state == 'play') dmgBoss(9, true);
        }
      }
      if (b.type == 'copier') {
        if (b.jam > 0) {
          b.jam--;
          if (b.jam % 8 == 0) puff(b.x, b.gy - 20, 3, ['#8a96c0', '#cfd6ea'], 0.8, 20, -0.02);
          if (b.jam == 0) {
            b.txt = 'FRONTE-RETRO!';
            b.st = 50;
            b.act = -2;
            for (let k = 0; k < 6; k++)
              G.bul.push({
                x: b.x,
                y: b.gy - 16,
                vx: b.face * (3 + k * 0.35),
                vy: -1.6 + k * 0.6,
                r: 5,
                dmg: 2,
                pierce: false,
                hit: [],
                life: 110,
                k: 'paper',
                t: 0,
              });
            Snd.sfx('shoot2');
          }
        } else {
          if (b.t % 40 == 20) {
            const e = nearT(b.x, 280);
            if (e) {
              const sx = b.x + b.face * 6,
                sy = b.gy - 16,
                a = Math.atan2(e.y + e.h / 2 - sy, e.x + e.w / 2 - sx);
              G.bul.push({
                x: sx,
                y: sy,
                vx: Math.cos(a) * 4.4,
                vy: Math.sin(a) * 4.4,
                r: 5,
                dmg: 2,
                pierce: false,
                hit: [],
                life: 100,
                k: 'paper',
                t: 0,
              });
              Snd.sfx('throw');
              b.face = sgn(e.x - b.x) || 1;
            }
          }
          if (b.t % 360 == 260) {
            b.jam = 70;
            b.txt = 'INCEPPAMENTO!';
            b.st = 60;
            b.act = -2;
            Snd.sfx('panic');
          }
        }
      }
      if (b.type == 'mainframe') {
        if (b.t % 62 == 30) {
          const e = nearT(b.x, 300);
          if (e) {
            const sx = b.x,
              sy = b.gy - 22,
              a = Math.atan2(e.y + e.h / 2 - sy, e.x + e.w / 2 - sx),
              tx = JARG[(Math.random() * JARG.length) | 0];
            G.bul.push({
              x: sx,
              y: sy,
              vx: Math.cos(a) * 3.6,
              vy: Math.sin(a) * 3.6,
              r: 6,
              dmg: 3,
              pierce: false,
              hit: [],
              life: 130,
              k: 'jarg',
              txt: tx,
            });
            Snd.sfx('beep2');
            b.face = sgn(e.x - b.x) || 1;
            if (b.st <= 0) {
              b.txt = tx;
              b.st = 35;
              b.act = -2;
            }
          }
        }
        if (b.t % 380 == 300) {
          G.bsod = 26;
          G.shake = 10;
          Snd.sfx('panic');
          G.pops.push({ x: b.x - 30, y: b.gy - 56, txt: 'KERNEL PANIC!!!', life: 80, c: '#9fd4ff' });
          G.ebul = [];
          for (const e of G.ens) if (e.act && e.x > G.cam.x - 20 && e.x < G.cam.x + W + 20) dmgEnemy(e, 3);
          if (G.boss && G.bossOn && !G.boss.dead && G.state == 'play') dmgBoss(8, true);
        }
      }
    }
    if (b.life <= 0) {
      if (b.type == 'tib') {
        puff(b.x, b.gy - 12, 14, ['#18b8a8', C.white], 2.5, 24);
        G.pops.push({
          x: b.x - 50,
          y: b.gy - 30,
          txt: 'Consulenza conclusa. Fattura in arrivo!',
          life: 100,
          c: C.pale,
        });
      } else if (b.type == 'claudio') {
        puff(b.x, b.fy, 14, [C.cyan, C.white], 2.5, 24);
        G.pops.push({ x: G.P.x - 24, y: G.P.y - 18, txt: 'Comandi a te!', life: 70, c: C.cyan });
      } else if (b.type == 'clone') {
        puff(b.x, b.fy - 10, 16, [C.bright, C.yel, C.white], 2.5, 24);
        G.pops.push({ x: b.x - 30, y: b.fy - 30, txt: 'Mi riassorbo in me!', life: 80, c: C.yel2 });
      } else if (b.type == 'capo') {
        puff(b.x, b.gy - 14, 14, ['#3a3f55', C.white], 2.5, 24);
        G.pops.push({ x: b.x - 50, y: b.gy - 40, txt: 'Il capo se ne va. Finalmente!', life: 90, c: C.pale });
      } else if (b.type == 'tux') {
        puff(b.x, b.gy - 10, 14, ['#1a1a1a', '#ffb020', C.white], 2.5, 24);
        G.pops.push({ x: b.x - 20, y: b.gy - 30, txt: '$ exit', life: 70, c: '#3cff7a' });
      } else if (b.type == 'copier') {
        puff(b.x, b.gy - 14, 16, ['#cfd6ea', C.white], 2.5, 24);
        G.pops.push({ x: b.x - 40, y: b.gy - 36, txt: 'Stampa completata: 1 copia', life: 80, c: C.pale });
      } else if (b.type == 'mainframe') {
        puff(b.x, b.gy - 14, 16, ['#3cff7a', '#8a96c0'], 2.5, 24);
        G.pops.push({ x: b.x - 30, y: b.gy - 40, txt: 'shutdown -h now', life: 80, c: '#3cff7a' });
      } else {
        puff(b.x, b.gy - 8, 12, ['#3cc46a', C.white], 2.5, 24);
        G.pops.push({ x: b.x - 50, y: b.gy - 26, txt: 'Merge completato. Ciao!', life: 100, c: C.pale });
      }
      Snd.sfx('coin');
      G.tib = null;
    }
  }
  for (const q of G.tposts) {
    q.t++;
    const tx = q.e ? q.e.x + q.e.w / 2 : q.sx + 120,
      ty = q.e ? q.e.y + q.e.h / 2 : q.sy,
      k = q.t / 36;
    q.x = q.sx + (tx - q.sx) * k;
    q.y = q.sy + (ty - q.sy) * k - Math.sin(k * 3.1416) * 26;
    if (q.t >= 36) {
      q.gone = 1;
      G.pops.push({ x: q.x, y: q.y - 6, txt: '0 danni', life: 45, c: C.gray });
      Snd.sfx('tick');
    }
  }
  G.tposts = G.tposts.filter(q => !q.gone);
}
export function consSupport() {
  if (G.tib || G.bossOn || G.state != 'play' || G.P.dead) return;
  if (--G.consCD > 0) return;
  G.consCD = 1800 + Math.random() * 1200;
  const type = Math.random() < 0.5 ? 'tib' : 'laifo',
    A = ALLY.find(a => a.type == type);
  G.tib = {
    type,
    x: G.cam.x - 20,
    gy: GY,
    fy: G.P.y - 20,
    vx: 0,
    t: 0,
    life: A.life,
    face: 1,
    act: -1,
    txt: A.hi,
    st: 120,
    k: 0,
    jh: 0,
    support: 1,
  };
  say('CONSULENTE DI PASSAGGIO: ' + ANAME[type] + '!');
  Snd.jingle('ally');
}
