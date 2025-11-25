import {
  defaultPlaceholderFieldName as defaultFieldPlaceholder,
  defaultPlaceholderOperatorName as defaultOperatorPlaceholder,
} from '../../../defaults';
import type {
  ExportOperatorMap,
  FormatQueryOptions,
  NLTranslations,
  RuleGroupType,
  ValueProcessorByRule,
  ValueProcessorLegacy,
} from '../../../types';
import { convertToIC } from '../../convertQuery';
import { defaultExportOperatorMap } from '../defaultRuleProcessorNL';
import { defaultValueProcessorNL } from '../defaultValueProcessorNL';
import { formatQuery } from '../formatQuery';
import {
  getValidationTestData,
  query,
  queryAllOperators,
  queryAllOperatorsRandomCase,
  queryForNumberParsing,
  queryForPreserveValueOrder,
  queryForXor,
  queryIC,
  queryWithMatchModes,
  queryWithValueSourceField,
} from '../formatQueryTestUtils';

const nlString =
  "firstName is null, and lastName is not null, and firstName is one of the values ('Test' or 'This'), and lastName is not one of the values ('Test' or 'This'), and firstName is between 'Test' and 'This', and firstName is between 'Test' and 'This', and lastName is not between 'Test' and 'This', and age is between '12' and '14', and age is '26', and isMusician is true, and isLucky is false, and (gender is 'M', or job is not 'Programmer', or email contains '@') is not true, and (lastName does not contain 'ab', or job starts with 'Prog', or email ends with 'com', or job does not start with 'Man', or email does not end with 'fr') is true";
const nlStringForValueSourceField =
  'firstName is null, and lastName is not null, and firstName is the same as a value in (middleName or lastName), and lastName is not the same as any value in (middleName or lastName), and firstName is between the values in middleName and lastName, and firstName is between the values in middleName and lastName, and lastName is not between the values in middleName and lastName, and age is the same as the value in iq, and isMusician is the same as the value in isCreative, and (gender is the same as the value in someLetter, or job is not the same as the value in isBetweenJobs, or email contains the value in atSign) is not true, and (lastName does not contain the value in firstName, or job starts with the value in jobPrefix, or email ends with the value in dotCom, or job does not start with the value in hasNoJob, or email does not end with the value in isInvalid) is true';
const nlStringQuotedWithDoubleQuotes =
  'firstName is null, and lastName is not null, and firstName is one of the values ("Test" or "This"), and lastName is not one of the values ("Test" or "This"), and firstName is between "Test" and "This", and firstName is between "Test" and "This", and lastName is not between "Test" and "This", and age is between "12" and "14", and age is "26", and isMusician is true, and isLucky is false, and (gender is "M", or job is not "Programmer", or email contains "@") is not true, and (lastName does not contain "ab", or job starts with "Prog", or email ends with "com", or job does not start with "Man", or email does not end with "fr") is true';
const nlStringOperatorMap =
  "firstName IS NULL, and lastName IS NOT NULL, and firstName IS ONE OF THE VALUES ('Test' or 'This'), and lastName IS NOT ONE OF THE VALUES ('Test' or 'This'), and firstName IS BETWEEN 'Test' and 'This', and firstName IS BETWEEN 'Test' and 'This', and lastName IS NOT BETWEEN 'Test' and 'This', and age IS BETWEEN '12' and '14', and age IS '26', and isMusician IS true, and isLucky IS false, and (gender IS 'M', or job IS NOT 'Programmer', or email CONTAINS '@') is not true, and (lastName DOES NOT CONTAIN 'ab', or job STARTS WITH 'Prog', or email ENDS WITH 'com', or job DOES NOT START WITH 'Man', or email DOES NOT END WITH 'fr') is true";

