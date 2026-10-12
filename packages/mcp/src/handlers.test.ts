import type { FormatQueryOptions } from '@react-querybuilder/core';
import { formatQuery } from '@react-querybuilder/core';
import { exportFormats, importFormats, ormFormats } from './formats';
import {
  checkShape,
  fail,
  handleConvertQuery,
  handleFormatQuery,
  handleGetDoc,
  handleGetQuerySchema,
  handleParseQuery,
  handleSearchDocs,
  handleValidateQuery,
  ok,
  parseQueryInput,
} from './handlers';
import type { ToolResult } from './types';

const query = {
  combinator: 'and',
  rules: [
    { field: 'firstName', operator: '=', value: 'Steve' },
    { field: 'age', operator: 'between', value: [20, 30] },
  ],
};

const fields = [
  { name: 'firstName', label: 'First name' },
  { name: 'age', label: 'Age', inputType: 'number' },
];

const text = (r: ToolResult) => r.content[0].text;
const sc = (r: ToolResult): Record<string, unknown> => r.structuredContent ?? {};

describe('helpers', () => {
  test('ok serializes bigints and uses custom text', () => {
    const r = ok({ n: 1n }, 'hi');
    expect(r.structuredContent).toEqual({ n: { $bigint: '1' } });
    expect(text(r)).toBe('hi');
    expect(text(ok({ a: 1 }))).toBe('{\n  "a": 1\n}');
  });

  test('fail', () => {
    expect(fail('x')).toEqual({ content: [{ type: 'text', text: 'x' }], isError: true });
  });

  test('parseQueryInput', () => {
    expect(parseQueryInput(query)).toBe(query);
    expect(parseQueryInput(JSON.stringify(query))).toEqual(query);
    expect(parseQueryInput('{"v":{"$bigint":"9"}}')).toEqual({ v: 9n });
    expect(() => parseQueryInput('{')).toThrow('not valid JSON');
  });

  test('checkShape', () => {
    expect(checkShape(query)).toEqual([]);
    expect(checkShape({ rules: [{ field: 'a', operator: '=' }, 'and', { rules: [] }] })).toEqual(
      []
    );
    expect(checkShape(null)[0].message).toMatch('`rules` array');
    expect(checkShape({ combinator: 1, rules: [] })[0].message).toMatch('combinator');
    expect(checkShape({ combinator: 'and', rules: ['or'] })).toEqual([
      {
        code: 'INVALID_SHAPE',
        message: 'Combinator string at index 0 in a non-IC group',
        path: [0],
      },
    ]);
    expect(checkShape({ combinator: 'and', rules: [1] })[0].message).toMatch('rule or group');
    expect(checkShape({ combinator: 'and', rules: [{ field: 'a' }] })[0].message).toBe(
      'Rule is missing string `operator`'
    );
    expect(checkShape({ combinator: 'and', rules: [{ combinator: 'or', rules: [{}] }] })).toEqual([
      {
        code: 'INVALID_SHAPE',
        message: 'Rule is missing string `field` and `operator`',
        path: [0, 0],
      },
    ]);
  });
});

