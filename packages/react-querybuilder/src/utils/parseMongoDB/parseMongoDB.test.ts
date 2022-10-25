import type {
  DefaultRuleGroupType,
  Field,
  OptionGroup,
  ValueSources,
} from '@react-querybuilder/ts/src/index.noReact';
import { parseMongoDB } from './parseMongoDB';

const emptyRuleGroup: DefaultRuleGroupType = { combinator: 'and', rules: [] };

describe('valueSource: "value"', () => {
  it('handles basic boolean operations', () => {
    expect(
      parseMongoDB({
        $or: [
          { f1: null },
          { f1: { $ne: null } },
          { $not: { f1: 'Test' } },
          { $not: { f1: { $eq: 'Test' } } },
          { f1: 'Test' },
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
        ],
      })
    ).toEqual({
      combinator: 'or',
      rules: [
        { field: 'f1', operator: 'null', value: null },
        { field: 'f1', operator: 'notNull', value: null },
        {
          combinator: 'and',
          rules: [{ field: 'f1', operator: '=', value: 'Test' }],
          not: true,
        },
        {
          combinator: 'and',
          rules: [{ field: 'f1', operator: '=', value: 'Test' }],
          not: true,
        },
        { field: 'f1', operator: '=', value: 'Test' },
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
          { f1: { $regex: /^Test/ } },
          { f1: { $regex: /Test$/ } },
          { f1: { $regex: /Test/ } },
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
        { field: 'f1', operator: 'beginsWith', value: 'Test' },
        { field: 'f1', operator: 'endsWith', value: 'Test' },
        { field: 'f1', operator: 'contains', value: 'Test' },
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
          { $and: [{ f1: { $gte: 12 } }, { f1: { $lte: 14 } }] },
          { $and: [{ f1: { $gte: true } }, { f1: { $lte: false } }] },
          { f1: { $gte: 'Test', $lte: 'Test2' } },
          { f1: { $gte: 12, $lte: 14 } },
          { f1: { $gte: true, $lte: false } },
          { $or: [{ f1: { $lt: 'Test' } }, { f1: { $gt: 'Test2' } }] },
          { $or: [{ f1: { $lt: 12 } }, { f1: { $gt: 14 } }] },
          { $or: [{ f1: { $lt: true } }, { f1: { $gt: false } }] },
          { $not: { f1: { $gte: 'Test', $lte: 'Test2' } } },
          { $not: { f1: { $gte: 12, $lte: 14 } } },
          { $not: { f1: { $gte: true, $lte: false } } },
          { f1: { $in: ['Test', 'Test2'] } },
          { f1: { $in: [12, 14] } },
          { f1: { $in: [true, false] } },
          { f1: { $nin: ['Test', 'Test2'] } },
          { f1: { $nin: [12, 14] } },
          { f1: { $nin: [true, false] } },
        ],
      })
    ).toEqual({
      combinator: 'or',
      rules: [
        { field: 'f1', operator: 'between', value: 'Test,Test2' },
        { field: 'f1', operator: 'between', value: '12,14' },
        { field: 'f1', operator: 'between', value: 'true,false' },
        { field: 'f1', operator: 'between', value: 'Test,Test2' },
        { field: 'f1', operator: 'between', value: '12,14' },
        { field: 'f1', operator: 'between', value: 'true,false' },
        { field: 'f1', operator: 'notBetween', value: 'Test,Test2' },
        { field: 'f1', operator: 'notBetween', value: '12,14' },
        { field: 'f1', operator: 'notBetween', value: 'true,false' },
        { field: 'f1', operator: 'notBetween', value: 'Test,Test2' },
        { field: 'f1', operator: 'notBetween', value: '12,14' },
        { field: 'f1', operator: 'notBetween', value: 'true,false' },
        { field: 'f1', operator: 'in', value: 'Test,Test2' },
        { field: 'f1', operator: 'in', value: '12,14' },
        { field: 'f1', operator: 'in', value: 'true,false' },
        { field: 'f1', operator: 'notIn', value: 'Test,Test2' },
        { field: 'f1', operator: 'notIn', value: '12,14' },
        { field: 'f1', operator: 'notIn', value: 'true,false' },
      ],
    });
  });
});

describe('valueSource: "field"', () => {
  it('handles basic boolean operators', () => {
    expect(
      parseMongoDB({
        $or: [
          { $not: { $expr: { $eq: ['$f1', '$f2'] } } },
          { $expr: { $eq: ['$f1', '$f2'] } },
          { $expr: { $ne: ['$f1', '$f2'] } }, // ignored
          { $expr: { $gt: ['$f1', '$f2'] } },
          { $expr: { $gte: ['$f1', '$f2'] } },
          { $expr: { $lt: ['$f1', '$f2'] } },
          { $expr: { $lte: ['$f1', '$f2'] } },
        ],
      })
    ).toEqual({
      combinator: 'or',
      rules: [
        {
          combinator: 'and',
          not: true,
          rules: [{ field: 'f1', operator: '=', value: 'f2', valueSource: 'field' }],
        },
        { field: 'f1', operator: '=', value: 'f2', valueSource: 'field' },
        { field: 'f1', operator: '>', value: 'f2', valueSource: 'field' },
        { field: 'f1', operator: '>=', value: 'f2', valueSource: 'field' },
        { field: 'f1', operator: '<', value: 'f2', valueSource: 'field' },
        { field: 'f1', operator: '<=', value: 'f2', valueSource: 'field' },
      ],
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
  const fields: Field[] = [
    { name: 'f1', label: 'Field 1', c: '1or2', comparator: 'c' },
    { name: 'f2', label: 'Field 2', c: '1or2', comparator: 'c' },
    { name: 'f3', label: 'Field 3', c: '3', comparator: 'c' },
    { name: 'f4', label: 'Field 4', c: '4', comparator: 'c' },
  ];
  const fieldsAsOptGroup: OptionGroup<Field>[] = [{ label: 'OptGroup', options: fields }];
  const fieldsAsObject: Record<string, Field> = {};
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

  expect(parseMongoDB(mongoDbRulesForFields, { getValueSources, fields })).toEqual(
    ruleGroupForFields
  );
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
  expect(parseMongoDB({ $and: ['Test'] })).toEqual(emptyRuleGroup);
});

it('translates lists as arrays', () => {
  expect(
    parseMongoDB(
      {
        $and: [
          { f1: { $gte: 12, $lte: 14 } },
          { f1: { $in: [12, 14] } },
          { f1: { $nin: [12, 14] } },
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
    ],
  });
});

it('handles empty options object', () => {
  expect(parseMongoDB({ f1: 1 }, {})).toEqual({
    combinator: 'and',
    rules: [{ field: 'f1', operator: '=', value: 1 }],
  });
});
