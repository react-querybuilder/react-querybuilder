import type {
  FormatQueryOptions,
  RuleGroupType,
  RuleGroupTypeAny,
  RuleProcessor,
  RuleType,
} from '../../../types';
import { defaultRuleProcessorChroma } from '../defaultRuleProcessorChroma';
import { defaultRuleProcessorPinecone } from '../defaultRuleProcessorPinecone';
import { formatQuery as fqAny } from '../formatQuery';
import {
  getMuteTestData,
  getValidationTestData,
  queryForRuleProcessor,
  queryIC,
} from '../formatQueryTestUtils';

type Fmt = 'pinecone' | 'chroma';
// Union format arg doesn't match any single overload
const formatQuery = fqAny as (
  q: RuleGroupTypeAny,
  o: Fmt | FormatQueryOptions
) => Record<string, unknown>;
const q = (rules: RuleGroupType['rules'], extra: Partial<RuleGroupType> = {}): RuleGroupType => ({
  combinator: 'and',
  rules,
  ...extra,
});
const one = (format: Fmt, rule: RuleType, opts: Omit<FormatQueryOptions, 'format'> = {}) => {
  const out = formatQuery(q([rule]), { ...opts, format });
  return Object.keys(out).length === 0 ? undefined : out;
};

// [title, rule, pinecone, chroma] (`same` = chroma equals pinecone)
const same = Symbol('same');
const opCases: [string, RuleType, unknown, unknown][] = [
  ['= string', { field: 'f', operator: '=', value: 'a' }, { f: { $eq: 'a' } }, same],
  ['= boolean', { field: 'f', operator: '=', value: false }, { f: { $eq: false } }, same],
  ['= bigint', { field: 'f', operator: '=', value: 7n }, { f: { $eq: 7 } }, same],
  ['= numeric string', { field: 'f', operator: '=', value: '3' }, { f: { $eq: '3' } }, same],
  ['= object', { field: 'f', operator: '=', value: {} }, undefined, same],
  ['!=', { field: 'f', operator: '!=', value: 1.5 }, { f: { $ne: 1.5 } }, same],
  ['<', { field: 'f', operator: '<', value: '5' }, { f: { $lt: 5 } }, same],
  ['<=', { field: 'f', operator: '<=', value: 5 }, { f: { $lte: 5 } }, same],
  ['>', { field: 'f', operator: '>', value: 5n }, { f: { $gt: 5 } }, same],
  ['>=', { field: 'f', operator: '>=', value: '5.5' }, { f: { $gte: 5.5 } }, same],
  ['> non-numeric', { field: 'f', operator: '>', value: 'abc' }, undefined, same],
  ['in strings', { field: 'f', operator: 'in', value: 'a, b' }, { f: { $in: ['a', 'b'] } }, same],
  ['notIn ints', { field: 'f', operator: 'notIn', value: [1, 2] }, { f: { $nin: [1, 2] } }, same],
  [
    'in mixed string/number',
    { field: 'f', operator: 'in', value: ['a', 1] },
    { f: { $in: ['a', 1] } },
    undefined,
  ],
  [
    'in int/float',
    { field: 'f', operator: 'in', value: [1, 1.5] },
    { f: { $in: [1, 1.5] } },
    undefined,
  ],
  [
    'in booleans',
    { field: 'f', operator: 'in', value: [true, false] },
    undefined,
    { f: { $in: [true, false] } },
  ],
  ['in invalid member', { field: 'f', operator: 'in', value: ['a', {}] }, undefined, same],
  ['in empty', { field: 'f', operator: 'in', value: [] }, undefined, same],
  [
    'between',
    { field: 'f', operator: 'between', value: '5,1' },
    { f: { $gte: 1, $lte: 5 } },
    { $and: [{ f: { $gte: 1 } }, { f: { $lte: 5 } }] },
  ],
  [
    'notBetween',
    { field: 'f', operator: 'notBetween', value: [1, 5] },
    { $or: [{ f: { $lt: 1 } }, { f: { $gt: 5 } }] },
    same,
  ],
  ['between too few', { field: 'f', operator: 'between', value: [1] }, undefined, same],
  ['between non-numeric', { field: 'f', operator: 'between', value: ['a', 1] }, undefined, same],
  ['null', { field: 'f', operator: 'null', value: null }, { f: { $exists: false } }, undefined],
  [
    'notNull',
    { field: 'f', operator: 'NotNull', value: null },
    { f: { $exists: true } },
    undefined,
  ],
  ['contains', { field: 'f', operator: 'contains', value: 'a' }, undefined, same],
  ['beginsWith', { field: 'f', operator: 'beginsWith', value: 'a' }, undefined, same],
  [
    'valueSource field',
    { field: 'f', operator: '=', value: 'g', valueSource: 'field' },
    undefined,
    same,
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
    same,
  ],
];

