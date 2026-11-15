import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const run = promisify(execFile);
const runner = fileURLToPath(new URL('../helpers/run-hero.js', import.meta.url));
const HEROES = { 0: 'Anzu', 1: 'Bolt', 2: 'Angry Man', 3: 'June', 4: 'Stagisti' };

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
    assert.equal(r.levels.length, 7);
    r.levels.forEach((l, i) => assert.equal(l.states[0], 'tally', `level ${i} did not end in tally`));
    assert.equal(r.end.state, 'ending');
    assert.ok(r.end.score > 0);
    assert.ok(r.drawCalls > 10_000, 'renderer barely ran');
  });
}

test('interns open with the HR interview (quadro) before level 1', async () => {
  const r = await reports[4];
  assert.ok(r.pre.length > 1, 'expected quadro states before first level: ' + r.pre);
});
