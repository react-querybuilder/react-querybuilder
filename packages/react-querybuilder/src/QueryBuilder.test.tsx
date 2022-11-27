import type {
  ActionWithRulesAndAddersProps,
  Field,
  NameLabelPair,
  OptionGroup,
  QueryBuilderProps,
  RuleGroupProps,
  RuleGroupType,
  RuleGroupTypeAny,
  RuleGroupTypeIC,
  RuleType,
  ValidationMap,
} from '@react-querybuilder/ts';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  defaultPlaceholderFieldLabel,
  defaultPlaceholderFieldName,
  defaultPlaceholderOperatorName,
  defaultTranslations as t,
  LogType,
  standardClassnames as sc,
  TestID,
} from './defaults';
import {
  errorBothQueryDefaultQuery,
  errorControlledToUncontrolled,
  errorUncontrolledToControlled,
} from './messages';
import { QueryBuilder } from './QueryBuilder';
import { defaultValidator, findPath, formatQuery } from './utils';

const user = userEvent.setup();

export const stripQueryIds = (query: RuleGroupTypeAny): RuleGroupTypeAny =>
  JSON.parse(formatQuery(query, 'json_without_ids'));

const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
afterEach(() => {
  consoleError.mockReset();
  consoleWarn.mockReset();
});

describe('when rendered', () => {
  it('should have the correct className', () => {
    const { container } = render(<QueryBuilder />);
    expect(container.querySelectorAll('div')[0]).toHaveClass(sc.queryBuilder);
  });

  it('should render the root RuleGroup', () => {
    render(<QueryBuilder />);
    expect(screen.getByTestId(TestID.ruleGroup)).toBeInTheDocument();
  });
});

describe('when rendered with defaultQuery only', () => {
  it('changes the query in uncontrolled state', async () => {
    const onQueryChange = jest.fn();
    render(
      <QueryBuilder
        defaultQuery={{
          combinator: 'and',
          rules: [{ field: 'firstName', operator: '=', value: 'Steve' }],
        }}
        onQueryChange={onQueryChange}
      />
    );
    expect(onQueryChange.mock.calls[0][0]).toHaveProperty('id');
    expect(screen.getAllByTestId(TestID.rule)).toHaveLength(1);
    await user.click(screen.getByTestId(TestID.addRule));
    expect(screen.getAllByTestId(TestID.rule)).toHaveLength(2);
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
    expect(onQueryChange.mock.calls[0][0]).toHaveProperty('id');
    expect(onQueryChange.mock.calls[0][0]).toMatchObject(query);
  });
});

describe('when initial query without fields is provided, create rule should work', () => {
  it('should be able to create rule on add rule click', async () => {
    render(<QueryBuilder />);
    await user.click(screen.getByTestId(TestID.addRule));
    expect(screen.getByTestId(TestID.rule)).toBeInTheDocument();
  });
});

describe('when initial query with duplicate fields is provided', () => {
  it('passes down a unique set of fields (by name)', async () => {
    render(
      <QueryBuilder
        fields={[
          { name: 'dupe', label: 'One' },
          { name: 'dupe', label: 'Two' },
        ]}
      />
    );
    await user.click(screen.getByTestId(TestID.addRule));
    expect(screen.getByTestId(TestID.rule)).toBeInTheDocument();
    expect(screen.getAllByTestId(TestID.fields)).toHaveLength(1);
  });
});

