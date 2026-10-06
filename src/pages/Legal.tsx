/**
 * The four legal pages — /gizlilik, /sartlar, /fikri-mulkiyet and
 * /lisanslar/sartlar — one component, `page` picking the document.
 *
 * Every page is honest in the same direction as the rest of the site: no
 * regulation is quoted at second hand, no company identifier is presented in a
 * real-looking format (the VAT registration is the deliberate `TR VATANUMARASI`
 * placeholder from `content/site.ts`, shown on the terms page only, because
 * that is the page where an invoice would need it), and the licence-terms page
 * is a *summary pointing at the licence agreement* — the
 * `includes`/`excludes`/`rights`/`restrictions` lists from `content/licences.ts`
 * and the bundle scope from `content/packages.ts` — not a pseudo-legal
 * re-drafting of them.
 *
 * The prose is written here rather than in a content file because it is
 * page-length and page-specific: these are four documents that are pages, not
 * fragments a catalogue could reuse. Each language states the same document
 * written in that language — the Turkish text governs, and the pages say so.
 */

import type { T } from '../../shared/types.ts'
import { useSite } from '../lib/site.tsx'
import {
  Container,
  Heading,
  PageHeader,
  Prose,
  Section,
} from '../components/ui.tsx'
import { licences } from '../../content/licences.ts'
import { bundles } from '../../content/packages.ts'
import { site } from '../../content/site.ts'

export type LegalPage = 'privacy' | 'terms' | 'ip' | 'licenceTerms'

/* ------------------------------------------------------------------ privacy */

const privacyIntro: T = {
  tr: 'Bu sayfa, sitede hangi verinin toplandığını ve neden toplandığını anlatır. Yazılanlar, işletmenin fiilî uygulamasıdır; üçüncü taraflara hizmet veren bir metin değildir.',
  en: 'This page states what data the site collects and why. What is written here describes the operator’s actual practice; it is not a document served on a third party’s behalf.',
}

const privacyCollectedTitle: T = {
  tr: 'Toplanan veri',
  en: 'What is collected',
}

const privacyCollected: readonly T[] = [
  {
    tr: 'Hesap kaydı: kayıt için verilen e-posta adresi ve kurum adı. Şifre yalnızca karma (hash) olarak tutulur; düz metin hiçbir yerde saklanmaz.',
    en: 'Account registration: the email address and the organisation name given at sign-up. A password is stored only as a hash; no plaintext copy exists anywhere.',
  },
  {
    tr: 'Sipariş kayıtları: hangi çekirdeğin hangi lisans kademesinde teslim edildiği. Bir uyuşmazlıkta veya yeniden indirme işleminde tek referans kayıttır.',
    en: 'Order records: which core was delivered under which licence tier. This is the single reference in a dispute, or when a delivery is downloaded again.',
  },
  {
    tr: 'İletişim formu: gönderdiğiniz ad, e-posta, kurum adı ve mesaj. Form verisi, talebin cevaplanması için saklanır.',
    en: 'The enquiry form: the name, email, organisation and message you submit. Form data is kept so the enquiry can be answered.',
  },
  {
    tr: 'Oturum çerezi: yalnızca girişte çalışmak için gerekli bir oturum tanımlayıcısı. Takip için kullanılan bir çerez yoktur.',
    en: 'A session cookie: a session identifier needed only for being signed in. No tracking cookies are set.',
  },
]

const privacyNotCollectedTitle: T = {
  tr: 'Toplanmayan veri',
  en: 'What is not collected',
}

const privacyNotCollected: readonly T[] = [
  {
    tr: 'Üçüncü taraf analitik yüklenmez; sayfa görüntüleme ölçümü yoktur.',
    en: 'No third-party analytics are loaded; nothing on the page measures your browsing.',
  },
  {
    tr: 'Reklam takibi veya çapraz site profilleme yoktur; veri ticareti yapılmaz.',
    en: 'No advertising trackers and no cross-site profiling; no data is sold or shared for marketing.',
  },
  {
    tr: 'Yükleme yoktur: sitede dosya kabul eden bir uç nokta bile yoktur.',
    en: 'No uploads: the site has no endpoint that accepts a file, so none can be stored unexpectedly.',
  },
]

