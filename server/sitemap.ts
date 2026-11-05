/**
 * `sitemap.xml` and `robots.txt`, generated per request from the content tables.
 *
 * Generated rather than checked in because the catalogue is the part that changes:
 * a checked-in sitemap keeps working after cores and articles are added — it just
 * stops listing them, silently. Building it from `cores`/`articles`/`tools` means a
 * new record is crawlable in the same deploy that publishes it.
 *
 * Only canonical, public, indexable URLs are listed. Account, cart and checkout
 * routes are excluded on purpose: a sitemap entry asks a crawler to index a page,
 * and a session-gated page has nothing public to index. Every URL is emitted for
 * both locales — unprefixed Turkish and `/en` prefixed English — with reciprocal
 * `xhtml:link` alternates, mirroring the head's `hreflang` block.
 */

import { articles } from '../content/articles.ts'
import { cores } from '../content/cores.ts'
import { site } from '../content/site.ts'
import { tools } from '../content/tools.ts'

type Entry = { path: string }

/** The static pages worth indexing, in priority order. */
const staticPages: readonly Entry[] = [
  { path: '/' },
  { path: '/cekirdekler' },
  { path: '/cekirdekler/karsilastir' },
  { path: '/hesaplayicilar' },
  { path: '/teknoloji' },
  { path: '/lisanslar' },
  { path: '/fiyatlandirma' },
  { path: '/yazilar' },
  { path: '/sss' },
  { path: '/hakkimizda' },
  { path: '/iletisim' },
  { path: '/teklif' },
  { path: '/lisanslar/sartlar' },
  { path: '/gizlilik' },
  { path: '/sartlar' },
  { path: '/fikri-mulkiyet' },
]

/** The two URL forms of one path: unprefixed Turkish and `/en` English. */
function urlFor(path: string, locale: 'tr' | 'en'): string {
  if (locale === 'tr') return site.url + (path === '/' ? '/' : path)
  return site.url + (path === '/' ? '/en/' : '/en' + path)
}

function urlEntry(path: string, changefreq: string, priority: string): string {
  const trUrl = urlFor(path, 'tr')
  const enUrl = urlFor(path, 'en')
  const links = [
    `<xhtml:link rel="alternate" hreflang="x-default" href="${trUrl}"/>`,
    `<xhtml:link rel="alternate" hreflang="tr" href="${trUrl}"/>`,
    `<xhtml:link rel="alternate" hreflang="en" href="${enUrl}"/>`,
  ].join('')
  const tail = `<changefreq>${changefreq}</changefreq><priority>${priority}</priority>${links}`
  return `    <url><loc>${trUrl}</loc>${tail}</url>\n    <url><loc>${enUrl}</loc>${tail}</url>`
}

export function sitemapXml(): string {
  const urls: string[] = []

  for (const { path } of staticPages) {
    urls.push(urlEntry(path, path === '/' ? 'weekly' : 'monthly', path === '/' ? '1.0' : '0.8'))
  }
  for (const core of cores) urls.push(urlEntry(`/cekirdekler/${core.slug}`, 'monthly', '0.9'))
  for (const tool of tools) urls.push(urlEntry(`/hesaplayicilar/${tool.slug}`, 'monthly', '0.7'))
  for (const article of articles) urls.push(urlEntry(`/yazilar/${article.slug}`, 'monthly', '0.6'))

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n')
}

export function robotsTxt(): string {
  return ['User-agent: *', 'Allow: /', '', `Sitemap: ${site.url}/sitemap.xml`, ''].join('\n')
}
