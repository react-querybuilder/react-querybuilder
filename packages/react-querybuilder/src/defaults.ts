import type {
  Classnames,
  DefaultCombinator,
  DefaultCombinatorExtended,
  DefaultOperator,
  DefaultOperatorName,
  TranslationsFull,
} from '@react-querybuilder/ts/src/index.noReact';

const placeholderName = '~';
const placeholderLabel = '------';
export const defaultPlaceholderFieldName = placeholderName;
export const defaultPlaceholderFieldLabel = placeholderLabel;
export const defaultPlaceholderFieldGroupLabel = placeholderLabel;
export const defaultPlaceholderOperatorName = placeholderName;
export const defaultPlaceholderOperatorLabel = placeholderLabel;
export const defaultPlaceholderOperatorGroupLabel = placeholderLabel;

export const defaultJoinChar = ',';

export const defaultTranslations: TranslationsFull = {
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
};

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
};

export const defaultCombinators: DefaultCombinator[] = [
  { name: 'and', label: 'AND' },
  { name: 'or', label: 'OR' },
];

export const defaultCombinatorsExtended: DefaultCombinatorExtended[] = [
  ...defaultCombinators,
  { name: 'xor', label: 'XOR' },
];

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
} as const;

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
  operators: '',
  value: '',
  removeRule: '',
  dragHandle: '',
  lockRule: '',
  lockGroup: '',
  valueSource: '',
};

export const groupInvalidReasons = {
  empty: 'empty',
  invalidCombinator: 'invalid combinator',
  invalidIndependentCombinators: 'invalid independent combinators',
} as const;

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
} as const;
