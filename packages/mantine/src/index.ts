import type { Controls, Field } from 'react-querybuilder';
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
  notToggle: MantineNotToggle,
  valueEditor: MantineValueEditor,
  addGroupAction: MantineActionElement,
  addRuleAction: MantineActionElement,
  cloneGroupAction: MantineActionElement,
  cloneRuleAction: MantineActionElement,
  combinatorSelector: MantineValueSelector,
  fieldSelector: MantineValueSelector,
  operatorSelector: MantineValueSelector,
  lockRuleAction: MantineActionElement,
  lockGroupAction: MantineActionElement,
  removeGroupAction: MantineActionElement,
  removeRuleAction: MantineActionElement,
  valueSourceSelector: MantineValueSelector,
  shiftActions: MantineShiftActions,
} satisfies Partial<Controls<Field, string>>;

export const QueryBuilderMantine = getCompatContextProvider({
  key: 'mantine',
  controlElements: mantineControlElements,
});
