#!/usr/bin/env node
/**
 * Build: bundles src/main.js with esbuild and inlines the bundle plus the
 * woff2 fonts into src/index.html, producing a single self-contained page.
 *
 *   node scripts/build.mjs          → dist/index.html + index.html (playable copy)
 *   node scripts/build.mjs --watch  → rebuild on change
 */
import { build, context } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const watch = process.argv.includes('--watch');

const opts = {
  entryPoints: [join(root, 'src/main.js')],
  bundle: true,
  format: 'iife',
  target: 'es2020',
  minify: !watch,
  legalComments: 'none',
  write: false,
  logLevel: 'warning',
};

/** Inline bundle + fonts into the HTML template. */
export function assemble(js) {
  const tpl = readFileSync(join(root, 'src/index.html'), 'utf8');
  const html = tpl
    .replace(/@@FONT:([\w.-]+)@@/g, (_, f) => {
      const b64 = readFileSync(join(root, 'assets/fonts', f)).toString('base64');
      return 'data:font/woff2;base64,' + b64;
    })
    .replace('@@APP@@', () => js.replace(/<\/script/gi, '<\\/script'));
  if (html.includes('@@')) throw new Error('Unresolved placeholder in template');
  return html;
}

function emit(result) {
  const html = assemble(result.outputFiles[0].text);
  mkdirSync(join(root, 'dist'), { recursive: true });
  writeFileSync(join(root, 'dist/index.html'), html);
  writeFileSync(join(root, 'index.html'), html);
  console.log(`built index.html (${(html.length / 1024).toFixed(0)} kB)`);
}

if (watch) {
  const ctx = await context({
    ...opts,
    plugins: [{ name: 'emit', setup: b => b.onEnd(r => r.errors.length || emit(r)) }],
  });
  await ctx.watch();
  console.log('watching src/ …');
} else {
  emit(await build(opts));
}
