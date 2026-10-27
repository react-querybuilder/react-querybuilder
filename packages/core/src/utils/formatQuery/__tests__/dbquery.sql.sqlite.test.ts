import { SQL } from 'bun';
import type { SQLQueryBindings } from 'bun:sqlite';
import { openSQLiteWithExt } from '@rqb-dbpool';
import type { DefaultRuleGroupType } from '../../../types';
import type { SuperUser, TestSQLParams } from '../dbqueryTestUtils';
import { dbSetup, dbTests, getSqlOrderBy, sqlBase, superUsers } from '../dbqueryTestUtils';
import { formatQuery } from '../formatQuery';
import { ragQuery } from '../vectorDbqueryTestUtils';

const sql = new SQL({ adapter: 'sqlite', filename: ':memory:' });

const superUsersSQLite = superUsers('sqlite');

beforeAll(async () => {
  for (const stmt of dbSetup('sqlite')
    .split(';')
    .filter(s => s.trim())) {
    await sql.unsafe(stmt);
  }
});

afterAll(async () => {
  await sql.close();
});

/**
 * Tests all three SQL variations.
 */
const testSQL = ({ query, expectedResult, fqOptions, skipParameterized }: TestSQLParams) => {
  test('sql', async () => {
    const sqlStr = formatQuery(query, { format: 'sql', ...fqOptions });
    const select = await sql.unsafe(`${sqlBase()} ${sqlStr} ${getSqlOrderBy()}`);
    expect(select).toEqual(expectedResult);
  });

  if (!skipParameterized) {
    test('parameterized', async () => {
      const parameterized = formatQuery(query, { ...fqOptions, format: 'parameterized' });
      const selectParam = await sql.unsafe(
        `${sqlBase()} ${parameterized.sql} ${getSqlOrderBy()}`,
        parameterized.params
      );
      expect(selectParam).toEqual(expectedResult);
    });

    test('parameterized_named', async () => {
      const parameterizedNamed = formatQuery(query, {
        ...fqOptions,
        format: 'parameterized_named',
        preset: 'sqlite',
      });
      const selectParamNamed = await sql.unsafe(
        `${sqlBase()} ${parameterizedNamed.sql} ${getSqlOrderBy()}`,
        parameterizedNamed.params
      );
      expect(selectParamNamed).toEqual(expectedResult);
    });
  }
};

