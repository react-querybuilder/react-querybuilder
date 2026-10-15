import type { FormatQueryOptions, RuleGroupType, RuleProcessor, RuleType } from '../../../types';
import { defaultRuleProcessorWeaviate } from '../defaultRuleProcessorWeaviate';
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
const one = (rule: RuleType, opts: Omit<FormatQueryOptions, 'format'> = {}) => {
  const out = formatQuery(q([rule]), { ...opts, format: 'weaviate' });
  return Object.keys(out).length === 0 ? undefined : out;
};
const p = ['f'];

describe('operators', () => {
  it.each<[string, RuleType, unknown]>([
    [
      '= text',
      { field: 'f', operator: '=', value: 'a' },
      { operator: 'Equal', path: p, valueText: 'a' },
    ],
    [
      '= numeric string',
      { field: 'f', operator: '=', value: '3' },
      { operator: 'Equal', path: p, valueText: '3' },
    ],
    ['= int', { field: 'f', operator: '=', value: 3 }, { operator: 'Equal', path: p, valueInt: 3 }],
    [
      '= bigint',
      { field: 'f', operator: '=', value: 3n },
      { operator: 'Equal', path: p, valueInt: 3 },
    ],
    [
      '!= float',
      { field: 'f', operator: '!=', value: 1.5 },
      { operator: 'NotEqual', path: p, valueNumber: 1.5 },
    ],
    [
      '= boolean',
      { field: 'f', operator: '=', value: true },
      { operator: 'Equal', path: p, valueBoolean: true },
    ],
    ['= object', { field: 'f', operator: '=', value: {} }, undefined],
    [
      '<',
      { field: 'f', operator: '<', value: '5' },
      { operator: 'LessThan', path: p, valueInt: 5 },
    ],
    [
      '<=',
      { field: 'f', operator: '<=', value: 5.5 },
      { operator: 'LessThanEqual', path: p, valueNumber: 5.5 },
    ],
    [
      '>',
      { field: 'f', operator: '>', value: 'm' },
      { operator: 'GreaterThan', path: p, valueText: 'm' },
    ],
    [
      '>=',
      { field: 'f', operator: '>=', value: 5 },
      { operator: 'GreaterThanEqual', path: p, valueInt: 5 },
    ],
    [
      'contains',
      { field: 'f', operator: 'contains', value: 'a*?' },
      { operator: 'Like', path: p, valueText: '*a*?*' },
    ],
    [
      'beginsWith',
      { field: 'f', operator: 'beginsWith', value: 'a' },
      { operator: 'Like', path: p, valueText: 'a*' },
    ],
    [
      'endsWith',
      { field: 'f', operator: 'endsWith', value: 'a' },
      { operator: 'Like', path: p, valueText: '*a' },
    ],
    [
      'doesNotContain',
      { field: 'f', operator: 'doesNotContain', value: 'a' },
      { operator: 'Not', operands: [{ operator: 'Like', path: p, valueText: '*a*' }] },
    ],
    [
      'doesNotBeginWith',
      { field: 'f', operator: 'doesNotBeginWith', value: 'a' },
      { operator: 'Not', operands: [{ operator: 'Like', path: p, valueText: 'a*' }] },
    ],
    [
      'doesNotEndWith',
      { field: 'f', operator: 'doesNotEndWith', value: 'a' },
      { operator: 'Not', operands: [{ operator: 'Like', path: p, valueText: '*a' }] },
    ],
    ['contains empty', { field: 'f', operator: 'contains', value: '' }, undefined],
    ['contains non-string', { field: 'f', operator: 'contains', value: 1 }, undefined],
    [
      'in text',
      { field: 'f', operator: 'in', value: 'a, b' },
      { operator: 'ContainsAny', path: p, valueText: ['a', 'b'] },
    ],
    [
      'notIn ints',
      { field: 'f', operator: 'notIn', value: [1, 2] },
      { operator: 'ContainsNone', path: p, valueInt: [1, 2] },
    ],
    [
      'in int/float',
      { field: 'f', operator: 'in', value: [1, 1.5] },
      { operator: 'ContainsAny', path: p, valueNumber: [1, 1.5] },
    ],
    [
      'in booleans',
      { field: 'f', operator: 'in', value: [true] },
      { operator: 'ContainsAny', path: p, valueBoolean: [true] },
    ],
    ['in mixed', { field: 'f', operator: 'in', value: ['a', 1] }, undefined],
    ['in invalid member', { field: 'f', operator: 'in', value: [{}] }, undefined],
    ['in empty', { field: 'f', operator: 'in', value: [] }, undefined],
    [
      'between',
      { field: 'f', operator: 'between', value: '5,1' },
      {
        operator: 'And',
        operands: [
          { operator: 'GreaterThanEqual', path: p, valueInt: 1 },
          { operator: 'LessThanEqual', path: p, valueInt: 5 },
        ],
      },
    ],
    [
      'notBetween',
      { field: 'f', operator: 'notBetween', value: [1, 5.5] },
      {
        operator: 'Or',
        operands: [
          { operator: 'LessThan', path: p, valueInt: 1 },
          { operator: 'GreaterThan', path: p, valueNumber: 5.5 },
        ],
      },
    ],
    ['between too few', { field: 'f', operator: 'between', value: [1] }, undefined],
    ['between text', { field: 'f', operator: 'between', value: ['a', 1] }, undefined],
    ['between boolean', { field: 'f', operator: 'between', value: [1, true] }, undefined],
    ['between object', { field: 'f', operator: 'between', value: [1, {}] }, undefined],
    [
      'null',
      { field: 'f', operator: 'null', value: null },
      { operator: 'IsNull', path: p, valueBoolean: true },
    ],
    [
      'notNull',
      { field: 'f', operator: 'NOTNULL', value: null },
      { operator: 'IsNull', path: p, valueBoolean: false },
    ],
    [
      'valueSource field',
      { field: 'f', operator: '=', value: 'g', valueSource: 'field' },
      undefined,
    ],
    [
      'match mode',
      {
        field: 'f',
        operator: '=',
        value: q([{ field: 'g', operator: '=', value: 1 }]),
        match: { mode: 'some' },
      },
      undefined,
    ],
  ])('%s', (_, rule, expected) => {
    expect(one(rule)).toEqual(expected);
  });

  it('preserveValueOrder', () => {
    expect(
      one({ field: 'f', operator: 'between', value: [5, 1] }, { preserveValueOrder: true })
    ).toEqual({
      operator: 'And',
      operands: [
        { operator: 'GreaterThanEqual', path: p, valueInt: 5 },
        { operator: 'LessThanEqual', path: p, valueInt: 1 },
      ],
    });
  });

  it('parseNumbers / numeric inputType', () => {
    expect(one({ field: 'f', operator: '=', value: '3' }, { parseNumbers: true })).toEqual({
      operator: 'Equal',
      path: p,
      valueInt: 3,
    });
    expect(
      one(
        { field: 'f', operator: 'in', value: '1, 2.5' },
        { fields: [{ name: 'f', label: 'f', inputType: 'number' }] }
      )
    ).toEqual({ operator: 'ContainsAny', path: p, valueNumber: [1, 2.5] });
  });

  it('fieldIdentifierSeparator → path', () => {
    expect(
      one(
        { field: 'inPub.Publication.name', operator: '=', value: 'x' },
        { fieldIdentifierSeparator: '.' }
      )
    ).toEqual({ operator: 'Equal', path: ['inPub', 'Publication', 'name'], valueText: 'x' });
  });

  it('boolean editors', () => {
    const fields = [
      { name: 'cb', label: 'cb', valueEditorType: 'checkbox' as const },
      { name: 'sw', label: 'sw', valueEditorType: () => 'switch' as const },
    ];
    expect(one({ field: 'cb', operator: '=', value: 'true' }, { fields })).toEqual({
      operator: 'Equal',
      path: ['cb'],
      valueBoolean: true,
    });
    expect(one({ field: 'sw', operator: 'in', value: [false] }, { fields })).toEqual({
      operator: 'ContainsAny',
      path: ['sw'],
      valueBoolean: [false],
    });
    expect(one({ field: 'cb', operator: '=', value: 'x' }, { fields })).toBeUndefined();
  });

  it('dates', () => {
    const fields = [{ name: 'd', label: 'd', inputType: 'date' }];
    const d = ['d'];
    expect(one({ field: 'd', operator: '>', value: '2024-01-02' }, { fields })).toEqual({
      operator: 'GreaterThan',
      path: d,
      valueDate: '2024-01-02T00:00:00Z',
    });
    expect(one({ field: 'd', operator: '=', value: 'nope' }, { fields })).toBeUndefined();
    expect(
      one({ field: 'd', operator: 'between', value: ['2024-12-31', '2024-01-01'] }, { fields })
    ).toEqual({
      operator: 'And',
      operands: [
        { operator: 'GreaterThanEqual', path: d, valueDate: '2024-01-01T00:00:00Z' },
        { operator: 'LessThanEqual', path: d, valueDate: '2024-12-31T00:00:00Z' },
      ],
    });
    expect(one({ field: 'd', operator: 'in', value: ['2024-01-01'] }, { fields })).toEqual({
      operator: 'ContainsAny',
      path: d,
      valueDate: ['2024-01-01T00:00:00Z'],
    });
  });
});

