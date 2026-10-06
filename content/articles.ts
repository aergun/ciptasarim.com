/**
 * Technical notes, as data.
 *
 * The block union is the point: a note cannot quote a number that contradicts the
 * calculators, because any live arithmetic is a `tool` block the page re-runs on
 * render, and any stated figure is a `figure` block that carries its own provenance.
 * A note that wanted to say "yield is about 82%" would have to say it as either of
 * those, never as bare prose with a number typed into it.
 *
 * Slugs are Turkish route paths and are never translated (ASCII, `fold()`-safe so a
 * search hit on `ölçülmüş` still resolves — here written without the diacritics to
 * begin with). Tags are Turkish; the locale's tag list renders them as-is in English
 * too, which is deliberate: they are catalogue vocabulary, not prose.
 */

import type { Article } from '../shared/types.ts'

export const articles: readonly Article[] = [
  /* ------------------------------------------------------------------------ */
  {
    slug: 'olcul-modell-farki',
    title: {
      tr: 'Ölçülen ve modellenen',
      en: 'Measured and modelled',
    },
    standfirst: {
      tr: 'Bir çip çekirdeği datasheetindeki her sayı üç durumdan birindedir. Bu yazı, üçünü ve aralarındaki boşluğu ayıran ince yolu anlatır.',
      en: 'Every number in a core datasheet is in one of three states. This note explains the three and the thin road that separates them.',
    },
    date: '2026-09-12',
    readingMinutes: 6,
    tags: ['provenance', 'karakterizasyon'],
    blocks: [
      { kind: 'paragraph', text: {
        tr: 'Bir RTL çekirdeği satılırken "250 MHz’de çalışır" söylenir, ve alıcı bunu datasheetten okur. Ama bu sayı nereden gelir? Üç yerden gelebilir: karakterize edilmiş silikondan (ölçüldü), kütüphane verisi ve bir model üzerinden hesaplanmış (modellendi), ya da hiçbir yerden — değildir, sadece söylenmiştir (karakterize edilmemiş). Datasheet bu üçünü ayırmaz; bu site ayırır, ve ayırmıyor olmanın maliyeti müşteri öder.',
        en: 'An RTL core is sold on "runs at 250 MHz", and the buyer reads it from the datasheet. But where does that number come from? From one of three places: characterised silicon (measured), from library data through a stated model (modelled), or from nowhere (not characterised). A datasheet does not separate the three; this site does, and an unseparated number is precisely what makes a datasheet dangerous.',
      } },
      { kind: 'heading', text: {
        tr: 'Ölçülen: bir ölçüm bir kanıt ister',
        en: 'Measured: a measurement is a claim about a fact',
      } },
      { kind: 'paragraph', text: {
        tr: 'Ölçülen bir sayı, bir olguya dair bir iddiadır ve kanıt göstermek zorundadır. Bu sitede ölçülen her sayının yanında koşulları (köşe, gerilim, sıcaklık, yük) ve kaynağı yazılır. 250 MHz’de "ölçüldü" ifadesi, köşesine bakmadan değersizdir: bir hızlı köşe ölçümü, adiy ölçüm değildir. Koşulları görmek, sayının sizin tasarınızda tekrarlanabilir olup olmadığını bilmenin tek yoludur.',
        en: 'A measured figure is a claim about a fact, and claims need their working shown. On this site every measured figure carries its conditions — corner, voltage, temperature, load — next to its source. "Measured at 250 MHz" without its corner is worthless: a fast-corner measurement is a different measurement from a nominal one. The conditions are the only way to know whether a figure is reproducible in your design.',
      } },
      { kind: 'quote', text: {
        tr: 'Bir ölçüm, koşullarını söylemeyen bir ölçüm değildir; bir tahmin, modelini söylemeyen bir tahmin değildir.',
        en: 'A measurement that will not name its conditions is not a measurement, and a prediction that will not name its model is not a prediction.',
      }, attribution: { tr: 'Bu sitedeki kuralların bir araya geldiği ilkeler.', en: 'The rules this site’s verification is built on.' } },
      { kind: 'heading', text: {
        tr: 'Modellenen: bir görüş, etiketiyle belirtilmiş',
        en: 'Modelled: an opinion, labelled as one',
      } },
      { kind: 'paragraph', text: {
        tr: 'Modellenen sayı silikondan gelmez; belirlenmiş bir aritmetikten gelir. Bu yüzden kaynağı boş olabilir — model bizim içimizden. Ama modelin adı her zaman yazılır: "Lombardi, Elmore ekstraksiyonuyla" gibi, tartışılabilir bir ad. Bir sayı hangi modelden hangi girdi setiyle çıkmışsa, o modelin neyi bilmediği de bilinebilir.',
        en: 'A modelled figure never came from silicon; it came from a stated piece of arithmetic. That is why its source may be null — the model is ours. But the model’s name is always written, and written in a form that can be argued with: "Lombardi with Elmore extraction", not "typical". A figure knows which model and which inputs produced it, and a model that says nothing does not deserve to be named.',
      } },
      { kind: 'paragraph', text: {
        tr: 'Bu ayrımın pratik önemi küçük değil: bir ölçümü taklit eden bir tahmin, müşteride ölçümle aynı güveni yaratır ve güven yanlıştır. Karakterize edilmemiş sayıların tahminle doldurulmadığı yerde, boşluğun kendisi bilgidir.',
        en: 'The practical consequence is not small: a prediction dressed as a measurement earns the same trust and does not deserve it. Where empty cells are not backfilled with estimates, the emptiness is itself information.',
      } },
      { kind: 'heading', text: {
        tr: 'Karakterize edilmemiş: bir boşluk, bir sayı değil',
        en: 'Not characterised: a gap, not a number',
      } },
      { kind: 'paragraph', text: {
        tr: 'Karakterize edilmemiş sayı 0 göstermez ve "yok" da göstermez: nedenini gösterir. "Bu düğümde silikon üretimi yapılmadı", "karakterizasyon dökümlerine bağlı", "referans ölçüm yok". Bu nedeni okuyan müşteri, boşluğu kendi ölçümüyle doldurur; sayıyla doldurulan müşteri, tasarımı yanlış bir tahmine oturtmuş olur.',
        en: 'An uncharacterised figure does not show 0, and does not show "n/a": it shows the reason. "No silicon was produced at this node", "characterisation pending with the foundry", "no reference measurement exists". A customer who reads the reason can fill the gap with their own measurement; a customer given a number instead builds their design on someone else’s guess.',
      } },
      { kind: 'callout', tone: 'note', text: {
        tr: 'Bu sitede renk kodu ikincil bir göstergedir; her sayının durumu metnin kendisinde yazılıdır. Renkli bir "ölçüldü" rozeti, renk-körü bir okuyucu için hiçbir şey söylemez — metin söyler.',
        en: 'Colour here is a secondary cue only: every figure’s state is written in text. A green "measured" badge tells a colour-blind reader nothing — the words do.',
      } },
      { kind: 'paragraph', text: {
        tr: 'Bu yazıdaki her sayı kuralında olduğu gibi, çekirdeğin spesifikasyon tablosundaki her hücre de aynı üç durumda birindedir. Karşılaştırma görünümü, hücre durumunu sayının yanına yazar; iki farklı durumdan gelen sayıları yan yana okumak, kıyas değil yanlışlıktır.',
        en: 'As with every number in this note, every cell in a core’s specification table is in one of the same three states. The comparison view writes the state next to the number; reading figures from different states side by side is not comparison, it is error.',
      } },
    ],
  },

  /* ------------------------------------------------------------------------ */
  {
    slug: 'murphy-verim-modeli',
    title: {
      tr: 'Murphy modeli ve verimin belirsizlik tablosu',
      en: 'Murphy’s model and the uncertainty table of yield',
    },
    standfirst: {
      tr: 'Verim aracı tek bir aritmetik kullanır: Y = e^(−A·D₀). Bu yazı, o basitliğin nereden geldiğini, neyi bilmediğini ve maliyet kararında nasıl kullanılabileceğini anlatır.',
      en: 'The yield tool runs one piece of arithmetic: Y = e^(−A·D₀). This note explains where the simplicity comes from, what it does not know, and how it can still be used in a cost decision.',
    },
    date: '2026-09-28',
    readingMinutes: 7,
    tags: ['verim', 'maliyet', 'murphy'],
    blocks: [
      { kind: 'paragraph', text: {
        tr: 'Murphy modeli bir tahmin değil, kötümser bir sınırdır: kusurların uniform dağıldığını ve her kusurun çipi öldürdüğünü varsayar, bu yüzden gerçek verim genellikle modelin verdiğinden daha iyidir. Verim aracı bu tek satır aritmetiği çalıştırır; asıl önemli olan soru, sayının ne kadar kesin değil, hangi koşullarda hangi formülle verildiğidir. Doğru kullanım, modeli üst sınır olarak okumaktır.',
        en: 'Murphy’s model is not a prediction but a pessimistic bound: it assumes defects are uniformly distributed and every defect kills the die, so real yield generally lands above what it gives. The yield tool runs that one-line arithmetic; the important question is not how firm the number is but which formula, under which assumptions, produced it. Used correctly the model is read as a bound, not as a forecast.',
      } },
      { kind: 'heading', text: {
        tr: 'Aritmetik, tek satır',
        en: 'The arithmetic, in one line',
      } },
      { kind: 'paragraph', text: {
        tr: 'Y = ((1 − D) / (1 − D/2))^(2N). D kusur yoğunluğu, cm² başına; N çip alanı, cm² cinsinden. Modelin asimptotları vardır: D → 0’da Y → 1, D → 1’de Y → 0 — D = 1’de sonlu kalan bir model hatadır. D₀ dökümhanenin kendi verisidir; bu sitedeki hiçbir D₀ değeri yayınlanmamıştır, çünkü dökümhane vermediği bir D₀’ı yayınlayan herkes modelin çıktısını bir tahmine çevirir. Aşağıdaki hesap, aritmetiği örnekleme girdileriyle gösterir:',
        en: 'Y = ((1 − D) / (1 − D/2))^(2N). D is the defect density per cm²; N is the die area in cm². The model has asymptotes: as D → 0, Y → 1 and as D → 1, Y → 0 — a model that stayed finite at D = 1 would be a bug. D₀ belongs to the foundry; no D₀ on this site is a published figure, because publishing a D₀ the foundry has not stated turns the model’s output into an opinion. The calculation below runs the arithmetic on the stated inputs.',
      } },
      { kind: 'tool', tool: 'yield', preset: { defectDensity: 0.08, dieArea: 100_000_000 } },
      { kind: 'paragraph', text: {
        tr: '100 000 000 µm² = 100 mm² = 1 cm² ve D₀ = 0,08 cm⁻² ile model yaklaşık %92 verim verir. Ama D₀ 0,12’ye kayarsa %87,6’ya düşer; 0,05’e inerse %94,9’a çıkar. Yani aralık, sayıdan daha önemlidir, ve aralıktaki belirsizlik D₀’dan gelir.',
        en: 'With 100 000 000 µm² = 100 mm² = 1 cm² and D₀ = 0.08 cm⁻², the model returns a yield near 92%. Move D₀ to 0.12 and the yield falls to 87.6%; move it to 0.05 and it rises to 94.9%. The range matters more than the number, and the uncertainty in the range comes from D₀.',
      } },
      { kind: 'figure', figure: {
        basis: 'modelled',
        value: 91.84,
        unit: 'percent',
        model: 'Murphy, Y = ((1−D)/(1−D/2))^(2N), D₀ = 0.08 cm⁻², N = 1 cm²',
        note: 'D₀ bu sitede bir yayın verisi değildir; örnek girdidir.',
        source: null,
      }, caption: {
        tr: 'Yukarıdaki hesaplayıcının sonucu ile bu figür örtüşür; ikisinden biri değişirse bu yazı eski hale gelir.',
        en: 'This figure agrees with the calculator above; if either drifts, the note has gone stale and should be rewritten.',
      } },
      { kind: 'heading', text: {
        tr: 'Modelin bilmediği şeyler',
        en: 'What the model does not know',
      } },
      { kind: 'list', items: [
        { tr: 'Küçük verim artışlarını üreten red-and-onarım (redundancy) yapıları — belleklerde önemli.', en: 'Redundancy structures, which matter in memories and lift yield above the bound.' },
        { tr: 'Kusurun uniform dağılması yerine dökümhane gerçeklerinde görülen kümelenme.', en: 'The clustering foundry data actually shows, rather than a uniform defect distribution.' },
        { tr: 'Parametrik verim: çip çalışıyor ama spesifikasyonu tutmayan parçalar.', en: 'Parametric yield: parts that pass but miss their specification, and are binned down instead of killed.' },
        { tr: 'Dökumhane başına test programındaki farklılık: aynı silikon farklı verim raporları verebilir.', en: 'Differences in the test program per foundry: the same silicon can report different yields.' },
      ] },
      { kind: 'paragraph', text: {
        tr: 'Model, tam olarak "kabaca üst sınır" olarak kullanılmalıdır: bir çip boyutuna karar veriyor ve vaft maliyetini biliyorsanız, maliyet-per-iyi-çip aracı ile Murphy verimini birlikte okuyun ve aralığın üst ve alt uçlarını maliyet olarak yazın. 0,10 ve 0,06 cm⁻²’daki uçlar, iyi bir D₀ tahmininin maliyete nasıl orantısız geçtiğini gösterir; bir alt uç ve bir üst uç, ikisi de yanlış olabilir.',
        en: 'Use the model strictly as "roughly the pessimistic bound": decide a die size and read Murphy’s yield together with the cost-per-good-die calculator, writing the range’s two ends as two costs. The ends at D₀ = 0.06 and D₀ = 0.10 show how a D₀ estimate passes into cost unequally; a range that can be wrong at both ends is still better than a single number that claims not to.',
      } },
      { kind: 'callout', tone: 'warning', text: {
        tr: 'D₀ değerini bu siteden almayın. D₀’ı bir tahmin olan bir modelin verdiği verim de bir tahmindir; tahmin, maliyette beş haneli bir karara girdi olmamalıdır.',
        en: 'Never take a D₀ from this site. A model whose D₀ is an estimate produces a yield that is an estimate, and an estimate must not be the input to a five-figure cost decision.',
      } },
      { kind: 'paragraph', text: {
        tr: 'Maliyet kararında modelin rolü budur: aralığın uçlarını göstermek, tek bir sayıyı satmak değil. Murphy aracı bunu yapar; yapamadığı şey ise doğrulanan bir verim vaat etmektir.',
        en: 'That is the model’s role in a cost decision: to show the two ends of a range, not to sell a single number. The yield calculator does that; what it never does is promise a verified yield.',
      } },
    ],
  },

  /* ------------------------------------------------------------------------ */
  {
    slug: 'hard-makro-vs-yumusak-rtl',
    title: {
      tr: 'Hard makro ve yumuşak RTL: taşınabilirlik pazarlığı',
      en: 'Hard macro and soft RTL: the portability bargain',
    },
    standfirst: {
      tr: 'Aynı işlev iki formda tedarik edilebilir: fiziksel olarak karakterize edilmiş bir makro veya sentezlenebilir RTL. Bu yazı, iki formun alışveriş yaptığını ve kararı hangi soruların belirlediğini anlatır.',
      en: 'The same function can be procured in two forms: a physically characterised macro or synthesisable RTL. This note explains what each gives up to gain what it gains, and the questions that settle the decision.',
    },
    date: '2026-10-05',
    readingMinutes: 8,
    tags: ['hard-makro', 'rtl', 'porting'],
    blocks: [
      { kind: 'paragraph', text: {
        tr: 'Bir hard makro, belirli bir PDK’da yerleşimi ve karakterizasyonu tamamlanmış silikon bloktur: alanı ve frekansı bilinir, kaynağı ölçümdür. Yumuşak RTL ise kaynak kod kütlesi: herhangi bir standart hücresel kütüphaneye sentezlenebilir, ama alanı ve frekansı sizin kütüphanenize ve yerleşimine bağlıdır. İkisi karşılaştırılamaz, çünkü farklı sorulara cevap verirler.',
        en: 'A hard macro is a block of silicon with its placement and characterisation done in one PDK: its area and frequency are known, and their origin is measurement. Soft RTL is a body of source code: synthesiseable into any standard-cell library, with area and frequency set by your library and your placement. The two are not comparable, because they answer different questions.',
      } },
      { kind: 'heading', text: {
        tr: 'Hangi soruyu soruyorsunuz?',
        en: 'Which question are you asking?',
      } },
      { kind: 'paragraph', text: {
        tr: '"Bu blokun bu düğümde kapladığı alan ne?" sorusu yalnızca hard makro tarafından cevaplanabilir, ve cevap ölçümdür. "Çekirdeğim, benim kütüphanemde kaç GE alır?" sorusu yalnızca yumuşak RTL tarafından cevaplanabilir, ve cevap bir tahmindir. Yanlış soruya doğru araçla cevap vermek, iki formun karışmasına neden olur.',
        en: '"How much area does this block occupy at this node" is a question only a hard macro answers, and the answer is a measurement. "How many GE does this core take in my library" is a question only soft RTL answers, and the answer is an estimate under your control. Confusing the two forms is answering one question with the other’s vocabulary.',
      } },
      { kind: 'callout', tone: 'note', text: {
        tr: 'Bir hard makronun alanı ölçüldür; yumuşak RTL’in alan tahmini ise sizin yerleşim kararınızdır. Alan için hard makro, yerleşim için yumuşak RTL doğrudur.',
        en: 'A hard macro’s area is a measurement; a soft RTL core’s area is your decision. Area argues for a hard macro, floorplan control argues for RTL.',
      } },
      { kind: 'heading', text: {
        tr: 'Makronun kapsamadığı yer: farklı bir düğüm',
        en: 'Where the macro does not reach: another node',
      } },
      { kind: 'paragraph', text: {
        tr: 'Bir hard makro PDK’ya bağlıdır. Düğümünüz kitin revizyonuyla eşleşmezse makronun karakterizasyonu sizin işleminiz için geçersizdir. Katalog bu durumu hücreyi boş bırakarak değil, "karakterize edilmemiş" bildirimiyle gösterir: neden, PDK revizyonu uyumsuzluğudur.',
        en: 'A hard macro is PDK-bound. If your node is on a kit revision the macro was never characterised against, its characterisation is invalid for your operation. The catalogue shows this not as a blank cell but as an "not characterised" statement with the reason, and the reason here is the PDK revision mismatch.',
      } },
      { kind: 'paragraph', text: {
        tr: 'Yumuşak RTL’de bu soru yoktur: kaynak her kütüphaneye sentezlenir. Karşılığında alınan şey belirsizliktir — bir sentez sonucunun alan ve frekans değerleri, sizin kütüphaneniz ve yerleşim kararlarınızla üretilmesi gerektiği için tahmindir. İki formdaki karakterizasyon farkı aynıdır: biri ölçüm, diğeri tahmin.',
        en: 'No such question exists in soft RTL: the source synthesises into any library. The trade-off is the uncertainty — the area and frequency from a synthesis run are estimates, because they depend on your library and your placement choices. The characterisation asymmetry is the same in both: one is a measurement, one is a prediction.',
      } },
      { kind: 'list', items: [
        { tr: 'Silidonun yakın bitirme tarihi ve tek bir düğüm: hard makro, ölçülmüş alan ve frekans.', en: 'Deadline close to tapeout, one node: hard macro, with measured area and frequency.' },
        { tr: 'Birden fazla düğüm, gelecek için taşınabilirlik gereği: yumuşak RTL, tahmin edilebilir kısıtlamalar.', en: 'Multiple nodes, portability for the future: soft RTL, with portable constraints.' },
        { tr: 'Analog veya yüksek hız: her formda karakterizasyon derinliğine bakın — analog çekirdeklerin tabloları ENOB, SNDR ve örnekleme hızındaki ölçümdür.', en: 'Analog or high-speed: look at each form’s characterisation depth — for analog cores the tables are measured ENOB, SNDR and sample rate.' },
        { tr: 'Doğrulama derinliği iki formda da lisans kademesinden bağımsızdır: kademe kullanım hakkını belirler, teslim kapsamını değil.', en: 'Verification depth in both forms is independent of licence tier: the tier governs your right to use, not the delivery scope.' },
      ] },
      { kind: 'paragraph', text: {
        tr: 'Karar aritmetik değil bir pazarlıktır ve pazarlığın tarafı, tasarımın takvimi. Bir hard makro ölçülen bir frekans verir; aynı blok yumuşak RTL’de sizin tarafınızda çalışacaktır ve çalıştığında daha iyi ya da daha kötü olabilir. Ucun birinde hangi formun daha iyi olduğu, hangi ucun daha çok kapsamaya ihtiyacınız olduğu ile belirlenir.',
        en: 'The decision is a bargain, not an arithmetic: the other side of the table is your schedule. A hard macro gives a measured frequency; the same block in RTL will be made workable on your side, and may land better or worse. Which end of the bargain is better is settled by which end of the schedule you care about.',
      } },
      { kind: 'quote', text: {
        tr: 'Hard makro sizi karakterizasyon işinden kurtarır; yumuşak RTL sizi PDK’dan kurtarır. Kurtulduğu şeyin hangisi olduğunu bilmek, seçimdir.',
        en: 'A hard macro spares you the characterisation work; soft RTL spares you the PDK. Knowing which burden you are buying out of is the decision.',
      } },
      { kind: 'paragraph', text: {
        tr: 'Kararın aritmetiği tasarımın içindedir: alan ve frekans tahminleri, hesaplayıcılarla yapılabilecek kabaca bir karşılaştırmadır — ama makronun ölçülen değerine karşı koyulacak bir "olabilir" tahmini, ölçümle aynı masada tartışması gerektiğini bilir.',
        en: 'The decision’s arithmetic lives in your design: rough comparisons come from the calculators — but an estimate arguing against a macro’s measured value belongs at the same table as the measurement, and knows it.',
      } },
    ],
  },
]

/** One article by slug, for the note routes. */
export function articleBySlug(slug: string): Article | null {
  return articles.find((article) => article.slug === slug) ?? null
}