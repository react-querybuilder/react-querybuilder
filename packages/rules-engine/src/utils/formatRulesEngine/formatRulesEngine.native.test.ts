import type { RuleGroupProcessor, RuleProcessor } from '@react-querybuilder/core';
import type { NativePredicate, RulesEngine } from '../../types';
import { formatRulesEngine } from './formatRulesEngine';

// NOTE: This file is a `.test.ts` and therefore runs under BOTH `bun test` and Vitest. It must not
// use `vi`/Vitest-only globals.
//
// The `"native"` target compiles a rules engine into an in-process evaluator: `evaluate(facts)`
// returns the consequents of every condition that fires, in order, honoring the `evaluationMode`.
// These tests mirror the behavioral `json-rules-engine` suite for parity.

const types = (consequents: { type: string }[]) => consequents.map(c => c.type);

it('basic boolean', () => {
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

  const evaluate = formatRulesEngine(re, 'native');
  expect(evaluate({ myFact: 'myValue', myOtherFact: 'myValue' })).toEqual([
    { type: 'myEvent', params: {} },
    // Second condition fails, otherwise this would be included:
    // { type: 'myOtherEvent', params: {} },
  ]);
});

it('nested rule groups', () => {
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
        consequent: { type: 'nestedEvent', params: { message: 'nested triggered' } },
      },
    ],
  };

  const evaluate = formatRulesEngine(re, 'native');
  const fired = [{ type: 'nestedEvent', params: { message: 'nested triggered' } }];

  // Nested OR succeeds (field2 != value2)
  expect(evaluate({ field1: 'value1', field2: 'different', field3: 5 })).toEqual(fired);
  // Nested OR succeeds (field3 > 10)
  expect(evaluate({ field1: 'value1', field2: 'value2', field3: 15 })).toEqual(fired);
  // Outer AND fails (field1 doesn't match)
  expect(evaluate({ field1: 'wrong', field2: 'different', field3: 15 })).toEqual([]);
});

it('filters placeholder rules correctly', () => {
  const re: RulesEngine = {
    conditions: [
      {
        antecedent: {
          combinator: 'and',
          rules: [
            { field: 'validField', operator: '=', value: 'validValue' },
            { field: '~', operator: '=', value: 'value' }, // placeholder field - filtered
            { field: 'field', operator: '~', value: 'value' }, // placeholder operator - filtered
          ],
        },
        consequent: { type: 'filteredEvent', params: {} },
      },
    ],
  };

  const evaluate = formatRulesEngine(re, 'native');
  // Only the valid rule is evaluated
  expect(evaluate({ validField: 'validValue', '~': 'value', field: 'value' })).toEqual([
    { type: 'filteredEvent', params: {} },
  ]);
  expect(evaluate({ validField: 'wrong', '~': 'value', field: 'value' })).toEqual([]);
});

it('OR combinators with NOT conditions', () => {
  const re: RulesEngine = {
    conditions: [
      {
        antecedent: {
          combinator: 'or',
          not: true,
          rules: [
            { field: 'field1', operator: '=', value: 'value1' },
            { field: 'field2', operator: '!=', value: 'value2' },
          ],
        },
        consequent: { type: 'notOrEvent', params: {} },
      },
    ],
  };

  const evaluate = formatRulesEngine(re, 'native');
  // NOT (field1 = value1 OR field2 != value2): fires only when BOTH are false.
  expect(evaluate({ field1: 'other', field2: 'value2' })).toEqual([
    { type: 'notOrEvent', params: {} },
  ]);
  expect(evaluate({ field1: 'value1', field2: 'value2' })).toEqual([]);
  expect(evaluate({ field1: 'other', field2: 'different' })).toEqual([]);
});

