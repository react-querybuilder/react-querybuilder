import type {
  ComponentType,
  ForwardRefExoticComponent,
  MouseEvent as ReactMouseEvent,
  ReactNode,
  Ref,
  RefAttributes,
} from 'react';
import type {
  Classname,
  Combinator,
  Field,
  Operator,
  OptionList,
  ParseNumbersMethod,
  Path,
  ValueEditorType,
  ValueSource,
  ValueSources,
} from './basic';
import type { DropEffect } from './dnd';
import type {
  Classnames,
  CombinatorSelectorProps,
  CommonRuleSubComponentProps,
  CommonSubComponentProps,
  FieldSelectorProps,
  OperatorSelectorProps,
  QueryActions,
  SelectorOrEditorProps,
  Translation,
  Translations,
  ValueSelectorProps,
  ValueSourceSelectorProps,
} from './props';
import type { RuleGroupType, RuleType } from './ruleGroups';
import type { RuleGroupTypeAny, RuleGroupTypeIC, RuleOrGroupArray } from './ruleGroupsIC';
import type { QueryValidator, ValidationMap } from './validation';

/**
 * A translation for a component with `title` and `label`.
 */
export interface TranslationWithLabel extends Translation {
  label?: ReactNode;
}
/**
 * Props passed to every action component (rendered as `<button>` by default).
 */
export interface ActionProps extends CommonSubComponentProps {
  /** Visible text. */
  label?: ReactNode;
  /** Call this function to trigger the action. */
  handleOnClick(e: ReactMouseEvent): void;
  /**
   * Translation which overrides the regular `label`/`title` props when
   * the element is disabled.
   */
  disabledTranslation?: TranslationWithLabel;
  /**
   * The {@link RuleType} or {@link RuleGroupType}/{@link RuleGroupTypeIC}
   * associated with this element.
   */
  ruleOrGroup: RuleGroupTypeAny | RuleType;
}

/**
 * Props passed to every group action component.
 */
export interface ActionWithRulesProps extends ActionProps {
  /**
   * Rules already present for this group.
   */
  rules?: RuleOrGroupArray;
}

/**
 * Props passed to every action component that adds a rule or group.
 */
export interface ActionWithRulesAndAddersProps extends ActionWithRulesProps {
  /**
   * Triggers the addition of a new rule or group. The second parameter will
   * be forwarded to the `onAddRule` or `onAddGroup` callback, appropriately.
   */
  handleOnClick(e: ReactMouseEvent, context?: any): void;
}

/**
 * Props for `notToggle` components.
 */
export interface NotToggleProps extends CommonSubComponentProps {
  checked?: boolean;
  handleOnChange(checked: boolean): void;
  label?: ReactNode;
  ruleGroup: RuleGroupTypeAny;
}

/**
 * Props passed to `shiftActions` components.
 */
export interface ShiftActionsProps extends CommonSubComponentProps {
  /**
   * Visible text for "shift up"/"shift down" elements.
   */
  labels?: { shiftUp?: ReactNode; shiftDown?: ReactNode };
  /**
   * Tooltips for "shift up"/"shift down" elements.
   */
  titles?: { shiftUp?: string; shiftDown?: string };
  /**
   * The {@link RuleType} or {@link RuleGroupType}/{@link RuleGroupTypeIC}
   * associated with this element.
   */
  ruleOrGroup: RuleGroupTypeAny | RuleType;
  /**
   * Whether this rule or group is the last of its siblings.
   */
  lastInGroup?: boolean;
}

/**
 * Props for `dragHandle` components.
 */
export interface DragHandleProps extends CommonSubComponentProps {
  label?: ReactNode;
  ruleOrGroup: RuleGroupTypeAny | RuleType;
}

/**
 * Props passed to `inlineCombinator` components.
 */
export interface InlineCombinatorProps extends CombinatorSelectorProps {
  component: Schema['controls']['combinatorSelector'];
  independentCombinators?: boolean;
}

/**
 * Props passed to `valueEditor` components.
 */
