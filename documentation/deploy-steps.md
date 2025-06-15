# Deployment Steps for GitHub Pages

This guide explains how to publish the static build of **CausalFlow** to GitHub Pages so that it appears under `ignaciourbina.github.io`.

1. **Install dependencies**
   ```bash
   npm ci
   ```
   Make sure you have Node.js installed. The command above installs all packages in a reproducible way.

2. **Generate the static site**
   ```bash
   npm run export
   ```
   This runs `next export` and writes the output to the `docs` directory. The workflow in `.github/workflows/deploy.yml` expects the exported files in this folder.

3. **Commit the `docs` folder**
   ```bash
   git add docs
   git commit -m "Export static site"
   ```
   The exported site must be committed so the GitHub Pages workflow can deploy it.

4. **Push to GitHub**
   ```bash
   git push origin main
   ```
   Pushing to the `main` branch triggers the GitHub Actions workflow defined in `.github/workflows/deploy.yml`.

5. **Enable GitHub Pages**
   In your repository settings on GitHub, open **Pages** and choose **GitHub Actions** as the source. This allows the workflow to publish the site automatically.

6. **Access the site**
   After the workflow runs, your app will be available at:
   ```
   https://ignaciourbina.github.io/causal-flow/
   ```
   If you prefer to host it directly at `ignaciourbina.github.io`, you can rename this repository to `ignaciourbina.github.io` or move the contents to a repository with that name.
