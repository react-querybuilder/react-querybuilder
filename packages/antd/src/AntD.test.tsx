import { render, screen, within } from '@testing-library/react';
import moment from 'moment';
import {
  defaultNotToggleProps,
  defaultValueEditorProps,
  defaultValueSelectorProps,
  findInput,
  hasOrInheritsClass,
  testActionElement,
  testDragHandle,
  testValueEditor,
  userEventSetup,
} from 'react-querybuilder/genericTests';
import type {
  NameLabelPair,
  NotToggleProps,
  ValueEditorProps,
  ValueSelectorProps,
} from 'react-querybuilder/src';
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
  const user = userEventSetup();
  const testValues: NameLabelPair[] = props.values ?? props.options;
  const testVal = testValues[1];

  describe(title, () => {
    it('should render the correct number of options', async () => {
      render(<Component {...props} />);
      await user.click(screen.getByRole('combobox'));
      const listbox = within(screen.getByRole('listbox'));
      expect(listbox.getAllByRole('option')).toHaveLength(2);
    });

    it('should have the options passed into the <select />', async () => {
      render(<Component {...props} />);
      await user.click(screen.getByRole('combobox'));
      const listbox = within(screen.getByRole('listbox'));
      expect(listbox.getAllByRole('option')[1]).toHaveTextContent(testVal.name);
    });

    if (('values' in props && props.type === 'multiselect') || 'options' in props) {
      it('should have the values passed into the <select multiple />', () => {
        const value = testValues.map(v => v.name).join(',');
        const multiselectProps = 'values' in props ? { type: 'multiselect' } : { multiple: true };
        render(<Component {...props} value={value} {...multiselectProps} />);
        expect(
          screen.getByTitle(props.title).querySelectorAll('.ant-select-selection-item-content')
        ).toHaveLength(testValues.length);
      });
    }

    if (('values' in props && props.type !== 'multiselect') || 'options' in props) {
      it('should have the value passed into the <select />', () => {
        render(<Component {...props} value={testVal.name} />);
        expect(screen.getByTitle(props.title)).toHaveTextContent(testVal.label);
      });
    }

    it('should call the onChange method passed in', async () => {
      const handleOnChange = jest.fn();
      render(<Component {...props} handleOnChange={handleOnChange} />);
      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByText(testVal.label));
      expect(handleOnChange).toHaveBeenCalledWith(testVal.name);
    });

    it('should have the className passed into the <select />', () => {
      render(<Component {...props} className="foo" />);
      expect(screen.getByTitle(props.title)).toHaveClass('foo');
    });

    it('should render optgroups', async () => {
      const optGroups = [
        { label: 'Test Option Group', options: 'values' in props ? props.values : props.options },
      ];
      const newProps =
        'values' in props ? { ...props, values: optGroups } : { ...props, options: optGroups };
      render(<Component {...newProps} />);
      await user.click(screen.getByRole('combobox'));
      const listbox = within(screen.getByRole('listbox'));
      expect(listbox.getAllByRole('option').pop()).toHaveTextContent(testVal.name);
    });

    it('should be disabled by the disabled prop', async () => {
      const handleOnChange = jest.fn();
      render(<Component {...props} handleOnChange={handleOnChange} disabled />);
      expect(screen.getByRole('combobox')).toBeDisabled();
      await user.click(screen.getByRole('combobox'));
      expect(() => screen.getByRole('listbox')).toThrow();
      expect(handleOnChange).not.toHaveBeenCalled();
    });
  });
};

