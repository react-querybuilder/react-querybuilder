import type { Except } from 'type-fest';
import type {
  DefaultCombinatorName,
  DefaultOperatorName,
  DefaultRuleGroupType,
  DefaultRuleGroupTypeIC,
  DefaultRuleType,
  Field,
  FullField,
  OptionGroup,
  ValueSources,
} from '../../types';
import { toFullOption } from '../optGroupUtils';
import type { ParseCELOptionsIC, ParseCELOptionsStandard } from './parseCEL';
import { parseCEL } from './parseCEL';
import { isCELIdentifier, isCELMember, isCELNumericLiteral, isCELStringLiteral } from './utils';

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

const expectParseCEL = (
  parseResult: DefaultRuleGroupType | string,
  expectedResult: DefaultRuleGroupType,
  options?: Except<ParseCELOptionsStandard, 'independentCombinators'>
) => {
  expect(
    typeof parseResult === 'string'
      ? options
        ? parseCEL(parseResult, options)
        : parseCEL(parseResult)
      : parseResult
  ).toEqual(expectedResult);
};
const expectParseCELic = (
  parseResult: DefaultRuleGroupTypeIC | string,
  expectedResult: DefaultRuleGroupTypeIC,
  options?: Except<ParseCELOptionsIC, 'independentCombinators'>
) => {
  expect(
    typeof parseResult === 'string'
      ? parseCEL(parseResult, { ...options, independentCombinators: true })
      : parseResult
  ).toEqual(expectedResult);
};

it('works for basic relations', () => {
  expectParseCEL('f1 == "Test"', wrapRule({ field: 'f1', operator: '=', value: 'Test' }));
  expectParseCEL('f1.f2 == "Test"', wrapRule({ field: 'f1.f2', operator: '=', value: 'Test' }));
  expectParseCEL(
    'f1.f2.f3 == "Test"',
    wrapRule({ field: 'f1.f2.f3', operator: '=', value: 'Test' })
  );
  expectParseCEL('(f1 == "Test")', wrapRule({ field: 'f1', operator: '=', value: 'Test' }));
  expectParseCEL('f1 != "Test"', wrapRule({ field: 'f1', operator: '!=', value: 'Test' }));
  expectParseCEL('f1 > 1', wrapRule({ field: 'f1', operator: '>', value: 1 }));
  expectParseCEL('f1 >= 1', wrapRule({ field: 'f1', operator: '>=', value: 1 }));
  expectParseCEL('f1 < 1', wrapRule({ field: 'f1', operator: '<', value: 1 }));
  expectParseCEL('f1 <= 1', wrapRule({ field: 'f1', operator: '<=', value: 1 }));
  expectParseCEL('f1 == 12.14', wrapRule({ field: 'f1', operator: '=', value: 12.14 }));
  // TODO: fix hexadecimal processing
  // testParseCEL('f1 == 0x1214', wrapRule({ field: 'f1', operator: '=', value: 0x1214 }));
  // testParseCEL('f1 == 0x1214u', wrapRule({ field: 'f1', operator: '=', value: 0x1214 }));
  expectParseCEL('f1 == 1214u', wrapRule({ field: 'f1', operator: '=', value: 1214 }));
  expectParseCEL('f1 == null', wrapRule({ field: 'f1', operator: 'null', value: null }));
  expectParseCEL('f1 != null', wrapRule({ field: 'f1', operator: 'notNull', value: null }));
  expectParseCEL('f1 == true', wrapRule({ field: 'f1', operator: '=', value: true }));
  expectParseCEL('f1 == false', wrapRule({ field: 'f1', operator: '=', value: false }));
  // flips operators
  expectParseCEL('"Test" == f1', wrapRule({ field: 'f1', operator: '=', value: 'Test' }));
  expectParseCEL('"Test" == f1.f2', wrapRule({ field: 'f1.f2', operator: '=', value: 'Test' }));
  expectParseCEL(
    '"Test" == f1.f2.f3',
    wrapRule({ field: 'f1.f2.f3', operator: '=', value: 'Test' })
  );
  expectParseCEL('1214 > f1', wrapRule({ field: 'f1', operator: '<', value: 1214 }));
  expectParseCEL('1214 >= f1', wrapRule({ field: 'f1', operator: '<=', value: 1214 }));
  expectParseCEL('1214 < f1', wrapRule({ field: 'f1', operator: '>', value: 1214 }));
  expectParseCEL('1214 <= f1', wrapRule({ field: 'f1', operator: '>=', value: 1214 }));
});

