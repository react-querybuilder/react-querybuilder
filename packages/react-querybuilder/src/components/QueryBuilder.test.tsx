import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { consoleMocks } from '../../genericTests';
import {
  LogType,
  TestID,
  defaultPlaceholderFieldLabel,
  defaultPlaceholderFieldName,
  defaultPlaceholderOperatorName,
  standardClassnames as sc,
  defaultTranslations as t,
} from '../defaults';
import { messages } from '../messages';
import type {
  ActionProps,
  ActionWithRulesAndAddersProps,
  Field,
  FieldByValue,
  FieldSelectorProps,
  FullCombinator,
  FullField,
  FullOperator,
  FullOption,
  Option,
  OptionGroup,
  QueryBuilderProps,
  RuleGroupProps,
  RuleGroupType,
  RuleGroupTypeIC,
  RuleProps,
  RuleType,
  ValidationMap,
  ValueSelectorProps,
} from '../types';
import { defaultValidator, findPath, generateID, numericRegex, toFullOption } from '../utils';
import { QueryBuilder } from './QueryBuilder';
import { QueryBuilderContext } from './QueryBuilderContext';
import { defaultControlElements } from './defaults';

const user = userEvent.setup();

const { consoleError } = consoleMocks();

describe('when rendered', () => {
  it('has the correct role', () => {
    render(<QueryBuilder />);
    expect(screen.getByRole('form')).toBeInTheDocument();
  });

  it('has the correct className', () => {
    render(<QueryBuilder />);
    expect(screen.getByRole('form')).toHaveClass(sc.queryBuilder);
  });

  it('renders the root RuleGroup', () => {
    render(<QueryBuilder />);
    expect(screen.getByTestId(TestID.ruleGroup)).toBeInTheDocument();
  });
});

describe('when rendered with defaultQuery only', () => {
  it('changes the query in uncontrolled state', async () => {
    const onQueryChange = jest.fn<never, [RuleGroupType]>();
    render(
      <QueryBuilder
        defaultQuery={{
          combinator: 'and',
          rules: [{ field: 'firstName', operator: '=', value: 'Steve' }],
        }}
        onQueryChange={onQueryChange}
      />
    );
    expect(onQueryChange).toHaveBeenCalledTimes(1);
    expect(onQueryChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: expect.any(String) })
    );
    expect(screen.getAllByTestId(TestID.rule)).toHaveLength(1);

    await user.click(screen.getByTestId(TestID.addRule));
    expect(screen.getAllByTestId(TestID.rule)).toHaveLength(2);
  });
});

describe('when rendered with onQueryChange callback', () => {
  it('calls onQueryChange with query', () => {
    const onQueryChange = jest.fn<never, [RuleGroupType]>();
    const idGenerator = () => 'id';
    render(<QueryBuilder onQueryChange={onQueryChange} idGenerator={idGenerator} />);
    expect(onQueryChange).toHaveBeenCalledTimes(1);
    const query: RuleGroupType = {
      combinator: 'and',
      rules: [],
      not: false,
    };
    expect(onQueryChange).toHaveBeenCalledTimes(1);
    expect(onQueryChange).toHaveBeenLastCalledWith({ ...query, id: 'id' });
  });
});

describe('when initial query without fields is provided, create rule should work', () => {
  it('is able to create rule on add rule click', async () => {
    render(<QueryBuilder />);

    await user.click(screen.getByTestId(TestID.addRule));
    expect(screen.getByTestId(TestID.rule)).toBeInTheDocument();
  });
});

