import type {
  FullCombinator,
  FullField,
  FullOperator,
  QueryBuilderProps,
  RuleGroupTypeAny,
} from 'react-querybuilder';

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
  | 'showBranches'
  | 'justifiedLayout'
  | 'suppressStandardClassnames';

export type DemoOptions = Record<DemoOption, boolean>;

export type CommonRQBProps = Pick<
  QueryBuilderProps<RuleGroupTypeAny, FullField, FullOperator, FullCombinator>,
  | 'fields'
  | 'validator'
  | 'controlClassnames'
  | 'controlElements'
  | Exclude<
      DemoOption,
      | 'validateQuery'
      | 'independentCombinators'
      | 'parseNumbers'
      | 'showBranches'
      | 'justifiedLayout'
    >
> & { independentCombinators?: boolean };

export type HttpsURL = `${'https'}://${string}`;
