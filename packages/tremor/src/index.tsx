import type { Classnames, ControlElementsProp, FullField } from 'react-querybuilder';
import { getCompatContextProvider } from 'react-querybuilder';
import { TremorActionElement } from './TremorActionElement';
import { TremorNotToggle } from './TremorNotToggle';
import { TremorValueEditor } from './TremorValueEditor';
import { TremorValueSelector } from './TremorValueSelector';

export * from './TremorActionElement';
export * from './TremorNotToggle';
export * from './TremorValueEditor';
export * from './TremorValueSelector';

export const tremorControlElements = {
  actionElement: TremorActionElement,
  notToggle: TremorNotToggle,
  valueEditor: TremorValueEditor,
  valueSelector: TremorValueSelector,
} satisfies ControlElementsProp<FullField, string>;

export const tremorControlClassnames = {
  notToggle: 'flex flex-row gap-1',
} satisfies Partial<Classnames>;

export const QueryBuilderTremor = getCompatContextProvider({
  key: 'tremor',
  controlClassnames: tremorControlClassnames,
  controlElements: tremorControlElements,
});
