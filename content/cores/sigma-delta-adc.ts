/**
 * `CT-SD-ADC-12` — an analog / mixed-signal core, placeholder shell.
 *
 * ## Why this kind has no area and no frequency
 *
 * An ADC has no gate count and no maximum clock, and adding either field would be
 * worse than useless: a reader comparing an ENOB of 12.2 against a soft-RTL core's
 * 180 MHz is comparing two things that do not share a dimension, and the
 * comparison would look reasonable and mean nothing.
 *
 * The measured quantities for a converter are different in kind as well.
 * `enob` is a *resolution* — it is derived from the SNR of a sinusoid, and it
 * changes with input frequency. `sndr` is the figure ENOB is computed from, so
 * quoting one without the other is quoting half a conversion. `sampleRate` is a
 * property of the sampling architecture, not of the digital side.
 *
 * So this arm carries exactly three figures and an input range, and the input
 * range is a `T` rather than a `Figure` because it is a compound statement about
 * supply and signal together — see `AnalogSpec.inputRange` in `shared/types.ts`.
 */

import type { AnalogSpec } from '../../shared/types.ts'
import { figureAt, uncharacterisedAtEveryNode } from './_placeholder.ts'

const spec: AnalogSpec = {
  enob: uncharacterisedAtEveryNode({
    tr: 'ENOB, bir sinüzoidal giriş ile ölçülen SNR’den türetilir ve giriş frekansıyla değişir. Kazanç, frekans ve referans gerilimi belirtilmeden verilen bir ENOB, hangi koşulda ölçüldüğü belli olmayan bir sayıdır.',
    en: 'ENOB is derived from the SNR measured on a sine input and varies with the input frequency. An ENOB stated without gain, frequency and reference voltage is a number whose measurement conditions are unknown.',
  }),
  sndr: uncharacterisedAtEveryNode({
    tr: 'SNDR dönüştürücünün gürültü tabanını verir ve ENOB bunun türetilmesidir; ölçüm bandı, kazanç ve örnekleme hızı belirtilmeden yayımlanamaz.',
    en: 'SNDR gives the converter’s noise floor and ENOB is derived from it; it cannot be published without the measurement band, the gain and the sample rate.',
  }),
  sampleRate: uncharacterisedAtEveryNode({
    tr: 'Örnekleme hızı dönüştürücünün mimarisinden gelir. Bu çekirdek için mimari belirlenmemiştir ve karar verildiğinde frekans, ENOB ile birlikte tek bir mimari tanımının parçası olarak verilmelidir.',
    en: 'The sample rate follows from the converter’s architecture. No architecture has been chosen for this core; when it is chosen, the rate must be published as part of a single architectural definition, together with ENOB.',
  }),
  inputRange: {
    tr: 'Giriş aralığı, besleme gerilimiyle birlikte verilmelidir. Bu değerler henüz belirlenmemiştir ve yayımlanacak tek doğru biçim, aralığın iki ucunu ve beslemeyi tek bir cümlede göstermektir.',
    en: 'An input range must be stated together with the supply voltage. These values have not been determined, and the only correct form in which to publish them is a single sentence giving both ends of the range and the supply alongside it.',
  },
  ports: [
    {
      name: 'CLK',
      direction: 'in',
      kind: 'clock',
      width: 1,
      description: {
        tr: 'Örnekleme saati. Desteklenen aralık mimariye bağlıdır ve belirlenmemiştir.',
        en: 'Sampling clock. The supported range is architecture-dependent and undetermined.',
      },
    },
    {
      name: 'AINP',
      direction: 'in',
      kind: 'analog',
      width: 1,
      description: {
        tr: 'Tek uçlu diferansiyel olmayan giriş.',
        en: 'Single-ended non-differential input.',
      },
    },
    {
      name: 'AINN',
      direction: 'in',
      kind: 'analog',
      width: 1,
      description: {
        tr: 'Tek uçlu diferansiyel olmayan yardımcı giriş.',
        en: 'Single-ended non-differential auxiliary input.',
      },
    },
    {
      name: 'DOUT',
      direction: 'out',
      kind: 'data',
      width: 12,
      description: {
        tr: 'İki kişilik tamamlayıcı çıktı.',
        en: 'Two’s-complement output.',
      },
    },
    {
      name: 'DRDY',
      direction: 'out',
      kind: 'control',
      width: 1,
      description: {
        tr: 'Dönüşüm tamamlandı; DOUT verisi geçerlidir.',
        en: 'Conversion complete; DOUT is valid.',
      },
    },
    {
      name: 'VREF',
      direction: 'in',
      kind: 'analog',
      width: 1,
      description: {
        tr: 'Harici referans gerilimi.',
        en: 'External reference voltage.',
      },
    },
    {
      name: 'DVDD',
      direction: 'in',
      kind: 'power',
      width: 1,
      description: {
        tr: 'Dijital besleme.',
        en: 'Digital supply.',
      },
    },
    {
      name: 'AVDD',
      direction: 'in',
      kind: 'power',
      width: 1,
      description: {
        tr: 'Analog besleme.',
        en: 'Analog supply.',
      },
    },
  ],
}

