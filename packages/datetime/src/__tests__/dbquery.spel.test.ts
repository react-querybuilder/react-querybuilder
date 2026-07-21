import { formatQuery, transformQuery } from '@react-querybuilder/core';
import { spel2jsEvaluator } from '../../../../utils/spel-evaluator/spel2jsEvaluator';
import type { MusicianRecord } from '../dbqueryTestUtils';
import {
  CREATE_MUSICIANS_TABLE,
  dateLibraryFunctions,
  fields,
  testCases,
} from '../dbqueryTestUtils';
import { getDatetimeRuleProcessorSpEL } from '../getDatetimeRuleProcessorSpEL';
import type { IsDateFieldFunction } from '../types';
import { defaultIsDateField } from '../utils';

// SpEL `#root['field']` map-indexer syntax. Resolves against the record root in both spel2js and
// real Spring SpEL; bare `['field']` does not resolve in spel2js.
const indexer = (name: string) => `#root['${name}']`;

const typemap = {
  first_name: 'string',
  middle_name: 'string',
  last_name: 'string',
  birthdate: 'date',
  created_at: 'timestamp',
  updated_at: 'timestamp',
};

const data = CREATE_MUSICIANS_TABLE('spel');

const isDateField: IsDateFieldFunction = (rule, opts = {}) => {
  const { fieldData } = opts;
  if (!fieldData) {
    return defaultIsDateField(rule, opts);
  }
  return defaultIsDateField(rule, {
    ...opts,
    fieldData: { ...fieldData, name: indexer(fieldData.name), value: indexer(fieldData.value) },
  });
};

describe('SpEL (spel2js)', () => {
  for (const [libName, apiFns] of dateLibraryFunctions) {
    describe(libName, () => {
      for (const [testCaseName, [testQuery, expectation]] of Object.entries(testCases)) {
        test(testCaseName, async () => {
          const itemFields = fields.map(f => Object.assign({}, f, { name: indexer(f.name) }));
          const query = transformQuery(testQuery, {
            ruleProcessor: r => ({ ...r, field: indexer(r.field) }),
          });
          const spel = formatQuery(query, {
            format: 'spel',
            parseNumbers: true,
            fields: itemFields,
            ruleProcessor: getDatetimeRuleProcessorSpEL(apiFns),
            context: { isDateField },
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