it('formats natural language correctly', () => {
  expect(formatQuery(query, 'natural_language')).toBe(nlString);
  expect(formatQuery(queryWithValueSourceField, 'natural_language')).toBe(
    nlStringForValueSourceField
  );
  expect(
    formatQuery(query, { format: 'natural_language', valueProcessor: defaultValueProcessorNL })
  ).toBe(nlString);
  // Cover the operators that the standard tests don't cover
  expect(
    formatQuery(
      {
        combinator: 'and',
        rules: [
          { field: 'f1', operator: '>', value: 1 },
          { field: 'f1', operator: '>', value: 'f2', valueSource: 'field' },
          { field: 'f1', operator: '>=', value: 1 },
          { field: 'f1', operator: '>=', value: 'f2', valueSource: 'field' },
          { field: 'f1', operator: '<', value: 1 },
          { field: 'f1', operator: '<', value: 'f2', valueSource: 'field' },
          { field: 'f1', operator: '<=', value: 1 },
          { field: 'f1', operator: '<=', value: 'f2', valueSource: 'field' },
        ],
      },
      { format: 'natural_language', parseNumbers: true }
    )
  ).toBe(
    `f1 is greater than 1, and f1 is greater than the value in f2, and f1 is greater than or equal to 1, and f1 is greater than or equal to the value in f2, and f1 is less than 1, and f1 is less than the value in f2, and f1 is less than or equal to 1, and f1 is less than or equal to the value in f2`
  );
});

it('handles operator case variations', () => {
  expect(formatQuery(queryAllOperators, 'natural_language')).toBe(
    formatQuery(queryAllOperatorsRandomCase, 'natural_language')
  );
});

it('uses field and custom operator labels', () => {
  expect(
    formatQuery(
      {
        combinator: 'and',
        rules: [{ field: 'f1', operator: 'special_op', value: 'f2', valueSource: 'field' }],
      },
      {
        format: 'natural_language',
        fields: [
          { name: 'f1', label: 'Field One' },
          { name: 'f2', label: 'Field Two' },
        ],
        getOperators: () => [{ name: 'special_op', label: 'hides from' }],
      }
    )
  ).toBe(`Field One hides from Field Two`);
});

it('handles custom valueProcessors correctly', () => {
  const queryWithArrayValue: RuleGroupType = {
    id: 'g-root',
    combinator: 'and',
    rules: [
      { field: 'instrument', value: ['Guitar', 'Vocals'], operator: 'in' },
      { field: 'lastName', value: 'Vai', operator: '=' },
    ],
    not: false,
  };

  const valueProcessorLegacy: ValueProcessorLegacy = (_field, operator, value) => {
    return operator === 'in'
      ? `(${value.map((v: string) => `'${v.trim()}'`).join(', /* and */ ')})`
      : `'${value}'`;
  };

  expect(
    formatQuery(queryWithArrayValue, {
      format: 'natural_language',
      valueProcessor: valueProcessorLegacy,
    })
  ).toBe(`instrument is one of the values ('Guitar', /* and */ 'Vocals'), and lastName is 'Vai'`);

  const queryForNewValueProcessor: RuleGroupType = {
    combinator: 'and',
    rules: [{ field: 'f1', operator: '=', value: `v'1`, valueSource: 'value' }],
  };

  const valueProcessor: ValueProcessorByRule = (
    { field, operator, value, valueSource },
    opts = {}
  ) => `${field}-${operator}-${value}-${valueSource}-${!!opts.parseNumbers}-${!!opts.escapeQuotes}`;

  expect(
    formatQuery(queryForNewValueProcessor, {
      format: 'natural_language',
      parseNumbers: true,
      valueProcessor,
    })
  ).toBe(`f1 is f1-=-v'1-value-true-true`);

  const valueProcessorAsPassThrough: ValueProcessorByRule = (r, opts) =>
    defaultValueProcessorNL(r, opts);

  // handles escapeQuotes correctly
  expect(
    formatQuery(queryForNewValueProcessor, {
      format: 'natural_language',
      valueProcessor: valueProcessorAsPassThrough,
    })
  ).toBe(`f1 is 'v''1'`);

  // handles escapeQuotes exactly the same as defaultValueProcessorByRule
  expect(
    formatQuery(queryForNewValueProcessor, {
      format: 'natural_language',
      valueProcessor: valueProcessorAsPassThrough,
    })
  ).toBe(formatQuery(queryForNewValueProcessor, 'natural_language'));
});