describe('SQLite', () => {
  // Common tests
  for (const [name, t] of Object.entries(dbTests(superUsersSQLite))) {
    describe(name, () => {
      testSQL(t);
    });
  }

  // SQLite-specific tests
  for (const q of ['"', '`', ['[', ']']] satisfies (string | [string, string])[]) {
    describe(`quote ${q[0]}fieldNames${q[1] ?? q[0]}`, () => {
      testSQL({
        query: {
          combinator: 'and',
          rules: [
            { field: 'enhanced', operator: '>', value: 0 },
            { field: 'enhanced', operator: '>', value: '0' },
          ],
        },
        expectedResult: superUsersSQLite.filter(u => u.enhanced),
        fqOptions: { quoteFieldNamesWith: q },
      });
    });
  }

  // Closing quote char in field name must not break out of the identifier
  describe('field name containing closing quote', () => {
    for (const [pre, post] of [
      ['"', '"'],
      ['`', '`'],
      ['[', ']'],
    ] as [string, string][]) {
      const query: DefaultRuleGroupType = {
        combinator: 'and',
        rules: [{ field: `enhanced${post} > 0 or 1=1 or ${pre}x`, operator: '=', value: 'x' }],
      };
      for (const format of ['sql', 'parameterized', 'parameterized_named'] as const) {
        test(`${pre}${post} ${format}`, async () => {
          const fq = formatQuery(query, { format, quoteFieldNamesWith: [pre, post] }) as unknown as
            | string
            | { sql: string; params: never };
          const [where, params] = typeof fq === 'string' ? [fq, []] : [fq.sql, fq.params];
          // Unescaped, this would return every row. Escaped: no such column → error (SQLite may
          // instead treat unknown `"…"` as a string literal → no rows).
          const result = await sql
            .unsafe(`${sqlBase()} ${where} ${getSqlOrderBy()}`, params)
            .catch((e: Error) => e);
          // Errors seen: no such column; `]]` (MSSQL escape, unsupported by SQLite); named param
          // names derived from raw field name (known follow-up). Never every row.
          expect(result instanceof Error || result.length === 0).toBe(true);
        });
      }
    }
  });

  // "parameter" value source: the generated SQL references bind variables that must
  // be supplied at execution time, so these can't use the shared `dbTests` harness.
  describe('parameter value source', () => {
    const testParam = (
      name: string,
      query: DefaultRuleGroupType,
      bindings: Record<string, string | number>,
      expectedResult: SuperUser<0 | 1>[]
    ) => {
      test(name, async () => {
        const sqlStr = formatQuery(query, 'sql');
        const select = await sql.unsafe(`${sqlBase()} ${sqlStr} ${getSqlOrderBy()}`, bindings);
        expect(select).toEqual(expectedResult);
      });
    };

    const rule = (r: DefaultRuleGroupType['rules'][number]): DefaultRuleGroupType => ({
      combinator: 'and',
      rules: [r],
    });

    testParam(
      'numeric comparison',
      rule({ field: 'powerUpAge', operator: '>', value: 'p1', valueSource: 'parameter' }),
      { ':p1': 15 },
      superUsersSQLite.filter(u => (u.powerUpAge ?? 0) > 15)
    );

    testParam(
      'string equality',
      rule({ field: 'firstName', operator: '=', value: 'p1', valueSource: 'parameter' }),
      { ':p1': 'Peter' },
      superUsersSQLite.filter(u => u.firstName === 'Peter')
    );

    testParam(
      'boolean',
      rule({ field: 'enhanced', operator: '=', value: 'p1', valueSource: 'parameter' }),
      { ':p1': 1 },
      superUsersSQLite.filter(u => !!u.enhanced)
    );

    testParam(
      'beginsWith',
      rule({ field: 'firstName', operator: 'beginsWith', value: 'p1', valueSource: 'parameter' }),
      { ':p1': 'P' },
      superUsersSQLite.filter(u => u.firstName.startsWith('P'))
    );

    testParam(
      'endsWith',
      rule({ field: 'lastName', operator: 'endsWith', value: 'p1', valueSource: 'parameter' }),
      { ':p1': 's' },
      superUsersSQLite.filter(u => u.lastName.endsWith('s'))
    );

    testParam(
      'contains',
      rule({ field: 'firstName', operator: 'contains', value: 'p1', valueSource: 'parameter' }),
      { ':p1': 'ete' },
      superUsersSQLite.filter(u => u.firstName.includes('ete'))
    );

    testParam(
      'doesNotContain',
      rule({
        field: 'madeUpName',
        operator: 'doesNotContain',
        value: 'p1',
        valueSource: 'parameter',
      }),
      { ':p1': 'r' },
      superUsersSQLite.filter(u => !u.madeUpName.includes('r'))
    );

    testParam(
      'in',
      rule({ field: 'lastName', operator: 'in', value: 'p1,p2', valueSource: 'parameter' }),
      { ':p1': 'Rogers', ':p2': 'Wayne' },
      superUsersSQLite.filter(u => ['Rogers', 'Wayne'].includes(u.lastName))
    );

    testParam(
      'between',
      rule({ field: 'powerUpAge', operator: 'between', value: 'p1,p2', valueSource: 'parameter' }),
      { ':p1': 10, ':p2': 30 },
      superUsersSQLite.filter(u => (u.powerUpAge ?? -1) >= 10 && (u.powerUpAge ?? -1) <= 30)
    );
  });
});

