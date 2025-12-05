# Deploying CausalFlow to Hugging Face Spaces

This guide covers deploying CausalFlow to [Hugging Face Spaces](https://huggingface.co/spaces), a platform popular in the machine learning and research community for hosting interactive applications.

## Why Hugging Face Spaces?

- **Research community** – High visibility among ML/AI researchers
- **Free static hosting** – No server costs for static applications
- **Easy sharing** – Simple URLs for collaborators and reviewers

## Prerequisites

1. [Hugging Face account](https://huggingface.co/join)
2. Node.js 20+
3. Git
4. Hugging Face CLI: `pip install -U "huggingface_hub[cli]"`

## Quick Start

### 1. Authenticate with Hugging Face

```bash
huggingface-cli login
```

Generate a token at <https://huggingface.co/settings/tokens> if needed.

### 2. Build the Static Site

```bash
npm ci
npm run export
```

### 3. Create a New Space

1. Go to <https://huggingface.co/spaces>
2. Click **New Space**
3. Select **Static** as the SDK
4. Name your Space (e.g., `causal-flow`)
5. Click **Create Space**

### 4. Deploy

```bash
# Clone the Space repository
git clone https://huggingface.co/spaces/<username>/causal-flow
cd causal-flow

# Copy the built files
cp -r ../path-to-project/docs/* .

# Push to deploy
git add .
git commit -m "Deploy CausalFlow"
git push
```

### 5. Access

Your application will be live at:
```
https://huggingface.co/spaces/<username>/causal-flow
```

## Updating

1. Run `npm run export` in the main project
2. Copy updated `docs/` contents to the Space repository
3. Commit and push

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 404 error | Ensure `index.html` exists at repository root |
| Build fails | Check Space "Build logs" tab for errors |
| Auth expired | Run `huggingface-cli login` again |
