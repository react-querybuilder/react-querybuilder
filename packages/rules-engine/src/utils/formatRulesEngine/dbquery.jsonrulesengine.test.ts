import { Engine } from 'json-rules-engine';
import type { RulesEngine } from '../../types';
import { formatRulesEngine } from './formatRulesEngine';

it('basic boolean', async () => {
  const re: RulesEngine = {
    conditions: [
      {
        antecedent: {
          combinator: 'and',
          rules: [{ field: 'myFact', operator: '=', value: 'myValue' }],
        },
        consequent: { type: 'myEvent', params: {} },
      },
      {
        antecedent: {
          combinator: 'and',
          rules: [{ field: 'myOtherFact', operator: '!=', value: 'myValue' }],
        },
        consequent: { type: 'myOtherEvent', params: {} },
      },
    ],
  };

  const engine = new Engine(formatRulesEngine(re, 'json-rules-engine'));

  expect(
    await engine.run({ myFact: 'myValue', myOtherFact: 'myValue' }).then(({ events }) => events)
  ).toEqual([
    { type: 'myEvent', params: {} },
    // Rule fails, otherwise this would be included:
    // { type: 'myOtherEvent', params: {} },
  ]);
});
