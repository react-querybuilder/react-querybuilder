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
export const configureCustomSQLite = async (): Promise<boolean> => {
  if (process.platform !== 'darwin') return true;
  for await (const path of dylibCandidates()) {
    if (await Bun.file(path).exists()) {
      try {
        return Database.setCustomSQLite(path);
      } catch {
        return false;
      }
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

/**
 * In-memory `bun:sqlite` DB w/ the given extensions loaded, or `null` if unavailable (Apple
 * SQLite, no prebuilt binary for this platform, etc.). `Bun.SQL` has no `loadExtension`.
 */
export const openSQLiteWithExt = async (exts: SQLiteExt[]): Promise<Database | null> => {
  const db = new Database(':memory:');
  try {
    for (const ext of exts) await loaders[ext](db);
    return db;
  } catch {
    db.close();
    return null;
  }
};
