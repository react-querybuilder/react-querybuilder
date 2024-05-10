import type {
  DefaultCombinatorName,
  DefaultRuleGroupType,
  DefaultRuleGroupTypeIC,
  DefaultRuleType,
  Field,
  FullField,
  OptionGroup,
  ValueSources,
} from '../../types/index.noReact';
import { toFullOption } from '../toFullOption';
import { parseCEL } from './parseCEL';

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

const testParseCEL = (
  parseResult: DefaultRuleGroupType | string,
  expectedResult: DefaultRuleGroupType
) => {
  expect(typeof parseResult === 'string' ? parseCEL(parseResult) : parseResult).toEqual(
    expectedResult
  );
};
const testParseCELic = (
  parseResult: DefaultRuleGroupTypeIC | string,
  expectedResult: DefaultRuleGroupTypeIC
) => {
  expect(
    typeof parseResult === 'string'
      ? parseCEL(parseResult, { independentCombinators: true })
      : parseResult
  ).toEqual(expectedResult);
};

it('works for basic relations', () => {
  testParseCEL('f1 == "Test"', wrapRule({ field: 'f1', operator: '=', value: 'Test' }));
  testParseCEL('f1.f2 == "Test"', wrapRule({ field: 'f1.f2', operator: '=', value: 'Test' }));
  testParseCEL('f1.f2.f3 == "Test"', wrapRule({ field: 'f1.f2.f3', operator: '=', value: 'Test' }));
  testParseCEL('(f1 == "Test")', wrapRule({ field: 'f1', operator: '=', value: 'Test' }));
  testParseCEL('f1 != "Test"', wrapRule({ field: 'f1', operator: '!=', value: 'Test' }));
  testParseCEL('f1 > 1', wrapRule({ field: 'f1', operator: '>', value: 1 }));
  testParseCEL('f1 >= 1', wrapRule({ field: 'f1', operator: '>=', value: 1 }));
  testParseCEL('f1 < 1', wrapRule({ field: 'f1', operator: '<', value: 1 }));
  testParseCEL('f1 <= 1', wrapRule({ field: 'f1', operator: '<=', value: 1 }));
  testParseCEL('f1 == 12.14', wrapRule({ field: 'f1', operator: '=', value: 12.14 }));
  // TODO: fix hexadecimal processing
  // testParseCEL('f1 == 0x1214', wrapRule({ field: 'f1', operator: '=', value: 0x1214 }));
  // testParseCEL('f1 == 0x1214u', wrapRule({ field: 'f1', operator: '=', value: 0x1214 }));
  testParseCEL('f1 == 1214u', wrapRule({ field: 'f1', operator: '=', value: 1214 }));
  testParseCEL('f1 == null', wrapRule({ field: 'f1', operator: 'null', value: null }));
  testParseCEL('f1 != null', wrapRule({ field: 'f1', operator: 'notNull', value: null }));
  testParseCEL('f1 == true', wrapRule({ field: 'f1', operator: '=', value: true }));
  testParseCEL('f1 == false', wrapRule({ field: 'f1', operator: '=', value: false }));
  // flips operators
  testParseCEL('"Test" == f1', wrapRule({ field: 'f1', operator: '=', value: 'Test' }));
  testParseCEL('"Test" == f1.f2', wrapRule({ field: 'f1.f2', operator: '=', value: 'Test' }));
  testParseCEL('"Test" == f1.f2.f3', wrapRule({ field: 'f1.f2.f3', operator: '=', value: 'Test' }));
  testParseCEL('1214 > f1', wrapRule({ field: 'f1', operator: '<', value: 1214 }));
  testParseCEL('1214 >= f1', wrapRule({ field: 'f1', operator: '<=', value: 1214 }));
  testParseCEL('1214 < f1', wrapRule({ field: 'f1', operator: '>', value: 1214 }));
  testParseCEL('1214 <= f1', wrapRule({ field: 'f1', operator: '>=', value: 1214 }));
});

it('handles every letter within strings', () => {
  for (const value of 'abcdefghijklmnopqrstuvwxyz') {
    testParseCEL(`f1 == "${value}"`, wrapRule({ field: 'f1', operator: '=', value }));
  }
});

