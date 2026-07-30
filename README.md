# Gas Price Tracker

Static dashboard that tracks daily fuel prices in Sciacca
via the official API of the Ministry's Fuel Price Observatory.

## Architecture

- **Collector** — Python script run by GitHub Action (daily cron)
- **Data** — Versioned JSON snapshots with Git (one file per year)
- **Frontend** — React + Vite + TypeScript + TailwindCSS + ECharts
- **Hosting** — GitHub Pages

## Structure

```
collector/       Python scripts and configuration
data/            Historical prices (JSON per year)
web/             React dashboard
.github/workflows/  GitHub Actions
```
