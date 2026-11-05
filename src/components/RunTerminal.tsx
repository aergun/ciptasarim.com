import { useEffect, useRef, useState } from 'react'
import type { DemoScript, RunGateOption, RunLine } from '../../content/runlog.ts'
import { useSite } from '../lib/site.tsx'

/**
 * RunTerminal — the demo player of the Demos section, ported from the
 * reference site's run-log players and re-grounded.
 *
 * The reference replays its agent's tool calls over demo videos; this site
 * has no agent and no honest footage to fabricate, so the player replays
 * *this site's own flows* as scripted terminal runs: figures checking out, a
 * model running with its assumptions, a gap rendering, a delivery package
 * being specified. Each script stops at a GATE where a real decision exists,
 * and the reader approves one of the legitimate completions to continue —
 * the reference's "Paused for you — approve & continue" gesture carrying
 * this site's provenance cargo.
 *
 * Interaction summary, matching the reference's players:
 *  - auto-plays when it scrolls into view (IntersectionObserver, once),
 *  - pauses at the gate until the reader approves an option,
 *  - has play/pause and replay controls,
 *  - ticks through the script's phases in a rail (per-demo milestones), the
 *    reference's numbered run steps,
 *  - `prefers-reduced-motion` renders the log in full (the gate stays
 *    interactive) instead of running on a timer.
 *
 * The dialogue comes from `content/runlog.ts` as `T`s; the chrome labels —
 * `live` and `replayLabel` — come from the locale bundle via the page, so no
 * string is authored in one language in two places.
 */

const LINE_SPEED_MS = 850

const LINE_STYLES: Record<RunLine['kind'], { glyph: string; tone: string }> = {
  cmd: { glyph: '❯', tone: 'text-gold' },
  ok: { glyph: '✓', tone: 'text-proven' },
  info: { glyph: '·', tone: 'text-mist' },
  warn: { glyph: '!', tone: 'text-flare' },
  // The gate prompt carries its own panel and is not part of the line register.
}

