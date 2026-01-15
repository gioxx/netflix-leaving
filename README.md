# Netflix Titles Leaving
[![Titles expiring on Netflix](https://github.com/gioxx/netflix-leaving/actions/workflows/daily.yml/badge.svg)](https://github.com/gioxx/netflix-leaving/actions/workflows/daily.yml) [![Build & Deploy site](https://github.com/gioxx/netflix-leaving/actions/workflows/deploy.yml/badge.svg)](https://github.com/gioxx/netflix-leaving/actions/workflows/deploy.yml)

Daily radar dei titoli Netflix in scadenza (catalogo Italia) con JSON storico e frontend statico rosso/nero.

## Cosa c'è dentro
- **Raccolta dati**: `python -m netflix_leaving` interroga l'API uNoGS (RapidAPI), valida la risposta e salva `data/YYYY/MM/YYYYMMDD.json` + `data/latest.json`. Scrive solo se cambia.
- **Frontend**: pagina unica in `web/` (grid di card, ricerca, filtri per tipo e IMDB minimo). Nessun jQuery.
- **Automazioni**: GitHub Actions giornaliera per dati, build+deploy su GitHub Pages.

## Setup rapido
1) **Clona il repo**  
   ```bash
   git clone https://github.com/<user>/netflix-leaving.git
   cd netflix-leaving
   ```

2) **Python**  
   ```bash
   python3 -m venv .venv && source .venv/bin/activate
   pip install -r requirements.txt
   pip install -e .
   ```

3) **Credenziali uNoGS (RapidAPI)**  
   - Sottoscrivi il piano Basic di [uNoGS NG su RapidAPI](https://rapidapi.com/unogs/api/unogs/).
   - Crea `.env` con:
     ```
     XRAPIDAPIKEY=la_tua_chiave
     XRAPIDAPIHOST=unogsng.p.rapidapi.com
     NETFLIX_MAX_DETAIL=150     # opzionale, limita le chiamate di dettaglio per contenere i costi
     ```

4) **Esegui manualmente**  
   ```bash
   XRAPIDAPIKEY=... python -m netflix_leaving --output data
   ```
   I file finiscono in `data/` e `data/latest.json`.

5) **Frontend locale**  
   ```bash
   npm run build       # copia web/ e data/ in dist/
   python3 -m http.server 4173 --directory dist
   # apri http://localhost:4173
   ```

## GitHub Actions
- **daily** (`.github/workflows/daily.yml`): ogni giorno, installa Python 3.12, esegue `python -m netflix_leaving`, committa solo se i JSON cambiano.
- **deploy** (`.github/workflows/deploy.yml`): su push o al termine di `daily`, copia `web/` + `data/` in `dist/` e pubblica su GitHub Pages.

Configura i secret nel tuo fork:  
 - `XRAPIDAPIKEY` (obbligatorio)  
 - `XRAPIDAPIHOST` (opzionale, default `unogs-unogs-v1.p.rapidapi.com`)

## Add-on "My list"
Cartella `mylist/`: genera JSON dal tuo export Netflix e verifica se i tuoi preferiti sono in scadenza usando `data/latest.json`.

## License
[MIT](/LICENSE)
