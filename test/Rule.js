import React from 'react';
import { shallow, mount } from 'enzyme';

import Rule from '../lib/Rule';
import { ActionElement, ValueSelector, ValueEditor } from '../lib/controls/index';

describe('<Rule />', ()=> {
    let controls;
    let classNames;
    let schema;
    let props;
    beforeEach(()=>{
        //set defaults
        controls = {
            fieldSelector: React.Component,
            operatorSelector: React.Component,
            valueEditor: React.Component,
            removeRuleAction: React.Component
        }
        classNames = {
            fields: 'custom-fields-class',
            operators: 'custom-operators-class',
            removeRule: 'custom-removeRule-class'
        }
        schema = {
            fields: [],
            controls: controls,
            getOperators: (field)=>{return []},
            classNames: classNames
        }
        props = {
            key: 'key',
            id: 'id',
            field: 'field',
            value: 'value',
            operator: 'operator',
            schema: schema,
            parentId: 'parentId',
            onRuleRemove: (ruleId, parentId)=>{}
        }
    });

    it('should exist', ()=> {
        expect(Rule).to.exist;
    });

    it('should have a className of "rule"', ()=> {
        const dom = shallow(<Rule {...props} />);

        expect(dom.find('div').hasClass('rule')).to.equal(true);
    });

    describe('field selector as <ValueSelector />', ()=> {
        beforeEach(() => {
            controls.fieldSelector = ValueSelector;
        });

        it('should have options set to expected fields', ()=> {
            const expected_fields = [
                {name: 'firstName', label: 'First Label'},
                {name: 'secondName', label: 'Second Label'}
            ];
            schema.fields = expected_fields;
            const dom = shallow(<Rule {...props} />);

            expect(dom.find('ValueSelector').props().options).to.equal(expected_fields);
        });

        behavesLikeASelector('field', 'rule-fields', 'custom-fields-class');
    });

    describe('operator selector as <ValueSelector />', ()=> {
        beforeEach(() => {
            controls.operatorSelector = ValueSelector;
        });

        it('should have options set to fields returned from "getOperators"', ()=> {
            const expected_operators = [
                {name: '=', label: '='},
                {name: '!=', label: '!='}
            ]
            function getOperators(field) {
                return expected_operators;
            }
            schema.getOperators = getOperators;
            const dom = shallow(<Rule {...props} />);

            expect(dom.find('ValueSelector').props().options).to.equal(expected_operators);
        });

        behavesLikeASelector('operator', 'rule-operators', 'custom-operators-class');
    });

    describe('value editor as <ValueEditor />', ()=> {
        beforeEach(() => {
            controls.valueEditor = ValueEditor;
        });

        it('should have field set to selected field', ()=> {
            props.field = 'selected_field';
            const dom = shallow(<Rule {...props} />);

            expect(dom.find('ValueEditor').props().field).to.equal('selected_field');
        });

        it('should have operator set to selected operator', ()=> {
            props.operator = 'selected_operator';
            const dom = shallow(<Rule {...props} />);

            expect(dom.find('ValueEditor').props().operator).to.equal('selected_operator');
        });

        it('should have value set to specified value', ()=> {
            props.value = 'specified_value';
            const dom = shallow(<Rule {...props} />);

            expect(dom.find('ValueEditor').props().value).to.equal('specified_value');
        });

        it('should have the onChange method handler', ()=> {
            const dom = shallow(<Rule {...props} />);

            expect(dom.find('ValueEditor').props().handleOnChange).to.be.a('function');
        });

        //TODO spy on value change handler and verify it is triggered
    });

    describe('rule remove action as <ActionElement />', ()=> {
        beforeEach(() => {
            controls.removeRuleAction = ActionElement;
        });

        it('should have label set to "x"', ()=> {
            const dom = shallow(<Rule {...props} />);

            expect(dom.find('ActionElement').props().label).to.equal('x');
        });

        it('should have the default className', ()=> {
            const dom = shallow(<Rule {...props} />);
            expect(dom.find('ActionElement').props().className).to.contain('rule-remove');
        });

        it('should have the custom className', ()=> {
            const dom = shallow(<Rule {...props} />);
            expect(dom.find('ActionElement').props().className).to.contain('custom-removeRule-class');
        });

        it('should have the onChange method handler', ()=> {
            const dom = shallow(<Rule {...props} />);

            expect(dom.find('ActionElement').props().handleOnClick).to.be.a('function');
        });

        //TODO spy on value change handler and verify it is triggered
    });

    function behavesLikeASelector(value, defaultClassName, customClassName) {
        it('should have the selected value set correctly', ()=> {
            const dom = shallow(<Rule {...props} />);
            expect(dom.find('ValueSelector').props().value).to.equal(value);
        });

        it('should have the default className', ()=> {
            const dom = shallow(<Rule {...props} />);
            expect(dom.find('ValueSelector').props().className).to.contain(defaultClassName);
        });

        it('should have the custom className', ()=> {
            const dom = shallow(<Rule {...props} />);
            expect(dom.find('ValueSelector').props().className).to.contain(customClassName);
        });

        it('should have the onChange method handler', ()=> {
            const dom = shallow(<Rule {...props} />);
            expect(dom.find('ValueSelector').props().handleOnChange).to.be.a('function');
        });
    }
});
