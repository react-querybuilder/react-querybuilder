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

export interface NameLabelPair<N extends string = string> {
  name: N;
  label: string;
  [x: string]: any;
}

export type OptionGroup<Opt extends NameLabelPair = NameLabelPair> = {
  label: string;
  options: Opt[];
};

export interface Field<
  FieldName extends string = string,
  OperatorName extends string = string,
  ValueName extends string = string,
  OperatorObj extends NameLabelPair = NameLabelPair<OperatorName>,
  ValueObj extends NameLabelPair = NameLabelPair<ValueName>
> extends NameLabelPair<FieldName> {
  id?: string;
  operators?: OperatorObj[] | OptionGroup<OperatorObj>[];
  valueEditorType?: ValueEditorType | ((operator: string) => ValueEditorType);
  valueSources?: ValueSources | ((operator: string) => ValueSources);
  inputType?: string | null;
  values?: ValueObj[] | OptionGroup<ValueObj>[];
  defaultOperator?: string;
  defaultValue?: any;
  placeholder?: string;
  validator?: RuleValidator;
  comparator?: string | ((f: Field, operator: string) => boolean);
}

export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };
