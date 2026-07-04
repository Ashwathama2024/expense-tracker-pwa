# Expense Tracker

A personal, installable expense-tracking PWA. Next.js (App Router) + Dexie
(IndexedDB) for local-only storage, Tailwind + shadcn-style components,
Framer Motion, Recharts, and client-side OpenAI vision for receipt parsing.

All data stays on-device (IndexedDB) — there is no backend/server and no
account system, just a local PIN gate.

## Getting started

```bash
npm install
cp .env.local.example .env.local   # then fill in NEXT_PUBLIC_OPENAI_API_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Receipt scanning
(camera icon on the add-expense form) needs an OpenAI API key with access to
`gpt-5-nano`; without one, everything else works and that feature just
surfaces a toast telling you the key is missing.

## Deploying (GitHub Pages / Cloudflare Pages)

This app builds to a static export (`output: "export"` in `next.config.ts`)
so it can be hosted on any static, HTTPS host — required for the service
worker and "Install app" support.

```bash
npm run build   # outputs static files to ./out
```

**Cloudflare Pages**: point it at this repo, build command `npm run build`,
output directory `out`. No extra config needed.

**GitHub Pages**: a workflow at `.github/workflows/deploy.yml` builds and
deploys automatically on every push to `main` (or via manual "Run workflow"
in the Actions tab). It sets `NEXT_PUBLIC_BASE_PATH=/expense-tracker-pwa`
since this is a project site — enable it once under repo Settings → Pages →
Source → "GitHub Actions". Live at:
**https://ashwathama2024.github.io/expense-tracker-pwa/**

To enable receipt scanning on the deployed site, add a repo secret named
`OPENAI_API_KEY` (Settings → Secrets and variables → Actions) — the workflow
passes it through as `NEXT_PUBLIC_OPENAI_API_KEY` at build time.

After deploying, open the site in Chrome on a phone — it should offer
"Install app" / "Add to Home Screen". First open will ask you to set a PIN.

## Security note

The OpenAI key is a `NEXT_PUBLIC_*` env var, which means it's bundled into
the client JS and visible in devtools/network requests. That's an accepted
tradeoff for a client-only, single-user tool — see the comment in
`.env.local.example` and `src/lib/openai.ts`. Don't reuse this pattern for
anything multi-user.
