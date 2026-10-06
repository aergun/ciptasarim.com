/**
 * The FAQ — /sss.
 *
 * The list in `content/faqs.ts` grouped by filter chips. The chips are the
 * category taxonomy, labelled through `faq.categoryNames` in the locale
 * bundles (a Record over the category union, so a category added to
 * `content/faqs.ts` becomes a missing-label compile error). `all` renders the
 * whole list unchanged — no reordering, no deduplication, no "top questions"
 * invented by the page.
 *
 * Each entry is a native `details`/`summary` accordion — no JS state, no
 * closed-by-default content a reader with no JavaScript cannot reach. The
 * answer is a `T`, rendered through `t()` like every other string.
 */

import { useState } from 'react'
import { faqs, faqCategories, faqsByCategory } from '../../content/faqs.ts'
import { useSite } from '../lib/site.tsx'
import {
  ButtonLink,
  Container,
  Heading,
  PageHeader,
  Prose,
  Section,
} from '../components/ui.tsx'

export function Faq() {
  const { strings, t } = useSite()
  const faqStrings = strings.faq

  /** `'all'` is the unfiltered list; anything else is a category id. */
  const [selected, setSelected] = useState<'all' | (typeof faqCategories)[number]>('all')

  const shown = selected === 'all' ? faqs : faqsByCategory(selected)

  const chipClass = (active: boolean) =>
    `rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors ${
      active ? 'border-ink bg-ink text-paper' : 'border-line text-mist hover:border-ink'
    }`

  return (
    <article>
      <Section className="pb-0 pt-14">
        <Container width="narrow">
          <PageHeader eyebrow={strings.nav.faq} title={faqStrings.title} lede={faqStrings.subtitle} />
        </Container>
      </Section>

      <Section className="py-14">
        <Container width="narrow">
          <div className="flex flex-wrap gap-3" role="group" aria-label={strings.common.filters}>
            <button type="button" className={chipClass(selected === 'all')} onClick={() => setSelected('all')}>
              {strings.common.all}
            </button>
            {faqCategories.map((category) => (
              <button
                key={category}
                type="button"
                className={chipClass(selected === category)}
                onClick={() => setSelected(category)}
                aria-pressed={selected === category}
              >
                {faqStrings.categoryNames[category]}
              </button>
            ))}
          </div>

          <div className="mt-10 divide-y divide-line border-y border-line">
            {shown.map((entry) => (
              <details key={entry.question.tr} className="group py-5">
                <summary className="cursor-pointer list-none text-[15px] font-medium text-ink marker:hidden">
                  {t(entry.question)}
                </summary>
                <Prose className="mt-3">{t(entry.answer)}</Prose>
              </details>
            ))}
          </div>

          <div className="mt-14 border border-line bg-stage px-8 py-10 text-center">
            <Heading as="h3">{faqStrings.stillHaveQuestions}</Heading>
            <div className="mt-6 flex justify-center">
              <ButtonLink to="/iletisim">{faqStrings.contactUs}</ButtonLink>
            </div>
          </div>
        </Container>
      </Section>
    </article>
  )
}