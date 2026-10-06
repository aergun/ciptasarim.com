/**
 * The provenance rendering layer.
 *
 * The `Figure` union on the server (`shared/types.ts`) makes an unlabelled
 * number unrepresentable in the data; this file is the half of the contract on
 * the way *out*: a `Figure` is only ever rendered through one of these
 * components, so a measured figure, a modelled one and a gap are three visible
 * things everywhere on the site.
 *
 * Why it sits here rather than being folded into each page: the GZ-curve class
 * of mistake — a number that reads as more certain than it is — is an
 * interaction between a renderer and a reader, and it only stays in check if
 * the badge, the colour and the missing-value treatment are decided once. Ten
 * pages each improvising their own spec row would produce ten slightly
 * different conventions and at least one of them would quietly render the gap
 * as a dash, which is what "no data" looks like when it has been laundered.
 */

import type { Figure, FigureUnit, SpecCell } from '../../shared/types.ts'
import { formatEngineering, formatNumber, type Locale } from '../../shared/i18n.ts'
import { useSite } from '../lib/site.tsx'
import { Badge } from './ui.tsx'

/* -------------------------------------------------------------------------- */
/* Units                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * One unit's rendered label, in the page's locale.
 *
 * The label maps come from the locale bundles, which key a
 * `Record<FigureUnit, string>` — a unit added to the shared union with no
 * label fails the compile, so this function cannot return an empty string for
 * a known unit. Unknown units are impossible by typing; `null` guards it anyway.
 */
export function unitLabel(unit: FigureUnit, locale: Locale): string {
  const labels = locale === 'en' ? EN_UNITS : TR_UNITS
  return labels[unit] ?? unit
}

// The bundles were imported wholesale; a narrow re-read keeps the type surface
// below to `Record<FigureUnit, string>` rather than the whole site bundle, so
// these renderers stay usable outside a routing context (the smoke suite's
// helpers, a future email renderer).
import { figureUnits as TR_UNITS } from '../../locales/tr.ts'
import { figureUnits as EN_UNITS } from '../../locales/en.ts'

/* -------------------------------------------------------------------------- */
/* Value                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * The number, formatted for the locale, with its unit.
 *
 * Frequencies and clock-period-class figures use 3 significant digits through
 * `formatEngineering` — `3,4 ns` rather than `3,4000 ns`; counts and everything
 * else use two fixed decimals through `formatNumber`, so a column of them
 * lines up. Either way `format*` returns the locale's own characters.
 */
export function figureValue(figure: Figure, locale: Locale): string {
  if (figure.basis === 'uncharacterised') return ''
  const value = figure.unit === 'count' || figure.unit === 'USD' || figure.unit === 'GE'
    ? formatNumber(figure.value, locale, 0)
    : formatEngineering(figure.value, locale, 3)
  const space = figure.unit === 'percent' ? '' : ' '
  return `${value}${space}${unitLabel(figure.unit, locale)}`
}

/* -------------------------------------------------------------------------- */
/* Badge and colour                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Minimal well-formed figures, one per basis — for renderers that want the
 * *badge* (or colour) of a basis without a value behind it: legend blocks, the
 * compare header, an empty state. Nothing that displays a number may use these.
 */
export const BASIS_FIGURES: Record<Figure['basis'], Figure> = {
  measured: { basis: 'measured', value: 0, unit: 'count', conditions: '', source: '' },
  modelled: { basis: 'modelled', value: 0, unit: 'count', model: '', source: null },
  uncharacterised: { basis: 'uncharacterised', reason: { tr: '', en: '' } },
}

/**
 * The basis badge. This component is the control for the "a modelled number
 * reads as measured" risk named in the plan: the badge is never optional, and
 * every renderer that shows a `Figure` calls it.
 */
