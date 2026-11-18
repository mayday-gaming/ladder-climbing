import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const run = promisify(execFile);
const runner = fileURLToPath(new URL('../helpers/run-hero.js', import.meta.url));
const HEROES = {
  1: 'Bolt',
  2: 'Angry Man',
  3: 'August',
  4: 'Stagisti',
  5: 'Iolanda',
  6: 'Ops',
  7: 'Sora Rita',
};

// Each hero runs in its own process: modules hold game state, so isolation
// matters, and parallel processes keep the suite fast.
const reports = Object.fromEntries(
  Object.keys(HEROES).map(h => [
    h,
    run(process.execPath, [runner, h], { maxBuffer: 1 << 24 }).then(r => JSON.parse(r.stdout)),
  ]),
);

for (const [h, name] of Object.entries(HEROES)) {
  test(`headless playthrough reaches the ending with ${name}`, { timeout: 240_000 }, async () => {
    const r = await reports[h];
    assert.equal(r.crash, undefined, r.crash);
    assert.deepEqual(r.canvasErrors, []);
    assert.equal(r.nan, null, 'non-finite entity position: ' + r.nan);
    assert.ok(r.howto, 'controls screen should follow hero selection');
    assert.equal(r.levels.length, 7);
    r.levels.forEach((l, i) => assert.equal(l.states[0], 'tally', `level ${i} did not end in tally`));
    assert.equal(r.end.state, 'ending');
    assert.ok(r.end.score > 0);
    assert.ok(r.drawCalls > 10_000, 'renderer barely ran');
  });
}

test('interns play the three-act prologue ending with the contract boss', async () => {
  const r = await reports[4];
  assert.deepEqual(r.preIds, ['primo', 'colloquio', 'contratto']);
  assert.ok(r.cavMaxHp > 0, 'Dott. Cavillo should spawn with hit points');
});
