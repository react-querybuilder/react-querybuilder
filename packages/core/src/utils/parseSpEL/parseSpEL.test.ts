import type { Except } from 'type-fest';
import type {
  DefaultCombinatorName,
  DefaultRuleGroupType,
  DefaultRuleGroupTypeIC,
  DefaultRuleType,
  Field,
  FullField,
  OptionGroup,
  ValueSources,
} from '../../types';
import { toFullOption } from '../optGroupUtils';
import type { ParseSpELOptions } from './parseSpEL';
import { parseSpEL } from './parseSpEL';

const wrapRule = (
  rule?: DefaultRuleType | DefaultRuleType[],
  combinator: DefaultCombinatorName = 'and'
): DefaultRuleGroupType => ({
  combinator,
  rules: rule ? (Array.isArray(rule) ? rule : [rule]) : [],
});
const wrapRuleIC = (rule?: DefaultRuleType): DefaultRuleGroupTypeIC => ({
  rules: rule ? [rule] : [],
});

const expectParseSpEL = (
  parseResult: DefaultRuleGroupType | string,
  expectedResult: DefaultRuleGroupType,
  options: Except<ParseSpELOptions, 'independentCombinators'> = {}
) => {
  expect(typeof parseResult === 'string' ? parseSpEL(parseResult, options) : parseResult).toEqual(
    expectedResult
  );
};
const expectParseSpELic = (
  parseResult: DefaultRuleGroupTypeIC | string,
  expectedResult: DefaultRuleGroupTypeIC,
  options: Except<ParseSpELOptions, 'independentCombinators'> = {}
) => {
  expect(
    typeof parseResult === 'string'
      ? parseSpEL(parseResult, { ...options, independentCombinators: true })
      : parseResult
  ).toEqual(expectedResult);
};
const getValueSources = (): ValueSources => ['field'];

it('works for basic relations', () => {
  expectParseSpEL('f1 == "Test"', wrapRule({ field: 'f1', operator: '=', value: 'Test' }));
  expectParseSpEL('f1.f2 == "Test"', wrapRule({ field: 'f1.f2', operator: '=', value: 'Test' }));
  expectParseSpEL(
    'f1.f2.f3 == "Test"',
    wrapRule({ field: 'f1.f2.f3', operator: '=', value: 'Test' })
  );
  expectParseSpEL('(f1 == "Test")', wrapRule({ field: 'f1', operator: '=', value: 'Test' }));
  expectParseSpEL('f1 != "Test"', wrapRule({ field: 'f1', operator: '!=', value: 'Test' }));
  expectParseSpEL('f1 > 1', wrapRule({ field: 'f1', operator: '>', value: 1 }));
  expectParseSpEL('f1 >= 1', wrapRule({ field: 'f1', operator: '>=', value: 1 }));
  expectParseSpEL('f1 < 1', wrapRule({ field: 'f1', operator: '<', value: 1 }));
  expectParseSpEL('f1 <= 1', wrapRule({ field: 'f1', operator: '<=', value: 1 }));
  expectParseSpEL('f1 == 12.14', wrapRule({ field: 'f1', operator: '=', value: 12.14 }));
  expectParseSpEL('f1 == 1214', wrapRule({ field: 'f1', operator: '=', value: 1214 }));
  expectParseSpEL('f1 == null', wrapRule({ field: 'f1', operator: 'null', value: null }));
  expectParseSpEL('f1 != null', wrapRule({ field: 'f1', operator: 'notNull', value: null }));
  expectParseSpEL('f1 == true', wrapRule({ field: 'f1', operator: '=', value: true }));
  expectParseSpEL('f1 == false', wrapRule({ field: 'f1', operator: '=', value: false }));
  // flips operators
  expectParseSpEL('"Test" == f1', wrapRule({ field: 'f1', operator: '=', value: 'Test' }));
  expectParseSpEL('"Test" == f1.f2', wrapRule({ field: 'f1.f2', operator: '=', value: 'Test' }));
  expectParseSpEL(
    '"Test" == f1.f2.f3',
    wrapRule({ field: 'f1.f2.f3', operator: '=', value: 'Test' })
  );
  expectParseSpEL('1214 > f1', wrapRule({ field: 'f1', operator: '<', value: 1214 }));
  expectParseSpEL('1214 >= f1', wrapRule({ field: 'f1', operator: '<=', value: 1214 }));
  expectParseSpEL('1214 < f1', wrapRule({ field: 'f1', operator: '>', value: 1214 }));
  expectParseSpEL('1214 <= f1', wrapRule({ field: 'f1', operator: '>=', value: 1214 }));
});

