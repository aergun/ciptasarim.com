/**
 * One technical note — /yazilar/:slug, rendered from the `ArticleBlock` union.
 *
 * The renderer is the reason the union exists: a note cannot quote an
 * engineering number as bare prose, because a number is either a `figure`
 * block (rendered through the provenance helpers, with its badge and colour
 * and its reason when uncharacterised) or a `tool` block (the calculation
 * re-run live on render, so a note and a calculator can never disagree). The
 * renderer adds nothing: it maps each block kind to the one presentation the
 * block's own type allows.
 *
 * The `tool` block is the only interactive part of a note — it runs
 * `runEngineering` on the block's `preset` inside an embedded panel with the
 * `EngineeringNotice` above the results, and links to the calculator so the
 * reader can change the preset rather than inherit it.
 */

import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import type { Article, ArticleBlock, FigureUnit, ToolId } from '../../shared/types.ts'
import {
  formatEngineering,
  formatDate,
  formatNumber,
  type Locale,
} from '../../shared/i18n.ts'
import { runEngineering, type EngineeringResult } from '../../shared/engineering.ts'
import { toolFor } from '../../content/tools.ts'
import { articles, articleBySlug } from '../../content/articles.ts'
import { FigureBadge, FigureGap, figureColor, figureValue, unitLabel } from '../components/figure.tsx'
import { LocaleLink, useSite } from '../lib/site.tsx'
import {
  ButtonLink,
  Container,
  EngineeringNotice,
  Heading,
  Notice,
  Prose,
  Section,
  Tag,
} from '../components/ui.tsx'
import { NotFound } from './NotFound.tsx'

/** Same result value formatting as `ToolPage` — three significant digits, no space before a percent. */
function resultValue(value: number, unit: FigureUnit, locale: Locale): string {
  const formatted =
    unit === 'count' || unit === 'USD' || unit === 'GE'
      ? formatNumber(value, locale, 0)
      : formatEngineering(value, locale, 3)
  const space = unit === 'percent' ? '' : ' '
  return `${formatted}${space}${unitLabel(unit, locale)}`
}

function basisClass(basis: 'measured' | 'modelled' | 'uncharacterised'): string {
  return basis === 'measured' ? 'fig-measured' : basis === 'modelled' ? 'fig-modelled' : 'fig-uncharacterised'
}

export function ArticlePage() {
  const { slug } = useParams()
  const { locale, strings, t } = useSite()

  const article: Article | null = useMemo(() => articleBySlug(slug ?? ''), [slug])
  if (!article) return <NotFound />

  /** Related = the rest of the notes, content order, current article excluded. */
  const related = articles.filter((other) => other.slug !== article.slug)

  return (
    <article>
      <Section className="pb-0 pt-14">
        <Container width="narrow">
          <LocaleLink
            to="/yazilar"
            className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mist hover:text-ink"
          >
            ← {strings.articles.back}
          </LocaleLink>

          <p className="eyebrow mt-8">
            {formatDate(article.date, locale)} · {article.readingMinutes} {strings.articles.readTime}
          </p>
          <Heading as="h1" className="mt-3">
            {t(article.title)}
          </Heading>
          <Prose className="mt-5 text-[17px]">{t(article.standfirst)}</Prose>
          <div className="mt-5 flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="py-14">
        <Container width="narrow">
          <BlocksOf blocks={article.blocks} />
        </Container>
      </Section>

      <Section className="pb-24 pt-0">
        <Container width="narrow">
          <Heading as="h3" className="mb-6">
            {strings.articles.related}
          </Heading>
          <ul className="divide-y divide-line border-y border-line">
            {related.map((other) => (
              <li key={other.slug}>
                <LocaleLink
                  to={`/yazilar/${other.slug}`}
                  className="flex items-baseline justify-between gap-6 py-4 text-ink hover:text-flare"
                >
                  <span className="text-[14px] font-medium">{t(other.title)}</span>
                  <span className="shrink-0 font-mono text-[11px] text-mist">
                    {formatDate(other.date, locale)}
                  </span>
                </LocaleLink>
              </li>
            ))}
          </ul>
          <p className="mt-8">
            <LocaleLink
              to="/yazilar"
              className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mist hover:text-ink"
            >
              ← {strings.articles.back}
            </LocaleLink>
          </p>
        </Container>
      </Section>
    </article>
  )
}

/**
 * The block renderer. One arm per member of the `ArticleBlock` union, and the
 * switch is exhaustive by typing — a new block kind is a compile error here,
 * rather than a silently unrendered paragraph.
 */
