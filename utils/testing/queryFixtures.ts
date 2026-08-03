/**
 * Shared, **React-free** query fixtures, an operation DSL, and interpreters that drive the same
 * sequence of mutations through each of the three mutation implementations in core:
 *
 * 1. {@link QueryManager} — the designated substrate for non-React ports.
 * 2. The raw query tools (`add`/`update`/`remove`/`move`/`insert`/`group`).
 * 3. `createQueryActions` — the framework-agnostic core of `useQueryBuilderSchema`'s handlers.
 *
 * The point is conformance: all three must agree, or ports built on `QueryManager` will diverge
 * from `<QueryBuilder>`.
 *
 * ## Do not re-export this from `utils/testing/index.ts`
 *
 * `utils/testing/utils.ts` imports React and `@testing-library/react`, and `bun test:bun` globs
 * `./packages/core` wholesale. Core tests must import this module by relative path so the
 * `@rqb-testing` barrel (and therefore React) is never pulled into the Bun runner.
 *
 * Everything here is likewise imported from `packages/core/src` by relative path rather than
 * through the `@react-querybuilder/core` specifier, so both runners exercise the same source
 * files rather than whatever happens to be in `packages/core/dist`.
 */

import { defaultCombinators } from '../../packages/core/src/defaults';
import type {
  MatchModeOptions,
  Path,
  RuleGroupType,
  RuleGroupTypeAny,
  RuleGroupTypeIC,
  RuleType,
  UpdateableProperties,
  ValueSourceFullOptions,
} from '../../packages/core/src/types';
import { formatQuery } from '../../packages/core/src/utils/formatQuery';
import { isRuleGroup } from '../../packages/core/src/utils/isRuleGroup';
import { findPath, getPathOfID } from '../../packages/core/src/utils/pathUtils';
import { prepareRuleGroup } from '../../packages/core/src/utils/prepareQueryObjects';
import { createQueryActions } from '../../packages/core/src/utils/queryActions';
import { QueryManager, strictAbortReasons } from '../../packages/core/src/utils/QueryManager';
import type {
  AbortInfo,
  AbortReason,
  GuardOptions,
} from '../../packages/core/src/utils/queryTools';
import { add, group, insert, move, remove, update } from '../../packages/core/src/utils/queryTools';
import { transformQuery } from '../../packages/core/src/utils/transformQuery';

// #region Helpers

/** Recursively strips `id` so structural comparisons ignore ID generation order. */
export const stripIDs = (query: RuleGroupTypeAny): RuleGroupTypeAny =>
  JSON.parse(formatQuery(query as RuleGroupType, 'json_without_ids'));

/**
 * Assigns each rule/group an `id` equal to `JSON.stringify(path)`. This makes ID targeting
 * legible in fixtures _and_ makes stale-path probes possible: after a mutation shifts things
 * around, `"[0,1]"` still identifies the node originally at `[0, 1]` while the literal path
 * `[0, 1]` now identifies whatever moved into that slot.
 */
export const pathsAsIDs = <RG extends RuleGroupTypeAny>(query: RG): RG =>
  transformQuery(query as RuleGroupType, {
    ruleProcessor: r => ({ ...r, id: JSON.stringify(r.path) }),
    ruleGroupProcessor: rg => ({ ...rg, id: JSON.stringify(rg.path) }),
  }) as RG;

/** A counter-based ID generator, so every interpreter produces the same IDs for the same run. */
export const createIdGenerator = (prefix = 'gen'): (() => string) => {
  let n = 0;
  return () => `${prefix}-${++n}`;
};

const clone = <T>(x: T): T => structuredClone(x);

const [and, or] = defaultCombinators.map(c => c.name);

const r = (i: number, extra: Partial<RuleType> = {}): RuleType => ({
  field: `f${i}`,
  operator: '=',
  value: `v${i}`,
  ...extra,
});

// #endregion

// #region Canonical queries

/**
 * The shared fixture set. Every one has `id`s assigned by {@link pathsAsIDs}, so `id` and the
 * stringified initial path are interchangeable targets _before_ any mutation.
 */
export interface QueryFixtures {
  empty: RuleGroupType;
  singleRule: RuleGroupType;
  flat: RuleGroupType;
  nested: RuleGroupType;
  ic: RuleGroupTypeIC;
  icNested: RuleGroupTypeIC;
  withDisabled: RuleGroupType;
  withoutDisabled: RuleGroupType;
  rootDisabled: RuleGroupType;
}

