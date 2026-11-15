# BIG COMPANY — Ladder Climbing

Platform arcade 2D ambientato nella sede della Big Company. Scegli il tuo eroe, attraversa sette piani lunghi e tortuosi, sconfiggi sette boss, sopravvivi alle call improvvise tra un boss e l'altro e sali di livello in livello, dal 6° fino al Livello Super.

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
| F / E | Stagisti: cambio Gian Daniele ↔ Giammario |
| P / Esc | Pausa |
| M | Musica on/off |

### Telefono
Comandi touch a schermo: croce ◀ ▶, **SALTA**, **SPARA**, **TICKET**, **SINERGIA**, **ALLEATO** e, con gli Stagisti, **SWAP**. Meglio in orizzontale.

## Gli eroi
| Eroe | Arma | Abilità | Alleato |
|---|---|---|---|
| **Anzu** — uccello mesopotamico con testa pelata e occhiali | **FEAR** | Vola | **Anzu-bis** — un altro Anzu che vola e spara con lui, perché Anzu basta a sé stesso |
| **Bolt** — polo bianca, occhiali rettangolari, il più veloce | **TUONO** (un tuono, punto e basta) | Scatto | **Claudio** — l'IA che gioca per te |
| **June** — felpa blu scuro col cappuccio, barba folta, occhiali tondi: più cuori perde, più va in ansia | **PI GRECO**, lento ma pesante | Colpi pesanti | **Penguin** — il pinguino di Linux: la segue sgambettando (e scivolando sulla pancia), lancia comandi da terminale e ogni tanto esegue `sudo rm -rf /nemici` |
| **Angry Man** — pelato, camicia a quadretti | **PAROLACCE** (censurate, ma fanno malissimo) | Turpiloquio molesto | **Il Mainframe** — insulta i nemici in informatichese (SEGFAULT!, ABEND S0C7!) e ogni tanto va in KERNEL PANIC colpendo tutto lo schermo |
| **Gli Stagisti** — **Gian Daniele** (alto, ciuffo impomatato, giacca beige troppo grande, cravattino rosso) e **Giammario** (basso, ricci neri, lentiggini, cuffie al collo, penne nel taschino), si cambiano al volo. Prima della scalata affrontano **Primo giorno** (trova la porta delle Risorse Umane) e **Il Colloquio** con la Dott.ssa Assunta Talenti; poi salgono da stagisti a tempo determinato e indeterminato, migliorando a ogni passo | **ESPRESSO** (tazzine bollenti in parabola) / **AEREOPLANINI** (aerei di carta che puntano i nemici); Sinergia: pioggia di tazzine o stormo di carta a 360° | Cambio al volo | **La Fotocopiatrice** — spara fogli, ogni tanto s'inceppa e poi riparte in fronte-retro |

Quando chiami l'alleato, **2 volte su 5 arriva invece il tuo capo**: ti segue, a volte gentile e a volte arrabbiato, e ti parla di reperibilità, straordinari, mezza giornata non approvata e ferie a settembre; ogni tanto ti blocca per "una cosa veloce" e ti rallenta. Intanto il tuo eroe si arrabbia: faccia rossa, vena sulla fronte, fumo, parolacce e colpi più rapidi.

I consulenti esterni **Tiberio** e **Luigi** invece compaiono a caso nei livelli, di passaggio, e ti danno una mano: Tiberio lancia slide, Luigi lancia merge. Poi se ne vanno mandando la fattura.

Quando chiami l'alleato il gioco si ferma per due secondi e parte un'animazione a tutto schermo che ti presenta chi è uscito: fanfara se arriva il tuo alleato, trombone triste e "CHIAMATA FALLITA" se arriva il capo, con l'alleato mancato grigio e sotto la pioggia in un angolo.

All'avvio c'è una schermata d'ingresso e una breve presentazione animata, poi il menu con la musica. Ogni evento aziendale casuale (pioggia di buoni pasto, disco pausa pranzo, bug in produzione…) viene annunciato da una schermata a tutto schermo. Angry Man diventa sempre più rosso e furioso man mano che perde cuori.

Ogni livello si apre con una schermata di presentazione "eroe VS boss". Quando la Sinergia è al massimo te lo dice una scritta al centro; quando la scateni compare il tuo eroe in grande, ogni volta in una posa diversa.

## Asdrubale

Il quarto livello è **Piano 9 · L'Archivio Storico**, un livello completo tra schedari e faldoni, e il suo boss è **Asdrubale**, il manager più anziano della Big Company: si lamenta di tutto (dei sistemi, dei giovani, della vita) lanciando reclami, ogni tanto si ferma e piange (e lì prende danno doppio), poi si arrabbia, carica e lancia mainframe in miniatura.

## Nemici

I nemici si possono anche **pestare saltandoci sopra**: muoiono subito e tu rimbalzi (tieni premuto salto per rimbalzare più in alto, e ti ritorna anche il doppio salto). Saltare in testa a un boss gli toglie un bel pezzo di vita. Se li tocchi di lato, invece, ti fanno male.

Ogni piano ha i suoi, oltre al Foglio arrabbiato e alla Busta volante che girano ovunque:

- **Piazzale** — cono stradale con le gambe, piccione bombardiere
- **Sala server** — bug verde velocissimo, ventola impazzita, router che lancia scintille
- **Open space** — sedia a rotelle che ti carica, timbratrice lanciafogli
- **Sale riunioni** — sedia a rotelle, penna stilografica a dardo, proiettore che spara slide
- **Piano nobile** — ficus permaloso, penna stilografica, timbratrice e proiettore
- **Tetto** — cono, piccione, antenna che lancia scintille



I **buoni pasto** servono a chiamare l'alleato (ne costano 10), danno 50 punti l'uno e caricano un po' la Sinergia.

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
1. **Piano terra · Il Piazzale** — Ubaldo, il Censore della Piattaforma
2. **Piano 3 · La Sala Server** — Camomillo, il Maestro Zen delle Tastiere
3. **Piano 7 · L'Open Space** — Tornello, il Guardiano della Tutela dell'Impresa
4. **Piano 9 · L'Archivio Storico** — Asdrubale, il Manager più anziano della Big Company
5. **Piano 12 · Le Sale Riunioni** — Melissa, la Regina del CC
6. **Piano 19 · Il Piano Nobile** — Il Conte del Budget, Signore dei Tagli Lineari
7. **Il Tetto · Sotto l'insegna** — Geraldo, la Creatura del Top Management

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
