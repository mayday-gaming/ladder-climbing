/** @file Interstitial scene renderer. */
import { TX, ci, ctx, glass, glow, lgr, ln, pth, rect, rr, tw } from '../../engine/canvas.js';
import { C, GY, H, OL, P2, W } from '../../engine/config.js';
import { touchy } from '../../engine/input.js';
import { E, clamp } from '../../engine/math.js';
import { G } from '../../game/state.js';
import { bubble } from '../characters/allies.js';
import { drawAsd, drawCav, drawHR } from '../characters/npcs.js';
import { V } from '../interp.js';
import { qFrame } from './overlays.js';

export function drawQWorld(q) {
  if (q.id == 'primo') {
    for (const d of q.doors) {
      const sx = d.sh ? Math.sin(d.sh * 1.6) * 1.2 : 0,
        x = d.x + sx,
        y = d.y;
      rr(x - 8, y - 26, 16, 26, 1.2, '#3a4466', OL, 0.8);
      rr(
        x - 6.6,
        y - 24.6,
        13.2,
        24.6,
        0.8,
        d.hr ? lgr(0, y - 24, 0, y, '#ffe95c', '#e0a800') : lgr(0, y - 24, 0, y, '#8a96c0', '#5a6386'),
        OL,
        0.5,
      );
      ci(x + 4, y - 12, 0.9, '#f4f7ff', OL, 0.3);
      rr(x - 9, y - 33, 18, 6, 1, '#ffffff', OL, 0.5);
      const fsz = Math.min(3.2, (15.6 / Math.max(1, tw(d.lbl, 3.2, { b: 1, w: 900 }))) * 3.2);
      TX(d.lbl, x, y - 29.8, fsz, '#1b3fa0', { b: 1, w: 900 });
      if (d.no) {
        ln(x - 6, y - 24, x + 6, y - 2, '#ff3b4a', 1.4);
        ln(x + 6, y - 24, x - 6, y - 2, '#ff3b4a', 1.4);
      }
      if (d.tch > 0 && !d.no) {
        ctx.beginPath();
        ctx.arc(x, y - 38, 3.4, -Math.PI / 2, -Math.PI / 2 + (P2 * d.tch) / 18);
        ctx.strokeStyle = C.yel;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
      if (d.hr && q.t > 600 && q.ph == 1 && !q.found) {
        const bob = Math.abs(Math.sin(V.TT * 0.15)) * 4;
        pth([x - 4, y - 46 - bob, x + 4, y - 46 - bob, x, y - 40 - bob], C.yel, OL, 0.6);
        glow(x, y - 14, 24, C.yel, 0.25);
      }
      if (d.hr && q.found && q.ph == 2) {
        drawHR(x + 14, y, 1.25, -1, true);
        bubble(
          q.found == 2 ? 'Ah, eccola! La cercavo io!' : 'Benvenuto! Si accomodi: colloquio!',
          x,
          y - 58,
          '#ffe6f0',
          60,
        );
      }
    }
  } else if (q.id == 'colloquio') {
    const x = 414;
    rr(x - 26, GY - 16, 40, 16, 1.4, lgr(0, GY - 16, 0, GY, '#8a5a32', '#5a3a20'), OL, 0.7);
    rect(x - 26, GY - 16, 40, 2, '#a8744a');
    rr(x - 22, GY - 20, 10, 4, 0.6, '#ffffff', OL, 0.4);
    TX('HR', x - 17, GY - 17.8, 2.6, '#d81b60', { w: 900 });
    drawHR(x + 2, GY, 1.3, -1, q.ph == 1 && G.frame % 80 < 40);
    if (q.ph == 1 && q.t % 240 < 90)
      bubble(
        ['Si presenti!', 'Interessante…', 'E quindi?', 'Prossima domanda!', 'Mi parli di lei.'][
          ((q.t / 240) | 0) % 5
        ],
        x,
        GY - 62,
        '#ffe6f0',
        Math.min(110, (q.t % 240) + 20),
      );
    rr(x - 14, GY - 60, 30, 6, 1, '#ffffff', OL, 0.4);
    TX('Dott.ssa A. Talenti', x + 1, GY - 57, 2.2, '#9c1046', { b: 1, w: 900 });
  } else if (q.id == 'contratto' && q.cav) {
    // the Contracts Office desk with the contract waiting to be signed
    const x = 48;
    rr(x - 22, GY - 18, 44, 18, 1.4, lgr(0, GY - 18, 0, GY, '#4a4f66', '#2c2f40'), OL, 0.7);
    rect(x - 22, GY - 18, 44, 2, '#6a7090');
    rr(x - 14, GY - 22, 16, 4, 0.6, '#fffaf0', OL, 0.4);
    TX('CONTRATTO', x - 6, GY - 20, 2.2, '#9c1030', { b: 1, w: 900 });
    if (q.won) {
      const k = clamp((q.t - 0) / 30, 0, 1);
      ctx.globalAlpha = k;
      TX('FIRMATO ✓', x - 6, GY - 28 - k * 4, 4.6, '#3cff7a', { w: 700, sk: '#0a1436', sw: 1.4 });
      ctx.globalAlpha = 1;
    }
    rr(x + 4, GY - 28, 16, 10, 1, '#ffffff', OL, 0.4);
    TX('UFFICIO', x + 12, GY - 25.4, 2.2, '#1b3fa0', { b: 1, w: 900 });
    TX('CONTRATTI', x + 12, GY - 21.6, 2.2, '#1b3fa0', { b: 1, w: 900 });
    drawCav(q.cav);
  } else if (q.id == 'asdrubale' && q.asd) drawAsd(q.asd);
}
export function drawQuadro() {
  const q = G.Q;
  if (!q) return;
  qFrame(q);
  if (q.ph == 0) {
    const k = E.back(clamp(q.t / 22, 0, 1));
    ctx.save();
    ctx.translate(W / 2, H / 2 - 10);
    ctx.scale(k, k);
    glass(-160, -54, 320, 108, 12, 0.85);
    rr(-70, -46, 140, 12, 6, lgr(0, -46, 0, -34, '#ff6a7a', '#d0102a'), OL, 0.6);
    TX(
      {
        primo: 'LIVELLO SPECIALE · PRIMO GIORNO',
        colloquio: 'LIVELLO SPECIALE · COLLOQUIO',
        asdrubale: 'LIVELLO SPECIALE · IL MANAGER',
        contratto: 'LIVELLO SPECIALE · BOSS DEL CONTRATTO',
      }[q.id] || 'LIVELLO SPECIALE · SOPRAVVIVENZA',
      0,
      -39.6,
      5.2,
      '#ffffff',
      { b: 1, w: 900 },
    );
    TX(q.name, 0, -16, 15, '#ffe95c', { w: 700, sk: '#0a1436', sw: 2.6 });
    TX(q.sub, 0, 4, 6.6, '#e6ecff', { b: 1, w: 800 });
    TX(
      {
        colloquio: 'Resisti 20 secondi · poi ti aspetta il contratto',
        primo: 'Fermati davanti alle porte: una è quella giusta',
        asdrubale: 'Si lamenta, piange, poi carica: colpiscilo mentre piange!',
        contratto: 'Schiva clausole e timbri · saltagli in testa quando è stordito!',
      }[q.id] || 'Resisti 25 secondi · ogni colpo ti costa bonus',
      0,
      18,
      5.4,
      '#9fb4ff',
      { b: 1, w: 800 },
    );
    const act = ['primo', 'colloquio', 'contratto'].indexOf(q.id);
    if (act >= 0)
      for (let i = 0; i < 3; i++) {
        const on = i == act,
          done = i < act,
          ax = -62 + i * 62;
        if (i) rect(ax - 50, 29.4, 38, 1.2, done || on ? '#ffd500' : 'rgba(255,255,255,.2)');
        rr(ax - 12, 25, 24, 10, 5, on ? '#ffd500' : done ? '#3cc46a' : 'rgba(255,255,255,.12)', OL, 0.4);
        TX(i == 2 ? 'BOSS' : 'ATTO ' + (i + 1), ax, 30.2, 3.6, on ? '#3a1a00' : '#ffffff', { b: 1, w: 900 });
      }
    const n = 3 - Math.floor(q.t / 40);
    if (n > 0) {
      const s = 1 + ((q.t % 40) / 40) * 0.5;
      ctx.save();
      ctx.translate(0, act >= 0 ? 46 : 40);
      ctx.scale(s, s);
      ctx.globalAlpha = 1 - (q.t % 40) / 40;
      TX('' + n, 0, 0, 16, '#ffffff', { w: 700, sk: '#0a1436', sw: 3 });
      ctx.restore();
    } else TX('VIA!', 0, act >= 0 ? 46 : 40, 14, '#3cff7a', { w: 700, sk: '#0a1436', sw: 3 });
    ctx.restore();
    ctx.globalAlpha = 1;
  } else if (q.ph == 1) {
    const rem = Math.max(0, q.dur - q.t),
      sec = Math.ceil(rem / 60),
      k = rem / q.dur,
      x = W / 2,
      y = 62,
      warn = sec <= 5;
    ci(x, y, 13, 'rgba(3,8,34,.8)', 'rgba(255,255,255,.25)', 0.8);
    ctx.beginPath();
    ctx.arc(x, y, 11, -Math.PI / 2, -Math.PI / 2 + P2 * k);
    ctx.strokeStyle = warn ? '#ff4d5e' : '#3cff7a';
    ctx.lineWidth = 2.6;
    ctx.lineCap = 'round';
    ctx.stroke();
    const s = warn ? 1 + 0.15 * Math.abs(Math.sin(V.TT * 0.2)) : 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    TX('' + sec, 0, 0.6, 10, warn ? '#ff8090' : '#ffffff', { w: 700 });
    ctx.restore();
    if (q.asd || q.cav) {
      const a = q.asd || q.cav,
        k2 = clamp(a.hp / a.max, 0, 1),
        bw = 150;
      TX(
        q.cav ? 'DOTT. CAVILLO · Ufficio Contratti' : 'ASDRUBALE · 32 anni di servizio',
        W / 2,
        y + 40,
        5,
        '#ffffff',
        {
          b: 1,
          w: 900,
          sk: '#0a1436',
          sw: 1.4,
        },
      );
      rr(W / 2 - bw / 2 - 1, y + 44, bw + 2, 7, 3.5, 'rgba(3,8,34,.85)', 'rgba(255,255,255,.25)', 0.6);
      rr(
        W / 2 - bw / 2,
        y + 45,
        bw * k2,
        5,
        2.5,
        a.st == 'piange' || a.st == 'stordito'
          ? lgr(0, 0, 0, 5, '#fff6a0', '#ffc400')
          : lgr(0, 0, 0, 5, '#ff6a7a', '#d0102a'),
      );
    }
    if (q.id == 'primo')
      TX('Cerca la porta delle RISORSE UMANE', x, y + 38, 5.4, '#ffffff', {
        b: 1,
        w: 900,
        sk: '#0a1436',
        sw: 1.6,
      });
    TX(q.name, x, y + 20, 6, '#ffe95c', { w: 700, sk: '#0a1436', sw: 1.6 });
    TX('colpi presi: ' + q.hits, x, y + 29, 5, q.hits ? '#ffb0b8' : '#b9c8f0', { b: 1, w: 900 });
  } else {
    const k = E.back(clamp(q.t / 20, 0, 1)),
      ok = q.hits < 5;
    ctx.save();
    ctx.translate(W / 2, H / 2 - 6);
    ctx.scale(k, k);
    glass(-140, -48, 280, 96, 12, 0.85);
    TX(
      q.id == 'colloquio'
        ? q.hits == 0
          ? 'COLLOQUIO PERFETTO!'
          : 'COLLOQUIO SUPERATO!'
        : q.id == 'primo'
          ? q.found == 1
            ? 'HR TROVATA!'
            : "TROVATO DALL'HR!"
          : q.id == 'contratto'
            ? q.cav.hp <= 0
              ? 'CONTRATTO FIRMATO!'
              : 'FIRMATO… CON RISERVA'
            : q.id == 'asdrubale'
              ? q.asd.hp <= 0
                ? 'ASDRUBALE IN PENSIONE!'
                : 'ASDRUBALE SI È STANCATO'
              : q.hits == 0
                ? 'IMPECCABILE!'
                : ok
                  ? 'SOPRAVVISSUTO!'
                  : 'TRAVOLTO...',
      0,
      -24,
      q.id == 'colloquio' || q.id == 'asdrubale' || q.id == 'contratto' ? 14 : 18,
      ok ? lgr(0, -34, 0, -14, '#fff6a0', '#ffc400') : '#ff8090',
      { w: 700, sk: '#0a1436', sw: 3 },
    );
    TX(
      {
        colloquio: "Ti prendono! Ora tocca firmare all'Ufficio Contratti…",
        contratto:
          q.cav && q.cav.hp <= 0
            ? '«Benvenuto in Big Company. Stagista, ovviamente.»'
            : '«Firmi pure. Ma a matita.» · Badge giallo da stagista',
        primo: 'La Dott.ssa Assunta Talenti ti aspetta per il colloquio',
        asdrubale:
          q.asd && q.asd.hp <= 0
            ? '«Ai miei tempi la pensione arrivava prima!»'
            : '«Torno a lamentarmi in ufficio.»',
      }[q.id] || q.name,
      0,
      -4,
      6.4,
      '#9fb4ff',
      { b: 1, w: 900 },
    );
    TX('Colpi presi: ' + q.hits + '   ·   Bonus sopravvivenza: ' + q.bonus, 0, 10, 6.6, '#ffffff', {
      b: 1,
      w: 800,
    });
    if ((q.t >> 4) % 2 && q.t > 40)
      TX(touchy() ? 'TOCCA PER CONTINUARE' : 'PREMI INVIO PER CONTINUARE', 0, 30, 6, '#9ff6ff', {
        b: 1,
        w: 900,
      });
    ctx.restore();
  }
}
