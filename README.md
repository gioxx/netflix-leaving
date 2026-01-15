# Netflix Titles Leaving
[![Titles expiring on Netflix](https://github.com/gioxx/netflix-leaving/actions/workflows/daily.yml/badge.svg)](https://github.com/gioxx/netflix-leaving/actions/workflows/daily.yml)

Funzione core: esportare ogni giorno la lista dei titoli Netflix in scadenza (catalogo Italia) in JSON versionato.

## Cosa c'è dentro
- `python -m netflix_leaving` interroga l'API uNoGS NG (RapidAPI) per le scadenze e scrive `data/YYYY/MM/YYYYMMDD.json` + `data/latest.json`.
- GitHub Action giornaliera (`.github/workflows/daily.yml`) che esegue lo script e committa solo se ci sono cambiamenti.
- Static site (`web/`) pubblicato su GitHub Pages (`.github/workflows/deploy.yml`) che legge `data/latest.json`.

## Setup rapido
```bash
git clone https://github.com/<user>/netflix-leaving.git
cd netflix-leaving
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
pip install -e .
```

### Credenziali uNoGS (RapidAPI)
Sottoscrivi il piano Basic di [uNoGS NG su RapidAPI](https://rapidapi.com/unogs/api/unogs/) e prepara un `.env`:
```
XRAPIDAPIKEY=la_tua_chiave
XRAPIDAPIHOST=unogsng.p.rapidapi.com
NETFLIX_MAX_DETAIL=50       # opzionale, limita le chiamate di dettaglio per contenere i costi
```

### Esecuzione manuale
```bash
XRAPIDAPIKEY=... python -m netflix_leaving --output data
```
I file finiscono in `data/` e `data/latest.json`.

### GitHub Pages
Il sito statico legge `data/latest.json` e viene pubblicato automaticamente dal workflow `deploy.yml` su GitHub Pages. URL: `https://<user>.github.io/netflix-leaving/` (sostituisci `<user>` con il tuo account).

## GitHub Actions
- **daily** (`.github/workflows/daily.yml`): ogni giorno, installa Python 3.12, esegue `python -m netflix_leaving`, committa solo se i JSON cambiano.

Configura i secret nel tuo fork:  
 - `XRAPIDAPIKEY` (obbligatorio)  
 - `XRAPIDAPIHOST` (opzionale, default `unogsng.p.rapidapi.com`)
 - `NETFLIX_MAX_DETAIL` (opzionale, default `50`)

## License
[MIT](/LICENSE)
