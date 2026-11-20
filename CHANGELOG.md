# Changelog

Formato basato su [Keep a Changelog](https://keepachangelog.com/it/1.1.0/), versioni [SemVer](https://semver.org/lang/it/).

## [Non rilasciato]

### Aggiunto

- **Classifica** dei primi 10 con nome del giocatore, eroe, livello raggiunto e punti, salvata sul dispositivo; schermata "NUOVO RECORD!" con tastiera a schermo; pulsante Classifica sul titolo.

### Modificato

- La Project Manager si chiama **Iolanda**: capelli biondi riccissimi e occhi azzurri.

## [1.2.0] — 2026-11-18

### Aggiunto

- Tre nuovi eroi: **Martina** (oggi Iolanda) la Project Manager, **Ops** il sistemista e **Sora Rita** la centralinista, ognuno con arma, Sinergia, abilità, difetto comico e alleato proprio (Lavagna Kanban, Rack, Centralino).
- Prologo degli stagisti in tre atti con boss finale: il **Dott. Cavillo** dell'Ufficio Contratti (clausole, salti col timbro, stordimento, carica con la penna).
- Menu della **pausa caffè** rifatto: riprendi, ricomincia il livello, musica on/off e ritorno al menu principale (con conferma); ritorno al menu anche dal game over.

### Modificato

- Schermata di scelta ridisegnata per sette eroi: striscia di ritratti e pannello di dettaglio con arma, abilità, alleato e difetto; sul touch il primo tocco seleziona, il secondo avvia.

### Rimosso

- **Anzu** non è più selezionabile.

## [1.1.0] — 2026-11-16

### Aggiunto

- June diventa **August**, una volpe: orecchie a punta, muso, guance bianche e lunga coda animata.
- Schermata animata **Come si gioca** dopo la scelta dell'eroe (tastiera o touch), con una mini-animazione per ogni mossa e l'alleato dell'eroe.
- HUD legato alla scena: tinta del piano, ritratto vivo dell'eroe, dissolvenza quando il giocatore o il boss ci passano sotto.
- Pipeline di build con esbuild: sorgenti in `src/`, `index.html` generato come file unico.
- Test unitari, di integrità dati, playthrough headless per ogni eroe ed e2e in Chromium.
- ESLint, Prettier, EditorConfig, workflow CI su GitHub Actions.

### Modificato

- Il gioco è diviso in moduli ES (engine / data / game / render) invece di un unico script.
- Stato mutabile condiviso esplicito negli oggetti `G`, `V` ed `edges`.
- Font estratti in `assets/fonts/` e incorporati in fase di build.

### Rimosso

- Codice morto (helper e variabili mai usati).

## [1.0.0]

- Prima versione completa: 5 eroi, 7 livelli, boss, alleati, consulenti, quadri degli stagisti.
