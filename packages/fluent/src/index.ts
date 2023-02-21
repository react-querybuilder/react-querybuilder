import type { Controls } from '@react-querybuilder/ts';
import { getCompatContextProvider } from 'react-querybuilder';
import { FluentActionElement } from './FluentActionElement';
import { FluentDragHandle } from './FluentDragHandle';
import { FluentNotToggle } from './FluentNotToggle';
import { FluentValueEditor } from './FluentValueEditor';
import { FluentValueSelector } from './FluentValueSelector';
export {
  FluentActionElement,
  FluentDragHandle,
  FluentNotToggle,
  FluentValueEditor,
  FluentValueSelector,
};

export const fluentControlElements: Partial<Controls> = {
  dragHandle: FluentDragHandle,
  notToggle: FluentNotToggle,
  valueEditor: FluentValueEditor,
  addGroupAction: FluentActionElement,
  addRuleAction: FluentActionElement,
  cloneGroupAction: FluentActionElement,
  cloneRuleAction: FluentActionElement,
  combinatorSelector: FluentValueSelector,
  fieldSelector: FluentValueSelector,
  operatorSelector: FluentValueSelector,
  lockRuleAction: FluentActionElement,
  lockGroupAction: FluentActionElement,
  removeGroupAction: FluentActionElement,
  removeRuleAction: FluentActionElement,
  valueSourceSelector: FluentValueSelector,
};

export const QueryBuilderFluent = getCompatContextProvider({
  key: 'fluent',
  controlElements: fluentControlElements,
});
