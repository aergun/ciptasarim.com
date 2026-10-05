/**
 * The three licence tiers.
 *
 * A tier is not a marketing ladder — "personal / commercial / enterprise", each one
 * the same product with a bigger number on it. The three here differ in *what they
 * entitle*, and the difference is the only thing that makes the ordering sensible:
 *
 *   evaluation  — you may simulate, synthesise, run the verification environment.
 *                 You may not fabricate. This is stated in `restrictions` and
 *                 enforced by the manifest filter, not by a sentence on a page.
 *   production  — one tapeout, one named end product, a stated number of seats.
 *   multi-use   — unlimited tapeouts and unlimited seats, for a house that ships
 *                 the core in several parts across several programmes.
 *
 * ## Why evaluation is cheap, and why its price is not a lever
 *
 * `multiplier` on `evaluation` is well below 1, and it is tempting to read that as
 * a loss-leader discount — cheap enough to pull a core into a design, then expensive
 * once it is designed in.
 *
 * That is not what it is. An evaluation licence is cheaper **because it cannot be
 * as valuable**, and the reason is legal rather than commercial: it does not
 * entitle a tapeout. A customer at that tier wants the right to build, and no price
 * conveys it. Raising the multiplier would not make the licence worth more; it would
 * only make it an expensive way to not get what you came for.
 *
 * So the multiplier is not a variable anyone can profitably adjust. It is recorded
 * here so the arithmetic in `shared/pricing.ts` has one input, not because it
 * encodes a strategy. `shared/pricing.ts` says the same thing at more length.
 *
 * ## `excludes` is enforced, not decorative
 *
 * `includes` reads as marketing. `excludes` is read by
 * `manifestFor(core, tier)` in `content/documents.ts`, which filters the delivery
 * list by tier — so a file named in `excludes` is never produced to that customer's
 * account, rather than merely being described as absent.
 *
 * That is why the two lists are kept symmetric and why nothing important is written
 * only in the `name` or `summary`. If the customer needs to know it, it belongs in
 * one of the four.
 */

import type { License } from '../shared/types.ts'

/**
 * Ordered cheapest first, which is the order the pricing page and the tier selector
 * both use. The order is meaningful: each tier is strictly more capable than the one
 * before it, so "next tier up" is a well-defined thing for the UI to offer.
 */
