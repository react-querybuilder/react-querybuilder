import { formatQuery, transformQuery } from 'react-querybuilder';
import { getDatetimeRuleProcessorCEL } from '../datetimeRuleProcessorCEL';
import type { MusicianRecord } from '../dbqueryTestUtils';
import {
  CREATE_MUSICIANS_TABLE,
  dateLibraryFunctions,
  fields,
  testCases,
} from '../dbqueryTestUtils';
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
  updated_at: 'string',
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
      for (const [testCaseName, testCase] of Object.entries(testCases)) {
        test(testCaseName, async () => {
          const itemFields = fields.map(f => ({ ...f, name: `item.${f.name}` }));
          const query = transformQuery(testCase[0], {
            ruleProcessor: r => ({ ...r, field: `item.${r.field}` }),
          });
          const cel = formatQuery(query, {
            format: 'cel',
            parseNumbers: true,
            fields: itemFields,
            ruleProcessor: getDatetimeRuleProcessorCEL(apiFns),
            context: { isDateField },
          });
          // .replaceAll('item.created_at', 'timestamp(item.created_at)')
          // .replaceAll('item.birthdate', 'timestamp(item.birthdate + "T00:00:00.000Z")');
          const result = (await celEvaluator({ data, cel, typemap })) as MusicianRecord[];
          if (testCase[1] === 'all') {
            expect(result).toHaveLength(data.length);
          } else {
            expect(result[0].last_name).toBe(testCase[1]);
          }
        });
      }
    });
  }
}
