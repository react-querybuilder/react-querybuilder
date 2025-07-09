import type {
  Classnames,
  DefaultCombinatorName,
  DefaultCombinatorNameExtended,
  DefaultOperatorName,
  MatchMode,
  Path,
  StringUnionToFullOptionArray,
} from './types';

// DO NOT ALTER OR REMOVE REGION NAMES. Some of them are used
// to generate code snippets in the documentation.

/**
 * @group Defaults
 */
export const defaultPlaceholderName = '~';
/**
 * @group Defaults
 */
export const defaultPlaceholderLabel = '------';
/**
 * Default `name` for placeholder option in the `fields` array.
 *
 * @group Defaults
 */
export const defaultPlaceholderFieldName: typeof defaultPlaceholderName = defaultPlaceholderName;
/**
 * Default `label` for placeholder option in the `fields` array.
 *
 * @group Defaults
 */
export const defaultPlaceholderFieldLabel: typeof defaultPlaceholderLabel = defaultPlaceholderLabel;
/**
 * Default `label` for placeholder option group in the `fields` array.
 *
 * @group Defaults
 */
export const defaultPlaceholderFieldGroupLabel: typeof defaultPlaceholderLabel =
  defaultPlaceholderLabel;
/**
 * Default `name` for placeholder option in the `operators` array.
 *
 * @group Defaults
 */
export const defaultPlaceholderOperatorName: typeof defaultPlaceholderName = defaultPlaceholderName;
/**
 * Default `label` for placeholder option in the `operators` array.
 *
 * @group Defaults
 */
export const defaultPlaceholderOperatorLabel: typeof defaultPlaceholderLabel =
  defaultPlaceholderLabel;
/**
 * Default `label` for placeholder option group in the `operators` array.
 *
 * @group Defaults
 */
export const defaultPlaceholderOperatorGroupLabel: typeof defaultPlaceholderLabel =
  defaultPlaceholderLabel;
/**
 * Default `name` for placeholder option in the `values` array.
 *
 * @group Defaults
 */
export const defaultPlaceholderValueName: typeof defaultPlaceholderName = defaultPlaceholderName;
/**
 * Default `label` for placeholder option in the `values` array.
 *
 * @group Defaults
 */
export const defaultPlaceholderValueLabel: typeof defaultPlaceholderLabel = defaultPlaceholderLabel;
/**
 * Default `label` for placeholder option group in the `values` array.
 *
 * @group Defaults
 */
export const defaultPlaceholderValueGroupLabel: typeof defaultPlaceholderLabel =
  defaultPlaceholderLabel;

/**
 * Default character used to `.join` and `.split` arrays.
 *
 * @group Defaults
 */
export const defaultJoinChar = ',';

export type DefaultOperators = StringUnionToFullOptionArray<DefaultOperatorName>;

/**
 * Default operator list.
 *
 * @group Defaults
 */
// #region docs-operators
export const defaultOperators: DefaultOperators = [
  { name: '=', value: '=', label: '=' },
  { name: '!=', value: '!=', label: '!=' },
  { name: '<', value: '<', label: '<' },
  { name: '>', value: '>', label: '>' },
  { name: '<=', value: '<=', label: '<=' },
  { name: '>=', value: '>=', label: '>=' },
  { name: 'contains', value: 'contains', label: 'contains' },
  { name: 'beginsWith', value: 'beginsWith', label: 'begins with' },
  { name: 'endsWith', value: 'endsWith', label: 'ends with' },
  { name: 'doesNotContain', value: 'doesNotContain', label: 'does not contain' },
  { name: 'doesNotBeginWith', value: 'doesNotBeginWith', label: 'does not begin with' },
  { name: 'doesNotEndWith', value: 'doesNotEndWith', label: 'does not end with' },
  { name: 'null', value: 'null', label: 'is null' },
  { name: 'notNull', value: 'notNull', label: 'is not null' },
  { name: 'in', value: 'in', label: 'in' },
  { name: 'notIn', value: 'notIn', label: 'not in' },
  { name: 'between', value: 'between', label: 'between' },
  { name: 'notBetween', value: 'notBetween', label: 'not between' },
];
// #endregion

