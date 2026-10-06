/*
 * The 404. One component by necessity rather than design: an unknown route and
 * an unknown slug both land here (`CoreDetail` and `ArticlePage` render it
 * directly for a miss), and every one of those cases is the same two facts —
 * the page does not exist, and the ways back are the catalogue and home.
 */

import { LocaleLink, useSite } from '../lib/site.tsx'
import { ButtonLink, Container, Heading, Prose } from '../components/ui.tsx'

export function NotFound() {
  const { strings } = useSite()
  return (
    <Container className="py-32 text-center">
      <p className="eyebrow">404</p>
      <Heading as="h1" className="mt-4 inline-block">
        {strings.errors.notFound}
      </Heading>
      <Prose className="mx-auto mt-6 text-center">{strings.errors.notFoundBody}</Prose>
      <div className="mt-10 flex justify-center gap-4">
        <ButtonLink to="/">{strings.errors.goHome}</ButtonLink>
        <ButtonLink to="/cekirdekler" variant="secondary">
          {strings.nav.cores}
        </ButtonLink>
      </div>
      <LocaleLink to="/sss" className="sr-only">
        {strings.nav.faq}
      </LocaleLink>
    </Container>
  )
}