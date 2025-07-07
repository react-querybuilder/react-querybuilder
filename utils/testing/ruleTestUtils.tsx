import * as React from 'react';
import { forwardRef } from 'react';
import type {
  ActionProps,
  Classnames,
  ControlElementsProp,
  DragHandleProps,
  FullField,
  FullOption,
  QueryActions,
  RemoveNullability,
  RuleProps,
  Schema,
} from 'react-querybuilder';
import {
  TestID,
  defaultControlClassnames,
  defaultControlElements,
  toFullOption,
  defaultTranslations as translations,
} from 'react-querybuilder';
import { UNUSED } from './utils';

export const getFieldMapFromArray = (fieldArray: FullField[]): Record<string, FullField> =>
  Object.fromEntries(fieldArray.map(f => [f.name, toFullOption(f)]));

export const ruleDefaultFields: FullField[] = [
  { name: 'field1', value: 'field1', label: 'Field 1' },
  { name: 'field2', value: 'field2', label: 'Field 2' },
];

export const ruleFieldMap: Record<string, FullField> = getFieldMapFromArray(ruleDefaultFields);

const Button = (props: ActionProps) => (
  <button data-testid={props.testID} className={props.className} onClick={props.handleOnClick}>
    {props.label}
  </button>
);

export const ruleControls: RemoveNullability<ControlElementsProp<FullField, string>> = {
  cloneRuleAction: props => (
    <Button {...props} testID={TestID.cloneRule} label={translations.cloneRule.label} />
  ),
  fieldSelector: props => (
    <select
      data-testid={TestID.fields}
      className={props.className}
      onChange={e => props.handleOnChange(e.target.value)}>
      <option value="field">Field</option>
      <option value="any_field">Any Field</option>
    </select>
  ),
  operatorSelector: props => (
    <select
      data-testid={TestID.operators}
      className={props.className}
      onChange={e => props.handleOnChange(e.target.value)}>
      <option value="operator">Operator</option>
      <option value="any_operator">Any Operator</option>
    </select>
  ),
  valueEditor: props => (
    <input
      data-testid={TestID.valueEditor}
      className={props.className}
      type="text"
      onChange={e => props.handleOnChange(e.target.value)}
    />
  ),
  removeRuleAction: props => (
    <Button {...props} testID={TestID.removeRule} label={translations.removeRule.label} />
  ),
  dragHandle: forwardRef<HTMLSpanElement, DragHandleProps>(({ className, label }, ref) => (
    <span ref={ref} className={className}>
      {label}
    </span>
  )),
  shiftActions: props => (
    <div data-testid={TestID.shiftActions} className={props.className}>
      <button onClick={props.shiftUp}>{props.labels?.shiftUp}</button>
      <button onClick={props.shiftDown}>{props.labels?.shiftDown}</button>
    </div>
  ),
};

export const ruleClassnames: Partial<Classnames> = {
  cloneRule: 'custom-cloneRule-class',
  dragHandle: 'custom-dragHandle-class',
  fields: 'custom-fields-class',
  operators: 'custom-operators-class',
  removeRule: { 'custom-removeRule-class': true },
  rule: ['custom-rule-class'],
};

const ruleSchema = {
  fields: ruleDefaultFields,
  fieldMap: ruleFieldMap,
  controls: { ...defaultControlElements, ...ruleControls },
  classNames: { ...defaultControlClassnames, ...ruleClassnames },
  getOperators: () =>
    [
      { name: '=', label: 'is' },
      { name: '!=', label: 'is not' },
    ].map(o => toFullOption(o)),
  getValueEditorType: () => 'text',
  getValueEditorSeparator: () => null,
  getValueSources: () => [{ name: 'value', value: 'value', label: 'value' }],
  getMatchModes: () => [],
  getSubQueryBuilderProps: () => ({}),
  getInputType: () => 'text',
  getValues: () =>
    [
      { name: 'one', label: 'One' },
      { name: 'two', label: 'Two' },
    ].map(o => toFullOption(o)),
  getRuleClassname: () => '',
  showCloneButtons: false,
  validationMap: {},
  maxLevels: Infinity,
} satisfies Partial<Schema<FullOption, string>>;

const ruleActions = {
  onPropChange: () => {},
  onRuleRemove: () => {},
} satisfies Partial<QueryActions>;

export const getRuleProps = (
  mergeIntoSchema: Partial<Schema<FullOption, string>> = {},
  mergeIntoActions: Partial<QueryActions> = {}
): RuleProps => ({
  id: 'id',
  rule: {
    field: 'field', // note that this is not a valid field name based on the defaultFields
    value: 'value',
    operator: 'operator',
  },
  field: UNUSED,
  operator: UNUSED,
  value: UNUSED,
  schema: { ...ruleSchema, ...mergeIntoSchema } as Schema<FullOption, string>,
  actions: { ...ruleActions, ...mergeIntoActions } as QueryActions,
  path: [0],
  translations,
});
