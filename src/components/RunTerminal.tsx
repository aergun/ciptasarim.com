import { useEffect, useRef, useState } from 'react'
import { runScript, type RunGateOption, type RunLine } from '../../content/runlog.ts'
import { useSite } from '../lib/site.tsx'

/**
 * RunTerminal — the "inside a run" viewer, ported from the reference site's
 * live-session mockup and demo players, then re-grounded.
 *
 * The reference replays its agent's tool calls; this site has no agent, so
 * the honest analogue is the decision *this* site actually automates nothing
 * of: completing a characterisation record. The terminal replays that —
 * figures check out one by one, a gap is found, and the run stops at a GATE
 * where the reader must pick one of the two legitimate completions (write
 * the gap's reason, or compute-and-label as modelled). That is the demo
 * player's "Paused for you — approve & continue" gesture carrying this
 * site's own cargo: the pause is the provenance discipline.
 *
 * Interaction summary, matching the reference's players:
 *  - auto-plays when it scrolls into view (IntersectionObserver, once),
 *  - pauses at the gate until the reader approves an option,
 *  - has play/pause and replay controls,
 *  - phases tick in a rail, like the reference's numbered run steps,
 *  - `prefers-reduced-motion` renders the log in full (the gate stays
 *    interactive) instead of running on a timer.
 *
 * The dialogue comes from `content/runlog.ts` as `T`s; the chrome labels come
 * from the locale bundle, so nothing here is monolingual.
 */

const LINE_SPEED_MS = 850

type Phase = 'spec' | 'figures' | 'gate' | 'record'

const LINE_STYLES: Record<RunLine['kind'], { glyph: string; tone: string }> = {
  cmd: { glyph: '❯', tone: 'text-gold' },
  ok: { glyph: '✓', tone: 'text-proven' },
  info: { glyph: '·', tone: 'text-mist' },
  warn: { glyph: '!', tone: 'text-flare' },
  // The gate prompt carries its own panel and is not part of the line register.
}

