import type {
  DefaultOperatorName,
  Field,
  FieldByValue,
  FullCombinator,
  FullField,
  FullOperator,
  FullOption,
  Option,
  OptionGroup,
  ParseNumbersPropConfig,
  RuleGroupType,
  RuleGroupTypeIC,
  RuleType,
  ValidationMap,
} from '@react-querybuilder/core';
import {
  LogType,
  TestID,
  defaultPlaceholderFieldLabel,
  defaultPlaceholderFieldName,
  defaultPlaceholderOperatorName,
  defaultValidator,
  findPath,
  generateID,
  getOption,
  group,
  move,
  numericRegex,
  standardClassnames as sc,
  defaultTranslations as t,
  toFullOption,
} from '@react-querybuilder/core';
import { consoleMocks } from '@rqb-testing';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { QueryBuilderContext } from '../context';
import { defaultControlElements } from '../defaults';
import { messages } from '../messages';
import { getQuerySelectorById, useQueryBuilderQuery, useQueryBuilderSelector } from '../redux';
import type {
  ActionProps,
  ControlElementsProp,
  FieldSelectorProps,
  QueryBuilderProps,
  RuleGroupProps,
  RuleProps,
  ValueEditorProps,
  ValueSelectorProps,
} from '../types';
import { ActionElement } from './ActionElement';
import { QueryBuilder } from './QueryBuilder';
import type { UseRuleGroup } from './RuleGroup';
import { RuleGroupHeaderComponents } from './RuleGroup';
import { waitABeat } from './testUtils';
import { ValueEditor, useValueEditor } from './ValueEditor';
import { ValueSelector } from './ValueSelector';

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

  it('respects suppressStandardClassnames', () => {
    const { container } = render(
      <QueryBuilder
        suppressStandardClassnames
        showCombinatorsBetweenRules
        showCloneButtons
        showLockButtons
        showNotToggle
        showShiftActions
        fields={[
          { name: 'f1', label: 'Field 1' },
          { name: 'f2', label: 'Field 2', valueSources: ['field', 'value'] },
          { name: 'f3', label: 'Field 3' },
        ]}
        defaultQuery={{
          combinator: 'and',
          rules: [
            { field: 'f1', operator: '=', value: 'v1' },
            { field: 'f2', operator: '=', value: 'f1', valueSource: 'field' },
            { field: 'f3', operator: 'between', value: 'v3,v4' },
            { combinator: 'and', rules: [] },
          ],
        }}
      />
    );

    for (const c of Object.values(sc)) {
      expect(container.querySelectorAll(`.${c}`)).toHaveLength(0);
    }
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
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({ id: expect.any(String) });
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
    const query: RuleGroupType = { combinator: 'and', rules: [], not: false };
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
      [...screen.getByTestId(TestID.fields).querySelectorAll('option')].map(opt => opt.value)
    ).toEqual(['xyz', 'abc']);
    expect(screen.getByText('One')).toBeInTheDocument();
    expect(screen.getByText('Two')).toBeInTheDocument();
    expect([...screen.getByTestId(TestID.fields).querySelectorAll('option')][0]).toHaveTextContent(
      'One'
    );
    expect([...screen.getByTestId(TestID.fields).querySelectorAll('option')][1]).toHaveTextContent(
      'Two'
    );
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
      [...screen.getByTestId(TestID.fields).querySelectorAll('option')].map(opt => opt.value)
    ).toEqual([defaultPlaceholderFieldName, 'xyz', 'abc']);
    expect(screen.getByText('One')).toBeInTheDocument();
    expect(screen.getByText('Two')).toBeInTheDocument();
    expect([...screen.getByTestId(TestID.fields).querySelectorAll('option')][0]).toHaveTextContent(
      defaultPlaceholderFieldLabel
    );
    expect([...screen.getByTestId(TestID.fields).querySelectorAll('option')][1]).toHaveTextContent(
      'One'
    );
    expect([...screen.getByTestId(TestID.fields).querySelectorAll('option')][2]).toHaveTextContent(
      'Two'
    );
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
    rules: [{ field: 'firstName', value: 'Test', operator: '=' }],
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

describe('when base properties are provided', () => {
  it('includes base properties', async () => {
    const fieldSelectorReporter = jest.fn();
    const operatorSelectorReporter = jest.fn();
    const combinatorSelectorReporter = jest.fn();
    const getSelector =
      (type: 'field' | 'operator' | 'combinator') => (props: ValueSelectorProps) => {
        const opt = getOption(props.options, props.value!);
        ({
          field: fieldSelectorReporter,
          operator: operatorSelectorReporter,
          combinator: combinatorSelectorReporter,
        })[type](opt);
        return null;
      };
    render(
      <QueryBuilder
        addRuleToNewGroups
        fields={[
          { value: 'f1', label: 'One' },
          { value: 'f2', label: 'Two' },
        ]}
        baseField={{ base: 'field' }}
        baseOperator={{ base: 'operator' }}
        baseCombinator={{ base: 'combinator' }}
        controlElements={{
          fieldSelector: getSelector('field'),
          operatorSelector: getSelector('operator'),
          combinatorSelector: getSelector('combinator'),
        }}
      />
    );
    expect(fieldSelectorReporter).toHaveBeenCalledWith(expect.objectContaining({ base: 'field' }));
    expect(operatorSelectorReporter).toHaveBeenCalledWith(
      expect.objectContaining({ base: 'operator' })
    );
    expect(combinatorSelectorReporter).toHaveBeenCalledWith(
      expect.objectContaining({ base: 'combinator' })
    );
  });
});

describe('get* callbacks', () => {
  const fields: FullField[] = [
    { name: 'firstName', label: 'First Name' },
    { name: 'lastName', label: 'Last Name' },
    { name: 'age', label: 'Age' },
  ].map(o => toFullOption(o));
  const rule: RuleType = {
    field: 'lastName',
    value: 'Another Test',
    operator: '=',
  };
  const query: RuleGroupType = { combinator: 'or', not: false, rules: [rule] };

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
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({ rules: [{ field: 'f' }] });
  });

  it('creates a new rule and removes that rule', async () => {
    const { onQueryChange } = setup();
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({ rules: [] });

    await user.click(screen.getByTestId(TestID.addRule));
    expect(screen.getByTestId(TestID.rule)).toBeInTheDocument();
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({ rules: [{}] });

    await user.click(screen.getByTestId(TestID.removeRule));
    expect(screen.queryByTestId(TestID.rule)).toBeNull();
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({ rules: [] });
  });

  it('creates a new group and removes that group', async () => {
    const { onQueryChange } = setup();
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({ rules: [] });

    await user.click(screen.getByTestId(TestID.addGroup));
    expect(screen.getAllByTestId(TestID.ruleGroup)).toHaveLength(2);
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({ rules: [expect.anything()] });
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({ combinator: 'and' });

    await user.click(screen.getByTestId(TestID.removeGroup));
    expect(screen.getAllByTestId(TestID.ruleGroup)).toHaveLength(1);
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({ rules: [] });
  });

  it('creates a new rule and change the fields', async () => {
    const { onQueryChange } = setup();
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({ rules: [] });

    await user.click(screen.getByTestId(TestID.addRule));
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({ rules: [expect.anything()] });

    await user.selectOptions(screen.getByTestId(TestID.fields), 'field2');
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({ rules: [{ field: 'field2' }] });
  });

  it('creates a new rule and change the operator', async () => {
    const { onQueryChange } = setup();
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({ rules: [] });

    await user.click(screen.getByTestId(TestID.addRule));
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({ rules: [expect.anything()] });

    await user.selectOptions(screen.getByTestId(TestID.operators), '!=');
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({ rules: [{ operator: '!=' }] });
  });

  it('changes the combinator of the root group', async () => {
    const { onQueryChange } = setup();
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({ rules: [] });

    await user.selectOptions(screen.getByTestId(TestID.combinators), 'or');
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({ rules: [] });
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({ combinator: 'or' });
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
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({ rules: [{ value: '' }] });

    await user.selectOptions(screen.getByTestId(TestID.fields), 'field2');
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({
      rules: [{ field: 'field2', value: false }],
    });

    await user.selectOptions(screen.getByTestId(TestID.fields), 'field3');
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({
      rules: [{ field: 'field3', value: 'value1' }],
    });
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
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({
      rules: [{ value: 'value1' }],
    });
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
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({ rules: [{ operator: '>' }] });

    await user.type(screen.getByTestId(TestID.valueEditor), 'Test');
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({ rules: [{ value: 'Test' }] });

    await user.selectOptions(screen.getByTestId(TestID.fields), 'field2');
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({
      rules: [{ operator: '=', value: '' }],
    });
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
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({ rules: [{ operator: '>' }] });

    await user.type(screen.getByTestId(TestID.valueEditor), 'Test');
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({ rules: [{ value: 'Test' }] });

    await user.selectOptions(screen.getByTestId(TestID.fields), 'field2');
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({
      rules: [{ operator: '>', value: 'Test' }],
    });
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
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({ rules: [{ operator: '>' }] });

    await user.type(screen.getByTestId(TestID.valueEditor), 'Test');
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({ rules: [{ value: 'Test' }] });

    await user.selectOptions(screen.getByTestId(TestID.operators), '=');
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({
      rules: [{ operator: '=', value: '' }],
    });

    // Does not choose a value from the values list when the operator changes
    await user.selectOptions(screen.getByTestId(TestID.fields), 'field3');
    await user.selectOptions(screen.getByTestId(TestID.operators), 'beginsWith');
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({
      rules: [{ operator: 'beginsWith', value: '' }],
    });
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
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({ rules: [{ operator: '>' }] });

    await user.type(screen.getByTestId(TestID.valueEditor), 'Test');
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({ rules: [{ value: 'Test' }] });

    await user.selectOptions(screen.getByTestId(TestID.operators), '=');
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({
      rules: [{ operator: '=', value: 'Test' }],
    });
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
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({ rules: [{ field: 'field2' }] });
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
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({ rules: [{ field: 'field2' }] });
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
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({
      rules: [{ operator: 'beginsWith' }],
    });
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
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({
      rules: [{ operator: 'beginsWith' }],
    });
  });
});

