import type { T } from '../shared/types.ts'

/**
 * The four demo runs the home page's Demos section replays — this site's
 * counterpart to the reference site's "Demos · one flow, four runs".
 *
 * These are *illustrations of the site's own mechanics*, not footage of a
 * tool: each run walks a real flow the site performs (completing a
 * characterisation record, running a calculator model, rendering a gap,
 * choosing a licence tier), and each stops at a gate where a real decision
 * exists. Every gate offers only legitimate completions — the one outcome a
 * run never offers is the dishonest one (a plausible number with no basis,
 * a blank field, an invented price).
 *
 * Everything is a `T`, authored in both languages together, because the
 * dialogue is content, not chrome. Line kinds map onto the terminal's colour
 * register in `RunTerminal`.
 */

export type RunLineKind = 'cmd' | 'ok' | 'info' | 'warn'

export type RunLine = { kind: RunLineKind; text: T }

/** A rail phase becomes current once `afterLines` lines have been shown. */
export type RunMilestone = { label: T; afterLines: number }

export type RunGateOption = {
  /** Stable id the component keys the outcome on. Not rendered. */
  id: string
  label: T
  /** The lines the terminal emits once this option is approved. */
  outcome: RunLine[]
}

export type RunGate = {
  /** The marker line printed at the decision point. */
  prompt: T
  question: T
  /** The rail slot this gate occupies, after the last milestone. */
  railLabel: T
  options: RunGateOption[]
}

export type DemoScript = {
  /** Stable demo id the tab rail keys on. */
  id: 'record' | 'calculator' | 'gap' | 'delivery' | 'mcp'
  /** Tab label, short — one word. */
  tab: T
  /** The one-line summary shown beside the tab rail. */
  summary: T
  /** The terminal's fake host — a role, not a person: verify@, hesap@… */
  host: string
  /** Title in the terminal's title bar. */
  scriptTitle: T
  lines: RunLine[]
  milestones: RunMilestone[]
  gate?: RunGate
  /** The run's close-out lines, shown after an outcome. */
  epilogue: RunLine[]
  /** The rail's final slot, and the closing line. */
  recordLabel: T
  close: T
}

/* ------------------------------------------------------------------ */
/* 01 — the record: completing a characterisation record               */
/* ------------------------------------------------------------------ */

