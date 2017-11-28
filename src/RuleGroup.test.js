import React from 'react';
import { shallow } from 'enzyme';

import RuleGroup from './RuleGroup';
import { ActionElement, ValueSelector } from './controls/index';

describe('<RuleGroup />', ()=> {
    let controls, classNames, schema, props;
    beforeEach(()=>{
        //set defaults
        controls = {
            combinatorSelector: React.Component,
            addRuleAction: React.Component,
            addGroupAction: React.Component,
            removeGroupAction: React.Component
        }
        classNames = {
            combinators: 'custom-combinators-class',
            addRule: 'custom-addRule-class',
            addGroup: 'custom-addGroup-class',
            removeGroup: 'custom-removeGroup-class'
        }
        schema = {
            combinators: [],
            controls: controls,
            classNames: classNames,
            isRuleGroup: (rule)=>{return false},
            onPropChange: (prop, value, id)=>{},
            onRuleAdd: (rule, parentId)=>{},
            onGroupAdd: (ruleGroup, id)=>{},
            createRule: ()=>{ return _createRule(1);},
            createRuleGroup: ()=>{ return _createRuleGroup(1, 'any_parent_id', []);},
            getLevel: (id) => 0
        }
        props = {
            id: 'id',
            parentId: 'parentId',
            rules: [],
            combinator: 'and',
            schema: schema,
            translations: {
                fields: {
                    title: "Fields",
                },
                operators: {
                    title: "Operators",
                },
                value: {
                    title: "Value",
                },
                removeRule: {
                    label: "x",
                    title: "Remove rule",
                },
                removeGroup: {
                    label: "x",
                    title: "Remove group",
                },
                addRule: {
                    label: "+Rule",
                    title: "Add rule",
                },
                addGroup: {
                    label: "+Group",
                    title: "Add group",
                },
                combinators: {
                    title: "Combinators",
                }
            }
        }
    });

    it('should exist', ()=> {
        expect(RuleGroup).to.exist;
    });

    it('should have a className of "ruleGroup"', ()=> {
        const dom = shallow(<RuleGroup {...props} />);

        expect(dom.find('div').hasClass('ruleGroup')).to.be.true;
    });

    describe('combinator selector as <ValueSelector />', ()=> {
        beforeEach(() => {
            controls.combinatorSelector = ValueSelector;
        });

        it('should have options set to expected combinators', ()=> {
            const expected_combinators = [
                {name: 'and', label: 'AND'},
                {name: 'or', label: 'OR'}
            ];
            schema.combinators = expected_combinators;
            const dom = shallow(<RuleGroup {...props} />);
            expect(dom.find('ValueSelector').props().options).to.equal(expected_combinators);
        });

        it('should have the default selected value set to "and"', ()=> {
            const dom = shallow(<RuleGroup {...props} />);
            expect(dom.find('ValueSelector').props().value).to.equal('and');
        });

        it('should have the onChange method handler', ()=> {
            const dom = shallow(<RuleGroup {...props} />);
            expect(dom.find('ValueSelector').props().handleOnChange).to.be.a('function');
        });

        behavesLikeAnElementWithClassNames(
            'ValueSelector',
            'ruleGroup-combinators',
            'custom-combinators-class'
        );
    });

    describe('add rule action as an <ActionElement />', ()=> {
        beforeEach(() => {
            controls.addRuleAction = ActionElement;
        });

        behavesLikeAnActionElement(
            '+Rule',
            'ruleGroup-addRule',
            'custom-addRule-class');
    });

    describe('add group action as an <ActionElement />', ()=> {
        beforeEach(() => {
            controls.addGroupAction = ActionElement;
        });

        behavesLikeAnActionElement(
            '+Group',
            'ruleGroup-addGroup',
            'custom-addGroup-class');
    });

    describe('remove group action as an <ActionElement />', ()=> {
        beforeEach(() => {
            controls.removeGroupAction = ActionElement;
        });

        it('does not exist if it does not have a parent', () => {
            props.parentId = null;
            const dom = shallow(<RuleGroup {...props} />);
            expect(dom.find('ActionElement')).to.have.length(0);
        });

        behavesLikeAnActionElement(
            'x',
            'ruleGroup-remove',
            'custom-removeGroup-class');
    });

    describe('when 2 rules exist', ()=> {
        beforeEach(()=>{
            props.rules = [
                _createRule(1),
                _createRule(2)
            ]
        });

        it('has 2 <Rule /> elements', ()=>{
            const dom = shallow(<RuleGroup {...props} />);
            expect(dom.find('Rule')).to.have.length(2);
        });

        it('has the first rule with the correct values', ()=>{
            const dom = shallow(<RuleGroup {...props} />);
            const ruleProps = dom.find('Rule').first().props();
            expect(ruleProps.id).to.equal('rule_id_1');
            expect(ruleProps.field).to.equal('field_1');
            expect(ruleProps.operator).to.equal('operator_1');
            expect(ruleProps.value).to.equal('value_1');
        });
    });

    describe('when 1 rule group exists', ()=> {
        beforeEach(()=>{
            props.rules = [
                _createRuleGroup(1, props.id, [])
            ]
            schema.isRuleGroup = (rule) => { return true; }
        });

        it('has 1 <RuleGroup /> element', ()=> {
            const dom = shallow(<RuleGroup {...props} />);
            expect(dom.find('RuleGroup')).to.have.length(1);
        })

        it('has 1 <RuleGroup /> with expected properties', ()=> {
            const dom = shallow(<RuleGroup {...props} />);
            const groupProps = dom.find('RuleGroup').props();
            expect(groupProps.id).to.equal('rule_group_id_1');
            expect(groupProps.parentId).to.equal('id');
            expect(groupProps.rules).to.be.an('array');
            expect(groupProps.combinator).to.equal('and');
        })
    });

    describe('#hasParentGroup', ()=>{
        describe('when it has a parentId', ()=>{
            beforeEach(()=>{
                props.parentId = 'any_parent_id';
            });

            it('returns truthy', ()=> {
                const instance = shallow(<RuleGroup {...props} />).instance();
                expect(instance.hasParentGroup()).isOk;
            });
        })

        describe('when it does not have a parentId', ()=>{
            beforeEach(()=>{
                props.parentId = null;
            });

            it('returns falsey', ()=> {
                const instance = shallow(<RuleGroup {...props} />).instance();
                expect(instance.hasParentGroup()).isNotOk;
            });
        })
    });

    describe('#onCombinatorChange', ()=>{
        it('calls the #onPropChange from the schema with expected values', ()=>{
            let actualProperty, actualValue, actualId;
            schema.onPropChange = (prop, value, id) => {
                actualProperty = prop;
                actualValue = value;
                actualId = id;
            }
            const instance = shallow(<RuleGroup {...props} />).instance();
            instance.onCombinatorChange('any_combinator_value');

            expect(actualProperty).to.equal('combinator');
            expect(actualValue).to.equal('any_combinator_value');
            expect(actualId).to.equal('id');
        });
    });

    describe('#addRule', ()=>{
        it('calls the #onRuleAdd from the schema with expected values', ()=>{
            let actualRule, actualId;
            schema.onRuleAdd = (rule, id) => {
                actualRule = rule;
                actualId = id;
            }
            const instance = shallow(<RuleGroup {...props} />).instance();
            instance.addRule(_mockEvent());

            expect(actualRule).to.include.keys('id', 'field', 'operator', 'value');
            expect(actualId).to.equal('id');
        });
    });

    describe('#addGroup', ()=>{
        it('calls the #onGroupAdd from the schema with expected values', ()=>{
            let actualRuleGroup, actualId;
            schema.onGroupAdd = (ruleGroup, id) => {
                actualRuleGroup = ruleGroup;
                actualId = id;
            }
            const instance = shallow(<RuleGroup {...props} />).instance();
            instance.addGroup(_mockEvent());

            expect(actualRuleGroup).to.include.keys('id', 'parentId', 'rules');
            expect(actualId).to.equal('id');
        });
    });

    describe('#removeGroup', ()=>{
        it('calls the #onGroupRemove from the schema with expected values', ()=>{
            let actualId, actualParentId;
            schema.onGroupRemove = (id, parentId) => {
                actualId = id;
                actualParentId = parentId;
            }
            const instance = shallow(<RuleGroup {...props} />).instance();
            instance.removeGroup(_mockEvent());

            expect(actualId).to.equal('id');
            expect(actualParentId).to.equal('parentId');
        });
    });

    //shared examples
    function behavesLikeAnActionElement(label, defaultClassName, customClassName) {
        it('should have the correct label', ()=>{
            const dom = shallow(<RuleGroup {...props} />);
            expect(dom.find('ActionElement').props().label).to.equal(label);
        });

        it('should have the onClick method handler', ()=> {
            const dom = shallow(<RuleGroup {...props} />);
            expect(dom.find('ActionElement').props().handleOnClick).to.be.a('function');
        });

        behavesLikeAnElementWithClassNames(
            'ActionElement',
            defaultClassName,
            customClassName);
    }

    function behavesLikeAnElementWithClassNames(element, defaultClassName, customClassName) {
        it('should have the default className', ()=> {
            const dom = shallow(<RuleGroup {...props} />);
            expect(dom.find(element).props().className).to.contain(defaultClassName);
        });

        it('should have the custom className', ()=> {
            const dom = shallow(<RuleGroup {...props} />);
            expect(dom.find(element).props().className).to.contain(customClassName);
        });
        it('should pass down the existing rules array', ()=> {
            props.rules = [_createRule(1),_createRule(2)];
            const dom = shallow(<RuleGroup {...props} />);
            expect(dom.find(element).props().rules).to.equal(props.rules);
        });
         it('should pass down the level of the element', ()=> {
            props.rules = [_createRule(1),_createRule(2)];
            const dom = shallow(<RuleGroup {...props} />);
            expect(dom.find(element).props().level).to.equal(0);
        });
    }

    //helper functions
    function _createRule(index) {
        return {
            id: 'rule_id_' + index,
            field: 'field_' + index,
            operator: 'operator_' + index,
            value: 'value_' + index
        }
    }

    function _createRuleGroup(index, parentId, rules) {
        return {
            id: 'rule_group_id_' + index,
            parentId: parentId,
            rules: rules
        }
    }

    function _mockEvent() {
        return {
            preventDefault: ()=>{},
            stopPropagation: ()=>{}
        }
    }
});
