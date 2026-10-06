/**
 * The FAQ, as data — a flat list a category filter renders, not per-page fragments.
 *
 * Each answer is a `T`: one paragraph of Turkish prose with its English mirror.
 * Answers that need engineering nuance state it as prose rather than pointing at a
 * calculator, because this page must stay true with every number it references still
 * unpublished (the catalogue prices are deliberately null until quotes go out).
 *
 * The plan's rule shows up here as prose discipline: an answer never rounds an
 * uncharacterised figure into place. When the honest answer is "we have not measured
 * it", the answer says that, in both languages, and names the page where the
 * provenance is displayed.
 */

export interface Faq {
  category: 'licenses' | 'delivery' | 'data' | 'payment' | 'custom'
  /** Question — bilingual prose, rendered as a heading. */
  question: { tr: string; en: string }
  /** Answer — bilingual prose. If it names a page, name the real route. */
  answer: { tr: string; en: string }
}

export const faqs: readonly Faq[] = [
  /* --------------------------------------------------------------- licenses */
  {
    category: 'licenses',
    question: {
      tr: 'Bir çekirdek lisansıyla ne teslim ediyorsunuz?',
      en: 'What do we receive when we licence a core?',
    },
    answer: {
      tr: 'Teslim paketi, çekirdeğin türüne göre değişir ve çekirdek sayfasında dosyayla birlikte listelenir: yumuşak RTL çekirdekleri sentezlenebilir RTL kaynağı, zamanlama kısıtlamaları ve doğrulama ortamıyla; hard makrolar GDSII/OASIS, Liberty ve doğrulama raporlarıyla; analog makrolar layout, schematic ve karakterizasyon verileriyle; doğrulama çekirdekleri UVM ortamı, assertion seti ve kapsam kolateralıyla gelir. Her dosyanın formatı teslim öncesi bir manifestoda yazılıdır.',
      en: 'The delivery bundle depends on the core’s kind and is listed file by file on the core’s page: soft RTL cores ship synthesisable RTL source, timing constraints and a verification environment; hard macros ship GDSII/OASIS, Liberty and their validation reports; analog macros ship layout, schematic and characterisation data; verification cores ship a UVM environment, assertion sets and coverage collateral. Every file’s format is written in the manifest before delivery.',
    },
  },
  {
    category: 'licenses',
    question: {
      tr: 'Lisans kademesi arasındaki gerçek fark nedir?',
      en: 'What actually differs between the licence tiers?',
    },
    answer: {
      tr: 'Üç kademe vardır: değerlendirme, üretim ve çoklu kullanım. Değerlendirme lisansı çekirdeği bir tasarım çalışmasında değerlendirmenizi sağlar; dökülan (tapeout) hakkı vermez. Üretim lisansı tek bir dökulanı ve bundan kaynaklanan tüm üretimi kapsar. Çoklu kullanım, dökulan sayısı sınırsız olarak birkaç projede aynı çekirdeği kullanmanızı sağlar. Eşzamanlı kullanıcı sayısı ve teslim kapsamı tiers sayfasında tablo halinde yazılıdır.',
      en: 'There are three: evaluation, production and multi-use. The evaluation licence lets you assess a core in a design study but grants no tapeout right. The production licence covers a single tapeout and all manufacturing that follows from it. Multi-use covers several projects with unlimited tapeouts. Concurrent seats and delivery scope are tabulated on the licences page.',
    },
  },
  {
    category: 'licenses',
    question: {
      tr: 'Dökulan (tapeout) hakkı tam olarak neyi kapsıyor?',
      en: 'What exactly does the tapeout right cover?',
    },
    answer: {
      tr: 'Üretim lisansındaki dökulan hakkı, çekirdeğinizi bir kez silikona basmanızı ve bu silikondan sınırsız sayıda birim üretmenizi sağlar. Tasarımı başka bir PDK’ya veya başka bir şirkete nakletmeniz; ya da çekirdeği bir türev tasarımda tekrar dökulmanız, çoklu kullanım lisansının kapsamına girer.',
      en: 'The production licence’s tapeout right covers one journey to silicon and unlimited manufacturing of what that silicon yields. Re-porting the design to another PDK, moving it to another company, or taping out the same core in a derivative project all fall under the multi-use licence.',
    },
  },
  {
    category: 'licenses',
    question: {
      tr: 'Fiyatlar neden tabloda boş?',
      en: 'Why are the prices empty in the table?',
    },
    answer: {
      tr: 'Çünkü fiyatlar henüz yayımlanmadı — 0 değil, yok. Bir fiyat yayınlanmadan önce dökümhaneye ve PDK revizyonuna bağlı olarak teklif sırasında belirlenir; her çekirdek sayfasında "Bu çekirdek için teklif isteyin" yönlendirmesi vardır.',
      en: 'Because prices are not published yet — and not zero. Until a price is fixed it depends on the foundry and the PDK revision, and is established at quote time; every core page carries a "request a quote" call-to-action.',
    },
  },

  /* --------------------------------------------------------------- delivery */
  {
    category: 'delivery',
    question: {
      tr: 'Dosyaları nasıl alıyorum?',
      en: 'How are the files delivered?',
    },
    answer: {
      tr: 'Ödemeniz onaylandığında dosyalar, hesabınızdaki kütüphane sayfasında indirme linkleriyle görünür. Linkin süresi dolmaz: lisansınız sürdüğü sürece erişim açık kalır. Dosyalar bir e-posta eki olarak gönderilmez, çünkü teslim paketleri birden fazla yüz megabayt olabilir.',
      en: 'When your payment is confirmed the files appear with download links on the library page in your account. The links do not expire: access stays open as long as the licence runs. Files are never emailed as attachments, because bundles can run to hundreds of megabytes.',
    },
  },
  {
    category: 'delivery',
    question: {
      tr: 'Bir çekirdeği başka bir işlem düğümüne taşıyor musunuz?',
      en: 'Do you port a core to another process node?',
    },
    answer: {
      tr: 'Yumuşak RTL çekirdekleri zaten taşınabilirdir: verilen kısıtlamalar herhangi bir PDK’daki herhangi bir standart hücresel kütüphaneye sentezlenebilir. Hard makrolar için porting, ayrı bir çalışmadır ve porting teslim paketinin konusudur; naklettiğiniz düğümde alan ve frekans figürleri tekrar karakterize edilene kadar "karakterize edilmemiş" olarak listelenir.',
      en: 'Soft RTL cores are already portable: the constraints given synthesise into any standard-cell library on any PDK. For hard macros porting is a separate exercise, covered by the porting bundle; until the area and frequency figures have been re-characterised at your target node they are listed as "not characterised".',
    },
  },
  {
    category: 'delivery',
    question: {
      tr: 'Hard makro bu PDK’daki revizyonumla uyumlu mu?',
      en: 'Is a hard macro compatible with my PDK revision?',
    },
    answer: {
      tr: 'Her hard makro bir PDK referansını (dökümhane, düğüm, kit, revizyon) kaydeder. Makro sayfasındaki referansı sizin revizyonunuzla karşılaştırın. Revizyonun kayıtta yazılından fazla ileri geri dökümhaneyi kontrol etmemişsek "PDK revizyonu doğrulanmadı" olarak işaretlenir; bu durumda bir dökümhane kontrolü talep etmenizi öneririz.',
      en: 'Every hard macro records a PDK reference — the foundry, node, kit and revision. Compare that reference against your own on the macro’s page. Where we have not yet re-validated the rev with the foundry beyond what the record states, the PDK reference is flagged "revision unconfirmed", and in that case we recommend requesting a foundry check.',
    },
  },

  /* ------------------------------------------------------------------- data */
  {
    category: 'data',
    question: {
      tr: '"Ölçüldü", "modellendi" ve "karakterize edilmemiş" arasındaki fark nedir?',
      en: 'What is the difference between "measured", "modelled" and "not characterised"?',
    },
    answer: {
      tr: 'Üç durum, üç yoldur. Ölçüldü: karakterize edilmiş silikondan veya teslim ortamından gelen bir ölçüm — kaynağı ve koşulları belirtilir. Modellendi: belirtilen bir aritmetikten hesaplanmış; kaynak genelde "model X"tir. Karakterize edilmemiş: hiçbir değerimiz yoktur — bir neden yazarız ve alan 0 veya "yok" göstermez, hiçbir şey göstermez. Her sayıda bu durum metin halinde yanına yazılır.',
      en: 'Three states, three origins. Measured: from characterised silicon or the delivery kit, with its source and conditions stated. Modelled: computed from a stated piece of arithmetic; the source is usually the name of that arithmetic. Not characterised: we have no value and say so — the field is not 0 and not "n/a", it renders the reason. The state is written in text next to every figure.',
    },
  },
  {
    category: 'data',
    question: {
      tr: 'Tablodaki "no data" hücreleri ne anlama geliyor?',
      en: 'What does a "no data" cell in the tables mean?',
    },
    answer: {
      tr: 'Karakterize edilememiş demektir — 0 değil ve bir tahmin de değildir. IP satmış olmak için her hücreyi doldurmak zorunda değilsiniz; boş hücreler bilginin sınırlarını göstererek satışa katkı sağlar, çünkü müşteri kendi verisiyle işlem yapabilir ve boşluğu bilir.',
      en: 'It means the figure was never characterised — not 0 and not a filling estimate. An IP vendor does not have to fill in every cell to sell; empty cells help a customer by showing the information boundary so they can make a buying decision against their own data.',
    },
  },
  {
    category: 'data',
    question: {
      tr: 'Hesaplayıcılar gerçek tasarım kararları için kullanılabilir mi?',
      en: 'Can the calculators be used for real design decisions?',
    },
    answer: {
      tr: 'Hayır. Her hesaplayıcı bir mühendislik anlaşmazlığı uyarısı gösterir. Modeller kabaca aritmetik düzeyde doğru; kütüphane karakterizasyonu, saat ağacı, köşe analizi ve yerleşim yoktur. Kapama (closure), verim ve maliyet kararı karakterize edilmiş silikon verisi gerektirir.',
      en: 'No. Every calculator shows an engineering notice above its results. The models are correct arithmetic in a narrow band; library characterisation, the clock tree, corner analysis and placement are all absent. Closure, yield and cost decisions belong with characterised silicon data.',
    },
  },
  {
    category: 'data',
    question: {
      tr: 'Bu sitedeki mühendislik verisi nasıl doğrulanır?',
      en: 'How is the engineering data on this site verified?',
    },
    answer: {
      tr: 'Bir doğrulama betili, content modellerindeki her sayının kaynak alanını, her hücreyle çapraz eşleştırır: kaynağı olmayan bir sayı, tabloda "karakterize edilmemiş" olarak görünecek zorunda; kaynaklı bir sayının birimi aritmetikle uyumlu olmalıdır. Testler sürekli çalışır; her build bunları önce geçirir.',
      en: 'A verification script re-checks every figure in the content modules against its source field: an unsourced figure must render as "not characterised", and every sourced figure’s unit must agree with its arithmetic. These checks run on every build; each build has to pass them before it ships.',
    },
  },

  /* ---------------------------------------------------------------- payment */
  {
    category: 'payment',
    question: {
      tr: 'Ödeme nasıl çalışır? Kart kabul ediyor musunuz?',
      en: 'How do you take payment — do you accept cards?',
    },
    answer: {
      tr: 'Hayır. Satış, bank havaleyle proforma fatura karşılığı yapılır: siparişinizi oluşturursunuz, proforma fatura e-postayla gelir, döküm ve havale sonrası ödemenize onay verip indirme linklerini açarız. B2B lisans satışında kredi kartı aracıları istenmez.',
      en: 'No. Sales are settled by bank transfer against a proforma invoice: you create an order, the proforma invoice arrives by email, and once the transfer matches it we confirm the payment and open the download links. Card intermediaries are not involved in B2B licence sales.',
    },
  },
  {
    category: 'payment',
    question: {
      tr: 'KDV nasıl işleniyor?',
      en: 'How is VAT handled?',
    },
    answer: {
      tr: 'Fiyatlar KDV hariçtir. KDV muamelesi Türkiye’den yapılan ticarette standart bir tabloya sığmaz: Türkiye bir gümrük birliği üyesi ama AB KDV üyesi değildir; ihracat, ters vergi ve yurt içi satış her biri farklı muamele görür. Kesin KDV tedavisi proforma faturada, sevk adresinize göre yazar.',
      en: 'Prices exclude VAT. VAT treatment does not fit a standard table in Turkish trade: Türkiye sits in a customs union but is not an EU VAT member, so export, reverse-charge and domestic sales each tax differently. The definite treatment appears on the proforma invoice, based on your delivery address.',
    },
  },
  {
    category: 'payment',
    question: {
      tr: 'Siparişimi iptal edebilir miyim?',
      en: 'Can I cancel an order?',
    },
    answer: {
      tr: 'Ödeme onaylanmışsa hayır: lisans teslim edilmiş kabul edilir ve iptal edilemez. Ödeme onaylanmadan önce hesabınızın sipariş sayfasından iptal edebilirsiniz; durum "banka transferi bekleniyor"a döner ve sipariş kapanır.',
      en: 'Not once payment is confirmed: the licence is treated as delivered and the order cannot be cancelled. Before confirmation you can cancel from the orders page in your account; the status returns to "awaiting payment" and closes.',
    },
  },

  /* ----------------------------------------------------------------- custom */
  {
    category: 'custom',
    question: {
      tr: 'Bir çekirdeği kendi spesifikasyonuma göre tasarlar mısınız?',
      en: 'Do you build a core to my specification?',
    },
    answer: {
      tr: 'Evet. Kataloğun kapsamadaki bir işlev, tek bir dökulan için özel bir çalışma olarak alınır; kapsam, zamanlama, doğrulama derinliği ve teslim paketi görüşme sırasında belirlenir. İletişim formunda "Özel çekirdek" talebiyle yazın; bir teknoloji ön görüşmesi gerektiği sürece ücretsizdir.',
      en: 'Yes. A function outside the catalogue’s coverage can be commissioned as a bespoke exercise for a single tapeout; scope, timing, verification depth and the delivery bundle are agreed in conversation. Use the "custom core" enquiry on the contact form; the initial technical conversation is free of charge.',
    },
  },
  {
    category: 'custom',
    question: {
      tr: 'Doğrulama ortamını bir çekirdeksi lisansla alabilir miyim?',
      en: 'Can I buy the verification environment on its own?',
    },
    answer: {
      tr: 'Evet: kataloğun dördüncü türü bireyi doğrulama çekirdeğidir — UVM ortamı, assertion seti de coverage raporlarını kapsayan kolateral. Bu çekirdekleri fiziksel hiçbir ölçü yoktur; alan, frekans veya güç tablosu içermedikleri için diğer türle karşılaştırma yapılmaz.',
      en: 'Yes: the catalogue’s fourth kind is verification collateral on its own — a UVM environment, assertion sets and coverage results, licensed without the core itself. These have no physical figures at all, so no area, frequency or power column applies to them.',
    },
  },
]

/** FAQs grouped by category, in this file’s order. */
export function faqsByCategory(category: Faq['category']): Faq[] {
  return faqs.filter((faq) => faq.category === category)
}

export const faqCategories = ['licenses', 'delivery', 'data', 'payment', 'custom'] as const