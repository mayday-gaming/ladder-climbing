/** Child-process entry: boots the game headless and plays it with one hero. */
import { installBrowserStub, press, stats } from './browser-stub.js';
import { playthrough } from './playthrough.js';

installBrowserStub();
await import('../../src/main.js');
const g = globalThis.__g;
for (let i = 0; i < 60; i++) g.update();
press('Enter');
for (let i = 0; i < 30; i++) g.update();
let report;
try {
  report = playthrough(g, +process.argv[2]);
} catch (e) {
  report = { crash: String(e && e.stack) };
}
report.drawCalls = stats.calls;
report.canvasErrors = stats.errors.slice(0, 5);
process.stdout.write(JSON.stringify(report));
