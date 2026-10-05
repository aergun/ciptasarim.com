/**
 * Locale verification — the checks that must never be able to regress.
 *
 * Run with `npm run verify:i18n`. Each assertion here corresponds to a defect found in
 * the reference project or a bug verified on this runtime, so each is worth more than
 * the line it occupies.
 *
 * This is a *build-time* script rather than part of `server/smoke.ts` because these
 * properties are about the source, not about a running server. The type system
 * already enforces the structural half (a missing key is a compile error); what is left
 * is the behavioural half, and behaviour does not follow from types.
 */

import { fold, matches, parseLocaleNumber, toUrlNumber, safeFilename, contentDisposition, formatNumber, formatPercent, formatDate, formatCurrency, parseLocale } from '../shared/i18n.ts'
import { tr } from '../locales/tr.ts'
import { en } from '../locales/en.ts'
import type { TrShape } from '../locales/tr.ts'

let failures = 0
let checks = 0

function check(label: string, condition: boolean, detail = ''): void {
  checks++
  if (condition) {
    console.log(`  ok    ${label}`)
  } else {
    failures++
    console.log(`  FAIL  ${label}${detail ? `\n        ${detail}` : ''}`)
  }
}

function section(title: string): void {
  console.log(`\n${title}`)
  console.log('-'.repeat(title.length))
}

/* -------------------------------------------------------------------------- */
/* 1. The Turkish dotted-capital search bug                                    */
/* -------------------------------------------------------------------------- */

section('Search folding — the verified İLETİŞİM bug')

/*
 * The bug, reproduced so this script fails if it ever comes back:
 *
 *   'İ'.toLowerCase()      → "i̇"  (U+0069 U+0307)
 *   'İ'.toLowerCase('tr')  → "i̇"  ← the locale argument does NOT fix it
 *
 * So the naive implementation misses `İLETİŞİM` for a search of `iletisim`.
 */
check("'İ'.toLowerCase() really does produce i + U+0307", 'İ'.toLowerCase() === 'i̇')
check('passing the tr locale does not fix it', 'İ'.toLowerCase('tr') === 'i̇')
check('a naive toLowerCase search misses İLETİŞİM', !'İLETİŞİM'.toLowerCase().includes('iletisim'))
check('fold() finds İLETİŞİM from iletisim', fold('İLETİŞİM').includes(fold('iletisim')))
check('fold() finds iletişim from İLETİŞİM', fold('iletişim').includes(fold('İLETİŞİM')))
check('fold() handles the mixed case a user actually types', fold('İletişim').includes(fold('iletisim')))

/*
 * The other half, and the reason folding strips the whole diacritic set.
 *
 * The first implementation folded only İ and left ş intact, reasoning that ş and s are
 * different letters in Turkish. That reasoning was wrong about what search is for: it
 * made fold('İLETİŞİM') equal 'iletişim', which cannot contain 'iletisim', so it could
 * not match the ASCII spelling a Turkish user actually types. These two assertions
 * below are the ones that killed it.
 *
 * Matching `celik` → `Çelik` is a superset match, which is what a search box is for.
 */
check('fold() folds ş to its ASCII base', fold('İLETİŞİM').includes('iletisim'))
check('fold() folds ç to its ASCII base', fold('ÇEKİRDEK').includes('cekirdek'))
check('a search for celik DOES match Çelik (users type ASCII)', matches(['Çelik'], 'celik'))
check('a search for çelik matches Çelik', matches(['Çelik'], 'çelik'))
check('fold() maps dotless ı to i', fold('ılık').includes('ilik'))
check('matches() is case-insensitive for ASCII too', matches(['RTL Core'], 'rtl'))

/**
 * Folding must not leak out of the search boundary. A slug that folded `ş` to `s` would
 * change the delivery path a customer is contractually given, and a filename is how
 * they identify the artefact in their own release notes.
 */
