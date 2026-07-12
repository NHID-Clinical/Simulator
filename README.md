# Training

This repository contains the static Zero Latency NHID Training landing page.

## View locally

Open `index.html` directly in a browser, or serve the folder locally:

```bash
python3 -m http.server 8000
```

Then visit <http://127.0.0.1:8000/index.html>.

## Publish on GitHub Pages

The `.github/workflows/pages.yml` workflow deploys the repository root as a static GitHub Pages site whenever the `work` or `main` branch is pushed. After the workflow completes, open the deployment URL shown in the workflow summary.
