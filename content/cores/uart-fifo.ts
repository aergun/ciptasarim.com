/**
 * `CT-UART-FIFO` — a soft RTL core, placeholder shell.
 *
 * One core per family per the plan, so a contributor adds a core without touching
 * anything else. Every figure below is `uncharacterised`; see `content/cores.ts`
 * for why that is the state of the whole catalogue.
 */

import type { Figure, SoftRtlSpec } from '../../shared/types.ts'
import { figureAt, uncharacterisedAtEveryNode } from './_placeholder.ts'

/**
 * Every figure here is absent at every node, and `_placeholder.ts` explains why
 * that is a call rather than fourteen hand-written keys.
 */
const spec: SoftRtlSpec = {
  gateEquivalents: uncharacterisedAtEveryNode({
    tr: 'Bu çekirdek için bir kapı sayısı üretilmedi. Karakterize edilmiş bir kütüphaneye karşı hiçbir düğümde sentez çalışması yapılmadı; karakterize edilmemiş bir kütüphaneden alınan kapı sayısı, bu çekirdeğin değil, o kütüphanenin hücre tanımlarını yansıtırdı.',
    en: 'No gate count has been produced for this core. Synthesis has not been run against a characterised library at any node, and a gate count taken from an uncharacterised library would reflect that library’s cell definitions rather than this core.',
  }),
  maxFrequency: uncharacterisedAtEveryNode({
    tr: 'Bu çekirdek için hiçbir düğümde zamanlama kapatması yapılmadı. Burada görünecek sayı, standart hücre kütüphanesinin, kısıtların ve ara bağlantının bir işlevidir; üçü de düğüme ve PDK’ye göredir ve hiçbirini yayımlamadık.',
    en: 'No timing closure has been performed on this core at any node. The number that would appear here is a function of the standard-cell library, the constraints and the interconnect — all three of which are per-node and per-PDK, and none of which we have published.',
  }),
  power: uncharacterisedAtEveryNode({
    tr: 'Bu çekirdek için güç ölçülmedi ve modellenmedi. Güç, çekirdeğin değil, çekirdeği kullanan tasarımın bir özelliği olan etkinlik faktörüne bağlıdır; bu nedenle karakterize edilmiş bir sayı bile belirli bir etkinlik varsayımına dayanarak verilirdi.',
    en: 'Power has not been measured or modelled for this core. It depends on an activity factor, which is a property of the design that instantiates the core rather than of the core itself, so even a characterised figure would be quoted against a stated activity assumption.',
  }),
  ports: [
    {
      name: 'clk',
      direction: 'in',
      kind: 'clock',
      width: 1,
      description: {
        tr: 'Saat girişi. Frekans aralığı, çekirdeğin zamanlama karakterizasyonuna bağlıdır ve henüz belirtilmemiştir.',
        en: 'Clock input. The supported frequency range follows the core’s timing characterisation and has not been stated.',
      },
    },
    {
      name: 'rst_n',
      direction: 'in',
      kind: 'reset',
      width: 1,
      description: {
        tr: 'Asenkron, düşük seviyeli etkin sıfırlama.',
        en: 'Asynchronous, active-low reset.',
      },
    },
    {
      name: 'wr_en',
      direction: 'in',
      kind: 'control',
      width: 1,
      description: {
        tr: 'Yazma etkin. Çekirdek eşzamanlı olarak okuma ve yazma kabul eder.',
        en: 'Write enable. The core accepts reads and writes on the same cycle.',
      },
    },
    {
      name: 'rd_en',
      direction: 'in',
      kind: 'control',
      width: 1,
      description: {
        tr: 'Okuma etkin.',
        en: 'Read enable.',
      },
    },
    {
      name: 'wr_data',
      direction: 'in',
      kind: 'data',
      width: 8,
      description: {
        tr: 'Yazma verisi.',
        en: 'Write data.',
      },
    },
    {
      name: 'rd_data',
      direction: 'out',
      kind: 'data',
      width: 8,
      description: {
        tr: 'Okuma verisi.',
        en: 'Read data.',
      },
    },
    {
      name: 'full',
      direction: 'out',
      kind: 'control',
      width: 1,
      description: {
        tr: 'FIFO dolu. Yazma bu sinyal yüksekken kabul edilmez.',
        en: 'FIFO full. A write is not accepted while this is high.',
      },
    },
    {
      name: 'empty',
      direction: 'out',
      kind: 'control',
      width: 1,
      description: {
        tr: 'FIFO boş. Okuma bu sinyal yüksekken geçerli veri taşımaz.',
        en: 'FIFO empty. A read does not return valid data while this is high.',
      },
    },
  ],
}