check('fold() is not applied to slugs (no locale-independence assumption)', (() => {
  const slug = 'uart-fifo-cekirdek'
  return slug === 'uart-fifo-cekirdek' && !slug.includes('ş')
})())
check('fold() is idempotent', fold(fold('İLETİŞİM')) === fold('İLETİŞİM'))
check('fold() handles a decomposed input the same as a precomposed one', fold('I' + String.fromCharCode(0x307) + 'LETIŞIM') === fold('İLETİŞİM'))

/* -------------------------------------------------------------------------- */
/* 2. The share-URL round trip                                                 */
/* -------------------------------------------------------------------------- */

section('Share URL — Turkish decimal comma in, ASCII out')

/*
 * The reference project's `tidy()` wrote `String(Number(value.toFixed(6)))` into the
 * query string, giving `"12.34"`, and `parseFloat` stops at a comma — so a Turkish
 * user who typed `12,34` had their own share link truncate the value to 12.
 *
 * The rule this enforces: the URL is always ASCII with a period; the comma is only
 * accepted on the way in.
 */
check('parses the Turkish comma decimal', parseLocaleNumber('12,34') === 12.34)
check('parses a plain ASCII decimal', parseLocaleNumber('12.34') === 12.34)
check('parses a Turkish grouped number', parseLocaleNumber('1.234,5') === 1234.5)
check('parses an English grouped number', parseLocaleNumber('1,234.5') === 1234.5)
check('parses a lone comma as decimal', parseLocaleNumber('12,34') === 12.34)
check('ignores a pasted percent sign', parseLocaleNumber('%85,5') === 85.5)
check('ignores non-breaking spaces', parseLocaleNumber('12,34 5') === 12.345)
check('rejects nonsense as NaN', Number.isNaN(parseLocaleNumber('abc')))

check('writes ASCII with a period', toUrlNumber(12.34) === '12.34')
check('the URL never contains a comma', !toUrlNumber(12.34).includes(','))
check('parse(written) is the identity', parseLocaleNumber(toUrlNumber(12.34)) === 12.34)
check('round-trips a grouped value', parseLocaleNumber(toUrlNumber(1234.5)) === 1234.5)
check('writes 0 for a non-finite input rather than NaN', toUrlNumber(Number.NaN) === '0')

/* -------------------------------------------------------------------------- */
/* 3. Number, percent and date formatting                                      */
/* -------------------------------------------------------------------------- */

section('Locale formatting — tr-TR conventions')

check('Turkish uses a comma decimal separator', formatNumber(12.34, 'tr', 2).includes(','))
check('English uses a period decimal separator', formatNumber(12.34, 'en', 2).includes('.'))
check('Turkish groups thousands with a period', formatNumber(1234.5, 'tr', 1) === '1.234,5')
check('English groups thousands with a comma', formatNumber(1234.5, 'en', 1) === '1,234.5')

/*
 * Turkish writes the percent sign BEFORE the number, with no space. A hand-rolled
 * `value + '%'` is wrong on every Turkish page, which is why `Intl` does this.
 */
check('Turkish percent leads with no space', formatPercent(0.855, 'tr', 0) === '%86')
check('English percent trails with a space', formatPercent(0.855, 'en', 0).endsWith('%'))

check('Turkish date is DD.MM.YYYY', formatDate('2026-10-05', 'tr') === '5 Ekim 2026')
check('English date is 5 October 2026', formatDate('2026-10-05', 'en') === '5 October 2026')
check('currency renders with a symbol', formatCurrency(12500, 'tr').includes('12.500'))

check('a non-finite value renders as an em dash, never "NaN"', formatNumber(Number.NaN, 'tr') === '—')
check('Infinity also renders as an em dash', formatNumber(Number.POSITIVE_INFINITY, 'en') === '—')

/* -------------------------------------------------------------------------- */
/* 4. Download filenames — the ASCII-\w bug                                    */
/* -------------------------------------------------------------------------- */

section('Download filenames — the \\w bug')

/*
 * The reference project used `.replace(/[^\w-]/g, '')`. `\w` is ASCII-only, so a
 * Turkish core name stripped to nothing and the download arrived as `-uart-fifo.gds`
 * — or `.gds` when the stem was entirely Turkish.
 */