describe('defaultOperator property in field', () => {
  it('sets the default operator', async () => {
    const fields: Field[] = [{ name: 'field1', label: 'Field 1', defaultOperator: 'beginsWith' }];
    const onQueryChange = jest.fn<never, [RuleGroupType]>();
    render(<QueryBuilder fields={fields} onQueryChange={onQueryChange} />);

    await user.click(screen.getByTestId(TestID.addRule));
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({
      rules: [{ operator: 'beginsWith' }],
    });
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
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({ rules: [{ value: 'Test Value' }] });
  });
});

describe('parseNumbers prop', () => {
  const fields: Field[] = [
    { name: 'field1', label: 'Field 1' },
    { name: 'field2', label: 'Field 2', inputType: 'number' },
  ];
  const txtQuery: RuleGroupType = {
    combinator: 'and',
    rules: [{ field: 'field1', operator: '=', value: '' }],
  };
  const numQuery: RuleGroupType = {
    combinator: 'and',
    rules: [{ field: 'field2', operator: '=', value: '' }],
  };

  it('does not parse numbers by default', async () => {
    const onQueryChange = jest.fn<never, [RuleGroupType]>();
    render(<QueryBuilder fields={fields} onQueryChange={onQueryChange} defaultQuery={numQuery} />);
    await user.type(screen.getByTestId(TestID.valueEditor), '1214');
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({ rules: [{ value: '1214' }] });
  });

  const ValueEditorAlwaysText = (props: ValueEditorProps) => {
    const { parseNumberMethod } = useValueEditor({ ...props, skipHook: true });
    return <ValueEditor {...props} skipHook inputType="text" parseNumbers={parseNumberMethod} />;
  };

  // Test result constants
  const typedValuesArray = [
    ' ',
    '1214',
    '1,214',
    '1,2,1,4',
    '12,14',
    String.raw`1\,2,1\,4`,
    '1214xyz',
  ];
  const typedValues = typedValuesArray.map(typedValue => ({ typedValue }));
  const inputTypeNumberAllowedAsStr = typedValuesArray.map(s => (/^\d+$/.test(s) ? s : ''));
  const inputTypeNumberAllowedAsNum = typedValuesArray.map(s =>
    /^\d+$/.test(s) ? Number.parseInt(s) : ''
  );
  const six1214s = new Array<number>(6).fill(1214);
  const six1214strings = new Array<string>(6).fill('1214');
  const all1214sNoSpace = ['', ...six1214s];
  const all1214sWithSpace = [' ', ...six1214s];
  const all1214stringsNoSpace = ['', ...six1214strings];

  const testCases = [
    {
      parseNumberMode: true,
      textAtOnce: [' ', 1214, 1214, 1214, 1214, String.raw`1\,2,1\,4`, '1214xyz'],
      textTyped: [' ', 1214, 1214, 1214, 1214, String.raw`1\,2,1\,4`, '1214xyz'],
      numAtOnce: inputTypeNumberAllowedAsNum,
      numTyped: all1214sNoSpace,
      numTextEditorAtOnce: [' ', 1214, 1214, 1214, 1214, String.raw`1\,2,1\,4`, '1214xyz'],
      numTextEditorTyped: [' ', 1214, 1214, 1214, 1214, String.raw`1\,2,1\,4`, '1214xyz'],
    },
    {
      parseNumberMode: false,
      textAtOnce: typedValuesArray,
      textTyped: typedValuesArray,
      numAtOnce: inputTypeNumberAllowedAsStr,
      numTyped: all1214stringsNoSpace,
      numTextEditorAtOnce: typedValuesArray,
      numTextEditorTyped: typedValuesArray,
    },
    {
      parseNumberMode: 'enhanced',
      textAtOnce: [' ', 1214, 1214, 1214, 1214, 1, 1214],
      textTyped: all1214sWithSpace,
      numAtOnce: inputTypeNumberAllowedAsNum,
      numTyped: all1214sNoSpace,
      numTextEditorAtOnce: [' ', 1214, 1214, 1214, 1214, 1, 1214],
      numTextEditorTyped: all1214sWithSpace,
    },
    {
      parseNumberMode: 'enhanced-limited',
      textAtOnce: typedValuesArray,
      textTyped: typedValuesArray,
      numAtOnce: inputTypeNumberAllowedAsNum,
      numTyped: all1214sNoSpace,
      numTextEditorAtOnce: [' ', 1214, 1214, 1214, 1214, 1, 1214],
      numTextEditorTyped: all1214sWithSpace,
    },
    {
      parseNumberMode: 'native',
      textAtOnce: [Number.NaN, 1214, 1, 1, 12, 1, 1214],
      textTyped: [Number.NaN, ...six1214s],
      numAtOnce: inputTypeNumberAllowedAsNum,
      numTyped: all1214sNoSpace,
      numTextEditorAtOnce: [Number.NaN, 1214, 1, 1, 12, 1, 1214],
      numTextEditorTyped: [Number.NaN, ...six1214s],
    },
    {
      parseNumberMode: 'native-limited',
      textAtOnce: typedValuesArray,
      textTyped: typedValuesArray,
      numAtOnce: inputTypeNumberAllowedAsNum,
      numTyped: all1214sNoSpace,
      numTextEditorAtOnce: [Number.NaN, 1214, 1, 1, 12, 1, 1214],
      numTextEditorTyped: [Number.NaN, ...six1214s],
    },
    {
      parseNumberMode: 'strict',
      textAtOnce: [' ', 1214, 1214, 1214, 1214, String.raw`1\,2,1\,4`, '1214xyz'],
      textTyped: [' ', 1214, 1214, 1214, 1214, String.raw`1\,2,1\,4`, '1214xyz'],
      numAtOnce: inputTypeNumberAllowedAsNum,
      numTyped: all1214sNoSpace,
      numTextEditorAtOnce: [' ', 1214, 1214, 1214, 1214, String.raw`1\,2,1\,4`, '1214xyz'],
      numTextEditorTyped: [' ', 1214, 1214, 1214, 1214, String.raw`1\,2,1\,4`, '1214xyz'],
    },
    {
      parseNumberMode: 'strict-limited',
      textAtOnce: typedValuesArray,
      textTyped: typedValuesArray,
      numAtOnce: inputTypeNumberAllowedAsNum,
      numTyped: all1214sNoSpace,
      numTextEditorAtOnce: [' ', 1214, 1214, 1214, 1214, String.raw`1\,2,1\,4`, '1214xyz'],
      numTextEditorTyped: [' ', 1214, 1214, 1214, 1214, String.raw`1\,2,1\,4`, '1214xyz'],
    },
  ] as const satisfies {
    parseNumberMode: ParseNumbersPropConfig;
    textAtOnce: (string | number)[];
    textTyped: (string | number)[];
    numAtOnce: (string | number)[];
    numTyped: (string | number)[];
    numTextEditorAtOnce: (string | number)[];
    numTextEditorTyped: (string | number)[];
  }[];

  describe.each(testCases)(
    '$parseNumberMode mode',
    ({
      parseNumberMode,
      textAtOnce,
      textTyped,
      numAtOnce,
      numTyped,
      numTextEditorAtOnce,
      numTextEditorTyped,
    }) => {
      describe.each(
        // prettier-ignore
        [
          { inputType: 'text', inputMethod: 'at once', vals: textAtOnce, query: txtQuery },
          { inputType: 'text', inputMethod: 'typed', vals: textTyped, query: txtQuery },
          { inputType: 'number', inputMethod: 'at once', vals: numAtOnce, query: numQuery },
          { inputType: 'number', inputMethod: 'typed', vals: numTyped, query: numQuery },
          { inputType: 'number-text-editor', inputMethod: 'at once', vals: numTextEditorAtOnce, query: numQuery },
          { inputType: 'number-text-editor', inputMethod: 'typed', vals: numTextEditorTyped, query: numQuery },
        ]
      )('inputType $inputType ($inputMethod)', ({ inputMethod, inputType, vals, query }) => {
        it.each(typedValues)(`"$typedValue"`, async ({ typedValue }) => {
          const onQueryChange = jest.fn<never, [RuleGroupType]>();
          const VE = inputType === 'number-text-editor' ? ValueEditorAlwaysText : ValueEditor;
          render(
            <QueryBuilder
              parseNumbers={parseNumberMode}
              fields={fields}
              onQueryChange={onQueryChange}
              defaultQuery={query}
              controlElements={{ valueEditor: VE }}
            />
          );
          const valueEditor = screen.getByTestId(TestID.valueEditor);
          if (inputMethod === 'at once') {
            fireEvent.change(valueEditor, { target: { value: typedValue } });
          } else {
            await user.type(valueEditor, typedValue);
          }
          expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({
            rules: [
              {
                value: vals[typedValues.findIndex(tv => tv.typedValue === typedValue)],
              },
            ],
          });
        });
      });
    }
  );

  it('parses numbers for "between" operator', async () => {
    const onQueryChange = jest.fn<never, [RuleGroupType]>();
    const defaultQuery: RuleGroupType = {
      combinator: 'and',
      rules: [{ field: 'field1', operator: 'between', value: '12abc,14abc' }],
    };
    render(
      <QueryBuilder
        parseNumbers="enhanced"
        listsAsArrays
        fields={fields}
        onQueryChange={onQueryChange}
        defaultQuery={defaultQuery}
      />
    );

    const ves = screen.getByTestId(TestID.valueEditor).querySelectorAll(`.${sc.valueListItem}`);
    await user.type(ves[0], 'd');
    await user.type(ves[1], 'd');

    expect(onQueryChange).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ rules: [expect.objectContaining({ value: '12abc,14abc' })] })
    );
    expect(onQueryChange).toHaveBeenCalledWith(
      expect.objectContaining({ rules: [expect.objectContaining({ value: [12, '14abc'] })] })
    );
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({ rules: [{ value: [12, 14] }] });
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
    expect(onLog.mock.calls.at(-1)![0]).toMatchObject({
      rule: expect.anything(),
      parentPath: expect.any(Array),
      query: expect.anything(),
    });
  });

  it('allows the rule addition', async () => {
    const onQueryChange = jest.fn<never, [RuleGroupType]>();
    render(<QueryBuilder onAddRule={() => true} onQueryChange={onQueryChange} />);

    await user.click(screen.getByTestId(TestID.addRule));
    expect(onQueryChange).toHaveBeenCalledTimes(2);
    expect(onQueryChange.mock.calls[1][0].rules).toHaveLength(1);
  });

  it('modifies the rule addition', async () => {
    const onQueryChange = jest.fn<never, [RuleGroupType]>();
    const rule: RuleType = { field: 'test', operator: '=', value: 'modified' };
    render(<QueryBuilder onAddRule={() => rule} onQueryChange={onQueryChange} />);

    await user.click(screen.getByTestId(TestID.addRule));
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({ rules: [{ value: 'modified' }] });
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
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({ rules: [{}, 'or', {}] });
    expect(screen.getByTestId(TestID.combinators)).toHaveValue('or');
  });

  it('passes handleOnClick context to onAddRule', async () => {
    const onQueryChange = jest.fn<never, [RuleGroupType]>();
    const rule: RuleType = { field: 'test', operator: '=', value: 'modified' };
    const AddRuleAction = (props: ActionProps) => (
      <React.Fragment>
        <button onClick={e => props.handleOnClick(e, false)}>Fail</button>
        <button onClick={e => props.handleOnClick(e, true)}>Succeed</button>
      </React.Fragment>
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
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({ rules: [{ value: 'modified' }] });
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
    expect(onLog.mock.calls.at(-1)![0]).toMatchObject({
      ruleGroup: expect.anything(),
      parentPath: expect.any(Array),
      query: expect.anything(),
    });
  });

  it('allows the group addition', async () => {
    const onQueryChange = jest.fn<never, [RuleGroupType]>();
    const onLog = jest.fn();
    render(
      <QueryBuilder onAddGroup={() => true} onQueryChange={onQueryChange} debugMode onLog={onLog} />
    );

    await user.click(screen.getByTestId(TestID.addGroup));
    expect(onQueryChange).toHaveBeenCalledTimes(2);
    expect(onQueryChange.mock.calls[1][0].rules).toHaveLength(1);
  });

  it('modifies the group addition', async () => {
    const onQueryChange = jest.fn<never, [RuleGroupType]>();
    const group: RuleGroupType = { combinator: 'fake', rules: [] };
    render(<QueryBuilder onAddGroup={() => group} onQueryChange={onQueryChange} />);

    await user.click(screen.getByTestId(TestID.addGroup));
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({
      combinator: 'and',
      rules: [{ combinator: 'fake', rules: [] }],
    });
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
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({ rules: [{}, 'or', {}] });
    expect(screen.getByTestId(TestID.combinators)).toHaveValue('or');
  });

  it('passes handleOnClick context to onAddGroup', async () => {
    const onQueryChange = jest.fn<never, [RuleGroupType]>();
    const ruleGroup: RuleGroupType = { combinator: 'fake', rules: [] };
    const AddGroupAction = (props: ActionProps) => (
      <React.Fragment>
        <button onClick={e => props.handleOnClick(e, false)}>Fail</button>
        <button onClick={e => props.handleOnClick(e, true)}>Succeed</button>
      </React.Fragment>
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
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({
      combinator: 'and',
      rules: [{ combinator: 'fake', rules: [] }],
    });
  });
});

