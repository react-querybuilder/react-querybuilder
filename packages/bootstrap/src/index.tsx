import * as React from 'react';
import type { Classnames, ControlElementsProp, FullField, Translations } from 'react-querybuilder';
import { getCompatContextProvider } from 'react-querybuilder';
import { BootstrapNotToggle } from './BootstrapNotToggle';
import { BootstrapValueEditor } from './BootstrapValueEditor';

export * from './BootstrapNotToggle';
export * from './BootstrapValueEditor';

export const bootstrapControlElements = {
  notToggle: BootstrapNotToggle,
  valueEditor: BootstrapValueEditor,
} satisfies ControlElementsProp<FullField, string>;

export const bootstrapControlClassnames = {
  actionElement: 'btn btn-sm',
  addGroup: 'btn-secondary',
  addRule: 'btn-primary',
  cloneGroup: 'btn-secondary',
  cloneRule: 'btn-secondary',
  lockGroup: 'btn-secondary',
  lockRule: 'btn-secondary',
  removeGroup: 'btn-danger',
  removeRule: 'btn-danger',
  value: 'form-control form-control-sm',
  valueSelector: 'form-select form-select-sm',
} satisfies Partial<Classnames>;

export const bootstrapTranslations = {
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
} satisfies Partial<Translations>;

export const QueryBuilderBootstrap = getCompatContextProvider({
  key: 'bootstrap',
  controlClassnames: bootstrapControlClassnames,
  controlElements: bootstrapControlElements,
  translations: bootstrapTranslations,
});
