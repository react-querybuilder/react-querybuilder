import * as React from 'react';
import type {
  Classnames,
  ControlElementsProp,
  FullField,
  QueryBuilderContextProvider,
  Translations,
} from 'react-querybuilder';
import { getCompatContextProvider } from 'react-querybuilder';
import { BootstrapNotToggle } from './BootstrapNotToggle';
import { BootstrapValueEditor } from './BootstrapValueEditor';

export * from './BootstrapNotToggle';
export * from './BootstrapValueEditor';

export const bootstrapControlElements: ControlElementsProp<FullField, string> = {
  notToggle: BootstrapNotToggle,
  valueEditor: BootstrapValueEditor,
};

export const bootstrapControlClassnames: Partial<Classnames> = {
  actionElement: 'btn btn-sm',
  addGroup: 'btn-secondary',
  addRule: 'btn-primary',
  cloneGroup: 'btn-secondary',
  cloneRule: 'btn-secondary',
  lockGroup: 'btn-secondary',
  lockRule: 'btn-secondary',
  removeGroup: 'btn-danger',
  removeRule: 'btn-danger',
  // BootstrapValueEditor adds its own classnames
  // value: '',
  valueSelector: 'form-select form-select-sm',
};

export const bootstrapTranslations: Partial<Translations> = {
  removeGroup: { label: <i className="bi bi-x" /> },
  removeRule: { label: <i className="bi bi-x" /> },
  cloneRule: { label: <i className="bi bi-copy" /> },
  cloneRuleGroup: { label: <i className="bi bi-copy" /> },
  dragHandle: { label: <i className="bi bi-grip-vertical" /> },
  lockGroup: { label: <i className="bi bi-unlock" /> },
  lockRule: { label: <i className="bi bi-unlock" /> },
  lockGroupDisabled: { label: <i className="bi bi-lock" /> },
  lockRuleDisabled: { label: <i className="bi bi-lock" /> },
  shiftActionUp: { label: <i className="bi bi-chevron-compact-up" /> },
  shiftActionDown: { label: <i className="bi bi-chevron-compact-down" /> },
};

export const QueryBuilderBootstrap: QueryBuilderContextProvider = getCompatContextProvider({
  controlClassnames: bootstrapControlClassnames,
  controlElements: bootstrapControlElements,
  translations: bootstrapTranslations,
});
