import type {
  Classnames,
  DefaultCombinator,
  DefaultCombinatorExtended,
  DefaultOperator,
  DefaultOperatorName,
  TranslationsFull,
} from './types/index.noReact';

// DO NOT ALTER OR REMOVE REGION NAMES. Some of them are used
// to generate code snippets in the documentation.

const placeholderName = '~';
const placeholderLabel = '------';
/**
 * Default `name` for placeholder option in the `fields` array.
 */
export const defaultPlaceholderFieldName = placeholderName;
/**
 * Default `label` for placeholder option in the `fields` array.
 */
export const defaultPlaceholderFieldLabel = placeholderLabel;
/**
 * Default `label` for placeholder option group in the `fields` array.
 */
export const defaultPlaceholderFieldGroupLabel = placeholderLabel;
/**
 * Default `name` for placeholder option in the `operators` array.
 */
export const defaultPlaceholderOperatorName = placeholderName;
/**
 * Default `label` for placeholder option in the `operators` array.
 */
export const defaultPlaceholderOperatorLabel = placeholderLabel;
/**
 * Default `label` for placeholder option group in the `operators` array.
 */
export const defaultPlaceholderOperatorGroupLabel = placeholderLabel;

/**
 * Default character used to `.join` and `.split` arrays.
 */
export const defaultJoinChar = ',';

/**
 * Default configuration of translatable strings.
 */
// #region docs-translations
export const defaultTranslations = {
  fields: {
    title: 'Fields',
    placeholderName: defaultPlaceholderFieldName,
    placeholderLabel: defaultPlaceholderFieldLabel,
    placeholderGroupLabel: defaultPlaceholderFieldGroupLabel,
  } as const,
  operators: {
    title: 'Operators',
    placeholderName: defaultPlaceholderOperatorName,
    placeholderLabel: defaultPlaceholderOperatorLabel,
    placeholderGroupLabel: defaultPlaceholderOperatorGroupLabel,
  } as const,
  value: {
    title: 'Value',
  } as const,
  removeRule: {
    label: '⨯',
    title: 'Remove rule',
  } as const,
  removeGroup: {
    label: '⨯',
    title: 'Remove group',
  } as const,
  addRule: {
    label: '+ Rule',
    title: 'Add rule',
  } as const,
  addGroup: {
    label: '+ Group',
    title: 'Add group',
  } as const,
  combinators: {
    title: 'Combinators',
  } as const,
  notToggle: {
    label: 'Not',
    title: 'Invert this group',
  } as const,
  cloneRule: {
    label: '⧉',
    title: 'Clone rule',
  } as const,
  cloneRuleGroup: {
    label: '⧉',
    title: 'Clone group',
  } as const,
  shiftActionUp: {
    label: '˄',
    title: 'Shift up',
  } as const,
  shiftActionDown: {
    label: '˅',
    title: 'Shift down',
  } as const,
  dragHandle: {
    label: '⁞⁞',
    title: 'Drag handle',
  } as const,
  lockRule: {
    label: '🔓',
    title: 'Lock rule',
  } as const,
  lockGroup: {
    label: '🔓',
    title: 'Lock group',
  } as const,
  lockRuleDisabled: {
    label: '🔒',
    title: 'Unlock rule',
  } as const,
  lockGroupDisabled: {
    label: '🔒',
    title: 'Unlock group',
  } as const,
  valueSourceSelector: {
    title: 'Value source',
  } as const,
} satisfies TranslationsFull;
// #endregion

/**
 * Default operator list.
 */
// #region docs-operators
export const defaultOperators = [
  { name: '=', value: '=', label: '=' } as const,
  { name: '!=', value: '!=', label: '!=' } as const,
  { name: '<', value: '<', label: '<' } as const,
  { name: '>', value: '>', label: '>' } as const,
  { name: '<=', value: '<=', label: '<=' } as const,
  { name: '>=', value: '>=', label: '>=' } as const,
  { name: 'contains', value: 'contains', label: 'contains' } as const,
  { name: 'beginsWith', value: 'beginsWith', label: 'begins with' } as const,
  { name: 'endsWith', value: 'endsWith', label: 'ends with' } as const,
  { name: 'doesNotContain', value: 'doesNotContain', label: 'does not contain' } as const,
  { name: 'doesNotBeginWith', value: 'doesNotBeginWith', label: 'does not begin with' } as const,
  { name: 'doesNotEndWith', value: 'doesNotEndWith', label: 'does not end with' } as const,
  { name: 'null', value: 'null', label: 'is null' } as const,
  { name: 'notNull', value: 'notNull', label: 'is not null' } as const,
  { name: 'in', value: 'in', label: 'in' } as const,
  { name: 'notIn', value: 'notIn', label: 'not in' } as const,
  { name: 'between', value: 'between', label: 'between' } as const,
  { name: 'notBetween', value: 'notBetween', label: 'not between' } as const,
] satisfies DefaultOperator[];
// #endregion

