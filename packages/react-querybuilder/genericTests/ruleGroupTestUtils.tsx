import * as React from 'react';
import { forwardRef } from 'react';
import { defaultControlElements } from '../src/components';
import {
  TestID,
  defaultCombinators,
  defaultControlClassnames,
  defaultTranslations as translations,
} from '../src/defaults';
import type {
  Classnames,
  Controls,
  Field,
  Option,
  QueryActions,
  RuleGroupProps,
  RuleType,
  Schema,
} from '../src/types';
import { generateAccessibleDescription, toFullOption } from '../src/utils';
import { UNUSED } from './utils';

export const createRule = (index: number) =>
  ({
    id: `rule_id_${index}`,
    field: `field_${index}`,
    operator: `operator_${index}`,
    value: `value_${index}`,
  } satisfies RuleType);

export const ruleGroupControls = {
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
    <button
      data-testid={TestID.addRule}
      className={props.className}
      onClick={e => props.handleOnClick(e)}>
      {translations.addRule.label}
    </button>
  ),
  addGroupAction: props => (
    <button
      data-testid={TestID.addGroup}
      className={props.className}
      onClick={e => props.handleOnClick(e)}>
      {translations.addGroup.label}
    </button>
  ),
  cloneGroupAction: props => (
    <button
      data-testid={TestID.cloneGroup}
      className={props.className}
      onClick={e => props.handleOnClick(e)}>
      {translations.cloneRuleGroup.label}
    </button>
  ),
  cloneRuleAction: props => (
    <button
      data-testid={TestID.cloneRule}
      className={props.className}
      onClick={e => props.handleOnClick(e)}>
      {translations.cloneRule.label}
    </button>
  ),
  removeGroupAction: props => (
    <button
      data-testid={TestID.removeGroup}
      className={props.className}
      onClick={e => props.handleOnClick(e)}>
      {translations.removeGroup.label}
    </button>
  ),
  removeRuleAction: props => (
    <button
      data-testid={TestID.removeRule}
      className={props.className}
      onClick={e => props.handleOnClick(e)}>
      {translations.removeRule.label}
    </button>
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
      <option value={(props.options[0] as Field).name}>{props.options[0].label}</option>
    </select>
  ),
  operatorSelector: props => (
    <select
      data-testid={TestID.operators}
      className={props.className}
      value={props.value}
      onChange={e => props.handleOnChange(e.target.value)}>
      <option value={(props.options[0] as Option).name}>{props.options[0].label}</option>
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
  dragHandle: forwardRef(({ className, label }, ref) => (
    <span ref={ref} className={className}>
      {label}
    </span>
  )),
} satisfies Partial<Controls>;

export const ruleGroupClassnames = {
  header: 'custom-header-class',
  body: 'custom-body-class',
  combinators: 'custom-combinators-class',
  addRule: 'custom-addRule-class',
  addGroup: 'custom-addGroup-class',
  cloneGroup: 'custom-cloneGroup-class',
  removeGroup: 'custom-removeGroup-class',
  notToggle: { 'custom-notToggle-class': true },
  ruleGroup: ['custom-ruleGroup-class'],
} satisfies Partial<Classnames>;

const ruleGroupSchema = {
  qbId: 'qbId',
  fields: [{ name: 'field1', label: 'Field 1' }].map(toFullOption),
  combinators: defaultCombinators,
  controls: { ...defaultControlElements, ...ruleGroupControls },
  classNames: { ...defaultControlClassnames, ...ruleGroupClassnames },
  getInputType: () => 'text',
  getOperators: () => [{ name: 'operator1', label: 'Operator 1' }].map(toFullOption),
  getValueEditorType: () => 'text',
  getValueEditorSeparator: () => null,
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
} satisfies Partial<Schema>;

const ruleGroupActions = {
  onPropChange: () => {},
  onRuleAdd: () => {},
  onGroupAdd: () => {},
} satisfies Partial<QueryActions>;

export const getRuleGroupProps = (
  mergeIntoSchema: Partial<Schema> = {},
  mergeIntoActions: Partial<QueryActions> = {}
): RuleGroupProps => ({
  id: 'id',
  path: [0],
  ruleGroup: { rules: [], combinator: 'and' },
  rules: [], // UNUSED
  combinator: UNUSED,
  schema: { ...ruleGroupSchema, ...mergeIntoSchema } as Schema,
  actions: { ...ruleGroupActions, ...mergeIntoActions } as QueryActions,
  translations,
  disabled: false,
});
