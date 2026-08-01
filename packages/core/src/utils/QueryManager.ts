import { defaultCombinators, defaultOperatorLabelMap, defaultOperators } from '../defaults';
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
  AddOptions,
  GroupOptions,
  InsertOptions,
  MoveOptions,
  UpdateOptions,
} from './queryTools';
import { add, group, insert, move, remove, update } from './queryTools';

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
  /** Validates the query. Defaults to {@link defaultValidator}. */
  validator?: QueryValidator;
  /** Generates `id` properties for new rules and groups. Defaults to {@link generateID}. */
  idGenerator?: () => string;
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
 * resolved (including attempts to remove the root group). Nothing is thrown; compare
 * {@link QueryManager.getQuery} by reference to detect whether a call had any effect.
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

  constructor(query?: RG, options: QueryManagerOptions<F, O, C> = {}) {
    this.#options = options;
    this.#idGenerator = options.idGenerator ?? generateID;
    this.#validator = options.validator ?? defaultValidator;

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

  /** Defaults for {@link update}, so resets mirror `QueryBuilder`'s behavior. */
  #updateOptions(): UpdateOptions {
    return {
      getRuleDefaultOperator: f => this.#defaultOperator(f),
      getRuleDefaultValue: r => this.#defaultValue(r),
      getValueSources: (f, o) => this.#valueSourcesFor(f, o),
      getMatchModes: f => this.#matchModesFor(f),
    };
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
    this.#query = prepareRuleGroup(query, { idGenerator: this.#idGenerator });
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
  add(ruleOrGroup: RG | RuleType, parentPathOrID: Path | string = [], options?: AddOptions): this {
    this.#query = add(this.#query, ruleOrGroup, parentPathOrID, {
      ...this.#toolOptions(),
      ...options,
    });
    return this;
  }

  /** Removes the rule or group at the given path or `id`. The root group cannot be removed. */
  remove(pathOrID: Path | string): this {
    this.#query = remove(this.#query, pathOrID);
    return this;
  }

  /** Updates a single property of the rule or group at the given path or `id`. */
  update(
    prop: UpdateableProperties,
    value: unknown,
    pathOrID: Path | string,
    options?: UpdateOptions
  ): this;
  /** Updates multiple properties using parallel arrays of names and values. */
  update(
    props: UpdateableProperties[],
    values: unknown[],
    pathOrID: Path | string,
    options?: UpdateOptions
  ): this;
  /** Updates multiple properties using a map of names to values. */
  update(props: UpdateValueMap, pathOrID: Path | string, options?: UpdateOptions): this;
  update(a: unknown, b?: unknown, c?: unknown, d?: unknown): this {
    // The property map form shifts `pathOrID` and `options` one position earlier.
    const optionsIndex = typeof a === 'string' || Array.isArray(a) ? 3 : 2;
    const args = [a, b, c, d];
    args[optionsIndex] = { ...this.#updateOptions(), ...(args[optionsIndex] as UpdateOptions) };

    // oxlint-disable-next-line typescript/no-explicit-any
    this.#query = (update as any)(this.#query, ...args.slice(0, optionsIndex + 1));
    return this;
  }

  /** Moves the rule or group at `oldPathOrID` to `newPath`, or shifts it `'up'`/`'down'`. */
  move(oldPathOrID: Path | string, newPath: Path | 'up' | 'down', options?: MoveOptions): this {
    this.#query = move(this.#query, oldPathOrID, newPath, {
      ...this.#toolOptions(),
      ...options,
    });
    return this;
  }

  /**
   * Inserts a rule or group at the given path. Unlike the other methods, this accepts a path
   * only—inserting _at_ an `id` would be ambiguous.
   */
  insert(ruleOrGroup: RG | RuleType, path: Path, options?: InsertOptions): this {
    this.#query = insert(this.#query, ruleOrGroup, path, {
      ...this.#toolOptions(),
      ...options,
    });
    return this;
  }

  /**
   * Creates a new group at `targetPathOrID` containing the rules/groups currently at
   * `targetPathOrID` and `sourcePathOrID`.
   */
  group(
    sourcePathOrID: Path | string,
    targetPathOrID: Path | string,
    options?: GroupOptions
  ): this {
    this.#query = group(this.#query, sourcePathOrID, targetPathOrID, {
      ...this.#toolOptions(),
      ...options,
    });
    return this;
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
