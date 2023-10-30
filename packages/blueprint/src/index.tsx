import { Icon } from '@blueprintjs/core';
import * as React from 'react';
import type { Controls, Translations } from 'react-querybuilder';
import { getCompatContextProvider } from 'react-querybuilder';
import { BlueprintActionElement } from './BlueprintActionElement';
import { BlueprintNotToggle } from './BlueprintNotToggle';
import { BlueprintValueEditor } from './BlueprintValueEditor';
import { BlueprintValueSelector } from './BlueprintValueSelector';

export * from './BlueprintActionElement';
export * from './BlueprintNotToggle';
export * from './BlueprintValueEditor';
export * from './BlueprintValueSelector';

export const blueprintControlElements: Partial<Controls> = {
  notToggle: BlueprintNotToggle,
  valueEditor: BlueprintValueEditor,
  addGroupAction: BlueprintActionElement,
  addRuleAction: BlueprintActionElement,
  cloneGroupAction: BlueprintActionElement,
  cloneRuleAction: BlueprintActionElement,
  combinatorSelector: BlueprintValueSelector,
  fieldSelector: BlueprintValueSelector,
  operatorSelector: BlueprintValueSelector,
  lockRuleAction: BlueprintActionElement,
  lockGroupAction: BlueprintActionElement,
  removeGroupAction: BlueprintActionElement,
  removeRuleAction: BlueprintActionElement,
  valueSourceSelector: BlueprintValueSelector,
};

export const blueprintTranslations: Partial<Translations> = {
  removeGroup: { label: <Icon icon="cross" /> },
  removeRule: { label: <Icon icon="cross" /> },
  cloneRuleGroup: { label: <Icon icon="duplicate" /> },
  cloneRule: { label: <Icon icon="duplicate" /> },
  lockGroup: { label: <Icon icon="unlock" /> },
  lockRule: { label: <Icon icon="unlock" /> },
  lockGroupDisabled: { label: <Icon icon="lock" /> },
  lockRuleDisabled: { label: <Icon icon="lock" /> },
  dragHandle: { label: <Icon icon="drag-handle-vertical" /> },
};

export const QueryBuilderBlueprint = getCompatContextProvider({
  key: 'blueprint',
  controlElements: blueprintControlElements,
  translations: blueprintTranslations,
});
