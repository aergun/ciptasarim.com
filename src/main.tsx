/**
 * Frontend entry point.
 *
 * Minimal for now — step 2 of the plan is the locale layer, and the router, contexts
 * and pages arrive in step 8. This exists so that `npm run typecheck` and
 * `npm run build` are meaningful from the first commit rather than failing on a
 * missing file that `index.html` already references.
 *
 * Note the `lang` assignment. `index.html` hardcodes `lang="tr"` because that is the
 * correct value for the initial paint of the unprefixed Turkish tree — but the
 * English tree lives at `/en`, and a document that says `lang="tr"` while displaying
 * English is a real accessibility and indexing defect, not a cosmetic one. A screen
 * reader picks a voice from it and a crawler decides which locale tree the URL belongs
 * to. The locale switcher in `src/context/LocaleContext.tsx` takes this over on every
 * route change; this is the paint before that.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { DEFAULT_LOCALE } from '../shared/i18n.ts'
import './index.css'
import { App } from './App.tsx'

document.documentElement.lang = DEFAULT_LOCALE === 'tr' ? 'tr' : 'en'

const container = document.getElementById('root')
if (!container) throw new Error('#root is missing from index.html')

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
