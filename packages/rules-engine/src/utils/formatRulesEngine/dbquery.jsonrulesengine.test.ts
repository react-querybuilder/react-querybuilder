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
