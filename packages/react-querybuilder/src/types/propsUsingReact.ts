import type {
  ComponentType,
  ForwardRefExoticComponent,
  MouseEvent as ReactMouseEvent,
  ReactNode,
  Ref,
  RefAttributes,
} from 'react';
import type { UseRuleGroup } from '../components';
import type { GroupOptions, MoveOptions } from '../utils';
import type {
  AccessibleDescriptionGenerator,
  Classname,
  FullCombinator,
  FullField,
  FullOperator,
  InputType,
  MatchConfig,
  MatchMode,
  MatchModeOptions,
  ParseNumbersPropConfig,
  Path,
  ValueEditorType,
  ValueSource,
  ValueSourceFlexibleOptions,
  ValueSourceFullOptions,
  ValueSources,
} from './basic';
import type { DropEffect } from './dnd';
import type {
  BaseOptionMap,
  FlexibleOption,
  FlexibleOptionListProp,
  FullOption,
  FullOptionList,
  GetOptionIdentifierType,
  Option,
  ToFullOption,
} from './options';
import type { Classnames, CommonRuleSubComponentProps, QueryActions } from './props';
import type { RuleGroupType, RuleType } from './ruleGroups';
import type {
  GenericizeRuleGroupType,
  RuleGroupTypeAny,
  RuleGroupTypeIC,
  RuleOrGroupArray,
} from './ruleGroupsIC';
import type { SetNonNullable } from './type-fest';
import type { QueryValidator, ValidationMap, ValidationResult } from './validation';

/**
 * Base interface for all subcomponents.
 *
 * @group Props
 */
export interface CommonSubComponentProps<
  F extends FullOption = FullField,
  O extends string = string,
> {
  /**
   * CSS classNames to be applied.
   *
   * This is `string` and not {@link Classname} because the {@link Rule}
   * and {@link RuleGroup} components run `clsx()` to produce the `className`
   * that gets passed to each subcomponent.
   */
  className?: string;
  /**
   * Path to this subcomponent's rule/group within the query.
   */
  path: Path;
  /**
   * The level of the current group. Always equal to `path.length`.
   */
  level: number;
  /**
   * The title/tooltip for this control.
   */
  title?: string;
  /**
   * Disables the control.
   */
  disabled?: boolean;
  /**
   * Container for custom props that are passed to all components.
   */
  // oxlint-disable-next-line typescript/no-explicit-any
  context?: any;
  /**
   * Validation result of the parent rule/group.
   */
  validation?: boolean | ValidationResult;
  /**
   * Test ID for this component.
   */
  testID?: string;
  /**
   * All subcomponents receive the configuration schema as a prop.
   */
  schema: Schema<F, O>;
}

/**
 * Base interface for selectors and editors.
 *
 * @group Props
 */
export interface SelectorOrEditorProps<F extends FullOption = FullField, O extends string = string>
  extends CommonSubComponentProps<F, O> {
  value?: string;
  // oxlint-disable-next-line typescript/no-explicit-any
  handleOnChange(value: any): void;
}

/**
 * Base interface for selector components.
 */
interface BaseSelectorProps<OptType extends Option>
  extends SelectorOrEditorProps<ToFullOption<OptType>> {
  options: FullOptionList<OptType>;
}

/**
 * Props for all `value` selector components.
 *
 * @group Props
 */
export interface ValueSelectorProps<OptType extends Option = FullOption>
  extends BaseSelectorProps<OptType> {
  multiple?: boolean;
  listsAsArrays?: boolean;
}

/**
 * Props for `combinatorSelector` components.
 *
 * @group Props
 */
export interface CombinatorSelectorProps extends BaseSelectorProps<FullOption> {
  options: FullOptionList<FullCombinator>;
  rules: RuleOrGroupArray;
  ruleGroup: RuleGroupTypeAny;
}

/**
 * Props for `fieldSelector` components.
 *
 * @group Props
 */
