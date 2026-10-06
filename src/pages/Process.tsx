/**
 * The process-node table — /teknoloji.
 *
 * Fourteen rows (the whole `PROCESS_NODES` taxonomy), seven columns: the six
 * figure fields of `Process` and the provenance column. Every cell is a
 * `Figure` and is rendered **only** through the helpers in
 * `src/components/figure.tsx` — a characterised cell would show value, colour
 * class and badge; an uncharacterised one shows `FigureGap`, which renders its
 * reason, never a dash, a zero or a blank. Today every cell is
 * uncharacterised, so the table is a page of reasons, and that is the honest
 * state of the catalogue rather than a rendering bug.
 *
 * The `source` column is the row's claim to provenance: a string when a cell
 * has been confirmed, and `strings.basis.noSource` — "no source", stated —
 * when it has not. A `null` source is rendered as that statement, not hidden.
 */

import { LocaleLink, useSite } from '../lib/site.tsx'
import {
  BASIS_FIGURES,
  FigureBadge,
  FigureGap,
  figureColor,
  figureValue,
} from '../components/figure.tsx'
import { Container, Heading, PageHeader, Prose, Section } from '../components/ui.tsx'
import type { Process } from '../../shared/types.ts'
import { characterisedNodes, processes } from '../../content/processes.ts'

/** The six figure columns, in the order the table displays them. */
const COLUMNS = [
  'cellArea',
  'defectDensity',
  'metalLayers',
  'vdd',
  'leakage',
  'bondPitch',
] as const satisfies readonly (keyof Process)[]

export function ProcessPage() {
  const { t, locale, strings } = useSite()

  /** Currently empty — the honest statement, rendered under the header. */
  const characterised = characterisedNodes()
  const noneYet = {
    tr: 'Bu tabloda henüz karakterize edilmiş tek bir hücre yok. Buradaki değerler, dökümhanenin PDK revizyonuna özgüdür; bir hücre ancak kaynağı doğrulandığında burada bir sayı olarak görünür. Karakterize edilmemiş her hücre, nedeni yazılı olarak listelenir — hiçbiri bir tahminle doldurulmamıştır.',
    en: 'Not one cell in this table is characterised yet. These figures belong to a foundry’s own PDK revision, so a cell becomes a number here only when its source has been confirmed. Until then every uncharacterised cell is listed with its reason — none is filled in with an estimate.',
  }
  const countsLabel = {
    tr: 'Karakterize edilmiş düğüm sayısı',
    en: 'Characterised nodes',
  }

  return (
    <article>
      <Section className="pb-0 pt-14">
        <Container width="narrow">
          <PageHeader
            eyebrow={strings.nav.process}
            title={strings.home.processTitle}
            lede={strings.home.processBody}
          />
          <Prose className="mt-8">{t(noneYet)}</Prose>
          <p className="mt-6 text-[13px] text-mist">
            {t(countsLabel)}:{' '}
            <span className="font-mono">
              {characterised.length === 0 ? '0' : characterised.map((node) => strings.processNodes[node]).join(', ')}
            </span>
          </p>
          <p className="mt-4">
            <LocaleLink
              to="/hesaplayicilar"
              className="text-[11px] font-semibold uppercase tracking-[0.16em] text-flare hover:underline"
            >
              {strings.tools.title} →
            </LocaleLink>
          </p>
        </Container>
      </Section>

      <Section className="py-14">
        <Container width="wide">
          <Heading as="h3" className="mb-6">
            {strings.home.processTitle}
          </Heading>

          {/* The reasons are prose, so the table is wide and stays scrollable
              rather than being squeezed into unreadability. overflow-x wrapper. */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[72rem] border-y border-line text-left align-top">
              <thead>
                <tr className="border-b border-line text-[10px] uppercase tracking-[0.2em] text-mist">
                  <th scope="col" className="sticky left-0 bg-paper py-3 pr-4 font-semibold">
                    {strings.cores.node}
                  </th>
                  {COLUMNS.map((column) => (
                    <th key={column} scope="col" className="py-3 pr-4 font-semibold">
                      {strings.processColumns[column]}
                    </th>
                  ))}
                  <th scope="col" className="py-3 pr-4 font-semibold">
                    {strings.basis.source}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {processes.map((row) => (
                  <tr key={row.node} className="align-top">
                    <th
                      scope="row"
                      className="sticky left-0 bg-paper py-4 pr-4 font-mono text-[13px] font-semibold text-ink"
                    >
                      {strings.processNodes[row.node] ?? row.node}
                    </th>
                    {COLUMNS.map((column) => {
                      const figure = row[column]
                      return (
                        <td key={column} className="py-4 pr-4">
                          {figure.basis === 'uncharacterised' ? (
                            <div className="max-w-[22rem]">
                              <div className="mb-2">
                                <FigureBadge figure={figure} />
                              </div>
                              <FigureGap figure={figure} />
                            </div>
                          ) : (
                            <div>
                              <p className={`font-mono text-[13px] tabular ${figureColor(figure)}`}>
                                {figureValue(figure, locale)}
                              </p>
                              <div className="mt-1">
                                <FigureBadge figure={figure} />
                              </div>
                            </div>
                          )}
                        </td>
                      )
                    })}
                    <td className="py-4 pr-4 text-[12px] text-mist">
                      {row.source !== null ? (
                        <span className="font-mono">{row.source}</span>
                      ) : (
                        <span className="font-mono not-italic">{strings.basis.noSource}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ProvenanceLegend />
        </Container>
      </Section>
    </article>
  )
}

/** The legend under the table: the three bases with their badges, stated once. */
function ProvenanceLegend() {
  const { strings } = useSite()
  return (
    <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line pt-4">
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-mist">
        {strings.basis.legendTitle}
      </span>
      <FigureBadge figure={BASIS_FIGURES.measured} />
      <span className="text-[12px] text-mist">{strings.basis.measuredLong}</span>
      <FigureBadge figure={BASIS_FIGURES.modelled} />
      <span className="text-[12px] text-mist">{strings.basis.modelledLong}</span>
      <FigureBadge figure={BASIS_FIGURES.uncharacterised} />
      <span className="text-[12px] text-mist">{strings.basis.uncharacterisedLong}</span>
    </div>
  )
}