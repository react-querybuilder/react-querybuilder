import type { FullField, FullOption, ValueSourceFullOptions } from '@react-querybuilder/core';
import {
  TestID,
  clsx,
  isFullOptionArray,
  standardClassnames as sc,
  defaultTranslations as t,
  toFullOption,
} from '@react-querybuilder/core';
import {
  consoleMocks,
  getFieldMapFromArray,
  getRuleProps as getProps,
  ruleClassnames,
  waitABeat,
} from '@rqb-testing';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { messages } from '../messages';
import { Rule } from './Rule';
import { render } from './testUtils';

const user = userEvent.setup();

const { consoleError } = consoleMocks();

it('has correct classNames', () => {
  render(<Rule {...getProps()} />);
  expect(screen.getByTestId(TestID.rule)).toHaveClass(sc.rule, clsx(ruleClassnames.rule));
});

it('respects suppressStandardClassnames', () => {
  render(<Rule {...getProps({ suppressStandardClassnames: true })} />);
  expect(screen.getByTestId(TestID.rule)).not.toHaveClass(sc.rule);
});

describe('onElementChanged methods', () => {
  describe('onFieldChanged', () => {
    it('calls onPropChange with the rule path', async () => {
      const onPropChange = vi.fn();
      const props = { ...getProps({}, { onPropChange }) };
      render(<Rule {...props} />);

      await user.selectOptions(
        screen.getByTestId(TestID.rule).querySelector(`select.${sc.fields}`)!,
        'any_field'
      );
      expect(onPropChange).toHaveBeenCalledWith('field', 'any_field', [0], undefined);
    });
  });

  describe('onOperatorChanged', () => {
    it('calls onPropChange with the rule path', async () => {
      const onPropChange = vi.fn();
      const props = { ...getProps({}, { onPropChange }) };
      render(<Rule {...props} />);

      await user.selectOptions(
        screen.getByTestId(TestID.rule).querySelector(`select.${sc.operators}`)!,
        'any_operator'
      );
      expect(onPropChange).toHaveBeenCalledWith('operator', 'any_operator', [0], undefined);
    });
  });

  describe('onValueChanged', () => {
    it('calls onPropChange with the rule path', async () => {
      const onPropChange = vi.fn();
      const props = { ...getProps({}, { onPropChange }) };
      render(<Rule {...props} />);

      await user.type(
        screen.getByTestId(TestID.rule).querySelector(`input.${sc.value}`)!,
        'any_value'
      );
      expect(onPropChange).toHaveBeenCalledWith('value', 'any_value', [0], undefined);
    });
  });
});

describe('cloneRule', () => {
  it('calls moveRule with the right paths', async () => {
    const moveRule = vi.fn();
    render(<Rule {...getProps({ showCloneButtons: true }, { moveRule })} />);

    await user.click(screen.getByText(t.cloneRule.label));
    expect(moveRule).toHaveBeenCalledWith([0], [1], true, undefined);
  });
});

describe('shiftRuleUp/Down', () => {
  it('calls moveRule with the right params', async () => {
    const moveRule = vi.fn();
    const { rerender } = render(
      <Rule {...getProps({ showShiftActions: true }, { moveRule })} disabled />
    );

    await user.click(screen.getByText(t.shiftActionUp.label));
    await user.click(screen.getByText(t.shiftActionDown.label));
    expect(moveRule).not.toHaveBeenCalled();
    rerender(<Rule {...getProps({ showShiftActions: true }, { moveRule })} shiftUpDisabled />);

    await user.click(screen.getByText(t.shiftActionUp.label));
    expect(moveRule).not.toHaveBeenCalled();
    rerender(<Rule {...getProps({ showShiftActions: true }, { moveRule })} shiftDownDisabled />);

    await user.click(screen.getByText(t.shiftActionDown.label));
    expect(moveRule).not.toHaveBeenCalled();
    rerender(<Rule {...getProps({ showShiftActions: true }, { moveRule })} />);

    await user.click(screen.getByText(t.shiftActionUp.label));
    expect(moveRule).toHaveBeenLastCalledWith([0], 'up', false, undefined);

    await user.click(screen.getByText(t.shiftActionDown.label));
    expect(moveRule).toHaveBeenLastCalledWith([0], 'down', false, undefined);

    await user.keyboard('{Alt>}');
    await user.click(screen.getByText(t.shiftActionUp.label));
    await user.keyboard('{/Alt}');
    expect(moveRule).toHaveBeenLastCalledWith([0], 'up', true, undefined);

    await user.keyboard('{Alt>}');
    await user.click(screen.getByText(t.shiftActionDown.label));
    await user.keyboard('{/Alt}');
    expect(moveRule).toHaveBeenLastCalledWith([0], 'down', true, undefined);
  });
});

