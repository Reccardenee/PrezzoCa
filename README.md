# PrezzoCa

PrezzoCa is a fuel-price dashboard for Sciacca, Sicily. A Python collector reads
prices from the Italian Fuel Price Observatory, stores daily snapshots as
versioned JSON, and a React dashboard presents the history as charts and tables.

The project is deployed as a static site on GitHub Pages. It has no application
server or database.

## Dashboard

The dashboard includes:

- Fuel selection for self-service and attended diesel and gasoline.
- Search and filters for station and brand.
- A latest-prices table and station details.
- Price history, averages, rankings, distributions, heatmaps, and station/city
  comparisons.
- Light and dark themes.

The frontend loads available yearly data files from the current year back to
2020. Missing years are skipped.

## Quick start: frontend

Requirements: Node.js 20.19 or later on the 20.x line, or Node.js 22.12 or
later, plus npm. The deployment workflow uses Node.js 22. The repository
includes `data/2026.json`, which the local development server uses.

From the repository root:

```sh
cd web
npm ci
npm run dev
```

Open the URL printed by Vite (normally `http://localhost:5173`). The Vite
development middleware serves the repository's `data/` directory at `/data/`.

Other frontend commands, run from `web/`:

```sh
npm run lint
npm run build
npm run preview
npm audit
```

`npm run build` writes the static application to `web/dist/`. For a local
production preview, copy the root `data/*.json` files into `web/dist/data/`
before running `npm run preview`. The deploy workflow does this automatically.
The Vite base path is `/PrezzoCa/`; change `web/vite.config.ts` if deploying
under a different repository path.

## Collector

Requirements: Python 3.12 or later and access to the internet. From the
repository root, create and activate a virtual environment, then install the
collector dependency:

```sh
python -m venv .venv
# Windows PowerShell:
.venv\Scripts\Activate.ps1
# macOS/Linux:
# source .venv/bin/activate
python -m pip install -r collector/requirements.txt
python collector/collect.py
```

The collector reads `collector/config.json`, queries the official Observatory
API, enriches stations with detail data when available, and writes a snapshot
to `data/<UTC-year>.json`. A failed detail lookup falls back to the search
result. The main price request retries request errors and invalid JSON responses
up to five times with backoff.

The collector stores at most one snapshot per UTC calendar date. If it runs
again on the same UTC date, it replaces that day's snapshot. A manual run can
therefore modify a tracked data file; review the data diff before committing.

`collector/config.json` controls the collection area:

| Field | Meaning |
| --- | --- |
| `city` | City name recorded in each snapshot |
| `lat`, `lng` | Center coordinates sent to the Observatory API |
| `radius` | Search radius |
| `fuel` | Fuel-type code sent to the API |

## Data format

Each `data/<year>.json` file is a JSON array of snapshots. A snapshot contains
an ISO-8601 UTC `timestamp`, `city`, `radius`, and a `stations` array. Stations
contain an id, name, brand, location, insertion date, and fuel prices. Each
fuel entry has a `fuelId`, name, price, and `isSelf` flag. Station detail fields
such as address, contact information, services, and opening hours may also be
present.

For example:

```json
[
  {
    "timestamp": "2026-07-30T19:56:07Z",
    "city": "Sciacca",
    "radius": 5,
    "stations": [
      {
        "id": 58866,
        "name": "Example station",
        "brand": "Example brand",
        "lat": 37.5,
        "lng": 13.08,
        "insertDate": "2026-07-30T07:58:17+02:00",
        "fuels": [
          {
            "fuelId": 2,
            "name": "Gasolio",
            "price": 1.739,
            "isSelf": true
          }
        ]
      }
    ]
  }
]
```

Historical files are committed to Git. There is no separate runtime storage.

## Automation and deployment

The GitHub Actions workflows are in `.github/workflows/`:

- **Collect** runs at 06:00, 12:00, and 18:00 UTC, and can also be started
  manually with `workflow_dispatch`. When data changes, it commits the snapshot
  and triggers deployment.
- **Deploy** runs on pushes to `master` that change `data/`, `web/`, or the
  deploy workflow, and can also be started manually. It installs the locked
  frontend dependencies, builds the site, copies yearly JSON files into the
  artifact, and deploys to GitHub Pages.

The collector requires no API key. GitHub Actions uses its repository token to
commit data and dispatch the deployment workflow.

## Docker Compose

Docker and Docker Compose v2 are required. From the repository root:

```sh
docker compose up --build web
```

This serves the dashboard at `http://localhost:5173` and mounts the repository
data into the container. To run a one-off collection instead:

```sh
docker compose run --build --rm collector
```

The collector writes through the mounted `data/` directory, so this command can
modify the host's tracked JSON files.

## Tests and checks

After installing the collector dependency, run the collector tests from the
repository root:

```sh
python -m unittest discover -s collector -v
```

Run frontend checks from the repository root:

```sh
npm --prefix web run lint
npm --prefix web run build
npm --prefix web audit
```

There is no dedicated frontend unit-test script.

## Repository layout

```text
.github/workflows/   Scheduled collection and GitHub Pages deployment
collector/           Collector, configuration, backfill scripts, and tests
data/                Yearly JSON snapshots
web/                 React, TypeScript, Vite, Tailwind CSS, and ECharts frontend
docker-compose.yml   Local collector and frontend services
```

The scripts `collector/backfill_details.py` and
`collector/backfill_coords.py` update historical JSON files in place. Review
their diffs carefully before committing their changes.
