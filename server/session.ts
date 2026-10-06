/*
 * Signed-cookie sessions.
 *
 * ## Why this is hand-rolled rather than `cookie-session`
 *
 * That package does not round-trip under Express 5. It writes the cookie correctly
 * and then reads it back as an empty session, so every signed-in request is
 * anonymous — **silently**. No error, no warning, just a site where registration
 * appears to work and login never takes. A silent authentication failure is the
 * worst shape this bug can take, because nothing points at the cause.
 *
 * So the signing is done here directly with Node's crypto. It is a small amount of
 * code and it keeps the properties the rest of the server assumes:
 *
 *   - No session table. Nothing to garbage-collect, and a restart does not sign
 *     anyone out.
 *   - Tamper-evident, **not encrypted** — the payload is a user id and nothing
 *     sensitive. Claiming otherwise would be a security property this site does
 *     not have and does not claim anywhere else.
 *   - A forged or truncated cookie is rejected silently, which is what "you are not
 *     signed in" means.
 *
 * ## The payload is deliberately tiny
 *
 * At 4 kB it is the browser's per-cookie ceiling. A `Set-Cookie` header beyond that
 * is silently truncated by the browser, which produces a corrupt cookie and a
 * signed-out user with no error in any log. `MAX_COOKIE_BYTES` refuses to write one
 * rather than relying on the browser to notice.
 */

import crypto from 'node:crypto'
import type { NextFunction, Request, Response } from 'express'

const COOKIE_NAME = 'ciptasarim.sid'
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 14 // 14 days

/**
 * Browsers cap a cookie at roughly 4 kB including name and attributes. Kept below
 * that rather than at it, because the ceiling differs between browsers and a
 * cookie written at exactly the limit passes in one and truncates in another.
 */
const MAX_COOKIE_BYTES = 3800

/** The session as callers use it: a plain object they read and assign. */
export interface SessionData {
  userId?: string
}

declare global {
  namespace Express {
    interface Request {
      session?: SessionData
    }
  }
}

/**
 * Signing key.
 *
 * Required in production — a missing value means every signed-in request is
 * anonymous, which is the silent failure this file exists to avoid, so it throws at
 * boot instead. The development fallback is generated once per process so a fresh
 * clone runs, and it changes every restart, which signs everyone out and is a loud
 * signal that the real key was never set.
 */
const SECRET = process.env.SESSION_SECRET ?? (() => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'SESSION_SECRET must be set in production. Generate one with: ' +
        'node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'base64url\'))"',
    )
  }
  return crypto.randomBytes(48).toString('base64url')
})()

/** base64url of the JSON payload, then a base64url HMAC of that string. */
function sign(payload: string): string {
  return crypto.createHmac('sha256', SECRET).update(payload).digest('base64url')
}

function encode(session: SessionData): string {
  const payload = Buffer.from(JSON.stringify(session)).toString('base64url')
  return `${payload}.${sign(payload)}`
}

/**
 * Verify and decode.
 *
 * Returns `null` for anything that is not a well-formed, correctly-signed cookie.
 * A missing cookie, a truncated one, a tampered one and one signed with a different
 * key are all the same answer — not signed in — because from here they are
 * indistinguishable and none of them should produce a different code path.
 */
function decode(value: string | undefined): SessionData | null {
  if (!value) return null

  const separator = value.lastIndexOf('.')
  if (separator <= 0) return null

  const payload = value.slice(0, separator)
  const signature = value.slice(separator + 1)

  /*
   * Compared as buffers of equal length.
   *
   * `timingSafeEqual` throws on a length mismatch, so the length check has to come
   * first — and it leaks the length, which is not a secret here: the payload is in
   * cleartext in the cookie the client is holding.
   */
  const expected = Buffer.from(sign(payload))
  const received = Buffer.from(signature)
  if (expected.length !== received.length) return null
  if (!crypto.timingSafeEqual(expected, received)) return null

  try {
    const parsed: unknown = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) return null
    return parsed as SessionData
  } catch {
    return null
  }
}

/** A `Set-Cookie` value that deletes the cookie. Used on sign-out. */
function expireCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
}

/**
 * Middleware.
 *
 * `req.session` is an accessor pair rather than a plain property, so that *assigning*
 * is the thing that writes the cookie. Callers keep using `req.session = { userId }`
 * and never learn any of this.
 */
export function sessionMiddleware(req: Request, res: Response, next: NextFunction): void {
  let session: SessionData = decode(req.cookies?.[COOKIE_NAME]) ?? {}

  /*
   * Written eagerly in the setter rather than on `res.on('finish')`.
   *
   * `finish` fires after the headers are flushed, so setting a header there throws
   * ERR_HTTP_HEADERS_SENT. Every caller assigns the session inside the handler and
   * responds afterwards, so the setter always runs first.
   */
  const write = (res_: Response, value: string): void => {
    if (res_.headersSent) {
      console.error('Session was assigned after the response was sent; the cookie was not written.')
      return
    }
    res_.setHeader('Set-Cookie', value)
  }

  const cookie = (s: SessionData): string => {
    const encoded = encode(s)
    if (encoded.length > MAX_COOKIE_BYTES) {
      // Nothing safe to do but refuse to write a cookie that would arrive
      // truncated. The user stays signed out and the server stays correct, which
      // beats the reverse.
      console.error(
        `Session cookie would be ${encoded.length} bytes, over the ${MAX_COOKIE_BYTES}-byte limit. ` +
          'The session payload needs to shrink.',
      )
      return expireCookie()
    }
    return `${COOKIE_NAME}=${encoded}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(MAX_AGE_MS / 1000)}${
      // Only when actually served over HTTPS. A `Secure` cookie sent over plain HTTP
      // is dropped by the browser, which on a fresh http://localhost install looks
      // exactly like a broken login.
      process.env.NODE_ENV === 'production' ? '; Secure' : ''
    }`
  }

  Object.defineProperty(req, 'session', {
    configurable: true,
    get: () => session,
    set: (value: SessionData) => {
      session = value ?? {}
      write(res, cookie(session))
    },
  })

  next()
}

/** Starts a session for a user. Called by register and login. */
export function startSession(req: Request, userId: string): void {
  req.session = { userId }
}

/** Ends the session. Called by sign-out. */
export function endSession(req: Request, res: Response): void {
  // Assign first, then overwrite: the setter writes a valid empty-session cookie,
  // and expiring it afterwards is what actually signs the user out.
  req.session = {}
  if (!res.headersSent) res.setHeader('Set-Cookie', expireCookie())
}

/** The signed-in user's id, or `undefined`. */
export function sessionUserId(req: Request): string | undefined {
  return req.session?.userId
}