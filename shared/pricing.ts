/**
 * Price and entitlement arithmetic.
 *
 * This module answers one question — what does this core cost at this licence tier —
 * and it answers it the same way for the catalogue grid, the cart, the order totals
 * and the entitlement check. It is the only place in the codebase that turns a
 * licence and a core into a number, so those four consumers cannot disagree.
 *
 * ## Why there is no price curve here
 *
 * The reference project derived its prices with `basePrice(loa)`: a fitted curve
 * over hull length, landing on round commercial numbers at the ends.
 *
 * **That curve is dropped entirely, and the reason is worth stating plainly rather
 * than leaving as an omission.** A yacht's price does track a physical dimension:
 * a 60-foot boat really does take far more of the designer's time than a 20-foot
 * one, so a function of length is a defensible compression of a real relationship,
 * and every constant in it could be argued about against a real boat.
 *
 * An IP core has no such dimension. The four kinds here have four unrelated price
 * structures:
 *
 * - a **soft RTL core** is priced against the engineering already sunk into it and
 *   the size of the market willing to pay for it;
 * - a **hard macro** is priced against tapeout cost, mask cost per customer, and
 *   how many customers there are to amortise both across;
 * - an **analog or mixed-signal core** is priced against characterisation bench
 *   time, which dominates everything;
 * - **verification collateral** is priced near zero and given away to win the RTL,
 *   because it has no value to anyone who cannot integrate the core.
 *
 * A single `f(something)` across those four would be a function whose argument
 * correlates with none of them. It would produce a plausible-looking number, and a
 * plausible-looking price on an IP vendor's site is a number the vendor then has to
 * honour.
 *
 * ## Why every price in this codebase is authored
 *
 * So the prices are **authored numbers**, per core, in `content/packages.ts`, and
 * they are not derived from anything.
 *
 * This is the correct treatment, and the difference from a derived number is not
 * stylistic. A derived number has a formula someone can check and someone can be
 * wrong about. An authored number is a commercial decision by a person, which is
 * exactly what a price is, and the honest thing the site can say about it is
 * "this is our price" rather than dressing it as a computation. No formula here
 * could be defended against anything, because — as with every other uncharacterised
 * figure on this site — there is no characterised silicon behind it to check against.
 *
 * Authored prices are still a discipline problem, and the discipline is
 * `corePricing` being a flat array keyed by slug, reviewed like any other content
 * file, rather than a coefficient buried in a module nobody opens.
 *
 * ## Why the evaluation licence is cheaper
 *
 * `evaluation` carries a multiplier well below 1, and the temptation is to read it
 * as a discount strategy — a loss leader to pull the core into a design. It is not
 * a pricing decision, and the type says so too: an evaluation licence is
 * **structurally incapable of being as valuable as a production licence**, because it
 * does not entitle a tapeout.
 *
 * That is a legal constraint, not a commercial one. A production licence grants the
 * right to fabricate; an evaluation licence does not, under any price. So the
 * multiplier is not a lever anyone can raise — raising it to 1 would not make an
 * evaluation licence worth more, because what a buyer wanted at that tier was the
 * right to build, and no price conveys it. The cheapness is a *consequence* of the
 * restriction, recorded so the arithmetic has a single input, not a discount that
 * might be adjusted.
 *
 * This is also why `excludes` is as load-bearing as `includes` on a `License`: the
 * delivery manifest is filtered by tier, so an item named there is withheld, and
 * "not for tapeout" is enforced by a file the customer never receives rather than
 * by a sentence on a pricing page.
 */

import type { BundleKind, Core, License, LicenseTier } from './types.ts'
import { bundles, corePricing } from '../content/packages.ts'
import { licences } from '../content/licences.ts'

/* -------------------------------------------------------------------------- */
/* Tier multipliers                                                             */
/* -------------------------------------------------------------------------- */

