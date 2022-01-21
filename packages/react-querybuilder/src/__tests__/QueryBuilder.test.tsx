import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { simulateDragDrop, wrapWithTestBackend } from 'react-dnd-test-utils';
import { defaultTranslations as t, standardClassnames as sc, TestID } from '../defaults';
import { QueryBuilder as QueryBuilderOriginal } from '../QueryBuilder';
import type {
  Field,
  NameLabelPair,
  OptionGroup,
  RuleGroupProps,
  RuleGroupType,
  RuleGroupTypeIC,
  RuleType,
  ValidationMap,
} from '../types';
import { defaultValidator, formatQuery } from '../utils';

const [QueryBuilder, getDndBackendOriginal] = wrapWithTestBackend(QueryBuilderOriginal);
// This is just a type guard against `undefined`
const getDndBackend = () => getDndBackendOriginal()!;

const getHandlerId = (el: HTMLElement, dragDrop: 'drag' | 'drop') => () =>
  el.getAttribute(`data-${dragDrop}monitorid`);

const stripQueryIds = (query: any) => JSON.parse(formatQuery(query, 'json_without_ids') as string);

describe('when rendered', () => {
  it('should have the correct className', () => {
    const { container } = render(<QueryBuilder />);
    expect(container.querySelectorAll('div')[0]).toHaveClass(sc.queryBuilder);
  });

  it('should render the root RuleGroup', () => {
    const { getByTestId } = render(<QueryBuilder />);
    expect(() => getByTestId(TestID.ruleGroup)).not.toThrow();
  });
});

describe('when rendered with defaultQuery only', () => {
  it('changes the query in uncontrolled state', () => {
    const { getAllByTestId, getByTestId } = render(
      <QueryBuilder
        defaultQuery={{
          combinator: 'and',
          rules: [{ field: 'firstName', operator: '=', value: 'Steve' }],
        }}
      />
    );
    expect(getAllByTestId(TestID.rule)).toHaveLength(1);
    userEvent.click(getByTestId(TestID.addRule));
    expect(getAllByTestId(TestID.rule)).toHaveLength(2);
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
      not: false,
    };
    expect(onQueryChange.mock.calls[0][0]).toMatchObject(query);
  });
});

describe('when initial query without fields is provided, create rule should work', () => {
  it('should be able to create rule on add rule click', () => {
    const { getByTestId } = render(<QueryBuilder />);
    userEvent.click(getByTestId(TestID.addRule));
    expect(() => getByTestId(TestID.rule)).not.toThrow();
  });
});

describe('when initial query with duplicate fields is provided', () => {
  it('passes down a unique set of fields (by name)', () => {
    const { getAllByTestId, getByTestId } = render(
      <QueryBuilder
        fields={[
          { name: 'dupe', label: 'One' },
          { name: 'dupe', label: 'Two' },
        ]}
      />
    );
    userEvent.click(getByTestId(TestID.addRule));
    expect(() => getByTestId(TestID.rule)).not.toThrow();
    expect(getAllByTestId(TestID.fields)).toHaveLength(1);
  });
});

describe('when initial query, without ID, is provided', () => {
  const queryWithoutID: RuleGroupType = {
    combinator: 'and',
    not: false,
    rules: [
      {
        field: 'firstName',
        value: 'Test without ID',
        operator: '=',
      },
    ],
  };
  const fields: Field[] = [
    { name: 'firstName', label: 'First Name' },
    { name: 'lastName', label: 'Last Name' },
    { name: 'age', label: 'Age' },
  ];

  const setup = () => ({
    selectors: render(<QueryBuilder query={queryWithoutID as RuleGroupType} fields={fields} />),
  });

  it('should contain a <Rule /> with the correct props', () => {
    const { selectors } = setup();
    expect(() => selectors.getByTestId(TestID.rule)).not.toThrow();
    expect(selectors.getByTestId(TestID.fields)).toHaveValue('firstName');
    expect(selectors.getByTestId(TestID.operators)).toHaveValue('=');
    expect(selectors.getByTestId(TestID.valueEditor)).toHaveValue('Test without ID');
  });

  it('should have a select control with the provided fields', () => {
    const { selectors } = setup();
    expect(selectors.getByTestId(TestID.fields).querySelectorAll('option')).toHaveLength(3);
  });

  it('should have a field selector with the correct field', () => {
    const { selectors } = setup();
    expect(selectors.getByTestId(TestID.fields)).toHaveValue('firstName');
  });

  it('should have an operator selector with the correct operator', () => {
    const { selectors } = setup();
    expect(selectors.getByTestId(TestID.operators)).toHaveValue('=');
  });

  it('should have an input control with the correct value', () => {
    const { selectors } = setup();
    expect(selectors.getByTestId(TestID.rule).querySelector('input')).toHaveValue(
      'Test without ID'
    );
  });
});

describe('when fields are provided with optgroups', () => {
  const query: RuleGroupType = {
    combinator: 'and',
    not: false,
    rules: [
      {
        field: 'firstName',
        value: 'Test without ID',
        operator: '=',
      },
    ],
  };
  const fields: OptionGroup<Field>[] = [
    {
      label: 'Names',
      options: [
        { name: 'firstName', label: 'First Name' },
        { name: 'lastName', label: 'Last Name' },
      ],
    },
    { label: 'Numbers', options: [{ name: 'age', label: 'Age' }] },
  ];

  const setup = () => ({
    selectors: render(<QueryBuilder defaultQuery={query} fields={fields} />),
  });

  it('renders correctly', () => {
    const { selectors } = setup();
    expect(selectors.getByTestId(TestID.fields).querySelectorAll('optgroup')).toHaveLength(2);
  });

  it('selects the correct field', () => {
    const { selectors } = setup();
    userEvent.click(selectors.getByTestId(TestID.addRule));
    expect(selectors.getAllByTestId(TestID.fields)[1]).toHaveValue('firstName');
  });

  it('selects the default option', () => {
    const { selectors } = setup();
    selectors.rerender(
      <QueryBuilder defaultQuery={query} fields={fields} autoSelectField={false} />
    );
    userEvent.click(selectors.getByTestId(TestID.addRule));
    expect(selectors.getAllByTestId(TestID.fields)[1]).toHaveValue('~');
  });
});

