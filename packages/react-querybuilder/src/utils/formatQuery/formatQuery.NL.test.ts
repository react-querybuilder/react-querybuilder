import {
  defaultPlaceholderFieldName as defaultFieldPlaceholder,
  defaultPlaceholderOperatorName as defaultOperatorPlaceholder,
} from '../../defaults';
import type {
  RuleGroupType,
  ValueProcessorByRule,
  ValueProcessorLegacy,
} from '../../types/index.noReact';
import { defaultValueProcessorNL } from './defaultValueProcessorNL';
import { formatQuery } from './formatQuery';
import {
  getValidationTestData,
  query,
  queryForNumberParsing,
  queryForXor,
  queryIC,
  queryWithValueSourceField,
} from './formatQueryTestUtils';

export const sqlString =
  "firstName is null, and lastName is not null, and firstName is one of the values 'Test' or 'This', and lastName is not one of the values 'Test' or 'This', and firstName is between 'Test' and 'This', and firstName is between 'Test' and 'This', and lastName is not between 'Test' and 'This', and age is between '12' and '14', and age is '26', and isMusician is true, and isLucky is false, and (gender is 'M', or job is not 'Programmer', or email contains '@') is not true, and (lastName does not contain 'ab', or job starts with 'Prog', or email ends with 'com', or job does not start with 'Man', or email does not end with 'fr') is true";
export const sqlStringForValueSourceField =
  'firstName is null, and lastName is not null, and firstName is the same as a value in middleName or lastName, and lastName is not the same as any value in middleName or lastName, and firstName is between the values in middleName and lastName, and firstName is between the values in middleName and lastName, and lastName is not between the values in middleName and lastName, and age is the same as the value in iq, and isMusician is the same as the value in isCreative, and (gender is the same as the value in someLetter, or job is not the same as the value in isBetweenJobs, or email contains the value in atSign) is not true, and (lastName does not contain the value in firstName, or job starts with the value in jobPrefix, or email ends with the value in dotCom, or job does not start with the value in hasNoJob, or email does not end with the value in isInvalid) is true';
export const sqlStringQuotedWithDoubleQuotes =
  'firstName is null, and lastName is not null, and firstName is one of the values "Test" or "This", and lastName is not one of the values "Test" or "This", and firstName is between "Test" and "This", and firstName is between "Test" and "This", and lastName is not between "Test" and "This", and age is between "12" and "14", and age is "26", and isMusician is true, and isLucky is false, and (gender is "M", or job is not "Programmer", or email contains "@") is not true, and (lastName does not contain "ab", or job starts with "Prog", or email ends with "com", or job does not start with "Man", or email does not end with "fr") is true';

it('formats nature language correctly', () => {
  expect(formatQuery(query, 'natural_language')).toBe(sqlString);
  expect(formatQuery(queryWithValueSourceField, 'natural_language')).toBe(
    sqlStringForValueSourceField
  );
  expect(
    formatQuery(query, { format: 'natural_language', valueProcessor: defaultValueProcessorNL })
  ).toBe(sqlString);
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
    "`instrument` is one of the values 'Guitar' or 'Vocals', and `lastName` is 'Vai', and `lastName` is not the same as the value in `firstName`"
  );

  expect(
    formatQuery(queryToTest, { format: 'natural_language', quoteFieldNamesWith: ['[', ']'] })
  ).toBe(
    "[instrument] is one of the values 'Guitar' or 'Vocals', and [lastName] is 'Vai', and [lastName] is not the same as the value in [firstName]"
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
    "[musicians.instrument] is one of the values 'Guitar' or 'Vocals', and [musicians.lastName] is 'Vai', and [musicians.lastName] is not the same as the value in [musicians.firstName]"
  );

  expect(
    formatQuery(queryToTest, {
      format: 'natural_language',
      quoteFieldNamesWith: ['[', ']'],
      fieldIdentifierSeparator: '.',
    })
  ).toBe(
    "[musicians].[instrument] is one of the values 'Guitar' or 'Vocals', and [musicians].[lastName] is 'Vai', and [musicians].[lastName] is not the same as the value in [musicians].[firstName]"
  );
});