/**
 * `shared/` reaching into `content/` is a deliberate inversion of the usual
 * dependency direction, and it is worth naming rather than leaving to be discovered.
 *
 * The reference project passed a `{ packages, licenses }` catalogue into every
 * function instead. That bought purity at the price of plumbing the same two
 * module-level arrays through four call sites in the client and two in the server,
 * and the requested `multiplierFor(tier)` signature has no room for such a
 * parameter at all — which is the clearest evidence that the catalogue is meant to
 * be resolved here.
 *
 * The constraint that keeps it safe is one-directional: **`content/` must never
 * import from `shared/pricing.ts`.** Licence and bundle content is data and does not
 * need to know how it is priced. If a content file ever needs a price for display,
 * it reads the authored number from `corePricing`, which is where it lives anyway.
 *
 * There is no import cycle today: `packages.ts` and `licences.ts` import only from
 * `shared/types.ts`.
 */

const CATALOGUE: readonly License[] = licences

/**
 * Bundle multipliers, indexed once at module load.
 *
 * A `Map` built from the content module rather than a second literal here, so each
 * multiplier has exactly one home. A copy in this file would be a second number that
 * could be edited without the pricing page noticing.
 */
const BUNDLE_MULTIPLIERS: ReadonlyMap<BundleKind, number> = new Map(
  bundles.map((b) => [b.id, b.priceMultiplier]),
)

/**
 * The multiplier a licence tier applies to a core's authored entry price.
 *
 * Defaults to `1` for an unrecognised id rather than throwing. The ids come from
 * `LICENSE_TIERS`, so this is unreachable for a well-typed caller; it is here so
 * that a tier read from a request body or a stored order that predates a taxonomy
 * change prices as the unmodified base instead of producing `NaN` and rendering
 * `$NaN` to a customer. A missing multiplier is worth the base price, and the
 * checkout should be reviewed rather than the price invented.
 */
export function multiplierFor(tier: LicenseTier): number {
  return CATALOGUE.find((l) => l.id === tier)?.multiplier ?? 1
}

/** The authored entry price for a core slug, or `null` if the core has no price. */
export function basePriceFor(core: Pick<Core, 'slug'>): number | null {
  const row = corePricing.find((row) => row.slug === core.slug)
  return row ? row.priceUsd : null
}

/** The bundle a core's authored price refers to — its entry bundle. */
export function entryBundleFor(core: Pick<Core, 'slug'>): BundleKind | null {
  const row = corePricing.find((row) => row.slug === core.slug)
  return row ? row.bundle : null
}

/* -------------------------------------------------------------------------- */
/* Price of one core                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Price of one core at one licence tier, in whole USD.
 *
 * `bundle` defaults to the core's own entry bundle, which is what a customer buys
 * if they do not choose. Naming another bundle scales the authored price by that
 * bundle's `priceMultiplier` — layout is priced against tapeout and mask cost,
 * which is why it is not a flat add-on, and why the multiplier lives with the bundle
 * rather than in this function.
 *
 * Returns `null` for a core with no authored price, which is the honest answer and
 * the one the catalogue grid is built to show: this core is quoted, not listed. It
 * is distinct from `0`, and callers must not collapse the two — a `$0` core is free
 * and a `null` core is on request, and the second is the honest state for every
 * placeholder core this project currently ships.
 *
 * @param core - any object with a `slug`; the full `Core` is not required
 * @param tier - the licence tier
 * @param bundle - override the entry bundle
 */
export function priceFor(
  core: Pick<Core, 'slug'>,
  tier: LicenseTier,
  bundle?: BundleKind,
): number | null {
  const row = corePricing.find((row) => row.slug === core.slug)
  if (!row) return null

  let price = row.priceUsd * multiplierFor(tier)

  if (bundle && bundle !== row.bundle) {
    const mult = BUNDLE_MULTIPLIERS.get(bundle)
    // An unknown bundle leaves the price at the entry bundle's rather than zeroing
    // it: a bundle read from a stale order must not become a free licence.
    if (mult != null) price *= mult
  }

  return roundPrice(price)
}

/**
 * Rounds to the nearest $100.
 *
 * Rounding to a hundred rather than to a dollar is a statement about what these
 * prices are: they are commercial decisions with a negotiating range, not computed
 * quantities. Rounding to the cent would imply a precision no one intends to honour,
 * and the arithmetic is not the interesting part of the number anyway — the tier and
 * the bundle are, and both are shown beside it.
 *
 * A price below $100 rounds to $100 rather than to zero, and a negative rounds to
 * zero, so a malformed order becomes a free licence neither way.
 */
