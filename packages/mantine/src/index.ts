import type {
  ControlElementsProp,
  FullField,
  QueryBuilderContextProvider,
} from 'react-querybuilder';
import { getCompatContextProvider } from 'react-querybuilder';
import { MantineActionElement } from './MantineActionElement';
import { MantineNotToggle } from './MantineNotToggle';
import { MantineShiftActions } from './MantineShiftActions';
import { MantineValueEditor } from './MantineValueEditor';
import { MantineValueSelector } from './MantineValueSelector';

export * from './MantineActionElement';
export * from './MantineNotToggle';
export * from './MantineShiftActions';
export * from './MantineValueEditor';
export * from './MantineValueSelector';

export const mantineControlElements: ControlElementsProp<FullField, string> = {
  actionElement: MantineActionElement,
  notToggle: MantineNotToggle,
  shiftActions: MantineShiftActions,
  valueEditor: MantineValueEditor,
  valueSelector: MantineValueSelector,
};

export const QueryBuilderMantine: QueryBuilderContextProvider = getCompatContextProvider({
  controlElements: mantineControlElements,
});
