# Changelog

Formato basato su [Keep a Changelog](https://keepachangelog.com/it/1.1.0/), versioni [SemVer](https://semver.org/lang/it/).

## [1.1.0] — non rilasciata (`develop`)

### Aggiunto

- Tre nuovi eroi: **Martina** la Project Manager, **Ops** il sistemista e **Sora Rita** la centralinista, ognuno con arma, Sinergia, abilità, difetto comico e alleato proprio (Lavagna Kanban, Rack, Centralino).
- Schermata di scelta ridisegnata per sette eroi: striscia di ritratti e pannello di dettaglio con arma, abilità, alleato e difetto.

- Prologo degli stagisti in tre atti con boss finale: il **Dott. Cavillo** dell'Ufficio Contratti (clausole, salti col timbro, stordimento, carica con la penna).

- June diventa **August**, una volpe: orecchie a punta, muso, guance bianche e lunga coda animata.
- Pipeline di build con esbuild: sorgenti in `src/`, `index.html` generato come file unico.
- Test unitari, di integrità dati, playthrough headless per tutti e 5 gli eroi ed e2e in Chromium.
- ESLint, Prettier, EditorConfig, workflow CI su GitHub Actions.

- Schermata animata **Come si gioca** dopo la scelta dell'eroe (tastiera o touch).
- HUD legato alla scena: tinta del piano, ritratto vivo dell'eroe, dissolvenza quando il giocatore o il boss ci passano sotto.

### Modificato

- Il gioco è diviso in 44 moduli ES (engine / data / game / render) invece di un unico script.
- Stato mutabile condiviso esplicito negli oggetti `G`, `V` ed `edges`.
- Font estratti in `assets/fonts/` e incorporati in fase di build.

### Rimosso

- **Anzu** non è più selezionabile: restano Bolt, August, Angry Man e gli Stagisti.

- Codice morto (helper e variabili mai usati).

## [1.0.0]

- Prima versione completa: 5 eroi, 7 livelli, boss, alleati, consulenti, quadri degli stagisti.