/**
 * Map of default operators to their respective opposite/negating operators.
 *
 * @group Defaults
 */
export const defaultOperatorNegationMap: Record<DefaultOperatorName, DefaultOperatorName> = {
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

export type DefaultCombinators = StringUnionToFullOptionArray<DefaultCombinatorName>;

/**
 * Default combinator list.
 *
 * @group Defaults
 */
// #region docs-combinators
export const defaultCombinators: DefaultCombinators = [
  { name: 'and', value: 'and', label: 'AND' } as const,
  { name: 'or', value: 'or', label: 'OR' } as const,
];
// #endregion

export type DefaultCombinatorsExtended =
  StringUnionToFullOptionArray<DefaultCombinatorNameExtended>;

/**
 * Default combinator list, with `XOR` added.
 *
 * @group Defaults
 */
export const defaultCombinatorsExtended: DefaultCombinatorsExtended = [
  ...defaultCombinators,
  { name: 'xor', value: 'xor', label: 'XOR' } as const,
];

export type DefaultMatchModes = StringUnionToFullOptionArray<MatchMode>;

/**
 * Default match modes.
 *
 * @group Defaults
 */
// #region docs-matchmodes
export const defaultMatchModes: DefaultMatchModes = [
  { name: 'all', value: 'all', label: 'all' },
  { name: 'some', value: 'some', label: 'some' },
  { name: 'none', value: 'none', label: 'none' },
  { name: 'atLeast', value: 'atLeast', label: 'at least' },
  { name: 'atMost', value: 'atMost', label: 'at most' },
  { name: 'exactly', value: 'exactly', label: 'exactly' },
];
// #endregion

/**
 * Standard classnames applied to each component.
 *
 * @group Defaults
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
  matchMode: 'rule-matchMode',
  matchThreshold: 'rule-matchThreshold',
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
  dndGroup: 'dndGroup',
  dragHandle: 'queryBuilder-dragHandle',
  disabled: 'queryBuilder-disabled',
  lockRule: 'rule-lock',
  lockGroup: 'ruleGroup-lock',
  valueSource: 'rule-valueSource',
  valueListItem: 'rule-value-list-item',
  branches: 'queryBuilder-branches',
  justified: 'queryBuilder-justified',
  hasSubQuery: 'rule-hasSubQuery',
} as const;
// #endregion

/**
 * Default classnames for each component.
 *
 * @group Defaults
 */
export const defaultControlClassnames: Classnames = {
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
  matchMode: '',
  matchThreshold: '',
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
  betweenRules: '',
  valid: '',
  invalid: '',
  dndDragging: '',
  dndOver: '',
  dndGroup: '',
  dndCopy: '',
  disabled: '',
  valueListItem: '',
  branches: '',
  hasSubQuery: '',
} satisfies Classnames;

/**
 * Default reason codes for a group being invalid.
 *
 * @group Defaults
 */
export const groupInvalidReasons = {
  empty: 'empty',
  invalidCombinator: 'invalid combinator',
  invalidIndependentCombinators: 'invalid independent combinators',
} as const;

/**
 * Component identifiers for testing.
 *
 * @group Defaults
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
  matchModeEditor: 'match-mode-editor',
} as const;

export const LogType = {
  parentPathDisabled: 'action aborted: parent path disabled',
  pathDisabled: 'action aborted: path is disabled',
  queryUpdate: 'query updated',
  onAddRuleFalse: 'onAddRule callback returned false',
  onAddGroupFalse: 'onAddGroup callback returned false',
  onGroupRuleFalse: 'onGroupRule callback returned false',
  onGroupGroupFalse: 'onGroupGroup callback returned false',
  onMoveRuleFalse: 'onMoveRule callback returned false',
  onMoveGroupFalse: 'onMoveGroup callback returned false',
  onRemoveFalse: 'onRemove callback returned false',
  add: 'rule or group added',
  remove: 'rule or group removed',
  update: 'rule or group updated',
  move: 'rule or group moved',
  group: 'rule or group grouped with another',
} as const;

/**
 * The {@link Path} of the root group.
 *
 * @group Defaults
 */
export const rootPath: Path = [] satisfies Path;