export interface FieldSelectorProps<F extends FullField = FullField>
  extends BaseSelectorProps<F>,
    CommonRuleSubComponentProps {
  operator?: F extends FullField<string, infer OperatorName> ? OperatorName : string;
}

/**
 * Props for `matchModeEditor` components.
 *
 * @group Props
 */
export interface MatchModeEditorProps
  extends BaseSelectorProps<FullOption>,
    CommonRuleSubComponentProps {
  match: MatchConfig;
  selectorComponent?: ComponentType<ValueSelectorProps>;
  numericEditorComponent?: ComponentType<ValueEditorProps>;
  classNames: { matchMode: string; matchThreshold: string };
  options: FullOptionList<FullOption<MatchMode>>;
  field: string;
  fieldData: FullField;
}

/**
 * Props for `operatorSelector` components.
 *
 * @group Props
 */
export interface OperatorSelectorProps
  extends BaseSelectorProps<FullOption>,
    CommonRuleSubComponentProps {
  options: FullOptionList<FullOperator>;
  field: string;
  fieldData: FullField;
}

/**
 * Props for `valueSourceSelector` components.
 *
 * @group Props
 */
export interface ValueSourceSelectorProps
  extends BaseSelectorProps<FullOption>,
    CommonRuleSubComponentProps {
  options: FullOptionList<FullOption<ValueSource>>;
  field: string;
  fieldData: FullField;
}

/**
 * Utility type representing props for selector components
 * that could potentially be any of the standard selector types.
 *
 * @group Props
 */
// TODO: Use interface instead:
// export interface VersatileSelectorProps extends ValueSelectorProps,
//   Partial<FieldSelectorProps<FullField>>,
//   Partial<OperatorSelectorProps>,
//   Partial<CombinatorSelectorProps> {}
export type VersatileSelectorProps = ValueSelectorProps &
  Partial<FieldSelectorProps<FullField>> &
  Partial<OperatorSelectorProps> &
  Partial<CombinatorSelectorProps>;

/**
 * A translation for a component with `title` and `label`.
 *
 * @group Props
 */
export interface TranslationWithLabel extends Translation {
  label?: ReactNode;
}
/**
 * A translation for a component with `title` only.
 *
 * @group Props
 */
export interface Translation {
  title?: string;
}
/**
 * Placeholder strings for option lists.
 *
 * @group Props
 */
export interface Placeholder {
  /**
   * Value for the placeholder field option if autoSelectField is false,
   * or the placeholder operator option if autoSelectOperator is false.
   */
  placeholderName?: string;
  /**
   * Label for the placeholder field option if autoSelectField is false,
   * or the placeholder operator option if autoSelectOperator is false.
   */
  placeholderLabel?: string;
  /**
   * Label for the placeholder field optgroup if autoSelectField is false,
   * or the placeholder operator optgroup if autoSelectOperator is false.
   */
  placeholderGroupLabel?: string;
}
/**
 * A translation for a component with `title` and a placeholder.
 *
 * @group Props
 */
export interface TranslationWithPlaceholders extends Translation, Placeholder {}
/**
 * The shape of the `translations` prop.
 *
 * @group Props
 */
export interface Translations {
  fields: TranslationWithPlaceholders;
  operators: TranslationWithPlaceholders;
  values: TranslationWithPlaceholders;
  matchMode: Translation;
  matchThreshold: Translation;
  value: Translation;
  removeRule: TranslationWithLabel;
  removeGroup: TranslationWithLabel;
  addRule: TranslationWithLabel;
  addGroup: TranslationWithLabel;
  combinators: Translation;
  notToggle: TranslationWithLabel;
  cloneRule: TranslationWithLabel;
  cloneRuleGroup: TranslationWithLabel;
  shiftActionUp: TranslationWithLabel;
  shiftActionDown: TranslationWithLabel;
  dragHandle: TranslationWithLabel;
  lockRule: TranslationWithLabel;
  lockGroup: TranslationWithLabel;
  lockRuleDisabled: TranslationWithLabel;
  lockGroupDisabled: TranslationWithLabel;
  valueSourceSelector: Translation;
}
/**
 * The full `translations` interface with all properties required.
 *
 * @group Props
 */
