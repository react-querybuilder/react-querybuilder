import type { RuleGroupType, RuleProcessor, RuleType } from '@react-querybuilder/core';
import { formatQuery } from '@react-querybuilder/core';
import type { Condition, Constraint } from 'rulepilot';
import type { RulesEngine } from '../../types';
import { defaultRuleGroupProcessorRulePilot } from './defaultRuleGroupProcessorRulePilot';
import {
  defaultRuleProcessorRulePilot,
  rulePilotUnsupportedOperators,
} from './defaultRuleProcessorRulePilot';
import { formatRulesEngine } from './formatRulesEngine';

// NOTE: This file is a `.test.ts` and therefore runs under BOTH `bun test` and Vitest. It must not
// use `vi`/Vitest-only globals.
//
// The `"rulepilot"` target produces a single rulepilot `Rule` (plain JSON). These tests assert the
// compiled shape; end-to-end evaluation against the real `RulePilot.evaluate` lives in
// `dbquery.rulepilot.test.ts`.

const rule = (field: string, operator: string, value: unknown): RuleType =>
  ({ field, operator, value }) as RuleType;

// #region Rule processor

describe('defaultRuleProcessorRulePilot', () => {
  it('maps comparison operators (= and != become loose ==/!=)', () => {
    expect(defaultRuleProcessorRulePilot(rule('a', '=', 'x'))).toEqual({
      field: 'a',
      operator: '==',
      value: 'x',
    });
    expect(defaultRuleProcessorRulePilot(rule('a', '!=', 'x'))).toEqual({
      field: 'a',
      operator: '!=',
      value: 'x',
    });
    expect(defaultRuleProcessorRulePilot(rule('a', '<', 5))).toEqual({
      field: 'a',
      operator: '<',
      value: 5,
    });
    expect(defaultRuleProcessorRulePilot(rule('a', '<=', 5))).toEqual({
      field: 'a',
      operator: '<=',
      value: 5,
    });
    expect(defaultRuleProcessorRulePilot(rule('a', '>', 5))).toEqual({
      field: 'a',
      operator: '>',
      value: 5,
    });
    expect(defaultRuleProcessorRulePilot(rule('a', '>=', 5))).toEqual({
      field: 'a',
      operator: '>=',
      value: 5,
    });
  });

  it('coerces numeric strings only when parseNumbers is enabled', () => {
    // No options object → the `opts?.parseNumbers` chain short-circuits; value passes through as-is.
    expect(defaultRuleProcessorRulePilot(rule('a', '=', '5'))).toEqual({
      field: 'a',
      operator: '==',
      value: '5',
    });
    // parseNumbers enabled → numeric coercion.
    expect(defaultRuleProcessorRulePilot(rule('a', '=', '5'), { parseNumbers: true })).toEqual({
      field: 'a',
      operator: '==',
      value: 5,
    });
  });

  it('maps in/notIn to in/"not in" with an array value', () => {
    expect(defaultRuleProcessorRulePilot(rule('a', 'in', 'x,y'))).toEqual({
      field: 'a',
      operator: 'in',
      value: ['x', 'y'],
    });
    expect(defaultRuleProcessorRulePilot(rule('a', 'notIn', ['x', 'y']))).toEqual({
      field: 'a',
      operator: 'not in',
      value: ['x', 'y'],
    });
    // Array members are number-coerced when parseNumbers is enabled.
    expect(defaultRuleProcessorRulePilot(rule('a', 'in', '1,2'), { parseNumbers: true })).toEqual({
      field: 'a',
      operator: 'in',
      value: [1, 2],
    });
  });

  it('maps between to an inclusive >=/<= range', () => {
    expect(defaultRuleProcessorRulePilot(rule('age', 'between', [18, 65]))).toEqual({
      all: [
        { field: 'age', operator: '>=', value: 18 },
        { field: 'age', operator: '<=', value: 65 },
      ],
    });
  });

  it('reorders numeric between bounds ascending', () => {
    expect(defaultRuleProcessorRulePilot(rule('age', 'between', [65, 18]))).toEqual({
      all: [
        { field: 'age', operator: '>=', value: 18 },
        { field: 'age', operator: '<=', value: 65 },
      ],
    });
  });

  it('keeps non-numeric between bounds in the given order', () => {
    expect(defaultRuleProcessorRulePilot(rule('letter', 'between', ['a', 'z']))).toEqual({
      all: [
        { field: 'letter', operator: '>=', value: 'a' },
        { field: 'letter', operator: '<=', value: 'z' },
      ],
    });
  });

  it('negates notBetween with a none wrapper', () => {
    expect(defaultRuleProcessorRulePilot(rule('age', 'notBetween', [18, 65]))).toEqual({
      none: [
        {
          all: [
            { field: 'age', operator: '>=', value: 18 },
            { field: 'age', operator: '<=', value: 65 },
          ],
        },
      ],
    });
  });

  it('returns null for between/notBetween with fewer than two valid bounds', () => {
    expect(defaultRuleProcessorRulePilot(rule('age', 'between', [18]))).toBeNull();
    expect(defaultRuleProcessorRulePilot(rule('age', 'between', ',65'))).toBeNull(); // first empty
    expect(defaultRuleProcessorRulePilot(rule('age', 'between', '18,'))).toBeNull(); // second empty
    expect(defaultRuleProcessorRulePilot(rule('age', 'notBetween', [18]))).toBeNull();
  });

  it('maps null to a none-wrapped "!= null" check', () => {
    expect(defaultRuleProcessorRulePilot(rule('email', 'null', null))).toEqual({
      none: [{ field: 'email', operator: '!=', value: null }],
    });
  });

  it('maps notNull to a "!= null" constraint', () => {
    expect(defaultRuleProcessorRulePilot(rule('email', 'notNull', null))).toEqual({
      field: 'email',
      operator: '!=',
      value: null,
    });
  });

  it('returns null for every unsupported substring operator', () => {
    for (const operator of rulePilotUnsupportedOperators) {
      expect(defaultRuleProcessorRulePilot(rule('bio', operator, 'engineer'))).toBeNull();
    }
  });

  it('returns null for an unknown operator', () => {
    expect(defaultRuleProcessorRulePilot(rule('a', 'noSuchOperator', 'x'))).toBeNull();
  });
});

