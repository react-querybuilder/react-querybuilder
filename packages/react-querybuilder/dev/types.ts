import type { QueryBuilderProps } from '../src';

export type DemoOption =
  | 'showCombinatorsBetweenRules'
  | 'showNotToggle'
  | 'showCloneButtons'
  | 'showLockButtons'
  | 'resetOnFieldChange'
  | 'resetOnOperatorChange'
  | 'autoSelectField'
  | 'autoSelectOperator'
  | 'addRuleToNewGroups'
  | 'validateQuery'
  | 'independentCombinators'
  | 'enableDragAndDrop'
  | 'disabled'
  | 'debugMode'
  | 'parseNumbers';

export type DemoOptions = Record<DemoOption, boolean>;

export type CommonRQBProps = Pick<
  QueryBuilderProps,
  | 'fields'
  | 'validator'
  | Exclude<DemoOption, 'validateQuery' | 'independentCombinators' | 'parseNumbers'>
> & { independentCombinators?: boolean };

export type HttpsURL = `https://${string}`;