function BlocksOf({ blocks }: { blocks: readonly ArticleBlock[] }) {
  return (
    <div className="space-y-6">
      {blocks.map((block, index) => (
        <ArticleBlockView key={index} block={block} />
      ))}
    </div>
  )
}

function ArticleBlockView({ block }: { block: ArticleBlock }) {
  const { locale, t } = useSite()

  switch (block.kind) {
    case 'paragraph':
      return <Prose>{t(block.text)}</Prose>

    case 'heading':
      return <Heading as="h3">{t(block.text)}</Heading>

    case 'list':
      return (
        <ul className="list-disc space-y-2 pl-5 text-[15px] leading-[1.75] text-mist">
          {block.items.map((item, index) => (
            <li key={index}>{t(item)}</li>
          ))}
        </ul>
      )

    case 'quote':
      return (
        <blockquote className="border-l-2 border-ink pl-6">
          <p className="max-w-[52ch] text-[17px] italic leading-[1.6] text-ink">{t(block.text)}</p>
          {block.attribution ? (
            <footer className="mt-2 text-[12px] text-mist">{t(block.attribution)}</footer>
          ) : null}
        </blockquote>
      )

    case 'callout':
      return <Notice tone={block.tone === 'warning' ? 'error' : 'info'}>{t(block.text)}</Notice>

    case 'image':
      /* `src` may be a placeholder path; the browser renders a broken image and
         the page stays structurally honest — a fabricated fallback would be
         worse than the visible gap. */
      return (
        <figure className="my-8">
          <img src={block.src} alt={t(block.alt)} loading="lazy" className="w-full border border-line" />
          {block.caption ? (
            <figcaption className="mt-3 text-[12px] leading-relaxed text-mist">{t(block.caption)}</figcaption>
          ) : null}
        </figure>
      )

    case 'tool':
      return <ToolPreset toolId={block.tool} preset={block.preset} />

    case 'figure':
      return (
        <figure className="my-8 border-y border-line py-6">
          {block.figure.basis === 'uncharacterised' ? (
            <FigureGap figure={block.figure} />
          ) : (
            <p className={`font-mono text-[26px] tabular ${figureColor(block.figure)}`}>
              {figureValue(block.figure, locale)}
            </p>
          )}
          <div className="mt-2">
            <FigureBadge figure={block.figure} />
          </div>
          {block.figure.basis === 'modelled' ? (
            <p className="mt-2 text-[12px] leading-relaxed text-mist">
              {block.figure.model}
              {block.figure.note ? ` — ${block.figure.note}` : ''}
            </p>
          ) : null}
          {block.figure.basis === 'measured' ? (
            <p className="mt-2 text-[12px] leading-relaxed text-mist">
              {block.figure.conditions} · {block.figure.source}
            </p>
          ) : null}
          {block.caption ? (
            <figcaption className="mt-2 text-[12px] leading-relaxed text-mist">{t(block.caption)}</figcaption>
          ) : null}
        </figure>
      )

    default: {
      // Exhaustive-by-typing: if the union grows without a rendering arm, the
      // error names it here rather than the page rendering `undefined`.
      const unhandled: never = block
      void unhandled
      return null
    }
  }
}

/**
 * An embedded calculation. Runs the note's preset live — so the note's
 * numbers are the calculator's numbers by construction — and puts the
 * engineering notice above the results, as it is above them on the tool page.
 */
function ToolPreset({ toolId, preset }: { toolId: ToolId; preset?: Record<string, number> }) {
  const { locale, strings, t } = useSite()
  const results: EngineeringResult[] = useMemo(
    () => runEngineering(toolId, preset ?? {}),
    [toolId, preset],
  )
  const tool = toolFor(toolId)

  return (
    <div className="my-8 border border-line bg-stage px-6 py-6">
      <p className="eyebrow">
        {strings.tools.title} · {strings.tools.results}
      </p>
      {tool ? <p className="mt-2 font-mono text-[13px] text-ink">{t(tool.title)}</p> : null}

      <div className="mt-4">
        <EngineeringNotice />
      </div>

      <table className="mt-6 w-full border-y border-line text-left align-baseline">
        <tbody className="divide-y divide-line">
          {results.map((result) => (
            <tr key={result.id}>
              <td className="py-3 pr-4 text-[12px] font-semibold uppercase tracking-[0.14em] text-mist">
                {t(result.label)}
              </td>
              <td className="py-3 text-right font-mono text-[14px] tabular">
                <span className={basisClass(result.basis)}>
                  {resultValue(result.value, result.unit, locale)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {tool ? (
        <div className="mt-6">
          <ButtonLink to={`/hesaplayicilar/${tool.slug}`} variant="secondary">
            {strings.tools.openTool}
          </ButtonLink>
        </div>
      ) : null}
    </div>
  )
}