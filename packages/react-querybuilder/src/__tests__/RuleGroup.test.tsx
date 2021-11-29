import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mount } from 'enzyme';
import { ComponentType, forwardRef } from 'react';
import { simulateDrag, simulateDragDrop, wrapWithTestBackend } from 'react-dnd-test-utils';
import { act } from 'react-dom/test-utils';
import { ActionElement, NotToggle, ValueSelector } from '../controls';
import { defaultCombinators, defaultTranslations, standardClassnames } from '../defaults';
import { Rule } from '../Rule';
import { RuleGroup as RuleGroupOriginal } from '../RuleGroup';
import {
  ActionProps,
  ActionWithRulesProps,
  Classnames,
  Controls,
  RuleGroupArray,
  RuleGroupICArray,
  RuleGroupProps,
  RuleGroupType,
  RuleType,
  Schema,
  ValidationResult,
  ValueSelectorProps
} from '../types';

const [RuleGroup, getDndBackend] = wrapWithTestBackend(RuleGroupOriginal);

const getHandlerId = (el: HTMLElement, dragDrop: 'drag' | 'drop') => () =>
  el.getAttribute(`data-${dragDrop}monitorid`);

describe('<RuleGroup />', () => {
  let controls: Partial<Controls>;
  let classNames: Partial<Classnames>;
  let schema: Partial<Schema>;
  let props: RuleGroupProps;

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
      cloneRuleAction: (props) => <button onClick={(e) => props.handleOnClick(e)}>⧉</button>,
      removeGroupAction: (props) => <button onClick={(e) => props.handleOnClick(e)}>x</button>,
      removeRuleAction: (props) => <button onClick={(e) => props.handleOnClick(e)}>x</button>,
      notToggle: (props) => (
        <label>
          <input onChange={(e) => props.handleOnChange(e.target.checked)} />
          Not
        </label>
      ),
      fieldSelector: () => null,
      operatorSelector: () => null,
      valueEditor: () => null,
      rule: Rule,
      ruleGroup: RuleGroup,
      dragHandle: forwardRef(() => <span>:</span>)
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
      combinators: defaultCombinators,
      controls: controls as Controls,
      classNames: classNames as Classnames,
      getInputType: () => 'text',
      getOperators: () => [],
      getValueEditorType: () => 'text',
      getValues: () => [],
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
      independentCombinators: false,
      validationMap: {}
    };
    props = {
      id: 'id',
      path: [0],
      rules: [],
      combinator: 'and',
      schema: schema as Schema,
      translations: defaultTranslations
    };
  });

  it('should exist', () => {
    expect(RuleGroup).toBeDefined();
  });

  it('should have correct classNames', () => {
    const dom = mount(<RuleGroup {...props} />);
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
      const dom = mount(<RuleGroup {...props} />);
      expect(dom.find(ValueSelector).props().options).toEqual(expected_combinators);
    });

    it('should have the default selected value set to "and"', () => {
      const dom = mount(<RuleGroup {...props} />);
      expect(dom.find(ValueSelector).props().value).toBe('and');
    });

    it('should have the onChange method handler', () => {
      const dom = mount(<RuleGroup {...props} />);
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
      const dom = mount(<RuleGroup {...props} />);
      expect(dom.find(ActionElement)).toHaveLength(0);
    });

    behavesLikeAnActionElement('x', standardClassnames.removeGroup, 'custom-removeGroup-class');
  });

  describe('when 2 rules exist', () => {
    beforeEach(() => {
      props.rules = [_createRule(1), _createRule(2)];
    });

    it('has 2 <Rule /> elements', () => {
      const dom = mount(<RuleGroup {...props} />);
      expect(dom.find(Rule)).toHaveLength(2);
    });

    it('has the first rule with the correct values', () => {
      const dom = mount(<RuleGroup {...props} />);
      const ruleProps = dom.find(Rule).first().props();
      expect(ruleProps.id).toBe('rule_id_1');
      expect(ruleProps.field).toBe('field_1');
      expect(ruleProps.operator).toBe('operator_1');
      expect(ruleProps.value).toBe('value_1');
    });
  });

  describe('when 1 rule group exists', () => {
    it('has 1 <RuleGroup /> element', () => {
      const dom = mount(<RuleGroup {...props} />);
      expect(dom.find(RuleGroup)).toHaveLength(1);
    });

    it('has 1 <RuleGroup /> with expected properties', () => {
      const dom = mount(<RuleGroup {...props} />);
      const groupProps = dom.find(RuleGroup).props();
      expect(groupProps.id).toBe('id');
      expect(groupProps.path).toEqual([0]);
      expect(Array.isArray(groupProps.rules)).toBe(true);
      expect(groupProps.combinator).toBe('and');
    });
  });

  describe('when no combinator prop exists', () => {
    it('has default props', () => {
      const dom = mount(
        <RuleGroup path={[]} rules={[]} schema={props.schema} translations={props.translations} />
      );
      const groupProps = dom.find(RuleGroup).props();
      expect(groupProps.combinator).toBeUndefined();
    });
  });

  describe('onCombinatorChange', () => {
    it('calls onPropChange from the schema with expected values', () => {
      schema.onPropChange = jest.fn();
      const dom = mount(<RuleGroup {...props} />);
      dom
        .find(`.${standardClassnames.combinators}`)
        .simulate('change', { target: { value: 'any_combinator_value' } });

      const call0 = (schema.onPropChange as jest.Mock).mock.calls[0];
      expect(call0[0]).toBe('combinator');
      expect(call0[1]).toBe('any_combinator_value');
      expect(call0[2]).toEqual([0]);
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
        ] as RuleGroupArray
      };

      const dom = mount(<RuleGroup {...propsWithNestedRuleGroup} />);

      expect(dom.find(RuleGroup).filter({ id: idOfNestedRuleGroup }).props().not).toBe(true);
    });

    it('calls onPropChange from the schema with expected values', () => {
      schema.onPropChange = jest.fn();
      schema.showNotToggle = true;
      const dom = mount(<RuleGroup {...props} />);
      dom
        .find(`.${standardClassnames.notToggle} input`)
        .simulate('change', { target: { checked: true } });

      const call0 = (schema.onPropChange as jest.Mock).mock.calls[0];
      expect(call0[0]).toBe('not');
      expect(call0[1]).toBe(true);
      expect(call0[2]).toEqual([0]);
    });
  });

  describe('addRule', () => {
    it('calls onRuleAdd from the schema with expected values', () => {
      schema.onRuleAdd = jest.fn();
      const dom = mount(<RuleGroup {...props} />);
      dom.find(`.${standardClassnames.addRule}`).simulate('click');

      const call0 = (schema.onRuleAdd as jest.Mock).mock.calls[0];
      expect(call0[0]).toHaveProperty('id');
      expect(call0[0]).toHaveProperty('field');
      expect(call0[0]).toHaveProperty('operator');
      expect(call0[0]).toHaveProperty('value');
      expect(call0[1]).toEqual([0]);
    });
  });

  describe('addGroup', () => {
    it('calls onGroupAdd from the schema with expected values', () => {
      schema.onGroupAdd = jest.fn();
      const dom = mount(<RuleGroup {...props} />);
      dom.find(`.${standardClassnames.addGroup}`).simulate('click');

      const call0 = (schema.onGroupAdd as jest.Mock).mock.calls[0];
      expect(call0[0]).toHaveProperty('id');
      expect(call0[0]).toHaveProperty('rules');
      expect(call0[1]).toEqual([0]);
    });
  });

  describe('cloneGroup', () => {
    beforeEach(() => {
      schema.showCloneButtons = true;
    });

    it('calls moveRule from the schema with expected values', () => {
      schema.moveRule = jest.fn();
      const { getByText } = render(<RuleGroup {...props} />);
      userEvent.click(getByText('⧉'));
      expect(schema.moveRule).toHaveBeenCalledWith([0], [1], true);
    });
  });

  describe('removeGroup', () => {
    it('calls onGroupRemove from the schema with expected values', () => {
      schema.onGroupRemove = jest.fn();
      const dom = mount(<RuleGroup {...props} />);
      dom.find(`.${standardClassnames.removeGroup}`).simulate('click');

      expect((schema.onGroupRemove as jest.Mock).mock.calls[0][0]).toEqual([0]);
    });
  });

  describe('showCombinatorsBetweenRules', () => {
    it('does not display combinators when there is only one rule', () => {
      schema.showCombinatorsBetweenRules = true;
      props.rules = [{ field: 'test', value: 'Test', operator: '=' }];
      const dom = mount(<RuleGroup {...props} />);
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
      const dom = mount(<RuleGroup {...props} />);
      const sc = dom.find(`.${standardClassnames.betweenRules}`);
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
      const dom = mount(<RuleGroup {...props} />);
      const sc = dom.find(`.${standardClassnames.notToggle}`);
      expect(sc).toHaveLength(0);
    });

    it('has the correct classNames', () => {
      const dom = mount(<RuleGroup {...props} />);
      expect(dom.find(NotToggle).props().className).toContain(standardClassnames.notToggle);
      expect(dom.find(NotToggle).props().className).toContain('custom-notToggle-class');
    });
  });

  describe('showCloneButtons', () => {
    const CloneButton = (props: ActionProps) => <ActionElement {...props} />;

    beforeEach(() => {
      schema.showCloneButtons = true;
      controls.cloneGroupAction = CloneButton;
    });

    it('does not display clone buttons by default', () => {
      schema.showCloneButtons = false;
      const dom = mount(<RuleGroup {...props} />);
      const sc = dom.find(`.${standardClassnames.cloneGroup}`);
      expect(sc).toHaveLength(0);
    });

    it('has the correct classNames', () => {
      const dom = mount(<RuleGroup {...props} />);
      expect(dom.find(CloneButton).props().className).toContain(standardClassnames.cloneGroup);
      expect(dom.find(CloneButton).props().className).toContain('custom-cloneGroup-class');
    });
  });

  describe('independent combinators', () => {
    beforeEach(() => {
      schema.independentCombinators = true;
    });

    it('should render combinator selector for string elements', () => {
      schema.controls.combinatorSelector = ValueSelector;
      const rules: RuleGroupICArray = [
        { field: 'firstName', operator: '=', value: 'Test' },
        'and',
        { rules: [] }
      ];
      const dom = mount(<RuleGroup {...props} rules={rules} />);
      expect(dom.find(ValueSelector).parent().props().className).toMatch(
        new RegExp(standardClassnames.betweenRules)
      );
      expect(dom.find(ValueSelector).props().value).toBe('and');
    });

    it('should call handleOnChange for string elements', () => {
      schema.controls.combinatorSelector = ValueSelector;
      schema.updateIndependentCombinator = jest.fn();
      const rules: RuleGroupICArray = [
        { field: 'firstName', operator: '=', value: 'Test' },
        'and',
        { field: 'lastName', operator: '=', value: 'Test' }
      ];
      const { getByText, getByTitle } = render(<RuleGroup {...props} rules={rules} />);
      userEvent.selectOptions(getByTitle(props.translations.combinators.title), [getByText('OR')]);
      expect(schema.updateIndependentCombinator).toHaveBeenCalledWith('or', [0, 1]);
    });

    it('should clone independent combinator groups', () => {
      schema.controls.cloneGroupAction = ActionElement;
      schema.moveRule = jest.fn();
      schema.showCloneButtons = true;
      const { getByText } = render(<RuleGroup {...props} />);
      userEvent.click(getByText('⧉'));
      expect(schema.moveRule).toHaveBeenCalledWith([0], [1], true);
    });
  });

  describe('validation', () => {
    it('should not validate if no validationMap[id] value exists', () => {
      const dom = mount(<RuleGroup {...props} />);
      expect(dom.find('div').first().hasClass(standardClassnames.valid)).toBe(false);
      expect(dom.find('div').first().hasClass(standardClassnames.invalid)).toBe(false);
    });

    it('should validate to false if validationMap[id] = false', () => {
      schema.validationMap = { id: false };
      const dom = mount(<RuleGroup {...props} />);
      expect(dom.find('div').first().hasClass(standardClassnames.valid)).toBe(false);
      expect(dom.find('div').first().hasClass(standardClassnames.invalid)).toBe(true);
    });

    it('should validate to true if validationMap[id] = true', () => {
      schema.validationMap = { id: true };
      const dom = mount(<RuleGroup {...props} />);
      expect(dom.find('div').first().hasClass(standardClassnames.valid)).toBe(true);
      expect(dom.find('div').first().hasClass(standardClassnames.invalid)).toBe(false);
    });

    it('should pass down validationResult as validation to children', () => {
      const valRes: ValidationResult = { valid: false, reasons: ['invalid'] };
      schema.controls.combinatorSelector = ValueSelector;
      schema.controls.addRuleAction = ActionElement;
      schema.validationMap = { id: valRes };
      const dom = mount(<RuleGroup {...props} />);
      expect(dom.find(ValueSelector).props().validation).toEqual(valRes);
      expect(dom.find(ActionElement).props().validation).toEqual(valRes);
    });
  });

  describe('enableDragAndDrop', () => {
    it('should not have the drag class if not dragging', () => {
      const { getByTestId } = render(<RuleGroup {...props} />);
      const ruleGroup = getByTestId('rule-group');
      expect(ruleGroup.className).not.toContain(standardClassnames.dndDragging);
    });

    it('should have the drag class if dragging', () => {
      const { getByTestId } = render(<RuleGroup {...props} />);
      const ruleGroup = getByTestId('rule-group');
      simulateDrag(getHandlerId(ruleGroup, 'drag'), getDndBackend());
      expect(ruleGroup.className).toContain(standardClassnames.dndDragging);
      act(() => {
        getDndBackend().simulateEndDrag();
      });
    });

    it('should handle a dropped rule group', () => {
      const moveRule = jest.fn();
      props.schema.moveRule = moveRule;
      const { getAllByTestId } = render(
        <div>
          <RuleGroup {...props} path={[0]} />
          <RuleGroup {...props} path={[1]} />
        </div>
      );
      const ruleGroups = getAllByTestId('rule-group');
      simulateDragDrop(
        getHandlerId(ruleGroups[1], 'drag'),
        getHandlerId(ruleGroups[0], 'drop'),
        getDndBackend()
      );
      expect(ruleGroups[0].className).not.toContain(standardClassnames.dndDragging);
      expect(ruleGroups[1].className).not.toContain(standardClassnames.dndOver);
      expect(moveRule).toHaveBeenCalledWith([1], [0, 0]);
    });

    it('should abort move if dropped on itself', () => {
      const moveRule = jest.fn();
      props.schema.moveRule = moveRule;
      const { getByTestId } = render(<RuleGroup {...props} />);
      const ruleGroup = getByTestId('rule-group');
      simulateDragDrop(
        getHandlerId(ruleGroup, 'drag'),
        getHandlerId(ruleGroup, 'drop'),
        getDndBackend()
      );
      expect(ruleGroup.className).not.toContain(standardClassnames.dndDragging);
      expect(ruleGroup.className).not.toContain(standardClassnames.dndOver);
      expect(moveRule).not.toHaveBeenCalled();
    });

    it('should abort move if source item is first child of this group', () => {
      const moveRule = jest.fn();
      props.schema.moveRule = moveRule;
      const { getAllByTestId } = render(<RuleGroup {...props} rules={[{ rules: [] }]} />);
      const ruleGroups = getAllByTestId('rule-group');
      simulateDragDrop(
        getHandlerId(ruleGroups[1], 'drag'),
        getHandlerId(ruleGroups[0], 'drop'),
        getDndBackend()
      );
      expect(moveRule).not.toHaveBeenCalled();
    });

    it('should handle drops on combinator between rules', () => {
      const moveRule = jest.fn();
      props.schema.moveRule = moveRule;
      props.schema.controls.combinatorSelector = ValueSelector;
      props.schema.showCombinatorsBetweenRules = true;
      const { getAllByTestId } = render(
        <div>
          <RuleGroup
            {...props}
            rules={[
              { field: 'firstName', operator: '=', value: '0' },
              { field: 'firstName', operator: '=', value: '1' },
              { field: 'firstName', operator: '=', value: '2' }
            ]}
            path={[0]}
          />
        </div>
      );
      const rules = getAllByTestId('rule');
      const combinatorEls = getAllByTestId('inline-combinator');
      simulateDragDrop(
        getHandlerId(rules[2], 'drag'),
        getHandlerId(combinatorEls[1], 'drop'),
        getDndBackend()
      );
      expect(moveRule).not.toHaveBeenCalled();
      simulateDragDrop(
        getHandlerId(rules[2], 'drag'),
        getHandlerId(combinatorEls[0], 'drop'),
        getDndBackend()
      );
      expect(moveRule).toHaveBeenCalledWith([0, 2], [0, 1]);
    });

    it('should handle drops on independent combinators', () => {
      const moveRule = jest.fn();
      props.schema.moveRule = moveRule;
      props.schema.controls.combinatorSelector = ValueSelector;
      props.schema.independentCombinators = true;
      const { getAllByTestId, getByTestId } = render(
        <div>
          <RuleGroup
            {...props}
            rules={[
              { field: 'firstName', operator: '=', value: 'Steve' },
              'and',
              { field: 'firstName', operator: '=', value: 'Steve' }
            ]}
            path={[0]}
          />
          <RuleGroup {...props} path={[1]} />
        </div>
      );
      const ruleGroups = getAllByTestId('rule-group');
      const combinatorEl = getByTestId('inline-combinator');
      simulateDragDrop(
        getHandlerId(ruleGroups[1], 'drag'),
        getHandlerId(combinatorEl, 'drop'),
        getDndBackend()
      );
      expect(ruleGroups[1].className).not.toContain(standardClassnames.dndDragging);
      expect(combinatorEl.className).not.toContain(standardClassnames.dndOver);
      expect(moveRule).toHaveBeenCalledWith([1], [0, 2]);
    });
  });

  //shared examples
  function behavesLikeAnActionElement(
    label: string,
    defaultClassName: string,
    customClassName: string
  ) {
    it('should have the correct label', () => {
      const dom = mount(<RuleGroup {...props} />);
      expect(dom.find(ActionElement).props().label).toBe(label);
    });

    it('should have the onClick method handler', () => {
      const dom = mount(<RuleGroup {...props} />);
      expect(typeof dom.find(ActionElement).props().handleOnClick).toBe('function');
    });

    behavesLikeAnElementWithClassNames(ActionElement, defaultClassName, customClassName);
  }

  function behavesLikeAnElementWithClassNames(
    element: ComponentType<ActionWithRulesProps & ValueSelectorProps>,
    defaultClassName: string,
    customClassName: string
  ) {
    it('should have the default className', () => {
      const dom = mount(<RuleGroup {...props} />);
      expect(dom.find(element).props().className).toContain(defaultClassName);
    });

    it('should have the custom className', () => {
      const dom = mount(<RuleGroup {...props} />);
      expect(dom.find(element).props().className).toContain(customClassName);
    });

    it('should pass down the existing rules array', () => {
      props.rules = [_createRule(1), _createRule(2)];
      const dom = mount(<RuleGroup {...props} />);
      expect(dom.find(element).props().rules).toEqual(props.rules);
    });

    it('should pass down the level of the element', () => {
      props.rules = [_createRule(1), _createRule(2)];
      const dom = mount(<RuleGroup {...props} />);
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
    rules: RuleGroupArray
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