describe('groups', () => {
  const a: RuleType = { field: 'a', operator: '=', value: 'x' };
  const b: RuleType = { field: 'b', operator: '=', value: 'y' };
  const ca = { operator: 'Equal', path: ['a'], valueText: 'x' };
  const cb = { operator: 'Equal', path: ['b'], valueText: 'y' };

  it('and/or/not', () => {
    expect(formatQuery(q([a, b]), 'weaviate')).toEqual({ operator: 'And', operands: [ca, cb] });
    expect(formatQuery(q([a, b], { combinator: 'OR' }), 'weaviate')).toEqual({
      operator: 'Or',
      operands: [ca, cb],
    });
    expect(formatQuery(q([a, b], { not: true }), 'weaviate')).toEqual({
      operator: 'Not',
      operands: [{ operator: 'And', operands: [ca, cb] }],
    });
    expect(formatQuery(q([a], { not: true }), 'weaviate')).toEqual({
      operator: 'Not',
      operands: [ca],
    });
  });

  it('nesting, unwrap, empty', () => {
    expect(formatQuery(q([a, q([]), q([b], { combinator: 'or' })]), 'weaviate')).toEqual({
      operator: 'And',
      operands: [ca, cb],
    });
    expect(formatQuery(q([a]), 'weaviate')).toEqual(ca);
    expect(formatQuery(q([]), 'weaviate')).toEqual({});
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
        { format: 'weaviate', placeholderValueName: '~' }
      )
    ).toEqual(ca);
  });

  it('independent combinators', () => {
    const e = (f: string) => ({ operator: 'Equal', path: [f], valueText: 'Test' });
    expect(formatQuery(queryIC, 'weaviate')).toEqual({
      operator: 'Or',
      operands: [{ operator: 'And', operands: [e('firstName'), e('middleName')] }, e('lastName')],
    });
  });
});

