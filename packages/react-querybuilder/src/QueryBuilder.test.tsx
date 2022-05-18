import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { simulateDragDrop, wrapWithTestBackend } from 'react-dnd-test-utils';
import { defaultTranslations as t, standardClassnames as sc, TestID } from './defaults';
import {
  QueryBuilder as QueryBuilderOriginal,
  QueryBuilderWithoutDndProvider,
} from './QueryBuilder';
import type {
  Field,
  NameLabelPair,
  OptionGroup,
  RuleGroupProps,
  RuleGroupType,
  RuleGroupTypeIC,
  RuleType,
  ValidationMap,
} from './types';
import { defaultValidator, formatQuery } from './utils';

const user = userEvent.setup();

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
    expect(getByTestId(TestID.ruleGroup)).toBeInTheDocument();
  });
});

describe('when rendered with defaultQuery only', () => {
  it('changes the query in uncontrolled state', async () => {
    const { getAllByTestId, getByTestId } = render(
      <QueryBuilder
        defaultQuery={{
          combinator: 'and',
          rules: [{ field: 'firstName', operator: '=', value: 'Steve' }],
        }}
      />
    );
    expect(getAllByTestId(TestID.rule)).toHaveLength(1);
    await user.click(getByTestId(TestID.addRule));
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
  it('should be able to create rule on add rule click', async () => {
    const { getByTestId } = render(<QueryBuilder />);
    await user.click(getByTestId(TestID.addRule));
    expect(getByTestId(TestID.rule)).toBeInTheDocument();
  });
});

describe('when initial query with duplicate fields is provided', () => {
  it('passes down a unique set of fields (by name)', async () => {
    const { getAllByTestId, getByTestId } = render(
      <QueryBuilder
        fields={[
          { name: 'dupe', label: 'One' },
          { name: 'dupe', label: 'Two' },
        ]}
      />
    );
    await user.click(getByTestId(TestID.addRule));
    expect(getByTestId(TestID.rule)).toBeInTheDocument();
    expect(getAllByTestId(TestID.fields)).toHaveLength(1);
  });
});

describe('when initial query with fields object is provided', () => {
  it('passes down fields sorted by label using the key as name', async () => {
    const { getByTestId } = render(
      <QueryBuilder
        fields={{ xyz: { name: 'dupe', label: 'One' }, abc: { name: 'dupe', label: 'Two' } }}
      />
    );
    await user.click(getByTestId(TestID.addRule));
    expect(getByTestId(TestID.rule)).toBeInTheDocument();
    expect(getByTestId(TestID.fields).querySelectorAll('option')).toHaveLength(2);
    // TODO: test sort
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
    expect(selectors.getByTestId(TestID.rule)).toBeInTheDocument();
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

  it('selects the correct field', async () => {
    const { selectors } = setup();
    await user.click(selectors.getByTestId(TestID.addRule));
    expect(selectors.getAllByTestId(TestID.fields)[1]).toHaveValue('firstName');
  });

  it('selects the default option', async () => {
    const { selectors } = setup();
    selectors.rerender(
      <QueryBuilder defaultQuery={query} fields={fields} autoSelectField={false} />
    );
    await user.click(selectors.getByTestId(TestID.addRule));
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

  it('should create a new rule and remove that rule', async () => {
    const { selectors, onQueryChange } = setup();
    await user.click(selectors.getByTestId(TestID.addRule));

    expect(selectors.getByTestId(TestID.rule)).toBeDefined();
    expect(onQueryChange.mock.calls[0][0].rules).toHaveLength(0);
    expect(onQueryChange.mock.calls[1][0].rules).toHaveLength(1);

    await user.click(selectors.getByTestId(TestID.removeRule));

    expect(selectors.queryByTestId(TestID.rule)).toBeNull();
    expect(onQueryChange.mock.calls[2][0].rules).toHaveLength(0);
  });

  it('should create a new group and remove that group', async () => {
    const { selectors, onQueryChange } = setup();
    await user.click(selectors.getByTestId(TestID.addGroup));

    expect(selectors.getAllByTestId(TestID.ruleGroup)).toHaveLength(2);
    expect(onQueryChange.mock.calls[0][0].rules).toHaveLength(0);
    expect(onQueryChange.mock.calls[1][0].rules).toHaveLength(1);
    expect(onQueryChange.mock.calls[1][0].rules[0].combinator).toBe('and');

    await user.click(selectors.getByTestId(TestID.removeGroup));

    expect(selectors.getAllByTestId(TestID.ruleGroup)).toHaveLength(1);
    expect(onQueryChange.mock.calls[2][0].rules).toHaveLength(0);
  });

  it('should create a new rule and change the fields', async () => {
    const { selectors, onQueryChange } = setup();
    await user.click(selectors.getByTestId(TestID.addRule));

    expect(onQueryChange.mock.calls[0][0].rules).toHaveLength(0);
    expect(onQueryChange.mock.calls[1][0].rules).toHaveLength(1);

    await user.selectOptions(selectors.getByTestId(TestID.fields), 'field2');
    expect(onQueryChange.mock.calls[2][0].rules[0].field).toBe('field2');
  });

  it('should create a new rule and change the operator', async () => {
    const { selectors, onQueryChange } = setup();
    await user.click(selectors.getByTestId(TestID.addRule));

    expect(onQueryChange.mock.calls[0][0].rules).toHaveLength(0);
    expect(onQueryChange.mock.calls[1][0].rules).toHaveLength(1);

    await user.selectOptions(selectors.getByTestId(TestID.operators), '!=');
    expect(onQueryChange.mock.calls[2][0].rules[0].operator).toBe('!=');
  });

  it('should change the combinator of the root group', async () => {
    const { selectors, onQueryChange } = setup();
    expect(onQueryChange.mock.calls[0][0].rules).toHaveLength(0);

    await user.selectOptions(selectors.getByTestId(TestID.combinators), 'or');

    expect(onQueryChange.mock.calls[1][0].rules).toHaveLength(0);
    expect(onQueryChange.mock.calls[1][0].combinator).toBe('or');
  });

  it('should set default value for a rule', async () => {
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

    await user.click(selectors.getByTestId(TestID.addRule));

    expect(onQueryChange.mock.calls[1][0].rules).toHaveLength(1);
    expect(onQueryChange.mock.calls[1][0].rules[0].value).toBe('value1');

    await user.selectOptions(selectors.getByTestId(TestID.fields), 'field2');

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

    await user.click(selectors.getByTestId(TestID.addRule));

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

  it('resets the operator and value when true', async () => {
    const { selectors, onQueryChange } = setup();
    await user.click(selectors.getByTestId(TestID.addRule));
    await user.selectOptions(selectors.getByTestId(TestID.operators), '>');
    await user.type(selectors.getByTestId(TestID.valueEditor), 'Test');
    await user.selectOptions(selectors.getByTestId(TestID.fields), 'field2');

    expect(onQueryChange.mock.calls[3][0].rules[0].operator).toBe('>');
    expect(onQueryChange.mock.calls[6][0].rules[0].value).toBe('Test');
    expect(onQueryChange.mock.calls[7][0].rules[0].operator).toBe('=');
    expect(onQueryChange.mock.calls[7][0].rules[0].value).toBe('');
  });

  it('does not reset the operator and value when false', async () => {
    const { selectors, onQueryChange } = setup();
    selectors.rerender(
      <QueryBuilder resetOnFieldChange={false} fields={fields} onQueryChange={onQueryChange} />
    );
    await user.click(selectors.getByTestId(TestID.addRule));
    await user.selectOptions(selectors.getByTestId(TestID.operators), '>');
    await user.type(selectors.getByTestId(TestID.valueEditor), 'Test');
    await user.selectOptions(selectors.getByTestId(TestID.fields), 'field2');

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

  it('resets the value when true', async () => {
    const onQueryChange = jest.fn();
    const { getByTestId } = render(
      <QueryBuilder resetOnOperatorChange fields={fields} onQueryChange={onQueryChange} />
    );
    await user.click(getByTestId(TestID.addRule));
    await user.selectOptions(getByTestId(TestID.operators), '>');
    await user.type(getByTestId(TestID.valueEditor), 'Test');
    await user.selectOptions(getByTestId(TestID.operators), '=');

    expect(onQueryChange.mock.calls[3][0].rules[0].operator).toBe('>');
    expect(onQueryChange.mock.calls[6][0].rules[0].value).toBe('Test');
    expect(onQueryChange.mock.calls[7][0].rules[0].operator).toBe('=');
    expect(onQueryChange.mock.calls[7][0].rules[0].value).toBe('');
  });

  it('does not reset the value when false', async () => {
    const onQueryChange = jest.fn();
    const { getByTestId } = render(
      <QueryBuilder resetOnOperatorChange={false} fields={fields} onQueryChange={onQueryChange} />
    );
    await user.click(getByTestId(TestID.addRule));
    await user.selectOptions(getByTestId(TestID.operators), '>');
    await user.type(getByTestId(TestID.valueEditor), 'Test');
    await user.selectOptions(getByTestId(TestID.operators), '=');

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

  it('sets the default field as a string', async () => {
    const onQueryChange = jest.fn();
    const { getByTestId } = render(
      <QueryBuilder getDefaultField="field2" fields={fields} onQueryChange={onQueryChange} />
    );
    await user.click(getByTestId(TestID.addRule));
    expect(onQueryChange.mock.calls[1][0].rules[0].field).toBe('field2');
  });

  it('sets the default field as a function', async () => {
    const onQueryChange = jest.fn();
    const { getByTestId } = render(
      <QueryBuilder
        getDefaultField={() => 'field2'}
        fields={fields}
        onQueryChange={onQueryChange}
      />
    );
    await user.click(getByTestId(TestID.addRule));
    expect(onQueryChange.mock.calls[1][0].rules[0].field).toBe('field2');
  });
});

describe('getDefaultOperator prop', () => {
  const fields: Field[] = [{ name: 'field1', label: 'Field 1' }];

  it('sets the default operator as a string', async () => {
    const onQueryChange = jest.fn();
    const { getByTestId } = render(
      <QueryBuilder getDefaultOperator="beginsWith" fields={fields} onQueryChange={onQueryChange} />
    );
    await user.click(getByTestId(TestID.addRule));
    expect(onQueryChange.mock.calls[1][0].rules[0].operator).toBe('beginsWith');
  });

  it('sets the default operator as a function', async () => {
    const onQueryChange = jest.fn();
    const { getByTestId } = render(
      <QueryBuilder
        getDefaultOperator={() => 'beginsWith'}
        fields={fields}
        onQueryChange={onQueryChange}
      />
    );
    await user.click(getByTestId(TestID.addRule));
    expect(onQueryChange.mock.calls[1][0].rules[0].operator).toBe('beginsWith');
  });
});

describe('defaultOperator property in field', () => {
  it('sets the default operator', async () => {
    const fields: Field[] = [{ name: 'field1', label: 'Field 1', defaultOperator: 'beginsWith' }];
    const onQueryChange = jest.fn();
    const { getByTestId } = render(<QueryBuilder fields={fields} onQueryChange={onQueryChange} />);
    await user.click(getByTestId(TestID.addRule));
    expect(onQueryChange.mock.calls[1][0].rules[0].operator).toBe('beginsWith');
  });
});

describe('getDefaultValue prop', () => {
  it('sets the default value', async () => {
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
    await user.click(getByTestId(TestID.addRule));
    expect(onQueryChange.mock.calls[1][0].rules[0].value).toBe('Test Value');
  });
});

describe('onAddRule prop', () => {
  it('cancels the rule addition', async () => {
    const onQueryChange = jest.fn();
    const onAddRule = jest.fn(() => false as const);
    const { getByTestId } = render(
      <QueryBuilder onAddRule={onAddRule} onQueryChange={onQueryChange} />
    );
    expect(onQueryChange).toHaveBeenCalledTimes(1);

    await user.click(getByTestId(TestID.addRule));

    expect(onAddRule).toHaveBeenCalled();
    expect(onQueryChange).toHaveBeenCalledTimes(1);
  });

  it('modifies the rule addition', async () => {
    const onQueryChange = jest.fn();
    const rule: RuleType = { field: 'test', operator: '=', value: 'modified' };
    const { getByTestId } = render(
      <QueryBuilder onAddRule={() => rule} onQueryChange={onQueryChange} />
    );

    await user.click(getByTestId(TestID.addRule));

    expect(onQueryChange.mock.calls[1][0].rules[0].value).toBe('modified');
  });
});

describe('onAddGroup prop', () => {
  it('cancels the group addition', async () => {
    const onQueryChange = jest.fn();
    const onAddGroup = jest.fn(() => false as const);
    const { getByTestId } = render(
      <QueryBuilder onAddGroup={onAddGroup} onQueryChange={onQueryChange} />
    );

    expect(onQueryChange).toHaveBeenCalledTimes(1);

    await user.click(getByTestId(TestID.addGroup));

    expect(onAddGroup).toHaveBeenCalled();
    expect(onQueryChange).toHaveBeenCalledTimes(1);
  });

  it('modifies the group addition', async () => {
    const onQueryChange = jest.fn();
    const group: RuleGroupType = { combinator: 'fake', rules: [] };
    const { getByTestId } = render(
      <QueryBuilder onAddGroup={() => group} onQueryChange={onQueryChange} />
    );

    await user.click(getByTestId(TestID.addGroup));

    expect(onQueryChange.mock.calls[1][0].rules[0].combinator).toBe('fake');
  });
});

describe('defaultValue property in field', () => {
  it('sets the default value', async () => {
    const fields: Field[] = [
      { name: 'field1', label: 'Field 1', defaultValue: 'Test Value 1' },
      { name: 'field2', label: 'Field 2', defaultValue: 'Test Value 2' },
    ];
    const onQueryChange = jest.fn();
    const { getByTestId } = render(<QueryBuilder fields={fields} onQueryChange={onQueryChange} />);

    await user.click(getByTestId(TestID.addRule));

    expect(onQueryChange.mock.calls[1][0].rules[0].value).toBe('Test Value 1');
  });
});

describe('values property in field', () => {
  it('sets the values list', async () => {
    const fields: Field[] = [
      {
        name: 'field1',
        label: 'Field 1',
        defaultValue: 'test',
        values: [
          { name: 'test', label: 'Test value 1' },
          { name: 'test2', label: 'Test2' },
        ],
      },
      {
        name: 'field2',
        label: 'Field 2',
        defaultValue: 'test',
        values: [{ name: 'test', label: 'Test' }],
      },
    ];
    const onQueryChange = jest.fn();
    const { getByDisplayValue, getByTestId, getAllByTestId } = render(
      <QueryBuilder
        getValueEditorType={() => 'select'}
        fields={fields}
        onQueryChange={onQueryChange}
      />
    );

    await user.click(getByTestId(TestID.addRule));
    expect(getAllByTestId(TestID.valueEditor)).toHaveLength(1);
    expect(getByTestId(TestID.valueEditor).getElementsByTagName('option')).toHaveLength(2);
    expect(getByDisplayValue('Test value 1')).toBeInTheDocument();
  });
});

describe('inputType property in field', () => {
  it('sets the input type', async () => {
    const fields: Field[] = [{ name: 'field1', label: 'Field 1', inputType: 'number' }];
    const onQueryChange = jest.fn();
    const { container, getByTestId } = render(
      <QueryBuilder fields={fields} onQueryChange={onQueryChange} />
    );

    await user.click(getByTestId(TestID.addRule));

    expect(container.querySelector('input[type="number"]')).toBeDefined();
  });
});

describe('valueEditorType property in field', () => {
  it('sets the value editor type', async () => {
    const fields: Field[] = [{ name: 'field1', label: 'Field 1', valueEditorType: 'select' }];
    const onQueryChange = jest.fn();
    const { container, getByTestId } = render(
      <QueryBuilder fields={fields} onQueryChange={onQueryChange} />
    );

    await user.click(getByTestId(TestID.addRule));

    expect(container.querySelector(`select.${sc.value}`)).toBeDefined();
  });
});

describe('operators property in field', () => {
  it('sets the operators options', async () => {
    const operators = [{ name: '=', label: '=' }];
    const fields: Field[] = [
      { name: 'field1', label: 'Field 1', operators },
      { name: 'field2', label: 'Field 2', operators },
    ];
    const onQueryChange = jest.fn();
    const { container, getByTestId } = render(
      <QueryBuilder fields={fields} onQueryChange={onQueryChange} />
    );

    await user.click(getByTestId(TestID.addRule));

    expect(container.querySelector(`select.${sc.operators}`)).toBeDefined();
    expect(container.querySelectorAll(`select.${sc.operators} option`)).toHaveLength(1);
  });
});

describe('autoSelectField', () => {
  const operators = [{ name: '=', label: '=' }];
  const fields: Field[] = [
    { name: 'field1', label: 'Field 1', operators },
    { name: 'field2', label: 'Field 2', operators },
  ];

  it('initially hides the operator selector and value editor', async () => {
    const { container, getByTestId } = render(
      <QueryBuilder fields={fields} autoSelectField={false} />
    );

    await user.click(getByTestId(TestID.addRule));

    expect(container.querySelectorAll(`select.${sc.fields}`)).toHaveLength(1);
    expect(container.querySelectorAll(`select.${sc.operators}`)).toHaveLength(0);
    expect(container.querySelectorAll(`.${sc.value}`)).toHaveLength(0);
  });

  it('uses the placeholderFieldLabel', async () => {
    const placeholderFieldLabel = 'Test placeholder';
    const { getByDisplayValue, getByTestId } = render(
      <QueryBuilder
        fields={fields}
        autoSelectField={false}
        translations={{ fields: { placeholderLabel: placeholderFieldLabel } }}
      />
    );

    await user.click(getByTestId(TestID.addRule));

    expect(getByDisplayValue(placeholderFieldLabel)).toBeInTheDocument();
  });

  it('uses the placeholderFieldGroupLabel', async () => {
    const placeholderFieldGroupLabel = 'Test group placeholder';
    const { container, getByTestId } = render(
      <QueryBuilder
        fields={[{ label: 'Fields', options: fields }]}
        autoSelectField={false}
        translations={{
          fields: { placeholderGroupLabel: placeholderFieldGroupLabel },
        }}
      />
    );

    await user.click(getByTestId(TestID.addRule));

    expect(
      container.querySelector(`optgroup[label="${placeholderFieldGroupLabel}"]`)
    ).toBeInTheDocument();
  });
});

describe('autoSelectOperator', () => {
  const operators = [{ name: '=', label: '=' }];
  const fields: Field[] = [
    { name: 'field1', label: 'Field 1', operators },
    { name: 'field2', label: 'Field 2', operators },
  ];

  it('initially hides the value editor', async () => {
    const { container, getByTestId } = render(
      <QueryBuilder fields={fields} autoSelectOperator={false} />
    );

    await user.click(getByTestId(TestID.addRule));

    expect(container.querySelectorAll(`select.${sc.fields}`)).toHaveLength(1);
    expect(container.querySelectorAll(`select.${sc.operators}`)).toHaveLength(1);
    expect(container.querySelectorAll(`.${sc.value}`)).toHaveLength(0);
  });

  it('uses the placeholderOperatorLabel', async () => {
    const placeholderOperatorLabel = 'Test placeholder';
    const { getByDisplayValue, getByTestId } = render(
      <QueryBuilder
        fields={fields}
        autoSelectOperator={false}
        translations={{ operators: { placeholderLabel: placeholderOperatorLabel } }}
      />
    );

    await user.click(getByTestId(TestID.addRule));

    expect(getByDisplayValue(placeholderOperatorLabel)).toBeInTheDocument();
  });

  it('uses the placeholderOperatorGroupLabel', async () => {
    const placeholderOperatorGroupLabel = 'Test group placeholder';
    const { container, getByTestId } = render(
      <QueryBuilder
        fields={[{ label: 'Fields', options: fields }]}
        autoSelectOperator={false}
        translations={{
          operators: { placeholderGroupLabel: placeholderOperatorGroupLabel },
        }}
      />
    );

    await user.click(getByTestId(TestID.addRule));

    expect(
      container.querySelector(`optgroup[label="${placeholderOperatorGroupLabel}"]`)
    ).toBeInTheDocument();
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
    expect(selectors.queryByTestId(TestID.rule)).toBeNull();
  });

  it('adds a rule when a new group is created', async () => {
    const { selectors, onQueryChange } = setup();
    await user.click(selectors.getByTestId(TestID.addGroup));
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
    it('should clone rules', async () => {
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
      await user.click(getAllByText(t.cloneRule.label)[0]);
      expect(stripQueryIds(onQueryChange.mock.calls[1][0])).toEqual({
        combinator: 'and',
        rules: [
          { field: 'firstName', operator: '=', value: 'Steve' },
          { field: 'firstName', operator: '=', value: 'Steve' },
          { field: 'lastName', operator: '=', value: 'Vai' },
        ],
      });
    });

    it('should clone rule groups', async () => {
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
      await user.click(getAllByText(t.cloneRule.label)[0]);
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
    it('should clone a single rule with independent combinators', async () => {
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
      await user.click(getByText(t.cloneRule.label));
      expect(stripQueryIds(onQueryChange.mock.calls[1][0])).toEqual({
        rules: [
          { field: 'firstName', operator: '=', value: 'Steve' },
          'and',
          { field: 'firstName', operator: '=', value: 'Steve' },
        ],
      });
    });

    it('should clone first rule with independent combinators', async () => {
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
      await user.click(getAllByText(t.cloneRule.label)[0]);
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

    it('should clone last rule with independent combinators', async () => {
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
      await user.click(getAllByText(t.cloneRule.label)[1]);
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

  it('should add rules with independent combinators', async () => {
    const { getAllByTestId, getByTestId, queryAllByTestId } = render(
      <QueryBuilder independentCombinators />
    );
    expect(queryAllByTestId(TestID.combinators)).toHaveLength(0);
    await user.click(getByTestId(TestID.addRule));
    expect(getByTestId(TestID.rule)).toBeDefined();
    expect(queryAllByTestId(TestID.combinators)).toHaveLength(0);
    await user.click(getByTestId(TestID.addRule));
    expect(getAllByTestId(TestID.rule)).toHaveLength(2);
    expect(getAllByTestId(TestID.combinators)).toHaveLength(1);
    expect(getByTestId(TestID.combinators)).toHaveValue('and');
    await user.selectOptions(getByTestId(TestID.combinators), 'or');
    await user.click(getByTestId(TestID.addRule));
    const combinatorSelectors = getAllByTestId(TestID.combinators);
    expect(combinatorSelectors[0]).toHaveValue('or');
  });

  it('should add groups with independent combinators', async () => {
    const { getAllByTestId, getByTestId, queryAllByTestId } = render(
      <QueryBuilder independentCombinators />
    );
    expect(queryAllByTestId(TestID.combinators)).toHaveLength(0);
    await user.click(getByTestId(TestID.addGroup));
    expect(getAllByTestId(TestID.ruleGroup)).toHaveLength(2);
    expect(queryAllByTestId(TestID.combinators)).toHaveLength(0);
    await user.click(getAllByTestId(TestID.addGroup)[0]);
    expect(getAllByTestId(TestID.ruleGroup)).toHaveLength(3);
    expect(getAllByTestId(TestID.combinators)).toHaveLength(1);
    expect(getByTestId(TestID.combinators)).toHaveValue('and');
    await user.selectOptions(getByTestId(TestID.combinators), 'or');
    await user.click(getAllByTestId(TestID.addGroup)[0]);
    const combinatorSelectors = getAllByTestId(TestID.combinators);
    expect(combinatorSelectors[0]).toHaveValue('or');
  });

  it('should remove rules along with independent combinators', async () => {
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
    await user.click(getAllByTestId(TestID.removeRule)[1]);
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
    await user.click(getAllByTestId(TestID.removeRule)[0]);
    expect((onQueryChange.mock.calls[2][0] as RuleGroupType).rules).toHaveLength(1);
    expect((onQueryChange.mock.calls[2][0] as RuleGroupType).rules[0]).toHaveProperty('value', '3');
  });

  it('should remove groups along with independent combinators', async () => {
    const onQueryChange = jest.fn();
    const query: RuleGroupTypeIC = {
      rules: [{ rules: [] }, 'and', { rules: [] }, 'or', { rules: [] }],
    };
    const { getAllByTestId, rerender } = render(
      <QueryBuilder query={query} onQueryChange={onQueryChange} independentCombinators />
    );

    expect(getAllByTestId(TestID.ruleGroup)).toHaveLength(4);
    expect(getAllByTestId(TestID.combinators)).toHaveLength(2);
    await user.click(getAllByTestId(TestID.removeGroup)[1]);
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
    await user.click(getAllByTestId(TestID.removeGroup)[0]);
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

  it('should validate groups if default validator function is provided', async () => {
    const { container, getByTestId } = render(<QueryBuilder validator={defaultValidator} />);
    await user.click(getByTestId(TestID.addGroup));
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

// The drag-and-drop tests run once for QueryBuilderOriginal and once again
// for QueryBuilderWithoutDndProvider.
for (const QB of [QueryBuilderOriginal, QueryBuilderWithoutDndProvider]) {
  const [QBforDnD, getBackend] = wrapWithTestBackend(QB);
  const gDnDBe = () => getBackend()!;
  describe(`enableDragAndDrop (${QB.displayName})`, () => {
    describe('standard rule groups', () => {
      it('should set data-dnd attribute appropriately', () => {
        const { container, rerender } = render(<QBforDnD />);
        expect(container.querySelectorAll('div')[0].dataset.dnd).toBe('disabled');
        rerender(<QBforDnD enableDragAndDrop />);
        expect(container.querySelectorAll('div')[0].dataset.dnd).toBe('enabled');
      });

      it('moves a rule down within the same group', () => {
        const onQueryChange = jest.fn();
        const { getAllByTestId } = render(
          <QBforDnD
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
        simulateDragDrop(getHandlerId(rules[0], 'drag'), getHandlerId(rules[1], 'drop'), gDnDBe());
        expect((onQueryChange.mock.calls[1][0] as RuleGroupType).rules.map(r => r.id)).toEqual([
          '1',
          '0',
        ]);
      });

      it('moves a rule to a different group with a common ancestor', () => {
        const onQueryChange = jest.fn();
        const { getAllByTestId } = render(
          <QBforDnD
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
        simulateDragDrop(getHandlerId(rule, 'drag'), getHandlerId(ruleGroup, 'drop'), gDnDBe());
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
          <QBforDnD
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
        simulateDragDrop(getHandlerId(rules[0], 'drag'), getHandlerId(rules[1], 'drop'), gDnDBe());
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
          <QBforDnD
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
        simulateDragDrop(getHandlerId(rules[1], 'drag'), getHandlerId(ruleGroup, 'drop'), gDnDBe());
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
          <QBforDnD
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
        simulateDragDrop(getHandlerId(rules[0], 'drag'), getHandlerId(rules[2], 'drop'), gDnDBe());
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
          <QBforDnD
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
        simulateDragDrop(getHandlerId(rules[2], 'drag'), getHandlerId(ruleGroup, 'drop'), gDnDBe());
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
          <QBforDnD
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
          gDnDBe()
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
          <QBforDnD
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
        simulateDragDrop(getHandlerId(rule, 'drag'), getHandlerId(ruleGroup, 'drop'), gDnDBe());
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
          <QBforDnD
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
        simulateDragDrop(getHandlerId(dragRule, 'drag'), getHandlerId(dropRule, 'drop'), gDnDBe());
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
}

describe('disabled', () => {
  it('should have the correct classname', () => {
    const { container } = render(<QueryBuilder disabled />);
    expect(container.querySelectorAll('div')[0]).toHaveClass(sc.disabled);
  });
  it('prevents changes when disabled', async () => {
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
    await user.click(getAllByTitle(t.addRule.title)[0]);
    await user.click(getAllByTitle(t.addGroup.title)[0]);
    await user.click(getAllByTitle(t.removeRule.title)[0]);
    await user.click(getAllByTitle(t.removeGroup.title)[0]);
    await user.click(getAllByTitle(t.cloneRule.title)[0]);
    await user.click(getAllByTitle(t.cloneRuleGroup.title)[0]);
    await user.click(getAllByLabelText(t.notToggle.label)[0]);
    await user.selectOptions(getAllByDisplayValue('Field 0')[0], 'field1');
    await user.selectOptions(getAllByDisplayValue('=')[0], '>');
    await user.type(getAllByDisplayValue('4')[0], 'Not 4');
    const dragRule = getAllByTestId(TestID.rule)[1];
    const dropRule = getAllByTestId(TestID.rule)[3];
    expect(() =>
      simulateDragDrop(
        getHandlerId(dragRule, 'drag'),
        getHandlerId(dropRule, 'drop'),
        getDndBackend()
      )
    ).toThrow();
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

  it('prevents changes from rogue components when disabled', async () => {
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
              <button onClick={() => schema.onPropChange('combinator', 'or', [1])} />
              <button onClick={() => schema.onPropChange('not', true, [])} />
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
    for (const b of rg.querySelectorAll('button')) {
      await user.click(b);
    }
    expect(onQueryChange).not.toHaveBeenCalled();
  });
});

describe('locked rules', () => {
  it('top level lock button is disabled when disabled prop is set on component', () => {
    const { getByTestId } = render(<QueryBuilder showLockButtons disabled />);
    expect(getByTestId(TestID.lockGroup)).toBeDisabled();
  });

  it('does not update the query when the root group is disabled', async () => {
    const onQueryChange = jest.fn();
    const { getByTestId } = render(
      <QueryBuilder
        fields={[
          { name: 'field0', label: 'Field 0' },
          { name: 'field1', label: 'Field 1' },
        ]}
        enableMountQueryChange={false}
        independentCombinators
        onQueryChange={onQueryChange}
        enableDragAndDrop
        showCloneButtons
        showNotToggle
        controlElements={{
          ruleGroup: ({ schema }) => (
            <div data-testid={TestID.ruleGroup}>
              <button onClick={() => schema.onPropChange('not', true, [])} />
              <button onClick={() => schema.onPropChange('field', 'f1', [0])} />
            </div>
          ),
        }}
        query={{
          disabled: true,
          rules: [{ field: 'field0', operator: '=', value: '0' }],
        }}
      />
    );
    const rg = getByTestId(TestID.ruleGroup);
    for (const b of rg.querySelectorAll('button')) {
      await user.click(b);
    }
    expect(onQueryChange).not.toHaveBeenCalled();
  });

  it('does not update the query when an ancestor group is disabled', async () => {
    const onQueryChange = jest.fn();
    const { getByTestId } = render(
      <QueryBuilder
        fields={[
          { name: 'field0', label: 'Field 0' },
          { name: 'field1', label: 'Field 1' },
        ]}
        enableMountQueryChange={false}
        independentCombinators
        onQueryChange={onQueryChange}
        enableDragAndDrop
        showCloneButtons
        showNotToggle
        controlElements={{
          ruleGroup: ({ schema }) => (
            <div data-testid={TestID.ruleGroup}>
              <button onClick={() => schema.onPropChange('not', true, [2])} />
              <button onClick={() => schema.onPropChange('field', 'f1', [2, 0])} />
            </div>
          ),
        }}
        query={{
          rules: [
            { field: 'field0', operator: '=', value: '0' },
            'and',
            { disabled: true, rules: [{ field: 'field1', operator: '=', value: '1' }] },
          ],
        }}
      />
    );
    const rg = getByTestId(TestID.ruleGroup);
    for (const b of rg.querySelectorAll('button')) {
      await user.click(b);
    }
    expect(onQueryChange).not.toHaveBeenCalled();
  });
});

describe('value source field', () => {
  const fields: Field[] = [
    { name: 'f1', label: 'Field 1', valueSources: ['field'] },
    { name: 'f2', label: 'Field 2', valueSources: ['field'] },
    { name: 'f3', label: 'Field 3', valueSources: ['field'], comparator: () => false },
    { name: 'f4', label: 'Field 4', valueSources: [] as any },
    { name: 'f5', label: 'Field 5', valueSources: ['field', 'value'] },
  ];

  it('sets the right default value', async () => {
    const { getByDisplayValue, getByTestId } = render(
      <QueryBuilder fields={fields} getDefaultField="f1" />
    );
    await user.click(getByTestId(TestID.addRule));
    expect(getByDisplayValue(fields.filter(f => f.name !== 'f1')[0].label)).toHaveClass(sc.value);
  });

  it('handles empty comparator results', async () => {
    const { getByTestId } = render(<QueryBuilder fields={fields} getDefaultField="f3" />);
    await user.click(getByTestId(TestID.addRule));
    expect(getByTestId(TestID.valueEditor).getElementsByTagName('option')).toHaveLength(0);
  });

  it('handles invalid valueSources property', async () => {
    const { getByTestId, queryByDisplayValue } = render(
      <QueryBuilder fields={fields} getDefaultField="f4" />
    );
    await user.click(getByTestId(TestID.addRule));
    expect(queryByDisplayValue('Field 1')).toBeNull();
  });

  it('sets the default valueSource correctly', async () => {
    const { getByTestId } = render(<QueryBuilder fields={fields} getDefaultField="f1" />);
    await user.click(getByTestId(TestID.addRule));
    await user.selectOptions(getByTestId(TestID.fields), 'f5');
    expect(getByTestId(TestID.valueSourceSelector)).toHaveValue('field');
  });
});

describe('debug mode', () => {
  it('logs info', () => {
    render(<QueryBuilder debugMode />);
    expect('TODO: test logging').toBeDefined();
  });
});
