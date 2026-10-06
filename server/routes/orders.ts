/*
 * Orders: the B2B purchase flow.
 *
 * ## The flow is: submit, get a reference, pay by transfer, we confirm
 *
 * There is no card form, no gateway and no `ALLOW_MOCK_PAYMENTS` flag. A buyer
 * creates an order, receives a `CT-########` reference and bank details, and the
 * order sits in `awaiting_payment` until someone confirms receipt out of band.
 *
 * The status vocabulary is deliberately three states rather than a boolean:
 *
 * - `awaiting_payment` — the order exists and money has not arrived
 * - `payment_confirmed` — we received it, and entitlements now exist
 * - `cancelled`         — withdrawn, and explicitly *not* refunded
 *
 * `paid: boolean` cannot tell "we have not been paid yet" from "we declined it",
 * and that is a distinction a finance team needs before month end. The extra state
 * costs one string.
 *
 * ## The price is re-derived here, always
 *
 * **`order_items` stores no price column, and none can be added to it.** The client
 * sends slugs, bundle ids and tier ids; every monetary figure in the response is
 * computed by `priceFor()` from `content/` at read time. There is no code path that
 * reads a total from a request body, so there is no number for a client to tamper
 * with — not because the check was forgotten but because the field does not exist.
 *
 * That is the difference between deriving a number and validating one. A validation
 * check can be bypassed by a second code path added later; a missing column cannot.
 *
 * ## Ordering of the writes
 *
 * The order and its items are inserted in one `better-sqlite3` transaction. An
 * order with no lines is not a state the flow can produce, and it would be a
 * genuinely awkward row to find later.
 */

import crypto from 'node:crypto'
import { Router } from 'express'
import type { OrderItemRow, OrderRow } from '../db-types.ts'
import { getDb, now } from '../db.ts'
import { ApiError, handler, lookup, notFound, oneOf, optionalStr, param } from '../http.ts'
import { requireAuth } from '../auth.ts'
import { BUNDLE_KINDS, LICENSE_TIERS, type BundleKind, type LicenseTier } from '../../shared/types.ts'
import { coreFor } from '../../content/cores.ts'
import { LICENCE_QUANTITY, cartSubtotalUsd, lineTotalUsd, priceFor, type CartLine } from '../../shared/pricing.ts'

export const ordersRouter: Router = Router()

/** The three order states. Mirrors `OrderRow.status`; see the note at the top. */
export const ORDER_STATUSES = ['awaiting_payment', 'payment_confirmed', 'cancelled'] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

/**
 * A short, human-quotable reference: `CT-` then ten Crockford-ish base32 chars.
 *
 * Crockford's alphabet omits `I`, `L`, `O` and `U` so a reference read aloud or
 * copied off a screen cannot be mistyped into a different valid one. A customer
 * quoting `CT-0000000000` gets a clear "not found" rather than someone else's order.
 */
function newReference(): string {
  const alphabet = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'
  const bytes = crypto.randomBytes(10)
  let out = ''
  for (const b of bytes) out += alphabet[b % 32]
  return `CT-${out}`
}

/**
 * One order line, with its price re-derived from the catalogue.
 *
 * **The `unitPriceUsd` on the `CartLine` we build here is a placeholder and is never
 * read back.** `lineTotalUsd` is called only after `priceFor` has already returned a
 * real number, and `unpricedLines()` exists to detect the case where it did not. The
 * field is non-nullable on `CartLine` because the arithmetic in `shared/pricing.ts`
 * needs a number to do arithmetic on, not because it is authoritative — the
 * authoritative figure is the one `priceFor` computes.
 *
 * Every core currently has no authored price, so `priceFor` returns `null` for every
 * line and `priceUsd` is `null` in every response. That is carried through as
 * `null` all the way to the client rather than coerced to `0`, because `0` is the
 * one value a buyer would read as "free".
 */
function shapeLine(row: OrderItemRow): {
  coreSlug: string
  coreName: string
  bundle: BundleKind
  tier: LicenseTier
  priceUsd: number | null
  lineTotalUsd: number | null
} {
  const bundle = lookup(row.bundle, BUNDLE_KINDS)
  const tier = lookup(row.tier, LICENSE_TIERS)
  const core = coreFor(row.core_slug)

  // An order line whose identifiers no longer resolve is still listed — with its raw
  // slug and a null price — rather than dropped. Silently removing a line a customer
  // paid for is worse than showing one we cannot currently price.
  if (!core || !bundle || !tier) {
    return {
      coreSlug: row.core_slug,
      coreName: row.core_slug,
      bundle: (bundle ?? row.bundle) as BundleKind,
      tier: (tier ?? row.tier) as LicenseTier,
      priceUsd: null,
      lineTotalUsd: null,
    }
  }

  const price = priceFor(core, tier, bundle)
  const line: CartLine = { slug: core.slug, tier, bundle, unitPriceUsd: price ?? 0 }

  return {
    coreSlug: core.slug,
    coreName: core.name,
    bundle,
    tier,
    priceUsd: price,
    lineTotalUsd: price === null ? null : lineTotalUsd(line),
  }
}

