import type { Controls } from '@react-querybuilder/ts';
import { getCompatContextProvider } from 'react-querybuilder';
import { AntDActionElement } from './AntDActionElement';
import { AntDDragHandle } from './AntDDragHandle';
import { AntDNotToggle } from './AntDNotToggle';
import { AntDValueEditor } from './AntDValueEditor';
import { AntDValueSelector } from './AntDValueSelector';
export { AntDActionElement, AntDDragHandle, AntDNotToggle, AntDValueEditor, AntDValueSelector };

export const antdControlElements: Partial<Controls> = {
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
};

export const QueryBuilderAntD = getCompatContextProvider({
  key: 'antd',
  controlElements: antdControlElements,
});