/**
 * The rendered spec table.
 *
 * Authored rather than derived from `spec`, because the order a buyer reads in is
 * not the order the types are declared in. Each `id` is stable — it is what a
 * comparison column and a translation lookup key on, so renaming one is a
 * breaking change to the URL fragment and to the deep link in the docs.
 */
const figures = [
  {
    id: 'uart-fifo-gate-equivalents',
    label: { tr: 'Kapı eşdeğeri', en: 'Gate equivalents' },
    figure: figureAt(spec.gateEquivalents, '28nm') as Figure,
    note: {
      tr: 'Sentezlenmiş bir çekirdek için yayınlanan sayı, referans kütüphaneye bağlıdır ve tek başına bir özellik değildir.',
      en: 'A gate count published for a synthesised core depends on the reference library and is not a specification on its own.',
    },
  },
  {
    id: 'uart-fifo-max-frequency',
    label: { tr: 'Maksimum frekans', en: 'Maximum frequency' },
    figure: figureAt(spec.maxFrequency, '28nm') as Figure,
  },
  {
    id: 'uart-fifo-power',
    label: { tr: 'Güç', en: 'Power' },
    figure: figureAt(spec.power, '28nm') as Figure,
    note: {
      tr: 'Herhangi bir güç sayısı, çekirdeği kullanan tasarımın etkinlik faktörüyle birlikte verilmelidir.',
      en: 'Any power figure must be quoted together with the activity factor of the design instantiating the core.',
    },
  },
] as const

export const uartFifo = {
  kind: 'soft-rtl',
  slug: 'uart-fifo',
  name: 'CT-UART-FIFO',
  family: 'ct-interface',
  summary: {
    tr: 'Genişliği ayarlanabilir, eşzamanlı FIFO tamponu; akan veriyi saat sınırından ayırır.',
    en: 'A configurable-width synchronous FIFO buffer, decoupling streaming traffic from the clock boundary.',
  },
  description: {
    tr: 'CT-UART-FIFO, bir akış ile onu tüketen mantık arasında tampon görevi görür. Yerel bir FIFO olmasının nedeni genellikle hız eşleştirmedir: iki saat alanı farklı çalışır ve aradaki veri yolunda ne sıra ne de sınır garanti edilmez. Bu çekirdek o sınırı koyar ve akışa arka plan çalışması için zaman verir.\n\nBu bir kabuk kayıttır. Frekans, kapı sayısı ve güç karakterizasyonu hiçbir düğümde yapılmamıştır; yukarıdaki hücreler bunun yerine nedenini söyler. Port listesi arayüzün şeklini belgelemek içindir ve bir teslim edilebilir büyüklük iddiası değildir.',
    en: 'CT-UART-FIFO sits between a stream and the logic consuming it, and exists as a local FIFO for what is usually a rate-matching problem: two clock domains run at different rates and neither ordering nor boundary is guaranteed on the data path between them. This core puts that boundary back, and gives the stream time to run work in the background.\n\nThis is a shell record. Frequency, gate count and power have not been characterised at any node; the cells above say why instead. The port list documents the shape of the interface and is not a claim about a deliverable.',
  },
  tags: ['fifo', 'buffer', 'clock-domain', 'interface', 'uart'],
  nodes: ['180nm', '130nm', '90nm', '65nm', '40nm', '28nm', '22nm', '16nm'],
  spec,
  figures,
  documents: [],
} as const