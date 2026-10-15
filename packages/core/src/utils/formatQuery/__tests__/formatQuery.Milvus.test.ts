import type { FormatQueryOptions, RuleGroupType, RuleProcessor, RuleType } from '../../../types';
import { defaultRuleProcessorMilvus } from '../defaultRuleProcessorMilvus';
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
const one = (rule: RuleType, opts: Omit<FormatQueryOptions, 'format'> = {}) =>
  formatQuery(q([rule]), { ...opts, format: 'milvus' });

describe('operators', () => {
  it.each<[string, RuleType, string]>([
    ['= string', { field: 'f', operator: '=', value: 'a' }, 'f == "a"'],
    ['= numeric string', { field: 'f', operator: '=', value: '3' }, 'f == "3"'],
    ['= number', { field: 'f', operator: '=', value: 3 }, 'f == 3'],
    ['= bigint', { field: 'f', operator: '=', value: 9007199254740993n }, 'f == 9007199254740993'],
    ['= boolean', { field: 'f', operator: '=', value: false }, 'f == false'],
    ['= object', { field: 'f', operator: '=', value: {} }, ''],
    ['!= escaped', { field: 'f', operator: '!=', value: 'a"b\\c' }, 'f != "a\\"b\\\\c"'],
    ['<', { field: 'f', operator: '<', value: '5' }, 'f < 5'],
    ['<=', { field: 'f', operator: '<=', value: 5.5 }, 'f <= 5.5'],
    ['>', { field: 'f', operator: '>', value: 'm' }, 'f > "m"'],
    ['>=', { field: 'f', operator: '>=', value: 5n }, 'f >= 5'],
    ['in', { field: 'f', operator: 'in', value: 'a, b' }, 'f in ["a", "b"]'],
    ['notIn', { field: 'f', operator: 'notIn', value: [1, 'x', true] }, 'f not in [1, "x", true]'],
    ['in invalid member', { field: 'f', operator: 'in', value: [{}] }, ''],
    ['in empty', { field: 'f', operator: 'in', value: [] }, ''],
    ['between', { field: 'f', operator: 'between', value: '5,1' }, '(f >= 1 and f <= 5)'],
    ['notBetween', { field: 'f', operator: 'notBetween', value: [1, 5] }, '(f < 1 or f > 5)'],
    [
      'between strings',
      { field: 'f', operator: 'between', value: ['b', 'a'] },
      '(f >= "b" and f <= "a")',
    ],
    ['between too few', { field: 'f', operator: 'between', value: [1] }, ''],
    ['between invalid', { field: 'f', operator: 'between', value: [1, {}] }, ''],
    ['null', { field: 'f', operator: 'null', value: null }, 'f is null'],
    ['notNull', { field: 'f', operator: 'NotNull', value: null }, 'f is not null'],
    [
      'contains',
      { field: 'f', operator: 'contains', value: '5%_\\"' },
      'f like "%5\\\\%\\\\_\\\\\\\\\\"%"',
    ],
    ['beginsWith', { field: 'f', operator: 'beginsWith', value: 'a' }, 'f like "a%"'],
    ['endsWith', { field: 'f', operator: 'endsWith', value: 'a' }, 'f like "%a"'],
    [
      'doesNotContain',
      { field: 'f', operator: 'doesNotContain', value: 'a' },
      'not (f like "%a%")',
    ],
    [
      'doesNotBeginWith',
      { field: 'f', operator: 'doesNotBeginWith', value: 'a' },
      'not (f like "a%")',
    ],
    ['doesNotEndWith', { field: 'f', operator: 'doesNotEndWith', value: 'a' }, 'not (f like "%a")'],
    ['contains empty', { field: 'f', operator: 'contains', value: '' }, ''],
    ['field =', { field: 'f', operator: '=', value: 'g', valueSource: 'field' }, 'f == g'],
    ['field >', { field: 'f', operator: '>', value: 'g', valueSource: 'field' }, 'f > g'],
    ['field empty', { field: 'f', operator: '>', value: '', valueSource: 'field' }, ''],
    [
      'field between',
      { field: 'f', operator: 'between', value: ['h', 'g'], valueSource: 'field' },
      '(f >= h and f <= g)',
    ],
    ['field in', { field: 'f', operator: 'in', value: ['g'], valueSource: 'field' }, ''],
    ['field contains', { field: 'f', operator: 'contains', value: 'g', valueSource: 'field' }, ''],
    ['unknown op', { field: 'f', operator: 'foo', value: 'a' }, ''],
    [
      'match mode',
      {
        field: 'f',
        operator: '=',
        value: q([{ field: 'g', operator: '=', value: 1 }]),
        match: { mode: 'some' },
      },
      '',
    ],
  ])('%s', (_, rule, expected) => {
    expect(one(rule)).toBe(expected);
  });

  it('preserveValueOrder', () => {
    expect(
      one({ field: 'f', operator: 'between', value: [5, 1] }, { preserveValueOrder: true })
    ).toBe('(f >= 5 and f <= 1)');
  });

  it('parseNumbers', () => {
    expect(one({ field: 'f', operator: '=', value: '3' }, { parseNumbers: true })).toBe('f == 3');
    expect(one({ field: 'f', operator: 'in', value: '1, 2' }, { parseNumbers: 'strict' })).toBe(
      'f in [1, 2]'
    );
  });

  it('boolean editors', () => {
    const fields = [
      { name: 'cb', label: 'cb', valueEditorType: 'checkbox' as const },
      { name: 'sw', label: 'sw', valueEditorType: () => 'switch' as const },
    ];
    expect(one({ field: 'cb', operator: '=', value: 'TRUE' }, { fields })).toBe('cb == true');
    expect(one({ field: 'sw', operator: '!=', value: false }, { fields })).toBe('sw != false');
    expect(one({ field: 'cb', operator: '=', value: 'x' }, { fields })).toBe('');
  });

  it('JSON path field names verbatim', () => {
    expect(one({ field: 'meta["k"]', operator: '=', value: 1 })).toBe('meta["k"] == 1');
  });
});

