/*
 * The API client.
 *
 * One typed wrapper over `fetch`, ported from the reference project with two
 * changes and one deletion:
 *
 *  - **`download` sends `Accept-Language`.** The download route names a file in
 *    the session's locale — a Turkish buyer receives `CT-UART-FIFO-kapı-....pdf`,
 *    an English one the ASCII-fallback form — so the request must state the
 *    preference rather than leave it to whatever the browser's settings say.
 *  - **Errors surface `fields`**, so a form can put each message next to the
 *    input that caused it instead of one generic banner.
 *  - **The reference's `upload` is deleted**, because this server has no
 *    multipart route and no uploads anywhere — enquiries are JSON, orders are
 *    JSON, and the only files on the site flow out, never in.
 *
 * Two rules hold everywhere:
 *
 *  1. The session cookie is sent on every request (`same-origin`), and the
 *     server decides what that session may do. Nothing is authorised client side.
 *  2. A non-2xx response becomes a thrown `ApiError` carrying the server's
 *     `fields` map.
 */

import type { Locale } from '../../shared/i18n.ts'

export interface FieldErrors {
  [field: string]: string
}

export class ApiError extends Error {
  readonly status: number
  readonly fields: FieldErrors

  constructor(status: number, message: string, fields: FieldErrors = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fields = fields
  }

  /** True when the session is gone and the user needs to sign in again. */
  get isUnauthorised(): boolean {
    return this.status === 401
  }
}

interface RequestOptions {
  method?: string
  body?: unknown
  signal?: AbortSignal
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, signal } = options

  let response: Response
  try {
    response = await fetch(`/api${path}`, {
      method,
      // The session lives in an httpOnly cookie, so the browser attaches it.
      // Without this the API would appear to lose the session on every call.
      credentials: 'same-origin',
      headers: body === undefined ? undefined : { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    })
  } catch (error) {
    // A network failure and an API rejection are different problems, and the
    // caller can only act on one of them.
    if ((error as Error).name === 'AbortError') throw error
    throw new ApiError(0, 'Could not reach the server. Check your connection and try again.')
  }

  if (response.status === 204) return undefined as T

  const text = await response.text()

  let payload: unknown = null
  try {
    payload = text ? JSON.parse(text) : null
  } catch {
    payload = null
  }

  if (!response.ok) {
    const error = payload as { error?: string; fields?: FieldErrors } | null
    throw new ApiError(
      response.status,
      error?.error ?? `That request did not succeed (${response.status}).`,
      error?.fields ?? {},
    )
  }

  return payload as T
}

/** The `Accept-Language` value a download should present, per site locale. */
const ACCEPT_LANGUAGE: Record<Locale, string> = {
  tr: 'tr-TR,tr',
  en: 'en-GB,en',
}

export const api = {
  get: <T>(path: string, signal?: AbortSignal) => request<T>(path, { signal }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),

  /** Triggers a browser download without ever putting the file in memory. */
  async download(path: string, filename: string, locale: Locale = 'tr'): Promise<void> {
    const response = await fetch(`/api${path}`, {
      credentials: 'same-origin',
      // The server labels the file by locale; see the header note above.
      headers: { 'Accept-Language': ACCEPT_LANGUAGE[locale] },
    })

    if (!response.ok) {
      const text = await response.text()
      let message = 'That file could not be downloaded.'
      try {
        message = (JSON.parse(text) as { error?: string }).error ?? message
      } catch {
        // Not JSON — keep the default message rather than showing a parse error.
      }
      throw new ApiError(response.status, message)
    }

    const blob = await response.blob()
    const objectUrl = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = objectUrl
    anchor.download = filename
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    // Revoked on the next tick; revoking synchronously cancels the download in
    // some browsers before it has read the blob.
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
  },
}

/** Builds a query string, dropping empty values so URLs stay readable. */
export function queryString(
  params: Record<string, string | number | boolean | string[] | null | undefined>,
): string {
  const search = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value == null || value === '' || value === false) continue
    if (Array.isArray(value)) {
      if (value.length > 0) search.set(key, value.join(','))
    } else {
      search.set(key, String(value))
    }
  }

  const encoded = search.toString()
  return encoded ? `?${encoded}` : ''
}