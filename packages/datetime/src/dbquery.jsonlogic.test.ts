import { describe, expect, test } from '@jest/globals';
import { add_operation, apply } from 'json-logic-js';
import type { RuleGroupType } from 'react-querybuilder';
import { formatQuery } from 'react-querybuilder';
import {
  datetimeRuleProcessorJsonLogic,
  getJsonLogicDateTimeOperations,
} from './datetimeRuleProcessorJsonLogic';
import {
  comparisonDate,
  comparisonDate2,
  CREATE_MUSICIANS_TABLE,
  dateLibraryFunctions,
  fields,
  testCases,
} from './dbqueryTestUtils';

const musicianRecords = CREATE_MUSICIANS_TABLE('jsonlogic');

for (const [libName, apiFns] of dateLibraryFunctions) {
  describe(libName, () => {
    const today = apiFns.format(new Date(), apiFns.iso8601DateOnly);
    const comparisonYearBefore = apiFns.format(
      comparisonDate
        .split('-')
        .map((v, i) => `${parseInt(v, 10) - (i === 0 ? 1 : 0)}`.padStart(2, '0'))
        .join('-'),
      apiFns.iso8601DateOnly
    );

    for (const [op, func] of Object.entries(getJsonLogicDateTimeOperations(apiFns))) {
      add_operation(op, func);
    }

    // Common tests
    for (const [testCaseName, [testQuery, expectedLastName]] of Object.entries(testCases)) {
      test(testCaseName, () => {
        const jsonlogic = formatQuery(testQuery, {
          format: 'jsonlogic',
          fields,
          ruleProcessor: datetimeRuleProcessorJsonLogic,
        });
        const result = musicianRecords.filter(u => apply(jsonlogic, u));
        if (expectedLastName === 'all') {
          expect(result).toHaveLength(musicianRecords.length);
        } else {
          expect(result).toHaveLength(1);
          expect(result[0].last_name).toBe(expectedLastName);
        }
      });
    }

    // JsonLogic-specific tests
    const jsonLogicTests = {
      dateAfter: [
        {
          combinator: 'and',
          rules: [{ field: 'birthdate', operator: '>', value: comparisonDate }],
        },
        'Vai',
      ],
      dateBefore: [
        {
          combinator: 'and',
          rules: [{ field: 'birthdate', operator: '<', value: comparisonDate }],
        },
        'Vaughan',
      ],
      dateBetween: [
        {
          combinator: 'and',
          rules: [
            { field: 'birthdate', operator: 'between', value: [comparisonDate, comparisonDate2] },
            { field: 'birthdate', operator: 'between', value: [comparisonDate2, comparisonDate] },
          ],
        },
        'Vai',
      ],
      dateIn: [
        {
          combinator: 'and',
          rules: [
            {
              field: 'birthdate',
              operator: 'in',
              value: [comparisonDate, '1960-06-06', comparisonDate2],
            },
          ],
        },
        'Vai',
      ],
      dateNotBetween: [
        {
          combinator: 'or',
          rules: [
            {
              combinator: 'and',
              rules: [
                {
                  field: 'birthdate',
                  operator: 'notBetween',
                  value: [comparisonDate, comparisonDate2],
                },
                {
                  field: 'birthdate',
                  operator: 'notBetween',
                  value: [comparisonDate2, comparisonDate],
                },
              ],
            },
            {
              combinator: 'and',
              rules: [
                {
                  field: 'birthdate',
                  operator: 'notBetween',
                  value: [comparisonYearBefore, comparisonDate],
                },
                {
                  field: 'birthdate',
                  operator: 'notBetween',
                  value: [comparisonDate, comparisonYearBefore],
                },
                { field: 'last_name', operator: '=', value: 'Vaughan' },
              ],
            },
          ],
        },
        'Vaughan',
      ],
      dateNotIn: [
        {
          combinator: 'and',
          rules: [
            {
              field: 'birthdate',
              operator: 'notIn',
              value: [comparisonDate, '1960-06-06', comparisonDate2],
            },
          ],
        },
        'Vaughan',
      ],
      dateNotOn: [
        {
          combinator: 'and',
          rules: [{ field: 'birthdate', operator: '!=', value: '1954-10-03' }],
        },
        'Vai',
      ],
      dateOn: [
        {
          combinator: 'and',
          rules: [
            { field: 'birthdate', operator: '=', value: '1960-06-06' },
            { field: 'created_at', operator: '=', value: today },
            { field: 'created_at', operator: '=', value: 'updated_at', valueSource: 'field' },
          ],
        },
        'Vai',
      ],
      dateOnOrAfter: [
        {
          combinator: 'and',
          rules: [{ field: 'birthdate', operator: '>=', value: '1960-06-06' }],
        },
        'Vai',
      ],
      dateOnOrBefore: [
        {
          combinator: 'and',
          rules: [{ field: 'birthdate', operator: '<=', value: '1954-10-03' }],
        },
        'Vaughan',
      ],
    } satisfies Record<string, [RuleGroupType, 'Vai' | 'Vaughan']>;

    for (const [testCaseName, [testQuery, expectedLastName]] of Object.entries(jsonLogicTests)) {
      test(testCaseName, () => {
        const jsonlogic = formatQuery(testQuery, {
          format: 'jsonlogic',
          fields,
          ruleProcessor: datetimeRuleProcessorJsonLogic,
        });
        const result = musicianRecords.filter(u => apply(jsonlogic, u));
        expect(result).toHaveLength(1);
        expect(result[0].last_name).toBe(expectedLastName);
      });
    }
  });
}
