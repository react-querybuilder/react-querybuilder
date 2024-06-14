import { consoleMocks, createRule, getRuleGroupProps, ruleGroupClassnames } from '@rqb-test';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import {
  TestID,
  defaultCombinators,
  standardClassnames as sc,
  defaultTranslations as t,
} from '../defaults';
import { messages } from '../messages';
import type { ActionProps, RuleGroupICArray, ValidationResult, ValueSelectorProps } from '../types';
import { add, toFullOption } from '../utils';
import { RuleGroup } from './RuleGroup';
import { render, waitABeat } from './testUtils';

const user = userEvent.setup();

const { consoleError } = consoleMocks();

it('has correct accessible description', () => {
  // Root group
  const { rerender } = render(<RuleGroup {...getRuleGroupProps()} path={[]} />);
  expect(screen.getByTestId(TestID.ruleGroup)).toHaveAccessibleDescription('Query builder');
  // Sub group
  rerender(<RuleGroup {...getRuleGroupProps()} path={[0]} />);
  expect(screen.getByTestId(TestID.ruleGroup)).toHaveAccessibleDescription('Rule group at path 0');
});

it('has correct classNames', () => {
  render(<RuleGroup {...getRuleGroupProps()} />);
  expect(screen.getByTestId(TestID.ruleGroup)).toHaveClass(sc.ruleGroup, 'custom-ruleGroup-class');
  expect(screen.getByTestId(TestID.ruleGroup).querySelector(`.${sc.header}`)!.classList).toContain(
    ruleGroupClassnames.header
  );
  expect(screen.getByTestId(TestID.ruleGroup).querySelector(`.${sc.body}`)!.classList).toContain(
    ruleGroupClassnames.body
  );
});

describe('when 2 rules exist', () => {
  it('has 2 <Rule /> elements', () => {
    const props = getRuleGroupProps();
    render(
      <RuleGroup
        {...props}
        ruleGroup={{ combinator: 'and', rules: [createRule(1), createRule(2)] }}
      />
    );
    expect(screen.getAllByTestId(TestID.rule)).toHaveLength(2);
  });

  it('has the first rule with the correct values', () => {
    const props = getRuleGroupProps();
    render(
      <RuleGroup
        {...props}
        ruleGroup={{ combinator: 'and', rules: [createRule(1), createRule(2)] }}
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
    const { container } = render(<RuleGroup {...getRuleGroupProps({}, { onPropChange })} />);

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
    render(<RuleGroup {...getRuleGroupProps({ showNotToggle: true }, { onPropChange })} />);

    await user.click(screen.getByLabelText('Not'));
    expect(onPropChange).toHaveBeenCalledWith('not', true, [0]);
  });
});

describe('addRule', () => {
  it('calls onRuleAdd from the schema with expected values', async () => {
    const onRuleAdd = jest.fn();
    render(<RuleGroup {...getRuleGroupProps({}, { onRuleAdd })} />);

    await user.click(screen.getByText(t.addRule.label));
    expect(onRuleAdd).toHaveBeenCalledTimes(1);
    expect(onRuleAdd).toHaveBeenLastCalledWith(
      expect.objectContaining({
        id: expect.any(String),
        field: 'field_0',
        operator: 'operator_0',
        value: 'value_0',
      }),
      [0],
      undefined
    );
  });
});

describe('addGroup', () => {
  it('calls onGroupAdd from the schema with expected values', async () => {
    const onGroupAdd = jest.fn();
    render(<RuleGroup {...getRuleGroupProps({}, { onGroupAdd })} />);

    await user.click(screen.getByText(t.addGroup.label));
    expect(onGroupAdd).toHaveBeenCalledTimes(1);
    expect(onGroupAdd).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: expect.any(String), rules: [] }),
      [0],
      undefined
    );
  });
});

describe('cloneGroup', () => {
  it('calls moveRule from the schema with expected values', async () => {
    const moveRule = jest.fn();
    render(<RuleGroup {...getRuleGroupProps({ showCloneButtons: true }, { moveRule })} />);

    await user.click(screen.getByText(t.cloneRuleGroup.label));
    expect(moveRule).toHaveBeenCalledWith([0], [1], true);
  });
});

