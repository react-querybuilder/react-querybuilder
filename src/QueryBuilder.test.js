import React from 'react';
import { shallow, mount } from 'enzyme';
import QueryBuilder from './QueryBuilder';
var sinon = require('sinon');

describe('<QueryBuilder />', () => {
  it('should exist', () => {
    expect(QueryBuilder).to.exist;
  });

  describe('when rendered', () => {
    let wrapper, cmpWillMount, cmpDidMount;

    beforeEach(() => {
      cmpWillMount = sinon.spy(QueryBuilder.prototype, 'componentWillMount');
      cmpDidMount = sinon.spy(QueryBuilder.prototype, 'componentDidMount');
      wrapper = mount(<QueryBuilder />);
    });

    afterEach(() => {
      cmpWillMount.restore();
      cmpDidMount.restore();
      wrapper.unmount();
    });

    it('calls componentWillMount', () => {
      expect(cmpWillMount.calledOnce).to.equal(true);
    });

    it('calls componentDidMount', () => {
      expect(cmpDidMount.calledOnce).to.equal(true);
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
      wrapper = mount(<QueryBuilder onQueryChange={queryChange} />);
    });

    afterEach(() => {
      queryChange.resetHistory();
      wrapper.unmount();
    });

    it('should call onQueryChange', () => {
      wrapper.instance()._notifyQueryChange(() => {});
      wrapper.update();
      expect(wrapper.props().query).to.equal(null);
    });

    it('should call onQueryChange with query', () => {
      // Spy is called initially when mounting component (once)
      expect(queryChange.calledOnce).to.equal(true);

      const query = wrapper.state().root;
      wrapper.instance()._notifyQueryChange(() => {});
      wrapper.update();

      expect(queryChange.callCount).to.equal(2);
      expect(queryChange.calledWith(query)).to.equal(true);
    });
  });

  describe('when initial query, with ID, is provided', () => {
    const queryWithID = {
      id: 'g-12345',
      combinator: 'and',
      rules: [
        {
          id: 'r-12345',
          field: 'firstName',
          value: 'Test',
          operator: '='
        }
      ]
    };

    it('should not generate new ID if query provides ID', () => {
      const validQuery = QueryBuilder.prototype.generateValidQuery(queryWithID);
      expect(validQuery.id).to.equal('g-12345');
      expect(validQuery.rules[0].id).to.equal('r-12345');
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
      wrapper = mount(<QueryBuilder query={queryWithoutID} fields={fields} />);
    });

    afterEach(() => {
      wrapper.unmount();
    });

    it('should generate IDs if missing in query', () => {
      expect(queryWithoutID).to.not.haveOwnProperty('id');
      const validQuery = QueryBuilder.prototype.generateValidQuery(queryWithoutID);
      expect(validQuery).haveOwnProperty('id');
      expect(validQuery.rules[0]).haveOwnProperty('id');
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
    let wrapper, cmpWillReceiveProps;
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
      cmpWillReceiveProps = sinon.spy(QueryBuilder.prototype, 'componentWillReceiveProps');
      wrapper = mount(<QueryBuilder />);
    });

    afterEach(() => {
      QueryBuilder.prototype.componentWillReceiveProps.restore();
      wrapper.unmount();
    });

    it('calls componentWillRecieveProps', () => {
      expect(cmpWillReceiveProps.called).to.equal(false);

      wrapper.setProps({
        query: newQuery,
        fields: newFields
      });

      expect(cmpWillReceiveProps.calledOnce).to.equal(true);
      expect(wrapper.props().query).to.equal(newQuery);
      expect(wrapper.find('RuleGroup')).to.have.length(1);

      const rule = wrapper.find('Rule');
      expect(rule.find('input').props().value).to.equal('www.example.com');
    });

    it('should generate new ID in state when receiving new props (query) with missing IDs', () => {
      const initialID = wrapper.state().root.id;

      expect(wrapper.props().query).to.be.null;
      expect(initialID).to.not.be.undefined;
      expect(initialID).to.be.a('string');

      wrapper.setProps({
        query: newQuery,
        fields: newFields
      });

      expect(wrapper.props().query).to.not.be.null;
      expect(wrapper.props().query).to.be.an('object');
      expect(wrapper.props().query.id).to.be.undefined;

      expect(wrapper.state().root.id).to.be.a('string');
      expect(wrapper.state().root.rules[0].id).to.be.a('string');
    });

    it('should keep same state if same props are passed (root/fields)', () => {
      const wrp = mount(<QueryBuilder query={newQuery} fields={newFields} />);
      const stateQuery1 = wrp.state().root;
      const stateFields1 = wrp.state().schema.fields;

      wrp.setProps({
        query: newQuery,
        fields: newFields
      });

      expect(wrp.state().root).to.equal(stateQuery1);
      expect(wrp.state().schema.fields).to.equal(stateFields1);
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

    it('should get operators for field', () => {
      let operators = wrapper.state('schema').getOperators('firstName');
      expect(operators.length).to.equal(4);
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
      getOperators = sinon.spy((fields, wada=123) => {
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
      expect(getOperators.callCount).to.equal(1); // 1 Rule in query
      wrapper.instance().getOperators();
      expect(getOperators.callCount).to.equal(2);
    });
  });

  describe('when calculating the level of a rule', function() {
    let wrapper;

    beforeEach(() => {
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
          },
          {
            id: '333',
            field: 'firstName',
            value: 'Test',
            operator: '='
          },
          {
            combinator: 'and',
            id: '444',
            rules: [
              {
                id: '555',
                field: 'firstName',
                value: 'Test',
                operator: '='
              }
            ]
          }
        ]
      };

      wrapper = mount(<QueryBuilder query={query} fields={fields} />);
    });

    afterEach(() => {
      wrapper.unmount();
    });

    it('should be 0 for the top level', function() {
      expect(wrapper.state('schema').getLevel('111')).to.equal(0);
      expect(wrapper.state('schema').getLevel('222')).to.equal(0);
      expect(wrapper.state('schema').getLevel('333')).to.equal(0);
    });

    it('should be 1 for the second level', function() {
      expect(wrapper.state('schema').getLevel('444')).to.equal(1);
      expect(wrapper.state('schema').getLevel('555')).to.equal(1);
    });

    it('should handle an invalid id', function() {
      expect(wrapper.state('schema').getLevel('546')).to.equal(-1);
    });
  });
});
