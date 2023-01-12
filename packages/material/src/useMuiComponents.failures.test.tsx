import { act, render } from '@testing-library/react';
import { QueryBuilderMaterial } from './index';
import { errorMaterialWithoutMUI } from './messages';
import type { MuiComponentName } from './types';

jest.setTimeout(60_000);

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

afterEach(() => {
  jest.resetModules();
  jest.restoreAllMocks();
});

it('renders default components when @mui load fails', async () => {
  const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

  componentNames.forEach(mockCompName => {
    if (mockCompName)
      jest.mock(
        `@mui/${mockCompName === 'DragIndicator' ? 'icons-' : ''}material/${mockCompName}`,
        () => {
          throw new Error(mockCompName);
        }
      );
  });

  await act(async () => {
    render(
      <QueryBuilderMaterial>
        <div>material</div>
      </QueryBuilderMaterial>
    );
  });

  expect(consoleError).toHaveBeenCalledWith(errorMaterialWithoutMUI);
});