export type TranslationsFull = {
  [K in keyof Translations]: { [T in keyof Translations[K]]-?: string };
};

/**
 * Props passed to every action component (rendered as `<button>` by default).
 *
 * @group Props
 */
export interface ActionProps extends CommonSubComponentProps {
  /** Visible text. */
  label?: ReactNode;
  /**
   * Triggers the action, e.g. the addition of a new rule or group. The second parameter
   * will be forwarded to the `onAddRule` or `onAddGroup` callback if appropriate.
   */
  // oxlint-disable-next-line no-explicit-any
  handleOnClick(e?: ReactMouseEvent, context?: any): void;
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
  /**
   * Rules in this group (if the action element is for a group).
   */
  rules?: RuleOrGroupArray;
}

/**
 * Props passed to every group action component.
 *
 * @deprecated Use {@link ActionProps} instead.
 * @group Props
 */
export interface ActionWithRulesProps extends ActionProps {}

/**
 * Props passed to every action component that adds a rule or group.
 *
 * @deprecated Use {@link ActionProps} instead.
 * @group Props
 */
export interface ActionWithRulesAndAddersProps extends ActionProps {}

/**
 * Props for `notToggle` components.
 *
 * @group Props
 */
export interface NotToggleProps extends CommonSubComponentProps {
  checked?: boolean;
  handleOnChange(checked: boolean): void;
  label?: ReactNode;
  ruleGroup: RuleGroupTypeAny;
}

/**
 * Props passed to `shiftActions` components.
 *
 * @group Props
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
 *
 * @group Props
 */
export interface DragHandleProps extends CommonSubComponentProps {
  label?: ReactNode;
  ruleOrGroup: RuleGroupTypeAny | RuleType;
}

/**
 * Props passed to `inlineCombinator` components.
 *
 * @group Props
 */
export interface InlineCombinatorProps extends CombinatorSelectorProps {
  component: ComponentType<CombinatorSelectorProps>;
}

/**
 * Props passed to `valueEditor` components.
 *
 * @group Props
 */
export interface ValueEditorProps<F extends FullField = FullField, O extends string = string>
  extends SelectorOrEditorProps<F, O>,
    CommonRuleSubComponentProps {
  field: GetOptionIdentifierType<F>;
  operator: O;
  // oxlint-disable-next-line typescript/no-explicit-any
  value?: any;
  valueSource: ValueSource;
  /** The entire {@link FullField} object. */
  fieldData: F;
  type?: ValueEditorType;
  inputType?: InputType | null;
  // oxlint-disable-next-line typescript/no-explicit-any
  values?: any[];
  listsAsArrays?: boolean;
  parseNumbers?: ParseNumbersPropConfig;
  separator?: ReactNode;
  selectorComponent?: ComponentType<ValueSelectorProps>;
  /**
   * Only pass `true` if the {@link useValueEditor} hook has already run
   * in a parent/ancestor component. See usage in the compatibility packages.
   */
  skipHook?: boolean;
  schema: Schema<F, O>;
}

/**
 * All subcomponents.
 *
 * @group Props
 */
export type Controls<F extends FullField, O extends string> = Required<
  SetNonNullable<ControlElementsProp<F, O>, keyof ControlElementsProp<F, O>>
>;

/**
 * Subcomponents.
 *
 * @group Props
 */
