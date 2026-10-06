/*
 * Contact enquiries.
 *
 * ## Why there is a form at all when the address is on the page
 *
 * The site publishes an email address, and a contact form would look redundant. It is
 * not: an email arriving in a shared inbox is an untracked, unacknowledged document in
 * a third party's storage, whereas one arriving here is a row we own, can answer, and
 * can find again six months later. The address is for correspondence about a licence
 * someone already holds; the form is for first contact.
 *
 * ## Nothing is emailed
 *
 * There is no SMTP client, no API key and no outbound call here. The enquiry is
 * written and the request returns. That is the entire implementation, and it is
 * deliberate: wiring a mail transport would put a sending credential on a site that
 * has no other reason to have one, and the reference project's equivalent warning
 * applies — a mailer is the single component that turns a spam relay into a reputation
 * problem for the domain. Reading enquiries is a `sqlite3` query.
 *
 * ## Anti-spam is a honeypot plus a throttle, not a CAPTCHA
 *
 * A CAPTCHA on a B2B contact form costs a real buyer a real company domain to prove
 * they are not a bot, which is exactly the traffic a supplier's contact form needs and
 * exactly what a CAPTCHA is designed to lose. So: a field no person can see (`website`)
 * and a per-IP token bucket.
 *
 * Neither is a security boundary and neither is load-bearing — both are cheap to
 * bypass, and an attacker who wants through will get through. They raise the cost of
 * the naive case, which is the entire job. Rate limiting is real protection only
 * because it also bounds the table's growth; everything else here is politeness.
 */

import crypto from 'node:crypto'
import { Router } from 'express'
import type { Request } from 'express'
import type { RequestHandler } from 'express'
import { getDb, now } from '../db.ts'
import type { EnquiryRow } from '../db-types.ts'
import { ApiError, email as emailField, handler, optionalStr, str } from '../http.ts'

export const enquiriesRouter: Router = Router()

/**
 * Per-IP submission window.
 *
 * Three enquiries an hour per address. Low enough that a spam run costs the
 * attacker their throughput, high enough that a genuine engineer comparing two
 * suppliers over one afternoon is never blocked. One submission is the honest case;
 * the rest is for the impatient.
 */
const WINDOW_MS = 60 * 60 * 1000
const MAX_PER_WINDOW = 3

/**
 * In-memory timestamps of recent submissions, keyed by IP.
 *
 * Deliberately not in the database. This is a rate limiter, not an audit log: losing
 * it on restart costs an attacker three submissions, and a table that grows with
 * every rejected attempt is exactly the thing that turns an attack into a disk-fill
 * problem. It is also bounded — entries expire on both read and write, so the map
 * cannot grow without limit.
 */
const recent = new Map<string, number[]>()

function rateLimited(ip: string): boolean {
  const cutoff = Date.now() - WINDOW_MS

  const kept = (recent.get(ip) ?? []).filter((at) => at > cutoff)
  if (kept.length >= MAX_PER_WINDOW) {
    // Write the pruned list back so an over-limit caller does not accumulate entries
    // it is about to discard anyway.
    recent.set(ip, kept)
    return true
  }

  kept.push(Date.now())
  recent.set(ip, kept)
  return false
}

/**
 * The client address.
 *
 * `req.ip` only — `X-Forwarded-For` is deliberately not consulted, because it is a
 * client-supplied header unless a trusted proxy is known to overwrite it. Behind
 * Traefik it *is* overwritten, and `trust proxy` in `app.ts` makes Express report the
 * real address, so this works in production; reading the header directly would make
 * the limiter trivially bypassable by sending a random value in it.
 */
function clientIp(req: Request): string {
  return req.ip ?? 'unknown'
}

/**
 * The POST itself, exported directly rather than only through the router.
 *
 * **`app.post('/api/enquiries', enquiriesRouter)` does not work under Express 5**: a
 * method callback receives the request with its path *unstripped*, so the router's own
 * `/` route never matches and the submission falls through to the JSON 404. Mounting
 * the whole router with `app.use` would match — and would mount the GET inbox too,
 * which must not go up. So the POST is one standalone handler and `app.ts` gives
 * exactly it to exactly the method it serves; the router below stays unmounted.
 */
export const postEnquiry: RequestHandler = handler((req, res) => {
  /*
   * The honeypot, checked before anything is validated or written.
   *
   * A bot that fills every field gets a `website` value, and answering 201 with a
   * plausible reference is deliberate: telling a spammer it was caught tells it to
   * try the next field name. The submission is dropped silently and nothing is
   * stored.
   */
  if (optionalStr(req.body.website, 200) !== '') {
    res.status(201).json({ ok: true, reference: 'EN-0000000000' })
    return
  }

  if (rateLimited(clientIp(req))) {
    throw new ApiError(429, 'Too many messages sent. Please email us instead.')
  }

  const name = str(req.body.name, 'Name', 120)
  const email = emailField(req.body.email)
  const company = optionalStr(req.body.company, 200)
  const message = str(req.body.message, 'Message', 4000)

  const id = crypto.randomUUID()
  const reference = `EN-${id.slice(0, 8).toUpperCase()}`

  getDb()
    .prepare(
      `INSERT INTO enquiries (id, name, email, company, message, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(id, name, email, company, message, now())

  res.status(201).json({ ok: true, reference })
})

/*
 * `GET /api/enquiries` — read the inbox.
 *
 * ⚠️ **Not mounted.** Enquiries are customer names, companies and requirements, and
 * this route is here so that mounting it is a one-line change *someone makes on
 * purpose* rather than something they discover on a public site. There is no admin
 * console in this project by design, so there is no caller for it today and it must
 * stay unmounted until one exists — see `app.ts`, where the POST is mounted by
 * handler and the router holding this GET is never registered.
 *
 * Read from the command line instead:
 *   sqlite3 data/app.db "SELECT created_at, company, email, substr(message,1,80) FROM enquiries ORDER BY created_at DESC"
 */
enquiriesRouter.get(
  '/',
  handler((_req, res) => {
    const rows = getDb()
      .prepare<[], EnquiryRow>(`SELECT * FROM enquiries ORDER BY created_at DESC LIMIT 200`)
      .all()
    res.json({ enquiries: rows })
  }),
)