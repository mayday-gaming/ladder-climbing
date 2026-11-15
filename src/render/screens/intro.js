/** @file Level intro / boss intro cards. */
import { CH } from '../../data/heroes.js';
import { BOSS, LNAME, LTAG, ORD } from '../../data/levels.js';
import { TX, ctx, el, glow, lgr, pth, rect, rr, tw } from '../../engine/canvas.js';
import { GY, H, OL, P2, W } from '../../engine/config.js';
import { touchy } from '../../engine/input.js';
import { E, clamp, seedR } from '../../engine/math.js';
import { rankOf } from '../../game/progression.js';
import { G } from '../../game/state.js';
import { drawBoss } from '../bosses.js';
import { bars } from '../hud.js';
import { V } from '../interp.js';
import { heroAt } from './menus.js';

let introB = null;
export function drawIntro() {
  const t = G.st + V.A,
    o = ORD[G.lvl],
    bd = BOSS[o],
    ki = E.out(clamp(t / 16, 0, 1)),
    ko = E.io(clamp((t - 210) / 20, 0, 1)),
    a = clamp(ki * (1 - ko), 0, 1);
  ctx.save();
  ctx.globalAlpha = a;
  rect(0, 0, W, H, 'rgba(2,5,24,.93)');
  const sl = E.out(clamp(t / 22, 0, 1)),
    off = (1 - sl) * 300 + ko * 300;
  ctx.save();
  ctx.transform(1, 0, -0.28, 1, 0, 0);
  rect(-80 - off, 54, W / 2 + 112, 160, lgr(0, 54, 0, 214, '#2f6bff', '#0f1f66'));
  rect(W / 2 + 36 + off, 54, W / 2 + 140, 160, lgr(0, 54, 0, 214, '#d0102a', '#4a0612'));
  ctx.save();
  ctx.beginPath();
  ctx.rect(-80, 54, W + 300, 160);
  ctx.clip();
  for (let i = 0; i < 18; i++) {
    const r = seedR(i * 11 + G.lvl),
      ly = 58 + r() * 152,
      lw = 30 + r() * 80,
      d = i % 2 ? 1 : -1,
      lx =
        d > 0
          ? ((r() * 600 + V.TT * (5 + r() * 7)) % (W + 300)) - 100
          : W + 200 - ((r() * 600 + V.TT * (5 + r() * 7)) % (W + 300));
    rect(lx, ly, lw, 0.7 + r() * 1.4, 'rgba(255,255,255,' + (0.1 + r() * 0.2) + ')');
  }
  ctx.restore();
  rect(-80, 54, W + 300, 2.5, '#ffd500');
  rect(-80, 211.5, W + 300, 2.5, '#ffd500');
  ctx.restore();
  const lb = 'LIVELLO ' + (G.lvl + 1) + ' / 7  ·  ' + rankOf(G.lvl).toUpperCase(),
    lw2 = tw(lb, 6, { b: 1, w: 900 }) + 18,
    dy = (1 - E.back(clamp(t / 20, 0, 1))) * -50;
  rr(W / 2 - lw2 / 2, 9 + dy, lw2, 12, 6, '#ffd500', OL, 0.7);
  TX(lb, W / 2, 15.4 + dy, 6, '#0a1436', { b: 1, w: 900 });
  TX(LNAME[o], W / 2, 33 + dy, 13, lgr(0, 25, 0, 41, '#ffffff', '#ffe95c'), {
    w: 700,
    sk: '#0a1436',
    sw: 2.6,
  });
  TX(LTAG[o], W / 2, 46.5 + dy, 5.6, '#cfe0ff', { b: 1, w: 800 });
  const hx = 112 - (1 - E.back(clamp((t - 6) / 22, 0, 1))) * 260 - ko * 260,
    bx = 368 + (1 - E.back(clamp((t - 12) / 22, 0, 1))) * 260 + ko * 260,
    fy = 198;
  glow(hx, 140, 80, '#9ff6ff', 0.3);
  glow(bx, 140, 80, '#ff8090', 0.3);
  el(hx, fy, 34, 5, 'rgba(0,0,0,.4)');
  el(bx, fy, 38, 5, 'rgba(0,0,0,.4)');
  const ch = G.P.ch,
    bob = Math.sin(V.TT * 0.08) * 1.2;
  if (ch == 4) {
    heroAt(4, 0, hx - 26, fy, 3.1, { shootT: G.frame % 90 < 10 ? 9 : 0, hired: G.P.hired });
    heroAt(4, 1, hx + 24, fy, 3.1, { hired: G.P.hired });
  } else if (ch == 0)
    heroAt(0, 0, hx, fy - 8 + bob * 2, 3.5, { onGround: false, vy: -1, flap: G.frame % 20 < 10 ? 6 : 0 });
  else heroAt(ch, 0, hx, fy, ch == 2 ? 3.4 : 3.3, { shootT: G.frame % 90 < 10 ? 9 : 0 });
  if (!introB || introB.i != o)
    introB = {
      i: o,
      name: bd.name,
      w: bd.w,
      h: bd.h,
      vx: 0,
      vy: 0,
      hp: bd.hp,
      max: bd.hp,
      st: 'walk',
      t: 0,
      ph: 0,
      face: -1,
      flash: 0,
      n: 0,
      k: 0,
      alpha: 1,
      dead: false,
      spot: 0,
      hi: false,
    };
  const B = introB,
    bs = Math.min(3.1, 108 / bd.h);
  B.x = B._x = -bd.w / 2;
  B.y = B._y = GY - bd.h;
  B.t = 1;
  B.st = 'walk';
  ctx.save();
  ctx.translate(bx, fy);
  ctx.scale(bs, bs);
  ctx.translate(0, -GY);
  try {
    drawBoss(B);
  } catch (e) {}
  ctx.restore();
  ctx.globalAlpha = a;
  const q = clamp((t - 30) / 14, 0, 1);
  if (q > 0) {
    const pop = 1 + 1.8 * (1 - E.out(q)),
      sh = t < 60 ? (Math.random() - 0.5) * 3 * (1 - (t - 30) / 30) : 0;
    ctx.save();
    ctx.translate(W / 2 + sh, 132);
    ctx.scale(pop, pop);
    ctx.rotate(-0.08);
    ctx.globalAlpha = a * q;
    for (let i = 0; i < 10; i++) {
      ctx.rotate(P2 / 10);
      pth([0, 0, 46, -5, 46, 5], 'rgba(255,233,92,.16)');
    }
    ctx.rotate(0.08 - 0.08);
    TX('VS', 2, 3, 44, '#04081e', { w: 700, sk: '#04081e', sw: 8 });
    TX('VS', 0, 0, 44, lgr(0, -22, 0, 22, '#fff6a0', '#ffc400', [1, '#ff5a2a']), {
      w: 700,
      sk: '#04081e',
      sw: 5,
    });
    ctx.restore();
    ctx.globalAlpha = a;
  }
  const hn = ch == 4 ? 'TIBERIO & LUIGI' : CH[ch].name;
  TX(hn, hx, fy + 23, 10, '#ffffff', { w: 700, sk: '#0a1436', sw: 2.2 });
  const bfs = Math.min(10, (170 / Math.max(1, tw(bd.name, 10, { w: 700 }))) * 10);
  TX(bd.name, bx, fy + 23, bfs, '#ffe95c', { w: 700, sk: '#0a1436', sw: 2.2 });
  TX(bd.sub, W / 2, fy + 36, 6, '#ffb0b8', { b: 1, w: 900 });
  const n = Math.floor(clamp(t - 50, 0, 999) * 1.2);
  TX(bd.q.slice(0, n), W / 2, fy + 47, 6.6, '#ffffff', { b: 1, w: 800 });
  if (G.lvl == 0) TX(CH[ch].tip, W / 2, fy + 59, 4.8, '#9fb4ff', { b: 1, w: 800 });
  if (t > 40 && (G.frame >> 4) % 2)
    TX(touchy() ? 'TOCCA PER INIZIARE' : 'INVIO PER INIZIARE', 8, H - 7, 4.6, '#ffe95c', {
      a: 'left',
      b: 1,
      w: 900,
    });
  ctx.restore();
  ctx.globalAlpha = 1;
}
export function drawBossIntro() {
  const k = clamp(G.st / 24, 0, 1),
    ex = G.st > 170 ? E.io((G.st - 170) / 20) : 0;
  bars(k * (1 - ex));
  if (G.st < 36) return;
  const b = BOSS[ORD[G.lvl]],
    q = clamp((G.st - 36) / 22, 0, 1),
    x = W / 2 + (1 - E.back(q)) * 300;
  ctx.save();
  ctx.translate(x, H * 0.62);
  ctx.globalAlpha = 1 - ex;
  rr(-150, -34, 300, 58, 8, 'rgba(4,8,30,.82)', 'rgba(255,80,100,.6)', 1);
  TX('⚠ BOSS ⚠', 0, -24, 6, (G.frame >> 3) % 2 ? '#ff4d5e' : '#ffd500', { b: 1, w: 900 });
  TX(b.name, 0, -10, 17, '#ffe95c', { w: 700, sk: '#0a1436', sw: 3 });
  TX(b.sub, 0, 6, 6.6, '#ffffff', { b: 1, w: 800 });
  const n = Math.floor(clamp(G.st - 60, 0, 999) * 0.9);
  TX(b.q.slice(0, n), 0, 16, 6, '#9ff6ff', { b: 1, w: 800 });
  ctx.restore();
  ctx.globalAlpha = 1;
}