describe('shiftRuleUp/Down', () => {
  it('calls moveRule with the right params', async () => {
    const moveRule = jest.fn();
    const { rerender } = render(
      <RuleGroup {...getRuleGroupProps({ showShiftActions: true }, { moveRule })} disabled />
    );

    await user.click(screen.getByText(t.shiftActionUp.label));
    await user.click(screen.getByText(t.shiftActionDown.label));
    expect(moveRule).not.toHaveBeenCalled();
    rerender(
      <RuleGroup {...getRuleGroupProps({ showShiftActions: true }, { moveRule })} shiftUpDisabled />
    );

    await user.click(screen.getByText(t.shiftActionUp.label));
    expect(moveRule).not.toHaveBeenCalled();
    rerender(
      <RuleGroup
        {...getRuleGroupProps({ showShiftActions: true }, { moveRule })}
        shiftDownDisabled
      />
    );

    await user.click(screen.getByText(t.shiftActionDown.label));
    expect(moveRule).not.toHaveBeenCalled();
    rerender(<RuleGroup {...getRuleGroupProps({ showShiftActions: true }, { moveRule })} />);

    await user.click(screen.getByText(t.shiftActionUp.label));
    expect(moveRule).toHaveBeenLastCalledWith([0], 'up', false);

    await user.click(screen.getByText(t.shiftActionDown.label));
    expect(moveRule).toHaveBeenLastCalledWith([0], 'down', false);

    await user.keyboard('{Alt>}');
    await user.click(screen.getByText(t.shiftActionUp.label));
    await user.keyboard('{/Alt}');
    expect(moveRule).toHaveBeenLastCalledWith([0], 'up', true);

    await user.keyboard('{Alt>}');
    await user.click(screen.getByText(t.shiftActionDown.label));
    await user.keyboard('{/Alt}');
    expect(moveRule).toHaveBeenLastCalledWith([0], 'down', true);
  });
});

describe('removeGroup', () => {
  it('calls onGroupRemove from the schema with expected values', async () => {
    const onGroupRemove = jest.fn();
    render(<RuleGroup {...getRuleGroupProps({}, { onGroupRemove })} />);

    await user.click(screen.getByText(t.removeGroup.label));
    expect(onGroupRemove).toHaveBeenCalledWith([0]);
  });
});

