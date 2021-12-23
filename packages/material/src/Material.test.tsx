import { ThemeProvider } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import {
  defaultValueEditorProps,
  defaultValueSelectorProps,
  testActionElement,
  testDragHandle,
  testNotToggle,
  testValueEditor,
} from '@react-querybuilder/compat';
import { render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { forwardRef } from 'react';
import {
  DragHandleProps,
  NameLabelPair,
  ValueEditorProps,
  ValueSelectorProps,
} from 'react-querybuilder';
import {
  MaterialActionElement,
  MaterialDragHandle,
  MaterialNotToggle,
  MaterialValueEditor,
  MaterialValueSelector,
} from '.';

interface MaterialValueEditorProps extends ValueEditorProps {
  values: NameLabelPair[];
}

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
const materialValueEditorProps: MaterialValueEditorProps = {
  ...defaultValueEditorProps,
  type: 'select',
  title: MaterialValueEditor.displayName,
  values: defaultValueSelectorProps.options,
};

const testMaterialSelect = (
  title: string,
  Component: React.ComponentType<ValueEditorProps> | React.ComponentType<ValueSelectorProps>,
  props: any
) => {
  const testValues: NameLabelPair[] = props.values ?? props.options;
  const testVal = testValues[1];

  describe(title, () => {
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
      const { getByRole } = render(
        <Component {...props} handleOnChange={handleOnChange} disabled />
      );
      expect(getByRole('button')).toHaveAttribute('aria-disabled', 'true');
      userEvent.click(getByRole('button'));
      expect(() => getByRole('listbox')).toThrow();
      expect(handleOnChange).not.toHaveBeenCalled();
    });
  });
};

describe('Material compatible components', () => {
  testActionElement(generateWrapper(MaterialActionElement));
  testDragHandle(WrapperDH);
  testNotToggle(generateWrapper(MaterialNotToggle));
  testValueEditor(generateWrapper(MaterialValueEditor), { select: true });

  (
    [
      [
        `${materialValueEditorProps.title} as select`,
        MaterialValueEditor,
        materialValueEditorProps,
      ],
      [materialValueSelectorProps.title, MaterialValueSelector, materialValueSelectorProps],
    ] as const
  )
    // eslint-disable-next-line prefer-spread
    .forEach(t => testMaterialSelect.apply(undefined, t));
});
