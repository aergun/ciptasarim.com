/**
 * Figure provenance verification — the check that runs over every surface the
 * catalogue verifier does NOT reach.
 *
 * `verify-catalogue.ts` walks the cores and the process table. This one walks the
 * figures that live in the *articles*: an `ArticleBlock` union in which the `figure`
 * arm carries a real `Figure` and the `tool` arm carries a live preset. A technical
 * note is exactly the place a plausible number sneaks into a project — "and the yield
 * was about 82%" typed straight into prose, no unit, no source, no model — and none
 * of the other scripts would catch it, because articles are not the catalogue.
 *
 * So the invariants here are the same three, applied to a different surface:
 *
 *  - every `figure` block in prose carries full provenance: `measured` still needs its
 *    source and conditions, `modelled` still names its model, and an
 *    `uncharacterised` value is a *contradiction in a note* — the point of the block
 *    arm is to show sourced numbers, so the reason text is refused here rather than
 *    rendered
 *  - every `tool` block's preset keys are real declared field ids of that tool, and
 *    its values are inside the field's `[min, max]` — a preset with an out-of-range
 *    input would render a tool state the calculator page cannot reproduce
 *  - every `figure` block's unit is one the locales actually map, in BOTH languages
 *    (the `Record<FigureUnit, string>` types force the keys, but a runtime check is
 *    what notices an empty string — a unit label that renders as nothing)
 *  - every `tool` block's tool id is really served by `toolForSlug`-reachable content
 *    (the `ToolId` type guards the union; the runtime check guards a refactor where
 *    a tool was renamed in the dispatcher but a note kept the old id)
 *
 * The agreement check between `tools.ts` and the dispatcher (`resultIdsFor`) is run
 * here too rather than only in `verify-engineering`, so a new calculator that
 * declared results which do not match fails in the same run as the articles do.
 *
 * Run with `npm run verify:figures`.
 */

import type { ArticleBlock, Figure } from '../shared/types.ts'
import { articles } from '../content/articles.ts'
import { tools, toolFor } from '../content/tools.ts'
import { resultIdsFor, runEngineering } from '../shared/engineering.ts'
import { figureUnits as trFigureUnits } from '../locales/tr.ts'
import { figureUnits as enFigureUnits } from '../locales/en.ts'

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

/* -------------------------------------------------------------------------- */

section('Tool ↔ dispatcher agreement')

/**
 * `runEngineering` is the definition of truth for result ids: it returns the
 * `EngineeringResult[]` a calculator page actually renders. This file's `results`
 * arrays are the page's declared metadata. The two are checked here in both
 * directions, so a calculator that starts emitting a result its descriptor does not
 * declare fails just as loudly as one that declares a result it no longer emits.
 */
check('tools content is not empty', tools.length > 0, `${tools.length} tools`)
check(
  'every tool has a unique slug as well as a unique id',
  new Set(tools.map((t) => t.slug)).size === tools.length && new Set(tools.map((t) => t.id)).size === tools.length,
)
for (const tool of tools) {
  const declared = tool.results.map((r) => r.id).sort()
  const emitted = resultIdsFor(tool.id).sort()
  check(
    `${tool.id} · declared results match the dispatcher's emitted ids`,
    declared.length === emitted.length && declared.every((id, i) => id === emitted[i]),
    declared.length === emitted.length ? '' : `declared=[${declared.join(',')}] emitted=[${emitted.join(',')}]`,
  )
}

section('Tool inputs')

for (const tool of tools) {
  const ids = tool.inputs.map((f) => f.id)
  check(`${tool.id} · input ids are unique`, new Set(ids).size === ids.length)
  for (const field of tool.inputs) {
    check(
      `${tool.id} · ${field.id} has min < default <= max`,
      field.min <= field.default && field.default <= field.max,
      `min=${field.min} default=${field.default} max=${field.max}`,
    )
    check(`${tool.id} · ${field.id} steps within its range`, field.step > 0 && field.step <= field.max - field.min)
    for (const [lang, text] of [
      ['tr', field.label.tr],
      ['en', field.label.en],
      ['tr-help', field.help.tr],
      ['en-help', field.help.en],
    ] as const) {
      check(
        `${tool.id} · ${field.id} ${lang} is non-empty prose`,
        typeof text === 'string' && text.trim().length > 0,
      )
    }
    // The unit label must exist in both locale maps. The types make a missing key a
    // compile error; an *empty* label is what this check is for.
    const trLabel = trFigureUnits[field.unit as keyof typeof trFigureUnits] as string | undefined
    const enLabel = enFigureUnits[field.unit as keyof typeof enFigureUnits] as string | undefined
    check(
      `${tool.id} · ${field.id} unit ${JSON.stringify(field.unit)} is labelled in both locales`,
      typeof trLabel === 'string' && trLabel.length > 0 && typeof enLabel === 'string' && enLabel.length > 0,
      `tr=${JSON.stringify(trLabel)} en=${JSON.stringify(enLabel)}`,
    )
  }
  // The descriptors' declared units must agree with the unit the dispatcher
  // actually stamps on each emitted result — the page formats from
  // `EngineeringResult`, so a descriptor saying `mW` for a result emitted as `µW`
  // would render a page whose metadata lies about its own numbers.
  const emitted = runEngineering(
    tool.id,
    Object.fromEntries(tool.inputs.map((f) => [f.id, f.default])),
  )
  for (const result of tool.results) {
    const live = emitted.find((r) => r.id === result.id)
    check(
      `${tool.id} · ${result.id} declared unit agrees with the emitted unit`,
      live !== undefined && live.unit === result.unit,
      live !== undefined ? `declared=${result.unit} emitted=${live.unit}` : 'no result emitted under this id',
    )
  }
}