describe('removeRule', () => {
  it('calls onRuleRemove with the rule and path', async () => {
    const onRuleRemove = vi.fn();
    render(<Rule {...getProps({}, { onRuleRemove })} />);

    await user.click(screen.getByText(t.removeRule.label));
    expect(onRuleRemove).toHaveBeenCalledWith([0]);
  });
});

describe('disabled', () => {
  it('has the correct classname', () => {
    render(<Rule {...getProps()} disabled />);
    expect(screen.getByTestId(TestID.rule)).toHaveClass(sc.disabled);
  });

  it('does not try to update the query', async () => {
    const onRuleRemove = vi.fn();
    const onPropChange = vi.fn();
    const moveRule = vi.fn();
    render(
      <Rule
        {...getProps({ showCloneButtons: true }, { onRuleRemove, onPropChange, moveRule })}
        disabled
      />
    );

    await user.selectOptions(screen.getByTestId(TestID.fields), 'any_field');
    await user.selectOptions(screen.getByTestId(TestID.operators), 'any_operator');
    await user.type(screen.getByTestId(TestID.valueEditor), 'Test');
    await user.click(screen.getByTestId(TestID.cloneRule));
    await user.click(screen.getByTestId(TestID.removeRule));
    expect(onRuleRemove).not.toHaveBeenCalled();
    expect(onPropChange).not.toHaveBeenCalled();
    expect(moveRule).not.toHaveBeenCalled();
  });
});

describe('locked rule', () => {
  it('does not disable the lock button if the parent group is not disabled', () => {
    render(<Rule {...getProps({ showLockButtons: true })} disabled />);
    expect(screen.getByTestId(TestID.lockRule)).toBeEnabled();
  });

  it('disables the lock button if the parent group is disabled even if the current rule is not', async () => {
    const onPropChange = vi.fn();
    render(<Rule {...getProps({ showLockButtons: true }, { onPropChange })} parentDisabled />);
    expect(screen.getByTestId(TestID.lockRule)).toBeDisabled();

    await user.click(screen.getByTestId(TestID.lockRule));
    expect(onPropChange).not.toHaveBeenCalled();
  });

  it('sets the disabled property', async () => {
    const onPropChange = vi.fn();
    render(<Rule {...getProps({ showLockButtons: true }, { onPropChange })} />);

    await user.click(screen.getByTestId(TestID.lockRule));
    expect(onPropChange).toHaveBeenCalledWith('disabled', true, [0], undefined);
  });

  it('unsets the disabled property', async () => {
    const onPropChange = vi.fn();
    render(<Rule {...getProps({ showLockButtons: true }, { onPropChange })} disabled />);

    await user.click(screen.getByTestId(TestID.lockRule));
    expect(onPropChange).toHaveBeenCalledWith('disabled', false, [0], undefined);
  });
});

