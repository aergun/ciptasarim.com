import { useSite } from '../lib/site.tsx'

/**
 * Architecture — the spec-to-delivery flow diagram on the home page, ported
 * from the reference site's architecture section and re-grounded.
 *
 * The reference draws an AI design agent's stack; this site's honest analogue
 * is the chain a buy actually travels here: you → catalogue → calculators →
 * quote → delivery, fed by two knowledge panels (the characterisation record
 * and the process-node table) and grounded on the foundry + PDK, which attach
 * only at quote time. Under it, the reference's meta-learning loops become
 * this site's two feedback cycles: the audit loop (scripts + compiler check
 * every figure's basis before it ships) and the measurement loop (every quote
 * feeds a real measurement back into the table).
 *
 * Layout is two deliberate variants, like the reference's expanded and
 * compact diagrams:
 *  - `md+`: the five flow nodes on one flex row, joined by glowing conduits;
 *    the knowledge panels hanging below their nodes on vertical conduits.
 *  - `mobile`: the same five nodes stacked as a vertical rail, connectors
 *    rotated, panels stacked after.
 *
 * All copy comes from the locale bundle (`home.arch*`); no node knows what a
 * core is beyond its string. The colour register follows the dark theme:
 * gold is structure only, and the basis chips reuse the provenance tones so
 * the diagram cannot lie about a colour's meaning.
 */