describe('when initial query with duplicate fields is provided', () => {
  it('passes down a unique set of fields by name', async () => {
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

  it('passes down a unique set of fields by value', async () => {
    render(
      <QueryBuilder
        fields={[
          { name: 'notdupe1', value: 'dupe', label: 'One' },
          { name: 'notdupe2', value: 'dupe', label: 'Two' },
        ]}
      />
    );

    await user.click(screen.getByTestId(TestID.addRule));
    expect(screen.getByTestId(TestID.rule)).toBeInTheDocument();
    expect(screen.getAllByTestId(TestID.fields)).toHaveLength(1);
  });
});

describe('when fields have no name property', () => {
  it('passes down a unique set of fields by value', async () => {
    render(
      <QueryBuilder
        addRuleToNewGroups
        fields={[
          { value: 'f1', label: 'One' },
          { value: 'f2', label: 'Two' },
        ]}
      />
    );
    expect(within(screen.getByTestId(TestID.fields)).getAllByRole('option')).toHaveLength(2);
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
    rules: [{ field: 'firstName', value: 'Test without ID', operator: '=' }],
  };
  const fields: Field[] = [
    { name: 'firstName', label: 'First Name' },
    { name: 'lastName', label: 'Last Name' },
    { name: 'age', label: 'Age' },
  ];

  const setup = () => ({
    selectors: render(<QueryBuilder query={queryWithoutID} fields={fields} />),
  });

  it('contains a <Rule /> with the correct props', () => {
    setup();
    expect(screen.getByTestId(TestID.rule)).toBeInTheDocument();
    expect(screen.getByTestId(TestID.fields)).toHaveValue('firstName');
    expect(screen.getByTestId(TestID.operators)).toHaveValue('=');
    expect(screen.getByTestId(TestID.valueEditor)).toHaveValue('Test without ID');
  });

  it('has a select control with the provided fields', () => {
    setup();
    expect(screen.getByTestId(TestID.fields).querySelectorAll('option')).toHaveLength(3);
  });

  it('has a field selector with the correct field', () => {
    setup();
    expect(screen.getByTestId(TestID.fields)).toHaveValue('firstName');
  });

  it('has an operator selector with the correct operator', () => {
    setup();
    expect(screen.getByTestId(TestID.operators)).toHaveValue('=');
  });

  it('has an input control with the correct value', () => {
    setup();
    expect(screen.getByTestId(TestID.rule).querySelector('input')).toHaveValue('Test without ID');
  });
});

describe('when fields are provided with optgroups', () => {
  const query: RuleGroupType = {
    combinator: 'and',
    not: false,
    rules: [{ field: 'firstName', value: 'Test without ID', operator: '=' }],
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
    setup();
    expect(screen.getByTestId(TestID.fields).querySelectorAll('optgroup')).toHaveLength(2);
  });

  it('selects the correct field', async () => {
    setup();

    await user.click(screen.getByTestId(TestID.addRule));
    expect(screen.getAllByTestId(TestID.fields)[1]).toHaveValue('firstName');
  });

  it('selects the default option', async () => {
    const {
      selectors: { rerender },
    } = setup();
    rerender(<QueryBuilder defaultQuery={query} fields={fields} autoSelectField={false} />);

    await user.click(screen.getByTestId(TestID.addRule));
    expect(screen.getAllByTestId(TestID.fields)[1]).toHaveValue(defaultPlaceholderFieldName);
  });
});

describe('when initial operators are provided', () => {
  const operators: Option[] = [
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

  it('uses the given operators', () => {
    setup();
    expect(screen.getByTestId(TestID.operators).querySelectorAll('option')).toHaveLength(4);
  });

  it('matches the label of the first operator', () => {
    setup();
    expect(screen.getByTestId(TestID.operators).querySelectorAll('option')[0]).toHaveTextContent(
      'Custom Is Null'
    );
  });
});

describe('get* callbacks', () => {
  const fields: FullField[] = [
    { name: 'firstName', label: 'First Name' },
    { name: 'lastName', label: 'Last Name' },
    { name: 'age', label: 'Age' },
  ].map(toFullOption);
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

  describe('when getOperators fn prop is provided', () => {
    it('invokes custom getOperators function', () => {
      const getOperators = jest.fn(() => [{ name: 'op1', label: 'Operator 1' }]);
      render(<QueryBuilder query={query} fields={fields} getOperators={getOperators} />);
      expect(getOperators).toHaveBeenCalledWith(rule.field, { fieldData: fields[1] });
    });

    it('handles invalid getOperators return value', () => {
      render(<QueryBuilder query={query} fields={fields} getOperators={() => null} />);
      expect(screen.getByTestId(TestID.operators)).toHaveValue('=');
    });
  });

  describe('when getValueEditorType fn prop is provided', () => {
    it('invokes custom getValueEditorType function', () => {
      const getValueEditorType = jest.fn(() => 'text' as const);
      render(
        <QueryBuilder query={query} fields={fields} getValueEditorType={getValueEditorType} />
      );
      expect(getValueEditorType).toHaveBeenCalledWith(rule.field, rule.operator, {
        fieldData: fields[1],
      });
    });

    it('handles invalid getValueEditorType function', () => {
      render(<QueryBuilder query={query} fields={fields} getValueEditorType={() => null} />);
      expect(screen.getByTestId(TestID.valueEditor)).toHaveAttribute('type', 'text');
    });

    it('prefers valueEditorType field property as string', () => {
      const checkboxFields: FullField[] = fields.map(f => ({ ...f, valueEditorType: 'checkbox' }));
      render(
        <QueryBuilder query={query} fields={checkboxFields} getValueEditorType={() => 'text'} />
      );
      expect(screen.getByTestId(TestID.valueEditor)).toHaveAttribute('type', 'checkbox');
    });

    it('prefers valueEditorType field property as function', () => {
      const checkboxFields = fields.map(f => ({ ...f, valueEditorType: () => 'checkbox' }));
      render(
        <QueryBuilder query={query} fields={checkboxFields} getValueEditorType={() => 'text'} />
      );
      expect(screen.getByTestId(TestID.valueEditor)).toHaveAttribute('type', 'checkbox');
    });
  });

  describe('when getInputType fn prop is provided', () => {
    it('invokes custom getInputType function', () => {
      const getInputType = jest.fn(() => 'text' as const);
      render(<QueryBuilder query={query} fields={fields} getInputType={getInputType} />);
      expect(getInputType).toHaveBeenCalledWith(rule.field, rule.operator, {
        fieldData: fields[1],
      });
    });

    it('handles invalid getInputType function', () => {
      render(<QueryBuilder query={query} fields={fields} getInputType={() => null} />);
      expect(screen.getByTestId(TestID.valueEditor)).toHaveAttribute('type', 'text');
    });
  });

  describe('when getValues fn prop is provided', () => {
    const getValueEditorType = () => 'select' as const;

    it('invokes custom getValues function', () => {
      const getValues = jest.fn(() => [{ name: 'test', label: 'Test' }]);
      render(
        <QueryBuilder
          query={query}
          fields={fields}
          getValueEditorType={getValueEditorType}
          getValues={getValues}
        />
      );
      expect(getValues).toHaveBeenCalledWith(rule.field, rule.operator, { fieldData: fields[1] });
    });

    it('invokes custom getValues function returning value-based options', () => {
      const getValues = jest.fn((): FieldByValue[] => [{ value: 'test', label: 'Test' }]);
      render(
        <QueryBuilder
          query={query}
          fields={fields}
          getValueEditorType={getValueEditorType}
          getValues={getValues}
        />
      );
      expect(getValues).toHaveBeenCalledWith(rule.field, rule.operator, { fieldData: fields[1] });
    });

    it('generates the correct number of options', () => {
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

    it('handles invalid getValues function', () => {
      // @ts-expect-error getValues should return an array of options or option groups
      render(<QueryBuilder query={query} fields={fields} getValues={() => null} />);
      const select = screen.getByTestId(TestID.valueEditor);
      const opts = select.querySelectorAll('option');
      expect(opts).toHaveLength(0);
    });
  });
});

describe('actions', () => {
  const fields: Field[] = [
    { name: 'field1', label: 'Field 1' },
    { name: 'field2', label: 'Field 2' },
    { name: 'field3', label: 'Field 3', valueEditorType: 'select' },
  ];

  const setup = (xp?: QueryBuilderProps<RuleGroupType, FullOption, FullOption, FullOption>) => {
    const onQueryChange = jest.fn<never, [RuleGroupType]>();
    return {
      onQueryChange,
      selectors: render(<QueryBuilder fields={fields} onQueryChange={onQueryChange} {...xp} />),
    };
  };

  it('updates field with arbitrary value', async () => {
    const fieldSelector = ({ value, handleOnChange }: FieldSelectorProps) => (
      <input type="text" value={value} onChange={e => handleOnChange(e.target.value)} />
    );
    const { onQueryChange } = setup({
      controlElements: { fieldSelector },
      addRuleToNewGroups: true,
    });
    const input = screen.getAllByRole('textbox')[0];
    await user.type(input, 'f', { initialSelectionStart: 0, initialSelectionEnd: 10 });
    expect(onQueryChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ rules: [expect.objectContaining({ field: 'f' })] })
    );
  });

  it('creates a new rule and remove that rule', async () => {
    const { onQueryChange } = setup();
    expect(onQueryChange).toHaveBeenLastCalledWith(expect.objectContaining({ rules: [] }));

    await user.click(screen.getByTestId(TestID.addRule));
    expect(screen.getByTestId(TestID.rule)).toBeInTheDocument();
    expect(onQueryChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ rules: [expect.anything()] })
    );

    await user.click(screen.getByTestId(TestID.removeRule));
    expect(screen.queryByTestId(TestID.rule)).toBeNull();
    expect(onQueryChange).toHaveBeenLastCalledWith(expect.objectContaining({ rules: [] }));
  });

  it('creates a new group and remove that group', async () => {
    const { onQueryChange } = setup();
    expect(onQueryChange).toHaveBeenLastCalledWith(expect.objectContaining({ rules: [] }));

    await user.click(screen.getByTestId(TestID.addGroup));
    expect(screen.getAllByTestId(TestID.ruleGroup)).toHaveLength(2);
    expect(onQueryChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ rules: [expect.anything()] })
    );
    expect(onQueryChange).toHaveBeenLastCalledWith(expect.objectContaining({ combinator: 'and' }));

    await user.click(screen.getByTestId(TestID.removeGroup));
    expect(screen.getAllByTestId(TestID.ruleGroup)).toHaveLength(1);
    expect(onQueryChange).toHaveBeenLastCalledWith(expect.objectContaining({ rules: [] }));
  });

  it('creates a new rule and change the fields', async () => {
    const { onQueryChange } = setup();
    expect(onQueryChange).toHaveBeenLastCalledWith(expect.objectContaining({ rules: [] }));

    await user.click(screen.getByTestId(TestID.addRule));
    expect(onQueryChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ rules: [expect.anything()] })
    );

    await user.selectOptions(screen.getByTestId(TestID.fields), 'field2');
    expect(onQueryChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ rules: [expect.objectContaining({ field: 'field2' })] })
    );
  });

  it('creates a new rule and change the operator', async () => {
    const { onQueryChange } = setup();
    expect(onQueryChange).toHaveBeenLastCalledWith(expect.objectContaining({ rules: [] }));

    await user.click(screen.getByTestId(TestID.addRule));
    expect(onQueryChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ rules: [expect.anything()] })
    );

    await user.selectOptions(screen.getByTestId(TestID.operators), '!=');
    expect(onQueryChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ rules: [expect.objectContaining({ operator: '!=' })] })
    );
  });

  it('changes the combinator of the root group', async () => {
    const { onQueryChange } = setup();
    expect(onQueryChange).toHaveBeenLastCalledWith(expect.objectContaining({ rules: [] }));

    await user.selectOptions(screen.getByTestId(TestID.combinators), 'or');
    expect(onQueryChange).toHaveBeenLastCalledWith(expect.objectContaining({ rules: [] }));
    expect(onQueryChange).toHaveBeenLastCalledWith(expect.objectContaining({ combinator: 'or' }));
  });

  it('sets default value for a rule', async () => {
    const {
      selectors: { rerender },
      onQueryChange,
    } = setup();
    rerender(
      <QueryBuilder
        fields={fields}
        onQueryChange={onQueryChange}
        getValues={(field: string) => {
          if (field === 'field1' || field === 'field3') {
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

    await user.click(screen.getByTestId(TestID.addRule));
    expect(onQueryChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ rules: [expect.objectContaining({ value: '' })] })
    );

    await user.selectOptions(screen.getByTestId(TestID.fields), 'field2');
    expect(onQueryChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        rules: [expect.objectContaining({ field: 'field2', value: false })],
      })
    );

    await user.selectOptions(screen.getByTestId(TestID.fields), 'field3');
    expect(onQueryChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        rules: [expect.objectContaining({ field: 'field3', value: 'value1' })],
      })
    );
  });

  it('sets default value for a "radio" rule', async () => {
    const fs: Field[] = [
      {
        name: 'f',
        label: 'F',
        valueEditorType: 'radio',
        values: [
          { name: 'value1', label: 'Value 1' },
          { name: 'value2', label: 'Value 2' },
        ],
      },
    ];
    const { onQueryChange } = setup({ fields: fs });

    await user.click(screen.getByTestId(TestID.addRule));
    expect(onQueryChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        rules: [expect.objectContaining({ value: 'value1' })],
      })
    );
  });
});

