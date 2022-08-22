import type { ReactElement } from 'react';
import { cloneElement } from 'react';
import type { Controls, QueryBuilderProps } from 'react-querybuilder';
import { AntDActionElement } from './AntDActionElement';
import { AntDDragHandle } from './AntDDragHandle';
import { AntDNotToggle } from './AntDNotToggle';
import { AntDValueEditor } from './AntDValueEditor';
import { AntDValueSelector } from './AntDValueSelector';

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

export type QueryBuilderAntDProps = {
  children: ReactElement<QueryBuilderProps<any>>;
};

export const QueryBuilderAntD = ({ children }: QueryBuilderAntDProps) =>
  cloneElement(children, {
    controlElements: { ...antdControlElements, ...children.props.controlElements },
  });

export { AntDActionElement, AntDDragHandle, AntDNotToggle, AntDValueEditor, AntDValueSelector };