export const licences: readonly License[] = [
  {
    id: 'evaluation',
    name: {
      tr: 'Değerlendirme lisansı',
      en: 'Evaluation licence',
    },
    summary: {
      tr: 'Entegrasyon, simülasyon ve doğrulama için. Tapeout hakkı yoktur.',
      en: 'For integration, simulation and verification. No tapeout right.',
    },
    /**
     * A flat fee for the evaluation itself — support time, the environment bring-up
     * and the engineering attention that does not scale with a core.
     *
     * Matches the `evaluationFee` default in the `licence-economics` calculator, so
     * the tool's out-of-the-box numbers and the licence page agree. It is an authored
     * commercial number, not a derived one.
     */
    priceUsd: 5_000,
    /**
     * Applies to a core's authored price. Below 1 because the tier grants no
     * fabrication right — see the header.
     */
    multiplier: 0.08,
    includes: [
      {
        tr: 'Sentez, statik zamanlama analizi ve güç analizi için RTL teslimi',
        en: 'RTL for synthesis, static timing analysis and power analysis',
      },
      {
        tr: 'Doğrulama ortamı ve testbench kolateralı',
        en: 'Verification environment and testbench collateral',
      },
      {
        tr: 'SDC kısıtlamaları ve saat tanımı',
        en: 'SDC constraints and clock definition',
      },
      {
        tr: 'Sınırsız teklifli (quotation) desteği, e-posta ile',
        en: 'Quotation-based support, by email',
      },
      {
        tr: 'Değerlendirme süresince çekirdeğin tüm sürüm sürümlerine erişim',
        en: 'Access to every revision of the core for the life of the evaluation',
      },
    ],
    excludes: [
      {
        tr: 'Tapeout veya herhangi bir üretim amaçlı fabrikasyon hakkı yoktur',
        en: 'No tapeout and no right to fabricate for production, under any circumstances',
      },
      {
        tr: 'Kapı seviyesi netlist, SDF, SPEF ve fiziksel tasarım dosyaları verilmez',
        en: 'No gate-level netlist, SDF, SPEF or physical design files are provided',
      },
      {
        tr: 'Karakterize edilmiş performans verisi: frekans, güç, alan değerleri yazılı olarak verilmez',
        en: 'No characterised performance data: frequency, power and area figures are not provided in writing',
      },
      {
        tr: 'Ürünün içine gömülebilir; başka bir takıma aktarılamaz',
        en: 'The core may not be embedded in a product, nor transferred to another team',
      },
      {
        tr: 'Değerlendirme çıktısı bir üretim kararının gerekçesi olarak kullanılamaz',
        en: 'The evaluation may not be relied on as the basis of a production decision',
      },
    ],
    rights: [
      {
        tr: 'Sözleşmeye bağlı olmayan dahili kullanım hakkı',
        en: 'Non-exclusive internal use rights',
      },
      {
        tr: 'Değerlendirme amacıyla çoğaltma hakkı',
        en: 'Right to make the copies an evaluation requires',
      },
    ],
    restrictions: [
      {
        tr: 'Tapeout yapılamaz. Bu, fiyat değil hukuki bir kısıttır ve fiyat artırılarak kaldırılamaz.',
        en: 'No tapeout. This is a legal restriction rather than a price, and cannot be lifted by paying more.',
      },
      {
        tr: 'Lisans süresi boyunca teslim edilen RTL, müşterinin kendi çipinde kalıcı olarak gömülemez.',
        en: 'The RTL delivered may not be permanently embedded in the customer’s own silicon during the licence term.',
      },
      {
        tr: 'Çekirdek, üretimde kullanılmak üzere üçüncü bir tarafa satılamaz veya devredilemez.',
        en: 'The core may not be sold or sublicensed to a third party for production use.',
      },
    ],
    seats: 1,
    /** Zero, and stated rather than left blank: no tapeout is the tier's whole point. */
    tapeouts: 0,
  },

  {
    id: 'production',
    name: {
      tr: 'Üretim lisansı',
      en: 'Production licence',
    },
    summary: {
      tr: 'Tek bir ürün için üretim hakkı. Bir tapeout, adlandırılmış kullanıcılar.',
      en: 'Production rights for one end product. One tapeout, named users.',
    },
    priceUsd: 85_000,
    /** The reference point. Every other multiplier is read against this one. */
    multiplier: 1,
    includes: [
      {
        tr: 'Değerlendirme lisansındaki her şey',
        en: 'Everything in the evaluation licence',
      },
      {
        tr: 'Kapı seviyesi netlist, SDF ve SPEF ile karakterizasyon dosyaları',
        en: 'Gate-level netlist, SDF and SPEF with characterisation data',
      },
      {
        tr: 'Uygulama notları, çip üstü (post-silicon) düzeltme yordamı ve geri dönüş (fallback) sırası',
        en: 'Integration notes, post-silicon bring-up procedure and fallback sequence',
      },
      {
        tr: 'Yapılandırılmış desteğe dahil mühendislik saati',
        en: 'Engineering hours within a support allowance',
      },
      {
        tr: 'Sözleşme süresi boyunca, sözleşmede belirtilen çekirdek sürümlerine erişim',
        en: 'Access to the contracted core revisions for the term',
      },
    ],
    excludes: [
      {
        tr: 'Sözleşmede adlandırılmış tek üründen farklı bir üründe üretim hakkı yoktur',
        en: 'No production rights in any product other than the single one named in the agreement',
      },
      {
        tr: 'Lisans bedeli ödenene kadar ikinci bir tapeout yapılamaz',
        en: 'No second tapeout until the licence fee is paid',
      },
      {
        tr: 'Çekirdek, üçüncü bir tarafa yeniden lisanslanamaz veya kopyalanamaz',
        en: 'The core may not be sublicensed or copied to a third party',
      },
      {
        tr: 'Fiziksel tasarım teslimi yalnızca hard-macro çekirdekler için geçerlidir; yazılım RTL çekirdeklerinde teslim edilmez',
        en: 'Physical design deliverables apply to hard macros only; they are not delivered for soft RTL cores',
      },
    ],
    rights: [
      {
        tr: 'Sözleşmede adlandırılan ürün için dünya çapında, süresiz, münhasır olmayan üretim hakkı',
        en: 'Worldwide, perpetual, non-exclusive production rights for the product named in the agreement',
      },
      {
        tr: 'Çekirdeğin müşteri çipine örneklenmesi (instantiation) hakkı',
        en: 'Right to instantiate the core in the customer’s design',
      },
      {
        tr: 'Sözleşmeye konu ürünü geliştirmek ve bakımını yapmak için gerekli değişiklikleri yapma hakkı',
        en: 'Right to make the modifications needed to develop and maintain the contracted product',
      },
    ],
    restrictions: [
      {
        tr: 'Üretim hakkı tek bir ürünle sınırlıdır. Aynı çekirdeğin ikinci bir üründe kullanılması ayrı bir lisans gerektirir.',
        en: 'Production rights are limited to a single product. Use of the same core in a second product requires a separate licence.',
      },
      {
        tr: 'Değişiklik yapılabilir; ancak değiştirilmiş çekirdek için karakterizasyon garantisi verilmez.',
        en: 'The core may be modified, but no characterisation guarantee is given for a modified core.',
      },
      {
        tr: 'Çekirdek, tasarımı geliştirmek için başvurulan üçüncü taraf bir alt yükleniciye yalnızca yazılım geliştirme amacıyla açılabilir ve her durumda gizli tutulur.',
        en: 'The core may be disclosed to a third-party subcontractor solely for software development, under confidentiality in all cases.',
      },
    ],
    seats: 5,
    tapeouts: 1,
  },

  {
    id: 'multi-use',
    name: {
      tr: 'Çoklu kullanım lisansı',
      en: 'Multi-use licence',
    },
    summary: {
      tr: 'Sınırsız tapeout ve sınırsız kullanıcı. Bir kurumun tüm programları için.',
      en: 'Unlimited tapeouts and unlimited users. For a house running several programmes.',
    },
    priceUsd: 240_000,
    /**
     * Not a linear multiple of production. Above roughly 1.6 the multiplier is
     * deliberately sub-linear, because a house buying multi-use has usually already
     * internalised the integration cost and the marginal value of the second product
     * falls — pricing the third and fourth product at a constant multiple each would
     * price against the customer and get the deal declined rather than upgraded.
     */
    multiplier: 2.6,
    includes: [
      {
        tr: 'Üretim lisansındaki her şey',
        en: 'Everything in the production licence',
      },
      {
        tr: 'Sınırsız tapeout hakkı',
        en: 'Unlimited tapeouts',
      },
      {
        tr: 'Sınırsız eşzamanlı kullanıcı',
        en: 'Unlimited concurrent users',
      },
      {
        tr: 'Ürün yol haritasına uygun yeni sürümlere erişim',
        en: 'Access to new revisions as they align with the product roadmap',
      },
      {
        tr: 'Öncelikli mühendislik desteği ve belirli bir yanıt süresi',
        en: 'Priority engineering support with a stated response time',
      },
    ],
    excludes: [
      {
        tr: 'Çekirdeğin yeniden satılması, alt lisanslanması veya üçüncü bir tarafa devredilmesi',
        en: 'Resale, sublicensing or transfer of the core to a third party',
      },
      {
        tr: 'Karakterize edilmemiş herhangi bir performans değerinin yazılı garanti olarak verilmesi',
        en: 'No written guarantee of any performance figure that has not been characterised',
      },
      {
        tr: 'Lisans sahibi olmayan bir tedarikçi zincirine aktarım',
        en: 'Transfer into a supply chain the licence holder does not control',
      },
    ],
    rights: [
      {
        tr: 'Çekirdeğin sözleşmede tanımlanan ürün ailesinde sınırsız sayıda üründe kullanılma hakkı',
        en: 'Right to use the core in an unlimited number of products within the product family defined in the agreement',
      },
      {
        tr: 'Kurum içi şubeler arası aktarım hakkı',
        en: 'Right to transfer between the licence holder’s own sites',
      },
      {
        tr: 'Urun tabanlı (per-unit) bir maliyet takibi için üretim hacmi bildirme hakkı',
        en: 'Right to report production volumes for per-unit cost accounting',
      },
    ],
    restrictions: [
      {
        tr: 'Kapsam, sözleşmede tanımlanan ürün ailesiyle sınırlıdır; aile dışına çıkmak yeni bir lisans gerektirir.',
        en: 'Scope is limited to the product family defined in the agreement; leaving it requires a new licence.',
      },
      {
        tr: 'Royalty içeren bir yapı ancak ayrı bir sözleşmeyle müzakere edilir; bu modül fiyatları royalty içermez.',
        en: 'A royalty-bearing structure is negotiated separately; the prices in this module carry no royalty.',
      },
      {
        tr: 'Üretim hacimleri, fiyatlandırmayı gözden geçirmek üzere periyodik olarak bildirilir.',
        en: 'Production volumes are reported periodically for the purposes of pricing review.',
      },
    ],
    seats: null,
    tapeouts: null,
  },
] as const