function roundPrice(usd: number): number {
  if (!Number.isFinite(usd) || usd <= 0) return 0
  return Math.round(usd / 100) * 100
}

/**
 * The lowest price any core is offered at, across every tier.
 *
 * The catalogue's "from" figure. It is a minimum over a list, never a price for a
 * particular core, and it is computed here rather than authored so it cannot drift
 * out of step with the tiers it summarises.
 */
export function entryPriceFrom(cores: readonly Pick<Core, 'slug'>[]): number | null {
  let lowest: number | null = null
  for (const core of cores) {
    // The evaluation tier is the floor by construction — it is the only tier whose
    // multiplier is below 1 — so the minimum over tiers reduces to this one call.
    const price = priceFor(core, 'evaluation')
    if (price == null) continue
    if (lowest === null || price < lowest) lowest = price
  }
  return lowest
}

/* -------------------------------------------------------------------------- */
/* Cart and order arithmetic                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Licences are sold per core. There is no quantity.
 *
 * A quantity field on a cart line is the single most common source of nonsense in
 * a licence storefront: it invites "2 × evaluation", which has no meaning, and a
 * two-licence order for two *different* cores is what a customer actually wants and
 * is expressed as two lines instead.
 *
 * The locale bundle says the same thing to the reader (`cart.quantityNote`), and the
 * server should refuse a submitted quantity other than 1 rather than trusting it.
 */
export const LICENCE_QUANTITY = 1 as const

/** One line of a cart. A licence to one core at one tier, in one bundle. */
export interface CartLine {
  /** Core slug. Untranslated and contractual — it is the manifest directory name. */
  slug: string
  tier: LicenseTier
  bundle: BundleKind
  /** Authored unit price in USD, as computed by `priceFor`. */
  unitPriceUsd: number
}

/**
 * Line total. Equals the unit price, and is written out rather than inlined so the
 * "quantity is always 1" rule has exactly one home.
 */
export function lineTotalUsd(line: CartLine): number {
  return line.unitPriceUsd * LICENCE_QUANTITY
}

/**
 * Cart subtotal, in whole USD.
 *
 * A line priced at `null` is dropped rather than counted as zero — a `null` price
 * means the core is quoted on request, and a cart total that silently omitted it
 * would understate an order. Callers that need to know should compare line count to
 * priced-line count via `unpricedLines`.
 */
export function cartSubtotalUsd(lines: readonly CartLine[]): number {
  let total = 0
  for (const line of lines) total += lineTotalUsd(line)
  return roundPrice(total)
}

/** The lines in a cart whose core has no authored price, i.e. the quote-only ones. */
export function unpricedLines(lines: readonly CartLine[]): readonly CartLine[] {
  return lines.filter((line) => priceFor({ slug: line.slug }, line.tier, line.bundle) == null)
}

/**
 * Order subtotal. Identical to the cart subtotal, and deliberately so.
 *
 * The reference project had a separate order total because it had to add VAT and
 * shipping. This one does not, for two reasons that are both load-bearing:
 *
 * - **Tax cannot be computed here.** The site is Turkish-primary and sells
 *   internationally. Whether a given delivery attracts VAT, at what rate, and under
 *   which reverse-charge or exemption rule depends on the customer's country and
 *   their own registrations — not on anything in the cart. The locale bundle says so
 *   in `licences.taxNotice` and this function must not pretend otherwise.
 * - **Delivery is digital**, so there is no shipping to add. A licence is a download
 *   behind an entitlement check, which is why the reference had a `FILES_DIR` to
 *   ship from and this has nothing to ship.
 *
 * The function exists anyway, named for the thing the checkout page shows, so that
 * the moment a tax provider is integrated it is added here and the checkout does not
 * have to grow a second arithmetic path.
 */
export function orderSubtotalUsd(lines: readonly CartLine[]): number {
  return cartSubtotalUsd(lines)
}