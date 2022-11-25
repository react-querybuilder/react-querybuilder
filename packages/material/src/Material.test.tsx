import DragIndicator from '@mui/icons-material/DragIndicator';
import type {
  FormControlProps,
  ListSubheaderProps,
  MenuItemProps,
  SelectChangeEvent,
  SelectProps,
} from '@mui/material';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Input from '@mui/material/Input';
import ListSubheader from '@mui/material/ListSubheader';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Select from '@mui/material/Select';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import type { DragHandleProps } from '@react-querybuilder/ts';
import { act, render, screen } from '@testing-library/react';
import type { ComponentPropsWithoutRef, ReactElement } from 'react';
import {
  cloneElement as mockCloneElement,
  forwardRef,
  isValidElement as mockIsValidElement,
} from 'react';
import { defaultTranslations, QueryBuilder, TestID } from 'react-querybuilder';
import {
  testActionElement,
  testDragHandle,
  testNotToggle,
  testValueEditor,
  testValueSelector,
} from 'react-querybuilder/genericTests';
import 'regenerator-runtime/runtime';
import {
  MaterialActionElement,
  MaterialDragHandle,
  MaterialNotToggle,
  MaterialValueEditor,
  MaterialValueSelector,
  QueryBuilderMaterial,
} from '.';
import type { RQBMaterialComponents } from './types';

declare global {
  // eslint-disable-next-line no-var
  var __RQB_DEV__: boolean;
}
globalThis.__RQB_DEV__ = true;

jest.mock('@mui/material/ListSubheader', () => ({ children }: ListSubheaderProps) => (
  <optgroup label={children as string} />
));
jest.mock('@mui/material/MenuItem', () => ({ value, children }: MenuItemProps) => (
  <option value={value}>{children}</option>
));
jest.mock('@mui/material/FormControl', () => {
  const FormControl = ({ className, disabled, title, children }: FormControlProps) => (
    <div className={className} title={title}>
      {mockIsValidElement(children)
        ? mockCloneElement(children as ReactElement<any>, { disabled })
        : children}
    </div>
  );
  FormControl.useFormControl = () => {};
  return FormControl;
});
jest.mock('@mui/material/Select', () => (props: SelectProps<string | string[]>) => (
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
));

const muiComponents = {
  Button,
  Checkbox,
  DragIndicator,
  FormControl,
  FormControlLabel,
  Input,
  ListSubheader,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Switch,
  TextareaAutosize,
};
const theme = createTheme();
const generateWrapper = (RQBComponent: any) => {
  const Wrapper = (props: ComponentPropsWithoutRef<typeof RQBComponent>) => (
    <ThemeProvider theme={theme}>
      <RQBComponent muiComponents={muiComponents} {...props} />
    </ThemeProvider>
  );
  Wrapper.displayName = RQBComponent.displayName;
  return Wrapper;
};
const WrapperDH = forwardRef<
  HTMLSpanElement,
  DragHandleProps & {
    muiComponents?: Partial<RQBMaterialComponents> | null;
  }
>(({ muiComponents: muiComps, ...props }, ref) => (
  <ThemeProvider theme={theme}>
    <MaterialDragHandle
      ref={ref}
      muiComponents={muiComps === null ? undefined : muiComponents}
      {...props}
    />
  </ThemeProvider>
));
WrapperDH.displayName = MaterialDragHandle.displayName;

describe('action element', () => {
  testActionElement(generateWrapper(MaterialActionElement));

  it('renders without preloaded components', async () => {
    render(
      <div data-testid="test">
        <MaterialActionElement
          handleOnClick={() => {}}
          path={[]}
          level={0}
          ruleOrGroup={{ combinator: 'and', rules: [] }}
        />
      </div>
    );
    expect(screen.getByTestId('test').querySelector('button')).toBeInTheDocument();
  });
});

describe('drag handle', () => {
  testDragHandle(WrapperDH);

  it('renders without preloaded components', async () => {
    render(
      <div data-testid="test">
        <WrapperDH path={[]} level={0} muiComponents={null} />
      </div>
    );
    expect(screen.getByTestId('test').querySelector('span')).toBeInTheDocument();
  });
});

describe('not toggle', () => {
  testNotToggle(generateWrapper(MaterialNotToggle));

  it('renders without preloaded components', async () => {
    render(
      <div data-testid="test">
        <MaterialNotToggle handleOnChange={() => {}} path={[]} level={0} />
      </div>
    );
    expect(screen.getByTestId('test').querySelector('input[type=checkbox]')).toBeInTheDocument();
  });
});

describe('value editor', () => {
  testValueEditor(generateWrapper(MaterialValueEditor));

  it('renders without preloaded components', async () => {
    render(
      <div data-testid="test">
        <MaterialValueEditor
          handleOnChange={() => {}}
          path={[]}
          level={0}
          valueSource="value"
          field="f1"
          operator="="
          fieldData={{ name: 'f1', label: 'Field 1' }}
        />
      </div>
    );
    expect(screen.getByTestId('test').querySelector('input')).toBeInTheDocument();
  });
});

describe('value selector', () => {
  testValueSelector(generateWrapper(MaterialValueSelector));

  it('renders without preloaded components', async () => {
    render(
      <div data-testid="test">
        <MaterialValueSelector
          handleOnChange={() => {}}
          path={[]}
          level={0}
          options={[{ name: 'opt1', label: 'Option 1' }]}
        />
      </div>
    );
    expect(screen.getByTestId('test').querySelector('select')).toBeInTheDocument();
    expect(screen.getByTestId('test').querySelector('option')).toBeInTheDocument();
  });
});

it('renders with composition', async () => {
  await act(async () => {
    render(
      <ThemeProvider theme={theme}>
        <QueryBuilderMaterial>
          <QueryBuilder />
        </QueryBuilderMaterial>
      </ThemeProvider>
    );
    await new Promise(r => setTimeout(r, 500));
  });
  expect(screen.getByTestId(TestID.ruleGroup)).toBeInTheDocument();
  expect(
    Array.from(screen.getByText(defaultTranslations.addRule.label).classList).some(c =>
      c.startsWith('MuiButton')
    )
  ).toBe(true);
});