it('handles every letter within strings', () => {
  for (const value of 'abcdefghijklmnopqrstuvwxyz') {
    expectParseSpEL(`f1 == "${value}"`, wrapRule({ field: 'f1', operator: '=', value }));
  }
});

it('handles "like" comparisons', () => {
  expectParseSpEL(
    'f1 matches "Test"',
    wrapRule({ field: 'f1', operator: 'contains', value: 'Test' })
  );
  expectParseSpEL('f1 matches "T"', wrapRule({ field: 'f1', operator: 'contains', value: 'T' }));
  expectParseSpEL(
    '"Test" matches f1',
    wrapRule({ field: 'f1', operator: 'contains', value: 'Test' })
  );
  expectParseSpEL(
    'f1.f2.f3 matches "Test"',
    wrapRule({ field: 'f1.f2.f3', operator: 'contains', value: 'Test' })
  );
  expectParseSpEL(
    'f1 matches "^Test"',
    wrapRule({ field: 'f1', operator: 'beginsWith', value: 'Test' })
  );
  expectParseSpEL('f1 matches "^T"', wrapRule({ field: 'f1', operator: 'beginsWith', value: 'T' }));
  expectParseSpEL(
    'f1 matches "Test$"',
    wrapRule({ field: 'f1', operator: 'endsWith', value: 'Test' })
  );
  expectParseSpEL('f1 matches "T$"', wrapRule({ field: 'f1', operator: 'endsWith', value: 'T' }));
  expectParseSpEL(
    'f1 matches f2',
    wrapRule({ field: 'f1', operator: 'contains', value: 'f2', valueSource: 'field' })
  );
});

it('negates "matches" comparisons appropriately', () => {
  expectParseSpEL(
    '!(f1 matches "Test")',
    wrapRule({ field: 'f1', operator: 'doesNotContain', value: 'Test' })
  );
  expectParseSpEL(
    '!(f1 matches "^Test")',
    wrapRule({ field: 'f1', operator: 'doesNotBeginWith', value: 'Test' })
  );
  expectParseSpEL(
    '!(f1 matches "Test$")',
    wrapRule({ field: 'f1', operator: 'doesNotEndWith', value: 'Test' })
  );
});

it('handles "between" operators', () => {
  expectParseSpEL(
    'f1 between {12,14}',
    wrapRule({ field: 'f1', operator: 'between', value: '12,14' })
  );
  expectParseSpEL(
    'f1 between {14,12}',
    wrapRule({ field: 'f1', operator: 'between', value: '12,14' })
  );
  expectParseSpEL(
    'f1 between {"test,comma","other value"}',
    wrapRule({ field: 'f1', operator: 'between', value: String.raw`other value,test\,comma` })
  );
  expect(parseSpEL('f1 between {12,14}', { listsAsArrays: true })).toEqual(
    wrapRule({ field: 'f1', operator: 'between', value: [12, 14] })
  );
  expect(parseSpEL('f1 between {14,12}', { listsAsArrays: true })).toEqual(
    wrapRule({ field: 'f1', operator: 'between', value: [12, 14] })
  );
  expectParseSpEL(
    'f1 between {f2,f4}',
    wrapRule({ field: 'f1', operator: 'between', value: 'f2,f4', valueSource: 'field' })
  );
  expect(parseSpEL('f1 between {f2,f4}', { listsAsArrays: true })).toEqual(
    wrapRule({ field: 'f1', operator: 'between', value: ['f2', 'f4'], valueSource: 'field' })
  );
});

