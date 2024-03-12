import { render, screen } from '@testing-library/react';
import dayjs from 'dayjs';
import * as React from 'react';
import type { FullOption, ValueEditorProps, ValueSelectorProps } from 'react-querybuilder';
import {
  QueryBuilder,
  TestID,
  standardClassnames,
  toFullOption,
  toFullOptionList,
} from 'react-querybuilder';
import {
  basicSchema,
  defaultNotToggleProps,
  defaultValueEditorProps,
  findInput,
  hasOrInheritsClass,
  testActionElement,
  testShiftActions,
  testValueEditor,
  userEventSetup,
} from 'react-querybuilder/genericTests/index';
import { TremorActionElement } from './TremorActionElement';
import { TremorNotToggle } from './TremorNotToggle';
import { TremorShiftActions } from './TremorShiftActions';
import { TremorValueEditor } from './TremorValueEditor';
import { TremorValueSelector } from './TremorValueSelector';
import { QueryBuilderTremor } from './index';

const user = userEventSetup();

const getAllByText = (text: string) =>
  screen.getAllByText(text).filter(el => !hasOrInheritsClass(el, 'hidden'));
const getAllByRole = (text: string) =>
  screen
    .getAllByRole(text)
    .filter(el => !hasOrInheritsClass(el, 'hidden') && !el.classList.contains('opacity-0'));

testActionElement(TremorActionElement);
testShiftActions(TremorShiftActions);
testValueEditor(TremorValueEditor, {
  multiselect: true,
  select: true,
  switch: true,
  betweenSelect: true,
});

const defaultValueSelectorProps: ValueSelectorProps = {
  handleOnChange: () => {},
  options: [
    { name: 'foo', label: 'Foo' },
    { name: 'bar', label: 'Bar' },
    { name: 'baz', label: 'Baz' },
  ].map(toFullOption),
  level: 0,
  path: [],
  schema: basicSchema,
};

const valueEditorAsSelectProps: ValueEditorProps = {
  field: 'TEST',
  fieldData: toFullOption({ name: 'TEST', label: 'Test' }),
  operator: '=',
  handleOnChange: () => {},
  level: 0,
  path: [],
  valueSource: 'value',
  schema: basicSchema,
  type: 'select',
  values: defaultValueSelectorProps.options,
  rule: { field: '', operator: '', value: '' },
};

