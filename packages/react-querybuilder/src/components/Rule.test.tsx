import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { clsx } from 'clsx';
import * as React from 'react';
import {
  consoleMocks,
  getFieldMapFromArray,
  getRuleProps as getProps,
  ruleClassnames,
} from '../../genericTests';
import { TestID, standardClassnames as sc, defaultTranslations as t } from '../defaults';
import { errorDeprecatedRuleProps, errorEnabledDndWithoutReactDnD } from '../messages';
import type {
  Field,
  Operator,
  RuleType,
  ToFullOption,
  ValidationResult,
  ValueSelectorProps,
  ValueSources,
} from '../types';
import { toFullOption } from '../utils';
import { Rule } from './Rule';

const user = userEvent.setup();

const { consoleError } = consoleMocks();

it('should have correct classNames', () => {
  render(<Rule {...getProps()} />);
  expect(screen.getByTestId(TestID.rule)).toHaveClass(sc.rule, clsx(ruleClassnames.rule));
});

describe('onElementChanged methods', () => {
  describe('onFieldChanged', () => {
    it('should call onPropChange with the rule path', async () => {
      const onPropChange = jest.fn();
      const props = { ...getProps({}, { onPropChange }) };
      render(<Rule {...props} />);

      await user.selectOptions(
        screen.getByTestId(TestID.rule).querySelector(`select.${sc.fields}`)!,
        'any_field'
      );
      expect(onPropChange).toHaveBeenCalledWith('field', 'any_field', [0]);
    });
  });

  describe('onOperatorChanged', () => {
    it('should call onPropChange with the rule path', async () => {
      const onPropChange = jest.fn();
      const props = { ...getProps({}, { onPropChange }) };
      render(<Rule {...props} />);

      await user.selectOptions(
        screen.getByTestId(TestID.rule).querySelector(`select.${sc.operators}`)!,
        'any_operator'
      );
      expect(onPropChange).toHaveBeenCalledWith('operator', 'any_operator', [0]);
    });
  });

  describe('onValueChanged', () => {
    it('should call onPropChange with the rule path', async () => {
      const onPropChange = jest.fn();
      const props = { ...getProps({}, { onPropChange }) };
      render(<Rule {...props} />);

      await user.type(
        screen.getByTestId(TestID.rule).querySelector(`input.${sc.value}`)!,
        'any_value'
      );
      expect(onPropChange).toHaveBeenCalledWith('value', 'any_value', [0]);
    });
  });
});

describe('valueEditorType as function', () => {
  it('should determine the correct value editor type', () => {
    const fields = [toFullOption({ name: 'f1', label: 'Field 1', valueEditorType: () => 'radio' })];
    const fieldMap = getFieldMapFromArray(fields);
    const {
      schema: { controls },
      rule,
    } = getProps();
    const props = getProps({
      fields,
      fieldMap,
      controls: {
        ...controls,
        valueEditor: ({ type }) => <button>{type}</button>,
      },
    });
    render(<Rule {...props} rule={{ ...rule, field: 'f1' }} />);
    expect(screen.getByText('radio')).toBeInTheDocument();
  });
});

describe('cloneRule', () => {
  it('should call moveRule with the right paths', async () => {
    const moveRule = jest.fn();
    render(<Rule {...getProps({ showCloneButtons: true }, { moveRule })} />);

    await user.click(screen.getByText(t.cloneRule.label));
    expect(moveRule).toHaveBeenCalledWith([0], [1], true);
  });
});

