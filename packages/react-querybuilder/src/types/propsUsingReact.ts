import type {
  ComponentType,
  ForwardRefExoticComponent,
  MouseEvent as ReactMouseEvent,
  ReactNode,
  Ref,
  RefAttributes,
} from 'react';
import type {
  AccessibleDescriptionGenerator,
  Classname,
  FullCombinator,
  FullField,
  InputType,
  FullOperator,
  ParseNumbersMethod,
  Path,
  ValueEditorType,
  ValueSource,
  ValueSources,
} from './basic';
import type { DropEffect } from './dnd';
import type {
  FlexibleOptionList,
  FlexibleOptionMap,
  FullOption,
  FullOptionList,
  GetOptionIdentifierType,
  Option,
} from './options';
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
   * Method to shift the rule/group up one place.
   */
  shiftUp?: () => void;
  /**
   * Method to shift the rule/group down one place.
   */
  shiftDown?: () => void;
  /**
   * Whether shifting the rule/group up is disallowed.
   */
  shiftUpDisabled?: boolean;
  /**
   * Whether shifting the rule/group down is disallowed.
   */
  shiftDownDisabled?: boolean;
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
  component: ComponentType<CombinatorSelectorProps>;
  independentCombinators?: boolean;
}

/**
 * Props passed to `valueEditor` components.
 */
