/** @file Shared mutable game state (G), state machine and high-score persistence. */
/** Mutable game state shared across modules. */
export const G = {
  cut: null,
  ban: null,
  lastPose: -1,
  evc: null,
  state: 'boot',
  st: 0,
  paused: false,
  lvl: 0,
  LV: null,
  P: null,
  cam: { x: 0 },
  score: 0,
  hi: 0,
  lives: 3,
  nextLife: 30000,
  ens: [],
  pks: [],
  bul: [],
  ebul: [],
  parts: [],
  pops: [],
  boss: null,
  bossOn: false,
  tib: null,
  tposts: [],
  bombs: [],
  snowFx: [],
  selCh: 1,
  aiFace: 0,
  evt: null,
  evtCD: 900,
  lastEvt: '',
  bsod: 0,
  buzz: null,
  shake: 0,
  flash: 0,
  lvTime: 0,
  maxCombo: 0,
  tal: null,
  frame: 0,
  msg: null,
  ring: null,
  consCD: 1200,
  Q: null,
  qOrd: [0, 1, 2, 3, 4],
  asdDone: false,
};
export function saveHi() {
  if (G.score > G.hi) {
    G.hi = G.score;
    try {
      localStorage.setItem('anzu_hi', G.hi);
    } catch (e) {}
  }
}
export function setState(s) {
  G.state = s;
  G.st = 0;
}

export function loadHi() {
  try {
    G.hi = +localStorage.getItem('anzu_hi') || 0;
  } catch (e) {}
}
