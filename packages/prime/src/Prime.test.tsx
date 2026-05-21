import {
  defaultNotToggleProps,
  defaultValueEditorProps,
  defaultValueSelectorProps,
  testActionElement,
  testDragHandle,
  testShiftActions,
  testValueEditor,
  testValueSelector,
  userEventSetup,
} from '@rqb-testing';
import { render, screen } from '@testing-library/react';
import * as React from 'react';
import type { NotToggleProps, ValueEditorProps, ValueSelectorProps } from 'react-querybuilder';
import { QueryBuilder, TestID } from 'react-querybuilder';
import { QueryBuilderPrime } from './index';
import { PrimeActionElement } from './PrimeActionElement';
import { PrimeDragHandle } from './PrimeDragHandle';
import { PrimeNotToggle } from './PrimeNotToggle';
import { PrimeShiftActions } from './PrimeShiftActions';
import { PrimeValueEditor } from './PrimeValueEditor';
import { PrimeValueSelector } from './PrimeValueSelector';

// Mock Dropdown to render a native <select> for testability
vi.mock('primereact/dropdown', () => {
  const toOpts = (arr: { name: string; label: string; disabled?: boolean }[]) =>
    arr.map(o => (
      <option key={o.name} value={o.name} disabled={o.disabled}>
        {o.label}
      </option>
    ));

  // oxlint-disable-next-line typescript/no-explicit-any
  const Dropdown = (props: any) => {
    const options = props.options ?? [];
    const groupChildrenKey = props.optionGroupChildren;
    const hasGroups = groupChildrenKey && options.length > 0 && groupChildrenKey in options[0];

    return (
      <select
        title={props.title}
        className={props.className}
        disabled={props.disabled}
        value={props.value ?? ''}
        onChange={e => props.onChange?.({ value: e.target.value })}>
        {hasGroups
          ? // oxlint-disable-next-line typescript/no-explicit-any
            options.map((group: any) => (
              <optgroup key={group.label} label={group.label}>
                {toOpts(group[groupChildrenKey])}
              </optgroup>
            ))
          : toOpts(
              options.map((o: { name: string; label: string }) => ({
                name: o.name ?? o[props.optionValue as 'name'],
                label: o.label ?? o[props.optionLabel as 'label'],
              }))
            )}
      </select>
    );
  };

  return { Dropdown };
});

// Mock MultiSelect to render a native <select multiple> for testability
vi.mock('primereact/multiselect', () => {
  const toOpts = (arr: { name: string; label: string; disabled?: boolean }[]) =>
    arr.map(o => (
      <option key={o.name} value={o.name} disabled={o.disabled}>
        {o.label}
      </option>
    ));

  // oxlint-disable-next-line typescript/no-explicit-any
  const MultiSelect = (props: any) => {
    const options = props.options ?? [];
    const groupChildrenKey = props.optionGroupChildren;
    const hasGroups = groupChildrenKey && options.length > 0 && groupChildrenKey in options[0];

    return (
      <select
        title={props.title}
        className={props.className}
        disabled={props.disabled}
        multiple
        value={props.value ?? []}
        onChange={e =>
          props.onChange?.({ value: [...e.target.selectedOptions].map(o => o.value) })
        }>
        {hasGroups
          ? // oxlint-disable-next-line typescript/no-explicit-any
            options.map((group: any) => (
              <optgroup key={group.label} label={group.label}>
                {toOpts(group[groupChildrenKey])}
              </optgroup>
            ))
          : toOpts(options)}
      </select>
    );
  };

  return { MultiSelect };
});