it('handles quoteFieldNamesWith correctly', () => {
  const queryToTest: RuleGroupType = {
    id: 'g-root',
    combinator: 'and',
    rules: [
      { field: 'instrument', value: 'Guitar, Vocals', operator: 'in' },
      { field: 'lastName', value: 'Vai', operator: '=' },
      { field: 'lastName', value: 'firstName', operator: '!=', valueSource: 'field' },
    ],
    not: false,
  };

  expect(formatQuery(queryToTest, { format: 'natural_language', quoteFieldNamesWith: '`' })).toBe(
    "`instrument` is one of the values ('Guitar' or 'Vocals'), and `lastName` is 'Vai', and `lastName` is not the same as the value in `firstName`"
  );

  expect(
    formatQuery(queryToTest, { format: 'natural_language', quoteFieldNamesWith: ['[', ']'] })
  ).toBe(
    "[instrument] is one of the values ('Guitar' or 'Vocals'), and [lastName] is 'Vai', and [lastName] is not the same as the value in [firstName]"
  );
});

it('handles fieldIdentifierSeparator correctly', () => {
  const queryToTest: RuleGroupType = {
    id: 'g-root',
    combinator: 'and',
    rules: [
      { field: 'musicians.instrument', value: 'Guitar, Vocals', operator: 'in' },
      { field: 'musicians.lastName', value: 'Vai', operator: '=' },
      {
        field: 'musicians.lastName',
        value: 'musicians.firstName',
        operator: '!=',
        valueSource: 'field',
      },
    ],
    not: false,
  };

  expect(
    formatQuery(queryToTest, { format: 'natural_language', quoteFieldNamesWith: ['[', ']'] })
  ).toBe(
    "[musicians.instrument] is one of the values ('Guitar' or 'Vocals'), and [musicians.lastName] is 'Vai', and [musicians.lastName] is not the same as the value in [musicians.firstName]"
  );

  expect(
    formatQuery(queryToTest, {
      format: 'natural_language',
      quoteFieldNamesWith: ['[', ']'],
      fieldIdentifierSeparator: '.',
    })
  ).toBe(
    "[musicians].[instrument] is one of the values ('Guitar' or 'Vocals'), and [musicians].[lastName] is 'Vai', and [musicians].[lastName] is not the same as the value in [musicians].[firstName]"
  );
});

it('handles quoteValuesWith correctly', () => {
  expect(formatQuery(query, { format: 'natural_language', quoteValuesWith: `'` })).toBe(nlString);

  expect(formatQuery(query, { format: 'natural_language', quoteValuesWith: `"` })).toBe(
    nlStringQuotedWithDoubleQuotes
  );
});

it('handles custom fallbackExpression correctly', () => {
  const fallbackExpression = 'fallbackExpression';
  const queryToTest: RuleGroupType = { id: 'g-root', combinator: 'and', rules: [] };

  expect(formatQuery(queryToTest, { format: 'natural_language', fallbackExpression })).toBe(
    fallbackExpression
  );
});

it('handles single value in/notin operators without "or"', () => {
  const queryWithSingleValueIn: RuleGroupType = {
    combinator: 'and',
    rules: [
      { field: 'instrument', value: 'Guitar', operator: 'in' },
      { field: 'job', value: 'Programmer', operator: 'notin' },
    ],
  };

  expect(formatQuery(queryWithSingleValueIn, 'natural_language')).toBe(
    `instrument is one of the values 'Guitar', and job is not one of the values 'Programmer'`
  );
});

it('handles multiple value in/notin operators with parentheses', () => {
  const queryWithMultipleValueIn: RuleGroupType = {
    combinator: 'and',
    rules: [
      { field: 'instrument', value: 'Guitar,Vocals', operator: 'in' },
      { field: 'job', value: 'Programmer,Engineer', operator: 'notin' },
      { field: 'color', value: 'Red,Green,Blue', operator: 'in' },
    ],
  };

  expect(formatQuery(queryWithMultipleValueIn, 'natural_language')).toBe(
    `instrument is one of the values ('Guitar' or 'Vocals'), and job is not one of the values ('Programmer' or 'Engineer'), and color is one of the values ('Red', 'Green', or 'Blue')`
  );
});

