import * as React from 'react';

export interface NameLabelPair {
  name: string;
  label: string;
}

export interface Field extends NameLabelPair {
  id?: string;
  operators?: NameLabelPair[];
  valueEditorType?: ValueEditorType;
  inputType?: string | null;
  values?: NameLabelPair[];
  defaultValue?: any;
  [x: string]: any;
  placeholder?: string;
}

export interface RuleType {
  id?: string;
  field: string;
  operator: string;
  value: any;
}

export interface RuleGroupType {
  id: string;
  parentId?: string;
  combinator: string;
  rules: (RuleType | RuleGroupType)[];
  not?: boolean;
}

export type ExportFormat = 'json' | 'sql' | 'json_without_ids' | 'parameterized';

export type ValueProcessor = (field: string, operator: string, value: any) => string;

export type ValueEditorType = 'text' | 'select' | 'checkbox' | 'radio' | null;

export interface CommonProps {
  /**
   * CSS classNames to be applied
   */
  className?: string;
  /**
   * The level of the current group
   */
  level: number;
  /**
   * The title for this control
   */
  title?: string;
  /**
   * Container for custom props that are passed to all components
   */
  context?: any;
}

export interface ActionProps extends CommonProps {
  label?: string;
  handleOnClick(e: React.MouseEvent): void;
}

export interface ActionWithRulesProps extends ActionProps {
  /**
   * Rules already present for this group
   */
  rules?: (RuleGroupType | RuleType)[];
}

export interface SelectorEditorProps extends CommonProps {
  value?: string;
  handleOnChange(value: any): void;
}

export interface ValueSelectorProps extends SelectorEditorProps {
  options: Field[];
}

export interface NotToggleProps extends CommonProps {
  checked?: boolean;
  handleOnChange(checked: boolean): void;
  label?: string;
}

export interface CombinatorSelectorProps extends ValueSelectorProps {
  options: NameLabelPair[];
  rules?: (RuleGroupType | RuleType)[];
}

export interface FieldSelectorProps extends ValueSelectorProps {
  options: NameLabelPair[];
  operator?: string;
}

export interface OperatorSelectorProps extends ValueSelectorProps {
  field: string;
  fieldData: Field;
  options: NameLabelPair[];
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

export interface Controls {
  addGroupAction: React.ComponentType<ActionWithRulesProps>;
  addRuleAction: React.ComponentType<ActionWithRulesProps>;
  combinatorSelector: React.ComponentType<CombinatorSelectorProps>;
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
}

export interface Schema {
  fields: Field[];
  classNames: Classnames;
  combinators: { name: string; label: string }[];
  controls: Controls;
  createRule(): RuleType;
  createRuleGroup(): RuleGroupType;
  getLevel(id: string): number;
  getOperators(field: string): Field[];
  getValueEditorType(field: string, operator: string): ValueEditorType;
  getInputType(field: string, operator: string): string | null;
  getValues(field: string, operator: string): NameLabelPair[];
  isRuleGroup(ruleOrGroup: RuleType | RuleGroupType): ruleOrGroup is RuleGroupType;
  onGroupAdd(group: RuleGroupType, parentId: string): void;
  onGroupRemove(groupId: string, parentId: string): void;
  onPropChange(prop: string, value: any, ruleId: string): void;
  onRuleAdd(rule: RuleType, parentId: string): void;
  onRuleRemove(id: string, parentId: string): void;
  showCombinatorsBetweenRules: boolean;
  showNotToggle: boolean;
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
}

export interface RuleGroupProps {
  id: string;
  parentId?: string;
  combinator?: string;
  rules?: (RuleType | RuleGroupType)[];
  translations: Translations;
  schema: Schema;
  not?: boolean;
  context?: any;
}

export interface RuleProps {
  id: string;
  parentId: string;
  field: string;
  operator: string;
  value: any;
  translations: Translations;
  schema: Schema;
  context?: any;
}

export interface QueryBuilderProps {
  query?: RuleGroupType;
  /**
   * The array of fields that should be used. Each field should be an object
   * with {name: String, label: String}
   */
  fields: Field[];
  /**
   * The array of operators that should be used.
   * @default
   * [
   *     {name: 'null', label: 'Is Null'},
   *     {name: 'notNull', label: 'Is Not Null'},
   *     {name: 'in', label: 'In'},
   *     {name: 'notIn', label: 'Not In'},
   *     {name: '=', label: '='},
   *     {name: '!=', label: '!='},
   *     {name: '<', label: '<'},
   *     {name: '>', label: '>'},
   *     {name: '<=', label: '<='},
   *     {name: '>=', label: '>='},
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
   * The default field for new rules.  This can be a string identifying the
   * default field, or a function that returns a field name.
   */
  getDefaultField?: string | ((fieldsData: Field[]) => string);
  /**
   * Returns the default value for new rules.
   */
  getDefaultValue?(rule: RuleType): any;
  /**
   * This is a callback function invoked to get the list of allowed
   * operators for the given field.  If `null` is returned, the default
   * operators are used.
   */
  getOperators?(field: string): Field[] | null;
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
   * This is a notification that is invoked anytime the query configuration changes.
   */
  onQueryChange(query: RuleGroupType): void;
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
   * Reset the operator and value components when the `field` changes.
   */
  resetOnFieldChange?: boolean;
  /**
   * Reset the value component when the `operator` changes.
   */
  resetOnOperatorChange?: boolean;
  /**
   * Container for custom props that are passed to all components
   */
  context?: any;
}
