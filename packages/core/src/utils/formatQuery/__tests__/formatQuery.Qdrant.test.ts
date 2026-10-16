import type { FormatQueryOptions, RuleGroupType, RuleProcessor, RuleType } from '../../../types';
import { defaultRuleProcessorQdrant } from '../defaultRuleProcessorQdrant';
import { formatQuery } from '../formatQuery';
import {
  getMuteTestData,
  getValidationTestData,
  queryForRuleProcessor,
  queryIC,
} from '../formatQueryTestUtils';

const q = (rules: RuleGroupType['rules'], extra: Partial<RuleGroupType> = {}): RuleGroupType => ({
  combinator: 'and',
  rules,
  ...extra,
});
const fq = (rules: RuleGroupType['rules'], opts: Omit<FormatQueryOptions, 'format'> = {}) =>
  formatQuery(q(rules), { ...opts, format: 'qdrant' });
const one = (rule: RuleType, opts: Omit<FormatQueryOptions, 'format'> = {}) => {
  const out = fq([rule], opts) as { must?: unknown[] };
  return out.must?.[0];
};

describe('operators', () => {
  it.each<[string, RuleType, unknown]>([
    ['= string', { field: 'f', operator: '=', value: 'a' }, { key: 'f', match: { value: 'a' } }],
    [
      '= empty string',
      { field: 'f', operator: '=', value: '' },
      { key: 'f', match: { value: '' } },
    ],
    ['= boolean', { field: 'f', operator: '=', value: true }, { key: 'f', match: { value: true } }],
    ['= number', { field: 'f', operator: '=', value: 3 }, { key: 'f', match: { value: 3 } }],
    [
      '= float',
      { field: 'f', operator: '=', value: 1.5 },
      { key: 'f', range: { gte: 1.5, lte: 1.5 } },
    ],
    ['= bigint', { field: 'f', operator: '=', value: 7n }, { key: 'f', match: { value: 7 } }],
    [
      '= numeric string w/o parseNumbers',
      { field: 'f', operator: '=', value: '3' },
      { key: 'f', match: { value: '3' } },
    ],
    ['= object', { field: 'f', operator: '=', value: {} }, undefined],
    [
      '!=',
      { field: 'f', operator: '!=', value: 'a' },
      { must_not: [{ key: 'f', match: { value: 'a' } }] },
    ],
    ['!= object', { field: 'f', operator: '!=', value: null }, undefined],
    ['<', { field: 'f', operator: '<', value: '5' }, { key: 'f', range: { lt: 5 } }],
    ['<=', { field: 'f', operator: '<=', value: 5 }, { key: 'f', range: { lte: 5 } }],
    ['>', { field: 'f', operator: '>', value: '5.5' }, { key: 'f', range: { gt: 5.5 } }],
    ['>=', { field: 'f', operator: '>=', value: 5n }, { key: 'f', range: { gte: 5 } }],
    ['> non-numeric', { field: 'f', operator: '>', value: 'abc' }, undefined],
    [
      'in strings',
      { field: 'f', operator: 'in', value: 'a, b' },
      { key: 'f', match: { any: ['a', 'b'] } },
    ],
    [
      'notIn strings',
      { field: 'f', operator: 'notIn', value: ['a', 'b'] },
      { key: 'f', match: { except: ['a', 'b'] } },
    ],
    [
      'in ints',
      { field: 'f', operator: 'in', value: [1, 2] },
      { key: 'f', match: { any: [1, 2] } },
    ],
    [
      'in single number',
      { field: 'f', operator: 'in', value: 1 },
      { key: 'f', match: { any: [1] } },
    ],
    [
      'in mixed',
      { field: 'f', operator: 'in', value: [1, 'a', 1.5] },
      {
        should: [
          { key: 'f', match: { value: 1 } },
          { key: 'f', match: { value: 'a' } },
          { key: 'f', range: { gte: 1.5, lte: 1.5 } },
        ],
      },
    ],
    [
      'notIn mixed',
      { field: 'f', operator: 'notIn', value: [true, 'a'] },
      {
        must_not: [
          { key: 'f', match: { value: true } },
          { key: 'f', match: { value: 'a' } },
        ],
      },
    ],
    ['in invalid member', { field: 'f', operator: 'in', value: [1, {}] }, undefined],
    ['in empty', { field: 'f', operator: 'in', value: [] }, undefined],
    [
      'between',
      { field: 'f', operator: 'between', value: '1,5' },
      { key: 'f', range: { gte: 1, lte: 5 } },
    ],
    [
      'between swapped',
      { field: 'f', operator: 'between', value: [5, 1] },
      { key: 'f', range: { gte: 1, lte: 5 } },
    ],
    [
      'notBetween',
      { field: 'f', operator: 'notBetween', value: [1, 5] },
      {
        should: [
          { key: 'f', range: { lt: 1 } },
          { key: 'f', range: { gt: 5 } },
        ],
      },
    ],
    ['between too few', { field: 'f', operator: 'between', value: [1] }, undefined],
    ['between non-numeric', { field: 'f', operator: 'between', value: ['a', 2] }, undefined],
    ['null', { field: 'f', operator: 'null', value: null }, { is_null: { key: 'f' } }],
    [
      'notNull',
      { field: 'f', operator: 'notNull', value: null },
      { must_not: [{ is_null: { key: 'f' } }] },
    ],
    [
      'contains',
      { field: 'f', operator: 'contains', value: 'a b' },
      { key: 'f', match: { text: 'a b' } },
    ],
    [
      'doesNotContain',
      { field: 'f', operator: 'doesNotContain', value: 'a' },
      { must_not: [{ key: 'f', match: { text: 'a' } }] },
    ],
    ['contains empty', { field: 'f', operator: 'contains', value: '' }, undefined],
    ['beginsWith', { field: 'f', operator: 'beginsWith', value: 'a' }, undefined],
    ['doesNotBeginWith', { field: 'f', operator: 'doesNotBeginWith', value: 'a' }, undefined],
    ['endsWith', { field: 'f', operator: 'endsWith', value: 'a' }, undefined],
    ['doesNotEndWith', { field: 'f', operator: 'doesNotEndWith', value: 'a' }, undefined],
    ['unknown op', { field: 'f', operator: 'foo', value: 'a' }, undefined],
    [
      'valueSource field',
      { field: 'f', operator: '=', value: 'g', valueSource: 'field' },
      undefined,
    ],
    [
      'case-insensitive op',
      { field: 'f', operator: 'NOTNULL', value: null },
      { must_not: [{ is_null: { key: 'f' } }] },
    ],
  ])('%s', (_, rule, expected) => {
    expect(one(rule)).toEqual(expected);
  });

  it('preserveValueOrder', () => {
    expect(
      one({ field: 'f', operator: 'between', value: [5, 1] }, { preserveValueOrder: true })
    ).toEqual({ key: 'f', range: { gte: 5, lte: 1 } });
  });

  it('parseNumbers', () => {
    expect(one({ field: 'f', operator: '=', value: '3' }, { parseNumbers: true })).toEqual({
      key: 'f',
      match: { value: 3 },
    });
    expect(one({ field: 'f', operator: 'in', value: '1, 2' }, { parseNumbers: 'strict' })).toEqual({
      key: 'f',
      match: { any: [1, 2] },
    });
    expect(
      one(
        { field: 'f', operator: '=', value: '1.5' },
        { parseNumbers: 'strict-limited', fields: [{ name: 'f', label: 'f', inputType: 'number' }] }
      )
    ).toEqual({ key: 'f', range: { gte: 1.5, lte: 1.5 } });
  });

  describe('boolean editors', () => {
    const fields = [
      { name: 'cb', label: 'cb', valueEditorType: 'checkbox' as const },
      { name: 'sw', label: 'sw', valueEditorType: () => 'switch' as const },
    ];
    it.each<[RuleType, unknown]>([
      [
        { field: 'cb', operator: '=', value: 'TRUE' },
        { key: 'cb', match: { value: true } },
      ],
      [
        { field: 'sw', operator: '=', value: false },
        { key: 'sw', match: { value: false } },
      ],
      [{ field: 'cb', operator: '=', value: 'x' }, undefined],
    ])('%o', (rule, expected) => {
      expect(one(rule, { fields })).toEqual(expected);
    });
  });

  describe('dates', () => {
    const fields = [
      { name: 'd', label: 'd', inputType: 'date' },
      { name: 'dt', label: 'dt', inputType: 'datetime-local' },
    ];
    it.each<[RuleType, unknown]>([
      [
        { field: 'd', operator: '=', value: '2024-01-02' },
        { key: 'd', range: { gte: '2024-01-02T00:00:00Z', lte: '2024-01-02T00:00:00Z' } },
      ],
      [{ field: 'd', operator: '=', value: 'nope' }, undefined],
      [
        { field: 'dt', operator: '>', value: '2024-01-02T03:04' },
        { key: 'dt', range: { gt: '2024-01-02T03:04:00Z' } },
      ],
      [{ field: 'dt', operator: '<', value: 'nope' }, undefined],
      [
        { field: 'd', operator: 'between', value: ['2024-12-31', '2024-01-01'] },
        { key: 'd', range: { gte: '2024-01-01T00:00:00Z', lte: '2024-12-31T00:00:00Z' } },
      ],
      [
        { field: 'd', operator: 'between', value: ['2024-01-01', '2024-12-31'] },
        { key: 'd', range: { gte: '2024-01-01T00:00:00Z', lte: '2024-12-31T00:00:00Z' } },
      ],
      [
        { field: 'd', operator: 'notBetween', value: ['2024-01-01', '2024-12-31'] },
        {
          should: [
            { key: 'd', range: { lt: '2024-01-01T00:00:00Z' } },
            { key: 'd', range: { gt: '2024-12-31T00:00:00Z' } },
          ],
        },
      ],
      [{ field: 'd', operator: 'between', value: ['2024-01-01', 'x'] }, undefined],
      [
        { field: 'd', operator: 'in', value: ['2024-01-01'] },
        {
          should: [
            { key: 'd', range: { gte: '2024-01-01T00:00:00Z', lte: '2024-01-01T00:00:00Z' } },
          ],
        },
      ],
    ])('%o', (rule, expected) => {
      expect(one(rule, { fields })).toEqual(expected);
    });
  });

  describe('match modes', () => {
    const sub = q([{ field: 'name', operator: '=', value: 'x' }]);
    it('some', () => {
      expect(one({ field: 'arr', operator: '=', value: sub, match: { mode: 'some' } })).toEqual({
        nested: { key: 'arr', filter: { must: [{ key: 'name', match: { value: 'x' } }] } },
      });
    });
    it('atLeast 1 → some', () => {
      expect(
        one({ field: 'arr', operator: '=', value: sub, match: { mode: 'atLeast', threshold: 1 } })
      ).toEqual({
        nested: { key: 'arr', filter: { must: [{ key: 'name', match: { value: 'x' } }] } },
      });
    });
    it('none', () => {
      expect(one({ field: 'arr', operator: '=', value: sub, match: { mode: 'none' } })).toEqual({
        must_not: [
          { nested: { key: 'arr', filter: { must: [{ key: 'name', match: { value: 'x' } }] } } },
        ],
      });
    });
    it('IC subquery', () => {
      const subIC = {
        rules: [
          { field: 'name', operator: '=', value: 'x' },
          'and',
          { field: 'n', operator: '=', value: 1 },
        ],
      } as unknown as RuleGroupType;
      expect(one({ field: 'arr', operator: '=', value: subIC, match: { mode: 'some' } })).toEqual({
        nested: {
          key: 'arr',
          filter: {
            must: [
              { key: 'name', match: { value: 'x' } },
              { key: 'n', match: { value: 1 } },
            ],
          },
        },
      });
    });
    it('direct call w/ partial options', () => {
      const rule: RuleType = { field: 'arr', operator: '=', value: sub, match: { mode: 'some' } };
      const expected = {
        nested: { key: 'arr', filter: { must: [{ key: 'name', match: { value: 'x' } }] } },
      };
      expect(defaultRuleProcessorQdrant(rule)).toEqual(expected);
      expect(defaultRuleProcessorQdrant(rule, { parseNumbers: true })).toEqual(expected);
    });
    it.each<[string, RuleType]>([
      ['all', { field: 'arr', operator: '=', value: sub, match: { mode: 'all' } }],
      [
        'exactly',
        { field: 'arr', operator: '=', value: sub, match: { mode: 'exactly', threshold: 2 } },
      ],
      [
        'invalid threshold',
        { field: 'arr', operator: '=', value: sub, match: { mode: 'atLeast', threshold: -1 } },
      ],
      ['non-group value', { field: 'arr', operator: '=', value: 'x', match: { mode: 'some' } }],
      [
        'element-level rule',
        {
          field: 'arr',
          operator: '=',
          value: q([{ field: '', operator: '=', value: 'x' }]),
          match: { mode: 'some' },
        },
      ],
      ['empty subquery', { field: 'arr', operator: '=', value: q([]), match: { mode: 'some' } }],
    ])('skips %s', (_, rule) => {
      expect(one(rule)).toBeUndefined();
    });
  });
});

