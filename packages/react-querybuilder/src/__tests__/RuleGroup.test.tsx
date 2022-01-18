import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { forwardRef } from 'react';
import { simulateDrag, simulateDragDrop, wrapWithTestBackend } from 'react-dnd-test-utils';
import { act } from 'react-dom/test-utils';
import { defaultCombinators, defaultTranslations, standardClassnames, TestID } from '../defaults';
import { Rule } from '../Rule';
import { RuleGroup as RuleGroupOriginal } from '../RuleGroup';
import type {
  ActionProps,
  Classnames,
  Controls,
  Field,
  NameLabelPair,
  RuleGroupArray,
  RuleGroupICArray,
  RuleGroupProps,
  RuleGroupType,
  RuleType,
  Schema,
  ValidationResult,
  ValueSelectorProps,
} from '../types';

const [RuleGroup, getDndBackendOriginal] = wrapWithTestBackend(RuleGroupOriginal);
// This is just a type guard against `undefined`
const getDndBackend = () => getDndBackendOriginal()!;

const getHandlerId = (el: HTMLElement, dragDrop: 'drag' | 'drop') => () =>
  el.getAttribute(`data-${dragDrop}monitorid`);

// helper functions
const _createRule = (index: number): RuleType => {
  return {
    id: `rule_id_${index}`,
    field: `field_${index}`,
    operator: `operator_${index}`,
    value: `value_${index}`,
  };
};
const _createRuleGroup = (
  index: number,
  parentPath: number[],
  rules: RuleGroupArray
): RuleGroupType => {
  const thisPath = parentPath.concat([index]);
  return {
    id: 'rule_group_id_' + index,
    path: thisPath,
    rules,
    combinator: 'and',
  };
};

const controls: Partial<Controls> = {
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
      <option value={(props.options[0] as NameLabelPair).name}>{props.options[0].label}</option>
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
  rule: Rule,
  ruleGroup: RuleGroup,
  dragHandle: forwardRef(() => <span>:</span>),
};
const classNames: Partial<Classnames> = {
  header: 'custom-header-class',
  body: 'custom-body-class',
  combinators: 'custom-combinators-class',
  addRule: 'custom-addRule-class',
  addGroup: 'custom-addGroup-class',
  cloneGroup: 'custom-cloneGroup-class',
  removeGroup: 'custom-removeGroup-class',
  notToggle: 'custom-notToggle-class',
  ruleGroup: 'custom-ruleGroup-class',
};
const schema: Partial<Schema> = {
  fields: [{ name: 'field1', label: 'Field 1' }],
  combinators: defaultCombinators,
  controls: controls as Controls,
  classNames: classNames as Classnames,
  getInputType: () => 'text',
  getOperators: () => [{ name: 'operator1', label: 'Operator 1' }],
  getValueEditorType: () => 'text',
  getValues: () => [],
  isRuleGroup: (_rule): _rule is RuleGroupType => {
    return false;
  },
  onPropChange: (_prop, _value, _path) => {},
  onRuleAdd: (_rule, _parentPath) => {},
  onGroupAdd: (_ruleGroup, _parentPath) => {},
  createRule: () => _createRule(0),
  createRuleGroup: () => _createRuleGroup(0, [], []),
  showCombinatorsBetweenRules: false,
  showNotToggle: false,
  showCloneButtons: false,
  independentCombinators: false,
  validationMap: {},
  disabledPaths: [],
};
const getProps = (mergeIntoSchema?: Partial<Schema>): RuleGroupProps => ({
  id: 'id',
  path: [0],
  rules: [],
  combinator: 'and',
  schema: { ...schema, ...mergeIntoSchema } as Schema,
  translations: defaultTranslations,
  disabled: false,
});

it('should have correct classNames', () => {
  const { getByTestId } = render(<RuleGroup {...getProps()} />);
  expect(getByTestId(TestID.ruleGroup)).toHaveClass(standardClassnames.ruleGroup);
  expect(getByTestId(TestID.ruleGroup)).toHaveClass('custom-ruleGroup-class');
  expect(
    getByTestId(TestID.ruleGroup).querySelector(`.${standardClassnames.header}`)!.classList
  ).toContain(classNames.header);
  expect(
    getByTestId(TestID.ruleGroup).querySelector(`.${standardClassnames.body}`)!.classList
  ).toContain(classNames.body);
});