describe('shiftRuleUp/Down', () => {
  it('should call moveRule with the right params', async () => {
    const moveRule = jest.fn();
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

describe('removeRule', () => {
  it('should call onRuleRemove with the rule and path', async () => {
    const onRuleRemove = jest.fn();
    render(<Rule {...getProps({}, { onRuleRemove })} />);

    await user.click(screen.getByText(t.removeRule.label));
    expect(onRuleRemove).toHaveBeenCalledWith([0]);
  });
});

describe('validation', () => {
  it('should not validate if no validationMap[id] value exists and no validator function is provided', () => {
    render(<Rule {...getProps()} />);
    expect(screen.getByTestId(TestID.rule)).not.toHaveClass(sc.valid);
    expect(screen.getByTestId(TestID.rule)).not.toHaveClass(sc.invalid);
  });

  it('should validate to false if validationMap[id] = false even if a validator function is provided', () => {
    const validator = jest.fn(() => true);
    const fieldMap = {
      field1: toFullOption({ name: 'field1', label: 'Field 1', validator }),
    };
    const validationMap = { id: false };
    render(<Rule {...getProps({ fieldMap, validationMap })} />);
    expect(screen.getByTestId(TestID.rule)).not.toHaveClass(sc.valid);
    expect(screen.getByTestId(TestID.rule)).toHaveClass(sc.invalid);
    expect(validator).not.toHaveBeenCalled();
  });

  it('should validate to true if validationMap[id] = true', () => {
    const validationMap = { id: true };
    render(<Rule {...getProps({ validationMap })} />);
    expect(screen.getByTestId(TestID.rule)).toHaveClass(sc.valid);
    expect(screen.getByTestId(TestID.rule)).not.toHaveClass(sc.invalid);
  });

  it('should validate if validationMap[id] does not exist and a validator function is provided', () => {
    const validator = jest.fn(() => true);
    const fieldMap = {
      field1: toFullOption({ name: 'field1', label: 'Field 1', validator }),
    };
    const props = getProps({ fieldMap });
    render(<Rule {...props} rule={{ ...props.rule, field: 'field1' }} />);
    expect(screen.getByTestId(TestID.rule)).toHaveClass(sc.valid);
    expect(screen.getByTestId(TestID.rule)).not.toHaveClass(sc.invalid);
    expect(validator).toHaveBeenCalled();
  });

  it('should pass down validationResult as validation to children', () => {
    const valRes: ValidationResult = { valid: false, reasons: ['invalid'] };
    const defaultProps = getProps();
    const controls = {
      ...defaultProps.schema.controls,
      fieldSelector: ({ validation }: ValueSelectorProps) => (
        <div title="ValueSelector">{JSON.stringify(validation)}</div>
      ),
    };
    const validationMap = { id: valRes };
    render(<Rule {...getProps({ validationMap, controls })} />);
    expect(screen.getByTitle('ValueSelector').innerHTML).toEqual(JSON.stringify(valRes));
  });
});

describe('disabled', () => {
  it('should have the correct classname', () => {
    render(<Rule {...getProps()} disabled />);
    expect(screen.getByTestId(TestID.rule)).toHaveClass(sc.disabled);
  });

  it('does not try to update the query', async () => {
    const onRuleRemove = jest.fn();
    const onPropChange = jest.fn();
    const moveRule = jest.fn();
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
    const onPropChange = jest.fn();
    render(<Rule {...getProps({ showLockButtons: true }, { onPropChange })} parentDisabled />);
    expect(screen.getByTestId(TestID.lockRule)).toBeDisabled();

    await user.click(screen.getByTestId(TestID.lockRule));
    expect(onPropChange).not.toHaveBeenCalled();
  });

  it('sets the disabled property', async () => {
    const onPropChange = jest.fn();
    render(<Rule {...getProps({ showLockButtons: true }, { onPropChange })} />);

    await user.click(screen.getByTestId(TestID.lockRule));
    expect(onPropChange).toHaveBeenCalledWith('disabled', true, [0]);
  });

  it('unsets the disabled property', async () => {
    const onPropChange = jest.fn();
    render(<Rule {...getProps({ showLockButtons: true }, { onPropChange })} disabled />);

    await user.click(screen.getByTestId(TestID.lockRule));
    expect(onPropChange).toHaveBeenCalledWith('disabled', false, [0]);
  });
});

describe('valueSource', () => {
  const valueSources: ValueSources = ['value', 'field'];
  const fields = (
    [
      {
        name: 'fvsa',
        label: 'Field w/ valueSources array',
        valueSources,
        comparator: f => f.label.includes('comparator'),
      },
      {
        name: 'fvsf',
        label: 'Field w/ valueSources function',
        valueSources: () => valueSources,
      },
      { name: 'fc1', label: 'Field for comparator 1', group: 'g1' },
      { name: 'fc2', label: 'Field for comparator 2', group: 'g1' },
    ] satisfies Field[]
  ).map(toFullOption);
  const fieldMap = getFieldMapFromArray(fields);
  const getValueSources = (): ValueSources => valueSources;

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
      getValueSources: () => ['value'],
      fields,
      fieldMap,
    });
    render(<Rule {...props} rule={{ ...props.rule, field: 'fvsa', valueSource: 'field' }} />);
    expect(
      screen.getByTestId(TestID.valueSourceSelector).getElementsByTagName('option')
    ).toHaveLength(2);
    expect(screen.getByTestId(TestID.valueSourceSelector)).toHaveValue('field');
  });

  it('valueSources as function', () => {
    const props = getProps({
      getValueSources: () => ['value'],
      fields,
      fieldMap,
    });
    render(<Rule {...props} rule={{ ...props.rule, field: 'fvsf', valueSource: 'field' }} />);
    expect(
      screen.getByTestId(TestID.valueSourceSelector).getElementsByTagName('option')
    ).toHaveLength(2);
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
    expect(
      screen.getByDisplayValue(fieldMap['fc2'].label).getElementsByTagName('option')
    ).toHaveLength(2);
    expect(screen.getByDisplayValue(fieldMap['fc2'].label)).toBeInTheDocument();
  });
});