describe('groups', () => {
  const a: RuleType = { field: 'a', operator: '=', value: 'x' };
  const b: RuleType = { field: 'b', operator: '=', value: 'y' };
  const ca = { key: 'a', match: { value: 'x' } };
  const cb = { key: 'b', match: { value: 'y' } };

  it('and/or/not', () => {
    expect(formatQuery(q([a, b]), 'qdrant')).toEqual({ must: [ca, cb] });
    expect(formatQuery(q([a, b], { combinator: 'OR' }), 'qdrant')).toEqual({ should: [ca, cb] });
    expect(formatQuery(q([a, b], { not: true }), 'qdrant')).toEqual({
      must_not: [{ must: [ca, cb] }],
    });
    expect(formatQuery(q([a], { not: true }), 'qdrant')).toEqual({ must_not: [ca] });
    expect(formatQuery(q([a, b], { combinator: 'or', not: true }), 'qdrant')).toEqual({
      must_not: [ca, cb],
    });
  });

  it('nesting and empty groups', () => {
    expect(formatQuery(q([a, q([]), q([b], { combinator: 'or' })]), 'qdrant')).toEqual({
      must: [ca, { should: [cb] }],
    });
    expect(formatQuery(q([]), 'qdrant')).toEqual({});
    expect(formatQuery(q([{ field: 'a', operator: 'beginsWith', value: 'x' }]), 'qdrant')).toEqual(
      {}
    );
  });

  it('placeholders', () => {
    expect(
      formatQuery(
        q([
          { field: '~', operator: '=', value: 'x' },
          { field: 'a', operator: '~', value: 'x' },
          { field: 'a', operator: '=', value: '~' },
          a,
        ]),
        { format: 'qdrant', placeholderValueName: '~' }
      )
    ).toEqual({ must: [ca] });
  });

  it('independent combinators', () => {
    expect(formatQuery(queryIC, 'qdrant')).toEqual({
      should: [
        {
          must: [
            { key: 'firstName', match: { value: 'Test' } },
            { key: 'middleName', match: { value: 'Test' } },
          ],
        },
        { key: 'lastName', match: { value: 'Test' } },
      ],
    });
  });
});

