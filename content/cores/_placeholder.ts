/**
 * Helpers shared by the placeholder core shells.
 *
 * This exists because of one specific failure it prevents.
 *
 * A `ByNode<F>` is fourteen keys wide. Writing each one by hand is fourteen chances
 * to fill in a node by reflex — and because every node's value would look identical
 * on the page, a single accidentally-populated cell would survive review and read as
 * a real specification. That is the exact error the `Figure` union was built to make
 * unrepresentable, defeated by copy-paste at the construction site.
 *
 * So the shells do not construct `ByNode` literals at all. They call
 * `uncharacterisedAtEveryNode(reason)` and get a complete, uniformly-absent map, and
 * the reason is stated once in prose where it can be reviewed.
 *
 * A real core replaces one call with the fourteen figures it actually has, which is
 * why this helper is for the shells and not something the type system requires.
 */

import type { ByNode, Figure, ProcessNode } from '../../shared/types.ts'
import { PROCESS_NODES } from '../../shared/types.ts'

/**
 * A figure map that is uncharacterised at every node, for the same stated reason.
 *
 * The returned object is freshly built per call, so a core cannot accidentally share
 * (and then mutate) one map with another.
 */
export function uncharacterisedAtEveryNode(reason: string): ByNode<Figure> {
  return Object.fromEntries(
    PROCESS_NODES.map((node) => [node, { basis: 'uncharacterised' as const, reason }]),
  ) as ByNode<Figure>
}

/**
 * The figure at `node`, or a thrown error naming the node.
 *
 * `ByNode<F>` is `{ [node]: F | null }` — the `null` means "this core is not offered
 * at this node", which is a real and useful distinction from "offered here but not
 * characterised". `SpecCell.figure` is a plain `Figure`, though, because a spec row
 * that renders is a row about a node this core actually has.
 *
 * So indexing a `ByNode` yields `Figure | null` and the `null` has to be dealt with
 * at the authoring site. The two obvious options are a non-null assertion, which
 * pushes the failure to render time as a crash in a page, or this, which fails at
 * module load with the node named. **This is the better one deliberately:** the
 * mistake is always in the content, and an error that says which core and which node
 * is the difference between a five-second fix and an afternoon.
 *
 * It is therefore reachable only from content — no route calls it.
 */
export function figureAt(byNode: ByNode<Figure>, node: ProcessNode): Figure {
  const figure = byNode[node]
  if (figure === null || figure === undefined) {
    throw new Error(`No figure at ${node}: a spec row cannot point at a node this core does not offer.`)
  }
  return figure
}