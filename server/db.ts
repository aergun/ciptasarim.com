/*
 * Database connection.
 *
 * One better-sqlite3 handle for the process. It is synchronous, which suits this
 * workload exactly: the catalogue lives in TypeScript modules and the only queries
 * are small indexed lookups against transactional data. There is no connection pool
 * because there is no pool.
 */

import Database from 'better-sqlite3'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { MIGRATIONS, SCHEMA_VERSION } from './schema.ts'

const here = dirname(fileURLToPath(import.meta.url))

/** Repository root — everything below this is addressed relative to it. */
export const ROOT = resolve(here, '..')

/** The database file. Gitignored; recreated on demand. */
export const DB_PATH = process.env.DATABASE_PATH ?? resolve(ROOT, 'data/app.db')

/**
 * Licensed deliverables, served only to authenticated, entitled buyers.
 *
 * **Deliberately outside `public/`**, so Vite never copies them into `dist/` and
 * they cannot be reached by guessing a URL. The download route resolves inside this
 * directory and streams the file only after an entitlement check.
 *
 * That matters more here than for a site selling anything else. An IP
 * deliverable is the product: the GDSII *is* the hard macro, and an RTL bundle is
 * the design. A guessable path to a paid core file is not a broken link, it is the
 * core given away.
 */
export const FILES_DIR = process.env.FILES_DIR ?? resolve(ROOT, 'server/files')

let db: Database.Database | null = null

export function getDb(): Database.Database {
  if (db) return db

  mkdirSync(dirname(DB_PATH), { recursive: true })
  const handle = new Database(DB_PATH)

  // WAL lets a reader run while a write is in flight, which matters as soon as two
  // people use one account at once.
  handle.pragma('journal_mode = WAL')
  handle.pragma('foreign_keys = ON')
  /*
   * NORMAL is the correct durability level under WAL. Durability is only at risk if
   * the machine loses power mid-write, and what is being written is a cart and an
   * order record — the licensed files themselves live on a volume outside this
   * database entirely.
   */
  handle.pragma('synchronous = NORMAL')
  handle.pragma('busy_timeout = 5000')

  applySchema(handle)

  db = handle
  return handle
}

function applySchema(handle: Database.Database): void {
  /*
   * Probe `sqlite_master` rather than `SELECT value FROM meta`.
   *
   * On a database that has never been migrated there is no `meta` table, and
   * `prepare` throws `no such table: meta` at that point — which is the normal
   * first-run path, so it has to be asked about rather than assumed. Existence is
   * checked first and the version read only if the table is there.
   */
  const hasMeta = handle
    .prepare<[], { name: string }>(`SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'meta'`)
    .get()

  const row = hasMeta
    ? handle.prepare<[], { value: string }>(`SELECT value FROM meta WHERE key = 'schema_version'`).get()
    : undefined

  const current = row ? Number(row.value) : 0

  /*
   * Stamp only what actually ran.
   *
   * Writing `SCHEMA_VERSION` unconditionally is the obvious move and it is wrong:
   * the version is a separate edit from the migration it names, so a dev server that
   * reloads between the two edits finds nothing to run, stamps the new version
   * anyway, and skips the migration permanently once it lands. The database then
   * reports a version whose columns do not exist and every query against them fails
   * at runtime rather than at boot.
   *
   * The highest version that actually ran is recorded instead, and a
   * `SCHEMA_VERSION` with no matching migration is a build mistake worth failing
   * loudly on rather than absorbing.
   */
  let applied = current

  // Guard *before* the loop: a declared version with no migration means every query
  // below would silently skip it and stamp a version that was never applied. Better
  // to refuse to open the database at all.
  const highest = MIGRATIONS.reduce((max, m) => Math.max(max, m.version), 0)
  if (SCHEMA_VERSION > highest) {
    throw new Error(
      `Schema version ${SCHEMA_VERSION} is declared but no migration with that version exists ` +
        `(highest is ${highest}). The version and its migration must be added together, or ` +
        `databases will record a version whose schema was never applied.`,
    )
  }

  for (const migration of MIGRATIONS) {
    if (migration.version <= current) continue
    handle.exec(migration.sql)
    applied = Math.max(applied, migration.version)
  }

  handle
    .prepare(
      `INSERT INTO meta (key, value) VALUES ('schema_version', ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    )
    .run(String(applied))
}

/** Closes the handle. Used by the seed script and the smoke suite. */
export function closeDb(): void {
  if (db) {
    db.close()
    db = null
  }
}

/** ISO-8601 with milliseconds, the format every timestamp column stores. */
export function now(): string {
  return new Date().toISOString()
}