import { cleanup, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mount } from 'enzyme';
import { forwardRef } from 'react';
import {
  simulateDrag,
  simulateDragDrop,
  simulateDragHover,
  wrapWithTestBackend
} from 'react-dnd-test-utils';
import { act } from 'react-dom/test-utils';
import { ActionElement, DragHandle, ValueEditor, ValueSelector } from '../controls';
import { defaultTranslations, standardClassnames } from '../defaults';
import { Rule as RuleOriginal } from '../Rule';
import {
  ActionProps,
  Classnames,
  Controls,
  Field,
  FieldSelectorProps,
  NameLabelPair,
  OperatorSelectorProps,
  RuleProps,
  Schema,
  ValidationResult,
  ValueEditorProps
} from '../types';

const [Rule, getDndBackend] = wrapWithTestBackend(RuleOriginal);

const getHandlerId = (el: HTMLElement, dragDrop: 'drag' | 'drop') => () =>
  el.getAttribute(`data-${dragDrop}monitorid`);

const defaultFields: Field[] = [
  { name: 'field1', label: 'Field 1' },
  { name: 'field2', label: 'Field 2' }
];
const fieldMap: { [k: string]: Field } = {};
defaultFields.forEach((f) => {
  fieldMap[f.name] = f;
});

describe('<Rule />', () => {
  let controls: Partial<Controls>;
  let classNames: Partial<Classnames>;
  let schema: Partial<Schema>;
  let props: RuleProps;

  beforeEach(() => {
    controls = {
      cloneRuleAction: (props: ActionProps) => (
        <button className={props.className} onClick={(e) => props.handleOnClick(e)}>
          ⧉
        </button>
      ),
      fieldSelector: (props: FieldSelectorProps) => (
        <select onChange={(e) => props.handleOnChange(e.target.value)}>
          <option value="field">Field</option>
          <option value="any_field">Any Field</option>
        </select>
      ),
      operatorSelector: (props: OperatorSelectorProps) => (
        <select onChange={(e) => props.handleOnChange(e.target.value)}>
          <option value="operator">Operator</option>
          <option value="any_operator">Any Operator</option>
        </select>
      ),
      valueEditor: (props: ValueEditorProps) => (
        <input type="text" onChange={(e) => props.handleOnChange(e.target.value)} />
      ),
      removeRuleAction: (props: ActionProps) => (
        <button onClick={(e) => props.handleOnClick(e)}>x</button>
      ),
      dragHandle: forwardRef(({ className, label }, ref) => (
        <span ref={ref} className={className}>
          {label}
        </span>
      ))
    };
    classNames = {
      cloneRule: 'custom-cloneRule-class',
      dragHandle: 'custom-dragHandle-class',
      fields: 'custom-fields-class',
      operators: 'custom-operators-class',
      removeRule: 'custom-removeRule-class'
    };
    schema = {
      fields: defaultFields,
      fieldMap,
      controls: controls as Controls,
      classNames: classNames as Classnames,
      getOperators: (_field) => [
        { name: '=', label: 'is' },
        { name: '!=', label: 'is not' }
      ],
      getValueEditorType: (_field, _operator) => 'text',
      getInputType: (_field, _operator) => 'text',
      getValues: (_field, _operator) => [
        { name: 'one', label: 'One' },
        { name: 'two', label: 'Two' }
      ],
      onPropChange: (_field, _value, _path) => {},
      onRuleRemove: (_path) => {},
      showCloneButtons: false,
      validationMap: {}
    };
    props = {
      id: 'id',
      field: 'field', // note that this is not a valid field name based on the defaultFields
      value: 'value',
      operator: 'operator',
      schema: schema as Schema,
      path: [0],
      translations: defaultTranslations
    };
  });

  it('should exist', () => {
    expect(Rule).toBeDefined();
  });

  it('should have correct className', () => {
    const dom = mount(<Rule {...props} />);

    expect(dom.find('div').hasClass(standardClassnames.rule)).toBe(true);
  });

  describe('drag handle as <DragHandle />', () => {
    beforeEach(() => {
      controls.dragHandle = DragHandle;
    });

    it('should have custom class', () => {
      const dom = mount(<Rule {...props} />);
      expect(dom.find(DragHandle).hasClass(standardClassnames.dragHandle)).toBe(true);
      expect(dom.find(DragHandle).hasClass('custom-dragHandle-class')).toBe(true);
    });
  });

  describe('field selector as <ValueSelector />', () => {
    beforeEach(() => {
      controls.fieldSelector = ValueSelector;
    });

    it('should have options set to expected fields', () => {
      const expected_fields: Field[] = [
        { name: 'firstName', label: 'First Label' },
        { name: 'secondName', label: 'Second Label' }
      ];
      schema.fields = expected_fields;
      const dom = mount(<Rule {...props} />);

      expect(dom.find(ValueSelector).props().options).toEqual(expected_fields);
    });

    behavesLikeASelector('field', standardClassnames.fields, 'custom-fields-class');
  });

  describe('operator selector as <ValueSelector />', () => {
    beforeEach(() => {
      controls.operatorSelector = ValueSelector;
    });

    it('should have options set to fields returned from "getOperators"', () => {
      const expected_operators: NameLabelPair[] = [
        { name: '=', label: '=' },
        { name: '!=', label: '!=' }
      ];
      schema.getOperators = () => expected_operators;
      const dom = mount(<Rule {...props} />);

      expect(dom.find(ValueSelector).props().options).toEqual(expected_operators);
    });

    it('should have field set to selected field', () => {
      props.field = 'selected_field';
      const dom = mount(<Rule {...props} />);

      expect((dom.find(ValueSelector).props() as OperatorSelectorProps).field).toBe(
        'selected_field'
      );
    });

    behavesLikeASelector('operator', standardClassnames.operators, 'custom-operators-class');
  });

  describe('value editor as <ValueEditor />', () => {
    beforeEach(() => {
      controls.valueEditor = ValueEditor;
    });

    it('should have field set to selected field', () => {
      props.field = 'selected_field';
      const dom = mount(<Rule {...props} />);

      expect(dom.find(ValueEditor).props().field).toBe('selected_field');
    });

    it('should have fieldData set to selected field data', () => {
      props.field = 'field1';
      const dom = mount(<Rule {...props} />);

      expect(dom.find(ValueEditor).props().fieldData.name).toBe('field1');
      expect(dom.find(ValueEditor).props().fieldData.label).toBe('Field 1');
    });

    it('should have operator set to selected operator', () => {
      props.operator = 'selected_operator';
      const dom = mount(<Rule {...props} />);

      expect(dom.find(ValueEditor).props().operator).toBe('selected_operator');
    });

    it('should have value set to specified value', () => {
      props.value = 'specified_value';
      const dom = mount(<Rule {...props} />);

      expect(dom.find(ValueEditor).props().value).toBe('specified_value');
    });

    it('should have the onChange method handler', () => {
      const dom = mount(<Rule {...props} />);

      expect(typeof dom.find(ValueEditor).props().handleOnChange).toBe('function');
    });

    it('should trigger change handler', () => {
      const mockEvent = { target: { value: 'foo' } };
      const onChange = jest.fn();
      const dom = mount(
        <ValueEditor
          level={0}
          handleOnChange={onChange}
          field="test"
          fieldData={{ name: 'test', label: 'Test' }}
          operator="and"
        />
      );
      dom.find('input').simulate('change', mockEvent);
      expect(onChange).toHaveBeenCalled();
    });
    //TODO spy on value change handler and verify it is triggered
  });

  describe('rule remove action as <ActionElement />', () => {
    beforeEach(() => {
      controls.removeRuleAction = ActionElement;
    });

    it('should have label set to "x"', () => {
      const dom = mount(<Rule {...props} />);

      expect(dom.find(ActionElement).props().label).toBe('x');
    });

    it('should have the default className', () => {
      const dom = mount(<Rule {...props} />);
      expect(dom.find(ActionElement).props().className).toContain(standardClassnames.removeRule);
    });

    it('should have the custom className', () => {
      const dom = mount(<Rule {...props} />);
      expect(dom.find(ActionElement).props().className).toContain('custom-removeRule-class');
    });

    it('should have the onChange method handler', () => {
      const dom = mount(<Rule {...props} />);

      expect(typeof dom.find(ActionElement).props().handleOnClick).toBe('function');
    });

    //TODO spy on value change handler and verify it is triggered
  });

  describe('clone rule action as <ActionElement />', () => {
    beforeEach(() => {
      schema.showCloneButtons = true;
      controls.cloneRuleAction = ActionElement;
    });

    it('should have label set to "⧉"', () => {
      const dom = mount(<Rule {...props} />);

      expect(dom.find(ActionElement).props().label).toBe('⧉');
    });

    it('should have the default className', () => {
      const dom = mount(<Rule {...props} />);
      expect(dom.find(ActionElement).props().className).toContain(standardClassnames.cloneRule);
    });

    it('should have the custom className', () => {
      const dom = mount(<Rule {...props} />);
      expect(dom.find(ActionElement).props().className).toContain('custom-cloneRule-class');
    });

    it('should have the onChange method handler', () => {
      const dom = mount(<Rule {...props} />);

      expect(typeof dom.find(ActionElement).props().handleOnClick).toBe('function');
    });

    //TODO spy on value change handler and verify it is triggered
  });

  describe('onElementChanged methods', () => {
    let actualProperty: string, actualValue: any, actualPath: number[];
    beforeEach(() => {
      schema.onPropChange = (property, value, path) => {
        actualProperty = property;
        actualValue = value;
        actualPath = path;
      };
    });

    describe('onFieldChanged', () => {
      it('should call onPropChange with the rule path', () => {
        const dom = mount(<Rule {...props} />);
        dom
          .find(`.${standardClassnames.fields}`)
          .simulate('change', { target: { value: 'any_field' } });

        expect(actualProperty).toBe('field');
        expect(actualValue).toBe('any_field');
        expect(actualPath).toEqual([0]);
      });
    });

    describe('onOperatorChanged', () => {
      it('should call onPropChange with the rule path', () => {
        const dom = mount(<Rule {...props} />);
        dom
          .find(`.${standardClassnames.operators}`)
          .simulate('change', { target: { value: 'any_operator' } });

        expect(actualProperty).toBe('operator');
        expect(actualValue).toBe('any_operator');
        expect(actualPath).toEqual([0]);
      });
    });

    describe('onValueChanged', () => {
      it('should call onPropChange with the rule path', () => {
        const dom = mount(<Rule {...props} />);
        dom
          .find(`.${standardClassnames.value}`)
          .simulate('change', { target: { value: 'any_value' } });

        expect(actualProperty).toBe('value');
        expect(actualValue).toBe('any_value');
        expect(actualPath).toEqual([0]);
      });
    });
  });

  describe('cloneRule', () => {
    beforeEach(() => {
      schema.showCloneButtons = true;
    });

    it('should call moveRule with the right paths', () => {
      schema.moveRule = jest.fn();
      const { getByText } = render(<Rule {...props} />);
      userEvent.click(getByText('⧉'));
      expect(schema.moveRule).toHaveBeenCalledWith([0], [1], true);
    });
  });

  describe('removeRule', () => {
    it('should call onRuleRemove with the rule and path', () => {
      let myPath: number[];
      schema.onRuleRemove = (path) => {
        myPath = path;
      };
      const dom = mount(<Rule {...props} />);
      dom.find(`.${standardClassnames.removeRule}`).simulate('click');

      expect(myPath).toEqual([0]);
    });
  });

  describe('validation', () => {
    it('should not validate if no validationMap[id] value exists and no validator function is provided', () => {
      const dom = mount(<Rule {...props} />);
      expect(dom.find('div').first().hasClass(standardClassnames.valid)).toBe(false);
      expect(dom.find('div').first().hasClass(standardClassnames.invalid)).toBe(false);
    });

    it('should validate to false if validationMap[id] = false even if a validator function is provided', () => {
      const validator = jest.fn(() => true);
      schema.fieldMap = { field1: { name: 'field1', label: 'Field 1', validator } };
      schema.validationMap = { id: false };
      const dom = mount(<Rule {...props} />);
      expect(dom.find('div').first().hasClass(standardClassnames.valid)).toBe(false);
      expect(dom.find('div').first().hasClass(standardClassnames.invalid)).toBe(true);
      expect(validator).not.toHaveBeenCalled();
    });

    it('should validate to true if validationMap[id] = true', () => {
      schema.validationMap = { id: true };
      const dom = mount(<Rule {...props} />);
      expect(dom.find('div').first().hasClass(standardClassnames.valid)).toBe(true);
      expect(dom.find('div').first().hasClass(standardClassnames.invalid)).toBe(false);
    });

    it('should validate if validationMap[id] does not exist and a validator function is provided', () => {
      const validator = jest.fn(() => true);
      props.field = 'field1';
      schema.fieldMap = { field1: { name: 'field1', label: 'Field 1', validator } };
      const dom = mount(<Rule {...props} />);
      expect(dom.find('div').first().hasClass(standardClassnames.valid)).toBe(true);
      expect(dom.find('div').first().hasClass(standardClassnames.invalid)).toBe(false);
      expect(validator).toHaveBeenCalled();
    });

    it('should pass down validationResult as validation to children', () => {
      const valRes: ValidationResult = { valid: false, reasons: ['invalid'] };
      schema.controls.fieldSelector = ValueSelector;
      schema.validationMap = { id: valRes };
      const dom = mount(<Rule {...props} />);
      expect(dom.find(ValueSelector).props().validation).toEqual(valRes);
    });
  });

  describe('enableDragAndDrop', () => {
    afterEach(() => {
      cleanup();
    });

    it('should not have the drag class if not dragging', () => {
      const { getByTestId } = render(<Rule {...props} />);
      const rule = getByTestId('rule');
      expect(rule.className).not.toContain(standardClassnames.dndDragging);
    });

    it('should have the drag class if dragging', () => {
      const { getByTestId } = render(<Rule {...props} />);
      const rule = getByTestId('rule');
      simulateDrag(getHandlerId(rule, 'drag'), getDndBackend());
      expect(rule.className).toContain(standardClassnames.dndDragging);
      act(() => {
        getDndBackend().simulateEndDrag();
      });
    });

    it('should have the over class if hovered', () => {
      const { getAllByTestId } = render(
        <div>
          <Rule {...props} path={[0]} />
          <Rule {...props} path={[1]} />
        </div>
      );
      const rules = getAllByTestId('rule');
      simulateDragHover(
        getHandlerId(rules[0], 'drag'),
        getHandlerId(rules[1], 'drop'),
        getDndBackend()
      );
      expect(rules[1].className).toContain(standardClassnames.dndOver);
      act(() => {
        getDndBackend().simulateEndDrag();
      });
    });

    it('should handle a dropped rule', () => {
      const moveRule = jest.fn();
      props.schema.moveRule = moveRule;
      const { getAllByTestId } = render(
        <div>
          <Rule {...props} path={[0]} />
          <Rule {...props} path={[1]} />
        </div>
      );
      const rules = getAllByTestId('rule');
      simulateDragDrop(
        getHandlerId(rules[0], 'drag'),
        getHandlerId(rules[1], 'drop'),
        getDndBackend()
      );
      expect(rules[0].className).not.toContain(standardClassnames.dndDragging);
      expect(rules[1].className).not.toContain(standardClassnames.dndOver);
      expect(moveRule).toHaveBeenCalledWith([0], [2]);
    });

    it('should abort move if dropped on itself', () => {
      const moveRule = jest.fn();
      props.schema.moveRule = moveRule;
      const { getByTestId } = render(<Rule {...props} />);
      const rule = getByTestId('rule');
      simulateDragDrop(getHandlerId(rule, 'drag'), getHandlerId(rule, 'drop'), getDndBackend());
      expect(rule.className).not.toContain(standardClassnames.dndDragging);
      expect(rule.className).not.toContain(standardClassnames.dndOver);
      expect(moveRule).not.toHaveBeenCalled();
    });
  });

  function behavesLikeASelector(value: string, defaultClassName: string, customClassName: string) {
    it('should have the selected value set correctly', () => {
      const dom = mount(<Rule {...props} />);
      expect(dom.find(ValueSelector).props().value).toBe(value);
    });

    it('should have the default className', () => {
      const dom = mount(<Rule {...props} />);
      expect(dom.find(ValueSelector).hasClass(defaultClassName)).toBe(true);
    });

    it('should have the custom className', () => {
      const dom = mount(<Rule {...props} />);
      expect(dom.find(ValueSelector).hasClass(customClassName)).toBe(true);
    });

    it('should have the onChange method handler', () => {
      const dom = mount(<Rule {...props} />);
      expect(typeof dom.find(ValueSelector).props().handleOnChange).toBe('function');
    });

    it('should have the level of the Rule', () => {
      const dom = mount(<Rule {...props} />);
      expect(dom.find(ValueSelector).props().level).toBe(1);
    });
  }
});
