import type { RuleValidator } from './validation';

export type ValueEditorType = 'text' | 'select' | 'checkbox' | 'radio' | null;

export interface NameLabelPair {
  name: string;
  label: string;
  [x: string]: any;
}

export interface Field extends NameLabelPair {
  id?: string;
  operators?: NameLabelPair[];
  valueEditorType?: ValueEditorType;
  inputType?: string | null;
  values?: NameLabelPair[];
  defaultOperator?: string;
  defaultValue?: any;
  placeholder?: string;
  validator?: RuleValidator;
}

export interface DraggedItem {
  path: number[];
}
