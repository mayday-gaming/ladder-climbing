/**
 * Scripted playthrough shared by the headless integration test and the
 * Playwright e2e test. It only talks to the game through window.__g, so the
 * same function body runs in Node and inside a real browser page.
 *
 * Returns a JSON-serialisable report; never throws on gameplay outcomes.
 */
export function playthrough(g, hero) {
  const report = { hero, pre: [], levels: [], nan: null, end: null };
  const bad = o => o && (!Number.isFinite(o.x) || !Number.isFinite(o.y));
  const u = g.update;
  let n = 0;
  const update = () => {
    u();
    if (report.nan || ++n % 15) return;
    const s = g.s;
    if (bad(s.P)) report.nan = 'player in ' + s.state;
    for (const e of s.ens) if (bad(e)) report.nan = 'enemy ' + e.type;
    if (s.boss && bad(s.boss)) report.nan = 'boss ' + s.boss.i;
    for (const b of s.ebul) if (bad(b)) report.nan = 'enemy bullet ' + b.kind;
    for (const b of s.bul) if (bad(b)) report.nan = 'bullet ' + b.k;
  };
  const k = g.inp.key;
  const clearQuadro = st => {
    while (g.s.state === 'quadro') {
      st.push(g.s.Q.id);
      for (let i = 0; i < 3300 && g.s.Q.ph !== 2; i++) {
        k.r = i % 160 < 80 ? 1 : 0;
        k.l = k.r ? 0 : 1;
        k.f = 1;
        if (i % 37 === 0) g.inp.jump();
        update();
        if (i % 300 === 0) g.draw();
      }
      k.r = k.l = k.f = 0;
      for (let i = 0; i < 12000 && g.s.state === 'quadro'; i++) {
        if (i % 20 === 0) g.inp.tap();
        update();
      }
      st.push(g.s.state);
    }
  };

  g.pick(hero);
  g.inp.tap();
  update();
  report.howto = g.s.state === 'howto';
  for (let i = 0; i < 40 && g.s.state === 'howto'; i++) update();
  g.inp.tap();
  update();
  report.pre.push(g.s.state);
  clearQuadro(report.pre);

  for (let lv = 0; lv < 7; lv++) {
    const st = { level: g.s.lvl, reachedBoss: false, states: [] };
    for (let i = 0; i < 200; i++) (g.inp.tap(), update());
    k.r = k.f = 1;
    for (let i = 0; i < 2500 && !g.s.bossOn; i++) {
      if (i % 29 === 0) g.inp.jump();
      k.j = i % 29 < 12 ? 1 : 0;
      if (i % 500 === 0) g.inp.bomb();
      g.set({ hp: 9 });
      update();
      if (i % 250 === 0) g.draw();
    }
    st.reachedBoss = g.s.bossOn;
    if (!g.s.bossOn) {
      g.warp();
      for (let i = 0; i < 80 && !g.s.bossOn; i++) update();
    }
    for (let i = 0; i < 4000; i++) {
      k.r = i % 200 < 100 ? 1 : 0;
      k.l = k.r ? 0 : 1;
      if (i % 41 === 0) g.inp.jump();
      g.set({ hp: 9 });
      update();
      if (i % 400 === 0) g.draw();
      if (g.s.state === 'bosswin' || g.s.state === 'tally') break;
    }
    k.r = k.l = k.f = k.j = 0;
    if (g.s.state === 'play' || g.s.state === 'bossintro') {
      for (let i = 0; i < 200; i++) update();
      g.killBoss();
    }
    for (let i = 0; i < 400; i++) update();
    g.draw();
    st.states.push(g.s.state);
    g.inp.tap();
    for (let i = 0; i < 6; i++) update();
    st.states.push(g.s.state);
    clearQuadro(st.states);
    report.levels.push(st);
  }
  report.end = { state: g.s.state, score: g.s.score };
  return report;
}
