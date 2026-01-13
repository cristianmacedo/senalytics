# Senalytics

Estatísticas, simulações e análises da Mega Sena.

## Stack

- **Vite + React 19 + TypeScript**
- **Tailwind CSS v4** (using `@tailwindcss/vite` plugin)
- **Vercel Serverless Functions** - BFF/API proxy
- **React Query** - Data fetching & caching
- **Recharts** - Charts/visualizations
- **React Router v7** - Client-side routing

## Architecture Decisions

### Why Static JSON + API Proxy?

The Caixa API (`https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena/`) has some quirks:

1. **CORS blocked** - Can't call directly from browser
2. **Rate limiting** - Gets aggressive if you hit it too fast
3. **No bulk endpoint** - Must fetch one draw at a time

Solution:

- **Static JSON** (`public/data/megasena-history.json`) stores all historical draws (~3MB)
- **Vercel function** (`api/megasena/[concurso].ts`) proxies requests for latest/specific draws
- **Fetch script** (`npm run fetch-history`) syncs history with gentle rate limiting (5 req/batch, 1s delay)

This gives instant historical stats (no API calls) while keeping latest draw fresh.

### Automated Updates

A GitHub Action (`.github/workflows/update-history.yml`) automatically syncs historical data:

- **Schedule:** Runs at **23:00 UTC** on **Wed/Sat** (after Tue/Thu/Sat draws)
- **Draws:** Mega Sena draws happen Tue/Thu/Sat at ~20:00 BRT (23:00 UTC)
- **Commit:** Auto-commits and triggers Vercel redeploy (only if new draws found)

The commit message is configured in the workflow file:

```yaml
git commit -m "chore: update mega sena history"
```

### API Proxy Caching

- **Latest draw** (`/api/megasena/latest`): 5 min cache
- **Specific draw** (`/api/megasena/2955`): 24h cache (historical data doesn't change)

## Development

```bash
# Standard Vite dev (no API functions)
npm run dev

# Full local with API proxy (requires Vercel CLI)
vercel dev

# Sync historical data from Caixa API
npm run fetch-history
```

> **Note:** `vercel dev` requires `npm i -g vercel` and `vercel link` (one-time setup)

## Caixa API Reference

```
GET https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena/
GET https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena/{concurso}
```

Returns full draw data including:

- `listaDezenas` - Numbers drawn (sorted)
- `dezenasSorteadasOrdemSorteio` - Numbers in order they were drawn
- `listaRateioPremio` - Prize breakdown (6/5/4 acertos)
- `listaMunicipioUFGanhadores` - Winners by location
- `acumulado` - Whether prize accumulated
- `indicadorConcursoEspecial` - 0=normal, 1=Mega da Virada, 2=other special

## Branding

Colors from official Mega Sena / Caixa:

- **Caixa Blue**: `#0066b3`
- **Mega Green**: `#209869`

Font: **CAIXA Std** (official Caixa typeface, files in `public/font/`)

## Project Structure

```
├── api/                    # Vercel serverless functions
│   └── megasena/
│       └── [concurso].ts   # API proxy
├── public/
│   ├── data/
│   │   └── megasena-history.json  # Historical draws
│   └── font/               # CAIXA Std fonts
├── scripts/
│   └── fetch-history.ts    # Sync script
└── src/
    ├── api/                # API client functions
    ├── components/         # UI components
    ├── hooks/              # React Query hooks
    ├── lib/                # Statistics & simulator logic
    ├── pages/              # Route pages
    └── types/              # TypeScript types
```

## Pages

| Route         | Description                               |
| ------------- | ----------------------------------------- |
| `/`           | Latest draw, prize info, winners          |
| `/statistics` | Hot/cold numbers, frequencies, patterns   |
| `/simulator`  | Test numbers against history, Monte Carlo |
| `/history`    | Browse all past draws                     |

---

_Dados fornecidos pela API oficial da Caixa Econômica Federal. Este projeto não tem afiliação com a Caixa ou Loterias._
