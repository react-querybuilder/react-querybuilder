import type {
  DefaultCombinatorName,
  DefaultRuleGroupType,
  DefaultRuleGroupTypeIC,
  DefaultRuleType,
  Except,
  Field,
  FullField,
  OptionGroup,
  ValueSources,
} from '../../types/index.noReact';
import { toFullOption } from '../optGroupUtils';
import type { ParseJSONataOptions } from './parseJSONata';
import { parseJSONata } from './parseJSONata';

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

const testParseJSONata = (
  parseResult: DefaultRuleGroupType | string,
  expectedResult: DefaultRuleGroupType,
  options?: Except<ParseJSONataOptions, 'independentCombinators'>
) => {
  expect(
    typeof parseResult === 'string'
      ? options
        ? parseJSONata(parseResult, options)
        : parseJSONata(parseResult)
      : parseResult
  ).toEqual(expectedResult);
};
const testParseJSONataIC = (
  parseResult: DefaultRuleGroupTypeIC | string,
  expectedResult: DefaultRuleGroupTypeIC,
  options?: Except<ParseJSONataOptions, 'independentCombinators'>
) => {
  expect(
    typeof parseResult === 'string'
      ? parseJSONata(parseResult, { ...options, independentCombinators: true })
      : parseResult
  ).toEqual(expectedResult);
};

// oxlint-disable-next-line expect-expect
it('works for basic relations', () => {
  testParseJSONata('f1 = "Test"', wrapRule({ field: 'f1', operator: '=', value: 'Test' }));
  testParseJSONata('f1.f2 = "Test"', wrapRule({ field: 'f1.f2', operator: '=', value: 'Test' }));
  testParseJSONata(
    'f1.f2.f3 = "Test"',
    wrapRule({ field: 'f1.f2.f3', operator: '=', value: 'Test' })
  );
  testParseJSONata('(f1 = "Test")', wrapRule({ field: 'f1', operator: '=', value: 'Test' }));
  testParseJSONata('f1 != "Test"', wrapRule({ field: 'f1', operator: '!=', value: 'Test' }));
  testParseJSONata('f1 > 1', wrapRule({ field: 'f1', operator: '>', value: 1 }));
  testParseJSONata('f1 >= 1', wrapRule({ field: 'f1', operator: '>=', value: 1 }));
  testParseJSONata('f1 < 1', wrapRule({ field: 'f1', operator: '<', value: 1 }));
  testParseJSONata('f1 <= 1', wrapRule({ field: 'f1', operator: '<=', value: 1 }));
  testParseJSONata('f1 = 12.14', wrapRule({ field: 'f1', operator: '=', value: 12.14 }));
  // TODO: does JSONata support hexadecimal?
  // testParseJSONata('f1 = 0x1214', wrapRule({ field: 'f1', operator: '=', value: 0x1214 }));
  // testParseJSONata('f1 = 0x1214u', wrapRule({ field: 'f1', operator: '=', value: 0x1214 }));
  // testParseJSONata('f1 = 1214u', wrapRule({ field: 'f1', operator: '=', value: 1214 }));
  testParseJSONata('f1 = null', wrapRule({ field: 'f1', operator: 'null', value: null }));
  testParseJSONata('f1 != null', wrapRule({ field: 'f1', operator: 'notNull', value: null }));
  testParseJSONata('f1 = true', wrapRule({ field: 'f1', operator: '=', value: true }));
  testParseJSONata('f1 = false', wrapRule({ field: 'f1', operator: '=', value: false }));
  // flips operators
  testParseJSONata('"Test" = f1', wrapRule({ field: 'f1', operator: '=', value: 'Test' }));
  testParseJSONata('"Test" = f1.f2', wrapRule({ field: 'f1.f2', operator: '=', value: 'Test' }));
  testParseJSONata(
    '"Test" = f1.f2.f3',
    wrapRule({ field: 'f1.f2.f3', operator: '=', value: 'Test' })
  );
  testParseJSONata('1214 > f1', wrapRule({ field: 'f1', operator: '<', value: 1214 }));
  testParseJSONata('1214 >= f1', wrapRule({ field: 'f1', operator: '<=', value: 1214 }));
  testParseJSONata('1214 < f1', wrapRule({ field: 'f1', operator: '>', value: 1214 }));
  testParseJSONata('1214 <= f1', wrapRule({ field: 'f1', operator: '>=', value: 1214 }));
});

