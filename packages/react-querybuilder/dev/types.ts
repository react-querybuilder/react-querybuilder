import type { Combinator, FullField, Operator, QueryBuilderProps, RuleGroupTypeAny } from '../src';

export type DemoOption =
  | 'showCombinatorsBetweenRules'
  | 'showNotToggle'
  | 'showCloneButtons'
  | 'showLockButtons'
  | 'showShiftActions'
  | 'resetOnFieldChange'
  | 'resetOnOperatorChange'
  | 'autoSelectField'
  | 'autoSelectOperator'
  | 'addRuleToNewGroups'
  | 'validateQuery'
  | 'independentCombinators'
  | 'listsAsArrays'
  | 'enableDragAndDrop'
  | 'disabled'
  | 'debugMode'
  | 'parseNumbers'
  | 'showBranches';

export type DemoOptions = Record<DemoOption, boolean>;

export type DemoOptionsHash = Partial<Record<DemoOption, 'true' | 'false'>>;

export type CommonRQBProps = Pick<
  QueryBuilderProps<RuleGroupTypeAny, FullField, Operator, Combinator>,
  | 'fields'
  | 'validator'
  | 'controlClassnames'
  | 'controlElements'
  | Exclude<
      DemoOption,
      'validateQuery' | 'independentCombinators' | 'parseNumbers' | 'showBranches'
    >
> & { independentCombinators?: boolean };

export type HttpsURL = `${'https'}://${string}`;