// This is sort of a useless test. See 'handles parentheses' test below.
it('groups only when necessary', () => {
  expectParseSpEL('(f1 == "Test" || f2 == "Test2")', {
    combinator: 'or',
    rules: [
      { field: 'f1', operator: '=', value: 'Test' },
      { field: 'f2', operator: '=', value: 'Test2' },
    ],
  });
  expectParseSpEL('((f1 == "Test" || f2 == "Test2"))', {
    combinator: 'or',
    rules: [
      { field: 'f1', operator: '=', value: 'Test' },
      { field: 'f2', operator: '=', value: 'Test2' },
    ],
  });
});

// FIX: Seems like spel2js doesn't handle parentheses
// oxlint-disable-next-line no-disabled-tests
it.skip('handles parentheses', () => {
  expectParseSpEL('(f1 == "Test" || f2 == "Test2") && f3 == "Test3"', {
    combinator: 'and',
    rules: [
      {
        combinator: 'or',
        rules: [
          { field: 'f1', operator: '=', value: 'Test' },
          { field: 'f2', operator: '=', value: 'Test2' },
        ],
      },
      { field: 'f3', operator: '=', value: 'Test3' },
    ],
  });
  expectParseSpEL(
    '(((f1 matches "Test")))',
    wrapRule({ field: 'f1', operator: 'contains', value: 'Test' })
  );
});

it('works for conditional and/or', () => {
  expectParseSpEL(
    'f1 == "Test" && f2 == "Test2"',
    wrapRule([
      { field: 'f1', operator: '=', value: 'Test' },
      { field: 'f2', operator: '=', value: 'Test2' },
    ])
  );
  expectParseSpEL(
    'f1 == "Test" || f2 == "Test2"',
    wrapRule(
      [
        { field: 'f1', operator: '=', value: 'Test' },
        { field: 'f2', operator: '=', value: 'Test2' },
      ],
      'or'
    )
  );
  expectParseSpEL('f1 == "Test" && f2 == "Test2" || f3 == "Test3"', {
    combinator: 'or',
    rules: [
      {
        combinator: 'and',
        rules: [
          { field: 'f1', operator: '=', value: 'Test' },
          { field: 'f2', operator: '=', value: 'Test2' },
        ],
      },
      { field: 'f3', operator: '=', value: 'Test3' },
    ],
  });
});

it('mixed and/or', () => {
  expectParseSpEL(`firstName == 'Steve' && lastName == 'Vai' || middleName == null`, {
    combinator: 'or',
    rules: [
      {
        combinator: 'and',
        rules: [
          { field: 'firstName', operator: '=', value: 'Steve' },
          { field: 'lastName', operator: '=', value: 'Vai' },
        ],
      },
      { field: 'middleName', operator: 'null', value: null },
    ],
  });
  expectParseSpEL(
    parseSpEL(
      `firstName == 'Steve' && lastName == 'Vai' || middleName == null || isMusician == true`
    ),
    {
      combinator: 'or',
      rules: [
        {
          combinator: 'and',
          rules: [
            { field: 'firstName', operator: '=', value: 'Steve' },
            { field: 'lastName', operator: '=', value: 'Vai' },
          ],
        },
        { field: 'middleName', operator: 'null', value: null },
        { field: 'isMusician', operator: '=', value: true },
      ],
    }
  );
  expectParseSpEL(
    parseSpEL(
      `firstName == 'Steve' && lastName == 'Vai' || middleName == null || isMusician == true || fieldName == 'Test'`
    ),
    {
      combinator: 'or',
      rules: [
        {
          combinator: 'and',
          rules: [
            { field: 'firstName', operator: '=', value: 'Steve' },
            { field: 'lastName', operator: '=', value: 'Vai' },
          ],
        },
        { field: 'middleName', operator: 'null', value: null },
        { field: 'isMusician', operator: '=', value: true },
        { field: 'fieldName', operator: '=', value: 'Test' },
      ],
    }
  );
  expectParseSpEL(`firstName == 'Steve' || lastName == 'Vai' && middleName == null`, {
    combinator: 'or',
    rules: [
      { field: 'firstName', operator: '=', value: 'Steve' },
      {
        combinator: 'and',
        rules: [
          { field: 'lastName', operator: '=', value: 'Vai' },
          { field: 'middleName', operator: 'null', value: null },
        ],
      },
    ],
  });
  expectParseSpEL(`firstName == 'Steve' || lastName == 'Vai' || f1 == 'v1' && f2 == 'v2'`, {
    combinator: 'or',
    rules: [
      { field: 'firstName', operator: '=', value: 'Steve' },
      { field: 'lastName', operator: '=', value: 'Vai' },
      {
        combinator: 'and',
        rules: [
          { field: 'f1', operator: '=', value: 'v1' },
          { field: 'f2', operator: '=', value: 'v2' },
        ],
      },
    ],
  });
});

