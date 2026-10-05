/**
 * `CT-SRAM-16x512` — a hard macro, placeholder shell.
 *
 * ## The PDK reference on this kind is mandatory, and deliberately empty
 *
 * A hard macro is physical. It is laid out on silicon by a foundry against a
 * specific PDK at a specific revision, and its area, density and timing are
 * properties of *that* PDK, not of the RTL and not of this design house. There is
 * no portable form of the answer.
 *
 * So `pdk` is a required field on this arm of the union — not optional metadata —
 * and `PdkReference.source` is `string | null` for the same reason `Process.source`
 * is: **a reference that has not been confirmed must be unable to claim that it
 * was.** Every one of `foundry`, `pdkVersion` and `source` below is empty, and the
 * page renders that emptiness rather than naming a foundry we have not agreed with.
 *
 * Naming a foundry and version here would be the single most misleading thing this
 * site could do for a hard macro, because a customer who reads "TSMC 65nm N10" will
 * treat the macro as portable to that node. It is not ours to assert, and until a
 * PDK is in hand it is not a fact we hold.
 */

import type { HardMacroSpec, PdkReference } from '../../shared/types.ts'
import { figureAt, uncharacterisedAtEveryNode } from './_placeholder.ts'

const spec: HardMacroSpec = {
  density: uncharacterisedAtEveryNode(
    'Bit başına alan (µm²/bit) bir PDK özelliğidir ve verilemez. Aynı bellek makrosu farklı bir PDK sürümünde, aynı düğüm adı altında farklı bir alan kaplar; PDK sürümü belirtilmeden yayımlanan bir yoğunluk, okuyucuya taşınamaz bir rakam verir.',
  ),
  macroArea: uncharacterisedAtEveryNode(
    'Makro alanı fiziksel yerleşimdir ve ancak bir PDK’da uygulanmış bir tasarımın ölçümü veya fiziksel doğrulama çıktısıdır. Bu çekirdek için yerleşim yapılmamıştır.',
  ),
  maxFrequency: uncharacterisedAtEveryNode(
    'Frekans, PDK hücre kütüphanesi ve fiziksel yerleşim tarafından belirlenir. Aynı makronun farklı bir PDK sürümünde aynı saat hızına eriştiği varsayılamaz.',
  ),
  ports: [
    {
      name: 'clk',
      direction: 'in',
      kind: 'clock',
      width: 1,
      description: {
        tr: 'Saat girişi. Frekans aralığı PDK’ya bağlıdır.',
        en: 'Clock input. The supported frequency range is a property of the PDK.',
      },
    },
    {
      name: 'cs_n',
      direction: 'in',
      kind: 'control',
      width: 1,
      description: {
        tr: 'Düşük seviyeli etkin çip seçimi.',
        en: 'Active-low chip select.',
      },
    },
    {
      name: 'we_n',
      direction: 'in',
      kind: 'control',
      width: 1,
      description: {
        tr: 'Düşük seviyeli etkin yazma etkinliği.',
        en: 'Active-low write enable.',
      },
    },
    {
      name: 'din',
      direction: 'in',
      kind: 'data',
      width: 16,
      description: {
        tr: 'Makroya verilen veri girişi.',
        en: 'Data input to the macro.',
      },
    },
    {
      name: 'dout',
      direction: 'out',
      kind: 'data',
      width: 16,
      description: {
        tr: 'Makrodan okunan veri çıkışı.',
        en: 'Data output from the macro.',
      },
    },
    {
      name: 'VDD',
      direction: 'in',
      kind: 'power',
      width: 1,
      description: {
        tr: 'Besleme. Anma gerilimi PDK’ya bağlıdır ve henüz belirtilmemiştir.',
        en: 'Supply. The nominal voltage follows the PDK and has not been stated.',
      },
    },
    {
      name: 'VSS',
      direction: 'in',
      kind: 'power',
      width: 1,
      description: {
        tr: 'Toprak dönüşü.',
        en: 'Ground return.',
      },
    },
  ],
}

/**
 * The PDK this macro is built against.
 *
 * Every field is empty, and the empty string is a *statement* — see the note in
 * `content/processes.ts` on why a cell says what is missing rather than staying
 * blank. `source: null` is the load-bearing one: it is what stops this row claiming
 * a foundry PDK document we have not read.
 */
const pdk: PdkReference = {
  foundry: {
    tr: 'Henüz belirlenmemiştir. Bu makro için bir dökümhaneye bağlanmamıştır.',
    en: 'Not yet determined. No foundry has been committed for this macro.',
  },
  node: '65nm',
  pdkVersion: {
    tr: 'Henüz belirlenmemiştir.',
    en: 'Not yet determined.',
  },
  source: null,
}

const figures = [
  {
    id: 'sram-macro-density',
    label: { tr: 'Yoğunluk (µm²/bit)', en: 'Density (µm²/bit)' },
    figure: figureAt(spec.density, '65nm'),
    note: {
      tr: 'Bu sayı ancak adı verilmiş bir PDK sürümüyle birlikte anlamlıdır. Aynı düğüm adı, farklı PDK sürümünde farklı bir alan demektir.',
      en: 'This figure is only meaningful alongside a named PDK revision. The same node name denotes a different area at a different PDK revision.',
    },
  },
  {
    id: 'sram-macro-area',
    label: { tr: 'Makro alanı (µm²)', en: 'Macro area (µm²)' },
    figure: figureAt(spec.macroArea, '65nm'),
  },
  {
    id: 'sram-macro-max-frequency',
    label: { tr: 'Maksimum frekans', en: 'Maximum frequency' },
    figure: figureAt(spec.maxFrequency, '65nm'),
  },
]

export const sramMacro = {
  kind: 'hard-macro',
  slug: 'sram-16x512',
  name: 'CT-SRAM-16x512',
  family: 'ct-memory',
  summary: {
    tr: 'Tek portlu, düşük voltajlı SRAM bellek makrosu.',
    en: 'Single-port, low-voltage SRAM memory macro.',
  },
  description: {
    tr: 'CT-SRAM-16x512, tek portlu bir SRAM makrosudur: her döngüde ya okuma ya yazma yapar. Bu, bellek alanını verimli kılan en küçük yapıdır, çünkü ek bir port ek alan ve ek güç demektir ve tasarımın çoğu zaman ikisine de ihtiyacı yoktur.\n\nBu bir kabuk kayıttır. Bir hard makronun yayımlanabilir özelliklerinin tamamı PDK’ya bağlıdır ve PDK henüz belirlenmemiştir; bu yüzden yoğunluk, alan ve frekans hücreleri nedenlerini taşır ve sayı taşımaz. Özellikle `foundry` alanının boş bırakılması bilinçlidir — henüz üzerinde anlaşılmadığımız bir dökümhaneye referans vermek, müşterinin bu makroyu o düğüme taşınabilir saymasına yol açardı.',
    en: 'CT-SRAM-16x512 is a single-port SRAM macro: it reads or writes on any given cycle. That is the smallest structure that makes a memory area worthwhile, because each additional port costs area and power, and most designs need neither.\n\nThis is a shell record. Every publishable characteristic of a hard macro is a property of its PDK, and no PDK has been determined; the density, area and frequency cells therefore carry reasons rather than values. The empty `foundry` field in particular is deliberate — naming a foundry we have not committed to would lead a customer to read the macro as portable to that node.',
  },
  tags: ['sram', 'memory', 'macro', 'hard-macro', 'single-port'],
  nodes: ['130nm', '90nm', '65nm', '40nm'],
  spec,
  pdk,
  figures,
  documents: [],
} as const