/*
 * The real router, replacing the placeholder shell.
 *
 * ## The locale layer
 *
 * The route table is written **once**, unprefixed — Turkish is the site's default
 * and the primary market's URL; English is served by the same table duplicated
 * under `/en`. Every inward navigation goes through `LocaleLink`
 * (`src/lib/site.tsx`), which carries the current locale into the target path,
 * so an English reader stays on English pages without the pages knowing
 * anything about it. Slugs are never translated — a core's URL is the same
 * contract in both languages — so the prefix/strip in `useLocaleSwitch` is
 * exact, not approximate.
 *
 * `<html lang>` and `<title>` are set in `Shell` on every route change, which is
 * the portable fix for the reference's hardcoded `<html lang="en">`: no page
 * ever sets document state itself.
 */

import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { LOCALE_TAGS, type Locale } from '../shared/i18n.ts'
import { localeBundle } from '../locales/index.ts'
import { localeFromPathname, localePrefix, useLocale } from './lib/site.tsx'
import { Layout } from './components/Layout.tsx'
import { AuthProvider, useAuth } from './context/AuthContext.tsx'
import { CartProvider } from './context/CartContext.tsx'
import { Loading } from './components/ui.tsx'

import { Home } from './pages/Home.tsx'
import { Cores } from './pages/Cores.tsx'
import { CoreDetail } from './pages/CoreDetail.tsx'
import { Compare } from './pages/Compare.tsx'
import { Tools } from './pages/Tools.tsx'
import { ToolPage } from './pages/ToolPage.tsx'
import { ProcessPage } from './pages/Process.tsx'
import { Licences } from './pages/Licences.tsx'
import { Pricing } from './pages/Pricing.tsx'
import { Faq } from './pages/Faq.tsx'
import { Articles } from './pages/Articles.tsx'
import { ArticlePage } from './pages/ArticlePage.tsx'
import { About } from './pages/About.tsx'
import { Contact } from './pages/Contact.tsx'
import { Legal } from './pages/Legal.tsx'
import { SignIn } from './pages/SignIn.tsx'
import { Register } from './pages/Register.tsx'
import { Account } from './pages/Account.tsx'
import { Downloads } from './pages/Downloads.tsx'
import { Cart } from './pages/Cart.tsx'
import { Checkout } from './pages/Checkout.tsx'
import { NotFound } from './pages/NotFound.tsx'

/** The route table, written once, Turkish-prefixed. */
const ROUTES = [
  { path: '/', element: <Home /> },
  { path: '/cekirdekler', element: <Cores /> },
  { path: '/cekirdekler/karsilastir', element: <Compare /> },
  { path: '/cekirdekler/:slug', element: <CoreDetail /> },
  { path: '/hesaplayicilar', element: <Tools /> },
  { path: '/hesaplayicilar/:slug', element: <ToolPage /> },
  { path: '/teknoloji', element: <ProcessPage /> },
  { path: '/lisanslar', element: <Licences /> },
  { path: '/lisanslar/sartlar', element: <Legal page="licenceTerms" /> },
  { path: '/fiyatlandirma', element: <Pricing /> },
  { path: '/sss', element: <Faq /> },
  { path: '/yazilar', element: <Articles /> },
  { path: '/yazilar/:slug', element: <ArticlePage /> },
  { path: '/hakkimizda', element: <About /> },
  { path: '/iletisim', element: <Contact /> },
  { path: '/teklif', element: <Contact quote /> },
  { path: '/gizlilik', element: <Legal page="privacy" /> },
  { path: '/sartlar', element: <Legal page="terms" /> },
  { path: '/fikri-mulkiyet', element: <Legal page="ip" /> },
  { path: '/hesap', element: <RequireAuth><Account /></RequireAuth> },
  { path: '/hesap/indirmeler', element: <RequireAuth><Downloads /></RequireAuth> },
  { path: '/hesap/giris', element: <SignIn /> },
  { path: '/hesap/kayit', element: <Register /> },
  { path: '/sepet', element: <Cart /> },
  { path: '/sepet/odeme', element: <Checkout /> },
] as const

function Shell() {
  const { pathname } = useLocation()
  const locale: Locale = localeFromPathname(pathname)
  const strings = localeBundle(locale)

  useEffect(() => {
    document.documentElement.lang = LOCALE_TAGS[locale]
  }, [locale])

  useEffect(() => {
    document.title = `${strings.meta.siteName} — ${strings.meta.tagline}`
  }, [strings])

  return (
    <Layout>
      <Routes>
        {/* The table twice: Turkish unprefixed, English under /en. Written once. */}
        {ROUTES.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
        {ROUTES.map((route) => (
          <Route key={`en-${route.path}`} path={`/en${route.path === '/' ? '' : route.path}`} element={route.element} />
        ))}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  )
}

/**
 * The account routes' gate, on the reference site's RequireAuth pattern.
 *
 * The check exists for *navigation*, not for authorisation — the server still
 * refuses every account call from a cold session and the client cannot change
 * that. Redirecting here only keeps a signed-out visitor from watching an
 * orders page fail four times.
 */
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const { pathname } = useLocation()
  const locale = useLocale()
  if (loading) return <Loading label="…" />
  if (!user) return <Navigate to={localePrefix(locale) + '/hesap/giris'} replace state={{ from: pathname }} />
  return children
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Shell />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}