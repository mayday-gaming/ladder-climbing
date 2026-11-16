/** @file Procedural level construction and enemy factory (mkEnemy). */
import { EMAP, ET, ORD, SIGNS, STG } from '../data/levels.js';
import { Snd } from '../engine/audio.js';
import { GY } from '../engine/config.js';
import { bB } from '../engine/input.js';
import { seedR } from '../engine/math.js';
import { cf } from './progression.js';
import { G, setState } from './state.js';

function extraRoute(L, i, gx, sx, h) {
  const { g, gap, blk, ow, coins, en } = h;
  const r = seedR(i * 77 + 5);
  let si = (i * 5) % SIGNS.length;
  const B = ['wall', 'cab', 'cab', 'ac', 'rack', 'cab', 'cab'][i],
    K2 = ['pens', 'shelf', 'chand', 'beam', 'shelf', 'shelf', 'shelf'][i];
  const X = dx => gx() + dx;
  const sign = (dx, t) => L.sg.push({ x: X(dx), t: t || SIGNS[si++ % SIGNS.length] });
  const lift = (dx, y, w, ax, amp, sp, ph) =>
    L.plats.push({
      x: X(dx),
      y,
      w,
      h: 6,
      ow: 1,
      k: 'lift',
      mv: { a: ax, amp, sp, ph: ph || 0, x0: X(dx), y0: y },
    });
  const spring = dx => L.plats.push({ x: X(dx), y: GY - 8, w: 16, h: 8, k: 'spring' });
  const belt = (dx, w, d) => L.plats.push({ x: X(dx), y: GY - 6, w, h: 6, k: 'belt', dir: d });
  const SEC = {
    coffee: () => {
      L.cp.push({ x: X(120) });
      sign(40, 'Pausa caffè obbligatoria (art. 12)');
      coins(170, GY - 22, 3);
      g(270);
    },
    stairs: () => {
      sign(8);
      ow(30, 204, 40, K2);
      ow(88, 178, 40, K2);
      ow(146, 152, 40, K2);
      ow(204, 126, 74, K2);
      coins(212, 108, 4);
      en('busta', 270, 128);
      ow(300, 160, 40, K2);
      ow(356, 196, 40, K2);
      en('carta', 250, GY, 190, 340);
      g(420);
    },
    pits: () => {
      g(70);
      gap(50);
      en('busta', 20, 150);
      g(74);
      gap(54);
      coins(22, GY - 22, 3);
      g(74);
      gap(50);
      g(50);
    },
    belt: () => {
      sign(4, "Nastro pratiche: si procede all'indietro");
      belt(40, 180, -1);
      en('carta', 110, GY - 6, 50, 210);
      coins(70, GY - 30, 6);
      g(290);
    },
    liftGap: () => {
      sign(10, 'Montacarichi: portata 1 dirigente');
      g(70);
      lift(52, GY - 18, 46, 'x', 42, 0.025, 0);
      for (let k = 0; k < 3; k++) L.pk.push({ type: 'buono', x: X(61 + k * 14), y: GY - 52 });
      sx(gx() + 150);
      g(90);
    },
    hill: () => {
      sign(6);
      blk(40, 28, 20, B);
      blk(68, 28, 38, B);
      blk(96, 28, 56, B);
      blk(124, 28, 38, B);
      blk(152, 28, 20, B);
      coins(100, GY - 80, 2);
      en('timbro', 220, GY, 190, 290);
      g(310);
    },
    spring: () => {
      sign(4, 'Trampolino di carriera (uso interno)');
      spring(60);
      ow(50, 112, 110, K2);
      coins(64, 94, 5);
      en('stamp', 250, GY);
      g(300);
    },
    liftUp: () => {
      sign(6);
      lift(64, 170, 42, 'y', 46, 0.02, 1.2);
      ow(124, 98, 96, K2);
      coins(132, 80, 5);
      L.pk.push({ type: 'caffe', x: X(196), y: 82 });
      en('carta', 170, GY, 120, 280);
      g(310);
    },
    gauntlet: () => {
      sign(14);
      en('carta', 70, GY, 30, 150);
      en('timbro', 170, GY, 130, 230);
      en('busta', 230, 140);
      en('stamp', 300, GY);
      coins(110, GY - 22, 4);
      g(360);
    },
  };
  const ks = ['stairs', 'pits', 'belt', 'liftGap', 'hill', 'spring', 'liftUp', 'gauntlet'];
  for (let k = ks.length - 1; k > 0; k--) {
    const j = (r() * (k + 1)) | 0;
    [ks[k], ks[j]] = [ks[j], ks[k]];
  }
  SEC.coffee();
  for (const k of ks) SEC[k]();
  sign(30, 'Ufficio del boss →');
}
function build(i) {
  const L = { plats: [], en: [], pk: [], dec: [], i };
  let cx = 0;
  const g = w => {
    L.plats.push({ x: cx, y: GY, w, h: 60, k: 'g' });
    cx += w;
  };
  const gap = w => {
    for (let k = 0; k < 3; k++)
      L.pk.push({ type: 'buono', x: cx + w / 2 - 4 + (k - 1) * 15, y: GY - 44 - (k == 1 ? 10 : 0) });
    cx += w;
  };
  const blk = (dx, w, h, k) => L.plats.push({ x: cx + dx, y: GY - h, w, h, k });
  const ow = (dx, y, w, k) => L.plats.push({ x: cx + dx, y, w, h: 6, ow: 1, k });
  const coins = (dx, y, n) => {
    for (let k = 0; k < n; k++) L.pk.push({ type: 'buono', x: cx + dx + k * 14, y });
  };
  const pk = (t, dx, y) => L.pk.push({ type: t, x: cx + dx, y });
  const en = (t, dx, fy, a, b) =>
    L.en.push({
      t,
      x: cx + dx,
      fy: fy || GY,
      x1: cx + (a == null ? dx - 40 : a),
      x2: cx + (b == null ? dx + 40 : b),
    });
  if (i == 0) {
    coins(120, GY - 22, 4);
    g(240);
    blk(20, 58, 18, 'car');
    blk(96, 50, 17, 'car');
    coins(34, GY - 42, 3);
    coins(108, GY - 42, 3);
    en('carta', 200, GY, 165, 265);
    g(280);
    ow(30, 186, 70, 'pens');
    pk('chip', 60, 166);
    en('busta', 210, 150);
    coins(130, GY - 22, 4);
    g(260);
    blk(40, 80, 34, 'wall');
    coins(54, GY - 58, 4);
    en('carta', 175, GY, 135, 255);
    en('carta', 70, GY - 34, 44, 104);
    g(280);
    ow(20, 190, 50, 'pens');
    ow(92, 152, 50, 'pens');
    coins(98, 134, 3);
    en('busta', 220, 170);
    en('busta', 270, 128);
    g(300);
    blk(30, 58, 18, 'car');
    en('timbro', 170, GY, 110, 240);
    coins(40, GY - 42, 3);
    pk('caffe', 200, GY - 24);
    g(260);
    blk(20, 50, 17, 'car');
    blk(92, 58, 18, 'car');
    en('carta', 200, GY, 165, 250);
    en('busta', 240, 140);
    coins(170, GY - 22, 5);
    g(280);
  } else if (i == 1) {
    coins(100, GY - 22, 4);
    g(220);
    blk(30, 60, 20, 'desk');
    en('carta', 160, GY, 110, 235);
    coins(40, GY - 44, 3);
    g(250);
    ow(20, 188, 56, 'shelf');
    ow(96, 152, 56, 'shelf');
    coins(104, 134, 3);
    en('stamp', 205, GY);
    g(260);
    gap(46);
    blk(20, 28, 36, 'cab');
    blk(48, 60, 20, 'desk');
    en('timbro', 175, GY, 125, 245);
    pk('chip', 26, GY - 60);
    g(270);
    en('busta', 70, 150);
    en('busta', 140, 118);
    ow(40, 186, 60, 'shelf');
    coins(50, 168, 3);
    g(200);
    blk(30, 60, 20, 'desk');
    blk(130, 60, 20, 'desk');
    en('carta', 50, GY - 20, 32, 76);
    en('stamp', 150, GY - 20);
    coins(98, GY - 56, 2);
    g(240);
    gap(52);
    ow(30, 186, 50, 'shelf');
    ow(100, 150, 50, 'shelf');
    ow(170, 186, 50, 'shelf');
    pk('caffe', 120, 130);
    en('timbro', 245, GY, 215, 290);
    g(300);
    blk(40, 28, 36, 'cab');
    en('carta', 140, GY, 85, 205);
    en('busta', 225, 140);
    coins(110, GY - 22, 5);
    g(260);
  } else if (i == 2) {
    coins(110, GY - 22, 3);
    en('carta', 190, GY, 150, 235);
    g(240);
    ow(20, 190, 48, 'chand');
    ow(84, 154, 48, 'chand');
    ow(148, 118, 48, 'chand');
    coins(154, 100, 3);
    en('stamp', 235, GY);
    g(270);
    gap(50);
    blk(20, 60, 20, 'desk');
    blk(80, 28, 36, 'cab');
    en('timbro', 175, GY, 130, 245);
    en('busta', 205, 128);
    g(260);
    en('carta', 40, GY, 10, 95);
    en('carta', 145, GY, 105, 195);
    ow(60, 184, 70, 'chand');
    pk('chip', 90, 162);
    en('busta', 225, 160);
    g(250);
    gap(56);
    blk(30, 28, 36, 'cab');
    blk(58, 28, 56, 'cab');
    coins(60, GY - 80, 2);
    en('stamp', 155, GY);
    en('timbro', 235, GY, 195, 275);
    g(290);
    ow(20, 186, 50, 'chand');
    ow(100, 150, 50, 'chand');
    en('busta', 70, 108);
    en('busta', 170, 180);
    en('busta', 250, 140);
    pk('caffe', 120, 130);
    g(280);
    gap(50);
    blk(40, 60, 20, 'desk');
    en('stamp', 60, GY - 20);
    en('carta', 165, GY, 120, 225);
    en('timbro', 240, GY, 205, 270);
    pk('chip', 205, GY - 52);
    g(280);
  } else if (i == 4) {
    coins(100, GY - 22, 4);
    g(220);
    blk(30, 28, 36, 'rack');
    coins(34, GY - 58, 2);
    en('carta', 150, GY, 100, 215);
    g(240);
    ow(20, 188, 56, 'shelf');
    pk('chip', 40, 168);
    en('busta', 170, 150);
    coins(120, GY - 22, 4);
    g(250);
    gap(44);
    blk(20, 60, 20, 'desk');
    blk(120, 28, 36, 'rack');
    en('timbro', 200, GY, 160, 255);
    coins(34, GY - 44, 3);
    g(270);
    ow(30, 186, 50, 'shelf');
    ow(104, 150, 50, 'shelf');
    coins(110, 132, 3);
    en('stamp', 215, GY);
    g(260);
    blk(40, 28, 36, 'rack');
    blk(68, 28, 56, 'rack');
    en('carta', 160, GY, 110, 230);
    en('busta', 200, 130);
    pk('caffe', 76, GY - 80);
    g(250);
    gap(48);
    en('carta', 60, GY, 20, 120);
    en('timbro', 170, GY, 130, 230);
    coins(90, GY - 22, 5);
    g(250);
  } else if (i == 5) {
    coins(100, GY - 22, 4);
    en('carta', 190, GY, 150, 235);
    g(240);
    blk(30, 60, 20, 'desk');
    blk(90, 60, 20, 'desk');
    en('stamp', 110, GY - 20);
    coins(40, GY - 44, 3);
    en('busta', 220, 140);
    g(270);
    gap(50);
    ow(20, 188, 50, 'shelf');
    ow(90, 152, 50, 'shelf');
    ow(160, 188, 50, 'shelf');
    pk('chip', 108, 132);
    en('timbro', 235, GY, 205, 280);
    g(290);
    en('busta', 60, 160);
    en('busta', 130, 120);
    en('busta', 200, 170);
    blk(100, 28, 36, 'cab');
    coins(40, GY - 22, 3);
    g(250);
    gap(54);
    blk(30, 60, 20, 'desk');
    en('carta', 50, GY - 20, 32, 76);
    en('stamp', 150, GY);
    en('timbro', 225, GY, 190, 265);
    pk('caffe', 120, GY - 50);
    g(280);
    ow(40, 186, 60, 'shelf');
    coins(50, 168, 3);
    en('carta', 150, GY, 100, 220);
    en('busta', 230, 140);
    g(260);
    gap(50);
    blk(40, 28, 36, 'cab');
    en('stamp', 130, GY);
    en('carta', 200, GY, 160, 250);
    coins(150, GY - 22, 4);
    g(270);
  } else if (i == 6) {
    L.th = 1;
    coins(100, GY - 22, 4);
    g(230);
    blk(30, 28, 36, 'cab');
    blk(58, 28, 56, 'cab');
    blk(86, 28, 36, 'cab');
    coins(64, GY - 80, 2);
    en('carta', 190, GY, 140, 250);
    g(280);
    ow(20, 188, 56, 'shelf');
    ow(96, 152, 56, 'shelf');
    ow(172, 116, 56, 'shelf');
    coins(180, 98, 3);
    en('busta', 240, 150);
    g(290);
    gap(48);
    blk(20, 28, 36, 'cab');
    en('timbro', 120, GY, 70, 200);
    en('stamp', 230, GY);
    pk('caffe', 30, GY - 56);
    g(270);
    ow(30, 186, 50, 'shelf');
    ow(110, 150, 50, 'shelf');
    ow(190, 186, 50, 'shelf');
    pk('chip', 120, 130);
    en('busta', 70, 140);
    en('busta', 200, 120);
    g(290);
    gap(52);
    blk(30, 28, 56, 'cab');
    blk(58, 28, 36, 'cab');
    en('carta', 150, GY, 110, 220);
    en('carta', 190, GY, 150, 250);
    coins(36, GY - 78, 2);
    g(270);
    blk(40, 60, 20, 'desk');
    en('stamp', 60, GY - 20);
    en('timbro', 200, GY, 160, 260);
    pk('ferie', 130, GY - 40);
    g(280);
  } else {
    coins(100, GY - 22, 4);
    g(200);
    gap(48);
    blk(30, 40, 22, 'ac');
    en('timbro', 135, GY, 90, 185);
    g(200);
    gap(56);
    ow(10, 190, 44, 'beam');
    en('busta', 70, 150);
    en('busta', 130, 118);
    en('stamp', 160, GY);
    coins(16, 172, 3);
    g(210);
    gap(58);
    blk(20, 40, 22, 'ac');
    blk(60, 34, 44, 'ac');
    pk('chip', 70, GY - 68);
    en('carta', 150, GY, 105, 205);
    en('carta', 185, GY, 105, 205);
    g(230);
    gap(50);
    ow(20, 186, 46, 'beam');
    ow(86, 150, 46, 'beam');
    ow(152, 114, 46, 'beam');
    pk('ferie', 170, 92);
    en('busta', 245, 130);
    en('timbro', 255, GY, 210, 290);
    g(300);
    gap(58);
    en('stamp', 40, GY);
    blk(100, 40, 22, 'ac');
    en('carta', 195, GY, 150, 245);
    en('busta', 225, 138);
    pk('caffe', 114, GY - 46);
    g(260);
    gap(52);
    coins(20, GY - 22, 5);
    pk('chip', 120, GY - 32);
    g(160);
  }
  L.sg = [];
  L.cp = [];
  extraRoute(
    L,
    i,
    () => cx,
    v => (cx = v),
    { g, gap, blk, ow, coins, pk, en },
  );
  L.ax = cx;
  g(480);
  L.len = cx;
  L.mov = L.plats.filter(s => s.mv);
  const A = L.ax,
    k = ['pens', 'shelf', 'chand', 'beam', 'shelf', 'shelf', 'shelf'][i];
  if (i == 0 || i == 5) {
    L.plats.push({ x: A + 50, y: 186, w: 70, h: 6, ow: 1, k }, { x: A + 360, y: 186, w: 70, h: 6, ow: 1, k });
  }
  if (i == 1 || i == 4 || i == 6) {
    L.plats.push({ x: A + 205, y: 182, w: 70, h: 6, ow: 1, k });
  }
  if (i == 2) {
    L.plats.push(
      { x: A + 70, y: 186, w: 80, h: 6, ow: 1, k },
      { x: A + 330, y: 186, w: 80, h: 6, ow: 1, k },
      { x: A + 200, y: 150, w: 80, h: 6, ow: 1, k },
    );
  }
  if (i == 3) {
    L.plats.push(
      { x: A + 40, y: 186, w: 80, h: 6, ow: 1, k },
      { x: A + 200, y: 186, w: 80, h: 6, ow: 1, k },
      { x: A + 360, y: 186, w: 80, h: 6, ow: 1, k },
    );
  }
  for (let x = 90; x < L.len; x += 170) {
    if (
      L.plats.some(p => p.k == 'g' && x > p.x + 12 && x < p.x + p.w - 12) &&
      !L.plats.some(p => p.k != 'g' && !p.ow && x > p.x - 12 && x < p.x + p.w + 12)
    )
      L.dec.push(x);
  }
  return L;
}
export function mkEnemy(o) {
  const d = ET[o.t];
  const e = {
    type: o.t,
    w: d.w,
    h: d.h,
    x: o.x,
    y: o.fy - d.h,
    by: o.fy - d.h,
    hp: d.hp + (d.fly || d.hp == 1 ? 0 : G.lvl >> 1),
    pts: d.pts,
    vx: 0,
    vy: 0,
    t: Math.floor(Math.random() * 60),
    x1: o.x1,
    x2: o.x2,
    face: -1,
    flash: 0,
    act: false,
    dir: 0,
    dx: 0,
    dy: 0,
  };
  if (d.fly) {
    e.y = e.by = o.fy == GY ? (o.t == 'piccione' ? 120 : 150) : o.fy;
  }
  return e;
}
function themed(list, th) {
  const n = {},
    M = EMAP[th] || {};
  return list.map(o => {
    const L = M[o.t];
    if (!L) return o;
    n[o.t] = n[o.t] || 0;
    const t = L[n[o.t]++ % L.length];
    return Object.assign({}, o, { t, fy: ET[t].fly && !ET[o.t].fly ? 118 : o.fy });
  });
}
export function startLevel() {
  if (G.P && G.P.consT) {
    G.P.consT = 0;
    bB.innerHTML = cf(G.P).wepBtn;
  }
  G.LV = build(ORD[G.lvl]);
  G.ens = themed(G.LV.en, ORD[G.lvl]).map(mkEnemy);
  G.pks = G.LV.pk.map(o => ({ type: o.type, x: o.x, y: o.y, t: Math.random() * 60 }));
  if (G.P && G.P.ch == 3) {
    let n = 0;
    for (const k of G.pks) if (k.type == 'caffe' && n++ % 2) k.orzo = 1;
  }
  for (const f of [0.3, 0.68]) {
    let sx = G.LV.ax * f;
    for (let k = 0; k < 12; k++) {
      if (G.LV.plats.some(q => q.k == 'g' && sx > q.x + 10 && sx < q.x + q.w - 10)) break;
      sx += 40;
    }
    G.pks.push({ type: 'snow', x: sx, y: GY - 30, t: 0 });
  }
  G.P.bombs = Math.max(G.P.bombs, 3);
  G.bul = [];
  G.ebul = [];
  G.parts = [];
  G.pops = [];
  G.boss = null;
  G.bossOn = false;
  G.ring = null;
  G.msg = null;
  G.tib = null;
  G.tposts = [];
  G.bombs = [];
  G.snowFx = [];
  G.P.fly = G.P.flyMax;
  G.evt = null;
  G.evtCD = 600 + Math.random() * 500;
  G.consCD = 900 + Math.random() * 900;
  G.bsod = 0;
  G.buzz = null;
  Object.assign(G.P, {
    x: 40,
    y: GY - G.P.h,
    vx: 0,
    vy: 0,
    hp: G.P.maxHp,
    inv: 0,
    dead: 0,
    face: 1,
    combo: 0,
    comboT: 0,
    sx: 40,
    sy: GY - G.P.h,
  });
  G.cam.x = 0;
  G.lvTime = 0;
  G.maxCombo = 0;
  setState('intro');
  Snd.play('stage', STG[G.lvl]);
}
