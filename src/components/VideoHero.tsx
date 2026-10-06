import { LocaleLink } from '../lib/site.tsx'
import { ScrubVideo } from './ScrubVideo.tsx'
import { CursorHint } from './CursorHint.tsx'

/**
 * VideoHero — the cursor-scrubbed video hero, adapted from the standalone
 * demo to this site's palette and bilingual copy.
 *
 * Nothing here is hardcoded in either language: title, body, hint and the two
 * call-to-action labels all arrive from the locale bundle, because the ported
 * demo's rule was "the copy is markup, the video is footage" and the
 * catalogue's rule is stronger still — the copy is *locale data*.
 *
 * Two structural notes against the demo:
 *
 *  - The palette carries over as roles, not hexes: the demo's `gold`
 *    call-to-action is this site's `flare` (the accent that means "act now"), and
 *    its `bone`/`mist` text roles are `paper`/`paper/70`. The legibility scrim
 *    is ink rather than neutral black, and it must fade out before 46% of the
 *    width — the video's subject sits right of centre and a scrim over its
 *    face is the difference between footage and mud.
 *
 *  - The CTAs are `Link`s, not anchors: the routes they name exist in the
 *    catalogue plan (`/cekirdekler`, `/hesaplayicilar`) and step 8's router
 *    will fill them in; in the placeholder they navigate to the same shell,
 *    harmlessly.
 */
interface VideoHeroProps {
  title: string
  body: string
  hint: string
  ctas: { label: string; to: string }[]
}

export function VideoHero({ title, body, hint, ctas }: VideoHeroProps) {
  const [primary, secondary] = ctas

  return (
    <>
      <ScrubVideo src="/media/home/hero.mp4" />

      {/* Legibility scrim: fades the ink page colour in from the left edge,
          vanishing before it can ever touch the subject on the right. */}
      <div
        aria-hidden
        className="absolute inset-0 z-10 bg-[linear-gradient(92deg,rgba(11,22,32,0.82)_0%,rgba(11,22,32,0.46)_22%,rgba(11,22,32,0)_46%)]"
      />
      {/* Bottom scrim, mobile only: object-cover zooms the video in on small
          screens, so the pushed-to-bottom copy needs its own ground to sit on. */}
      <div
        aria-hidden
        className="absolute inset-0 z-10 bg-[linear-gradient(0deg,rgba(11,22,32,0.92)_0%,rgba(11,22,32,0.6)_30%,rgba(11,22,32,0)_62%)] sm:hidden"
      />

      {/* Hero copy — vertically centred on desktop, pushed to the bottom on
          mobile so the subject (top-right of frame) never sits behind text.
          The section swallows pointer events, so anything interactive inside
          re-enables them. */}
      <section className="pointer-events-none absolute inset-0 z-20 flex flex-col items-start justify-end px-5 pb-28 sm:justify-center sm:px-10 sm:pb-0 lg:px-20">
        <div className="max-w-[42rem]">
          <h1 className="rise font-sans text-[2.6rem] font-semibold leading-[1.04] tracking-tight text-paper [animation-delay:180ms] sm:text-6xl lg:text-7xl">
            {title}
          </h1>

          <p className="rise mt-5 max-w-md text-base leading-relaxed text-paper/80 [animation-delay:340ms] sm:mt-6 sm:text-lg">
            {body}
          </p>

          <div className="rise mt-8 flex flex-wrap gap-3 [animation-delay:500ms] sm:mt-10">
            {primary && (
              <LocaleLink
                to={primary.to}
                className="pointer-events-auto inline-flex items-center gap-2.5 bg-flare px-7 py-3.5 text-sm font-semibold tracking-wide text-paper transition-[transform,background-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-flare/90 hover:shadow-[0_12px_40px_-12px_rgba(217,84,30,0.55)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flare"
              >
                {primary.label}
                <span aria-hidden className="text-base leading-none">
                  →
                </span>
              </LocaleLink>
            )}
            {secondary && (
              <LocaleLink
                to={secondary.to}
                className="pointer-events-auto inline-flex items-center gap-2.5 border border-paper/40 px-7 py-3.5 text-sm font-semibold tracking-wide text-paper transition-colors duration-200 hover:border-paper hover:bg-paper/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flare"
              >
                {secondary.label}
              </LocaleLink>
            )}
          </div>

          <div className="rise mt-10 [animation-delay:1200ms] sm:mt-12">
            <CursorHint label={hint} />
          </div>
        </div>
      </section>
    </>
  )
}