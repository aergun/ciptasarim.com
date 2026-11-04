import { useEffect, useRef } from 'react'
import { useSite } from '../lib/site.tsx'

/**
 * WaferScene — the reference site's interactive hero scene, re-grounded on
 * this site's register.
 *
 * The reference builds a CSS-3D common-centroid analog layout and lets the
 * reader drag it. This site's honest counterpart is a stylised die
 * floorplan drawn in the same language as `components/drawings.ts` (pad ring,
 * dashed core region, standard-cell rows, macro blocks, M1 straps, sheet
 * furniture) — regions only, and labelled as such. It tilts to the pointer
 * and can be turned by dragging, like the reference; both motions are
 * disabled under `prefers-reduced-motion`.
 *
 * Two notes on honesty:
 *  - on-canvas micro-labels stay English, matching the generated drawing
 *    sheets' furniture ("CIP TASARIM · PRELIMINARY"); the bilingual legend
 *    and caption below carry the meaning in both locales,
 *  - the scene deliberately shows *no* figures — it is furniture for the
 *    manifesto beside it, not a characterised drawing.
 */

const DRAG_SENSIBILITY = 0.35
const TILT_LIMIT = 16 // deg, pointer-follow tilt
const TURN_LIMIT = 28 // deg, drag turn accumulator

