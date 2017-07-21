import React from 'react';
import ReactDOM from 'react-dom';
import {shallow, mount} from 'enzyme';

import QueryBuilder from './QueryBuilder';

describe('<QueryBuilder />', () => {

    it('should exist', () => {
        expect(QueryBuilder).to.exist;
    });

    describe('when rendered', () => {
        it('should render the root RuleGroup', () => {
            const dom = shallow(<QueryBuilder />);
            expect(dom.find('RuleGroup')).to.have.length(1);
        });

        it('should show the list of combinators in the RuleGroup', () => {
            const dom = mount(<QueryBuilder />);
            const options = dom.find('select option');
            expect(options).to.have.length(2); // and, or
        });

    });

    describe('when initial query is provided', () => {
        let dom;

        beforeEach(() => {
            const fields = [
                {name: 'firstName', label: 'First Name'},
                {name: 'lastName', label: 'Last Name'},
                {name: 'age', label: 'Age'},
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

            dom = mount(<QueryBuilder query={query} fields={fields}/>);
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

        it('should have an field selector with the correct field', () => {
            const rule = dom.find('Rule');

            expect(rule.find('.rule-fields').props().value).to.equal('firstName');
        });

        it('should have an operator selector with the correct operator', () => {
            const rule = dom.find('Rule');

            expect(rule.find('.rule-operators').props().value).to.equal('=');
        });

        it('should have an input control with the correct value', () => {
            const rule = dom.find('Rule');

            expect(rule.find('input').props().value).to.equal('Test');
        });

    });

    describe('when query prop is updated', () => {
        let component, node;
        let query = {
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
        const fields = [
            {name: 'firstName', label: 'First Name'},
        ];

        beforeEach(() => {
            node = document.createElement('div');
            component = ReactDOM.render(<QueryBuilder query={query} fields={fields}/>, node);
        });

        it('should update state with correct value', (done) => {
            expect(component.state.root.combinator).to.equal('and');

            var newQuery = JSON.parse(JSON.stringify(query))
            newQuery.combinator = 'or'
            // Rendering to the same node will call componentWillReceiveProps
            ReactDOM.render(<QueryBuilder query={newQuery} fields={fields}/>, node);
            function waitForState() {
                if(component.state.root.combinator === 'or'){
                    expect(component.state.root.combinator).to.equal('or');
                    done()
                }
                else{
                    setTimeout(waitForState, 300)
                }
            }
            waitForState()
        });

    });
    describe('when initial operators are provided', () => {

        let dom;
        beforeEach(() => {
            const operators = [
                {name: 'null', label: 'Custom Is Null'},
                {name: 'notNull', label: 'Is Not Null'},
                {name: 'in', label: 'In'},
                {name: 'notIn', label: 'Not In'},
            ];

            const fields = [
                {name: 'firstName', label: 'First Name'},
                {name: 'lastName', label: 'Last Name'},
                {name: 'age', label: 'Age'},
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
                                      query={query}/>);
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
        
    describe('when calculating the level of a rule', function() {
         let dom;
         beforeEach(() => {
            const fields = [
                {name: 'firstName', label: 'First Name'},
                {name: 'lastName', label: 'Last Name'},
                {name: 'age', label: 'Age'},
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

            dom = mount(<QueryBuilder query={query} fields={fields}/>);
        });
        
        it('should be 0 for the top level', function() {
            expect(dom.state('schema').getLevel('111')).to.equal(0);
            expect(dom.state('schema').getLevel('222')).to.equal(0);
            expect(dom.state('schema').getLevel('333')).to.equal(0);
        });        
        
        it('should be 1 for the second level', function() {
            expect(dom.state('schema').getLevel('444')).to.equal(1);
            expect(dom.state('schema').getLevel('555')).to.equal(1);
        });
             
        it('should handle an invalid id', function() {
            expect(dom.state('schema').getLevel('546')).to.equal(-1);
        });
    });
});
