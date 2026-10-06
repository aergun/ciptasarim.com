/**
 * The page chrome: header, footer, skip link.
 *
 * Deliberately one component rather than a layout route: the router needs only
 * a `<Layout>` around its element, and the header's active-link logic can read
 * the real location instead of a route context.
 *
 * ## The header labels come from the locale bundle, not from `primaryNav`
 *
 * `primaryNav` in `content/site.ts` carries untranslated `label`s because it is
 * data shared by sitemaps and hreflang. The rendered label for each entry is
 * picked by its nav key from the bundle, so a nav bar can never go half
 * translated — `nav.cores` is typed in both locale files.
 */

import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { site, primaryNav, footerNav, legalRoutes } from '../../content/site.ts'
import { Container, Rule } from './ui.tsx'
import { useSite, useLocaleSwitch, LocaleLink } from '../lib/site.tsx'
import { useAuth } from '../context/AuthContext.tsx'
import { useCart } from '../context/CartContext.tsx'

/** `primaryNav`'s entry route → its key in the `nav.*` locale namespace. */
const NAV_KEYS: Record<string, string> = {
  '/cekirdekler': 'cores',
  '/hesaplayicilar': 'tools',
  '/teknoloji': 'process',
  '/lisanslar': 'licences',
  '/fiyatlandirma': 'pricing',
  '/sss': 'faq',
  '/yazilar': 'articles',
  '/hakkimizda': 'about',
  '/iletisim': 'contact',
}

/**
 * What the desktop bar can actually hold. Nine tracked-uppercase labels do not
 * fit beside the brand, cart, account and language switcher at 1280 px — they
 * flex-shrink into a wrapped, overlapping mess, which the first browser sweep
 * caught. The desktop bar shows the six a buyer is most often moving between;
 * the remaining three are one click away in the footer on every page and in
 * the mobile menu at every viewport.
 */
const DESKTOP_NAV = ['/cekirdekler', '/hesaplayicilar', '/teknoloji', '/lisanslar', '/fiyatlandirma', '/sss']

export function Layout({ children }: { children: React.ReactNode }) {
  const { strings, locale } = useSite()
  const switchTo = useLocaleSwitch()
  const { user } = useAuth()
  const { lines } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  // The mobile menu closes itself on navigation — an open menu is a gesture
  // that has happened, not a state worth persisting across pages.
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div className="flex min-h-dvh flex-col bg-paper text-ink">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        {strings.nav.skipToContent}
      </a>

      <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
        <Container className="flex h-16 items-center justify-between gap-6">
          <LocaleLink
            to="/"
            className="flex shrink-0 flex-col whitespace-nowrap leading-tight"
            aria-label={site.name}
          >
            <span className="text-[15px] font-semibold tracking-tight text-ink">{site.name}</span>
            <span className="text-[9px] font-medium uppercase tracking-[0.24em] text-mist">{site.descriptor}</span>
          </LocaleLink>

          <nav aria-label="Primary" className="hidden items-center gap-6 xl:flex">
            {primaryNav
              .filter((entry) => DESKTOP_NAV.includes(entry.to))
              .map((entry) => {
                const labelKey = NAV_KEYS[entry.to] ?? ''
                const label = (strings.nav as Record<string, string>)[labelKey] ?? entry.label
                return (
                  <NavLink
                    key={entry.to}
                    to={entry.to}
                    className={({ isActive }) =>
                      `whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors ${
                        isActive ? 'text-flare' : 'text-mist hover:text-ink'
                      }`
                    }
                  >
                    {label}
                  </NavLink>
                )
              })}
          </nav>

          <div className="flex shrink-0 items-center gap-3">
            <LocaleLink
              to="/sepet"
              className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.16em] text-mist hover:text-ink"
              aria-label={strings.nav.cart}
            >
              {strings.nav.cart}
              {lines.length > 0 ? (
                <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-flare px-1 font-mono text-[9px] leading-none text-paper">
                  {lines.length}
                </span>
              ) : null}
            </LocaleLink>
            <LocaleLink
              to={user ? '/hesap' : '/hesap/giris'}
              className="hidden whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.16em] text-mist hover:text-ink sm:inline"
            >
              {user ? strings.nav.account : strings.auth.signIn}
            </LocaleLink>

            <div className="hidden gap-1 sm:flex" role="group" aria-label="Language">
              <LanguageButton current={locale === 'tr'} onClick={() => switchTo('tr')}>TR</LanguageButton>
              <LanguageButton current={locale === 'en'} onClick={() => switchTo('en')}>EN</LanguageButton>
            </div>

            <button
              type="button"
              className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mist xl:hidden"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              {menuOpen ? strings.nav.close : strings.nav.menu}
            </button>
          </div>
        </Container>

        {menuOpen ? (
          <nav id="mobile-menu" aria-label="Primary" className="border-t border-line bg-paper xl:hidden">
            <Container className="grid grid-cols-2 gap-x-8 gap-y-3 py-6">
              {primaryNav.map((entry) => (
                <LocaleLink key={entry.to} to={entry.to} className="text-sm font-medium text-ink">
                  {(strings.nav as Record<string, string>)[NAV_KEYS[entry.to] ?? ''] ?? entry.label}
                </LocaleLink>
              ))}
              <LocaleLink to="/sepet" className="text-sm font-medium text-mist">{strings.nav.cart}</LocaleLink>
              <LocaleLink to={user ? '/hesap' : '/hesap/giris'} className="text-sm font-medium text-mist">
                {user ? strings.nav.account : strings.auth.signIn}
              </LocaleLink>
            </Container>
          </nav>
        ) : null}
      </header>

      <main id="main" className="flex-1">
        {children}
      </main>

      <Footer />
    </div>
  )
}

