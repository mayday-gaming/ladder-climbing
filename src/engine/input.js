/** @file Keyboard and touch-pad input, edge-triggered actions (edges). */
import { Snd } from './audio.js';
import { cv } from './canvas.js';
import { H, W } from './config.js';
import { G } from '../game/state.js';

/** Mutable input edge state shared across modules. */
export const edges = {
  jump: false,
  special: false,
  press: false,
  pause: false,
  buy: false,
  bomb: false,
  left: false,
  right: false,
  swap: false,
  up: false,
  down: false,
  enter: false,
  back: false,
  char: null,
  tap: null,
};
export const key = {},
  inp = { left: 0, right: 0, jump: 0, fire: 0 },
  tch = { l: 0, r: 0, j: 0, f: 0 };
const KM = {
  ArrowLeft: 'l',
  a: 'l',
  A: 'l',
  ArrowRight: 'r',
  d: 'r',
  D: 'r',
  ArrowUp: 'j',
  w: 'j',
  W: 'j',
  ' ': 'j',
  z: 'j',
  Z: 'j',
  x: 'f',
  X: 'f',
  j: 'f',
  J: 'f',
  c: 's',
  C: 's',
  k: 's',
  K: 's',
  Shift: 's',
  v: 't',
  V: 't',
  t: 't',
  T: 't',
  b: 'n',
  B: 'n',
  q: 'n',
  Q: 'n',
  f: 'o',
  F: 'o',
  e: 'o',
  E: 'o',
};
const $ = id => document.getElementById(id);
export const pad = $('pad'),
  bA = $('bA'),
  bB = $('bB'),
  bS = $('bS'),
  bT = $('bT'),
  bN = $('bN'),
  bW = $('bW'),
  bM = $('bM'),
  bP = $('bP');
function padSet(e) {
  const r = pad.getBoundingClientRect(),
    fx = (e.clientX - r.left) / r.width;
  tch.l = fx < 0.5 ? 1 : 0;
  tch.r = fx >= 0.5 ? 1 : 0;
  pad.children[0].className = tch.l ? 'on' : '';
  pad.children[1].className = tch.r ? 'on' : '';
}
function padOff() {
  tch.l = tch.r = 0;
  pad.children[0].className = pad.children[1].className = '';
}
function bind(el, dn, up) {
  el.addEventListener('pointerdown', e => {
    Snd.init();
    try {
      el.setPointerCapture(e.pointerId);
    } catch (_) {}
    el.classList.add('on');
    dn();
    e.stopPropagation();
  });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(n =>
    el.addEventListener(n, () => {
      el.classList.remove('on');
      up && up();
    }),
  );
}
export function toggleMute() {
  bM.style.opacity = Snd.toggle() ? '.35' : '1';
}
export function touchy() {
  return document.body.classList.contains('touch');
}

export function setupInput() {
  addEventListener('keydown', e => {
    Snd.init();
    const k = KM[e.key];
    if (k) {
      e.preventDefault();
      if (!key[k]) {
        if (k == 'j') edges.jump = true;
        if (k == 's') edges.special = true;
        if (k == 't') edges.buy = true;
        if (k == 'n') edges.bomb = true;
        if (k == 'o') edges.swap = true;
        if (k == 'l') edges.left = true;
        if (k == 'r') edges.right = true;
      }
      key[k] = 1;
    }
    if (e.key == 'Enter') edges.enter = true;
    if (e.key == 'Backspace') edges.back = true;
    if (e.key.length == 1 && /[a-zA-Z0-9 ]/.test(e.key)) edges.char = e.key.toUpperCase();
    if (e.key == 'ArrowUp' || e.key == 'w' || e.key == 'W') edges.up = true;
    if (e.key == 'ArrowDown' || e.key == 's' || e.key == 'S') edges.down = true;
    if (e.repeat) return;
    if (e.key == 'Enter' || e.key == ' ' || k == 'j' || k == 'f') edges.press = true;
    if (e.key == 'p' || e.key == 'P' || e.key == 'Escape') edges.pause = true;
    if (e.key == 'm' || e.key == 'M') toggleMute();
  });
  addEventListener('keyup', e => {
    const k = KM[e.key];
    if (k) key[k] = 0;
  });
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) document.body.classList.add('touch');
  pad.addEventListener('pointerdown', e => {
    Snd.init();
    try {
      pad.setPointerCapture(e.pointerId);
    } catch (_) {}
    padSet(e);
    e.stopPropagation();
  });
  pad.addEventListener('pointermove', e => {
    if (e.pointerType != 'mouse' || e.buttons) padSet(e);
  });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(n => pad.addEventListener(n, padOff));
  bind(
    bA,
    () => {
      tch.j = 1;
      edges.jump = true;
      edges.press = true;
    },
    () => (tch.j = 0),
  );
  bind(
    bB,
    () => {
      tch.f = 1;
      edges.press = true;
    },
    () => (tch.f = 0),
  );
  bind(bS, () => {
    edges.special = true;
  });
  bind(bT, () => {
    edges.buy = true;
  });
  bind(bN, () => {
    edges.bomb = true;
  });
  bind(bW, () => {
    edges.swap = true;
  });
  bind(bM, () => toggleMute());
  bind(bP, () => {
    edges.pause = true;
  });
  $('wrap').addEventListener('pointerdown', e => {
    Snd.init();
    edges.press = true;
    const r = cv.getBoundingClientRect();
    edges.tap = { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  });
  ['pointerdown', 'pointerup', 'touchstart', 'touchend', 'mousedown', 'click', 'keyup'].forEach(n =>
    document.addEventListener(n, () => Snd.init(), { passive: true, capture: true }),
  );
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) Snd.init();
  });
  ['gesturestart', 'dblclick', 'contextmenu'].forEach(n => addEventListener(n, e => e.preventDefault()));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && G.state == 'play') {
      G.paused = true;
    }
  });
}
