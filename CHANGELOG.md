# Changelog

Formato basato su [Keep a Changelog](https://keepachangelog.com/it/1.1.0/), versioni [SemVer](https://semver.org/lang/it/).

## [1.1.0] — non rilasciata (`develop`)

### Aggiunto

- June ha una lunga coda di volpe animata (segue corsa, salto e caduta).
- Pipeline di build con esbuild: sorgenti in `src/`, `index.html` generato come file unico.
- Test unitari, di integrità dati, playthrough headless per tutti e 5 gli eroi ed e2e in Chromium.
- ESLint, Prettier, EditorConfig, workflow CI su GitHub Actions.

### Modificato

- Il gioco è diviso in 44 moduli ES (engine / data / game / render) invece di un unico script.
- Stato mutabile condiviso esplicito negli oggetti `G`, `V` ed `edges`.
- Font estratti in `assets/fonts/` e incorporati in fase di build.

### Rimosso

- Codice morto (helper e variabili mai usati).

## [1.0.0]

- Prima versione completa: 5 eroi, 7 livelli, boss, alleati, consulenti, quadri degli stagisti.
