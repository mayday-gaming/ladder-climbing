# ANZU: PROMOSSO!

Platform arcade 2D ambientato nella sede di Posto Fisso. Scegli il tuo eroe, scala sei piani, sconfiggi sei boss, sopravvivi agli eventi aziendali e fatti promuovere fino ad Amministratore Delegato.

Grafica vettoriale in alta definizione disegnata interamente in codice (nessuna immagine esterna), animazioni con arti articolati, movimento interpolato per schermi a 60/90/120 Hz, musica chiptune generata in tempo reale. Tutto in un solo file HTML, funziona anche offline.

**Gioca:** apri `index.html` in un browser, oppure attiva GitHub Pages (Settings → Pages → branch `main`, cartella root).

## Come giocare

Apri `index.html` in un browser (desktop o telefono). Nessuna dipendenza, nessuna build.

### Comandi tastiera
| Tasto | Azione |
|---|---|
| ← → / A D | Muovi |
| Z / Spazio / ↑ | Salta (Anzu: in aria premi ancora per volare, tieni premuto per planare) |
| X / J | Spara |
| B / Q | Lancia un ticket SNOW (bomba) |
| C / K / Shift | Sinergia (quando la barra è piena) |
| V / T | Chiama l'alleato (10 buoni pasto) |
| F / E | Team Aureola: cambio Del Tuono ↔ Del Giugno |
| P / Esc | Pausa |
| M | Musica on/off |

### Telefono
Comandi touch a schermo: croce ◀ ▶, **SALTA**, **SPARA**, **SNOW**, **SINERGIA**, **ALLEATO** e, col Team Aureola, **SWAP**. Meglio in orizzontale.

## Gli eroi
| Eroe | Arma | Abilità | Alleato |
|---|---|---|---|
| **Anzu** — uccello mesopotamico con testa pelata e occhiali | **AURA** | Vola | **Anzu-bis** — un altro Anzu che vola e spara con lui, perché Anzu basta a sé stesso |
| **Team Aureola** — **Del Tuono** (polo bianca, occhiali rettangolari) e **Del Giugno** (camicia celeste, occhiali tondi), si cambiano al volo | **KITEVVIV** a forma di saetta / **PI GRECO** che sfrecciano a zig-zag come saette | Cambio al volo | **CLAUDIO** — un'IA che gioca al posto tuo; se è in call arriva a sorpresa **Tiberiho** o **Laifo** |
| **Big Chapel** — pelato, camicia a quadretti | **PAROLACCE** (censurate, ma fanno malissimo) | Turpiloquio molesto | **Il Mainframe** — insulta i nemici in informatichese (SEGFAULT!, ABEND S0C7!) e ogni tanto va in KERNEL PANIC colpendo tutto lo schermo |

Tutti hanno i **ticket SNOW**: bombe ad area che fanno molto male a nemici e boss. Si parte con 3, se ne trovano lungo i piani.

## Eventi aziendali
Ogni tanto, all'improvviso:
- **Pioggia di buoni pasto** — piovono buoni, caffè e ticket
- **Prova di evacuazione** — i nemici scappano urlando
- **Riunione fiume** — tutto al rallentatore
- **Venerdì alle 18** — tutto a doppia velocità
- **Disco pausa pranzo** — palla stroboscopica, musica disco, nemici e boss ballano invece di attaccare
- **Riorganizzazione aziendale** — il mondo si capovolge
- **Bug in produzione** — lo schermo va in glitch

Con le combo partono le buzzword (SINERGICO!, DISRUPTIVE!, KPI SUPERATI!…) e i nemici sconfitti se ne vanno con una scusa ("Vado in ferie!", "Apro un ticket!").

## Livelli e boss
1. **Piano terra · Il Piazzale** — Gigi Martelletto, il Censore della Via Lattea
2. **Piano 3 · La Sala Server** — Mario Puzzino, il Maestro Zen delle Tastiere
3. **Piano 7 · L'Open Space** — Francesco Bertozzone, il Guardiano della Tutela Aziendale
4. **Piano 12 · Le Sale Riunioni** — Mel, Email & Occhiatacce
5. **Piano 19 · Il Piano Nobile** — Il Conte delle Marche, Signore delle Marche da Bollo
6. **Il Tetto · Sotto l'insegna** — Emilio Del Ciocco, la Creatura dedita alle Release

## Potenziamenti
- **Chip arma**: 1.0 → 2.0 → TRIPLO → MAX (colpi perforanti)
- **Caffè**: +1 cuore
- **Buoni pasto**: punti, carica Sinergia, valuta per l'alleato
- **Ticket SNOW**: +1 bomba
- **Ferie**: vita extra
- Ogni promozione dà un benefit: cuori extra, ali potenziate (Anzu) o doppio salto (gli altri), Sinergia più rapida.

## Punteggio
Combo fino a x8, bonus tempo / cuori / combo a fine piano, vita extra ogni 40.000 punti, record salvato nel browser.

## Crediti
- Concept, personaggi e direzione: Luca — vedi i prompt originali in [`prompt.md`](prompt.md)
- Codice, grafica e musica: generati con Claude
- Font: Fredoka e Nunito (SIL Open Font License 1.1), incorporati nel file

## Licenza
[MIT](LICENSE)