describe('when initial query with fields object is provided', () => {
  it('passes down fields sorted by label using the key as name', async () => {
    render(
      <QueryBuilder
        fields={{
          xyz: { name: 'dupe', label: 'One' },
          abc: { name: 'dupe', label: 'Two' },
        }}
      />
    );
    await user.click(screen.getByTestId(TestID.addRule));
    expect(screen.getByTestId(TestID.rule)).toBeInTheDocument();
    expect(screen.getByTestId(TestID.fields).querySelectorAll('option')).toHaveLength(2);
    expect(
      Array.from(screen.getByTestId(TestID.fields).querySelectorAll('option')).map(opt => opt.value)
    ).toEqual(['xyz', 'abc']);
    expect(screen.getByText('One')).toBeInTheDocument();
    expect(screen.getByText('Two')).toBeInTheDocument();
    expect(
      Array.from(screen.getByTestId(TestID.fields).querySelectorAll('option'))[0]
    ).toHaveTextContent('One');
    expect(
      Array.from(screen.getByTestId(TestID.fields).querySelectorAll('option'))[1]
    ).toHaveTextContent('Two');
  });

  it('respects autoSelectField={false}', async () => {
    render(
      <QueryBuilder
        fields={{
          xyz: { name: 'dupe', label: 'One' },
          abc: { name: 'dupe', label: 'Two' },
        }}
        autoSelectField={false}
      />
    );
    await user.click(screen.getByTestId(TestID.addRule));
    expect(screen.getByTestId(TestID.rule)).toBeInTheDocument();
    expect(screen.getByTestId(TestID.fields).querySelectorAll('option')).toHaveLength(3);
    expect(
      Array.from(screen.getByTestId(TestID.fields).querySelectorAll('option')).map(opt => opt.value)
    ).toEqual([defaultPlaceholderFieldName, 'xyz', 'abc']);
    expect(screen.getByText('One')).toBeInTheDocument();
    expect(screen.getByText('Two')).toBeInTheDocument();
    expect(
      Array.from(screen.getByTestId(TestID.fields).querySelectorAll('option'))[0]
    ).toHaveTextContent(defaultPlaceholderFieldLabel);
    expect(
      Array.from(screen.getByTestId(TestID.fields).querySelectorAll('option'))[1]
    ).toHaveTextContent('One');
    expect(
      Array.from(screen.getByTestId(TestID.fields).querySelectorAll('option'))[2]
    ).toHaveTextContent('Two');
  });

  it('does not mutate a fields array with duplicates', () => {
    const fields: Field[] = [
      { name: 'f', label: 'Field' },
      { name: 'f', label: 'Field' },
    ];
    render(<QueryBuilder fields={fields} />);
    expect(fields).toHaveLength(2);
  });

  it('does not mutate a fields option group array with duplicates', () => {
    const optgroups: OptionGroup<Field>[] = [
      { label: 'OG1', options: [{ name: 'f1', label: 'Field' }] },
      { label: 'OG1', options: [{ name: 'f2', label: 'Field' }] },
      { label: 'OG2', options: [{ name: 'f1', label: 'Field' }] },
    ];
    render(<QueryBuilder fields={optgroups} />);
    expect(optgroups).toHaveLength(3);
    for (const og of optgroups.map(og => og.options)) {
      expect(og).toHaveLength(1);
    }
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
    selectors: render(<QueryBuilder query={queryWithoutID} fields={fields} />),
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
    expect(selectors.getAllByTestId(TestID.fields)[1]).toHaveValue(defaultPlaceholderFieldName);
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
    render(<QueryBuilder query={query} fields={fields} getOperators={() => null} />);
    expect(screen.getByTestId(TestID.operators)).toHaveValue('=');
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
    render(<QueryBuilder query={query} fields={fields} getValueEditorType={() => null} />);
    expect(screen.getByTestId(TestID.valueEditor)).toHaveAttribute('type', 'text');
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
    render(<QueryBuilder query={query} fields={fields} getInputType={() => null} />);
    expect(screen.getByTestId(TestID.valueEditor)).toHaveAttribute('type', 'text');
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
    render(
      <QueryBuilder
        query={query}
        fields={fields}
        getValueEditorType={getValueEditorType}
        getValues={getValues}
      />
    );
    const opts = screen.getByTestId(TestID.valueEditor).querySelectorAll('option');
    expect(opts).toHaveLength(1);
  });

  it('should handle invalid getValues function', () => {
    // @ts-expect-error getValues should return an array of options or option groups
    render(<QueryBuilder query={query} fields={fields} getValues={() => null} />);
    const select = screen.getByTestId(TestID.valueEditor);
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
        getValueEditorType={f => (f === 'field2' ? 'checkbox' : 'text')}
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
        getValueEditorType={f => (f === 'field2' ? 'checkbox' : 'text')}
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
    render(<QueryBuilder resetOnOperatorChange fields={fields} onQueryChange={onQueryChange} />);
    await user.click(screen.getByTestId(TestID.addRule));
    await user.selectOptions(screen.getByTestId(TestID.operators), '>');
    await user.type(screen.getByTestId(TestID.valueEditor), 'Test');
    await user.selectOptions(screen.getByTestId(TestID.operators), '=');

    expect(onQueryChange.mock.calls[3][0].rules[0].operator).toBe('>');
    expect(onQueryChange.mock.calls[6][0].rules[0].value).toBe('Test');
    expect(onQueryChange.mock.calls[7][0].rules[0].operator).toBe('=');
    expect(onQueryChange.mock.calls[7][0].rules[0].value).toBe('');
  });

  it('does not reset the value when false', async () => {
    const onQueryChange = jest.fn();
    render(
      <QueryBuilder resetOnOperatorChange={false} fields={fields} onQueryChange={onQueryChange} />
    );
    await user.click(screen.getByTestId(TestID.addRule));
    await user.selectOptions(screen.getByTestId(TestID.operators), '>');
    await user.type(screen.getByTestId(TestID.valueEditor), 'Test');
    await user.selectOptions(screen.getByTestId(TestID.operators), '=');

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
    render(<QueryBuilder getDefaultField="field2" fields={fields} onQueryChange={onQueryChange} />);
    await user.click(screen.getByTestId(TestID.addRule));
    expect(onQueryChange.mock.calls[1][0].rules[0].field).toBe('field2');
  });

  it('sets the default field as a function', async () => {
    const onQueryChange = jest.fn();
    render(
      <QueryBuilder
        getDefaultField={() => 'field2'}
        fields={fields}
        onQueryChange={onQueryChange}
      />
    );
    await user.click(screen.getByTestId(TestID.addRule));
    expect(onQueryChange.mock.calls[1][0].rules[0].field).toBe('field2');
  });
});

describe('getDefaultOperator prop', () => {
  const fields: Field[] = [{ name: 'field1', label: 'Field 1' }];

  it('sets the default operator as a string', async () => {
    const onQueryChange = jest.fn();
    render(
      <QueryBuilder getDefaultOperator="beginsWith" fields={fields} onQueryChange={onQueryChange} />
    );
    await user.click(screen.getByTestId(TestID.addRule));
    expect(onQueryChange.mock.calls[1][0].rules[0].operator).toBe('beginsWith');
  });

  it('sets the default operator as a function', async () => {
    const onQueryChange = jest.fn();
    render(
      <QueryBuilder
        getDefaultOperator={() => 'beginsWith'}
        fields={fields}
        onQueryChange={onQueryChange}
      />
    );
    await user.click(screen.getByTestId(TestID.addRule));
    expect(onQueryChange.mock.calls[1][0].rules[0].operator).toBe('beginsWith');
  });
});