const privacyRightsTitle: T = {
  tr: 'Silme ve düzeltme talepleri',
  en: 'Deletion and correction requests',
}

const privacyRights: T = {
  tr: 'Kişisel verilerinizin silinmesini veya düzeltilmesini istemek için, kayıttaki e-posta adresinden bize yazmanız yeterlidir. İletişim formu üzerinden gönderilen bir talep için, sadece talebin içine yazdığınız veri saklanır; talebin kendisi silindiğinde bu veri de silinir.',
  en: 'To ask for your personal data to be deleted or corrected, write to us from the email address you registered with. For a request sent through the enquiry form, only the data you typed into the request is stored; when the request is deleted, that data is deleted with it.',
}

/* -------------------------------------------------------------------- terms */

const termsIntro: T = {
  tr: 'Bu sayfa, bir siparişin nasıl oluştuğunu ve ne zaman bağlayıcı olduğunu anlatır. Ayrıntıların bir kısmı çekirdek ve kademe başına değişir; bağlayıcı belge, sipariş onayında yazılan tanımdır.',
  en: 'This page states how an order is formed and when it is binding. Some details vary per core and per tier; the binding document is the definition written into the order confirmation.',
}

const termsOrderTitle: T = {
  tr: 'Sipariş ve onay',
  en: 'Order and acceptance',
}

const termsOrder: T = {
  tr: 'Sipariş bir talep olarak başlar: site üzerinde verilen bir sipariş veya form ile gönderilen bir talep, hukuki olarak henüz bağlayıcı değildir. Anlaşma, talebin yazılı olarak onaylanması ve teslim koşullarının (kademe, paket, bedel, takvim) onayda yazılı hâle gelmesi ile kurulur.',
  en: 'An order begins as a request: an order placed on the site, or an enquiry sent through the form, is not yet binding. The agreement exists when the request is confirmed in writing and the delivery terms — tier, bundle, price and schedule — are stated in that confirmation.',
}

const termsDeliveryTitle: T = {
  tr: 'Teslim',
  en: 'Delivery',
}

const termsDelivery: T = {
  tr: 'Teslim, hesabınızın indirme sayfasından verilir; kapsamı, lisans kademesinden çok teslim paketiyle belirlenir. Kademe, kullanım hakkını düzenler, dosya kapsamını değil; paketin içerdiği ve dışladığı, her çekirdeğin kendi sayfasında çekirdeğe göre yazılıdır.',
  en: 'Delivery happens from your account’s download page, and its scope is set by the delivery bundle rather than the licence tier: the tier governs your right to use the delivery, not what files are in it, and each bundle’s includes and excludes are stated per core, on that core’s page.',
}

const termsFeesTitle: T = {
  tr: 'Bedeller',
  en: 'Fees',
}

const termsFees: T = {
  tr: 'Çekirdek bedelleri teklif üzeredir; fiyatlama sayfasındaki tablo, kademe ve paket yapısını gösterir, rakamı göstermez. Bedeller KDV hariçtir. Şirket adı {COMPANY} olup kayıtlı KDV numarası, ilk faturaya kadar bilinçli bir yer tutucu ({VAT}) olarak tutulur: sitede gerçek gibi görünen bir numara yayınlanmaz, çünkü yanlış bir numara, doğru biçimde yazılmış bir boşluktan daha kötüdür.',
  en: 'Core prices are quoted per project; the table on the pricing page shows the tier and bundle structure, not a figure. Prices exclude VAT. The company is {COMPANY}, and its registered VAT number is held as a deliberate placeholder ({VAT}) until the first invoice: this site does not publish a number that looks real, because a wrong identifier is worse than an honest gap.',
}

const termsPaymentTitle: T = {
  tr: 'Ödeme',
  en: 'Payment',
}

