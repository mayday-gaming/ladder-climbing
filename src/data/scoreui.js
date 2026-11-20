/** @file On-screen keyboard and buttons for the leaderboard screens (logical 480×270 coords). */
export const KEYS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('').concat(['␣', '⌫', 'OK']);
const COLS = 13,
  KW = 26,
  KH = 20,
  X0 = 240 - (COLS * KW) / 2,
  Y0 = 150;
export function keyRect(i) {
  return { x: X0 + (i % COLS) * KW + 1, y: Y0 + Math.floor(i / COLS) * (KH + 3), w: KW - 2, h: KH };
}
/** Index of the key under (x, y), or -1. */
export function keyAt(x, y) {
  return KEYS.findIndex((_, i) => {
    const r = keyRect(i);
    return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
  });
}
/** "Classifica" button on the title screen. */
export const TITLE_BOARD = { x: 372, y: 8, w: 100, h: 16 };
