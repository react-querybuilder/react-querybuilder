import {
  CloseOutlined,
  CopyOutlined,
  DownOutlined,
  LockOutlined,
  UnlockOutlined,
  UpOutlined,
} from '@ant-design/icons';
import * as React from 'react';
import type {
  ControlElementsProp,
  FullField,
  QueryBuilderContextProvider,
  Translations,
} from 'react-querybuilder';
import { getCompatContextProvider } from 'react-querybuilder';
import { AntDActionElement } from './AntDActionElement';
import { AntDDragHandle } from './AntDDragHandle';
import { AntDNotToggle } from './AntDNotToggle';
import { AntDShiftActions } from './AntDShiftActions';
import { AntDValueEditor } from './AntDValueEditor';
import { AntDValueSelector } from './AntDValueSelector';

export * from './AntDActionElement';
export * from './AntDDragHandle';
export * from './AntDNotToggle';
export * from './AntDShiftActions';
export * from './AntDValueEditor';
export * from './AntDValueSelector';

/**
 * @group Props
 */
export const antdControlElements: ControlElementsProp<FullField, string> = {
  actionElement: AntDActionElement,
  dragHandle: AntDDragHandle,
  notToggle: AntDNotToggle,
  shiftActions: AntDShiftActions,
  valueEditor: AntDValueEditor,
  valueSelector: AntDValueSelector,
};

/**
 * @group Props
 */
export const antdTranslations: Partial<Translations> = {
  removeGroup: { label: <CloseOutlined /> },
  removeRule: { label: <CloseOutlined /> },
  cloneRule: { label: <CopyOutlined /> },
  cloneRuleGroup: { label: <CopyOutlined /> },
  lockGroup: { label: <UnlockOutlined /> },
  lockRule: { label: <UnlockOutlined /> },
  lockGroupDisabled: { label: <LockOutlined /> },
  lockRuleDisabled: { label: <LockOutlined /> },
  shiftActionUp: { label: <UpOutlined /> },
  shiftActionDown: { label: <DownOutlined /> },
};

/**
 * @group Components
 */
export const QueryBuilderAntD: QueryBuilderContextProvider = getCompatContextProvider({
  controlElements: antdControlElements,
  translations: antdTranslations,
});
