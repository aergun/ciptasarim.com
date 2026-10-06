/**
 * The notes index — /yazilar.
 *
 * A list, in `content/articles.ts` order (newest first in the content file).
 * One card per note: standfirst, date through `formatDate` (locale calendar),
 * reading time, and the authored tags as `Tag`s. The slug is never translated
 * — the link is `/yazilar/<slug>` for both locales — and is built with
 * `LocaleLink` so the current locale carries into the article route.
 */

import { LocaleLink, useSite } from '../lib/site.tsx'
import {
  Container,
  Heading,
  PageHeader,
  Prose,
  Section,
  Tag,
} from '../components/ui.tsx'
import { articles } from '../../content/articles.ts'
import { formatDate } from '../../shared/i18n.ts'

export function Articles() {
  const { locale, strings, t } = useSite()

  return (
    <article>
      <Section className="pb-0 pt-14">
        <Container width="narrow">
          <PageHeader
            eyebrow={strings.nav.articles}
            title={strings.articles.title}
            lede={strings.articles.subtitle}
          />
        </Container>
      </Section>

      <Section className="py-14">
        <Container width="narrow">
          <ul className="divide-y divide-line border-y border-line">
            {articles.map((note) => (
              <li key={note.slug}>
                <LocaleLink
                  to={`/yazilar/${note.slug}`}
                  className="group block py-8 transition-colors"
                >
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <p className="font-mono text-[11px] text-mist">
                      {formatDate(note.date, locale)}
                    </p>
                    <p className="font-mono text-[11px] text-mist">
                      {note.readingMinutes} {strings.articles.readTime}
                    </p>
                  </div>
                  <Heading as="h3" className="mt-2 group-hover:text-flare">
                    {t(note.title)}
                  </Heading>
                  <Prose className="mt-3">{t(note.standfirst)}</Prose>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {note.tags.map((tag) => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                  </div>
                </LocaleLink>
              </li>
            ))}
          </ul>
        </Container>
      </Section>
    </article>
  )
}