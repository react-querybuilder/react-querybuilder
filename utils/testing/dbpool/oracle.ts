import type { Pool } from 'oracledb';
import { memo, teardown } from './memo';

// Shared Oracle pools (CI-only; needs a live server). One Oracle user (= schema) per suite.
// - admin pool (SYSTEM): only per-suite user lifecycle + one-time app user setup
// - app pool (low-privilege): all DDL/DML/queries, schema-qualified, so privilege-masked bugs
//   surface instead of hiding behind a DBA session
// `oracledb` (thin mode, pure JS) is imported lazily so skipped runs never load it.
// Env:
//   RQB_ORACLE_ADMIN_URL=oracle://system:<password>@localhost:1521/FREEPDB1
//   RQB_ORACLE_URL=oracle://rqb_app:<password>@localhost:1521/FREEPDB1 (created on first use)

declare global {
  // Set once boot starts; lets the preload skip teardown when Oracle was never used.
  var __rqbOracleActive: boolean | undefined;
}

export const oracleEnabled: boolean =
  !!process.env.RQB_ORACLE_URL && !!process.env.RQB_ORACLE_ADMIN_URL;

const parseURL = (envVar: string) => {
  const url = new URL(process.env[envVar]!);
  return {
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    connectString: `${url.hostname}:${url.port || 1521}${url.pathname}`,
  };
};

const identRE = /^[A-Za-z][A-Za-z0-9_$#]*$/;
const assertIdent = (s: string) => {
  if (!identRE.test(s)) throw new Error(`Invalid Oracle identifier: ${s}`);
  return s;
};

const loadOracle = async () => {
  const { default: oracledb } = await import('oracledb');
  // Thin mode is the default (oracledb >= 6) as long as `initOracleClient()` is never called.
  oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
  oracledb.fetchAsString = [oracledb.CLOB];
  return oracledb;
};

// Ignore "already exists" style errors so setup is idempotent across reruns on one container.
const ignoreCodes = (sql: string, codes: number[]) =>
  `BEGIN EXECUTE IMMEDIATE '${sql.replaceAll(`'`, `''`)}'; EXCEPTION WHEN OTHERS THEN IF SQLCODE NOT IN (${codes.join(', ')}) THEN RAISE; END IF; END;`;

const adminPool = memo(async (): Promise<Pool> => {
  globalThis.__rqbOracleActive = true;
  const oracledb = await loadOracle();
  return oracledb.createPool({ ...parseURL('RQB_ORACLE_ADMIN_URL'), poolMin: 0, poolMax: 2 });
});

const appPool = memo(async (): Promise<Pool> => {
  const oracledb = await loadOracle();
  const app = parseURL('RQB_ORACLE_URL');
  const user = assertIdent(app.user);
  const conn = await (await adminPool.get()).getConnection();
  try {
    // ORA-01920: user name conflicts w/ another user or role name
    await conn.execute(
      ignoreCodes(
        `CREATE USER ${user} IDENTIFIED BY "${app.password.replaceAll('"', '')}"`,
        [-1920]
      )
    );
    await conn.execute(
      `GRANT CREATE SESSION, CREATE ANY TABLE, CREATE ANY INDEX, DROP ANY TABLE, ` +
        `INSERT ANY TABLE, SELECT ANY TABLE TO ${user}`
    );
  } finally {
    await conn.close();
  }
  return oracledb.createPool({ ...app, poolMin: 0, poolMax: 4 });
});

export const getSharedOracleAdmin = (): Promise<Pool> => adminPool.get();
export const getSharedOracle = (): Promise<Pool> => appPool.get();

/**
 * Create a per-suite Oracle user (= schema). Pass an upper-case name (e.g.
 * `reserveSchema('x').toUpperCase()`) so quoted and unquoted references agree.
 */
export const createOracleUser = async (schema: string): Promise<void> => {
  assertIdent(schema);
  await dropOracleUser(schema);
  const conn = await (await adminPool.get()).getConnection();
  try {
    await conn.execute(
      `CREATE USER "${schema}" IDENTIFIED BY "${crypto.randomUUID().replaceAll('-', '')}" ` +
        `DEFAULT TABLESPACE USERS QUOTA UNLIMITED ON USERS`
    );
    await conn.execute(`GRANT CREATE SESSION, CREATE TABLE TO "${schema}"`);
  } finally {
    await conn.close();
  }
};

export const dropOracleUser = async (schema: string): Promise<void> => {
  assertIdent(schema);
  const conn = await (await adminPool.get()).getConnection();
  try {
    // ORA-01918: user does not exist
    await conn.execute(ignoreCodes(`DROP USER "${schema}" CASCADE`, [-1918]));
  } finally {
    await conn.close();
  }
};

/** Run one statement (no trailing `;` unless PL/SQL) on the app pool. Autocommits. */
export const oracleQuery = async <T = Record<string, unknown>>(
  sql: string,
  binds: unknown[] | Record<string, unknown> = []
): Promise<T[]> => {
  const conn = await (await appPool.get()).getConnection();
  try {
    // oxlint-disable-next-line typescript/no-explicit-any
    const result = await conn.execute<T>(sql, binds as any, { autoCommit: true });
    return result.rows ?? [];
  } finally {
    await conn.close();
  }
};

/** Oracle can't run `;`-separated batches in one `execute`; run statements one at a time. */
export const oracleExecMany = async (stmts: string[]): Promise<void> => {
  for (const stmt of stmts) {
    if (stmt.trim()) await oracleQuery(stmt);
  }
};

// App pool first (its sessions must end before admin drops anything), then admin pool.
export const closeSharedOracle = (): Promise<void> =>
  teardown('Oracle', [
    async () => (await appPool.take())?.close(0),
    async () => (await adminPool.take())?.close(0),
    async () => {
      globalThis.__rqbOracleActive = undefined;
    },
  ]);
