/**
 * Real-browser smoke + playthrough on the built index.html (Playwright).
 * Skips automatically when no Chromium is available (set CHROME_PATH).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { playthrough } from '../helpers/playthrough.js';

const html = fileURLToPath(new URL('../../index.html', import.meta.url));
const exe = [process.env.CHROME_PATH, '/usr/bin/google-chrome', '/usr/bin/chromium'].find(
  p => p && existsSync(p),
);
let chromium;
try {
  ({ chromium } = await import('playwright-core'));
} catch {}

test(
  'built game boots and plays to the ending in Chromium',
  { skip: !exe || !chromium, timeout: 300_000 },
  async () => {
    const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
    try {
      const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
      const errors = [];
      page.on('pageerror', e => errors.push(String(e)));
      page.on('console', m => m.type() === 'error' && errors.push(m.text()));
      await page.goto(pathToFileURL(html).href);
      await page.waitForTimeout(900);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(400);
      const report = await page.evaluate(`(${playthrough})(window.__g, 4)`);
      assert.deepEqual(errors, []);
      assert.equal(report.nan, null);
      assert.equal(report.end.state, 'ending');
    } finally {
      await browser.close();
    }
  },
);
