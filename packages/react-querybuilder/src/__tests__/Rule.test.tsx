import { cleanup, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { forwardRef } from 'react';
import {
  simulateDrag,
  simulateDragDrop,
  simulateDragHover,
  wrapWithTestBackend,
} from 'react-dnd-test-utils';
import { act } from 'react-dom/test-utils';
import { defaultTranslations, standardClassnames, TestID } from '../defaults';
import { Rule as RuleOriginal } from '../Rule';
import type {
  ActionProps,
  Classnames,
  Controls,
  Field,
  FieldSelectorProps,
  OperatorSelectorProps,
  RuleProps,
  Schema,
  ValidationResult,
  ValueEditorProps,
  ValueSelectorProps,
} from '../types';

const [Rule, getDndBackendOriginal] = wrapWithTestBackend(RuleOriginal);
// This is just a type guard against `undefined`
const getDndBackend = () => getDndBackendOriginal()!;

const getHandlerId = (el: HTMLElement, dragDrop: 'drag' | 'drop') => () =>
  el.getAttribute(`data-${dragDrop}monitorid`);

const defaultFields: Field[] = [
  { name: 'field1', label: 'Field 1' },
  { name: 'field2', label: 'Field 2' },
];
const fieldMap: { [k: string]: Field } = {};
defaultFields.forEach(f => {
  fieldMap[f.name] = f;
});
const controls: Partial<Controls> = {
  cloneRuleAction: (props: ActionProps) => (
    <button
      data-testid={TestID.cloneRule}
      className={props.className}
      onClick={e => props.handleOnClick(e)}>
      ⧉
    </button>
  ),
  fieldSelector: (props: FieldSelectorProps) => (
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
    <button
      data-testid={TestID.removeRule}
      className={props.className}
      onClick={e => props.handleOnClick(e)}>
      x
    </button>
  ),
  dragHandle: forwardRef(({ className, label }, ref) => (
    <span ref={ref} className={className}>
      {label}
    </span>
  )),
};
const classNames: Partial<Classnames> = {
  cloneRule: 'custom-cloneRule-class',
  dragHandle: 'custom-dragHandle-class',
  fields: 'custom-fields-class',
  operators: 'custom-operators-class',
  removeRule: 'custom-removeRule-class',
  rule: 'custom-rule-class',
};
const schema: Partial<Schema> = {
  fields: defaultFields,
  fieldMap,
  controls: controls as Controls,
  classNames: classNames as Classnames,
  getOperators: _field => [
    { name: '=', label: 'is' },
    { name: '!=', label: 'is not' },
  ],
  getValueEditorType: (_field, _operator) => 'text',
  getInputType: (_field, _operator) => 'text',
  getValues: (_field, _operator) => [
    { name: 'one', label: 'One' },
    { name: 'two', label: 'Two' },
  ],
  onPropChange: (_field, _value, _path) => {},
  onRuleRemove: _path => {},
  showCloneButtons: false,
  validationMap: {},
};
const getProps = (mergeIntoSchema?: Partial<Schema>): RuleProps => ({
  id: 'id',
  field: 'field', // note that this is not a valid field name based on the defaultFields
  value: 'value',
  operator: 'operator',
  schema: { ...schema, ...mergeIntoSchema } as Schema,
  path: [0],
  translations: defaultTranslations,
});

it('should have correct classNames', () => {
  const { getByTestId } = render(<Rule {...getProps()} />);
  expect(getByTestId(TestID.rule)).toHaveClass(standardClassnames.rule, 'custom-rule-class');
});

describe('onElementChanged methods', () => {
  describe('onFieldChanged', () => {
    it('should call onPropChange with the rule path', () => {
      const onPropChange = jest.fn();
      const props = { ...getProps({ onPropChange }) };
      const { getByTestId } = render(<Rule {...props} />);
      userEvent.selectOptions(
        getByTestId(TestID.rule).querySelector(`select.${standardClassnames.fields}`)!,
        'any_field'
      );
      expect(onPropChange).toHaveBeenCalledWith('field', 'any_field', [0]);
    });
  });

  describe('onOperatorChanged', () => {
    it('should call onPropChange with the rule path', () => {
      const onPropChange = jest.fn();
      const props = { ...getProps({ onPropChange }) };
      const { getByTestId } = render(<Rule {...props} />);
      userEvent.selectOptions(
        getByTestId(TestID.rule).querySelector(`select.${standardClassnames.operators}`)!,
        'any_operator'
      );
      expect(onPropChange).toHaveBeenCalledWith('operator', 'any_operator', [0]);
    });
  });

  describe('onValueChanged', () => {
    it('should call onPropChange with the rule path', () => {
      const onPropChange = jest.fn();
      const props = { ...getProps({ onPropChange }) };
      const { getByTestId } = render(<Rule {...props} />);
      userEvent.type(
        getByTestId(TestID.rule).querySelector(`input.${standardClassnames.value}`)!,
        'any_value'
      );
      expect(onPropChange).toHaveBeenCalledWith('value', 'any_value', [0]);
    });
  });
});

describe('cloneRule', () => {
  it('should call moveRule with the right paths', () => {
    const moveRule = jest.fn();
    const { getByText } = render(<Rule {...getProps({ moveRule, showCloneButtons: true })} />);
    userEvent.click(getByText(defaultTranslations.cloneRule.label));
    expect(moveRule).toHaveBeenCalledWith([0], [1], true);
  });
});

describe('removeRule', () => {
  it('should call onRuleRemove with the rule and path', () => {
    const onRuleRemove = jest.fn();
    const { getByText } = render(<Rule {...getProps({ onRuleRemove })} />);
    userEvent.click(getByText(defaultTranslations.removeRule.label));
    expect(onRuleRemove).toHaveBeenCalledWith([0]);
  });
});

describe('validation', () => {
  it('should not validate if no validationMap[id] value exists and no validator function is provided', () => {
    const { getByTestId } = render(<Rule {...getProps()} />);
    expect(getByTestId(TestID.rule)).not.toHaveClass(standardClassnames.valid);
    expect(getByTestId(TestID.rule)).not.toHaveClass(standardClassnames.invalid);
  });

  it('should validate to false if validationMap[id] = false even if a validator function is provided', () => {
    const validator = jest.fn(() => true);
    const fieldMap = { field1: { name: 'field1', label: 'Field 1', validator } };
    const validationMap = { id: false };
    const { getByTestId } = render(<Rule {...getProps({ fieldMap, validationMap })} />);
    expect(getByTestId(TestID.rule)).not.toHaveClass(standardClassnames.valid);
    expect(getByTestId(TestID.rule)).toHaveClass(standardClassnames.invalid);
    expect(validator).not.toHaveBeenCalled();
  });

  it('should validate to true if validationMap[id] = true', () => {
    const validationMap = { id: true };
    const { getByTestId } = render(<Rule {...getProps({ validationMap })} />);
    expect(getByTestId(TestID.rule)).toHaveClass(standardClassnames.valid);
    expect(getByTestId(TestID.rule)).not.toHaveClass(standardClassnames.invalid);
  });

  it('should validate if validationMap[id] does not exist and a validator function is provided', () => {
    const validator = jest.fn(() => true);
    const fieldMap = { field1: { name: 'field1', label: 'Field 1', validator } };
    const { getByTestId } = render(<Rule {...getProps({ fieldMap })} field="field1" />);
    expect(getByTestId(TestID.rule)).toHaveClass(standardClassnames.valid);
    expect(getByTestId(TestID.rule)).not.toHaveClass(standardClassnames.invalid);
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
    const { getByTitle } = render(<Rule {...getProps({ validationMap, controls })} />);
    expect(getByTitle('ValueSelector').innerHTML).toEqual(JSON.stringify(valRes));
  });
});

describe('enableDragAndDrop', () => {
  afterEach(() => {
    cleanup();
  });

  it('should not have the drag class if not dragging', () => {
    const { getByTestId } = render(<Rule {...getProps()} />);
    const rule = getByTestId(TestID.rule);
    expect(rule).not.toHaveClass(standardClassnames.dndDragging);
  });

  it('should have the drag class if dragging', () => {
    const { getByTestId } = render(<Rule {...getProps()} />);
    const rule = getByTestId(TestID.rule);
    simulateDrag(getHandlerId(rule, 'drag'), getDndBackend());
    expect(rule).toHaveClass(standardClassnames.dndDragging);
    act(() => {
      getDndBackend().simulateEndDrag();
    });
  });

  it('should have the over class if hovered', () => {
    const { getAllByTestId } = render(
      <div>
        <Rule {...getProps()} path={[0]} />
        <Rule {...getProps()} path={[1]} />
      </div>
    );
    const rules = getAllByTestId(TestID.rule);
    simulateDragHover(
      getHandlerId(rules[0], 'drag'),
      getHandlerId(rules[1], 'drop'),
      getDndBackend()
    );
    expect(rules[1]).toHaveClass(standardClassnames.dndOver);
    act(() => {
      getDndBackend().simulateEndDrag();
    });
  });

  it('should handle a dropped rule', () => {
    const moveRule = jest.fn();
    const { getAllByTestId } = render(
      <div>
        <Rule {...getProps({ moveRule })} path={[0]} />
        <Rule {...getProps({ moveRule })} path={[1]} />
      </div>
    );
    const rules = getAllByTestId(TestID.rule);
    simulateDragDrop(
      getHandlerId(rules[0], 'drag'),
      getHandlerId(rules[1], 'drop'),
      getDndBackend()
    );
    expect(rules[0]).not.toHaveClass(standardClassnames.dndDragging);
    expect(rules[1]).not.toHaveClass(standardClassnames.dndOver);
    expect(moveRule).toHaveBeenCalledWith([0], [2]);
  });

  it('should abort move if dropped on itself', () => {
    const moveRule = jest.fn();
    const { getByTestId } = render(<Rule {...getProps({ moveRule })} />);
    const rule = getByTestId(TestID.rule);
    simulateDragDrop(getHandlerId(rule, 'drag'), getHandlerId(rule, 'drop'), getDndBackend());
    expect(rule).not.toHaveClass(standardClassnames.dndDragging);
    expect(rule).not.toHaveClass(standardClassnames.dndOver);
    expect(moveRule).not.toHaveBeenCalled();
  });

  it('should not try to update query if disabled', () => {
    const moveRule = jest.fn();
    const { getAllByTestId } = render(
      <div>
        <Rule {...getProps({ moveRule })} path={[0]} />
        <Rule disabled {...getProps({ moveRule })} path={[1]} />
      </div>
    );
    const rules = getAllByTestId(TestID.rule);
    simulateDragDrop(
      getHandlerId(rules[0], 'drag'),
      getHandlerId(rules[1], 'drop'),
      getDndBackend()
    );
    expect(moveRule).not.toHaveBeenCalled();
  });
});

describe('disabled', () => {
  it('does not try to update the query', () => {
    const onRuleRemove = jest.fn();
    const onPropChange = jest.fn();
    const moveRule = jest.fn();
    const { getByTestId } = render(
      <Rule
        {...getProps({
          showCloneButtons: true,
          onRuleRemove,
          onPropChange,
          moveRule,
        })}
        disabled
      />
    );
    userEvent.selectOptions(getByTestId(TestID.fields), 'any_field');
    userEvent.selectOptions(getByTestId(TestID.operators), 'any_operator');
    userEvent.type(getByTestId(TestID.valueEditor), 'Test');
    userEvent.click(getByTestId(TestID.cloneRule));
    userEvent.click(getByTestId(TestID.removeRule));
    expect(onRuleRemove).not.toHaveBeenCalled();
    expect(onPropChange).not.toHaveBeenCalled();
    expect(moveRule).not.toHaveBeenCalled();
  });
});
