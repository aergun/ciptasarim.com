/**
 * A core's image slot, and the honesty of its fallback.
 *
 * Real photography of packaged silicon does not exist for a catalogue of
 * characterisable-yet-placeholder IP, and a broken-image icon on a supplier's
 * card is worse than none. Here the slot renders the generated technical sheet
 * for *this* core — its block diagram, floorplan or test plan, drawn from its
 * real ports and figures — which is the same rule as yacht drawings rendered
 * from the real LOA: the fallback is not decoration, it is the drawing office.
 *
 * The media path follows no slot convention yet (no photography exists in this
 * project); `src` is therefore always the generated sheet today, and the
 * `onError` path is what changes the instant real artwork lands under
 * `public/media/cores/<slug>/`.
 */

import { useMemo, useState } from 'react'
import type { Core } from '../../shared/types.ts'
import { drawingFor } from './drawings.ts'

export function CoreImage({ core, className = '', alt }: { core: Core; className?: string; alt?: string }) {
  const fallback = useMemo(() => drawingFor(core), [core])
  const [failed, setFailed] = useState(false)

  const src = `/media/cores/${core.slug}/01-cover.jpg`

  return (
    failed ? (
      <img
        src={fallback}
        alt={`${core.name} — generated technical sheet`}
        className={`animate-fadeIn ${className}`}
        loading="lazy"
      />
    ) : (
      <img
        src={src}
        alt={alt ?? `${core.name} — product image`}
        className={className}
        loading="lazy"
        onError={() => setFailed(true)}
      />
    )
  )
}