describe('fields and getValueSources', () => {
  const fields = (
    [
      { name: 'f1', label: 'f1' },
      { name: 'f2', label: 'f2', valueSources: ['value'] },
      { name: 'f3', label: 'f3', valueSources: ['field'] },
      { name: 'f4', label: 'f4', valueSources: () => ['value', 'field'] },
      { name: 'f5', label: 'f5', comparator: 'group', group: 'g1' },
      { name: 'f6', label: 'f6', comparator: 'group', group: 'g1' },
      { name: 'f7', label: 'f7', comparator: 'group', group: 'g2' },
      { name: 'f8', label: 'f8', comparator: 'group', group: 'g2' },
      { name: 'f9', label: 'f9', comparator: (f: FullField) => f.name === 'f1' },
      { name: 'f10', label: 'f10', comparator: (f: FullField) => f.group === 'g2' },
    ] satisfies Field[]
  ).map(o => toFullOption(o));
  const optionGroups: OptionGroup<FullField>[] = [{ label: 'Option Group1', options: fields }];
  const fieldsObject: Record<string, FullField> = {};
  for (const f of fields) {
    fieldsObject[f.name] = f;
  }

  it('sets the valueSource when fields are valid', () => {
    expectParseSpEL(
      parseSpEL(`f1 == 'Steve'`, { fields }),
      wrapRule({ field: 'f1', operator: '=', value: 'Steve' })
    );
    // fields as option groups
    expectParseSpEL(
      parseSpEL(`f3 == f1`, { fields: optionGroups }),
      wrapRule({ field: 'f3', operator: '=', value: 'f1', valueSource: 'field' })
    );
    // fields as object
    expectParseSpEL(
      parseSpEL(`f3 == f1`, { fields: fieldsObject }),
      wrapRule({ field: 'f3', operator: '=', value: 'f1', valueSource: 'field' })
    );
    // `f3` and `f4` allow the valueSource "field" and have no filter
    const baseFields = ['f3', 'f4'];
    for (const baseField of baseFields) {
      for (const f of fields) {
        expectParseSpEL(
          parseSpEL(`${baseField} == ${f.name}`, { fields }),
          f.name === baseField
            ? wrapRule()
            : wrapRule({ field: baseField, operator: '=', value: f.name, valueSource: 'field' })
        );
      }
    }
  });

  it('uses the getValueSources option', () => {
    expectParseSpEL(
      parseSpEL(`f5 == f6`, { fields, getValueSources }),
      wrapRule({ field: 'f5', operator: '=', value: 'f6', valueSource: 'field' })
    );
    expectParseSpEL(
      parseSpEL(`f8 == f7`, { fields, getValueSources }),
      wrapRule({ field: 'f8', operator: '=', value: 'f7', valueSource: 'field' })
    );
    expectParseSpEL(
      parseSpEL(`f9 == f1`, { fields, getValueSources }),
      wrapRule({ field: 'f9', operator: '=', value: 'f1', valueSource: 'field' })
    );
    expectParseSpEL(
      parseSpEL(`f10 == f7`, { fields, getValueSources }),
      wrapRule({ field: 'f10', operator: '=', value: 'f7', valueSource: 'field' })
    );
    expectParseSpEL(
      parseSpEL(`f10 == f8`, { fields, getValueSources }),
      wrapRule({ field: 'f10', operator: '=', value: 'f8', valueSource: 'field' })
    );
  });

  it('ignores invalid fields', () => {
    // `firstName` is not in the field list
    expectParseSpEL(parseSpEL(`firstName == 'Steve'`, { fields }), wrapRule());
    // A field cannot be compared to itself
    expectParseSpEL(parseSpEL(`f1 == f1`, { fields }), wrapRule());
    // A field cannot be compared to itself with a "like" comparison
    expectParseSpEL(parseSpEL(`f1.contains(f1)`, { fields }), wrapRule());
    // `f1` implicitly forbids the valueSource "field"
    expectParseSpEL(parseSpEL(`f1 == f2`, { fields }), wrapRule());
    // `f2` explicitly forbids the valueSource "field"
    expectParseSpEL(parseSpEL(`f2 == f1`, { fields }), wrapRule());
    // `f3` explicitly forbids the valueSource "value"
    expectParseSpEL(parseSpEL(`f3 == 'Steve'`, { fields }), wrapRule());
    // `f5` implicitly allows the valueSource "field" through getValueSources,
    // but `f7` is not a valid subordinate field
    expectParseSpEL(parseSpEL(`f5 == f7`, { fields, getValueSources }), wrapRule());
    // `f8` implicitly allows the valueSource "field" through getValueSources,
    // but `f6` is not a valid subordinate field
    expectParseSpEL(parseSpEL(`f8 == f6`, { fields, getValueSources }), wrapRule());
    // `f9` implicitly allows the valueSource "field" through getValueSources,
    // but `f10` is not a valid subordinate field
    expectParseSpEL(parseSpEL(`f9 == f10`, { fields, getValueSources }), wrapRule());
    // `f10` implicitly allows the valueSource "field" through getValueSources,
    // but `f5` is not a valid subordinate field
    expectParseSpEL(parseSpEL(`f10 == f5`, { fields, getValueSources }), wrapRule());
    // independent combinators
    const fieldsForIC = (
      [
        { name: 'f1', label: 'Field 1' },
        { name: 'f3', label: 'Field 3', valueSources: ['field'] },
      ] satisfies Field[]
    ).map(o => toFullOption(o));
    expectParseSpELic(
      parseSpEL('f1 == f2 && f3 == "f4" && f3 == f4', {
        fields: fieldsForIC,
        independentCombinators: true,
      }),
      wrapRuleIC()
    );
  });
});

