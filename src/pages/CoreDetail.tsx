/*
 * One core's detail page — the site's load-bearing page and the one the
 * provenance discipline was written for.
 *
 * Its sections, in the order a buyer reads them:
 *
 *  1. Identity — part number, kind, family, one-paragraph summary, description.
 *  2. Figures — the authored `SpecCell` stack, every row carrying its basis
 *     badge and provenance line through `SpecCellTable`. No page-level
 *     formatting of any figure happens here.
 *  3. Per node — the kind's spec fields at every node the core is offered at,
 *     driven by `FIELDS_BY_KIND` (`src/lib/coreSpec.ts`). A `ByNode` null means
 *     *not offered at that node* and says so; an `uncharacterised` figure shows
 *     its reason. Both are rendered, because they are different facts.
 *  4. Ports — the logical port list, name, kind, direction, width.
 *  5. Deliverables — the manifest for the selected tier, filtered by the same
 *     `manifestFor` the download route filters by, so the page never promises
 *     a file the tier does not include.
 *  6. Price and licences — tier and bundle selectors, the price read from the
 *     server's price endpoint (never derived client-side), and add-to-cart.
 *
 * The page reads `content/` directly, like every catalogue page: the API exists
 * for data the *server* must authorise or derive, and a public specification is
 * neither. The one number fetched at runtime is the price — the client derives
 * no price, ever (see `shared/pricing.ts`).
 */

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { BundleKind, Core, DocumentFile, LicenseTier, Port, ProcessNode } from '../../shared/types.ts'
import { LICENSE_TIERS, coresOfKind } from '../../shared/types.ts'
import { formatCurrency } from '../../shared/i18n.ts'
import { cores, coreFor } from '../../content/cores.ts'
import { manifestFor } from '../../content/documents.ts'
import { bundlesForKind, bundleFor } from '../../content/packages.ts'
import { licenceFor } from '../../content/licences.ts'
import { api } from '../lib/api.ts'
import { LocaleLink, useSite } from '../lib/site.tsx'
import { specCellsAtNode } from '../lib/coreSpec.ts'
import { Badge, Button, Container, Heading, Notice, Prose, Section, Select, SpecTable, Tag } from '../components/ui.tsx'
import { BASIS_FIGURES, FigureBadge, SpecCellTable } from '../components/figure.tsx'
import { useCart } from '../context/CartContext.tsx'
import { NotFound } from './NotFound.tsx'

type Strings = ReturnType<typeof useSite>['strings']

export function CoreDetail() {
  const { slug } = useParams()
  const { strings, locale, t } = useSite()
  const { add } = useCart()

  // Hooks are called unconditionally; the not-found gate happens only to pick
  // the element, so the provider hooks keep their order.
  if (!slug) return <NotFound />
  const core = coreFor(slug)
  if (!core) return <NotFound />

  return <CoreView core={core} strings={strings} locale={locale} t={t} add={add} />
}

