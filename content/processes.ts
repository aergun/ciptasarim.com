/**
 * The process node table — 180 nm to 2 nm, all fourteen.
 *
 * ⚠️ **EVERY CELL IN THIS FILE IS `uncharacterised`, AND THAT IS THE POINT.**
 *
 * The site ships the full node range on purpose, because a reader asking about a
 * node deserves an answer, and here the honest answer is "we have not measured that
 * here" for all of them. That is what makes this table useful rather than empty: it
 * converts a silence into a statement, and a statement is something a customer can
 * act on.
 *
 * What this file deliberately does **not** do is fill a cell with a number.
 *
 * A defect density, a cell area and a leakage current are the three figures in the
 * whole project with the widest blast radius — the process table is the input to
 * `area`, `yield`, `cost-per-die` and `leakage`, so a wrong figure here propagates
 * into every one of those calculators, and then into a customer's cost model, and
 * then into a tapeout decision. Each of those numbers is a property of *this
 * foundry's PDK at this revision*, which is a document we hold and a document a
 * reader can check. A value invented here would be indistinguishable from one read
 * out of it.
 *
 * `source: null` on every `Process`, for the same reason and by the same mechanism:
 * `PdkReference` and `Process` both carry `source: string | null` precisely so that
 * a row cannot claim provenance it does not have. These rows claim none.
 *
 * ## `null` versus `uncharacterised`, and why this file has neither `null`
 *
 * `ByNode<F>` allows `null` for "not offered here". That distinction matters on a
 * *core*, where "there is no 180 nm version" and "there is a 180 nm version we have
 * not characterised" are different facts a buyer weighs differently.
 *
 * It does not apply to this table. A row here is a *claim about a node*, not an
 * offer, and the row is present precisely so the absence can be recorded. Writing
 * `null` would say "no claim made about 180 nm", which is weaker and less useful
 * than saying "no claim made, and here is exactly what is missing". So every row is
 * present and every cell explains itself.
 *
 * ## Language of these reasons
 *
 * `Figure.reason` is a `T`, so every reason below carries Turkish and English text
 * and cannot fall half-translated: the badge and the prose beneath it are always in
 * the reader's own language.
 *
 * The `en:` strings are the original English prose from the first authoring of this
 * file, preserved verbatim — same words, same punctuation. The `tr:` strings are
 * their committed Turkish counterparts, written in the register of the rest of the
 * Turkish prose in this project.
 */

import type { Process, ProcessNode } from '../shared/types.ts'
import { PROCESS_NODES } from '../shared/types.ts'

/**
 * One row per node, keyed by `ProcessNode`.
 *
 * Typed as `Record<ProcessNode, Process>` rather than an array so that adding a
 * node to `PROCESS_NODES` is a compile error naming the missing key. An array would
 * have accepted thirteen rows silently, and a thirteen-row process table is a table
 * that has quietly stopped covering 2 nm.
 */
