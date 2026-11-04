import type { T } from '../shared/types.ts'

/**
 * The characterisation run the home page replays in the terminal viewer.
 *
 * This is an *illustration of the site's own discipline*, not footage of a
 * tool: it walks the exact decision the provenance layer encodes — what to do
 * with a figure we have not characterised — and stops at the gate where a
 * real operator would decide. The gate's two options are both legitimate in
 * `Figure`'s union; the only illegitimate outcome (a plausible-looking number
 * with no basis) is what the run never offers.
 *
 * Everything is a `T`, authored in both languages together, because the
 * dialogue is content, not chrome. Line kinds map onto the terminal's colour
 * register in `RunTerminal`.
 */

export type RunLineKind = 'cmd' | 'ok' | 'info' | 'warn'

export type RunLine = { kind: RunLineKind; text: T }

export type RunGateOption = {
  /** Stable id the component keys the epilogue on. Not rendered. */
  id: 'gap' | 'model'
  label: T
  /** The line the terminal emits once this option is approved. */
  outcome: T
}

export type RunScript = {
  /** Title in the terminal's title bar, before the host part. */
  process: string
  title: T
  lines: RunLine[]
  gate: {
    /** The marker line printed at the decision point. */
    prompt: T
    question: T
    options: RunGateOption[]
  }
  /** Shown after an option is approved, then the run closes out. */
  epilogue: RunLine[]
  close: T
}

export const runScript: RunScript = {
  process: 'ciptasarim',
  title: { tr: 'uart-fifo karakterizasyon kaydı', en: 'uart-fifo characterisation record' },
  lines: [
    {
      kind: 'cmd',
      text: { tr: 'cat çekirdekler/uart-fifo/spesifikasyon.yaml', en: 'cat cores/uart-fifo/spec.yaml' },
    },
    {
      kind: 'ok',
      text: {
        tr: 'spesifikasyon okundu — tür: standart hücre makrosu · düğüm: 90 nm',
        en: 'spec read — kind: standard-cell macro · node: 90 nm',
      },
    },
    {
      kind: 'cmd',
      text: { tr: 'dogrula --figurler tumu', en: 'verify --figures all' },
    },
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
  gate: {
    prompt: { tr: 'KAPI — karar gerekiyor', en: 'GATE — a decision is needed' },
    question: {
      tr: 'Karakterize edilmemiş bir sayı bulundu. Kayıt nasıl tamamlanır?',
      en: 'An uncharacterised figure was found. How is the record completed?',
    },
    options: [
      {
        id: 'gap',
        label: {
          tr: 'Boş bırak — nedeni iki dilde yaz',
          en: 'Leave the gap — write the reason in both languages',
        },
        outcome: {
          tr: 'FigureGap yazıldı — boşluk 0 ya da boş alanda gösterilmez; kartuş ve gerekçe ile görünür.',
          en: 'FigureGap written — the gap will render neither as 0 nor blank; a badge plus its reason.',
        },
      },
      {
        id: 'model',
        label: {
          tr: 'Modelden hesapla — "modelled" etiketi ve koşullarıyla işaretle',
          en: 'Compute from a model — mark it "modelled" with its conditions',
        },
        outcome: {
          tr: 'Sayı yazıldı — fig-modelled lekeşmesiyle, modeli ve geçerlik aralığıyla birlikte listelendi.',
          en: 'Figure written — listed with its model and validity range, carrying the fig-modelled badge.',
        },
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
    {
      kind: 'cmd',
      text: { tr: 'smoke --bilinguallik', en: 'smoke --bilingual-reasons' },
    },
    {
      kind: 'ok',
      text: {
        tr: '87 denetim geçti — nedenler her iki dilde yazılmış',
        en: '87 checks passed — every reason authored in both languages',
      },
    },
  ],
  close: {
    tr: 'Kayıt doğrulandı. Sonraki tur için tekrar oynatabilirsiniz.',
    en: 'Record verified. Replay the run to go again.',
  },
}