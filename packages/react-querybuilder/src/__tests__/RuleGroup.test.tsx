import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { forwardRef } from 'react';
import { simulateDrag, simulateDragDrop, wrapWithTestBackend } from 'react-dnd-test-utils';
import { act } from 'react-dom/test-utils';
import { defaultCombinators, defaultTranslations, standardClassnames } from '../defaults';
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
        <select
          className={props.className}
          title={props.title}
          value={props.value}
          onChange={(e) => props.handleOnChange(e.target.value)}>
          <option value="and">AND</option>
          <option value="or">OR</option>
          <option value="any_combinator_value">Any Combinator</option>
        </select>
      ),
      addRuleAction: (props) => (
        <button className={props.className} onClick={(e) => props.handleOnClick(e)}>
          +Rule
        </button>
      ),
      addGroupAction: (props) => (
        <button className={props.className} onClick={(e) => props.handleOnClick(e)}>
          +Group
        </button>
      ),
      cloneGroupAction: (props) => (
        <button className={props.className} onClick={(e) => props.handleOnClick(e)}>
          ⧉
        </button>
      ),
      cloneRuleAction: (props) => (
        <button className={props.className} onClick={(e) => props.handleOnClick(e)}>
          ⧉
        </button>
      ),
      removeGroupAction: (props) => (
        <button className={props.className} onClick={(e) => props.handleOnClick(e)}>
          x
        </button>
      ),
      removeRuleAction: (props) => (
        <button className={props.className} onClick={(e) => props.handleOnClick(e)}>
          x
        </button>
      ),
      notToggle: (props) => (
        <label className={props.className}>
          <input type="checkbox" onChange={(e) => props.handleOnChange(e.target.checked)} />
          Not
        </label>
      ),
      fieldSelector: (props) => (
        <select
          className={props.className}
          value={props.value}
          onChange={(e) => props.handleOnChange(e.target.value)}>
          <option value={props.options[0].name}>{props.options[0].label}</option>
        </select>
      ),
      operatorSelector: (props) => (
        <select
          className={props.className}
          value={props.value}
          onChange={(e) => props.handleOnChange(e.target.value)}>
          <option value={props.options[0].name}>{props.options[0].label}</option>
        </select>
      ),
      valueEditor: (props) => (
        <input
          className={props.className}
          value={props.value}
          onChange={(e) => props.handleOnChange(e.target.value)}
        />
      ),
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
      notToggle: 'custom-notToggle-class',
      ruleGroup: 'custom-ruleGroup-class'
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

  it('should have correct classNames', () => {
    const { getByTestId } = render(<RuleGroup {...props} />);
    expect(getByTestId('rule-group').classList).toContain(standardClassnames.ruleGroup);
    expect(getByTestId('rule-group').classList).toContain('custom-ruleGroup-class');
    expect(
      getByTestId('rule-group').querySelector(`.${standardClassnames.header}`).classList
    ).toContain(classNames.header);
    expect(
      getByTestId('rule-group').querySelector(`.${standardClassnames.body}`).classList
    ).toContain(classNames.body);
  });

  describe('when 2 rules exist', () => {
    beforeEach(() => {
      props.rules = [_createRule(1), _createRule(2)];
    });

    it('has 2 <Rule /> elements', () => {
      const { getAllByTestId } = render(<RuleGroup {...props} />);
      expect(getAllByTestId('rule')).toHaveLength(2);
    });

    it('has the first rule with the correct values', () => {
      const { getAllByTestId } = render(<RuleGroup {...props} />);
      const firstRule = getAllByTestId('rule')[0];
      expect(firstRule.dataset.ruleId).toBe('rule_id_1');
      expect(
        (firstRule.querySelector(`.${standardClassnames.fields}`) as HTMLSelectElement).value
      ).toBe('field1');
      expect(
        (firstRule.querySelector(`.${standardClassnames.operators}`) as HTMLSelectElement).value
      ).toBe('operator1');
      expect(
        (firstRule.querySelector(`.${standardClassnames.value}`) as HTMLInputElement).value
      ).toBe('value_1');
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
      const { container } = render(<RuleGroup {...props} />);
      userEvent.click(container.querySelector(`.${standardClassnames.addRule}`));
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
      const { container } = render(<RuleGroup {...props} />);
      userEvent.click(container.querySelector(`.${standardClassnames.addGroup}`));
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
      userEvent.click(getByText('⧉'));
      expect(schema.moveRule).toHaveBeenCalledWith([0], [1], true);
    });
  });

  describe('removeGroup', () => {
    it('calls onGroupRemove from the schema with expected values', () => {
      schema.onGroupRemove = jest.fn();
      const { container } = render(<RuleGroup {...props} />);
      userEvent.click(container.querySelector(`.${standardClassnames.removeGroup}`));
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
        { rules: [], combinator: 'and' }
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
      const { container } = render(<RuleGroup {...props} />);
      expect(container.querySelector(`.${standardClassnames.notToggle}`).classList).toContain(
        standardClassnames.notToggle
      );
      expect(container.querySelector(`.${standardClassnames.notToggle}`).classList).toContain(
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
      const { container } = render(<RuleGroup {...props} />);
      expect(container.querySelector(`.${standardClassnames.cloneGroup}`).classList).toContain(
        standardClassnames.cloneGroup
      );
      expect(container.querySelector(`.${standardClassnames.cloneGroup}`).classList).toContain(
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
        { rules: [] }
      ];
      const { container } = render(<RuleGroup {...props} rules={rules} />);
      const combinatorSelector = container.querySelector(
        `.${standardClassnames.combinators}`
      ) as HTMLSelectElement;
      expect(combinatorSelector.parentElement.classList).toContain(standardClassnames.betweenRules);
      expect(combinatorSelector.value).toBe('and');
    });

    it('should call handleOnChange for string elements', () => {
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
      expect(getByTestId('rule-group').classList).not.toContain(standardClassnames.valid);
      expect(getByTestId('rule-group').classList).not.toContain(standardClassnames.invalid);
    });

    it('should validate to false if validationMap[id] = false', () => {
      schema.validationMap = { id: false };
      const { getByTestId } = render(<RuleGroup {...props} />);
      expect(getByTestId('rule-group').classList).not.toContain(standardClassnames.valid);
      expect(getByTestId('rule-group').classList).toContain(standardClassnames.invalid);
    });

    it('should validate to true if validationMap[id] = true', () => {
      schema.validationMap = { id: true };
      const { getByTestId } = render(<RuleGroup {...props} />);
      expect(getByTestId('rule-group').classList).toContain(standardClassnames.valid);
      expect(getByTestId('rule-group').classList).not.toContain(standardClassnames.invalid);
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
      const ruleGroup = getByTestId('rule-group');
      expect(ruleGroup.classList).not.toContain(standardClassnames.dndDragging);
    });

    it('should have the drag class if dragging', () => {
      const { getByTestId } = render(<RuleGroup {...props} />);
      const ruleGroup = getByTestId('rule-group');
      simulateDrag(getHandlerId(ruleGroup, 'drag'), getDndBackend());
      expect(ruleGroup.classList).toContain(standardClassnames.dndDragging);
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
      expect(ruleGroups[0].classList).not.toContain(standardClassnames.dndDragging);
      expect(ruleGroups[1].classList).not.toContain(standardClassnames.dndOver);
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
      expect(ruleGroup.classList).not.toContain(standardClassnames.dndDragging);
      expect(ruleGroup.classList).not.toContain(standardClassnames.dndOver);
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
              { field: 'lastName', operator: '=', value: 'Vai' }
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
      expect(ruleGroups[1].classList).not.toContain(standardClassnames.dndDragging);
      expect(combinatorEl.classList).not.toContain(standardClassnames.dndOver);
      expect(moveRule).toHaveBeenCalledWith([1], [0, 2]);
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
            { field: 'age', operator: '>', value: 28 }
          ]}
          path={[0]}
        />
      );
      const rules = getAllByTestId('rule');
      const combinatorEls = getAllByTestId('inline-combinator');
      simulateDragDrop(
        getHandlerId(rules[2], 'drag'),
        getHandlerId(combinatorEls[0], 'drop'),
        getDndBackend()
      );
      expect(moveRule).toHaveBeenCalledWith([0, 4], [0, 2]);
    });
  });

  // helper functions
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
