import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen, within } from '@testing-library/react';
import { forwardRef } from 'react';
import {
  defaultValueEditorProps,
  defaultValueSelectorProps,
  testActionElement,
  testDragHandle,
  testNotToggle,
  testValueEditor,
  userEventSetup,
} from 'react-querybuilder/genericTests';
import type {
  DragHandleProps,
  NameLabelPair,
  OptionGroup,
  ValueEditorProps,
  ValueSelectorProps,
} from 'react-querybuilder/src';
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
  const user = userEventSetup();
  const testValues: NameLabelPair[] = props.values ?? props.options;
  const [firstNameLabel, secondNameLabel] = testValues;
  const isMulti = ('values' in props && props.type === 'multiselect') || props.multiple;

  describe(title, () => {
    it('should render the correct number of options', async () => {
      render(<Component {...props} value={firstNameLabel.name} />);
      await user.click(screen.getByRole('button'));
      const listbox = within(screen.getByRole('listbox'));
      expect(listbox.getAllByRole('option')).toHaveLength(testValues.length);
    });

    it('should have the options passed into the <select />', async () => {
      render(<Component {...props} value={firstNameLabel.name} />);
      await user.click(screen.getByRole('button'));
      const listbox = within(screen.getByRole('listbox'));
      expect(() => listbox.getByText(secondNameLabel.label)).not.toThrow();
    });

    if (('values' in props && props.type === 'multiselect') || 'options' in props) {
      it('should have the values passed into the <select multiple />', () => {
        const value = testValues.map(v => v.name).join(',');
        const multiselectProps = 'values' in props ? { type: 'multiselect' } : { multiple: true };
        render(<Component {...props} value={value} {...multiselectProps} />);
        expect(screen.getByTitle(title)).toHaveTextContent(testValues.map(v => v.label).join(', '));
      });
    }
    if (('values' in props && props.type !== 'multiselect') || 'options' in props) {
      it('should have the value passed into the <select />', () => {
        render(<Component {...props} value={secondNameLabel.name} />);
        expect(screen.getByTitle(props.title)).toHaveTextContent(secondNameLabel.label);
      });
    }

    it('should call the onChange method passed in', async () => {
      const handleOnChange = jest.fn();
      render(<Component {...props} value={firstNameLabel.name} handleOnChange={handleOnChange} />);
      await user.click(screen.getByRole('button'));
      const listbox = within(screen.getByRole('listbox'));
      await user.click(listbox.getByText(secondNameLabel.label));
      expect(handleOnChange).toHaveBeenCalledWith(
        isMulti ? `${firstNameLabel.name},${secondNameLabel.name}` : secondNameLabel.name
      );
    });

    it('should have the className passed into the <select />', () => {
      render(<Component {...props} className="foo" value={firstNameLabel.name} />);
      expect(screen.getByTitle(props.title)).toHaveClass('foo');
    });

    it('should render optgroups', async () => {
      const optGroups: OptionGroup[] = [{ label: 'Test Option Group', options: testValues }];
      const newProps = { ...props, values: optGroups, options: optGroups };
      render(<Component {...newProps} value={isMulti ? [] : undefined} />);
      await user.click(screen.getByRole('button'));
      const listbox = within(screen.getByRole('listbox'));
      expect(() => listbox.getByText(secondNameLabel.label)).not.toThrow();
      expect(screen.getByRole('listbox').querySelectorAll('li')).toHaveLength(
        testValues.length + 1
      );
      expect(listbox.getAllByRole('option')).toHaveLength(testValues.length + 1);
      expect(listbox.getAllByRole('option')[2]).toHaveTextContent(secondNameLabel.label);
    });

    it('should be disabled by the disabled prop', async () => {
      const handleOnChange = jest.fn();
      render(
        <Component
          {...props}
          handleOnChange={handleOnChange}
          disabled
          value={firstNameLabel.name}
        />
      );
      expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
      await user.click(screen.getByRole('button'));
      expect(() => screen.getByRole('listbox')).toThrow();
      expect(handleOnChange).not.toHaveBeenCalled();
    });
  });
};

testActionElement(generateWrapper(MaterialActionElement));
testDragHandle(WrapperDH);
testNotToggle(generateWrapper(MaterialNotToggle));
testValueEditor(generateWrapper(MaterialValueEditor), {
  select: true,
  multiselect: true,
  betweenSelect: true,
});
const valueEditorAsSelectTitle = `${materialValueEditorProps.title} (as ValueSelector)`;
testMaterialValueSelector(valueEditorAsSelectTitle, MaterialValueEditor, {
  ...materialValueEditorProps,
  title: valueEditorAsSelectTitle,
});
const valueEditorAsMultiselectTitle = `${materialValueEditorProps.title} (as ValueSelector multiselect)`;
testMaterialValueSelector(valueEditorAsMultiselectTitle, MaterialValueEditor, {
  ...materialValueEditorProps,
  title: valueEditorAsMultiselectTitle,
  type: 'multiselect',
});
testMaterialValueSelector(
  materialValueSelectorProps.title!,
  MaterialValueSelector,
  materialValueSelectorProps
);