export const queries: QueryFixtures = {
  /** `{ combinator: 'and', rules: [] }` */
  empty: pathsAsIDs<RuleGroupType>({ combinator: and, rules: [] }),

  /** One rule at `[0]`. */
  singleRule: pathsAsIDs<RuleGroupType>({ combinator: and, rules: [r(1)] }),

  /** Three sibling rules, no nesting. */
  flat: pathsAsIDs<RuleGroupType>({ combinator: and, rules: [r(1), r(2), r(3)] }),

  /** Four levels deep: rule, group > rule, group > group > rule, group > group > group > rule. */
  nested: pathsAsIDs<RuleGroupType>({
    combinator: and,
    rules: [
      r(1),
      {
        combinator: or,
        rules: [
          r(2),
          {
            combinator: and,
            rules: [r(3), { combinator: or, rules: [r(4), r(5)] }],
          },
        ],
      },
      r(6),
    ],
  }),

  /** Independent combinators, flat. */
  ic: pathsAsIDs<RuleGroupTypeIC>({ rules: [r(1), and, r(2), or, r(3)] }),

  /** Independent combinators, with a nested IC group at index 2. */
  icNested: pathsAsIDs<RuleGroupTypeIC>({
    rules: [r(1), and, { rules: [r(2), or, r(3)] }, and, r(4)],
  }),

  /** A disabled rule at `[1]` and a disabled group at `[2]` (whose children inherit it). */
  withDisabled: pathsAsIDs<RuleGroupType>({
    combinator: and,
    rules: [
      r(1),
      r(2, { disabled: true }),
      { combinator: or, disabled: true, rules: [r(3), r(4)] },
      r(5),
    ],
  }),

  /** Nothing disabled, but shaped identically to `withDisabled` for A/B comparisons. */
  withoutDisabled: pathsAsIDs<RuleGroupType>({
    combinator: and,
    rules: [r(1), r(2), { combinator: or, rules: [r(3), r(4)] }, r(5)],
  }),

  /** The entire query is disabled at the root. */
  rootDisabled: pathsAsIDs<RuleGroupType>({
    combinator: and,
    disabled: true,
    rules: [r(1), r(2)],
  }),
};

export type QueryFixtureName = keyof QueryFixtures;

/** A path that resolves in none of the fixtures. */
export const badPath: Path = [9, 9, 9];
/** An `id` present in none of the fixtures. */
export const badID = 'no-such-id';

// #endregion

// #region Operation DSL

/**
 * A single mutation, expressed independently of which implementation applies it. Targets are
 * `Path | string` so path targeting and ID targeting are both exercised — and, crucially, on
 * _mutated_ queries rather than only on the static fixtures the way `queryTools.test.ts`'s
 * `testLoop` does.
 */
export type Op =
  | { kind: 'add'; ruleOrGroup: RuleGroupTypeAny | RuleType; parent: Path | string }
  | { kind: 'update'; prop: UpdateableProperties; value: unknown; target: Path | string }
  | { kind: 'remove'; target: Path | string }
  | { kind: 'move'; from: Path | string; to: Path | 'up' | 'down'; clone?: boolean }
  | {
      kind: 'insert';
      ruleOrGroup: RuleGroupTypeAny | RuleType;
      target: Path;
      replace?: boolean;
    }
  | { kind: 'group'; from: Path | string; to: Path | string; clone?: boolean };

/** Guards and resolver behavior shared by all three interpreters. */
export interface RunOptions extends GuardOptions {
  /**
   * Injected so every interpreter produces identical IDs. A fresh generator is created per run
   * when omitted.
   */
  idGenerator?: () => string;
  /**
   * Injected clock. `QueryManager` reads `Date.now()` internally today, so this is currently
   * only threaded into the result for callers that need it; see Phase 3 of the conformance
   * plan.
   */
  now?: () => number;
}

/** What every interpreter reports. */
export interface RunResult {
  /** The query after the last operation. */
  query: RuleGroupTypeAny;
  /**
   * The abort reason reported for each operation, or `null` when it applied cleanly. An
   * operation that aborts more than once (only `update` with multiple properties can) reports
   * the first reason.
   */
  aborts: (AbortReason | null)[];
  /** Every abort reported, in order, for the whole run. */
  allAborts: AbortInfo[];
  /**
   * Whether each operation was _refused_ rather than merely a no-op — i.e. whether the reason
   * is one of {@link strictAbortReasons}. This is the signal `createQueryActions` exposes (by
   * returning `undefined`), so it is the common denominator across all three interpreters.
   */
  refused: boolean[];
}

const strictSet = new Set<AbortReason>(strictAbortReasons);

/**
 * `update` resolvers. `QueryManager` derives these from its `fields`/`getDefault*` options while
 * the query tools fall back to hardcoded stubs, so conformance runs pin them to the same
 * functions for all three. The mutation and guard layers are what's under test here, not option
 * resolution.
 */