describe('valueSource', () => {
  const valueSources: ValueSourceFullOptions = [
    { name: 'value', value: 'value', label: 'value' },
    { name: 'field', value: 'field', label: 'field' },
  ];
  const fields = [
    {
      name: 'fvsa',
      label: 'Field w/ valueSources array',
      valueSources,
      comparator: (f: FullField) => f.label.includes('comparator'),
    },
    { name: 'fvsf', label: 'Field w/ valueSources function', valueSources: () => valueSources },
    { name: 'fc1', label: 'Field for comparator 1', group: 'g1' },
    { name: 'fc2', label: 'Field for comparator 2', group: 'g1' },
  ].map(o => toFullOption(o)) satisfies FullField[];
  const fieldMap = getFieldMapFromArray(fields);
  const getValueSources = (): ValueSourceFullOptions => valueSources;

  it('does not display value source selector by default', () => {
    render(<Rule {...getProps()} />);
    expect(screen.queryByTestId(TestID.valueSourceSelector)).toBeNull();
  });

  it('sets the value source to "value" by default', () => {
    const controls = getProps().schema.controls;
    const props = getProps({
      getValueSources,
      controls: {
        ...controls,
        valueEditor: ({ valueSource }) => <button>{`vs=${valueSource}`}</button>,
      },
    });
    render(<Rule {...props} />);
    expect(screen.getByText('vs=value')).toBeInTheDocument();
  });

  it('valueSource "field"', () => {
    const props = getProps({ getValueSources });
    render(<Rule {...props} rule={{ ...props.rule, valueSource: 'field' }} />);
    expect(screen.getByDisplayValue('field')).toBeInTheDocument();
  });

  it('valueSources as array', () => {
    const props = getProps({
      getValueSources: () => [{ name: 'value', value: 'value', label: 'value' }],
      fields,
      fieldMap,
    });
    render(<Rule {...props} rule={{ ...props.rule, field: 'fvsa', valueSource: 'field' }} />);
    expect(screen.getByTestId(TestID.valueSourceSelector).querySelectorAll('option')).toHaveLength(
      2
    );
    expect(screen.getByTestId(TestID.valueSourceSelector)).toHaveValue('field');
  });

  it('valueSources as function', () => {
    const props = getProps({
      getValueSources: () => [{ name: 'value', value: 'value', label: 'value' }],
      fields,
      fieldMap,
    });
    render(<Rule {...props} rule={{ ...props.rule, field: 'fvsf', valueSource: 'field' }} />);
    expect(screen.getByTestId(TestID.valueSourceSelector).querySelectorAll('option')).toHaveLength(
      2
    );
    expect(screen.getByTestId(TestID.valueSourceSelector)).toHaveValue('field');
  });

  it('filters fields by comparator', () => {
    const controls = getProps().schema.controls;
    const props = getProps({
      fields,
      fieldMap,
      getValueSources,
      controls: {
        ...controls,
        valueEditor: ({ value, values }) => (
          <select value={value} onChange={() => {}}>
            {values?.map(v => (
              <option key={v.name} value={v.name}>
                {v.label}
              </option>
            ))}
          </select>
        ),
      },
    });
    render(
      <Rule
        {...props}
        rule={{ ...props.rule, field: 'fvsa', value: 'fc2', valueSource: 'field' }}
      />
    );
    expect(screen.getByDisplayValue(fieldMap['fc2'].label).querySelectorAll('option')).toHaveLength(
      2
    );
    expect(screen.getByDisplayValue(fieldMap['fc2'].label)).toBeInTheDocument();
  });
});

// oxlint-disable-next-line no-disabled-tests
it.skip('makes the values array a FullOption array when appropriate', () => {
  const controls = getProps().schema.controls;
  const fields = [
    { name: 'f1', value: 'f1', label: 'f1', values: [{ name: 'f1v1', label: 'f1v1' }] },
    { name: 'f2', value: 'f2', label: 'f2', values: ['f2v1', 'f2v2'] as unknown as FullOption[] },
  ];
  const fieldMap = getFieldMapFromArray(fields);
  const props = getProps({
    fields,
    fieldMap,
    controls: {
      ...controls,
      valueEditor: ({ field, values }) => (
        <div>
          {field === 'f1'
            ? `${isFullOptionArray(values)}`
            : `${values?.every(v => typeof v === 'string')}`}
        </div>
      ),
    },
  });
  const { rerender } = render(
    <Rule {...props} rule={{ ...props.rule, field: 'f1', value: 'v1' }} />
  );
  // expect(screen.getByText('true')).toBeInTheDocument();
  rerender(<Rule {...props} rule={{ ...props.rule, field: 'f2', value: 'v2' }} />);
  expect(screen.getByText('true')).toBeInTheDocument();
});

describe('deprecated props', () => {
  it('warns about deprecated props', async () => {
    // @ts-expect-error rule prop is required
    render(<Rule {...getProps()} rule={undefined} field="f1" operator="=" value="v1" />);
    await waitABeat();
    expect(consoleError).toHaveBeenCalledWith(messages.errorDeprecatedRuleProps);
  });
});

describe('dnd warnings', () => {
  it('warns about using dnd without react-dnd', () => {
    render(
      <Rule
        {...getProps({ enableDragAndDrop: true })}
        rule={{ field: 'f1', operator: 'and', value: 'v1' }}
      />
    );
    expect(consoleError).toHaveBeenCalledWith(messages.errorEnabledDndWithoutReactDnD);
  });
});
