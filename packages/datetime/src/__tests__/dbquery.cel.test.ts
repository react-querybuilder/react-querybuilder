import { $ } from 'bun';
import path from 'node:path';
import { formatQuery, transformQuery } from 'react-querybuilder';
import { verifyCELEvaluator } from '../../../../utils/cel-evaluator/verifyCELEvaluator';
import { getDatetimeRuleProcessorCEL } from '../datetimeRuleProcessorCEL';
import {
  CREATE_MUSICIANS_TABLE,
  dateLibraryFunctions,
  fields,
  testCases,
} from '../dbqueryTestUtils';
import type { IsDateFieldFunction } from '../types';
import { defaultIsDateField } from '../utils';

const repoRootDir = path.join(import.meta.dir, '../../../..');
const celEvaluatorDir = `${repoRootDir}/utils/cel-evaluator`;
$.nothrow();
$.cwd(repoRootDir);

if (await verifyCELEvaluator()) {
  const musiciansCEL = CREATE_MUSICIANS_TABLE('cel');

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
          const celQuery = formatQuery(query, {
            format: 'cel',
            parseNumbers: true,
            fields: itemFields,
            ruleProcessor: getDatetimeRuleProcessorCEL(apiFns),
            context: { isDateField },
          })
            .replaceAll('item.created_at', 'timestamp(item.created_at)')
            .replaceAll('item.birthdate', 'timestamp(item.birthdate + "T00:00:00.000Z")');
          const result = JSON.parse(
            await $`${celEvaluatorDir}/cel-evaluator ${JSON.stringify(musiciansCEL)} ${celQuery}`.text()
          );
          if (testCase[1] === 'all') {
            expect(result).toHaveLength(musiciansCEL.length);
          } else {
            expect(result[0].last_name).toBe(testCase[1]);
          }
        });
      }
    });
  }
}
