/** @file Entry point: wires input, persistence, canvas and the fixed-step loop. */
import { installDebugHook } from './debug.js';
import { resize, setupCanvas } from './engine/canvas.js';
import { setupInput } from './engine/input.js';
import { loop } from './game/loop.js';
import { loadHi } from './game/state.js';

setupInput();
loadHi();
setupCanvas();
resize();
installDebugHook();
requestAnimationFrame(loop);
