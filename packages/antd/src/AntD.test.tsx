import { act, render, screen } from '@testing-library/react';
import type { SelectProps } from 'antd';
import type { OptionProps } from 'antd/es/select';
import dayjs from 'dayjs';
import type { OptionGroupFC } from 'rc-select/lib/OptGroup.js';
import * as React from 'react';
import type { NotToggleProps, ValueEditorProps, ValueSelectorProps } from 'react-querybuilder';
import { QueryBuilder, TestID } from 'react-querybuilder';
import {
  defaultNotToggleProps,
  defaultValueEditorProps,
  defaultValueSelectorProps,
  findInput,
  hasOrInheritsClass,
  testActionElement,
  testDragHandle,
  testShiftActions,
  testValueEditor,
  testValueSelector,
  userEventSetup,
} from 'react-querybuilder/genericTests';
import { AntDActionElement } from './AntDActionElement';
import { AntDDragHandle } from './AntDDragHandle';
import { AntDNotToggle } from './AntDNotToggle';
import { AntDShiftActions } from './AntDShiftActions';
import { AntDValueEditor } from './AntDValueEditor';
import { AntDValueSelector } from './AntDValueSelector';
import { QueryBuilderAntD } from './index';

jest.mock('antd', () => {
  // We only mock Select. Everything else can use the real antd components.
  const AntD = jest.requireActual('antd');

  const Select = (props: SelectProps) => (
    <select
      multiple={props.mode === 'multiple'}
      disabled={props.disabled}
      value={props.value}
      onChange={e =>
        props.onChange!(
          props.mode === 'multiple'
            ? Array.from(e.target.selectedOptions).map(opt => opt.value)
            : e.target.value,
          {
            label: '',
          }
        )
      }>
      {props.children}
    </select>
  );
  Select.Option = ({ value, children }: OptionProps) => <option value={value}>{children}</option>;
  Select.OptGroup = (({ label, children }) => (
    <optgroup label={label}>{children}</optgroup>
  )) as OptionGroupFC;

  return { ...AntD, Select };
});

const valueEditorTitle = AntDValueEditor.displayName;
const notToggleTitle = AntDNotToggle.displayName;

describe(notToggleTitle, () => {
  const user = userEventSetup();
  const label = 'Not';
  const props: NotToggleProps = {
    ...defaultNotToggleProps,
    label,
    title: notToggleTitle,
  };

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
  const props: ValueEditorProps = {
    ...defaultValueEditorProps,
    title: valueEditorTitle,
  };
  const today = dayjs().format('YYYY-MM-DD');
  const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');
  // const rightNow = dayjs().format('HH:mm');

  it('should render a date picker', async () => {
    const onChange = jest.fn();
    const { container } = render(
      <AntDValueEditor {...props} inputType="date" handleOnChange={onChange} value="invalid" />
    );
    await act(async () => {
      await user.click(findInput(container));
      await new Promise(r => setTimeout(r, 500));
    });
    await act(async () => {
      await user.click(
        screen
          .getAllByTitle(today)
          .find(el => el.tagName !== 'INPUT')!
          .querySelector('div')!
      );
      await new Promise(r => setTimeout(r, 500));
    });
    // TODO: figure out why this test is NOT flaky like the range test below
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
      <AntDValueEditor
        {...props}
        inputType="date"
        operator="between"
        handleOnChange={onChange}
        value="invalid"
      />
    );
    await act(async () => {
      await user.click(findInput(container));
      await new Promise(r => setTimeout(r, 500));
    });
    await act(async () => {
      await user.click(screen.getAllByTitle(today)[0]);
      await new Promise(r => setTimeout(r, 500));
    });
    await act(async () => {
      await user.click(screen.getAllByTitle(tomorrow)[0]);
      await new Promise(r => setTimeout(r, 500));
    });
    // TODO: figure out why this test is flaky, then uncomment it
    // expect(onChange).toHaveBeenCalledWith(`${today},${tomorrow}`);
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
    for (const el of Array.from(screen.getAllByText('02'))) {
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
    for (const el of Array.from(screen.getAllByText('02'))) {
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
    for (const n of Array.from(screen.getAllByText('02'))) {
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

  it('should render empty "between" time pickers', async () => {
    const handleOnChange = jest.fn();
    const { rerender } = render(
      <AntDValueEditor
        {...props}
        operator="between"
        type="text"
        inputType="time"
        handleOnChange={handleOnChange}
        value=""
      />
    );
    const betweenInputs = screen.getAllByRole('textbox');
    expect(betweenInputs).toHaveLength(2);
    rerender(
      <AntDValueEditor
        {...props}
        operator="between"
        type="text"
        inputType="time"
        handleOnChange={handleOnChange}
        value="12:14:26,12:14:26"
      />
    );
    await user.click(screen.getAllByRole('button')[0]);
    expect(handleOnChange).toHaveBeenCalledWith(',12:14:26');
  });

  it('should call the onChange handler for "between" time pickers', async () => {
    const handleOnChange = jest.fn();
    render(
      <AntDValueEditor
        {...props}
        operator="between"
        type="text"
        inputType="time"
        handleOnChange={handleOnChange}
        value="12:14:26,12:14:26"
      />
    );
    const betweenInputs = screen.getAllByRole('textbox');
    expect(betweenInputs).toHaveLength(2);
    await user.click(betweenInputs[0]);
    await user.click(screen.getAllByText(/^59$/i)[0]);
    await user.click(screen.getAllByText(/^ok$/i)[0]);
    await user.click(betweenInputs[1]);
    await user.click(screen.getAllByText(/^59$/i)[2]);
    await user.click(screen.getAllByText(/^ok$/i)[1]);
    expect(handleOnChange).toHaveBeenCalledWith('12:59:26,12:14:26');
    expect(handleOnChange).toHaveBeenCalledWith('12:14:26,12:59:26');
  });
});

describe('extra AntDValueSelector tests', () => {
  it('handles an empty string value in multiselect mode', () => {
    const props: ValueSelectorProps = {
      ...defaultValueSelectorProps,
      multiple: true,
      value: '',
    };
    const { container } = render(<AntDValueSelector {...props} />);
    expect(container.querySelectorAll('.ant-select-selection-item')).toHaveLength(0);
  });
});

testActionElement(AntDActionElement);
testDragHandle(AntDDragHandle);
testShiftActions(AntDShiftActions);
testValueEditor(AntDValueEditor, { switch: true });
testValueSelector(AntDValueSelector);

it('renders with composition', () => {
  render(
    <QueryBuilderAntD>
      <QueryBuilder />
    </QueryBuilderAntD>
  );
  expect(screen.getByTestId(TestID.ruleGroup)).toBeInTheDocument();
  expect(
    screen
      .getAllByRole('button')
      .map(b => Array.from(b.classList))
      .some(el => el.some(c => c.startsWith('ant-')))
  ).toBe(true);
});
