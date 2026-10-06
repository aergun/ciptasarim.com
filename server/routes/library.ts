/*
 * Downloads.
 *
 * This is the route that matters most in the whole server, and every property of it
 * exists to answer one question: **can a stranger obtain a licensed deliverable?**
 *
 * For an IP vendor the stakes are higher than for a site selling anything else. The
 * GDSII *is* the hard macro — it is the product, and a copy of it is the business.
 * The RTL bundle is the design. "Someone guessed a URL" is not a broken link here; it
 * is the core given away.
 *
 * So there are four independent barriers, and the route is written so that removing
 * any one of them still leaves the others:
 *
 *  1. **The files are outside `public/`.** Vite never copies them into `dist/`, so
 *     there is no static route to them at all. They live in `FILES_DIR`.
 *
 *  2. **The owner is in the `WHERE` clause.** Not checked-then-fetched — *filtered*.
 *     Another account's file is not found, and the response cannot distinguish it
 *     from a file that does not exist (see below).
 *
 *  3. **The path is resolved inside `FILES_DIR` with a containment check.** A
 *     `path` in content is author-controlled, but a path is still a string and
 *     `../../../etc/passwd` resolves outside the directory. `resolveInside()`
 *     refuses it.
 *
 *  4. **`Cache-Control: private, no-store`.** The file is per-customer. A shared
 *     proxy or a browser cache holding a licensed deliverable is the same failure as
 *     serving it to the wrong person, later.
 *
 * ## Why a missing file is 404 and another account's file is also 404
 *
 * A 403 would confirm the file exists. That makes this endpoint an oracle: a stranger
 * can distinguish "this key is real and belongs to someone" from "this key is
 * invented", which is exactly the signal an attacker enumerates for. Both cases
 * return the same body.
 *
 * The `Content-Disposition` header is built by `contentDisposition()` in
 * `shared/i18n.ts`, which keeps Turkish characters intact via RFC 5987
 * `filename*=UTF-8''`. This matters *more* on a Turkish-primary site, not less:
 * almost every filename here contains a `ş` or `ı`, so the ASCII `filename=` fallback
 * is a mangled duplicate rather than a working alternative. The reference project's
 * sanitiser used `/[^\w-]/g`, which is ASCII-only and strips a Turkish name to
 * **empty** — producing `-uart-fifo.gds`.
 */

import { createReadStream, existsSync, statSync } from 'node:fs'
import { resolve, sep } from 'node:path'
import { Router } from 'express'
import type { Response } from 'express'
import { FILES_DIR, getDb } from '../db.ts'
import type { EntitlementRow } from '../db-types.ts'
import { handler, lookup, notFound, param } from '../http.ts'
import { requireAuth } from '../auth.ts'
import { contentDisposition, parseLocale } from '../../shared/i18n.ts'
import { coreFor } from '../../content/cores.ts'
import { bundleManifestFor, manifestFor } from '../../content/documents.ts'
import { BUNDLE_KINDS, LICENSE_TIERS } from '../../shared/types.ts'
import { bundleFor } from '../../content/packages.ts'

export const libraryRouter: Router = Router()

/**
 * Resolves `relative` inside `FILES_DIR`, or returns `null` if it escapes.
 *
 * The check is on the **resolved** path rather than on the input string, which is
 * what makes it work: `%2e%2e%2f`, `..%2F`, and a bare `..` all resolve to the same
 * thing, so a check written against the raw string can be written past. `startsWith`
 * is tested against `dir + sep` so a sibling directory named `files-evil` cannot pass
 * as `files` — the classic prefix-match bug.
 */
function resolveInside(dir: string, relative: string): string | null {
  // An absolute path is never acceptable here: `path` in content is documented as
  // relative to FILES_DIR, so a leading `/` means the content is wrong, not that we
  // should honour it.
  if (!relative || relative.startsWith('/') || relative.includes('\0')) return null

  const target = resolve(dir, relative)
  const prefix = dir.endsWith(sep) ? dir : dir + sep
  return target.startsWith(prefix) ? target : null
}

/**
 * `GET /api/library` — what this account is entitled to download.
 *
 * Resolved from `entitlements`, and the files themselves are looked up in the
 * *current* catalogue rather than snapshotted at purchase. A manifest correction
 * therefore applies to orders already placed, and a buyer is never pointed at a file
 * the manifest no longer lists.
 */
