# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Deploying to GitHub Pages

To generate the static site used by GitHub Pages run:

```bash
npm run export
```

The exported site will be written to the `docs` folder which is ready to be served by GitHub Pages.

A GitHub Actions workflow automatically builds and deploys the site when changes
are pushed to the `main` branch. The workflow is defined in
`.github/workflows/deploy.yml`.
