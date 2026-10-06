/**
 * One calculator — /hesaplayicilar/:slug, data-driven from `content/tools.ts`.
 *
 * ## State, and the share URL
 *
 * Inputs are held as **raw strings** — what the user typed — and parsed with
 * `parseLocaleNumber` at the boundary, so a Turkish `12,34` is a value, not a
 * truncation. The share URL is the same state written back out the other way:
 * `toUrlNumber` (ASCII, period decimal) into `?<fieldId>=…`, with
 * `replace: true` so every keystroke does not become a history entry. A value
 * that is not currently parseable in range is *dropped* from the URL rather
 * than written through as a NaN, so a share link can never carry a broken
 * input — a link is only ever offered with the state it reproduces.
 *
 * The URL is read once, on mount (lazy state initialisation), and the results
 * run on every render of valid state — there is no submit step to fall behind,
 * which is also why the spec's "on submit, read the params" case can only occur
 * for a URL edited by hand; the reset and a reload cover it.
 *
 * ## Provenance of the outputs
 *
 * Every result is `modelled` (the dispatcher guarantees it), so every value is
 * coloured through the same `fig-*` classes the spec tables use — the basis is
 * mapped to the class from `result.basis`, a mirror of `figureColor`, because
 * `figureColor` needs a `Figure` and a result is not one. Warnings render as
 * prose in the flare tone and never as codes; the engineering notice and the
 * tool's own `caveat` sit **above** the results, where they can be read before
 * a number is.
 */

import { useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import type { Field as FieldSpec, FigureUnit, Tool } from '../../shared/types.ts'
import {
  formatEngineering,
  formatNumber,
  parseLocaleNumber,
  toUrlNumber,
  type Locale,
} from '../../shared/i18n.ts'
import { runEngineering } from '../../shared/engineering.ts'
import { toolForSlug } from '../../content/tools.ts'
import { unitLabel } from '../components/figure.tsx'
import { LocaleLink, useSite } from '../lib/site.tsx'
import {
  Button,
  Container,
  EngineeringNotice,
  Eyebrow,
  Field,
  Input,
  Notice,
  PageHeader,
  Prose,
  Section,
} from '../components/ui.tsx'
import { NotFound } from './NotFound.tsx'

/** The basis class for a result — the same three-way split `figureColor` holds. */
function basisClass(basis: 'measured' | 'modelled' | 'uncharacterised'): string {
  return basis === 'measured' ? 'fig-measured' : basis === 'modelled' ? 'fig-modelled' : 'fig-uncharacterised'
}

/**
 * A result's value with its unit, formatted for the locale. Mirrors the
 * conventions of `figureValue` — three significant digits, except counts,
 * dollars and gate equivalents, and no space before a percent sign —
 * because a result is not a `Figure` and cannot go through that helper.
 */
function resultValue(value: number, unit: FigureUnit, locale: Locale): string {
  const formatted =
    unit === 'count' || unit === 'USD' || unit === 'GE'
      ? formatNumber(value, locale, 0)
      : formatEngineering(value, locale, 3)
  const space = unit === 'percent' ? '' : ' '
  return `${formatted}${space}${unitLabel(unit, locale)}`
}

export function ToolPage() {
  const { slug } = useParams()
  const { locale, strings, t } = useSite()
  const [searchParams, setSearchParams] = useSearchParams()

  const tool: Tool | null = useMemo(() => toolForSlug(slug ?? ''), [slug])

  /** Initial state = the defaults, overridden by any share link's parameters. */
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial = { ...defaultsOf(tool, locale) }
    for (const field of tool?.inputs ?? []) {
      const raw = searchParams.get(field.id)
      if (raw === null) continue
      // A URL carries ASCII decimals; the input shows the locale's own. The
      // reformat keeps the raw value's decimal places, and an unparseable
      // param falls through to the default rather than poisoning the input.
      const parsed = parseLocaleNumber(raw)
      if (Number.isFinite(parsed)) initial[field.id] = displayNumber(raw, locale)
    }
    return initial
  })

  const [copied, setCopied] = useState(false)

  /** Parsed inputs, and whether every one of them is parseable and in range. */
  const inputs = useMemo(() => {
    const map: Record<string, number> = {}
    let valid = true
    for (const field of tool?.inputs ?? []) {
      const parsed = parseLocaleNumber(values[field.id] ?? '')
      const inRange = Number.isFinite(parsed) && parsed >= field.min && parsed <= field.max
      if (!inRange) valid = false
      map[field.id] = inRange ? parsed : field.default
    }
    return { map, valid }
  }, [tool, values])

  const results = useMemo(
    () => (tool && inputs.valid ? runEngineering(tool.id, inputs.map) : []),
    [tool, inputs],
  )

  /** One edit: update the string state and keep the share URL in step. */
  const setField = (field: FieldSpec, raw: string) => {
    setValues((previous) => ({ ...previous, [field.id]: raw }))
    const next = new URLSearchParams(searchParams)
    const parsed = parseLocaleNumber(raw)
    if (Number.isFinite(parsed) && parsed >= field.min && parsed <= field.max) {
      next.set(field.id, toUrlNumber(parsed))
    } else {
      // An out-of-range or half-typed value is not something a share link can
      // reproduce, so it leaves the URL instead of being written as garbage.
      next.delete(field.id)
    }
    setSearchParams(next, { replace: true })
  }

  const reset = () => {
    if (!tool) return
    setValues(defaultsOf(tool, locale))
    setSearchParams(new URLSearchParams(), { replace: true })
  }

  const share = () => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        setCopied(true)
        window.setTimeout(() => setCopied(false), 3_000)
      })
      .catch(() => {
        // Clipboard permission denied: the URL bar is the fallback, and no
        // false "copied" confirmation is rendered.
        setCopied(false)
      })
  }

  if (!tool) return <NotFound />

  const rangeHint = {
    tr: 'Geçerli aralık',
    en: 'Valid range',
  }

  return (
    <article>
      <Section className="pb-0 pt-14">
        <Container width="narrow">
          <LocaleLink
            to="/hesaplayicilar"
            className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mist hover:text-ink"
          >
            ← {strings.tools.title}
          </LocaleLink>
          <PageHeader
            className="mt-8"
            eyebrow={strings.toolIds[tool.id] ?? undefined}
            title={t(tool.title)}
            lede={t(tool.summary)}
          />
        </Container>
      </Section>

      <Section className="py-14">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[26rem,1fr]">
            {/* --------------------------------------------------- inputs */}
            <div>
              <Eyebrow>{strings.tools.inputs}</Eyebrow>
              <div className="mt-6 space-y-6">
                {tool.inputs.map((field) => (
                  <Field
                    key={field.id}
                    label={`${t(field.label)} (${unitLabel(field.unit, locale)})`}
                    hint={`${t(rangeHint)}: ${formatNumber(field.min, locale)} – ${formatNumber(field.max, locale)}${
                      field.help ? `\n${t(field.help)}` : ''
                    }`}
                  >
                    <Input
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      // Inputs are pre-filled with the tool's defaults, in
                      // the visitor's own number format, so results render
                      // before the first keystroke — a share link, typed
                      // value or reload replaces them transparently.
                      value={values[field.id] ?? ''}
                      placeholder={defaultString(field, locale)}
                      onChange={(event) => setField(field, event.target.value)}
                    />
                  </Field>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <Button variant="secondary" onClick={share}>
                  {strings.tools.shareLink}
                </Button>
                <Button variant="danger" onClick={reset}>
                  {strings.tools.reset}
                </Button>
              </div>
              {copied ? (
                <Notice tone="success" className="mt-4">
                  {strings.tools.shareCopied}
                </Notice>
              ) : null}
            </div>

            {/* -------------------------------------------------- results */}
            <div>
              <EngineeringNotice />
              <Notice className="mt-6">{t(tool.caveat)}</Notice>

              <Eyebrow className="mt-10">{strings.tools.results}</Eyebrow>

              {!inputs.valid ? (
                <div className="mt-4">
                  <Notice tone="error">{strings.tools.invalidInput}</Notice>
                </div>
              ) : (
                <ul className="divide-y divide-line border-y border-line">
                  {results.map((result) => (
                    <li key={result.id} className="py-5">
                      <div className="flex flex-wrap items-baseline justify-between gap-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-mist">
                          {t(result.label)}
                        </p>
                        <p className={`font-mono text-[22px] tabular ${basisClass(result.basis)}`}>
                          {resultValue(result.value, result.unit, locale)}
                        </p>
                      </div>
                      {result.interpretation ? (
                        <Prose className="mt-2 text-[13px] leading-relaxed">{t(result.interpretation)}</Prose>
                      ) : null}
                      {result.warning ? (
                        <div className="mt-3">
                          <Notice tone="error">{t(result.warning)}</Notice>
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </Container>
      </Section>
    </article>
  )
}

/** The tool's defaults as printable strings. Shared by the initial state and reset. */
function defaultsOf(tool: Tool | null, locale: Locale): Record<string, string> {
  const map: Record<string, string> = {}
  for (const field of tool?.inputs ?? []) map[field.id] = defaultString(field, locale)
  return map
}

/**
 * Share-URL ASCII (`0.5`, `1.2345`) turned into what a Turkish form shows
 * (`0,5`) and back — a pure decimal-separator swap. Grouping must NOT be
 * applied: `2.000` re-parses as two, while bare digits with the right
 * separator survive `parseLocaleNumber` in every case it is written for.
 */
function displayNumber(ascii: string, locale: Locale): string {
  return locale === 'tr' ? ascii.replace(/\./g, ',') : ascii
}

/** A default, shown in the visitor's number format. */
function defaultString(field: FieldSpec, locale: Locale): string {
  return displayNumber(toUrlNumber(field.default), locale)
}