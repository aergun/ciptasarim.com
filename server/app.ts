/*
 * The Express application.
 *
 * ## Middleware order is the whole file
 *
 * The order below is not a style preference; each line depends on the one above it,
 * and the two mistakes worth naming are both order bugs:
 *
 *  1. **`trust proxy` is set first, because everything after it reads `req.ip`.**
 *     Behind Traefik every connection arrives from the proxy, so without this the
 *     rate limiter in `enquiries.ts` sees exactly one IP — the proxy's — and either
 *     rate-limits the entire site at once or, worse, never rate-limits anything
 *     because the bucket is shared. It is `1` rather than `true`: trusting every
 *     hop means any client can forge `X-Forwarded-For` and pick its own rate-limit
 *     bucket, which defeats the limiter entirely. One hop is the topology we deploy.
 *
 *  2. **`sessionMiddleware` and `attachUser` run before the routers**, because
 *     `requireAuth` reads `req.user`, and `attachUser` reads `req.session`. A route
 *     mounted before them would see neither — and would fail *open* if it treated
 *     `undefined` as "nobody" only by accident.
 *
 *  3. **The SPA fallback comes after `/api`, not before.** An unmatched `/api/...`
 *     must 404 as JSON, never as `index.html`. If the fallback ran first, a client
 *     that mistypes an endpoint would receive `200 text/html` where it expected JSON,
 *     and `res.json()` would surface it as a syntax error rather than as the missing
 *     endpoint it is.
 *
 * ## A 200 on an SPA path proves nothing
 *
 * `express.static` plus the fallback means every unknown path returns 200 with
 * `index.html`, because that is what a client-side router needs. The consequence is
 * that **you cannot verify a deploy by checking a page URL** — verify by fetching a
 * hashed asset under `/assets/` and confirming the `content-type` and the byte
 * count. This is recorded here because it has burned a deployment on the reference
 * project: `/journal` returned 200 whether or not any of it existed.
 *
 * ## `helmet` is not used
 *
 * There is no helmet dependency, and the CSP that matters is served by Traefik at
 * the edge. Adding a second, weaker policy here — one that does not know what the
 * bundled assets hash to — would be a policy that silently does nothing while looking
 * like one. The headers this app does set are the ones it can actually guarantee.
 */

