import type { ConnectionPool } from 'mssql';
import { memo, teardown } from './memo';

// Shared SQL Server pool (CI-only; needs a live server). One shared DB (`rqb`), one schema per
// suite (see `reserveSchema`). `mssql` is imported lazily so skipped runs never load it.
// Env: RQB_MSSQL_URL=mssql://sa:<password>@localhost:1433

declare global {
  // Set once boot starts; lets the preload skip teardown when MSSQL was never used.
  var __rqbMSSQLActive: boolean | undefined;
}

export const mssqlEnabled: boolean = !!process.env.RQB_MSSQL_URL;

const DB_NAME = 'rqb';

const config = (database: string) => {
  const url = new URL(process.env.RQB_MSSQL_URL!);
  return {
    server: url.hostname,
    port: url.port ? Number(url.port) : 1433,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database,
    options: { encrypt: true, trustServerCertificate: true },
    pool: { min: 0, max: 4 },
  };
};

const pool = memo(async (): Promise<ConnectionPool> => {
  globalThis.__rqbMSSQLActive = true;
  const { default: sql } = await import('mssql');
  const master = await new sql.ConnectionPool(config('master')).connect();
  try {
    await master.query(`IF DB_ID('${DB_NAME}') IS NULL CREATE DATABASE [${DB_NAME}]`);
  } finally {
    await master.close();
  }
  return new sql.ConnectionPool(config(DB_NAME)).connect();
});

export const getSharedMSSQL = (): Promise<ConnectionPool> => pool.get();

/**
 * Run `sql` w/ optional params. Array -> positional, bound as `@1`, `@2`, ... (matches
 * `numberedParams` output of the "mssql" preset). Object -> named (`@key`).
 */
export const mssqlQuery = async <T = Record<string, unknown>>(
  sql: string,
  params?: unknown[] | Record<string, unknown>
): Promise<T[]> => {
  const { default: mssql } = await import('mssql');
  const request = (await pool.get()).request();
  const entries = Array.isArray(params)
    ? params.map((v, i) => [`${i + 1}`, v] as const)
    : Object.entries(params ?? {});
  for (const [k, v] of entries) {
    // bigint not inferred by `mssql`; bind explicitly
    if (typeof v === 'bigint') request.input(k, mssql.BigInt, v.toString());
    else request.input(k, v);
  }
  // Plain array (drop recordset's extra `columns` prop) so `toEqual` compares rows only.
  // No result set (DDL/DML-only batch) -> `recordset` undefined.
  return [...((await request.query<T>(sql)).recordset ?? [])];
};

const dropSchemaSQL = (schema: string) => `
DECLARE @schema sysname = N'${schema}';
DECLARE @stmts nvarchar(max) = N'';
SELECT @stmts += N'DROP TABLE ' + QUOTENAME(s.name) + N'.' + QUOTENAME(t.name) + N';'
  FROM sys.tables t JOIN sys.schemas s ON t.schema_id = s.schema_id WHERE s.name = @schema;
EXEC sp_executesql @stmts;
IF SCHEMA_ID(@schema) IS NOT NULL
BEGIN
  DECLARE @drop nvarchar(max) = N'DROP SCHEMA ' + QUOTENAME(@schema);
  EXEC sp_executesql @drop;
END`;

// No `DROP SCHEMA ... CASCADE` in T-SQL: drop the schema's tables, then the schema.
export const createMSSQLSchema = async (schema: string): Promise<void> => {
  const p = await pool.get();
  await p.query(dropSchemaSQL(schema));
  await p.query(`CREATE SCHEMA [${schema}]`); // must be alone in its batch
};

export const dropMSSQLSchema = async (schema: string): Promise<void> => {
  await (await pool.get()).query(dropSchemaSQL(schema));
};

export const closeSharedMSSQL = (): Promise<void> =>
  teardown('MSSQL', [
    async () => (await pool.take())?.close(),
    async () => {
      globalThis.__rqbMSSQLActive = undefined;
    },
  ]);