export function FigureBadge({ figure, className = '' }: { figure: Figure; className?: string }) {
  const { strings } = useSite()
  const labels = strings.basis
  if (figure.basis === 'measured') {
    return <Badge tone="success" className={className}>{labels.measured}</Badge>
  }
  if (figure.basis === 'modelled') {
    return <Badge tone="danger" className={className}>{labels.modelled}</Badge>
  }
  return <Badge tone="neutral" className={className}>{labels.uncharacterised}</Badge>
}

/**
 * The CSS class that colours the value itself — the same three-way split the
 * server's smoke suite asserts is *paired* with the badge: colour is a
 * secondary cue, the badge text is the primary one.
 */
export function figureColor(figure: Figure): string {
  return {
    measured: 'fig-measured',
    modelled: 'fig-modelled',
    uncharacterised: 'fig-uncharacterised',
  }[figure.basis]
}

/* -------------------------------------------------------------------------- */
/* The gap                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * An uncharacterised figure, rendered.
 *
 * **Never `0`, never blank, never a dash alone.** The reason is the content of
 * the cell: "we have not measured this, and here is why" is a fact a buyer
 * needs and acts on. Rendered as plain text rather than a value — there is no
 * value — with the reason below in the void colour, so the gap is legible
 * rather than missing. The reason is a `T`, so it reads in the visitor's
 * language like every other prose on the site.
 */
export function FigureGap({ figure }: { figure: Figure }) {
  const { t, strings } = useSite()
  if (figure.basis !== 'uncharacterised') return null
  return (
    <span className="text-[13px] italic text-void">
      <span className="font-mono not-italic tabular">{strings.basis.noSource}</span>
      <span className="block mt-0.5 max-w-[36ch] leading-snug">{t(figure.reason)}</span>
    </span>
  )
}

/* -------------------------------------------------------------------------- */
/* Spec cell                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * One `SpecCell` as a spec-table row: label, figure with its badge, and the
 * provenance line. This is the component the plan named — `SpecCell` replaced
 * the reference's `SpecRow` and only one renderer composes it.
 *
 * The provenance line shows the *evidence* under the value: conditions and a
 * checkable source for measured; the named model, and an external source when
 * the model has one, for modelled. A figure whose basis is stated but whose
 * working is hidden would be the same lie in a smaller font.
 */
export function SpecFigureCell({ cell, className = '' }: { cell: SpecCell; className?: string }) {
  const { t, locale, strings } = useSite()
  const { figure } = cell

  return (
    <div className={`flex items-baseline justify-between gap-6 py-3 border-b border-line last:border-b-0 ${className}`}>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-mist">{t(cell.label)}</p>
        {cell.note ? <p className="mt-1 text-[11px] leading-snug text-mist">{t(cell.note)}</p> : null}
      </div>
      <div className="text-right shrink-0">
        {figure.basis === 'uncharacterised' ? (
          <FigureGap figure={figure} />
        ) : (
          <p className={`font-mono text-[15px] tabular ${figureColor(figure)}`}>{figureValue(figure, locale)}</p>
        )}
        <div className="mt-1 flex justify-end">
          <FigureBadge figure={figure} />
        </div>
        {figure.basis === 'measured' ? (
          <p className="mt-1 font-mono text-[9px] text-mist">
            {strings.basis.conditions}: {figure.conditions}
          </p>
        ) : null}
        {figure.basis === 'measured' ? (
          <p className="font-mono text-[9px] text-mist">
            {strings.basis.source}: {figure.source}
          </p>
        ) : null}
        {figure.basis === 'modelled' ? (
          <p className="mt-1 font-mono text-[9px] text-mist">
            {strings.basis.model}: {figure.model}
            {figure.source ? ` · ${strings.basis.source}: ${figure.source}` : ''}
          </p>
        ) : null}
      </div>
    </div>
  )
}

/** A stack of spec cells — one per figure, in authored order. */
export function SpecCellTable({ cells, className = '' }: { cells: readonly SpecCell[]; className?: string }) {
  return (
    <dl className={`divide-y divide-line border-y border-line ${className}`}>
      {cells.map((cell) => (
        <SpecFigureCell key={cell.id} cell={cell} />
      ))}
    </dl>
  )
}