describe('when 2 rules exist', () => {
  it('has 2 <Rule /> elements', () => {
    const { getAllByTestId } = render(
      <RuleGroup {...getProps()} rules={[_createRule(1), _createRule(2)]} />
    );
    expect(getAllByTestId(TestID.rule)).toHaveLength(2);
  });

  it('has the first rule with the correct values', () => {
    const { getAllByTestId } = render(
      <RuleGroup {...getProps()} rules={[_createRule(1), _createRule(2)]} />
    );
    const firstRule = getAllByTestId(TestID.rule)[0];
    expect(firstRule.dataset.ruleId).toBe('rule_id_1');
    expect(firstRule.querySelector(`.${standardClassnames.fields}`)).toHaveValue('field1');
    expect(firstRule.querySelector(`.${standardClassnames.operators}`)).toHaveValue('operator1');
    expect(firstRule.querySelector(`.${standardClassnames.value}`)).toHaveValue('value_1');
  });
});

describe('onCombinatorChange', () => {
  it('calls onPropChange from the schema with expected values', () => {
    const onPropChange = jest.fn();
    const { container } = render(<RuleGroup {...getProps({ onPropChange })} />);
    userEvent.selectOptions(
      container.querySelector(`.${standardClassnames.combinators}`)!,
      'any_combinator_value'
    );
    expect(onPropChange).toHaveBeenCalledWith('combinator', 'any_combinator_value', [0]);
  });
});

describe('onNotToggleChange', () => {
  it('calls onPropChange from the schema with expected values', () => {
    const onPropChange = jest.fn();
    const { getByLabelText } = render(
      <RuleGroup {...getProps({ onPropChange, showNotToggle: true })} />
    );
    userEvent.click(getByLabelText('Not'));
    expect(onPropChange).toHaveBeenCalledWith('not', true, [0]);
  });
});

describe('addRule', () => {
  it('calls onRuleAdd from the schema with expected values', () => {
    const onRuleAdd = jest.fn();
    const { getByText } = render(<RuleGroup {...getProps({ onRuleAdd })} />);
    userEvent.click(getByText(defaultTranslations.addRule.label));
    const call0 = onRuleAdd.mock.calls[0];
    expect(call0[0]).toHaveProperty('id');
    expect(call0[0]).toHaveProperty('field', 'field_0');
    expect(call0[0]).toHaveProperty('operator', 'operator_0');
    expect(call0[0]).toHaveProperty('value', 'value_0');
    expect(call0[1]).toEqual([0]);
  });
});

describe('addGroup', () => {
  it('calls onGroupAdd from the schema with expected values', () => {
    const onGroupAdd = jest.fn();
    const { getByText } = render(<RuleGroup {...getProps({ onGroupAdd })} />);
    userEvent.click(getByText(defaultTranslations.addGroup.label));
    const call0 = onGroupAdd.mock.calls[0];
    expect(call0[0]).toHaveProperty('id');
    expect(call0[0]).toHaveProperty('rules', []);
    expect(call0[1]).toEqual([0]);
  });
});

describe('cloneGroup', () => {
  it('calls moveRule from the schema with expected values', () => {
    const moveRule = jest.fn();
    const { getByText } = render(<RuleGroup {...getProps({ moveRule, showCloneButtons: true })} />);
    userEvent.click(getByText(defaultTranslations.cloneRuleGroup.label));
    expect(moveRule).toHaveBeenCalledWith([0], [1], true);
  });
});

describe('removeGroup', () => {
  it('calls onGroupRemove from the schema with expected values', () => {
    const onGroupRemove = jest.fn();
    const { getByText } = render(<RuleGroup {...getProps({ onGroupRemove })} />);
    userEvent.click(getByText(defaultTranslations.removeGroup.label));
    expect(onGroupRemove).toHaveBeenCalledWith([0]);
  });
});

describe('showCombinatorsBetweenRules', () => {
  it('does not display combinators when there is only one rule', () => {
    const { container } = render(
      <RuleGroup
        {...getProps({ showCombinatorsBetweenRules: true })}
        rules={[{ field: 'test', value: 'Test', operator: '=' }]}
      />
    );
    expect(container.querySelectorAll(`.${standardClassnames.combinators}`)).toHaveLength(0);
  });

  it('displays combinators when there is more than one rule', () => {
    const { container } = render(
      <RuleGroup
        {...getProps({ showCombinatorsBetweenRules: true })}
        rules={[
          { rules: [], combinator: 'and' },
          { field: 'test', value: 'Test', operator: '=' },
          { rules: [], combinator: 'and' },
        ]}
      />
    );
    expect(container.querySelectorAll(`.${standardClassnames.combinators}`)).toHaveLength(2);
  });
});

