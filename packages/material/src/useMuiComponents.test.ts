import { act, renderHook } from '@testing-library/react';
import type { RenderHookResult } from '@testing-library/react';
import type { MuiComponentName, RQBMaterialComponents } from './types';
import { useMuiComponents } from './useMuiComponents';

jest.setTimeout(20_000);

const componentNames: MuiComponentName[] = [
  'Button',
  'Checkbox',
  'DragIndicator',
  'FormControl',
  'FormControlLabel',
  'Input',
  'ListSubheader',
  'MenuItem',
  'Radio',
  'RadioGroup',
  'Select',
  'Switch',
  'TextareaAutosize',
];

// We don't *actually* need to load the components, just test that
// an attempt to load them can be successful.
componentNames.forEach(cn => {
  jest.mock(`@mui/${cn === 'DragIndicator' ? 'icons-' : ''}material/${cn}`);
});

it('works', async () => {
  let hookResult: RenderHookResult<Partial<RQBMaterialComponents> | null, undefined>;
  await act(async () => {
    hookResult = renderHook(() => useMuiComponents(componentNames));
  });
  componentNames.forEach(name => expect(hookResult!.result.current).toHaveProperty(name));
});