export function Architecture() {
  const { strings } = useSite()
  const { archNodes, archRecord, archTable, archFoundry, archLoops } = strings.home
  const basis = strings.basis

  const nodes = [archNodes.you, archNodes.catalogue, archNodes.calculators, archNodes.quote, archNodes.delivery]

  /** A flow node. `live` marks the node that is currently moving — the
      catalogue, which the audit loop continually re-verifies. */
  const Node = ({ label, caption, live }: { label: string; caption: string; live?: boolean }) => (
    <div className="flex min-w-0 flex-1 flex-col items-center text-center">
      <div className="relative inline-flex items-center gap-2 rounded-full border border-line bg-gradient-to-b from-[#160c14] to-[#0e070c] px-4 py-2 shadow-panel">
        <span aria-hidden className={`h-[5px] w-[5px] shrink-0 rounded-full bg-gold ${live ? 'animate-pulseDot shadow-[0_0_8px_currentColor]' : 'opacity-70 shadow-[0_0_8px_currentColor]'}`} />
        <span className="whitespace-nowrap font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-ink">
          {label}
        </span>
      </div>
      <p className="mt-2 max-w-[14rem] text-[11px] leading-relaxed text-mist">{caption}</p>
    </div>
  )

  /** A glowing horizontal connector segment; fills the gap between nodes. */
  const Conduit = () => (
    <div aria-hidden className="hidden h-px min-w-10 flex-1 self-center md:block">
      <div className="conduit h-px w-full" />
    </div>
  )

  return (
    <div>
      {/*
       * Desktop: one lane of five nodes with conduits between; the knowledge
       * layer hangs under its two consumers. The foundry shelf sits under the
       * whole lane like a floor — the reference's EDA-server bar.
       */}
      <div className="hidden md:block">
        <div className="flex items-start">
          {nodes.map((node, index) => (
            <div key={node.label} className="contents">
              {index > 0 ? <Conduit /> : null}
              <Node label={node.label} caption={node.caption} live={index === 1} />
            </div>
          ))}
        </div>

        {/* Knowledge layer: two panels on vertical conduits to the flow. */}
        <div className="mt-2 grid grid-cols-2 gap-6">
          <div className="flex flex-col items-center">
            <div aria-hidden className="conduit h-6 w-px" />
            <KnowledgePanel title={archRecord.title} caption={archRecord.caption}>
              <div className="mt-4 flex flex-wrap gap-2">
                <BasisChip tone="border-proven/40 text-proven" label={basis.measured} />
                <BasisChip tone="border-flare/40 text-flare" label={basis.modelled} />
                <BasisChip tone="border-line text-void" label={basis.uncharacterised} />
              </div>
            </KnowledgePanel>
          </div>
          <div className="flex flex-col items-center">
            <div aria-hidden className="conduit h-6 w-px" />
            <KnowledgePanel title={archTable.title} caption={archTable.caption}>
              <p className="mt-4 font-mono text-[11px] tracking-wide text-mist tabular">180 nm → 2 nm</p>
            </KnowledgePanel>
          </div>
        </div>

        {/* The foundry shelf. The reference's server bar; a confirmed PDK
            reference only attaches here, at quote time. */}
        <div className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-line bg-gradient-to-b from-[#140b12] to-[#0d070b] px-5 py-4">
          <div className="flex items-center gap-3">
            <span aria-hidden className="h-[7px] w-[7px] rounded-full bg-proven animate-pulseDot shadow-[0_0_8px_currentColor]" />
            <span className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-ink">{archFoundry.title}</span>
          </div>
          <p className="max-w-md text-[12px] leading-relaxed text-mist">{archFoundry.caption}</p>
        </div>
      </div>

      {/*
       * Mobile: the compact variant — nodes stacked as a vertical rail with
       * the same captions, panels stacked after, foundry last.
       */}
      <div className="md:hidden">
        <ol className="space-y-0">
          {nodes.map((node, index) => (
            <li key={node.label}>
              <div className="flex flex-col items-center rounded-xl border border-line bg-gradient-to-b from-[#160c14] to-[#0e070c] px-4 py-3">
                <span className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-ink">
                  {String(index + 1).padStart(2, '0')} · {node.label}
                </span>
                <span className="mt-1 text-center text-[11px] leading-relaxed text-mist">{node.caption}</span>
              </div>
              {index < nodes.length - 1 ? <div aria-hidden className="mx-auto h-5 w-px conduit" /> : null}
            </li>
          ))}
        </ol>

        <div className="mt-6 space-y-4">
          <KnowledgePanel title={archRecord.title} caption={archRecord.caption}>
            <div className="mt-3 flex flex-wrap gap-2">
              <BasisChip tone="border-proven/40 text-proven" label={basis.measured} />
              <BasisChip tone="border-flare/40 text-flare" label={basis.modelled} />
              <BasisChip tone="border-line text-void" label={basis.uncharacterised} />
            </div>
          </KnowledgePanel>
          <KnowledgePanel title={archTable.title} caption={archTable.caption}>
            <p className="mt-3 font-mono text-[11px] tracking-wide text-mist tabular">180 nm → 2 nm</p>
          </KnowledgePanel>
          <div className="rounded-xl border border-line bg-gradient-to-b from-[#140b12] to-[#0d070b] px-4 py-3">
            <span className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-ink">{archFoundry.title}</span>
            <p className="mt-1 text-[11px] leading-relaxed text-mist">{archFoundry.caption}</p>
          </div>
        </div>
      </div>

      {/* The two feedback loops, the reference's meta-learning section reduced
          to the cycles this site actually has. */}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {[archLoops.audit, archLoops.measure].map((loop) => (
          <div key={loop.title} className="rounded-xl border border-gold/25 bg-gold/[0.04] px-5 py-4">
            <p className="flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-gold">
              <span aria-hidden>↺</span>
              {loop.title}
            </p>
            <p className="mt-2 text-[12px] leading-relaxed text-mist">{loop.caption}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/** A knowledge-layer panel: title, one-line caption, then a slot of chips or a range. */
function KnowledgePanel({ title, caption, children }: { title: string; caption: string; children?: React.ReactNode }) {
  return (
    <div className="panel w-full max-w-sm px-5 py-4 text-left">
      <p className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-ink">{title}</p>
      <p className="mt-1.5 text-[12px] leading-relaxed text-mist">{caption}</p>
      {children}
    </div>
  )
}

/** A basis chip, reusing the provenance palette so the diagram cannot rename
    a semaphore. The tones mirror `figure.tsx`'s colour register. */
function BasisChip({ tone, label }: { tone: string; label: string }) {
  return (
    <span className={`rounded-full border bg-[#08040A]/70 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] ${tone}`}>
      {label}
    </span>
  )
}