describe('resetOnFieldChange prop', () => {
  const fields: Field[] = [
    { name: 'field1', label: 'Field 1' },
    { name: 'field2', label: 'Field 2' },
  ];

  const setup = () => {
    const onQueryChange = jest.fn<never, [RuleGroupType]>();
    return {
      onQueryChange,
      selectors: render(<QueryBuilder fields={fields} onQueryChange={onQueryChange} />),
    };
  };

  it('resets the operator and value when true', async () => {
    const { onQueryChange } = setup();

    await user.click(screen.getByTestId(TestID.addRule));
    await user.selectOptions(screen.getByTestId(TestID.operators), '>');
    expect(onQueryChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ rules: [expect.objectContaining({ operator: '>' })] })
    );

    await user.type(screen.getByTestId(TestID.valueEditor), 'Test');
    expect(onQueryChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ rules: [expect.objectContaining({ value: 'Test' })] })
    );

    await user.selectOptions(screen.getByTestId(TestID.fields), 'field2');
    expect(onQueryChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ rules: [expect.objectContaining({ operator: '=', value: '' })] })
    );
  });

  it('does not reset the operator and value when false', async () => {
    const {
      selectors: { rerender },
      onQueryChange,
    } = setup();
    rerender(
      <QueryBuilder resetOnFieldChange={false} fields={fields} onQueryChange={onQueryChange} />
    );

    await user.click(screen.getByTestId(TestID.addRule));
    await user.selectOptions(screen.getByTestId(TestID.operators), '>');
    expect(onQueryChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ rules: [expect.objectContaining({ operator: '>' })] })
    );

    await user.type(screen.getByTestId(TestID.valueEditor), 'Test');
    expect(onQueryChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ rules: [expect.objectContaining({ value: 'Test' })] })
    );

    await user.selectOptions(screen.getByTestId(TestID.fields), 'field2');
    expect(onQueryChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        rules: [expect.objectContaining({ operator: '>', value: 'Test' })],
      })
    );
  });
});

describe('resetOnOperatorChange prop', () => {
  const fields: Field[] = [
    { name: 'field1', label: 'Field 1' },
    { name: 'field2', label: 'Field 2' },
    {
      name: 'field3',
      label: 'Field 3',
      values: [
        { name: 'value1', label: 'Value 1' },
        { name: 'value2', label: 'Value 2' },
      ],
    },
  ];

  it('resets the value when true', async () => {
    const onQueryChange = jest.fn<never, [RuleGroupType]>();
    render(
      <QueryBuilder
        resetOnOperatorChange
        fields={fields}
        onQueryChange={onQueryChange}
        addRuleToNewGroups
      />
    );

    await user.selectOptions(screen.getByTestId(TestID.operators), '>');
    expect(onQueryChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ rules: [expect.objectContaining({ operator: '>' })] })
    );

    await user.type(screen.getByTestId(TestID.valueEditor), 'Test');
    expect(onQueryChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ rules: [expect.objectContaining({ value: 'Test' })] })
    );

    await user.selectOptions(screen.getByTestId(TestID.operators), '=');
    expect(onQueryChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ rules: [expect.objectContaining({ operator: '=', value: '' })] })
    );

    // Does not choose a value from the values list when the operator changes
    await user.selectOptions(screen.getByTestId(TestID.fields), 'field3');
    await user.selectOptions(screen.getByTestId(TestID.operators), 'beginsWith');
    expect(onQueryChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        rules: [expect.objectContaining({ operator: 'beginsWith', value: '' })],
      })
    );
  });

  it('does not reset the value when false', async () => {
    const onQueryChange = jest.fn<never, [RuleGroupType]>();
    render(
      <QueryBuilder
        resetOnOperatorChange={false}
        fields={fields}
        onQueryChange={onQueryChange}
        addRuleToNewGroups
      />
    );

    await user.selectOptions(screen.getByTestId(TestID.operators), '>');
    expect(onQueryChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ rules: [expect.objectContaining({ operator: '>' })] })
    );

    await user.type(screen.getByTestId(TestID.valueEditor), 'Test');
    expect(onQueryChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ rules: [expect.objectContaining({ value: 'Test' })] })
    );

    await user.selectOptions(screen.getByTestId(TestID.operators), '=');
    expect(onQueryChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        rules: [expect.objectContaining({ operator: '=', value: 'Test' })],
      })
    );
  });
});

describe('getDefaultField prop', () => {
  const fields: Field[] = [
    { name: 'field1', label: 'Field 1' },
    { name: 'field2', label: 'Field 2' },
  ];

  it('sets the default field as a string', async () => {
    const onQueryChange = jest.fn<never, [RuleGroupType]>();
    render(<QueryBuilder getDefaultField="field2" fields={fields} onQueryChange={onQueryChange} />);

    await user.click(screen.getByTestId(TestID.addRule));
    expect(onQueryChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ rules: [expect.objectContaining({ field: 'field2' })] })
    );
  });

  it('sets the default field as a function', async () => {
    const onQueryChange = jest.fn<never, [RuleGroupType]>();
    render(
      <QueryBuilder
        getDefaultField={() => 'field2'}
        fields={fields}
        onQueryChange={onQueryChange}
      />
    );

    await user.click(screen.getByTestId(TestID.addRule));
    expect(onQueryChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ rules: [expect.objectContaining({ field: 'field2' })] })
    );
  });
});

describe('getDefaultOperator prop', () => {
  const fields: Field[] = [{ name: 'field1', label: 'Field 1' }];

  it('sets the default operator as a string', async () => {
    const onQueryChange = jest.fn<never, [RuleGroupType]>();
    render(
      <QueryBuilder getDefaultOperator="beginsWith" fields={fields} onQueryChange={onQueryChange} />
    );

    await user.click(screen.getByTestId(TestID.addRule));
    expect(onQueryChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ rules: [expect.objectContaining({ operator: 'beginsWith' })] })
    );
  });

  it('sets the default operator as a function', async () => {
    const onQueryChange = jest.fn<never, [RuleGroupType]>();
    render(
      <QueryBuilder
        getDefaultOperator={() => 'beginsWith'}
        fields={fields}
        onQueryChange={onQueryChange}
      />
    );

    await user.click(screen.getByTestId(TestID.addRule));
    expect(onQueryChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ rules: [expect.objectContaining({ operator: 'beginsWith' })] })
    );
  });
});