/**
 * Map of default operators to their respective opposite/negating operators.
 */
export const defaultOperatorNegationMap = {
  '=': '!=',
  '!=': '=',
  '<': '>=',
  '<=': '>',
  '>': '<=',
  '>=': '<',
  beginsWith: 'doesNotBeginWith',
  doesNotBeginWith: 'beginsWith',
  endsWith: 'doesNotEndWith',
  doesNotEndWith: 'endsWith',
  contains: 'doesNotContain',
  doesNotContain: 'contains',
  between: 'notBetween',
  notBetween: 'between',
  in: 'notIn',
  notIn: 'in',
  notNull: 'null',
  null: 'notNull',
} satisfies Record<DefaultOperatorName, DefaultOperatorName>;

/**
 * Default combinator list.
 */
// #region docs-combinators
export const defaultCombinators = [
  { name: 'and', value: 'and', label: 'AND' } as const,
  { name: 'or', value: 'or', label: 'OR' } as const,
] satisfies DefaultCombinator[];
// #endregion

/**
 * Default combinator list, with `XOR` added.
 */
export const defaultCombinatorsExtended = [
  ...defaultCombinators,
  { name: 'xor', value: 'xor', label: 'XOR' } as const,
] satisfies DefaultCombinatorExtended[];

/**
 * Standard classnames applied to each component.
 */
// #region docs-standardclassnames
export const standardClassnames = {
  queryBuilder: 'queryBuilder',
  ruleGroup: 'ruleGroup',
  header: 'ruleGroup-header',
  body: 'ruleGroup-body',
  combinators: 'ruleGroup-combinators',
  addRule: 'ruleGroup-addRule',
  addGroup: 'ruleGroup-addGroup',
  cloneRule: 'rule-cloneRule',
  cloneGroup: 'ruleGroup-cloneGroup',
  removeGroup: 'ruleGroup-remove',
  notToggle: 'ruleGroup-notToggle',
  rule: 'rule',
  fields: 'rule-fields',
  operators: 'rule-operators',
  value: 'rule-value',
  removeRule: 'rule-remove',
  betweenRules: 'betweenRules',
  valid: 'queryBuilder-valid',
  invalid: 'queryBuilder-invalid',
  shiftActions: 'shiftActions',
  dndDragging: 'dndDragging',
  dndOver: 'dndOver',
  dndCopy: 'dndCopy',
  dragHandle: 'queryBuilder-dragHandle',
  disabled: 'queryBuilder-disabled',
  lockRule: 'rule-lock',
  lockGroup: 'ruleGroup-lock',
  valueSource: 'rule-valueSource',
  valueListItem: 'rule-value-list-item',
  branches: 'queryBuilder-branches',
} as const;
// #endregion

/**
 * Default classnames for each component.
 */
export const defaultControlClassnames = {
  queryBuilder: '',
  ruleGroup: '',
  header: '',
  body: '',
  combinators: '',
  addRule: '',
  addGroup: '',
  cloneRule: '',
  cloneGroup: '',
  removeGroup: '',
  notToggle: '',
  rule: '',
  fields: '',
  operators: '',
  value: '',
  removeRule: '',
  shiftActions: '',
  dragHandle: '',
  lockRule: '',
  lockGroup: '',
  valueSource: '',
  actionElement: '',
  valueSelector: '',
} satisfies Classnames;

/**
 * Default reason codes for a group being invalid.
 */
export const groupInvalidReasons = {
  empty: 'empty',
  invalidCombinator: 'invalid combinator',
  invalidIndependentCombinators: 'invalid independent combinators',
} as const;

/**
 * Component identifiers for testing.
 */
export const TestID = {
  rule: 'rule',
  ruleGroup: 'rule-group',
  inlineCombinator: 'inline-combinator',
  addGroup: 'add-group',
  removeGroup: 'remove-group',
  cloneGroup: 'clone-group',
  cloneRule: 'clone-rule',
  addRule: 'add-rule',
  removeRule: 'remove-rule',
  combinators: 'combinators',
  fields: 'fields',
  operators: 'operators',
  valueEditor: 'value-editor',
  notToggle: 'not-toggle',
  shiftActions: 'shift-actions',
  dragHandle: 'drag-handle',
  lockRule: 'lock-rule',
  lockGroup: 'lock-group',
  valueSourceSelector: 'value-source-selector',
} as const;

export const LogType = {
  parentPathDisabled: 'action aborted: parent path disabled',
  pathDisabled: 'action aborted: path is disabled',
  queryUpdate: 'query updated',
  onAddRuleFalse: 'onAddRule callback returned false',
  onAddGroupFalse: 'onAddGroup callback returned false',
  onMoveRuleFalse: 'onMoveRule callback returned false',
  onMoveGroupFalse: 'onMoveGroup callback returned false',
  onRemoveFalse: 'onRemove callback returned false',
  add: 'rule or group added',
  remove: 'rule or group removed',
  update: 'rule or group updated',
  move: 'rule or group moved',
} as const;
