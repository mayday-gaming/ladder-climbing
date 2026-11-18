/** @file Coffee-break (pause) menu entries and their on-screen layout, shared by logic and renderer. */
export const PAUSE_ITEMS = [
  { id: 'resume', label: 'RIPRENDI', sub: 'Torna al lavoro', icon: '▶' },
  { id: 'restart', label: 'RICOMINCIA IL LIVELLO', sub: 'Dal primo piano del livello', icon: '↺' },
  { id: 'music', label: 'MUSICA', sub: 'Accendi o spegni', icon: '♪' },
  { id: 'menu', label: 'TORNA AL MENU PRINCIPALE', sub: 'La partita in corso si perde', icon: '⌂' },
];
/** "Main menu" button on the game-over screen. */
export const GO_MENU = { x: 180, y: 202, w: 120, h: 16 };
/** Hit box of menu entry k in logical (480×270) coordinates. */
export function pauseItemRect(k) {
  return { x: 214, y: 78 + k * 30, w: 236, h: 25 };
}
