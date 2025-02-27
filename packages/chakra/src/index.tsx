import * as React from 'react';
import {
  FaChevronDown,
  FaChevronUp,
  FaCopy,
  FaGripVertical,
  FaLock,
  FaLockOpen,
  FaTimes,
} from 'react-icons/fa';
import type {
  ControlElementsProp,
  FullField,
  QueryBuilderContextProvider,
  Translations,
} from 'react-querybuilder';
import { getCompatContextProvider } from 'react-querybuilder';
import { ChakraActionElement } from './ChakraActionElement';
import { ChakraNotToggle } from './ChakraNotToggle';
import { ChakraValueEditor } from './ChakraValueEditor';
import { ChakraValueSelector } from './ChakraValueSelector';

export * from './ChakraActionElement';
export * from './ChakraNotToggle';
export * from './ChakraValueEditor';
export * from './ChakraValueSelector';

/**
 * @group Props
 */
export const chakraControlElements: ControlElementsProp<FullField, string> = {
  actionElement: ChakraActionElement,
  valueSelector: ChakraValueSelector,
  notToggle: ChakraNotToggle,
  valueEditor: ChakraValueEditor,
};

/**
 * @group Props
 */
export const chakraTranslations: Partial<Translations> = {
  dragHandle: { label: <FaGripVertical /> },
  removeGroup: { label: <FaTimes /> },
  removeRule: { label: <FaTimes /> },
  cloneRuleGroup: { label: <FaCopy /> },
  cloneRule: { label: <FaCopy /> },
  lockGroup: { label: <FaLockOpen /> },
  lockRule: { label: <FaLockOpen /> },
  lockGroupDisabled: { label: <FaLock /> },
  lockRuleDisabled: { label: <FaLock /> },
  shiftActionDown: { label: <FaChevronDown /> },
  shiftActionUp: { label: <FaChevronUp /> },
};

/**
 * @group Components
 */
export const QueryBuilderChakra: QueryBuilderContextProvider = getCompatContextProvider({
  controlElements: chakraControlElements,
  translations: chakraTranslations,
});
