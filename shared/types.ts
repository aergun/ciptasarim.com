/**
 * Bilingual prose and the taxonomy identities the whole site agrees on.
 *
 * Two rules govern this file.
 *
 * 1. **Derived figures are never authored.** No bare `number` exists anywhere above
 *    the `Figure` layer. A value that is measured, modelled, or not characterised at
 *    all is only representable through `Figure`, which cannot be constructed without
 *    saying which of the three it is. See `Figure` below.
 *
 * 2. **Identifiers are never translated.** Slugs, format names, node ids, port
 *    names and enum members are contractual — they end up in file paths, delivery
 *    manifests, and the `filename*` header of a download. A slug is a `string` and
 *    nothing more; prose is `T` and can never be assigned where a `string` is
 *    expected, so this separation is enforced by the type system rather than by
 *    convention.
 */

/* -------------------------------------------------------------------------- */
/* Prose                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * A piece of long-form text in both languages.
 *
 * Used for anything that does not fit in a nav bar or a filter chip — summaries,
 * descriptions, article bodies, licence rights. Short labels live in the locale
 * bundle (`locales/tr.ts`), which is a mirror pair and therefore cannot fall half
 * translated.
 *
 * Both fields are required. A `Partial<T>` would make a missing translation a
 * runtime blank, which is exactly the failure the two-layer split exists to
 * prevent.
 */
export type T = { tr: string; en: string }

/* -------------------------------------------------------------------------- */
/* Taxonomy                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * The four kinds of IP, as an untranslated identifier array that stays the type
 * source. `CORE_KINDS[number]` is `CoreKind`; adding a member here adds a required
 * label in the locale bundle and a required arm in the `Core` union below.
 *
 * These four cannot share a spec model. A soft RTL core has a gate count and a
 * frequency; a hard macro has characterised silicon and no portable gate count;
 * analog has ENOB and SNDR; verification collateral has no physical figures at
 * all. A single flat spec block would be a lie in three of its four arms, so `Core`
 * is a discriminated union rather than a record of optional fields.
 */
export const CORE_KINDS = ['soft-rtl', 'hard-macro', 'analog', 'verification'] as const
export type CoreKind = (typeof CORE_KINDS)[number]

/**
 * Process nodes, broad on purpose — the site needs to be able to say "not
 * characterised at this node" for the nodes it does not serve, which is only
 * expressible if the node exists in the type.
 *
 * Note the difference from a curated list: breadth here buys the ability to record
 * absence. It is not a claim that silicon exists at every one of these nodes in
 * every family. What each cell actually says is `content/processes.ts`, and every
 * cell there carries its own `Figure` basis.
 */
export const PROCESS_NODES = [
  '180nm',
  '130nm',
  '90nm',
  '65nm',
  '40nm',
  '28nm',
  '22nm',
  '16nm',
  '14nm',
  '12nm',
  '7nm',
  '5nm',
  '3nm',
  '2nm',
] as const
export type ProcessNode = (typeof PROCESS_NODES)[number]

/**
 * Licence tiers, in the industry's own vocabulary rather than a marketing ladder.
 *
 * `evaluation` is RTL only and explicitly not for tapeout — the restriction is
 * load-bearing, because an evaluation licence that quietly permitted a tapeout
 * would be a legal exposure rather than a pricing decision.
 */
export const LICENSE_TIERS = ['evaluation', 'production', 'multi-use'] as const
export type LicenseTier = (typeof LICENSE_TIERS)[number]

/** Delivery bundles. Four distinct sets of files with four distinct purposes. */
export const BUNDLE_KINDS = ['rtl', 'layout', 'netlist', 'porting'] as const
export type BundleKind = (typeof BUNDLE_KINDS)[number]

/* -------------------------------------------------------------------------- */
/* Figures — the provenance layer                                              */
/* -------------------------------------------------------------------------- */