describe('defaultOperator property in field', () => {
  it('sets the default operator', async () => {
    const fields: Field[] = [{ name: 'field1', label: 'Field 1', defaultOperator: 'beginsWith' }];
    const onQueryChange = jest.fn<never, [RuleGroupType]>();
    render(<QueryBuilder fields={fields} onQueryChange={onQueryChange} />);

    await user.click(screen.getByTestId(TestID.addRule));
    expect(onQueryChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ rules: [expect.objectContaining({ operator: 'beginsWith' })] })
    );
  });
});

describe('getDefaultValue prop', () => {
  it('sets the default value', async () => {
    const onQueryChange = jest.fn<never, [RuleGroupType]>();
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
    expect(onQueryChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ rules: [expect.objectContaining({ value: 'Test Value' })] })
    );
  });
});

describe('onAddRule prop', () => {
  it('cancels the rule addition', async () => {
    const onLog = jest.fn();
    const onQueryChange = jest.fn<never, [RuleGroupType]>();
    const onAddRule = jest.fn(() => false as const);
    render(
      <QueryBuilder onAddRule={onAddRule} onQueryChange={onQueryChange} debugMode onLog={onLog} />
    );
    expect(onQueryChange).toHaveBeenCalledTimes(1);

    await user.click(screen.getByTestId(TestID.addRule));
    expect(onAddRule).toHaveBeenCalled();
    expect(onQueryChange).toHaveBeenCalledTimes(1);
    expect(onLog).toHaveBeenLastCalledWith(
      expect.objectContaining({
        rule: expect.anything(),
        parentPath: expect.any(Array),
        query: expect.anything(),
      })
    );
  });

  it('modifies the rule addition', async () => {
    const onQueryChange = jest.fn<never, [RuleGroupType]>();
    const rule: RuleType = { field: 'test', operator: '=', value: 'modified' };
    render(<QueryBuilder onAddRule={() => rule} onQueryChange={onQueryChange} />);

    await user.click(screen.getByTestId(TestID.addRule));
    expect(onQueryChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ rules: [expect.objectContaining({ value: 'modified' })] })
    );
  });

  it('specifies the preceding combinator', async () => {
    const onQueryChange = jest.fn<never, [RuleGroupTypeIC]>();
    const dq: RuleGroupTypeIC = { rules: [{ field: 'f1', operator: '=', value: 'v1' }] };
    const rule: RuleType = {
      field: 'test',
      operator: '=',
      value: 'modified',
      combinatorPreceding: 'or',
    };
    render(<QueryBuilder onAddRule={() => rule} onQueryChange={onQueryChange} defaultQuery={dq} />);

    await user.click(screen.getByTestId(TestID.addRule));
    expect(onQueryChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ rules: expect.arrayContaining([expect.anything(), 'or']) })
    );
    expect(screen.getByTestId(TestID.combinators)).toHaveValue('or');
  });

  it('passes handleOnClick context to onAddRule', async () => {
    const onQueryChange = jest.fn<never, [RuleGroupType]>();
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
    expect(onQueryChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ rules: [expect.objectContaining({ value: 'modified' })] })
    );
  });
});

describe('onAddGroup prop', () => {
  it('cancels the group addition', async () => {
    const onLog = jest.fn();
    const onQueryChange = jest.fn<never, [RuleGroupType]>();
    const onAddGroup = jest.fn(() => false as const);
    render(
      <QueryBuilder onAddGroup={onAddGroup} onQueryChange={onQueryChange} debugMode onLog={onLog} />
    );
    expect(onQueryChange).toHaveBeenCalledTimes(1);

    await user.click(screen.getByTestId(TestID.addGroup));
    expect(onAddGroup).toHaveBeenCalled();
    expect(onQueryChange).toHaveBeenCalledTimes(1);
    expect(onLog).toHaveBeenLastCalledWith(
      expect.objectContaining({
        ruleGroup: expect.anything(),
        parentPath: expect.any(Array),
        query: expect.anything(),
      })
    );
  });

  it('modifies the group addition', async () => {
    const onQueryChange = jest.fn<never, [RuleGroupType]>();
    const group: RuleGroupType = { combinator: 'fake', rules: [] };
    render(<QueryBuilder onAddGroup={() => group} onQueryChange={onQueryChange} />);

    await user.click(screen.getByTestId(TestID.addGroup));
    expect(onQueryChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        combinator: 'and',
        rules: [expect.objectContaining({ combinator: 'fake', rules: [] })],
      })
    );
  });

  it('specifies the preceding combinator', async () => {
    const onQueryChange = jest.fn<never, [RuleGroupTypeIC]>();
    const group: RuleGroupTypeIC = { rules: [], combinatorPreceding: 'or' };
    render(
      <QueryBuilder
        onAddGroup={() => group}
        onQueryChange={onQueryChange}
        defaultQuery={{ rules: [{ field: 'f1', operator: '=', value: 'v1' }] }}
      />
    );

    await user.click(screen.getByTestId(TestID.addGroup));
    expect(onQueryChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ rules: expect.arrayContaining([expect.anything(), 'or']) })
    );
    expect(screen.getByTestId(TestID.combinators)).toHaveValue('or');
  });

  it('passes handleOnClick context to onAddGroup', async () => {
    const onQueryChange = jest.fn<never, [RuleGroupType]>();
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
    expect(onQueryChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        combinator: 'and',
        rules: [expect.objectContaining({ combinator: 'fake', rules: [] })],
      })
    );
  });
});

describe('onRemove prop', () => {
  it('cancels the removal', async () => {
    const onQueryChange = jest.fn<never, [RuleGroupType]>();
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
    const onQueryChange = jest.fn<never, [RuleGroupType]>();
    render(<QueryBuilder fields={fields} onQueryChange={onQueryChange} />);

    await user.click(screen.getByTestId(TestID.addRule));
    expect(onQueryChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ rules: [expect.objectContaining({ value: 'Test Value 1' })] })
    );
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
    const onQueryChange = jest.fn<never, [RuleGroupType]>();
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
    const onQueryChange = jest.fn<never, [RuleGroupType]>();
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
    const onQueryChange = jest.fn<never, [RuleGroupType]>();
    const { container } = render(
      <QueryBuilder fields={fields} onQueryChange={onQueryChange} addRuleToNewGroups />
    );

    expect(container.querySelector('input[type="number"]')).toBeDefined();
  });
});

describe('valueEditorType property in field', () => {
  it('sets the value editor type', async () => {
    const fields: Field[] = [{ name: 'field1', label: 'Field 1', valueEditorType: 'select' }];
    const onQueryChange = jest.fn<never, [RuleGroupType]>();
    const { container } = render(
      <QueryBuilder fields={fields} onQueryChange={onQueryChange} addRuleToNewGroups />
    );

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
    const onQueryChange = jest.fn<never, [RuleGroupType]>();
    const { container } = render(
      <QueryBuilder fields={fields} onQueryChange={onQueryChange} addRuleToNewGroups />
    );

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

describe('valueEditorType "multiselect" default values', () => {
  const fields: Field[] = [
    {
      name: 'field1',
      label: 'Field 1',
      valueEditorType: 'multiselect',
      values: [
        { name: 'test1', label: 'Test1' },
        { name: 'test2', label: 'Test2' },
      ],
    },
  ];

  it('does not unnecessarily select a value - string values', async () => {
    const onQueryChange = jest.fn<never, [RuleGroupType]>();
    render(<QueryBuilder fields={fields} addRuleToNewGroups onQueryChange={onQueryChange} />);
    expect(onQueryChange).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.any(String),
        combinator: 'and',
        not: false,
        rules: [
          {
            id: expect.any(String),
            field: 'field1',
            operator: '=',
            value: '',
            valueSource: 'value',
          },
        ],
      })
    );
  });

  it('does not unnecessarily select a value - lists as arrays', async () => {
    const onQueryChange = jest.fn<never, [RuleGroupType]>();
    render(
      <QueryBuilder
        fields={fields}
        addRuleToNewGroups
        onQueryChange={onQueryChange}
        listsAsArrays
      />
    );
    expect(onQueryChange).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.any(String),
        combinator: 'and',
        not: false,
        rules: [
          {
            id: expect.any(String),
            field: 'field1',
            operator: '=',
            value: [],
            valueSource: 'value',
          },
        ],
      })
    );
  });
});

