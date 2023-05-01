import type { Controls } from 'react-querybuilder';
import { getCompatContextProvider } from 'react-querybuilder';
import { ChakraActionElement } from './ChakraActionElement';
import { ChakraDragHandle } from './ChakraDragHandle';
import { ChakraNotToggle } from './ChakraNotToggle';
import { ChakraValueEditor } from './ChakraValueEditor';
import { ChakraValueSelector } from './ChakraValueSelector';
export {
  ChakraActionElement,
  ChakraDragHandle,
  ChakraNotToggle,
  ChakraValueEditor,
  ChakraValueSelector,
};

export const chakraControlElements: Partial<Controls> = {
  addGroupAction: ChakraActionElement,
  addRuleAction: ChakraActionElement,
  cloneGroupAction: ChakraActionElement,
  cloneRuleAction: ChakraActionElement,
  combinatorSelector: ChakraValueSelector,
  dragHandle: ChakraDragHandle,
  fieldSelector: ChakraValueSelector,
  notToggle: ChakraNotToggle,
  operatorSelector: ChakraValueSelector,
  lockRuleAction: ChakraActionElement,
  lockGroupAction: ChakraActionElement,
  removeGroupAction: ChakraActionElement,
  removeRuleAction: ChakraActionElement,
  valueEditor: ChakraValueEditor,
  valueSourceSelector: ChakraValueSelector,
};

export const QueryBuilderChakra = getCompatContextProvider({
  key: 'chakra',
  controlElements: chakraControlElements,
});
