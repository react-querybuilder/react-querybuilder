import type {
  FullCombinator,
  FullField,
  FullOperator,
  QueryBuilderProps,
  RuleGroupType,
  RuleGroupTypeIC,
} from 'react-querybuilder';

export type DemoOption =
  | 'showCombinatorsBetweenRules'
  | 'showNotToggle'
  | 'showShiftActions'
  | 'showCloneButtons'
  | 'showLockButtons'
  | 'showMuteButtons'
  | 'resetOnFieldChange'
  | 'resetOnOperatorChange'
  | 'autoSelectField'
  | 'autoSelectOperator'
  | 'autoSelectValue'
  | 'addRuleToNewGroups'
  | 'validateQuery'
  | 'independentCombinators'
  | 'listsAsArrays'
  | 'enableDragAndDrop'
  | 'disabled'
  | 'debugMode'
  | 'parseNumbers'
  | 'justifiedLayout'
  | 'responsiveLayout'
  | 'showBranches'
  | 'suppressStandardClassnames'
  | 'useDateTimePackage'
  | 'enableExpressions';

export type DemoOptions = Record<DemoOption, boolean>;

export type DemoOptionsHash = Partial<Record<DemoOption, 'true' | 'false'>> & { s?: string };

export type CommonRQBProps = Pick<
  QueryBuilderProps<RuleGroupType, FullField, FullOperator, FullCombinator>,
  | 'fields'
  | 'validator'
  | Exclude<
      DemoOption,
      | 'validateQuery'
      | 'independentCombinators'
      | 'justifiedLayout'
      | 'responsiveLayout'
      | 'showBranches'
      | 'useDateTimePackage'
      | 'enableExpressions'
    >
> & { independentCombinators?: boolean; justifiedLayout?: boolean; responsiveLayout?: boolean };

export type HttpsURL = `${'https'}://${string}`;

export type StyleName =
  | 'default'
  | 'antd'
  | 'bootstrap'
  | 'bulma'
  | 'chakra'
  | 'fluent'
  | 'mantine'
  | 'material'
  | 'prime'
  | 'tremor';

export interface DemoState {
  options: Partial<DemoOptions>;
  style?: StyleName;
  query?: RuleGroupType;
  queryIC?: RuleGroupTypeIC;
}
