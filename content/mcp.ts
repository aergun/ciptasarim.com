/**
 * Everything the /mcp page and the home page's EDA_MCP teaser say about
 * EDA_MCP — the open-source MCP control plane for agentic EDA (Cadence Virtuoso,
 * Siemens Eldo, Siemens Calibre) over SSH.
 *
 * ## Proof discipline: this file quotes the upstream README, never beyond it
 *
 * Every claim here appears in https://github.com/vs34/EDA_MCP (README.md, doc/,
 * context/) and every numeric claim carries the conditions that README states
 * alongside it. Nothing is generalised into a guarantee; anything the site adds
 * beyond the repo — chiefly the tie-in that this flow is how Cip Tasarım's
 * verification evidence is produced and reproduced — is marked
 * `confirm` and must NOT read as a claim until the owner confirms it.
 *
 * The PDK the README works through is cmos065. Foundry PDK data is licensed
 * material, usually under NDA: this file publishes no PDK files, layer maps,
 * rule decks or tool-frame geometry of that kind — the names of the tools and the
 * PDK appear only as identifiers. All illustrations the page draws are generic.
 *
 * Tool names and actions are identifiers: never translated.
 */

import type { T } from '../shared/types.ts'

export type McpFlowStage = {
  /** Stage order, 1-based. */
  n: number
  /** The stage, short — the pipeline's box label. */
  title: T
  /** The tool that runs it, with the concrete artefact/score it produces. */
  tool: T
  /** What the agent gets and what stands between steps. */
  detail: T
}

/**
 * The six-stage closed-loop flow, exactly the README's pipeline
 * (Schematic & PDK sizing → Layout XL → Calibre DRC → LVS → xRC PEX → Eldo
 * post-PEX). Labels carry the README's own check gates (`schCheck (0 0)`,
 * `100% clean SVRF`, `0 mismatches`) because those are the steps where the flow
 * stops on evidence.
 */
