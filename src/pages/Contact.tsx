/**
 * Contact — /iletisim, and the quote route /teklif reuses it with
 * `quote` set (the request type opens on *quote* and the lede is the pricing
 * intro rather than the generic one).
 *
 * The POST goes to `api.post('/enquiries', …)`, which the server route defines
 * as: name, email and message required, company optional, and a `website`
 * honeypot checked before anything else — an over-filled form is answered 201
 * with a plausible reference and dropped, silently, server side. This form
 * therefore always sends `website`, as an invisible field a keyboard user can
 * still reach past, and renders success from the reference the server returned.
 *
 * Error mapping keeps each message next to its cause: a 429 is the bundle's
 * rate-limit text, a server-side email-format rejection goes under the email
 * field, and everything else — including a missing name or message, which the
 * server names in its error body rather than its fields map — is the
 * `requiredFields` notice above the form. Nothing is invented client side.
 */

import { useState } from 'react'
import type { FormEvent } from 'react'
import { api, ApiError } from '../lib/api.ts'
import { useSite } from '../lib/site.tsx'
import {
  Button,
  Container,
  Field,
  Heading,
  Input,
  Notice,
  PageHeader,
  Prose,
  Section,
  Select,
  Textarea,
} from '../components/ui.tsx'
import { site } from '../../content/site.ts'

/** The request types, with the ids the `requestTypes` labels are keyed by. */
const REQUEST_TYPES = ['quote', 'licence', 'technical', 'custom', 'other'] as const
type RequestType = (typeof REQUEST_TYPES)[number]

type EnquiryResponse = { ok: boolean; reference: string }

export function Contact({ quote = false }: { quote?: boolean }) {
  const { strings } = useSite()
  const contact = strings.contact
  const common = strings.common

  const [requestType, setRequestType] = useState<RequestType>(quote ? 'quote' : 'other')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [message, setMessage] = useState('')
  /** The honeypot: rendered invisible and empty, typed into only by a bot. */
  const [honeypot, setHoneypot] = useState('')
  const [sending, setSending] = useState(false)
  const [reference, setReference] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSending(true)
    setFormError(null)
    setEmailError(null)

    try {
      /*
       * The type is sent as the message's first line, so the enquiry stays one
       * free-text field server side — the form's taxonomy never becomes a column.
       */
      const response = await api.post<EnquiryResponse>('/enquiries', {
        name,
        email,
        company,
        message: `[${requestType}]\n${message}`,
        website: honeypot,
      })
      setReference(response.reference)
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 429) {
          setFormError(contact.rateLimited)
        } else if (error.fields.email) {
          setEmailError(contact.invalidEmail)
        } else {
          setFormError(contact.requiredFields)
        }
      } else {
        setFormError(contact.requiredFields)
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <article>
      <Section className="pb-0 pt-14">
        <Container width="narrow">
          <PageHeader eyebrow={strings.nav.contact} title={contact.title} lede={contact.subtitle} />
          <Prose className="mt-8">{contact.intro}</Prose>
        </Container>
      </Section>

      <Section className="py-14">
        <Container width="narrow">
          {reference === null ? (
            <form onSubmit={submit} noValidate={false} className="space-y-6">
              {formError ? <Notice tone="error">{formError}</Notice> : null}

              {/*
               * The honeypot. Visually absent, present in the tab order of nothing
               * but an auto-filler; a value here is never validated client side.
               */}
              <div aria-hidden="true" className="hidden">
                <Input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(event) => setHoneypot(event.target.value)}
                />
              </div>

              <Field label={contact.requestType}>
                <Select value={requestType} onChange={(event) => setRequestType(event.target.value as RequestType)}>
                  {REQUEST_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {contact.requestTypes[type]}
                    </option>
                  ))}
                </Select>
              </Field>

              <div className="grid gap-6 md:grid-cols-2">
                <Field label={common.name}>
                  <Input
                    type="text"
                    name="name"
                    required
                    autoComplete="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                </Field>
                <Field label={common.email} error={emailError ?? undefined}>
                  <Input
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </Field>
              </div>

              <Field label={`${common.company} (${common.optional})`}>
                <Input
                  type="text"
                  name="company"
                  autoComplete="organization"
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                />
              </Field>

              <Field label={contact.messageLabel} hint={contact.messageHint}>
                <Textarea
                  name="message"
                  required
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                />
              </Field>

              <Button type="submit" disabled={sending}>
                {sending ? common.loading : contact.send}
              </Button>
            </form>
          ) : (
            <div className="border border-line bg-stage px-8 py-12 text-center">
              <Heading as="h2">{contact.success}</Heading>
              <Prose className="mt-4">{contact.successBody}</Prose>
              <div className="mt-8">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-mist">
                  {contact.reference}
                </p>
                <p className="mt-2 font-mono text-[26px] tabular text-ink">{reference}</p>
              </div>
            </div>
          )}

          <div className="mt-14 border-t border-line pt-8 text-[13px] leading-relaxed text-mist">
            <p>
              {strings.footer.contactEmail}: {site.contact.email}
            </p>
            <p className="mt-1">{site.contact.hours}</p>
          </div>
        </Container>
      </Section>
    </article>
  )
}