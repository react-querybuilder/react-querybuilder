import type { RenderHookResult } from '@testing-library/react';
import { act, render, renderHook, screen } from '@testing-library/react';
import * as React from 'react';
import { RQBMaterialContext } from './RQBMaterialContext';
import { QueryBuilderMaterial } from './index';
import type { RQBMaterialComponents } from './types';
import { useMuiComponents } from './useMuiComponents';

jest.setTimeout(60_000);

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
for (const [cn, mockImpl] of Object.entries(componentMocks)) {
  if (cn) jest.mock(`@mui/${cn === 'DragIndicator' ? 'icons-' : ''}material/${cn}`, () => mockImpl);
}

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
