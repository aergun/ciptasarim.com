/*
 * The account page (/hesap).
 *
 * Two facts live here — who is signed in, and which orders they have placed —
 * and both are read from the server, never from client state.
 *
 *  - **The user is already known.** The route sits behind `RequireAuth`, so the
 *    page assumes a user; the null branch is still rendered, as a notice, for
 *    the one case the gate cannot see: a session that expires between the
 *    gate's check and this page's own render.
 *  - **Every price in the order list is the server's.** `GET /api/orders`
 *    re-derives all money through `priceFor()` at read time
 *    (`server/routes/orders.ts`); a `null` `priceUsd` is a published
 *    "quote on request" and renders as `licences.quoteOnly` — never as zero, a
 *    dash, or a blank money cell.
 *  - **Cancel is a reference, not an id.** The withdraw route is keyed on the
 *    human-quotable `CT-…` reference the buyer already has on their proforma
 *    invoice, so that is what the DELETE carries. A paid order answers 409
 *    because the money has moved and the entitlements were granted — the page
 *    states that instead of pretending the row is reversible.
 *  - **Dates**: `created_at` is a full ISO-8601 timestamp, while `formatDate`
 *    takes a bare date, so only the `YYYY-MM-DD` prefix is handed to it.
 */

import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { BundleKind, LicenseTier } from '../../shared/types.ts'
import { formatCurrency, formatDate } from '../../shared/i18n.ts'
import { api, ApiError } from '../lib/api.ts'
import { localePrefix, LocaleLink, useSite } from '../lib/site.tsx'
import { useAuth } from '../context/AuthContext.tsx'
import {
  Badge,
  Button,
  Container,
  ErrorState,
  Loading,
  Notice,
  Prose,
  Section,
} from '../components/ui.tsx'

/** One order line, as `readOrder` in `server/routes/orders.ts` shapes it. */
interface OrderItem {
  coreSlug: string
  coreName: string
  bundle: BundleKind
  tier: LicenseTier
  priceUsd: number | null
  lineTotalUsd: number | null
}

/** One order, as `GET /api/orders` returns it. */
interface Order {
  id: string
  reference: string
  status: 'awaiting_payment' | 'payment_confirmed' | 'cancelled'
  currency: string
  note: string
  createdAt: string
  items: OrderItem[]
  subtotalUsd: number | null
}

export function Account() {
  const { strings, locale } = useSite()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const onSignOut = () => {
    signOut().then(() => navigate(localePrefix(locale) + '/'))
  }

  return (
    <Container width="narrow" className="py-20 md:py-28">
      <header className="animate-rise border-b border-line pb-10">
        <p className="eyebrow">{strings.nav.account}</p>
        <h1 className="mt-4 text-display-lg text-ink">{strings.nav.account}</h1>
      </header>

      <Section className="pb-0">
        {user ? (
          <AccountBody user={user} onSignOut={onSignOut} />
        ) : (
          /* Session ended between RequireAuth's check and this render. */
          <Notice tone="info">{strings.errors.unauthorisedBody}</Notice>
        )}
      </Section>
    </Container>
  )
}

function AccountBody({ user, onSignOut }: { user: { email: string; company: string }; onSignOut: () => void }) {
  const { strings } = useSite()

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <p className="text-[15px] font-semibold text-ink">{user.email}</p>
          {user.company ? <p className="mt-1 text-[13px] text-mist">{user.company}</p> : null}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <LocaleLink to="/hesap/indirmeler" className="text-[13px] text-ink underline underline-offset-4">
            {strings.downloads.title}
          </LocaleLink>
          <Button variant="secondary" onClick={onSignOut}>
            {strings.auth.signOut}
          </Button>
        </div>
      </div>

      <OrderList />
    </>
  )
}

function OrderList() {
  const { strings } = useSite()
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [message, setMessage] = useState('')

  const load = useCallback(
    (signal?: AbortSignal) => {
      setFailed(false)
      api
        .get<{ orders: Order[] }>('/orders', signal)
        .then(({ orders }) => setOrders(orders))
        .catch((err: unknown) => {
          if ((err as Error)?.name === 'AbortError') return
          setMessage(err instanceof ApiError ? err.message : strings.errors.serverErrorBody)
          setFailed(true)
        })
    },
    [strings.errors.serverErrorBody],
  )

  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal)
    return () => controller.abort()
  }, [load])

  if (failed) {
    return <ErrorState message={message} retryLabel={strings.common.retry} onRetry={() => load()} />
  }

  if (!orders) {
    return <Loading label={strings.common.loading} />
  }

  if (orders.length === 0) {
    return (
      <div className="border border-dashed border-line px-8 py-16">
        <Prose className="mx-auto">
          <p>{strings.downloads.emptyHint}</p>
        </Prose>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} onWithdrawn={() => load()} />
      ))}
    </div>
  )
}

