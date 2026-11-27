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
 * contract for it. So the page stands outside it, and says so in its closing
 * note: the calculators' promise (assumptions written above the results) is
 * described here as belonging to the calculators, never claimed for this tool.
 *
 * ## The embed, and the page's silence
 *
 * The frame loads the app's own URL — nothing is copied into this repo, no
 * build step is added, and the app's cookies and storage are eeenhub.com's.
 * `loading="lazy"` keeps its bytes off the initial page load; it only fetches
 * when the frame nears the viewport, the same discipline as the /mcp demo
 * video. At the owner's choosing (2026-11-27) this page carries no intro copy:
 * the description lives on the home page's studio teaser, and the frame is the
 * page. The facts (name, version, host) still belong to the tool's own title,
 * recorded in `content/vlsi-studio.ts`.
 */

import { LocaleLink, useSite } from '../lib/site.tsx'
import { Container, Eyebrow, Prose, Section } from '../components/ui.tsx'
import { vlsiStudio } from '../../content/vlsi-studio.ts'

export function VlsiStudio() {
  const { strings, t } = useSite()

  const frameTitle = {
    tr: `VLSI Studio ${vlsiStudio.version} — eeenhub.com tarafından sunulan canlı uygulama`,
    en: `VLSI Studio ${vlsiStudio.version} — the live application, served by eeenhub.com`,
  }

  const caption = {
    tr: `Canlı uygulama: VLSI Studio ${vlsiStudio.version}, ${vlsiStudio.host} tarafından sunulur.`,
    en: `Live application: VLSI Studio ${vlsiStudio.version}, served by ${vlsiStudio.host}.`,
  }

  const scope = {
    tr: 'Bu sayfa sitedeki mühendislik hesaplayıcılarının sözleşmesinin dışındadır: bildirilen girdi ve sonuç modeli, sonuçların üzerindeki varsayım notu ve mühendislik uyarısı Çip Tasarım hesaplayıcılarını bağlar; bunların hiçbiri bu dış aracı bağlıyor gibi okunmamalıdır. Aracın modellerinin, kurallarının ve koşullarının tanımı kendi sitesindedir.',
    en: 'This page stands outside the engineering calculators’ contract: the declared input and result model, the assumption note above the results and the engineering notice bind Ciptasarım’s calculators, and none of it should be read as binding this external tool. What its models, rules and conditions are is defined on its own site.',
  }

  const frameNote = {
    tr: 'Gömülü uygulama kodunu eeenhub.com alanından yükler: çerezleri, yerel depolaması ve kullanım koşulları o alanındır; bir düzenleme oturumunuz site hesaplarından bağımsızdır. Bu tür bir düzenleyici küçük ekranda zor kullanılır; tam deneyim için masaüstü bilgisayar önerilir.',
    en: 'The embedded application loads its code from eeenhub.com: its cookies, local storage and terms of use belong to that origin, and a design session is independent of your site accounts. An editor of this kind is hard on a small screen; a desktop computer is recommended for the full experience.',
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
                // so the interim never reads as a broken panel. With the intro
                // copy gone the frame is the page, so it fills more of it.
                className="h-[85vh] min-h-[600px] w-full bg-[#0e1220]"
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
