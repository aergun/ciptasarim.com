/**
 * `CT-UVM-INTERCONNECT` — verification collateral, placeholder shell.
 *
 * ## The kind with no physical figures at all
 *
 * This is the arm that proves the discriminated union was necessary. A UVM
 * environment has no area, no frequency, no power and no input range — not because
 * those are unknown, but because the questions do not apply. A verification
 * environment is not laid out; it is not clocked in a way that has a maximum
 * frequency.
 *
 * Adding an area field here would be a real regression even as a nullable one,
 * because a comparison table that can show an empty cell for this kind will happily
 * show `0`, or a dash, or a blank that reads as a formatting failure — and a reader
 * cannot distinguish "this does not apply" from "this is missing", which is the
 * exact confusion `uncharacterised` was designed to prevent for the other three
 * kinds. **The correct encoding of "does not apply" is a type that lacks the field.**
 *
 * The two figures that *do* exist are properties of the collateral as an artefact:
 * how many assertions it contains and what code coverage it reaches. Both are
 * uncharacterised below.
 */

import type { VerificationSpec } from '../../shared/types.ts'
import { figureAt, uncharacterisedAtEveryNode } from './_placeholder.ts'

const spec: VerificationSpec = {
  assertions: uncharacterisedAtEveryNode({
    tr: 'Doğrulama ortamının assertion sayısı yayımlanabilir bir özelliktir, ancak tek başına anlamlı değildir: bin assertion, zayıf bir ortam olabilir. Sayı, ortamın kapsadığı hataların türleriyle birlikte verilmelidir ve bu ortam henüz yazılmamıştır.',
    en: 'An environment’s assertion count is a publishable property but means little on its own: a thousand assertions can be a weak environment. The number must be published together with the classes of bug the environment covers, and this environment has not been written yet.',
  }),
  coverage: uncharacterisedAtEveryNode({
    tr: 'Kapsam yüzdesi, hangi kapsam modelinin kullanıldığına bağlıdır. Fonksiyonel, kod ve durum kapsamı aynı projede farklı sayılar verir ve hepsini tek bir “kapsam” değeriyle özetlemek yanıltıcıdır. Kullanılacak model belirlenmemiştir.',
    en: 'A coverage percentage depends on which coverage model is used. Functional, code and state coverage give different numbers on the same project, and summarising all of them in one "coverage" value is misleading. The model to be used has not been determined.',
  }),
  standard: {
    tr: 'Standart henüz belirlenmemiştir. Ortamın hangi güvenlik gereksinimi için yazıldığı, iddiaların neden var olduğunu açıklar; bu olmadan bir assertion sayısı anlam taşımaz.',
    en: 'No standard has been determined yet. The safety requirement a verification environment is written against is what explains why its assertions exist, and without it an assertion count carries no meaning.',
  },
}

const figures = [
  {
    id: 'uvm-assertions',
    label: { tr: 'Assertion sayısı', en: 'Assertion count' },
    figure: figureAt(spec.assertions, '28nm'),
    note: {
      tr: 'Bu değer tek başına nitelik ölçütü değildir; sayı, ortamın hangi hata sınıflarını kapsadığıyla birlikte okunmalıdır.',
      en: 'This figure is not a quality metric on its own. It has to be read together with the classes of bug the environment covers.',
    },
  },
  {
    id: 'uvm-coverage',
    label: { tr: 'Kod kapsamı', en: 'Code coverage' },
    figure: figureAt(spec.coverage, '28nm'),
    note: {
      tr: 'Hangi kapsam modelinin esas alındığı belirtilmelidir; fonksiyonel, kod ve durum kapsamı birbirinin yerine geçmez.',
      en: 'The underlying coverage model must be named: functional, code and state coverage are not interchangeable.',
    },
  },
]

export const uvmEnvironment = {
  kind: 'verification',
  slug: 'uvm-interconnect',
  name: 'CT-UVM-INTERCONNECT',
  family: 'ct-verification',
  summary: {
    tr: 'Arayüz çekirdekleri için UVM doğrulama ortamı; assertion tabanlı ortam ve kapsam modeli.',
    en: 'A UVM verification environment for interface cores, with an assertion-based environment and coverage model.',
  },
  description: {
    tr: 'CT-UVM-INTERCONNECT, arayüz çekirdeklerinin doğrulanması için bir ortamdır: sürücü, izleyici, assertion tabanlı kontroller ve bir kapsam modeli. Bu tür, IP sağlayıcısının ürünü olarak en ucuz olanıdır, çünkü müşteriye yalnızca RTL’sini entegre edebilen biri için değeri sınırlıdır.\n\nBu bir kabuk kayıttır ve özellikle bu türde eksiklik en çok göze çarpar, çünkü ortamın fiziksel hiçbir özelliği yoktur. Alan ve frekans alanları bu yüzden **yoktur** — yalnızca uygulanmayan bir şeyi boş bırakmaktansa, alan hiç tanımlanmamış olması doğru gösterimdir. Bir assertion sayısının ne anlama geldiğini açıklayan güvenlik standardı da henüz belirlenmemiştir.',
    en: 'CT-UVM-INTERCONNECT is an environment for verifying interface cores: a driver, a monitor, assertion-based checks and a coverage model. Of the four kinds here it is the cheapest as a vendor product, because it has little value to anyone who cannot integrate the RTL.\n\nThis is a shell record, and on this kind the omission is most visible, because the environment has no physical characteristics at all. Area and frequency fields therefore **do not exist** — a field that is not declared is a truer statement than one left empty, because an empty cell renders as a dash or a zero that a reader cannot distinguish from missing data. The safety standard that would give an assertion count its meaning has not been determined either.',
  },
  tags: ['uvm', 'verification', 'assertion', 'coverage', 'collateral'],
  nodes: ['180nm', '130nm', '90nm', '65nm', '40nm', '28nm'],
  spec,
  figures,
  documents: [],
} as const