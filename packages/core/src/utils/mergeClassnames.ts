import type { Classnames } from '../types';
import { clsx } from './clsx';

type MergeClassnamesParams = (Partial<Classnames> | undefined)[];

const joinClassnamesByName = (name: keyof Classnames, args: MergeClassnamesParams) =>
  clsx(args.map(c => clsx(c?.[name])));

/**
 * Merges a list of partial {@link Classnames} definitions into a single definition.
 */
export const mergeClassnames = (...args: MergeClassnamesParams): Classnames => ({
  queryBuilder: joinClassnamesByName('queryBuilder', args),
  ruleGroup: joinClassnamesByName('ruleGroup', args),
  header: joinClassnamesByName('header', args),
  body: joinClassnamesByName('body', args),
  combinators: joinClassnamesByName('combinators', args),
  addRule: joinClassnamesByName('addRule', args),
  addGroup: joinClassnamesByName('addGroup', args),
  cloneRule: joinClassnamesByName('cloneRule', args),
  cloneGroup: joinClassnamesByName('cloneGroup', args),
  removeGroup: joinClassnamesByName('removeGroup', args),
  rule: joinClassnamesByName('rule', args),
  fields: joinClassnamesByName('fields', args),
  operators: joinClassnamesByName('operators', args),
  value: joinClassnamesByName('value', args),
  removeRule: joinClassnamesByName('removeRule', args),
  notToggle: joinClassnamesByName('notToggle', args),
  shiftActions: joinClassnamesByName('shiftActions', args),
  dragHandle: joinClassnamesByName('dragHandle', args),
  lockRule: joinClassnamesByName('lockRule', args),
  lockGroup: joinClassnamesByName('lockGroup', args),
  muteRule: joinClassnamesByName('muteRule', args),
  muteGroup: joinClassnamesByName('muteGroup', args),
  valueSource: joinClassnamesByName('valueSource', args),
  actionElement: joinClassnamesByName('actionElement', args),
  valueSelector: joinClassnamesByName('valueSelector', args),
  betweenRules: joinClassnamesByName('betweenRules', args),
  valid: joinClassnamesByName('valid', args),
  invalid: joinClassnamesByName('invalid', args),
  dndDragging: joinClassnamesByName('dndDragging', args),
  dndOver: joinClassnamesByName('dndOver', args),
  dndCopy: joinClassnamesByName('dndCopy', args),
  dndGroup: joinClassnamesByName('dndGroup', args),
  dndDropNotAllowed: joinClassnamesByName('dndDropNotAllowed', args),
  disabled: joinClassnamesByName('disabled', args),
  valueListItem: joinClassnamesByName('valueListItem', args),
  matchMode: joinClassnamesByName('matchMode', args),
  matchThreshold: joinClassnamesByName('matchThreshold', args),
  branches: joinClassnamesByName('branches', args),
  hasSubQuery: joinClassnamesByName('hasSubQuery', args),
});