export const mcpFlow: readonly McpFlowStage[] = [
  {
    n: 1,
    title: { tr: 'Şema ve PDK boyutlama', en: 'Schematic & PDK sizing' },
    tool: {
      tr: 'Cadence Virtuoso — schCheck (0 0)',
      en: 'Cadence Virtuoso — schCheck (0 0)',
    },
    detail: {
      tr: 'Ajana; W/L değerleri mikron dizgeleri olarak verilen LP/GP aygıtlarla şema kurulur, CDF callback’leri işlenir ve şema, netlist öncesinde sıfır hata sıfır uyarı kuralına tabi tutulur.',
      en: 'The agent builds the schematic with LP/GP devices sized by micron strings, runs the CDF callbacks, and the schematic is validated to the 0-error-0-warning rule before netlisting.',
    },
  },
  {
    n: 2,
    title: { tr: 'Layout XL üretimi', en: 'Layout XL generation' },
    tool: {
      tr: 'Cadence Virtuoso Layout XL — GFS, VSR',
      en: 'Cadence Virtuoso Layout XL — GFS, VSR',
    },
    detail: {
      tr: 'Şema–yerleşim bağlantısı kurulu bir Layout XL oturumu açılır; Generate From Source aygıtları ve Metal 1 pinleri üretir, yerleşim 5 nm imalat ızgarasına yapışır.',
      en: 'A Layout XL session opens with active schematic correspondence; Generate From Source instantiates devices and Metal 1 pins, and geometry snaps to the 5 nm manufacturing grid.',
    },
  },
  {
    n: 3,
    title: { tr: 'Fiziksel doğrulama (DRC)', en: 'Physical verification (DRC)' },
    tool: {
      tr: 'Siemens Calibre DRC — resmi katman haritası, temiz SVRF',
      en: 'Siemens Calibre DRC — official layer map, clean SVRF',
    },
    detail: {
      tr: 'GDSII, resmi PDK katman haritasını ve case-korumayı içeren bir akışla yazılır (`strmout`); özel SVRF deck’i çalışır ve raporlar tamamen temiz hedefiyle düzeltilir.',
      en: 'GDSII streams out with the official PDK layer map and case preservation (`strmout`); a custom SVRF deck runs and violations are fixed toward a fully clean report.',
    },
  },
  {
    n: 4,
    title: { tr: 'Şema–yerleşim eşdeğerliği (LVS)', en: 'Layout-versus-schematic (LVS)' },
    tool: {
      tr: 'Siemens Calibre LVS — 0 uyuşmazlık hedefi',
      en: 'Siemens Calibre LVS — 0-mismatch goal',
    },
    detail: {
      tr: 'Şema veritabanından ve fiziksel GDSII’den yapısal SPICE netlistleri çıkarılıp karşılaştırılır; başarı ölçütü sıfır uyuşmazlık, sıfır kısa devre, sıfır açık devre, sıfır cihaz parametresi farkıdır.',
      en: 'Structural SPICE netlists are extracted from the schematic database and the physical GDSII and compared; success is 0 mismatches, 0 shorts, 0 opens and 0 device-parameter discrepancies.',
    },
  },
  {
    n: 5,
    title: { tr: 'Parazitik çıkarımı (PEX)', en: 'Parasitic extraction (PEX)' },
    tool: {
      tr: 'Siemens Calibre xRC — `.pex.spi` desteği',
      en: 'Siemens Calibre xRC — `.pex.spi` deck',
    },
    detail: {
      tr: 'Tüm metal ve via katmanlarında parazitik R ve C ağı hesaplanır; son yerleşim simülasyonunun girdisi olan detaylı subcircuit desteği üretilir.',
      en: 'Parasitic R and C networks are computed across all metal and via layers; the detailed subcircuit deck that feeds post-layout simulation is produced.',
    },
  },
  {
    n: 6,
    title: { tr: 'Son yerleşim simülasyonu', en: 'Post-layout simulation' },
    tool: {
      tr: 'Siemens Eldo — AC / DC / Tran / Güç',
      en: 'Siemens Eldo — AC / DC / Tran / Power',
    },
    detail: {
      tr: 'PEX desteği ön-yerleşim şemasıyla birlikte benzetilir; kazanç, bant genişliği, faz payı, slew, güç ve gürültü ölçütleri işleme haneleriyle karşılaştırılır. Eldo, `.extract` raporunu ayrıştırır.',
      en: 'The PEX deck simulates alongside the pre-layout schematic; gain, bandwidth, phase margin, slew, power and noise metrics are compared across process corners. Eldo parses the `.extract` report.',
    },
  },
] as const

/** One `mcpTools` row. `actions` is verbatim from the README, never translated. */
export type McpTool = {
  name: string
  actions: string
  desc: T
}

/**
 * The README's "Tool Reference & Capabilities Matrix", five modules, actions
 * copied accurately. The descriptions are a faithful rendering of the README's
 * use-case text in the reading language.
 */
