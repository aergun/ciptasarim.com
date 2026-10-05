/**
 * The core catalogue — assembly only.
 *
 * ## Every core here is a placeholder shell
 *
 * **No core on this site has a characterised specification.** The owner has not yet
 * described the real cores, so what follows is the *shape* of the catalogue — the
 * structure a core fits into — with every engineering figure left `uncharacterised`
 * and carrying a reason. Nothing here is invented, and the reasons say what is
 * missing rather than papering over it.
 *
 * This is why each core is a separate file under `content/cores/`. A placeholder
 * shell that is structurally identical to the real thing means publishing the real
 * cores is a **content change, not a code change**: you fill in the reasons, add
 * nodes, and the union in `shared/types.ts` and every page in `src/` already know
 * how to render what you added.
 *
 * ## Why the shells are shipped at all
 *
 * Because the machinery they exercise is the entire point of this site. A catalogue
 * whose every figure is uncharacterised is the honest state of an IP house that has
 * not published its characterisation data — and rendering *that* correctly, with a
 * visible basis on every cell and no silent zero anywhere, is a harder thing to get
 * right than rendering a full data table, and a far more useful thing to have got
 * right.
 *
 * A reader who lands here should understand within one screen that this is an IP
 * vendor whose published specifications are pending, rather than one with a broken
 * datasheet. That is what these files are for.
 *
 * ## The slug is never translated
 *
 * `slug` and `name` are bare `string`s, not `T`. A slug is a contractual identifier:
 * it appears in the URL, in the delivery path and in an order line, and translating
 * one would mean the same core had two identities across two locales. Turkish
 * characters also percent-encode badly in a path, and these routes are read by
 * people typing URLs.
 */

import type { Core } from '../shared/types.ts'
import { uartFifo } from './cores/uart-fifo.ts'
import { clockDivider } from './cores/clock-divider.ts'
import { sramMacro } from './cores/sram-macro.ts'
import { sigmaDeltaAdc } from './cores/sigma-delta-adc.ts'
import { uvmEnvironment } from './cores/uvm-environment.ts'

/**
 * Every core, unfiltered.
 *
 * A plain array rather than a per-kind record: the four kinds are a discriminated
 * union, so the array is the one container that can hold all of them without the
 * file having to restate the union. Grouping by kind is a *view*, and lives in
 * `coresOfKind()` (`shared/types.ts`) where it can be wrong in exactly one place.
 */
export const cores: readonly Core[] = [uartFifo, clockDivider, sramMacro, sigmaDeltaAdc, uvmEnvironment]

/** One core by slug, or `null`. The only lookup a route needs. */
export function coreFor(slug: string): Core | null {
  return cores.find((c) => c.slug === slug) ?? null
}