import {
  CloseOutlined,
  CopyOutlined,
  DownOutlined,
  LockOutlined,
  UnlockOutlined,
  UpOutlined,
} from '@ant-design/icons';
import * as React from 'react';
import type { Controls, Translations } from 'react-querybuilder';
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

export const antdControlElements = {
  addGroupAction: AntDActionElement,
  addRuleAction: AntDActionElement,
  cloneGroupAction: AntDActionElement,
  cloneRuleAction: AntDActionElement,
  lockGroupAction: AntDActionElement,
  lockRuleAction: AntDActionElement,
  combinatorSelector: AntDValueSelector,
  fieldSelector: AntDValueSelector,
  notToggle: AntDNotToggle,
  operatorSelector: AntDValueSelector,
  removeGroupAction: AntDActionElement,
  removeRuleAction: AntDActionElement,
  valueEditor: AntDValueEditor,
  dragHandle: AntDDragHandle,
  valueSourceSelector: AntDValueSelector,
  shiftActions: AntDShiftActions,
} satisfies Partial<Controls>;

export const antdTranslations = {
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
} satisfies Partial<Translations>;

export const QueryBuilderAntD = getCompatContextProvider({
  key: 'antd',
  controlElements: antdControlElements,
  translations: antdTranslations,
});