/**
 * Units are untranslated identifiers, formatted for display by
 * `formatFigure()` in `shared/i18n.ts`. The identifier is what a calculator and a
 * JSON export use; the rendered form is what a reader sees, and it differs between
 * `tr-TR` and `en-GB`.
 */
export type FigureUnit =
  | 'GE' // gate equivalents
  | 'um2' // µm² — macro area
  | 'um2/bit' // µm² per bit — cell area
  | 'MHz'
  | 'GHz'
  | 'uW'
  | 'mW'
  | 'W'
  | 'mA'
  | 'pJ' // picojoules — energy per cycle
  | 'bit'
  | 'dB'
  | 'LSB'
  | 'percent'
  | 'nm' // feature size
  | 'um' // interconnect length, or a square edge
  | 'ps'
  | 'count'
  | 'USD'

/**
 * A single engineering figure, and the reason it is the only way to hold a number.
 *
 * Three states, not two, and the third is the point:
 *
 * - `measured` — characterised on silicon or in simulation, with the conditions it
 *   was measured under and a source a reader can check.
 * - `modelled` — computed from a stated model. A modelled number is a real number
 *   about a real thing, but it is a prediction, and it is labelled as one.
 * - `uncharacterised` — **carries no `value` field at all.** Not zero, not `null`,
 *   not an empty cell. It carries a `reason` instead.
 *
 * The reason `uncharacterised` exists as a structural absence is that "we have not
 * measured this" is a fact a customer needs and a decision they may need to make,
 * whereas `0` is a number they will design against and blank space is a bug they
 * will report. A reader who cannot distinguish absence from a value is exactly the
 * failure mode a semiconductor IP catalogue is built to avoid.
 *
 * Making `value` absent rather than optional means no downstream code can render
 * one without first narrowing on `basis` — the compiler stops the mistake, it does
 * not document it.
 */
export type Figure =
  | {
      basis: 'measured'
      value: number
      unit: FigureUnit
      /**
       * The PVT, corner, voltage, temperature, load and silicon step the number was
       * taken at. A frequency measured at an easy corner is not the frequency.
       */
      conditions: string
      /**
       * A checkable citation. A measured figure with no source is an assertion, and
       * this site does not ship assertions.
       */
      source: string
    }
  | {
      basis: 'modelled'
      value: number
      unit: FigureUnit
      /**
       * The model, named specifically enough to be argued with — "Lombardi with
       * Elmore extraction" rather than "typical".
       */
      model: string
      note?: string
      /**
       * `null` when the model is ours and carries no external citation. A modelled
       * figure is allowed to be unsourced; a measured one is not. The asymmetry is
       * deliberate: a prediction is an opinion and can be labelled as one, while a
       * measurement claims to be a fact and must show its working.
       */
      source: string | null
    }
  | {
      basis: 'uncharacterised'
      reason: string
    }

/**
 * A figure per process node.
 *
 * `null` means **not offered at this node** — a 7 nm-only core has no 180 nm entry
 * because there is no 180 nm version, which is a different statement from "the
 * 180 nm version exists and we have not characterised it". That second case is an
 * `uncharacterised` `Figure`, and the distinction is the whole reason this is a
 * `Record` over the full node set rather than a `Partial`.
 *
 * Every node key must be present. A missing key would be a silent omission, which
 * is the failure this type is built to make unrepresentable.
 */
export type ByNode<F> = { [N in ProcessNode]: F | null }

/* -------------------------------------------------------------------------- */
/* Spec presentation                                                           */
/* -------------------------------------------------------------------------- */

/**
 * One row in a spec table.
 *
 * This replaces the reference project's `SpecRow { label: string; value: string }`,
 * which is the one place the port deliberately refuses to copy. That type baked
 * value and unit into a single pre-formatted string, which made it structurally
 * incapable of expressing provenance (a measured and a modelled figure were the
 * same `string`), untranslatable (the label could not become `T`), and unlocalisable
 * (`"12.34"` was fixed before any locale formatting could run).
 *
 * Here the figure stays a `Figure` until the moment it is rendered, so
 * `formatFigure()` can apply `tr-TR` conventions and the component can render `basis`
 * as a visible badge. Neither is possible once the value has been flattened.
 */
