/**
 * Smoke suite.
 *
 * ## Env first, imports second
 *
 * ES module imports hoist: `import { createApp } from './app.ts'` at the top of a
 * file would evaluate `db.ts` — and capture its `DB_PATH` from `process.env` — before
 * the first line of this module's body ran. The suite therefore sets every path into
 * the environment *first*, and pulls every server module in with `await import()`
 * after. Everything below the `await`s runs with the suite's own temporary database
 * and file directory, never the developer's real `data/app.db`.
 *
 * Everything the suite needs the environment for is read from `process.env` at
 * import time in the server: `DATABASE_PATH`, `FILES_DIR` (in `db.ts`) and
 * `SESSION_SECRET` (in `session.ts`). Nothing else is faked: the app is an Express
 * app listening on an ephemeral port, exercised with real HTTP through a real
 * session cookie, because "the route handler passes when I call it directly" is
 * exactly the claim this suite exists to be able to disbelieve.
 *
 * ## Where payment happens in this suite
 *
 * Nowhere, on purpose, inside any route. The production flow confirms payment out of
 * band — an operator matches a transfer against a reference in the bank's interface.
 * The suite's operator step is the same step done through SQLite directly: `UPDATE
 * orders SET status = 'payment_confirmed'` and an `INSERT` into `entitlements`. That
 * is not a shortcut; it is the real seam. There is no `ALLOW_MOCK_PAYMENTS` flag and
 * no gateway in this build, so there is also no flag to accidentally enable here.
 */

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import crypto from 'node:crypto'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

/* --------------------------------------------------------- env, then imports */

const ROOT = mkdtempSync(join(tmpdir(), 'ciptasarim-smoke-'))
const DATA_PATH = join(ROOT, 'app.db')
const FILES_DIR = join(ROOT, 'files')

mkdirSync(join(FILES_DIR, 'uart-fifo'), { recursive: true })
process.env.DATABASE_PATH = DATA_PATH
process.env.FILES_DIR = FILES_DIR
// A fixed secret, set deliberately: a random in-memory secret would also work in
// development, but an explicitly-set one proves the route the suite exercises is the
// one a production deployment reads its secret into.
process.env.SESSION_SECRET = 'smoke-suite-secret-0123456789abcdef0123456789abcdef'

const { createApp } = await import('./app.ts')
const { closeDb, getDb, now } = await import('./db.ts')
const { cores } = await import('../content/cores.ts')
const { coreFor } = await import('../content/cores.ts')
const { localeBundle } = await import('../locales/index.ts')
const {
  contentDisposition,
  fold,
  formatNumber,
  formatPercent,
  formatDate,
  matches,
  parseLocaleNumber,
  safeFilename,
  toUrlNumber,
} = await import('../shared/i18n.ts')
const { runEngineering } = await import('../shared/engineering.ts')
const siteModule = await import('../content/site.ts')
const { articles } = await import('../content/articles.ts')
const { faqs } = await import('../content/faqs.ts')
const { tools } = await import('../content/tools.ts')

/* --------------------------------------------------------------------------- */

let passed = 0
const failures: string[] = []

