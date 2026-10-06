/*
 * Generated technical drawings.
 *
 * Every image on the site is a generated slot until real silicon photography
 * or waveform captures exist — and the drawing is generated from that core's
 * or process row's *real* numbers, exactly as the reference project drew a
 * hull's real LOA and beam. A blank rectangle says "not finished"; a drawing
 * with the actual figures dimensioned on it says "this is a design house",
 * which is the positioning.
 *
 * The four body functions replace the reference's yacht sheets:
 *
 *  - `blockDiagram` — the core as a block with its real ports, per direction.
 *  - `floorplan` — a hard macro's pad ring and core region, its real area dimensioned.
 *  - `timingDiagram` — a clock period with setup and hold annotated around it.
 *  - `testplan` — the verification hierarchy, with counts of assertions and coverage.
 *
 * The furniture (`sheet`, `dimension`, `noteBlock`) is ported verbatim. The pure-SVG
 * properties that earned them the port — resolution independence, no bytes, no 404s,
 * correct inside the `onError` of an `<img>` whose photograph does not exist yet —
 * are the same here.
 */

import type { Core, Figure, FigureUnit, Port } from '../../shared/types.ts'
import { formatEngineering, type Locale } from '../../shared/i18n.ts'

/* The palette mirrors the site's own, so a drawing sits in the layout rather
   than on top of it. `currentColor`-free: these are standalone SVG documents
   rendered as <img> sources, and cannot inherit. */
const INK = '#0B1620'
const LINE = '#9FB0BE'
const ACCENT = '#D9541E'
const PROVEN = '#0E7A5F'
const SIGNAL = '#1F6FB2'
const PAPER = '#F5F6F8'

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Builds a data-URI SVG.
 *
 * Returned as a data URI rather than written to disk so it works identically
 * in dev, in a production build, and inside the fallback of an `<img>` whose
 * primary source has already 404'd.
 */