export interface ValueEditorProps<F extends Field = Field, O extends string = string>
  extends SelectorOrEditorProps,
    CommonRuleSubComponentProps {
  field: F['name'];
  operator: O;
  value?: any;
  valueSource: ValueSource;
  /** The entire {@link Field} object. */
  fieldData: F;
  type?: ValueEditorType;
  inputType?: string | null;
  values?: any[];
  listsAsArrays?: boolean;
  parseNumbers?: ParseNumbersMethod;
  separator?: ReactNode;
  selectorComponent?: ComponentType<ValueSelectorProps>;
  /**
   * Only pass `true` if the {@link useValueEditor} hook has already run
   * in a parent/ancestor component. See usage in the compatibility packages.
   */
  skipHook?: boolean;
}

/**
 * All subcomponent types.
 */
export interface Controls {
  addGroupAction: ComponentType<ActionWithRulesAndAddersProps>;
  addRuleAction: ComponentType<ActionWithRulesAndAddersProps>;
  cloneGroupAction: ComponentType<ActionWithRulesProps>;
  cloneRuleAction: ComponentType<ActionProps>;
  combinatorSelector: ComponentType<CombinatorSelectorProps>;
  inlineCombinator: ComponentType<InlineCombinatorProps>;
  shiftActions: ComponentType<ShiftActionsProps>;
  dragHandle: ForwardRefExoticComponent<DragHandleProps & RefAttributes<any>>;
  fieldSelector: ComponentType<FieldSelectorProps>;
  notToggle: ComponentType<NotToggleProps>;
  operatorSelector: ComponentType<OperatorSelectorProps>;
  lockRuleAction: ComponentType<ActionWithRulesProps>;
  lockGroupAction: ComponentType<ActionWithRulesProps>;
  removeGroupAction: ComponentType<ActionWithRulesProps>;
  removeRuleAction: ComponentType<ActionProps>;
  rule: ComponentType<RuleProps>;
  ruleGroup: ComponentType<RuleGroupProps>;
  valueEditor: ComponentType<ValueEditorProps>;
  valueSourceSelector: ComponentType<ValueSourceSelectorProps>;
}

/**
 * Configuration options passed in the `schema` prop from
 * {@link QueryBuilder} to each subcomponent.
 */
export interface Schema {
  qbId: string;
  fields: OptionList<Field>;
  fieldMap: Record<string, Field>;
  classNames: Classnames;
  combinators: OptionList<Combinator>;
  controls: Controls;
  createRule(): RuleType;
  createRuleGroup(): RuleGroupTypeAny;
  dispatchQuery(query: RuleGroupTypeAny): void;
  getQuery(): RuleGroupTypeAny | undefined;
  getOperators(field: string, meta: { fieldData: Field }): OptionList<Operator>;
  getValueEditorType(field: string, operator: string, meta: { fieldData: Field }): ValueEditorType;
  getValueEditorSeparator(field: string, operator: string, meta: { fieldData: Field }): ReactNode;
  getValueSources(field: string, operator: string, meta: { fieldData: Field }): ValueSources;
  getInputType(field: string, operator: string, meta: { fieldData: Field }): string | null;
  getValues(field: string, operator: string, meta: { fieldData: Field }): OptionList;
  getRuleClassname(rule: RuleType, misc: { fieldData: Field }): Classname;
  getRuleGroupClassname(ruleGroup: RuleGroupTypeAny): Classname;
  accessibleDescriptionGenerator: (props: { path: Path; qbId: string }) => string;
  showCombinatorsBetweenRules: boolean;
  showNotToggle: boolean;
  showShiftActions: boolean;
  showCloneButtons: boolean;
  showLockButtons: boolean;
  autoSelectField: boolean;
  autoSelectOperator: boolean;
  addRuleToNewGroups: boolean;
  enableDragAndDrop: boolean;
  validationMap: ValidationMap;
  independentCombinators: boolean;
  listsAsArrays: boolean;
  parseNumbers: ParseNumbersMethod;
  disabledPaths: Path[];
}

/**
 * Common props between {@link Rule} and {@link RuleGroup}.
 */
interface CommonRuleAndGroupProps {
  id?: string;
  path: Path;
  parentDisabled?: boolean;
  translations: Translations;
  schema: Schema;
  actions: QueryActions;
  disabled?: boolean;
  context?: any;
  lastInGroup?: boolean;
}

/**
 * Return type of {@link useRuleGroupDnD} hook.
 */
