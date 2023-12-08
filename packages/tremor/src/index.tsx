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
  actionElement: TremorActionElement,
  dragHandle: TremorDragHandle,
  notToggle: TremorNotToggle,
  valueEditor: TremorValueEditor,
  valueSelector: TremorValueSelector,
} satisfies Partial<Controls<Field, string>>;

export const tremorControlClassnames = {
  notToggle: 'flex flex-row gap-1',
} satisfies Partial<Classnames>;

export const QueryBuilderTremor = getCompatContextProvider({
  key: 'tremor',
  controlClassnames: tremorControlClassnames,
  controlElements: tremorControlElements,
});
