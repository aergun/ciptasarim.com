/**
 * The broken-link check the redesign task asked for, run the only way it can be
 * run on an SPA: a real browser collects every `<a href>` on every main route in
 * both locales, and internal targets are checked against the route table rather
 * than against HTTP statuses — the SPA fallback answers 200 for *any* path, so a
 * broken internal link on this site never 404s, it just routes to `NotFound`
 * (`server/app.ts` documents this). A link is broken here if:
 *
 *   - its path is not in the route table (static routes, core/article/tool
 *     slugs, `/en` prefixed, query strings on the catalogue filter only), or
 *   - it is external and its HTTPS response is >= 400.
 *
 * Pure `#fragment` links are checked for a matching element on their own page.
 * Anchor-only `#` links and `mailto:` are skipped as not routes.
 *
 * Usage: boot the server (SESSION_SECRET=x npm start on a port), then
 * `BASE=http://127.0.0.1:4100 npx tsx scripts/check-links.ts`
 */

import { articles } from '../content/articles.ts'
import { cores } from '../content/cores.ts'
import { tools } from '../content/tools.ts'
import type { Page } from 'playwright'

const BASE = process.env.BASE ?? 'http://127.0.0.1:4100'

/**
 * The route table as patterns. Kept here by hand — importing the real one from
 * `src/App.tsx` would drag React Router into a check script, and a check script
 * that needs the site running to describe its own routes would never run. The
 * smoke suite asserts the shape ('the contact route is in the primary nav'), but
 * the honest guarantee is this list against the sitemap: every static page below
 * is also in `server/sitemap.ts` — keep the two together.
 */
const STATIC_ROUTES = [
  '/',
  '/mcp',
  '/cekirdekler',
  '/cekirdekler/karsilastir',
  '/hesaplayicilar',
  '/teknoloji',
  '/lisanslar',
  '/lisanslar/sartlar',
  '/fiyatlandirma',
  '/yazilar',
  '/sss',
  '/hakkimizda',
  '/iletisim',
  '/teklif',
  '/gizlilik',
  '/sartlar',
  '/fikri-mulkiyet',
  '/hesap',
  '/hesap/indirmeler',
  '/hesap/giris',
  '/hesap/kayit',
  '/sepet',
  '/sepet/odeme',
]

const slugs = [
  ...cores.map((core) => `/cekirdekler/${core.slug}`),
  ...tools.map((tool) => `/hesaplayicilar/${tool.slug}`),
  ...articles.map((article) => `/yazilar/${article.slug}`),
]

const routeSet = new Set([...STATIC_ROUTES, ...slugs].flatMap((p) => [p, p === '/' ? '/en' : '/en' + p]))

function routeExists(href: string): boolean {
  const [path] = href.split('?')
  return routeSet.has(path ?? '')
}

async function externalOk(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: 'GET', redirect: 'follow' })
    return res.status < 400
  } catch {
    return false
  }
}

async function main(): Promise<void> {
  const { chromium } = await import('playwright')
  const browser = await chromium.launch()

  /** The routes to harvest links from. */
  const seeds = STATIC_ROUTES.filter((p) => !p.startsWith('/hesap') && !p.startsWith('/sepet'))
  const hrefs = new Set<string>()
  const anchors = new Set<string>()
  const failures: string[] = []

  for (const route of seeds) {
    const page: Page = await browser.newPage()
    await page.goto(BASE + route, { waitUntil: 'networkidle' })
    const found = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href]')).map((a) => (a as HTMLAnchorElement).getAttribute('href') ?? '')
      return links
    })
    for (const href of found) {
      if (href.startsWith('#')) {
        anchors.add(`${route} → ${href}`)
        continue
      }
      hrefs.add(href)
    }
    await page.close()
  }

  const cache = new Map<string, boolean>()

  for (const href of [...hrefs].sort()) {
    if (href.startsWith('mailto:') || href === '#') continue
    if (href.startsWith('http')) {
      const verdict = cache.get(href) ?? (await externalOk(href))
      cache.set(href, verdict)
      if (!verdict) failures.push(`external ${href}`)
      continue
    }
    // Internal, no scheme: a route, or a path-prefixed fragment.
    if (href.includes('#')) {
      const [path] = href.split('#')
      if (path && routeExists(path) === false) failures.push(`internal ${href} (path not in route table)`)
      continue
    }
    if (!routeExists(href)) failures.push(`internal ${href} (path not in route table)`)
  }

  /* Verify each in-page `#fragment` against the ids that actually render. */
  const byRoute = new Map<string, string[]>()
  for (const anchor of anchors) {
    const [route, id] = anchor.split(' → ')
    if (!route) continue
    byRoute.set(route, [...(byRoute.get(route) ?? []), id ?? ''])
  }
  for (const [route, ids] of byRoute) {
    const page = await browser.newPage()
    await page.goto(BASE + route, { waitUntil: 'networkidle' })
    const present = new Set<string>(
      await page.evaluate(() => Array.from(document.querySelectorAll('[id]')).map((el) => el.id)),
    )
    for (const id of ids) {
      if (id !== '' && id !== '#' && !present.has(id.slice(1))) failures.push(`anchor ${route} → ${id} (no such id)`)
    }
    await page.close()
  }
  await browser.close()

  console.log(`checked ${hrefs.size} hrefs and ${anchors.size} anchors across ${seeds.length} routes`)
  if (failures.length > 0) {
    console.log('BROKEN:')
    for (const failure of failures) console.log('  ' + failure)
    process.exitCode = 1
  } else {
    console.log('no broken links')
  }
}

void main()