describe('showCombinatorsBetweenRules', () => {
  it('does not display combinators when there is only one rule', async () => {
    const { container } = render(
      <RuleGroup
        {...getRuleGroupProps({ showCombinatorsBetweenRules: true })}
        ruleGroup={{
          combinator: 'and',
          rules: [{ field: 'test', value: 'Test', operator: '=' }],
        }}
      />
    );
    expect(container.querySelectorAll(`.${sc.combinators}`)).toHaveLength(0);
  });

  it('displays combinators when there is more than one rule', () => {
    const { container } = render(
      <RuleGroup
        {...getRuleGroupProps({ showCombinatorsBetweenRules: true })}
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
    const { container } = render(<RuleGroup {...getRuleGroupProps({ showNotToggle: false })} />);
    expect(container.querySelectorAll(`.${sc.notToggle}`)).toHaveLength(0);
  });

  it('has the correct classNames', () => {
    render(<RuleGroup {...getRuleGroupProps({ showNotToggle: true })} />);
    expect(screen.getByTestId(TestID.notToggle)).toHaveClass(
      sc.notToggle,
      'custom-notToggle-class'
    );
  });
});

describe('showCloneButtons', () => {
  it('does not display clone buttons by default', () => {
    const { container } = render(<RuleGroup {...getRuleGroupProps({ showCloneButtons: false })} />);
    expect(container.querySelectorAll(`.${sc.cloneGroup}`)).toHaveLength(0);
  });

  it('has the correct classNames', () => {
    render(<RuleGroup {...getRuleGroupProps({ showCloneButtons: true })} />);
    expect(screen.getByTestId(TestID.cloneGroup)).toHaveClass(
      sc.cloneGroup,
      'custom-cloneGroup-class'
    );
  });
});

describe('independent combinators', () => {
  it('renders combinator selector for string elements', () => {
    const rules: RuleGroupICArray = [
      { field: 'firstName', operator: '=', value: 'Test' },
      'and',
      { rules: [] },
    ];
    render(
      <RuleGroup {...getRuleGroupProps({ independentCombinators: true })} ruleGroup={{ rules }} />
    );
    const inlineCombinator = screen.getByTestId(TestID.inlineCombinator);
    const combinatorSelector = screen.getByTestId(TestID.combinators);
    expect(inlineCombinator).toHaveClass(sc.betweenRules);
    expect(combinatorSelector).toHaveValue('and');
  });

  it('calls handleOnChange for string elements', async () => {
    const onPropChange = jest.fn();
    const rules: RuleGroupICArray = [
      { field: 'firstName', operator: '=', value: 'Test' },
      'and',
      { field: 'lastName', operator: '=', value: 'Test' },
    ];
    render(
      <RuleGroup
        {...getRuleGroupProps({ independentCombinators: true }, { onPropChange })}
        ruleGroup={{ rules }}
      />
    );

    await user.selectOptions(screen.getByTitle(t.combinators.title), [screen.getByText('OR')]);
    expect(onPropChange).toHaveBeenCalledWith('combinator', 'or', [0, 1]);
  });

  it('clones independent combinator groups', async () => {
    const moveRule = jest.fn();
    render(
      <RuleGroup
        {...getRuleGroupProps(
          { independentCombinators: true, showCloneButtons: true },
          { moveRule }
        )}
      />
    );

    await user.click(screen.getByText(t.cloneRuleGroup.label));
    expect(moveRule).toHaveBeenCalledWith([0], [1], true);
  });
});

describe('validation', () => {
  it('does not validate if no validationMap[id] value exists', () => {
    render(<RuleGroup {...getRuleGroupProps()} />);
    expect(screen.getByTestId(TestID.ruleGroup)).not.toHaveClass(sc.valid);
    expect(screen.getByTestId(TestID.ruleGroup)).not.toHaveClass(sc.invalid);
  });

  it('validates to false if validationMap[id] = false', () => {
    render(<RuleGroup {...getRuleGroupProps({ validationMap: { id: false } })} />);
    expect(screen.getByTestId(TestID.ruleGroup)).not.toHaveClass(sc.valid);
    expect(screen.getByTestId(TestID.ruleGroup)).toHaveClass(sc.invalid);
  });

  it('validates to true if validationMap[id] = true', () => {
    render(<RuleGroup {...getRuleGroupProps({ validationMap: { id: true } })} />);
    expect(screen.getByTestId(TestID.ruleGroup)).toHaveClass(sc.valid);
    expect(screen.getByTestId(TestID.ruleGroup)).not.toHaveClass(sc.invalid);
  });

  it('passes down validationResult as validation to children', () => {
    const valRes: ValidationResult = { valid: false, reasons: ['invalid'] };
    const props = getRuleGroupProps();
    const controls = {
      ...props.schema.controls,
      combinatorSelector: ({ validation }: ValueSelectorProps) => (
        <div title="ValueSelector">{JSON.stringify(validation)}</div>
      ),
      addRuleAction: ({ validation }: ActionProps) => (
        <div title="ActionElement">{JSON.stringify(validation)}</div>
      ),
    };
    render(<RuleGroup {...getRuleGroupProps({ controls, validationMap: { id: valRes } })} />);
    expect(screen.getByTitle('ValueSelector').innerHTML).toEqual(JSON.stringify(valRes));
    expect(screen.getByTitle('ActionElement').innerHTML).toEqual(JSON.stringify(valRes));
  });
});

describe('disabled', () => {
  it('has the correct classname', () => {
    render(<RuleGroup {...getRuleGroupProps()} disabled />);
    expect(screen.getByTestId(TestID.ruleGroup)).toHaveClass(sc.disabled);
  });

  it('disables by paths', () => {
    render(
      <RuleGroup
        {...getRuleGroupProps({ disabledPaths: [[0, 0]] })}
        ruleGroup={{
          combinator: 'and',
          rules: [{ field: 'f1', operator: '=', value: 'v1' }],
        }}
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
        {...getRuleGroupProps(
          { showCloneButtons: true, showNotToggle: true },
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
        {...getRuleGroupProps(
          { showCloneButtons: true, showNotToggle: true, independentCombinators: true },
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
    render(<RuleGroup {...getRuleGroupProps({ showLockButtons: true })} disabled />);
    expect(screen.getByTestId(TestID.lockGroup)).toBeEnabled();
  });

  it('disables the lock button if the parent group is disabled even if the current group is not', async () => {
    const onPropChange = jest.fn();
    render(
      <RuleGroup
        {...getRuleGroupProps({ showLockButtons: true }, { onPropChange })}
        parentDisabled
      />
    );
    expect(screen.getByTestId(TestID.lockGroup)).toBeDisabled();

    await user.click(screen.getByTestId(TestID.lockGroup));
    expect(onPropChange).not.toHaveBeenCalled();
  });

  it('sets the disabled property', async () => {
    const onPropChange = jest.fn();
    render(<RuleGroup {...getRuleGroupProps({ showLockButtons: true }, { onPropChange })} />);

    await user.click(screen.getByTestId(TestID.lockGroup));
    expect(onPropChange).toHaveBeenCalledWith('disabled', true, [0]);
  });

  it('unsets the disabled property', async () => {
    const onPropChange = jest.fn();
    render(
      <RuleGroup {...getRuleGroupProps({ showLockButtons: true }, { onPropChange })} disabled />
    );

    await user.click(screen.getByTestId(TestID.lockGroup));
    expect(onPropChange).toHaveBeenCalledWith('disabled', false, [0]);
  });
});

describe('dynamic classNames', () => {
  it('has correct group-based classNames', () => {
    render(
      <RuleGroup
        {...getRuleGroupProps({
          combinators: [
            toFullOption({ name: 'or', label: 'OR', className: 'custom-combinatorBased-class' }),
          ],
          getRuleGroupClassname: () => 'custom-groupBased-class',
        })}
        ruleGroup={{ combinator: 'or', rules: [] }}
      />
    );
    expect(screen.getByTestId(TestID.ruleGroup)).toHaveClass(
      'custom-groupBased-class',
      'custom-combinatorBased-class'
    );
  });
});

describe('dnd warnings', () => {
  it('warns about using dnd without react-dnd', async () => {
    render(
      <RuleGroup
        {...getRuleGroupProps({ enableDragAndDrop: true })}
        ruleGroup={{ combinator: 'and', rules: [] }}
      />
    );
    await waitABeat();
    expect(consoleError).toHaveBeenCalledWith(messages.errorEnabledDndWithoutReactDnD);
  });
});

it('warns about deprecated props', async () => {
  // @ts-expect-error ruleGroup is required
  render(<RuleGroup {...getRuleGroupProps()} ruleGroup={undefined} rules={[]} combinator="or" />);
  await waitABeat();
  expect(consoleError).toHaveBeenCalledWith(messages.errorDeprecatedRuleGroupProps);
  expect(screen.getByTestId(TestID.combinators)).toHaveValue('or');
});

it('warns about deprecated props (independent combinators)', async () => {
  const addListener = jest.fn();
  render(
    <RuleGroup
      {...getRuleGroupProps(
        { independentCombinators: true },
        {
          onRuleAdd: (rOrG, parentPath) => {
            addListener(
              add({ rules: [{ field: 'f', operator: '=', value: 'v' }] }, rOrG, parentPath)
            );
          },
        }
      )}
      path={[]}
      // @ts-expect-error ruleGroup prop is required
      ruleGroup={undefined}
      rules={[{ field: 'f', operator: '=', value: 'v' }]}
      combinator={undefined}
    />
  );
  await waitABeat();
  expect(consoleError).toHaveBeenCalledWith(messages.errorDeprecatedRuleGroupProps);

  await user.click(screen.getByTestId(TestID.addRule));
  expect(addListener).toHaveBeenCalledTimes(1);
  expect(addListener).toHaveBeenLastCalledWith(
    expect.objectContaining({
      rules: expect.arrayContaining([
        expect.anything(),
        defaultCombinators[0].name,
        expect.anything(),
      ]),
    })
  );
});
