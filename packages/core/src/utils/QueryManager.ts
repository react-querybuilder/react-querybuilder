import { freeze } from 'immer';
import {
  defaultCoalesceMs,
  defaultCombinators,
  defaultMaxHistory,
  defaultOperatorLabelMap,
  defaultOperators,
} from '../defaults';
import type {
  BaseOptionMap,
  DiagnosticsResult,
  ExportFormat,
  ExportObjectFormats,
  FlexibleOption,
  FlexibleOptionList,
  FlexibleOptionListProp,
  FormatQueryOptions,
  FullCombinator,
  FullField,
  FullOperator,
  FullOption,
  FullOptionList,
  FullOptionRecord,
  MatchMode,
  MatchModeOptions,
  Option,
  ParameterizedNamedSQL,
  ParameterizedSQL,
  Path,
  QueryHistoryOptions,
  QueryValidator,
  RQBJsonLogic,
  RuleGroupProcessor,
  RuleGroupType,
  RuleGroupTypeAny,
  RuleType,
  ToRuleGroupType,
  ToRuleGroupTypeIC,
  UpdateableProperties,
  UpdateValueMap,
  ValidationMap,
  ValueEditorType,
  ValueSourceFlexibleOptions,
  InputType,
  OptionList,
  ValueSourceFullOptions,
  ValueSources,
} from '../types';
import { convertFromIC, convertToIC } from './convertQuery';
import { defaultValidator } from './defaultValidator';
import type { RuleContext, RuleGroupContext } from './deriveRuleContext';
import { deriveRuleContext, deriveRuleGroupContext, getFieldData } from './deriveRuleContext';
import { formatQuery } from './formatQuery';
import type {
  defaultRuleGroupProcessorDrizzle,
  defaultRuleGroupProcessorSequelize,
  defaultRuleGroupProcessorTanStackDB,
} from './formatQuery';
import { generateID } from './generateID';
import { getMatchModesUtil } from './getMatchModesUtil';
import { getRuleDefaultValue } from './getRuleDefaultValue';
import { getValueSourcesUtil } from './getValueSourcesUtil';
import { isRuleGroup, isRuleGroupTypeIC } from './isRuleGroup';
import { prepareOptionList } from './optGroupUtils';
import {
  resolveDefaultOperator,
  resolveOperatorList,
  resolveValueEditorType,
  resolveValueList,
} from './optionResolvers';
import type { FindPathReturnType } from './pathUtils';
import { findPath, getParentPath, pathIsDisabled } from './pathUtils';
import { prepareRuleGroup } from './prepareQueryObjects';
import type {
  AbortInfo,
  AbortReason,
  GuardOptions,
  AddOptions,
  GroupOptions,
  InsertOptions,
  MoveOptions,
  RemoveOptions,
  UpdateOptions,
} from './queryTools';
import { add, group, insert, move, remove, update } from './queryTools';
import { regenerateIDs } from './regenerateIDs';
import { createRule, createRuleGroup } from './ruleFactory';
import { signatureOf, structuralSignature, unchangedSignature } from './signature';
import type { TransformQueryOptions } from './transformQuery';
import { transformQuery } from './transformQuery';

/**
 * Abort reasons that {@link QueryManager}'s `strict` mode treats as errors. The remaining
 * reasons—`"same-location"` and `"no-change"`—describe valid operations that had nothing to do,
 * so they are reported to `onInvalidTarget` but never throw.
 *
 * @group Query Tools
 */
export const strictAbortReasons: readonly AbortReason[] = [
  'target-not-found',
  'parent-not-found',
  'parent-not-a-group',
  'destination-not-found',
  'root-not-allowed',
  'not-a-combinator-slot',
  'target-disabled',
  'parent-disabled',
  'max-levels-exceeded',
];

const strictAbortReasonSet = new Set<AbortReason>(strictAbortReasons);

/**
 * Thrown by {@link QueryManager} methods in `strict` mode when an operation cannot be carried
 * out because its target could not be used.
 *
 * @group Query Tools
 */
export class QueryManagerError extends Error {
  /** Why the operation was aborted. */
  readonly code: AbortReason;
  /** Full details about the aborted operation. */
  readonly info: AbortInfo;

  constructor(info: AbortInfo) {
    super(
      `QueryManager: "${info.operation}" aborted (${info.reason})${
        info.pathOrID === undefined ? '' : ` for target ${JSON.stringify(info.pathOrID)}`
      }.`
    );
    this.name = 'QueryManagerError';
    this.code = info.reason;
    this.info = info;
    // Required for `instanceof` to work when targeting ES5.
    Object.setPrototypeOf(this, QueryManagerError.prototype);
  }
}

/**
 * Per-call overrides for {@link QueryManager}'s abort handling. Every mutating method accepts
 * these alongside the options of the query tool it delegates to.
 *
 * @group Query Tools
 */
export interface StrictOptions {
  /**
   * Throw a {@link QueryManagerError} when an operation is aborted for one of the
   * {@link strictAbortReasons}. Overrides the manager's own `strict` option.
   */
  strict?: boolean;
  /**
   * Called whenever an operation is aborted, including for the non-error reasons
   * `"same-location"` and `"no-change"`. Runs before any `strict` throw, so an operation can be
   * both observed and enforced. Overrides the manager's own `onInvalidTarget` option.
   */
  onInvalidTarget?: (info: AbortInfo) => void;
}

/**
 * Options for {@link QueryManager}. Mirrors the subset of
 * {@link react-querybuilder!QueryBuilder QueryBuilder} props that affect query
 * _structure_ rather than rendering, so the same configuration objects can drive both.
 *
 * @group Query Tools
 */
export interface QueryManagerOptions<
  F extends FullField = FullField,
  O extends FullOperator = FullOperator,
  C extends FullCombinator = FullCombinator,
