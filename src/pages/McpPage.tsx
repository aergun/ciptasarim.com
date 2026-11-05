/**
 * McpPage — /mcp (+ /en/mcp), the addendum's centerpiece page.
 *
 * ## One page, two renderers
 *
 * The page renders twice. Live (in the SPA) its sections reveal on scroll, the
 * replay terminal paces itself and its gate waits for a click, and code blocks
 * carry copy buttons. Prerendered (build time, `scripts/prerender-mcp.ts`,
 * `mcpStaticMode() === true`) the same components render their static branches,
 * because "all /mcp content must render without JavaScript" is a hard
 * requirement: what arrives at crawlers and no-JS readers is full content —
 * only the pacing, the copy buttons and the replay's epilogue are client-side
 * state, and none of them hides what the page *claims*.
 *
 * ## Proof discipline
 *
 * Claims come from `content/mcp.ts`, never stronger than the upstream README
 * states them, always with their conditions shown. The replay carries the
 * ILLÜSTRATİF label structurally (badge + the script's own title). The demo
 * video is the upstream repo's real record, credited. No customer, benchmark
 * or endorsement exists anywhere on the page.
 *
 * PDK caution: the README's example PDK (cmos065) is named only as an
 * identifier. Every drawing here is generic redrawn geometry — no PDK files,
 * layer maps, rule decks, or layouts showing PDK-specific shapes.
 */

import { useEffect, useRef, useState } from 'react'
import type { T } from '../../shared/types.ts'
import {
  mcpEvidence,
  mcpFlow,
  mcpGuards,
  mcpInstallOneLiner,
  mcpPdkNotice,
  mcpSnippets,
  mcpTeaserEvidence,
  mcpTools,
  mcpTrademarkNotice,
  mcpUpstream,
} from '../../content/mcp.ts'
import { mcpReplay } from '../../content/mcplog.ts'
import { CodeBlock } from '../components/CodeBlock.tsx'
import { RunTerminal } from '../components/RunTerminal.tsx'
import { Reveal } from '../components/Reveal.tsx'
import { ButtonLink, Container, Eyebrow, Heading, PageHeader, Prose, Section } from '../components/ui.tsx'
import { useSite } from '../lib/site.tsx'
import { mcpStaticMode } from '../lib/staticMode.ts'

/* ---------------------------------------------------------------- */
/* The proof ledger — claims never shown without their conditions     */
/* ---------------------------------------------------------------- */

function EvidenceList({ entries }: { entries: readonly { claim: T; conditions: T; cite: T }[] }) {
  const { t, strings } = useSite()
  /* Each condition/source pair is its own div with exactly one dt–dd group —
     the dl's only valid row shapes; the earlier flat layout failed axe's
     definition-list rule on three pages. */
  return (
    <ul className="divide-y divide-line border-y border-line">
      {entries.map((entry, index) => (
        <li key={index} className="py-4">
          <p className="font-mono text-[15px] text-ink tabular">{t(entry.claim)}</p>
          <dl className="mt-2 space-y-1.5 text-[12px] leading-relaxed sm:grid sm:grid-cols-[8rem_1fr] sm:gap-x-5 sm:space-y-0">
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-mist sm:pt-px">
                {strings.mcp.proofConditionsLabel}
              </dt>
              <dd className="mt-1 text-mist sm:col-start-2 sm:row-start-1 sm:mt-0">{t(entry.conditions)}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-mist sm:pt-px">
                {strings.mcp.proofSourceLabel}
              </dt>
              <dd className="mt-1 text-mist sm:col-start-2 sm:row-start-2 sm:mt-0">{t(entry.cite)}</dd>
            </div>
          </dl>
        </li>
      ))}
    </ul>
  )
}

/* ---------------------------------------------------------------- */
/* Pipeline (b) — the closed-loop flow, drawn generic                 */
/* ---------------------------------------------------------------- */

/** Splits a title into at most two SVG lines at roughly the balance point. */
function twoLines(text: string): [string, string | null] {
  const words = text.split(' ')
  if (text.length <= 19 || words.length < 3) return [text, null]
  let best = words.length > 2 ? 2 : 1
  let bestLen = words.slice(0, best).join(' ').length
  for (let i = 1; i < words.length; i++) {
    const len = words.slice(0, i).join(' ').length
    if (Math.abs(len - (text.length - len)) < Math.abs(bestLen - (text.length - bestLen))) {
      best = i
      bestLen = len
    }
  }
  return [words.slice(0, best).join(' '), words.slice(best).join(' ')]
}

