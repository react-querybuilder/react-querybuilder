import type { CIOption, CIOptions, CIOptionsAction } from './types';

export const defaultOptions: CIOptions = {
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
};

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
  'parseNumbers',
];

export const optionsReducer = (
  state: CIOptions,
  action: CIOptionsAction
): CIOptions => {
  const { optionName, value } = action.payload;
  return { ...state, [optionName]: value };
};
