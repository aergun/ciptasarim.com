/**
 * The three licence tiers — /lisanslar.
 *
 * One card per tier, in `content/licences.ts`'s order (cheapest first, each
 * strictly more capable than the last). The card's price is the tier's *own*
 * authored `priceUsd` — the flat fee for the tier itself (support time,
 * environment bring-up for evaluation; the contract structure above it) and
 * **not** a core price: cores are priced per core against a tier multiplier
 * in `shared/pricing.ts` and render on the catalogue and pricing pages. That
 * distinction is stated on the page, because a reader who took the tier card's
 * number as "what a core costs" would be quoting a number this site never set.
 *
 * `excludes` is rendered as fully as `includes`, and for the same reason the
 * content file documents: it is enforced by the delivery manifest filter, and
 * it is where the tier's defining restriction (evaluation grants no tapeout)
 * is written in contract language.
 */

import {LocaleLink, useSite} from '../lib/site.tsx'
import {
  ButtonLink,
  Container,
  Heading,
  PageHeader,
  Prose,
  Section,
  SpecTable,
} from '../components/ui.tsx'
import { licences } from '../../content/licences.ts'
import { formatCurrency } from '../../shared/i18n.ts'

export function Licences() {
  const { locale, strings, t } = useSite()

  /** Why the card's number is not a core price. */
  const priceNote = {
    tr: 'Kartlarda yazan bedel, kademenin kendi peşin ücretidir; katalogdaki çekirdek fiyatı ise çekirdek başına, bu kademenin çarpanı üzerinden ayrıca belirlenir. Çekirdek fiyatları teklif üzeredir — Fiyatlandırma sayfasındaki tablo, kademe ve paket yapısını bugünkü haliyle gösterir.',
    en: 'The figure on each card is the tier’s own up-front fee. Catalogue cores are priced per core, against the tier’s multiplier, separately — and every core price is on quote. The table on the pricing page shows the tier and bundle structure as it stands today.',
  }

  return (
    <article>
      <Section className="pb-0 pt-14">
        <Container width="narrow">
          <PageHeader
            eyebrow={strings.nav.licences}
            title={strings.licences.title}
            lede={strings.licences.subtitle}
          />
          <Prose className="mt-8">{t(priceNote)}</Prose>
          <p className="mt-4">
            <LocaleLink
              to="/fiyatlandirma"
              className="text-[11px] font-semibold uppercase tracking-[0.16em] text-flare hover:underline"
            >
              {strings.licences.compareTiers} →
            </LocaleLink>
          </p>
        </Container>
      </Section>

      <Section className="py-14">
        <Container>
          <div className="space-y-10">
            {licences.map((licence) => (
              <div key={licence.id} className="border border-line bg-paper p-6 md:p-10">
                <div className="flex flex-wrap items-baseline justify-between gap-6">
                  <div>
                    <p className="eyebrow">{strings.licenseTiers[licence.id]}</p>
                    <Heading as="h3" className="mt-2">
                      {t(licence.name)}
                    </Heading>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-[22px] tabular text-ink">
                      {formatCurrency(licence.priceUsd, locale)}
                    </p>
                    <p className="mt-1 text-[11px] text-mist">{strings.licences.taxNoticeShort}</p>
                  </div>
                </div>

                <Prose className="mt-4">{t(licence.summary)}</Prose>

                <div className="mt-8 grid gap-8 md:grid-cols-2">
                  <TierList title={strings.licences.includes} items={licence.includes} t={t} />
                  <TierList title={strings.licences.excludes} items={licence.excludes} t={t} />
                  <TierList title={strings.licences.rights} items={licence.rights} t={t} />
                  <TierList title={strings.licences.restrictions} items={licence.restrictions} t={t} />
                </div>

                <div className="mt-8 border-t border-line pt-6">
                  <SpecTable
                    rows={[
                      {
                        label: strings.licences.seats,
                        value: licence.seats === null ? strings.licences.unlimited : String(licence.seats),
                      },
                      {
                        label: strings.licences.tapeouts,
                        value:
                          licence.tapeouts === null
                            ? strings.licences.tapeoutUnlimited
                            : String(licence.tapeouts),
                      },
                    ]}
                  />
                </div>

                <div className="mt-8 flex flex-wrap gap-4">
                  {/* Tiers sell per core — buying moves to the catalogue, quoting moves to the form. */}
                  <ButtonLink to="/cekirdekler" variant="secondary">
                    {strings.licences.buyNow}
                  </ButtonLink>
                  <ButtonLink to="/teklif">{strings.licences.getQuote}</ButtonLink>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-10 text-[12px] leading-relaxed text-mist">
            {strings.licences.taxNotice}
          </p>
        </Container>
      </Section>
    </article>
  )
}

/** One of a tier's four lists, rendered under its authored heading. */
function TierList({
  title,
  items,
  t,
}: {
  title: string
  items: readonly { tr: string; en: string }[]
  t: (text: { tr: string; en: string }) => string
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-mist">{title}</p>
      <ul className="mt-3 space-y-2">
        {items.map((item, index) => (
          <li key={index} className="text-[13px] leading-relaxed text-mist">
            {t(item)}
          </li>
        ))}
      </ul>
    </div>
  )
}