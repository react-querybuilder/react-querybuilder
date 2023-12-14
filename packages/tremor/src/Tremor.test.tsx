import { render, screen } from '@testing-library/react';
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
  testDragHandle,
  testShiftActions,
  testValueEditor,
  userEventSetup,
} from 'react-querybuilder/genericTests';
import { TremorActionElement } from './TremorActionElement';
import { TremorDragHandle } from './TremorDragHandle';
import { TremorNotToggle } from './TremorNotToggle';
import { TremorShiftActions } from './TremorShiftActions';
import { TremorValueEditor } from './TremorValueEditor';
import { TremorValueSelector } from './TremorValueSelector';
import { QueryBuilderTremor } from './index';

const user = userEventSetup();

testActionElement(TremorActionElement);
testDragHandle(TremorDragHandle);
// testNotToggle(TremorNotToggle);
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

const valueEditorAsMultiselectProps: ValueEditorProps = {
  field: 'TEST',
  fieldData: { name: 'TEST', label: 'Test' },
  operator: '=',
  handleOnChange: () => {},
  level: 0,
  path: [],
  valueSource: 'value',
  schema: {
    ...basicSchema,
    controls: { ...basicSchema.controls, valueSelector: TremorValueSelector },
  },
  type: 'multiselect',
  values: defaultValueSelectorProps.options,
  rule: { field: '', operator: '', value: '' },
};

