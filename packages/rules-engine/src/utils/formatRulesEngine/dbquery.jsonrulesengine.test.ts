import { Engine } from 'json-rules-engine';
import type { RuleProperties } from 'json-rules-engine';
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

it('nested rule groups', async () => {
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

  const engine = new Engine(formatRulesEngine(re, 'json-rules-engine'));

  // Test case where nested OR succeeds (field2 != value2)
  const result1 = await engine.run({ field1: 'value1', field2: 'different', field3: 5 });
  expect(result1.events).toEqual([
    { type: 'nestedEvent', params: { message: 'nested triggered' } },
  ]);

  // Test case where nested OR succeeds (field3 > 10)
  const result2 = await engine.run({ field1: 'value1', field2: 'value2', field3: 15 });
  expect(result2.events).toEqual([
    { type: 'nestedEvent', params: { message: 'nested triggered' } },
  ]);

  // Test case where rule fails (field1 doesn't match)
  const result3 = await engine.run({ field1: 'wrong', field2: 'different', field3: 15 });
  expect(result3.events).toEqual([]);
});

it('filters placeholder rules correctly', async () => {
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

  const engine = new Engine(formatRulesEngine(re, 'json-rules-engine'));

  // Only the valid rule should be evaluated
  const result = await engine.run({ validField: 'validValue', '~': 'value', field: 'value' });
  expect(result.events).toEqual([{ type: 'filteredEvent', params: {} }]);

  // Should fail when valid field doesn't match
  const result2 = await engine.run({ validField: 'wrong', '~': 'value', field: 'value' });
  expect(result2.events).toEqual([]);
});

it('OR combinators with NOT conditions', async () => {
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

  const engine = new Engine(formatRulesEngine(re, 'json-rules-engine'));

  // NOT (field1 = value1 OR field2 != value2)
  // Should trigger when BOTH conditions are false: field1 != value1 AND field2 = value2
  const result1 = await engine.run({ field1: 'other', field2: 'value2' });
  expect(result1.events).toEqual([{ type: 'notOrEvent', params: {} }]);

  // Should not trigger when first condition is true
  const result2 = await engine.run({ field1: 'value1', field2: 'value2' });
  expect(result2.events).toEqual([]);

  // Should not trigger when second condition is true
  const result3 = await engine.run({ field1: 'other', field2: 'different' });
  expect(result3.events).toEqual([]);
});

it('conditions without consequent', async () => {
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

  const engine = new Engine(formatRulesEngine(re, 'json-rules-engine'));

  const result = await engine.run({ field1: 'value1' });
  expect(result.events).toEqual([{ type: '' }]); // Default empty consequent
});

it('various operators correctly', async () => {
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

  const engine = new Engine(formatRulesEngine(re, 'json-rules-engine'));

  // Test successful case
  const successData = {
    equalField: 'test',
    notEqualField: 'include',
    lessThanField: 99,
    lessThanInclusiveField: 50,
    greaterThanField: 11,
    greaterThanInclusiveField: 20,
  };
  const result1 = await engine.run(successData);
  expect(result1.events).toEqual([{ type: 'operatorEvent', params: {} }]);

  // Test failure case (lessThanField fails)
  const failureData = {
    equalField: 'test',
    notEqualField: 'include',
    lessThanField: 101, // This should fail the < 100 condition
    lessThanInclusiveField: 50,
    greaterThanField: 11,
    greaterThanInclusiveField: 20,
  };
  const result2 = await engine.run(failureData);
  expect(result2.events).toEqual([]);
});

it('deeply nested rule groups execute correctly', async () => {
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

  const engine = new Engine(formatRulesEngine(re, 'json-rules-engine'));

  // Test first branch of OR (level1 = value1)
  const result1 = await engine.run({ level1: 'value1', level2a: 'exclude', level2b: 3 });
  expect(result1.events).toEqual([{ type: 'deepEvent', params: { depth: 'deep' } }]);

  // Test second branch of OR (level2a != exclude AND level2b > 5)
  const result2 = await engine.run({ level1: 'other', level2a: 'include', level2b: 10 });
  expect(result2.events).toEqual([{ type: 'deepEvent', params: { depth: 'deep' } }]);

  // Test failure case (neither branch succeeds)
  const result3 = await engine.run({ level1: 'other', level2a: 'exclude', level2b: 3 });
  expect(result3.events).toEqual([]);
});

