/**
 * Placeholder shell, replaced in step 8 by the real router.
 *
 * It exists for one reason worth recording: the locale switcher here is the first
 * thing to get right, because it sets `document.documentElement.lang` on every route
 * change, and the Turkish tree is unprefixed while the English tree lives under `/en`.
 * Getting that wrong means an English page announces itself with a Turkish screen
 * reader voice.
 *
 * `BrowserRouter` rather than a data router, matching the reference project. The
 * `basename="/en"` handling is the one thing that is genuinely new.
 */

import { useCallback, useEffect } from 'react'
import { BrowserRouter, useLocation, useNavigate } from 'react-router-dom'
import { LOCALE_TAGS, type Locale } from '../shared/i18n.ts'
import { localeBundle } from '../locales/index.ts'

function Shell() {
  const location = useLocation()
  const navigate = useNavigate()

  // `/en/...` is English; everything else is Turkish. The prefix is the single source
  // of truth for the locale — not a state variable, not a cookie, not a preference.
  // Deriving it from the path means a shared link always resolves to the language it
  // was shared in, and a Turkish link keeps working after a switch because Turkish is
  // the unprefixed default.
  const locale: Locale = location.pathname === '/en' || location.pathname.startsWith('/en/') ? 'en' : 'tr'
  const strings = localeBundle(locale)

  useEffect(() => {
    document.documentElement.lang = LOCALE_TAGS[locale]
    document.title = `${strings.meta.siteName} — ${strings.meta.tagline}`
  }, [locale, strings])

  const switchTo = useCallback(
    (next: Locale) => {
      if (next === locale) return
      if (next === 'en') {
        navigate('/en' + (location.pathname === '/' ? '' : location.pathname))
      } else {
        const stripped = location.pathname.replace(/^\/en/, '') || '/'
        navigate(stripped)
      }
    },
    [locale, location.pathname, navigate],
  )

  return (
    <div className="min-h-dvh bg-paper text-ink">
      <div className="shell mx-auto flex min-h-dvh flex-col justify-center gap-6 px-6 py-24">
        <p className="text-xs uppercase tracking-widest text-mist">{strings.meta.tagline}</p>
        <h1 className="text-display font-medium">{strings.home.heroTitle}</h1>
        <p className="max-w-prose text-mist">{strings.home.heroBody}</p>
        <p className="text-sm text-mist">
          {locale === 'tr' ? 'Türkçe' : 'English'} · <code className="font-mono">{location.pathname}</code>
        </p>
        <div className="flex gap-3">
          <button type="button" className="border border-line px-4 py-2 text-sm" onClick={() => switchTo('tr')}>
            TR
          </button>
          <button type="button" className="border border-line px-4 py-2 text-sm" onClick={() => switchTo('en')}>
            EN
          </button>
        </div>
      </div>
    </div>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  )
}
