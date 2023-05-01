import { forwardRef } from 'react';
import { defaultControlElements } from '../src/components';
import {
  defaultCombinators,
  defaultControlClassnames,
  defaultTranslations as translations,
  TestID,
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
} from '../src/types/'
import { UNUSED } from './utils';

export const createRule = (index: number): RuleType => {
  return {
    id: `rule_id_${index}`,
    field: `field_${index}`,
    operator: `operator_${index}`,
    value: `value_${index}`,
  };
};

export const ruleGroupControls: Partial<Controls> = {
  combinatorSelector: props => (
    <select
      data-testid={TestID.combinators}
      className={props.className}
      title={props.title}
      value={props.value}
      onChange={e => props.handleOnChange(e.target.value)}>
      <option value="and">AND</option>
      <option value="or">OR</option>
      <option value="any_combinator_value">Any Combinator</option>
    </select>
  ),
  addRuleAction: props => (
    <button
      data-testid={TestID.addRule}
      className={props.className}
      onClick={e => props.handleOnClick(e)}>
      +Rule
    </button>
  ),
  addGroupAction: props => (
    <button
      data-testid={TestID.addGroup}
      className={props.className}
      onClick={e => props.handleOnClick(e)}>
      +Group
    </button>
  ),
  cloneGroupAction: props => (
    <button
      data-testid={TestID.cloneGroup}
      className={props.className}
      onClick={e => props.handleOnClick(e)}>
      ⧉
    </button>
  ),
  cloneRuleAction: props => (
    <button
      data-testid={TestID.cloneRule}
      className={props.className}
      onClick={e => props.handleOnClick(e)}>
      ⧉
    </button>
  ),
  removeGroupAction: props => (
    <button
      data-testid={TestID.removeGroup}
      className={props.className}
      onClick={e => props.handleOnClick(e)}>
      x
    </button>
  ),
  removeRuleAction: props => (
    <button
      data-testid={TestID.removeRule}
      className={props.className}
      onClick={e => props.handleOnClick(e)}>
      x
    </button>
  ),
  notToggle: props => (
    <label data-testid={TestID.notToggle} className={props.className}>
      <input type="checkbox" onChange={e => props.handleOnChange(e.target.checked)} />
      Not
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
  dragHandle: forwardRef(() => <span>:</span>),
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

const ruleGroupSchema: Partial<Schema> = {
  fields: [{ name: 'field1', label: 'Field 1' }],
  combinators: defaultCombinators,
  controls: { ...defaultControlElements, ...ruleGroupControls },
  classNames: { ...defaultControlClassnames, ...ruleGroupClassnames },
  getInputType: () => 'text',
  getOperators: () => [{ name: 'operator1', label: 'Operator 1' }],
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
  showCombinatorsBetweenRules: false,
  showNotToggle: false,
  showCloneButtons: false,
  independentCombinators: false,
  validationMap: {},
  disabledPaths: [],
};

const ruleGroupActions: Partial<QueryActions> = {
  onPropChange: () => {},
  onRuleAdd: () => {},
  onGroupAdd: () => {},
};

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
