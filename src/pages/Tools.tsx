/**
 * The calculator index — /hesaplayicilar.
 *
 * One card per tool in `content/tools.ts`, in the file's own order. The label
 * comes from the `toolIds` taxonomy map (the compiled-checked one) with the
 * tool's own `title` as the fallback; the summary is the tool's authored `T`.
 *
 * Two things this index says honestly:
 *
 * - **What a tool takes and what it estimates** — the input count and the
 *   declared result fields are shown on the card, so a reader can judge the
 *   model before opening it. The result list is the declaration in
 *   `content/tools.ts`, not the dispatcher's output, so it cannot disagree
 *   with the tool page.
 * - **That every model's assumptions are written down** — the prose note and
 *   the `EngineeringNotice` sit under the grid. The index shows the notice
 *   once as a promise: each tool page repeats it directly above its results,
 *   which is where the notice is load-bearing.
 */

import { LocaleLink, useSite } from '../lib/site.tsx'
import {
  ButtonLink,
  Container,
  EngineeringNotice,
  Eyebrow,
  Heading,
  PageHeader,
  Prose,
  Section,
} from '../components/ui.tsx'
import { tools } from '../../content/tools.ts'

export function Tools() {
  const { strings, t } = useSite()

  const note = {
    tr: 'Her hesaplayıcının varsayımları, geçerlilik aralığı ve sınırları, kendi sayfasında sonuçların üzerinde yazılıdır. Aracı kullanmadan önce o notu okuyun; sonucu değil, önce modeli yargılayın.',
    en: 'Every calculator’s assumptions, validity range and limits are written above its results, on its own page. Read that note before you use the tool — judge the model first, never the result alone.',
  }

  /** The index's one non-calculator entry: an external app, not a tools.ts record. */
  const studioStrip = {
    tr: 'CMOS IC yerleşimi, şema besteci, RTL→GDS, DRC/imza kontrolü, LVS ve SPICE. Bu kartlardaki hesaplayıcı sözleşmesinin dışında, geliştiricisinin kendi sitesinde yaşayan, sayfasında gömülü çalışan bir dış araç.',
    en: 'CMOS IC layout, a schematic composer, the RTL→GDS flow, DRC/sign-off, LVS and SPICE. Outside the calculators’ contract on these cards — an external tool that lives on its developer’s own site and runs embedded in its own page.',
  }

  return (
    <article>
      <Section className="pb-0 pt-14">
        <Container width="narrow">
          <PageHeader
            eyebrow={strings.nav.tools}
            title={strings.tools.title}
            lede={strings.tools.subtitle}
          />
          <Prose className="mt-8">{t(note)}</Prose>
        </Container>
      </Section>

      <Section className="py-14">
        <Container>
          <ul className="grid gap-6 md:grid-cols-2">
            {tools.map((tool) => (
              <li
                key={tool.id}
                className="flex flex-col border border-line bg-paper p-6 transition-colors hover:border-ink"
              >
                <p className="font-mono text-[13px] tracking-wide text-flare">{strings.toolIds[tool.id] ?? t(tool.title)}</p>
                <Heading as="h3" className="mt-2">
                  {t(tool.title)}
                </Heading>
                <Prose className="mt-3">{t(tool.summary)}</Prose>

                {/* What the model takes in, and what it estimates: the two
                    declarations the tool page renders. Kept as declarative
                    label lists — arithmetic belongs on the tool page, not in
                    an index card's summary. */}
                <dl className="mt-5 space-y-2 border-t border-line pt-4 text-[12px] leading-relaxed text-mist">
                  <div className="flex gap-3">
                    <dt className="shrink-0 font-semibold uppercase tracking-[0.16em]">{strings.tools.inputs}</dt>
                    <dd className="font-mono">
                      {tool.inputs.length} — {tool.inputs.slice(0, 2).map((field) => t(field.label)).join(' · ')}…
                    </dd>
                  </div>
                  <div className="flex gap-3">
                    <dt className="shrink-0 font-semibold uppercase tracking-[0.16em]">{strings.tools.results}</dt>
                    <dd className="font-mono">{tool.results.map((result) => t(result.label)).join(' · ')}</dd>
                  </div>
                </dl>

                <div className="mt-6">
                  <ButtonLink to={`/hesaplayicilar/${tool.slug}`} variant="secondary">
                    {strings.tools.openTool}
                  </ButtonLink>
                </div>
              </li>
            ))}
          </ul>

          {/* The one tool here that is not a calculator: an external hosted
              application, linked to its own page on this site rather than a
              dispatcher-backed slug. Deliberately outside the <ul> above — it
              is not part of the tools.ts list this index enumerates. */}
          <div className="mt-6 border border-line bg-paper p-6 md:flex md:items-center md:justify-between md:gap-8">
            <div>
              <p className="font-mono text-[13px] tracking-wide text-flare">{strings.tools.externalTool}</p>
              <Heading as="h3" className="mt-2">
                VLSI Studio
              </Heading>
              <Prose className="mt-3 max-w-prose">{t(studioStrip)}</Prose>
            </div>
            <div className="mt-6 md:mt-0 md:shrink-0">
              <ButtonLink to="/hesaplayicilar/vlsi-studio" variant="secondary">
                {strings.tools.viewStudio}
              </ButtonLink>
            </div>
          </div>
        </Container>
      </Section>

      <Section className="pb-24 pt-0">
        <Container width="narrow">
          <Eyebrow>{strings.basis.legendTitle}</Eyebrow>
          <Prose className="mt-4">{strings.basis.legendBody}</Prose>
          <EngineeringNotice className="mt-6" />
          <p className="mt-6 text-[12px] text-mist">
            <LocaleLink to="/teknoloji" className="font-semibold uppercase tracking-[0.16em] text-mist hover:text-ink">
              {strings.nav.process}
            </LocaleLink>
            {' · '}
            <LocaleLink to="/yazilar" className="font-semibold uppercase tracking-[0.16em] text-mist hover:text-ink">
              {strings.nav.articles}
            </LocaleLink>
          </p>
        </Container>
      </Section>
    </article>
  )
}