// #endregion

// #region Rule group processor

// Compiles a query into a rulepilot Condition directly (the same call the engine processor makes per
// antecedent), so group-level branches can be asserted without the engine's cascade wrapping.
const compileGroup = (query: RuleGroupType): Condition =>
  formatQuery(query, {
    ruleProcessor: defaultRuleProcessorRulePilot,
    ruleGroupProcessor: defaultRuleGroupProcessorRulePilot,
  });

describe('defaultRuleGroupProcessorRulePilot', () => {
  it('maps an "and" group to { all }', () => {
    expect(
      compileGroup({
        combinator: 'and',
        rules: [
          { field: 'a', operator: '=', value: 1 },
          { field: 'b', operator: '>', value: 2 },
        ],
      })
    ).toEqual({
      all: [
        { field: 'a', operator: '==', value: 1 },
        { field: 'b', operator: '>', value: 2 },
      ] as Constraint[],
    });
  });

  it('maps an "or" group to { any }', () => {
    expect(
      compileGroup({
        combinator: 'or',
        rules: [
          { field: 'a', operator: '=', value: 1 },
          { field: 'b', operator: '=', value: 2 },
        ],
      })
    ).toEqual({
      any: [
        { field: 'a', operator: '==', value: 1 },
        { field: 'b', operator: '==', value: 2 },
      ] as Constraint[],
    });
  });

  it('wraps a negated group in { none }', () => {
    expect(
      compileGroup({
        combinator: 'and',
        not: true,
        rules: [{ field: 'a', operator: '=', value: 1 }],
      })
    ).toEqual({ none: [{ all: [{ field: 'a', operator: '==', value: 1 }] }] });
  });

  it('compiles nested groups recursively', () => {
    expect(
      compileGroup({
        combinator: 'and',
        rules: [
          { field: 'a', operator: '=', value: 1 },
          {
            combinator: 'or',
            rules: [
              { field: 'b', operator: '=', value: 2 },
              { field: 'c', operator: '=', value: 3 },
            ],
          },
        ],
      })
    ).toEqual({
      all: [
        { field: 'a', operator: '==', value: 1 },
        {
          any: [
            { field: 'b', operator: '==', value: 2 },
            { field: 'c', operator: '==', value: 3 },
          ],
        },
      ],
    });
  });

  it('filters placeholder-field and placeholder-operator rules', () => {
    expect(
      compileGroup({
        combinator: 'and',
        rules: [
          { field: 'valid', operator: '=', value: 'v' },
          { field: '~', operator: '=', value: 'x' }, // placeholder field
          { field: 'f', operator: '~', value: 'x' }, // placeholder operator
        ],
      })
    ).toEqual({ all: [{ field: 'valid', operator: '==', value: 'v' }] });
  });

  it('filters muted rules', () => {
    expect(
      compileGroup({
        combinator: 'and',
        rules: [
          { field: 'valid', operator: '=', value: 'v' },
          { field: 'x', operator: '=', value: 'y', muted: true },
        ],
      })
    ).toEqual({ all: [{ field: 'valid', operator: '==', value: 'v' }] });
  });

  it('filters rules whose operator rulepilot cannot represent', () => {
    expect(
      compileGroup({
        combinator: 'and',
        rules: [
          { field: 'valid', operator: '=', value: 'v' },
          { field: 'bio', operator: 'contains', value: 'engineer' }, // unsupported → null → dropped
          { field: 'x', operator: 'noSuchOperator', value: 'y' }, // unknown → null → dropped
        ],
      })
    ).toEqual({ all: [{ field: 'valid', operator: '==', value: 'v' }] });
  });

  it('compiles a muted outermost group to an always-true { all: [] }', () => {
    expect(
      compileGroup({
        combinator: 'and',
        muted: true,
        rules: [{ field: 'a', operator: '=', value: 1 }],
      })
    ).toEqual({ all: [] });
  });

  it('drops a muted nested group from its parent', () => {
    expect(
      compileGroup({
        combinator: 'and',
        rules: [
          { field: 'valid', operator: '=', value: 'v' },
          { combinator: 'and', muted: true, rules: [{ field: 'x', operator: '=', value: 'y' }] },
        ],
      })
    ).toEqual({ all: [{ field: 'valid', operator: '==', value: 'v' }] });
  });

  it('drops a nested group that becomes empty after filtering', () => {
    expect(
      compileGroup({
        combinator: 'and',
        rules: [
          { field: 'valid', operator: '=', value: 'v' },
          {
            combinator: 'or',
            rules: [
              { field: '~', operator: '=', value: 'x' }, // placeholder field
              { field: 'f', operator: '~', value: 'x' }, // placeholder operator
            ],
          },
        ],
      })
    ).toEqual({ all: [{ field: 'valid', operator: '==', value: 'v' }] });
  });

  it('compiles an empty outermost group to an always-true { all: [] }', () => {
    expect(compileGroup({ combinator: 'and', rules: [] })).toEqual({ all: [] });
  });
});

