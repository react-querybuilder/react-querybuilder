import { act, render, screen } from '@testing-library/react';
import dayjs from 'dayjs';
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

jest.setTimeout(30_000);

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
        options={optGroup}
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
    inputType: 'text',
    type: 'text',
  };

  it('renders value editor as select', () => {
    render(<MantineValueEditor {...props} type="select" />);
  });

  it('renders value editor as multiselect', () => {
    render(<MantineValueEditor {...props} type="multiselect" />);
  });

  it('handles "between" select', async () => {
    const handleOnChange = jest.fn();
    const { rerender } = render(
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
    rerender(
      <MantineValueEditor
        {...props}
        type="select"
        operator="between"
        handleOnChange={handleOnChange}
        value={[]}
      />
    );
    expect(screen.getAllByDisplayValue('Option 1')).toHaveLength(2);
  });

  it('renders value editor as date editor', async () => {
    const handleOnChange = jest.fn();
    render(<MantineValueEditor {...props} inputType="date" handleOnChange={handleOnChange} />);
    await user.click(screen.getByTestId(TestID.valueEditor));
    await user.click(screen.getByText('10'));
    expect(handleOnChange).toHaveBeenCalledWith(`${dateStub}10`);
  });

  it('handles preloaded dates and clearing value as date editor', async () => {
    const handleOnChange = jest.fn();
    const dateString = '2002-12-14';
    render(
      <MantineValueEditor
        {...props}
        inputType="date"
        value={dateString}
        handleOnChange={handleOnChange}
      />
    );
    expect(screen.getByDisplayValue(dayjs(dateString).format('MMMM D, YYYY'))).toBeInTheDocument();
    await user.click(screen.getByRole('button'));
    expect(handleOnChange).toHaveBeenCalledWith('');
  });

  it('renders value editor as date range editor', async () => {
    const handleOnChange = jest.fn();
    const { rerender } = render(
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
    rerender(
      <MantineValueEditor
        {...props}
        listsAsArrays
        inputType="date"
        operator="between"
        handleOnChange={handleOnChange}
      />
    );
    await user.click(screen.getByTestId(TestID.valueEditor));
    await user.click(screen.getByText('12'));
    await user.click(screen.getByText('14'));
    expect(handleOnChange).toHaveBeenCalledWith([`${dateStub}12`, `${dateStub}14`]);
  });

  it('handles preloaded values as date range editor', async () => {
    const handleOnChange = jest.fn();
    render(
      <MantineValueEditor
        {...props}
        inputType="date"
        operator="between"
        handleOnChange={handleOnChange}
        value={`${dateStub}12,${dateStub}14`}
      />
    );
    await user.click(screen.getByTestId(TestID.valueEditor));
    await user.click(screen.getByText('10'));
    await user.click(screen.getByText('20'));
    expect(handleOnChange).toHaveBeenCalledWith(`${dateStub}10,${dateStub}20`);
  });

  it('renders value editor as time editor', async () => {
    const handleOnChange = jest.fn();
    render(<MantineValueEditor {...props} inputType="time" handleOnChange={handleOnChange} />);
    await user.tab();
    await act(async () => {
      await user.keyboard('2');
    });
    expect(handleOnChange).toHaveBeenCalledWith('02:00:00');
  });

  it('handles preloaded dates as time editor', async () => {
    const { rerender } = render(
      <MantineValueEditor {...props} inputType="time" value="12:14:26" />
    );
    expect(screen.getByTestId(TestID.valueEditor).querySelectorAll('input')[0]).toHaveValue('12');
    rerender(<MantineValueEditor {...props} inputType="time" value="2002-12-14T14:12:26" />);
    expect(screen.getByTestId(TestID.valueEditor).querySelectorAll('input')[0]).toHaveValue('14');
    rerender(<MantineValueEditor {...props} inputType="time" value="" />);
    expect(screen.getByTestId(TestID.valueEditor).querySelectorAll('input')[0]).toHaveValue('');
  });

  it('renders value editor as time range editor', async () => {
    const handleOnChange = jest.fn();
    const { rerender } = render(
      <MantineValueEditor
        {...props}
        inputType="time"
        operator="between"
        handleOnChange={handleOnChange}
      />
    );
    await user.tab();
    await act(async () => await user.keyboard('2'));
    expect(handleOnChange).toHaveBeenCalledWith('02:00:00,');
    await act(async () => {
      await user.tab();
      await user.tab();
      await user.keyboard('4');
    });
    expect(handleOnChange).toHaveBeenCalledWith('02:00:00,04:00:00');
    rerender(
      <MantineValueEditor
        {...props}
        inputType="time"
        operator="between"
        handleOnChange={handleOnChange}
        listsAsArrays
        value={['02:00:00', '04:00:00']}
      />
    );
    await act(async () => {
      await user.tab({ shift: true });
      await user.keyboard('6');
    });
    expect(handleOnChange).toHaveBeenCalledWith(['02:00:00', '06:00:00']);
  });

  it('renders value editor as datetime-local editor', () => {
    render(<MantineValueEditor {...props} inputType="datetime-local" />);
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