// oxlint-disable-next-line expect-expect
it.each([
  { t: testParseJSONata, w: wrapRule, rgt: '' },
  { t: testParseJSONataIC, w: wrapRuleIC, rgt: ' (ic)' },
  // oxlint-disable-next-line typescript/no-explicit-any
])('compacts "between" rule groups$rgt', ({ t, w }: any) => {
  t('f1 >= 0 and f1 <= 1', w({ field: 'f1', operator: 'between', value: [0, 1] }));
  t('f1 <= 1 and f1 >= 0', w({ field: 'f1', operator: 'between', value: [0, 1] }));
  t('f1 < 0 or f1 > 1', w({ field: 'f1', operator: 'notBetween', value: [0, 1] }));
  t('f1 > 1 or f1 < 0', w({ field: 'f1', operator: 'notBetween', value: [0, 1] }));
  t(
    'f1 >= f2 and f1 <= f3',
    w({ field: 'f1', operator: 'between', value: ['f2', 'f3'], valueSource: 'field' })
  );
});

// oxlint-disable-next-line expect-expect
it('handles every letter within strings', () => {
  for (const value of 'abcdefghijklmnopqrstuvwxyz') {
    testParseJSONata(`f1 = "${value}"`, wrapRule({ field: 'f1', operator: '=', value }));
  }
});

// oxlint-disable-next-line expect-expect
it('handles multi-line strings', () => {
  testParseJSONata(
    `f1 = "multi-line\nstring"`,
    wrapRule({ field: 'f1', operator: '=', value: 'multi-line\nstring' })
  );
});

// oxlint-disable-next-line expect-expect
it('handles "like" comparisons', () => {
  testParseJSONata(
    '$contains(f1, "Test")',
    wrapRule({ field: 'f1', operator: 'contains', value: 'Test' })
  );
  testParseJSONata(
    '$contains(f1.f2.f3, "Test")',
    wrapRule({ field: 'f1.f2.f3', operator: 'contains', value: 'Test' })
  );
  testParseJSONata(
    '$contains(f1, /Test/i)',
    wrapRule({ field: 'f1', operator: 'contains', value: new RegExp('Test', 'gi') })
  );
  testParseJSONata(
    '$contains(f1, f2)',
    wrapRule({
      field: 'f1',
      operator: 'contains',
      value: 'f2',
      valueSource: 'field',
    })
  );
});

// oxlint-disable-next-line expect-expect
it('negates "like" comparisons', () => {
  testParseJSONata(
    '$not($contains(f1, "Test"))',
    wrapRule({ field: 'f1', operator: 'doesNotContain', value: 'Test' })
  );
});

// oxlint-disable-next-line expect-expect
it('handles date values', () => {
  testParseJSONata(
    'birthDate = $toMillis("1954-10-03")',
    wrapRule({ field: 'birthDate', operator: '=', value: '1954-10-03' })
  );
  testParseJSONata(
    'birthDate = $toMillis("1960-06-06", "invalid-format-string")',
    wrapRule({ field: 'birthDate', operator: '=', value: '1960-06-06' })
  );
});

// oxlint-disable-next-line expect-expect
it('groups only when necessary', () => {
  testParseJSONata('(f1 = "Test" or f2 = "Test2")', {
    combinator: 'or',
    rules: [
      { field: 'f1', operator: '=', value: 'Test' },
      { field: 'f2', operator: '=', value: 'Test2' },
    ],
  });
  testParseJSONata('((f1 = "Test" or f2 = "Test2"))', {
    combinator: 'or',
    rules: [
      { field: 'f1', operator: '=', value: 'Test' },
      { field: 'f2', operator: '=', value: 'Test2' },
    ],
  });
});