describe('onMoveRule prop', () => {
  const defaultQuery: RuleGroupType = {
    combinator: 'and',
    rules: [
      { field: 'f1', operator: '=', value: 'v1' },
      { field: 'f2', operator: '=', value: 'v2' },
      {
        combinator: 'and',
        rules: [
          { field: 'f3', operator: '=', value: 'v3' },
          { field: 'f4', operator: '=', value: 'v4' },
        ],
      },
    ],
  };

  it('cancels the rule move', async () => {
    const onLog = jest.fn();
    const onQueryChange = jest.fn<never, [RuleGroupType]>();
    const onMoveRule = jest.fn(() => false);
    render(
      <QueryBuilder
        onMoveRule={onMoveRule}
        onQueryChange={onQueryChange}
        defaultQuery={defaultQuery}
        debugMode
        onLog={onLog}
        showShiftActions
      />
    );
    expect(onQueryChange).toHaveBeenCalledTimes(1);

    await user.click(screen.getAllByText(t.shiftActionDown.label)[0]);
    expect(onMoveRule).toHaveBeenCalled();
    expect(onQueryChange).toHaveBeenCalledTimes(1);
    expect(onLog.mock.calls.at(-1)[0]).toMatchObject({ type: LogType.onMoveRuleFalse });
  });

  it('allows the rule move', async () => {
    const onQueryChange = jest.fn<never, [RuleGroupType]>();
    render(
      <QueryBuilder
        defaultQuery={defaultQuery}
        showShiftActions
        onMoveRule={() => true}
        onQueryChange={onQueryChange}
      />
    );

    await user.click(screen.getAllByText(t.shiftActionDown.label)[0]);
    expect(onQueryChange).toHaveBeenLastCalledWith(
      move(onQueryChange.mock.calls[0][0], [0], 'down')
    );
  });

  it('modifies the rule move', async () => {
    const onQueryChange = jest.fn<never, [RuleGroupType]>();
    const newQuery: RuleGroupType = { combinator: 'and', rules: [] };
    render(
      <QueryBuilder
        defaultQuery={defaultQuery}
        showShiftActions
        onMoveRule={() => newQuery}
        onQueryChange={onQueryChange}
      />
    );

    await user.click(screen.getAllByText(t.shiftActionDown.label)[0]);
    expect(onQueryChange).toHaveBeenLastCalledWith(newQuery);
  });
});

describe('onMoveGroup prop', () => {
  const defaultQuery: RuleGroupType = {
    combinator: 'and',
    rules: [
      {
        combinator: 'and',
        rules: [
          { field: 'f3', operator: '=', value: 'v3' },
          { field: 'f4', operator: '=', value: 'v4' },
        ],
      },
      { field: 'f1', operator: '=', value: 'v1' },
      { field: 'f2', operator: '=', value: 'v2' },
    ],
  };

  it('cancels the group move', async () => {
    const onLog = jest.fn();
    const onQueryChange = jest.fn<never, [RuleGroupType]>();
    const onMoveGroup = jest.fn(() => false);
    render(
      <QueryBuilder
        onMoveGroup={onMoveGroup}
        onQueryChange={onQueryChange}
        defaultQuery={defaultQuery}
        debugMode
        onLog={onLog}
        showShiftActions
      />
    );
    expect(onQueryChange).toHaveBeenCalledTimes(1);

    await user.click(screen.getAllByText(t.shiftActionDown.label)[0]);
    expect(onMoveGroup).toHaveBeenCalled();
    expect(onQueryChange).toHaveBeenCalledTimes(1);
    expect(onLog.mock.calls.at(-1)![0]).toMatchObject({
      ruleOrGroup: expect.anything(),
      oldPath: expect.any(Array),
      newPath: 'down',
      query: expect.anything(),
      nextQuery: expect.anything(),
    });
  });

  it('allows the group move', async () => {
    const onQueryChange = jest.fn<never, [RuleGroupType]>();
    render(
      <QueryBuilder
        defaultQuery={defaultQuery}
        showShiftActions
        onMoveGroup={() => true}
        onQueryChange={onQueryChange}
      />
    );

    await user.click(screen.getAllByText(t.shiftActionDown.label)[0]);
    expect(onQueryChange).toHaveBeenLastCalledWith(
      move(onQueryChange.mock.calls[0][0], [0], 'down')
    );
  });

  it('modifies the group move', async () => {
    const onQueryChange = jest.fn<never, [RuleGroupType]>();
    const newQuery: RuleGroupType = { combinator: 'and', rules: [] };
    render(
      <QueryBuilder
        defaultQuery={defaultQuery}
        showShiftActions
        onMoveGroup={() => newQuery}
        onQueryChange={onQueryChange}
      />
    );

    await user.click(screen.getAllByText(t.shiftActionDown.label)[0]);
    expect(onQueryChange).toHaveBeenLastCalledWith(newQuery);
  });
});