// Extension-backed tests: separate `bun:sqlite` DBs since `Bun.SQL` can't load extensions. Skipped
// if unavailable (e.g. macOS w/o Homebrew `sqlite`; see `@rqb-dbpool` sqliteExt.ts).
const regexDb = await openSQLiteWithExt(['regex']);
const vecDb = await openSQLiteWithExt(['vec']);

afterAll(() => {
  regexDb?.close();
  vecDb?.close();
});

describe.skipIf(!regexDb)('SQLite regex (sqlite-regex)', () => {
  const db = regexDb!;

  beforeAll(() => {
    db.run(dbSetup('sqlite'));
  });

  const run = (where: string, params: unknown) => {
    const stmt = db.query(`${sqlBase()} ${where} ${getSqlOrderBy()}`);
    return Array.isArray(params)
      ? stmt.all(...(params as SQLQueryBindings[]))
      : stmt.all(params as SQLQueryBindings);
  };

  const regexTests: [string, DefaultRuleGroupType, (u: SuperUser<0 | 1>) => boolean][] = [
    [
      'matches',
      { combinator: 'and', rules: [{ field: 'madeUpName', operator: 'matches', value: 'man$' }] },
      u => u.madeUpName.endsWith('man'),
    ],
    [
      'matches i',
      {
        combinator: 'and',
        rules: [{ field: 'madeUpName', operator: 'matches', value: '^s', regexFlags: 'i' }],
      },
      u => /^s/i.test(u.madeUpName),
    ],
    [
      'doesNotMatch',
      {
        combinator: 'and',
        rules: [{ field: 'firstName', operator: 'doesNotMatch', value: "e'?r" }],
      },
      u => !/e'?r/.test(u.firstName),
    ],
    [
      'doesNotMatch i',
      {
        combinator: 'and',
        rules: [{ field: 'firstName', operator: 'doesNotMatch', value: 'B', regexFlags: 'i' }],
      },
      u => !/B/i.test(u.firstName),
    ],
  ];

  for (const [name, query, filter] of regexTests) {
    describe(name, () => {
      const expected = superUsersSQLite.filter(filter);
      test('sql', () => {
        expect(run(formatQuery(query, { format: 'sql', preset: 'sqlite' }), [])).toEqual(expected);
      });
      for (const format of ['parameterized', 'parameterized_named'] as const) {
        test(format, () => {
          const fq = formatQuery(query, { format, preset: 'sqlite' }) as unknown as {
            sql: string;
            params: unknown;
          };
          expect(run(fq.sql, fq.params)).toEqual(expected);
        });
      }
    });
  }
});

describe.skipIf(!vecDb)('SQLite vector (sqlite-vec)', () => {
  const db = vecDb!;

  // Reverse-alphabetical embeddings -> nearest-first = `madeUpName` desc
  beforeAll(() => {
    db.run(dbSetup('sqlite'));
    db.run('CREATE TABLE embeddings (madeUpName TEXT PRIMARY KEY, embedding BLOB)');
    const insert = db.prepare('INSERT INTO embeddings VALUES (?, vec_f32(?))');
    for (const [i, u] of superUsersSQLite.entries()) {
      insert.run(u.madeUpName, `[${superUsersSQLite.length - i}, 0]`);
    }
  });

  test('filter + nearest-neighbor ordering', () => {
    const { sql: where, params } = formatQuery(ragQuery, {
      format: 'parameterized',
      preset: 'sqlite',
    });
    const rows = db
      .query<{ madeUpName: string }, SQLQueryBindings[]>(
        `SELECT madeUpName FROM superusers JOIN embeddings USING (madeUpName)
         WHERE ${where} ORDER BY vec_distance_l2(embedding, vec_f32('[0, 0]'))`
      )
      .all(...(params as SQLQueryBindings[]));
    expect(rows.map(r => r.madeUpName)).toEqual(['Superman', 'Spider-Man']);
  });
});
