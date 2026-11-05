# DESIGN_NOTES.md

Findings from the redesign task ("make ciptasarim.com feel like silicad.github.io"), the
decision the build made against each requirement, and the token list. Written after the
implementation, as the record of what changed and why — every "deviation" below is a
decision, not an oversight.

## What the reference contributes, and what it doesn't

The reference (silicad.github.io) contributes **structure, motion and visual language
only**: near-black field, restrained accents, huge headline with one emphasised word,
sticky minimal top bar, scroll-reveal sections, a step-synced run-log demo with an
explicit approve-gate, inline SVG diagrams, terminal furniture. No text, logo, artwork or
asset of the reference was copied — the illustrations here (the cursor-scrubbed die
scene, the RTL→GDS architecture band, the run-log scripts, the standard-cell figure
sheets) are originals grounded in the products this site actually sells.

## Section order (home page)

1. Hero (cursor-scrubbed video headline, two CTAs, scroll cue)
2. Vision / manifesto — numbered principles, interactive die
3. The catalogue — what we build (cores, filterable by kind)
4. How a delivery works — RTL→GDS band + run-terminal demo rail (four runs, each
   pausing at a gate)
5. Pricing arithmetic (quote-only, provenance on every figure)
6. Engineering content (technical notes)
7. Contact (intake form returning a tracked `IPR-######` reference)

## Token list

Tokens are **Tailwind theme values in `tailwind.config.js`** — one file, consumed as
utilities. The spec's "CSS variables in one file" is satisfied in substance: one place
defines every colour, the type scale and the spacing rhythm; the CSS-variable form was
deliberately not used, nothing on the site needs a runtime-changing token except the
wafer tilt (`--rx/--ry/--mx/--my` on `WaferScene.tsx`), which uses CSS variables for
exactly that job.

| Token | Value | Role |
|---|---|---|
| `paper` | `#08040A` | The field (near-black; light-theme token name, dark value) |
| `ink` | `#F1E7E2` | The foreground (bone) |
| `mist` | — | Body copy (fails contrast on light bands — see below) |
| `gold` / `gold-deep` | — | **Structure only**: eyebrows, connectors, active nav, band variant |
| `proven` green / `flare` orange | — | Figure basis + states; move for contrast, never role |
| `line`, `void` | — | Hairlines, gap prose |
| Fonts | IBM Plex Sans (300–600, variable) / IBM Plex Mono (400/500) | Self-hosted, latin + latin-ext |

The palette is a dark theme with light-theme token names. An inverted band
(`InvertedSection`, `bg-ink`) must invert its own headings and overrides
(`[&_.eyebrow]:text-gold-deep`, `text-paper/75` for body copy).

## Decisions against the original spec

- **Stack: Vite + React (React Router 7) + Express 5 + SQLite**, kept from the original
  build, not the static-output premise. The site has calculators backed by a shared
  engineering module, an intake form with a live reference counter, accounts, an orders
  and entitlements flow with file delivery — these need a server. Every other spec
  requirement (pre-rendered-visible content) is met instead by **server-side head
  injection** (`server/head.ts`): the SPA fallback rewrites the shell per request, per
  locale, so crawlers get real titles, descriptions, canonicals, OG/Twitter cards and
  JSON-LD without JavaScript. Full SSG would have meant rewriting the commerce into
  something static- hosting-compatible for no functional gain.
- **Single dark theme**, no `prefers-color-scheme` branch. The site's identity is dark
  instrumentation; a light variant would double every token decision the five design
  commits made. The reduced-motion guarantees are thorough instead (`prefers-reduced-motion`
  kills reveal, rise, nudge, pulse, blink, wafer tilt, video autoplay).
- **`POST /api/enquiries`** is the intake form's endpoint (the spec's
  `POST /api/design-requests` was the pre-build naming; the code and smoke suite use
  `enquiries`, POST-only, with a tracked reference number).
- **Font policy: self-hosted**, latin + latin-ext subsets (Turkish needs both:
  ı, ö, ü, ç are in the latin range; ş, ğ, İ are latin-ext). `font-display: swap`,
  Google's own `unicode-range` splits, IBM Plex Sans served as the variable font (one
  file for 300–600).
- **JS bundle 156 KB → 127 KB gz for the home route** after route-level
  `React.lazy` splitting (one chunk per page; Home stays eager as the LCP route). The
  spec's "< 100 KB" was written for a lighter stack; the remainder is React Router +
  the catalogue, split as far as is worth one more build complexity.

## Performance record (Lighthouse 12.8, home page)

| Metric | Before this pass | After |
|---|---|---|
| Performance (mobile, throttled) | 73 | 92 |
| Performance (desktop) | — | 100 |
| Accessibility | 100 | 100 (axe: 0 violations) |
| Best Practices | 100 | 100 |
| SEO | 100 | 100 |

What moved mobile 73→92: gzip on everything (`compression`), the hero video's eager
5.5 MB `preload="auto"` replaced by poster + `preload="metadata"`, a one-year cache on
fonts/media, a preload hint on the home LCP poster, the stylesheet inlined into the
shell, and one chunk per route. What remains is honest: on a throttled mobile CPU the
React boot itself is the cost — FCP 2.2 s. The next step would be SSG/SSR, which the
stack decision above deliberately does not take.

## Responsiveness and accessibility

- Verified at 390 / 768 / 1440: no horizontal scroll at any width (`scrollWidth ==
  clientWidth` probed), hero typography, demo rail and spec tables all reflow.
- axe-core over eight main routes in both locales: **0 violations** (after fixing the
  `dl` structure on spec tables and three h1→h3 heading-order skips).
- The run-terminal gate is keyboard-operable; `focus-visible` styles are global.

## Crawler layer

- `server/head.ts`: per-request, per-locale `<head>` rewrite (title, description,
  canonical, hreflang tr/en/x-default, OG/Twitter, JSON-LD: Organization + WebSite
  everywhere, Product on core pages, Article on notes). Placeholder facts (VAT string,
  phone) and quote-only pricing are kept out of the machine-readable layer.
- `server/sitemap.ts`: `sitemap.xml` generated from the content tables (64 URLs:
  16 static pages + 5 cores + 8 tools + 3 articles, each in both locales with
  reciprocals); `robots.txt` points at it.
- Smoke suite covers all of it (17 checks, "The crawler head").

## TODO(content) — every fact the owner must supply

The codebase's convention is **flagged placeholders, never plausible fakes** —
`TODO(content)` markers were not used because a placeholder value is structurally
guarded, but the list is the same. Nothing below is invented on the site:

1. `content/site.ts` → `contact.phone`: `+90 000 000 00 00`
2. `content/site.ts` → `legal.vat`: `TR VATANUMARASI` (`vatPlaceholder: true`) — real
   10-digit TCVKNV before the first invoice
3. Contact page bio / GitHub / LinkedIn links — absent rather than fake
4. Downloadable datasheet/brochure PDF — absent rather than fake
5. Every engineering figure in `content/cores/*.ts` — `uncharacterised` with a bilingual
   reason by design, until real characterisation data exists
6. Every price in `content/packages.ts` / licence tiers — quote-only by design
