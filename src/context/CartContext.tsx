/**
 * The cart, in context.
 *
 * ## What the cart is, given this site's purchase flow
 *
 * There is no persisted cart on the server, and nothing was ever checked out
 * "for later": the cart is a *draft order* the buyer composes in their session
 * and submits once. `POST /api/orders` takes slugs, bundle ids and tier ids only,
 * and re-derives every price from `content/` — so `unitPriceUsd` here is a
 * *display* figure, read from `GET /api/catalogue/cores/:slug/price` when the
 * line was added and valid only until the order is submitted. Nothing downstream
 * trusts it.
 *
 * ## Why `localStorage`
 *
 * A signed-in account, a guest quote and a long deliberation all end up in the
 * same cart: a B2B buyer will build the list, walk away and reopen the tab a
 * week later. The cart surviving a closed tab is a function, not a feature.
 * It belongs to nobody — there is no server row to lose or clash with, because
 * until the order is submitted there is no order.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { BundleKind, LicenseTier } from '../../shared/types.ts'

export interface CartLine {
  coreSlug: string
  coreName: string
  bundle: BundleKind
  tier: LicenseTier
  /**
   * Display only. The server re-derives every price at submit time and there is
   * no code path that reads one from a request body — see `server/routes/orders.ts`.
   * `null` when no price is published for this core yet.
   */
  unitPriceUsd: number | null
}

interface CartState {
  lines: CartLine[]
  /** True when at least one line price cannot be derived — the subtotal is then `null`. */
  priced: boolean
  add: (line: CartLine) => void
  remove: (index: number) => void
  clear: () => void
}

const STORAGE_KEY = 'ciptasarim-cart-v1'
const MAX_LINES = 50 // mirrors the server's own cap on order items

const CartContext = createContext<CartState | null>(null)

function readStored(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (line): line is CartLine =>
        typeof line === 'object' &&
        line !== null &&
        typeof (line as CartLine).coreSlug === 'string' &&
        typeof (line as CartLine).bundle === 'string' &&
        typeof (line as CartLine).tier === 'string',
    )
  } catch {
    // Private mode, cleared storage, corrupt JSON — an empty cart renders, which
    // is the correct state for every one of those.
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(readStored)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
    } catch {
      // Same deal: a store that cannot keep the cart must not crash the page.
    }
  }, [lines])

  const add = useCallback((line: CartLine) => {
    setLines((existing) => {
      // One line per (core, bundle, tier): a second add of the same licence is a
      // no-op, not a second row — an IP licence grants rights to one design, so
      // there is no quantity to accumulate (the server stores none either).
      if (existing.some((l) => l.coreSlug === line.coreSlug && l.bundle === line.bundle && l.tier === line.tier)) {
        return existing
      }
      if (existing.length >= MAX_LINES) return existing
      return [...existing, line]
    })
  }, [])

  const remove = useCallback((index: number) => {
    setLines((existing) => existing.filter((_, i) => i !== index))
  }, [])

  const clear = useCallback(() => setLines([]), [])

  const priced = lines.length > 0 && lines.every((l) => l.unitPriceUsd !== null)

  const value = useMemo(() => ({ lines, priced, add, remove, clear }), [lines, priced, add, remove, clear])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartState {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart outside CartProvider')
  return context
}