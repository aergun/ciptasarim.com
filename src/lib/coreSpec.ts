/**
 * Per-node specification readers for the two pages that render a core across
 * its kind's spec model: the core detail's per-node table and the catalogue's
 * comparison view.
 *
 * `FIELDS_BY_KIND` is the single authority on *which figures define a kind and
 * in what order* — both pages read it, so the two can never disagree about the
 * ordering or forget a field a kind grew.
 *
 * Labels come from the `specFields` bundle block (both locale files), resolved
 * to a `T` here so every caller renders an identical bilingual label.
 */

import type { ByNode, Core, Figure, ProcessNode, SpecCell, T } from '../../shared/types.ts'
import { atNode } from '../../shared/types.ts'
import type { LocaleBundle } from '../../locales/index.ts'
import { bundles } from '../../locales/index.ts'

/** One kind's spec fields: a `specFields` key for the label, and a read of the ByNode block. */
export type SpecFieldReader = {
  id: keyof LocaleBundle['specFields']
  extract: (core: Core) => ByNode<Figure> | null
}

/** The per-kind field order, exactly as the detail page and comparison render it.
 *
 * The narrows inside `extract` are the union's own discipline: the reader is
 * filed under its kind, so the cast expresses "this kind's spec is this arm"
 * rather than papering over a runtime unknown. */
export const FIELDS_BY_KIND: Record<Core['kind'], readonly SpecFieldReader[]> = {
  'soft-rtl': [
    { id: 'gateEquivalents', extract: (core) => (core as Extract<Core, { kind: 'soft-rtl' }>).spec.gateEquivalents },
    { id: 'maxFrequency', extract: (core) => (core as Extract<Core, { kind: 'soft-rtl' }>).spec.maxFrequency },
    { id: 'power', extract: (core) => (core as Extract<Core, { kind: 'soft-rtl' }>).spec.power },
  ],
  'hard-macro': [
    { id: 'macroArea', extract: (core) => (core as Extract<Core, { kind: 'hard-macro' }>).spec.macroArea },
    { id: 'density', extract: (core) => (core as Extract<Core, { kind: 'hard-macro' }>).spec.density },
    { id: 'maxFrequency', extract: (core) => (core as Extract<Core, { kind: 'hard-macro' }>).spec.maxFrequency },
  ],
  analog: [
    { id: 'enob', extract: (core) => (core as Extract<Core, { kind: 'analog' }>).spec.enob },
    { id: 'sndr', extract: (core) => (core as Extract<Core, { kind: 'analog' }>).spec.sndr },
    { id: 'sampleRate', extract: (core) => (core as Extract<Core, { kind: 'analog' }>).spec.sampleRate },
  ],
  verification: [
    { id: 'assertions', extract: (core) => (core as Extract<Core, { kind: 'verification' }>).spec.assertions },
    { id: 'coverage', extract: (core) => (core as Extract<Core, { kind: 'verification' }>).spec.coverage },
  ],
}

/** The label for one field, from both mirror files — never from the current locale only. */
function fieldLabel(id: keyof LocaleBundle['specFields']): T {
  return { tr: bundles.tr.specFields[id], en: bundles.en.specFields[id] }
}

/**
 * One core at one node, as `SpecCell`s and a "not offered" list.
 *
 * A `ByNode` null means the figure is not offered at this node — a different
 * fact from an uncharacterised figure, which arrives with its reason and is
 * rendered with one. The comparison column and the detail page both treat the
 * two the same way: value rows for figures, `notOfferedAtNode` wording for nulls.
 */
export function specCellsAtNode(core: Core, node: ProcessNode): { cells: SpecCell[]; blocked: string[] } {
  const cells: SpecCell[] = []
  const blocked: string[] = []
  for (const field of FIELDS_BY_KIND[core.kind]) {
    const byNode = field.extract(core)
    const figure = byNode === null ? null : atNode(byNode, node)
    if (figure === null) {
      blocked.push(field.id)
      continue
    }
    cells.push({
      id: `${core.slug}-${field.id}-${node}`,
      label: fieldLabel(field.id),
      figure,
    })
  }
  return { cells, blocked }
}

/**
 * One row per field across every core of a kind — **the comparison column
 * order**, shared by the detail page's per-node table and the comparison view.
 * Exported so the two render the same rows in the same order.
 */
export function fieldLabelOf(id: keyof LocaleBundle['specFields']): T {
  return fieldLabel(id)
}