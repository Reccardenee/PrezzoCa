# AGENTS.md

Fuel price tracker dashboard for Sciacca, Italy. Static site (GitHub Pages) + Python collector (GitHub Actions cron).

## Commands (run from `web/`)

- `npm run dev` — Vite dev server. Custom middleware serves `../data/*.json` at `/data/`. Data files must be present.
- `npm run build` — `tsc -b` (project references) then `vite build`. Output to `web/dist/`.
- `npm run lint` — oxlint (not ESLint). Config: `web/.oxlintrc.json`.
- `npm run preview` — previews built `dist/`.

## TypeScript quirks

- `verbatimModuleSyntax: true` — **must** use `import type` for type-only imports. Build fails otherwise.
- `erasableSyntaxOnly: true` — no `enum`, no `namespace`, no parameter properties. Use `const` objects instead.
- `noUnusedLocals` / `noUnusedParameters` are errors.

## Architecture

- **Entrypoint:** `web/src/main.tsx` → `App.tsx`. No router.
- **Data loading:** `useData()` → `loadAllYears()` tries years from current down to 2020, collects fulfilled results. Each year file is `data/{year}.json` — array of `Snapshot`.
- **Dev data proxy:** `vite.config.ts` `dataPlugin()` serves `../data/` at `/data/`. In prod, static files at `/PrezziCa/data/{year}.json`.
- **Base path:** `base: '/PrezziCa/'` — critical for build preview links.
- **Dark mode:** ThemeProvider reads `localStorage` key `"prezzica-theme"`, falls back to `prefers-color-scheme`, toggles `.dark` class on `<html>`.

## Charts

All 10 chart components use raw `echarts.init()` via `useRef` + `useEffect`. Pattern:

```tsx
const ref = useRef<HTMLDivElement>(null)
const dark = useDarkMode()
useEffect(() => {
  const chart = echarts.init(ref.current!)
  chart.setOption(chartOptions(dark, { ... }))
  return () => chart.dispose()
}, [snapshots, fuel, dark])
```

Do NOT use `<ReactECharts>` component — none of the existing components use it.

## Fuel type system

`FuelType = "diesel_self" | "diesel_servito" | "gasoline_self" | "gasoline_servito"` in `types.ts`. Mapped to `{ fuelId, isSelf }` in `api.ts` `FUEL_MAP`. Adding a fuel requires updating both + the `<select>` in `Filters.tsx`.

## Station dedup

`buildLabels()` in `api.ts` disambiguates stations with identical names by appending `#1`, `#2` etc. Labels stored as `Map<stationId, label>` and attached as `.label` property during filtering.

## Collector (Python)

- Runs in CI via GitHub Actions cron (`0 6,12,18 * * *` UTC) + manual dispatch.
- Calls detail endpoint (`/ospzApi/registry/servicearea/{id}`) for each station — slow but enriches data.
- Backfill scripts in `collector/` fix missing data in historical JSON snapshots.

## Tests

None. No test files, runners, or scripts exist.

## CI/CD

Two workflows:
- **`collect.yml`** — runs Python collector (3x/day at 06/12/18 UTC). Auto-commits data changes.
- **`deploy.yml`** — builds and deploys to GitHub Pages. Triggers on push to `master` + manual dispatch.

## Docker

`docker-compose.yml` at root runs both collector and web locally.
