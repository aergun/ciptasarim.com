/**
 * Locale plumbing.
 *
 * The site is Turkish-first with English secondary, which is the opposite of the
 * reference project's single-locale English and the largest genuinely new surface in
 * this port. There is no precedent there to copy, only conventions to break.
 *
 * Two layers, split by one test: **does this string fit in a nav bar or a filter
 * chip?**
 *
 * - **Short repeated labels** live in `locales/tr.ts` and `locales/en.ts` as a mirror
 *   pair typed `Mirror<>`. Turkish is the source of truth, so a missing English
 *   string is a compile error rather than a runtime blank.
 * - **Long prose** lives inline in `content/*.ts` as `T = { tr, en }`, whose type
 *   requires both fields. See `shared/types.ts`.
 *
 * The split is not cosmetic. A field typed `string` cannot receive `{tr, en}` and
 * vice versa, so the compiler decides which layer a given string belongs to, and
 * neither layer can be left half-filled.
 */

import type { T } from './types.ts'

export const LOCALES = ['tr', 'en'] as const
export type Locale = (typeof LOCALES)[number]

/** The primary market. An unrecognised locale falls back here, not to English. */
export const DEFAULT_LOCALE: Locale = 'tr'

/** BCP 47 tags, for `Intl` and for `<html lang>`. */
export const LOCALE_TAGS: Record<Locale, string> = {
  tr: 'tr-TR',
  en: 'en-GB',
}

/* -------------------------------------------------------------------------- */
/* Mirror type                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Recursively mirrors an object shape.
 *
 * Both directions are errors, which is the point:
 *
 * - a key in `tr` with no counterpart in `en` — the object literal is not assignable
 * - a key in `en` with no counterpart in `tr` — excess property, also an error
 *
 * **Arrays are collapsed to `never` deliberately.** A `Mirror` over an array cannot
 * be element-wise, so an array in the locale bundle would be a completeness hole
 * sized to however long the array happened to be at the moment it was written. Any
 * set in the bundle whose *membership* matters must therefore be an object — a
 * `Record<Union, string>` keyed by the taxonomy — where a missing member is a missing
 * key and therefore a compile error. `CORE_KINDS` and friends are the reason this is
 * workable: the key set is generated from a type, not written out by hand.
 *
 * Arrays are still allowed at the leaf as a *value* only if the leaf is not an array
 * of translatable strings. Nothing in the bundle has one today, and the `never` is
 * what will say so if someone adds one.
 */
export type Mirror<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T extends readonly unknown[]
        ? never
        : T extends object
          ? { [K in keyof T]: Mirror<T[K]> }
          : T

/* -------------------------------------------------------------------------- */
/* Resolution                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Picks one language out of a `T`.
 *
 * Falls back to Turkish rather than to the caller's locale. A missing English string
 * is a build failure, not a runtime condition, so this fallback exists only for
 * hand-written literals that slipped past the type — and if it ever fires in
 * production the Turkish text is the correct thing to show a reader rather than an
 * empty element.
 */
export function pick(text: T, locale: Locale): string {
  return text[locale] || text.tr
}

/**
 * Maps a record of `T` into a single-language record, for structured fields like
 * `alt`.
 *
 * The type parameters are named `V` and `R` rather than the obvious `T` and `R`: a
 * `T` here shadows the imported prose type `T`, and since the two are unrelated the
 * result is a constraint that quietly means something else. It compiled as a
 * mismatch between two different `T`s, which is at least loud, but the naming is the
 * fix rather than the error being worked around.
 */
export function pickAll<V extends T, R extends Record<string, V>>(
  texts: R,
  locale: Locale,
): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [key, value] of Object.entries(texts)) out[key] = pick(value, locale)
  return out
}

/** Parses a locale from a URL segment or an `Accept-Language` header. */
export function parseLocale(input: string | undefined | null): Locale {
  if (!input) return DEFAULT_LOCALE
  const base = input.trim().toLowerCase().split(/[-_]/)[0] ?? ''
  return (LOCALES as readonly string[]).includes(base) ? (base as Locale) : DEFAULT_LOCALE
}

/* -------------------------------------------------------------------------- */
/* Number formatting — four defects fixed here, not inherited                 */
/* -------------------------------------------------------------------------- */

/**
 * Formats a number for display in a locale.
 *
 * The reference project returned `value.toFixed(2)`, which yields `"12.34"` — a
 * period decimal separator, hardcoded, on every page. Under `tr-TR` that is wrong:
 * Turkish writes `12,34`, groups thousands with a period, and puts the percent sign
 * *before* the number with no space. In a spec table full of numbers, getting this
 * wrong is not cosmetic — it reads as a different magnitude at a glance.
 *
 * `Intl.NumberFormat` handles all of it, and handles `tr-TR`'s dotless-i correctly,
 * which a hand-rolled formatter does not.
 */
