/**
 * Turkish — the source of truth for the locale bundle.
 *
 * `en.ts` is typed `Mirror<typeof tr>`, so every key here is a key there, and every
 * key there is a key here. Deleting a line from this file breaks the build in
 * `en.ts`, not at runtime.
 *
 * `as const` is what makes `Mirror<>` work: the object's literal types are the
 * contract. Drop it and `en` would only be checked against `{ home: string; ... }`,
 * which is exactly the completeness guarantee the mirror exists to provide.
 *
 * What belongs here: **strings that fit in a nav bar, a button, a filter chip or a
 * table header.** Anything longer than a label is prose and lives in `content/*.ts`
 * as a `T`. The test is length and reuse, not meaning.
 *
 * ⚠️ Sets whose *membership* matters are objects, never arrays — `Mirror<>` collapses
 * arrays to `never`, and a `Record<CoreKind, string>` is a key set generated from a
 * type, so adding a taxonomy member adds a required label rather than silently
 * shortening a list.
 */

import type { CoreKind, LicenseTier, FigureUnit, ProcessNode, PortDirection, PortKind, ToolId, BundleKind, DocumentFormat } from '../shared/types.ts'

export const tr = {
  /* ---------------------------------------------------------------- meta */
  meta: {
    siteName: 'Çip Tasarım',
    legalName: 'Çip Tasarım Yarı İletken IP',
    tagline: 'Doğrulamalı yarı iletken IP çekirdekleri',
    description:
      'RTL, standart hücre makroları, analog ve karma sinyal çözümleri ile doğrulama kolateralı. Lisanslama, teslim paketleri ve mühendislik hesaplayıcıları.',
  },

  /* ----------------------------------------------------------------- nav */
  nav: {
    home: 'Ana sayfa',
    cores: 'Çekirdekler',
    core: 'Çekirdek',
    tools: 'Hesaplayıcılar',
    process: 'Teknoloji',
    licences: 'Lisanslar',
    pricing: 'Fiyatlandırma',
    faq: 'Sıkça sorulan sorular',
    articles: 'Teknik yazılar',
    about: 'Hakkımızda',
    contact: 'İletişim',
    request: 'Teklif isteyin',
    account: 'Hesabım',
    cart: 'Sepet',
    menu: 'Menü',
    close: 'Kapat',
    skipToContent: 'İçeriğe geç',
    breadcrumb: 'Site haritası',
  },

  /* ------------------------------------------------------------- common */
  common: {
    readMore: 'Devamını oku',
    learnMore: 'Ayrıntıları gör',
    viewAll: 'Tümünü gör',
    back: 'Geri',
    next: 'İleri',
    previous: 'Önceki',
    loading: 'Yükleniyor',
    error: 'Hata',
    retry: 'Tekrar dene',
    save: 'Kaydet',
    cancel: 'Vadetçi',
    cancelAction: 'Vazgeç',
    confirm: 'Onayla',
    delete: 'Sil',
    edit: 'Düzenle',
    download: 'İndir',
    copy: 'Kopyala',
    copied: 'Kopyalandı',
    share: 'Paylaş',
    search: 'Ara',
    searchPlaceholder: 'Çekirdek, aile veya etiket ara',
    noResults: 'Sonuç bulunamadı',
    noResultsHint: 'Farklı bir terim deneyin veya filtreleri temizleyin.',
    clearFilters: 'Filtreleri temizle',
    filter: 'Filtre',
    filters: 'Filtreler',
    sort: 'Sırala',
    showing: 'Gösterilen',
    of: '/',
    results: 'sonuç',
    all: 'Tümü',
    none: 'Hiçbiri',
    optional: 'isteğe bağlı',
    required: 'zorunlu',
    yes: 'Evet',
    no: 'Hayır',
    unknown: 'Bilinmiyor',
    from: 'Başlangıç',
    to: 'Bitiş',
    email: 'E-posta',
    name: 'Ad soyad',
    company: 'Şirket',
    phone: 'Telefon',
    message: 'Mesaj',
    submit: 'Gönder',
    submitted: 'Gönderildi',
    close: 'Kapat',
  },

  /* --------------------------------------------------------------- home */
  home: {
    heroTitle: 'Tasarımınızın üzerine inşa edilecek doğrulanmış IP',
    heroBody:
      'Her çekirdek, kaynağı belirtilmiş ölçümler ve açıkça işaretlenmiş modellerle birlikte teslim edilir. Karakterize edilmemiş bir sayı hiçbir zaman tahmin edilerek doldurulmaz.',
    heroHint: 'İmlecinizi gezdirin',
    browseCores: 'Çekirdeklere göz at',
    openTools: 'Hesaplayıcıları aç',
    statsCores: 'Çekirdek',
    statsNodes: 'Teknoloji düğümü',
    statsKinds: 'IP türü',
    provenanceTitle: 'Her sayının kaydı var',
    provenanceBody:
      'Bir sayının ölçülmüş, modellenmiş ya da karakterize edilmemiş olduğu, sayının kendisi kadar görünür. Doğrulanamayan bir değer dönüştürülmez.',
    featuredTitle: 'Öne çıkan çekirdekler',
    featuredBody: 'En çok değerlendirilen aile ve çekirdekler.',
    toolsTitle: 'Mühendislik hesaplayıcıları',
    toolsBody: 'Gecikme, güç, alan, verim ve maliyet modelleri. Varsayımlar her biri için açıkça yazılır.',
    processTitle: 'Teknoloji düğümü tablosu',
    processBody:
      'Geniş bir düğüm aralığı. Karakterize edilmemiş hücreler boş bırakılmaz, nedenleriyle birlikte listelenir.',
    faqTitle: 'Sıkça sorulan sorular',
  },

  /* -------------------------------------------------------------- cores */
  cores: {
    title: 'Çekirdekler',
    subtitle: 'Dört IP türü, dört ayrı spesifikasyon modeliyle.',
    kind: 'Tür',
    family: 'Aile',
    node: 'Teknoloji düğümü',
    interface: 'Arayüz',
    licence: 'Lisans',
    count: 'çekirdek',
    compare: 'Karşılaştır',
    compareHint: 'Karşılaştırma yalnızca aynı tür içinde anlamlıdır.',
    compareRequiresKind: 'Karşılaştırmak için aynı türden çekirdekler seçin.',
    compareClear: 'Karşılaştırmayı temizle',
    selectForComparison: 'Karşılaştırmaya ekle',
    removeFromComparison: 'Karşılaştırmadan çıkar',
    maxCompare: 'En fazla dört çekirdek karşılaştırılabilir.',
    noCores: 'Bu filtrelere uyan çekirdek bulunamadı.',
    ports: 'Portlar',
    portCount: 'port',
    deliverables: 'Teslim edilen dosyalar',
    documents: 'Dosyalar',
    spec: 'Teknik özellikler',
    specByNode: 'Düğüme göre',
    relatedNodes: 'Diğer düğümler',
    pdk: 'PDK referansı',
    pdkUnconfirmed: 'PDK sürümü doğrulanmadı',
    standard: 'Standart',
    notOfferedAtNode: 'Bu düğümde sunulmuyor',
    noDocuments: 'Bu lisans için teslim edilecek dosya yok.',
    licenceIncludes: 'Lisans kapsamında',
    licenceExcludes: 'Lisans kapsamı dışında',
    requestQuote: 'Bu çekirdek için teklif isteyin',
    enquiry: 'Soru',
  },

  /* -------------------------------------------------------- spec fields */
  /**
   * Per-kind specification field names, shared by the core detail's per-node
   * table and the comparison view. They sit inside the mirrored bundle because
   * both locales render them as table headers — unlike the taxonomy maps, which
   * a machine reads too.
   */
  specFields: {
    gateEquivalents: 'Kapı eşdeğeri',
    maxFrequency: 'Maks. frekans',
    power: 'Güç',
    density: 'Yoğunluk',
    macroArea: 'Makro alanı',
    enob: 'ENOB',
    sndr: 'SNDR',
    sampleRate: 'Örnekleme hızı',
    assertions: 'Assertion',
    coverage: 'Kapsam',
    inputRange: 'Giriş aralığı',
  },

  /* ------------------------------------------------- process columns */
  /**
   * The six figure columns of the process table (`content/processes.ts`), plus
   * the provenance column. Keyed by the field name, so a field added to
   * `Process` in `shared/types.ts` is a missing-label compile error here.
   */
  processColumns: {
    cellArea: 'Hücre alanı (µm²/GE)',
    defectDensity: 'Kusur yoğunluğu (cm⁻²)',
    metalLayers: 'Metal katmanı',
    vdd: 'Adi besleme gerilimi',
    leakage: 'Kaçak akım / µm',
    bondPitch: 'Bağ (bond) aralığı',
    source: 'Kaynak',
  },

  /* -------------------------------------------------------------- basis */
  basis: {
    measured: 'Ölçülen',
    modelled: 'Modellenen',
    uncharacterised: 'Karakterize edilmemiş',
    measuredLong: 'Karakterize edilmiş silikon üzerinde ölçüldü',
    modelledLong: 'Belirtilen modelden hesaplandı',
    uncharacterisedLong: 'Karakterize edilmemiş — tahmin edilmedi',
    source: 'Kaynak',
    noSource: 'Kaynak yok',
    conditions: 'Koşullar',
    model: 'Model',
    reason: 'Neden',
    conditionsUnknown: 'Koşul belirtilmemiş',
    legendTitle: 'Sayıların kaynağı',
    legendBody:
      'Bu sitedeki her mühendislik sayısı üç durumdan birindedir ve durumu sayının yanında yazılır.',
    basisNote:
      'Renk kodları yalnızca bilgilendirme amaçlıdır; her sayının durumu metin olarak da belirtilir.',
  },

  /* ----------------------------------------------------------- licences */
  licences: {
    title: 'Lisans türleri',
    subtitle: 'Teslim kapsamı, kullanım hakkı ve kısıtlar.',
    includes: 'Kapsam',
    excludes: 'Kapsam dışı',
    rights: 'Haklar',
    restrictions: 'Kısıtlar',
    seats: 'Eşzamanlı kullanıcı',
    unlimited: 'Sınırsız',
    tapeouts: 'Tapeout hakkı',
    tapeoutUnlimited: 'Sınırsız tapeout',
    perCore: 'Çekirdek başına',
    tier: 'Tür',
    buyNow: 'Satın al',
    getQuote: 'Teklif al',
    quoteOnly: 'Teklif üzerine',
    taxNotice:
      'Fiyatlara KDV dahil değildir. Yurt dışı teslimlerde uygulanan KDV rejimi, Türkiye’nin AB gümrük birliği ancak KDV üyesi olmaması nedeniyle standart bir tabloyla ifade edilemez.',
    taxNoticeShort: 'KDV dahil değil',
    compareTiers: 'Türleri karşılaştırın',
  },

  /* ----------------------------------------------------------- pricing */
  /**
   * The pricing page's copy.
   *
   * The page must stay in step with `corePricing` in `content/packages.ts`,
   * which is deliberately empty: the tier and bundle structure is defined, the
   * authored per-core prices are not, so every cell renders "on quote" instead
   * of a number nobody chose. These keys describe that state — the day the
   * table fills in, this section is the one copy that has to change with it.
   */
  pricing: {
    title: 'Fiyatlandırma',
    subtitle: 'Kademe ve teslim paketi yapısı tanımlıdır; çekirdek fiyatları teklif üzeredir.',
    intro:
      'Bu sitede bir fiyat, tahmin edilen bir sayı değil, yazılmış bir ticari karardır. Bu yüzden hiçbir çekirdek için önceden yazılmış bir fiyat yayımlanmamıştır: fiyat, dökümhane ve PDK revizyonuna ve teslim paketine göre teklif sırasında belirlenir.',
    tableNote:
      'Çekirdek fiyat tablosu (yazar fiyatlar) henüz doldurulmadı. Bu tablo doldurulana kadar her çekirdek, her kademe ve paket için teklif üzeredir — 0 değil, teklif üzerine.',
    multiplierNote:
      'Kademe çarpanları tanımlıdır: değerlendirme ×0,08, üretim ×1, çoklu kullanım ×2,6. Çarpanlar, yazar fiyat girildiği anda uygulanır.',
    core: 'Çekirdek',
  },

  /* -------------------------------------------------------------- cart */
  cart: {
    title: 'Sepet',
    empty: 'Sepetiniz boş.',
    emptyHint: 'Bir çekirdek seçtiğinizde lisansınızı burada göreceksiniz.',
    add: 'Sepete ekle',
    added: 'Sepete eklendi.',
    viewCart: 'Sepete git',
    item: 'Ürün',
    licence: 'Lisans türü',
    unitPrice: 'Birim fiyat',
    subtotal: 'Ara toplam',
    total: 'Toplam',
    remove: 'Sepetten çıkar',
    checkout: 'Ödemeye geç',
    continueShopping: 'Alışverişe devam et',
    coreIncludedIn: 'Teslim paketine dahil',
    quantityNote: 'Lisanslar çekirdek başına satılır; adet değiştirilemez.',
    emptyCannotCheckout: 'Sepet boş olduğu için ödeme başlatılamaz.',
  },

  /* ----------------------------------------------------------- checkout */
  checkout: {
    title: 'Ödeme',
    orderSummary: 'Sipariş özeti',
    details: 'İletişim bilgileri',
    account: 'Hesabınız',
    createAccount: 'Hesap oluştur',
    haveAccount: 'Hesabım var',
    guest: 'Misafir olarak devam et',
    mockNotice:
      'Bu bir deneme ödeme sağlayıcısıdır. Gerçek kart bilgisi istenmez ve hiçbir tahsilat yapılmaz.',
    payNow: 'Ödemeyi başlat',
    redirecting: 'Ödeme sağlayıcısına yönlendiriliyorsunuz',
    backToCart: 'Sepete dön',
    awaitingPayment: 'Ödeme bekleniyor',
    awaitingPaymentBody:
      'Siparişiniz oluşturuldu. B2B siparişlerde ödeme, proforma faturanın banka havalesiyle karşılanmasıyla tamamlanır.',
    paymentConfirmed: 'Ödeme onaylandı',
    paymentConfirmedBody: 'Siparişiniz tamamlandı ve teslim dosyaları hazır.',
    orderNumber: 'Sipariş no',
    failed: 'Ödeme başarısız',
    failedBody: 'Ödeme sağlayıcısı işlemi reddetti. Kredi kartı bilgisi bu sitede saklanmaz.',
    tryAgain: 'Tekrar dene',
    cancelled: 'İptal edildi',
    cancelConfirm:
      'Bu siparişi iptal etmek istediğinizden emin misiniz? Ödenmemiş bir sipariş geri alınamaz.',
    cancelBlocked: 'Ödenmiş bir sipariş buradan iptal edilemez. İade için bizimle iletişime geçin.',
  },

  /* -------------------------------------------------------------- auth */
  auth: {
    signIn: 'Giriş yap',
    signOut: 'Çıkış yap',
    signUp: 'Kayıt ol',
    email: 'E-posta',
    password: 'Parola',
    passwordHint: 'En az 10 karakter.',
    confirmPassword: 'Parola tekrarı',
    passwordMismatch: 'Parolalar eşleşmiyor.',
    invalidCredentials: 'E-posta veya parola hatalı.',
    emailTaken: 'Bu e-posta ile bir hesap zaten var.',
    noAccount: 'Hesabınız yok mu?',
    hasAccount: 'Zaten hesabınız var mı?',
    welcomeBack: 'Tekrar hoş geldiniz',
    createAccountIntro: 'Siparişlerinizi ve teslim dosyalarınızı hesabınızdan takip edin.',
    signInIntro: 'Siparişlerinizi ve indirme geçmişinizi görüntüleyin.',
    orContinueWith: 'veya',
  },

  /* ---------------------------------------------------------- downloads */
  downloads: {
    title: 'İndirmeler',
    empty: 'Henüz indirilebilir bir teslim yok.',
    emptyHint: 'Bir çekirdek lisansı satın alınca teslim dosyaları burada görünür.',
    order: 'Sipariş',
    date: 'Tarih',
    files: 'Dosyalar',
    downloadAll: 'Tümünü indir',
    downloadFile: 'İndir',
    downloadMissing: 'Bu dosya şu anda sunulamıyor.',
    downloadUnauthorised: 'Bu dosyaya erişim yetkiniz yok.',
    notFound: 'Dosya bulunamadı.',
    expiresNote: 'İndirme bağlantıları kalıcıdır; lisansınız sürdüğü sürece erişebilirsiniz.',
  },

  /* ------------------------------------------------------------ contact */
  contact: {
    title: 'İletişim',
    subtitle: 'Teknik sorular, lisanslama ve teklif talepleri.',
    intro:
      'Lisanslama ve teslim talepleri için formu kullanın. E-posta adresi yalnızca yönlendirme amaçlıdır; otomatik yanıt verilmez.',
    requestType: 'Talep türü',
    requestTypes: {
      quote: 'Teklif talebi',
      licence: 'Lisanslama sorusu',
      technical: 'Teknik soru',
      custom: 'Özel çekirdek',
      other: 'Diğer',
    },
    coreOfInterest: 'İlgilendiğiniz çekirdek',
    processNode: 'Teknoloji düğümü',
    messageLabel: 'Mesajınız',
    messageHint: 'Ne tasarlamayı hedefliyorsunuz, hangi düğümde, ne zaman ihtiyaç duyuyorsunuz?',
    send: 'Talebi gönder',
    success: 'Talebiniz alındı.',
    successBody: 'Referans numaranız aşağıda. Teknik bir yanıt genellikle iki iş günü içinde verilir.',
    reference: 'Referans',
    invalidEmail: 'Geçerli bir e-posta adresi girin.',
    requiredFields: 'Zorunlu alanları doldurun.',
    rateLimited: 'Çok fazla istek gönderildi. Lütfen biraz bekleyin.',
  },

  /* ------------------------------------------------------------- tools */
  tools: {
    title: 'Mühendislik hesaplayıcıları',
    subtitle: 'Her modelin varsayımları ve sınırları yazılıdır.',
    selectPrompt: 'Bir model seçin',
    inputs: 'Girdiler',
    results: 'Sonuçlar',
    shareLink: 'Bağlantıyı paylaş',
    shareCopied: 'Bağlantı kopyalandı.',
    reset: 'Sıfırla',
    engineeringNotice:
      'Bu sonuçlar bir modelden hesaplanır ve bir ölçüm değildir. Tasarım kararınızı bu sayılara dayandırmayın; üretim kararınızı karakterize edilmiş silikon verisine dayandırın.',
    openTool: 'Hesaplayıcıyı aç',
    invalidInput: 'Girdiler geçerli aralıkta değil.',
    resultNote: 'Not',
    methodology: 'Yöntem',
    methodologyBody:
      'Model, kaynakları ve geçerli olduğu aralıklar aşağıda verilmiştir. Varsayım değiştirilirse sonuç değişir.',
    byNode: 'Düğüme göre sonuçlar',
  },

  /* ------------------------------------------------------------- about */
  about: {
    title: 'Hakkımızda',
    subtitle: 'Bu çekirdekler nasıl doğrulanıyor?',
    methodTitle: 'Yöntemimiz',
    methodBody:
      'Her sayının üç durumdan birinde olduğunu söyleriz: ölçülmüş, modellenmiş ya da karakterize edilmemiş. Üçüncüsü en sık görülendir ve gizlenmez.',
    noFabrication:
      'Henüz ölçülmemiş bir değer uydurulmaz. Bunun yerine nedeni yazılır. Bir müşteri, karakterize edilmemiş bir veriyi sıfırdan ayırt edemeyeceği için bu, tahmin etmekten daha az güvenlidir.',
    calibrationTitle: 'Kalibrasyon',
    calibrationBody:
      'Bu sitedeki modeller, karakterize edilmiş silikonumuzla denetlenebilir değildir. Teknoloji düğümü tablosundaki her hücre, kaynağı doğrulanana kadar kaynak bilgisi olmadan listelenir.',
    trustTitle: 'Neden bu kadar çok “veri yok”?',
    trustBody:
      'Bir IP sağlayıcısının satış yapmak için her hücreyi doldurması gerekmez. Doldurulmamış hücre, müşterinin satın alma kararını kendi verisiyle verebilmesi için vardır.',
  },

  /* --------------------------------------------------------------- faq */
  faq: {
    title: 'Sıkça sorulan sorular',
    subtitle: 'Lisanslama, teslim ve teknik doğrulama.',
    stillHaveQuestions: 'Başka sorunuz mu var?',
    contactUs: 'İletişime geçin',
    /** Filter-chip labels for the categories in `content/faqs.ts`. */
    categoryNames: {
      licenses: 'Lisanslama',
      delivery: 'Teslim',
      data: 'Veri ve kanıt',
      payment: 'Ödeme',
      custom: 'Özel işler',
    },
  },

  /* ----------------------------------------------------------- articles */
  articles: {
    title: 'Teknik yazılar',
    subtitle: 'Tasarım mühendisleri için notlar.',
    readTime: 'dk okuma',
    published: 'Yayımlanma',
    related: 'İlgili yazılar',
    back: 'Yazılara dön',
  },

  /* ------------------------------------------------------------ errors */
  errors: {
    notFound: 'Sayfa bulunamadı',
    notFoundBody: 'Aradığınız sayfa taşınmış ya da hiç var olmamış olabilir.',
    goHome: 'Ana sayfaya dön',
    serverError: 'Sunucu hatası',
    serverErrorBody: 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.',
    unauthorised: 'Yetkiniz yok',
    unauthorisedBody: 'Bu içeriği görüntülemek için giriş yapmanız gerekiyor.',
    forbidden: 'Erişim reddedildi',
  },

  /* ------------------------------------------------------------ footer */
  footer: {
    rights: 'Tüm hakları saklıdır.',
    company: 'Şirket',
    resources: 'Kaynaklar',
    legal: 'Yasal',
    privacy: 'Gizlilik',
    terms: 'Şartlar',
    licenceTerms: 'Lisans şartları',
    ipNotice: 'Fikri mülkiyet',
    contactEmail: 'E-posta',
    madeIn: 'Türkiye’de tasarlandı',
  },
} as const

