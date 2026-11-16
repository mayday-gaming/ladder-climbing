import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clamp, lerp, ov, seedR, E } from '../../src/engine/math.js';

test('clamp bounds values', () => {
  assert.equal(clamp(5, 0, 3), 3);
  assert.equal(clamp(-1, 0, 3), 0);
  assert.equal(clamp(2, 0, 3), 2);
});

test('lerp interpolates linearly', () => {
  assert.equal(lerp(0, 10, 0), 0);
  assert.equal(lerp(0, 10, 1), 10);
  assert.equal(lerp(0, 10, 0.5), 5);
});

test('ov detects AABB overlap', () => {
  const a = { x: 0, y: 0, w: 10, h: 10 };
  assert.ok(ov(a, { x: 5, y: 5, w: 10, h: 10 }));
  assert.ok(!ov(a, { x: 20, y: 0, w: 10, h: 10 }));
});

test('seedR is deterministic and in [0,1)', () => {
  const a = seedR(42),
    b = seedR(42);
  for (let i = 0; i < 100; i++) {
    const x = a();
    assert.equal(x, b());
    assert.ok(x >= 0 && x < 1);
  }
  assert.notEqual(seedR(1)(), seedR(2)());
});

test('easing functions map 0→0 and 1→1', () => {
  for (const [name, f] of Object.entries(E)) {
    if (typeof f !== 'function') continue;
    assert.ok(Math.abs(f(0)) < 1e-9, name + '(0)');
    assert.ok(Math.abs(f(1) - 1) < 1e-9, name + '(1)');
  }
});