it('conditions without consequent emit a default empty consequent', () => {
  const re: RulesEngine = {
    conditions: [
      {
        antecedent: {
          combinator: 'and',
          rules: [{ field: 'field1', operator: '=', value: 'value1' }],
        },
      },
    ],
  };

  const evaluate = formatRulesEngine(re, 'native');
  expect(evaluate({ field1: 'value1' })).toEqual([{ type: '' }]);
  expect(evaluate({ field1: 'nope' })).toEqual([]);
});

it('various operators correctly', () => {
  const re: RulesEngine = {
    conditions: [
      {
        antecedent: {
          combinator: 'and',
          rules: [
            { field: 'equalField', operator: '=', value: 'test' },
            { field: 'notEqualField', operator: '!=', value: 'exclude' },
            { field: 'lessThanField', operator: '<', value: 100 },
            { field: 'lessThanInclusiveField', operator: '<=', value: 50 },
            { field: 'greaterThanField', operator: '>', value: 10 },
            { field: 'greaterThanInclusiveField', operator: '>=', value: 20 },
          ],
        },
        consequent: { type: 'operatorEvent', params: {} },
      },
    ],
  };

  const evaluate = formatRulesEngine(re, 'native');
  expect(
    evaluate({
      equalField: 'test',
      notEqualField: 'include',
      lessThanField: 99,
      lessThanInclusiveField: 50,
      greaterThanField: 11,
      greaterThanInclusiveField: 20,
    })
  ).toEqual([{ type: 'operatorEvent', params: {} }]);

  expect(
    evaluate({
      equalField: 'test',
      notEqualField: 'include',
      lessThanField: 101, // fails the < 100 condition
      lessThanInclusiveField: 50,
      greaterThanField: 11,
      greaterThanInclusiveField: 20,
    })
  ).toEqual([]);
});

it('deeply nested rule groups execute correctly', () => {
  const re: RulesEngine = {
    conditions: [
      {
        antecedent: {
          combinator: 'and',
          rules: [
            {
              combinator: 'or',
              rules: [
                { field: 'level1', operator: '=', value: 'value1' },
                {
                  combinator: 'and',
                  rules: [
                    { field: 'level2a', operator: '!=', value: 'exclude' },
                    { field: 'level2b', operator: '>', value: 5 },
                  ],
                },
              ],
            },
          ],
        },
        consequent: { type: 'deepEvent', params: { depth: 'deep' } },
      },
    ],
  };

  const evaluate = formatRulesEngine(re, 'native');
  const fired = [{ type: 'deepEvent', params: { depth: 'deep' } }];

  // First branch of OR (level1 = value1)
  expect(evaluate({ level1: 'value1', level2a: 'exclude', level2b: 3 })).toEqual(fired);
  // Second branch of OR (level2a != exclude AND level2b > 5)
  expect(evaluate({ level1: 'other', level2a: 'include', level2b: 10 })).toEqual(fired);
  // Neither branch succeeds
  expect(evaluate({ level1: 'other', level2a: 'exclude', level2b: 3 })).toEqual([]);
});

it('empty rule groups always succeed', () => {
  const re: RulesEngine = {
    conditions: [
      {
        antecedent: { combinator: 'and', rules: [] },
        consequent: { type: 'emptyEvent', params: {} },
      },
    ],
  };

  const evaluate = formatRulesEngine(re, 'native');
  expect(evaluate({ anyField: 'anyValue' })).toEqual([{ type: 'emptyEvent', params: {} }]);
});

