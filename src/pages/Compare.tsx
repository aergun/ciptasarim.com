/*
 * The comparison view.
 *
 * One rule dominates this page and it comes from the plan: **comparison is only
 * meaningful within a kind.** A gate count next to an ENOB is not a comparison —
 * the two have no unit in common, and a verification core has no physical
 * figures at all. So the view is driven entirely by a *kind*: `?tur=` selects
 * the same Turkish slugs the catalogue list uses, and the columns are every
 * core of that kind.
 *
 * Rows are the kind's spec fields in `FIELDS_BY_KIND` order, for every node any
 * core of the kind is offered at. A cell is never blank: a figure shows its
 * badge, an uncharacterised one shows its reason, and a node the core is not
 * offered at says so. A dash would read as a zero with less ink.
 */

import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { cores } from '../../content/cores.ts'
import { formatCurrency } from '../../shared/i18n.ts'
import {
  CORE_KINDS,
  PROCESS_NODES,
  atNode,
  coresOfKind,
  type Core,
  type CoreKind,
  type Figure,
  type ProcessNode,
} from '../../shared/types.ts'
import { FIELDS_BY_KIND } from '../lib/coreSpec.ts'
import { entryPriceFrom } from '../../shared/pricing.ts'
import { Container, Heading, Prose, Section } from '../components/ui.tsx'
import { FigureBadge, figureColor, figureValue, FigureGap } from '../components/figure.tsx'
import { LocaleLink, useSite } from '../lib/site.tsx'

/** Same mapping as the catalogue list reads — one mapping, one vocabulary. */
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

type Strings = ReturnType<typeof useSite>['strings']

export function Compare() {
  const { strings, locale } = useSite()
  const [params, setParams] = useSearchParams()

  const kind = KIND_BY_QUERY[params.get('tur') ?? ''] ?? 'soft-rtl'
  const group = coresOfKind(cores, kind)

  // Every node any core in the group is offered at, in process order.
  const nodes = useMemo(() => {
    const offered = new Set(group.flatMap((core) => core.nodes))
    return PROCESS_NODES.filter((node) => offered.has(node))
  }, [group])

  return (
    <Section className="py-14 md:py-20">
      <Container>
        <header className="animate-rise pb-10">
          <Heading as="h1">{strings.cores.compare}</Heading>
          <Prose className="mt-4">{strings.cores.compareHint}</Prose>
        </header>

        {/* Kind tabs. */}
        <div className="flex flex-wrap items-center gap-2 pb-10" role="group" aria-label={strings.cores.kind}>
          {CORE_KINDS.map((entry) => (
            <button
              key={entry}
              type="button"
              aria-pressed={entry === kind}
              onClick={() => setParams({ tur: KIND_TO_QUERY[entry] }, { replace: true })}
              className={`rounded-full border px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors ${
                entry === kind
                  ? 'border-ink bg-ink text-paper'
                  : 'border-line text-mist hover:border-ink hover:text-ink'
              }`}
            >
              {strings.coreKinds[entry]}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setParams(new URLSearchParams(), { replace: true })}
            className="ml-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-flare hover:underline"
          >
            {strings.cores.compareClear}
          </button>
        </div>

        {group.length === 0 ? (
          <Prose>{strings.cores.compareRequiresKind}</Prose>
        ) : (
          <div className="space-y-16">
            {nodes.map((node) => (
              <NodeComparison key={node} node={node} group={group} kind={kind} strings={strings} locale={locale} />
            ))}
          </div>
        )}
      </Container>
    </Section>
  )
}

/**
 * One node, one table: first column is the field label, one column per core.
 * Cells come from the cores' real per-node figures, and the closing row is
 * each core's published entry price — or the quotation line, stated.
 */
function NodeComparison({
  node,
  group,
  kind,
  strings,
  locale,
}: {
  node: ProcessNode
  group: readonly Core[]
  kind: CoreKind
  strings: Strings
  locale: 'tr' | 'en'
}) {
  return (
    <section>
      <p className="mb-4 font-mono text-[13px] font-semibold text-ink">{strings.processNodes[node]}</p>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[48rem] border-y border-line text-left tabular">
          <thead>
            <tr className="border-b border-line text-[10px] uppercase tracking-[0.2em] text-mist">
              <th scope="col" aria-label={strings.cores.spec} />
              {group.map((core) => (
                <th key={core.slug} scope="col" className="py-3 pr-6 font-mono text-[11px] text-ink">
                  <LocaleLink to={`/cekirdekler/${core.slug}`} className="hover:text-flare">
                    {core.name}
                  </LocaleLink>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {FIELDS_BY_KIND[kind].map((field) => (
              <tr key={field.id} className="align-baseline">
                <th scope="row" className="py-3 pr-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-mist">
                  {strings.specFields[field.id]}
                </th>
                {group.map((core) => {
                  const byNode = field.extract(core)
                  const figure: Figure | null = byNode === null ? null : atNode(byNode, node)
                  return (
                    <td key={core.slug} className="py-3 pr-6">
                      <CellFigure figure={figure} locale={locale} />
                    </td>
                  )
                })}
              </tr>
            ))}
            <tr className="align-baseline">
              <th scope="row" className="py-3 pr-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-mist">
                {strings.cores.licence}
              </th>
              {group.map((core) => {
                const price = entryPriceFrom([core])
                return (
                  <td key={core.slug} className="py-3 pr-6">
                    {price !== null ? (
                      <span className="font-mono text-[13px] text-ink">{formatCurrency(price, locale)}</span>
                    ) : (
                      <span className="text-[12px] text-mist">{strings.licences.quoteOnly}</span>
                    )}
                  </td>
                )
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  )
}

/** One comparison cell, rendered the same way the detail page renders cells. */
function CellFigure({ figure, locale }: { figure: Figure | null; locale: 'tr' | 'en' }) {
  const { strings } = useSite()
  if (figure === null) {
    return <span className="text-[12px] italic text-void">{strings.cores.notOfferedAtNode}</span>
  }
  if (figure.basis === 'uncharacterised') {
    return <FigureGap figure={figure} />
  }
  return (
    <div className="inline-flex flex-col items-start gap-1">
      <span className={`font-mono text-[13px] tabular ${figureColor(figure)}`}>{figureValue(figure, locale)}</span>
      <FigureBadge figure={figure} />
    </div>
  )
}