/** The tier a new customer is shown first. */
export const DEFAULT_TIER = 'evaluation' as const

/** The licence for a tier id, or `null` if the id is not one this catalogue sells. */
export function licenceFor(id: string): License | null {
  return licences.find((l) => l.id === id) ?? null
}

/**
 * True when `held` entitles everything `required` does.
 *
 * Ordered as `LICENSE_TIERS` is declared — evaluation, production, multi-use — so
 * this is a comparison of positions and nothing else. A licence never entitles a
 * tier above itself, which is what makes the delivery manifest filter a single
 * comparison rather than a per-file exception list.
 *
 * An id that is not in the catalogue returns `false` rather than throwing or
 * returning true. `indexOf` gives `-1` for an unknown id, and `-1 >= anything` is
 * only ever true when the *required* tier is the unknown one — which is exactly the
 * case that would let an unrecognised requirement through. Failing closed here means
 * a tier id added to a stored order by a future taxonomy change withholds a file
 * rather than releasing one.
 */
export function covers(held: License['id'], required: License['id']): boolean {
  const heldIndex = ORDER.indexOf(held)
  const requiredIndex = ORDER.indexOf(required)
  if (heldIndex < 0 || requiredIndex < 0) return false
  return heldIndex >= requiredIndex
}

const ORDER = licences.map((l) => l.id) as readonly License['id'][]