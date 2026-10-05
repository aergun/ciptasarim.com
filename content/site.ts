/**
 * Site metadata — everything the site says about itself that is not content.
 *
 * Turkish-primary with English secondary, so the wordmark and legal identity are
 * Turkish and the SEO `description` carries both. The locale bundle owns
 * `meta.siteName` and `meta.tagline` for the UI; the values here exist for the two
 * places that cannot use the bundle — the `<title>` and `<meta>` tags rendered at
 * boot, and the `From:` header on an order email — and they are kept identical to
 * the bundle's so there is one string per concept in practice.
 *
 * Nothing here hard-codes a page label. Short UI strings belong in `locales/tr.ts`;
 * long prose belongs in the content files as `T`. What belongs here is the small
 * fixed set of facts about the business itself: the name, the address, the tax
 * registration, the legal pages' routes.
 */

/** The wordmark. Matches the domain: ciptasarim.com. Rendered raw in header and footer. */
export const site = {
  /** Wordmark. Sentence case is not applied here — this is a mark, not prose. */
  name: 'Çip Tasarım',
  /** Rendered under the wordmark in the header and in the footer. */
  descriptor: 'Yarı İletken IP Tasarımı',
  /** The positioning line, mirrors `meta.tagline`. */
  tagline: 'Doğrulamalı yarı iletken IP çekirdekleri',
  /** Mirrors `meta.legalName`. Used on invoices and in the footer. */
  legalName: 'Çip Tasarım Yarı İletken IP',

  /**
   * SEO description. Carries the Turkish first and the English second in one
   * string because a `<meta name="description">` is one tag, and a crawler reading
   * the Turkish half and an index reading the English half both need to find it.
   */
  description:
    'RTL, standart hücre makroları, analog ve karma sinyal çözümleri ile doğrulama kolateralı. Lisanslama, teslim paketleri ve mühendislik hesaplayıcıları. — RTL, standard-cell macros, analog and mixed-signal IP with verification collateral, licensing and engineering calculators.',

  /** Canonical origin. Every `hreflang` and sitemap entry is built from this. */
  url: 'https://ciptasarim.com',

  /**
   * The site's default locale is Turkish (`DEFAULT_LOCALE` in `shared/i18n.ts`) and
   * `hreflang` follows that: Turkish first, English second, `x-default` pointing at
   * the Turkish URL rather than at the root, so a crawler with no `Accept-Language`
   * lands in the primary market instead of being sent to a redirect.
   */
  alternateLinks: [
    { hrefLang: 'tr', href: 'https://ciptasarim.com/' },
    { hrefLang: 'en', href: 'https://ciptasarim.com/en/' },
  ],

  contact: {
    /**
     * The published address, and the same one the intake form posts to.
     *
     * ⚠️ **The form, not the address, is the working intake path.** `studio@…` is a
     * forwarding address and nothing on this site sends mail: there is no SMTP
     * client, no provider and no autoresponder anywhere in the codebase. Someone who
     * emails gets no acknowledgement and no reference number, which is exactly what
     * `POST /api/design-requests` exists to prevent — it returns a tracked
     * `IPR-######` reference the customer can quote. `contact.intro` in the locale
     * bundle says this to the reader in both languages.
     */
    email: 'info@ciptasarim.com',
    /** Published on the contact page and in the footer. No autoresponder. */
    phone: '+90 000 000 00 00',
    address: ['Türkiye'] as const,
    hours: 'Pazartesi–Cuma, 09:00–18:00 TRT (GMT+3)',
  },

  legal: {
    /**
     * ⚠️ **PLACEHOLDER — this is not a tax number and must not be treated as one.**
     *
     * Deliberately not a plausible-looking 10-digit TCVKNV. A real-format number
     * here would be a fabricated legal identifier on a site that takes money, which
     * is the same failure as a fabricated specification: plausible, checkable-looking,
     * and wrong. `TR VATANUMARASI` is obviously not a number, so it cannot be
     * mistaken for one or quoted on an invoice by mistake.
     *
     * Replace it with the real 10-digit TCVKNV before the first invoice. The
     * `licences.taxNotice` in the locale bundle already says prices exclude VAT, so
     * this string appears on the invoice and nowhere the reader might rely on the
     * arithmetic.
     */
    vat: 'TR VATANUMARASI',
    vatPlaceholder: true,
    /** Registered entity for the licence agreement and terms of sale. */
    company: 'Çip Tasarım',
    /** Governing law, named so a customer reads it before checkout rather than after. */
    governingLaw: 'Türkiye Cumhuriyeti hukuku',
    /** The public IP and licence terms the checkout links to. */
    licenceTermsRoute: '/lisanslar/sartlar',
    privacyRoute: '/gizlilik',
    termsRoute: '/sartlar',
  },

  founded: 2026,
} as const