const TABLE: Record<ProcessNode, Process> = {
  '180nm': {
    node: '180nm',
    cellArea: {
      basis: 'uncharacterised',
      reason:
        { tr: 'Bu proje için 180 nm’de karakterize edilmiş bir standart hücre kütüphanesi bulunmadığından, aktarılacak bir µm²/GE değeri yok. Alan hesaplayıcısını bu tablo gibi bir tablodan değil, dökümhanenizin kendi kütüphane veri sayfasından besleyin.', en: 'No standard-cell library has been characterised at 180 nm for this project, so there is no µm²/GE figure to quote. Feed the area calculator from your foundry’s own library datasheet rather than from a table like this one.' },
    },
    defectDensity: {
      basis: 'uncharacterised',
      reason:
        { tr: '180 nm’de karakterize edilmedi. Kusur yoğunluğu dökümhanelere özgü bir değerdir, bir süreç ailesine değil; olgun bir 180 nm nitelendirme partisi ile hacim partisi arasında, buradaki makul cevapların tüm aralığından daha fazla değişir.', en: 'Not characterised at 180 nm. Defect density is a foundries’ figure, not a process-family one, and it varies between a mature 180 nm qualification lot and a volume lot by more than the whole range of plausible answers here.' },
    },
    metalLayers: {
      basis: 'uncharacterised',
      reason:
        { tr: 'Belirli bir 180 nm PDK revizyonuna karşı doğrulanmadı. Metal katman sayısı bir PDK özelliğidir; revizyonu belirtmeden aktarmak, okuyucunun doğrulayamayacağı bir sayı aktarmak olur.', en: 'Not confirmed against a specific 180 nm PDK revision. Metal layer count is a PDK property; quoting it without naming the revision would be quoting a number the reader cannot check.' },
    },
    vdd: {
      basis: 'uncharacterised',
      reason:
        { tr: '180 nm’de henüz karakterize edilmiş bir çekirdek bulunmuyor, dolayısıyla ölçülmüş bir besleme gerilimi yok. Nominal VDD, dökümhanenizin kendi standart hücre kütüphanesine aittir.', en: 'No characterised core runs at 180 nm yet, so there is no measured supply voltage. The nominal VDD belongs to your PDK’s own standard-cell library.' },
    },
    leakage: {
      basis: 'uncharacterised',
      reason:
        { tr: '180 nm’de karakterize edilmedi. Kapı genişliğinin her mikronuna düşen kaçak akım, dökümhanenin kütüphanesinden gelmek zorundadır; kaçak akım hesaplayıcısı bunu tam da bu nedenle bir girdi olarak ister.', en: 'Not characterised at 180 nm. Leakage per micron of gate width must come from the foundry’s library; the leakage calculator asks for it as an input for exactly this reason.' },
    },
    bondPitch: {
      basis: 'uncharacterised',
      reason:
        { tr: 'Ölçülmedi. Bond pitch bir paket özelliğidir, bir süreç özelliği değil; ve bu tablo, verisi olmayan bir değeri kaydetmek için doğru yer değildir.', en: 'Not measured. Bond pitch is a package property, not a process property, and this table is not the place to record one we have no data for.' },
    },
    source: null,
  },

  '130nm': {
    node: '130nm',
    cellArea: {
      basis: 'uncharacterised',
      reason:
        { tr: 'Bu proje için, 130 nm karakterize edilmiş bir kütüphaneye karşı sentez çalışması yapılmadı. Yapılana kadar buradaki hiçbir kapı sayısı bir alana dönüştürülemez; çünkü bir kapı sayısı, ancak sayıldığı kütüphane karşısında anlamlıdır.', en: 'No synthesised run against a 130 nm characterised library has been run for this project. Until it has, no gate count here converts to an area, because a gate count is only meaningful against the library it was counted in.' },
    },
    defectDensity: {
      basis: 'uncharacterised',
      reason:
        { tr: '130 nm’de karakterize edilmedi. 130 nm nitelendirme partisinden herhangi bir verim verisi alınmadı.', en: 'Not characterised at 130 nm. No yield data has been taken from a 130 nm qualification lot.' },
    },
    metalLayers: {
      basis: 'uncharacterised',
      reason:
        { tr: 'Adı belirtilen bir 130 nm PDK revizyonuna karşı doğrulanmadı.', en: 'Not confirmed against a named 130 nm PDK revision.' },
    },
    vdd: {
      basis: 'uncharacterised',
      reason:
        { tr: '130 nm’de karakterize edilmedi. Karakterize edilmiş bir çalışmadan ölçülmüş besleme gerilimi yok.', en: 'Not characterised at 130 nm. No measured supply voltage from a characterised run.' },
    },
    leakage: {
      basis: 'uncharacterised',
      reason:
        { tr: '130 nm’de karakterize edilmedi. Kaçak akım bütçesi kapatılmadan önce 130 nm kütüphanesinin kaçak akım değeri gereklidir.', en: 'Not characterised at 130 nm. The 130 nm library leakage figure is required before the leakage budget can be closed.' },
    },
    bondPitch: {
      basis: 'uncharacterised',
      reason:
        { tr: '130 nm’de ölçülmedi. Pakete bağlıdır ve kayıt altına alınmamıştır.', en: 'Not measured at 130 nm. Package-dependent and unrecorded.' },
    },
    source: null,
  },

  '90nm': {
    node: '90nm',
    cellArea: {
      basis: 'uncharacterised',
      reason:
        { tr: 'Henüz karakterize edilmiş bir 90 nm kütüphanesine karşı sentez yapılmadı. Bu düğümde, bu proje için sentez çalışması yürütülmedi.', en: 'Not synthesised against a characterised 90 nm library yet. Synthesis has not been run for this project at this node.' },
    },
    defectDensity: {
      basis: 'uncharacterised',
      reason:
        { tr: '90 nm’de karakterize edilmedi. Burada gereken değer, söz konusu katman yığını için dökümhane tarafından yayımlanmış bir D0 değeridir.', en: 'Not characterised at 90 nm. The value required here is a foundry-published D0 for the specific layer stack.' },
    },
    metalLayers: {
      basis: 'uncharacterised',
      reason:
        { tr: 'Bir 90 nm PDK revizyonuna karşı doğrulanmadı.', en: 'Not confirmed against a 90 nm PDK revision.' },
    },
    vdd: {
      basis: 'uncharacterised',
      reason:
        { tr: '90 nm’de karakterize edilmedi.', en: 'Not characterised at 90 nm.' },
    },
    leakage: {
      basis: 'uncharacterised',
      reason:
        { tr: '90 nm’de karakterize edilmedi. Bu düğümdeki kaçak akım ölçeklemesi, kütüphanenin sunduğu eşik gerilimi karışımına bağlıdır; biz henüz bir seçim yapmadık.', en: 'Not characterised at 90 nm. Leakage scaling across this node depends on the threshold-voltage mix the library ships, which we have not selected.' },
    },
    bondPitch: {
      basis: 'uncharacterised',
      reason:
        { tr: '90 nm’de ölçülmedi.', en: 'Not measured at 90 nm.' },
    },
    source: null,
  },

  '65nm': {
    node: '65nm',
    cellArea: {
      basis: 'uncharacterised',
      reason:
        { tr: 'Karakterize edilmiş bir 65 nm kütüphanesine karşı sentez yapılmadı. Bu düğümde kapı sayısı çıkarımı yapılmadı.', en: 'Not synthesised against a characterised 65 nm library. No gate count has been extracted at this node.' },
    },
    defectDensity: {
      basis: 'uncharacterised',
      reason:
        { tr: '65 nm’de karakterize edilmedi.', en: 'Not characterised at 65 nm.' },
    },
    metalLayers: {
      basis: 'uncharacterised',
      reason:
        { tr: 'Bir 65 nm PDK revizyonuna karşı doğrulanmadı. Bu düğümde katman yığını, dökümhaneler arasında önemli ölçüde değişir; tam da bu nedenle doğrulanmamış bir sayı, hiç olmamasından daha kötüdür.', en: 'Not confirmed against a 65 nm PDK revision. At this node the layer stack changes materially between foundries, which is precisely why an unconfirmed count is worse than none.' },
    },
    vdd: {
      basis: 'uncharacterised',
      reason:
        { tr: '65 nm’de karakterize edilmedi.', en: 'Not characterised at 65 nm.' },
    },
    leakage: {
      basis: 'uncharacterised',
      reason:
        { tr: '65 nm’de karakterize edilmedi.', en: 'Not characterised at 65 nm.' },
    },
    bondPitch: {
      basis: 'uncharacterised',
      reason:
        { tr: '65 nm’de ölçülmedi.', en: 'Not measured at 65 nm.' },
    },
    source: null,
  },

  '40nm': {
    node: '40nm',
    cellArea: {
      basis: 'uncharacterised',
      reason:
        { tr: 'Karakterize edilmiş bir 40 nm kütüphanesine karşı sentez yapılmadı. Bu düğümde zamanlama ya da alan çalışması yapılmadı.', en: 'Not synthesised against a characterised 40 nm library. No timing or area run has been performed at this node.' },
    },
    defectDensity: {
      basis: 'uncharacterised',
      reason:
        { tr: '40 nm’de karakterize edilmedi.', en: 'Not characterised at 40 nm.' },
    },
    metalLayers: {
      basis: 'uncharacterised',
      reason:
        { tr: 'Bir 40 nm PDK revizyonuna karşı doğrulanmadı.', en: 'Not confirmed against a 40 nm PDK revision.' },
    },
    vdd: {
      basis: 'uncharacterised',
      reason:
        { tr: '40 nm’de karakterize edilmedi.', en: 'Not characterised at 40 nm.' },
    },
    leakage: {
      basis: 'uncharacterised',
      reason:
        { tr: '40 nm’de karakterize edilmedi.', en: 'Not characterised at 40 nm.' },
    },
    bondPitch: {
      basis: 'uncharacterised',
      reason:
        { tr: '40 nm’de ölçülmedi.', en: 'Not measured at 40 nm.' },
    },
    source: null,
  },

  '28nm': {
    node: '28nm',
    cellArea: {
      basis: 'uncharacterised',
      reason:
        { tr: 'Henüz karakterize edilmiş bir 28 nm kütüphanesine karşı sentez yapılmadı. Bu düğüm yol haritasında yer alır; tamamlanmış bir karakterizasyon çalışması yoktur.', en: 'Not synthesised against a characterised 28 nm library yet. This node is on the roadmap; no characterisation run has been completed.' },
    },
    defectDensity: {
      basis: 'uncharacterised',
      reason:
        { tr: '28 nm’de karakterize edilmedi.', en: 'Not characterised at 28 nm.' },
    },
    metalLayers: {
      basis: 'uncharacterised',
      reason:
        { tr: 'Bir 28 nm PDK revizyonuna karşı doğrulanmadı.', en: 'Not confirmed against a 28 nm PDK revision.' },
    },
    vdd: {
      basis: 'uncharacterised',
      reason:
        { tr: '28 nm’de karakterize edilmedi.', en: 'Not characterised at 28 nm.' },
    },
    leakage: {
      basis: 'uncharacterised',
      reason:
        { tr: '28 nm’de karakterize edilmedi.', en: 'Not characterised at 28 nm.' },
    },
    bondPitch: {
      basis: 'uncharacterised',
      reason:
        { tr: '28 nm’de ölçülmedi.', en: 'Not measured at 28 nm.' },
    },
    source: null,
  },

  '22nm': {
    node: '22nm',
    cellArea: {
      basis: 'uncharacterised',
      reason:
        { tr: 'Karakterize edilmiş bir 22 nm kütüphanesine karşı sentez yapılmadı. Bu düğümde çıkarım (extraction) çalışması yapılmadı.', en: 'Not synthesised against a characterised 22 nm library. No extraction run has been performed at this node.' },
    },
    defectDensity: {
      basis: 'uncharacterised',
      reason:
        { tr: '22 nm’de karakterize edilmedi.', en: 'Not characterised at 22 nm.' },
    },
    metalLayers: {
      basis: 'uncharacterised',
      reason:
        { tr: 'Bir 22 nm PDK revizyonuna karşı doğrulanmadı.', en: 'Not confirmed against a 22 nm PDK revision.' },
    },
    vdd: {
      basis: 'uncharacterised',
      reason:
        { tr: '22 nm’de karakterize edilmedi.', en: 'Not characterised at 22 nm.' },
    },
    leakage: {
      basis: 'uncharacterised',
      reason:
        { tr: '22 nm’de karakterize edilmedi.', en: 'Not characterised at 22 nm.' },
    },
    bondPitch: {
      basis: 'uncharacterised',
      reason:
        { tr: '22 nm’de ölçülmedi.', en: 'Not measured at 22 nm.' },
    },
    source: null,
  },

  '16nm': {
    node: '16nm',
    cellArea: {
      basis: 'uncharacterised',
      reason:
        { tr: 'Karakterize edilmiş bir 16 nm kütüphanesine karşı sentez yapılmadı. Bu düğümde karakterizasyon başlamadı.', en: 'Not synthesised against a characterised 16 nm library. Characterisation at this node has not started.' },
    },
    defectDensity: {
      basis: 'uncharacterised',
      reason:
        { tr: '16 nm’de karakterize edilmedi.', en: 'Not characterised at 16 nm.' },
    },
    metalLayers: {
      basis: 'uncharacterised',
      reason:
        { tr: 'Bir 16 nm PDK revizyonuna karşı doğrulanmadı.', en: 'Not confirmed against a 16 nm PDK revision.' },
    },
    vdd: {
      basis: 'uncharacterised',
      reason:
        { tr: '16 nm’de karakterize edilmedi.', en: 'Not characterised at 16 nm.' },
    },
    leakage: {
      basis: 'uncharacterised',
      reason:
        { tr: '16 nm’de karakterize edilmedi.', en: 'Not characterised at 16 nm.' },
    },
    bondPitch: {
      basis: 'uncharacterised',
      reason:
        { tr: '16 nm’de ölçülmedi.', en: 'Not measured at 16 nm.' },
    },
    source: null,
  },

  '14nm': {
    node: '14nm',
    cellArea: {
      basis: 'uncharacterised',
      reason:
        { tr: 'Karakterize edilmiş bir 14 nm kütüphanesine karşı sentez yapılmadı. Bu düğümde çalışma yapılmadı.', en: 'Not synthesised against a characterised 14 nm library. No run at this node.' },
    },
    defectDensity: {
      basis: 'uncharacterised',
      reason:
        { tr: '14 nm’de karakterize edilmedi.', en: 'Not characterised at 14 nm.' },
    },
    metalLayers: {
      basis: 'uncharacterised',
      reason:
        { tr: 'Bir 14 nm PDK revizyonuna karşı doğrulanmadı. Bu düğümde birbiriyle uyumsuz birkaç katman yığını üretimdedir; revizyonu belirtilmeden aktarılan bir sayı, hangisinin olduğu hakkındaki bir tahmin olur.', en: 'Not confirmed against a 14 nm PDK revision. At this node several incompatible layer stacks are in production, so a count quoted without the revision would be a guess about which one.' },
    },
    vdd: {
      basis: 'uncharacterised',
      reason:
        { tr: '14 nm’de karakterize edilmedi.', en: 'Not characterised at 14 nm.' },
    },
    leakage: {
      basis: 'uncharacterised',
      reason:
        { tr: '14 nm’de karakterize edilmedi.', en: 'Not characterised at 14 nm.' },
    },
    bondPitch: {
      basis: 'uncharacterised',
      reason:
        { tr: '14 nm’de ölçülmedi.', en: 'Not measured at 14 nm.' },
    },
    source: null,
  },

  '12nm': {
    node: '12nm',
    cellArea: {
      basis: 'uncharacterised',
      reason:
        { tr: 'Karakterize edilmiş bir 12 nm kütüphanesine karşı sentez yapılmadı. Bu düğümde çalışma yapılmadı.', en: 'Not synthesised against a characterised 12 nm library. No run at this node.' },
    },
    defectDensity: {
      basis: 'uncharacterised',
      reason:
        { tr: '12 nm’de karakterize edilmedi.', en: 'Not characterised at 12 nm.' },
    },
    metalLayers: {
      basis: 'uncharacterised',
      reason:
        { tr: 'Bir 12 nm PDK revizyonuna karşı doğrulanmadı.', en: 'Not confirmed against a 12 nm PDK revision.' },
    },
    vdd: {
      basis: 'uncharacterised',
      reason:
        { tr: '12 nm’de karakterize edilmedi.', en: 'Not characterised at 12 nm.' },
    },
    leakage: {
      basis: 'uncharacterised',
      reason:
        { tr: '12 nm’de karakterize edilmedi.', en: 'Not characterised at 12 nm.' },
    },
    bondPitch: {
      basis: 'uncharacterised',
      reason:
        { tr: '12 nm’de ölçülmedi.', en: 'Not measured at 12 nm.' },
    },
    source: null,
  },

  '7nm': {
    node: '7nm',
    cellArea: {
      basis: 'uncharacterised',
      reason:
        { tr: 'Henüz karakterize edilmiş bir 7 nm kütüphanesine karşı sentez yapılmadı. Bu düğüm, karakterizasyon yol haritasındaki ilk düğümdür ve tamamlanmış bir çalışma yoktur.', en: 'Not synthesised against a characterised 7 nm library yet. This node is the first on the characterisation roadmap and no run has been completed.' },
    },
    defectDensity: {
      basis: 'uncharacterised',
      reason:
        { tr: '7 nm’de karakterize edilmedi.', en: 'Not characterised at 7 nm.' },
    },
    metalLayers: {
      basis: 'uncharacterised',
      reason:
        { tr: 'Bir 7 nm PDK revizyonuna karşı doğrulanmadı.', en: 'Not confirmed against a 7 nm PDK revision.' },
    },
    vdd: {
      basis: 'uncharacterised',
      reason:
        { tr: '7 nm’de karakterize edilmedi.', en: 'Not characterised at 7 nm.' },
    },
    leakage: {
      basis: 'uncharacterised',
      reason:
        { tr: '7 nm’de karakterize edilmedi.', en: 'Not characterised at 7 nm.' },
    },
    bondPitch: {
      basis: 'uncharacterised',
      reason:
        { tr: '7 nm’de ölçülmedi.', en: 'Not measured at 7 nm.' },
    },
    source: null,
  },

  '5nm': {
    node: '5nm',
    cellArea: {
      basis: 'uncharacterised',
      reason:
        { tr: 'Karakterize edilmiş bir 5 nm kütüphanesine karşı sentez yapılmadı. Bu düğümde karakterizasyon başlamadı.', en: 'Not synthesised against a characterised 5 nm library. Characterisation at this node has not started.' },
    },
    defectDensity: {
      basis: 'uncharacterised',
      reason:
        { tr: '5 nm’de karakterize edilmedi.', en: 'Not characterised at 5 nm.' },
    },
    metalLayers: {
      basis: 'uncharacterised',
      reason:
        { tr: 'Bir 5 nm PDK revizyonuna karşı doğrulanmadı.', en: 'Not confirmed against a 5 nm PDK revision.' },
    },
    vdd: {
      basis: 'uncharacterised',
      reason:
        { tr: '5 nm’de karakterize edilmedi.', en: 'Not characterised at 5 nm.' },
    },
    leakage: {
      basis: 'uncharacterised',
      reason:
        { tr: '5 nm’de karakterize edilmedi.', en: 'Not characterised at 5 nm.' },
    },
    bondPitch: {
      basis: 'uncharacterised',
      reason:
        { tr: '5 nm’de ölçülmedi.', en: 'Not measured at 5 nm.' },
    },
    source: null,
  },

  '3nm': {
    node: '3nm',
    cellArea: {
      basis: 'uncharacterised',
      reason:
        { tr: 'Karakterize edilmiş bir 3 nm kütüphanesine karşı sentez yapılmadı. Bu düğümde çalışma yapılmadı.', en: 'Not synthesised against a characterised 3 nm library. No run at this node.' },
    },
    defectDensity: {
      basis: 'uncharacterised',
      reason:
        { tr: '3 nm’de karakterize edilmedi.', en: 'Not characterised at 3 nm.' },
    },
    metalLayers: {
      basis: 'uncharacterised',
      reason:
        { tr: 'Bir 3 nm PDK revizyonuna karşı doğrulanmadı.', en: 'Not confirmed against a 3 nm PDK revision.' },
    },
    vdd: {
      basis: 'uncharacterised',
      reason:
        { tr: '3 nm’de karakterize edilmedi.', en: 'Not characterised at 3 nm.' },
    },
    leakage: {
      basis: 'uncharacterised',
      reason:
        { tr: '3 nm’de karakterize edilmedi.', en: 'Not characterised at 3 nm.' },
    },
    bondPitch: {
      basis: 'uncharacterised',
      reason:
        { tr: '3 nm’de ölçülmedi.', en: 'Not measured at 3 nm.' },
    },
    source: null,
  },

  '2nm': {
    node: '2nm',
    cellArea: {
      basis: 'uncharacterised',
      reason:
        { tr: 'Karakterize edilmiş bir 2 nm kütüphanesine karşı sentez yapılmadı. Bu düğümde çalışma yapılmadı; 2 nm, bir müşterinin sorabileceği aralığın yanıtlanması gerektiği için listelenmiştir — burada karakterize edilmiş bir şey olduğu için değil.', en: 'Not synthesised against a characterised 2 nm library. No run at this node; 2 nm is listed because the range of what a customer may ask about should be answered, not because anything is characterised here.' },
    },
    defectDensity: {
      basis: 'uncharacterised',
      reason:
        { tr: '2 nm’de karakterize edilmedi.', en: 'Not characterised at 2 nm.' },
    },
    metalLayers: {
      basis: 'uncharacterised',
      reason:
        { tr: 'Bir 2 nm PDK revizyonuna karşı doğrulanmadı.', en: 'Not confirmed against a 2 nm PDK revision.' },
    },
    vdd: {
      basis: 'uncharacterised',
      reason:
        { tr: '2 nm’de karakterize edilmedi.', en: 'Not characterised at 2 nm.' },
    },
    leakage: {
      basis: 'uncharacterised',
      reason:
        { tr: '2 nm’de karakterize edilmedi.', en: 'Not characterised at 2 nm.' },
    },
    bondPitch: {
      basis: 'uncharacterised',
      reason:
        { tr: '2 nm’de ölçülmedi.', en: 'Not measured at 2 nm.' },
    },
    source: null,
  },
}

