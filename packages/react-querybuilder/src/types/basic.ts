import type { RuleValidator } from './validation';

export type ValueSource = 'value' | 'field';

export type ValueEditorType =
  | 'text'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'textarea'
  | 'switch'
  | 'multiselect'
  | null;

export type ValueSources = ['value'] | ['value', 'field'] | ['field', 'value'] | ['field'];

export interface NameLabelPair {
  name: string;
  label: string;
  [x: string]: any;
}

export type OptionGroup<Opt extends NameLabelPair = NameLabelPair> = {
  label: string;
  options: Opt[];
};

export interface Field extends NameLabelPair {
  id?: string;
  operators?: NameLabelPair[] | OptionGroup[];
  valueEditorType?: ValueEditorType | ((operator: string) => ValueEditorType);
  valueSources?: ValueSources | ((operator: string) => ValueSources);
  inputType?: string | null;
  values?: NameLabelPair[] | OptionGroup[];
  defaultOperator?: string;
  defaultValue?: any;
  placeholder?: string;
  validator?: RuleValidator;
  comparator?: string | ((f: Field, operator: string) => boolean);
}

export interface DraggedItem {
  path: number[];
}