describe('when initial operators are provided', () => {
  const operators: NameLabelPair[] = [
    { name: 'null', label: 'Custom Is Null' },
    { name: 'notNull', label: 'Is Not Null' },
    { name: 'in', label: 'In' },
    { name: 'notIn', label: 'Not In' },
  ];
  const fields: Field[] = [
    { name: 'firstName', label: 'First Name' },
    { name: 'lastName', label: 'Last Name' },
    { name: 'age', label: 'Age' },
  ];
  const query: RuleGroupType = {
    combinator: 'and',
    not: false,
    rules: [
      {
        field: 'firstName',
        value: 'Test',
        operator: '=',
      },
    ],
  };

  const setup = () => ({
    selectors: render(<QueryBuilder operators={operators} fields={fields} query={query} />),
  });

  it('should use the given operators', () => {
    const { selectors } = setup();
    expect(selectors.getByTestId(TestID.operators).querySelectorAll('option')).toHaveLength(4);
  });

  it('should match the label of the first operator', () => {
    const { selectors } = setup();
    expect(selectors.getByTestId(TestID.operators).querySelectorAll('option')[0]).toHaveTextContent(
      'Custom Is Null'
    );
  });
});

describe('when getOperators fn prop is provided', () => {
  const fields: Field[] = [
    { name: 'firstName', label: 'First Name' },
    { name: 'lastName', label: 'Last Name' },
    { name: 'age', label: 'Age' },
  ];
  const query: RuleGroupType = {
    combinator: 'or',
    not: false,
    rules: [
      {
        field: 'lastName',
        value: 'Another Test',
        operator: '=',
      },
    ],
  };

  it('should invoke custom getOperators function', () => {
    const getOperators = jest.fn(() => [{ name: 'op1', label: 'Operator 1' }]);
    render(<QueryBuilder query={query} fields={fields} getOperators={getOperators} />);
    expect(getOperators).toHaveBeenCalled();
  });

  it('should handle invalid getOperators return value', () => {
    const { getByTestId } = render(
      <QueryBuilder query={query} fields={fields} getOperators={() => null} />
    );
    expect(getByTestId(TestID.operators)).toHaveValue('=');
  });
});

describe('when getValueEditorType fn prop is provided', () => {
  const fields: Field[] = [
    { name: 'firstName', label: 'First Name' },
    { name: 'lastName', label: 'Last Name' },
    { name: 'age', label: 'Age' },
  ];
  const query: RuleGroupType = {
    combinator: 'or',
    not: false,
    rules: [
      {
        field: 'lastName',
        value: 'Another Test',
        operator: '=',
      },
    ],
  };

  it('should invoke custom getValueEditorType function', () => {
    const getValueEditorType = jest.fn(() => 'text' as const);
    render(<QueryBuilder query={query} fields={fields} getValueEditorType={getValueEditorType} />);
    expect(getValueEditorType).toHaveBeenCalled();
  });

  it('should handle invalid getValueEditorType function', () => {
    const { getByTestId } = render(
      <QueryBuilder query={query} fields={fields} getValueEditorType={() => null} />
    );
    expect(getByTestId(TestID.valueEditor)).toHaveAttribute('type', 'text');
  });
});

describe('when getInputType fn prop is provided', () => {
  const fields: Field[] = [
    { name: 'firstName', label: 'First Name' },
    { name: 'lastName', label: 'Last Name' },
    { name: 'age', label: 'Age' },
  ];
  const rule: RuleType = {
    field: 'lastName',
    value: 'Another Test',
    operator: '=',
  };
  const query: RuleGroupType = {
    combinator: 'or',
    not: false,
    rules: [rule],
  };

  it('should invoke custom getInputType function', () => {
    const getInputType = jest.fn(() => 'text' as const);
    render(<QueryBuilder query={query} fields={fields} getInputType={getInputType} />);
    expect(getInputType).toHaveBeenCalledWith(rule.field, rule.operator);
  });

  it('should handle invalid getInputType function', () => {
    const { getByTestId } = render(
      <QueryBuilder query={query} fields={fields} getInputType={() => null} />
    );
    expect(getByTestId(TestID.valueEditor)).toHaveAttribute('type', 'text');
  });
});

describe('when getValues fn prop is provided', () => {
  const getValueEditorType = () => 'select' as const;
  const fields: Field[] = [
    { name: 'firstName', label: 'First Name' },
    { name: 'lastName', label: 'Last Name' },
    { name: 'age', label: 'Age' },
  ];
  const rule: RuleType = {
    field: 'lastName',
    operator: '=',
    value: 'Another Test',
  };
  const query: RuleGroupType = {
    combinator: 'or',
    not: false,
    rules: [rule],
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
    expect(getValues).toHaveBeenCalledWith(rule.field, rule.operator);
  });

  it('should generate the correct number of options', () => {
    const getValues = jest.fn(() => [{ name: 'test', label: 'Test' }]);
    const { getByTestId } = render(
      <QueryBuilder
        query={query}
        fields={fields}
        getValueEditorType={getValueEditorType}
        getValues={getValues}
      />
    );
    const opts = getByTestId(TestID.valueEditor).querySelectorAll('option');
    expect(opts).toHaveLength(1);
  });

  it('should handle invalid getValues function', () => {
    const { getByTestId } = render(
      <QueryBuilder query={query} fields={fields} getValues={() => null as any} />
    );
    const select = getByTestId(TestID.valueEditor);
    const opts = select.querySelectorAll('option');
    expect(opts).toHaveLength(0);
  });
});

describe('actions', () => {
  const fields: Field[] = [
    { name: 'field1', label: 'Field 1' },
    { name: 'field2', label: 'Field 2' },
  ];

  const setup = () => {
    const onQueryChange = jest.fn();
    return {
      onQueryChange,
      selectors: render(<QueryBuilder fields={fields} onQueryChange={onQueryChange} />),
    };
  };

  it('should create a new rule and remove that rule', () => {
    const { selectors, onQueryChange } = setup();
    userEvent.click(selectors.getByTestId(TestID.addRule));

    expect(selectors.getByTestId(TestID.rule)).toBeDefined();
    expect(onQueryChange.mock.calls[0][0].rules).toHaveLength(0);
    expect(onQueryChange.mock.calls[1][0].rules).toHaveLength(1);

    userEvent.click(selectors.getByTestId(TestID.removeRule));

    expect(() => selectors.getByTestId(TestID.rule)).toThrow();
    expect(onQueryChange.mock.calls[2][0].rules).toHaveLength(0);
  });

  it('should create a new group and remove that group', () => {
    const { selectors, onQueryChange } = setup();
    userEvent.click(selectors.getByTestId(TestID.addGroup));

    expect(selectors.getAllByTestId(TestID.ruleGroup)).toHaveLength(2);
    expect(onQueryChange.mock.calls[0][0].rules).toHaveLength(0);
    expect(onQueryChange.mock.calls[1][0].rules).toHaveLength(1);
    expect(onQueryChange.mock.calls[1][0].rules[0].combinator).toBe('and');

    userEvent.click(selectors.getByTestId(TestID.removeGroup));

    expect(selectors.getAllByTestId(TestID.ruleGroup)).toHaveLength(1);
    expect(onQueryChange.mock.calls[2][0].rules).toHaveLength(0);
  });

  it('should create a new rule and change the fields', () => {
    const { selectors, onQueryChange } = setup();
    userEvent.click(selectors.getByTestId(TestID.addRule));

    expect(onQueryChange.mock.calls[0][0].rules).toHaveLength(0);
    expect(onQueryChange.mock.calls[1][0].rules).toHaveLength(1);

    userEvent.selectOptions(selectors.getByTestId(TestID.fields), 'field2');
    expect(onQueryChange.mock.calls[2][0].rules[0].field).toBe('field2');
  });

  it('should create a new rule and change the operator', () => {
    const { selectors, onQueryChange } = setup();
    userEvent.click(selectors.getByTestId(TestID.addRule));

    expect(onQueryChange.mock.calls[0][0].rules).toHaveLength(0);
    expect(onQueryChange.mock.calls[1][0].rules).toHaveLength(1);

    userEvent.selectOptions(selectors.getByTestId(TestID.operators), '!=');
    expect(onQueryChange.mock.calls[2][0].rules[0].operator).toBe('!=');
  });

  it('should change the combinator of the root group', () => {
    const { selectors, onQueryChange } = setup();
    expect(onQueryChange.mock.calls[0][0].rules).toHaveLength(0);

    userEvent.selectOptions(selectors.getByTestId(TestID.combinators), 'or');

    expect(onQueryChange.mock.calls[1][0].rules).toHaveLength(0);
    expect(onQueryChange.mock.calls[1][0].combinator).toBe('or');
  });

  it('should set default value for a rule', () => {
    const { selectors, onQueryChange } = setup();
    selectors.rerender(
      <QueryBuilder
        fields={fields}
        onQueryChange={onQueryChange}
        getValues={(field: string) => {
          if (field === 'field1') {
            return [
              { name: 'value1', label: 'Value 1' },
              { name: 'value2', label: 'Value 2' },
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

    userEvent.click(selectors.getByTestId(TestID.addRule));

    expect(onQueryChange.mock.calls[1][0].rules).toHaveLength(1);
    expect(onQueryChange.mock.calls[1][0].rules[0].value).toBe('value1');

    userEvent.selectOptions(selectors.getByTestId(TestID.fields), 'field2');

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

    userEvent.click(selectors.getByTestId(TestID.addRule));

    expect(onQueryChange.mock.calls[3][0].rules).toHaveLength(2);
    expect(onQueryChange.mock.calls[3][0].rules[0].value).toBe(false);
  });
});

describe('resetOnFieldChange prop', () => {
  const fields: Field[] = [
    { name: 'field1', label: 'Field 1' },
    { name: 'field2', label: 'Field 2' },
  ];

  const setup = () => {
    const onQueryChange = jest.fn();
    return {
      onQueryChange,
      selectors: render(<QueryBuilder fields={fields} onQueryChange={onQueryChange} />),
    };
  };

  it('resets the operator and value when true', () => {
    const { selectors, onQueryChange } = setup();
    userEvent.click(selectors.getByTestId(TestID.addRule));
    userEvent.selectOptions(selectors.getByTestId(TestID.operators), '>');
    userEvent.type(selectors.getByTestId(TestID.valueEditor), 'Test');
    userEvent.selectOptions(selectors.getByTestId(TestID.fields), 'field2');

    expect(onQueryChange.mock.calls[3][0].rules[0].operator).toBe('>');
    expect(onQueryChange.mock.calls[6][0].rules[0].value).toBe('Test');
    expect(onQueryChange.mock.calls[7][0].rules[0].operator).toBe('=');
    expect(onQueryChange.mock.calls[7][0].rules[0].value).toBe('');
  });

  it('does not reset the operator and value when false', () => {
    const { selectors, onQueryChange } = setup();
    selectors.rerender(
      <QueryBuilder resetOnFieldChange={false} fields={fields} onQueryChange={onQueryChange} />
    );
    userEvent.click(selectors.getByTestId(TestID.addRule));
    userEvent.selectOptions(selectors.getByTestId(TestID.operators), '>');
    userEvent.type(selectors.getByTestId(TestID.valueEditor), 'Test');
    userEvent.selectOptions(selectors.getByTestId(TestID.fields), 'field2');

    expect(onQueryChange.mock.calls[3][0].rules[0].operator).toBe('>');
    expect(onQueryChange.mock.calls[6][0].rules[0].value).toBe('Test');
    expect(onQueryChange.mock.calls[7][0].rules[0].operator).toBe('>');
    expect(onQueryChange.mock.calls[7][0].rules[0].value).toBe('Test');
  });
});

describe('resetOnOperatorChange prop', () => {
  const fields: Field[] = [
    { name: 'field1', label: 'Field 1' },
    { name: 'field2', label: 'Field 2' },
  ];

  it('resets the value when true', () => {
    const onQueryChange = jest.fn();
    const { getByTestId } = render(
      <QueryBuilder resetOnOperatorChange fields={fields} onQueryChange={onQueryChange} />
    );
    userEvent.click(getByTestId(TestID.addRule));
    userEvent.selectOptions(getByTestId(TestID.operators), '>');
    userEvent.type(getByTestId(TestID.valueEditor), 'Test');
    userEvent.selectOptions(getByTestId(TestID.operators), '=');

    expect(onQueryChange.mock.calls[3][0].rules[0].operator).toBe('>');
    expect(onQueryChange.mock.calls[6][0].rules[0].value).toBe('Test');
    expect(onQueryChange.mock.calls[7][0].rules[0].operator).toBe('=');
    expect(onQueryChange.mock.calls[7][0].rules[0].value).toBe('');
  });

  it('does not reset the value when false', () => {
    const onQueryChange = jest.fn();
    const { getByTestId } = render(
      <QueryBuilder resetOnOperatorChange={false} fields={fields} onQueryChange={onQueryChange} />
    );
    userEvent.click(getByTestId(TestID.addRule));
    userEvent.selectOptions(getByTestId(TestID.operators), '>');
    userEvent.type(getByTestId(TestID.valueEditor), 'Test');
    userEvent.selectOptions(getByTestId(TestID.operators), '=');

    expect(onQueryChange.mock.calls[3][0].rules[0].operator).toBe('>');
    expect(onQueryChange.mock.calls[6][0].rules[0].value).toBe('Test');
    expect(onQueryChange.mock.calls[7][0].rules[0].operator).toBe('=');
    expect(onQueryChange.mock.calls[7][0].rules[0].value).toBe('Test');
  });
});

describe('getDefaultField prop', () => {
  const fields: Field[] = [
    { name: 'field1', label: 'Field 1' },
    { name: 'field2', label: 'Field 2' },
  ];

  it('sets the default field as a string', () => {
    const onQueryChange = jest.fn();
    const { getByTestId } = render(
      <QueryBuilder getDefaultField="field2" fields={fields} onQueryChange={onQueryChange} />
    );
    userEvent.click(getByTestId(TestID.addRule));
    expect(onQueryChange.mock.calls[1][0].rules[0].field).toBe('field2');
  });

  it('sets the default field as a function', () => {
    const onQueryChange = jest.fn();
    const { getByTestId } = render(
      <QueryBuilder
        getDefaultField={() => 'field2'}
        fields={fields}
        onQueryChange={onQueryChange}
      />
    );
    userEvent.click(getByTestId(TestID.addRule));
    expect(onQueryChange.mock.calls[1][0].rules[0].field).toBe('field2');
  });
});

describe('getDefaultOperator prop', () => {
  const fields: Field[] = [{ name: 'field1', label: 'Field 1' }];

  it('sets the default operator as a string', () => {
    const onQueryChange = jest.fn();
    const { getByTestId } = render(
      <QueryBuilder getDefaultOperator="beginsWith" fields={fields} onQueryChange={onQueryChange} />
    );
    userEvent.click(getByTestId(TestID.addRule));
    expect(onQueryChange.mock.calls[1][0].rules[0].operator).toBe('beginsWith');
  });

  it('sets the default operator as a function', () => {
    const onQueryChange = jest.fn();
    const { getByTestId } = render(
      <QueryBuilder
        getDefaultOperator={() => 'beginsWith'}
        fields={fields}
        onQueryChange={onQueryChange}
      />
    );
    userEvent.click(getByTestId(TestID.addRule));
    expect(onQueryChange.mock.calls[1][0].rules[0].operator).toBe('beginsWith');
  });
});

describe('defaultOperator property in field', () => {
  it('sets the default operator', () => {
    const fields: Field[] = [{ name: 'field1', label: 'Field 1', defaultOperator: 'beginsWith' }];
    const onQueryChange = jest.fn();
    const { getByTestId } = render(<QueryBuilder fields={fields} onQueryChange={onQueryChange} />);
    userEvent.click(getByTestId(TestID.addRule));
    expect(onQueryChange.mock.calls[1][0].rules[0].operator).toBe('beginsWith');
  });
});

describe('getDefaultValue prop', () => {
  it('sets the default value', () => {
    const onQueryChange = jest.fn();
    const fields: Field[] = [
      { name: 'field1', label: 'Field 1' },
      { name: 'field2', label: 'Field 2' },
    ];
    const { getByTestId } = render(
      <QueryBuilder
        getDefaultValue={() => 'Test Value'}
        fields={fields}
        onQueryChange={onQueryChange}
      />
    );
    userEvent.click(getByTestId(TestID.addRule));
    expect(onQueryChange.mock.calls[1][0].rules[0].value).toBe('Test Value');
  });
});

describe('onAddRule prop', () => {
  it('cancels the rule addition', () => {
    const onQueryChange = jest.fn();
    const onAddRule = jest.fn(() => false as const);
    const { getByTestId } = render(
      <QueryBuilder onAddRule={onAddRule} onQueryChange={onQueryChange} />
    );
    expect(onQueryChange).toHaveBeenCalledTimes(1);

    userEvent.click(getByTestId(TestID.addRule));

    expect(onAddRule).toHaveBeenCalled();
    expect(onQueryChange).toHaveBeenCalledTimes(1);
  });

  it('modifies the rule addition', () => {
    const onQueryChange = jest.fn();
    const rule: RuleType = { field: 'test', operator: '=', value: 'modified' };
    const { getByTestId } = render(
      <QueryBuilder onAddRule={() => rule} onQueryChange={onQueryChange} />
    );

    userEvent.click(getByTestId(TestID.addRule));

    expect(onQueryChange.mock.calls[1][0].rules[0].value).toBe('modified');
  });
});

describe('onAddGroup prop', () => {
  it('cancels the group addition', () => {
    const onQueryChange = jest.fn();
    const onAddGroup = jest.fn(() => false as const);
    const { getByTestId } = render(
      <QueryBuilder onAddGroup={onAddGroup} onQueryChange={onQueryChange} />
    );

    expect(onQueryChange).toHaveBeenCalledTimes(1);

    userEvent.click(getByTestId(TestID.addGroup));

    expect(onAddGroup).toHaveBeenCalled();
    expect(onQueryChange).toHaveBeenCalledTimes(1);
  });

  it('modifies the group addition', () => {
    const onQueryChange = jest.fn();
    const group: RuleGroupType = { combinator: 'fake', rules: [] };
    const { getByTestId } = render(
      <QueryBuilder onAddGroup={() => group} onQueryChange={onQueryChange} />
    );

    userEvent.click(getByTestId(TestID.addGroup));

    expect(onQueryChange.mock.calls[1][0].rules[0].combinator).toBe('fake');
  });
});

describe('defaultValue property in field', () => {
  it('sets the default value', () => {
    const fields: Field[] = [
      { name: 'field1', label: 'Field 1', defaultValue: 'Test Value 1' },
      { name: 'field2', label: 'Field 2', defaultValue: 'Test Value 2' },
    ];
    const onQueryChange = jest.fn();
    const { getByTestId } = render(<QueryBuilder fields={fields} onQueryChange={onQueryChange} />);

    userEvent.click(getByTestId(TestID.addRule));

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
        values: [{ name: 'test', label: 'Test' }],
      },
      {
        name: 'field2',
        label: 'Field 2',
        defaultValue: 'test',
        values: [{ name: 'test', label: 'Test' }],
      },
    ];
    const onQueryChange = jest.fn();
    const { getByTestId, getAllByTestId } = render(
      <QueryBuilder
        getValueEditorType={() => 'select'}
        fields={fields}
        onQueryChange={onQueryChange}
      />
    );

    userEvent.click(getByTestId(TestID.addRule));

    expect(getAllByTestId(TestID.valueEditor)).toHaveLength(1);
  });
});

describe('inputType property in field', () => {
  it('sets the input type', () => {
    const fields: Field[] = [{ name: 'field1', label: 'Field 1', inputType: 'number' }];
    const onQueryChange = jest.fn();
    const { container, getByTestId } = render(
      <QueryBuilder fields={fields} onQueryChange={onQueryChange} />
    );

    userEvent.click(getByTestId(TestID.addRule));

    expect(container.querySelector('input[type="number"]')).toBeDefined();
  });
});

describe('valueEditorType property in field', () => {
  it('sets the value editor type', () => {
    const fields: Field[] = [{ name: 'field1', label: 'Field 1', valueEditorType: 'select' }];
    const onQueryChange = jest.fn();
    const { container, getByTestId } = render(
      <QueryBuilder fields={fields} onQueryChange={onQueryChange} />
    );

    userEvent.click(getByTestId(TestID.addRule));

    expect(container.querySelector(`select.${sc.value}`)).toBeDefined();
  });
});

describe('operators property in field', () => {
  it('sets the operators options', () => {
    const fields: Field[] = [
      { name: 'field1', label: 'Field 1', operators: [{ name: '=', label: '=' }] },
      { name: 'field2', label: 'Field 2', operators: [{ name: '=', label: '=' }] },
    ];
    const onQueryChange = jest.fn();
    const { container, getByTestId } = render(
      <QueryBuilder fields={fields} onQueryChange={onQueryChange} />
    );

    userEvent.click(getByTestId(TestID.addRule));

    expect(container.querySelector(`select.${sc.operators}`)).toBeDefined();
    expect(container.querySelectorAll(`select.${sc.operators} option`)).toHaveLength(1);
  });
});

describe('autoSelectField', () => {
  it('initially hides the operator selector and value editor', () => {
    const fields: Field[] = [
      { name: 'field1', label: 'Field 1', operators: [{ name: '=', label: '=' }] },
      { name: 'field2', label: 'Field 2', operators: [{ name: '=', label: '=' }] },
    ];
    const onQueryChange = jest.fn();
    const { container, getByTestId } = render(
      <QueryBuilder fields={fields} onQueryChange={onQueryChange} autoSelectField={false} />
    );

    userEvent.click(getByTestId(TestID.addRule));

    expect(container.querySelectorAll(`select.${sc.fields}`)).toHaveLength(1);
    expect(container.querySelectorAll(`select.${sc.operators}`)).toHaveLength(0);
    expect(container.querySelectorAll(`.${sc.value}`)).toHaveLength(0);
  });
});

describe('addRuleToNewGroups', () => {
  const query: RuleGroupType = { combinator: 'and', rules: [] };

  const setup = () => {
    const onQueryChange = jest.fn();
    return {
      onQueryChange,
      selectors: render(
        <QueryBuilder query={query} onQueryChange={onQueryChange} addRuleToNewGroups />
      ),
    };
  };

  it('does not add a rule when the component is created', () => {
    const { selectors } = setup();
    expect(() => selectors.getByTestId(TestID.rule)).toThrow();
  });

  it('adds a rule when a new group is created', () => {
    const { selectors, onQueryChange } = setup();
    userEvent.click(selectors.getByTestId(TestID.addGroup));
    expect(
      ((onQueryChange.mock.calls[1][0] as RuleGroupType).rules[0] as RuleGroupType).rules[0]
    ).toHaveProperty('field', '~');
  });

  it('adds a rule when mounted if no initial query is provided', () => {
    const { getByTestId } = render(<QueryBuilder addRuleToNewGroups />);
    expect(getByTestId(TestID.rule)).toBeDefined();
  });
});

describe('showCloneButtons', () => {
  describe('standard rule groups', () => {
    it('should clone rules', () => {
      const onQueryChange = jest.fn();
      const { getAllByText } = render(
        <QueryBuilder
          showCloneButtons
          onQueryChange={onQueryChange}
          defaultQuery={{
            combinator: 'and',
            rules: [
              { field: 'firstName', operator: '=', value: 'Steve' },
              { field: 'lastName', operator: '=', value: 'Vai' },
            ],
          }}
        />
      );
      userEvent.click(getAllByText(t.cloneRule.label)[0]);
      expect(stripQueryIds(onQueryChange.mock.calls[1][0])).toEqual({
        combinator: 'and',
        rules: [
          { field: 'firstName', operator: '=', value: 'Steve' },
          { field: 'firstName', operator: '=', value: 'Steve' },
          { field: 'lastName', operator: '=', value: 'Vai' },
        ],
      });
    });

    it('should clone rule groups', () => {
      const onQueryChange = jest.fn();
      const { getAllByText } = render(
        <QueryBuilder
          showCloneButtons
          onQueryChange={onQueryChange}
          defaultQuery={{
            combinator: 'and',
            rules: [
              {
                combinator: 'or',
                rules: [{ field: 'firstName', operator: '=', value: 'Steve' }],
              },
              { field: 'lastName', operator: '=', value: 'Vai' },
            ],
          }}
        />
      );
      userEvent.click(getAllByText(t.cloneRule.label)[0]);
      expect(stripQueryIds(onQueryChange.mock.calls[1][0])).toEqual({
        combinator: 'and',
        rules: [
          { combinator: 'or', rules: [{ field: 'firstName', operator: '=', value: 'Steve' }] },
          { combinator: 'or', rules: [{ field: 'firstName', operator: '=', value: 'Steve' }] },
          { field: 'lastName', operator: '=', value: 'Vai' },
        ],
      });
    });
  });

  describe('independent combinators', () => {
    it('should clone a single rule with independent combinators', () => {
      const onQueryChange = jest.fn();
      const { getByText } = render(
        <QueryBuilder
          showCloneButtons
          independentCombinators
          onQueryChange={onQueryChange}
          defaultQuery={{
            rules: [{ field: 'firstName', operator: '=', value: 'Steve' }],
          }}
        />
      );
      userEvent.click(getByText(t.cloneRule.label));
      expect(stripQueryIds(onQueryChange.mock.calls[1][0])).toEqual({
        rules: [
          { field: 'firstName', operator: '=', value: 'Steve' },
          'and',
          { field: 'firstName', operator: '=', value: 'Steve' },
        ],
      });
    });

    it('should clone first rule with independent combinators', () => {
      const onQueryChange = jest.fn();
      const { getAllByText } = render(
        <QueryBuilder
          showCloneButtons
          independentCombinators
          onQueryChange={onQueryChange}
          defaultQuery={{
            rules: [
              { field: 'firstName', operator: '=', value: 'Steve' },
              'and',
              { field: 'lastName', operator: '=', value: 'Vai' },
            ],
          }}
        />
      );
      userEvent.click(getAllByText(t.cloneRule.label)[0]);
      expect(stripQueryIds(onQueryChange.mock.calls[1][0])).toEqual({
        rules: [
          { field: 'firstName', operator: '=', value: 'Steve' },
          'and',
          { field: 'firstName', operator: '=', value: 'Steve' },
          'and',
          { field: 'lastName', operator: '=', value: 'Vai' },
        ],
      });
    });

    it('should clone last rule with independent combinators', () => {
      const onQueryChange = jest.fn();
      const { getAllByText } = render(
        <QueryBuilder
          showCloneButtons
          independentCombinators
          onQueryChange={onQueryChange}
          defaultQuery={{
            rules: [
              { field: 'firstName', operator: '=', value: 'Steve' },
              'or',
              { field: 'lastName', operator: '=', value: 'Vai' },
            ],
          }}
        />
      );
      userEvent.click(getAllByText(t.cloneRule.label)[1]);
      expect(stripQueryIds(onQueryChange.mock.calls[1][0])).toEqual({
        rules: [
          { field: 'firstName', operator: '=', value: 'Steve' },
          'or',
          { field: 'lastName', operator: '=', value: 'Vai' },
          'or',
          { field: 'lastName', operator: '=', value: 'Vai' },
        ],
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
    expect(getByTestId(TestID.ruleGroup)).toBeDefined();
    expect(onQueryChange.mock.calls[0][0]).not.toHaveProperty('combinator');
  });

  it('should render a rule group with addRuleToNewGroups', () => {
    const { getByTestId } = render(<QueryBuilder addRuleToNewGroups independentCombinators />);
    expect(getByTestId(TestID.rule)).toBeDefined();
  });

  it('should call onQueryChange with query', () => {
    const query: RuleGroupTypeIC = {
      rules: [],
      not: false,
    };
    const onQueryChange = jest.fn();
    render(<QueryBuilder onQueryChange={onQueryChange} independentCombinators />);
    expect(onQueryChange).toHaveBeenCalledTimes(1);
    expect(onQueryChange.mock.calls[0][0]).toMatchObject(query);
  });

  it('should add rules with independent combinators', () => {
    const { getAllByTestId, getByTestId } = render(<QueryBuilder independentCombinators />);
    expect(() => getAllByTestId(TestID.combinators)).toThrow;
    userEvent.click(getByTestId(TestID.addRule));
    expect(getByTestId(TestID.rule)).toBeDefined();
    expect(() => getAllByTestId(TestID.combinators)).toThrow();
    userEvent.click(getByTestId(TestID.addRule));
    expect(getAllByTestId(TestID.rule)).toHaveLength(2);
    expect(getAllByTestId(TestID.combinators)).toHaveLength(1);
    expect(getByTestId(TestID.combinators)).toHaveValue('and');
    userEvent.selectOptions(getByTestId(TestID.combinators), 'or');
    userEvent.click(getByTestId(TestID.addRule));
    const combinatorSelectors = getAllByTestId(TestID.combinators);
    expect(combinatorSelectors[0]).toHaveValue('or');
  });

  it('should add groups with independent combinators', () => {
    const { getAllByTestId, getByTestId } = render(<QueryBuilder independentCombinators />);
    expect(() => getAllByTestId(TestID.combinators)).toThrow();
    userEvent.click(getByTestId(TestID.addGroup));
    expect(getAllByTestId(TestID.ruleGroup)).toHaveLength(2);
    expect(() => getAllByTestId(TestID.combinators)).toThrow();
    userEvent.click(getAllByTestId(TestID.addGroup)[0]);
    expect(getAllByTestId(TestID.ruleGroup)).toHaveLength(3);
    expect(getAllByTestId(TestID.combinators)).toHaveLength(1);
    expect(getByTestId(TestID.combinators)).toHaveValue('and');
    userEvent.selectOptions(getByTestId(TestID.combinators), 'or');
    userEvent.click(getAllByTestId(TestID.addGroup)[0]);
    const combinatorSelectors = getAllByTestId(TestID.combinators);
    expect(combinatorSelectors[0]).toHaveValue('or');
  });

  it('should remove rules along with independent combinators', () => {
    const onQueryChange = jest.fn();
    const query: RuleGroupTypeIC = {
      rules: [
        { field: 'firstName', operator: '=', value: '1' },
        'and',
        { field: 'firstName', operator: '=', value: '2' },
        'or',
        { field: 'firstName', operator: '=', value: '3' },
      ],
    };
    const { getAllByTestId, rerender } = render(
      <QueryBuilder query={query} onQueryChange={onQueryChange} independentCombinators />
    );
    expect(getAllByTestId(TestID.rule)).toHaveLength(3);
    expect(getAllByTestId(TestID.combinators)).toHaveLength(2);
    userEvent.click(getAllByTestId(TestID.removeRule)[1]);
    expect((onQueryChange.mock.calls[1][0] as RuleGroupType).rules[0]).toHaveProperty('value', '1');
    expect((onQueryChange.mock.calls[1][0] as RuleGroupType).rules[1]).toBe('or');
    expect((onQueryChange.mock.calls[1][0] as RuleGroupType).rules[2]).toHaveProperty('value', '3');

    rerender(
      <QueryBuilder
        query={onQueryChange.mock.calls[1][0]}
        onQueryChange={onQueryChange}
        independentCombinators
      />
    );
    userEvent.click(getAllByTestId(TestID.removeRule)[0]);
    expect((onQueryChange.mock.calls[2][0] as RuleGroupType).rules).toHaveLength(1);
    expect((onQueryChange.mock.calls[2][0] as RuleGroupType).rules[0]).toHaveProperty('value', '3');
  });

  it('should remove groups along with independent combinators', () => {
    const onQueryChange = jest.fn();
    const query: RuleGroupTypeIC = {
      rules: [{ rules: [] }, 'and', { rules: [] }, 'or', { rules: [] }],
    };
    const { getAllByTestId, rerender } = render(
      <QueryBuilder query={query} onQueryChange={onQueryChange} independentCombinators />
    );

    expect(getAllByTestId(TestID.ruleGroup)).toHaveLength(4);
    expect(getAllByTestId(TestID.combinators)).toHaveLength(2);
    userEvent.click(getAllByTestId(TestID.removeGroup)[1]);
    expect((onQueryChange.mock.calls[1][0] as RuleGroupType).rules[0]).toHaveProperty('rules', []);
    expect((onQueryChange.mock.calls[1][0] as RuleGroupType).rules[1]).toBe('or');
    expect((onQueryChange.mock.calls[1][0] as RuleGroupType).rules[2]).toHaveProperty('rules', []);

    rerender(
      <QueryBuilder
        query={onQueryChange.mock.calls[1][0]}
        onQueryChange={onQueryChange}
        independentCombinators
      />
    );
    userEvent.click(getAllByTestId(TestID.removeGroup)[0]);
    expect((onQueryChange.mock.calls[2][0] as RuleGroupType).rules).toHaveLength(1);
    expect((onQueryChange.mock.calls[2][0] as RuleGroupType).rules[0]).toHaveProperty('rules', []);
  });
});

describe('validation', () => {
  it('should not validate if no validator function is provided', () => {
    const { container } = render(<QueryBuilder />);
    expect(container.querySelector(`div.${sc.queryBuilder}`)).not.toHaveClass(sc.valid);
    expect(container.querySelector(`div.${sc.queryBuilder}`)).not.toHaveClass(sc.invalid);
  });

  it('should validate groups if default validator function is provided', () => {
    const { container, getByTestId } = render(<QueryBuilder validator={defaultValidator} />);
    userEvent.click(getByTestId(TestID.addGroup));
    // Expect the root group to be valid (contains the inner group)
    expect(container.querySelectorAll(`.${sc.ruleGroup}.${sc.valid}`)).toHaveLength(1);
    // Expect the inner group to be invalid (empty)
    expect(container.querySelectorAll(`.${sc.ruleGroup}.${sc.invalid}`)).toHaveLength(1);
  });

  it('should use custom validator function returning false', () => {
    const validator = jest.fn(() => false);
    const { container } = render(<QueryBuilder validator={validator} />);
    expect(validator).toHaveBeenCalled();
    expect(container.querySelector(`div.${sc.queryBuilder}`)).not.toHaveClass(sc.valid);
    expect(container.querySelector(`div.${sc.queryBuilder}`)).toHaveClass(sc.invalid);
  });

  it('should use custom validator function returning true', () => {
    const validator = jest.fn(() => true);
    const { container } = render(<QueryBuilder validator={validator} />);
    expect(validator).toHaveBeenCalled();
    expect(container.querySelector(`div.${sc.queryBuilder}`)).toHaveClass(sc.valid);
    expect(container.querySelector(`div.${sc.queryBuilder}`)).not.toHaveClass(sc.invalid);
  });

  it('should pass down validationMap to children', () => {
    const valMap: ValidationMap = { id: { valid: false, reasons: ['invalid'] } };
    const RuleGroupValMapDisplay = (props: RuleGroupProps) => (
      <div data-testid={TestID.ruleGroup}>{JSON.stringify(props.schema.validationMap)}</div>
    );
    const { getByTestId } = render(
      <QueryBuilder
        validator={() => valMap}
        controlElements={{ ruleGroup: RuleGroupValMapDisplay }}
      />
    );
    expect(getByTestId(TestID.ruleGroup).innerHTML).toBe(JSON.stringify(valMap));
  });
});

describe('enableDragAndDrop', () => {
  describe('standard rule groups', () => {
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
              { id: '1', field: 'field1', operator: '=', value: '1' },
            ],
          }}
        />
      );
      const rules = getAllByTestId(TestID.rule);
      simulateDragDrop(
        getHandlerId(rules[0], 'drag'),
        getHandlerId(rules[1], 'drop'),
        getDndBackend()
      );
      expect((onQueryChange.mock.calls[1][0] as RuleGroupType).rules.map(r => r.id)).toEqual([
        '1',
        '0',
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
                  { id: '3', combinator: 'and', rules: [] },
                ],
              },
            ],
          }}
        />
      );
      const rule = getAllByTestId(TestID.rule)[1]; // id 2
      const ruleGroup = getAllByTestId(TestID.ruleGroup)[2]; // id 3
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
              { field: 'field1', operator: '=', value: '1' },
            ],
          }}
        />
      );
      const rules = getAllByTestId(TestID.rule);
      simulateDragDrop(
        getHandlerId(rules[0], 'drag'),
        getHandlerId(rules[1], 'drop'),
        getDndBackend()
      );
      expect(stripQueryIds(onQueryChange.mock.calls[1][0])).toEqual({
        not: false,
        rules: [
          { field: 'field1', operator: '=', value: '1' },
          'and',
          { field: 'field0', operator: '=', value: '0' },
        ],
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
              { field: 'field1', operator: '=', value: '1' },
            ],
          }}
        />
      );
      const rules = getAllByTestId(TestID.rule);
      const ruleGroup = getAllByTestId(TestID.ruleGroup)[0];
      simulateDragDrop(
        getHandlerId(rules[1], 'drag'),
        getHandlerId(ruleGroup, 'drop'),
        getDndBackend()
      );
      expect(stripQueryIds(onQueryChange.mock.calls[1][0])).toEqual({
        not: false,
        rules: [
          { field: 'field1', operator: '=', value: '1' },
          'and',
          { field: 'field0', operator: '=', value: '0' },
        ],
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
              { field: 'field2', operator: '=', value: '2' },
            ],
          }}
        />
      );
      const rules = getAllByTestId(TestID.rule);
      simulateDragDrop(
        getHandlerId(rules[0], 'drag'),
        getHandlerId(rules[2], 'drop'),
        getDndBackend()
      );
      expect(stripQueryIds(onQueryChange.mock.calls[1][0])).toEqual({
        not: false,
        rules: [
          { field: 'field1', operator: '=', value: '1' },
          'and',
          { field: 'field2', operator: '=', value: '2' },
          'and',
          { field: 'field0', operator: '=', value: '0' },
        ],
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
              { field: 'field2', operator: '=', value: '2' },
            ],
          }}
        />
      );
      const rules = getAllByTestId(TestID.rule);
      const ruleGroup = getAllByTestId(TestID.ruleGroup)[0];
      simulateDragDrop(
        getHandlerId(rules[2], 'drag'),
        getHandlerId(ruleGroup, 'drop'),
        getDndBackend()
      );
      expect(stripQueryIds(onQueryChange.mock.calls[1][0])).toEqual({
        not: false,
        rules: [
          { field: 'field2', operator: '=', value: '2' },
          'and',
          { field: 'field0', operator: '=', value: '0' },
          'and',
          { field: 'field1', operator: '=', value: '1' },
        ],
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
              { field: 'field2', operator: '=', value: '2' },
            ],
          }}
        />
      );
      const rules = getAllByTestId(TestID.rule);
      const combinators = getAllByTestId(TestID.inlineCombinator);
      simulateDragDrop(
        getHandlerId(rules[2], 'drag'),
        getHandlerId(combinators[0], 'drop'),
        getDndBackend()
      );
      expect(stripQueryIds(onQueryChange.mock.calls[1][0])).toEqual({
        not: false,
        rules: [
          { field: 'field0', operator: '=', value: '0' },
          'and',
          { field: 'field2', operator: '=', value: '2' },
          'and',
          { field: 'field1', operator: '=', value: '1' },
        ],
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
                  { field: 'field2', operator: '=', value: '2' },
                ],
              },
            ],
          }}
        />
      );
      const rule = getAllByTestId(TestID.rule)[0];
      const ruleGroup = getAllByTestId(TestID.ruleGroup)[1];
      simulateDragDrop(
        getHandlerId(rule, 'drag'),
        getHandlerId(ruleGroup, 'drop'),
        getDndBackend()
      );
      expect(stripQueryIds(onQueryChange.mock.calls[1][0])).toEqual({
        not: false,
        rules: [
          {
            not: false,
            rules: [
              { field: 'field0', operator: '=', value: '0' },
              'and',
              { field: 'field1', operator: '=', value: '1' },
              'and',
              { field: 'field2', operator: '=', value: '2' },
            ],
          },
        ],
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
                  { field: 'field4', operator: '=', value: '4' },
                ],
              },
            ],
          }}
        />
      );
      const dragRule = getAllByTestId(TestID.rule)[1];
      const dropRule = getAllByTestId(TestID.rule)[3];
      simulateDragDrop(
        getHandlerId(dragRule, 'drag'),
        getHandlerId(dropRule, 'drop'),
        getDndBackend()
      );
      expect(stripQueryIds(onQueryChange.mock.calls[1][0])).toEqual({
        not: false,
        rules: [
          { field: 'field0', operator: '=', value: '0' },
          'and',
          { field: 'field2', operator: '=', value: '2' },
          'and',
          {
            not: false,
            rules: [
              { field: 'field3', operator: '=', value: '3' },
              'and',
              { field: 'field1', operator: '=', value: '1' },
              'and',
              { field: 'field4', operator: '=', value: '4' },
            ],
          },
        ],
      });
    });
  });
});

