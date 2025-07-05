import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DragIndicator from '@mui/icons-material/DragIndicator';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import type {
  ListSubheaderProps,
  MenuItemProps,
  SelectChangeEvent,
  SelectProps,
} from '@mui/material';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import ListSubheader from '@mui/material/ListSubheader';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Select from '@mui/material/Select';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import TextField from '@mui/material/TextField';
import {
  basicSchema,
  defaultShiftActionsProps,
  testActionElement,
  testDragHandle,
  testNotToggle,
  testShiftActions,
  testValueEditor,
  testValueSelector,
} from '@rqb-testing';
import { act, render, screen } from '@testing-library/react';
import type { ComponentPropsWithoutRef } from 'react';
import * as React from 'react';
import { forwardRef } from 'react';
import type { DragHandleProps, RuleGroupType } from 'react-querybuilder';
import {
  QueryBuilder,
  TestID,
  defaultTranslations,
  objectEntries,
  toFullOption,
} from 'react-querybuilder';
import 'regenerator-runtime/runtime';
import { QueryBuilderMaterial } from '.';
import type { MaterialActionProps } from './MaterialActionElement';
import { MaterialActionElement } from './MaterialActionElement';
import { MaterialDragHandle } from './MaterialDragHandle';
import { MaterialNotToggle } from './MaterialNotToggle';
import { MaterialShiftActions } from './MaterialShiftActions';
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
              ? [...e.target.selectedOptions].map(opt => opt.value)
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
  KeyboardArrowDownIcon,
  KeyboardArrowUpIcon,
  ListSubheader,
  LockIcon,
  LockOpenIcon,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Switch,
  TextareaAutosize,
  TextField,
};
const theme = createTheme();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const generateWrapper = (RQBComponent: React.ComponentType<any>) => {
  const MuiWrapper = (props: ComponentPropsWithoutRef<typeof RQBComponent>) => (
    <ThemeProvider theme={theme}>
      <RQBComponent muiComponents={muiComponents} {...props} />
    </ThemeProvider>
  );
  return MuiWrapper;
};
const MuiWrapperDragHandle = forwardRef<
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
          schema={basicSchema}
        />
      </div>
    );
    expect(screen.getByTestId('test').querySelector('button')).toBeInTheDocument();
  });
});

describe('drag handle', () => {
  testDragHandle(MuiWrapperDragHandle);

  it('renders without preloaded components', async () => {
    render(
      <div data-testid="test">
        <MuiWrapperDragHandle
          path={[]}
          level={0}
          muiComponents={null}
          schema={basicSchema}
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
          schema={basicSchema}
          ruleGroup={{} as RuleGroupType}
        />
      </div>
    );
    expect(screen.getByTestId('test').querySelector('input[type=checkbox]')).toBeInTheDocument();
  });
});

describe('shift actions', () => {
  testShiftActions(generateWrapper(MaterialShiftActions));

  // oxlint-disable-next-line expect-expect
  it('renders without preloaded components', async () => {
    render(
      <div data-testid="test">
        <MaterialShiftActions {...defaultShiftActionsProps} />
      </div>
    );
    const btns = screen.getAllByRole('button');
    for (const btn of btns) {
      expect(btn).toBeInTheDocument();
    }
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
          fieldData={toFullOption({ name: 'f1', label: 'Field 1' })}
          schema={basicSchema}
          rule={{ field: '', operator: '', value: '' }}
        />
      </div>
    );
    expect(screen.getByTestId('test').querySelector('input')).toBeInTheDocument();
  });
});

describe('value selector', () => {
  testValueSelector(generateWrapper(MaterialValueSelector), { disabledOptions: true });

  it('renders without preloaded components', async () => {
    render(
      <div data-testid="test">
        <MaterialValueSelector
          handleOnChange={() => {}}
          path={[]}
          level={0}
          options={[{ name: 'opt1', label: 'Option 1' }].map(o => toFullOption(o))}
          schema={basicSchema}
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
      schema: basicSchema,
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
    [...screen.getByText(defaultTranslations.addRule.label).classList].some(c =>
      c.startsWith('MuiButton')
    )
  ).toBe(true);
});
