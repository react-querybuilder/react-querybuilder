import type { RuleValidator } from './validation';

export type ValueEditorType =
  | 'text'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'textarea'
  | 'switch'
  | 'multiselect'
  | null;

export interface NameLabelPair {
  name: string;
  label: string;
  [x: string]: any;
}

export type OptionGroup<O extends NameLabelPair = NameLabelPair> = {
  label: string;
  options: O[];
};

export interface Field extends NameLabelPair {
  id?: string;
  operators?: NameLabelPair[];
  valueEditorType?: ValueEditorType;
  inputType?: string | null;
  values?: NameLabelPair[] | OptionGroup[];
  defaultOperator?: string;
  defaultValue?: any;
  placeholder?: string;
  validator?: RuleValidator;
}

export interface DraggedItem {
  path: number[];
}
