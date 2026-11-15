/** @file Ranks, ally lookup, anger state and end-of-level tally. */
import { CH } from '../data/heroes.js';
import { PERK, ROLES } from '../data/levels.js';
import { G } from './state.js';

function perkTxt(i) {
  if (G.P.ch == 4 && i == 0) return 'TEMPO DETERMINATO · doppio salto';
  if (G.P.ch == 4 && i == 1) return 'ASSUNTI A TEMPO INDETERMINATO! · +1 cuore';
  return i == 1 && G.P.ch != 0 ? 'DOPPIO SALTO · agilità manageriale' : PERK[i];
}
export function rankOf(l) {
  if (G.P && G.P.ch == 4 && !G.P.hired)
    return G.P.contract >= 1 ? 'Tempo determinato' : G.P.contract == 0 ? 'Stagista' : 'Candidato';
  return ROLES[l];
}
export function allyOf(p) {
  return CH[p.ch].ally;
}
export function isAngry(p) {
  return !!(p === G.P && G.tib && G.tib.life > 0 && G.tib.type == 'capo');
}
export function cf(p) {
  const c = CH[p.ch];
  return c.F ? Object.assign({}, c, c.F[p.form || 0]) : c;
}
export function mkTally() {
  const secs = Math.floor(G.lvTime / 60),
    tb = Math.max(0, 300 - secs) * 20,
    hb = G.P.hp * 300,
    cb = G.maxCombo * 50;
  G.tal = {
    rows: [
      ['Boss sconfitto', 5000 * (G.lvl + 1) + ' ✓'],
      ['Bonus tempo (' + secs + 's)', tb],
      ['Bonus cuori', hb],
      ['Bonus combo (max ' + G.maxCombo + ')', cb],
    ],
    pend: tb + hb + cb,
    perk: perkTxt(G.lvl),
  };
  if (G.P.ch == 4 && G.lvl < 2) {
    if (G.lvl == 0) {
      G.P.contract = 1;
      G.P.canDJ = true;
    } else {
      G.P.contract = 2;
      G.P.hired = true;
      G.P.maxHp++;
    }
  } else {
    if (G.lvl == 0 || G.lvl == 2 || G.lvl == 5) G.P.maxHp++;
    if (G.lvl == 1) {
      if (G.P.ch == 0) G.P.flyMax = 160;
      else G.P.canDJ = true;
    }
  }
  if (G.lvl == 3) G.P.bombs += 2;
  if (G.lvl == 4) G.P.spRate = 1.5;
  G.P.fly = G.P.flyMax;
  G.P.hp = G.P.maxHp;
}
