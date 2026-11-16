/**
 * A pixel-faithful replica of SkyCadEda's GOAL v2 announcement page
 * (skycadeda.github.io/blog/layout-automation-v2), carried in place on
 * /cekirdekler with the owner's permission.
 *
 * Everything the original page renders is reproduced in its own markup and
 * vocabulary — title, byline, prose, the 34-cell gallery with the client-
 * drawn half-cell overlay, the zoomable layout/schematic lightbox and the
 * 8-bit SAR ADC plate — against the panel's own fonts and light theme,
 * self-hosted under /skycadeda/layout-automation-v2. The replica's numbers
 * and badges are the announcement's own figures, not catalogue measurements:
 * the surrounding frame (see `Cores.tsx` and the site note) is where the
 * evaluation lives.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { SkyCadCell } from '../../content/skycadeda-cells.ts'
import { SKYCAD_CELLS } from '../../content/skycadeda-cells.ts'

/** Mirror of the original page's assets, self-hosted. */
const BASE = '/skycadeda/layout-automation-v2'

/* ---------------------------------------------------------------- helpers */
/* Same behaviour as the original page's own JS. */

const pretty = (name: string) =>
  name.replace(/_/g, ' ').replace(/\bota 5t\b/, 'ota 5t').replace(/\bxsymm\b/, '(x-symmetry)')

const fmt = (x: number, d = 1) =>
  Number(x).toLocaleString('en-US', { maximumFractionDigits: d, minimumFractionDigits: d })

const SCH_NAMES = new Set([
  'adc_comparator',
  'analog_mux_4to1',
  'bandgap_reference',
  'bias_generator',
  'cascode_mirror_bank',
  'charge_pump',
  'class_ab_output',
  'ct_comparator_hyst',
  'current_steering_cell',
  'delay_line_8',
  'double_tail_comparator',
  'fd_folded_cascode',
  'fd_two_stage',
  'folded_cascode',
  'fvf_buffer',
  'gilbert_mixer',
  'ldo_10ma',
  'lvt_cascode_mirror',
  'maneatis_delay_cell',
  'nonoverlap_clockgen',
  'ota_5t',
  'power_switch_driver',
  'rail_to_rail_input',
  'ring_osc_hier',
  'ring_vco',
  'schmitt_trigger',
  'sense_amp_latch',
  'starved_vco',
  'strongarm_comparator',
  'subthreshold_reference',
  'telescopic',
  'tg_dff_reset',
  'tspc_divider',
])
const schOf = (n: string) => (SCH_NAMES.has(n) ? `${BASE}/sch/${n}.svg` : null)

/**
 * The half-cell overlay, drawn on the client exactly as the original draws
 * it: tint the leaf rectangles in their side's colour, outline every
 * rectangle, dash one axis per mirrored pair.
 */