libraryRouter.get(
  '/',
  requireAuth,
  handler((req, res) => {
    const rows = getDb()
      .prepare<[string], EntitlementRow>(
        `SELECT * FROM entitlements WHERE user_id = ? ORDER BY granted_at DESC`,
      )
      .all(req.user!.id)

    const items = rows.flatMap((row) => {
      const core = coreFor(row.core_slug)
      if (!core) return []
      // A granted bundle/tier that the catalogue no longer has is still a grant; it
      // simply resolves to no files, which is honest rather than an error.
      const bundle = lookup(row.bundle, BUNDLE_KINDS)
      const tier = lookup(row.tier, LICENSE_TIERS)
      if (!bundle || !tier) return []

      const resolved = bundleFor(bundle)
      if (!resolved) return []
      const files = bundleManifestFor(core, tier, resolved)

      return [
        {
          coreSlug: core.slug,
          coreName: core.name,
          bundle,
          tier,
          grantedAt: row.granted_at,
          files: files.map((f) => ({ key: f.key, label: f.label, format: f.format, sizeKb: f.sizeKb, version: f.version })),
        },
      ]
    })

    res.json({ items })
  }),
)

/**
 * `GET /api/library/:coreSlug/:key` — download one file.
 *
 * The ownership filter and the entitlement filter are **one query**, so there is no
 * window between "check" and "read" and no path where a row is checked for one user
 * and a file served for another.
 */
libraryRouter.get(
  '/:coreSlug/:key',
  requireAuth,
  handler((req, res) => {
    const coreSlug = param(req, 'coreSlug')
    const key = param(req, 'key')

    const core = coreFor(coreSlug)
    if (!core) {
      notFound(req, res)
      return
    }

    /*
     * Entitlement is checked for the *session's* user id only.
     *
     * `req.user` was resolved from a signed cookie, so the id here is not
     * client-supplied in any meaningful sense. It is still never taken from a
     * parameter or a query string — that would be the entire vulnerability.
     */
    const granted = (getDb()
      .prepare<[string, string], EntitlementRow>(
        `SELECT * FROM entitlements WHERE user_id = ? AND core_slug = ?`,
      )
      .all(req.user!.id, coreSlug) ?? []).filter((row) => {
      const tier = lookup(row.tier, LICENSE_TIERS)
      return tier !== null && manifestFor(core, tier).some((f) => f.key === key)
    })

    if (granted.length === 0) {
      // Same answer as an unknown core, an unknown key and an unentitled user.
      notFound(req, res)
      return
    }

    const tier = lookup(granted[0]!.tier, LICENSE_TIERS)!
    const file = manifestFor(core, tier).find((f) => f.key === key)!

    const absolute = resolveInside(FILES_DIR, file.path)
    if (!absolute) {
      // The manifest names a path outside FILES_DIR. That is a content bug, and it
      // is reported as a server error rather than a 404 — the difference between
      // "no such file" and "the file is somewhere it must not be" is worth keeping.
      console.error(`[library] ${coreSlug}/${key} resolves outside FILES_DIR: ${file.path}`)
      res.status(500).json({ error: 'That file is misconfigured.' })
      return
    }

    if (!existsSync(absolute) || !statSync(absolute).isFile()) {
      notFound(req, res)
      return
    }

    /*
     * The filename is rendered in the buyer's own locale.
     *
     * `label` is a `T`, so picking one language arbitrarily would hand a Turkish
     * buyer an English filename and an English buyer a Turkish one. The locale comes
     * from `Accept-Language` via `parseLocale`, which is the only locale signal a
     * download request has — the SPA's `/en` prefix is client-side routing and does
     * not reach this route.
     */
    const locale = parseLocale(req.get('Accept-Language'))
    streamFile(res, absolute, `${core.name} ${file.label[locale]}`)
  }),
)

/**
 * Streams a file with the headers a licensed deliverable needs.
 *
 * `no-store` rather than `private`: this is a purchased artefact with a customer's
 * company name on it, and a cached copy on a shared machine is the same disclosure as
 * serving it to the wrong person.
 */
function streamFile(res: Response, absolute: string, filename: string): void {
  res.setHeader('Content-Type', 'application/octet-stream')
  res.setHeader('Content-Disposition', contentDisposition(filename))
  res.setHeader('Cache-Control', 'private, no-store')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  createReadStream(absolute).pipe(res)
}
