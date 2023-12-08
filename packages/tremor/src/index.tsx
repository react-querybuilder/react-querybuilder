import type { Classnames, Controls, Field } from 'react-querybuilder';
import { getCompatContextProvider } from 'react-querybuilder';
import { TremorActionElement } from './TremorActionElement';
import { TremorDragHandle } from './TremorDragHandle';
import { TremorNotToggle } from './TremorNotToggle';
import { TremorValueEditor } from './TremorValueEditor';
import { TremorValueSelector } from './TremorValueSelector';

export * from './TremorActionElement';
export * from './TremorDragHandle';
export * from './TremorNotToggle';
export * from './TremorValueEditor';
export * from './TremorValueSelector';

export const tremorControlElements = {
  dragHandle: TremorDragHandle,
  notToggle: TremorNotToggle,
  valueEditor: TremorValueEditor,
  addGroupAction: TremorActionElement,
  addRuleAction: TremorActionElement,
  cloneGroupAction: TremorActionElement,
  cloneRuleAction: TremorActionElement,
  combinatorSelector: TremorValueSelector,
  fieldSelector: TremorValueSelector,
  operatorSelector: TremorValueSelector,
  lockRuleAction: TremorActionElement,
  lockGroupAction: TremorActionElement,
  removeGroupAction: TremorActionElement,
  removeRuleAction: TremorActionElement,
  valueSourceSelector: TremorValueSelector,
} satisfies Partial<Controls<Field, string>>;

export const tremorControlClassnames = {
  notToggle: 'flex flex-row gap-1',
} satisfies Partial<Classnames>;

export const QueryBuilderTremor = getCompatContextProvider({
  key: 'tremor',
  controlClassnames: tremorControlClassnames,
  controlElements: tremorControlElements,
});
