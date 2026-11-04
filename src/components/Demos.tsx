import { useState } from 'react'
import { demos } from '../../content/runlog.ts'
import { useSite } from '../lib/site.tsx'
import { RunTerminal } from './RunTerminal.tsx'
import { Eyebrow, Heading, Prose } from './ui.tsx'

/**
 * Demos — the home page's demo rail, ported from the reference site's
 * "Demos · one flow, four runs".
 *
 * Four scripted runs, one tab each, numbered like the reference's demo tabs.
 * Selecting a tab remounts the player (`key={demo.id}`), so each run starts
 * from its top and re-arms its IntersectionObserver — the reference's
 * "play as they reach the middle of the screen" behaviour, scoped to the
 * selected tab.
 *
 * The runs are the terminal replays in `content/runlog.ts` — see
 * `RunTerminal`'s header for why this site replays its own flows rather
 * than fabricating footage of tools it does not run.
 */

export function Demos() {
  const { strings, t } = useSite()
  const { demosEyebrow, demosTitle, demosBody, demosLive, demosReplay } = strings.home
  const [activeId, setActiveId] = useState(demos[0]?.id ?? 'record')

  const active = demos.find((demo) => demo.id === activeId) ?? demos[0]
  if (!active) return null

  return (
    <div>
      <Eyebrow>{demosEyebrow}</Eyebrow>
      <Heading className="mt-4">{demosTitle}</Heading>
      <Prose className="mt-6">{demosBody}</Prose>

      {/* The tab rail: numbered like the reference's demo tabs. */}
      <div className="mt-10 flex flex-wrap gap-2" role="tablist" aria-label={demosTitle}>
        {demos.map((demo, index) => {
          const isActive = demo.id === active.id
          return (
            <button
              key={demo.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveId(demo.id)}
              className={`min-h-[44px] rounded-full border px-4 py-2 font-mono text-[11px] tracking-wide transition-colors ${
                isActive
                  ? 'border-gold/60 bg-gold/10 text-gold'
                  : 'border-line text-mist hover:border-gold/40 hover:text-ink'
              }`}
            >
              <span aria-hidden className="mr-2 text-mist/70">{String(index + 1).padStart(2, '0')}</span>
              {t(demo.tab)}
            </button>
          )
        })}
      </div>

      {/* The active run's one-line summary above the player. */}
      <p className="mt-6 max-w-[62ch] text-[15px] leading-relaxed text-mist">{t(active.summary)}</p>

      {/* A key per tab: remount resets the script, timing and rail. */}
      <div className="mt-6 md:px-6">
        <RunTerminal key={active.id} demo={active} live={demosLive} replayLabel={demosReplay} />
      </div>
    </div>
  )
}