const figures = [
  {
    id: 'sigma-delta-adc-enob',
    label: { tr: 'ENOB', en: 'ENOB' },
    figure: figureAt(spec.enob, '40nm'),
    note: {
      tr: 'ENOB yalnızca giriş frekansı, kazanç ve ölçüm bandıyla birlikte anlamlıdır. Koşul belirtilmeden verilen bir ENOB, hangi sinüzoidin kaç dB SNR’sine karşılık geldiğini söylemez.',
      en: 'An ENOB figure is only meaningful with an input frequency, a gain and a measurement bandwidth. Without those, the number does not say which sine wave’s SNR it corresponds to.',
    },
  },
  {
    id: 'sigma-delta-adc-sndr',
    label: { tr: 'SNDR', en: 'SNDR' },
    figure: figureAt(spec.sndr, '40nm'),
  },
  {
    id: 'sigma-delta-adc-sample-rate',
    label: { tr: 'Örnekleme hızı', en: 'Sample rate' },
    figure: figureAt(spec.sampleRate, '40nm'),
  },
]

export const sigmaDeltaAdc = {
  kind: 'analog',
  slug: 'sd-adc-12',
  name: 'CT-SD-ADC-12',
  family: 'ct-converter',
  summary: {
    tr: 'Sinyal ile gürültü oranını çözünürlük olarak ifade eden, 12-bit sınıfı sigma-delta analog-dijital dönüştürücü.',
    en: 'A 12-bit-class sigma-delta analogue-to-digital converter expressing resolution as a signal-to-noise ratio.',
  },
  description: {
    tr: 'CT-SD-ADC-12, bir sigma-delta dönüştürücü mimarisini temsil eder: çözünürlük, hız yerine gürültü şekillendirme ile satın alınır. Mimarileri birbirine karşı savunulabilir olsa da bu çekirdek şu anda bir kabuktur.\n\nAnalog tarafta “kapı sayısı” ve “maksimum frekans” soruları yanlış sorulardır; bu yüzden bu türde alan ve frekans alanları **yoktur** ve karşılaştırma tablosu onları istemeyi reddeder. Buradaki üç sayı da ölçüm koşuluna bağlıdır ve koşul belirtilmeden hiçbiri yayımlanamaz.\n\nUyarı: bu bir kabuk kayıttır. Referans gerilimi, giriş aralığı ve besleme değerleri belirlenmeden tasarıma uygunluğu üzerine karar verilemez.',
    en: 'CT-SD-ADC-12 stands for a sigma-delta converter architecture: resolution is bought with noise shaping rather than with speed. The architectures are defensibly debated, but this core is currently a shell.\n\nOn the analog side, “gate count” and “maximum frequency” are the wrong questions, which is why this kind has **no area and no frequency fields at all** and the comparison table refuses to ask for them. All three figures here depend on measurement conditions, and none can be published without those conditions.\n\nWarning: this is a shell record. No decision about design suitability can be made before the reference voltage, input range and supply values are determined.',
  },
  tags: ['adc', 'sigma-delta', 'analog', 'mixed-signal', 'converter', '12-bit'],
  nodes: ['180nm', '130nm', '90nm', '65nm', '40nm'],
  spec,
  figures,
  documents: [],
} as const