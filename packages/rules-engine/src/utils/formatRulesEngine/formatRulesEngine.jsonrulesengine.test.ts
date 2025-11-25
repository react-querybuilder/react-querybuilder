import { Engine } from 'json-rules-engine';
import type { RulesEngine } from '../../types';
import { formatRulesEngine } from './formatRulesEngine';

it('works', async () => {
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

  const jsonRE = formatRulesEngine(re, 'json-rules-engine');

  const engine = new Engine(jsonRE);

  expect(
    await engine.run({ myFact: 'myValue', myOtherFact: 'myValue' }).then(({ events }) => events)
  ).toEqual([
    { type: 'myEvent', params: {} },
    // Rule fails, so this event is not included:
    // { type: 'myOtherEvent', params: {} },
  ]);
});
