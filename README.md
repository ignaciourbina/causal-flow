# CausalFlow

CausalFlow is a web application for building causal path diagrams over multiple time periods. It lets you define variables, connect them across time, and export a lavaan syntax file for structural equation modeling.

## Features

- **Variable input** – Add and name variables that will appear in the diagram.
- **Time period setup** – Specify the number of measurement periods.
- **Interactive path diagram** – Click and drag between nodes to create causal links. Connections are limited to the same period or the following period.
- **Lavaan export** – Download the model in lavaan format so it can be used in R for further analysis.

## Project structure

```
src/
  app/               Next.js pages and layout
  components/        UI and CausalFlow components
  lib/               Utility helpers including lavaan exporter
  hooks/             React hooks
  types/             Type definitions
```

## Getting started

1. Install dependencies (requires Node.js 20):
   ```bash
   npm ci
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
   The app runs locally on <http://localhost:9002> by default.
3. Run type checking and linting:
   ```bash
   npm run typecheck
   npm run lint
   ```

## Building and deployment

- **Static export** – `npm run export` writes a fully static site to the `docs/` folder. The included GitHub Actions workflow deploys this folder to GitHub Pages when you push to the `main` branch.
- **Production build** – `npm run build` followed by `npm start` runs the Next.js production server.

Deployment steps are described in [`documentation/deploy-steps.md`](documentation/deploy-steps.md).

## Customisation

The project uses Tailwind CSS for styling with configuration in `tailwind.config.ts`. Components are based on [shadcn/ui](https://ui.shadcn.com) and Radix primitives.

## Contributing

Issues and pull requests are welcome. Please run linting and type checking before submitting a change.

