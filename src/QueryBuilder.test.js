import { mount } from 'enzyme';
import React from 'react';
import { act } from 'react-dom/test-utils';
import QueryBuilder from './QueryBuilder';
const sinon = require('sinon');

describe('<QueryBuilder />', () => {
  it('should exist', () => {
    expect(QueryBuilder).to.exist;
  });

  describe('when rendered', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = mount(<QueryBuilder />);
    });

    afterEach(() => {
      wrapper.unmount();
    });

    it('should render the root RuleGroup', () => {
      expect(wrapper.find('RuleGroup')).to.have.length(1);
    });

    it('should show the list of combinators in the RuleGroup', () => {
      const options = wrapper.find('select option');
      expect(options).to.have.length(2); // and, or
    });
  });

  describe('when rendered with queryChange callback', () => {
    let wrapper, queryChange;

    beforeEach(() => {
      queryChange = sinon.spy();
      act(() => {
        wrapper = mount(<QueryBuilder onQueryChange={queryChange} />);
      });
    });

    afterEach(() => {
      wrapper.unmount();
      queryChange.resetHistory();
    });

    it('should call onQueryChange with query', () => {
      // Spy is called initially when mounting component (once)
      expect(queryChange.calledOnce).to.equal(true);
      const initialID = wrapper.find('RuleGroup').props().id;
      const query = { id: initialID, combinator: 'and', rules: [] };
      expect(queryChange.calledWith(query)).to.equal(true);
    });
  });

  describe('when initial query, without ID, is provided', () => {
    let wrapper;
    const queryWithoutID = {
      combinator: 'and',
      rules: [
        {
          field: 'firstName',
          value: 'Test without ID',
          operator: '='
        }
      ]
    };

    const fields = [
      { name: 'firstName', label: 'First Name' },
      { name: 'lastName', label: 'Last Name' },
      { name: 'age', label: 'Age' }
    ];

    beforeEach(() => {
      act(() => {
        wrapper = mount(<QueryBuilder query={queryWithoutID} fields={fields} />);
      });
    });

    afterEach(() => {
      wrapper.unmount();
    });

    it('should contain a <Rule />', () => {
      const rule = wrapper.find('Rule');
      expect(rule).to.have.length(1);
    });

    it('should have the Rule with the correct props', () => {
      const rule = wrapper.find('Rule');
      expect(rule.props().field).to.equal('firstName');
      expect(rule.props().value).to.equal('Test without ID');
      expect(rule.props().operator).to.equal('=');
    });

    it('should have a select control with the provided fields', () => {
      const rule = wrapper.find('Rule');
      expect(rule.find('.rule-fields option')).to.have.length(3);
    });

    it('should have a field selector with the correct field', () => {
      const rule = wrapper.find('Rule');
      expect(rule.find('.rule-fields select').props().value).to.equal('firstName');
    });

    it('should have an operator selector with the correct operator', () => {
      const rule = wrapper.find('Rule');
      expect(rule.find('.rule-operators select').props().value).to.equal('=');
    });

    it('should have an input control with the correct value', () => {
      const rule = wrapper.find('Rule');
      expect(rule.find('input').props().value).to.equal('Test without ID');
    });
  });

  describe('when receiving new props', () => {
    let wrapper;
    const newFields = [
      { name: 'domainName', label: 'Domain Name' },
      { name: 'ownerName', label: 'Owner Name' }
    ];

    const newQuery = {
      combinator: 'and',
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
        wrapper = mount(<QueryBuilder />);
      });
    });

    afterEach(() => {
      wrapper.unmount();
    });

    it('should generate new ID in state when receiving new props (query) with missing IDs', () => {
      const initialID = wrapper.find('RuleGroup').props().id;

      expect(wrapper.props().query).to.be.null;
      expect(initialID).to.not.be.undefined;
      expect(initialID).to.be.a('string');

      wrapper.setProps({
        query: newQuery,
        fields: newFields
      });
      wrapper.update();

      expect(wrapper.props().query).to.not.be.null;
      expect(wrapper.props().query).to.be.an('object');
      expect(wrapper.props().query.id).to.be.undefined;

      expect(wrapper.find('RuleGroup').props().id).to.be.a('string');
      expect(wrapper.find('RuleGroup').props().rules[0].id).to.be.a('string');
    });
  });

  describe('when initial operators are provided', () => {
    let wrapper;
    const operators = [
      { name: 'null', label: 'Custom Is Null' },
      { name: 'notNull', label: 'Is Not Null' },
      { name: 'in', label: 'In' },
      { name: 'notIn', label: 'Not In' }
    ];

    const fields = [
      { name: 'firstName', label: 'First Name' },
      { name: 'lastName', label: 'Last Name' },
      { name: 'age', label: 'Age' }
    ];

    const query = {
      combinator: 'and',
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
      wrapper = mount(<QueryBuilder operators={operators} fields={fields} query={query} />);
    });

    afterEach(() => {
      wrapper.unmount();
    });

    it('should use the given operators', () => {
      const operatorOptions = wrapper.find('Rule').find('.rule-operators option');
      expect(operatorOptions.length).to.equal(4);
    });

    it('should match the label of the first operator', () => {
      const operatorOption = wrapper
        .find('Rule')
        .find('.rule-operators option')
        .first();
      expect(operatorOption.text()).to.equal('Custom Is Null');
    });
  });

  describe('when getOperators fn prop is provided', () => {
    let wrapper, getOperators;

    const fields = [
      { name: 'firstName', label: 'First Name' },
      { name: 'lastName', label: 'Last Name' },
      { name: 'age', label: 'Age' }
    ];

    const query = {
      id: 'g-012345',
      combinator: 'or',
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
      wrapper = mount(<QueryBuilder query={query} fields={fields} getOperators={getOperators} />);
    });

    afterEach(() => {
      getOperators.resetHistory();
      wrapper.unmount();
    });

    it('should invoke custom getOperators function', () => {
      expect(getOperators.callCount).to.be.greaterThan(0); // 1 Rule in query
    });
  });
});