it('multiple conditions with different outcomes', () => {
  const re: RulesEngine = {
    conditions: [
      {
        antecedent: {
          combinator: 'and',
          rules: [{ field: 'userType', operator: '=', value: 'admin' }],
        },
        consequent: { type: 'adminAccess', params: { level: 'full' } },
      },
      {
        antecedent: {
          combinator: 'and',
          rules: [
            { field: 'userType', operator: '=', value: 'user' },
            { field: 'verified', operator: '=', value: true },
          ],
        },
        consequent: { type: 'userAccess', params: { level: 'limited' } },
      },
      {
        antecedent: {
          combinator: 'and',
          rules: [{ field: 'userType', operator: '=', value: 'guest' }],
        },
        consequent: { type: 'guestAccess', params: { level: 'read-only' } },
      },
    ],
  };

  const evaluate = formatRulesEngine(re, 'native');
  expect(evaluate({ userType: 'admin', verified: false })).toEqual([
    { type: 'adminAccess', params: { level: 'full' } },
  ]);
  expect(evaluate({ userType: 'user', verified: true })).toEqual([
    { type: 'userAccess', params: { level: 'limited' } },
  ]);
  expect(evaluate({ userType: 'guest', verified: false })).toEqual([
    { type: 'guestAccess', params: { level: 'read-only' } },
  ]);
  expect(evaluate({ userType: 'user', verified: false })).toEqual([]);
});

// #region Evaluation mode: cascade vs cumulative

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

it('cascade mode stops at the first matching overlapping condition', () => {
  const evaluate = formatRulesEngine(tieredRE, 'native'); // default cascade
  expect(types(evaluate({ experience: 12 }))).toEqual(['veteran']);
  expect(types(evaluate({ experience: 5 }))).toEqual(['seasoned']);
  expect(types(evaluate({ experience: 0 }))).toEqual(['rookie']);
});

it('cumulative mode fires every matching overlapping condition', () => {
  const evaluate = formatRulesEngine(tieredRE, { format: 'native', evaluationMode: 'cumulative' });
  expect(types(evaluate({ experience: 12 }))).toEqual(['veteran', 'seasoned', 'rookie']);
  expect(types(evaluate({ experience: 5 }))).toEqual(['seasoned', 'rookie']);
  expect(types(evaluate({ experience: 0 }))).toEqual(['rookie']);
});

it('reads evaluationMode stored on the rules engine object', () => {
  const evaluate = formatRulesEngine({ ...tieredRE, evaluationMode: 'cumulative' }, 'native');
  expect(types(evaluate({ experience: 12 }))).toEqual(['veteran', 'seasoned', 'rookie']);
});