export const mcpTools: readonly McpTool[] = [
  {
    name: 'workboard',
    actions: 'initialize, add, pull, push, export, diff, status, history',
    desc: {
      tr: 'Çalışma alanı eşzamanlayıcı ve sürüm denetimi: uzak Linux kümesindeki EDA dosyalarını `./workboard/<name>/` altındaki yerel Git deposunda izler; uzak dosyalar geri yazılmadan önce satır satır unified diff hesaplar.',
      en: 'Workspace synchronizer and version control: tracks remote EDA files in local Git repositories under `./workboard/<name>/`, computing line-by-line unified diffs before remote files are updated.',
    },
  },
  {
    name: 'virtuoso',
    actions: 'assisted_run, run, start_standalone, run_standalone, exit, run_terminal_command',
    desc: {
      tr: 'Cadence Virtuoso SKILL ve Layout XL denetimi: açık bir GUI oturumunda canlı SKILL çalıştırır (`assisted_run`) veya grafiksiz oturum kurar (`start_standalone`); Layout XL üretimini, PDK kurallarını ve `schCheck` `\\(0 0\\)` doğrulamasını yürütür.',
      en: 'Cadence Virtuoso SKILL & Layout XL control: runs SKILL live in an open GUI session (`assisted_run`) or sets up a non-graphical session (`start_standalone`); drives Layout XL generation, PDK rules and `schCheck` `\\(0 0)` validation.',
    },
  },
  {
    name: 'eldo',
    actions: 'start_interactive, run_interactive, run_script, visualize_waveforms, run_terminal_command',
    desc: {
      tr: 'Siemens Eldo SPICE benzetim motoru: toplu `.cir` çalıştırmaları, interaktif SPICE REPL akışı, `.extract` ölçüt ayrıştırma ve ön/son yerleşim PEX destekleri için dalga görselleştirme.',
      en: 'Siemens Eldo SPICE simulation engine: batch `.cir` runs, an interactive SPICE REPL stream, `.extract` metric parsing and waveform plotting for pre- and post-layout PEX decks.',
    },
  },
  {
    name: 'remote_control',
    actions: 'run_command, read_file, write_file',
    desc: {
      tr: 'Durumlu csh alt kabuğu motoru: uçbirim komutları, Calibre DRC/LVS toplu betikleri, GDSII akışı (`strmout`) ve kalıcı ortam oturumlarında (`/cadence/cshrc`) uzak dosya incelemesi.',
      en: 'Stateful csh subshell engine: terminal commands, Calibre DRC/LVS batch scripts, GDSII stream-out (`strmout`) and remote file inspection in persistent environment sessions (`/cadence/cshrc`).',
    },
  },
  {
    name: 'report_issue',
    actions: 'report_issue',
    desc: {
      tr: 'Özerk meta-harness raporlayıcı: yürütme günlükleri, ajan başlıkları ve oturum kimlikleri otomatik iliştirilmiş GitHub hata/özellik kaydı açan, ajanlar arası haber hattı.',
      en: 'Autonomous meta-harness reporter: an inter-agent landline that opens GitHub bug/feature reports with execution logs, agent headers and session IDs attached automatically.',
    },
  },
] as const

/** One row of the home teaser's proof points and /mcp's evidence table. */
export type McpProof = {
  /** The claim, as strong as the README states it and no stronger. */
  claim: T
  /** The conditions the README attaches to the claim, in reading language. */
  conditions: T
  /** Where in the upstream repo this claim comes from. */
  cite: T
}

/**
 * Claims usable on the site. Two rules the page enforces with layout, not prose:
 * a claim is never shown without its conditions, and `confirm:true` claims stay
 * off the page entirely until the owner answers.
 */
export type McpEvidence = McpProof & { confirm?: boolean }

export const mcpEvidence: readonly McpEvidence[] = [
  {
    claim: {
      tr: '10 ms’nin altında SSH gecikmesi',
      en: 'Sub-10 ms SSH latency',
    },
    conditions: {
      tr: 'Kalıcı OpenSSH ControlMaster soketleri ve akış dosya aktarımı ile el sıkışma yükünün giderilmesi; üst deponun kendi bileşeni.',
      en: 'The handshake overhead is eliminated by persistent OpenSSH ControlMaster sockets and streaming file transfer; a design property of the upstream module.',
    },
    cite: {
      tr: 'EDA_MCP README — “Sub-10ms SSH Multiplexing Engine”',
      en: 'EDA_MCP README — “Sub-10ms SSH Multiplexing Engine”',
    },
  },
  {
    claim: {
      tr: '793 parazitik öğe (347 R, 446 C)',
      en: '793 parasitic elements (347 R, 446 C)',
    },
    conditions: {
      tr: 'Tek 65 nm op-amp yerleşiminden Calibre xRC çıkarımı; bu sayı örnekleme özgüsüdür, genel bir yoğunluk vaadi değildir.',
      en: 'Extracted with Calibre xRC from a single 65 nm op-amp layout; the number belongs to that run, not to any general density claim.',
    },
    cite: {
      tr: 'EDA_MCP README — “Parasitic Extraction”',
      en: 'EDA_MCP README — “Parasitic Extraction”',
    },
  },
  {
    claim: {
      tr: 'Tek kesintisiz oturumda uçtan uca akış',
      en: 'End-to-end flow in one continuous session',
    },
    conditions: {
      tr: 'Üst deponun Issue #53 CheckPoint kilometre taşı: çok aşamalı bloğun kurulması, yerleşim, kural düzeltmesi, LVS eşleşmesi, 700+ parazitik çıkarımı ve son yerleşim doğrulaması tek oturumda tamamlandı.',
      en: 'The upstream repo’s Issue #53 CheckPoint milestone: a multi-stage block built, laid out, rule-fixed, LVS-matched, 700+ parasitics extracted and post-layout performance validated in one session.',
    },
    cite: {
      tr: 'EDA_MCP README — “Verified Full-Flow Baseline” (Issue #53)',
      en: 'EDA_MCP README — “Verified Full-Flow Baseline” (Issue #53)',
    },
  },
  {
    claim: {
      tr: 'Şema tamamlama ölçütü: schCheck \\(0 0\\)',
      en: 'Schematic completion criterion: schCheck \\(0 0\\)',
    },
    conditions: {
      tr: 'Tasarımcı bağlam sözleşmesi: ajans, şemanın temiz olduğunu ancak gözlenen sıfır hata sıfır uyarı sonucuyla iddia edebilir; kanıt, ekran çıktısıdır.',
      en: 'The designer context contract: an agent may claim a clean schematic only on an observed 0-error-0-warning result; the evidence is the console output.',
    },
    cite: {
      tr: 'EDA_MCP context/designer — “execution contract”',
      en: 'EDA_MCP context/designer — “execution contract”',
    },
  },
] as const

