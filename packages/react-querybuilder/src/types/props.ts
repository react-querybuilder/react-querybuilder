import type { Field, NameLabelPair, ValueEditorType } from './basic';
import type {
  RuleGroupType,
  RuleGroupTypeAny,
  RuleGroupTypeIC,
  RuleOrGroupArray,
  RuleType,
} from './ruleGroups';
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
  handleOnClick(e: React.MouseEvent): void;
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

export interface ValueSelectorProps extends SelectorEditorProps {
  options: NameLabelPair[];
}

export interface NotToggleProps extends CommonSubComponentProps {
  checked?: boolean;
  handleOnChange(checked: boolean): void;
  label?: string;
}

export interface CombinatorSelectorProps extends ValueSelectorProps {
  rules?: RuleOrGroupArray;
}

export interface FieldSelectorProps extends ValueSelectorProps {
  options: Field[];
  operator?: string;
}

export interface OperatorSelectorProps extends ValueSelectorProps {
  field: string;
  fieldData: Field;
}

export interface ValueEditorProps extends SelectorEditorProps {
  field: string;
  fieldData: Field;
  operator: string;
  type?: ValueEditorType;
  inputType?: string | null;
  values?: any[];
  value?: any;
}

export interface DragHandleProps extends CommonSubComponentProps {
  label?: string;
}

export interface Controls {
  addGroupAction: React.ComponentType<ActionWithRulesProps>;
  addRuleAction: React.ComponentType<ActionWithRulesProps>;
  cloneGroupAction: React.ComponentType<ActionWithRulesProps>;
  cloneRuleAction: React.ComponentType<ActionProps>;
  combinatorSelector: React.ComponentType<CombinatorSelectorProps>;
  dragHandle: React.ForwardRefExoticComponent<
    DragHandleProps & React.RefAttributes<HTMLSpanElement>
  >;
  fieldSelector: React.ComponentType<FieldSelectorProps>;
  notToggle: React.ComponentType<NotToggleProps>;
  operatorSelector: React.ComponentType<OperatorSelectorProps>;
  removeGroupAction: React.ComponentType<ActionWithRulesProps>;
  removeRuleAction: React.ComponentType<ActionProps>;
  rule: React.ComponentType<RuleProps>;
  ruleGroup: React.ComponentType<RuleGroupProps>;
  valueEditor: React.ComponentType<ValueEditorProps>;
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
}

export interface Schema {
  fields: Field[];
  fieldMap: { [k: string]: Field };
  classNames: Classnames;
  combinators: { name: string; label: string }[];
  controls: Controls;
  createRule(): RuleType;
  createRuleGroup(): RuleGroupTypeAny;
  getOperators(field: string): NameLabelPair[];
  getValueEditorType(field: string, operator: string): ValueEditorType;
  getInputType(field: string, operator: string): string | null;
  getValues(field: string, operator: string): NameLabelPair[];
  isRuleGroup(ruleOrGroup: RuleType | RuleGroupTypeAny): ruleOrGroup is RuleGroupTypeAny;
  onGroupAdd(group: RuleGroupTypeAny, parentPath: number[]): void;
  onGroupRemove(path: number[]): void;
  onPropChange(
    prop: Exclude<keyof RuleType | keyof RuleGroupType, 'id' | 'path'>,
    value: any,
    path: number[]
  ): void;
  onRuleAdd(rule: RuleType, parentPath: number[]): void;
  onRuleRemove(path: number[]): void;
  updateIndependentCombinator(value: string, path: number[]): void;
  moveRule(oldPath: number[], newPath: number[], clone?: boolean): void;
  showCombinatorsBetweenRules: boolean;
  showNotToggle: boolean;
  showCloneButtons: boolean;
  autoSelectField: boolean;
  addRuleToNewGroups: boolean;
  enableDragAndDrop: boolean;
  validationMap: ValidationMap;
  independentCombinators: boolean;
}

export interface Translations {
  fields: {
    title: string;
  };
  operators: {
    title: string;
  };
  value: {
    title: string;
  };
  removeRule: {
    label: string;
    title: string;
  };
  removeGroup: {
    label: string;
    title: string;
  };
  addRule: {
    label: string;
    title: string;
  };
  addGroup: {
    label: string;
    title: string;
  };
  combinators: {
    title: string;
  };
  notToggle: {
    label: string;
    title: string;
  };
  cloneRule: {
    label: string;
    title: string;
  };
  cloneRuleGroup: {
    label: string;
    title: string;
  };
  dragHandle: {
    label: string;
    title: string;
  };
}

export interface RuleGroupProps {
  id?: string;
  path: number[];
  combinator?: string;
  rules: RuleOrGroupArray;
  translations: Translations;
  schema: Schema;
  disabled?: boolean;
  not?: boolean;
  context?: any;
}

export interface RuleProps {
  id?: string;
  path: number[];
  field: string;
  operator: string;
  value: any;
  translations: Translations;
  schema: Schema;
  disabled?: boolean;
  context?: any;
}

export type QueryBuilderProps<RG extends RuleGroupType | RuleGroupTypeIC = RuleGroupType> = Omit<
  QueryBuilderPropsInternal<RG>,
  'independentCombinators'
> & {
  independentCombinators?: boolean;
};

export type QueryBuilderPropsInternal<RG extends RuleGroupType | RuleGroupTypeIC = RuleGroupType> =
  {
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
    fields?: Field[];
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
     * ]
     */
    operators?: NameLabelPair[];
    /**
     * The array of combinators that should be used for RuleGroups.
     * @default
     * [
     *     {name: 'and', label: 'AND'},
     *     {name: 'or', label: 'OR'},
     * ]
     */
    combinators?: NameLabelPair[];
    controlElements?: Partial<Controls>;
    enableMountQueryChange?: boolean;
    /**
     * The default field for new rules. This can be a string identifying the
     * default field, or a function that returns a field name.
     */
    getDefaultField?: string | ((fieldsData: Field[]) => string);
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
    getOperators?(field: string): NameLabelPair[] | null;
    /**
     * This is a callback function invoked to get the type of `ValueEditor`
     * for the given field and operator.
     */
    getValueEditorType?(field: string, operator: string): ValueEditorType;
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
    getValues?(field: string, operator: string): NameLabelPair[];
    /**
     * Allows and/or configuration between rules
     */
    independentCombinators: RG extends RuleGroupType ? false : true;
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
     * Adds a new default rule automatically to each new group
     */
    addRuleToNewGroups?: boolean;
    /**
     * Enables drag-and-drop features
     */
    enableDragAndDrop?: boolean;
    /**
     * Disables all subcomponents and prevents changes to the query
     */
    disabled?: boolean;
    /**
     * Query validation function
     */
    validator?: QueryValidator;
    /**
     * Container for custom props that are passed to all components
     */
    context?: any;
  };