export type SpecCell = {
  /** Stable id, for anchors, comparison columns and translation lookup. */
  id: string
  label: T
  figure: Figure
  note?: T
}

/* -------------------------------------------------------------------------- */
/* Ports                                                                       */
/* -------------------------------------------------------------------------- */

export type PortDirection = 'in' | 'out' | 'inout'
export type PortKind = 'clock' | 'reset' | 'data' | 'control' | 'power' | 'analog' | 'debug'

export type Port = {
  name: string
  direction: PortDirection
  kind: PortKind
  width: number
  description: T
  /**
   * Signal standard, where one applies — `LVDS`, `HSTL`, `CML`. Deliberately a bare
   * `string` and not a taxonomy: standards are added by every process node and PDK
   * and an enum would rot.
   */
  standard?: string
}

/* -------------------------------------------------------------------------- */
/* Deliverables                                                                */
/* -------------------------------------------------------------------------- */

/**
 * File formats a delivery can contain. Identifiers, not display strings — a
 * downstream tool reads the manifest, and the label is chosen per bundle.
 */
export type DocumentFormat =
  | 'verilog'
  | 'systemverilog'
  | 'vhdl'
  | 'sdc'
  | 'sva'
  | 'uvm'
  | 'tcl'
  | 'gds'
  | 'oas'
  | 'lef'
  | 'def'
  | 'lib'
  | 'netlist'
  | 'sdf'
  | 'spef'
  | 'view'
  | 'pdf'
  | 'xlsx'
  | 'zip'
  | 'tgz'

/**
 * One file in a delivery.
 *
 * Mirrors the reference project's `DocumentFile` deliberately, including the rule
 * that matters most: **`path` is relative to `FILES_DIR` and is never a public URL.**
 * Anything under `public/` is statically served, so a path there would put a
 * customer's paid RTL and gate-level netlist on the open web and make the download
 * route's entitlement check decorative.
 */
export type DocumentFile = {
  key: string
  label: T
  /** Relative to `FILES_DIR`. Never begins with `/`, never a URL. */
  path: string
  sizeKb: number
  format: DocumentFormat
  /** The lowest tier entitled to this file, or `null` if every tier gets it. */
  requires: LicenseTier | null
  /** The node this file is characterised for, when it is node-specific. */
  node: ProcessNode | null
  /** The port variant this file matches, when the core is delivered per-port. */
  port: string | null
  version: string
}

/**
 * A PDK reference, required on every hard macro.
 *
 * A layout deliverable is meaningless without knowing which PDK and which revision
 * of it it was signed off against — the same GDSII is not portable across a metal
 * stack change. So this is not optional metadata on the macro arm; it is a required
 * field, and `source` is `null` until a customer confirms which PDK they hold.
 */
export type PdkReference = {
  foundry: T
  node: ProcessNode
  pdkVersion: T
  source: string | null
}

/* -------------------------------------------------------------------------- */
/* Per-kind specs — only what is true of each kind                            */
/* -------------------------------------------------------------------------- */

export type SoftRtlSpec = {
  gateEquivalents: ByNode<Figure>
  maxFrequency: ByNode<Figure>
  power: ByNode<Figure>
  ports: readonly Port[]
}

export type HardMacroSpec = {
  /** µm² per bit. A macro has no portable gate count, only a density. */
  density: ByNode<Figure>
  macroArea: ByNode<Figure>
  maxFrequency: ByNode<Figure>
  ports: readonly Port[]
}

