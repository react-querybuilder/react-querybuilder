import { createTheme, MantineProvider } from '@mantine/core';
import {
  basicSchema,
  findInput,
  testActionElement,
  testNotToggle,
  testShiftActions,
  testValueEditor,
  userEventSetup,
} from '@rqb-testing';
import type { RenderOptions } from '@testing-library/react';
import { act, render as render_original, screen } from '@testing-library/react';
import dayjs from 'dayjs';
import type { ComponentPropsWithoutRef } from 'react';
import * as React from 'react';
import type {
  FullOption,
  OptionGroup,
  ValueEditorProps,
  VersatileSelectorProps,
} from 'react-querybuilder';
import { QueryBuilder, TestID, toFullOption } from 'react-querybuilder';
import { MantineActionElement } from './MantineActionElement';
import { MantineNotToggle } from './MantineNotToggle';
import { MantineShiftActions } from './MantineShiftActions';
import { MantineValueEditor } from './MantineValueEditor';
import { MantineValueSelector } from './MantineValueSelector';
import { QueryBuilderMantine } from './index';

jest.setTimeout(30_000);

const theme = createTheme({
  respectReducedMotion: true,
});

// oxlint-disable-next-line typescript/no-explicit-any
const generateWrapper = (RQBComponent: React.ComponentType<any>) => {
  const Wrapper = (props: ComponentPropsWithoutRef<typeof RQBComponent>) => (
    <MantineProvider theme={theme}>
      <RQBComponent {...props} />
    </MantineProvider>
  );
  Wrapper.displayName = RQBComponent.displayName;
  return Wrapper;
};

testActionElement(generateWrapper(MantineActionElement));
testNotToggle(generateWrapper(MantineNotToggle));
testShiftActions(generateWrapper(MantineShiftActions));
testValueEditor(generateWrapper(MantineValueEditor), {
  select: true,
  multiselect: true,
  betweenSelect: true,
});

const render = (
  ui: React.ReactNode,
  options: RenderOptions = {}
): ReturnType<typeof render_original> =>
  render_original(ui, {
    wrapper: ({ children }) => <MantineProvider>{children}</MantineProvider>,
    ...options,
  });

const user = userEventSetup();

const options = [
  { name: 'opt1', label: 'Option 1' },
  { name: 'opt2', label: 'Option 2' },
].map<FullOption>(o => toFullOption(o));

const now = new Date();
const year = now.getFullYear();
const month = `${now.getMonth() + 1}`.padStart(2, '0');
const dateStub = `${year}-${month}-`;

// https://github.com/mantinedev/mantine/blob/7.0.0/src/mantine-dates/src/components/DateTimePicker/DateTimePicker.tsx#L121
const defaultDateTimePickerLabelValueFormat = 'DD/MM/YYYY HH:mm:ss';
const toDateTimePickerLabel = (s: string) => dayjs(s).format(defaultDateTimePickerLabelValueFormat);

describe('MantineValueSelector', () => {
  const props: VersatileSelectorProps = {
    testID: TestID.fields,
    options,
    path: [0],
    level: 1,
    schema: basicSchema,
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
      />
    );
    await user.click(screen.getByRole('textbox').querySelector('button')!);
    expect(handleOnChange).toHaveBeenNthCalledWith(2, 'opt2');
  });

  it('handles multiselect', async () => {
    const handleOnChange = jest.fn();
    const { container, rerender } = render(
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
      />
    );
    await user.click(container.querySelector('button')!);
    expect(handleOnChange).toHaveBeenNthCalledWith(2, []);
  });

  it('handles optgroups', async () => {
    const optGroup: OptionGroup[] = [{ label: 'Test Group', options }];
    const handleOnChange = jest.fn();
    render(
      <MantineValueSelector
        {...props}
        testID={TestID.fields}
        // oxlint-disable-next-line typescript/no-explicit-any
        options={optGroup as any}
        handleOnChange={handleOnChange}
      />
    );
    await user.click(screen.getByTestId(TestID.fields));
    await user.click(screen.getByText('Option 2'));
    expect(handleOnChange).toHaveBeenCalledWith('opt2');
  });
});

