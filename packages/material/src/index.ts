import type { Controls } from 'react-querybuilder';
import { MaterialActionElement } from './MaterialActionElement';
import { MaterialDragHandle } from './MaterialDragHandle';
import { MaterialNotToggle } from './MaterialNotToggle';
import { MaterialValueEditor } from './MaterialValueEditor';
import { MaterialValueSelector } from './MaterialValueSelector';

export const materialControlElements: Partial<Controls> = {
  addGroupAction: MaterialActionElement,
  addRuleAction: MaterialActionElement,
  cloneGroupAction: MaterialActionElement,
  cloneRuleAction: MaterialActionElement,
  lockGroupAction: MaterialActionElement,
  lockRuleAction: MaterialActionElement,
  combinatorSelector: MaterialValueSelector,
  fieldSelector: MaterialValueSelector,
  notToggle: MaterialNotToggle,
  operatorSelector: MaterialValueSelector,
  removeGroupAction: MaterialActionElement,
  removeRuleAction: MaterialActionElement,
  valueEditor: MaterialValueEditor,
  dragHandle: MaterialDragHandle,
  valueSourceSelector: MaterialValueSelector,
};

export {
  MaterialActionElement,
  MaterialDragHandle,
  MaterialNotToggle,
  MaterialValueEditor,
  MaterialValueSelector,
};