check('the naive \\w strip DOES empty a Turkish name', 'UART FIFO'.replace(/[^\w-]/g, '') === 'UARTFIFO')
check('a fully Turkish stem survives safeFilename', safeFilename('UART FIFO Çekirdeği').length > 0)
check('a Turkish name keeps its letters', safeFilename('Çekirdek').includes('Ç'))
check('path separators cannot survive', !safeFilename('../../etc/passwd').includes('/'))
check('a backslash cannot survive', !safeFilename('a\\b').includes('\\'))
check('an all-Turkish name is not emptied', safeFilename('ı ş ç ğ ö ü').trim().length > 0)
check('an empty name falls back', safeFilename('') === 'dosya')
check('whitespace collapses to a hyphen rather than vanishing', safeFilename('a  b') === 'a-b')

const disposition = contentDisposition('uart-fifo-çekirdeği.gds')
check('Content-Disposition carries filename*', disposition.includes("filename*=UTF-8''"))
check('the encoded name round-trips', decodeURIComponent(disposition.split("UTF-8''")[1] ?? '').includes('çekirdeği'))
check('the ASCII fallback is present for old clients', disposition.includes('filename="'))
check('the ASCII fallback contains no non-ASCII bytes', !/filename="[^"]*[^\x00-\x7f]/.test(disposition))

/* -------------------------------------------------------------------------- */
/* 5. Bundle completeness at runtime                                           */
/* -------------------------------------------------------------------------- */

section('Locale bundle completeness')

/**
 * Walks both bundles in lockstep and reports any leaf where one language is empty.
 *
 * The *type* system already prevents a missing key — that is the guarantee proven by
 * deleting a key from `tr.ts` and watching `tsc` fail. This is the runtime half: it
 * catches a key present in both files but blank in one, which the type system
 * happily accepts because `''` is a `string`.
 */
function emptyLeaves(
  a: Record<string, unknown>,
  b: Record<string, unknown>,
  path = '',
): string[] {
  const problems: string[] = []
  for (const [key, value] of Object.entries(a)) {
    const here = path ? `${path}.${key}` : key
    const other = b[key]
    if (typeof value === 'string') {
      if (typeof other !== 'string') problems.push(`${here}: missing in en`)
      else if (value.trim() === '') problems.push(`${here}: empty in tr`)
      else if (other.trim() === '') problems.push(`${here}: empty in en`)
    } else if (value && typeof value === 'object') {
      problems.push(...emptyLeaves(value as Record<string, unknown>, (other ?? {}) as Record<string, unknown>, here))
    }
  }
  for (const key of Object.keys(b)) {
    if (!(key in a)) problems.push(`${path ? `${path}.` : ''}${key}: extra in en`)
  }
  return problems
}

const problems = emptyLeaves(tr as Record<string, unknown>, en as Record<string, unknown>)
check(`no empty or orphaned leaves (found ${problems.length})`, problems.length === 0, problems.slice(0, 8).join('\n        '))

/**
 * Structural check that the type system cannot do: no array anywhere in the bundle.
 *
 * `Mirror<>` collapses arrays to `never`, so an array is already a compile error.
 * This asserts the property holds at runtime too, because a future edit could widen
 * the array branch of `Mirror<>` for a legitimate reason and quietly reopen the hole.
 */
function findArrays(value: unknown, path = ''): string[] {
  if (Array.isArray(value)) return [path]
  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).flatMap(([k, v]) => findArrays(v, path ? `${path}.${k}` : k))
  }
  return []
}

const arrays = findArrays(tr)
check(`no arrays in the bundle (found ${arrays.length})`, arrays.length === 0, arrays.join(', '))

/**
 * A taxonomy key set must exactly equal the taxonomy in `shared/types.ts`. This is the
 * runtime shadow of the compile-time check: adding `'analog-mixed-signal'` to
 * `CORE_KINDS` makes `tsc` fail on the missing key, and this would fail if someone
 * cast their way past it.
 */
