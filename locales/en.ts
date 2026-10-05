/**
 * English — the mirror of `tr.ts`, and a compile error if it drifts.
 *
 * `Mirror<TrShape>` does two jobs. A key here with no counterpart in `tr` is an
 * excess-property error; a key in `tr` with no counterpart here is a missing-property
 * error. The site cannot ship half translated in either direction, and it cannot ship
 * with a Turkish label rendered in English or the reverse.
 *
 * Note the "direction" of authority: `tr` is the source and `en` is derived from it.
 * That is the opposite of the usual pattern and it is deliberate — Turkish is the
 * primary market here, so Turkish is what gets written first and English is what has
 * to keep up. A translation workflow that requires the secondary language to be
 * authored first inverts the actual priority.
 */

import type { Mirror } from '../shared/i18n.ts'
import type { TrShape } from './tr.ts'

export const en: Mirror<TrShape> = {
  /* ---------------------------------------------------------------- meta */
  meta: {
    siteName: 'Çip Tasarım',
    legalName: 'Çip Tasarım Semiconductor IP',
    tagline: 'Characterised semiconductor IP cores',
    description:
      'RTL, standard-cell macros, analog and mixed-signal solutions, and verification collateral. Licensing, delivery bundles and engineering calculators.',
  },

  /* ----------------------------------------------------------------- nav */
  nav: {
    home: 'Home',
    cores: 'Cores',
    core: 'Core',
    tools: 'Calculators',
    process: 'Process',
    licences: 'Licences',
    pricing: 'Pricing',
    faq: 'FAQ',
    articles: 'Technical notes',
    about: 'About',
    contact: 'Contact',
    request: 'Request a quote',
    account: 'Account',
    cart: 'Cart',
    menu: 'Menu',
    close: 'Close',
    skipToContent: 'Skip to content',
    breadcrumb: 'Breadcrumb',
  },

  /* ------------------------------------------------------------- common */
  common: {
    readMore: 'Read more',
    learnMore: 'Learn more',
    viewAll: 'View all',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    loading: 'Loading',
    error: 'Error',
    retry: 'Try again',
    save: 'Save',
    cancel: 'Cancel order',
    cancelAction: 'Cancel',
    confirm: 'Confirm',
    delete: 'Delete',
    edit: 'Edit',
    download: 'Download',
    copy: 'Copy',
    copied: 'Copied',
    share: 'Share',
    search: 'Search',
    searchPlaceholder: 'Search core, family or tag',
    noResults: 'No results found',
    noResultsHint: 'Try a different term, or clear the filters.',
    clearFilters: 'Clear filters',
    filter: 'Filter',
    filters: 'Filters',
    sort: 'Sort',
    showing: 'Showing',
    of: 'of',
    results: 'results',
    all: 'All',
    none: 'None',
    optional: 'optional',
    required: 'required',
    yes: 'Yes',
    no: 'No',
    unknown: 'Unknown',
    from: 'From',
    to: 'To',
    email: 'Email',
    name: 'Name',
    company: 'Company',
    phone: 'Phone',
    message: 'Message',
    submit: 'Submit',
    submitted: 'Submitted',
    close: 'Close',
  },

  /* --------------------------------------------------------------- home */
  home: {
    heroTitle: 'Characterised IP to build your design on',
    heroBody:
      'Every core ships with sourced measurements and models labelled as such. A number we have not characterised is never filled in with an estimate.',
    browseCores: 'Browse cores',
    openTools: 'Open the calculators',
    statsCores: 'Cores',
    statsNodes: 'Process nodes',
    statsKinds: 'IP kinds',
    provenanceTitle: 'Every number carries its provenance',
    provenanceBody:
      'Whether a figure is measured, modelled or uncharacterised is as visible as the figure itself. An unverifiable value is never rounded into place.',
    featuredTitle: 'Featured cores',
    featuredBody: 'The families and cores most often evaluated.',
    toolsTitle: 'Engineering calculators',
    toolsBody: 'Delay, power, area, yield and cost models. The assumptions are written out for each one.',
    processTitle: 'Process node table',
    processBody:
      'A broad range of nodes. Cells that are not characterised are not left blank — they are listed with the reason.',
    faqTitle: 'Frequently asked questions',
  },

  /* -------------------------------------------------------------- cores */
  cores: {
    title: 'Cores',
    subtitle: 'Four kinds of IP, four incompatible specification models.',
    kind: 'Kind',
    family: 'Family',
    node: 'Process node',
    interface: 'Interface',
    licence: 'Licence',
    count: 'cores',
    compare: 'Compare',
    compareHint: 'Comparison is only meaningful within one kind.',
    compareRequiresKind: 'Select cores of the same kind to compare.',
    compareClear: 'Clear comparison',
    selectForComparison: 'Add to comparison',
    removeFromComparison: 'Remove from comparison',
    maxCompare: 'Up to four cores can be compared.',
    noCores: 'No cores match these filters.',
    ports: 'Ports',
    portCount: 'ports',
    deliverables: 'Delivered files',
    documents: 'Files',
    spec: 'Specifications',
    specByNode: 'By node',
    relatedNodes: 'Other nodes',
    pdk: 'PDK reference',
    pdkUnconfirmed: 'PDK revision unconfirmed',
    standard: 'Standard',
    notOfferedAtNode: 'Not offered at this node',
    noDocuments: 'No files are delivered under this licence.',
    licenceIncludes: 'Included in the licence',
    licenceExcludes: 'Not included in the licence',
    requestQuote: 'Request a quote for this core',
    enquiry: 'Enquiry',
  },

  /* -------------------------------------------------------------- basis */
  basis: {
    measured: 'Measured',
    modelled: 'Modelled',
    uncharacterised: 'Not characterised',
    measuredLong: 'Measured on characterised silicon',
    modelledLong: 'Computed from the stated model',
    uncharacterisedLong: 'Not characterised — not estimated',
    source: 'Source',
    noSource: 'No source',
    conditions: 'Conditions',
    model: 'Model',
    reason: 'Reason',
    conditionsUnknown: 'No conditions stated',
    legendTitle: 'Where these numbers come from',
    legendBody:
      'Every engineering figure on this site is in one of three states, and the state is written next to the number.',
    basisNote: 'Colour coding is a secondary cue only; every figure states its state in text.',
  },

  /* ----------------------------------------------------------- licences */
  licences: {
    title: 'Licence tiers',
    subtitle: 'Delivery scope, usage rights and restrictions.',
    includes: 'Included',
    excludes: 'Not included',
    rights: 'Rights',
    restrictions: 'Restrictions',
    seats: 'Concurrent seats',
    unlimited: 'Unlimited',
    tapeouts: 'Tapeout rights',
    tapeoutUnlimited: 'Unlimited tapeouts',
    perCore: 'per core',
    tier: 'Tier',
    buyNow: 'Buy now',
    getQuote: 'Get a quote',
    quoteOnly: 'On quote',
    taxNotice:
      'Prices exclude VAT. The VAT treatment of an exported licence cannot be expressed as a standard table, because Türkiye is in the EU customs union but is not an EU VAT member.',
    taxNoticeShort: 'Excl. VAT',
    compareTiers: 'Compare the tiers',
  },

  /* -------------------------------------------------------------- cart */
  cart: {
    title: 'Cart',
    empty: 'Your cart is empty.',
    emptyHint: 'Choose a core and you will see its licences here.',
    item: 'Item',
    licence: 'Licence tier',
    unitPrice: 'Unit price',
    subtotal: 'Subtotal',
    total: 'Total',
    remove: 'Remove from cart',
    checkout: 'Checkout',
    continueShopping: 'Continue browsing',
    coreIncludedIn: 'Included in the delivery bundle',
    quantityNote: 'Licences are sold per core; the quantity cannot be changed.',
    emptyCannotCheckout: 'Checkout cannot start while the cart is empty.',
  },

  /* ----------------------------------------------------------- checkout */
  checkout: {
    title: 'Checkout',
    orderSummary: 'Order summary',
    details: 'Contact details',
    account: 'Your account',
    createAccount: 'Create an account',
    haveAccount: 'I have an account',
    guest: 'Continue as a guest',
    mockNotice:
      'This is a test payment provider. No real card details are requested and nothing is charged.',
    payNow: 'Start payment',
    redirecting: 'Redirecting you to the payment provider',
    backToCart: 'Back to cart',
    awaitingPayment: 'Awaiting payment',
    awaitingPaymentBody:
      'Your order has been created. B2B orders are settled by bank transfer against a proforma invoice.',
    paymentConfirmed: 'Payment confirmed',
    paymentConfirmedBody: 'Your order is complete and the delivery files are ready.',
    orderNumber: 'Order no.',
    failed: 'Payment failed',
    failedBody: 'The payment provider declined the transaction. Card details are not stored on this site.',
    tryAgain: 'Try again',
  },

  /* -------------------------------------------------------------- auth */
  auth: {
    signIn: 'Sign in',
    signOut: 'Sign out',
    signUp: 'Create an account',
    email: 'Email',
    password: 'Password',
    passwordHint: 'At least 10 characters.',
    confirmPassword: 'Confirm password',
    passwordMismatch: 'The passwords do not match.',
    invalidCredentials: 'Email or password is incorrect.',
    emailTaken: 'An account with that email already exists.',
    noAccount: 'No account yet?',
    hasAccount: 'Already have an account?',
    welcomeBack: 'Welcome back',
    createAccountIntro: 'Track your orders and delivery files from your account.',
    signInIntro: 'View your orders and download history.',
    orContinueWith: 'or',
  },

  /* ---------------------------------------------------------- downloads */
  downloads: {
    title: 'Downloads',
    empty: 'Nothing to download yet.',
    emptyHint: 'Buy a core licence and its delivery files appear here.',
    order: 'Order',
    date: 'Date',
    files: 'Files',
    downloadAll: 'Download all',
    downloadFile: 'Download',
    downloadMissing: 'This file is not available right now.',
    downloadUnauthorised: 'You are not entitled to this file.',
    notFound: 'File not found.',
    expiresNote: 'Download links do not expire; you keep access for as long as the licence runs.',
  },

  /* ------------------------------------------------------------ contact */
  contact: {
    title: 'Contact',
    subtitle: 'Technical questions, licensing and quote requests.',
    intro:
      'Please use the form for licensing and delivery enquiries. The email address is a forwarding address only and receives no automatic reply.',
    requestType: 'Enquiry type',
    requestTypes: {
      quote: 'Quote request',
      licence: 'Licensing question',
      technical: 'Technical question',
      custom: 'Custom core',
      other: 'Other',
    },
    coreOfInterest: 'Core of interest',
    processNode: 'Process node',
    messageLabel: 'Your message',
    messageHint: 'What are you designing, at which node, and by when do you need it?',
    send: 'Send enquiry',
    success: 'Your enquiry has been received.',
    successBody: 'Your reference is below. A technical reply usually takes two working days.',
    reference: 'Reference',
    invalidEmail: 'Enter a valid email address.',
    requiredFields: 'Please fill in the required fields.',
    rateLimited: 'Too many requests. Please wait a moment.',
  },

  /* ------------------------------------------------------------- tools */
  tools: {
    title: 'Engineering calculators',
    subtitle: 'Every model states its assumptions and its limits.',
    selectPrompt: 'Select a model',
    inputs: 'Inputs',
    results: 'Results',
    shareLink: 'Share this link',
    shareCopied: 'Link copied.',
    reset: 'Reset',
    engineeringNotice:
      'These results are computed from a model and are not measurements. Do not base a design decision on them; base a production decision on characterised silicon data.',
    openTool: 'Open calculator',
    invalidInput: 'Inputs are outside the valid range.',
    resultNote: 'Note',
    methodology: 'Method',
    methodologyBody:
      'The model, its sources and the range over which it holds are given below. Change an assumption and the result changes with it.',
    byNode: 'Results by node',
  },

  /* ------------------------------------------------------------- about */
  about: {
    title: 'About',
    subtitle: 'How are these cores verified?',
    methodTitle: 'Our method',
    methodBody:
      'We say which of three states every number is in: measured, modelled, or not characterised. The third is the most common and is not hidden.',
    noFabrication:
      'A value we have not measured is not invented. The reason is written instead. A customer cannot tell an uncharacterised figure from a zero, which is exactly why it is safer to say so than to guess.',
    calibrationTitle: 'Calibration',
    calibrationBody:
      'The models on this site cannot be checked against characterised silicon of our own. Every cell in the process node table is listed without a source until it has been confirmed.',
    trustTitle: 'Why is so much marked “no data”?',
    trustBody:
      'An IP vendor does not have to fill in every cell to sell. The empty cells exist so a customer can make the buying decision against their own data.',
  },

  /* --------------------------------------------------------------- faq */
  faq: {
    title: 'Frequently asked questions',
    subtitle: 'Licensing, delivery and technical verification.',
    stillHaveQuestions: 'Still have a question?',
    contactUs: 'Get in touch',
  },

  /* ----------------------------------------------------------- articles */
  articles: {
    title: 'Technical notes',
    subtitle: 'Notes for design engineers.',
    readTime: 'min read',
    published: 'Published',
    related: 'Related notes',
    back: 'Back to notes',
  },

  /* ------------------------------------------------------------ errors */
  errors: {
    notFound: 'Page not found',
    notFoundBody: 'The page you asked for may have moved, or may never have existed.',
    goHome: 'Back to the home page',
    serverError: 'Server error',
    serverErrorBody: 'Something went wrong. Please try again.',
    unauthorised: 'Not signed in',
    unauthorisedBody: 'You need to sign in to view this content.',
    forbidden: 'Access denied',
  },

  /* ------------------------------------------------------------ footer */
  footer: {
    rights: 'All rights reserved.',
    company: 'Company',
    resources: 'Resources',
    legal: 'Legal',
    privacy: 'Privacy',
    terms: 'Terms',
    licenceTerms: 'Licence terms',
    ipNotice: 'Intellectual property',
    contactEmail: 'Email',
    madeIn: 'Designed in Türkiye',
  },
}