// Mock Calendar for testability
vi.mock('primereact/calendar', () => {
  // oxlint-disable-next-line typescript/no-explicit-any
  const Calendar = (props: any) => (
    <input
      type="text"
      title={props.title}
      className={props.className}
      disabled={props.disabled}
      placeholder={props.placeholder}
      data-testid={props['data-testid']}
      data-time-only={props.timeOnly ? 'true' : undefined}
      data-show-time={props.showTime ? 'true' : undefined}
      data-selection-mode={props.selectionMode}
      value={props.value ? String(props.value) : ''}
      onChange={e => {
        // Simulate date change with a real Date object
        const d = new Date(e.target.value || '2024-01-15');
        if (props.selectionMode === 'range') {
          const d2 = new Date('2024-01-16');
          props.onChange?.({ value: [d, d2] });
        } else {
          props.onChange?.({ value: d });
        }
      }}
    />
  );
  return { Calendar };
});

// Mock InputSwitch for testability
vi.mock('primereact/inputswitch', () => {
  // oxlint-disable-next-line typescript/no-explicit-any
  const InputSwitch = (props: any) => (
    <button
      type="button"
      title={props.title}
      className={props.className}
      disabled={props.disabled}
      role="switch"
      aria-checked={!!props.checked}
      onClick={() => !props.disabled && props.onChange?.({ value: !props.checked })}>
      {props.checked ? 'On' : 'Off'}
    </button>
  );
  return { InputSwitch };
});

// Mock InputNumber for testability
vi.mock('primereact/inputnumber', () => {
  // oxlint-disable-next-line typescript/no-explicit-any
  const InputNumber = (props: any) => (
    <input
      type="number"
      title={props.title}
      className={props.className}
      disabled={props.disabled}
      placeholder={props.placeholder}
      data-testid={props['data-testid']}
      value={props.value ?? ''}
      onChange={e => {
        const val = e.target.value === '' ? null : Number(e.target.value);
        props.onValueChange?.({ value: val });
      }}
    />
  );
  return { InputNumber };
});

const notToggleTitle = 'PrimeNotToggle';
const valueEditorTitle = 'PrimeValueEditor';