/** Teaser picks three of these; the page lists all four. Read-only — no drift. */
export function mcpTeaserEvidence(): readonly McpProof[] {
  return mcpEvidence.slice(0, 3)
}

/* ---------------------------------------------------------------- */
/* Guard rails                                                        */
/* ---------------------------------------------------------------- */

export type McpGuard = {
  title: T
  body: T
}

/**
 * The safety properties the README and the dual-track specs state, as they
 * state them. The fourth is the `CommandGuard` from the coder context: a
 * blocklist, allowed-directories check and a JSONL audit log ahead of every
 * shell command.
 */
export const mcpGuards: readonly McpGuard[] = [
  {
    title: { tr: 'Git’e bağlı WorkBoard: push’tan önce diff', en: 'Git-backed WorkBoard: diff before push' },
    body: {
      tr: 'Uzak küme dosyaları yerel Git depolarında yansılanır; ajansın her geri yazması satır satır unified diff ile gözden geçirilir ve SHA-256 toplamalarıyla doğrulanır — bozulmuş bir dosya gitmiş olur, geri alma geçmişi de tam kalır.',
      en: 'Remote cluster files are mirrored in local Git repositories; every write-back is reviewed as a line-by-line unified diff and verified by SHA-256 checksums — a corrupted file never ships, and the full rollback history stays.',
    },
  },
  {
    title: { tr: 'Tasarımcı/kodcu çift-iz bağlam yönlendirici', en: 'Designer/coder dual-track context router' },
    body: {
      tr: 'Ajans niyetini sınıflandırır ve ancak o izin operasyonel spec’ini okur: şema, yerleşim ve benzetim niyetleri `context/designer/` altındaki kuralları; kod tabanı ve PR işleri `context/coder/` altındakileri alır. Araç yok düşünsün: şema yok, PDK yok.',
      en: 'The agent classifies its intent and reads only that track’s operational spec: circuit-design intents load the rules under `context/designer/`, codebase and PR work loads those under `context/coder/`. Agents invent neither tool actions nor PDK facts.',
    },
  },
  {
    title: { tr: 'Otomatik birleştirme yok', en: 'No auto-merge' },
    body: {
      tr: 'Katı NO-AUTOMERGE politikası: kodcu ajanlar asla main’e push etmez, PR açar ve durur; karar insan incelemesine bırakılır. Ajanlar arası akran inceleme, `agent-landline` haber hattıyla PR öncesi çalışır.',
      en: 'The strict no-automerge policy: coder agents never merge PRs or push to main; they stop after opening one and leave the decision to human review. Peer review between agents runs before the PR, over the `agent-landline` channel.',
    },
  },
  {
    title: { tr: 'Komut bekçisi ve denetim günlüğü', en: 'Command guard and audit log' },
    body: {
      tr: 'Her kabuk komutu ve dosya yazımı çalışmadan önce bir kara listeyle, izin verilen dizin kontrolüyle ve kuru-deneme bayrağıyla sınanır; kabul edilen komutlar JSONL denetim günlüğüne yazılır.',
      en: 'Every shell command and file write passes a blocklist, an allowed-directories check and a dry-run flag before it runs; accepted commands land in a JSONL audit log.',
    },
  },
] as const

