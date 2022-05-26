import type {
  ComponentType,
  ForwardRefExoticComponent,
  MouseEvent as ReactMouseEvent,
  RefAttributes,
} from 'react';
import type { RuleGroupTypeAny, RuleGroupTypeIC, RuleOrGroupArray } from 'ruleGroupsIC';
import type {
  Field,
  NameLabelPair,
  OptionGroup,
  ValueEditorType,
  ValueSource,
  ValueSources,
} from './basic';
import type { RuleGroupType, RuleType } from './ruleGroups';
import type { QueryValidator, ValidationMap, ValidationResult } from './validation';

export interface CommonSubComponentProps {
  /**
   * CSS classNames to be applied
   */
  className?: string;
  /**
   * Path to this sub-component's Rule or RuleGroup
   */
  path: number[];
  /**
   * The level of the current group
   */
  level: number;
  /**
   * The title for this control
   */
  title?: string;
  /**
   * Disables the control
   */
  disabled?: boolean;
  /**
   * Container for custom props that are passed to all components
   */
  context?: any;
  /**
   * Validation result of the parent component
   */
  validation?: boolean | ValidationResult;
  /**
   * Test ID for this component
   */
  testID?: string;
}

export interface ActionProps extends CommonSubComponentProps {
  label?: string;
  handleOnClick(e: ReactMouseEvent): void;
  disabledTranslation?: TranslationWithLabel;
}

export interface ActionWithRulesProps extends ActionProps {
  /**
   * Rules already present for this group
   */
  rules?: RuleOrGroupArray;
}

export interface SelectorEditorProps extends CommonSubComponentProps {
  value?: string;
  handleOnChange(value: any): void;
}

export interface BaseSelectorProps extends SelectorEditorProps {
  options: NameLabelPair[] | OptionGroup[];
}

export interface ValueSelectorProps extends BaseSelectorProps {
  multiple?: boolean;
}

export interface NotToggleProps extends CommonSubComponentProps {
  checked?: boolean;
  handleOnChange(checked: boolean): void;
  label?: string;
}

export interface CombinatorSelectorProps extends BaseSelectorProps {
  rules?: RuleOrGroupArray;
}

export interface FieldSelectorProps extends BaseSelectorProps {
  options: Field[] | OptionGroup<Field>[];
  operator?: string;
}

export interface OperatorSelectorProps extends BaseSelectorProps {
  field: string;
  fieldData: Field;
}

interface ValueSourceOption extends NameLabelPair {
  name: ValueSource;
}

export interface ValueSourceSelectorProps extends BaseSelectorProps {
  field: string;
  fieldData: Field;
  options: ValueSourceOption[] | OptionGroup<ValueSourceOption>[];
}

export type VersatileSelectorProps = ValueSelectorProps &
  Partial<FieldSelectorProps> &
  Partial<OperatorSelectorProps> &
  Partial<CombinatorSelectorProps>;

export interface ValueEditorProps extends SelectorEditorProps {
  field: string;
  operator: string;
  value?: any;
  valueSource: ValueSource;
  fieldData: Field;
  type?: ValueEditorType;
  inputType?: string | null;
  values?: any[];
}

export interface DragHandleProps extends CommonSubComponentProps {
  label?: string;
}

