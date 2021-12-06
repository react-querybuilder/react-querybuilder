import { render, RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { simulateDragDrop, wrapWithTestBackend } from 'react-dnd-test-utils';
import { defaultTranslations } from '..';
import { standardClassnames } from '../defaults';
import { QueryBuilder as QueryBuilderOriginal } from '../QueryBuilder';
import type {
  Field,
  NameLabelPair,
  RuleGroupProps,
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
  describe('when rendered', () => {
    it('should have the correct className', () => {
      const { container } = render(<QueryBuilder />);
      expect(container.querySelectorAll('div')[0].classList).toContain(
        standardClassnames.queryBuilder
      );
    });

    it('should render the root RuleGroup', () => {
      const { getByTestId } = render(<QueryBuilder />);
      expect(() => getByTestId('rule-group')).not.toThrow();
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
    it('should call onQueryChange with query', () => {
      const onQueryChange = jest.fn();
      render(<QueryBuilder onQueryChange={onQueryChange} />);
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
    it('should be able to create rule on add rule click', () => {
      const { container, getByTestId } = render(<QueryBuilder />);
      userEvent.click(container.getElementsByClassName(standardClassnames.addRule)[0]);
      expect(() => getByTestId('rule')).not.toThrow();
    });
  });

  describe('when initial query, with duplicate fields, is provided', () => {
    it('passes down a unique set of fields (by name)', () => {
      const { container, getByTestId } = render(
        <QueryBuilder
          fields={[
            { name: 'dupe', label: 'One' },
            { name: 'dupe', label: 'Two' }
          ]}
        />
      );
      userEvent.click(container.getElementsByClassName(standardClassnames.addRule)[0]);
      expect(() => getByTestId('rule')).not.toThrow();
      expect(getByTestId('rule').getElementsByClassName(standardClassnames.fields)).toHaveLength(1);
    });
  });

  describe('when initial query, without ID, is provided', () => {
    let selectors: RenderResult;
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
      selectors = render(<QueryBuilder query={queryWithoutID as RuleGroupType} fields={fields} />);
    });

    it('should contain a <Rule /> with the correct props', () => {
      expect(() => selectors.getByTestId('rule')).not.toThrow();
      expect(
        (
          selectors
            .getByTestId('rule')
            .getElementsByClassName(standardClassnames.fields)[0] as HTMLInputElement
        ).value
      ).toBe('firstName');
      expect(
        (
          selectors
            .getByTestId('rule')
            .getElementsByClassName(standardClassnames.operators)[0] as HTMLSelectElement
        ).value
      ).toBe('=');
      expect(
        (
          selectors
            .getByTestId('rule')
            .getElementsByClassName(standardClassnames.value)[0] as HTMLSelectElement
        ).value
      ).toBe('Test without ID');
    });

    it('should have a select control with the provided fields', () => {
      expect(
        selectors.getByTestId('rule').querySelectorAll(`.${standardClassnames.fields} option`)
      ).toHaveLength(3);
    });

    it('should have a field selector with the correct field', () => {
      expect(
        (
          selectors
            .getByTestId('rule')
            .getElementsByClassName(standardClassnames.fields)[0] as HTMLSelectElement
        ).value
      ).toBe('firstName');
    });

    it('should have an operator selector with the correct operator', () => {
      expect(
        (
          selectors
            .getByTestId('rule')
            .getElementsByClassName(standardClassnames.operators)[0] as HTMLSelectElement
        ).value
      ).toBe('=');
    });

    it('should have an input control with the correct value', () => {
      expect(selectors.getByTestId('rule').querySelector('input').value).toBe('Test without ID');
    });
  });

  describe('when initial operators are provided', () => {
    let selectors: RenderResult;
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
      selectors = render(<QueryBuilder operators={operators} fields={fields} query={query} />);
    });

    it('should use the given operators', () => {
      expect(
        selectors.getByTestId('rule').querySelectorAll(`.${standardClassnames.operators} option`)
      ).toHaveLength(4);
    });

    it('should match the label of the first operator', () => {
      expect(
        selectors.getByTestId('rule').querySelectorAll(`.${standardClassnames.operators} option`)[0]
          .innerHTML
      ).toBe('Custom Is Null');
    });
  });

  describe('when getOperators fn prop is provided', () => {
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

    it('should invoke custom getOperators function', () => {
      const getOperators = jest.fn(() => [{ name: 'op1', label: 'Operator 1' }]);
      render(<QueryBuilder query={query} fields={fields} getOperators={getOperators} />);
      expect(getOperators).toHaveBeenCalled();
    });

    it('should handle invalid getOperators function', () => {
      const { getByTestId } = render(
        <QueryBuilder query={query} fields={fields} getOperators={() => null} />
      );
      expect(
        (
          getByTestId('rule').getElementsByClassName(
            standardClassnames.operators
          )[0] as HTMLSelectElement
        ).value
      ).toBe('=');
    });
  });

  describe('when getValueEditorType fn prop is provided', () => {
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

    it('should invoke custom getValueEditorType function', () => {
      const getValueEditorType = jest.fn(() => 'text' as const);
      render(
        <QueryBuilder query={query} fields={fields} getValueEditorType={getValueEditorType} />
      );
      expect(getValueEditorType).toHaveBeenCalled();
    });

    it('should handle invalid getValueEditorType function', () => {
      const { container } = render(
        <QueryBuilder query={query} fields={fields} getValueEditorType={() => null} />
      );
      const valueEditor = container.getElementsByClassName(standardClassnames.value)[0];
      expect(valueEditor.getAttribute('type')).toBe('text');
    });
  });

  describe('when getInputType fn prop is provided', () => {
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

    it('should invoke custom getInputType function', () => {
      const getInputType = jest.fn(() => 'text' as const);
      render(<QueryBuilder query={query} fields={fields} getInputType={getInputType} />);
      expect(getInputType).toHaveBeenCalled();
    });

    it('should handle invalid getInputType function', () => {
      const { container } = render(
        <QueryBuilder query={query} fields={fields} getInputType={() => null} />
      );
      const valueEditor = container.getElementsByClassName(standardClassnames.value)[0];
      expect(valueEditor.getAttribute('type')).toBe('text');
    });
  });

  describe('when getValues fn prop is provided', () => {
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

    it('should invoke custom getValues function', () => {
      const getValues = jest.fn(() => [{ name: 'test', label: 'Test' }]);
      render(
        <QueryBuilder
          query={query}
          fields={fields}
          getValueEditorType={getValueEditorType}
          getValues={getValues}
        />
      );
      expect(getValues).toHaveBeenCalled();
    });

    it('should generate the correct number of options', () => {
      const getValues = jest.fn(() => [{ name: 'test', label: 'Test' }]);
      const { container } = render(
        <QueryBuilder
          query={query}
          fields={fields}
          getValueEditorType={getValueEditorType}
          getValues={getValues}
        />
      );
      const opts = container
        .getElementsByClassName(standardClassnames.value)[0]
        .querySelectorAll('option');
      expect(opts).toHaveLength(1);
    });

    it('should handle invalid getValues function', () => {
      const { container } = render(
        <QueryBuilder query={query} fields={fields} getValues={() => null} />
      );
      const select = container.getElementsByClassName(standardClassnames.value);
      expect(select).toHaveLength(1);
      const opts = container
        .getElementsByClassName(standardClassnames.value)[0]
        .querySelectorAll('option');
      expect(opts).toHaveLength(0);
    });
  });

  describe('actions', () => {
    let selectors: RenderResult;
    const onQueryChange = jest.fn();
    const fields: Field[] = [
      { name: 'field1', label: 'Field 1' },
      { name: 'field2', label: 'Field 2' }
    ];

    beforeEach(() => {
      selectors = render(<QueryBuilder fields={fields} onQueryChange={onQueryChange} />);
    });

    afterEach(() => {
      onQueryChange.mockReset();
    });

    it('should create a new rule and remove that rule', () => {
      userEvent.click(selectors.container.getElementsByClassName(standardClassnames.addRule)[0]);

      expect(selectors.getByTestId('rule')).toBeDefined();
      expect(onQueryChange.mock.calls[0][0].rules).toHaveLength(0);
      expect(onQueryChange.mock.calls[1][0].rules).toHaveLength(1);

      userEvent.click(selectors.container.getElementsByClassName(standardClassnames.removeRule)[0]);

      expect(() => selectors.getByTestId('rule')).toThrow();
      expect(onQueryChange.mock.calls[2][0].rules).toHaveLength(0);
    });

    it('should create a new group and remove that group', () => {
      userEvent.click(selectors.container.getElementsByClassName(standardClassnames.addGroup)[0]);

      expect(selectors.getAllByTestId('rule-group')).toHaveLength(2);
      expect(onQueryChange.mock.calls[0][0].rules).toHaveLength(0);
      expect(onQueryChange.mock.calls[1][0].rules).toHaveLength(1);
      expect(onQueryChange.mock.calls[1][0].rules[0].combinator).toBe('and');

      userEvent.click(
        selectors.container.getElementsByClassName(standardClassnames.removeGroup)[0]
      );

      expect(selectors.getAllByTestId('rule-group')).toHaveLength(1);
      expect(onQueryChange.mock.calls[2][0].rules).toHaveLength(0);
    });

    it('should create a new rule and change the fields', () => {
      userEvent.click(selectors.container.getElementsByClassName(standardClassnames.addRule)[0]);

      expect(onQueryChange.mock.calls[0][0].rules).toHaveLength(0);
      expect(onQueryChange.mock.calls[1][0].rules).toHaveLength(1);

      userEvent.selectOptions(
        selectors.container.getElementsByClassName(standardClassnames.fields)[0],
        'field2'
      );
      expect(onQueryChange.mock.calls[2][0].rules[0].field).toBe('field2');
    });

    it('should create a new rule and change the operator', () => {
      userEvent.click(selectors.container.getElementsByClassName(standardClassnames.addRule)[0]);

      expect(onQueryChange.mock.calls[0][0].rules).toHaveLength(0);
      expect(onQueryChange.mock.calls[1][0].rules).toHaveLength(1);

      userEvent.selectOptions(
        selectors.container.getElementsByClassName(standardClassnames.operators)[0],
        '!='
      );
      expect(onQueryChange.mock.calls[2][0].rules[0].operator).toBe('!=');
    });

    it('should change the combinator of the root group', () => {
      expect(onQueryChange.mock.calls[0][0].rules).toHaveLength(0);

      userEvent.selectOptions(
        selectors.container.getElementsByClassName(standardClassnames.combinators)[0],
        'or'
      );

      expect(onQueryChange.mock.calls[1][0].rules).toHaveLength(0);
      expect(onQueryChange.mock.calls[1][0].combinator).toBe('or');
    });

    it('should set default value for a rule', () => {
      selectors.rerender(
        <QueryBuilder
          fields={fields}
          onQueryChange={onQueryChange}
          getValues={(field: string) => {
            if (field === 'field1') {
              return [
                { name: 'value1', label: 'Value 1' },
                { name: 'value2', label: 'Value 2' }
              ];
            }

            return [];
          }}
          getValueEditorType={(field: string) => {
            if (field === 'field2') return 'checkbox';

            return 'text';
          }}
        />
      );

      userEvent.click(selectors.container.getElementsByClassName(standardClassnames.addRule)[0]);

      expect(onQueryChange.mock.calls[1][0].rules).toHaveLength(1);
      expect(onQueryChange.mock.calls[1][0].rules[0].value).toBe('value1');

      userEvent.selectOptions(
        selectors.container.getElementsByClassName(standardClassnames.fields)[0],
        'field2'
      );

      expect(onQueryChange.mock.calls[2][0].rules[0].field).toBe('field2');
      expect(onQueryChange.mock.calls[2][0].rules[0].value).toBe(false);

      selectors.rerender(
        <QueryBuilder
          fields={fields.slice(1)}
          onQueryChange={onQueryChange}
          getValueEditorType={(field: string) => {
            if (field === 'field2') return 'checkbox';

            return 'text';
          }}
        />
      );

      userEvent.click(selectors.container.getElementsByClassName(standardClassnames.addRule)[0]);

      expect(onQueryChange.mock.calls[3][0].rules).toHaveLength(2);
      expect(onQueryChange.mock.calls[3][0].rules[0].value).toBe(false);
    });
  });

  describe('resetOnFieldChange prop', () => {
    let selectors: RenderResult;
    const onQueryChange = jest.fn();
    const fields: Field[] = [
      { name: 'field1', label: 'Field 1' },
      { name: 'field2', label: 'Field 2' }
    ];

    beforeEach(() => {
      selectors = render(<QueryBuilder fields={fields} onQueryChange={onQueryChange} />);
    });

    afterEach(() => {
      onQueryChange.mockReset();
    });

    it('resets the operator and value when true', () => {
      userEvent.click(selectors.container.getElementsByClassName(standardClassnames.addRule)[0]);
      userEvent.selectOptions(
        selectors.container.getElementsByClassName(standardClassnames.operators)[0],
        '>'
      );
      userEvent.type(
        selectors.container.getElementsByClassName(standardClassnames.value)[0],
        'Test'
      );
      userEvent.selectOptions(
        selectors.container.getElementsByClassName(standardClassnames.fields)[0],
        'field2'
      );

      expect(onQueryChange.mock.calls[3][0].rules[0].operator).toBe('>');
      expect(onQueryChange.mock.calls[6][0].rules[0].value).toBe('Test');
      expect(onQueryChange.mock.calls[7][0].rules[0].operator).toBe('=');
      expect(onQueryChange.mock.calls[7][0].rules[0].value).toBe('');
    });

    it('does not reset the operator and value when false', () => {
      selectors.rerender(
        <QueryBuilder resetOnFieldChange={false} fields={fields} onQueryChange={onQueryChange} />
      );
      userEvent.click(selectors.container.getElementsByClassName(standardClassnames.addRule)[0]);
      userEvent.selectOptions(
        selectors.container.getElementsByClassName(standardClassnames.operators)[0],
        '>'
      );
      userEvent.type(
        selectors.container.getElementsByClassName(standardClassnames.value)[0],
        'Test'
      );
      userEvent.selectOptions(
        selectors.container.getElementsByClassName(standardClassnames.fields)[0],
        'field2'
      );

      expect(onQueryChange.mock.calls[3][0].rules[0].operator).toBe('>');
      expect(onQueryChange.mock.calls[6][0].rules[0].value).toBe('Test');
      expect(onQueryChange.mock.calls[7][0].rules[0].operator).toBe('>');
      expect(onQueryChange.mock.calls[7][0].rules[0].value).toBe('Test');
    });
  });

  describe('resetOnOperatorChange prop', () => {
    const onQueryChange = jest.fn();
    const fields: Field[] = [
      { name: 'field1', label: 'Field 1' },
      { name: 'field2', label: 'Field 2' }
    ];

    afterEach(() => {
      onQueryChange.mockReset();
    });

    it('resets the value when true', () => {
      const { container } = render(
        <QueryBuilder resetOnOperatorChange fields={fields} onQueryChange={onQueryChange} />
      );
      userEvent.click(container.getElementsByClassName(standardClassnames.addRule)[0]);
      userEvent.selectOptions(
        container.getElementsByClassName(standardClassnames.operators)[0],
        '>'
      );
      userEvent.type(container.getElementsByClassName(standardClassnames.value)[0], 'Test');
      userEvent.selectOptions(
        container.getElementsByClassName(standardClassnames.operators)[0],
        '='
      );

      expect(onQueryChange.mock.calls[3][0].rules[0].operator).toBe('>');
      expect(onQueryChange.mock.calls[6][0].rules[0].value).toBe('Test');
      expect(onQueryChange.mock.calls[7][0].rules[0].operator).toBe('=');
      expect(onQueryChange.mock.calls[7][0].rules[0].value).toBe('');
    });

    it('does not reset the value when false', () => {
      const { container } = render(
        <QueryBuilder resetOnOperatorChange={false} fields={fields} onQueryChange={onQueryChange} />
      );
      userEvent.click(container.getElementsByClassName(standardClassnames.addRule)[0]);
      userEvent.selectOptions(
        container.getElementsByClassName(standardClassnames.operators)[0],
        '>'
      );
      userEvent.type(container.getElementsByClassName(standardClassnames.value)[0], 'Test');
      userEvent.selectOptions(
        container.getElementsByClassName(standardClassnames.operators)[0],
        '='
      );

      expect(onQueryChange.mock.calls[3][0].rules[0].operator).toBe('>');
      expect(onQueryChange.mock.calls[6][0].rules[0].value).toBe('Test');
      expect(onQueryChange.mock.calls[7][0].rules[0].operator).toBe('=');
      expect(onQueryChange.mock.calls[7][0].rules[0].value).toBe('Test');
    });
  });

  describe('getDefaultField prop', () => {
    const onQueryChange = jest.fn();
    const fields: Field[] = [
      { name: 'field1', label: 'Field 1' },
      { name: 'field2', label: 'Field 2' }
    ];

    afterEach(() => {
      onQueryChange.mockReset();
    });

    it('sets the default field as a string', () => {
      const { container } = render(
        <QueryBuilder getDefaultField="field2" fields={fields} onQueryChange={onQueryChange} />
      );
      userEvent.click(container.getElementsByClassName(standardClassnames.addRule)[0]);
      expect(onQueryChange.mock.calls[1][0].rules[0].field).toBe('field2');
    });

    it('sets the default field as a function', () => {
      const { container } = render(
        <QueryBuilder
          getDefaultField={() => 'field2'}
          fields={fields}
          onQueryChange={onQueryChange}
        />
      );
      userEvent.click(container.getElementsByClassName(standardClassnames.addRule)[0]);
      expect(onQueryChange.mock.calls[1][0].rules[0].field).toBe('field2');
    });
  });

  describe('getDefaultOperator prop', () => {
    const onQueryChange = jest.fn();
    const fields: Field[] = [{ name: 'field1', label: 'Field 1' }];

    afterEach(() => {
      onQueryChange.mockReset();
    });

    it('sets the default operator as a string', () => {
      const { container } = render(
        <QueryBuilder
          getDefaultOperator="beginsWith"
          fields={fields}
          onQueryChange={onQueryChange}
        />
      );
      userEvent.click(container.getElementsByClassName(standardClassnames.addRule)[0]);
      expect(onQueryChange.mock.calls[1][0].rules[0].operator).toBe('beginsWith');
    });

    it('sets the default operator as a function', () => {
      const { container } = render(
        <QueryBuilder
          getDefaultOperator={() => 'beginsWith'}
          fields={fields}
          onQueryChange={onQueryChange}
        />
      );
      userEvent.click(container.getElementsByClassName(standardClassnames.addRule)[0]);
      expect(onQueryChange.mock.calls[1][0].rules[0].operator).toBe('beginsWith');
    });
  });

  describe('defaultOperator property in field', () => {
    it('sets the default operator', () => {
      const fields: Field[] = [{ name: 'field1', label: 'Field 1', defaultOperator: 'beginsWith' }];
      const onQueryChange = jest.fn();
      const { container } = render(<QueryBuilder fields={fields} onQueryChange={onQueryChange} />);
      userEvent.click(container.getElementsByClassName(standardClassnames.addRule)[0]);
      expect(onQueryChange.mock.calls[1][0].rules[0].operator).toBe('beginsWith');
    });
  });

  describe('getDefaultValue prop', () => {
    it('sets the default value', () => {
      const onQueryChange = jest.fn();
      const fields: Field[] = [
        { name: 'field1', label: 'Field 1' },
        { name: 'field2', label: 'Field 2' }
      ];
      const { container } = render(
        <QueryBuilder
          getDefaultValue={() => 'Test Value'}
          fields={fields}
          onQueryChange={onQueryChange}
        />
      );
      userEvent.click(container.getElementsByClassName(standardClassnames.addRule)[0]);
      expect(onQueryChange.mock.calls[1][0].rules[0].value).toBe('Test Value');
    });
  });

  describe('onAddRule prop', () => {
    it('cancels the rule addition', () => {
      const onQueryChange = jest.fn();
      const onAddRule = jest.fn(() => false as const);
      const { container } = render(
        <QueryBuilder onAddRule={onAddRule} onQueryChange={onQueryChange} />
      );
      expect(onQueryChange).toHaveBeenCalledTimes(1);

      userEvent.click(container.getElementsByClassName(standardClassnames.addRule)[0]);

      expect(onAddRule).toHaveBeenCalled();
      expect(onQueryChange).toHaveBeenCalledTimes(1);
    });

    it('modifies the rule addition', () => {
      const onQueryChange = jest.fn();
      const rule: RuleType = { field: 'test', operator: '=', value: 'modified' };
      const { container } = render(
        <QueryBuilder onAddRule={() => rule} onQueryChange={onQueryChange} />
      );

      userEvent.click(container.getElementsByClassName(standardClassnames.addRule)[0]);

      expect(onQueryChange.mock.calls[1][0].rules[0].value).toBe('modified');
    });
  });

  describe('onAddGroup prop', () => {
    it('cancels the group addition', () => {
      const onQueryChange = jest.fn();
      const onAddGroup = jest.fn(() => false as const);
      const { container } = render(
        <QueryBuilder onAddGroup={onAddGroup} onQueryChange={onQueryChange} />
      );

      expect(onQueryChange).toHaveBeenCalledTimes(1);

      userEvent.click(container.getElementsByClassName(standardClassnames.addGroup)[0]);

      expect(onAddGroup).toHaveBeenCalled();
      expect(onQueryChange).toHaveBeenCalledTimes(1);
    });

    it('modifies the group addition', () => {
      const onQueryChange = jest.fn();
      const group: RuleGroupType = { combinator: 'fake', rules: [] };
      const { container } = render(
        <QueryBuilder onAddGroup={() => group} onQueryChange={onQueryChange} />
      );

      userEvent.click(container.getElementsByClassName(standardClassnames.addGroup)[0]);

      expect(onQueryChange.mock.calls[1][0].rules[0].combinator).toBe('fake');
    });
  });

  describe('defaultValue property in field', () => {
    it('sets the default value', () => {
      const fields: Field[] = [
        { name: 'field1', label: 'Field 1', defaultValue: 'Test Value 1' },
        { name: 'field2', label: 'Field 2', defaultValue: 'Test Value 2' }
      ];
      const onQueryChange = jest.fn();
      const { container } = render(<QueryBuilder fields={fields} onQueryChange={onQueryChange} />);

      userEvent.click(container.getElementsByClassName(standardClassnames.addRule)[0]);

      expect(onQueryChange.mock.calls[1][0].rules[0].value).toBe('Test Value 1');
    });
  });

  describe('values property in field', () => {
    it('sets the values list', () => {
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
      const onQueryChange = jest.fn();
      const { container } = render(
        <QueryBuilder
          getValueEditorType={() => 'select'}
          fields={fields}
          onQueryChange={onQueryChange}
        />
      );

      userEvent.click(container.getElementsByClassName(standardClassnames.addRule)[0]);

      expect(container.getElementsByClassName(standardClassnames.value)).toHaveLength(1);
    });
  });

  describe('inputType property in field', () => {
    it('sets the input type', () => {
      const fields: Field[] = [{ name: 'field1', label: 'Field 1', inputType: 'number' }];
      const onQueryChange = jest.fn();
      const { container } = render(<QueryBuilder fields={fields} onQueryChange={onQueryChange} />);

      userEvent.click(container.getElementsByClassName(standardClassnames.addRule)[0]);

      expect(container.querySelector('input[type="number"]')).toBeDefined();
    });
  });

  describe('valueEditorType property in field', () => {
    it('sets the value editor type', () => {
      const fields: Field[] = [{ name: 'field1', label: 'Field 1', valueEditorType: 'select' }];
      const onQueryChange = jest.fn();
      const { container } = render(<QueryBuilder fields={fields} onQueryChange={onQueryChange} />);

      userEvent.click(container.getElementsByClassName(standardClassnames.addRule)[0]);

      expect(container.querySelector(`select.${standardClassnames.value}`)).toBeDefined();
    });
  });

  describe('operators property in field', () => {
    it('sets the operators options', () => {
      const fields: Field[] = [
        { name: 'field1', label: 'Field 1', operators: [{ name: '=', label: '=' }] },
        { name: 'field2', label: 'Field 2', operators: [{ name: '=', label: '=' }] }
      ];
      const onQueryChange = jest.fn();
      const { container } = render(<QueryBuilder fields={fields} onQueryChange={onQueryChange} />);

      userEvent.click(container.getElementsByClassName(standardClassnames.addRule)[0]);

      expect(container.querySelector(`select.${standardClassnames.operators}`)).toBeDefined();
      expect(
        container.querySelectorAll(`select.${standardClassnames.operators} option`)
      ).toHaveLength(1);
    });
  });

  describe('auto-select field', () => {
    it('hides the operator selector and value editor', () => {
      const fields: Field[] = [
        { name: 'field1', label: 'Field 1', operators: [{ name: '=', label: '=' }] },
        { name: 'field2', label: 'Field 2', operators: [{ name: '=', label: '=' }] }
      ];
      const onQueryChange = jest.fn();
      const { container } = render(
        <QueryBuilder fields={fields} onQueryChange={onQueryChange} autoSelectField={false} />
      );

      userEvent.click(container.getElementsByClassName(standardClassnames.addRule)[0]);

      expect(container.querySelectorAll(`select.${standardClassnames.fields}`)).toHaveLength(1);
      expect(container.querySelectorAll(`select.${standardClassnames.operators}`)).toHaveLength(0);
      expect(container.querySelectorAll(`.${standardClassnames.value}`)).toHaveLength(0);
    });
  });

  describe('add rule to new groups', () => {
    let selectors: RenderResult;
    const query: RuleGroupType = { combinator: 'and', rules: [] };
    const onQueryChange = jest.fn();

    beforeEach(() => {
      selectors = render(
        <QueryBuilder query={query} onQueryChange={onQueryChange} addRuleToNewGroups />
      );
    });

    it('does not add a rule when the component is created', () => {
      expect(() => selectors.getByTestId('rule')).toThrow();
    });

    it('adds a rule when a new group is created', () => {
      userEvent.click(selectors.container.getElementsByClassName(standardClassnames.addGroup)[0]);
      expect(
        ((onQueryChange.mock.calls[2][0] as RuleGroupType).rules[0] as RuleGroupType).rules[0]
      ).toHaveProperty('field', '~');
    });

    it('adds a rule when mounted if no initial query is provided', () => {
      const { getByTestId } = render(<QueryBuilder addRuleToNewGroups />);
      expect(getByTestId('rule')).toBeDefined();
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
      const { getByTestId } = render(
        <QueryBuilder onQueryChange={onQueryChange} independentCombinators />
      );
      expect(getByTestId('rule-group')).toBeDefined();
      expect(onQueryChange.mock.calls[0][0]).not.toHaveProperty('combinator');
    });

    it('should render a rule group with addRuleToNewGroups', () => {
      const { getByTestId } = render(<QueryBuilder addRuleToNewGroups independentCombinators />);
      expect(getByTestId('rule')).toBeDefined();
    });

    it('should call onQueryChange with query', () => {
      const query: RuleGroupTypeIC = {
        rules: [],
        not: false
      };
      const onQueryChange = jest.fn();
      render(<QueryBuilder onQueryChange={onQueryChange} independentCombinators />);
      expect(onQueryChange).toHaveBeenCalledTimes(1);
      expect(onQueryChange.mock.calls[0][0]).toMatchObject(query);
    });

    it('should add rules with independent combinators', () => {
      const { container, getAllByTestId, getByTestId } = render(
        <QueryBuilder independentCombinators />
      );
      expect(container.getElementsByClassName(standardClassnames.combinators)).toHaveLength(0);
      userEvent.click(container.getElementsByClassName(standardClassnames.addRule)[0]);
      expect(getByTestId('rule')).toBeDefined();
      expect(container.getElementsByClassName(standardClassnames.combinators)).toHaveLength(0);
      userEvent.click(container.getElementsByClassName(standardClassnames.addRule)[0]);
      expect(getAllByTestId('rule')).toHaveLength(2);
      expect(container.getElementsByClassName(standardClassnames.combinators)).toHaveLength(1);
      expect(
        (container.getElementsByClassName(standardClassnames.combinators)[0] as HTMLSelectElement)
          .value
      ).toBe('and');
      userEvent.selectOptions(
        container.getElementsByClassName(standardClassnames.combinators)[0],
        'or'
      );
      userEvent.click(container.getElementsByClassName(standardClassnames.addRule)[0]);
      const combinatorSelectors = container.getElementsByClassName(standardClassnames.combinators);
      expect((combinatorSelectors[0] as HTMLSelectElement).value).toBe('or');
    });

    it('should add groups with independent combinators', () => {
      const { container, getAllByTestId } = render(<QueryBuilder independentCombinators />);
      expect(container.getElementsByClassName(standardClassnames.combinators)).toHaveLength(0);
      userEvent.click(container.getElementsByClassName(standardClassnames.addGroup)[0]);
      expect(getAllByTestId('rule-group')).toHaveLength(2);
      expect(container.getElementsByClassName(standardClassnames.combinators)).toHaveLength(0);
      userEvent.click(container.getElementsByClassName(standardClassnames.addGroup)[0]);
      expect(getAllByTestId('rule-group')).toHaveLength(3);
      expect(container.getElementsByClassName(standardClassnames.combinators)).toHaveLength(1);
      expect(
        (container.getElementsByClassName(standardClassnames.combinators)[0] as HTMLSelectElement)
          .value
      ).toBe('and');
      userEvent.selectOptions(
        container.getElementsByClassName(standardClassnames.combinators)[0],
        'or'
      );
      userEvent.click(container.getElementsByClassName(standardClassnames.addGroup)[0]);
      const combinatorSelectors = container.getElementsByClassName(standardClassnames.combinators);
      expect((combinatorSelectors[0] as HTMLSelectElement).value).toBe('or');
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
      const { container, getAllByTestId, rerender } = render(
        <QueryBuilder query={query} onQueryChange={onQueryChange} independentCombinators />
      );
      expect(getAllByTestId('rule')).toHaveLength(3);
      expect(container.getElementsByClassName(standardClassnames.combinators)).toHaveLength(2);
      userEvent.click(container.getElementsByClassName(standardClassnames.removeRule)[1]);
      expect((onQueryChange.mock.calls[1][0] as RuleGroupType).rules[0]).toHaveProperty(
        'value',
        '1'
      );
      expect((onQueryChange.mock.calls[1][0] as RuleGroupType).rules[1]).toBe('or');
      expect((onQueryChange.mock.calls[1][0] as RuleGroupType).rules[2]).toHaveProperty(
        'value',
        '3'
      );

      rerender(
        <QueryBuilder
          query={onQueryChange.mock.calls[1][0]}
          onQueryChange={onQueryChange}
          independentCombinators
        />
      );
      userEvent.click(container.getElementsByClassName(standardClassnames.removeRule)[0]);
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
      const { container, getAllByTestId, rerender } = render(
        <QueryBuilder query={query} onQueryChange={onQueryChange} independentCombinators />
      );

      expect(getAllByTestId('rule-group')).toHaveLength(4);
      expect(container.getElementsByClassName(standardClassnames.combinators)).toHaveLength(2);
      userEvent.click(container.getElementsByClassName(standardClassnames.removeGroup)[1]);
      expect((onQueryChange.mock.calls[1][0] as RuleGroupType).rules[0]).toHaveProperty(
        'rules',
        []
      );
      expect((onQueryChange.mock.calls[1][0] as RuleGroupType).rules[1]).toBe('or');
      expect((onQueryChange.mock.calls[1][0] as RuleGroupType).rules[2]).toHaveProperty(
        'rules',
        []
      );

      rerender(
        <QueryBuilder
          query={onQueryChange.mock.calls[1][0]}
          onQueryChange={onQueryChange}
          independentCombinators
        />
      );
      userEvent.click(container.getElementsByClassName(standardClassnames.removeGroup)[0]);
      expect((onQueryChange.mock.calls[2][0] as RuleGroupType).rules).toHaveLength(1);
      expect((onQueryChange.mock.calls[2][0] as RuleGroupType).rules[0]).toHaveProperty(
        'rules',
        []
      );
    });
  });

  describe('validation', () => {
    it('should not validate if no validator function is provided', () => {
      const { container } = render(<QueryBuilder />);
      expect(container.querySelectorAll('div')[0].classList).not.toContain(
        standardClassnames.valid
      );
      expect(container.querySelectorAll('div')[0].classList).not.toContain(
        standardClassnames.invalid
      );
    });

    it('should validate groups if default validator function is provided', () => {
      const { container } = render(<QueryBuilder validator={defaultValidator} />);
      userEvent.click(container.getElementsByClassName(standardClassnames.addGroup)[0]);
      // Expect the root group to be valid (contains the inner group)
      expect(
        container.querySelectorAll(`.${standardClassnames.ruleGroup}.${standardClassnames.valid}`)
      ).toHaveLength(1);
      // Expect the inner group to be invalid (empty)
      expect(
        container.querySelectorAll(`.${standardClassnames.ruleGroup}.${standardClassnames.invalid}`)
      ).toHaveLength(1);
    });

    it('should use custom validator function returning false', () => {
      const validator = jest.fn(() => false);
      const { container } = render(<QueryBuilder validator={validator} />);
      expect(validator).toHaveBeenCalled();
      expect(container.querySelectorAll('div')[0].classList).not.toContain(
        standardClassnames.valid
      );
      expect(container.querySelectorAll('div')[0].classList).toContain(standardClassnames.invalid);
    });

    it('should use custom validator function returning true', () => {
      const validator = jest.fn(() => true);
      const { container } = render(<QueryBuilder validator={validator} />);
      expect(validator).toHaveBeenCalled();
      expect(container.querySelectorAll('div')[0].classList).toContain(standardClassnames.valid);
      expect(container.querySelectorAll('div')[0].classList).not.toContain(
        standardClassnames.invalid
      );
    });

    it('should pass down validationMap to children', () => {
      const valMap: ValidationMap = { id: { valid: false, reasons: ['invalid'] } };
      const RuleGroupValMapDisplay = (props: RuleGroupProps) => (
        <div data-testid="rule-group">{JSON.stringify(props.schema.validationMap)}</div>
      );
      const { getByTestId } = render(
        <QueryBuilder
          validator={() => valMap}
          controlElements={{ ruleGroup: RuleGroupValMapDisplay }}
        />
      );
      expect(getByTestId('rule-group').innerHTML).toBe(JSON.stringify(valMap));
    });
  });

  describe('enableDragAndDrop', () => {
    describe('group level combinators', () => {
      it('should set data-dnd attribute appropriately', () => {
        const { container, rerender } = render(<QueryBuilder />);
        expect(container.querySelectorAll('div')[0].dataset.dnd).toBe('disabled');
        rerender(<QueryBuilder enableDragAndDrop />);
        expect(container.querySelectorAll('div')[0].dataset.dnd).toBe('enabled');
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

      it('moves a rule from last to middle by dropping on inline combinator', () => {
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
        const combinators = getAllByTestId('inline-combinator');
        simulateDragDrop(
          getHandlerId(rules[2], 'drag'),
          getHandlerId(combinators[0], 'drop'),
          getDndBackend()
        );
        expect(stripQueryIds(onQueryChange.mock.calls[1][0])).toEqual({
          rules: [
            { field: 'field0', operator: '=', value: '0' },
            'and',
            { field: 'field2', operator: '=', value: '2' },
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
