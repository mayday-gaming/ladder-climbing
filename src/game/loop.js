/** @file Fixed 60 Hz update loop with render interpolation. */
import { HORD, SEL, TCOST } from '../data/heroes.js';
import { ORD, S_SEL } from '../data/levels.js';
import { COLLOQUIO, CONTRATTO } from '../data/quadri.js';
import { Snd } from '../engine/audio.js';
import { purgeL } from '../engine/canvas.js';
import { C, GY, W } from '../engine/config.js';
import { bN, bS, bT, edges, inp, key, tch } from '../engine/input.js';
import { clamp, rnd } from '../engine/math.js';
import { updTib } from './allies.js';
import { mkBoss, updBoss } from './boss.js';
import { updEnemies } from './enemies.js';
import { endEvt, updEvt } from './events.js';
import { startLevel } from './level.js';
import { claudioAI, updBombs, updPlayer } from './player.js';
import { mkTally } from './progression.js';
import { quadroSpawn, startQuadro } from './quadri.js';
import { newGame, puff } from './session.js';
import { G, saveHi, setState } from './state.js';
import { updBullets, updCP, updFx, updPickups, updPlats } from './world.js';
import { draw } from '../render/draw.js';
import { V, snap } from '../render/interp.js';

function camTo(tx, k) {
  G.cam.x += (clamp(tx, 0, G.LV.len - W) - G.cam.x) * k;
}
export function update() {
  snap();
  G.frame++;
  G.st++;
  inp.left = key.l || tch.l;
  inp.right = key.r || tch.r;
  inp.jump = key.j || tch.j;
  inp.fire = key.f || tch.f;
  if (G.state == 'play' && !G.paused && G.P && G.P.panicT > 0 && !G.P.dead) {
    if (G.frame % 18 == 0) G.P.pdir = [-1, 0, 1, 1, -1][(Math.random() * 5) | 0];
    inp.left = G.P.pdir < 0;
    inp.right = G.P.pdir > 0;
    inp.fire = true;
    if (Math.random() < 0.05) {
      edges.jump = true;
      inp.jump = true;
    }
    if (G.frame % 40 == 0 && Math.random() < 0.5)
      G.pops.push({
        x: G.P.x - 10,
        y: G.P.y - 18,
        txt: ['AAAH!', 'Il report!', 'La call!!', 'Dove sono?!', 'π π π π!', 'Troppo caffè!'][
          (Math.random() * 6) | 0
        ],
        life: 40,
        c: '#ffb020',
      });
  }
  G.aiFace = 0;
  if (G.state == 'play' && !G.paused && G.tib && G.tib.type == 'claudio' && G.P && !G.P.dead) claudioAI();
  if (edges.pause && (G.state == 'play' || G.paused)) {
    G.paused = !G.paused;
    Snd.sfx('blip');
  }
  if (!G.paused) {
    if (G.ban && (G.state != 'play' || ++G.ban.t >= (G.ban.k ? 84 : 96))) G.ban = null;
    if (G.evc) {
      if (G.state != 'play' || ++G.evc.t >= 96) G.evc = null;
      else {
        edges.jump = edges.special = edges.buy = edges.bomb = edges.swap = edges.press = edges.pause = false;
        return;
      }
    }
    if (G.cut) {
      if (G.state != 'play' || ++G.cut.t >= 120) G.cut = null;
      else {
        edges.jump = edges.special = edges.buy = edges.bomb = edges.swap = edges.press = edges.pause = false;
        return;
      }
    }
    if (G.state == 'play' && G.evt && G.evt.id == 'slow' && G.frame % 2) {
      edges.pause = false;
      return;
    }
    step();
    if (G.state == 'play' && G.evt && G.evt.id == 'turbo') {
      edges.jump = edges.special = edges.buy = edges.bomb = edges.swap = edges.press = false;
      step();
    }
  }
  edges.jump =
    edges.special =
    edges.press =
    edges.pause =
    edges.buy =
    edges.bomb =
    edges.left =
    edges.right =
    edges.swap =
      false;
  edges.tap = null;
}
function step() {
  switch (G.state) {
    case 'boot':
      if (edges.press) {
        Snd.init();
        Snd.sfx('power');
        setState('present');
      }
      break;
    case 'present':
      Snd.play('title', { tr: -2, bpm: 112 });
      if (G.st == 1) Snd.jingle('promo');
      if (G.st > 470 || (edges.press && G.st > 40)) {
        setState('title');
        Snd.sfx('power');
      }
      break;
    case 'title':
      Snd.play('title');
      if (edges.press && G.st > 20) {
        Snd.init();
        Snd.sfx('power');
        setState('select');
      }
      break;
    case 'select':
      Snd.play('title', { tr: 3, bpm: S_SEL });
      {
        const n = HORD.length,
          hi2 = Math.max(0, HORD.indexOf(G.selCh));
        if (edges.left) {
          G.selCh = HORD[(hi2 + n - 1) % n];
          Snd.sfx('blip');
        }
        if (edges.right) {
          G.selCh = HORD[(hi2 + 1) % n];
          Snd.sfx('blip');
        }
      }
      if (G.st > 15 && edges.press) {
        const tp = edges.tap,
          onCard = tp && tp.y > SEL.y - 4 && tp.y < SEL.y + SEL.h + 4,
          picked = onCard ? HORD[SEL.at(tp.x)] : G.selCh;
        if (picked != G.selCh) {
          // first tap on a card selects it, a second tap (or Enter) starts
          G.selCh = picked;
          Snd.sfx('blip');
        } else {
          Snd.sfx('power');
          setState('howto');
        }
      }
      break;
    case 'howto':
      Snd.play('title', { tr: 3, bpm: S_SEL });
      if (G.st > 30 && edges.press) {
        Snd.sfx('power');
        newGame();
      }
      break;
    case 'intro':
      if (G.st == 40) Snd.sfx('power');
      if (G.st > 230 || (edges.press && G.st > 40)) setState('play');
      break;
    case 'play':
      G.lvTime++;
      if (G.freezeT > 0) G.freezeT--;
      if (G.rewT > 0) G.rewT--;
      updPlats();
      updCP();
      updPlayer(true);
      updEnemies();
      if (G.bossOn && G.boss && G.state == 'play') {
        if (G.evt && G.evt.id == 'disco') {
          G.boss.face = (G.frame >> 4) % 2 ? 1 : -1;
          if (G.boss.flash > 0) G.boss.flash--;
        } else if (G.freezeT > 0) {
          if (G.boss.flash > 0) G.boss.flash--;
        } else updBoss();
      }
      updBullets();
      updBombs();
      updPickups();
      updTib();
      updFx();
      if (G.state == 'play') updEvt();
      if (!G.bossOn) {
        camTo(G.P.x - 190 + G.P.face * 24, 0.1);
        if (G.P.x > G.LV.ax + 70 && !G.P.dead) {
          endEvt(false);
          G.bossOn = true;
          G.boss = mkBoss(ORD[G.lvl]);
          G.ens = G.ens.filter(e => e.x > G.LV.ax);
          G.bul = [];
          Snd.play('boss' + ORD[G.lvl]);
          setState('bossintro');
        }
      } else camTo(G.LV.ax, 0.12);
      break;
    case 'bossintro': {
      camTo(G.LV.ax, 0.08);
      updPlayer(false);
      updFx();
      const b = G.boss,
        tx = G.LV.ax + 380;
      if (b.i == 2) {
        b.x = tx;
        b.y = GY - 44 - Math.max(0, 90 - G.st) * 1.5;
        b.alpha = Math.min(1, G.st / 60);
      } else if (b.i == 3) {
        b.x = tx;
        if (G.st < 50) b.y = -40;
        else {
          b.vy += 0.32;
          b.y += b.vy;
          if (b.y >= GY - b.h) {
            b.y = GY - b.h;
            if (b.vy > 2) {
              b.vy = -b.vy * 0.45;
              Snd.sfx('boing');
            } else b.vy = 0;
          }
        }
      } else {
        b.x = Math.max(tx, G.LV.ax + 500 - G.st * 1.6);
        if (b.i == 1 && G.st % 22 == 0 && b.x > tx) {
          G.shake = 4;
          Snd.sfx('stomp');
        }
      }
      if (G.st > 190 || (edges.press && G.st > 70)) {
        b.x = tx;
        if (b.i != 2) b.y = GY - b.h;
        b.vy = 0;
        b.alpha = 1;
        b.st = 'walk';
        b.t = 0;
        setState('play');
      }
      break;
    }
    case 'bosswin': {
      updPlayer(false);
      updFx();
      updPickups();
      const b = G.boss;
      if (G.st < 90) {
        if (G.st % 6 == 0) {
          puff(b.x + rnd(0, b.w), b.y + rnd(0, b.h), 10, [C.yel, C.white, C.bright], 3, 26);
          Snd.sfx('kill');
          G.shake = 5;
        }
      } else {
        if (G.st == 90) {
          Snd.jingle('win');
          b.vy = -6;
          b.vx = 2.2;
        }
        b.x += b.vx;
        b.y += b.vy;
        b.vy -= 0.06;
        b.rot = (b.rot || 0) + 0.25;
      }
      if (G.st > 250) {
        mkTally();
        setState('tally');
      }
      break;
    }
    case 'tally':
      updFx();
      if (G.st == 1) Snd.jingle('promo');
      if (G.st > 40 && G.st < 40 + G.tal.rows.length * 30 && G.st % 30 == 10) Snd.sfx('coin');
      if (edges.press && G.st > 90) {
        G.score += G.tal.pend;
        G.tal.pend = 0;
        saveHi();
        if (G.lvl == 6) {
          setState('ending');
          Snd.play('title', { tr: 5, bpm: 124 });
        } else {
          G.lvl++;
          startQuadro();
        }
      }
      break;
    case 'quadro': {
      const q = G.Q;
      q.t++;
      if (q.ph == 0) {
        updPlayer(false);
        updFx();
        if (q.t > 130 || (edges.press && q.t > 40)) {
          q.ph = 1;
          q.t = 0;
        }
      } else if (q.ph == 1) {
        updPlayer(true);
        updBullets();
        updBombs();
        updPickups();
        updFx();
        quadroSpawn(q);
        if (q.t >= q.dur) {
          q.ph = 2;
          q.t = 0;
          for (const e of G.ebul) puff(e.x + e.w / 2, e.y + e.h / 2, 6, [C.white, C.yel], 2, 18);
          G.ebul = [];
          q.bonus =
            q.id == 'primo'
              ? q.found
                ? 3000
                : 1000
              : q.id == 'asdrubale'
                ? Math.max(0, (q.asd.hp <= 0 ? 7000 : 2500) - q.hits * 500)
                : q.id == 'contratto'
                  ? Math.max(0, (q.cav.hp <= 0 ? 6000 : 2000) - q.hits * 400)
                  : Math.max(0, 4000 - q.hits * 800);
          G.score += q.bonus;
          Snd.jingle(
            q.hits < 5 || q.found || (q.asd && q.asd.hp <= 0) || (q.cav && q.cav.hp <= 0) ? 'promo' : 'over',
          );
        }
      } else {
        updPlayer(false);
        updFx();
        updPickups();
        if (q.t > 170 || (edges.press && q.t > 50)) {
          saveHi();
          if (q.id == 'primo') startQuadro(COLLOQUIO);
          else if (q.id == 'colloquio') startQuadro(CONTRATTO);
          else if (q.id == 'asdrubale') startQuadro();
          else {
            if (q.id == 'contratto') G.P.contract = 0;
            startLevel();
          }
        }
      }
      break;
    }
    case 'gameover':
      updFx();
      if (edges.press && G.st > 60) {
        G.score = 0;
        G.lives = 3;
        G.nextLife = 30000;
        G.P.aura = Math.max(1, G.P.aura);
        G.P.sp = 0;
        startLevel();
      }
      break;
    case 'ending':
      updFx();
      if (G.st % 8 == 0)
        puff(rnd(40, 440) + G.cam.x, rnd(20, 120), 8, [C.yel, C.cyan, C.white, C.bright], 2.5, 40, 0.04);
      if (edges.press && G.st > 180) {
        setState('title');
      }
      break;
  }
}
let last = 0,
  acc = 0;
export function loop(t) {
  requestAnimationFrame(loop);
  if (!last) last = t;
  const dt = Math.min(100, t - last);
  last = t;
  acc += dt;
  let n = 0;
  while (acc >= 16.667 && n < 5) {
    update();
    acc -= 16.667;
    n++;
  }
  if (n == 5) acc = 0;
  V.A = G.paused ? 1 : clamp(acc / 16.667, 0, 1);
  try {
    draw();
  } catch (e) {
    console.error(e);
  }
  bS.classList.toggle('full', !!(G.P && G.P.sp >= 100 && G.state == 'play'));
  bT.classList.toggle('ok', !!(G.P && G.P.coins >= TCOST && !G.tib && G.state == 'play'));
  if (G.P) {
    const t2 = 'TICKET<br>x' + G.P.bombs;
    if (bN._t !== t2) {
      bN.innerHTML = t2;
      bN._t = t2;
    }
  }
  if (G.frame % 300 == 0) purgeL();
}
