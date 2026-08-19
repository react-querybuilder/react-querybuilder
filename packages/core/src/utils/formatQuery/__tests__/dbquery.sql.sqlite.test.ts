import { SQL } from 'bun';
import type { DefaultRuleGroupType } from '../../../types';
import type { SuperUser, TestSQLParams } from '../dbqueryTestUtils';
import { dbSetup, dbTests, getSqlOrderBy, sqlBase, superUsers } from '../dbqueryTestUtils';
import { formatQuery } from '../formatQuery';

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
        `${sqlBase()} ${parameterizedNamed.sql}`,
        parameterizedNamed.params as unknown as unknown[]
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
        const select = await sql.unsafe(
          `${sqlBase()} ${sqlStr} ${getSqlOrderBy()}`,
          bindings as unknown as unknown[]
        );
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