describe('groups', () => {
  const a: RuleType = { field: 'a', operator: '=', value: 1 };
  const b: RuleType = { field: 'b', operator: '=', value: 2 };

  it('and/or/not/nesting', () => {
    expect(formatQuery(q([a, b]), 'milvus')).toBe('a == 1 and b == 2');
    expect(formatQuery(q([a, b], { combinator: 'OR' }), 'milvus')).toBe('a == 1 or b == 2');
    expect(formatQuery(q([a, b], { not: true }), 'milvus')).toBe('not (a == 1 and b == 2)');
    expect(formatQuery(q([a, q([a, b], { combinator: 'or' }), q([b])]), 'milvus')).toBe(
      'a == 1 and (a == 1 or b == 2) and b == 2'
    );
    expect(formatQuery(q([a, q([b], { not: true })]), 'milvus')).toBe('a == 1 and not (b == 2)');
    expect(formatQuery(q([a, q([])]), 'milvus')).toBe('a == 1');
    expect(formatQuery(q([]), 'milvus')).toBe('');
    expect(formatQuery(q([]), { format: 'milvus', fallbackExpression: 'id > 0' })).toBe('id > 0');
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
        { format: 'milvus', placeholderValueName: '~' }
      )
    ).toBe('a == 1');
  });

  it('independent combinators', () => {
    expect(formatQuery(queryIC, 'milvus')).toBe(
      '(firstName == "Test" and middleName == "Test") or lastName == "Test"'
    );
  });
});

describe('validation', () => {
  const results: Record<string, string> = {
    'should invalidate milvus': '',
    'should invalidate milvus even if fields are valid': '',
    'should invalidate milvus rule by validator function': 'field2 == ""',
    'should invalidate milvus rule specified by validationMap': 'field2 == ""',
    'should invalidate milvus outermost group': '',
    'should invalidate milvus inner group': '',
    'should convert milvus inner group with no rules to fallbackExpression': 'field == ""',
    'should omit invalid milvus inner group among valid siblings': 'field == "" and field3 == ""',
    'should invalidate milvus following combinator of first rule': 'field2 == "" or field3 == ""',
    'should invalidate milvus preceding combinator of non-first rule':
      'field == "" or field3 == ""',
  };
  for (const vtd of getValidationTestData('milvus')) {
    it(vtd.title, () => {
      expect(formatQuery(vtd.query, vtd.options)).toBe(results[vtd.title]);
    });
  }
  for (const vtd of getMuteTestData('milvus')) {
    it(vtd.title, () => {
      expect(formatQuery(vtd.query, vtd.options)).toBe(
        results[vtd.title.replace('mute', 'invalidate')]
      );
    });
  }
});

it('ruleProcessor / valueProcessor', () => {
  const ruleProcessor: RuleProcessor = (r, o) =>
    r.operator === 'custom_operator' ? 'custom' : defaultRuleProcessorMilvus(r, o);
  const expected = 'custom and f2 == "v2"';
  expect(formatQuery(queryForRuleProcessor, { format: 'milvus', ruleProcessor })).toBe(expected);
  expect(
    formatQuery(queryForRuleProcessor, { format: 'milvus', valueProcessor: ruleProcessor })
  ).toBe(expected);
  expect(defaultRuleProcessorMilvus({ field: 'f', operator: '=', value: 'x' })).toBe('f == "x"');
});

it('hostile values are escaped', () => {
  expect(one({ field: 'f', operator: '=', value: '" or 1 == 1 or "' })).toBe(
    'f == "\\" or 1 == 1 or \\""'
  );
});

it('RAG snapshot', () => {
  expect(
    formatQuery(
      q([
        { field: 'tenant', operator: '=', value: 'acme' },
        { field: 'doc_type', operator: 'in', value: ['pdf', 'html'] },
        { field: 'published', operator: 'between', value: [1704067200000, 1735603200000] },
        q(
          [
            { field: 'lang', operator: '=', value: 'en' },
            { field: 'score', operator: '>=', value: 0.5 },
          ],
          { combinator: 'or' }
        ),
      ]),
      'milvus'
    )
  ).toBe(
    'tenant == "acme" and doc_type in ["pdf", "html"] and (published >= 1704067200000 and published <= 1735603200000) and (lang == "en" or score >= 0.5)'
  );
});
