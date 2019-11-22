// Type definitions for react-querybuilder 2.2.1
// Project: https://github.com/sapientglobalmarkets/react-querybuilder/
// Definitions by: Jake Boone <https://github.com/jakeboone02>

import * as React from 'react';

interface NameLabelPair {
  name: string;
  label: string;
}

interface Rule {
  id: string;
  field: string;
  operator: string;
  value: any;
}

interface RuleGroup {
  id: string;
  combinator: string;
  rules: (Rule | RuleGroup)[];
  not?: boolean;
}

type ValueEditorType = 'text' | 'select' | 'checkbox' | 'radio';

interface CommonCustomControlProps {
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

interface ActionCustomControlProps extends CommonCustomControlProps {
  label?: string;
  handleOnClick?(): void;
}

interface ActionWithRulesCustomControlProps extends ActionCustomControlProps {
  /**
   * Rules already present for this group
   */
  rules?: Rule[];
}

interface SelectorEditorCustomControlProps extends CommonCustomControlProps {
  value?: string;
  handleOnChange?(value: any): void;
}

interface NotToggleCustomControlProps extends CommonCustomControlProps {
  checked?: boolean;
  handleOnChange?(checked: boolean): void;
}

interface CombinatorSelectorCustomControlProps extends SelectorEditorCustomControlProps {
  options: NameLabelPair[];
  rules?: Rule[];
}

interface FieldSelectorCustomControlProps extends SelectorEditorCustomControlProps {
  options: NameLabelPair[];
}

interface OperatorSelectorCustomControlProps extends SelectorEditorCustomControlProps {
  field?: string;
  fieldData?: Field;
  options: NameLabelPair[];
}

interface ValueEditorCustomControlProps extends SelectorEditorCustomControlProps {
  field?: string;
  fieldData?: Field;
  operator?: string;
  type?: ValueEditorType;
  inputType?: string;
  values?: any[];
}

interface Field extends NameLabelPair {
  id?: string;
  [x: string]: any;
}

interface QueryBuilderProps {
  query?: RuleGroup;
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
    addGroupAction?: React.ComponentType<ActionWithRulesCustomControlProps>;
    removeGroupAction?: React.ComponentType<ActionWithRulesCustomControlProps>;
    addRuleAction?: React.ComponentType<ActionWithRulesCustomControlProps>;
    removeRuleAction?: React.ComponentType<ActionCustomControlProps>;
    combinatorSelector?: React.ComponentType<CombinatorSelectorCustomControlProps>;
    fieldSelector?: React.ComponentType<FieldSelectorCustomControlProps>;
    operatorSelector?: React.ComponentType<OperatorSelectorCustomControlProps>;
    valueEditor?: React.ComponentType<ValueEditorCustomControlProps>;
    notToggle?: React.ComponentType<NotToggleCustomControlProps>;
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
  onQueryChange(query: RuleGroup): void;
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
  translations?: {
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
  };
  /**
   * Show the combinators between rules and rule groups instead of at the top of rule groups.
   */
  showCombinatorsBetweenRules?: boolean;
  /**
   * Show the "not" toggle for rule groups.
   */
  showNotToggle?: boolean;
}

export default class QueryBuilder extends React.Component<QueryBuilderProps> {}

/**
 * Formats a query in the requested output format.  The optional
 * `valueProcessor` argument can be used to format the values differently
 * based on a given field, operator, and value.  By default, values are
 * processed assuming the default operators are being used.
 */
export function formatQuery(
  ruleGroup: RuleGroup,
  format: 'json' | 'sql',
  valueProcessor?: (field: string, operator: string, value: any) => string
): string;