const testSelect = (
  title: string,
  Component: React.ComponentType<ValueEditorProps> | React.ComponentType<ValueSelectorProps>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: any
) => {
  const testValues = toFullOptionList(props.values ?? props.options) as FullOption[];
  const testVal = testValues[1];

  describe(title, () => {
    it('renders the correct number of options', async () => {
      render(<Component {...props} />);
      await user.click(screen.getByRole('button'));
      expect(getAllByRole('listbox')).toHaveLength(1);
      expect(getAllByRole('listbox')[0].querySelectorAll('li')).toHaveLength(testValues.length);
      expect(getAllByRole('option')).toHaveLength(testValues.length);
    });

    it('flattens optgroups', async () => {
      const optGroups = [
        { label: 'Test Option Group', options: 'values' in props ? props.values : props.options },
      ];
      const newProps =
        'values' in props ? { ...props, values: optGroups } : { ...props, options: optGroups };
      render(<Component {...newProps} />);
      await user.click(screen.getByRole('button'));
      // TODO: is this really necessary?
      expect(() => screen.getByRole('group')).toThrow();
      expect(getAllByRole('listbox')).toHaveLength(1);
      expect(getAllByRole('listbox')[0].querySelectorAll('li')).toHaveLength(testValues.length);
      expect(getAllByRole('option')).toHaveLength(testValues.length);
    });

    // Test as multiselect for <TremorValueEditor type="multiselect" /> and <ValueSelector />
    if (('values' in props && props.type === 'multiselect') || 'options' in props) {
      it('has the values passed into the <select multiple />', async () => {
        const onChange = jest.fn();
        const value = testValues.map(v => v.name).join(',');
        const multiselectProps = 'values' in props ? { type: 'multiselect' } : { multiple: true };
        render(
          <Component {...props} value={value} {...multiselectProps} handleOnChange={onChange} />
        );
        for (const { label } of testValues) {
          expect(getAllByText(label)).toHaveLength(1);
          expect(getAllByText(label)[0]).toBeInTheDocument();
        }
        await user.click(getAllByRole('button')[0]);
        for (const opt of getAllByRole('option')) {
          expect(opt.querySelector('input')).toBeChecked();
        }
      });

      it('calls the handleOnChange callback properly for <select multiple />', async () => {
        const onChange = jest.fn();
        const multiselectProps = 'values' in props ? { type: 'multiselect' } : { multiple: true };
        const allLabelsExceptFirst = testValues.slice(1, 3).map(v => v.label);
        const allValuesExceptFirst = testValues.slice(1, 3).map(v => v.name);
        render(
          <Component
            {...props}
            {...multiselectProps}
            value={allValuesExceptFirst[0]}
            handleOnChange={onChange}
          />
        );
        await user.click(screen.getAllByRole('button')[0]);
        for (const label of allLabelsExceptFirst) {
          await user.click(screen.getAllByText(label).at(-1)!);
        }
        expect(onChange).toHaveBeenCalledWith(allValuesExceptFirst.join(','));
      });

      it('respects the listsAsArrays option', async () => {
        const onChange = jest.fn();
        const multiselectProps = 'values' in props ? { type: 'multiselect' } : { multiple: true };
        render(
          <Component
            {...props}
            {...multiselectProps}
            handleOnChange={onChange}
            listsAsArrays
            value={[]}
          />
        );
        await user.click(screen.getAllByRole('button')[0]);
        expect(getAllByText(testVal.label)).toHaveLength(1);
        await user.click(getAllByText(testVal.label)[0]);
        expect(onChange).toHaveBeenCalledWith([testVal.name]);
      });
    }

    // Test as single-value selector
    if (('values' in props && props.type !== 'multiselect') || 'options' in props) {
      it('has the value passed into the <select />', async () => {
        render(<Component {...props} value={testVal.name} />);
        expect(getAllByText(testVal.label)).toHaveLength(1);
        expect(getAllByText(testVal.label)[0]).toBeInTheDocument();
      });
    }

    it('has the className passed into the <select />', () => {
      render(<Component {...props} className="foo" />);
      expect(hasOrInheritsClass(screen.getAllByRole('button')[0], 'foo')).toBe(true);
    });

    it('calls the onChange method passed in', async () => {
      const onChange = jest.fn();
      render(<Component {...props} handleOnChange={onChange} />);
      await user.click(screen.getByRole('button'));
      expect(getAllByText(testVal.label)).toHaveLength(1);
      await user.click(getAllByText(testVal.label)[0]);
      expect(onChange).toHaveBeenCalledWith(testVal.name);
    });

    it('is disabled by the disabled prop', async () => {
      const onChange = jest.fn();
      render(<Component {...props} handleOnChange={onChange} disabled />);
      expect(screen.getByRole('button')).toBeDisabled();
      await user.click(screen.getByRole('button'));
      expect(getAllByText(testVal.label)).toHaveLength(0);
      expect(onChange).not.toHaveBeenCalled();
    });
  });
};