it('handles quoteValuesWith correctly', () => {
  expect(formatQuery(query, { format: 'natural_language', quoteValuesWith: `'` })).toBe(sqlString);

  expect(formatQuery(query, { format: 'natural_language', quoteValuesWith: `"` })).toBe(
    sqlStringQuotedWithDoubleQuotes
  );
});

it('handles custom fallbackExpression correctly', () => {
  const fallbackExpression = 'fallbackExpression';
  const queryToTest: RuleGroupType = { id: 'g-root', combinator: 'and', rules: [] };

  expect(formatQuery(queryToTest, { format: 'natural_language', fallbackExpression })).toBe(
    fallbackExpression
  );
});

describe('escapes quotes when appropriate', () => {
  const testQuerySQ: RuleGroupType = {
    combinator: 'and',
    rules: [{ field: 'f1', operator: '=', value: `Te'st` }],
  };

  for (const attempt of [{ fmt: 'natural_language', result: `f1 is 'Te''st'` }]) {
    it(`escapes single quotes (if appropriate) for ${attempt.fmt} export`, () => {
      // @ts-expect-error Conflicting formatQuery overloads
      expect(formatQuery(testQuerySQ, attempt.fmt)).toEqual(attempt.result);
    });
  }
});

describe('independent combinators', () => {
  it('handles independent combinators for natural language', () => {
    expect(formatQuery(queryIC, 'natural_language')).toBe(
      `firstName is 'Test', and middleName is 'Test', or lastName is 'Test'`
    );
  });
});

describe('validation', () => {
  describe('natural_language', () => {
    const validationResults: Record<string, string> = {
      'should invalidate natural_language': '1 is 1',
      'should invalidate natural_language even if fields are valid': '1 is 1',
      'should invalidate natural_language rule by validator function': `field2 is ''`,
      'should invalidate natural_language rule specified by validationMap': `field2 is ''`,
      'should invalidate natural_language outermost group': '1 is 1',
      'should invalidate natural_language inner group': '1 is 1',
      'should convert natural_language inner group with no rules to fallbackExpression': `field is '', and 1 is 1`,
    };

    for (const vtd of getValidationTestData('natural_language')) {
      it(vtd.title, () => {
        expect(formatQuery(vtd.query, vtd.options)).toBe(validationResults[vtd.title]);
      });
    }
  });
});

describe('parseNumbers', () => {
  it('parses numbers for natural_language', () => {
    expect(
      formatQuery(queryForNumberParsing, { format: 'natural_language', parseNumbers: true })
    ).toBe(
      "f is greater than 'NaN', and f is 0, and f is 0, and f is 0, and (f is less than 1.5, or f is greater than 1.5) is true, and f is one of the values 0, 1, or 2, and f is one of the values 0, 1, or 2, and f is one of the values 0, 'abc', or 2, and f is between 0 and 1, and f is between 0 and 1, and f is between '0' and 'abc', and f is between '[object Object]' and '[object Object]'"
    );
  });

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

  const queryForPlaceholders: RuleGroupType = {
    combinator: 'and',
    rules: [
      { field: defaultFieldPlaceholder, operator: defaultOperatorPlaceholder, value: 'v1' },
      { field: placeholderFieldName, operator: '=', value: 'v2' },
      { field: 'f3', operator: placeholderOperatorName, value: 'v3' },
      { field: placeholderFieldName, operator: placeholderOperatorName, value: 'v4' },
    ],
  };

  it('respects custom placeholder names', () => {
    expect(
      formatQuery(queryForPlaceholders, {
        format: 'natural_language',
        placeholderFieldName,
        placeholderOperatorName,
      })
    ).toBe(`${defaultFieldPlaceholder} ${defaultOperatorPlaceholder} 'v1'`);
  });
});

describe('non-standard combinators', () => {
  it('handles XOR operator', () => {
    expect(formatQuery(queryForXor, 'natural_language')).toBe(`f1 is 'v1', xor f2 is 'v2'`);
  });
});
