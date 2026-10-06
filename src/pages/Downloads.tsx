/*
 * Downloads (/hesap/indirmeler).
 *
 * The page a paid licence resolves to, and the one page where access control is
 * the product: every file behind it is a licensed deliverable, so the list is
 * read from the server's entitlement resolution (`GET /api/library`) rather than
 * from anything the client remembers. A grant the catalogue no longer resolves
 * simply does not appear — that is the server's decision, and this page renders it.
 *
 *  - **The download route is `/api/library/:coreSlug/:key`.** The path is built
 *    from the item's `coreSlug` and the file's `key` exactly as
 *    `server/routes/library.ts` publishes it; the site never links a static
 *    file, because the deliverables live outside `public/`.
 *  - **The server names the file.** `Content-Disposition` is built by
 *    `contentDisposition()`, which keeps Turkish characters intact via RFC 5987.
 *    `api.download` requires a filename argument, but the anchor's `download`
 *    attribute is given an *empty* value: an empty `download` attribute defers
 *    to the server's `Content-Disposition`, which is the only name a customer's
 *    own release notes recognise. The Turkish buyer gets the Turkish file name.
 *  - **No prices, no statuses.** A download is not merchandise; a file is either
 *    served, or its absence is an error worth the reader's time.
 *  - **A 401 is rendered, not redirected.** The route sits behind `RequireAuth`,
 *    so this page should never be reached signed out; if the session dies the
 *    page shows the unauthorised wording rather than guessing at entitlements.
 */

import { useEffect, useState } from 'react'
import type { BundleKind, DocumentFormat, LicenseTier, T } from '../../shared/types.ts'
import { formatNumber } from '../../shared/i18n.ts'
import { api, ApiError } from '../lib/api.ts'
import { useSite } from '../lib/site.tsx'
import { Badge, Button, Container, EmptyState, ErrorState, Loading, Notice, Section } from '../components/ui.tsx'

/** One entitled file, as `GET /api/library` returns it. */
interface LibraryFile {
  key: string
  label: T
  format: DocumentFormat
  sizeKb: number
  version: string
}

/** One entitled grant, as `GET /api/library` returns it. */
interface LibraryItem {
  coreSlug: string
  coreName: string
  bundle: BundleKind
  tier: LicenseTier
  grantedAt: string
  files: LibraryFile[]
}

export function Downloads() {
  const { strings, locale } = useSite()
  const [items, setItems] = useState<LibraryItem[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [unauthorised, setUnauthorised] = useState(false)
  const [message, setMessage] = useState('')
  const [busyKey, setBusyKey] = useState<string | null>(null)
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({})

  const load = (signal?: AbortSignal) => {
    setFailed(false)
    setUnauthorised(false)
    api
      .get<{ items: LibraryItem[] }>('/library', signal)
      .then(({ items }) => setItems(items))
      .catch((error: unknown) => {
        if ((error as Error)?.name === 'AbortError') return
        if (error instanceof ApiError && error.isUnauthorised) setUnauthorised(true)
        else {
          setMessage(error instanceof ApiError ? error.message : strings.errors.serverErrorBody)
          setFailed(true)
        }
      })
  }

  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal)
    return () => controller.abort()
    // The effect runs once; `load` closes over stable bundle strings.
  }, [])

  const download = (item: LibraryItem, file: LibraryFile) => {
    const path = `/library/${encodeURIComponent(item.coreSlug)}/${encodeURIComponent(file.key)}`
    setBusyKey(path)
    setFileErrors((existing) => ({ ...existing, [path]: '' }))

    api
      // Empty anchor `download` value → the server's Content-Disposition names it.
      .download(path, '', locale)
      .then(() => {
        setFileErrors((existing) => {
          const next = { ...existing }
          delete next[path]
          return next
        })
      })
      .catch((error: unknown) => {
        // A 401 on a download is an entitlement question, a 404 a missing
        // artefact, and neither is a form error to retry inline.
        setFileErrors((existing) => ({
          ...existing,
          [path]:
            error instanceof ApiError && error.isUnauthorised
              ? strings.downloads.downloadUnauthorised
              : strings.downloads.downloadMissing,
        }))
      })
      .finally(() => setBusyKey(null))
  }

  const renderList = () => {
    if (unauthorised) return <Notice tone="info">{strings.errors.unauthorisedBody}</Notice>
    if (failed) return <ErrorState message={message} retryLabel={strings.common.retry} onRetry={() => load()} />
    if (!items) return <Loading label={strings.common.loading} />
    if (items.length === 0) return <EmptyState title={strings.downloads.empty} body={strings.downloads.emptyHint} />

    return (
      <div className="space-y-10">
        {items.map((item) => (
          <article key={`${item.coreSlug}-${item.bundle}-${item.tier}`} className="border border-line">
            <div className="border-b border-line px-6 py-4">
              <h2 className="font-mono text-[15px] tracking-[-0.01em] text-ink tabular">{item.coreName}</h2>
              <p className="mt-2 flex flex-wrap items-center gap-2">
                <Badge tone="neutral">{strings.bundleKinds[item.bundle]}</Badge>
                <Badge tone="neutral">{strings.licenseTiers[item.tier]}</Badge>
              </p>
            </div>
            <ul className="divide-y divide-line">
              {item.files.map((file) => (
                <FileRow
                  key={file.key}
                  file={file}
                  busy={busyKey === downloadPath(item, file)}
                  error={fileErrors[downloadPath(item, file)] ?? ''}
                  onDownload={() => download(item, file)}
                />
              ))}
            </ul>
          </article>
        ))}
      </div>
    )
  }

  return (
    <Container width="narrow" className="py-20 md:py-28">
      <header className="animate-rise border-b border-line pb-10">
        <p className="eyebrow">{strings.nav.account}</p>
        <h1 className="mt-4 text-display-lg text-ink">{strings.downloads.title}</h1>
        <div className="mt-6 max-w-[62ch] text-[17px] leading-[1.65] text-mist">
          {strings.downloads.expiresNote}
        </div>
      </header>

      <Section className="pb-0">{renderList()}</Section>
    </Container>
  )
}

/** The published download path for one file. One home, so it cannot drift. */
function downloadPath(item: LibraryItem, file: LibraryFile): string {
  return `/library/${encodeURIComponent(item.coreSlug)}/${encodeURIComponent(file.key)}`
}

function FileRow({
  file,
  busy,
  error,
  onDownload,
}: {
  file: LibraryFile
  busy: boolean
  error: string
  onDownload: () => void
}) {
  const { strings, locale, t } = useSite()

  return (
    <li className="flex flex-wrap items-baseline justify-between gap-4 px-6 py-4">
      <div className="min-w-[16rem] flex-1">
        <p className="text-[14px] leading-relaxed text-ink">{t(file.label)}</p>
        <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-mist">
          {strings.documentFormats[file.format]}
          {file.version ? ` — ${file.version}` : ''}
          {' — '}
          {formatNumber(file.sizeKb, locale, 0)} KB
        </p>
        {error ? <p className="mt-2 text-[12px] text-flare">{error}</p> : null}
      </div>
      <Button variant="secondary" disabled={busy} onClick={onDownload}>
        {busy ? strings.common.loading : strings.downloads.downloadFile}
      </Button>
    </li>
  )
}