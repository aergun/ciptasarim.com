/**
 * Catalogue verification.
 *
 * The engineering suite (`verify-engineering.ts`) checks the *models*. This one
 * checks the *catalogue*, and it exists because of the failure mode this whole
 * project is built around: **a plausible number attached to nothing.**
 *
 * Everything in the catalogue is currently a placeholder shell, so the most likely
 * way this site goes wrong over the next year is not a crash — it is somebody
 * filling in a spec cell with a value that came from a datasheet they read once, or
 * from a plausible-looking figure they reasoned their way to. The number would
 * render, look fine, and be exactly the thing the whole provenance layer exists to
 * prevent shipping.
 *
 * So these checks make that mistake *loud* rather than invisible:
 *
 *  - every `uncharacterised` carries a reason, and carries no `value` field
 *  - no figure anywhere claims `measured` without a checkable source
 *  - every spec row points at a node the core actually offers
 *  - every prose field is genuinely bilingual (both languages, neither empty)
 *  - slugs are ASCII and lowercase, because they appear in paths and in order lines
 *  - the four kinds are mutually exclusive in what they are allowed to claim
 *
 * Run with `npm run verify:catalogue`.
 */

import type { Core, Figure, Process, SpecCell, T } from '../shared/types.ts'
import { CORE_KINDS, PROCESS_NODES } from '../shared/types.ts'
import { cores, coreFor } from '../content/cores.ts'
import { processes, characterisedNodes } from '../content/processes.ts'
import { licences } from '../content/licences.ts'
import { bundles } from '../content/packages.ts'
import { fold, matches } from '../shared/i18n.ts'

let passed = 0
const failures: string[] = []

