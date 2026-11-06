# Frontend

This directory contains the React, TypeScript, Vite, Tailwind CSS, and ECharts
dashboard. For the full project guide—including data format, collector, Docker,
and GitHub Actions—see the [repository README](../README.md).

## Requirements

- Node.js 20.19 or later on the 20.x line, or Node.js 22.12 or later (CI uses
  Node.js 22)
- The repository-level `data/` directory for local development

## Local development

From this directory:

```sh
npm ci
npm run dev
```

Vite's development middleware serves the repository-level `data/` directory
at `/data/`. The frontend loads available `data/<year>.json` files from the
current year back to 2020.

## Commands

```sh
npm run lint
npm run build
npm run preview
npm audit
```

The production build is written to `dist/`. A production preview also needs the
repository's yearly JSON files copied into `dist/data/`; the GitHub Pages
workflow handles this step. The configured base path is `/PrezzoCa/`.
