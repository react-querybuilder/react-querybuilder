import { bootstrapControlClassnames } from '@react-querybuilder/bootstrap/src';
import { lazy } from 'react';
import type { QueryBuilderProps } from 'react-querybuilder/src';
import { StyleName } from '../constants';

const AntDActionElement = lazy(() => import('./AntDActionElement'));
const AntDDragHandle = lazy(() => import('./AntDDragHandle'));
const AntDNotToggle = lazy(() => import('./AntDNotToggle'));
const AntDValueEditor = lazy(() => import('./AntDValueEditor'));
const AntDValueSelector = lazy(() => import('./AntDValueSelector'));
const BootstrapDragHandle = lazy(() => import('./BootstrapDragHandle'));
const BootstrapNotToggle = lazy(() => import('./BootstrapNotToggle'));
const BootstrapValueEditor = lazy(() => import('./BootstrapValueEditor'));
const BulmaActionElement = lazy(() => import('./BulmaActionElement'));
const BulmaNotToggle = lazy(() => import('./BulmaNotToggle'));
const BulmaValueEditor = lazy(() => import('./BulmaValueEditor'));
const BulmaValueSelector = lazy(() => import('./BulmaValueSelector'));
const ChakraActionElement = lazy(() => import('./ChakraActionElement'));
const ChakraDragHandle = lazy(() => import('./ChakraDragHandle'));
const ChakraNotToggle = lazy(() => import('./ChakraNotToggle'));
const ChakraValueEditor = lazy(() => import('./ChakraValueEditor'));
const ChakraValueSelector = lazy(() => import('./ChakraValueSelector'));
const MaterialActionElement = lazy(() => import('./MaterialActionElement'));
const MaterialDragHandle = lazy(() => import('./MaterialDragHandle'));
const MaterialNotToggle = lazy(() => import('./MaterialNotToggle'));
const MaterialValueEditor = lazy(() => import('./MaterialValueEditor'));
const MaterialValueSelector = lazy(() => import('./MaterialValueSelector'));

export const styleConfigs: Record<StyleName, QueryBuilderProps> = {
  default: {},
  bootstrap: {
    controlClassnames: bootstrapControlClassnames,
    controlElements: {
      dragHandle: BootstrapDragHandle,
      notToggle: BootstrapNotToggle,
      valueEditor: BootstrapValueEditor,
    },
  },
  antd: {
    controlElements: {
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
    },
  },
  material: {
    controlElements: {
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
    },
  },
  chakra: {
    controlElements: {
      addGroupAction: ChakraActionElement,
      addRuleAction: ChakraActionElement,
      cloneGroupAction: ChakraActionElement,
      cloneRuleAction: ChakraActionElement,
      lockGroupAction: ChakraActionElement,
      lockRuleAction: ChakraActionElement,
      combinatorSelector: ChakraValueSelector,
      fieldSelector: ChakraValueSelector,
      notToggle: ChakraNotToggle,
      operatorSelector: ChakraValueSelector,
      removeGroupAction: ChakraActionElement,
      removeRuleAction: ChakraActionElement,
      valueEditor: ChakraValueEditor,
      dragHandle: ChakraDragHandle,
      valueSourceSelector: ChakraValueSelector,
    },
  },
  bulma: {
    controlElements: {
      addGroupAction: BulmaActionElement,
      addRuleAction: BulmaActionElement,
      cloneGroupAction: BulmaActionElement,
      cloneRuleAction: BulmaActionElement,
      lockGroupAction: BulmaActionElement,
      lockRuleAction: BulmaActionElement,
      combinatorSelector: BulmaValueSelector,
      fieldSelector: BulmaValueSelector,
      notToggle: BulmaNotToggle,
      operatorSelector: BulmaValueSelector,
      removeGroupAction: BulmaActionElement,
      removeRuleAction: BulmaActionElement,
      valueEditor: BulmaValueEditor,
      valueSourceSelector: BulmaValueSelector,
    },
  },
};