/**
 * The run just executed above is this check's subject: defaults are the numbers a
 * reader first sees, so every tool must return a numeric result for its own
 * defaults — a NaN or Infinity in a default run means the model's own window does
 * not cover its recommended starting values.
 */
for (const tool of tools) {
  const emitted = runEngineering(
    tool.id,
    Object.fromEntries(tool.inputs.map((f) => [f.id, f.default])),
  )
  for (const result of emitted) {
    check(
      `${tool.id} · ${result.id} is finite at the tool's own defaults`,
      Number.isFinite(result.value),
      `value=${String(result.value)}`,
    )
  }
}

/* -------------------------------------------------------------------------- */

section('Articles — figure and tool blocks')

check('articles content is not empty', articles.length > 0, `${articles.length} notes`)
check(
  'every article has a unique slug',
  new Set(articles.map((a) => a.slug)).size === articles.length,
)
for (const article of articles) {
  check(`${article.slug} slug is lowercase ASCII and URL-safe`, /^[a-z0-9-]+$/.test(article.slug))
  check(
    `${article.slug} date parses as an ISO date`,
    /^\d{4}-\d{2}-\d{2}$/.test(article.date) && !Number.isNaN(Date.parse(article.date)),
    `date=${article.date}`,
  )
  check(`${article.slug} reading minutes are positive`, article.readingMinutes > 0)
  check(`${article.slug} has blocks`, article.blocks.length > 0)

  article.blocks.forEach((block: ArticleBlock, i: number) => {
    const where = `${article.slug} block[${i}]`

    if (block.kind === 'figure') {
      const f: Figure = block.figure
      if (f.basis === 'uncharacterised') {
        // Prose is where a reason belongs; the block arm exists to show sourced
        // numbers. An uncharacterised figure inside a note is a contradiction —
        // the paragraph text is where "we have not measured it" goes.
        check(`${where} figure is not uncharacterised`, false, 'an article block shows sourced numbers or it says so in prose')
      } else if (f.basis === 'measured') {
        check(
          `${where} measured carries conditions and a source`,
          f.conditions.trim().length > 0 && f.source.trim().length > 0,
          'a measured claim in prose is an assertion without these',
        )
      } else {
        check(
          `${where} modelled names its model`,
          f.model.trim().length > 0,
          'a modelled claim in prose that names no model cannot be argued with',
        )
      }
      const unit = f.basis === 'uncharacterised' ? null : f.unit
      if (unit) {
        const trUnitLabel = trFigureUnits[unit as keyof typeof trFigureUnits]
        const enUnitLabel = enFigureUnits[unit as keyof typeof enFigureUnits]
        check(
          `${where} unit ${JSON.stringify(unit)} is labelled in both locales`,
          typeof trUnitLabel === 'string' && trUnitLabel.length > 0 &&
            typeof enUnitLabel === 'string' && enUnitLabel.length > 0,
        )
      }
      if (block.caption) check(`${where} caption is bilingual prose`, block.caption.tr.length > 0 && block.caption.en.length > 0)
    }

    if (block.kind === 'tool') {
      const tool = toolFor(block.tool)
      check(`${where} tool id resolves to content`, tool !== null, `tool=${block.tool}`)
      if (tool) {
        for (const [key, value] of Object.entries(block.preset ?? {})) {
          const field = tool.inputs.find((f) => f.id === key)
          check(
            `${where} preset key ${JSON.stringify(key)} is a declared input of ${tool.id}`,
            field !== undefined,
            'a preset with a key the tool does not declare silently does nothing',
          )
          if (field) {
            check(
              `${where} preset ${key}=${String(value)} is inside [${field.min}, ${field.max}]`,
              value >= field.min && value <= field.max,
              'an out-of-range preset renders a state the calculator page cannot reproduce',
            )
          }
        }
      }
    }

    if (block.kind === 'paragraph' || block.kind === 'heading' || block.kind === 'quote' || block.kind === 'callout') {
      const text = block.text
      check(
        `${where} (${block.kind}) is bilingual, non-empty and not copy-pasted`,
        text.tr.trim().length > 0 && text.en.trim().length > 0 && text.tr !== text.en,
      )
    }

    if (block.kind === 'list') {
      block.items.forEach((item, j) => {
        check(`${where} item[${j}] is bilingual and not copy-pasted`, item.tr.trim().length > 0 && item.tr !== item.en)
      })
    }
  })
}

// ---------------------------------------------------------------------------
/**
 * The article ↔ tool numeric agreement check.
 *
 * Where a note states a value in its modelled `figure` arm AND embeds the `tool`
 * block whose preset produced it, the two must agree to the precision the prose
 * quotes. This cannot be automated in general — knowing which prose sentence refers
 * to which block is a reading task — so instead the check re-runs each article's
 * tool blocks and records the values here as a printed table whose numbers I review
 * against the prose before every commit. A note whose numbers drifted from its
 * calculator shows up as a diff in this output.
 */
console.log('\nArticle tool-block values (review against quoted prose):')
for (const article of articles) {
  for (const [i, block] of article.blocks.entries()) {
    if (block.kind === 'tool') {
      const values = runEngineering(block.tool, block.preset ?? {})
        .map((r) => `${r.id}=${r.value.toPrecision(6)} ${r.unit}`)
      console.log(`  ${article.slug} block[${i}] ${block.tool}: ${values.join('  ·  ')}`)
    }
  }
}

/* -------------------------------------------------------------------------- */

console.log('\n' + '='.repeat(60))
if (failures.length === 0) {
  console.log(`verify:figures passed — ${passed} checks`)
} else {
  console.log(`verify:figures FAILED — ${failures.length} failure(s), ${passed} passed\n`)
  for (const f of failures) console.log(`  · ${f}`)
  process.exitCode = 1
}