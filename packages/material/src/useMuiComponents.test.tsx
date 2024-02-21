import type { RenderHookResult } from '@testing-library/react';
import { act, render, renderHook } from '@testing-library/react';
import * as React from 'react';
import { RQBMaterialContext } from './RQBMaterialContext';
import { QueryBuilderMaterial } from './index';
import type { MuiComponentName, RQBMaterialComponents } from './types';
import { useMuiComponents } from './useMuiComponents';

jest.setTimeout(60_000);

interface MuiMockComponent {
  (): React.ReactElement;
  muiName: string;
  $$typeof: symbol;
}

const componentMocks = {
  Button: () => <>Button</>,
  Checkbox: () => <>Checkbox</>,
  CloseIcon: () => <>CloseIcon</>,
  ContentCopyIcon: () => <>ContentCopyIcon</>,
  DragIndicator: () => <>DragIndicator</>,
  FormControl: () => <>FormControl</>,
  FormControlLabel: () => <>FormControlLabel</>,
  Input: () => <>Input</>,
  ListSubheader: () => <>ListSubheader</>,
  LockIcon: () => <>LockIcon</>,
  LockOpenIcon: () => <>LockOpenIcon</>,
  MenuItem: () => <>MenuItem</>,
  Radio: () => <>Radio</>,
  RadioGroup: () => <>RadioGroup</>,
  Select: () => <>Select</>,
  Switch: () => <>Switch</>,
  TextareaAutosize: () => <>TextareaAutosize</>,
  KeyboardArrowDownIcon: () => <>KeyboardArrowDownIcon</>,
  KeyboardArrowUpIcon: () => <>KeyboardArrowUpIcon</>,
} as unknown as Record<MuiComponentName, MuiMockComponent>;

// We don't *actually* need to load the components, just test that
// an attempt to load them can be successful.
Object.entries(componentMocks).forEach(([cn, mockImpl]) => {
  if (cn) jest.mock(`@mui/${cn === 'DragIndicator' ? 'icons-' : ''}material/${cn}`, () => mockImpl);
});

it('returns the MUI components', async () => {
  let hookResult: RenderHookResult<RQBMaterialComponents | null, undefined>;
  await act(async () => {
    hookResult = renderHook(() => useMuiComponents());
  });
  Object.keys(componentMocks).forEach(name =>
    expect(hookResult!.result.current).toHaveProperty(name)
  );
  hookResult!.rerender();
  Object.keys(componentMocks).forEach(name =>
    expect(hookResult!.result.current).toHaveProperty(name)
  );
});

it('renders with preloaded components', async () => {
  let hookResult: RenderHookResult<RQBMaterialComponents | null, undefined>;
  await act(async () => {
    hookResult = renderHook(() => useMuiComponents(componentMocks));
  });
  Object.keys(componentMocks).forEach(name =>
    expect(hookResult!.result.current).toHaveProperty(name)
  );
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
});