export type TrShape = typeof tr

/* -------------------------------------------------------------------------- */
/* Taxonomies — generated key sets, not hand-written lists                     */
/* -------------------------------------------------------------------------- */

/**
 * A core kind's display name.
 *
 * A `Record<CoreKind, string>` rather than an array, and that is the whole reason
 * `Mirror<>` collapses arrays to `never`. Here the key set is *derived from the
 * taxonomy type*, so adding `'analog-mixed-signal'` to `CORE_KINDS` produces a
 * compile error naming exactly one missing key, rather than a list that quietly
 * renders one kind as `undefined`.
 */
export const coreKinds: Record<CoreKind, string> = {
  'soft-rtl': 'Yazılım RTL',
  'hard-macro': 'Standart hücre makrosu',
  analog: 'Analog / karma sinyal',
  verification: 'Doğrulama kolateralı',
}

/** A one-line explanation of what a kind is for. Longer than a chip, so `T`. */
export const coreKindDescriptions: Record<CoreKind, { tr: string; en: string }> = {
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
}

/** Licence tier names. */
export const licenseTiers: Record<LicenseTier, string> = {
  evaluation: 'Değerlendirme',
  production: 'Üretim',
  'multi-use': 'Çok kullanımlı',
}

/** Process node label. Digits stay ASCII and stay unpunctuated: `7nm`, not `7 nm`. */
export const processNodes: Record<ProcessNode, string> = {
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
}