export interface ValueEditorProps<F extends FullField = FullField, O extends string = string>
  extends SelectorOrEditorProps<F, O>,
    CommonRuleSubComponentProps {
  field: GetOptionIdentifierType<F>;
  operator: O;
  value?: any;
  valueSource: ValueSource;
  /** The entire {@link FullField} object. */
  fieldData: F;
  type?: ValueEditorType;
  inputType?: InputType | null;
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
 * Subcomponents.
 */
export interface Controls<F extends FullField, O extends string> {
  /**
   * Default component for all button-type controls.
   *
   * @default ActionElement
   */
  actionElement: ComponentType<ActionProps>;
  /**
   * Adds a sub-group to the current group.
   *
   * @default ActionElement
   */
  addGroupAction: ComponentType<ActionWithRulesAndAddersProps>;
  /**
   * Adds a rule to the current group.
   *
   * @default ActionElement
   */
  addRuleAction: ComponentType<ActionWithRulesAndAddersProps>;
  /**
   * Clones the current group.
   *
   * @default ActionElement
   */
  cloneGroupAction: ComponentType<ActionWithRulesProps>;
  /**
   * Clones the current rule.
   *
   * @default ActionElement
   */
  cloneRuleAction: ComponentType<ActionProps>;
  /**
   * Selects the `combinator` property for the current group, or the current independent combinator value.
   *
   * @default ValueSelector
   */
  combinatorSelector: ComponentType<CombinatorSelectorProps>;
  /**
   * Provides a draggable handle for reordering rules and groups.
   *
   * @default DragHandle
   */
  dragHandle: ForwardRefExoticComponent<DragHandleProps & RefAttributes<any>>;
  /**
   * Selects the `field` property for the current rule.
   *
   * @default ValueSelector
   */
  fieldSelector: ComponentType<FieldSelectorProps<F>>;
  /**
   * A small wrapper around the `combinatorSelector` component.
   *
   * @default InlineCombinator
   */
  inlineCombinator: ComponentType<InlineCombinatorProps>;
  /**
   * Locks the current group (sets the `disabled` property to `true`).
   *
   * @default ActionElement
   */
  lockGroupAction: ComponentType<ActionWithRulesProps>;
  /**
   * Locks the current rule (sets the `disabled` property to `true`).
   *
   * @default ActionElement
   */
  lockRuleAction: ComponentType<ActionWithRulesProps>;
  /**
   * Toggles the `not` property of the current group between `true` and `false`.
   *
   * @default NotToggle
   */
  notToggle: ComponentType<NotToggleProps>;
  /**
   * Selects the `operator` property for the current rule.
   *
   * @default ValueSelector
   */
  operatorSelector: ComponentType<OperatorSelectorProps>;
  /**
   * Removes the current group from its parent group's `rules` array.
   *
   * @default ActionElement
   */
  removeGroupAction: ComponentType<ActionWithRulesProps>;
  /**
   * Removes the current rule from its parent group's `rules` array.
   *
   * @default ActionElement
   */
  removeRuleAction: ComponentType<ActionProps>;
  /**
   * Rule layout component.
   *
   * @default Rule
   */
  rule: ComponentType<RuleProps>;
  /**
   * Rule group layout component.
   *
   * @default RuleGroup
   */
  ruleGroup: ComponentType<RuleGroupProps<F, O>>;
  /**
   * Shifts the current rule/group up or down in the query hierarchy.
   *
   * @default ShiftActions
   */
  shiftActions: ComponentType<ShiftActionsProps>;
  /**
   * Updates the `value` property for the current rule.
   *
   * @default ValueEditor
   */
  valueEditor: ComponentType<ValueEditorProps<F, O>>;
  /**
   * Default component for all value selector controls.
   *
   * @default ValueSelector
   */
  valueSelector: ComponentType<ValueSelectorProps>;
  /**
   * Selects the `valueSource` property for the current rule.
   *
   * @default ValueSelector
   */
  valueSourceSelector: ComponentType<ValueSourceSelectorProps>;
}

/**
 * Configuration options passed in the `schema` prop from
 * {@link QueryBuilder} to each subcomponent.
 */
export interface Schema<F extends FullField, O extends string> {
  qbId: string;
  fields: FullOptionList<F>;
  fieldMap: Partial<Record<GetOptionIdentifierType<F>, F>>;
  classNames: Classnames;
  combinators: FullOptionList<FullCombinator>;
  controls: Controls<F, O>;
  createRule(): RuleType;
  createRuleGroup(ic?: boolean): RuleGroupTypeAny;
  dispatchQuery(query: RuleGroupTypeAny): void;
  getQuery(): RuleGroupTypeAny | undefined;
  getOperators(field: string, meta: { fieldData: F }): FullOptionList<FullOperator>;
  getValueEditorType(field: string, operator: string, meta: { fieldData: F }): ValueEditorType;
  getValueEditorSeparator(field: string, operator: string, meta: { fieldData: F }): ReactNode;
  getValueSources(field: string, operator: string, meta: { fieldData: F }): ValueSources;
  getInputType(field: string, operator: string, meta: { fieldData: F }): InputType | null;
  getValues(field: string, operator: string, meta: { fieldData: F }): FullOptionList<Option>;
  getRuleClassname(rule: RuleType, misc: { fieldData: F }): Classname;
  getRuleGroupClassname(ruleGroup: RuleGroupTypeAny): Classname;
  accessibleDescriptionGenerator: AccessibleDescriptionGenerator;
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
interface CommonRuleAndGroupProps<F extends FullField = FullField, O extends string = string> {
  id?: string;
  path: Path;
  parentDisabled?: boolean;
  translations: Translations;
  schema: Schema<F, O>;
  actions: QueryActions;
  disabled?: boolean;
  shiftUpDisabled?: boolean;
  shiftDownDisabled?: boolean;
  context?: any;
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
export interface RuleGroupProps<F extends FullOption = FullOption, O extends string = string>
  extends CommonRuleAndGroupProps<F, O>,
    Partial<UseRuleGroupDnD> {
  ruleGroup: RuleGroupTypeAny<RuleType<GetOptionIdentifierType<F>, O>>;
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
export interface RuleProps<F extends string = string, O extends string = string>
  extends CommonRuleAndGroupProps<FullOption<F>, O>,
    Partial<UseRuleDnD> {
  rule: RuleType<F, O>;
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
export interface QueryBuilderContextProps<F extends FullField, O extends string> {
  /**
   * Defines replacement components.
   */
  controlElements?: Partial<Controls<F, O>>;
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

export type QueryBuilderContextProviderProps = QueryBuilderContextProps<FullField, string> & {
  children?: ReactNode;
};
export type QueryBuilderContextProvider<ExtraProps extends object = Record<string, any>> =
  ComponentType<QueryBuilderContextProviderProps & ExtraProps>;

/**
 * Props for {@link QueryBuilder}.
 *
 * Notes:
 * - Only one of `query` or `defaultQuery` should be provided. If `query` is present,
 * then `defaultQuery` should be undefined and vice versa.
 * - If rendered initially with a `query` prop, then `query` must be defined in every
 * subsequent render or warnings will be logged (in non-production modes only).
 */
export type QueryBuilderProps<
  RG extends RuleGroupTypeAny,
  F extends FullField,
  O extends FullOperator,
  C extends FullCombinator,
> = RG extends RuleGroupType<infer R> | RuleGroupTypeIC<infer R>
  ? QueryBuilderContextProps<F, GetOptionIdentifierType<O>> & {
      /**
       * Initial query object for uncontrolled components.
       */
      defaultQuery?: RG;
      /**
       * Query object for controlled components.
       */
      query?: RG;
      /**
       * List of valid {@link FullField}s.
       *
       * @default []
       */
      fields?: FlexibleOptionList<F> | FlexibleOptionMap<F, GetOptionIdentifierType<F>>;
      /**
       * List of valid {@link FullOperator}s.
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
      operators?: FlexibleOptionList<O>;
      /**
       * List of valid {@link FullCombinator}s.
       *
       * @see {@link DefaultCombinatorName}
       *
       * @default
       * [
       *   {name: 'and', label: 'AND'},
       *   {name: 'or', label: 'OR'},
       * ]
       */
      combinators?: FlexibleOptionList<C>;
      /**
       * The default `field` value for new rules. This can be the field `name`
       * itself or a function that returns a valid {@link FullField} `name` given
       * the `fields` list.
       */
      getDefaultField?: GetOptionIdentifierType<F> | ((fieldsData: FullOptionList<F>) => string);
      /**
       * The default `operator` value for new rules. This can be the operator
       * `name` or a function that returns a valid {@link FullOperator} `name` for
       * a given field name.
       */
      getDefaultOperator?:
        | GetOptionIdentifierType<O>
        | ((field: GetOptionIdentifierType<F>, misc: { fieldData: F }) => string);
      /**
       * Returns the default `value` for new rules.
       */
      getDefaultValue?(rule: R, misc: { fieldData: F }): any;
      /**
       * This function should return the list of allowed {@link FullOperator}s
       * for the given {@link FullField} `name`. If `null` is returned, the
       * {@link DefaultOperator}s are used.
       */
      getOperators?(
        field: GetOptionIdentifierType<F>,
        misc: { fieldData: F }
      ): FlexibleOptionList<FullOperator> | null;
      /**
       * This function should return the type of {@link ValueEditor} (see
       * {@link ValueEditorType}) for the given field `name` and operator `name`.
       */
      getValueEditorType?(
        field: GetOptionIdentifierType<F>,
        operator: GetOptionIdentifierType<O>,
        misc: { fieldData: F }
      ): ValueEditorType;
      /**
       * This function should return the separator element for a given field
       * `name` and operator `name`. The element can be any valid React element,
       * including a bare string (e.g., "and" or "to") or an HTML element like
       * `<span />`. It will be placed in between value editors when multiple
       * editors are rendered, such as when the `operator` is `"between"`.
       */
      getValueEditorSeparator?(
        field: GetOptionIdentifierType<F>,
        operator: GetOptionIdentifierType<O>,
        misc: { fieldData: F }
      ): ReactNode;
      /**
       * This function should return the list of valid {@link ValueSources}
       * for a given field `name` and operator `name`. The return value must
       * be an array that includes at least one valid {@link ValueSource}
       * (i.e. `["value"]`, `["field"]`, `["value", "field"]`, or
       * `["field", "value"]`).
       */
      getValueSources?(
        field: GetOptionIdentifierType<F>,
        operator: GetOptionIdentifierType<O>,
        misc: { fieldData: F }
      ): ValueSources;
      /**
       * This function should return the `type` of `<input />`
       * for the given field `name` and operator `name` (only applicable when
       * `getValueEditorType` returns `"text"` or a falsy value). If no
       * function is provided, `"text"` is used as the default.
       */
      getInputType?(
        field: GetOptionIdentifierType<F>,
        operator: GetOptionIdentifierType<O>,
        misc: { fieldData: F }
      ): InputType | null;
      /**
       * This function should return the list of allowed values for the
       * given field `name` and operator `name` (only applicable when
       * `getValueEditorType` returns `"select"` or `"radio"`). If no
       * function is provided, an empty array is used as the default.
       */
      getValues?(
        field: GetOptionIdentifierType<F>,
        operator: GetOptionIdentifierType<O>,
        misc: { fieldData: F }
      ): FlexibleOptionList<Option>;
      /**
       * The return value of this function will be used to apply classnames to the
       * outer `<div>` of the given {@link Rule}.
       */
      getRuleClassname?(rule: R, misc: { fieldData: F }): Classname;
      /**
       * The return value of this function will be used to apply classnames to the
       * outer `<div>` of the given {@link RuleGroup}.
       */
      getRuleGroupClassname?(ruleGroup: RG): Classname;
      /**
       * This callback is invoked before a new rule is added. The function should either manipulate
       * the rule and return the new object, or return `false` to cancel the addition of the rule.
       */
      onAddRule?(rule: R, parentPath: Path, query: RG, context?: any): RuleType | false;
      /**
       * This callback is invoked before a new group is added. The function should either manipulate
       * the group and return the new object, or return `false` to cancel the addition of the group.
       */
      onAddGroup?(ruleGroup: RG, parentPath: Path, query: RG, context?: any): RG | false;
      /**
       * This callback is invoked before a rule or group is removed. The function should return
       * `true` if the rule or group should be removed or `false` if it should not be removed.
       */
      onRemove?(ruleOrGroup: R | RG, path: Path, query: RG, context?: any): boolean;
      /**
       * This callback is invoked anytime the query state is updated.
       */
      onQueryChange?(query: RG): void;
      /**
       * Each log object will be passed to this function when `debugMode` is `true`.
       *
       * @default console.log
       */
      onLog?(obj: any): void;
      /**
       * Show group combinator selectors in the body of the group, between each child rule/group,
       * instead of in the group header.
       *
       * @default false
       */
      showCombinatorsBetweenRules?: boolean;
      /**
       * @deprecated As of v7, this prop is ignored. To enable independent combinators, use
       * {@link RuleGroupTypeIC} for the `query` or `defaultQuery` prop. The query builder
       * will detect the query type and behave accordingly.
       */
      independentCombinators?: boolean;
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
      accessibleDescriptionGenerator?: AccessibleDescriptionGenerator;
      /**
       * Container for custom props that are passed to all components.
       */
      context?: any;
    }
  : never;

// import { getFirstOption } from '../utils';
// type ThisThat = 'this' | 'that';
// const fields: Field<ThisThat>[] = [];
// const fieldSelector = (_props: FieldSelectorProps<Field<ThisThat>>) => _props.value;
// const valueEditor = (_props: ValueEditorProps<Field<ThisThat>, string>) =>
//   getFirstOption(_props.values);
// const _QB = <RG extends RuleGroupTypeAny, F extends Field>(
//   _p: QueryBuilderProps<RG, F, Operator, Combinator>
// ) => 1;
// const _QBC = () =>
//   _QB({
//     fields,
//     onAddRule: (_rule, _parentPath, _query, _context) => false,
//     controlElements: {
//       fieldSelector,
//       valueEditor,
//     },
//     defaultQuery: { rules: [] },
//   });
// const _QBP: QueryBuilderProps<
//   RuleGroupTypeIC<RuleType<ThisThat>>,
//   Field<ThisThat>,
//   Operator,
//   Combinator
// > = {
//   fields,
//   onAddRule: (_rule, _parentPath, _query, _context) => false,
//   controlElements: {
//     fieldSelector: _props => 1,
//     valueEditor: _props => 1,
//   },
// };