it('negates basic relations', () => {
  expectParseCEL('!(f1 == "Test")', wrapRule({ field: 'f1', operator: '!=', value: 'Test' }));
  expectParseCEL('!(f1 != "Test")', wrapRule({ field: 'f1', operator: '=', value: 'Test' }));
  expectParseCEL('!(f1 > 1)', wrapRule({ field: 'f1', operator: '<=', value: 1 }));
  expectParseCEL('!(f1 >= 1)', wrapRule({ field: 'f1', operator: '<', value: 1 }));
  expectParseCEL('!(f1 < 1)', wrapRule({ field: 'f1', operator: '>=', value: 1 }));
  expectParseCEL('!(f1 <= 1)', wrapRule({ field: 'f1', operator: '>', value: 1 }));
  expectParseCEL('!("Test" == f1)', wrapRule({ field: 'f1', operator: '!=', value: 'Test' }));
});

it('handles every letter within strings', () => {
  for (const value of 'abcdefghijklmnopqrstuvwxyz') {
    expectParseCEL(`f1 == "${value}"`, wrapRule({ field: 'f1', operator: '=', value }));
  }
});

it('handles multi-line strings', () => {
  for (const q of `'"`) {
    expectParseCEL(
      `f1 == ${q}${q}${q}multi-line\nstring${q}${q}${q}`,
      wrapRule({ field: 'f1', operator: '=', value: 'multi-line\nstring' })
    );
  }
});

it('handles "like" comparisons', () => {
  expectParseCEL(
    'f1.contains("Test")',
    wrapRule({ field: 'f1', operator: 'contains', value: 'Test' })
  );
  expectParseCEL(
    'f1.f2.f3.contains("Test")',
    wrapRule({ field: 'f1.f2.f3', operator: 'contains', value: 'Test' })
  );
  expectParseCEL(
    'f1.startsWith("Test")',
    wrapRule({ field: 'f1', operator: 'beginsWith', value: 'Test' })
  );
  expectParseCEL(
    'f1.endsWith("Test")',
    wrapRule({ field: 'f1', operator: 'endsWith', value: 'Test' })
  );
  expectParseCEL(
    'f1.contains(f2)',
    wrapRule({ field: 'f1', operator: 'contains', value: 'f2', valueSource: 'field' })
  );
  expectParseCEL(
    'f1.startsWith(f2)',
    wrapRule({ field: 'f1', operator: 'beginsWith', value: 'f2', valueSource: 'field' })
  );
  expectParseCEL(
    'f1.endsWith(f2)',
    wrapRule({ field: 'f1', operator: 'endsWith', value: 'f2', valueSource: 'field' })
  );
});

it('negates "like" comparisons', () => {
  expectParseCEL(
    '!f1.contains("Test")',
    wrapRule({ field: 'f1', operator: 'doesNotContain', value: 'Test' })
  );
  expectParseCEL(
    '!f1.contains(f2)',
    wrapRule({ field: 'f1', operator: 'doesNotContain', value: 'f2', valueSource: 'field' })
  );
  expectParseCEL(
    '!f1.f2.contains("Test")',
    wrapRule({ field: 'f1.f2', operator: 'doesNotContain', value: 'Test' })
  );
  expectParseCEL(
    '!(f1.contains("Test"))',
    wrapRule({ field: 'f1', operator: 'doesNotContain', value: 'Test' })
  );
  expectParseCEL(
    '!(f1.startsWith("Test"))',
    wrapRule({ field: 'f1', operator: 'doesNotBeginWith', value: 'Test' })
  );
  expectParseCEL(
    '!(f1.f2.startsWith("Test"))',
    wrapRule({ field: 'f1.f2', operator: 'doesNotBeginWith', value: 'Test' })
  );
  expectParseCEL(
    '!(f1.endsWith("Test"))',
    wrapRule({ field: 'f1', operator: 'doesNotEndWith', value: 'Test' })
  );
});

it('handles dynamic property accessors', () => {
  // Basic bracket notation
  expectParseCEL(
    'obj["property"] == "value"',
    wrapRule({ field: 'obj["property"]', operator: '=', value: 'value' })
  );

  // Bracket notation with special characters
  expectParseCEL(
    'obj["my$property"] == "value"',
    wrapRule({ field: 'obj["my$property"]', operator: '=', value: 'value' })
  );

  // Bracket notation with various special characters
  expectParseCEL(
    'obj["property@with@symbols"] == "test"',
    wrapRule({ field: 'obj["property@with@symbols"]', operator: '=', value: 'test' })
  );

  expectParseCEL(
    'obj["property-with-dashes"] == "test"',
    wrapRule({ field: 'obj["property-with-dashes"]', operator: '=', value: 'test' })
  );

  expectParseCEL(
    'obj["property_with_underscores"] == "test"',
    wrapRule({ field: 'obj["property_with_underscores"]', operator: '=', value: 'test' })
  );

  // Nested bracket and dot notation
  expectParseCEL(
    'obj["bracket_property"].dot_property == "value"',
    wrapRule({ field: 'obj["bracket_property"].dot_property', operator: '=', value: 'value' })
  );

  // Multiple bracket notations
  expectParseCEL(
    'obj["first"]["second"] == "value"',
    wrapRule({ field: 'obj["first"]["second"]', operator: '=', value: 'value' })
  );
});

