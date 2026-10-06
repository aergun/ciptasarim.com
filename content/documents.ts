/**
 * Delivery manifests.
 *
 * ## Why the manifest is derived rather than authored
 *
 * This is the one derived figure in the project, and it is derived because the
 * alternative is a list that can contradict itself.
 *
 * A core's `documents` array says what exists. A purchase says what tier and which
 * bundle. Whether a given file is in a given purchase is therefore a *question about
 * two authored facts*, and if that question were answered by hand — a second list,
 * "what an evaluation licence gets" — the two lists would eventually disagree, and
 * the disagreement would be resolved by whichever one a route happened to read.
 *
 * `manifestFor(core, tier)` asks it instead. It is the same shape as
 * `finaliseDesign()` in the reference project — *"a hand-calculated one is
 * eventually wrong somewhere"* — applied to entitlement rather than to physics.
 *
 * ## The rule, and why it is not a rule about tiers
 *
 * A file is in the manifest when `requires` is `null` (everyone gets it) or when the
 * held tier satisfies `requires`.
 *
 * The tier ordering is `covers(held, required)` from `content/licences.ts`, and it
 * is **not** the alphabetical or numeric order of the ids — `evaluation` < `production`
 * < `multi-use` happens to be right, but it is right because the licence content says
 * so. An evaluation licence cannot receive a file that requires `production`, which
 * is the whole reason evaluation is cheaper.
 *
 * ## `path` is relative to FILES_DIR and is never a URL
 *
 * Repeated because it is the load-bearing invariant of the download route. A path
 * under `public/` is statically served by Vite, which would put a customer's paid RTL
 * and gate-level netlist on the open web and make the entitlement check in
 * `server/routes/library.ts` decorative. `resolveInside()` re-checks this at read
 * time regardless of what is authored here.
 */

import type { Core, DocumentFile, LicenseTier } from '../shared/types.ts'
import { covers } from './licences.ts'
import type { Bundle } from './packages.ts'

/**
 * Does a file belong in a purchase at `tier`?
 *
 * `requires: null` means every tier receives it — datasheets and interface
 * documentation, which are the marketing collateral and cost nothing to withhold.
 * A file with a `requires` is withheld from any tier that does not cover it, and
 * `excludes` on the licence makes the same promise from the other direction.
 */
function included(file: DocumentFile, tier: LicenseTier): boolean {
  if (file.requires === null) return true
  return covers(tier, file.requires)
}

/**
 * The files a customer holding `tier` may download for `core`.
 *
 * Filtered, never reordered and never renamed: a manifest that renames a file to
 * match the licence would mean the delivered artefact's name depended on who bought
 * it, which makes a checksum quoted in support meaningless.
 */
export function manifestFor(core: Core, tier: LicenseTier): readonly DocumentFile[] {
  return core.documents.filter((file) => included(file, tier))
}

/**
 * The subset of a tier's manifest that belongs to one delivery bundle.
 *
 * A bundle is "a set of files with a purpose", and it names those files by *format*
 * rather than by key — so the mapping is a set intersection rather than a second
 * authored list. That matters for the same reason `manifestFor` is derived: a
 * hand-written "what is in the layout bundle" list is a place for the catalogue and
 * the bundle definitions to disagree, and the disagreement would resolve itself by
 * whichever one a route read first.
 *
 * A core with no `gds` therefore simply has no layout bundle, which is the correct
 * answer for a soft RTL core and needs no special case.
 */
export function bundleManifestFor(core: Core, tier: LicenseTier, bundle: Bundle): readonly DocumentFile[] {
  const formats = new Set(bundle.formats)
  return manifestFor(core, tier).filter((file) => formats.has(file.format))
}

/**
 * The revision history of one file, newest first.
 *
 * Derived from the same array rather than maintained separately, because a separate
 * changelog drifts — it is the classic way a version list ends up claiming a revision
 * that no longer exists on disk. If only the current file is in `documents`, the
 * history is one entry long, and that is an accurate answer rather than a missing one.
 */
export function versionsFor(core: Core, key: string): readonly DocumentFile[] {
  return core.documents.filter((file) => file.key === key).sort((a, b) => b.version.localeCompare(a.version))
}

/**
 * The distinct formats present in a core's manifest.
 *
 * Used to decide which bundles can apply. A bundle delivers formats — `gds` and `oas`
 * for layout, `verilog` and `sdc` for RTL — and a core that has no `gds` cannot sell
 * a layout bundle, which is the check that keeps the bundle grid honest without a
 * second authored table.
 */
export function formatsFor(core: Core): ReadonlySet<DocumentFile['format']> {
  return new Set(core.documents.map((file) => file.format))
}

/**
 * Every file across the catalogue, for the smoke suite to walk.
 *
 * Exported so the suite can assert the download-route invariants — that no `path` is
 * absolute and no `path` reaches `public/` — over the whole catalogue in one place,
 * rather than only over the files a test happens to know about.
 */
export function allDocuments(cores: readonly Core[]): { core: Core; file: DocumentFile }[] {
  return cores.flatMap((core) => core.documents.map((file) => ({ core, file })))
}