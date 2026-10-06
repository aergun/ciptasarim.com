/**
 * `CT-CLK-DIV` — a soft RTL core, placeholder shell.
 *
 * Second soft-RTL family file. See `content/cores.ts` for why every core on this
 * site is a shell with no characterised figure.
 */

import type { SoftRtlSpec } from '../../shared/types.ts'
import { figureAt, uncharacterisedAtEveryNode } from './_placeholder.ts'

const spec: SoftRtlSpec = {
  gateEquivalents: uncharacterisedAtEveryNode({
    tr: 'Bu çekirdek için hiçbir düğümde karakterize edilmiş bir kütüphaneye karşı sentez çalışması yapılmadı. Bir bölümcünün kapı sayısı, seçilen mimariye alışılmadık kadar duyarlıdır — aynı orana sahip bir kaydır-çıkar bölümcü ile bir resiprok bölümcü tek büyüklük mertebesiyle ayrılır — bu yüzden sayı, hangi mimari olduğu belirtilmeden anlam taşımaz.',
    en: 'No synthesis has been run against a characterised library at any node for this core. A divider’s gate count is unusually sensitive to the architecture chosen for it — a shift-and-subtract divider and a reciprocal divider of the same ratio differ by an order of magnitude — so the count is meaningless without stating which one it is.',
  }),
  maxFrequency: uncharacterisedAtEveryNode({
    tr: 'Bu çekirdek için hiçbir düğümde zamanlama kapatması yapılmadı. Bir bölümcü için ilginç sınır genellikle saat değil çıkış frekansıdır ve bu sayı, bölüm mimarisine ve hedef orana bağlıdır; yapılandırılabilir bir çekirdek için ikisi de sabit değildir.',
    en: 'No timing closure has been performed on this core at any node. For a divider the interesting limit is usually the output frequency rather than the clock, and that figure depends on the divider architecture and the target ratio, neither of which is fixed for a configurable core.',
  }),
  power: uncharacterisedAtEveryNode({
    tr: 'Bölücü güç, sayaç kademelerinin etkinliğine hâkimdir; bu etkinlik, fiilen kullanılan bölme oranına bağlıdır. Mimari ve oran sabitlenmeden yayımlanacak tek bir sayı yoktur ve burada ikisi de sabitlenmemiştir.',
    en: 'Divider power is dominated by the activity of the counter stages, which depends on the division ratio actually used. There is no single figure to publish without fixing both the architecture and a ratio, and neither is fixed here.',
  }),
  ports: [
    {
      name: 'clk_in',
      direction: 'in',
      kind: 'clock',
      width: 1,
      description: {
        tr: 'Giriş saat sinyali.',
        en: 'Input clock signal.',
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
      name: 'div_ratio',
      direction: 'in',
      kind: 'data',
      width: 8,
      description: {
        tr: 'Bölme oranı. Geçersiz bir değer verildiğinde çıktı saatinin davranışı mimariye bağlıdır ve henüz belirlenmemiştir.',
        en: 'Division ratio. When an invalid value is presented, the behaviour of the output clock is architecture-dependent and has not been determined.',
      },
    },
    {
      name: 'clk_out',
      direction: 'out',
      kind: 'clock',
      width: 1,
      description: {
        tr: 'Bölünmüş çıkış saati. Frekans aralığı karakterizasyonla belirlenir.',
        en: 'Divided output clock. The supported frequency range follows the characterisation.',
      },
    },
    {
      name: 'locked',
      direction: 'out',
      kind: 'control',
      width: 1,
      description: {
        tr: 'Çıkış saati kararlıdır; bölme oranı değişiminden sonra yerleşmiştir.',
        en: 'The output clock is stable and has settled after a ratio change.',
      },
    },
  ],
}

const figures = [
  {
    id: 'clock-divider-gate-equivalents',
    label: { tr: 'Kapı eşdeğeri', en: 'Gate equivalents' },
    figure: figureAt(spec.gateEquivalents, '28nm'),
    note: {
      tr: 'Bölücülerde bu sayı mimariye göre bir büyüklük mertebesi değişebilir; yayımlanmadan önce mimari belirtilmelidir.',
      en: 'For dividers this figure can differ by an order of magnitude with the architecture, which would have to be stated before any number were published.',
    },
  },
  {
    id: 'clock-divider-max-frequency',
    label: { tr: 'Maksimum giriş frekansı', en: 'Maximum input frequency' },
    figure: figureAt(spec.maxFrequency, '28nm'),
  },
  {
    id: 'clock-divider-power',
    label: { tr: 'Güç', en: 'Power' },
    figure: figureAt(spec.power, '28nm'),
  },
]

export const clockDivider = {
  kind: 'soft-rtl',
  slug: 'clock-divider',
  name: 'CT-CLK-DIV',
  family: 'ct-clock',
  summary: {
    tr: 'Programlanabilir tam sayı bölücü; tek bir saat alanından düşük frekanslı saat alanları üretir.',
    en: 'A programmable integer divider, producing lower-rate clock domains from a single clock domain.',
  },
  description: {
    tr: 'CT-CLK-DIV, bir üst frekanslı saatten daha yavaş çalışan mantık alanları türetir. Saat bölmenin sık görülen ve çoğu zaman hafife alınan riski, bölücünün uzun süre kilitli görünmesi hâlinde çıkış saatinin durmasıdır; bu yüzden kilit durumu ayrı bir çıkış olarak belgelenmiştir.\n\nBu bir kabuk kayıttır ve hiçbir düğümde karakterize edilmemiştir. Bölücü mimarisi — geri besleme, sayma ya da özyineleme — yayımlanacak herhangi bir kapı veya frekans sayısından önce kararlaştırılmalıdır, çünkü bu sayılar doğrudan ona bağlıdır.',
    en: 'CT-CLK-DIV derives slower logic domains from a faster clock. The common and often-missed risk in clock division is the divider appearing locked while its output has in fact stopped, which is why the locked state is documented as a separate output.\n\nThis is a shell record and has not been characterised at any node. The divider architecture — feedback, counting or recursive — has to be settled before any gate or frequency figure is published, because those figures follow directly from it.',
  },
  tags: ['clock', 'divider', 'clock-domain', 'cdc'],
  nodes: ['180nm', '130nm', '90nm', '65nm', '40nm', '28nm', '22nm', '16nm', '14nm'],
  spec,
  figures,
  documents: [],
} as const