describe('showNotToggle', () => {
  it('does not display "not" toggle by default', () => {
    const { container } = render(<RuleGroup {...getProps({ showNotToggle: false })} />);
    expect(container.querySelectorAll(`.${standardClassnames.notToggle}`)).toHaveLength(0);
  });

  it('has the correct classNames', () => {
    const { getByTestId } = render(<RuleGroup {...getProps({ showNotToggle: true })} />);
    expect(getByTestId(TestID.notToggle)).toHaveClass(
      standardClassnames.notToggle,
      'custom-notToggle-class'
    );
  });
});

describe('showCloneButtons', () => {
  it('does not display clone buttons by default', () => {
    const { container } = render(<RuleGroup {...getProps({ showCloneButtons: false })} />);
    expect(container.querySelectorAll(`.${standardClassnames.cloneGroup}`)).toHaveLength(0);
  });

  it('has the correct classNames', () => {
    const { getByTestId } = render(<RuleGroup {...getProps({ showCloneButtons: true })} />);
    expect(getByTestId(TestID.cloneGroup)).toHaveClass(
      standardClassnames.cloneGroup,
      'custom-cloneGroup-class'
    );
  });
});

describe('independent combinators', () => {
  it('should render combinator selector for string elements', () => {
    const rules: RuleGroupICArray = [
      { field: 'firstName', operator: '=', value: 'Test' },
      'and',
      { rules: [] },
    ];
    const { getByTestId } = render(
      <RuleGroup {...getProps({ independentCombinators: true })} rules={rules} />
    );
    const inlineCombinator = getByTestId(TestID.inlineCombinator);
    const combinatorSelector = getByTestId(TestID.combinators);
    expect(inlineCombinator).toHaveClass(standardClassnames.betweenRules);
    expect(combinatorSelector).toHaveValue('and');
  });

  it('should call handleOnChange for string elements', () => {
    const updateIndependentCombinator = jest.fn();
    const rules: RuleGroupICArray = [
      { field: 'firstName', operator: '=', value: 'Test' },
      'and',
      { field: 'lastName', operator: '=', value: 'Test' },
    ];
    const { getByText, getByTitle } = render(
      <RuleGroup
        {...getProps({ independentCombinators: true, updateIndependentCombinator })}
        rules={rules}
      />
    );
    userEvent.selectOptions(getByTitle(defaultTranslations.combinators.title), [getByText('OR')]);
    expect(updateIndependentCombinator).toHaveBeenCalledWith('or', [0, 1]);
  });

  it('should clone independent combinator groups', () => {
    const moveRule = jest.fn();
    const { getByText } = render(
      <RuleGroup
        {...getProps({ independentCombinators: true, moveRule, showCloneButtons: true })}
      />
    );
    userEvent.click(getByText(defaultTranslations.cloneRuleGroup.label));
    expect(moveRule).toHaveBeenCalledWith([0], [1], true);
  });
});

describe('validation', () => {
  it('should not validate if no validationMap[id] value exists', () => {
    const { getByTestId } = render(<RuleGroup {...getProps()} />);
    expect(getByTestId(TestID.ruleGroup)).not.toHaveClass(standardClassnames.valid);
    expect(getByTestId(TestID.ruleGroup)).not.toHaveClass(standardClassnames.invalid);
  });

  it('should validate to false if validationMap[id] = false', () => {
    const { getByTestId } = render(<RuleGroup {...getProps({ validationMap: { id: false } })} />);
    expect(getByTestId(TestID.ruleGroup)).not.toHaveClass(standardClassnames.valid);
    expect(getByTestId(TestID.ruleGroup)).toHaveClass(standardClassnames.invalid);
  });

  it('should validate to true if validationMap[id] = true', () => {
    const { getByTestId } = render(<RuleGroup {...getProps({ validationMap: { id: true } })} />);
    expect(getByTestId(TestID.ruleGroup)).toHaveClass(standardClassnames.valid);
    expect(getByTestId(TestID.ruleGroup)).not.toHaveClass(standardClassnames.invalid);
  });

  it('should pass down validationResult as validation to children', () => {
    const valRes: ValidationResult = { valid: false, reasons: ['invalid'] };
    const props = getProps();
    const controls = {
      ...props.schema.controls,
      combinatorSelector: ({ validation }: ValueSelectorProps) => (
        <div title="ValueSelector">{JSON.stringify(validation)}</div>
      ),
      addRuleAction: ({ validation }: ActionProps) => (
        <div title="ActionElement">{JSON.stringify(validation)}</div>
      ),
    };
    const { getByTitle } = render(
      <RuleGroup {...getProps({ controls, validationMap: { id: valRes } })} />
    );
    expect(getByTitle('ValueSelector').innerHTML).toEqual(JSON.stringify(valRes));
    expect(getByTitle('ActionElement').innerHTML).toEqual(JSON.stringify(valRes));
  });
});

