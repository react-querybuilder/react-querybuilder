import { mount, shallow } from 'enzyme';
import * as React from 'react';
import { ValidationResult } from '..';
import { ActionElement, NotToggle, ValueSelector } from '../controls/index';
import { standardClassnames } from '../defaults';
import { Rule } from '../Rule';
import { RuleGroup } from '../RuleGroup';
import {
  ActionWithRulesProps,
  Classnames,
  Controls,
  RuleGroupProps,
  RuleGroupType,
  RuleType,
  Schema,
  ValueSelectorProps
} from '../types';

describe('<RuleGroup />', () => {
  let controls: Partial<Controls>,
    classNames: Partial<Classnames>,
    schema: Partial<Schema>,
    props: RuleGroupProps;
  beforeEach(() => {
    controls = {
      combinatorSelector: (props) => (
        <select onChange={(e) => props.handleOnChange(e.target.value)}>
          <option value="combinator">Combinator</option>
          <option value="any_combinator_value">Any Combinator</option>
        </select>
      ),
      addRuleAction: (props) => <button onClick={(e) => props.handleOnClick(e)}>+Rule</button>,
      addGroupAction: (props) => <button onClick={(e) => props.handleOnClick(e)}>+Group</button>,
      cloneGroupAction: (props) => <button onClick={(e) => props.handleOnClick(e)}>⧉</button>,
      removeGroupAction: (props) => <button onClick={(e) => props.handleOnClick(e)}>x</button>,
      notToggle: (props) => (
        <label>
          <input onChange={(e) => props.handleOnChange(e.target.checked)} />
          Not
        </label>
      ),
      rule: Rule,
      ruleGroup: RuleGroup
    };
    classNames = {
      header: 'custom-header-class',
      body: 'custom-body-class',
      combinators: 'custom-combinators-class',
      addRule: 'custom-addRule-class',
      addGroup: 'custom-addGroup-class',
      cloneGroup: 'custom-cloneGroup-class',
      removeGroup: 'custom-removeGroup-class',
      notToggle: 'custom-notToggle-class'
    };
    schema = {
      combinators: [],
      controls: controls as Controls,
      classNames: classNames as Classnames,
      isRuleGroup: (_rule): _rule is RuleGroupType => {
        return false;
      },
      onPropChange: (_prop, _value, _path) => {},
      onRuleAdd: (_rule, _parentPath) => {},
      onGroupAdd: (_ruleGroup, _parentPath) => {},
      createRule: () => _createRule(0),
      createRuleGroup: () => _createRuleGroup(0, [], []),
      showCombinatorsBetweenRules: false,
      showNotToggle: false,
      showCloneButtons: false,
      validationMap: {}
    };
    props = {
      id: 'id',
      path: [0],
      rules: [],
      combinator: 'and',
      schema: schema as Schema,
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
    expect(RuleGroup).toBeDefined();
  });

  it('should have correct classNames', () => {
    const dom = shallow(<RuleGroup {...props} />);
    expect(dom.find('div').first().hasClass(standardClassnames.ruleGroup)).toBe(true);
    expect(dom.find(`.${standardClassnames.header}.${classNames.header}`)).toHaveLength(1);
    expect(dom.find(`.${standardClassnames.body}.${classNames.body}`)).toHaveLength(1);
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
      expect(dom.find(ValueSelector).props().options).toEqual(expected_combinators);
    });

    it('should have the default selected value set to "and"', () => {
      const dom = shallow(<RuleGroup {...props} />);
      expect(dom.find(ValueSelector).props().value).toBe('and');
    });

    it('should have the onChange method handler', () => {
      const dom = shallow(<RuleGroup {...props} />);
      expect(typeof dom.find(ValueSelector).props().handleOnChange).toBe('function');
    });

    behavesLikeAnElementWithClassNames(
      ValueSelector,
      standardClassnames.combinators,
      'custom-combinators-class'
    );
  });

  describe('add rule action as an <ActionElement />', () => {
    beforeEach(() => {
      controls.addRuleAction = ActionElement;
    });

    behavesLikeAnActionElement('+Rule', standardClassnames.addRule, 'custom-addRule-class');
  });

  describe('add group action as an <ActionElement />', () => {
    beforeEach(() => {
      controls.addGroupAction = ActionElement;
    });

    behavesLikeAnActionElement('+Group', standardClassnames.addGroup, 'custom-addGroup-class');
  });

  describe('clone group action as an <ActionElement />', () => {
    beforeEach(() => {
      schema.showCloneButtons = true;
      controls.cloneGroupAction = ActionElement;
    });

    behavesLikeAnActionElement('⧉', standardClassnames.cloneGroup, 'custom-cloneGroup-class');
  });

  describe('remove group action as an <ActionElement />', () => {
    beforeEach(() => {
      controls.removeGroupAction = ActionElement;
    });

    it('does not exist if it does not have a parent', () => {
      props.path = [];
      const dom = shallow(<RuleGroup {...props} />);
      expect(dom.find(ActionElement)).toHaveLength(0);
    });

    behavesLikeAnActionElement('x', standardClassnames.removeGroup, 'custom-removeGroup-class');
  });

  describe('when 2 rules exist', () => {
    beforeEach(() => {
      props.rules = [_createRule(1), _createRule(2)];
    });

    it('has 2 <Rule /> elements', () => {
      const dom = shallow(<RuleGroup {...props} />);
      expect(dom.find(Rule)).toHaveLength(2);
    });

    it('has the first rule with the correct values', () => {
      const dom = shallow(<RuleGroup {...props} />);
      const ruleProps = dom.find(Rule).first().props();
      expect(ruleProps.id).toBe('rule_id_1');
      expect(ruleProps.field).toBe('field_1');
      expect(ruleProps.operator).toBe('operator_1');
      expect(ruleProps.value).toBe('value_1');
    });
  });

  describe('when 1 rule group exists', () => {
    beforeEach(() => {
      props.rules = [_createRuleGroup(0, [], [])];
      schema.isRuleGroup = (_rule): _rule is RuleGroupType => true;
    });

    it('has 1 <RuleGroup /> element', () => {
      const dom = shallow(<RuleGroup {...props} />);
      expect(dom.find(RuleGroup)).toHaveLength(1);
    });

    it('has 1 <RuleGroup /> with expected properties', () => {
      const dom = shallow(<RuleGroup {...props} />);
      const groupProps = dom.find(RuleGroup).props();
      expect(groupProps.id).toBe('rule_group_id_0');
      expect(groupProps.path).toEqual([0, 0]);
      expect(Array.isArray(groupProps.rules)).toBe(true);
      expect(groupProps.combinator).toBeUndefined();
    });
  });

  describe('when no combinator prop exists', () => {
    it('has default props', () => {
      const dom = mount(
        <RuleGroup
          path={[]}
          rules={[]}
          schema={{ ...props.schema, isRuleGroup: (_rule): _rule is RuleGroupType => true }}
          translations={props.translations}
        />
      );
      const groupProps = dom.find(RuleGroup).props();
      expect(groupProps.combinator).toBeUndefined();
    });
  });

  describe('onCombinatorChange', () => {
    it('calls onPropChange from the schema with expected values', () => {
      let actualProperty: string, actualValue: any, actualPath: number[];
      schema.onPropChange = (prop, value, path) => {
        actualProperty = prop;
        actualValue = value;
        actualPath = path;
      };
      const dom = mount(<RuleGroup {...props} />);
      dom
        .find(`.${standardClassnames.combinators}`)
        .simulate('change', { target: { value: 'any_combinator_value' } });

      expect(actualProperty).toBe('combinator');
      expect(actualValue).toBe('any_combinator_value');
      expect(actualPath).toEqual([0]);
    });
  });

  describe('onNotToggleChange', () => {
    it('should set NOT property on ruleGroups below root', () => {
      const idOfNestedRuleGroup = 'nested';
      const propsWithNestedRuleGroup = {
        ...props,
        rules: [
          {
            id: idOfNestedRuleGroup,
            combinator: 'and',
            rules: [],
            not: true
          }
        ]
      };
      propsWithNestedRuleGroup.schema.isRuleGroup = (_rule): _rule is RuleGroupType => true;

      const dom = mount(<RuleGroup {...propsWithNestedRuleGroup} />);

      expect(dom.find(RuleGroup).find({ id: idOfNestedRuleGroup }).props().not).toBe(true);
    });

    it('calls onPropChange from the schema with expected values', () => {
      let actualProperty: string, actualValue: any, actualPath: number[];
      schema.onPropChange = (prop, value, path) => {
        actualProperty = prop;
        actualValue = value;
        actualPath = path;
      };
      schema.showNotToggle = true;
      const dom = mount(<RuleGroup {...props} />);
      dom
        .find(`.${standardClassnames.notToggle} input`)
        .simulate('change', { target: { checked: true } });

      expect(actualProperty).toBe('not');
      expect(actualValue).toBe(true);
      expect(actualPath).toEqual([0]);
    });
  });

  describe('addRule', () => {
    it('calls onRuleAdd from the schema with expected values', () => {
      let actualRule: RuleType, actualPath: number[];
      schema.onRuleAdd = (rule, path) => {
        actualRule = rule;
        actualPath = path;
      };
      const dom = mount(<RuleGroup {...props} />);
      dom.find(`.${standardClassnames.addRule}`).simulate('click');

      expect(actualRule).toHaveProperty('id');
      expect(actualRule).toHaveProperty('field');
      expect(actualRule).toHaveProperty('operator');
      expect(actualRule).toHaveProperty('value');
      expect(actualPath).toEqual([0]);
    });
  });

  describe('addGroup', () => {
    it('calls onGroupAdd from the schema with expected values', () => {
      let actualRuleGroup: RuleGroupType, actualPath: number[];
      schema.onGroupAdd = (ruleGroup, path) => {
        actualRuleGroup = ruleGroup;
        actualPath = path;
      };
      const dom = mount(<RuleGroup {...props} />);
      dom.find(`.${standardClassnames.addGroup}`).simulate('click');

      expect(actualRuleGroup).toHaveProperty('id');
      expect(actualRuleGroup).toHaveProperty('rules');
      expect(actualPath).toEqual([0]);
    });
  });

  describe('cloneGroup', () => {
    beforeEach(() => {
      schema.showCloneButtons = true;
    });

    it('calls onGroupAdd from the schema with expected values', () => {
      let actualRuleGroup: RuleGroupType, actualPath: number[];
      schema.onGroupAdd = (ruleGroup, path) => {
        actualRuleGroup = ruleGroup;
        actualPath = path;
      };
      const dom = mount(<RuleGroup {...props} />);
      dom.find(`.${standardClassnames.cloneGroup}`).simulate('click');

      expect(actualRuleGroup.combinator).toBe('and');
      expect(actualRuleGroup.not).toBeUndefined();
      expect(actualRuleGroup.rules).toHaveLength(0);
      expect(actualPath).toEqual([]);
    });
  });

  describe('removeGroup', () => {
    it('calls onGroupRemove from the schema with expected values', () => {
      let actualPath: number[];
      schema.onGroupRemove = (path) => {
        actualPath = path;
      };
      const dom = mount(<RuleGroup {...props} />);
      dom.find(`.${standardClassnames.removeGroup}`).simulate('click');

      expect(actualPath).toEqual([0]);
    });
  });

  describe('showCombinatorsBetweenRules', () => {
    it('does not display combinators when there is only one rule', () => {
      schema.showCombinatorsBetweenRules = true;
      props.rules = [{ field: 'test', value: 'Test', operator: '=' }];
      const dom = shallow(<RuleGroup {...props} />);
      const sc = dom.find(`.${standardClassnames.combinators}`);
      expect(sc).toHaveLength(0);
    });

    it('displays combinators when there is more than one rule', () => {
      schema.showCombinatorsBetweenRules = true;
      props.rules = [
        { rules: [], combinator: 'and' },
        { field: 'test', value: 'Test', operator: '=' },
        { rules: [], combinator: 'and' }
      ];
      const dom = shallow(<RuleGroup {...props} />);
      const sc = dom.find(`.${standardClassnames.combinators}`);
      expect(sc).toHaveLength(2);
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
      const sc = dom.find(`.${standardClassnames.notToggle}`);
      expect(sc).toHaveLength(0);
    });

    it('displays NOT toggle when showNotToggle is set to true', () => {
      const dom = shallow(<RuleGroup {...props} />);
      const sc = dom.find(`.${standardClassnames.notToggle}`);
      expect(sc).toHaveLength(1);
    });

    it('has the correct classNames', () => {
      const dom = shallow(<RuleGroup {...props} />);
      expect(dom.find(NotToggle).props().className).toContain(standardClassnames.notToggle);
      expect(dom.find(NotToggle).props().className).toContain('custom-notToggle-class');
    });
  });

  describe('showCloneButtons', () => {
    beforeEach(() => {
      schema.showCloneButtons = true;
      controls.cloneGroupAction = ActionElement;
    });

    it('does not display clone buttons by default', () => {
      schema.showCloneButtons = false;
      const dom = shallow(<RuleGroup {...props} />);
      const sc = dom.find(`.${standardClassnames.cloneGroup}`);
      expect(sc).toHaveLength(0);
    });

    it('displays clone buttons when showCloneButtons is set to true', () => {
      const dom = shallow(<RuleGroup {...props} />);
      const sc = dom.find(`.${standardClassnames.cloneGroup}`);
      expect(sc).toHaveLength(1);
    });

    it('has the correct classNames', () => {
      const dom = shallow(<RuleGroup {...props} />);
      expect(dom.find(`.${standardClassnames.cloneGroup}`).props().className).toContain(
        'custom-cloneGroup-class'
      );
    });
  });

  describe('validation', () => {
    it('should not validate if no validationMap[id] value exists', () => {
      const dom = shallow(<RuleGroup {...props} />);
      expect(dom.find('div').first().hasClass(standardClassnames.valid)).toBe(false);
      expect(dom.find('div').first().hasClass(standardClassnames.invalid)).toBe(false);
    });

    it('should validate to false if validationMap[id] = false', () => {
      schema.validationMap = { id: false };
      const dom = shallow(<RuleGroup {...props} />);
      expect(dom.find('div').first().hasClass(standardClassnames.valid)).toBe(false);
      expect(dom.find('div').first().hasClass(standardClassnames.invalid)).toBe(true);
    });

    it('should validate to true if validationMap[id] = true', () => {
      schema.validationMap = { id: true };
      const dom = shallow(<RuleGroup {...props} />);
      expect(dom.find('div').first().hasClass(standardClassnames.valid)).toBe(true);
      expect(dom.find('div').first().hasClass(standardClassnames.invalid)).toBe(false);
    });

    it('should pass down validationResult as validation to children', () => {
      const valRes: ValidationResult = { valid: false, reasons: ['invalid'] };
      schema.controls.combinatorSelector = ValueSelector;
      schema.controls.addRuleAction = ActionElement;
      schema.validationMap = { id: valRes };
      const dom = shallow(<RuleGroup {...props} />);
      expect(dom.find(ValueSelector).props().validation).toEqual(valRes);
      expect(dom.find(ActionElement).props().validation).toEqual(valRes);
    });
  });

  //shared examples
  function behavesLikeAnActionElement(
    label: string,
    defaultClassName: string,
    customClassName: string
  ) {
    it('should have the correct label', () => {
      const dom = shallow(<RuleGroup {...props} />);
      expect(dom.find(ActionElement).props().label).toBe(label);
    });

    it('should have the onClick method handler', () => {
      const dom = shallow(<RuleGroup {...props} />);
      expect(typeof dom.find(ActionElement).props().handleOnClick).toBe('function');
    });

    behavesLikeAnElementWithClassNames(ActionElement, defaultClassName, customClassName);
  }

  function behavesLikeAnElementWithClassNames(
    element: React.ComponentType<ActionWithRulesProps & ValueSelectorProps>,
    defaultClassName: string,
    customClassName: string
  ) {
    it('should have the default className', () => {
      const dom = shallow(<RuleGroup {...props} />);
      expect(dom.find(element).props().className).toContain(defaultClassName);
    });

    it('should have the custom className', () => {
      const dom = shallow(<RuleGroup {...props} />);
      expect(dom.find(element).props().className).toContain(customClassName);
    });

    it('should pass down the existing rules array', () => {
      props.rules = [_createRule(1), _createRule(2)];
      const dom = shallow(<RuleGroup {...props} />);
      expect(dom.find(element).props().rules).toEqual(props.rules);
    });

    it('should pass down the level of the element', () => {
      props.rules = [_createRule(1), _createRule(2)];
      const dom = shallow(<RuleGroup {...props} />);
      expect(dom.find(element).props().level).toBe(1);
    });
  }

  //helper functions
  const _createRule = (index: number): RuleType => {
    return {
      id: `rule_id_${index}`,
      field: `field_${index}`,
      operator: `operator_${index}`,
      value: `value_${index}`
    };
  };

  const _createRuleGroup = (
    index: number,
    parentPath: number[],
    rules: RuleType[]
  ): RuleGroupType => {
    const thisPath = parentPath.concat([index]);
    return {
      id: 'rule_group_id_' + index,
      path: thisPath,
      rules,
      combinator: undefined
    };
  };
});