const termsPayment: T = {
  tr: 'Ödeme yalnızca banka havalesi ile kabul edilir; sitede kredi kartı girişi veya bir ödeme sağlayıcısı yoktur. Fatura bilgisi, teklif onayında paylaşılan belgelerle birlikte yazılı olarak verilir.',
  en: 'Payment is accepted by bank transfer only: there is no card entry and no payment provider on the site. Invoice details are issued in writing together with the quote confirmation.',
}

const termsCancellationTitle: T = {
  tr: 'İptal',
  en: 'Cancellation',
}

const termsCancellation: T = {
  tr: 'Henüz teslim edilmemiş bir sipariş, yazılı bildirimle iptal edilebilir; ödenmiş bedelin yalnızca teslime kadar gerçekleşen işin (örneğin bir taşıma işi için geliştirilen dosyaların) karşılığı tutarı tahsil edilir. Teslim edilmiş dijital dosyalar dosyanın doğası gereği geri alınamaz; indirme sonrası cay hakkı yoktur.',
  en: 'An order not yet delivered can be cancelled in writing, and only the share of the fee corresponding to work already performed — files developed for a porting job, for example — is retained against it. Delivered digital files cannot be returned by their nature; there is no right of withdrawal after download.',
}

const termsLawTitle: T = {
  tr: 'Uygulanacak hukuk',
  en: 'Governing law',
}

const termsLaw: T = {
  tr: 'Bu sayfa ve kapsamındaki siparişler, {LAW} tabidir. Bir uyuşmazlığın nasıl ele alınacağı, sipariş onayındaki sözleşme ile birlikte okunur.',
  en: 'This page and all orders under it are governed by {LAW}. How a dispute is heard is read together with the agreement in the order confirmation.',
}

/* ----------------------------------------------------------------------- ip */

const ipIntro: T = {
  tr: 'Bu sayfa, sitede satılan çekirdeklerin fikri mülkiyet durumunu ve sitede adı geçen üçüncü taraf isimlerinin kapsamını yazılı hâle getirir.',
  en: 'This page states who owns the intellectual property in the cores sold here, and the exact scope of the third-party names that appear on the site.',
}

const ipOwnershipTitle: T = {
  tr: 'Tasarımın mülkiyeti',
  en: 'Ownership of the design',
}

const ipOwnership: T = {
  tr: 'Çekirdekleri oluşturan RTL, kısıtlamalar, doğrulama ortamları ve teslim edilen tüm dosyalar, {COMPANY} adına geliştirilmiştir: teslim, bir lisans kapsamında kullanım hakkı verir; mülkiyeti veya tasarımın kaynağını devirmez. Bir müşteride üretilen silikonun mülkiyeti, dökümhanenin ve müşterinin kendi kurallarına tabidir; çekirdeğin kendisi bu devrin dışındadır.',
  en: 'The RTL, constraints, verification environments and every delivered file are developed for {COMPANY}: a delivery grants a right of use under a licence and does not transfer ownership or the origin of the design. Silicon produced at a customer follows the foundry’s and the customer’s own ownership terms; the core itself sits outside that transfer.',
}

const ipTrademarksTitle: T = {
  tr: 'Markalar',
  en: 'Trademarks',
}

const ipTrademarks: T = {
  tr: 'PDK, GDSII, Liberty, SystemVerilog ve benzeri isimler, sahiplerinin tescilli markalarıdır. Bu site, hiçbir dökümhane veya EDA tedarikçisiyle bağlantılı değildir; bu isimler yalnızca teknik bağlamda adlandırma amacıyla kullanılır.',
  en: 'PDK, GDSII, Liberty, SystemVerilog and similar designations are the trademarks of their respective owners. This site is unaffiliated with every foundry and EDA vendor, and those names are used here only to name the technical context.',
}

const ipSiteContentTitle: T = {
  tr: 'Sitenin içeriği',
  en: 'This site’s content',
}

const ipSiteContent: T = {
  tr: 'Sitenin metinleri, hesaplayıcı modelleri ve teknik yazılar, {COMPANY} adına yazılmıştır; bir çekirdek satın alınmadan okunabilir, ancak izinsiz olarak yeniden yayımlanamaz.',
  en: 'The site’s text, its calculator models and its technical notes are written for {COMPANY}: they can be read before buying a core, but they may not be republished without permission.',
}

