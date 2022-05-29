import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { forwardRef } from 'react';
import { simulateDrag, simulateDragDrop, wrapWithTestBackend } from 'react-dnd-test-utils';
import {
  defaultCombinators,
  defaultControlClassnames,
  defaultControlElements,
  defaultTranslations as t,
  standardClassnames as sc,
  TestID,
} from './defaults';
import { RuleGroup as RuleGroupOriginal } from './RuleGroup';
import type {
  ActionProps,
  Classnames,
  Controls,
  Field,
  NameLabelPair,
  QueryActions,
  RuleGroupArray,
  RuleGroupICArray,
  RuleGroupProps,
  RuleGroupType,
  RuleType,
  Schema,
  ValidationResult,
  ValueSelectorProps,
} from './types';

const user = userEvent.setup();

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
  controls: { ...defaultControlElements, ...controls },
  classNames: { ...defaultControlClassnames, ...classNames },
  getInputType: () => 'text',
  getOperators: () => [{ name: 'operator1', label: 'Operator 1' }],
  getValueEditorType: () => 'text',
  getValueSources: () => ['value'],
  getValues: () => [],
  createRule: () => _createRule(0),
  createRuleGroup: () => _createRuleGroup(0, [], []),
  showCombinatorsBetweenRules: false,
  showNotToggle: false,
  showCloneButtons: false,
  independentCombinators: false,
  validationMap: {},
  disabledPaths: [],
};
const actions: Partial<QueryActions> = {
  onPropChange: () => {},
  onRuleAdd: () => {},
  onGroupAdd: () => {},
};
const UNUSED = 'UNUSED';
const getProps = (
  mergeIntoSchema: Partial<Schema> = {},
  mergeIntoActions: Partial<QueryActions> = {}
): RuleGroupProps => ({
  id: 'id',
  path: [0],
  ruleGroup: { rules: [], combinator: 'and' },
  rules: [], // UNUSED
  combinator: UNUSED,
  schema: { ...schema, ...mergeIntoSchema } as Schema,
  actions: { ...actions, ...mergeIntoActions } as QueryActions,
  translations: t,
  disabled: false,
});

it('should have correct classNames', () => {
  render(<RuleGroup {...getProps()} />);
  expect(screen.getByTestId(TestID.ruleGroup)).toHaveClass(sc.ruleGroup, 'custom-ruleGroup-class');
  expect(screen.getByTestId(TestID.ruleGroup).querySelector(`.${sc.header}`)!.classList).toContain(
    classNames.header
  );
  expect(screen.getByTestId(TestID.ruleGroup).querySelector(`.${sc.body}`)!.classList).toContain(
    classNames.body
  );
});

describe('when 2 rules exist', () => {
  it('has 2 <Rule /> elements', () => {
    const props = getProps();
    render(
      <RuleGroup
        {...props}
        ruleGroup={{ combinator: 'and', rules: [_createRule(1), _createRule(2)] }}
      />
    );
    expect(screen.getAllByTestId(TestID.rule)).toHaveLength(2);
  });

  it('has the first rule with the correct values', () => {
    const props = getProps();
    render(
      <RuleGroup
        {...props}
        ruleGroup={{ combinator: 'and', rules: [_createRule(1), _createRule(2)] }}
      />
    );
    const firstRule = screen.getAllByTestId(TestID.rule)[0];
    expect(firstRule.dataset.ruleId).toBe('rule_id_1');
    expect(firstRule.querySelector(`.${sc.fields}`)).toHaveValue('field1');
    expect(firstRule.querySelector(`.${sc.operators}`)).toHaveValue('operator1');
    expect(firstRule.querySelector(`.${sc.value}`)).toHaveValue('value_1');
  });
});

describe('onCombinatorChange', () => {
  it('calls onPropChange from the schema with expected values', async () => {
    const onPropChange = jest.fn();
    const { container } = render(<RuleGroup {...getProps({}, { onPropChange })} />);
    await user.selectOptions(
      container.querySelector(`.${sc.combinators}`)!,
      'any_combinator_value'
    );
    expect(onPropChange).toHaveBeenCalledWith('combinator', 'any_combinator_value', [0]);
  });
});

describe('onNotToggleChange', () => {
  it('calls onPropChange from the schema with expected values', async () => {
    const onPropChange = jest.fn();
    render(<RuleGroup {...getProps({ showNotToggle: true }, { onPropChange })} />);
    await user.click(screen.getByLabelText('Not'));
    expect(onPropChange).toHaveBeenCalledWith('not', true, [0]);
  });
});

