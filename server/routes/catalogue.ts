/*
 * Core catalogue reads.
 *
 * Read-only, and the reason these routes exist at all is worth stating: the
 * catalogue is *content*, in `content/*.ts`. It is not in the database and it is
 * not editable by anything that can reach one. These routes expose it to the client
 * so the SPA can render it, which means every response here carries figures whose
 * basis the client must respect — see the `Figure` union in `shared/types.ts`.
 *
 * ## Why the whole catalogue is sent and not paged
 *
 * It is five cores. Paging it would add a cursor, a total count and a loading state
 * to a list that fits on one screen, in exchange for nothing — and it would make
 * "compare" need a second request per core, on a site whose entire comparison
 * surface is one kind-filtered table.
 *
 * ## What is deliberately absent from these responses
 *
 * Price is **not** included. `priceFor()` returns `null` for any core with no
 * authored price, and every core currently has none, so every price on this site
 * is `null` rather than `0`. That distinction is the point: `0` is a number a
 * buyer would take as free, and "not yet published" is a fact about our catalogue.
 */

import { Router } from 'express'
import type { Core, ProcessNode } from '../../shared/types.ts'
import { BUNDLE_KINDS, LICENSE_TIERS, PROCESS_NODES } from '../../shared/types.ts'
import { handler, lookup, notFound, param } from '../http.ts'
import { cores, coreFor } from '../../content/cores.ts'
import { processes, processFor } from '../../content/processes.ts'
import { licences, licenceFor } from '../../content/licences.ts'
import { bundles, bundleFor } from '../../content/packages.ts'
import { entryBundleSlug } from '../../content/packages.ts'
import { priceFor } from '../../shared/pricing.ts'

export const catalogueRouter: Router = Router()

/** Every core, in catalogue order. */
catalogueRouter.get(
  '/cores',
  handler((_req, res) => {
    res.json({ cores: cores.map(shapeForList) })
  }),
)

/** One core by slug, including its ports and full spec. */
catalogueRouter.get(
  '/cores/:slug',
  handler((req, res) => {
    const core = coreFor(param(req, 'slug'))
    if (!core) {
      notFound(req, res)
      return
    }
    res.json({ core })
  }),
)

/**
 * `/processes` — the whole node table, 180 nm to 2 nm.
 *
 * Every cell is currently `uncharacterised`, so this response is mostly `reason`
 * strings. That is the honest payload: a client that renders it correctly shows a
 * reader exactly what is missing, and one that renders it naively shows a table of
 * nothing, which is at least not a table of lies.
 */
catalogueRouter.get(
  '/processes',
  handler((_req, res) => {
    res.json({ processes, nodes: PROCESS_NODES })
  }),
)

catalogueRouter.get(
  '/processes/:node',
  handler((req, res) => {
    const row = processFor(param(req, 'node'))
    if (!row) {
      notFound(req, res)
      return
    }
    res.json({ process: row })
  }),
)

catalogueRouter.get(
  '/licences',
  handler((_req, res) => {
    res.json({ licences, tiers: licences.map((l) => l.id) })
  }),
)

catalogueRouter.get(
  '/licences/:id',
  handler((req, res) => {
    const licence = licenceFor(param(req, 'id'))
    if (!licence) {
      notFound(req, res)
      return
    }
    res.json({ licence })
  }),
)

catalogueRouter.get(
  '/bundles',
  handler((_req, res) => {
    res.json({ bundles })
  }),
)

catalogueRouter.get(
  '/bundles/:id',
  handler((req, res) => {
    const id = lookup(param(req, 'id'), BUNDLE_KINDS)
    const bundle = id ? bundleFor(id) : null
    if (!bundle) {
      notFound(req, res)
      return
    }
    res.json({ bundle })
  }),
)

/**
 * The price of one core at one tier, for one bundle.
 *
 * Present as a route because it is the one number that must never be trusted from
 * the client — but note that it is still *derived here*, from `content/`, and the
 * cart and order routes call the same `priceFor()` rather than accepting a total
 * from the body. Putting it behind an endpoint makes the derivation auditable; it
 * is not what keeps the server honest.
 */
catalogueRouter.get(
  '/cores/:slug/price',
  handler((req, res) => {
    const slug = param(req, 'slug')
    const core = coreFor(slug)
    if (!core) {
      notFound(req, res)
      return
    }

    /*
     * Both query values go through `lookup()` before they are used as an id.
     *
     * A cast would compile and would quietly treat `?bundle=rlt` as a valid bundle,
     * so the price came back for the entry bundle with no indication the query was
     * wrong. `lookup` returns `null` for anything not in the taxonomy, which is what
     * "no such bundle" actually means, and the response then reports the fallback
     * honestly rather than quoting a deliverable nobody asked for.
     */
    const tierId = lookup(req.query.tier, LICENSE_TIERS) ?? 'evaluation'
    const bundleId = lookup(req.query.bundle, BUNDLE_KINDS) ?? entryBundleSlug(slug)
    const licence = licenceFor(tierId)
    const resolved = bundleId ? bundleFor(bundleId) : null

    res.json({
      /*
       * `resolved?.id` rather than `resolved?.id ?? 'rtl'`.
       *
       * When the query named a bundle that does not exist, `bundleFor` returns null
       * and the honest answer is to fall back to the entry price — not to invent an
       * `rtl` price. `priceFor`'s bundle parameter is optional for exactly this case,
       * and an unrecognised bundle in a URL must not be able to produce a quote for
       * a different deliverable than the one asked for.
       */
      priceUsd: priceFor(core, licence?.id ?? 'evaluation', resolved?.id),
      tier: licence?.id ?? null,
      bundle: resolved?.id ?? null,
    })
  }),
)

/**
 * A core as sent in a list.
 *
 * The full `Core` is deliberately *not* sent here: `ports` and the entire spec
 * roughly triple the payload, and the grid does not render them. The detail route
 * has them. `figures` is included because the grid does show the headline spec, and
 * because it is the part carrying `basis` — a client that dropped it would render a
 * number with no way to know whether it was measured.
 */
function shapeForList(core: Core): Pick<Core, 'slug' | 'name' | 'family' | 'kind' | 'summary' | 'tags' | 'nodes' | 'figures'> & {
  priceUsd: number | null
  entryBundle: string | null
} {
  const bundle = entryBundleSlug(core.slug)
  const resolved = bundle ? bundleFor(bundle) : null

  return {
    slug: core.slug,
    name: core.name,
    family: core.family,
    kind: core.kind,
    summary: core.summary,
    tags: core.tags,
    nodes: core.nodes,
    figures: core.figures,
    priceUsd: priceFor(core, 'production', resolved?.id),
    entryBundle: bundle,
  }
}

/** Re-exported so `app.ts` can validate a node without importing `types.ts` twice. */
export type { ProcessNode }