describe('MantineValueEditor as numeric editor, select, date picker', () => {
  const props: ValueEditorProps = {
    testID: TestID.valueEditor,
    values: options,
    path: [0],
    level: 1,
    schema: {
      ...basicSchema,
      controls: { ...basicSchema.controls, valueSelector: MantineValueSelector },
    },
    handleOnChange: () => {},
    field: 'f1',
    operator: '=',
    valueSource: 'value',
    fieldData: toFullOption({ name: 'f1', label: 'Field 1' }),
    value: 'opt1',
    inputType: 'text',
    type: 'text',
    rule: { field: '', operator: '', value: '' },
  };

  it('renders value editor as numeric editor', async () => {
    const handleOnChange = jest.fn();
    render(
      <MantineValueEditor
        {...props}
        inputType="number"
        handleOnChange={handleOnChange}
        value={1214}
      />
    );
    await act(async () => {
      await user.type(findInput(screen.getByTestId(TestID.valueEditor)), '02');
    });
    expect(handleOnChange).toHaveBeenCalledWith(121_402);
  });

  it('renders value editor as select', () => {
    render(<MantineValueEditor {...props} type="select" />);
    expect(screen.getByTestId(TestID.valueEditor)).toBeInTheDocument();
  });

  it('renders value editor as multiselect', () => {
    render(<MantineValueEditor {...props} type="multiselect" />);
    expect(screen.getByTestId(TestID.valueEditor)).toBeInTheDocument();
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
    await user.click(screen.getAllByText('Option 2')[0]);
    expect(handleOnChange).toHaveBeenCalledWith('opt2,opt2');
    rerender(
      <MantineValueEditor
        {...props}
        type="select"
        operator="between"
        handleOnChange={handleOnChange}
        value={null}
      />
    );
    expect(screen.getAllByText('Option 1')).toHaveLength(2);
  });

  it('renders value editor as date editor', async () => {
    const handleOnChange = jest.fn();
    render(<MantineValueEditor {...props} inputType="date" handleOnChange={handleOnChange} />);
    await user.click(screen.getByTestId(TestID.valueEditor));
    await new Promise(r => setTimeout(r, 500));
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
    const button = screen.getByText(dayjs(dateString).format('MMMM D, YYYY'));
    await user.click(button);
    await new Promise(r => setTimeout(r, 500));
    const day = screen.getByText('16');
    await user.click(day);
    await new Promise(r => setTimeout(r, 500));
    expect(handleOnChange).toHaveBeenCalledWith('2002-12-16');
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
    await new Promise(r => setTimeout(r, 500));
    await user.click(screen.getByText('10'));
    expect(handleOnChange).toHaveBeenCalledWith(`${dateStub}10,`);
    rerender(
      <MantineValueEditor
        {...props}
        inputType="date"
        operator="between"
        handleOnChange={handleOnChange}
        value={[`${dateStub}10`, '']}
      />
    );
    await act(async () => {
      await user.click(screen.getByTestId(TestID.valueEditor));
      await new Promise(r => setTimeout(r, 500));
      await user.click(screen.getByText('20'));
    });
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
    await act(async () => {
      await user.click(screen.getByTestId(TestID.valueEditor));
      await new Promise(r => setTimeout(r, 500));
      await user.click(screen.getByText('12'));
      await user.click(screen.getByText('14'));
    });
    // TODO: Figure out why this doesn't work in React < 19
    if (Number.parseInt(React.version, 10) >= 19) {
      // oxlint-disable-next-line no-conditional-expect
      expect(handleOnChange).toHaveBeenCalledWith([`${dateStub}12`, `${dateStub}14`]);
    }
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
    await new Promise(r => setTimeout(r, 500));
    await user.click(screen.getByText('16'));
    expect(handleOnChange).toHaveBeenCalledWith(`${dateStub}16,`);
  });

  it('renders value editor as time editor', async () => {
    const handleOnChange = jest.fn();
    render(<MantineValueEditor {...props} inputType="time" handleOnChange={handleOnChange} />);
    await act(async () => {
      await user.type(findInput(screen.getByTestId(TestID.valueEditor)), '124');
    });
    expect(handleOnChange).toHaveBeenCalledWith('12:04');
  });

  it('handles preloaded dates as time editor', async () => {
    const { rerender } = render(<MantineValueEditor {...props} inputType="time" value="12:14" />);
    expect(screen.getByTestId(TestID.valueEditor)).toHaveValue('12:14');
    rerender(<MantineValueEditor {...props} inputType="time" value="" />);
    expect(screen.getByTestId(TestID.valueEditor)).toHaveValue('');
  });

  it('renders value editor as time range editor', async () => {
    const handleOnChange = jest.fn();
    const { rerender } = render(
      <MantineValueEditor
        {...props}
        inputType="time"
        operator="between"
        handleOnChange={handleOnChange}
        values={[]}
      />
    );
    await act(async () => {
      await user.type(screen.getByTestId(TestID.valueEditor).querySelectorAll('input')[0], '124');
    });
    expect(handleOnChange).toHaveBeenCalledWith('12:04,');
    rerender(
      <MantineValueEditor
        {...props}
        inputType="time"
        operator="between"
        handleOnChange={handleOnChange}
        values={[]}
        listsAsArrays
        value={['12:04', '']}
      />
    );
    await act(async () => {
      await user.type(screen.getByTestId(TestID.valueEditor).querySelectorAll('input')[1], '142');
    });
    expect(handleOnChange).toHaveBeenCalledWith(['12:04', '14:02']);
  });

  it('renders value editor as datetime-local editor', async () => {
    const handleOnChange = jest.fn();
    const { rerender } = render(
      <MantineValueEditor
        {...props}
        value="not a date"
        inputType="datetime-local"
        handleOnChange={handleOnChange}
      />
    );
    await act(async () => {
      await user.click(screen.getByTestId(TestID.valueEditor));
    });
    await new Promise(r => setTimeout(r, 500));
    await user.click(screen.getByText('10'));
    expect(screen.getByTestId(TestID.valueEditor)).toHaveTextContent('');
    expect(handleOnChange).toHaveBeenCalledWith(`${dateStub}10T00:00:00`);
    rerender(
      <MantineValueEditor
        {...props}
        value={`${dateStub}10T00:00:00`}
        inputType="datetime-local"
        handleOnChange={handleOnChange}
      />
    );
    expect(screen.getByTestId(TestID.valueEditor)).toHaveTextContent(
      toDateTimePickerLabel(`${dateStub}10T00:00:00`)
    );
  });

  describe('when rendering a "between" datetime-local input', () => {
    const betweenDateTimeLocalProps: ValueEditorProps = {
      ...props,
      inputType: 'datetime-local',
      operator: 'between',
      type: 'text',
      value: `not a date,${dateStub}20T00:00:00`,
      values: undefined,
    };

    it('renders the "between" datetime-local input', () => {
      render(<MantineValueEditor {...betweenDateTimeLocalProps} />);
      const betweenInputs = screen.getAllByRole('button');
      expect(betweenInputs).toHaveLength(2);
      expect(betweenInputs[0]).toHaveTextContent('');
      expect(betweenInputs[1]).toHaveTextContent(toDateTimePickerLabel(`${dateStub}20T00:00:00`));
    });

    it('calls the onChange handler', async () => {
      const handleOnChange = jest.fn();
      render(<MantineValueEditor {...betweenDateTimeLocalProps} handleOnChange={handleOnChange} />);
      const betweenInputs = screen.getAllByRole('button');
      expect(betweenInputs).toHaveLength(2);
      await user.click(betweenInputs[0]);
      await new Promise(r => setTimeout(r, 500));
      await act(async () => {
        await user.click(screen.getByText('12'));
        await new Promise(r => setTimeout(r, 500));
      });
      await user.click(betweenInputs[1]);
      await act(async () => {
        await user.click(screen.getAllByText('14')[1]);
        await new Promise(r => setTimeout(r, 500));
      });
      expect(handleOnChange).toHaveBeenCalledWith(`${dateStub}12T00:00:00,${dateStub}20T00:00:00`);
      // TODO: Figure out why this is flaky
      // expect(handleOnChange).toHaveBeenCalledWith(`not a date,${dateStub}14T00:00:00`);
    });

    it('assumes empty string as the second value if not provided', async () => {
      const handleOnChange = jest.fn();
      render(
        <MantineValueEditor
          {...betweenDateTimeLocalProps}
          handleOnChange={handleOnChange}
          value={[`${dateStub}10T00:00:00`]}
        />
      );
      const betweenInputs = screen.getAllByRole('button');
      expect(betweenInputs).toHaveLength(2);
      await user.click(betweenInputs[0]);
      await new Promise(r => setTimeout(r, 500));
      await user.click(screen.getByText('12'));
      expect(handleOnChange).toHaveBeenCalledWith(`${dateStub}12T00:00:00,`);
    });

    it('calls the onChange handler with lists as arrays', async () => {
      const handleOnChange = jest.fn();
      render(
        <MantineValueEditor
          {...betweenDateTimeLocalProps}
          handleOnChange={handleOnChange}
          listsAsArrays
        />
      );
      const betweenInputs = screen.getAllByRole('button');
      expect(betweenInputs).toHaveLength(2);
      await user.click(betweenInputs[0]);
      await new Promise(r => setTimeout(r, 500));
      await act(async () => {
        await user.click(screen.getByText('12'));
        await new Promise(r => setTimeout(r, 500));
      });
      await user.click(betweenInputs[1]);
      await new Promise(r => setTimeout(r, 500));
      await act(async () => {
        await user.click(screen.getAllByText('14')[1]);
        await new Promise(r => setTimeout(r, 500));
      });
      expect(handleOnChange).toHaveBeenCalledWith([
        `${dateStub}12T00:00:00`,
        `${dateStub}20T00:00:00`,
      ]);
      // TODO: Figure out why this is flaky
      // expect(handleOnChange).toHaveBeenCalledWith([`not a date`, `${dateStub}14T00:00:00`]);
    });

    it('is disabled by the disabled prop', async () => {
      const handleOnChange = jest.fn();
      render(
        <MantineValueEditor
          {...betweenDateTimeLocalProps}
          handleOnChange={handleOnChange}
          disabled
        />
      );
      const betweenInputs = screen.getAllByRole('button');
      expect(betweenInputs).toHaveLength(2);
      for (const r of betweenInputs) {
        expect(r).toBeDisabled();
        await user.click(r);
      }
      expect(handleOnChange).not.toHaveBeenCalled();
    });
  });
});

it('renders with composition', () => {
  render(
    <MantineProvider>
      <QueryBuilderMantine>
        <QueryBuilder />
      </QueryBuilderMantine>
    </MantineProvider>
  );
  expect(screen.getByTestId(TestID.addRule)).toHaveClass('mantine-Button-root');
});
