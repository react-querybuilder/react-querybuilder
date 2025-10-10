import type {
  FullCombinator,
  FullField,
  FullOperator,
  RuleGroupTypeAny,
} from '@react-querybuilder/core';
import type { QueryBuilderProps } from 'react-querybuilder';

export type DemoOption =
  | 'showCombinatorsBetweenRules'
  | 'showNotToggle'
  | 'showCloneButtons'
  | 'showLockButtons'
  | 'showMuteButtons'
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