it('handles multi-line strings', () => {
  for (const q of `'"`) {
    testParseCEL(
      `f1 == ${q}${q}${q}multi-line\nstring${q}${q}${q}`,
      wrapRule({ field: 'f1', operator: '=', value: 'multi-line\nstring' })
    );
  }
});

it('handles "like" comparisons', () => {
  testParseCEL(
    'f1.contains("Test")',
    wrapRule({ field: 'f1', operator: 'contains', value: 'Test' })
  );
  testParseCEL(
    'f1.f2.f3.contains("Test")',
    wrapRule({ field: 'f1.f2.f3', operator: 'contains', value: 'Test' })
  );
  testParseCEL(
    'f1.startsWith("Test")',
    wrapRule({ field: 'f1', operator: 'beginsWith', value: 'Test' })
  );
  testParseCEL(
    'f1.endsWith("Test")',
    wrapRule({ field: 'f1', operator: 'endsWith', value: 'Test' })
  );
  testParseCEL(
    'f1.contains(f2)',
    wrapRule({ field: 'f1', operator: 'contains', value: 'f2', valueSource: 'field' })
  );
  testParseCEL(
    'f1.startsWith(f2)',
    wrapRule({ field: 'f1', operator: 'beginsWith', value: 'f2', valueSource: 'field' })
  );
  testParseCEL(
    'f1.endsWith(f2)',
    wrapRule({ field: 'f1', operator: 'endsWith', value: 'f2', valueSource: 'field' })
  );
});

it('negates "like" comparisons', () => {
  testParseCEL(
    '!f1.contains("Test")',
    wrapRule({ field: 'f1', operator: 'doesNotContain', value: 'Test' })
  );
  testParseCEL(
    '!f1.contains(f2)',
    wrapRule({ field: 'f1', operator: 'doesNotContain', value: 'f2', valueSource: 'field' })
  );
  testParseCEL(
    '!f1.f2.contains("Test")',
    wrapRule({ field: 'f1.f2', operator: 'doesNotContain', value: 'Test' })
  );
  testParseCEL(
    '!(f1.contains("Test"))',
    wrapRule({ field: 'f1', operator: 'doesNotContain', value: 'Test' })
  );
  testParseCEL(
    '!(f1.startsWith("Test"))',
    wrapRule({ field: 'f1', operator: 'doesNotBeginWith', value: 'Test' })
  );
  testParseCEL(
    '!(f1.f2.startsWith("Test"))',
    wrapRule({ field: 'f1.f2', operator: 'doesNotBeginWith', value: 'Test' })
  );
  testParseCEL(
    '!(f1.endsWith("Test"))',
    wrapRule({ field: 'f1', operator: 'doesNotEndWith', value: 'Test' })
  );
});

it('groups only when necessary', () => {
  testParseCEL('(f1 == "Test" || f2 == "Test2")', {
    combinator: 'or',
    rules: [
      { field: 'f1', operator: '=', value: 'Test' },
      { field: 'f2', operator: '=', value: 'Test2' },
    ],
  });
  testParseCEL('((f1 == "Test" || f2 == "Test2"))', {
    combinator: 'or',
    rules: [
      { field: 'f1', operator: '=', value: 'Test' },
      { field: 'f2', operator: '=', value: 'Test2' },
    ],
  });
});