describe('escapes quotes when appropriate', () => {
  const testQuerySQ: RuleGroupType = {
    combinator: 'and',
    rules: [{ field: 'f1', operator: '=', value: `Te'st` }],
  };

  for (const attempt of [{ fmt: 'natural_language', result: `f1 is 'Te''st'` }]) {
    it(`escapes single quotes (if appropriate) for ${attempt.fmt} `, () => {
      // @ts-expect-error Conflicting formatQuery overloads
      expect(formatQuery(testQuerySQ, attempt.fmt)).toEqual(attempt.result);
    });
  }
});

it('independent combinators', () => {
  expect(formatQuery(queryIC, 'natural_language')).toBe(
    `firstName is 'Test', and middleName is 'Test', or lastName is 'Test'`
  );
});

describe('validation', () => {
  const validationResults: Record<string, string> = {
    'should invalidate natural_language': '1 is 1',
    'should invalidate natural_language even if fields are valid': '1 is 1',
    'should invalidate natural_language rule by validator function': `field2 is ''`,
    'should invalidate natural_language rule specified by validationMap': `field2 is ''`,
    'should invalidate natural_language outermost group': '1 is 1',
    'should invalidate natural_language inner group': '1 is 1',
    'should convert natural_language inner group with no rules to fallbackExpression': `field is '', and 1 is 1`,
    'should invalidate natural_language following combinator of first rule': `field2 is '', or field3 is ''`,
    'should invalidate natural_language preceding combinator of non-first rule': `field is '', or field3 is ''`,
  };

  for (const vtd of getValidationTestData('natural_language')) {
    it(vtd.title, () => {
      expect(formatQuery(vtd.query, vtd.options)).toBe(validationResults[vtd.title]);
    });
  }
});

describe('parseNumbers', () => {
  const allNumbersParsed =
    "f is greater than 'NaN', and f is 0, and f is 0, and f is 0, and (f is less than 1.5, or f is greater than 1.5) is true, and f is one of the values (0, 1, or 2), and f is one of the values (0, 1, or 2), and f is one of the values (0, 'abc', or 2), and f is between 0 and 1, and f is between 0 and 1, and f is between '0' and 'abc', and f is between '[object Object]' and '[object Object]'";
  it.each([
    ['true', { parseNumbers: true }],
    ['strict', { parseNumbers: 'strict' }],
    [
      'strict-limited',
      { parseNumbers: 'strict-limited', fields: [{ name: 'f', label: 'f', inputType: 'number' }] },
    ],
  ] satisfies [string, FormatQueryOptions][])(
    'parses numbers for natural_language (%s)',
    (_, opts) => {
      expect(formatQuery(queryForNumberParsing, { ...opts, format: 'natural_language' })).toBe(
        allNumbersParsed
      );
    }
  );

  it('orders "between" values ascending', () => {
    const queryForBetweenSorting: RuleGroupType = {
      combinator: 'and',
      rules: [
        { field: 'f1', operator: 'between', value: [14, 12] },
        { field: 'f2', operator: 'notBetween', value: [14, 12] },
      ],
    };
    expect(
      formatQuery(queryForBetweenSorting, { format: 'natural_language', parseNumbers: true })
    ).toBe(`f1 is between 12 and 14, and f2 is not between 12 and 14`);
  });
});

describe('placeholder names', () => {
  const placeholderFieldName = 'placeholderFieldName';
  const placeholderOperatorName = 'placeholderOperatorName';
  const placeholderValueName = 'placeholderValueName';

  const queryForPlaceholders: RuleGroupType = {
    combinator: 'and',
    rules: [
      { field: defaultFieldPlaceholder, operator: defaultOperatorPlaceholder, value: 'v1' },
      { field: placeholderFieldName, operator: '=', value: 'v2' },
      { field: 'f3', operator: placeholderOperatorName, value: 'v3' },
      { field: placeholderFieldName, operator: placeholderOperatorName, value: 'v4' },
      { field: 'f5', operator: '=', value: placeholderValueName },
    ],
  };

  it('respects custom placeholder names', () => {
    expect(
      formatQuery(queryForPlaceholders, {
        format: 'natural_language',
        placeholderFieldName,
        placeholderOperatorName,
        placeholderValueName,
      })
    ).toBe(`${defaultFieldPlaceholder} ${defaultOperatorPlaceholder} 'v1'`);
  });
});

