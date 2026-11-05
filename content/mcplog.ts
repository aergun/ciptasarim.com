/**
 * The /mcp page's live session replay — an **illustrative** agent session over
 * EDA_MCP, written in the same `DemoScript` shape the home page's run viewer
 * plays, so one component renders it.
 *
 * ## Why "ILLUSTRATIVE" is structural here
 *
 * The record: its terminal chrome is labelled `illustrative` by the page, not by
 * a word inside the script, and the script walks the tools *and their observed
 * criteria* (the `(0 0)` schematic gate, the diff-before-push WorkBoard, the LVS
 * goal) as the upstream README states them. No session in the upstream repo is
 * cited for the dialogue, and none of its numbers are quoted as a run result —
 * the one number-bearing line (the xRC extraction count) is phrased as a scale,
 * not as this run's output. When a real log is supplied, the whole script should
 * be replaced with it and the label dropped.
 *
 * Content rules inherited from `runlog.ts`: everything is a `T` authored TR-first,
 * every gate offers only legitimate completions, and the dishonest completion —
 * "accept a clean DRC that was not run" — is not on offer.
 */

import type { DemoScript } from './runlog.ts'

export const mcpReplay: DemoScript = {
  /**
   * Extended onto `runlog.ts`'s id union by that file's edit — a demo tab, not
   * a fourth home-page run: the /mcp page is the only player of this script.
   */
  id: 'mcp',
  tab: { tr: 'Oturum', en: 'Session' },
  summary: {
    tr: 'Bir tasarımcı ajanın EDA_MCP oturumu; kapıda duran tek adım, DRC kaydında.',
    en: 'A designer agent’s EDA_MCP session; the one paused step is the DRC record.',
  },
  /** The README's own config example names its host `eda-uni` — keep it. */
  host: 'designer@eda-uni',
  scriptTitle: { tr: 'depletion-load inverter — akış oturumu (İLLÜSTRATİF)', en: 'depletion-load inverter — flow session (ILLUSTRATIVE)' },
  lines: [
    { kind: 'cmd', text: { tr: 'workboard initialize --name inverter-workspace', en: 'workboard initialize --name inverter-workspace' } },
    {
      kind: 'ok',
      text: {
        tr: 'yansıma kuruldu — uzak dosyalar ./workboard/inverter-workspace/ altında; SHA-256 toplamaları izleniyor',
        en: 'mirror set up — remote files under ./workboard/inverter-workspace/; SHA-256 checksums tracked',
      },
    },
    { kind: 'cmd', text: { tr: 'virtuoso assisted_run --script tasarım_depletion_inverter.il', en: 'virtuoso assisted_run --script design_depletion_inverter.il' } },
    {
      kind: 'ok',
      text: {
        tr: 'şema kuruldu — depletion-load inverter; NK/NP aygıtları CDF başlatıldı, W/L değerleri mikron dizgeleriyle geçildi',
        en: 'schematic built — depletion-load inverter; NK/NP instances CDF-initialised, W/L passed as micron strings',
      },
    },
    { kind: 'cmd', text: { tr: 'schCheck --cv inverter/schematic', en: 'schCheck --cv inverter/schematic' } },
    {
      kind: 'ok',
      text: {
        tr: 'sonuç (0 0) — sıfır hata, sıfır uyarı; şema netlist için hazır',
        en: 'result (0 0) — zero errors, zero warnings; the schematic is netlist-ready',
      },
    },
    { kind: 'cmd', text: { tr: 'cdl export --view schematic --file inverter.cdl', en: 'cdl export --view schematic --file inverter.cdl' } },
    {
      kind: 'info',
      text: {
        tr: 'yapısal netlist dışa yazıldı — WorkBoard manifesine eklendi; deck yerel depoda yazılıp diff’le gitmiş',
        en: 'structural netlist exported and added to the WorkBoard manifest; the deck was authored locally and shipped as a diff',
      },
    },
    { kind: 'cmd', text: { tr: 'eldo start_interactive --deck tb_inverter.cir', en: 'eldo start_interactive --deck tb_inverter.cir' } },
    {
      kind: 'ok',
      text: {
        tr: 'REPL akışı up — .extract raporu ayrıştırıldı: ön-yerleşim ölçütler alındı',
        en: 'REPL stream up — the .extract report parsed: pre-layout metrics captured',
      },
    },
    { kind: 'cmd', text: { tr: 'calibre -drc -hier drc.svrf', en: 'calibre -drc -hier drc.svrf' } },
    {
      kind: 'warn',
      text: {
        tr: '2 kural ihlali — yoğunluk kuralları; koordinatlar nm→µm dönüşüyle Virtuoso görünümünde işaretlendi',
        en: '2 rule violations — density rules; coordinates converted nm→µm and marked in the Virtuoso viewport',
      },
    },
  ],
  milestones: [
    { label: { tr: 'Çalışma alanı', en: 'Workspace' }, afterLines: 0 },
    { label: { tr: 'Şema', en: 'Schematic' }, afterLines: 2 },
    { label: { tr: 'Benzetim', en: 'Simulation' }, afterLines: 7 },
    { label: { tr: 'Fiziksel doğrulama', en: 'Physical verification' }, afterLines: 10 },
  ],
  gate: {
    prompt: { tr: 'KAPI — karar gerekiyor', en: 'GATE — a decision is needed' },
    question: {
      tr: 'DRC raporu temiz değil. Ajans ne yapacak? İllüstratif oturum: iki yol da meşru — ve kapatılacak kapı gerçek mühendisin.',
      en: 'The DRC report is not clean. What does the agent do? An illustrative session: both paths are legitimate — and the engineer closing the gate is a real one.',
    },
    railLabel: { tr: 'DRC kapısı', en: 'DRC gate' },
    options: [
      {
        id: 'fix',
        label: {
          tr: 'Düzelt ve yeniden çalıştır — işaretli hataları görüntüde ara, yerleşimi onar',
          en: 'Fix and re-run — open the marked violations in the viewport, repair the layout',
        },
        outcome: [
          {
            kind: 'cmd',
            text: { tr: 'hiPan --coord isaretli_ihlal --highlight', en: 'hiPan --coord marked_violation --highlight' },
          },
          {
            kind: 'ok',
            text: {
              tr: 'ihlal giderildi — katman genişletildi; calibre tekrar çalıştırıldı',
              en: 'violation resolved — layer expanded; calibre re-run',
            },
          },
          {
            kind: 'ok',
            text: {
              tr: 'DRC temiz — 100% SVRF raporu; LVS ve xRC sıradaki adım',
              en: 'DRC clean — 100% SVRF report; LVS and xRC are next',
            },
          },
        ],
      },
      {
        id: 'stop',
        label: {
          tr: 'Burada dur — kanıtları ve günlükleri mühendise raporla',
          en: 'Stop here — report the evidence and logs to the engineer',
        },
        outcome: [
          {
            kind: 'info',
            text: {
              tr: 'oturum durduruldu — DRC raporu, ön-yerleşim ölçütler ve WorkBoard diff’i derlendi',
              en: 'session paused — DRC report, pre-layout metrics and the WorkBoard diff compiled',
            },
          },
          {
            kind: 'ok',
            text: {
              tr: 'karar mühendiste — ajan, gözlenmemiş hiçbir sonucu başarılı ilan etmez',
              en: 'the call is the engineer’s — the agent declares no unobserved result a success',
            },
          },
        ],
      },
    ],
  },
  epilogue: [
    { kind: 'cmd', text: { tr: 'calibre -xrc -pdb -rcc', en: 'calibre -xrc -pdb -rcc' } },
    {
      kind: 'ok',
      text: {
        tr: 'parazitik çıkarımı tamam — .pex.spi desteği üretildi; R ve C ağları tüm katmanlardan',
        en: 'extraction complete — the .pex.spi deck produced; R and C networks across all layers',
      },
    },
    { kind: 'cmd', text: { tr: 'eldo run_script --deck tb_inverter.pex.cir', en: 'eldo run_script --deck tb_inverter.pex.cir' } },
    {
      kind: 'ok',
      text: {
        tr: 'son yerleşim ölçütler ayrıştırıldı — ön/son yerleşim farkları raporda yan yana',
        en: 'post-layout metrics parsed — pre/post-layout deltas side by side in the report',
      },
    },
  ],
  recordLabel: { tr: 'Kanıt kaydı', en: 'Evidence record' },
  close: {
    tr: 'Oturum kanıtla kapandı. İllüstratif akış; gerçek oturum günlüğü eklenene kadar bu etiketi taşır.',
    en: 'The session closed with its evidence. An illustrative run — it keeps that label until a real session log replaces it.',
  },
}
