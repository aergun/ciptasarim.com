/**
 * Prerenders the /mcp pages to plain HTML at build time: `dist/mcp/index.html`
 * and `dist/en/mcp/index.html`.
 *
 * Why this page and not the whole site: "all /mcp content must render without
 * JavaScript" is the addendum's hard requirement, and this is the only route the
 * site has committed to it. The prerender is the same React tree the SPA runs —
 * `Shell` under `MemoryRouter` with the static-mode flag set — rendered through
 * `renderToStaticMarkup`; there is no separate template to drift. The
 * components take their static branches (`RunTerminal`'s, `CodeBlock`'s, the
 * demo video's lazy-src) from `src/lib/staticMode.ts`, and the reveal styles
 * are inert without the `html.js` class (`src/index.css`), which the skeleton's
 * tiny inline script adds back only when JS runs.
 *
 * The skeleton mirrors `index.html`'s head — title, description, hreflang
 * block, asset tags — because `renderHead` rewrites *that same head* per
 * request in `server/app.ts`: the served /mcp page then carries per-locale
 * OG/Twitter/canonical/JSON-LD like every other page does.
 *
 * Runs after `vite build` (vite cleans `dist/`); wired in the `build` script.
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'
import { createElement } from 'react'
import { AuthProvider } from '../src/context/AuthContext.tsx'
import { CartProvider } from '../src/context/CartContext.tsx'
import { MemoryRouter } from 'react-router-dom'
import { Shell } from '../src/App.tsx'
import { setStaticMode } from '../src/lib/staticMode.ts'

const ROOT = 'C:/Users/PC/Desktop/ciptasarim.com'
const dist = join(ROOT, 'dist')
const indexHtml = readFileSync(join(dist, 'index.html'), 'utf8')

/* The hashed asset tags, copied verbatim from the built shell. */
const cssHref = indexHtml.match(/<link rel="stylesheet" crossorigin href="([^"]+)"/)?.[1]
const jsSrc = indexHtml.match(/<script type="module" crossorigin src="([^"]+)"/)?.[1]
if (!cssHref || !jsSrc) throw new Error("could not read the built asset URLs from dist/index.html — run vite build first")

setStaticMode(true)

const page = (locale: 'tr' | 'en', path: string): string => {
  const lang = locale === 'tr' ? 'tr' : 'en'
  const body = renderToStaticMarkup(
    createElement(
      AuthProvider,
      null,
      createElement(CartProvider, null, createElement(MemoryRouter, { initialEntries: [path] }, createElement(Shell))),
    ),
  )
  return `<!doctype html>
<!--
  Prerendered by scripts/prerender-mcp.ts at build time — the /mcp page's
  no-JavaScript branch. The React bundle replaces this document when JS runs;
  without it, everything the page claims is already on screen. The head is
  rewritten per request by server/head.ts.
-->
<html lang="${lang}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="theme-color" content="#08040A" />
    <title></title>
    <meta name="description" content="" />

    <link rel="alternate" hreflang="tr" href="/" />
    <link rel="alternate" hreflang="en" href="/en" />
    <link rel="alternate" hreflang="x-default" href="/" />

    <script>document.documentElement.classList.add('js')</script>
    <link rel="stylesheet" crossorigin href="${cssHref}">
    <script type="module" crossorigin src="${jsSrc}"></script>
  </head>
  <body>
    <div id="root">${body}</div>
  </body>
</html>
`
}

for (const [locale, path, dir] of [
  ['tr', '/mcp', join(dist, 'mcp')],
  ['en', '/en/mcp', join(dist, 'en', 'mcp')],
] as const) {
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'index.html'), page(locale, path))
  console.log(`prerendered ${path}`)
}