describe('TremorNotToggle', () => {
  const label = 'Not';
  const props = { ...defaultNotToggleProps, label };

  it('has the value passed into the <input />', () => {
    render(<TremorNotToggle {...props} checked />);
    expect(findInput(screen.getByLabelText(label).parentElement!)).toBeChecked();
  });

  it('has the className passed into the <label />', () => {
    render(<TremorNotToggle {...props} className="foo" />);
    expect(hasOrInheritsClass(screen.getByLabelText(label), 'foo')).toBe(true);
  });

  it('calls the onChange method passed in', async () => {
    const onChange = jest.fn();
    render(<TremorNotToggle {...props} handleOnChange={onChange} />);
    await user.click(screen.getByLabelText(label));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('is disabled by disabled prop', async () => {
    const onChange = jest.fn();
    render(<TremorNotToggle {...props} handleOnChange={onChange} disabled />);
    const notToggle = screen.getByLabelText(label);
    expect(notToggle).toBeDisabled();
    await user.click(notToggle);
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('TremorValueEditor as switch', () => {
  const props: ValueEditorProps = { ...defaultValueEditorProps, type: 'switch' };

  it('has the value passed into the <input />', () => {
    render(<TremorValueEditor {...props} value />);
    expect(findInput(document.body)).toBeChecked();
  });

  it('has the className passed into the <label />', () => {
    render(<TremorValueEditor {...props} className="foo" />);
    expect(hasOrInheritsClass(findInput(document.body), 'foo')).toBe(true);
  });

  it('calls the handleOnChange method passed in', async () => {
    const onChange = jest.fn();
    render(<TremorValueEditor {...props} handleOnChange={onChange} />);
    await user.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('is disabled by disabled prop', async () => {
    const onChange = jest.fn();
    render(<TremorValueEditor {...props} handleOnChange={onChange} disabled />);
    const valueEditor = screen.getByRole('switch');
    expect(valueEditor).toBeDisabled();
    await user.click(valueEditor);
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('TremorValueEditor as "between" select', () => {
  const betweenSelectProps = {
    ...defaultValueEditorProps,
    operator: 'between',
    type: 'select',
    value: 'test1,test2',
    values: [
      { name: 'test1', label: 'Test 1' },
      { name: 'test2', label: 'Test 2' },
    ],
  } satisfies ValueEditorProps;

  it('renders the "between" selects', () => {
    render(<TremorValueEditor {...betweenSelectProps} />);
    const betweenSelects = screen.getAllByRole('button').filter((_b, i) => !(i % 2));
    expect(betweenSelects).toHaveLength(2);
    expect(betweenSelects[0]).toHaveTextContent('Test 1');
    expect(betweenSelects[1]).toHaveTextContent('Test 2');
  });

  it('calls the onChange handler', async () => {
    const handleOnChange = jest.fn();
    render(<TremorValueEditor {...betweenSelectProps} handleOnChange={handleOnChange} />);
    const betweenSelects = (
      Array.from(document.getElementsByClassName(standardClassnames.valueListItem)) as HTMLElement[]
    ).map(e => e.querySelector('button')!);
    expect(betweenSelects).toHaveLength(2);
    await user.click(betweenSelects[0]);
    await user.click(getAllByText(betweenSelectProps.values[1].label)[0]);
    await user.click(betweenSelects[1]);
    await user.click(getAllByText(betweenSelectProps.values[0].label)[1]);
    expect(handleOnChange).toHaveBeenNthCalledWith(1, 'test2,test2');
    expect(handleOnChange).toHaveBeenNthCalledWith(2, 'test1,test1');
  });

  it('assumes the second value if not provided', async () => {
    const handleOnChange = jest.fn();
    render(
      <TremorValueEditor
        {...betweenSelectProps}
        handleOnChange={handleOnChange}
        value={['test1']}
      />
    );
    const betweenSelects = (
      Array.from(document.getElementsByClassName(standardClassnames.valueListItem)) as HTMLElement[]
    ).map(e => e.querySelector('button')!);
    expect(betweenSelects).toHaveLength(2);
    await user.click(betweenSelects[0]);
    await user.click(getAllByText(betweenSelectProps.values[1].label)[0]);
    expect(handleOnChange).toHaveBeenNthCalledWith(1, 'test2,test1');
  });

  it('calls the onChange handler with lists as arrays', async () => {
    const handleOnChange = jest.fn();
    render(
      <TremorValueEditor {...betweenSelectProps} handleOnChange={handleOnChange} listsAsArrays />
    );
    const betweenSelects = (
      Array.from(document.getElementsByClassName(standardClassnames.valueListItem)) as HTMLElement[]
    ).map(e => e.querySelector('button')!);
    expect(betweenSelects).toHaveLength(2);
    await user.click(betweenSelects[0]);
    await user.click(getAllByText(betweenSelectProps.values[1].label)[0]);
    await user.click(betweenSelects[1]);
    await user.click(getAllByText(betweenSelectProps.values[0].label)[1]);
    expect(handleOnChange).toHaveBeenNthCalledWith(1, ['test2', 'test2']);
    expect(handleOnChange).toHaveBeenNthCalledWith(2, ['test1', 'test1']);
  });

  it('is disabled by the disabled prop', async () => {
    const handleOnChange = jest.fn();
    render(<TremorValueEditor {...betweenSelectProps} handleOnChange={handleOnChange} disabled />);
    const betweenSelects = screen.getAllByRole('button').filter((_b, i) => !(i % 2));
    expect(betweenSelects).toHaveLength(2);
    for (const r of betweenSelects) {
      expect(r).toBeDisabled();
      await user.click(r);
    }
    expect(handleOnChange).not.toHaveBeenCalled();
  });
});

describe('TremorValueEditor as date picker', () => {
  const props = defaultValueEditorProps;
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const dateStub = `${year}-${month}-`;

  it('renders value editor as date editor', async () => {
    const handleOnChange = jest.fn();
    render(<TremorValueEditor {...props} inputType="date" handleOnChange={handleOnChange} />);
    await user.click(screen.getByRole('button'));
    await user.click(screen.getByText('10'));
    expect(handleOnChange).toHaveBeenCalledWith(`${dateStub}10`);
  });

  it('handles preloaded dates and clearing value as date editor', async () => {
    const handleOnChange = jest.fn();
    const dateString = '2002-12-14';
    render(
      <TremorValueEditor
        {...props}
        inputType="date"
        value={dateString}
        handleOnChange={handleOnChange}
      />
    );
    const button = screen.getByText(dayjs(dateString).format('MMM D, YYYY'));
    await user.click(button);
    const day = screen.getByText('16');
    await user.click(day);
    expect(handleOnChange).toHaveBeenCalledWith('2002-12-16');
  });

  it('calls handleOnChange for first date in range editor', async () => {
    const handleOnChange = jest.fn();
    render(
      <TremorValueEditor
        {...props}
        inputType="date"
        operator="between"
        handleOnChange={handleOnChange}
      />
    );
    await user.click(screen.getByRole('button'));
    await user.click(screen.getByText('10'));
    expect(handleOnChange).toHaveBeenCalledWith(`${dateStub}10,`);
  });

  it('calls handleOnChange for second date in range editor', async () => {
    const handleOnChange = jest.fn();
    render(
      <TremorValueEditor
        {...props}
        inputType="date"
        operator="between"
        handleOnChange={handleOnChange}
        value={[`${dateStub}10`, '']}
      />
    );
    await user.click(screen.getAllByRole('button')[0]);
    await user.click(screen.getByText('20'));
    expect(handleOnChange).toHaveBeenCalledWith(`${dateStub}10,${dateStub}20`);
  });

  it('calls handleOnChange as date range editor with listsAsArrays', async () => {
    const handleOnChange = jest.fn();
    render(
      <TremorValueEditor
        {...props}
        listsAsArrays
        inputType="date"
        operator="between"
        handleOnChange={handleOnChange}
      />
    );
    await user.click(screen.getByRole('button'));
    await user.click(screen.getByText('12'));
    expect(handleOnChange).toHaveBeenCalledWith([`${dateStub}12`, '']);
    await user.click(screen.getByText('14'));
    expect(handleOnChange).toHaveBeenCalledWith([`${dateStub}14`, '']);
  });

  it('handles preloaded values as date range editor', async () => {
    const handleOnChange = jest.fn();
    render(
      <TremorValueEditor
        {...props}
        inputType="date"
        operator="between"
        handleOnChange={handleOnChange}
        value={`${dateStub}12,${dateStub}14`}
      />
    );
    await user.click(screen.getAllByRole('button')[0]);
    await user.click(screen.getByText('16'));
    expect(handleOnChange).toHaveBeenCalledWith(`${dateStub}12,${dateStub}16`);
  });

  it('handles invalid dates', async () => {
    const handleOnChange = jest.fn();
    render(
      <TremorValueEditor
        {...props}
        inputType="date"
        operator="between"
        handleOnChange={handleOnChange}
        value={`invalid,datevalue`}
      />
    );
    expect(screen.getByText(dayjs().format('MMM D, YYYY'))).toBeInTheDocument();
  });
});

testSelect('TremorValueSelector', TremorValueSelector, defaultValueSelectorProps);
testSelect('TremorValueEditor as select', TremorValueEditor, valueEditorAsSelectProps);
testSelect('TremorValueEditor as multiselect', TremorValueEditor, {
  ...valueEditorAsSelectProps,
  type: 'multiselect',
});

it('renders with composition', () => {
  render(
    <QueryBuilderTremor>
      <QueryBuilder />
    </QueryBuilderTremor>
  );
  expect(screen.getByTestId(TestID.addRule)).toBeInTheDocument();
});
