/**
 * The four delivery bundles.
 *
 * A bundle is a *set of files with a purpose*, not a size. `rtl` is what you need
 * to synthesise. `layout` is what you need to place. `netlist` is what you need to
 * sign off timing and power against. `porting` is what you need when the core meets
 * your SoC and something does not fit.
 *
 * The four are priced separately because their costs to produce are genuinely
 * different and not proportional: a porting kit is a few weeks of engineer time and
 * is cheap, a layout bundle carries tapeout cost and mask cost and is not. That is
 * the whole reason `BUNDLE_KINDS` is a taxonomy rather than a single `full` flag.
 *
 * ## `priceMultiplier` scales a price, and there is no price to scale yet
 *
 * `priceMultiplier` is relative to the core's entry bundle, and a core's entry
 * bundle is named per core in `corePricing`. That indirection is deliberate: which
 * bundle a core is *led* with is a per-core decision. An RTL core is led with `rtl`;
 * a hard macro cannot be synthesised at all and is led with `layout`, which is a
 * fact about the kind of IP rather than about the bundle.
 *
 * **`corePricing` below is empty on purpose.** See its comment — this is the one
 * place where "placeholder" and "do not ship a fabricated number" pull hardest
 * against each other, and it resolves towards not shipping it.
 */

import type { BundleKind, DocumentFormat, T } from '../shared/types.ts'

/**
 * A delivery bundle.
 *
 * `id` comes from `BUNDLE_KINDS` in `shared/types.ts`, so a bundle added there is a
 * compile error here rather than a link on the pricing page that goes nowhere.
 */
export type Bundle = {
  id: BundleKind
  name: T
  summary: T
  description: T
  includes: readonly T[]
  excludes: readonly T[]
  /**
   * Price relative to the core's entry bundle. `1` for the entry bundle itself.
   *
   * Multipliers are sub-linear above the entry tier because the marginal cost of the
   * second and third bundle for a customer is much lower than producing it is —
   * the same argument as `multi-use` on the licence, and for the same reason.
   */
  priceMultiplier: number
  formats: readonly DocumentFormat[]
  /** Which core kinds can meaningfully be delivered in this bundle. */
  appliesTo: readonly string[]
  /** Indicative engineering days to produce this bundle for one core. */
  effortDays: number
}

/**
 * Ordered as a customer buys them: synthesise, place, sign off, port. `rtl` first
 * because it is where almost every engagement starts.
 */
