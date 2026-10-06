/**
 * Pricing — /fiyatlandirma.
 *
 * This page's honesty constraint is a content constraint, not a rendering one:
 * `corePricing` in `content/packages.ts` is **deliberately empty**, so every
 * cell of the core × tier table is `null` from `priceFor()` and every cell
 * renders `strings.licences.quoteOnly` — "on quote" — with the tier's
 * multiplier shown beside it. The table is structurally the real one: the day
 * an authored price is entered in `corePricing`, this page starts rendering
 * numbers without a code change, and until then it renders the one true thing
 * it can: that no price has been published.
 *
 * `null` is never collapsed to `0` (see `shared/pricing.ts` — quoted on
 * request is a different fact from free), and no price is derived here, ever.
 * `EngineeringNotice` would be the wrong component — this is a commercial
 * page, not an engineering one — so the caveat is a `Notice{info}`.
 */

import { useSite } from '../lib/site.tsx'
import {
  Badge,
  ButtonLink,
  Container,
  Heading,
  Notice,
  PageHeader,
  Prose,
  Section,
} from '../components/ui.tsx'
import { cores } from '../../content/cores.ts'
import { LICENSE_TIERS, type LicenseTier } from '../../shared/types.ts'
import { multiplierFor, priceFor } from '../../shared/pricing.ts'
import { formatNumber } from '../../shared/i18n.ts'

export function Pricing() {
  const { strings } = useSite()
  const pricing = strings.pricing

  return (
    <article>
      <Section className="pb-0 pt-14">
        <Container width="narrow">
          <PageHeader
            eyebrow={strings.nav.pricing}
            title={pricing.title}
            lede={pricing.subtitle}
          />
          <Prose className="mt-8">{pricing.intro}</Prose>
          <Prose className="mt-4">{strings.licences.taxNotice}</Prose>
        </Container>
      </Section>

      <Section className="py-14">
        <Container width="narrow">
          <Notice tone="info">{pricing.tableNote}</Notice>

          <div className="mt-10 flex flex-wrap items-baseline justify-between gap-4">
            <Heading as="h3">{pricing.core}</Heading>
            <Badge tone="muted">{strings.licences.quoteOnly}</Badge>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[40rem] border-y border-line text-left align-baseline">
              <thead>
                <tr className="border-b border-line text-[10px] uppercase tracking-[0.2em] text-mist">
                  <th scope="col" className="py-3 pr-4 font-semibold">
                    {pricing.core}
                  </th>
                  {LICENSE_TIERS.map((tier) => (
                    <th key={tier} scope="col" className="py-3 pr-4 font-semibold">
                      {strings.licenseTiers[tier]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {cores.map((core) => (
                  <tr key={core.slug}>
                    <th
                      scope="row"
                      className="max-w-[20rem] py-4 pr-4 text-left align-baseline"
                    >
                      <span className="font-mono text-[13px] font-semibold text-ink">{core.name}</span>
                      <span className="mt-1 block text-[11px] text-mist">{strings.coreKinds[core.kind]}</span>
                    </th>
                    {LICENSE_TIERS.map((tier) => (
                      <PriceCell key={tier} tier={tier} coreSlug={core.slug} />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-6 text-[12px] leading-relaxed text-mist">{pricing.multiplierNote}</p>

          <div className="mt-10 flex flex-wrap items-center gap-6">
            <ButtonLink to="/teklif">{strings.licences.getQuote}</ButtonLink>
            <p className="max-w-[42ch] text-[12px] leading-relaxed text-mist">{strings.licences.compareTiers}</p>
          </div>
        </Container>
      </Section>
    </article>
  )
}

/**
 * One cell of the table. `null` — the current state for every core — renders
 * the quote-only badge with the tier multiplier beneath it; a published price
 * renders as currency. The multiplier note keeps the structure visible even
 * while the numbers are not: the reader can see what the tiers stand for.
 */
function PriceCell({ tier, coreSlug }: { tier: LicenseTier; coreSlug: string }) {
  const { locale, strings } = useSite()
  const price = priceFor({ slug: coreSlug }, tier)

  return (
    <td className="py-4 pr-6 align-baseline">
      {price === null ? (
        <>
          <span className="text-[12px] uppercase tracking-[0.14em] text-mist">
            {strings.licences.quoteOnly}
          </span>
          <span className="mt-1 block font-mono text-[11px] text-mist tabular">
            {`× ${formatNumber(multiplierFor(tier), locale, 2)}`}
          </span>
        </>
      ) : (
        <span className="font-mono text-[13px] tabular text-ink">{formatNumber(price, locale, 0)}</span>
      )}
    </td>
  )
}