describe('addRuleToNewGroups', () => {
  const query: RuleGroupType = { combinator: 'and', rules: [] };

  it('does not add a rule when the component is created', () => {
    render(<QueryBuilder query={query} addRuleToNewGroups />);
    expect(screen.queryByTestId(TestID.rule)).toBeNull();
  });

  it('adds a rule when a new group is created', async () => {
    const onQueryChange = jest.fn<never, [RuleGroupType]>();
    render(<QueryBuilder query={query} onQueryChange={onQueryChange} addRuleToNewGroups />);

    await user.click(screen.getByTestId(TestID.addGroup));
    expect(onQueryChange).toHaveBeenCalledTimes(2);
    expect(onQueryChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        rules: [
          expect.objectContaining({
            rules: [expect.objectContaining({ field: defaultPlaceholderFieldName })],
          }),
        ],
      })
    );
  });

  it('adds a rule when mounted if no initial query is provided', () => {
    render(<QueryBuilder addRuleToNewGroups />);
    expect(screen.getByTestId(TestID.rule)).toBeDefined();
  });
});

describe('showShiftActions', () => {
  it('is disabled if rule is locked', async () => {
    const onQueryChange = jest.fn<never, [RuleGroupType]>();
    render(
      <QueryBuilder
        showShiftActions
        onQueryChange={onQueryChange}
        defaultQuery={{
          combinator: 'and',
          rules: [
            {
              combinator: 'and',
              rules: [
                { field: 'firstName', operator: '=', value: 'Steve' },
                { field: 'lastName', operator: '=', value: 'Vai' },
              ],
              disabled: true,
            },
          ],
        }}
      />
    );
    const shiftRuleButtons = screen
      .getAllByTestId(TestID.ruleGroup)[1]
      .querySelectorAll(`.${sc.shiftActions}>button`);
    for (const b of Array.from(shiftRuleButtons)) {
      expect(b).toBeDisabled();
    }
  });

  describe('standard rule groups', () => {
    it('shifts rules', async () => {
      const onQueryChange = jest.fn<never, [RuleGroupType]>();
      render(
        <QueryBuilder
          showShiftActions
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
      expect(screen.getAllByText(t.shiftActionUp.label)[0]).toBeDisabled();
      expect(screen.getAllByText(t.shiftActionDown.label).at(-1)).toBeDisabled();

      await user.click(screen.getAllByText(t.shiftActionDown.label)[0]);
      expect(onQueryChange).toHaveBeenCalledTimes(2);
      expect(onQueryChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          combinator: 'and',
          rules: [
            expect.objectContaining({ field: 'lastName', operator: '=', value: 'Vai' }),
            expect.objectContaining({ field: 'firstName', operator: '=', value: 'Steve' }),
          ],
        })
      );
    });

    it('clones rules', async () => {
      const onQueryChange = jest.fn<never, [RuleGroupType]>();
      render(
        <QueryBuilder
          showShiftActions
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
      expect(screen.getAllByText(t.shiftActionUp.label)[0]).toBeDisabled();
      expect(screen.getAllByText(t.shiftActionDown.label).at(-1)).toBeDisabled();

      await user.keyboard('{Alt>}');
      await user.click(screen.getAllByText(t.shiftActionDown.label)[0]);
      await user.keyboard('{/Alt}');
      expect(onQueryChange).toHaveBeenCalledTimes(2);
      expect(onQueryChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          combinator: 'and',
          rules: [
            expect.objectContaining({ field: 'firstName', operator: '=', value: 'Steve' }),
            expect.objectContaining({ field: 'lastName', operator: '=', value: 'Vai' }),
            expect.objectContaining({ field: 'firstName', operator: '=', value: 'Steve' }),
          ],
        })
      );
    });

    it('shifts rule groups', async () => {
      const onQueryChange = jest.fn<never, [RuleGroupType]>();
      render(
        <QueryBuilder
          showShiftActions
          onQueryChange={onQueryChange}
          defaultQuery={{
            combinator: 'and',
            rules: [
              { field: 'lastName', operator: '=', value: 'Vai' },
              {
                combinator: 'or',
                rules: [{ field: 'firstName', operator: '=', value: 'Steve' }],
              },
            ],
          }}
        />
      );

      await user.click(screen.getAllByText(t.shiftActionUp.label)[1]);
      expect(onQueryChange).toHaveBeenCalledTimes(2);
      expect(onQueryChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          combinator: 'and',
          rules: [
            expect.objectContaining({
              combinator: 'or',
              rules: [
                expect.objectContaining({ field: 'firstName', operator: '=', value: 'Steve' }),
              ],
            }),
            expect.objectContaining({ field: 'lastName', operator: '=', value: 'Vai' }),
          ],
        })
      );
    });
  });

  describe('independent combinators', () => {
    it('shifts rules with independent combinators', async () => {
      const onQueryChange = jest.fn<never, [RuleGroupTypeIC]>();
      render(
        <QueryBuilder
          showShiftActions
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
      expect(screen.getAllByText(t.shiftActionUp.label)[0]).toBeDisabled();
      expect(screen.getAllByText(t.shiftActionDown.label).at(-1)).toBeDisabled();

      await user.click(screen.getAllByText(t.shiftActionDown.label)[0]);
      expect(onQueryChange).toHaveBeenCalledTimes(2);
      expect(onQueryChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          rules: [
            expect.objectContaining({ field: 'lastName', operator: '=', value: 'Vai' }),
            'and',
            expect.objectContaining({ field: 'firstName', operator: '=', value: 'Steve' }),
          ],
        })
      );
    });

    it('clones rules with independent combinators', async () => {
      const onQueryChange = jest.fn<never, [RuleGroupTypeIC]>();
      render(
        <QueryBuilder
          showShiftActions
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
      expect(screen.getAllByText(t.shiftActionUp.label)[0]).toBeDisabled();
      expect(screen.getAllByText(t.shiftActionDown.label).at(-1)).toBeDisabled();

      await user.keyboard('{Alt>}');
      await user.click(screen.getAllByText(t.shiftActionDown.label)[0]);
      await user.keyboard('{/Alt}');
      expect(onQueryChange).toHaveBeenCalledTimes(2);
      expect(onQueryChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          rules: [
            expect.objectContaining({ field: 'firstName', operator: '=', value: 'Steve' }),
            'and',
            expect.objectContaining({ field: 'lastName', operator: '=', value: 'Vai' }),
            'and',
            expect.objectContaining({ field: 'firstName', operator: '=', value: 'Steve' }),
          ],
        })
      );
    });

    it('shifts first rule with independent combinators', async () => {
      const onQueryChange = jest.fn<never, [RuleGroupTypeIC]>();
      render(
        <QueryBuilder
          showShiftActions
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

      await user.click(screen.getAllByText(t.shiftActionUp.label)[1]);
      expect(onQueryChange).toHaveBeenCalledTimes(2);
      expect(onQueryChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          rules: [
            expect.objectContaining({ field: 'lastName', operator: '=', value: 'Vai' }),
            'and',
            expect.objectContaining({ field: 'firstName', operator: '=', value: 'Steve' }),
          ],
        })
      );
    });
  });
});