export const bundles: readonly Bundle[] = [
  {
    id: 'rtl',
    name: { tr: 'RTL teslimi', en: 'RTL delivery' },
    summary: {
      tr: 'Sentezlenebilir RTL, kısıtlamalar ve doğrulama kolateralı.',
      en: 'Synthesisable RTL, constraints and verification collateral.',
    },
    description: {
      tr: 'Çekirdeğin taşınabilir hali. SystemVerilog ile yazılmış, hedef bağımsız, bir kütüphaneye karşı karakterize edilmiş ve bir PDK’ye bağlı olmayan tek teslimdir. Bu paket olmadan hiçbir şey sentezlenemez; bu yüzden bir çekirdeğin ilk ve çoğu zaman tek ihtiyaç duyulan paketidir.\n\nRTL, hedef kütüphaneye karşı sentezlenebilir biçimde yazılmıştır, ancak **bu, belirli bir düğümde karakterize edildiği anlamına gelmez.** Karakterizasyon ayrı bir iştir ve sonucu `content/processes.ts` tablosunda, kaynak bilgisiyle birlikte listelenir. Karakterize edilmemiş bir düğümde bir teslimat alan müşteri, nedenini görmektedir.',
      en: 'The portable form of the core. A single delivery written in SystemVerilog, target-independent, characterised against a library and not tied to any one PDK. Nothing can be synthesised without this bundle, which makes it the first and usually the only package most customers need.\n\nThe RTL is written to be synthesisable against a target library, but **that is not the same as being characterised at a node.** Characterisation is a separate exercise; its result is listed in the table in `content/processes.ts`, with a source, for every node. A customer delivered at an uncharacterised node can see why.',
    },
    includes: [
      { tr: 'SystemVerilog RTL (sentezlenebilir, PDK bağımsız)', en: 'SystemVerilog RTL (synthesisable, PDK-independent)' },
      { tr: 'SDC zamanlama kısıtlamaları ve saat tanımı', en: 'SDC timing constraints and clock definition' },
      { tr: 'SVA tabanlı doğrulama ortamı ve testbench', en: 'SVA-based verification environment and testbench' },
      { tr: 'Giriş/çıkış portu tanımları ve entegrasyon notları', en: 'Port definitions and integration notes' },
      { tr: 'Parametre dosyaları ve yapılandırma kılavuzu', en: 'Parameter files and configuration guide' },
      { tr: 'Release notları ve sürüm geçmişi', en: 'Release notes and revision history' },
    ],
    excludes: [
      { tr: 'Kapı seviyesi netlist, SDF veya SPEF yoktur', en: 'No gate-level netlist, SDF or SPEF' },
      { tr: 'Fiziksel tasarım dosyası yoktur', en: 'No physical design files' },
      { tr: 'Karakterize edilmiş performans verisi yazılı olarak verilmez', en: 'No characterised performance data in writing' },
    ],
    priceMultiplier: 1,
    formats: ['systemverilog', 'sdc', 'sva', 'uvm', 'tcl', 'pdf'],
    appliesTo: ['soft-rtl', 'analog', 'verification'],
    effortDays: 0,
  },

  {
    id: 'layout',
    name: { tr: 'Fiziksel tasarım', en: 'Physical design' },
    summary: {
      tr: 'GDSII / OASIS, LEF/DEF ve bağlantı çıkarımı.',
      en: 'GDSII / OASIS, LEF/DEF and extracted parasitics.',
    },
    description: {
      tr: 'Makronun fiziksel gerçekliği. Bir yerleşim dosyası, sözleşmenin PDK’sı olmadan **taşınabilir değildir**: aynı GDSII, metal yığını değişmiş bir PDK’de başka bir çipte çalışmaz. Bu yüzden bu paketin teslimatında PDK referansı zorunludur ve `PdkReference.source`, müşteri PDK sürümünü teyit edene kadar `null` kalır.\n\nFiziksel tasarım, aynı zamanda maske maliyetini de belirler. Bu yüzden fiyat çarpanı en yüksek olan pakettir ve çoğu müşterinin tek ihtiyacı değildir — ama bir makroyu kendi çipine gömmek isteyen herkesin ihtiyacıdır.',
      en: 'The physical reality of the macro. A layout deliverable is **not portable without a matching PDK**: the same GDSII does not work on a different chip under a changed metal stack. That is why the PDK reference is mandatory on this delivery, and why `PdkReference.source` stays `null` until the customer confirms their PDK revision.\n\nPhysical design is also what sets the mask cost. It therefore carries the highest price multiplier of the four, and is not what most customers need — but it is what everyone embedding a macro into their own chip needs.',
    },
    includes: [
      { tr: 'GDSII veya OASIS yerleşim dosyası', en: 'GDSII or OASIS layout database' },
      { tr: 'LEF/DEF (fiziksel tasarım için)', en: 'LEF/DEF (for physical design)' },
      { tr: 'Liberty (.lib) hücre kütüphanesi', en: 'Liberty (.lib) cell library' },
      { tr: 'Çıkarılmış parasitik (SPEF) ve gerilim düşümü (SDF) dosyaları', en: 'Extracted parasitics (SPEF) and net delays (SDF)' },
      { tr: 'Yerleşim görünümü (.view) dosyaları', en: 'Layout views (.view)' },
      { tr: 'Bağlantı (bond) pad planı ve çerçeve dosyası', en: 'Bond pad plan and frame file' },
    ],
    excludes: [
      { tr: 'Zamanlama ve güç imzaları için onay imzası içermez', en: 'No sign-off stamps for timing or power' },
      { tr: 'PDK dosyaları dahil değildir; dökümhanenin kendi PDK’si kullanılır', en: 'PDK files are not included; the foundry’s own PDK is used' },
    ],
    priceMultiplier: 2.4,
    formats: ['gds', 'oas', 'lef', 'def', 'lib', 'sdf', 'spef', 'view', 'pdf'],
    appliesTo: ['hard-macro'],
    effortDays: 25,
  },

  {
    id: 'netlist',
    name: { tr: 'Netlist ve karakterizasyon', en: 'Netlist and characterisation' },
    summary: {
      tr: 'Kapı seviyesi netlist, SDF ve SPEF ile imza öncesi veri.',
      en: 'Gate-level netlist with SDF and SPEF for sign-off.',
    },
    description: {
      tr: 'İmzadan hemen önceki katman. Sentezlenmiş kapı seviyesi netlist, gerçekçi parazitik değerlerle donatılmış zamanlama (SDF) ve bağlantı (SPEF) dosyaları ve bunları okuyacak zamanlama analizörü için bir Tcl betiği.\n\nBu paketin varlığı, bir çekirdeğin **karakterize edilmiş olduğu** anlamına gelir. Karakterizasyon yapılmamış bir düğümde bu paket teslim edilmez — çünkü içindeki her sayı, ölçülmüş ya da ölçülmüş gibi sunulmuş olur ve ikisi de kabul edilemez. Karakterize edilmemiş bir düğüm için doğru yanıt, teslim etmemektir.',
      en: 'The layer immediately before sign-off. A synthesised gate-level netlist, timing (SDF) and parasitics (SPEF) populated with extracted rather than estimated values, and a Tcl script for the timing analyser that reads them.\n\nThe existence of this package is what a core being **characterised** at a node means. It is not delivered for an uncharacterised node, because every number inside it would be presented as measured or as measured-equivalent, and neither is acceptable. For an uncharacterised node the correct answer is not to deliver it.',
    },
    includes: [
      { tr: 'Kapı seviyesi netlist (Verilog veya VHDL)', en: 'Gate-level netlist (Verilog or VHDL)' },
      { tr: 'Ekstraksiyonla doldurulmuş SDF (hücre ve yol gecikmeleri)', en: 'SDF populated by extraction (cell and path delays)' },
      { tr: 'SPEF parazitik çıkarımı', en: 'SPEF parasitic extraction' },
      { tr: 'Zamanlama analizörü için Tcl betiği', en: 'Tcl script for the timing analyser' },
      { tr: 'Karakterizasyon raporu: köşeler, koşullar ve ölçüm yöntemi', en: 'Characterisation report: corners, conditions and measurement method' },
      { tr: 'PVT köşe tanımları', en: 'PVT corner definitions' },
    ],
    excludes: [
      { tr: 'Çip üstü (post-silicon) ölçüm sonuçları kapsam dışıdır; bunlar ayrı bir programdır', en: 'Post-silicon measurement results are out of scope; they are a separate engagement' },
      { tr: 'Karakterize edilmemiş bir düğümde bu paket mevcut değildir', en: 'This package does not exist at an uncharacterised node' },
    ],
    priceMultiplier: 1.8,
    formats: ['verilog', 'vhdl', 'netlist', 'sdf', 'spef', 'tcl', 'pdf'],
    appliesTo: ['soft-rtl', 'hard-macro'],
    effortDays: 12,
  },

  {
    id: 'porting',
    name: { tr: 'Taşıma kiti', en: 'Porting kit' },
    summary: {
      tr: 'Çekirdeğin müşterinin SoC’sine uyarlanması.',
      en: 'Adapting the core to the customer’s SoC.',
    },
    description: {
      tr: 'Bir çekirdek bir SoC’ye girdiğinde bir şeyler hep uymaz: saat adı farklıdır, sıfırlama politikası farklıdır, güç kapısı yoktur, adres haritası çakışır, veri yolu genişliği başka bir kat sayısına oturur. Bu paket, o çekirdeğin **belirli bir SoC’ye** uyarlanmış hâlini ve değişikliğin tam kaydını içerir.\n\nBu paket, hedef SoC bilinmeden satılamaz. Fiyatı düşük çünkü üretimi birkaç hafta mühendislik süresidir; fiyatı yüksek çünkü teslim **tek bir** müşteri için yapılmıştır ve başka birine devredilemez.',
      en: 'When a core enters an SoC, something always does not fit: the clock name differs, the reset policy differs, there is no power gate, the address map collides, the data bus width lands on a different power of two. This package is the core adapted to **one specific SoC**, with a full record of what was changed.\n\nIt cannot be sold before the target SoC is known. Its price is low because producing it is a few weeks of engineering; it is also the most expensive thing to hand around, because the delivery is made for **one** customer and cannot be transferred to another.',
    },
    includes: [
      { tr: 'SoC’ye uyarlanmış RTL ve parametre dosyaları', en: 'SoC-adapted RTL and parameter files' },
      { tr: 'Entegrasyon için gerekli tüm arayüz (wrapper) dosyaları', en: 'Every interface wrapper the integration requires' },
      { tr: 'Değişiklik kaydı: ne değişti ve neden', en: 'Change record: what changed and why' },
      { tr: 'Güncellenmiş doğrulama ortamı', en: 'Updated verification environment' },
      { tr: 'Entegrasyon planı ve zamanlama bütçesi', en: 'Integration plan and timing budget' },
    ],
    excludes: [
      { tr: 'SoC’nun kendisi kapsam dışıdır', en: 'The SoC itself is out of scope' },
      { tr: 'Bu teslim başka bir müşteriye devredilemez', en: 'This delivery cannot be transferred to another customer' },
      { tr: 'Uyarlamanın getireceği karakterizasyon kaybı garanti edilmez', en: 'No guarantee is given for characterisation lost through the adaptation' },
    ],
    priceMultiplier: 0.6,
    formats: ['systemverilog', 'sdc', 'sva', 'tcl', 'pdf'],
    appliesTo: ['soft-rtl', 'analog'],
    effortDays: 15,
  },
] as const

