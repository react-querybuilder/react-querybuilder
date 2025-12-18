import type { RulesEngine } from '../../types';
import { formatRulesEngine } from './formatRulesEngine';

it('works without options', async () => {
  const re: RulesEngine = {
    conditions: [
      {
        antecedent: {
          combinator: 'and',
          rules: [{ field: 'myFact', operator: '=', value: 'myValue' }],
        },
        consequent: { type: 'myEvent', params: {} },
      },
    ],
  };

  expect(formatRulesEngine(re)).toBe(JSON.stringify(re, null, 2));
});

it('works with custom processor', async () => {
  const re: RulesEngine = {
    conditions: [
      {
        antecedent: {
          combinator: 'and',
          rules: [{ field: 'myFact', operator: '=', value: 'myValue' }],
        },
        consequent: { type: 'myEvent', params: {} },
      },
    ],
  };

  const rulesEngineProcessor = () => JSON.stringify(re, null, 2);

  expect(formatRulesEngine(re, { rulesEngineProcessor })).toBe(JSON.stringify(re, null, 2));
});