describe('onGroupRule prop', () => {
  const defaultQuery: RuleGroupType = {
    combinator: 'and',
    rules: [
      { field: 'f1', operator: '=', value: 'v1' },
      { field: 'f2', operator: '=', value: 'v2' },
      {
        combinator: 'and',
        rules: [
          { field: 'f3', operator: '=', value: 'v3' },
          { field: 'f4', operator: '=', value: 'v4' },
        ],
      },
    ],
  };

  const RuleGroupOG = defaultControlElements.ruleGroup;
  const controlElements: ControlElementsProp<FullField, string> = {
    ruleGroup: props => (
      <div>
        <button onClick={() => props.actions.groupRule([1], [0])}>groupRule</button>
        <RuleGroupOG {...props} />
      </div>
    ),
  };

  it('cancels the rule grouping', async () => {
    const onLog = jest.fn();
    const onQueryChange = jest.fn<never, [RuleGroupType]>();
    const onGroupRule = jest.fn(() => false);
    render(
      <QueryBuilder
        onGroupRule={onGroupRule}
        onQueryChange={onQueryChange}
        defaultQuery={defaultQuery}
        debugMode
        onLog={onLog}
        controlElements={controlElements}
      />
    );
    expect(onQueryChange).toHaveBeenCalledTimes(1);

    await user.click(screen.getAllByText('groupRule')[0]);
    expect(onGroupRule).toHaveBeenCalled();
    expect(onQueryChange).toHaveBeenCalledTimes(1);
    expect(onLog.mock.calls.at(-1)[0]).toMatchObject({ type: LogType.onGroupRuleFalse });
  });

  it('allows the rule grouping', async () => {
    const onQueryChange = jest.fn<never, [RuleGroupType]>();
    render(
      <QueryBuilder
        defaultQuery={defaultQuery}
        onGroupRule={() => true}
        onQueryChange={onQueryChange}
        controlElements={controlElements}
      />
    );

    await user.click(screen.getAllByText('groupRule')[0]);
    expect(onQueryChange).toHaveBeenLastCalledWith(
      group(onQueryChange.mock.calls[0][0], [1], [0], { idGenerator: () => expect.any(String) })
    );
  });

  it('modifies the rule grouping', async () => {
    const onQueryChange = jest.fn<never, [RuleGroupType]>();
    const newQuery: RuleGroupType = { combinator: 'and', rules: [] };
    render(
      <QueryBuilder
        defaultQuery={defaultQuery}
        onGroupRule={() => newQuery}
        onQueryChange={onQueryChange}
        controlElements={controlElements}
      />
    );

    await user.click(screen.getAllByText('groupRule')[0]);
    expect(onQueryChange).toHaveBeenLastCalledWith(newQuery);
  });
});