function McpPipeline({ entries }: { entries: readonly { n: number; title: T; tool: T }[] }) {
  const { t } = useSite()
  const BOX = 168
  const GAP = 20
  const ROW_H = 104
  const width = entries.length * BOX + (entries.length - 1) * GAP
  const height = ROW_H + 34

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="hidden w-full md:block" role="img" aria-hidden="true">
      {entries.map((stage, index) => {
        const x = index * (BOX + GAP)
        const [lineA, lineB] = twoLines(t(stage.title))
        /* The tool line, wrapped to the box: at most ~19 characters per
           SVG line, two lines maximum. */
        const toolFirst = t(stage.tool).split('—')[0]?.trim() ?? ''
        const toolWords: string[] = []
        {
          let current = ''
          for (const word of toolFirst.split(' ')) {
            if (current && (current + ' ' + word).length > 19) {
              toolWords.push(current)
              current = word
            } else {
              current = current ? current + ' ' + word : word
            }
          }
          if (current) toolWords.push(current)
        }
        const toolLines = toolWords.slice(0, 2)
        return (
          <g key={stage.n} className="mcp-stage" style={{ '--d': `${index * 120}ms` } as React.CSSProperties}>
            <rect x={x} y={8} width={BOX} height={ROW_H} rx={5} className="fill-paper/60 stroke-line" strokeWidth={1} />
            <text x={x + 12} y={30} className="fill-gold font-mono tabular" fontSize={11}>
              {String(stage.n).padStart(2, '0')}
            </text>
            <text x={x + 12} y={52} fontSize={12.5} className="fill-ink font-sans font-medium">
              {lineA}
            </text>
            {lineB ? (
              <text x={x + 12} y={68} fontSize={12.5} className="fill-ink font-sans font-medium">
                {lineB}
              </text>
            ) : null}
            {toolLines.map((line, lineIndex) => (
              <text key={lineIndex} x={x + 12} y={ROW_H - 5 - (toolLines.length - 1 - lineIndex) * 13} fontSize={10} className="fill-mist font-mono">
                {line}
              </text>
            ))}
            {index < entries.length - 1 ? (
              <g>
                <line x1={x + BOX + 3} y1={8 + ROW_H / 2} x2={x + BOX + GAP - 4} y2={8 + ROW_H / 2} className="stroke-gold" strokeWidth={1.4} />
                <path d={`M${x + BOX + GAP - 8} ${8 + ROW_H / 2 - 3.5}l7 3.5-7 3.5z`} className="fill-gold" />
              </g>
            ) : null}
          </g>
        )
      })}
      {/* The loop closing: the last stage's evidence feeds stage 1. */}
      <text x={width} y={height - 3} fontSize={10} textAnchor="end" className="fill-mist font-mono">
        ↺ closed loop
      </text>
    </svg>
  )
}

/* ---------------------------------------------------------------- */
/* Architecture (c) — original redraw of the README's diagram         */
/* ---------------------------------------------------------------- */