export type ControlElementsProp<F extends FullField, O extends string> = Partial<{
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
  addGroupAction: ComponentType<ActionProps> | null;
  /**
   * Adds a rule to the current group.
   *
   * @default ActionElement
   */
  addRuleAction: ComponentType<ActionProps> | null;
  /**
   * Clones the current group.
   *
   * @default ActionElement
   */
  cloneGroupAction: ComponentType<ActionProps> | null;
  /**
   * Clones the current rule.
   *
   * @default ActionElement
   */
  cloneRuleAction: ComponentType<ActionProps> | null;
  /**
   * Selects the `combinator` property for the current group, or the current independent combinator value.
   *
   * @default ValueSelector
   */
  combinatorSelector: ComponentType<CombinatorSelectorProps> | null;
  /**
   * Provides a draggable handle for reordering rules and groups.
   *
   * @default DragHandle
   */
  dragHandle: ForwardRefExoticComponent<DragHandleProps & RefAttributes<HTMLElement>> | null;
  /**
   * Selects the `field` property for the current rule.
   *
   * @default ValueSelector
   */
  fieldSelector: ComponentType<FieldSelectorProps<F>> | null;
  /**
   * A small wrapper around the `combinatorSelector` component.
   *
   * @default InlineCombinator
   */
  inlineCombinator: ComponentType<InlineCombinatorProps> | null;
  /**
   * Locks the current group (sets the `disabled` property to `true`).
   *
   * @default ActionElement
   */
  lockGroupAction: ComponentType<ActionProps> | null;
  /**
   * Locks the current rule (sets the `disabled` property to `true`).
   *
   * @default ActionElement
   */
  lockRuleAction: ComponentType<ActionProps> | null;
  /**
   * Selects the `match` property for the current rule.
   *
   * @default MatchModeEditor
   */
  matchModeEditor: ComponentType<MatchModeEditorProps> | null;
  /**
   * Toggles the `not` property of the current group between `true` and `false`.
   *
   * @default NotToggle
   */
  notToggle: ComponentType<NotToggleProps> | null;
  /**
   * Selects the `operator` property for the current rule.
   *
   * @default ValueSelector
   */
  operatorSelector: ComponentType<OperatorSelectorProps> | null;
  /**
   * Removes the current group from its parent group's `rules` array.
   *
   * @default ActionElement
   */
  removeGroupAction: ComponentType<ActionProps> | null;
  /**
   * Removes the current rule from its parent group's `rules` array.
   *
   * @default ActionElement
   */
  removeRuleAction: ComponentType<ActionProps> | null;
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
   * Rule group body components.
   *
   * @default RuleGroupBodyComponents
   */
  // Specifying the generics with `RuleGroupProps<F, O>` would be preferable here, but
  // it complicates things with `QueryBuilderContextType`.
  ruleGroupBodyElements: ComponentType<RuleGroupProps & UseRuleGroup>;
  /**
   * Rule group header components.
   *
   * @default RuleGroupHeaderComponents
   */
  // Specifying the generics with `RuleGroupProps<F, O>` would be preferable here, but
  // it complicates things with `QueryBuilderContextType`.
  ruleGroupHeaderElements: ComponentType<RuleGroupProps & UseRuleGroup>;
  /**
   * Shifts the current rule/group up or down in the query hierarchy.
   *
   * @default ShiftActions
   */
  shiftActions: ComponentType<ShiftActionsProps> | null;
  /**
   * Updates the `value` property for the current rule.
   *
   * @default ValueEditor
   */
  valueEditor: ComponentType<ValueEditorProps<F, O>> | null;
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
  valueSourceSelector: ComponentType<ValueSourceSelectorProps> | null;
}>;

/**
 * Configuration options passed in the `schema` prop from
 * {@link QueryBuilder} to each subcomponent.
 *
 * @group Props
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
  getQuery(): RuleGroupTypeAny;
  getOperators(field: string, meta: { fieldData: F }): FullOptionList<FullOperator>;
  getValueEditorType(field: string, operator: string, meta: { fieldData: F }): ValueEditorType;
  getValueEditorSeparator(field: string, operator: string, meta: { fieldData: F }): ReactNode;
  getValueSources(field: string, operator: string, meta: { fieldData: F }): ValueSourceFullOptions;
  getInputType(field: string, operator: string, meta: { fieldData: F }): InputType | null;
  getValues(field: string, operator: string, meta: { fieldData: F }): FullOptionList<Option>;
  getMatchModes(field: string, misc: { fieldData: F }): MatchModeOptions;
  getSubQueryBuilderProps(
    field: GetOptionIdentifierType<F>,
    misc: { fieldData: F }
  ): QueryBuilderProps<RuleGroupTypeAny, FullOption, FullOption, FullOption>;
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
  autoSelectValue: boolean;
  addRuleToNewGroups: boolean;
  enableDragAndDrop: boolean;
  validationMap: ValidationMap;
  independentCombinators: boolean;
  listsAsArrays: boolean;
  parseNumbers: ParseNumbersPropConfig;
  disabledPaths: Path[];
  suppressStandardClassnames: boolean;
  maxLevels: number;
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
  // oxlint-disable-next-line typescript/no-explicit-any
  context?: any;
}

/**
 * Return type of {@link @react-querybuilder/dnd!useRuleGroupDnD} hook.
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
  /** True if the dragged and hovered items should form a new group. */
  groupItems?: boolean;
}

