import { RulePilot } from 'rulepilot';
import type { Rule as RulePilotRule } from 'rulepilot';
import type { RulesEngine } from '../../types';
import { formatRulesEngine } from './formatRulesEngine';

// Runs the generated rule against the REAL rulepilot evaluator. Excluded from coverage (see
// vitest.config.ts) since it asserts third-party runtime behavior; the processor's own lines are
// covered by `formatRulesEngine.rulepilot.test.ts`.
//
// `RulePilot.evaluate` returns a SINGLE result (the first matching condition's `result`), so these
// tests assert single-outcome decisioning. Guards built from empty antecedents / cascade defaults
// compile to an always-true `{ all: [] }`, which rulepilot's validator rejects—hence `trustRule`
// (the third argument) is set so evaluation skips pre-validation.

const evaluate = (rule: RulePilotRule, criteria: Record<string, unknown>): Promise<unknown> =>
  RulePilot.evaluate(rule, criteria, true);

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

it('returns the first matching condition in an overlapping cascade', async () => {
  const rule = formatRulesEngine(tieredRE, 'rulepilot');
  expect(await evaluate(rule, { experience: 12 })).toEqual({ type: 'veteran' });
  expect(await evaluate(rule, { experience: 5 })).toEqual({ type: 'seasoned' });
  expect(await evaluate(rule, { experience: 0 })).toEqual({ type: 'rookie' });
});

it('falls through to the default consequent when no condition matches', async () => {
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
  const rule = formatRulesEngine(instrumentRE, 'rulepilot');
  expect(await evaluate(rule, { instrument: 'guitar' })).toEqual({ type: 'guitarPart' });
  expect(await evaluate(rule, { instrument: 'bass' })).toEqual({ type: 'unassigned' });
});

it('returns false when no condition matches and there is no default', async () => {
  const rule = formatRulesEngine(
    {
      conditions: [
        {
          antecedent: { combinator: 'and', rules: [{ field: 'x', operator: '=', value: 'y' }] },
          consequent: { type: 'matched' },
        },
      ],
    },
    'rulepilot'
  );
  expect(await evaluate(rule, { x: 'nope' })).toBe(false);
});

it('yields only the FIRST consequent for nested/overlapping conditions (single-result limitation)', async () => {
  // Under the "native"/"json-rules-engine" targets, an in-section instrument fires BOTH the parent
  // (stringSection) and the matching child (celloChair). rulepilot returns a single result, so only
  // the first-matched condition (the parent) is reported.
  const nestedRE: RulesEngine = {
    conditions: [
      {
        antecedent: {
          combinator: 'and',
          rules: [{ field: 'section', operator: '=', value: 'strings' }],
        },
        consequent: { type: 'stringSection' },
        conditions: [
          {
            antecedent: {
              combinator: 'and',
              rules: [{ field: 'instrument', operator: '=', value: 'violin' }],
            },
            consequent: { type: 'violinChair' },
          },
          {
            antecedent: {
              combinator: 'and',
              rules: [{ field: 'instrument', operator: '=', value: 'cello' }],
            },
            consequent: { type: 'celloChair' },
          },
        ],
      },
    ],
  };
  const rule = formatRulesEngine(nestedRE, 'rulepilot');
  // In-section: only the parent is returned, not the matching child.
  expect(await evaluate(rule, { section: 'strings', instrument: 'cello' })).toEqual({
    type: 'stringSection',
  });
  // In-section, unmatched chair: still the parent.
  expect(await evaluate(rule, { section: 'strings', instrument: 'viola' })).toEqual({
    type: 'stringSection',
  });
  // Out-of-section: nothing matches.
  expect(await evaluate(rule, { section: 'brass', instrument: 'cello' })).toBe(false);
});

it('evaluates nested rule groups within an antecedent', async () => {
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
  const rule = formatRulesEngine(re, 'rulepilot');
  expect(await evaluate(rule, { field1: 'value1', field2: 'different', field3: 5 })).toEqual({
    type: 'nestedEvent',
  });
  expect(await evaluate(rule, { field1: 'value1', field2: 'value2', field3: 15 })).toEqual({
    type: 'nestedEvent',
  });
  expect(await evaluate(rule, { field1: 'wrong', field2: 'different', field3: 15 })).toBe(false);
});

it('evaluates in / between / null / notNull operators end-to-end', async () => {
  const re: RulesEngine = {
    conditions: [
      {
        antecedent: {
          combinator: 'and',
          rules: [
            { field: 'role', operator: 'in', value: ['admin', 'root'] },
            { field: 'age', operator: 'between', value: [18, 65] },
            { field: 'email', operator: 'notNull', value: null },
            { field: 'deletedAt', operator: 'null', value: null },
          ],
        },
        consequent: { type: 'activePrivilegedAdult' },
      },
    ],
  };
  const rule = formatRulesEngine(re, 'rulepilot');
  expect(
    await evaluate(rule, { role: 'admin', age: 30, email: 'a@b.com', deletedAt: null })
  ).toEqual({ type: 'activePrivilegedAdult' });
  // Out of range age.
  expect(await evaluate(rule, { role: 'admin', age: 70, email: 'a@b.com', deletedAt: null })).toBe(
    false
  );
  // Not in the role list.
  expect(await evaluate(rule, { role: 'guest', age: 30, email: 'a@b.com', deletedAt: null })).toBe(
    false
  );
  // Email is null (fails notNull).
  expect(await evaluate(rule, { role: 'admin', age: 30, email: null, deletedAt: null })).toBe(
    false
  );
  // deletedAt present (fails null).
  expect(
    await evaluate(rule, { role: 'admin', age: 30, email: 'a@b.com', deletedAt: '2020-01-01' })
  ).toBe(false);
});

it('evaluates a notBetween antecedent', async () => {
  const re: RulesEngine = {
    conditions: [
      {
        antecedent: {
          combinator: 'and',
          rules: [{ field: 'age', operator: 'notBetween', value: [18, 65] }],
        },
        consequent: { type: 'outsideWorkingAge' },
      },
    ],
  };
  const rule = formatRulesEngine(re, 'rulepilot');
  expect(await evaluate(rule, { age: 70 })).toEqual({ type: 'outsideWorkingAge' });
  expect(await evaluate(rule, { age: 30 })).toBe(false);
});
