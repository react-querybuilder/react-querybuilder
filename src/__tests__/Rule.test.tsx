import { mount, shallow } from 'enzyme';
import { ActionElement, ValueEditor, ValueSelector } from '../controls/index';
import { Rule } from '../Rule';
import {
  ActionProps,
  Classnames,
  Controls,
  Field,
  FieldSelectorProps,
  NameLabelPair,
  OperatorSelectorProps,
  RuleProps,
  RuleType,
  Schema,
  ValueEditorProps
} from '../types';

describe('<Rule />', () => {
  let controls: Partial<Controls>,
    classNames: Partial<Classnames>,
    schema: Partial<Schema>,
    props: RuleProps;
  beforeEach(() => {
    //set defaults
    controls = {
      cloneRuleAction: (props: ActionProps) => (
        <button onClick={(e) => props.handleOnClick(e)}>⧉</button>
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
      )
    };
    classNames = {
      cloneRule: 'custom-cloneRule-class',
      fields: 'custom-fields-class',
      operators: 'custom-operators-class',
      removeRule: 'custom-removeRule-class'
    };
    schema = {
      fields: [
        { name: 'field1', label: 'Field 1' },
        { name: 'field2', label: 'Field 2' }
      ],
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
      onPropChange: (_field, _value, _id) => {},
      onRuleRemove: (_ruleId, _parentId) => {},
      getLevel: () => 0,
      showCloneButtons: false
    };
    props = {
      id: 'id',
      field: 'field',
      value: 'value',
      operator: 'operator',
      schema: schema as Schema,
      parentId: 'parentId',
      translations: {
        fields: {
          title: 'Fields'
        },
        operators: {
          title: 'Operators'
        },
        value: {
          title: 'Value'
        },
        removeRule: {
          label: 'x',
          title: 'Remove rule'
        },
        removeGroup: {
          label: 'x',
          title: 'Remove group'
        },
        addRule: {
          label: '+Rule',
          title: 'Add rule'
        },
        addGroup: {
          label: '+Group',
          title: 'Add group'
        },
        combinators: {
          title: 'Combinators'
        },
        notToggle: {
          label: 'Not',
          title: 'Invert this group'
        },
        cloneRule: {
          label: '⧉',
          title: 'Clone rule'
        },
        cloneRuleGroup: {
          label: '⧉',
          title: 'Clone group'
        }
      }
    };
  });

  it('should exist', () => {
    expect(Rule).toBeDefined();
  });

  it('should have a className of "rule"', () => {
    const dom = shallow(<Rule {...props} />);

    expect(dom.find('div').hasClass('rule')).toBe(true);
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
      const dom = shallow(<Rule {...props} />);

      expect(dom.find(ValueSelector).props().options).toEqual(expected_fields);
    });

    behavesLikeASelector('field', 'rule-fields', 'custom-fields-class');
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
      const dom = shallow(<Rule {...props} />);

      expect(dom.find(ValueSelector).props().options).toEqual(expected_operators);
    });

    it('should have field set to selected field', () => {
      props.field = 'selected_field';
      const dom = shallow(<Rule {...props} />);

      expect((dom.find(ValueSelector).props() as OperatorSelectorProps).field).toBe(
        'selected_field'
      );
    });

    behavesLikeASelector('operator', 'rule-operators', 'custom-operators-class');
  });

  describe('value editor as <ValueEditor />', () => {
    beforeEach(() => {
      controls.valueEditor = ValueEditor;
    });

    it('should have field set to selected field', () => {
      props.field = 'selected_field';
      const dom = shallow(<Rule {...props} />);

      expect(dom.find(ValueEditor).props().field).toBe('selected_field');
    });

    it('should have fieldData set to selected field data', () => {
      props.field = 'field1';
      const dom = shallow(<Rule {...props} />);

      expect(dom.find(ValueEditor).props().fieldData.name).toBe('field1');
      expect(dom.find(ValueEditor).props().fieldData.label).toBe('Field 1');
    });

    it('should have operator set to selected operator', () => {
      props.operator = 'selected_operator';
      const dom = shallow(<Rule {...props} />);

      expect(dom.find('ValueEditor').props().operator).toBe('selected_operator');
    });

    it('should have value set to specified value', () => {
      props.value = 'specified_value';
      const dom = shallow(<Rule {...props} />);

      expect(dom.find('ValueEditor').props().value).toBe('specified_value');
    });

    it('should have the onChange method handler', () => {
      const dom = shallow(<Rule {...props} />);

      expect(typeof dom.find(ValueEditor).props().handleOnChange).toBe('function');
    });

    it('should trigger change handler', () => {
      const mockEvent = { target: { value: 'foo' } };
      const onChange = jest.fn();
      const dom = shallow(
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
      const dom = shallow(<Rule {...props} />);

      expect(dom.find('ActionElement').props().label).toBe('x');
    });

    it('should have the default className', () => {
      const dom = shallow(<Rule {...props} />);
      expect(dom.find('ActionElement').props().className).toContain('rule-remove');
    });

    it('should have the custom className', () => {
      const dom = shallow(<Rule {...props} />);
      expect(dom.find('ActionElement').props().className).toContain('custom-removeRule-class');
    });

    it('should have the onChange method handler', () => {
      const dom = shallow(<Rule {...props} />);

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
      const dom = shallow(<Rule {...props} />);

      expect(dom.find('ActionElement').props().label).toBe('⧉');
    });

    it('should have the default className', () => {
      const dom = shallow(<Rule {...props} />);
      expect(dom.find('ActionElement').props().className).toContain('rule-cloneRule');
    });

    it('should have the custom className', () => {
      const dom = shallow(<Rule {...props} />);
      expect(dom.find('ActionElement').props().className).toContain('custom-cloneRule-class');
    });

    it('should have the onChange method handler', () => {
      const dom = shallow(<Rule {...props} />);

      expect(typeof dom.find(ActionElement).props().handleOnClick).toBe('function');
    });

    //TODO spy on value change handler and verify it is triggered
  });

  describe('onElementChanged methods', () => {
    let actualProperty: string, actualValue: any, actualId: string;
    beforeEach(() => {
      schema.onPropChange = (property, value, id) => {
        actualProperty = property;
        actualValue = value;
        actualId = id;
      };
    });

    describe('onFieldChanged', () => {
      it('should call onPropChange with the rule id', () => {
        const dom = mount(<Rule {...props} />);
        dom.find('.rule-fields').simulate('change', { target: { value: 'any_field' } });

        expect(actualProperty).toBe('field');
        expect(actualValue).toBe('any_field');
        expect(actualId).toBe('id');
      });
    });

    describe('onOperatorChanged', () => {
      it('should call onPropChange with the rule id', () => {
        const dom = mount(<Rule {...props} />);
        dom.find('.rule-operators').simulate('change', { target: { value: 'any_operator' } });

        expect(actualProperty).toBe('operator');
        expect(actualValue).toBe('any_operator');
        expect(actualId).toBe('id');
      });
    });

    describe('onValueChanged', () => {
      it('should call onPropChange with the rule id', () => {
        const dom = mount(<Rule {...props} />);
        dom.find('.rule-value').simulate('change', { target: { value: 'any_value' } });

        expect(actualProperty).toBe('value');
        expect(actualValue).toBe('any_value');
        expect(actualId).toBe('id');
      });
    });
  });

  describe('cloneRule', () => {
    beforeEach(() => {
      schema.showCloneButtons = true;
    });

    it('should call onAddRule with the rule and parent id', () => {
      let myRule: RuleType, myParentId: string;
      schema.onRuleAdd = (rule, parentId) => {
        myRule = rule;
        myParentId = parentId;
      };
      const dom = mount(<Rule {...props} />);
      dom.find('.rule-cloneRule').simulate('click');

      expect(myRule).toBeDefined();
      expect(myParentId).toBe('parentId');
    });
  });

  describe('removeRule', () => {
    it('should call onRuleRemove with the rule and parent id', () => {
      let myRuleId: string, myParentId: string;
      schema.onRuleRemove = (ruleId, parentId) => {
        myRuleId = ruleId;
        myParentId = parentId;
      };
      const dom = mount(<Rule {...props} />);
      dom.find('.rule-remove').simulate('click');

      expect(myRuleId).toBe('id');
      expect(myParentId).toBe('parentId');
    });
  });

  function behavesLikeASelector(value: string, defaultClassName: string, customClassName: string) {
    it('should have the selected value set correctly', () => {
      const dom = shallow(<Rule {...props} />);
      expect(dom.find('ValueSelector').props().value).toBe(value);
    });

    it('should have the default className', () => {
      const dom = shallow(<Rule {...props} />);
      expect(dom.find('ValueSelector').props().className).toContain(defaultClassName);
    });

    it('should have the custom className', () => {
      const dom = shallow(<Rule {...props} />);
      expect(dom.find('ValueSelector').props().className).toContain(customClassName);
    });

    it('should have the onChange method handler', () => {
      const dom = shallow(<Rule {...props} />);
      expect(typeof dom.find(ValueSelector).props().handleOnChange).toBe('function');
    });

    it('should have the level of the Rule', () => {
      const dom = shallow(<Rule {...props} />);
      expect(dom.find(ValueSelector).props().level).toBe(0);
    });
  }
});
