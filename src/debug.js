/** @file window.__g test/debug hook used by the integration and e2e suites. */
import { ASDRU, COLLOQUIO, PRIMO } from './data/quadri.js';
import { ctx } from './engine/canvas.js';
import { GY, W } from './engine/config.js';
import { edges, key } from './engine/input.js';
import { dmgBoss } from './game/boss.js';
import { startEvt } from './game/events.js';
import { mkEnemy, startLevel } from './game/level.js';
import { update } from './game/loop.js';
import { startQuadro } from './game/quadri.js';
import { G, setState } from './game/state.js';
import { drawCons } from './render/characters/allies.js';
import { drawAnzuV, drawChapel, drawGiugno, drawTuono } from './render/characters/heroes.js';
import { draw } from './render/draw.js';
import { heroAt } from './render/screens/menus.js';

export function installDebugHook() {
  window.__g = {
    update,
    draw,
    sq(id) {
      startQuadro({ primo: PRIMO, colloquio: COLLOQUIO, asdrubale: ASDRU }[id]);
    },
    get Q() {
      return G.Q;
    },
    mk(t, x, fy) {
      const e = mkEnemy({ t, x, fy: fy || GY, x1: x - 50, x2: x + 50 });
      G.ens.push(e);
      return e;
    },
    get evc() {
      return G.evc;
    },
    get ban() {
      return G.ban;
    },
    get cut() {
      return G.cut;
    },
    dbg(f) {
      return f({ ctx, drawTuono, drawGiugno, drawChapel, drawAnzuV, drawCons, heroAt });
    },
    get s() {
      return {
        state: G.state,
        lvl: G.lvl,
        score: G.score,
        lives: G.lives,
        P: G.P,
        boss: G.boss,
        bossOn: G.bossOn,
        LV: G.LV,
        st: G.st,
        tib: G.tib,
        bombs: G.bombs,
        bul: G.bul,
        evt: G.evt,
        ens: G.ens,
        ebul: G.ebul,
        Q: G.Q,
        pks: G.pks,
      };
    },
    ev(id) {
      startEvt(id);
    },
    swap() {
      edges.swap = true;
    },
    pick(c) {
      G.selCh = c;
      if (G.state == 'boot' || G.state == 'present' || G.state == 'title') setState('select');
      G.st = 30;
    },
    quadro(i) {
      G.qOrd = [i, i, i, i, i];
      startQuadro();
    },
    go(l) {
      G.lvl = l;
      startLevel();
    },
    warp() {
      G.P.x = G.LV.ax + 20;
      G.P.y = GY - G.P.h;
      G.cam.x = G.LV.ax - W;
    },
    set(o) {
      Object.assign(G.P, o);
    },
    killBoss() {
      if (G.boss) dmgBoss(9999, true);
    },
    inp: {
      key,
      bomb() {
        edges.bomb = true;
      },
      buy() {
        edges.buy = true;
      },
      tap() {
        edges.press = true;
      },
      jump() {
        edges.jump = true;
      },
      sp() {
        edges.special = true;
      },
    },
  };
}