const valueSources: ValueSourceFullOptions = [{ name: 'value', value: 'value', label: 'Value' }];

/** The `update` resolver set shared by every interpreter. */
export interface UpdateResolvers {
  resetOnFieldChange: boolean;
  resetOnOperatorChange: boolean;
  getRuleDefaultOperator: (field: string) => string;
  getValueSources: (field: string, operator: string) => ValueSourceFullOptions;
  getRuleDefaultValue: (rule: RuleType) => string;
  getMatchModes: (field: string) => MatchModeOptions;
}

export const updateResolvers: UpdateResolvers = {
  resetOnFieldChange: true,
  resetOnOperatorChange: false,
  getRuleDefaultOperator: () => '=',
  getValueSources: () => valueSources,
  getRuleDefaultValue: () => '',
  getMatchModes: () => [],
};

/**
 * The three implementations disagree on their _defaults_: the standalone query tools default
 * `respectDisabled` to `false` for backward compatibility, while `QueryManager` and
 * `createQueryActions` default it to `true` to match `<QueryBuilder>`. Conformance runs always
 * pass it explicitly so the comparison is about behavior rather than defaulting.
 */
const guardsOf = ({
  respectDisabled = true,
  queryDisabled = false,
  disabledPaths,
  maxLevels,
}: RunOptions): GuardOptions => ({ respectDisabled, queryDisabled, disabledPaths, maxLevels });

// #endregion

// #region Interpreters

/** Applies `ops` through the raw query tools. */
export const runViaQueryTools = (
  ops: readonly Op[],
  startQuery: RuleGroupTypeAny,
  options: RunOptions = {}
): RunResult => {
  const idGenerator = options.idGenerator ?? createIdGenerator();
  const guards = guardsOf(options);
  const combinators = defaultCombinators;

  let query = prepareRuleGroup(clone(startQuery), { idGenerator });
  const aborts: (AbortReason | null)[] = [];
  const allAborts: AbortInfo[] = [];
  const refused: boolean[] = [];

  for (const op of ops) {
    const opAborts: AbortInfo[] = [];
    const onAbort = (info: AbortInfo) => {
      opAborts.push(info);
      allAborts.push(info);
    };
    const base = { ...guards, onAbort };

    switch (op.kind) {
      case 'add': {
        query = add(query, op.ruleOrGroup as RuleType, op.parent, {
          ...base,
          combinators,
          idGenerator,
        });
        break;
      }
      case 'update': {
        query = update(query, op.prop, op.value, op.target, { ...base, ...updateResolvers });
        break;
      }
      case 'remove': {
        query = remove(query, op.target, base);
        break;
      }
      case 'move': {
        query = move(query, op.from, op.to, {
          ...base,
          clone: op.clone,
          combinators,
          idGenerator,
        });
        break;
      }
      case 'insert': {
        query = insert(query, op.ruleOrGroup as RuleType, op.target, {
          ...base,
          replace: op.replace,
          combinators,
          idGenerator,
        });
        break;
      }
      case 'group': {
        query = group(query, op.from, op.to, {
          ...base,
          clone: op.clone,
          combinators,
          idGenerator,
        });
        break;
      }
    }

    const reason = opAborts[0]?.reason ?? null;
    aborts.push(reason);
    refused.push(opAborts.some(a => strictSet.has(a.reason)));
  }

  return { query, aborts, allAborts, refused };
};

/** Applies `ops` through {@link QueryManager}. */
export const runViaQueryManager = (
  ops: readonly Op[],
  startQuery: RuleGroupTypeAny,
  options: RunOptions = {}
): RunResult => {
  const idGenerator = options.idGenerator ?? createIdGenerator();
  const aborts: (AbortReason | null)[] = [];
  const allAborts: AbortInfo[] = [];
  const refused: boolean[] = [];

  let opAborts: AbortInfo[] = [];
  const onInvalidTarget = (info: AbortInfo) => {
    opAborts.push(info);
    allAborts.push(info);
  };

  const qm = new QueryManager(clone(startQuery), {
    idGenerator,
    ...guardsOf(options),
    onInvalidTarget,
  });

  for (const op of ops) {
    opAborts = [];

    switch (op.kind) {
      case 'add': {
        qm.add(op.ruleOrGroup as RuleType, op.parent);
        break;
      }
      case 'update': {
        qm.update(op.prop, op.value, op.target, updateResolvers);
        break;
      }
      case 'remove': {
        qm.remove(op.target);
        break;
      }
      case 'move': {
        qm.move(op.from, op.to, { clone: op.clone });
        break;
      }
      case 'insert': {
        qm.insert(op.ruleOrGroup as RuleType, op.target, { replace: op.replace });
        break;
      }
      case 'group': {
        qm.group(op.from, op.to, { clone: op.clone });
        break;
      }
    }

    aborts.push(opAborts[0]?.reason ?? null);
    refused.push(opAborts.some(a => strictSet.has(a.reason)));
  }

  return { query: qm.getQuery(), aborts, allAborts, refused };
};

