/*
 * Passwords and the request user.
 *
 * The session cookie itself lives in `./session.ts` — it is hand-rolled there
 * because `cookie-session` does not round-trip under Express 5. This module owns
 * what the session *means*: the bcrypt work factor, resolving a session into a
 * user, and the guards routes use.
 *
 * ## There are no roles here
 *
 * The reference project has `customer` / `admin` and a `requireRole` guard. This
 * one has none, deliberately. Every account here is a buyer: there is no staff
 * console, no back-office and nothing to administer, so a role column would be a
 * second way to say "signed in" with the authority to be wrong about it.
 *
 * Promotion — confirming a payment, granting an entitlement — happens in
 * `orders.ts` behind the fact that you hold the order, not behind a flag on the
 * account. The distinction matters: it makes the privileged action a property of a
 * *record* rather than of a *person*, so there is no stored credential that could
 * be misused later.
 */

import bcrypt from 'bcryptjs'
import type { NextFunction, Request, Response } from 'express'
import { getDb } from './db.ts'
import type { UserRow } from './db-types.ts'

export type { UserRow }

/** Shape used for responses. Never includes the password hash. */
export interface AuthedUser {
  id: string
  email: string
  company: string
  createdAt: string
}

// Re-exported so `app.ts` and the routes import both concerns from one place, and so
// no route has to know the session implementation changed.
export { sessionMiddleware, startSession, endSession as clearSession } from './session.ts'

/**
 * bcrypt work factor.
 *
 * 12 is the current sensible default on server hardware — roughly 250 ms on the
 * 2 vCPU box this runs on. It is deliberately not tunable from the environment: a
 * work factor that can be lowered by an env var is a work factor that will be.
 */
const BCRYPT_ROUNDS = 12

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS)
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}

// ---------------------------------------------------------------------------
// The request user
// ---------------------------------------------------------------------------

export function toAuthedUser(row: UserRow): AuthedUser {
  return {
    id: row.id,
    email: row.email,
    company: row.company,
    createdAt: row.created_at,
  }
}

export function findUserById(id: string): UserRow | undefined {
  return getDb().prepare<[string], UserRow>(`SELECT * FROM users WHERE id = ?`).get(id)
}

export function findUserByEmail(email: string): UserRow | undefined {
  // Lowercased on both write and read, so the lookup cannot miss on a
  // differently-cased duplicate. The write side normalises in `email()`.
  return getDb().prepare<[string], UserRow>(`SELECT * FROM users WHERE email = ?`).get(email.toLowerCase())
}

/**
 * Resolves `req.session.userId` into `req.user`.
 *
 * Always runs — an unauthenticated request simply has no `req.user`. That is how
 * `optionalAuth` distinguishes "nobody" from "someone", which the catalogue and the
 * order routes both need in order to show a signed-in price without requiring one.
 */
export function attachUser(req: Request, _res: Response, next: NextFunction): void {
  const userId = req.session?.userId
  if (userId) {
    const row = findUserById(userId)
    if (row) req.user = toAuthedUser(row)
  }
  next()
}

/** 401 unless there is a session. */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Sign in to continue.' })
    return
  }
  next()
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthedUser
    }
  }
}