describe('showCloneButtons', () => {
  describe('standard rule groups', () => {
    it('clones rules', async () => {
      const onQueryChange = jest.fn<never, [RuleGroupType]>();
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
      expect(onQueryChange).toHaveBeenCalledTimes(2);
      expect(onQueryChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          combinator: 'and',
          rules: [
            expect.objectContaining({ field: 'firstName', operator: '=', value: 'Steve' }),
            expect.objectContaining({ field: 'firstName', operator: '=', value: 'Steve' }),
            expect.objectContaining({ field: 'lastName', operator: '=', value: 'Vai' }),
          ],
        })
      );
    });

    it('clones rule groups', async () => {
      const onQueryChange = jest.fn<never, [RuleGroupType]>();
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
      expect(onQueryChange).toHaveBeenCalledTimes(2);
      expect(onQueryChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          combinator: 'and',
          rules: [
            expect.objectContaining({
              combinator: 'or',
              rules: [
                expect.objectContaining({ field: 'firstName', operator: '=', value: 'Steve' }),
              ],
            }),
            expect.objectContaining({
              combinator: 'or',
              rules: [
                expect.objectContaining({ field: 'firstName', operator: '=', value: 'Steve' }),
              ],
            }),
            expect.objectContaining({ field: 'lastName', operator: '=', value: 'Vai' }),
          ],
        })
      );
    });
  });

  describe('independent combinators', () => {
    it('clones a single rule with independent combinators', async () => {
      const onQueryChange = jest.fn<never, [RuleGroupTypeIC]>();
      render(
        <QueryBuilder
          showCloneButtons
          onQueryChange={onQueryChange}
          defaultQuery={{
            rules: [{ field: 'firstName', operator: '=', value: 'Steve' }],
          }}
        />
      );

      await user.click(screen.getByText(t.cloneRule.label));
      expect(onQueryChange).toHaveBeenCalledTimes(2);
      expect(onQueryChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          rules: [
            expect.objectContaining({ field: 'firstName', operator: '=', value: 'Steve' }),
            'and',
            expect.objectContaining({ field: 'firstName', operator: '=', value: 'Steve' }),
          ],
        })
      );
    });

    it('clones first rule with independent combinators', async () => {
      const onQueryChange = jest.fn<never, [RuleGroupTypeIC]>();
      render(
        <QueryBuilder
          showCloneButtons
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
      expect(onQueryChange).toHaveBeenCalledTimes(2);
      expect(onQueryChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          rules: [
            expect.objectContaining({ field: 'firstName', operator: '=', value: 'Steve' }),
            'and',
            expect.objectContaining({ field: 'firstName', operator: '=', value: 'Steve' }),
            'and',
            expect.objectContaining({ field: 'lastName', operator: '=', value: 'Vai' }),
          ],
        })
      );
    });

    it('clones last rule with independent combinators', async () => {
      const onQueryChange = jest.fn<never, [RuleGroupTypeIC]>();
      render(
        <QueryBuilder
          showCloneButtons
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
      expect(onQueryChange).toHaveBeenCalledTimes(2);
      expect(onQueryChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          rules: [
            expect.objectContaining({ field: 'firstName', operator: '=', value: 'Steve' }),
            'or',
            expect.objectContaining({ field: 'lastName', operator: '=', value: 'Vai' }),
            'or',
            expect.objectContaining({ field: 'lastName', operator: '=', value: 'Vai' }),
          ],
        })
      );
    });
  });
});

describe('idGenerator', () => {
  it('uses custom id generator', async () => {
    const onQueryChange = jest.fn<never, [RuleGroupType]>();
    const rule = (props: RuleProps) => (
      <div>
        <button type="button" onClick={() => props.actions.moveRule(props.path, [0], true)}>
          clone
        </button>
      </div>
    );
    render(
      <QueryBuilder
        idGenerator={() => `${Math.random()}`}
        onQueryChange={onQueryChange}
        controlElements={{ rule }}
      />
    );
    expect(onQueryChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: expect.stringMatching(numericRegex) })
    );

    await user.click(screen.getByTestId(TestID.addRule));
    expect(onQueryChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        rules: [expect.objectContaining({ id: expect.stringMatching(numericRegex) })],
      })
    );

    await user.click(screen.getByTestId(TestID.addGroup));
    expect(onQueryChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        rules: [
          expect.objectContaining({ id: expect.stringMatching(numericRegex) }),
          expect.objectContaining({ id: expect.stringMatching(numericRegex) }),
        ],
      })
    );

    await user.click(screen.getByText('clone'));
    expect(onQueryChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        rules: [
          expect.objectContaining({ id: expect.stringMatching(numericRegex) }),
          expect.objectContaining({ id: expect.stringMatching(numericRegex) }),
        ],
      })
    );
  });
});

describe('independent combinators', () => {
  it('renders a rule group with independent combinators', () => {
    const onQueryChange = jest.fn<never, [RuleGroupTypeIC]>();
    render(<QueryBuilder defaultQuery={{ rules: [] }} onQueryChange={onQueryChange} />);
    expect(screen.getByTestId(TestID.ruleGroup)).toBeDefined();
    expect(onQueryChange).toHaveBeenLastCalledWith(
      expect.not.objectContaining({ combinator: expect.anything() })
    );
  });

  it('renders a rule group with addRuleToNewGroups', async () => {
    render(<QueryBuilder addRuleToNewGroups defaultQuery={{ rules: [] }} />);

    await user.click(screen.getByTestId(TestID.addGroup));
    expect(screen.getByTestId(TestID.rule)).toBeDefined();
  });

  it('calls onQueryChange with query', () => {
    const onQueryChange = jest.fn<never, [RuleGroupTypeIC]>();
    const dq: RuleGroupTypeIC = { id: 'id', rules: [], not: false };
    render(<QueryBuilder onQueryChange={onQueryChange} defaultQuery={dq} />);
    expect(onQueryChange).toHaveBeenCalledTimes(1);
    expect(onQueryChange).toHaveBeenLastCalledWith(dq);
  });

  it('adds rules with independent combinators', async () => {
    // render(<QueryBuilder defaultQuery={{ rules: [] }} />);
    render(<QueryBuilder defaultQuery={{ rules: [] }} />);
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

  it('adds groups with independent combinators', async () => {
    render(<QueryBuilder defaultQuery={{ rules: [] }} />);
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

  it('removes rules along with independent combinators', async () => {
    const onQueryChange = jest.fn<never, [RuleGroupTypeIC]>();
    const query: RuleGroupTypeIC = {
      rules: [
        { field: 'firstName', operator: '=', value: '1' },
        'and',
        { field: 'firstName', operator: '=', value: '2' },
        'or',
        { field: 'firstName', operator: '=', value: '3' },
      ],
    };
    const { rerender } = render(<QueryBuilder query={query} onQueryChange={onQueryChange} />);
    expect(screen.getAllByTestId(TestID.rule)).toHaveLength(3);
    expect(screen.getAllByTestId(TestID.combinators)).toHaveLength(2);

    await user.click(screen.getAllByTestId(TestID.removeRule)[1]);
    expect(onQueryChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        rules: [
          { field: 'firstName', operator: '=', value: '1' },
          'or',
          { field: 'firstName', operator: '=', value: '3' },
        ],
      })
    );

    rerender(
      <QueryBuilder query={onQueryChange.mock.lastCall?.[0]} onQueryChange={onQueryChange} />
    );

    await user.click(screen.getAllByTestId(TestID.removeRule)[0]);
    expect(onQueryChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        rules: expect.arrayContaining([expect.objectContaining({ value: '3' })]),
      })
    );
  });

  it('removes groups along with independent combinators', async () => {
    const onQueryChange = jest.fn<never, [RuleGroupTypeIC]>();
    const query: RuleGroupTypeIC = {
      rules: [{ rules: [] }, 'and', { rules: [] }, 'or', { rules: [] }],
    };
    const { rerender } = render(<QueryBuilder query={query} onQueryChange={onQueryChange} />);

    expect(screen.getAllByTestId(TestID.ruleGroup)).toHaveLength(4);
    expect(screen.getAllByTestId(TestID.combinators)).toHaveLength(2);
    expect(onQueryChange).toHaveBeenCalledTimes(1);

    await user.click(screen.getAllByTestId(TestID.removeGroup)[1]);
    expect(onQueryChange).toHaveBeenCalledTimes(2);
    expect(onQueryChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        rules: [
          expect.objectContaining({ rules: [] }),
          'or',
          expect.objectContaining({ rules: [] }),
        ],
      })
    );

    rerender(
      <QueryBuilder query={onQueryChange.mock.lastCall?.[0]} onQueryChange={onQueryChange} />
    );

    await user.click(screen.getAllByTestId(TestID.removeGroup)[0]);
    expect(onQueryChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ rules: [expect.objectContaining({ rules: [] })] })
    );
  });
});

