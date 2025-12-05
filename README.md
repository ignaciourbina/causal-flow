# CausalFlow

**CausalFlow** is an interactive visual tool for specifying longitudinal causal models. It enables researchers to define variables, establish temporal measurement points, and visually construct path diagrams that can be exported to [lavaan](https://lavaan.ugent.be/) syntax for Structural Equation Modeling (SEM) analysis in R.

## Research Context

Longitudinal research designs require careful specification of causal relationships across time. CausalFlow addresses common challenges in this process:

- **Model specification complexity** – Translating theoretical causal hypotheses into formal SEM syntax can be error-prone and time-consuming.
- **Temporal constraints** – Causal effects in panel data must respect temporal ordering; effects cannot travel backward in time.
- **Visual clarity** – Path diagrams help researchers communicate and validate their theoretical models before estimation.

### Methodological Approach

CausalFlow enforces methodologically sound constraints on path specification:

1. **Cross-lagged paths** – Connections between different variables are restricted to the same time period (contemporaneous effects) or the immediately following period (lagged effects), reflecting standard assumptions in panel data analysis.
2. **Autoregressive paths** – Self-loops (stability paths) may span multiple periods, allowing for flexible specification of autoregressive structures.
3. **lavaan integration** – The exported syntax follows lavaan conventions, using the regression operator (`~`) and time-indexed variable names (e.g., `anxiety_t1 ~ depression_t1`).

### Use Cases

- **Cross-lagged panel models (CLPM)** – Examine reciprocal causal relationships between variables over time.
- **Autoregressive models** – Specify stability and change in constructs across measurement occasions.
- **Hybrid models** – Combine cross-lagged and autoregressive components for comprehensive longitudinal analysis.

## Features

| Feature | Description |
|---------|-------------|
| **Variable definition** | Add and name latent or observed variables for your model |
| **Temporal structure** | Specify the number of measurement waves/periods |
| **Interactive path diagram** | Click-to-connect interface for drawing directed paths between nodes |
| **Temporal constraints** | Automatic enforcement of valid temporal orderings for causal paths |
| **lavaan export** | Download model specification in R-ready lavaan syntax |

## Getting Started

### Prerequisites

- Node.js 20 or later

### Installation

```bash
npm ci
```

### Running Locally

```bash
npm run dev
```

The application will be available at <http://localhost:9002>.

### Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run export` | Generate static site to `docs/` |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run lint` | Run ESLint |
| `npm run genkit:dev` | Start Genkit AI flows (optional) |

## Deployment

CausalFlow can be deployed as a static site:

- **GitHub Pages** – See [`documentation/deploy-steps.md`](documentation/deploy-steps.md)
- **Hugging Face Spaces** – See [`Deployment/huggingface-spaces.md`](Deployment/huggingface-spaces.md)

## Project Structure

```
src/
├── app/           # Next.js pages and layout
├── components/    # UI and CausalFlow diagram components
│   └── causalflow/  # Path diagram, variable nodes, export functionality
├── lib/           # Utilities including lavaan syntax generator
├── hooks/         # React hooks
├── types/         # TypeScript type definitions
└── ai/            # Genkit AI configuration
```

## Technical Implementation

Built with Next.js 15, React 18, and TypeScript. UI components are based on [shadcn/ui](https://ui.shadcn.com) with Tailwind CSS for styling.

## Citation

If you use CausalFlow in your research, please consider citing this tool in your methodology section.

## Contributing

Contributions are welcome. Please run `npm run typecheck` and `npm run lint` before submitting changes.

## References

- Rosseel, Y. (2012). lavaan: An R Package for Structural Equation Modeling. *Journal of Statistical Software*, 48(2), 1–36. https://doi.org/10.18637/jss.v048.i02
- Hamaker, E. L., Kuiper, R. M., & Grasman, R. P. (2015). A critique of the cross-lagged panel model. *Psychological Methods*, 20(1), 102–116.