function Overlay({ c }: { c: SkyCadCell }) {
  return useMemo(() => {
    const hs = c.halves
    const inside = (a: SkyCadCell['halves'][number], b: SkyCadCell['halves'][number]) =>
      a !== b &&
      a.b[0] >= b.b[0] - 1e-4 && a.b[2] <= b.b[2] + 1e-4 &&
      a.b[1] >= b.b[1] - 1e-4 && a.b[3] <= b.b[3] + 1e-4
    const leaf = (h: SkyCadCell['halves'][number]) => !hs.some((o) => inside(o, h))
    const S = (v: number) => v * 1000
    const byC: Record<string, SkyCadCell['halves']> = {}
    hs.forEach((h) => {
      ;(byC[h.c] = byC[h.c] ?? []).push(h)
    })
    const lines: React.ReactElement[] = []
    Object.values(byC).forEach((l) => {
      l.filter((h) => !h.m).forEach((p) =>
        l.filter((h) => h.m).forEach((q) => {
          let a: [number, number] | null = null
          let b: [number, number] | null = null
          if (Math.abs(p.b[1] - q.b[1]) < 0.01 && Math.abs(p.b[3] - q.b[3]) < 0.01) {
            const x = (Math.min(p.b[2], q.b[2]) + Math.max(p.b[0], q.b[0])) / 2
            a = [x, S(Math.min(p.b[1], q.b[1]))]
            b = [x, S(Math.max(p.b[3], q.b[3]))]
          } else if (Math.abs(p.b[0] - q.b[0]) < 0.01 && Math.abs(p.b[2] - q.b[2]) < 0.01) {
            const y = (Math.min(p.b[3], q.b[3]) + Math.max(p.b[1], q.b[1])) / 2
            a = [S(Math.min(p.b[0], q.b[0])), y]
            b = [S(Math.max(p.b[2], q.b[2])), y]
          }
          if (a && b) {
            lines.push(
              <line
                key={`${c.name}-${a[0]}-${a[1]}`}
                x1={a[0]}
                y1={a[1]}
                x2={b[0]}
                y2={b[1]}
                stroke="#c8003c"
                strokeWidth={2.5}
                strokeDasharray="7 5"
                vectorEffect="non-scaling-stroke"
              />,
            )
          }
        }),
      )
    })
    const rects = [...hs]
      .sort(
        (a, b) =>
          (b.b[2] - b.b[0]) * (b.b[3] - b.b[1]) - (a.b[2] - a.b[0]) * (a.b[3] - a.b[1]),
      )
      .map((h, i) => (
        <rect
          key={`${c.name}-h${i}`}
          x={S(h.b[0])}
          y={S(h.b[1])}
          width={S(h.b[2] - h.b[0])}
          height={S(h.b[3] - h.b[1])}
          fill={h.m ? '#ff8c00' : '#1e6eff'}
          fillOpacity={leaf(h) ? 0.13 : 0}
          stroke={h.m ? '#ff8c00' : '#1e6eff'}
          strokeWidth={leaf(h) ? 2 : 3.5}
          vectorEffect="non-scaling-stroke"
        />
      ))
    return (
      <svg className="ov" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">
        {rects}
        {lines}
      </svg>
    )
  }, [c])
}

/* --------------------------------------------------------------- gallery */

function CellCard({ c, onOpen }: { c: SkyCadCell; onOpen: (c: SkyCadCell) => void }) {
  const clean = c.drc.every((v) => v === 0) && c.lvs.every((v) => v === 'match')
  return (
    <button
      type="button"
      className="card"
      aria-label={`${pretty(c.name)}: open full layout`}
      onClick={() => onOpen(c)}
    >
      <div className="pic">
        <div className="fit">
          <img
            src={`${BASE}/gallery/${c.name}.webp`}
            alt={`${pretty(c.name)} layout`}
            loading="lazy"
            width={900}
            height={Math.round((900 * c.px[1]) / c.px[0])}
          />
          <Overlay c={c} />
        </div>
      </div>
      <div className="info">
        <div className="nm">{pretty(c.name)}</div>
        <div className="dt">
          {c.dev} devices · {fmt(c.w, 2)} × {fmt(c.h, 2)} µm · {fmt(c.ms, 1)} ms
        </div>
        <div className="badges">
          {clean ? <span className="badge ok">DRC 0 · LVS match</span> : <span className="badge">see notes</span>}
          {c.matched ? <span className="badge m">matched layout</span> : null}
          {c.sym === 'x' ? <span className="badge m">x-symmetry</span> : null}
          {c.hier ? <span className="badge m">blocks</span> : null}
        </div>
      </div>
    </button>
  )
}

/* -------------------------------------------------------------- lightbox */

type LbTarget = { src: string; title: string; sub: string; cell: SkyCadCell | null; sch: string | null }

