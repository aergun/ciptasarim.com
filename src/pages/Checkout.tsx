/*
 * Checkout (/sepet/odeme).
 *
 * The B2B flow's single submit. There is no card form and no guest path, and
 * both absences are structural rather than stylistic:
 *
 *  - **The order endpoint requires an account.** `POST /api/orders` sits behind
 *    `requireAuth` (`server/routes/orders.ts`), so a signed-out visitor gets a
 *    prompt to sign in — with the cart untouched, because the draft lives in
 *    `localStorage` and survives the sign-in round trip.
 *  - **No money is computed here.** The body carries slugs, bundle ids, tier ids
 *    and an optional note ≤ 500 characters, and nothing else — the server
 *    re-derives every price through `priceFor()` and there is no field for a
 *    client total even to sit in. Payment is a bank transfer against a proforma
 *    invoice (`checkout.awaitingPaymentBody`), not a gateway, so the only thing
 *    this page can honestly compute is nothing.
 *  - **201 means a reference, not a payment.** On success the cart is cleared
 *    and the `CT-…` reference is shown with the transfer wording; on failure the
 *    server's message and field map are rendered rather than paraphrased.
 */

import { useState, type FormEvent } from 'react'
import type { BundleKind, LicenseTier } from '../../shared/types.ts'
import { formatCurrency } from '../../shared/i18n.ts'
import { cartSubtotalUsd, type CartLine } from '../../shared/pricing.ts'
import { api, ApiError } from '../lib/api.ts'
import { useSite } from '../lib/site.tsx'
import { useAuth } from '../context/AuthContext.tsx'
import { useCart } from '../context/CartContext.tsx'
import {
  Badge,
  Button,
  ButtonLink,
  Container,
  Field,
  Notice,
  Prose,
  Section,
  Textarea,
} from '../components/ui.tsx'

/** The order the 201 response returns, as `readOrder` shapes it. */
interface PlacedOrder {
  id: string
  reference: string
  status: 'awaiting_payment' | 'payment_confirmed' | 'cancelled'
  subtotalUsd: number | null
  items: { coreName: string; priceUsd: number | null }[]
}

interface SubmitItem {
  coreSlug: string
  bundle: BundleKind
  tier: LicenseTier
}

