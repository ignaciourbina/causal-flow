# Deploying CausalFlow to GitHub Pages

This guide explains how to publish CausalFlow as a static site on GitHub Pages, making it accessible to research collaborators and the broader academic community.

## Why GitHub Pages?

- **Free hosting** for static sites
- **Persistent URLs** suitable for citation in publications
- **Version control integration** for reproducible deployments

## Prerequisites

- Node.js 20 or later
- Git installed and configured
- GitHub repository access

## Deployment Steps

### 1. Install Dependencies

```bash
npm ci
```

### 2. Generate Static Site

```bash
npm run export
```

This creates a fully static version of the application in the `docs/` directory.

### 3. Commit and Push

```bash
git add docs
git commit -m "Export static site"
git push origin main
```

### 4. Configure GitHub Pages

1. Navigate to your repository on GitHub
2. Go to **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**

The workflow in `.github/workflows/deploy.yml` handles automatic deployment on push to `main`.

### 5. Access Your Site

After the workflow completes, the application is available at:

```
https://ignaciourbina.github.io/causal-flow/
```

## Updating the Deployment

Whenever you modify the application:

1. Make your changes
2. Run `npm run export`
3. Commit and push the updated `docs/` folder

The GitHub Actions workflow automatically redeploys the site.

## Custom Domain (Optional)

To use a custom domain:

1. Add a `CNAME` file to the `docs/` folder with your domain
2. Configure DNS settings with your domain provider
3. Enable HTTPS in GitHub Pages settings
