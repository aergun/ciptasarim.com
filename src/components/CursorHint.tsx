import { useEffect, useState } from 'react'

/**
 * CursorHint — the subtle "move your cursor" nudge, ported from the video hero
 * demo and made bilingual: the label arrives as a prop, because the site's text
 * comes from the locale bundle, never hardcoded in a component.
 *
 * Fades itself out the first time the mouse moves (`ScrubVideo` sets
 * `data-dismissed` + opacity 0 on us; the CSS transition on
 * `[data-cursor-hint]` provides the fade). Never rendered on touch devices —
 * there is no cursor to tease.
 */
export function CursorHint({ label }: { label: string }) {
  const [isTouch, setIsTouch] = useState(true)

  useEffect(() => {
    // Resolve pointer type after mount so SSR/hydration mismatches can't bite.
    setIsTouch(window.matchMedia('(pointer: coarse)').matches)
  }, [])

  if (isTouch) return null

  return (
    /* Outer div owns the one-shot entrance animation (fill-mode both would
       otherwise pin opacity and defeat the fade below); inner div owns the
       dismissal fade — ScrubVideo flips our opacity to 0 on first mousemove. */
    <div className="rise [animation-delay:1800ms]">
      <div
        data-cursor-hint
        data-dismissed="false"
        className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-paper/70 transition-opacity duration-1000"
      >
        {label}
        <span aria-hidden className="nudge inline-block text-flare">
          →
        </span>
      </div>
    </div>
  )
}