export function RunTerminal({
  demo,
  live,
  replayLabel,
  static: staticMode = false,
}: {
  demo: DemoScript
  live: string
  replayLabel: string
  static?: boolean
  /**
   * The prerendered branch of `/mcp`: the whole pre-gate log on screen at
   * once, holding at the gate. With no JS running there is no pacing to
   * animate and no option that could be clicked, so the terminal shows its
   * honest state — every observation up to the decision, and the decision
   * itself in front of the reader. No epilogue can render, because rendering
   * one would invent a choice nobody made.
   */
}) {
  const { t } = useSite()
  const rootRef = useRef<HTMLDivElement>(null)

  const [started, setStarted] = useState(false)
  const [playing, setPlaying] = useState(true)
  /* A static render cannot pace itself and has no viewer events to wait for; it
     arrives pre-played to the gate (the same final state reduced motion gets,
     minus the epilogue): every observation on screen, then the decision. No
     epilogue can render — rendering one would invent a choice nobody made. */
  const [shown, setShown] = useState(staticMode ? demo.lines.length : 0)
  const [gateShown, setGateShown] = useState(staticMode && demo.gate !== undefined)
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
              if (demo.gate) {
                setShown(demo.lines.length)
                setGateShown(true)
              } else {
                setShown(demo.lines.length + demo.epilogue.length)
                setDone(true)
              }
            }
            observer.disconnect()
          }
        }
      },
      { threshold: 0.3 },
    )

    observer.observe(node)
    return () => observer.disconnect()
    // One run per mount: the Demos section remounts the player per tab.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* The single pacing effect. It holds while the run is not playing, holds
     at the gate until an option is approved, and advances one line per tick
     otherwise. Each branch returns its own timeout cleanup, so a state change
     mid-line never double-fires. */
  useEffect(() => {
    if (!started || !playing || done) return

    if (chosen == null) {
      if (gateShown) return
      if (demo.gate && shown < demo.lines.length) {
        const id = setTimeout(() => setShown((s) => s + 1), LINE_SPEED_MS)
        return () => clearTimeout(id)
      }
      if (!demo.gate && shown < demo.lines.length + demo.epilogue.length) {
        const id = setTimeout(() => setShown((s) => s + 1), LINE_SPEED_MS)
        return () => clearTimeout(id)
      }
      if (demo.gate) {
        const id = setTimeout(() => setGateShown(true), 600)
        return () => clearTimeout(id)
      }
      const id = setTimeout(() => setDone(true), 700)
      return () => clearTimeout(id)
    }

    if (postShown < demo.epilogue.length) {
      const id = setTimeout(() => setPostShown((s) => s + 1), LINE_SPEED_MS)
      return () => clearTimeout(id)
    }
    const id = setTimeout(() => setDone(true), 700)
    return () => clearTimeout(id)
  }, [started, playing, shown, gateShown, chosen, postShown, done, demo])

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

  /*
   * The phase rail. Slots: the script's milestones, then — when the script
   * has a gate — the gate slot, then the close-out slot. Gateless scripts
   * (the calculator) reach their close-out slot by running the epilogue
   * straight off the last line; `shown` then counts into the epilogue, so
   * gateless rendering splits the two blocks at the milestone boundary.
   */
  const gateless = !demo.gate
  const bodyLines: RunLine[] = gateless ? [...demo.lines, ...demo.epilogue] : demo.lines
  const revealedGateless = Math.min(shown, bodyLines.length)

  const railSlots: { label: string; reached: boolean; current: boolean }[] = []
  {
    const startIdx = currentMilestone(demo, shown)
    demo.milestones.forEach((milestone, index) => {
      railSlots.push({
        label: t(milestone.label),
        reached: index <= startIdx,
        current: index === startIdx && !gateShown && chosen == null,
      })
    })
    if (demo.gate) {
      railSlots.push({
        label: t(demo.gate.railLabel),
        reached: gateShown || chosen != null,
        current: (gateShown || chosen != null) && !done,
      })
    }
    railSlots.push({
      label: t(demo.recordLabel),
      reached: done,
      current: done,
    })
  }

  const currentTone = (state: { reached: boolean; current: boolean }) =>
    state.current
      ? 'animate-pulseDot border-gold/60 bg-gold/10 text-gold'
      : state.reached
        ? 'border-proven/40 text-proven'
        : 'border-line text-mist/60'

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
            {demo.host}@ciptasarim — {t(demo.scriptTitle)}
          </span>
        </div>
        <span className="shrink-0 rounded-full border border-gold/30 px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-gold">
          {live}
        </span>
      </div>

      <div className="md:flex">
        {/* The log itself. min-h keeps the gate's arrival from jarring the
            layout — the box is sized for the finished run. */}
        <div className="min-h-[21rem] flex-1 space-y-2 px-5 py-5">
          {gateless ? lineRows(bodyLines, revealedGateless) : lineRows(demo.lines, shown)}

          {/* The gate. Hidden until pre-choice lines finish; sticky after the
              choice so the record of the decision stays on screen. */}
          {gateShown && demo.gate ? (
            <div className="panel-hot mt-4 rounded-xl p-4">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
                {t(demo.gate.prompt)}
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-ink">{t(demo.gate.question)}</p>
              <div className="mt-3 space-y-2" role="group" aria-label={t(demo.gate.question)}>
                {demo.gate.options.map((option, index) => {
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
              {lineRows(chosen.outcome, chosen.outcome.length)}
              {postShown > 0 ? <div className="mt-2 space-y-2">{lineRows(demo.epilogue, postShown)}</div> : null}
            </>
          ) : null}

          {done ? (
            <p className="mt-4 border-t border-line pt-3 font-mono text-[12px] text-gold">
              {t(demo.close)}
              <span aria-hidden className="caret" />
            </p>
          ) : !gateShown ? (
            <span aria-hidden className="caret" />
          ) : null}
        </div>

        {/* The phase rail, the reference's numbered run steps reduced to this
            script's blocks. */}
        <aside className="border-t border-line px-5 py-4 md:w-56 md:border-l md:border-t-0 md:py-5">
          <ol className="space-y-3">
            {railSlots.map((slot, index) => (
              <li key={index} className="flex items-center gap-3 font-mono text-[11px] tracking-wide">
                <span
                  aria-hidden
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[9px] ${currentTone(slot)}`}
                >
                  {index + 1}
                </span>
                <span className={slot.current ? 'text-ink' : slot.reached ? 'text-mist' : 'text-mist/50'}>
                  {slot.label}
                </span>
              </li>
            ))}
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
          {String(Math.min(shown, demo.lines.length)).padStart(2, '0')}/{String(demo.lines.length).padStart(2, '0')}
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

/** Which milestone is current: the last one whose line threshold is passed. */
function currentMilestone(demo: DemoScript, shown: number): number {
  let index = 0
  for (let i = 0; i < demo.milestones.length; i++) {
    const milestone = demo.milestones[i]
    if (milestone && shown >= milestone.afterLines) index = i
  }
  return index
}