export function RunTerminal({ phases, replayLabel }: { phases: Record<Phase, string>; replayLabel: string }) {
  const { t, strings } = useSite()
  const rootRef = useRef<HTMLDivElement>(null)

  /*
   * Chrome labels — `phases` and `replayLabel` — arrive from the locale bundle
   * via the page, so the viewer itself never hardcodes a string in one
   * language. The dialogue comes from `content/runlog.ts` as `T`s; the viewer
   * owns no copy of its own.
   */

  const [started, setStarted] = useState(false)
  const [playing, setPlaying] = useState(true)
  const [shown, setShown] = useState(0) // script lines revealed
  const [gateShown, setGateShown] = useState(false)
  const [chosen, setChosen] = useState<RunGateOption | null>(null)
  const [postShown, setPostShown] = useState(0) // epilogue lines revealed after the choice
  const [done, setDone] = useState(false)

  /* Start on first visibility only — a run that replays unwatched behind the
     fold is a timer nobody asked for. */
  useEffect(() => {
    const node = rootRef.current
    if (!node) return

    let reduceMotion = false
    if (typeof window.matchMedia === 'function') {
      reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setStarted(true)
            // With motion reduced there is no timer to watch, so the whole
            // log is on screen at once; the gate keeps its interaction.
            if (reduceMotion) {
              setPlaying(false)
              setShown(runScript.lines.length)
              setGateShown(true)
            }
            observer.disconnect()
          }
        }
      },
      { threshold: 0.3 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  /* The single pacing effect. It holds while the run is not playing, holds
     at the gate until an option is approved, and advances one line per tick
     otherwise. Each branch returns its own timeout cleanup, so a state change
     mid-line never double-fires. */
  useEffect(() => {
    if (!started || !playing) return

    if (chosen == null) {
      if (gateShown) return
      if (shown < runScript.lines.length) {
        const id = setTimeout(() => setShown((s) => s + 1), LINE_SPEED_MS)
        return () => clearTimeout(id)
      }
      const id = setTimeout(() => setGateShown(true), 600)
      return () => clearTimeout(id)
    }

    if (postShown < runScript.epilogue.length) {
      const id = setTimeout(() => setPostShown((s) => s + 1), LINE_SPEED_MS)
      return () => clearTimeout(id)
    }
    if (!done) {
      const id = setTimeout(() => setDone(true), 700)
      return () => clearTimeout(id)
    }
  }, [started, playing, shown, gateShown, chosen, postShown, done])

  const approve = (option: RunGateOption) => {
    if (chosen != null) return
    setChosen(option)
    setPlaying(true)
  }

  const replay = () => {
    setShown(0)
    setGateShown(false)
    setChosen(null)
    setPostShown(0)
    setDone(false)
    setPlaying(true)
    setStarted(true)
  }

  /* Phase derivation for the rail: which block the run is inside right now. */
  const currentPhase: Phase = done ? 'record' : gateShown || chosen != null ? 'gate' : shown < 2 ? 'spec' : 'figures'

  const lineRows = (lines: RunLine[], visibleCount: number) =>
    lines.slice(0, visibleCount).map((line, index) => {
      const style = LINE_STYLES[line.kind]
      return (
        <div key={index} className="flex gap-3 font-mono text-[12.5px] leading-relaxed">
          <span aria-hidden className={`${style.tone} shrink-0`}>{style.glyph}</span>
          <span className={line.kind === 'cmd' ? style.tone : 'text-mist'}>{t(line.text)}</span>
        </div>
      )
    })

  return (
    <div ref={rootRef} className="panel scanlines overflow-hidden">
      {/* Title bar */}
      <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3">
        <div className="flex min-w-0 items-center gap-3 font-mono text-[11px] tracking-wide">
          <span aria-hidden className="inline-block h-[7px] w-[7px] shrink-0 rounded-full bg-proven shadow-[0_0_8px_rgba(91,200,155,0.8)] animate-pulseDot" />
          <span className="truncate text-ink">
            dogrulama@{runScript.process} — {t(runScript.title)}
          </span>
        </div>
        <span className="shrink-0 rounded-full border border-gold/30 px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-gold">
          {strings.home.runLive}
        </span>
      </div>

      <div className="md:flex">
          {/* The log itself. min-h keeps the gate's arrival from jarring the
            layout — the box is sized for the finished run. */}
        <div className="min-h-[21rem] flex-1 space-y-2 px-5 py-5">
          {lineRows(runScript.lines, shown)}

          {/* The gate. Hidden until pre-choice lines finish; sticky after the
              choice so the record of the decision stays on screen. */}
          {gateShown ? (
            <div className={`panel-hot mt-4 rounded-xl p-4 ${chosen && !playing ? 'opacity-90' : ''}`}>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
                {t(runScript.gate.prompt)}
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-ink">{t(runScript.gate.question)}</p>
              <div className="mt-3 space-y-2" role="group" aria-label={t(runScript.gate.question)}>
                {runScript.gate.options.map((option, index) => {
                  const isChosen = chosen?.id === option.id
                  const isOtherChosen = chosen != null && !isChosen
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => approve(option)}
                      aria-pressed={isChosen}
                      disabled={chosen != null}
                      className={`flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left text-[13px] leading-relaxed transition-colors disabled:cursor-default ${
                        isChosen
                          ? 'border-gold/60 bg-gold/10 text-ink'
                          : isOtherChosen
                            ? 'border-line/60 text-mist/50'
                            : 'border-line text-mist hover:border-gold/50 hover:text-ink'
                      }`}
                    >
                      <span aria-hidden className={`mt-px font-mono ${isChosen ? 'text-gold' : 'text-mist'}`}>
                        {index + 1}
                      </span>
                      <span className={isChosen ? 'font-medium' : undefined}>{t(option.label)}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ) : null}

          {/* The choice's outcome and the epilogue after it. */}
          {chosen ? (
            <>
              <div className="mt-4 flex gap-3 font-mono text-[12.5px] leading-relaxed">
                <span aria-hidden className="shrink-0 text-proven">✓</span>
                <span className="text-mist">{t(chosen.outcome)}</span>
              </div>
              {postShown > 0 ? <div className="mt-2 space-y-2">{lineRows(runScript.epilogue, postShown)}</div> : null}
            </>
          ) : null}

          {done ? (
            <p className="mt-4 border-t border-line pt-3 font-mono text-[12px] text-gold">
              {t(runScript.close)}
              <span aria-hidden className="caret" />
            </p>
          ) : !gateShown ? (
            <span aria-hidden className="caret" />
          ) : null}
        </div>

        {/* The phase rail, the reference's numbered run steps reduced to the
            four blocks this run has. */}
        <aside className="border-t border-line px-5 py-4 md:w-56 md:border-l md:border-t-0 md:py-5">
          <ol className="space-y-3">
            {(Object.keys(phases) as Phase[]).map((phase, index) => {
              const isPast = index < PHASE_ORDER.indexOf(currentPhase)
              const isCurrent = phase === currentPhase
              return (
                <li key={phase} className="flex items-center gap-3 font-mono text-[11px] tracking-wide">
                  <span
                    aria-hidden
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[9px] ${
                      isCurrent
                        ? 'animate-pulseDot border-gold/60 bg-gold/10 text-gold'
                        : isPast
                          ? 'border-proven/40 text-proven'
                          : 'border-line text-mist/60'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className={isCurrent ? 'text-ink' : isPast ? 'text-mist' : 'text-mist/50'}>{phases[phase]}</span>
                </li>
              )
            })}
          </ol>
        </aside>
      </div>

      {/* Controls, the reference player's play bar reduced to what a log needs. */}
      <div className="flex items-center justify-between gap-4 border-t border-line px-5 py-3">
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          disabled={done || (gateShown && chosen == null)}
          className="text-[10px] font-semibold uppercase tracking-[0.18em] text-mist transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
        >
          {playing ? '❚❚' : '▶'}
        </button>
        <span className="font-mono text-[11px] text-mist tabular">
          {String(Math.min(shown, runScript.lines.length)).padStart(2, '0')}/{String(runScript.lines.length).padStart(2, '0')}
        </span>
        <button
          type="button"
          onClick={replay}
          className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold transition-colors hover:text-ink"
        >
          ↻ {replayLabel}
        </button>
      </div>
    </div>
  )
}

/** Phase order for the rail's past/current marking. */
const PHASE_ORDER: Phase[] = ['spec', 'figures', 'gate', 'record']