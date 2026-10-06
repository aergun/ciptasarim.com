/*
 * Schema.
 *
 * ## What is here, and what is deliberately not
 *
 * Tables, not content. The catalogue — cores, figures, processes, licences — lives
 * in `content/*.ts` as TypeScript, is reviewed as source, and cannot be edited by
 * anything that can reach the database. What lives here is the state a *user*
 * creates: accounts, carts, orders, entitlements.
 *
 * ## No `reviews` or `courses` table
 *
 * Both were dropped against the reference project and that decision is recorded
 * here because the absence is visible and would otherwise look like an oversight.
 *
 * `reviews` is the sharper one. In the reference, `finaliseDesign()` computes a
 * `reviewAverage` from authored reviews — and an IP vendor's catalogue rating is
 * meaningless anyway, because engineers do not rate IP suppliers and any such
 * number on this site would be one we invented. A fabricated rating is worse than
 * no rating: it is the one field a reader would *not* check.
 *
 * ## Why orders carry a status and no card fields
 *
 * This is a B2B purchase flow: a buyer submits an order, gets a reference number,
 * and pays by bank transfer against an invoice. Payment is confirmed out of band.
 *
 * So there is no `card_token`, no `gateway_id` and no payment-provider column on
 * this table, and that is a design decision rather than an omission. The reference
 * project ships a mock card gateway behind `ALLOW_MOCK_PAYMENTS=true`, and that flag
 * is still live on its public domain — which is exactly the trap this avoids. A
 * checkout that handles no card data cannot leak card data, cannot be pointed at a
 * real gateway by one env var, and has no secret to rotate. There is nothing on the
 * public site for anyone to abuse.
 *
 * `status` is therefore the whole of the order state machine, and it is an explicit
 * set rather than a boolean: `awaiting_payment` and `payment_confirmed` are
 * different facts about the world, and collapsing them into `paid` would erase the
 * gap this flow exists to represent.
 */

export const SCHEMA_VERSION = 1

export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS meta (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Accounts. A buyer is a company contact, so there is no name/password split into
-- a profile table: the person is the account.
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  company       TEXT NOT NULL DEFAULT '',
  created_at    TEXT NOT NULL
);

-- The cart is a set of lines rather than a cart with a lines table, because a cart
-- is small, always belongs to exactly one user, and is deleted with the purchase.
CREATE TABLE IF NOT EXISTS cart_items (
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  core_slug  TEXT NOT NULL,
  bundle     TEXT NOT NULL,
  tier       TEXT NOT NULL,
  quantity   INTEGER NOT NULL DEFAULT 1,
  added_at   TEXT NOT NULL,
  PRIMARY KEY (user_id, core_slug, bundle, tier)
);

-- An order records what was asked for. Deliberately NOT what was paid: a price
-- column here would be a client-supplied number, and the server re-derives every
-- total from the content modules at read time instead.
-- See server/routes/orders.ts.
CREATE TABLE IF NOT EXISTS orders (
  id           TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL REFERENCES users(id),
  reference    TEXT NOT NULL UNIQUE,
  status       TEXT NOT NULL,
  currency     TEXT NOT NULL DEFAULT 'USD',
  -- Set when payment is confirmed, by us, out of band.
  paid_at      TEXT,
  note         TEXT NOT NULL DEFAULT '',
  created_at   TEXT NOT NULL,
  updated_at   TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_user   ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_ref    ON orders(reference);

-- The lines of an order, snapshotted at submission.
--
-- The bundle/tier pairs are stored as identifiers rather than as files, and the
-- *set* of deliverable files is resolved at download time from the core's
-- document manifest, filtered by tier. That way correcting a manifest does not
-- invalidate orders already placed, and a buyer is never told a download exists
-- that the manifest no longer supports.
CREATE TABLE IF NOT EXISTS order_items (
  id         TEXT PRIMARY KEY,
  order_id   TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  core_slug  TEXT NOT NULL,
  bundle     TEXT NOT NULL,
  tier       TEXT NOT NULL,
  quantity   INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- What a user has actually been granted access to.
--
-- Separate from orders because entitlement outlives the order that created it: a
-- production licence is permanent while the invoice is still being paid, and the
-- two must be able to disagree. The download check reads this table and the order
-- status is not consulted, so a paid order that is later marked refunded does not
-- silently re-lock a customer who still holds a valid licence.
CREATE TABLE IF NOT EXISTS entitlements (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  core_slug  TEXT NOT NULL,
  bundle     TEXT NOT NULL,
  tier       TEXT NOT NULL,
  order_id   TEXT REFERENCES orders(id),
  granted_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_entitlement_unique
  ON entitlements(user_id, core_slug, bundle, tier);
CREATE INDEX IF NOT EXISTS idx_entitlement_user ON entitlements(user_id);

-- Enquiries sent through the contact form. A brief arriving by email is a
-- stranger's document in a third-party relay; one arriving here is a tracked row.
CREATE TABLE IF NOT EXISTS enquiries (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  company    TEXT NOT NULL DEFAULT '',
  message    TEXT NOT NULL,
  created_at TEXT NOT NULL
);
`

/**
 * Ordered migrations.
 *
 * **Version 1 is the baseline above**, so `SCHEMA_VERSION` and this array can never
 * disagree: a fresh database runs every entry in order and an existing one skips
 * what it has already stamped.
 *
 * The baseline used to be applied by an unconditional `exec(SCHEMA_SQL)` in
 * `applySchema()`, with this array reserved for later changes. That was wrong, and
 * `applySchema()`'s own guard caught it at boot: `SCHEMA_VERSION = 1` with an empty
 * array means "declared version 1, but no version-1 migration exists", which is
 * exactly the drift the guard was written to prevent, introduced by the arrangement
 * it was guarding.
 *
 * Making the baseline entry 1 removes the special case entirely. `CREATE TABLE IF NOT
 * EXISTS` makes it idempotent, so a database created before this change — whose
 * `meta` row already says `1` — is untouched and correctly skips it.
 */
export const MIGRATIONS: { version: number; sql: string }[] = [{ version: 1, sql: SCHEMA_SQL }]
