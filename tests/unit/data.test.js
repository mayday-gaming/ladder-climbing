import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CH } from '../../src/data/heroes.js';
import { ALLY, ANAME, ALLY_OF, CUT, CONS, FLOAT } from '../../src/data/allies.js';
import { ORD, LNAME, LTAG, BOSS, PERK, ROLES } from '../../src/data/levels.js';
import { ORZOQ } from '../../src/data/quadri.js';

test('five heroes with complete select-screen data', () => {
  assert.equal(CH.length, 5);
  for (const c of CH) {
    for (const k of ['name', 'short', 'wep', 'ally', 'tip']) assert.ok(c[k], `${c.name} missing ${k}`);
    assert.ok(Array.isArray(c.ds) && c.ds.length >= 3, `${c.name} needs varied descriptions`);
    assert.ok(c.spd > 0 || (c.F && c.F.every(f => f.spd > 0)), `${c.name} speed`);
  }
});

test('every hero ally type exists with name, behaviour and cut-in', () => {
  assert.equal(ALLY_OF.length, CH.length);
  const types = new Set(ALLY.map(a => a.type));
  for (const t of [...ALLY_OF, 'capo', 'tib', 'laifo']) {
    assert.ok(types.has(t), 'ALLY missing ' + t);
    assert.ok(ANAME[t], 'ANAME missing ' + t);
    assert.ok(CUT[t], 'CUT missing ' + t);
  }
});

test("August's ally is the Penguin, not Claudio", () => {
  const june = CH.findIndex(c => c.name === 'AUGUST');
  assert.equal(CH[june].ally, 'PENGUIN');
  assert.equal(ALLY_OF[june], 'tux');
});

test('consultants Tiberio and Luigi are flying birds', () => {
  assert.deepEqual(CONS.map(c => c.n).sort(), ['LUIGI', 'TIBERIO']);
  for (const c of CONS) assert.ok(FLOAT[c.t], c.n + ' should fly');
});

test('seven levels, each with name, tagline, boss, perk and rank', () => {
  assert.deepEqual([...ORD].sort(), [0, 1, 2, 3, 4, 5, 6]);
  for (const arr of [LNAME, LTAG, BOSS, PERK]) assert.equal(arr.length, 7);
  assert.equal(ROLES.length, 8, 'one rank per level plus the final promotion');
  for (const b of BOSS) assert.ok(b.name && b.sub, 'boss needs name and subtitle');
  assert.ok(BOSS.some(b => b.name === 'ASDRUBALE'));
});

test('barley mockery has enough variety', () => {
  assert.ok(ORZOQ.length >= 4);
  assert.equal(new Set(ORZOQ).size, ORZOQ.length, 'duplicate lines');
});