const testSelect = (
  title: string,
  Component: React.ComponentType<ValueEditorProps> | React.ComponentType<ValueSelectorProps>,
  props: any
) => {
  const testValues = toFullOptionList(props.values ?? props.options) as FullOption[];
  const testVal = testValues[1];

  describe(title, () => {
    it('should render the correct number of options', async () => {
      render(<Component {...props} />);
      await user.click(screen.getByRole('button'));
      expect(screen.getByRole('listbox').querySelectorAll('li')).toHaveLength(testValues.length);
      expect(screen.getAllByRole('option')).toHaveLength(testValues.length);
    });

    it('should flatten optgroups', async () => {
      const optGroups = [
        { label: 'Test Option Group', options: 'values' in props ? props.values : props.options },
      ];
      const newProps =
        'values' in props ? { ...props, values: optGroups } : { ...props, options: optGroups };
      render(<Component {...newProps} />);
      await user.click(screen.getByRole('button'));
      expect(() => screen.getByRole('group')).toThrow();
      expect(screen.getByRole('listbox').querySelectorAll('li')).toHaveLength(testValues.length);
      expect(screen.getAllByRole('option')).toHaveLength(testValues.length);
    });

    // Test as multiselect for <TremorValueEditor type="multiselect" /> and <ValueSelector />
    if (('values' in props && props.type === 'multiselect') || 'options' in props) {
      it('should have the values passed into the <select multiple />', async () => {
        const onChange = jest.fn();
        const value = testValues.map(v => v.name).join(',');
        const multiselectProps = 'values' in props ? { type: 'multiselect' } : { multiple: true };
        render(
          <Component {...props} value={value} {...multiselectProps} handleOnChange={onChange} />
        );
        for (const { label } of testValues) {
          expect(screen.getByText(label)).toBeInTheDocument();
        }
        await user.click(screen.getAllByRole('button')[0]);
        for (const opt of screen.getAllByRole('option')) {
          expect(opt.querySelector('input')).toBeChecked();
        }
      });

      it('should call the handleOnChange callback properly for <select multiple />', async () => {
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

      it('should respect the listsAsArrays option', async () => {
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
        await user.click(screen.getByText(testVal.label));
        expect(onChange).toHaveBeenCalledWith([testVal.name]);
      });
    }

    // Test as single-value selector
    if (('values' in props && props.type !== 'multiselect') || 'options' in props) {
      it('should have the value passed into the <select />', async () => {
        render(<Component {...props} value={testVal.name} />);
        expect(screen.getByText(testVal.label)).toBeInTheDocument();
      });
    }

    it('should have the className passed into the <select />', () => {
      render(<Component {...props} className="foo" />);
      expect(hasOrInheritsClass(screen.getAllByRole('button')[0], 'foo')).toBe(true);
    });

    it('should call the onChange method passed in', async () => {
      const onChange = jest.fn();
      render(<Component {...props} handleOnChange={onChange} />);
      await user.click(screen.getByRole('button'));
      await user.click(screen.getByText(testVal.label));
      expect(onChange).toHaveBeenCalledWith(testVal.name);
    });

    it('should be disabled by the disabled prop', async () => {
      const onChange = jest.fn();
      render(<Component {...props} handleOnChange={onChange} disabled />);
      expect(screen.getByRole('button')).toBeDisabled();
      await user.click(screen.getByRole('button'));
      expect(() => screen.getByText(testVal.label)).toThrow();
      expect(onChange).not.toHaveBeenCalled();
    });
  });
};

describe('TremorNotToggle', () => {
  const label = 'Not';
  const props = { ...defaultNotToggleProps, label };

  it('should have the value passed into the <input />', () => {
    render(<TremorNotToggle {...props} checked />);
    expect(findInput(screen.getByLabelText(label).parentElement!)).toBeChecked();
  });

  it('should have the className passed into the <label />', () => {
    render(<TremorNotToggle {...props} className="foo" />);
    expect(hasOrInheritsClass(screen.getByLabelText(label), 'foo')).toBe(true);
  });

  it('should call the onChange method passed in', async () => {
    const onChange = jest.fn();
    render(<TremorNotToggle {...props} handleOnChange={onChange} />);
    await user.click(screen.getByLabelText(label));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('should be disabled by disabled prop', async () => {
    const onChange = jest.fn();
    render(<TremorNotToggle {...props} handleOnChange={onChange} disabled />);
    const notToggle = screen.getByLabelText(label);
    expect(notToggle).toBeDisabled();
    await user.click(notToggle);
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

  it('should render the "between" selects', () => {
    render(<TremorValueEditor {...betweenSelectProps} />);
    const betweenSelects = screen.getAllByRole('button').filter((_b, i) => !(i % 2));
    expect(betweenSelects).toHaveLength(2);
    expect(betweenSelects[0]).toHaveTextContent('Test 1');
    expect(betweenSelects[1]).toHaveTextContent('Test 2');
  });

  // it('should assume empty values array if not provided', () => {
  //   render(<TremorValueEditor {...betweenSelectProps} values={undefined} />);
  //   const betweenSelects = screen.getAllByRole('button').filter((_b, i) => !(i % 2));
  //   expect(betweenSelects).toHaveLength(2);
  //   expect(betweenSelects[0].querySelectorAll('li')).toHaveLength(0);
  //   expect(betweenSelects[1].querySelectorAll('li')).toHaveLength(0);
  // });

  it('should call the onChange handler', async () => {
    const handleOnChange = jest.fn();
    render(<TremorValueEditor {...betweenSelectProps} handleOnChange={handleOnChange} />);
    const betweenSelects = (
      Array.from(document.getElementsByClassName(standardClassnames.valueListItem)) as HTMLElement[]
    ).map(e => e.querySelector('button')!);
    expect(betweenSelects).toHaveLength(2);
    await user.click(betweenSelects[0]);
    await user.click(screen.getAllByText(betweenSelectProps.values[1].label)[0]);
    await user.click(betweenSelects[1]);
    await user.click(screen.getAllByText(betweenSelectProps.values[0].label)[1]);
    expect(handleOnChange).toHaveBeenNthCalledWith(1, 'test2,test2');
    expect(handleOnChange).toHaveBeenNthCalledWith(2, 'test1,test1');
  });

  it('should assume the second value if not provided', async () => {
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
    await user.click(screen.getAllByText(betweenSelectProps.values[1].label)[0]);
    expect(handleOnChange).toHaveBeenNthCalledWith(1, 'test2,test1');
  });

  it('should call the onChange handler with lists as arrays', async () => {
    const handleOnChange = jest.fn();
    render(
      <TremorValueEditor {...betweenSelectProps} handleOnChange={handleOnChange} listsAsArrays />
    );
    const betweenSelects = (
      Array.from(document.getElementsByClassName(standardClassnames.valueListItem)) as HTMLElement[]
    ).map(e => e.querySelector('button')!);
    expect(betweenSelects).toHaveLength(2);
    await user.click(betweenSelects[0]);
    await user.click(screen.getAllByText(betweenSelectProps.values[1].label)[0]);
    await user.click(betweenSelects[1]);
    await user.click(screen.getAllByText(betweenSelectProps.values[0].label)[1]);
    expect(handleOnChange).toHaveBeenNthCalledWith(1, ['test2', 'test2']);
    expect(handleOnChange).toHaveBeenNthCalledWith(2, ['test1', 'test1']);
  });

  it('should be disabled by the disabled prop', async () => {
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

testSelect('TremorValueSelector', TremorValueSelector, defaultValueSelectorProps);
testSelect('TremorValueEditor', TremorValueEditor, valueEditorAsMultiselectProps);

it('renders with composition', () => {
  render(
    <QueryBuilderTremor>
      <QueryBuilder />
    </QueryBuilderTremor>
  );
  expect(screen.getByTestId(TestID.addRule)).toBeInTheDocument();
});