it('preserveValueOrder', () => {
  expect(
    formatQuery(queryForPreserveValueOrder, { format: 'natural_language', parseNumbers: true })
  ).toBe(`f1 is between 12 and 14, and f2 is between 12 and 14`);
  expect(
    formatQuery(queryForPreserveValueOrder, {
      format: 'natural_language',
      parseNumbers: true,
      preserveValueOrder: true,
    })
  ).toBe(`f1 is between 12 and 14, and f2 is between 14 and 12`);
});

it('handles XOR operator', () => {
  expect(formatQuery(queryForXor, 'natural_language')).toBe(
    `exactly one of (f1 is 'v1', or f2 is 'v2') is true`
  );
  expect(formatQuery({ ...queryForXor, not: true }, 'natural_language')).toBe(
    `either zero or more than one of (f1 is 'v1', or f2 is 'v2') is true`
  );
  expect(
    formatQuery(
      { rules: [{ field: 'f1', operator: '=', value: 'v1' }, 'and', convertToIC(queryForXor)] },
      'natural_language'
    )
  ).toBe(`f1 is 'v1', and exactly one of (f1 is 'v1', or f2 is 'v2') is true`);
});

it('constituent word order', () => {
  const q: RuleGroupType = {
    combinator: 'or',
    rules: [
      { field: 'f1', operator: '=', value: 'v1' },
      { field: 'f2', operator: '=', value: 'v2' },
    ],
  };

  expect(formatQuery(q, { format: 'natural_language', wordOrder: 'SOV' })).toBe(
    `f1 'v1' is, or f2 'v2' is`
  );
  expect(formatQuery(q, { format: 'natural_language', wordOrder: 'subject-object-verb' })).toBe(
    `f1 'v1' is, or f2 'v2' is`
  );
  expect(formatQuery(q, { format: 'natural_language', wordOrder: 'VERB SUBJECT' })).toBe(
    `is f1 'v1', or is f2 'v2'`
  );
  expect(formatQuery({ ...q, not: true }, { format: 'natural_language', wordOrder: 'SOV' })).toBe(
    `(f1 'v1' is, or f2 'v2' is) is not true`
  );
  expect(
    formatQuery(
      { rules: [{ field: 'f1', operator: '=', value: 'v1' }, 'and', convertToIC(q)] },
      { format: 'natural_language', wordOrder: 'SOV' }
    )
  ).toBe(`f1 'v1' is, and (f1 'v1' is, or f2 'v2' is) is true`);
});

