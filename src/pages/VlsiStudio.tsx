/**
 * The VLSI Studio page — /hesaplayicilar/vlsi-studio, the one entry under the
 * calculators that is not a calculator.
 *
 * ## Why it is not a `tools.ts` record
 *
 * Every calculator in `content/tools.ts` stands inside a two-sided contract:
 * declared inputs and results on this side, a dispatcher in
 * `shared/engineering.ts` on the other, with the `EngineeringNotice` above the
 * results. VLSI Studio is an external hosted application — its models, rule
 * decks and results live on eeenhub.com, and this repo can honour none of that
 * contract for it. So the page stands outside it, and says so: the
 * calculators' promise (assumptions written above the results) is described
 * here as belonging to the calculators, never claimed for this tool.
 *
 * ## The embed
 *
 * The frame loads the app's own URL — nothing is copied into this repo, no
 * build step is added, and the app's cookies and storage are eeenhub.com's.
 * `loading="lazy"` keeps its bytes off the initial page load; it only fetches
 * when the frame nears the viewport, the same discipline as the /mcp demo
 * video. A plain `#studio` anchor is fine even without JS (it is a same-page
 * fragment, not a route), so the jump link is an `<a>` rather than
 * `LocaleLink`, which is reserved for route navigation.
 *
 * Bilingual rules: the prose is authored Turkish-first here as `T` pairs; the
 * short labels live in the mirrored bundles (`strings.tools.*`); the tool's
 * name, version and host are identifiers and are never translated.
 */

import { LocaleLink, useSite } from '../lib/site.tsx'
import { ExternalButtonLink, Container, Eyebrow, PageHeader, Prose, Section } from '../components/ui.tsx'
import { vlsiStudio } from '../../content/vlsi-studio.ts'

export function VlsiStudio() {
  const { strings, t } = useSite()

  const lede = {
    tr: 'CMOS IC yerleşimi, şema besteci, RTL→GDS akışı, DRC/imza kontrolü, LVS ve SPICE benzetimi tek bir tarayıcı uygulamasında: VLSI Studio, geliştiricisinin eeenhub.com sitesinde yayımladığı bir araçtır ve bu sayfada, kendi sitesinde sunulduğu hâliyle gömülü çalışır.',
    en: 'CMOS IC layout, a schematic composer, the RTL→GDS flow, DRC/sign-off, LVS and SPICE simulation in one browser application: VLSI Studio is published by its developer on eeenhub.com and runs here exactly as it is served there.',
  }

  const howEmbedded = {
    tr: 'Aşağıdaki çerçeve, aracın kendi URL’sindeki canlı sürümü aynen yükler: hiçbir bileşeni bu depoya kopyalanmaz ya da yeniden barındırılmaz. Daha geniş bir çalışma alanı için eeenhub.com bağlantısını kullanın; ikisi de aynı sürümdür, ikincisi tüm penceredir.',
    en: 'The frame below loads the live version at the tool’s own URL: nothing is copied into this repo or re-hosted here. For a wider working area use the eeenhub.com link; both are the same version, the second is simply the whole window.',
  }

  const provenance = {
    tr: 'Bu sayfadaki olgular — ad, sürüm ve yetenek listesi — 27 Kasım 2026 tarihinde aracın kendi sayfasından alınmıştır. Araç kendi sitesinde güncellendikçe bu kayıt geride kalabilir; gömülü çerçeve ise daima canlı sürümü taşır.',
    en: 'The facts on this page — the name, version and capability list — were taken from the tool’s own page on 27 November 2026. As the tool is updated on its own site, this record can fall behind; the embedded frame always carries the live version.',
  }

  const scope = {
    tr: 'Bu sayfa sitedeki mühendislik hesaplayıcılarının sözleşmesinin dışındadır: bildirilen girdi ve sonuç modeli, sonuçların üzerindeki varsayım notu ve mühendislik uyarısı Çip Tasarım hesaplayıcılarını bağlar; bunların hiçbiri bu dış aracı bağlıyor gibi okunmamalıdır. Aracın modellerinin, kurallarının ve koşullarının tanımı kendi sitesindedir.',
    en: 'This page stands outside the engineering calculators’ contract: the declared input and result model, the assumption note above the results and the engineering notice bind Ciptasarım’s calculators, and none of it should be read as binding this external tool. What its models, rules and conditions are is defined on its own site.',
  }

  const frameNote = {
    tr: 'Gömülü uygulama kodunu eeenhub.com alanından yükler: çerezleri, yerel depolaması ve kullanım koşulları o alanındır; bir düzenleme oturumunuz site hesaplarından bağımsızdır. Bu tür bir düzenleyici küçük ekranda zor kullanılır; tam deneyim için masaüstü bilgisayar önerilir.',
    en: 'The embedded application loads its code from eeenhub.com: its cookies, local storage and terms of use belong to that origin, and a design session is independent of your site accounts. An editor of this kind is hard on a small screen; a desktop computer is recommended for the full experience.',
  }

  const frameTitle = {
    tr: 'VLSI Studio 1.5.0 — eeenhub.com tarafından sunulan canlı uygulama',
    en: 'VLSI Studio 1.5.0 — the live application, served by eeenhub.com',
  }

  const caption = {
    tr: `Canlı uygulama: VLSI Studio ${vlsiStudio.version}, ${vlsiStudio.host} tarafından sunulur — bu sayfada gömülü, yeni sekmede tam pencere.`,
    en: `Live application: VLSI Studio ${vlsiStudio.version}, served by ${vlsiStudio.host} — embedded in this page, full-window in a new tab.`,
  }

  return (
    <article>
      <Section className="pb-0 pt-14">
        <Container width="narrow">
          <LocaleLink
            to="/hesaplayicilar"
            className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mist hover:text-ink"
          >
            ← {strings.tools.title}
          </LocaleLink>
          <PageHeader className="mt-8" eyebrow={strings.tools.externalTool} title={vlsiStudio.name} lede={t(lede)} />
          <Prose className="mt-8">{t(howEmbedded)}</Prose>
          <Prose className="mt-4">{t(provenance)}</Prose>

          <div className="mt-8 flex flex-wrap gap-4">
            <ExternalButtonLink href={vlsiStudio.url}>{strings.tools.openOnSource}</ExternalButtonLink>
            <a
              href="#studio"
              className="inline-flex items-center border border-line px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.18em] text-ink transition-colors hover:border-ink"
            >
              {strings.tools.embedded}
            </a>
          </div>
        </Container>
      </Section>

      <Section className="py-14">
        <Container>
          <div id="studio" className="scroll-mt-16">
            <Eyebrow>{strings.tools.embedded}</Eyebrow>
            <div className="mt-4 border border-line bg-paper">
              <iframe
                src={vlsiStudio.url}
                // The app's own background shows through while its bundle
                // loads; the fill is a dark tone close to the app's own theme
                // so the interim never reads as a broken panel. The tool
                // paints its full theme once its bundle lands.
                className="h-[75vh] min-h-[560px] w-full bg-[#0e1220]"
                loading="lazy"
                referrerPolicy="no-referrer"
                title={t(frameTitle)}
              />
            </div>
            <p className="mt-3 text-[12px] text-mist">{t(caption)}</p>
          </div>
        </Container>
      </Section>

      <Section className="pb-24 pt-0">
        <Container width="narrow">
          <Eyebrow>{strings.tools.scopeNote}</Eyebrow>
          <Prose className="mt-4">{t(scope)}</Prose>
          <Prose className="mt-3">{t(frameNote)}</Prose>
        </Container>
      </Section>
    </article>
  )
}
