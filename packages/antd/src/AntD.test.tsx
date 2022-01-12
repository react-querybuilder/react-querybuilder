import {
  defaultNotToggleProps,
  defaultValueEditorProps,
  defaultValueSelectorProps,
  testActionElement,
  testDragHandle,
  testValueEditor,
} from '@react-querybuilder/compat';
import { act, fireEvent, render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type {
  NameLabelPair,
  NotToggleProps,
  OptionGroup,
  ValueEditorProps,
  ValueSelectorProps,
} from 'react-querybuilder';
import {
  AntDActionElement,
  AntDDragHandle,
  AntDNotToggle,
  AntDValueEditor,
  AntDValueSelector,
} from '.';

interface AntDValueEditorProps extends ValueEditorProps {
  values: NameLabelPair[] | OptionGroup[];
}

const antdValueSelectorProps: ValueSelectorProps = {
  ...defaultValueSelectorProps,
  title: AntDValueSelector.displayName,
};
const antdValueEditorProps: AntDValueEditorProps = {
  ...defaultValueEditorProps,
  type: 'select',
  title: AntDValueEditor.displayName,
  values: defaultValueSelectorProps.options,
};

const testAntDSelect = (
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

    it('should have the value passed into the <select />', () => {
      const { getByTitle } = render(<Component {...props} value={testVal.name} />);
      expect(getByTitle(props.title)).toHaveTextContent(testVal.label);
    });

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

describe('AntD compatible components', () => {
  testActionElement(AntDActionElement);
  testDragHandle(AntDDragHandle);
  testValueEditor(AntDValueEditor, { select: true });

  (
    [
      [`${antdValueEditorProps.title} as select`, AntDValueEditor, antdValueEditorProps],
      [antdValueSelectorProps.title, AntDValueSelector, antdValueSelectorProps],
    ] as const
  )
    // eslint-disable-next-line prefer-spread
    .forEach(t => testAntDSelect.apply(undefined, t));

  const title = AntDNotToggle.displayName;
  describe(title, () => {
    const label = 'Not';
    const props: NotToggleProps = { ...defaultNotToggleProps, label, title };

    it('should have the value passed in', () => {
      const { getByTitle } = render(<AntDNotToggle {...props} checked />);
      expect(getByTitle(title)).toBeDefined();
    });

    it('should have the className passed into the <label />', () => {
      const { getByTitle } = render(<AntDNotToggle {...props} className="foo" />);
      expect(getByTitle(title)).toHaveClass('foo');
    });

    it('should call the onChange method passed in', () => {
      const onChange = jest.fn();
      const { getByTitle } = render(<AntDNotToggle {...props} handleOnChange={onChange} />);
      userEvent.click(getByTitle(title));
      expect(onChange).toHaveBeenCalledWith(true);
    });

    it('should be disabled by disabled prop', () => {
      const onChange = jest.fn();
      const { getByTitle } = render(
        <AntDNotToggle {...props} handleOnChange={onChange} disabled />
      );
      expect(getByTitle(title)).toBeDisabled();
      userEvent.click(getByTitle(title));
      expect(onChange).not.toHaveBeenCalled();
    });
  });
});
