/*
 * The home page, in three movements: the video hero (ported from the standalone
 * demo), then the site's argument — that every number here is labelled with
 * where it came from — shown as a legend, as featured cores whose figures wear
 * their badges, and as the calculators and process table that put the
 * discipline to work.
 *
 * All data comes from `content/` directly, as the reference home did: the home
 * page is the one place a compile-time read of the catalogue beats an API call,
 * because it must never flash a loading state on a first visit, and the data it
 * shows is the same array every other page reads.
 */

import { LocaleLink, useSite } from '../lib/site.tsx'
import { VideoHero } from '../components/VideoHero.tsx'
import { Container, Eyebrow, Heading, Prose, Section, InvertedSection, Stat, ButtonLink } from '../components/ui.tsx'
import { FigureBadge, figureColor, figureValue, FigureGap, BASIS_FIGURES } from '../components/figure.tsx'
import { CoreImage } from '../components/CoreImage.tsx'
import { cores } from '../../content/cores.ts'
import { tools } from '../../content/tools.ts'
import { processes } from '../../content/processes.ts'
import { faqs } from '../../content/faqs.ts'
import { entryPriceFrom } from '../../shared/pricing.ts'
import { formatCurrency } from '../../shared/i18n.ts'
import { CORE_KINDS, type Core } from '../../shared/types.ts'

const FEATURED_SLUGS = ['uart-fifo', 'sram-16x512', 'sd-adc-12'] as const

