import type {
  Field,
  FullCombinator,
  FullField,
  FullOperator,
  FullOption,
  ParseNumbersPropConfig,
  RuleGroupType,
  RuleGroupTypeIC,
  RuleType,
  ValidationMap,
} from '@react-querybuilder/core';
import {
  LogType,
  TestID,
  defaultPlaceholderFieldName,
  defaultValidator,
  findPath,
  generateID,
  getOption,
  standardClassnames as sc,
  defaultTranslations as t,
  toFullOption,
} from '@react-querybuilder/core';
import { consoleMocks, waitABeat } from '@rqb-testing';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
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
import { QueryBuilderContext } from './QueryBuilderContext';
import type { UseRuleGroup } from './RuleGroup';
import { RuleGroupHeaderComponents } from './RuleGroup';
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
    const onQueryChange = vi.fn<(q: RuleGroupType) => void>();
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
    const onQueryChange = vi.fn<(q: RuleGroupType) => void>();
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

describe('when base properties are provided', () => {
  it('includes base properties', async () => {
    const fieldSelectorReporter = vi.fn();
    const operatorSelectorReporter = vi.fn();
    const combinatorSelectorReporter = vi.fn();
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
  const rule: RuleType = { field: 'lastName', value: 'Another Test', operator: '=' };
  const query: RuleGroupType = { combinator: 'or', not: false, rules: [rule] };

  describe('when getInputType fn prop is provided', () => {
    it('invokes custom getInputType function', () => {
      const getInputType = vi.fn(() => 'text' as const);
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
});

describe('actions', () => {
  const fields: Field[] = [
    { name: 'field1', label: 'Field 1' },
    { name: 'field2', label: 'Field 2' },
    { name: 'field3', label: 'Field 3', valueEditorType: 'select' },
  ];

  const setup = (xp?: QueryBuilderProps<RuleGroupType, FullOption, FullOption, FullOption>) => {
    const onQueryChange = vi.fn<(q: RuleGroupType) => void>();
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
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({ rules: [{ value: 'value1' }] });
  });
});

// The policy these callbacks participate in (veto handling, replacement values, abort
// logging, disabled gating) is covered by `createQueryActions` in @react-querybuilder/core.
// These tests only assert the wiring: that each callback prop actually reaches the action
// layer from a real user interaction, and that its return value reaches `onQueryChange`.
describe('mutation callback wiring', () => {
  const emptyQuery: RuleGroupType = { combinator: 'and', rules: [] };
  const twoRules: RuleGroupType = {
    combinator: 'and',
    rules: [
      { field: 'f1', operator: '=', value: 'v1' },
      { field: 'f2', operator: '=', value: 'v2' },
    ],
  };
  const groupFirst: RuleGroupType = {
    combinator: 'and',
    rules: [
      { combinator: 'and', rules: [{ field: 'f3', operator: '=', value: 'v3' }] },
      { field: 'f1', operator: '=', value: 'v1' },
    ],
  };
  const twoGroups: RuleGroupType = {
    combinator: 'and',
    rules: [
      { combinator: 'and', rules: [{ field: 'f3', operator: '=', value: 'v3' }] },
      { combinator: 'and', rules: [{ field: 'f1', operator: '=', value: 'v1' }] },
    ],
  };

  const RuleGroupOG = defaultControlElements.ruleGroup;
  // Grouping is only reachable through drag-and-drop, so invoke the action directly.
  const groupingControlElements: ControlElementsProp<FullField, string> = {
    ruleGroup: props => (
      <React.Fragment>
        <button onClick={() => props.actions.groupRule([1], [0])}>groupIt</button>
        <RuleGroupOG {...props} />
      </React.Fragment>
    ),
  };

  const clickTestId = (testID: string) => () => user.click(screen.getAllByTestId(testID)[0]);
  const clickText = (text: string) => () => user.click(screen.getAllByText(text)[0]);

  type WiringCase = [
    callbackName: string,
    props: QueryBuilderProps<RuleGroupType, FullField, FullOperator, FullCombinator>,
    trigger: () => Promise<unknown>,
  ];

  const cases: WiringCase[] = [
    ['onAddRule', { defaultQuery: emptyQuery }, clickTestId(TestID.addRule)],
    ['onAddGroup', { defaultQuery: emptyQuery }, clickTestId(TestID.addGroup)],
    ['onRemove', { defaultQuery: twoRules }, clickTestId(TestID.removeRule)],
    [
      'onMoveRule',
      { defaultQuery: twoRules, showShiftActions: true },
      clickText(t.shiftActionDown.label),
    ],
    [
      'onMoveGroup',
      { defaultQuery: groupFirst, showShiftActions: true },
      clickText(t.shiftActionDown.label),
    ],
    [
      'onGroupRule',
      { defaultQuery: twoRules, controlElements: groupingControlElements },
      clickText('groupIt'),
    ],
    [
      'onGroupGroup',
      { defaultQuery: twoGroups, controlElements: groupingControlElements },
      clickText('groupIt'),
    ],
  ];

  it.each(cases)('invokes %s and honors its veto', async (callbackName, props, trigger) => {
    const onQueryChange = vi.fn<(q: RuleGroupType) => void>();
    const callback = vi.fn(() => false as const);
    render(
      <QueryBuilder
        onQueryChange={onQueryChange}
        enableMountQueryChange={false}
        {...props}
        {...{ [callbackName]: callback }}
      />
    );

    await trigger();
    expect(callback).toHaveBeenCalled();
    expect(onQueryChange).not.toHaveBeenCalled();
  });

  it.each(cases)('proceeds past %s when it approves', async (callbackName, props, trigger) => {
    const onQueryChange = vi.fn<(q: RuleGroupType) => void>();
    render(
      <QueryBuilder
        onQueryChange={onQueryChange}
        enableMountQueryChange={false}
        {...props}
        {...{ [callbackName]: () => true }}
      />
    );

    await trigger();
    expect(onQueryChange).toHaveBeenCalledTimes(1);
  });

  it('applies the replacement rule returned by onAddRule', async () => {
    const onQueryChange = vi.fn<(q: RuleGroupType) => void>();
    render(
      <QueryBuilder
        defaultQuery={emptyQuery}
        enableMountQueryChange={false}
        onAddRule={() => ({ field: 'f1', operator: '=', value: 'replaced' })}
        onQueryChange={onQueryChange}
      />
    );

    await user.click(screen.getByTestId(TestID.addRule));
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({ rules: [{ value: 'replaced' }] });
  });

  it('applies the replacement group returned by onAddGroup', async () => {
    const onQueryChange = vi.fn<(q: RuleGroupType) => void>();
    render(
      <QueryBuilder
        defaultQuery={emptyQuery}
        enableMountQueryChange={false}
        onAddGroup={() => ({ combinator: 'replaced', rules: [] })}
        onQueryChange={onQueryChange}
      />
    );

    await user.click(screen.getByTestId(TestID.addGroup));
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({
      rules: [{ combinator: 'replaced' }],
    });
  });

  it('applies the replacement query returned by onMoveRule', async () => {
    const onQueryChange = vi.fn<(q: RuleGroupType) => void>();
    const replacement: RuleGroupType = { combinator: 'and', rules: [] };
    render(
      <QueryBuilder
        defaultQuery={twoRules}
        enableMountQueryChange={false}
        showShiftActions
        onMoveRule={() => replacement}
        onQueryChange={onQueryChange}
      />
    );

    await user.click(screen.getAllByText(t.shiftActionDown.label)[0]);
    expect(onQueryChange).toHaveBeenLastCalledWith(replacement);
  });
});
describe('getDefaultValue prop', () => {
  it('sets the default value', async () => {
    const onQueryChange = vi.fn<(q: RuleGroupType) => void>();
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
    const onQueryChange = vi.fn<(q: RuleGroupType) => void>();
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
          const onQueryChange = vi.fn<(q: RuleGroupType) => void>();
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
            rules: [{ value: vals[typedValues.findIndex(tv => tv.typedValue === typedValue)] }],
          });
        });
      });
    }
  );

  it('parses numbers for "between" operator', async () => {
    const onQueryChange = vi.fn<(q: RuleGroupType) => void>();
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

describe('addRuleToNewGroups', () => {
  const query: RuleGroupType = { combinator: 'and', rules: [] };

  it('does not add a rule when the component is created', () => {
    render(<QueryBuilder query={query} addRuleToNewGroups />);
    expect(screen.queryByTestId(TestID.rule)).toBeNull();
  });

  it('adds a rule when a new group is created', async () => {
    const onQueryChange = vi.fn<(q: RuleGroupType) => void>();
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
    const onQueryChange = vi.fn<(q: RuleGroupType) => void>();
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
      const onQueryChange = vi.fn<(q: RuleGroupType) => void>();
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
      const onQueryChange = vi.fn<(q: RuleGroupType) => void>();
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
      const onQueryChange = vi.fn<(q: RuleGroupType) => void>();
      render(
        <QueryBuilder
          showShiftActions
          onQueryChange={onQueryChange}
          defaultQuery={{
            combinator: 'and',
            rules: [
              { field: 'lastName', operator: '=', value: 'Vai' },
              { combinator: 'or', rules: [{ field: 'firstName', operator: '=', value: 'Steve' }] },
            ],
          }}
        />
      );

      await user.click(screen.getAllByText(t.shiftActionUp.label)[1]);
      expect(onQueryChange).toHaveBeenCalledTimes(2);
      expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({
        combinator: 'and',
        rules: [
          { combinator: 'or', rules: [{ field: 'firstName', operator: '=', value: 'Steve' }] },
          { field: 'lastName', operator: '=', value: 'Vai' },
        ],
      });
    });
  });

  describe('independent combinators', () => {
    it('shifts rules with independent combinators', async () => {
      const onQueryChange = vi.fn<(q: RuleGroupTypeIC) => void>();
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
      const onQueryChange = vi.fn<(q: RuleGroupTypeIC) => void>();
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
      const onQueryChange = vi.fn<(q: RuleGroupTypeIC) => void>();
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
      const onQueryChange = vi.fn<(q: RuleGroupType) => void>();
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
      const onQueryChange = vi.fn<(q: RuleGroupType) => void>();
      render(
        <QueryBuilder
          showCloneButtons
          onQueryChange={onQueryChange}
          defaultQuery={{
            combinator: 'and',
            rules: [
              { combinator: 'or', rules: [{ field: 'firstName', operator: '=', value: 'Steve' }] },
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
      const onQueryChange = vi.fn<(q: RuleGroupTypeIC) => void>();
      render(
        <QueryBuilder
          showCloneButtons
          onQueryChange={onQueryChange}
          defaultQuery={{ rules: [{ field: 'firstName', operator: '=', value: 'Steve' }] }}
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
      const onQueryChange = vi.fn<(q: RuleGroupTypeIC) => void>();
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
      const onQueryChange = vi.fn<(q: RuleGroupTypeIC) => void>();
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

describe('independent combinators', () => {
  it('renders a rule group with independent combinators', () => {
    const onQueryChange = vi.fn<(q: RuleGroupTypeIC) => void>();
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
    const onQueryChange = vi.fn<(q: RuleGroupTypeIC) => void>();
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
    const onQueryChange = vi.fn<(q: RuleGroupTypeIC) => void>();
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
    const onQueryChange = vi.fn<(q: RuleGroupTypeIC) => void>();
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
    const validator = vi.fn(() => false);
    const valid = 'my-valid-class';
    const invalid = 'my-invalid-class';
    render(<QueryBuilder validator={validator} controlClassnames={{ valid, invalid }} />);
    expect(validator).toHaveBeenCalled();
    expect(screen.getByRole('form')).not.toHaveClass(sc.valid, valid);
    expect(screen.getByRole('form')).toHaveClass(sc.invalid, invalid);
  });

  it('uses custom validator function returning true', () => {
    const validator = vi.fn(() => true);
    const valid = 'my-valid-class';
    const invalid = 'my-invalid-class';
    render(<QueryBuilder validator={validator} controlClassnames={{ valid, invalid }} />);
    expect(validator).toHaveBeenCalled();
    expect(screen.getByRole('form')).toHaveClass(sc.valid, valid);
    expect(screen.getByRole('form')).not.toHaveClass(sc.invalid, invalid);
  });

  it('passes down validationMap to children', () => {
    const valMap: ValidationMap = { id: { valid: false, reasons: ['invalid'] } };
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
    const onQueryChange = vi.fn<(q: RuleGroupTypeIC) => void>();
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
            { combinator: 'and', rules: [{ field: 'age', operator: '>', value: 28 }] },
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

  it('prevents changes to a path-disabled node from rogue components', async () => {
    // `disabled={[[2]]}` used to be presentation-only: it disabled the controls but the action
    // handlers knew nothing about it, so anything calling them directly could still mutate a
    // path-disabled node. The paths are now threaded into core's guards.
    const onQueryChange = vi.fn();
    render(
      <QueryBuilder
        disabled={[[2]]}
        enableMountQueryChange={false}
        onQueryChange={onQueryChange}
        controlElements={{
          ruleGroupBodyElements: ({ actions }) => (
            <React.Fragment>
              <button onClick={() => actions.onPropChange('value', 'x', [2, 0])}>
                editDisabledDescendant
              </button>
              <button onClick={() => actions.onPropChange('combinator', 'or', [2])}>
                editDisabledGroup
              </button>
              <button
                onClick={() => actions.onRuleAdd({ field: 'f', operator: '=', value: '' }, [2])}>
                addToDisabledGroup
              </button>
              <button onClick={() => actions.onGroupRemove([2])}>removeDisabledGroup</button>
              <button onClick={() => actions.moveRule([2], [0])}>moveDisabledGroup</button>
            </React.Fragment>
          ),
        }}
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

    for (const label of [
      'editDisabledDescendant',
      'editDisabledGroup',
      'addToDisabledGroup',
      'removeDisabledGroup',
      'moveDisabledGroup',
    ]) {
      // The body elements render in every group, so target the root group's copy.
      await user.click(screen.getAllByText(label)[0]);
    }
    expect(onQueryChange).not.toHaveBeenCalled();
  });

  it('still allows changes to enabled siblings of a path-disabled node', async () => {
    const onQueryChange = vi.fn();
    render(
      <QueryBuilder
        disabled={[[2]]}
        enableMountQueryChange={false}
        onQueryChange={onQueryChange}
        controlElements={{
          ruleGroupBodyElements: ({ actions }) => (
            <button onClick={() => actions.onPropChange('value', 'x', [0])}>editEnabled</button>
          ),
        }}
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

    await user.click(screen.getByText('editEnabled'));
    expect(onQueryChange).toHaveBeenCalled();
  });

  it('prevents changes from rogue components when disabled', async () => {
    const onQueryChange = vi.fn<(q: RuleGroupTypeIC) => void>();
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
    const onQueryChange = vi.fn<(q: RuleGroupTypeIC) => void>();
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
        query={{ disabled: true, rules: [{ field: 'field0', operator: '=', value: '0' }] }}
      />
    );
    const rg = screen.getByTestId(TestID.ruleGroup);
    for (const b of rg.querySelectorAll('button')) {
      await user.click(b);
    }
    expect(onQueryChange).not.toHaveBeenCalled();
  });

  it('does not update the query when an ancestor group is disabled', async () => {
    const onQueryChange = vi.fn<(q: RuleGroupTypeIC) => void>();
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
            { disabled: true, rules: [{ field: 'field1', operator: '=', value: '1' }] },
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
    { name: 'f3', label: 'Field 3', valueSources: ['field'], comparator: () => false },
    // @ts-expect-error valueSources cannot be an empty array
    { name: 'f4', label: 'Field 4', valueSources: [] },
    { name: 'f5', label: 'Field 5', valueSources: ['field', 'value'] },
  ];
  const fieldsWithBetween: Field[] = [
    { name: 'fb', label: 'Field B', valueSources: ['field'], defaultOperator: 'between' },
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
    const onQueryChange = vi.fn<(q: RuleGroupType) => void>();
    render(
      <QueryBuilder fields={fieldsWithBetween} getDefaultField="fb" onQueryChange={onQueryChange} />
    );

    await user.click(screen.getByTestId(TestID.addRule));
    expect(screen.getAllByDisplayValue(fields.find(f => f.name !== 'fb')!.label)).toHaveLength(2);
    expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({ rules: [{ value: 'f1,f1' }] });
  });

  it('sets the right default value for "between" operator and listsAsArrays', async () => {
    const onQueryChange = vi.fn<(q: RuleGroupType) => void>();
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

describe('value source parameter', () => {
  const fields: Field[] = [
    { name: 'f1', label: 'Field 1', valueSources: ['parameter'] },
    { name: 'f2', label: 'Field 2', valueSources: ['parameter', 'value'] },
  ];
  const getParameters = () => [
    { name: 'p1', label: 'Param 1' },
    { name: 'p2', label: 'Param 2' },
  ];

  it('renders a select of parameters and defaults to the first', async () => {
    render(<QueryBuilder fields={fields} getDefaultField="f1" getParameters={getParameters} />);
    await user.click(screen.getByTestId(TestID.addRule));
    const valueEditor = screen.getByTestId(TestID.valueEditor);
    expect(valueEditor.tagName).toBe('SELECT');
    expect(valueEditor).toHaveValue('p1');
  });

  it('accepts free-form text when no parameters prop is provided', async () => {
    render(<QueryBuilder fields={fields} getDefaultField="f1" />);
    await user.click(screen.getByTestId(TestID.addRule));
    const valueEditor = screen.getByTestId(TestID.valueEditor);
    expect(valueEditor.tagName).toBe('INPUT');
  });

  it('renders a multiselect for "in"/"notIn" operators', async () => {
    render(
      <QueryBuilder
        fields={fields}
        getParameters={getParameters}
        defaultQuery={{
          combinator: 'and',
          rules: [{ field: 'f1', operator: 'in', value: '', valueSource: 'parameter' }],
        }}
      />
    );
    const valueEditor = screen.getByTestId(TestID.valueEditor);
    expect(valueEditor.tagName).toBe('SELECT');
    expect((valueEditor as HTMLSelectElement).multiple).toBe(true);
  });
});

describe('match modes', () => {
  const fields: Field[] = [{ name: 'tourDates', label: 'Tour dates', matchModes: true }];

  it('renders the match mode editor with invalid value', async () => {
    const onQueryChange = vi.fn<(q: RuleGroupType) => void>();
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
    const onQueryChange = vi.fn<(q: RuleGroupType) => void>();
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
    const onQueryChange = vi.fn<(q: RuleGroupType) => void>();
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
                { combinator: 'and', rules: [{ field: 'lastName', operator: '=', value: 'Vai' }] },
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
    const onQueryChange = vi.fn<(q: RuleGroupType) => void>();
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
                { combinator: 'and', rules: [{ field: 'lastName', operator: '=', value: 'Vai' }] },
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

describe('redux functions', () => {
  it('gets the query from the store', async () => {
    const onQueryChange = vi.fn<(q: RuleGroupType) => void>();
    const testFunc = vi.fn();
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
    const onQueryChange = vi.fn<(q: RuleGroupType) => void>();
    const immutableRule: RuleType = { field: 'this', operator: '=', value: 'should stay the same' };
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
  const queryTracker = vi.fn();
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
    const onLog = vi.fn();
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
    expect(onLog.mock.calls.at(-1)![0]).toMatchObject({ type: LogType.add });

    await user.selectOptions(screen.getByTestId(TestID.operators), '>');
    expect(onLog.mock.calls.at(-1)![0]).toMatchObject({ type: LogType.update });

    await user.click(screen.getByTestId(TestID.addRule));
    expect(onLog.mock.calls.at(-1)![0]).toMatchObject({ type: LogType.add });

    await user.click(screen.getByText('moveRule'));
    expect(onLog.mock.calls.at(-1)![0]).toMatchObject({ type: LogType.move });

    await user.click(screen.getAllByTestId(TestID.removeRule)[0]);
    expect(onLog.mock.calls.at(-1)![0]).toMatchObject({ type: LogType.remove });

    await user.click(screen.getByTestId(TestID.addGroup));
    expect(onLog.mock.calls.at(-1)![0]).toMatchObject({ type: LogType.add });

    await user.click(screen.getByTestId(TestID.removeGroup));
    expect(onLog.mock.calls.at(-1)![0]).toMatchObject({ type: LogType.remove });

    // Restore a second rule so that path [1] resolves; `groupRule` aborts on a stale path.
    await user.click(screen.getByTestId(TestID.addRule));
    expect(onLog.mock.calls.at(-1)![0]).toMatchObject({ type: LogType.add });

    await user.click(screen.getAllByText('groupRule')[0]);
    expect(onLog.mock.calls.at(-1)![0]).toMatchObject({ type: LogType.group });
  });

  it('logs failed additions and removals due to onAdd/Remove handlers', async () => {
    const onLog = vi.fn();
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
    const onLog = vi.fn();
    const defaultQuery: RuleGroupType = { disabled: true, combinator: 'and', rules: [] };
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
    const getQuery = (): RuleGroupType => ({ combinator: generateID(), rules: [] });
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