/**
 * The subset of {@link Op} kinds `createQueryActions` can express. There is no `insert` action,
 * because `<QueryBuilder>` never inserts at a path.
 */
export const actionsSupport = (ops: readonly Op[]): boolean =>
  ops.every(op => op.kind !== 'insert');

/**
 * Applies `ops` through `createQueryActions`, the layer `useQueryBuilderSchema` actually uses.
 *
 * The action handlers take paths only, so ID targets are resolved to paths against the current
 * query first — exactly what the React layer has already done by the time it calls an action.
 * An unresolvable ID yields {@link badPath}, so the action sees a path that doesn't resolve,
 * which is the closest analogue available.
 */
export const runViaActions = (
  ops: readonly Op[],
  startQuery: RuleGroupTypeAny,
  options: RunOptions = {}
): RunResult => {
  const idGenerator = options.idGenerator ?? createIdGenerator();

  let query = prepareRuleGroup(clone(startQuery), { idGenerator });

  const actions = createQueryActions({
    combinators: defaultCombinators,
    idGenerator,
    ...guardsOf(options),
    ...updateResolvers,
  });

  const aborts: (AbortReason | null)[] = [];
  const allAborts: AbortInfo[] = [];
  const refused: boolean[] = [];

  const toPath = (target: Path | string): Path =>
    Array.isArray(target) ? target : (getPathOfID(target, query) ?? badPath);

  for (const op of ops) {
    let result: RuleGroupTypeAny | undefined;

    switch (op.kind) {
      case 'add': {
        const parentPath = toPath(op.parent);
        result = isRuleGroup(op.ruleOrGroup)
          ? actions.addGroup(query, op.ruleOrGroup, parentPath)
          : actions.addRule(query, op.ruleOrGroup, parentPath);
        break;
      }
      case 'update': {
        result = actions.propChange(query, op.prop, op.value, toPath(op.target));
        break;
      }
      case 'remove': {
        result = actions.removeRuleOrGroup(query, toPath(op.target));
        break;
      }
      case 'move': {
        result = actions.moveRule(query, toPath(op.from), op.to, op.clone);
        break;
      }
      case 'group': {
        result = actions.groupRule(query, toPath(op.from), toPath(op.to), op.clone);
        break;
      }
      case 'insert': {
        throw new Error('runViaActions: `insert` has no `createQueryActions` equivalent');
      }
    }

    refused.push(result === undefined);
    // The action handlers collapse every abort reason into `undefined`, so no specific reason is
    // recoverable here.
    aborts.push(null);
    if (result !== undefined) query = result;
  }

  return { query, aborts, allAborts, refused };
};

// #endregion

// #region Curated sequences

/** A named sequence of operations against a named fixture, run under specific guards. */
export interface Sequence {
  name: string;
  fixture: QueryFixtureName;
  ops: Op[];
  options?: RunOptions;
}

const g = (rules: RuleType[] = [], combinator = and): RuleGroupType => ({ combinator, rules });

/**
 * ~30 sequences, deliberately weighted toward the interactions the plan identifies as the real
 * divergence risk rather than toward single-operation coverage.
 */