/* ---------------------------------------------------------------- */
/* Get started: install, clients, requirements                       */
/* ---------------------------------------------------------------- */

/** The one-line install. The repo path placeholder stays a placeholder. */
export const mcpInstallOneLiner =
  'claude mcp add eda-mcp -- python3 /absolute/path/to/EDA_MCP/server.py'

export type McpSnippet = {
  /** Client name as the README names it. */
  name: string
  /** Snippet language, drives the code block's tag. */
  lang: 'bash' | 'json' | 'text'
  /** The exact snippet, verbatim from the README or its config templates. */
  code: string
  /** Where the snippet goes, in the reading language. */
  target: T
}

/**
 * Client configurations, copied accurately. The SSH block is the README's own
 * `~/.ssh/config` example (its server name is the README's placeholder, not a
 * real host).
 */
export const mcpSnippets: readonly McpSnippet[] = [
  {
    name: 'Claude Code',
    lang: 'bash',
    target: { tr: 'Uçbirim — bir kez çalıştırın', en: 'Terminal — run once' },
    code: mcpInstallOneLiner,
  },
  {
    name: 'Claude Desktop',
    lang: 'json',
    target: { tr: '`claude_desktop_config.json` içine', en: 'Into `claude_desktop_config.json`' },
    code: `{
  "mcpServers": {
    "eda-mcp": {
      "command": "python3",
      "args": [
        "/absolute/path/to/EDA_MCP/server.py"
      ]
    }
  }
}`,
  },
  {
    name: 'Cursor / Windsurf',
    lang: 'text',
    target: { tr: 'Stdio MCP sunucu kaydı', en: 'Stdio MCP server entry' },
    code: `Server Name : EDA_MCP
Command     : python3
Args        : /absolute/path/to/EDA_MCP/server.py`,
  },
  {
    name: '~/.ssh/config',
    lang: 'text',
    target: {
      tr: 'Kalıcı soket: README’nin kendi örneği',
      en: 'Persistent socket: the README’s own example',
    },
    code: `Host eda-uni
    HostName eda.university.edu
    User chip_designer
    ControlMaster auto
    ControlPath ~/.ssh/control-%r@%h:%p
    ControlPersist 15m`,
  },
] as const

/* ---------------------------------------------------------------- */
/* Identity, licence, notices                                        */
/* ---------------------------------------------------------------- */

/** The upstream project, credited wherever it is described. */
export const mcpUpstream = {
  repo: 'https://github.com/vs34/EDA_MCP',
  name: 'EDA_MCP',
  /** The credit line, both languages. */
  credit: {
    tr: 'EDA_MCP, vs34 tarafından dağıtılan bir açık kaynak projesidir (MIT). SiliCad ekosisteminin içinde doğmuştur.',
    en: 'EDA_MCP is an open-source project distributed by vs34 under the MIT License, born inside the SiliCad ecosystem.',
  },
} as const

export const mcpTrademarkNotice = {
  tr: 'Cadence, Virtuoso ve SKILL Cadence Design Systems’ın; Siemens, Eldo ve Calibre Siemens’in ticari markalarıdır. EDA_MCP bu araçlarla birlikte çalışır; hiçbir marka sahibiyle ilişki veya onay ima etmez.',
  en: 'Cadence, Virtuoso and SKILL are trademarks of Cadence Design Systems; Siemens, Eldo and Calibre are trademarks of Siemens. EDA_MCP works with these tools; nothing here implies affiliation with or endorsement by their owners.',
} as const

export const mcpPdkNotice = {
  tr: 'README’de kullanılan PDK örneği (cmos065) dökümhane malıdır ve genellikle NDA altındadır. Bu sayfada PDK dosyası, katman haritası, kural deck’i veya PDK özgü geometri gösteren yerleşim görüntüsü yayımlanmaz; çizimler jeneriktir.',
  en: 'The example PDK in the README (cmos065) is foundry material, usually under NDA. This page publishes no PDK files, layer maps, rule decks or layouts showing PDK-specific geometry; every drawing is generic.',
} as const
