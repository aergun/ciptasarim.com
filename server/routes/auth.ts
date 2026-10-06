/*
 * Accounts.
 *
 * ## B2B, so a company not a person
 *
 * There is one `company` field and no first/last name split, because the thing being
 * licensed belongs to a legal entity and the person filling in the form is a contact
 * at it. That is the real shape of the transaction and pretending otherwise adds two
 * fields that are used to build an invoice nobody sends.
 *
 * ## Registration is open; the catalogue is not gated
 *
 * Anyone can create an account, and every core, figure, process row, licence and
 * article is readable without one. An IP buyer evaluating a vendor is not going to
 * fill in a form to read a datasheet, and a site that makes them will simply not be
 * read. An account is needed for exactly one thing — holding orders and entitlements
 * — so it is asked for there and not before.
 *
 * ## Sign-in does not distinguish "no such user" from "wrong password"
 *
 * It returns the same 401 and the same message either way, and always runs the
 * bcrypt comparison. A different message for an unknown email turns the form into an
 * account-existence oracle, and skipping the hash for an unknown email turns response
 * time into the same oracle.
 */

import crypto from 'node:crypto'
import { Router } from 'express'
import type { UserRow } from '../db-types.ts'
import { getDb, now } from '../db.ts'
import { ApiError, email as emailField, handler, optionalStr, str } from '../http.ts'
import {
  attachUser,
  clearSession,
  findUserByEmail,
  findUserById,
  hashPassword,
  startSession,
  toAuthedUser,
  verifyPassword,
} from '../auth.ts'

export const authRouter: Router = Router()

/**
 * A real bcrypt digest of a random string nobody has, at the same cost factor as
 * stored hashes.
 *
 * Present so that a failed sign-in costs the same whether or not the account exists.
 * See the note at its use site. Regenerate with:
 *   node -e "console.log(require('bcryptjs').hashSync('x'+require('crypto').randomBytes(32).toString('hex'),12))"
 */
const TIMING_EQUALISER_HASH = '$2b$12$0vkm8aKuGdUNRv34qAz/J.iQOmNtgKo8SzEQQfftMbG1QndiDL/Km'

/** Sign in. */
authRouter.post(
  '/login',
  handler(async (req, res) => {
    const email = emailField(req.body.email)
    const password = str(req.body.password, 'Password', 200)

    const row = findUserByEmail(email)

    /*
     * The comparison runs even when there is no user, against a real bcrypt hash.
     *
     * Returning early on an unknown email would make the response time a reliable
     * signal — "no such user" answers in microseconds, "wrong password" in ~250 ms of
     * bcrypt — and that difference is trivially measurable over the network.
     *
     * `bcryptjs` short-circuits to `false` when `hash.length !== 60`, so the
     * placeholder below is a real 60-character digest of an unguessable random
     * string. A hand-written dummy of the right shape would reintroduce exactly the
     * timing difference this line exists to remove — and only on the one request
     * that must not have it. The password behind it is not known to anyone.
     */
    const hash = row?.password_hash ?? TIMING_EQUALISER_HASH
    const ok = await verifyPassword(password, hash)

    if (!row || !ok) {
      throw new ApiError(401, 'That email and password do not match an account.')
    }

    startSession(req, row.id)
    res.json({ user: toAuthedUser(row) })
  }),
)

/** Create an account and sign in. */
authRouter.post(
  '/register',
  handler(async (req, res) => {
    const email = emailField(req.body.email)
    const password = str(req.body.password, 'Password', 200)
    const company = optionalStr(req.body.company, 200)

    /*
     * Length floor, checked here rather than in a zod schema so the message is a
     * sentence a person can act on.
     *
     * The upper bound is in `str()` above. A long passphrase is not a security
     * problem and rejecting it would push people toward worse passwords, so the floor
     * is deliberately low and there is no complexity rule at all.
     */
    if (password.length < 10) {
      throw new ApiError(400, 'Choose a longer password.', {
        password: 'Use at least 10 characters.',
      })
    }

    if (findUserByEmail(email)) {
      throw new ApiError(409, 'That email already has an account.', { email: 'That email is already registered.' })
    }

    const id = crypto.randomUUID()
    getDb()
      .prepare(`INSERT INTO users (id, email, password_hash, company, created_at) VALUES (?, ?, ?, ?, ?)`)
      .run(id, email, await hashPassword(password), company, now())

    startSession(req, id)
    const row = findUserById(id)!
    res.status(201).json({ user: toAuthedUser(row) })
  }),
)

/** Sign out. */
authRouter.post(
  '/logout',
  handler((req, res) => {
    clearSession(req, res)
    res.json({ ok: true })
  }),
)

/**
 * The current session.
 *
 * Always 200 with `user: null` rather than 401 when nobody is signed in. "Not signed
 * in" is a normal state a client renders, not an error it handles, and a 401 here
 * would make every page do a try/catch to find out whether to show a sign-in button.
 */
authRouter.get(
  '/me',
  attachUser,
  handler((req, res) => {
    res.json({ user: req.user ?? null })
  }),
)

/** A row in `users`, typed. Re-exported so routes need one import for both concerns. */
export type { UserRow }