export type EnShape = typeof en

/* -------------------------------------------------------------------------- */
/* Taxonomies                                                                  */
/* -------------------------------------------------------------------------- */

export const coreKinds = {
  'soft-rtl': 'Soft RTL',
  'hard-macro': 'Hard macro',
  analog: 'Analog / mixed-signal',
  verification: 'Verification collateral',
} as const

export const coreKindDescriptions = {
  'soft-rtl': {
    tr: 'Sentezlenebilir RTL kaynağı, zamanlama kısıtlamaları ve doğrulama ortamı. Alan ve frekans, hedef kütüphaneye göre değişir.',
    en: 'Synthesisable RTL source with timing constraints and a verification environment. Area and frequency depend on the target library.',
  },
  'hard-macro': {
    tr: 'Fiziksel olarak karakterize edilmiş, PDK’ya bağlı standart hücre. Alan ve frekans silikondan gelir; taşınabilir bir kapı sayısı yoktur.',
    en: 'Physically characterised, PDK-bound standard cell. Area and frequency come from the silicon; there is no portable gate count.',
  },
  analog: {
    tr: 'Karma sinyal çözüm. Alan ve frekans yerine ENOB, SNDR ve örnekleme hızı karakterize edilir.',
    en: 'Mixed-signal solution. ENOB, SNDR and sample rate are characterised instead of area and frequency.',
  },
  verification: {
    tr: 'Doğrulama ortamı, assertion ve kapsam kolateralı. Fiziksel hiçbir ölçüsü yoktur ve karşılaştırılamaz.',
    en: 'Verification environment, assertions and coverage collateral. It has no physical figures at all and is not comparable.',
  },
} as const

