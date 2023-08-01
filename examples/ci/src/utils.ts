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
} satisfies CIOptions;

export const optionsOrder: CIOption[] = [
  'showCombinatorsBetweenRules',
  'showNotToggle',
  'showCloneButtons',
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
];

export const optionsReducer = (
  state: CIOptions,
  action: CIOptionsAction
): CIOptions => {
  const { optionName, value } = action.payload;
  return { ...state, [optionName]: value };
};