export type AnalogSpec = {
  enob: ByNode<Figure>
  sndr: ByNode<Figure>
  sampleRate: ByNode<Figure>
  /**
   * Full-scale range. Prose rather than a `Figure`: it is a compound statement
   * ("0–1.2 V input, 1.8 V supply") where a single number and unit would be a
   * distortion, and a `Figure` here would have to carry a value we could not honestly
   * attach a single basis to.
   */
  inputRange: T
  ports: readonly Port[]
}

export type VerificationSpec = {
  assertions: ByNode<Figure>
  coverage: ByNode<Figure>
  /** The standard the collateral is written against, untranslated. */
  standard: T
  /**
   * No physical figures exist for this kind. That is not a gap in the type — a UVM
   * environment has no area, and a coverage percentage has no frequency, and adding
   * either field would invite a reader to compare them to a core that has both.
   */
}

/* -------------------------------------------------------------------------- */
/* The catalogue                                                               */
/* -------------------------------------------------------------------------- */

export type CoreBase = {
  /** Untranslated. A slug is a contractual identifier and appears in delivery paths. */
  slug: string
  /** Untranslated part number, e.g. `CT-UART-FIFO`. */
  name: string
  family: string
  summary: T
  description: T
  tags: readonly string[]
  /** The nodes this core is actually offered at. Narrower than `PROCESS_NODES`. */
  nodes: readonly ProcessNode[]
  documents: readonly DocumentFile[]
  /**
   * Rendered spec rows. Authored rather than derived from `spec` because the order
   * a buyer wants to read them in is not the order the types are declared in, and
   * because a per-node figure is a *choice* about which node to lead with.
   */
  figures: readonly SpecCell[]
}

/**
 * A catalogue entry — a discriminated union over `CoreKind`.
 *
 * Narrowing on `kind` gives a spec model that is true of that kind and nothing
 * else. The compiler enforces it: a verification core with a `maxFrequency` does not
 * compile, and neither does a hard macro without a `pdk`.
 */
export type Core =
  | (CoreBase & { kind: 'soft-rtl'; spec: SoftRtlSpec })
  | (CoreBase & { kind: 'hard-macro'; spec: HardMacroSpec; pdk: PdkReference })
  | (CoreBase & { kind: 'analog'; spec: AnalogSpec })
  | (CoreBase & { kind: 'verification'; spec: VerificationSpec })

/* -------------------------------------------------------------------------- */
/* Licensing                                                                   */
/* -------------------------------------------------------------------------- */

export type License = {
  id: LicenseTier
  name: T
  summary: T
  /** Authored per licence, not derived. See `shared/pricing.ts` for why. */
  priceUsd: number
  /**
   * What a core's own price is multiplied by for this tier. Kept as an authored
   * number rather than a curve because a royalty-bearing IP licence and a
   * single-use tapeout licence are not the same product at different sizes.
   */
  multiplier: number
  includes: readonly T[]
  /**
   * As important as `includes`, and enforced rather than advisory: a delivery
   * manifest is filtered by tier, so an item named here is withheld rather than
   * merely undocumented.
   */
  excludes: readonly T[]
  rights: readonly T[]
  restrictions: readonly T[]
  /** Concurrent seats, or `null` for unlimited. */
  seats: number | null
  /** Permitted tapeouts, or `null` for unlimited. */
  tapeouts: number | null
}

/* -------------------------------------------------------------------------- */
/* Process table                                                               */
/* -------------------------------------------------------------------------- */

/**
 * One process node's characterisation.
 *
 * Every field is a `Figure`, not a number. The site's process table ships broad —
 * `PROCESS_NODES` spans 180 nm to 2 nm — precisely so that a reader asking about a
 * node gets an answer, and the honest answer is frequently "we have not measured
 * that here". A table of bare numbers could only answer with a number, and would
 * therefore be inventing it.
 *
 * This is the structural difference from the reference project. There, every
 * constant could be defended against a real boat's fitted machinery — that is what
 * makes `RESISTANCE_TO_WEIGHT = 0.28` legitimate. There is no equivalent check
 * available here, because there is no characterised silicon to check against, and
 * pretending otherwise is the failure this type exists to prevent.
 */
