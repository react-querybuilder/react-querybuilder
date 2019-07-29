import { mount, shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import { ActionElement, ValueEditor, ValueSelector } from './controls/index';
import Rule from './Rule';

describe('<Rule />', () => {
  let controls, classNames, schema, props;
  beforeEach(() => {
    //set defaults
    controls = {
      fieldSelector: (props) => (
        <select onChange={(e) => props.handleOnChange(e.target.value)}>
          <option value="field">Field</option>
          <option value="any_field">Any Field</option>
        </select>
      ),
      operatorSelector: (props) => (
        <select onChange={(e) => props.handleOnChange(e.target.value)}>
          <option value="operator">Operator</option>
          <option value="any_operator">Any Operator</option>
        </select>
      ),
      valueEditor: (props) => (
        <input type="text" onChange={(e) => props.handleOnChange(e.target.value)} />
      ),
      removeRuleAction: (props) => <button onClick={(e) => props.handleOnClick(e)}>x</button>
    };
    classNames = {
      fields: 'custom-fields-class',
      operators: 'custom-operators-class',
      removeRule: 'custom-removeRule-class'
    };
    schema = {
      fields: ['field1', 'field2'],
      controls: controls,
      classNames: classNames,
      getOperators: (field) => [{ name: '=', value: 'is' }, { name: '!=', value: 'is not' }],
      onPropChange: (field, value, id) => {},
      onRuleRemove: (ruleId, parentId) => {},
      getLevel: () => 0
    };
    props = {
      key: 'key',
      id: 'id',
      field: 'field',
      value: 'value',
      operator: 'operator',
      schema: schema,
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
        }
      }
    };
  });

  it('should exist', () => {
    expect(Rule).to.exist;
  });

  it('should have a className of "rule"', () => {
    const dom = shallow(<Rule {...props} />);

    expect(dom.find('div').hasClass('rule')).to.be.true;
  });

  describe('field selector as <ValueSelector />', () => {
    beforeEach(() => {
      controls.fieldSelector = ValueSelector;
    });

    it('should have options set to expected fields', () => {
      const expected_fields = [
        { name: 'firstName', label: 'First Label' },
        { name: 'secondName', label: 'Second Label' }
      ];
      schema.fields = expected_fields;
      const dom = shallow(<Rule {...props} />);

      expect(dom.find('ValueSelector').props().options).to.equal(expected_fields);
    });

    behavesLikeASelector('field', 'rule-fields', 'custom-fields-class');
  });

  describe('operator selector as <ValueSelector />', () => {
    beforeEach(() => {
      controls.operatorSelector = ValueSelector;
    });

    it('should have options set to fields returned from "getOperators"', () => {
      const expected_operators = [{ name: '=', label: '=' }, { name: '!=', label: '!=' }];
      schema.getOperators = (field) => {
        return expected_operators;
      };
      const dom = shallow(<Rule {...props} />);

      expect(dom.find('ValueSelector').props().options).to.equal(expected_operators);
    });

    it('should have field set to selected field', () => {
      props.field = 'selected_field';
      const dom = shallow(<Rule {...props} />);

      expect(dom.find('ValueSelector').props().field).to.equal('selected_field');
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

      expect(dom.find('ValueEditor').props().field).to.equal('selected_field');
    });

    it('should have operator set to selected operator', () => {
      props.operator = 'selected_operator';
      const dom = shallow(<Rule {...props} />);

      expect(dom.find('ValueEditor').props().operator).to.equal('selected_operator');
    });

    it('should have value set to specified value', () => {
      props.value = 'specified_value';
      const dom = shallow(<Rule {...props} />);

      expect(dom.find('ValueEditor').props().value).to.equal('specified_value');
    });

    it('should have the onChange method handler', () => {
      const dom = shallow(<Rule {...props} />);

      expect(dom.find('ValueEditor').props().handleOnChange).to.be.a('function');
    });

    it('should trigger change handler', () => {
      const mockEvent = { target: { value: 'foo' } };
      let onChange = sinon.spy();
      const dom = shallow(<ValueEditor handleOnChange={onChange} />);
      dom.find('input').simulate('change', mockEvent);
      expect(onChange.called).to.equal(true);
    });
    //TODO spy on value change handler and verify it is triggered
  });

  describe('rule remove action as <ActionElement />', () => {
    beforeEach(() => {
      controls.removeRuleAction = ActionElement;
    });

    it('should have label set to "x"', () => {
      const dom = shallow(<Rule {...props} />);

      expect(dom.find('ActionElement').props().label).to.equal('x');
    });

    it('should have the default className', () => {
      const dom = shallow(<Rule {...props} />);
      expect(dom.find('ActionElement').props().className).to.contain('rule-remove');
    });

    it('should have the custom className', () => {
      const dom = shallow(<Rule {...props} />);
      expect(dom.find('ActionElement').props().className).to.contain('custom-removeRule-class');
    });

    it('should have the onChange method handler', () => {
      const dom = shallow(<Rule {...props} />);

      expect(dom.find('ActionElement').props().handleOnClick).to.be.a('function');
    });

    //TODO spy on value change handler and verify it is triggered
  });

  describe('onElementChanged methods', () => {
    let actualProperty, actualValue, actualId;
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

        expect(actualProperty).to.equal('field');
        expect(actualValue).to.equal('any_field');
        expect(actualId).to.equal('id');
      });
    });

    describe('onOperatorChanged', () => {
      it('should call onPropChange with the rule id', () => {
        const dom = mount(<Rule {...props} />);
        dom.find('.rule-operators').simulate('change', { target: { value: 'any_operator' } });

        expect(actualProperty).to.equal('operator');
        expect(actualValue).to.equal('any_operator');
        expect(actualId).to.equal('id');
      });
    });

    describe('onValueChanged', () => {
      it('should call onPropChange with the rule id', () => {
        const dom = mount(<Rule {...props} />);
        dom.find('.rule-value').simulate('change', { target: { value: 'any_value' } });

        expect(actualProperty).to.equal('value');
        expect(actualValue).to.equal('any_value');
        expect(actualId).to.equal('id');
      });
    });
  });

  describe('removeRule', () => {
    it('should call onRuleRemove with the rule and parent id', () => {
      let myRuleId, myParentId;
      schema.onRuleRemove = (ruleId, parentId) => {
        myRuleId = ruleId;
        myParentId = parentId;
      };
      const dom = mount(<Rule {...props} />);
      dom.find('.rule-remove').simulate('click');

      expect(myRuleId).to.equal('id');
      expect(myParentId).to.equal('parentId');
    });
  });

  function behavesLikeASelector(value, defaultClassName, customClassName) {
    it('should have the selected value set correctly', () => {
      const dom = shallow(<Rule {...props} />);
      expect(dom.find('ValueSelector').props().value).to.equal(value);
    });

    it('should have the default className', () => {
      const dom = shallow(<Rule {...props} />);
      expect(dom.find('ValueSelector').props().className).to.contain(defaultClassName);
    });

    it('should have the custom className', () => {
      const dom = shallow(<Rule {...props} />);
      expect(dom.find('ValueSelector').props().className).to.contain(customClassName);
    });

    it('should have the onChange method handler', () => {
      const dom = shallow(<Rule {...props} />);
      expect(dom.find('ValueSelector').props().handleOnChange).to.be.a('function');
    });

    it('should have the level of the Rule', () => {
      const dom = shallow(<Rule {...props} />);
      expect(dom.find('ValueSelector').props().level).to.equal(0);
    });
  }
});
