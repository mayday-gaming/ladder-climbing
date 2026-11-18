/** @file Interstitial scene logic (minigames between levels). */
import { ASDQ, BUBS, CAVQ, CLAUSOLE, DOORS, HRQ, QUADRI, STOMPW } from '../data/quadri.js';
import { Snd } from '../engine/audio.js';
import { C, GY } from '../engine/config.js';
import { clamp, rnd, sgn } from '../engine/math.js';
import { hurt } from './player.js';
import { puff, say } from './session.js';
import { G, setState } from './state.js';

export function startQuadro(dd) {
  const d = dd || QUADRI[G.qOrd[(G.lvl - 1) % 5]],
    K2 = ['pens', 'shelf', 'chand', 'beam', 'shelf', 'shelf'][d.th];
  G.Q = Object.assign({}, d, {
    t: 0,
    ph: 0,
    hits: 0,
    dur: { colloquio: 1200, primo: 3600, asdrubale: 3000, contratto: 3600 }[d.id] || 1500,
    bonus: 0,
  });
  if (d.id == 'primo') {
    const hr = (Math.random() * 5) | 0,
      pos = [
        [24, GY],
        [440, GY],
        [86, 184],
        [372, 184],
        [228, 146],
      ];
    const wr = DOORS.slice();
    G.Q.doors = pos.map((ps, i) => {
      const lb = i == hr ? ['RISORSE UMANE', ''] : wr.splice((Math.random() * wr.length) | 0, 1)[0];
      return { x: ps[0], y: ps[1], lbl: lb[0], line: lb[1], hr: i == hr, tch: 0, no: 0, sh: 0 };
    });
  }
  if (d.id == 'contratto')
    G.Q.cav = {
      x: 400,
      y: GY,
      vy: 0,
      vx: 0,
      hp: 120,
      max: 120,
      st: 'cavilla',
      t: 0,
      face: -1,
      line: 0,
      say: 'Lei vorrebbe… FIRMARE? Ah ah ah.',
      sayT: 130,
      flash: 0,
      jumps: 0,
      dash: 0,
      land: 0,
    };
  if (d.id == 'asdrubale')
    G.Q.asd = {
      x: 400,
      y: GY,
      hp: 150,
      max: 150,
      st: 'lamenta',
      t: 0,
      face: -1,
      line: 0,
      say: ASDQ[0],
      sayT: 120,
      flash: 0,
      vx: 0,
    };
  G.LV = {
    plats: [
      { x: 0, y: GY, w: 480, h: 60, k: 'g' },
      { x: 56, y: 184, w: 84, h: 6, ow: 1, k: K2 },
      { x: 340, y: 184, w: 84, h: 6, ow: 1, k: K2 },
      { x: 198, y: 146, w: 84, h: 6, ow: 1, k: K2 },
    ],
    en: [],
    pk: [],
    dec: [30, 450],
    sg: [],
    cp: [],
    ax: 0,
    len: 480,
    mov: [],
    th: d.th,
    i: d.th,
  };
  G.ens = [];
  G.pks = [];
  G.bul = [];
  G.ebul = [];
  G.boss = null;
  G.bossOn = false;
  G.ring = null;
  G.msg = null;
  G.tib = null;
  G.tposts = [];
  G.bombs = [];
  G.snowFx = [];
  G.evt = null;
  G.bsod = 0;
  G.buzz = null;
  Object.assign(G.P, {
    x: 234,
    y: GY - G.P.h,
    vx: 0,
    vy: 0,
    inv: 0,
    dead: 0,
    face: 1,
    combo: 0,
    comboT: 0,
    sx: 234,
    sy: GY - G.P.h,
    fly: G.P.flyMax,
  });
  G.cam.x = 0;
  setState('quadro');
  Snd.play('stage', { tr: 7, bpm: 158 });
}
/**
 * Dott. Cavillo, intern prologue boss. Cycle:
 *  cavilla  – walks and throws clause sheets (more when raging),
 *  timbro   – three stamp leaps aimed at the player, each landing sends shockwaves,
 *  stordito – dizzy after the third landing: double damage, stomp him!,
 *  penna    – dashes across the room with a giant fountain pen.
 */