export type Process = {
  node: ProcessNode
  /**
   * Per-cell, `uncharacterised` unless measured at this node. Drives area and
   * leakage estimates, so it is the number with the widest blast radius.
   */
  cellArea: Figure
  /** Defect density, `cm⁻²`. Drives yield. */
  defectDensity: Figure
  /** Metal layers available to the router. */
  metalLayers: Figure
  /** Nominal supply voltage. */
  vdd: Figure
  /** Leakage current per micron of gate width at nominal conditions. */
  leakage: Figure
  /** Wire bond pitch, or `uncharacterised` — pad-limited designs depend on it. */
  bondPitch: Figure
  /**
   * What this table may be used for. `null` until a cell is confirmed, at which
   * point the site stops presenting the row as a datasheet figure and the
   * `EngineeringNotice` can say what it is for.
   */
  source: string | null
}

/* -------------------------------------------------------------------------- */
/* Calculators                                                                 */
/* -------------------------------------------------------------------------- */

export const TOOL_IDS = [
  'critical-path',
  'dynamic-power',
  'leakage',
  'area',
  'yield',
  'cost-per-die',
  'slack',
  'licence-economics',
] as const
export type ToolId = (typeof TOOL_IDS)[number]

/**
 * An input field.
 *
 * `unit` is a `FigureUnit` so that the calculator's own UI and the spec tables
 * format identically, and so a value pasted between them means the same thing.
 * `default` is required rather than optional: a calculator field with no default is a
 * field whose shipped share link depends on a value the author made up at runtime.
 */
export type Field = {
  id: string
  label: T
  unit: FigureUnit
  default: number
  min: number
  max: number
  step: number
  help?: T
}

export type ResultField = {
  id: string
  label: T
  unit: FigureUnit
  /**
   * Renders the value with a `proven` / `flare` / `void` treatment so a reader can
   * tell a measured-derived result from a modelled one without reading the note. Same
   * colour discipline as the spec tables.
   */
  basis: Figure['basis']
}

export type Tool = {
  id: ToolId
  slug: string
  title: T
  summary: T
  /**
   * What the model assumes and where it stops being true. Rendered in the
   * `EngineeringNotice` above the results, never below them.
   */
  caveat: T
  inputs: readonly Field[]
  results: readonly ResultField[]
}

/* -------------------------------------------------------------------------- */
/* Articles                                                                    */
/* -------------------------------------------------------------------------- */

export type ArticleBlock =
  | { kind: 'paragraph'; text: T }
  | { kind: 'heading'; text: T }
  | { kind: 'list'; items: readonly T[] }
  | { kind: 'quote'; text: T; attribution?: T }
  | { kind: 'callout'; text: T; tone: 'note' | 'warning' }
  | { kind: 'image'; src: string; alt: T; caption?: T }
  /** A live calculation embedded in the prose, so the article cannot quote a number the tool disagrees with. */
  | { kind: 'tool'; tool: ToolId; preset?: Record<string, number> }
  | { kind: 'figure'; figure: Figure; caption?: T }

export type Article = {
  slug: string
  title: T
  standfirst: T
  date: string
  readingMinutes: number
  tags: readonly string[]
  blocks: readonly ArticleBlock[]
}

/* -------------------------------------------------------------------------- */
/* Narrowing helpers                                                           */
/* -------------------------------------------------------------------------- */

/** Cores of one kind, for the catalogue and the comparison view. */
export function coresOfKind<K extends CoreKind>(cores: readonly Core[], kind: K): readonly Core[] {
  return cores.filter((c) => c.kind === kind)
}

/**
 * Reads a per-node value, distinguishing "not offered here" from "offered but not
 * characterised". Callers must handle the two differently, which is why this returns
 * the union rather than a `Figure | undefined`.
 */
export function atNode<F>(byNode: ByNode<F>, node: ProcessNode): F | null {
  return byNode[node]
}