describe('enableDragAndDrop', () => {
  it('should not have the drag class if not dragging', () => {
    const { getByTestId } = render(<RuleGroup {...getProps()} />);
    const ruleGroup = getByTestId(TestID.ruleGroup);
    expect(ruleGroup).not.toHaveClass(standardClassnames.dndDragging);
  });

  it('should have the drag class if dragging', () => {
    const { getByTestId } = render(<RuleGroup {...getProps()} />);
    const ruleGroup = getByTestId(TestID.ruleGroup);
    simulateDrag(getHandlerId(ruleGroup, 'drag'), getDndBackend());
    expect(ruleGroup).toHaveClass(standardClassnames.dndDragging);
    act(() => {
      getDndBackend().simulateEndDrag();
    });
  });

  it('should handle a dropped rule group', () => {
    const moveRule = jest.fn();
    const { getAllByTestId } = render(
      <div>
        <RuleGroup {...getProps({ moveRule })} path={[0]} />
        <RuleGroup {...getProps({ moveRule })} path={[1]} />
      </div>
    );
    const ruleGroups = getAllByTestId(TestID.ruleGroup);
    simulateDragDrop(
      getHandlerId(ruleGroups[1], 'drag'),
      getHandlerId(ruleGroups[0], 'drop'),
      getDndBackend()
    );
    expect(ruleGroups[0]).not.toHaveClass(standardClassnames.dndDragging);
    expect(ruleGroups[1]).not.toHaveClass(standardClassnames.dndOver);
    expect(moveRule).toHaveBeenCalledWith([1], [0, 0]);
  });

  it('should abort move if dropped on itself', () => {
    const moveRule = jest.fn();
    const { getByTestId } = render(<RuleGroup {...getProps({ moveRule })} />);
    const ruleGroup = getByTestId(TestID.ruleGroup);
    simulateDragDrop(
      getHandlerId(ruleGroup, 'drag'),
      getHandlerId(ruleGroup, 'drop'),
      getDndBackend()
    );
    expect(ruleGroup).not.toHaveClass(standardClassnames.dndDragging);
    expect(ruleGroup).not.toHaveClass(standardClassnames.dndOver);
    expect(moveRule).not.toHaveBeenCalled();
  });

  it('should abort move if source item is first child of this group', () => {
    const moveRule = jest.fn();
    const { getAllByTestId } = render(
      <RuleGroup {...getProps({ moveRule })} rules={[{ rules: [] }]} />
    );
    const ruleGroups = getAllByTestId(TestID.ruleGroup);
    simulateDragDrop(
      getHandlerId(ruleGroups[1], 'drag'),
      getHandlerId(ruleGroups[0], 'drop'),
      getDndBackend()
    );
    expect(moveRule).not.toHaveBeenCalled();
  });

  it('should handle drops on combinator between rules', () => {
    const moveRule = jest.fn();
    const { getAllByTestId } = render(
      <div>
        <RuleGroup
          {...getProps({ moveRule, showCombinatorsBetweenRules: true })}
          rules={[
            { field: 'firstName', operator: '=', value: '0' },
            { field: 'firstName', operator: '=', value: '1' },
            { field: 'firstName', operator: '=', value: '2' },
          ]}
          path={[0]}
        />
      </div>
    );
    const rules = getAllByTestId(TestID.rule);
    const combinatorEls = getAllByTestId(TestID.inlineCombinator);
    simulateDragDrop(
      getHandlerId(rules[2], 'drag'),
      getHandlerId(combinatorEls[1], 'drop'),
      getDndBackend()
    );
    expect(moveRule).not.toHaveBeenCalled();
    simulateDragDrop(
      getHandlerId(rules[2], 'drag'),
      getHandlerId(combinatorEls[0], 'drop'),
      getDndBackend()
    );
    expect(moveRule).toHaveBeenCalledWith([0, 2], [0, 1]);
  });

  it('should handle rule group drops on independent combinators', () => {
    const moveRule = jest.fn();
    const { getAllByTestId, getByTestId } = render(
      <div>
        <RuleGroup
          {...getProps({ independentCombinators: true, moveRule })}
          rules={[
            { field: 'firstName', operator: '=', value: 'Steve' },
            'and',
            { field: 'lastName', operator: '=', value: 'Vai' },
          ]}
          path={[0]}
        />
        <RuleGroup {...getProps({ independentCombinators: true, moveRule })} path={[1]} />
      </div>
    );
    const ruleGroups = getAllByTestId(TestID.ruleGroup);
    const combinatorEl = getByTestId(TestID.inlineCombinator);
    simulateDragDrop(
      getHandlerId(ruleGroups[1], 'drag'),
      getHandlerId(combinatorEl, 'drop'),
      getDndBackend()
    );
    expect(ruleGroups[1]).not.toHaveClass(standardClassnames.dndDragging);
    expect(combinatorEl).not.toHaveClass(standardClassnames.dndOver);
    expect(moveRule).toHaveBeenCalledWith([1], [0, 1]);
  });

  it('should handle rule drops on independent combinators', () => {
    const moveRule = jest.fn();
    const { getAllByTestId } = render(
      <RuleGroup
        {...getProps({ independentCombinators: true, moveRule })}
        rules={[
          { field: 'firstName', operator: '=', value: 'Steve' },
          'and',
          { field: 'lastName', operator: '=', value: 'Vai' },
          'and',
          { field: 'age', operator: '>', value: 28 },
        ]}
        path={[0]}
      />
    );
    const rules = getAllByTestId(TestID.rule);
    const combinatorEls = getAllByTestId(TestID.inlineCombinator);
    simulateDragDrop(
      getHandlerId(rules[2], 'drag'),
      getHandlerId(combinatorEls[0], 'drop'),
      getDndBackend()
    );
    expect(moveRule).toHaveBeenCalledWith([0, 4], [0, 1]);
  });
});