> {
  /** The fields available for rules. Accepts the same shapes as the `fields` prop. */
  fields?: FlexibleOptionListProp<F> | BaseOptionMap<F>;
  /** The operators available for rules. Accepts the same shapes as the `operators` prop. */
  operators?: FlexibleOptionListProp<O> | BaseOptionMap<O>;
  /** The combinators available for groups. Defaults to `defaultCombinators`. */
  combinators?: FlexibleOptionListProp<C> | BaseOptionMap<C>;
  /** Properties applied to every field in `fields`. */
  baseField?: Record<string, unknown>;
  /** Properties applied to every operator in `operators`. */
  baseOperator?: Record<string, unknown>;
  /** Properties applied to every combinator in `combinators`. */
  baseCombinator?: Record<string, unknown>;
  /** When `false`, an empty placeholder option is prepended to the field list. */
  autoSelectField?: boolean;
  /** When `false`, an empty placeholder option is prepended to each operator list. */
  autoSelectOperator?: boolean;
  /** When `false`, an empty placeholder option is prepended to each value list. */
  autoSelectValue?: boolean;
  /** The default `field` for rules created by {@link QueryManager.createRule}. */
  getDefaultField?: string | ((fieldsData: FullOptionList<F>) => string);
  /** The default `operator` for a given field. */
  getDefaultOperator?: string | ((field: string, misc: { fieldData: F }) => string);
  /** Overrides the computed default `value` for a new rule. */
  getDefaultValue?: (rule: RuleType, misc: { fieldData: F }) => unknown;
  /** The operators available for a given field. */
  getOperators?: (field: string, misc: { fieldData: F }) => FlexibleOptionList<O> | null;
  /** The value editor type for a given field/operator, which informs the default value. */
  getValueEditorType?: (field: string, operator: string, misc: { fieldData: F }) => ValueEditorType;
  /** The value list for a given field/operator, which informs the default value. */
  getValues?: (
    field: string,
    operator: string,
    misc: { fieldData: F }
  ) => FlexibleOptionList<Option>;
  /** The valid value sources for a given field/operator. */
  getValueSources?: (
    field: string,
    operator: string,
    misc: { fieldData: F }
  ) => ValueSources | ValueSourceFlexibleOptions;
  /** The valid match modes for a given field. */
  getMatchModes?: (
    field: string,
    misc: { fieldData: F }
  ) => boolean | MatchMode[] | FlexibleOption<MatchMode>[];
  /** The named parameters available for a given field/operator. */
  getParameters?: (
    field: string,
    operator: string,
    misc: { fieldData: F }
  ) => FlexibleOptionList<Option> | null;
  /** When `true`, multi-value defaults are arrays instead of comma-joined strings. */
  listsAsArrays?: boolean;
  /** When `true`, groups created by {@link QueryManager.createRuleGroup} contain one new rule. */
  addRuleToNewGroups?: boolean;
  /**
   * When updating a rule's `field`, reset its `operator`, `value`, and `valueSource` to their
   * defaults. Defaults to `true`, matching the `QueryBuilder` prop of the same name.
   */
  resetOnFieldChange?: boolean;
  /**
   * When updating a rule's `operator`, reset its `value` to the default. Defaults to `false`,
   * matching the `QueryBuilder` prop of the same name.
   */
  resetOnOperatorChange?: boolean;
  /**
   * The maximum depth at which groups may be added. Defaults to `Infinity`.
   */
  maxLevels?: number;
  /**
   * Honor `disabled` properties within the query, so mutations targeting a disabled rule or
   * group (or a descendant of a disabled group) are aborted. Updating a node's own `disabled`
   * property is always permitted. Defaults to `true`, matching the `QueryBuilder` component;
   * pass `false` to mutate freely regardless of the property.
   */
  respectDisabled?: boolean;
  /** Abort every mutation, as though the entire query were disabled. Defaults to `false`. */
  queryDisabled?: boolean;
  /** The input type for a given field/operator, surfaced by {@link QueryManager.getRuleContext}. */
  getInputType?: (field: string, operator: string, misc: { fieldData: F }) => InputType | null;
  /** Extra props for a subquery builder, surfaced by {@link QueryManager.getRuleContext}. */
  getSubQueryBuilderProps?: (field: string, misc: { fieldData: F }) => Record<string, unknown>;
  /**
   * Enables undo/redo recording. Pass `true` for the defaults, or an object to configure
   * `maxHistory` and/or `coalesceMs`. Disabled by default, so instances that never undo
   * retain no extra references.
   */
  history?: boolean | QueryHistoryOptions;
  /**
   * Throw a {@link QueryManagerError} when a mutation is aborted because its target could not
   * be used. Disabled by default, in which case such mutations are silent no-ops. Can be
   * overridden per call.
   */
  strict?: boolean;
  /**
   * Called whenever a mutation is aborted, including for the non-error reasons
   * `"same-location"` and `"no-change"`. Can be overridden per call.
   */
  onInvalidTarget?: (info: AbortInfo) => void;
  /** Validates the query. Defaults to {@link defaultValidator}. */
  validator?: QueryValidator;
  /** Generates `id` properties for new rules and groups. Defaults to {@link generateID}. */
  idGenerator?: () => string;
}

/** Everything {@link QueryManager.batch} restores when the batched function throws. */
interface QueryManagerSnapshot<RG extends RuleGroupTypeAny> {
  query: RG;
  past: RG[];
  future: RG[];
  lastSig: string | undefined;
  lastAt: number;
}

/**
 * A single rule or group encountered by {@link QueryManager.walk}, along with where it was found.
 *
 * @group Query Tools
 */
export interface QueryNode<RG extends RuleGroupTypeAny = RuleGroupType> {
  /** The rule or group itself. */
  node: RG | RuleType;
  /** The {@link Path} of `node` within the query. The root group's path is `[]`. */
  path: Path;
  /** The group containing `node`, or `null` for the root group. */
  parent: RG | null;
}

/**
 * Options for {@link QueryManager.walk} and its derivatives.
 *
 * @group Query Tools
 */
export interface WalkOptions {
  /**
   * Traverse only the subtree rooted at this path or `id` instead of the whole query. The node
   * itself is visited first. When the path or `id` can't be resolved, nothing is visited.
   */
  from?: Path | string;
  /** Visit only rules. Groups are still traversed, just not yielded (except as `parent`). */
  rulesOnly?: boolean;
  /** Visit only groups. */
  groupsOnly?: boolean;
}

/**
 * Coerces the result of a conditional query type back into something assignable to
 * {@link QueryManager}'s `RG` parameter, which TypeScript cannot verify on its own.
 */
type AsRuleGroup<T> = T extends RuleGroupTypeAny ? T : RuleGroupTypeAny;

/**
 * Stateful wrapper around the {@link add}/{@link remove}/{@link update}/{@link move}/
 * {@link insert}/{@link group} query tools, plus rule/group factories, {@link defaultValidator
 * validation}, and {@link formatQuery formatting}.
 *
 * The query is held internally, so each method takes the same arguments as its `queryTools`
 * counterpart minus the leading `query` parameter, and returns the manager itself for chaining.
 * Mutations use the non-`InPlace` tools, so a query previously handed out by
 * {@link QueryManager.getQuery} is never modified.
 *
 * ```ts
 * const q = new QueryManager(undefined, { fields });
 * q.add(q.createRule()).add({ field: 'firstName', operator: '=', value: 'Steve' });
 * q.format('sql');
 * ```
 *
 * Like the underlying query tools, methods are a no-op when the target path or `id` can't be
 * resolved (including attempts to remove the root group). By default nothing is thrown; pass
 * `strict: true` to raise a {@link QueryManagerError} instead, or `onInvalidTarget` to observe
 * aborted operations without changing control flow.
 *
 * @group Query Tools
 */