it('handles multiple negations', () => {
  expectParseSpEL('!!!(f1 matches "Test")', {
    combinator: 'and',
    not: true,
    rules: [
      {
        combinator: 'and',
        not: true,
        rules: [{ field: 'f1', operator: 'doesNotContain', value: 'Test' }],
      },
    ],
  });
  expectParseSpEL('!!!!(f1 matches "Test")', {
    combinator: 'and',
    not: true,
    rules: [
      {
        combinator: 'and',
        not: true,
        rules: [
          {
            combinator: 'and',
            not: true,
            rules: [{ field: 'f1', operator: 'doesNotContain', value: 'Test' }],
          },
        ],
      },
    ],
  });
});

it('handles independent combinators', () => {
  expectParseSpELic('(f1 == "Test")', { rules: [{ field: 'f1', operator: '=', value: 'Test' }] });
  expectParseSpELic('f1 == "Test"', { rules: [{ field: 'f1', operator: '=', value: 'Test' }] });
  expectParseSpELic('!(f1 == "Test")', {
    not: true,
    rules: [{ field: 'f1', operator: '=', value: 'Test' }],
  });
  expectParseSpELic('f1 == "Test" && f2 == "Test2" || f3 == "Test3"', {
    rules: [
      { field: 'f1', operator: '=', value: 'Test' },
      'and',
      { field: 'f2', operator: '=', value: 'Test2' },
      'or',
      { field: 'f3', operator: '=', value: 'Test3' },
    ],
  });
});

it('generates IDs', () => {
  expectParseSpEL(
    `firstName == "Steve"`,
    expect.objectContaining({
      id: expect.any(String),
      ...wrapRule({ id: expect.any(String), field: 'firstName', operator: '=', value: 'Steve' }),
    }),
    { generateIDs: true }
  );
});

it('ignores things', () => {
  const expressionsToIgnore = [
    'f1 == f2 ? f3 : f4',
    'f1 == f2("")',
    '(f1 == f2(""))',
    'true',
    'f1 in ["Test",f2]',
    'f1 in {["f2"]: "v2", "f3": "v3"}',
    'f1 between {f2,14}',
  ];

  for (const pr of expressionsToIgnore) {
    expectParseSpEL(pr, wrapRule());
  }
});
