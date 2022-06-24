import type { RuleGroupTypeAny, RuleOrGroupArray } from 'ruleGroupsIC';
import type { Field, NameLabelPair, OptionGroup, ValueEditorType, ValueSource } from './basic';
import type { RuleGroupType, RuleType } from './ruleGroups';
import type { ValidationResult } from './validation';

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

export interface SelectorEditorProps extends CommonSubComponentProps {
  value?: string;
  handleOnChange(value: any): void;
}

export interface BaseSelectorProps extends SelectorEditorProps {
  options: NameLabelPair[] | OptionGroup[];
}

export interface ValueSelectorProps extends BaseSelectorProps {
  multiple?: boolean;
  listsAsArrays?: boolean;
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
  listsAsArrays?: boolean;
}

export interface DragHandleProps extends CommonSubComponentProps {
  label?: string;
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

export interface Translation {
  title?: string;
}
export interface TranslationWithLabel extends Translation {
  label?: string;
}
export interface TranslationWithPlaceholders extends Translation {
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