describe('defaultOperator property in field', () => {
  it('sets the default operator', async () => {
    const fields: Field[] = [{ name: 'field1', label: 'Field 1', defaultOperator: 'beginsWith' }];
    const onQueryChange = jest.fn();
    render(<QueryBuilder fields={fields} onQueryChange={onQueryChange} />);
    await user.click(screen.getByTestId(TestID.addRule));
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
    render(
      <QueryBuilder
        getDefaultValue={() => 'Test Value'}
        fields={fields}
        onQueryChange={onQueryChange}
      />
    );
    await user.click(screen.getByTestId(TestID.addRule));
    expect(onQueryChange.mock.calls[1][0].rules[0].value).toBe('Test Value');
  });
});

describe('onAddRule prop', () => {
  it('cancels the rule addition', async () => {
    const onLog = jest.fn();
    const onQueryChange = jest.fn();
    const onAddRule = jest.fn(() => false as const);
    render(
      <QueryBuilder onAddRule={onAddRule} onQueryChange={onQueryChange} debugMode onLog={onLog} />
    );
    expect(onQueryChange).toHaveBeenCalledTimes(1);

    await user.click(screen.getByTestId(TestID.addRule));

    expect(onAddRule).toHaveBeenCalled();
    expect(onQueryChange).toHaveBeenCalledTimes(1);
    const { rule, parentPath, query } = onLog.mock.calls[1][0];
    expect(rule).toBeDefined();
    expect(parentPath).toBeDefined();
    expect(query).toBeDefined();
  });

  it('modifies the rule addition', async () => {
    const onQueryChange = jest.fn();
    const rule: RuleType = { field: 'test', operator: '=', value: 'modified' };
    render(<QueryBuilder onAddRule={() => rule} onQueryChange={onQueryChange} />);

    await user.click(screen.getByTestId(TestID.addRule));

    expect(onQueryChange.mock.calls[1][0].rules[0].value).toBe('modified');
  });

  it('passes handleOnClick context to onAddRule', async () => {
    const onQueryChange = jest.fn();
    const rule: RuleType = { field: 'test', operator: '=', value: 'modified' };
    const AddRuleAction = (props: ActionWithRulesAndAddersProps) => (
      <>
        <button onClick={e => props.handleOnClick(e, false)}>Fail</button>
        <button onClick={e => props.handleOnClick(e, true)}>Succeed</button>
      </>
    );
    render(
      <QueryBuilder
        onAddRule={(_r, _pp, _q, c) => c && rule}
        onQueryChange={onQueryChange}
        enableMountQueryChange={false}
        controlElements={{ addRuleAction: AddRuleAction }}
      />
    );

    await user.click(screen.getByText('Fail'));
    expect(onQueryChange).not.toHaveBeenCalled();

    await user.click(screen.getByText('Succeed'));
    expect(onQueryChange.mock.calls[0][0].rules[0].value).toBe('modified');
  });
});

describe('onAddGroup prop', () => {
  it('cancels the group addition', async () => {
    const onLog = jest.fn();
    const onQueryChange = jest.fn();
    const onAddGroup = jest.fn(() => false as const);
    render(
      <QueryBuilder onAddGroup={onAddGroup} onQueryChange={onQueryChange} debugMode onLog={onLog} />
    );
    expect(onQueryChange).toHaveBeenCalledTimes(1);

    await user.click(screen.getByTestId(TestID.addGroup));

    expect(onAddGroup).toHaveBeenCalled();
    expect(onQueryChange).toHaveBeenCalledTimes(1);
    const { ruleGroup, parentPath, query } = onLog.mock.calls[1][0];
    expect(ruleGroup).toBeDefined();
    expect(parentPath).toBeDefined();
    expect(query).toBeDefined();
  });

  it('modifies the group addition', async () => {
    const onQueryChange = jest.fn();
    const group: RuleGroupType = { combinator: 'fake', rules: [] };
    render(<QueryBuilder onAddGroup={() => group} onQueryChange={onQueryChange} />);

    await user.click(screen.getByTestId(TestID.addGroup));

    expect(onQueryChange.mock.calls[1][0].rules[0].combinator).toBe('fake');
  });

  it('passes handleOnClick context to onAddGroup', async () => {
    const onQueryChange = jest.fn();
    const ruleGroup: RuleGroupType = { combinator: 'fake', rules: [] };
    const AddGroupAction = (props: ActionWithRulesAndAddersProps) => (
      <>
        <button onClick={e => props.handleOnClick(e, false)}>Fail</button>
        <button onClick={e => props.handleOnClick(e, true)}>Succeed</button>
      </>
    );
    render(
      <QueryBuilder
        onAddGroup={(_g, _pp, _q, c) => c && ruleGroup}
        onQueryChange={onQueryChange}
        enableMountQueryChange={false}
        controlElements={{ addGroupAction: AddGroupAction }}
      />
    );

    await user.click(screen.getByText('Fail'));
    expect(onQueryChange).not.toHaveBeenCalled();

    await user.click(screen.getByText('Succeed'));
    expect(onQueryChange.mock.calls[0][0].rules[0].combinator).toBe('fake');
  });
});

describe('onRemove prop', () => {
  it('cancels the removal', async () => {
    const onQueryChange = jest.fn();
    render(
      <QueryBuilder
        defaultQuery={{
          combinator: 'and',
          rules: [
            {
              combinator: 'and',
              rules: [{ field: 'field1', operator: '=', value: 'value1' }],
            },
          ],
        }}
        onRemove={() => false}
        onQueryChange={onQueryChange}
        enableMountQueryChange={false}
      />
    );

    await user.click(screen.getByTestId(TestID.removeGroup));
    await user.click(screen.getByTestId(TestID.removeRule));
    expect(onQueryChange).not.toHaveBeenCalled();
  });
});

