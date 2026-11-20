/**
 * @file Leaderboard: top scores with player names, kept in this browser.
 *
 * GitHub Pages is static hosting, so there is no shared server here: the
 * board lives in localStorage. The pure helpers below are what a remote
 * backend (e.g. Supabase) would plug into later.
 */
export const BOARD_SIZE = 10;
export const NAME_LEN = 8;
const BOARD_KEY = 'bc_board';
const NAME_KEY = 'bc_name';

/** Does `score` deserve a place on `list`? */
export function qualifies(list, score) {
  if (!(score > 0)) return false;
  return list.length < BOARD_SIZE || score > list[list.length - 1].s;
}

/** Returns a new sorted, capped list with `entry` inserted, plus its 0-based rank (-1 if it fell off). */
export function insertScore(list, entry) {
  const next = [...list, entry].sort((a, b) => b.s - a.s || a.d.localeCompare(b.d));
  const rank = next.indexOf(entry);
  return { list: next.slice(0, BOARD_SIZE), rank: rank < BOARD_SIZE ? rank : -1 };
}

/** Uppercase, letters/digits/spaces only, trimmed to NAME_LEN; falls back to "ANONIMO". */
export function cleanName(s) {
  const n = String(s || '')
    .toUpperCase()
    .replace(/[^A-Z0-9ÀÈÉÌÒÙ ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, NAME_LEN);
  return n || 'ANONIMO';
}

export function loadBoard() {
  try {
    const raw = JSON.parse(localStorage.getItem(BOARD_KEY) || '[]');
    return Array.isArray(raw) ? raw.filter(e => e && Number.isFinite(e.s) && e.n).slice(0, BOARD_SIZE) : [];
  } catch {
    return [];
  }
}
export function saveBoard(list) {
  try {
    localStorage.setItem(BOARD_KEY, JSON.stringify(list));
  } catch {}
}
export function loadName() {
  try {
    return localStorage.getItem(NAME_KEY) || '';
  } catch {
    return '';
  }
}
export function saveName(n) {
  try {
    localStorage.setItem(NAME_KEY, n);
  } catch {}
}