describe('disabled', () => {
  it('should have the correct classname', () => {
    const { container } = render(<QueryBuilder disabled />);
    expect(container.querySelectorAll('div')[0]).toHaveClass(sc.disabled);
  });
  it('prevents changes when disabled', () => {
    const onQueryChange = jest.fn();
    const { getAllByLabelText, getAllByTestId, getAllByTitle, getAllByDisplayValue } = render(
      <QueryBuilder
        fields={[
          { name: 'field0', label: 'Field 0' },
          { name: 'field1', label: 'Field 1' },
          { name: 'field2', label: 'Field 2' },
          { name: 'field3', label: 'Field 3' },
          { name: 'field4', label: 'Field 4' },
        ]}
        enableMountQueryChange={false}
        independentCombinators
        onQueryChange={onQueryChange}
        enableDragAndDrop
        showCloneButtons
        showNotToggle
        disabled
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
                { field: 'field4', operator: '=', value: '4' },
              ],
            },
          ],
        }}
      />
    );
    userEvent.click(getAllByTitle(t.addRule.title)[0]);
    userEvent.click(getAllByTitle(t.addGroup.title)[0]);
    userEvent.click(getAllByTitle(t.removeRule.title)[0]);
    userEvent.click(getAllByTitle(t.removeGroup.title)[0]);
    userEvent.click(getAllByTitle(t.cloneRule.title)[0]);
    userEvent.click(getAllByTitle(t.cloneRuleGroup.title)[0]);
    userEvent.click(getAllByLabelText(t.notToggle.label)[0]);
    userEvent.selectOptions(getAllByDisplayValue('Field 0')[0], 'field1');
    userEvent.selectOptions(getAllByDisplayValue('=')[0], '>');
    userEvent.type(getAllByDisplayValue('4')[0], 'Not 4');
    const dragRule = getAllByTestId(TestID.rule)[1];
    const dropRule = getAllByTestId(TestID.rule)[3];
    simulateDragDrop(
      getHandlerId(dragRule, 'drag'),
      getHandlerId(dropRule, 'drop'),
      getDndBackend()
    );
    expect(onQueryChange).not.toHaveBeenCalled();
  });

  it('disables a specific path and its children', () => {
    const { getAllByTestId } = render(
      <QueryBuilder
        disabled={[[2]]}
        query={{
          combinator: 'and',
          rules: [
            { field: 'firstName', operator: '=', value: 'Steve' },
            { field: 'lastName', operator: '=', value: 'Vai' },
            { combinator: 'and', rules: [{ field: 'age', operator: '>', value: 28 }] },
          ],
        }}
      />
    );
    // First two rules (paths [0] and [1]) are enabled
    expect(getAllByTestId(TestID.fields)[0]).not.toBeDisabled();
    expect(getAllByTestId(TestID.operators)[0]).not.toBeDisabled();
    expect(getAllByTestId(TestID.valueEditor)[0]).not.toBeDisabled();
    expect(getAllByTestId(TestID.fields)[1]).not.toBeDisabled();
    expect(getAllByTestId(TestID.operators)[1]).not.toBeDisabled();
    expect(getAllByTestId(TestID.valueEditor)[1]).not.toBeDisabled();
    // Rule group at path [2] is disabled
    expect(getAllByTestId(TestID.combinators)[1]).toBeDisabled();
    expect(getAllByTestId(TestID.addRule)[1]).toBeDisabled();
    expect(getAllByTestId(TestID.addGroup)[1]).toBeDisabled();
    expect(getAllByTestId(TestID.fields)[2]).toBeDisabled();
    expect(getAllByTestId(TestID.operators)[2]).toBeDisabled();
    expect(getAllByTestId(TestID.valueEditor)[2]).toBeDisabled();
  });

  it('prevents changes from custom components when disabled', () => {
    const onQueryChange = jest.fn();
    const ruleToAdd: RuleType = { field: 'f1', operator: '=', value: 'v1' };
    const groupToAdd: RuleGroupTypeIC = { rules: [] };
    const { getByTestId } = render(
      <QueryBuilder
        fields={[
          { name: 'field0', label: 'Field 0' },
          { name: 'field1', label: 'Field 1' },
          { name: 'field2', label: 'Field 2' },
          { name: 'field3', label: 'Field 3' },
          { name: 'field4', label: 'Field 4' },
        ]}
        enableMountQueryChange={false}
        independentCombinators
        onQueryChange={onQueryChange}
        enableDragAndDrop
        showCloneButtons
        showNotToggle
        disabled
        controlElements={{
          ruleGroup: ({ schema }) => (
            <div data-testid={TestID.ruleGroup}>
              <button onClick={() => schema.onRuleAdd(ruleToAdd, [])} />
              <button onClick={() => schema.onGroupAdd(groupToAdd, [])} />
              <button onClick={() => schema.onPropChange('field', 'f2', [0])} />
              <button onClick={() => schema.updateIndependentCombinator('or', [1])} />
              <button onClick={() => schema.onRuleRemove([0])} />
              <button onClick={() => schema.onGroupRemove([6])} />
              <button onClick={() => schema.moveRule([6], [0])} />
              <button onClick={() => schema.moveRule([6], [0], true)} />
            </div>
          ),
        }}
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
                { field: 'field4', operator: '=', value: '4' },
              ],
            },
          ],
        }}
      />
    );
    const rg = getByTestId(TestID.ruleGroup);
    rg.querySelectorAll('button').forEach(b => userEvent.click(b));
    expect(onQueryChange).not.toHaveBeenCalled();
  });
});