describe('validation', () => {
  const f = (k: string) => ({ key: k, match: { value: '' } });
  const results: Record<string, object> = {
    'should invalidate qdrant': {},
    'should invalidate qdrant even if fields are valid': {},
    'should invalidate qdrant rule by validator function': { must: [f('field2')] },
    'should invalidate qdrant rule specified by validationMap': { must: [f('field2')] },
    'should invalidate qdrant outermost group': {},
    'should invalidate qdrant inner group': {},
    'should convert qdrant inner group with no rules to fallbackExpression': { must: [f('field')] },
    'should omit invalid qdrant inner group among valid siblings': {
      must: [f('field'), f('field3')],
    },
    'should invalidate qdrant following combinator of first rule': {
      should: [{ must: [f('field2')] }, f('field3')],
    },
    'should invalidate qdrant preceding combinator of non-first rule': {
      should: [{ must: [f('field')] }, f('field3')],
    },
  };
  for (const vtd of getValidationTestData('qdrant')) {
    it(vtd.title, () => {
      expect(formatQuery(vtd.query, vtd.options)).toEqual(results[vtd.title]);
    });
  }
  for (const vtd of getMuteTestData('qdrant')) {
    it(vtd.title, () => {
      expect(formatQuery(vtd.query, vtd.options)).toEqual(
        results[vtd.title.replace('mute', 'invalidate')]
      );
    });
  }
});