export function Checkout() {
  const { strings } = useSite()
  const { user } = useAuth()
  const { lines, priced, clear } = useCart()

  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  const [message, setMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [placed, setPlaced] = useState<PlacedOrder | null>(null)

  const submit = (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setFailed(false)
    setFieldErrors({})

    // Identifiers only — see the header note. The price column of the request
    // body has no existence; the server derives every figure.
    const items: SubmitItem[] = lines.map((line) => ({
      coreSlug: line.coreSlug,
      bundle: line.bundle,
      tier: line.tier,
    }))

    api
      .post<{ order: PlacedOrder }>('/orders', { items, note: note.trim() || undefined })
      .then(({ order }) => {
        clear()
        setPlaced(order)
      })
      .catch((error: unknown) => {
        if (error instanceof ApiError) {
          setMessage(error.message)
          const fields: Record<string, string> = {}
          // Field errors arrive as `items.<index>.<field>`, which no single
          // input owns; the line names stay in the summary and the general
          // message carries the reason.
          for (const key of Object.keys(error.fields)) {
            if (key === 'note') {
              fields.note = error.fields.note ?? ''
            } else if (key.startsWith('items.')) {
              fields.items = error.fields[key] ?? ''
            }
          }
          setFieldErrors(fields)
        } else {
          setMessage(strings.errors.serverErrorBody)
        }
        setFailed(true)
      })
  }

  return (
    <Container width="narrow" className="py-20 md:py-28">
      <header className="animate-rise border-b border-line pb-10">
        <p className="eyebrow">{strings.nav.cart}</p>
        <h1 className="mt-4 text-display-lg text-ink">{strings.checkout.title}</h1>
      </header>

      {placed ? (
        <Section className="pb-0">
          <div className="border border-proven/40 bg-proven/[0.04] px-6 py-8 text-proven">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em]">{strings.checkout.awaitingPayment}</p>
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.24em]">{strings.checkout.orderNumber}</p>
            <p className="mt-1 font-mono text-[clamp(1.4rem,3vw,2rem)] leading-none tracking-[-0.02em] tabular">
              {placed.reference}
            </p>
          </div>
          <Prose className="mt-8">{strings.checkout.awaitingPaymentBody}</Prose>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <ButtonLink to="/hesap">{strings.nav.account}</ButtonLink>
            <ButtonLink to="/hesap/indirmeler" variant="secondary">
              {strings.downloads.title}
            </ButtonLink>
          </div>
        </Section>
      ) : !user ? (
        /* No guest path: the order endpoint resolves the buyer from the session. */
        <Section className="pb-0">
          <Notice tone="info">{strings.errors.unauthorisedBody}</Notice>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <ButtonLink to="/hesap/giris">{strings.auth.signIn}</ButtonLink>
            <ButtonLink to="/hesap/kayit" variant="secondary">
              {strings.auth.signUp}
            </ButtonLink>
          </div>
        </Section>
      ) : lines.length === 0 ? (
        <Section className="pb-0">
          <Notice tone="info">{strings.cart.emptyCannotCheckout}</Notice>
          <div className="mt-6">
            <ButtonLink to="/cekirdekler">{strings.cart.continueShopping}</ButtonLink>
          </div>
        </Section>
      ) : (
        <Section className="pb-0">
          <OrderSummary lines={lines} priced={priced} />
          <form onSubmit={submit} className="mt-12" noValidate>
            <Field
              label={strings.common.message}
              hint={strings.common.optional}
              error={fieldErrors.note}
              className="max-w-md"
            >
              <Textarea value={note} maxLength={500} onChange={(e) => setNote(e.target.value)} />
            </Field>

            {failed && message ? (
              <Notice tone="error" className="mt-6 max-w-md">
                {message}
                {fieldErrors.items ? <span className="mt-2 block">{fieldErrors.items}</span> : null}
              </Notice>
            ) : null}

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button type="submit" disabled={busy}>
                {busy ? strings.common.loading : strings.checkout.payNow}
              </Button>
              <ButtonLink to="/sepet" variant="secondary">
                {strings.checkout.backToCart}
              </ButtonLink>
            </div>
            <p className="mt-6 text-[12px] text-mist">{strings.licences.taxNoticeShort}</p>
          </form>
        </Section>
      )}
    </Container>
  )
}

function OrderSummary({
  lines,
  priced,
}: {
  lines: { coreSlug: string; coreName: string; bundle: BundleKind; tier: LicenseTier; unitPriceUsd: number | null }[]
  priced: boolean
}) {
  const { strings, locale } = useSite()

  const subtotal: number | null = priced
    ? cartSubtotalUsd(
        lines.map((line): CartLine => {
          return { slug: line.coreSlug, tier: line.tier, bundle: line.bundle, unitPriceUsd: line.unitPriceUsd ?? 0 }
        }),
      )
    : null

  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-mist">{strings.checkout.orderSummary}</p>
      <ul className="mt-4 divide-y divide-line border-y border-line">
        {lines.map((line) => (
          <li key={`${line.coreSlug}-${line.bundle}-${line.tier}`} className="flex flex-wrap items-baseline justify-between gap-4 py-4">
            <div>
              <p className="text-[14px] font-semibold text-ink">{line.coreName}</p>
              <p className="mt-1.5 flex flex-wrap items-center gap-2">
                <Badge tone="muted">{strings.bundleKinds[line.bundle]}</Badge>
                <Badge tone="muted">{strings.licenseTiers[line.tier]}</Badge>
              </p>
            </div>
            <p className="font-mono text-[15px] text-ink tabular">
              {line.unitPriceUsd === null ? strings.licences.quoteOnly : formatCurrency(line.unitPriceUsd, locale)}
            </p>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-mist">{strings.cart.subtotal}</p>
        <p className="font-mono text-[15px] text-ink tabular">
          {subtotal !== null ? formatCurrency(subtotal, locale) : strings.licences.quoteOnly}
        </p>
      </div>
    </div>
  )
}