describe('addRule', () => {
  it('calls onRuleAdd from the schema with expected values', async () => {
    const onRuleAdd = jest.fn();
    render(<RuleGroup {...getProps({}, { onRuleAdd })} />);
    await user.click(screen.getByText(t.addRule.label));
    const call0 = onRuleAdd.mock.calls[0];
    expect(call0[0]).toHaveProperty('id');
    expect(call0[0]).toHaveProperty('field', 'field_0');
    expect(call0[0]).toHaveProperty('operator', 'operator_0');
    expect(call0[0]).toHaveProperty('value', 'value_0');
    expect(call0[1]).toEqual([0]);
  });
});

describe('addGroup', () => {
  it('calls onGroupAdd from the schema with expected values', async () => {
    const onGroupAdd = jest.fn();
    render(<RuleGroup {...getProps({}, { onGroupAdd })} />);
    await user.click(screen.getByText(t.addGroup.label));
    const call0 = onGroupAdd.mock.calls[0];
    expect(call0[0]).toHaveProperty('id');
    expect(call0[0]).toHaveProperty('rules', []);
    expect(call0[1]).toEqual([0]);
  });
});

describe('cloneGroup', () => {
  it('calls moveRule from the schema with expected values', async () => {
    const moveRule = jest.fn();
    render(<RuleGroup {...getProps({ showCloneButtons: true }, { moveRule })} />);
    await user.click(screen.getByText(t.cloneRuleGroup.label));
    expect(moveRule).toHaveBeenCalledWith([0], [1], true);
  });
});

describe('removeGroup', () => {
  it('calls onGroupRemove from the schema with expected values', async () => {
    const onGroupRemove = jest.fn();
    render(<RuleGroup {...getProps({}, { onGroupRemove })} />);
    await user.click(screen.getByText(t.removeGroup.label));
    expect(onGroupRemove).toHaveBeenCalledWith([0]);
  });
});

describe('showCombinatorsBetweenRules', () => {
  it('does not display combinators when there is only one rule', async () => {
    const { container } = render(
      <RuleGroup
        {...getProps({ showCombinatorsBetweenRules: true })}
        ruleGroup={{ combinator: 'and', rules: [{ field: 'test', value: 'Test', operator: '=' }] }}
      />
    );
    expect(container.querySelectorAll(`.${sc.combinators}`)).toHaveLength(0);
  });

  it('displays combinators when there is more than one rule', () => {
    const { container } = render(
      <RuleGroup
        {...getProps({ showCombinatorsBetweenRules: true })}
        ruleGroup={{
          combinator: 'and',
          rules: [
            { rules: [], combinator: 'and' },
            { field: 'test', value: 'Test', operator: '=' },
            { rules: [], combinator: 'and' },
          ],
        }}
      />
    );
    expect(container.querySelectorAll(`.${sc.combinators}`)).toHaveLength(2);
  });
});

describe('showNotToggle', () => {
  it('does not display "not" toggle by default', () => {
    const { container } = render(<RuleGroup {...getProps({ showNotToggle: false })} />);
    expect(container.querySelectorAll(`.${sc.notToggle}`)).toHaveLength(0);
  });

  it('has the correct classNames', () => {
    render(<RuleGroup {...getProps({ showNotToggle: true })} />);
    expect(screen.getByTestId(TestID.notToggle)).toHaveClass(
      sc.notToggle,
      'custom-notToggle-class'
    );
  });
});

