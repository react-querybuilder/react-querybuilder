import { formatQuery, transformQuery } from 'react-querybuilder';
import type { MusicianRecord } from '../dbqueryTestUtils';
import {
  CREATE_MUSICIANS_TABLE,
  dateLibraryFunctions,
  fields,
  testCases,
} from '../dbqueryTestUtils';
import { getDatetimeRuleProcessorCEL } from '../getDatetimeRuleProcessorCEL';
import type { IsDateFieldFunction } from '../types';
import { defaultIsDateField } from '../utils';

const { verifyCELEvaluator } = await import('../../../../utils/cel-evaluator/verifyCELEvaluator');

const celEvaluator = await verifyCELEvaluator();

const typemap = {
  first_name: 'string',
  middle_name: 'string',
  last_name: 'string',
  birthdate: 'date',
  created_at: 'timestamp',
  updated_at: 'timestamp',
};

if (celEvaluator) {
  const data = CREATE_MUSICIANS_TABLE('cel');

  const isDateField: IsDateFieldFunction = (rule, opts = {}) => {
    const { fieldData } = opts;
    if (!fieldData) {
      return defaultIsDateField(rule, opts);
    }
    return defaultIsDateField(rule, {
      ...opts,
      fieldData: { ...fieldData, name: `item.${fieldData.name}`, value: `item.${fieldData.value}` },
    });
  };

  for (const [libName, apiFns] of dateLibraryFunctions) {
    describe(libName, () => {
      for (const [testCaseName, [testQuery, expectation]] of Object.entries(testCases)) {
        test(testCaseName, async () => {
          const itemFields = fields.map(f => ({ ...f, name: `item.${f.name}` }));
          const query = transformQuery(testQuery, {
            ruleProcessor: r => ({ ...r, field: `item.${r.field}` }),
          });
          const cel = formatQuery(query, {
            format: 'cel',
            parseNumbers: true,
            fields: itemFields,
            ruleProcessor: getDatetimeRuleProcessorCEL(apiFns),
            context: { isDateField },
          });
          const result = (await celEvaluator({ data, cel, typemap })) as MusicianRecord[];
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
}
