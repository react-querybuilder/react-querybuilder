import {
  CancelIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DuplicateRowIcon,
  GripperDotsVerticalIcon,
  LockIcon,
  UnlockIcon,
} from '@fluentui/react-icons-mdl2';
import * as React from 'react';
import type {
  ControlElementsProp,
  FullField,
  QueryBuilderContextProvider,
  Translations,
} from 'react-querybuilder';
import { getCompatContextProvider } from 'react-querybuilder';
import { FluentActionElement } from './FluentActionElement';
import { FluentDragHandle } from './FluentDragHandle';
import { FluentNotToggle } from './FluentNotToggle';
import { FluentShiftActions } from './FluentShiftActions';
import { FluentValueEditor } from './FluentValueEditor';
import { FluentValueSelector } from './FluentValueSelector';

export * from './FluentActionElement';
export * from './FluentDragHandle';
export * from './FluentNotToggle';
export * from './FluentShiftActions';
export * from './FluentValueEditor';
export * from './FluentValueSelector';

/**
 * @group Props
 */
export const fluentControlElements: ControlElementsProp<FullField, string> = {
  actionElement: FluentActionElement,
  dragHandle: FluentDragHandle,
  notToggle: FluentNotToggle,
  shiftActions: FluentShiftActions,
  valueEditor: FluentValueEditor,
  valueSelector: FluentValueSelector,
};

/**
 * @group Props
 */
export const fluentTranslations: Partial<Translations> = {
  removeGroup: { label: <CancelIcon /> },
  removeRule: { label: <CancelIcon /> },
  cloneRule: { label: <DuplicateRowIcon /> },
  cloneRuleGroup: { label: <DuplicateRowIcon /> },
  dragHandle: { label: <GripperDotsVerticalIcon /> },
  lockGroup: { label: <UnlockIcon /> },
  lockRule: { label: <UnlockIcon /> },
  lockGroupDisabled: { label: <LockIcon /> },
  lockRuleDisabled: { label: <LockIcon /> },
  shiftActionDown: { label: <ChevronDownIcon /> },
  shiftActionUp: { label: <ChevronUpIcon /> },
};

/**
 * @group Components
 */
export const QueryBuilderFluent: QueryBuilderContextProvider = getCompatContextProvider({
  controlElements: fluentControlElements,
  translations: fluentTranslations,
});
