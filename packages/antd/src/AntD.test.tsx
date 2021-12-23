import {
  defaultNotToggleProps,
  defaultValueEditorProps,
  defaultValueSelectorProps,
  testActionElement,
  testDragHandle,
  testValueEditor,
} from '@react-querybuilder/compat';
import { render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  defaultTranslations,
  NameLabelPair,
  NotToggleProps,
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
  values: NameLabelPair[];
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
  Component: React.ComponentType<ValueEditorProps> | React.ComponentType<ValueSelectorProps>,
  props: any
) => {
  const testValues = props.values ?? props.options;
  const testVal = testValues[1];

  it('should render the correct number of options', () => {
    const { getByRole } = render(<Component {...props} />);
    userEvent.click(getByRole('button'));
    const listbox = within(getByRole('listbox'));
    expect(listbox.getAllByRole('option')).toHaveLength(2);
  });

  it('should have the options passed into the <select />', () => {
    const { getByRole } = render(<Component {...props} />);
    userEvent.click(getByRole('button'));
    const listbox = within(getByRole('listbox'));
    expect(() => listbox.getByText(testVal.label)).not.toThrow();
  });

  it('should have the value passed into the <select />', () => {
    const { getByTitle } = render(<Component {...props} value={testVal.name} />);
    expect(getByTitle(props.title)).toHaveTextContent(testVal.label);
  });

  it('should call the onChange method passed in', () => {
    const handleOnChange = jest.fn();
    const { getByRole } = render(<Component {...props} handleOnChange={handleOnChange} />);
    userEvent.click(getByRole('button'));
    const listbox = within(getByRole('listbox'));
    userEvent.click(listbox.getByText(testVal.label));
    expect(handleOnChange).toHaveBeenCalledWith(testVal.name);
  });

  it('should have the className passed into the <select />', () => {
    const { getByTitle } = render(<Component {...props} className="foo" />);
    expect(getByTitle(props.title)).toHaveClass('foo');
  });

  it('should be disabled by the disabled prop', () => {
    const handleOnChange = jest.fn();
    const { getByRole } = render(<Component {...props} handleOnChange={handleOnChange} disabled />);
    expect(getByRole('button')).toHaveAttribute('aria-disabled', 'true');
    userEvent.click(getByRole('button'));
    expect(() => getByRole('listbox')).toThrow();
    expect(handleOnChange).not.toHaveBeenCalled();
  });
};

describe('AntD compatible components', () => {
  testActionElement(AntDActionElement);
  testDragHandle(AntDDragHandle);
  testValueEditor(AntDValueEditor, { select: true });

  (
    [
      {
        desc: `${antdValueEditorProps.title} as select`,
        comp: AntDValueEditor,
        prop: antdValueEditorProps,
      },
      {
        desc: antdValueSelectorProps.title,
        comp: AntDValueSelector,
        prop: antdValueSelectorProps,
      },
    ] as const
  ).forEach(t => {
    describe(t.desc, () => {
      testAntDSelect(t.comp, t.prop);
    });
  });

  const title = AntDNotToggle.displayName;
  describe(title, () => {
    const { label } = defaultTranslations.notToggle;
    const props: NotToggleProps = { ...defaultNotToggleProps, label, title };

    it('should have the value passed in', () => {
      const { getByLabelText } = render(<AntDNotToggle {...props} checked />);
      expect(getByLabelText(label)).toBeDefined();
    });

    it('should have the className passed into the <label />', () => {
      const { getByLabelText } = render(<AntDNotToggle {...props} className="foo" />);
      expect(getByLabelText(label)).toHaveClass('foo');
    });

    it('should call the onChange method passed in', () => {
      const onChange = jest.fn();
      const { getByLabelText } = render(<AntDNotToggle {...props} handleOnChange={onChange} />);
      userEvent.click(getByLabelText(label));
      expect(onChange).toHaveBeenCalledWith(true);
    });

    it('should be disabled by disabled prop', () => {
      const onChange = jest.fn();
      const { getByLabelText } = render(
        <AntDNotToggle {...props} handleOnChange={onChange} disabled />
      );
      expect(getByLabelText(label)).toBeDisabled();
      userEvent.click(getByLabelText(label));
      expect(onChange).not.toHaveBeenCalled();
    });
  });
});