export const licenseTiers = {
  evaluation: 'Evaluation',
  production: 'Production',
  'multi-use': 'Multi-use',
} as const

/** Digits stay ASCII in English too: `7nm`, matching the Turkish. */
export const processNodes = {
  '180nm': '180 nm',
  '130nm': '130 nm',
  '90nm': '90 nm',
  '65nm': '65 nm',
  '40nm': '40 nm',
  '28nm': '28 nm',
  '22nm': '22 nm',
  '16nm': '16 nm',
  '14nm': '14 nm',
  '12nm': '12 nm',
  '7nm': '7 nm',
  '5nm': '5 nm',
  '3nm': '3 nm',
  '2nm': '2 nm',
} as const

export const bundleKinds = {
  rtl: 'RTL + constraints + UVM',
  layout: 'Physical design (GDSII / OASIS)',
  netlist: 'Gate-level netlist + SDF + Liberty',
  porting: 'Porting kit',
} as const

export const toolIds = {
  'critical-path': 'Critical-path delay',
  'dynamic-power': 'Dynamic power',
  leakage: 'Leakage current',
  area: 'Die area',
  yield: 'Yield',
  'cost-per-die': 'Cost per good die',
  slack: 'Setup and hold slack',
  'licence-economics': 'Licence economics',
} as const