/* ------------------------------------------------------------ licence terms */

const licenceIntro: T = {
  tr: 'Bu sayfa, lisans şartlarının bir özetidir; bağlayıcı belge, sipariş onayında size verilen lisans sözleşmesinin kendisidir. Aşağıdaki listeler, sözleşmenin ana kalemlerinin site tarafında gösterilen karşılığıdır ve sözleşmeyle çelişmezler: bir uyuşmazlık hâlinde sözleşme okunur.',
  en: 'This page is a summary of the licence terms; the binding document is the licence agreement itself, delivered with your order confirmation. The lists below are what that agreement’s main clauses look like as stated on the site, and they do not conflict with it: in a disagreement, the agreement is read.',
}

const licenceBundlesTitle: T = {
  tr: 'Teslim paketleri',
  en: 'Delivery bundles',
}

const licenceBundlesIntro: T = {
  tr: 'Teslim kapsamı, lisans kademesinden bağımsızdır: kademe kullanım hakkını, paket teslim edilecek dosyaları belirler. Sitede dört teslim paketi tanımlıdır ve her birinin içerdiği ve dışladığı, çekirdeğin sayfasında çekirdeğe göre yazılıdır.',
  en: 'Delivery scope is independent of the licence tier: the tier sets your right to use, and the bundle sets which files are delivered. Four delivery bundles are defined, and each one’s includes and excludes are stated per core, on that core’s page.',
}

const languageNote: T = {
  tr: 'Bu sayfalar sitenin diğer sayfalarıyla aynı kaynağın çevirisi değildir: her dil, aynı belgeyi o dilde yazılmış hâlidir. Bir uyuşmazlıkta Türkçe metin esas alınır.',
  en: 'These pages are not translations of one another: each language states the same document, written in that language. In a disagreement the Turkish text governs.',
}

/* --------------------------------------------------------------------------- */

const HEADINGS: Record<LegalPage, T> = {
  privacy: { tr: 'Gizlilik', en: 'Privacy' },
  terms: { tr: 'Satış şartları', en: 'Terms of sale' },
  ip: { tr: 'Fikri mülkiyet', en: 'Intellectual property' },
  licenceTerms: { tr: 'Lisans şartları', en: 'Licence terms' },
}

const LEDES: Record<LegalPage, T> = {
  privacy: privacyIntro,
  terms: termsIntro,
  ip: ipIntro,
  licenceTerms: licenceIntro,
}

/** Replaces the `{COMPANY}` / `{VAT}` / `{LAW}` markers with the site's legal facts. */
function substitute(text: T, values: Record<string, string>): T {
  const apply = (input: string): string =>
    Object.entries(values).reduce(
      (acc, [key, value]) => acc.replaceAll(`{${key}}`, value),
      input,
    )
  return { tr: apply(text.tr), en: apply(text.en) }
}

/** One clause block: an authored heading, body paragraphs. */
function Clause({ title, body }: { title: T; body: T | readonly T[] }) {
  const { t } = useSite()

  return (
    <section className="py-8 first:pt-0">
      <Heading as="h3">{t(title)}</Heading>
      <div className="mt-3 space-y-3">
        {(Array.isArray(body) ? body : [body]).map((paragraph, index) => (
          <Prose key={index}>{t(paragraph)}</Prose>
        ))}
      </div>
    </section>
  )
}

