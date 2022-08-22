import type { ReactElement } from 'react';
import { cloneElement } from 'react';
import type { Controls, QueryBuilderProps } from 'react-querybuilder';
import { BulmaActionElement } from './BulmaActionElement';
import { BulmaNotToggle } from './BulmaNotToggle';
import { BulmaValueEditor } from './BulmaValueEditor';
import { BulmaValueSelector } from './BulmaValueSelector';

export const bulmaControlElements: Partial<Controls> = {
  notToggle: BulmaNotToggle,
  valueEditor: BulmaValueEditor,
  addGroupAction: BulmaActionElement,
  addRuleAction: BulmaActionElement,
  cloneGroupAction: BulmaActionElement,
  cloneRuleAction: BulmaActionElement,
  combinatorSelector: BulmaValueSelector,
  fieldSelector: BulmaValueSelector,
  operatorSelector: BulmaValueSelector,
  lockRuleAction: BulmaActionElement,
  lockGroupAction: BulmaActionElement,
  removeGroupAction: BulmaActionElement,
  removeRuleAction: BulmaActionElement,
  valueSourceSelector: BulmaValueSelector,
};

export type QueryBuilderBulmaProps = {
  children: ReactElement<QueryBuilderProps<any>>;
};

export const QueryBuilderBulma = ({ children }: QueryBuilderBulmaProps) =>
  cloneElement(children, {
    controlElements: { ...bulmaControlElements, ...children.props.controlElements },
  });

export { BulmaActionElement, BulmaNotToggle, BulmaValueEditor, BulmaValueSelector };