export function WaferScene() {
  const { strings } = useSite()
  const { waferHint, waferLegend, waferCaption } = strings.home
  const sceneRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scene = sceneRef.current
    if (!scene) return
    if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    let dragging = false
    let dragStartX = 0
    let baseTurn = 0 // deg turned so far, persists after a drag ends

    const onMove = (event: PointerEvent) => {
      if (dragging) {
        baseTurn = clamp(baseTurn + (event.clientX - dragStartX) * DRAG_SENSIBILITY, -TURN_LIMIT, TURN_LIMIT)
        dragStartX = event.clientX
      }
      const rect = scene.getBoundingClientRect()
      const x = (event.clientX - rect.left) / rect.width
      const y = (event.clientY - rect.top) / rect.height
      scene.style.setProperty('--ry', `${(clamp(x, -0.2, 1.2) - 0.5) * 2 * TILT_LIMIT + baseTurn}deg`)
      scene.style.setProperty('--rx', `${(0.5 - y) * TILT_LIMIT}deg`)
      scene.style.setProperty('--mx', `${event.clientX - rect.left}px`)
      scene.style.setProperty('--my', `${event.clientY - rect.top}px`)
    }

    const onDown = (event: PointerEvent) => {
      dragging = true
      dragStartX = event.clientX
      scene.classList.add('is-turning')
    }

    const onUp = () => {
      dragging = false
      scene.classList.remove('is-turning')
    }

    const onLeave = () => {
      dragging = false
      scene.classList.remove('is-turning')
      // Ease back to rest, keeping only the drag's accumulated turn.
      scene.style.setProperty('--rx', '0deg')
      scene.style.setProperty('--ry', `${baseTurn / 2}deg`)
    }

    scene.addEventListener('pointermove', onMove)
    scene.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    scene.addEventListener('pointerleave', onLeave)

    return () => {
      scene.removeEventListener('pointermove', onMove)
      scene.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      scene.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  const legend = [
    { chip: 'bg-gold/70 border-gold', label: waferLegend.pads },
    { chip: 'bg-gold/40 border-gold/60', label: waferLegend.rows },
    { chip: 'border-signal/60', label: waferLegend.macro },
    { chip: 'border-void/60', label: waferLegend.core },
  ]

  return (
    <figure className="m-0">
      <div
        ref={sceneRef}
        className="wafer relative overflow-hidden rounded-2xl border border-line bg-gradient-to-b from-[#140b12] to-[#0d070b] shadow-panel"
        style={{ aspectRatio: '4 / 3' }}
      >
        {/* The spotlight: a faint gold pool that follows the pointer, the
            reference's spotlight behaviour reduced to one gradient. */}
        <div aria-hidden className="wafer-spot absolute inset-0 z-10 rounded-2xl" />

        <div className="wafer-content absolute inset-0">
          <svg viewBox="0 0 400 300" className="absolute inset-0 h-full w-full" role="img" aria-label={waferCaption}>
            <PadRing />
            {/* Dashed core region. */}
            <rect x="36" y="30" width="328" height="240" fill="none" stroke="#7FB0DC" strokeWidth="0.8" strokeDasharray="6 4" opacity="0.75" />
            {/* Standard-cell rows. */}
            {Array.from({ length: 13 }, (_, i) => (
              <rect key={i} x="46" y={44 + i * 17} width="308" height="6" fill="#57384C" opacity="0.42" />
            ))}
            {/* M1 straps, gold over the rows. */}
            <rect x="36" y="88" width="328" height="9" fill="#C09657" opacity="0.6" />
            <rect x="36" y="196" width="328" height="9" fill="#C09657" opacity="0.6" />
            {/* Macro blocks: an SRAM and a mixed-signal macro, in the palette's
                cold-warm pair, like the reference's hot-card gradients. */}
            <g>
              <rect x="252" y="60" width="100" height="118" fill="#18284A" fillOpacity="0.55" stroke="#3A4F7A" strokeWidth="1" />
              <text x="302" y="122" textAnchor="middle" fontSize="9" fontFamily="monospace" letterSpacing="2" fill="#7FB0DC">SRAM</text>
            </g>
            <g>
              <rect x="46" y="130" width="120" height="86" fill="#631119" fillOpacity="0.45" stroke="#7A4650" strokeWidth="1" />
              <text x="106" y="177" textAnchor="middle" fontSize="9" fontFamily="monospace" letterSpacing="2" fill="#E07840">ANALOG</text>
            </g>
            {/* Core label. */}
            <text x="148" y="70" textAnchor="middle" fontSize="10" fontFamily="monospace" letterSpacing="4" fill="#F1E7E2" opacity="0.85">CORE</text>
            {/* Sheet furniture, English as on every generated drawing. */}
            <text x="36" y="286" fontSize="7" fontFamily="monospace" letterSpacing="1.4" fill="#8A7C85">REGIONS ONLY — NOT A SCALED PLACEMENT</text>
            <text x="364" y="286" fontSize="7" fontFamily="monospace" letterSpacing="1.4" fill="#C09657" textAnchor="end">CIP TASARIM</text>
          </svg>
        </div>
      </div>

      <figcaption className="mt-3 flex flex-col gap-2">
        <div className="flex flex-wrap gap-x-5 gap-y-1.5">
          {legend.map((entry) => (
            <span key={entry.label} className="flex items-center gap-2 font-mono text-[11px] tracking-wide text-mist">
              <span aria-hidden className={`inline-block h-2.5 w-2.5 rounded-[2px] border ${entry.chip}`} />
              {entry.label}
            </span>
          ))}
        </div>
        <p className="text-[12px] leading-relaxed text-mist">
          {waferCaption} <span className="text-gold">{waferHint}</span>
        </p>
      </figcaption>
    </figure>
  )
}

/* The perimeter pad ring: small pads in a loop around the sheet's frame. */
function PadRing() {
  const pads: React.ReactNode[] = []
  const pitch = 23
  for (let x = 40; x <= 360; x += pitch) {
    pads.push(
      <rect key={`t${x}`} x={x} y="16" width="11" height="8" fill="#C09657" opacity="0.5" />,
      <rect key={`b${x}`} x={x} y="276" width="11" height="8" fill="#C09657" opacity="0.5" />,
    )
  }
  for (let y = 34; y <= 260; y += pitch) {
    pads.push(
      <rect key={`l${y}`} x="20" y={y} width="8" height="11" fill="#C09657" opacity="0.5" />,
      <rect key={`r${y}`} x="372" y={y} width="8" height="11" fill="#C09657" opacity="0.5" />,
    )
  }
  return <g>{pads}</g>
}

const clamp = (value: number, low: number, high: number): number => Math.min(high, Math.max(low, value))