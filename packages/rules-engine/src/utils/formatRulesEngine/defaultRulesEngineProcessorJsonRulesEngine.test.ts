import { Engine } from 'json-rules-engine';
import type { RulesEngine } from '../../types';
import { jsonRulesEngineAdditionalOperators } from './defaultRulesEngineProcessorJsonRulesEngine';
import { formatRulesEngine } from './formatRulesEngine';

// NOTE: This file is a `.test.ts` and therefore runs under BOTH `bun test` and Vitest. It must not
// use `vi`/Vitest-only globals; manual mocks are used instead.

const re: RulesEngine = {
  conditions: [
    {
      antecedent: { combinator: 'and', rules: [{ field: 'f', operator: '=', value: 'v' }] },
      consequent: { type: 'event' },
    },
  ],
};

describe('jsonRulesEngineAdditionalOperators', () => {
  const { beginsWith, doesNotBeginWith, endsWith, doesNotEndWith } =
    jsonRulesEngineAdditionalOperators;
  const containsGeneric = jsonRulesEngineAdditionalOperators.containsGeneric;
  const doesNotContainGeneric = jsonRulesEngineAdditionalOperators.doesNotContainGeneric;
  const between = jsonRulesEngineAdditionalOperators.between;
  const notBetween = jsonRulesEngineAdditionalOperators.notBetween;

  it('beginsWith / doesNotBeginWith', () => {
    expect(beginsWith('foobar', 'foo')).toBe(true);
    expect(beginsWith('foobar', 'bar')).toBe(false);
    expect(doesNotBeginWith('foobar', 'bar')).toBe(true);
    expect(doesNotBeginWith('foobar', 'foo')).toBe(false);
  });

  it('endsWith / doesNotEndWith', () => {
    expect(endsWith('foobar', 'bar')).toBe(true);
    expect(endsWith('foobar', 'foo')).toBe(false);
    expect(doesNotEndWith('foobar', 'foo')).toBe(true);
    expect(doesNotEndWith('foobar', 'bar')).toBe(false);
  });

  it('containsGeneric / doesNotContainGeneric', () => {
    expect(containsGeneric('foobar', 'oob')).toBe(true);
    expect(containsGeneric('foobar', 'xyz')).toBe(false);
    expect(doesNotContainGeneric('foobar', 'xyz')).toBe(true);
    expect(doesNotContainGeneric('foobar', 'oob')).toBe(false);
  });

  describe('between / notBetween', () => {
    it('numeric bounds (array)', () => {
      expect(between(5, [1, 10])).toBe(true);
      expect(between(15, [1, 10])).toBe(false);
      expect(notBetween(5, [1, 10])).toBe(false);
      expect(notBetween(15, [1, 10])).toBe(true);
      // Inclusive endpoints
      expect(between(1, [1, 10])).toBe(true);
      expect(between(10, [1, 10])).toBe(true);
    });

    it('numeric bounds supplied out of order are reordered ascending', () => {
      expect(between(5, [10, 1])).toBe(true);
      expect(between(15, [10, 1])).toBe(false);
      expect(notBetween(15, [10, 1])).toBe(true);
    });

    it('comma-separated string bounds', () => {
      expect(between(5, '1,10')).toBe(true);
      expect(between(15, '1,10')).toBe(false);
      expect(notBetween(15, '1,10')).toBe(true);
    });

    it('non-numeric bounds compare lexicographically in given order', () => {
      expect(between('m', ['a', 'z'])).toBe(true);
      expect(between('A', ['a', 'z'])).toBe(false); // 'A' < 'a'
      expect(notBetween('A', ['a', 'z'])).toBe(true);
    });

    it('fewer than two bounds: neither operator matches', () => {
      expect(between(5, [1])).toBe(false);
      expect(notBetween(5, [1])).toBe(false);
      expect(between(5, '5')).toBe(false);
      expect(notBetween(5, '5')).toBe(false);
    });

    it('invalid (empty-string) bounds: neither operator matches', () => {
      expect(between(5, ',10')).toBe(false); // first bound empty
      expect(notBetween(5, ',10')).toBe(false);
      expect(between(5, '1,')).toBe(false); // second bound empty
      expect(notBetween(5, '1,')).toBe(false);
    });
  });
});

describe('registering operators via context.engine', () => {
  it('ignores an undefined context', () => {
    expect(() => formatRulesEngine(re, { format: 'json-rules-engine' })).not.toThrow();
  });

  it('ignores a context without an engine', () => {
    expect(() => formatRulesEngine(re, { format: 'json-rules-engine', context: {} })).not.toThrow();
  });

  it('ignores a non-object engine', () => {
    expect(() =>
      formatRulesEngine(re, { format: 'json-rules-engine', context: { engine: () => {} } })
    ).not.toThrow();
  });

  it('ignores an engine without addOperator', () => {
    expect(() =>
      formatRulesEngine(re, { format: 'json-rules-engine', context: { engine: {} } })
    ).not.toThrow();
  });

  it('ignores an engine whose addOperator is not a function', () => {
    expect(() =>
      formatRulesEngine(re, {
        format: 'json-rules-engine',
        context: { engine: { addOperator: 1 } },
      })
    ).not.toThrow();
  });

  it('registers every additional operator on a host exposing addOperator', () => {
    const registered: string[] = [];
    const host = {
      addOperator(name: string) {
        registered.push(name);
      },
    };
    formatRulesEngine(re, { format: 'json-rules-engine', context: { engine: host } });
    expect(registered.toSorted()).toEqual(
      Object.keys(jsonRulesEngineAdditionalOperators).toSorted()
    );
  });

  it('registers operators on a real Engine instance so exported rules can use them', async () => {
    const engine = new Engine([], { allowUndefinedFacts: true });
    const betweenRE: RulesEngine = {
      conditions: [
        {
          antecedent: {
            combinator: 'and',
            rules: [{ field: 'n', operator: 'between', value: [1, 10] }],
          },
          consequent: { type: 'inside' },
        },
      ],
    };
    // Passing the engine via `context.engine` registers `between`; without it `engine.run` would
    // throw "Unknown operator: between".
    const rules = formatRulesEngine(betweenRE, {
      format: 'json-rules-engine',
      context: { engine },
    });
    for (const rule of rules) engine.addRule(rule);
    const { events } = await engine.run({ n: 5 });
    expect(events.map(e => e.type)).toEqual(['inside']);
  });
});
