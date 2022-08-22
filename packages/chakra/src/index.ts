import type { ReactElement } from 'react';
import { cloneElement } from 'react';
import type { Controls, QueryBuilderProps } from 'react-querybuilder';
import { ChakraActionElement } from './ChakraActionElement';
import { ChakraDragHandle } from './ChakraDragHandle';
import { ChakraNotToggle } from './ChakraNotToggle';
import { ChakraValueEditor } from './ChakraValueEditor';
import { ChakraValueSelector } from './ChakraValueSelector';

export const chakraControlElements: Partial<Controls> = {
  addGroupAction: ChakraActionElement,
  addRuleAction: ChakraActionElement,
  cloneGroupAction: ChakraActionElement,
  cloneRuleAction: ChakraActionElement,
  combinatorSelector: ChakraValueSelector,
  dragHandle: ChakraDragHandle,
  fieldSelector: ChakraValueSelector,
  notToggle: ChakraNotToggle,
  operatorSelector: ChakraValueSelector,
  lockRuleAction: ChakraActionElement,
  lockGroupAction: ChakraActionElement,
  removeGroupAction: ChakraActionElement,
  removeRuleAction: ChakraActionElement,
  valueEditor: ChakraValueEditor,
  valueSourceSelector: ChakraValueSelector,
};

export type QueryBuilderChakraProps = {
  children: ReactElement<QueryBuilderProps<any>>;
};

export const QueryBuilderChakra = ({ children }: QueryBuilderChakraProps) =>
  cloneElement(children, {
    controlElements: { ...chakraControlElements, ...children.props.controlElements },
  });

export {
  ChakraActionElement,
  ChakraDragHandle,
  ChakraNotToggle,
  ChakraValueEditor,
  ChakraValueSelector,
};
