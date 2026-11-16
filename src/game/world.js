/** @file Per-frame world update: bullets, pickups, fx, moving platforms, checkpoints. */
import { ORZOQ } from '../data/quadri.js';
import { Snd } from '../engine/audio.js';
import { C, GY, H, W } from '../engine/config.js';
import { clamp, ov, rnd } from '../engine/math.js';
import { nearT } from './allies.js';
import { dmgBoss } from './boss.js';
import { dmgEnemy } from './enemies.js';
import { hurt } from './player.js';
import { cf } from './progression.js';
import { addScore, puff, say } from './session.js';
import { G } from './state.js';

export function updBullets() {
  for (const b of G.bul) {
    if (b.home) {
      const e = nearT(b.x, 220);
      if (e) {
        b.vy += clamp((e.y + e.h / 2 - b.y) * 0.012, -0.16, 0.16);
        b.vy = clamp(b.vy, -2.2, 2.2);
      } else b.vy *= 0.95;
    }
    if (b.g) b.vy += b.g;
    b.x += b.vx;
    b.y += b.vy;
    b.life--;
    if (b.zz != null) {
      b.t++;
      b.y += ((b.t >> 2) + b.zz) % 2 ? 2.2 : -2.2;
    } else if (b.k == 'swear') {
      b.t++;
      if (b.r < 9) b.r += 0.08;
    }
    if (
      b.bn != null &&
      b.vy > 0 &&
      b.y + b.r >= GY &&
      b.y + b.r < GY + 10 &&
      G.LV.plats.some(q => q.k == 'g' && b.x > q.x && b.x < q.x + q.w)
    ) {
      if (b.bn-- > 0) {
        b.y = GY - b.r;
        b.vy = -3.2;
        if (b.bn == 2) Snd.sfx('tick');
      } else b.life = 0;
    }
    if (b.y > H || (b.bn == null && b.y > GY + 3 && b.vy >= 0)) b.life = 0;
    if (G.frame % 2 == 0 && b.k != 'duck' && b.k != 'kit' && b.k != 'jarg')
      G.parts.push({
        x: b.x,
        y: b.y,
        vx: 0,
        vy: 0,
        life: 8,
        max: 8,
        c:
          {
            merge: '#3cc46a',
            bolt: C.yel2,
            swear: '#ff6040',
            pi: C.cyan,
            cup: '#e6c6a0',
            plane: '#ffffff',
            slideP: '#5fe6d6',
            paper: '#ffffff',
            cmd: '#3cff7a',
          }[b.k] || C.cyan,
        s: Math.min(b.r, 5) * 0.7,
        g: 0,
      });
    const bb = { x: b.x - b.r, y: b.y - b.r, w: b.r * 2, h: b.r * 2 };
    for (const s of G.LV.plats) {
      if (!s.ow && s.k != 'g' && ov(bb, s)) {
        b.life = 0;
        puff(b.x, b.y, 4, C.cyan, 1.5, 10);
        break;
      }
    }
    if (b.life <= 0) continue;
    for (const e of G.ens) {
      if (e.act && !e.gone && ov(bb, e) && b.hit.indexOf(e) < 0) {
        dmgEnemy(e, b.dmg);
        if (b.pierce) b.hit.push(e);
        else {
          b.life = 0;
          break;
        }
      }
    }
    if (b.life > 0 && G.state == 'quadro')
      for (const e of G.ebul) {
        if (e.sh && e.life > 0 && ov(bb, e)) {
          e.life = 0;
          addScore(50, e.x, e.y - 6);
          puff(e.x + e.w / 2, e.y + e.h / 2, 8, [C.white, C.yel], 2, 18);
          Snd.sfx('hit');
          if (!b.pierce) {
            b.life = 0;
            break;
          }
        }
      }
    if (
      b.life > 0 &&
      G.boss &&
      G.bossOn &&
      !G.boss.dead &&
      G.state == 'play' &&
      ov(bb, G.boss) &&
      b.hit.indexOf(G.boss) < 0
    ) {
      if (dmgBoss(b.dmg)) {
        puff(b.x, b.y, 5, [C.cyan, C.white], 2, 12);
        b.life = 0;
      }
    }
    if (b.x < G.cam.x - 20 || b.x > G.cam.x + W + 20) b.life = 0;
  }
  G.bul = G.bul.filter(b => b.life > 0);
  for (const b of G.ebul) {
    b.vy += b.g;
    b.x += b.vx;
    b.y += b.vy;
    b.life--;
    if (b.sw) b.y += Math.cos(b.life / 9) * b.sw;
    if (b.bounce && b.y + b.h > GY && b.vy > 0) {
      b.y = GY - b.h;
      b.vy *= -0.7;
      b.bounce--;
    }
    if (b.y > H + 20 || b.x < G.cam.x - 40 || b.x > G.cam.x + W + 40) b.life = 0;
    if (b.kind != 'wave' && b.kind != 'bollo' && !b.bounce && b.g > 0 && b.y + b.h > GY && b.x > G.LV.ax) {
      b.life = 0;
      puff(b.x + 4, GY, 5, C.white, 1.5, 12);
      if (b.split) {
        Snd.sfx('hit');
        for (let k = 0; k < b.split; k++)
          G.ebul.push({
            x: b.x + 6,
            y: GY - 8,
            w: 5,
            h: 5,
            vx: (k - (b.split - 1) / 2) * 1.6 + rnd(-0.3, 0.3),
            vy: -3.2 - Math.random(),
            g: 0.2,
            kind: 'key',
            life: 120,
          });
      }
    }
    if (b.life > 0 && !G.P.dead && G.P.inv <= 0 && ov(G.P, b)) {
      hurt();
      if (b.kind != 'wave') b.life = 0;
    }
  }
  G.ebul = G.ebul.filter(b => b.life > 0);
}
export function updPickups() {
  const p = G.P;
  for (const k of G.pks) {
    k.t++;
    if (k.fall) {
      k.y += 2.2;
      if (k.y >= GY - 12 && G.LV.plats.some(q => q.k == 'g' && k.x > q.x && k.x < q.x + q.w)) {
        k.y = GY - 12;
        k.fall = 0;
      }
      if (k.y > H) {
        k.gone = true;
        continue;
      }
    }
    if (p.dead || !ov(p, { x: k.x - 2, y: k.y - 2, w: 12, h: 14 })) continue;
    k.gone = true;
    if (k.type == 'buono') {
      G.P.coins++;
      addScore(50, k.x, k.y - 8);
      G.P.sp = Math.min(100, G.P.sp + 4 * G.P.spRate);
      Snd.sfx('coin');
      puff(k.x + 4, k.y + 5, 5, C.yel2, 1.5, 14);
    } else if (k.type == 'caffe' && k.orzo) {
      if (p.hp < p.maxHp) {
        p.hp++;
        G.pops.push({ x: k.x, y: k.y - 8, txt: '+1 ♥ ORZO', life: 60, c: '#e6c6a0' });
      } else addScore(200, k.x, k.y - 8);
      p.caf = Math.max(0, (p.caf || 0) - 1);
      Snd.sfx('power');
      G.pops.push({
        x: k.x - 40,
        y: k.y - 22,
        txt: ORZOQ[(Math.random() * ORZOQ.length) | 0],
        life: 90,
        c: C.pale,
      });
    } else if (k.type == 'caffe') {
      if (p.hp < p.maxHp) {
        p.hp++;
        G.pops.push({ x: k.x, y: k.y - 8, txt: '+1 ♥ CAFFÈ', life: 60, c: C.white });
      } else addScore(200, k.x, k.y - 8);
      Snd.sfx('power');
      if (p.ch == 3 && !(p.panicT > 0)) {
        p.caf = (p.caf || 0) + 1;
        p.cafT = 900;
        if (p.caf >= 3) {
          p.caf = 0;
          p.panicT = 360;
          G.shake = 10;
          G.flash = 6;
          Snd.sfx('panic');
          G.ban = {
            k: 0,
            t: 0,
            txt: 'PANICO DA CAFFÈ!',
            sub: 'Troppi caffè: August fa cose a caso per 6 secondi',
          };
        } else
          G.pops.push({
            x: k.x - 20,
            y: k.y - 22,
            txt: 'Caffeina ' + p.caf + '/3 · occhio!',
            life: 70,
            c: '#ffb020',
          });
      }
    } else if (k.type == 'chip') {
      if (p.aura < 4) {
        p.aura++;
        say(cf(p).W[p.aura] + '!');
        G.pops.push({ x: k.x - 10, y: k.y - 10, txt: cf(p).wep + ' UP!', life: 70, c: C.cyan });
      } else addScore(1000, k.x, k.y - 8, C.cyan);
      Snd.sfx('power');
      G.flash = 6;
      puff(k.x + 5, k.y + 5, 16, [C.cyan, C.white], 3, 26);
    } else if (k.type == 'snow') {
      if (p.bombs < 9) {
        p.bombs++;
        G.pops.push({ x: k.x - 14, y: k.y - 10, txt: '+1 TICKET INCIDENT', life: 60, c: '#ff9aa4' });
      } else addScore(500, k.x, k.y - 8);
      Snd.sfx('power');
    } else if (k.type == 'ferie') {
      G.lives++;
      Snd.sfx('1up');
      G.pops.push({ x: k.x - 6, y: k.y - 10, txt: '1UP · FERIE!', life: 80, c: C.yel2 });
    }
  }
  G.pks = G.pks.filter(k => !k.gone);
}
export function updFx() {
  if (G.buzz && --G.buzz.life <= 0) G.buzz = null;
  if (G.bsod > 0) G.bsod--;
  for (const q of G.parts) {
    q.x += q.vx;
    q.y += q.vy;
    q.vy += q.g;
    q.life--;
  }
  G.parts = G.parts.filter(q => q.life > 0);
  if (G.parts.length > 400) G.parts.splice(0, G.parts.length - 400);
  for (const q of G.pops) {
    q.y -= 0.5;
    q.life--;
  }
  G.pops = G.pops.filter(q => q.life > 0);
  if (G.shake > 0) G.shake--;
  if (G.flash > 0) G.flash--;
  if (G.msg && --G.msg.life <= 0) G.msg = null;
  if (G.ring) {
    G.ring.r += 9;
    if (G.ring.r > 520) G.ring = null;
  }
}
export function updPlats() {
  if (!G.LV.mov) return;
  for (const s of G.LV.mov) {
    const m = s.mv,
      o = Math.sin(G.frame * m.sp + m.ph) * m.amp,
      nx = m.a == 'x' ? m.x0 + o : m.x0,
      ny = m.a == 'y' ? m.y0 + o : m.y0;
    s.dx = nx - s.x;
    s.dy = ny - s.y;
    s.x = nx;
    s.y = ny;
  }
}
export function updCP() {
  if (!G.LV.cp) return;
  for (const c of G.LV.cp)
    if (!c.used && G.P.x > c.x && !G.P.dead) {
      c.used = G.frame;
      G.P.hp = Math.min(G.P.maxHp, G.P.hp + 1);
      G.P.sx = c.x;
      G.P.sy = GY - G.P.h;
      G.pops.push({ x: c.x - 34, y: GY - 60, txt: 'PAUSA CAFFÈ · +1 ♥', life: 90, c: '#ffe95c' });
      Snd.sfx('power');
    }
}