// oxlint-disable-next-line expect-expect
it('handles parentheses', () => {
  testParseJSONata('(f1 = "Test" or f2 = "Test2") and f3 = "Test3"', {
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
  testParseJSONata(
    '((($contains(f1, "Test"))))',
    wrapRule({ field: 'f1', operator: 'contains', value: 'Test' })
  );
});

// oxlint-disable-next-line expect-expect
it('works for conditional and/or', () => {
  testParseJSONata(
    'f1 = "Test" and f2 = "Test2"',
    wrapRule([
      { field: 'f1', operator: '=', value: 'Test' },
      { field: 'f2', operator: '=', value: 'Test2' },
    ])
  );
  testParseJSONata(
    'f1 = "Test" or f2 = "Test2"',
    wrapRule(
      [
        { field: 'f1', operator: '=', value: 'Test' },
        { field: 'f2', operator: '=', value: 'Test2' },
      ],
      'or'
    )
  );
  testParseJSONata('f1 = "Test" and f2 = "Test2" or f3 = "Test3"', {
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

// oxlint-disable-next-line expect-expect
it('mixed and/or', () => {
  testParseJSONata(`firstName = 'Steve' and lastName = 'Vai' or middleName = null`, {
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
  testParseJSONata(
    `firstName = 'Steve' and lastName = 'Vai' or middleName = null or isMusician = true`,
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
  testParseJSONata(
    `firstName = 'Steve' and lastName = 'Vai' or middleName = null or isMusician = true or fieldName = 'Test'`,
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
  testParseJSONata(`firstName = 'Steve' or lastName = 'Vai' and middleName = null`, {
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
  testParseJSONata(`firstName = 'Steve' or lastName = 'Vai' or f1 = 'v1' and f2 = 'v2'`, {
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

  // oxlint-disable-next-line expect-expect
  it('sets the valueSource when fields are valid', () => {
    testParseJSONata(
      parseJSONata(`f1 = 'Steve'`, { fields }),
      wrapRule({ field: 'f1', operator: '=', value: 'Steve' })
    );
    // fields as option groups
    testParseJSONata(
      parseJSONata(`f3 = f1`, { fields: optionGroups }),
      wrapRule({
        field: 'f3',
        operator: '=',
        value: 'f1',
        valueSource: 'field',
      })
    );
    // fields as object
    testParseJSONata(
      parseJSONata(`f3 = f1`, { fields: fieldsObject }),
      wrapRule({
        field: 'f3',
        operator: '=',
        value: 'f1',
        valueSource: 'field',
      })
    );
    // `f3` and `f4` allow the valueSource "field" and have no filter
    const baseFields = ['f3', 'f4'];
    for (const baseField of baseFields) {
      for (const f of fields) {
        testParseJSONata(
          parseJSONata(`${baseField} = ${f.name}`, { fields }),
          f.name === baseField
            ? wrapRule()
            : wrapRule({
                field: baseField,
                operator: '=',
                value: f.name,
                valueSource: 'field',
              })
        );
      }
    }
  });

  // oxlint-disable-next-line expect-expect
  it('uses the getValueSources option', () => {
    testParseJSONata(
      parseJSONata(`f5 = f6`, { fields, getValueSources }),
      wrapRule({
        field: 'f5',
        operator: '=',
        value: 'f6',
        valueSource: 'field',
      })
    );
    testParseJSONata(
      parseJSONata(`f8 = f7`, { fields, getValueSources }),
      wrapRule({
        field: 'f8',
        operator: '=',
        value: 'f7',
        valueSource: 'field',
      })
    );
    testParseJSONata(
      parseJSONata(`f9 = f1`, { fields, getValueSources }),
      wrapRule({
        field: 'f9',
        operator: '=',
        value: 'f1',
        valueSource: 'field',
      })
    );
    testParseJSONata(
      parseJSONata(`f10 = f7`, { fields, getValueSources }),
      wrapRule({
        field: 'f10',
        operator: '=',
        value: 'f7',
        valueSource: 'field',
      })
    );
    testParseJSONata(
      parseJSONata(`f10 = f8`, { fields, getValueSources }),
      wrapRule({
        field: 'f10',
        operator: '=',
        value: 'f8',
        valueSource: 'field',
      })
    );
  });

  // oxlint-disable-next-line expect-expect
  it('ignores invalid fields', () => {
    // `firstName` is not in the field list
    testParseJSONata(parseJSONata(`firstName = 'Steve'`, { fields }), wrapRule());
    // A field cannot be compared to itself
    testParseJSONata(parseJSONata(`f1 = f1`, { fields }), wrapRule());
    // A field cannot be compared to itself with a "like" comparison
    testParseJSONata(parseJSONata(`$contains(f1, f1)`, { fields }), wrapRule());
    // `f1` implicitly forbids the valueSource "field"
    testParseJSONata(parseJSONata(`f1 = f2`, { fields }), wrapRule());
    // `f2` explicitly forbids the valueSource "field"
    testParseJSONata(parseJSONata(`f2 = f1`, { fields }), wrapRule());
    // `f3` explicitly forbids the valueSource "value"
    testParseJSONata(parseJSONata(`f3 = 'Steve'`, { fields }), wrapRule());
    // `f5` implicitly allows the valueSource "field" through getValueSources,
    // but `f7` is not a valid subordinate field
    testParseJSONata(parseJSONata(`f5 = f7`, { fields, getValueSources }), wrapRule());
    // `f8` implicitly allows the valueSource "field" through getValueSources,
    // but `f6` is not a valid subordinate field
    testParseJSONata(parseJSONata(`f8 = f6`, { fields, getValueSources }), wrapRule());
    // `f9` implicitly allows the valueSource "field" through getValueSources,
    // but `f10` is not a valid subordinate field
    testParseJSONata(parseJSONata(`f9 = f10`, { fields, getValueSources }), wrapRule());
    // `f10` implicitly allows the valueSource "field" through getValueSources,
    // but `f5` is not a valid subordinate field
    testParseJSONata(parseJSONata(`f10 = f5`, { fields, getValueSources }), wrapRule());
    // independent combinators
    const fieldsForIC = (
      [
        { name: 'f1', label: 'Field 1' },
        { name: 'f3', label: 'Field 3', valueSources: ['field'] },
      ] satisfies Field[]
    ).map(o => toFullOption(o));
    testParseJSONataIC(
      parseJSONata('f1 = f2 and f3 = "f4" and f3 = f4', {
        fields: fieldsForIC,
        independentCombinators: true,
      }),
      wrapRuleIC()
    );
  });
});

// oxlint-disable-next-line expect-expect
it('handles "in" operator', () => {
  testParseJSONata(
    'f1 in ["Test","Test2"]',
    wrapRule({ field: 'f1', operator: 'in', value: ['Test', 'Test2'] })
  );
  testParseJSONata(
    'f1 in [f2,f3]',
    wrapRule({
      field: 'f1',
      operator: 'in',
      value: ['f2', 'f3'],
      valueSource: 'field',
    })
  );
});

// oxlint-disable-next-line expect-expect
it('handles multiple negations', () => {
  testParseJSONata('$not($not($not($contains(f1, "Test"))))', {
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
  testParseJSONata('$not($not($not($not($contains(f1, "Test")))))', {
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

// oxlint-disable-next-line expect-expect
it('handles independent combinators', () => {
  testParseJSONataIC('f1 = "Test"', {
    rules: [{ field: 'f1', operator: '=', value: 'Test' }],
  });
  testParseJSONataIC('(f1 = "Test")', {
    rules: [{ field: 'f1', operator: '=', value: 'Test' }],
  });
  testParseJSONataIC('$not(f1 = "Test")', {
    not: true,
    rules: [{ field: 'f1', operator: '=', value: 'Test' }],
  });
  testParseJSONataIC('f1 = "Test" and f2 = "Test2" or f3 = "Test3"', {
    rules: [
      { field: 'f1', operator: '=', value: 'Test' },
      'and',
      { field: 'f2', operator: '=', value: 'Test2' },
      'or',
      { field: 'f3', operator: '=', value: 'Test3' },
    ],
  });
});

// oxlint-disable-next-line expect-expect
it('generates IDs', () => {
  testParseJSONata(
    `firstName = "Steve"`,
    expect.objectContaining({
      id: expect.any(String),
      ...wrapRule({ id: expect.any(String), field: 'firstName', operator: '=', value: 'Steve' }),
    }),
    { generateIDs: true }
  );
});

// oxlint-disable-next-line expect-expect
it('ignores things', () => {
  const expressionsToIgnore = [
    '',
    'f1 = f2 ? f3 : f4',
    'f1 = f2("")',
    '(f1 = f2(""))',
    'true',
    'f1 in ["Test",f2]',
    'f1 in {["f2"]: "v2", "f3": "v3"}',
  ];

  for (const pr of expressionsToIgnore) {
    testParseJSONata(pr, wrapRule());
  }
});
