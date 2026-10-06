/*
 * Registration page (/hesap/kayit).
 *
 * The account is created **before** any order exists, which is why the flow
 * leads here from checkout: `POST /api/orders` sits behind `requireAuth`, so a
 * buyer without an account cannot complete a purchase at all. Three inputs and
 * one call.
 *
 *  - The company field is optional (`common.optional`), and optional means
 *    *omitted* rather than empty when unchecked — the server stores what it is
 *    given, and an empty string is a company name of zero length.
 *  - The password hint (`auth.passwordHint`, at least 10 characters) states the
 *    server's own minimum; the server repeats it, so a shorter password is a
 *    field error from the response, not a client-side rule guessed here.
 *  - 409 — an existing account — is not an error to retry: the reader is shown
 *    `auth.emailTaken` with a link to sign in instead.
 */

import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../lib/api.ts'
import { localePrefix, LocaleLink, useSite } from '../lib/site.tsx'
import { useAuth } from '../context/AuthContext.tsx'
import { Button, Container, Field, Input, Notice } from '../components/ui.tsx'

export function Register() {
  const { strings, locale } = useSite()
  const { register } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [company, setCompany] = useState('')
  const [fields, setFields] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setFields({})
    setFormError(null)

    const given = company.trim()
    register(email, password, given || undefined)
      .then(() => {
        navigate(localePrefix(locale) + '/hesap')
      })
      .catch((error: unknown) => {
        if (error instanceof ApiError) {
          setFields({
            email: error.status === 409 ? (strings.auth.emailTaken as string) : (error.fields.email ?? ''),
            password: error.fields.password ?? '',
            company: error.fields.company ?? '',
          })
          if (error.status !== 409 && !error.fields.email && !error.fields.password && !error.fields.company) {
            setFormError(error.message)
          }
        } else {
          setFormError(strings.errors.serverErrorBody)
        }
      })
      .finally(() => setBusy(false))
  }

  return (
    <Container width="narrow" className="py-20 md:py-28">
      <header className="animate-rise border-b border-line pb-10">
        <p className="eyebrow">{strings.nav.account}</p>
        <h1 className="mt-4 text-display-lg text-ink">{strings.auth.signUp}</h1>
        <div className="mt-6 max-w-[62ch] text-[17px] leading-[1.65] text-mist">
          {strings.auth.createAccountIntro}
        </div>
      </header>

      <form onSubmit={onSubmit} className="mt-10 max-w-md space-y-6" noValidate>
        {formError ? <Notice tone="error">{formError}</Notice> : null}

        <Field label={strings.auth.email} error={fields.email}>
          <Input
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>

        <Field label={strings.auth.password} hint={strings.auth.passwordHint} error={fields.password}>
          <Input
            type="password"
            name="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        <Field label={strings.common.company} hint={strings.common.optional} error={fields.company}>
          <Input
            type="text"
            name="company"
            autoComplete="organization"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </Field>

        <Button type="submit" disabled={busy}>
          {busy ? strings.common.loading : strings.auth.signUp}
        </Button>
      </form>

      <p className="mt-10 text-[13px] text-mist">
        {strings.auth.hasAccount}{' '}
        <LocaleLink to="/hesap/giris" className="text-ink underline underline-offset-4">
          {strings.auth.signIn}
        </LocaleLink>
      </p>
    </Container>
  )
}