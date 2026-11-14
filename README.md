# NHID-Clinical Simulator

An interactive training simulator for the [NHID-Clinical](https://nhid-clinical.org) framework. It puts
you at a payer's desk while an AI voice agent calls and asks for patient information, and teaches you
to check that the caller has said it is automated before any protected data is discussed.

**Live:** https://nhid-clinical.github.io/Simulator/

It is a learning tool. It is not the framework, not a certification, and its scores and dollar figures
are game scores, not legal estimates. The controls it demonstrates are defined in the
[NHID-Clinical repository](https://github.com/NHID-Clinical/NHID-Clinical).

## What is in it

| Page | What it does |
| --- | --- |
| `index.html` | Landing page, progress and module list |
| `zero-latency-module0.html` | Watch a call where the agent discloses too late (not scored) |
| `zero-latency-module1-v2.html` | Reply to an AI caller before patient data is requested |
| `zero-latency-module2.html` | Inspect an NHID-Auth passport token and reject forged claims |
| `zero-latency-module3.html` | Tag violations in call logs |
| `zero-latency-module4.html` | Order the steps of an agent so disclosure comes first |
| `nhid-knowledge-base.html` | Scenario cards, controls and audit fields used in the modules |
| `zero-latency-dashboard.html` | Your scores across modules |
| `simulator-record.html` | A printable completion record |

Progress is stored in your browser only. There is no account and no server.

## Run it locally

Static HTML, with no build step. Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

Then visit <http://127.0.0.1:8000/index.html>.

## Deployment

`.github/workflows/pages.yml` publishes the repository root to GitHub Pages when `main` or `work` is pushed.

## Author

Brianna Baynard · [LinkedIn](https://www.linkedin.com/in/brianna-baynard) · [NHID-Clinical](https://nhid-clinical.org)