describe(notToggleTitle, () => {
  const user = userEventSetup();
  const label = 'Not';
  const props: NotToggleProps = { ...defaultNotToggleProps, label, title: notToggleTitle };

  it('has the value passed in', () => {
    render(<PrimeNotToggle {...props} checked />);
    expect(screen.getByTitle(notToggleTitle)).toBeDefined();
  });

  it('has the className passed into the <label />', () => {
    render(<PrimeNotToggle {...props} className="foo" />);
    expect(screen.getByTitle(notToggleTitle)).toHaveClass('foo');
  });

  it('calls the onChange method passed in', async () => {
    const onChange = vi.fn();
    render(<PrimeNotToggle {...props} handleOnChange={onChange} />);
    await user.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('is disabled by disabled prop', async () => {
    const onChange = vi.fn();
    render(<PrimeNotToggle {...props} handleOnChange={onChange} disabled />);
    expect(screen.getByRole('switch')).toBeDisabled();
    await user.click(screen.getByRole('switch'));
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe(`${valueEditorTitle} as switch`, () => {
  const user = userEventSetup();
  const props: ValueEditorProps = {
    ...defaultValueEditorProps,
    title: valueEditorTitle,
    type: 'switch',
  };

  it('has the value passed in', () => {
    render(<PrimeValueEditor {...props} value />);
    expect(screen.getByTitle(valueEditorTitle)).toBeDefined();
  });

  it('has the className passed in', () => {
    render(<PrimeValueEditor {...props} className="foo" />);
    expect(screen.getByTitle(valueEditorTitle)).toHaveClass('foo');
  });

  it('calls the onChange method passed in', async () => {
    const onChange = vi.fn();
    render(<PrimeValueEditor {...props} handleOnChange={onChange} />);
    await user.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('is disabled by disabled prop', async () => {
    const onChange = vi.fn();
    render(<PrimeValueEditor {...props} handleOnChange={onChange} disabled />);
    expect(screen.getByRole('switch')).toBeDisabled();
    await user.click(screen.getByRole('switch'));
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe(`${valueEditorTitle} date/time pickers`, () => {
  const user = userEventSetup();
  const props: ValueEditorProps = { ...defaultValueEditorProps, title: valueEditorTitle };

  it('renders a date picker', async () => {
    const onChange = vi.fn();
    render(<PrimeValueEditor {...props} inputType="date" handleOnChange={onChange} value="" />);
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, '2024-01-15');
    expect(onChange).toHaveBeenCalled();
  });

  it('renders a date picker with preset value', () => {
    render(<PrimeValueEditor {...props} inputType="date" value="2024-01-15" />);
    expect(screen.getByRole('textbox')).toBeDefined();
  });

  it('renders a datetime picker', async () => {
    const onChange = vi.fn();
    render(
      <PrimeValueEditor {...props} inputType="datetime-local" handleOnChange={onChange} value="" />
    );
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, '2024-01-15T10:30:00');
    expect(onChange).toHaveBeenCalled();
  });

  it('renders a time picker', async () => {
    const onChange = vi.fn();
    render(<PrimeValueEditor {...props} inputType="time" handleOnChange={onChange} value="" />);
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, '10:30:00');
    expect(onChange).toHaveBeenCalled();
  });

  it('renders a time picker with preset value', () => {
    render(<PrimeValueEditor {...props} inputType="time" value="10:30:00" />);
    expect(screen.getByRole('textbox')).toBeDefined();
  });

  it('renders a date range picker for between operator', async () => {
    const onChange = vi.fn();
    render(
      <PrimeValueEditor
        {...props}
        inputType="date"
        operator="between"
        handleOnChange={onChange}
        value=""
      />
    );
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, '2024-01-15');
    expect(onChange).toHaveBeenCalled();
  });

  it('renders "between" time pickers', () => {
    render(
      <PrimeValueEditor
        {...props}
        operator="between"
        type="text"
        inputType="time"
        handleOnChange={vi.fn()}
        value="10:00:00,12:00:00"
      />
    );
    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(2);
  });

  it('handles between time picker changes', async () => {
    const handleOnChange = vi.fn();
    render(
      <PrimeValueEditor
        {...props}
        operator="between"
        type="text"
        inputType="time"
        handleOnChange={handleOnChange}
        value="10:00:00,12:00:00"
      />
    );
    const inputs = screen.getAllByRole('textbox');
    await user.clear(inputs[0]);
    await user.type(inputs[0], '11:00:00');
    expect(handleOnChange).toHaveBeenCalled();
  });
});

describe('extra PrimeValueSelector tests', () => {
  it('handles multiselect mode', () => {
    const props: ValueSelectorProps = { ...defaultValueSelectorProps, multiple: true, value: '' };
    render(<PrimeValueSelector {...props} />);
    expect(screen.getByRole('listbox')).toBeDefined();
  });

  it('handles multiselect with option groups', () => {
    const props: ValueSelectorProps = {
      ...defaultValueSelectorProps,
      multiple: true,
      value: 'opt1',
      options: [
        { label: 'Group 1', options: [{ name: 'opt1', value: 'opt1', label: 'Option 1' }] },
        { label: 'Group 2', options: [{ name: 'opt2', value: 'opt2', label: 'Option 2' }] },
      ],
    };
    render(<PrimeValueSelector {...props} />);
    const listbox = screen.getByRole('listbox');
    expect(listbox.querySelectorAll('optgroup')).toHaveLength(2);
  });
});

testActionElement(PrimeActionElement);
testDragHandle(PrimeDragHandle);
testShiftActions(PrimeShiftActions);
testValueEditor(PrimeValueEditor, { switch: true });
testValueSelector(PrimeValueSelector, { disabledOptions: true });

it('renders with composition', () => {
  render(
    <QueryBuilderPrime>
      <QueryBuilder />
    </QueryBuilderPrime>
  );
  expect(screen.getByTestId(TestID.ruleGroup)).toBeInTheDocument();
});