describe('showCloneButtons', () => {
  it('does not display clone buttons by default', () => {
    const { container } = render(<RuleGroup {...getProps({ showCloneButtons: false })} />);
    expect(container.querySelectorAll(`.${sc.cloneGroup}`)).toHaveLength(0);
  });

  it('has the correct classNames', () => {
    render(<RuleGroup {...getProps({ showCloneButtons: true })} />);
    expect(screen.getByTestId(TestID.cloneGroup)).toHaveClass(
      sc.cloneGroup,
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
    render(<RuleGroup {...getProps({ independentCombinators: true })} ruleGroup={{ rules }} />);
    const inlineCombinator = screen.getByTestId(TestID.inlineCombinator);
    const combinatorSelector = screen.getByTestId(TestID.combinators);
    expect(inlineCombinator).toHaveClass(sc.betweenRules);
    expect(combinatorSelector).toHaveValue('and');
  });

  it('should call handleOnChange for string elements', async () => {
    const onPropChange = jest.fn();
    const rules: RuleGroupICArray = [
      { field: 'firstName', operator: '=', value: 'Test' },
      'and',
      { field: 'lastName', operator: '=', value: 'Test' },
    ];
    render(
      <RuleGroup
        {...getProps({ independentCombinators: true }, { onPropChange })}
        ruleGroup={{ rules }}
      />
    );
    await user.selectOptions(screen.getByTitle(t.combinators.title), [screen.getByText('OR')]);
    expect(onPropChange).toHaveBeenCalledWith('combinator', 'or', [0, 1]);
  });

  it('should clone independent combinator groups', async () => {
    const moveRule = jest.fn();
    render(
      <RuleGroup
        {...getProps({ independentCombinators: true, showCloneButtons: true }, { moveRule })}
      />
    );
    await user.click(screen.getByText(t.cloneRuleGroup.label));
    expect(moveRule).toHaveBeenCalledWith([0], [1], true);
  });
});

describe('validation', () => {
  it('should not validate if no validationMap[id] value exists', () => {
    render(<RuleGroup {...getProps()} />);
    expect(screen.getByTestId(TestID.ruleGroup)).not.toHaveClass(sc.valid);
    expect(screen.getByTestId(TestID.ruleGroup)).not.toHaveClass(sc.invalid);
  });

  it('should validate to false if validationMap[id] = false', () => {
    render(<RuleGroup {...getProps({ validationMap: { id: false } })} />);
    expect(screen.getByTestId(TestID.ruleGroup)).not.toHaveClass(sc.valid);
    expect(screen.getByTestId(TestID.ruleGroup)).toHaveClass(sc.invalid);
  });

  it('should validate to true if validationMap[id] = true', () => {
    render(<RuleGroup {...getProps({ validationMap: { id: true } })} />);
    expect(screen.getByTestId(TestID.ruleGroup)).toHaveClass(sc.valid);
    expect(screen.getByTestId(TestID.ruleGroup)).not.toHaveClass(sc.invalid);
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
    render(<RuleGroup {...getProps({ controls, validationMap: { id: valRes } })} />);
    expect(screen.getByTitle('ValueSelector').innerHTML).toEqual(JSON.stringify(valRes));
    expect(screen.getByTitle('ActionElement').innerHTML).toEqual(JSON.stringify(valRes));
  });
});

describe('enableDragAndDrop', () => {
  it('should not have the drag class if not dragging', () => {
    render(<RuleGroup {...getProps()} />);
    const ruleGroup = screen.getByTestId(TestID.ruleGroup);
    expect(ruleGroup).not.toHaveClass(sc.dndDragging);
  });

  it('should have the drag class if dragging', () => {
    render(<RuleGroup {...getProps()} />);
    const ruleGroup = screen.getByTestId(TestID.ruleGroup);
    simulateDrag(getHandlerId(ruleGroup, 'drag'), getDndBackend());
    expect(ruleGroup).toHaveClass(sc.dndDragging);
    act(() => {
      getDndBackend().simulateEndDrag();
    });
  });

  it('should handle a dropped rule group', () => {
    const moveRule = jest.fn();
    render(
      <div>
        <RuleGroup {...getProps({}, { moveRule })} path={[0]} />
        <RuleGroup {...getProps({}, { moveRule })} path={[1]} />
      </div>
    );
    const ruleGroups = screen.getAllByTestId(TestID.ruleGroup);
    simulateDragDrop(
      getHandlerId(ruleGroups[1], 'drag'),
      getHandlerId(ruleGroups[0], 'drop'),
      getDndBackend()
    );
    expect(ruleGroups[0]).not.toHaveClass(sc.dndDragging);
    expect(ruleGroups[1]).not.toHaveClass(sc.dndOver);
    expect(moveRule).toHaveBeenCalledWith([1], [0, 0]);
  });

  it('should abort move if dropped on itself', () => {
    const moveRule = jest.fn();
    render(<RuleGroup {...getProps({}, { moveRule })} />);
    const ruleGroup = screen.getByTestId(TestID.ruleGroup);
    simulateDragDrop(
      getHandlerId(ruleGroup, 'drag'),
      getHandlerId(ruleGroup, 'drop'),
      getDndBackend()
    );
    expect(ruleGroup).not.toHaveClass(sc.dndDragging);
    expect(ruleGroup).not.toHaveClass(sc.dndOver);
    expect(moveRule).not.toHaveBeenCalled();
  });

  it('should abort move if source item is first child of this group', () => {
    const moveRule = jest.fn();
    render(
      <RuleGroup
        {...getProps({}, { moveRule })}
        ruleGroup={{ combinator: 'and', rules: [{ combinator: 'and', rules: [] }] }}
      />
    );
    const ruleGroups = screen.getAllByTestId(TestID.ruleGroup);
    simulateDragDrop(
      getHandlerId(ruleGroups[1], 'drag'),
      getHandlerId(ruleGroups[0], 'drop'),
      getDndBackend()
    );
    expect(moveRule).not.toHaveBeenCalled();
  });

  it('should handle drops on combinator between rules', () => {
    const moveRule = jest.fn();
    render(
      <div>
        <RuleGroup
          {...getProps({ showCombinatorsBetweenRules: true }, { moveRule })}
          ruleGroup={{
            combinator: 'and',
            rules: [
              { field: 'firstName', operator: '=', value: '0' },
              { field: 'firstName', operator: '=', value: '1' },
              { field: 'firstName', operator: '=', value: '2' },
            ],
          }}
          path={[0]}
        />
      </div>
    );
    const rules = screen.getAllByTestId(TestID.rule);
    const combinatorEls = screen.getAllByTestId(TestID.inlineCombinator);
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
    render(
      <div>
        <RuleGroup
          {...getProps({ independentCombinators: true }, { moveRule })}
          ruleGroup={{
            rules: [
              { field: 'firstName', operator: '=', value: 'Steve' },
              'and',
              { field: 'lastName', operator: '=', value: 'Vai' },
            ],
          }}
          path={[0]}
        />
        <RuleGroup {...getProps({ independentCombinators: true }, { moveRule })} path={[1]} />
      </div>
    );
    const ruleGroups = screen.getAllByTestId(TestID.ruleGroup);
    const combinatorEl = screen.getByTestId(TestID.inlineCombinator);
    simulateDragDrop(
      getHandlerId(ruleGroups[1], 'drag'),
      getHandlerId(combinatorEl, 'drop'),
      getDndBackend()
    );
    expect(ruleGroups[1]).not.toHaveClass(sc.dndDragging);
    expect(combinatorEl).not.toHaveClass(sc.dndOver);
    expect(moveRule).toHaveBeenCalledWith([1], [0, 1]);
  });

  it('should handle rule drops on independent combinators', () => {
    const moveRule = jest.fn();
    render(
      <RuleGroup
        {...getProps({ independentCombinators: true }, { moveRule })}
        ruleGroup={{
          rules: [
            { field: 'firstName', operator: '=', value: 'Steve' },
            'and',
            { field: 'lastName', operator: '=', value: 'Vai' },
            'and',
            { field: 'age', operator: '>', value: 28 },
          ],
        }}
        path={[0]}
      />
    );
    const rules = screen.getAllByTestId(TestID.rule);
    const combinatorEls = screen.getAllByTestId(TestID.inlineCombinator);
    simulateDragDrop(
      getHandlerId(rules[2], 'drag'),
      getHandlerId(combinatorEls[0], 'drop'),
      getDndBackend()
    );
    expect(moveRule).toHaveBeenCalledWith([0, 4], [0, 1]);
  });
});

describe('disabled', () => {
  it('should have the correct classname', () => {
    render(<RuleGroup {...getProps()} disabled />);
    expect(screen.getByTestId(TestID.ruleGroup)).toHaveClass(sc.disabled);
  });

  it('disables by paths', () => {
    render(
      <RuleGroup
        {...getProps({ disabledPaths: [[0, 0]] })}
        ruleGroup={{ combinator: 'and', rules: [{ field: 'f1', operator: '=', value: 'v1' }] }}
      />
    );
    expect(screen.getByTestId(TestID.rule)).toHaveClass(sc.disabled);
  });

  it('does not try to update the query', async () => {
    const onRuleAdd = jest.fn();
    const onRuleRemove = jest.fn();
    const onGroupAdd = jest.fn();
    const onGroupRemove = jest.fn();
    const onPropChange = jest.fn();
    const moveRule = jest.fn();
    render(
      <RuleGroup
        {...getProps(
          {
            showCloneButtons: true,
            showNotToggle: true,
          },
          { onRuleAdd, onRuleRemove, onGroupAdd, onGroupRemove, onPropChange, moveRule }
        )}
        disabled
        ruleGroup={{
          combinator: 'and',
          rules: [
            { field: 'firstName', operator: '=', value: 'Steve' },
            { field: 'lastName', operator: '=', value: 'Vai' },
          ],
        }}
      />
    );
    await user.click(screen.getByTestId(TestID.addRule));
    await user.click(screen.getByTestId(TestID.addGroup));
    await user.click(screen.getByTestId(TestID.cloneGroup));
    await user.click(screen.getByTestId(TestID.removeGroup));
    await user.click(screen.getByTestId(TestID.notToggle));
    await user.click(screen.getAllByTestId(TestID.cloneRule)[0]);
    await user.click(screen.getAllByTestId(TestID.removeRule)[0]);
    await user.selectOptions(screen.getByTestId(TestID.combinators), 'or');
    expect(onRuleAdd).not.toHaveBeenCalled();
    expect(onGroupAdd).not.toHaveBeenCalled();
    expect(onGroupRemove).not.toHaveBeenCalled();
    expect(onPropChange).not.toHaveBeenCalled();
    expect(moveRule).not.toHaveBeenCalled();
  });

  it('does not try to update independent combinators', async () => {
    const onRuleAdd = jest.fn();
    const onRuleRemove = jest.fn();
    const onGroupAdd = jest.fn();
    const onGroupRemove = jest.fn();
    const onPropChange = jest.fn();
    const moveRule = jest.fn();
    render(
      <RuleGroup
        {...getProps(
          {
            showCloneButtons: true,
            showNotToggle: true,
            independentCombinators: true,
          },
          { onRuleAdd, onRuleRemove, onGroupAdd, onGroupRemove, onPropChange, moveRule }
        )}
        disabled
        ruleGroup={{
          rules: [
            { field: 'firstName', operator: '=', value: 'Steve' },
            'and',
            { field: 'lastName', operator: '=', value: 'Vai' },
          ],
        }}
      />
    );
    await user.selectOptions(screen.getByTestId(TestID.combinators), 'or');
    expect(onPropChange).not.toHaveBeenCalled();
  });
});

describe('lock buttons', () => {
  it('does not disable the lock button if the parent group is not disabled', () => {
    render(<RuleGroup {...getProps({ showLockButtons: true })} disabled />);
    expect(screen.getByTestId(TestID.lockGroup)).toBeEnabled();
  });

  it('disables the lock button if the parent group is disabled even if the current group is not', async () => {
    const onPropChange = jest.fn();
    render(<RuleGroup {...getProps({ showLockButtons: true }, { onPropChange })} parentDisabled />);
    expect(screen.getByTestId(TestID.lockGroup)).toBeDisabled();
    await user.click(screen.getByTestId(TestID.lockGroup));
    expect(onPropChange).not.toHaveBeenCalled();
  });

  it('sets the disabled property', async () => {
    const onPropChange = jest.fn();
    render(<RuleGroup {...getProps({ showLockButtons: true }, { onPropChange })} />);
    await user.click(screen.getByTestId(TestID.lockGroup));
    expect(onPropChange).toHaveBeenCalledWith('disabled', true, [0]);
  });

  it('unsets the disabled property', async () => {
    const onPropChange = jest.fn();
    render(<RuleGroup {...getProps({ showLockButtons: true }, { onPropChange })} disabled />);
    await user.click(screen.getByTestId(TestID.lockGroup));
    expect(onPropChange).toHaveBeenCalledWith('disabled', false, [0]);
  });

  it('prevents drops', () => {
    const moveRule = jest.fn();
    render(
      <div>
        <RuleGroup {...getProps({}, { moveRule })} path={[0]} disabled />
        <RuleGroup {...getProps({}, { moveRule })} path={[1]} />
      </div>
    );
    const ruleGroups = screen.getAllByTestId(TestID.ruleGroup);
    simulateDragDrop(
      getHandlerId(ruleGroups[1], 'drag'),
      getHandlerId(ruleGroups[0], 'drop'),
      getDndBackend()
    );
    expect(moveRule).not.toHaveBeenCalled();
  });
});
