import type {
  DefaultRuleGroupType,
  Field,
  OptionGroup,
  RQBJsonLogic,
  ValueSources,
} from '@react-querybuilder/ts/src/index.noReact';
import { parseJsonLogic } from './parseJsonLogic';

const emptyRuleGroup: DefaultRuleGroupType = { combinator: 'and', rules: [] };

it('ignores invalid logic', () => {
  expect(
    parseJsonLogic({
      and: [{ '===': [{ var: 'f1' }, { '+': [1, 1] }] }, { '!': false }, { '!!': false }],
    })
  ).toEqual(emptyRuleGroup);
});

describe('valueSource: "value"', () => {
  it('handles basic boolean operations', () => {
    expect(
      parseJsonLogic({
        or: [
          { '!': { '==': [{ var: 'f1' }, 'Test'] } },
          { '==': [{ var: 'f1' }, 'Test'] },
          { '==': ['Test', { var: 'f1' }] },
          { '!=': [{ var: 'f1' }, 'Test'] },
          { '===': [{ var: 'f1' }, 'Test'] },
          { '!==': [{ var: 'f1' }, 'Test'] },
          { '==': [{ var: 'f1' }, null] },
          { '!=': [{ var: 'f1' }, null] },
          { '>': [{ var: 'f1' }, 1214] },
          { '>=': [{ var: 'f1' }, 1214] },
          { '<': [{ var: 'f1' }, 1214] },
          { '<=': [{ var: 'f1' }, 1214] },
          { '<': ['Test', { var: 'f1' }, 'Test2'] },
          { '<': [12, { var: 'f1' }, 14] },
          { '<': [true, { var: 'f1' }, false] },
          { '<=': ['Test', { var: 'f1' }, 'Test2'] },
          { '<=': [12, { var: 'f1' }, 14] },
          { '<=': [true, { var: 'f1' }, false] },
        ],
      })
    ).toEqual({
      combinator: 'or',
      rules: [
        {
          combinator: 'and',
          rules: [{ field: 'f1', operator: '=', value: 'Test' }],
          not: true,
        },
        { field: 'f1', operator: '=', value: 'Test' },
        { field: 'f1', operator: '=', value: 'Test' },
        { field: 'f1', operator: '!=', value: 'Test' },
        { field: 'f1', operator: '=', value: 'Test' },
        { field: 'f1', operator: '!=', value: 'Test' },
        { field: 'f1', operator: 'null', value: null },
        { field: 'f1', operator: 'notNull', value: null },
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
      ],
    });
  });

  it('handles substring operations', () => {
    expect(
      parseJsonLogic({
        or: [
          { startsWith: [{ var: 'f1' }, 'Test'] },
          { endsWith: [{ var: 'f1' }, 'Test'] },
          { in: [{ var: 'f1' }, 'Test'] },
          { '!': { startsWith: [{ var: 'f1' }, 'Test'] } },
          { '!': { endsWith: [{ var: 'f1' }, 'Test'] } },
          { '!': { in: [{ var: 'f1' }, 'Test'] } },
        ],
      })
    ).toEqual({
      combinator: 'or',
      rules: [
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
      parseJsonLogic({
        or: [
          { '!': { '<': ['Test', { var: 'f1' }, 'Test2'] } },
          { '!': { '<': [12, { var: 'f1' }, 14] } },
          { '!': { '<': [true, { var: 'f1' }, false] } },
          { '!': { '<=': ['Test', { var: 'f1' }, 'Test2'] } },
          { '!': { '<=': [12, { var: 'f1' }, 14] } },
          { '!': { '<=': [true, { var: 'f1' }, false] } },
          { '!': { in: [{ var: 'f1' }, ['Test', 'Test2']] } },
          { '!': { in: [{ var: 'f1' }, [12, 14]] } },
          { '!': { in: [{ var: 'f1' }, [true, false]] } },
        ],
      })
    ).toEqual({
      combinator: 'or',
      rules: [
        {
          combinator: 'and',
          not: true,
          rules: [
            { field: 'f1', operator: '>', value: 'Test' },
            { field: 'f1', operator: '<', value: 'Test2' },
          ],
        },
        {
          combinator: 'and',
          not: true,
          rules: [
            { field: 'f1', operator: '>', value: 12 },
            { field: 'f1', operator: '<', value: 14 },
          ],
        },
        {
          combinator: 'and',
          not: true,
          rules: [
            { field: 'f1', operator: '>', value: true },
            { field: 'f1', operator: '<', value: false },
          ],
        },
        { field: 'f1', operator: 'notBetween', value: 'Test,Test2' },
        { field: 'f1', operator: 'notBetween', value: '12,14' },
        { field: 'f1', operator: 'notBetween', value: 'true,false' },
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
      parseJsonLogic({
        or: [
          { '!': { '==': [{ var: 'f1' }, { var: 'f2' }] } },
          { '==': [{ var: 'f1' }, { var: 'f2' }] },
          { '!=': [{ var: 'f1' }, { var: 'f2' }] },
          { '===': [{ var: 'f1' }, { var: 'f2' }] },
          { '!==': [{ var: 'f1' }, { var: 'f2' }] },
          { '>': [{ var: 'f1' }, { var: 'f2' }] },
          { '>=': [{ var: 'f1' }, { var: 'f2' }] },
          { '<': [{ var: 'f1' }, { var: 'f2' }] },
          { '<=': [{ var: 'f1' }, { var: 'f2' }] },
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
        { field: 'f1', operator: '!=', value: 'f2', valueSource: 'field' },
        { field: 'f1', operator: '=', value: 'f2', valueSource: 'field' },
        { field: 'f1', operator: '!=', value: 'f2', valueSource: 'field' },
        { field: 'f1', operator: '>', value: 'f2', valueSource: 'field' },
        { field: 'f1', operator: '>=', value: 'f2', valueSource: 'field' },
        { field: 'f1', operator: '<', value: 'f2', valueSource: 'field' },
        { field: 'f1', operator: '<=', value: 'f2', valueSource: 'field' },
      ],
    });
  });

  it('handles substring operations', () => {
    expect(
      parseJsonLogic({
        or: [
          { startsWith: [{ var: 'f1' }, { var: 'f2' }] },
          { endsWith: [{ var: 'f1' }, { var: 'f2' }] },
          { in: [{ var: 'f1' }, { var: 'f2' }] },
          { '!': { startsWith: [{ var: 'f1' }, { var: 'f2' }] } },
          { '!': { endsWith: [{ var: 'f1' }, { var: 'f2' }] } },
          { '!': { in: [{ var: 'f1' }, { var: 'f2' }] } },
        ],
      })
    ).toEqual({
      combinator: 'or',
      rules: [
        { field: 'f1', operator: 'beginsWith', value: 'f2', valueSource: 'field' },
        { field: 'f1', operator: 'endsWith', value: 'f2', valueSource: 'field' },
        { field: 'f1', operator: 'contains', value: 'f2', valueSource: 'field' },
        { field: 'f1', operator: 'doesNotBeginWith', value: 'f2', valueSource: 'field' },
        { field: 'f1', operator: 'doesNotEndWith', value: 'f2', valueSource: 'field' },
        { field: 'f1', operator: 'doesNotContain', value: 'f2', valueSource: 'field' },
      ],
    });
  });

  it('handles "between" and "in" operations', () => {
    expect(
      parseJsonLogic({
        or: [
          { '!': { '<': [{ var: 'f2' }, { var: 'f1' }, { var: 'f3' }] } },
          { '!': { '<': [{ var: 'f2' }, { var: 'f1' }, { var: 'f3' }] } },
          { '!': { '<': [{ var: 'f2' }, { var: 'f1' }, { var: 'f3' }] } },
          { '!': { '<=': [{ var: 'f2' }, { var: 'f1' }, { var: 'f3' }] } },
          { '!': { '<=': [{ var: 'f2' }, { var: 'f1' }, { var: 'f3' }] } },
          { '!': { '<=': [{ var: 'f2' }, { var: 'f1' }, { var: 'f3' }] } },
          { '!': { in: [{ var: 'f1' }, [{ var: 'f2' }, { var: 'f3' }]] } },
          { '!': { in: [{ var: 'f1' }, [{ var: 'f2' }, { var: 'f3' }]] } },
          { '!': { in: [{ var: 'f1' }, [{ var: 'f2' }, { var: 'f3' }]] } },
          // Next one will be ignored
          { '<=': [{ '>': [{ var: 'f2' }, { var: 'f3' }] }, { var: 'f1' }, true] },
        ],
      })
    ).toEqual({
      combinator: 'or',
      rules: [
        {
          combinator: 'and',
          not: true,
          rules: [
            { field: 'f1', operator: '>', value: 'f2', valueSource: 'field' },
            { field: 'f1', operator: '<', value: 'f3', valueSource: 'field' },
          ],
        },
        {
          combinator: 'and',
          not: true,
          rules: [
            { field: 'f1', operator: '>', value: 'f2', valueSource: 'field' },
            { field: 'f1', operator: '<', value: 'f3', valueSource: 'field' },
          ],
        },
        {
          combinator: 'and',
          not: true,
          rules: [
            { field: 'f1', operator: '>', value: 'f2', valueSource: 'field' },
            { field: 'f1', operator: '<', value: 'f3', valueSource: 'field' },
          ],
        },
        { field: 'f1', operator: 'notBetween', value: 'f2,f3', valueSource: 'field' },
        { field: 'f1', operator: 'notBetween', value: 'f2,f3', valueSource: 'field' },
        { field: 'f1', operator: 'notBetween', value: 'f2,f3', valueSource: 'field' },
        { field: 'f1', operator: 'notIn', value: 'f2,f3', valueSource: 'field' },
        { field: 'f1', operator: 'notIn', value: 'f2,f3', valueSource: 'field' },
        { field: 'f1', operator: 'notIn', value: 'f2,f3', valueSource: 'field' },
      ],
    });
  });
});

it('parses JsonLogic as string', () => {
  expect(parseJsonLogic('{"and":[{"==":[{"var": "f1"},12]},{"==":[{"var": "f2"},14]}]}')).toEqual({
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
  const jsonLogicForFields: RQBJsonLogic = {
    and: [
      { '==': [{ var: 'f1' }, { var: 'f2' }] },
      { '==': [{ var: 'f1' }, { var: 'f3' }] },
      { '===': [{ var: 'f1' }, { var: 'f1' }] },
      { '===': [{ var: 'f4' }, 'Test'] },
      { '===': [{ var: 'f_missing' }, 'Test'] },
      { in: [{ var: 'f1' }, [{ var: 'f2' }, { var: 'f3' }]] },
    ],
  };
  const ruleGroupForFields: DefaultRuleGroupType = {
    combinator: 'and',
    rules: [
      { field: 'f1', operator: '=', value: 'f2', valueSource: 'field' },
      { field: 'f1', operator: 'in', value: 'f2', valueSource: 'field' },
    ],
  };

  expect(parseJsonLogic(jsonLogicForFields, { getValueSources, fields })).toEqual(
    ruleGroupForFields
  );
  expect(
    parseJsonLogic(jsonLogicForFields, {
      getValueSources,
      fields: fieldsAsOptGroup,
    })
  ).toEqual(ruleGroupForFields);
  expect(
    parseJsonLogic(jsonLogicForFields, {
      getValueSources,
      fields: fieldsAsObject,
    })
  ).toEqual(ruleGroupForFields);
});

it('invalidates primitives as root object', () => {
  // JsonLogic accepts these but there's not enough information to create a rule
  expect(parseJsonLogic(true)).toEqual(emptyRuleGroup);
  expect(parseJsonLogic(1214)).toEqual(emptyRuleGroup);
  expect(parseJsonLogic('Test')).toEqual(emptyRuleGroup);
});

it('translates lists as arrays', () => {
  expect(
    parseJsonLogic(
      {
        and: [
          { '<=': [12, { var: 'f1' }, 14] },
          { '<=': [{ var: 'f2' }, { var: 'f1' }, { var: 'f3' }] },
          { in: [{ var: 'f1' }, [12, 14]] },
          { in: [{ var: 'f1' }, [{ var: 'f2' }, { var: 'f3' }]] },
        ],
      },
      { listsAsArrays: true }
    )
  ).toEqual({
    combinator: 'and',
    rules: [
      { field: 'f1', operator: 'between', value: [12, 14] },
      { field: 'f1', operator: 'between', value: ['f2', 'f3'], valueSource: 'field' },
      { field: 'f1', operator: 'in', value: [12, 14] },
      {
        field: 'f1',
        operator: 'in',
        value: ['f2', 'f3'],
        valueSource: 'field',
      },
    ],
  });
});

it('generates query with independent combinators', () => {
  expect(
    parseJsonLogic(
      {
        and: [{ '==': [{ var: 'f1' }, 'Test'] }, { '==': ['Test', { var: 'f1' }] }],
      },
      { independentCombinators: true }
    )
  ).toEqual({
    rules: [
      { field: 'f1', operator: '=', value: 'Test' },
      'and',
      { field: 'f1', operator: '=', value: 'Test' },
    ],
  });
});

it('handles empty options object', () => {
  expect(parseJsonLogic({ '===': [{ var: 'f1' }, 1] }, {})).toEqual({
    combinator: 'and',
    rules: [{ field: 'f1', operator: '=', value: 1 }],
  });
});
