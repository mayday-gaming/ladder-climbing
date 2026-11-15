/** @file Top-level draw dispatcher per state. */
import { BOSS, ORD } from '../data/levels.js';
import { ctx, cv, rect } from '../engine/canvas.js';
import { H, W } from '../engine/config.js';
import { E, clamp, lerp } from '../engine/math.js';
import { G } from '../game/state.js';
import { addConf } from './fx.js';
import { drawHUD, stamp } from './hud.js';
import { V } from './interp.js';
import { drawEnding } from './screens/ending.js';
import { drawBossIntro, drawIntro } from './screens/intro.js';
import { drawBoot, drawGameOver, drawPause, drawPresent, drawSelect, drawTitle } from './screens/menus.js';
import { drawBan, drawCut, drawEvc, drawTally } from './screens/overlays.js';
import { drawQuadro } from './screens/quadro.js';
import { drawEvtFx, drawWorld } from './world.js';

let transF = -999;
function drawTrans() {
  if (G.state !== V.lastState) {
    if (['select', 'intro', 'ending', 'title', 'gameover', 'quadro'].includes(G.state) && V.lastState !== '')
      transF = V.TT;
    V.lastState = G.state;
  }
  const k = (V.TT - transF) / 26;
  if (k >= 0 && k < 1) {
    const a = 1 - E.out(k);
    ctx.globalAlpha = a;
    rect(0, 0, W, H, '#040a26');
    ctx.globalAlpha = 1;
    const x = -W * 0.3 + E.io(k) * W * 1.6;
    ctx.save();
    ctx.translate(x, 0);
    ctx.rotate(-0.25);
    rect(-14, -60, 10, H + 140, 'rgba(255,213,0,' + a * 0.9 + ')');
    rect(2, -60, 4, H + 140, 'rgba(47,107,255,' + a * 0.9 + ')');
    ctx.restore();
  }
}
export function draw() {
  if (!cv.width) return;
  ctx.setTransform(V.K, 0, 0, V.K, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  V.TT = G.frame + V.A;
  V.camX = G.cam._x == null ? G.cam.x : lerp(G.cam._x, G.cam.x, V.A);
  if (G.state == 'boot') drawBoot();
  else if (G.state == 'present') drawPresent();
  else if (G.state == 'title') drawTitle();
  else if (G.state == 'select') drawSelect();
  else if (G.state == 'ending') drawEnding();
  else {
    if (G.evt && G.evt.id == 'flip' && G.state == 'play') {
      const k = Math.min(G.evt.t, G.evt.dur - G.evt.t, 20) / 20,
        sy = Math.cos(Math.PI * k);
      ctx.save();
      ctx.translate(0, H / 2);
      ctx.scale(1, Math.abs(sy) < 0.02 ? 0.02 : sy);
      ctx.translate(0, -H / 2);
      drawWorld();
      ctx.restore();
    } else drawWorld();
    if (G.state == 'bosswin' && G.st < 90 && G.boss && G.frame % 6 == 0 && G.boss._cf !== G.frame) {
      G.boss._cf = G.frame;
      addConf(G.boss.x + G.boss.w / 2, G.boss.y + G.boss.h / 2, 10);
    }
    drawEvtFx();
    if (G.state != 'bossintro') drawHUD();
    if (G.state == 'intro') drawIntro();
    else if (G.state == 'bossintro') drawBossIntro();
    else if (G.state == 'bosswin' && G.st > 90)
      stamp(BOSS[ORD[G.lvl]].end, W / 2, 110, clamp((G.st - 90) / 14, 0, 1), '#ff3b4a');
    else if (G.state == 'tally') drawTally();
    else if (G.state == 'gameover') drawGameOver();
    else if (G.state == 'quadro') drawQuadro();
  }
  if (G.ban && G.state == 'play' && !G.cut) drawBan();
  if (G.evc && G.state == 'play') drawEvc();
  if (G.cut && G.state == 'play') drawCut();
  if (G.paused) drawPause();
  drawTrans();
}