/** Reads an order with its items, re-deriving every price. Never trusts a stored one. */
function readOrder(order: OrderRow, items: OrderItemRow[]) {
  const lines = items.map(shapeLine)

  /*
   * The subtotal is the sum of the lines that *can* be priced, and `null` when any
   * line cannot — not the sum of the priceable ones presented as a total.
   *
   * Summing the available subset would produce a real number that understates the
   * order, and a buyer would see a subtotal for a purchase that is not complete. A
   * null total with every line still listed says the honest thing: here are the items,
   * and here is why there is no figure yet.
   */
  const cartLines: CartLine[] = lines.flatMap((l) =>
    l.priceUsd === null ? [] : [{ slug: l.coreSlug, tier: l.tier, bundle: l.bundle, unitPriceUsd: l.priceUsd }],
  )
  const complete = lines.length > 0 && cartLines.length === lines.length

  return {
    id: order.id,
    reference: order.reference,
    // Narrowed from the plain string column; anything unrecognised is treated as
    // awaiting payment, which is the safe direction — it cannot grant access.
    status: (ORDER_STATUSES as readonly string[]).includes(order.status)
      ? (order.status as OrderStatus)
      : 'awaiting_payment',
    currency: order.currency,
    paidAt: order.paid_at,
    note: order.note,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    items: lines,
    subtotalUsd: complete ? cartSubtotalUsd(cartLines) : null,
  }
}

// ---------------------------------------------------------------------------
// Submit
// ---------------------------------------------------------------------------

/**
 * `POST /api/orders` — create an order from an explicit list of lines.
 *
 * The client sends identifiers only. Every line is validated against the catalogue
 * and re-priced here; an unknown slug, bundle or tier is a 400 rather than a line
 * that quietly contributes nothing to the total.
 */
ordersRouter.post(
  '/',
  requireAuth,
  handler((req, res) => {
    const raw = (req.body as { items?: unknown }).items
    if (!Array.isArray(raw) || raw.length === 0) {
      throw new ApiError(400, 'An order needs at least one item.')
    }
    if (raw.length > 50) {
      throw new ApiError(400, 'An order cannot contain more than 50 items.')
    }

    const lines: CartLine[] = raw.map((entry, index) => {
      const item = (entry ?? {}) as Record<string, unknown>
      const coreSlug = String(item.coreSlug ?? '')
      const bundle = lookup(item.bundle, BUNDLE_KINDS)
      const tier = lookup(item.tier, LICENSE_TIERS)

      if (!coreFor(coreSlug)) {
        throw new ApiError(400, `No such core: ${coreSlug || '(missing)'}`, { [`items.${index}.coreSlug`]: 'Unknown core.' })
      }
      if (!bundle) {
        throw new ApiError(400, 'Unknown bundle.', { [`items.${index}.bundle`]: 'Unknown bundle.' })
      }
      if (!tier) {
        throw new ApiError(400, 'Unknown licence tier.', { [`items.${index}.tier`]: 'Unknown tier.' })
      }

      /*
       * `quantity` is read and validated but never stored.
       *
       * An IP licence grants rights to one design, so there is no quantity to buy and
       * `LICENCE_QUANTITY` is 1. Accepting the field keeps a cart UI that sends it
       * working; the value is discarded rather than persisted, because storing a
       * number the domain says is meaningless is how it eventually gets multiplied by
       * something.
       */
      const requested = Number(item.quantity ?? LICENCE_QUANTITY)
      if (!Number.isInteger(requested) || requested < 1 || requested > 999) {
        throw new ApiError(400, 'Quantity must be between 1 and 999.', {
          [`items.${index}.quantity`]: 'Enter a quantity between 1 and 999.',
        })
      }

      return { slug: coreSlug, bundle, tier, unitPriceUsd: 0 }
    })

    const db = getDb()
    const timestamp = now()
    const orderId = crypto.randomUUID()
    let reference = newReference()

    /*
     * The uniqueness retry, done correctly.
     *
     * `COUNT(*)` returns a **row object** — `{ n: 0 }` — and an object is truthy even
     * when `n` is zero. Testing the result of `.get()` directly is therefore an
     * infinite loop on a freshly created database: it never finds a collision, never
     * stops, and re-prepares the statement on every iteration. The count itself has
     * to be read.
     *
     * The statement is also prepared once, outside the loop. Preparing per iteration
     * turns a rare retry into a leak, and the retry is rare precisely because the
     * reference has ten base32 characters of entropy — so the loop body should be
     * reachable only in the astronomically unlikely case it exists for.
     */
    const taken = db.prepare<[string], { n: number }>(`SELECT COUNT(*) AS n FROM orders WHERE reference = ?`)
    let attempt = 0
    while (taken.get(reference)!.n > 0) {
      if (++attempt > 5) {
        // Five collisions on 32^10 possibilities is not bad luck, it is a broken
        // random source. Failing loudly beats spinning and holding the write lock.
        throw new ApiError(500, 'Could not allocate an order reference. Please try again.')
      }
      reference = newReference()
    }

    const insertOrder = db.prepare(
      `INSERT INTO orders (id, user_id, reference, status, currency, paid_at, note, created_at, updated_at)
       VALUES (?, ?, ?, 'awaiting_payment', 'USD', NULL, ?, ?, ?)`,
    )
    const insertItem = db.prepare(
      `INSERT INTO order_items (id, order_id, core_slug, bundle, tier, quantity) VALUES (?, ?, ?, ?, ?, ?)`,
    )

    const write = db.transaction(() => {
      insertOrder.run(orderId, req.user!.id, reference, optionalStr(req.body.note, 500), timestamp, timestamp)
      for (const line of lines) {
        insertItem.run(crypto.randomUUID(), orderId, line.slug, line.bundle, line.tier, LICENCE_QUANTITY)
      }
    })
    write()

    // A priced copy is returned so the buyer sees exactly what was ordered and at
    // what derived figure, before anything is sent.
    const order = db.prepare<[string], OrderRow>(`SELECT * FROM orders WHERE id = ?`).get(orderId)!
    const items = db
      .prepare<[string], OrderItemRow>(`SELECT * FROM order_items WHERE order_id = ?`)
      .all(orderId)

    res.status(201).json({ order: readOrder(order, items) })
  }),
)

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