export function Legal({ page }: { page: LegalPage }) {
  const { strings, t } = useSite()

  const values = {
    COMPANY: site.legal.company,
    VAT: site.legal.vat,
    LAW: site.legal.governingLaw,
  }

  return (
    <article>
      <Section className="pb-0 pt-14">
        <Container width="narrow">
          <PageHeader
            eyebrow={strings.footer.legal}
            title={t(HEADINGS[page])}
            lede={t(LEDES[page])}
          />
        </Container>
      </Section>

      <Section className="py-14">
        <Container width="narrow">
          <div className="divide-y divide-line border-y border-line">
            {page === 'privacy' ? <PrivacyBody /> : null}
            {page === 'terms' ? <TermsBody values={values} /> : null}
            {page === 'ip' ? <IpBody values={values} /> : null}
            {page === 'licenceTerms' ? <LicenceBody /> : null}
          </div>

          <p className="mt-10 text-[12px] leading-relaxed text-mist">{t(languageNote)}</p>
        </Container>
      </Section>
    </article>
  )
}

/**
 * Privacy. Two lists — what is collected, what is not — carry the page; the
 * second list is the one the site's architecture makes true rather than merely
 * promised: no analytics are loaded because no analytics exist in the codebase.
 */
function PrivacyBody() {
  return (
    <>
      <Clause title={privacyCollectedTitle} body={privacyCollected} />
      <Clause title={privacyNotCollectedTitle} body={privacyNotCollected} />
      <Clause title={privacyRightsTitle} body={privacyRights} />
    </>
  )
}

function TermsBody({ values }: { values: Record<string, string> }) {
  const clauses: { title: T; text: T }[] = [
    { title: termsOrderTitle, text: termsOrder },
    { title: termsDeliveryTitle, text: termsDelivery },
    { title: termsFeesTitle, text: termsFees },
    { title: termsPaymentTitle, text: termsPayment },
    { title: termsCancellationTitle, text: termsCancellation },
    { title: termsLawTitle, text: termsLaw },
  ]

  return (
    <>
      {clauses.map((clause) => (
        <Clause key={clause.title.tr} title={clause.title} body={substitute(clause.text, values)} />
      ))}
    </>
  )
}

function IpBody({ values }: { values: Record<string, string> }) {
  const clauses: { title: T; text: T }[] = [
    { title: ipOwnershipTitle, text: ipOwnership },
    { title: ipTrademarksTitle, text: ipTrademarks },
    { title: ipSiteContentTitle, text: ipSiteContent },
  ]

  return (
    <>
      {clauses.map((clause) => (
        <Clause key={clause.title.tr} title={clause.title} body={substitute(clause.text, values)} />
      ))}
    </>
  )
}

/**
 * The licence summary. The tier lists are not rewritten here — they render
 * straight from `content/licences.ts`, the same lists the licences page shows,
 * so the summary and the product page cannot disagree.
 */
function LicenceBody() {
  const { strings, t } = useSite()

  return (
    <>
      {licences.map((licence) => (
        <section key={licence.id} className="py-8 first:pt-0">
          <Heading as="h3">{t(licence.name)}</Heading>
          <Prose className="mt-3">{t(licence.summary)}</Prose>
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            <ListBlock heading={strings.licences.includes} items={licence.includes} t={t} />
            <ListBlock heading={strings.licences.excludes} items={licence.excludes} t={t} />
            <ListBlock heading={strings.licences.rights} items={licence.rights} t={t} />
            <ListBlock heading={strings.licences.restrictions} items={licence.restrictions} t={t} />
          </div>
        </section>
      ))}

      <section className="py-8">
        <Heading as="h3">{t(licenceBundlesTitle)}</Heading>
        <div className="mt-3">
          <Prose>{t(licenceBundlesIntro)}</Prose>
        </div>
        <ul className="mt-4 space-y-3">
          {bundles.map((bundle) => (
            <li key={bundle.id} className="text-[15px] leading-[1.75] text-mist">
              <span className="font-mono text-[13px] text-ink">{t(bundle.name)}</span>
              {' — '}
              {t(bundle.summary)}
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}

/** One of a licence's four lists, under a small heading. */
function ListBlock({
  heading,
  items,
  t,
}: {
  heading: string
  items: readonly T[]
  t: (text: T) => string
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-mist">{heading}</p>
      <ul className="mt-3 space-y-2">
        {items.map((item, index) => (
          <li key={index} className="text-[13px] leading-relaxed text-mist">
            {t(item)}
          </li>
        ))}
      </ul>
    </div>
  )
}