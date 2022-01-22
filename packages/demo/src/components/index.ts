import { lazy } from 'react';
import { QueryBuilderProps } from 'react-querybuilder';
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
    controlClassnames: {
      addGroup: 'btn btn-secondary btn-sm',
      addRule: 'btn btn-primary btn-sm',
      cloneGroup: 'btn btn-secondary btn-sm',
      cloneRule: 'btn btn-secondary btn-sm',
      lockGroup: 'btn btn-secondary btn-sm',
      lockRule: 'btn btn-secondary btn-sm',
      removeGroup: 'btn btn-danger btn-sm',
      removeRule: 'btn btn-danger btn-sm',
      combinators: 'form-select form-select-sm',
      fields: 'form-select form-select-sm',
      operators: 'form-select form-select-sm',
      value: 'form-control form-control-sm',
    },
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
    },
  },
};
