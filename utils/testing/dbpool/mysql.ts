import type { SQL } from 'bun';
import { memo, teardown } from './memo';

// Shared MySQL + MariaDB pools (CI-only; need live servers). Same wire protocol -> one factory,
// one `Bun.SQL` (mysql adapter) pool per server. One database (= schema) per suite, created w/
// `utf8mb4_bin` so string comparisons/LIKE are case-sensitive like the other platforms' fixtures.
// Env:
//   RQB_MYSQL_URL=mysql://root:<password>@localhost:3306
//   RQB_MARIADB_URL=mysql://root:<password>@localhost:3307

declare global {
  // Set once boot starts; lets the preload skip teardown when never used.
  var __rqbMySQLActive: boolean | undefined;
  var __rqbMariaDBActive: boolean | undefined;
}

export const mysqlEnabled: boolean = !!process.env.RQB_MYSQL_URL;
export const mariadbEnabled: boolean = !!process.env.RQB_MARIADB_URL;

const identRE = /^[a-z0-9_]+$/;
const assertIdent = (s: string) => {
  if (!identRE.test(s)) throw new Error(`Invalid MySQL identifier: ${s}`);
  return s;
};

export interface MySQLHarness {
  /** Run one statement w/ optional positional (`?`) params. */
  query: <T = Record<string, unknown>>(sql: string, params?: unknown[]) => Promise<T[]>;
  /** No multi-statement batches; runs `;`-separated statements one at a time. */
  execMany: (sql: string | string[]) => Promise<void>;
  createSchema: (schema: string) => Promise<void>;
  dropSchema: (schema: string) => Promise<void>;
  close: () => Promise<void>;
}

const makeHarness = (
  label: string,
  envVar: string,
  flag: '__rqbMySQLActive' | '__rqbMariaDBActive'
): MySQLHarness => {
  const pool = memo(async (): Promise<SQL> => {
    globalThis[flag] = true;
    const { SQL } = await import('bun');
    const db = new SQL({
      url: process.env[envVar]!,
      adapter: 'mysql',
      max: 4,
      // MySQL 8.4 `caching_sha2_password` over non-TLS needs RSA key fetch (test containers only)
      allowPublicKeyRetrieval: true,
    });
    await db.unsafe('SELECT 1');
    return db;
  });

  const query = async <T = Record<string, unknown>>(
    sql: string,
    params: unknown[] = []
  ): Promise<T[]> => [...((await (await pool.get()).unsafe(sql, params)) as T[])];

  const execMany = async (sql: string | string[]): Promise<void> => {
    for (const stmt of typeof sql === 'string' ? sql.split(';') : sql) {
      if (stmt.trim()) await query(stmt);
    }
  };

  const dropSchema = async (schema: string): Promise<void> => {
    await query(`DROP DATABASE IF EXISTS \`${assertIdent(schema)}\``);
  };

  const createSchema = async (schema: string): Promise<void> => {
    await dropSchema(schema);
    await query(
      `CREATE DATABASE \`${assertIdent(schema)}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_bin`
    );
  };

  const close = (): Promise<void> =>
    teardown(label, [
      async () => (await pool.take())?.close(),
      async () => {
        globalThis[flag] = undefined;
      },
    ]);

  return { query, execMany, createSchema, dropSchema, close };
};

const my = makeHarness('MySQL', 'RQB_MYSQL_URL', '__rqbMySQLActive');
const maria = makeHarness('MariaDB', 'RQB_MARIADB_URL', '__rqbMariaDBActive');

export const mysqlQuery: MySQLHarness['query'] = my.query;
export const mysqlExecMany: MySQLHarness['execMany'] = my.execMany;
export const createMySQLSchema: MySQLHarness['createSchema'] = my.createSchema;
export const dropMySQLSchema: MySQLHarness['dropSchema'] = my.dropSchema;
export const closeSharedMySQL: MySQLHarness['close'] = my.close;

export const mariadbQuery: MySQLHarness['query'] = maria.query;
export const mariadbExecMany: MySQLHarness['execMany'] = maria.execMany;
export const createMariaDBSchema: MySQLHarness['createSchema'] = maria.createSchema;
export const dropMariaDBSchema: MySQLHarness['dropSchema'] = maria.dropSchema;
export const closeSharedMariaDB: MySQLHarness['close'] = maria.close;
