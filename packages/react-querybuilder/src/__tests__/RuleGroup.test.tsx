import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { forwardRef } from 'react';
import { simulateDrag, simulateDragDrop, wrapWithTestBackend } from 'react-dnd-test-utils';
import { act } from 'react-dom/test-utils';
import { defaultCombinators, defaultTranslations, standardClassnames, TestID } from '../defaults';
import { Rule } from '../Rule';
import { RuleGroup as RuleGroupOriginal } from '../RuleGroup';
import type {
  ActionProps,
  Classnames,
  Controls,
  RuleGroupArray,
  RuleGroupICArray,
  RuleGroupProps,
  RuleGroupType,
  RuleType,
  Schema,
  ValidationResult,
  ValueSelectorProps,
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
      combinatorSelector: props => (
        <select
          data-testid={TestID.combinators}
          className={props.className}
          title={props.title}
          value={props.value}
          onChange={e => props.handleOnChange(e.target.value)}>
          <option value="and">AND</option>
          <option value="or">OR</option>
          <option value="any_combinator_value">Any Combinator</option>
        </select>
      ),
      addRuleAction: props => (
        <button
          data-testid={TestID.addRule}
          className={props.className}
          onClick={e => props.handleOnClick(e)}>
          +Rule
        </button>
      ),
      addGroupAction: props => (
        <button
          data-testid={TestID.addGroup}
          className={props.className}
          onClick={e => props.handleOnClick(e)}>
          +Group
        </button>
      ),
      cloneGroupAction: props => (
        <button
          data-testid={TestID.cloneGroup}
          className={props.className}
          onClick={e => props.handleOnClick(e)}>
          ⧉
        </button>
      ),
      cloneRuleAction: props => (
        <button
          data-testid={TestID.cloneRule}
          className={props.className}
          onClick={e => props.handleOnClick(e)}>
          ⧉
        </button>
      ),
      removeGroupAction: props => (
        <button
          data-testid={TestID.removeGroup}
          className={props.className}
          onClick={e => props.handleOnClick(e)}>
          x
        </button>
      ),
      removeRuleAction: props => (
        <button
          data-testid={TestID.removeRule}
          className={props.className}
          onClick={e => props.handleOnClick(e)}>
          x
        </button>
      ),
      notToggle: props => (
        <label data-testid={TestID.notToggle} className={props.className}>
          <input type="checkbox" onChange={e => props.handleOnChange(e.target.checked)} />
          Not
        </label>
      ),
      fieldSelector: props => (
        <select
          data-testid={TestID.fields}
          className={props.className}
          value={props.value}
          onChange={e => props.handleOnChange(e.target.value)}>
          <option value={props.options[0].name}>{props.options[0].label}</option>
        </select>
      ),
      operatorSelector: props => (
        <select
          data-testid={TestID.operators}
          className={props.className}
          value={props.value}
          onChange={e => props.handleOnChange(e.target.value)}>
          <option value={props.options[0].name}>{props.options[0].label}</option>
        </select>
      ),
      valueEditor: props => (
        <input
          data-testid={TestID.valueEditor}
          className={props.className}
          value={props.value}
          onChange={e => props.handleOnChange(e.target.value)}
        />
      ),
      rule: Rule,
      ruleGroup: RuleGroup,
      dragHandle: forwardRef(() => <span>:</span>),
    };
    classNames = {
      header: 'custom-header-class',
      body: 'custom-body-class',
      combinators: 'custom-combinators-class',
      addRule: 'custom-addRule-class',
      addGroup: 'custom-addGroup-class',
      cloneGroup: 'custom-cloneGroup-class',
      removeGroup: 'custom-removeGroup-class',
      notToggle: 'custom-notToggle-class',
      ruleGroup: 'custom-ruleGroup-class',
    };
    schema = {
      fields: [{ name: 'field1', label: 'Field 1' }],
      combinators: defaultCombinators,
      controls: controls as Controls,
      classNames: classNames as Classnames,
      getInputType: () => 'text',
      getOperators: () => [{ name: 'operator1', label: 'Operator 1' }],
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
      validationMap: {},
      disabledPaths: [],
    };
    props = {
      id: 'id',
      path: [0],
      rules: [],
      combinator: 'and',
      schema: schema as Schema,
      translations: defaultTranslations,
      disabled: false,
    };
  });

  it('should have correct classNames', () => {
    const { getByTestId } = render(<RuleGroup {...props} />);
    expect(getByTestId(TestID.ruleGroup)).toHaveClass(standardClassnames.ruleGroup);
    expect(getByTestId(TestID.ruleGroup)).toHaveClass('custom-ruleGroup-class');
    expect(
      getByTestId(TestID.ruleGroup).querySelector(`.${standardClassnames.header}`).classList
    ).toContain(classNames.header);
    expect(
      getByTestId(TestID.ruleGroup).querySelector(`.${standardClassnames.body}`).classList
    ).toContain(classNames.body);
  });

  describe('when 2 rules exist', () => {
    beforeEach(() => {
      props.rules = [_createRule(1), _createRule(2)];
    });

    it('has 2 <Rule /> elements', () => {
      const { getAllByTestId } = render(<RuleGroup {...props} />);
      expect(getAllByTestId(TestID.rule)).toHaveLength(2);
    });

    it('has the first rule with the correct values', () => {
      const { getAllByTestId } = render(<RuleGroup {...props} />);
      const firstRule = getAllByTestId(TestID.rule)[0];
      expect(firstRule.dataset.ruleId).toBe('rule_id_1');
      expect(firstRule.querySelector(`.${standardClassnames.fields}`)).toHaveValue('field1');
      expect(firstRule.querySelector(`.${standardClassnames.operators}`)).toHaveValue('operator1');
      expect(firstRule.querySelector(`.${standardClassnames.value}`)).toHaveValue('value_1');
    });
  });

  describe('onCombinatorChange', () => {
    it('calls onPropChange from the schema with expected values', () => {
      schema.onPropChange = jest.fn();
      const { container } = render(<RuleGroup {...props} />);
      userEvent.selectOptions(
        container.querySelector(`.${standardClassnames.combinators}`),
        'any_combinator_value'
      );
      expect(schema.onPropChange).toHaveBeenCalledWith('combinator', 'any_combinator_value', [0]);
    });
  });

  describe('onNotToggleChange', () => {
    it('calls onPropChange from the schema with expected values', () => {
      schema.onPropChange = jest.fn();
      schema.showNotToggle = true;
      const { getByLabelText } = render(<RuleGroup {...props} />);
      userEvent.click(getByLabelText('Not'));
      expect(schema.onPropChange).toHaveBeenCalledWith('not', true, [0]);
    });
  });

  describe('addRule', () => {
    it('calls onRuleAdd from the schema with expected values', () => {
      schema.onRuleAdd = jest.fn();
      const { getByText } = render(<RuleGroup {...props} />);
      userEvent.click(getByText(props.translations.addRule.label));
      const call0 = (schema.onRuleAdd as jest.Mock).mock.calls[0];
      expect(call0[0]).toHaveProperty('id');
      expect(call0[0]).toHaveProperty('field', 'field_0');
      expect(call0[0]).toHaveProperty('operator', 'operator_0');
      expect(call0[0]).toHaveProperty('value', 'value_0');
      expect(call0[1]).toEqual([0]);
    });
  });

  describe('addGroup', () => {
    it('calls onGroupAdd from the schema with expected values', () => {
      schema.onGroupAdd = jest.fn();
      const { getByText } = render(<RuleGroup {...props} />);
      userEvent.click(getByText(props.translations.addGroup.label));
      const call0 = (schema.onGroupAdd as jest.Mock).mock.calls[0];
      expect(call0[0]).toHaveProperty('id');
      expect(call0[0]).toHaveProperty('rules', []);
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
      userEvent.click(getByText(props.translations.cloneRuleGroup.label));
      expect(schema.moveRule).toHaveBeenCalledWith([0], [1], true);
    });
  });

  describe('removeGroup', () => {
    it('calls onGroupRemove from the schema with expected values', () => {
      schema.onGroupRemove = jest.fn();
      const { getByText } = render(<RuleGroup {...props} />);
      userEvent.click(getByText(props.translations.removeGroup.label));
      expect(schema.onGroupRemove).toHaveBeenCalledWith([0]);
    });
  });

  describe('showCombinatorsBetweenRules', () => {
    it('does not display combinators when there is only one rule', () => {
      schema.showCombinatorsBetweenRules = true;
      props.rules = [{ field: 'test', value: 'Test', operator: '=' }];
      const { container } = render(<RuleGroup {...props} />);
      expect(container.querySelectorAll(`.${standardClassnames.combinators}`)).toHaveLength(0);
    });

    it('displays combinators when there is more than one rule', () => {
      schema.showCombinatorsBetweenRules = true;
      props.rules = [
        { rules: [], combinator: 'and' },
        { field: 'test', value: 'Test', operator: '=' },
        { rules: [], combinator: 'and' },
      ];
      const { container } = render(<RuleGroup {...props} />);
      expect(container.querySelectorAll(`.${standardClassnames.combinators}`)).toHaveLength(2);
    });
  });

  describe('showNotToggle', () => {
    beforeEach(() => {
      schema.showNotToggle = true;
    });

    it('does not display NOT toggle by default', () => {
      schema.showNotToggle = false;
      const { container } = render(<RuleGroup {...props} />);
      expect(container.querySelectorAll(`.${standardClassnames.notToggle}`)).toHaveLength(0);
    });

    it('has the correct classNames', () => {
      const { getByTestId } = render(<RuleGroup {...props} />);
      expect(getByTestId(TestID.notToggle)).toHaveClass(
        standardClassnames.notToggle,
        'custom-notToggle-class'
      );
    });
  });

  describe('showCloneButtons', () => {
    beforeEach(() => {
      schema.showCloneButtons = true;
    });

    it('does not display clone buttons by default', () => {
      schema.showCloneButtons = false;
      const { container } = render(<RuleGroup {...props} />);
      expect(container.querySelectorAll(`.${standardClassnames.cloneGroup}`)).toHaveLength(0);
    });

    it('has the correct classNames', () => {
      const { getByTestId } = render(<RuleGroup {...props} />);
      expect(getByTestId(TestID.cloneGroup)).toHaveClass(
        standardClassnames.cloneGroup,
        'custom-cloneGroup-class'
      );
    });
  });

  describe('independent combinators', () => {
    beforeEach(() => {
      schema.independentCombinators = true;
    });

    it('should render combinator selector for string elements', () => {
      const rules: RuleGroupICArray = [
        { field: 'firstName', operator: '=', value: 'Test' },
        'and',
        { rules: [] },
      ];
      const { getByTestId } = render(<RuleGroup {...props} rules={rules} />);
      const inlineCombinator = getByTestId(TestID.inlineCombinator);
      const combinatorSelector = getByTestId(TestID.combinators);
      expect(inlineCombinator).toHaveClass(standardClassnames.betweenRules);
      expect(combinatorSelector).toHaveValue('and');
    });

    it('should call handleOnChange for string elements', () => {
      schema.updateIndependentCombinator = jest.fn();
      const rules: RuleGroupICArray = [
        { field: 'firstName', operator: '=', value: 'Test' },
        'and',
        { field: 'lastName', operator: '=', value: 'Test' },
      ];
      const { getByText, getByTitle } = render(<RuleGroup {...props} rules={rules} />);
      userEvent.selectOptions(getByTitle(props.translations.combinators.title), [getByText('OR')]);
      expect(schema.updateIndependentCombinator).toHaveBeenCalledWith('or', [0, 1]);
    });

    it('should clone independent combinator groups', () => {
      schema.moveRule = jest.fn();
      schema.showCloneButtons = true;
      const { getByText } = render(<RuleGroup {...props} />);
      userEvent.click(getByText(props.translations.cloneRuleGroup.label));
      expect(schema.moveRule).toHaveBeenCalledWith([0], [1], true);
    });
  });

  describe('validation', () => {
    it('should not validate if no validationMap[id] value exists', () => {
      const { getByTestId } = render(<RuleGroup {...props} />);
      expect(getByTestId(TestID.ruleGroup)).not.toHaveClass(standardClassnames.valid);
      expect(getByTestId(TestID.ruleGroup)).not.toHaveClass(standardClassnames.invalid);
    });

    it('should validate to false if validationMap[id] = false', () => {
      schema.validationMap = { id: false };
      const { getByTestId } = render(<RuleGroup {...props} />);
      expect(getByTestId(TestID.ruleGroup)).not.toHaveClass(standardClassnames.valid);
      expect(getByTestId(TestID.ruleGroup)).toHaveClass(standardClassnames.invalid);
    });

    it('should validate to true if validationMap[id] = true', () => {
      schema.validationMap = { id: true };
      const { getByTestId } = render(<RuleGroup {...props} />);
      expect(getByTestId(TestID.ruleGroup)).toHaveClass(standardClassnames.valid);
      expect(getByTestId(TestID.ruleGroup)).not.toHaveClass(standardClassnames.invalid);
    });

    it('should pass down validationResult as validation to children', () => {
      const valRes: ValidationResult = { valid: false, reasons: ['invalid'] };
      schema.controls.combinatorSelector = ({ validation }: ValueSelectorProps) => (
        <div title="ValueSelector">{JSON.stringify(validation)}</div>
      );
      schema.controls.addRuleAction = ({ validation }: ActionProps) => (
        <div title="ActionElement">{JSON.stringify(validation)}</div>
      );
      schema.validationMap = { id: valRes };
      const { getByTitle } = render(<RuleGroup {...props} />);
      expect(getByTitle('ValueSelector').innerHTML).toEqual(JSON.stringify(valRes));
      expect(getByTitle('ActionElement').innerHTML).toEqual(JSON.stringify(valRes));
    });
  });

  describe('enableDragAndDrop', () => {
    it('should not have the drag class if not dragging', () => {
      const { getByTestId } = render(<RuleGroup {...props} />);
      const ruleGroup = getByTestId(TestID.ruleGroup);
      expect(ruleGroup).not.toHaveClass(standardClassnames.dndDragging);
    });

    it('should have the drag class if dragging', () => {
      const { getByTestId } = render(<RuleGroup {...props} />);
      const ruleGroup = getByTestId(TestID.ruleGroup);
      simulateDrag(getHandlerId(ruleGroup, 'drag'), getDndBackend());
      expect(ruleGroup).toHaveClass(standardClassnames.dndDragging);
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
      const ruleGroups = getAllByTestId(TestID.ruleGroup);
      simulateDragDrop(
        getHandlerId(ruleGroups[1], 'drag'),
        getHandlerId(ruleGroups[0], 'drop'),
        getDndBackend()
      );
      expect(ruleGroups[0]).not.toHaveClass(standardClassnames.dndDragging);
      expect(ruleGroups[1]).not.toHaveClass(standardClassnames.dndOver);
      expect(moveRule).toHaveBeenCalledWith([1], [0, 0]);
    });

    it('should abort move if dropped on itself', () => {
      const moveRule = jest.fn();
      props.schema.moveRule = moveRule;
      const { getByTestId } = render(<RuleGroup {...props} />);
      const ruleGroup = getByTestId(TestID.ruleGroup);
      simulateDragDrop(
        getHandlerId(ruleGroup, 'drag'),
        getHandlerId(ruleGroup, 'drop'),
        getDndBackend()
      );
      expect(ruleGroup).not.toHaveClass(standardClassnames.dndDragging);
      expect(ruleGroup).not.toHaveClass(standardClassnames.dndOver);
      expect(moveRule).not.toHaveBeenCalled();
    });

    it('should abort move if source item is first child of this group', () => {
      const moveRule = jest.fn();
      props.schema.moveRule = moveRule;
      const { getAllByTestId } = render(<RuleGroup {...props} rules={[{ rules: [] }]} />);
      const ruleGroups = getAllByTestId(TestID.ruleGroup);
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
      props.schema.showCombinatorsBetweenRules = true;
      const { getAllByTestId } = render(
        <div>
          <RuleGroup
            {...props}
            rules={[
              { field: 'firstName', operator: '=', value: '0' },
              { field: 'firstName', operator: '=', value: '1' },
              { field: 'firstName', operator: '=', value: '2' },
            ]}
            path={[0]}
          />
        </div>
      );
      const rules = getAllByTestId(TestID.rule);
      const combinatorEls = getAllByTestId(TestID.inlineCombinator);
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

    it('should handle rule group drops on independent combinators', () => {
      const moveRule = jest.fn();
      props.schema.moveRule = moveRule;
      props.schema.independentCombinators = true;
      const { getAllByTestId, getByTestId } = render(
        <div>
          <RuleGroup
            {...props}
            rules={[
              { field: 'firstName', operator: '=', value: 'Steve' },
              'and',
              { field: 'lastName', operator: '=', value: 'Vai' },
            ]}
            path={[0]}
          />
          <RuleGroup {...props} path={[1]} />
        </div>
      );
      const ruleGroups = getAllByTestId(TestID.ruleGroup);
      const combinatorEl = getByTestId(TestID.inlineCombinator);
      simulateDragDrop(
        getHandlerId(ruleGroups[1], 'drag'),
        getHandlerId(combinatorEl, 'drop'),
        getDndBackend()
      );
      expect(ruleGroups[1]).not.toHaveClass(standardClassnames.dndDragging);
      expect(combinatorEl).not.toHaveClass(standardClassnames.dndOver);
      expect(moveRule).toHaveBeenCalledWith([1], [0, 1]);
    });

    it('should handle rule drops on independent combinators', () => {
      const moveRule = jest.fn();
      props.schema.moveRule = moveRule;
      props.schema.independentCombinators = true;
      const { getAllByTestId } = render(
        <RuleGroup
          {...props}
          rules={[
            { field: 'firstName', operator: '=', value: 'Steve' },
            'and',
            { field: 'lastName', operator: '=', value: 'Vai' },
            'and',
            { field: 'age', operator: '>', value: 28 },
          ]}
          path={[0]}
        />
      );
      const rules = getAllByTestId(TestID.rule);
      const combinatorEls = getAllByTestId(TestID.inlineCombinator);
      simulateDragDrop(
        getHandlerId(rules[2], 'drag'),
        getHandlerId(combinatorEls[0], 'drop'),
        getDndBackend()
      );
      expect(moveRule).toHaveBeenCalledWith([0, 4], [0, 1]);
    });
  });

  describe('disabled', () => {
    beforeEach(() => {
      schema.showCloneButtons = true;
      schema.showNotToggle = true;
      schema.onRuleAdd = jest.fn();
      schema.onRuleRemove = jest.fn();
      schema.onGroupAdd = jest.fn();
      schema.onGroupRemove = jest.fn();
      schema.onPropChange = jest.fn();
      schema.moveRule = jest.fn();
    });

    it('does not try to update the query', () => {
      const { getAllByTestId, getByTestId } = render(
        <RuleGroup
          {...props}
          disabled
          combinator="and"
          rules={[
            { field: 'firstName', operator: '=', value: 'Steve' },
            { field: 'lastName', operator: '=', value: 'Vai' },
          ]}
        />
      );
      userEvent.click(getByTestId(TestID.addRule));
      userEvent.click(getByTestId(TestID.addGroup));
      userEvent.click(getByTestId(TestID.cloneGroup));
      userEvent.click(getByTestId(TestID.removeGroup));
      userEvent.click(getByTestId(TestID.notToggle));
      userEvent.click(getAllByTestId(TestID.cloneRule)[0]);
      userEvent.click(getAllByTestId(TestID.removeRule)[0]);
      userEvent.selectOptions(getByTestId(TestID.combinators), 'or');
      expect(schema.onRuleAdd).not.toHaveBeenCalled();
      expect(schema.onGroupAdd).not.toHaveBeenCalled();
      expect(schema.onGroupRemove).not.toHaveBeenCalled();
      expect(schema.onPropChange).not.toHaveBeenCalled();
      expect(schema.moveRule).not.toHaveBeenCalled();
    });

    it('does not try to update independent combinators', () => {
      schema.independentCombinators = true;
      schema.updateIndependentCombinator = jest.fn();
      const { getByTestId } = render(
        <RuleGroup
          {...props}
          disabled
          rules={[
            { field: 'firstName', operator: '=', value: 'Steve' },
            'and',
            { field: 'lastName', operator: '=', value: 'Vai' },
          ]}
        />
      );
      userEvent.selectOptions(getByTestId(TestID.combinators), 'or');
      expect(schema.updateIndependentCombinator).not.toHaveBeenCalled();
    });
  });

  // helper functions
  const _createRule = (index: number): RuleType => {
    return {
      id: `rule_id_${index}`,
      field: `field_${index}`,
      operator: `operator_${index}`,
      value: `value_${index}`,
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
      combinator: undefined,
    };
  };
});
