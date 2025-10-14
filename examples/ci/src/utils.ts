import type { RuleProcessor } from 'react-querybuilder';
import { defaultRuleProcessorJSONata } from 'react-querybuilder';
import type { CIOption, CIOptions, CIOptionsAction } from './types';

export const defaultOptions = {
  showCombinatorsBetweenRules: false,
  showNotToggle: false,
  showCloneButtons: false,
  resetOnFieldChange: true,
  resetOnOperatorChange: false,
  autoSelectField: true,
  autoSelectOperator: true,
  addRuleToNewGroups: false,
  useValidation: false,
  independentCombinators: false,
  enableDragAndDrop: false,
  disabled: false,
  debugMode: false,
  parseNumbers: false,
  listsAsArrays: false,
  showBranches: false,
  showShiftActions: false,
  justifiedLayout: false,
} satisfies CIOptions;

export const optionsOrder: CIOption[] = [
  'showCombinatorsBetweenRules',
  'showNotToggle',
  'showCloneButtons',
  'showShiftActions',
  'resetOnFieldChange',
  'resetOnOperatorChange',
  'autoSelectField',
  'autoSelectOperator',
  'addRuleToNewGroups',
  'useValidation',
  'independentCombinators',
  'enableDragAndDrop',
  'disabled',
  'debugMode',
  'listsAsArrays',
  'parseNumbers',
  'showBranches',
  'justifiedLayout',
];

export const optionsReducer = (
  state: CIOptions,
  action: CIOptionsAction
): CIOptions => {
  const { optionName, value } = action.payload;
  return { ...state, [optionName]: value };
};

export const jsonataRuleProcessor: RuleProcessor = (rule, options) => {
  if (options?.fieldData?.inputType === 'date') {
    return `$toMillis(${rule.field}) ${rule.operator} $toMillis("${rule.value}")`;
  }
  return defaultRuleProcessorJSONata(rule, options);
};