function CoreView({
  core,
  strings,
  locale,
  t,
  add,
}: {
  core: Core
  strings: Strings
  locale: 'tr' | 'en'
  t: (text: { tr: string; en: string }) => string
  add: ReturnType<typeof useCart>['add']
}) {
  const [tier, setTier] = useState<LicenseTier>('evaluation')
  const [added, setAdded] = useState(false)

  // The bundles that can actually be delivered for this kind, in purchase
  // order — a hard macro gets `layout` first, never RTL (see `bundlesForKind`).
  const bundleOptions = useMemo(() => bundlesForKind(core.kind), [core.kind])
  const [bundle, setBundle] = useState<BundleKind>(bundleOptions[0]?.id ?? 'rtl')

  // The display price, read from the server each time the selectors change;
  // `null` is a published price of "quoted on request", never zero.
  const [priceUsd, setPriceUsd] = useState<number | null>(null)
  const [priceLoading, setPriceLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setPriceLoading(true)
    api
      .get<{ priceUsd: number | null }>(`/catalogue/cores/${core.slug}/price?tier=${tier}&bundle=${bundle}`)
      .then(({ priceUsd }) => {
        if (!cancelled) setPriceUsd(priceUsd)
      })
      .catch(() => {
        if (!cancelled) setPriceUsd(null)
      })
      .finally(() => {
        if (!cancelled) setPriceLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [core.slug, tier, bundle])

  const onAdd = () => {
    add({ coreSlug: core.slug, coreName: core.name, bundle, tier, unitPriceUsd: priceUsd })
    setAdded(true)
  }

  const licence = licenceFor(tier)
  const bundleName = bundleFor(bundle)
  const siblings = coresOfKind(cores, core.kind).filter((c) => c.slug !== core.slug)

  return (
    <article>
      {/* Identity */}
      <Section className="pb-0 pt-14">
        <Container width="narrow">
          <LocaleLink
            to="/cekirdekler"
            className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mist hover:text-ink"
          >
            ← {strings.cores.title}
          </LocaleLink>

          <p className="eyebrow mt-8">
            {strings.coreKinds[core.kind]} · {core.family}
          </p>
          <Heading as="h1" className="mt-3 font-mono">
            {core.name}
          </Heading>
          <Prose className="mt-5 text-[17px]">{t(core.summary)}</Prose>

          <div className="mt-6 flex flex-wrap gap-2">
            {core.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        </Container>
      </Section>

      <section className="py-6">
        <Container width="narrow">
          <Prose>{t(core.description)}</Prose>
          <p className="mt-4 font-mono text-[11px] text-mist">
            {strings.cores.node}: {core.nodes.map((node) => strings.processNodes[node]).join(' · ')}
          </p>
        </Container>
      </section>

      {/* Figures — the authored spec stack, every row badged. */}
      <Section className="py-14">
        <Container width="narrow">
          <Heading as="h3" className="mb-6">
            {strings.cores.spec}
          </Heading>
          <SpecCellTable cells={core.figures} />
          <ProvenanceLegend />
        </Container>
      </Section>

      {/* Per-node specifications. */}
      <Section className="py-14">
        <Container width="narrow">
          <Heading as="h3" className="mb-8">
            {strings.cores.specByNode}
          </Heading>
          <div className="space-y-12">
            {core.nodes.map((node) => (
              <NodeBlock key={node} core={core} node={node} strings={strings} />
            ))}
          </div>
        </Container>
      </Section>

      {/* Ports. Verification collateral declares no physical ports — its spec
          model has none, and the section is simply absent there. */}
      {portsOf(core).length > 0 ? (
        <Section className="py-14">
          <Container width="narrow">
            <Heading as="h3" className="mb-6">
              {strings.cores.ports}{' '}
              <span className="font-mono text-[13px] font-normal text-mist">
                {portsOf(core).length} {strings.cores.portCount}
              </span>
            </Heading>
            <PortTable ports={portsOf(core)} strings={strings} t={t} />
          </Container>
        </Section>
      ) : null}

      {/* PDK reference — required on every hard macro; unconfirmed until the
          customer states their PDK revision, which `source: null` carries. */}
      {core.kind === 'hard-macro' ? (
        <Section className="py-14">
          <Container width="narrow">
            <Heading as="h3" className="mb-6">
              {strings.cores.pdk}
            </Heading>
            <SpecTable
              rows={[
                { label: 'Foundry', value: t(core.pdk.foundry) },
                { label: strings.cores.node, value: strings.processNodes[core.pdk.node] },
                { label: 'PDK', value: t(core.pdk.pdkVersion) },
                {
                  label: strings.basis.source,
                  value:
                    core.pdk.source !== null ? (
                      <span className="font-mono">{core.pdk.source}</span>
                    ) : (
                      <Badge tone="muted">{strings.cores.pdkUnconfirmed}</Badge>
                    ),
                },
              ]}
            />
          </Container>
        </Section>
      ) : null}

      {/* Verification collateral has no physical figures; it names its standard. */}
      {core.kind === 'verification' ? (
        <Section className="py-14">
          <Container width="narrow">
            <Heading as="h3" className="mb-6">
              {strings.cores.standard}
            </Heading>
            <SpecTable rows={[{ label: strings.cores.standard, value: t(core.spec.standard) }]} />
          </Container>
        </Section>
      ) : null}

      {/* Analog: the full-scale range is prose by design — a compound statement
          no single number with one basis could represent. */}
      {core.kind === 'analog' ? (
        <Section className="py-14">
          <Container width="narrow">
            <Heading as="h3" className="mb-6">
              {strings.specFields.inputRange}
            </Heading>
            <SpecTable rows={[{ label: strings.specFields.inputRange, value: t(core.spec.inputRange) }]} />
          </Container>
        </Section>
      ) : null}

      {/* Deliverables, tier-filtered the same way the download route filters. */}
      <Section className="py-14">
        <Container width="narrow">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <Heading as="h3">{strings.cores.deliverables}</Heading>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-mist">
                {strings.licences.tier}
              </span>
              <TierSelect tier={tier} onTier={setTier} strings={strings} />
            </div>
          </div>
          <DocumentTable files={manifestFor(core, tier)} strings={strings} t={t} />
        </Container>
      </Section>

      {/* Licence summary + price + add to cart. */}
      <Section className="py-14">
        <Container width="narrow">
          {licence ? (
            <div className="border border-line bg-stage px-6 py-6">
              <div className="flex flex-wrap items-baseline justify-between gap-4">
                <p className="text-[15px] font-semibold text-ink">{t(licence.name)}</p>
                <p className="font-mono text-[15px] tabular text-ink">
                  {!priceLoading && priceUsd !== null ? formatCurrency(priceUsd, locale) : null}
                  {!priceLoading && priceUsd === null ? strings.licences.quoteOnly : null}
                </p>
              </div>
              <p className="mt-2 text-[13px] leading-relaxed text-mist">{t(licence.summary)}</p>
              <p className="mt-3 text-[12px] text-mist">{strings.licences.taxNoticeShort}</p>

              <div className="mt-6 flex flex-wrap items-end gap-4">
                <div className="min-w-56">
                  <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.2em] text-mist">
                    {bundleName ? strings.cores.deliverables : strings.licences.tier}
                  </span>
                  <Select
                    value={bundle}
                    onChange={(event) => setBundle(event.target.value as BundleKind)}
                    aria-label={strings.cores.deliverables}
                  >
                    {bundleOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {t(option.name)}
                      </option>
                    ))}
                  </Select>
                </div>
                <Button onClick={onAdd}>{strings.cart.add}</Button>
                {!priceLoading && priceUsd === null ? (
                  <LocaleLink
                    to="/teklif"
                    className="text-[11px] font-semibold uppercase tracking-[0.16em] text-flare hover:underline"
                  >
                    {strings.cores.requestQuote}
                  </LocaleLink>
                ) : null}
              </div>

              {added ? (
                <div className="mt-5">
                  <Notice tone="success">
                    {strings.cart.added}{' '}
                    <LocaleLink to="/sepet" className="underline">
                      {strings.cart.viewCart}
                    </LocaleLink>
                  </Notice>
                </div>
              ) : null}
            </div>
          ) : null}
        </Container>
      </Section>

      {/* Siblings of the same kind, and the comparison route. */}
      <Section className="pb-20 pt-0">
        <Container width="narrow">
          <div className="mb-6 flex flex-wrap items-baseline justify-between gap-4">
            <Heading as="h3">{strings.coreKinds[core.kind]}</Heading>
            <LocaleLink
              to="/cekirdekler/karsilastir"
              className="text-[11px] font-semibold uppercase tracking-[0.16em] text-flare hover:underline"
            >
              {strings.cores.compare}
            </LocaleLink>
          </div>
          <ul className="divide-y divide-line border-y border-line">
            {siblings.map((sibling) => (
              <li key={sibling.slug}>
                <LocaleLink
                  to={`/cekirdekler/${sibling.slug}`}
                  className="flex items-baseline justify-between gap-6 py-3 text-ink hover:text-flare"
                >
                  <span className="font-mono text-[13px]">{sibling.name}</span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mist">
                    {sibling.family}
                  </span>
                </LocaleLink>
              </li>
            ))}
          </ul>
        </Container>
      </Section>
    </article>
  )
}

