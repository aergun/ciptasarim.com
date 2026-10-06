/*
 * Cart (/sepet).
 *
 * The cart is a **draft order**, not a priced document, and this page renders it
 * that way. Its three honesty rules come straight out of the data model:
 *
 *  - **`unitPriceUsd` is displayed and nothing else.** The figure is a snapshot
 *    taken when the line was added (`CartContext` carries the comment); the
 *    server re-derives every price at submit time, so this page shows it once,
 *    in the line's own column, and builds no arithmetic of its own on it.
 *  - **The subtotal exists only when every line can be priced.** Mixed carts — a
 *    priced core next to a quote-only one — show `licences.quoteOnly` in place
 *    of the total, because a number that excludes the unpriced lines would
 *    understate an order a buyer then acts on (the same rule `readOrder` applies
 *    server-side in `server/routes/orders.ts`). No client-side total is derived
 *    for the quote case.
 *  - **There is no quantity.** Licences are sold per core (`LICENCE_QUANTITY`),
 *    so a line is one licence and the page says so once (`cart.quantityNote`).
 *
 * Every line links its core, because a licence decision is not reversible from
 * this page: the reader goes back to the core's tiers and changes the selection
 * there. Removal is the only write.
 */

import type { BundleKind, LicenseTier } from '../../shared/types.ts'
import { formatCurrency } from '../../shared/i18n.ts'
import { cartSubtotalUsd, type CartLine } from '../../shared/pricing.ts'
import { LocaleLink, useSite } from '../lib/site.tsx'
import { useCart } from '../context/CartContext.tsx'
import { Button, ButtonLink, Container, EmptyState, Section, Tag } from '../components/ui.tsx'

export function Cart() {
  const { strings, locale } = useSite()
  const { lines, priced, remove } = useCart()

  if (lines.length === 0) {
    return (
      <Container width="narrow" className="py-20 md:py-28">
        <header className="animate-rise border-b border-line pb-10">
          <p className="eyebrow">{strings.nav.cart}</p>
          <h1 className="mt-4 text-display-lg text-ink">{strings.cart.title}</h1>
        </header>
        <Section className="pb-0">
          <EmptyState
            title={strings.cart.empty}
            body={strings.cart.emptyHint}
            action={<ButtonLink to="/cekirdekler">{strings.cart.continueShopping}</ButtonLink>}
          />
        </Section>
      </Container>
    )
  }

  /*
   * The subtotal is the shared arithmetic, mapped from the display lines onto the
   * shape `cartSubtotalUsd` reads — and only called under `priced`, which is the
   * single gate keeping the quote-only case from producing a number at all.
   */
  const subtotal: number | null = priced
    ? cartSubtotalUsd(
        lines.map((line): CartLine => {
          return { slug: line.coreSlug, tier: line.tier, bundle: line.bundle, unitPriceUsd: line.unitPriceUsd ?? 0 }
        }),
      )
    : null

  return (
    <Container width="narrow" className="py-20 md:py-28">
      <header className="animate-rise border-b border-line pb-10">
        <p className="eyebrow">{strings.nav.cart}</p>
        <h1 className="mt-4 text-display-lg text-ink">{strings.cart.title}</h1>
        <p className="mt-6 max-w-[62ch] text-[17px] leading-[1.65] text-mist">{strings.cart.quantityNote}</p>
      </header>

      <Section className="pb-0">
        <ul className="divide-y divide-line">
          {lines.map((line, index) => (
            <CartRow key={`${line.coreSlug}-${line.bundle}-${line.tier}`} line={line} onRemove={() => remove(index)} />
          ))}
        </ul>

        <div className="mt-10 border-t border-line pt-8">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-mist">{strings.cart.subtotal}</p>
            {subtotal !== null ? (
              <p className="font-mono text-[clamp(1.6rem,3vw,2.4rem)] leading-none tracking-[-0.02em] text-ink tabular">
                {formatCurrency(subtotal, locale)}
              </p>
            ) : (
              <p className="font-mono text-[clamp(1.6rem,3vw,2.4rem)] leading-none tracking-[-0.02em] text-ink tabular">
                {strings.licences.quoteOnly}
              </p>
            )}
          </div>
          <p className="mt-3 text-[12px] text-mist">{strings.licences.taxNoticeShort}</p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <ButtonLink to="/sepet/odeme">{strings.cart.checkout}</ButtonLink>
            <ButtonLink to="/cekirdekler" variant="secondary">
              {strings.cart.continueShopping}
            </ButtonLink>
          </div>
        </div>
      </Section>
    </Container>
  )
}

function CartRow({ line, onRemove }: { line: CartDisplayLine; onRemove: () => void }) {
  const { strings, locale } = useSite()

  return (
    <li className="flex flex-wrap items-baseline justify-between gap-4 py-5">
      <div className="min-w-[16rem] flex-1">
        <LocaleLink to={`/cekirdekler/${line.coreSlug}`} className="text-[15px] font-semibold text-ink underline-offset-4 hover:underline">
          {line.coreName}
        </LocaleLink>
        <p className="mt-2 flex flex-wrap items-center gap-2">
          <Tag>{strings.bundleKinds[line.bundle]}</Tag>
          <Tag>{strings.licenseTiers[line.tier]}</Tag>
        </p>
      </div>
      <div className="flex flex-wrap items-baseline gap-6">
        <p className="font-mono text-[15px] text-ink tabular">
          {line.unitPriceUsd === null ? strings.licences.quoteOnly : formatCurrency(line.unitPriceUsd, locale)}
        </p>
        <Button variant="ghost" onClick={onRemove}>
          {strings.cart.remove}
        </Button>
      </div>
    </li>
  )
}

/** A row's line, narrowed to the cart's own display shape. */
type CartDisplayLine = { coreSlug: string; coreName: string; bundle: BundleKind; tier: LicenseTier; unitPriceUsd: number | null }