describe('defaultValue property in field', () => {
  it('sets the default value', async () => {
    const fields: Field[] = [
      { name: 'field1', label: 'Field 1', defaultValue: 'Test Value 1' },
      { name: 'field2', label: 'Field 2', defaultValue: 'Test Value 2' },
    ];
    const onQueryChange = jest.fn();
    render(<QueryBuilder fields={fields} onQueryChange={onQueryChange} />);

    await user.click(screen.getByTestId(TestID.addRule));

    expect(onQueryChange.mock.calls[1][0].rules[0].value).toBe('Test Value 1');
  });
});

describe('values property in field', () => {
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

  it('sets the values list', async () => {
    const onQueryChange = jest.fn();
    render(
      <QueryBuilder
        getValueEditorType={() => 'select'}
        fields={fields}
        onQueryChange={onQueryChange}
      />
    );

    await user.click(screen.getByTestId(TestID.addRule));
    expect(screen.getAllByTestId(TestID.valueEditor)).toHaveLength(1);
    expect(screen.getByTestId(TestID.valueEditor).getElementsByTagName('option')).toHaveLength(2);
    expect(screen.getByDisplayValue('Test value 1')).toBeInTheDocument();
  });

  it('sets the values list for "between" operator', async () => {
    const onQueryChange = jest.fn();
    render(
      <QueryBuilder
        getValueEditorType={() => 'select'}
        getDefaultOperator="between"
        fields={fields}
        onQueryChange={onQueryChange}
      />
    );

    await user.click(screen.getByTestId(TestID.addRule));
    expect(screen.getAllByTestId(TestID.valueEditor)).toHaveLength(1);
    const betweenSelects = screen
      .getAllByRole('combobox')
      .filter(bs => bs.classList.contains(sc.valueListItem));
    expect(betweenSelects).toHaveLength(2);
    for (const bs of betweenSelects) {
      expect(bs.getElementsByTagName('option')).toHaveLength(2);
      expect(bs).toHaveValue('test');
    }
    expect(screen.getAllByDisplayValue('Test value 1')).toHaveLength(2);
  });
});

describe('inputType property in field', () => {
  it('sets the input type', async () => {
    const fields: Field[] = [{ name: 'field1', label: 'Field 1', inputType: 'number' }];
    const onQueryChange = jest.fn();
    const { container } = render(<QueryBuilder fields={fields} onQueryChange={onQueryChange} />);

    await user.click(screen.getByTestId(TestID.addRule));

    expect(container.querySelector('input[type="number"]')).toBeDefined();
  });
});