const record: DemoScript = {
  id: 'record',
  tab: { tr: 'Kayıt', en: 'Record' },
  summary: {
    tr: 'Bir karakterizasyon kaydı tamamlanıyor.',
    en: 'A characterisation record is completed.',
  },
  host: 'dogrulama',
  scriptTitle: { tr: 'uart-fifo karakterizasyon kaydı', en: 'uart-fifo characterisation record' },
  lines: [
    { kind: 'cmd', text: { tr: 'cat çekirdekler/uart-fifo/spesifikasyon.yaml', en: 'cat cores/uart-fifo/spec.yaml' } },
    {
      kind: 'ok',
      text: {
        tr: 'spesifikasyon okundu — tür: standart hücre makrosu · düğüm: 90 nm',
        en: 'spec read — kind: standard-cell macro · node: 90 nm',
      },
    },
    { kind: 'cmd', text: { tr: 'dogrula --figurler tumu', en: 'verify --figures all' } },
    {
      kind: 'ok',
      text: {
        tr: 'üçgen eşdeğeri — ölçülen · dökümhane testi · koşul: 0,9 V, 25 °C',
        en: 'gate equivalents — measured · foundry test · conditions: 0.9 V, 25 °C',
      },
    },
    {
      kind: 'ok',
      text: {
        tr: 'maks. frekans — ölçülen · dökümhane testi · koşul: tipik hane',
        en: 'max frequency — measured · foundry test · conditions: typical corner',
      },
    },
    {
      kind: 'ok',
      text: {
        tr: 'makro alanı — ölçülen · yerleşim raporundan',
        en: 'macro area — measured · from the layout report',
      },
    },
    {
      kind: 'warn',
      text: {
        tr: 'kaçak akım — KARAKTERİZE EDİLMEMİŞ · bu düğüm ve hane için ölçüm yok',
        en: 'leakage — UNCHARACTERISED · no measurement for this node and corner',
      },
    },
  ],
  milestones: [
    { label: { tr: 'Spesifikasyon', en: 'Spec' }, afterLines: 0 },
    { label: { tr: 'Figürler', en: 'Figures' }, afterLines: 2 },
  ],
  gate: {
    prompt: { tr: 'KAPI — karar gerekiyor', en: 'GATE — a decision is needed' },
    question: {
      tr: 'Karakterize edilmemiş bir sayı bulundu. Kayıt nasıl tamamlanır?',
      en: 'An uncharacterised figure was found. How is the record completed?',
    },
    railLabel: { tr: 'Kapı', en: 'Gate' },
    options: [
      {
        id: 'gap',
        label: {
          tr: 'Boş bırak — nedeni iki dilde yaz',
          en: 'Leave the gap — write the reason in both languages',
        },
        outcome: [
          {
            kind: 'ok',
            text: {
              tr: 'FigureGap yazıldı — boşluk 0 ya da boş alanda gösterilmez; kartuş ve gerekçe ile görünür.',
              en: 'FigureGap written — the gap will render neither as 0 nor blank; a badge plus its reason.',
            },
          },
        ],
      },
      {
        id: 'model',
        label: {
          tr: 'Modelden hesapla — "modelled" etiketi ve koşullarıyla işaretle',
          en: 'Compute from a model — mark it "modelled" with its conditions',
        },
        outcome: [
          {
            kind: 'ok',
            text: {
              tr: 'Sayı yazıldı — fig-modelled lekeşmesiyle, modeli ve geçerlik aralığıyla birlikte listelendi.',
              en: 'Figure written — listed with its model and validity range, carrying the fig-modelled badge.',
            },
          },
        ],
      },
    ],
  },
  epilogue: [
    {
      kind: 'ok',
      text: {
        tr: 'kayıt tamamlandı — her sayı bir durum taşıyor',
        en: 'record complete — every figure carries a basis',
      },
    },
    {
      kind: 'info',
      text: {
        tr: 'kural: bir boşluk asla 0, “-” ya da boş alana dönüştürülmez',
        en: 'rule: a gap never renders as 0, “-” or a blank field',
      },
    },
    { kind: 'cmd', text: { tr: 'smoke --nedenler-iki-dil', en: 'smoke --bilingual-reasons' } },
    {
      kind: 'ok',
      text: {
        tr: '87 denetim geçti — nedenler her iki dilde yazılmış',
        en: '87 checks passed — every reason authored in both languages',
      },
    },
  ],
  recordLabel: { tr: 'Kayıt', en: 'Record' },
  close: {
    tr: 'Kayıt doğrulandı. Sonraki tur için tekrar oynatabilirsiniz.',
    en: 'Record verified. Replay the run to go again.',
  },
}

/* ------------------------------------------------------------------ */
/* 02 — the calculator: one model, its assumptions and its notice      */
/* ------------------------------------------------------------------ */

const calculator: DemoScript = {
  id: 'calculator',
  tab: { tr: 'Hesap', en: 'Calculator' },
  summary: {
    tr: 'Kritik yol modeli çalışıyor; varsayımlar yazılı.',
    en: 'The critical-path model runs; the assumptions are written out.',
  },
  host: 'hesap',
  scriptTitle: { tr: 'kritik yol gecikmesi', en: 'critical-path delay' },
  lines: [
    {
      kind: 'cmd',
      text: { tr: 'hesapla kritik-yol --fanout 12 --wireload 0,18', en: 'calculate critical-path --fanout 12 --wireload 0.18' },
    },
    {
      kind: 'ok',
      text: {
        tr: 'model seçildi — alpha·C·V²·f, Elmore tel gecikmesiyle',
        en: 'model selected — alpha·C·V²·f, with Elmore wire delay',
      },
    },
    {
      kind: 'info',
      text: {
        tr: 'varsayımlar — 0,55 pF yük · tipik hane · 1,0 V besleme',
        en: 'assumptions — 0.55 pF load · typical corner · 1.0 V supply',
      },
    },
    {
      kind: 'ok',
      text: {
        tr: 'sonuç — 14,2 ns · modellenen · kaynak ve aralıklar sayfada yazılı',
        en: 'result — 14.2 ns · modelled · source and validity ranges on the page',
      },
    },
    {
      kind: 'warn',
      text: {
        tr: 'uyarı — bu sonuç bir ölçüm değildir; tape-out kararı için kullanılmaz',
        en: 'warning — this result is not a measurement; not for a tape-out decision',
      },
    },
  ],
  milestones: [
    { label: { tr: 'Girdiler', en: 'Inputs' }, afterLines: 0 },
    { label: { tr: 'Model', en: 'Model' }, afterLines: 1 },
    { label: { tr: 'Sonuç', en: 'Result' }, afterLines: 3 },
  ],
  epilogue: [
    {
      kind: 'info',
      text: {
        tr: 'yöntem — modelin kaynakları ve geçerlilik aralığı, hesaplayıcı sayfasında okunabilir',
        en: 'method — the model’s sources and validity range are readable on the calculator page',
      },
    },
    {
      kind: 'ok',
      text: {
        tr: 'ayar değişirse sonuç da değişir — varsayım, modelin bir parçasıdır',
        en: 'change an assumption and the result changes — an assumption is part of the model',
      },
    },
  ],
  recordLabel: { tr: 'Yöntem', en: 'Method' },
  close: {
    tr: 'Hesap doğrulandı. Tekrar oynatabilir ya da başka bir tura geçebilirsiniz.',
    en: 'Calculation verified. Replay it, or move on to another run.',
  },
}