function McpArchitecture() {
  const { strings } = useSite()
  const s = strings.mcp

  const moduleChips = ['workboard', 'virtuoso', 'eldo', 'remote_control', 'report_issue']

  /** Per-cluster tool rows, from `strings.mcp.archTools` — identifiers kept
      verbatim where they are identifiers; the trailing notes are prose. */
  const clusterRows = [s.archTools.virtuoso, s.archTools.eldo, s.archTools.calibre, s.archTools.git, s.archTools.pdk].map(
    (text, index) => ({ key: index, text }),
  )

  const Column = ({ children }: { children: React.ReactNode }) => (
    <div className="panel flex flex-col p-5">{children}</div>
  )
  const titleRow = (label: string, note: string) => (
    <div className="mb-3">
      <p className="text-[13px] font-semibold text-ink">{label}</p>
      <p className="mt-0.5 font-mono text-[10px] text-mist">{note}</p>
    </div>
  )

  const conduit = ({ label, note }: { label: string; note: string }) => (
    <div aria-hidden className="conduit flex flex-col items-center justify-center gap-1 px-4 py-2 text-center">
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-gold">{label}</span>
      <span className="font-mono text-[10px] text-mist">{note}</span>
      <span className="text-[16px] leading-none text-gold">→</span>
    </div>
  )

  return (
    <div className="grid gap-0 lg:grid-cols-[1fr_auto_1fr_auto_1.2fr] lg:items-stretch lg:gap-0">
      <Column>
        {titleRow(s.archLocalTitle, s.archLocalNote)}
        <div className="rounded-md border border-line/70 bg-paper/40 px-3 py-3 font-mono text-[11px] leading-relaxed text-mist">
          <p className="text-gold">agent →</p>
          <p>stdio · IDE plugin</p>
          <p className="mt-1 text-mist">mcp_config: eda-mcp</p>
        </div>
      </Column>

      <div aria-hidden className="conduit hidden items-center justify-center px-3 lg:flex lg:flex-col">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-gold">stdio</span>
        <span className="text-[16px] leading-none text-gold">→</span>
      </div>

      <Column>
        {titleRow(s.archServerTitle, s.archServerNote)}
        <div className="flex flex-wrap gap-1.5">
          {moduleChips.map((chip) => (
            <span key={chip} className="rounded border border-line bg-paper/40 px-2 py-1 font-mono text-[10px] text-ink">
              {chip}
            </span>
          ))}
        </div>
      </Column>

      <div aria-hidden className="hidden flex-col items-center justify-center px-1 lg:flex lg:min-w-[10rem]">
        {conduit({ label: s.archSshTitle, note: s.archSshNote })}
      </div>
      {/* Compact connector for stacked layouts — the same statement, one line. */}
      <div className="flex items-center justify-center border-y border-line bg-paper/40 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-gold lg:hidden">
        {s.archSshTitle} — {s.archSshNote}
      </div>

      <Column>
        {titleRow(s.archRemoteTitle, s.archRemoteNote)}
        <ul className="space-y-1.5 font-mono text-[11px] leading-relaxed text-mist">
          {clusterRows.map((row) => (
            <li key={row.key} className="flex gap-2">
              <span aria-hidden className="text-gold">
                ▸
              </span>
              <span>{row.text}</span>
            </li>
          ))}
        </ul>
      </Column>
    </div>
  )
}

/* ---------------------------------------------------------------- */
/* Demo video (g) — lazy, credited, captioned                         */
/* ---------------------------------------------------------------- */

function McpDemoVideo() {
  const { strings } = useSite()
  const ref = useRef<HTMLVideoElement>(null)
  const [src, setSrc] = useState<string | null>(null)

  /* The 9.4 MB record loads only when it is nearly on screen, and only client
     side; the prerender ships the poster and the controls, so a no-JS reader
     sees the frame and its caption without the byte cost. */
  useEffect(() => {
    if (mcpStaticMode() || src || !ref.current) return
    const node = ref.current
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setSrc('/media/mcp/demo.mp4')
            observer.disconnect()
          }
        }
      },
      { rootMargin: '400px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [src])

  return (
    <figure>
      <video
        ref={ref}
        className="w-full rounded-lg border border-line bg-paper"
        poster="/media/mcp/demo-poster.webp"
        src={src ?? undefined}
        muted
        loop
        controls
        playsInline
        preload="none"
        aria-label={strings.mcp.demoVideoLabel}
      />
      <figcaption className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-[11px] text-mist">
        <span className="max-w-[60ch]">
          {strings.mcp.demoBody} {strings.mcp.demoSourceLabel}: {strings.mcp.demoSource}
        </span>
      </figcaption>
    </figure>
  )
}

/* ---------------------------------------------------------------- */
/* The reveal of the pipeline's cards — mobile + desktop detail       */
/* ---------------------------------------------------------------- */

function McpFlowCards() {
  const { t } = useSite()
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {mcpFlow.map((stage, index) => (
        <Reveal key={stage.n} delay={index * 90} className="panel p-5">
          <p className="font-mono text-[11px] text-gold tabular">{String(stage.n).padStart(2, '0')}</p>
          <p className="mt-1 text-[15px] font-semibold text-ink">{t(stage.title)}</p>
          <p className="mt-1.5 font-mono text-[11px] text-mist">{t(stage.tool)}</p>
          <p className="mt-2 text-[13px] leading-relaxed text-mist">{t(stage.detail)}</p>
        </Reveal>
      ))}
    </div>
  )
}

/* ---------------------------------------------------------------- */
/* The teaser the home page mounts                                    */
/* ---------------------------------------------------------------- */

