/**
 * The VLSI Studio record — the one tool on this site that is not a calculator
 * from `content/tools.ts`. It is an external hosted application, embedded in
 * an iframe on /hesaplayicilar/vlsi-studio (+ /en).
 *
 * ## Provenance of every fact here
 *
 * The tool's own page — https://eeenhub.com/vlsi/ — is the only authority this
 * repo has over it, and that page's `<head>` is nearly silent; its `<title>` is
 * the whole description: "VLSI Studio v1.5.2 — CMOS IC Layout, Schematic
 * Composer, RTL→GDS, DRC/Sign-Off, LVS & SPICE | Baykal Sarıoğlu". Every claim
 * the page makes is derived from that title, and `observedOn` records when the
 * title was last read. Two reads on 2026-11-27 disagree — v1.5.0 in the
 * morning, v1.5.2 the same day — because the tool updates itself quickly; the
 * embedded frame always carries the live version, so this record's version is
 * only what the prose promises, and must be re-checked whenever the page is
 * edited. The site does not scrape it at build time, and it does not guess.
 *
 * Nothing here is hostable by this repo, and nothing is copied onto it: the
 * frame loads the app from its own origin, and its cookies, storage and terms
 * are eeenhub.com's.
 */

export const vlsiStudio = {
  slug: 'vlsi-studio',
  /** The app's own URL — what the frame src-es and what the outbound CTA opens. */
  url: 'https://eeenhub.com/vlsi/',
  host: 'eeenhub.com',
  name: 'VLSI Studio',
  /** From the tool's own title, last observed on `observedOn`. */
  version: '1.5.2',
  observedOn: '2026-11-27',

  /** Per-locale head meta; consumed by `server/head.ts`, never rendered as prose. */
  meta: {
    title: {
      tr: 'VLSI Studio — tarayıcıda CMOS yerleşim, şema, DRC, LVS ve SPICE',
      en: 'VLSI Studio — CMOS layout, schematic, DRC, LVS and SPICE in the browser',
    },
    description: {
      tr: 'VLSI Studio 1.5.2: eeenhub.com üzerinde yayımlanan tarayıcı tabanlı VLSI tasarım stüdyosu — CMOS IC yerleşimi, şema besteci, RTL→GDS akışı, DRC/imza kontrolü, LVS ve SPICE. Çip Tasarım sayfasında gömülü çalışır.',
      en: 'VLSI Studio 1.5.2: a browser-based VLSI design studio published on eeenhub.com — CMOS IC layout, schematic composer, the RTL→GDS flow, DRC/sign-off, LVS and SPICE. Runs embedded on this Ciptasarım page.',
    },
  },
} as const