/* ------------------------------------------------------------------ */
/* 03 — the gap: an uncharacterised figure rendered honestly           */
/* ------------------------------------------------------------------ */

const gap: DemoScript = {
  id: 'gap',
  tab: { tr: 'Boşluk', en: 'Gap' },
  summary: {
    tr: 'Karakterize edilmemiş bir sayının nasıl göründüğü.',
    en: 'How an uncharacterised figure renders.',
  },
  host: 'kayit',
  scriptTitle: { tr: 'uart-fifo · kaçak akım hücresi', en: 'uart-fifo · leakage cell' },
  lines: [
    { kind: 'cmd', text: { tr: 'cat cekirdekler/uart-fifo/figurler.md', en: 'cat cores/uart-fifo/figures.md' } },
    {
      kind: 'warn',
      text: {
        tr: 'kaçak akım — karakterize edilmemiş · bu düğümde ölçüm yok',
        en: 'leakage — uncharacterised · no measurement at this node',
      },
    },
    {
      kind: 'ok',
      text: {
        tr: 'görünüm — 0 ya da “-” değil: kartuş ve gerekçesiyle render',
        en: 'render — neither 0 nor “-”: a badge with its reason prose',
      },
    },
    { kind: 'cmd', text: { tr: 'karsilastir uart-fifo sram-16x512 --ayni-tur', en: 'compare uart-fifo sram-16x512 --same-kind' } },
    {
      kind: 'ok',
      text: {
        tr: 'karşılaştırma — iki kayıt da her kolonda durumunu taşıyor',
        en: 'comparison — both records carry their basis in every column',
      },
    },
  ],
  milestones: [
    { label: { tr: 'Sorgu', en: 'Query' }, afterLines: 0 },
    { label: { tr: 'Görünüm', en: 'Render' }, afterLines: 2 },
  ],
  gate: {
    prompt: { tr: 'KAPI — ölçüm bütçesi', en: 'GATE — measurement budget' },
    question: {
      tr: 'Bu çeyrekte tek bir karakterizasyon bütçe onayı aldınız. Hangi hücre ölçülür?',
      en: 'This quarter you have budget approval for one characterisation. Which cell is measured?',
    },
    railLabel: { tr: 'Kapı', en: 'Gate' },
    options: [
      {
        id: 'leakage',
        label: {
          tr: 'Kaçak akım — satın alma kararlarında en çok aranan sayı',
          en: 'Leakage — the figure buyers ask for most',
        },
        outcome: [
          {
            kind: 'ok',
            text: {
              tr: 'ölçüm planlandı — sonucu tabloya girilecek; o güne kadar hücre nedeniyle boş kalır',
              en: 'measurement scheduled — the result will enter the table; until then the cell stays empty with its reason',
            },
          },
        ],
      },
      {
        id: 'delay',
        label: {
          tr: 'Geçiş gecikmesi — tabloda en çok boş hücre bırakan sütun',
          en: 'Transition delay — the column with the most empty cells',
        },
        outcome: [
          {
            kind: 'ok',
            text: {
              tr: 'ölçüm planlandı — bir ölçüm, sütunun en boş hücresini kapatacak; geri kalanlar nedenleriyle listelenir',
              en: 'measurement scheduled — one measurement closes the column’s emptiest cell; the rest stay listed with reasons',
            },
          },
        ],
      },
    ],
  },
  epilogue: [
    { kind: 'cmd', text: { tr: 'denetle --bosluk-hicbir-zaman-sifir', en: 'audit --gap-never-zero' } },
    {
      kind: 'ok',
      text: {
        tr: 'denetim geçti — katalogda 0’a dönüştürülmüş bir boşluk yok',
        en: 'audit passed — no gap in the catalogue renders as a 0',
      },
    },
  ],
  recordLabel: { tr: 'Denetim', en: 'Audit' },
  close: {
    tr: 'Boşluk doğrulandı. Bir sonraki tura geçebilirsiniz.',
    en: 'Gap verified. Move on to the next run.',
  },
}

