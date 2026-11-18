import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CH, HORD, SEL } from '../../src/data/heroes.js';
import { ALLY, ANAME, ALLY_OF, CUT, CONS, FLOAT } from '../../src/data/allies.js';
import { ORD, LNAME, LTAG, BOSS, PERK, ROLES } from '../../src/data/levels.js';
import { CAVQ, CLAUSOLE, CONTRATTO, ORZOQ } from '../../src/data/quadri.js';

test('every hero has complete select-screen data', () => {
  assert.equal(CH.length, 8);
  for (const c of CH) {
    for (const k of ['name', 'short', 'wep', 'ally', 'tip']) assert.ok(c[k], `${c.name} missing ${k}`);
    if (c.name != 'ANZU') assert.ok(c.dif, `${c.name} needs a comic flaw (dif)`);
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

test('roster: seven heroes, Anzu not selectable', () => {
  assert.ok(!HORD.includes(0));
  assert.deepEqual(
    HORD.map(i => CH[i].name),
    ['BOLT', 'AUGUST', 'ANGRY MAN', 'MARTINA', 'OPS', 'SORA RITA', 'STAGISTI'],
  );
});

test('new heroes: F abilities have cooldowns, allies are wired', () => {
  const by = n => CH.find(c => c.name == n);
  assert.equal(by('MARTINA').fKey.act, 'freeze');
  assert.equal(by('SORA RITA').fKey.act, 'leap');
  assert.equal(by('OPS').fKey, undefined, "Ops' rollback is passive");
  for (const c of CH) if (c.fKey) assert.ok(c.fKey.cd > 0 && c.fKey.n && c.fKey.btn);
  assert.deepEqual(ALLY_OF.slice(5), ['kanban', 'rack', 'centralino']);
});

test('select cards are centred and tap hit-testing maps back to the card', () => {
  HORD.forEach((_, n) => assert.equal(SEL.at(SEL.x(n)), n));
  assert.equal(SEL.x(0) + SEL.x(HORD.length - 1), 480);
  assert.ok(SEL.x(0) - SEL.w / 2 >= 0 && SEL.x(HORD.length - 1) + SEL.w / 2 <= 480, 'cards fit on screen');
  assert.ok(SEL.pitch > SEL.w, 'cards must not overlap');
});

test('contract boss has its own dialogue and clauses', () => {
  assert.equal(CONTRATTO.id, 'contratto');
  assert.ok(CAVQ.length >= 8 && CLAUSOLE.length >= 8);
});
