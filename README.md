# Gas Price Tracker

Dashboard statica che monitora giornalmente i prezzi dei carburanti a Sciacca
tramite l'API ufficiale dell'Osservatorio Prezzi Carburanti del Ministero.

## Architettura

- **Collector** — Python script eseguito da GitHub Action (cron giornaliero)
- **Dati** — Snapshot JSON versionati con Git (un file per anno)
- **Frontend** — React + Vite + TypeScript + TailwindCSS + ECharts
- **Hosting** — GitHub Pages
- **Notifiche** — Discord Webhook

## Struttura

```
collector/       Script Python e configurazione
data/            Storico prezzi (JSON per anno)
web/             Dashboard React
.github/workflows/  GitHub Actions
```
