import { useEffect, useRef } from 'react'

/**
 * ScrubVideo — the cursor-scrubbed hero video, ported from the standalone
 * demo project and adapted to this site.
 *
 * The video does NOT autoplay on a fine-pointer device: the cursor scrubs its
 * timeline — right plays forward, left rewinds. It pauses frame-frozen on load
 * and only ever seeks, never plays. On a coarse pointer (touch) there is no
 * cursor to scrub with, so it falls back to a muted autoplay loop.
 *
 * ## Two adaptations from the demo version
 *
 *  1. **`absolute` in a full-viewport wrapper, not `fixed` to the page.** The
 *     demo site was nothing but the hero, so `fixed` and full-bleed were the
 *     same thing. The real home page has content below the folds, and a fixed
 *     video would stay pinned behind every scroll. Inside a `relative h-dvh
 *     overflow-hidden` wrapper, `absolute` renders identically in the
 *     placeholder and scrolls away with its section once the router lands.
 *
 *  2. **`src` is a prop, not the literal `/hero.mp4`.** The catalogue keeps
 *     every asset under `public/media/`, and a component driven by props is
 *     what step 8's home page mounts as-is.
 *
 * A `prefers-reduced-motion` device still scrubs — seeking is user-initiated
 * scroll-like positioning, not an animation — but the mute/loop autoplay
 * fallback on touch devices is a motion loop, and it is what the reduced-motion
 * media query in `index.css` cannot disable. Honour that flag by falling back
 * to the frozen first frame there: an inert video is the honest fallback for a
 * reader who has asked the page to stop moving.
 */
export function ScrubVideo({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)

  // Mutable refs for the scrub machinery — they drive seeks and must never
  // trigger a re-render (that would drop frames mid-gesture).
  /** Authoritative scrub position; `video.currentTime` lags while seeking. */
  const timeRef = useRef(0)
  /** Latest requested time when a seek is already in flight. */
  const pendingRef = useRef<number | null>(null)
  /** Previous mouse X, to compute the per-event delta. `null` until first move. */
  const prevXRef = useRef<number | null>(null)
  /** True once `loadedmetadata` has fired and scrubbing may begin. */
  const readyRef = useRef(false)

  // The "move your cursor" hint: dismissed on the first mousemove. Read by the
  // mousemove handler, dismissed by `CursorHint` — shared via document-level
  // attribute change, so it lives outside React state on purpose.
  const dismissHint = () => {
    const hint = document.querySelector<HTMLElement>('[data-cursor-hint]')
    if (hint && hint.dataset.dismissed !== 'true') {
      hint.dataset.dismissed = 'true'
      // CSS on [data-cursor-hint] transitions opacity → 0 from here.
      hint.style.opacity = '0'
    }
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    /* ------------------------------------------------------------------ */
    /* Touch fallback: no cursor exists, so let the video speak for itself. */
    /* ------------------------------------------------------------------ */
    const isTouch = window.matchMedia('(pointer: coarse)').matches
    if (isTouch) {
      video.style.opacity = '1'
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        // A reader who asked for no motion gets the frozen first frame.
        video.pause()
        return
      }
      video.loop = true // muted autoplay loop (attributes stay off the markup)
      video.play().catch(() => {
        // Autoplay refused (cold start); retry once the user touches.
        const kick = () => void video.play().catch(() => {})
        window.addEventListener('touchstart', kick, { once: true })
      })
      return
    }

    /* ------------------------------------------------------------------ */
    /* Desktop: freeze on the first frame until the cursor moves.          */
    /* ------------------------------------------------------------------ */
    const prime = () => {
      readyRef.current = true
      video.pause()
      video.currentTime = 0
      timeRef.current = 0
      video.style.opacity = '1'
    }
    // `loadedmetadata` guarantees `duration` is populated before scrubbing.
    if (video.readyState >= 1) {
      prime()
    } else {
      video.addEventListener('loadedmetadata', prime, { once: true })
    }

    /**
     * Seek to `target`, but no faster than the video can follow: while a seek
     * is in flight the latest request is parked in `pending` and picked up by
     * the `seeked` handler. This keeps rapid mouse deltas smooth instead of
     * flooding the decoder with interleaved seeks. We never call play().
     */
    const seekTo = (target: number) => {
      const duration = video.duration
      if (!Number.isFinite(duration)) return
      // Clamp to [0, duration]; shave a hair off the end so the final frame
      // never hangs on the browser's end-of-media state.
      const clamped = Math.min(Math.max(target, 0), Math.max(duration - 0.01, 0))
      timeRef.current = clamped
      pendingRef.current = clamped
      if (!video.seeking) video.currentTime = clamped
    }

    /** Pick up the next parked target the moment the previous seek lands. */
    const onSeeked = () => {
      const pending = pendingRef.current
      pendingRef.current = null
      if (pending !== null) video.currentTime = pending
    }

    /** mousemove → timeline: one full screen-width sweep ≈ 80% of the video. */
    const onMouseMove = (event: MouseEvent) => {
      if (!readyRef.current || !Number.isFinite(video.duration)) return

      const { clientX } = event
      const prevX = prevXRef.current
      prevXRef.current = clientX
      dismissHint() // the cursor has spoken — dismiss the hint
      if (prevX === null) return // first move only sets the baseline

      const delta = clientX - prevX
      const step = (delta / window.innerWidth) * 0.8 * video.duration
      seekTo(timeRef.current + step)
    }

    /**
     * Leaving the window parks the baseline so returning doesn't fling the
     * video across its whole timeline from one stale coordinate.
     */
    const parkBaseline = () => {
      prevXRef.current = null
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('blur', parkBaseline)
    document.documentElement.addEventListener('mouseleave', parkBaseline)
    video.addEventListener('seeked', onSeeked)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('blur', parkBaseline)
      document.documentElement.removeEventListener('mouseleave', parkBaseline)
      video.removeEventListener('seeked', onSeeked)
      video.removeEventListener('loadedmetadata', prime)
    }
  }, [])

  return (
    // Fades open only once metadata is up (or the loop is running), so the
    // fallback page colour behind it is never seen mid-load. object-position
    // 75% centers the subject on the right, keeping the left side clear for
    // the hero copy.
    <video
      ref={videoRef}
      className="absolute inset-0 z-0 h-full w-full object-cover opacity-0 transition-opacity duration-700"
      style={{ objectPosition: '75% center' }}
      src={src}
      muted
      playsInline
      preload="auto"
      /* Intentionally no `autoPlay` / `loop` — the cursor is the playhead. */
      aria-hidden="true"
    />
  )
}