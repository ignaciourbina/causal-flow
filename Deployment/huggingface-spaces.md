# Deploying CausalFlow to a Hugging Face Space

This guide provides a comprehensive checklist to publish the static build of CausalFlow on [Hugging Face Spaces](https://huggingface.co/spaces). Every step is included so you can reproduce the deployment from a clean environment.

## 1. Prerequisites

1. **Create a Hugging Face account** if you do not already have one: <https://huggingface.co/join>.
2. **Install Git** and ensure it is available on your command line.
3. **Install Node.js 20** (or newer) because the project depends on it. The easiest way is to use [Node Version Manager](https://github.com/nvm-sh/nvm):
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
   source ~/.nvm/nvm.sh
   nvm install 20
   ```
4. **Install the Hugging Face Hub CLI** which allows you to authenticate and push to Spaces:
   ```bash
   pip install -U "huggingface_hub[cli]"
   ```
5. **Authenticate** with Hugging Face on the command line:
   ```bash
   huggingface-cli login
   ```
   Paste your access token when prompted. You can generate a token from <https://huggingface.co/settings/tokens>.

## 2. Prepare the project

1. **Clone** this repository if you haven't already:
   ```bash
   git clone https://github.com/your-user/causal-flow.git
   cd causal-flow
   ```
2. **Install project dependencies** in a clean, reproducible way:
   ```bash
   npm ci
   ```
3. **Export the static site**. This builds the Next.js project and writes the output to the `docs/` folder:
   ```bash
   npm run export
   ```
   After the command completes you should see an `index.html` and associated files under `docs/`.

## 3. Create the Space

1. In your browser, open <https://huggingface.co/spaces> and click **New Space**.
2. Choose **Static** as the Space SDK since the exported site is purely static.
3. Pick a **name** for the Space, for example `your-user/causal-flow`.
4. Decide whether the Space is **public or private** and choose a **license**. Click **Create Space** to finish.

A new, empty Git repository is now available at `https://huggingface.co/spaces/<username>/<space-name>`.

## 4. Upload the build

1. **Clone** the Space repository to your machine:
   ```bash
   git clone https://huggingface.co/spaces/<username>/<space-name>.git
   cd <space-name>
   ```
2. **Copy** the contents of the `docs/` directory from the project into the root of this repository:
   ```bash
   cp -r ../causal-flow/docs/* .
   ```
3. Optionally add a short `README.md` describing the project. The README is displayed on the Space page.
4. **Commit** the files and push them to Hugging Face:
   ```bash
   git add .
   git commit -m "Deploy static build of CausalFlow"
   git push
   ```
   Pushing triggers the deployment. Static Spaces do not require any further configuration.

## 5. Access your app

Once the push completes, Hugging Face automatically serves the contents at:
```
https://huggingface.co/spaces/<username>/<space-name>
```
If everything went well you should see the CausalFlow interface.

## 6. Updating the Space

Whenever you make changes to the project:
1. Run `npm run export` again to regenerate the `docs/` folder.
2. Copy the updated files to the Space repository.
3. Commit and push to publish the new version.

## Troubleshooting

- If the Space shows a 404 error, ensure that `index.html` exists at the repository root and that the build completed successfully.
- Check the "Build logs" tab on the Space page for error messages if deployment fails.
- Remember to run `huggingface-cli login` again if your credentials expire or if you use a new machine.

