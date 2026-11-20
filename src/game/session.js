/** @file Run scoring helpers: new game, multiplier, combo, puffs and speech. */
import { BUZZ } from '../data/events.js';
import { CH } from '../data/heroes.js';
import { PRIMO } from '../data/quadri.js';
import { Snd } from '../engine/audio.js';
import { C } from '../engine/config.js';
import { bB, bT, bW } from '../engine/input.js';
import { startLevel } from './level.js';
import { mkPlayer } from './player.js';
import { cf } from './progression.js';
import { startQuadro } from './quadri.js';
import { G } from './state.js';

export function newGame() {
  G.recorded = false;
  G.asdDone = false;
  G.qOrd = [0, 1, 2, 3, 4];
  for (let k = 4; k > 0; k--) {
    const j = (Math.random() * (k + 1)) | 0;
    [G.qOrd[k], G.qOrd[j]] = [G.qOrd[j], G.qOrd[k]];
  }
  G.score = 0;
  G.lives = 3;
  G.nextLife = 30000;
  G.lvl = 0;
  G.P = mkPlayer(G.selCh);
  bT.innerHTML = CH[G.selCh].allyBtn;
  bB.innerHTML = cf(G.P).wepBtn;
  document.body.classList.toggle('aureola', G.selCh == 4 || !!CH[G.selCh].fKey);
  bW.innerHTML = CH[G.selCh].fKey ? CH[G.selCh].fKey.btn : 'SWAP<br>⇄';
  if (G.selCh == 4) startQuadro(PRIMO);
  else startLevel();
}
export function mult() {
  return Math.min(8, 1 + Math.floor(G.P.combo / 3));
}
export function addScore(base, x, y, c) {
  const m = mult(),
    v = base * m;
  G.score += v;
  if (x != null) G.pops.push({ x, y, txt: m > 1 ? v + ' x' + m : '' + v, life: 50, c: c || C.yel2 });
  if (G.score >= G.nextLife) {
    G.nextLife += 40000;
    G.lives++;
    Snd.sfx('1up');
    G.pops.push({ x: G.P.x, y: G.P.y - 18, txt: '1UP!', life: 80, c: C.cyan });
  }
}
export function comboUp() {
  G.P.combo++;
  G.P.comboT = 170;
  if (G.P.combo > G.maxCombo) G.maxCombo = G.P.combo;
  if (G.P.ch == 5 && G.P.combo % 8 == 0 && !(G.P.overT > 0)) {
    G.P.overT = 180;
    Snd.sfx('panic');
    G.pops.push({
      x: G.P.x - 30,
      y: G.P.y - 22,
      txt: 'OVERBOOKING! Comandi invertiti!',
      life: 90,
      c: '#ff8090',
    });
  }
  if (G.P.combo % 5 == 0) {
    G.buzz = { t: BUZZ[(Math.random() * BUZZ.length) | 0], life: 70 };
    Snd.sfx('buzz');
  }
}
export function puff(x, y, n, c, sp, life, g) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * 6.283,
      v = Math.random() * (sp || 2);
    G.parts.push({
      x,
      y,
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v,
      life: (life || 24) * (0.6 + Math.random() * 0.6),
      max: life || 24,
      c: Array.isArray(c) ? c[i % c.length] : c,
      s: 1 + Math.random() * 2,
      g: g || 0,
    });
  }
}
export function say(t) {
  G.msg = { t, life: 120 };
}