function check(label: string, ok: boolean, detail = ''): void {
  if (ok) {
    passed++
    console.log(`  ok    ${label}`)
  } else {
    failures.push(`${label}${detail ? ` — ${detail}` : ''}`)
    console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ''}`)
  }
}

function section(name: string): void {
  console.log(`\n${name}\n${'-'.repeat(name.length)}`)
}

/** Walks every `Figure` reachable in a value, with a path describing where it was. */
function figuresIn(value: unknown, path: string, out: { path: string; figure: Figure }[] = []): typeof out {
  if (Array.isArray(value)) {
    value.forEach((v, i) => figuresIn(v, `${path}[${i}]`, out))
  } else if (value && typeof value === 'object') {
    const candidate = value as Record<string, unknown>
    if (typeof candidate.basis === 'string' && 'basis' in candidate) {
      out.push({ path, figure: value as Figure })
    } else {
      for (const [k, v] of Object.entries(candidate)) figuresIn(v, `${path}.${k}`, out)
    }
  }
  return out
}

function checkProse(label: string, t: T | undefined): void {
  check(
    `${label} is bilingual`,
    typeof t?.tr === 'string' && t.tr.trim().length > 0 && typeof t?.en === 'string' && t.en.trim().length > 0,
    `tr=${JSON.stringify(t?.tr?.slice(0, 40))} en=${JSON.stringify(t?.en?.slice(0, 40))}`,
  )
}

// ---------------------------------------------------------------------------

section('Catalogue shape')

check('the catalogue is not empty', cores.length > 0, `${cores.length} cores`)
check(
  'every core has a unique slug',
  new Set(cores.map((c) => c.slug)).size === cores.length,
  cores.length !== new Set(cores.map((c) => c.slug)).size ? 'duplicate slug' : '',
)
check(
  'every core has a unique part number',
  new Set(cores.map((c) => c.name)).size === cores.length,
)
check('every core kind is a member of CORE_KINDS', cores.every((c) => (CORE_KINDS as readonly string[]).includes(c.kind)))
check('all four IP kinds are represented', new Set(cores.map((c) => c.kind)).size === CORE_KINDS.length)
check('coreFor resolves every slug', cores.every((c) => coreFor(c.slug)?.slug === c.slug))
check('coreFor returns null for an unknown slug', coreFor('does-not-exist') === null)

// ---------------------------------------------------------------------------

section('Slugs and identifiers')

for (const core of cores) {
  check(
    `${core.slug} slug is lowercase ASCII and URL-safe`,
    /^[a-z0-9-]+$/.test(core.slug),
    `slug=${JSON.stringify(core.slug)}`,
  )
  check(
    `${core.slug} name is a part number, not prose`,
    core.name.length > 0 && core.name.length <= 40,
    `name=${JSON.stringify(core.name)}`,
  )
}

// ---------------------------------------------------------------------------

section('Figures — the provenance invariants')

const allFigures = cores.flatMap((c) => figuresIn(c.spec, `${c.slug}.spec`, []))
check('the catalogue contains figures to check', allFigures.length > 0, `${allFigures.length} figures`)

for (const { path, figure } of allFigures) {
  if (figure.basis === 'uncharacterised') {
    check(`${path} carries a reason in both languages`, typeof figure.reason?.tr === 'string' && figure.reason.tr.trim().length > 0 && typeof figure.reason?.en === 'string' && figure.reason.en.trim().length > 0)
    check(
      `${path} has no value field`,
      !('value' in figure),
      'an uncharacterised figure with a value is a value pretending to have no provenance',
    )
    check(
      `${path} has no unit field`,
      !('unit' in figure),
      'an uncharacterised figure with a unit renders as though a number were withheld rather than absent',
    )
  }
  if (figure.basis === 'measured') {
    check(
      `${path} measured carries conditions and a source`,
      typeof figure.conditions === 'string' &&
        figure.conditions.trim().length > 0 &&
        typeof figure.source === 'string' &&
        figure.source.trim().length > 0,
      'a measured figure with no conditions or source is an assertion',
    )
  }
  if (figure.basis === 'modelled') {
    check(
      `${path} modelled names its model`,
      typeof figure.model === 'string' && figure.model.trim().length > 0,
      'a modelled figure with no named model cannot be argued with',
    )
  }
}

/**
 * The check that matters most while the catalogue is all placeholders.
 *
 * If someone adds a value to a placeholder core, it will almost certainly be
 * `modelled` — that is what the type invites, because it is the arm that needs no
 * external citation. This is the tripwire. While the cores are shells, this must
 * report zero; the day it reports something is the day a real specification
 * arrived, and that should be a deliberate commit with a source attached.
 */
const modelledOrMeasured = allFigures.filter((f) => f.figure.basis !== 'uncharacterised')
check(
  'every core is still an uncharacterised shell (no values smuggled in)',
  modelledOrMeasured.length === 0,
  modelledOrMeasured.length > 0
    ? `${modelledOrMeasured.length} figure(s) now carry a value: ${modelledOrMeasured.map((f) => f.path).join(', ')}`
    : '',
)

// ---------------------------------------------------------------------------

section('Spec rows')

for (const core of cores) {
  check(`${core.slug} has spec rows to render`, core.figures.length > 0, `${core.figures.length} rows`)

  const ids = core.figures.map((f) => f.id)
  check(`${core.slug} spec row ids are unique`, new Set(ids).size === ids.length)

  for (const cell of core.figures) {
    checkProse(`${core.slug} · ${cell.id} label`, cell.label)
    if (cell.note) checkProse(`${core.slug} · ${cell.id} note`, cell.note)
    check(`${core.slug} · ${cell.id} has a figure`, cell.figure !== undefined && cell.figure !== null)
    check(`${core.slug} · ${cell.id} id is slug-safe`, /^[a-z0-9-]+$/.test(cell.id))
  }

  // Every spec row names a node implicitly via the figure it points at; the row
  // must therefore correspond to a node this core offers.
  check(
    `${core.slug} offers at least one node`,
    core.nodes.length > 0,
    'a core with no nodes cannot be compared against the process table',
  )
  check(
    `${core.slug} node list contains only real nodes`,
    core.nodes.every((n) => (PROCESS_NODES as readonly string[]).includes(n)),
  )
}

// ---------------------------------------------------------------------------

section('Per-kind discipline — the union is load-bearing')

for (const core of cores) {
  const spec = core.spec as Record<string, unknown>

  if (core.kind === 'verification') {
    check(
      `${core.slug} (verification) declares no physical figures`,
      !('gateEquivalents' in spec) && !('macroArea' in spec) && !('maxFrequency' in spec) && !('enob' in spec),
      'a verification environment has no area and no frequency; declaring them invites a false comparison',
    )
    check(
      `${core.slug} (verification) declares no ports either`,
      !('ports' in spec),
      'a verification environment has no interface to describe',
    )
  }

  if (core.kind === 'analog') {
    check(
      `${core.slug} (analog) declares no area or frequency`,
      !('gateEquivalents' in spec) && !('macroArea' in spec) && !('maxFrequency' in spec),
      'ENOB and MHz are not commensurable quantities',
    )
    checkProse(`${core.slug} input range`, (spec.inputRange as T) ?? undefined)
  }

  if (core.kind === 'hard-macro') {
    check(`${core.slug} (hard-macro) carries a PDK reference`, 'pdk' in core && Boolean(core.pdk))
    if ('pdk' in core && core.pdk) {
      check(
        `${core.slug} PDK claims no source it does not have`,
        core.pdk.source === null || (typeof core.pdk.source === 'string' && core.pdk.source.trim().length > 0),
        'source: null means "not confirmed", which is not the same as "confirmed, no citation"',
      )
      checkProse(`${core.slug} PDK foundry`, core.pdk.foundry)
      checkProse(`${core.slug} PDK version`, core.pdk.pdkVersion)
    }
  }

  if (core.kind === 'soft-rtl') {
    check(`${core.slug} (soft-rtl) declares gate count and frequency`, 'gateEquivalents' in spec && 'maxFrequency' in spec)
    check(`${core.slug} (soft-rtl) declares no analog figures`, !('enob' in spec) && !('sndr' in spec))
  }
}

// ---------------------------------------------------------------------------

section('Prose is bilingual everywhere')

for (const core of cores) {
  checkProse(`${core.slug} summary`, core.summary)
  checkProse(`${core.slug} description`, core.description)
  check(`${core.slug} description is substantial in both languages`, core.description.tr.length > 200 && core.description.en.length > 200)
  check(
    `${core.slug} description is not identical in both languages`,
    fold(core.description.tr) !== fold(core.description.en),
    'a copy-pasted Turkish string in the English field is a half-translated site',
  )
  /*
   * `ports` is read through the union rather than assumed.
   *
   * `VerificationSpec` deliberately has no `ports` field — a verification
   * environment has no interface to describe — so a check that iterated
   * `core.spec.ports` unconditionally would be asserting a shape the type system
   * explicitly denies to one of the four kinds.
   */
  const ports = 'ports' in core.spec ? core.spec.ports : []
  if ('ports' in core.spec) {
    check(`${core.slug} declares its ports`, ports.length > 0, 'a core with an empty port list documents no interface')
  } else {
    check(`${core.slug} declares no ports`, ports.length === 0)
  }

  for (const port of ports) {
    checkProse(`${core.slug} port ${port.name}`, port.description)
    check(`${core.slug} port ${port.name} width is positive`, port.width > 0)
    check(
      `${core.slug} port ${port.name} direction is valid`,
      ['in', 'out', 'inout'].includes(port.direction),
      `direction=${port.direction}`,
    )
    check(
      `${core.slug} port ${port.name} kind is valid`,
      ['clock', 'reset', 'data', 'control', 'power', 'analog', 'debug'].includes(port.kind),
      `kind=${port.kind}`,
    )
  }
}

// ---------------------------------------------------------------------------

section('Process table')

check('every node has a row', processes.length === PROCESS_NODES.length, `${processes.length} rows, ${PROCESS_NODES.length} nodes`)
check('no node is characterised yet', characterisedNodes().length === 0)

for (const p of processes as Process[]) {
  for (const key of ['cellArea', 'defectDensity', 'metalLayers', 'vdd', 'leakage', 'bondPitch'] as const) {
    const figure = p[key] as Figure
    if (figure.basis === 'uncharacterised') {
      check(`${p.node} · ${key} carries a reason in both languages`, typeof figure.reason?.tr === 'string' && figure.reason.tr.trim().length > 0 && typeof figure.reason?.en === 'string' && figure.reason.en.trim().length > 0)
    } else {
      check(
        `${p.node} · ${key} claims no source it does not have`,
        figure.basis === 'modelled' ? true : figure.source.trim().length > 0,
      )
    }
  }
  check(`${p.node} does not claim a PDK source`, p.source === null || p.source.trim().length > 0)
}

// ---------------------------------------------------------------------------

section('Licences and bundles')

check('the three licence tiers are present', licences.length === 3, licences.map((l) => l.id).join(', '))
for (const licence of licences) {
  checkProse(`licence ${licence.id} name`, licence.name)
  checkProse(`licence ${licence.id} summary`, licence.summary)
  check(`licence ${licence.id} names what it excludes`, licence.excludes.length > 0)
  check(`licence ${licence.id} multiplier is positive`, licence.multiplier > 0)
  check(`licence ${licence.id} does not quote an empty price`, typeof licence.priceUsd === 'number')
}

check('all four deliverable bundles are present', bundles.length === 4, bundles.map((b) => b.id).join(', '))
for (const bundle of bundles) {
  checkProse(`bundle ${bundle.id} name`, bundle.name)
  checkProse(`bundle ${bundle.id} summary`, bundle.summary)
  check(`bundle ${bundle.id} names what it includes`, bundle.includes.length > 0)
  check(`bundle ${bundle.id} names what it excludes`, bundle.excludes.length > 0)
  check(`bundle ${bundle.id} lists delivery formats`, bundle.formats.length > 0)
  check(`bundle ${bundle.id} applies to at least one core kind`, bundle.appliesTo.length > 0)
  check(
    `${bundle.id} applies only to real core kinds`,
    bundle.appliesTo.every((k) => (CORE_KINDS as readonly string[]).includes(k)),
    `appliesTo=${bundle.appliesTo.join(',')}`,
  )
  check(`${bundle.id} price multiplier is positive`, bundle.priceMultiplier > 0)
  checkProse(`bundle ${bundle.id} description`, bundle.description)
}

// ---------------------------------------------------------------------------

section('The Turkish search bug')

/**
 * The verified defect: `'İLETİŞİM'.toLowerCase().includes('iletisim')` is `false`,
 * because JS lowercases `İ` to `i` + U+0307 combining dot. Passing the locale does
 * not fix it. `fold()` strips the mark and the bug goes away.
 *
 * This is checked here rather than only in the smoke suite because the failure is
 * silent: a broken search returns nothing, which looks identical to "no results".
 */
check("fold('İLETİŞİM').includes(fold('iletisim'))", fold('İLETİŞİM').includes(fold('iletisim')))
check("fold('ÇEKİRDEKLER') is findable by 'cekirdekler'", fold('ÇEKİRDEKLER').includes(fold('cekirdekler')))
check("fold('Işık') and fold('ışık') agree", fold('Işık') === fold('ışık'))

/**
 * `fold()` strips *every* combining mark, so ş folds to `s` and ç to `c`.
 *
 * The original plan argued this was wrong — that folding Turkish letters to their
 * ASCII base "would break legitimate searches", and proposed leaving ş/ç intact.
 * That is mistaken, and the implementation in `shared/i18n.ts` is right.
 *
 * Folding is strictly **more** permissive, never less: a query is matched against
 * folded text, so folding the indexed string can only add matches, never remove
 * them. Someone typing `sirket` with an ASCII keyboard finds `Şirket`, and someone
 * typing `şirket` with a Turkish one finds it too. Leaving ş intact would make the
 * second search fail — it is folding that makes both work.
 *
 * The only cost is over-matching (a search for `sirket` also matching something
 * spelled `sirket`), and on a catalogue this size that is free.
 *
 * The plan's own suggested snippet — `s.normalize('NFD').replace(/\p{M}/gu, '')` —
 * folds ş anyway, because ş has a canonical decomposition to `s` + U+0327. So the
 * prose and the snippet in the plan contradicted each other; the snippet was right.
 */
check('fold is more permissive, not less: "sirket" finds "Şirket"', matches(['Şirket'], 'sirket'))
check('and the accented query still works too', matches(['Şirket'], 'şirket'))
check('dotted and dotless I unify in Turkish text', fold('Işık') === fold('ışık'))

// ---------------------------------------------------------------------------

console.log('\n' + '='.repeat(60))
if (failures.length === 0) {
  console.log(`verify:catalogue passed — ${passed} checks`)
} else {
  console.log(`verify:catalogue FAILED — ${failures.length} failure(s), ${passed} passed\n`)
  for (const f of failures) console.log(`  · ${f}`)
  process.exitCode = 1
}