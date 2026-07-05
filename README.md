# Expense Tracker

A personal, installable expense-tracking PWA. Next.js (App Router) + Dexie
(IndexedDB) for local-only storage, Tailwind + shadcn-style components,
Framer Motion, Recharts, and client-side OpenAI vision for receipt parsing.

All data stays on-device (IndexedDB) — there is no backend/server and no
account system, just a local PIN gate.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Receipt scanning
(camera icon on the add-expense form) needs an OpenAI API key with access to
`gpt-5-nano` — tap the **key icon** at the top of the app and paste it in;
it's saved to this device's localStorage, no rebuild or redeploy needed.
Without one, everything else works and that button just surfaces a toast
telling you no key is set.

(`.env.local.example` / `NEXT_PUBLIC_OPENAI_API_KEY` still works as a
build-time fallback if you'd rather bake a key in — the in-app key takes
precedence when both are set.)

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

To enable receipt scanning, open the deployed site and tap the key icon in
the header — no rebuild needed. (A repo secret named `OPENAI_API_KEY` also
works as a build-time fallback if you prefer that instead.)

After deploying, open the site in Chrome on a phone — it should offer
"Install app" / "Add to Home Screen". First open will ask you to set a PIN.

## Security note

The OpenAI key, wherever it comes from (in-app Settings or a build-time
`NEXT_PUBLIC_*` env var), lives in the browser — visible in devtools/network
requests to anyone with access to this device. That's an accepted tradeoff
for a client-only, single-user tool — see the comments in `src/lib/openai.ts`
and `src/lib/settings.ts`. Don't reuse this pattern for anything multi-user.
