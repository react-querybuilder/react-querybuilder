import type {
  Classname,
  Combinator,
  Field,
  Operator,
  Option,
  OptionList,
  ValueSource,
} from './basic';
import type { Schema } from './propsUsingReact';
import type { RuleGroupType, RuleType } from './ruleGroups';
import type { RuleGroupTypeAny, RuleOrGroupArray } from './ruleGroupsIC';
import type { ValidationResult } from './validation';

/**
 * Base interface for all subcomponents.
 */
export interface CommonSubComponentProps {
  /**
   * CSS classNames to be applied
   *
   * This is `string` and not `Classname` because the Rule and RuleGroup
   * components run clsx() to produce the className that gets passed to
   * each subcomponent.
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
  /**
   * All subcomponents receive the schema as a prop
   */
  schema: Schema;
}

/**
 * Base interface for selectors and editors.
 */
export interface SelectorOrEditorProps extends CommonSubComponentProps {
  value?: string;
  handleOnChange(value: any): void;
}

/**
 * Base interface for all rule subcomponents.
 */
export interface CommonRuleSubComponentProps {
  rule: RuleType;
}

/**
 * Base interface for selector components.
 */
export interface BaseSelectorProps<OptType extends Option = Option> extends SelectorOrEditorProps {
  options: OptionList<OptType>;
}

/**
 * Props for all value selector components.
 */
export interface ValueSelectorProps<OptType extends Option = Option>
  extends BaseSelectorProps<OptType> {
  multiple?: boolean;
  listsAsArrays?: boolean;
}

/**
 * Props for `notToggle` components.
 */
export interface NotToggleProps extends CommonSubComponentProps {
  checked?: boolean;
  handleOnChange(checked: boolean): void;
  label?: string;
  ruleGroup: RuleGroupTypeAny;
}

/**
 * Props for `combinatorSelector` components.
 */
export interface CombinatorSelectorProps extends BaseSelectorProps<Combinator> {
  rules?: RuleOrGroupArray;
}

/**
 * Props for `fieldSelector` components.
 */
export interface FieldSelectorProps extends BaseSelectorProps<Field>, CommonRuleSubComponentProps {
  operator?: string;
}

/**
 * Props for `operatorSelector` components.
 */
export interface OperatorSelectorProps
  extends BaseSelectorProps<Operator>,
    CommonRuleSubComponentProps {
  field: string;
  fieldData: Field;
}

/**
 * Props for `valueSourceSelector` components.
 */
export interface ValueSourceSelectorProps
  extends BaseSelectorProps<Option<ValueSource>>,
    CommonRuleSubComponentProps {
  field: string;
  fieldData: Field;
}

/**
 * Utility type representing value selector props for components
 * that could potentially be any of the standard selector types.
 */
export type VersatileSelectorProps = ValueSelectorProps &
  Partial<FieldSelectorProps> &
  Partial<OperatorSelectorProps> &
  Partial<CombinatorSelectorProps>;

/**
 * Props for `dragHandle` components.
 */
export interface DragHandleProps extends CommonSubComponentProps {
  label?: string;
  ruleOrGroup: RuleGroupTypeAny | RuleType;
}

/**
 * Classnames applied to each component.
 */
export interface Classnames {
  /**
   * Root `<div>` element
   */
  queryBuilder: Classname;
  /**
   * `<div>` containing the RuleGroup
   */
  ruleGroup: Classname;
  /**
   * `<div>` containing the RuleGroup header controls
   */
  header: Classname;
  /**
   * `<div>` containing the RuleGroup child rules/groups
   */
  body: Classname;
  /**
   * `<select>` control for combinators
   */
  combinators: Classname;
  /**
   * `<button>` to add a Rule
   */
  addRule: Classname;
  /**
   * `<button>` to add a RuleGroup
   */
  addGroup: Classname;
  /**
   * `<button>` to clone a Rule
   */
  cloneRule: Classname;
  /**
   * `<button>` to clone a RuleGroup
   */
  cloneGroup: Classname;
  /**
   * `<button>` to remove a RuleGroup
   */
  removeGroup: Classname;
  /**
   * `<div>` containing the Rule
   */
  rule: Classname;
  /**
   * `<select>` control for fields
   */
  fields: Classname;
  /**
   * `<select>` control for operators
   */
  operators: Classname;
  /**
   * `<input>` for the field value
   */
  value: Classname;
  /**
   * `<button>` to remove a Rule
   */
  removeRule: Classname;
  /**
   * `<label>` on the "not" toggle
   */
  notToggle: Classname;
  /**
   * `<span>` handle for dragging rules/groups
   */
  dragHandle: Classname;
  /**
   * `<button>` to lock (i.e. disable) a Rule
   */
  lockRule: Classname;
  /**
   * `<button>` to lock (i.e. disable) a RuleGroup
   */
  lockGroup: Classname;
  /**
   * Value source selector
   */
  valueSource: Classname;
}

/**
 * Functions included in the `actions` prop passed to every subcomponent.
 */
export interface QueryActions {
  onGroupAdd(group: RuleGroupTypeAny, parentPath: number[], context?: any): void;
  onGroupRemove(path: number[]): void;
  onPropChange(
    prop: Exclude<keyof RuleType | keyof RuleGroupType, 'id' | 'path'>,
    value: any,
    path: number[]
  ): void;
  onRuleAdd(rule: RuleType, parentPath: number[], context?: any): void;
  onRuleRemove(path: number[]): void;
  moveRule(oldPath: number[], newPath: number[], clone?: boolean): void;
}

/**
 * A translation for a component with `title` only.
 */
export interface Translation {
  title?: string;
}
/**
 * A translation for a component with `title` and `label`.
 */
export interface TranslationWithLabel extends Translation {
  label?: string;
}
/**
 * A translation for a component with `title` and a placeholder.
 */
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
/**
 * The shape of the `translations` prop.
 */
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
/**
 * The full `translations` interface with all properties required.
 */
export type TranslationsFull = {
  [K in keyof Translations]: { [T in keyof Translations[K]]-?: string };
};
