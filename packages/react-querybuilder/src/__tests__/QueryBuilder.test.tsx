import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mount, ReactWrapper } from 'enzyme';
import { simulateDragDrop, wrapWithTestBackend } from 'react-dnd-test-utils';
import { act } from 'react-dom/test-utils';
import { defaultTranslations } from '..';
import { standardClassnames } from '../defaults';
import { QueryBuilder as QueryBuilderOriginal } from '../QueryBuilder';
import { Rule } from '../Rule';
import { RuleGroup } from '../RuleGroup';
import {
  Field,
  NameLabelPair,
  RuleGroupType,
  RuleGroupTypeIC,
  RuleType,
  ValidationMap
} from '../types';
import { defaultValidator, formatQuery } from '../utils';

const [QueryBuilder, getDndBackend] = wrapWithTestBackend(QueryBuilderOriginal);

const getHandlerId = (el: HTMLElement, dragDrop: 'drag' | 'drop') => () =>
  el.getAttribute(`data-${dragDrop}monitorid`);

const stripQueryIds = (query: any) => JSON.parse(formatQuery(query, 'json_without_ids') as string);

describe('<QueryBuilder />', () => {
  it('should exist', () => {
    expect(QueryBuilder).toBeDefined();
  });

  describe('when rendered', () => {
    let wrapper: ReactWrapper;

    beforeEach(() => {
      wrapper = mount(<QueryBuilder />);
    });

    afterEach(() => {
      wrapper.unmount();
    });

    it('should have the correct className', () => {
      expect(wrapper.find('div').first().hasClass(standardClassnames.queryBuilder)).toBe(true);
    });

    it('should render the root RuleGroup', () => {
      expect(wrapper.find(RuleGroup)).toHaveLength(1);
    });

    it('should show the list of combinators in the RuleGroup', () => {
      const options = wrapper.find('select option');
      expect(options).toHaveLength(2); // and, or
    });
  });

  describe('when rendered with defaultQuery only', () => {
    it('changes the query in uncontrolled state', () => {
      const { container } = render(
        <QueryBuilder
          defaultQuery={{
            combinator: 'and',
            rules: [{ field: 'firstName', operator: '=', value: 'Steve' }]
          }}
        />
      );
      expect(container.getElementsByClassName(standardClassnames.rule)).toHaveLength(1);
      userEvent.click(container.getElementsByClassName(standardClassnames.addRule)[0]);
      expect(container.getElementsByClassName(standardClassnames.rule)).toHaveLength(2);
    });
  });

  describe('when rendered with onQueryChange callback', () => {
    let wrapper: ReactWrapper, onQueryChange: jest.Mock;

    beforeEach(() => {
      onQueryChange = jest.fn();
      act(() => {
        wrapper = mount(<QueryBuilder onQueryChange={onQueryChange} />);
      });
    });

    afterEach(() => {
      wrapper.unmount();
      onQueryChange.mockReset();
    });

    it('should call onQueryChange with query', () => {
      expect(onQueryChange).toHaveBeenCalledTimes(1);
      const query: RuleGroupType = {
        combinator: 'and',
        rules: [],
        not: false
      };
      expect(onQueryChange.mock.calls[0][0]).toMatchObject(query);
    });
  });

  describe('when initial query, without fields, is provided create rule should work', () => {
    let wrapper: ReactWrapper;

    beforeEach(() => {
      act(() => {
        wrapper = mount(<QueryBuilder />);
      });
    });

    afterEach(() => {
      wrapper.unmount();
    });

    it('should be able to create rule on add rule click', () => {
      wrapper.find(`.${standardClassnames.addRule}`).first().simulate('click');
      expect(wrapper.find(Rule)).toHaveLength(1);
    });
  });

  describe('when initial query, with duplicate fields, is provided', () => {
    let wrapper: ReactWrapper;

    beforeEach(() => {
      act(() => {
        wrapper = mount(
          <QueryBuilder
            fields={[
              { name: 'dupe', label: 'One' },
              { name: 'dupe', label: 'Two' }
            ]}
          />
        );
      });
    });

    afterEach(() => {
      wrapper.unmount();
    });

    it('passes down a unique set of fields (by name)', () => {
      wrapper.find(`.${standardClassnames.addRule}`).first().simulate('click');
      expect(wrapper.find(Rule)).toHaveLength(1);
      expect(wrapper.find(Rule).props().schema.fields).toHaveLength(1);
    });
  });

  describe('when initial query, without ID, is provided', () => {
    let wrapper: ReactWrapper;
    const queryWithoutID: RuleGroupType = {
      combinator: 'and',
      not: false,
      rules: [
        {
          field: 'firstName',
          value: 'Test without ID',
          operator: '='
        }
      ]
    };

    const fields: Field[] = [
      { name: 'firstName', label: 'First Name' },
      { name: 'lastName', label: 'Last Name' },
      { name: 'age', label: 'Age' }
    ];

    beforeEach(() => {
      act(() => {
        wrapper = mount(<QueryBuilder query={queryWithoutID as RuleGroupType} fields={fields} />);
      });
    });

    afterEach(() => {
      wrapper.unmount();
    });

    it('should contain a <Rule />', () => {
      const rule = wrapper.find(Rule);
      expect(rule).toHaveLength(1);
    });

    it('should have the Rule with the correct props', () => {
      const rule = wrapper.find(Rule);
      expect(rule.props().field).toBe('firstName');
      expect(rule.props().value).toBe('Test without ID');
      expect(rule.props().operator).toBe('=');
    });

    it('should have a select control with the provided fields', () => {
      const rule = wrapper.find(Rule);
      expect(rule.find(`.${standardClassnames.fields} option`)).toHaveLength(3);
    });

    it('should have a field selector with the correct field', () => {
      const rule = wrapper.find(Rule);
      expect(rule.find(`.${standardClassnames.fields} select`).props().value).toBe('firstName');
    });

    it('should have an operator selector with the correct operator', () => {
      const rule = wrapper.find(Rule);
      expect(rule.find(`.${standardClassnames.operators} select`).props().value).toBe('=');
    });

    it('should have an input control with the correct value', () => {
      const rule = wrapper.find(Rule);
      expect(rule.find('input').props().value).toBe('Test without ID');
    });
  });

  describe('when initial operators are provided', () => {
    let wrapper: ReactWrapper;
    const operators: NameLabelPair[] = [
      { name: 'null', label: 'Custom Is Null' },
      { name: 'notNull', label: 'Is Not Null' },
      { name: 'in', label: 'In' },
      { name: 'notIn', label: 'Not In' }
    ];

    const fields: Field[] = [
      { name: 'firstName', label: 'First Name' },
      { name: 'lastName', label: 'Last Name' },
      { name: 'age', label: 'Age' }
    ];

    const query: RuleGroupType = {
      combinator: 'and',
      not: false,
      rules: [
        {
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

    it('should use the given operators', () => {
      const operatorOptions = wrapper.find(Rule).find(`.${standardClassnames.operators} option`);
      expect(operatorOptions).toHaveLength(4);
    });

    it('should match the label of the first operator', () => {
      const operatorOption = wrapper
        .find(Rule)
        .find(`.${standardClassnames.operators} option`)
        .first();
      expect(operatorOption.text()).toBe('Custom Is Null');
    });
  });

  describe('when getOperators fn prop is provided', () => {
    let wrapper: ReactWrapper, getOperators: jest.Mock;

    const fields: Field[] = [
      { name: 'firstName', label: 'First Name' },
      { name: 'lastName', label: 'Last Name' },
      { name: 'age', label: 'Age' }
    ];

    const query: RuleGroupType = {
      combinator: 'or',
      not: false,
      rules: [
        {
          field: 'lastName',
          value: 'Another Test',
          operator: '='
        }
      ]
    };

    beforeEach(() => {
      getOperators = jest.fn(() => [
        { name: 'custom-operator-1', label: 'Op. 1' },
        { name: 'custom-operator-2', label: 'Op. 2' },
        { name: 'custom-operator-3', label: 'Op. 3' }
      ]);
      wrapper = mount(<QueryBuilder query={query} fields={fields} getOperators={getOperators} />);
    });

    afterEach(() => {
      wrapper.unmount();
      getOperators.mockReset();
    });

    it('should invoke custom getOperators function', () => {
      expect(getOperators).toHaveBeenCalled();
    });

    it('should handle invalid getOperators function', () => {
      wrapper.unmount();
      wrapper = mount(<QueryBuilder query={query} fields={fields} getOperators={() => null} />);
      const operators = wrapper.find(`.${standardClassnames.operators} option`);
      expect(operators.first().props().value).toBe('=');
    });
  });

  describe('when getValueEditorType fn prop is provided', () => {
    let wrapper: ReactWrapper, getValueEditorType: jest.Mock;

    const fields: Field[] = [
      { name: 'firstName', label: 'First Name' },
      { name: 'lastName', label: 'Last Name' },
      { name: 'age', label: 'Age' }
    ];

    const query: RuleGroupType = {
      combinator: 'or',
      not: false,
      rules: [
        {
          field: 'lastName',
          value: 'Another Test',
          operator: '='
        }
      ]
    };

    beforeEach(() => {
      getValueEditorType = jest.fn(() => 'text');
      wrapper = mount(
        <QueryBuilder query={query} fields={fields} getValueEditorType={getValueEditorType} />
      );
    });

    afterEach(() => {
      wrapper.unmount();
      getValueEditorType.mockReset();
    });

    it('should invoke custom getValueEditorType function', () => {
      expect(getValueEditorType).toHaveBeenCalled();
    });

    it('should handle invalid getValueEditorType function', () => {
      wrapper.unmount();
      wrapper = mount(
        <QueryBuilder query={query} fields={fields} getValueEditorType={() => null} />
      );
      const valueEditor = wrapper.find(`.${standardClassnames.value}`);
      expect(valueEditor.first().props().type).toBe('text');
    });
  });

  describe('when getInputType fn prop is provided', () => {
    let wrapper: ReactWrapper, getInputType: jest.Mock;

    const fields: Field[] = [
      { name: 'firstName', label: 'First Name' },
      { name: 'lastName', label: 'Last Name' },
      { name: 'age', label: 'Age' }
    ];

    const query: RuleGroupType = {
      combinator: 'or',
      not: false,
      rules: [
        {
          field: 'lastName',
          value: 'Another Test',
          operator: '='
        }
      ]
    };

    beforeEach(() => {
      getInputType = jest.fn(() => 'text');
      wrapper = mount(<QueryBuilder query={query} fields={fields} getInputType={getInputType} />);
    });

    afterEach(() => {
      wrapper.unmount();
      getInputType.mockReset();
    });

    it('should invoke custom getInputType function', () => {
      expect(getInputType).toHaveBeenCalled();
    });

    it('should handle invalid getInputType function', () => {
      wrapper.unmount();
      wrapper = mount(<QueryBuilder query={query} fields={fields} getInputType={() => null} />);
      const valueEditor = wrapper.find(`.${standardClassnames.value}`);
      expect(valueEditor.first().props().type).toBe('text');
    });
  });

  describe('when getValues fn prop is provided', () => {
    let wrapper: ReactWrapper, getValues: jest.Mock;
    const getValueEditorType = () => 'select' as const;

    const fields: Field[] = [
      { name: 'firstName', label: 'First Name' },
      { name: 'lastName', label: 'Last Name' },
      { name: 'age', label: 'Age' }
    ];

    const query: RuleGroupType = {
      combinator: 'or',
      not: false,
      rules: [
        {
          field: 'lastName',
          value: 'Another Test',
          operator: '='
        }
      ]
    };

    beforeEach(() => {
      getValues = jest.fn(() => [{ name: 'test', label: 'Test' }]);
      wrapper = mount(
        <QueryBuilder
          query={query}
          fields={fields}
          getValueEditorType={getValueEditorType}
          getValues={getValues}
        />
      );
    });

    afterEach(() => {
      wrapper.unmount();
      getValues.mockReset();
    });

    it('should invoke custom getValues function', () => {
      expect(getValues).toHaveBeenCalled();
    });

    it('should generate the correct number of options', () => {
      const opts = wrapper.find(`.${standardClassnames.value} option`);
      expect(opts).toHaveLength(1);
    });

    it('should handle invalid getValues function', () => {
      wrapper.unmount();
      wrapper = mount(<QueryBuilder query={query} fields={fields} getValues={() => null} />);
      const select = wrapper.find(`.${standardClassnames.value}`);
      expect(select.length).toBeGreaterThan(0);
      const opts = wrapper.find(`.${standardClassnames.value} option`);
      expect(opts).toHaveLength(0);
    });
  });

  describe('actions', () => {
    let wrapper: ReactWrapper, onQueryChange: jest.Mock;
    const fields: Field[] = [
      { name: 'field1', label: 'Field 1' },
      { name: 'field2', label: 'Field 2' }
    ];

    beforeEach(() => {
      onQueryChange = jest.fn();
      wrapper = mount(<QueryBuilder fields={fields} onQueryChange={onQueryChange} />);
    });

    afterEach(() => {
      wrapper.unmount();
      onQueryChange.mockReset();
    });

    it('should create a new rule and remove that rule', () => {
      wrapper.find(`.${standardClassnames.addRule}`).first().simulate('click');

      expect(wrapper.find(Rule)).toHaveLength(1);
      expect(onQueryChange.mock.calls[0][0].rules).toHaveLength(0);
      expect(onQueryChange.mock.calls[1][0].rules).toHaveLength(1);

      wrapper.find(`.${standardClassnames.removeRule}`).first().simulate('click');

      expect(wrapper.find(Rule)).toHaveLength(0);
      expect(onQueryChange.mock.calls[2][0].rules).toHaveLength(0);
    });

    it('should create a new group and remove that group', () => {
      wrapper.find(`.${standardClassnames.addGroup}`).first().simulate('click');

      expect(wrapper.find(RuleGroup)).toHaveLength(2);
      expect(onQueryChange.mock.calls[0][0].rules).toHaveLength(0);
      expect(onQueryChange.mock.calls[1][0].rules).toHaveLength(1);
      expect(onQueryChange.mock.calls[1][0].rules[0].combinator).not.toBeUndefined();

      wrapper.find(`.${standardClassnames.removeGroup}`).first().simulate('click');

      expect(wrapper.find(RuleGroup)).toHaveLength(1);
      expect(onQueryChange.mock.calls[2][0].rules).toHaveLength(0);
    });

    it('should create a new rule and change the fields', () => {
      wrapper.find(`.${standardClassnames.addRule}`).first().simulate('click');

      expect(wrapper.find(Rule)).toHaveLength(1);
      expect(onQueryChange.mock.calls[0][0].rules).toHaveLength(0);
      expect(onQueryChange.mock.calls[1][0].rules).toHaveLength(1);

      wrapper
        .find(`.${standardClassnames.fields}`)
        .first()
        .simulate('change', { target: { value: 'field2' } });

      expect(onQueryChange.mock.calls[2][0].rules[0].field).toBe('field2');
    });

    it('should create a new rule and change the operator', () => {
      wrapper.find(`.${standardClassnames.addRule}`).first().simulate('click');

      expect(wrapper.find(Rule)).toHaveLength(1);
      expect(onQueryChange.mock.calls[0][0].rules).toHaveLength(0);
      expect(onQueryChange.mock.calls[1][0].rules).toHaveLength(1);

      wrapper
        .find(`.${standardClassnames.operators}`)
        .first()
        .simulate('change', { target: { value: '!=' } });

      expect(onQueryChange.mock.calls[2][0].rules[0].operator).toBe('!=');
    });

    it('should change the combinator of the root group', () => {
      expect(wrapper.find(RuleGroup)).toHaveLength(1);
      expect(onQueryChange.mock.calls[0][0].rules).toHaveLength(0);

      wrapper
        .find(`select.${standardClassnames.combinators}`)
        .simulate('change', { target: { value: 'or' } });

      expect(onQueryChange.mock.calls[1][0].rules).toHaveLength(0);
      expect(onQueryChange.mock.calls[1][0].combinator).toBe('or');
    });

    it('should set default value for a rule', () => {
      wrapper.setProps({
        fields,
        onQueryChange,
        getValues: (field: string) => {
          if (field === 'field1') {
            return [
              { name: 'value1', label: 'Value 1' },
              { name: 'value2', label: 'Value 2' }
            ];
          }

          return [];
        },
        getValueEditorType: (field: string) => {
          if (field === 'field2') return 'checkbox';

          return 'text';
        }
      });

      wrapper.find(`.${standardClassnames.addRule}`).first().simulate('click');

      expect(onQueryChange.mock.calls[1][0].rules).toHaveLength(1);
      expect(onQueryChange.mock.calls[1][0].rules[0].value).toBe('value1');

      wrapper
        .find(`.${standardClassnames.fields}`)
        .first()
        .simulate('change', { target: { value: 'field2' } });

      expect(onQueryChange.mock.calls[2][0].rules[0].field).toBe('field2');
      expect(onQueryChange.mock.calls[2][0].rules[0].value).toBe(false);

      wrapper.setProps({
        fields: fields.slice(1),
        onQueryChange,
        getValueEditorType: (field: string) => {
          if (field === 'field2') return 'checkbox';

          return 'text';
        }
      });

      wrapper.find(`.${standardClassnames.addRule}`).first().simulate('click');

      expect(onQueryChange.mock.calls[3][0].rules).toHaveLength(2);
      expect(onQueryChange.mock.calls[3][0].rules[0].value).toBe(false);
    });
  });

  describe('resetOnFieldChange prop', () => {
    let wrapper: ReactWrapper, onQueryChange: jest.Mock;
    const fields: Field[] = [
      { name: 'field1', label: 'Field 1' },
      { name: 'field2', label: 'Field 2' }
    ];

    beforeEach(() => {
      onQueryChange = jest.fn();
      wrapper = mount(<QueryBuilder fields={fields} onQueryChange={onQueryChange} />);
    });

    afterEach(() => {
      wrapper.unmount();
      onQueryChange.mockReset();
    });

    it('resets the operator and value when true', () => {
      wrapper.find(`.${standardClassnames.addRule}`).first().simulate('click');
      wrapper
        .find(`.${standardClassnames.operators}`)
        .first()
        .simulate('change', { target: { value: '>' } });
      wrapper
        .find(`.${standardClassnames.value}`)
        .first()
        .simulate('change', { target: { value: 'Test' } });
      wrapper
        .find(`.${standardClassnames.fields}`)
        .first()
        .simulate('change', { target: { value: 'field2' } });

      expect(onQueryChange.mock.calls[3][0].rules[0].operator).toBe('>');
      expect(onQueryChange.mock.calls[3][0].rules[0].value).toBe('Test');
      expect(onQueryChange.mock.calls[4][0].rules[0].operator).toBe('=');
      expect(onQueryChange.mock.calls[4][0].rules[0].value).toBe('');
    });

    it('does not reset the operator and value when false', () => {
      wrapper.setProps({ resetOnFieldChange: false });
      wrapper.find(`.${standardClassnames.addRule}`).first().simulate('click');
      wrapper
        .find(`.${standardClassnames.operators}`)
        .first()
        .simulate('change', { target: { value: '>' } });
      wrapper
        .find(`.${standardClassnames.value}`)
        .first()
        .simulate('change', { target: { value: 'Test' } });
      wrapper
        .find(`.${standardClassnames.fields}`)
        .first()
        .simulate('change', { target: { value: 'field2' } });

      expect(onQueryChange.mock.calls[3][0].rules[0].operator).toBe('>');
      expect(onQueryChange.mock.calls[3][0].rules[0].value).toBe('Test');
      expect(onQueryChange.mock.calls[4][0].rules[0].operator).toBe('>');
      expect(onQueryChange.mock.calls[4][0].rules[0].value).toBe('Test');
    });
  });

  describe('resetOnOperatorChange prop', () => {
    let wrapper: ReactWrapper, onQueryChange: jest.Mock;
    const fields: Field[] = [
      { name: 'field1', label: 'Field 1' },
      { name: 'field2', label: 'Field 2' }
    ];

    beforeEach(() => {
      onQueryChange = jest.fn();
      wrapper = mount(<QueryBuilder fields={fields} onQueryChange={onQueryChange} />);
    });

    afterEach(() => {
      wrapper.unmount();
      onQueryChange.mockReset();
    });

    it('resets the value when true', () => {
      wrapper.setProps({ resetOnOperatorChange: true });
      wrapper.find(`.${standardClassnames.addRule}`).first().simulate('click');
      wrapper
        .find(`.${standardClassnames.operators}`)
        .first()
        .simulate('change', { target: { value: '>' } });
      wrapper
        .find(`.${standardClassnames.value}`)
        .first()
        .simulate('change', { target: { value: 'Test' } });
      wrapper
        .find(`.${standardClassnames.operators}`)
        .first()
        .simulate('change', { target: { value: '=' } });

      expect(onQueryChange.mock.calls[3][0].rules[0].operator).toBe('>');
      expect(onQueryChange.mock.calls[3][0].rules[0].value).toBe('Test');
      expect(onQueryChange.mock.calls[4][0].rules[0].operator).toBe('=');
      expect(onQueryChange.mock.calls[4][0].rules[0].value).toBe('');
    });

    it('does not reset the value when false', () => {
      wrapper.setProps({ resetOnOperatorChange: false });
      wrapper.find(`.${standardClassnames.addRule}`).first().simulate('click');
      wrapper
        .find(`.${standardClassnames.operators}`)
        .first()
        .simulate('change', { target: { value: '>' } });
      wrapper
        .find(`.${standardClassnames.value}`)
        .first()
        .simulate('change', { target: { value: 'Test' } });
      wrapper
        .find(`.${standardClassnames.operators}`)
        .first()
        .simulate('change', { target: { value: '=' } });

      expect(onQueryChange.mock.calls[3][0].rules[0].operator).toBe('>');
      expect(onQueryChange.mock.calls[3][0].rules[0].value).toBe('Test');
      expect(onQueryChange.mock.calls[4][0].rules[0].operator).toBe('=');
      expect(onQueryChange.mock.calls[4][0].rules[0].value).toBe('Test');
    });
  });

  describe('getDefaultField prop', () => {
    let wrapper: ReactWrapper, onQueryChange: jest.Mock;
    const fields: Field[] = [
      { name: 'field1', label: 'Field 1' },
      { name: 'field2', label: 'Field 2' }
    ];

    beforeEach(() => {
      onQueryChange = jest.fn();
      wrapper = mount(<QueryBuilder fields={fields} onQueryChange={onQueryChange} />);
    });

    afterEach(() => {
      wrapper.unmount();
      onQueryChange.mockReset();
    });

    it('sets the default field as a string', () => {
      wrapper.setProps({ getDefaultField: 'field2' });
      wrapper.find(`.${standardClassnames.addRule}`).first().simulate('click');

      expect(onQueryChange.mock.calls[1][0].rules[0].field).toBe('field2');
    });

    it('sets the default field as a function', () => {
      wrapper.setProps({ getDefaultField: () => 'field2' });
      wrapper.find(`.${standardClassnames.addRule}`).first().simulate('click');

      expect(onQueryChange.mock.calls[1][0].rules[0].field).toBe('field2');
    });
  });

  describe('getDefaultOperator prop', () => {
    let wrapper: ReactWrapper, onQueryChange: jest.Mock;
    const fields: Field[] = [{ name: 'field1', label: 'Field 1' }];

    beforeEach(() => {
      onQueryChange = jest.fn();
      wrapper = mount(<QueryBuilder fields={fields} onQueryChange={onQueryChange} />);
    });

    afterEach(() => {
      wrapper.unmount();
      onQueryChange.mockReset();
    });

    it('sets the default operator as a string', () => {
      wrapper.setProps({ getDefaultOperator: 'beginsWith' });
      wrapper.find(`.${standardClassnames.addRule}`).first().simulate('click');

      expect(onQueryChange.mock.calls[1][0].rules[0].operator).toBe('beginsWith');
    });

    it('sets the default operator as a function', () => {
      wrapper.setProps({ getDefaultOperator: () => 'beginsWith' });
      wrapper.find(`.${standardClassnames.addRule}`).first().simulate('click');

      expect(onQueryChange.mock.calls[1][0].rules[0].operator).toBe('beginsWith');
    });
  });

  describe('defaultOperator property in field', () => {
    let wrapper: ReactWrapper, onQueryChange: jest.Mock;
    const fields: Field[] = [{ name: 'field1', label: 'Field 1', defaultOperator: 'beginsWith' }];

    beforeEach(() => {
      onQueryChange = jest.fn();
      wrapper = mount(<QueryBuilder fields={fields} onQueryChange={onQueryChange} />);
    });

    afterEach(() => {
      wrapper.unmount();
      onQueryChange.mockReset();
    });

    it('sets the default operator', () => {
      wrapper.find(`.${standardClassnames.addRule}`).first().simulate('click');

      expect(onQueryChange.mock.calls[1][0].rules[0].operator).toBe('beginsWith');
    });
  });

  describe('getDefaultValue prop', () => {
    let wrapper: ReactWrapper, onQueryChange: jest.Mock;
    const fields: Field[] = [
      { name: 'field1', label: 'Field 1' },
      { name: 'field2', label: 'Field 2' }
    ];

    beforeEach(() => {
      onQueryChange = jest.fn();
      wrapper = mount(<QueryBuilder fields={fields} onQueryChange={onQueryChange} />);
    });

    afterEach(() => {
      wrapper.unmount();
      onQueryChange.mockReset();
    });

    it('sets the default value', () => {
      wrapper.setProps({ getDefaultValue: () => 'Test Value' });
      wrapper.find(`.${standardClassnames.addRule}`).first().simulate('click');

      expect(onQueryChange.mock.calls[1][0].rules[0].value).toBe('Test Value');
    });
  });

  describe('onAddRule prop', () => {
    let wrapper: ReactWrapper, onQueryChange: jest.Mock, onAddRule: jest.Mock;

    beforeEach(() => {
      onQueryChange = jest.fn();
      onAddRule = jest.fn(() => false as const);
      wrapper = mount(<QueryBuilder onAddRule={onAddRule} onQueryChange={onQueryChange} />);
    });

    afterEach(() => {
      wrapper.unmount();
      onQueryChange.mockReset();
    });

    it('cancels the rule addition', () => {
      expect(onQueryChange).toHaveBeenCalledTimes(1);

      wrapper.find(`.${standardClassnames.addRule}`).first().simulate('click');

      expect(onAddRule).toHaveBeenCalled();
      expect(onQueryChange).toHaveBeenCalledTimes(1);
    });

    it('modifies the rule addition', () => {
      const rule: RuleType = { field: 'test', operator: '=', value: 'modified' };
      wrapper.setProps({ onAddRule: () => rule });
      wrapper.find(`.${standardClassnames.addRule}`).first().simulate('click');

      expect(onQueryChange.mock.calls[1][0].rules[0].value).toBe('modified');
    });
  });

  describe('onAddGroup prop', () => {
    let wrapper: ReactWrapper, onQueryChange: jest.Mock, onAddGroup: jest.Mock;

    beforeEach(() => {
      onQueryChange = jest.fn();
      onAddGroup = jest.fn(() => false as const);
      wrapper = mount(<QueryBuilder onAddGroup={onAddGroup} onQueryChange={onQueryChange} />);
    });

    afterEach(() => {
      wrapper.unmount();
      onQueryChange.mockReset();
    });

    it('cancels the group addition', () => {
      expect(onQueryChange).toHaveBeenCalledTimes(1);

      wrapper.find(`.${standardClassnames.addGroup}`).first().simulate('click');

      expect(onAddGroup).toHaveBeenCalled();
      expect(onQueryChange).toHaveBeenCalledTimes(1);
    });

    it('modifies the group addition', () => {
      const group: RuleGroupType = { combinator: 'fake', rules: [] };
      wrapper.setProps({ onAddGroup: () => group });
      wrapper.find(`.${standardClassnames.addGroup}`).first().simulate('click');

      expect(onQueryChange.mock.calls[1][0].rules[0].combinator).toBe('fake');
    });
  });

  describe('defaultValue property in field', () => {
    let wrapper: ReactWrapper, onQueryChange: jest.Mock;
    const fields: Field[] = [
      { name: 'field1', label: 'Field 1', defaultValue: 'Test Value 1' },
      { name: 'field2', label: 'Field 2', defaultValue: 'Test Value 2' }
    ];

    beforeEach(() => {
      onQueryChange = jest.fn();
      wrapper = mount(<QueryBuilder fields={fields} onQueryChange={onQueryChange} />);
    });

    afterEach(() => {
      wrapper.unmount();
      onQueryChange.mockReset();
    });

    it('sets the default value', () => {
      wrapper.find(`.${standardClassnames.addRule}`).first().simulate('click');

      expect(onQueryChange.mock.calls[1][0].rules[0].value).toBe('Test Value 1');
    });
  });

  describe('values property in field', () => {
    let wrapper: ReactWrapper, onQueryChange: jest.Mock;
    const fields: Field[] = [
      {
        name: 'field1',
        label: 'Field 1',
        defaultValue: 'test',
        values: [{ name: 'test', label: 'Test' }]
      },
      {
        name: 'field2',
        label: 'Field 2',
        defaultValue: 'test',
        values: [{ name: 'test', label: 'Test' }]
      }
    ];

    beforeEach(() => {
      onQueryChange = jest.fn();
      wrapper = mount(<QueryBuilder fields={fields} onQueryChange={onQueryChange} />);
    });

    afterEach(() => {
      wrapper.unmount();
      onQueryChange.mockReset();
    });

    it('sets the values list', () => {
      wrapper.setProps({ getValueEditorType: () => 'select' });
      wrapper.find(`.${standardClassnames.addRule}`).first().simulate('click');

      expect(wrapper.find(`select.${standardClassnames.value}`)).toHaveLength(1);
    });
  });

  describe('inputType property in field', () => {
    let wrapper: ReactWrapper, onQueryChange: jest.Mock;
    const fields: Field[] = [
      { name: 'field1', label: 'Field 1', inputType: 'number' },
      { name: 'field2', label: 'Field 2', inputType: 'date' }
    ];

    beforeEach(() => {
      onQueryChange = jest.fn();
      wrapper = mount(<QueryBuilder fields={fields} onQueryChange={onQueryChange} />);
    });

    afterEach(() => {
      wrapper.unmount();
      onQueryChange.mockReset();
    });

    it('sets the input type', () => {
      wrapper.find(`.${standardClassnames.addRule}`).first().simulate('click');

      expect(wrapper.find(`input[type="number"].${standardClassnames.value}`)).toHaveLength(1);
    });
  });

  describe('valueEditorType property in field', () => {
    let wrapper: ReactWrapper, onQueryChange: jest.Mock;
    const fields: Field[] = [
      { name: 'field1', label: 'Field 1', valueEditorType: 'select' },
      { name: 'field2', label: 'Field 2', valueEditorType: null }
    ];

    beforeEach(() => {
      onQueryChange = jest.fn();
      wrapper = mount(<QueryBuilder fields={fields} onQueryChange={onQueryChange} />);
    });

    afterEach(() => {
      wrapper.unmount();
      onQueryChange.mockReset();
    });

    it('sets the value editor type', () => {
      wrapper.find(`.${standardClassnames.addRule}`).first().simulate('click');

      expect(wrapper.find(`select.${standardClassnames.value}`)).toHaveLength(1);
    });
  });

  describe('operators property in field', () => {
    let wrapper: ReactWrapper, onQueryChange: jest.Mock;
    const fields: Field[] = [
      { name: 'field1', label: 'Field 1', operators: [{ name: '=', label: '=' }] },
      { name: 'field2', label: 'Field 2', operators: [{ name: '=', label: '=' }] }
    ];

    beforeEach(() => {
      onQueryChange = jest.fn();
      wrapper = mount(<QueryBuilder fields={fields} onQueryChange={onQueryChange} />);
    });

    afterEach(() => {
      wrapper.unmount();
      onQueryChange.mockReset();
    });

    it('sets the operators options', () => {
      wrapper.find(`.${standardClassnames.addRule}`).first().simulate('click');

      expect(wrapper.find(`select.${standardClassnames.operators}`)).toHaveLength(1);
      expect(wrapper.find(`select.${standardClassnames.operators} option`)).toHaveLength(1);
    });
  });

  describe('auto-select field', () => {
    let wrapper: ReactWrapper, onQueryChange: jest.Mock;
    const fields: Field[] = [
      { name: 'field1', label: 'Field 1', operators: [{ name: '=', label: '=' }] },
      { name: 'field2', label: 'Field 2', operators: [{ name: '=', label: '=' }] }
    ];

    beforeEach(() => {
      onQueryChange = jest.fn();
      wrapper = mount(
        <QueryBuilder fields={fields} onQueryChange={onQueryChange} autoSelectField={false} />
      );
    });

    afterEach(() => {
      wrapper.unmount();
      onQueryChange.mockReset();
    });

    it('hides the operator selector and value editor', () => {
      wrapper.find(`.${standardClassnames.addRule}`).first().simulate('click');

      expect(wrapper.find(`select.${standardClassnames.fields}`)).toHaveLength(1);
      expect(wrapper.find(`select.${standardClassnames.operators}`)).toHaveLength(0);
      expect(wrapper.find(`.${standardClassnames.value}`)).toHaveLength(0);
    });
  });

  describe('add rule to new groups', () => {
    let wrapper: ReactWrapper;
    const query: RuleGroupType = { combinator: 'and', rules: [] };
    const onQueryChange = jest.fn();

    beforeEach(() => {
      wrapper = mount(
        <QueryBuilder query={query} onQueryChange={onQueryChange} addRuleToNewGroups />
      );
    });

    afterEach(() => {
      wrapper.unmount();
    });

    it('does not add a rule when the component is created', () => {
      expect(wrapper.find(`.${standardClassnames.rule}`)).toHaveLength(0);
    });

    it('adds a rule when a new group is created', () => {
      wrapper.find(`.${standardClassnames.addGroup}`).first().simulate('click');
      expect(
        ((onQueryChange.mock.calls[2][0] as RuleGroupType).rules[0] as RuleGroupType).rules[0]
      ).toHaveProperty('field');
    });

    it('adds a rule when mounted if no initial query is provided', () => {
      wrapper.unmount();
      wrapper = mount(<QueryBuilder addRuleToNewGroups />);

      expect(wrapper.find(Rule)).toHaveLength(1);
    });
  });

  describe('showCloneButtons', () => {
    const onQueryChange = jest.fn();

    afterEach(() => {
      onQueryChange.mockReset();
    });

    describe('standard rule groups', () => {
      it('should clone rules', () => {
        const { getAllByText } = render(
          <QueryBuilder
            showCloneButtons
            onQueryChange={onQueryChange}
            defaultQuery={{
              combinator: 'and',
              rules: [
                { field: 'firstName', operator: '=', value: 'Steve' },
                { field: 'lastName', operator: '=', value: 'Vai' }
              ]
            }}
          />
        );
        userEvent.click(getAllByText(defaultTranslations.cloneRule.label)[0]);
        expect(stripQueryIds(onQueryChange.mock.calls[1][0])).toEqual({
          combinator: 'and',
          rules: [
            { field: 'firstName', operator: '=', value: 'Steve' },
            { field: 'firstName', operator: '=', value: 'Steve' },
            { field: 'lastName', operator: '=', value: 'Vai' }
          ]
        });
      });

      it('should clone rule groups', () => {
        const { getAllByText } = render(
          <QueryBuilder
            showCloneButtons
            onQueryChange={onQueryChange}
            defaultQuery={{
              combinator: 'and',
              rules: [
                {
                  combinator: 'or',
                  rules: [{ field: 'firstName', operator: '=', value: 'Steve' }]
                },
                { field: 'lastName', operator: '=', value: 'Vai' }
              ]
            }}
          />
        );
        userEvent.click(getAllByText(defaultTranslations.cloneRule.label)[0]);
        expect(stripQueryIds(onQueryChange.mock.calls[1][0])).toEqual({
          combinator: 'and',
          rules: [
            { combinator: 'or', rules: [{ field: 'firstName', operator: '=', value: 'Steve' }] },
            { combinator: 'or', rules: [{ field: 'firstName', operator: '=', value: 'Steve' }] },
            { field: 'lastName', operator: '=', value: 'Vai' }
          ]
        });
      });
    });

    describe('independent combinators', () => {
      it('should clone a single rule with independent combinators', () => {
        const { getByText } = render(
          <QueryBuilder
            showCloneButtons
            independentCombinators
            onQueryChange={onQueryChange}
            defaultQuery={{
              rules: [{ field: 'firstName', operator: '=', value: 'Steve' }]
            }}
          />
        );
        userEvent.click(getByText(defaultTranslations.cloneRule.label));
        expect(stripQueryIds(onQueryChange.mock.calls[1][0])).toEqual({
          rules: [
            { field: 'firstName', operator: '=', value: 'Steve' },
            'and',
            { field: 'firstName', operator: '=', value: 'Steve' }
          ]
        });
      });

      it('should clone first rule with independent combinators', () => {
        const { getAllByText } = render(
          <QueryBuilder
            showCloneButtons
            independentCombinators
            onQueryChange={onQueryChange}
            defaultQuery={{
              rules: [
                { field: 'firstName', operator: '=', value: 'Steve' },
                'and',
                { field: 'lastName', operator: '=', value: 'Vai' }
              ]
            }}
          />
        );
        userEvent.click(getAllByText(defaultTranslations.cloneRule.label)[0]);
        expect(stripQueryIds(onQueryChange.mock.calls[1][0])).toEqual({
          rules: [
            { field: 'firstName', operator: '=', value: 'Steve' },
            'and',
            { field: 'firstName', operator: '=', value: 'Steve' },
            'and',
            { field: 'lastName', operator: '=', value: 'Vai' }
          ]
        });
      });

      it('should clone last rule with independent combinators', () => {
        const { getAllByText } = render(
          <QueryBuilder
            showCloneButtons
            independentCombinators
            onQueryChange={onQueryChange}
            defaultQuery={{
              rules: [
                { field: 'firstName', operator: '=', value: 'Steve' },
                'or',
                { field: 'lastName', operator: '=', value: 'Vai' }
              ]
            }}
          />
        );
        userEvent.click(getAllByText(defaultTranslations.cloneRule.label)[1]);
        expect(stripQueryIds(onQueryChange.mock.calls[1][0])).toEqual({
          rules: [
            { field: 'firstName', operator: '=', value: 'Steve' },
            'or',
            { field: 'lastName', operator: '=', value: 'Vai' },
            'or',
            { field: 'lastName', operator: '=', value: 'Vai' }
          ]
        });
      });
    });
  });

  describe('independent combinators', () => {
    it('should render a rule group with independent combinators', () => {
      const onQueryChange = jest.fn();
      const wrapper = mount(<QueryBuilder onQueryChange={onQueryChange} independentCombinators />);
      expect(wrapper.find(RuleGroup)).toHaveLength(1);
      expect(onQueryChange.mock.calls[0][0]).not.toHaveProperty('combinator');
    });

    it('should render a rule group with addRuleToNewGroups', () => {
      const wrapper = mount(<QueryBuilder addRuleToNewGroups independentCombinators />);
      expect(wrapper.find(Rule)).toHaveLength(1);
    });

    it('should call onQueryChange with query', () => {
      const onQueryChange = jest.fn();
      mount(<QueryBuilder onQueryChange={onQueryChange} independentCombinators />);
      expect(onQueryChange).toHaveBeenCalledTimes(1);
      const query: RuleGroupTypeIC = {
        rules: [],
        not: false
      };
      expect(onQueryChange.mock.calls[0][0]).toMatchObject(query);
    });

    it('should add rules with independent combinators', () => {
      const wrapper = mount(<QueryBuilder independentCombinators />);
      expect(wrapper.find(`.${standardClassnames.combinators}`)).toHaveLength(0);
      wrapper.find(`button.${standardClassnames.addRule}`).simulate('click');
      expect(wrapper.find(Rule)).toHaveLength(1);
      expect(wrapper.find(`.${standardClassnames.combinators}`)).toHaveLength(0);
      wrapper.find(`button.${standardClassnames.addRule}`).simulate('click');
      expect(wrapper.find(Rule)).toHaveLength(2);
      expect(wrapper.find(`select.${standardClassnames.combinators}`)).toHaveLength(1);
      expect(wrapper.find(`select.${standardClassnames.combinators}`).props().value).toBe('and');
      wrapper
        .find(`select.${standardClassnames.combinators}`)
        .simulate('change', { target: { value: 'or' } });
      wrapper.find(`button.${standardClassnames.addRule}`).simulate('click');
      const combinatorSelectors = wrapper.find(`select.${standardClassnames.combinators}`);
      expect(combinatorSelectors.at(0).props().value).toBe(combinatorSelectors.at(1).props().value);
    });

    it('should add groups with independent combinators', () => {
      const wrapper = mount(<QueryBuilder independentCombinators />);
      expect(wrapper.find(`.${standardClassnames.combinators}`)).toHaveLength(0);
      wrapper.find(`button.${standardClassnames.addGroup}`).at(0).simulate('click');
      expect(wrapper.find(RuleGroup)).toHaveLength(2);
      expect(wrapper.find(`.${standardClassnames.combinators}`)).toHaveLength(0);
      wrapper.find(`button.${standardClassnames.addGroup}`).at(0).simulate('click');
      expect(wrapper.find(RuleGroup)).toHaveLength(3);
      expect(wrapper.find(`select.${standardClassnames.combinators}`)).toHaveLength(1);
      expect(wrapper.find(`select.${standardClassnames.combinators}`).props().value).toBe('and');
      wrapper
        .find(`select.${standardClassnames.combinators}`)
        .simulate('change', { target: { value: 'or' } });
      wrapper.find(`button.${standardClassnames.addGroup}`).at(0).simulate('click');
      const combinatorSelectors = wrapper.find(`select.${standardClassnames.combinators}`);
      expect(combinatorSelectors.at(0).props().value).toBe(combinatorSelectors.at(1).props().value);
    });

    it('should remove rules along with independent combinators', () => {
      const onQueryChange = jest.fn();
      const query: RuleGroupTypeIC = {
        rules: [
          { field: 'firstName', operator: '=', value: '1' },
          'and',
          { field: 'firstName', operator: '=', value: '2' },
          'or',
          { field: 'firstName', operator: '=', value: '3' }
        ]
      };
      const wrapper = mount(
        <QueryBuilder query={query} onQueryChange={onQueryChange} independentCombinators />
      );
      expect(wrapper.find(Rule)).toHaveLength(3);
      expect(wrapper.find(`select.${standardClassnames.combinators}`)).toHaveLength(2);
      wrapper.find(`button.${standardClassnames.removeRule}`).at(1).simulate('click');
      expect((onQueryChange.mock.calls[1][0] as RuleGroupType).rules[0]).toHaveProperty(
        'value',
        '1'
      );
      expect((onQueryChange.mock.calls[1][0] as RuleGroupType).rules[1]).toBe('or');
      expect((onQueryChange.mock.calls[1][0] as RuleGroupType).rules[2]).toHaveProperty(
        'value',
        '3'
      );

      wrapper.setProps({ query: onQueryChange.mock.calls[1][0] });
      wrapper.find(`button.${standardClassnames.removeRule}`).at(0).simulate('click');
      expect((onQueryChange.mock.calls[2][0] as RuleGroupType).rules).toHaveLength(1);
      expect((onQueryChange.mock.calls[2][0] as RuleGroupType).rules[0]).toHaveProperty(
        'value',
        '3'
      );
    });

    it('should remove groups along with independent combinators', () => {
      const onQueryChange = jest.fn();
      const query: RuleGroupTypeIC = {
        rules: [{ rules: [] }, 'and', { rules: [] }, 'or', { rules: [] }]
      };
      const wrapper = mount(
        <QueryBuilder query={query} onQueryChange={onQueryChange} independentCombinators />
      );

      expect(wrapper.find(RuleGroup)).toHaveLength(4);
      expect(wrapper.find(`select.${standardClassnames.combinators}`)).toHaveLength(2);
      wrapper.find(`button.${standardClassnames.removeGroup}`).at(1).simulate('click');
      expect((onQueryChange.mock.calls[1][0] as RuleGroupType).rules[0]).toHaveProperty('rules');
      expect((onQueryChange.mock.calls[1][0] as RuleGroupType).rules[1]).toBe('or');
      expect((onQueryChange.mock.calls[1][0] as RuleGroupType).rules[2]).toHaveProperty('rules');

      wrapper.setProps({ query: onQueryChange.mock.calls[1][0] });
      wrapper.find(`button.${standardClassnames.removeGroup}`).at(0).simulate('click');
      expect((onQueryChange.mock.calls[2][0] as RuleGroupType).rules).toHaveLength(1);
      expect((onQueryChange.mock.calls[2][0] as RuleGroupType).rules[0]).toHaveProperty('rules');
    });
  });

  describe('validation', () => {
    it('should not validate if no validator function is provided', () => {
      const wrapper = mount(<QueryBuilder />);
      expect(wrapper.find('div').first().hasClass(standardClassnames.valid)).toBe(false);
      expect(wrapper.find('div').first().hasClass(standardClassnames.invalid)).toBe(false);
      expect(wrapper.find(RuleGroup).props().schema.validationMap).toEqual({});
    });

    it('should validate groups if default validator function is provided', () => {
      const wrapper = mount(<QueryBuilder validator={defaultValidator} />);
      wrapper.find(`.${standardClassnames.addGroup}`).first().simulate('click');
      // Expect the root group to be valid (contains the inner group)
      expect(
        wrapper.find(`.${standardClassnames.ruleGroup}.${standardClassnames.valid}`)
      ).toHaveLength(1);
      // Expect the inner group to be invalid (empty)
      expect(
        wrapper.find(`.${standardClassnames.ruleGroup}.${standardClassnames.invalid}`)
      ).toHaveLength(1);
    });

    it('should use custom validator function returning false', () => {
      const validator = jest.fn(() => false);
      const wrapper = mount(<QueryBuilder validator={validator} />);
      expect(validator).toHaveBeenCalled();
      expect(wrapper.find('div').first().hasClass(standardClassnames.valid)).toBe(false);
      expect(wrapper.find('div').first().hasClass(standardClassnames.invalid)).toBe(true);
    });

    it('should use custom validator function returning true', () => {
      const validator = jest.fn(() => true);
      const wrapper = mount(<QueryBuilder validator={validator} />);
      expect(validator).toHaveBeenCalled();
      expect(wrapper.find('div').first().hasClass(standardClassnames.valid)).toBe(true);
      expect(wrapper.find('div').first().hasClass(standardClassnames.invalid)).toBe(false);
    });

    it('should pass down validationMap to children', () => {
      const valMap: ValidationMap = { id: { valid: false, reasons: ['invalid'] } };
      const dom = mount(<QueryBuilder validator={() => valMap} />);
      expect(dom.find(RuleGroup).props().schema.validationMap).toEqual(valMap);
    });
  });

  describe('enableDragAndDrop', () => {
    describe('group level combinators', () => {
      it('should set data-dnd attribute appropriately', () => {
        const wrapperDisabled = mount(<QueryBuilder />);
        expect(wrapperDisabled.find('div').first().getDOMNode().getAttribute('data-dnd')).toBe(
          'disabled'
        );
        wrapperDisabled.unmount();
        const wrapperEnabled = mount(<QueryBuilder enableDragAndDrop />);
        expect(wrapperEnabled.find('div').first().getDOMNode().getAttribute('data-dnd')).toBe(
          'enabled'
        );
      });

      it('moves a rule down within the same group', () => {
        const onQueryChange = jest.fn();
        const { getAllByTestId } = render(
          <QueryBuilder
            onQueryChange={onQueryChange}
            enableDragAndDrop
            query={{
              combinator: 'and',
              rules: [
                { id: '0', field: 'field0', operator: '=', value: '0' },
                { id: '1', field: 'field1', operator: '=', value: '1' }
              ]
            }}
          />
        );
        const rules = getAllByTestId('rule');
        simulateDragDrop(
          getHandlerId(rules[0], 'drag'),
          getHandlerId(rules[1], 'drop'),
          getDndBackend()
        );
        expect((onQueryChange.mock.calls[1][0] as RuleGroupType).rules.map((r) => r.id)).toEqual([
          '1',
          '0'
        ]);
      });

      it('moves a rule to a different group with a common ancestor', () => {
        const onQueryChange = jest.fn();
        const { getAllByTestId } = render(
          <QueryBuilder
            onQueryChange={onQueryChange}
            enableDragAndDrop
            query={{
              combinator: 'and',
              rules: [
                {
                  id: '0',
                  combinator: 'and',
                  rules: [
                    { id: '1', field: 'field0', operator: '=', value: '1' },
                    { id: '2', field: 'field0', operator: '=', value: '2' },
                    { id: '3', combinator: 'and', rules: [] }
                  ]
                }
              ]
            }}
          />
        );
        const rule = getAllByTestId('rule')[1]; // id 2
        const ruleGroup = getAllByTestId('rule-group')[2]; // id 3
        simulateDragDrop(
          getHandlerId(rule, 'drag'),
          getHandlerId(ruleGroup, 'drop'),
          getDndBackend()
        );
        expect((onQueryChange.mock.calls[1][0] as RuleGroupType).rules).toHaveLength(1);
        expect(
          ((onQueryChange.mock.calls[1][0] as RuleGroupType).rules[0] as RuleGroupType).rules
        ).toHaveLength(2);
        expect(
          (
            ((onQueryChange.mock.calls[1][0] as RuleGroupType).rules[0] as RuleGroupType)
              .rules[1] as RuleGroupType
          ).rules[0]
        ).toHaveProperty('id', '2');
      });
    });

    describe('independent combinators', () => {
      it('swaps the first rule with the last within the same group', () => {
        const onQueryChange = jest.fn();
        const { getAllByTestId } = render(
          <QueryBuilder
            independentCombinators
            onQueryChange={onQueryChange}
            enableDragAndDrop
            query={{
              rules: [
                { field: 'field0', operator: '=', value: '0' },
                'and',
                { field: 'field1', operator: '=', value: '1' }
              ]
            }}
          />
        );
        const rules = getAllByTestId('rule');
        simulateDragDrop(
          getHandlerId(rules[0], 'drag'),
          getHandlerId(rules[1], 'drop'),
          getDndBackend()
        );
        expect(stripQueryIds(onQueryChange.mock.calls[1][0])).toEqual({
          rules: [
            { field: 'field1', operator: '=', value: '1' },
            'and',
            { field: 'field0', operator: '=', value: '0' }
          ]
        });
      });

      it('swaps the last rule with the first within the same group', () => {
        const onQueryChange = jest.fn();
        const { getAllByTestId } = render(
          <QueryBuilder
            independentCombinators
            onQueryChange={onQueryChange}
            enableDragAndDrop
            query={{
              rules: [
                { field: 'field0', operator: '=', value: '0' },
                'and',
                { field: 'field1', operator: '=', value: '1' }
              ]
            }}
          />
        );
        const rules = getAllByTestId('rule');
        const ruleGroup = getAllByTestId('rule-group')[0];
        simulateDragDrop(
          getHandlerId(rules[1], 'drag'),
          getHandlerId(ruleGroup, 'drop'),
          getDndBackend()
        );
        expect(stripQueryIds(onQueryChange.mock.calls[1][0])).toEqual({
          rules: [
            { field: 'field1', operator: '=', value: '1' },
            'and',
            { field: 'field0', operator: '=', value: '0' }
          ]
        });
      });

      it('moves a rule from first to last within the same group', () => {
        const onQueryChange = jest.fn();
        const { getAllByTestId } = render(
          <QueryBuilder
            independentCombinators
            onQueryChange={onQueryChange}
            enableDragAndDrop
            query={{
              rules: [
                { field: 'field0', operator: '=', value: '0' },
                'and',
                { field: 'field1', operator: '=', value: '1' },
                'and',
                { field: 'field2', operator: '=', value: '2' }
              ]
            }}
          />
        );
        const rules = getAllByTestId('rule');
        simulateDragDrop(
          getHandlerId(rules[0], 'drag'),
          getHandlerId(rules[2], 'drop'),
          getDndBackend()
        );
        expect(stripQueryIds(onQueryChange.mock.calls[1][0])).toEqual({
          rules: [
            { field: 'field1', operator: '=', value: '1' },
            'and',
            { field: 'field2', operator: '=', value: '2' },
            'and',
            { field: 'field0', operator: '=', value: '0' }
          ]
        });
      });

      it('moves a rule from last to first within the same group', () => {
        const onQueryChange = jest.fn();
        const { getAllByTestId } = render(
          <QueryBuilder
            independentCombinators
            onQueryChange={onQueryChange}
            enableDragAndDrop
            query={{
              rules: [
                { field: 'field0', operator: '=', value: '0' },
                'and',
                { field: 'field1', operator: '=', value: '1' },
                'and',
                { field: 'field2', operator: '=', value: '2' }
              ]
            }}
          />
        );
        const rules = getAllByTestId('rule');
        const ruleGroup = getAllByTestId('rule-group')[0];
        simulateDragDrop(
          getHandlerId(rules[2], 'drag'),
          getHandlerId(ruleGroup, 'drop'),
          getDndBackend()
        );
        expect(stripQueryIds(onQueryChange.mock.calls[1][0])).toEqual({
          rules: [
            { field: 'field2', operator: '=', value: '2' },
            'and',
            { field: 'field0', operator: '=', value: '0' },
            'and',
            { field: 'field1', operator: '=', value: '1' }
          ]
        });
      });

      it('moves a first-child rule to a different group as the first child', () => {
        const onQueryChange = jest.fn();
        const { getAllByTestId } = render(
          <QueryBuilder
            independentCombinators
            onQueryChange={onQueryChange}
            enableDragAndDrop
            query={{
              rules: [
                { field: 'field0', operator: '=', value: '0' },
                'and',
                {
                  rules: [
                    { field: 'field1', operator: '=', value: '1' },
                    'and',
                    { field: 'field2', operator: '=', value: '2' }
                  ]
                }
              ]
            }}
          />
        );
        const rule = getAllByTestId('rule')[0];
        const ruleGroup = getAllByTestId('rule-group')[1];
        simulateDragDrop(
          getHandlerId(rule, 'drag'),
          getHandlerId(ruleGroup, 'drop'),
          getDndBackend()
        );
        expect(stripQueryIds(onQueryChange.mock.calls[1][0])).toEqual({
          rules: [
            {
              rules: [
                { field: 'field0', operator: '=', value: '0' },
                'and',
                { field: 'field1', operator: '=', value: '1' },
                'and',
                { field: 'field2', operator: '=', value: '2' }
              ]
            }
          ]
        });
      });

      it('moves a middle-child rule to a different group as a middle child', () => {
        const onQueryChange = jest.fn();
        const { getAllByTestId } = render(
          <QueryBuilder
            independentCombinators
            onQueryChange={onQueryChange}
            enableDragAndDrop
            query={{
              rules: [
                { field: 'field0', operator: '=', value: '0' },
                'and',
                { field: 'field1', operator: '=', value: '1' },
                'and',
                { field: 'field2', operator: '=', value: '2' },
                'and',
                {
                  rules: [
                    { field: 'field3', operator: '=', value: '3' },
                    'and',
                    { field: 'field4', operator: '=', value: '4' }
                  ]
                }
              ]
            }}
          />
        );
        const ruleDrag = getAllByTestId('rule')[1];
        const ruleDrop = getAllByTestId('rule')[3];
        simulateDragDrop(
          getHandlerId(ruleDrag, 'drag'),
          getHandlerId(ruleDrop, 'drop'),
          getDndBackend()
        );
        expect(stripQueryIds(onQueryChange.mock.calls[1][0])).toEqual({
          rules: [
            { field: 'field0', operator: '=', value: '0' },
            'and',
            { field: 'field2', operator: '=', value: '2' },
            'and',
            {
              rules: [
                { field: 'field3', operator: '=', value: '3' },
                'and',
                { field: 'field1', operator: '=', value: '1' },
                'and',
                { field: 'field4', operator: '=', value: '4' }
              ]
            }
          ]
        });
      });
    });
  });
});
