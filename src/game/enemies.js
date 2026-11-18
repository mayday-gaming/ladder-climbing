/** @file Enemy AI, projectiles and stomp resolution. */
import { QUIPS } from '../data/events.js';
import { ET } from '../data/levels.js';
import { Snd } from '../engine/audio.js';
import { C, GY, W } from '../engine/config.js';
import { ov, sgn } from '../engine/math.js';
import { hurt, stomp } from './player.js';
import { addScore, comboUp, puff } from './session.js';
import { G } from './state.js';

export function dmgEnemy(e, d) {
  e.hp -= d;
  e.flash = 5;
  G.P.sp = Math.min(100, G.P.sp + 3 * G.P.spRate);
  if (e.hp <= 0) {
    e.gone = true;
    if (Math.random() < 0.35)
      G.pops.push({
        x: e.x - 10,
        y: e.y - 18,
        txt: QUIPS[(Math.random() * QUIPS.length) | 0],
        life: 55,
        c: C.white,
      });
    comboUp();
    addScore(e.pts, e.x, e.y - 6);
    Snd.sfx('kill');
    puff(e.x + e.w / 2, e.y + e.h / 2, 12, [C.white, C.yel, C.bright], 2.6, 26, 0.05);
    G.P.sp = Math.min(100, G.P.sp + 6 * G.P.spRate);
    if (!G.bossOn) {
      const r = Math.random();
      if (r < 0.05) G.pks.push({ type: 'snow', x: e.x + 2, y: e.y, t: 0 });
      else if (r < 0.17)
        G.pks.push({
          type: 'caffe',
          x: e.x + 2,
          y: e.y,
          t: 0,
          orzo: G.P.ch == 3 && Math.random() < 0.5 ? 1 : 0,
        });
      else if (r < 0.6) G.pks.push({ type: 'buono', x: e.x + 3, y: e.y, t: 0 });
    }
  } else Snd.sfx('hit');
}
const WALK = { cono: 0.42, ficus: 0.34, bug: 1.25 };
export function updEnemies() {
  const sp = 1 + G.lvl * 0.07,
    p = G.P;
  if (G.freezeT > 0) return;
  for (const e of G.ens) {
    if (!e.act) {
      if (e.x < G.cam.x + W + 30 && e.x > G.cam.x - 60) {
        e.act = true;
        e.dir = sgn(p.x - e.x);
      } else continue;
    }
    if (e.slowT > 0) {
      e.slowT--;
      if (G.frame % 2) continue;
    }
    e.t++;
    if (e.flash > 0) e.flash--;
    if (e.flee) {
      e.x += e.flee * 3.2;
      e.face = e.flee;
      if (!ET[e.type].fly) e.y = e.by - Math.abs(Math.sin(e.t / 4)) * 4;
      if (e.x < G.cam.x - 50 || e.x > G.cam.x + W + 50) e.gone = true;
      continue;
    }
    if (G.evt && G.evt.id == 'disco') {
      if (!ET[e.type].fly) e.y = e.by - Math.abs(Math.sin(e.t / 7)) * 7;
      else e.y = e.by + Math.sin(e.t / 7) * 10;
      e.face = (e.t >> 4) % 2 ? 1 : -1;
      continue;
    }
    if (e.type == 'carta') {
      e.x += e.face * 0.6 * sp;
      if (e.x < e.x1) {
        e.x = e.x1;
        e.face = 1;
      }
      if (e.x + e.w > e.x2) {
        e.x = e.x2 - e.w;
        e.face = -1;
      }
    } else if (e.type == 'busta') {
      e.x += e.dir * 0.95 * sp;
      e.y = e.by + Math.sin(e.t / 18) * 16;
      e.face = e.dir;
      if (G.bossOn) {
        if (e.x < G.LV.ax + 6) e.dir = 1;
        if (e.x > G.LV.ax + 458) e.dir = -1;
      } else if (e.x < G.cam.x - 90 || e.x > G.cam.x + W + 120) e.gone = true;
    } else if (e.type == 'timbro') {
      if (e.y >= e.by && e.vy >= 0) {
        e.y = e.by;
        e.vx = 0;
        e.vy = 0;
        if (e.t % 70 == 0) {
          e.vy = -5;
          e.face = sgn(p.x - e.x);
          e.vx = e.face * 1.3 * sp;
        }
      } else {
        e.vy += 0.3;
        e.y += e.vy;
        e.x += e.vx;
        if (e.x < e.x1) {
          e.x = e.x1;
          e.vx = 0;
        }
        if (e.x + e.w > e.x2) {
          e.x = e.x2 - e.w;
          e.vx = 0;
        }
        if (e.y >= e.by) {
          e.y = e.by;
          puff(e.x + 7, e.y + e.h, 4, C.pale, 1, 12);
        }
      }
    } else if (e.type == 'stamp') {
      e.face = sgn(p.x - e.x);
      if (e.t % 115 == 60 && Math.abs(p.x - e.x) < 330) {
        G.ebul.push({
          x: e.x + (e.face > 0 ? e.w : -10),
          y: e.y + 5,
          w: 10,
          h: 7,
          vx: e.face * 2.2 * sp,
          vy: 0,
          g: 0,
          kind: 'foglio',
          life: 200,
        });
        Snd.sfx('throw');
      }
    } else if (WALK[e.type]) {
      e.x += e.face * WALK[e.type] * sp;
      if (e.x < e.x1) {
        e.x = e.x1;
        e.face = 1;
      }
      if (e.x + e.w > e.x2) {
        e.x = e.x2 - e.w;
        e.face = -1;
      }
    } else if (e.type == 'sedia') {
      const dx = p.x - e.x;
      if (e.cd > 0) e.cd--;
      if (e.dash > 0) {
        e.dash--;
        e.x += e.face * 2.5 * sp;
        if (e.x < e.x1) {
          e.x = e.x1;
          e.dash = 0;
        }
        if (e.x + e.w > e.x2) {
          e.x = e.x2 - e.w;
          e.dash = 0;
        }
        if (!e.dash) e.cd = 75;
      } else {
        e.face = sgn(dx) || 1;
        if (!e.cd && Math.abs(dx) < 120 && Math.abs(p.y + p.h - e.y - e.h) < 34) {
          e.dash = 44;
          Snd.sfx('blip');
        }
      }
    } else if (e.type == 'piccione') {
      e.x += e.dir * 1.05 * sp;
      e.y = e.by + Math.sin(e.t / 14) * 5;
      e.face = e.dir;
      if (e.t % 78 == 40 && Math.abs(p.x - e.x) < 90)
        G.ebul.push({
          x: e.x + 5,
          y: e.y + 8,
          w: 5,
          h: 5,
          vx: e.dir * 0.5,
          vy: 0.6,
          g: 0.11,
          kind: 'guano',
          life: 170,
        });
      if (G.bossOn) {
        if (e.x < G.LV.ax + 6) e.dir = 1;
        if (e.x > G.LV.ax + 458) e.dir = -1;
      } else if (e.x < G.cam.x - 90 || e.x > G.cam.x + W + 120) e.gone = true;
    } else if (e.type == 'ventola') {
      e.y = e.by + Math.sin(e.t / 24) * 30;
      const dx = p.x - e.x;
      if (Math.abs(dx) < 220) e.x += sgn(dx) * 0.28 * sp;
      e.face = sgn(dx) || 1;
    } else if (e.type == 'penna') {
      const k = e.t % 130;
      if (k < 80) {
        e.x += sgn(p.x - e.x) * 0.3;
        e.y += (e.by + Math.sin(e.t / 10) * 4 - e.y) * 0.08;
        e.face = sgn(p.x - e.x) || 1;
        e.ang = k > 56 ? Math.atan2(p.y + 10 - e.y, p.x - e.x) : null;
      } else if (k == 80) {
        const a = Math.atan2(p.y + 10 - e.y, p.x + 6 - e.x);
        e.dx = Math.cos(a) * 3.3 * sp;
        e.dy = Math.sin(a) * 3.3 * sp;
        e.ang = a;
        Snd.sfx('throw');
      } else if (k < 116) {
        e.x += e.dx;
        e.y += e.dy;
        if (e.y + e.h > GY - 2) {
          e.y = GY - 2 - e.h;
          e.dy = 0;
          e.dx *= 0.8;
        }
      } else e.ang = null;
    } else if (e.type == 'router') {
      e.face = sgn(p.x - e.x) || 1;
      const dx = Math.abs(p.x - e.x);
      if (e.t % 105 == 60 && dx < 300) {
        G.ebul.push({
          x: e.x + 5,
          y: e.y - 6,
          w: 6,
          h: 6,
          vx: e.face * (1 + dx / 85),
          vy: -4.2,
          g: 0.15,
          kind: 'spark',
          life: 220,
        });
        Snd.sfx('throw');
      }
    } else if (e.type == 'proiettore') {
      e.face = sgn(p.x - e.x) || 1;
      if (e.t % 125 == 70 && Math.abs(p.x - e.x) < 320) {
        const sx = e.x + (e.face > 0 ? e.w : -8),
          sy = e.y + 3,
          a = Math.atan2(p.y + 10 - sy, p.x + 6 - sx);
        G.ebul.push({
          x: sx,
          y: sy,
          w: 9,
          h: 7,
          vx: Math.cos(a) * 2.3 * sp,
          vy: Math.sin(a) * 2.3 * sp,
          g: 0,
          kind: 'slide',
          life: 220,
        });
        Snd.sfx('throw');
      }
    }
    if (!p.dead && ov(p, e)) {
      if (stomp(e)) {
        dmgEnemy(e, Math.max(4, e.hp));
        e.sq = 10;
      } else hurt();
    }
  }
  G.ens = G.ens.filter(e => !e.gone);
}
