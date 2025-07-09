import type { DefaultRuleGroupType, FullField, OptionGroup, ValueSources } from '../../types';
import { toFullOption } from '../optGroupUtils';
import { parseMongoDB } from './parseMongoDB';

const emptyRuleGroup: DefaultRuleGroupType = { combinator: 'and', rules: [] };

describe('valueSource: "value"', () => {
  it('handles basic boolean operations', () => {
    expect(
      parseMongoDB({
        $or: [
          { f1: null },
          { f1: { $ne: null } },
          { f1: { $not: { $eq: 'Test' } } },
          { $not: { f1: 'Test' } },
          { $not: { f1: { $eq: 'Test' } } },
          { f1: 'Test' },
          { f1: 'Test', f2: 'Test2' },
          { f1: { $eq: 'Test' } },
          { f1: { $ne: 'Test' } },
          { f1: { $gt: 1214 } },
          { f1: { $gte: 1214 } },
          { f1: { $lt: 1214 } },
          { f1: { $lte: 1214 } },
          { f1: { $gt: 'Test', $lt: 'Test2' } },
          { f1: { $gt: 12, $lt: 14 } },
          { f1: { $gt: true, $lt: false } },
          { f1: { $gte: 'Test', $lte: 'Test2' } },
          { f1: { $gte: 12, $lte: 14 } },
          { f1: { $gte: true, $lte: false } },
          { f1: { $gte: 12, $lt: 14 } },
          { $expr: { $eq: ['$f1', 'Test'] } },
        ],
      })
    ).toEqual({
      combinator: 'or',
      rules: [
        { field: 'f1', operator: 'null', value: null },
        { field: 'f1', operator: 'notNull', value: null },
        { field: 'f1', operator: '!=', value: 'Test' },
        { field: 'f1', operator: '!=', value: 'Test' },
        { field: 'f1', operator: '!=', value: 'Test' },
        { field: 'f1', operator: '=', value: 'Test' },
        {
          combinator: 'and',
          rules: [
            { field: 'f1', operator: '=', value: 'Test' },
            { field: 'f2', operator: '=', value: 'Test2' },
          ],
        },
        { field: 'f1', operator: '=', value: 'Test' },
        { field: 'f1', operator: '!=', value: 'Test' },
        { field: 'f1', operator: '>', value: 1214 },
        { field: 'f1', operator: '>=', value: 1214 },
        { field: 'f1', operator: '<', value: 1214 },
        { field: 'f1', operator: '<=', value: 1214 },
        {
          combinator: 'and',
          rules: [
            { field: 'f1', operator: '>', value: 'Test' },
            { field: 'f1', operator: '<', value: 'Test2' },
          ],
        },
        {
          combinator: 'and',
          rules: [
            { field: 'f1', operator: '>', value: 12 },
            { field: 'f1', operator: '<', value: 14 },
          ],
        },
        {
          combinator: 'and',
          rules: [
            { field: 'f1', operator: '>', value: true },
            { field: 'f1', operator: '<', value: false },
          ],
        },
        { field: 'f1', operator: 'between', value: 'Test,Test2' },
        { field: 'f1', operator: 'between', value: '12,14' },
        { field: 'f1', operator: 'between', value: 'true,false' },
        {
          combinator: 'and',
          rules: [
            { field: 'f1', operator: '>=', value: 12 },
            { field: 'f1', operator: '<', value: 14 },
          ],
        },
        { field: 'f1', operator: '=', value: 'Test' },
      ],
    });
  });

  it('handles substring operations', () => {
    expect(
      parseMongoDB({
        $or: [
          { f1: { $regex: '^Test' } },
          { f1: { $regex: 'Test$' } },
          { f1: { $regex: 'Test' } },
          { f1: { $regex: 'T' } },
          { f1: { $regex: /^Test/ } },
          { f1: { $regex: /Test$/ } },
          { f1: { $regex: /Test/ } },
          { f1: { $not: { $regex: '^Test' } } },
          { f1: { $not: { $regex: 'Test$' } } },
          { f1: { $not: { $regex: 'Test' } } },
          { $not: { f1: { $regex: '^Test' } } },
          { $not: { f1: { $regex: 'Test$' } } },
          { $not: { f1: { $regex: 'Test' } } },
        ],
      })
    ).toEqual({
      combinator: 'or',
      rules: [
        { field: 'f1', operator: 'beginsWith', value: 'Test' },
        { field: 'f1', operator: 'endsWith', value: 'Test' },
        { field: 'f1', operator: 'contains', value: 'Test' },
        { field: 'f1', operator: 'contains', value: 'T' },
        { field: 'f1', operator: 'beginsWith', value: 'Test' },
        { field: 'f1', operator: 'endsWith', value: 'Test' },
        { field: 'f1', operator: 'contains', value: 'Test' },
        { field: 'f1', operator: 'doesNotBeginWith', value: 'Test' },
        { field: 'f1', operator: 'doesNotEndWith', value: 'Test' },
        { field: 'f1', operator: 'doesNotContain', value: 'Test' },
        { field: 'f1', operator: 'doesNotBeginWith', value: 'Test' },
        { field: 'f1', operator: 'doesNotEndWith', value: 'Test' },
        { field: 'f1', operator: 'doesNotContain', value: 'Test' },
      ],
    });
  });

  it('handles "between" and "in" operations', () => {
    expect(
      parseMongoDB({
        $or: [
          { $and: [{ f1: { $gte: 'Test' } }, { f1: { $lte: 'Test2' } }] },
          { $and: [{ f1: { $gte: 'Test,Comma' } }, { f1: { $lte: 'Test2' } }] },
          { $and: [{ f1: { $gte: 12 } }, { f1: { $lte: 14 } }] },
          { $and: [{ f1: { $lte: 14 } }, { f1: { $gte: 12 } }] },
          { $and: [{ f1: { $gte: false } }, { f1: { $lte: true } }] },
          { $and: [{ f1: { $gte: 14 } }, { f1: { $lte: 12 } }] },
          { f1: { $gte: 'Test', $lte: 'Test2' } },
          { f1: { $gte: 12, $lte: 14 } },
          { f1: { $gte: false, $lte: true } },
          { $or: [{ f1: { $lt: 'Test' } }, { f1: { $gt: 'Test2' } }] },
          { $or: [{ f1: { $lt: 12 } }, { f1: { $gt: 14 } }] },
          { $or: [{ f1: { $gt: 14 } }, { f1: { $lt: 12 } }] },
          { $or: [{ f1: { $lt: false } }, { f1: { $gt: true } }] },
          { $or: [{ f1: { $lt: 14 } }, { f1: { $gt: 12 } }] },
          { $not: { f1: { $gte: 'Test', $lte: 'Test2' } } },
          { $not: { f1: { $gte: 12, $lte: 14 } } },
          { $not: { f1: { $gte: false, $lte: true } } },
          { f1: { $in: ['Test', 'Test2'] } },
          { f1: { $in: ['Te,st', 'Test2'] } },
          { f1: { $in: [12, 14] } },
          { f1: { $in: [true, false] } },
          { f1: { $nin: ['Test', 'Test2'] } },
          { f1: { $nin: [12, 14] } },
          { f1: { $nin: [true, false] } },
          { f1: { $not: { $gt: 14, $gte: 12 } } },
        ],
      })
    ).toEqual({
      combinator: 'or',
      rules: [
        { field: 'f1', operator: 'between', value: 'Test,Test2' },
        { field: 'f1', operator: 'between', value: String.raw`Test\,Comma,Test2` },
        { field: 'f1', operator: 'between', value: '12,14' },
        { field: 'f1', operator: 'between', value: '12,14' },
        { field: 'f1', operator: 'between', value: 'false,true' },
        {
          combinator: 'and',
          rules: [
            { field: 'f1', operator: '>=', value: 14 },
            { field: 'f1', operator: '<=', value: 12 },
          ],
        },
        { field: 'f1', operator: 'between', value: 'Test,Test2' },
        { field: 'f1', operator: 'between', value: '12,14' },
        { field: 'f1', operator: 'between', value: 'false,true' },
        { field: 'f1', operator: 'notBetween', value: 'Test,Test2' },
        { field: 'f1', operator: 'notBetween', value: '12,14' },
        { field: 'f1', operator: 'notBetween', value: '12,14' },
        { field: 'f1', operator: 'notBetween', value: 'false,true' },
        {
          combinator: 'or',
          rules: [
            { field: 'f1', operator: '<', value: 14 },
            { field: 'f1', operator: '>', value: 12 },
          ],
        },
        { field: 'f1', operator: 'notBetween', value: 'Test,Test2' },
        { field: 'f1', operator: 'notBetween', value: '12,14' },
        { field: 'f1', operator: 'notBetween', value: 'false,true' },
        { field: 'f1', operator: 'in', value: 'Test,Test2' },
        { field: 'f1', operator: 'in', value: String.raw`Te\,st,Test2` },
        { field: 'f1', operator: 'in', value: '12,14' },
        { field: 'f1', operator: 'in', value: 'true,false' },
        { field: 'f1', operator: 'notIn', value: 'Test,Test2' },
        { field: 'f1', operator: 'notIn', value: '12,14' },
        { field: 'f1', operator: 'notIn', value: 'true,false' },
        {
          combinator: 'and',
          not: true,
          rules: [
            { field: 'f1', operator: '>', value: 14 },
            { field: 'f1', operator: '>=', value: 12 },
          ],
        },
      ],
    });
  });
});

