import { expect } from 'chai';
import { mount, shallow } from 'enzyme';
import React from 'react';
import { ActionElement, NotToggle, ValueSelector } from '../controls/index';
import { Rule } from '../Rule';
import { RuleGroup } from '../RuleGroup';
import { ActionProps, ValueSelectorProps } from '../types';

describe('<RuleGroup />', () => {
  let controls, classNames, schema, props;
  beforeEach(() => {
    //set defaults
    controls = {
      combinatorSelector: (props) => (
        <select onChange={(e) => props.handleOnChange(e.target.value)}>
          <option value="combinator">Combinator</option>
          <option value="any_combinator_value">Any Combinator</option>
        </select>
      ),
      addRuleAction: (props) => <button onClick={(e) => props.handleOnClick(e)}>+Rule</button>,
      addGroupAction: (props) => <button onClick={(e) => props.handleOnClick(e)}>+Group</button>,
      removeGroupAction: (props) => <button onClick={(e) => props.handleOnClick(e)}>x</button>,
      notToggle: (props) => (
        <label>
          <input onChange={(e) => props.handleOnChange(e.target.checked)} />
          Not
        </label>
      ),
      rule: Rule
    };
    classNames = {
      combinators: 'custom-combinators-class',
      addRule: 'custom-addRule-class',
      addGroup: 'custom-addGroup-class',
      removeGroup: 'custom-removeGroup-class',
      notToggle: 'custom-notToggle-class'
    };
    schema = {
      combinators: [],
      controls: controls,
      classNames: classNames,
      isRuleGroup: (rule) => {
        return false;
      },
      onPropChange: (prop, value, id) => {},
      onRuleAdd: (rule, parentId) => {},
      onGroupAdd: (ruleGroup, id) => {},
      createRule: () => _createRule(1),
      createRuleGroup: () => _createRuleGroup(1, 'any_parent_id', []),
      getLevel: (id) => 0,
      showCombinatorsBetweenRules: false,
      showNotToggle: false
    };
    props = {
      id: 'id',
      parentId: 'parentId',
      rules: [],
      combinator: 'and',
      schema: schema,
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
          title: 'Invert this group'
        }
      }
    };
  });

  it('should exist', () => {
    expect(RuleGroup).to.exist;
  });

  it('should have a className of "ruleGroup"', () => {
    const dom = shallow(<RuleGroup {...props} />);
    expect(dom.find('div').first().hasClass('ruleGroup')).to.be.true;
  });

  describe('combinator selector as <ValueSelector />', () => {
    beforeEach(() => {
      controls.combinatorSelector = ValueSelector;
    });

    it('should have options set to expected combinators', () => {
      const expected_combinators = [
        { name: 'and', label: 'AND' },
        { name: 'or', label: 'OR' }
      ];
      schema.combinators = expected_combinators;
      const dom = shallow(<RuleGroup {...props} />);
      expect(dom.find(ValueSelector).props().options).to.equal(expected_combinators);
    });

    it('should have the default selected value set to "and"', () => {
      const dom = shallow(<RuleGroup {...props} />);
      expect(dom.find(ValueSelector).props().value).to.equal('and');
    });

    it('should have the onChange method handler', () => {
      const dom = shallow(<RuleGroup {...props} />);
      expect(dom.find(ValueSelector).props().handleOnChange).to.be.a('function');
    });

    behavesLikeAnElementWithClassNames(
      ValueSelector,
      'ruleGroup-combinators',
      'custom-combinators-class'
    );
  });

  describe('add rule action as an <ActionElement />', () => {
    beforeEach(() => {
      controls.addRuleAction = ActionElement;
    });

    behavesLikeAnActionElement('+Rule', 'ruleGroup-addRule', 'custom-addRule-class');
  });

  describe('add group action as an <ActionElement />', () => {
    beforeEach(() => {
      controls.addGroupAction = ActionElement;
    });

    behavesLikeAnActionElement('+Group', 'ruleGroup-addGroup', 'custom-addGroup-class');
  });

  describe('remove group action as an <ActionElement />', () => {
    beforeEach(() => {
      controls.removeGroupAction = ActionElement;
    });

    it('does not exist if it does not have a parent', () => {
      props.parentId = null;
      const dom = shallow(<RuleGroup {...props} />);
      expect(dom.find('ActionElement')).to.have.length(0);
    });

    behavesLikeAnActionElement('x', 'ruleGroup-remove', 'custom-removeGroup-class');
  });

  describe('when 2 rules exist', () => {
    beforeEach(() => {
      props.rules = [_createRule(1), _createRule(2)];
    });

    it('has 2 <Rule /> elements', () => {
      const dom = shallow(<RuleGroup {...props} />);
      expect(dom.find('Rule')).to.have.length(2);
    });

    it('has the first rule with the correct values', () => {
      const dom = shallow(<RuleGroup {...props} />);
      const ruleProps = dom.find(Rule).first().props();
      expect(ruleProps.id).to.equal('rule_id_1');
      expect(ruleProps.field).to.equal('field_1');
      expect(ruleProps.operator).to.equal('operator_1');
      expect(ruleProps.value).to.equal('value_1');
    });
  });

  describe('when 1 rule group exists', () => {
    beforeEach(() => {
      props.rules = [_createRuleGroup(1, props.id, [])];
      schema.isRuleGroup = (rule) => {
        return true;
      };
    });

    it('has 1 <RuleGroup /> element', () => {
      const dom = shallow(<RuleGroup {...props} />);
      expect(dom.find('RuleGroup')).to.have.length(1);
    });

    it('has 1 <RuleGroup /> with expected properties', () => {
      const dom = shallow(<RuleGroup {...props} />);
      const groupProps = dom.find(RuleGroup).props();
      expect(groupProps.id).to.equal('rule_group_id_1');
      expect(groupProps.parentId).to.equal('id');
      expect(groupProps.rules).to.be.an('array');
      expect(groupProps.combinator).to.be.undefined;
    });
  });

  describe('when no rules or combinator props exist', () => {
    it('has default props', () => {
      const dom = mount(
        <RuleGroup
          id={props.id}
          parentId={props.parentId}
          schema={{ ...props.schema, isRuleGroup: () => true }}
          translations={props.translations}
        />
      );
      const groupProps = dom.find(RuleGroup).props();
      expect(groupProps.rules).to.be.undefined;
      expect(groupProps.combinator).to.be.undefined;
    });
  });

  describe('onCombinatorChange', () => {
    it('calls onPropChange from the schema with expected values', () => {
      let actualProperty, actualValue, actualId;
      schema.onPropChange = (prop, value, id) => {
        actualProperty = prop;
        actualValue = value;
        actualId = id;
      };
      const dom = mount(<RuleGroup {...props} />);
      dom
        .find('.ruleGroup-combinators')
        .simulate('change', { target: { value: 'any_combinator_value' } });

      expect(actualProperty).to.equal('combinator');
      expect(actualValue).to.equal('any_combinator_value');
      expect(actualId).to.equal('id');
    });
  });

  describe('onNotToggleChange', () => {
    it('should set NOT property on ruleGroups below root', () => {
      // given
      const idOfNestedRuleGroup = 'nested';
      const propsWithNestedRuleGroup = {
        ...props,
        id: 'root',
        rules: [
          {
            id: idOfNestedRuleGroup,
            combinator: 'and',
            rules: [],
            not: true
          }
        ]
      };
      propsWithNestedRuleGroup.schema.isRuleGroup = () => true;

      // when
      const dom = mount(<RuleGroup {...propsWithNestedRuleGroup} />);

      // then
      expect(dom.find(RuleGroup).find({ id: idOfNestedRuleGroup }).props().not).to.equal(true);
    });

    it('calls onPropChange from the schema with expected values', () => {
      let actualProperty, actualValue, actualId;
      schema.onPropChange = (prop, value, id) => {
        actualProperty = prop;
        actualValue = value;
        actualId = id;
      };
      schema.showNotToggle = true;
      const dom = mount(<RuleGroup {...props} />);
      dom.find('.ruleGroup-notToggle input').simulate('change', { target: { checked: true } });

      expect(actualProperty).to.equal('not');
      expect(actualValue).to.equal(true);
      expect(actualId).to.equal('id');
    });
  });

  describe('addRule', () => {
    it('calls onRuleAdd from the schema with expected values', () => {
      let actualRule, actualId;
      schema.onRuleAdd = (rule, id) => {
        actualRule = rule;
        actualId = id;
      };
      const dom = mount(<RuleGroup {...props} />);
      dom.find('.ruleGroup-addRule').simulate('click');

      expect(actualRule).to.include.keys('id', 'field', 'operator', 'value');
      expect(actualId).to.equal('id');
    });
  });

  describe('addGroup', () => {
    it('calls onGroupAdd from the schema with expected values', () => {
      let actualRuleGroup, actualId;
      schema.onGroupAdd = (ruleGroup, id) => {
        actualRuleGroup = ruleGroup;
        actualId = id;
      };
      const dom = mount(<RuleGroup {...props} />);
      dom.find('.ruleGroup-addGroup').simulate('click');

      expect(actualRuleGroup).to.include.keys('id', 'parentId', 'rules');
      expect(actualId).to.equal('id');
    });
  });

  describe('removeGroup', () => {
    it('calls onGroupRemove from the schema with expected values', () => {
      let actualId, actualParentId;
      schema.onGroupRemove = (id, parentId) => {
        actualId = id;
        actualParentId = parentId;
      };
      const dom = mount(<RuleGroup {...props} />);
      dom.find('.ruleGroup-remove').simulate('click');

      expect(actualId).to.equal('id');
      expect(actualParentId).to.equal('parentId');
    });
  });

  describe('showCombinatorsBetweenRules', () => {
    it('does not display combinators when there is only one rule', () => {
      schema.showCombinatorsBetweenRules = true;
      props.rules = [{ id: 'r-test', field: 'test', value: 'Test', operator: '=' }];
      const dom = shallow(<RuleGroup {...props} />);
      const sc = dom.find('.ruleGroup-combinators');
      expect(sc.length).to.equal(0);
    });

    it('displays combinators when there is more than one rule', () => {
      schema.showCombinatorsBetweenRules = true;
      props.rules = [
        { id: 'g-test1', rules: [], combinator: 'and' },
        { id: 'r-test', field: 'test', value: 'Test', operator: '=' },
        { id: 'g-test2', rules: [], combinator: 'and' }
      ];
      const dom = shallow(<RuleGroup {...props} />);
      const sc = dom.find('.ruleGroup-combinators');
      expect(sc.length).to.equal(2);
    });
  });

  describe('showNotToggle', () => {
    beforeEach(() => {
      schema.showNotToggle = true;
      controls.notToggle = NotToggle;
    });

    it('does not display NOT toggle by default', () => {
      schema.showNotToggle = false;
      const dom = shallow(<RuleGroup {...props} />);
      const sc = dom.find('.ruleGroup-notToggle');
      expect(sc.length).to.equal(0);
    });

    it('displays NOT toggle when showNotToggle is set to true', () => {
      const dom = shallow(<RuleGroup {...props} />);
      const sc = dom.find('.ruleGroup-notToggle');
      expect(sc.length).to.equal(1);
    });

    it('has the correct classNames', () => {
      const dom = shallow(<RuleGroup {...props} />);
      expect(dom.find('NotToggle').props().className).to.contain('ruleGroup-notToggle');
      expect(dom.find('NotToggle').props().className).to.contain('custom-notToggle-class');
    });
  });

  //shared examples
  function behavesLikeAnActionElement(label, defaultClassName, customClassName) {
    it('should have the correct label', () => {
      const dom = shallow(<RuleGroup {...props} />);
      expect(dom.find('ActionElement').props().label).to.equal(label);
    });

    it('should have the onClick method handler', () => {
      const dom = shallow(<RuleGroup {...props} />);
      expect(dom.find(ActionElement).props().handleOnClick).to.be.a('function');
    });

    behavesLikeAnElementWithClassNames(ActionElement, defaultClassName, customClassName);
  }

  function behavesLikeAnElementWithClassNames(
    element: React.ComponentType<ActionProps & ValueSelectorProps & { rules: [] }>,
    defaultClassName: string,
    customClassName: string
  ) {
    it('should have the default className', () => {
      const dom = shallow(<RuleGroup {...props} />);
      expect(dom.find(element).props().className).to.contain(defaultClassName);
    });

    it('should have the custom className', () => {
      const dom = shallow(<RuleGroup {...props} />);
      expect(dom.find(element).props().className).to.contain(customClassName);
    });

    it('should pass down the existing rules array', () => {
      props.rules = [_createRule(1), _createRule(2)];
      const dom = shallow(<RuleGroup {...props} />);
      expect(dom.find(element).props().rules).to.equal(props.rules);
    });

    it('should pass down the level of the element', () => {
      props.rules = [_createRule(1), _createRule(2)];
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
    };
  }

  function _createRuleGroup(index, parentId, rules) {
    return {
      id: 'rule_group_id_' + index,
      parentId: parentId,
      rules: rules
    };
  }
});