it('handles parentheses', () => {
  testParseCEL('(f1 == "Test" || f2 == "Test2") && f3 == "Test3"', {
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
  testParseCEL(
    '(((f1.contains("Test"))))',
    wrapRule({ field: 'f1', operator: 'contains', value: 'Test' })
  );
});

it('works for conditional and/or', () => {
  testParseCEL(
    'f1 == "Test" && f2 == "Test2"',
    wrapRule([
      { field: 'f1', operator: '=', value: 'Test' },
      { field: 'f2', operator: '=', value: 'Test2' },
    ])
  );
  testParseCEL(
    'f1 == "Test" || f2 == "Test2"',
    wrapRule(
      [
        { field: 'f1', operator: '=', value: 'Test' },
        { field: 'f2', operator: '=', value: 'Test2' },
      ],
      'or'
    )
  );
  testParseCEL('f1 == "Test" && f2 == "Test2" || f3 == "Test3"', {
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
  testParseCEL(`firstName == 'Steve' && lastName == 'Vai' || middleName == null`, {
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
  testParseCEL(
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
  testParseCEL(
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
  testParseCEL(`firstName == 'Steve' || lastName == 'Vai' && middleName == null`, {
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
  testParseCEL(`firstName == 'Steve' || lastName == 'Vai' || f1 == 'v1' && f2 == 'v2'`, {
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
    testParseCEL(
      parseCEL(`f1 == 'Steve'`, { fields }),
      wrapRule({ field: 'f1', operator: '=', value: 'Steve' })
    );
    // fields as option groups
    testParseCEL(
      parseCEL(`f3 == f1`, { fields: optionGroups }),
      wrapRule({ field: 'f3', operator: '=', value: 'f1', valueSource: 'field' })
    );
    // fields as object
    testParseCEL(
      parseCEL(`f3 == f1`, { fields: fieldsObject }),
      wrapRule({ field: 'f3', operator: '=', value: 'f1', valueSource: 'field' })
    );
    // `f3` and `f4` allow the valueSource "field" and have no filter
    const baseFields = ['f3', 'f4'];
    for (const baseField of baseFields) {
      for (const f of fields) {
        testParseCEL(
          parseCEL(`${baseField} == ${f.name}`, { fields }),
          f.name === baseField
            ? wrapRule()
            : wrapRule({ field: baseField, operator: '=', value: f.name, valueSource: 'field' })
        );
      }
    }
  });

  it('uses the getValueSources option', () => {
    testParseCEL(
      parseCEL(`f5 == f6`, { fields, getValueSources }),
      wrapRule({ field: 'f5', operator: '=', value: 'f6', valueSource: 'field' })
    );
    testParseCEL(
      parseCEL(`f8 == f7`, { fields, getValueSources }),
      wrapRule({ field: 'f8', operator: '=', value: 'f7', valueSource: 'field' })
    );
    testParseCEL(
      parseCEL(`f9 == f1`, { fields, getValueSources }),
      wrapRule({ field: 'f9', operator: '=', value: 'f1', valueSource: 'field' })
    );
    testParseCEL(
      parseCEL(`f10 == f7`, { fields, getValueSources }),
      wrapRule({ field: 'f10', operator: '=', value: 'f7', valueSource: 'field' })
    );
    testParseCEL(
      parseCEL(`f10 == f8`, { fields, getValueSources }),
      wrapRule({ field: 'f10', operator: '=', value: 'f8', valueSource: 'field' })
    );
  });

  it('ignores invalid fields', () => {
    // `firstName` is not in the field list
    testParseCEL(parseCEL(`firstName == 'Steve'`, { fields }), wrapRule());
    // A field cannot be compared to itself
    testParseCEL(parseCEL(`f1 == f1`, { fields }), wrapRule());
    // A field cannot be compared to itself with a "like" comparison
    testParseCEL(parseCEL(`f1.contains(f1)`, { fields }), wrapRule());
    // `f1` implicitly forbids the valueSource "field"
    testParseCEL(parseCEL(`f1 == f2`, { fields }), wrapRule());
    // `f2` explicitly forbids the valueSource "field"
    testParseCEL(parseCEL(`f2 == f1`, { fields }), wrapRule());
    // `f3` explicitly forbids the valueSource "value"
    testParseCEL(parseCEL(`f3 == 'Steve'`, { fields }), wrapRule());
    // `f5` implicitly allows the valueSource "field" through getValueSources,
    // but `f7` is not a valid subordinate field
    testParseCEL(parseCEL(`f5 == f7`, { fields, getValueSources }), wrapRule());
    // `f8` implicitly allows the valueSource "field" through getValueSources,
    // but `f6` is not a valid subordinate field
    testParseCEL(parseCEL(`f8 == f6`, { fields, getValueSources }), wrapRule());
    // `f9` implicitly allows the valueSource "field" through getValueSources,
    // but `f10` is not a valid subordinate field
    testParseCEL(parseCEL(`f9 == f10`, { fields, getValueSources }), wrapRule());
    // `f10` implicitly allows the valueSource "field" through getValueSources,
    // but `f5` is not a valid subordinate field
    testParseCEL(parseCEL(`f10 == f5`, { fields, getValueSources }), wrapRule());
    // independent combinators
    const fieldsForIC = (
      [
        { name: 'f1', label: 'Field 1' },
        { name: 'f3', label: 'Field 3', valueSources: ['field'] },
      ] satisfies Field[]
    ).map(o => toFullOption(o));
    testParseCELic(
      parseCEL('f1 == f2 && f3 == "f4" && f3 == f4', {
        fields: fieldsForIC,
        independentCombinators: true,
      }),
      wrapRuleIC()
    );
  });
});

it('handles "in" operator', () => {
  testParseCEL(
    'f1 in ["Test","Test2"]',
    wrapRule({ field: 'f1', operator: 'in', value: 'Test,Test2' })
  );
  testParseCEL(
    'f1 in [f2,f3]',
    wrapRule({
      field: 'f1',
      operator: 'in',
      value: 'f2,f3',
      valueSource: 'field',
    })
  );
  testParseCEL(
    'f1 in {f2: "v2", "f3": "v3"}',
    wrapRule({ field: 'f1', operator: 'in', value: 'f2,f3' })
  );
});

it('outputs lists as arrays', () => {
  testParseCEL(
    parseCEL('f1 in ["Test","Test2"]', { listsAsArrays: true }),
    wrapRule({ field: 'f1', operator: 'in', value: ['Test', 'Test2'] })
  );
  testParseCEL(
    parseCEL('f1 in [f2,f3]', { listsAsArrays: true }),
    wrapRule({ field: 'f1', operator: 'in', value: ['f2', 'f3'], valueSource: 'field' })
  );
  testParseCEL(
    parseCEL('f1 in {f2: "v2", "f3": "v3"}', { listsAsArrays: true }),
    wrapRule({ field: 'f1', operator: 'in', value: ['f2', 'f3'] })
  );
});

it('handles multiple negations', () => {
  testParseCEL(
    '!!!f1.contains("Test")',
    wrapRule({ field: 'f1', operator: 'doesNotContain', value: 'Test' })
  );
  testParseCEL(
    '!!!!f1.contains("Test")',
    wrapRule({ field: 'f1', operator: 'contains', value: 'Test' })
  );
  testParseCEL(
    '!!!(f1.contains("Test"))',
    wrapRule({ field: 'f1', operator: 'doesNotContain', value: 'Test' })
  );
  testParseCEL(
    '!!!!(f1.contains("Test"))',
    wrapRule({ field: 'f1', operator: 'contains', value: 'Test' })
  );
});

it('handles independent combinators', () => {
  testParseCELic('(f1 == "Test")', {
    rules: [{ field: 'f1', operator: '=', value: 'Test' }],
  });
  testParseCELic('f1 == "Test"', {
    rules: [{ field: 'f1', operator: '=', value: 'Test' }],
  });
  testParseCELic('f1 == "Test" && f2 == "Test2" || f3 == "Test3"', {
    rules: [
      { field: 'f1', operator: '=', value: 'Test' },
      'and',
      { field: 'f2', operator: '=', value: 'Test2' },
      'or',
      { field: 'f3', operator: '=', value: 'Test3' },
    ],
  });
  testParseCELic('!f1.f2.startsWith("Test") && f3 > 26 || !!f4.f5.endsWith("Test")', {
    rules: [
      { field: 'f1.f2', operator: 'doesNotBeginWith', value: 'Test' },
      'and',
      { field: 'f3', operator: '>', value: 26 },
      'or',
      { field: 'f4.f5', operator: 'endsWith', value: 'Test' },
    ],
  });
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
    testParseCEL(pr, wrapRule());
  }
});
