import type {
  DefaultCombinatorName,
  DefaultRuleGroupType,
  DefaultRuleGroupTypeIC,
  DefaultRuleType,
  Field,
  OptionGroup,
  ValueSources,
} from '../../types/index.noReact';
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
const icOpts = { independentCombinators: true } as const;

const testParseCEL = (parseResult: DefaultRuleGroupType, expectedResult: DefaultRuleGroupType) => {
  expect(parseResult).toEqual(expectedResult);
};
const testParseCELic = (
  parseResult: DefaultRuleGroupTypeIC,
  expectedResult: DefaultRuleGroupTypeIC
) => {
  expect(parseResult).toEqual(expectedResult);
};

it('works for basic relations', () => {
  testParseCEL(parseCEL('f1 == "Test"'), wrapRule({ field: 'f1', operator: '=', value: 'Test' }));
  testParseCEL(parseCEL('(f1 == "Test")'), wrapRule({ field: 'f1', operator: '=', value: 'Test' }));
  testParseCEL(parseCEL('f1 != "Test"'), wrapRule({ field: 'f1', operator: '!=', value: 'Test' }));
  testParseCEL(parseCEL('f1 > 1'), wrapRule({ field: 'f1', operator: '>', value: 1 }));
  testParseCEL(parseCEL('f1 >= 1'), wrapRule({ field: 'f1', operator: '>=', value: 1 }));
  testParseCEL(parseCEL('f1 < 1'), wrapRule({ field: 'f1', operator: '<', value: 1 }));
  testParseCEL(parseCEL('f1 <= 1'), wrapRule({ field: 'f1', operator: '<=', value: 1 }));
  testParseCEL(parseCEL('f1 == 12.14'), wrapRule({ field: 'f1', operator: '=', value: 12.14 }));
  // TODO: fix hexadecimal processing
  // testParseCEL(parseCEL('f1 == 0x1214'), wrapRule({ field: 'f1', operator: '=', value: 0x1214 }));
  // testParseCEL(parseCEL('f1 == 0x1214u'), wrapRule({ field: 'f1', operator: '=', value: 0x1214 }));
  testParseCEL(parseCEL('f1 == 1214u'), wrapRule({ field: 'f1', operator: '=', value: 1214 }));
  testParseCEL(parseCEL('f1 == null'), wrapRule({ field: 'f1', operator: 'null', value: null }));
  testParseCEL(parseCEL('f1 != null'), wrapRule({ field: 'f1', operator: 'notNull', value: null }));
  testParseCEL(parseCEL('f1 == true'), wrapRule({ field: 'f1', operator: '=', value: true }));
  testParseCEL(parseCEL('f1 == false'), wrapRule({ field: 'f1', operator: '=', value: false }));
  // flips operators
  testParseCEL(parseCEL('"Test" == f1'), wrapRule({ field: 'f1', operator: '=', value: 'Test' }));
  testParseCEL(parseCEL('1214 > f1'), wrapRule({ field: 'f1', operator: '<', value: 1214 }));
  testParseCEL(parseCEL('1214 >= f1'), wrapRule({ field: 'f1', operator: '<=', value: 1214 }));
  testParseCEL(parseCEL('1214 < f1'), wrapRule({ field: 'f1', operator: '>', value: 1214 }));
  testParseCEL(parseCEL('1214 <= f1'), wrapRule({ field: 'f1', operator: '>=', value: 1214 }));
});

it('handles "like" comparisons', () => {
  testParseCEL(
    parseCEL('f1.contains("Test")'),
    wrapRule({ field: 'f1', operator: 'contains', value: 'Test' })
  );
  testParseCEL(
    parseCEL('f1.startsWith("Test")'),
    wrapRule({ field: 'f1', operator: 'beginsWith', value: 'Test' })
  );
  testParseCEL(
    parseCEL('f1.endsWith("Test")'),
    wrapRule({ field: 'f1', operator: 'endsWith', value: 'Test' })
  );
  testParseCEL(
    parseCEL('f1.contains(f2)'),
    wrapRule({ field: 'f1', operator: 'contains', value: 'f2', valueSource: 'field' })
  );
  testParseCEL(
    parseCEL('f1.startsWith(f2)'),
    wrapRule({ field: 'f1', operator: 'beginsWith', value: 'f2', valueSource: 'field' })
  );
  testParseCEL(
    parseCEL('f1.endsWith(f2)'),
    wrapRule({ field: 'f1', operator: 'endsWith', value: 'f2', valueSource: 'field' })
  );
  // TODO: fix handling of negations
  // testParseCEL(
  //   parseCEL('!f1.contains("Test")'),
  //   wrapRule({ field: 'f1', operator: 'doesNotContain', value: 'Test' })
  // );
  // testParseCEL(
  //   parseCEL('!f1.startsWith("Test")'),
  //   wrapRule({ field: 'f1', operator: 'doesNotBeginWith', value: 'Test' })
  // );
  // testParseCEL(
  //   parseCEL('!f1.endsWith("Test")'),
  //   wrapRule({ field: 'f1', operator: 'doesNotEndWith', value: 'Test' })
  // );
});

