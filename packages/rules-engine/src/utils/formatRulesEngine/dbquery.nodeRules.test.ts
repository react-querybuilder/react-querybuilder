import { RuleEngine } from 'node-rules';
import type { Fact, Rule as NodeRule } from 'node-rules';
import type { RulesEngine } from '../../types';
import { formatRulesEngine } from './formatRulesEngine';

// Runs the generated rules against the REAL node-rules engine. Excluded from coverage (see
// vitest.config.ts) since it asserts third-party runtime behavior; the processor's own lines are
// covered by `formatRulesEngine.nodeRules.test.ts`.

const run = (rules: NodeRule[], fact: Fact): Promise<unknown[]> =>
  new Promise(resolve => {
    new RuleEngine(rules).execute(fact, result => resolve((result.events as unknown[]) ?? []));
  });

const types = (events: unknown[]) => events.map(e => (e as { type: string }).type);

it('fires only matching conditions (cascade)', async () => {
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

  const events = await run(formatRulesEngine(re, 'node-rules'), {
    myFact: 'myValue',
    myOtherFact: 'myValue',
  });
  expect(events).toEqual([{ type: 'myEvent', params: {} }]);
});

it('evaluates nested rule groups', async () => {
  const re: RulesEngine = {
    conditions: [
      {
        antecedent: {
          combinator: 'and',
          rules: [
            { field: 'field1', operator: '=', value: 'value1' },
            {
              combinator: 'or',
              rules: [
                { field: 'field2', operator: '!=', value: 'value2' },
                { field: 'field3', operator: '>', value: 10 },
              ],
            },
          ],
        },
        consequent: { type: 'nestedEvent' },
      },
    ],
  };
  const rules = formatRulesEngine(re, 'node-rules');

  expect(types(await run(rules, { field1: 'value1', field2: 'different', field3: 5 }))).toEqual([
    'nestedEvent',
  ]);
  expect(types(await run(rules, { field1: 'value1', field2: 'value2', field3: 15 }))).toEqual([
    'nestedEvent',
  ]);
  expect(types(await run(rules, { field1: 'wrong', field2: 'different', field3: 15 }))).toEqual([]);
});

const tieredRE: RulesEngine = {
  conditions: [
    {
      antecedent: {
        combinator: 'and',
        rules: [{ field: 'experience', operator: '>=', value: 10 }],
      },
      consequent: { type: 'veteran' },
    },
    {
      antecedent: { combinator: 'and', rules: [{ field: 'experience', operator: '>=', value: 3 }] },
      consequent: { type: 'seasoned' },
    },
    {
      antecedent: { combinator: 'and', rules: [{ field: 'experience', operator: '>=', value: 0 }] },
      consequent: { type: 'rookie' },
    },
  ],
};

it('cascade stops at the first matching overlapping condition', async () => {
  const rules = formatRulesEngine(tieredRE, 'node-rules');
  expect(types(await run(rules, { experience: 12 }))).toEqual(['veteran']);
  expect(types(await run(rules, { experience: 5 }))).toEqual(['seasoned']);
  expect(types(await run(rules, { experience: 0 }))).toEqual(['rookie']);
});

it('cumulative fires every matching overlapping condition in priority order', async () => {
  const rules = formatRulesEngine(tieredRE, { format: 'node-rules', evaluationMode: 'cumulative' });
  expect(types(await run(rules, { experience: 12 }))).toEqual(['veteran', 'seasoned', 'rookie']);
  expect(types(await run(rules, { experience: 5 }))).toEqual(['seasoned', 'rookie']);
  expect(types(await run(rules, { experience: 0 }))).toEqual(['rookie']);
});

const instrumentRE: RulesEngine = {
  conditions: [
    {
      antecedent: {
        combinator: 'and',
        rules: [{ field: 'instrument', operator: '=', value: 'guitar' }],
      },
      consequent: { type: 'guitarPart' },
    },
    {
      antecedent: {
        combinator: 'and',
        rules: [{ field: 'instrument', operator: '=', value: 'drums' }],
      },
      consequent: { type: 'drumPart' },
    },
  ],
  defaultConsequent: { type: 'unassigned' },
};

it('cascade default consequent fires only when every sibling antecedent fails', async () => {
  const rules = formatRulesEngine(instrumentRE, 'node-rules');
  expect(types(await run(rules, { instrument: 'guitar' }))).toEqual(['guitarPart']);
  expect(types(await run(rules, { instrument: 'bass' }))).toEqual(['unassigned']);
});

it('cumulative default consequent is an always-true baseline', async () => {
  const rules = formatRulesEngine(instrumentRE, {
    format: 'node-rules',
    evaluationMode: 'cumulative',
  });
  expect(types(await run(rules, { instrument: 'drums' }))).toEqual(['drumPart', 'unassigned']);
  expect(types(await run(rules, { instrument: 'bass' }))).toEqual(['unassigned']);
});

it('does not mutate the input fact', async () => {
  const rules = formatRulesEngine(tieredRE, 'node-rules');
  const fact: Fact = { experience: 12 };
  await run(rules, fact);
  expect(fact.events).toBeUndefined();
});
