# BIG COMPANY — Scalata Manageriale

Platform arcade 2D ambientato nella sede della Big Company. Scegli il tuo eroe, attraversa sei piani lunghi e tortuosi, sconfiggi sei boss, sopravvivi alle call improvvise tra un boss e l'altro e sali di livello in livello, dal 6° fino al Livello Super.

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
| B / Q | Lancia un ticket incident (bomba) |
| C / K / Shift | Sinergia (quando la barra è piena) |
| V / T | Chiama l'alleato (10 buoni pasto) |
| F / E | Halo Team: cambio Bolt ↔ June |
| P / Esc | Pausa |
| M | Musica on/off |

### Telefono
Comandi touch a schermo: croce ◀ ▶, **SALTA**, **SPARA**, **TICKET**, **SINERGIA**, **ALLEATO** e, col Halo Team, **SWAP**. Meglio in orizzontale.

## Gli eroi
| Eroe | Arma | Abilità | Alleato |
|---|---|---|---|
| **Anzu** — uccello mesopotamico con testa pelata e occhiali | **FEAR** | Vola | **Anzu-bis** — un altro Anzu che vola e spara con lui, perché Anzu basta a sé stesso |
| **Halo Team** — **Bolt** (polo bianca, occhiali rettangolari) e **June** (felpa blu scuro col cappuccio, barba folta, occhiali tondi), si cambiano al volo | **TUONO** (un tuono, punto e basta) / **PI GRECO** che sfrecciano a zig-zag come saette | Cambio al volo | **CLAUDIO** — un'IA che gioca al posto tuo |
| **Angry Man** — pelato, camicia a quadretti | **PAROLACCE** (censurate, ma fanno malissimo) | Turpiloquio molesto | **Il Mainframe** — insulta i nemici in informatichese (SEGFAULT!, ABEND S0C7!) e ogni tanto va in KERNEL PANIC colpendo tutto lo schermo |

Per tutti gli eroi, ogni tanto al posto dell'alleato arriva a sorpresa uno dei due consulenti esterni: **Tiberio** (slide e post-it) o **Luigi** ("facciamo merge?").

Quando chiami l'alleato il gioco si ferma per due secondi e parte un'animazione a tutto schermo che ti presenta chi è uscito: fanfara se arriva il tuo alleato, trombone triste e "CHIAMATA FALLITA" se arriva un consulente, con l'alleato mancato grigio e sotto la pioggia in un angolo.

Ogni livello si apre con una schermata di presentazione "eroe VS boss". Quando la Sinergia è al massimo te lo dice una scritta al centro; quando la scateni compare il tuo eroe in grande, ogni volta in una posa diversa.

Tutti hanno i **ticket incident**: bombe ad area che fanno molto male a nemici e boss. Si parte con 3, se ne trovano lungo i piani.

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

## Il percorso
Ogni piano è lungo e tortuoso: scale di mensole, buche, un nastro trasportatore di pratiche che va all'indietro, montacarichi orizzontali e verticali, colline di schedari, il trampolino di carriera e una pausa caffè obbligatoria che ridà un cuore e fa da checkpoint. Lungo la strada, cartelli aziendali molto utili ("Ascensore guasto dal 1998", "Si prega di non nutrire i consulenti"…).

## Livelli speciali di sopravvivenza
Tra un boss e l'altro scatta un'emergenza a sorpresa, una per partita e in ordine casuale. Bisogna resistere 25 secondi: ogni colpo costa un cuore (mai l'ultimo) e abbassa il bonus.
- **Call improvvisa** — inviti di calendario e fumetti "Mi senti?" / "Sei in muto!"
- **Emergenza in sala server** — palle di fuoco e scintille
- **Tempesta di mail all-hands** — qualcuno ha fatto "Rispondi a tutti"
- **Deadline anticipata a ieri** — piovono pagine del calendario
- **Audit a sorpresa** — faldoni e schede di censimento

## Livelli e boss
1. **Piano terra · Il Piazzale** — Gigi Martelletto, il Censore della Via Lattea
2. **Piano 3 · La Sala Server** — Mario Puzzino, il Maestro Zen delle Tastiere
3. **Piano 7 · L'Open Space** — Francesco Carrozzone, il Guardiano della Tutela dell'Impresa
4. **Piano 12 · Le Sale Riunioni** — Melissa, la Regina del CC
5. **Piano 19 · Il Piano Nobile** — Il Conte delle Marche, Signore delle Marche da Bollo
6. **Il Tetto · Sotto l'insegna** — Geraldo Chops, la Creatura dedita alle Release

## Potenziamenti
- **Chip arma**: 1.0 → 2.0 → TRIPLO → MAX (colpi perforanti)
- **Caffè**: +1 cuore
- **Buoni pasto**: punti, carica Sinergia, valuta per l'alleato
- **Ticket incident**: +1 bomba
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