export function formatNumber(value: number, locale: Locale, digits = 2): string {
  if (!Number.isFinite(value)) return '—'
  return new Intl.NumberFormat(LOCALE_TAGS[locale], {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value)
}

/** Compact engineering notation — `1.2 GHz`, `340 mW`. Significant-figure aware. */
export function formatEngineering(value: number, locale: Locale, significant = 3): string {
  if (!Number.isFinite(value)) return '—'
  if (value === 0) return formatNumber(0, locale, 0)
  const magnitude = Math.floor(Math.log10(Math.abs(value)))
  const digits = Math.max(0, Math.min(6, significant - 1 - magnitude))
  return new Intl.NumberFormat(LOCALE_TAGS[locale], {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  }).format(value)
}

/** Percent, locale-correct. The sign position is the whole reason this exists. */
export function formatPercent(fraction: number, locale: Locale, digits = 1): string {
  if (!Number.isFinite(fraction)) return '—'
  return new Intl.NumberFormat(LOCALE_TAGS[locale], {
    style: 'percent',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(fraction)
}

/** A date. `DD.MM.YYYY` in Turkish, with lowercase month names. */
export function formatDate(iso: string, locale: Locale): string {
  const date = new Date(`${iso}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat(LOCALE_TAGS[locale], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

/** Currency. USD is the only currency on the site; a TRY total is a tax question. */
export function formatCurrency(usd: number, locale: Locale): string {
  return new Intl.NumberFormat(LOCALE_TAGS[locale], {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(usd)
}

/* -------------------------------------------------------------------------- */
/* Number parsing at the input boundary                                       */
/* -------------------------------------------------------------------------- */

/**
 * Parses a number a *Turkish* user typed, and writes an ASCII one into a share URL.
 *
 * The asymmetry here is the whole fix. The reference project's `tidy()` wrote
 * `String(Number(value.toFixed(6)))` into the query string, producing `"12.34"` — and
 * `parseFloat` stops at the comma, so a user who typed `12,34` into the calculator had
 * their value silently truncated to `12` when they opened their own share link.
 *
 * **That breaks for precisely the audience this locale exists to serve.** The rule
 * this module enforces: the URL is always ASCII with a period decimal, and the comma
 * is only ever accepted on the way *in*, at the input boundary, never on the way out.
 */
export function parseLocaleNumber(input: string): number {
  if (typeof input !== 'string') return Number.NaN
  // A Turkish user types "12,34". A grouped "1.234,5" is 1234.5, not 1.2345.
  let text = input.trim().replace(/\s/g, '').replace(/ /g, '')
  const lastComma = text.lastIndexOf(',')
  const lastDot = text.lastIndexOf('.')
  if (lastComma > -1) {
    if (lastDot > -1) {
      // Both present: whichever comes last is the decimal separator.
      text =
        lastComma > lastDot
          ? text.replace(/\./g, '').replace(',', '.')
          : text.replace(/,/g, '')
    } else {
      // Only a comma. "1,234" is ambiguous — Turkish thousands separator or a
      // decimal? Default to decimal, because that is what a user typing into a
      // calculator means, and grouping is display-only.
      text = text.replace(',', '.')
    }
  }
  // Strip a percent sign or unit suffix a user may have pasted in.
  text = text.replace(/[%\s]/g, '')
  const value = Number(text)
  return Number.isFinite(value) ? value : Number.NaN
}

/** The inverse: the canonical ASCII form written into a share URL. */
export function toUrlNumber(value: number): string {
  if (!Number.isFinite(value)) return '0'
  return String(Number(value.toFixed(6)))
}

/* -------------------------------------------------------------------------- */
/* Search folding — a verified bug, fixed here                                */
/* -------------------------------------------------------------------------- */

/**
 * Case-tolerant matching for the search box, correct in Turkish.
 *
 * The bug this exists for, verified on Node 22:
 *
 * ```
 * 'İ'.toLowerCase()          → "i̇"   (U+0069 U+0307)
 * 'İ'.toLowerCase('tr')      → "i̇"   ← passing the locale does NOT fix it
 * 'İLETİŞİM'.toLowerCase().includes('iletisim') → false
 * ```
 *
 * U+0130 LATIN CAPITAL LETTER I WITH DOT ABOVE lowercases to `i` plus U+0307 COMBINING
 * DOT ABOVE, and the Turkish locale argument does not suppress the mark. So a search
 * for `iletisim` missed `İLETİŞİM` — a word on the site's own navigation.
 *
 * ### Folding the whole diacritic set, not just the dotted capital
 *
 * The first implementation folded only `İ` and deliberately left `ş` intact, on the
 * reasoning that `ş` and `s` are different letters in Turkish and collapsing them would
 * be lossy. **`verify:i18n` caught it**, and the reasoning was wrong in a specific way:
 * it optimised for a property search does not have.
 *
 * That version made `fold('İLETİŞİM')` equal `'iletişim'`, which cannot contain
 * `'iletisim'` — so preserving `ş` and matching an ASCII-typed query are mutually
 * exclusive, and it satisfied only one of the two.
 *
 * The right behaviour for a search box is the opposite of what that reasoning assumed.
 * Turkish users type `iletisim` and `celik` constantly: on phones, on keyboards
 * without `ş`, out of habit, in URLs. A search that only matches the exact diacritic a
 * user failed to type is broken for the audience this locale exists to serve. Matching
 * `celik` → `Çelik` is a *superset* match, which is precisely what a search box is for
 * — the cost is one extra result, not a wrong one.
 *
 * So all of `ş ç ğ ö ü İ` fold to their ASCII base. `ş` and `ç` need no lookup table
 * for this: both are canonically decomposed in Unicode, so `NFD` has already split them
 * into `s`/`c` plus a combining mark and the mark-strip removes it. Verified on
 * Node 22: `'ş'.normalize('NFD').length === 2`.
 *
 * `ı` (U+0131) is the one case NFD cannot reach — it is a distinct letter, not a
 * diacritic on another, so it survives decomposition untouched. It is mapped
 * explicitly, which *is* lossy in general (it merges with `i`) but is correct in
 * Turkish, where they are the same letter.
 *
 * This function is used **only** at the search boundary. Display text, slugs and
 * filenames never pass through `fold()` — a slug that folds `ş` to `s` would change
 * the delivery path a customer is contractually given.
 *
 * Verified on Node 22: `fold('İLETİŞİM').includes(fold('iletisim'))` is `true`, and
 * `matches(['Çelik'], 'celik')` is `true`.
 */
export function fold(input: string): string {
  return (
    input
      // Decompose, then strip every combining mark. This folds the whole Turkish
      // diacritic set — ş/ç/ğ/ö/ü and the dotted capital İ — to its ASCII base.
      //
      // Stripping every combining mark rather than mapping a hand-picked list of
      // characters is deliberate. ş is U+015F LATIN SMALL LETTER S WITH CEDILLA and it
      // has a CANONICAL DECOMPOSITION to s + U+0327 COMBINING CEDILLA, so it is already
      // decomposed after NFD and the mark-strip reaches it with no table at all.
      // Verified on Node 22: 'ş'.normalize('NFD').length === 2.
      .normalize('NFD')
      .replace(/\p{M}/gu, '')
      .toLowerCase()
      // ı (U+0131) is the one case the decomposition cannot reach: it is a distinct
      // letter, not a diacritic on another one, so NFD leaves it intact and
      // toLowerCase has nothing to fold. In Turkish orthography it is the same
      // letter as i, so mapping it here is correct rather than lossy.
      .replace(/ı/g, 'i')
  )
}

/** Substring search over a set of already-localised strings. */
export function matches(haystack: readonly string[], needle: string): boolean {
  const query = fold(needle.trim())
  if (!query) return true
  return haystack.some((text) => fold(text).includes(query))
}

/* -------------------------------------------------------------------------- */
/* Filenames                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Makes a download filename safe to put in a `Content-Disposition` header, without
 * emptying it.
 *
 * The reference project used `.replace(/[^\w-]/g, '')`. **`\w` is ASCII-only**, so a
 * Turkish core name strips to nothing and the download arrives as `-uart-fifo.gds` —
 * or, if the stem is entirely Turkish, as `.gds`. That is not a cosmetic filename: the
 * name is how a customer identifies the artefact in their own release notes.
 *
 * Unicode letters and digits are kept. Only path separators, control characters and
 * the characters that would break a header are removed, and whitespace collapses to a
 * hyphen rather than vanishing.
 */
export function safeFilename(name: string, fallback = 'dosya'): string {
  const cleaned = name
    // eslint-disable-next-line no-control-regex
    .replace(/[ -]/g, '')
    .replace(/[/\\?%*:|"<>]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^[.-]+|[.-]+$/g, '')
    .trim()
  return cleaned || fallback
}

/**
 * RFC 5987 `filename*`, which is how a non-ASCII filename reaches a browser intact.
 *
 * Matters more here than in the reference project, not less: most filenames on this
 * site contain Turkish characters, so the ASCII `filename=` fallback is a mangled
 * duplicate rather than a working alternative. Percent-encoding is UTF-8 and the
 * apostrophes are escaped, or the header is malformed.
 */
export function contentDisposition(filename: string): string {
  const ascii = safeFilename(filename).replace(/[^\x20-\x7e]/g, '_')
  const encoded = encodeURIComponent(safeFilename(filename))
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encoded.replace(/['()]/g, escape)}`
}
