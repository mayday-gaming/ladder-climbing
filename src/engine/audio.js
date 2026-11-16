/** @file WebAudio synth: chiptune sequencer and sound effects (Snd). */
export const Snd = (() => {
  let ac = null,
    master,
    mg,
    sg,
    nbuf,
    muted = false,
    song = null,
    nextT = 0,
    step = 0;
  const NN = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  function nf(s, tr) {
    const m = /^([A-G])([#b]?)(\d)$/.exec(s);
    if (!m) return 0;
    const n = NN[m[1]] + (m[2] == '#' ? 1 : m[2] == 'b' ? -1 : 0) + 12 * (+m[3] + 1) + (tr || 0);
    return 440 * Math.pow(2, (n - 69) / 12);
  }
  function parse(str) {
    const tk = str.replace(/\|/g, ' ').trim().split(/\s+/),
      out = [];
    let last = null;
    for (const t of tk) {
      if (t == '-') {
        if (last) last.len++;
        out.push(null);
      } else if (t == '.') {
        out.push(null);
        last = null;
      } else {
        last = { n: t, len: 1 };
        out.push(last);
      }
    }
    return out;
  }
  const S = {
    title: {
      bpm: 112,
      lead: 'C5 . E5 G5 C6 - - . | A5 . F5 A5 G5 - - . | E5 . G5 E5 D5 . F5 D5 | C5 . G4 . C5 - . .',
      bass: 'C3 . G3 . C3 . G3 . | F2 . C3 . C3 . G3 . | C3 . G3 . G2 . D3 . | C3 . G2 . C3 - . .',
      dr: 'k.h.s.h.',
    },
    stage: {
      bpm: 132,
      lead: 'E5 . G5 . C6 . G5 . | E5 G5 E5 C5 D5 - . . | F5 . A5 . D6 . A5 . | G5 F5 E5 D5 C5 - . . | C5 E5 G5 E5 A5 - G5 . | F5 A5 C6 A5 G5 - E5 . | D5 F5 A5 F5 B5 - A5 . | G5 . B5 . C6 - . .',
      bass: 'C3 G3 C3 G3 C3 G3 C3 G3 | C3 G3 C3 G3 G2 D3 G2 D3 | F2 C3 F2 C3 D3 A3 D3 A3 | G2 D3 G2 D3 C3 G3 C3 . | C3 G3 C3 G3 F2 C3 F2 C3 | F2 C3 F2 C3 C3 G3 C3 G3 | D3 A3 D3 A3 G2 D3 G2 D3 | G2 D3 G2 D3 C3 G3 C3 .',
      dr: 'k.h.s.h.k.h.s.hh',
    },
    boss0: {
      bpm: 126,
      lead: 'A4 . C5 . E5 . Eb5 E5 | . C5 A4 . G#4 - . . | B4 . D5 . F5 . E5 F5 | . D5 B4 . A4 - . . | E5 - D5 C5 B4 - A4 G#4 | A4 . C5 . E5 - . . | F5 - E5 D5 C5 - B4 A4 | G#4 . B4 . A4 - . .',
      bass: 'A2 . . E3 A2 . E3 . | A2 . . E3 E2 . B2 . | E2 . . B2 E2 . B2 . | E2 . . B2 A2 . E3 . | A2 . . E3 E2 . B2 . | A2 . . E3 A2 . E3 . | D3 . . A3 A2 . E3 . | E2 . . B2 A2 . A2 .',
      dr: 'k..sk.s.',
      vib: 1,
    },
    boss1: {
      bpm: 102,
      lt: 'sawtooth',
      bt: 'sawtooth',
      lead: 'F4 . F4 . A4 . C5 . | D5 - C5 . A4 - . . | Bb4 . Bb4 . D5 . F5 . | E5 - C5 . F4 - . . | C5 . C5 D5 C5 . A4 . | Bb4 . Bb4 C5 Bb4 . G4 . | A4 . F4 . G4 . E4 . | F4 . C4 . F4 - . .',
      bass: 'F2 . C3 . F2 . C3 . | F2 . C3 . F2 . C3 . | Bb2 . F3 . Bb2 . F3 . | C3 . G3 . F2 . C3 . | F2 . C3 . F2 . C3 . | Bb2 . F3 . C3 . G3 . | F2 . C3 . C3 . G3 . | F2 . C3 . F2 . . .',
      dr: 'K...s...K.K.s...',
      fat: 1,
    },
    boss6: {
      bpm: 86,
      lt: 'sawtooth',
      bt: 'sawtooth',
      lead: 'F4 . F4 . A4 . C5 . | D5 - C5 . A4 - . . | Bb4 . Bb4 . D5 . F5 . | E5 - C5 . F4 - . . | C5 . C5 D5 C5 . A4 . | Bb4 . Bb4 C5 Bb4 . G4 . | A4 . F4 . G4 . E4 . | F4 . C4 . F4 - . .',
      bass: 'F2 . C3 . F2 . C3 . | F2 . C3 . F2 . C3 . | Bb2 . F3 . Bb2 . F3 . | C3 . G3 . F2 . C3 . | F2 . C3 . F2 . C3 . | Bb2 . F3 . C3 . G3 . | F2 . C3 . C3 . G3 . | F2 . C3 . F2 . . .',
      dr: 'K...s...K.K.s...',
      fat: 1,
    },
    boss2: {
      bpm: 152,
      lt: 'sawtooth',
      pluck: 1,
      lead: 'D5 F5 A5 D6 A5 F5 | E5 G5 Bb5 E6 Bb5 G5 | F5 A5 D6 F6 D6 A5 | E5 A5 C#6 E6 C#6 A5 | D6 C6 Bb5 A5 G5 F5 | E5 G5 Bb5 A5 G5 E5 | F5 E5 D5 C#5 E5 A5 | D5 - A4 - D5 .',
      bass: 'D3 - - A3 - - | G3 - - G3 - - | D3 - - F3 - - | A2 - - A3 - - | Bb2 - - A2 - - | G2 - - A2 - - | D3 - - A2 - - | D3 - A2 - D2 .',
      dr: 'k.h.h.',
    },
    boss3: {
      bpm: 178,
      lead: 'G5 F#5 G5 A5 B5 . D6 . | C6 B5 C6 D6 E6 . C6 . | B5 A#5 B5 C6 D6 . B5 . | A5 G#5 A5 B5 A5 - . . | G5 F#5 G5 A5 B5 . D6 . | E6 D6 C6 B5 A5 . F#5 . | G5 B5 D6 G6 F#6 D6 A5 F#5 | G5 . G6 . G5 - . .',
      bass: 'G2 D3 G2 D3 G2 D3 G2 D3 | C3 G3 C3 G3 C3 G3 C3 G3 | G2 D3 G2 D3 G2 D3 G2 D3 | D3 A3 D3 A3 D3 A3 D3 A3 | G2 D3 G2 D3 G2 D3 G2 D3 | C3 G3 C3 G3 D3 A3 D3 A3 | G2 D3 G2 D3 D3 A3 D3 A3 | G2 D3 G3 D3 G2 . . .',
      dr: 'k.s.k.s.k.s.kss.',
      vib: 1,
    },
    boss4: {
      bpm: 96,
      lt: 'triangle',
      lv: 0.22,
      lead: 'A4 - - C5 E5 - - . | D5 - - C5 A4 - - . | G4 - - Bb4 D5 - - . | C5 - - A4 F4 - - . | A4 - C5 - E5 - G5 - | F5 - - D5 Bb4 - - . | G4 - Bb4 - A4 - G4 - | F4 - - - . . . .',
      bass: 'F2 . . C3 . . F3 . | D3 . . A2 . . D3 . | G2 . . D3 . . G3 . | C3 . . G2 . . C3 . | F2 . . C3 . . F3 . | Bb2 . . F3 . . Bb2 . | G2 . . C3 . . C3 . | F2 . . C3 F2 . . .',
      dr: 'k.hh.hk.',
    },
    boss5: {
      bpm: 164,
      lead: 'E5 E5 . E5 G5 . E5 . | B5 - A5 G5 F#5 - . . | E5 E5 . E5 G5 . B5 . | C6 - B5 A5 B5 - . . | A5 A5 . A5 C6 . A5 . | G5 G5 . G5 B5 . G5 . | F#5 A5 F#5 D#5 B4 D#5 F#5 A5 | G5 . B5 . E5 - . .',
      bass: 'E2 . E3 . E2 . E3 . | E2 . E3 . B2 . B3 . | E2 . E3 . E2 . E3 . | C3 . C4 . B2 . B3 . | A2 . A3 . A2 . A3 . | G2 . G3 . G2 . G3 . | B2 . B3 . B2 . B3 . | E2 . E3 . E2 . . .',
      dr: 'k.hsk.hs',
    },
    disco: {
      bpm: 124,
      bt: 'sawtooth',
      lead: 'C5 . C5 Eb5 . F5 G5 . | Bb5 . G5 . F5 Eb5 F5 . | C5 . C5 Eb5 . F5 G5 . | Eb6 - C6 . Bb5 G5 Bb5 . | Ab5 . Ab5 . G5 . F5 . | G5 . G5 . F5 . Eb5 . | F5 . Eb5 . D5 . Eb5 F5 | G5 - - . C5 - . .',
      bass: 'C3 C4 C3 C4 C3 C4 C3 C4 | Eb3 Eb4 Eb3 Eb4 F3 F4 F3 F4 | C3 C4 C3 C4 C3 C4 C3 C4 | Bb2 Bb3 Bb2 Bb3 G2 G3 G2 G3 | Ab2 Ab3 Ab2 Ab3 Ab2 Ab3 Ab2 Ab3 | Eb3 Eb4 Eb3 Eb4 Eb3 Eb4 Eb3 Eb4 | Bb2 Bb3 Bb2 Bb3 Bb2 Bb3 Bb2 Bb3 | C3 C4 C3 C4 G2 G3 G2 G3',
      dr: 'khKhkhKh',
    },
  };
  for (const k in S) {
    S[k].L = parse(S[k].lead);
    S[k].B = parse(S[k].bass);
  }
  let sil = null;
  function unlock() {
    try {
      if (navigator.audioSession) navigator.audioSession.type = 'playback';
    } catch (e) {}
    try {
      if (!sil) {
        sil = new Audio(
          'data:audio/wav;base64,UklGRsEIAABXQVZFZm10IBAAAAABAAEAIlYAACJWAAABAAgAZGF0YZ0IAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIA=',
        );
        sil.loop = true;
        sil.volume = 0.01;
        sil.setAttribute('playsinline', '');
      }
      if (sil.paused) {
        const pr = sil.play();
        if (pr && pr.catch) pr.catch(() => {});
      }
    } catch (e) {}
    if (ac) {
      if (ac.state != 'running') {
        try {
          const pr = ac.resume();
          if (pr && pr.catch) pr.catch(() => {});
        } catch (e) {}
      }
      try {
        const b = ac.createBufferSource();
        b.buffer = ac.createBuffer(1, 1, 22050);
        b.connect(ac.destination);
        b.start(0);
      } catch (e) {}
    }
  }
  function init() {
    if (ac) {
      unlock();
      return;
    }
    try {
      ac = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      ac = null;
      return;
    }
    ac.onstatechange = () => {
      if (ac.state == 'running') nextT = ac.currentTime + 0.06;
    };
    master = ac.createGain();
    master.gain.value = muted ? 0 : 1;
    master.connect(ac.destination);
    mg = ac.createGain();
    mg.gain.value = 0.55;
    mg.connect(master);
    sg = ac.createGain();
    sg.gain.value = 0.8;
    sg.connect(master);
    nbuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const d = nbuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    setInterval(tick, 25);
    unlock();
  }
  function osc(type, f, t, d, v, dest, f2, bl) {
    if (!f) return;
    const o = ac.createOscillator(),
      g = ac.createGain();
    o.type = type;
    if (bl) {
      o.frequency.setValueAtTime(f * 0.93, t);
      o.frequency.exponentialRampToValueAtTime(f, t + 0.03);
    } else o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(v, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g);
    g.connect(dest);
    o.start(t);
    o.stop(t + d + 0.03);
    return o;
  }
  function noi(t, d, v, dest, hp) {
    const s = ac.createBufferSource();
    s.buffer = nbuf;
    const g = ac.createGain();
    g.gain.setValueAtTime(v, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    let n = s;
    if (hp) {
      const f = ac.createBiquadFilter();
      f.type = 'highpass';
      f.frequency.value = hp;
      s.connect(f);
      n = f;
    }
    n.connect(g);
    g.connect(dest);
    s.start(t, Math.random() * 0.5);
    s.stop(t + d + 0.03);
  }
  function tick() {
    if (!ac || !song || ac.state != 'running') return;
    if (nextT < ac.currentTime - 0.3) nextT = ac.currentTime + 0.05;
    while (nextT < ac.currentTime + 0.16) {
      const sd = 60 / song.bpm / 2,
        tr = song.tr || 0,
        t = nextT;
      const l = song.L[step % song.L.length];
      if (l) {
        const f = nf(l.n, tr),
          d = song.pluck ? Math.max(0.16, l.len * sd * 0.9) : l.len * sd * (l.len > 1 ? 0.9 : 0.72);
        const o = osc(song.lt || 'square', f, t, d, song.lv || (song.pluck ? 0.11 : 0.1), mg, 0, !song.pluck);
        if (song.vib && o && l.len > 1) {
          const lf = ac.createOscillator(),
            lg = ac.createGain();
          lf.frequency.value = 7;
          lg.gain.value = f * 0.02;
          lf.connect(lg);
          lg.connect(o.frequency);
          lf.start(t);
          lf.stop(t + d);
        }
        if (song.fat) osc('square', f * 0.5, t, d, 0.06, mg);
        if (song.pluck) osc('square', f * 2, t, 0.06, 0.03, mg);
      }
      const b = song.B[step % song.B.length];
      if (b) osc(song.bt || 'square', nf(b.n, tr), t, b.len * sd * 0.8, song.bt ? 0.1 : 0.07, mg);
      const dc = song.dr[step % song.dr.length];
      if (dc == 'k') osc('sine', 160, t, 0.12, 0.5, mg, 45);
      else if (dc == 'K') {
        osc('sine', 130, t, 0.2, 0.7, mg, 35);
        noi(t, 0.05, 0.15, mg);
      } else if (dc == 's') noi(t, 0.1, 0.22, mg, 1400);
      else if (dc == 'h') noi(t, 0.03, 0.09, mg, 6000);
      nextT += sd;
      step++;
    }
  }
  function play(name, o) {
    const id = name + ((o && o.tr) || 0);
    if (song && song.id == id) return;
    song = Object.assign({}, S[name], o || {}, { id });
    step = 0;
    if (ac) nextT = ac.currentTime + 0.08;
  }
  function stop() {
    song = null;
  }
  const J = {
    win: [
      ['C5', 0.1],
      ['E5', 0.1],
      ['G5', 0.1],
      ['C6', 0.2],
      ['G5', 0.1],
      ['C6', 0.5],
    ],
    promo: [
      ['G4', 0.12],
      ['C5', 0.12],
      ['E5', 0.12],
      ['G5', 0.24],
      ['E5', 0.12],
      ['G5', 0.6],
    ],
    over: [
      ['E4', 0.25],
      ['Eb4', 0.25],
      ['D4', 0.25],
      ['Db4', 0.25],
      ['C4', 0.8],
    ],
    ally: [
      ['C5', 0.09],
      ['E5', 0.09],
      ['G5', 0.09],
      ['C6', 0.14],
      ['G5', 0.09],
      ['C6', 0.09],
      ['E6', 0.42],
    ],
    flop: [
      ['Bb3', 0.36],
      ['A3', 0.36],
      ['Ab3', 0.36],
      ['G3', 0.85],
    ],
  };
  function jingle(n) {
    if (!ac) return;
    let t = ac.currentTime + 0.03;
    const sad = n == 'over' || n == 'flop';
    for (const [a, d] of J[n]) {
      osc(
        sad ? 'sawtooth' : 'square',
        nf(a),
        t,
        d * 0.95,
        n == 'flop' ? 0.18 : 0.14,
        sg,
        sad ? nf(a) * (n == 'flop' ? 0.84 : 0.9) : 0,
      );
      t += d;
    }
    nextT = Math.max(nextT, t + 0.2);
  }
  function sfx(n) {
    if (!ac || ac.state != 'running') return;
    const t = ac.currentTime;
    switch (n) {
      case 'shoot':
        osc('square', 900, t, 0.07, 0.09, sg, 340);
        break;
      case 'shoot2':
        osc('square', 1100, t, 0.08, 0.09, sg, 300);
        osc('sawtooth', 550, t, 0.06, 0.05, sg, 200);
        break;
      case 'jump':
        osc('square', 260, t, 0.12, 0.1, sg, 620);
        break;
      case 'djump':
        osc('square', 420, t, 0.12, 0.1, sg, 980);
        break;
      case 'coin':
        osc('square', 988, t, 0.06, 0.1, sg);
        osc('square', 1319, t + 0.06, 0.12, 0.1, sg);
        break;
      case 'hit':
        noi(t, 0.04, 0.15, sg, 2500);
        osc('square', 220, t, 0.05, 0.08, sg, 120);
        break;
      case 'kill':
        noi(t, 0.14, 0.28, sg, 500);
        osc('square', 520, t, 0.16, 0.12, sg, 80);
        break;
      case 'hurt':
        osc('sawtooth', 420, t, 0.3, 0.2, sg, 80);
        noi(t, 0.1, 0.2, sg);
        break;
      case 'power':
        [523, 659, 784, 1047, 1319].forEach((f, i) => osc('square', f, t + i * 0.06, 0.1, 0.12, sg));
        break;
      case 'bhit':
        osc('square', 170, t, 0.06, 0.12, sg, 90);
        noi(t, 0.03, 0.1, sg, 3000);
        break;
      case 'boom':
        noi(t, 0.7, 0.5, sg);
        osc('sine', 130, t, 0.7, 0.5, sg, 28);
        break;
      case 'full':
        osc('square', 660, t, 0.09, 0.12, sg, 990);
        osc('square', 990, t + 0.09, 0.09, 0.12, sg, 1320);
        osc('square', 1320, t + 0.18, 0.22, 0.12, sg, 1760);
        break;
      case 'special':
        osc('sawtooth', 180, t, 0.55, 0.22, sg, 1800);
        noi(t, 0.5, 0.25, sg, 800);
        break;
      case 'stomp':
        osc('sine', 95, t, 0.25, 0.5, sg, 32);
        noi(t, 0.12, 0.25, sg);
        break;
      case 'laser':
        osc('sawtooth', 1500, t, 0.6, 0.14, sg, 160);
        osc('square', 750, t, 0.6, 0.07, sg, 80);
        break;
      case 'charge':
        osc('square', 200, t, 0.7, 0.1, sg, 1200);
        break;
      case 'blip':
        osc('square', 700, t, 0.05, 0.1, sg);
        break;
      case 'tele':
        osc('sine', 1300, t, 0.22, 0.14, sg, 260);
        break;
      case 'throw':
        osc('square', 500, t, 0.08, 0.07, sg, 750);
        break;
      case 'boing':
        osc('sine', 180, t, 0.22, 0.25, sg, 520);
        break;
      case 'tick':
        osc('square', 1250, t, 0.02, 0.06, sg);
        break;
      case 'kit':
        osc('square', 520, t, 0.05, 0.08, sg, 700);
        osc('square', 760, t + 0.05, 0.06, 0.08, sg, 560);
        break;
      case 'piii':
        osc('sine', 1700, t, 0.14, 0.16, sg, 2600);
        osc('square', 2200, t + 0.02, 0.08, 0.03, sg, 2900);
        break;
      case 'merge':
        osc('triangle', 660, t, 0.06, 0.1, sg, 990);
        osc('triangle', 990, t + 0.06, 0.08, 0.08, sg);
        break;
      case 'beep':
        osc('sine', 1000, t, 0.16, 0.16, sg);
        break;
      case 'zap':
        osc('sawtooth', 1600, t, 0.09, 0.08, sg, 240);
        noi(t, 0.05, 0.07, sg, 5000);
        noi(t + 0.03, 0.28, 0.16, sg, 60);
        osc('sine', 70, t, 0.3, 0.18, sg, 38);
        break;
      case 'pi':
        osc('triangle', 1320, t, 0.05, 0.13, sg, 1760);
        osc('triangle', 1760, t + 0.05, 0.06, 0.11, sg, 2640);
        break;
      case 'beep2':
        osc('square', 880, t, 0.04, 0.06, sg);
        osc('square', 440, t + 0.05, 0.05, 0.06, sg);
        break;
      case 'swap':
        [660, 990, 1320].forEach((f, i) => osc('triangle', f, t + i * 0.04, 0.06, 0.12, sg));
        break;
      case 'siren':
        osc('square', 620, t, 0.24, 0.07, sg, 900);
        osc('square', 900, t + 0.25, 0.24, 0.07, sg, 620);
        break;
      case 'evt':
        [392, 523, 659, 784, 1047].forEach((f, i) => osc('square', f, t + i * 0.05, 0.08, 0.1, sg));
        noi(t, 0.2, 0.12, sg, 3000);
        break;
      case 'panic':
        noi(t, 0.45, 0.3, sg, 150);
        osc('square', 110, t, 0.45, 0.2, sg, 45);
        break;
      case 'buzz':
        [784, 1047, 1319].forEach((f, i) => osc('square', f, t + i * 0.05, 0.08, 0.09, sg));
        break;
      case '1up':
        [784, 988, 1175, 1568].forEach((f, i) => osc('square', f, t + i * 0.08, 0.12, 0.12, sg));
        break;
    }
  }
  return {
    init,
    play,
    stop,
    sfx,
    jingle,
    toggle() {
      muted = !muted;
      if (master) master.gain.value = muted ? 0 : 1;
      return muted;
    },
    get muted() {
      return muted;
    },
  };
})();
