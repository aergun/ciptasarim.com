/*
 * Database row shapes.
 *
 * Kept as explicit interfaces rather than inferred from the schema, because SQLite
 * has no types to infer from: every column comes back as `unknown` and the shapes
 * here are the only place a column's type is written down. They are written as the
 * database stores them — `snake_case` columns, `created_at` timestamps — and the
 * camelCase shapes the API speaks are produced by the mappers in `auth.ts`.
 *
 * **`number | null` rather than `number` on the nullable columns is load-bearing.**
 * A TypeScript `number` on a column SQLite may return as NULL is a claim the
 * compiler cannot check, and the failure is a `null` reaching arithmetic that
 * renders as `NaN` in a price. Making it honest at the boundary is cheaper.
 */

/** A row in `users`. */
export interface UserRow {
  id: string
  /** Unique. Stored lowercased — see `email()` in `http.ts` for why that is ASCII. */
  email: string
  password_hash: string
  company: string
  created_at: string
}

/** A row in `orders`. */
export interface OrderRow {
  id: string
  user_id: string
  /** Human-facing, quoted to the buyer. Unique. */
  reference: string
  /**
   * `awaiting_payment` | `payment_confirmed` | `cancelled`.
   *
   * A string in the database and a union at the type boundary, because SQLite has no
   * enum. `ORDER_STATUSES` is the source of truth and `toOrder()` narrows to it.
   */
  status: string
  currency: string
  /** Set when we confirm payment. `null` until then — which is the common case. */
  paid_at: string | null
  note: string
  created_at: string
  updated_at: string
}

/** A row in `order_items`. */
export interface OrderItemRow {
  id: string
  order_id: string
  core_slug: string
  bundle: string
  tier: string
  quantity: number
}

/** A row in `entitlements`. */
export interface EntitlementRow {
  id: string
  user_id: string
  core_slug: string
  bundle: string
  tier: string
  order_id: string | null
  granted_at: string
}

/** A row in `cart_items`. */
export interface CartItemRow {
  user_id: string
  core_slug: string
  bundle: string
  tier: string
  quantity: number
  added_at: string
}

/** A row in `enquiries`. */
export interface EnquiryRow {
  id: string
  name: string
  email: string
  company: string
  message: string
  created_at: string
}
