import {
  ChevronDownIcon,
  ChevronUpIcon,
  CloseIcon,
  CopyIcon,
  LockIcon,
  UnlockIcon,
} from '@chakra-ui/icons';
import * as React from 'react';
import type { Controls, Field, Translations } from 'react-querybuilder';
import { getCompatContextProvider } from 'react-querybuilder';
import { ChakraActionElement } from './ChakraActionElement';
import { ChakraDragHandle } from './ChakraDragHandle';
import { ChakraNotToggle } from './ChakraNotToggle';
import { ChakraValueEditor } from './ChakraValueEditor';
import { ChakraValueSelector } from './ChakraValueSelector';

export * from './ChakraActionElement';
export * from './ChakraDragHandle';
export * from './ChakraNotToggle';
export * from './ChakraValueEditor';
export * from './ChakraValueSelector';

export const chakraControlElements = {
  actionElement: ChakraActionElement,
  valueSelector: ChakraValueSelector,
  dragHandle: ChakraDragHandle,
  notToggle: ChakraNotToggle,
  valueEditor: ChakraValueEditor,
} satisfies Partial<Controls<Field, string>>;

export const chakraTranslations = {
  removeGroup: { label: <CloseIcon /> },
  removeRule: { label: <CloseIcon /> },
  cloneRuleGroup: { label: <CopyIcon /> },
  cloneRule: { label: <CopyIcon /> },
  lockGroup: { label: <UnlockIcon /> },
  lockRule: { label: <UnlockIcon /> },
  lockGroupDisabled: { label: <LockIcon /> },
  lockRuleDisabled: { label: <LockIcon /> },
  shiftActionDown: { label: <ChevronDownIcon /> },
  shiftActionUp: { label: <ChevronUpIcon /> },
} satisfies Partial<Translations>;

export const QueryBuilderChakra = getCompatContextProvider({
  key: 'chakra',
  controlElements: chakraControlElements,
  translations: chakraTranslations,
});
