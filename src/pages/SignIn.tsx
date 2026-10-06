/*
 * Sign-in page (/hesap/giris).
 *
 * The gate the flow turns on. Two fields, one call, one redirect — and every
 * decision in the file follows from how the sign-in actually works:
 *
 *  - **The server decides credentials.** `useAuth().signIn()` posts the pair and
 *    the session cookie is set by the response; nothing is validated client side
 *    beyond `required`, because a client-side check a server must repeat is only
 *    a second place to disagree.
 *  - **Field errors come from the response.** `ApiError.fields` maps field names
 *    to the server's own messages, so 401 lands as `auth.invalidCredentials`
 *    under the password field rather than as a banner the reader has to trace
 *    back to an input.
 *  - **The redirect honours `location.state.from`.** `RequireAuth` parks the
 *    visitor's intended pathname there, which may already carry an `/en` prefix
 *    — so it is navigated to verbatim, and the prefix decision it encodes is
 *    never second-guessed here.
 */

import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ApiError } from '../lib/api.ts'
import { localePrefix, LocaleLink, useSite } from '../lib/site.tsx'
import { useAuth } from '../context/AuthContext.tsx'
import { Button, Container, Field, Input, Notice } from '../components/ui.tsx'

export function SignIn() {
  const { strings, locale } = useSite()
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fields, setFields] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setFields({})
    setFormError(null)

    signIn(email, password)
      .then(() => {
        // `from` was written by `RequireAuth` and is already a router path —
        // including any `/en` prefix — so it goes to `navigate` as it stands.
        const from = (location.state as { from?: unknown } | null)?.from
        const target = typeof from === 'string' && from.startsWith('/') ? from : localePrefix(locale) + '/hesap'
        navigate(target, { replace: true })
      })
      .catch((error: unknown) => {
        if (error instanceof ApiError) {
          if (error.isUnauthorised) {
            // 401 names no field; the message lands beside the password, which is
            // where a reader typing credentials looks anyway.
            setFields({ password: strings.auth.invalidCredentials })
          } else {
            setFields({ email: error.fields.email ?? '', password: error.fields.password ?? '' })
            if (!error.fields.email && !error.fields.password) setFormError(error.message)
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
        <h1 className="mt-4 text-display-lg text-ink">{strings.auth.welcomeBack}</h1>
        <div className="mt-6 max-w-[62ch] text-[17px] leading-[1.65] text-mist">{strings.auth.signInIntro}</div>
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

        <Field label={strings.auth.password} error={fields.password}>
          <Input
            type="password"
            name="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        <Button type="submit" disabled={busy}>
          {busy ? strings.common.loading : strings.auth.signIn}
        </Button>
      </form>

      <p className="mt-10 text-[13px] text-mist">
        {strings.auth.noAccount}{' '}
        <LocaleLink to="/hesap/kayit" className="text-ink underline underline-offset-4">
          {strings.auth.signUp}
        </LocaleLink>
      </p>
    </Container>
  )
}