describe('handleFormatQuery', () => {
  test.each(exportFormats)('%s', async format => {
    const r = await handleFormatQuery({ query, format });
    expect(r.isError).toBeUndefined();
    const expected: unknown = formatQuery(query, { format } as FormatQueryOptions);
    expect(r.structuredContent).toEqual(JSON.parse(JSON.stringify({ format, result: expected })));
    expect(text(r)).toBe(
      typeof expected === 'string' ? expected : JSON.stringify(expected, null, 2)
    );
  });

  test('JSON string query + options', async () => {
    const r = await handleFormatQuery({
      query: JSON.stringify(query),
      format: 'sql',
      options: { quoteFieldNamesWith: '"', fields, parseNumbers: true },
    });
    expect(text(r)).toBe(`("firstName" = 'Steve' and "age" between 20 and 30)`);
  });

  test.each(ormFormats)('ORM format %s → error', async format => {
    const r = await handleFormatQuery({ query, format });
    expect(r.isError).toBe(true);
    expect(text(r)).toMatch('ORM objects');
  });

  test('unknown format', async () => {
    const r = await handleFormatQuery({ query, format: 'nope' });
    expect(r.isError).toBe(true);
    expect(text(r)).toMatch('Unknown format "nope"');
  });

  test('invalid shape / JSON', async () => {
    expect(text(await handleFormatQuery({ query: { rules: 1 }, format: 'sql' }))).toMatch(
      'Invalid query shape:\n- [] Expected'
    );
    expect(text(await handleFormatQuery({ query: '{', format: 'sql' }))).toMatch('not valid JSON');
  });

  test('unexpected throw → isError', async () => {
    const r = await handleFormatQuery({
      query,
      format: 'sql',
      options: {
        get fields(): unknown[] {
          throw new Error('boom');
        },
      },
    });
    expect(r).toEqual(fail('Error: boom'));
  });

  test('non-Error throw', async () => {
    const r = await handleFormatQuery({
      query,
      format: 'sql',
      options: {
        get fields(): unknown[] {
          throw 'str';
        },
      },
    });
    expect(r).toEqual(fail('Error: str'));
  });
});

describe('handleParseQuery', () => {
  const simple = { combinator: 'and', rules: [{ field: 'a', operator: '=', value: 'x' }] };

  test.each(importFormats.filter(f => f !== 'sparql'))('%s round trip', async f => {
    const src: unknown = formatQuery(simple, {
      format: f === 'mongodb' ? 'mongodb_query' : f,
    } as FormatQueryOptions);
    const r = await handleParseQuery({ input: src, sourceFormat: f });
    expect(r.isError).toBeUndefined();
    expect(r.structuredContent).toEqual({ query: simple, warnings: [] });
  });

  test('sparql', async () => {
    const r = await handleParseQuery({ input: '?a = "x"', sourceFormat: 'sparql' });
    expect((sc(r).query as { rules: unknown[] }).rules).toHaveLength(1);
  });

  test('options (sql params, IC, ids)', async () => {
    const r = await handleParseQuery({
      input: 'a = ? or b = 2',
      sourceFormat: 'sql',
      options: { params: [1], independentCombinators: true, generateIDs: true },
    });
    const q = sc(r).query as { id: string; rules: unknown[] };
    expect(typeof q.id).toBe('string');
    expect(q.rules[1]).toBe('or');
  });

  test('empty result → warning', async () => {
    const r = await handleParseQuery({
      input: 'a = 1',
      sourceFormat: 'sql',
      options: { fields: [{ name: 'b', label: 'B' }] },
    });
    expect((sc(r).warnings as string[])[0]).toMatch('no rules');
    expect(text(r)).toMatch('Warning: Parsed query has no rules');
  });

  test('unknown format / non-string input', async () => {
    expect(text(await handleParseQuery({ input: 'x', sourceFormat: 'nope' }))).toMatch(
      'Unknown sourceFormat'
    );
    expect(text(await handleParseQuery({ input: {}, sourceFormat: 'sql' }))).toMatch(
      'must be a string'
    );
  });
});

describe('handleConvertQuery', () => {
  test('sql → mongodb_query w/ fields', async () => {
    const r = await handleConvertQuery({
      input: "firstName = 'Steve' and age between 20 and 30",
      from: 'sql',
      to: 'mongodb_query',
      fields,
      formatOptions: { parseNumbers: true },
      parseOptions: { listsAsArrays: true },
    });
    expect(sc(r).result).toEqual({
      $and: [{ firstName: 'Steve' }, { age: { $gte: 20, $lte: 30 } }],
    });
    expect(text(r)).toMatch('Intermediate RQB query:');
  });

  test('no fields; warnings in text', async () => {
    const r = await handleConvertQuery({ input: 'not sql at all', from: 'sql', to: 'cel' });
    expect(r.isError).toBe(true);
    const r2 = await handleConvertQuery({ input: '{}', from: 'mongodb', to: 'sql' });
    expect(text(r2)).toMatch('Warning:');
  });

  test('ORM target', async () => {
    expect((await handleConvertQuery({ input: 'a = 1', from: 'sql', to: 'prisma' })).isError).toBe(
      true
    );
  });
});

