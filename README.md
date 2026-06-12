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
├── netlify.toml        # deploy config
└── README.md
```

## Preview it locally

Any static server works. The simplest:

```bash
cd website
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploy to Netlify via GitHub

1. **Create the repo and push** (run from inside `website/`):
   ```bash
   cd website
   git init
   git add .
   git commit -m "From Atoms to Agents — PhD journey site"
   git branch -M main
   git remote add origin https://github.com/<your-username>/atoms-to-agents.git
   git push -u origin main
   ```

2. **Connect to Netlify**
   - Go to https://app.netlify.com → **Add new site → Import an existing project**
   - Pick GitHub and select the repo.
   - **Build command:** leave empty. **Publish directory:** `.` (already set in `netlify.toml`).
   - Click **Deploy**. You get a `*.netlify.app` URL in under a minute.

3. **Custom domain (optional):** Site settings → Domain management → add your own domain.

> Tip: if you'd rather not push the whole repo first, you can drag-and-drop the
> `website/` folder straight onto the Netlify dashboard for an instant deploy.

## Editing

- Prose lives directly in each `chapterN.html` — search for the text and edit it.
- Colours and layout are all in `css/style.css` (CSS variables at the top).
- To swap a figure, drop a new file into `assets/img/` with the same name.

## A note on unpublished work

Chapters 1 (Part II), 2 (Γ), 3, 4 and 5 contain work that is under review or in
progress. Their pages describe the ideas and headline results but deliberately avoid
posting unpublished draft figures. Re-check before each public deploy.
