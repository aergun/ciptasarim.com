/*
 * The catalogue list.
 *
 * The filter chips and the search box are the two ways a buyer arrives at a core;
 * both are read from the URL, never from state, so a filtered view is shareable
 * and the footer's deep links (`/cekirdekler?tur=…`) land pre-filtered.
 *
 * `?tur` carries the *kind*, keyed by a URL-safe slug per kind. The footer's
 * links were authored with the Turkish slugs — `yazilim-rtl`, `doğrulama` — and
 * the mapping to `CoreKind` happens once, here, in one table (URLSearchParams
 * percent-decodes `doğrulama` back before the lookup).
 */

import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { cores } from '../../content/cores.ts'
import { entryPriceFrom } from '../../shared/pricing.ts'
import { fold, formatCurrency, type Locale } from '../../shared/i18n.ts'
import { CORE_KINDS, type Core, type CoreKind } from '../../shared/types.ts'
import { Container, EmptyState, Heading, Input, Prose, Section } from '../components/ui.tsx'
import { FigureBadge, figureColor, figureValue, FigureGap } from '../components/figure.tsx'
import { CoreImage } from '../components/CoreImage.tsx'
import { LocaleLink, useSite } from '../lib/site.tsx'

/** `?tur` value → the kind it names. Authored in one place; the footer links to it. */
const KIND_BY_QUERY: Record<string, CoreKind> = {
  'yazilim-rtl': 'soft-rtl',
  'standart-hucre': 'hard-macro',
  analog: 'analog',
  'doğrulama': 'verification',
}

const KIND_TO_QUERY: Record<CoreKind, string> = {
  'soft-rtl': 'yazilim-rtl',
  'hard-macro': 'standart-hucre',
  analog: 'analog',
  verification: 'doğrulama',
}

export function Cores() {
  const { strings, locale, t } = useSite()
  const [params, setParams] = useSearchParams()

  const query = params.get('q') ?? ''
  const kindParam = params.get('tur') ?? ''

  const kind = KIND_BY_QUERY[kindParam] ?? null
  const kinds = strings.coreKinds

  const visible = useMemo(() => {
    const needle = fold(query)
    return cores.filter((core) => {
      if (kind && core.kind !== kind) return false
      if (!needle) return true
      // The haystack is the full card: part number, family, tags, summary. A
      // search that only covered the name would hide `uart` matches in a tag.
      const haystack = fold(
        [core.name, core.family, core.slug, t(core.summary), ...core.tags]
          .join(' ')
          .toLowerCase(),
      )
      return needle.split(/\s+/).every((term) => haystack.includes(term))
    })
  }, [query, kind, t])

  const setKind = (next: CoreKind | null) => {
    setParams(
      (previous) => {
        const draft = new URLSearchParams(previous)
        if (next) draft.set('tur', KIND_TO_QUERY[next])
        else draft.delete('tur')
        return draft
      },
      { replace: true },
    )
  }

  const setQuery = (next: string) => {
    setParams(
      (previous) => {
        const draft = new URLSearchParams(previous)
        if (next) draft.set('q', next)
        else draft.delete('q')
        return draft
      },
      { replace: true },
    )
  }

  return (
    <Section className="py-14 md:py-20">
      <Container>
        <header className="animate-rise pb-10">
          <Heading as="h1">{strings.cores.title}</Heading>
          <Prose className="mt-4">{strings.cores.subtitle}</Prose>
        </header>

        {/* Filters: kind chips and a free-text search, both URL-backed. */}
        <div className="flex flex-col gap-4 py-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2" role="group" aria-label={strings.cores.kind}>
            <FilterChip active={kind === null} onClick={() => setKind(null)}>
              {strings.common.all}
            </FilterChip>
            {CORE_KINDS.map((entry) => (
              <FilterChip key={entry} active={kind === entry} onClick={() => setKind(entry)}>
                {kinds[entry]}
              </FilterChip>
            ))}
          </div>
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={strings.common.searchPlaceholder}
            aria-label={strings.common.search}
            className="max-w-sm"
          />
        </div>

        {visible.length === 0 ? (
          <div className="pt-8">
            <EmptyState
              title={strings.common.noResults}
              body={strings.cores.noCores}
              action={
                <button
                  type="button"
                  className="text-[11px] font-semibold uppercase tracking-[0.16em] text-flare hover:underline"
                  onClick={() => setParams(new URLSearchParams(), { replace: true })}
                >
                  {strings.common.clearFilters}
                </button>
              }
            />
          </div>
        ) : (
          <ul className="divide-y divide-line border-y border-line">
            {visible.map((core) => (
              <li key={core.slug}>
                <LocaleLink
                  to={`/cekirdekler/${core.slug}`}
                  className="group grid items-center gap-6 py-6 transition-colors md:grid-cols-[8rem,1fr,auto]"
                >
                  <div className="h-24 w-full overflow-hidden border border-line bg-stage md:w-32">
                    <CoreImage core={core} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="eyebrow">{kinds[core.kind]}</p>
                    <p className="mt-2 font-mono text-[15px] font-semibold text-ink">{core.name}</p>
                    <Prose className="mt-2 text-[14px]">{t(core.summary)}</Prose>
                    <p className="mt-3 font-mono text-[11px] text-mist">
                      {core.nodes.map((node) => strings.processNodes[node]).join(' · ')}
                    </p>
                  </div>
                  <div className="flex flex-col items-start gap-2 md:w-52 md:items-end">
                    <LeadFigure core={core} locale={locale} />
                    <PriceLine core={core} locale={locale} />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-flare opacity-0 transition-opacity group-hover:opacity-100">
                      {strings.common.learnMore}
                    </span>
                  </div>
                </LocaleLink>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </Section>
  )
}

function FilterChip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors ${
        active ? 'border-ink bg-ink text-paper' : 'border-line text-mist hover:border-ink hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}

/** The card's lead figure: the core's first authored spec cell, badge and all. */
function LeadFigure({ core, locale }: { core: Core; locale: Locale }) {
  const { strings } = useSite()
  const lead = core.figures[0]
  if (!lead) {
    return <span className="text-[12px] italic text-void">{strings.basis.uncharacterised}</span>
  }
  return (
    <div className="flex flex-col items-start gap-1 md:items-end">
      {lead.figure.basis === 'uncharacterised' ? (
        <FigureGap figure={lead.figure} />
      ) : (
        <span className={`font-mono text-[13px] tabular ${figureColor(lead.figure)}`}>
          {figureValue(lead.figure, locale)}
        </span>
      )}
      <FigureBadge figure={lead.figure} />
    </div>
  )
}

/** A null price is stated, not zeroed — "quoted on request" is the fact. */
function PriceLine({ core, locale }: { core: Core; locale: Locale }) {
  const { strings } = useSite()
  const price = entryPriceFrom([core])
  if (price === null) {
    return <span className="text-[12px] text-mist">{strings.licences.quoteOnly}</span>
  }
  return <span className="font-mono text-[13px] tabular text-ink">{formatCurrency(price, locale)}</span>
}