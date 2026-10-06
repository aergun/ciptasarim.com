/*
 * Boot.
 *
 * ## What happens before the port opens
 *
 *  1. `import './app.ts'` pulls in `session.ts`, which throws if `SESSION_SECRET` is
 *     missing in production. That is deliberate and it is the *first* thing that
 *     happens: a missing secret is a boot failure, so the container exits non-zero and
 *     the deploy is marked failed, rather than binding a port that answers every
 *     signed-in request as anonymous.
 *  2. `applySchema()` runs on the first `getDb()`, creating `data/` and migrating.
 *  3. Only then does `listen()` fire.
 *
 * The order matters: binding first and migrating after would accept an order during
 * the window before `orders` exists.
 *
 * ## `--prod` sets `NODE_ENV` from the command line
 *
 * `npm start` is `tsx server/index.ts --prod`. Rather than requiring a separate
 * `NODE_ENV=production` in the environment — which the reference project's Dockerfile
 * does set, and which is easy to lose in a container edit — the flag is read here.
 * Either works; having both means a deploy that sets one and forgets the other still
 * boots in production mode.
 *
 * ## Shutdown drains in-flight requests
 *
 * `closeDb()` is called on SIGTERM *after* the server stops accepting. The licensed
 * files are read from a separate volume so they are unaffected either way, but
 * closing SQLite with a transaction in flight logs `SQLITE_BUSY` and loses it. The
 * reference project's server had no shutdown handler at all; under Coolify's
 * container restarts this is the difference between a clean redeploy and a
 * `cart_items` row written half-way.
 */

import { closeDb, getDb, DB_PATH, FILES_DIR } from './db.ts'

/*
 * Resolve `--prod` before anything reads `NODE_ENV`.
 *
 * `./app.ts` is imported **dynamically**, below, and that is load-bearing rather than
 * incidental. `app.ts` pulls in `session.ts`, which reads `NODE_ENV` once at module
 * scope to decide whether a missing `SESSION_SECRET` is fatal — and ES module imports
 * are hoisted and evaluated *before* the importing module's body runs. A static
 * `import { createApp } from './app.ts'` at the top of this file would therefore be
 * evaluated before the line below, and the fatal-secret check would evaluate
 * `NODE_ENV` as unset, take the development branch, and generate a throwaway signing
 * key on a production boot.
 *
 * That is the exact silent-authentication failure `session.ts` exists to prevent, and
 * it would look like a working site that forgets everyone on every restart. `db.ts` is
 * imported statically because it has no such module-scope environment check — it reads
 * `DATABASE_PATH` and `FILES_DIR` at call time inside `getDb()`.
 */
if (process.argv.includes('--prod')) {
  process.env.NODE_ENV = 'production'
}

const PORT = Number(process.env.PORT ?? (process.env.NODE_ENV === 'production' ? 8000 : 4000))
const HOST = process.env.HOST ?? '0.0.0.0'

/*
 * Open the database and migrate *before* listening.
 *
 * `getDb()` is what runs `applySchema()`. Calling it here means a bad `DATABASE_PATH`
 * or a failed migration is a boot failure with a stack in the deploy log, rather than
 * a server that binds, accepts traffic, and 500s on the first request to touch a table.
 */
getDb()

// Deferred on purpose — see the note at the top of the file.
const { createApp } = await import('./app.ts')

const app = createApp()

const server = app.listen(PORT, HOST, () => {
  console.log(`ciptasarim.com listening on http://${HOST}:${PORT} (${process.env.NODE_ENV ?? 'development'})`)
  console.log(`  database: ${DB_PATH}`)
  console.log(`  files:    ${FILES_DIR}`)
})

/** Drains connections, then closes SQLite. Safe to call twice. */
let shuttingDown = false

function shutdown(signal: string): void {
  if (shuttingDown) return
  shuttingDown = true

  console.log(`[${signal}] shutting down`)

  server.close((error) => {
    if (error) console.error('[shutdown] while draining:', error)

    try {
      closeDb()
    } catch (closeError) {
      console.error('[shutdown] closing database:', closeError)
    }

    process.exit(error ? 1 : 0)
  })

  /*
   * A hard ceiling on the drain.
   *
   * `server.close()` waits for every keep-alive connection to go away on its own, and
   * a browser that opened one during a container redeploy can hold it for as long as
   * its own timeout. Coolify sends SIGKILL shortly after SIGTERM, so without this the
   * process is killed mid-drain and the graceful path never completes — the handler
   * would exist and never run.
   */
  setTimeout(() => {
    console.error('[shutdown] drain timed out, exiting')
    process.exit(1)
  }, 10_000).unref()
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

/*
 * An unhandled rejection or an uncaught exception ends the process.
 *
 * Continuing would mean running in a state nobody chose — usually a transaction left
 * open or a request handler that will never respond. In a container the supervisor
 * restarts it, which is the correct outcome: a brief restart beats serving requests
 * from a process whose invariants are unknown. The full stack is logged first,
 * because the supervisor's reason for the exit is only the word "crashed".
 */
process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason)
  process.exit(1)
})

process.on('uncaughtException', (error) => {
  console.error('[uncaughtException]', error)
  process.exit(1)
})