const notToggleTitle = AntDNotToggle.displayName;
describe(notToggleTitle, () => {
  const user = userEventSetup();
  const label = 'Not';
  const props: NotToggleProps = { ...defaultNotToggleProps, label, title: notToggleTitle };

  it('should have the value passed in', () => {
    render(<AntDNotToggle {...props} checked />);
    expect(screen.getByTitle(notToggleTitle)).toBeDefined();
  });

  it('should have the className passed into the <label />', () => {
    render(<AntDNotToggle {...props} className="foo" />);
    expect(screen.getByTitle(notToggleTitle)).toHaveClass('foo');
  });

  it('should call the onChange method passed in', async () => {
    const onChange = jest.fn();
    render(<AntDNotToggle {...props} handleOnChange={onChange} />);
    await user.click(screen.getByTitle(notToggleTitle));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('should be disabled by disabled prop', async () => {
    const onChange = jest.fn();
    render(<AntDNotToggle {...props} handleOnChange={onChange} disabled />);
    expect(screen.getByTitle(notToggleTitle)).toBeDisabled();
    await user.click(screen.getByTitle(notToggleTitle));
    expect(onChange).not.toHaveBeenCalled();
  });
});

const valueEditorTitle = AntDValueEditor.displayName;
describe(`${valueEditorTitle} as switch`, () => {
  const user = userEventSetup();
  const props: ValueEditorProps = {
    ...defaultValueEditorProps,
    title: valueEditorTitle,
    type: 'switch',
  };

  it('should have the value passed in', () => {
    render(<AntDValueEditor {...props} value />);
    expect(screen.getByTitle(valueEditorTitle)).toBeDefined();
  });

  it('should have the className passed into the <label />', () => {
    render(<AntDValueEditor {...props} className="foo" />);
    expect(screen.getByTitle(valueEditorTitle)).toHaveClass('foo');
  });

  it('should call the onChange method passed in', async () => {
    const onChange = jest.fn();
    render(<AntDValueEditor {...props} handleOnChange={onChange} />);
    await user.click(screen.getByTitle(valueEditorTitle));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('should be disabled by disabled prop', async () => {
    const onChange = jest.fn();
    render(<AntDValueEditor {...props} handleOnChange={onChange} disabled />);
    expect(screen.getByTitle(valueEditorTitle)).toBeDisabled();
    await user.click(screen.getByTitle(valueEditorTitle));
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe(`${valueEditorTitle} date/time pickers`, () => {
  const user = userEventSetup();
  const props: ValueEditorProps = { ...defaultValueEditorProps, title: valueEditorTitle };
  const today = moment().format(moment.HTML5_FMT.DATE);
  const tomorrow = moment().add(1, 'day').format(moment.HTML5_FMT.DATE);
  // const rightNow = moment().format('HH:mm');

  it('should render a date picker', async () => {
    const onChange = jest.fn();
    const { container } = render(
      <AntDValueEditor {...props} inputType="date" handleOnChange={onChange} />
    );
    await user.click(findInput(container));
    await user.click(screen.getByTitle(today));
    expect(onChange).toHaveBeenCalledWith(today);
  });

  it('should render a date picker with a preset value', async () => {
    const { container } = render(<AntDValueEditor {...props} inputType="date" value={today} />);
    await user.click(findInput(container));
    expect(screen.getAllByTitle(today).find(el => el.tagName !== 'INPUT')).toHaveClass(
      'ant-picker-cell-selected'
    );
  });

  it('should render a date range picker', async () => {
    const onChange = jest.fn();
    const { container } = render(
      <AntDValueEditor {...props} inputType="date" operator="between" handleOnChange={onChange} />
    );
    await user.click(findInput(container));
    await user.click(screen.getAllByTitle(today)[0]);
    await user.click(screen.getAllByTitle(tomorrow)[0]);
    expect(onChange).toHaveBeenCalledWith(`${today},${tomorrow}`);
  });

  it('should render a date range picker with a preset value', async () => {
    const { container } = render(
      <AntDValueEditor
        {...props}
        inputType="date"
        operator="between"
        value={`${today},${tomorrow}`}
      />
    );
    await user.click(findInput(container));
    expect(screen.getAllByTitle(today).find(el => el.tagName !== 'INPUT')).toHaveClass(
      'ant-picker-cell-range-start'
    );
    expect(screen.getAllByTitle(tomorrow).find(el => el.tagName !== 'INPUT')).toHaveClass(
      'ant-picker-cell-range-end'
    );
  });

  it('should render a datetime picker', async () => {
    const onChange = jest.fn();
    const { container } = render(
      <AntDValueEditor {...props} inputType="datetime-local" handleOnChange={onChange} />
    );
    await user.click(findInput(container));
    await user.click(screen.getByTitle(today));
    for (const el of screen.getAllByText('02')) {
      await user.click(el);
    }
    await user.click(screen.getByText(/ok/i));
    expect(onChange).toHaveBeenCalledWith(`${today} 02:02:02`);
  });

  it('should render a time picker', async () => {
    const onChange = jest.fn();
    const { container } = render(
      <AntDValueEditor {...props} inputType="time" handleOnChange={onChange} />
    );
    await user.click(findInput(container));
    for (const el of screen.getAllByText('02')) {
      await user.click(el);
    }
    await user.click(screen.getByText(/ok/i));
    expect(onChange).toHaveBeenCalledWith('02:02:02');
  });

  it('should render a time picker with a preset value', async () => {
    const { container } = render(
      <AntDValueEditor {...props} inputType="time" value={'02:02:02'} />
    );
    await user.click(findInput(container));
    for (const n of screen.getAllByText('02')) {
      expect(hasOrInheritsClass(n, 'ant-picker-time-panel-cell-selected')).toBe(true);
    }
  });

  it('should render a time picker with a preset value and clear the value', async () => {
    const onChange = jest.fn();
    const { container } = render(
      <AntDValueEditor {...props} inputType="time" handleOnChange={onChange} value={'02:02:02'} />
    );
    await user.click(container.querySelector('.ant-picker-clear')!);
    expect(onChange).toHaveBeenCalledWith('');
  });
});

testActionElement(AntDActionElement);
testDragHandle(AntDDragHandle);
testValueEditor(AntDValueEditor, {
  multiselect: true,
  select: true,
  switch: true,
  betweenSelect: true,
});
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
