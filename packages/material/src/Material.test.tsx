import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  defaultValueEditorProps,
  defaultValueSelectorProps,
  testActionElement,
  testDragHandle,
  testNotToggle,
  testValueEditor,
} from 'react-querybuilder/genericTests';
import { render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { forwardRef } from 'react';
import type {
  DragHandleProps,
  NameLabelPair,
  OptionGroup,
  ValueEditorProps,
  ValueSelectorProps,
} from 'react-querybuilder';
import 'regenerator-runtime/runtime';
import {
  MaterialActionElement,
  MaterialDragHandle,
  MaterialNotToggle,
  MaterialValueEditor,
  MaterialValueSelector,
} from '.';

const theme = createTheme();
const generateWrapper = (RQBComponent: any) => {
  const Wrapper = (props: any) => (
    <ThemeProvider theme={theme}>
      <RQBComponent {...props} />
    </ThemeProvider>
  );
  Wrapper.displayName = RQBComponent.displayName;
  return Wrapper;
};
const WrapperDH = forwardRef<HTMLSpanElement, DragHandleProps>((props, ref) => (
  <ThemeProvider theme={theme}>
    <MaterialDragHandle {...props} ref={ref} />
  </ThemeProvider>
));
WrapperDH.displayName = MaterialDragHandle.displayName;

const materialValueSelectorProps: ValueSelectorProps = {
  ...defaultValueSelectorProps,
  title: MaterialValueSelector.displayName,
};
const materialValueEditorProps: ValueEditorProps = {
  ...defaultValueEditorProps,
  type: 'select',
  title: MaterialValueEditor.displayName,
  values: defaultValueSelectorProps.options,
};

const testMaterialValueSelector = (
  title: string,
  Component: React.ComponentType<ValueEditorProps> | React.ComponentType<ValueSelectorProps>,
  props: any
) => {
  const testValues: NameLabelPair[] = props.values ?? props.options;
  const [firstVal, secondVal] = testValues;

  describe(title, () => {
    it('should render the correct number of options', () => {
      const { getByRole } = render(<Component {...props} value={firstVal.name} />);
      userEvent.click(getByRole('button'));
      const listbox = within(getByRole('listbox'));
      expect(listbox.getAllByRole('option')).toHaveLength(2);
    });

    it('should have the options passed into the <select />', () => {
      const { getByRole } = render(<Component {...props} value={firstVal.name} />);
      userEvent.click(getByRole('button'));
      const listbox = within(getByRole('listbox'));
      expect(() => listbox.getByText(secondVal.label)).not.toThrow();
    });

    it('should have the value passed into the <select />', () => {
      const { getByTitle } = render(<Component {...props} value={secondVal.name} />);
      expect(getByTitle(props.title)).toHaveTextContent(secondVal.label);
    });

    it('should call the onChange method passed in', () => {
      const handleOnChange = jest.fn();
      const { getByRole } = render(
        <Component {...props} value={firstVal.name} handleOnChange={handleOnChange} />
      );
      userEvent.click(getByRole('button'));
      const listbox = within(getByRole('listbox'));
      userEvent.click(listbox.getByText(secondVal.label));
      expect(handleOnChange).toHaveBeenCalledWith(secondVal.name);
    });

    it('should have the className passed into the <select />', () => {
      const { getByTitle } = render(<Component {...props} className="foo" value={firstVal.name} />);
      expect(getByTitle(props.title)).toHaveClass('foo');
    });

    it('should render optgroups', async () => {
      const optGroups: OptionGroup[] = [
        { label: 'Test Option Group', options: props.values ?? props.options },
      ];
      const newProps = { ...props, values: optGroups, options: optGroups };
      const { getByRole } = render(<Component {...newProps} />);
      userEvent.click(getByRole('button'));
      const listbox = within(getByRole('listbox'));
      expect(() => listbox.getByText(secondVal.label)).not.toThrow();
      expect(getByRole('listbox').querySelectorAll('li')).toHaveLength(3);
      expect(listbox.getAllByRole('option')).toHaveLength(3);
      expect(listbox.getAllByRole('option')[2]).toHaveTextContent(secondVal.label);
    });

    it('should be disabled by the disabled prop', () => {
      const handleOnChange = jest.fn();
      const { getByRole } = render(
        <Component {...props} handleOnChange={handleOnChange} disabled value={firstVal.name} />
      );
      expect(getByRole('button')).toHaveAttribute('aria-disabled', 'true');
      userEvent.click(getByRole('button'));
      expect(() => getByRole('listbox')).toThrow();
      expect(handleOnChange).not.toHaveBeenCalled();
    });
  });
};

testActionElement(generateWrapper(MaterialActionElement));
testDragHandle(WrapperDH);
testNotToggle(generateWrapper(MaterialNotToggle));
testValueEditor(generateWrapper(MaterialValueEditor), { select: true });
testMaterialValueSelector(
  `${materialValueEditorProps.title} (as ValueSelector)`,
  MaterialValueEditor,
  materialValueEditorProps
);
testMaterialValueSelector(
  materialValueSelectorProps.title!,
  MaterialValueSelector,
  materialValueSelectorProps
);
