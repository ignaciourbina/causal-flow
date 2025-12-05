# Methodological Background

This document provides the theoretical and methodological context for CausalFlow, intended for researchers using the tool for longitudinal causal modeling.

## Structural Equation Modeling (SEM)

Structural Equation Modeling is a multivariate statistical framework that combines factor analysis and path analysis to test hypothesized relationships among observed and latent variables. CausalFlow specifically targets the path model component of SEM for longitudinal data.

### Key Concepts

| Term | Definition |
|------|------------|
| **Latent variable** | Unobserved construct inferred from measured indicators |
| **Observed variable** | Directly measured variable |
| **Path** | Directed relationship between variables (regression) |
| **Covariance** | Undirected association between variables |

## Longitudinal Designs

CausalFlow is designed for panel data where the same constructs are measured at multiple time points.

### Temporal Notation

Variables are indexed by measurement occasion:
- `X_t1` – Variable X at time 1
- `X_t2` – Variable X at time 2
- etc.

### Types of Longitudinal Effects

#### 1. Autoregressive Effects (Stability)

The effect of a variable on itself over time:

```
X_t2 ~ X_t1
```

Represents rank-order stability—individuals who score high at time 1 tend to score high at time 2.

#### 2. Cross-Lagged Effects

The effect of one variable on a different variable over time:

```
Y_t2 ~ X_t1
```

Central to causal inference in panel data. A significant cross-lagged effect suggests that X predicts subsequent change in Y, controlling for prior Y.

#### 3. Contemporaneous Effects

Effects within the same time period:

```
Y_t1 ~ X_t1
```

Represent associations that occur within the measurement interval. Causal interpretation is more ambiguous than lagged effects.

## Cross-Lagged Panel Models (CLPM)

The traditional CLPM examines reciprocal relationships between variables across time.

### Standard CLPM Structure

```
# Autoregressive paths
X_t2 ~ X_t1
Y_t2 ~ Y_t1

# Cross-lagged paths
X_t2 ~ Y_t1
Y_t2 ~ X_t1
```

### Interpretation

- If `X_t2 ~ Y_t1` is significant but `Y_t2 ~ X_t1` is not, the data suggest Y predicts X but not vice versa.
- Reciprocal effects occur when both cross-lagged paths are significant.

### Limitations

Hamaker et al. (2015) highlight that traditional CLPMs conflate within-person and between-person variance. Researchers should consider:

1. **Random-Intercept CLPM (RI-CLPM)** – Separates stable between-person differences from within-person fluctuations.
2. **Latent Curve Models with Structured Residuals (LCM-SR)** – Models growth trajectories alongside lagged effects.

## lavaan Syntax

CausalFlow exports models in lavaan syntax, the leading R package for SEM.

### Operators

| Operator | Meaning | Example |
|----------|---------|---------|
| `~` | Regression (path) | `Y ~ X` |
| `~~` | Covariance | `X ~~ Y` |
| `=~` | Factor loading | `F =~ x1 + x2` |

### Example Model

A two-variable, three-wave CLPM:

```r
# Autoregressive paths
X_t2 ~ X_t1
X_t3 ~ X_t2
Y_t2 ~ Y_t1
Y_t3 ~ Y_t2

# Cross-lagged paths
X_t2 ~ Y_t1
X_t3 ~ Y_t2
Y_t2 ~ X_t1
Y_t3 ~ X_t2
```

### Running in R

```r
library(lavaan)

model <- '
  # Paste CausalFlow output here
  X_t2 ~ X_t1
  Y_t2 ~ Y_t1
  X_t2 ~ Y_t1
  Y_t2 ~ X_t1
'

fit <- sem(model, data = mydata)
summary(fit, standardized = TRUE, fit.measures = TRUE)
```

## Best Practices

### Model Specification

1. **Theory-driven** – Specify paths based on theoretical hypotheses, not data exploration.
2. **Temporal precedence** – Ensure predictors temporally precede outcomes.
3. **Parsimony** – Avoid overparameterization; more paths require more data.

### Sample Size Considerations

- Minimum: 200 cases for simple models
- Recommended: 10-20 cases per estimated parameter
- Complex models may require 500+ cases

### Model Evaluation

Report multiple fit indices:

| Index | Good Fit | Acceptable Fit |
|-------|----------|----------------|
| CFI | ≥ .95 | ≥ .90 |
| TLI | ≥ .95 | ≥ .90 |
| RMSEA | ≤ .06 | ≤ .08 |
| SRMR | ≤ .08 | ≤ .10 |

## References

- Bollen, K. A. (1989). *Structural equations with latent variables*. Wiley.
- Hamaker, E. L., Kuiper, R. M., & Grasman, R. P. P. P. (2015). A critique of the cross-lagged panel model. *Psychological Methods*, 20(1), 102–116.
- Kline, R. B. (2016). *Principles and practice of structural equation modeling* (4th ed.). Guilford Press.
- Little, T. D. (2013). *Longitudinal structural equation modeling*. Guilford Press.
- Rosseel, Y. (2012). lavaan: An R package for structural equation modeling. *Journal of Statistical Software*, 48(2), 1–36.
