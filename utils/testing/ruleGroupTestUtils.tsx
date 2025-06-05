import * as React from 'react';
import { forwardRef } from 'react';
import type {
  ActionProps,
  Classnames,
  ControlElementsProp,
  DragHandleProps,
  FullField,
  FullOperator,
  FullOption,
  QueryActions,
  RemoveNullability,
  RuleGroupProps,
  RuleType,
  Schema,
} from 'react-querybuilder';
import {
  TestID,
  defaultCombinators,
  defaultControlClassnames,
  defaultControlElements,
  generateAccessibleDescription,
  toFullOption,
  defaultTranslations as translations,
} from 'react-querybuilder';
import { UNUSED } from './utils';

export const createRule = (index: number): RuleType => ({
  id: `rule_id_${index}`,
  field: `field_${index}`,
  operator: `operator_${index}`,
  value: `value_${index}`,
});

const Button = (props: ActionProps) => (
  <button data-testid={props.testID} className={props.className} onClick={props.handleOnClick}>
    {props.label}
  </button>
);

export const ruleGroupControls: RemoveNullability<ControlElementsProp<FullField, string>> = {
  combinatorSelector: props => (
    <select
      data-testid={TestID.combinators}
      className={props.className}
      title={props.title}
      value={props.value}
      onChange={e => props.handleOnChange(e.target.value)}>
      {defaultCombinators.map(c => (
        <option key={c.name} value={c.name}>
          {c.label}
        </option>
      ))}
      <option value="any_combinator_value">Any Combinator</option>
    </select>
  ),
  addRuleAction: props => (
    <Button {...props} testID={TestID.addRule} label={translations.addRule.label} />
  ),
  addGroupAction: props => (
    <Button {...props} testID={TestID.addGroup} label={translations.addGroup.label} />
  ),
  cloneGroupAction: props => (
    <Button {...props} testID={TestID.cloneGroup} label={translations.cloneRuleGroup.label} />
  ),
  cloneRuleAction: props => (
    <Button {...props} testID={TestID.cloneRule} label={translations.cloneRule.label} />
  ),
  removeGroupAction: props => (
    <Button {...props} testID={TestID.removeGroup} label={translations.removeGroup.label} />
  ),
  removeRuleAction: props => (
    <Button {...props} testID={TestID.removeRule} label={translations.removeRule.label} />
  ),
  notToggle: props => (
    <label data-testid={TestID.notToggle} className={props.className}>
      <input type="checkbox" onChange={e => props.handleOnChange(e.target.checked)} />
      {translations.notToggle.label}
    </label>
  ),
  fieldSelector: props => (
    <select
      data-testid={TestID.fields}
      className={props.className}
      value={props.value}
      onChange={e => props.handleOnChange(e.target.value)}>
      <option value={(props.options[0] as FullField).name}>{props.options[0].label}</option>
    </select>
  ),
  operatorSelector: props => (
    <select
      data-testid={TestID.operators}
      className={props.className}
      value={props.value}
      onChange={e => props.handleOnChange(e.target.value)}>
      <option value={(props.options[0] as FullOperator).name}>{props.options[0].label}</option>
    </select>
  ),
  valueEditor: props => (
    <input
      data-testid={TestID.valueEditor}
      className={props.className}
      value={props.value}
      onChange={e => props.handleOnChange(e.target.value)}
    />
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

export const ruleGroupClassnames: Partial<Classnames> = {
  header: 'custom-header-class',
  body: 'custom-body-class',
  combinators: 'custom-combinators-class',
  addRule: 'custom-addRule-class',
  addGroup: 'custom-addGroup-class',
  cloneGroup: 'custom-cloneGroup-class',
  removeGroup: 'custom-removeGroup-class',
  notToggle: { 'custom-notToggle-class': true },
  ruleGroup: ['custom-ruleGroup-class'],
};

const ruleGroupSchema = {
  qbId: 'qbId',
  fields: [{ name: 'field1', label: 'Field 1' }].map(o => toFullOption(o)),
  combinators: defaultCombinators,
  controls: { ...defaultControlElements, ...ruleGroupControls },
  classNames: { ...defaultControlClassnames, ...ruleGroupClassnames },
  getInputType: () => 'text',
  getOperators: () => [{ name: 'operator1', label: 'Operator 1' }].map(o => toFullOption(o)),
  getValueEditorType: () => 'text',
  getValueEditorSeparator: () => null,
  getMatchModes: () => [],
  getValueSources: () => ['value'],
  getValues: () => [],
  getRuleClassname: () => '',
  getRuleGroupClassname: () => '',
  createRule: () => createRule(0),
  createRuleGroup: () => ({
    id: 'rule_group_id_0',
    path: [0],
    rules: [],
    combinator: 'and',
  }),
  accessibleDescriptionGenerator: generateAccessibleDescription,
  showCombinatorsBetweenRules: false,
  showNotToggle: false,
  showCloneButtons: false,
  independentCombinators: false,
  validationMap: {},
  disabledPaths: [],
} satisfies Partial<Schema<FullOption, string>>;

const ruleGroupActions = {
  onPropChange: () => {},
  onRuleAdd: () => {},
  onGroupAdd: () => {},
} satisfies Partial<QueryActions>;

export const getRuleGroupProps = (
  mergeIntoSchema: Partial<Schema<FullOption, string>> = {},
  mergeIntoActions: Partial<QueryActions> = {}
): RuleGroupProps => ({
  id: 'id',
  path: [0],
  ruleGroup: { rules: [], combinator: 'and' },
  rules: [], // UNUSED
  combinator: UNUSED,
  schema: { ...ruleGroupSchema, ...mergeIntoSchema } as Schema<FullOption, string>,
  actions: { ...ruleGroupActions, ...mergeIntoActions } as QueryActions,
  translations,
  disabled: false,
});