describe('onGroupGroup prop', () => {
  const defaultQuery: RuleGroupType = {
    combinator: 'and',
    rules: [
      {
        combinator: 'and',
        rules: [
          { field: 'f3', operator: '=', value: 'v3' },
          { field: 'f4', operator: '=', value: 'v4' },
        ],
      },
      {
        combinator: 'and',
        rules: [
          { field: 'f1', operator: '=', value: 'v1' },
          { field: 'f2', operator: '=', value: 'v2' },
        ],
      },
    ],
  };

  const RuleGroupOG = defaultControlElements.ruleGroup;
  const controlElements: ControlElementsProp<FullField, string> = {
    ruleGroup: props => (
      <div>
        <button onClick={() => props.actions.groupRule([1], [0])}>groupGroup</button>
        <RuleGroupOG {...props} />
      </div>
    ),
  };

  it('cancels the group grouping', async () => {
    const onLog = jest.fn();
    const onQueryChange = jest.fn<never, [RuleGroupType]>();
    const onGroupGroup = jest.fn(() => false);
    render(
      <QueryBuilder
        onGroupGroup={onGroupGroup}
        onQueryChange={onQueryChange}
        defaultQuery={defaultQuery}
        debugMode
        onLog={onLog}
        controlElements={controlElements}
      />
    );
    expect(onQueryChange).toHaveBeenCalledTimes(1);

    await user.click(screen.getAllByText('groupGroup')[0]);
    expect(onGroupGroup).toHaveBeenCalled();
    expect(onQueryChange).toHaveBeenCalledTimes(1);
    expect(onLog.mock.calls.at(-1)[0]).toMatchObject({ type: LogType.onGroupGroupFalse });
  });

  it('allows the group grouping', async () => {
    const onQueryChange = jest.fn<never, [RuleGroupType]>();
    render(
      <QueryBuilder
        defaultQuery={defaultQuery}
        onGroupGroup={() => true}
        onQueryChange={onQueryChange}
        controlElements={controlElements}
      />
    );

    await user.click(screen.getAllByText('groupGroup')[0]);
    expect(onQueryChange).toHaveBeenLastCalledWith(
      group(onQueryChange.mock.calls[0][0], [1], [0], { idGenerator: () => expect.any(String) })
    );
  });

  it('modifies the group grouping', async () => {
    const onQueryChange = jest.fn<never, [RuleGroupType]>();
    const newQuery: RuleGroupType = { combinator: 'and', rules: [] };
    render(
      <QueryBuilder
        defaultQuery={defaultQuery}
        onGroupGroup={() => newQuery}
        onQueryChange={onQueryChange}
        controlElements={controlElements}
      />
    );

    await user.click(screen.getAllByText('groupGroup')[0]);
    expect(onQueryChange).toHaveBeenLastCalledWith(newQuery);
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
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({
      rules: [{ value: 'Test Value 1' }],
    });
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
    expect(screen.getByTestId(TestID.valueEditor).querySelectorAll('option')).toHaveLength(2);
    expect(screen.getByDisplayValue('Test value 1')).toBeInTheDocument();
  });

  it('sets the values list for "between" operator', async () => {
    const onQueryChange = jest.fn<never, [RuleGroupType]>();
    const valueListItem = 'my-value-list-item-class';
    render(
      <QueryBuilder
        getValueEditorType={() => 'select'}
        getDefaultOperator="between"
        fields={fields}
        onQueryChange={onQueryChange}
        controlClassnames={{ valueListItem }}
      />
    );

    await user.click(screen.getByTestId(TestID.addRule));
    expect(screen.getAllByTestId(TestID.valueEditor)).toHaveLength(1);
    const betweenSelects = screen
      .getAllByRole('combobox')
      .filter(
        bs => bs.classList.contains(sc.valueListItem) && bs.classList.contains(valueListItem)
      );
    expect(betweenSelects).toHaveLength(2);
    for (const bs of betweenSelects) {
      expect(bs.querySelectorAll('option')).toHaveLength(2);
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

describe('autoSelectValue', () => {
  const values = [{ name: '=', label: '=' }];
  const fields: Field[] = [
    { name: 'field1', label: 'Field 1', values, valueEditorType: 'select' },
    { name: 'field2', label: 'Field 2', values, valueEditorType: 'select' },
  ];

  it('uses the placeholderLabel and placeholderName', async () => {
    const placeholderName = 'Test placeholder name';
    const placeholderLabel = 'Test placeholder label';
    render(
      <QueryBuilder
        fields={fields}
        autoSelectValue={false}
        operators={values}
        translations={{ values: { placeholderLabel, placeholderName } }}
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
          values: [{ label: 'Values', options: values }],
        }))}
        autoSelectValue={false}
        translations={{ values: { placeholderGroupLabel } }}
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
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({
      rules: [{ rules: [{ field: defaultPlaceholderFieldName }] }],
    });
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

    expect(shiftRuleButtons.length).toBeGreaterThanOrEqual(1);
    for (const b of shiftRuleButtons) {
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
      expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({
        combinator: 'and',
        rules: [
          { field: 'lastName', operator: '=', value: 'Vai' },
          { field: 'firstName', operator: '=', value: 'Steve' },
        ],
      });
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
      expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({
        combinator: 'and',
        rules: [
          { field: 'firstName', operator: '=', value: 'Steve' },
          { field: 'lastName', operator: '=', value: 'Vai' },
          { field: 'firstName', operator: '=', value: 'Steve' },
        ],
      });
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
      expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({
        combinator: 'and',
        rules: [
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
      expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({
        rules: [
          { field: 'lastName', operator: '=', value: 'Vai' },
          'and',
          { field: 'firstName', operator: '=', value: 'Steve' },
        ],
      });
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
      expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({
        rules: [
          { field: 'firstName', operator: '=', value: 'Steve' },
          'and',
          { field: 'lastName', operator: '=', value: 'Vai' },
          'and',
          { field: 'firstName', operator: '=', value: 'Steve' },
        ],
      });
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
      expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({
        rules: [
          { field: 'lastName', operator: '=', value: 'Vai' },
          'and',
          { field: 'firstName', operator: '=', value: 'Steve' },
        ],
      });
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
      expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({
        combinator: 'and',
        rules: [
          { field: 'firstName', operator: '=', value: 'Steve' },
          { field: 'firstName', operator: '=', value: 'Steve' },
          { field: 'lastName', operator: '=', value: 'Vai' },
        ],
      });
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
      expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({
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
      expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({
        rules: [
          { field: 'firstName', operator: '=', value: 'Steve' },
          'and',
          { field: 'firstName', operator: '=', value: 'Steve' },
        ],
      });
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
      expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({
        rules: [
          { field: 'firstName', operator: '=', value: 'Steve' },
          'and',
          { field: 'firstName', operator: '=', value: 'Steve' },
          'and',
          { field: 'lastName', operator: '=', value: 'Vai' },
        ],
      });
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
      expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({
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

describe('idGenerator', () => {
  it('uses custom id generator', async () => {
    const onQueryChange = jest.fn<never, [RuleGroupType]>();
    const rule = (props: RuleProps) => (
      <div>
        <button type="button" onClick={() => props.actions.moveRule(props.path, [2], true)}>
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
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({
      id: expect.stringMatching(numericRegex),
    });

    await user.click(screen.getByTestId(TestID.addRule));
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({
      rules: [{ id: expect.stringMatching(numericRegex) }],
    });

    await user.click(screen.getByTestId(TestID.addGroup));
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({
      rules: [
        { id: expect.stringMatching(numericRegex) },
        { id: expect.stringMatching(numericRegex) },
      ],
    });

    await user.click(screen.getByText('clone'));
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({
      rules: [
        { id: expect.stringMatching(numericRegex) },
        { id: expect.stringMatching(numericRegex), rules: [] },
        { id: expect.stringMatching(numericRegex) },
      ],
    });
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
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({
      rules: [
        { field: 'firstName', operator: '=', value: '1' },
        'or',
        { field: 'firstName', operator: '=', value: '3' },
      ],
    });

    rerender(
      <QueryBuilder query={onQueryChange.mock.lastCall?.[0]} onQueryChange={onQueryChange} />
    );

    await user.click(screen.getAllByTestId(TestID.removeRule)[0]);
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({ rules: [{ value: '3' }] });
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
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({
      rules: [{ rules: [] }, 'or', { rules: [] }],
    });

    rerender(
      <QueryBuilder query={onQueryChange.mock.lastCall?.[0]} onQueryChange={onQueryChange} />
    );

    await user.click(screen.getAllByTestId(TestID.removeGroup)[0]);
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({ rules: [{ rules: [] }] });
  });
});

describe('validation', () => {
  it('does not validate if no validator function is provided', () => {
    const valid = 'my-valid-class';
    const invalid = 'my-invalid-class';
    render(<QueryBuilder controlClassnames={{ valid, invalid }} />);
    expect(screen.getByRole('form')).not.toHaveClass(sc.valid, valid);
    expect(screen.getByRole('form')).not.toHaveClass(sc.invalid, invalid);
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
    const valid = 'my-valid-class';
    const invalid = 'my-invalid-class';
    render(<QueryBuilder validator={validator} controlClassnames={{ valid, invalid }} />);
    expect(validator).toHaveBeenCalled();
    expect(screen.getByRole('form')).not.toHaveClass(sc.valid, valid);
    expect(screen.getByRole('form')).toHaveClass(sc.invalid, invalid);
  });

  it('uses custom validator function returning true', () => {
    const validator = jest.fn(() => true);
    const valid = 'my-valid-class';
    const invalid = 'my-invalid-class';
    render(<QueryBuilder validator={validator} controlClassnames={{ valid, invalid }} />);
    expect(validator).toHaveBeenCalled();
    expect(screen.getByRole('form')).toHaveClass(sc.valid, valid);
    expect(screen.getByRole('form')).not.toHaveClass(sc.invalid, invalid);
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
    const disabled = 'my-disabled-class';
    const { container } = render(<QueryBuilder disabled controlClassnames={{ disabled }} />);
    expect(container.querySelectorAll('div')[0]).toHaveClass(sc.disabled, disabled);
  });

  it('has the correct classname when disabled prop is false but root group is disabled', () => {
    const disabled = 'my-disabled-class';
    const { container } = render(
      <QueryBuilder
        query={{ disabled: true, combinator: 'and', rules: [] }}
        controlClassnames={{ disabled }}
      />
    );
    expect(container.querySelectorAll('div')[0]).not.toHaveClass(sc.disabled, disabled);
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
          ruleGroupHeaderElements: ({ actions }) => (
            <React.Fragment>
              <button onClick={() => actions.onRuleAdd(ruleToAdd, [])}>onRuleAdd</button>
              <button onClick={() => actions.onGroupAdd(groupToAdd, [])}>onGroupAdd</button>
              <button onClick={() => actions.onPropChange('not', true, [])}>onPropChange</button>
              <button onClick={() => actions.onGroupRemove([6])}>onGroupRemove</button>
            </React.Fragment>
          ),
          ruleGroupBodyElements: ({ actions }) => (
            <React.Fragment>
              <button onClick={() => actions.onPropChange('field', 'f2', [0])}>onPropChange</button>
              <button onClick={() => actions.onPropChange('combinator', 'or', [1])}>
                onPropChange
              </button>
              <button onClick={() => actions.onRuleRemove([0])}>onRuleRemove</button>
              <button onClick={() => actions.moveRule([6], [0])}>moveRule</button>
              <button onClick={() => actions.moveRule([6], [0], true)}>moveRule</button>
            </React.Fragment>
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
    for (const b of rg.querySelectorAll('button')) {
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
    expect(screen.getByDisplayValue(fields.find(f => f.name !== 'f1')!.label)).toHaveClass(
      sc.value
    );
  });

  it('sets the right default value for "between" operator', async () => {
    const onQueryChange = jest.fn<never, [RuleGroupType]>();
    render(
      <QueryBuilder fields={fieldsWithBetween} getDefaultField="fb" onQueryChange={onQueryChange} />
    );

    await user.click(screen.getByTestId(TestID.addRule));
    expect(screen.getAllByDisplayValue(fields.find(f => f.name !== 'fb')!.label)).toHaveLength(2);
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({ rules: [{ value: 'f1,f1' }] });
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
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({ rules: [{ value: ['f1', 'f1'] }] });
  });

  it('handles empty comparator results', async () => {
    render(<QueryBuilder fields={fields} getDefaultField="f3" />);

    await user.click(screen.getByTestId(TestID.addRule));
    expect(screen.getByTestId(TestID.valueEditor).querySelectorAll('option')).toHaveLength(0);
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

describe('match modes', () => {
  const fields: Field[] = [{ name: 'tourDates', label: 'Tour dates', matchModes: true }];

  it('renders the match mode editor with invalid value', async () => {
    const onQueryChange = jest.fn<never, [RuleGroupType]>();
    render(
      <QueryBuilder
        fields={fields}
        onQueryChange={onQueryChange}
        defaultQuery={{
          combinator: 'and',
          rules: [
            {
              field: 'tourDates',
              operator: '=',
              value: '',
              valueSource: 'value',
              match: { mode: 'all' },
            },
          ],
        }}
      />
    );

    expect(screen.getAllByTestId(TestID.matchModeEditor)).toHaveLength(1);
    expect(screen.getAllByDisplayValue('all')).toHaveLength(1);
    expect(screen.getAllByTestId(TestID.ruleGroup)).toHaveLength(1);
    expect(screen.getAllByTestId(TestID.addRule)).toHaveLength(2);

    await user.selectOptions(screen.getByDisplayValue('all'), 'atLeast');
    expect(screen.getAllByDisplayValue('at least')).toHaveLength(1);

    await user.type(screen.getByDisplayValue('1'), '2', {
      initialSelectionStart: 0,
      initialSelectionEnd: 2,
    });
    expect((onQueryChange.mock.calls.at(-1)![0].rules[0] as RuleType).match?.threshold).toBe(2);
  });

  it('renders the match mode editor for new rule', async () => {
    const onQueryChange = jest.fn<never, [RuleGroupType]>();
    render(
      <QueryBuilder
        fields={fields}
        onQueryChange={onQueryChange}
        defaultQuery={{ combinator: 'and', rules: [] }}
      />
    );
    await user.click(screen.getAllByTestId(TestID.addRule).at(-1)!);

    expect(screen.getAllByTestId(TestID.matchModeEditor)).toHaveLength(1);
    expect(screen.getAllByDisplayValue('all')).toHaveLength(1);
    expect(screen.getAllByTestId(TestID.ruleGroup)).toHaveLength(1);
    expect(screen.getAllByTestId(TestID.addRule)).toHaveLength(2);

    await user.selectOptions(screen.getByDisplayValue('all'), 'atLeast');
    await user.click(screen.getAllByTestId(TestID.addRule).at(-1)!);

    expect(onQueryChange.mock.calls.at(-1)![0]).toEqual({
      id: expect.any(String),
      combinator: 'and',
      rules: [
        {
          id: expect.any(String),
          field: 'tourDates',
          operator: '=',
          value: {
            id: expect.any(String),
            combinator: 'and',
            not: false,
            rules: [
              { id: expect.any(String), field: '', operator: '=', value: '', valueSource: 'value' },
            ],
          },
          valueSource: 'value',
          match: { mode: 'atLeast', threshold: 1 },
        },
      ],
    });

    await user.type(screen.getByDisplayValue('1'), '2', {
      initialSelectionStart: 0,
      initialSelectionEnd: 2,
    });
    expect((onQueryChange.mock.calls.at(-1)![0].rules[0] as RuleType).match?.threshold).toBe(2);

    await user.selectOptions(screen.getByDisplayValue('at least'), 'some');
    expect((onQueryChange.mock.calls.at(-1)![0].rules[0] as RuleType).match?.mode).toBe('some');

    await user.click(screen.getAllByTestId(TestID.removeRule).at(-1)!);

    expect(onQueryChange.mock.calls.at(-1)![0]).toEqual({
      id: expect.any(String),
      combinator: 'and',
      rules: [
        {
          id: expect.any(String),
          field: 'tourDates',
          operator: '=',
          value: { id: expect.any(String), combinator: 'and', not: false, rules: [] },
          valueSource: 'value',
          match: { mode: 'some', threshold: 2 },
        },
      ],
    });
  });
});

describe('max levels', () => {
  it('respects maxLevels prop', () => {
    const onQueryChange = jest.fn<never, [RuleGroupType]>();
    render(
      <QueryBuilder
        maxLevels={2}
        onQueryChange={onQueryChange}
        enableMountQueryChange={false}
        defaultQuery={{
          combinator: 'and',
          rules: [
            {
              combinator: 'and',
              rules: [
                {
                  combinator: 'and',
                  rules: [{ field: 'lastName', operator: '=', value: 'Vai' }],
                },
              ],
            },
          ],
        }}
      />
    );
    expect(screen.getAllByTestId(TestID.ruleGroup)).toHaveLength(3);
    expect(screen.getAllByTestId(TestID.addGroup)).toHaveLength(2);
    expect(onQueryChange).toHaveBeenCalledTimes(0);
  });
  it('respects maxLevels prop within API', async () => {
    const onQueryChange = jest.fn<never, [RuleGroupType]>();
    const ruleGroupHeaderElements = (props: UseRuleGroup) => {
      return (
        <>
          <RuleGroupHeaderComponents {...props} />
          <button
            type="button"
            onClick={() => props.actions.onGroupAdd({ combinator: 'and', rules: [] }, props.path)}>
            API Add Group
          </button>
        </>
      );
    };
    render(
      <QueryBuilder
        maxLevels={2}
        onQueryChange={onQueryChange}
        enableMountQueryChange={false}
        controlElements={{ ruleGroupHeaderElements }}
        defaultQuery={{
          combinator: 'and',
          rules: [
            {
              combinator: 'and',
              rules: [
                {
                  combinator: 'and',
                  rules: [{ field: 'lastName', operator: '=', value: 'Vai' }],
                },
              ],
            },
          ],
        }}
      />
    );
    await user.click(screen.getAllByText('API Add Group').at(-1)!);
    expect(screen.getAllByTestId(TestID.ruleGroup)).toHaveLength(3);
    expect(onQueryChange).toHaveBeenCalledTimes(0);
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
      <React.Fragment>
        <button onClick={() => testFunc(getQuery())}>{getQueryBtnText}</button>
        <button onClick={() => dispatchQuery({ combinator: 'or', rules: [] })}>
          {' '}
          {dispatchQueryBtnText}{' '}
        </button>
      </React.Fragment>
    );
    render(<QueryBuilder onQueryChange={onQueryChange} controlElements={{ rule }} />);

    await user.click(screen.getByTestId(TestID.addRule));
    await user.click(screen.getByText(getQueryBtnText));
    expect(testFunc.mock.lastCall?.[0]).toMatchObject({
      combinator: 'and',
      not: false,
      rules: [{ field: '~', operator: '=', value: '', valueSource: 'value' }],
    });

    await user.click(screen.getByText(dispatchQueryBtnText));
    expect(onQueryChange.mock.lastCall?.[0]).toMatchObject({ combinator: 'or', rules: [] });
  });

  it('updates the store when an entirely new query prop is provided', async () => {
    const emptyQuery: RuleGroupType = { combinator: 'and', rules: [] };
    const QBApp = ({ query }: { query: RuleGroupType }) => {
      const [q, sq] = React.useState(query);

      return (
        <React.Fragment>
          <button type="button" onClick={() => sq(emptyQuery)}>
            Reset
          </button>
          <QueryBuilder query={q} onQueryChange={sq} enableMountQueryChange={false} />
        </React.Fragment>
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

describe('null controlElements', () => {
  const query: RuleGroupType = {
    combinator: 'and',
    rules: [{ combinator: 'or', rules: [{ field: 'f1', operator: '=', value: 'v1' }] }],
  };
  const controlElements: ControlElementsProp<FullField, string> = {
    addGroupAction: null,
    addRuleAction: null,
    cloneGroupAction: null,
    cloneRuleAction: null,
    combinatorSelector: null,
    dragHandle: null,
    fieldSelector: null,
    inlineCombinator: null,
    lockGroupAction: null,
    lockRuleAction: null,
    notToggle: null,
    operatorSelector: null,
    removeGroupAction: null,
    removeRuleAction: null,
    shiftActions: null,
    valueEditor: null,
    valueSourceSelector: null,
  };

  const expectNothing = () => {
    expect(screen.queryAllByTestId(TestID.addGroup)).toHaveLength(0);
    expect(screen.queryAllByTestId(TestID.addRule)).toHaveLength(0);
    expect(screen.queryAllByTestId(TestID.cloneGroup)).toHaveLength(0);
    expect(screen.queryAllByTestId(TestID.cloneRule)).toHaveLength(0);
    expect(screen.queryAllByTestId(TestID.combinators)).toHaveLength(0);
    expect(screen.queryAllByTestId(TestID.dragHandle)).toHaveLength(0);
    expect(screen.queryAllByTestId(TestID.fields)).toHaveLength(0);
    expect(screen.queryAllByTestId(TestID.lockGroup)).toHaveLength(0);
    expect(screen.queryAllByTestId(TestID.lockRule)).toHaveLength(0);
    expect(screen.queryAllByTestId(TestID.notToggle)).toHaveLength(0);
    expect(screen.queryAllByTestId(TestID.operators)).toHaveLength(0);
    expect(screen.queryAllByTestId(TestID.removeGroup)).toHaveLength(0);
    expect(screen.queryAllByTestId(TestID.removeRule)).toHaveLength(0);
    expect(screen.queryAllByTestId(TestID.shiftActions)).toHaveLength(0);
    expect(screen.queryAllByTestId(TestID.valueEditor)).toHaveLength(0);
    expect(screen.queryAllByTestId(TestID.valueSourceSelector)).toHaveLength(0);
  };

  it('uses `null` from context', () => {
    render(
      <QueryBuilderContext.Provider value={{ controlElements }}>
        <QueryBuilder
          showCloneButtons
          showLockButtons
          showNotToggle
          showShiftActions
          query={query}
        />
      </QueryBuilderContext.Provider>
    );
    expectNothing();
  });

  it('uses `null` from props', () => {
    render(
      <QueryBuilder
        showCloneButtons
        showLockButtons
        controlElements={controlElements}
        query={query}
      />
    );
    expectNothing();
  });

  it('overrides bulk overrides with `null` from context', () => {
    render(
      <QueryBuilderContext.Provider
        value={{
          controlElements: {
            ...controlElements,
            actionElement: ActionElement,
            valueSelector: ValueSelector,
          },
        }}>
        <QueryBuilder
          showCloneButtons
          showLockButtons
          showNotToggle
          showShiftActions
          query={query}
        />
      </QueryBuilderContext.Provider>
    );
    expectNothing();
  });

  it('overrides bulk overrides with `null` from props', () => {
    render(
      <QueryBuilder
        showCloneButtons
        showLockButtons
        controlElements={{
          ...controlElements,
          actionElement: ActionElement,
          valueSelector: ValueSelector,
        }}
        query={query}
      />
    );
    expectNothing();
  });
});

describe('selector hooks', () => {
  const queryTracker = jest.fn();
  const UseQueryBuilderSelector = (props: RuleGroupProps) => {
    const q = useQueryBuilderSelector(getQuerySelectorById(props.schema.qbId));
    queryTracker(q ?? false);
    return null;
  };
  const UseQueryBuilderQueryPARAM = (props: RuleGroupProps) => {
    const q = useQueryBuilderQuery(props);
    queryTracker(q ?? false);
    return null;
  };
  const UseQueryBuilderQueryNOPARAM = () => {
    const q = useQueryBuilderQuery();
    queryTracker(q ?? false);
    return null;
  };
  const generateQuery = (value: string): RuleGroupType => ({
    combinator: 'and',
    rules: [{ field: 'f1', operator: '=', value }],
  });

  beforeEach(() => {
    queryTracker.mockClear();
  });

  describe.each([
    { RG: UseQueryBuilderSelector, testName: 'useQueryBuilderSelector' },
    { RG: UseQueryBuilderQueryPARAM, testName: 'useQueryBuilderQuery with parameter' },
    { RG: UseQueryBuilderQueryNOPARAM, testName: 'useQueryBuilderQuery without parameter' },
  ])('$testName', ({ RG }) => {
    it('returns a query on first render without query prop', () => {
      const query: RuleGroupType = { combinator: 'and', rules: [] };
      render(<QueryBuilder controlElements={{ ruleGroup: RG }} />);
      expect(queryTracker).toHaveBeenNthCalledWith(1, expect.objectContaining(query));
    });

    it('returns a query on first render with defaultQuery prop', () => {
      const query = generateQuery('defaultQuery prop');
      render(<QueryBuilder defaultQuery={query} controlElements={{ ruleGroup: RG }} />);
      expect(queryTracker).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          combinator: 'and',
          rules: [expect.objectContaining(query.rules[0])],
        })
      );
    });

    it('returns a query on first render with query prop', () => {
      const query = generateQuery('query prop');
      render(<QueryBuilder query={query} controlElements={{ ruleGroup: RG }} />);
      expect(queryTracker).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          combinator: 'and',
          rules: [expect.objectContaining(query.rules[0])],
        })
      );
    });
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
              <button onClick={() => props.actions.groupRule([1], [0])}>groupRule</button>
              <RuleGroupOG {...props} />
            </div>
          ),
        }}
      />
    );

    await user.click(screen.getByTestId(TestID.addRule));
    expect(onLog.mock.calls.at(-1)[0]).toMatchObject({ type: LogType.add });

    await user.selectOptions(screen.getByTestId(TestID.operators), '>');
    expect(onLog.mock.calls.at(-1)[0]).toMatchObject({ type: LogType.update });

    await user.click(screen.getByTestId(TestID.addRule));
    expect(onLog.mock.calls.at(-1)[0]).toMatchObject({ type: LogType.add });

    await user.click(screen.getByText('moveRule'));
    expect(onLog.mock.calls.at(-1)[0]).toMatchObject({ type: LogType.move });

    await user.click(screen.getAllByTestId(TestID.removeRule)[0]);
    expect(onLog.mock.calls.at(-1)[0]).toMatchObject({ type: LogType.remove });

    await user.click(screen.getByTestId(TestID.addGroup));
    expect(onLog.mock.calls.at(-1)[0]).toMatchObject({ type: LogType.add });

    await user.click(screen.getByTestId(TestID.removeGroup));
    expect(onLog.mock.calls.at(-1)[0]).toMatchObject({ type: LogType.remove });

    await user.click(screen.getAllByText('groupRule')[0]);
    expect(onLog.mock.calls.at(-1)[0]).toMatchObject({ type: LogType.group });
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
    expect(onLog.mock.calls.at(-1)![0]).toMatchObject({ type: LogType.onAddRuleFalse });

    await user.click(screen.getByTestId(TestID.addGroup));
    expect(onLog.mock.calls.at(-1)![0]).toMatchObject({ type: LogType.onAddGroupFalse });

    await user.click(screen.getByTestId(TestID.removeRule));
    expect(onLog.mock.calls.at(-1)![0]).toMatchObject({ type: LogType.onRemoveFalse });
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
      actions: { groupRule, moveRule, onGroupAdd, onGroupRemove, onRuleAdd, onPropChange },
    }: RuleGroupProps) => (
      <React.Fragment>
        <button onClick={() => onPropChange('combinator', 'or', [])}>Change Combinator</button>
        <button onClick={() => onRuleAdd({ field: 'f', operator: '=', value: 'v' }, [])}>
          Add Rule
        </button>
        <button onClick={() => onGroupAdd({ combinator: 'and', rules: [] }, [])}>Add Group</button>
        <button onClick={() => moveRule(path, [0], true)}>Clone Group</button>
        <button onClick={() => onGroupRemove(path)}>Remove Group</button>
        <button onClick={() => groupRule(path, [0])}>Group Group</button>
      </React.Fragment>
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
    const btnTexts = [
      'Change Combinator',
      'Add Rule',
      'Add Group',
      'Clone Group',
      'Remove Group',
      'Group Group',
    ] as const;
    for (const btnText of btnTexts) {
      await user.click(screen.getAllByText(btnText)[0]);
    }
    expect(onLog).toHaveBeenCalledTimes(btnTexts.length);
  });
});

describe('controlled/uncontrolled warnings', () => {
  it('tracks changes from controlled to uncontrolled and vice versa', async () => {
    const getQuery = (): RuleGroupType => ({
      combinator: generateID(),
      rules: [],
    });
    const { rerender } = render(<QueryBuilder enableMountQueryChange={false} />);
    await waitABeat();
    expect(consoleError).not.toHaveBeenCalled();
    rerender(<QueryBuilder query={getQuery()} />);
    await waitABeat();
    expect(consoleError).toHaveBeenLastCalledWith(messages.errorUncontrolledToControlled);
    rerender(<QueryBuilder defaultQuery={getQuery()} query={getQuery()} />);
    await waitABeat();
    expect(consoleError).toHaveBeenLastCalledWith(messages.errorBothQueryDefaultQuery);
    rerender(<QueryBuilder defaultQuery={getQuery()} />);
    await waitABeat();
    expect(consoleError).toHaveBeenLastCalledWith(messages.errorControlledToUncontrolled);

    // Start the process over and test that the warnings are not re-triggered
    const errorCallCount = consoleError.mock.calls.length;

    rerender(<QueryBuilder query={getQuery()} />);
    await waitABeat();
    rerender(<QueryBuilder defaultQuery={getQuery()} query={getQuery()} />);
    await waitABeat();
    rerender(<QueryBuilder defaultQuery={getQuery()} />);
    await waitABeat();
    expect(consoleError.mock.calls).toHaveLength(errorCallCount);
  });
});

describe('deprecated props', () => {
  it('warns about unnecessary independentCombinators prop', async () => {
    render(<QueryBuilder query={{ rules: [] }} />);
    await waitABeat();
    expect(consoleError).not.toHaveBeenCalledWith(
      messages.errorUnnecessaryIndependentCombinatorsProp
    );

    render(<QueryBuilder independentCombinators={false} query={{ rules: [] }} />);
    await waitABeat();
    expect(consoleError).toHaveBeenCalledWith(messages.errorUnnecessaryIndependentCombinatorsProp);
  });

  it('warns about invalid independentCombinators prop', async () => {
    render(<QueryBuilder independentCombinators query={{ rules: [] }} />);
    await waitABeat();
    expect(consoleError).not.toHaveBeenCalledWith(messages.errorInvalidIndependentCombinatorsProp);

    render(<QueryBuilder independentCombinators query={{ combinator: 'and', rules: [] }} />);
    await waitABeat();
    expect(consoleError).toHaveBeenCalledWith(messages.errorInvalidIndependentCombinatorsProp);
  });
});

describe('string array options', () => {
  const user = userEvent.setup();

  const fields: Field[] = [
    { name: 'field1', label: 'Field 1' },
    { name: 'field2', label: 'Field 2' },
  ];

  const setupWithStringArrays = (
    props?: QueryBuilderProps<RuleGroupType, FullField, FullOperator, FullCombinator>
  ) => {
    const onQueryChange = jest.fn<never, [RuleGroupType]>();
    const defaultQuery: RuleGroupType = {
      combinator: 'and',
      rules: [{ field: 'field1', operator: '=', value: 'test' }],
    };

    return {
      onQueryChange,
      ...render(
        <QueryBuilder
          fields={fields}
          defaultQuery={defaultQuery}
          onQueryChange={onQueryChange}
          {...props}
        />
      ),
    };
  };

  describe('fields prop with string arrays', () => {
    it('accepts array of field strings', () => {
      setupWithStringArrays({ fields: ['and', 'or'] });

      const fieldSelector = screen.getByTestId(TestID.fields);
      const options = fieldSelector.querySelectorAll('option');

      expect(options).toHaveLength(2);
      expect(options[0]).toHaveTextContent('and');
      expect(options[0]).toHaveValue('and');
      expect(options[1]).toHaveTextContent('or');
      expect(options[1]).toHaveValue('or');
    });

    it('accepts extended field strings including xor', () => {
      setupWithStringArrays({ fields: ['and', 'or', 'xor'] });

      const fieldSelector = screen.getByTestId(TestID.fields);
      const options = fieldSelector.querySelectorAll('option');

      expect(options).toHaveLength(3);
      expect(options[0]).toHaveTextContent('and');
      expect(options[1]).toHaveTextContent('or');
      expect(options[2]).toHaveTextContent('xor');
      expect(options[2]).toHaveValue('xor');
    });

    it('uses default labels from defaultfieldsExtended for string arrays', () => {
      setupWithStringArrays({ fields: ['and', 'xor'] });

      const fieldSelector = screen.getByTestId(TestID.fields);
      const options = fieldSelector.querySelectorAll('option');

      expect(options).toHaveLength(2);
      expect(options[0]).toHaveValue('and');
      expect(options[0]).toHaveTextContent('and');
      expect(options[1]).toHaveValue('xor');
      expect(options[1]).toHaveTextContent('xor');
    });
  });

  describe('combinators prop with string arrays', () => {
    it('accepts array of combinator strings', () => {
      setupWithStringArrays({ combinators: ['and', 'or'] });

      const combinatorSelector = screen.getByTestId(TestID.combinators);
      const options = combinatorSelector.querySelectorAll('option');

      expect(options).toHaveLength(2);
      expect(options[0]).toHaveTextContent('AND');
      expect(options[0]).toHaveValue('and');
      expect(options[1]).toHaveTextContent('OR');
      expect(options[1]).toHaveValue('or');
    });

    it('accepts extended combinator strings including xor', () => {
      setupWithStringArrays({ combinators: ['and', 'or', 'xor'] });

      const combinatorSelector = screen.getByTestId(TestID.combinators);
      const options = combinatorSelector.querySelectorAll('option');

      expect(options).toHaveLength(3);
      expect(options[0]).toHaveTextContent('AND');
      expect(options[1]).toHaveTextContent('OR');
      expect(options[2]).toHaveTextContent('XOR');
      expect(options[2]).toHaveValue('xor');
    });

    it('uses default labels from defaultCombinatorsExtended for string arrays', () => {
      setupWithStringArrays({ combinators: ['and', 'xor'] });

      const combinatorSelector = screen.getByTestId(TestID.combinators);
      const options = combinatorSelector.querySelectorAll('option');

      expect(options).toHaveLength(2);
      expect(options[0]).toHaveValue('and');
      expect(options[0]).toHaveTextContent('AND');
      expect(options[1]).toHaveValue('xor');
      expect(options[1]).toHaveTextContent('XOR');
    });
  });

  describe('operators prop with string arrays', () => {
    it('accepts array of operator strings', () => {
      setupWithStringArrays({ operators: ['=', '!=', 'contains'] });

      const operatorSelector = screen.getByTestId(TestID.operators);
      const options = operatorSelector.querySelectorAll('option');

      expect(options).toHaveLength(3);
      expect(options[0]).toHaveValue('=');
      expect(options[0]).toHaveTextContent('=');
      expect(options[1]).toHaveValue('!=');
      expect(options[1]).toHaveTextContent('!=');
      expect(options[2]).toHaveValue('contains');
      expect(options[2]).toHaveTextContent('contains');
    });

    it('uses default and custom labels from defaultOperators for string arrays', () => {
      setupWithStringArrays({
        // oxlint-disable-next-line no-explicit-any
        operators: ['beginsWith', 'doesNotContain', 'null', 'custom' as any],
      });

      const operatorSelector = screen.getByTestId(TestID.operators);
      const options = operatorSelector.querySelectorAll('option');

      expect(options).toHaveLength(4);
      expect(options[0]).toHaveValue('beginsWith');
      expect(options[0]).toHaveTextContent('begins with');
      expect(options[1]).toHaveValue('doesNotContain');
      expect(options[1]).toHaveTextContent('does not contain');
      expect(options[2]).toHaveValue('null');
      expect(options[2]).toHaveTextContent('is null');
      expect(options[3]).toHaveValue('custom');
      expect(options[3]).toHaveTextContent('custom');
    });

    it('uses default labels from defaultOperators for mixed string arrays', () => {
      setupWithStringArrays({ operators: ['between', 'notBetween'] });

      const operatorSelector = screen.getByTestId(TestID.operators);
      const options = operatorSelector.querySelectorAll('option');

      expect(options).toHaveLength(2);
      expect(options[0]).toHaveValue('between');
      expect(options[0]).toHaveTextContent('between');
      expect(options[1]).toHaveValue('notBetween');
      expect(options[1]).toHaveTextContent('not between');
    });
  });

  describe('getOperators function with string arrays', () => {
    it('accepts getOperators returning array of operator strings', () => {
      const getOperators = jest.fn((): DefaultOperatorName[] => ['=', 'contains']);
      setupWithStringArrays({ getOperators });

      expect(getOperators).toHaveBeenCalledWith('field1', { fieldData: expect.any(Object) });

      const operatorSelector = screen.getByTestId(TestID.operators);
      const options = operatorSelector.querySelectorAll('option');

      expect(options).toHaveLength(2);
      expect(options[0]).toHaveValue('=');
      expect(options[1]).toHaveValue('contains');
    });

    it('accepts getOperators returning FlexibleOption arrays', () => {
      const getOperators = jest.fn(() => [
        { name: '=', label: 'Custom Equals' },
        { name: 'contains', label: 'Custom Contains' },
      ]);
      setupWithStringArrays({ getOperators });

      const operatorSelector = screen.getByTestId(TestID.operators);
      const options = operatorSelector.querySelectorAll('option');

      expect(options).toHaveLength(2);
      expect(options[0]).toHaveTextContent('Custom Equals');
      expect(options[1]).toHaveTextContent('Custom Contains');
    });

    it('handles getOperators returning null', () => {
      const getOperators = jest.fn(() => null);
      setupWithStringArrays({ getOperators });

      // Should fall back to default operators
      const operatorSelector = screen.getByTestId(TestID.operators);
      const options = operatorSelector.querySelectorAll('option');

      expect(options.length).toBeGreaterThan(2);
    });
  });

  describe('field-level operators with string arrays', () => {
    it('accepts field operators as string arrays', async () => {
      const fieldsWithOperators: Field[] = [
        { name: 'field1', label: 'Field 1', operators: ['=', '!='] },
        { name: 'field2', label: 'Field 2', operators: ['contains', 'beginsWith'] },
      ];

      setupWithStringArrays({ fields: fieldsWithOperators });

      // Check field1 operators
      const operatorSelector = screen.getByTestId(TestID.operators);
      let options = operatorSelector.querySelectorAll('option');

      expect(options).toHaveLength(2);
      expect(options[0]).toHaveValue('=');
      expect(options[1]).toHaveValue('!=');

      // Switch to field2 and check its operators
      const fieldSelector = screen.getByTestId(TestID.fields);
      await user.selectOptions(fieldSelector, 'field2');

      options = operatorSelector.querySelectorAll('option');
      expect(options).toHaveLength(2);
      expect(options[0]).toHaveValue('contains');
      expect(options[1]).toHaveValue('beginsWith');
    });

    it('maintains backward compatibility with field-level FlexibleOption operators', async () => {
      const fieldsWithOperators: Field[] = [
        {
          name: 'field1',
          label: 'Field 1',
          operators: [
            { name: '=', label: 'Custom Equals' },
            { name: '!=', label: 'Custom Not Equals' },
          ],
        },
      ];

      setupWithStringArrays({ fields: fieldsWithOperators });

      const operatorSelector = screen.getByTestId(TestID.operators);
      const options = operatorSelector.querySelectorAll('option');

      expect(options).toHaveLength(2);
      expect(options[0]).toHaveTextContent('Custom Equals');
      expect(options[1]).toHaveTextContent('Custom Not Equals');
    });
  });

  describe('mixed arrays support', () => {
    it('handles mixed string and FlexibleOption arrays for fields', () => {
      setupWithStringArrays({
        fields: ['=', { name: '!=', label: 'Custom Not Equal' }, 'contains'],
      });

      const fieldSelector = screen.getByTestId(TestID.fields);
      const options = fieldSelector.querySelectorAll('option');

      expect(options).toHaveLength(3);
      expect(options[0]).toHaveValue('=');
      expect(options[0]).toHaveTextContent('='); // Should use default label
      expect(options[1]).toHaveValue('!=');
      expect(options[1]).toHaveTextContent('Custom Not Equal'); // Should use custom label
      expect(options[2]).toHaveValue('contains');
      expect(options[2]).toHaveTextContent('contains'); // Should use default label
    });

    it('handles mixed string and FlexibleOption arrays for operators', () => {
      setupWithStringArrays({
        operators: ['=', { name: '!=', label: 'Custom Not Equal' }, 'contains'],
      });

      const operatorSelector = screen.getByTestId(TestID.operators);
      const options = operatorSelector.querySelectorAll('option');

      expect(options).toHaveLength(3);
      expect(options[0]).toHaveValue('=');
      expect(options[0]).toHaveTextContent('='); // Should use default label
      expect(options[1]).toHaveValue('!=');
      expect(options[1]).toHaveTextContent('Custom Not Equal'); // Should use custom label
      expect(options[2]).toHaveValue('contains');
      expect(options[2]).toHaveTextContent('contains'); // Should use default label
    });

    it('handles mixed string and FlexibleOption arrays for combinators', () => {
      setupWithStringArrays({
        combinators: ['and', { name: 'or', label: 'Custom OR' }, 'xor'],
      });

      const combinatorSelector = screen.getByTestId(TestID.combinators);
      const options = combinatorSelector.querySelectorAll('option');

      expect(options).toHaveLength(3);
      expect(options[0]).toHaveValue('and');
      expect(options[0]).toHaveTextContent('AND'); // Should use default label
      expect(options[1]).toHaveValue('or');
      expect(options[1]).toHaveTextContent('Custom OR'); // Should use custom label
      expect(options[2]).toHaveValue('xor');
      expect(options[2]).toHaveTextContent('XOR'); // Should use default label
    });
  });

  describe('empty arrays handling', () => {
    it('handles empty combinator arrays gracefully', () => {
      setupWithStringArrays({ combinators: [] });

      const combinatorSelector = screen.getByTestId(TestID.combinators);
      const options = combinatorSelector.querySelectorAll('option');

      // Should have no options
      expect(options).toHaveLength(0);
    });

    it('handles empty operator arrays gracefully', () => {
      setupWithStringArrays({ operators: [] });

      const operatorSelector = screen.getByTestId(TestID.operators);
      const options = operatorSelector.querySelectorAll('option');

      // Should have no options
      expect(options).toHaveLength(0);
    });
  });
});