// #endregion

// #region Rules engine processor

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

describe('defaultRulesEngineProcessorRulePilot', () => {
  it('produces one ordered condition per flattened cascade rule, each carrying its result', () => {
    const { conditions } = formatRulesEngine(tieredRE, 'rulepilot');
    expect(Array.isArray(conditions)).toBe(true);
    const list = conditions as Condition[];
    expect(list).toHaveLength(3);
    expect(list.map(c => c.result)).toEqual([
      { type: 'veteran' },
      { type: 'seasoned' },
      { type: 'rookie' },
    ]);
  });

  it('ANDs ancestor/sibling-negation guards via combine and negate', () => {
    const { conditions } = formatRulesEngine(tieredRE, 'rulepilot');
    const [veteran, seasoned] = conditions as Condition[];
    // First sibling: own antecedent only.
    expect(veteran).toEqual({
      all: [{ all: [{ field: 'experience', operator: '>=', value: 10 }] }],
      result: { type: 'veteran' },
    });
    // Second sibling: prior sibling negated (none) AND own antecedent.
    expect(seasoned).toEqual({
      all: [
        { none: [{ all: [{ field: 'experience', operator: '>=', value: 10 }] }] },
        { all: [{ field: 'experience', operator: '>=', value: 3 }] },
      ],
      result: { type: 'seasoned' },
    });
  });

  it('appends a guarded default-consequent condition', () => {
    const { conditions } = formatRulesEngine(
      { ...tieredRE, defaultConsequent: { type: 'unassigned' } },
      'rulepilot'
    );
    const list = conditions as Condition[];
    expect(list).toHaveLength(4);
    expect(list[3].result).toEqual({ type: 'unassigned' });
  });

  it('reads evaluationMode from the rules engine object (cumulative still throws)', () => {
    expect(() =>
      formatRulesEngine({ ...tieredRE, evaluationMode: 'cumulative' }, 'rulepilot')
    ).toThrow(/cumulative/);
  });

  it('throws for cumulative evaluation mode supplied via options', () => {
    expect(() =>
      formatRulesEngine(tieredRE, { format: 'rulepilot', evaluationMode: 'cumulative' })
    ).toThrow(/does not support cumulative/);
  });

  it('options.evaluationMode overrides a cumulative value on the rules engine object', () => {
    // Object says cumulative, options force cascade → no throw.
    const { conditions } = formatRulesEngine(
      { ...tieredRE, evaluationMode: 'cumulative' },
      { format: 'rulepilot', evaluationMode: 'cascade' }
    );
    expect(conditions as Condition[]).toHaveLength(3);
  });

  it('uses a custom ruleProcessor supplied via formatQueryOptions', () => {
    const re: RulesEngine = {
      conditions: [
        {
          antecedent: {
            combinator: 'and',
            rules: [{ field: 'ignored', operator: '=', value: 'x' }],
          },
          consequent: { type: 'custom' },
        },
      ],
    };
    const ruleProcessor: RuleProcessor = (): Constraint => ({
      field: 'flag',
      operator: '==',
      value: true,
    });
    const { conditions } = formatRulesEngine(re, {
      format: 'rulepilot',
      formatQueryOptions: { ruleProcessor },
    });
    expect((conditions as Condition[])[0]).toEqual({
      all: [{ all: [{ field: 'flag', operator: '==', value: true }] }],
      result: { type: 'custom' },
    });
  });

  it('uses a custom ruleGroupProcessor supplied via formatQueryOptions', () => {
    const re: RulesEngine = {
      conditions: [
        {
          antecedent: {
            combinator: 'and',
            rules: [{ field: 'ignored', operator: '=', value: 'x' }],
          },
          consequent: { type: 'customGroup' },
        },
      ],
    };
    const ruleGroupProcessor = (): Condition => ({
      any: [{ field: 'ok', operator: '==', value: true }],
    });
    const { conditions } = formatRulesEngine(re, {
      format: 'rulepilot',
      formatQueryOptions: { ruleGroupProcessor },
    });
    expect((conditions as Condition[])[0]).toEqual({
      all: [{ any: [{ field: 'ok', operator: '==', value: true }] }],
      result: { type: 'customGroup' },
    });
  });
});

// #endregion