import express from 'express'
import cookieParser from 'cookie-parser'
import { existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import type { Express, NextFunction, Request, Response } from 'express'
import { ROOT, getDb } from './db.ts'
import { errorHandler, handler, notFound } from './http.ts'
import { attachUser, sessionMiddleware } from './auth.ts'
import { authRouter } from './routes/auth.ts'
import { catalogueRouter } from './routes/catalogue.ts'
import { postEnquiry } from './routes/enquiries.ts'
import { libraryRouter } from './routes/library.ts'
import { ordersRouter } from './routes/orders.ts'

export function createApp(): Express {
  const app = express()
  const prod = process.env.NODE_ENV === 'production'

  /*
   * One proxy hop. See note 1 at the top of the file.
   */
  app.set('trust proxy', 1)
  app.disable('x-powered-by')

  /*
   * A body cap on every route.
   *
   * There are no uploads on this site — no attachments, no licence files posted up,
   * only JSON — so 100 kB is generous by an order of magnitude and there is no
   * multer in this server at all. The reference project accepts file attachments on
   * its enquiry form, which is why it needs a disk-backed destination directory and
   * careful exclusion from Docker context; this one has none of that surface.
   */
  app.use(express.json({ limit: '100kb' }))

  /*
   * Reject a body that is not JSON, as a 400 from our own error handler.
   *
   * Express's body parser raises a SyntaxError with a `status`, and
   * `errorHandler` flattens anything that is not an `ApiError` to a generic 500 —
   * which would report a client's malformed JSON as our fault. This normalises it so
   * the client sees a 400 with a message it can act on.
   */
  app.use((error: unknown, _req: Request, res: Response, next: NextFunction) => {
    const type = error && typeof error === 'object' ? (error as { type?: string }).type : undefined
    if (type === 'entity.parse.failed') {
      res.status(400).json({ error: 'That request was not valid JSON.' })
      return
    }
    next(error)
  })

  app.use(cookieParser())

  /*
   * Headers this app can actually honour.
   *
   * `nosniff` matters most on the download route, which serves `application/octet-stream`
   * from a path outside `public/` — without it a browser may sniff the contents of a
   * GDSII file and render it as something executable-adjacent. `Referrer-Policy` is
   * set because the catalogue URLs carry core slugs and a download path carries a
   * document key, neither of which should leak to a third-party analytics host.
   *
   * `X-Frame-Options: DENY` is the clickjacking guard. There is nothing here worth
   * framing, and a supplier site is a plausible link target in a phishing mail.
   */
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
    res.setHeader('X-Frame-Options', 'DENY')
    next()
  })

  app.use(sessionMiddleware)
  app.use(attachUser)

  // -------------------------------------------------------------------------
  // Health
  // -------------------------------------------------------------------------

  /*
   * `/api/health` — the probe the deploy and the smoke suite both use.
   *
   * It touches the database, because "the process is up" and "the process can serve
   * orders" are different claims and a health check that only proves the first one
   * will pass on a server whose data directory has vanished.
   *
   * `getDb()` opens and migrates on first call, so this also surfaces a bad
   * `DATABASE_PATH` or a missing `SESSION_SECRET` (which throws at import time, i.e.
   * before the server ever binds — a boot failure, not a 500, which is the correct
   * shape for it).
   */
  app.get(
    '/api/health',
    handler((_req, res) => {
      const db = getDb()
      db.prepare<[], { n: number }>(`SELECT COUNT(*) AS n FROM users`).get()
      res.json({
        ok: true,
        env: prod ? 'production' : 'development',
        payment: 'bank-transfer',
      })
    }),
  )

  // -------------------------------------------------------------------------
  // API
  // -------------------------------------------------------------------------

  app.use('/api/auth', authRouter)
  app.use('/api/catalogue', catalogueRouter)
  app.use('/api/orders', ordersRouter)
  app.use('/api/library', libraryRouter)

  /*
   * Only the POST is mounted, and by handler, not by router.
   *
   * `enquiriesRouter` also has a GET that returns every enquiry in the table —
   * customer names, companies and requirements. Mounting the router wholesale would
   * publish it, and mounting by `app.post(path, router)` is broken under Express 5
   * (the path is not stripped, so the router's own `/` route never matches) — so the
   * POST is mounted as its standalone handler and the GET is left unmounted. The
   * inbox is read from the command line; see the note in `routes/enquiries.ts`.
   */
  app.post('/api/enquiries', postEnquiry)

  /*
   * Anything else under `/api` is a 404 as JSON.
   *
   * This runs *before* the SPA fallback on purpose — see note 3 at the top of the
   * file. A mistyped endpoint that returned the HTML shell would surface in the
   * client as a parse error at the least obvious possible moment.
   */
  app.use('/api', notFound)

  // -------------------------------------------------------------------------
  // Static assets and the SPA
  // -------------------------------------------------------------------------

  const distDir = resolve(ROOT, 'dist')

  /*
   * `index: false` on the static handler.
   *
   * With it on, a request for `/` is answered by `express.static` from disk and the
   * fallback below never runs — which means `/` and `/en` would be served from one
   * cached copy while every other route renders client-side. Off, `/` falls through
   * to the same explicit `index.html` send the fallback uses, so there is exactly
   * one code path that returns the shell.
   *
   * `immutable` on the hashed assets only. Vite fingerprints everything under
   * `/assets/`, so its URL changes whenever its content does and a long cache is
   * correct — and is the reason an asset's byte count is a reliable deploy check.
   */
  app.use(
    express.static(distDir, {
      index: false,
      maxAge: '1h',
      setHeaders: (res, filePath) => {
        // Vite fingerprints everything under dist/assets, so a separator-agnostic
        // match is right on both platforms rather than assuming a POSIX join.
        if (/[\\/]assets[\\/]/.test(filePath)) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
        }
      },
    }),
  )

  /*
   * The SPA fallback.
   *
   * `index.html` is sent with `no-cache` rather than a long max-age, because the
   * hashed asset names it points at change on every deploy and a cached shell would
   * keep requesting asset URLs that no longer exist. The shell must be revalidated;
   * the assets must not be.
   *
   * In development `dist/` does not exist — Vite serves the client from its own dev
   * server on 5173 and proxies `/api` here — so the fallback is skipped rather than
   * 404ing. That is why `npm run dev` works before the first `npm run build`.
   */
  const indexHtml = join(distDir, 'index.html')

  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      next()
      return
    }
    if (!existsSync(indexHtml)) {
      next()
      return
    }
    res.setHeader('Cache-Control', 'no-cache')
    res.sendFile(indexHtml)
  })

  // Nothing at all matched: a real 404 for a non-SPA request (a bad asset path, say).
  app.use((_req, res) => {
    res.status(404).type('text/plain').send('Not found')
  })

  app.use(errorHandler)

  return app
}
