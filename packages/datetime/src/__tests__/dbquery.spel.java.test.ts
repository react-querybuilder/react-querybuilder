import { formatQuery } from '@react-querybuilder/core';
import { verifySpELEvaluator } from '../../../../utils/spel-evaluator/verifySpELEvaluator';
import type { MusicianRecord } from '../dbqueryTestUtils';
import {
  CREATE_MUSICIANS_TABLE,
  dateLibraryFunctions,
  fields,
  testCases,
} from '../dbqueryTestUtils';
import { getDatetimeRuleProcessorSpEL } from '../getDatetimeRuleProcessorSpEL';

// Real Spring/Java SpEL backend. Runs alongside the spel2js suite. Uses the default
// `formatQuery('spel')` output (bare field identifiers) resolved via the Java MapAccessor. Dates are
// materialized to ISO strings and compared via String.compareTo (both operands Comparable).

const spelEvaluator = await verifySpELEvaluator();

const typemap = {
  first_name: 'string',
  middle_name: 'string',
  last_name: 'string',
  birthdate: 'date',
  created_at: 'timestamp',
  updated_at: 'timestamp',
};

const data = CREATE_MUSICIANS_TABLE('spel');

if (spelEvaluator) {
  describe('SpEL (Java)', () => {
    for (const [libName, apiFns] of dateLibraryFunctions) {
      describe(libName, () => {
        for (const [testCaseName, [testQuery, expectation]] of Object.entries(testCases)) {
          test(testCaseName, async () => {
            const spel = formatQuery(testQuery, {
              format: 'spel',
              parseNumbers: true,
              fields,
              ruleProcessor: getDatetimeRuleProcessorSpEL(apiFns),
            });
            const result = (await spelEvaluator({ data, spel, typemap })) as MusicianRecord[];
            // oxlint-disable no-conditional-expect
            if (expectation === 'all') {
              expect(result).toHaveLength(data.length);
            } else {
              expect(result).toHaveLength(1);
              expect(result[0].last_name).toBe(expectation);
            }
            // oxlint-enable no-conditional-expect
          });
        }
      });
    }
  });
}