describe('valueSource: "field"', () => {
  it('handles basic boolean operators', () => {
    expect(
      parseMongoDB({
        $or: [
          { $expr: { $eq: ['$f1', '$f2'] } },
          { $expr: { $ne: ['$f1', '$f2'] } }, // ignored
          { $expr: { $gt: ['$f1', '$f2'] } },
          { $expr: { $gte: ['$f1', '$f2'] } },
          { $expr: { $lt: ['$f1', '$f2'] } },
          { $expr: { $lte: ['$f1', '$f2'] } },
          { $not: { $expr: { $eq: ['$f1', '$f2'] } } },
        ],
      })
    ).toEqual({
      combinator: 'or',
      rules: [
        { field: 'f1', operator: '=', value: 'f2', valueSource: 'field' },
        { field: 'f1', operator: '>', value: 'f2', valueSource: 'field' },
        { field: 'f1', operator: '>=', value: 'f2', valueSource: 'field' },
        { field: 'f1', operator: '<', value: 'f2', valueSource: 'field' },
        { field: 'f1', operator: '<=', value: 'f2', valueSource: 'field' },
        { field: 'f1', operator: '!=', value: 'f2', valueSource: 'field' },
      ],
    });
  });

  it('handles "in" operations', () => {
    expect(
      parseMongoDB({
        $or: [{ $expr: { $in: ['$f1', ['$f2', '$f3']] } }],
      })
    ).toEqual({
      combinator: 'or',
      rules: [{ field: 'f1', operator: 'in', value: 'f2,f3', valueSource: 'field' }],
    });
  });
});