export const sequences: Sequence[] = [
  // --- Baseline single operations, both targeting styles -------------------------------------
  {
    name: 'add rule to empty root',
    fixture: 'empty',
    ops: [{ kind: 'add', ruleOrGroup: r(9), parent: [] }],
  },
  {
    name: 'add group to flat root',
    fixture: 'flat',
    ops: [{ kind: 'add', ruleOrGroup: g([r(9)]), parent: [] }],
  },
  {
    name: 'add to nested group by path',
    fixture: 'nested',
    ops: [{ kind: 'add', ruleOrGroup: r(9), parent: [1, 1] }],
  },
  {
    name: 'add to nested group by id',
    fixture: 'nested',
    ops: [{ kind: 'add', ruleOrGroup: r(9), parent: '[1,1]' }],
  },
  { name: 'remove middle rule by path', fixture: 'flat', ops: [{ kind: 'remove', target: [1] }] },
  { name: 'remove middle rule by id', fixture: 'flat', ops: [{ kind: 'remove', target: '[1]' }] },
  {
    name: 'update field triggers reset',
    fixture: 'flat',
    ops: [{ kind: 'update', prop: 'field', value: 'fX', target: [0] }],
  },
  {
    name: 'update combinator on root',
    fixture: 'flat',
    ops: [{ kind: 'update', prop: 'combinator', value: or, target: [] }],
  },

  // --- Invalid targets -----------------------------------------------------------------------
  { name: 'remove root is refused', fixture: 'flat', ops: [{ kind: 'remove', target: [] }] },
  { name: 'remove bad path', fixture: 'flat', ops: [{ kind: 'remove', target: badPath }] },
  { name: 'remove bad id', fixture: 'flat', ops: [{ kind: 'remove', target: badID }] },
  {
    name: 'add to a rule rather than a group',
    fixture: 'flat',
    ops: [{ kind: 'add', ruleOrGroup: r(9), parent: [0] }],
  },
  {
    name: 'update at bad path',
    fixture: 'flat',
    ops: [{ kind: 'update', prop: 'value', value: 'x', target: badPath }],
  },
  {
    name: 'move from bad path',
    fixture: 'flat',
    ops: [{ kind: 'move', from: badPath, to: [0] }],
  },

  // --- No-op edits, then real edits (probes history/coalescing divergence #3) ------------------
  {
    name: 'no-op edit then real edit',
    fixture: 'flat',
    ops: [
      { kind: 'update', prop: 'value', value: 'v1', target: [0] },
      { kind: 'update', prop: 'value', value: 'v1-changed', target: [0] },
    ],
  },
  {
    name: 'three consecutive no-op edits',
    fixture: 'flat',
    ops: [
      { kind: 'update', prop: 'value', value: 'v1', target: [0] },
      { kind: 'update', prop: 'value', value: 'v1', target: [0] },
      { kind: 'update', prop: 'operator', value: '=', target: [0] },
    ],
  },
  {
    name: 'no-op move to same location, then a real move',
    fixture: 'flat',
    ops: [
      { kind: 'move', from: [1], to: [1] },
      { kind: 'move', from: [1], to: [0] },
    ],
  },

  // --- Path shifting: stale path vs. id after a mutation --------------------------------------
  {
    name: 'move shifts siblings, then target the stale path',
    fixture: 'flat',
    ops: [
      { kind: 'move', from: [2], to: [0] },
      { kind: 'update', prop: 'value', value: 'stale-path', target: [1] },
    ],
  },
  {
    name: 'move shifts siblings, then target the same node by id',
    fixture: 'flat',
    ops: [
      { kind: 'move', from: [2], to: [0] },
      { kind: 'update', prop: 'value', value: 'by-id', target: '[1]' },
    ],
  },
  {
    name: 'remove shifts siblings, then remove the stale path',
    fixture: 'nested',
    ops: [
      { kind: 'remove', target: [0] },
      { kind: 'remove', target: [1] },
    ],
  },
  {
    name: 'remove shifts siblings, then remove by id',
    fixture: 'nested',
    ops: [
      { kind: 'remove', target: [0] },
      { kind: 'remove', target: '[2]' },
    ],
  },
  {
    name: 'add then immediately move the added node',
    fixture: 'flat',
    ops: [
      { kind: 'add', ruleOrGroup: r(9), parent: [] },
      { kind: 'move', from: [3], to: [0] },
    ],
  },
  {
    name: 'clone a rule, then edit the clone',
    fixture: 'flat',
    ops: [
      { kind: 'move', from: [0], to: [2], clone: true },
      { kind: 'update', prop: 'value', value: 'cloned', target: [2] },
    ],
  },
  {
    name: 'move up and down',
    fixture: 'nested',
    ops: [
      { kind: 'move', from: [2], to: 'up' },
      { kind: 'move', from: [0], to: 'down' },
    ],
  },
  {
    name: 'move across levels then back',
    fixture: 'nested',
    ops: [
      { kind: 'move', from: [0], to: [1, 1, 1, 0] },
      { kind: 'move', from: [0, 0, 1, 0], to: [0] },
    ],
  },

  // --- `group` and nesting toward `maxLevels` --------------------------------------------------
  {
    name: 'group two siblings',
    fixture: 'flat',
    ops: [{ kind: 'group', from: [0], to: [1] }],
  },
  {
    name: 'group by id, then group the result again',
    fixture: 'flat',
    ops: [
      { kind: 'group', from: '[0]', to: '[1]' },
      { kind: 'group', from: [1], to: [0] },
    ],
  },
  {
    name: 'nested groups approaching maxLevels',
    fixture: 'nested',
    options: { maxLevels: 3 },
    ops: [
      { kind: 'add', ruleOrGroup: g(), parent: [1, 1] },
      { kind: 'add', ruleOrGroup: g(), parent: [1, 1, 2] },
      { kind: 'add', ruleOrGroup: r(9), parent: [1, 1, 2] },
    ],
  },
  {
    name: 'maxLevels exactly at the boundary',
    fixture: 'flat',
    options: { maxLevels: 1 },
    ops: [
      { kind: 'add', ruleOrGroup: g(), parent: [] },
      { kind: 'add', ruleOrGroup: g(), parent: [3] },
    ],
  },

  // --- Independent combinators -----------------------------------------------------------------
  { name: 'ic: add rule', fixture: 'ic', ops: [{ kind: 'add', ruleOrGroup: r(9), parent: [] }] },
  { name: 'ic: remove middle rule', fixture: 'ic', ops: [{ kind: 'remove', target: [2] }] },
  {
    name: 'ic: update a combinator slot',
    fixture: 'ic',
    ops: [{ kind: 'update', prop: 'combinator', value: or, target: [1] }],
  },
  {
    name: 'ic: update a non-combinator slot',
    fixture: 'ic',
    ops: [{ kind: 'update', prop: 'combinator', value: or, target: [0] }],
  },
  {
    name: 'ic: move into a nested ic group',
    fixture: 'icNested',
    ops: [
      { kind: 'move', from: [0], to: [2, 0] },
      { kind: 'remove', target: [0] },
    ],
  },
  {
    name: 'ic: group two rules',
    fixture: 'ic',
    ops: [{ kind: 'group', from: [0], to: [2] }],
  },

  // --- `insert` (QueryManager vs. query tools only) ---------------------------------------------
  {
    name: 'insert at the head, then edit what was displaced',
    fixture: 'flat',
    ops: [
      { kind: 'insert', ruleOrGroup: r(9), target: [0] },
      { kind: 'update', prop: 'value', value: 'displaced', target: [1] },
    ],
  },
  {
    name: 'insert with replace',
    fixture: 'flat',
    ops: [{ kind: 'insert', ruleOrGroup: r(9), target: [1], replace: true }],
  },

  // --- Disabled gating ---------------------------------------------------------------------------
  {
    name: 'edit a disabled rule',
    fixture: 'withDisabled',
    ops: [{ kind: 'update', prop: 'value', value: 'nope', target: [1] }],
  },
  {
    name: 'edit a descendant of a disabled group',
    fixture: 'withDisabled',
    ops: [{ kind: 'update', prop: 'value', value: 'nope', target: [2, 0] }],
  },
  {
    name: 're-enable a disabled rule, then edit it',
    fixture: 'withDisabled',
    ops: [
      { kind: 'update', prop: 'disabled', value: false, target: [1] },
      { kind: 'update', prop: 'value', value: 'now-allowed', target: [1] },
    ],
  },
  {
    name: 'disable a rule, then try to edit it',
    fixture: 'withoutDisabled',
    ops: [
      { kind: 'update', prop: 'disabled', value: true, target: [0] },
      { kind: 'update', prop: 'value', value: 'nope', target: [0] },
    ],
  },
  {
    name: 'add to a disabled group',
    fixture: 'withDisabled',
    ops: [{ kind: 'add', ruleOrGroup: r(9), parent: [2] }],
  },
  {
    name: 'remove a disabled rule',
    fixture: 'withDisabled',
    ops: [{ kind: 'remove', target: [1] }],
  },
  {
    name: 'move a disabled rule',
    fixture: 'withDisabled',
    ops: [{ kind: 'move', from: [1], to: [0] }],
  },
  {
    name: 'group starting from a disabled rule',
    fixture: 'withDisabled',
    ops: [{ kind: 'group', from: [1], to: [0] }],
  },
  {
    name: 'move a rule onto a disabled destination',
    fixture: 'withDisabled',
    ops: [{ kind: 'move', from: [0], to: [2, 0] }],
  },
  {
    name: 'mutations against a root-disabled query',
    fixture: 'rootDisabled',
    ops: [
      { kind: 'update', prop: 'value', value: 'nope', target: [0] },
      { kind: 'update', prop: 'disabled', value: false, target: [0] },
      { kind: 'remove', target: [1] },
      { kind: 'add', ruleOrGroup: r(9), parent: [] },
    ],
  },

  // --- `disabledPaths` (the array form of the `disabled` prop) ------------------------------------
  {
    name: 'disabledPaths: edit a path-disabled rule',
    fixture: 'withoutDisabled',
    options: { disabledPaths: [[0]] },
    ops: [{ kind: 'update', prop: 'value', value: 'nope', target: [0] }],
  },
  {
    name: 'disabledPaths: edit a descendant of a path-disabled group',
    fixture: 'withoutDisabled',
    options: { disabledPaths: [[2]] },
    ops: [{ kind: 'update', prop: 'value', value: 'nope', target: [2, 0] }],
  },
  {
    name: 'disabledPaths: add to a path-disabled group',
    fixture: 'withoutDisabled',
    options: { disabledPaths: [[2]] },
    ops: [{ kind: 'add', ruleOrGroup: r(9), parent: [2] }],
  },
  {
    name: 'disabledPaths: remove and move a path-disabled rule',
    fixture: 'withoutDisabled',
    options: { disabledPaths: [[1]] },
    ops: [
      { kind: 'remove', target: [1] },
      { kind: 'move', from: [1], to: [0] },
      { kind: 'group', from: [1], to: [0] },
    ],
  },
  {
    name: 'disabledPaths: the re-enable exemption still applies',
    fixture: 'withoutDisabled',
    options: { disabledPaths: [[0]] },
    ops: [
      { kind: 'update', prop: 'disabled', value: false, target: [0] },
      { kind: 'update', prop: 'disabled', value: true, target: [0] },
    ],
  },
  {
    name: 'disabledPaths: ignored when respectDisabled is false',
    fixture: 'withoutDisabled',
    options: { disabledPaths: [[0]], respectDisabled: false },
    ops: [{ kind: 'update', prop: 'value', value: 'allowed', target: [0] }],
  },
  {
    name: 'disabledPaths: targeting by id resolves to the disabled path',
    fixture: 'withoutDisabled',
    options: { disabledPaths: [[1]] },
    ops: [{ kind: 'update', prop: 'value', value: 'nope', target: '[1]' }],
  },
  {
    name: 'disabledPaths: root path disables everything',
    fixture: 'flat',
    options: { disabledPaths: [[]] },
    ops: [
      { kind: 'update', prop: 'value', value: 'nope', target: [0] },
      { kind: 'add', ruleOrGroup: r(9), parent: [] },
      { kind: 'remove', target: [1] },
    ],
  },
  {
    name: 'disabledPaths: unaffected siblings still mutate',
    fixture: 'withoutDisabled',
    options: { disabledPaths: [[1]] },
    ops: [
      { kind: 'update', prop: 'value', value: 'nope', target: [1] },
      { kind: 'update', prop: 'value', value: 'yes', target: [0] },
      { kind: 'remove', target: [3] },
    ],
  },

  // --- Longer mixed sequences ----------------------------------------------------------------------
  {
    name: 'build a tree from empty',
    fixture: 'empty',
    ops: [
      { kind: 'add', ruleOrGroup: r(1), parent: [] },
      { kind: 'add', ruleOrGroup: r(2), parent: [] },
      { kind: 'group', from: [0], to: [1] },
      { kind: 'add', ruleOrGroup: r(3), parent: [0] },
      { kind: 'update', prop: 'combinator', value: or, target: [0] },
      { kind: 'move', from: [0, 0], to: [] },
      { kind: 'remove', target: [1, 0] },
    ],
  },
  {
    name: 'churn on a nested query',
    fixture: 'nested',
    ops: [
      { kind: 'update', prop: 'not', value: true, target: [1] },
      { kind: 'move', from: [1, 1, 1], to: [0] },
      { kind: 'add', ruleOrGroup: g([r(9)]), parent: [0] },
      { kind: 'group', from: [0, 2], to: [0, 0] },
      { kind: 'remove', target: [2] },
      { kind: 'update', prop: 'field', value: 'fZ', target: [0, 0, 0] },
    ],
  },
];