it('empty rule groups', async () => {
  const re: RulesEngine = {
    conditions: [
      {
        antecedent: { combinator: 'and', rules: [] },
        consequent: { type: 'emptyEvent', params: {} },
      },
    ],
  };

  const engine = new Engine(formatRulesEngine(re, 'json-rules-engine'));

  // Empty rule group should always succeed (no conditions to fail)
  const result = await engine.run({ anyField: 'anyValue' });
  expect(result.events).toEqual([{ type: 'emptyEvent', params: {} }]);
});

it('multiple conditions with different outcomes', async () => {
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

  const engine = new Engine(formatRulesEngine(re, 'json-rules-engine'));

  // Admin user (still need to provide verified field for other rules)
  const adminResult = await engine.run({ userType: 'admin', verified: false });
  expect(adminResult.events).toEqual([{ type: 'adminAccess', params: { level: 'full' } }]);

  // Verified user
  const userResult = await engine.run({ userType: 'user', verified: true });
  expect(userResult.events).toEqual([{ type: 'userAccess', params: { level: 'limited' } }]);

  // Guest user (still need to provide verified field for other rules)
  const guestResult = await engine.run({ userType: 'guest', verified: false });
  expect(guestResult.events).toEqual([{ type: 'guestAccess', params: { level: 'read-only' } }]);

  // Unverified user (no access)
  const unverifiedResult = await engine.run({ userType: 'user', verified: false });
  expect(unverifiedResult.events).toEqual([]);
});

// #region Evaluation mode: cascade vs cumulative

