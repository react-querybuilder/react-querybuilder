import {
  Close as CloseIcon,
  ContentCopy as ContentCopyIcon,
  DragIndicator,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
} from '@mui/icons-material';
import type {
  FormControlProps,
  ListSubheaderProps,
  MenuItemProps,
  SelectChangeEvent,
  SelectProps,
} from '@mui/material';
import {
  Button,
  Checkbox,
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
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { act, render, screen } from '@testing-library/react';
import type { ComponentPropsWithoutRef, ReactElement } from 'react';
import * as React from 'react';
import {
  forwardRef,
  cloneElement as mockCloneElement,
  isValidElement as mockIsValidElement,
} from 'react';
import type { DragHandleProps, RuleGroupType, Schema } from 'react-querybuilder';
import { QueryBuilder, TestID, defaultTranslations, objectEntries } from 'react-querybuilder';
import {
  testActionElement,
  testDragHandle,
  testNotToggle,
  testValueEditor,
  testValueSelector,
} from 'react-querybuilder/genericTests';
import 'regenerator-runtime/runtime';
import { QueryBuilderMaterial } from '.';
import type { MaterialActionProps } from './MaterialActionElement';
import { MaterialActionElement } from './MaterialActionElement';
import { MaterialDragHandle } from './MaterialDragHandle';
import { MaterialNotToggle } from './MaterialNotToggle';
import { MaterialValueEditor } from './MaterialValueEditor';
import { MaterialValueSelector } from './MaterialValueSelector';
import { materialTranslations } from './translations';
import type { RQBMaterialComponents } from './types';

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
  CloseIcon,
  ContentCopyIcon,
  DragIndicator,
  FormControl,
  FormControlLabel,
  Input,
  ListSubheader,
  LockIcon,
  LockOpenIcon,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Switch,
  TextareaAutosize,
};
const theme = createTheme();
const generateWrapper = (RQBComponent: React.ComponentType<any>) => {
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
>(({ muiComponents: muiComps, schema, ...props }, ref) => (
  <ThemeProvider theme={theme}>
    <MaterialDragHandle
      ref={ref}
      muiComponents={muiComps === null ? undefined : muiComponents}
      {...props}
      schema={{ ...schema, enableDragAndDrop: true }}
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
          schema={{} as Schema}
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
        <WrapperDH
          path={[]}
          level={0}
          muiComponents={null}
          schema={{} as Schema}
          ruleOrGroup={{} as RuleGroupType}
        />
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
        <MaterialNotToggle
          handleOnChange={() => {}}
          path={[]}
          level={0}
          schema={{} as Schema}
          ruleGroup={{} as RuleGroupType}
        />
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
          schema={{} as Schema}
          rule={{ field: '', operator: '', value: '' }}
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
          schema={{} as Schema}
        />
      </div>
    );
    expect(screen.getByTestId('test').querySelector('select')).toBeInTheDocument();
    expect(screen.getByTestId('test').querySelector('option')).toBeInTheDocument();
  });
});

describe('icon translations', () => {
  for (const [trnsltn, { label: lbl }] of objectEntries(materialTranslations)) {
    const iconTranslationProps: MaterialActionProps = {
      handleOnClick: () => {},
      path: [],
      level: 0,
      ruleOrGroup: { combinator: 'and', rules: [] },
      schema: {} as Schema,
      label: lbl,
    };

    it(`renders ${trnsltn} with preloaded components`, () => {
      const MAE = generateWrapper(MaterialActionElement);
      const { schema: _s, ...itProps } = iconTranslationProps;
      render(
        <div data-testid="test">
          <QueryBuilderMaterial>
            <MAE {...itProps} />
          </QueryBuilderMaterial>
        </div>
      );
      expect(screen.getByTestId('test').querySelector('button')).toBeInTheDocument();
    });

    it(`renders ${trnsltn} without preloaded components`, async () => {
      render(
        <div data-testid="test">
          <MaterialActionElement {...iconTranslationProps} />
        </div>
      );
      expect(screen.getByTestId('test').querySelector('button')).toBeInTheDocument();
    });
  }
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
