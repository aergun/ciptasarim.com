/**
 * The engineering calculators, as the pages render them.
 *
 * Every calculator here has a matching case in `runEngineering()` in
 * `shared/engineering.ts`, and the two must agree on the input **keys** — a field
 * whose id does not reach the calculation renders an input that quietly does
 * nothing, which is worse than not offering it. So the ids below are the contract.
 * `resultIdsFor()` (also in `shared/engineering.ts`) exists precisely so a build
 * check can walk the two directions and refuse a tool that declares a result the
 * dispatcher does not emit, or emits one this file did not declare.
 *
 * The declared `results[].unit` mirrors the unit the dispatcher actually emits —
 * including its quirks. Where the dispatcher returns a value in cm² but tags it
 * `um2` (the Murphy model's area convention, stated in its own `interpretation`),
 * this file repeats that rather than dressing the mismatch up here; the renderer
 * formats from `EngineeringResult`, not from this declaration.
 *
 * The `caveat` on each is not legal filler — it is the `EngineeringNotice` text,
 * rendered above the results, never below. Several of these models have a domain
 * where they are quietly wrong: a leakage figure computed from a reference value a
 * reader assumed was ours is wrong by an order of magnitude, and a yield computed
 * from an invented defect density is a fiction. The caveat says where the model
 * stops, because a tool that does not admit its limits gets used on the wrong side
 * of the line where it does.
 */

import type { Field, Tool } from '../shared/types.ts'

/**
 * Shared field definitions, so a unit or a range is stated identically anywhere the
 * same quantity appears — supply voltage in three tools, defect density in two.
 */
const vddV = {
  id: 'voltageV',
  label: { tr: 'Besleme gerilimi', en: 'Supply voltage' },
  unit: 'V',
  default: 0.8,
  min: 0.4,
  max: 2.0,
  step: 0.05,
  help: {
    tr: 'Adi (yani en hızlı değil, en tipik) köşedeki besleme gerilimi. Düşük gerilim gücü düşürür ama gecikmeyi artırır.',
    en: 'The nominal (i.e. typical, not fastest-corner) supply voltage. A lower voltage saves power but costs delay.',
  },
} as const satisfies Field

const defectDensity = {
  id: 'defectDensity',
  label: { tr: 'Kusur yoğunluğu D₀', en: 'Defect density D₀' },
  unit: 'perCm2',
  default: 0.08,
  min: 0.005,
  max: 2,
  step: 0.005,
  help: {
    tr: 'cm² başına çip öldürücü kusur. Bu değer döküphanenin kendi verisinden gelir; bu sitedeki hiçbir değere güvenilmemelidir.',
    en: 'Killing defects per cm². This value must come from the foundry’s own data; none of the values on this site are to be trusted here.',
  },
} as const satisfies Field

const dieArea = {
  id: 'dieArea',
  label: { tr: 'Çip alanı', en: 'Die area' },
  unit: 'um2',
  default: 25_000_000,
  min: 100_000,
  max: 1_000_000_000,
  step: 100_000,
  help: {
    tr: '25 mm² = 25 000 000 µm². Verim modeli alanı cm²’ye çevirir; bu alan girdinin µm² cinsinden hâlidir.',
    en: '25 mm² = 25 000 000 µm². The yield model converts area to cm² internally; this input is stated in µm².',
  },
} as const satisfies Field

