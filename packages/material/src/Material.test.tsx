import type {
  FormControlProps,
  ListSubheaderProps,
  MenuItemProps,
  SelectChangeEvent,
  SelectProps,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  cloneElement as mockCloneElement,
  forwardRef,
  isValidElement as mockIsValidElement,
  type ComponentPropsWithoutRef,
} from 'react';
import {
  testActionElement,
  testDragHandle,
  testNotToggle,
  testValueEditor,
  testValueSelector,
} from 'react-querybuilder/genericTests';
import type { DragHandleProps } from 'react-querybuilder/src';
import 'regenerator-runtime/runtime';
import {
  MaterialActionElement,
  MaterialDragHandle,
  MaterialNotToggle,
  MaterialValueEditor,
  MaterialValueSelector,
} from '.';

jest.mock('@mui/material', () => {
  const MuiMaterial = jest.requireActual('@mui/material');
  const ListSubheader = ({ children }: ListSubheaderProps) => (
    <optgroup label={children as string} />
  );
  const MenuItem = ({ value, children }: MenuItemProps) => (
    <option value={value}>{children}</option>
  );
  return { ...MuiMaterial, ListSubheader, MenuItem };
});
jest.mock('@mui/material/FormControl', () => {
  const FormControl = ({ className, disabled, title, children }: FormControlProps) => (
    <div className={className} title={title}>
      {mockIsValidElement(children) ? mockCloneElement(children, { disabled }) : children}
    </div>
  );
  FormControl.useFormControl = () => {};
  return FormControl;
});
jest.mock('@mui/material/Select', () => {
  const Select = (props: SelectProps<string | string[]>) => (
    <select
      disabled={!!props.disabled}
      multiple={!!props.multiple}
      value={props.value}
      onChange={e =>
        props.onChange!(
          {
            target: {
              value: props.multiple
                ? Array.from(e.target.selectedOptions).map(opt => opt.value)
                : e.target.value,
            },
          } as SelectChangeEvent<string | string[]>,
          ''
        )
      }>
      {props.children}
    </select>
  );
  return Select;
});

const theme = createTheme();
const generateWrapper = (RQBComponent: any) => {
  const Wrapper = (props: ComponentPropsWithoutRef<typeof RQBComponent>) => (
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

testActionElement(generateWrapper(MaterialActionElement));
testDragHandle(WrapperDH);
testNotToggle(generateWrapper(MaterialNotToggle));
testValueEditor(generateWrapper(MaterialValueEditor));
testValueSelector(generateWrapper(MaterialValueSelector));
