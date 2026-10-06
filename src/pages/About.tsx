/**
 * About — /hakkimizda.
 *
 * The method page, not a marketing page. Everything on it is a claim about how
 * this site handles evidence, and every claim comes from `strings.about.*` —
 * there is no team history, no founding story, no "our mission" prose, and no
 * photographs, because none of that can be checked and the page's whole
 * argument is that unverifiable statements do not belong on this site.
 *
 * The `noFabrication` paragraph sits in the inverted section. It is the page's
 * strongest statement — a promise that an unmeasured value is never invented —
 * and the dark section exists to make it the page's visual centre, the same way
 * the home page's provenance statement breaks up its light sections.
 */

import { useSite } from '../lib/site.tsx'
import {
  Container,
  Heading,
  InvertedSection,
  PageHeader,
  Prose,
  Section,
} from '../components/ui.tsx'

export function About() {
  const { strings } = useSite()
  const about = strings.about

  return (
    <article>
      <Section className="pb-0 pt-14">
        <Container width="narrow">
          <PageHeader
            eyebrow={strings.nav.about}
            title={about.title}
            lede={about.subtitle}
          />
        </Container>
      </Section>

      {/*
       * The no-fabrication promise, on the dark. The heading is the home
       * page's provenance line — the shared statement, not prose written for
       * this page — and the body from the bundle, verbatim.
       */}
      <InvertedSection className="mt-14">
        <Container width="narrow">
          <Heading as="h2">{strings.home.provenanceTitle}</Heading>
          <Prose className="mt-4">
            {about.noFabrication}
          </Prose>
        </Container>
      </InvertedSection>

      <Section>
        <Container width="narrow">
          <div className="space-y-14">
            <section>
              <Heading as="h2">{about.methodTitle}</Heading>
              <Prose className="mt-4">{about.methodBody}</Prose>
            </section>

            <section>
              <Heading as="h2">{about.calibrationTitle}</Heading>
              <Prose className="mt-4">{about.calibrationBody}</Prose>
            </section>

            <section>
              <Heading as="h2">{about.trustTitle}</Heading>
              <Prose className="mt-4">{about.trustBody}</Prose>
            </section>
          </div>
        </Container>
      </Section>
    </article>
  )
}