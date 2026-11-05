/**
 * Server-side `<head>` injection for the SPA fallback.
 *
 * ## Why the server, and not `Shell`
 *
 * The client already sets `document.lang` and `document.title` per route
 * (`src/App.tsx`), but a meta tag updated after hydration is invisible to the
 * consumers that matter: a crawler and a link-preview bot read the HTML the server
 * sends. This module rewrites that HTML per request, per locale, so every URL the
 * site serves carries its own title, description, canonical, `hreflang` alternates,
 * Open Graph / Twitter card and schema.org JSON-LD.
 *
 * ## One code path
 *
 * The fallback in `app.ts` is the *only* place a shell is sent (`express.static`
 * runs with `index: false`), so injecting here covers `/`, `/en` and every deep
 * link. Development is different — Vite serves the template directly on :5173 and
 * no injection runs there — which is accepted: crawlers see production.
 *
 * ## What the JSON-LD deliberately omits
 *
 * The `Organization` node carries no `vatID` and no `telephone`: both values in
 * `content/site.ts` are flagged placeholders, and JSON-LD is machine-readable —
 * a placeholder tax number there is not "obviously a placeholder" the way it is in
 * prose, it is a fact a crawler will happily index. The `Product` node carries no
 * `offers`: every price on this site is quote-only, and a structured-data price
 * would be a fabricated number attached to a machine-readable object.
 */

import { articleBySlug } from '../content/articles.ts'
import { coreFor } from '../content/cores.ts'
import { site } from '../content/site.ts'
import { localeBundle } from '../locales/index.ts'
import type { Locale } from '../shared/i18n.ts'

/** `tr` unless the pathname is `/en` or starts with `/en/` — the router's own rule. */
export function localeFromPathname(pathname: string): Locale {
  return pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'tr'
}

/** The pathname with the locale prefix stripped: `/en/cekirdekler` → `/cekirdekler`. */
export function pagePath(pathname: string): string {
  const locale = localeFromPathname(pathname)
  let p = locale === 'en' ? pathname.slice('/en'.length) : pathname
  if (!p.startsWith('/')) p = '/' + p
  return p
}

/** The page's locale-prefixed absolute URL — what a canonical is allowed to claim. */
function absoluteUrl(pathname: string): string {
  const locale = localeFromPathname(pathname)
  const p = pagePath(pathname)
  const withPrefix = locale === 'en' ? (/^\/$/.test(p) ? '/en/' : '/en' + p) : p
  return site.url + withPrefix
}

/**
 * One page's title, description and OG type, plus the node JSON-LD appends to the
 * graph. `null` for the slug lookups means "some other route" and the caller falls
 * back to site defaults — a deep link to a slug that was removed still gets a
 * correct (if generic) head rather than a broken shell.
 */
function pageMeta(
  pathname: string,
  locale: Locale,
): { title: string; description: string; ogType: 'website' | 'article'; jsonLd: Array<Record<string, unknown>> } {
  const strings = localeBundle(locale)
  const p = pagePath(pathname)

  // A slug whose record was removed falls through to the site defaults below:
  // `coreFor` returns null and every deep link still gets a correct head.
  const core = p.match(/^\/cekirdekler\/([^/]+)$/)
  if (core) {
    const record = coreFor(decodeURIComponent(core[1] ?? ''))
    if (record) {
      return {
        title: `${record.name} — ${strings.meta.siteName}`,
        description: record.summary[locale],
        ogType: 'website',
        jsonLd: [
          {
            '@type': 'Product',
            name: record.name,
            description: record.summary[locale],
            category: record.family,
            manufacturer: { '@type': 'Organization', name: site.name },
            brand: { '@type': 'Organization', name: site.name },
          },
        ],
      }
    }
  }

  const article = p.match(/^\/yazilar\/([^/]+)$/)
  if (article) {
    const record = articleBySlug(decodeURIComponent(article[1] ?? ''))
    if (record) {
      return {
        title: `${record.title[locale]} — ${strings.meta.siteName}`,
        description: record.standfirst[locale],
        ogType: 'article',
        jsonLd: [
          {
            '@type': 'Article',
            headline: record.title[locale],
            description: record.standfirst[locale],
            datePublished: record.date,
            inLanguage: locale,
            author: { '@type': 'Organization', name: site.name },
            publisher: { '@type': 'Organization', name: site.name },
          },
        ],
      }
    }
  }

  return {
    title: `${strings.meta.siteName} — ${strings.meta.tagline}`,
    description: strings.meta.description,
    ogType: 'website',
    jsonLd: [],
  }
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}

