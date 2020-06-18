// Type definitions for react-querybuilder 3.3.0
// Project: https://github.com/sapientglobalmarkets/react-querybuilder/
// Definitions by: Jake Boone <https://github.com/jakeboone02>

import * as React from 'react';

interface NameLabelPair {
  name: string;
  label: string;
}

interface Field extends NameLabelPair {
  id?: string;
  [x: string]: any;
}

interface RuleType {
  id: string;
  field: string;
  operator: string;
  value: any;
}

interface RuleGroupType {
  id: string;
  combinator: string;
  rules: (RuleType | RuleGroupType)[];
  not?: boolean;
}

interface Schema {
  fields: Field[];
  classNames?: {},
  combinators: {name: string; label: string;}[],
  controls?: {},
  createRule?(): RuleType,
  createRuleGroup?(): RuleGroupType,
  getLevel?(id: string): number,
  isRuleGroup?(ruleOrGroup: RuleType | RuleGroupType): boolean,
  onGroupAdd?(group: RuleGroupType, parentId: string): void,
  onGroupRemove?(groupId: string, parentId: string): void,
  onPropChange?(prop: string, value: any, ruleId: string): void,
  onRuleAdd?(rule: RuleType, parentId: string): void;
  showCombinatorsBetweenRules?: boolean;
  showNotToggle?: boolean;
}

interface Translations {
  fields?: {
    title: string;
  };
  operators?: {
    title: string;
  };
  value?: {
    title: string;
  };
  removeRule?: {
    label: string;
    title: string;
  };
  removeGroup?: {
    label: string;
    title: string;
  };
  addRule?: {
    label: string;
    title: string;
  };
  addGroup?: {
    label: string;
    title: string;
  };
  combinators?: {
    title: string;
  };
  notToggle?: {
    title: string;
  };
}

type ValueEditorType = 'text' | 'select' | 'checkbox' | 'radio';

interface CommonProps {
  /**
   * CSS classNames to be applied
   */
  className: string;
  /**
   * The level of the current group
   */
  level: number;
  /**
   * The title for this control
   */
  title?: string;
}

interface ActionProps extends CommonProps {
  label?: string;
  handleOnClick?(): void;
}

interface ActionWithRulesProps extends ActionProps {
  /**
   * Rules already present for this group
   */
  rules?: RuleType[];
}

interface SelectorEditorProps extends CommonProps {
  value?: string;
  handleOnChange?(value: any): void;
}

interface NotToggleProps extends CommonProps {
  checked?: boolean;
  handleOnChange?(checked: boolean): void;
}

interface RuleGroupProps {
  id?: string;
  parentId?: string;
  combinator?: string;
  rules?: (RuleType | RuleGroupType)[];
  translations?: Translations;
  schema?: Schema;
  not?: boolean;
}

interface RuleProps {
  id?: string;
  parentId?: string;
  field?: Field;
  operator?: string;
  value?: any;
  translations: Translations;
  schema?: Schema;
}

interface CombinatorSelectorProps extends SelectorEditorProps {
  options: NameLabelPair[];
  rules?: RuleType[];
}

interface FieldSelectorProps extends SelectorEditorProps {
  options: NameLabelPair[];
  operator?: string;
}

interface OperatorSelectorProps extends SelectorEditorProps {
  field?: string;
  fieldData?: Field;
  options: NameLabelPair[];
}

interface ValueEditorProps extends SelectorEditorProps {
  field?: string;
  fieldData?: Field;
  operator?: string;
  type?: ValueEditorType;
  inputType?: string;
  values?: any[];
}

interface QueryBuilderProps {
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
  controlElements?: {
    addGroupAction?: React.ComponentType<ActionWithRulesProps>;
    removeGroupAction?: React.ComponentType<ActionWithRulesProps>;
    addRuleAction?: React.ComponentType<ActionWithRulesProps>;
    removeRuleAction?: React.ComponentType<ActionProps>;
    combinatorSelector?: React.ComponentType<CombinatorSelectorProps>;
    fieldSelector?: React.ComponentType<FieldSelectorProps>;
    operatorSelector?: React.ComponentType<OperatorSelectorProps>;
    valueEditor?: React.ComponentType<ValueEditorProps>;
    notToggle?: React.ComponentType<NotToggleProps>;
    ruleGroup?: React.ComponentType<RuleGroupCustomControlProps>;
    rule?: React.ComponentType<RuleProps>;
  };
  /**
   * This is a callback function invoked to get the list of allowed
   * operators for the given field.
   */
  getOperators?(field: string): Field[];
  /**
   * This is a callback function invoked to get the type of `ValueEditor`
   * for the given field and operator.
   */
  getValueEditorType?(field: string, operator: string): 'text' | 'select' | 'checkbox' | 'radio';
  /**
   * This is a callback function invoked to get the `type` of `<input />`
   * for the given field and operator (only applicable when
   * `getValueEditorType` returns `"text"` or a falsy value). If no
   * function is provided, `"text"` is used as the default.
   */
  getInputType?(field: string, operator: string): string;
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
  controlClassnames?: {
    /**
     * Root `<div>` element
     */
    queryBuilder?: string;
    /**
     * `<div>` containing the RuleGroup
     */
    ruleGroup?: string;
    /**
     * `<div>` containing the RuleGroup header controls
     */
    header?: string;
    /**
     * `<select>` control for combinators
     */
    combinators?: string;
    /**
     * `<button>` to add a Rule
     */
    addRule?: string;
    /**
     * `<button>` to add a RuleGroup
     */
    addGroup?: string;
    /**
     * `<button>` to remove a RuleGroup
     */
    removeGroup?: string;
    /**
     * `<div>` containing the Rule
     */
    rule?: string;
    /**
     * `<select>` control for fields
     */
    fields?: string;
    /**
     * `<select>` control for operators
     */
    operators?: string;
    /**
     * `<input>` for the field value
     */
    value?: string;
    /**
     * `<button>` to remove a Rule
     */
    removeRule?: string;
    /**
     * `<label>` on the "not" toggle
     */
    notToggle?: string;
  };
  /**
   * This can be used to override translatable texts applied to various
   * controls that are created by the `<QueryBuilder />`.
   */
  translations?: Translations;
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
}

export default class QueryBuilder extends React.Component<QueryBuilderProps> {}

export class Rule extends React.Component<RuleProps> {}

/**
 * Formats a query in the requested output format.  The optional
 * `valueProcessor` argument can be used to format the values differently
 * based on a given field, operator, and value.  By default, values are
 * processed assuming the default operators are being used.
 */
export function formatQuery(
  ruleGroup: RuleGroupType,
  format: 'json' | 'sql' | 'json_without_ids' | 'parameterized',
  valueProcessor?: (field: string, operator: string, value: any) => string
): string | { sql: string; params: string[]; };
