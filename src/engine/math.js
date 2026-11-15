/** @file Pure math helpers: clamp, lerp, easing table, seeded RNG, AABB overlap. */
export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v),
  rnd = (a, b) => a + Math.random() * (b - a),
  sgn = v => (v < 0 ? -1 : 1);
export function ov(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
export const lerp = (a, b, t) => a + (b - a) * t;
export const E = {
  out: t => 1 - Math.pow(1 - clamp(t, 0, 1), 3),
  io: t => {
    t = clamp(t, 0, 1);
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  },
  back: t => {
    t = clamp(t, 0, 1);
    const c1 = 1.70158,
      c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  el: t => {
    t = clamp(t, 0, 1);
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * 2.0944) + 1;
  },
};
export function seedR(n) {
  let s = n * 9301 + 49297;
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
}