/**
 * {@link RuleGroup} props.
 *
 * @group Props
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
 * Return type of {@link @react-querybuilder/dnd!useRuleDnD} hook.
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
  /** True if the dragged and hovered items should form a new group. */
  groupItems?: boolean;
}

/**
 * {@link Rule} props.
 *
 * @group Props
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
  // oxlint-disable-next-line typescript/no-explicit-any
  value?: any;
  /**
   * @deprecated Use the `valueSource` property of the `rule` prop instead
   */
  valueSource?: ValueSource;
}

/**
 * Props passed down through context from a {@link QueryBuilderContextProvider}.
 *
 * @group Props
 */
export interface QueryBuilderContextProps<F extends FullField, O extends string> {
  /**
   * Defines replacement components.
   */
  controlElements?: ControlElementsProp<F, O>;
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

/**
 * @group Props
 */
export interface QueryBuilderContextProviderProps
  extends QueryBuilderContextProps<FullField, string> {
  children?: ReactNode;
}

/**
 * @group Components
 */
// oxlint-disable-next-line typescript/no-explicit-any
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
 *
 * @typeParam RG - The type of the query object, inferred from either the `query` or `defaultQuery` prop.
 * Must extend {@link RuleGroupType} or {@link RuleGroupTypeIC}.
 * @typeParam F - The field type (see {@link Field}).
 * @typeParam O - The operator type (see {@link Operator}).
 * @typeParam C - The combinator type (see {@link Combinator}).
 *
 * @group Props
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
      fields?: FlexibleOptionListProp<F> | BaseOptionMap<F>;
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
      operators?: FlexibleOptionListProp<O>;
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
      combinators?: FlexibleOptionListProp<C>;
      /**
       * Default properties applied to all objects in the `fields` prop. Properties on
       * individual field definitions will override these.
       */
      baseField?: Record<string, unknown>;
      /**
       * Default properties applied to all objects in the `operators` prop. Properties on
       * individual operator definitions will override these.
       */
      baseOperator?: Record<string, unknown>;
      /**
       * Default properties applied to all objects in the `combinators` prop. Properties on
       * individual combinator definitions will override these.
       */
      baseCombinator?: Record<string, unknown>;
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
      // oxlint-disable-next-line typescript/no-explicit-any
      getDefaultValue?(rule: R, misc: { fieldData: F }): any;
      /**
       * This function should return the list of allowed {@link FullOperator}s
       * for the given {@link FullField} `name`. If `null` is returned, the
       * {@link DefaultOperator}s are used.
       */
      getOperators?(
        field: GetOptionIdentifierType<F>,
        misc: { fieldData: F }
      ): FlexibleOptionListProp<FullOperator> | null;
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
      ): ValueSources | ValueSourceFlexibleOptions;
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
      ): FlexibleOptionListProp<Option>;
      /**
       * This function should return the list of valid {@link MatchMode}s or
       * {@link MatchConfig}s for a given field `name`. The return value must
       * be an array that includes at least one valid {@link MatchMode}, or `true`
       * to indicate that all match modes are allowed. Any other return value
       * will be ignored (no match modes will be allowed).
       */
      getMatchModes?(
        field: GetOptionIdentifierType<F>,
        misc: { fieldData: F }
      ): boolean | MatchMode[] | FlexibleOption<MatchMode>[];
      /**
       * This function should return any props that a subquery (see {@link MatchMode})
       * should override from the props provided to this query builder. Note that certain
       * props like `query`, `onQueryChange`, and `enableDragAndDrop` will be ignored.
       */
      getSubQueryBuilderProps?(
        field: GetOptionIdentifierType<F>,
        misc: { fieldData: F }
      ): QueryBuilderProps<GenericizeRuleGroupType<RG>, FullOption, FullOption, FullOption>;
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
       * the rule and return the new object, return `true` to allow the addition to proceed as normal,
       * or return `false` to cancel the addition of the rule.
       */
      // oxlint-disable-next-line typescript/no-explicit-any
      onAddRule?(rule: R, parentPath: Path, query: RG, context?: any): RuleType | boolean;
      /**
       * This callback is invoked before a new group is added. The function should either manipulate
       * the group and return the new object, return `true` to allow the addition to proceed as normal,
       * or return `false` to cancel the addition of the group.
       */
      // oxlint-disable-next-line typescript/no-explicit-any
      onAddGroup?(ruleGroup: RG, parentPath: Path, query: RG, context?: any): RG | boolean;
      /**
       * This callback is invoked before a rule is moved or shifted. The function should return
       * `true` to allow the move/shift to proceed as normal, `false` to cancel the move/shift, or
       * a new query object (presumably based on `query` or `nextQuery`) which will become the new
       * query state.
       */
      onMoveRule?(
        /** The rule being moved. */
        rule: R,
        /** The original path of the rule. */
        fromPath: Path,
        /**
         * The target path of the rule, or the direction of the shift. Note that the target path
         * is not necessarily the final path since moves (particularly downward) can affect the
         * indexes of sibling rules/groups at the original path.
         */
        toPath: Path | 'up' | 'down',
        /** The current query, before the move. */
        query: RG,
        /** The next query, if the move is allowed to proceed. */
        nextQuery: RG,
        /** The options passed to {@link move} to generate `nextQuery`. */
        options: MoveOptions,
        // oxlint-disable-next-line typescript/no-explicit-any
        context?: any
      ): RG | boolean;
      /**
       * This callback is invoked before a group is moved or shifted. The function should return
       * `true` to allow the move/shift to proceed as normal, `false` to cancel the move/shift, or
       * a new query object (presumably based on `query` or `nextQuery`) which will become the new
       * query state.
       */
      onMoveGroup?(
        /** The group being moved. */
        ruleGroup: RG,
        /** The original path of the group. */
        fromPath: Path,
        /**
         * The target path of the group, or the direction of the shift. Note that the target path
         * is not necessarily the final path since moves (particularly downward) can affect the
         * indexes of sibling rules/groups at the original path.
         */
        toPath: Path | 'up' | 'down',
        /** The current query, before the move. */
        query: RG,
        /** The next query, if the move is allowed to proceed. */
        nextQuery: RG,
        /** The options passed to {@link move} to generate `nextQuery`. */
        options: MoveOptions,
        // oxlint-disable-next-line typescript/no-explicit-any
        context?: any
      ): RG | boolean;
      /**
       * This callback is invoked before a rule is grouped with another object. The function should
       * return `true` to allow the grouping to proceed as normal, `false` to cancel the grouping,
       * or a new query object (presumably based on `query` or `nextQuery`) which will become the new
       * query state.
       */
      onGroupRule?(
        /** The rule being moved. */
        rule: R,
        /** The original path of the rule. */
        fromPath: Path,
        /**
         * The path of the target object to group the rule with. Note that the target path
         * is not necessarily the final path since moves (particularly downward) can affect the
         * indexes of sibling rules/groups at the original path.
         */
        toPath: Path,
        /** The current query, before the group. */
        query: RG,
        /** The next query, if the group is allowed to proceed. */
        nextQuery: RG,
        /** The options passed to {@link group} to generate `nextQuery`. */
        options: GroupOptions,
        // oxlint-disable-next-line typescript/no-explicit-any
        context?: any
      ): RG | boolean;
      /**
       * This callback is invoked before a group is grouped with another object. The function should
       * return `true` to allow the grouping to proceed as normal, `false` to cancel the grouping,
       * or a new query object (presumably based on `query` or `nextQuery`) which will become the new
       * query state.
       */
      onGroupGroup?(
        /** The group being moved. */
        ruleGroup: RG,
        /** The original path of the group. */
        fromPath: Path,
        /**
         * The path of the target object to group the group with. Note that the target path
         * is not necessarily the final path since moves (particularly downward) can affect the
         * indexes of sibling rules/groups at the original path.
         */
        toPath: Path,
        /** The current query, before the group. */
        query: RG,
        /** The next query, if the group is allowed to proceed. */
        nextQuery: RG,
        /** The options passed to {@link group} to generate `nextQuery`. */
        options: GroupOptions,
        // oxlint-disable-next-line typescript/no-explicit-any
        context?: any
      ): RG | boolean;
      /**
       * This callback is invoked before a rule or group is removed. The function should return
       * `true` if the rule or group should be removed or `false` if it should not be removed.
       */
      // oxlint-disable-next-line typescript/no-explicit-any
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
      // oxlint-disable-next-line typescript/no-explicit-any
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
       * Select the first value in the array automatically. Only applicable when the value editor renders a select list.
       *
       * @default false
       */
      autoSelectValue?: boolean;
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
       * Store values as numbers whenever possible.
       *
       * _**TIP: Try `"strict-limited"` first.**_
       *
       * Options include `true`, `false`, `"enhanced"`, `"native"`, and `"strict"`. The `string` options
       * can be suffixed with `"-limited"`.
       *
       * - `false` avoids numeric parsing
       * - `true` or `"strict"` parses values using `numeric-quantity`, bailing out (returning the original
       *   string) when trailing invalid characters are present
       * - `"enhanced"` is the same as `true`/`"strict"`, but ignores trailing invalid characters (CAUTION:
       *   this can lead to information loss)
       * - `"native"` parses values using `parseFloat`, returning `NaN` when parsing fails
       *
       * When the value is `true` or a string without the "-limited" suffix, the default {@link ValueEditor}
       * will attempt to parse *all* inputs as numbers. **CAUTION: This can lead to unexpected behavior.**
       *
       * When the value is a string with the "-limited" suffix, the default {@link ValueEditor} will
       * only attempt to parse inputs as numbers when the `inputType` is `"number"`.
       *
       * @default false
       */
      parseNumbers?: ParseNumbersPropConfig;
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
       * Prevent _any_ assignment of standard classes to elements. This includes conditional
       * and event-based classes for validation, drag-and-drop, etc.
       */
      suppressStandardClassnames?: boolean;
      /**
       * Maximum number of levels deep the query is allowed to go. The minimum is 1; values
       * less than 1 will be ignored.
       */
      maxLevels?: number;
      /**
       * Container for custom props that are passed to all components.
       */
      // oxlint-disable-next-line typescript/no-explicit-any
      context?: any;
    }
  : never;

// import { getFirstOption } from '../utils';
// type ThisThat = 'this' | 'that';
// const fields: FullField<ThisThat>[] = [];
// const fieldSelector = (_props: FieldSelectorProps<FullField<ThisThat>>) => _props.value;
// const valueEditor = (_props: ValueEditorProps<FullField<ThisThat>, string>) =>
//   getFirstOption(_props.values);
// const _QB = <RG extends RuleGroupTypeAny, F extends FullField>(
//   _p: QueryBuilderProps<RG, F, FullOperator, FullCombinator>
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
//   FullField<ThisThat>,
//   FullOperator,
//   FullCombinator
// > = {
//   fields,
//   onAddRule: (_rule, _parentPath, _query, _context) => false,
//   controlElements: {
//     fieldSelector: _props => 1,
//     valueEditor: _props => 1,
//   },
// };
