import { Database } from 'bun:sqlite';

// SQLite loadable extensions (regex, vector) for `dbquery.*sqlite*` tests. Apple's system SQLite
// (used by Bun on macOS) can't load extensions, so the `bun test` preload swaps in a vanilla build
// via `configureCustomSQLite` before any DB opens. Process-wide: every SQLite test (incl.
// `Bun.SQL` sqlite adapter) runs against the same binary. Elsewhere SQLite is statically linked
// w/ extension support; nothing to do.

// Lazy so `brew` (slow) only spawns if the common paths miss
async function* dylibCandidates(): AsyncGenerator<string> {
  if (process.env.RQB_SQLITE_DYLIB) yield process.env.RQB_SQLITE_DYLIB;
  yield '/opt/homebrew/opt/sqlite/lib/libsqlite3.dylib';
  yield '/usr/local/opt/sqlite/lib/libsqlite3.dylib';
  if (Bun.which('brew')) {
    const prefix = await Bun.$`brew --prefix sqlite`.quiet().nothrow().text();
    yield `${prefix.trim()}/lib/libsqlite3.dylib`;
  }
}

/**
 * macOS only: point `bun:sqlite` at `RQB_SQLITE_DYLIB` or Homebrew's `libsqlite3.dylib`. Must run
 * before any `Database` is created. Returns whether extensions can be loaded.
 */
let extSupported = process.platform !== 'darwin';

export const configureCustomSQLite = async (): Promise<boolean> => {
  if (process.platform !== 'darwin') return true;
  for await (const path of dylibCandidates()) {
    if (await Bun.file(path).exists()) {
      // Rejection of an existing candidate = broken config; throw so tests fail, not skip
      extSupported = Database.setCustomSQLite(path);
      if (!extSupported) throw new Error(`Database.setCustomSQLite rejected ${path}`);
      return extSupported;
    }
  }
  return false;
};

export type SQLiteExt = 'regex' | 'vec';

// `sqlite-regex` ships no types; non-literal specifier skips resolution
const sqliteRegex = 'sqlite-regex';

const loaders: Record<SQLiteExt, (db: Database) => Promise<void>> = {
  regex: async db => {
    const { getLoadablePath } = (await import(sqliteRegex)) as { getLoadablePath(): string };
    db.loadExtension(getLoadablePath());
  },
  vec: async db => (await import('sqlite-vec')).load(db),
};

// Known "unavailable" errors: package/prebuilt binary missing for this platform
const isUnavailableError = (e: unknown) =>
  /cannot find (module|package)|not found|unsupported platform/i.test(`${(e as Error)?.message}`);

/**
 * In-memory `bun:sqlite` DB w/ the given extensions loaded, or `null` if known unavailable
 * (Apple SQLite, no prebuilt binary for this platform). Other load errors propagate so tests
 * fail instead of silently skipping. `Bun.SQL` has no `loadExtension`.
 */
export const openSQLiteWithExt = async (exts: SQLiteExt[]): Promise<Database | null> => {
  if (!extSupported) return null;
  const db = new Database(':memory:');
  try {
    for (const ext of exts) await loaders[ext](db);
    return db;
  } catch (e) {
    db.close();
    if (isUnavailableError(e)) return null;
    throw e;
  }
};