const runEvents = async (rules: RuleProperties[], facts: object) => {
  const engine = new Engine(rules, { allowUndefinedFacts: true });
  const { events } = await engine.run(facts);
  return events.map(e => e.type);
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

it('cascade mode stops at the first matching overlapping condition', async () => {
  const rules = formatRulesEngine(tieredRE, 'json-rules-engine'); // default cascade
  expect(await runEvents(rules, { experience: 12 })).toEqual(['veteran']);
  expect(await runEvents(rules, { experience: 5 })).toEqual(['seasoned']);
  expect(await runEvents(rules, { experience: 0 })).toEqual(['rookie']);
});

it('cumulative mode fires every matching overlapping condition', async () => {
  const rules = formatRulesEngine(tieredRE, {
    format: 'json-rules-engine',
    evaluationMode: 'cumulative',
  });
  expect(await runEvents(rules, { experience: 12 })).toEqual(['veteran', 'seasoned', 'rookie']);
  expect(await runEvents(rules, { experience: 5 })).toEqual(['seasoned', 'rookie']);
  expect(await runEvents(rules, { experience: 0 })).toEqual(['rookie']);
});

it('reads evaluationMode stored on the rules engine object', async () => {
  const rules = formatRulesEngine(
    { ...tieredRE, evaluationMode: 'cumulative' },
    'json-rules-engine'
  );
  expect(await runEvents(rules, { experience: 12 })).toEqual(['veteran', 'seasoned', 'rookie']);
});

it('options.evaluationMode overrides the value on the rules engine object', async () => {
  const rules = formatRulesEngine(
    { ...tieredRE, evaluationMode: 'cumulative' },
    { format: 'json-rules-engine', evaluationMode: 'cascade' }
  );
  expect(await runEvents(rules, { experience: 12 })).toEqual(['veteran']);
});

it('default consequent fires only when every sibling antecedent fails', async () => {
  const re: RulesEngine = {
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

  // Cascade: default is the `else` branch, gated by all siblings
  const cascade = formatRulesEngine(re, 'json-rules-engine');
  expect(await runEvents(cascade, { instrument: 'guitar' })).toEqual(['guitarPart']);
  expect(await runEvents(cascade, { instrument: 'bass' })).toEqual(['unassigned']);
});

it('cumulative default consequent is an always-true baseline', async () => {
  const re: RulesEngine = {
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

  const cumulative = formatRulesEngine(re, {
    format: 'json-rules-engine',
    evaluationMode: 'cumulative',
  });
  // A match still fires the baseline default alongside it (order not guaranteed)
  expect((await runEvents(cumulative, { instrument: 'drums' })).toSorted()).toEqual([
    'drumPart',
    'unassigned',
  ]);
  // No match: only the baseline default fires
  expect(await runEvents(cumulative, { instrument: 'bass' })).toEqual(['unassigned']);
});

it('nested sub-conditions are guarded by ancestor antecedents (cascade)', async () => {
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

  const rules = formatRulesEngine(re, 'json-rules-engine');
  // In-section instrument: parent + matching child fire
  expect(await runEvents(rules, { section: 'strings', instrument: 'cello' })).toEqual([
    'stringSection',
    'celloChair',
  ]);
  // Out-of-section: neither parent nor children fire
  expect(await runEvents(rules, { section: 'brass', instrument: 'cello' })).toEqual([]);
  // In section but unmatched chair: only parent fires
  expect(await runEvents(rules, { section: 'strings', instrument: 'viola' })).toEqual([
    'stringSection',
  ]);
});

it('a condition that only groups nested conditions emits no event of its own', async () => {
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

  const rules = formatRulesEngine(re, 'json-rules-engine');
  expect(await runEvents(rules, { onStage: true, role: 'lead' })).toEqual(['spotlight']);
  expect(await runEvents(rules, { onStage: false, role: 'lead' })).toEqual([]);
});

// #endregion

// #region Additional operators (registered via the `context` option)

// Builds an engine, registering the additional operators by passing it as `context.engine`, then
// adds the exported rules and returns the fired event types.
const runWithAdditionalOperators = async (
  re: RulesEngine,
  facts: object,
  evaluationMode?: RulesEngine['evaluationMode']
) => {
  const engine = new Engine([], { allowUndefinedFacts: true });
  const rules = formatRulesEngine(re, {
    format: 'json-rules-engine',
    evaluationMode,
    context: { engine },
  });
  for (const rule of rules) engine.addRule(rule);
  const { events } = await engine.run(facts);
  return events.map(e => e.type);
};

it('evaluates between with array bounds', async () => {
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
  expect(await runWithAdditionalOperators(re, { age: 30 })).toEqual(['workingAge']);
  expect(await runWithAdditionalOperators(re, { age: 18 })).toEqual(['workingAge']); // inclusive
  expect(await runWithAdditionalOperators(re, { age: 65 })).toEqual(['workingAge']); // inclusive
  expect(await runWithAdditionalOperators(re, { age: 70 })).toEqual([]);
});

it('evaluates between with comma-separated string bounds and reordered numbers', async () => {
  const re: RulesEngine = {
    conditions: [
      {
        antecedent: {
          combinator: 'and',
          // Bounds given high-to-low and as a string; both are normalized.
          rules: [{ field: 'score', operator: 'between', value: '10,1' }],
        },
        consequent: { type: 'inRange' },
      },
    ],
  };
  expect(await runWithAdditionalOperators(re, { score: 5 })).toEqual(['inRange']);
  expect(await runWithAdditionalOperators(re, { score: 11 })).toEqual([]);
});

it('evaluates notBetween', async () => {
  const re: RulesEngine = {
    conditions: [
      {
        antecedent: {
          combinator: 'and',
          rules: [{ field: 'temp', operator: 'notBetween', value: [0, 100] }],
        },
        consequent: { type: 'outOfRange' },
      },
    ],
  };
  expect(await runWithAdditionalOperators(re, { temp: 150 })).toEqual(['outOfRange']);
  expect(await runWithAdditionalOperators(re, { temp: 50 })).toEqual([]);
});

it('evaluates string operators (beginsWith / endsWith / contains)', async () => {
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
  expect(
    await runWithAdditionalOperators(re, {
      name: 'Dr. Strange',
      email: 'a@example.com',
      bio: 'software engineer',
    })
  ).toEqual(['match']);
  expect(
    await runWithAdditionalOperators(re, {
      name: 'Mr. Strange',
      email: 'a@example.com',
      bio: 'software engineer',
    })
  ).toEqual([]);
});

// #endregion
