/* @jest-environment node */

import { formatQuery } from '@react-querybuilder/core';
import jsonata from 'jsonata';
import {
  CREATE_MUSICIANS_TABLE,
  dateLibraryFunctions,
  fields,
  musicians,
  testCases,
} from '../dbqueryTestUtils';
import { getDatetimeRuleProcessorJSONata } from '../getDatetimeRuleProcessorJSONata';

const musiciansJSONata = CREATE_MUSICIANS_TABLE('jsonata');

for (const [libName, apiFns] of dateLibraryFunctions) {
  describe(libName, () => {
    for (const [testCaseName, [query, expectation]] of Object.entries(testCases)) {
      test(testCaseName, async () => {
        // const guardedQuery =
        //   guardAgainstNull && guardAgainstNull.length > 0
        //     ? ({
        //         combinator: 'and',
        //         rules: [
        //           ...guardAgainstNull.map(f => ({ field: f, operator: 'notNull', value: null })),
        //           query,
        //         ],
        //       } as DefaultRuleGroupType)
        //     : query;
        const queryAsJSONata = `*[${formatQuery(query, { format: 'jsonata', parseNumbers: true, fields, ruleProcessor: getDatetimeRuleProcessorJSONata(apiFns) })}]`;
        const expression = jsonata(queryAsJSONata);
        const result = await expression.evaluate(musiciansJSONata);
        // oxlint-disable no-conditional-expect
        if (expectation === 'all') {
          expect(result).toHaveLength(musicians.length);
        } else {
          expect(result.last_name).toBe(expectation);
        }
        // oxlint-enable no-conditional-expect
      });
    }
  });
}
