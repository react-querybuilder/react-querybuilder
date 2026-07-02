import type { RuleGroupProcessor, RuleProcessor } from '@react-querybuilder/core';
import type { API as NodeRulesAPI, Fact } from 'node-rules';
import type { NativePredicate, RulesEngine } from '../../types';
import { formatRulesEngine } from './formatRulesEngine';

// NOTE: This file is a `.test.ts` and therefore runs under BOTH `bun test` and Vitest. It must not
// use `vi`/Vitest-only globals.
//
// The `"node-rules"` target produces live `Rule` objects (`condition`/`consequence` functions).
// These tests assert the object shape and unit-invoke the generated functions with a minimal
// flow-control stub. End-to-end evaluation against the real `RuleEngine` lives in
// `dbquery.nodeRules.test.ts`.

/** Minimal stand-in for the node-rules flow-control API, recording `when`/`next` calls. */
const makeAPI = () => {
  const log = { when: [] as boolean[], next: 0 };
  const API = {
    when: (outcome: unknown) => {
      log.when.push(!!outcome);
    },
    next: () => {
      log.next += 1;
    },
    stop: () => {},
    restart: () => {},
    rule: () => ({}),
  } as unknown as NodeRulesAPI;
  return { API, log };
};

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

it('produces one node-rules rule per flattened condition with strictly descending priorities', () => {
  const rules = formatRulesEngine(tieredRE, 'node-rules');
  expect(rules).toHaveLength(3);
  expect(rules.map(r => r.priority)).toEqual([3, 2, 1]);
  for (const rule of rules) {
    expect(typeof rule.condition).toBe('function');
    expect(typeof rule.consequence).toBe('function');
  }
});

it('gates the condition on the compiled guard', () => {
  const [rule] = formatRulesEngine(tieredRE, 'node-rules');
  const { API, log } = makeAPI();

  // Matching fact → guard true.
  rule.condition(API, { experience: 12 });
  // Non-matching fact (fresh fact, never fired) → guard false.
  rule.condition(API, { experience: 1 });

  expect(log.when).toEqual([true, false]);
});

it('collects fired consequents onto fact.events and suppresses re-fires per execution', () => {
  const [rule] = formatRulesEngine(tieredRE, 'node-rules');
  const { API, log } = makeAPI();
  const fact = { experience: 12 } as Fact;

  // First fire: creates the per-fact fired set, pushes the consequent, advances.
  rule.consequence(API, fact);
  expect(fact.events).toEqual([{ type: 'veteran' }]);
  expect(log.next).toBe(1);

  // Re-running the consequence on the SAME fact reuses the existing fired set.
  rule.consequence(API, fact);
  expect(fact.events).toEqual([{ type: 'veteran' }, { type: 'veteran' }]);
  expect(log.next).toBe(2);

  // Once fired, the guard short-circuits to `when(false)` so the engine's forward-chaining restart
  // cannot fire the same rule again.
  rule.condition(API, fact);
  expect(log.when).toEqual([false]);

  // A different fact object (new `execute`) starts fresh.
  const other = { experience: 12 } as Fact;
  rule.condition(API, other);
  expect(log.when).toEqual([false, true]);
});

it('later cascade siblings negate the antecedents of their prior siblings', () => {
  const [, seasoned, rookie] = formatRulesEngine(tieredRE, 'node-rules');
  const { API, log } = makeAPI();
  // rookie's guard ANDs NOT(>=10), NOT(>=3), (>=0).
  rookie.condition(API, { experience: 12 }); // NOT(>=10) is false → when(false)
  seasoned.condition(API, { experience: 1 }); // NOT(>=10) true but own (>=3) false → when(false)
  rookie.condition(API, { experience: 1 }); // all negations hold and (>=0) → when(true)
  expect(log.when).toEqual([false, false, true]);
});

it('reads evaluationMode from options and from the rules engine object', () => {
  // Default (cascade) flattens to one rule per condition.
  expect(formatRulesEngine(tieredRE, 'node-rules')).toHaveLength(3);
  // Cumulative via options.
  expect(
    formatRulesEngine(tieredRE, { format: 'node-rules', evaluationMode: 'cumulative' })
  ).toHaveLength(3);
  // Cumulative read from the rules engine object.
  expect(
    formatRulesEngine({ ...tieredRE, evaluationMode: 'cumulative' }, 'node-rules')
  ).toHaveLength(3);
});

it('emits a guarded default consequent rule', () => {
  const re: RulesEngine = { ...tieredRE, defaultConsequent: { type: 'unassigned' } };
  const rules = formatRulesEngine(re, 'node-rules');
  expect(rules).toHaveLength(4);
  expect(rules.map(r => r.priority)).toEqual([4, 3, 2, 1]);
});

it('uses a custom ruleProcessor supplied via formatQueryOptions', () => {
  const re: RulesEngine = {
    conditions: [
      {
        antecedent: { combinator: 'and', rules: [{ field: 'ignored', operator: '=', value: 'x' }] },
        consequent: { type: 'customRule' },
      },
    ],
  };
  // Ignores the rule; keys off a `flag` fact instead.
  const ruleProcessor: RuleProcessor = (): NativePredicate => facts =>
    (facts as { flag?: boolean }).flag === true;

  const [rule] = formatRulesEngine(re, {
    format: 'node-rules',
    formatQueryOptions: { ruleProcessor },
  });
  const { API, log } = makeAPI();
  rule.condition(API, { flag: true });
  rule.condition(API, { flag: false });
  expect(log.when).toEqual([true, false]);
});

it('uses a custom ruleGroupProcessor supplied via formatQueryOptions', () => {
  const re: RulesEngine = {
    conditions: [
      {
        antecedent: { combinator: 'and', rules: [{ field: 'ignored', operator: '=', value: 'x' }] },
        consequent: { type: 'customGroup' },
      },
    ],
  };
  const ruleGroupProcessor: RuleGroupProcessor<NativePredicate> = () => facts =>
    (facts as { ok?: boolean }).ok === true;

  const [rule] = formatRulesEngine(re, {
    format: 'node-rules',
    formatQueryOptions: { ruleGroupProcessor },
  });
  const { API, log } = makeAPI();
  rule.condition(API, { ok: true });
  rule.condition(API, { ok: false });
  expect(log.when).toEqual([true, false]);
});