function updCavillo(q, k, eb) {
  const a = q.cav,
    p = G.P,
    rage = a.hp < a.max / 2,
    talk = (s, n) => ((a.say = s), (a.sayT = n || 90)),
    to = st => ((a.st = st), (a.t = 0));
  a.t++;
  if (a.flash > 0) a.flash--;
  if (a.sayT > 0) a.sayT--;
  if (a.land > 0) a.land--;
  const mult = a.st == 'stordito' ? 2 : 1,
    dmg = n => {
      a.hp -= n * mult;
      a.flash = 6;
      G.score += n * mult * 10;
    };
  for (const b of G.bul) {
    if (b.life <= 0 || b.hit.includes(a)) continue;
    if (b.x > a.x - 10 && b.x < a.x + 10 && b.y > a.y - 40 && b.y < a.y) {
      dmg(b.dmg);
      b.hit.push(a);
      if (!b.pierce) b.life = 0;
      puff(b.x, b.y, 4, mult > 1 ? ['#ffe95c', C.white] : [C.white, '#c9d2f0'], 1.5, 12);
      if (mult > 1 && G.frame % 3 == 0)
        G.pops.push({ x: a.x - 10, y: a.y - 48, txt: '×2', life: 30, c: '#ffe95c' });
    }
  }
  // stomp on his head
  if (
    !p.dead &&
    p.vy > 0 &&
    p.x + p.w > a.x - 10 &&
    p.x < a.x + 10 &&
    p.y + p.h > a.y - 46 &&
    p.y + p.h < a.y - 28 &&
    a.st != 'timbro'
  ) {
    dmg(18);
    p.vy = -5.4;
    Snd.sfx('stomp');
    puff(a.x, a.y - 44, 8, [C.yel, C.white], 2.2, 18);
    G.pops.push({
      x: a.x - 18,
      y: a.y - 60,
      txt: STOMPW[(Math.random() * STOMPW.length) | 0],
      life: 40,
      c: C.yel2,
    });
    if (a.st == 'stordito') a.t = Math.max(a.t, 70);
  }
  if (a.hp <= 0 && !q.won) {
    q.won = 1;
    q.t = q.dur;
    a.hp = 0;
    talk('Va bene, va bene… FIRMI QUI.', 220);
    a.st = 'arreso';
    Snd.sfx('boom');
    for (let i = 0; i < 4; i++) puff(a.x, a.y - 20, 14, [C.yel, C.white, '#c9d2f0'], 3, 30);
    return;
  }
  if (a.st == 'cavilla') {
    a.face = sgn(p.x - a.x) || a.face;
    if (Math.abs(p.x - a.x) > 60) a.x += a.face * (rage ? 0.7 : 0.45);
    if (a.t % 90 == 30) talk(CAVQ[a.line++ % CAVQ.length], 80);
    if (a.t % (rage ? 30 : 46) == 12) {
      const tx = CLAUSOLE[(Math.random() * CLAUSOLE.length) | 0];
      eb({
        x: a.x - 6,
        y: a.y - 40,
        w: 12,
        h: 14,
        vx: a.face * rnd(1.5, 2.6),
        vy: -rnd(2.8, 4.6),
        g: 0.12,
        kind: 'clausola',
        txt: tx,
        bounce: 1,
      });
      Snd.sfx('throw');
    }
    if (a.t > (rage ? 170 : 220)) {
      to('timbro');
      a.jumps = 0;
      talk('TIMBRO! TIMBRO! TIMBRO!', 70);
    }
  } else if (a.st == 'timbro') {
    const air = a.y < GY || a.vy < 0;
    if (!air && a.t > 18 && a.land == 0) {
      // leap toward the player
      a.face = sgn(p.x - a.x) || a.face;
      a.vy = -6.4;
      a.vx = clamp((p.x - a.x) / 62, -3.4, 3.4);
      a.y -= 1;
      Snd.sfx('jump');
    }
    if (a.y < GY || a.vy < 0) {
      a.vy += 0.2;
      a.y += a.vy;
      a.x += a.vx;
      if (a.y >= GY) {
        a.y = GY;
        a.vy = 0;
        a.vx = 0;
        a.land = 26;
        a.jumps++;
        a.t = 0;
        G.shake = 7;
        Snd.sfx('boom');
        puff(a.x, GY - 2, 10, ['#c9d2f0', C.white], 2.4, 22);
        for (const d of [-1, 1])
          eb({ x: a.x - 7 + d * 10, y: GY - 10, w: 14, h: 10, vx: d * (2.2 + k), vy: 0, g: 0, kind: 'wave' });
        if (a.jumps >= 3) {
          to('stordito');
          talk('Mi gira la testa… dov’è il timbro?', 110);
        }
      }
    }
    if (
      a.y < GY - 4 &&
      !p.dead &&
      p.x + p.w > a.x - 10 &&
      p.x < a.x + 10 &&
      p.y + p.h > a.y - 34 &&
      p.y < a.y
    )
      hurt();
  } else if (a.st == 'stordito') {
    if (a.t % 12 == 0) puff(a.x, a.y - 50, 1, [C.yel], 0.8, 14, 0.02);
    if (a.t > 150) {
      to('penna');
      a.dash = 0;
      talk('FIRMI QUI! E QUI! E QUI!', 80);
      Snd.sfx('panic');
    }
  } else if (a.st == 'penna') {
    const sp = (rage ? 3.4 : 2.8) + k;
    if (a.t < 24) a.vx = 0;
    else {
      if (!a.vx) a.vx = (sgn(p.x - a.x) || 1) * sp;
      a.x += a.vx;
      a.face = sgn(a.vx);
      if (a.t % 9 == 0) eb({ x: a.x - 2, y: a.y - 22, w: 4, h: 4, vx: 0, vy: 0.4, g: 0.08, kind: 'ink' });
      if ((a.x < 22 && a.vx < 0) || (a.x > 458 && a.vx > 0)) {
        a.vx = -a.vx;
        a.dash++;
        G.shake = 3;
      }
      if (!p.dead && p.x + p.w > a.x - 12 && p.x < a.x + 12 && p.y + p.h > a.y - 36 && p.y < a.y) hurt();
    }
    if (a.dash >= (rage ? 3 : 2)) {
      to('cavilla');
      a.vx = 0;
    }
  }
  a.x = clamp(a.x, 20, 460);
}
export function quadroSpawn(q) {
  const t = q.t,
    f = n => t % Math.max(8, Math.round(n)) == 0,
    k = t / q.dur,
    eb = o => G.ebul.push(Object.assign({ life: 420 }, o));
  if (t % 110 == 55) G.pks.push({ type: 'buono', x: rnd(20, 450), y: 26, t: 0, fall: 1 });
  if (t == 760 && q.hits > 0) G.pks.push({ type: 'caffe', x: rnd(60, 400), y: 26, t: 0, fall: 1 });
  if (q.id == 'primo') {
    const p = G.P;
    if (t == 600)
      G.pops.push({ x: p.x - 50, y: p.y - 24, txt: 'Psst! Segui la freccia gialla…', life: 120, c: C.yel2 });
    for (const d of q.doors) {
      if (d.sh > 0) d.sh--;
      const on = p.x + p.w > d.x - 7 && p.x < d.x + 7 && p.y + p.h > d.y - 24 && p.y + p.h <= d.y + 2;
      if (on && !d.no) {
        d.tch++;
        if (d.tch == 18) {
          if (d.hr) {
            q.found = 1;
            q.t = q.dur;
            Snd.sfx('power');
            say("TROVATA L'HR!");
          } else {
            d.no = 1;
            d.sh = 20;
            Snd.sfx('blip');
            G.pops.push({ x: clamp(d.x - 60, 4, 360), y: d.y - 40, txt: d.line, life: 110, c: C.pale });
          }
        }
      } else d.tch = 0;
    }
    if (t >= q.dur - 1 && !q.found) {
      q.found = 2;
      say("È L'HR CHE HA TROVATO TE!");
    }
    if (f(52 - k * 20))
      eb({
        x: rnd(10, 460),
        y: -14,
        w: 10,
        h: 12,
        vx: rnd(-0.4, 0.4),
        vy: 0.9,
        g: 0.03,
        kind: 'cv',
        sw: rnd(0.6, 1.3),
        sh: 1,
      });
    if (t % 300 == 150)
      for (const dd of [-1, 1])
        eb({ x: dd < 0 ? 466 : 0, y: GY - 10, w: 14, h: 10, vx: -dd * 2.2, vy: 0, g: 0, kind: 'wave' });
  } else if (q.id == 'contratto') {
    updCavillo(q, k, eb);
  } else if (q.id == 'asdrubale') {
    const a = q.asd,
      p = G.P;
    a.t++;
    if (a.flash > 0) a.flash--;
    if (a.sayT > 0) a.sayT--;
    for (const b of G.bul) {
      if (b.life <= 0 || b.hit.includes(a)) continue;
      if (b.x > a.x - 10 && b.x < a.x + 10 && b.y > a.y - 36 && b.y < a.y) {
        const dm = b.dmg * (a.st == 'piange' ? 2 : 1);
        a.hp -= dm;
        a.flash = 6;
        b.hit.push(a);
        if (!b.pierce) b.life = 0;
        puff(b.x, b.y, 4, a.st == 'piange' ? ['#9fd8ff', C.white] : [C.white, C.yel], 1.5, 12);
        G.score += dm * 10;
        if (a.st == 'piange' && G.frame % 3 == 0)
          G.pops.push({ x: a.x - 10, y: a.y - 44, txt: '×2', life: 30, c: '#9fd8ff' });
      }
    }
    if (a.hp <= 0 && !q.won) {
      q.won = 1;
      q.t = q.dur;
      a.say = 'Vado in pensione! Finalmente!';
      a.sayT = 200;
      Snd.sfx('boom');
      for (let i = 0; i < 4; i++) puff(a.x, a.y - 18, 14, [C.yel, C.white, '#ffd8b0'], 3, 30);
    }
    if (a.st == 'lamenta') {
      a.face = sgn(p.x - a.x) || a.face;
      a.x += a.face * 0.35;
      if (a.t % 80 == 1) {
        a.say = ASDQ[a.line++ % ASDQ.length];
        a.sayT = 78;
      }
      if (a.t > 200) {
        a.st = 'piange';
        a.t = 0;
        a.say = 'Sniff… nessuno mi capisce…';
        a.sayT = 100;
      }
    } else if (a.st == 'piange') {
      if (a.t % 14 == 0) puff(a.x + a.face * 3, a.y - 30, 2, ['#9fd8ff'], 1.2, 16, 0.12);
      if (a.t > 150) {
        a.st = 'carica';
        a.t = 0;
        a.say = 'ADESSO BASTA!!!';
        a.sayT = 70;
        Snd.sfx('panic');
        G.shake = 8;
      }
    } else {
      const sp = 2.3 + k * 1.2;
      if (a.t < 20) {
        a.vx = 0;
      } else {
        if (!a.vx) a.vx = sgn(p.x - a.x) * sp || sp;
        a.x += a.vx;
        if (a.x < 20) {
          a.x = 20;
          a.vx = sp;
        }
        if (a.x > 460) {
          a.x = 460;
          a.vx = -sp;
        }
        a.face = sgn(a.vx);
      }
      if (a.t % 34 == 20) {
        eb({
          x: a.x - 5,
          y: a.y - 38,
          w: 10,
          h: 12,
          vx: sgn(p.x - a.x) * rnd(1.6, 2.8),
          vy: -rnd(3.6, 5),
          g: 0.16,
          kind: 'minimf',
          bounce: 1,
        });
        Snd.sfx('throw');
      }
      if (a.t > 260) {
        a.st = 'lamenta';
        a.t = 0;
        a.vx = 0;
      }
    }
    a.x = clamp(a.x, 20, 460);
    if (
      !p.dead &&
      p.x + p.w > a.x - 9 &&
      p.x < a.x + 9 &&
      p.y + p.h > a.y - 34 &&
      p.y < a.y &&
      a.st == 'carica'
    )
      hurt();
  } else if (q.id == 'colloquio') {
    if (f(70 - k * 30)) {
      const tx = HRQ[(Math.random() * HRQ.length) | 0],
        w = tx.length * 3.1 + 10,
        l = Math.random() < 0.3;
      eb({
        x: l ? -w : 404 - w / 2,
        y: l ? rnd(124, 214) : rnd(150, 200),
        w,
        h: 11,
        vx: (l ? 1 : -1) * rnd(1.2, 2),
        vy: 0,
        g: 0,
        kind: 'bubble',
        txt: tx,
        sh: 1,
      });
    }
    if (f(56 - k * 22))
      eb({
        x: rnd(8, 460),
        y: -14,
        w: 10,
        h: 12,
        vx: rnd(-0.4, 0.4),
        vy: 0.9,
        g: 0.03,
        kind: 'cv',
        sw: rnd(0.6, 1.3),
        sh: 1,
      });
  } else if (q.id == 'call') {
    if (f(44 - k * 20))
      eb({ x: rnd(8, 460), y: -14, w: 12, h: 10, vx: 0, vy: 1.1, g: 0.05, kind: 'invite', sh: 1 });
    if (f(84 - k * 34)) {
      const tx = BUBS[(Math.random() * BUBS.length) | 0],
        w = tx.length * 3.1 + 10,
        l = Math.random() < 0.5;
      eb({
        x: l ? -36 : 476,
        y: rnd(124, 214),
        w,
        h: 11,
        vx: (l ? 1 : -1) * rnd(1.3, 2.1),
        vy: 0,
        g: 0,
        kind: 'bubble',
        txt: tx,
        sh: 1,
      });
    }
    if (t % 330 == 200)
      for (const d of [-1, 1])
        eb({ x: d < 0 ? 466 : 0, y: GY - 10, w: 14, h: 10, vx: -d * 2.3, vy: 0, g: 0, kind: 'wave' });
  } else if (q.id == 'fire') {
    if (f(62 - k * 24)) {
      const l = Math.random() < 0.5;
      eb({
        x: l ? -8 : 478,
        y: GY - 12,
        w: 10,
        h: 10,
        vx: (l ? 1 : -1) * rnd(1.8, 3),
        vy: -rnd(4, 6.4),
        g: 0.16,
        kind: 'fire',
        bounce: 2,
      });
    }
    if (f(20 - k * 8))
      eb({ x: rnd(4, 470), y: -6, w: 4, h: 4, vx: rnd(-0.3, 0.3), vy: rnd(1.2, 2), g: 0.01, kind: 'spark' });
  } else if (q.id == 'mail') {
    if (f(112 - k * 40)) {
      const d = Math.random() < 0.5 ? 1 : -1,
        x0 = rnd(0, 220);
      for (let i = 0; i < 5; i++)
        eb({
          x: x0 + i * 44,
          y: -12 - i * 10,
          w: 10,
          h: 7,
          vx: d * 0.7,
          vy: 1.5,
          g: 0.01,
          kind: 'mail',
          sw: rnd(0.6, 1.3),
          sh: 1,
        });
    }
    if (f(72 - k * 26)) {
      const l = Math.random() < 0.5;
      eb({
        x: l ? -10 : 480,
        y: rnd(140, 220),
        w: 10,
        h: 7,
        vx: (l ? 1 : -1) * 2.7,
        vy: 0,
        g: 0,
        kind: 'mail',
        sw: 1,
        sh: 1,
      });
    }
  } else if (q.id == 'deadline') {
    if (f(40 - k * 16))
      eb({
        x: rnd(6, 462),
        y: -14,
        w: 10,
        h: 12,
        vx: rnd(-0.5, 0.5),
        vy: 0.9,
        g: 0.03,
        kind: 'page',
        sw: rnd(0.6, 1.4),
        day: 1 + ((Math.random() * 28) | 0),
        sh: 1,
      });
    if (t % 230 == 120)
      for (const d of [-1, 1])
        eb({ x: d < 0 ? 466 : 0, y: GY - 10, w: 14, h: 10, vx: -d * 2.5, vy: 0, g: 0, kind: 'wave' });
  } else {
    if (f(48 - k * 18)) eb({ x: rnd(10, 456), y: -46, w: 14, h: 11, vx: 0, vy: 1, g: 0.07, kind: 'fald' });
    if (f(38 - k * 14)) {
      const l = Math.random() < 0.5;
      eb({
        x: l ? 10 : 462,
        y: 20,
        w: 8,
        h: 9,
        vx: (l ? 1 : -1) * rnd(1.6, 3.6),
        vy: -rnd(0, 2),
        g: 0.12,
        kind: 'num',
        sh: 1,
      });
    }
  }
}