/** Delivery bundles. */
export const bundleKinds: Record<BundleKind, string> = {
  rtl: 'RTL + kısıtlamalar + UVM',
  layout: 'Fiziksel tasarım (GDSII / OASIS)',
  netlist: 'Kapı seviyesi netlist + SDF + Liberty',
  porting: 'Taşıma (porting) kiti',
}

/** Calculator names. */
export const toolIds: Record<ToolId, string> = {
  'critical-path': 'Kritik yol gecikmesi',
  'dynamic-power': 'Dinamik güç',
  leakage: 'Kaçak akım',
  area: 'Çip alanı',
  yield: 'Verim',
  'cost-per-die': 'İyi çip başına maliyet',
  slack: 'Kurulum ve tutma payı',
  'licence-economics': 'Lisans ekonomisi',
}

/** Port direction and kind. */
export const portDirections: Record<PortDirection, string> = {
  in: 'giriş',
  out: 'çıkış',
  inout: 'giriş/çıkış',
}

export const portKinds: Record<PortKind, string> = {
  clock: 'saat',
  reset: 'sıfırlama',
  data: 'veri',
  control: 'kontrol',
  power: 'güç',
  analog: 'analog',
  debug: 'hata ayıklama',
}

/**
 * Unit labels.
 *
 * Symbols, not names — `GHz`, not `gigahertz` — because a spec table mixing spelled-out
 * and symbol units is harder to scan, and because the symbol is what appears on the
 * datasheet the reader has open next to this page. Display *decimals and grouping* are
 * handled by `Intl`, not here.
 */
export const figureUnits: Record<FigureUnit, string> = {
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
  fF: 'fF',
  V: 'V',
  nA: 'nA',
  ns: 'ns',
  bit: 'bit',
  dB: 'dB',
  LSB: 'LSB',
  percent: '%',
  ratio: '×',
  perCm2: 'cm⁻²',
  ohm: 'Ω',
  celsius: '°C',
  nm: 'nm',
  um: 'µm',
  mm: 'mm',
  ps: 'ps',
  count: 'adet',
  USD: '$',
}

/** Delivery file formats. Also symbols and extensions, for the same reason. */
export const documentFormats: Record<DocumentFormat, string> = {
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
  view: 'Görünüm',
  pdf: 'PDF',
  xlsx: 'Excel',
  zip: 'ZIP',
  tgz: 'TGZ',
}
