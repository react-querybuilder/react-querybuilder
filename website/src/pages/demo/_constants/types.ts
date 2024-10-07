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
  | 'showBranches'
  | 'suppressStandardClassnames';

export type DemoOptions = Record<DemoOption, boolean>;

export type DemoOptionsHash = Partial<Record<DemoOption, 'true' | 'false'>> & { s?: string };

export type CommonRQBProps = Pick<
  QueryBuilderProps<RuleGroupType, FullField, FullOperator, FullCombinator>,
  | 'fields'
  | 'validator'
  | Exclude<
      DemoOption,
      'validateQuery' | 'independentCombinators' | 'justifiedLayout' | 'showBranches'
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
  | 'material'
  | 'tremor';

export interface DemoState {
  options: Partial<DemoOptions>;
  style?: StyleName;
  query?: RuleGroupType;
  queryIC?: RuleGroupTypeIC;
}