// #endregion

// #region Randomized sequences (property-based testing support)

/**
 * Every path in `query`, in depth-first order, including the root (`[]`). Independent-combinator
 * slots are bare strings rather than nodes, so they are skipped — `findPath` reports them as
 * missing, and no operation can target them.
 */
export const allPaths = (query: RuleGroupTypeAny, prefix: Path = []): Path[] => {
  const paths: Path[] = [prefix];
  for (const [index, child] of query.rules.entries()) {
    if (typeof child === 'string') continue;
    const childPath = [...prefix, index];
    if (isRuleGroup(child)) {
      paths.push(...allPaths(child, childPath));
    } else {
      paths.push(childPath);
    }
  }
  return paths;
};

/** All paths that resolve to a group, including the root. */
export const groupPaths = (query: RuleGroupTypeAny): Path[] =>
  allPaths(query).filter(p => {
    const node = findPath(p, query);
    return !!node && isRuleGroup(node);
  });

/**
 * An operation described *relative to whatever query it lands on*, rather than in terms of
 * concrete paths.
 *
 * Property-based runs need generated operations to keep targeting nodes that actually exist:
 * a sequence of independently-generated absolute paths degenerates into a sequence of
 * `target-not-found` aborts after the first `remove`, which tests nothing. Numeric fields are
 * therefore _selectors_ — reduced modulo the candidate count at the time the operation is
 * materialized — so any generated seed produces a meaningful operation against any query.
 *
 * Keeping the generated shape this small (all numbers and booleans) is also what makes
 * `fast-check`'s shrinking useful: a failure shrinks toward low indices and short sequences.
 */
