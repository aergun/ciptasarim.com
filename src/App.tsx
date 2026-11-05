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

import { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { LOCALE_TAGS, type Locale } from '../shared/i18n.ts'
import { localeBundle } from '../locales/index.ts'
import { localeFromPathname, localePrefix, useLocale } from './lib/site.tsx'
import { Layout } from './components/Layout.tsx'
import { AuthProvider, useAuth } from './context/AuthContext.tsx'
import { CartProvider } from './context/CartContext.tsx'
import { Loading } from './components/ui.tsx'
import { Home } from './pages/Home.tsx'

/*
 * One chunk per route, Home alone eager. The home page is the route whose LCP
 * every Lighthouse run measures; deferring the other nineteen pages pulls their
 * bytes off its critical path entirely — the calculators and the commercial
 * pages are a different visit's work most of the time. Each lazy import maps the
 * page's named export onto the module default, which is all `lazy` accepts.
 */
const Cores = lazy(() => import('./pages/Cores.tsx').then((m) => ({ default: m.Cores })))
const CoreDetail = lazy(() => import('./pages/CoreDetail.tsx').then((m) => ({ default: m.CoreDetail })))
const Compare = lazy(() => import('./pages/Compare.tsx').then((m) => ({ default: m.Compare })))
const Tools = lazy(() => import('./pages/Tools.tsx').then((m) => ({ default: m.Tools })))
const ToolPage = lazy(() => import('./pages/ToolPage.tsx').then((m) => ({ default: m.ToolPage })))
const ProcessPage = lazy(() => import('./pages/Process.tsx').then((m) => ({ default: m.ProcessPage })))
const Licences = lazy(() => import('./pages/Licences.tsx').then((m) => ({ default: m.Licences })))
const Pricing = lazy(() => import('./pages/Pricing.tsx').then((m) => ({ default: m.Pricing })))
const Faq = lazy(() => import('./pages/Faq.tsx').then((m) => ({ default: m.Faq })))
const Articles = lazy(() => import('./pages/Articles.tsx').then((m) => ({ default: m.Articles })))
const ArticlePage = lazy(() => import('./pages/ArticlePage.tsx').then((m) => ({ default: m.ArticlePage })))
const About = lazy(() => import('./pages/About.tsx').then((m) => ({ default: m.About })))
const Contact = lazy(() => import('./pages/Contact.tsx').then((m) => ({ default: m.Contact })))
const Legal = lazy(() => import('./pages/Legal.tsx').then((m) => ({ default: m.Legal })))
const SignIn = lazy(() => import('./pages/SignIn.tsx').then((m) => ({ default: m.SignIn })))
const Register = lazy(() => import('./pages/Register.tsx').then((m) => ({ default: m.Register })))
const Account = lazy(() => import('./pages/Account.tsx').then((m) => ({ default: m.Account })))
const Downloads = lazy(() => import('./pages/Downloads.tsx').then((m) => ({ default: m.Downloads })))
const Cart = lazy(() => import('./pages/Cart.tsx').then((m) => ({ default: m.Cart })))
const Checkout = lazy(() => import('./pages/Checkout.tsx').then((m) => ({ default: m.Checkout })))
const NotFound = lazy(() => import('./pages/NotFound.tsx').then((m) => ({ default: m.NotFound })))

/**
 * The route table, written once, Turkish-prefixed. Every element sits in the
 * same single `<Suspense>` the table is rendered under, so the chunk's loading
 * state is `Shell`'s concern, not each route's.
 */
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
        {/* The table twice: Turkish unprefixed, English under /en. Written once.
            One Suspense boundary wraps each route's element rather than the
            `<Routes>` children themselves — `<Routes>` permits only `<Route>`
            children, so the boundary has to live inside the element it defers. */}
        {ROUTES.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={<Suspense fallback={<Loading label="…" />}>{route.element}</Suspense>}
          />
        ))}
        {ROUTES.map((route) => (
          <Route
            key={`en-${route.path}`}
            path={`/en${route.path === '/' ? '' : route.path}`}
            element={<Suspense fallback={<Loading label="…" />}>{route.element}</Suspense>}
          />
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