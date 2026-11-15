/** @file Random event scheduler and resolution. */
import { EVT } from '../data/events.js';
import { ET, ORD, STG } from '../data/levels.js';
import { Snd } from '../engine/audio.js';
import { C, W } from '../engine/config.js';
import { sgn } from '../engine/math.js';
import { consSupport } from './allies.js';
import { say } from './session.js';
import { G } from './state.js';

export function startEvt(id) {
  const pool = EVT.filter(e => !(G.bossOn && e.noBoss) && e.id !== G.lastEvt),
    E = id ? EVT.find(e => e.id == id) : pool[(Math.random() * pool.length) | 0];
  G.evt = Object.assign({}, E, { t: 0 });
  G.lastEvt = E.id;
  say(E.name);
  Snd.sfx('evt');
  G.flash = 6;
  if (G.state == 'play') G.evc = { id: E.id, name: E.name, t: 0 };
  if (E.id == 'evac') {
    for (const e of G.ens)
      if (e.act && e.x > G.cam.x - 10 && e.x < G.cam.x + W + 10) {
        e.flee = sgn(e.x - G.P.x) || 1;
        G.pops.push({ x: e.x - 6, y: e.y - 12, txt: 'AIUTO!', life: 50, c: C.red });
        G.score += 100;
      }
  }
  if (E.id == 'disco') {
    Snd.play('disco');
    G.ebul = [];
    if (G.boss && G.bossOn && !G.boss.dead) {
      const b = G.boss;
      if (['laser', 'lprep', 'glare', 'charge', 'tele', 'atk'].includes(b.st)) {
        b.st = 'walk';
        b.t = 0;
      }
      b.vx = 0;
      b.alpha = 1;
    }
  }
}
export function endEvt(music) {
  if (!G.evt) return;
  if (G.evt.id == 'disco') {
    for (const e of G.ens)
      if (!ET[e.type].fly) {
        e.y = e.by;
        e.vy = 0;
      }
    if (music && G.state == 'play') {
      if (G.bossOn) Snd.play('boss' + ORD[G.lvl]);
      else Snd.play('stage', STG[G.lvl]);
    }
  }
  G.evt = null;
  G.evtCD = 1000 + Math.random() * 900;
}
export function updEvt() {
  consSupport();
  if (!G.evt) {
    if (!G.P.dead && --G.evtCD <= 0) startEvt();
    return;
  }
  G.evt.t++;
  if (G.evt.id == 'rain' && G.evt.t % 5 == 0) {
    const r = Math.random();
    G.pks.push({
      type: r < 0.04 ? 'snow' : r < 0.12 ? 'caffe' : 'buono',
      x: G.cam.x + 10 + Math.random() * (W - 20),
      y: 26,
      t: 0,
      fall: 1,
    });
  }
  if (G.evt.id == 'evac' && G.evt.t % 30 == 1) Snd.sfx('siren');
  if (G.evt.id == 'disco' && G.evt.t % 30 == 0)
    G.pops.push({
      x: G.cam.x + Math.random() * W,
      y: 60 + Math.random() * 120,
      txt: '♪',
      life: 50,
      c: ['#ff8ad8', C.cyan, C.yel2][(Math.random() * 3) | 0],
    });
  if (G.evt.t >= G.evt.dur) endEvt(true);
}