describe.each(['pinecone', 'chroma'] as const)('%s', format => {
  const rp = format === 'pinecone' ? defaultRuleProcessorPinecone : defaultRuleProcessorChroma;

  it.each(opCases)('%s', (_, rule, pinecone, chroma) => {
    const expected = format === 'pinecone' || chroma === same ? pinecone : chroma;
    expect(one(format, rule)).toEqual(expected);
  });

  it('preserveValueOrder', () => {
    expect(
      one(
        format,
        { field: 'f', operator: 'notBetween', value: [5, 1] },
        { preserveValueOrder: true }
      )
    ).toEqual({ $or: [{ f: { $lt: 5 } }, { f: { $gt: 1 } }] });
  });

  it('parseNumbers', () => {
    expect(one(format, { field: 'f', operator: '=', value: '3' }, { parseNumbers: true })).toEqual({
      f: { $eq: 3 },
    });
    expect(
      one(format, { field: 'f', operator: 'in', value: '1, 2' }, { parseNumbers: 'strict' })
    ).toEqual({ f: { $in: [1, 2] } });
  });

  it('boolean editors', () => {
    const fields = [
      { name: 'cb', label: 'cb', valueEditorType: 'checkbox' as const },
      { name: 'sw', label: 'sw', valueEditorType: () => 'switch' as const },
    ];
    expect(one(format, { field: 'cb', operator: '=', value: 'TRUE' }, { fields })).toEqual({
      cb: { $eq: true },
    });
    expect(one(format, { field: 'sw', operator: '!=', value: false }, { fields })).toEqual({
      sw: { $ne: false },
    });
    expect(one(format, { field: 'cb', operator: '=', value: 'x' }, { fields })).toBeUndefined();
  });

  describe('groups', () => {
    const a: RuleType = { field: 'a', operator: '=', value: 'x' };
    const b: RuleType = { field: 'b', operator: '>', value: 1 };
    const ca = { a: { $eq: 'x' } };
    const cb = { b: { $gt: 1 } };

    it('and/or, unwrap, nesting, empty', () => {
      expect(formatQuery(q([a, b]), format)).toEqual({ $and: [ca, cb] });
      expect(formatQuery(q([a, b], { combinator: 'OR' }), format)).toEqual({ $or: [ca, cb] });
      expect(formatQuery(q([a, q([]), q([b])]), format)).toEqual({ $and: [ca, cb] });
      expect(formatQuery(q([a]), format)).toEqual(ca);
      expect(formatQuery(q([]), format)).toEqual({});
      expect(formatQuery(q([{ ...a, operator: 'contains' }]), format)).toEqual({});
    });

    it('not (De Morgan)', () => {
      expect(formatQuery(q([a, b], { not: true }), format)).toEqual({
        $or: [{ a: { $ne: 'x' } }, { b: { $lte: 1 } }],
      });
      expect(
        formatQuery(q([a, q([b], { combinator: 'or', not: true })], { not: true }), format)
      ).toEqual({ $or: [{ a: { $ne: 'x' } }, cb] });
      // Negated op unsupported → dropped
      expect(
        formatQuery(
          q([a, { field: 'c', operator: 'doesNotContain', value: 'y' }], { not: true }),
          format
        )
      ).toEqual({ a: { $ne: 'x' } });
      expect(formatQuery(q([a], { combinator: 'xor', not: true }), format)).toEqual({});
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
          { format, placeholderValueName: '~' }
        )
      ).toEqual(ca);
    });

    it('independent combinators', () => {
      expect(formatQuery(queryIC, format)).toEqual({
        $or: [
          { $and: [{ firstName: { $eq: 'Test' } }, { middleName: { $eq: 'Test' } }] },
          { lastName: { $eq: 'Test' } },
        ],
      });
    });
  });

  describe('validation', () => {
    const f = (k: string) => ({ [k]: { $eq: '' } });
    const results: Record<string, object> = {
      [`should invalidate ${format}`]: {},
      [`should invalidate ${format} even if fields are valid`]: {},
      [`should invalidate ${format} rule by validator function`]: f('field2'),
      [`should invalidate ${format} rule specified by validationMap`]: f('field2'),
      [`should invalidate ${format} outermost group`]: {},
      [`should invalidate ${format} inner group`]: {},
      [`should convert ${format} inner group with no rules to fallbackExpression`]: f('field'),
      [`should omit invalid ${format} inner group among valid siblings`]: {
        $and: [f('field'), f('field3')],
      },
      [`should invalidate ${format} following combinator of first rule`]: {
        $or: [f('field2'), f('field3')],
      },
      [`should invalidate ${format} preceding combinator of non-first rule`]: {
        $or: [f('field'), f('field3')],
      },
    };
    for (const vtd of getValidationTestData(format)) {
      it(vtd.title, () => {
        expect(formatQuery(vtd.query, vtd.options)).toEqual(results[vtd.title]);
      });
    }
    for (const vtd of getMuteTestData(format)) {
      it(vtd.title, () => {
        expect(formatQuery(vtd.query, vtd.options)).toEqual(
          results[vtd.title.replace('mute', 'invalidate')]
        );
      });
    }
  });

  it('ruleProcessor / valueProcessor', () => {
    const custom = { custom: { $eq: 'custom' } };
    const ruleProcessor: RuleProcessor = (r, o) =>
      r.operator === 'custom_operator' ? custom : rp(r, o);
    const expected = { $and: [custom, { f2: { $eq: 'v2' } }] };
    expect(formatQuery(queryForRuleProcessor, { format, ruleProcessor })).toEqual(expected);
    expect(formatQuery(queryForRuleProcessor, { format, valueProcessor: ruleProcessor })).toEqual(
      expected
    );
    expect(rp({ field: 'f', operator: '=', value: 'x' })).toEqual({ f: { $eq: 'x' } });
  });

  it('hostile field names and values are inert data', () => {
    const field = `a"}, {"$or": [`;
    const value = `x"} OR true`;
    expect(formatQuery(q([{ field, operator: '=', value }]), format)).toEqual({
      [field]: { $eq: value },
    });
  });
});

it('RAG snapshot', () => {
  const query = q([
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
  ]);
  const common = [{ tenant: { $eq: 'acme' } }, { doc_type: { $in: ['pdf', 'html'] } }];
  const or = { $or: [{ lang: { $eq: 'en' } }, { score: { $gte: 0.5 } }] };
  expect(formatQuery(query, 'pinecone')).toEqual({
    $and: [...common, { published: { $gte: 1704067200000, $lte: 1735603200000 } }, or],
  });
  expect(formatQuery(query, 'chroma')).toEqual({
    $and: [
      ...common,
      { $and: [{ published: { $gte: 1704067200000 } }, { published: { $lte: 1735603200000 } }] },
      or,
    ],
  });
});