it('options.evaluationMode overrides the value on the rules engine object', () => {
  const evaluate = formatRulesEngine(
    { ...tieredRE, evaluationMode: 'cumulative' },
    { format: 'native', evaluationMode: 'cascade' }
  );
  expect(types(evaluate({ experience: 12 }))).toEqual(['veteran']);
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

it('cascade default consequent fires only when every sibling antecedent fails', () => {
  const evaluate = formatRulesEngine(instrumentRE, 'native');
  expect(types(evaluate({ instrument: 'guitar' }))).toEqual(['guitarPart']);
  expect(types(evaluate({ instrument: 'bass' }))).toEqual(['unassigned']);
});

it('cumulative default consequent is an always-true baseline', () => {
  const evaluate = formatRulesEngine(instrumentRE, {
    format: 'native',
    evaluationMode: 'cumulative',
  });
  // A match still fires the baseline default alongside it.
  expect(types(evaluate({ instrument: 'drums' }))).toEqual(['drumPart', 'unassigned']);
  // No match: only the baseline default fires.
  expect(types(evaluate({ instrument: 'bass' }))).toEqual(['unassigned']);
});

it('nested sub-conditions are guarded by ancestor antecedents (cascade)', () => {
  const re: RulesEngine = {
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

  const evaluate = formatRulesEngine(re, 'native');
  // In-section instrument: parent + matching child fire.
  expect(types(evaluate({ section: 'strings', instrument: 'cello' }))).toEqual([
    'stringSection',
    'celloChair',
  ]);
  // Out-of-section: neither parent nor children fire.
  expect(types(evaluate({ section: 'brass', instrument: 'cello' }))).toEqual([]);
  // In section but unmatched chair: only parent fires.
  expect(types(evaluate({ section: 'strings', instrument: 'viola' }))).toEqual(['stringSection']);
});

it('a condition that only groups nested conditions contributes no consequent of its own', () => {
  const re: RulesEngine = {
    conditions: [
      {
        antecedent: {
          combinator: 'and',
          rules: [{ field: 'onStage', operator: '=', value: true }],
        },
        // no consequent: pure guard wrapper
        conditions: [
          {
            antecedent: {
              combinator: 'and',
              rules: [{ field: 'role', operator: '=', value: 'lead' }],
            },
            consequent: { type: 'spotlight' },
          },
        ],
      },
    ],
  };

  const evaluate = formatRulesEngine(re, 'native');
  expect(types(evaluate({ onStage: true, role: 'lead' }))).toEqual(['spotlight']);
  expect(types(evaluate({ onStage: false, role: 'lead' }))).toEqual([]);
});

// #endregion

// #region Validation / filtering edge cases

it('a muted outermost antecedent compiles to an always-true guard', () => {
  const re: RulesEngine = {
    conditions: [
      {
        antecedent: {
          id: 'root-group',
          combinator: 'and',
          muted: true,
          rules: [{ field: 'field1', operator: '=', value: 'value1' }],
        },
        consequent: { type: 'mutedRootEvent' },
      },
    ],
  };

  const evaluate = formatRulesEngine(re, 'native');
  // Muted (invalid) outermost group → always fires, regardless of facts.
  expect(types(evaluate({ field1: 'anything-else' }))).toEqual(['mutedRootEvent']);
});

it('a muted nested group is filtered out of its parent antecedent', () => {
  const re: RulesEngine = {
    conditions: [
      {
        antecedent: {
          combinator: 'and',
          rules: [
            { field: 'validField', operator: '=', value: 'validValue' },
            {
              combinator: 'and',
              muted: true,
              rules: [{ field: 'someField', operator: '=', value: 'someValue' }],
            },
          ],
        },
        consequent: { type: 'mutedNestedEvent' },
      },
    ],
  };

  const evaluate = formatRulesEngine(re, 'native');
  // The muted nested group is dropped, so only `validField` gates the consequent.
  expect(types(evaluate({ validField: 'validValue', someField: 'irrelevant' }))).toEqual([
    'mutedNestedEvent',
  ]);
  expect(types(evaluate({ validField: 'wrong' }))).toEqual([]);
});

it('a nested group that becomes empty after filtering is dropped', () => {
  const re: RulesEngine = {
    conditions: [
      {
        antecedent: {
          combinator: 'and',
          rules: [
            { field: 'validField', operator: '=', value: 'validValue' },
            {
              combinator: 'or',
              rules: [
                { field: '~', operator: '=', value: 'value' }, // placeholder field
                { field: 'field', operator: '~', value: 'value' }, // placeholder operator
              ],
            },
          ],
        },
        consequent: { type: 'emptyNestedEvent' },
      },
    ],
  };

  const evaluate = formatRulesEngine(re, 'native');
  expect(types(evaluate({ validField: 'validValue' }))).toEqual(['emptyNestedEvent']);
  expect(types(evaluate({ validField: 'wrong' }))).toEqual([]);
});

it('a muted individual rule is filtered out', () => {
  const re: RulesEngine = {
    conditions: [
      {
        antecedent: {
          combinator: 'and',
          rules: [
            { field: 'validField', operator: '=', value: 'validValue' },
            { field: 'x', operator: '=', value: 'y', muted: true },
          ],
        },
        consequent: { type: 'mutedRuleEvent' },
      },
    ],
  };

  const evaluate = formatRulesEngine(re, 'native');
  expect(types(evaluate({ validField: 'validValue', x: 'not-y' }))).toEqual(['mutedRuleEvent']);
});

it('an unknown operator never matches', () => {
  const re: RulesEngine = {
    conditions: [
      {
        antecedent: {
          combinator: 'and',
          rules: [{ field: 'f', operator: 'noSuchOperator', value: 'v' }],
        },
        consequent: { type: 'never' },
      },
    ],
  };

  const evaluate = formatRulesEngine(re, 'native');
  expect(evaluate({ f: 'v' })).toEqual([]);
});

// #endregion

// #region Native-specific operator coverage

it('evaluates between/notBetween without any operator registration', () => {
  const re: RulesEngine = {
    conditions: [
      {
        antecedent: {
          combinator: 'and',
          rules: [{ field: 'age', operator: 'between', value: [18, 65] }],
        },
        consequent: { type: 'workingAge' },
      },
    ],
  };
  const evaluate = formatRulesEngine(re, 'native');
  expect(types(evaluate({ age: 30 }))).toEqual(['workingAge']);
  expect(types(evaluate({ age: 18 }))).toEqual(['workingAge']); // inclusive
  expect(types(evaluate({ age: 70 }))).toEqual([]);
});

it('evaluates string operators (beginsWith / endsWith / contains)', () => {
  const re: RulesEngine = {
    conditions: [
      {
        antecedent: {
          combinator: 'and',
          rules: [
            { field: 'name', operator: 'beginsWith', value: 'Dr.' },
            { field: 'email', operator: 'endsWith', value: '@example.com' },
            { field: 'bio', operator: 'contains', value: 'engineer' },
          ],
        },
        consequent: { type: 'match' },
      },
    ],
  };
  const evaluate = formatRulesEngine(re, 'native');
  expect(
    types(evaluate({ name: 'Dr. Strange', email: 'a@example.com', bio: 'software engineer' }))
  ).toEqual(['match']);
  expect(
    types(evaluate({ name: 'Mr. Strange', email: 'a@example.com', bio: 'software engineer' }))
  ).toEqual([]);
});

it('reads facts via dot-separated field paths', () => {
  const re: RulesEngine = {
    conditions: [
      {
        antecedent: {
          combinator: 'and',
          rules: [{ field: 'profile.age', operator: '>=', value: 18 }],
        },
        consequent: { type: 'adult' },
      },
    ],
  };
  const evaluate = formatRulesEngine(re, 'native');
  expect(types(evaluate({ profile: { age: 21 } }))).toEqual(['adult']);
  expect(types(evaluate({ profile: { age: 10 } }))).toEqual([]);
});

// #endregion

// #region Custom processors via formatQueryOptions

it('uses a custom ruleProcessor supplied via formatQueryOptions', () => {
  const re: RulesEngine = {
    conditions: [
      {
        antecedent: {
          combinator: 'and',
          rules: [{ field: 'ignored', operator: '=', value: 'ignored' }],
        },
        consequent: { type: 'customRule' },
      },
    ],
  };
  // Ignores the rule entirely; keys off a `flag` fact instead.
  const ruleProcessor: RuleProcessor = (): NativePredicate => facts =>
    (facts as { flag?: boolean }).flag === true;

  const evaluate = formatRulesEngine(re, {
    format: 'native',
    formatQueryOptions: { ruleProcessor },
  });
  expect(types(evaluate({ flag: true }))).toEqual(['customRule']);
  expect(evaluate({ flag: false })).toEqual([]);
});

it('uses a custom ruleGroupProcessor supplied via formatQueryOptions', () => {
  const re: RulesEngine = {
    conditions: [
      {
        antecedent: {
          combinator: 'and',
          rules: [{ field: 'ignored', operator: '=', value: 'ignored' }],
        },
        consequent: { type: 'customGroup' },
      },
    ],
  };
  // Drives compilation itself; keys off an `ok` fact.
  const ruleGroupProcessor: RuleGroupProcessor<NativePredicate> = () => facts =>
    (facts as { ok?: boolean }).ok === true;

  const evaluate = formatRulesEngine(re, {
    format: 'native',
    formatQueryOptions: { ruleGroupProcessor },
  });
  expect(types(evaluate({ ok: true }))).toEqual(['customGroup']);
  expect(evaluate({ ok: false })).toEqual([]);
});

// #endregion