describe('valueEditorType property in field', () => {
  it('sets the value editor type', async () => {
    const fields: Field[] = [{ name: 'field1', label: 'Field 1', valueEditorType: 'select' }];
    const onQueryChange = jest.fn();
    const { container } = render(<QueryBuilder fields={fields} onQueryChange={onQueryChange} />);

    await user.click(screen.getByTestId(TestID.addRule));

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
    const { container } = render(<QueryBuilder fields={fields} onQueryChange={onQueryChange} />);

    await user.click(screen.getByTestId(TestID.addRule));

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
    const { container } = render(<QueryBuilder fields={fields} autoSelectField={false} />);

    await user.click(screen.getByTestId(TestID.addRule));

    expect(container.querySelectorAll(`select.${sc.fields}`)).toHaveLength(1);
    expect(container.querySelectorAll(`select.${sc.operators}`)).toHaveLength(0);
    expect(container.querySelectorAll(`.${sc.value}`)).toHaveLength(0);
  });

  it('uses the placeholderLabel and placeholderName', async () => {
    const placeholderName = 'Test placeholder name';
    const placeholderLabel = 'Test placeholder label';
    render(
      <QueryBuilder
        fields={fields}
        autoSelectField={false}
        translations={{ fields: { placeholderLabel, placeholderName } }}
      />
    );

    await user.click(screen.getByTestId(TestID.addRule));

    expect(screen.getByDisplayValue(placeholderLabel)).toHaveValue(placeholderName);
  });

  it('uses the placeholderGroupLabel', async () => {
    const placeholderGroupLabel = 'Test group placeholder';
    const { container } = render(
      <QueryBuilder
        fields={[{ label: 'Fields', options: fields }]}
        autoSelectField={false}
        translations={{ fields: { placeholderGroupLabel } }}
      />
    );

    await user.click(screen.getByTestId(TestID.addRule));

    expect(
      container.querySelector(`optgroup[label="${placeholderGroupLabel}"]`)
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
    const { container } = render(<QueryBuilder fields={fields} autoSelectOperator={false} />);

    await user.click(screen.getByTestId(TestID.addRule));

    expect(container.querySelectorAll(`select.${sc.fields}`)).toHaveLength(1);
    expect(container.querySelectorAll(`select.${sc.operators}`)).toHaveLength(1);
    expect(screen.getByTestId(TestID.operators)).toHaveValue(defaultPlaceholderOperatorName);
    expect(container.querySelectorAll(`.${sc.value}`)).toHaveLength(0);
  });

  it('uses the placeholderLabel and placeholderName', async () => {
    const placeholderName = 'Test placeholder name';
    const placeholderLabel = 'Test placeholder label';
    render(
      <QueryBuilder
        fields={fields}
        autoSelectOperator={false}
        translations={{ operators: { placeholderLabel, placeholderName } }}
      />
    );

    await user.click(screen.getByTestId(TestID.addRule));

    expect(screen.getByDisplayValue(placeholderLabel)).toHaveValue(placeholderName);
  });

  it('uses the placeholderGroupLabel', async () => {
    const placeholderGroupLabel = 'Test group placeholder';
    const { container } = render(
      <QueryBuilder
        fields={fields.map(f => ({
          ...f,
          operators: [{ label: 'Operators', options: operators }],
        }))}
        autoSelectOperator={false}
        translations={{ operators: { placeholderGroupLabel } }}
      />
    );

    await user.click(screen.getByTestId(TestID.addRule));

    expect(
      container.querySelector(`optgroup[label="${placeholderGroupLabel}"]`)
    ).toBeInTheDocument();
  });
});

describe('addRuleToNewGroups', () => {
  const query: RuleGroupType = { combinator: 'and', rules: [] };

  it('does not add a rule when the component is created', () => {
    render(<QueryBuilder query={query} addRuleToNewGroups />);
    expect(screen.queryByTestId(TestID.rule)).toBeNull();
  });

  it('adds a rule when a new group is created', async () => {
    const onQueryChange = jest.fn();
    render(<QueryBuilder query={query} onQueryChange={onQueryChange} addRuleToNewGroups />);
    await user.click(screen.getByTestId(TestID.addGroup));
    expect(
      ((onQueryChange.mock.calls[1][0] as RuleGroupType).rules[0] as RuleGroupType).rules[0]
    ).toHaveProperty('field', defaultPlaceholderFieldName);
  });

  it('adds a rule when mounted if no initial query is provided', () => {
    render(<QueryBuilder addRuleToNewGroups />);
    expect(screen.getByTestId(TestID.rule)).toBeDefined();
  });
});

describe('showCloneButtons', () => {
  describe('standard rule groups', () => {
    it('should clone rules', async () => {
      const onQueryChange = jest.fn();
      render(
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
      await user.click(screen.getAllByText(t.cloneRule.label)[0]);
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
      render(
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
      await user.click(screen.getAllByText(t.cloneRule.label)[0]);
      expect(stripQueryIds(onQueryChange.mock.calls[1][0])).toEqual({
        combinator: 'and',
        rules: [
          {
            combinator: 'or',
            rules: [{ field: 'firstName', operator: '=', value: 'Steve' }],
          },
          {
            combinator: 'or',
            rules: [{ field: 'firstName', operator: '=', value: 'Steve' }],
          },
          { field: 'lastName', operator: '=', value: 'Vai' },
        ],
      });
    });
  });

  describe('independent combinators', () => {
    it('should clone a single rule with independent combinators', async () => {
      const onQueryChange = jest.fn();
      render(
        <QueryBuilder
          showCloneButtons
          independentCombinators
          onQueryChange={onQueryChange}
          defaultQuery={{
            rules: [{ field: 'firstName', operator: '=', value: 'Steve' }],
          }}
        />
      );
      await user.click(screen.getByText(t.cloneRule.label));
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
      render(
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
      await user.click(screen.getAllByText(t.cloneRule.label)[0]);
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
      render(
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
      await user.click(screen.getAllByText(t.cloneRule.label)[1]);
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
    render(<QueryBuilder onQueryChange={onQueryChange} independentCombinators />);
    expect(screen.getByTestId(TestID.ruleGroup)).toBeDefined();
    expect(onQueryChange.mock.calls[0][0]).not.toHaveProperty('combinator');
  });

  it('should render a rule group with addRuleToNewGroups', () => {
    render(<QueryBuilder addRuleToNewGroups independentCombinators />);
    expect(screen.getByTestId(TestID.rule)).toBeDefined();
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
    render(<QueryBuilder independentCombinators />);
    expect(screen.queryAllByTestId(TestID.combinators)).toHaveLength(0);
    await user.click(screen.getByTestId(TestID.addRule));
    expect(screen.getByTestId(TestID.rule)).toBeDefined();
    expect(screen.queryAllByTestId(TestID.combinators)).toHaveLength(0);
    await user.click(screen.getByTestId(TestID.addRule));
    expect(screen.getAllByTestId(TestID.rule)).toHaveLength(2);
    expect(screen.getAllByTestId(TestID.combinators)).toHaveLength(1);
    expect(screen.getByTestId(TestID.combinators)).toHaveValue('and');
    await user.selectOptions(screen.getByTestId(TestID.combinators), 'or');
    await user.click(screen.getByTestId(TestID.addRule));
    const combinatorSelectors = screen.getAllByTestId(TestID.combinators);
    expect(combinatorSelectors[0]).toHaveValue('or');
  });

  it('should add groups with independent combinators', async () => {
    render(<QueryBuilder independentCombinators />);
    expect(screen.queryAllByTestId(TestID.combinators)).toHaveLength(0);
    await user.click(screen.getByTestId(TestID.addGroup));
    expect(screen.getAllByTestId(TestID.ruleGroup)).toHaveLength(2);
    expect(screen.queryAllByTestId(TestID.combinators)).toHaveLength(0);
    await user.click(screen.getAllByTestId(TestID.addGroup)[0]);
    expect(screen.getAllByTestId(TestID.ruleGroup)).toHaveLength(3);
    expect(screen.getAllByTestId(TestID.combinators)).toHaveLength(1);
    expect(screen.getByTestId(TestID.combinators)).toHaveValue('and');
    await user.selectOptions(screen.getByTestId(TestID.combinators), 'or');
    await user.click(screen.getAllByTestId(TestID.addGroup)[0]);
    const combinatorSelectors = screen.getAllByTestId(TestID.combinators);
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
    const { rerender } = render(
      <QueryBuilder query={query} onQueryChange={onQueryChange} independentCombinators />
    );
    expect(screen.getAllByTestId(TestID.rule)).toHaveLength(3);
    expect(screen.getAllByTestId(TestID.combinators)).toHaveLength(2);
    await user.click(screen.getAllByTestId(TestID.removeRule)[1]);
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
    await user.click(screen.getAllByTestId(TestID.removeRule)[0]);
    expect((onQueryChange.mock.calls[2][0] as RuleGroupType).rules).toHaveLength(1);
    expect((onQueryChange.mock.calls[2][0] as RuleGroupType).rules[0]).toHaveProperty('value', '3');
  });

  it('should remove groups along with independent combinators', async () => {
    const onQueryChange = jest.fn();
    const query: RuleGroupTypeIC = {
      rules: [{ rules: [] }, 'and', { rules: [] }, 'or', { rules: [] }],
    };
    const { rerender } = render(
      <QueryBuilder query={query} onQueryChange={onQueryChange} independentCombinators />
    );

    expect(screen.getAllByTestId(TestID.ruleGroup)).toHaveLength(4);
    expect(screen.getAllByTestId(TestID.combinators)).toHaveLength(2);
    await user.click(screen.getAllByTestId(TestID.removeGroup)[1]);
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
    await user.click(screen.getAllByTestId(TestID.removeGroup)[0]);
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
    const { container } = render(<QueryBuilder validator={defaultValidator} />);
    await user.click(screen.getByTestId(TestID.addGroup));
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
    const valMap: ValidationMap = {
      id: { valid: false, reasons: ['invalid'] },
    };
    const RuleGroupValMapDisplay = (props: RuleGroupProps) => (
      <div data-testid={TestID.ruleGroup}>{JSON.stringify(props.schema.validationMap)}</div>
    );
    render(
      <QueryBuilder
        validator={() => valMap}
        controlElements={{ ruleGroup: RuleGroupValMapDisplay }}
      />
    );
    expect(screen.getByTestId(TestID.ruleGroup).innerHTML).toBe(JSON.stringify(valMap));
  });
});

describe('disabled', () => {
  it('should have the correct classname', () => {
    const { container } = render(<QueryBuilder disabled />);
    expect(container.querySelectorAll('div')[0]).toHaveClass(sc.disabled);
  });

  it('prevents changes when disabled', async () => {
    const onQueryChange = jest.fn();
    render(
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
    await user.click(screen.getAllByTitle(t.addRule.title)[0]);
    await user.click(screen.getAllByTitle(t.addGroup.title)[0]);
    await user.click(screen.getAllByTitle(t.removeRule.title)[0]);
    await user.click(screen.getAllByTitle(t.removeGroup.title)[0]);
    await user.click(screen.getAllByTitle(t.cloneRule.title)[0]);
    await user.click(screen.getAllByTitle(t.cloneRuleGroup.title)[0]);
    await user.click(screen.getAllByLabelText(t.notToggle.label)[0]);
    await user.selectOptions(screen.getAllByDisplayValue('Field 0')[0], 'field1');
    await user.selectOptions(screen.getAllByDisplayValue('=')[0], '>');
    await user.type(screen.getAllByDisplayValue('4')[0], 'Not 4');
    expect(onQueryChange).not.toHaveBeenCalled();
  });

  it('disables a specific path and its children', () => {
    render(
      <QueryBuilder
        disabled={[[2]]}
        query={{
          combinator: 'and',
          rules: [
            { field: 'firstName', operator: '=', value: 'Steve' },
            { field: 'lastName', operator: '=', value: 'Vai' },
            {
              combinator: 'and',
              rules: [{ field: 'age', operator: '>', value: 28 }],
            },
          ],
        }}
      />
    );
    // First two rules (paths [0] and [1]) are enabled
    expect(screen.getAllByTestId(TestID.fields)[0]).not.toBeDisabled();
    expect(screen.getAllByTestId(TestID.operators)[0]).not.toBeDisabled();
    expect(screen.getAllByTestId(TestID.valueEditor)[0]).not.toBeDisabled();
    expect(screen.getAllByTestId(TestID.fields)[1]).not.toBeDisabled();
    expect(screen.getAllByTestId(TestID.operators)[1]).not.toBeDisabled();
    expect(screen.getAllByTestId(TestID.valueEditor)[1]).not.toBeDisabled();
    // Rule group at path [2] is disabled
    expect(screen.getAllByTestId(TestID.combinators)[1]).toBeDisabled();
    expect(screen.getAllByTestId(TestID.addRule)[1]).toBeDisabled();
    expect(screen.getAllByTestId(TestID.addGroup)[1]).toBeDisabled();
    expect(screen.getAllByTestId(TestID.fields)[2]).toBeDisabled();
    expect(screen.getAllByTestId(TestID.operators)[2]).toBeDisabled();
    expect(screen.getAllByTestId(TestID.valueEditor)[2]).toBeDisabled();
  });

  it('prevents changes from rogue components when disabled', async () => {
    const onQueryChange = jest.fn();
    const ruleToAdd: RuleType = { field: 'f1', operator: '=', value: 'v1' };
    const groupToAdd: RuleGroupTypeIC = { rules: [] };
    render(
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
          ruleGroup: ({ actions }) => (
            <div data-testid={TestID.ruleGroup}>
              <button onClick={() => actions.onRuleAdd(ruleToAdd, [])}>onRuleAdd</button>
              <button onClick={() => actions.onGroupAdd(groupToAdd, [])}>onGroupAdd</button>
              <button onClick={() => actions.onPropChange('field', 'f2', [0])}>onPropChange</button>
              <button onClick={() => actions.onPropChange('combinator', 'or', [1])}>
                onPropChange
              </button>
              <button onClick={() => actions.onPropChange('not', true, [])}>onPropChange</button>
              <button onClick={() => actions.onRuleRemove([0])}>onRuleRemove</button>
              <button onClick={() => actions.onGroupRemove([6])}>onGroupRemove</button>
              <button onClick={() => actions.moveRule([6], [0])}>moveRule</button>
              <button onClick={() => actions.moveRule([6], [0], true)}>moveRule</button>
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
    const rg = screen.getByTestId(TestID.ruleGroup);
    for (const b of rg.querySelectorAll('button')) {
      await user.click(b);
    }
    expect(onQueryChange).not.toHaveBeenCalled();
  });
});

describe('locked rules', () => {
  it('top level lock button is disabled when disabled prop is set on component', () => {
    render(<QueryBuilder showLockButtons disabled />);
    expect(screen.getByTestId(TestID.lockGroup)).toBeDisabled();
  });

  it('does not update the query when the root group is disabled', async () => {
    const onQueryChange = jest.fn();
    render(
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
          ruleGroup: ({ actions }) => (
            <div data-testid={TestID.ruleGroup}>
              <button onClick={() => actions.onPropChange('not', true, [])} />
              <button onClick={() => actions.onPropChange('field', 'f1', [0])} />
            </div>
          ),
        }}
        query={{
          disabled: true,
          rules: [{ field: 'field0', operator: '=', value: '0' }],
        }}
      />
    );
    const rg = screen.getByTestId(TestID.ruleGroup);
    for (const b of rg.querySelectorAll('button')) {
      await user.click(b);
    }
    expect(onQueryChange).not.toHaveBeenCalled();
  });

  it('does not update the query when an ancestor group is disabled', async () => {
    const onQueryChange = jest.fn();
    render(
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
          ruleGroup: ({ actions }) => (
            <div data-testid={TestID.ruleGroup}>
              <button onClick={() => actions.onPropChange('not', true, [2])} />
              <button onClick={() => actions.onPropChange('field', 'f1', [2, 0])} />
            </div>
          ),
        }}
        query={{
          rules: [
            { field: 'field0', operator: '=', value: '0' },
            'and',
            {
              disabled: true,
              rules: [{ field: 'field1', operator: '=', value: '1' }],
            },
          ],
        }}
      />
    );
    const rg = screen.getByTestId(TestID.ruleGroup);
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
    {
      name: 'f3',
      label: 'Field 3',
      valueSources: ['field'],
      comparator: () => false,
    },
    // @ts-expect-error valueSources cannot be an empty array
    { name: 'f4', label: 'Field 4', valueSources: [] },
    { name: 'f5', label: 'Field 5', valueSources: ['field', 'value'] },
  ];
  const fieldsWithBetween: Field[] = [
    {
      name: 'fb',
      label: 'Field B',
      valueSources: ['field'],
      defaultOperator: 'between',
    },
    ...fields,
  ];

  it('sets the right default value', async () => {
    render(<QueryBuilder fields={fields} getDefaultField="f1" />);
    await user.click(screen.getByTestId(TestID.addRule));
    expect(screen.getByDisplayValue(fields.filter(f => f.name !== 'f1')[0].label)).toHaveClass(
      sc.value
    );
  });

  it('sets the right default value for "between" operator', async () => {
    const onQueryChange = jest.fn();
    render(
      <QueryBuilder fields={fieldsWithBetween} getDefaultField="fb" onQueryChange={onQueryChange} />
    );
    await user.click(screen.getByTestId(TestID.addRule));
    expect(screen.getAllByDisplayValue(fields.filter(f => f.name !== 'fb')[0].label)).toHaveLength(
      2
    );
    expect(((onQueryChange.mock.calls[1][0] as RuleGroupType).rules[0] as RuleType).value).toBe(
      'f1,f1'
    );
  });

  it('sets the right default value for "between" operator and listsAsArrays', async () => {
    const onQueryChange = jest.fn();
    render(
      <QueryBuilder
        fields={fieldsWithBetween}
        getDefaultField="fb"
        onQueryChange={onQueryChange}
        listsAsArrays
      />
    );
    await user.click(screen.getByTestId(TestID.addRule));
    expect(((onQueryChange.mock.calls[1][0] as RuleGroupType).rules[0] as RuleType).value).toEqual([
      'f1',
      'f1',
    ]);
  });

  it('handles empty comparator results', async () => {
    render(<QueryBuilder fields={fields} getDefaultField="f3" />);
    await user.click(screen.getByTestId(TestID.addRule));
    expect(screen.getByTestId(TestID.valueEditor).getElementsByTagName('option')).toHaveLength(0);
  });

  it('handles invalid valueSources property', async () => {
    render(<QueryBuilder fields={fields} getDefaultField="f4" />);
    await user.click(screen.getByTestId(TestID.addRule));
    expect(screen.queryByDisplayValue('Field 1')).toBeNull();
  });

  it('sets the default valueSource correctly', async () => {
    render(<QueryBuilder fields={fields} getDefaultField="f1" />);
    await user.click(screen.getByTestId(TestID.addRule));
    await user.selectOptions(screen.getByTestId(TestID.fields), 'f5');
    expect(screen.getByTestId(TestID.valueSourceSelector)).toHaveValue('field');
  });
});

describe('nested object immutability', () => {
  it('does not modify rules it does not have to modify', async () => {
    const onQueryChange = jest.fn();
    const immutableRule: RuleType = {
      field: 'this',
      operator: '=',
      value: 'should stay the same',
    };
    const defaultQuery: RuleGroupType = {
      combinator: 'and',
      rules: [
        { field: 'this', operator: '=', value: 'can change' },
        { combinator: 'and', rules: [immutableRule] },
      ],
    };
    const props: QueryBuilderProps = {
      onQueryChange,
      defaultQuery,
      enableMountQueryChange: false,
    };
    render(<QueryBuilder {...props} />);
    const { calls } = onQueryChange.mock;
    await user.click(screen.getAllByTestId(TestID.addRule)[0]);
    expect(calls[0][0]).not.toBe(defaultQuery);
    expect(findPath([0], calls[0][0])).toMatchObject(findPath([0], defaultQuery) as RuleType);
    expect(findPath([1, 0], calls[0][0])).toMatchObject(immutableRule);
    await user.selectOptions(screen.getAllByTestId(TestID.operators)[0], '>');
    expect(findPath([0], calls[1][0])).not.toBe(findPath([0], calls[0][0]));
    expect(findPath([1, 0], calls[1][0])).toMatchObject(immutableRule);
  });
});

describe('debug mode', () => {
  it('logs info', async () => {
    const onLog = jest.fn();
    const defaultQuery: RuleGroupType = {
      not: false,
      combinator: 'and',
      rules: [{ field: 'f1', operator: '=', value: 'v1' }],
    };
    render(<QueryBuilder debugMode query={defaultQuery} onLog={onLog} onRemove={() => false} />);
    const { query, queryState, schema } = onLog.mock.calls[0][0];
    const [processedRoot, processedQueryState] = [query, queryState].map(q =>
      JSON.parse(formatQuery(q, 'json_without_ids'))
    );
    expect(processedRoot).toEqual(defaultQuery);
    expect(processedQueryState).toEqual({ ...defaultQuery, rules: [] });
    expect(schema).toBeDefined();
    const removeRule = await screen.findByTestId(TestID.removeRule);
    await user.click(removeRule);
    expect(onLog.mock.calls[1][0].type).toBe(LogType.onRemoveFalse);
  });

  it('logs failed query updates due to disabled prop', async () => {
    const onLog = jest.fn();
    const defaultQuery: RuleGroupType = {
      combinator: 'and',
      rules: [],
    };
    const ruleGroup = ({
      path,
      actions: { moveRule, onGroupAdd, onGroupRemove, onRuleAdd, onPropChange },
    }: RuleGroupProps) => (
      <>
        <button onClick={() => onPropChange('combinator', 'or', [])}>Change Combinator</button>
        <button onClick={() => onRuleAdd({ field: 'f', operator: '=', value: 'v' }, [])}>
          Add Rule
        </button>
        <button onClick={() => onGroupAdd({ combinator: 'and', rules: [] }, [])}>Add Group</button>
        <button onClick={() => moveRule(path, [0], true)}>Clone Group</button>
        <button onClick={() => onGroupRemove(path)}>Remove Group</button>
      </>
    );
    render(
      <QueryBuilder
        debugMode
        enableMountQueryChange={false}
        query={defaultQuery}
        onLog={onLog}
        disabled
        controlElements={{ ruleGroup }}
      />
    );
    for (const btnText of [
      'Change Combinator',
      'Add Rule',
      'Add Group',
      'Clone Group',
      'Remove Group',
    ]) {
      await user.click(screen.getAllByText(btnText)[0]);
    }
    const {
      path: _pFromChangeCombinatorLog,
      prop: _propFromLog,
      value: _vFromLog,
      query: _qFromChangeCombinatorLog,
    } = onLog.mock.calls[0][0];
    const {
      rule: _rFromLog,
      parentPath: _ppFromAddRuleLog,
      query: _qFromAddRuleLog,
    } = onLog.mock.calls[1][0];
    const {
      ruleGroup: _rgFromLog,
      parentPath: _ppFromLog,
      query: _qAddedFromLog,
    } = onLog.mock.calls[2][0];
    const {
      oldPath: _opFromLog,
      newPath: _npFromLog,
      query: _qClonedFromLog,
    } = onLog.mock.calls[3][0];
    const { path: _pFromLog, query: _qRemovedFromLog } = onLog.mock.calls[4][0];
  });
});

describe('controlled/uncontrolled warnings', () => {
  it('tracks changes from controlled to uncontrolled and vice versa', () => {
    const getQuery = (): RuleGroupType => ({
      combinator: `${Math.random()}`,
      rules: [],
    });
    const { rerender } = render(<QueryBuilder enableMountQueryChange={false} />);
    expect(consoleError).not.toHaveBeenCalled();
    rerender(<QueryBuilder query={getQuery()} />);
    expect(consoleError.mock.calls[0][0]).toBe(errorUncontrolledToControlled);
    // @ts-expect-error QueryBuilderProps cannot accept both query and defaultQuery
    rerender(<QueryBuilder defaultQuery={getQuery()} query={getQuery()} />);
    expect(consoleError.mock.calls[1][0]).toBe(errorBothQueryDefaultQuery);
    rerender(<QueryBuilder defaultQuery={getQuery()} />);
    expect(consoleError.mock.calls[2][0]).toBe(errorControlledToUncontrolled);
  });
});
