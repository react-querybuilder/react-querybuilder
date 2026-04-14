import type { RenderHookResult } from '@testing-library/react';
import { act, render, renderHook, screen } from '@testing-library/react';
import * as React from 'react';
import { QueryBuilderMaterial } from './index';
import { RQBMaterialContext } from './RQBMaterialContext';
import type { RQBMaterialComponents } from './types';
import { useMuiComponents } from './useMuiComponents';

vi.setConfig({ testTimeout: 60_000 });

const componentMocks = {
  Button: () => <>Button</>,
  Checkbox: () => <>Checkbox</>,
  CloseIcon: () => <>CloseIcon</>,
  ContentCopyIcon: () => <>ContentCopyIcon</>,
  DragIndicator: () => <>DragIndicator</>,
  FormControl: () => <>FormControl</>,
  FormControlLabel: () => <>FormControlLabel</>,
  InputLabel: () => <>InputLabel</>,
  KeyboardArrowDownIcon: () => <>KeyboardArrowDownIcon</>,
  KeyboardArrowUpIcon: () => <>KeyboardArrowUpIcon</>,
  ListSubheader: () => <>ListSubheader</>,
  LockIcon: () => <>LockIcon</>,
  LockOpenIcon: () => <>LockOpenIcon</>,
  MenuItem: () => <>MenuItem</>,
  Radio: () => <>Radio</>,
  RadioGroup: () => <>RadioGroup</>,
  Select: () => <>Select</>,
  Switch: () => <>Switch</>,
  TextareaAutosize: () => <>TextareaAutosize</>,
  TextField: () => <>TextField</>,
} as unknown as RQBMaterialComponents;

// We don't *actually* need to load the components, just test that
// an attempt to load them can be successful.
vi.mock('@mui/material/Button', () => ({ default: () => <>Button</> }));
vi.mock('@mui/material/Checkbox', () => ({ default: () => <>Checkbox</> }));
vi.mock('@mui/icons-material/Close', () => ({ default: () => <>CloseIcon</> }));
vi.mock('@mui/icons-material/ContentCopy', () => ({ default: () => <>ContentCopyIcon</> }));
vi.mock('@mui/icons-material/DragIndicator', () => ({ default: () => <>DragIndicator</> }));
vi.mock('@mui/material/FormControl', () => ({ default: () => <>FormControl</> }));
vi.mock('@mui/material/FormControlLabel', () => ({ default: () => <>FormControlLabel</> }));
vi.mock('@mui/material/InputLabel', () => ({ default: () => <>InputLabel</> }));
vi.mock('@mui/icons-material/KeyboardArrowDown', () => ({
  default: () => <>KeyboardArrowDownIcon</>,
}));
vi.mock('@mui/icons-material/KeyboardArrowUp', () => ({ default: () => <>KeyboardArrowUpIcon</> }));
vi.mock('@mui/material/ListSubheader', () => ({ default: () => <>ListSubheader</> }));
vi.mock('@mui/icons-material/Lock', () => ({ default: () => <>LockIcon</> }));
vi.mock('@mui/icons-material/LockOpen', () => ({ default: () => <>LockOpenIcon</> }));
vi.mock('@mui/material/MenuItem', () => ({ default: () => <>MenuItem</> }));
vi.mock('@mui/material/Radio', () => ({ default: () => <>Radio</> }));
vi.mock('@mui/material/RadioGroup', () => ({ default: () => <>RadioGroup</> }));
vi.mock('@mui/material/Select', () => ({ default: () => <>Select</> }));
vi.mock('@mui/material/Switch', () => ({ default: () => <>Switch</> }));
vi.mock('@mui/material/TextareaAutosize', () => ({ default: () => <>TextareaAutosize</> }));
vi.mock('@mui/material/TextField', () => ({ default: () => <>TextField</> }));

it('returns the MUI components', async () => {
  let hookResult: RenderHookResult<RQBMaterialComponents | null, undefined>;
  await act(async () => {
    hookResult = renderHook(() => useMuiComponents());
  });
  for (const name of Object.keys(componentMocks)) {
    expect(hookResult!.result.current).toHaveProperty(name);
  }
  hookResult!.rerender();
  for (const name of Object.keys(componentMocks)) {
    expect(hookResult!.result.current).toHaveProperty(name);
  }
});

it('renders with preloaded components', async () => {
  let hookResult: RenderHookResult<RQBMaterialComponents | null, undefined>;
  await act(async () => {
    hookResult = renderHook(() => useMuiComponents(componentMocks));
  });
  for (const name of Object.keys(componentMocks)) {
    expect(hookResult!.result.current).toHaveProperty(name);
  }
});

it('renders with context components', async () => {
  await act(async () => {
    render(
      <RQBMaterialContext.Provider value={componentMocks}>
        <QueryBuilderMaterial>
          <div>material</div>
        </QueryBuilderMaterial>
      </RQBMaterialContext.Provider>
    );
  });
  expect(screen.getByText('material')).toBeInTheDocument();
});

it('renders with context AND preloaded components', async () => {
  await act(async () => {
    render(
      <RQBMaterialContext.Provider value={componentMocks}>
        <QueryBuilderMaterial muiComponents={componentMocks}>
          <div>material</div>
        </QueryBuilderMaterial>
      </RQBMaterialContext.Provider>
    );
  });
  expect(screen.getByText('material')).toBeInTheDocument();
});