/** The vector CSS injected into the lightbox's shadow root, as in the original. */
const LB_SVG_CSS =
  '<style>:host{display:block}.wrap{position:absolute;inset:0}.wrap>svg{position:absolute;left:0;top:0;width:100%;height:100%;overflow:visible;transform-origin:0 0}.hide-halves .halves{display:none}</style>'

const svgTexts = new Map<string, Promise<string>>()
const getText = (src: string) => {
  if (!svgTexts.has(src))
    svgTexts.set(
      src,
      fetch(src).then((r) => {
        if (!r.ok) throw new Error(String(r.status))
        return r.text()
      }),
    )
  return svgTexts.get(src)!
}

function Lightbox({ target, onClose }: { target: LbTarget; onClose: () => void }) {
  const [view, setView] = useState<'lay' | 'sch'>('lay')
  const [halvesOn, setHalvesOn] = useState(true)
  /** Non-null: the bitmap fallback is showing this source. */
  const [bitmapSrc, setBitmapSrc] = useState<string | null>(null)
  const [bitmapAlt, setBitmapAlt] = useState('')

  const vpRef = useRef<HTMLDivElement | null>(null)
  const cvRef = useRef<HTMLDivElement | null>(null)
  const svRef = useRef<HTMLDivElement | null>(null)
  const imRef = useRef<HTMLImageElement | null>(null)
  const closeRef = useRef<HTMLButtonElement | null>(null)

  const srootRef = useRef<ShadowRoot | null>(null)
  const svgElRef = useRef<SVGSVGElement | null>(null)
  /** Attaches the shadow root the vector branch renders into, once. */
  const attachSv = useCallback((el: HTMLDivElement | null) => {
    svRef.current = el
    if (el && !srootRef.current && el.attachShadow) srootRef.current = el.attachShadow({ mode: 'open' })
  }, [])
  const seqRef = useRef(0)
  const commitTRef = useRef(0)
  const lastFocusRef = useRef<Element | null>(null)
  const targetRef = useRef(target)

  // The zoom state, straight from the original: bitmap uses translate+scale,
  // vector keeps the view's corner and units-per-screen-px, with the viewBox
  // catching up only when motion pauses.
  const Z = useRef({ mode: 'svg' as 'svg' | 'img', s: 1, x: 0, y: 0, w: 1, h: 1, fit: 1 })
  const V = useRef({ x: 0, y: 0, k: 1, fitk: 1, vb: [0, 0, 1, 1] as [number, number, number, number] })
  const C = useRef({ x: 0, y: 0, k: 1 })

  const vpSize = () =>
    vpRef.current?.getBoundingClientRect() ?? { width: 1, height: 1 }

  const commit = useCallback(() => {
    window.clearTimeout(commitTRef.current)
    const svgEl = svgElRef.current
    if (!svgEl) return
    const { width: W, height: H } = vpSize()
    const v = V.current
    svgEl.setAttribute('viewBox', `${v.x} ${v.y} ${W * v.k} ${H * v.k}`)
    svgEl.style.transform = ''
    C.current = { x: v.x, y: v.y, k: v.k }
  }, [])

  const apply = useCallback(() => {
    if (Z.current.mode === 'img') {
      const cv = cvRef.current
      if (cv) cv.style.transform = `translate(${Z.current.x}px, ${Z.current.y}px) scale(${Z.current.s})`
      return
    }
    const svgEl = svgElRef.current
    const c = C.current
    const v = V.current
    if (svgEl) {
      svgEl.style.transform = `translate(${(c.x - v.x) / v.k}px, ${(c.y - v.y) / v.k}px) scale(${c.k / v.k})`
      window.clearTimeout(commitTRef.current)
      commitTRef.current = window.setTimeout(commit, 140)
    }
  }, [commit])

  const fitView = useCallback(() => {
    const { width: W, height: H } = vpSize()
    const z = Z.current
    if (z.mode === 'img') {
      z.fit = Math.min(W / z.w, H / z.h)
      z.s = z.fit
      z.x = (W - z.w * z.s) / 2
      z.y = (H - z.h * z.s) / 2
      apply()
      return
    }
    const v = V.current
    const [x, y, w, h] = v.vb
    v.k = v.fitk = Math.max(w / W, h / H) * 1.02
    v.x = x + w / 2 - (W * v.k) / 2
    v.y = y + h / 2 - (H * v.k) / 2
    commit()
  }, [apply, commit])

  const zoomAt = useCallback(
    (px: number, py: number, f: number) => {
      const z = Z.current
      if (z.mode === 'img') {
        const s = Math.min(Math.max(z.s * f, z.fit * 0.5), Math.max(z.fit * 40, 6))
        z.x = px - ((px - z.x) * s) / z.s
        z.y = py - ((py - z.y) * s) / z.s
        z.s = s
        apply()
        return
      }
      const v = V.current
      const k = Math.min(Math.max(v.k / f, v.fitk / 300), v.fitk * 2)
      v.x += px * (v.k - k)
      v.y += py * (v.k - k)
      v.k = k
      apply()
    },
    [apply],
  )

  const panBy = useCallback(
    (dx: number, dy: number) => {
      const z = Z.current
      const v = V.current
      if (z.mode === 'img') {
        z.x += dx
        z.y += dy
      } else {
        v.x -= dx * v.k
        v.y -= dy * v.k
      }
      apply()
    },
    [apply],
  )

  const setHalves = useCallback(
    (on: boolean) => {
      cvRef.current?.classList.toggle('hide-ov', !on)
      const wrap = srootRef.current?.querySelector('.wrap')
      wrap?.classList.toggle('hide-halves', !on)
    },
    [],
  )

  const asBitmap = useCallback((src: string) => {
    Z.current.mode = 'img'
    svgElRef.current = null
    setBitmapSrc(src)
  }, [])

  const show = useCallback(
    (which: 'lay' | 'sch') => {
      const seq = ++seqRef.current
      const src = which === 'sch' ? targetRef.current.sch : targetRef.current.src
      if (!src) return
      cvRef.current?.querySelectorAll('svg.ov').forEach((x) => x.remove())
      const label = (which === 'sch' ? 'Schematic of ' : 'Layout of ') + targetRef.current.title
      setBitmapAlt(label)
      svRef.current?.setAttribute('aria-label', label)
      setBitmapSrc(null)
      if (!/\.svg$/.test(src) || !srootRef.current) return asBitmap(src)
      getText(src)
        .then((txt) => {
          if (seq !== seqRef.current) return
          Z.current.mode = 'svg'
          setBitmapSrc(null)
          const sroot = srootRef.current!
          sroot.innerHTML = LB_SVG_CSS + '<div class="wrap">' + txt + '</div>'
          const svgEl = sroot.querySelector('.wrap > svg') as SVGSVGElement | null
          svgElRef.current = svgEl
          if (!svgEl) return asBitmap(src)
          V.current.vb = (svgEl.getAttribute('viewBox') ?? '0 0 1 1').trim().split(/[\s,]+/).map(Number) as [
            number,
            number,
            number,
            number,
          ]
          svgEl.removeAttribute('width')
          svgEl.removeAttribute('height')
          svgEl.setAttribute('preserveAspectRatio', 'none')
          setHalves(halvesOn)
          fitView()
        })
        .catch(() => {
          if (seq === seqRef.current)
            asBitmap(src)
        })
    },
    [asBitmap, fitView, halvesOn, setHalves],
  )

  // A new target: reset to the layout view, focus the close button, lock scroll.
  useEffect(() => {
    targetRef.current = target
    seqRef.current++
    setView('lay')
    setHalvesOn(true)
    setBitmapSrc(null)
    lastFocusRef.current = document.activeElement
    show('lay')
    window.setTimeout(() => closeRef.current?.focus(), 0)
    return () => {
      seqRef.current++
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target.src])

  // Scroll lock while the lightbox is up (the original hides body overflow).
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  // Non-passive wheel + pointer zoom/pan, as in the original.
  useEffect(() => {
    const vp = vpRef.current
    if (!vp) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const r = vp.getBoundingClientRect()
      zoomAt(e.clientX - r.left, e.clientY - r.top, Math.exp(-e.deltaY * (e.deltaMode === 1 ? 0.05 : 0.0018)))
    }
    const ptrs = new Map<number, [number, number]>()
    let pinch: number | null = null
    const onDown = (e: PointerEvent) => {
      vp.setPointerCapture(e.pointerId)
      ptrs.set(e.pointerId, [e.clientX, e.clientY])
      vp.classList.add('drag')
    }
    const onMove = (e: PointerEvent) => {
      if (!ptrs.has(e.pointerId)) return
      const [px, py] = ptrs.get(e.pointerId)!
      ptrs.set(e.pointerId, [e.clientX, e.clientY])
      if (ptrs.size === 2) {
        const values = [...ptrs.values()]
        const a = values[0]
        const b = values[1]
        if (!a || !b) return
        const d = Math.hypot(a[0] - b[0], a[1] - b[1])
        const r = vp.getBoundingClientRect()
        const cx = (a[0] + b[0]) / 2 - r.left
        const cy = (a[1] + b[1]) / 2 - r.top
        if (pinch) zoomAt(cx, cy, d / pinch)
        pinch = d
      } else {
        panBy(e.clientX - px, e.clientY - py)
      }
    }
    const up = (e: PointerEvent) => {
      ptrs.delete(e.pointerId)
      if (ptrs.size < 2) pinch = null
      if (!ptrs.size) vp.classList.remove('drag')
    }
    const onDbl = () => fitView()
    vp.addEventListener('wheel', onWheel, { passive: false })
    vp.addEventListener('pointerdown', onDown)
    vp.addEventListener('pointermove', onMove)
    vp.addEventListener('pointerup', up)
    vp.addEventListener('pointercancel', up)
    vp.addEventListener('dblclick', onDbl)
    const onResize = () => fitView()
    window.addEventListener('resize', onResize)
    return () => {
      vp.removeEventListener('wheel', onWheel)
      vp.removeEventListener('pointerdown', onDown)
      vp.removeEventListener('pointermove', onMove)
      vp.removeEventListener('pointerup', up)
      vp.removeEventListener('pointercancel', up)
      vp.removeEventListener('dblclick', onDbl)
      window.removeEventListener('resize', onResize)
    }
  }, [fitView, panBy, zoomAt])

  // Keys: Escape closes, +/-/= zoom, 0 fits.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === '+' || e.key === '=') {
        const { width: W, height: H } = vpSize()
        zoomAt(W / 2, H / 2, 1.5)
      } else if (e.key === '-') {
        const { width: W, height: H } = vpSize()
        zoomAt(W / 2, H / 2, 1 / 1.5)
      } else if (e.key === '0') fitView()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [fitView, onClose, zoomAt])

  const mid = () => {
    const { width: W, height: H } = vpSize()
    return [W / 2, H / 2] as [number, number]
  }

  return (
    <div className="skv2-lb" role="dialog" aria-modal="true">
      <header>
        <div className="t">
          {target.title}
          {target.sub ? <small>{target.sub}</small> : null}
        </div>
        <div className="tabs" role="tablist" aria-label="View">
          <button
            type="button"
            role="tab"
            aria-selected={view === 'lay'}
            aria-pressed={view === 'lay'}
            onClick={() => {
              setView('lay')
              show('lay')
            }}
          >
            Layout
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === 'sch'}
            aria-pressed={view === 'sch'}
            disabled={!target.sch}
            title={target.sch ? '' : 'No schematic for this picture'}
            onClick={() => {
              if (target.sch) {
                setView('sch')
                show('sch')
              }
            }}
          >
            Schematic
          </button>
        </div>
        {target.cell && view === 'lay' ? (
          <button
            type="button"
            aria-pressed={halvesOn}
            onClick={() => {
              setHalvesOn((v) => {
                setHalves(!v)
                return !v
              })
            }}
          >
            Half cells
          </button>
        ) : null}
        <div className="zbtns">
          <button type="button" aria-label="Zoom out" onClick={() => { const [x, y] = mid(); zoomAt(x, y, 1 / 1.5) }}>
            −
          </button>
          <button type="button" onClick={() => fitView()}>
            Fit
          </button>
          <button type="button" aria-label="Zoom in" onClick={() => { const [x, y] = mid(); zoomAt(x, y, 1.5) }}>
            +
          </button>
        </div>
        <button type="button" ref={closeRef} onClick={onClose}>
          Close
        </button>
      </header>
      <div ref={vpRef} className="vp">
        {/* The vector branch renders the fetched SVG's own markup in a shadow
            root, zoomed by its viewBox; the bitmap branch is the fallback,
            sized from the image's natural size and fitted on load. */}
        <div ref={attachSv} role="img" className="sv" hidden={bitmapSrc !== null} />
        {bitmapSrc === null ? null : (
          <div ref={cvRef} className="cv">
            <img
              ref={imRef}
              src={bitmapSrc}
              alt={bitmapAlt}
              draggable={false}
              onLoad={(e) => {
                const im = e.currentTarget
                Z.current.w = im.naturalWidth || 1600
                Z.current.h = im.naturalHeight || 1000
                if (cvRef.current) {
                  cvRef.current.style.width = `${Z.current.w}px`
                  cvRef.current.style.height = `${Z.current.h}px`
                }
                fitView()
              }}
            />
          </div>
        )}
        <div className="hint">Scroll to zoom · drag to pan · double-click to fit</div>
      </div>
    </div>
  )
}

