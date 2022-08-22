import type { ReactElement } from 'react';
import { cloneElement } from 'react';
import type { Controls, QueryBuilderProps } from 'react-querybuilder';
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

export type QueryBuilderMaterialProps = {
  children: ReactElement<QueryBuilderProps<any>>;
};

export const QueryBuilderMaterial = ({ children }: QueryBuilderMaterialProps) =>
  cloneElement(children, {
    controlElements: { ...materialControlElements, ...children.props.controlElements },
  });

export {
  MaterialActionElement,
  MaterialDragHandle,
  MaterialNotToggle,
  MaterialValueEditor,
  MaterialValueSelector,
};