export interface Controls {
  addGroupAction: ComponentType<ActionWithRulesProps>;
  addRuleAction: ComponentType<ActionWithRulesProps>;
  cloneGroupAction: ComponentType<ActionWithRulesProps>;
  cloneRuleAction: ComponentType<ActionProps>;
  combinatorSelector: ComponentType<CombinatorSelectorProps>;
  dragHandle: ForwardRefExoticComponent<DragHandleProps & RefAttributes<HTMLSpanElement>>;
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

export interface Classnames {
  /**
   * Root `<div>` element
   */
  queryBuilder: string;
  /**
   * `<div>` containing the RuleGroup
   */
  ruleGroup: string;
  /**
   * `<div>` containing the RuleGroup header controls
   */
  header: string;
  /**
   * `<div>` containing the RuleGroup child rules/groups
   */
  body: string;
  /**
   * `<select>` control for combinators
   */
  combinators: string;
  /**
   * `<button>` to add a Rule
   */
  addRule: string;
  /**
   * `<button>` to add a RuleGroup
   */
  addGroup: string;
  /**
   * `<button>` to clone a Rule
   */
  cloneRule: string;
  /**
   * `<button>` to clone a RuleGroup
   */
  cloneGroup: string;
  /**
   * `<button>` to remove a RuleGroup
   */
  removeGroup: string;
  /**
   * `<div>` containing the Rule
   */
  rule: string;
  /**
   * `<select>` control for fields
   */
  fields: string;
  /**
   * `<select>` control for operators
   */
  operators: string;
  /**
   * `<input>` for the field value
   */
  value: string;
  /**
   * `<button>` to remove a Rule
   */
  removeRule: string;
  /**
   * `<label>` on the "not" toggle
   */
  notToggle: string;
  /**
   * `<span>` handle for dragging rules/groups
   */
  dragHandle: string;
  /**
   * `<button>` to lock (i.e. disable) a Rule
   */
  lockRule: string;
  /**
   * `<button>` to lock (i.e. disable) a RuleGroup
   */
  lockGroup: string;
  /**
   * Value source selector
   */
  valueSource: string;
}

export interface Schema {
  fields: Field[] | OptionGroup<Field>[];
  fieldMap: Record<string, Field>;
  classNames: Classnames;
  combinators: NameLabelPair[] | OptionGroup[];
  controls: Controls;
  createRule(): RuleType;
  createRuleGroup(): RuleGroupTypeAny;
  getOperators(field: string): NameLabelPair[] | OptionGroup[];
  getValueEditorType(field: string, operator: string): ValueEditorType;
  getValueSources(field: string, operator: string): ValueSources;
  getInputType(field: string, operator: string): string | null;
  getValues(field: string, operator: string): NameLabelPair[] | OptionGroup[];
  showCombinatorsBetweenRules: boolean;
  showNotToggle: boolean;
  showCloneButtons: boolean;
  showLockButtons: boolean;
  autoSelectField: boolean;
  autoSelectOperator: boolean;
  addRuleToNewGroups: boolean;
  enableDragAndDrop: boolean;
  validationMap: ValidationMap;
  independentCombinators: boolean;
  disabledPaths: number[][];
}
export interface QueryActions {
  onGroupAdd(group: RuleGroupTypeAny, parentPath: number[]): void;
  onGroupRemove(path: number[]): void;
  onPropChange(
    prop: Exclude<keyof RuleType | keyof RuleGroupType, 'id' | 'path'>,
    value: any,
    path: number[]
  ): void;
  onRuleAdd(rule: RuleType, parentPath: number[]): void;
  onRuleRemove(path: number[]): void;
  moveRule(oldPath: number[], newPath: number[], clone?: boolean): void;
}

interface Translation {
  title?: string;
}
interface TranslationWithLabel extends Translation {
  label?: string;
}
interface TranslationWithPlaceholders extends Translation {
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
export interface Translations {
  fields: TranslationWithPlaceholders;
  operators: TranslationWithPlaceholders;
  value: Translation;
  removeRule: TranslationWithLabel;
  removeGroup: TranslationWithLabel;
  addRule: TranslationWithLabel;
  addGroup: TranslationWithLabel;
  combinators: Translation;
  notToggle: TranslationWithLabel;
  cloneRule: TranslationWithLabel;
  cloneRuleGroup: TranslationWithLabel;
  dragHandle: TranslationWithLabel;
  lockRule: TranslationWithLabel;
  lockGroup: TranslationWithLabel;
  lockRuleDisabled: TranslationWithLabel;
  lockGroupDisabled: TranslationWithLabel;
  valueSourceSelector: Translation;
}
export type TranslationsFull = {
  [K in keyof Translations]: { [T in keyof Translations[K]]-?: string };
};

interface CommonRuleAndGroupProps {
  id?: string;
  path: number[];
  parentDisabled?: boolean;
  translations: Translations;
  schema: Schema;
  actions: QueryActions;
  disabled?: boolean;
  context?: any;
}

export interface RuleGroupProps extends CommonRuleAndGroupProps {
  ruleGroup: RuleGroupTypeAny;
  /**
   * @deprecated Use the `combinator` property of the `ruleGroup` prop instead
   */
  combinator?: string;
  /**
   * @deprecated Use the `rules` property of the `ruleGroup` prop instead
   */
  rules: RuleOrGroupArray;
  /**
   * @deprecated Use the `not` property of the `ruleGroup` prop instead
   */
  not?: boolean;
}

export interface RuleProps extends CommonRuleAndGroupProps {
  rule: RuleType;
  /**
   * @deprecated Use the `field` property of the `rule` prop instead
   */
  field: string;
  /**
   * @deprecated Use the `operator` property of the `rule` prop instead
   */
  operator: string;
  /**
   * @deprecated Use the `value` property of the `rule` prop instead
   */
  value: any;
  /**
   * @deprecated Use the `valueSource` property of the `rule` prop instead
   */
  valueSource?: ValueSource;
}

export type QueryBuilderProps<RG extends RuleGroupType | RuleGroupTypeIC = RuleGroupType> =
  (RG extends {
    combinator: string;
  }
    ? {
        independentCombinators?: false;
      }
    : {
        /**
         * Allows and/or configuration between rules
         */
        independentCombinators: true;
      }) & {
    /**
     * Enables debug logging for QueryBuilder and React DnD
     */
    debugMode?: boolean;
    /**
     * When `debugMode` is `true`, each log object will be passed to
     * this function (otherwise `console.log` is used)
     */
    onLog?(obj: any): void;
    /**
     * Initial query object for uncontrolled components
     */
    defaultQuery?: RG;
    /**
     * Query object for controlled components
     */
    query?: RG;
    /**
     * The array of fields that should be used. Each field should be an object
     * with {name: String, label: String}
     */
    fields?: Field[] | OptionGroup<Field>[] | Record<string, Field>;
    /**
     * The array of operators that should be used.
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
    operators?: NameLabelPair[] | OptionGroup[];
    /**
     * The array of combinators that should be used for RuleGroups.
     * @default
     * [
     *     {name: 'and', label: 'AND'},
     *     {name: 'or', label: 'OR'},
     * ]
     */
    combinators?: NameLabelPair[] | OptionGroup[];
    controlElements?: Partial<Controls>;
    enableMountQueryChange?: boolean;
    /**
     * The default field for new rules. This can be a string identifying the
     * default field, or a function that returns a field name.
     */
    getDefaultField?: string | ((fieldsData: Field[] | OptionGroup<Field>[]) => string);
    /**
     * The default operator for new rules. This can be a string identifying the
     * default operator, or a function that returns an operator name.
     */
    getDefaultOperator?: string | ((field: string) => string);
    /**
     * Returns the default value for new rules.
     */
    getDefaultValue?(rule: RuleType): any;
    /**
     * This is a callback function invoked to get the list of allowed
     * operators for the given field. If `null` is returned, the default
     * operators are used.
     */
    getOperators?(field: string): NameLabelPair[] | OptionGroup[] | null;
    /**
     * This is a callback function invoked to get the type of `ValueEditor`
     * for the given field and operator.
     */
    getValueEditorType?(field: string, operator: string): ValueEditorType;
    /**
     * This is a callback function invoked to get the list of valid
     * value sources for a given field and operator. The return value must
     * be an array that includes at least one of the valid value source:
     * "value", "field", or both.
     */
    getValueSources?: (field: string, operator: string) => ValueSources;
    /**
     * This is a callback function invoked to get the `type` of `<input />`
     * for the given field and operator (only applicable when
     * `getValueEditorType` returns `"text"` or a falsy value). If no
     * function is provided, `"text"` is used as the default.
     */
    getInputType?(field: string, operator: string): string | null;
    /**
     * This is a callback function invoked to get the list of allowed
     * values for the given field and operator (only applicable when
     * `getValueEditorType` returns `"select"` or `"radio"`). If no
     * function is provided, an empty array is used as the default.
     */
    getValues?(field: string, operator: string): NameLabelPair[] | OptionGroup[];
    /**
     * This callback is invoked before a new rule is added. The function should either manipulate
     * the rule and return it, or return `false` to cancel the addition of the rule.
     */
    onAddRule?(rule: RuleType, parentPath: number[], query: RG): RuleType | false;
    /**
     * This callback is invoked before a new group is added. The function should either manipulate
     * the group and return it, or return `false` to cancel the addition of the group.
     */
    onAddGroup?(ruleGroup: RG, parentPath: number[], query: RG): RG | false;
    /**
     * This is a callback function that is invoked anytime the query configuration changes.
     */
    onQueryChange?(query: RG): void;
    /**
     * This can be used to assign specific CSS classes to various controls
     * that are created by the `<QueryBuilder />`.
     */
    controlClassnames?: Partial<Classnames>;
    /**
     * This can be used to override translatable texts applied to various
     * controls that are created by the `<QueryBuilder />`.
     */
    translations?: Partial<Translations>;
    /**
     * Show the combinators between rules and rule groups instead of at the top of rule groups.
     */
    showCombinatorsBetweenRules?: boolean;
    /**
     * Show the "not" toggle for rule groups.
     */
    showNotToggle?: boolean;
    /**
     * Show the "Clone rule" and "Clone group" buttons
     */
    showCloneButtons?: boolean;
    /**
     * Show the "Lock rule" and "Lock group" buttons
     */
    showLockButtons?: boolean;
    /**
     * Reset the operator and value components when the `field` changes.
     */
    resetOnFieldChange?: boolean;
    /**
     * Reset the value component when the `operator` changes.
     */
    resetOnOperatorChange?: boolean;
    /**
     * Select the first field in the array automatically
     */
    autoSelectField?: boolean;
    /**
     * Select the first operator in the array automatically
     */
    autoSelectOperator?: boolean;
    /**
     * Adds a new default rule automatically to each new group
     */
    addRuleToNewGroups?: boolean;
    /**
     * Enables drag-and-drop features
     */
    enableDragAndDrop?: boolean;
    /**
     * Disables the entire query builder if true, or the rules and groups at
     * the specified paths (as well as all child rules/groups and subcomponents)
     * if an array of paths is provided. If the root path is specified (`disabled={[[]]}`),
     * no changes to the query are allowed.
     *
     * @deprecated This prop may be removed in a future major version. Use the `disabled`
     * property on rules and groups within the `query`/`defaultQuery` instead.
     */
    disabled?: boolean | number[][];
    /**
     * Query validation function
     */
    validator?: QueryValidator;
    /**
     * Container for custom props that are passed to all components
     */
    context?: any;
  };
