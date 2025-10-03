import type { RequiredDeep } from 'type-fest';
import type { Classname, Path } from './basic';
import type { RuleGroupType, RuleType } from './ruleGroups';
import type { RuleGroupTypeAny } from './ruleGroupsIC';

/**
 * Base interface for all rule subcomponents.
 *
 * @group Props
 */
export interface CommonRuleSubComponentProps {
  rule: RuleType;
}

/**
 * Classnames applied to each component.
 *
 * @group Props
 */
export interface Classnames {
  /**
   * Classnames applied to the root `<div>` element.
   */
  queryBuilder: Classname;
  /**
   * Classnames applied to the `<div>` containing the RuleGroup.
   */
  ruleGroup: Classname;
  /**
   * Classnames applied to the `<div>` containing the RuleGroup header controls.
   */
  header: Classname;
  /**
   * Classnames applied to the `<div>` containing the RuleGroup child rules/groups.
   */
  body: Classname;
  /**
   * Classnames applied to the `<select>` control for combinators.
   */
  combinators: Classname;
  /**
   * Classnames applied to the `<button>` to add a Rule.
   */
  addRule: Classname;
  /**
   * Classnames applied to the `<button>` to add a RuleGroup.
   */
  addGroup: Classname;
  /**
   * Classnames applied to the `<button>` to clone a Rule.
   */
  cloneRule: Classname;
  /**
   * Classnames applied to the `<button>` to clone a RuleGroup.
   */
  cloneGroup: Classname;
  /**
   * Classnames applied to the `<button>` to remove a RuleGroup.
   */
  removeGroup: Classname;
  /**
   * Classnames applied to the `<div>` containing the Rule.
   */
  rule: Classname;
  /**
   * Classnames applied to the `<select>` control for fields.
   */
  fields: Classname;
  /**
   * Classnames applied to the `<select>` control for match modes.
   */
  matchMode: Classname;
  /**
   * Classnames applied to the `<input>` for match thresholds.
   */
  matchThreshold: Classname;
  /**
   * Classnames applied to the `<select>` control for operators.
   */
  operators: Classname;
  /**
   * Classnames applied to the `<input>` for the rule value.
   */
  value: Classname;
  /**
   * Classnames applied to the `<button>` to remove a Rule.
   */
  removeRule: Classname;
  /**
   * Classnames applied to the `<label>` on the "not" toggle.
   */
  notToggle: Classname;
  /**
   * Classnames applied to the `<span>` handle for dragging rules/groups.
   */
  shiftActions: Classname;
  /**
   * Classnames applied to the `<span>` handle for dragging rules/groups.
   */
  dragHandle: Classname;
  /**
   * Classnames applied to the `<button>` to lock/disable a Rule.
   */
  lockRule: Classname;
  /**
   * Classnames applied to the `<button>` to lock/disable a RuleGroup.
   */
  lockGroup: Classname;
  /**
   * Classnames applied to the `<button>` to mute a Rule.
   */
  muteRule: Classname;
  /**
   * Classnames applied to the `<button>` to mute a RuleGroup.
   */
  muteGroup: Classname;
  /**
   * Classnames applied to the `<select>` control for value sources.
   */
  valueSource: Classname;
  /**
   * Classnames applied to all action elements.
   */
  actionElement: Classname;
  /**
   * Classnames applied to all select elements.
   */
  valueSelector: Classname;
  /**
   * Classname(s) applied to inline combinator elements.
   */
  betweenRules: Classname;
  /**
   * Classname(s) applied to valid rules and groups.
   */
  valid: Classname;
  /**
   * Classname(s) applied to invalid rules and groups.
   */
  invalid: Classname;
  /**
   * Classname(s) applied to rules and groups while being dragged.
   */
  dndDragging: Classname;
  /**
   * Classname(s) applied to rules and groups hovered over by a dragged element.
   */
  dndOver: Classname;
  /**
   * Classname(s) applied to rules and groups hovered over by a dragged element
   * when the drop effect is "copy" (modifier key is pressed).
   */
  dndCopy: Classname;
  /**
   * Classname(s) applied to rules and groups hovered over by a dragged element
   * when the Ctrl key is pressed, indicating the items will form a new group.
   */
  dndGroup: Classname;
  /**
   * Classname(s) applied to rules and groups that cannot accept a drop from
   * the dragged element hovering over it.
   */
  dndDropNotAllowed: Classname;
  /**
   * Classname(s) applied to disabled elements.
   */
  disabled: Classname;
  /**
   * Classname(s) applied to muted elements.
   */
  muted: Classname;
  /**
   * Classname(s) applied to each element in a series of value editors.
   */
  valueListItem: Classname;
  /**
   * Not applied, but see CSS styles.
   */
  branches: Classname;
  /**
   * Classname(s) rules that render a subquery.
   */
  hasSubQuery: Classname;
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
 * A translation for a component with `title` only.
 *
 * @group Props
 */
export interface BaseTranslation {
  title?: string;
}
/**
 * A translation for a component with `title` and `label`.
 *
 * @group Props
 */
export interface BaseTranslationWithLabel<LabelType = string> extends BaseTranslation {
  label?: LabelType;
}
/**
 * A translation for a component with `title` and a placeholder.
 *
 * @group Props
 */
export interface BaseTranslationWithPlaceholders extends BaseTranslation, Placeholder {}
/**
 * The shape of the `translations` prop.
 *
 * @group Props
 */
export interface BaseTranslations<LabelType = string> {
  fields: BaseTranslationWithPlaceholders;
  operators: BaseTranslationWithPlaceholders;
  values: BaseTranslationWithPlaceholders;
  matchMode: BaseTranslation;
  matchThreshold: BaseTranslation;
  value: BaseTranslation;
  removeRule: BaseTranslationWithLabel<LabelType>;
  removeGroup: BaseTranslationWithLabel<LabelType>;
  addRule: BaseTranslationWithLabel<LabelType>;
  addGroup: BaseTranslationWithLabel<LabelType>;
  combinators: BaseTranslation;
  notToggle: BaseTranslationWithLabel<LabelType>;
  cloneRule: BaseTranslationWithLabel<LabelType>;
  cloneRuleGroup: BaseTranslationWithLabel<LabelType>;
  shiftActionUp: BaseTranslationWithLabel<LabelType>;
  shiftActionDown: BaseTranslationWithLabel<LabelType>;
  dragHandle: BaseTranslationWithLabel<LabelType>;
  lockRule: BaseTranslationWithLabel<LabelType>;
  lockGroup: BaseTranslationWithLabel<LabelType>;
  lockRuleDisabled: BaseTranslationWithLabel<LabelType>;
  lockGroupDisabled: BaseTranslationWithLabel<LabelType>;
  muteRule: BaseTranslationWithLabel<LabelType>;
  muteGroup: BaseTranslationWithLabel<LabelType>;
  muteRuleDisabled: BaseTranslationWithLabel<LabelType>;
  muteGroupDisabled: BaseTranslationWithLabel<LabelType>;
  valueSourceSelector: BaseTranslation;
}
/**
 * The full `translations` interface with all properties required.
 *
 * @group Props
 */
export type BaseTranslationsFull<LabelType = string> = RequiredDeep<BaseTranslations<LabelType>>;

/**
 * Functions included in the `actions` prop passed to every subcomponent.
 *
 * @group Props
 */
/* oxlint-disable typescript/no-explicit-any */
export interface QueryActions {
  onGroupAdd(group: RuleGroupTypeAny, parentPath: Path, context?: any): void;
  onGroupRemove(path: Path): void;
  onPropChange(
    prop: Exclude<keyof RuleType | keyof RuleGroupType, 'id' | 'path'>,
    value: any,
    path: Path,
    context?: any
  ): void;
  onRuleAdd(rule: RuleType, parentPath: Path, context?: any): void;
  onRuleRemove(path: Path): void;
  moveRule(oldPath: Path, newPath: Path | 'up' | 'down', clone?: boolean, context?: any): void;
  groupRule(sourcePath: Path, targetPath: Path, clone?: boolean, context?: any): void;
}
/* oxlint-enable typescript/no-explicit-any */
