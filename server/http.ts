/*
 * Shared HTTP helpers: the error type every route throws, the async wrapper that
 * turns a rejected promise into that error, and a few validators.
 *
 * `handler()` exists because Express 5 forwards rejections to the error middleware
 * on its own, but only if the handler is `async` all the way down. One `await`
 * in the wrong place turns a 500 into a hung request. Wrapping every handler means
 * a route cannot forget.
 */

import type { NextFunction, Request, RequestHandler, Response } from 'express'

export class ApiError extends Error {
  readonly status: number
  /** Field-level detail, rendered next to the matching input. */
  readonly fields: Record<string, string> | undefined

  constructor(status: number, message: string, fields?: Record<string, string>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fields = fields
  }
}

/** Wrap a route handler so a throw becomes an `ApiError` rather than a hang. */
export function handler(
  fn: (req: Request, res: Response, next: NextFunction) => unknown | Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    try {
      Promise.resolve(fn(req, res, next)).catch(next)
    } catch (error) {
      next(error)
    }
  }
}

/** A path or body parameter as a non-empty string. */
export function param(req: Request, name: string): string {
  const raw = (req.params as Record<string, string | undefined>)[name]
  if (!raw) throw new ApiError(400, 'A required field is missing.')
  return raw
}

/**
 * A required body field as a trimmed, length-limited string.
 *
 * The length check runs after trimming, so padding cannot buy characters past the
 * limit: the value that gets stored and later rendered is the trimmed one, so that
 * is the one the limit has to describe.
 */
export function str(value: unknown, field: string, max = 2000): string {
  if (typeof value !== 'string') throw new ApiError(400, `${field} is required.`)
  const trimmed = value.trim()
  if (!trimmed) throw new ApiError(400, `${field} is required.`)
  if (trimmed.length > max) throw new ApiError(400, `${field} is too long.`)
  return trimmed
}

/**
 * An optional body field, defaulting to empty rather than rejecting.
 *
 * A wrong type returns `''` instead of throwing, and this is the one deliberate
 * asymmetry in this file. The required fields are values a form must supply, so a
 * type error there is a client bug worth surfacing. An optional field that arrives
 * as the wrong type is indistinguishable, for the caller's purposes, from one that
 * was never sent — and throwing would turn a merely-absent optional field into a
 * 400, so a client that sends `null` for an unset input gets rejected for it.
 */
export function optionalStr(value: unknown, max = 2000): string {
  if (value === undefined || value === null) return ''
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, max)
}

/**
 * Email validation, deliberately minimal.
 *
 * The only authoritative test of an address is sending to it, and a regex that
 * tries to predict that produces false rejections on valid addresses far more
 * often than it catches typos. This rejects the shapes that are certainly wrong.
 *
 * The lowercase normalisation uses the locale-independent `toLowerCase`, and on a
 * site whose primary language is Turkish that is a decision rather than a default.
 * `toLocaleLowerCase('tr')` maps `I` to dotless `ı` and `İ` to `i`, which is
 * correct for Turkish text and wrong for an address: `-info@` and `-ınfo@` are
 * different mailboxes, and a user who types a dotted capital I into a Turkish UI
 * means the ASCII `i`. The email local part is normalised as ASCII.
 */
export function email(value: unknown): string {
  const raw = str(value, 'Email', 254).toLowerCase()
  if (!/^[^@\s]+@[^@\s.]+(\.[^@\s.]+)+$/.test(raw)) {
    throw new ApiError(400, 'Enter a valid email address.', { email: 'Enter a valid email address.' })
  }
  return raw
}

/** A body field constrained to a closed set. Anything else is a 400, not a cast. */
export function oneOf<V extends string>(value: unknown, allowed: readonly V[], field: string): V {
  if (typeof value !== 'string' || !allowed.includes(value as V)) {
    throw new ApiError(400, `${field} is not a valid value.`)
  }
  return value as V
}

/**
 * A *lookup* against a closed set of identifiers, returning `null` rather than a 400.
 *
 * This is the deliberate counterpart to `oneOf()`, and the difference matters.
 *
 * `oneOf` guards a value the caller must get right — a form field — where an
 * invalid one is a client bug worth a clear error. This guards a value that
 * *identifies a thing that may not exist*: a slug in a URL, or an optional query
 * parameter. There, "no such bundle" is a true and expected answer, and a 400 would
 * be a lie about why.
 *
 * It exists as a named function because the alternative — `x as BundleKind` at each
 * call site — is exactly the unchecked cast that turns a typo'd query parameter into
 * a wrong answer. Narrowing through the actual list of valid ids is checkable, and
 * `BUNDLE_KINDS` gains a member and this picks it up with no edit here.
 *
 * The one `as V` is the same one `oneOf` makes, and it is safe for the same reason:
 * `includes` has just proved the value is a member of `allowed`.
 */
export function lookup<V extends string>(value: unknown, allowed: readonly V[]): V | null {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as V) : null
}

/**
 * The terminal error handler. Registered last in `app.ts`.
 *
 * `ApiError` carries a status chosen at the throw site and is therefore safe to
 * pass through. Everything else is logged and flattened to a generic 500: an
 * unexpected error's message can carry a SQL fragment, a filesystem path or a
 * stack, and none of those belong in a response body.
 */
export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (error instanceof ApiError) {
    res
      .status(error.status)
      .json({ error: error.message, ...(error.fields ? { fields: error.fields } : {}) })
    return
  }
  console.error('[error]', error)
  res.status(500).json({ error: 'Something went wrong on our side.' })
}

/** 404 for unmatched `/api` routes, so they never fall through to the SPA. */
export function notFound(_req: Request, res: Response): void {
  res.status(404).json({ error: 'No such endpoint.' })
}