/**
 * Minimal browser environment for running the game headless under Node.
 *
 * The fake 2D context accepts every call, but mirrors Chrome's strictness
 * where it would throw (non-finite gradient coords, negative arc radius) so
 * numeric bugs surface as test failures instead of silent blank frames.
 */
const listeners = new Map();
const on = (target, type, fn) => {
  const k = target + ':' + type;
  if (!listeners.has(k)) listeners.set(k, []);
  listeners.get(k).push(fn);
};

export const stats = { calls: 0, errors: [] };

function fail(msg) {
  const e = new TypeError(msg);
  stats.errors.push(msg);
  throw e;
}

function fakeContext() {
  const gradient = { addColorStop() {} };
  const state = { font: '10px sans-serif', fillStyle: '#000', strokeStyle: '#000', globalAlpha: 1 };
  const methods = {
    createLinearGradient(...a) {
      if (!a.every(Number.isFinite)) fail('createLinearGradient: non-finite ' + a);
      return gradient;
    },
    createRadialGradient(...a) {
      if (!a.every(Number.isFinite)) fail('createRadialGradient: non-finite ' + a);
      if (a[2] < 0 || a[5] < 0) fail('createRadialGradient: negative radius');
      return gradient;
    },
    arc(x, y, r) {
      if (r < 0) fail('arc: negative radius ' + r);
    },
    ellipse(x, y, rx, ry) {
      if (rx < 0 || ry < 0) fail('ellipse: negative radius ' + rx + ',' + ry);
    },
    measureText(t) {
      return { width: String(t).length * 6 };
    },
    getImageData(x, y, w, h) {
      return { data: new Uint8ClampedArray(Math.max(0, w * h * 4)) };
    },
    setLineDash() {},
    getLineDash: () => [],
    getTransform: () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }),
  };
  return new Proxy(state, {
    get(t, k) {
      if (k in methods) return (...a) => (stats.calls++, methods[k](...a));
      if (k in t) return t[k];
      return () => {
        stats.calls++;
      };
    },
    set(t, k, v) {
      t[k] = v;
      return true;
    },
  });
}

function fakeElement(tag = 'div') {
  const classes = new Set();
  const el = {
    tagName: tag.toUpperCase(),
    width: 300,
    height: 150,
    style: {},
    className: '',
    innerHTML: '',
    textContent: '',
    children: [],
    classList: {
      add: c => classes.add(c),
      remove: c => classes.delete(c),
      toggle: (c, f) => ((f ?? !classes.has(c)) ? classes.add(c) : classes.delete(c)),
      contains: c => classes.has(c),
    },
    addEventListener: (t, fn) => on(tag + '#el', t, fn),
    removeEventListener() {},
    setPointerCapture() {},
    releasePointerCapture() {},
    focus() {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 960, height: 540, right: 960, bottom: 540 }),
    getContext: () => fakeContext(),
  };
  el.children = [{ className: '' }, { className: '' }];
  return el;
}

export function installBrowserStub() {
  const els = new Map();
  const store = new Map();
  const doc = {
    hidden: false,
    body: fakeElement('body'),
    getElementById: id => (
      els.has(id) || els.set(id, fakeElement(id === 'c' ? 'canvas' : 'div')),
      els.get(id)
    ),
    createElement: tag => fakeElement(tag),
    addEventListener: (t, fn) => on('document', t, fn),
    fonts: { load: () => Promise.resolve([]), ready: Promise.resolve() },
  };
  Object.assign(globalThis, {
    document: doc,
    window: globalThis,
    devicePixelRatio: 1,
    innerWidth: 960,
    innerHeight: 540,
    addEventListener: (t, fn) => on('window', t, fn),
    removeEventListener() {},
    requestAnimationFrame: () => 0,
    cancelAnimationFrame() {},
    localStorage: {
      getItem: k => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, String(v)),
      removeItem: k => store.delete(k),
    },
  });
  if (!('navigator' in globalThis) || !globalThis.navigator) globalThis.navigator = { maxTouchPoints: 0 };
}

/** Dispatch a synthetic keyboard event to window listeners. */
export function press(key, type = 'keydown') {
  for (const fn of listeners.get('window:' + type) || [])
    fn({ key, code: key, preventDefault() {}, repeat: false });
}