describe('dynamic classNames', () => {
  it('should have correct group-based classNames', () => {
    const rule: RuleType = { field: 'f1', operator: 'op', value: 'v1' };
    const fieldMap = {
      f1: toFullOption({ name: 'f1', label: 'F1', className: 'custom-fieldBased-class' }),
    } satisfies Record<string, ToFullOption<Field>>;
    const getOperators = (): ToFullOption<Operator>[] => [
      toFullOption({ name: 'op', label: 'Op', className: 'custom-operatorBased-class' }),
    ];
    const getRuleClassname = jest.fn(() => 'custom-ruleBased-class');
    render(<Rule {...getProps({ fieldMap, getOperators, getRuleClassname })} rule={rule} />);
    expect(screen.getByTestId(TestID.rule)).toHaveClass(
      'custom-ruleBased-class',
      'custom-fieldBased-class',
      'custom-operatorBased-class'
    );
    expect(getRuleClassname).toHaveBeenCalledWith(rule, { fieldData: fieldMap.f1 });
  });
});

describe('deprecated props', () => {
  it('warns about deprecated props', () => {
    // @ts-expect-error rule prop is required
    render(<Rule {...getProps()} rule={undefined} field="f1" operator="=" value="v1" />);
    expect(consoleError).toHaveBeenCalledWith(errorDeprecatedRuleProps);
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
    expect(consoleError).toHaveBeenCalledWith(errorEnabledDndWithoutReactDnD);
  });
});

describe('arity property', () => {
  it('does not render value controls when arity is "unary"', () => {
    render(
      <Rule
        {...getProps({
          getOperators: () => [
            toFullOption({ name: 'unary_op', label: 'Unary Operator', arity: 'unary' }),
          ],
        })}
        rule={{ field: 'f1', operator: 'unary_op', value: 'v1' }}
      />
    );
    expect(() => screen.getByTestId(TestID.valueEditor)).toThrow();
    expect(() => screen.getByTestId(TestID.valueSourceSelector)).toThrow();
  });

  it('does not render value controls when arity < 2', () => {
    render(
      <Rule
        {...getProps({
          getOperators: () => [
            toFullOption({ name: 'unary_op', label: 'Unary Operator', arity: 1 }),
          ],
        })}
        rule={{ field: 'f1', operator: 'unary_op', value: 'v1' }}
      />
    );
    expect(() => screen.getByTestId(TestID.valueEditor)).toThrow();
    expect(() => screen.getByTestId(TestID.valueSourceSelector)).toThrow();
  });
});
