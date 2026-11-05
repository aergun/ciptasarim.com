# ciptasarim.com

Turkish-first bilingual (TR/EN) semiconductor IP catalogue for ciptasarim.com:
verified RTL cores, standard-cell macros, analog IP, verification collateral, licensing,
delivery packages and engineering calculators.

Turkish is the source of truth: every bilingual field is a `T = { tr, en }` pair, TR
authored first, EN derived faithfully from it. **Slugs are never translated.**

## Run

```bash
npm run dev          # Vite :5173 + tsx watch API :4000
npm run build        # typecheck (tsconfig + tsconfig.server) && vite build
npm start            # tsx server/index.ts --prod  (production entrypoint)
```

Node >= 22 required (`engines`). `better-sqlite3@13` compiles via node-gyp (python3 +
build-essential); the Dockerfile handles this for deploys.

## Verify

```bash
npm run smoke            # 105-check in-process suite (boots the real Express app)
npm run verify:figures   # 423 checks: article/tool figure + spec blocks
npm run verify:i18n      # 72 checks: en/tr structure parity
npm run verify:catalogue # 984 checks: cores, processes, provenance rules
npm run verify:engineering # 139 checks: calculator models
BASE=http://127.0.0.1:4100 npx tsx scripts/check-links.ts  # broken links (server booted on :4100)
```

## Architecture (short version)

- **Express 5 + better-sqlite3, run from source via tsx.** Boot order matters in
  `server/index.ts`: resolve `--prod` → NODE_ENV → `getDb()` → dynamic-import `app.ts`.
- **The SPA fallback is the only path that serves the shell** and rewrites the `<head>`
  per request, per locale (`server/head.ts`): title, description, canonical, hreflang,
  OG/Twitter, JSON-LD (Organization/WebSite/Product/Article). `server/sitemap.ts`
  generates `sitemap.xml` and `robots.txt` from the content tables. gzip via
  `compression`; hashed assets immutable, fonts/media one-year cache.
- **Env**: `SESSION_SECRET` (required in prod), `DATABASE_PATH`, `FILES_DIR`, `PORT`,
  `HOST`.
- **Content is data** under `content/` (cores, tools, articles, licences, packages,
  runlog); locale strings in `locales/tr.ts` + `locales/en.ts` (mirror-checked);
  engineering models in `shared/engineering.ts`; pricing in `shared/pricing.ts`.
- **Design system**: dark instrumentation, tokens in `tailwind.config.js`, reusable
  classes in `src/index.css`, scroll-reveal via `Reveal.tsx`, gate-paused run-log via
  `RunTerminal.tsx` + `content/runlog.ts`. See `DESIGN_NOTES.md` for the design-layer
  record, the reference-site decisions, and the Lighthouse/a11y record.

## Deploy

Coolify on 192.255.230.175, app `lp0jxgftxia3jukiba13lnw8`, project `ciptasarim`. Pushes
to `main` auto-deploy. `Dockerfile` is a two-stage build (toolchain → runtime; tsx runs
the server from source in the runtime image). Persistent volumes: `/app/data` (SQLite)
and `/app/server/files` (licence files; kept out of git by `.gitignore`).

Verification after a deploy: fetch a hashed asset under `/assets/` and check its byte
count changes — **a 200 on a page URL proves nothing** (the SPA fallback answers 200 for
any path).