export const portDirections = {
  in: 'input',
  out: 'output',
  inout: 'in/out',
} as const

export const portKinds = {
  clock: 'clock',
  reset: 'reset',
  data: 'data',
  control: 'control',
  power: 'power',
  analog: 'analog',
  debug: 'debug',
} as const

export const figureUnits = {
  GE: 'GE',
  um2: 'µm²',
  'um2/bit': 'µm²/bit',
  MHz: 'MHz',
  GHz: 'GHz',
  uW: 'µW',
  mW: 'mW',
  W: 'W',
  mA: 'mA',
  pJ: 'pJ',
  bit: 'bit',
  dB: 'dB',
  LSB: 'LSB',
  percent: '%',
  nm: 'nm',
  um: 'µm',
  ps: 'ps',
  count: 'count',
  USD: '$',
} as const

export const documentFormats = {
  verilog: 'Verilog',
  systemverilog: 'SystemVerilog',
  vhdl: 'VHDL',
  sdc: 'SDC',
  sva: 'SVA',
  uvm: 'UVM',
  tcl: 'Tcl',
  gds: 'GDSII',
  oas: 'OASIS',
  lef: 'LEF',
  def: 'DEF',
  lib: 'Liberty',
  netlist: 'Netlist',
  sdf: 'SDF',
  spef: 'SPEF',
  view: 'View',
  pdf: 'PDF',
  xlsx: 'Excel',
  zip: 'ZIP',
  tgz: 'TGZ',
} as const

export default en
