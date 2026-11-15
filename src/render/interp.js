/** @file View state (V): camera, interpolation alpha, smoothed HUD values. */
import { G } from '../game/state.js';

/** Mutable view/interpolation state shared across modules. */
export const V = { K: 2, A: 1, TT: 0, camX: 0, lastState: '', dispScore: 0, bossLag: 1 };
export function ix(o) {
  if (o._x == null) return o.x;
  const d = o.x - o._x;
  return Math.abs(d) > 40 ? o.x : o._x + d * V.A;
}
export function iy(o) {
  if (o._y == null) return o.y;
  const d = o.y - o._y;
  return Math.abs(d) > 40 ? o.y : o._y + d * V.A;
}
function snapL(a) {
  for (const o of a) {
    o._x = o.x;
    o._y = o.y;
  }
}
export function snap() {
  snapL(G.ens);
  snapL(G.bul);
  snapL(G.ebul);
  snapL(G.pks);
  snapL(G.bombs);
  snapL(G.parts);
  snapL(G.pops);
  snapL(G.tposts);
  if (G.LV && G.LV.mov) snapL(G.LV.mov);
  if (G.P) {
    G.P._x = G.P.x;
    G.P._y = G.P.y;
  }
  if (G.boss) {
    G.boss._x = G.boss.x;
    G.boss._y = G.boss.y;
  }
  if (G.tib) {
    G.tib._x = G.tib.x;
    G.tib._gy = G.tib.gy;
    G.tib._fy = G.tib.fy;
  }
  G.cam._x = G.cam.x;
}
export function rnow(o) {
  const r = o._r || (o._r = { f: -1, lg: true, land: 0, air: 0, tb: 0 });
  if (r.f !== G.frame) {
    r.f = G.frame;
    if (o.onGround && !r.lg) r.land = 9;
    r.lg = !!o.onGround;
    if (r.land > 0) r.land--;
  }
  return r;
}
export function rnowPh(o) {
  const r = rnow(o);
  if (r.pf !== G.frame) {
    r.pf = G.frame;
    r.ph = (r.ph || 0) + Math.abs(o.vx || 0) * 0.15 + (o.onGround ? 0 : 0.02);
  }
  return r;
}