function LanguageButton({
  children,
  current,
  onClick,
}: {
  children: React.ReactNode
  current: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={current}
      className={`border px-2 py-1 text-[10px] font-semibold tracking-wide transition-colors ${
        current ? 'border-ink bg-ink text-paper' : 'border-line text-mist hover:border-ink hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}

function Footer() {
  const { t, strings, locale } = useSite()
  const switchTo = useLocaleSwitch()

  return (
    <footer className="border-t border-line bg-stage">
      <Container className="py-16">
        <div className="grid gap-10 md:grid-cols-4">
          {footerNav.map((column) => (
            <div key={t(column.heading)}>
              <p className="eyebrow">{t(column.heading)}</p>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.to}>
                    <LocaleLink to={link.to} className="text-[13px] text-mist transition-colors hover:text-ink">
                      {t(link.label)}
                    </LocaleLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Rule className="mt-14" />

        <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-prose">
            <p className="text-[13px] font-semibold text-ink">{site.legal.company}</p>
            <p className="mt-1 text-[12px] leading-relaxed text-mist">
              {strings.footer.ipNotice}
            </p>
            <p className="mt-2 font-mono text-[11px] text-mist">
              {strings.footer.contactEmail}: {site.contact.email}
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 md:items-end">
            <div className="flex gap-4 text-[12px] text-mist">
              <LocaleLink to={legalRoutes.privacy} className="hover:text-ink">{strings.footer.privacy}</LocaleLink>
              <LocaleLink to={legalRoutes.terms} className="hover:text-ink">{strings.footer.terms}</LocaleLink>
              <LocaleLink to={legalRoutes.licenceTerms} className="hover:text-ink">{strings.footer.licenceTerms}</LocaleLink>
            </div>
            <div className="flex gap-1" role="group" aria-label="Language">
              <LanguageButton current={locale === 'tr'} onClick={() => switchTo('tr')}>TR</LanguageButton>
              <LanguageButton current={locale === 'en'} onClick={() => switchTo('en')}>EN</LanguageButton>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  )
}