export const tools: readonly Tool[] = [
  // --------------------------------------------------------------------------
  {
    id: 'critical-path',
    slug: 'kritik-yol',
    title: {
      tr: 'Kritik yol gecikmesi',
      en: 'Critical-path delay',
    },
    summary: {
      tr: 'Kademe başına lojik çabası ve Elmore tel gecikmesi birleştirilerek bir mantık yolunun toplam gecikmesi ve üst sınır frekansı.',
      en: 'A logic path’s total delay and its frequency bound, from per-stage logical effort plus an Elmore wire term.',
    },
    caveat: {
      tr: 'Bu model kapı kütüphanesini, saat ağacını, çapraz konuşmayı ve kurulum payını bilmez. Döndürdüğü frekans, kapama (closure) için hedef değil, üst sınırdır: gerçek bir tasarım bu sayının %10–30 altında kapatılır. Tel parametreleri adidir; bir kütüphane, işlemler arası karşılaştırmaya uygun değildir.',
      en: 'This model knows nothing about the gate library, the clock tree, crosstalk or setup margin. The frequency it returns is an upper bound, not a closure target: real designs close 10–30% below this figure. The wire parameters are nominal and must not be compared across process nodes or libraries.',
    },
    inputs: [
      {
        id: 'stages',
        label: { tr: 'Kademe sayısı', en: 'Stage count' },
        unit: 'count',
        default: 8,
        min: 1,
        max: 32,
        step: 1,
        help: {
          tr: 'Yolun ardışık lojik kademe sayısı (inverter çiftleri dahil).',
          en: 'The number of cascaded logic stages on the path (including inverter pairs).',
        },
      },
      {
        id: 'effort',
        label: { tr: 'Kademe başına lojik çaba', en: 'Logical effort per stage' },
        unit: 'ratio',
        default: 1.6,
        min: 0.5,
        max: 6,
        step: 0.05,
        help: {
          tr: 'Kademe başına elektriksel çaba. FO4 tasarımı tipik olarak 3,6–4,2’de bırakılır; kritik yollar 2–3 bandına iner.',
          en: 'Electrical effort per stage. An FO4 discipline lands at 3.6–4.2; critical paths are driven into the 2–3 band.',
        },
      },
      {
        id: 'parasiticDelayPs',
        label: { tr: 'Parazitik gecikme (kademe)', en: 'Parasitic delay (per stage)' },
        unit: 'ps',
        default: 12,
        min: 0,
        max: 200,
        step: 0.5,
        help: {
          tr: 'Yükü olmayan bir kademenin kendi gecikmesi (p₀ · τ). Kütüphanenin kaçış noktasından gelir.',
          en: 'A stage’s own unloaded delay (p₀ · τ). Comes from the library’s escape point.',
        },
      },
      {
        id: 'intrinsicDelayPs',
        label: { tr: 'İç gecikme birimi τ', en: 'Intrinsic delay unit τ' },
        unit: 'ps',
        default: 6,
        min: 0,
        max: 100,
        step: 0.5,
        help: {
          tr: 'Bir inverterin kendi girdi kapasitesini şarj etme süresi — lojik çabayı pikosaniyeye çeviren katsayı.',
          en: 'The time to charge one inverter’s own input capacitance — the coefficient converting logical effort into picoseconds.',
        },
      },
      {
        id: 'wireLengthMm',
        label: { tr: 'Tel uzunluğu', en: 'Wire length' },
        unit: 'mm',
        default: 2,
        min: 0,
        max: 50,
        step: 0.1,
        help: {
          tr: 'Yolun geçtiği toplam metal uzunluğu. Yerleşim bilgisi olmadan kabaca tahmin edilir.',
          en: 'Total metal traversed by the path. Estimated roughly, with no placement knowledge.',
        },
      },
      {
        id: 'wireWidthNm',
        label: { tr: 'Tel genişliği', en: 'Wire width' },
        unit: 'nm',
        default: 40,
        min: 5,
        max: 2000,
        step: 5,
        help: {
          tr: 'Metalin en dar katman genişliği. Üst katmanlarda birkaç microna kadar çıkar.',
          en: 'The narrowest metal layer width. Top layers run several microns wide.',
        },
      },
      {
        id: 'wireCapFfPerMm',
        label: { tr: 'Tel kapasitesi', en: 'Wire capacitance' },
        unit: 'fF',
        default: 140,
        min: 10,
        max: 600,
        step: 5,
        help: {
          tr: 'Millimetre başına pikofarad değil femtofarad: 140 fF/mm, yakınlardaki orta katmanlar için tipik bir değerdir.',
          en: 'Stated in fF, per mm of length: 140 fF/mm is typical for nearby intermediate layers.',
        },
      },
      {
        id: 'sheetResistanceOhm',
        label: { tr: 'Yüzey direnci', en: 'Sheet resistance' },
        unit: 'ohm',
        default: 0.08,
        min: 0.005,
        max: 5,
        step: 0.005,
        help: {
          tr: 'Ω/kare. Bakır orta katmanlar 0,05–0,2 bandında; yerel katmanlar yüzlerce Ω/kareye çıkar — o bantta model geçersizleşir.',
          en: 'Ω per square. Copper intermediate layers sit at 0.05–0.2; local layers reach hundreds of Ω/sq, where this model stops holding.',
        },
      },
    ],
    results: [
      { id: 'logic-delay', label: { tr: 'Mantık gecikmesi', en: 'Logic delay' }, unit: 'ps', basis: 'modelled' },
      { id: 'wire-delay', label: { tr: 'Tel gecikmesi', en: 'Wire delay' }, unit: 'ps', basis: 'modelled' },
      { id: 'total-delay', label: { tr: 'Toplam gecikme', en: 'Total delay' }, unit: 'ps', basis: 'modelled' },
      { id: 'fmax', label: { tr: 'Bu yoldan maksimum frekans', en: 'Maximum frequency (this path)' }, unit: 'MHz', basis: 'modelled' },
    ],
  },

  // --------------------------------------------------------------------------
  {
    id: 'dynamic-power',
    slug: 'dinamik-guc',
    title: {
      tr: 'Dinamik güç',
      en: 'Dynamic power',
    },
    summary: {
      tr: 'P = α·C·V²·f. Ağırlık faktörü, çiplenen kapasitans ve çalışma frekansını veri yolu yoğunluğu üzerinden birleştirir.',
      en: 'P = α·C·V²·f. Combines clocked capacitance, frequency and a stated activity factor into a power budget.',
    },
    caveat: {
      tr: 'Etkinlik faktörü α bir girdidir, bir ölçüm değildir — sonuç onun kadar belirsizdir. Kısa devre katkısı aday bir kütüphane oranından gelir. Kaçak gücü bu modele girmemiştir ve düşük frekanslarda önemli hale gelir; toplam güç için kaçak akım aracıyla birlikte okunmalıdır.',
      en: 'The activity factor α is an input, not a measurement — the result is only as known as it is. The short-circuit contribution comes from a nominal library fraction. Leakage power is not in this model and grows significant at low frequency; read it together with the leakage tool for a total power figure.',
    },
    inputs: [
      {
        id: 'capacitanceFf',
        label: { tr: 'Saatlenmiş kapasitans', en: 'Clocked capacitance' },
        unit: 'fF',
        default: 2500,
        min: 1,
        max: 1_000_000,
        step: 10,
        help: {
          tr: 'Her döngüde değişen toplam kapasitans: saat ağacı, flip-flop girdileri ve aktif veri yolları. 25 K GE’lik nüve için 2 500 fF tipiktir.',
          en: 'Total capacitance switching every cycle: clock tree, flip-flop inputs and active datapath. 2 500 fF is typical for a 25 K GE core.',
        },
      },
      vddV,
      {
        id: 'frequencyMHz',
        label: { tr: 'Çalışma frekansı', en: 'Operating frequency' },
        unit: 'MHz',
        default: 500,
        min: 1,
        max: 5000,
        step: 1,
        help: {
          tr: 'Blokun gerçekten çalışacağı frekans — kapanan frekans, değil.',
          en: 'The frequency the block will actually run at — the closed one, not the one targeted.',
        },
      },
      {
        id: 'activityFactor',
        label: { tr: 'Etkinlik faktörü α', en: 'Activity factor α' },
        unit: 'ratio',
        default: 0.15,
        min: 0.01,
        max: 1,
        step: 0.01,
        help: {
          tr: 'Her döngüde bir girdinin değişme olasılığı. Veri yolu yoğunluklu mantıkta 0,15–0,30 arası tipiktir; saat ağaçları 1’e yakındır.',
          en: 'The probability a node switches every cycle. 0.15–0.30 is typical for datapath logic; clock trees approach 1.',
        },
      },
      {
        id: 'shortCircuitFraction',
        label: { tr: 'Kısa devre katkısı', en: 'Short-circuit fraction' },
        unit: 'ratio',
        default: 0.15,
        min: 0,
        max: 1,
        step: 0.01,
        help: {
          tr: 'Anahtarlama gücüne eklenen geçici çekiş — bir kütüphane sabiti, girdi değil. Değiştirmeyin; görünürlük için açıklandı.',
          en: 'The transient crowbar current on top of switching power — a library constant, not an input. Do not change it; it is stated for visibility.',
        },
      },
    ],
    results: [
      { id: 'switching-power', label: { tr: 'Anahtarlama gücü', en: 'Switching power' }, unit: 'mW', basis: 'modelled' },
      { id: 'total-dynamic-power', label: { tr: 'Toplam dinamik güç', en: 'Total dynamic power' }, unit: 'mW', basis: 'modelled' },
      { id: 'energy-per-cycle', label: { tr: 'Döngü başına enerji', en: 'Energy per cycle' }, unit: 'pJ', basis: 'modelled' },
      { id: 'power-at-half-voltage', label: { tr: 'Gerilim yarıya inince güç', en: 'Power at half voltage' }, unit: 'mW', basis: 'modelled' },
    ],
  },

  // --------------------------------------------------------------------------
  {
    id: 'leakage',
    slug: 'kacak-akim',
    title: {
      tr: 'Kaçak akım gücü',
      en: 'Leakage power',
    },
    summary: {
      tr: 'Standart hücre sayısı ve birim genişlik başına referans kaçak akımından toplam kaçak akım ve güç; sıcaklık çarpanıyla birlikte.',
      en: 'Total leakage current and power from the standard-cell count and a reference per-width leakage, with the temperature multiplier shown.',
    },
    caveat: {
      tr: 'Referans kaçak akım bu siteden gelmez: döküphanenin kütüphane karakterizasyonundan gelmelidir, çünkü kaçak işlem ve köşe başına birkaç mertebeye değişir. Model yalnızca standart hücreleri sayar — SRAM bit hücresi, I/O ve analog kaçaklarını kapsamaz. Yüksek sıcaklık çarpanı, sonucu daha çok belirsizleştirir, daha az değil.',
      en: 'The reference leakage does not come from this site: it must come from the foundry’s library characterisation, since leakage varies by orders of magnitude per node and corner. The model counts standard cells only — SRAM bitcell, I/O and analog leakage are all absent. The hot-corner multiplier widens the uncertainty rather than narrowing it.',
    },
    inputs: [
      {
        id: 'cellCount',
        label: { tr: 'Standart hücre sayısı', en: 'Standard-cell count' },
        unit: 'count',
        default: 50_000,
        min: 100,
        max: 10_000_000,
        step: 100,
        help: {
          tr: 'Netlistteki standart hücre sayısı. Kapı eşdeğerine yakın ama aynı değil: makrolar ve bellek sayılmaz.',
          en: 'The number of standard cells in the netlist. Close to gate equivalents but not the same: macros and memories are excluded.',
        },
      },
      {
        id: 'referenceLeakageNa',
        label: { tr: 'Referans kaçak akım', en: 'Reference leakage' },
        unit: 'nA',
        default: 40,
        min: 0.1,
        max: 1000,
        step: 0.1,
        help: {
          tr: 'Referans genişlikteki bir hücrenin kaçak akımı, nanoamper. Değeri kütüphane datasheetinden alınız.',
          en: 'Leakage per cell at the reference width, in nA. Take the value from the library datasheet.',
        },
      },
      {
        id: 'widthUm',
        label: { tr: 'Ortalama hücre genişliği', en: 'Mean cell width' },
        unit: 'um',
        default: 0.1,
        min: 0.02,
        max: 50,
        step: 0.01,
        help: {
          tr: 'Netlistteki ortalama bir hücrenin toplam kapı genişliği.',
          en: 'The total gate width of the average cell in the netlist.',
        },
      },
      {
        id: 'referenceWidthUm',
        label: { tr: 'Referans genişlik', en: 'Reference width' },
        unit: 'um',
        default: 0.1,
        min: 0.02,
        max: 50,
        step: 0.01,
        help: {
          tr: 'Kaçak akımın hangi genişlik için belirtildiği — referans genişlik ile karşılaştırma, kaçakları ölçeklemiştir.',
          en: 'The width the reference leakage is stated at; the comparison to your mean width scales the leakage.',
        },
      },
      vddV,
      {
        id: 'temperatureC',
        label: { tr: 'Bağlantı sıcaklığı', en: 'Junction temperature' },
        unit: 'celsius',
        default: 85,
        min: -40,
        max: 150,
        step: 5,
        help: {
          tr: 'Diyelim ki sıcak ortamda, 85 °C müşteri aralığının tipik ucudur.',
          en: 'Assume the hot corner is 85 °C — the typical end of the customer temperature range.',
        },
      },
    ],
    results: [
      { id: 'leakage-current', label: { tr: 'Toplam kaçak akım', en: 'Total leakage current' }, unit: 'mA', basis: 'modelled' },
      { id: 'leakage-power', label: { tr: 'Kaçak gücü', en: 'Leakage power' }, unit: 'uW', basis: 'modelled' },
      { id: 'leakage-at-25c', label: { tr: 'Kaçak gücü, 25 °C', en: 'Leakage power at 25 °C' }, unit: 'uW', basis: 'modelled' },
    ],
  },

  // --------------------------------------------------------------------------
  {
    id: 'area',
    slug: 'alan',
    title: {
      tr: 'Çip alanı',
      en: 'Die area',
    },
    summary: {
      tr: 'Kapı eşdeğerleri, hücre alanı, yönlendirme yükü ve makro alanından toplam çip alanı ve kare kenar.',
      en: 'Total die area and its square edge from gate equivalents, cell area, routing overhead and macro area.',
    },
    caveat: {
      tr: 'Kapı eşdeğeri yalnızca kendi kütüphanesi içinde anlamlıdır; hücre alanı kütüphane başına 2–3 katına değişir. Yönlendirme yükü varsayılan bir tahminidir ve gerçek değer yerleşimden sonra bilinir. Yerleşim planı ödünşüz bir hücre dizimi kabul eder; gerçek bir döşenme bunu bozar.',
      en: 'A gate equivalent is meaningful only inside its own library; cell area varies 2–3× between libraries. The routing overhead default is an estimate until placement exists. The model assumes a uniform standard-cell sea; a real floorplan will disturb it.',
    },
    inputs: [
      {
        id: 'gateEquivalents',
        label: { tr: 'Kapı eşdeğeri', en: 'Gate equivalents' },
        unit: 'GE',
        default: 25_000,
        min: 100,
        max: 5_000_000,
        step: 100,
        help: {
          tr: 'Kütüphane 2-girişli NAND kapısına normalize edilmiş sayı — RTL sentezinin raporladığı “cell area” değil, “gate area” karşılığı.',
          en: 'Normalised to the library’s 2-input NAND — the “gate area” figure, not the “cell area” one a synthesis report prints.',
        },
      },
      {
        id: 'cellAreaPerGate',
        label: { tr: 'Kapı başına hücre alanı', en: 'Cell area per gate' },
        unit: 'um2',
        default: 0.8,
        min: 0.05,
        max: 50,
        step: 0.05,
        help: {
          tr: 'İşleme ve kütüphaneye bağlı: 180 nm’de ~5–10 µm², 28 nm’de ~0,7–1,2 µm².',
          en: 'Node- and library-dependent: ~5–10 µm² at 180 nm, ~0.7–1.2 µm² at 28 nm.',
        },
      },
      {
        id: 'routingOverhead',
        label: { tr: 'Yönlendirme yükü', en: 'Routing overhead' },
        unit: 'ratio',
        default: 0.4,
        min: 0.05,
        max: 2,
        step: 0.05,
        help: {
          tr: 'Çelik yerleşimde 0,3–0,6 bandı tipik; yerleşim olmadan bir tahmin.',
          en: '0.3–0.6 is typical for a routed block; an estimate before placement exists.',
        },
      },
      {
        id: 'macroArea',
        label: { tr: 'Makro alanı toplamı', en: 'Total macro area' },
        unit: 'um2',
        default: 0,
        min: 0,
        max: 1_000_000_000,
        step: 10_000,
        help: {
          tr: 'SRAM,PLL, I/O ve diğer makroların toplam silikon alanı. Hücre alanının üstüne eklenir, çıkarılmaz.',
          en: 'Total silicon area of SRAM, PLL, I/O and any other macros. Added to cell area, never subtracted.',
        },
      },
    ],
    results: [
      { id: 'cell-area', label: { tr: 'Hücre alanı', en: 'Cell area' }, unit: 'um2', basis: 'modelled' },
      { id: 'total-area', label: { tr: 'Toplam çip alanı', en: 'Total die area' }, unit: 'um2', basis: 'modelled' },
      { id: 'die-square', label: { tr: 'Kare kenar', en: 'Square edge' }, unit: 'um', basis: 'modelled' },
      { id: 'routing-overhead', label: { tr: 'Yönlendirme yükü', en: 'Routing overhead' }, unit: 'percent', basis: 'modelled' },
    ],
  },

  // --------------------------------------------------------------------------
  {
    id: 'yield',
    slug: 'verim',
    title: {
      tr: 'Verim',
      en: 'Yield',
    },
    summary: {
      tr: 'Murphy modeliyle, kusur yoğunluğu ve çip alanından verim. Kötümser sınırdır ve bunu söyleyerek verilir.',
      en: 'Yield from defect density and die area under Murphy’s model — the pessimistic bound, and labelled as one.',
    },
    caveat: {
      tr: 'D₀ bu siteden gelmez: döküphanenin kendi kusur raporundan alınmalıdır. Murphy modeli bir üst sınırdır — gerçek verim genelde daha iyidir, çünkü bir kusur her çipi öldürmez. Bir red-andöndürme (redundancy) katmanı verimi yukarı taşır; modelden düşük çıkar.',
      en: 'D₀ does not come from this site: take it from the foundry’s own defect report. Murphy’s model is an upper bound on the loss — real yield is usually better because a defect does not kill every die. Built-in redundancy lifts yield above it.',
    },
    inputs: [defectDensity, dieArea],
    results: [
      { id: 'die-area-cm2', label: { tr: 'Çip alanı (cm²)', en: 'Die area (cm²)' }, unit: 'um2', basis: 'modelled' },
      { id: 'yield', label: { tr: 'Verim', en: 'Yield' }, unit: 'percent', basis: 'modelled' },
    ],
  },

  // --------------------------------------------------------------------------
  {
    id: 'cost-per-die',
    slug: 'cip-maliyeti',
    title: {
      tr: 'İyi çip başına maliyet',
      en: 'Cost per good die',
    },
    summary: {
      tr: 'Vaft maliyeti, çip sayısı ve Murphy veriminden iyi çip başına maliyet — maske ve NRE hariç, tapeout kararını yöneten sayı.',
      en: 'Cost per good die from wafer cost, dies per wafer and Murphy yield — excluding masks and NRE, the number that decides a tapeout.',
    },
    caveat: {
      tr: 'Maske seti ve tasarım NRE dahil değildir; bunlar ilk yıllarda maliyeti domine eder ve hacimle amorti olur. Vaft fiyatı dökümhaneye, verime ve miktara göre değişir. Verimdeki belirsizlik maliyete orantısız geçer: küçük bir D₀ hatası, maliyeti iki katına çıkarabilir.',
      en: 'Mask and NRE costs are excluded; they dominate the first year and amortise with volume. Wafer cost depends on the foundry, the node and the volume. Uncertainty in yield passes into cost unequally: a small error in D₀ can double the figure.',
    },
    inputs: [
      {
        id: 'waferCost',
        label: { tr: 'Vaft maliyeti', en: 'Wafer cost' },
        unit: 'USD',
        default: 4500,
        min: 500,
        max: 50_000,
        step: 100,
        help: {
          tr: 'Tek bir vaft için döküphanenin fiyatı, amortisman dahil. Hacim indirimleri dışarıda kalır.',
          en: 'The foundry’s price for one wafer, depreciation included. Volume discounts are not modelled.',
        },
      },
      {
        id: 'waferDiameter',
        label: { tr: 'Vaft çapı', en: 'Wafer diameter' },
        unit: 'mm',
        default: 300,
        min: 100,
        max: 450,
        step: 25,
        help: {
          tr: '300 mm standart; 200 mm eski düğümlerde hâlâ yaygın.',
          en: '300 mm is the standard; 200 mm persists at older nodes.',
        },
      },
      dieArea,
      {
        id: 'scribeWidth',
        label: { tr: 'Test payı', en: 'Scribe width' },
        unit: 'um',
        default: 60,
        min: 20,
        max: 200,
        step: 5,
        help: {
          tr: 'Bitişik çiplerin arasındaki test ve kesim payı.',
          en: 'The kerf between dies: street width plus seal ring.',
        },
      },
      {
        id: 'edgeExclusion',
        label: { tr: 'Kenar hariç tutma', en: 'Edge exclusion' },
        unit: 'mm',
        default: 3,
        min: 0,
        max: 10,
        step: 0.5,
        help: {
          tr: 'Vaft kenarındaki kullanılamayan halka genişliği.',
          en: 'The unusable ring at the wafer edge.',
        },
      },
      defectDensity,
    ],
    results: [
      { id: 'dies-per-wafer', label: { tr: 'Vaft başına çip', en: 'Dies per wafer' }, unit: 'count', basis: 'modelled' },
      { id: 'good-dies', label: { tr: 'Vaft başına iyi çip', en: 'Good dies per wafer' }, unit: 'count', basis: 'modelled' },
      { id: 'cost-per-good-die', label: { tr: 'İyi çip başına maliyet', en: 'Cost per good die' }, unit: 'USD', basis: 'modelled' },
    ],
  },

  // --------------------------------------------------------------------------
  {
    id: 'slack',
    slug: 'zamanlama-payi',
    title: {
      tr: 'Kurulum ve tutma payı',
      en: 'Setup and hold slack',
    },
    summary: {
      tr: 'Bir register-register yolu için kurulum ve tutma payı; saat belirsizliği ve sarsıntı ayrı girdiler olarak.',
      en: 'Setup and hold slack for one register-to-register path, with clock uncertainty and jitter as separate inputs.',
    },
    caveat: {
      tr: 'Bu model tek bir yoldur, bütün bir ağaç değil: köşe ağacı, saat ağacının gecikmesi ve çapraz konuşma yoktur. Kurulum payı negatifse tasarım o köşede kapanmaz — ama pozitif olmak da kapanmayı kanıtlamaz; gerçek bir STA olmadan bu araca asla güvenilmemelidir.',
      en: 'This models one path, not the whole netlist: corner tree, clock-tree insertion delay and crosstalk are all absent. A negative setup slack means the design does not close at this corner — but a positive one proves nothing, and this tool never replaces a real STA.',
    },
    inputs: [
      {
        id: 'clockPeriod',
        label: { tr: 'Saat peryodu', en: 'Clock period' },
        unit: 'ns',
        default: 2.0,
        min: 0.1,
        max: 100,
        step: 0.1,
        help: {
          tr: 'Hedef frekansın peryodu. 2 ns = 500 MHz.',
          en: 'The period at the target frequency. 2 ns = 500 MHz.',
        },
      },
      {
        id: 'clkToQ',
        label: { tr: 'Saatten çıkışa gecikme', en: 'Clock-to-Q delay' },
        unit: 'ns',
        default: 0.12,
        min: 0.01,
        max: 10,
        step: 0.01,
        help: {
          tr: 'Rejistronun saat kenarından Q çıkışına kadar geçen gecikme, aday köşede.',
          en: 'From the clock edge at the launch register to data valid at Q, at the nominal corner.',
        },
      },
      {
        id: 'logicDelay',
        label: { tr: 'Yol lojik gecikmesi', en: 'Path logic delay' },
        unit: 'ns',
        default: 0.9,
        min: 0.01,
        max: 100,
        step: 0.01,
        help: {
          tr: 'Rejistrondan rejistrana, kesişen yoldaki toplam lojik + tel gecikmesi.',
          en: 'Total logic plus wire delay from launch register to capture register, on the investigated path.',
        },
      },
      {
        id: 'clockSkew',
        label: { tr: 'Saat kayması', en: 'Clock skew' },
        unit: 'ns',
        default: 0.05,
        min: 0,
        max: 5,
        step: 0.005,
        help: {
          tr: 'Yakalama ve yayan saat arasındaki yörünge farkı. Kayma kurulum payını artırır, tutma payını azaltır.',
          en: 'The launch/capture clock timing difference. Skew helps setup and hurts hold.',
        },
      },
      {
        id: 'jitter',
        label: { tr: 'Saat sarsıntısı', en: 'Clock jitter' },
        unit: 'ns',
        default: 0.02,
        min: 0,
        max: 5,
        step: 0.005,
        help: {
          tr: 'Saat kaynağının devredeki döngü-döngü değişikliği.',
          en: 'Cycle-to-cycle variation from the clock source.',
        },
      },
      {
        id: 'uncertainty',
        label: { tr: 'Zamanlama belirsizliği', en: 'Timing uncertainty' },
        unit: 'ns',
        default: 0.05,
        min: 0,
        max: 5,
        step: 0.005,
        help: {
          tr: 'Ekstraksiyon ve modellendirmede kaynaklanan STA marjı. 0,05 ns tipik; agresif kapanışlarda daha dar.',
          en: 'The STA margin for extraction and modelling error. 0.05 ns is typical; aggressive closures run tighter.',
        },
      },
      {
        id: 'requiredHold',
        label: { tr: 'Gerekli tutma süresi', en: 'Required hold time' },
        unit: 'ns',
        default: 0.05,
        min: 0,
        max: 5,
        step: 0.005,
        help: {
          tr: 'Kütüphanedeki minimum tutma süresi. Hızlı köşede test edilir.',
          en: 'The library’s minimum hold time, checked at the fast corner.',
        },
      },
    ],
    results: [
      { id: 'setup-slack', label: { tr: 'Kurulum payı', en: 'Setup slack' }, unit: 'ps', basis: 'modelled' },
      { id: 'hold-slack', label: { tr: 'Tutma payı', en: 'Hold slack' }, unit: 'ps', basis: 'modelled' },
      { id: 'fmax-with-margin', label: { tr: 'Pay düşülmüş frekans', en: 'Frequency with margin removed' }, unit: 'MHz', basis: 'modelled' },
    ],
  },

  // --------------------------------------------------------------------------
  {
    id: 'licence-economics',
    slug: 'lisans-ekonomisi',
    title: {
      tr: 'Lisans ekonomisi',
      en: 'Licence economics',
    },
    summary: {
      tr: 'Peşin lisans ücreti ile birim başına royaltinin kırılma noktası; NRE ile karşılaştırma dahil.',
      en: 'The breakeven volume between an up-front licence fee and a per-unit royalty, with a build-in-house comparison.',
    },
    caveat: {
      tr: 'Kırılma noktası, belirsizliği üretim tahmininden alan bir fiyat karşılaştırmasıdır. Royalti tabanı için bir sözleşme gerekir; buradaki aritmetik, o sözleşmenin altındaki sayıları karşılaştırır. Peşin ödemede bir NRE kalemi varsa — ki bu sitede yoktur — modele ayrıca girilmelidir.',
      en: 'The breakeven is a price comparison whose uncertainty comes from the production forecast, not the arithmetic. The royalty basis is contractual and this tool only compares the numbers beneath it. A bespoke NRE on top — which this site does not sell — would have to enter the model separately.',
    },
    inputs: [
      {
        id: 'licenceFee',
        label: { tr: 'Peşin lisans ücreti', en: 'Up-front licence fee' },
        unit: 'USD',
        default: 85_000,
        min: 0,
        max: 5_000_000,
        step: 1000,
        help: {
          tr: 'Üretim lisansının peşin bedeli. Bu sitede fiyatlar henüz yayımlanmadı; dökümü talep sırasında alınır.',
          en: 'The up-front cost of the production licence. Prices on this site are not yet published; request a quote.',
        },
      },
      {
        id: 'royaltyPerUnit',
        label: { tr: 'Birim başına royalti', en: 'Royalty per unit' },
        unit: 'USD',
        default: 2.5,
        min: 0,
        max: 100,
        step: 0.1,
        help: {
          tr: 'İmzalanmış bir sözleşmenin birim başına royaltisi. Sıfırsa kırılma noktası yoktur; karşılaştırma baskıyla peşin ücret olur.',
          en: 'The contractual per-unit royalty. At zero there is no breakeven and the up-front fee is the comparison.',
        },
      },
      {
        id: 'productionUnits',
        label: { tr: 'Öngörülen üretim hacmi', en: 'Forecast production volume' },
        unit: 'count',
        default: 50_000,
        min: 100,
        max: 100_000_000,
        step: 1000,
        help: {
          tr: 'Cihazın ömrü boyunca beklenen toplam üretim. Hacmin belirsizliği, karşılaştırmanın belirsizliğidir.',
          en: 'Total expected production over the product’s life. The uncertainty in this number dominates the comparison.',
        },
      },
      {
        id: 'evaluationFee',
        label: { tr: 'Sıfırdan tasarım maliyeti', en: 'Cost of building in-house' },
        unit: 'USD',
        default: 5_000,
        min: 0,
        max: 5_000_000,
        step: 1000,
        help: {
          tr: 'Aynı fonksiyonun sıfırdan geliştirilmesine dair kaba tahmin — karşılaştırmanın tarafı.',
          en: 'A rough estimate for developing the same function from scratch — the other side of the comparison.',
        },
      },
    ],
    results: [
      { id: 'breakeven-units', label: { tr: 'Kırılma hacmi', en: 'Breakeven volume' }, unit: 'count', basis: 'modelled' },
      { id: 'total-cost', label: { tr: 'Toplam sahip olma maliyeti', en: 'Total cost of ownership' }, unit: 'USD', basis: 'modelled' },
      { id: 'licence-plus-nre', label: { tr: 'Lisansla karşılaştırma', en: 'Licence versus build-in-house' }, unit: 'USD', basis: 'modelled' },
    ],
  },
]

/** One tool by id, for the calculator routes. */
export function toolFor(id: string): Tool | null {
  return tools.find((tool) => tool.id === id) ?? null
}

/** One tool by route slug. Slugs are Turkish route paths and are never translated. */
export function toolForSlug(slug: string): Tool | null {
  return tools.find((tool) => tool.slug === slug) ?? null
}