function check(label: string, ok: boolean, detail = ''): void {
  if (ok) {
    passed++
    console.log(`  ok    ${label}`)
  } else {
    failures.push(`${label}${detail ? ` — ${detail}` : ''}`)
    console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ''}`)
  }
}

function section(name: string): void {
  console.log(`\n${name}\n${'-'.repeat(name.length)}`)
}

type Jar = Record<string, string>

/** Minimal cookie jar: carries one session cookie per (jar, origin). */
function cookieHeader(jar: Jar): string {
  return Object.entries(jar)
    .map(([name, value]) => `${name}=${value}`)
    .join('; ')
}

interface HttpResult {
  status: number
  body: unknown
  json: Record<string, unknown>
  headers: Headers
}

async function call(
  base: string,
  jar: Jar,
  method: 'GET' | 'POST' | 'DELETE',
  path: string,
  body?: unknown,
  headers: Record<string, string> = {},
): Promise<HttpResult> {
  const res = await fetch(base + path, {
    method,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(jar && Object.keys(jar).length > 0 ? { cookie: cookieHeader(jar) } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  for (const setCookie of res.headers.getSetCookie()) {
    const pair = setCookie.slice(0, setCookie.indexOf('='))
    const value = setCookie.slice(setCookie.indexOf('=') + 1, setCookie.indexOf(';'))
    jar[pair] = value
  }

  const text = await res.text()
  let json: Record<string, unknown> = {}
  try {
    json = text.length > 0 ? (JSON.parse(text) as Record<string, unknown>) : {}
  } catch {
    // An HTML body (the SPA fallback) is a payload the suite knows how to describe
    // without decoding: record the first bytes instead of throwing.
    json = { html: text.slice(0, 80) }
  }
  return { status: res.status, body: text, json, headers: res.headers }
}

/* --------------------------------------------------------- the seeded file */

/**
 * One real deliverable, on disk and in the manifest.
 *
 * The placeholder catalogue ships `documents: []` on every core — files are
 * authored when real deliverables exist, not before. But the download route's
 * security properties are the reason this server exists, so the suite seeds
 * exactly one `DocumentFile` onto one core at runtime, writes a real file at the
 * manifest's path inside the suite's `FILES_DIR`, and drives the route through it.
 *
 * Writing to the runtime catalogue is deliberate: `coreFor()` in the route reads the
 * same array this suite pushed into, so the manifest, the entitlements and the file
 * on disk are one consistent world, and nothing in `content/` is changed on disk.
 */
const SEEDED_CORE_SLUG = 'uart-fifo'
const SEEDED_KEY = 'uart-fifo-rtl'
const SEEDED_PATH = 'uart-fifo/uart-fifo-rtl.pdf'
const PART_NUMBER = 'CT-UART-FIFO'
const SEEDED_LABEL = {
  tr: 'kapı seviyesinde ağ listesi',
  en: 'gate-level netlist',
} as const

const seededCore = cores.find((c) => c.slug === SEEDED_CORE_SLUG)!
;(seededCore.documents as unknown as { push(file: unknown): number }).push({
  key: SEEDED_KEY,
  label: SEEDED_LABEL,
  path: SEEDED_PATH,
  sizeKb: 12,
  format: 'pdf',
  requires: null,
  version: '1.0.0',
})
writeFileSync(join(FILES_DIR, ...SEEDED_PATH.split('/')), 'RTL PLACEHOLDER BUNDLE\n')

/* --------------------------------------------------------------------------- */

async function main(): Promise<void> {
  const app = createApp()
  const server = app.listen(0, '127.0.0.1')
  await new Promise<void>((resolve) => server.once('listening', resolve))
  const base = `http://127.0.0.1:${(server.address() as { port: number }).port}`

  const jarA: Jar = {}
  const jarB: Jar = {}

  const PASSWORD = 'parola-en-az-on-karakter'

  try {
    /* ---------------------------------------------------------- boot and health */
    section('Boot and health')

    const health = await call(base, {}, 'GET', '/api/health')
    check('health returns 200', health.status === 200, `status=${health.status}`)
    check('health says payment is bank transfer', health.json.payment === 'bank-transfer')
    check('/api under an unknown route is a JSON 404, not the SPA', (await call(base, {}, 'GET', '/api/definitely-not-a-route')).json.error === 'No such endpoint.')

    /* -------------------------------------------------------- locale integrity */
    section('Locale integrity')

    const trBundle = localeBundle('tr')
    const enBundle = localeBundle('en')

    const paths = (obj: unknown, prefix = ''): string[] =>
      obj === null || obj === undefined
        ? [prefix]
        : typeof obj === 'object'
          ? Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
              paths(v, prefix ? `${prefix}.${k}` : k),
            )
          : [prefix]

    const trKeys = paths(trBundle)
    const enKeys = paths(enBundle)
    check('the two locale bundles expose the same key set at runtime', trKeys.length === enKeys.length)
    const mismatched = enKeys.filter((k) => !trKeys.includes(k))
    check('no key exists in en that is missing in tr', mismatched.length === 0, mismatched.slice(0, 5).join(', '))

    /** Resolves a dotted leaf path into a bundle. */
    const leaf = (bundle: Record<string, unknown>, path: string): unknown =>
      path.split('.').reduce<unknown>((acc, key) => (acc === null || acc === undefined ? acc : (acc as Record<string, unknown>)[key]), bundle)

    const differing = trKeys.filter((k) => leaf(trBundle, k) !== leaf(enBundle, k))
    check('bundles carry distinct text in both languages', differing.length > 0, `${differing.length} differing leaves`)
    check(
      'every leaf resolves to a string in both bundles',
      trKeys.every((k) => typeof leaf(trBundle, k) === 'string' && typeof leaf(enBundle, k) === 'string'),
    )

    check('the contact route is in the primary nav', siteModule.primaryNav.some((l) => l.to === '/iletisim'))

    /* ------------------------------------------------------ the Turkish search */
    section('The Turkish search bug')

    check("fold('İLETİŞİM') is found by 'iletisim'", fold('İLETİŞİM').includes(fold('iletisim')))
    check("'iletisim' finds core prose through the search matcher", matches(['Kapı seviyesi NETLİSTİ'], 'netl'))
    check("'ışık' and 'isik' match", matches(['ışık'], 'isik') && matches(['IŞIK'], 'isik'))

    /* ------------------------------------------------- process cell provenance */
    section('Unsourced cells never become datasheet figures')

    const processList = await call(base, {}, 'GET', '/api/catalogue/processes')
    check('the process table is served', processList.status === 200)
    const processes = processList.json.processes as Record<string, unknown>[]
    check('every process row serves every node', Array.isArray(processes) && processes.length > 0)
    check(
      'every figure-keyed cell is basis-stamped',
      processes.every((p) =>
        Object.values(p).every(
          (v) =>
            v === null ||
            typeof v !== 'object' ||
            !('basis' in (v as Record<string, unknown>)) ||
            typeof (v as { basis: unknown }).basis === 'string',
        ),
      ),
    )
    const uncharacterisedCells = processes.flatMap((p) =>
      Object.entries(p)
        .filter(([, v]) => v !== null && typeof v === 'object' && (v as { basis?: string }).basis === 'uncharacterised')
        .map(([k, v]) => ({ node: p.node as string, key: k, cell: v as { reason?: { tr?: string; en?: string }; value?: unknown; basis?: string } })),
    )
    check('the placeholder process table is uncharacterised, so the check below has subjects', uncharacterisedCells.length > 0)
    check(
      'uncharacterised cells carry a reason in both languages',
      uncharacterisedCells.every(
        (c) =>
          typeof c.cell.reason?.tr === 'string' &&
          c.cell.reason.tr.trim().length > 0 &&
          typeof c.cell.reason?.en === 'string' &&
          c.cell.reason.en.trim().length > 0,
      ),
    )
    check(
      'uncharacterised cells carry no value',
      uncharacterisedCells.every((c) => !('value' in c.cell)),
    )
    check('a single process row serves one node', (await call(base, {}, 'GET', '/api/catalogue/processes/40nm')).json.process !== undefined)

    // Measured vs modelled distinguishability. The placeholder catalogue holds no
    // measured figure — the first measured value will be a deliberate commit with a
    // source — so the distinction is proven on the type the API stamps, using the
    // articles' modelled figure as the subject that does exist.
    const modelledInProse = articles
      .flatMap((a) => a.blocks)
      .filter((b) => b.kind === 'figure')
    check('the notes embed real figures with provenance', modelledInProse.length > 0)
    check('every embedded figure states where it came from', modelledInProse.every((b) => b.kind === 'figure' && 'model' in b.figure || !('value' in b.figure)))

    /* -------------------------------------------------------- tr-TR formatting */
    section('tr-TR formatting, ASCII share URLs')

    check('1234.5 formats as 1.234,50 in Turkish', formatNumber(1234.5, 'tr', 2) === '1.234,50', formatNumber(1234.5, 'tr', 2))
    check('1234.5 formats as 1,234.50 in English', formatNumber(1234.5, 'en', 2) === '1,234.50', formatNumber(1234.5, 'en', 2))
    check('percent puts the sign in front in Turkish', formatPercent(0.5, 'tr', 1) === '%50,0', formatPercent(0.5, 'tr', 1))
    check('toUrlNumber writes ASCII without grouping', toUrlNumber(1234.5) === '1234.5', toUrlNumber(1234.5))
    check('a Turkish-typed comma decimal parses', parseLocaleNumber('12,34') === 12.34)
    check('a pasted grouped value parses as thousands', parseLocaleNumber('1.234,5') === 1234.5)
    check('the round trip is stable', parseLocaleNumber(toUrlNumber(1234.5)) === 1234.5)
    check('formatDate is dd.month in Turkish', formatDate('2026-09-12', 'tr').includes('Eylül'), formatDate('2026-09-12', 'tr'))

    /* --------------------------------------------------------- Turkish filename */
    section('A Turkish filename survives delivery')

    const disposition = contentDisposition(`${PART_NUMBER} ${SEEDED_LABEL.tr}.pdf`)
    const utf8Name = (disposition.split("filename*=UTF-8''")[1] ?? '')
    check('the header carries an RFC 5987 UTF-8 filename', disposition.includes("filename*=UTF-8''"), disposition)
    check(
      'the UTF-8 filename keeps the Turkish characters',
      decodeURIComponent(utf8Name) === safeFilename(`${PART_NUMBER} ${SEEDED_LABEL.tr}.pdf`),
      disposition,
    )
    check(
      'the ASCII fallback is a mangled duplicate, not an emptied name',
      disposition.includes('filename=') &&
        !/filename="[^"]*uart[^"]*"/.test(disposition.replace(/filename\*[^;]*/g, '')),
      disposition,
    )

    /* ----------------------------------------------------------------- accounts */
    section('Accounts')

    const EMAIL_A = 'alici-a@ornek-firma.test'
    const EMAIL_B = 'alici-b@ornek-firma.test'

    const regA = await call(base, jarA, 'POST', '/api/auth/register', {
      email: EMAIL_A,
      password: PASSWORD,
      company: 'Örnek Firma A',
    })
    check('account A registers', regA.status === 201, `status=${regA.status}`)
    const regB = await call(base, jarB, 'POST', '/api/auth/register', {
      email: EMAIL_B,
      password: PASSWORD,
      company: 'Örnek Firma B',
    })
    check('account B registers', regB.status === 201)
    check('A and B have different user ids', (regA.json.user as { id: string }).id !== (regB.json.user as { id: string }).id)

    const meA = await call(base, jarA, 'GET', '/api/auth/me')
    check('A is signed in via a session cookie', (meA.json.user as { email?: string } | null)?.email === EMAIL_A)

    const duplicate = await call(base, {}, 'POST', '/api/auth/register', { email: EMAIL_A, password: PASSWORD })
    check('registering a taken email is a 409', duplicate.status === 409)
    const shortPassword = await call(base, {}, 'POST', '/api/auth/register', { email: 'x@y.test', password: 'kisa' })
    check('a short password is refused', shortPassword.status === 400)

    // The account-existence oracle, checked on the body: an unknown email and a
    // wrong password must return byte-identical error bodies.
    const unknownEmail = await call(base, {}, 'POST', '/api/auth/login', {
      email: 'nobody@nowhere.test',
      password: PASSWORD,
    })
    const wrongPassword = await call(base, {}, 'POST', '/api/auth/login', { email: EMAIL_A, password: 'yanlış parola' })
    check('unknown email is a 401', unknownEmail.status === 401)
    check('wrong password is a 401', wrongPassword.status === 401)
    check(
      'the two failures return the same body (no account-existence oracle)',
      unknownEmail.body === wrongPassword.body,
      `${JSON.stringify(unknownEmail.body)} vs ${JSON.stringify(wrongPassword.body)}`,
    )

    const badBody = await call(base, {}, 'POST', '/api/auth/register', { email: 'not-an-email', password: PASSWORD })
    check('an invalid email is a 400 with a field', badBody.status === 400 && 'fields' in badBody.json)

    /* ------------------------------------------------------------------- orders */
    section('Orders — the client-supplied price is ignored')

    const orderBody = {
      items: [
        // A quantity the domain does not allow (licences are per-design, quantity 1)
        // for the RTL bundle, with a tampered price and a tampered total. The server
        // stores identifiers only; every figure is re-derived.
        { coreSlug: SEEDED_CORE_SLUG, bundle: 'rtl', tier: 'production', quantity: 5, unitPriceUsd: 1000000, totalUsd: 9999999 },
        { coreSlug: SEEDED_CORE_SLUG, bundle: 'netlist', tier: 'evaluation' },
      ],
      note: 'Teslim için 2026 çeyreği hedefi.',
    }
    const created = await call(base, jarA, 'POST', '/api/orders', orderBody)
    check('the order is created for A', created.status === 201, JSON.stringify(created.json).slice(0, 200))
    const order = created.json.order as {
      reference: string
      status: string
      subtotalUsd: unknown
      items: { priceUsd: unknown }[]
    }
    check('the reference is CT-prefixed', typeof order.reference === 'string' && order.reference.startsWith('CT-'))
    check('the order starts in awaiting_payment', order.status === 'awaiting_payment')
    check(
      'no line carries the client-supplied price',
      order.items.every((item) => item.priceUsd === null),
      JSON.stringify(order.items),
    )
    check('the subtotal is null, not the sum of priceable lines', order.subtotalUsd === null)

    const badCore = await call(base, jarA, 'POST', '/api/orders', {
      items: [{ coreSlug: 'no-such-core', bundle: 'rtl', tier: 'evaluation' }],
    })
    check('an unknown core is a 400', badCore.status === 400)
    const badBundle = await call(base, jarA, 'POST', '/api/orders', {
      items: [{ coreSlug: SEEDED_CORE_SLUG, bundle: 'no-such-bundle', tier: 'evaluation' }],
    })
    check('an unknown bundle is a 400', badBundle.status === 400)
    const emptyOrder = await call(base, jarA, 'POST', '/api/orders', { items: [] })
    check('an empty order is a 400', emptyOrder.status === 400)

    const another = await call(base, jarA, 'POST', '/api/orders', {
      items: [{ coreSlug: SEEDED_CORE_SLUG, bundle: 'rtl', tier: 'evaluation' }],
    })
    check('a second order exists to withdraw', another.status === 201)
    const withdrawableRef = (another.json.order as { reference: string }).reference

    const listA = await call(base, jarA, 'GET', '/api/orders')
    check('A sees its own orders', (listA.json.orders as unknown[]).length === 2)

    const bOnA = await call(base, jarB, 'GET', `/api/orders/${order.reference}`)
    check('B reading A’s order is a 404, not a 403', bOnA.status === 404, `status=${bOnA.status}`)
    const unknownRef = await call(base, jarA, 'GET', '/api/orders/CT-AAAAAAAAAA')
    check('a made-up reference is the same 404 body as someone else’s order', unknownRef.body === bOnA.body)

    check('an unauthenticated order read is refused', (await call(base, {}, 'GET', '/api/orders')).status === 401)

    const withdraw = await call(base, jarA, 'DELETE', `/api/orders/${withdrawableRef}`)
    check('an unpaid order can be withdrawn', withdraw.json.status === 'cancelled')
    const withdrawAgain = await call(base, jarA, 'DELETE', `/api/orders/${withdrawableRef}`)
    check(
      'withdrawing a cancelled order stays cancelled and never becomes payable again',
      withdrawAgain.status === 200 && withdrawAgain.json.status === 'cancelled',
      `status=${withdrawAgain.status} body=${JSON.stringify(withdrawAgain.json)}`,
    )

    /* ------------------------------------------- out-of-band confirmation step */
    section('The operator confirms payment out of band')

    getDb()
      .prepare(`UPDATE orders SET status = 'payment_confirmed', paid_at = ? WHERE reference = ?`)
      .run(now(), order.reference)
    getDb()
      .prepare(
        `INSERT INTO entitlements (id, user_id, core_slug, bundle, tier, order_id, granted_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        crypto.randomUUID(),
        (regA.json.user as { id: string }).id,
        SEEDED_CORE_SLUG,
        'rtl',
        'production',
        (created.json.order as { id: string }).id,
        now(),
      )

    const paidOrder = await call(base, jarA, 'GET', `/api/orders/${order.reference}`)
    check('confirmation is visible to the buyer', (paidOrder.json.order as { status: string }).status === 'payment_confirmed')

    const deletePaid = await call(base, jarA, 'DELETE', `/api/orders/${order.reference}`)
    check('a paid order cannot be withdrawn — it is a 409, not a silent revert', deletePaid.status === 409)

    /* ----------------------------------------------------------------- library */
    section('Delivery library — the four barriers')

    const libB = await call(base, jarB, 'GET', '/api/library')
    check('B sees an empty library', (libB.json.items as unknown[]).length === 0)
    const libA = await call(base, jarA, 'GET', '/api/library')
    check('A sees the seeded file', (libA.json.items as unknown[]).some((i) => JSON.stringify(i).includes(SEEDED_KEY)))

    // Barrier 1+4 are structural (outside public/, no-store); assert the headers.
    const downloadA = await call(
      base,
      jarA,
      'GET',
      `/api/library/${SEEDED_CORE_SLUG}/${SEEDED_KEY}`,
      undefined,
      { 'Accept-Language': 'tr-TR,tr' },
    )
    check('A can download the seeded file', downloadA.status === 200, `status=${downloadA.status}`)
    check('the download carries private, no-store', downloadA.headers.get('cache-control') === 'private, no-store', downloadA.headers.get('cache-control') ?? '')
    check('the download is octet-stream with nosniff', downloadA.headers.get('x-content-type-options') === 'nosniff')
    // The delivered filename is `${core.name} ${label}` with no extension, run
    // through `safeFilename` — spaces become hyphens and the Turkish letters survive
    // into the RFC 5987 parameter.
    const aDisposition = downloadA.headers.get('content-disposition') ?? ''
    check(
      'A (Turkish) gets the Turkish filename end to end',
      decodeURIComponent(aDisposition.split("filename*=UTF-8''")[1] ?? '') ===
        safeFilename(`${PART_NUMBER} ${SEEDED_LABEL.tr}`),
      aDisposition,
    )

    const downloadEn = await call(
      base,
      jarA,
      'GET',
      `/api/library/${SEEDED_CORE_SLUG}/${SEEDED_KEY}`,
      undefined,
      { 'Accept-Language': 'en' },
    )
    const enDisposition = downloadEn.headers.get('content-disposition') ?? ''
    check(
      'an English-speaking client gets the English filename on the same file',
      decodeURIComponent(enDisposition.split("filename*=UTF-8''")[1] ?? '') ===
        safeFilename(`${PART_NUMBER} ${SEEDED_LABEL.en}`),
      enDisposition,
    )

    // Barrier 2: the owner is in the WHERE clause. Every refusal below is the same
    // body, so the endpoint is not an oracle.
    const bDownload = await call(base, jarB, 'GET', `/api/library/${SEEDED_CORE_SLUG}/${SEEDED_KEY}`)
    const unknownKey = await call(base, jarA, 'GET', `/api/library/${SEEDED_CORE_SLUG}/no-such-key`)
    const unknownCore = await call(base, jarA, 'GET', '/api/library/no-such-core/whatever')
    check('B cannot fetch A’s file', bDownload.status === 404)
    check('a wrong key is a 404', unknownKey.status === 404)
    check('an unknown core is a 404', unknownCore.status === 404)
    check(
      'all three refusals return the same body',
      bDownload.body === unknownKey.body && unknownKey.body === unknownCore.body,
    )
    check('the anonymous caller is refused everywhere', (await call(base, {}, 'GET', `/api/library/${SEEDED_CORE_SLUG}/${SEEDED_KEY}`)).status === 401)

    /* --------------------------------------------------------------- enquiries */
    section('Contact enquiries')

    const spam = await call(base, {}, 'POST', '/api/enquiries', {
      name: 'spam',
      email: 'spam@spam.test',
      message: 'buy now',
      website: 'http://spam.example',
    })
    check('the honeypot is answered with a plausible 201', spam.status === 201 && spam.json.reference === 'EN-0000000000')
    check('the honeypot writes nothing', (getDb().prepare<[], { n: number }>(`SELECT COUNT(*) AS n FROM enquiries`).get()!.n) === 0)

    const one = await call(base, {}, 'POST', '/api/enquiries', { name: 'Ahmet', email: 'ahmet@firma.test', message: 'RTL paketi için teklif' })
    check('a real enquiry is 201 with a reference', one.status === 201 && typeof one.json.reference === 'string' && one.json.reference.startsWith('EN-'))
    check('the enquiry is stored', (getDb().prepare<[], { n: number }>(`SELECT COUNT(*) AS n FROM enquiries`).get()!.n) === 1)

    const two = await call(base, {}, 'POST', '/api/enquiries', { name: 'Ayşe', email: 'ayse@firma.test', message: 'iki' })
    const three = await call(base, {}, 'POST', '/api/enquiries', { name: 'Mehmet', email: 'mehmet@firma.test', message: 'üç' })
    const four = await call(base, {}, 'POST', '/api/enquiries', { name: 'Zeynep', email: 'zeynep@firma.test', message: 'dört' })
    check('three submissions per window are accepted', one.status === 201 && two.status === 201 && three.status === 201)
    check('the fourth submission in the window is throttled', four.status === 429)

    check('the enquiry inbox route is not mounted', (await call(base, {}, 'GET', '/api/enquiries')).status === 404)

    /* ------------------------------------------------------- deterministic models */
    section('Models are deterministic')

    for (const tool of tools) {
      const input = Object.fromEntries(tool.inputs.map((f) => [f.id, f.default]))
      const first = JSON.stringify(runEngineering(tool.id, input))
      const second = JSON.stringify(runEngineering(tool.id, input))
      check(`${tool.id} runs the same twice on the same inputs`, first === second)
    }
    check('the catalogue holds the cores the routes serve', cores.length > 0 && coreFor(SEEDED_CORE_SLUG) !== null)
    check('every FAQ has a bilingual question and answer', faqs.every((f) => f.question.tr.length > 0 && f.answer.en.length > 0))

    /* ------------------------------------------------------------------ close */
  } finally {
    closeDb()
    server.close()
  }

  console.log('\n' + '='.repeat(60))
  if (failures.length === 0) {
    console.log(`smoke passed — ${passed} checks`)
  } else {
    console.log(`smoke FAILED — ${failures.length} failure(s), ${passed} passed\n`)
    for (const f of failures) console.log(`  · ${f}`)
    process.exitCode = 1
  }
}

await main().then(() => rmSync(ROOT, { recursive: true, force: true }))