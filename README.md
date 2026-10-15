# From Atoms to Agents

My PhD journey, told one chapter at a time — from the electronic structure of titanium
to an AI agent that runs multiscale materials simulations.

**Md Faiz Akhtar** · Materials Science & Engineering, IIT Kanpur

A plain HTML/CSS/JS static site. No build step, no dependencies.

```
website/
├── index.html          # landing page — hero, thesis timeline, agents, research, news, papers
├── agents.html         # AI agents — TiSci, ICME-lite, ICME Agent, SciAgent, LLM benchmarks
├── research.html       # work beyond the thesis — MACE/HEA, GB sliding, magnetic audit, MXenes, COMPASS, more
├── about.html          # CV page — education, experience, filterable publications, talks, skills
├── chapter1.html       # Strength   — Φ_eff interstitial strengthening (+ SRO)
├── chapter2.html       # Direction  — R* and Γ slip-system descriptors
├── chapter3.html       # Chemistry  — COMPASS orbital descriptors
├── chapter4.html       # Real metal — DFT→MD→DAMASK ICME + cryogenic experiment
├── chapter5.html       # Automation — the multi-agent ICME framework
├── css/style.css       # the whole design system
├── js/main.js          # reveal, counters, tabs, typing terminals, filters, TOC scrollspy, hero canvas
├── assets/img/         # the figures (compressed for web)
├── assets/Md_Faiz_Akhtar_CV.pdf  # the CV linked from every page
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

- Prose lives directly in each `.html` file — search for the text and edit it.
- Reusable pieces (cards, KPI tiles, bar charts `.mbar`, rings `.ring`, tabs, terminals
  `.term`, the side TOC `.toc`) are plain classes in `css/style.css`; copy an existing
  block to add a new one. Animated numbers use `data-count` and keep the real value in
  the HTML, so they still read correctly without JavaScript.
- Colours and layout are all in `css/style.css` (CSS variables at the top).
- To swap a figure, drop a new file into `assets/img/` with the same name.

## A note on unpublished work

Chapters 1 (Part II), 2 (Γ), 3, 4 and 5, most of `agents.html` and most of
`research.html` describe work that is in preparation or in progress, much of it with
collaborators. Their pages describe the ideas and headline results but deliberately avoid
posting unpublished draft figures; charts there are drawn from the numbers. Re-check before each public deploy.
