import type { RenderHookResult } from '@testing-library/react';
import { act, renderHook } from '@testing-library/react';
import type { MuiComponentName, RQBMaterialComponents } from './types';
import { useMuiComponents } from './useMuiComponents';

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

it('works', async () => {
  let hookResult: RenderHookResult<Partial<RQBMaterialComponents> | null, undefined>;
  await act(async () => {
    hookResult = renderHook(() => useMuiComponents(componentNames));
    await new Promise(r => setTimeout(r, 500));
  });
  componentNames.forEach(name => expect(hookResult!.result.current).toHaveProperty(name));
});