describe('validation', () => {
  it('does not validate if no validator function is provided', () => {
    render(<QueryBuilder />);
    expect(screen.getByRole('form')).not.toHaveClass(sc.valid);
    expect(screen.getByRole('form')).not.toHaveClass(sc.invalid);
  });

  it('validates groups if default validator function is provided', async () => {
    const { container } = render(<QueryBuilder validator={defaultValidator} />);

    await user.click(screen.getByTestId(TestID.addGroup));
    // Expect the root group to be valid (contains the inner group)
    expect(container.querySelectorAll(`.${sc.ruleGroup}.${sc.valid}`)).toHaveLength(1);
    // Expect the inner group to be invalid (empty)
    expect(container.querySelectorAll(`.${sc.ruleGroup}.${sc.invalid}`)).toHaveLength(1);
  });

  it('uses custom validator function returning false', () => {
    const validator = jest.fn(() => false);
    render(<QueryBuilder validator={validator} />);
    expect(validator).toHaveBeenCalled();
    expect(screen.getByRole('form')).not.toHaveClass(sc.valid);
    expect(screen.getByRole('form')).toHaveClass(sc.invalid);
  });

  it('uses custom validator function returning true', () => {
    const validator = jest.fn(() => true);
    render(<QueryBuilder validator={validator} />);
    expect(validator).toHaveBeenCalled();
    expect(screen.getByRole('form')).toHaveClass(sc.valid);
    expect(screen.getByRole('form')).not.toHaveClass(sc.invalid);
  });

  it('passes down validationMap to children', () => {
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
  it('has the correct classname', () => {
    const { container } = render(<QueryBuilder disabled />);
    expect(container.querySelectorAll('div')[0]).toHaveClass(sc.disabled);
  });

  it('has the correct classname when disabled prop is false but root group is disabled', () => {
    const { container } = render(
      <QueryBuilder query={{ disabled: true, combinator: 'and', rules: [] }} />
    );
    expect(container.querySelectorAll('div')[0]).not.toHaveClass(sc.disabled);
  });

  it('prevents changes when disabled', async () => {
    const onQueryChange = jest.fn<never, [RuleGroupTypeIC]>();
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
    const onQueryChange = jest.fn<never, [RuleGroupTypeIC]>();
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
    for (const b of Array.from(rg.querySelectorAll('button'))) {
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
    const onQueryChange = jest.fn<never, [RuleGroupTypeIC]>();
    render(
      <QueryBuilder
        fields={[
          { name: 'field0', label: 'Field 0' },
          { name: 'field1', label: 'Field 1' },
        ]}
        enableMountQueryChange={false}
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
    for (const b of Array.from(rg.querySelectorAll('button'))) {
      await user.click(b);
    }
    expect(onQueryChange).not.toHaveBeenCalled();
  });

  it('does not update the query when an ancestor group is disabled', async () => {
    const onQueryChange = jest.fn<never, [RuleGroupTypeIC]>();
    render(
      <QueryBuilder
        fields={[
          { name: 'field0', label: 'Field 0' },
          { name: 'field1', label: 'Field 1' },
        ]}
        enableMountQueryChange={false}
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
    for (const b of Array.from(rg.querySelectorAll('button'))) {
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
    const onQueryChange = jest.fn<never, [RuleGroupType]>();
    render(
      <QueryBuilder fields={fieldsWithBetween} getDefaultField="fb" onQueryChange={onQueryChange} />
    );

    await user.click(screen.getByTestId(TestID.addRule));
    expect(screen.getAllByDisplayValue(fields.filter(f => f.name !== 'fb')[0].label)).toHaveLength(
      2
    );
    expect(onQueryChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ rules: [expect.objectContaining({ value: 'f1,f1' })] })
    );
  });

  it('sets the right default value for "between" operator and listsAsArrays', async () => {
    const onQueryChange = jest.fn<never, [RuleGroupType]>();
    render(
      <QueryBuilder
        fields={fieldsWithBetween}
        getDefaultField="fb"
        onQueryChange={onQueryChange}
        listsAsArrays
      />
    );

    await user.click(screen.getByTestId(TestID.addRule));
    expect(onQueryChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ rules: [expect.objectContaining({ value: ['f1', 'f1'] })] })
    );
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

describe('dynamic classNames', () => {
  it('has correct group-based classNames', () => {
    render(
      <QueryBuilder
        fields={[{ name: 'f1', label: 'F1', className: 'custom-fieldBased-class' }]}
        combinators={[{ name: 'or', label: 'OR', className: 'custom-combinatorBased-class' }]}
        operators={[{ name: 'op', label: 'Op', className: 'custom-operatorBased-class' }]}
        getRuleClassname={() => 'custom-ruleBased-class'}
        getRuleGroupClassname={() => 'custom-groupBased-class'}
        query={{ combinator: 'or', rules: [{ field: 'f1', operator: 'op', value: 'v1' }] }}
      />
    );
    expect(screen.getByTestId(TestID.ruleGroup)).toHaveClass(
      'custom-groupBased-class',
      'custom-combinatorBased-class'
    );
    expect(screen.getByTestId(TestID.rule)).toHaveClass(
      'custom-ruleBased-class',
      'custom-fieldBased-class',
      'custom-operatorBased-class'
    );
  });
});

describe('redux functions', () => {
  it('gets the query from the store', async () => {
    const onQueryChange = jest.fn<never, [RuleGroupType]>();
    const testFunc = jest.fn();
    const getQueryBtnText = 'Get Query';
    const dispatchQueryBtnText = 'Dispatch Query';
    const rule = ({ schema: { getQuery, dispatchQuery } }: RuleProps) => (
      <>
        <button onClick={() => testFunc(getQuery())}>{getQueryBtnText}</button>
        <button onClick={() => dispatchQuery({ combinator: 'or', rules: [] })}>
          {' '}
          {dispatchQueryBtnText}{' '}
        </button>
      </>
    );
    render(<QueryBuilder onQueryChange={onQueryChange} controlElements={{ rule }} />);

    await user.click(screen.getByTestId(TestID.addRule));
    await user.click(screen.getByText(getQueryBtnText));
    expect(testFunc.mock.lastCall?.[0]).toMatchObject({
      combinator: 'and',
      not: false,
      rules: [
        {
          field: '~',
          operator: '=',
          value: '',
          valueSource: 'value',
        },
      ],
    });

    await user.click(screen.getByText(dispatchQueryBtnText));
    expect(onQueryChange.mock.lastCall?.[0]).toMatchObject({ combinator: 'or', rules: [] });
  });

  it('updates the store when an entirely new query prop is provided', async () => {
    const emptyQuery: RuleGroupType = { combinator: 'and', rules: [] };
    const QBApp = ({ query }: { query: RuleGroupType }) => {
      const [q, sq] = React.useState(query);

      return (
        <>
          <button type="button" onClick={() => sq(emptyQuery)}>
            Reset
          </button>
          <QueryBuilder query={q} onQueryChange={sq} enableMountQueryChange={false} />
        </>
      );
    };

    render(<QBApp query={emptyQuery} />);

    await user.click(screen.getByTestId(TestID.addRule));
    await user.click(screen.getByTestId(TestID.addRule));
    expect(screen.queryAllByTestId(TestID.rule)).toHaveLength(2);

    await user.click(screen.getByText('Reset'));
    expect(screen.queryAllByTestId(TestID.rule)).toHaveLength(0);

    await user.click(screen.getByTestId(TestID.addRule));
    expect(screen.queryAllByTestId(TestID.rule)).toHaveLength(1);
  });
});

describe('nested object immutability', () => {
  it('does not modify rules it does not have to modify', async () => {
    const onQueryChange = jest.fn<never, [RuleGroupType]>();
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
    const props: QueryBuilderProps<typeof defaultQuery, FullField, FullOperator, FullCombinator> = {
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

describe('controlElements bulk override properties', () => {
  const actionElement = (props: ActionProps) => (
    <button data-testid={props.testID}>{'actionElement'}</button>
  );
  const valueSelector = (props: ValueSelectorProps) => (
    <select data-testid={props.testID} value="v1">
      <option value="v1">v1</option>
    </select>
  );

  it('works from props', () => {
    render(
      <QueryBuilder
        showCloneButtons
        showLockButtons
        controlElements={{ actionElement, valueSelector }}
        query={{
          combinator: 'and',
          rules: [{ combinator: 'or', rules: [{ field: 'f1', operator: '=', value: 'not "v1"' }] }],
        }}
      />
    );
    expect(screen.getAllByTestId(TestID.addGroup)[0]).toHaveTextContent('actionElement');
    expect(screen.getAllByTestId(TestID.addRule)[0]).toHaveTextContent('actionElement');
    expect(screen.getAllByTestId(TestID.removeGroup)[0]).toHaveTextContent('actionElement');
    expect(screen.getAllByTestId(TestID.removeRule)[0]).toHaveTextContent('actionElement');
    expect(screen.getAllByTestId(TestID.cloneGroup)[0]).toHaveTextContent('actionElement');
    expect(screen.getAllByTestId(TestID.cloneRule)[0]).toHaveTextContent('actionElement');
    expect(screen.getAllByTestId(TestID.lockGroup)[0]).toHaveTextContent('actionElement');
    expect(screen.getAllByTestId(TestID.lockRule)[0]).toHaveTextContent('actionElement');
    expect(screen.getAllByTestId(TestID.combinators)[0]).toHaveValue('v1');
    expect(screen.getAllByTestId(TestID.fields)[0]).toHaveValue('v1');
    expect(screen.getAllByTestId(TestID.operators)[0]).toHaveValue('v1');
  });

  it('works from context', () => {
    render(
      <QueryBuilderContext.Provider value={{ controlElements: { actionElement, valueSelector } }}>
        <QueryBuilder
          showCloneButtons
          showLockButtons
          query={{
            combinator: 'and',
            rules: [{ combinator: 'or', rules: [{ field: 'f1', operator: '=', value: 'v1' }] }],
          }}
        />
      </QueryBuilderContext.Provider>
    );
    expect(screen.getAllByTestId(TestID.addGroup)[0]).toHaveTextContent('actionElement');
    expect(screen.getAllByTestId(TestID.addRule)[0]).toHaveTextContent('actionElement');
    expect(screen.getAllByTestId(TestID.removeGroup)[0]).toHaveTextContent('actionElement');
    expect(screen.getAllByTestId(TestID.removeRule)[0]).toHaveTextContent('actionElement');
    expect(screen.getAllByTestId(TestID.cloneGroup)[0]).toHaveTextContent('actionElement');
    expect(screen.getAllByTestId(TestID.cloneRule)[0]).toHaveTextContent('actionElement');
    expect(screen.getAllByTestId(TestID.lockGroup)[0]).toHaveTextContent('actionElement');
    expect(screen.getAllByTestId(TestID.lockRule)[0]).toHaveTextContent('actionElement');
    expect(screen.getAllByTestId(TestID.combinators)[0]).toHaveValue('v1');
    expect(screen.getAllByTestId(TestID.fields)[0]).toHaveValue('v1');
    expect(screen.getAllByTestId(TestID.operators)[0]).toHaveValue('v1');
  });
});

describe('debug mode', () => {
  it('logs updates', async () => {
    const onLog = jest.fn();
    const fields: Field[] = [
      { name: 'f1', label: 'Field 1' },
      { name: 'f2', label: 'Field 2' },
    ];
    const defaultQuery: RuleGroupType = { combinator: 'and', rules: [] };
    const RuleGroupOG = defaultControlElements.ruleGroup;
    render(
      <QueryBuilder
        debugMode
        fields={fields}
        defaultQuery={defaultQuery}
        onLog={onLog}
        controlElements={{
          ruleGroup: props => (
            <div>
              <button onClick={() => props.actions.moveRule([1], [0])}>moveRule</button>
              <RuleGroupOG {...props} />
            </div>
          ),
        }}
      />
    );

    await user.click(screen.getByTestId(TestID.addRule));
    expect(onLog).toHaveBeenLastCalledWith(expect.objectContaining({ type: LogType.add }));

    await user.selectOptions(screen.getByTestId(TestID.operators), '>');
    expect(onLog).toHaveBeenLastCalledWith(expect.objectContaining({ type: LogType.update }));

    await user.click(screen.getByTestId(TestID.addRule));
    expect(onLog).toHaveBeenLastCalledWith(expect.objectContaining({ type: LogType.add }));

    await user.click(screen.getByText('moveRule'));
    expect(onLog).toHaveBeenLastCalledWith(expect.objectContaining({ type: LogType.move }));

    await user.click(screen.getAllByTestId(TestID.removeRule)[0]);
    expect(onLog).toHaveBeenLastCalledWith(expect.objectContaining({ type: LogType.remove }));

    await user.click(screen.getByTestId(TestID.addGroup));
    expect(onLog).toHaveBeenLastCalledWith(expect.objectContaining({ type: LogType.add }));

    await user.click(screen.getByTestId(TestID.removeGroup));
    expect(onLog).toHaveBeenLastCalledWith(expect.objectContaining({ type: LogType.remove }));
  });

  it('logs failed additions and removals due to onAdd/Remove handlers', async () => {
    const onLog = jest.fn();
    const f = () => false as const;
    const defaultQuery: RuleGroupType = {
      combinator: 'and',
      rules: [{ field: 'f1', operator: '=', value: 'v1' }],
    };
    render(
      <QueryBuilder
        debugMode
        query={defaultQuery}
        onLog={onLog}
        onRemove={f}
        onAddGroup={f}
        onAddRule={f}
      />
    );

    await user.click(screen.getByTestId(TestID.addRule));
    expect(onLog).toHaveBeenLastCalledWith(
      expect.objectContaining({ type: LogType.onAddRuleFalse })
    );

    await user.click(screen.getByTestId(TestID.addGroup));
    expect(onLog).toHaveBeenLastCalledWith(
      expect.objectContaining({ type: LogType.onAddGroupFalse })
    );

    await user.click(screen.getByTestId(TestID.removeRule));
    expect(onLog).toHaveBeenLastCalledWith(
      expect.objectContaining({ type: LogType.onRemoveFalse })
    );
  });

  it('logs failed query updates due to disabled prop', async () => {
    const onLog = jest.fn();
    const defaultQuery: RuleGroupType = {
      disabled: true,
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
    expect(onLog).toHaveBeenCalledTimes(5);
  });
});

describe('controlled/uncontrolled warnings', () => {
  it('tracks changes from controlled to uncontrolled and vice versa', () => {
    const getQuery = (): RuleGroupType => ({
      combinator: generateID(),
      rules: [],
    });
    const { rerender } = render(<QueryBuilder enableMountQueryChange={false} />);
    expect(consoleError).not.toHaveBeenCalled();
    rerender(<QueryBuilder query={getQuery()} />);
    expect(consoleError).toHaveBeenLastCalledWith(messages.errorUncontrolledToControlled);
    rerender(<QueryBuilder defaultQuery={getQuery()} query={getQuery()} />);
    expect(consoleError).toHaveBeenLastCalledWith(messages.errorBothQueryDefaultQuery);
    rerender(<QueryBuilder defaultQuery={getQuery()} />);
    expect(consoleError).toHaveBeenLastCalledWith(messages.errorControlledToUncontrolled);
  });
});
