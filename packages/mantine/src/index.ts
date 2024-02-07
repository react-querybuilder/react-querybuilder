import type { Controls, FullField } from 'react-querybuilder';
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

export const mantineControlElements = {
  actionElement: MantineActionElement,
  notToggle: MantineNotToggle,
  shiftActions: MantineShiftActions,
  valueEditor: MantineValueEditor,
  valueSelector: MantineValueSelector,
} satisfies Partial<Controls<FullField, string>>;

export const QueryBuilderMantine = getCompatContextProvider({
  key: 'mantine',
  controlElements: mantineControlElements,
});
