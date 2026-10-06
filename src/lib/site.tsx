/**
 * Locale plumbing for the React tree.
 *
 * The locale is *derived from the URL*, never from state — the same rule the
 * placeholder shell set up and the whole reason a shared link keeps its
 * language. Every component that needs copy calls `useSite()`, which re-derives
 * from `useLocation()`, so a `<Link>` navigation re-renders every string on the
 * page without a single state variable.
 *
 * `useLocaleSwitch` is the same `switchTo` the placeholder established, kept as
 * the single implementation: Turkish is the unprefixed default, English lives
 * under `/en`, and slugs are never translated, so switching language is exactly
 * a strip or a prefix on the current pathname.
 */

import { useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import type { LinkProps } from 'react-router-dom'
import { LOCALE_TAGS, pick, type Locale } from '../../shared/i18n.ts'
import type { T } from '../../shared/types.ts'
import { localeBundle } from '../../locales/index.ts'

/** `/en/...` is English; everything else is Turkish. */
export function localeFromPathname(pathname: string): Locale {
  return pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'tr'
}

/** Derives the prefix for a locale: English carries `/en`, Turkish carries nothing. */
export function localePrefix(locale: Locale): string {
  return locale === 'en' ? '/en' : ''
}

export function useLocale(): Locale {
  const { pathname } = useLocation()
  return localeFromPathname(pathname)
}

export function useSite() {
  const locale = useLocale()
  return { locale, tag: LOCALE_TAGS[locale], t: (text: T) => pick(text, locale), strings: localeBundle(locale) }
}

/** The single switcher. Slugs are not translated, so the path carries across as-is. */
export function useLocaleSwitch() {
  const locale = useLocale()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  return useCallback(
    (next: Locale) => {
      if (next === locale) return
      if (next === 'en') {
        navigate('/en' + (pathname === '/' ? '' : pathname))
      } else {
        navigate(pathname.replace(/^\/en/, '') || '/')
      }
    },
    [locale, pathname, navigate],
  )
}

/**
 * The only inward link component pages use.
 *
 * Because the route table is written once — Turkish unprefixed, English
 * prefixed — a page that renders a bare `<Link to="/cekirdekler">` would send
 * its English reader to the Turkish page. `LocaleLink` reads the current
 * locale from the URL and carries it into the target path, which is the entire
 * job; everything else (active state, target, ref, children) forwards.
 */
export function LocaleLink({ to, ...rest }: LinkProps) {
  const locale = useLocale()
  const target = typeof to === 'string' ? localePrefix(locale) + to : to
  return <Link to={target} {...rest} />
}