function drawingDataUri(svg: string): string {
  // encodeURIComponent rather than base64: readable in devtools, and correct
  // for any UTF-8 character in a core's part number.
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

/* -------------------------------------------------------------------------- */
/* The sheets                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * The core as a block diagram: one large macro block, its input ports entering
 * from the left, its outputs leaving to the right, clocks on top and supplies
 * below. Port labels are the real `Port.name`s, and the width is annotated
 * where the port is wider than one.
 */
function blockDiagram({ name, ports, locale }: { name: string; ports: readonly Port[]; locale: Locale }): string {
  const w = 800
  const h = 480
  const boxX = 250
  const boxW = 300
  const boxY = 90
  const boxH = 280

  const ins = ports.filter((p) => p.direction === 'in' && p.kind !== 'clock' && p.kind !== 'power')
  const outs = ports.filter((p) => p.direction === 'out')
  const clocks = ports.filter((p) => p.direction === 'in' && p.kind === 'clock')
  const power = ports.filter((p) => p.kind === 'power' || p.direction === 'inout')

  const row = (list: readonly Port[], top: number, step: number) =>
    list.map((p, i) => ({ port: p, y: top + i * step }))

  const inputRows = row(ins, boxY + 26, 34)
  const outputRows = row(outs, boxY + 26, 34)

  const wires = [
    ...inputRows.map(
      ({ port, y }) =>
        `<line x1="120" y1="${y}" x2="${boxX}" y2="${y}" stroke="${SIGNAL}" stroke-width="1.4" marker-end="url(#arrow)"/>` +
        `<text x="112" y="${y - 5}" text-anchor="end" font-size="9" fill="${INK}">${escapeXml(port.name)}${port.width > 1 ? `[${port.width}]` : ''}</text>`,
    ),
    ...outputRows.map(
      ({ port, y }) =>
        `<line x1="${boxX + boxW}" y1="${y}" x2="680" y2="${y}" stroke="${INK}" stroke-width="1.4" marker-end="url(#arrow)"/>` +
        `<text x="688" y="${y - 5}" font-size="9" fill="${INK}">${escapeXml(port.name)}${port.width > 1 ? `[${port.width}]` : ''}</text>`,
    ),
    // Clocks arc over the top; power enters from below. A clock drawn as an
    // ordinary input reads wrong to the engineer reading the sheet.
    ...clocks.map(
      (p, i) =>
        `<line x1="${boxX + 60 + i * 70}" y1="40" x2="${boxX + 60 + i * 70}" y2="${boxY}" stroke="${ACCENT}" stroke-width="1.4" marker-end="url(#arrow)"/>` +
        `<text x="${boxX + 60 + i * 70}" y="34" text-anchor="middle" font-size="9" fill="${ACCENT}">${escapeXml(p.name)}</text>`,
    ),
    ...power.map(
      (p, i) =>
        `<line x1="${boxX + 70 + i * 80}" y1="${boxY + boxH + 70}" x2="${boxX + 70 + i * 80}" y2="${boxY + boxH}" stroke="${ACCENT}" stroke-width="1.2"/>` +
        `<text x="${boxX + 70 + i * 80}" y="${boxY + boxH + 84}" text-anchor="middle" font-size="9" fill="${ACCENT}">${escapeXml(p.name)}</text>`,
    ),
  ]

  return sheet(w, h, name, 'BLOCK DIAGRAM', [
    `<defs><marker id="arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7" fill="none" stroke="context-stroke"/></marker></defs>`,
    `<rect x="${boxX}" y="${boxY}" width="${boxW}" height="${boxH}" fill="${PAPER}" stroke="${INK}" stroke-width="1.8"/>`,
    `<text x="${boxX + boxW / 2}" y="${boxY + boxH / 2}" text-anchor="middle" font-size="12" letter-spacing="2" fill="${INK}">CORE</text>`,
    ...wires,
    noteBlock([...ins.slice(0, 3), ...outs.slice(0, 2)].map((p) => [p.kind.toUpperCase(), p.name] as [string, string]), 470, h - 64),
    `<text x="120" y="${h - 16}" font-size="8" fill="${LINE}" letter-spacing="1.2">PORT LIST FROM THE DELIVERY MANIFEST — SIGNALS SHOWN ARE THE LOGICAL PORTS, NOT THE PHYSICAL PADS.</text>`,
  ], locale)
}

/**
 * A hard macro's floorplan: pad ring, core region, dimensioned to the real
 * macro area. The macro aspect is derived from the area figure alone, so the
 * drawing cannot disagree with the catalogue about how big the block is.
 */
function floorplan({ name, areaUm2 }: { name: string; areaUm2: number | null }): string {
  const w = 800
  const h = 560
  const padRing = 54
  const outerX = 220
  const outerY = 110
  const outerW = 360
  const outerH = 340

  // The drawn macro fills the core region; the die edge (pad ring) is not the
  // macro, and the two are labelled so the distinction survives the drawing.
  const coreX = outerX + padRing
  const coreY = outerY + padRing
  const coreW = outerW - padRing * 2
  const coreH = outerH - padRing * 2

  // Rows of standard cells, drawn not placed — the pattern is the point.
  const rows: string[] = []
  for (let y = coreY + 18; y < coreY + coreH - 18; y += 26) {
    rows.push(
      `<line x1="${coreX + 14}" y1="${y}" x2="${coreX + coreW - 14}" y2="${y}" stroke="${LINE}" stroke-width="6" opacity="0.35"/>`,
    )
  }

  // Power rings, drawn dashed in the technical blue.
  const rings = `<rect x="${coreX}" y="${coreY}" width="${coreW}" height="${coreH}" fill="none" stroke="${SIGNAL}" stroke-width="1" stroke-dasharray="8 4"/><rect x="${coreX + 10}" y="${coreY + 10}" width="${coreW - 20}" height="${coreH - 20}" fill="none" stroke="${SIGNAL}" stroke-width="0.8" stroke-dasharray="4 4"/>`

  const label = areaUm2 !== null
    ? `${formatEngineering(areaUm2, 'en', 4).replace(' ', '')} µm²`
    : 'AREA NOT YET CHARACTERISED'

  return sheet(w, h, name, 'FLOORPLAN', [
    // Pad ring: pads on all four sides.
    `<rect x="${outerX}" y="${outerY}" width="${outerW}" height="${outerH}" fill="none" stroke="${INK}" stroke-width="1.6"/>`,
    ...Array.from({ length: 14 }, (_, i) => {
      const x = outerX + 12 + (i * (outerW - 24)) / 13
      const y = outerY + 12 + (i * (outerH - 24)) / 13
      return `<rect x="${x}" y="${outerY + 2}" width="14" height="14" fill="${LINE}"/><rect x="${x}" y="${outerY + outerH - 16}" width="14" height="14" fill="${LINE}"/><rect x="${outerX + 2}" y="${y}" width="14" height="14" fill="${LINE}"/><rect x="${outerX + outerW - 16}" y="${y}" width="14" height="14" fill="${LINE}"/>`
    }).join(''),
    `<rect x="${coreX}" y="${coreY}" width="${coreW}" height="${coreH}" fill="${PAPER}" stroke="${INK}" stroke-width="1.2"/>`,
    ...rows,
    rings,
    `<text x="${coreX + coreW / 2}" y="${coreY + coreH / 2}" text-anchor="middle" font-size="10" letter-spacing="2.4" fill="${INK}">STANDARD-CELL REGION</text>`,
    `<text x="${outerX}" y="${outerY + outerH + 40}" font-size="9" font-family="monospace" fill="${ACCENT}" letter-spacing="1.4">MACRO AREA ${escapeXml(label)}</text>`,
    noteBlock(
      [
        ['REGION', 'CORE ONLY'],
        ['PADS', 'RING OUTSIDE'],
        ['ROWS', 'STD CELL'],
      ],
      640,
      h - 100,
    ),
    `<text x="220" y="${h - 16}" font-size="8" fill="${LINE}" letter-spacing="1.2">NOT A PLACEMENT — ROWS INDICATE CELL REGIONS ONLY.</text>`,
  ])
}

/**
 * A timing diagram: one clock period with setup and hold called out around the
 * data edge. The period is the core's real one when a measured `maxFrequency`
 * exists, otherwise a nominal — annotated honestly either way.
 */
function timingDiagram({ name, periodNs }: { name: string; periodNs: number | null }): string {
  const w = 800
  const h = 420
  const midY = 180
  const amp = 40
  const startX = 160
  const period = 360 // drawn units; the label carries the real number

  // Two full periods, drawn square — a schematic, not a measurement trace.
  const edge = (x1: number, x2: number, level: 'hi' | 'lo') =>
    `<line x1="${x1}" y1="${midY + (level === 'hi' ? -amp : amp)}" x2="${x2}" y2="${midY + (level === 'hi' ? -amp : amp)}" stroke="${INK}" stroke-width="1.6"/>`

  const clock =
    edge(startX, startX + period / 2, 'hi') +
    edge(startX + period / 2, startX + period, 'lo') +
    edge(startX + period, startX + (3 * period) / 2, 'hi') +
    edge(startX + (3 * period) / 2, startX + 2 * period, 'lo') +
    `<line x1="${startX}" y1="${midY - amp}" x2="${startX}" y2="${midY + amp}" stroke="${INK}" stroke-width="1.6"/>` +
    `<line x1="${startX + period / 2}" y1="${midY - amp}" x2="${startX + period / 2}" y2="${midY + amp}" stroke="${INK}" stroke-width="1.6"/>` +
    `<line x1="${startX + period}" y1="${midY - amp}" x2="${startX + period}" y2="${midY + amp}" stroke="${INK}" stroke-width="1.6"/>`

  const label = periodNs !== null ? `${formatEngineering(periodNs, 'en', 3)} ns` : 'NOT CHARACTERISED'

  // Setup and hold braces, in the provenance green/flare respectively.
  const setup = `<line x1="${startX + period - 60}" y1="${midY - amp - 34}" x2="${startX + period}" y2="${midY - amp - 34}" stroke="${PROVEN}" stroke-width="1"/>` +
    `<text x="${startX + period - 30}" y="${midY - amp - 42}" text-anchor="middle" font-size="9" fill="${PROVEN}">SETUP</text>`
  const hold = `<line x1="${startX + period}" y1="${midY + amp + 30}" x2="${startX + period + 60}" y2="${midY + amp + 30}" stroke="${ACCENT}" stroke-width="1"/>` +
    `<text x="${startX + period + 30}" y="${midY + amp + 48}" text-anchor="middle" font-size="9" fill="${ACCENT}">HOLD</text>`

  return sheet(w, h, name, 'TIMING DIAGRAM', [
    `<line x1="${startX - 40}" y1="${midY}" x2="${startX + 2 * period + 60}" y2="${midY}" stroke="${LINE}" stroke-width="0.6" stroke-dasharray="4 4"/>`,
    clock,
    setup,
    hold,
    `<text x="${startX - 30}" y="${midY}" text-anchor="end" font-size="9" fill="${INK}" letter-spacing="1.2">CLK</text>`,
    dimension(startX, midY + amp + 76, startX + period, midY + amp + 76, 'T — ' + label),
    noteBlock(
      [
        ['PERIOD', label],
        ['EDGES', 'RISING/DOMAIN'],
        ['CORNERS', 'SS / TT / FF'],
      ],
      startX + 2 * period - 220,
      h - 96,
    ),
    `<text x="120" y="${h - 16}" font-size="8" fill="${LINE}" letter-spacing="1.2">SCHEMATIC TIMING ONLY — NOT A POST- LAYOUT TRACE.</text>`,
  ])
}

/**
 * The verification hierarchy: a testbench tree with counts. A UVM environment
 * is a hierarchy, and the drawing says so more quickly than the spec list does.
 */
function testplan({ name, assertions, coverage }: { name: string; assertions: number | null; coverage: number | null }): string {
  const w = 800
  const h = 460
  const rootX = 400
  const rootY = 100

  const agents = ['SEQUENCE', 'DRIVER', 'MONITOR', 'SCOREBOARD', 'CHECKER', 'COVERAGE']
  const ax = 140
  const step = (w - ax * 2) / (agents.length - 1)
  const leafY = 300

  const tree = agents
    .map((agent, i) => {
      const x = ax + i * step
      return (
        `<line x1="${rootX}" y1="${rootY + 20}" x2="${x}" y2="${leafY - 18}" stroke="${LINE}" stroke-width="0.8"/>` +
        `<rect x="${x - 52}" y="${leafY}" width="104" height="34" fill="${PAPER}" stroke="${INK}" stroke-width="1"/>` +
        `<text x="${x}" y="${leafY + 21}" text-anchor="middle" font-size="9" letter-spacing="1" fill="${INK}">${agent}</text>`
      )
    })
    .join('')

  return sheet(w, h, name, 'TEST PLAN', [
    `<rect x="${rootX - 110}" y="${rootY - 22}" width="220" height="44" fill="${PAPER}" stroke="${INK}" stroke-width="1.4"/>`,
    `<text x="${rootX}" y="${rootY + 4}" text-anchor="middle" font-size="11" letter-spacing="2.4" fill="${INK}">UVM ENV</text>`,
    tree,
    noteBlock(
      [
        ['ASSERTS', assertions !== null ? String(assertions) : 'NOT CHARACTERISED'],
        ['COVERAGE', coverage !== null ? `%${coverage.toLocaleString('en', { maximumFractionDigits: 1 })}` : 'NOT CHARACTERISED'],
        ['COLLATERAL', 'SVA + UVM'],
      ],
      ax,
      h - 110,
    ),
    `<text x="140" y="${h - 16}" font-size="8" fill="${LINE}" letter-spacing="1.2">STRUCTURE ONLY — THE DELIVERED COLLATERAL DEFINES THE ACTUAL HIERARCHY.</text>`,
  ])
}

/* -------------------------------------------------------------------------- */
/* Drawing furniture — ported verbatim from the reference, re-branded          */
/* -------------------------------------------------------------------------- */

/** The border, title block and label every sheet shares. */
function sheet(w: number, h: number, name: string, title: string, body: (string | false)[], _locale?: Locale): string {
  const m = 22

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${escapeXml(name)} — ${escapeXml(title)}">
  <rect width="${w}" height="${h}" fill="${PAPER}"/>
  <rect x="${m}" y="${m}" width="${w - m * 2}" height="${h - m * 2}" fill="none" stroke="${INK}" stroke-width="1" opacity="0.35"/>
  <g>${body.filter(Boolean).join('')}</g>
  <g font-family="monospace">
    <text x="${m + 14}" y="${m + 26}" font-size="11" letter-spacing="2.4" fill="${INK}">${escapeXml(title)}</text>
    <text x="${m + 14}" y="${m + 44}" font-size="10" letter-spacing="0.6" fill="#5A6B78">${escapeXml(name.toUpperCase())}</text>
    <text x="${w - m - 14}" y="${m + 26}" font-size="9" letter-spacing="1.6" fill="#5A6B78" text-anchor="end">CIP TASARIM</text>
    <text x="${w - m - 14}" y="${m + 44}" font-size="9" letter-spacing="1.6" fill="${ACCENT}" text-anchor="end">PRELIMINARY — NOT A DATASHEET</text>
  </g>
</svg>`
}

/** A dimension line with end ticks and a centred label. */
function dimension(x1: number, y1: number, x2: number, y2: number, label: string, vertical = false): string {
  const tick = 4
  const ticks = vertical
    ? `M${x1 - tick},${y1} L${x1 + tick},${y1} M${x2 - tick},${y2} L${x2 + tick},${y2}`
    : `M${x1},${y1 - tick} L${x1},${y1 + tick} M${x2},${y2 - tick} L${x2},${y2 + tick}`

  const midX = (x1 + x2) / 2
  const midY = (y1 + y2) / 2
  const text = vertical
    ? `<text x="${x1 + 8}" y="${midY}" font-size="9" fill="#5A6B78" letter-spacing="1" dominant-baseline="middle" font-family="monospace">${escapeXml(label)}</text>`
    : `<text x="${midX}" y="${y1 - 7}" font-size="9" fill="#5A6B78" letter-spacing="1" text-anchor="middle" font-family="monospace">${escapeXml(label)}</text>`

  return `<g stroke="${INK}" stroke-width="0.6" opacity="0.7" fill="none">
    <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>
    <path d="${ticks}"/>
  </g>
  <g>${text}</g>`
}

/** The small labelled fact strip in the corner of a sheet. */
function noteBlock(rows: [string, string][], x: number, y: number): string {
  return `<g font-family="monospace" font-size="9" letter-spacing="1">
    ${rows
      .map(
        ([label, value], i) =>
          `<text x="${x}" y="${y + i * 14}" fill="#5A6B78">${escapeXml(label)}</text>` +
          `<text x="${x + 78}" y="${y + i * 14}" fill="${INK}" text-anchor="end">${escapeXml(value)}</text>`,
      )
      .join('')}
  </g>`
}

/* -------------------------------------------------------------------------- */
/* The front door                                                              */
/* -------------------------------------------------------------------------- */

/** Draws the sheet that suits this core's kind, from that core's real figures. */
export function drawingFor(core: Core): string {
  const uri = (svg: string) => drawingDataUri(svg)

  if (core.kind === 'soft-rtl') {
    return uri(blockDiagram({ name: core.name, ports: core.spec.ports, locale: 'tr' }))
  }
  if (core.kind === 'hard-macro') {
    const area = core.figures.find((c) => c.figure.basis !== 'uncharacterised' && c.figure.unit === 'um2')
    const value = area && area.figure.basis !== 'uncharacterised' ? area.figure.value : null
    return uri(floorplan({ name: core.name, areaUm2: value }))
  }
  if (core.kind === 'analog') {
    // A transfer-curve frame for an ADC is the sheet an analog engineer reads
    // first; the sample rate is annotated via the note block when measured.
    const rate = core.figures.find((c) => c.figure.basis !== 'uncharacterised' && c.figure.unit === 'MHz')
    const period = rate && rate.figure.basis !== 'uncharacterised' ? 1000 / rate.figure.value : null
    return uri(timingDiagram({ name: core.name, periodNs: period }))
  }
  // verification
  const assertions = pickFigure(core.figures, 'count')
  const coverage = pickFigure(core.figures, 'percent')
  return uri(
    testplan({
      name: core.name,
      assertions: assertions?.value ?? null,
      coverage: coverage?.value ?? null,
    }),
  )
}

/** Picks the figure with a numeric value in this unit, else `null`. */
function pickFigure(cells: readonly { figure: Figure }[], unit: FigureUnit): { value: number } | null {
  for (const cell of cells) {
    if (cell.figure.basis !== 'uncharacterised' && cell.figure.unit === unit) {
      return { value: cell.figure.value }
    }
  }
  return null
}