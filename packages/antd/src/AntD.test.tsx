import { act, fireEvent, render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import moment from 'moment';
import {
  NameLabelPair,
  NotToggleProps,
  ValueEditorProps,
  ValueSelectorProps,
} from 'react-querybuilder';
import {
  defaultNotToggleProps,
  defaultValueEditorProps,
  defaultValueSelectorProps,
  findInput,
  hasOrInheritsClass,
  testActionElement,
  testDragHandle,
  testValueEditor,
} from 'react-querybuilder/genericTests';
import {
  AntDActionElement,
  AntDDragHandle,
  AntDNotToggle,
  AntDValueEditor,
  AntDValueSelector,
} from '.';

const antdValueSelectorProps: ValueSelectorProps = {
  ...defaultValueSelectorProps,
  title: AntDValueSelector.displayName,
};
const antdValueEditorProps: ValueEditorProps = {
  ...defaultValueEditorProps,
  type: 'select',
  title: AntDValueEditor.displayName,
  values: defaultValueSelectorProps.options,
};

const testAntDValueSelector = (
  title: string,
  Component: React.ComponentType<ValueEditorProps> | React.ComponentType<ValueSelectorProps>,
  props: any
) => {
  const testValues: NameLabelPair[] = props.values ?? props.options;
  const testVal = testValues[1];

  describe(title, () => {
    it('should render the correct number of options', async () => {
      const { getByRole } = render(<Component {...props} />);
      await act(async () => {
        userEvent.click(getByRole('combobox'));
        await new Promise(r => setTimeout(r, 500));
      });
      const listbox = within(getByRole('listbox'));
      expect(listbox.getAllByRole('option')).toHaveLength(2);
    });

    it('should have the options passed into the <select />', async () => {
      const { getByRole } = render(<Component {...props} />);
      await act(async () => {
        userEvent.click(getByRole('combobox'));
        await new Promise(r => setTimeout(r, 500));
      });
      const listbox = within(getByRole('listbox'));
      expect(listbox.getAllByRole('option')[1]).toHaveTextContent(testVal.name);
    });

    if (('values' in props && props.type === 'multiselect') || 'options' in props) {
      it('should have the values passed into the <select multiple />', () => {
        const value = testValues.map(v => v.name).join(',');
        const multiselectProps = 'values' in props ? { type: 'multiselect' } : { multiple: true };
        const { getByTitle } = render(<Component {...props} value={value} {...multiselectProps} />);
        expect(
          getByTitle(props.title).querySelectorAll('.ant-select-selection-item-content')
        ).toHaveLength(testValues.length);
      });
    }

    if (('values' in props && props.type !== 'multiselect') || 'options' in props) {
      it('should have the value passed into the <select />', () => {
        const { getByTitle } = render(<Component {...props} value={testVal.name} />);
        expect(getByTitle(props.title)).toHaveTextContent(testVal.label);
      });
    }

    it('should call the onChange method passed in', async () => {
      const handleOnChange = jest.fn();
      const { getByRole, getByText } = render(
        <Component {...props} handleOnChange={handleOnChange} />
      );
      await act(async () => {
        userEvent.click(getByRole('combobox'));
        await new Promise(r => setTimeout(r, 500));
      });
      // Using fireEvent.click here instead of userEvent.click
      // because antd sets `pointer-events: none` on the options.
      fireEvent.click(getByText(testVal.label));
      expect(handleOnChange).toHaveBeenCalledWith(testVal.name);
    });

    it('should have the className passed into the <select />', () => {
      const { getByTitle } = render(<Component {...props} className="foo" />);
      expect(getByTitle(props.title)).toHaveClass('foo');
    });

    it('should render optgroups', async () => {
      const optGroups = [
        { label: 'Test Option Group', options: 'values' in props ? props.values : props.options },
      ];
      const newProps =
        'values' in props ? { ...props, values: optGroups } : { ...props, options: optGroups };
      const { getByRole } = render(<Component {...newProps} />);
      await act(async () => {
        userEvent.click(getByRole('combobox'));
        await new Promise(r => setTimeout(r, 500));
      });
      const listbox = within(getByRole('listbox'));
      expect(listbox.getAllByRole('option')).toHaveLength(3);
      expect(listbox.getAllByRole('option')[2]).toHaveTextContent(testVal.name);
    });

    it('should be disabled by the disabled prop', () => {
      const handleOnChange = jest.fn();
      const { getByRole } = render(
        <Component {...props} handleOnChange={handleOnChange} disabled />
      );
      expect(getByRole('combobox')).toBeDisabled();
      userEvent.click(getByRole('combobox'));
      expect(() => getByRole('listbox')).toThrow();
      expect(handleOnChange).not.toHaveBeenCalled();
    });
  });
};

const notToggleTitle = AntDNotToggle.displayName;
describe(notToggleTitle, () => {
  const label = 'Not';
  const props: NotToggleProps = { ...defaultNotToggleProps, label, title: notToggleTitle };

  it('should have the value passed in', () => {
    const { getByTitle } = render(<AntDNotToggle {...props} checked />);
    expect(getByTitle(notToggleTitle)).toBeDefined();
  });

  it('should have the className passed into the <label />', () => {
    const { getByTitle } = render(<AntDNotToggle {...props} className="foo" />);
    expect(getByTitle(notToggleTitle)).toHaveClass('foo');
  });

  it('should call the onChange method passed in', () => {
    const onChange = jest.fn();
    const { getByTitle } = render(<AntDNotToggle {...props} handleOnChange={onChange} />);
    userEvent.click(getByTitle(notToggleTitle));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('should be disabled by disabled prop', () => {
    const onChange = jest.fn();
    const { getByTitle } = render(<AntDNotToggle {...props} handleOnChange={onChange} disabled />);
    expect(getByTitle(notToggleTitle)).toBeDisabled();
    userEvent.click(getByTitle(notToggleTitle));
    expect(onChange).not.toHaveBeenCalled();
  });
});

const valueEditorTitle = AntDValueEditor.displayName;
describe(`${valueEditorTitle} as switch`, () => {
  const props: ValueEditorProps = {
    ...defaultValueEditorProps,
    title: valueEditorTitle,
    type: 'switch',
  };

  it('should have the value passed in', () => {
    const { getByTitle } = render(<AntDValueEditor {...props} value />);
    expect(getByTitle(valueEditorTitle)).toBeDefined();
  });

  it('should have the className passed into the <label />', () => {
    const { getByTitle } = render(<AntDValueEditor {...props} className="foo" />);
    expect(getByTitle(valueEditorTitle)).toHaveClass('foo');
  });

  it('should call the onChange method passed in', () => {
    const onChange = jest.fn();
    const { getByTitle } = render(<AntDValueEditor {...props} handleOnChange={onChange} />);
    userEvent.click(getByTitle(valueEditorTitle));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('should be disabled by disabled prop', () => {
    const onChange = jest.fn();
    const { getByTitle } = render(
      <AntDValueEditor {...props} handleOnChange={onChange} disabled />
    );
    expect(getByTitle(valueEditorTitle)).toBeDisabled();
    userEvent.click(getByTitle(valueEditorTitle));
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe(`${valueEditorTitle} date/time pickers`, () => {
  const props: ValueEditorProps = { ...defaultValueEditorProps, title: valueEditorTitle };
  const today = moment().format(moment.HTML5_FMT.DATE);
  const tomorrow = moment().add(1, 'day').format(moment.HTML5_FMT.DATE);
  // const rightNow = moment().format('HH:mm');

  const turnOffPointerEventsNone = () =>
    ((document.body.querySelector('.ant-picker-dropdown') as HTMLDivElement).style.pointerEvents =
      'auto');

  it('should render a date picker', async () => {
    const onChange = jest.fn();
    const { container, getByTitle } = render(
      <AntDValueEditor {...props} inputType="date" handleOnChange={onChange} />
    );
    await act(async () => {
      userEvent.click(findInput(container));
      await new Promise(r => setTimeout(r, 500));
    });
    turnOffPointerEventsNone();
    userEvent.click(getByTitle(today));
    expect(onChange).toHaveBeenCalledWith(today);
  });

  it('should render a date picker with a preset value', async () => {
    const { container, getAllByTitle } = render(
      <AntDValueEditor {...props} inputType="date" value={today} />
    );
    await act(async () => {
      userEvent.click(findInput(container));
      await new Promise(r => setTimeout(r, 500));
    });
    expect(getAllByTitle(today).find(el => el.tagName !== 'INPUT')).toHaveClass(
      'ant-picker-cell-selected'
    );
  });

  it('should render a date range picker', async () => {
    const onChange = jest.fn();
    const { container, getByTitle } = render(
      <AntDValueEditor {...props} inputType="date" operator="between" handleOnChange={onChange} />
    );
    await act(async () => {
      userEvent.click(findInput(container));
      await new Promise(r => setTimeout(r, 500));
    });
    turnOffPointerEventsNone();
    userEvent.click(getByTitle(today));
    userEvent.click(getByTitle(tomorrow));
    expect(onChange).toHaveBeenCalledWith(`${today},${tomorrow}`);
  });

  it('should render a date range picker with a preset value', async () => {
    const { container, getAllByTitle } = render(
      <AntDValueEditor
        {...props}
        inputType="date"
        operator="between"
        value={`${today},${tomorrow}`}
      />
    );
    await act(async () => {
      userEvent.click(findInput(container));
      await new Promise(r => setTimeout(r, 500));
    });
    expect(getAllByTitle(today).find(el => el.tagName !== 'INPUT')).toHaveClass(
      'ant-picker-cell-range-start'
    );
    expect(getAllByTitle(tomorrow).find(el => el.tagName !== 'INPUT')).toHaveClass(
      'ant-picker-cell-range-end'
    );
  });

  it('should render a datetime picker', async () => {
    const onChange = jest.fn();
    const { container, getByText, getByTitle, getAllByText } = render(
      <AntDValueEditor {...props} inputType="datetime-local" handleOnChange={onChange} />
    );
    await act(async () => {
      userEvent.click(findInput(container));
      await new Promise(r => setTimeout(r, 500));
    });
    turnOffPointerEventsNone();
    userEvent.click(getByTitle(today));
    getAllByText('02').forEach(el => userEvent.click(el));
    userEvent.click(getByText('Ok'));
    expect(onChange).toHaveBeenCalledWith(`${today} 02:02:02`);
  });

  it('should render a time picker', async () => {
    const onChange = jest.fn();
    const { container, getByText, getAllByText } = render(
      <AntDValueEditor {...props} inputType="time" handleOnChange={onChange} />
    );
    await act(async () => {
      userEvent.click(findInput(container));
      await new Promise(r => setTimeout(r, 500));
    });
    turnOffPointerEventsNone();
    getAllByText('02').forEach(el => userEvent.click(el));
    userEvent.click(getByText('Ok'));
    expect(onChange).toHaveBeenCalledWith('02:02');
  });

  it('should render a time picker with a preset value', async () => {
    const { container, getAllByText } = render(
      <AntDValueEditor {...props} inputType="time" value={'02:02'} />
    );
    await act(async () => {
      userEvent.click(findInput(container));
      await new Promise(r => setTimeout(r, 500));
    });
    getAllByText('02').forEach(n => hasOrInheritsClass(n, 'ant-picker-time-panel-cell-selected'));
  });

  it('should render a time picker with a preset value and clear the value', async () => {
    const onChange = jest.fn();
    const { container } = render(
      <AntDValueEditor {...props} inputType="time" handleOnChange={onChange} value={'02:02'} />
    );
    userEvent.click(container.querySelector('.ant-picker-clear')!);
    expect(onChange).toHaveBeenCalledWith('');
  });
});

testActionElement(AntDActionElement);
testDragHandle(AntDDragHandle);
testValueEditor(AntDValueEditor, { multiselect: true, select: true, switch: true });
const valueEditorAsSelectTitle = `${antdValueEditorProps.title} (as ValueSelector)`;
testAntDValueSelector(valueEditorAsSelectTitle, AntDValueEditor, {
  ...antdValueEditorProps,
  title: valueEditorAsSelectTitle,
});
const valueEditorAsMultiselectTitle = `${antdValueEditorProps.title} (as ValueSelector multiselect)`;
testAntDValueSelector(valueEditorAsMultiselectTitle, AntDValueEditor, {
  ...antdValueEditorProps,
  title: valueEditorAsMultiselectTitle,
  type: 'multiselect',
});
testAntDValueSelector(antdValueSelectorProps.title!, AntDValueSelector, antdValueSelectorProps);
