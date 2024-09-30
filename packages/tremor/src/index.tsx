import type {
  Classnames,
  ControlElementsProp,
  FullField,
  QueryBuilderContextProvider,
} from 'react-querybuilder';
import { getCompatContextProvider } from 'react-querybuilder';
import { TremorActionElement } from './TremorActionElement';
import { TremorNotToggle } from './TremorNotToggle';
import { TremorValueEditor } from './TremorValueEditor';
import { TremorValueSelector } from './TremorValueSelector';

export * from './TremorActionElement';
export * from './TremorNotToggle';
export * from './TremorValueEditor';
export * from './TremorValueSelector';

export const tremorControlElements: ControlElementsProp<FullField, string> = {
  actionElement: TremorActionElement,
  notToggle: TremorNotToggle,
  valueEditor: TremorValueEditor,
  valueSelector: TremorValueSelector,
};

export const tremorControlClassnames: Partial<Classnames> = {
  notToggle: 'flex flex-row gap-1',
};

export const QueryBuilderTremor: QueryBuilderContextProvider = getCompatContextProvider({
  controlClassnames: tremorControlClassnames,
  controlElements: tremorControlElements,
});