describe('disabled', () => {
  it('does not try to update the query', () => {
    const onRuleAdd = jest.fn();
    const onRuleRemove = jest.fn();
    const onGroupAdd = jest.fn();
    const onGroupRemove = jest.fn();
    const onPropChange = jest.fn();
    const moveRule = jest.fn();
    const { getAllByTestId, getByTestId } = render(
      <RuleGroup
        {...getProps({
          showCloneButtons: true,
          showNotToggle: true,
          onRuleAdd,
          onRuleRemove,
          onGroupAdd,
          onGroupRemove,
          onPropChange,
          moveRule,
        })}
        disabled
        combinator="and"
        rules={[
          { field: 'firstName', operator: '=', value: 'Steve' },
          { field: 'lastName', operator: '=', value: 'Vai' },
        ]}
      />
    );
    userEvent.click(getByTestId(TestID.addRule));
    userEvent.click(getByTestId(TestID.addGroup));
    userEvent.click(getByTestId(TestID.cloneGroup));
    userEvent.click(getByTestId(TestID.removeGroup));
    userEvent.click(getByTestId(TestID.notToggle));
    userEvent.click(getAllByTestId(TestID.cloneRule)[0]);
    userEvent.click(getAllByTestId(TestID.removeRule)[0]);
    userEvent.selectOptions(getByTestId(TestID.combinators), 'or');
    expect(onRuleAdd).not.toHaveBeenCalled();
    expect(onGroupAdd).not.toHaveBeenCalled();
    expect(onGroupRemove).not.toHaveBeenCalled();
    expect(onPropChange).not.toHaveBeenCalled();
    expect(moveRule).not.toHaveBeenCalled();
  });

  it('does not try to update independent combinators', () => {
    const onRuleAdd = jest.fn();
    const onRuleRemove = jest.fn();
    const onGroupAdd = jest.fn();
    const onGroupRemove = jest.fn();
    const onPropChange = jest.fn();
    const moveRule = jest.fn();
    const updateIndependentCombinator = jest.fn();
    const { getByTestId } = render(
      <RuleGroup
        {...getProps({
          showCloneButtons: true,
          showNotToggle: true,
          independentCombinators: true,
          updateIndependentCombinator,
          onRuleAdd,
          onRuleRemove,
          onGroupAdd,
          onGroupRemove,
          onPropChange,
          moveRule,
        })}
        disabled
        rules={[
          { field: 'firstName', operator: '=', value: 'Steve' },
          'and',
          { field: 'lastName', operator: '=', value: 'Vai' },
        ]}
      />
    );
    userEvent.selectOptions(getByTestId(TestID.combinators), 'or');
    expect(updateIndependentCombinator).not.toHaveBeenCalled();
  });
});
