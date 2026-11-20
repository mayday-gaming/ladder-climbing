import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BOARD_SIZE, cleanName, insertScore, qualifies } from '../../src/game/scores.js';

const e = (n, s, d = '2026-01-01') => ({ n, s, h: 1, l: 1, d });

test('qualifies: any positive score while the board is not full, then only beating the last', () => {
  assert.ok(!qualifies([], 0));
  assert.ok(qualifies([], 10));
  const full = Array.from({ length: BOARD_SIZE }, (_, i) => e('P' + i, 1000 - i * 10));
  assert.ok(!qualifies(full, full.at(-1).s));
  assert.ok(qualifies(full, full.at(-1).s + 1));
});

test('insertScore keeps the board sorted, capped and reports the rank', () => {
  let list = [];
  for (const s of [500, 900, 100]) list = insertScore(list, e('X', s)).list;
  const r = insertScore(list, e('NEW', 700));
  assert.deepEqual(
    r.list.map(x => x.s),
    [900, 700, 500, 100],
  );
  assert.equal(r.rank, 1);
  const full = Array.from({ length: BOARD_SIZE }, (_, i) => e('P' + i, 1000 - i * 10));
  const low = insertScore(full, e('LOW', 1));
  assert.equal(low.rank, -1);
  assert.equal(low.list.length, BOARD_SIZE);
});

test('ties: the older score stays ahead', () => {
  const a = e('OLD', 300, '2026-01-01'),
    b = e('NEW', 300, '2026-02-01');
  assert.equal(insertScore([a], b).rank, 1);
});

test('cleanName uppercases, strips symbols and limits length', () => {
  assert.equal(cleanName('luca'), 'LUCA');
  assert.equal(cleanName('  <b>x</b>!! '), 'BXB');
  assert.equal(cleanName('abcdefghijkl'), 'ABCDEFGH');
  assert.equal(cleanName('   '), 'ANONIMO');
});