/* -------------------------------------------------------------------------- */
/* Sub-components                                                              */
/* -------------------------------------------------------------------------- */

/** Verification collateral has no `ports` on its spec model at all. */
function portsOf(core: Core): readonly Port[] {
  return 'ports' in core.spec ? core.spec.ports : []
}

/** One offered node: its kind's fields, with "not offered" and gaps both visible. */
function NodeBlock({ core, node, strings }: { core: Core; node: ProcessNode; strings: Strings }) {
  const { cells, blocked } = specCellsAtNode(core, node)
  // A field blocked at this node is stated under the table, with its label: a
  // silently missing row would read as an authoring oversight.
  return (
    <div>
      <p className="mb-4 font-mono text-[13px] font-semibold text-ink">{strings.processNodes[node]}</p>
      <SpecCellTable cells={cells} />
      {blocked.length > 0 ? (
        <ul className="mt-3 space-y-1">
          {blocked.map((field) => (
            <li key={field} className="text-[13px] italic text-void">
              <span className="font-mono not-italic">
                {strings.specFields[field as keyof typeof strings.specFields]}
              </span>
              : {strings.cores.notOfferedAtNode}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function PortTable({
  ports,
  strings,
  t,
}: {
  ports: readonly Port[]
  strings: Strings
  t: (text: { tr: string; en: string }) => string
}) {
  return (
    <ul className="divide-y divide-line border-y border-line">
      {ports.map((port) => (
        <li key={port.name} className="grid gap-1.5 py-3.5 sm:grid-cols-[14rem,1fr] sm:items-baseline">
          <span className="font-mono text-[13px] text-ink">
            {port.name}
            {port.width > 1 ? `[${port.width}]` : ''}
          </span>
          <div className="min-w-0">
            {port.description ? <p className="text-[13px] leading-relaxed text-mist">{t(port.description)}</p> : null}
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-mist">
              {strings.portKinds[port.kind]} · {strings.portDirections[port.direction]}
              {port.standard ? ` · ${port.standard}` : ''}
            </p>
          </div>
        </li>
      ))}
    </ul>
  )
}

/**
 * The deliverable manifest for the selected tier. One column per attribute an
 * integrator acts on: format, size, version, and the node or port the file is
 * specific to when it has one — a file delivered per-port is not interchangeable.
 */
function DocumentTable({
  files,
  strings,
  t,
}: {
  files: readonly DocumentFile[]
  strings: Strings
  t: (text: { tr: string; en: string }) => string
}) {
  if (files.length === 0) {
    return <Prose className="pt-6">{strings.cores.noDocuments}</Prose>
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-y border-line text-left tabular">
        <thead>
          <tr className="border-b border-line text-[10px] uppercase tracking-[0.2em] text-mist">
            <th scope="col" className="py-3 pr-4 font-semibold">
              {strings.cores.documents}
            </th>
            <th scope="col" className="py-3 pr-4 font-semibold">Format</th>
            <th scope="col" className="py-3 pr-4 font-semibold">KB</th>
            <th scope="col" className="py-3 pr-4 font-semibold">Ver.</th>
            <th scope="col" className="py-3 pr-4 font-semibold">{strings.cores.node}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {files.map((file) => (
            <tr key={file.key} className="align-baseline">
              <td className="py-3 pr-4 text-[13px] text-ink">
                {t(file.label)}
                {file.requires !== null ? (
                  <span className="ml-3">
                    <Badge tone="muted">{strings.licenseTiers[file.requires]}</Badge>
                  </span>
                ) : null}
              </td>
              <td className="py-3 pr-4 font-mono text-[11px] uppercase text-mist">{file.format}</td>
              <td className="py-3 pr-4 font-mono text-[12px] text-mist">{file.sizeKb}</td>
              <td className="py-3 pr-4 font-mono text-[12px] text-mist">{file.version}</td>
              <td className="py-3 pr-4 font-mono text-[12px] text-mist">
                {file.node !== null ? strings.processNodes[file.node] : file.port ?? '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TierSelect({
  tier,
  onTier,
  strings,
}: {
  tier: LicenseTier
  onTier: (tier: LicenseTier) => void
  strings: Strings
}) {
  return (
    <Select
      value={tier}
      onChange={(event) => onTier(event.target.value as LicenseTier)}
      aria-label={strings.licences.tier}
    >
      {LICENSE_TIERS.map((id) => (
        <option key={id} value={id}>
          {strings.licenseTiers[id]}
        </option>
      ))}
    </Select>
  )
}

/**
 * The provenance legend, one line: the three bases with their badges. Sits
 * under the authored spec stack so a reader meets the notation where the
 * notation first appears.
 */
function ProvenanceLegend() {
  const { strings } = useSite()
  return (
    <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line pt-4">
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-mist">
        {strings.basis.legendTitle}
      </span>
      <FigureBadge figure={BASIS_FIGURES.measured} />
      <FigureBadge figure={BASIS_FIGURES.modelled} />
      <FigureBadge figure={BASIS_FIGURES.uncharacterised} />
    </div>
  )
}