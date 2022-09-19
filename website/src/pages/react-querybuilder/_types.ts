import type { QueryBuilderProps } from 'react-querybuilder';

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
  | 'listsAsArrays'
  | 'enableDragAndDrop'
  | 'disabled'
  | 'debugMode'
  | 'parseNumbers'
  | 'justifiedLayout';

export type DemoOptions = Record<DemoOption, boolean>;

export type DemoOptionsHash = Partial<Record<DemoOption, 'true' | 'false'>>;

export type CommonRQBProps = Pick<
  QueryBuilderProps,
  | 'fields'
  | 'validator'
  | 'controlClassnames'
  | 'controlElements'
  | Exclude<
      DemoOption,
      'validateQuery' | 'independentCombinators' | 'parseNumbers' | 'justifiedLayout'
    >
> & { independentCombinators?: boolean; justifiedLayout?: boolean };

export type HttpsURL = `${'https'}://${string}`;