/* ----------------------------------------------------------------- panel */

const GROUPS = ['All', ...new Set(SKYCAD_CELLS.map((c) => c.group))]
const N_CLEAN = SKYCAD_CELLS.filter((c) => c.drc.every((v) => v === 0) && c.lvs.every((v) => v === 'match')).length
const N_MATCHED = SKYCAD_CELLS.filter((c) => c.matched).length
const TOTAL_S = SKYCAD_CELLS.reduce((a, c) => a + c.ms, 0) / 1000

export function SkyCadV2Panel() {
  const [group, setGroup] = useState('All')
  const [ov, setOv] = useState(true)
  const [target, setTarget] = useState<LbTarget | null>(null)

  const openCell = useCallback((c: SkyCadCell) => {
    setTarget({
      src: `${BASE}/gallery/${c.name}.svg`,
      title: pretty(c.name),
      sub: `${c.group} · ${c.dev} devices · ${fmt(c.w, 2)} × ${fmt(c.h, 2)} µm (${fmt(c.area, 0)} µm²) · ${fmt(c.ms, 1)} ms · DRC ${c.drc[0]} / ${c.drc[1]} flat, ${c.drc[2]} / ${c.drc[3]} hierarchical · LVS ${c.lvs[0]} flat, ${c.lvs[1]} hierarchical`,
      cell: c,
      sch: schOf(c.name),
    })
  }, [])

  const visible = useMemo(
    () => SKYCAD_CELLS.filter((c) => group === 'All' || c.group === group),
    [group],
  )

  return (
    <div className="skv2">
      <header className="col">
        <h1>Layout automation, V2</h1>
        <p className="byline">Vijay Gupta and Navin Kumar Mishra · SkyCadEda</p>
        <p>
          A month ago we showed our layout automation, and it had many quality issues. Since then we
          have made many improvements:
        </p>
        <ul>
          <li>Optional half-cell layouts, where the circuit allows</li>
          <li>Guard rings and shields</li>
          <li>Matched layout for differential signals</li>
          <li>Optimized routing, with two vias everywhere</li>
          <li>Decap filler</li>
          <li>EM-aware layouts that change with the current</li>
        </ul>
        <p>
          We rewrote our layout engine, GOAL (Generator Of Analog Layout), from scratch in Rust,
          which made it 10× faster: every layout now takes tens to hundreds of milliseconds. The
          demo also shows EM/IR results. Every feature is configurable, including the aspect ratio.
        </p>
      </header>

      <section aria-labelledby="skv2-gal" className="wide">
        <div className="col">
          <h2 id="skv2-gal">Cell layouts</h2>
          <p>Select a cell to open its layout and schematic.</p>
          <p className="byline">
            {N_CLEAN} of {SKYCAD_CELLS.length} DRC clean on both decks and LVS matched, flat and
            hierarchical. {N_MATCHED} took the matched-stage layout. All {SKYCAD_CELLS.length}{' '}
            together took {fmt(TOTAL_S, 1)} s of GOAL time.
          </p>
        </div>
        <div className="col">
          <div aria-label="Filter cells" className="chips" role="group">
            {GROUPS.map((gr) => (
              <button
                key={gr}
                type="button"
                aria-pressed={group === gr}
                onClick={() => setGroup(gr)}
              >
                {gr}
                {gr === 'All'
                  ? ` (${SKYCAD_CELLS.length})`
                  : ` (${SKYCAD_CELLS.filter((c) => c.group === gr).length})`}
              </button>
            ))}
          </div>
          <div aria-label="Overlay" className="tog" role="group">
            <button type="button" aria-pressed={ov} onClick={() => setOv(true)}>
              Half cells highlighted
            </button>
            <button type="button" aria-pressed={!ov} onClick={() => setOv(false)}>
              Layout only
            </button>
          </div>
        </div>
        <div className={ov ? 'grid' : 'grid hide-ov'}>
          {visible.map((c) => (
            <CellCard key={c.name} c={c} onOpen={openCell} />
          ))}
        </div>
      </section>

      <section aria-labelledby="skv2-next" className="col">
        <h2 id="skv2-next">Next up: an 8–12-bit SAR ADC</h2>
        <p>
          Our next post will cover IP-level automation, starting with an 8–12-bit SAR ADC. Here is
          the current state of the 8-bit SAR ADC layout.
        </p>
      </section>

      <figure className="wide">
        <div
          className="plate zoom"
          role="button"
          tabIndex={0}
          aria-label="8-bit SAR ADC, top level (work in progress): open, zoom and see the schematic"
          onClick={() =>
            setTarget({
              src: `${BASE}/img/14-adc8-ip.svg`,
              title: '8-bit SAR ADC, top level (work in progress)',
              sub: '',
              cell: null,
              sch: null,
            })
          }
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setTarget({
                src: `${BASE}/img/14-adc8-ip.svg`,
                title: '8-bit SAR ADC, top level (work in progress)',
                sub: '',
                cell: null,
                sch: null,
              })
            }
          }}
        >
          <img
            alt="The 8-bit SAR ADC top level: capacitor DAC array with switches on the left, SAR logic on the right, comparator and reference in the middle, decap rows at the bottom, all routed together"
            height={1920}
            loading="lazy"
            src={`${BASE}/img/14-adc8-ip.svg`}
            style={{ maxWidth: '52rem', marginInline: 'auto' }}
            width={1600}
          />
        </div>
        <figcaption>
          <b>8-bit SAR ADC, work in progress.</b> DRC clean, top-level LVS matched.
        </figcaption>
      </figure>

      <section className="col">
        <p>
          <strong>
            Contact us at <a href="mailto:sales@skycadeda.com">sales@skycadeda.com</a>.
          </strong>
        </p>
      </section>

      {target
        ? createPortal(
            <Lightbox target={target} onClose={() => setTarget(null)} />,
            document.body,
          )
        : null}
    </div>
  )
}
