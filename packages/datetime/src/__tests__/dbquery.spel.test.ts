import { formatQuery } from '@react-querybuilder/core';
import { spel2jsEvaluator } from '../../../../utils/spel-evaluator/spel2jsEvaluator';
import type { MusicianRecord } from '../dbqueryTestUtils';
import {
  CREATE_MUSICIANS_TABLE,
  dateLibraryFunctions,
  fields,
  testCases,
} from '../dbqueryTestUtils';
import { getDatetimeRuleProcessorSpEL } from '../getDatetimeRuleProcessorSpEL';

// spel2js resolves the bare field identifiers that `formatQuery('spel')` emits by default against
// the record root, so no `#root['field']` rewrite is needed (matching the Java backend).

const typemap = {
  first_name: 'string',
  middle_name: 'string',
  last_name: 'string',
  birthdate: 'date',
  created_at: 'timestamp',
  updated_at: 'timestamp',
};

const data = CREATE_MUSICIANS_TABLE('spel');

describe('SpEL (spel2js)', () => {
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
          const result = (await spel2jsEvaluator({ data, spel, typemap })) as MusicianRecord[];
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