export class QueryManager<
  RG extends RuleGroupTypeAny = RuleGroupType,
  F extends FullField = FullField,
  O extends FullOperator = FullOperator,
  C extends FullCombinator = FullCombinator,
> {
  #query: RG;
  readonly #options: QueryManagerOptions<F, O, C>;
  readonly #fields: FullOptionList<F>;
  readonly #fieldMap: Partial<FullOptionRecord<FullField>>;
  readonly #operators: FullOptionList<O>;
  readonly #combinators: FullOptionList<C>;
  readonly #idGenerator: () => string;
  readonly #validator: QueryValidator;
  readonly #strict: boolean;
  readonly #respectDisabled: boolean;
  readonly #onInvalidTarget: ((info: AbortInfo) => void) | undefined;
  readonly #listeners = new Set<() => void>();
  readonly #historyEnabled: boolean;
  readonly #maxHistory: number;
  readonly #coalesceMs: number;
  #past: RG[] = [];
  #future: RG[] = [];
  #lastSig: string | undefined;
  #lastAt = 0;
  #batchDepth = 0;
  #batchSnapshot: QueryManagerSnapshot<RG> | undefined;
  /** Whether a history-stack method ran inside the batch currently in progress. */
  #historyBypassed = false;
  /**
   * The query the cached fields below were derived from. Caches are keyed on query _identity_
   * rather than invalidated from {@link QueryManager.#commit} because `undo`, `redo`, and
   * `batch`'s rollback all assign `#query` directly.
   */
  #cacheFor: RG | undefined;
  #idPathIndex: Map<string, Path> | undefined;
  #validation: boolean | ValidationMap | undefined;

  constructor(query?: RG, options: QueryManagerOptions<F, O, C> = {}) {
    this.#options = options;
    this.#idGenerator = options.idGenerator ?? generateID;
    this.#validator = options.validator ?? defaultValidator;
    this.#strict = options.strict ?? false;
    this.#respectDisabled = options.respectDisabled ?? true;
    this.#onInvalidTarget = options.onInvalidTarget;

    const history = options.history ?? false;
    const historyOptions: QueryHistoryOptions = typeof history === 'object' ? history : {};
    this.#historyEnabled = history !== false;
    this.#maxHistory = historyOptions.maxHistory ?? defaultMaxHistory;
    this.#coalesceMs = historyOptions.coalesceMs ?? defaultCoalesceMs;

    const { optionList: fields, optionsMap: fieldMap } = prepareOptionList<F>({
      optionList: options.fields,
      baseOption: options.baseField,
      autoSelectOption: options.autoSelectField,
    });
    // Frozen because `getFields` hands this array out directly; see also `#combinators`.
    this.#fields = freeze(fields, true);
    this.#fieldMap = fieldMap;

    this.#operators = prepareOptionList<O>({
      optionList: (options.operators ?? defaultOperators) as FlexibleOptionListProp<O>,
      baseOption: options.baseOperator,
      labelMap: defaultOperatorLabelMap,
      autoSelectOption: options.autoSelectOperator,
    }).optionList;

    // Frozen because `getCombinators` hands this array out directly; see also `#fields`.
    this.#combinators = freeze(
      prepareOptionList<C>({
        optionList: (options.combinators ?? defaultCombinators) as FlexibleOptionListProp<C>,
        baseOption: options.baseCombinator,
      }).optionList,
      true
    );

    this.#query = freeze(
      query ? prepareRuleGroup(query, { idGenerator: this.#idGenerator }) : this.createRuleGroup(),
      true
    );
  }

  // #region Internal resolution

  /** Resolves the field configuration for a field name. */
  #fieldData(field: string): F {
    return (this.#fieldMap[field] ?? {}) as F;
  }

  /** Resolves the operator list for a field, mirroring `QueryBuilder`'s precedence. */
  #operatorsFor(field: string): FullOptionList<O> {
    return resolveOperatorList<F, O>({
      field,
      fieldData: this.#fieldData(field),
      getOperators: this.#options.getOperators,
      operators: this.#operators,
      baseOption: this.#options.baseOperator,
      autoSelectOption: this.#options.autoSelectOperator,
    });
  }

  /** Resolves the default operator for a field, mirroring `QueryBuilder`'s precedence. */
  #defaultOperator(field: string): string {
    return resolveDefaultOperator<F>({
      field,
      fieldData: this.#fieldData(field),
      getDefaultOperator: this.#options.getDefaultOperator,
      getOperators: (f: string) => this.#operatorsFor(f),
    });
  }

  #valueSourcesFor(field: string, operator: string) {
    return getValueSourcesUtil<F, string>(
      this.#fieldData(field),
      operator,
      this.#options.getValueSources
    );
  }

  #matchModesFor(field: string): MatchModeOptions {
    return getMatchModesUtil<F>(this.#fieldData(field), this.#options.getMatchModes);
  }

  #valuesFor(field: string, operator: string): FullOptionList<Option> {
    return resolveValueList<F>({
      field,
      operator,
      fieldData: this.#fieldData(field),
      getValues: this.#options.getValues,
      autoSelectOption: this.#options.autoSelectValue,
    });
  }

  #valueEditorTypeFor(field: string, operator: string): ValueEditorType {
    return resolveValueEditorType<F>({
      field,
      operator,
      fieldData: this.#fieldData(field),
      getValueEditorType: this.#options.getValueEditorType,
    });
  }

  /** Computes the default `value` for a rule, mirroring `QueryBuilder`'s precedence. */
  #defaultValue(rule: RuleType): unknown {
    const { getDefaultValue, getParameters, listsAsArrays } = this.#options;
    return getRuleDefaultValue<F>(rule, {
      fieldData: this.#fieldData(rule.field),
      fields: this.#fields,
      listsAsArrays,
      getValueEditorType: (f, o) => this.#valueEditorTypeFor(f, o),
      getValues: (f, o) => this.#valuesFor(f, o),
      getDefaultValue: getDefaultValue && ((r, misc) => getDefaultValue(r, misc)),
      getParameters: getParameters && ((f, o, misc) => this.#parametersFor(f, o, misc)),
    });
  }

  /**
   * Resolves the parameter list for a field/operator pair, normalized the same way as every
   * other option list. Shared by {@link QueryManager.#defaultValue} and
   * {@link QueryManager.getRuleContext} so both see the same shape.
   */
  #parametersFor(field: string, operator: string, misc: { fieldData: F }): FullOptionList<Option> {
    return prepareOptionList<FullOption>({
      optionList: this.#options.getParameters?.(field, operator, misc) ?? [],
      autoSelectOption: this.#options.autoSelectValue,
    }).optionList;
  }

  /** Defaults shared by every mutating method, overridable per call. */
  #guardOptions(): GuardOptions {
    return {
      maxLevels: this.#options.maxLevels,
      respectDisabled: this.#respectDisabled,
      queryDisabled: this.#options.queryDisabled,
    };
  }

  #toolOptions() {
    return {
      combinators: this.#combinators,
      idGenerator: this.#idGenerator,
      ...this.#guardOptions(),
    };
  }

  /**
   * Builds the `onAbort` handler passed to the query tools, applying the per-call overrides on
   * top of the manager's own options.
   */
  #onAbort({ strict, onInvalidTarget }: StrictOptions): (info: AbortInfo) => void {
    const strictMain = strict ?? this.#strict;
    const handler = onInvalidTarget ?? this.#onInvalidTarget;

    return info => {
      // The handler always runs, for every reason, before `strict` is considered.
      handler?.(info);

      if (strictMain && strictAbortReasonSet.has(info.reason)) {
        throw new QueryManagerError(info);
      }
    };
  }

  /** Defaults for {@link update}, so resets mirror `QueryBuilder`'s behavior. */
  #updateOptions(): UpdateOptions {
    return {
      getRuleDefaultOperator: f => this.#defaultOperator(f),
      getRuleDefaultValue: r => this.#defaultValue(r),
      getValueSources: (f, o) => this.#valueSourcesFor(f, o),
      getMatchModes: f => this.#matchModesFor(f),
      resetOnFieldChange: this.#options.resetOnFieldChange,
      resetOnOperatorChange: this.#options.resetOnOperatorChange,
      ...this.#guardOptions(),
    };
  }

  /**
   * Applies a new query, recording history and notifying subscribers as appropriate. Every
   * mutation funnels through here. A tool that could not resolve its target returns the same
   * query object, which is treated as a no-op.
   */
  #commit(next: RG): void {
    const prev = this.#query;
    if (prev === next) return;

    this.#query = next;

    // Within a batch, history and notification are deferred until the outermost call ends,
    // so a batch produces one undo step and one notification.
    if (this.#batchDepth > 0) return;

    this.#record(prev, next);
    this.#notify();
  }

  /**
   * Records a change, either as a new history entry or by absorbing it into the current one.
   * Mirrors the recording semantics of the `react-querybuilder/history` entry point.
   */
  #record(prev: RG, next: RG): void {
    if (!this.#historyEnabled) return;

    const sig = signatureOf(prev, next);

    // The query object changed but nothing observable did, so an entry here would appear to do
    // nothing when undone.
    if (sig === unchangedSignature) return;

    const now = Date.now();
    const canCoalesce =
      sig !== structuralSignature && sig === this.#lastSig && now - this.#lastAt < this.#coalesceMs;

    if (!canCoalesce) {
      this.#past.push(prev);
      if (this.#past.length > this.#maxHistory) this.#past.shift();
      this.#future = [];
    }

    this.#lastSig = sig;
    this.#lastAt = now;
  }

  #notify(): void {
    for (const listener of this.#listeners) listener();
  }

  /**
   * Records that a history-stack method ran inside the current batch. Those methods manage
   * `#past`/`#future` themselves, so the batch must not also record an entry on completion —
   * doing so would push a duplicate onto `#past` and clear the redo stack that `undo` just
   * populated.
   */
  #markHistoryBypassed(): void {
    if (this.#batchDepth > 0) this.#historyBypassed = true;
  }

  /**
   * Discards every cached derivation when the query has been replaced since they were computed.
   * Called at the top of each cached reader.
   */
  #ensureCache(): void {
    if (this.#cacheFor === this.#query) return;

    this.#cacheFor = this.#query;
    this.#idPathIndex = undefined;
    this.#validation = undefined;
  }

  /**
   * The single traversal implementation. Combinator strings in independent-combinator groups
   * are skipped.
   *
   * @yields The subtree rooted at `node`, depth-first in pre-order, starting with `node` itself.
   */
  *#walkFrom(node: RG | RuleType, path: Path, parent: RG | null): Generator<QueryNode<RG>> {
    yield { node, path, parent };

    if (!isRuleGroup(node)) return;

    const startGroup = node as RG;
    for (const [index, child] of startGroup.rules.entries()) {
      // Independent-combinator groups interleave combinator strings among the rules.
      if (typeof child === 'string') continue;
      yield* this.#walkFrom(child as RG | RuleType, [...path, index], startGroup);
    }
  }

  /** Builds (once per query) the `id` to {@link Path} index backing `findID`/`getPathOfID`. */
  #index(): Map<string, Path> {
    this.#ensureCache();

    if (!this.#idPathIndex) {
      const index = new Map<string, Path>();
      for (const { node, path } of this.#walkFrom(this.#query, [], null)) {
        // The first occurrence wins, matching `findID`'s depth-first search order.
        if (node.id !== undefined && !index.has(node.id)) index.set(node.id, path);
      }
      this.#idPathIndex = index;
    }

    return this.#idPathIndex;
  }

  /** Resolves a path or `id` to a path, or `null` when the `id` isn't present. */
  #toPath(pathOrID: Path | string): Path | null {
    return typeof pathOrID === 'string' ? (this.#index().get(pathOrID) ?? null) : pathOrID;
  }

  // #endregion

  // #region State access

  /**
   * The current query. The returned object is frozen and structurally shared, so it is safe to
   * retain and compare by reference to detect changes.
   *
   * Like {@link QueryManager.subscribe}, this method is bound to the instance, so it can be
   * passed as a bare reference (e.g. as the `getSnapshot` argument to `useSyncExternalStore`).
   */
  getQuery = (): RG => this.#query;

  /** Replaces the current query, ensuring every rule and group has an `id`. */
  setQuery(query: RG): this {
    this.#commit(freeze(prepareRuleGroup(query, { idGenerator: this.#idGenerator }), true));
    return this;
  }

  // #endregion

  // #region Factories

  /**
   * Creates a rule using the configured fields, operators, and defaults. The rule is not added
   * to the query—pass it to {@link QueryManager.add} or {@link QueryManager.insert}.
   */
  createRule(): RuleType {
    return createRule<F>({
      fields: this.#fields,
      getDefaultField: this.#options.getDefaultField,
      getRuleDefaultOperator: f => this.#defaultOperator(f),
      getValueSources: (f, o) => this.#valueSourcesFor(f, o),
      getMatchModes: f => this.#matchModesFor(f),
      getRuleDefaultValue: r => this.#defaultValue(r),
      idGenerator: this.#idGenerator,
    });
  }

  /**
   * Creates a group. Pass `true` for a group with independent combinators. The group is not
   * added to the query—pass it to {@link QueryManager.add} or {@link QueryManager.insert}.
   */
  createRuleGroup(independentCombinators?: boolean): RG {
    return createRuleGroup<C>(
      {
        combinators: this.#combinators,
        addRuleToNewGroups: this.#options.addRuleToNewGroups,
        createRule: () => this.createRule(),
        idGenerator: this.#idGenerator,
      },
      independentCombinators
    ) as RG;
  }

  // #endregion

  // #region Mutators

  /**
   * Adds a rule or group to the end of the group at `parentPathOrID`, which defaults to the
   * root group.
   */
  add(
    ruleOrGroup: RG | RuleType,
    parentPathOrID: Path | string = [],
    options: AddOptions & StrictOptions = {}
  ): this {
    const { strict, onInvalidTarget, ...toolOptions } = options;
    this.#commit(
      add(this.#query, ruleOrGroup, parentPathOrID, {
        ...this.#toolOptions(),
        ...toolOptions,
        onAbort: this.#onAbort({ strict, onInvalidTarget }),
      })
    );
    return this;
  }

  /** Removes the rule or group at the given path or `id`. The root group cannot be removed. */
  remove(pathOrID: Path | string, options: RemoveOptions & StrictOptions = {}): this {
    const { strict, onInvalidTarget, ...toolOptions } = options;
    this.#commit(
      remove(this.#query, pathOrID, {
        ...this.#guardOptions(),
        ...toolOptions,
        onAbort: this.#onAbort({ strict, onInvalidTarget }),
      })
    );
    return this;
  }

  /** Updates a single property of the rule or group at the given path or `id`. */
  update(
    prop: UpdateableProperties,
    value: unknown,
    pathOrID: Path | string,
    options?: UpdateOptions & StrictOptions
  ): this;
  /** Updates multiple properties using parallel arrays of names and values. */
  update(
    props: UpdateableProperties[],
    values: unknown[],
    pathOrID: Path | string,
    options?: UpdateOptions & StrictOptions
  ): this;
  /** Updates multiple properties using a map of names to values. */
  update(
    props: UpdateValueMap,
    pathOrID: Path | string,
    options?: UpdateOptions & StrictOptions
  ): this;
  update(a: unknown, b?: unknown, c?: unknown, d?: unknown): this {
    // The property map form shifts `pathOrID` and `options` one position earlier.
    const optionsIndex = typeof a === 'string' || Array.isArray(a) ? 3 : 2;
    const args = [a, b, c, d];
    const { strict, onInvalidTarget, ...toolOptions }: UpdateOptions & StrictOptions =
      args[optionsIndex] ?? {};
    args[optionsIndex] = {
      ...this.#updateOptions(),
      ...toolOptions,
      onAbort: this.#onAbort({ strict, onInvalidTarget }),
    };

    // oxlint-disable-next-line typescript/no-explicit-any
    this.#commit((update as any)(this.#query, ...args.slice(0, optionsIndex + 1)));
    return this;
  }

  /** Moves the rule or group at `oldPathOrID` to `newPath`, or shifts it `'up'`/`'down'`. */
  move(
    oldPathOrID: Path | string,
    newPath: Path | 'up' | 'down',
    options: MoveOptions & StrictOptions = {}
  ): this {
    const { strict, onInvalidTarget, ...toolOptions } = options;
    this.#commit(
      move(this.#query, oldPathOrID, newPath, {
        ...this.#toolOptions(),
        ...toolOptions,
        onAbort: this.#onAbort({ strict, onInvalidTarget }),
      })
    );
    return this;
  }

  /**
   * Inserts a rule or group at the given path. Unlike the other methods, this accepts a path
   * only—inserting _at_ an `id` would be ambiguous.
   */
  insert(
    ruleOrGroup: RG | RuleType,
    path: Path,
    options: InsertOptions & StrictOptions = {}
  ): this {
    const { strict, onInvalidTarget, ...toolOptions } = options;
    this.#commit(
      insert(this.#query, ruleOrGroup, path, {
        ...this.#toolOptions(),
        ...toolOptions,
        onAbort: this.#onAbort({ strict, onInvalidTarget }),
      })
    );
    return this;
  }

  /**
   * Creates a new group at `targetPathOrID` containing the rules/groups currently at
   * `targetPathOrID` and `sourcePathOrID`.
   */
  group(
    sourcePathOrID: Path | string,
    targetPathOrID: Path | string,
    options: GroupOptions & StrictOptions = {}
  ): this {
    const { strict, onInvalidTarget, ...toolOptions } = options;
    this.#commit(
      group(this.#query, sourcePathOrID, targetPathOrID, {
        ...this.#toolOptions(),
        ...toolOptions,
        onAbort: this.#onAbort({ strict, onInvalidTarget }),
      })
    );
    return this;
  }

  // #endregion

  // #region Cloning

  /**
   * Creates an independent manager with the same configuration and the current query.
   *
   * Subscribers and history are _not_ carried over: the clone starts with no listeners and an
   * empty undo stack. Because every mutation produces a new query object, the two managers
   * share the initial query safely and diverge from the first change.
   *
   * Pass `{ regenerateIDs: true }` to give every rule and group in the clone a new `id`, which
   * is useful when both queries will be used together (e.g. inserted into the same tree).
   */
  clone(options?: { regenerateIDs?: boolean }): QueryManager<RG, F, O, C> {
    const query = options?.regenerateIDs
      ? regenerateIDs(this.#query, { idGenerator: this.#idGenerator })
      : this.#query;
    return new QueryManager<RG, F, O, C>(query, this.#options);
  }

  // #endregion

  // #region Subscriptions

  /**
   * Registers a listener called after every change to the query, and returns a function that
   * unregisters it. Mutations that resolve to a no-op do not notify, and a
   * {@link QueryManager.batch batch} notifies once no matter how many changes it contains.
   *
   * Together with {@link QueryManager.getQuery}, this satisfies React's `useSyncExternalStore`
   * contract. Both methods are bound to the instance, so they are stable references across
   * renders and can be passed directly:
   *
   * ```ts
   * const query = useSyncExternalStore(q.subscribe, q.getQuery);
   * ```
   *
   * In React, prefer the `useQueryManager` hook from `react-querybuilder`, which wraps this.
   */
  subscribe = (listener: () => void): (() => void) => {
    this.#listeners.add(listener);
    return () => {
      this.#listeners.delete(listener);
    };
  };

  // #endregion

  // #region Batching

  /**
   * Runs `fn`, deferring history recording and subscriber notification until it returns. The
   * whole batch becomes a single undo step and triggers a single notification, or neither if
   * the query ends up unchanged.
   *
   * Batches may be nested; only the outermost one commits. If `fn` throws, the query and its
   * history are restored to their pre-batch state and the error propagates, so a batch either
   * applies completely or not at all.
   *
   * {@link QueryManager.undo}, {@link QueryManager.redo}, and {@link QueryManager.clearHistory}
   * may be called inside a batch; their notifications are deferred like everything else. Because
   * they manage the history stacks themselves, a batch containing one of them records no entry of
   * its own, leaving the stacks exactly as those methods left them.
   */
  batch(fn: () => void): this {
    this.#batchDepth++;
    if (this.#batchDepth === 1) {
      this.#batchSnapshot = {
        query: this.#query,
        past: [...this.#past],
        future: [...this.#future],
        lastSig: this.#lastSig,
        lastAt: this.#lastAt,
      };
    }

    try {
      fn();
    } catch (error) {
      // Only the outermost batch rolls back; `#batchDepth` has not been decremented yet.
      if (this.#batchDepth === 1) {
        const snapshot = this.#batchSnapshot!;
        // History is restored alongside the query because `undo`/`redo` may have run inside
        // the batch, which mutates the stacks directly.
        this.#query = snapshot.query;
        this.#past = snapshot.past;
        this.#future = snapshot.future;
        this.#lastSig = snapshot.lastSig;
        this.#lastAt = snapshot.lastAt;
      }
      throw error;
    } finally {
      this.#batchDepth--;

      if (this.#batchDepth === 0) {
        const { query: base } = this.#batchSnapshot!;
        this.#batchSnapshot = undefined;

        if (base !== this.#query) {
          // `undo`/`redo`/`clearHistory` already positioned the stacks deliberately; recording
          // here would duplicate the batch's own base entry and discard the redo stack.
          if (!this.#historyBypassed) this.#record(base, this.#query);
          this.#notify();
        }
        this.#historyBypassed = false;
      }
    }

    return this;
  }

  // #endregion

  // #region History

  /** Whether there is a previous query to restore. Always `false` unless `history` is enabled. */
  canUndo(): boolean {
    return this.#past.length > 0;
  }

  /** Whether there is an undone query to restore. Always `false` unless `history` is enabled. */
  canRedo(): boolean {
    return this.#future.length > 0;
  }

  /** Restores the previous query. No-op when {@link QueryManager.canUndo} is `false`. */
  undo(): this {
    if (this.#past.length === 0) return this;

    this.#future.unshift(this.#query);
    this.#query = this.#past.pop()!;
    // Prevent the next change from coalescing into the restored entry.
    this.#lastSig = undefined;
    this.#markHistoryBypassed();
    // Within a batch, the outermost call notifies once for everything.
    if (this.#batchDepth === 0) this.#notify();

    return this;
  }

  /** Restores the most recently undone query. No-op when {@link QueryManager.canRedo} is `false`. */
  redo(): this {
    if (this.#future.length === 0) return this;

    this.#past.push(this.#query);
    this.#query = this.#future.shift()!;
    this.#lastSig = undefined;
    this.#markHistoryBypassed();
    if (this.#batchDepth === 0) this.#notify();

    return this;
  }

  /** Discards all undo/redo history without changing the current query. */
  clearHistory(): this {
    this.#markHistoryBypassed();
    this.#past = [];
    this.#future = [];
    this.#lastSig = undefined;
    return this;
  }

  /**
   * The recorded history: `past` oldest first, `future` newest first. Both are copies, so
   * mutating them does not affect the manager.
   */
  getHistory(): { past: RG[]; future: RG[] } {
    return { past: [...this.#past], future: [...this.#future] };
  }

  // #endregion

  // #region Validation

  /**
   * Validates the current query with the configured validator.
   *
   * The result is cached until the query changes, so a custom `validator` with side effects (or
   * one that depends on anything other than the query) may run fewer times than expected.
   */
  validate(): boolean | ValidationMap {
    this.#ensureCache();
    this.#validation ??= this.#validator(this.#query);
    return this.#validation;
  }

  // #endregion

  // #region Formatting

  /** Generates a JSON string from the current query. */
  format(): string;
  /** Generates a result based on the provided rule group processor. */
  format<TResult = unknown>(
    options: FormatQueryOptions & { ruleGroupProcessor: RuleGroupProcessor<TResult> }
  ): TResult;
  /** Generates a {@link ParameterizedSQL} object from the current query. */
  format(
    options: 'parameterized' | (FormatQueryOptions & { format: 'parameterized' })
  ): ParameterizedSQL;
  /** Generates a {@link ParameterizedNamedSQL} object from the current query. */
  format(
    options: 'parameterized_named' | (FormatQueryOptions & { format: 'parameterized_named' })
  ): ParameterizedNamedSQL;
  /** Generates a JsonLogic object from the current query. */
  format(options: 'jsonlogic' | (FormatQueryOptions & { format: 'jsonlogic' })): RQBJsonLogic;
  /** Generates an ElasticSearch query object from the current query. */
  format(
    options: 'elasticsearch' | (FormatQueryOptions & { format: 'elasticsearch' })
    // oxlint-disable-next-line typescript/no-explicit-any
  ): Record<string, any>;
  /** Generates a MongoDB query object from the current query. */
  format(
    options: 'mongodb_query' | (FormatQueryOptions & { format: 'mongodb_query' })
    // oxlint-disable-next-line typescript/no-explicit-any
  ): Record<string, any>;
  /** Generates a Prisma ORM query object from the current query. */
  format(
    options: 'prisma' | (FormatQueryOptions & { format: 'prisma' })
    // oxlint-disable-next-line typescript/no-explicit-any
  ): Record<string, any>;
  /** Generates a Drizzle ORM query object from the current query. */
  format(
    options: 'drizzle' | (FormatQueryOptions & { format: 'drizzle' })
  ): ReturnType<typeof defaultRuleGroupProcessorDrizzle>;
  /** Generates a TanStack DB query object from the current query. */
  format(
    options: 'tanstack_db' | (FormatQueryOptions & { format: 'tanstack_db' })
  ): ReturnType<typeof defaultRuleGroupProcessorTanStackDB>;
  /** Generates a Sequelize ORM query object from the current query. */
  format(
    options: 'sequelize' | (FormatQueryOptions & { format: 'sequelize' })
  ): ReturnType<typeof defaultRuleGroupProcessorSequelize>;
  /** Generates a diagnostics result from the current query. */
  format(
    options: 'diagnostics' | (FormatQueryOptions & { format: 'diagnostics' })
  ): DiagnosticsResult;
  /** Generates a query string in the requested format. */
  format(options: Exclude<ExportFormat, ExportObjectFormats>): string;
  /** Generates a query string in the requested format. */
  format(
    options: FormatQueryOptions & { format: Exclude<ExportFormat, ExportObjectFormats> }
  ): string;
  /** Generates a query string in the requested format. */
  format(options: FormatQueryOptions): string;
  format(options?: FormatQueryOptions | ExportFormat): unknown {
    return formatQuery(this.#query, options as FormatQueryOptions);
  }

  // #endregion

  // #region Traversal

  /**
   * Yields every rule and group in the query, depth-first in pre-order, starting with the root
   * group itself. Combinator strings in independent-combinator groups are skipped.
   *
   * ```ts
   * for (const { node, path, parent } of qm.walk({ rulesOnly: true })) {
   *   console.log(path, node.field);
   * }
   * ```
   *
   * Traversal operates on the query as it was when iteration began, so mutating the manager
   * mid-iteration does not affect a walk already in progress. Because generators are lazy, that
   * happens on the first iteration step rather than when `walk` is called.
   *
   * @yields Every rule and group in the query, subject to `options`.
   */
  *walk(options: WalkOptions = {}): Generator<QueryNode<RG>> {
    const { from, rulesOnly, groupsOnly } = options;

    let start: RG | RuleType = this.#query;
    let startPath: Path = [];
    let startParent: RG | null = null;

    if (from !== undefined) {
      const path = this.#toPath(from);
      const node = path && findPath(path, this.#query);
      // An unresolvable path or `id` yields nothing rather than falling back to the root.
      if (!path || !node) return;
      start = node as RG | RuleType;
      startPath = path;
      startParent = path.length === 0 ? null : (findPath(getParentPath(path), this.#query) as RG);
    }

    for (const entry of this.#walkFrom(start, startPath, startParent)) {
      if (rulesOnly && isRuleGroup(entry.node)) continue;
      if (groupsOnly && !isRuleGroup(entry.node)) continue;
      yield entry;
    }
  }

  /** Yields every rule in the query. Shorthand for `walk({ ...options, rulesOnly: true })`. */
  rules(options: Omit<WalkOptions, 'rulesOnly' | 'groupsOnly'> = {}): Generator<QueryNode<RG>> {
    return this.walk({ ...options, rulesOnly: true });
  }

  /**
   * Yields every group in the query, including the root group. Shorthand for
   * `walk({ ...options, groupsOnly: true })`.
   */
  groups(options: Omit<WalkOptions, 'rulesOnly' | 'groupsOnly'> = {}): Generator<QueryNode<RG>> {
    return this.walk({ ...options, groupsOnly: true });
  }

  /** Returns the first node matching `predicate`, or `null` if there is none. */
  find(
    predicate: (entry: QueryNode<RG>) => boolean,
    options: WalkOptions = {}
  ): QueryNode<RG> | null {
    for (const entry of this.walk(options)) {
      if (predicate(entry)) return entry;
    }
    return null;
  }

  /** Returns every node matching `predicate`. */
  filter(predicate: (entry: QueryNode<RG>) => boolean, options: WalkOptions = {}): QueryNode<RG>[] {
    const results: QueryNode<RG>[] = [];
    for (const entry of this.walk(options)) {
      if (predicate(entry)) results.push(entry);
    }
    return results;
  }

  /** Equivalent to {@link QueryManager.walk} with no options, enabling `for...of` and spread. */
  [Symbol.iterator](): Generator<QueryNode<RG>> {
    return this.walk();
  }

  // #endregion

  // #region Path utilities

  /**
   * Returns the rule or group at the given path, or `null` if the path can't be resolved.
   *
   * Unlike the standalone {@link findPath}, which can return `undefined` for an out-of-range
   * index, unresolvable paths are always normalized to `null` here.
   */
  findPath(path: Path): FindPathReturnType {
    return findPath(path, this.#query) ?? null;
  }

  /**
   * Returns the rule or group with the given `id`, or `null` if there is none. Backed by an
   * index built once per query, so repeated lookups are constant time.
   */
  findID(id: string): FindPathReturnType {
    const path = this.#index().get(id);
    // A path from the index always resolves, so no normalization is needed here.
    return path === undefined ? null : findPath(path, this.#query);
  }

  /**
   * Returns the {@link Path} of the rule or group with the given `id`, or `null` if there is
   * none. Backed by an index built once per query, so repeated lookups are constant time.
   */
  getPathOfID(id: string): Path | null {
    return this.#index().get(id) ?? null;
  }

  /**
   * Determines whether the rule or group at the given path is disabled, either itself or by an
   * ancestor group.
   */
  pathIsDisabled(path: Path): boolean {
    return pathIsDisabled(path, this.#query);
  }

  /** Returns the rule or group at the given path or `id`, or `null` if it can't be resolved. */
  getNode(pathOrID: Path | string): FindPathReturnType {
    const path = this.#toPath(pathOrID);
    return path === null ? null : (findPath(path, this.#query) ?? null);
  }

  /**
   * Returns the rule at the given path or `id`, or `null` if it can't be resolved _or_ resolves
   * to a group.
   */
  getRule(pathOrID: Path | string): RuleType | null {
    const node = this.getNode(pathOrID);
    return node && !isRuleGroup(node) ? node : null;
  }

  /**
   * Returns the group at the given path or `id`, or `null` if it can't be resolved _or_
   * resolves to a rule.
   */
  getGroup(pathOrID: Path | string): RG | null {
    const node = this.getNode(pathOrID);
    return node && isRuleGroup(node) ? (node as RG) : null;
  }

  /**
   * Returns the group containing the rule or group at the given path or `id`. Returns `null`
   * for the root group, which has no parent, and when the target can't be resolved.
   */
  getParent(pathOrID: Path | string): RG | null {
    const path = this.#toPath(pathOrID);
    if (path === null || path.length === 0) return null;
    // Confirm the target itself exists, so a bogus path doesn't return a real parent.
    if (!findPath(path, this.#query)) return null;
    // An existing non-root node always has a parent group.
    return findPath(getParentPath(path), this.#query) as RG;
  }

  // #endregion

  // #region Rule configuration

  /**
   * The normalized field list, as the `QueryBuilder` component would render it. Needed to
   * populate a field selector.
   */
  getFields(): FullOptionList<F> {
    return this.#fields;
  }

  /**
   * The normalized combinator list, as the `QueryBuilder` component would render it. Needed to
   * populate a combinator selector.
   */
  getCombinators(): FullOptionList<C> {
    return this.#combinators;
  }

  /**
   * The field configuration for a field name. When the field isn't configured, returns the same
   * minimal fallback (`{ name, value, label }`, all set to the field name) that
   * {@link QueryManager.getRuleContext} reports as `fieldData`, so both access paths agree.
   */
  getFieldData(field: string): F {
    return getFieldData(field, this.#fieldMap) as F;
  }

  /** The operator list for a field, mirroring `QueryBuilder`'s precedence. */
  getOperators(field: string): FullOptionList<O> {
    return this.#operatorsFor(field);
  }

  /** The value sources available for a field/operator pair. */
  getValueSources(field: string, operator: string): ValueSourceFullOptions {
    return this.#valueSourcesFor(field, operator);
  }

  /** The match modes available for a field. */
  getMatchModes(field: string): MatchModeOptions {
    return this.#matchModesFor(field);
  }

  /** The value option list for a field/operator pair. */
  getValues(field: string, operator: string): FullOptionList<Option> {
    return this.#valuesFor(field, operator);
  }

  /** The value editor type for a field/operator pair. */
  getValueEditorType(field: string, operator: string): ValueEditorType {
    return this.#valueEditorTypeFor(field, operator);
  }

  /**
   * Resolves everything about a rule that depends on the field/operator configuration—field data,
   * operators, value editor type, value list, value sources, match modes, and validation result.
   * Returns `null` when the target can't be resolved or isn't a rule.
   *
   * This is the same derivation the `useRule` hook performs, so a non-React implementation can
   * render a rule without reimplementing the configuration precedence rules.
   */
  getRuleContext(pathOrID: Path | string): RuleContext<F> | null {
    const rule = this.getRule(pathOrID);
    if (!rule) return null;

    const validation = this.validate();

    return deriveRuleContext<F>(
      rule,
      {
        fields: this.#fields as OptionList<F>,
        fieldMap: this.#fieldMap,
        getInputType: (f: string, o: string, misc: { fieldData: F }) =>
          this.#options.getInputType?.(f, o, misc) ?? null,
        getMatchModes: (f: string) => this.#matchModesFor(f),
        getOperators: (f: string) => this.#operatorsFor(f),
        getParameters: (f: string, o: string, misc: { fieldData: F }) =>
          this.#parametersFor(f, o, misc),
        getValueEditorType: (f: string, o: string) => this.#valueEditorTypeFor(f, o),
        getValues: (f: string, o: string) => this.#valuesFor(f, o),
        getValueSources: (f: string, o: string) => this.getValueSources(f, o),
        getSubQueryBuilderProps: (f: string, misc: { fieldData: F }) =>
          this.#options.getSubQueryBuilderProps?.(f, misc) ?? {},
      },
      {
        validationMap: typeof validation === 'boolean' ? {} : validation,
        id: rule.id,
      }
    );
  }

  /**
   * Resolves everything about a rule group that depends on the combinator configuration, plus its
   * validation result. Returns `null` when the target can't be resolved or isn't a group.
   *
   * This is the same derivation the `useRuleGroup` hook performs.
   */
  getRuleGroupContext(pathOrID: Path | string = []): RuleGroupContext<C> | null {
    const ruleGroup = this.getGroup(pathOrID);
    if (!ruleGroup) return null;

    const validation = this.validate();

    return deriveRuleGroupContext<C>(ruleGroup, this.#combinators, {
      validationMap: typeof validation === 'boolean' ? {} : validation,
      id: ruleGroup.id,
    });
  }

  // #endregion

  // #region Query inspection

  /** Whether the current query uses independent combinators. */
  isIC(): boolean {
    return isRuleGroupTypeIC(this.#query);
  }

  /**
   * Returns the signature describing how the current query differs from `other`, as used by
   * this manager's history coalescing.
   */
  signatureOf(other: RuleGroupTypeAny): string {
    return signatureOf(this.#query, other);
  }

  /** Generates a {@link DiagnosticsResult}. Shorthand for `format('diagnostics')`. */
  diagnostics(): DiagnosticsResult {
    return formatQuery(this.#query, 'diagnostics');
  }

  /**
   * Returns the current query, so `JSON.stringify(queryManager)` produces the same output as
   * `JSON.stringify(queryManager.getQuery())`.
   */
  toJSON(): RG {
    return this.#query;
  }

  // #endregion

  // #region Transforms

  /**
   * Returns a new manager with the same configuration and the current query converted to use
   * independent combinators. Idempotent, and never modifies this manager. As with
   * {@link QueryManager.clone}, subscribers and history are not carried over.
   */
  toIC(): QueryManager<AsRuleGroup<ToRuleGroupTypeIC<RG>>, F, O, C> {
    return new QueryManager(
      convertToIC(this.#query) as AsRuleGroup<ToRuleGroupTypeIC<RG>>,
      this.#options
    );
  }

  /**
   * Returns a new manager with the same configuration and the current query converted to use a
   * single combinator per group. Idempotent, and never modifies this manager. As with
   * {@link QueryManager.clone}, subscribers and history are not carried over.
   */
  fromIC(): QueryManager<AsRuleGroup<ToRuleGroupType<RG>>, F, O, C> {
    return new QueryManager(
      convertFromIC(this.#query) as AsRuleGroup<ToRuleGroupType<RG>>,
      this.#options
    );
  }

  /**
   * Runs {@link transformQuery} against the current query and returns its result.
   *
   * Unlike {@link QueryManager.toIC}/{@link QueryManager.fromIC}, this returns the raw
   * transformed value rather than a new manager, since `transformQuery` can produce arbitrary
   * shapes that are no longer valid queries. This manager is never modified.
   */
  // oxlint-disable-next-line typescript/no-explicit-any, typescript/no-unnecessary-type-parameters
  transform<T = any>(options?: TransformQueryOptions<RG>): T {
    // oxlint-disable-next-line typescript/no-explicit-any
    return (transformQuery as any)(this.#query, options);
  }

  // #endregion
}