/**
 * Header navigation. `to` is a route; these drive the header and are mirrored (with
 * extras) in the footer.
 *
 * Order is the order somebody uses the site: see what exists, check the numbers, work
 * out what it costs, then get in touch.
 */
export const primaryNav = [
  { label: 'Cores', to: '/cekirdekler' },
  { label: 'Tools', to: '/hesaplayicilar' },
  { label: 'Process', to: '/teknoloji' },
  { label: 'Licences', to: '/lisanslar' },
  { label: 'Pricing', to: '/fiyatlandirma' },
  { label: 'FAQ', to: '/sss' },
  { label: 'Articles', to: '/yazilar' },
  { label: 'About', to: '/hakkimizda' },
  { label: 'Contact', to: '/iletisim' },
] as const

/**
 * Footer navigation, in three columns.
 *
 * `heading` is prose and therefore lives here rather than in the locale bundle: it
 * is a per-column title, not a reused label, and the bundle's rule is that a string
 * must fit in a nav bar or a filter chip *and be reused*. These fit in neither and
 * repeat nowhere.
 */
export const footerNav = [
  {
    heading: { tr: 'Katalog', en: 'Catalogue' },
    links: [
      { label: { tr: 'Tüm çekirdekler', en: 'All cores' }, to: '/cekirdekler' },
      { label: { tr: 'Yazılım RTL', en: 'Soft RTL' }, to: '/cekirdekler?tur=yazilim-rtl' },
      { label: { tr: 'Standart hücre makroları', en: 'Hard macros' }, to: '/cekirdekler?tur=standart-hucre' },
      { label: { tr: 'Analog ve karma sinyal', en: 'Analog & mixed-signal' }, to: '/cekirdekler?tur=analog' },
      { label: { tr: 'Doğrulama kolateralı', en: 'Verification collateral' }, to: '/cekirdekler?tur=doğrulama' },
      { label: { tr: 'Karşılaştır', en: 'Compare' }, to: '/cekirdekler/karsilastir' },
    ],
  },
  {
    heading: { tr: 'Mühendislik', en: 'Engineering' },
    links: [
      { label: { tr: 'Hesaplayıcılar', en: 'Calculators' }, to: '/hesaplayicilar' },
      { label: { tr: 'Teknoloji düğümleri', en: 'Process nodes' }, to: '/teknoloji' },
      { label: { tr: 'Teknik yazılar', en: 'Technical notes' }, to: '/yazilar' },
    ],
  },
  {
    heading: { tr: 'Ticari', en: 'Commercial' },
    links: [
      { label: { tr: 'Lisans türleri', en: 'Licence tiers' }, to: '/lisanslar' },
      { label: { tr: 'Fiyatlandırma', en: 'Pricing' }, to: '/fiyatlandirma' },
      { label: { tr: 'Teklif isteyin', en: 'Request a quote' }, to: '/teklif' },
      { label: { tr: 'Hakkımızda', en: 'About' }, to: '/hakkimizda' },
      { label: { tr: 'İletişim', en: 'Contact' }, to: '/iletisim' },
    ],
  },
  {
    heading: { tr: 'Yasal', en: 'Legal' },
    links: [
      { label: { tr: 'Lisans şartları', en: 'Licence terms' }, to: '/lisanslar/sartlar' },
      { label: { tr: 'Gizlilik', en: 'Privacy' }, to: '/gizlilik' },
      { label: { tr: 'Fikri mülkiyet', en: 'Intellectual property' }, to: '/fikri-mulkiyet' },
    ],
  },
] as const

/**
 * The routes the legal bundle links to, exported so `site.ts` and the footer cannot
 * disagree about a path. A legal page that 404s is worse than one that is absent.
 */
export const legalRoutes = {
  licenceTerms: site.legal.licenceTermsRoute,
  privacy: site.legal.privacyRoute,
  terms: site.legal.termsRoute,
} as const