/** JSON inside a `<script>` tag: JSON.stringify plus the `</script>` breakout guard. */
function jsonForScript(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

/**
 * The `@graph` every page gets. The Organization/WebSite nodes are stable site
 * facts; `pageMeta` may append a Product or Article node scoped to that page.
 */
function schemaGraph(locale: Locale, nodes: Array<Record<string, unknown>>) {
  const strings = localeBundle(locale)
  return [
    {
      '@type': 'Organization',
      '@id': `${site.url}/#organization`,
      name: site.name,
      legalName: site.legalName,
      url: site.url,
      foundingDate: String(site.founded),
      email: site.contact.email,
      address: { '@type': 'PostalAddress', addressCountry: 'TR' },
    },
    {
      '@type': 'WebSite',
      '@id': `${site.url}/#website`,
      url: site.url,
      name: `${strings.meta.siteName} — ${strings.meta.tagline}`,
      inLanguage: locale,
      publisher: { '@id': `${site.url}/#organization` },
    },
    ...nodes,
  ]
}

/**
 * Rewrites the built shell for one request, or returns `null` to skip injection —
 * which is how the fallback knows development has no built shell to serve.
 *
 * The template's `<title>`, description and `hreflang` links are the Turkish
 * defaults; every one is replaced, not appended to, so a crawler never sees two
 * competing claims about the same document. The OG/Twitter/JSON-LD block has no
 * template counterpart and is inserted before `</head>`.
 */
export function renderHead(pathname: string, html: string | null): string | null {
  if (html === null) return null
  const locale = localeFromPathname(pathname)
  const strings = localeBundle(locale)
  const { title, description, ogType, jsonLd } = pageMeta(pathname, locale)
  const canonical = absoluteUrl(pathname)
  const p = pagePath(pathname)
  const trUrl = site.url + (/^\/$/.test(p) ? '/' : p)
  const enUrl = site.url + (/^\/$/.test(p) ? '/en/' : '/en' + p)
  const image = `${site.url}/og/ciptasarim-og.png`

  const alternates = [
    `<link rel="alternate" hreflang="tr" href="${trUrl}" />`,
    `<link rel="alternate" hreflang="en" href="${enUrl}" />`,
    `<link rel="alternate" hreflang="x-default" href="${trUrl}" />`,
  ].join('\n    ')

  const og = [
    `<meta property="og:site_name" content="${escapeAttr(site.name)}" />`,
    `<meta property="og:type" content="${ogType}" />`,
    `<meta property="og:title" content="${escapeAttr(title)}" />`,
    `<meta property="og:description" content="${escapeAttr(description)}" />`,
    `<meta property="og:url" content="${escapeAttr(canonical)}" />`,
    `<meta property="og:image" content="${escapeAttr(image)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${escapeAttr(site.name)} — ${escapeAttr(strings.meta.tagline)}" />`,
    `<meta property="og:locale" content="${locale === 'tr' ? 'tr_TR' : 'en_US'}" />`,
    `<meta property="og:locale:alternate" content="${locale === 'tr' ? 'en_US' : 'tr_TR'}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeAttr(title)}" />`,
    `<meta name="twitter:description" content="${escapeAttr(description)}" />`,
    `<meta name="twitter:image" content="${escapeAttr(image)}" />`,
  ].join('\n    ')

  const canonicalLink = `<link rel="canonical" href="${escapeAttr(canonical)}" />`
  const jsonLdScript = `<script type="application/ld+json">\n    ${jsonForScript({
    '@context': 'https://schema.org',
    '@graph': schemaGraph(locale, jsonLd),
  })}\n  </script>`

  return html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeAttr(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${escapeAttr(description)}" />`)
    .replace(
      /(?:[ \t]*<link rel="alternate" hreflang="[^"]*" href="[^"]*" \/>[ \t]*\n)+/,
      () => `    ${alternates}\n\n`,
    )
    .replace('</head>', `  ${canonicalLink}\n    ${og}\n    ${jsonLdScript}\n  </head>`)
}