/** The signed-in buyer's own orders. */
ordersRouter.get(
  '/',
  requireAuth,
  handler((req, res) => {
    const rows = getDb()
      .prepare<[string], OrderRow>(`SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`)
      .all(req.user!.id)

    const db = getDb()
    const itemStmt = db.prepare<[string], OrderItemRow>(`SELECT * FROM order_items WHERE order_id = ?`)
    res.json({ orders: rows.map((order) => readOrder(order, itemStmt.all(order.id))) })
  }),
)

/**
 * One order by reference.
 *
 * **404, not 403, for another account's order.** The reference gets this wrong and it
 * matters: a 403 proves the reference exists, so it turns the order endpoint into an
 * oracle that confirms a guessed reference belongs to a real customer. A reference is
 * ten base32 characters of entropy, so this is not brute-forceable — but the honest
 * answer to "not yours" is the same answer as "not there".
 */
ordersRouter.get(
  '/:reference',
  requireAuth,
  handler((req, res) => {
    const reference = param(req, 'reference')
    const db = getDb()

    const order = db
      .prepare<[string, string], OrderRow>(`SELECT * FROM orders WHERE reference = ? AND user_id = ?`)
      .get(reference, req.user!.id)

    if (!order) {
      notFound(req, res)
      return
    }

    const items = db
      .prepare<[string], OrderItemRow>(`SELECT * FROM order_items WHERE order_id = ?`)
      .all(order.id)

    res.json({ order: readOrder(order, items) })
  }),
)

// ---------------------------------------------------------------------------
// Withdraw
// ---------------------------------------------------------------------------

/**
 * `DELETE /api/orders/:reference` — withdraw an order that has not been paid.
 *
 * Only `awaiting_payment` orders can be cancelled, and a paid one returns 409 rather
 * than being silently reverted: the money moved and the entitlements were granted, so
 * "cancelling" it would be a refund wearing a different word.
 */
ordersRouter.delete(
  '/:reference',
  requireAuth,
  handler((req, res) => {
    const reference = param(req, 'reference')
    const db = getDb()

    const order = db
      .prepare<[string, string], OrderRow>(`SELECT * FROM orders WHERE reference = ? AND user_id = ?`)
      .get(reference, req.user!.id)

    if (!order) {
      notFound(req, res)
      return
    }
    if (order.status === 'payment_confirmed') {
      throw new ApiError(409, 'This order has been paid and cannot be withdrawn here. Contact us to arrange a refund.')
    }

    db.prepare(`UPDATE orders SET status = 'cancelled', updated_at = ? WHERE id = ?`).run(now(), order.id)
    res.json({ ok: true, status: 'cancelled' })
  }),
)

// ---------------------------------------------------------------------------

/** Status validation shared with the (future) confirmation path. */
export function parseOrderStatus(value: unknown): OrderStatus {
  return oneOf(value, ORDER_STATUSES, 'status')
}