function OrderCard({ order, onWithdrawn }: { order: Order; onWithdrawn: () => void }) {
  const { strings, locale } = useSite()
  const [withdrawing, setWithdrawing] = useState(false)
  const [withdrawError, setWithdrawError] = useState<string | null>(null)

  const statusBadge = (() => {
    switch (order.status) {
      case 'payment_confirmed':
        return <Badge tone="success">{strings.checkout.paymentConfirmed}</Badge>
      case 'cancelled':
        return <Badge tone="danger">{strings.checkout.cancelled}</Badge>
      default:
        return <Badge tone="muted">{strings.checkout.awaitingPayment}</Badge>
    }
  })()

  const withdraw = () => {
    if (!window.confirm(strings.checkout.cancelConfirm)) return
    setWithdrawing(true)
    setWithdrawError(null)

    api
      .delete(`/orders/${encodeURIComponent(order.reference)}`)
      .then(() => onWithdrawn())
      .catch((err: unknown) => {
        // 409 is the paid-order case: the money has moved, so nothing here can
        // be undone and the reason is stated as the fact it is.
        const message =
          err instanceof ApiError && err.status === 409
            ? strings.checkout.cancelBlocked
            : err instanceof ApiError
              ? err.message
              : strings.errors.serverErrorBody
        setWithdrawError(message)
      })
      .finally(() => setWithdrawing(false))
  }

  return (
    <article className="border border-line">
      <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-line px-6 py-4">
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
          <p className="font-mono text-[15px] tracking-[-0.01em] text-ink tabular">{order.reference}</p>
          <p className="text-[12px] text-mist">{formatDate(order.createdAt.slice(0, 10), locale)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {statusBadge}
          {order.status === 'awaiting_payment' ? (
            <Button variant="danger" disabled={withdrawing} onClick={withdraw}>
              {withdrawing ? strings.common.loading : strings.common.cancelAction}
            </Button>
          ) : null}
        </div>
      </div>

      {withdrawError ? (
        <div className="px-6 pt-4">
          <Notice tone="error">{withdrawError}</Notice>
        </div>
      ) : null}

      <table className="w-full text-left text-[13px]">
        <thead>
          <tr className="border-b border-line text-[10px] uppercase tracking-[0.2em] text-mist">
            <th className="px-6 py-3 font-semibold">{strings.cart.item}</th>
            <th className="px-6 py-3 font-semibold">{strings.cart.licence}</th>
            <th className="px-6 py-3 text-right font-semibold">{strings.cart.unitPrice}</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, index) => (
            <tr
              key={`${item.coreSlug}-${item.bundle}-${item.tier}-${index}`}
              className="border-b border-line last:border-0"
            >
              <td className="px-6 py-3 text-ink">
                {item.coreName}
                <span className="mt-1 block text-[11px] leading-relaxed text-mist">
                  {strings.bundleKinds[item.bundle]}
                </span>
              </td>
              <td className="px-6 py-3 text-mist">{strings.licenseTiers[item.tier]}</td>
              <td className="px-6 py-3 text-right font-mono text-ink tabular">
                {item.priceUsd === null ? strings.licences.quoteOnly : formatCurrency(item.priceUsd, locale)}
              </td>
            </tr>
          ))}
        </tbody>
        {order.subtotalUsd !== null && order.items.length > 0 ? (
          <tfoot>
            <tr>
              <td colSpan={2} className="px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-mist">
                {strings.cart.subtotal}
              </td>
              <td className="px-6 py-3 text-right font-mono text-[15px] text-ink tabular">
                {formatCurrency(order.subtotalUsd, locale)}
              </td>
            </tr>
          </tfoot>
        ) : null}
      </table>

      {order.note ? <Prose className="px-6 pb-5 pt-3">{order.note}</Prose> : null}
    </article>
  )
}