describe('validation', () => {
  const f = (k: string) => ({ operator: 'Equal', path: [k], valueText: '' });
  const results: Record<string, object> = {
    'should invalidate weaviate': {},
    'should invalidate weaviate even if fields are valid': {},
    'should invalidate weaviate rule by validator function': f('field2'),
    'should invalidate weaviate rule specified by validationMap': f('field2'),
    'should invalidate weaviate outermost group': {},
    'should invalidate weaviate inner group': {},
    'should convert weaviate inner group with no rules to fallbackExpression': f('field'),
    'should omit invalid weaviate inner group among valid siblings': {
      operator: 'And',
      operands: [f('field'), f('field3')],
    },
    'should invalidate weaviate following combinator of first rule': {
      operator: 'Or',
      operands: [f('field2'), f('field3')],
    },
    'should invalidate weaviate preceding combinator of non-first rule': {
      operator: 'Or',
      operands: [f('field'), f('field3')],
    },
  };
  for (const vtd of getValidationTestData('weaviate')) {
    it(vtd.title, () => {
      expect(formatQuery(vtd.query, vtd.options)).toEqual(results[vtd.title]);
    });
  }
  for (const vtd of getMuteTestData('weaviate')) {
    it(vtd.title, () => {
      expect(formatQuery(vtd.query, vtd.options)).toEqual(
        results[vtd.title.replace('mute', 'invalidate')]
      );
    });
  }
});

it('ruleProcessor / valueProcessor', () => {
  const custom = { operator: 'Equal', path: ['custom'], valueText: 'custom' };
  const ruleProcessor: RuleProcessor = (r, o) =>
    r.operator === 'custom_operator' ? custom : defaultRuleProcessorWeaviate(r, o);
  const expected = {
    operator: 'And',
    operands: [custom, { operator: 'Equal', path: ['f2'], valueText: 'v2' }],
  };
  expect(formatQuery(queryForRuleProcessor, { format: 'weaviate', ruleProcessor })).toEqual(
    expected
  );
  expect(
    formatQuery(queryForRuleProcessor, { format: 'weaviate', valueProcessor: ruleProcessor })
  ).toEqual(expected);
  expect(defaultRuleProcessorWeaviate({ field: 'f', operator: '=', value: 'x' })).toEqual({
    operator: 'Equal',
    path: p,
    valueText: 'x',
  });
});

it('hostile field names and values are inert data', () => {
  const field = `a"}, {operator: Or`;
  const value = `x"} OR true`;
  expect(formatQuery(q([{ field, operator: '=', value }]), 'weaviate')).toEqual({
    operator: 'Equal',
    path: [field],
    valueText: value,
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
      { format: 'weaviate', fields: [{ name: 'published', label: 'Published', inputType: 'date' }] }
    )
  ).toEqual({
    operator: 'And',
    operands: [
      { operator: 'Equal', path: ['tenant'], valueText: 'acme' },
      { operator: 'ContainsAny', path: ['doc_type'], valueText: ['pdf', 'html'] },
      {
        operator: 'And',
        operands: [
          { operator: 'GreaterThanEqual', path: ['published'], valueDate: '2024-01-01T00:00:00Z' },
          { operator: 'LessThanEqual', path: ['published'], valueDate: '2024-12-31T00:00:00Z' },
        ],
      },
      {
        operator: 'Or',
        operands: [
          { operator: 'Equal', path: ['lang'], valueText: 'en' },
          { operator: 'GreaterThanEqual', path: ['score'], valueNumber: 0.5 },
        ],
      },
    ],
  });
});
