/** @file Random in-level office events (mail, deadlines, calls…). */
export const EVT = [
  { id: 'rain', name: 'PIOGGIA DI BUONI PASTO!', dur: 300 },
  { id: 'evac', name: 'PROVA DI EVACUAZIONE!', dur: 240, noBoss: 1 },
  { id: 'slow', name: 'RIUNIONE FIUME...', dur: 200 },
  { id: 'turbo', name: 'VENERDÌ ALLE 18!', dur: 480 },
  { id: 'disco', name: 'DISCO PAUSA PRANZO!', dur: 360 },
  { id: 'flip', name: 'RIORGANIZZAZIONE AZIENDALE!', dur: 240 },
  { id: 'glitch', name: 'BUG IN PRODUZIONE!', dur: 240 },
];
export const BUZZ = [
  'SINERGICO!',
  'PROATTIVO!',
  'SCALABILE!',
  'DISRUPTIVE!',
  'AGILE!',
  'BEST PRACTICE!',
  'WIN-WIN!',
  'OUT OF THE BOX!',
  'LEAN!',
  'ROI!!!',
  'KPI SUPERATI!',
  'CUSTOMER-CENTRIC!',
  'GAME CHANGER!',
  'QUICK WIN!',
];
export const QUIPS = [
  'Vado in ferie!',
  'Smart working!',
  'Esco prima!',
  'Pausa caffè!',
  'Mi licenzio!',
  'Torno lunedì!',
  'Scrivo al sindacato!',
  'Era il mio ultimo giorno!',
  'Non è il mio reparto!',
  'Apro un ticket!',
];
export const EVD = {
  rain: { c: '#ffd500', c2: '#8a5a00', d: 'Piovono buoni pasto: raccoglili tutti!' },
  evac: { c: '#3cff7a', c2: '#0a5a2a', d: 'I nemici scappano. Tu no.' },
  slow: { c: '#9fb4ff', c2: '#27346e', d: 'Tutto al rallentatore. Anche tu.' },
  turbo: { c: '#ff8a3c', c2: '#7a2a00', d: 'Doppia velocità: si esce prima!' },
  disco: { c: '#ff5ad0', c2: '#5a0a6a', d: 'Nessuno attacca. Si balla.' },
  flip: { c: '#66f0ff', c2: '#0a4a6a', d: "Tutto sottosopra. Come l'organigramma." },
  glitch: { c: '#ff4d5e', c2: '#5a0a14', d: '«Sulla mia macchina funzionava.»' },
};
