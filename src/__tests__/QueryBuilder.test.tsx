import { expect } from 'chai';
import { mount, ReactWrapper } from 'enzyme';
import { cloneDeep } from 'lodash';
import React from 'react';
import { act } from 'react-dom/test-utils';
import sinon from 'sinon';
import { ActionElement } from '../controls';
import { QueryBuilder } from '../QueryBuilder';
import { Rule } from '../Rule';
import { RuleGroup } from '../RuleGroup';
import { Field, QueryBuilderProps, RuleGroupType } from '../types';

describe('<QueryBuilder />', () => {
  const props: QueryBuilderProps = {
    fields: [],
    onQueryChange: () => null
  };

  it('should exist', () => {
    expect(QueryBuilder).to.exist;
  });

  describe('when rendered', () => {
    let wrapper: ReactWrapper;

    beforeEach(() => {
      wrapper = mount(<QueryBuilder {...props} />);
    });

    afterEach(() => {
      wrapper.unmount();
    });

    it('should render the root RuleGroup', () => {
      expect(wrapper.find(RuleGroup)).to.have.length(1);
    });

    it('should show the list of combinators in the RuleGroup', () => {
      const options = wrapper.find('select option');
      expect(options).to.have.length(2); // and, or
    });
  });

  describe('when rendered with queryChange callback', () => {
    let wrapper: ReactWrapper, queryChange;

    beforeEach(() => {
      queryChange = sinon.spy();
      act(() => {
        wrapper = mount(<QueryBuilder {...props} onQueryChange={queryChange} />);
      });
    });

    afterEach(() => {
      wrapper.unmount();
      queryChange.resetHistory();
    });

    it('should call onQueryChange with query', () => {
      // Spy is called initially when mounting component (once)
      expect(queryChange.calledOnce).to.equal(true);
      const initialID = wrapper.find(RuleGroup).props().id;
      const query = { id: initialID, combinator: 'and', rules: [], not: false };
      expect(queryChange.calledWith(query)).to.equal(true);
    });
  });

  describe('when initial query, without fields, is provided', () => {
    let wrapper: ReactWrapper;

    beforeEach(() => {
      const newProps = cloneDeep(props);
      delete newProps.fields;
      act(() => {
        wrapper = mount(<QueryBuilder {...newProps} />);
      });
    });

    afterEach(() => {
      wrapper.unmount();
    });

    it('should not contain a <Rule />', () => {
      expect(wrapper.find(Rule).length).to.eq(0);
    });

    it('should contain the addRuleAction and addGroupAction components', () => {
      expect(wrapper.find(ActionElement).length).to.eq(2);
    });
  });

  describe('when initial query, without fields, is provided create rule should work', () => {
    let wrapper: ReactWrapper;

    beforeEach(() => {
      const newProps = cloneDeep(props);
      delete newProps.fields;
      act(() => {
        wrapper = mount(<QueryBuilder {...newProps} />);
      });
    });

    afterEach(() => {
      wrapper.unmount();
    });

    it('should be able to create rule on add rule click', () => {
      wrapper.find('.ruleGroup-addRule').first().simulate('click');
      expect(wrapper.find(Rule).length).to.eq(1);
    });
  });

  describe('when initial query, without ID, is provided', () => {
    let wrapper: ReactWrapper;
    const queryWithoutID = {
      combinator: 'and',
      not: false,
      rules: [
        {
          field: 'firstName',
          value: 'Test without ID',
          operator: '='
        }
      ]
    };

    const fields: Field[] = [
      { name: 'firstName', label: 'First Name' },
      { name: 'lastName', label: 'Last Name' },
      { name: 'age', label: 'Age' }
    ];

    beforeEach(() => {
      act(() => {
        wrapper = mount(
          <QueryBuilder {...props} query={queryWithoutID as RuleGroupType} fields={fields} />
        );
      });
    });

    afterEach(() => {
      wrapper.unmount();
    });

    it('should contain a <Rule />', () => {
      const rule = wrapper.find(Rule);
      expect(rule).to.have.length(1);
    });

    it('should have the Rule with the correct props', () => {
      const rule = wrapper.find(Rule);
      expect(rule.props().field).to.equal('firstName');
      expect(rule.props().value).to.equal('Test without ID');
      expect(rule.props().operator).to.equal('=');
    });

    it('should have a select control with the provided fields', () => {
      const rule = wrapper.find(Rule);
      expect(rule.find('.rule-fields option')).to.have.length(3);
    });

    it('should have a field selector with the correct field', () => {
      const rule = wrapper.find(Rule);
      expect(rule.find('.rule-fields select').props().value).to.equal('firstName');
    });

    it('should have an operator selector with the correct operator', () => {
      const rule = wrapper.find(Rule);
      expect(rule.find('.rule-operators select').props().value).to.equal('=');
    });

    it('should have an input control with the correct value', () => {
      const rule = wrapper.find(Rule);
      expect(rule.find('input').props().value).to.equal('Test without ID');
    });
  });

  describe('when receiving new props', () => {
    let wrapper: ReactWrapper<QueryBuilderProps>;
    const newFields = [
      { name: 'domainName', label: 'Domain Name' },
      { name: 'ownerName', label: 'Owner Name' }
    ];

    const newQuery = {
      combinator: 'and',
      not: false,
      rules: [
        {
          field: 'domainName',
          value: 'www.example.com',
          operator: '!='
        }
      ]
    };

    beforeEach(() => {
      act(() => {
        wrapper = mount(<QueryBuilder {...props} />);
      });
    });

    afterEach(() => {
      wrapper.unmount();
    });

    it('should generate new ID in state when receiving new props (query) with missing IDs', () => {
      const initialID = wrapper.find(RuleGroup).props().id;

      expect(wrapper.props().query).to.be.undefined;
      expect(initialID).to.not.be.undefined;
      expect(initialID).to.be.a('string');

      wrapper.setProps({
        query: newQuery as RuleGroupType,
        fields: newFields
      });
      wrapper.update();

      expect(wrapper.props().query).to.not.be.null;
      expect(wrapper.props().query).to.be.an('object');
      expect(wrapper.props().query.id).to.be.undefined;

      expect(wrapper.find(RuleGroup).props().id).to.be.a('string');
      expect(wrapper.find(RuleGroup).props().rules[0].id).to.be.a('string');
    });
  });

  describe('when initial operators are provided', () => {
    let wrapper: ReactWrapper;
    const operators = [
      { name: 'null', label: 'Custom Is Null' },
      { name: 'notNull', label: 'Is Not Null' },
      { name: 'in', label: 'In' },
      { name: 'notIn', label: 'Not In' }
    ];

    const fields: Field[] = [
      { name: 'firstName', label: 'First Name' },
      { name: 'lastName', label: 'Last Name' },
      { name: 'age', label: 'Age' }
    ];

    const query = {
      combinator: 'and',
      not: false,
      id: '111',
      rules: [
        {
          id: '222',
          field: 'firstName',
          value: 'Test',
          operator: '='
        }
      ]
    };

    beforeEach(() => {
      wrapper = mount(
        <QueryBuilder {...props} operators={operators} fields={fields} query={query} />
      );
    });

    afterEach(() => {
      wrapper.unmount();
    });

    it('should use the given operators', () => {
      const operatorOptions = wrapper.find(Rule).find('.rule-operators option');
      expect(operatorOptions.length).to.equal(4);
    });

    it('should match the label of the first operator', () => {
      const operatorOption = wrapper.find(Rule).find('.rule-operators option').first();
      expect(operatorOption.text()).to.equal('Custom Is Null');
    });
  });

  describe('when getOperators fn prop is provided', () => {
    let wrapper: ReactWrapper, getOperators;

    const fields: Field[] = [
      { name: 'firstName', label: 'First Name' },
      { name: 'lastName', label: 'Last Name' },
      { name: 'age', label: 'Age' }
    ];

    const query = {
      id: 'g-012345',
      combinator: 'or',
      not: false,
      rules: [
        {
          id: 'r-0123456789',
          field: 'lastName',
          value: 'Another Test',
          operator: '='
        }
      ]
    };

    beforeEach(() => {
      getOperators = sinon.spy((fields, wada = 123) => {
        return [
          { name: 'custom-operator-1', label: 'Op. 1' },
          { name: 'custom-operator-2', label: 'Op. 2' },
          { name: 'custom-operator-3', label: 'Op. 3' }
        ];
      });
      wrapper = mount(
        <QueryBuilder {...props} query={query} fields={fields} getOperators={getOperators} />
      );
    });

    afterEach(() => {
      wrapper.unmount();
      getOperators.resetHistory();
    });

    it('should invoke custom getOperators function', () => {
      expect(getOperators.callCount).to.be.greaterThan(0);
    });

    it('should handle invalid getOperators function', () => {
      wrapper.unmount();
      wrapper = mount(
        <QueryBuilder {...props} query={query} fields={fields} getOperators={() => null} />
      );
      const operators = wrapper.find('.rule-operators option');
      expect(operators.first().props().value).to.equal('=');
    });
  });

  describe('when getValueEditorType fn prop is provided', () => {
    let wrapper: ReactWrapper, getValueEditorType;

    const fields: Field[] = [
      { name: 'firstName', label: 'First Name' },
      { name: 'lastName', label: 'Last Name' },
      { name: 'age', label: 'Age' }
    ];

    const query = {
      id: 'g-012345',
      combinator: 'or',
      not: false,
      rules: [
        {
          id: 'r-0123456789',
          field: 'lastName',
          value: 'Another Test',
          operator: '='
        }
      ]
    };

    beforeEach(() => {
      getValueEditorType = sinon.spy(() => 'text');
      wrapper = mount(
        <QueryBuilder
          {...props}
          query={query}
          fields={fields}
          getValueEditorType={getValueEditorType}
        />
      );
    });

    afterEach(() => {
      wrapper.unmount();
      getValueEditorType.resetHistory();
    });

    it('should invoke custom getValueEditorType function', () => {
      expect(getValueEditorType.callCount).to.be.greaterThan(0);
    });

    it('should handle invalid getValueEditorType function', () => {
      wrapper.unmount();
      wrapper = mount(
        <QueryBuilder {...props} query={query} fields={fields} getValueEditorType={() => null} />
      );
      const valueEditor = wrapper.find('.rule-value');
      expect(valueEditor.first().props().type).to.equal('text');
    });
  });

  describe('when getInputType fn prop is provided', () => {
    let wrapper: ReactWrapper, getInputType;

    const fields: Field[] = [
      { name: 'firstName', label: 'First Name' },
      { name: 'lastName', label: 'Last Name' },
      { name: 'age', label: 'Age' }
    ];

    const query = {
      id: 'g-012345',
      combinator: 'or',
      not: false,
      rules: [
        {
          id: 'r-0123456789',
          field: 'lastName',
          value: 'Another Test',
          operator: '='
        }
      ]
    };

    beforeEach(() => {
      getInputType = sinon.spy(() => 'text');
      wrapper = mount(
        <QueryBuilder {...props} query={query} fields={fields} getInputType={getInputType} />
      );
    });

    afterEach(() => {
      wrapper.unmount();
      getInputType.resetHistory();
    });

    it('should invoke custom getInputType function', () => {
      expect(getInputType.callCount).to.be.greaterThan(0);
    });

    it('should handle invalid getInputType function', () => {
      wrapper.unmount();
      wrapper = mount(
        <QueryBuilder {...props} query={query} fields={fields} getInputType={() => null} />
      );
      const valueEditor = wrapper.find('.rule-value');
      expect(valueEditor.first().props().type).to.equal('text');
    });
  });

  describe('when getValues fn prop is provided', () => {
    let wrapper: ReactWrapper, getValues;
    const getValueEditorType = (field: string, operator: string) => 'select' as 'select';

    const fields: Field[] = [
      { name: 'firstName', label: 'First Name' },
      { name: 'lastName', label: 'Last Name' },
      { name: 'age', label: 'Age' }
    ];

    const query = {
      id: 'g-012345',
      combinator: 'or',
      not: false,
      rules: [
        {
          id: 'r-0123456789',
          field: 'lastName',
          value: 'Another Test',
          operator: '='
        }
      ]
    };

    beforeEach(() => {
      getValues = sinon.spy(() => [{ name: 'test', label: 'Test' }]);
      wrapper = mount(
        <QueryBuilder
          {...props}
          query={query}
          fields={fields}
          getValueEditorType={getValueEditorType}
          getValues={getValues}
        />
      );
    });

    afterEach(() => {
      wrapper.unmount();
      getValues.resetHistory();
    });

    it('should invoke custom getValues function', () => {
      expect(getValues.callCount).to.be.greaterThan(0);
    });

    it('should generate the correct number of options', () => {
      const opts = wrapper.find('.rule-value option');
      expect(opts.length).to.equal(1);
    });

    it('should handle invalid getValues function', () => {
      wrapper.unmount();
      wrapper = mount(
        <QueryBuilder {...props} query={query} fields={fields} getValues={() => null} />
      );
      const select = wrapper.find('.rule-value');
      expect(select.length).to.be.greaterThan(0);
      const opts = wrapper.find('.rule-value option');
      expect(opts.length).to.equal(0);
    });
  });

  describe('actions', () => {
    let wrapper: ReactWrapper, onQueryChange;
    const fields: Field[] = [
      { name: 'field1', label: 'Field 1' },
      { name: 'field2', label: 'Field 2' }
    ];

    beforeEach(() => {
      onQueryChange = sinon.spy();
      wrapper = mount(<QueryBuilder fields={fields} onQueryChange={onQueryChange} />);
    });

    afterEach(() => {
      wrapper.unmount();
      onQueryChange.resetHistory();
    });

    it('should create a new rule and remove that rule', () => {
      wrapper.find('.ruleGroup-addRule').first().simulate('click');

      expect(wrapper.find(Rule).length).to.equal(1);
      expect(onQueryChange.getCall(0).args[0].rules).to.have.length(0);
      expect(onQueryChange.getCall(1).args[0].rules).to.have.length(1);

      wrapper.find('.rule-remove').first().simulate('click');

      expect(wrapper.find(Rule).length).to.equal(0);
      expect(onQueryChange.getCall(2).args[0].rules).to.have.length(0);
    });

    it('should create a new group and remove that group', () => {
      wrapper.find('.ruleGroup-addGroup').first().simulate('click');

      expect(wrapper.find(RuleGroup).length).to.equal(2);
      expect(onQueryChange.getCall(0).args[0].rules).to.have.length(0);
      expect(onQueryChange.getCall(1).args[0].rules).to.have.length(1);
      expect(onQueryChange.getCall(1).args[0].rules[0].combinator).to.not.be.undefined;

      wrapper.find('.ruleGroup-remove').first().simulate('click');

      expect(wrapper.find(RuleGroup).length).to.equal(1);
      expect(onQueryChange.getCall(2).args[0].rules).to.have.length(0);
    });

    it('should create a new rule and change the fields', () => {
      wrapper.find('.ruleGroup-addRule').first().simulate('click');

      expect(wrapper.find(Rule).length).to.equal(1);
      expect(onQueryChange.getCall(0).args[0].rules).to.have.length(0);
      expect(onQueryChange.getCall(1).args[0].rules).to.have.length(1);

      wrapper
        .find('.rule-fields')
        .first()
        .simulate('change', { target: { value: 'field2' } });

      expect(onQueryChange.getCall(2).args[0].rules[0].field).to.equal('field2');
    });

    it('should create a new rule and change the operator', () => {
      wrapper.find('.ruleGroup-addRule').first().simulate('click');

      expect(wrapper.find(Rule).length).to.equal(1);
      expect(onQueryChange.getCall(0).args[0].rules).to.have.length(0);
      expect(onQueryChange.getCall(1).args[0].rules).to.have.length(1);

      wrapper
        .find('.rule-operators')
        .first()
        .simulate('change', { target: { value: '!=' } });

      expect(onQueryChange.getCall(2).args[0].rules[0].operator).to.equal('!=');
    });

    it('should set default value for a rule', () => {
      wrapper.setProps({
        fields,
        onQueryChange,
        getValues: (field) => {
          if (field === 'field1') {
            return [
              { name: 'value1', label: 'Value 1' },
              { name: 'value2', label: 'Value 2' }
            ];
          }

          return [];
        },
        getValueEditorType: (field) => {
          if (field === 'field2') return 'checkbox';

          return 'text';
        }
      });

      wrapper.find('.ruleGroup-addRule').first().simulate('click');

      expect(onQueryChange.getCall(1).args[0].rules).to.have.length(1);
      expect(onQueryChange.getCall(1).args[0].rules[0].value).to.equal('value1');

      wrapper
        .find('.rule-fields')
        .first()
        .simulate('change', { target: { value: 'field2' } });

      expect(onQueryChange.getCall(2).args[0].rules[0].field).to.equal('field2');
      expect(onQueryChange.getCall(2).args[0].rules[0].value).to.equal(false);

      wrapper.setProps({
        fields: fields.slice(1),
        onQueryChange,
        getValueEditorType: (field) => {
          if (field === 'field2') return 'checkbox';

          return 'text';
        }
      });

      wrapper.find('.ruleGroup-addRule').first().simulate('click');

      expect(onQueryChange.getCall(3).args[0].rules).to.have.length(2);
      expect(onQueryChange.getCall(3).args[0].rules[0].value).to.equal(false);
    });
  });

  describe('resetOnFieldChange prop', () => {
    let wrapper: ReactWrapper, onQueryChange;
    const fields: Field[] = [
      { name: 'field1', label: 'Field 1' },
      { name: 'field2', label: 'Field 2' }
    ];

    beforeEach(() => {
      onQueryChange = sinon.spy();
      wrapper = mount(<QueryBuilder fields={fields} onQueryChange={onQueryChange} />);
    });

    afterEach(() => {
      wrapper.unmount();
      onQueryChange.resetHistory();
    });

    it('resets the operator and value when true', () => {
      wrapper.find('.ruleGroup-addRule').first().simulate('click');
      wrapper
        .find('.rule-operators')
        .first()
        .simulate('change', { target: { value: '>' } });
      wrapper
        .find('.rule-value')
        .first()
        .simulate('change', { target: { value: 'Test' } });
      wrapper
        .find('.rule-fields')
        .first()
        .simulate('change', { target: { value: 'field2' } });

      expect(onQueryChange.getCall(3).args[0].rules[0].operator).to.equal('>');
      expect(onQueryChange.getCall(3).args[0].rules[0].value).to.equal('Test');
      expect(onQueryChange.getCall(4).args[0].rules[0].operator).to.equal('=');
      expect(onQueryChange.getCall(4).args[0].rules[0].value).to.equal('');
    });

    it('does not reset the operator and value when false', () => {
      wrapper.setProps({ resetOnFieldChange: false });
      wrapper.find('.ruleGroup-addRule').first().simulate('click');
      wrapper
        .find('.rule-operators')
        .first()
        .simulate('change', { target: { value: '>' } });
      wrapper
        .find('.rule-value')
        .first()
        .simulate('change', { target: { value: 'Test' } });
      wrapper
        .find('.rule-fields')
        .first()
        .simulate('change', { target: { value: 'field2' } });

      expect(onQueryChange.getCall(3).args[0].rules[0].operator).to.equal('>');
      expect(onQueryChange.getCall(3).args[0].rules[0].value).to.equal('Test');
      expect(onQueryChange.getCall(4).args[0].rules[0].operator).to.equal('>');
      expect(onQueryChange.getCall(4).args[0].rules[0].value).to.equal('Test');
    });
  });

  describe('resetOnOperatorChange prop', () => {
    let wrapper: ReactWrapper, onQueryChange;
    const fields: Field[] = [
      { name: 'field1', label: 'Field 1' },
      { name: 'field2', label: 'Field 2' }
    ];

    beforeEach(() => {
      onQueryChange = sinon.spy();
      wrapper = mount(<QueryBuilder fields={fields} onQueryChange={onQueryChange} />);
    });

    afterEach(() => {
      wrapper.unmount();
      onQueryChange.resetHistory();
    });

    it('resets the value when true', () => {
      wrapper.setProps({ resetOnOperatorChange: true });
      wrapper.find('.ruleGroup-addRule').first().simulate('click');
      wrapper
        .find('.rule-operators')
        .first()
        .simulate('change', { target: { value: '>' } });
      wrapper
        .find('.rule-value')
        .first()
        .simulate('change', { target: { value: 'Test' } });
      wrapper
        .find('.rule-operators')
        .first()
        .simulate('change', { target: { value: '=' } });

      expect(onQueryChange.getCall(3).args[0].rules[0].operator).to.equal('>');
      expect(onQueryChange.getCall(3).args[0].rules[0].value).to.equal('Test');
      expect(onQueryChange.getCall(4).args[0].rules[0].operator).to.equal('=');
      expect(onQueryChange.getCall(4).args[0].rules[0].value).to.equal('');
    });

    it('does not reset the value when false', () => {
      wrapper.setProps({ resetOnOperatorChange: false });
      wrapper.find('.ruleGroup-addRule').first().simulate('click');
      wrapper
        .find('.rule-operators')
        .first()
        .simulate('change', { target: { value: '>' } });
      wrapper
        .find('.rule-value')
        .first()
        .simulate('change', { target: { value: 'Test' } });
      wrapper
        .find('.rule-operators')
        .first()
        .simulate('change', { target: { value: '=' } });

      expect(onQueryChange.getCall(3).args[0].rules[0].operator).to.equal('>');
      expect(onQueryChange.getCall(3).args[0].rules[0].value).to.equal('Test');
      expect(onQueryChange.getCall(4).args[0].rules[0].operator).to.equal('=');
      expect(onQueryChange.getCall(4).args[0].rules[0].value).to.equal('Test');
    });
  });

  describe('getDefaultField prop', () => {
    let wrapper: ReactWrapper, onQueryChange;
    const fields: Field[] = [
      { name: 'field1', label: 'Field 1' },
      { name: 'field2', label: 'Field 2' }
    ];

    beforeEach(() => {
      onQueryChange = sinon.spy();
      wrapper = mount(<QueryBuilder fields={fields} onQueryChange={onQueryChange} />);
    });

    afterEach(() => {
      wrapper.unmount();
      onQueryChange.resetHistory();
    });

    it('sets the default field as a string', () => {
      wrapper.setProps({ getDefaultField: 'field2' });
      wrapper.find('.ruleGroup-addRule').first().simulate('click');

      expect(onQueryChange.getCall(1).args[0].rules[0].field).to.equal('field2');
    });

    it('sets the default field as a function', () => {
      wrapper.setProps({ getDefaultField: () => 'field2' });
      wrapper.find('.ruleGroup-addRule').first().simulate('click');

      expect(onQueryChange.getCall(1).args[0].rules[0].field).to.equal('field2');
    });
  });

  describe('getDefaultValue prop', () => {
    let wrapper: ReactWrapper, onQueryChange;
    const fields: Field[] = [
      { name: 'field1', label: 'Field 1' },
      { name: 'field2', label: 'Field 2' }
    ];

    beforeEach(() => {
      onQueryChange = sinon.spy();
      wrapper = mount(<QueryBuilder fields={fields} onQueryChange={onQueryChange} />);
    });

    afterEach(() => {
      wrapper.unmount();
      onQueryChange.resetHistory();
    });

    it('sets the default value', () => {
      wrapper.setProps({ getDefaultValue: () => 'Test Value' });
      wrapper.find('.ruleGroup-addRule').first().simulate('click');

      expect(onQueryChange.getCall(1).args[0].rules[0].value).to.equal('Test Value');
    });
  });

  describe('defaultValue property in field', () => {
    let wrapper: ReactWrapper, onQueryChange;
    const fields: Field[] = [
      { name: 'field1', label: 'Field 1', defaultValue: 'Test Value 1' },
      { name: 'field2', label: 'Field 2', defaultValue: 'Test Value 2' }
    ];

    beforeEach(() => {
      onQueryChange = sinon.spy();
      wrapper = mount(<QueryBuilder fields={fields} onQueryChange={onQueryChange} />);
    });

    afterEach(() => {
      wrapper.unmount();
      onQueryChange.resetHistory();
    });

    it('sets the default value', () => {
      wrapper.find('.ruleGroup-addRule').first().simulate('click');

      expect(onQueryChange.getCall(1).args[0].rules[0].value).to.equal('Test Value 1');
    });
  });

  describe('values property in field', () => {
    let wrapper: ReactWrapper, onQueryChange;
    const fields: Field[] = [
      {
        name: 'field1',
        label: 'Field 1',
        defaultValue: 'test',
        values: [{ name: 'test', label: 'Test' }]
      },
      {
        name: 'field2',
        label: 'Field 2',
        defaultValue: 'test',
        values: [{ name: 'test', label: 'Test' }]
      }
    ];

    beforeEach(() => {
      onQueryChange = sinon.spy();
      wrapper = mount(<QueryBuilder fields={fields} onQueryChange={onQueryChange} />);
    });

    afterEach(() => {
      wrapper.unmount();
      onQueryChange.resetHistory();
    });

    it('sets the values list', () => {
      wrapper.setProps({ getValueEditorType: () => 'select' });
      wrapper.find('.ruleGroup-addRule').first().simulate('click');

      expect(wrapper.find('select.rule-value')).to.have.length(1);
    });
  });

  describe('inputType property in field', () => {
    let wrapper: ReactWrapper, onQueryChange;
    const fields: Field[] = [
      { name: 'field1', label: 'Field 1', inputType: 'number' },
      { name: 'field2', label: 'Field 2', inputType: 'date' }
    ];

    beforeEach(() => {
      onQueryChange = sinon.spy();
      wrapper = mount(<QueryBuilder fields={fields} onQueryChange={onQueryChange} />);
    });

    afterEach(() => {
      wrapper.unmount();
      onQueryChange.resetHistory();
    });

    it('sets the input type', () => {
      wrapper.find('.ruleGroup-addRule').first().simulate('click');

      expect(wrapper.find('input[type="number"].rule-value')).to.have.length(1);
    });
  });

  describe('valueEditorType property in field', () => {
    let wrapper: ReactWrapper, onQueryChange;
    const fields: Field[] = [
      { name: 'field1', label: 'Field 1', valueEditorType: 'select' },
      { name: 'field2', label: 'Field 2', valueEditorType: null }
    ];

    beforeEach(() => {
      onQueryChange = sinon.spy();
      wrapper = mount(<QueryBuilder fields={fields} onQueryChange={onQueryChange} />);
    });

    afterEach(() => {
      wrapper.unmount();
      onQueryChange.resetHistory();
    });

    it('sets the value editor type', () => {
      wrapper.find('.ruleGroup-addRule').first().simulate('click');

      expect(wrapper.find('select.rule-value')).to.have.length(1);
    });
  });

  describe('operators property in field', () => {
    let wrapper: ReactWrapper, onQueryChange;
    const fields: Field[] = [
      { name: 'field1', label: 'Field 1', operators: [{ name: '=', label: '=' }] },
      { name: 'field2', label: 'Field 2', operators: [{ name: '=', label: '=' }] }
    ];

    beforeEach(() => {
      onQueryChange = sinon.spy();
      wrapper = mount(<QueryBuilder fields={fields} onQueryChange={onQueryChange} />);
    });

    afterEach(() => {
      wrapper.unmount();
      onQueryChange.resetHistory();
    });

    it('sets the value editor type', () => {
      wrapper.find('.ruleGroup-addRule').first().simulate('click');

      expect(wrapper.find('select.rule-operators')).to.have.length(1);
      expect(wrapper.find('select.rule-operators option')).to.have.length(1);
    });
  });
});
