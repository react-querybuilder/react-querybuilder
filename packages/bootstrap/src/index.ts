import type { Classnames, Controls } from 'react-querybuilder';
import { BootstrapDragHandle } from './BootstrapDragHandle';
import { BootstrapNotToggle } from './BootstrapNotToggle';
import { BootstrapValueEditor } from './BootstrapValueEditor';

export const bootstrapControlElements: Partial<Controls> = {
  dragHandle: BootstrapDragHandle,
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
};

export { BootstrapDragHandle, BootstrapNotToggle, BootstrapValueEditor };
