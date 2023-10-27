import * as React from 'react';
import type { Classnames, Controls, Translations } from 'react-querybuilder';
import { getCompatContextProvider } from 'react-querybuilder';
import { BootstrapNotToggle } from './BootstrapNotToggle';
import { BootstrapValueEditor } from './BootstrapValueEditor';

export * from './BootstrapNotToggle';
export * from './BootstrapValueEditor';

export const bootstrapControlElements: Partial<Controls> = {
  notToggle: BootstrapNotToggle,
  valueEditor: BootstrapValueEditor,
};

export const bootstrapControlClassnames: Partial<Classnames> = {
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
  valueSource: 'form-select form-select-sm',
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

export const QueryBuilderBootstrap = getCompatContextProvider({
  key: 'bootstrap',
  controlClassnames: bootstrapControlClassnames,
  controlElements: bootstrapControlElements,
  translations: bootstrapTranslations,
});
