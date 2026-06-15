# From Atoms to Agents

My PhD journey, told one chapter at a time — from the electronic structure of titanium
to an AI agent that runs multiscale materials simulations.

**Md Faiz Akhtar** · Materials Science & Engineering, IIT Kanpur

A plain HTML/CSS/JS static site. No build step, no dependencies.

```
website/
├── index.html          # the landing page — the journey overview + timeline
├── chapter1.html       # Strength   — Φ_eff interstitial strengthening (+ SRO)
├── chapter2.html       # Direction  — R* and Γ slip-system descriptors
├── chapter3.html       # Chemistry  — COMPASS orbital descriptors
├── chapter4.html       # Real metal — DFT→MD→DAMASK ICME + cryogenic experiment
├── chapter5.html       # Automation — the multi-agent ICME framework
├── css/style.css       # the whole design system
├── js/main.js          # scroll reveal, progress bar, mobile nav
├── assets/img/         # the figures (compressed for web)
├── .github/workflows/  # GitHub Pages deploy workflow
└── README.md
```

## Preview it locally

Any static server works. The simplest:

```bash
cd website
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploy via GitHub Pages

The site is deployed with GitHub Pages (Source = **GitHub Actions**); the workflow
is at `.github/workflows/deploy-pages.yml`. Every push to `main` rebuilds and
publishes automatically.

```bash
cd website
git add .
git commit -m "update site"
git push origin main      # → auto-deploys
```

Live at **https://akhtar07.github.io/atoms-to-agents/**.

One-time setup (already done): repo **Settings → Pages → Source → GitHub Actions**,
and **Settings → Actions → General → Workflow permissions → Read and write**.

## Editing

- Prose lives directly in each `chapterN.html` — search for the text and edit it.
- Colours and layout are all in `css/style.css` (CSS variables at the top).
- To swap a figure, drop a new file into `assets/img/` with the same name.

## A note on unpublished work

Chapters 1 (Part II), 2 (Γ), 3, 4 and 5 contain work that is under review or in
progress. Their pages describe the ideas and headline results but deliberately avoid
posting unpublished draft figures. Re-check before each public deploy.
