/** @file Player physics, weapons, specials, caffeine/anger mechanics. */
import { CH, SWEARS } from '../data/heroes.js';
import { ORD, STG } from '../data/levels.js';
import { STOMPW } from '../data/quadri.js';
import { Snd } from '../engine/audio.js';
import { C, GY, H, P2, W } from '../engine/config.js';
import { bB, edges, inp, touchy } from '../engine/input.js';
import { clamp, ov, rnd, sgn } from '../engine/math.js';
import { buyTib } from './allies.js';
import { dmgBoss } from './boss.js';
import { dmgEnemy } from './enemies.js';
import { endEvt } from './events.js';
import { cf, isAngry } from './progression.js';
import { puff, say } from './session.js';
import { G, saveHi, setState } from './state.js';

export function mkPlayer(ch) {
  return {
    ch: ch || 0,
    x: 40,
    y: GY - 24,
    w: 12,
    h: 24,
    vx: 0,
    vy: 0,
    face: 1,
    onGround: false,
    coy: 0,
    jbuf: 0,
    inv: 0,
    hp: 4,
    maxHp: 4,
    aura: 1,
    sp: 0,
    cd: 0,
    anim: 0,
    dead: 0,
    form: 0,
    swcd: 0,
    fly: 100,
    flyMax: 100,
    coins: 0,
    flap: 0,
    bombs: 3,
    canDJ: false,
    dj: false,
    bcd: 0,
    spRate: 1,
    combo: 0,
    comboT: 0,
    sx: 40,
    sy: GY - 24,
    shootT: 0,
    contract: -1,
    hired: ch != 4,
    consT: 0,
    consType: null,
    abCd: 0,
    overT: 0,
    offT: 0,
    hitLog: [],
    rbUsed: false,
    hist: [],
    onCallT: 1500 + ((Math.random() * 600) | 0),
    leapT: 0,
  };
}
function moveBody(e) {
  e.x += e.vx;
  for (const s of G.LV.plats) {
    if (s.ow || !ov(e, s)) continue;
    if (e.vx > 0) e.x = s.x - e.w;
    else if (e.vx < 0) e.x = s.x + s.w;
    e.vx = 0;
  }
  const py = e.y;
  e.y += e.vy;
  e.onGround = false;
  for (const s of G.LV.plats) {
    if (!ov(e, s)) continue;
    if (s.ow) {
      if (e.vy > 0 && py + e.h <= s.y + 0.01) {
        e.y = s.y - e.h;
        e.vy = 0;
        e.onGround = true;
        e.gs = s;
      }
    } else if (e.vy > 0) {
      e.y = s.y - e.h;
      e.vy = 0;
      e.onGround = true;
      e.gs = s;
    } else if (e.vy < 0) {
      e.y = s.y + s.h;
      e.vy = 0;
    }
  }
}
export function hurt() {
  const p = G.P;
  if (p.inv > 0 || p.dead || (G.state != 'play' && G.state != 'quadro')) return;
  p.hp--;
  if (G.state == 'quadro') {
    G.Q.hits++;
    if (p.hp < 1) p.hp = 1;
  }
  if (p.ch == 7) ritaHit(p);
  if (p.hp <= 0 && rollback(p)) return;
  p.inv = 95;
  p.vy = -3.6;
  p.vx = -p.face * 2.4;
  G.shake = 8;
  p.combo = 0;
  Snd.sfx('hurt');
  puff(p.x + 6, p.y + 10, 10, [C.white, C.yel], 2.5);
  if (p.hp <= 0) die();
}
/** Sora Rita takes offence when hit twice within six seconds: no shooting for a while. */
function ritaHit(p) {
  p.hitLog = p.hitLog.filter(t => G.frame - t < 360);
  p.hitLog.push(G.frame);
  if (p.hitLog.length >= 2 && !(p.offT > 0)) {
    p.offT = 200;
    p.hitLog = [];
    Snd.sfx('panic');
    G.pops.push({ x: p.x - 30, y: p.y - 20, txt: 'Hmpf! Io non parlo più.', life: 90, c: '#c9a2ff' });
  }
}
/** Ops: once per level, dying rewinds about three seconds instead. */
function rollback(p) {
  if (p.ch != 6 || p.rbUsed || G.state != 'play' || !p.hist.length) return false;
  const s = p.hist[0];
  p.rbUsed = true;
  p.x = s.x;
  p.y = s.y;
  p.vx = p.vy = 0;
  p.hp = Math.max(2, Math.ceil(p.maxHp / 2));
  p.inv = 130;
  p.hist = [];
  G.rewT = 50;
  G.ebul = [];
  G.flash = 8;
  Snd.sfx('tele');
  say('ROLLBACK!');
  G.pops.push({ x: p.x - 30, y: p.y - 22, txt: 'git revert HEAD~3s', life: 90, c: '#3cff7a' });
  return true;
}
function die() {
  endEvt(false);
  G.P.dead = 1;
  G.P.vy = -5;
  G.P.vx = 0;
  Snd.stop();
  Snd.jingle('over');
}
function respawn() {
  const p = G.P;
  p.dead = 0;
  p.hp = p.maxHp;
  p.inv = 120;
  p.fly = p.flyMax;
  p.vx = p.vy = 0;
  p.aura = Math.max(1, p.aura - 1);
  if (G.bossOn) {
    p.x = G.LV.ax + 50;
    p.y = GY - p.h;
    G.boss.hp = Math.min(G.boss.max, G.boss.hp + G.boss.max * 0.15);
    G.ebul = [];
    Snd.play('boss' + ORD[G.lvl]);
  } else {
    p.x = p.sx;
    p.y = p.sy;
    Snd.play('stage', STG[G.lvl]);
  }
}
function swapForm() {
  const p = G.P;
  p.form ^= 1;
  p.swcd = 18;
  puff(p.x + 6, p.y + 12, 18, [C.yel, C.white, C.cyan], 2.6, 22);
  Snd.sfx('swap');
  say(cf(p).short + '!');
  bB.innerHTML = cf(p).wepBtn;
  G.pops.push({
    x: p.x - 16,
    y: p.y - 16,
    txt: p.form ? 'Tocca a me!' : 'Ci penso io!',
    life: 50,
    c: C.yel2,
  });
}
function shoot() {
  const p = G.P,
    a = p.aura,
    ch = p.ch,
    y = p.y + 10,
    x = p.x + (p.face > 0 ? p.w + 2 : -4);
  if (ch == 0) {
    const v = 5.2 * p.face,
      mk = (vy, dmg, r) =>
        G.bul.push({ x, y, vx: v, vy, r, dmg, pierce: a >= 4, hit: [], life: 70, k: 'aura' });
    if (a == 1) mk(0, 1, 3);
    else if (a == 2) mk(0, 2, 4);
    else {
      mk(0, 2, 4);
      mk(-0.9, 1, 3);
      mk(0.9, 1, 3);
    }
    p.cd = a == 1 ? 16 : a == 4 ? 10 : 13;
    Snd.sfx(a >= 3 ? 'shoot2' : 'shoot');
  } else if (ch == 1) {
    const v = 7 * p.face,
      mk = (vy, dmg) =>
        G.bul.push({ x, y: y - 1, vx: v, vy, r: 5, dmg, pierce: a >= 4, hit: [], life: 55, k: 'bolt' });
    if (a == 1) mk(0, 1);
    else if (a == 2) mk(0, 2);
    else {
      mk(0, 2);
      mk(-1.1, 1);
      mk(1.1, 1);
    }
    p.cd = a == 1 ? 12 : a == 4 ? 8 : 10;
    Snd.sfx('zap');
  } else if (ch == 3) {
    const v = 6 * p.face,
      mk = (vy, dmg, zz) =>
        G.bul.push({
          x,
          y: y - 1,
          vx: v,
          vy,
          r: 5,
          dmg,
          pierce: a >= 4,
          hit: [],
          life: 65,
          k: 'pi',
          zz,
          t: 0,
        });
    if (a == 1) mk(0, 2, 0);
    else if (a == 2) mk(0, 3, 0);
    else {
      mk(0, 3, 0);
      mk(-1, 2, 1);
      mk(1, 2, 0);
    }
    p.cd = a == 1 ? 16 : a == 4 ? 11 : 13;
    Snd.sfx('pi');
  } else if (ch >= 5 && ch <= 7 && !(p.consT > 0)) {
    shootNew(p, a, x, y);
    return;
  } else if (p.consT > 0) {
    const tb = p.consType == 'tib',
      v = (tb ? 5.6 : 6.6) * p.face,
      mk = (vy, dmg) =>
        G.bul.push({
          x,
          y: y - 1,
          vx: v,
          vy,
          r: tb ? 6 : 7,
          dmg,
          pierce: a >= 3,
          hit: [],
          life: tb ? 70 : 60,
          k: tb ? 'slideP' : 'merge',
          t: 0,
        });
    mk(0, a + 1);
    mk(-1, a);
    mk(1, a);
    p.cd = 9;
    Snd.sfx(tb ? 'throw' : 'beep');
  } else if (ch == 4 && !p.form) {
    const v = 5.4 * p.face,
      mk = (vy, dmg) =>
        G.bul.push({
          x,
          y: y - 1,
          vx: v,
          vy,
          r: 5,
          dmg,
          pierce: a >= 4,
          hit: [],
          life: 70,
          k: 'cup',
          t: 0,
          g: 0.025,
        });
    if (a == 1) mk(-0.35, 1);
    else if (a == 2) mk(-0.35, 2);
    else {
      mk(-0.35, 2);
      mk(-1.3, 1);
      mk(0.6, 1);
    }
    p.cd = a == 1 ? 15 : a == 4 ? 10 : 12;
    Snd.sfx('throw');
  } else if (ch == 4) {
    const v = 4.9 * p.face,
      mk = (vy, dmg) =>
        G.bul.push({
          x,
          y: y - 2,
          vx: v,
          vy,
          r: 5,
          dmg,
          pierce: a >= 4,
          hit: [],
          life: 90,
          k: 'plane',
          t: 0,
          home: 1,
        });
    if (a == 1) mk(0, 1);
    else if (a == 2) mk(0, 2);
    else {
      mk(0, 2);
      mk(-1, 1);
      mk(1, 1);
    }
    p.cd = a == 1 ? 16 : a == 4 ? 11 : 13;
    Snd.sfx('shoot');
  } else {
    const v = 4.8 * p.face,
      mk = (vy, dmg) =>
        G.bul.push({
          x,
          y: y - 3,
          vx: v,
          vy,
          r: 7,
          dmg,
          pierce: a >= 4,
          hit: [],
          life: 70,
          k: 'swear',
          txt: SWEARS[(Math.random() * SWEARS.length) | 0],
          t: 0,
        });
    if (a == 1) mk(0, 2);
    else if (a == 2) mk(0, 3);
    else {
      mk(0, 3);
      mk(-1.2, 2);
      mk(1.2, 2);
    }
    p.cd = a == 1 ? 16 : a == 4 ? 10 : 13;
    Snd.sfx('beep');
  }
  p.shootT = 8;

  if (isAngry(p)) p.cd = Math.max(5, Math.round(p.cd * 0.7));
}
/** Weapons of Martina (post-it), Ops (container) and Sora Rita (cornetta). */
function shootNew(p, a, x, y) {
  const ch = p.ch,
    mk = o => G.bul.push(Object.assign({ x, y: y - 1, r: 5, pierce: a >= 4, hit: [], t: 0 }, o));
  if (ch == 5) {
    const v = 5.6 * p.face,
      n = (vy, dmg) => mk({ vx: v, vy, dmg, life: 70, k: 'postit', slow: 1, rot: Math.random() * 6 });
    if (a == 1) n(0, 1);
    else if (a == 2) n(0, 2);
    else {
      n(0, 2);
      n(-1, 1);
      n(1, 1);
    }
    p.cd = a == 1 ? 14 : a == 4 ? 9 : 11;
    Snd.sfx('throw');
  } else if (ch == 6) {
    const n = (vx, vy, dmg) =>
      mk({ vx: vx * p.face, vy, dmg, r: 6, life: 120, k: 'container', g: 0.22, bn: a >= 2 ? 3 : 2 });
    if (a == 1) n(3.6, -3.4, 2);
    else if (a == 2) n(3.8, -3.4, 3);
    else {
      n(3.8, -3.4, 3);
      n(2.6, -4.6, 2);
      if (a >= 3) n(5, -2.4, 2);
    }
    p.cd = a == 1 ? 18 : a == 4 ? 12 : 15;
    Snd.sfx('throw');
  } else {
    if (G.bul.some(b => b.k == 'phone' && b.life > 0) && a < 3) return;
    const n = (vy, dmg) =>
      mk({ vx: 5.8 * p.face, vy, dmg, r: 6, life: 90, k: 'phone', boom: 1, pierce: true, ox: x, oy: y });
    if (a == 1) n(0, 2);
    else if (a == 2) n(0, 3);
    else {
      n(-0.5, 3);
      n(0.5, 2);
    }
    p.cd = a >= 4 ? 16 : 22;
    Snd.sfx('beep2');
  }
  p.shootT = 8;
  if (isAngry(p)) p.cd = Math.max(5, Math.round(p.cd * 0.7));
}
/** F key for heroes with an active ability (Martina, Sora Rita). */
function useAbility(p) {
  const fk = CH[p.ch].fKey;
  if (!fk || p.abCd > 0) {
    if (fk) Snd.sfx('blip');
    return;
  }
  p.abCd = fk.cd;
  if (fk.act == 'freeze') {
    G.freezeT = 90;
    G.freezeKind = 'meeting';
    G.flash = 6;
    Snd.sfx('tick');
    say('RIUNIONE LAMPO!');
    G.pops.push({ x: p.x - 30, y: p.y - 22, txt: '«Un minuto solo…»', life: 70, c: '#ffd500' });
  } else if (fk.act == 'leap') {
    p.leapT = 34;
    p.vy = -5.4;
    p.onGround = false;
    p.inv = Math.max(p.inv, 20);
    Snd.sfx('djump');
    puff(p.x + 6, p.y + p.h, 10, ['#c9a2ff', C.white], 1.8, 18);
    G.pops.push({ x: p.x - 16, y: p.y - 18, txt: 'Scorciatoia!', life: 50, c: '#c9a2ff' });
  }
}
/** Ops' pager: every so often it rings and drops him somewhere else on screen. */
function onCall(p) {
  if (p.ch != 6 || G.state != 'play' || p.dead) return;
  p.onCallT--;
  if (p.onCallT == 90) {
    Snd.sfx('siren');
    G.pops.push({ x: p.x - 30, y: p.y - 22, txt: 'BIP BIP! Reperibilità!', life: 80, c: '#ff8090' });
  }
  if (p.onCallT > 0) return;
  p.onCallT = 1500 + ((Math.random() * 900) | 0);
  const lo = G.bossOn ? G.LV.ax + 20 : G.cam.x + 30,
    hi = G.bossOn ? G.LV.ax + 440 : G.cam.x + W - 50,
    spots = G.LV.plats.filter(q => q.w >= 24 && q.x + q.w > lo && q.x < hi && q.y > 60 && q.k != 'spring');
  if (!spots.length) return;
  const q = spots[(Math.random() * spots.length) | 0],
    nx = clamp(rnd(Math.max(q.x + 4, lo), Math.min(q.x + q.w - 16, hi)), lo, hi);
  puff(p.x + 6, p.y + 12, 16, ['#3cff7a', C.white], 2.4, 22);
  p.x = nx;
  p.y = q.y - p.h - 2;
  p.vx = p.vy = 0;
  p.inv = Math.max(p.inv, 40);
  puff(p.x + 6, p.y + 12, 16, ['#3cff7a', C.white], 2.4, 22);
  Snd.sfx('tele');
  say('TICKET URGENTE! Teletrasporto in sala macchine.');
}
function throwBomb() {
  const p = G.P;
  if (p.bombs <= 0) {
    G.pops.push({ x: p.x - 24, y: p.y - 14, txt: 'Niente ticket incident!', life: 50, c: C.pale });
    Snd.sfx('blip');
    p.bcd = 20;
    return;
  }
  p.bombs--;
  p.bcd = 28;
  G.bombs.push({ x: p.x + 6 + p.face * 6, y: p.y + 6, vx: p.face * 3.3 + p.vx * 0.5, vy: -4.2, t: 0 });
  Snd.sfx('throw');
}
function boomAt(x, y) {
  const R0 = 48;
  G.shake = 13;
  G.flash = 7;
  Snd.sfx('boom');
  puff(x, y, 34, [C.white, C.red, C.yel, '#ff9f40'], 4, 34, 0.06);
  G.snowFx.push({ x, y, r: 6, life: 24 });
  G.pops.push({
    x: x - 34,
    y: y - 28,
    txt: 'INCIDENT INC' + (100000 + ((Math.random() * 899999) | 0)) + '!',
    life: 80,
    c: C.white,
  });
  for (const e of G.ens)
    if (e.act && !e.gone && Math.hypot(e.x + e.w / 2 - x, e.y + e.h / 2 - y) < R0 + e.w / 2) dmgEnemy(e, 10);
  if (
    G.boss &&
    G.bossOn &&
    !G.boss.dead &&
    G.state == 'play' &&
    Math.hypot(G.boss.x + G.boss.w / 2 - x, G.boss.y + G.boss.h / 2 - y) < R0 + G.boss.w / 2
  )
    dmgBoss(24, true);
  G.ebul = G.ebul.filter(b => Math.hypot(b.x - x, b.y - y) > R0 + 10);
}
export function updBombs() {
  for (const b of G.bombs) {
    b.t++;
    b.vy += 0.22;
    b.x += b.vx;
    b.y += b.vy;
    let hit = b.y > H + 20 ? 'lost' : null;
    const bb = { x: b.x - 4, y: b.y - 4, w: 8, h: 8 };
    if (!hit)
      for (const q of G.LV.plats)
        if (ov(bb, q) && !(q.ow && b.vy < 0)) {
          hit = 'p';
          break;
        }
    if (!hit)
      for (const e of G.ens)
        if (e.act && ov(bb, e)) {
          hit = 'e';
          break;
        }
    if (!hit && G.boss && G.bossOn && !G.boss.dead && ov(bb, G.boss)) hit = 'b';
    if (hit) {
      b.gone = 1;
      if (hit != 'lost') boomAt(b.x, b.y);
    }
  }
  G.bombs = G.bombs.filter(b => !b.gone);
  for (const f of G.snowFx) {
    f.r += 5;
    f.life--;
  }
  G.snowFx = G.snowFx.filter(f => f.life > 0);
}
function groundAt(x, fy) {
  for (const q of G.LV.plats) if (x >= q.x && x <= q.x + q.w && q.y >= fy - 3) return true;
  return false;
}
export function claudioAI() {
  const p = G.P,
    c = G.tib,
    px = p.x + p.w / 2;
  let dir = 1,
    jump = false;
  if (G.bossOn && G.boss && !G.boss.dead) {
    const bx = G.boss.x + G.boss.w / 2;
    let want = bx > G.LV.ax + 240 ? bx - 125 : bx + 125;
    want = clamp(want, G.LV.ax + 16, G.LV.ax + 464);
    dir = Math.abs(want - px) > 12 ? sgn(want - px) : 0;
    G.aiFace = sgn(bx - px) || 1;
  }
  if (p.onGround) {
    if (dir && !groundAt(px + dir * 15, p.y + p.h)) jump = true;
    if (dir)
      for (const q of G.LV.plats) {
        if (q.ow || q.k == 'g') continue;
        const fx = px + dir * 20;
        if (fx > q.x - 4 && fx < q.x + q.w + 4 && q.y < p.y + p.h - 2 && q.y + q.h > p.y) jump = true;
      }
    for (const e of G.ens) {
      if (!e.act) continue;
      const d = e.x + e.w / 2 - px;
      if (Math.abs(d) < 44 && (dir == 0 || sgn(d) == dir) && e.y < p.y + p.h && e.y + e.h > p.y - 24)
        jump = true;
    }
    for (const b of G.ebul) {
      const d = b.x + (b.w || 0) / 2 - px,
        ap = b.vx == 0 ? Math.abs(d) < 30 : sgn(b.vx) == -sgn(d);
      if (Math.abs(d) < 64 && ap && b.y + b.h > p.y - 6 && b.y < p.y + p.h + 6) jump = true;
    }
    if (G.bossOn && G.boss && !G.boss.dead && Math.abs(G.boss.x + G.boss.w / 2 - px) < 36) jump = true;
  } else if (p.vy > 0 && p.canDJ && p.dj && !groundAt(px + dir * 6, p.y + p.h)) edges.jump = true;
  if (jump) {
    edges.jump = true;
    c.jh = 16;
  }
  if (c.jh > 0) c.jh--;
  inp.left = dir < 0 ? 1 : 0;
  inp.right = dir > 0 ? 1 : 0;
  inp.jump = c.jh > 0 ? 1 : 0;
  inp.fire = 1;
  if (p.sp >= 100) edges.special = true;
  if (G.bossOn && G.boss && !G.boss.dead && p.bombs > 0 && c.t % 210 == 100) edges.bomb = true;
  if (p.ch == 4 && c.t % 420 == 210) edges.swap = true;
}
function special() {
  const p = G.P;
  if (p.sp < 100) return;
  p.sp = 0;
  G.flash = 14;
  G.shake = 12;
  Snd.sfx('special');
  G.ring = { x: p.x + 6, y: p.y + 12, r: 4 };
  {
    let ps;
    do {
      ps = (Math.random() * 6) | 0;
    } while (ps == G.lastPose);
    G.lastPose = ps;
    G.ban = {
      k: 1,
      t: 0,
      pose: ps,
      ch: p.ch,
      form: p.form || 0,
      consT: p.consT,
      consType: p.consType,
      txt:
        p.consT > 0
          ? p.consType == 'tib'
            ? 'SLIDE TOTALE!'
            : 'MERGE TOTALE!'
          : [
              'FEAR TOTALE!',
              'TUONO TOTALE!',
              '#@*%! TOTALE!',
              'π TOTALE!',
              p.form ? 'STORMO DI CARTA!' : 'PAUSA CAFFÈ TOTALE!',
              'GANTT TOTALE!',
              'DEPLOY IN PRODUZIONE!',
              'LE PASSO IL DOTTORE!',
            ][p.ch],
      sub: 'S I N E R G I A',
    };
  }
  p.spFull = false;
  if (p.ch == 4) {
    for (let k = 0; k < 14; k++) {
      const a = (k / 14) * P2,
        pl = p.form;
      G.bul.push({
        x: p.x + 6,
        y: p.y + 10,
        vx: Math.cos(a) * (pl ? 4.4 : 3.8),
        vy: Math.sin(a) * (pl ? 4.4 : 3.8),
        r: 6,
        dmg: 3,
        pierce: true,
        hit: [],
        life: 90,
        k: pl ? 'plane' : 'cup',
        t: 0,
      });
    }
  }
  if (p.ch == 5) for (const e of G.ens) e.slowT = 360;
  if (p.ch == 6)
    for (let k = 0; k < 16; k++)
      G.bul.push({
        x: G.cam.x + 14 + k * 29 + rnd(-6, 6),
        y: -20 - k * 14,
        vx: rnd(-0.4, 0.4),
        vy: 2.4,
        g: 0.2,
        r: 7,
        dmg: 3,
        pierce: true,
        hit: [],
        life: 160,
        k: 'container',
        bn: 1,
        t: 0,
      });
  if (p.ch == 7) {
    G.freezeT = 240;
    G.freezeKind = 'hold';
  }
  G.ebul = [];
  for (const e of G.ens) if (e.act && e.x > G.cam.x - 20 && e.x < G.cam.x + W + 20) dmgEnemy(e, 6);
  if (G.boss && G.bossOn && !G.boss.dead) dmgBoss(14 + p.aura * 3, true);
}
export function updPlayer(ctrl) {
  const p = G.P;
  if (p.dead) {
    p.dead++;
    p.vy += 0.3;
    p.y += p.vy;
    if (p.dead > 110) {
      if (G.lives > 0) {
        G.lives--;
        respawn();
      } else {
        saveHi();
        setState('gameover');
      }
    }
    return;
  }
  let ax = ctrl ? (inp.right ? 1 : 0) - (inp.left ? 1 : 0) : 0;
  if (p.overT > 0) {
    p.overT--;
    ax = -ax;
    if (p.overT == 0)
      G.pops.push({ x: p.x - 30, y: p.y - 18, txt: 'Agenda liberata. Respiro.', life: 70, c: C.pale });
  }
  if (p.offT > 0 && --p.offT == 0)
    G.pops.push({ x: p.x - 24, y: p.y - 18, txt: 'Va bene, ti richiamo io.', life: 70, c: '#c9a2ff' });
  if (p.abCd > 0) p.abCd--;
  if (p.ch == 6 && G.state == 'play' && G.frame % 10 == 0 && p.onGround) {
    p.hist.push({ x: p.x, y: p.y });
    if (p.hist.length > 18) p.hist.shift();
  }
  onCall(p);
  if (ax) {
    p.vx += ax * 0.36;
    p.face = ax;
  } else p.vx *= 0.72;
  if (ctrl && G.aiFace) p.face = G.aiFace;
  if (p.slowT > 0) p.slowT--;
  if (p.cafT > 0 && --p.cafT == 0 && p.caf > 0) {
    p.caf--;
    if (p.caf) p.cafT = 900;
  }
  if (p.panicT > 0) {
    p.panicT--;
    if (p.panicT == 0) {
      G.pops.push({ x: p.x - 30, y: p.y - 18, txt: '…ok. Respiro. Tutto bene.', life: 80, c: C.pale });
    }
  }
  const ms = cf(p).spd * (p.slowT > 0 ? 0.45 : 1) * (p.panicT > 0 ? 1.45 : 1);
  if (p.leapT > 0) {
    p.leapT--;
    p.vx = p.face * 4.6;
    if (p.leapT % 3 == 0) puff(p.x + 6, p.y + 14, 2, ['#c9a2ff'], 0.6, 14);
    if (p.onGround && p.leapT < 28) p.leapT = 0;
  } else p.vx = clamp(p.vx, -ms, ms);
  if (Math.abs(p.vx) < 0.05) p.vx = 0;
  p.vy = Math.min(p.vy + 0.32, 7);
  if (ctrl) {
    if (!inp.jump && p.vy < -2.2 && p.inv < 80 && !(p.spr > 0) && !(p.leapT > 0)) p.vy = -2.2;
    if (p.spr > 0) p.spr--;
    if (edges.jump) p.jbuf = 8;
    else if (p.jbuf > 0) p.jbuf--;
    if (p.onGround) {
      p.coy = 7;
      p.dj = true;
      p.fly = Math.min(p.flyMax, p.fly + 3);
    } else if (p.coy > 0) p.coy--;
    if (p.jbuf > 0) {
      if (p.coy > 0) {
        p.vy = -6.1;
        p.coy = 0;
        p.jbuf = 0;
        Snd.sfx('jump');
        puff(p.x + 6, p.y + p.h, 4, C.pale, 1, 14);
      } else if (p.ch == 0 && p.fly >= 16) {
        p.vy = -4.3;
        p.fly -= 16;
        p.jbuf = 0;
        p.flap = 10;
        Snd.sfx('djump');
        puff(p.x + 6, p.y + p.h - 4, 5, [C.bright, C.pale], 1.4, 16, 0.05);
      } else if (p.ch != 0 && p.canDJ && p.dj) {
        p.vy = -5.5;
        p.dj = false;
        p.jbuf = 0;
        Snd.sfx('djump');
        puff(p.x + 6, p.y + p.h, 8, C.yel2, 1.5, 16);
      }
    }
    if (p.ch == 0 && inp.jump && p.vy > 1 && p.fly > 0 && !p.onGround) {
      p.vy = 1;
      p.fly -= 0.3;
    }
    if (edges.buy) buyTib();
    if (p.consT > 0) {
      p.consT--;
      if (p.consT == 0) {
        puff(p.x + 6, p.y + 10, 18, [C.white, '#5fe6d6'], 2.4, 24);
        G.pops.push({
          x: p.x - 40,
          y: p.y - 18,
          txt: 'Fine consulenza. Fattura inviata!',
          life: 90,
          c: C.pale,
        });
        say(cf(p).short + ' È TORNATO!');
        bB.innerHTML = cf(p).wepBtn;
        Snd.sfx('swap');
      }
    }
    if (p.swcd > 0) p.swcd--;
    if (edges.swap && p.ch == 4 && p.swcd <= 0 && !(p.consT > 0)) swapForm();
    if (edges.swap && CH[p.ch].fKey && !(p.consT > 0)) useAbility(p);
    if (p.bcd > 0) p.bcd--;
    if (edges.bomb && p.bcd <= 0) throwBomb();
    if (p.cd > 0) p.cd--;
    if (inp.fire && p.cd <= 0) {
      if (p.offT > 0) {
        if (G.frame % 40 == 0)
          G.pops.push({ x: p.x - 10, y: p.y - 16, txt: 'Hmpf!', life: 30, c: '#c9a2ff' });
      } else shoot();
    }
    if (p.sp >= 100 && !p.spFull) {
      p.spFull = true;
      if (!G.ban || G.ban.k != 1)
        G.ban = {
          k: 0,
          t: 0,
          txt: 'SINERGIA AL MASSIMO!',
          sub: touchy() ? 'Tocca SINERGIA per scatenarla' : 'Premi C per scatenarla',
        };
      Snd.sfx('full');
    } else if (p.sp < 100) p.spFull = false;
    if (edges.special) special();
  }
  if (p.onGround && p.gs && p.gs.mv) {
    p.x += p.gs.dx || 0;
    p.y += p.gs.dy || 0;
  }
  const wasG = p.onGround;
  moveBody(p);
  if (p.onGround && p.gs) {
    if (p.gs.k == 'spring' && !p.dead) {
      p.vy = -9.4;
      p.onGround = false;
      p.spr = 24;
      p.coy = 0;
      p.gs.boing = G.frame;
      Snd.sfx('boing');
      puff(p.x + 6, p.y + p.h, 8, C.yel2, 1.6, 16);
    } else if (p.gs.k == 'belt') p.x += p.gs.dir * 1.1;
  }
  if (p.y < 24) {
    p.y = 24;
    if (p.vy < 0) p.vy = 0;
  }
  if (p.flap > 0) p.flap--;
  if (p.onGround && !wasG && p.vy == 0) puff(p.x + 6, p.y + p.h, 3, C.pale, 0.8, 12);
  const lo = G.bossOn ? G.LV.ax + 2 : 0,
    hiX = G.LV.len - 2 - p.w;
  if (!G.bossOn && p.x > G.LV.ax + 470) p.x = G.LV.ax + 470;
  if (p.x < lo) {
    p.x = lo;
    p.vx = 0;
  }
  if (p.x > hiX) {
    p.x = hiX;
    p.vx = 0;
  }
  if (p.onGround && p.gs && p.gs.k == 'g' && p.x > p.gs.x + 10 && p.x + p.w < p.gs.x + p.gs.w - 10) {
    p.sx = p.x;
    p.sy = p.y;
  }
  if (p.y > H + 40 && G.tib && G.tib.type == 'claudio' && !p.dead) {
    p.x = p.sx;
    p.y = p.sy - 4;
    p.vx = p.vy = 0;
    p.inv = 60;
    G.pops.push({ x: p.x - 10, y: p.y - 14, txt: 'Riprovo!', life: 50, c: C.cyan });
  }
  if (p.y > H + 40 && p.hp <= 1 && rollback(p)) return;
  if (p.y > H + 40) {
    p.hp--;
    p.combo = 0;
    Snd.sfx('hurt');
    G.shake = 8;
    if (p.hp <= 0) {
      p.y = H + 10;
      die();
      p.vy = -7;
    } else {
      p.x = p.sx;
      p.y = p.sy - 4;
      p.vx = p.vy = 0;
      p.inv = 110;
    }
  }
  if (p.inv > 0) p.inv--;
  if (p.shootT > 0) p.shootT--;
  p.anim++;
  if (p.comboT > 0) {
    p.comboT--;
    if (!p.comboT) p.combo = 0;
  }
}
export function stomp(o) {
  const p = G.P;
  if (p.dead || p.vy <= 0.4) return false;
  const fb = p.y + p.h - p.vy;
  if (fb > o.y + 6) return false;
  p.vy = inp.jump ? -6.4 : -4.6;
  p.y = o.y - p.h;
  p.dj = true;
  p.inv = Math.max(p.inv, 10);
  G.shake = Math.max(G.shake, 3);
  Snd.sfx('jump');
  puff(p.x + p.w / 2, o.y, 8, [C.white, C.yel], 2, 18, 0.05);
  G.pops.push({
    x: o.x - 6,
    y: o.y - 14,
    txt: STOMPW[(Math.random() * STOMPW.length) | 0],
    life: 40,
    c: C.yel2,
  });
  return true;
}