it('groups only when necessary', () => {
  testParseCEL(parseCEL('(f1 == "Test" || f2 == "Test2")'), {
    combinator: 'or',
    rules: [
      { field: 'f1', operator: '=', value: 'Test' },
      { field: 'f2', operator: '=', value: 'Test2' },
    ],
  });
  testParseCEL(parseCEL('((f1 == "Test" || f2 == "Test2"))'), {
    combinator: 'or',
    rules: [
      { field: 'f1', operator: '=', value: 'Test' },
      { field: 'f2', operator: '=', value: 'Test2' },
    ],
  });
});

it('handles parentheses', () => {
  testParseCEL(parseCEL('(f1 == "Test" || f2 == "Test2") && f3 == "Test3"'), {
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
});

it('works for conditional and/or', () => {
  testParseCEL(
    parseCEL('f1 == "Test" && f2 == "Test2"'),
    wrapRule([
      { field: 'f1', operator: '=', value: 'Test' },
      { field: 'f2', operator: '=', value: 'Test2' },
    ])
  );
  testParseCEL(
    parseCEL('f1 == "Test" || f2 == "Test2"'),
    wrapRule(
      [
        { field: 'f1', operator: '=', value: 'Test' },
        { field: 'f2', operator: '=', value: 'Test2' },
      ],
      'or'
    )
  );
  testParseCEL(parseCEL('f1 == "Test" && f2 == "Test2" || f3 == "Test3"'), {
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
  testParseCEL(parseCEL(`firstName == 'Steve' && lastName == 'Vai' || middleName == null`), {
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
    parseCEL(
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
  testParseCEL(
    parseCEL(
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
  testParseCEL(parseCEL(`firstName == 'Steve' || lastName == 'Vai' && middleName == null`), {
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
});

describe('fields and getValueSources', () => {
  const fields: Field[] = [
    { name: 'f1', label: 'f1' },
    { name: 'f2', label: 'f2', valueSources: ['value'] },
    { name: 'f3', label: 'f3', valueSources: ['field'] },
    { name: 'f4', label: 'f4', valueSources: () => ['value', 'field'] },
    { name: 'f5', label: 'f5', comparator: 'group', group: 'g1' },
    { name: 'f6', label: 'f6', comparator: 'group', group: 'g1' },
    { name: 'f7', label: 'f7', comparator: 'group', group: 'g2' },
    { name: 'f8', label: 'f8', comparator: 'group', group: 'g2' },
    { name: 'f9', label: 'f9', comparator: f => f.name === 'f1' },
    { name: 'f10', label: 'f10', comparator: f => f.group === 'g2' },
  ];
  const optionGroups: OptionGroup[] = [{ label: 'Option Group1', options: fields }];
  const fieldsObject: Record<string, Field> = {};
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
  });
});

it('handles "in" operator', () => {
  testParseCEL(
    parseCEL('f1 in ["Test","Test2"]'),
    wrapRule({ field: 'f1', operator: 'in', value: 'Test,Test2' })
  );
  testParseCEL(
    parseCEL('f1 in [f2,f3]'),
    wrapRule({ field: 'f1', operator: 'in', value: 'f2,f3', valueSource: 'field' })
  );
});

// it('validates fields', () => {
//   let fields: Field[] | OptionGroup<Field>[] | Record<string, Field> = [
//     { name: 'f1', label: 'Field 1' },
//     { name: 'f3', label: 'Field 3', valueSources: ['field'] },
//   ];
//   testParseCEL(parseCEL('f1 == f2 && f3 == "f4" && f3 == f4', { fields }), wrapRule());
//   fields = [{ label: 'Options', options: fields }];
//   testParseCEL(parseCEL('f1 == f2 && f3 == "f4" && f3 == f4', { fields }), wrapRule());
//   fields = { f1: fields[0].options[0], f3: fields[0].options[1] };
//   testParseCEL(parseCEL('f1 == f2 && f3 == "f4" && f3 == f4', { fields }), wrapRule());
// });

it('handles independent combinators', () => {
  const fields: Field[] = [
    { name: 'f1', label: 'Field 1' },
    { name: 'f3', label: 'Field 3', valueSources: ['field'] },
  ];
  testParseCELic(
    parseCEL('f1 == f2 && f3 == "f4" && f3 == f4', { fields, ...icOpts }),
    wrapRuleIC()
  );
  testParseCELic(parseCEL('(f1 == "Test")', icOpts), {
    rules: [{ field: 'f1', operator: '=', value: 'Test' }],
  });
  testParseCELic(parseCEL('f1 == "Test"', icOpts), {
    rules: [{ field: 'f1', operator: '=', value: 'Test' }],
  });
  testParseCELic(parseCEL('f1 == "Test" && f2 == "Test2" || f3 == "Test3"', icOpts), {
    rules: [
      { field: 'f1', operator: '=', value: 'Test' },
      'and',
      { field: 'f2', operator: '=', value: 'Test2' },
      'or',
      { field: 'f3', operator: '=', value: 'Test3' },
    ],
  });
});

it('ignores things', () => {
  // testParseCEL(parseCEL('f1 == f2 ? f3 : f4'), wrapRule());
  testParseCEL(parseCEL(''), wrapRule());
  testParseCEL(parseCEL('f1 == f2("")'), wrapRule());
  testParseCEL(parseCEL('(f1 == f2(""))'), wrapRule());
  testParseCEL(parseCEL('true'), wrapRule());
  testParseCEL(parseCEL('f1 in ["Test",f2]'), wrapRule());
});
