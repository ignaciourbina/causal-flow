# CausalFlow – Design Blueprint

## Overview

CausalFlow is a research tool designed to facilitate the specification of longitudinal causal models for Structural Equation Modeling (SEM). This document outlines the design principles and user interface guidelines.

## Research Objectives

The tool aims to:

1. **Lower technical barriers** – Enable researchers to specify complex longitudinal models without manual lavaan syntax writing.
2. **Enforce methodological rigor** – Implement constraints that reflect best practices in longitudinal causal modeling.
3. **Support visual communication** – Provide clear path diagrams suitable for publications and presentations.

## Core Features

### Variable Input
Define the constructs (variables) in your theoretical model. Variables represent latent or observed constructs measured repeatedly across time (e.g., anxiety, depression, self-efficacy).

### Period Definition
Specify the number of measurement occasions (waves) in your longitudinal design. Each period represents a distinct time point at which all variables are measured.

### Tabular Display
Visual grid showing variables × periods, where each cell represents a measured instance of a variable at a specific time point.

### Path Definition
Interactive path drawing with methodological constraints:

- **Cross-sectional paths**: Connect variables within the same time period (contemporaneous effects)
- **Lagged paths**: Connect variables across adjacent time periods (predictive effects)
- **Autoregressive paths**: Connect a variable to itself across time periods (stability effects)
- **Elbow connectors**: Automatic routing for paths that skip intermediate variables

### lavaan Export
Generate R-ready syntax compatible with the lavaan package for SEM estimation.

## Visual Design Guidelines

### Color Palette

| Role | Color | Hex | Rationale |
|------|-------|-----|-----------|
| Primary | Teal | `#008080` | Conveys clarity and analytical precision |
| Background | Light teal | `#E0F8F8` | Unobtrusive, reduces visual fatigue |
| Accent | Mustard yellow | `#FFDB58` | Draws attention to interactive elements |

### Typography

- **Font family**: Inter (sans-serif)
- **Rationale**: Modern, highly legible typeface optimized for screen reading

### Layout Principles

1. **Clean and modular** – Clear visual hierarchy for input fields and diagram areas
2. **Progressive disclosure** – Show complexity only when needed
3. **Immediate feedback** – Visual confirmation of user actions

### Iconography

Minimalist line-based icons representing:
- Variables (nodes)
- Paths (directed arrows)
- Actions (export, add, remove)

### Interaction Design

- **Smooth transitions** – Animate path connections to reinforce causal direction
- **Hover states** – Highlight interactive elements on mouse-over
- **Click-to-connect** – Intuitive two-click path creation workflow

## Technical Architecture

### Data Model

```typescript
Variable {
  id: string      // Unique identifier
  name: string    // Display name (e.g., "Anxiety")
}

Path {
  id: string
  from: NodeIdentifier  // Source variable + period
  to: NodeIdentifier    // Target variable + period
}

NodeIdentifier {
  variableId: string
  periodIndex: number   // 0-indexed time period
}
```

### lavaan Output Format

Paths are exported as regression statements:
```r
# Cross-lagged effect
depression_t2 ~ anxiety_t1

# Autoregressive effect
anxiety_t2 ~ anxiety_t1

# Contemporaneous effect
depression_t1 ~ anxiety_t1
```

## Future Considerations

- **Covariance specification** – Allow residual correlations between variables
- **Equality constraints** – Enable testing of measurement invariance
- **Model comparison** – Support for nested model testing
- **Random-intercept CLPM** – Extended models separating between-person and within-person variance