/**
 * The table, in `PROCESS_NODES` order — coarse to fine.
 *
 * Built by mapping the taxonomy rather than exporting `TABLE` directly, so the
 * ordering is the taxonomy's and cannot drift from it, and so a node added to
 * `PROCESS_NODES` without a row is a compile error at `TABLE`'s type annotation
 * rather than a silently absent row.
 */
export const processes: readonly Process[] = PROCESS_NODES.map((node) => TABLE[node])

/** One node's row, or `null` for an id that is not a node this table covers. */
export function processFor(node: string): Process | null {
  return processes.find((p) => p.node === node) ?? null
}

/**
 * The six `Figure` fields on a `Process`, in the order the table displays them.
 *
 * `node` and `source` are excluded: the first is the key, the second is the
 * provenance that would *say* a cell is characterised. Neither is a cell.
 */
const FIGURE_FIELDS = [
  'cellArea',
  'defectDensity',
  'metalLayers',
  'vdd',
  'leakage',
  'bondPitch',
] as const satisfies readonly (keyof Process)[]

/**
 * Nodes with at least one characterised figure.
 *
 * **Currently empty, and that is the honest state of the catalogue** rather than a
 * bug: no `Process` in this file carries a `value`. It exists so the process page
 * can say "nothing is characterised here yet" as a rendered statement instead of
 * leaving the reader to check fourteen rows to discover it.
 */
export function characterisedNodes(): readonly ProcessNode[] {
  return processes
    .filter((p) => FIGURE_FIELDS.some((key) => p[key].basis !== 'uncharacterised'))
    .map((p) => p.node)
}