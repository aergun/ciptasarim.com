import { useEffect, useRef, type ReactNode } from 'react'

/**
 * Reveal — scroll-triggered entrance, ported from the reference site's
 * scroll-triggered sections.
 *
 * A block starts translated and transparent; an IntersectionObserver adds
 * `.is-in` the first time it enters the viewport, and CSS carries the motion.
 * Two deliberate properties:
 *
 *  - **fire once.** A section that re-animates on every scroll pass reads as
 *    a gadget; the reference's sections likewise play once. `is-in` is never
 *    removed, and the observer disconnects after firing.
 *  - **no-JS is safe.** `.reveal` starts hidden only when JS can reveal it —
 *    this is a React-rendered block, so if this component mounted, JS is
 *    running. `prefers-reduced-motion` still skips the motion in CSS.
 *
 * The observer targets the wrapper itself, so children never need to know
 * they are revealed, and `delay` (ms) is a plain `transition-delay` for the
 * one layout that wants a stagger inside a single revealed block.
 */
export function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in')
            observer.disconnect()
          }
        }
      },
      // Reveal when roughly the top third of the block is visible — later
      // than `threshold: 0`, so tall sections do not trigger half a screen
      // below the fold, and earlier than `threshold: 1`, which never fires
      // for a section taller than the viewport.
      { threshold: 0.15 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={`reveal ${className}`} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </div>
  )
}