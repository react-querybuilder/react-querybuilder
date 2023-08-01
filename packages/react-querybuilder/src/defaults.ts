import type {
  Classnames,
  DefaultCombinator,
  DefaultCombinatorExtended,
  DefaultOperator,
  DefaultOperatorName,
  TranslationsFull,
} from './types/index.noReact';

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
export const defaultTranslations = {
  fields: {
    title: 'Fields',
    placeholderName: defaultPlaceholderFieldName,
    placeholderLabel: defaultPlaceholderFieldLabel,
    placeholderGroupLabel: defaultPlaceholderFieldGroupLabel,
  },
  operators: {
    title: 'Operators',
    placeholderName: defaultPlaceholderOperatorName,
    placeholderLabel: defaultPlaceholderOperatorLabel,
    placeholderGroupLabel: defaultPlaceholderOperatorGroupLabel,
  },
  value: {
    title: 'Value',
  },
  removeRule: {
    label: 'x',
    title: 'Remove rule',
  },
  removeGroup: {
    label: 'x',
    title: 'Remove group',
  },
  addRule: {
    label: '+Rule',
    title: 'Add rule',
  },
  addGroup: {
    label: '+Group',
    title: 'Add group',
  },
  combinators: {
    title: 'Combinators',
  },
  notToggle: {
    label: 'Not',
    title: 'Invert this group',
  },
  cloneRule: {
    label: '⧉',
    title: 'Clone rule',
  },
  cloneRuleGroup: {
    label: '⧉',
    title: 'Clone group',
  },
  dragHandle: {
    label: '⁞⁞',
    title: 'Drag handle',
  },
  lockRule: {
    label: '🔓',
    title: 'Lock rule',
  },
  lockGroup: {
    label: '🔓',
    title: 'Lock group',
  },
  lockRuleDisabled: {
    label: '🔒',
    title: 'Unlock rule',
  },
  lockGroupDisabled: {
    label: '🔒',
    title: 'Unlock group',
  },
  valueSourceSelector: {
    title: 'Value source',
  },
} satisfies TranslationsFull;

/**
 * Default operator list.
 */
export const defaultOperators: DefaultOperator[] = [
  { name: '=', label: '=' },
  { name: '!=', label: '!=' },
  { name: '<', label: '<' },
  { name: '>', label: '>' },
  { name: '<=', label: '<=' },
  { name: '>=', label: '>=' },
  { name: 'contains', label: 'contains' },
  { name: 'beginsWith', label: 'begins with' },
  { name: 'endsWith', label: 'ends with' },
  { name: 'doesNotContain', label: 'does not contain' },
  { name: 'doesNotBeginWith', label: 'does not begin with' },
  { name: 'doesNotEndWith', label: 'does not end with' },
  { name: 'null', label: 'is null' },
  { name: 'notNull', label: 'is not null' },
  { name: 'in', label: 'in' },
  { name: 'notIn', label: 'not in' },
  { name: 'between', label: 'between' },
  { name: 'notBetween', label: 'not between' },
];

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
export const defaultCombinators: DefaultCombinator[] = [
  { name: 'and', label: 'AND' },
  { name: 'or', label: 'OR' },
];

/**
 * Default combinator list, with `XOR` added.
 */
export const defaultCombinatorsExtended: DefaultCombinatorExtended[] = [
  ...defaultCombinators,
  { name: 'xor', label: 'XOR' },
];

/**
 * Standard classnames applied to each component.
 */
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
  dragHandle: '',
  lockRule: '',
  lockGroup: '',
  valueSource: '',
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
  onRemoveFalse: 'onRemove callback returned false',
  add: 'rule or group added',
  remove: 'rule or group removed',
  update: 'rule or group updated',
  move: 'rule or group moved',
} as const;