describe('handleValidateQuery', () => {
  test('valid', async () => {
    const r = await handleValidateQuery({ query, fields });
    expect(r.structuredContent).toEqual({ valid: true, errors: [], warnings: [] });
    expect(text(r)).toBe('Valid.');
  });

  test('valid w/ warnings', async () => {
    const r = await handleValidateQuery({
      query: { combinator: 'and', rules: [query.rules[0]] },
      fields,
      queryType: 'standard',
    });
    expect(sc(r).valid).toBe(true);
    expect(text(r)).toMatch('Warnings:\n- Field "age"');
  });

  test('errors', async () => {
    const r = await handleValidateQuery({
      query: {
        rules: [
          { field: 'nope', operator: '=', value: 'x' },
          'and',
          { field: 'age', operator: 'between', value: [1] },
        ],
      },
      fields,
      queryType: 'standard',
    });
    const errors = sc(r).errors as { code: string }[];
    expect(sc(r).valid).toBe(false);
    expect(errors.map(e => e.code)).toEqual([
      'WRONG_QUERY_TYPE',
      'UNDEFINED_FIELD',
      'INVALID_VALUE_ARITY',
    ]);
  });

  test('wrong type (expected ic)', async () => {
    const r = await handleValidateQuery({ query, fields, queryType: 'ic' });
    expect((sc(r).errors as { message: string }[])[0].message).toMatch('Expected RuleGroupTypeIC');
  });

  test('object-map fields', async () => {
    const r = await handleValidateQuery({
      query: {
        combinator: 'and',
        rules: [
          { field: 'a', operator: '=', value: 'x' },
          { field: 'nope', operator: '=', value: 'x' },
        ],
      },
      fields: { a: { label: 'A' } },
    });
    expect((sc(r).errors as { code: string }[]).map(e => e.code)).toEqual(['UNDEFINED_FIELD']);
  });

  test('shape errors short-circuit', async () => {
    const r = await handleValidateQuery({ query: { rules: [{}] }, fields });
    expect(sc(r).valid).toBe(false);
    expect((sc(r).errors as { code: string }[])[0].code).toBe('INVALID_SHAPE');
  });
});

describe('handleGetQuerySchema', () => {
  test('returns schema', async () => {
    const r = await handleGetQuerySchema({ fields, options: { strict: true } });
    expect((sc(r).schema as { type: string }).type).toBe('object');
  });
});

describe('handleSearchDocs / handleGetDoc', () => {
  test('search', async () => {
    const r = await handleSearchDocs({ query: 'parameterized sql', limit: 2 });
    expect((sc(r).results as unknown[]).length).toBe(2);
    expect(text(r)).toMatch(/^## /);
    expect(text(await handleSearchDocs({ query: 'zzqxjv' }))).toMatch('No results');
  });

  test('get doc / section', async () => {
    const r = await handleGetDoc({ page: 'utils/export' });
    expect(sc(r).title).toBe('Export');
    expect(text(await handleGetDoc({ page: 'utils/export#sql' })).startsWith('### SQL')).toBe(true);
  });

  test('unknown page / anchor', async () => {
    const r1 = await handleGetDoc({ page: 'export utils typo' });
    expect(r1.isError).toBe(true);
    expect(text(r1)).toMatch('Did you mean');
    const r2 = await handleGetDoc({ page: 'utils/export#nope' });
    expect(text(r2)).toMatch('No doc section "#nope" on page "utils/export"');
    expect(text(await handleGetDoc({ page: 'zzqxjv' }))).toMatch('Use search_docs');
  });
});