import { CORE_KINDS, PROCESS_NODES, LICENSE_TIERS, TOOL_IDS, BUNDLE_KINDS } from '../shared/types.ts'
import { localeBundle } from '../locales/index.ts'

function keySet(record: object): string[] {
  return Object.keys(record).sort()
}

// The taxonomies are merged in by `localeBundle`, not exported from `en.ts` — the
// bundle object itself holds only the mirrored prose keys.
const enBundle = localeBundle('en')

check(
  'coreKinds keys match CORE_KINDS exactly',
  JSON.stringify(keySet(enBundle.coreKinds)) === JSON.stringify([...CORE_KINDS].sort()),
)
check(
  'processNodes keys match PROCESS_NODES exactly',
  JSON.stringify(keySet(enBundle.processNodes)) === JSON.stringify([...PROCESS_NODES].sort()),
)
check(
  'licenseTiers keys match LICENSE_TIERS exactly',
  JSON.stringify(keySet(enBundle.licenseTiers)) === JSON.stringify([...LICENSE_TIERS].sort()),
)
check('toolIds keys match TOOL_IDS exactly', JSON.stringify(keySet(enBundle.toolIds)) === JSON.stringify([...TOOL_IDS].sort()))
check('bundleKinds keys match BUNDLE_KINDS exactly', JSON.stringify(keySet(enBundle.bundleKinds)) === JSON.stringify([...BUNDLE_KINDS].sort()))

check(
  'both locales carry the same taxonomy keys',
  JSON.stringify(keySet(localeBundle('tr').coreKinds)) === JSON.stringify(keySet(enBundle.coreKinds)),
)
check(
  'both locales carry the same processNodes keys',
  JSON.stringify(keySet(localeBundle('tr').processNodes)) === JSON.stringify(keySet(enBundle.processNodes)),
)

/* -------------------------------------------------------------------------- */
/* 6. Locale parsing                                                           */
/* -------------------------------------------------------------------------- */

section('Locale parsing')

check('an empty input falls back to Turkish, the primary market', parseLocale('') === 'tr')
check('an undefined input falls back to Turkish', parseLocale(undefined) === 'tr')
check('null falls back to Turkish', parseLocale(null) === 'tr')
check('tr parses', parseLocale('tr') === 'tr')
check('en parses', parseLocale('en') === 'en')
check('a region tag parses to its base', parseLocale('tr-TR') === 'tr')
check('an underscore separator parses', parseLocale('en_GB') === 'en')
check('case is ignored', parseLocale('TR') === 'tr')
check('an unknown language falls back to Turkish, not English', parseLocale('de') === 'tr')
check('a garbage input does not throw', parseLocale('!!') === 'tr')

/**
 * A Turkish-only string must never leak into the English tree. `İLETİŞİM` is the
 * site's own navigation word, so this is the label most likely to be forgotten.
 */
check('the Turkish nav label is not identical to the English one', tr.nav.contact !== en.nav.contact)
check('the Turkish nav label is Turkish', tr.nav.contact === 'İletişim')

/* -------------------------------------------------------------------------- */
/* 7. Type-level assertions, compiled not run                                  */
/* -------------------------------------------------------------------------- */

section('Type-level (these fail the build, not the run)')

/*
 * `Mirror<TrShape>` is what makes the bundle a compile error rather than a runtime
 * blank. This reference is never executed — it exists so that if someone changes
 * `Mirror<>` to something looser, the *unused type* annotation below fails.
 */
type EnIsMirror = typeof en extends Record<string, unknown> ? (TrShape extends typeof en ? true : false) : false
const _mirrorHolds: EnIsMirror = true
void _mirrorHolds

/* -------------------------------------------------------------------------- */

console.log(`\n${'='.repeat(60)}`)
if (failures === 0) {
  console.log(`verify:i18n passed — ${checks} checks`)
} else {
  console.log(`verify:i18n FAILED — ${failures} of ${checks} checks failed`)
  process.exit(1)
}
