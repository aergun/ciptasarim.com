/**
 * The locale bundle's single entry point.
 *
 * Components import `t` and the taxonomies from here, never from `locales/tr.ts` or
 * `locales/en.ts` directly. That is not tidiness: importing `tr` directly from a
 * component is exactly how a half-translated UI happens, and the mirror type only
 * protects the two files if the mirror is applied at the boundary where the locale is
 * chosen.
 *
 * `t` is the whole bundle typed as `Mirror<TrShape>`, so a key that exists in Turkish
 * but not English is a compile error at *every* call site, not just at the bundle.
 */

import type { Mirror } from '../shared/i18n.ts'
import { en } from './en.ts'
import { tr, type TrShape } from './tr.ts'

export { en }
export { tr }
export type { TrShape }

/** The two bundles, indexed by locale. Same type on both sides — that is the guarantee. */
export const bundles: Record<'tr' | 'en', Mirror<TrShape>> = { tr, en }

/**
 * Reads a label from the bundle for a locale.
 *
 * The fallback is Turkish rather than English, and the reason is that a *missing
 * Turkish* label is the failure this type system exists to prevent. If this function
 * ever falls back at runtime it means a label was built dynamically and missed the
 * type, and showing the Turkish — the primary market's language — is the better
 * failure than an empty element or an English string on a Turkish page.
 */
export function t(locale: 'tr' | 'en'): Mirror<TrShape> {
  return bundles[locale] ?? bundles.tr
}

/* -------------------------------------------------------------------------- */
/* Taxonomy labels                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Taxonomy label maps for both locales.
 *
 * These live outside the mirrored bundle deliberately. A `Record<CoreKind, string>` in
 * `tr.ts` would be fine to mirror, but keeping the taxonomies here makes the key-set
 * generation visible in one place: every map's key type comes from `shared/types.ts`,
 * so adding a member produces a compile error naming one missing key rather than a
 * list that renders `undefined`.
 *
 * They are merged into the bundle shape by `localeBundle()` below, which is what
 * components actually call.
 */

import { coreKinds as trCoreKinds, coreKindDescriptions as trCoreKindDescriptions, licenseTiers as trLicenseTiers, processNodes as trProcessNodes, bundleKinds as trBundleKinds, toolIds as trToolIds, portDirections as trPortDirections, portKinds as trPortKinds, figureUnits as trFigureUnits, documentFormats as trDocumentFormats } from './tr.ts'
import { coreKinds as enCoreKinds, coreKindDescriptions as enCoreKindDescriptions, licenseTiers as enLicenseTiers, processNodes as enProcessNodes, bundleKinds as enBundleKinds, toolIds as enToolIds, portDirections as enPortDirections, portKinds as enPortKinds, figureUnits as enFigureUnits, documentFormats as enDocumentFormats } from './en.ts'

const taxonomies = {
  tr: {
    coreKinds: trCoreKinds,
    coreKindDescriptions: trCoreKindDescriptions,
    licenseTiers: trLicenseTiers,
    processNodes: trProcessNodes,
    bundleKinds: trBundleKinds,
    toolIds: trToolIds,
    portDirections: trPortDirections,
    portKinds: trPortKinds,
    figureUnits: trFigureUnits,
    documentFormats: trDocumentFormats,
  },
  en: {
    coreKinds: enCoreKinds,
    coreKindDescriptions: enCoreKindDescriptions,
    licenseTiers: enLicenseTiers,
    processNodes: enProcessNodes,
    bundleKinds: enBundleKinds,
    toolIds: enToolIds,
    portDirections: enPortDirections,
    portKinds: enPortKinds,
    figureUnits: enFigureUnits,
    documentFormats: enDocumentFormats,
  },
} as const

export type Taxonomies = (typeof taxonomies)['tr']

/** The complete label surface for one locale: mirrored strings plus taxonomies. */
export function localeBundle(locale: 'tr' | 'en') {
  return { ...t(locale), ...taxonomies[locale] }
}

export type LocaleBundle = ReturnType<typeof localeBundle>