export interface UseRuleGroupDnD {
  isDragging: boolean;
  dragMonitorId: string | symbol;
  isOver: boolean;
  dropMonitorId: string | symbol;
  previewRef: Ref<HTMLDivElement>;
  dragRef: Ref<HTMLSpanElement>;
  dropRef: Ref<HTMLDivElement>;
  /** `"move"` by default; `"copy"` if the modifier key is pressed. */
  dropEffect?: DropEffect;
}

/**
 * {@link RuleGroup} props.
 */
export interface RuleGroupProps extends CommonRuleAndGroupProps, Partial<UseRuleGroupDnD> {
  ruleGroup: RuleGroupTypeAny;
  /**
   * @deprecated Use the `combinator` property of the `ruleGroup` prop instead
   */
  combinator?: string;
  /**
   * @deprecated Use the `rules` property of the `ruleGroup` prop instead
   */
  rules?: RuleOrGroupArray;
  /**
   * @deprecated Use the `not` property of the `ruleGroup` prop instead
   */
  not?: boolean;
}

/**
 * Return type of {@link useRuleDnD} hook.
 */
export interface UseRuleDnD {
  isDragging: boolean;
  dragMonitorId: string | symbol;
  isOver: boolean;
  dropMonitorId: string | symbol;
  dragRef: Ref<HTMLSpanElement>;
  dndRef: Ref<HTMLDivElement>;
  /** `"move"` by default; `"copy"` if the modifier key is pressed. */
  dropEffect?: DropEffect;
}

/**
 * {@link Rule} props.
 */
export interface RuleProps extends CommonRuleAndGroupProps, Partial<UseRuleDnD> {
  rule: RuleType;
  /**
   * @deprecated Use the `field` property of the `rule` prop instead
   */
  field?: string;
  /**
   * @deprecated Use the `operator` property of the `rule` prop instead
   */
  operator?: string;
  /**
   * @deprecated Use the `value` property of the `rule` prop instead
   */
  value?: any;
  /**
   * @deprecated Use the `valueSource` property of the `rule` prop instead
   */
  valueSource?: ValueSource;
}

/**
 * Props passed down through context from a {@link QueryBuilderContextProvider}.
 */
export interface QueryBuilderContextProps {
  /**
   * Defines replacement components.
   */
  controlElements?: Partial<Controls>;
  /**
   * Set to `false` to avoid calling the `onQueryChange` callback
   * when the component mounts.
   *
   * @default true
   */
  enableMountQueryChange?: boolean;
  /**
   * This can be used to assign specific CSS classes to various controls
   * that are rendered by {@link QueryBuilder}.
   */
  controlClassnames?: Partial<Classnames>;
  /**
   * This can be used to override translatable texts applied to the various
   * controls that are rendered by {@link QueryBuilder}.
   */
  translations?: Partial<Translations>;
  /**
   * Enables drag-and-drop features.
   *
   * @default false
   */
  enableDragAndDrop?: boolean;
  /**
   * Enables debug logging for {@link QueryBuilder} (and React DnD when applicable).
   *
   * @default false
   */
  debugMode?: boolean;
}

export type QueryBuilderContextProviderProps = QueryBuilderContextProps & {
  children?: ReactNode;
};
export type QueryBuilderContextProvider<ExtraProps extends object = Record<string, any>> =
  ComponentType<QueryBuilderContextProviderProps & ExtraProps>;

