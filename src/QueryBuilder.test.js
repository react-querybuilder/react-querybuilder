import React from 'react';
import { shallow, mount } from 'enzyme';
var sinon = require('sinon')
import QueryBuilder from './QueryBuilder';

describe('<QueryBuilder />', () => {

    it('should exist', () => {
        expect(QueryBuilder).to.exist;
    });

    describe('when rendered', () => {
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
        it('calls componentWillMount', () => {
            sinon.spy(QueryBuilder.prototype, 'componentWillMount');
            const dom = mount(<QueryBuilder />);
            expect(QueryBuilder.prototype.componentWillMount.calledOnce).to.equal(true);
            dom.unmount();
        });
        it('calls componentDidMount', () => {
            sinon.spy(QueryBuilder.prototype, 'componentDidMount');
            const dom = mount(<QueryBuilder />);
            expect(QueryBuilder.prototype.componentDidMount.calledOnce).to.equal(true);
        
        });
        it('should render the root RuleGroup', () => {
            const dom = shallow(<QueryBuilder />);
            expect(dom.find('RuleGroup')).to.have.length(1);
        });

        it('should show the list of combinators in the RuleGroup', () => {
            const dom = mount(<QueryBuilder />);
            const options = dom.find('select option');
            expect(options).to.have.length(2); // and, or
        });
        it('should call  onQueryChange',()=>{
            
            const dom = mount(<QueryBuilder onQueryChange={()=>{return query}} />);
            dom.instance()._notifyQueryChange(()=>{});
            dom.update();
            expect(dom.props().query).to.equal(null);
        });

    });

    

    describe('when initial query is provided', () => {
        let dom;
        
        beforeEach(() => {
            const fields = [
                { name: 'firstName', label: 'First Name' },
                { name: 'lastName', label: 'Last Name' },
                { name: 'age', label: 'Age' },
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

            dom = mount(<QueryBuilder query={query} fields={fields} />);
            
        });

        afterEach(() => {
            if (dom) {
                dom.unmount();
            }
        });

        it('should contain a <Rule />', () => {

            const rule = dom.find('Rule');
            expect(rule).to.have.length(1);
        });

        it('should have the Rule with the correct props', () => {
            const rule = dom.find('Rule');

            expect(rule.props().field).to.equal('firstName');
            expect(rule.props().value).to.equal('Test');
            expect(rule.props().operator).to.equal('=');
        });

        it('should have a select control with the provided fields', () => {
            const rule = dom.find('Rule');

            expect(rule.find('.rule-fields option')).to.have.length(3);
        });

        it('should have a field selector with the correct field', () => {
            const rule = dom.find('Rule');

            expect(rule.find('.rule-fields select').props().value).to.equal('firstName');
        });

        it('should have an operator selector with the correct operator', () => {
            const rule = dom.find('Rule');

            expect(rule.find('.rule-operators select').props().value).to.equal('=');
        });

        it('should have an input control with the correct value', () => {
            const rule = dom.find('Rule');

            expect(rule.find('input').props().value).to.equal('Test');
        });

       
});
    describe('when new props are passed',()=>{ 
        it('calls componentWillRecieveProps', () => {

            const newFields = [
                { name: 'domainName', label: 'Domain Name' },
                { name: 'ownerName', label: 'Owner Name' },
               
            ];

            const newQuery = {
                combinator: 'and',
                id: '111',
                rules: [
                    {
                        id: '222',
                        field: 'domainName',
                        value: 'www.example.com',
                        operator: '!='
                    }
                ]
            };
            //First mount with props
            sinon.spy(QueryBuilder.prototype, 'componentWillReceiveProps');
            const dom = mount(<QueryBuilder />);
           
            expect(QueryBuilder.prototype.componentWillReceiveProps.calledOnce).to.equal(false);
         
            //componentWillRecieveProps
            dom.setProps({
                query: newQuery,
                fields: newFields
            });
            expect(QueryBuilder.prototype.componentWillReceiveProps.calledOnce).to.equal(true);
            expect(dom.props().query).to.equal(newQuery);
            const rule = dom.find('Rule');
            expect(dom.find('RuleGroup')).to.have.length(1);
            expect(rule.find('input').props().value).to.equal('www.example.com');
        });
        
    });  
   
    describe('when initial operators are provided', () => {

        let dom;
        beforeEach(() => {
            const operators = [
                { name: 'null', label: 'Custom Is Null' },
                { name: 'notNull', label: 'Is Not Null' },
                { name: 'in', label: 'In' },
                { name: 'notIn', label: 'Not In' },
            ];

            const fields = [
                { name: 'firstName', label: 'First Name' },
                { name: 'lastName', label: 'Last Name' },
                { name: 'age', label: 'Age' },
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

            dom = mount(<QueryBuilder operators={operators}
                                      fields={fields}
                                      query={query} />);
        });
        it('should get operators for field', () => {
            let operators = dom.state('schema').getOperators('firstName');
            //console.log('OPS',operators);
            expect(operators.length).to.equal(4);
        });
        it('should use the given operators', () => {
            const operatorOptions = dom.find('Rule').find('.rule-operators option');

            expect(operatorOptions.length).to.equal(4);
        });

        it('should match the label of the first operator', () => {
            const operatorOption = dom.find('Rule').find('.rule-operators option').first();

            expect(operatorOption.text()).to.equal('Custom Is Null');
        });
    }); 
   
   
    describe('when calculating the level of a rule', function () {
        let dom;
        beforeEach(() => {
            const fields = [
                { name: 'firstName', label: 'First Name' },
                { name: 'lastName', label: 'Last Name' },
                { name: 'age', label: 'Age' },
            ];
            const query = {
                combinator: 'and',
                id: '111',
                rules: [{
                    id: '222',
                    field: 'firstName',
                    value: 'Test',
                    operator: '='
                }, {
                    id: '333',
                    field: 'firstName',
                    value: 'Test',
                    operator: '='
                }, {
                    combinator: 'and',
                    id: '444',
                    rules: [{
                        id: '555',
                        field: 'firstName',
                        value: 'Test',
                        operator: '='
                    }]
                }]
            };

            dom = mount(<QueryBuilder query={query} fields={fields} />);
        });

        it('should be 0 for the top level', function () {
            expect(dom.state('schema').getLevel('111')).to.equal(0);
            expect(dom.state('schema').getLevel('222')).to.equal(0);
            expect(dom.state('schema').getLevel('333')).to.equal(0);
        });

        it('should be 1 for the second level', function () {
            expect(dom.state('schema').getLevel('444')).to.equal(1);
            expect(dom.state('schema').getLevel('555')).to.equal(1);
        });

        it('should handle an invalid id', function () {
            expect(dom.state('schema').getLevel('546')).to.equal(-1);
        });
    });
});