/* ------------------------------------------------------------------ */
/* 04 — the delivery: licence tier and package contents                */
/* ------------------------------------------------------------------ */

const delivery: DemoScript = {
  id: 'delivery',
  tab: { tr: 'Teslim', en: 'Delivery' },
  summary: {
    tr: 'Kademe ve paket seçimi, teslim listesiyle bağlanıyor.',
    en: 'Choosing a tier and package, tied to the delivery list.',
  },
  host: 'teslim',
  scriptTitle: { tr: 'uart-fifo teslim paketi', en: 'uart-fifo delivery package' },
  lines: [
    {
      kind: 'cmd',
      text: { tr: 'paket uart-fifo --kademe ?', en: 'package uart-fifo --tier ?' },
    },
    {
      kind: 'info',
      text: {
        tr: 'kademe çarpanları — değerlendirme ×0,08 · üretim ×1 · çoklu kullanım ×2,6',
        en: 'tier multipliers — evaluation ×0.08 · production ×1 · multi-use ×2.6',
      },
    },
    {
      kind: 'info',
      text: {
        tr: 'fiyat — teklif üzerine; ara toplam, yalnızca fiyat girildiğinde görünür',
        en: 'price — on quote; the subtotal shows only when a price is entered',
      },
    },
  ],
  milestones: [
    { label: { tr: 'Çekirdek', en: 'Core' }, afterLines: 0 },
    { label: { tr: 'Kademe', en: 'Tier' }, afterLines: 1 },
  ],
  gate: {
    prompt: { tr: 'KAPI — paket seçimi', en: 'GATE — package choice' },
    question: {
      tr: 'Sipariş hangi teslim paketiyle gider?',
      en: 'Which delivery package does the order go out with?',
    },
    railLabel: { tr: 'Kapı', en: 'Gate' },
    options: [
      {
        id: 'rtl',
        label: {
          tr: 'RTL paketi — RTL + kısıtlamalar + UVM',
          en: 'RTL package — RTL + constraints + UVM',
        },
        outcome: [
          {
            kind: 'ok',
            text: {
              tr: 'içerik — Verilog/SystemVerilog kaynak · SDC · UVM ortamı ve betikler',
              en: 'contents — Verilog/SystemVerilog source · SDC · UVM environment and scripts',
            },
          },
          {
            kind: 'info',
            text: {
              tr: 'GDSII bu pakette yok — fiziksel tasarım ayrı bir pakettir',
              en: 'GDSII is not in this package — physical design is a separate package',
            },
          },
        ],
      },
      {
        id: 'physical',
        label: {
          tr: 'Fiziksel paket — GDSII / OASIS + Liberty + SDF',
          en: 'Physical package — GDSII / OASIS + Liberty + SDF',
        },
        outcome: [
          {
            kind: 'ok',
            text: {
              tr: 'içerik — GDSII/OASIS · LEF/DEF · Liberty · SDF/SPEF',
              en: 'contents — GDSII/OASIS · LEF/DEF · Liberty · SDF/SPEF',
            },
          },
          {
            kind: 'info',
            text: {
              tr: 'doğrulanmamış bir PDK referansı kaynak adı iddia edemez — null kalır',
              en: 'an unconfirmed PDK reference cannot claim a source name — it stays null',
            },
          },
        ],
      },
    ],
  },
  epilogue: [
    {
      kind: 'ok',
      text: {
        tr: 'sipariş taslağı hazır — fiyat, düğüm ve dökümhane teklif sırasında bağlanır',
        en: 'order draft ready — price, node and foundry attach at quote time',
      },
    },
    {
      kind: 'info',
      text: {
        tr: 'lisanslar çekirdek başına satılır; tapeout hakları kademeye göre değişir',
        en: 'licences sell per core; tape-out rights follow the tier',
      },
    },
  ],
  recordLabel: { tr: 'Paket', en: 'Package' },
  close: {
    tr: 'Teslim doğrulandı. Dört turun tamamı bu.',
    en: 'Delivery verified. That is all four runs.',
  },
}

/** The demos rail's order — one flow, four runs. */
export const demos: DemoScript[] = [record, calculator, gap, delivery]