type QueryBuilderPropsBase<RG extends RuleGroupType | RuleGroupTypeIC> = (RG extends {
  combinator: string;
}
  ? {
      independentCombinators?: false;
    }
  : {
      /**
       * Enables independent {@link Combinator} (and/or/xor) configuration between rules
       * instead of at the group level.
       *
       * @see {@link RuleGroupTypeIC}
       */
      independentCombinators: true;
    }) &
  QueryBuilderContextProps & {
    /**
     * Each log object will be passed to this function when `debugMode` is `true`.
     *
     * @default console.log
     */
    onLog?(obj: any): void;
    /**
     * List of valid {@link Field}s.
     *
     * @default []
     */
    fields?: OptionList<Field> | Record<string, Field>;
    /**
     * List of valid {@link Operator}s.
     *
     * @see {@link DefaultOperatorName}
     *
     * @default
     * [
     *   { name: '=', label: '=' },
     *   { name: '!=', label: '!=' },
     *   { name: '<', label: '<' },
     *   { name: '>', label: '>' },
     *   { name: '<=', label: '<=' },
     *   { name: '>=', label: '>=' },
     *   { name: 'contains', label: 'contains' },
     *   { name: 'beginsWith', label: 'begins with' },
     *   { name: 'endsWith', label: 'ends with' },
     *   { name: 'doesNotContain', label: 'does not contain' },
     *   { name: 'doesNotBeginWith', label: 'does not begin with' },
     *   { name: 'doesNotEndWith', label: 'does not end with' },
     *   { name: 'null', label: 'is null' },
     *   { name: 'notNull', label: 'is not null' },
     *   { name: 'in', label: 'in' },
     *   { name: 'notIn', label: 'not in' },
     *   { name: 'between', label: 'between' },
     *   { name: 'notBetween', label: 'not between' },
     * ]
     */
    operators?: OptionList<Operator>;
    /**
     * List of valid {@link Combinator}s.
     *
     * @see {@link DefaultCombinatorName}
     *
     * @default
     * [
     *   {name: 'and', label: 'AND'},
     *   {name: 'or', label: 'OR'},
     * ]
     */
    combinators?: OptionList<Combinator>;
    /**
     * The default `field` value for new rules. This can be the field `name`
     * itself or a function that returns a valid {@link Field} `name` given
     * the `fields` list.
     */
    getDefaultField?: string | ((fieldsData: OptionList<Field>) => string);
    /**
     * The default `operator` value for new rules. This can be the operator
     * `name` or a function that returns a valid {@link Operator} `name` for
     * a given field name.
     */
    getDefaultOperator?: string | ((field: string, misc: { fieldData: Field }) => string);
    /**
     * Returns the default `value` for new rules.
     */
    getDefaultValue?(rule: RuleType, misc: { fieldData: Field }): any;
    /**
     * This function should return the list of allowed {@link Operator}s
     * for the given {@link Field} `name`. If `null` is returned, the
     * {@link DefaultOperator}s are used.
     */
    getOperators?(field: string, misc: { fieldData: Field }): OptionList<Operator> | null;
    /**
     * This function should return the type of {@link ValueEditor} (see
     * {@link ValueEditorType}) for the given field `name` and operator `name`.
     */
    getValueEditorType?(
      field: string,
      operator: string,
      misc: { fieldData: Field }
    ): ValueEditorType;
    /**
     * This function should return the separator element for a given field
     * `name` and operator `name`. The element can be any valid React element,
     * including a bare string (e.g., "and" or "to") or an HTML element like
     * `<span />`. It will be placed in between value editors when multiple
     * editors are rendered, such as when the `operator` is `"between"`.
     */
    getValueEditorSeparator?(
      field: string,
      operator: string,
      misc: { fieldData: Field }
    ): ReactNode;
    /**
     * This function should return the list of valid {@link ValueSources}
     * for a given field `name` and operator `name`. The return value must
     * be an array that includes at least one valid {@link ValueSource}
     * (i.e. `["value"]`, `["field"]`, `["value", "field"]`, or
     * `["field", "value"]`).
     */
    getValueSources?(field: string, operator: string, misc: { fieldData: Field }): ValueSources;
    /**
     * This function should return the `type` of `<input />`
     * for the given field `name` and operator `name` (only applicable when
     * `getValueEditorType` returns `"text"` or a falsy value). If no
     * function is provided, `"text"` is used as the default.
     */
    getInputType?(field: string, operator: string, misc: { fieldData: Field }): string | null;
    /**
     * This function should return the list of allowed values for the
     * given field `name` and operator `name` (only applicable when
     * `getValueEditorType` returns `"select"` or `"radio"`). If no
     * function is provided, an empty array is used as the default.
     */
    getValues?(field: string, operator: string, misc: { fieldData: Field }): OptionList;
    /**
     * The return value of this function will be used to apply classnames to the
     * outer `<div>` of the given {@link Rule}.
     */
    getRuleClassname?(rule: RuleType, misc: { fieldData: Field }): Classname;
    /**
     * The return value of this function will be used to apply classnames to the
     * outer `<div>` of the given {@link RuleGroup}.
     */
    getRuleGroupClassname?(ruleGroup: RG): Classname;
    /**
     * This callback is invoked before a new rule is added. The function should either manipulate
     * the rule and return the new object, or return `false` to cancel the addition of the rule.
     */
    onAddRule?(rule: RuleType, parentPath: Path, query: RG, context?: any): RuleType | false;
    /**
     * This callback is invoked before a new group is added. The function should either manipulate
     * the group and return the new object, or return `false` to cancel the addition of the group.
     */
    onAddGroup?(ruleGroup: RG, parentPath: Path, query: RG, context?: any): RG | false;
    /**
     * This callback is invoked before a rule or group is removed. The function should return
     * `true` if the rule or group should be removed or `false` if it should not be removed.
     */
    onRemove?(ruleOrGroup: RuleType | RG, path: Path, query: RG, context?: any): boolean;
    /**
     * This callback is invoked anytime the query state is updated.
     */
    onQueryChange?(query: RG): void;
    /**
     * Show group combinator selectors in the body of the group, between each child rule/group,
     * instead of in the group header.
     *
     * @default false
     */
    showCombinatorsBetweenRules?: boolean;
    /**
     * Show the "not" (aka inversion) toggle for rule groups.
     *
     * @default false
     */
    showNotToggle?: boolean;
    /**
     * Show the "Shift up"/"Shift down" actions.
     *
     * @default false
     */
    showShiftActions?: boolean;
    /**
     * Show the "Clone rule" and "Clone group" buttons.
     *
     * @default false
     */
    showCloneButtons?: boolean;
    /**
     * Show the "Lock rule" and "Lock group" buttons.
     *
     * @default false
     */
    showLockButtons?: boolean;
    /**
     * Reset the `operator` and `value` when the `field` changes.
     *
     * @default true
     */
    resetOnFieldChange?: boolean;
    /**
     * Reset the `value` when the `operator` changes.
     *
     * @default false
     */
    resetOnOperatorChange?: boolean;
    /**
     * Select the first field in the array automatically.
     *
     * @default true
     */
    autoSelectField?: boolean;
    /**
     * Select the first operator in the array automatically.
     *
     * @default true
     */
    autoSelectOperator?: boolean;
    /**
     * Adds a new default rule automatically to each new group.
     *
     * @default false
     */
    addRuleToNewGroups?: boolean;
    /**
     * Store list-type values as native arrays instead of comma-separated strings.
     *
     * @default false
     */
    listsAsArrays?: boolean;
    /**
     * Store values as numbers if possible.
     *
     * @default false
     */
    parseNumbers?: ParseNumbersMethod;
    /**
     * Disables the entire query builder if true, or the rules and groups at
     * the specified paths (as well as all child rules/groups and subcomponents)
     * if an array of paths is provided. If the root path is specified (`disabled={[[]]}`),
     * no changes to the query are allowed.
     *
     * @default false
     *
     * @deprecated This prop may be removed in a future major version. Use the `disabled`
     * property on rules and groups (including the root group, the query itself) instead.
     */
    disabled?: boolean | Path[];
    /**
     * Query validation function.
     */
    validator?: QueryValidator;
    /**
     * `id` generator function. Should always produce a unique/random value.
     *
     * @default crypto.randomUUID
     */
    idGenerator?: () => string;
    /**
     * Generator function for the `title` attribute applied to the outermost `<div>` of each
     * rule group. As this is intended to help with accessibility, the text output from this
     * function should be meaningful, descriptive, and unique within the page.
     */
    accessibleDescriptionGenerator?: (props: { path: Path; qbId: string }) => string;
    /**
     * Container for custom props that are passed to all components.
     */
    context?: any;
  };

/**
 * Props for {@link QueryBuilder}. Note that if `independentCombinators` is `true`,
 * then `query` and `defaultQuery` must be of type {@link RuleGroupTypeIC}. Otherwise,
 * they must be of type {@link RuleGroupType}. Only one of `query` or `defaultQuery` can be
 * provided. If `query` is present, then `defaultQuery` must be undefined and vice versa.
 * If rendered initially with a `query` prop, then `query` must always be defined in every
 * subsequent render or warnings will be logged (in non-production modes only).
 */
export type QueryBuilderProps<RG extends RuleGroupType | RuleGroupTypeIC = RuleGroupType> =
  | (QueryBuilderPropsBase<RG> & {
      /**
       * Initial query object for uncontrolled components
       */
      defaultQuery?: RG;
      query?: never;
    })
  | (QueryBuilderPropsBase<RG> & {
      defaultQuery?: never;
      /**
       * Query object for controlled components
       */
      query?: RG;
    });