export interface OpSeed {
  kind: Op['kind'];
  /** Selects the primary target (or parent) from the candidate paths. */
  target: number;
  /** Selects the secondary target: `move` destination, `group` destination. */
  secondary: number;
  /** Target by `id` rather than by path, where the operation supports it. */
  useID: boolean;
  /** `clone` for `move`/`group`, `replace` for `insert`. */
  flag: boolean;
  /** Add/insert a group rather than a rule. */
  addGroup: boolean;
  /** Selects from {@link seedUpdates}. */
  prop: number;
  /** Selects `'up'`/`'down'` instead of a path as a `move` destination. */
  relativeMove: boolean;
}

/** The property/value pairs a seeded `update` can choose from. */
const seedUpdates: { prop: UpdateableProperties; value: unknown }[] = [
  { prop: 'field', value: 'fX' },
  { prop: 'operator', value: '<' },
  { prop: 'value', value: 'vX' },
  { prop: 'combinator', value: or },
  { prop: 'not', value: true },
  { prop: 'disabled', value: true },
  { prop: 'disabled', value: false },
  { prop: 'valueSource', value: 'value' },
];

/** Cycles into a non-empty list. Negative and out-of-range indices are both handled. */
const pick = <T>(list: readonly T[], index: number): T =>
  list[((index % list.length) + list.length) % list.length];