/** One authored entry price for one core. */
export type CorePricing = {
  /** Core slug. Contractual — matches the delivery directory name. */
  slug: string
  /**
   * The bundle this price is for. A customer buying a different bundle gets
   * `price × that bundle's priceMultiplier`, resolved in `shared/pricing.ts`.
   */
  bundle: BundleKind
  /** Authored entry price in whole USD. See `shared/pricing.ts` for why it is authored. */
  priceUsd: number
}

/**
 * ⚠️ **INTENTIONALLY EMPTY. Every core is quote-only until this table is filled in.**
 *
 * The rest of this project is full of figures that are deliberately
 * `uncharacterised` because no measured number may be invented. A **price** is the
 * one figure where that discipline is *easiest* to skip and *most expensive* to get
 * wrong, because it is the only number on the site a customer is actually asked to
 * pay.
 *
 * A placeholder price is a fabricated commercial term, not a placeholder
 * engineering figure. It differs in kind:
 *
 * - an uncharacterised **MHz** is embarrassing and checkable by the customer;
 * - an uncharacterised **price** is a published offer. A customer may quote it. A
 *   contract may be signed against it. The site would then be obliged to honour a
 *   number nobody chose.
 *
 * So the table ships empty, and `priceFor()` returns `null` for every core. That is
 * the state the locale bundle is already built for: `licences.quoteOnly` and
 * `licences.getQuote` exist precisely for a core with no listed price, and
 * `shared/pricing.ts` documents `null` as distinct from `0` — "quoted on request",
 * not "free".
 *
 * **To fill it in**, add one row per core and nothing else. No other file needs to
 * change; `shared/pricing.ts` reads this array, not a copy.
 *
 * ```ts
 * { slug: 'ct-ahb-lite', bundle: 'rtl', priceUsd: 45_000 },
 * ```
 */
export const corePricing: readonly CorePricing[] = []

/**
 * The bundle a core is led with by default.
 *
 * Read from `corePricing` in `shared/pricing.ts`. Until that table is filled in
 * there is no default bundle for any core, which is what the two functions there
 * return `null` for.
 */
export function entryBundleSlug(slug: string): BundleKind | null {
  return corePricing.find((row) => row.slug === slug)?.bundle ?? null
}

/** The bundle record for an id, or `null` if the id is not one of the four. */
export function bundleFor(id: BundleKind): Bundle | null {
  return bundles.find((b) => b.id === id) ?? null
}

/**
 * The bundles that apply to a core kind, in purchase order.
 *
 * A hard macro cannot be synthesised from RTL, so `rtl` does not apply to it and
 * this returns `layout` first. That ordering is the reason this exists rather than
 * a caller filtering: which bundles are *possible* for a kind is a fact about IP
 * kinds, and a UI that offers an RTL bundle for a macro is offering something the
 * vendor cannot deliver.
 */
export function bundlesForKind(kind: string): readonly Bundle[] {
  return bundles.filter((b) => (b.appliesTo as readonly string[]).includes(kind))
}