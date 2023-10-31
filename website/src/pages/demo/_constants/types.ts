import type { QueryBuilderProps, RuleGroupType, RuleGroupTypeIC } from 'react-querybuilder';

export type DemoOption =
  | 'showCombinatorsBetweenRules'
  | 'showNotToggle'
  | 'showShiftActions'
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
  | 'justifiedLayout'
  | 'showBranches';

export type DemoOptions = Record<DemoOption, boolean>;

export type DemoOptionsHash = Partial<Record<DemoOption, 'true' | 'false'>> & { s?: string };

export type CommonRQBProps = Pick<
  QueryBuilderProps,
  | 'fields'
  | 'validator'
  | Exclude<
      DemoOption,
      | 'validateQuery'
      | 'independentCombinators'
      | 'parseNumbers'
      | 'justifiedLayout'
      | 'showBranches'
    >
> & { independentCombinators?: boolean; justifiedLayout?: boolean };

export type HttpsURL = `${'https'}://${string}`;

export type StyleName =
  | 'default'
  | 'antd'
  | 'bootstrap'
  | 'bulma'
  | 'chakra'
  | 'fluent'
  | 'mantine'
  | 'material';

export interface DemoState {
  options: Partial<DemoOptions>;
  style?: StyleName;
  query?: RuleGroupType;
  queryIC?: RuleGroupTypeIC;
}