it('parses MongoDB as string', () => {
  expect(parseMongoDB(JSON.stringify({ $and: [{ f1: 12 }, { f2: 14 }] }))).toEqual({
    combinator: 'and',
    rules: [
      { field: 'f1', operator: '=', value: 12 },
      { field: 'f2', operator: '=', value: 14 },
    ],
  });
});

it('validates fields', () => {
  const getValueSources = (field: string): ValueSources =>
    field === 'f4' ? ['field'] : ['value', 'field'];
  const fields: FullField[] = [
    { name: 'f1', label: 'Field 1', c: '1or2', comparator: 'c' },
    { name: 'f2', label: 'Field 2', c: '1or2', comparator: 'c' },
    { name: 'f3', label: 'Field 3', c: '3', comparator: 'c' },
    { name: 'f4', label: 'Field 4', c: '4', comparator: 'c' },
  ].map(o => toFullOption(o));
  const fieldsAsOptGroup = [
    { label: 'OptGroup', options: fields },
  ] satisfies OptionGroup<FullField>[];
  const fieldsAsObject: Record<string, FullField> = {};
  for (const f of fields) {
    fieldsAsObject[f.name] = f;
  }
  const mongoDbRulesForFields = {
    $and: [
      // This one should pass...
      { $expr: { $eq: ['$f1', '$f2'] } },
      // ...the rest should be ignored as invalid
      { f_missing: null },
      { f_missing: { $ne: null } },
      { f_missing: { $eq: 'Test' } },
      { f_missing: { $ne: 'Test' } },
      { f_missing: { $gt: 'Test' } },
      { f_missing: { $gte: 'Test' } },
      { f_missing: { $lt: 'Test' } },
      { f_missing: { $lte: 'Test' } },
      { f_missing: { $regex: 'Test' } },
      { f_missing: { $regex: '^Test' } },
      { f_missing: { $regex: 'Test$' } },
      { $expr: { $eq: ['$f1', '$f3'] } },
      { $expr: { $eq: ['$f1', '$f1'] } },
      { $expr: { $eq: ['$f4', '$Test'] } },
      { $expr: { $eq: ['$f_missing', '$Test'] } },
      { $expr: { $in: ['$f1', ['$f2', '$f3']] } },
    ],
  };
  const ruleGroupForFields: DefaultRuleGroupType = {
    combinator: 'and',
    rules: [{ field: 'f1', operator: '=', value: 'f2', valueSource: 'field' }],
  };

  expect(
    parseMongoDB(mongoDbRulesForFields, { getValueSources, fields: fields as FullField[] })
  ).toEqual(ruleGroupForFields);
  expect(
    parseMongoDB(mongoDbRulesForFields, {
      getValueSources,
      fields: fieldsAsOptGroup,
    })
  ).toEqual(ruleGroupForFields);
  expect(
    parseMongoDB(mongoDbRulesForFields, {
      getValueSources,
      fields: fieldsAsObject,
    })
  ).toEqual(ruleGroupForFields);
});