export function McpTeaser() {
  const { strings } = useSite()
  const s = strings.mcp

  return (
    <Section id="mcp" className="scroll-mt-16">
      <Container>
        <Reveal>
          <Eyebrow>{s.teaserEyebrow}</Eyebrow>
          <div className="mt-4 flex flex-col gap-8 lg:flex-row lg:items-start">
            <div className="max-w-[34rem]">
              <Heading as="h2">{s.teaserTitle}</Heading>
              <Prose className="mt-4">{s.teaserBody}</Prose>
              <div className="mt-6 flex flex-wrap gap-3">
                <ButtonLink to="/mcp">{s.teaserCta}</ButtonLink>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-mist">{s.proofTitle}</p>
              <EvidenceList entries={mcpTeaserEvidence()} />
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  )
}

/* ---------------------------------------------------------------- */
/* The page                                                           */
/* ---------------------------------------------------------------- */

export function McpPage() {
  const { strings, t } = useSite()
  const s = strings.mcp
  const staticMode = mcpStaticMode()

  return (
    <article>
      {/* (a) What it is + the one-line install. */}
      <Container className="pb-14 pt-14 md:pb-20 md:pt-20">
        <PageHeader eyebrow={s.pageEyebrow} title={s.pageTitle} lede={<Prose className="!max-w-[62ch]">{s.pageLead}</Prose>} />
        <div className="mt-8 max-w-[44rem]">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-mist">{s.installLabel}</p>
          <CodeBlock code={mcpInstallOneLiner} lang="bash" />
          <p className="mt-3 text-[12px] leading-relaxed text-mist">{s.installNote}</p>
        </div>
      </Container>

      {/* (b) The pipelined flow. */}
      <Section className="bg-stage scroll-mt-16" id="akis">
        <Container>
          <Eyebrow>{s.pipelineEyebrow}</Eyebrow>
          <Heading as="h2" className="mt-4">
            {s.pipelineTitle}
          </Heading>
          <Prose className="mt-4">{s.pipelineBody}</Prose>
          <Reveal className="mt-10 panel p-5 md:p-7">
            <McpPipeline entries={mcpFlow} />
          </Reveal>
          <div className="mt-6">
            <McpFlowCards />
          </div>
        </Container>
      </Section>

      {/* (c) The architecture, redrawn original. */}
      <Section id="mimari">
        <Container>
          <Eyebrow>{s.archEyebrow}</Eyebrow>
          <Heading as="h2" className="mt-4">
            {s.archTitle}
          </Heading>
          <Prose className="mt-4">{s.archBody}</Prose>
          <Reveal className="mt-10">
            <McpArchitecture />
          </Reveal>
        </Container>
      </Section>

      {/* (d) The tool matrix, copied accurately. */}
      <Section className="bg-stage" id="araclar">
        <Container>
          <Eyebrow>{s.matrixEyebrow}</Eyebrow>
          <Heading as="h2" className="mt-4">
            {s.matrixTitle}
          </Heading>
          <Prose className="mt-4">{s.matrixBody}</Prose>
          <Reveal className="mt-8 overflow-x-auto" tabIndex={0} role="region" ariaLabel={s.matrixTitle}>
            <table className="w-full min-w-[40rem] border-collapse text-left">
              <thead>
                <tr className="border-b border-line font-mono text-[10px] uppercase tracking-[0.18em] text-mist">
                  <th scope="col" className="py-2 pr-4">{s.matrixModuleCol}</th>
                  <th scope="col" className="py-2 pr-4">{s.matrixActionsCol}</th>
                  <th scope="col" className="py-2">{s.matrixDescCol}</th>
                </tr>
              </thead>
              <tbody>
                {mcpTools.map((tool) => (
                  <tr key={tool.name} className="border-b border-line/60 align-top last:border-b-0">
                    <th scope="row" className="py-3 pr-4 font-mono text-[13px] font-medium text-ink">
                      {tool.name}
                    </th>
                    <td className="py-3 pr-4 font-mono text-[12px] leading-relaxed text-mist">{tool.actions}</td>
                    <td className="py-3 text-[13px] leading-relaxed text-mist">{t(tool.desc)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>
          {/* All four claims, each with its conditions — the teaser shows three. */}
          <div className="mt-10 max-w-[52rem]">
            <EvidenceList entries={mcpEvidence} />
          </div>
        </Container>
      </Section>

      {/* (e) Guard rails. */}
      <Section id="koruyucular">
        <Container>
          <Eyebrow>{s.guardsEyebrow}</Eyebrow>
          <Heading as="h2" className="mt-4">
            {s.guardsTitle}
          </Heading>
          <Prose className="mt-4">{s.guardsBody}</Prose>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {mcpGuards.map((guard, index) => (
              <Reveal key={index} delay={index * 80} className="panel p-6">
                <p className="text-[14px] font-semibold text-ink">{t(guard.title)}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-mist">{t(guard.body)}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* (f) The replay, labelled ILLUSTRATIVE. */}
      <Section className="bg-stage" id="oturum">
        <Container>
          <div className="flex flex-wrap items-center gap-4">
            <Eyebrow>{s.replayEyebrow}</Eyebrow>
            <span className="rounded-full border border-flare/50 px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-flare">
              {s.illustrative}
            </span>
          </div>
          <Heading as="h2" className="mt-4">
            {s.replayTitle}
          </Heading>
          <Prose className="mt-4 max-w-[52rem]">{s.replayBody}</Prose>
          <p className="mt-2 text-[11px] text-mist">{s.illustrativeNote}</p>
          <Reveal className="mt-8">
            <RunTerminal demo={mcpReplay} live={s.illustrative} replayLabel={strings.common.readMore} static={staticMode} />
          </Reveal>
        </Container>
      </Section>

      {/* (g) The real demo record. */}
      <Section id="demo">
        <Container>
          <Eyebrow>{s.demoEyebrow}</Eyebrow>
          <Heading as="h2" className="mt-4">
            {s.demoTitle}
          </Heading>
          <Prose className="mt-4">{s.demoBody}</Prose>
          <Reveal className="mt-8">
            <McpDemoVideo />
          </Reveal>
        </Container>
      </Section>

      {/* (h) Requirements + client snippets. */}
      <Section className="bg-stage" id="baslarken">
        <Container>
          <Eyebrow>{s.getStartedEyebrow}</Eyebrow>
          <Heading as="h2" className="mt-4">
            {s.getStartedTitle}
          </Heading>
          <Prose className="mt-4">{s.getStartedBody}</Prose>
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[20rem_1fr]">
            <div>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-mist">{s.requirementsTitle}</p>
              <ul className="space-y-2 text-[13px] leading-relaxed text-mist">
                {Object.values(s.requirements).map((requirement) => (
                  <li key={requirement} className="flex gap-2.5">
                    <span aria-hidden className="text-proven">
                      ✓
                    </span>
                    <span>{requirement}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-mist">{s.snippetsTitle}</p>
              {mcpSnippets.map((snippet) => (
                <div key={snippet.name}>
                  <p className="mb-2 font-mono text-[12px] text-ink">
                    {snippet.name} — <span className="text-mist">{t(snippet.target)}</span>
                  </p>
                  <CodeBlock code={snippet.code} lang={snippet.lang} name={snippet.name} />
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* (i) CTAs + trust. */}
      <Section id="dagitim">
        <Container>
          <div className="flex flex-wrap gap-3">
            <a
              href={mcpUpstream.repo}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-7 py-3 text-[11px] font-semibold uppercase tracking-wider text-paper transition-colors duration-200 hover:bg-flare hover:text-paper"
            >
              {s.githubCta} ↗
            </a>
            <a
              href={`${mcpUpstream.repo}#readme`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-ink px-7 py-3 text-[11px] font-semibold uppercase tracking-wider text-ink transition-colors duration-200 hover:bg-ink hover:text-paper"
            >
              {s.docsCta} ↗
            </a>
            <ButtonLink to="/iletisim" variant="ghost" className="!text-mist">
              {s.talkCta}
            </ButtonLink>
          </div>

          <div className="mt-12 grid gap-6 border-t border-line pt-8 md:grid-cols-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">{s.upstreamTitle}</p>
              <p className="mt-2 text-[12px] leading-relaxed text-mist">{t(mcpUpstream.credit)}</p>
              <p className="mt-2 font-mono text-[11px] text-mist">
                <a href={mcpUpstream.repo} target="_blank" rel="noreferrer" className="underline decoration-line underline-offset-4 hover:text-ink">
                  {mcpUpstream.repo}
                </a>
                {' · '}
                {s.licenceLabel}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">{s.noticeTrademarkTitle}</p>
              <p className="mt-2 text-[12px] leading-relaxed text-mist">{t(mcpTrademarkNotice)}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">{s.noticePdkTitle}</p>
              <p className="mt-2 text-[12px] leading-relaxed text-mist">{t(mcpPdkNotice)}</p>
            </div>
          </div>
        </Container>
      </Section>
    </article>
  )
}