export function Home() {
  const { strings, locale, t } = useSite()
  const home = strings.home

  const featured = FEATURED_SLUGS.map((slug) => cores.find((core) => core.slug === slug)).filter(
    (core): core is Core => core != null,
  )

  const stats = [
    { value: String(cores.length), label: home.statsCores },
    { value: String(processes.length), label: home.statsNodes },
    { value: String(CORE_KINDS.length), label: home.statsKinds },
  ]

  const legend = [
    { key: 'measured' as const, body: strings.basis.measuredLong, tone: 'fig-measured' },
    { key: 'modelled' as const, body: strings.basis.modelledLong, tone: 'fig-modelled' },
    { key: 'uncharacterised' as const, body: strings.basis.uncharacterisedLong, tone: 'fig-uncharacterised' },
  ]

  /**
   * The legend badge, built per basis via `BASIS_FIGURES` — value-less figures
   * that exist to carry the badge the legend is explaining.
   */
  const badges = {
    measured: <FigureBadge figure={BASIS_FIGURES.measured} />,
    modelled: <FigureBadge figure={BASIS_FIGURES.modelled} />,
    uncharacterised: <FigureBadge figure={BASIS_FIGURES.uncharacterised} />,
  }

  return (
    <article>
      {/* The hero fills the first viewport; the rest of the page scrolls under it. */}
      <div className="relative h-dvh overflow-hidden bg-ink">
        <VideoHero
          title={home.heroTitle}
          body={home.heroBody}
          hint={home.heroHint}
          ctas={[
            { label: home.browseCores, to: '/cekirdekler' },
            { label: home.openTools, to: '/hesaplayicilar' },
          ]}
        />
      </div>

      {/* A strip of the three counts that describe the catalogue. */}
      <Container className="py-16 md:py-20">
        <div className="grid gap-10 border-y border-line py-10 sm:grid-cols-3">
          {stats.map((stat) => (
            <Stat key={stat.label} value={stat.value} label={stat.label} />
          ))}
        </div>
      </Container>

      {/* The provenance legend: the site's central discipline, stated once. */}
      <Section className="bg-stage">
        <Container width="narrow">
          <Eyebrow>{strings.basis.legendTitle}</Eyebrow>
          <Heading className="mt-4">{home.provenanceTitle}</Heading>
          <Prose className="mt-6">{home.provenanceBody}</Prose>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {legend.map((entry) => (
              <div key={entry.key} className="border border-line bg-paper p-6">
                {badges[entry.key]}
                <p className={`mt-4 font-mono text-[13px] leading-relaxed ${entry.tone}`}>{entry.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Featured cores — one per kind, each led by its first authored figure. */}
      <Section>
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Eyebrow>{strings.nav.cores}</Eyebrow>
              <Heading className="mt-4">{home.featuredTitle}</Heading>
              <Prose className="mt-4">{home.featuredBody}</Prose>
            </div>
            <ButtonLink to="/cekirdekler" variant="secondary">
              {strings.common.viewAll}
            </ButtonLink>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {featured.map((core) => (
              <FeaturedCard key={core.slug} core={core} />
            ))}
          </div>
        </Container>
      </Section>

      {/* The calculators, listed so a design engineer can judge the models first. */}
      <InvertedSection>
        <Container>
          <Eyebrow className="text-flare">{strings.nav.tools}</Eyebrow>
          <Heading className="mt-4">{home.toolsTitle}</Heading>
          <Prose className="mt-6 text-paper/80">{home.toolsBody}</Prose>
          <div className="mt-12 grid gap-px bg-paper/10 md:grid-cols-2">
            {tools.map((tool) => (
              <LocaleLink
                key={tool.id}
                to={`/hesaplayicilar/${tool.slug}`}
                className="group bg-ink p-6 transition-colors hover:bg-ink-soft"
              >
                <p className="font-mono text-[13px] tracking-wide text-paper">{t(tool.title)}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-paper/60">{t(tool.summary)}</p>
              </LocaleLink>
            ))}
          </div>
        </Container>
      </InvertedSection>

      {/* The process table, teasered with three nodes including at least one gap. */}
      <Section>
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Eyebrow>{strings.nav.process}</Eyebrow>
              <Heading className="mt-4">{home.processTitle}</Heading>
              <Prose className="mt-4">{home.processBody}</Prose>
            </div>
            <ButtonLink to="/teknoloji" variant="secondary">
              {strings.common.viewAll}
            </ButtonLink>
          </div>

          <dl className="mt-12 divide-y divide-line border-y border-line">
            {processes.slice(0, 4).map((process) => (
              <div key={process.node} className="flex items-baseline justify-between gap-6 py-4">
                <dt className="font-mono text-[13px] text-ink tabular">{strings.processNodes[process.node]}</dt>
                <dd>
                  {process.cellArea.basis === 'uncharacterised' ? (
                    <FigureGap figure={process.cellArea} />
                  ) : (
                    <span className={`font-mono text-[13px] tabular ${figureColor(process.cellArea)}`}>
                      {figureValue(process.cellArea, locale)}
                    </span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </Container>
      </Section>

      {/* FAQ teaser. */}
      <Section className="bg-stage">
        <Container width="narrow">
          <Eyebrow>{strings.nav.faq}</Eyebrow>
          <Heading className="mt-4">{home.faqTitle}</Heading>
          <div className="mt-10 divide-y divide-line border-y border-line">
            {faqs.slice(0, 4).map((faq) => (
              <details key={faq.question.tr} className="group py-4">
                <summary className="cursor-pointer list-none text-[15px] font-medium text-ink marker:hidden">
                  {t(faq.question)}
                </summary>
                <Prose className="mt-3">{t(faq.answer)}</Prose>
              </details>
            ))}
          </div>
          <div className="mt-8">
            <ButtonLink to="/sss" variant="secondary">
              {strings.common.viewAll}
            </ButtonLink>
          </div>
        </Container>
      </Section>
    </article>
  )
}

/** One featured core card: image slot, kind, summary and lead figure. */
function FeaturedCard({ core }: { core: Core }) {
  const { strings, t, locale } = useSite()
  const kinds = strings.coreKinds
  const price = entryPriceFrom([core])

  return (
    <LocaleLink to={`/cekirdekler/${core.slug}`} className="group block border border-line bg-paper transition-colors hover:border-ink">
      <div className="aspect-[16/9] overflow-hidden border-b border-line bg-stage">
        <CoreImage core={core} className="h-full w-full object-cover" />
      </div>
      <div className="p-6">
        <p className="eyebrow">{kinds[core.kind]}</p>
        <p className="mt-3 font-mono text-[15px] font-semibold text-ink">{core.name}</p>
        <Prose className="mt-3 text-[14px]">{t(core.summary)}</Prose>
        <div className="mt-5 flex items-center justify-between gap-4">
          {price !== null ? (
            <span className="font-mono text-[13px] tabular text-ink">{formatCurrency(price, locale)}</span>
          ) : (
            <span className="text-[12px] text-mist">{strings.licences.quoteOnly}</span>
          )}
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-flare">
            {strings.common.learnMore}
          </span>
        </div>
      </div>
    </LocaleLink>
  )
}