it('ignores invalid stuff', () => {
  expect(parseMongoDB('Test')).toEqual(emptyRuleGroup);
  expect(parseMongoDB('"Test"')).toEqual(emptyRuleGroup);
  expect(parseMongoDB('0')).toEqual(emptyRuleGroup);
  expect(parseMongoDB({ f1: {} })).toEqual(emptyRuleGroup);
  expect(parseMongoDB({ $and: ['Test'] })).toEqual(emptyRuleGroup);
  expect(parseMongoDB({ $and: [{}, {}] })).toEqual(emptyRuleGroup);
  expect(parseMongoDB({ $or: ['Test'] })).toEqual(emptyRuleGroup);
  expect(parseMongoDB({ $or: [{}, {}] })).toEqual(emptyRuleGroup);
  expect(parseMongoDB({ $not: {} })).toEqual(emptyRuleGroup);
  expect(parseMongoDB({ $expr: { $eq: 'invalid' } })).toEqual(emptyRuleGroup);
});

it('translates lists as arrays', () => {
  expect(
    parseMongoDB(
      {
        $and: [
          { f1: { $gte: 12, $lte: 14 } },
          { f1: { $in: [12, 14] } },
          { f1: { $nin: [12, 14] } },
          { $and: [{ f1: { $gte: 12 } }, { f1: { $lte: 14 } }] },
          { $and: [{ f1: { $lte: 14 } }, { f1: { $gte: 12 } }] },
          { $or: [{ f1: { $gt: 14 } }, { f1: { $lt: 12 } }] },
          { $or: [{ f1: { $lt: 12 } }, { f1: { $gt: 14 } }] },
        ],
      },
      { listsAsArrays: true }
    )
  ).toEqual({
    combinator: 'and',
    rules: [
      { field: 'f1', operator: 'between', value: [12, 14] },
      { field: 'f1', operator: 'in', value: [12, 14] },
      { field: 'f1', operator: 'notIn', value: [12, 14] },
      { field: 'f1', operator: 'between', value: [12, 14] },
      { field: 'f1', operator: 'between', value: [12, 14] },
      { field: 'f1', operator: 'notBetween', value: [12, 14] },
      { field: 'f1', operator: 'notBetween', value: [12, 14] },
    ],
  });
});

it('handles custom operators', () => {
  expect(
    parseMongoDB(
      {
        $and: [
          { f1: { $gte: 12, $lte: 14 } },
          { f1: 26 },
          { f2: { $x: {} } },
          { f2: { $x: {}, $y: { f1: 12 } } },
          { f2: { $y: [{ f1: 12 }, { f1: 14 }] } },
        ],
      },
      {
        additionalOperators: {
          $x: field => ({ field, operator: '=', value: 'x' }),
          $y: field => ({ field, operator: '=', value: 'y' }),
        },
      }
    )
  ).toEqual({
    combinator: 'and',
    rules: [
      { field: 'f1', operator: 'between', value: '12,14' },
      { field: 'f1', operator: '=', value: 26 },
      { field: 'f2', operator: '=', value: 'x' },
      {
        combinator: 'and',
        rules: [
          { field: 'f2', operator: '=', value: 'x' },
          { field: 'f2', operator: '=', value: 'y' },
        ],
      },
      { field: 'f2', operator: '=', value: 'y' },
    ],
  });
});

it('prevents operator negation', () => {
  expect(
    parseMongoDB(
      {
        $and: [
          { f1: { $not: { $eq: 'Test' } } },
          { $not: { f1: 'Test' } },
          { $not: { f1: { $eq: 'Test' } } },
        ],
      },
      { preventOperatorNegation: true }
    )
  ).toEqual({
    combinator: 'and',
    rules: [
      { combinator: 'and', rules: [{ field: 'f1', operator: '=', value: 'Test' }], not: true },
      { combinator: 'and', rules: [{ field: 'f1', operator: '=', value: 'Test' }], not: true },
      { combinator: 'and', rules: [{ field: 'f1', operator: '=', value: 'Test' }], not: true },
    ],
  });
});

it('generates query with independent combinators', () => {
  expect(parseMongoDB({ f1: 'Test', f2: 'Test' }, { independentCombinators: true })).toEqual({
    rules: [
      { field: 'f1', operator: '=', value: 'Test' },
      'and',
      { field: 'f2', operator: '=', value: 'Test' },
    ],
  });
});

it('generates IDs', () => {
  expect(parseMongoDB({ firstName: 'Steve' }, { generateIDs: true })).toEqual(
    expect.objectContaining({
      id: expect.any(String),
      combinator: 'and',
      rules: [{ id: expect.any(String), field: 'firstName', operator: '=', value: 'Steve' }],
    })
  );
});

it('handles empty options object', () => {
  expect(parseMongoDB({ f1: 1 }, {})).toEqual({
    combinator: 'and',
    rules: [{ field: 'f1', operator: '=', value: 1 }],
  });
});
