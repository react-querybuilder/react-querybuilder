import { render, screen } from '@testing-library/react';
import type {
  Option,
  OptionGroup,
  Schema,
  ValueEditorProps,
  VersatileSelectorProps,
} from 'react-querybuilder';
import { QueryBuilder, TestID } from 'react-querybuilder';
import {
  testActionElement,
  testNotToggle,
  testValueEditor,
  userEventSetup,
} from 'react-querybuilder/genericTests';
import { QueryBuilderMantine } from './index';
import { MantineActionElement } from './MantineActionElement';
import { MantineNotToggle } from './MantineNotToggle';
import { MantineValueEditor } from './MantineValueEditor';
import { MantineValueSelector } from './MantineValueSelector';
import { optionListMapNameToValue } from './utils';

declare global {
  // eslint-disable-next-line no-var
  var __RQB_DEV__: boolean;
}
globalThis.__RQB_DEV__ = true;

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

testActionElement(MantineActionElement);
testNotToggle(MantineNotToggle);
testValueEditor(MantineValueEditor, { select: true, multiselect: true, betweenSelect: true });

const user = userEventSetup();

const options: Option[] = [
  { name: 'opt1', label: 'Option 1' },
  { name: 'opt2', label: 'Option 2' },
];

const now = new Date();
const year = now.getFullYear();
const month = `${now.getMonth() + 1}`.padStart(2, '0');
const dateStub = `${year}-${month}-`;

describe('MantineValueSelector', () => {
  (window as any).ResizeObserver = ResizeObserver;
  const props: VersatileSelectorProps = {
    testID: TestID.fields,
    options,
    path: [0],
    level: 1,
    schema: {} as Schema,
    handleOnChange: () => {},
  };

  it('handles single select', async () => {
    const handleOnChange = jest.fn();
    const { rerender } = render(
      <MantineValueSelector {...props} handleOnChange={handleOnChange} />
    );
    await user.click(screen.getByTestId(TestID.fields));
    await user.click(screen.getByText('Option 2'));
    expect(handleOnChange).toHaveBeenNthCalledWith(1, 'opt2');
    rerender(
      <MantineValueSelector
        {...props}
        handleOnChange={handleOnChange}
        value={'opt2'}
        listsAsArrays
        clearable
      />
    );
    await user.click(screen.getByRole('combobox').querySelector('button')!);
    expect(handleOnChange).toHaveBeenNthCalledWith(2, '');
  });

  it('handles multiselect', async () => {
    const handleOnChange = jest.fn();
    const { rerender } = render(
      <MantineValueSelector {...props} multiple handleOnChange={handleOnChange} listsAsArrays />
    );
    await user.click(screen.getByTestId(TestID.fields));
    await user.click(screen.getByText('Option 2'));
    expect(handleOnChange).toHaveBeenNthCalledWith(1, ['opt2']);
    rerender(
      <MantineValueSelector
        {...props}
        multiple
        handleOnChange={handleOnChange}
        value={'opt2'}
        listsAsArrays
        clearable
      />
    );
    await user.click(screen.getByRole('combobox').querySelector('button')!);
    expect(handleOnChange).toHaveBeenNthCalledWith(2, []);
  });

  it('handles optgroups', async () => {
    const optGroup: OptionGroup[] = [{ label: 'Test Group', options }];
    const handleOnChange = jest.fn();
    render(
      <MantineValueSelector
        {...props}
        testID={TestID.fields}
        options={optionListMapNameToValue(optGroup)}
        handleOnChange={handleOnChange}
      />
    );
    await user.click(screen.getByTestId(TestID.fields));
    await user.click(screen.getByText('Option 2'));
    expect(handleOnChange).toHaveBeenCalledWith('opt2');
  });
});

describe('MantineValueEditor as select and date picker', () => {
  const props: ValueEditorProps = {
    testID: TestID.valueEditor,
    values: options,
    path: [0],
    level: 1,
    schema: {} as Schema,
    handleOnChange: () => {},
    field: 'f1',
    operator: '=',
    valueSource: 'value',
    fieldData: { name: 'f1', label: 'Field 1' },
    value: 'opt1',
  };

  it('renders value editor as select', () => {
    render(<MantineValueEditor {...props} type="select" />);
  });

  it('renders value editor as multiselect', () => {
    render(<MantineValueEditor {...props} type="multiselect" />);
  });

  it('handles "between" select', async () => {
    const handleOnChange = jest.fn();
    render(
      <MantineValueEditor
        {...props}
        type="select"
        operator="between"
        handleOnChange={handleOnChange}
        value={'opt1,opt2'}
      />
    );
    await user.click(screen.getByDisplayValue('Option 1'));
    await user.click(screen.getByText('Option 2'));
    expect(handleOnChange).toHaveBeenCalledWith('opt2,opt2');
  });

  it('renders value editor as date editor', async () => {
    const handleOnChange = jest.fn();
    render(<MantineValueEditor {...props} inputType="date" handleOnChange={handleOnChange} />);
    await user.click(screen.getByTestId(TestID.valueEditor));
    await user.click(screen.getByText('10'));
    expect(handleOnChange).toHaveBeenCalledWith(`${dateStub}10`);
  });

  it('renders value editor as date range editor', async () => {
    const handleOnChange = jest.fn();
    render(
      <MantineValueEditor
        {...props}
        inputType="date"
        operator="between"
        handleOnChange={handleOnChange}
      />
    );
    await user.click(screen.getByTestId(TestID.valueEditor));
    await user.click(screen.getByText('10'));
    await user.click(screen.getByText('20'));
    expect(handleOnChange).toHaveBeenCalledWith(`${dateStub}10,${dateStub}20`);
  });

  it('renders value editor as datetime-local editor', () => {
    render(<MantineValueEditor {...props} inputType="datetime-local" />);
  });

  it('renders value editor as datetime-local range editor', () => {
    render(<MantineValueEditor {...props} inputType="datetime-local" operator="between" />);
  });

  it('renders value editor as time editor', () => {
    render(<MantineValueEditor {...props} inputType="time" />);
  });

  it('renders value editor as time range editor', () => {
    render(<MantineValueEditor {...props} inputType="time" operator="between" />);
  });
});

it('renders with composition', () => {
  render(
    <QueryBuilderMantine>
      <QueryBuilder />
    </QueryBuilderMantine>
  );
  expect(screen.getByTestId(TestID.addRule)).toHaveClass('mantine-Button-root');
});
