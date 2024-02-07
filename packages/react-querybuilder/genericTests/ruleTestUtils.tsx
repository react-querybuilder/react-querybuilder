import * as React from 'react';
import { forwardRef } from 'react';
import { defaultControlElements } from '../src/components';
import {
  TestID,
  defaultControlClassnames,
  defaultTranslations as translations,
} from '../src/defaults';
import type {
  ActionProps,
  Classnames,
  Controls,
  DragHandleProps,
  Field,
  FieldSelectorProps,
  FullOption,
  OperatorSelectorProps,
  QueryActions,
  RuleProps,
  Schema,
  ShiftActionsProps,
  ValueEditorProps,
} from '../src/types';
import { toFullOption } from '../src/utils';
import { UNUSED } from './utils';

export const getFieldMapFromArray = (fieldArray: Field[]) =>
  Object.fromEntries(fieldArray.map(f => [f.name, toFullOption(f)]));

export const ruleDefaultFields = [
  { name: 'field1', label: 'Field 1' },
  { name: 'field2', label: 'Field 2' },
].map(toFullOption) satisfies Field[];

export const ruleFieldMap = getFieldMapFromArray(ruleDefaultFields);

const Button = (props: ActionProps) => (
  <button data-testid={props.testID} className={props.className} onClick={props.handleOnClick}>
    {props.label}
  </button>
);

export const ruleControls = {
  cloneRuleAction: (props: ActionProps) => (
    <Button {...props} testID={TestID.cloneRule} label={translations.cloneRule.label} />
  ),
  fieldSelector: (props: FieldSelectorProps<Field>) => (
    <select
      data-testid={TestID.fields}
      className={props.className}
      onChange={e => props.handleOnChange(e.target.value)}>
      <option value="field">Field</option>
      <option value="any_field">Any Field</option>
    </select>
  ),
  operatorSelector: (props: OperatorSelectorProps) => (
    <select
      data-testid={TestID.operators}
      className={props.className}
      onChange={e => props.handleOnChange(e.target.value)}>
      <option value="operator">Operator</option>
      <option value="any_operator">Any Operator</option>
    </select>
  ),
  valueEditor: (props: ValueEditorProps) => (
    <input
      data-testid={TestID.valueEditor}
      className={props.className}
      type="text"
      onChange={e => props.handleOnChange(e.target.value)}
    />
  ),
  removeRuleAction: (props: ActionProps) => (
    <Button {...props} testID={TestID.removeRule} label={translations.removeRule.label} />
  ),
  dragHandle: forwardRef<HTMLSpanElement, DragHandleProps>(({ className, label }, ref) => (
    <span ref={ref} className={className}>
      {label}
    </span>
  )),
  shiftActions: (props: ShiftActionsProps) => (
    <div data-testid={TestID.shiftActions} className={props.className}>
      <button onClick={props.shiftUp}>{props.labels?.shiftUp}</button>
      <button onClick={props.shiftDown}>{props.labels?.shiftDown}</button>
    </div>
  ),
} satisfies Partial<Controls<Field, string>>;

export const ruleClassnames = {
  cloneRule: 'custom-cloneRule-class',
  dragHandle: 'custom-dragHandle-class',
  fields: 'custom-fields-class',
  operators: 'custom-operators-class',
  removeRule: { 'custom-removeRule-class': true },
  rule: ['custom-rule-class'],
} satisfies Partial<Classnames>;

const ruleSchema = {
  fields: ruleDefaultFields,
  fieldMap: ruleFieldMap,
  controls: { ...defaultControlElements, ...ruleControls },
  classNames: { ...defaultControlClassnames, ...ruleClassnames },
  getOperators: () =>
    [
      { name: '=', label: 'is' },
      { name: '!=', label: 'is not' },
    ].map(toFullOption),
  getValueEditorType: () => 'text',
  getValueEditorSeparator: () => null,
  getValueSources: () => ['value'],
  getInputType: () => 'text',
  getValues: () =>
    [
      { name: 'one', label: 'One' },
      { name: 'two', label: 'Two' },
    ].map(toFullOption),
  getRuleClassname: () => '',
  showCloneButtons: false,
  validationMap: {},
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