it('groups only when necessary', () => {
  expectParseCEL('(f1 == "Test" || f2 == "Test2")', {
    combinator: 'or',
    rules: [
      { field: 'f1', operator: '=', value: 'Test' },
      { field: 'f2', operator: '=', value: 'Test2' },
    ],
  });
  expectParseCEL('((f1 == "Test" || f2 == "Test2"))', {
    combinator: 'or',
    rules: [
      { field: 'f1', operator: '=', value: 'Test' },
      { field: 'f2', operator: '=', value: 'Test2' },
    ],
  });
});

it('handles parentheses', () => {
  expectParseCEL('(f1 == "Test" || f2 == "Test2") && f3 == "Test3"', {
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
  expectParseCEL(
    '(((f1.contains("Test"))))',
    wrapRule({ field: 'f1', operator: 'contains', value: 'Test' })
  );
});

it('works for conditional and/or', () => {
  expectParseCEL(
    'f1 == "Test" && f2 == "Test2"',
    wrapRule([
      { field: 'f1', operator: '=', value: 'Test' },
      { field: 'f2', operator: '=', value: 'Test2' },
    ])
  );
  expectParseCEL(
    'f1 == "Test" || f2 == "Test2"',
    wrapRule(
      [
        { field: 'f1', operator: '=', value: 'Test' },
        { field: 'f2', operator: '=', value: 'Test2' },
      ],
      'or'
    )
  );
  expectParseCEL('f1 == "Test" && f2 == "Test2" || f3 == "Test3"', {
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
  expectParseCEL(`firstName == 'Steve' && lastName == 'Vai' || middleName == null`, {
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
  expectParseCEL(
    `firstName == 'Steve' && lastName == 'Vai' || middleName == null || isMusician == true`,
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
  expectParseCEL(
    `firstName == 'Steve' && lastName == 'Vai' || middleName == null || isMusician == true || fieldName == 'Test'`,
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
  expectParseCEL(`firstName == 'Steve' || lastName == 'Vai' && middleName == null`, {
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
  expectParseCEL(`firstName == 'Steve' || lastName == 'Vai' || f1 == 'v1' && f2 == 'v2'`, {
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
  const getValueSources = (): ValueSources => ['field'];

  it('sets the valueSource when fields are valid', () => {
    expectParseCEL(
      parseCEL(`f1 == 'Steve'`, { fields }),
      wrapRule({ field: 'f1', operator: '=', value: 'Steve' })
    );
    // fields as option groups
    expectParseCEL(
      parseCEL(`f3 == f1`, { fields: optionGroups }),
      wrapRule({ field: 'f3', operator: '=', value: 'f1', valueSource: 'field' })
    );
    // fields as object
    expectParseCEL(
      parseCEL(`f3 == f1`, { fields: fieldsObject }),
      wrapRule({ field: 'f3', operator: '=', value: 'f1', valueSource: 'field' })
    );
    // `f3` and `f4` allow the valueSource "field" and have no filter
    const baseFields = ['f3', 'f4'];
    for (const baseField of baseFields) {
      for (const f of fields) {
        expectParseCEL(
          parseCEL(`${baseField} == ${f.name}`, { fields }),
          f.name === baseField
            ? wrapRule()
            : wrapRule({ field: baseField, operator: '=', value: f.name, valueSource: 'field' })
        );
      }
    }
  });

  it('uses the getValueSources option', () => {
    expectParseCEL(
      parseCEL(`f5 == f6`, { fields, getValueSources }),
      wrapRule({ field: 'f5', operator: '=', value: 'f6', valueSource: 'field' })
    );
    expectParseCEL(
      parseCEL(`f8 == f7`, { fields, getValueSources }),
      wrapRule({ field: 'f8', operator: '=', value: 'f7', valueSource: 'field' })
    );
    expectParseCEL(
      parseCEL(`f9 == f1`, { fields, getValueSources }),
      wrapRule({ field: 'f9', operator: '=', value: 'f1', valueSource: 'field' })
    );
    expectParseCEL(
      parseCEL(`f10 == f7`, { fields, getValueSources }),
      wrapRule({ field: 'f10', operator: '=', value: 'f7', valueSource: 'field' })
    );
    expectParseCEL(
      parseCEL(`f10 == f8`, { fields, getValueSources }),
      wrapRule({ field: 'f10', operator: '=', value: 'f8', valueSource: 'field' })
    );
  });

  it('ignores invalid fields', () => {
    // `firstName` is not in the field list
    expectParseCEL(parseCEL(`firstName == 'Steve'`, { fields }), wrapRule());
    // A field cannot be compared to itself
    expectParseCEL(parseCEL(`f1 == f1`, { fields }), wrapRule());
    // A field cannot be compared to itself with a "like" comparison
    expectParseCEL(parseCEL(`f1.contains(f1)`, { fields }), wrapRule());
    // `f1` implicitly forbids the valueSource "field"
    expectParseCEL(parseCEL(`f1 == f2`, { fields }), wrapRule());
    // `f2` explicitly forbids the valueSource "field"
    expectParseCEL(parseCEL(`f2 == f1`, { fields }), wrapRule());
    // `f3` explicitly forbids the valueSource "value"
    expectParseCEL(parseCEL(`f3 == 'Steve'`, { fields }), wrapRule());
    // `f5` implicitly allows the valueSource "field" through getValueSources,
    // but `f7` is not a valid subordinate field
    expectParseCEL(parseCEL(`f5 == f7`, { fields, getValueSources }), wrapRule());
    // `f8` implicitly allows the valueSource "field" through getValueSources,
    // but `f6` is not a valid subordinate field
    expectParseCEL(parseCEL(`f8 == f6`, { fields, getValueSources }), wrapRule());
    // `f9` implicitly allows the valueSource "field" through getValueSources,
    // but `f10` is not a valid subordinate field
    expectParseCEL(parseCEL(`f9 == f10`, { fields, getValueSources }), wrapRule());
    // `f10` implicitly allows the valueSource "field" through getValueSources,
    // but `f5` is not a valid subordinate field
    expectParseCEL(parseCEL(`f10 == f5`, { fields, getValueSources }), wrapRule());
    // independent combinators
    const fieldsForIC = (
      [
        { name: 'f1', label: 'Field 1' },
        { name: 'f3', label: 'Field 3', valueSources: ['field'] },
      ] satisfies Field[]
    ).map(o => toFullOption(o));
    expectParseCELic(
      parseCEL('f1 == f2 && f3 == "f4" && f3 == f4', {
        fields: fieldsForIC,
        independentCombinators: true,
      }),
      wrapRuleIC()
    );
  });
});

it('handles "in" operator', () => {
  expectParseCEL(
    'f1 in ["Test","Test2"]',
    wrapRule({ field: 'f1', operator: 'in', value: 'Test,Test2' })
  );
  expectParseCEL(
    'f1 in ["Te,st","Test2"]',
    wrapRule({ field: 'f1', operator: 'in', value: String.raw`Te\,st,Test2` })
  );
  expectParseCEL(
    'f1 in [f2,f3]',
    wrapRule({ field: 'f1', operator: 'in', value: 'f2,f3', valueSource: 'field' })
  );
  expectParseCEL(
    'f1 in {f2: "v2", "f3": "v3"}',
    wrapRule({ field: 'f1', operator: 'in', value: 'f2,f3' })
  );
  expectParseCEL(
    '!(f1 in ["Test","Test2"])',
    wrapRule({ field: 'f1', operator: 'notIn', value: 'Test,Test2' })
  );
});

it('outputs lists as arrays', () => {
  expectParseCEL(
    parseCEL('f1 in ["Test","Test2"]', { listsAsArrays: true }),
    wrapRule({ field: 'f1', operator: 'in', value: ['Test', 'Test2'] })
  );
  expectParseCEL(
    parseCEL('f1 in [f2,f3]', { listsAsArrays: true }),
    wrapRule({ field: 'f1', operator: 'in', value: ['f2', 'f3'], valueSource: 'field' })
  );
  expectParseCEL(
    parseCEL('f1 in {f2: "v2", "f3": "v3"}', { listsAsArrays: true }),
    wrapRule({ field: 'f1', operator: 'in', value: ['f2', 'f3'] })
  );
});

it('handles multiple negations', () => {
  expectParseCEL(
    '!!!f1.contains("Test")',
    wrapRule({ field: 'f1', operator: 'doesNotContain', value: 'Test' })
  );
  expectParseCEL(
    '!!!!f1.contains("Test")',
    wrapRule({ field: 'f1', operator: 'contains', value: 'Test' })
  );
  expectParseCEL(
    '!!!(f1.contains("Test"))',
    wrapRule({ field: 'f1', operator: 'doesNotContain', value: 'Test' })
  );
  expectParseCEL(
    '!!!!(f1.contains("Test"))',
    wrapRule({ field: 'f1', operator: 'contains', value: 'Test' })
  );
});

it('handles independent combinators', () => {
  expectParseCELic('(f1 == "Test")', { rules: [{ field: 'f1', operator: '=', value: 'Test' }] });
  expectParseCELic('f1 == "Test"', { rules: [{ field: 'f1', operator: '=', value: 'Test' }] });
  expectParseCELic('f1 == "Test" && f2 == "Test2" || f3 == "Test3"', {
    rules: [
      { field: 'f1', operator: '=', value: 'Test' },
      'and',
      { field: 'f2', operator: '=', value: 'Test2' },
      'or',
      { field: 'f3', operator: '=', value: 'Test3' },
    ],
  });
  expectParseCELic('!f1.f2.startsWith("Test") && f3 > 26 || !!f4.f5.endsWith("Test")', {
    rules: [
      { field: 'f1.f2', operator: 'doesNotBeginWith', value: 'Test' },
      'and',
      { field: 'f3', operator: '>', value: 26 },
      'or',
      { field: 'f4.f5', operator: 'endsWith', value: 'Test' },
    ],
  });
});

it('generates IDs', () => {
  expectParseCEL(
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
    '',
    'f1 == f2 ? f3 : f4',
    'f1 == f2("")',
    '(f1 == f2(""))',
    'true',
    'f1 in ["Test",f2]',
    'f1 in {["f2"]: "v2", "f3": "v3"}',
  ];

  for (const pr of expressionsToIgnore) {
    expectParseCEL(pr, wrapRule());
  }
});

it('handles custom expressions', () => {
  expectParseCEL(
    'opted_in_at.isBirthday(-1)',
    wrapRule({ field: 'opted_in_at', operator: 'isBirthday' as DefaultOperatorName, value: -1 }),
    {
      customExpressionHandler: expr => {
        if (
          isCELMember(expr) &&
          isCELIdentifier(expr.left!) &&
          !!expr.right &&
          expr.list?.value.length === 1 &&
          isCELNumericLiteral(expr.list.value[0])
        )
          return {
            field: expr.left.value,
            operator: expr.right.value,
            value: expr.list.value[0].value,
          };
        return null;
      },
    }
  );
});

it('handles custom expressions in subqueries', () => {
  const subqueryFields: FullField[] = [
    { name: 'user', value: 'user', label: 'User' },
    { name: 'user.features', value: 'user.features', label: 'User Features' },
    { name: 'features', value: 'features', label: 'Features' },
    { name: '', value: '', label: 'Empty Field' },
  ];

  expectParseCEL(
    'user.features.exists(elem_alias, elem_alias.matches("tall"))',
    wrapRule({
      field: 'user.features',
      operator: '=',
      match: { mode: 'some' },
      value: {
        combinator: 'and',
        rules: [{ field: '', operator: 'matches' as DefaultOperatorName, value: 'tall' }],
      },
    }),
    {
      fields: subqueryFields,
      customExpressionHandler: expr => {
        if (
          isCELMember(expr) &&
          isCELIdentifier(expr.left!) &&
          !!expr.right &&
          expr.list?.value.length === 1 &&
          isCELStringLiteral(expr.list.value[0])
        )
          return {
            field: expr.left.value,
            operator: expr.right.value,
            value: expr.list.value[0].value.slice(1, -1), // Remove quotes
          };
        return null;
      },
    }
  );
});

describe('subqueries', () => {
  const subqueryFields: FullField[] = [
    { name: 'tourStops', value: 'tourStops', label: 'Tour Stops' },
    { name: 'city', value: 'city', label: 'City' },
    { name: 'stringArray', value: 'stringArray', label: 'String Array' },
    { name: 'users', value: 'users', label: 'Users' },
    { name: 'age', value: 'age', label: 'Age' },
    { name: 'active', value: 'active', label: 'Active' },
    { name: 'products', value: 'products', label: 'Products' },
    { name: 'category.name', value: 'category.name', label: 'Category Name' },
    { name: 'events', value: 'events', label: 'Events' },
    { name: 'type', value: 'type', label: 'Type' },
    { name: 'items', value: 'items', label: 'Items' },
    { name: 'price', value: 'price', label: 'Price' },
    { name: 'tags', value: 'tags', label: 'Tags' },
    { name: 'names', value: 'names', label: 'Names' },
    { name: 'scores', value: 'scores', label: 'Scores' },
    { name: 'email', value: 'email', label: 'Email' },
    { name: 'status', value: 'status', label: 'Status' },
    { name: 'orders', value: 'orders', label: 'Orders' },
    { name: 'total', value: 'total', label: 'Total' },
    { name: 'customer.premium', value: 'customer.premium', label: 'Customer Premium' },
    { name: 'verified', value: 'verified', label: 'Verified' },
    { name: 'admins', value: 'admins', label: 'Admins' },
    { name: '', value: '', label: 'Empty Field' }, // For primitive array operations,
  ];

  describe('.all()', () => {
    it('basic', () => {
      expectParseCEL(
        'tourStops.all(elem_alias, elem_alias.city == "Milan")',
        wrapRule({
          field: 'tourStops',
          operator: '=',
          match: { mode: 'all' },
          value: { combinator: 'and', rules: [{ field: 'city', operator: '=', value: 'Milan' }] },
        }),
        { fields: subqueryFields }
      );
    });

    it('primitive array', () => {
      expectParseCEL(
        'stringArray.all(elem_alias, elem_alias.contains("test"))',
        wrapRule({
          field: 'stringArray',
          operator: '=',
          match: { mode: 'all' },
          value: { combinator: 'and', rules: [{ field: '', operator: 'contains', value: 'test' }] },
        }),
        { fields: subqueryFields }
      );
    });

    it('complex condition', () => {
      expectParseCEL(
        'users.all(user, user.age >= 18 && user.active == true)',
        wrapRule({
          field: 'users',
          operator: '=',
          match: { mode: 'all' },
          value: {
            combinator: 'and',
            rules: [
              { field: 'age', operator: '>=', value: 18 },
              { field: 'active', operator: '=', value: true },
            ],
          },
        }),
        { fields: subqueryFields }
      );
    });
  });

  describe('nested subqueries', () => {
    it('parses depth-suffixed element aliases without shadowing', () => {
      expectParseCEL(
        'tourStops.exists(elem_alias, elem_alias.users.all(elem_alias_1, elem_alias_1.city == "Milan"))',
        wrapRule({
          field: 'tourStops',
          operator: '=',
          match: { mode: 'some' },
          value: {
            combinator: 'and',
            rules: [
              {
                field: 'users',
                operator: '=',
                match: { mode: 'all' },
                value: {
                  combinator: 'and',
                  rules: [{ field: 'city', operator: '=', value: 'Milan' }],
                },
              },
            ],
          },
        }),
        { fields: subqueryFields }
      );
    });
  });

  describe('.exists()', () => {
    it('basic', () => {
      expectParseCEL(
        'tourStops.exists(elem_alias, elem_alias.city == "Milan")',
        wrapRule({
          field: 'tourStops',
          operator: '=',
          match: { mode: 'some' },
          value: { combinator: 'and', rules: [{ field: 'city', operator: '=', value: 'Milan' }] },
        }),
        { fields: subqueryFields }
      );
    });

    it('nested property', () => {
      expectParseCEL(
        'products.exists(item, item.category.name == "Electronics")',
        wrapRule({
          field: 'products',
          operator: '=',
          match: { mode: 'some' },
          value: {
            combinator: 'and',
            rules: [{ field: 'category.name', operator: '=', value: 'Electronics' }],
          },
        }),
        { fields: subqueryFields }
      );
    });

    it('multiple conditions using OR', () => {
      expectParseCEL(
        'events.exists(event, event.type == "click" || event.type == "view")',
        wrapRule({
          field: 'events',
          operator: '=',
          match: { mode: 'some' },
          value: {
            combinator: 'or',
            rules: [
              { field: 'type', operator: '=', value: 'click' },
              { field: 'type', operator: '=', value: 'view' },
            ],
          },
        }),
        { fields: subqueryFields }
      );
    });
  });

  describe('negated .exists() ("none" mode)', () => {
    it('basic negation', () => {
      expectParseCEL(
        '!!!tourStops.exists(elem_alias, elem_alias.city == "Milan")',
        {
          combinator: 'and',
          not: true,
          rules: [
            {
              field: 'tourStops',
              operator: '=',
              match: { mode: 'some' },
              value: {
                combinator: 'and',
                rules: [{ field: 'city', operator: '=', value: 'Milan' }],
              },
            },
          ],
        },

        // Alternative:

        // wrapRule({
        //   field: 'tourStops',
        //   operator: '=',
        //   match: { mode: 'none' },
        //   value: { combinator: 'and', rules: [{ field: 'city', operator: '=', value: 'Milan' }] },
        // }),
        { fields: subqueryFields }
      );
    });

    it('basic negation (ic)', () => {
      expectParseCELic(
        '!!!tourStops.exists(elem_alias, elem_alias.city == "Milan")',
        {
          not: true,
          rules: [
            {
              field: 'tourStops',
              operator: '=',
              match: { mode: 'some' },
              value: { rules: [{ field: 'city', operator: '=', value: 'Milan' }] },
            },
          ],
        },
        { fields: subqueryFields }
      );
    });

    it('group negation', () => {
      expectParseCEL(
        '!tourStops.all(elem_alias, elem_alias.city == "Milan" || elem_alias.city == "Siena")',
        {
          combinator: 'and',
          not: true,
          rules: [
            {
              field: 'tourStops',
              operator: '=',
              match: { mode: 'all' },
              value: {
                combinator: 'or',
                rules: [
                  { field: 'city', operator: '=', value: 'Milan' },
                  { field: 'city', operator: '=', value: 'Siena' },
                ],
              },
            },
          ],
        },
        { fields: subqueryFields }
      );
    });

    it('group negation (ic)', () => {
      expectParseCELic(
        '!tourStops.all(elem_alias, elem_alias.city == "Milan" || elem_alias.city == "Siena")',
        {
          not: true,
          rules: [
            {
              field: 'tourStops',
              operator: '=',
              match: { mode: 'all' },
              value: {
                rules: [
                  { field: 'city', operator: '=', value: 'Milan' },
                  'or',
                  { field: 'city', operator: '=', value: 'Siena' },
                ],
              },
            },
          ],
        },
        { fields: subqueryFields }
      );
    });

    it('with parentheses', () => {
      expectParseCEL(
        '!(items.exists(item, item.price > 100))',
        {
          combinator: 'and',
          not: true,
          rules: [
            {
              combinator: 'and',
              rules: [
                {
                  field: 'items',
                  operator: '=',
                  match: { mode: 'some' },
                  value: {
                    combinator: 'and',
                    rules: [{ field: 'price', operator: '>', value: 100 }],
                  },
                },
              ],
            },
          ],
        },
        { fields: subqueryFields }
      );
    });
  });

  describe('various operators', () => {
    it('contains operator', () => {
      expectParseCEL(
        'tags.exists(tag, tag.contains("important"))',
        wrapRule({
          field: 'tags',
          operator: '=',
          match: { mode: 'some' },
          value: {
            combinator: 'and',
            rules: [{ field: '', operator: 'contains', value: 'important' }],
          },
        }),
        { fields: subqueryFields }
      );
    });

    it('startsWith operator', () => {
      expectParseCEL(
        'names.all(name, name.startsWith("Mr"))',
        wrapRule({
          field: 'names',
          operator: '=',
          match: { mode: 'all' },
          value: { combinator: 'and', rules: [{ field: '', operator: 'beginsWith', value: 'Mr' }] },
        }),
        { fields: subqueryFields }
      );
    });

    it('numeric comparison', () => {
      expectParseCEL(
        'scores.exists(score, score >= 90)',
        wrapRule({
          field: 'scores',
          operator: '=',
          match: { mode: 'some' },
          value: { combinator: 'and', rules: [{ field: '', operator: '>=', value: 90 }] },
        }),
        { fields: subqueryFields }
      );
    });

    it('null checks', () => {
      expectParseCEL(
        'users.all(user, user.email != null)',
        wrapRule({
          field: 'users',
          operator: '=',
          match: { mode: 'all' },
          value: {
            combinator: 'and',
            rules: [{ field: 'email', operator: 'notNull', value: null }],
          },
        }),
        { fields: subqueryFields }
      );
    });
  });

  describe('ic', () => {
    it('.exists()', () => {
      expectParseCELic(
        'items.exists(item, item.price > 50)',
        {
          rules: [
            {
              field: 'items',
              operator: '=',
              match: { mode: 'some' },
              value: { rules: [{ field: 'price', operator: '>', value: 50 }] },
            },
          ],
        },
        { fields: subqueryFields }
      );
    });

    it('.all()', () => {
      expectParseCELic(
        'users.all(user, user.active == true)',
        {
          rules: [
            {
              field: 'users',
              operator: '=',
              match: { mode: 'all' },
              value: { rules: [{ field: 'active', operator: '=', value: true }] },
            },
          ],
        },
        { fields: subqueryFields }
      );
    });
  });

  it('complex nested properties', () => {
    expectParseCEL(
      'orders.exists(order, order.total > 100 && order.status == "shipped" && order.customer.premium == true)',
      wrapRule({
        field: 'orders',
        operator: '=',
        match: { mode: 'some' },
        value: {
          combinator: 'and',
          rules: [
            { field: 'total', operator: '>', value: 100 },
            { field: 'status', operator: '=', value: 'shipped' },
            { field: 'customer.premium', operator: '=', value: true },
          ],
        },
      }),
      { fields: subqueryFields }
    );
  });

  it('subqueries in larger expressions', () => {
    expectParseCEL(
      'status == "active" && items.exists(item, item.price > 100)',
      wrapRule([
        { field: 'status', operator: '=', value: 'active' },
        {
          field: 'items',
          operator: '=',
          match: { mode: 'some' },
          value: { combinator: 'and', rules: [{ field: 'price', operator: '>', value: 100 }] },
        },
      ]),
      { fields: subqueryFields }
    );

    expectParseCEL(
      'users.all(user, user.verified == true) || admins.exists(admin, admin.active == true)',
      wrapRule(
        [
          {
            field: 'users',
            operator: '=',
            match: { mode: 'all' },
            value: {
              combinator: 'and',
              rules: [{ field: 'verified', operator: '=', value: true }],
            },
          },
          {
            field: 'admins',
            operator: '=',
            match: { mode: 'some' },
            value: { combinator: 'and', rules: [{ field: 'active', operator: '=', value: true }] },
          },
        ],
        'or'
      ),
      { fields: subqueryFields }
    );
  });

  it('returns empty query for invalid subquery syntax', () => {
    // Missing second argument
    expectParseCEL(
      'tourStops.all(elem_alias)',
      { combinator: 'and', rules: [] },
      { fields: subqueryFields }
    );

    // Commented out: Ignore extra arguments
    // // Too many arguments
    // testParseCEL(
    //   'tourStops.exists(elem_alias, elem_alias.city == "Milan", extra)',
    //   { combinator: 'and', rules: [] },
    //   { fields: subqueryFields }
    // );

    // Invalid method name
    expectParseCEL(
      'tourStops.some(elem_alias, elem_alias.city == "Milan")',
      { combinator: 'and', rules: [] },
      { fields: subqueryFields }
    );

    // Non-identifier as field
    expectParseCEL(
      '"literal".all(elem_alias, elem_alias == "test")',
      { combinator: 'and', rules: [] },
      { fields: subqueryFields }
    );
  });

  describe('alias transformation edge cases', () => {
    it('transforms like expressions with alias', () => {
      expectParseCEL(
        'tourStops.exists(tourStop, tourStop.city.contains("Las "))',
        wrapRule({
          field: 'tourStops',
          operator: '=',
          match: { mode: 'some' },
          value: {
            combinator: 'and',
            rules: [{ field: 'city', operator: 'contains', value: 'Las ' }],
          },
        }),
        { fields: subqueryFields }
      );
    });

    it('transforms negated like expressions with alias', () => {
      expectParseCEL(
        'items.exists(item, !item.contains("test"))',
        wrapRule({
          field: 'items',
          operator: '=',
          match: { mode: 'some' },
          value: {
            combinator: 'and',
            rules: [{ field: '', operator: 'doesNotContain', value: 'test' }],
          },
        }),
        { fields: subqueryFields }
      );
    });

    it('transforms expressions with expression groups', () => {
      expectParseCEL(
        'items.exists(item, (item.price > 100))',
        wrapRule({
          field: 'items',
          operator: '=',
          match: { mode: 'some' },
          value: { combinator: 'and', rules: [{ field: 'price', operator: '>', value: 100 }] },
        }),
        { fields: subqueryFields }
      );
    });

    it('transforms expressions with multiple negations', () => {
      expectParseCEL(
        'items.all(item, !!(item.active == true))',
        wrapRule({
          field: 'items',
          operator: '=',
          match: { mode: 'all' },
          value: { combinator: 'and', rules: [{ field: 'active', operator: '=', value: true }] },
        }),
        { fields: subqueryFields }
      );
    });

    it('transforms like expressions with alias', () => {
      expectParseCEL(
        'items.exists(item, item.contains("test"))',
        wrapRule({
          field: 'items',
          operator: '=',
          match: { mode: 'some' },
          value: { combinator: 'and', rules: [{ field: '', operator: 'contains', value: 'test' }] },
        }),
        { fields: subqueryFields }
      );
    });

    it('transforms complex nested expressions with negated like expressions', () => {
      expectParseCEL(
        'items.exists(item, item.name.contains("test") && !item.description.contains("old"))',
        { combinator: 'and', rules: [] },
        { fields: subqueryFields }
      );
    });
  });
});