it('ruleProcessor / valueProcessor', () => {
  const custom = { key: 'custom', match: { value: 'custom' } };
  const ruleProcessor: RuleProcessor = (r, o) =>
    r.operator === 'custom_operator' ? custom : defaultRuleProcessorQdrant(r, o);
  const expected = { must: [custom, { key: 'f2', match: { value: 'v2' } }] };
  expect(formatQuery(queryForRuleProcessor, { format: 'qdrant', ruleProcessor })).toEqual(expected);
  expect(
    formatQuery(queryForRuleProcessor, { format: 'qdrant', valueProcessor: ruleProcessor })
  ).toEqual(expected);
  expect(defaultRuleProcessorQdrant({ field: 'f', operator: '=', value: 'x' })).toEqual({
    key: 'f',
    match: { value: 'x' },
  });
});

it('hostile field names and values are inert data', () => {
  const field = `a"}, {"must": [`;
  const value = `x"} OR true`;
  expect(formatQuery(q([{ field, operator: '=', value }]), 'qdrant')).toEqual({
    must: [{ key: field, match: { value } }],
  });
});

it('RAG snapshot', () => {
  expect(
    formatQuery(
      q([
        { field: 'tenant', operator: '=', value: 'acme' },
        { field: 'doc_type', operator: 'in', value: ['pdf', 'html'] },
        { field: 'published', operator: 'between', value: ['2024-01-01', '2024-12-31'] },
        q(
          [
            { field: 'lang', operator: '=', value: 'en' },
            { field: 'score', operator: '>=', value: 0.5 },
          ],
          { combinator: 'or' }
        ),
      ]),
      { format: 'qdrant', fields: [{ name: 'published', label: 'Published', inputType: 'date' }] }
    )
  ).toEqual({
    must: [
      { key: 'tenant', match: { value: 'acme' } },
      { key: 'doc_type', match: { any: ['pdf', 'html'] } },
      { key: 'published', range: { gte: '2024-01-01T00:00:00Z', lte: '2024-12-31T00:00:00Z' } },
      {
        should: [
          { key: 'lang', match: { value: 'en' } },
          { key: 'score', range: { gte: 0.5 } },
        ],
      },
    ],
  });
});