const idAt = (query: RuleGroupTypeAny, path: Path): string | undefined =>
  (findPath(path, query) as { id?: string } | null)?.id;

/**
 * Turns {@link OpSeed}s into concrete {@link Op}s by applying each one as it is resolved, so
 * every selector is reduced against the query as it exists at that point in the sequence.
 *
 * The query tools are used to advance the intermediate state; the resulting `Op[]` is a plain
 * value that all three interpreters can then replay independently.
 */
export const materializeOps = (
  seeds: readonly OpSeed[],
  startQuery: RuleGroupTypeAny,
  options: RunOptions = {}
): Op[] => {
  const idGenerator = options.idGenerator ?? createIdGenerator('mat');
  let query = prepareRuleGroup(clone(startQuery), { idGenerator });
  const ops: Op[] = [];

  for (const seed of seeds) {
    const nodes = allPaths(query).filter(p => p.length > 0);
    const groups = groupPaths(query);

    // `target`/`from` operations need at least one non-root node; when the query is empty, the
    // only meaningful operation is an `add`.
    const kind = nodes.length === 0 ? 'add' : seed.kind;

    const primary = pick(groups, seed.target);
    const node = nodes.length > 0 ? pick(nodes, seed.target) : [];
    const other = nodes.length > 0 ? pick(nodes, seed.secondary) : [];
    const ruleOrGroup = seed.addGroup ? g() : r(seed.prop);
    const target = (path: Path): Path | string =>
      (seed.useID ? idAt(query, path) : undefined) ?? path;

    let op: Op;
    switch (kind) {
      case 'add': {
        op = { kind: 'add', ruleOrGroup, parent: target(primary) };
        break;
      }
      case 'update': {
        const { prop, value } = pick(seedUpdates, seed.prop);
        op = { kind: 'update', prop, value, target: target(node) };
        break;
      }
      case 'remove': {
        op = { kind: 'remove', target: target(node) };
        break;
      }
      case 'move': {
        op = {
          kind: 'move',
          from: target(node),
          to: seed.relativeMove ? (seed.flag ? 'up' : 'down') : other,
          clone: seed.flag,
        };
        break;
      }
      case 'insert': {
        // `insert` takes a path only.
        op = { kind: 'insert', ruleOrGroup, target: node, replace: seed.flag };
        break;
      }
      case 'group': {
        op = { kind: 'group', from: target(node), to: target(other), clone: seed.flag };
        break;
      }
    }

    ops.push(op);
    query = runViaQueryTools([op], query, { ...options, idGenerator }).query;
  }

  return ops;
};

// #endregion
