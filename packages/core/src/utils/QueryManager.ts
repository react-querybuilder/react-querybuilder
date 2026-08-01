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
  UpdateableProperties,
  UpdateValueMap,
  ValidationMap,
  ValueEditorType,
  ValueSourceFlexibleOptions,
  ValueSources,
} from '../types';
import { defaultValidator } from './defaultValidator';
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
import { getFirstOption, prepareOptionList } from './optGroupUtils';
import { prepareRuleGroup } from './prepareQueryObjects';
import type {
  AbortInfo,
  AbortReason,
  AddOptions,
  GroupOptions,
  InsertOptions,
  MoveOptions,
  RemoveOptions,
  UpdateOptions,
} from './queryTools';
import { add, group, insert, move, remove, update } from './queryTools';
import { regenerateIDs } from './regenerateIDs';
import { signatureOf, structuralSignature, unchangedSignature } from './signature';

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

  constructor(query?: RG, options: QueryManagerOptions<F, O, C> = {}) {
    this.#options = options;
    this.#idGenerator = options.idGenerator ?? generateID;
    this.#validator = options.validator ?? defaultValidator;
    this.#strict = options.strict ?? false;
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
    this.#fields = fields;
    this.#fieldMap = fieldMap;

    this.#operators = prepareOptionList<O>({
      optionList: (options.operators ?? defaultOperators) as FlexibleOptionListProp<O>,
      baseOption: options.baseOperator,
      labelMap: defaultOperatorLabelMap,
      autoSelectOption: options.autoSelectOperator,
    }).optionList;

    this.#combinators = prepareOptionList<C>({
      optionList: (options.combinators ?? defaultCombinators) as FlexibleOptionListProp<C>,
      baseOption: options.baseCombinator,
    }).optionList;

    this.#query = query
      ? prepareRuleGroup(query, { idGenerator: this.#idGenerator })
      : this.createRuleGroup();
  }

  // #region Internal resolution

  /** Resolves the field configuration for a field name. */
  #fieldData(field: string): F {
    return (this.#fieldMap[field] ?? {}) as F;
  }

  /** Resolves the operator list for a field, mirroring `QueryBuilder`'s precedence. */
  #operatorsFor(field: string): FullOptionList<O> {
    const fieldData = this.#fieldData(field);
    return prepareOptionList<O>({
      optionList: (fieldData?.operators ??
        this.#options.getOperators?.(field, { fieldData }) ??
        this.#operators) as FlexibleOptionListProp<O>,
      baseOption: this.#options.baseOperator,
      labelMap: defaultOperatorLabelMap,
      autoSelectOption: this.#options.autoSelectOperator,
    }).optionList;
  }

  /** Resolves the default operator for a field, mirroring `QueryBuilder`'s precedence. */
  #defaultOperator(field: string): string {
    const fieldData = this.#fieldData(field);

    if (fieldData?.defaultOperator) return fieldData.defaultOperator;

    const { getDefaultOperator } = this.#options;
    if (getDefaultOperator) {
      return typeof getDefaultOperator === 'function'
        ? getDefaultOperator(field, { fieldData })
        : getDefaultOperator;
    }

    return getFirstOption(this.#operatorsFor(field)) ?? '';
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
    const fieldData = this.#fieldData(field);
    return prepareOptionList<FullOption>({
      optionList:
        fieldData?.values ?? this.#options.getValues?.(field, operator, { fieldData }) ?? [],
      autoSelectOption: this.#options.autoSelectValue,
    }).optionList;
  }

  #valueEditorTypeFor(field: string, operator: string): ValueEditorType {
    const fieldData = this.#fieldData(field);

    if (fieldData?.valueEditorType) {
      return typeof fieldData.valueEditorType === 'function'
        ? fieldData.valueEditorType(operator)
        : fieldData.valueEditorType;
    }

    return this.#options.getValueEditorType?.(field, operator, { fieldData }) ?? 'text';
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
      getParameters:
        getParameters &&
        ((f, o, misc) =>
          prepareOptionList<FullOption>({
            optionList: getParameters(f, o, misc) ?? [],
            autoSelectOption: this.#options.autoSelectValue,
          }).optionList),
    });
  }

  /** Defaults shared by every mutating method, overridable per call. */
  #toolOptions() {
    return { combinators: this.#combinators, idGenerator: this.#idGenerator };
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

  // #endregion

  // #region State access

  /**
   * The current query. The returned object is frozen and structurally shared, so it is safe to
   * retain and compare by reference to detect changes.
   */
  getQuery(): RG {
    return this.#query;
  }

  /** Replaces the current query, ensuring every rule and group has an `id`. */
  setQuery(query: RG): this {
    this.#commit(prepareRuleGroup(query, { idGenerator: this.#idGenerator }));
    return this;
  }

  // #endregion

  // #region Factories

  /**
   * Creates a rule using the configured fields, operators, and defaults. The rule is not added
   * to the query—pass it to {@link QueryManager.add} or {@link QueryManager.insert}.
   */
  createRule(): RuleType {
    const { getDefaultField } = this.#options;

    let field: string = getFirstOption(this.#fields) ?? '';
    if (getDefaultField) {
      field =
        typeof getDefaultField === 'function' ? getDefaultField(this.#fields) : getDefaultField;
    }

    const operator = this.#defaultOperator(field);
    const valueSource = getFirstOption(this.#valueSourcesFor(field, operator)) ?? 'value';
    const matchMode = getFirstOption(this.#matchModesFor(field));

    const newRule: RuleType = {
      id: this.#idGenerator(),
      field,
      operator,
      valueSource,
      value: '',
      ...(matchMode ? { match: { mode: matchMode, threshold: 1 } } : null),
    };

    return { ...newRule, value: this.#defaultValue(newRule) };
  }

  /**
   * Creates a group. Pass `true` for a group with independent combinators. The group is not
   * added to the query—pass it to {@link QueryManager.add} or {@link QueryManager.insert}.
   */
  createRuleGroup(independentCombinators?: boolean): RG {
    const rules = this.#options.addRuleToNewGroups ? [this.createRule()] : [];

    if (independentCombinators) {
      return { id: this.#idGenerator(), rules, not: false } as unknown as RG;
    }

    return {
      id: this.#idGenerator(),
      rules,
      combinator: getFirstOption(this.#combinators) ?? '',
      not: false,
    } as unknown as RG;
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
   * contract. This method is bound to the instance, so it is a stable reference across renders:
   *
   * ```ts
   * const query = useSyncExternalStore(q.subscribe, () => q.getQuery());
   * ```
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
          this.#record(base, this.#query);
          this.#notify();
        }
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
    if (this.#batchDepth === 0) this.#notify();

    return this;
  }

  /** Discards all undo/redo history without changing the current query. */
  clearHistory(): this {
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

  /** Validates the current query with the configured validator. */
  validate(): boolean | ValidationMap {
    return this.#validator(this.#query);
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
}