it('translations', () => {
  const q: RuleGroupType = {
    combinator: 'or',
    rules: [
      { field: 'f1', operator: '=', value: 'v1' },
      { field: 'f2', operator: '=', value: 'v2' },
    ],
  };

  const translations: NLTranslations = {
    and: 'PLUS',
    or: 'OR',
    true: 'YES',
    false: 'NO',
    groupPrefix_not: 'as far as we can tell',
    groupPrefix_xor: 'precisely one of',
    groupPrefix_xor_not: 'multiple or none of',
    groupSuffix: 'has been verified',
    groupSuffix_not: 'has not been verified',
    groupSuffix_xor: 'has been verified',
    groupSuffix_xor_not: 'have been verified',
  };

  expect(formatQuery(q, { format: 'natural_language', translations })).toBe(
    `f1 is 'v1', OR f2 is 'v2'`
  );
  expect(formatQuery({ ...q, not: true }, { format: 'natural_language', translations })).toBe(
    `as far as we can tell (f1 is 'v1', OR f2 is 'v2') has not been verified`
  );
  expect(
    formatQuery(
      { rules: [{ field: 'f1', operator: '=', value: 'v1' }, 'and', convertToIC(q)] },
      { format: 'natural_language', translations }
    )
  ).toBe(`f1 is 'v1', PLUS (f1 is 'v1', OR f2 is 'v2') has been verified`);
  // between
  expect(
    formatQuery(
      { rules: [{ field: 'f1', operator: 'between', value: 'v1,v2' }] },
      { format: 'natural_language', translations }
    )
  ).toBe(`f1 is between 'v1' PLUS 'v2'`);
  // xor
  expect(formatQuery(queryForXor, { format: 'natural_language', translations })).toBe(
    `precisely one of (f1 is 'v1', OR f2 is 'v2') has been verified`
  );
  expect(
    formatQuery({ ...queryForXor, not: true }, { format: 'natural_language', translations })
  ).toBe(`multiple or none of (f1 is 'v1', OR f2 is 'v2') have been verified`);
  expect(
    formatQuery(
      { rules: [{ field: 'f1', operator: '=', value: 'v1' }, 'and', convertToIC(queryForXor)] },
      { format: 'natural_language', translations }
    )
  ).toBe(`f1 is 'v1', PLUS precisely one of (f1 is 'v1', OR f2 is 'v2') has been verified`);
  // and/or/true/false
  expect(
    formatQuery(
      {
        combinator: 'and',
        rules: [
          { field: 'f1', operator: 'in', value: 'v1, v11' },
          { field: 'f2', operator: 'in', value: 'v2,v22,v222' },
          { field: 'f3', operator: '=', value: true },
          { field: 'f4', operator: '=', value: false },
        ],
      },
      { format: 'natural_language', translations }
    )
  ).toBe(
    `f1 is one of the values ('v1' OR 'v11'), PLUS f2 is one of the values ('v2', 'v22', OR 'v222'), PLUS f3 is YES, PLUS f4 is NO`
  );
});

it('operatorMap', () => {
  /** Uppercase all default operator map strings */
  const operatorMap: ExportOperatorMap = Object.fromEntries(
    Object.entries(defaultExportOperatorMap).map(([k, v]) =>
      Array.isArray(v) ? [k, v.map(t => t.toUpperCase())] : [k, v.toUpperCase()]
    )
  );
  expect(formatQuery(query, { format: 'natural_language', operatorMap })).toBe(nlStringOperatorMap);
});

describe('match modes', () => {
  it('strings', () => {
    expect(formatQuery(queryWithMatchModes, { format: 'natural_language' })).toBe(
      `(every item in fs contains 'S'), and (every item in fs fv contains 'S'), and (no item in fs contains 'S'), and (at least one item in fs contains 'S'), and (at least one item in fs contains 'S'), and (no item in fs contains 'S'), and (at least 2 of the items in fs contains 'S'), and (at least 2 of the items in fs fv contains 'S'), and (at least 50% of the items in fs contains 'S'), and (at most 2 of the items in fs contains 'S'), and (at most 50% of the items in fs contains 'S'), and (exactly 2 of the items in fs contains 'S'), and (exactly 50% of the items in fs contains 'S'), and (every item in fs contains 'S', and contains 'S'), and (at least 2 of the items in fs contains 'S', and contains 'S')`
    );
  });

  it('objects', () => {
    expect(
      formatQuery(queryWithMatchModes, {
        format: 'natural_language',
        fields: [{ name: 'fs', label: 'FS', subproperties: [{ name: 'fv', label: 'FV' }] }],
      })
    ).toBe(
      `(for every item in FS, contains 'S'), and (for every item in FS, FV contains 'S'), and (for no item in FS, contains 'S'), and (for at least one item in FS, contains 'S'), and (for at least one item in FS, contains 'S'), and (for no item in FS, contains 'S'), and (for at least 2 of the items in FS, contains 'S'), and (for at least 2 of the items in FS, FV contains 'S'), and (for at least 50% of the items in FS, contains 'S'), and (for at most 2 of the items in FS, contains 'S'), and (for at most 50% of the items in FS, contains 'S'), and (for exactly 2 of the items in FS, contains 'S'), and (for exactly 50% of the items in FS, contains 'S'), and (for every item in FS, contains 'S', and contains 'S'), and (for at least 2 of the items in FS, contains 'S', and contains 'S')`
    );
  });
});
