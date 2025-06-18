# CausalFlow

CausalFlow is a web application for building causal path diagrams over multiple time periods. It lets you define variables, connect them across time, and export a lavaan syntax file for structural equation modeling.

Built with **Next.js 15**, **React 18** and **TypeScript**, it uses Tailwind CSS for styling and shadcn/ui components.

## Features

- **Variable input** – Add and name variables that will appear in the diagram.
- **Time period setup** – Specify the number of measurement periods.
- **Interactive path diagram** – Click on a variable and then another to draw a directed arrow. Links between different variables are restricted to the same period or the following one. Self‑loops may span multiple periods. Skipping connections within a period are drawn with elbowed lines that automatically take unused lanes to avoid overlap.
- **Lavaan export** – Download the model in lavaan format so it can be used in R for further analysis.

## Project structure

```
src/
  app/               Next.js pages and layout
  components/        UI and CausalFlow components
  lib/               Utility helpers including lavaan exporter
  hooks/             React hooks
  types/             Type definitions
  ai/                Genkit flows and configuration
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
4. (Optional) Run Genkit AI flows:
   ```bash
   npm run genkit:dev
   ```

## Building and deployment

- **Static export** – `npm run export` writes a fully static site to the `docs/` folder. The included GitHub Actions workflow deploys this folder to GitHub Pages when you push to the `main` branch.
- **Production build** – `npm run build` followed by `npm start` runs the Next.js production server.

Deployment steps for GitHub Pages are described in [`documentation/deploy-steps.md`](documentation/deploy-steps.md).
For instructions on publishing to a Hugging Face Space see [`Deployment/huggingface-spaces.md`](Deployment/huggingface-spaces.md).

## Customisation

The project uses Tailwind CSS for styling with configuration in `tailwind.config.ts`. Components are based on [shadcn/ui](https://ui.shadcn.com) and Radix primitives.

## Contributing

Issues and pull requests are welcome. Please run linting and type checking before submitting a change.

